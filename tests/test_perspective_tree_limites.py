"""Guarda B05 -- os limites do schema pontual valem tambem na arvore.

FINDING B05 do Astra, auditoria de 2026-09-07, classificado P1: "API de arvore
aceita entrada impossivel". A validacao de 2026-09-07 fechou parcialmente --
`fold_equity=2` passou a ser rejeitado -- e deixou registrado que
`valuation_stack=-1` continuava ACEITO em PerspectiveTreeRequest enquanto era
rejeitado em PerspectiveCalculationRequest.

MEDIDO EM 2026-09-09, ao fechar: o defeito e MAIOR que o finding descrevia. SEIS
campos existem nos dois schemas e tinham limite apenas no pontual:

    valuation_stack     ge=0.01        -> nenhum
    realization_factor  ge=0.1 le=2.5  -> nenhum
    edge_base           ge=0.0         -> nenhum
    aggression_factor   ge=0.0         -> nenhum
    base_rio            ge=0.0         -> nenhum
    loss_aversion_base  ge=1.0         -> nenhum

MEIA CORRECAO E PIOR QUE NENHUMA, porque parece feita. Este guard fecha os seis e
fixa a propagacao, para que um campo novo com limite no pontual nao volte a
entrar sem limite na arvore.

O QUE NAO FOI INVENTADO: `fgs_health` e `rp_opp` existem apenas em
PerspectiveTreeRequest. Nao ha schema irmao de onde derivar um limite, e
atribuir um por suposicao seria fabricar contrato. Eles seguem sem limite, e
isso esta DECLARADO em vez de silenciado.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from core.perspective_schemas import (
    PerspectiveCalculationRequest,
    PerspectiveTreeRequest,
)

# Campos com limite no schema pontual, e o valor impossivel que os viola.
LIMITES_PROPAGADOS = [
    ("valuation_stack", -1.0),
    ("valuation_stack", 0.0),
    ("realization_factor", -0.5),
    ("realization_factor", 3.0),
    ("edge_base", -0.1),
    ("aggression_factor", -1.0),
    ("base_rio", -0.5),
    ("loss_aversion_base", 0.5),
]

BASE_ARVORE = {"equity": 0.5, "pot_size": 10.0, "stack_eff": 25.0}


def _arvore(**extra):
    return PerspectiveTreeRequest.model_validate({**BASE_ARVORE, **extra})


def test_arvore_aceita_o_caso_valido():
    """Controle: sem ele, um schema que recusa TUDO passaria nos testes abaixo."""
    req = _arvore()
    assert req.valuation_stack == 1.0
    assert req.realization_factor == 1.0
    assert req.loss_aversion_base == 2.25


@pytest.mark.parametrize(("campo", "valor"), LIMITES_PROPAGADOS)
def test_arvore_rejeita_valor_impossivel(campo: str, valor: float):
    with pytest.raises(ValidationError):
        _arvore(**{campo: valor})


@pytest.mark.parametrize(("campo", "valor"), LIMITES_PROPAGADOS)
def test_o_schema_pontual_rejeita_o_mesmo_valor(campo: str, valor: float):
    """A propagacao so faz sentido se o pontual de fato rejeita.

    Sem esta contraprova, um limite que eu tivesse INVENTADO na arvore passaria
    por "propagado" sem ter origem alguma no schema irmao.
    """
    with pytest.raises(ValidationError):
        PerspectiveCalculationRequest.model_validate({"equity": 0.5, campo: valor})


def test_fold_equity_segue_limitado():
    """A meia correcao de 2026-09-07 nao pode regredir ao fechar o resto."""
    with pytest.raises(ValidationError):
        _arvore(fold_equity=2.0)
    with pytest.raises(ValidationError):
        _arvore(fold_equity=-0.1)


def test_campos_sem_par_seguem_declarados_sem_limite():
    """fgs_health e rp_opp nao tem schema irmao de onde derivar limite.

    Este teste NAO afirma que eles deveriam ser livres -- afirma que a decisao
    de nao lhes atribuir limite foi consciente. Se um limite for definido para
    eles, que seja por medicao do dominio, e este teste cai junto, de proposito.
    """
    req = _arvore(fgs_health=-5.0, rp_opp=-99.0)
    assert req.fgs_health == -5.0
    assert req.rp_opp == -99.0
