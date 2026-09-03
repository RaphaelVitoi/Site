"""Guarda do caminho HTTP Anthropic ligado ao `llm/adapters.py`.

Ate 2026-09-02 o `adapters.py` sabia tudo o que a geracao 5 exige -- sem
amostragem legada, thinking adaptativo, effort, `betas` -- e era importado por
UM arquivo: `tests/test_model_registry.py`. Nenhum codigo de producao o
consumia. E a secao 4 da raiz ao pe da letra: modulo que ninguem importa nao e
integracao.

Quem chamava a Anthropic eram duas implementacoes paralelas sem teste
(`llm/anthropic.py` e `engine/llm_api.py`), com dois defeitos que a
documentacao da API confirma:

  - `temperature` enviada a modelos da geracao 5, que rejeitam amostragem com
    HTTP 400;
  - `content[0]["text"]`, que levanta KeyError quando o bloco 0 e `thinking` --
    e em Opus 5 o thinking esta LIGADO por padrao.

Nada aqui chama provedor. A raiz e explicita: as API keys deste ambiente estao
revogadas e nao foram substituidas, e teste que pressuponha chamada real e
proibido. Tudo abaixo exercita montagem de requisicao e leitura de payload.
"""

from __future__ import annotations

import pytest

from llm.adapters import AnthropicAdapter, ParametroRejeitadoError
from llm.anthropic import _montar

# O modelo do ping de chave em `cli/commands.py`. Geracao 3, fora do registro.
LEGADO = "claude-3-haiku-20240307"
ATUAL = "claude-opus-5"


# ==============================================================================
# Quem e geracao 5, e quem nao e
# ==============================================================================


def test_reconhece_a_geracao_atual():
    assert AnthropicAdapter.e_geracao_atual(ATUAL)
    assert AnthropicAdapter.e_geracao_atual("claude-sonnet-5")


def test_modelo_legado_nao_e_tratado_como_geracao_atual():
    """O ping de chave usa geracao 3, que ACEITA amostragem.

    Sanea-lo como se fosse Opus 5 removeria `temperature` de um modelo que a
    aceita e quebraria `_test_api_key` sem que nada acusasse.
    """
    assert not AnthropicAdapter.e_geracao_atual(LEGADO)


def test_modelo_desconhecido_nao_levanta():
    """`get()` levanta KeyError; o predicado tem de absorver isso.

    Se propagasse, um alias novo derrubaria a chamada em vez de cair no caminho
    legado.
    """
    assert not AnthropicAdapter.e_geracao_atual("modelo-que-nao-existe")


# ==============================================================================
# betas e header, nao campo de corpo
# ==============================================================================


def test_betas_sai_do_corpo_e_vira_header():
    """`betas` e argumento do SDK. No corpo JSON e campo desconhecido."""
    corpo, headers = AnthropicAdapter.build_http(ATUAL, [{"role": "user", "content": "oi"}])

    assert "betas" not in corpo, "betas vazou para o corpo HTTP"
    assert headers["anthropic-beta"] == "server-side-fallback-2026-07-01"


def test_fallbacks_permanece_no_corpo():
    """Ao contrario de `betas`, `fallbacks` E campo de corpo."""
    corpo, _ = AnthropicAdapter.build_http(ATUAL, [{"role": "user", "content": "oi"}])
    assert corpo["fallbacks"] == "default"


def test_modelo_sem_beta_nao_inventa_header():
    corpo, headers = AnthropicAdapter.build_http("claude-sonnet-5", [{"role": "user", "content": "oi"}])
    assert headers == {}
    assert "betas" not in corpo


def test_thinking_adaptativo_e_effort_chegam_ao_corpo():
    corpo, _ = AnthropicAdapter.build_http(ATUAL, [{"role": "user", "content": "oi"}])
    assert corpo["thinking"] == {"type": "adaptive"}
    assert corpo["output_config"]["effort"] == "xhigh"


def test_amostragem_legada_e_barrada_antes_da_chamada():
    """Erro local no lugar de um 400 remoto -- a filosofia declarada do modulo."""
    with pytest.raises(ParametroRejeitadoError, match="temperature"):
        AnthropicAdapter.build_http(ATUAL, [{"role": "user", "content": "oi"}], temperature=0.2)


# ==============================================================================
# O bloco 0 nao e necessariamente o texto
# ==============================================================================

RESPOSTA_COM_THINKING = {
    "content": [
        {"type": "thinking", "thinking": ""},
        {"type": "text", "text": "a resposta"},
    ],
    "stop_reason": "end_turn",
}


def test_extrai_texto_quando_o_bloco_zero_e_thinking():
    assert AnthropicAdapter.extrair_texto(RESPOSTA_COM_THINKING) == "a resposta"


def test_o_acesso_antigo_teria_quebrado_nesta_mesma_resposta():
    """Prova do defeito, no payload que a geracao 5 devolve por padrao."""
    with pytest.raises(KeyError):
        _ = RESPOSTA_COM_THINKING["content"][0]["text"]


def test_concatena_multiplos_blocos_de_texto():
    """Citacoes dividem a resposta em varios blocos `text`; pegar o primeiro perde o resto."""
    resposta = {
        "content": [
            {"type": "text", "text": "primeira parte, "},
            {"type": "text", "text": "segunda parte"},
        ]
    }
    assert AnthropicAdapter.extrair_texto(resposta) == "primeira parte, segunda parte"


def test_resposta_sem_bloco_de_texto_devolve_vazio_sem_levantar():
    assert AnthropicAdapter.extrair_texto({"content": [{"type": "thinking", "thinking": ""}]}) == ""
    assert AnthropicAdapter.extrair_texto({}) == ""


# ==============================================================================
# Recusa chega como HTTP 200
# ==============================================================================


def test_recusa_em_dict_e_detectada():
    """A versao anterior so fazia getattr, entao devolvia False para todo payload
    vindo de `await response.json()` -- ou seja, para os dois unicos caminhos de
    chamada Anthropic que este projeto executa."""
    assert AnthropicAdapter.houve_recusa({"stop_reason": "refusal"})
    assert not AnthropicAdapter.houve_recusa({"stop_reason": "end_turn"})


def test_motivo_da_recusa_le_stop_details():
    resposta = {
        "stop_reason": "refusal",
        "stop_details": {"type": "refusal", "category": "cyber", "explanation": "motivo"},
    }
    assert AnthropicAdapter.motivo_da_recusa(resposta) == "cyber: motivo"


def test_motivo_da_recusa_sem_stop_details_nao_levanta():
    """`stop_details` e nulo em todo `stop_reason` que nao seja recusa."""
    assert AnthropicAdapter.motivo_da_recusa({"stop_reason": "refusal"}) == "recusa sem stop_details"


# ==============================================================================
# A montagem de `llm/anthropic.py` escolhe o caminho pelo registro
# ==============================================================================


def test_montagem_da_geracao_atual_nao_leva_temperature():
    corpo, headers = _montar(ATUAL, "sistema", "usuario", {})
    assert "temperature" not in corpo
    assert corpo["thinking"] == {"type": "adaptive"}
    assert headers["anthropic-beta"]


def test_montagem_legada_preserva_temperature():
    """Capacidade preservada: a escada da secao 8.2 manda preservar antes de corrigir."""
    corpo, headers = _montar(LEGADO, "sistema", "usuario", {})
    assert corpo["temperature"] == 0.2
    assert corpo["max_tokens"] == 8192
    assert headers == {}


def test_max_tokens_acima_do_teto_de_streaming_falha_local():
    """Acima do teto a API exige streaming, e este caminho e requisicao unica.

    Falhar aqui e melhor que um timeout remoto sem causa aparente.
    """
    with pytest.raises(ParametroRejeitadoError, match="streaming"):
        _montar(ATUAL, "sistema", "usuario", {"max_tokens": 64_000})


def test_montagem_respeita_max_tokens_dentro_do_teto():
    corpo, _ = _montar(ATUAL, "sistema", "usuario", {"max_tokens": 8_000})
    assert corpo["max_tokens"] == 8_000
