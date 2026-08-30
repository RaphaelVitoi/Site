"""Guarda de credencial sobre a ARVORE INTEIRA -- nao so sobre o diff.

O portao de ancora confere as linhas ADICIONADAS de cada commit. E o recorte
certo para um portao: reprovar por divida preexistente e o jeito mais rapido de
ser desligado. Mas ele nao responde "ha credencial rastreada NESTE repositorio
hoje?" -- e essa pergunta nao tem portao nenhum.

Este teste responde. E os padroes vem do MESMO arquivo que o portao le: os dois
viviam com copias separadas da lista, e duplicata de regra de seguranca diverge
por construcao -- quem acrescenta um padrao de um lado nao sabe do outro, e o
lado esquecido continua APROVANDO.

Medido em 2026-08-28, auditando o risco P0 declarado por outra sessao: zero
credencial em arquivo rastreado. As unicas materializadas em disco estao em
`Site/.env`, que NAO e rastreado e esta coberto pelo .gitignore.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / "data" / "PADROES_DE_CREDENCIAL.json"

TEXTO = {
    ".py", ".ps1", ".psm1", ".md", ".json", ".yml", ".yaml", ".toml", ".txt",
    ".js", ".jsx", ".ts", ".tsx", ".cmd", ".sh", ".cfg", ".ini", ".env", ".example",
}


def _fonte() -> dict:
    return json.loads(FONTE.read_text(encoding="utf-8"))


def _rastreados() -> list[str]:
    r = subprocess.run(["git", "ls-files"], cwd=RAIZ, capture_output=True, text=True, check=False)
    return [linha for linha in r.stdout.splitlines() if linha.strip()]


def test_a_fonte_de_padroes_existe_e_tem_conteudo():
    """Sem ela o portao PowerShell falha DURO, de proposito. Aqui, idem: uma
    varredura com zero padroes aprovaria tudo e pareceria verde."""
    assert FONTE.is_file(), f"fonte de padroes ausente: {FONTE}"
    fonte = _fonte()
    assert len(fonte["padroes"]) >= 6, "a lista de padroes encolheu"
    assert fonte["placeholders_conhecidos"], "sem placeholders, todo exemplo vira achado"


def test_o_portao_powershell_le_a_mesma_fonte():
    """Modulo que ninguem consome nao e integracao -- e aqui vale dobrado: se o
    portao voltar a ter a lista embutida, os dois lados divergem em silencio."""
    portao = (RAIZ / "scripts" / "ops" / "record_anchor_gate.ps1").read_text(encoding="utf-8-sig")
    assert "PADROES_DE_CREDENCIAL.json" in portao, "o portao nao le a fonte compartilhada"
    assert "$padroesCredencial = @{}" in portao, "o portao voltou a embutir a lista de padroes"


def test_nenhum_arquivo_rastreado_carrega_credencial():
    """A pergunta que nenhum portao fazia: ha credencial NESTE repositorio hoje?"""
    fonte = _fonte()
    padroes = {nome: re.compile(rx) for nome, rx in fonte["padroes"].items()}
    placeholders = tuple(fonte["placeholders_conhecidos"])
    # Credencial de verdade nao contem metacaractere de regex. E assim que o
    # proprio arquivo de padroes deixa de se denunciar -- sem isenta-lo, o que
    # criaria ponto cego no unico lugar que descreve os segredos.
    metacaracteres = tuple(fonte["metacaracteres_que_denunciam_um_padrao"])

    achados: list[str] = []
    lidos = 0
    for rel in _rastreados():
        caminho = RAIZ / rel
        if caminho.suffix.lower() not in TEXTO or not caminho.is_file():
            continue
        try:
            conteudo = caminho.read_text(encoding="utf-8-sig", errors="ignore")
        except OSError:
            continue
        lidos += 1
        for n, linha in enumerate(conteudo.splitlines(), 1):
            for nome, rx in padroes.items():
                m = rx.search(linha)
                if not m:
                    continue
                achado = m.group(0)
                if any(c in achado for c in metacaracteres):
                    continue  # e o padrao, nao o segredo
                if achado.startswith(placeholders) or any(p in linha for p in placeholders):
                    continue
                # O VALOR nunca entra no relatorio: relatorio de vazamento que
                # repete o segredo e o proprio vazamento.
                achados.append(f"{rel}:{n} tipo={nome} <{len(achado)} chars>")

    assert lidos > 100, f"a varredura leu so {lidos} arquivos -- recorte quebrado, resultado vazio"
    assert not achados, "credencial em arquivo RASTREADO:\n  " + "\n  ".join(achados)


def test_o_env_com_credencial_nao_e_rastreado():
    """`Site/.env` tem chave materializada em texto claro. O que impede que ela
    vaze para o historico e o .gitignore -- entao o .gitignore e que se testa."""
    env = RAIZ / ".env"
    if not env.is_file():
        return  # nao ha .env nesta arvore (clone limpo, worktree): nada a proteger
    ignorado = subprocess.run(
        ["git", "check-ignore", "-q", ".env"], cwd=RAIZ, capture_output=True, check=False
    )
    assert ignorado.returncode == 0, ".env deixou de ser ignorado pelo git"
    rastreado = subprocess.run(
        ["git", "ls-files", "--error-unmatch", ".env"], cwd=RAIZ, capture_output=True, check=False
    )
    assert rastreado.returncode != 0, ".env foi RASTREADO -- credencial entrou no historico"
