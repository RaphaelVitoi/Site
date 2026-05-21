import asyncio
import aiohttp

from llm.session import get_api_semaphore


# Chama a API da Anthropic para gerar conteudo.
async def call_anthropic(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    client_timeout: aiohttp.ClientTimeout | None = None,
    **kwargs,
) -> tuple[str, dict]:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    }
    data = {
        "model": model,
        "max_tokens": kwargs.get("max_tokens", 8192),
        "temperature": kwargs.get("temperature", 0.2),
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    request_kwargs: dict = (
        {"timeout": client_timeout} if client_timeout is not None else {}
    )

    timeout_val = (
        client_timeout.total if client_timeout and client_timeout.total else 60.0
    )

    async def _make_request():
        response = None
        try:
            async with session.post(
                url, json=data, headers=headers, **request_kwargs
            ) as response:
                if response.status == 429:
                    retry_delay_s = 0.0
                    try:
                        retry_delay_s = float(response.headers.get("Retry-After", "0"))
                    except (ValueError, TypeError):
                        pass
                    raise RuntimeError(
                        f"HTTP 429: RATE_LIMITED retry_after={retry_delay_s:.0f}s"
                    )
                response.raise_for_status()
                result = await response.json()

                text = result["content"][0]["text"]
                usage = result.get("usage", {})
                return text, usage
        except aiohttp.ClientResponseError as e:
            error_body = await response.text() if response else ""
            raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}") from e

    try:
        async with get_api_semaphore():
            return await asyncio.wait_for(_make_request(), timeout=timeout_val + 5.0)
    except asyncio.TimeoutError as err:
        raise RuntimeError(
            f"Timeout SOTA: A API Anthropic excedeu o tempo limite ({timeout_val}s) e a requisicao foi aniquilada para proteger a fila."
        ) from err
