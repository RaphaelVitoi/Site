"""
SOTA Gemini Flash-Lite Adaptive Key Pool Manager.

Implementa um pool rotacional inteligente com circuit breaker reativo, isolamento
de cotas e telemetria segura (zero plaintext) para a serie Google Gemini, com foco
prioritario em 'gemini-3.5-flash-lite' para:
  1. Edicoes pontuais e atomicas (micro-edits cirurgicos, blocos SEARCH/REPLACE).
  2. Triagem rapida (fast-path ingress, triagem de tarefas e avaliacao de intencao).
  3. Linting e conformidade (AST checks, validacao de tipagem, gates pre-commit).

Respeita as limitacoes e cotas do Google AI Studio / GCP (projeto projects/913870412920 / original-498419).
Todas as credenciais sao carregadas do ambiente seguro (HKCU:\\Environment no Windows).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from enum import StrEnum
from functools import lru_cache
import hashlib
import logging
import os
import sys
import threading
from typing import Any

from utils.env_loader import is_real_key_value

logger = logging.getLogger(__name__)

DEFAULT_COOLDOWN_429 = timedelta(seconds=45)
DEFAULT_COOLDOWN_SERVER_ERROR = timedelta(seconds=15)


_HMAC_SALT: bytes = b"sota_gemini_pool_salt"


@lru_cache(maxsize=256)
def _key_sha8(key: str) -> str:
    """Calcula fingerprint truncado de 8 caracteres do token via scrypt para telemetria sem vazamento."""
    return hashlib.scrypt(key.encode("utf-8"), salt=_HMAC_SALT, n=1024, r=8, p=1, dklen=16).hex()[:8]


def _is_real_key_value(value: str) -> bool:
    """Valida chave real delegando para llm.budget quando carregado (sem ciclo de import)."""
    budget_mod = sys.modules.get("llm.budget")
    fn = getattr(budget_mod, "_is_real_key_value", None) if budget_mod is not None else None
    if callable(fn):
        return bool(fn(value))
    return is_real_key_value(value)


def _normalize_model_key(model: str | None) -> str:
    """Normaliza o identificador do modelo Gemini para isolamento de cota por modelo."""
    if not model:
        return ""
    return model.strip().lower().removeprefix("models/")


class GeminiWorkload(StrEnum):
    """Dominios de carga de trabalho designados para Gemini 3.5 Flash-Lite."""

    ATOMIC_EDITS = "atomic_edits"  # edicoes pontuais, micro-patches cirurgicos
    TRIAGEM = "triagem"  # classificacao rapida, ingress fast-path
    LINTING = "linting"  # auditoria de codigo, verificacao AST e tipagem
    GENERAL = "general"  # consultas leves e sumarizacao rapida


class KeyStats:
    """Estatisticas de saude e telemetria de uma chave do pool."""

    def __init__(self, key: str, index: int) -> None:
        self.key: str = key
        self.sha8: str = _key_sha8(key)
        self.index: int = index
        self.attempts: int = 0
        self.successes: int = 0
        self.failures: int = 0
        self.consecutive_failures: int = 0
        self.avg_latency_ms: float = 250.0
        self.blocked_until: datetime | None = None
        self.model_blocked_until: dict[str, datetime] = {}
        self.is_revoked: bool = False
        self.workload_counts: dict[str, int] = {
            GeminiWorkload.ATOMIC_EDITS: 0,
            GeminiWorkload.TRIAGEM: 0,
            GeminiWorkload.LINTING: 0,
            GeminiWorkload.GENERAL: 0,
        }
        self.last_used: datetime | None = None

    def is_available(self, model: str | None = None) -> bool:
        """Verifica se a chave esta apta para uso (nao revogada e fora de cooldown global ou por modelo)."""
        if self.is_revoked:
            return False
        now = datetime.now(UTC)
        if self.blocked_until:
            if now < self.blocked_until:
                return False
            self.blocked_until = None
        norm_model = _normalize_model_key(model)
        if norm_model:
            model_expiry = self.model_blocked_until.get(norm_model)
            if model_expiry:
                if now < model_expiry:
                    return False
                self.model_blocked_until.pop(norm_model, None)
        return True

    def calculate_health_score(self, model: str | None = None) -> float:
        """Calcula o score de saude da chave (0 a 100)."""
        if self.is_revoked:
            return 0.0
        if not self.is_available(model=model):
            return -500.0

        if self.attempts == 0:
            return 85.0  # Chave limpa e pronta para distribuicao

        success_rate = (self.successes / self.attempts) * 100.0
        latency_penalty = min(self.avg_latency_ms / 100.0, 25.0)
        failure_penalty = min(self.consecutive_failures * 20.0, 60.0)

        return max(0.0, success_rate - latency_penalty - failure_penalty)


def _read_windows_registry_env(env_map: dict[str, str]) -> None:
    """Carrega variaveis GEMINI_ e GOOGLE_ do Registro do Windows."""
    if sys.platform != "win32":
        return
    try:
        import winreg  # noqa: PLC0415

        for hkey, subkey in (
            (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
            (winreg.HKEY_CURRENT_USER, r"Environment"),
        ):
            try:
                with winreg.OpenKey(hkey, subkey) as k:
                    idx = 0
                    while True:
                        try:
                            name, val, _ = winreg.EnumValue(k, idx)
                            name_upper = name.upper()
                            if name_upper.startswith(("GEMINI_", "GOOGLE_")):
                                env_map[name_upper] = str(val).strip()
                            idx += 1
                        except OSError:
                            break
            except OSError:
                pass
    except ImportError:
        pass


_AUXILIARY_GEMINI_KEY_VARS = (
    "GEMINI_IMAGE_KEY",
    "GEMINI_TRANSLATE_KEY",
    "GEMINI_TTS_KEY",
    "GEMINI_VIDEO_KEY",
)


def _append_valid_key(collected: list[str], raw_value: str) -> None:
    val = raw_value.strip()
    if len(val) >= 20 and _is_real_key_value(val) and val not in collected:
        collected.append(val)


def _collect_gemini_keys_from_map(env_map: dict[str, str], include_auxiliary: bool = False) -> list[str]:
    """Coleta chaves com nomes ordenados (GEMINI_API_KEY_1..20, etc)."""
    collected: list[str] = []
    for i in range(1, 21):
        for prefix in ("GEMINI_API_KEY_", "GEMINI_FLASH_KEY_", "GEMINI_KEY_"):
            _append_valid_key(collected, env_map.get(f"{prefix}{i}", ""))

    _append_valid_key(collected, env_map.get("GEMINI_API_KEY", ""))

    if include_auxiliary:
        for var_name in _AUXILIARY_GEMINI_KEY_VARS:
            _append_valid_key(collected, env_map.get(var_name, ""))
    return collected


class GeminiPoolManager:
    """
    Gerenciador do Pool Rotacional Inteligente de Chaves da Gemini API.
    Oferece:
      - Rotacao Weighted Round-Robin adaptativa.
      - Circuit breaker para HTTP 429 (Rate Limit) e 401/403 (Revogacao).
      - Isolamento e priorizacao por tipo de carga (edicoes atomicas, triagem, linting).
      - Thread-safety via threading.Lock (as secoes criticas nao tem await;
        threading.Lock e agnostico de event loop -- asyncio.Lock quebraria
        sob loops concorrentes, ex.: fallback System-2 em thread dedicada).
    """

    def __init__(self, read_registry: bool = True) -> None:
        self._lock = threading.RLock()
        self._keys: list[str] = []
        self._stats: dict[str, KeyStats] = {}
        self._round_robin_idx: int = 0
        self._project_id: str = "projects/913870412920"
        self._project_name: str = "original-498419"
        self.reload_from_environment(read_registry=read_registry)

    def reload_from_environment(self, read_registry: bool = True) -> None:
        """Carrega todas as chaves do ambiente e do Registro do Windows (HKCU/HKLM)."""
        env_map: dict[str, str] = dict(os.environ)

        if read_registry:
            _read_windows_registry_env(env_map)

        with self._lock:
            # Atualiza metadados do projeto se presentes
            if "GEMINI_PROJECT_ID" in env_map:
                self._project_id = env_map["GEMINI_PROJECT_ID"]
            if "GEMINI_PROJECT_NAME" in env_map:
                self._project_name = env_map["GEMINI_PROJECT_NAME"]

            self._keys = _collect_gemini_keys_from_map(env_map, include_auxiliary=read_registry)

            # Inicializa registros de estatistica
            for i, key in enumerate(self._keys):
                sha = _key_sha8(key)
                if sha not in self._stats:
                    self._stats[sha] = KeyStats(key=key, index=i + 1)

            total = len(self._keys)
            proj_id = self._project_id
            proj_name = self._project_name

        logger.info(
            "[GEMINI POOL] Pool carregado com %d chaves ativas (Projeto: %s / %s).",
            total,
            proj_id,
            proj_name,
        )

    def ensure_keys(self, keys: list[str]) -> None:
        """Registra chaves adicionais do ambiente no pool caso ainda nao estejam indexadas."""
        with self._lock:
            for key in keys:
                val = (key or "").strip()
                if len(val) < 12 or not _is_real_key_value(val):
                    continue
                sha = _key_sha8(val)
                if val not in self._keys:
                    self._keys.append(val)
                if sha not in self._stats:
                    self._stats[sha] = KeyStats(key=val, index=len(self._stats) + 1)

    def total_keys(self) -> int:
        """Retorna o numero total de chaves registradas."""
        with self._lock:
            return len(self._keys)

    def available_keys_count(self, model: str | None = None) -> int:
        """Retorna quantas chaves estao aptas a responder no momento (opcionalmente para um modelo)."""
        with self._lock:
            return sum(1 for st in self._stats.values() if st.is_available(model=model))

    def get_key_for_workload(
        self, workload: GeminiWorkload | str = GeminiWorkload.TRIAGEM, model: str | None = None
    ) -> tuple[str, str]:
        """
        Seleciona a melhor chave do pool para a carga de trabalho informada.
        Retorna (raw_key, sha8).
        Gera RuntimeError se todas as chaves estiverem em cooldown ou revogadas.
        """
        norm_model = _normalize_model_key(model)
        with self._lock:
            if not self._keys:
                raise RuntimeError(
                    "[GEMINI POOL] Nenhuma chave Gemini configurada no ambiente. "
                    "Execute pwsh scripts/ops/Set-GeminiKeyPool.ps1 para provisionar."
                )

            # Filtra chaves disponiveis (isoladas por modelo quando model != None)
            available_stats = [st for st in self._stats.values() if st.is_available(model=model)]

            if not available_stats:
                # Todas em cooldown: busca a que libera primeiro
                soonest_expiries: list[datetime] = []
                for st in self._stats.values():
                    if st.is_revoked:
                        continue
                    expiries = [dt for dt in (st.blocked_until, st.model_blocked_until.get(norm_model)) if dt]
                    if expiries:
                        soonest_expiries.append(max(expiries))

                wait_sec = 0.0
                if soonest_expiries:
                    soonest_dt = min(soonest_expiries)
                    wait_sec = max(0.0, (soonest_dt - datetime.now(UTC)).total_seconds())

                raise RuntimeError(
                    f"[GEMINI POOL] Todas as {len(self._keys)} chaves estao temporariamente em cooldown "
                    f"devido a limites de cota (429). Proxima chave liberada em {wait_sec:.1f}s."
                )

            # Filtra chaves saudaveis (score >= 60.0)
            healthy = [st for st in available_stats if st.calculate_health_score(model=model) >= 60.0]
            candidates = healthy if healthy else available_stats

            # Ordena candidatos por indice estavel para que o round-robin distribua a carga uniformemente
            candidates.sort(key=lambda st: st.index)

            n_cand = len(candidates)
            chosen = candidates[self._round_robin_idx % n_cand]
            self._round_robin_idx = (self._round_robin_idx + 1) % 1000000

            chosen.last_used = datetime.now(UTC)
            workload_key = str(workload)
            if workload_key in chosen.workload_counts:
                chosen.workload_counts[workload_key] += 1
            else:
                chosen.workload_counts[GeminiWorkload.GENERAL] += 1

            return chosen.key, chosen.sha8

    def mark_success(self, key: str, latency_ms: float, model: str | None = None) -> None:
        """Registra sucesso na requisicao, refinando a media de latencia."""
        sha = _key_sha8(key)
        norm_model = _normalize_model_key(model)
        with self._lock:
            if sha not in self._stats:
                return
            st = self._stats[sha]
            st.attempts += 1
            st.successes += 1
            st.consecutive_failures = 0
            st.blocked_until = None
            if norm_model:
                st.model_blocked_until.pop(norm_model, None)
            # Media movel exponencial (70% anterior, 30% recente)
            st.avg_latency_ms = (st.avg_latency_ms * 0.7) + (latency_ms * 0.3)

    def mark_failure(
        self,
        key: str,
        status_code: int = 500,
        retry_after_s: float = 0.0,
        error_msg: str = "",
        model: str | None = None,
    ) -> None:
        """Aciona o circuit breaker com base no status HTTP retornado (escopo por modelo para 429)."""
        sha = _key_sha8(key)
        norm_model = _normalize_model_key(model)
        now = datetime.now(UTC)
        with self._lock:
            if sha not in self._stats:
                return
            st = self._stats[sha]
            st.attempts += 1
            st.failures += 1
            st.consecutive_failures += 1
            if error_msg:
                logger.debug("[GEMINI POOL] Detalhe de erro na chave sha8=%s: %s", sha, error_msg)

            if status_code in (401, 403):
                st.is_revoked = True
                logger.error(
                    "[GEMINI POOL] Chave sha8=%s foi REVOGADA/REJEITADA (HTTP %d). Isolada definitivamente do pool.",
                    sha,
                    status_code,
                )
            elif status_code == 429:
                cooldown = timedelta(seconds=retry_after_s) if retry_after_s > 0 else DEFAULT_COOLDOWN_429
                if norm_model:
                    st.model_blocked_until[norm_model] = now + cooldown
                    logger.warning(
                        "[GEMINI POOL] Chave sha8=%s atingiu limite de cota (HTTP 429) para %s. "
                        "Circuit breaker por modelo ativado por %.1fs. Rotacionando para pr\u00f3xima chave.",
                        sha,
                        norm_model,
                        cooldown.total_seconds(),
                    )
                else:
                    st.blocked_until = now + cooldown
                    logger.warning(
                        "[GEMINI POOL] Chave sha8=%s atingiu limite de cota (HTTP 429). "
                        "Circuit breaker ativado por %.1fs. Rotacionando para pr\u00f3xima chave.",
                        sha,
                        cooldown.total_seconds(),
                    )
            elif status_code >= 500:
                st.blocked_until = now + DEFAULT_COOLDOWN_SERVER_ERROR
                logger.info(
                    "[GEMINI POOL] Falha de servidor HTTP %d na chave sha8=%s. Cooldown curto de 15s.",
                    status_code,
                    sha,
                )

    def get_telemetry_summary(self, model: str | None = None) -> list[dict[str, Any]]:
        """Gera sumario detalhado de telemetria sem expor nenhuma chave em claro."""
        now = datetime.now(UTC)
        norm_model = _normalize_model_key(model)
        summary: list[dict[str, Any]] = []
        with self._lock:
            stats_snapshot = sorted(self._stats.items(), key=lambda item: item[1].index)
            for sha, st in stats_snapshot:
                blocked = False
                remaining_cooldown_s = 0.0
                active_expiries: list[datetime] = []
                if st.blocked_until and st.blocked_until > now:
                    active_expiries.append(st.blocked_until)
                if norm_model:
                    model_exp = st.model_blocked_until.get(norm_model)
                    if model_exp and model_exp > now:
                        active_expiries.append(model_exp)
                elif st.model_blocked_until:
                    active_expiries.extend(exp for exp in st.model_blocked_until.values() if exp > now)

                if active_expiries:
                    blocked = True
                    remaining_cooldown_s = round((max(active_expiries) - now).total_seconds(), 1)

                summary.append(
                    {
                        "index": st.index,
                        "sha8": sha,
                        "attempts": st.attempts,
                        "successes": st.successes,
                        "failures": st.failures,
                        "avg_latency_ms": round(st.avg_latency_ms, 1),
                        "is_blocked": blocked,
                        "cooldown_s": remaining_cooldown_s,
                        "is_revoked": st.is_revoked,
                        "health_score": round(st.calculate_health_score(model=model), 1),
                        "atomic_edits": st.workload_counts[GeminiWorkload.ATOMIC_EDITS],
                        "triagem": st.workload_counts[GeminiWorkload.TRIAGEM],
                        "linting": st.workload_counts[GeminiWorkload.LINTING],
                    }
                )
        return summary

    def format_markdown_table(self) -> str:
        """Formata o sumario de telemetria em tabela Markdown limpa para relatorios."""
        summary = self.get_telemetry_summary()
        lines = [
            "| Chave | SHA-8 | Score | Sucessos / Tentativas | Lat\u00eancia | Status | Carga (Edits / Triagem / Lint) |",
            "| :---: | :---: | :---: | :---: | :---: | :---: | :---: |",
        ]
        for s in summary:
            status_desc = "\u2705 Ativa"
            if s["is_revoked"]:
                status_desc = "\u26d4 Revogada"
            elif s["is_blocked"]:
                status_desc = f"\u23f3 Cooldown ({s['cooldown_s']}s)"

            carga_desc = f"{s['atomic_edits']} / {s['triagem']} / {s['linting']}"
            lines.append(
                f"| #{s['index']} | `{s['sha8']}` | **{s['health_score']}** | "
                f"{s['successes']}/{s['attempts']} | {s['avg_latency_ms']} ms | "
                f"{status_desc} | {carga_desc} |"
            )
        return "\n".join(lines)


# Singleton canonico para todo o ecossistema
gemini_pool_manager = GeminiPoolManager()
