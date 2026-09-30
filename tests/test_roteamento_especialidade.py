"""Guard: o roteamento decide por ESPECIALIDADE, nao so por economia.

Medido em 29/09/2026: uma auditoria de seguranca enfileirada para
`@securitychief` saiu no `gemini-3.6-flash`. Nao porque ele fosse o melhor para a
tarefa — porque `_score_standard_preference` era uma fila unica e plana onde
"mais barato" dominava: `gemini-3.5-flash-lite` (-4) vencia `3.6` (-2), `3.7`
(-1) e `3.8` (que nem tinha ramo, caindo em `"flash" in m` = 3). E nenhum modulo
declarava `Task.metadata["domain"]`, entao o eixo de especialidade nunca pontuava
ninguem: era um parametro morto.

Este guard fixa os quatro eixos e a cobertura dos 19 agentes. Sem ele, a proxima
alteracao de score volta a威ar o mais barato por acidente — e o defeito so
 reaparece quando alguem prestacao conta com o resultado errado.
"""

from __future__ import annotations

import json
from pathlib import Path

from core.schemas import Task
from llm.routing import (
    DOMINIO_CODIGO,
    DOMINIO_CURADORIA,
    DOMINIO_INTELIGENCIA,
    DOMINIO_MATH,
    DOMINIO_POR_AGENTE,
    DOMINIO_RAZONIO,
    DOMINIO_TRIAGEM,
    _especialidade,
    _score_model,
    dominio_do_agente,
    resolver_dominio,
)

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "data" / "agents_manifest.json"

FROTA = [
    "gemma4:31b-cloud",
    "gpt-oss:120b-cloud",
    "qwen2.5-coder:7b-instruct-q5_K_M",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]


def _primeiro(track: list[str], domain: str | None, designated: str | None = None) -> str:
    return sorted(track, key=lambda m: _score_model(m, False, designated, domain))[0]


# --- Eixo 1: DESIGNACAO ------------------------------------------------------


def test_designacao_vence_tudo() -> None:
    """Quem o manifesto nomeia vence, inclusive sobre especialidade.

    A faixa de designacao fica ABAIXO da de especialidade com folga. Medido: com
    `-100` nas duas, a especialidade de um `-5` chegava a -105 e vencia — o
    manifesto nomeava o modelo e o roteamento devolvia outro.
    """
    from llm.routing import _FAIXA_DESIGNACAO, _FAIXA_ESPECIALIDADE

    designado = "gemini-3.5-flash-lite"
    assert _score_model(designado, False, designado, DOMINIO_RAZONIO) == _FAIXA_DESIGNACAO
    assert _primeiro(FROTA, DOMINIO_RAZONIO, designado) == designado

    # A folga existe para o caso extremo: a pior especialidade (-6) ainda fica
    # acima da designacao.
    pior_especialidade = _FAIXA_ESPECIALIDADE - 6
    assert pior_especialidade > _FAIXA_DESIGNACAO, (
        "A faixa de designacao deixou de sobreviver a pior especialidade conhecida. "
        "Um score novo pode desfazer a separacao entre os eixos."
    )


# --- Eixo 2: ESPECIALIDADE ---------------------------------------------------


def test_modelos_tier1_reconhecidos_e_bloqueados_em_tarefas_comuns() -> None:
    """Familias Tier 1 orquestram no topo e nao entram em tarefas comuns de workers."""
    from llm.routing import _FAIXA_DESIGNACAO, _FAIXA_TIER1_INDISPONIVEL, _e_tier1

    modelos_tier1_amostra = [
        "claude-opus-5",
        "claude-opus-5.5",
        "claude-sonnet-5",
        "claude-sonnet-5.5",
        "gpt-5.6-sol",
        "gpt-5.6-terra",
        "gpt-5.6-luna",
        "gpt-6-astra",
        "gpt-6-sol",
        "gpt-6.1",
        "claude-fable-5.1",
        "gemini-3.8-flash",
    ]

    for mod in modelos_tier1_amostra:
        assert _e_tier1(mod) is True, f"{mod} deveria ser reconhecido como Tier 1"
        assert _score_model(mod, False, None, DOMINIO_RAZONIO) == _FAIXA_TIER1_INDISPONIVEL, (
            f"{mod} deveria receber _FAIXA_TIER1_INDISPONIVEL em tarefa comum"
        )
        # Mas se o manifesto ou Tier 0 designar explicitamente, a designacao vence:
        assert _score_model(mod, False, mod, DOMINIO_RAZONIO) == _FAIXA_DESIGNACAO


def test_triagem_vai_para_o_mais_barato_que_classifica() -> None:
    """Triagem e classificacao estruturada — nao raciocinio longo.

    O `@dispatcher` produz JSON validado por
    `agents/dispatcher.py:_parse_dispatcher_subtasks_strict`. Modelo caro aqui e
    dinheiro jogado fora: o gargalo e respeitar schema, nao raciocinar.
    """
    assert _primeiro(FROTA, DOMINIO_TRIAGEM) == "gemini-3.5-flash-lite"


def test_codigo_vai_para_o_coder_quantizado_local() -> None:
    """Edicao de codigo e trabalho do coder local, tentado antes do cloud."""
    assert _primeiro(FROTA, DOMINIO_CODIGO) == "qwen2.5-coder:7b-instruct-q5_K_M"


def test_curadoria_vai_para_modelo_grande() -> None:
    """Curadoria e unificar, nao classificar. O `3.5-flash-lite` fica de fora."""
    escolhido = _primeiro(FROTA, DOMINIO_CURADORIA)
    assert escolhido in {"gpt-oss:120b-cloud", "gemma4:31b-cloud"}
    assert _especialidade("gemini-3.5-flash-lite", DOMINIO_CURADORIA) == 1


def test_inteligencia_vai_para_o_gemma_grande() -> None:
    """Fundacao e plano pedem o binario que segura o plano inteiro."""
    assert _primeiro(FROTA, DOMINIO_INTELIGENCIA) == "gemma4:31b-cloud"


def test_matematica_vai_para_o_31b() -> None:
    assert _primeiro(FROTA, DOMINIO_MATH) == "gemma4:31b-cloud"


def test_raciocinio_prefere_o_3_7() -> None:
    """Na frota de execucao, o especialista de raciocinio e o 3.7 Flash."""
    assert _primeiro(FROTA, DOMINIO_RAZONIO) == "gemini-3.7-flash"


def test_especialidade_vence_economia() -> None:
    """O ponto do defeito: ser barato nao pode sobrepor servir bem.

    Fails se alguem voltar a modelar os dois eixos numa escala so.
    """
    barato = _score_model("gemini-3.5-flash-lite", False, None, DOMINIO_TRIAGEM)
    caro = _score_model("gemini-3.7-flash", False, None, DOMINIO_TRIAGEM)
    assert barato < caro, "Economia voltou a sobrepor a especialidade"

    caro_triagem = _score_model("gemini-3.7-flash", False, None, DOMINIO_RAZONIO)
    barato_razao = _score_model("gemini-3.5-flash-lite", False, None, DOMINIO_RAZONIO)
    assert caro_triagem < barato_razao, "Economia voltou a sobrepor a especialidade"


# --- Eixo 3: ECONOMIA (preservado) -------------------------------------------


def test_sem_dominio_a_economia_continua_decidindo() -> None:
    """Ausencia de dominio nao vira adivinhacao.

    O comportamento anterior — mais barato primeiro — continua valendo para quem
    nao declara dimensao. Trocar um ranking plano por um ranking errado seria
    trocar um defeito por outro.
    """
    assert _primeiro(FROTA, None) == "gemini-3.5-flash-lite"


def test_o_3_8_tem_ramo_proprio() -> None:
    """`gemini-3.8` nao pode mais cair no ramo generico de `flash`.

    Sem ramo proprio, ele pegava `"flash" in m` = 3 — pior que o 3.7 (-1) e que
    o proprio 3.6 (-2) na trilha `deep_thinking`. O modelo mais forte da familia
    ficava em ULTIMO na fila economica.

    A asercao nao e "score negativo": economicamente ele fica atras do 3.7, e
    isso e correto. O que nao pode e ser o ramo generico.
    """
    from llm.routing import _score_standard_preference

    generico = 3  # valor do ramo `"flash" in m`, que o 3.8 herdava
    assert _score_standard_preference("gemini-3.8-flash", "gemini-3.8-flash") != generico
    assert _score_standard_preference("gemini-3.8-flash", "gemini-3.8-flash") < generico


# --- Fonte unica: cobertura dos agentes --------------------------------------


def test_todo_agente_do_manifesto_tem_dominio() -> None:
    """Nenhum agente fica sem dimensao declarada.

    Agente sem dominio cai no eixo economico — que e o defeito original. Este
    teste e o que impede a lista de派生 encolher sem ninguem perceber.
    """
    agentes = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    sem = [nome for nome in agentes if dominio_do_agente(nome) is None]
    assert not sem, f"Agentes do manifesto sem dominio declarado: {sorted(sem)}"


def test_agentes_conhecidos_por_arroba_e_sem_arroba() -> None:
    """O manifesto grava sem arroba; quem chama tem as duas formas na mao."""
    assert dominio_do_agente("@curator") == dominio_do_agente("curator") == DOMINIO_CURADORIA
    assert dominio_do_agente("@CURATOR") == DOMINIO_CURADORIA


def test_agente_desconhecido_nao_inventa_dominio() -> None:
    assert dominio_do_agente("@naoexiste") is None
    assert dominio_do_agente(None) is None
    assert dominio_do_agente("") is None


# --- Precedencia: declarado vence derivado -----------------------------------


def _task(agent: str, metadata: dict | None = None) -> Task:
    from datetime import UTC, datetime

    return Task(
        id="T-ROTA",
        description="tarefa de teste",
        timestamp=datetime.now(UTC).isoformat(),
        agent=agent,
        metadata=metadata or {},
    )


def test_dominio_declarado_vence_o_derivado() -> None:
    """Quem enfileira sabe mais do que a tabela."""
    assert resolver_dominio(_task("@implementor", {"domain": DOMINIO_CURADORIA})) == DOMINIO_CURADORIA


def test_dominio_declarado_e_normalizado() -> None:
    assert resolver_dominio(_task("@implementor", {"domain": "curadoria"})) == DOMINIO_CURADORIA


def test_sem_declaracao_usa_o_derivado() -> None:
    assert resolver_dominio(_task("@implementor")) == DOMINIO_CODIGO


def test_task_nenhuma_retorna_none() -> None:
    assert resolver_dominio(None) is None


# --- Tabela coerente com o trabalho -------------------------------------------


def test_dominios_declarados_sao_conhecidos() -> None:
    """Valor solto na tabela = eixo silenciosamente inerte."""
    validos = {
        DOMINIO_CODIGO,
        DOMINIO_MATH,
        DOMINIO_TRIAGEM,
        DOMINIO_RAZONIO,
        DOMINIO_CURADORIA,
        DOMINIO_INTELIGENCIA,
    }
    assert set(DOMINIO_POR_AGENTE.values()) <= validos


def test_dispatcher_e_triagem_por_trabalho() -> None:
    """O caso que motivou a mudanca, fixado por nome.

    O dispatcher produz JSON de subtarefas validado por parser estrito. Se um dia
    ele passar a produzir analise, este teste tem de falhar para a revisao
    acontecer — e nao para o roteamento silenciosamente pagar por raciocinio.
    """
    assert DOMINIO_POR_AGENTE["dispatcher"] == DOMINIO_TRIAGEM
    assert DOMINIO_POR_AGENTE["organizador"] == DOMINIO_TRIAGEM
    assert DOMINIO_POR_AGENTE["sequenciador"] == DOMINIO_TRIAGEM


def test_curadoria_e_inteligencia_usam_gemma_e_oss_grandes() -> None:
    assert DOMINIO_POR_AGENTE["curator"] == DOMINIO_CURADORIA
    assert DOMINIO_POR_AGENTE["architect"] == DOMINIO_INTELIGENCIA
    assert DOMINIO_POR_AGENTE["planner"] == DOMINIO_INTELIGENCIA


def test_roteamento_hermes_e_laguna_free() -> None:
    """Valida deteccao e especialidade da familia Laguna e condutor Hermes."""
    from llm.routing import _custo_relativo, _infer_provider_for_model

    # Provedor e custo
    assert _infer_provider_for_model("stealth/space-bunny-alpha") == "hermes"
    assert _custo_relativo("poolside/laguna-s-2.1:free", "poolside/laguna-s-2.1:free") == 0.0
    assert _custo_relativo("poolside/laguna-xs-2.1:free", "poolside/laguna-xs-2.1:free") == 0.0
    assert _custo_relativo("stealth/space-bunny-alpha", "stealth/space-bunny-alpha") == 0.0

    # Especialidades
    assert _especialidade("poolside/laguna-xs-2.1:free", DOMINIO_TRIAGEM) == -4
    assert _especialidade("poolside/laguna-s-2.1:free", DOMINIO_CODIGO) == -3
    assert _especialidade("poolside/laguna-s-2.1:free", DOMINIO_RAZONIO) == -3


def test_roteamento_glm_cloud_e_local_llamacpp() -> None:
    """Valida que GLM Cloud protege curadoria e modelos llama.cpp operam custo zero."""
    from llm.routing import _custo_relativo, _e_recurso_escasso

    # GLM Cloud e recurso escasso (preservado em triagem/codigo, ativo em curadoria/inteligencia)
    assert _e_recurso_escasso("glm-5.1:cloud") is True
    assert _especialidade("glm:oss 120b", DOMINIO_CURADORIA) == -6
    assert _especialidade("glm-5.1:cloud", DOMINIO_INTELIGENCIA) == -5

    # llama.cpp local (8081, 8082, 8083) opera custo zero
    assert _custo_relativo("ai9stars_g9v3-3b", "ai9stars_g9v3-3b") == 0.0
    assert _custo_relativo("ling-3.0-tiny", "ling-3.0-tiny") == 0.0
    assert _custo_relativo("qwen2.5-coder:1.5b", "qwen2.5-coder:1.5b") == 0.0
