import asyncio
import aiohttp
import json
import functools
import logging
from typing import Tuple, Optional

from llm.session import get_api_semaphore, _sync_fallback_request

def _normalize_gemini_model(model: str) -> str:
    """Helper SOTA: Normaliza modelos legados Gemini para a linha atual."""
    model_l = str(model).lower()
    if any(v in model_l for v in ("2.5-pro", "2.0-pro", "1.5-pro", "1.0-pro")):
        return "gemini-3.1-pro-latest"
    elif any(v in model_l for v in ("2.5-flash", "2.0-flash", "1.5-flash", "1.0-flash")):
        return "gemini-3-flash-latest"
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

async def call_gemini(session: aiohttp.ClientSession, model: str, system_prompt: str, user_prompt: str, api_key: str, timeout: Optional[aiohttp.ClientTimeout] = None, require_json: bool = False, **kwargs) -> Tuple[str, dict]:
    """Cortex de Execucao da API Gemini SOTA."""
    # SOTA: Ponto de controle unico para o Rate Limiter Global. Garante que TODAS as chamadas
    # Gemini no sistema respeitem a cota de 15 RPM do Free Tier.
    from llm.budget import global_rate_limiter
    await global_rate_limiter.consume()
    model = _normalize_gemini_model(model)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = _build_gemini_payload(system_prompt, user_prompt, require_json, **kwargs)

    response = None
    try:
        async with get_api_semaphore():
            try:
                async with session.post(url, json=data, headers=headers, **({"timeout": timeout} if timeout else {})) as response:
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
            except (aiohttp.ClientError, asyncio.TimeoutError, ConnectionResetError) as e:
                logging.warning(f"[MOTOR DUAL] Aiohttp interceptado ({e}). Orbitando para Bypass Nativo (urllib)...")
                fallback_headers = {"Content-Type": "application/json"}
                timeout_seconds = timeout.total if timeout and timeout.total else 60.0
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
                else:
                    raise RuntimeError(f"HTTP {status} (Fallback Nativo): {raw_text}")

    except aiohttp.ClientResponseError as e:
        error_body = await response.text() if response else ""
        raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}")
