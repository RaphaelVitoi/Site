"""Registro unificado de modelos de fronteira — SOTA v8.0 GOLD.

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
from typing import Any, Literal

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
        "O estudo declara 64k (Sol/Terra) e 32k (Luna). A documentacao indica "
        "128k para as tres variantes."
    ),
    "openai.contexto_luna": (
        "O estudo declara 512k de contexto para a Luna. A documentacao indica "
        "1.05M para as tres variantes."
    ),
    "openai.preco_luna": (
        "CRITICO PARA ORCAMENTO. O estudo declara $1.00/$6.00 por 1M. A "
        "documentacao indica $0.20/$1.20 — cinco vezes mais barato. Roteamento "
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
        "lista de modelos da documentacao. Mantida fora do registro ativo — "
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

    VERIFICADO = "verificado"          # confirmado em doc autoritativa
    NAO_VERIFICADO = "nao_verificado"  # plausivel, sem confirmacao
    CORRIGIDO = "corrigido"            # o estudo errava; valor aqui e o corrigido


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

    # ── Anthropic ────────────────────────────────────────────────────────────
    # thinking adaptativo e o unico modo suportado na geracao 5.
    # budget_tokens NAO existe aqui de proposito: incluir o campo convidaria
    # alguem a preenche-lo, e o resultado seria 400.
    thinking_adaptive: bool = False
    effort: Literal["low", "medium", "high", "xhigh", "max"] | None = None
    beta_headers: list[str] = Field(default_factory=list)
    server_side_fallback: bool = False
    supports_mid_conversation_system: bool = False
    requires_streaming_above: int | None = None

    # ── OpenAI ───────────────────────────────────────────────────────────────
    reasoning_effort: Literal["none", "low", "medium", "high", "max"] | None = None
    supports_subagents: bool = False

    # ── Google ───────────────────────────────────────────────────────────────
    thinking_level: Literal["minimal", "low", "medium", "high"] | None = None
    thought_signature_mode: Literal["stateful", "stateless"] | None = None

    # ── Comum ────────────────────────────────────────────────────────────────
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
        return self


# ==============================================================================
# REGISTRO
# ==============================================================================

MODEL_REGISTRY: dict[str, ModelCapability] = {
    # ── ANTHROPIC — Geracao 5 ────────────────────────────────────────────────
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
        price_per_1m_in=3.00,
        price_per_1m_out=15.00,
        thinking_adaptive=True,
        effort="high",
        supports_mid_conversation_system=False,  # nao suportado em Sonnet 5
        requires_streaming_above=16_000,
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "Saida corrigida p/ 128k. Preco introdutorio $2/$10 vigente ate "
            "2026-08-31 — reavaliar o roteamento quando expirar."
        ),
    ),
    "claude-fable-5": ModelCapability(
        adapter=AdapterType.ANTHROPIC,
        model_name="claude-fable-5",
        context_window_in=1_000_000,
        max_output_tokens=131_072,
        price_per_1m_in=10.00,
        price_per_1m_out=50.00,
        thinking_adaptive=True,
        effort="high",
        server_side_fallback=True,
        beta_headers=["server-side-fallback-2026-07-01"],
        supports_mid_conversation_system=True,
        requires_streaming_above=16_000,
        notas=(
            "Thinking sempre ligado: {'type':'disabled'} retorna 400. "
            "Exige retencao de dados de 30 dias — org com ZDR recebe 400."
        ),
    ),

    # ── OPENAI — GPT-5.6 ─────────────────────────────────────────────────────
    "gpt-5.6-sol": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-sol",
        context_window_in=1_050_000,
        max_output_tokens=131_072,  # CORRIGIDO: estudo dizia 65_536
        price_per_1m_in=5.00,
        price_per_1m_out=30.00,
        reasoning_effort="max",  # CORRIGIDO: 'ultra' nao existe na escala
        supports_subagents=True,
        verification=VerificationStatus.CORRIGIDO,
    ),
    "gpt-5.6-terra": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-terra",
        context_window_in=1_050_000,
        max_output_tokens=131_072,
        price_per_1m_in=2.00,   # CORRIGIDO: estudo dizia 2.50
        price_per_1m_out=12.00,  # CORRIGIDO: estudo dizia 15.00
        reasoning_effort="high",
        verification=VerificationStatus.CORRIGIDO,
    ),
    "gpt-5.6-luna": ModelCapability(
        adapter=AdapterType.OPENAI,
        model_name="gpt-5.6-luna",
        context_window_in=1_050_000,  # CORRIGIDO: estudo dizia 512_000
        max_output_tokens=131_072,     # CORRIGIDO: estudo dizia 32_768
        price_per_1m_in=0.20,          # CORRIGIDO: estudo dizia 1.00
        price_per_1m_out=1.20,         # CORRIGIDO: estudo dizia 6.00
        reasoning_effort="low",
        verification=VerificationStatus.CORRIGIDO,
        notas=(
            "Cinco vezes mais barato do que o estudo supunha. Isso desloca o "
            "ponto de equilibrio do roteamento: Luna passa a ser o executor "
            "primario obvio para triagem e sub-agentes."
        ),
    ),

    # ── GOOGLE — Gemini 3 ────────────────────────────────────────────────────
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
            "vieram do estudo e nao foram confirmados na pagina de pricing — "
            "tratar como estimativa ate conferir."
        ),
    ),
    "gemini-3.1-pro": ModelCapability(
        adapter=AdapterType.GOOGLE,
        model_name="gemini-3.1-pro-preview",
        context_window_in=1_000_000,
        max_output_tokens=65_536,
        price_per_1m_in=2.00,
        price_per_1m_out=10.00,
        thinking_level="high",
        thought_signature_mode="stateful",
        verification=VerificationStatus.NAO_VERIFICADO,
        notas="Preview. Existencia verificada; precos nao confirmados.",
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
        if alias in MODELOS_NAO_VERIFICADOS:
            extra = f" MOTIVO: {MODELOS_NAO_VERIFICADOS[alias]}"
        raise KeyError(
            f"Modelo '{alias}' nao esta no registro. "
            f"Disponiveis: {sorted(MODEL_REGISTRY)}.{extra}"
        )
    return MODEL_REGISTRY[alias]


def custo_estimado(alias: str, tokens_in: int, tokens_out: int) -> float:
    """Custo em USD. Nao inclui tokens de raciocinio, que sao cobrados como saida
    e podem dominar o total em modelos de Sistema 2 — tratar como piso."""
    c = get(alias)
    return (tokens_in / 1e6) * c.price_per_1m_in + (tokens_out / 1e6) * c.price_per_1m_out


__all__ = [
    "AdapterType",
    "VerificationStatus",
    "ModelCapability",
    "MODEL_REGISTRY",
    "MODELOS_NAO_VERIFICADOS",
    "CORRECOES_APLICADAS",
    "get",
    "custo_estimado",
]
