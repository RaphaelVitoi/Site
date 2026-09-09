"""Guarda da verificacao de formatacao Ruff na fase 5 do portao.

MEDIDO EM 2026-09-08/09. O CI executa `uv run ruff format --check .` e o
pre-commit NAO executava. O portao local e o CI verificavam coisas diferentes,
entao um commit podia passar num e reprovar no outro sem que nada acusasse --
e foi assim que o job Python do CI ficou vermelho por SEIS DIAS, em 8 de 8
execucoes, sem aparecer em nenhum handoff.

A lacuna mordeu quem a documentou: na mesma sessao que corrigiu os 10 arquivos,
criei um teste novo, nao rodei o formatador nele e reprovei o CI de novo, pelo
motivo identico. Por isso ela virou verificacao, e nao anotacao.

Duas propriedades importam, e as duas tem caso aqui:

1. So conta o que esta em STAGE. Reprovar por divida de formatacao alheia ao
   proprio diff foi exatamente o defeito que a auditoria de 2026-09-01
   corrigiu, e nao se reintroduz.
2. A regra precisa GERAR FINDING. A primeira versao desta verificacao imprimia
   `RuffFormat | 1 | 0 | FAIL` na tabela e devolvia `Total de Erros: 0` -- a
   tabela da fase 5 so imprime; quem bloqueia e o `Add-QualityFinding`. Um
   verificador que mostra FAIL e nao bloqueia e pior que nenhum, porque parece
   proteger.

Este teste nao roda o portao: le o script.
"""

from __future__ import annotations

from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"


@pytest.fixture(scope="module")
def gate_texto() -> str:
    assert GATE.is_file(), f"portao nao encontrado em {GATE}"
    return GATE.read_text(encoding="utf-8-sig")


def test_fase_5_verifica_formatacao_ruff(gate_texto: str):
    assert "ruff format --check" in gate_texto, (
        "a verificacao de formatacao sumiu da fase 5. Sem ela, o portao local "
        "volta a divergir do CI e um commit pode passar aqui e reprovar la."
    )
    assert "RuffFormat" in gate_texto, "a metrica RuffFormat sumiu da tabela de higiene."


def test_verificacao_de_formato_gera_finding_e_nao_so_imprime(gate_texto: str):
    """FAIL na tabela nao bloqueia; quem bloqueia e o finding."""
    assert "repository.ruff-format" in gate_texto, (
        "o Add-QualityFinding da formatacao sumiu. A tabela da fase 5 apenas "
        "imprime: sem o finding, RuffFormat mostraria FAIL e o portao devolveria "
        "Total de Erros 0 -- um verificador que parece proteger e nao protege."
    )


def test_verificacao_limita_se_ao_stage(gate_texto: str):
    inicio = gate_texto.find("$violFmt = @()")
    assert inicio != -1, "o bloco de verificacao de formatacao sumiu"
    trecho = gate_texto[inicio : inicio + 1200]
    assert "$staged" in trecho, (
        "a verificacao deixou de se limitar aos arquivos em stage. Varrer o "
        "repositorio inteiro reprovaria por divida alheia ao proprio diff, que "
        "e o defeito que a auditoria de 2026-09-01 corrigiu."
    )
