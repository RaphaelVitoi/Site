"""Registro unificado de modelos de fronteira  SOTA v8.0 GOLD.

Fonte: estudo de fronteira de 2026-08-21, **verificado campo a campo** contra
documentacao autoritativa antes de virar codigo. As divergencias encontradas
estao anotadas em CORRECOES_APLICADAS e nos comentarios de cada entrada.

O estudo original, se aplicado literalmente, produziria HTTP 400 em toda
chamada Anthropic (usava `budget_tokens`, removido da API) e subestimaria o
preco do GPT-5.6 Luna em 5x.

Verificado em 2026-08-21 contra:
  - Anthropic: documentacao oficial da Messages API (skill claude-api)
  - OpenAI...: developers.openai.com/api/docs/models
  - Google...: ai.google.dev/gemini-api/docs/{models,thinking}
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, model_validator

# ==============================================================================
# CORRECOES APLICADAS AO ESTUDO DE FRONTEIRA
# ==============================================================================
# Mantidas em codigo, e nao so no relatorio, porque cada uma corresponde a um
# modo de falha real que voltaria se alguem "restaurasse" o registro original.

CORRECOES_APLICADAS: dict[str, str] = {
    "anthropic.budget_tokens": (
        "CRITICO. O estudo usa thinking={'type':'enabled','budget_tokens':N}. "
        "Esse parametro foi REMOVIDO e retorna HTTP 400 em Fable 5, Opus 5, "
        "Sonnet 5, Opus 4.8 e 4.7. O substituto e thinking={'type':'adaptive'} "
        "combinado com output_config.effort."
    ),
    "anthropic.mid_conversation_tool_changes": (
        "O beta header 'mid-conversation-tool-changes-2026-07-01' NAO consta na "
        "documentacao. O recurso real de instrucao mid-conversation sem "
        "invalidar cache e a mid-conversation SYSTEM MESSAGE: um bloco "
        "{'role':'system'} anexado a messages[], SEM beta header, disponivel em "
        "Opus 5 / Opus 4.8 / Fable 5 / Mythos 5 e NAO em Sonnet 5."
    ),
    "anthropic.server_side_fallback": (
        "CONFIRMADO CORRETO no estudo. 'server-side-fallback-2026-07-01' existe "
        "e deve acompanhar fallbacks='default' em Opus 5 e Fable 5, para tratar "
        "stop_reason='refusal'."
    ),
    "anthropic.sonnet5_max_output": (
        "O estudo diz 64k de saida para Sonnet 5. O correto e 128k, igual a "
        "Opus 5 e Fable 5. Saidas grandes exigem streaming."
    ),
    "anthropic.cache_minimo": (
        "O estudo afirma cache minimo de 512 tokens. O documentado e ~1024; "
        "prefixos menores simplesmente nao sao cacheados, em silencio."
    ),
    "anthropic.sampling": (
        "temperature / top_p / top_k foram REMOVIDOS e retornam 400 nos modelos "
        "da geracao 5. O estudo so menciona isso para a OpenAI."
    ),
    "openai.max_output": (
        "O estudo declara 64k (Sol/Terra) e 32k (Luna). A documentacao indica 128k para as tres variantes."
    ),
    "openai.contexto_luna": (
        "O estudo declara 512k de contexto para a Luna. A documentacao indica 1.05M para as tres variantes."
    ),
    "openai.preco_luna": (
        "CRITICO PARA ORCAMENTO. O estudo declara $1.00/$6.00 por 1M. A "
        "documentacao indica $0.20/$1.20  cinco vezes mais barato. Roteamento "
        "calibrado pelo numero do estudo escalonaria para modelos caros sem "
        "necessidade."
    ),
    "openai.effort_ultra": (
        "O estudo usa max_reasoning_effort='ultra'. A escala documentada vai de "
        "'none' a 'max'; 'ultra' nao aparece. Adotado 'max' e marcado como "
        "requer confirmacao no ambiente antes de uso em producao."
    ),
    "openai.sol_ultrafast": (
        "A variante 'gpt-5.6-sol-ultrafast' (Cerebras, 750 tps) NAO consta na "
        "lista de modelos da documentacao. Mantida fora do registro ativo  "
        "nao se declara como fato o que nao se conseguiu verificar."
    ),
    "google.thinking_level": (
        "CONFIRMADO. thinking_level existe e vai dentro de generation_config. "
        "gemini-3.7-flash aceita low/medium/high (sem 'minimal')."
    ),
    "google.thought_signatures": (
        "O estudo propoe include_thoughts=True e re-injecao manual da assinatura. "
        "O modelo documentado e outro: em modo STATEFUL o servidor gerencia as "
        "assinaturas sozinho; em modo STATELESS voce reenvia os blocos 'thought' "
        "exatamente como recebidos. Nao ha campo include_thoughts documentado."
    ),
}


class AdapterType(str, Enum):
    ANTHROPIC = "AnthropicAdapter"
    OPENAI = "OpenAIAdapter"
    GOOGLE = "GoogleGenAIAdapter"


class VerificationStatus(str, Enum):
    """Procedencia do dado. Nunca tratar INFERIDO como se fosse VERIFICADO."""

    VERIFICADO = "verificado"  # confirmado em doc autoritativa
    NAO_VERIFICADO = "nao_verificado"  # plausivel, sem confirmacao
    CORRIGIDO = "corrigido"  # o estudo errava; valor aqui e o corrigido


class ModelCapability(BaseModel):
    """Capacidade de um modelo, com procedencia explicita de cada bloco."""

    adapter: AdapterType
    model_name: str
    context_window_in: int
    max_output_tokens: int
    price_per_1m_in: float
    price_per_1m_out: float
    verification: VerificationStatus = VerificationStatus.VERIFICADO
    notas: str = ""

    #  Autorizacao -- ortogonal a capacidade
    # Um modelo pode ser plenamente capaz, ter preco verificado, e ainda assim
    # nao ser usado aqui. `verification` responde "este dado e confiavel?";
    # `autorizado` responde "esta malha usa este modelo?". Confundir os dois
    # levaria a marcar como nao verificado o que foi verificado e recusado.
    #
    # ESTADO EM 2026-09-07: nenhum modelo usa `autorizado=False`. Os dois que o
    # usariam -- a familia Fable -- foram RETIRADOS do registro no mesmo dia, e
    # por isso vivem em MODELOS_RETIRADOS. O campo fica como barreira para o
    # caso distinto que ele cobre: modelo que se quer NO catalogo (comparacao
    # de custo, referencia) e fora de ROTA. A lista estar vazia e declarado de
    # proposito -- nao confundir mecanismo presente com protecao exercitada.
    autorizado: bool = True
    motivo_nao_autorizado: str = ""

    # FAIXA DE ACESSO -- o discriminante que preco por token nao captura.
    # True  = alcancavel por cota de assinatura (Faixa.FLAT_FEE / Free Tier), com custo
    #         marginal zero DENTRO da cota; o excedente cai no preco de tabela.
    # False = existe apenas em pay-as-you-go, e todo uso e API_PAGA.
    # Declarado aqui, e nao em `Rota.faixa`, porque e propriedade do MODELO:
    # a rota escolhe a faixa que vai consumir, mas nao inventa acesso que a
    # assinatura nao da. O enum `Faixa` vive em routing_policy, que importa
    # este modulo -- por isso o campo e booleano e nao o enum: declarar o tipo
    # aqui inverteria a direcao da dependencia.
    #
    # LEVANTADO em 2026-09-07 pelo Gemini 3.5 Flash-Lite (delegacao §6):
    # Modelos Anthropic (Opus 5, Sonnet 5, Opus 4.6, Sonnet 4.6), OpenAI (Sol, Terra, Luna)
    # e Google (Gemini 3.8/3.7/3.6/3.5/3.5-Lite) possuem faixas de cota de assinatura web /
    # free tier API. A familia Fable (ver MODELOS_RETIRADOS) e pay-as-you-go exclusivo.
    cota_por_assinatura: bool = True

    #  Anthropic
    # thinking adaptativo e o unico modo suportado na geracao 5.
    # budget_tokens NAO existe aqui de proposito: incluir o campo convidaria
    # alguem a preenche-lo, e o resultado seria 400.
    thinking_adaptive: bool = False
    effort: Literal["low", "medium", "high", "xhigh", "max"] | None = None
    beta_headers: list[str] = Field(default_factory=list)
    server_side_fallback: bool = False
    supports_mid_conversation_system: bool = False
    requires_streaming_above: int | None = None

    #  OpenAI
    # 'xhigh' entrou com o GPT-6 Astra (2026-09-03), entre 'high' e 'max'. A
    # escala anterior nao o tinha; 'ultra' continua fora porque nunca existiu
    # -- era invencao do estudo de fronteira. Ver CORRECOES_APLICADAS.
    reasoning_effort: Literal["none", "low", "medium", "high", "xhigh", "max"] | None = None
    supports_subagents: bool = False

    # Teto de esforco AUTORIZADO nesta malha, que e coisa diferente do que a
    # API aceita. Vazio = sem restricao propria; o limite e o da API.
    esforcos_autorizados: tuple[str, ...] = ()

    #  Google
    thinking_level: Literal["minimal", "low", "medium", "high"] | None = None
    thought_signature_mode: Literal["stateful", "stateless"] | None = None

    #  Comum
    # Em TODOS os tres provedores os modelos de raciocinio rejeitam amostragem
    # legada. Deixar True e o padrao seguro.
    reject_legacy_sampling: bool = True

    @model_validator(mode="after")
    def _coerencia(self) -> ModelCapability:
        if self.adapter is AdapterType.ANTHROPIC and self.effort is None:
            raise ValueError(
                f"{self.model_name}: Anthropic exige 'effort'; sem ele nao ha "
                "como controlar profundidade, pois budget_tokens foi removido."
            )
        if self.adapter is AdapterType.GOOGLE and self.thinking_level is None:
            raise ValueError(f"{self.model_name}: Google exige 'thinking_level'.")
        if self.max_output_tokens > self.context_window_in:
            raise ValueError(f"{self.model_name}: saida maior que o contexto.")
        if self.esforcos_autorizados and self.reasoning_effort not in self.esforcos_autorizados:
            raise ValueError(
                f"{self.model_name}: esforco padrao '{self.reasoning_effort}' esta "
                f"fora do teto autorizado {self.esforcos_autorizados}."
            )
        if not self.autorizado and not self.motivo_nao_autorizado:
            raise ValueError(
                f"{self.model_name}: modelo nao autorizado exige motivo. Recusa "
                "sem motivo registrado vira folclore em duas semanas."
            )
        return self


# ==============================================================================
# REGISTRO
# ==============================================================================

MODEL_REGISTRY: dict[str, ModelCapability] = {
    #  ANTHROPIC  Geracao 5
    "claude-opus-5": ModelCapability(
        adapter=AdapterType.ANTHROPIC,
        model_name="claude-opus-5",
        context_window_in=1_000_000,
        max_output_tokens=131_072,
        price_per_1m_in=5.00,
        price_per_1m_out=25.00,
        thinking_adaptive=True,
        effort="xhigh",
        server_side_fallback=True,
        beta_headers=["server-side-fallback-2026-07-01"],
        supports_mid_conversation_system=True,
        requires_streaming_above=16_000,
        notas="Thinking ligado por padrao. xhigh e o ponto recomendado p/ coding.",
    ),
    "claude-sonnet-5": ModelCapability(
        adapter=AdapterType.ANTHROPIC,
        model_name="claude-sonnet-5",
        context_window_in=1_000_000,
        max_output_tokens=131_072,  # CORRIGIDO: estudo dizia 65_536
        price_per_1m_in=2.00,  # CORRIGIDO 2026-09-07: estava 3.00
        price_per_1m_out=10.00,  # CORRIGIDO 2026-09-07: estava 15.00
        thinking_adaptive=True,
        effort="high",
        supports_mid_conversation_system=False,  # nao suportado em Sonnet 5
        requires_streaming_above=16_000,
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "Saida corrigida p/ 128k. PRECO REAVALIADO em 2026-09-07, como a "
            "nota anterior mandava: ela dizia que $2/$10 era introdutorio e "
            "expirava em 2026-08-31. A data passou e o preco corrente E "
            "$2/$10, sem rotulo de promocao -- $3/$15 e o Sonnet 4.6, nao "
            "este. O registro cobrava 50% a mais do que a Anthropic cobra."
        ),
    ),
    #  ANTHROPIC  Geracao 4.6  disponiveis, FORA do Tier 1
    # O Tier 0 (2026-09-07) confirmou que Opus 4.6 e Sonnet 4.6 estao
    # disponiveis e podem ser usados, mas que o Tier 1 se refere ao Opus 5 e ao
    # Sonnet 5. Ficam aqui como fallback e delegacao economica -- catalogados,
    # nao promovidos. Nenhuma ROTA os usa hoje; entrar em rota e decisao de
    # politica do Tier 0.
    "claude-opus-4-6": ModelCapability(
        adapter=AdapterType.ANTHROPIC,
        model_name="claude-opus-4-6",
        context_window_in=1_000_000,
        max_output_tokens=131_072,
        price_per_1m_in=5.00,
        price_per_1m_out=25.00,
        thinking_adaptive=True,
        effort="high",  # a escala da 4.6 NAO tem 'xhigh'; ele chegou na 4.7
        supports_mid_conversation_system=False,
        requires_streaming_above=16_000,
        # DIFERENCA REAL DE GERACAO, e nao descuido: a 4.6 ACEITA amostragem
        # legada, enquanto a geracao 5 devolve 400. Marcar True aqui faria o
        # adaptador recusar parametro valido.
        reject_legacy_sampling=False,
        verification=VerificationStatus.VERIFICADO,
        notas=(
            "Verificado em 2026-09-07 (skill claude-api + claude.com/pricing). "
            "Disponivel, porem FORA do Tier 1 por decisao do Tier 0: o nucleo "
            "e Opus 5 e Sonnet 5. Utilidade prevista: fallback e delegacao "
            "economica. `budget_tokens` aqui esta DEPRECIADO mas ainda "
            "funcional -- escape transitorio, nao padrao para codigo novo."
        ),
    ),
    "claude-sonnet-4-6": ModelCapability(
        adapter=AdapterType.ANTHROPIC,
        model_name="claude-sonnet-4-6",
        context_window_in=1_000_000,
        max_output_tokens=131_072,
        price_per_1m_in=3.00,
        price_per_1m_out=15.00,
        thinking_adaptive=True,
        effort="high",
        supports_mid_conversation_system=False,
        requires_streaming_above=16_000,
        reject_legacy_sampling=False,
        verification=VerificationStatus.VERIFICADO,
        notas=(
            "Verificado em 2026-09-07. $3/$15 -- ESTE e o modelo que custa "
            "$3/$15, e nao o Sonnet 5, que custa $2/$10. Foi exatamente essa "
            "troca que o registro carregava ate hoje. "
            "Disponivel e fora do Tier 1; candidato a operacoes rapidas e "
            "delegacao economica. Note que o Sonnet 5 e MAIS BARATO que ele: "
            "so preferir a 4.6 com razao declarada que nao seja preco."
        ),
    ),
    #  OPENAI  GPT-5.6
    "gpt-5.6-sol": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-sol",
        context_window_in=1_050_000,
        max_output_tokens=131_072,  # CORRIGIDO: estudo dizia 65_536
        price_per_1m_in=4.00,  # CORRIGIDO 2026-09-07: estava 5.00
        price_per_1m_out=20.00,  # CORRIGIDO 2026-09-07: estava 30.00
        reasoning_effort="max",  # CORRIGIDO: 'ultra' nao existe na escala
        supports_subagents=True,
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "Preco caiu junto com o lancamento do GPT-6 Astra, confirmado "
            "pelo Tier 0: 'Fez parte do upgrade. Sol ficou mais barato'. A "
            "queda INVERTE a comparacao de saida com o Opus 5 ($20 contra "
            "$25) que a rota de GOVERNANCA usava como justificativa."
        ),
    ),
    "gpt-5.6-terra": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-terra",
        context_window_in=1_050_000,
        max_output_tokens=131_072,
        price_per_1m_in=2.00,  # CORRIGIDO: estudo dizia 2.50
        price_per_1m_out=12.00,  # CORRIGIDO: estudo dizia 15.00
        reasoning_effort="high",
        verification=VerificationStatus.CORRIGIDO,
    ),
    "gpt-5.6-luna": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-luna",
        context_window_in=1_050_000,  # CORRIGIDO: estudo dizia 512_000
        max_output_tokens=131_072,  # CORRIGIDO: estudo dizia 32_768
        price_per_1m_in=0.20,  # CORRIGIDO: estudo dizia 1.00
        price_per_1m_out=1.20,  # CORRIGIDO: estudo dizia 6.00
        reasoning_effort="low",
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "Cinco vezes mais barato do que o estudo supunha. Isso desloca o "
            "ponto de equilibrio do roteamento: Luna passa a ser o executor "
            "primario obvio para triagem e sub-agentes."
        ),
    ),
    #  GOOGLE  Gemini 3
    "gemini-3.8-flash": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.8-flash",
        context_window_in=1_048_576,
        max_output_tokens=65_536,
        price_per_1m_in=0.75,
        price_per_1m_out=3.75,
        thinking_level="high",
        thought_signature_mode="stateful",
        verification=VerificationStatus.VERIFICADO,
        notas="Modelo de fronteira da geracao Gemini 3.8 lancado em Setembro/2026. Motor primario do sistema.",
    ),
    "gemini-3.7-flash": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.7-flash",
        context_window_in=1_048_576,
        max_output_tokens=65_536,
        price_per_1m_in=0.75,
        price_per_1m_out=3.75,
        thinking_level="high",
        thought_signature_mode="stateful",
        verification=VerificationStatus.NAO_VERIFICADO,
        notas=(
            "Existencia do modelo e thinking_level VERIFICADOS. Preco e limites "
            "vieram do estudo e nao foram confirmados na pagina de pricing  "
            "tratar como estimativa ate conferir."
        ),
    ),
    "gemini-3.6-flash": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.6-flash",
        context_window_in=1_048_576,
        max_output_tokens=65_536,
        price_per_1m_in=0.50,
        price_per_1m_out=2.50,
        thinking_level="high",
        thought_signature_mode="stateful",
        verification=VerificationStatus.VERIFICADO,
        notas="Circuito de fallback canonico para gemini-3.7-flash em pipelines de extracao JSON estrita.",
    ),
    "gemini-3.5-flash": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.5-flash",
        context_window_in=1_048_576,
        max_output_tokens=65_536,
        price_per_1m_in=0.35,
        price_per_1m_out=1.50,
        thinking_level="high",
        thought_signature_mode="stateful",
        verification=VerificationStatus.VERIFICADO,
        notas="Degrau 3 do circuito de continuidade SOTA.",
    ),
    "gemini-3.5-flash-lite": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.5-flash-lite",
        context_window_in=1_048_576,
        max_output_tokens=65_536,
        price_per_1m_in=0.15,
        price_per_1m_out=0.60,
        thinking_level="low",
        thought_signature_mode="stateless",
        verification=VerificationStatus.VERIFICADO,
        notas="Camada 1: Triagem, parsing rapido e borda de baixa latencia.",
    ),
    "chatgpt-5.6-sol": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-sol",
        context_window_in=1_050_000,
        max_output_tokens=131_072,
        price_per_1m_in=4.00,  # CORRIGIDO 2026-09-07: estava 5.00
        price_per_1m_out=20.00,  # CORRIGIDO 2026-09-07: estava 30.00
        reasoning_effort="max",
        supports_subagents=True,
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "OpenAI Chat GPT 5.6-Sol. Modelo de fronteira analitica e raciocinio "
            "profundo. ALIAS do mesmo model_name que 'gpt-5.6-sol' -- os dois tem "
            "que mudar juntos, ou o custo passa a depender de qual nome o "
            "chamador digitou."
        ),
    ),
    #  OPENAI  GPT-6 (2026-09-03)
    "gpt-6-astra": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-6-astra",
        context_window_in=1_050_000,
        # A pagina do Astra escreve "128,000 max output tokens". A familia 5.6
        # usa 131_072 ("128K"). Sao numeros diferentes e o menor e o seguro:
        # estourar o teto devolve 400. NAO "harmonizar" com os irmaos.
        max_output_tokens=128_000,
        price_per_1m_in=10.00,
        price_per_1m_out=50.00,
        reasoning_effort="low",
        esforcos_autorizados=("low", "medium"),
        supports_subagents=True,
        cota_por_assinatura=True,
        verification=VerificationStatus.VERIFICADO,
        notas=(
            "Verificado em 2026-09-07 contra developers.openai.com/api/docs/"
            "models/gpt-6-astra: 1.05M de janela (922k de entrada maxima), "
            "128k de saida, corte de conhecimento 2026-04-30, cache de entrada "
            "a $1. A API aceita ate 'max'; o Tier 0 autorizou SO 'low' e "
            "'medium'. "
            "FAIXA DE ACESSO -- o que de fato o separa do Fable: o Astra tem "
            "as DUAS (cota de assinatura e pay-as-you-go), e o Fable so a "
            "segunda. Por token os dois empatam em $10/$50; dentro da cota o "
            "custo marginal do Astra e ZERO, e e por isso que 'mais barato que "
            "o Fable' e verdade apesar do empate de tabela. "
            "A cota e por TETO DE MENSAGENS (semanal/mensal nos planos Pro), "
            "nao por token -- entao o teto low/medium PRESERVA A COTA: esforco "
            "alto consome o mesmo numero de mensagens gastando muito mais "
            "raciocinio, e o excedente cai no preco cheio. "
            "Fast mode DOBRA a tabela ($20/$100). Nao ativar sem decisao "
            "explicita de custo do Tier 0."
        ),
    ),
}

# Escala de esforco da OpenAI. 'xhigh' entrou com o GPT-6 Astra; 'ultra' NUNCA
# existiu -- era invencao do estudo de fronteira, e a ausencia dele aqui e o
# que impede a invencao de voltar por uma porta lateral.
ESFORCOS_OPENAI_VALIDOS: frozenset[str] = frozenset(
    {"none", "low", "medium", "high", "xhigh", "max"}
)


def modelos_nao_autorizados() -> dict[str, str]:
    """Alias -> motivo, para os modelos conhecidos que esta malha nao usa.

    Derivado do registro, e nao mantido a mao: uma segunda lista divergiria do
    campo `autorizado` no primeiro descuido -- que e o defeito que a secao 7 do
    CLAUDE.md documenta.
    """
    return {
        alias: cap.motivo_nao_autorizado
        for alias, cap in MODEL_REGISTRY.items()
        if not cap.autorizado
    }


# RETIRADOS por decisao do Tier 0 -- conhecidos, verificados e fora de uso.
# Terceira categoria, distinta das outras duas: NAO_VERIFICADOS sao dados que
# nao se conseguiu confirmar; estes foram confirmados e recusados. Apagar sem
# deixar rastro faria o proximo a olhar o registro concluir que a Anthropic nao
# tem modelo de topo -- e reintroduzi-los em duas semanas.
MODELOS_RETIRADOS: dict[str, str] = {
    "claude-fable-5": (
        "Tier 0, 2026-09-07: RETIRADO da integracao. So existe em "
        "pay-as-you-go -- confirmado em claude.com/pricing: nao entra em plano "
        "de assinatura, Pro e Max o alcancam apenas por 'usage credits'. "
        "Terceiro melhor modelo disponivel; a recusa e de FAIXA DE ACESSO, nao "
        "de capacidade nem de preco unitario ($10/$50, empatado com o Astra)."
    ),
    "claude-fable-5-1": (
        "Tier 0, 2026-09-07: RETIRADO da integracao, pelo mesmo motivo do "
        "Fable 5. SEGUNDO melhor modelo disponivel, atras so do GPT-6 Astra, "
        "e ainda assim fora: sem cota de assinatura, cada chamada e compra de "
        "token. O Astra tem as duas faixas -- e essa assimetria, e nao o preco "
        "de tabela, e o que separa os dois."
    ),
}


# Deliberadamente FORA do registro: gpt-5.6-sol-ultrafast.
# Nao consta na documentacao de modelos da OpenAI. Ver CORRECOES_APLICADAS.
MODELOS_NAO_VERIFICADOS: dict[str, str] = {
    "gpt-5.6-sol-ultrafast": (
        "Citado no estudo (Cerebras, 750 tps, $7.50/$40) mas ausente da "
        "documentacao. Adicionar ao registro apenas apos confirmar via "
        "GET /v1/models no ambiente."
    ),
}


def get(alias: str) -> ModelCapability:
    """Devolve a capacidade do modelo, ou erro claro se o alias for invalido."""
    if alias not in MODEL_REGISTRY:
        extra = ""
        if alias in MODELOS_RETIRADOS:
            extra = f" RETIRADO: {MODELOS_RETIRADOS[alias]}"
        elif alias in MODELOS_NAO_VERIFICADOS:
            extra = f" MOTIVO: {MODELOS_NAO_VERIFICADOS[alias]}"
        raise KeyError(f"Modelo '{alias}' nao esta no registro. Disponiveis: {sorted(MODEL_REGISTRY)}.{extra}")
    return MODEL_REGISTRY[alias]


def custo_estimado(alias: str, tokens_in: int, tokens_out: int) -> float:
    """Custo em USD. Nao inclui tokens de raciocinio, que sao cobrados como saida
    e podem dominar o total em modelos de Sistema 2  tratar como piso."""
    c = get(alias)
    return (tokens_in / 1e6) * c.price_per_1m_in + (tokens_out / 1e6) * c.price_per_1m_out


__all__ = [
    "AdapterType",
    "VerificationStatus",
    "ModelCapability",
    "MODEL_REGISTRY",
    "MODELOS_NAO_VERIFICADOS",
    "MODELOS_RETIRADOS",
    "ESFORCOS_OPENAI_VALIDOS",
    "CORRECOES_APLICADAS",
    "get",
    "custo_estimado",
    "modelos_nao_autorizados",
]
