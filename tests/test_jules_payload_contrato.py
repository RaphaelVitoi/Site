"""O payload do bridge tem de bater com o contrato real da API v1alpha.

DOIS CAMPOS DIVERGIAM, E O SEGUNDO ERA PERIGOSO. Medido em 2026-09-04 contra a
documentacao oficial (jules.google/docs/api/reference/sessions) e confirmado por
uma sessao criada com sucesso via POST direto:

    bridge enviava              API espera
    --------------------------  ---------------------------
    githubRepoContext.branch    githubRepoContext.startingBranch
    autoApprovePlan             requirePlanApproval

O PRIMEIRO faz o branch ser ignorado: a sessao roda no branch default do
repositorio, nao no que o chamador pediu.

O SEGUNDO INVERTE UMA GARANTIA DE SEGURANCA. A documentacao e literal: "If true,
plans require explicit approval before execution. If not set, plans are
auto-approved." Como `autoApprovePlan` nao e campo reconhecido, ele era
descartado -- e o default da API e AUTO-APROVAR. Logo `auto_approve_plan=False`
no bridge produzia exatamente o oposto do que promete: o plano era executado sem
revisao, e nada avisava.

E o mesmo padrao de defeito do `model_tier` do Stitch: parametro que aparenta
controlar e nao alcanca mecanismo nenhum. A diferenca e que aqui o que se perde
e o portao de aprovacao humana.
"""

from __future__ import annotations

from engine.jules_bridge import JulesSessionRequest


def _payload(**kwargs) -> dict:
    base = {
        "source": "sources/github/RaphaelVitoi/Site",
        "prompt": "tarefa qualquer",
        "branch": "master",
    }
    base.update(kwargs)
    return JulesSessionRequest(**base).to_payload()


def test_o_branch_vai_no_campo_que_a_api_le():
    """`startingBranch`, nao `branch` -- senao a sessao roda no default do repo."""
    ctx = _payload(branch="master")["sourceContext"]["githubRepoContext"]

    assert ctx["startingBranch"] == "master"
    assert "branch" not in ctx


def test_exigir_aprovacao_e_o_default_do_bridge():
    """Sem dizer nada, o plano NAO pode ser auto-aprovado.

    O default da API e auto-aprovar; o default do bridge e o contrario. Um
    chamador que nao pensou no assunto recebe o comportamento seguro.
    """
    assert _payload()["requirePlanApproval"] is True


def test_auto_aprovar_exige_pedido_explicito():
    """`auto_approve_plan=True` desliga a exigencia -- e so ele."""
    assert _payload(auto_approve_plan=True)["requirePlanApproval"] is False


def test_o_campo_nao_reconhecido_nao_e_mais_enviado():
    """`autoApprovePlan` nao existe no contrato: enviar e ruido silencioso."""
    assert "autoApprovePlan" not in _payload()


def test_o_titulo_entra_quando_declarado():
    """`title` e opcional na API; quando ausente o Jules gera um."""
    p = _payload(title="Sanidade do runner")

    assert p["title"] == "Sanidade do runner"


def test_sem_titulo_o_campo_nao_e_enviado_vazio():
    """Titulo vazio nao e titulo: deixar a API gerar e melhor que mandar ''."""
    assert "title" not in _payload()


def test_prompt_e_source_atravessam_sem_transformacao():
    """O que nao precisa mudar, nao muda."""
    p = _payload()

    assert p["prompt"] == "tarefa qualquer"
    assert p["sourceContext"]["source"] == "sources/github/RaphaelVitoi/Site"
