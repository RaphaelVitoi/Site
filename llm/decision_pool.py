"""Pool dedicado de chaves System-1 "decision" (Gemini Decisions API).

Pool isolado do ``gemini_pool_manager`` (flash-lite): as chaves
``DECISION_API_*`` sao provisionadas no Registro do Windows (HKCU/HKLM
``Environment``) e consumidas exclusivamente pela Gemini Decisions API e
pela cascata System-1 (``llm/gemini_decisions.py``).

Convencoes:
  - variaveis ``DECISION_API_1``, ``DECISION_API_2``, ... ate ``DECISION_API_9``;
  - fallback controlado: se o pool estiver vazio, ``_resolve_api_keys`` cai
    para ``GEMINI_API_KEY``/``GOOGLE_API_KEY`` (mesma familia de credencial
    Google AI Studio, projeto original-498419 / projects/913870412920);
  - telemetria por fingerprint HMAC-SHA256 truncado (sha8) -- nunca loga
    a chave em claro;
  - circuit breaker simples: 401/403 isola a chave, 429 aplica cooldown.

Nota de cota (medida em pesquisa 2026-11-11): rate limits do AI Studio sao
por PROJETO, nao por chave. Chaves do mesmo projeto dividem quota -- a
rotacao aqui serve para resiliencia (revogacao/restricao por key), nao para
multiplicar throughput.
"""

from __future__ import annotations

import logging
import os
import sys
import threading
import time
from typing import Any

logger = logging.getLogger(__name__)

DECISION_POOL_NAME: str = "decision"
_DECISION_PREFIX: str = "DECISION_API_"
_MAX_POOL_KEYS: int = 9
_COOLDOWN_429_S: float = 45.0
_COOLDOWN_5XX_S: float = 15.0
_HMAC_SALT: bytes = b"sota_decision_pool_salt"

_FALLBACK_ENV_KEYS: tuple[str, ...] = (
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "GOOGLE_GENAI_API_KEY",
)


def _sha8(key: str) -> str:
    """Fingerprint truncado para telemetria sem vazar a chave."""
    import hashlib  # noqa: PLC0415  # pylint: disable=import-outside-toplevel
    import hmac  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    return hmac.new(_HMAC_SALT, key.encode("utf-8"), hashlib.sha256).hexdigest()[:8]


def _read_registry_env(env_map: dict[str, str]) -> None:
    """Le HKCU/HKLM Environment (mesmo padrao de llm/gemini_pool)."""
    if sys.platform != "win32":
        return
    try:
        import winreg  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        for hkey, subkey in (
            (winreg.HKEY_CURRENT_USER, r"Environment"),
            (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
        ):
            try:
                with winreg.OpenKey(hkey, subkey) as k:
                    idx = 0
                    while True:
                        try:
                            name, val, _ = winreg.EnumValue(k, idx)
                            env_map.setdefault(name.upper(), str(val).strip())
                            idx += 1
                        except OSError:
                            break
            except OSError:
                continue
    except ImportError:
        pass


def _collect_decision_keys(env_map: dict[str, str]) -> list[str]:
    """Coleta DECISION_API_1..9 do mapa de ambiente, deduplicado e ordenado."""
    keys: list[str] = []
    for i in range(1, _MAX_POOL_KEYS + 1):
        val = (env_map.get(f"{_DECISION_PREFIX}{i}") or "").strip()
        if val and len(val) >= 20 and val not in keys:
            keys.append(val)
    return keys


def _collect_fallback_keys(env_map: dict[str, str]) -> list[str]:
    keys: list[str] = []
    for name in _FALLBACK_ENV_KEYS:
        val = (env_map.get(name) or "").strip()
        if val and len(val) >= 20 and val not in keys:
            keys.append(val)
    return keys


class _KeyState:
    __slots__ = ("key", "index", "blocked_until", "revoked")

    def __init__(self, key: str, index: int) -> None:
        self.key = key
        self.index = index
        self.blocked_until: float = 0.0
        self.revoked: bool = False

    def available(self, now: float) -> bool:
        return not self.revoked and now >= self.blocked_until


class DecisionPoolManager:
    """Pool sincrono round-robin com circuit breaker para a Decisions API."""

    def __init__(self, read_registry: bool = True) -> None:
        self._lock = threading.Lock()
        self._states: list[_KeyState] = []
        self._rr: int = 0
        self._fallbacks: list[_KeyState] = []
        self._project_id = "projects/913870412920"
        self._project_name = "original-498419"
        self.reload(read_registry=read_registry)

    # -- carga -------------------------------------------------------------

    def reload(self, read_registry: bool = True) -> None:
        env_map: dict[str, str] = dict(os.environ)
        if read_registry:
            _read_registry_env(env_map)
        self._project_id = (
            env_map.get("GCP_PROJECT_NUMBER", "").strip()
            or env_map.get("GOOGLE_CLOUD_PROJECT_NUMBER", "").strip()
            or self._project_id
        )
        keys = _collect_decision_keys(env_map)
        with self._lock:
            self._states = [_KeyState(k, i + 1) for i, k in enumerate(keys)]
            self._fallbacks = [_KeyState(k, 0) for k in _collect_fallback_keys(env_map)]
            self._rr = 0
        logger.info(
            "[DECISION POOL] Pool '%s' carregado com %d chave(s) dedicada(s) + %d fallback(s) (projeto %s).",
            DECISION_POOL_NAME,
            len(keys),
            len(self._fallbacks),
            self._project_name,
        )

    @property
    def project_id(self) -> str:
        return self._project_id

    @property
    def project_name(self) -> str:
        return self._project_name

    @property
    def has_credentials(self) -> bool:
        """True quando ha credenciais registradas, mesmo bloqueadas/revogadas.

        Distingue "pool sem configuracao" (``iter_candidate_keys`` vazio por
        ausencia de chaves) de "todas temporariamente indisponiveis" -- caso
        em que recarregar apagaria ``blocked_until``/``revoked``.
        """
        with self._lock:
            return bool(self._states or self._fallbacks)

    def total_dedicated_keys(self) -> int:
        return len(self._states)

    # -- selecao -----------------------------------------------------------

    def next_key(self) -> str:
        """Devolve a proxima chave disponivel (dedicada primeiro, fallback depois)."""
        now = time.monotonic()
        with self._lock:
            avail = [s for s in self._states if s.available(now)]
            if avail:
                chosen = avail[self._rr % len(avail)]
                self._rr += 1
                return chosen.key
            fb_avail = [s for s in self._fallbacks if s.available(now)]
            if fb_avail:
                chosen = fb_avail[self._rr % len(fb_avail)]
                self._rr += 1
                return chosen.key
        raise RuntimeError(
            f"[DECISION POOL] Pool '{DECISION_POOL_NAME}' vazio e sem fallback "
            "GEMINI_API_KEY/GOOGLE_API_KEY configurado."
        )

    def iter_candidate_keys(self) -> list[str]:
        """Lista ordenada de candidatas saudaveis para failover (dedicadas + fallback).

        Chaves revogadas (401/403) ou em cooldown (429/5xx) sao excluidas para
        que ``decide`` nao gaste tentativa em credencial ja marcada como falha.
        """
        now = time.monotonic()
        with self._lock:
            dedicated = [s.key for s in self._states if s.available(now)]
            fallbacks = [s.key for s in self._fallbacks if s.available(now) and s.key not in dedicated]
            return dedicated + fallbacks

    # -- telemetria / circuit breaker ---------------------------------------

    def mark_success(self, key: str) -> None:
        # reservado para simetria futura com gemini_pool_manager
        _ = _sha8(key)

    def mark_failure(self, key: str, status_code: int = 500, retry_after_s: float = 0.0) -> None:
        now = time.monotonic()
        with self._lock:
            for s in self._states + self._fallbacks:
                if s.key == key:
                    if status_code in (401, 403):
                        s.revoked = True
                        logger.error(
                            "[DECISION POOL] Chave sha8=%s revogada/rejeitada (HTTP %d).",
                            _sha8(key),
                            status_code,
                        )
                    elif status_code == 429:
                        s.blocked_until = now + (retry_after_s or _COOLDOWN_429_S)
                        logger.warning(
                            "[DECISION POOL] Chave sha8=%s em 429; cooldown %.0fs.",
                            _sha8(key),
                            s.blocked_until - now,
                        )
                    elif status_code >= 500:
                        s.blocked_until = now + _COOLDOWN_5XX_S
                    # sem return: a mesma credencial pode constar como dedicada
                    # e fallback -- a falha se aplica a todas as ocorrencias.

    def project_of(self, key: str) -> str:
        """Projeto associado a uma chave do pool (``''`` quando a chave nao e do pool).

        Hoje todas as chaves do pool compartilham ``project_id`` (ver docstring
        do modulo); chaves injetadas fora do pool nao tem associacao comprovada.
        """
        with self._lock:
            for s in self._states + self._fallbacks:
                if s.key == key:
                    return self._project_id
        return ""

    def telemetry(self) -> list[dict[str, Any]]:
        now = time.monotonic()
        with self._lock:
            return [
                {
                    "index": s.index,
                    "sha8": _sha8(s.key),
                    "revoked": s.revoked,
                    "blocked_s": round(max(0.0, s.blocked_until - now), 1),
                    "dedicated": True,
                }
                for s in self._states
            ]


# Singleton canonico do pool System-1
decision_pool_manager = DecisionPoolManager()
