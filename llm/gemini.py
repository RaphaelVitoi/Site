import asyncio
import aiohttp
import json
import functools
import logging
from typing import Tuple, Optional

from llm.session import get_api_semaphore, _sync_fallback_request

def _normalize_gemini_model(model: str) -> str:
    """Helper SOTA: Normaliza modelos legados e experimentais Gemini para a linha estavel."""
    model_l = str(model).lower()

    # Suporte nativo para a série 2.x
    if "2.0" in model_l or "2.5" in model_l:
        return model

    # Normaliza pro models experimentais para 1.5-pro se não for 2.x
    if "pro" in model_l and any(v in model_l for v in ("3.1", "3.0")):
        return "gemini-1.5-pro"

    # Bloqueia a serie 3.x experimental (que ainda não existe estavelmente), forçando o downgrade para 2.0-flash
    if any(v in model_l for v in ("3.1", "3.0")):
        return "gemini-2.0-flash"

    if "1.0" in model_l:
        return "gemini-1.5-flash"

    return model

def _build_gemini_payload(system_prompt: str, user_prompt: str, require_json: bool, **kwargs) -> dict:
    """Constroi a carga util da API absorvendo a prevencao de falhas de chaves Free-Tier."""
    final_user_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}" if system_prompt else user_prompt
    gen_config = {
        "temperature": kwargs.get("temperature", 0.2),
        "maxOutputTokens": kwargs.get("max_tokens", 8192)
    }
    if require_json:
        gen_config["responseMimeType"] = "application/json"
    return {"contents": [{"parts": [{"text": final_user_prompt}]}], "generationConfig": gen_config}

async def _execute_native_fallback(url: str, data: dict, client_timeout: Optional[aiohttp.ClientTimeout]) -> Tuple[str, dict]:
    """Mecanismo de fallback sincronizado rodando isolado para neutralizar TCP Drops."""
    logging.warning("[MOTOR DUAL] Aiohttp interceptado. Orbitando para Bypass Nativo (urllib)...")
    fallback_headers = {"Content-Type": "application/json"}
    timeout_seconds = client_timeout.total if client_timeout and client_timeout.total else 60.0
    loop = asyncio.get_running_loop()
    status, raw_text = await loop.run_in_executor(
        None,
        functools.partial(_sync_fallback_request, url, data, fallback_headers, timeout_seconds)
    )
    if status == 200:
        result = json.loads(raw_text)
        text = result['candidates'][0]['content']['parts'][0]['text']
        usage = result.get('usageMetadata', {})
        return text, usage
    raise RuntimeError(f"HTTP {status} (Fallback Nativo): {raw_text}")

async def _execute_primary_request(session: aiohttp.ClientSession, url: str, data: dict, headers: dict, request_kwargs: dict) -> Tuple[str, dict]:
    """Canal principal de IO assíncrono."""
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
                except Exception:
                    pass
                raise RuntimeError(f"HTTP 429: RESOURCE_EXHAUSTED retry_after={retry_delay_s:.0f}s")
            response.raise_for_status()
            result = await response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            usage = result.get('usageMetadata', {})
            return text, usage
    except aiohttp.ClientResponseError as e:
        error_body = await response.text() if response else ""
        raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}")

async def call_gemini(session: aiohttp.ClientSession, model: str, system_prompt: str, user_prompt: str, api_key: str, client_timeout: Optional[aiohttp.ClientTimeout] = None, require_json: bool = False, **kwargs) -> Tuple[str, dict]:
    """Cortex de Execucao da API Gemini SOTA."""
    # SOTA: Multi-Bucket Rate Limiter (Lei de Shannon). Respeita as cotas individuais (Pro vs Flash).
    from llm.budget import get_rate_limiter_for_model
    rate_limiter = get_rate_limiter_for_model(model)
    if rate_limiter.tokens < 1:
        logging.info(f"[GEMINI] Cota local exaurida para o modelo {model}. Aguardando reabastecimento do Token Bucket...")
    await rate_limiter.consume()
    model = _normalize_gemini_model(model)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = _build_gemini_payload(system_prompt, user_prompt, require_json, **kwargs)
    request_kwargs: dict = {"timeout": client_timeout} if client_timeout is not None else {}

    async with get_api_semaphore():
        try:
            return await _execute_primary_request(session, url, data, headers, request_kwargs)
        except RuntimeError:
            # Erros semanticos (ex: 400, 403, 404, 429 tratados) sobem diretamente
            raise
        except (aiohttp.ClientError, asyncio.TimeoutError, ConnectionResetError):
            # Exaustao da pilha aiohttp leva ao bypass nativo via urllib thread
            return await _execute_native_fallback(url, data, client_timeout)
