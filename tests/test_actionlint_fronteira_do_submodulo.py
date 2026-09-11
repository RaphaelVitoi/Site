"""Guarda da fronteira do submodulo no passo de Actionlint.

MEDIDO EM 2026-09-09. Destravados o Ruff, o WASM, o Prisma e o pytest, o job
`Security Headers & Architecture Quality Gate` rodou pela PRIMEIRA VEZ -- ele
depende dos anteriores e ficava `skipped`. E reprovou no Actionlint:

    skills/gemini-cli-security/.github/workflows/gemini-review.yml:68:36:
    property "additional_context" is not defined in object type {}

Aquele arquivo NAO e versionado por este repositorio. `git ls-files
--error-unmatch` sobre ele devolve "did not match any file(s) known to git",
porque o caminho esta dentro do gitlink `2227f3cf`. O conteudo pertence a
`gemini-cli-extensions/security` e muda a cada `git submodule update` --
alteracao local ali e descartada, entao o defeito nao era corrigivel aqui.

O veredito do NOSSO CI dependia do estado de um repositorio de terceiro. E
exatamente o que o `registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo`
mediu na fase 3, e a frase de la se aplica ao pe da letra: *o MESMO commit
aprovaria numa maquina e reprovaria noutra*.

A correcao e o mesmo mecanismo que aquele registro consagrou: enumerar por
`git ls-files`, que nunca entra em submodulo -- e nao varrer o disco, que faria
o resultado depender de quais submodulos estao inicializados na maquina.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name

import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
WORKFLOW = RAIZ / ".github" / "workflows" / "sota-ci.yml"
PACKAGE = RAIZ / "package.json"


@pytest.fixture(scope="module")
def workflow_texto() -> str:
    assert WORKFLOW.is_file(), f"workflow nao encontrado em {WORKFLOW}"
    return WORKFLOW.read_text(encoding="utf-8")


def _passo_actionlint(texto: str) -> str:
    inicio = texto.find("Actionlint GitHub Workflows Static Analysis")
    assert inicio != -1, "o passo de Actionlint sumiu do workflow"
    fim = texto.find("- name:", inicio)
    return texto[inicio : fim if fim != -1 else len(texto)]


def test_actionlint_nao_valida_workflow_de_submodulo(workflow_texto: str):
    trecho = _passo_actionlint(workflow_texto)
    assert "skills/" not in trecho, (
        "o passo de Actionlint voltou a validar workflow dentro de skills/, que "
        "e conteudo de submodulo e nao e versionado aqui. O veredito do CI "
        "passa a depender de um repositorio que este projeto nao governa, e o "
        "defeito nao e corrigivel deste lado."
    )


def test_actionlint_enumera_por_git_ls_files(workflow_texto: str):
    trecho = _passo_actionlint(workflow_texto)
    assert "git ls-files" in trecho, (
        "a enumeracao por git ls-files sumiu. Varrer o disco faria o resultado "
        "depender de quais submodulos estao inicializados na maquina -- o "
        "defeito que o registro de 2026-09-03 corrigiu na fase 3."
    )


def test_lista_vazia_nao_aprova_em_silencio(workflow_texto: str):
    """Sem workflow enumerado, actionlint sairia 0 sem ter medido nada."""
    trecho = _passo_actionlint(workflow_texto)
    assert 'test "${#WORKFLOWS[@]}" -gt 0' in trecho, (
        "a guarda contra lista vazia sumiu. Se git ls-files nao devolver nada, "
        "o actionlint recebe zero argumentos e aprova sem medir -- falso verde, "
        "que e pior que a reprovacao honesta."
    )


def test_enumeracao_usa_array_e_nao_string(workflow_texto: str):
    """MEDIDO EM 2026-09-09: a primeira versao usava `$WORKFLOWS` sem aspas.

    O actionlint roda shellcheck dentro dos blocos `run:` e acusou
    `SC2086: Double quote to prevent globbing and word splitting`, derrubando o
    job. E aspas NAO resolvem: `"$WORKFLOWS"` viraria um unico argumento
    contendo quebras de linha, e o actionlint receberia um nome de arquivo
    inexistente.

    A forma correta e array, alimentado por `git ls-files -z` com `mapfile -d ''`
    -- que separa por NUL e portanto sobrevive a espaco em nome de arquivo.

    Nao peguei isso localmente porque validei o COMANDO solto em vez do
    WORKFLOW. Validar o comando nao e validar o passo.
    """
    trecho = _passo_actionlint(workflow_texto)
    assert "${WORKFLOWS[@]}" in trecho, (
        "a expansao em array sumiu. Com $WORKFLOWS sem aspas o shellcheck acusa "
        "SC2086 e o job cai; com aspas simples vira um argumento unico invalido."
    )
    assert "git ls-files -z" in trecho and "mapfile -d ''" in trecho, (
        "a leitura separada por NUL sumiu. Sem ela, nome de arquivo com espaco quebraria a enumeracao em pedacos."
    )


def test_script_npm_acompanha_o_workflow():
    """O lint:workflows local e o passo do CI tem de medir a mesma coisa."""
    pacote = json.loads(PACKAGE.read_text(encoding="utf-8"))
    script = pacote["scripts"]["lint:workflows"]
    assert "skills/" not in script, (
        "o script npm voltou a apontar para workflow de submodulo, divergindo "
        "do CI. Portao local e CI que verificam coisas diferentes foi o que "
        "manteve o job Python vermelho por seis dias."
    )
    assert "git ls-files" in script, "o script npm deixou de enumerar por git ls-files."
