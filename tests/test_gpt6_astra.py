"""Integracao do GPT-6 Astra (OpenAI) ao registro de fronteira -- 2026-09-07.

Cada assercao aqui trava um FATO VERIFICADO em
`developers.openai.com/api/docs/models/gpt-6-astra`, que e a mesma fonte
autoritativa que o cabecalho de `llm/model_registry.py` declara. Nenhum valor
deste arquivo foi inferido: o que a pagina nao afirma, este arquivo nao afirma.

O lancamento trouxe DUAS mudancas, e so a primeira e a obvia:

  1. Um modelo novo, a $10/$50 -- o mesmo preco por token que a familia
     Fable cobrava, e que por isso NAO e o que separa os dois.
  2. Uma escala de esforco DIFERENTE: a pagina do Astra lista
     `low, medium, high, xhigh, max`. O `xhigh` nao existia na escala que o
     registro conhecia, e o `none` nao aparece para este modelo.

E trouxe um efeito colateral no preco da familia anterior, confirmado pelo
Tier 0 em 2026-09-07: *"Fez parte do upgrade. Sol ficou mais barato"*. O Sol
caiu de $5/$30 para $4/$20 -- e isso INVERTE a comparacao de saida que a rota
de governanca usava como justificativa.

**Teto de esforco por decisao do Tier 0, 2026-09-07:** *"Usaremos o Astra
apenas no Low e Medium = motivo e o preco."* O modelo aceita ate `max`; a
autorizacao para de operar em `medium`. A diferenca entre o que a API PERMITE
e o que esta malha AUTORIZA e o motivo de `esforcos_autorizados` existir: sem
o campo, a decisao viveria apenas em prosa, e prosa nao reprova commit.

**Familia Fable RETIRADA em 2026-09-07, por ordem do Tier 0.** O discriminante
nao e preco por token -- ali eles empatam com o Astra -- e sim FAIXA DE ACESSO:
Fable so existe em pay-as-you-go, confirmado em `claude.com/pricing`, enquanto
o Astra vem tambem na cota de assinatura. Eles saem de `MODEL_REGISTRY` e
entram em `MODELOS_RETIRADOS`, que preserva o motivo.
"""

from __future__ import annotations

import pytest

from llm.adapters import OpenAIAdapter, ParametroRejeitadoError
from llm.model_registry import (
    ESFORCOS_OPENAI_VALIDOS,
    MODEL_REGISTRY,
    ModelCapability,
    MODELOS_NAO_VERIFICADOS,
    MODELOS_RETIRADOS,
    AdapterType,
    custo_estimado,
    get,
    modelos_nao_autorizados,
)
from llm.routing_policy import MODELOS_LOCAIS, ROTAS, ClasseTarefa

USUARIO = [{"role": "user", "content": "ping"}]

ALIAS = "gpt-6-astra"


#  O modelo, campo a campo, contra a documentacao


def test_astra_esta_registrado_e_e_da_openai() -> None:
    cap = get(ALIAS)
    assert cap.adapter is AdapterType.OPENAI
    assert cap.model_name == "gpt-6-astra"


def test_astra_tem_os_numeros_da_documentacao() -> None:
    """1.05M de janela, 128k de saida, $10/$50. Nada aqui e arredondado."""
    cap = get(ALIAS)
    assert cap.context_window_in == 1_050_000
    assert cap.max_output_tokens == 128_000
    assert cap.price_per_1m_in == 10.00
    assert cap.price_per_1m_out == 50.00


def test_saida_do_astra_e_128000_e_nao_131072() -> None:
    """A familia 5.6 usa 131_072 ("128K"); a pagina do Astra escreve
    "128,000 max output tokens", com virgula. Sao numeros diferentes, e o
    menor e o seguro: estourar o teto devolve HTTP 400. Guardado porque a
    divergencia com os irmaos convida a uma "correcao" que reintroduziria o
    erro."""
    astra = get(ALIAS)
    sol = get("gpt-5.6-sol")
    assert astra.max_output_tokens == 128_000
    assert sol.max_output_tokens == 131_072
    assert astra.max_output_tokens < sol.max_output_tokens


#  O teto de esforco -- a decisao do Tier 0, executavel


def test_astra_opera_em_low_por_decisao_de_custo() -> None:
    """O default e o degrau BARATO. O Astra entrou pela qualidade do modelo
    base, nao pela profundidade de raciocinio -- que e justamente o que se
    paga caro na saida."""
    cap = get(ALIAS)
    assert cap.reasoning_effort == "low"


def test_astra_so_autoriza_low_e_medium() -> None:
    cap = get(ALIAS)
    assert cap.esforcos_autorizados == ("low", "medium")


def test_high_xhigh_e_max_existem_na_api_e_ficam_fora_da_autorizacao() -> None:
    """Nao confundir os dois conjuntos. `high`, `xhigh` e `max` sao validos na
    documentacao da OpenAI -- por isso estao em ESFORCOS_OPENAI_VALIDOS -- e
    mesmo assim nao podem ser usados neste projeto."""
    cap = get(ALIAS)
    for degrau in ("high", "xhigh", "max"):
        assert degrau in ESFORCOS_OPENAI_VALIDOS
        assert degrau not in cap.esforcos_autorizados


def test_elevar_o_esforco_do_astra_acima_do_teto_e_recusado() -> None:
    """O guard que faz a regra valer em runtime, e nao so no registro."""
    with pytest.raises(ParametroRejeitadoError, match="autoriza"):
        OpenAIAdapter.build(ALIAS, USUARIO, effort_override="max")


@pytest.mark.parametrize("degrau", ["low", "medium"])
def test_os_dois_degraus_autorizados_passam(degrau: str) -> None:
    req = OpenAIAdapter.build(ALIAS, USUARIO, effort_override=degrau)
    assert req["reasoning"]["effort"] == degrau


def test_xhigh_entrou_na_escala_e_ultra_continua_recusado() -> None:
    """O guard antigo fixava {none, low, medium, high, max} e barrava 'ultra',
    valor que o estudo de fronteira inventou. `xhigh` NAO e `ultra`: consta da
    documentacao do Astra. Estender a escala nao pode reabrir a porta que o
    guard original fechou."""
    assert "xhigh" in ESFORCOS_OPENAI_VALIDOS
    assert "ultra" not in ESFORCOS_OPENAI_VALIDOS
    for cap in MODEL_REGISTRY.values():
        if cap.adapter is AdapterType.OPENAI and cap.reasoning_effort is not None:
            assert cap.reasoning_effort in ESFORCOS_OPENAI_VALIDOS, cap.model_name


def test_todo_modelo_com_teto_declara_um_esforco_dentro_dele() -> None:
    """Invariante geral: se o campo existe, o default nao pode viola-lo."""
    for alias, cap in MODEL_REGISTRY.items():
        if cap.esforcos_autorizados:
            assert cap.reasoning_effort in cap.esforcos_autorizados, alias


def test_adaptador_monta_o_bloco_de_reasoning_do_astra() -> None:
    req = OpenAIAdapter.build(ALIAS, USUARIO)
    assert req["model"] == "gpt-6-astra"
    assert req["reasoning"]["effort"] == "low"


#  O efeito colateral do upgrade: o preco do Sol


@pytest.mark.parametrize("alias", ["gpt-5.6-sol", "chatgpt-5.6-sol"])
def test_sol_caiu_para_4_e_20_nos_dois_aliases(alias: str) -> None:
    """O registro tinha DOIS aliases para o mesmo `model_name`, ambos a
    $5/$30. Corrigir so um deixaria o custo dependendo de qual nome o chamador
    usou -- que e a fonte paralela que a secao 3 do CLAUDE.md proibe."""
    cap = get(alias)
    assert cap.model_name == "gpt-5.6-sol"
    assert cap.price_per_1m_in == 4.00
    assert cap.price_per_1m_out == 20.00


def test_os_dois_aliases_do_sol_nao_divergem_em_nenhum_numero() -> None:
    a, b = get("gpt-5.6-sol"), get("chatgpt-5.6-sol")
    assert (a.price_per_1m_in, a.price_per_1m_out) == (b.price_per_1m_in, b.price_per_1m_out)
    assert (a.context_window_in, a.max_output_tokens) == (b.context_window_in, b.max_output_tokens)


def test_o_sol_agora_custa_menos_que_o_opus_na_saida() -> None:
    """A rota de GOVERNANCA justificava o Opus dizendo que ele "custa menos na
    saida que o Sol ($25 contra $30)". Com o Sol a $20 a comparacao INVERTEU.
    O guard trava o fato; a escolha da rota continua sendo do Tier 0."""
    sol = get("gpt-5.6-sol")
    opus = get("claude-opus-5")
    assert sol.price_per_1m_out < opus.price_per_1m_out

    rota = ROTAS[ClasseTarefa.GOVERNANCA]
    assert "$25 contra $30" not in rota.justificativa, (
        "A justificativa ainda cita o preco antigo do Sol como vantagem do Opus."
    )


#  Custo: o Astra e caro, e o roteamento tem que continuar sabendo disso


def test_astra_custa_o_dobro_e_meio_do_sol_na_saida() -> None:
    """O Astra e teto de custo, e o roteamento tem que continuar sabendo disso.

    A comparacao com o Fable saiu daqui porque ele deixou de estar no registro:
    afirmar o empate exigiria ler um preco que o codigo nao guarda mais. O
    empate esta registrado em prosa no motivo de MODELOS_RETIRADOS, que e onde
    um fato historico deve viver -- nao numa assercao sobre dado ausente."""
    astra, sol = get(ALIAS), get("gpt-5.6-sol")
    assert astra.price_per_1m_out == 2.5 * sol.price_per_1m_out
    assert astra.price_per_1m_in == 10.00


def test_custo_estimado_do_astra_bate_com_a_tabela() -> None:
    assert custo_estimado(ALIAS, 1_000_000, 200_000) == pytest.approx(10.00 + 0.2 * 50.00)


def test_a_familia_fable_foi_retirada_do_registro() -> None:
    """O Tier 0 mandou retirar em 2026-09-07. Retirar NAO e apagar a memoria:
    os dois saem de MODEL_REGISTRY e entram em MODELOS_RETIRADOS com o motivo.
    Sem esse rastro, o proximo a ler o registro conclui que a Anthropic nao tem
    modelo de topo -- e os reintroduz."""
    for alias in ("claude-fable-5", "claude-fable-5-1"):
        assert alias not in MODEL_REGISTRY
        assert alias in MODELOS_RETIRADOS
        motivo = MODELOS_RETIRADOS[alias]
        assert "RETIRADO" in motivo
        # O motivo tem que nomear a FAIXA. Se disser so "caro", esta errado:
        # por token eles empatavam com o Astra em $10/$50.
        assert "assinatura" in motivo or "pay-as-you-go" in motivo.lower()


def test_pedir_um_modelo_retirado_da_erro_que_explica_a_decisao() -> None:
    """Um KeyError seco mandaria o chamador reintroduzir o modelo. O erro
    carrega o motivo para que a decisao chegue a quem tropeca nela."""
    with pytest.raises(KeyError, match="RETIRADO"):
        get("claude-fable-5-1")


def test_retirado_e_categoria_distinta_de_nao_verificado() -> None:
    """NAO_VERIFICADO = dado que nao se conseguiu confirmar.
    RETIRADO = dado confirmado e recusado. Fundir os dois faria o registro
    mentir sobre a procedencia para expressar uma decisao de logistica."""
    assert not set(MODELOS_RETIRADOS) & set(MODELOS_NAO_VERIFICADOS)
    assert "gpt-5.6-sol-ultrafast" in MODELOS_NAO_VERIFICADOS


def test_o_teto_de_esforco_protege_a_cota_e_nao_so_o_token() -> None:
    """Com cota de assinatura, o esforco alto nao encarece a chamada -- ele
    QUEIMA A COTA mais rapido, e o excedente e que cai no preco cheio. Este
    guard nao inventa quanto raciocinio cada degrau gera (nao foi medido); ele
    trava a afirmacao independente do valor: *dado* que low gasta menos
    raciocinio que um degrau alto, o Astra consome menos da cota."""
    tokens_in, tokens_out = 200_000, 40_000
    for m_baixo, m_alto in ((1.0, 2.0), (1.5, 3.0), (2.0, 5.0)):
        assert custo_estimado(ALIAS, tokens_in, int(tokens_out * m_baixo)) < custo_estimado(
            ALIAS, tokens_in, int(tokens_out * m_alto)
        )
    assert get(ALIAS).esforcos_autorizados == ("low", "medium")


def test_toda_faixa_e_declarada_e_nenhuma_vem_do_default() -> None:
    """A delegacao ao Gemini 3.5 Flash-Lite (2026-09-07) levantou a faixa dos 14
    modelos ativos, e o Tier 0 confirmou o dado. Mas a entrega original o
    aplicou INVERTENDO O DEFAULT do campo para True, e um booleano
    obrigatoriamente True para todos deixa de discriminar -- era exatamente
    este campo que separava o Astra do Fable.

    O guard exige as duas coisas ao mesmo tempo: que a faixa esteja levantada
    em todo modelo ativo, e que cada uma tenha sido DECLARADA na entrada em vez
    de herdada. `model_fields_set` e o discriminante: ele so contem o campo
    quando o valor foi passado ao construtor. Sem esta segunda metade, um
    modelo novo nasceria afirmando ter cota que ninguem levantou -- que e a
    mesma falha de ler ausencia como evidencia, apenas invertida."""
    assert ModelCapability.model_fields["cota_por_assinatura"].default is False, (  # pylint: disable=unsubscriptable-object
        "O default tem que continuar False = NAO DECLARADO. Inverte-lo faz "
        "modelo novo nascer com faixa que ninguem mediu."
    )
    sem_declaracao = {a for a, c in MODEL_REGISTRY.items() if "cota_por_assinatura" not in c.model_fields_set}
    assert not sem_declaracao, f"faixa herdada do default, nao declarada: {sorted(sem_declaracao)}"

    com_cota = {a for a, c in MODEL_REGISTRY.items() if c.cota_por_assinatura}
    assert com_cota == set(MODEL_REGISTRY.keys()), (
        "Os 14 ativos tiveram a faixa levantada e todos tem cota: Anthropic "
        "por Claude Pro/Max, OpenAI por Plus/Pro/Business, Google por Gemini "
        "Advanced e free tier do AI Studio."
    )
    # A familia Fable teve a faixa declarada e saiu por causa dela; o motivo
    # sobrevive em MODELOS_RETIRADOS, nao no campo.
    assert set(MODELOS_RETIRADOS) == {"claude-fable-5", "claude-fable-5-1"}


#  Roteamento: existe degrau acima do raciocinio profundo


def test_raciocinio_profundo_ganhou_degrau_acima() -> None:
    """A rota dizia "Sem degrau acima" e `escalona_para=None`. Deixou de ser
    verdade em 2026-09-03. O escalonamento e ADITIVO: primario e fallback nao
    mudam, porque trocar a rota primaria e decisao do Tier 0."""
    rota = ROTAS[ClasseTarefa.RACIOCINIO_PROFUNDO]
    assert rota.escalona_para == ALIAS
    assert rota.primario == "gpt-5.6-sol"
    assert rota.fallback == "claude-opus-5"


def test_astra_nao_virou_primario_de_nenhuma_rota() -> None:
    """A $10/$50 ele e teto, nao piso. Promove-lo a primario e mudanca de
    politica de custo, e essa nao se faz por inferencia do agente."""
    for classe, rota in ROTAS.items():
        assert rota.primario != ALIAS, f"{classe}: Astra virou primario sem autorizacao."


#  Nenhuma rota pode apontar para modelo que saiu


def test_nenhuma_rota_aponta_para_modelo_retirado_ou_nao_autorizado() -> None:
    """O guard central desta mudanca. Ate 2026-09-07 a rota SESSAO_MULTI_DIA
    tinha `claude-fable-5` como PRIMARIO -- a tabela roteava para um modelo que
    a malha nao usa, e nada acusava. Cobre as duas categorias de saida: o que
    foi RETIRADO do registro e o que segue registrado sem autorizacao."""
    proibidos = dict(MODELOS_RETIRADOS) | modelos_nao_autorizados()
    assert proibidos, "As duas listas esvaziaram ao mesmo tempo: mecanismo sumiu?"
    for classe, rota in ROTAS.items():
        for papel, alias in (
            ("primario", rota.primario),
            ("fallback", rota.fallback),
            ("escalona_para", rota.escalona_para),
        ):
            assert alias not in proibidos, f"{classe}.{papel} = {alias}"


def test_toda_rota_aponta_para_modelo_que_existe_de_fato() -> None:
    """Contraparte: retirar um modelo do registro sem tirar das rotas deixaria
    o roteador citando alias que `get()` recusa -- falha em runtime, nao em
    teste."""
    for classe, rota in ROTAS.items():
        for alias in filter(None, (rota.primario, rota.fallback, rota.escalona_para)):
            assert alias in MODEL_REGISTRY or alias in MODELOS_LOCAIS, f"{classe}: {alias}"


def test_sessao_multi_dia_declara_a_perda_em_vez_de_esconde_la() -> None:
    """A auto-verificacao assincrona do Fable nao tem substituto na tabela.
    Trocar o primario sem dizer isso transformaria uma perda de capacidade em
    um detalhe de configuracao."""
    rota = ROTAS[ClasseTarefa.SESSAO_MULTI_DIA]
    assert rota.primario == "claude-opus-5"
    assert "PERDA DECLARADA" in rota.justificativa


def test_sonnet5_custa_dois_e_dez_e_a_rota_de_construcao_sabe_disso() -> None:
    """O registro cobrava $3/$15 -- que e o Sonnet 4.6, nao o 5."""
    sonnet, opus = get("claude-sonnet-5"), get("claude-opus-5")
    assert (sonnet.price_per_1m_in, sonnet.price_per_1m_out) == (2.00, 10.00)
    assert sonnet.price_per_1m_out / opus.price_per_1m_out == pytest.approx(0.40)

    # A justificativa AFIRMA 40% e MENCIONA 60% para registrar a correcao.
    # Proibir a palavra apagaria justamente a memoria do erro -- o que se
    # exige e que o numero afirmado seja o medido.
    rota = ROTAS[ClasseTarefa.CONSTRUCAO]
    assert "40% do preco do Opus" in rota.justificativa
    assert "por 60% do preco" not in rota.justificativa


def test_rotas_que_citam_o_astra_foram_reancoradas() -> None:
    """`ancorado_em` e o proxy de decaimento do roteador. Uma rota que passa a
    citar um modelo novo, mantendo ancora velha, mente sobre quando foi
    verificada."""
    for classe, rota in ROTAS.items():
        if ALIAS in rota.modelos_citados:
            assert rota.ancorado_em >= "2026-09-07", f"{classe}: ancora velha."
