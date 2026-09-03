# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long

import asyncio
import contextlib

import aiohttp

from llm.adapters import AnthropicAdapter, ParametroRejeitadoError
from llm.session import get_api_semaphore


def _montar(model: str, system_prompt: str, user_prompt: str, kwargs: dict) -> tuple[dict, dict]:
    """Devolve (corpo, headers_extra) para o modelo pedido.

    Dois caminhos, e a escolha e do registro  nao de uma heuristica de nome:

    - **Geracao 5** (`claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`): passa
      pelo `AnthropicAdapter`, que remove amostragem legada, liga thinking
      adaptativo, aplica `effort` e converte `betas` em header.
    - **Legado** (`claude-3-haiku-20240307`, usado pelo ping de chave em
      `cli/commands.py`): caminho preservado, `temperature` incluida. Geracao 3
      aceita amostragem, e sanea-la quebraria a validacao de chave.

    A regra que isto corrige nao era "nao mandar temperature", era "nao mandar
    temperature para quem a rejeita com 400".
    """
    mensagens = [{"role": "user", "content": user_prompt}]

    if not AnthropicAdapter.e_geracao_atual(model):
        corpo = {
            "model": model,
            "max_tokens": kwargs.get("max_tokens", 8192),
            "temperature": kwargs.get("temperature", 0.2),
            "system": system_prompt,
            "messages": mensagens,
        }
        return corpo, {}

    max_tokens = kwargs.get("max_tokens")
    corpo, headers_extra = AnthropicAdapter.build_http(
        model, mensagens, max_tokens=max_tokens, system=system_prompt
    )
    # Erro local no lugar de um timeout remoto: acima deste teto a API exige
    # streaming, e este caminho e requisicao unica.
    if AnthropicAdapter.precisa_streaming(model, corpo["max_tokens"]):
        raise ParametroRejeitadoError(
            f"{model}: max_tokens={corpo['max_tokens']} exige streaming, e "
            f"call_anthropic faz requisicao unica. Reduza max_tokens ou use um "
            f"caminho com streaming."
        )
    return corpo, headers_extra


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
    data, headers_extra = _montar(model, system_prompt, user_prompt, kwargs)
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        **headers_extra,
    }
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
                response.raise_for_status()
                result = await response.json()

                if AnthropicAdapter.houve_recusa(result):
                    raise RuntimeError(f"Recusa da Anthropic (HTTP 200): {AnthropicAdapter.motivo_da_recusa(result)}")

                text = AnthropicAdapter.extrair_texto(result)
                usage = result.get("usage", {})
                return text, usage
        except aiohttp.ClientResponseError as e:
            error_body = await response.text() if response else ""
            raise RuntimeError(f"HTTP {e.status}: {e.message} - {error_body}") from e

    try:
        async with get_api_semaphore():
            return await asyncio.wait_for(_make_request(), timeout=timeout_val + 5.0)
    except (TimeoutError, aiohttp.ClientError) as err:
        raise RuntimeError(
            f"Timeout SOTA: A API Anthropic excedeu o tempo limite ({timeout_val}s) e a requisicao foi aniquilada para proteger a fila."
        ) from err
