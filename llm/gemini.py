# pylint: disable=missing-module-docstring, broad-exception-caught, logging-fstring-interpolation, try-except-raise, line-too-long

import asyncio
import functools
import json
import logging

import aiohttp

from llm.budget import get_rate_limiter_for_model
from llm.session import _sync_fallback_request, get_api_semaphore

logger = logging.getLogger(__name__)

APP_JSON = "application/json"


def _normalize_gemini_model(model: str) -> str:
    """Helper SOTA: Normaliza modelos legados e experimentais Gemini para a linha estavel."""
    model_l = model.lower()

    # Suporte nativo para a serie 3.x (Gemini 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite / 3.1 Flash-Lite)
    if any(v in model_l for v in ("3.7", "3.6", "3.5", "3.1", "3.0")):
        return model

    # Suporte nativo para a serie 2.x
    if "2.0" in model_l or "2.5" in model_l:
        return model

    if "1.0" in model_l:
        return "gemini-3.5-flash-lite"

    return model


def _build_gemini_payload(system_prompt: str, user_prompt: str, require_json: bool, **kwargs) -> dict:
    """Constroi a carga util da API absorvendo a prevencao de falhas de chaves Free-Tier e suporte a Thinking."""
    final_user_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}" if system_prompt else user_prompt
    gen_config = {
        "temperature": kwargs.get("temperature", 0.2),
        "maxOutputTokens": kwargs.get("max_tokens", 8192),
    }
    if require_json:
        gen_config["responseMimeType"] = APP_JSON

    # SOTA: Habilita Dynamic Thinking para Gemini 3.7 Flash
    model_str = str(kwargs.get("model", "")).lower()
    if "3.7" in model_str or kwargs.get("thinking", False):
        budget = kwargs.get("thinking_budget", 4096)
        if budget:
            gen_config["thinkingConfig"] = {"thinkingBudget": budget}

    return {
        "contents": [{"parts": [{"text": final_user_prompt}]}],
        "generationConfig": gen_config,
    }


async def _execute_native_fallback(
    url: str, data: dict, client_timeout: aiohttp.ClientTimeout | None
) -> tuple[str, dict]:
    """Mecanismo de fallback sincronizado rodando isolado para neutralizar TCP Drops."""
    logger.warning("[MOTOR DUAL] Aiohttp interceptado. Orbitando para Bypass Nativo (urllib)...")
    fallback_headers = {"Content-Type": APP_JSON}
    timeout_seconds = client_timeout.total if client_timeout and client_timeout.total else 60.0
    loop = asyncio.get_running_loop()
    status, raw_text = await loop.run_in_executor(
        None,
        functools.partial(_sync_fallback_request, url, data, fallback_headers, timeout_seconds),
    )
    if status == 200:
        result = json.loads(raw_text)
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        usage = result.get("usageMetadata", {})
        return text, usage
    raise RuntimeError(f"HTTP {status} (Fallback Nativo): {raw_text}")


async def _execute_primary_request(
    session: aiohttp.ClientSession,
    url: str,
    data: dict,
    headers: dict,
    request_kwargs: dict,
) -> tuple[str, dict]:
    """Canal principal de IO assincrono."""
    response = None
    try:
        async with session.post(url, json=data, headers=headers, **request_kwargs) as response:
            if response.status == 429:
                retry_delay_s = 0.0
                try:
                    body = await response.json(content_type=None)
                    for detail in body.get("error", {}).get("details", []):
                        if "retryDelay" in detail:
                            retry_delay_s = float(str(detail["retryDelay"]).rstrip("s"))
                except Exception:  # noqa: BLE001, S110
                    pass
                raise RuntimeError(f"HTTP 429: RESOURCE_EXHAUSTED retry_after={retry_delay_s:.0f}s")
            response.raise_for_status()
            result = await response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            usage = result.get("usageMetadata", {})
            return text, usage
    except aiohttp.ClientResponseError as e:
        error_body = await response.text() if response else ""
        raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}") from e


async def call_gemini(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs,
) -> tuple[str, dict]:
    """Cortex de Execucao da API Gemini SOTA."""
    # SOTA: Multi-Bucket Rate Limiter (Lei de Shannon). Respeita as cotas individuais (Pro vs Flash).
    rate_limiter = get_rate_limiter_for_model(model)
    if rate_limiter.tokens < 1:
        logger.info(
            f"[GEMINI] Cota local exaurida para o modelo {model}. Aguardando reabastecimento do Token Bucket..."
        )
    await rate_limiter.consume()
    model = _normalize_gemini_model(model)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": APP_JSON}
    data = _build_gemini_payload(system_prompt, user_prompt, require_json, **kwargs)
    request_kwargs: dict = {"timeout": client_timeout} if client_timeout is not None else {}
    timeout_val = client_timeout.total if client_timeout and client_timeout.total else 60.0

    async with get_api_semaphore():
        try:
            return await asyncio.wait_for(
                _execute_primary_request(session, url, data, headers, request_kwargs),
                timeout=timeout_val + 5.0,
            )
        except RuntimeError:
            # Erros semanticos (ex: 400, 403, 404, 429 tratados) sobem diretamente
            raise
        except (aiohttp.ClientError, TimeoutError, ConnectionResetError):
            # Exaustao da pilha aiohttp leva ao bypass nativo via urllib thread
            return await _execute_native_fallback(url, data, client_timeout)
