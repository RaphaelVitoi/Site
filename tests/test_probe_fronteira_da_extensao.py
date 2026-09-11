"""Guarda da fronteira da extensao no probe de acessibilidade.

MEDIDO EM 2026-09-09. O portao estava com 2 warnings NO TETO de 2 -- qualquer
warning novo passaria a bloquear commit. Um dos dois era a11y.AXE_INCOMPLETE com
RULE_MISMATCH: o baseline aprova UMA regra inconclusiva e o runtime devolvia
DUAS.

A segunda regra era aria-hidden-focus, com 2 nodes, nos alvos
["tinamind-app", 'div[data-sentinel="start"]'] e o equivalente "end". E
`git grep` por "tinamind" e por "data-sentinel" em todo o repositorio devolve
NADA: o elemento nao existe no codigo versionado. Ele vem das extensoes do
perfil de medicao -- SOTA COCKPIT e NANO TAB, declaradas pelo Tier 0 --, e o
Chrome da porta 9222 tem 8 targets de extensao carregados.

POR QUE ISSO IMPORTA ALEM DO WARNING: sem a exclusao, o veredito de a11y do
portao depende de quais extensoes estao instaladas no navegador de medicao, e o
MESMO commit aprova numa maquina e reprova noutra. E o principio que o
`registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil` fixou -- o
portao nao depende de perfil -- e o mesmo defeito que o passo de Actionlint
tinha ao validar workflow de submodulo.

A LISTA E POR NOME EXPLICITO, E ESSA ESCOLHA TEM CASO. Uma primeira versao
excluia todo custom element filho direto do body, com deteccao "generica". O
teste a derrubou por dois motivos: ela removia o `next-route-announcer`, que e
do PROPRIO Next.js e anuncia mudanca de rota a leitores de tela -- cobertura de
a11y REAL --, e o aria-hidden-focus sumia mesmo sem o tinamind-app ter sido
excluido, ou seja, ela funcionava por um motivo diferente do suposto. Uma
correcao que passa no teste pelo motivo errado e pior que nenhuma: seria
commitada como entendida.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name

from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
PROBE = RAIZ / "scripts" / "ops" / "runtime_quality_probe.mjs"


@pytest.fixture(scope="module")
def probe_texto() -> str:
    assert PROBE.is_file(), f"probe nao encontrado em {PROBE}"
    return PROBE.read_text(encoding="utf-8")


def test_probe_exclui_dom_de_extensao(probe_texto: str):
    assert "tinamind-app" in probe_texto, (
        "a exclusao do DOM de extensao sumiu do probe. Sem ela, o axe volta a "
        "reportar aria-hidden-focus de codigo que este repositorio nao governa, "
        "e o portao volta a 2 warnings, no teto."
    )
    assert "EXTERNOS" in probe_texto, "a lista declarada de raizes externas sumiu."


def test_exclusao_e_por_nome_e_nao_por_heuristica(probe_texto: str):
    """A heuristica generica removia o next-route-announcer, que e do Next.js."""
    assert "next-route-announcer" in probe_texto, (
        "o motivo pelo qual a exclusao e por nome explicito precisa continuar "
        "escrito no probe. Sem ele, a proxima sessao reintroduz a heuristica "
        "que remove componente do proprio framework."
    )
    assert "document.body.children" not in probe_texto, (
        "a heuristica de custom element filho do body voltou. Ela exclui o "
        "next-route-announcer, que e do Next.js e serve leitores de tela."
    )


def test_exclusao_e_condicional_a_presenca(probe_texto: str):
    """Sem o elemento na pagina, o axe tem de varrer o documento inteiro."""
    assert "querySelector" in probe_texto, (
        "a exclusao deixou de checar a PRESENCA do elemento. Excluir seletor "
        "ausente e inofensivo para o axe, mas registrar como excluido o que nao "
        "estava la falsifica a cobertura declarada."
    )


def test_cobertura_excluida_e_declarada(probe_texto: str):
    """Exclusao silenciosa mascararia um componente real do projeto."""
    assert "excludedRoots" in probe_texto, (
        "o campo que declara o que ficou fora da varredura sumiu. Sem ele, uma "
        "exclusao equivocada -- como a que removia o next-route-announcer -- "
        "passaria despercebida no artefato do gate."
    )
