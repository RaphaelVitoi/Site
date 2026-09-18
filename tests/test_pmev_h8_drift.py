"""Guards de H8 -- Downward Drift de Sizings.

O QUE ESTES TESTES PROTEGEM: o criterio de falsificacao e a convencao de fracao
do pote. Nenhum deles fixa o VEREDITO de H8: se a evidencia mudar, o veredito
pode mudar, e nada aqui deve impedi-lo. Fixar o resultado seria transformar uma
hipotese falsificavel num invariante, que e o contrario do que ela e.
"""

from __future__ import annotations

import pytest

from engine.pmev_aula12_evidence import load_aula12_pairs
from engine.pmev_h8_drift import (
    LIMIAR_FRACAO_DO_POTE,
    N_BOOTSTRAP,
    SEMENTE,
    TOLERANCIA_LIMIAR_ESTRITA,
    TOLERANCIA_LIMIAR_POR_RESOLUCAO,
    TOLERANCIA_ROTULO_PP,
    ActionClass,
    Verdict,
    classify_action,
    classify_action_in_side,
    free_bet_nodes,
    frequency_at_or_above_threshold,
    is_free_bet_node,
    label_declared_pot_pct,
    measure_h8,
    node_drift,
    sign_test_p_two_sided,
)
from engine.pmev_scenario import Read

NOS_DE_APOSTA_LIVRE_ESPERADOS = (
    "PAR_1_BB_LEADING",
    "PAR_2_IP_APOS_CHECK",
    "PAR_6_BB_TURN_APOS_CALL",
    "PAR_4_OOP_RIVER",
)


# ---------------------------------------------------------------------------
# O recorte: quais nos entram, e por que os de aumento ficam fora
# ---------------------------------------------------------------------------


def test_o_recorte_primario_sao_os_quatro_nos_de_aposta_livre():
    """Arbitragem do Tier 0 em 2026-09-18 (opcao A). Mudar o recorte reprova aqui, e fica declarado."""
    assert tuple(p.key for p in free_bet_nodes()) == NOS_DE_APOSTA_LIVRE_ESPERADOS


def test_o_discriminante_e_pedir_mesa_e_nao_a_grafia_do_rotulo():
    """`Allin 27.2 (87%)` do GTOW e `bets 24.94bb` do HRC sao o MESMO ramo no no de river."""
    river = next(p for p in load_aula12_pairs() if p.key == "PAR_4_OOP_RIVER")
    assert classify_action("Allin 27.2 (87%)") is ActionClass.RAISE
    assert classify_action_in_side("Allin 27.2 (87%)", river.chip_ev) is ActionClass.BET
    assert is_free_bet_node(river.chip_ev)
    assert is_free_bet_node(river.icm_ev)


def test_convencao_de_fracao_do_pote_reproduz_o_rotulo_em_todo_no_de_aposta():
    """MEDIDO, nao presumido: sizing/pote bate com o percentual do proprio GTO Wizard.

    E isto que autoriza aplicar a mesma conversao ao lado HRC, que nao declara
    percentual algum. Sem esta conferencia, a estatistica de H8 seria construida
    sobre uma convencao suposta.
    """
    conferidos = 0
    for par in free_bet_nodes():
        pote = par.pot_bb
        assert isinstance(pote, Read)
        for acao in par.chip_ev.actions:
            if classify_action_in_side(acao.label, par.chip_ev) is not ActionClass.BET:
                continue
            declarado = label_declared_pot_pct(acao.label)
            if declarado is None or not isinstance(acao.sizing_bb, Read):
                continue
            calculado = 100.0 * acao.sizing_bb.value / pote.value
            assert abs(calculado - declarado) <= TOLERANCIA_ROTULO_PP, (par.key, acao.label, calculado, declarado)
            conferidos += 1
    assert conferidos >= 7


def test_a_mesma_convencao_nao_vale_nos_nos_de_aumento_e_e_por_isso_que_eles_ficam_fora():
    """A exclusao dos raises e medida, nao preferencia.

    `Raise 5 (50%)` com pote 6.73 da 74% por sizing/pote: o rotulo do GTOW mede
    raise-by sobre o pote-apos-call, outra grandeza. O lado HRC nao expoe
    percentual para calibrar a conversao, entao a comparacao entre regimes ficaria
    sobre bases diferentes. Se alguem resolver a conversao de raise, este teste
    reprova -- e a mudanca fica declarada em vez de silenciosa.
    """
    livres = {p.key for p in free_bet_nodes()}
    aumentos = [p for p in load_aula12_pairs() if p.key not in livres]
    assert aumentos, "a fixture precisa conter nos de aumento para este guard valer"

    divergiu = False
    for par in aumentos:
        pote = par.pot_bb
        assert isinstance(pote, Read)
        for acao in par.chip_ev.actions:
            declarado = label_declared_pot_pct(acao.label)
            if declarado is None or not isinstance(acao.sizing_bb, Read) or acao.sizing_bb.value <= 0:
                continue
            calculado = 100.0 * acao.sizing_bb.value / pote.value
            if abs(calculado - declarado) > TOLERANCIA_ROTULO_PP:
                divergiu = True
    assert divergiu, "sem divergencia medida, a exclusao dos nos de aumento perde a justificativa"


# ---------------------------------------------------------------------------
# A estatistica
# ---------------------------------------------------------------------------


def test_o_ramo_rotulado_50_pct_nao_alcanca_o_limiar_em_comparacao_estrita():
    """O CASO DE FRONTEIRA, medido antes de qualquer veredito.

    PAR_2, pote 5.63: o GTO Wizard rotula `Bet 2.8 (50%)`, e 2.8 / 5.63 = 49.73%.
    O ramo gemeo do HRC, `bets 2.81bb`, da 49.91%. Os dois ficam ABAIXO de 0.50
    por arredondamento de leitura, e a 82.5 p.p. de frequencia no lado ChipEV o
    caso decide a MAGNITUDE do resultado inteiro.

    Este teste existe para que a fronteira seja um fato declarado, e nao um
    detalhe que alguem descubra depois lendo o numero final.
    """
    par = next(p for p in load_aula12_pairs() if p.key == "PAR_2_IP_APOS_CHECK")
    pote = par.pot_bb
    assert isinstance(pote, Read)
    assert 2.8 / pote.value == pytest.approx(0.4973, abs=5e-5)

    estrita = frequency_at_or_above_threshold(par.chip_ev, pote.value, tolerance=TOLERANCIA_LIMIAR_ESTRITA)
    assert estrita == pytest.approx(6.6, abs=1e-9)

    por_resolucao = frequency_at_or_above_threshold(par.chip_ev, pote.value, tolerance=TOLERANCIA_LIMIAR_POR_RESOLUCAO)
    assert por_resolucao == pytest.approx(82.5 + 6.6, abs=1e-9)


def test_a_folga_de_resolucao_nunca_diminui_a_frequencia_contada():
    """Monotonicidade: afrouxar o corte so pode incluir ramos, nunca excluir."""
    for par in free_bet_nodes():
        pote = par.pot_bb
        assert isinstance(pote, Read)
        for lado in (par.chip_ev, par.icm_ev):
            estrita = frequency_at_or_above_threshold(lado, pote.value, tolerance=TOLERANCIA_LIMIAR_ESTRITA)
            frouxa = frequency_at_or_above_threshold(lado, pote.value, tolerance=TOLERANCIA_LIMIAR_POR_RESOLUCAO)
            assert frouxa >= estrita - 1e-9, (par.key, lado.solver)


def test_nenhuma_das_duas_convencoes_de_fronteira_e_default_silencioso():
    """O default e o estrito, e o relatorio e obrigado a trazer as duas.

    Escolher uma so no codigo e depois reportar um numero seria escolher a
    convencao pelo resultado. O guard fixa que as duas existem e que a estrita e
    a que o modulo aplica sem pedir.
    """
    assert TOLERANCIA_LIMIAR_ESTRITA == 0.0
    assert TOLERANCIA_LIMIAR_POR_RESOLUCAO == 0.005
    assert measure_h8().tolerancia_limiar == TOLERANCIA_LIMIAR_ESTRITA


def test_delta_e_icm_menos_chipev_e_negativo_e_a_direcao_que_h8_afirma():
    for par in free_bet_nodes():
        d = node_drift(par)
        assert d.delta_pp == pytest.approx(d.f_ge_threshold_icm_pct - d.f_ge_threshold_chip_pct, abs=1e-9)


def test_o_sinal_do_veredito_nao_depende_da_convencao_de_fronteira():
    """A fronteira pode mover a MAGNITUDE; se mover o SINAL, o resultado nao e robusto.

    Este guard nao afirma qual e o veredito: afirma que as duas convencoes
    concordam entre si. Se um dia discordarem, ele reprova, e a divergencia vira
    achado declarado em vez de numero escolhido.
    """
    estrito = measure_h8(tolerance=TOLERANCIA_LIMIAR_ESTRITA)
    frouxo = measure_h8(tolerance=TOLERANCIA_LIMIAR_POR_RESOLUCAO)
    assert estrito.verdict is frouxo.verdict, (
        estrito.delta_medio_pp,
        estrito.ic95_pp,
        frouxo.delta_medio_pp,
        frouxo.ic95_pp,
    )


# ---------------------------------------------------------------------------
# O criterio de falsificacao
# ---------------------------------------------------------------------------


def test_teste_de_sinal_bate_com_a_binomial_exata():
    assert sign_test_p_two_sided(4, 4) == pytest.approx(0.125, abs=1e-12)
    assert sign_test_p_two_sided(3, 3) == pytest.approx(0.25, abs=1e-12)
    assert sign_test_p_two_sided(5, 5) == pytest.approx(0.0625, abs=1e-12)
    assert sign_test_p_two_sided(2, 4) == pytest.approx(1.0, abs=1e-12)


def test_nenhum_resultado_possivel_alcanca_significancia_no_recorte_primario():
    """LIMITE DE POTENCIA, declarado antes da corrida.

    Com quatro nos, o p minimo do teste de sinal e 0.125. 'Nao significativo'
    aqui e propriedade da amostra, nao veredito sobre a hipotese -- e este teste
    existe para que ninguem leia um p alto como refutacao independente.
    """
    resultado = measure_h8()
    assert resultado.p_minimo_alcancavel > 0.05


def test_o_criterio_recusa_ic_que_contem_zero():
    """Falsificacao literal do registro: 'frequencia inalterada' nao excluida e refuta."""
    resultado = measure_h8()
    if resultado.verdict is Verdict.SOBREVIVE:
        assert resultado.delta_medio_pp < 0
        assert resultado.ic95_pp[1] < 0
    else:
        assert resultado.delta_medio_pp >= 0 or resultado.ic95_pp[0] <= 0 <= resultado.ic95_pp[1]


def test_a_corrida_e_deterministica_sob_a_mesma_semente():
    a, b = measure_h8(), measure_h8()
    assert a.ic95_pp == b.ic95_pp
    assert a.delta_medio_pp == b.delta_medio_pp
    assert a.verdict is b.verdict


def test_os_parametros_sao_os_declarados_e_nao_se_ajustam_a_dado():
    resultado = measure_h8()
    assert (resultado.limiar_fracao_do_pote, resultado.n_bootstrap, resultado.semente) == (
        LIMIAR_FRACAO_DO_POTE,
        N_BOOTSTRAP,
        SEMENTE,
    )
    assert (LIMIAR_FRACAO_DO_POTE, N_BOOTSTRAP, SEMENTE) == (0.50, 2000, 20260918)


# ---------------------------------------------------------------------------
# Falha fechado
# ---------------------------------------------------------------------------


def test_recorte_vazio_falha_em_vez_de_devolver_veredito():
    with pytest.raises(ValueError, match="nada medido nao e resultado"):
        measure_h8(())


def test_pote_invalido_recusa_a_medida():
    par = next(p for p in free_bet_nodes())
    with pytest.raises(ValueError, match="Pote invalido"):
        frequency_at_or_above_threshold(par.chip_ev, 0.0)
