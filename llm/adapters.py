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

from llm.model_registry import (
    ESFORCOS_OPENAI_VALIDOS,
    AdapterType,
    ModelCapability,
    get,
)

# Parametros que NAO podem chegar a um modelo de raciocinio da geracao atual.
# Anthropic (geracao 5), OpenAI (GPT-6) e Google (Gemini 4) retornam 400.
SAMPLING_LEGADO: frozenset[str] = frozenset({"temperature", "top_p", "top_k", "presence_penalty", "frequency_penalty"})

# MIME type para payloads JSON estritos
JSON_MIME_TYPE = "application/json"

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
        if not cap.autorizado:
            raise ParametroRejeitadoError(f"{alias} esta catalogado como nao autorizado.")

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
        modelos legados fora do registro (geracoes <5, descontinuadas para rota
        vigente mas ainda enderecaveis por nome) ACEITAM amostragem legada.
        Sanear esses caminhos como se fossem Opus 5 removeria `temperature` de
        um modelo que o aceita, e o caminho legado deixaria de funcionar sem
        que nada acusasse.

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
        req = AnthropicAdapter.build(alias, messages, max_tokens=max_tokens, system=system, tools=tools, **kwargs)
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
        detalhes = (
            response.get("stop_details") if isinstance(response, dict) else getattr(response, "stop_details", None)
        )
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
    """Monta requisicoes para a familia GPT-6.

    O estudo acertou o diagnostico  parametros de amostragem legados provocam
    400 em modelos de raciocinio  mas errou a escala de esforco: usa `"ultra"`,
    valor que nao aparece na documentacao. A escala vai de `none` a `max`, e
    ganhou `xhigh` com o GPT-6 Astra em 2026-09-03.

    O que a API ACEITA e o que esta malha AUTORIZA sao dois limites distintos.
    O Astra aceita ate `max`; o Tier 0 autorizou so `low` e `medium`, por
    preco. Quem declara o teto e `ModelCapability.esforcos_autorizados`, e e
    aqui que ele deixa de ser prosa e passa a reprovar chamada.
    """

    @staticmethod
    def build(
        alias: str,
        messages: list[dict[str, Any]],
        *,
        max_output_tokens: int | None = None,
        tools: list[dict[str, Any]] | None = None,
        effort_override: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        cap = get(alias)
        if cap.adapter is not AdapterType.OPENAI:
            raise ParametroRejeitadoError(f"{alias} nao e um modelo OpenAI.")
        if not cap.autorizado:
            raise ParametroRejeitadoError(f"{alias} esta catalogado como nao autorizado.")

        esforco = effort_override or cap.reasoning_effort
        if esforco is not None:
            if esforco not in ESFORCOS_OPENAI_VALIDOS:
                raise ParametroRejeitadoError(
                    f"{alias}: esforco '{esforco}' nao existe na escala da OpenAI {sorted(ESFORCOS_OPENAI_VALIDOS)}."
                )
            if cap.esforcos_autorizados and esforco not in cap.esforcos_autorizados:
                raise ParametroRejeitadoError(
                    f"{alias}: a API aceita '{esforco}', mas esta malha autoriza "
                    f"apenas {list(cap.esforcos_autorizados)}. Elevar o teto e "
                    "decisao de custo do Tier 0, nao do chamador."
                )

        req = _sanear(kwargs, cap.model_name)
        req["model"] = cap.model_name
        req["input"] = messages
        req["max_output_tokens"] = min(max_output_tokens or 16_000, cap.max_output_tokens)

        if esforco:
            req["reasoning"] = {"effort": esforco}
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
    def e_geracao_atual(alias: str) -> bool:
        """Verifica se o alias esta autorizado no registro como modelo Google Gemini."""
        try:
            capability = get(alias)
            return capability.adapter is AdapterType.GOOGLE and capability.autorizado
        except KeyError:
            return False

    @staticmethod
    def validar_historico(contents: list[dict[str, Any]]) -> None:
        """Rejeita historico terminado com role 'model' ou 'model_output' antes da chamada remota."""
        if not contents:
            return
        last = contents[-1]
        role = last.get("role") or last.get("type")
        if role in ("model", "model_output"):
            raise ParametroRejeitadoError(
                "Google Gemini 3.x: Requisicoes onde o ultimo elemento contem role 'model' "
                "sao ativamente rejeitadas com erro HTTP 400. O ultimo turno deve ser do usuario."
            )

    @staticmethod
    def validar_thinking_level(alias: str, thinking_level: str | None) -> None:
        """Valida niveis de thinking suportados por variante do Gemini."""
        if not thinking_level:
            return
        level_l = thinking_level.lower()
        if level_l not in ("minimal", "low", "medium", "high", "xhigh"):
            raise ParametroRejeitadoError(
                f"{alias}: thinking_level '{thinking_level}' nao existe na API Google. "
                "Use 'minimal', 'low', 'medium', 'high' ou 'xhigh'."
            )
        if level_l == "xhigh" and alias not in ("gemini-4-neon", "gemini-4-hydrogen"):
            raise ParametroRejeitadoError(
                f"{alias}: thinking_level 'xhigh' nao existe para este modelo "
                "(exclusivo de gemini-4-neon e gemini-4-hydrogen)."
            )
        if (
            alias
            in (
                "gemini-3.8-flash",
                "gemini-pro-latest",
                "gemini-3.1-pro-preview-customtools",
                "gemini-3.1-pro-preview",
                "gemini-4-argon",
                "gemini-4-carbon",
                "gemini-4-neon",
                "gemini-4-hydrogen",
            )
            and level_l == "minimal"
        ):
            raise ParametroRejeitadoError(
                f"{alias} nao aceita thinking_level 'minimal'. Use 'low', 'medium' ou 'high'."
            )

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
        if not cap.autorizado:
            raise ParametroRejeitadoError(f"{alias} esta catalogado como nao autorizado.")

        GoogleGenAIAdapter.validar_historico(contents)

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
            GoogleGenAIAdapter.validar_thinking_level(alias, thinking_level)
            gen["thinking_level"] = thinking_level

        # Suporte a thinking_budget em kwargs
        thinking_budget = kwargs.get("thinking_budget") or gen.get("thinking_budget")
        if thinking_budget:
            gen.setdefault("thinking_config", {})["thinking_budget"] = thinking_budget

        # Controle de Custo por Payload JSON (response_schema / application/json)
        is_json_payload = (
            "response_schema" in gen
            or "response_schema" in req
            or gen.get("response_mime_type") == JSON_MIME_TYPE
            or req.get("response_mime_type") == JSON_MIME_TYPE
        )
        default_ceiling = 2048 if is_json_payload else 16_000
        gen["max_output_tokens"] = min(max_output_tokens or default_ceiling, cap.max_output_tokens)
        req["generation_config"] = gen

        if tools:
            req["tools"] = tools

        return req

    @staticmethod
    def _build_thinking_config(gen: dict[str, Any], kwargs: dict[str, Any]) -> dict[str, Any]:
        """Constroi configuracao de Extended Thinking para a API REST."""
        thinking_cfg: dict[str, Any] = {}
        if "thinking_level" in gen:
            thinking_cfg["thinkingLevel"] = gen.pop("thinking_level").upper()
        if "thinking_config" in gen:
            tc = gen.pop("thinking_config")
            if "thinking_budget" in tc:
                thinking_cfg["thinkingBudget"] = tc["thinking_budget"]
        if "thinking_budget" in kwargs:
            thinking_cfg["thinkingBudget"] = kwargs["thinking_budget"]
        return thinking_cfg

    @staticmethod
    def _apply_max_output_tokens(gen: dict[str, Any]) -> None:
        """Aplica e converte max_output_tokens para formato REST."""
        if "max_output_tokens" in gen:
            gen["maxOutputTokens"] = gen.pop("max_output_tokens")

    @classmethod
    def build_http(
        cls,
        alias: str,
        contents: list[dict[str, Any]],
        *,
        system_instruction: str | None = None,
        max_output_tokens: int | None = None,
        require_json: bool = False,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Gera payload REST puro para generativelanguage.googleapis.com sem parametros legados."""
        req = cls.build(alias, contents, max_output_tokens=max_output_tokens, **kwargs)
        gen = dict(req.get("generation_config", {}))
        if require_json:
            gen["responseMimeType"] = JSON_MIME_TYPE

        thinking_cfg = cls._build_thinking_config(gen, kwargs)
        if thinking_cfg:
            gen["thinkingConfig"] = thinking_cfg

        cls._apply_max_output_tokens(gen)

        payload: dict[str, Any] = {
            "contents": req["contents"],
            "generationConfig": gen,
        }
        if system_instruction:
            payload["system_instruction"] = {"parts": [{"text": system_instruction}]}
        cached_content = kwargs.get("cached_content") or kwargs.get("cachedContent") or req.get("cached_content")
        if cached_content:
            payload["cachedContent"] = str(cached_content)
        return payload

    @staticmethod
    def _extrair_de_parte(p: Any) -> str | None:
        """Extrai texto de uma parte se nao for thought block."""
        if isinstance(p, dict):
            if p.get("thought", False):
                return None
            return p.get("text") or None
        txt = getattr(p, "text", "")
        if not txt:
            return None
        if getattr(p, "thought", False):
            return None
        return txt

    @staticmethod
    def extrair_texto(resposta: Any) -> str:
        """Extrai partes de texto candidatas, ignorando thought blocks e assinaturas."""
        candidates = resposta.get("candidates") if isinstance(resposta, dict) else getattr(resposta, "candidates", None)
        if not candidates:
            return ""
        cand0 = candidates[0]
        content = cand0.get("content") if isinstance(cand0, dict) else getattr(cand0, "content", None)
        if not content:
            return ""
        parts = content.get("parts") if isinstance(content, dict) else getattr(content, "parts", None)
        textos: list[str] = []
        for p in parts or []:
            txt = GoogleGenAIAdapter._extrair_de_parte(p)
            if txt:
                textos.append(txt)
        return "".join(textos)

    @staticmethod
    def _validar_interactions(
        alias: str,
        cap: ModelCapability,
        kwargs: dict[str, Any],
        previous_interaction_id: str | None,
        background: bool,
        store: bool,
    ) -> None:
        if cap.adapter is not AdapterType.GOOGLE:
            raise ParametroRejeitadoError(f"{alias} nao e um modelo Google.")
        if not cap.autorizado:
            raise ParametroRejeitadoError(f"{alias} esta catalogado como nao autorizado.")
        if "cached_content" in kwargs or "cachedContent" in kwargs:
            raise ParametroRejeitadoError(
                f"{alias}: Interactions API e Gemini 4 suportam apenas Implicit Caching "
                "(>=4096 tokens); explicit caching (cached_content) nao e suportado."
            )
        if not store and (previous_interaction_id or background):
            raise ParametroRejeitadoError(
                "Interactions API: store=False e incompativel com previous_interaction_id e background=True."
            )

    @classmethod
    def _build_interactions_tools(
        cls,
        tools: list[dict[str, Any]] | None,
        relevant_tools: set[str] | None,
        enable_tool_retrieval: bool,
    ) -> list[dict[str, Any]] | None:
        if not tools:
            return None
        resolved_tools = list(tools)
        if not enable_tool_retrieval:
            return resolved_tools

        from llm.routing_policy import plano_de_ferramentas  # noqa: PLC0415

        resolved_tools = plano_de_ferramentas(resolved_tools, relevant_tools or set())
        has_deferred = any(bool(tool.get("defer_loading")) for tool in resolved_tools)
        has_search = any(
            str(tool.get("type", "")) == "tool_search" or str(tool.get("type", "")).startswith("tool_search_tool_")
            for tool in resolved_tools
        )
        if has_deferred and not has_search:
            resolved_tools.append({"type": "tool_search"})
        return resolved_tools

    @classmethod
    def build_interactions(
        cls,
        alias: str,
        input_payload: str | list[dict[str, Any]],
        *,
        previous_interaction_id: str | None = None,
        system_instruction: str | None = None,
        tools: list[dict[str, Any]] | None = None,
        relevant_tools: set[str] | None = None,
        enable_tool_retrieval: bool = False,
        max_output_tokens: int | None = None,
        background: bool = False,
        thinking_level: str | None = None,
        service_tier: str | None = None,
        store: bool = True,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Monta payload oficial para a Interactions API (Gemini 4 / 3.x).

        Regras aplicadas:
          - Implicit Caching only: rejeita `cached_content` / `cachedContent`;
          - `store=False` e incompativel com `previous_interaction_id` e `background=True`;
          - Long Decode (>65536 ate 1M) exige `background=True` ou `automatic_continuation=True`;
          - Tool Retrieval opcional (`defer_loading: true` + `{"type": "tool_search"}`).
        """
        cap = get(alias)
        cls._validar_interactions(alias, cap, kwargs, previous_interaction_id, background, store)

        automatic_continuation = bool(kwargs.pop("automatic_continuation", True))
        req = _sanear(kwargs, cap.model_name)
        gen: dict[str, Any] = dict(req.pop("generation_config", {}) or {})

        level = thinking_level or gen.get("thinking_level") or cap.thinking_level
        if level:
            cls.validar_thinking_level(alias, level)
            gen["thinking_level"] = level

        ceiling = cap.context_window_in if (background or automatic_continuation) else cap.max_output_tokens
        gen["max_output_tokens"] = min(max_output_tokens or 16_000, ceiling)

        req["model"] = cap.model_name
        req["input"] = input_payload
        req["store"] = store
        req["generation_config"] = gen

        if previous_interaction_id:
            req["previous_interaction_id"] = previous_interaction_id
        if system_instruction:
            req["system_instruction"] = system_instruction
        if background:
            req["background"] = True
        if service_tier is not None:
            if service_tier not in ("standard", "flex", "priority"):
                raise ParametroRejeitadoError(
                    f"service_tier '{service_tier}' invalido. Use 'standard', 'flex' ou 'priority'."
                )
            req["service_tier"] = service_tier

        resolved_tools = cls._build_interactions_tools(tools, relevant_tools, enable_tool_retrieval)
        if resolved_tools is not None:
            req["tools"] = resolved_tools

        return req

    @staticmethod
    def preservar_assinaturas(alias: str, steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """No modo stateless, devolve blocos `thought` e steps de ferramentas com assinatura intactos.

        Nao normaliza, nao reordena e nao reserializa: qualquer alteracao
        invalida a assinatura criptografica.
        """
        cap = get(alias)
        if cap.thought_signature_mode != "stateless":
            return []
        return [
            s
            for s in steps
            if s.get("type") == "thought"
            or ("signature" in s and s.get("type") in ("tool_call", "tool_result", "function_call", "function_result"))
        ]


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
