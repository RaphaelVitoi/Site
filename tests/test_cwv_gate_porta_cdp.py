"""Guarda da selecao de porta CDP na fase 1 do portao.

MEDIDO EM 2026-09-08. As portas 9223 e 9222 respondiam `/json/version`, e o
portao parava na primeira -- 9223, por ser a primeira de `$CdpPorts`. So que o
Chrome da 9223 tinha `MainWindowHandle = 0`, titulo vazio e ZERO targets de tipo
`page`: um navegador sem janela de conteudo.

Probe no mesmo instante e na mesma URL, mudando so a porta:

    9222 -> lcpMs 356,81   longTaskBlockingMs 1137
    9223 -> lcpMs None     longTaskBlockingMs None

`cls`, `ttfbMs` e `maxHeapMb` mediram nas DUAS. O recorte nao e aleatorio: ele
separa exatamente as metricas que dependem de a pagina estar visivel.
`LargestContentfulPaint` nao e emitido para pagina que inicia oculta, e long
task nao ocorre em aba sem renderizacao.

**Responder ao handshake, portanto, nao prova que a porta mede.** O warning
`cwv.cobertura` que dai resultava era ESTRUTURAL: reaparecia em todo commit,
gastando uma das duas vagas de warning, sem nada de errado com o codigo medido.

Uma hipotese anterior -- dev server frio, com o Next compilando a rota na
primeira navegacao -- foi REFUTADA: com a pagina aquecida e lcpMs de 705,91 ms
medido segundos antes, o commit seguinte reproduziu o mesmo warning. O que
faltava era notar em qual porta o portao media.

Este teste nao roda o portao: le o script, como
`test_cwv_gate_cobertura_cve.py` ja faz. Rodar exigiria Chrome, rede e um
frontend de pe.
"""

from __future__ import annotations

from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"


def _bloco_handshake(texto: str) -> str:
    """Recorta o handshake CDP, para nao casar com outras fases do portao."""
    inicio = texto.find("$cdpActive = $false")
    assert inicio != -1, "o bloco de handshake CDP sumiu do portao"
    fim = texto.find("# 1. Observa", inicio)
    assert fim != -1, "o fim do bloco de handshake nao foi encontrado"
    return texto[inicio:fim]


@pytest.fixture(scope="module")
def gate_texto() -> str:
    assert GATE.is_file(), f"portao nao encontrado em {GATE}"
    return GATE.read_text(encoding="utf-8-sig")


def test_handshake_exige_pagina_visivel(gate_texto: str):
    """Aceitar a porta so por ela responder /json/version foi o defeito medido."""
    trecho = _bloco_handshake(gate_texto)
    assert "/json/list" in trecho, (
        "o handshake CDP voltou a aceitar uma porta so por ela responder "
        "/json/version. Uma porta sem target `type=page` responde ao handshake "
        "e nao mede LCP -- foi assim que o warning cwv.cobertura virou "
        "estrutural."
    )


def test_selecao_conta_targets_de_tipo_page(gate_texto: str):
    trecho = _bloco_handshake(gate_texto)
    assert "'page'" in trecho or '"page"' in trecho, (
        "a contagem de targets de tipo page sumiu da selecao de porta CDP. "
        "Sem ela nao ha como distinguir um navegador com janela de um sem."
    )


def test_porta_descartada_e_declarada_e_nao_silenciada(gate_texto: str):
    """Descartar em silencio devolveria o defeito por outra porta.

    O portao mediria por 9222 sem dizer que descartou 9223, e a proxima sessao
    nao teria como saber por que a fase 1 mede num dia e nao mede no outro.
    """
    trecho = _bloco_handshake(gate_texto)
    assert "sem pagina visivel" in trecho, (
        "a porta descartada por nao ter pagina precisa ser DECLARADA na saida "
        "do portao. Cobertura perdida em silencio e o que a secao 5 do "
        "CLAUDE.md proibe."
    )
