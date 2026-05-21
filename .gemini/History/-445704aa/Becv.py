import asyncio
import aiohttp
import logging
from typing import Tuple, Optional

from llm.session import get_api_semaphore


# Chama a API da Anthropic para gerar conteudo.
async def call_anthropic(session: aiohttp.ClientSession, model: str, system_prompt: str, user_prompt: str, api_key: str, timeout: Optional[aiohttp.ClientTimeout] = None, require_json: bool = False, **kwargs) -> Tuple[str, dict]:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01'
    }
    data = {
        "model": model,
        "max_tokens": kwargs.get("max_tokens", 8192),
        "temperature": kwargs.get("temperature", 0.2),
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}]
    }
    request_kwargs: dict = {"timeout": timeout} if timeout is not None else {}
    response = None
    try:
        async with get_api_semaphore():
            async with session.post(url, json=data, headers=headers, **request_kwargs) as response:
                if response.status == 429:
                    retry_delay_s = 0.0
                    try:
                        retry_delay_s = float(response.headers.get("Retry-After", "0"))
                    except (ValueError, TypeError):
                        pass
                    raise RuntimeError(f"HTTP 429: RATE_LIMITED retry_after={retry_delay_s:.0f}s")
                response.raise_for_status()
                result = await response.json()

                text = result['content'][0]['text']
                usage = result.get('usage', {})
                return text, usage
    except aiohttp.ClientResponseError as e:
        error_body = await response.text() if response else ""
        raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}")
