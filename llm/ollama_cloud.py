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

import aiohttp

from llm.session import get_api_semaphore

__all__ = [
    "OLLAMA_CLOUD_BASE_URL",
    "DEFAULT_OLLAMA_CLOUD_MODEL",
    "ollama_api_key",
    "is_configured",
    "call_ollama_cloud",
]

logger = logging.getLogger(__name__)

OLLAMA_CLOUD_BASE_URL = "https://ollama.com"
DEFAULT_OLLAMA_CLOUD_MODEL = "glm-5.3-flash"


def ollama_api_key() -> str:
    """Chave OLLAMA_API_KEY do ambiente efetivo (env + env_loader via budget)."""
    try:
        from llm.budget import ALL_ENV_VARS  # noqa: PLC0415

        return str(ALL_ENV_VARS.get("OLLAMA_API_KEY", "")).strip()
    except Exception:  # noqa: BLE001
        return os.environ.get("OLLAMA_API_KEY", "").strip()


def is_configured() -> bool:
    """True quando ha OLLAMA_API_KEY real configurada."""
    return bool(ollama_api_key())


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
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    url = f"{OLLAMA_CLOUD_BASE_URL}/api/chat"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})
    data = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": kwargs.get("temperature", 0.2),
            "num_predict": kwargs.get("max_tokens", 8192),
        },
    }
    if require_json:
        data["format"] = "json"
    request_kwargs: dict = {"timeout": client_timeout} if client_timeout is not None else {}

    timeout_val = client_timeout.total if client_timeout and client_timeout.total else 60.0

    async def _make_request():
        response = None
        try:
            async with session.post(url, json=data, headers=headers, **request_kwargs) as response:
                if response.status == 429:
                    retry_delay_s = 0.0
                    with contextlib.suppress(ValueError, TypeError):
                        retry_delay_s = float(response.headers.get("Retry-After", "0"))
                    raise RuntimeError(f"HTTP 429: RATE_LIMITED retry_after={retry_delay_s:.0f}s")
                body = await response.text()
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
            raise RuntimeError(f"HTTP {e.status}: {e.message}") from e

    try:
        async with get_api_semaphore():
            return await asyncio.wait_for(_make_request(), timeout=timeout_val + 5.0)
    except (TimeoutError, aiohttp.ClientError) as err:
        raise RuntimeError(
            f"Timeout SOTA: A API Ollama Cloud excedeu o tempo limite ({timeout_val}s) "
            "e a requisicao foi aniquilada para proteger a fila."
        ) from err
