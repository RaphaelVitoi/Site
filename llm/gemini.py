# pylint: disable=missing-module-docstring, broad-exception-caught, logging-fstring-interpolation, try-except-raise, line-too-long

from __future__ import annotations

import asyncio
import functools
import json
import logging
from typing import Any

import aiohttp
import time

from llm.budget import get_rate_limiter_for_model
from llm.gemini_pool import GeminiWorkload, gemini_pool_manager
from llm.session import _sync_fallback_request, get_api_semaphore

GEMINI_API_KEY_HEADER = "x-goog-api-key"

logger = logging.getLogger(__name__)

APP_JSON = "application/json"


def _normalize_gemini_model(model: str) -> str:
    """Helper SOTA: Normaliza modelos legados e experimentais Gemini para a linha estavel."""
    model_l = model.lower()

    # Suporte nativo para a serie 3.x (Gemini 3.8 Flash / 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite / 3.1 Flash-Lite)
    if any(v in model_l for v in ("3.8", "3.7", "3.6", "3.5", "3.1", "3.0")):
        return model

    # Suporte nativo para a serie 2.x
    if "2.0" in model_l or "2.5" in model_l:
        return model

    if "1.0" in model_l:
        return "gemini-3.5-flash-lite"

    return model


def _is_gemini_3x(model_str: str) -> bool:
    """Verifica se o modelo pertence a serie Gemini 3.x."""
    return any(v in model_str for v in ("3.8", "3.7", "3.6", "3.5"))


def _is_thinking_capable(model_str: str, thinking_kwarg: bool) -> bool:
    """Verifica se o modelo suporta Dynamic Thinking."""
    return any(v in model_str for v in ("3.8", "3.7")) or thinking_kwarg


def _build_thinking_config(kwargs: dict[str, Any], model_str: str) -> dict[str, Any]:
    """Constroi configuracao de Extended Thinking."""
    budget = kwargs.get("thinking_budget")
    if budget is None and _is_thinking_capable(model_str, kwargs.get("thinking", False)):
        budget = 4096
    thinking_level = kwargs.get("thinking_level")
    thinking_config: dict[str, Any] = {}
    if budget:
        thinking_config["thinkingBudget"] = budget
    if thinking_level:
        thinking_config["thinkingLevel"] = str(thinking_level).upper()
    return thinking_config


def _extract_text_from_parts(parts: list[dict[str, Any]]) -> str:
    """Extrai texto das partes da resposta, ignorando thought blocks."""
    texts = [p.get("text", "") for p in parts if "text" in p and not p.get("thought", False)]
    if texts:
        return "".join(texts)
    if parts:
        return parts[0].get("text", "")
    return ""


def _build_gemini_payload(system_prompt: str, user_prompt: str, require_json: bool, **kwargs: Any) -> dict[str, Any]:
    """Constroi a carga util da API absorvendo a prevencao de falhas de chaves Free-Tier e suporte a Thinking."""
    final_user_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}" if system_prompt else user_prompt
    model_str = str(kwargs.get("model", "")).lower()
    is_gemini_3x = _is_gemini_3x(model_str)

    gen_config: dict[str, Any] = {
        "maxOutputTokens": kwargs.get("max_tokens", 8192),
    }

    # Gemini 3.x descontinuou amostragem estocastica tradicional (temperature, top_p, top_k).
    # Parametros de amostragem somente sao injetados em modelos legados.
    if not is_gemini_3x:
        gen_config["temperature"] = kwargs.get("temperature", 0.2)

    if require_json:
        gen_config["responseMimeType"] = APP_JSON

    # SOTA: Habilita Dynamic Thinking / Test-Time Compute para Gemini 3.8 Flash e 3.7 Flash
    if _is_thinking_capable(model_str, kwargs.get("thinking", False)):
        thinking_config = _build_thinking_config(kwargs, model_str)
        if thinking_config:
            gen_config["thinkingConfig"] = thinking_config

    contents = kwargs.get("contents")
    if contents is None:
        contents = [{"parts": [{"text": final_user_prompt}]}]

    # Validacao de historico: o ultimo turno nao pode ser model
    if contents:
        last_role = contents[-1].get("role") or contents[-1].get("type")
        if last_role in ("model", "model_output"):
            raise ValueError(
                f"Google Gemini 3.x: Requisicoes onde o ultimo elemento contem role '{last_role}' "
                "sao ativamente rejeitadas com erro HTTP 400. O ultimo turno deve ser do usuario."
            )

    return {
        "contents": contents,
        "generationConfig": gen_config,
    }


async def _execute_native_fallback(
    url: str, data: dict, client_timeout: aiohttp.ClientTimeout | None, api_key: str
) -> tuple[str, dict]:
    """Mecanismo de fallback sincronizado rodando isolado para neutralizar TCP Drops."""
    logger.warning("[MOTOR DUAL] Aiohttp interceptado. Orbitando para Bypass Nativo (urllib)...")
    fallback_headers = {"Content-Type": APP_JSON, GEMINI_API_KEY_HEADER: api_key}
    timeout_seconds = client_timeout.total if client_timeout and client_timeout.total else 60.0
    loop = asyncio.get_running_loop()
    status, raw_text = await loop.run_in_executor(
        None,
        functools.partial(_sync_fallback_request, url, data, fallback_headers, timeout_seconds),
    )
    if status == 200:
        result = json.loads(raw_text)
        parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = _extract_text_from_parts(parts)
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
            parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            text = _extract_text_from_parts(parts)
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
    api_key: str = "",
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs,
) -> tuple[str, dict]:
    """Cortex de Execucao da API Gemini SOTA com suporte a pool rotacional."""
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    workload = kwargs.pop("workload", GeminiWorkload.TRIAGEM)
    active_key = api_key
    if not active_key:
        active_key, _ = await gemini_pool_manager.get_key_for_workload(workload)

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    # SOTA: Multi-Bucket Rate Limiter (Lei de Shannon). Respeita as cotas individuais (Pro vs Flash).
    rate_limiter = get_rate_limiter_for_model(model)
    if rate_limiter.tokens < 1:
        logger.info(
            f"[GEMINI] Cota local exaurida para o modelo {model}. Aguardando reabastecimento do Token Bucket..."
        )
    await rate_limiter.consume()
    model = _normalize_gemini_model(model)

    # BK-21 (auditoria 2026-09-16): a chave ia na query string. URL aparece em log
    # de proxy e em `str(aiohttp.ClientResponseError)` -- medido: `url=...?key=...`.
    # O header e o canal documentado pelo Google para a mesma autenticacao.
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {"Content-Type": APP_JSON, GEMINI_API_KEY_HEADER: active_key}
    data = _build_gemini_payload(system_prompt, user_prompt, require_json, **kwargs)
    request_kwargs: dict = {"timeout": client_timeout} if client_timeout is not None else {}
    timeout_val = client_timeout.total if client_timeout and client_timeout.total else 60.0

    start_t = time.perf_counter()
    async with get_api_semaphore():
        try:
            res_text, res_usage = await asyncio.wait_for(
                _execute_primary_request(session, url, data, headers, request_kwargs),
                timeout=timeout_val + 5.0,
            )
            lat_ms = (time.perf_counter() - start_t) * 1000.0
            await gemini_pool_manager.mark_success(active_key, lat_ms)
            return res_text, res_usage
        except RuntimeError as err:
            err_str = str(err)
            status_code = 500
            retry_after = 0.0
            if "HTTP 429" in err_str:
                status_code = 429
                if "retry_after=" in err_str:
                    try:
                        retry_after = float(err_str.split("retry_after=")[1].split("s")[0])
                    except (IndexError, ValueError):
                        retry_after = 45.0
            elif "HTTP 401" in err_str:
                status_code = 401
            elif "HTTP 403" in err_str:
                status_code = 403

            await gemini_pool_manager.mark_failure(active_key, status_code, retry_after, str(err))
            raise
        except (aiohttp.ClientError, TimeoutError, ConnectionResetError) as net_err:
            await gemini_pool_manager.mark_failure(active_key, 503, 10.0, str(net_err))
            return await _execute_native_fallback(url, data, client_timeout, active_key)


async def call_gemini_flash_lite(
    session: aiohttp.ClientSession,
    user_prompt: str,
    system_prompt: str = "",
    workload: GeminiWorkload | str = GeminiWorkload.TRIAGEM,
    require_json: bool = False,
    client_timeout: aiohttp.ClientTimeout | None = None,
    max_retries: int = 3,
    **kwargs,
) -> tuple[str, dict]:
    """
    Chamada especializada para Gemini 3.5 Flash-Lite com rotação inteligente e circuit breaker.
    Projetado especificamente para:
      - Edições pontuais e atômicas (workload='atomic_edits')
      - Triagem de prompts e tarefas (workload='triagem')
      - Linting e verificação estática (workload='linting')
    """
    last_err: Exception | None = None
    for attempt in range(max_retries):
        try:
            return await call_gemini(
                session=session,
                model="gemini-3.5-flash-lite",
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                api_key="",  # força rotação inteligente via pool
                client_timeout=client_timeout,
                require_json=require_json,
                workload=workload,
                **kwargs,
            )
        except RuntimeError as err:
            last_err = err
            if "HTTP 429" in str(err) and attempt < max_retries - 1:
                logger.warning(
                    f"[GEMINI FLASH-LITE] Chave atingiu 429 na tentativa {attempt + 1}. "
                    "Alternando automaticamente para a próxima chave do pool..."
                )
                continue
            raise

    if last_err:
        raise last_err
    raise RuntimeError("[GEMINI FLASH-LITE] Falha desconhecida no pool de chaves.")
