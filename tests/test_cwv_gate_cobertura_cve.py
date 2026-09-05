"""Guarda da cobertura da fase 3 (CVE) do portao.

Ate 2026-09-03 a fase auditava so o diretorio corrente. `npm audit` enxerga
apenas onde roda, entao `TOTAL_VULNERABILITY = 0` queria dizer "zero aqui",
enquanto o nome da metrica promete "zero nas dependencias".

A correcao enumera os lockfiles PERGUNTANDO AO GIT (`git ls-files`), nunca
varrendo o disco. A distincao nao e estilo, e correcao:

  - submodulo entra no indice como gitlink (modo 160000), e `git ls-files` nao
    lista arquivo nenhum dentro dele. `skills/*/package-lock.json` fica fora por
    construcao -- e deve ficar: pertencem a exa-labs/exa-mcp-server e afins, sao
    governados pelos repositorios de origem, e `npm audit fix` neles produz
    alteracao local que este repositorio nao commita e que o proximo
    `submodule update` descarta;

  - varrer o disco fazia o veredito depender de quais submodulos estao
    inicializados na maquina. Medido em 2026-09-03: pelo disco eram 4
    manifestos e 5 vulnerabilidades (browserslist HIGH, @humanfs/node, qs), todas
    de terceiros. O MESMO commit aprovaria numa maquina e reprovaria noutra.

Este teste nao roda o portao: le o script. Rodar exigiria npm, rede e Chrome.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"


def _fase_cve(texto: str) -> str:
    """Recorta a fase 3, para nao casar com varreduras legitimas de outras fases."""
    inicio = texto.find("$manifestosNpm = @()")
    assert inicio != -1, "a enumeracao de manifestos npm sumiu da fase 3"
    fim = texto.find("CVE_MANIFESTOS_AUDITADOS", inicio)
    assert fim != -1, "a linha de cobertura declarada sumiu da fase 3"
    return texto[inicio:fim]


@pytest.fixture(scope="module")
def gate_texto() -> str:
    assert GATE.is_file(), f"portao nao encontrado em {GATE}"
    return GATE.read_text(encoding="utf-8-sig")


def test_enumeracao_pergunta_ao_git(gate_texto: str):
    trecho = _fase_cve(gate_texto)
    assert "ls-files" in trecho, (
        "a fase 3 deixou de enumerar lockfiles por `git ls-files`. "
        "Sem isso, submodulos voltam a entrar e o veredito passa a depender da maquina."
    )


def test_enumeracao_nao_varre_o_disco_atras_de_lockfile(gate_texto: str):
    """`Get-ChildItem` sobre skills/ foi exatamente o erro corrigido."""
    trecho = _fase_cve(gate_texto)
    assert "Get-ChildItem" not in trecho, (
        "voltou varredura de disco na enumeracao de manifestos npm. "
        "Ela inclui submodulos e torna o resultado dependente do checkout local."
    )
    assert "skills" not in trecho, (
        "a fase 3 voltou a citar `skills` explicitamente; a exclusao deve vir "
        "de `git ls-files` nao listar dentro de gitlink, nao de uma lista negra."
    )


def test_a_soma_e_acumulada_e_nao_sobrescrita(gate_texto: str):
    """Com varios manifestos, atribuir em vez de somar reportaria so o ultimo."""
    trecho = _fase_cve(gate_texto)
    # Espacamento livre: o script alinha os operadores em coluna, e exigir um
    # unico espaco reprovaria formatacao legitima em vez de logica errada.
    for contador in ("cveCritico", "cveAlto", "cveTotal"):
        assert re.search(rf"\${contador}\s*\+=", trecho), (
            f"${contador} deixou de acumular entre manifestos; com varios "
            "manifestos, atribuir em vez de somar reportaria apenas o ultimo."
        )


def test_manifesto_que_falha_em_medir_e_erro_e_nao_zero(gate_texto: str):
    """A regra de 2026-08-22: um portao que nao mede NAO aprova."""
    trecho = _fase_cve(gate_texto)
    assert "$cveFalhas" in trecho, "a fase 3 deixou de coletar falhas por manifesto"
    assert "$cveMedido = $true" in trecho, "o marcador de medicao efetiva sumiu"

    # A atribuicao dos contadores tem de estar sob o ramo SEM falhas.
    ramo_ok = trecho.split("if ($cveFalhas.Count -gt 0)")
    assert len(ramo_ok) == 2, "o ramo que distingue falha de sucesso sumiu"
    assert "$cveMedido = $true" in ramo_ok[1], (
        "medicao declarada valida fora do ramo sem falhas: um manifesto que falhou voltaria a ser contado como zero."
    )


def test_cobertura_e_declarada_na_saida(gate_texto: str):
    """Zero cves nao diz sobre QUANTOS projetos -- a secao 5 exige declarar."""
    assert "CVE_MANIFESTOS_AUDITADOS" in gate_texto, (
        "a linha que declara quantos manifestos foram auditados sumiu; "
        "sem ela o operador nao distingue cobertura total de parcial."
    )


def test_a_metrica_promete_o_que_mede(gate_texto: str):
    linha = next(
        (line for line in gate_texto.splitlines() if '"TOTAL_VULNERABILITY"' in line and "Desc" in line),
        None,
    )
    assert linha is not None, "a regra TOTAL_VULNERABILITY sumiu"
    assert re.search(r"ALL npm manifests", linha), (
        "a descricao de TOTAL_VULNERABILITY voltou a prometer mais do que mede"
    )


def test_sem_git_ainda_mede_a_raiz_em_vez_de_aprovar_vazio(gate_texto: str):
    """Lista vazia nao pode virar aprovacao silenciosa."""
    trecho = _fase_cve(gate_texto)
    assert "$manifestosNpm.Count -eq 0" in trecho, (
        "o fallback para a raiz sumiu; sem git no PATH a enumeracao volta vazia e o portao aprovaria sem medir nada."
    )
