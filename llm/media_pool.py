"""Pool multimodal de chaves Gemini (AI Studio + OpenRouter).

Pool dedicado e isolado dos pools de texto (``gemini_pool_manager``,
``decision_pool_manager``, ``openrouter_pool``): as chaves de midia sao
provisionadas no Registro do Windows (HKCU/HKLM ``Environment``) por
modalidade e consumidas por geradores de TTS, video, imagem e traducao.

Modalidades canonicas (``MEDIA_MODALITIES``):
  - ``tts``       -> variaveis ``GEMINI_TTS_KEY`` / ``OPENROUTER_GEMINI_TTS_KEY``
  - ``video``     -> ``GEMINI_VIDEO_KEY`` / ``OPENROUTER_GEMINI_VIDEO_KEY``
  - ``image``     -> ``GEMINI_IMAGE_KEY`` / ``OPENROUTER_GEMINI_IMAGE_KEY``
  - ``translate`` -> ``GEMINI_TRANSLATE_KEY`` / ``OPENROUTER_GEMINI_TRANSLATE_KEY``

Providers:
  - ``aistudio``  -> Google AI Studio direto (chaves ``AQ.*``, endpoint
    generativelanguage.googleapis.com);
  - ``openrouter``-> OpenRouter (chaves ``sk-or-v1-*``, endpoint
    openrouter.ai) -- mesma credencial roteia para os modelos Gemini de midia.

Convencoes:
  - sufixos numerados ``_1``..``_5`` aceitos para crescimento futuro do pool
    (ex.: ``GEMINI_TTS_KEY_1``); a forma sem sufixo e a forma canonica atual;
  - fallback controlado por provider: pool vazio cai para ``GEMINI_API_KEY``/
    ``GOOGLE_API_KEY`` (aistudio) ou ``OPENROUTER_API_KEY`` (openrouter);
  - ordem de tentativa default: ``aistudio`` primeiro (endpoint direto,
    menor latencia de autenticacao), ``openrouter`` depois -- configuravel
    por ``MEDIA_POOL_PROVIDER`` (``aistudio`` | ``openrouter`` | ``auto``);
  - telemetria por fingerprint HMAC-SHA256 truncado (sha8) -- nunca loga
    a chave em claro;
  - circuit breaker por (modalidade, provider): 401/403 isola a chave,
    429 aplica cooldown, 5xx cooldown curto.
"""

from __future__ import annotations

from dataclasses import dataclass
import logging
import os
import sys
import threading
import time
from typing import Any

logger = logging.getLogger(__name__)

MEDIA_MODALITIES: tuple[str, ...] = ("tts", "video", "image", "translate")
MEDIA_PROVIDERS: tuple[str, ...] = ("aistudio", "openrouter")
_MAX_POOL_KEYS_PER_NAME: int = 5
_COOLDOWN_429_S: float = 45.0
_COOLDOWN_5XX_S: float = 15.0
_HMAC_SALT: bytes = b"sota_media_pool_salt"
_MIN_KEY_LEN: int = 20

_PROVIDER_BASE_NAMES: dict[str, str] = {
    "aistudio": "GEMINI_{MOD}_KEY",
    "openrouter": "OPENROUTER_GEMINI_{MOD}_KEY",
}
_PROVIDER_FALLBACKS: dict[str, tuple[str, ...]] = {
    "aistudio": ("GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENAI_API_KEY"),
    "openrouter": ("OPENROUTER_API_KEY",),
}


def _sha8(key: str) -> str:
    """Fingerprint truncado para telemetria sem vazar a chave."""
    import hashlib  # noqa: PLC0415  # pylint: disable=import-outside-toplevel
    import hmac  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    return hmac.new(_HMAC_SALT, key.encode("utf-8"), hashlib.sha256).hexdigest()[:8]


def _validate_modality(modality: str) -> str:
    mod = modality.strip().lower()
    if mod not in MEDIA_MODALITIES:
        raise ValueError(f"Modalidade '{modality}' invalida. Opcoes: {', '.join(MEDIA_MODALITIES)}.")
    return mod


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


def _collect_named_keys(env_map: dict[str, str], base_name: str) -> list[str]:
    """Coleta base_name + base_name_1..5, deduplicado e ordenado."""
    keys: list[str] = []
    names = [base_name] + [f"{base_name}_{i}" for i in range(1, _MAX_POOL_KEYS_PER_NAME + 1)]
    for name in names:
        val = (env_map.get(name) or "").strip()
        if val and len(val) >= _MIN_KEY_LEN and val not in keys:
            keys.append(val)
    return keys


def _collect_modality_keys(env_map: dict[str, str], modality: str) -> dict[str, list[str]]:
    """Retorna {provider: [keys]} para a modalidade, dedicadas + fallback."""
    mod = modality.upper()
    result: dict[str, list[str]] = {p: [] for p in MEDIA_PROVIDERS}
    for provider, template in _PROVIDER_BASE_NAMES.items():
        base = template.format(MOD=mod)
        dedicated = _collect_named_keys(env_map, base)
        fallbacks: list[str] = []
        # fallback generico so entra se nao houver dedicada do mesmo provider
        if not dedicated:
            for fb_name in _PROVIDER_FALLBACKS[provider]:
                fallbacks.extend(_collect_named_keys(env_map, fb_name))
        seen: list[str] = []
        for k in dedicated + fallbacks:
            if k not in seen:
                seen.append(k)
        result[provider] = seen
    return result


@dataclass(frozen=True)
class MediaKeySelection:
    """Resultado de selecao: chave + provider + fingerprint (sem segredo)."""

    key: str
    provider: str
    modality: str
    sha8: str


class _KeyState:
    __slots__ = ("key", "provider", "index", "blocked_until", "revoked")

    def __init__(self, key: str, provider: str, index: int) -> None:
        self.key = key
        self.provider = provider
        self.index = index
        self.blocked_until: float = 0.0
        self.revoked: bool = False

    def available(self, now: float) -> bool:
        return not self.revoked and now >= self.blocked_until


class MediaPoolManager:
    """Pool multimodal com circuit breaker, isolado por modalidade/provider."""

    def __init__(self, read_registry: bool = True) -> None:
        self._lock = threading.Lock()
        self._states: dict[str, list[_KeyState]] = {}
        self._rr: dict[str, int] = {}
        self._preferred_provider = "auto"
        self.reload(read_registry=read_registry)

    # -- carga -------------------------------------------------------------

    def reload(self, read_registry: bool = True) -> None:
        env_map: dict[str, str] = dict(os.environ)
        if read_registry:
            _read_registry_env(env_map)
        pref = (env_map.get("MEDIA_POOL_PROVIDER") or "auto").strip().lower()
        if pref in MEDIA_PROVIDERS or pref == "auto":
            self._preferred_provider = pref

        with self._lock:
            self._states = {}
            self._rr = {}
            for mod in MEDIA_MODALITIES:
                per_provider = _collect_modality_keys(env_map, mod)
                states: list[_KeyState] = []
                idx = 0
                for provider in self._provider_order():
                    for key in per_provider.get(provider, []):
                        idx += 1
                        states.append(_KeyState(key, provider, idx))
                self._states[mod] = states
                self._rr[mod] = 0
        counts = {m: len(s) for m, s in self._states.items()}
        logger.info("[MEDIA POOL] Pools carregados: %s (provider preferido: %s).", counts, self._preferred_provider)

    def _provider_order(self) -> tuple[str, ...]:
        if self._preferred_provider == "auto":
            return MEDIA_PROVIDERS
        return (self._preferred_provider, *(p for p in MEDIA_PROVIDERS if p != self._preferred_provider))

    # -- selecao -----------------------------------------------------------

    def _states_for(self, modality: str) -> list[_KeyState]:
        return self._states.get(modality, [])

    def next_key(self, modality: str) -> MediaKeySelection:
        """Devolve a proxima chave disponivel para a modalidade (round-robin)."""
        mod = _validate_modality(modality)
        now = time.monotonic()
        with self._lock:
            states = self._states_for(mod)
            avail = [s for s in states if s.available(now)]
            if not avail:
                soonest = min(
                    (s for s in states if not s.revoked and s.blocked_until),
                    key=lambda s: s.blocked_until,
                    default=None,
                )
                wait = max(0.0, soonest.blocked_until - now) if soonest else 0.0
                raise RuntimeError(
                    f"[MEDIA POOL] Pool '{mod}' vazio ou todas as {len(states)} "
                    f"chaves em cooldown (proxima em {wait:.1f}s)."
                )
            chosen = avail[self._rr[mod] % len(avail)]
            self._rr[mod] += 1
            return MediaKeySelection(key=chosen.key, provider=chosen.provider, modality=mod, sha8=_sha8(chosen.key))

    def iter_candidates(self, modality: str) -> list[MediaKeySelection]:
        """Lista ordenada de candidatas para failover manual."""
        mod = _validate_modality(modality)
        with self._lock:
            return [
                MediaKeySelection(key=s.key, provider=s.provider, modality=mod, sha8=_sha8(s.key))
                for s in self._states_for(mod)
            ]

    # -- telemetria / circuit breaker ---------------------------------------

    def mark_success(self, modality: str, key: str) -> None:
        _validate_modality(modality)
        _ = _sha8(key)

    def mark_failure(
        self,
        modality: str,
        key: str,
        status_code: int = 500,
        retry_after_s: float = 0.0,
    ) -> None:
        mod = _validate_modality(modality)
        now = time.monotonic()
        with self._lock:
            for s in self._states_for(mod):
                if s.key == key:
                    if status_code in (401, 403):
                        s.revoked = True
                        logger.error(
                            "[MEDIA POOL] Chave sha8=%s (%s/%s) revogada (HTTP %d).",
                            _sha8(key),
                            mod,
                            s.provider,
                            status_code,
                        )
                    elif status_code == 429:
                        s.blocked_until = now + (retry_after_s or _COOLDOWN_429_S)
                        logger.warning(
                            "[MEDIA POOL] Chave sha8=%s (%s/%s) em 429; cooldown %.0fs.",
                            _sha8(key),
                            mod,
                            s.provider,
                            s.blocked_until - now,
                        )
                    elif status_code >= 500:
                        s.blocked_until = now + _COOLDOWN_5XX_S
                    return

    def telemetry(self, modality: str | None = None) -> dict[str, list[dict[str, Any]]]:
        """Sumario sem segredos. Sem argumento, todas as modalidades."""
        mods = (modality,) if modality else MEDIA_MODALITIES
        now = time.monotonic()
        out: dict[str, list[dict[str, Any]]] = {}
        with self._lock:
            for mod in mods:
                m = _validate_modality(mod)
                out[m] = [
                    {
                        "index": s.index,
                        "sha8": _sha8(s.key),
                        "provider": s.provider,
                        "revoked": s.revoked,
                        "blocked_s": round(max(0.0, s.blocked_until - now), 1),
                    }
                    for s in self._states_for(m)
                ]
        return out

    def total_keys(self, modality: str) -> int:
        return len(self._states_for(_validate_modality(modality)))


# Singleton canonico do pool multimodal
media_pool_manager = MediaPoolManager()
