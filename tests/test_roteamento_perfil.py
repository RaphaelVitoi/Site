"""Guarda de divergencia do roteamento do perfil PowerShell.

A funcao que decide entre `do.ps1` e `nexus.ps1` depende de uma lista estatica
de comandos do Typer, e essa lista esta DUPLICADA em dois arquivos. Lista
estatica que ninguem confere e exatamente a falha do mapa de modelos Ollama,
que existia em tres copias divergentes nesta mesma base.

A duplicacao continua (item 1.3 do plano 2-B, fonte unica ainda por declarar),
mas deixou de poder divergir em silencio: estes testes comparam AS DUAS copias
com os comandos que o Typer de fato registra.

Contexto do defeito de origem, medido em 2026-08-27: a regra era "primeiro
argumento sem hifen vai para o nexus.ps1", o que mandou o uso historico
principal do ecossistema -- `nexus <texto livre da tarefa>` -- para um erro do
Typer (EXIT=2, "No such command"). O posicional 0 do do.ps1 e $Description.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest
import typer.main

from scripts.cli.nexus import app

RAIZ = Path(__file__).resolve().parent.parent
ARQUIVOS_COM_A_LISTA = [
    RAIZ / "Microsoft.PowerShell_profile.ps1",
    RAIZ / "scripts" / "setup" / "Setup-NexusProfile.ps1",
]


def _comandos_registrados_no_typer() -> set[str]:
    cmd = typer.main.get_command(app)
    cmds = getattr(cmd, "commands", {})
    return set(cmds.keys())


def _ler(caminho: Path) -> str:
    # utf-8-sig: estes arquivos carregam BOM, exigido pelo PowerShell 5.1.
    return caminho.read_text(encoding="utf-8-sig")


def _corpo_do_roteador(caminho: Path) -> str:
    """So o corpo da funcao de roteamento, sem comentarios.

    Varrer o arquivo inteiro produzia falso positivo: `Convert-DeepJsonStringSOTA`
    usa `.StartsWith("{")` para detectar JSON, uso legitimo e sem relacao com o
    roteamento. Detector que reprova codigo correto e detector que sera
    desligado -- estreitar o escopo estruturalmente, nunca isentar o arquivo.
    """
    texto = _ler(caminho)
    inicio = re.search(r"^function\s+(?:Invoke-Nexus|nexus)\s*\{", texto, re.M)
    assert inicio, f"funcao de roteamento nao encontrada em {caminho.name}"
    resto = texto[inicio.end() :]
    fim = re.search(r"^\}", resto, re.M)
    corpo = resto[: fim.start()] if fim else resto
    return "\n".join(linha for linha in corpo.splitlines() if not linha.lstrip().startswith("#"))


def _lista_declarada(caminho: Path) -> set[str]:
    bloco = re.search(r"\$Global:NexusTyperCommands\s*=\s*@\((.*?)\)", _ler(caminho), re.S)
    assert bloco, f"lista NexusTyperCommands nao encontrada em {caminho.name}"
    return set(re.findall(r"'([^']+)'", bloco.group(1)))


@pytest.mark.parametrize("caminho", ARQUIVOS_COM_A_LISTA, ids=lambda p: p.name)
def test_lista_do_perfil_bate_com_o_typer(caminho: Path):
    """Comando novo no CLI sem entrada aqui e roteado para o do.ps1 e falha."""
    declarados = _lista_declarada(caminho)
    reais = _comandos_registrados_no_typer()

    faltando = reais - declarados
    sobrando = declarados - reais
    assert not faltando, f"{caminho.name}: comandos do Typer ausentes da lista, iriam para do.ps1: {sorted(faltando)}"
    assert not sobrando, f"{caminho.name}: lista cita comandos que o Typer nao tem: {sorted(sobrando)}"


def test_as_duas_copias_da_lista_sao_identicas():
    """Enquanto a fonte unica nao existe, as copias tem que ser iguais."""
    a, b = (_lista_declarada(p) for p in ARQUIVOS_COM_A_LISTA)
    assert a == b, f"as duas copias divergiram: so em A={sorted(a - b)} | so em B={sorted(b - a)}"


@pytest.mark.parametrize("caminho", ARQUIVOS_COM_A_LISTA, ids=lambda p: p.name)
def test_roteamento_nao_volta_a_decidir_por_hifen(caminho: Path):
    """Guarda de ligacao: a lista pode estar certa e o call-site voltar ao velho.

    O discriminador correto e o pertencimento ao conjunto de comandos, nao a
    presenca de hifen -- flags E texto livre pertencem ambos ao do.ps1.
    """
    corpo = _corpo_do_roteador(caminho)
    ofensores = [linha for linha in corpo.splitlines() if re.search(r"-like\s+'-\*'|\.StartsWith\(", linha)]
    assert not ofensores, f"{caminho.name}: roteamento voltou a decidir por hifen: {ofensores}"


@pytest.mark.parametrize("caminho", ARQUIVOS_COM_A_LISTA, ids=lambda p: p.name)
def test_roteamento_usa_a_lista(caminho: Path):
    """A lista tem que ser efetivamente consultada, nao so declarada.

    Constante sem consumidor ja apareceu nove vezes neste mesmo arquivo em
    2026-08-27; declarar a lista e nao usa-la seria a decima.
    """
    assert "$Global:NexusTyperCommands -contains" in _corpo_do_roteador(caminho), (
        f"{caminho.name}: a lista e declarada mas nao consultada pelo roteamento"
    )
