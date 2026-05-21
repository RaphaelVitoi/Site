"""Ponte de requisição aiohttp (assíncrona) para o Oráculo de Borda (Gemma 4)."""

import logging
import aiohttp
from typing import Any

logger = logging.getLogger(__name__)


async def call_gemma_local(
    session: aiohttp.ClientSession,
    model: str,  # pylint: disable=unused-argument # NOSONAR
    system_prompt: str,
    user_prompt: str,
    key: str,  # pylint: disable=unused-argument # NOSONAR
    timeout: aiohttp.ClientTimeout | None = None,  # NOSONAR
    require_json: bool = False,  # pylint: disable=unused-argument # NOSONAR
    **kwargs: Any,
) -> tuple[str, dict[str, Any]]:
    """
    Consome o motor de inferência local @gemma4 (Gemma 2/4 FastAPI Server).
    """
    url = "http://127.0.0.1:17043/generate"

    payload = {
        "prompt": f"{system_prompt}\n\n[CONTEXTO]:\n{user_prompt}",
        "max_tokens": kwargs.get("max_tokens", 1024),
    }

    headers = {"X-Vitoi-Auth": "sota-token-2026", "Content-Type": "application/json"}

    try:
        async with session.post(
            url, json=payload, headers=headers, timeout=timeout
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise RuntimeError(f"Gemma Local Error {response.status}: {error_text}")

            # O servidor gemma_server.py retorna stream raw ou texto plano.
            # Como o orchestrator espera a resposta completa:
            text = await response.text()

            # Metadados de uso ficticios (Local não consome tokens de API paga)
            usage = {
                "promptTokenCount": len(user_prompt) // 4,
                "candidatesTokenCount": len(text) // 4,
            }

            return text, usage

    except aiohttp.ClientConnectorError as e:
        raise ConnectionError(
            "Motor Gemma Offline. Inicie via 'nexus-cli start-gemma'."
        ) from e
    except Exception as e:
        logger.exception("[GEMMA-LOCAL] Erro na inferencia: %s", e)
        raise
