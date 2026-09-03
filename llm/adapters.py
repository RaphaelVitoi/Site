"""Adaptadores de requisicao para Anthropic, OpenAI e Google  SOTA v8.0 GOLD.

Cada adaptador traduz uma entrada do MODEL_REGISTRY no formato de requisicao do
respectivo SDK. A responsabilidade e estreita de proposito: montar kwargs
corretos. Os adaptadores NAO instanciam clientes nem executam chamadas  isso
fica com llm/providers.py, que ja tem a camada de estrategia do projeto.

O valor real aqui e negativo: o que estes adaptadores REMOVEM. Os tres
provedores rejeitam com HTTP 400 parametros de amostragem legados em modelos de
raciocinio, e a Anthropic rejeita tambem budget_tokens. Um dict de kwargs
montado a mao acumula esses campos sem que ninguem perceba, ate a chamada falhar
em producao.
"""

from __future__ import annotations

from typing import Any

from llm.model_registry import AdapterType, ModelCapability, get

# Parametros que NAO podem chegar a um modelo de raciocinio da geracao atual.
# Anthropic (geracao 5), OpenAI (GPT-5.6) e Google (Gemini 3) retornam 400.
SAMPLING_LEGADO: frozenset[str] = frozenset({"temperature", "top_p", "top_k", "presence_penalty", "frequency_penalty"})

# Removido da API Anthropic. Se aparecer, e sinal de codigo escrito contra a
# geracao anterior  ou de alguem seguindo o estudo de fronteira sem verificar.
ANTHROPIC_REMOVIDOS: frozenset[str] = frozenset({"budget_tokens", "thinking_budget"})


class ParametroRejeitadoError(ValueError):
    """Erro local, levantado antes da chamada, no lugar de um 400 remoto."""


def _sanear(kwargs: dict[str, Any], modelo: str, extra: frozenset[str] = frozenset()) -> dict[str, Any]:
    proibidos = sorted((SAMPLING_LEGADO | extra) & kwargs.keys())
    if proibidos:
        raise ParametroRejeitadoError(
            f"{modelo}: {proibidos} nao sao aceitos por este modelo e "
            f"produziriam HTTP 400. Para controlar profundidade use o campo de "
            f"esforco do provedor, nao amostragem."
        )
    return dict(kwargs)


# ==============================================================================
# ANTHROPIC
# ==============================================================================


class AnthropicAdapter:
    """Monta requisicoes para a Messages API da Anthropic (geracao 5).

    Pontos que o estudo de fronteira errava e que este adaptador acerta:

    - **Sem `budget_tokens`.** Removido da API; retorna 400 em Fable 5, Opus 5 e
      Sonnet 5. Profundidade se controla por `output_config.effort`.
    - **Sem beta header de mutacao de ferramentas.** O header citado no estudo
      nao existe. O recurso real para instruir o modelo no meio da conversa sem
      quebrar o cache e a *mid-conversation system message*: um bloco
      `{"role": "system"}` anexado a `messages[]`, sem beta header nenhum,
      disponivel em Opus 5 e Fable 5 mas **nao** em Sonnet 5.
    - **`server-side-fallback-2026-07-01` e real** e vai por padrao em Opus 5 e
      Fable 5, junto de `fallbacks="default"`, para tratar
      `stop_reason == "refusal"` sem manter lista de modelos a mao.
    """

    @staticmethod
    def build(
        alias: str,
        messages: list[dict[str, Any]],
        *,
        max_tokens: int | None = None,
        system: str | list[dict[str, Any]] | None = None,
        tools: list[dict[str, Any]] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        cap = get(alias)
        if cap.adapter is not AdapterType.ANTHROPIC:
            raise ParametroRejeitadoError(f"{alias} nao e um modelo Anthropic.")

        req = _sanear(kwargs, cap.model_name, ANTHROPIC_REMOVIDOS)
        req["model"] = cap.model_name
        req["messages"] = messages
        req["max_tokens"] = min(max_tokens or 16_000, cap.max_output_tokens)

        if system is not None:
            req["system"] = system
        if tools:
            req["tools"] = tools

        # Thinking adaptativo  o unico modo aceito. Profundidade via effort.
        if cap.thinking_adaptive:
            req["thinking"] = {"type": "adaptive"}
        if cap.effort:
            req.setdefault("output_config", {})["effort"] = cap.effort

        if cap.beta_headers:
            req["betas"] = list(cap.beta_headers)
        if cap.server_side_fallback:
            req["fallbacks"] = "default"

        return req

    @staticmethod
    def precisa_streaming(alias: str, max_tokens: int) -> bool:
        """Saidas grandes estouram o timeout HTTP do SDK sem streaming."""
        cap = get(alias)
        limite = cap.requires_streaming_above
        return limite is not None and max_tokens > limite

    @staticmethod
    def e_geracao_atual(alias: str) -> bool:
        """O alias esta no registro E e Anthropic.

        Existe porque nem toda chamada Anthropic do projeto vai para a geracao 5:
        `cli/commands.py` valida chave de API com `claude-3-haiku-20240307`, que
        e geracao 3, nao esta no registro e ACEITA amostragem legada. Sanear
        aquele ping como se fosse Opus 5 removeria `temperature` de um modelo que
        o aceita, e o caminho legado deixaria de funcionar sem que nada acusasse.

        A pergunta certa nunca foi "o codigo manda temperature?", e sim "manda
        para um modelo que a rejeita?".
        """
        try:
            return get(alias).adapter is AdapterType.ANTHROPIC
        except KeyError:
            return False

    @staticmethod
    def build_http(
        alias: str,
        messages: list[dict[str, Any]],
        *,
        max_tokens: int | None = None,
        system: str | list[dict[str, Any]] | None = None,
        tools: list[dict[str, Any]] | None = None,
        **kwargs: Any,
    ) -> tuple[dict[str, Any], dict[str, str]]:
        """`build()` traduzido para HTTP cru: devolve (corpo, headers_extra).

        `build()` monta o payload do SDK, onde `betas` e argumento nomeado de
        `client.beta.messages.create`. No HTTP cru esse campo NAO existe no
        corpo: vira o header `anthropic-beta`. Mandar `betas` dentro do JSON e
        um 400 silencioso  o servidor recusa campo desconhecido, e o beta que
        se queria ativar nunca chega. `fallbacks`, ao contrario, e campo de
        corpo e permanece onde esta.
        """
        req = AnthropicAdapter.build(
            alias, messages, max_tokens=max_tokens, system=system, tools=tools, **kwargs
        )
        betas = req.pop("betas", None)
        headers = {"anthropic-beta": ", ".join(betas)} if betas else {}
        return req, headers

    @staticmethod
    def extrair_texto(resposta: Any) -> str:
        """O primeiro bloco de `content` nao e necessariamente o texto.

        Com thinking adaptativo  ligado por PADRAO em Opus 5  o bloco 0 costuma
        ser `thinking`, que nao tem chave `text`. Indexar `content[0]["text"]`
        levanta KeyError exatamente nos modelos para os quais este projeto
        roteia. E `display` omitido nao ajuda: o texto vem vazio, mas o bloco
        continua existindo.

        Aceita dict (HTTP cru) e objeto do SDK.
        """
        blocos = resposta.get("content") if isinstance(resposta, dict) else getattr(resposta, "content", None)
        partes: list[str] = []
        for bloco in blocos or []:
            tipo = bloco.get("type") if isinstance(bloco, dict) else getattr(bloco, "type", None)
            if tipo != "text":
                continue
            texto = bloco.get("text") if isinstance(bloco, dict) else getattr(bloco, "text", "")
            if texto:
                partes.append(texto)
        return "".join(partes)

    @staticmethod
    def instrucao_mid_conversation(alias: str, texto: str) -> dict[str, Any]:
        """Bloco de instrucao do operador que NAO invalida o prefixo cacheado.

        Substitui o mecanismo inexistente proposto no estudo. Anexar ao final de
        `messages[]`; deve vir depois de uma mensagem `user` e nunca ser o
        primeiro elemento.
        """
        cap = get(alias)
        if not cap.supports_mid_conversation_system:
            raise ParametroRejeitadoError(
                f"{cap.model_name} nao suporta mid-conversation system message. "
                "Disponivel em Opus 5 e Fable 5; ausente em Sonnet 5."
            )
        return {"role": "system", "content": texto}

    @staticmethod
    def houve_recusa(response: Any) -> bool:
        """`stop_reason == 'refusal'` chega como HTTP 200. Checar antes de ler
        `content`, ou o codigo trata uma recusa como resposta vazia.

        Aceita dict (HTTP cru) e objeto do SDK: a versao anterior so fazia
        `getattr`, entao devolvia False para TODA resposta vinda de
        `await response.json()`  isto e, para os dois unicos caminhos de chamada
        Anthropic que este projeto executa.
        """
        if isinstance(response, dict):
            return response.get("stop_reason") == "refusal"
        return getattr(response, "stop_reason", None) == "refusal"

    @staticmethod
    def motivo_da_recusa(response: Any) -> str:
        """Categoria e explicacao de `stop_details`, quando houver.

        `stop_details` so vem preenchido quando `stop_reason == 'refusal'`; em
        qualquer outro caso e nulo, e ler seus campos sem checar antes levanta.
        """
        detalhes = response.get("stop_details") if isinstance(response, dict) else getattr(response, "stop_details", None)
        if not detalhes:
            return "recusa sem stop_details"
        if isinstance(detalhes, dict):
            categoria, explicacao = detalhes.get("category"), detalhes.get("explanation")
        else:
            categoria, explicacao = getattr(detalhes, "category", None), getattr(detalhes, "explanation", None)
        return f"{categoria or 'categoria nao declarada'}: {explicacao or 'sem explicacao'}"


# ==============================================================================
# OPENAI
# ==============================================================================


class OpenAIAdapter:
    """Monta requisicoes para a familia GPT-5.6.

    O estudo acertou o diagnostico  parametros de amostragem legados provocam
    400 em modelos de raciocinio  mas errou a escala de esforco: usa `"ultra"`,
    valor que nao aparece na documentacao. A escala vai de `none` a `max`.
    """

    @staticmethod
    def build(
        alias: str,
        messages: list[dict[str, Any]],
        *,
        max_output_tokens: int | None = None,
        tools: list[dict[str, Any]] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        cap = get(alias)
        if cap.adapter is not AdapterType.OPENAI:
            raise ParametroRejeitadoError(f"{alias} nao e um modelo OpenAI.")

        req = _sanear(kwargs, cap.model_name)
        req["model"] = cap.model_name
        req["input"] = messages
        req["max_output_tokens"] = min(max_output_tokens or 16_000, cap.max_output_tokens)

        if cap.reasoning_effort:
            req["reasoning"] = {"effort": cap.reasoning_effort}
        if tools:
            req["tools"] = tools

        return req


# ==============================================================================
# GOOGLE
# ==============================================================================


def aplicar_padding_neutro(
    contents: list[dict[str, Any]],
    token_count_estimate: int | None = None,
    force: bool = False,
) -> list[dict[str, Any]]:
    """Adiciona padding neutro de 50 a 100 tokens ao final do prompt caso o

    tamanho esteja na zona de borda (32k a 40k tokens), forcando o reenquadramento
    da janela de contexto no cluster do provedor.
    """
    total_chars = sum(
        len(part.get("text", ""))
        for item in contents
        for part in item.get("parts", [])
        if isinstance(part, dict) and "text" in part
    )
    est_tokens = token_count_estimate or (total_chars // 4)

    if force or (32_000 <= est_tokens <= 40_000):
        padding_text = "\n\n<!-- SOTA_CONTEXT_ALIGNMENT: " + ("padding " * 75) + "-->\n"
        contents_copy = [dict(c) for c in contents]
        if contents_copy and "parts" in contents_copy[-1]:
            last_parts = list(contents_copy[-1]["parts"])
            if last_parts and isinstance(last_parts[-1], dict) and "text" in last_parts[-1]:
                last_parts[-1] = dict(last_parts[-1])
                last_parts[-1]["text"] = last_parts[-1]["text"] + padding_text
                contents_copy[-1]["parts"] = last_parts
                return contents_copy
    return contents


class GoogleGenAIAdapter:
    """Monta requisicoes para Gemini 3.x via google-genai.

    Correcao relevante sobre o estudo: nao existe campo `include_thoughts`. As
    *thought signatures* funcionam em dois modos

      - **stateful** (recomendado): o servidor gerencia as assinaturas; o
        cliente nao faz nada;
      - **stateless**: e obrigatorio reenviar os blocos `thought` exatamente
        como recebidos, ou o modelo perde continuidade de raciocinio.

    O estudo descreve uma re-injecao manual de assinatura que corresponde,
    parcialmente, ao modo stateless  e o apresenta como se fosse o unico.
    """

    @staticmethod
    def build(
        alias: str,
        contents: list[dict[str, Any]],
        *,
        max_output_tokens: int | None = None,
        tools: list[dict[str, Any]] | None = None,
        auto_context_padding: bool = True,
        **kwargs: Any,
    ) -> dict[str, Any]:
        cap = get(alias)
        if cap.adapter is not AdapterType.GOOGLE:
            raise ParametroRejeitadoError(f"{alias} nao e um modelo Google.")

        req = _sanear(kwargs, cap.model_name)
        req["model"] = cap.model_name

        # Padding Neutro para Limites de Contexto (32k a 40k)
        if auto_context_padding:
            contents = aplicar_padding_neutro(contents)
        req["contents"] = contents

        # thinking_level vai DENTRO de generation_config, nao no topo.
        gen: dict[str, Any] = dict(req.pop("generation_config", {}) or {})

        # Gestao de Latencia via Thinking Level
        thinking_level = kwargs.get("thinking_level") or gen.get("thinking_level") or cap.thinking_level
        if thinking_level:
            gen["thinking_level"] = thinking_level

        # Controle de Custo por Payload JSON (response_schema / application/json)
        is_json_payload = (
            "response_schema" in gen
            or "response_schema" in req
            or gen.get("response_mime_type") == "application/json"
            or req.get("response_mime_type") == "application/json"
        )
        default_ceiling = 2048 if is_json_payload else 16_000
        gen["max_output_tokens"] = min(max_output_tokens or default_ceiling, cap.max_output_tokens)
        req["generation_config"] = gen

        if tools:
            req["tools"] = tools

        return req

    @staticmethod
    def preservar_assinaturas(alias: str, steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """No modo stateless, devolve os blocos `thought` intactos para reenvio.

        Nao normaliza, nao reordena e nao reserializa: qualquer alteracao
        invalida a assinatura criptografica.
        """
        cap = get(alias)
        if cap.thought_signature_mode != "stateless":
            return []
        return [s for s in steps if s.get("type") == "thought"]


ADAPTERS: dict[AdapterType, type] = {
    AdapterType.ANTHROPIC: AnthropicAdapter,
    AdapterType.OPENAI: OpenAIAdapter,
    AdapterType.GOOGLE: GoogleGenAIAdapter,
}


def build_request(alias: str, payload: list[dict[str, Any]], **kwargs: Any) -> dict[str, Any]:
    """Ponto de entrada agnostico de provedor."""
    return ADAPTERS[get(alias).adapter].build(alias, payload, **kwargs)


def resolve_capability(alias: str) -> ModelCapability:
    return get(alias)


__all__ = [
    "AnthropicAdapter",
    "OpenAIAdapter",
    "GoogleGenAIAdapter",
    "ADAPTERS",
    "ParametroRejeitadoError",
    "SAMPLING_LEGADO",
    "ANTHROPIC_REMOVIDOS",
    "build_request",
    "resolve_capability",
    "aplicar_padding_neutro",
]
