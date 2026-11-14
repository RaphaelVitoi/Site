"""
SOTA Ollama Cloud API Integration.
Atende o endpoint hospedado https://ollama.com/api (modelos cloud, ex.:
glm-5.3-flash) com autenticacao Bearer via OLLAMA_API_KEY.

Nao confundir com o daemon Ollama local (llama_local/ollama em
http://localhost:11434): aqui a inferencia e remota e exige chave.
Referencias: https://docs.ollama.com/api/introduction.md
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import os
import threading
import time

import aiohttp

from llm.session import get_api_semaphore

__all__ = [
    "OLLAMA_CLOUD_BASE_URL",
    "DEFAULT_OLLAMA_CLOUD_MODEL",
    "ollama_api_key",
    "is_configured",
    "billing_cooldown_remaining_s",
    "reset_ollama_cloud_circuit",
    "call_ollama_cloud",
]

logger = logging.getLogger(__name__)

OLLAMA_CLOUD_BASE_URL = "https://ollama.com"
DEFAULT_OLLAMA_CLOUD_MODEL = "glm-5.3-flash"
_DEFAULT_BILLING_COOLDOWN_S = 300.0
_BILLING_LOCK = threading.Lock()
_BILLING_COOLDOWN_UNTIL = 0.0


def _billing_cooldown_seconds() -> float:
    raw = os.environ.get("CHICO_OLLAMA_CLOUD_402_COOLDOWN_S", str(_DEFAULT_BILLING_COOLDOWN_S)).strip()
    try:
        return max(0.0, float(raw))
    except ValueError:
        return _DEFAULT_BILLING_COOLDOWN_S


def billing_cooldown_remaining_s() -> float:
    """Segundos restantes de cooldown local apos HTTP 402 no endpoint cloud."""
    if _billing_cooldown_seconds() <= 0.0:
        return 0.0
    with _BILLING_LOCK:
        remaining = _BILLING_COOLDOWN_UNTIL - time.monotonic()
    return max(0.0, remaining)


def reset_ollama_cloud_circuit() -> None:
    """Reseta o cooldown local de faturamento HTTP 402 (util em testes ou apos recarga)."""
    global _BILLING_COOLDOWN_UNTIL
    with _BILLING_LOCK:
        _BILLING_COOLDOWN_UNTIL = 0.0


def _trip_billing_cooldown() -> float:
    global _BILLING_COOLDOWN_UNTIL
    cooldown = _billing_cooldown_seconds()
    if cooldown <= 0.0:
        return 0.0
    with _BILLING_LOCK:
        _BILLING_COOLDOWN_UNTIL = max(_BILLING_COOLDOWN_UNTIL, time.monotonic() + cooldown)
    logger.warning(
        "[ollama-cloud] HTTP 402 recebido; ativando cooldown local de %.0fs para evitar retentativas cegas.",
        cooldown,
    )
    return cooldown


def ollama_api_key() -> str:
    """Chave OLLAMA_API_KEY do ambiente efetivo (env + env_loader via budget)."""
    try:
        from llm.budget import ALL_ENV_VARS  # noqa: PLC0415

        return ALL_ENV_VARS.get("OLLAMA_API_KEY", "").strip()
    except Exception:  # noqa: BLE001
        return os.environ.get("OLLAMA_API_KEY", "").strip()


def is_configured() -> bool:
    """True quando ha OLLAMA_API_KEY real configurada."""
    return bool(ollama_api_key())


def _build_chat_payload(
    model: str,
    system_prompt: str,
    user_prompt: str,
    require_json: bool,
    temperature: float,
    max_tokens: int,
) -> dict:
    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})
    data: dict = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature, "num_predict": max_tokens},
    }
    if require_json:
        data["format"] = "json"
    return data


async def _dispatch_chat_request(
    session: aiohttp.ClientSession,
    url: str,
    data: dict,
    headers: dict[str, str],
    request_kwargs: dict,
) -> tuple[str, dict]:
    try:
        async with session.post(url, json=data, headers=headers, **request_kwargs) as response:
            if response.status == 429:
                retry_delay_s = 0.0
                with contextlib.suppress(ValueError, TypeError):
                    retry_delay_s = float(response.headers.get("Retry-After", "0"))
                raise RuntimeError(f"HTTP 429: RATE_LIMITED retry_after={retry_delay_s:.0f}s")
            body = await response.text()
            if response.status == 402:
                _trip_billing_cooldown()
            if response.status != 200:
                raise RuntimeError(f"HTTP {response.status}: {body[:500]}")
            result = json.loads(body)
            text = result.get("message", {}).get("content", "")
            usage = {
                "prompt_tokens": result.get("prompt_eval_count", 0),
                "completion_tokens": result.get("eval_count", 0),
            }
            return text, usage
    except aiohttp.ClientResponseError as e:
        if e.status == 402:
            _trip_billing_cooldown()
        raise RuntimeError(f"HTTP {e.status}: {e.message}") from e


async def call_ollama_cloud(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs,
) -> tuple[str, dict]:
    """Executa a chamada a API Ollama Cloud com resiliencia SOTA.

    Mesma assinatura de ``call_openrouter``: devolve ``(texto, usage)``.
    O payload segue POST /api/chat com ``stream: false``; o usage e
    normalizado para ``prompt_tokens``/``completion_tokens`` (contadores
    nativos ``prompt_eval_count``/``eval_count`` da API Ollama).
    """
    remaining = billing_cooldown_remaining_s()
    if remaining > 0.0:
        raise RuntimeError(
            f"HTTP 402: Ollama Cloud em cooldown local de faturamento ({remaining:.1f}s restantes); "
            "sem nova tentativa externa."
        )

    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    url = f"{OLLAMA_CLOUD_BASE_URL}/api/chat"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    data = _build_chat_payload(
        model=model,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        require_json=require_json,
        temperature=kwargs.get("temperature", 0.2),
        max_tokens=kwargs.get("max_tokens", 8192),
    )
    request_kwargs: dict = {"timeout": client_timeout} if client_timeout is not None else {}
    timeout_val = client_timeout.total if client_timeout and client_timeout.total else 60.0

    try:
        async with get_api_semaphore():
            return await asyncio.wait_for(
                _dispatch_chat_request(session, url, data, headers, request_kwargs),
                timeout=timeout_val + 5.0,
            )
    except TimeoutError as err:
        raise RuntimeError(
            f"Timeout SOTA: A API Ollama Cloud excedeu o tempo limite ({timeout_val}s) "
            "e a requisicao foi aniquilada para proteger a fila."
        ) from err
    except aiohttp.ClientError as err:
        raise RuntimeError(f"Falha de rede Ollama Cloud ({type(err).__name__}): {err}") from err
