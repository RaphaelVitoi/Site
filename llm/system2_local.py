"""System-2 local: roteador de modelos open-source via Ollama + fallback cloud.

Camada generativa que complementa a cascata System-1
(``llm/gemini_decisions.decide_s1``): quando a decisao exige geracao de
texto/JSON estruturado, este modulo escolhe o melhor motor disponivel:

  1. **Local-first**: Ollama (``data/ollama_models.json`` e a fonte unica de
     aliases) com tiers calibrados para o hardware medido
     (i9-9900K / 32GB RAM / RX 570 8GB VRAM -- Polaris/gfx803, sem ROCm;
     offload GPU real exige llama.cpp+Vulkan, ver docs).
  2. **Fallback cloud**: ``gemini-3.5-flash-lite`` via ``llm/gemini.py``
     (pool ``gemini_pool_manager``) quando o Ollama esta offline, o modelo
     nao cabe na RAM ou a chamada local falha.

Tiers System-2 (defaults, sobrescreviveis por env ``CHICO_S2_*_MODEL``):
  - ``fast``     -> ``qwen3.5:4b``      (~3.3GB, resposta imediata)
  - ``balanced`` -> ``qwen2.5-coder:7b-instruct-q5_K_M`` (~5.4GB)
  - ``deep``     -> ``qwen3.8:27b``     (~17GB, reasoning pesado offline)
  - ``code``     -> ``qwen-code-surgical:latest`` (finetune do projeto)
  - ``moe``      -> ``qwen3.6-35b-a3b-mtp`` via llama-swap :8080 ->
                    llama-server Vulkan sob demanda (medido 2026-11-12:
                    ~13 t/s geracao com draft-mtp; endpoint direto :9931
                    via ``CHICO_LLAMA_API_BASE``; fallback Ollama ``deep``
                    -> Flash-Lite)

Invariantes:
  - zero dependencias novas (urllib + psutil + json stdlib);
  - proveniencia explicita em ``meta``: engine local|cloud, fallback_used;
  - nunca loga conteudo de prompt nem chaves.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
import time
from typing import Any
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OLLAMA_MANIFEST = PROJECT_ROOT / "data" / "ollama_models.json"
DEFAULT_OLLAMA_BASE = "http://127.0.0.1:11434"
DEFAULT_LLAMA_BASE = "http://127.0.0.1:8080"  # llama-swap proxy (gerencia spawn/unload do llama-server)
OLLAMA_TIMEOUT_S = float(os.environ.get("CHICO_S2_TIMEOUT_S", "120"))

SYSTEM2_TIERS: dict[str, str] = {
    "fast": "qwen3_5_4b",
    "balanced": "qwen_coder_7b_q5",
    "deep": "qwen3_8_27b",
    "code": "qwen_code_surgical",
    "moe": "qwen3.6-35b-a3b-mtp",
}

_TIER_ENV: dict[str, str] = {
    "fast": "CHICO_S2_FAST_MODEL",
    "balanced": "CHICO_S2_BALANCED_MODEL",
    "deep": "CHICO_S2_DEEP_MODEL",
    "code": "CHICO_S2_CODE_MODEL",
    "moe": "CHICO_S2_MOE_MODEL",
}


def _load_manifest_aliases() -> dict[str, str]:
    try:
        with OLLAMA_MANIFEST.open(encoding="utf-8") as fh:
            data = json.load(fh)
        return {m["alias"]: m["tag"] for m in data.get("models", []) if m.get("alias") and m.get("tag")}
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return {}


_MANIFEST_ALIASES: dict[str, str] = _load_manifest_aliases()


def resolve_model(alias_or_tag: str) -> str:
    """Resolve alias do manifesto para a tag Ollama concreta."""
    cleaned = (alias_or_tag or "").strip()
    if not cleaned:
        return ""
    if cleaned in _MANIFEST_ALIASES:
        return _MANIFEST_ALIASES[cleaned]
    normalized = cleaned.replace("_", "-").lower()
    for alias, tag in _MANIFEST_ALIASES.items():
        if alias.replace("_", "-").lower() == normalized:
            return tag
    return cleaned  # assume que ja e uma tag valida


def tier_model(tier: str = "fast") -> str:
    """Devolve a tag Ollama do tier (env override > manifesto > literal)."""
    tier_key = (tier or "fast").strip().lower()
    env_override = os.environ.get(_TIER_ENV.get(tier_key, ""), "").strip()
    if env_override:
        return resolve_model(env_override)
    alias = SYSTEM2_TIERS.get(tier_key, SYSTEM2_TIERS["fast"])
    return resolve_model(alias)


_HW_CACHE: dict[str, Any] | None = None


def hardware_snapshot() -> dict[str, Any]:
    """Snapshot de hardware relevante ao roteamento local (cache por processo)."""
    global _HW_CACHE  # noqa: PLW0603
    if _HW_CACHE is not None:
        return _HW_CACHE
    snap: dict[str, Any] = {
        "cpu_threads": os.cpu_count() or 0,
        "ram_gb": 0.0,
        "vram_gb": 0.0,
        "gpu_name": "",
    }
    try:
        import psutil  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        snap["ram_gb"] = round(psutil.virtual_memory().total / (1024**3), 1)
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[system2] psutil indisponivel: %s", e)
    if os.name == "nt":  # VRAM real via registro (WMI AdapterRAM satura em 4GB)
        try:
            import winreg  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

            base = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}"
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, base) as cls:
                idx = 0
                while True:
                    try:
                        sub = winreg.EnumKey(cls, idx)
                        idx += 1
                        try:
                            with winreg.OpenKey(cls, sub) as dev:
                                try:
                                    mem, _ = winreg.QueryValueEx(dev, "HardwareInformation.qwMemorySize")
                                    if not mem:
                                        continue
                                    gb = float(mem) / (1024**3)
                                    if gb > snap["vram_gb"]:
                                        snap["vram_gb"] = round(gb, 1)
                                        try:
                                            snap["gpu_name"], _ = winreg.QueryValueEx(dev, "DriverDesc")
                                        except OSError:
                                            snap["gpu_name"] = snap["gpu_name"] or ""
                                except (OSError, TypeError, ValueError):
                                    continue
                        except OSError:
                            continue
                    except OSError:
                        break
        except Exception as e:  # pylint: disable=broad-except
            logger.debug("[system2] leitura VRAM falhou: %s", e)
    _HW_CACHE = snap
    return snap


def _ollama_base() -> str:
    return (os.environ.get("OLLAMA_API_BASE") or DEFAULT_OLLAMA_BASE).rstrip("/")


def ollama_online(timeout_s: float = 3.0) -> bool:
    """Health-check rapido do daemon Ollama."""
    try:
        req = urllib.request.Request(f"{_ollama_base()}/api/tags")  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
            return resp.status == 200
    except (OSError, urllib.error.URLError, TimeoutError):
        return False


def _llama_base() -> str:
    return (os.environ.get("CHICO_LLAMA_API_BASE") or DEFAULT_LLAMA_BASE).rstrip("/")


def llama_server_online(timeout_s: float = 3.0) -> bool:
    """Health-check rapido do llama-server Vulkan (OpenAI-compatible)."""
    try:
        req = urllib.request.Request(f"{_llama_base()}/health")  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
            return resp.status == 200
    except (OSError, urllib.error.URLError, TimeoutError):
        return False


def _llama_generate(
    model: str,
    prompt: str,
    system: str,
    json_mode: bool,
    timeout_s: float,
) -> tuple[str, dict[str, Any]]:
    """Chamada sincrona a /v1/chat/completions do llama-server."""
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
        "temperature": 0.4,
        "max_tokens": 2048,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    req = urllib.request.Request(  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        f"{_llama_base()}/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    inicio = time.perf_counter()
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        body = json.loads(resp.read().decode("utf-8"))
    latency_ms = (time.perf_counter() - inicio) * 1000.0
    choices = body.get("choices") or []
    text = str((choices[0].get("message") or {}).get("content") or "") if choices else ""
    usage = body.get("usage") or {}
    meta = {
        "engine": "llama-cpp-vulkan",
        "model": model,
        "latency_ms": round(latency_ms, 1),
        "completion_tokens": usage.get("completion_tokens"),
        "fallback_used": False,
    }
    return text, meta


def _ollama_generate(
    model: str,
    prompt: str,
    system: str,
    json_mode: bool,
    timeout_s: float,
) -> tuple[str, dict[str, Any]]:
    """Chamada sincrona a /api/generate do Ollama."""
    options: dict[str, Any] = {"num_ctx": 8192, "temperature": 0.4}
    payload: dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": options,
    }
    if json_mode:
        payload["format"] = "json"
    req = urllib.request.Request(  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        f"{_ollama_base()}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    inicio = time.perf_counter()
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        body = json.loads(resp.read().decode("utf-8"))
    latency_ms = (time.perf_counter() - inicio) * 1000.0
    text = str(body.get("response") or "")
    meta = {
        "engine": "ollama-local",
        "model": model,
        "latency_ms": round(latency_ms, 1),
        "eval_count": body.get("eval_count"),
        "fallback_used": False,
    }
    return text, meta


def _flash_lite_fallback(
    prompt: str,
    system: str,
    json_mode: bool,
) -> tuple[str, dict[str, Any]]:
    """Fallback cloud: gemini-3.5-flash-lite via pool existente (async->sync)."""
    import asyncio  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    async def _run() -> tuple[str, dict]:
        import aiohttp  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        from llm.gemini import call_gemini_flash_lite  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        timeout = aiohttp.ClientTimeout(total=60)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            return await call_gemini_flash_lite(
                session=session,
                user_prompt=prompt,
                system_prompt=system,
                workload="triagem",
                require_json=json_mode,
            )

    text, raw_meta = asyncio.run(_run())
    meta = dict(raw_meta) if isinstance(raw_meta, dict) else {}
    meta.update({"engine": "gemini-3.5-flash-lite", "fallback_used": True})
    return text, meta


def system2_generate(
    prompt: str,
    system: str = "",
    tier: str = "fast",
    json_mode: bool = False,
    prefer_local: bool = True,
    allow_cloud_fallback: bool = True,
    timeout_s: float | None = None,
) -> tuple[str, dict[str, Any]]:
    """Gera texto via System-2: Ollama local primeiro, Flash-Lite cloud como fallback.

    Retorna ``(texto, meta)`` onde ``meta`` carrega engine efetiva,
    modelo, latencia e ``fallback_used`` -- proveniencia obrigatoria.
    """
    hw = hardware_snapshot()
    tier_key = (tier or "fast").strip().lower()
    model = tier_model(tier_key)
    timeout = timeout_s if timeout_s is not None else OLLAMA_TIMEOUT_S
    meta_base: dict[str, Any] = {"tier": tier_key, "requested_model": model, "hardware": hw}

    if prefer_local and tier_key == "moe":
        if llama_server_online():
            try:
                text, meta = _llama_generate(model, prompt, system, json_mode, timeout)
                meta.update(meta_base)
                return text, meta
            except Exception as e:  # pylint: disable=broad-except
                logger.warning("[system2] llama-server falhou para %s: %s", model, e)
        deep_model = tier_model("deep")
        if ollama_online():
            try:
                text, meta = _ollama_generate(deep_model, prompt, system, json_mode, timeout)
                meta.update(meta_base)
                meta["model"] = deep_model
                meta["degraded_from"] = "llama-cpp-vulkan"
                return text, meta
            except Exception as e:  # pylint: disable=broad-except
                logger.warning("[system2] Ollama deep falhou: %s", e)
    elif prefer_local and ollama_online():
        try:
            text, meta = _ollama_generate(model, prompt, system, json_mode, timeout)
            meta.update(meta_base)
            return text, meta
        except Exception as e:  # pylint: disable=broad-except
            logger.warning("[system2] Ollama falhou para %s: %s", model, e)

    if not allow_cloud_fallback:
        return "", {**meta_base, "engine": "none", "error": "local-unavailable-no-cloud-fallback"}

    try:
        text, meta = _flash_lite_fallback(prompt, system, json_mode)
        meta.setdefault("engine", "gemini-3.5-flash-lite")
        meta.update(meta_base)
        meta["fallback_used"] = True
        return text, meta
    except Exception as e:  # pylint: disable=broad-except
        logger.warning("[system2] fallback cloud tambem falhou: %s", e)
        return "", {**meta_base, "engine": "none", "error": str(e)[:200], "fallback_used": True}
