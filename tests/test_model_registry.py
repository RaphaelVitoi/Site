"""Testes do registro de modelos e adaptadores de fronteira.

Estes testes existem para travar CORRECOES, nao so para exercitar codigo. Cada
assercao corresponde a um erro real do estudo de fronteira de 2026-08-21 que,
se reintroduzido, quebraria producao em silencio ou com HTTP 400.
"""

from __future__ import annotations

import pytest

from llm.adapters import (
    ANTHROPIC_REMOVIDOS,
    SAMPLING_LEGADO,
    AnthropicAdapter,
    GoogleGenAIAdapter,
    OpenAIAdapter,
    ParametroRejeitadoError,
    aplicar_padding_neutro,
    build_request,
)
from llm.model_registry import (
    MODEL_REGISTRY,
    MODELOS_NAO_VERIFICADOS,
    AdapterType,
    custo_estimado,
    get,
)

USUARIO = [{"role": "user", "content": "ping"}]


#  Integridade do registro


def test_registro_nao_vazio_e_valido():
    assert MODEL_REGISTRY
    for alias, cap in MODEL_REGISTRY.items():
        assert cap.model_name
        assert cap.max_output_tokens <= cap.context_window_in
        assert cap.price_per_1m_out >= cap.price_per_1m_in, alias


def test_alias_desconhecido_da_erro_explicito():
    with pytest.raises(KeyError, match="nao esta no registro"):
        get("gpt-9-inexistente")


def test_modelo_nao_verificado_fica_fora_e_explica_o_motivo():
    """gpt-5.6-sol-ultrafast e citado no estudo mas ausente da documentacao."""
    assert "gpt-5.6-sol-ultrafast" not in MODEL_REGISTRY
    assert "gpt-5.6-sol-ultrafast" in MODELOS_NAO_VERIFICADOS
    with pytest.raises(KeyError, match="MOTIVO"):
        get("gpt-5.6-sol-ultrafast")


#  Anthropic: as correcoes criticas


def test_anthropic_nunca_emite_budget_tokens():
    """budget_tokens foi removido da API e retorna 400 na geracao 5."""
    for alias in ("claude-opus-5", "claude-sonnet-5", "claude-fable-5"):
        req = AnthropicAdapter.build(alias, USUARIO)
        assert "budget_tokens" not in req
        assert req["thinking"] == {"type": "adaptive"}
        assert req["output_config"]["effort"]


def test_anthropic_rejeita_budget_tokens_localmente():
    """Falhar aqui e melhor do que descobrir com um 400 em producao."""
    with pytest.raises(ParametroRejeitadoError, match="budget_tokens"):
        AnthropicAdapter.build("claude-opus-5", USUARIO, budget_tokens=8192)
    assert "budget_tokens" in ANTHROPIC_REMOVIDOS


@pytest.mark.parametrize("param", sorted(SAMPLING_LEGADO))
def test_amostragem_legada_e_rejeitada_nos_tres_provedores(param):
    for alias in ("claude-opus-5", "gpt-5.6-sol", "gemini-3.7-flash"):
        with pytest.raises(ParametroRejeitadoError, match=param):
            build_request(alias, USUARIO, **{param: 0.5})


def test_sonnet5_tem_128k_de_saida_nao_64k():
    """O estudo declarava 65_536; o correto e 131_072."""
    assert get("claude-sonnet-5").max_output_tokens == 131_072


def test_max_tokens_e_limitado_pela_capacidade():
    req = AnthropicAdapter.build("claude-opus-5", USUARIO, max_tokens=999_999)
    assert req["max_tokens"] == get("claude-opus-5").max_output_tokens


def test_fallback_server_side_em_opus5_e_fable5():
    """server-side-fallback-2026-07-01 e o unico beta header do estudo que existe."""
    for alias in ("claude-opus-5", "claude-fable-5"):
        req = AnthropicAdapter.build(alias, USUARIO)
        assert req["fallbacks"] == "default"
        assert "server-side-fallback-2026-07-01" in req["betas"]


def test_nenhum_beta_header_de_mutacao_de_ferramentas():
    """O header citado no estudo nao existe; nao pode reaparecer no registro."""
    for cap in MODEL_REGISTRY.values():
        assert not any("mid-conversation-tool-changes" in b for b in cap.beta_headers)


def test_mid_conversation_system_respeita_suporte_por_modelo():
    bloco = AnthropicAdapter.instrucao_mid_conversation("claude-opus-5", "regra")
    assert bloco == {"role": "system", "content": "regra"}
    with pytest.raises(ParametroRejeitadoError, match="Sonnet 5"):
        AnthropicAdapter.instrucao_mid_conversation("claude-sonnet-5", "regra")


def test_streaming_obrigatorio_para_saida_grande():
    assert AnthropicAdapter.precisa_streaming("claude-opus-5", 128_000)
    assert not AnthropicAdapter.precisa_streaming("claude-opus-5", 8_000)


#  OpenAI


def test_openai_nao_usa_esforco_ultra():
    """'ultra' nao existe na escala documentada (none..max)."""
    validos = {"none", "low", "medium", "high", "max"}
    for cap in MODEL_REGISTRY.values():
        if cap.adapter is AdapterType.OPENAI:
            assert cap.reasoning_effort in validos, cap.model_name


def test_luna_tem_o_preco_corrigido():
    """O estudo dizia $1.00/$6.00; o correto e $0.20/$1.20  5x de diferenca."""
    luna = get("gpt-5.6-luna")
    assert luna.price_per_1m_in == 0.20
    assert luna.price_per_1m_out == 1.20
    assert luna.context_window_in == 1_050_000
    real = custo_estimado("gpt-5.6-luna", 1_000_000, 200_000)
    conforme_estudo = 1.00 + 0.2 * 6.00
    assert conforme_estudo / real == pytest.approx(5.0, rel=0.01)


def test_openai_monta_bloco_de_reasoning():
    req = OpenAIAdapter.build("gpt-5.6-sol", USUARIO)
    assert req["reasoning"]["effort"] == "max"
    assert req["model"] == "gpt-5.6-sol"


#  Google


def test_thinking_level_vai_dentro_de_generation_config():
    req = GoogleGenAIAdapter.build("gemini-3.7-flash", USUARIO)
    assert "thinking_level" not in req
    assert req["generation_config"]["thinking_level"] == "high"


def test_gemini_37_flash_nao_aceita_minimal():
    """gemini-3.7-flash aceita low/medium/high  'minimal' e de outros modelos."""
    assert get("gemini-3.7-flash").thinking_level in {"low", "medium", "high"}


def test_include_thoughts_nao_e_campo_real():
    """O estudo propunha include_thoughts=True; nao existe na documentacao."""
    req = GoogleGenAIAdapter.build("gemini-3.7-flash", USUARIO)
    assert "include_thoughts" not in req
    assert "include_thoughts" not in req["generation_config"]


def test_modo_stateful_nao_reenvia_assinaturas():
    steps = [{"type": "thought", "signature": "abc"}, {"type": "text"}]
    assert GoogleGenAIAdapter.preservar_assinaturas("gemini-3.7-flash", steps) == []


#  Cruzados


def test_adaptador_recusa_modelo_de_outro_provedor():
    with pytest.raises(ParametroRejeitadoError, match="nao e um modelo Anthropic"):
        AnthropicAdapter.build("gpt-5.6-sol", USUARIO)
    with pytest.raises(ParametroRejeitadoError, match="nao e um modelo Google"):
        GoogleGenAIAdapter.build("claude-opus-5", USUARIO)


def test_custo_cresce_com_tokens():
    assert custo_estimado("claude-opus-5", 2_000_000, 0) > custo_estimado("claude-opus-5", 1_000_000, 0)


def test_padding_neutro_limite_contexto():
    """Verifica se payloads na fronteira de 32k-40k tokens recebem padding neutro."""
    # Payload pequeno (sem padding)
    pequeno = [{"role": "user", "parts": [{"text": "Hello world"}]}]
    assert aplicar_padding_neutro(pequeno) == pequeno

    # Payload na fronteira de 35k tokens (140.000 caracteres / 4 = 35.000 tokens)
    texto_35k = "x" * 140_000
    borda = [{"role": "user", "parts": [{"text": texto_35k}]}]
    pad = aplicar_padding_neutro(borda)
    assert "<!-- SOTA_CONTEXT_ALIGNMENT: " in pad[0]["parts"][0]["text"]

    # Forcando padding neutro explicitamente
    forcado = aplicar_padding_neutro(pequeno, force=True)
    assert "<!-- SOTA_CONTEXT_ALIGNMENT: " in forcado[0]["parts"][0]["text"]
