import aiohttp

from llm.session import get_api_semaphore


async def call_openrouter(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs,
) -> tuple[str, dict]:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": kwargs.get("temperature", 0.2),
        "max_tokens": kwargs.get("max_tokens", 8192),
    }
    if require_json:
        data["response_format"] = {"type": "json_object"}
    request_kwargs: dict = (
        {"timeout": client_timeout} if client_timeout is not None else {}
    )
    response = None
    try:
        async with (
            get_api_semaphore(),
            session.post(url, json=data, headers=headers, **request_kwargs) as response,
        ):
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
            text = result["choices"][0]["message"]["content"]
            usage = result.get("usage", {})
            return text, usage
    except aiohttp.ClientResponseError as e:
        error_body = await response.text() if response else ""
        raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}")
