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

import asyncio
import http.client
import json
import logging
import os
from pathlib import Path
import threading
import time
from typing import Any
import urllib.parse
import urllib.request

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OLLAMA_MANIFEST = PROJECT_ROOT / "data" / "ollama_models.json"
DEFAULT_OLLAMA_BASE = "http://127.0.0.1:11434"
DEFAULT_LLAMA_BASE = "http://127.0.0.1:8080"  # llama-swap proxy (gerencia spawn/unload do llama-server)
DEFAULT_GEMMA_PROXY_BASE = "http://127.0.0.1:17043"
OLLAMA_TIMEOUT_S = float(os.environ.get("CHICO_S2_TIMEOUT_S", "120"))

SYSTEM2_TIERS: dict[str, str] = {
    "fast": "qwen3_5_4b",
    "balanced": "qwen_coder_7b_q5",
    "deep": "qwen3_8_27b",
    "code": "qwen_code_surgical",
    "moe": "qwen3.6-35b-a3b-mtp",
    "edge": "12b",
}

_TIER_ENV: dict[str, str] = {
    "fast": "CHICO_S2_FAST_MODEL",
    "balanced": "CHICO_S2_BALANCED_MODEL",
    "deep": "CHICO_S2_DEEP_MODEL",
    "code": "CHICO_S2_CODE_MODEL",
    "moe": "CHICO_S2_MOE_MODEL",
    "edge": "CHICO_S2_EDGE_MODEL",
}


def _load_manifest_aliases() -> dict[str, str]:
    try:
        with OLLAMA_MANIFEST.open(encoding="utf-8") as fh:
            data = json.load(fh)
        return {m["alias"]: m["tag"] for m in data.get("models", []) if m.get("alias") and m.get("tag")}
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return {}


_MANIFEST_ALIASES: dict[str, str] = _load_manifest_aliases()


def _load_manifest_sizes() -> dict[str, float]:
    """Mapa ``tag -> size_gb`` do manifesto Ollama (para checagem de RAM)."""
    try:
        with OLLAMA_MANIFEST.open(encoding="utf-8") as fh:
            data = json.load(fh)
        return {
            str(m["tag"]): float(m["size_gb"])
            for m in data.get("models", [])
            if m.get("tag") and isinstance(m.get("size_gb"), (int, float))
        }
    except (OSError, KeyError, TypeError, ValueError):
        return {}


_MANIFEST_SIZES: dict[str, float] = _load_manifest_sizes()

# O modelo em RAM exige folga para KV cache, ctx (num_ctx=8192) e SO:
# size_gb * headroom <= RAM disponivel no momento da decisao.
_OLLAMA_RAM_HEADROOM = 1.4

_FLASH_LITE_MODEL = "gemini-3.5-flash-lite"


def _available_ram_gb() -> float | None:
    """RAM disponivel AGORA via psutil; ``None`` quando a telemetria falha.

    ``None`` e sentinela de "nao sei" -- distinto de ``0.0``, que e uma leitura
    valida de RAM esgotada e deve reprovar o modelo.
    """
    try:
        import psutil  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        return psutil.virtual_memory().available / (1024**3)
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[system2] psutil indisponivel para available: %s", e)
        return None


def _ollama_ps_models() -> list[dict[str, Any]]:
    """Modelos carregados no Ollama (``/api/ps``); ``[]`` quando indisponivel."""
    try:
        req = urllib.request.Request(f"{_ollama_base()}/api/ps")  # noqa: S310 - endpoint loopback local (Ollama)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        with urllib.request.urlopen(req, timeout=3.0) as resp:  # noqa: S310 - endpoint loopback local (Ollama)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
            body = json.loads(resp.read().decode("utf-8"))
    except (OSError, ValueError):
        return []
    return [e for e in body.get("models") or [] if isinstance(e, dict)]


def _ollama_model_loaded(model: str) -> bool:
    """True quando o modelo ja consta como carregado no Ollama (``/api/ps``)."""
    return any(model in (e.get("name"), e.get("model")) for e in _ollama_ps_models())


def _reclaimable_ram_gb(loaded: list[dict[str, Any]], exclude: str) -> float:
    """RAM ocupada por OUTROS modelos carregados -- recuperavel via eviction."""
    total = 0.0
    for entry in loaded:
        name = str(entry.get("name") or entry.get("model") or "")
        if name == exclude:
            continue
        size_b = entry.get("size")
        if not isinstance(size_b, (int, float)):
            continue
        vram_b = entry.get("size_vram")
        total += max(0.0, float(size_b) - float(vram_b or 0.0)) / (1024**3)
    return round(total, 1)


def _vram_total_gb() -> float:
    """VRAM total do dispositivo (teto otimista de offload do Ollama)."""
    try:
        return float(hardware_snapshot().get("vram_gb") or 0.0)
    except Exception:  # pylint: disable=broad-except
        return 0.0


def model_fits_device(model: str) -> bool:
    """Wrapper publico de admissao RAM+VRAM para consumidores locais (gemma_local/S2)."""
    return _ollama_model_fits_ram(model)


def _ollama_model_fits_ram(model: str) -> bool:
    """True quando o modelo provavelmente cabe na memoria do dispositivo.

    Usada a memoria disponivel atual (nao o total do snapshot). Um modelo ja
    carregado retorna True -- seu consumo ja esta debitado do ``available``.
    Alem da RAM, soma a memoria recuperavel de outros modelos ociosos
    (``/api/ps``: o Ollama os despeja para abrir espaco) e, na faixa em que so
    a VRAM total cobriria, delega a admissao ao proprio Ollama (offload
    parcial). Sem ``size_gb`` no manifesto ou sem telemetria de RAM, mantem a
    tentativa -- nao bloqueia hosts sem medicao.
    """
    size_gb = _MANIFEST_SIZES.get(model)
    avail_gb = _available_ram_gb()
    if not size_gb or avail_gb is None:
        return True
    loaded = _ollama_ps_models()
    if any(model in (e.get("name"), e.get("model")) for e in loaded):
        return True
    needed = size_gb * _OLLAMA_RAM_HEADROOM
    reclaimable = _reclaimable_ram_gb(loaded, exclude=model)
    if needed <= avail_gb + reclaimable:
        return True
    vram_gb = _vram_total_gb()
    return bool(vram_gb) and needed <= avail_gb + reclaimable + vram_gb


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


def _probe_ram_gb(snap: dict[str, Any]) -> None:
    try:
        import psutil  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        snap["ram_gb"] = round(psutil.virtual_memory().total / (1024**3), 1)
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[system2] psutil indisponivel: %s", e)


def _probe_vram_windows(snap: dict[str, Any]) -> None:
    """VRAM real via registro (WMI AdapterRAM satura em ~4GB em GPUs de 8GB)."""
    if os.name != "nt":
        return
    try:
        import winreg  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        base = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}"
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, base) as cls:
            idx = 0
            while True:
                try:
                    sub = winreg.EnumKey(cls, idx)
                    idx += 1
                except OSError:
                    break
                _probe_gpu_device(cls, sub, snap)
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[system2] leitura VRAM falhou: %s", e)


def _probe_gpu_device(cls: Any, sub: str, snap: dict[str, Any]) -> None:
    import winreg  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    try:
        with winreg.OpenKey(cls, sub) as dev:
            try:
                mem, _ = winreg.QueryValueEx(dev, "HardwareInformation.qwMemorySize")
            except OSError:
                return
            if not mem:
                return
            gb = float(mem) / (1024**3)
            if gb <= snap["vram_gb"]:
                return
            snap["vram_gb"] = round(gb, 1)
            try:
                snap["gpu_name"], _ = winreg.QueryValueEx(dev, "DriverDesc")
            except OSError:
                snap["gpu_name"] = snap["gpu_name"] or ""
    except (OSError, TypeError, ValueError):
        return


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
    _probe_ram_gb(snap)
    _probe_vram_windows(snap)
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
    except OSError:
        return False


def _loopback_http(
    method: str,
    url: str,
    body: bytes | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = 5.0,
) -> tuple[int, bytes]:
    """Requisicao HTTP sincrona sobre loopback via ``http.client``."""
    parsed = urllib.parse.urlsplit(url)
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 80
    path = parsed.path or "/"
    if parsed.query:
        path = f"{path}?{parsed.query}"
    conn = http.client.HTTPConnection(host, port, timeout=timeout)
    try:
        conn.request(method, path, body=body, headers=headers or {})
        resp = conn.getresponse()
        return int(resp.status), resp.read()
    finally:
        conn.close()


def _gemma_proxy_base() -> str:
    return (os.environ.get("CHICO_GEMMA_PROXY_BASE") or DEFAULT_GEMMA_PROXY_BASE).rstrip("/")


def edge_proxy_online(timeout_s: float = 2.0) -> bool:
    """Health-check do gateway Gemma SOTA (:17043/health)."""
    try:
        status, raw = _loopback_http("GET", f"{_gemma_proxy_base()}/health", timeout=timeout_s)
        if status != 200:
            return False
        body = json.loads(raw.decode("utf-8"))
        return body.get("health") == "ok" or "Operacional" in str(body.get("status", ""))
    except (OSError, ValueError, http.client.HTTPException):
        return False


def _llama_base() -> str:
    return (os.environ.get("CHICO_LLAMA_API_BASE") or DEFAULT_LLAMA_BASE).rstrip("/")


def llama_server_online(timeout_s: float = 3.0) -> bool:
    """Health-check do llama-swap/llama-server com verificacao de identidade.

    ``/health`` sozinho aceita qualquer HTTP 200 — um backend estranho na
    porta 8080 seria classificado como llama.cpp e receberia trafego MoE.
    A identidade e confirmada em ``/v1/models``: e preciso haver um modelo
    ``qwen*`` na lista (alias canonico do llama-swap: qwen-moe /
    system2-moe / qwen3.6-35b-a3b-mtp).
    """
    try:
        req = urllib.request.Request(f"{_llama_base()}/v1/models")  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - endpoint loopback local (Ollama/llama-swap)  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
            if resp.status != 200:
                return False
            body = json.loads(resp.read().decode("utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    models = body.get("data") or []
    return any("qwen" in str(m.get("id", "")).lower() for m in models if isinstance(m, dict))


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
    if not text.strip():
        raise RuntimeError(f"[system2] Ollama devolveu 'response' vazio para {model}.")
    meta = {
        "engine": "ollama-local",
        "model": model,
        "latency_ms": round(latency_ms, 1),
        "eval_count": body.get("eval_count"),
        "fallback_used": False,
    }
    return text, meta


_FALLBACK_LOOP: asyncio.AbstractEventLoop | None = None
_FALLBACK_LOOP_GUARD = threading.Lock()


def _shared_fallback_loop() -> asyncio.AbstractEventLoop:
    """Loop dedicado e unico para as chamadas Gemini do fallback System-2.

    ``llm/gemini_pool`` e ``llm/budget`` usam ``asyncio.Lock``/``Semaphore``
    de modulo: um ``asyncio.run`` por chamada criava loops distintos que
    disputavam esses locks. Um unico loop em thread daemon isola o estado
    assincrono compartilhado.
    """
    global _FALLBACK_LOOP  # noqa: PLW0603
    with _FALLBACK_LOOP_GUARD:
        if _FALLBACK_LOOP is None or _FALLBACK_LOOP.is_closed():
            _FALLBACK_LOOP = asyncio.new_event_loop()
            threading.Thread(
                target=_FALLBACK_LOOP.run_forever,
                name="system2-gemini-loop",
                daemon=True,
            ).start()
        return _FALLBACK_LOOP


def _flash_lite_fallback(
    prompt: str,
    system: str,
    json_mode: bool,
) -> tuple[str, dict[str, Any]]:
    """Fallback cloud: gemini-3.5-flash-lite via pool existente (loop compartilhado)."""

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

    inicio = time.perf_counter()
    future = asyncio.run_coroutine_threadsafe(_run(), _shared_fallback_loop())
    try:
        text, raw_meta = future.result(timeout=90)
    except Exception:
        future.cancel()
        raise
    latency_ms = (time.perf_counter() - inicio) * 1000.0
    meta = dict(raw_meta) if isinstance(raw_meta, dict) else {}
    meta.update(
        {
            "engine": _FLASH_LITE_MODEL,
            "model": _FLASH_LITE_MODEL,
            "latency_ms": round(latency_ms, 1),
            "fallback_used": True,
        }
    )
    return text, meta


def _try_moe_local(
    model: str,
    prompt: str,
    system: str,
    json_mode: bool,
    timeout: float,
    meta_base: dict[str, Any],
) -> tuple[str, dict[str, Any]] | None:
    """Caminho tier ``moe``: llama-swap/llama-server -> Ollama deep degradado."""
    if llama_server_online():
        try:
            text, meta = _llama_generate(model, prompt, system, json_mode, timeout)
            meta.update(meta_base)
            return text, meta
        except Exception as e:  # pylint: disable=broad-except
            logger.warning("[system2] llama-server falhou para %s: %s", model, e)
    deep_model = tier_model("deep")
    if not _ollama_model_fits_ram(deep_model):
        logger.info("[system2] deep (%s) nao cabe na RAM disponivel; sem degradacao Ollama.", deep_model)
        return None
    if ollama_online():
        try:
            text, meta = _ollama_generate(deep_model, prompt, system, json_mode, timeout)
            meta.update(meta_base)
            meta["model"] = deep_model
            meta["degraded_from"] = "llama-cpp-vulkan"
            return text, meta
        except Exception as e:  # pylint: disable=broad-except
            logger.warning("[system2] Ollama deep falhou: %s", e)
    return None


def _try_ollama_local(
    model: str,
    prompt: str,
    system: str,
    json_mode: bool,
    timeout: float,
    meta_base: dict[str, Any],
) -> tuple[str, dict[str, Any]] | None:
    if not _ollama_model_fits_ram(model):
        logger.info("[system2] %s nao cabe na RAM disponivel; escalando para fallback.", model)
        return None
    if not ollama_online():
        return None
    try:
        text, meta = _ollama_generate(model, prompt, system, json_mode, timeout)
        meta.update(meta_base)
        return text, meta
    except Exception as e:  # pylint: disable=broad-except
        logger.warning("[system2] Ollama falhou para %s: %s", model, e)
        return None


def _try_edge_proxy_local(
    model: str,
    prompt: str,
    system: str,
    json_mode: bool,
    timeout: float,
    meta_base: dict[str, Any],
) -> tuple[str, dict[str, Any]] | None:
    """Caminho tier ``edge``: Gemma Edge Proxy (:17043) -> Ollama local."""
    auth_token = os.environ.get("API_SECRET_TOKEN") or os.environ.get("VITOI_AUTH_TOKEN")
    if auth_token and _ollama_model_fits_ram(model) and edge_proxy_online():
        payload: dict[str, Any] = {
            "prompt": prompt,
            "system_prompt": system,
            "model": model,
            "max_tokens": 2048,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        inicio = time.perf_counter()
        try:
            status, raw = _loopback_http(
                "POST",
                f"{_gemma_proxy_base()}/generate",
                body=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "X-Vitoi-Auth": auth_token},
                timeout=timeout,
            )
            text = raw.decode("utf-8") if status == 200 else ""
            if status != 200:
                raise RuntimeError(f"HTTP {status} do proxy :17043")
            if text.strip():
                meta = {
                    **meta_base,
                    "engine": "gemma-edge-proxy",
                    "model": model,
                    "latency_ms": round((time.perf_counter() - inicio) * 1000.0, 1),
                    "fallback_used": False,
                }
                return text, meta
        except Exception as e:  # pylint: disable=broad-except
            logger.warning("[system2] edge proxy :17043 falhou para %s: %s", model, e)
    return _try_ollama_local(model, prompt, system, json_mode, timeout, meta_base)


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

    if prefer_local:
        if tier_key == "moe":
            local = _try_moe_local(model, prompt, system, json_mode, timeout, meta_base)
        elif tier_key == "edge":
            local = _try_edge_proxy_local(model, prompt, system, json_mode, timeout, meta_base)
        else:
            local = _try_ollama_local(model, prompt, system, json_mode, timeout, meta_base)
        if local is not None:
            return local

    if not allow_cloud_fallback:
        return "", {
            **meta_base,
            "engine": "none",
            "error": "local-unavailable-no-cloud-fallback",
            "fallback_used": False,
        }

    try:
        text, meta = _flash_lite_fallback(prompt, system, json_mode)
        meta.setdefault("engine", _FLASH_LITE_MODEL)
        meta.update(meta_base)
        meta["fallback_used"] = True
        return text, meta
    except Exception as e:  # pylint: disable=broad-except
        logger.warning("[system2] fallback cloud tambem falhou: %s", e)
        return "", {**meta_base, "engine": "none", "error": str(e)[:200], "fallback_used": True}
