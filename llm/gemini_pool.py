"""
SOTA Gemini Flash-Lite Adaptive Key Pool Manager.

Implementa um pool rotacional inteligente com circuit breaker reativo, isolamento
de cotas e telemetria segura (zero plaintext) para a série Google Gemini, com foco
prioritário em 'gemini-3.5-flash-lite' para:
  1. Edições pontuais e atômicas (micro-edits cirúrgicos, blocos SEARCH/REPLACE).
  2. Triagem rápida (fast-path ingress, triagem de tarefas e avaliação de intenção).
  3. Linting e conformidade (AST checks, validação de tipagem, gates pre-commit).

Respeita as limitações e cotas do Google AI Studio / GCP (projeto projects/913870412920 / original-498419).
Todas as credenciais são carregadas do ambiente seguro (HKCU:\\Environment no Windows).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from enum import StrEnum
import hashlib
import logging
import os
import sys
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_COOLDOWN_429 = timedelta(seconds=45)
DEFAULT_COOLDOWN_SERVER_ERROR = timedelta(seconds=15)


def _key_sha8(key: str) -> str:
    """Calcula fingerprint truncado de 8 caracteres do token para telemetria sem vazamento."""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:8]


class GeminiWorkload(StrEnum):
    """Domínios de carga de trabalho designados para Gemini 3.5 Flash-Lite."""

    ATOMIC_EDITS = "atomic_edits"  # edições pontuais, micro-patches cirúrgicos
    TRIAGEM = "triagem"  # classificação rápida, ingress fast-path
    LINTING = "linting"  # auditoria de código, verificação AST e tipagem
    GENERAL = "general"  # consultas leves e sumarização rápida


class KeyStats:
    """Estatísticas de saúde e telemetria de uma chave do pool."""

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
        self.is_revoked: bool = False
        self.workload_counts: dict[str, int] = {
            GeminiWorkload.ATOMIC_EDITS: 0,
            GeminiWorkload.TRIAGEM: 0,
            GeminiWorkload.LINTING: 0,
            GeminiWorkload.GENERAL: 0,
        }
        self.last_used: datetime | None = None

    def is_available(self) -> bool:
        """Verifica se a chave está apta para uso (não revogada e fora de cooldown)."""
        if self.is_revoked:
            return False
        return not (self.blocked_until and datetime.now(UTC) < self.blocked_until)

    def calculate_health_score(self) -> float:
        """Calcula o score de saúde da chave (0 a 100)."""
        if self.is_revoked:
            return 0.0
        if self.blocked_until and datetime.now(UTC) < self.blocked_until:
            return -500.0

        if self.attempts == 0:
            return 85.0  # Chave limpa e pronta para distribuição

        success_rate = (self.successes / self.attempts) * 100.0
        latency_penalty = min(self.avg_latency_ms / 100.0, 25.0)
        failure_penalty = min(self.consecutive_failures * 20.0, 60.0)

        return max(0.0, success_rate - latency_penalty - failure_penalty)


class GeminiPoolManager:
    """
    Gerenciador do Pool Rotacional Inteligente de Chaves da Gemini API.
    Oferece:
      - Rotação Weighted Round-Robin adaptativa.
      - Circuit breaker para HTTP 429 (Rate Limit) e 401/403 (Revogação).
      - Isolamento e priorização por tipo de carga (edições atômicas, triagem, linting).
      - Thread-safety via asyncio.Lock.
    """

    def __init__(self, read_registry: bool = True) -> None:
        self._lock = asyncio.Lock()
        self._keys: list[str] = []
        self._stats: dict[str, KeyStats] = {}
        self._round_robin_idx: int = 0
        self._project_id: str = "projects/913870412920"
        self._project_name: str = "original-498419"
        self.reload_from_environment(read_registry=read_registry)

    def reload_from_environment(self, read_registry: bool = True) -> None:
        """Carrega todas as chaves do ambiente e do Registro do Windows (HKCU/HKLM)."""
        env_map: dict[str, str] = dict(os.environ)

        if read_registry and sys.platform == "win32":
            try:
                import winreg  # noqa: PLC0415

                for hkey, subkey in [
                    (winreg.HKEY_CURRENT_USER, r"Environment"),
                    (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
                ]:
                    try:
                        with winreg.OpenKey(hkey, subkey) as k:
                            idx = 0
                            while True:
                                try:
                                    name, val, _ = winreg.EnumValue(k, idx)
                                    name_upper = str(name).upper()
                                    if name_upper.startswith(("GEMINI_", "GOOGLE_")):
                                        env_map[name_upper] = str(val).strip()
                                    idx += 1
                                except OSError:
                                    break
                    except OSError:
                        pass
            except ImportError:
                pass

        # Atualiza metadados do projeto se presentes
        if "GEMINI_PROJECT_ID" in env_map:
            self._project_id = env_map["GEMINI_PROJECT_ID"]
        if "GEMINI_PROJECT_NAME" in env_map:
            self._project_name = env_map["GEMINI_PROJECT_NAME"]

        # Coleta chaves com nomes ordenados
        collected_keys: list[str] = []
        # 1. Chaves indexadas GEMINI_API_KEY_1..10
        for i in range(1, 21):
            for prefix in ("GEMINI_API_KEY_", "GEMINI_FLASH_KEY_", "GEMINI_KEY_"):
                val = env_map.get(f"{prefix}{i}", "").strip()
                if val and len(val) >= 20 and val not in collected_keys:
                    collected_keys.append(val)

        # 2. Chave global se houver e pool vazio
        global_key = env_map.get("GEMINI_API_KEY", "").strip()
        if global_key and len(global_key) >= 20 and global_key not in collected_keys:
            collected_keys.append(global_key)

        self._keys = collected_keys

        # Inicializa registros de estatística
        for i, key in enumerate(self._keys):
            sha = _key_sha8(key)
            if sha not in self._stats:
                self._stats[sha] = KeyStats(key=key, index=i + 1)

        logger.info(
            "[GEMINI POOL] Pool carregado com %d chaves ativas (Projeto: %s / %s).",
            len(self._keys),
            self._project_id,
            self._project_name,
        )

    def total_keys(self) -> int:
        """Retorna o número total de chaves registradas."""
        return len(self._keys)

    def available_keys_count(self) -> int:
        """Retorna quantas chaves estão aptas a responder no momento."""
        return sum(1 for st in self._stats.values() if st.is_available())

    async def get_key_for_workload(self, workload: GeminiWorkload | str = GeminiWorkload.TRIAGEM) -> tuple[str, str]:
        """
        Seleciona a melhor chave do pool para a carga de trabalho informada.
        Retorna (raw_key, sha8).
        Gera RuntimeError se todas as chaves estiverem em cooldown ou revogadas.
        """
        async with self._lock:
            if not self._keys:
                raise RuntimeError(
                    "[GEMINI POOL] Nenhuma chave Gemini configurada no ambiente. "
                    "Execute pwsh scripts/ops/Set-GeminiKeyPool.ps1 para provisionar."
                )

            # Filtra chaves disponíveis
            available_stats = [st for st in self._stats.values() if st.is_available()]

            if not available_stats:
                # Todas em cooldown: busca a que libera primeiro
                soonest_key = min(
                    (st for st in self._stats.values() if not st.is_revoked and st.blocked_until),
                    key=lambda st: st.blocked_until or datetime.max.replace(tzinfo=UTC),
                    default=None,
                )
                wait_sec = 0.0
                if soonest_key and soonest_key.blocked_until:
                    wait_sec = max(0.0, (soonest_key.blocked_until - datetime.now(UTC)).total_seconds())

                raise RuntimeError(
                    f"[GEMINI POOL] Todas as {len(self._keys)} chaves estao temporariamente em cooldown "
                    f"devido a limites de cota (429). Proxima chave liberada em {wait_sec:.1f}s."
                )

            # Filtra chaves saudáveis (score >= 60.0)
            healthy = [st for st in available_stats if st.calculate_health_score() >= 60.0]
            candidates = healthy if healthy else available_stats

            # Ordena candidatos por índice estável para que o round-robin distribua a carga uniformemente
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

    async def mark_success(self, key: str, latency_ms: float) -> None:
        """Registra sucesso na requisição, refinando a média de latência."""
        sha = _key_sha8(key)
        async with self._lock:
            if sha not in self._stats:
                return
            st = self._stats[sha]
            st.attempts += 1
            st.successes += 1
            st.consecutive_failures = 0
            st.blocked_until = None
            # Média móvel exponencial (70% anterior, 30% recente)
            st.avg_latency_ms = (st.avg_latency_ms * 0.7) + (latency_ms * 0.3)

    async def mark_failure(
        self,
        key: str,
        status_code: int = 500,
        retry_after_s: float = 0.0,
        error_msg: str = "",
    ) -> None:
        """Aciona o circuit breaker com base no status HTTP retornado."""
        sha = _key_sha8(key)
        now = datetime.now(UTC)
        async with self._lock:
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
                st.blocked_until = now + cooldown
                logger.warning(
                    "[GEMINI POOL] Chave sha8=%s atingiu limite de cota (HTTP 429). "
                    "Circuit breaker ativado por %.1fs. Rotacionando para próxima chave.",
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

    def get_telemetry_summary(self) -> list[dict[str, Any]]:
        """Gera sumário detalhado de telemetria sem expor nenhuma chave em claro."""
        now = datetime.now(UTC)
        summary: list[dict[str, Any]] = []
        for sha, st in sorted(self._stats.items(), key=lambda item: item[1].index):
            blocked = False
            remaining_cooldown_s = 0.0
            if st.blocked_until and st.blocked_until > now:
                blocked = True
                remaining_cooldown_s = round((st.blocked_until - now).total_seconds(), 1)

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
                    "health_score": round(st.calculate_health_score(), 1),
                    "atomic_edits": st.workload_counts[GeminiWorkload.ATOMIC_EDITS],
                    "triagem": st.workload_counts[GeminiWorkload.TRIAGEM],
                    "linting": st.workload_counts[GeminiWorkload.LINTING],
                }
            )
        return summary

    def format_markdown_table(self) -> str:
        """Formata o sumário de telemetria em tabela Markdown limpa para relatórios."""
        summary = self.get_telemetry_summary()
        lines = [
            "| Chave | SHA-8 | Score | Sucessos / Tentativas | Latência | Status | Carga (Edits / Triagem / Lint) |",
            "| :---: | :---: | :---: | :---: | :---: | :---: | :---: |",
        ]
        for s in summary:
            status_desc = "✅ Ativa"
            if s["is_revoked"]:
                status_desc = "⛔ Revogada"
            elif s["is_blocked"]:
                status_desc = f"⏳ Cooldown ({s['cooldown_s']}s)"

            carga_desc = f"{s['atomic_edits']} / {s['triagem']} / {s['linting']}"
            lines.append(
                f"| #{s['index']} | `{s['sha8']}` | **{s['health_score']}** | "
                f"{s['successes']}/{s['attempts']} | {s['avg_latency_ms']} ms | "
                f"{status_desc} | {carga_desc} |"
            )
        return "\n".join(lines)


# Singleton canônico para todo o ecossistema
gemini_pool_manager = GeminiPoolManager()
