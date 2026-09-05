"""Testes do adaptador export HRC -> par de evidencia PMev.

POR QUE ESTE MODULO EXISTE, E POR QUE SO O HRC:

    O `AULA_1_2_EVIDENCE_LEDGER.md` condiciona qualquer ajuste de constante em
    `solveIcmDistortion` a tres pares INDEPENDENTES E REPRODUZIVEIS. Hoje
    `countReproduciblePairs(AULA_1_2_PAIRS)` retorna zero de sete: os sete pares
    sao transcricoes manuais de captura, e captura nao expoe build nem e-Nash.

    Ate aqui nao havia caminho nenhum de um arquivo de export ate um
    `EvidencePair`. Todo par existente e literal escrito a mao em
    `aula12Pairs.ts`, e um export que chegasse teria de ser transcrito de novo --
    exatamente o que o contrato de evidencia existe para impedir.

    O ADAPTADOR E EXCLUSIVAMENTE DO HRC PORQUE O GTO WIZARD NAO EXPORTA
    (Tier 0, 2026-09-04). Nao e limitacao do parser: e o produto que nao oferece
    a saida. Escrever ramo de GTO Wizard aqui seria codigo morto por construcao.

    A CONSEQUENCIA E O DESENHO DO PAR. Se um dos regimes nao pode vir de export,
    o unico par reproduzivel possivel e `ChipEV(HRC) x ICMev(HRC)` -- dois
    exports do MESMO solver, no MESMO no, com o regime como unica variavel. O
    handoff de 2026-09-03 ja preferia essa forma por controle experimental;
    depois da correcao do Tier 0 ela deixa de ser preferencia e passa a ser a
    unica via.

O QUE ESTE ADAPTADOR NAO FAZ: inferir. Regime, identidade da fonte e contexto do
no sao DECLARADOS por quem chama, nunca deduzidos do arquivo. Um export do HRC
nao diz se foi rodado em ChipEV ou ICMev -- quem escolheu foi o operador, e e ele
quem declara.
"""

from __future__ import annotations

import pytest

from engine.solver_importers.hrc_evidence import construir_par_de_evidencia

# ---------------------------------------------------------------------------
# Exports sinteticos hermeticos -- nenhum acesso a disco, rede ou solver real.
# ---------------------------------------------------------------------------

_EXPORT_CHIPEV = """HoldemResources Calculator Pro Export v2.4.1
Game: No Limit Hold'em MTT Final Table (8 Players)
Blinds: 25k/50k Ante: 5k
CI: 0.31%
"""

_EXPORT_ICMEV = """HoldemResources Calculator Pro Export v2.4.1
Game: No Limit Hold'em MTT Final Table (8 Players)
Blinds: 25k/50k Ante: 5k
CI: 0.44%
"""

_SOURCE = {
    "documentSha256": "7ca7c89f52c1a4173ee404f1bc4059cabd564fddfb62129a6cd34789b86e4769",
    "figureIndex": 12,
    "nodeLabel": "BB vs BTN cbet flop",
}

_CONTEXT = {
    "street": "flop",
    "board": "Kd Jc Ts",
    "potBb": 5.63,
    "players": [
        {"id": "BB", "position": "OOP", "stackBb": 53.0},
        {"id": "BTN", "position": "IP", "stackBb": 38.0},
    ],
}


def _par():
    return construir_par_de_evidencia(
        chip_ev_raw=_EXPORT_CHIPEV,
        icm_ev_raw=_EXPORT_ICMEV,
        source=_SOURCE,
        context=_CONTEXT,
    )


def test_os_dois_lados_carregam_procedencia_extraida_do_proprio_export():
    """O par nasce com build e e-Nash nos dois regimes, lidos do cabecalho.

    Este e o comportamento que separa este adaptador de uma transcricao: nada
    aqui foi digitado por um humano lendo uma tela.
    """
    par = _par()

    for lado in ("chipEv", "icmEv"):
        proc = par[lado]["provenance"]
        assert proc["build"] == {"kind": "read", "value": "v2.4.1"}, lado
        assert proc["eNashUnit"] == {"kind": "read", "value": "pct"}, lado

    assert par["chipEv"]["provenance"]["eNash"] == {"kind": "read", "value": 0.31}
    assert par["icmEv"]["provenance"]["eNash"] == {"kind": "read", "value": 0.44}


def test_o_regime_e_declarado_pelo_chamador_e_nunca_inferido_do_arquivo():
    """Os dois exports sao textualmente quase identicos e o regime os distingue.

    Um export do HRC nao registra se o solve foi ChipEV ou ICMev. Se o adaptador
    tentasse inferir, inferiria do nada.
    """
    par = _par()

    assert par["chipEv"]["regime"] == "chipEV"
    assert par["icmEv"]["regime"] == "icmEV"
    assert par["chipEv"]["solver"] == "HRC"
    assert par["icmEv"]["solver"] == "HRC"


def test_o_rotulo_nativo_ci_sobrevive_ate_o_par():
    """`CI` e o nome que o HRC da a distancia ao equilibrio, e ele nao se perde.

    Guardar so o numero perderia QUAL metrica foi lida, e rotulos distintos saem
    de algoritmos distintos.
    """
    par = _par()

    assert par["chipEv"]["provenance"]["eNashLabel"] == {"kind": "read", "value": "CI"}


def test_export_sem_e_nash_produz_ilegivel_e_jamais_zero():
    """Ausencia e ignorancia; zero seria convergencia perfeita.

    Colapsar os dois afirmaria a convergencia mais forte possivel a partir de um
    campo que ninguem leu.
    """
    sem_ci = "HoldemResources Calculator Pro Export v2.4.1\nGame: MTT\n"

    par = construir_par_de_evidencia(
        chip_ev_raw=sem_ci,
        icm_ev_raw=_EXPORT_ICMEV,
        source=_SOURCE,
        context=_CONTEXT,
    )

    assert par["chipEv"]["provenance"]["eNash"]["kind"] == "unreadable"
    assert "value" not in par["chipEv"]["provenance"]["eNash"]


def test_export_sem_e_nash_nao_declara_unidade_de_coisa_nenhuma():
    """Unidade sem numero nao descreve nada, e afirma-la seria ruido."""
    sem_ci = "HoldemResources Calculator Pro Export v2.4.1\nGame: MTT\n"

    par = construir_par_de_evidencia(
        chip_ev_raw=sem_ci,
        icm_ev_raw=_EXPORT_ICMEV,
        source=_SOURCE,
        context=_CONTEXT,
    )

    assert par["chipEv"]["provenance"]["eNashUnit"]["kind"] == "unreadable"


def test_conteudo_que_nao_e_export_do_hrc_e_recusado():
    """Um arquivo qualquer nao vira evidencia por ser passado a esta funcao.

    `detect_format` ja sabe reconhecer o formato; recusar aqui impede que texto
    arbitrario entre no conjunto medido pelo portao com procedencia vazia.
    """
    with pytest.raises(ValueError, match="HRC"):
        construir_par_de_evidencia(
            chip_ev_raw="qualquer coisa que nao e um export",
            icm_ev_raw=_EXPORT_ICMEV,
            source=_SOURCE,
            context=_CONTEXT,
        )


def test_o_contexto_declarado_atravessa_para_o_par_em_forma_medida():
    """Board e pote viram `Measured`, como todo campo do contrato de evidencia."""
    par = _par()

    assert par["context"]["street"] == "flop"
    assert par["context"]["board"] == {"kind": "read", "value": "Kd Jc Ts"}
    assert par["context"]["potBb"] == {"kind": "read", "value": 5.63}
    assert par["context"]["players"][0] == {
        "id": "BB",
        "position": "OOP",
        "stackBb": {"kind": "read", "value": 53.0},
    }


def test_a_identidade_da_fonte_atravessa_intacta():
    """`source` e procedencia documental e nao sofre transformacao."""
    par = _par()

    assert par["source"] == _SOURCE
