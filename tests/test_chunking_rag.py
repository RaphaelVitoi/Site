"""O fragmento respeita o tamanho que a constante declara.

## O defeito, medido em 2026-08-28

`CHUNK_SIZE = 1200` estava declarado, documentado (*"all-MiniLM-L6-v2 trunca apos
256 tokens (~1200 chars)"*) -- e o chunker o usava **so como teto para dividir,
nunca como alvo para juntar**:

    if len(p) <= chunk_size:
        all_chunks.append(p)     # cada paragrafo curto virava um fragmento

Paragrafo curto e a norma em codigo e em markdown. Medido no indice real:
**mediana de 162 chars** contra 1200 declarados, **22,2% dos fragmentos abaixo de
50**, p10 em 27. `logger = logging.getLogger(__name__)` aparecia 40 vezes como
fragmento proprio; cabecalhos de template, 34. **12,6% do indice era texto
literalmente repetido.**

O custo nao e desperdicio de espaco: 3.165 fragmentos de uma linha disputavam os
tres lugares de todo resultado, e chegavam ao modelo sem contexto nenhum ao
redor. Nao se conserta isso com ranking melhor -- o corpus e que estava
fragmentado.

Depois: mediana **1017**, fragmentos abaixo de 50 em **0,4%**, e nenhum acima do
teto.

## O teto passou a valer

`_chunk_long_paragraph` estourava ate 1404 num teto de 1200 -- 17% -- porque a
sobreposicao reentra no buffer antes da proxima conferencia. Como o modelo trunca
em ~256 tokens, o excesso nao e desperdicio: e texto que entra no indice e o
embedding **nao ve**. Em vez de perseguir a aritmetica do deslizamento, a
invariante passou a ser imposta na fronteira, onde pode ser garantida.

## Cobertura: comparada contra a versao anterior, nao contra o ideal

Uma linha fisica pode ficar partida entre dois fragmentos quando o corte cai numa
fronteira de frase. Medido nos dois chunkers sobre o mesmo corpus: **9 de 2.877
linhas (0,31%) nos dois**. Nao e regressao -- e o comportamento de sempre do split
por frase, e a comparacao com baseline e o que prova isso.
"""

from __future__ import annotations

import re
import statistics
import warnings
from pathlib import Path

import pytest

warnings.filterwarnings("ignore")
RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def rag():
    from memory_rag import MemoryRAG  # noqa: PLC0415

    return MemoryRAG()


@pytest.fixture(scope="module")
def corpus() -> list[str]:
    """Documentos reais do repositorio, nao texto sintetico."""
    alvos = sorted((RAIZ / ".claude" / "agent-memory").glob("*/MEMORY.md"))
    alvos += sorted((RAIZ / "reports").glob("*.md"))[:12]
    textos = [f.read_text(encoding="utf-8", errors="ignore") for f in alvos]
    assert len(textos) >= 20, f"corpus de teste degradou: so {len(textos)} arquivos"
    return textos


def _tamanhos(rag, corpus) -> list[int]:
    return [len(c) for t in corpus for c in rag._chunk_text(t)]


# ---------------------------------------------------------------------------
#  A invariante que a constante declara
# ---------------------------------------------------------------------------


def test_nenhum_fragmento_passa_do_teto(rag, corpus):
    """O que o modelo nao ve nao deveria estar no fragmento."""
    from memory_rag import CHUNK_SIZE  # noqa: PLC0415

    excedentes = [t for t in _tamanhos(rag, corpus) if t > CHUNK_SIZE]
    assert not excedentes, f"{len(excedentes)} fragmentos acima de {CHUNK_SIZE}; maior = {max(excedentes)}"


def test_a_mediana_se_aproxima_do_alvo(rag, corpus):
    """A regressao central. Antes: mediana 162 num alvo de 1200 -- 13%."""
    from memory_rag import CHUNK_SIZE  # noqa: PLC0415

    mediana = statistics.median(_tamanhos(rag, corpus))
    assert mediana >= CHUNK_SIZE * 0.55, (
        f"mediana {mediana:.0f} contra alvo {CHUNK_SIZE} -- o chunker voltou a "
        f"tratar o teto como limite de divisao em vez de alvo de acumulacao"
    )


def test_fragmentos_minusculos_sao_raros(rag, corpus):
    """Antes eram 22,2% abaixo de 50 chars. Um fragmento de uma linha chega ao
    modelo sem contexto nenhum e ainda disputa lugar no resultado."""
    tam = _tamanhos(rag, corpus)
    minusculos = sum(1 for t in tam if t < 50)
    assert minusculos / len(tam) < 0.05, (
        f"{minusculos / len(tam) * 100:.1f}% dos fragmentos abaixo de 50 chars"
    )


# ---------------------------------------------------------------------------
#  O comportamento, diretamente
# ---------------------------------------------------------------------------


def test_paragrafos_curtos_consecutivos_sao_juntados(rag):
    """O defeito em uma linha: dez paragrafos curtos davam dez fragmentos."""
    texto = "\n\n".join(f"Paragrafo numero {i} com algum conteudo curto." for i in range(10))
    fragmentos = rag._chunk_text(texto)
    assert len(fragmentos) == 1, f"dez paragrafos curtos viraram {len(fragmentos)} fragmentos"
    for i in range(10):
        assert f"Paragrafo numero {i} " in fragmentos[0]


def test_boilerplate_isolado_nao_vira_fragmento_proprio(rag):
    """O caso concreto medido: `logger = ...` como fragmento de 37 chars, 40 vezes."""
    texto = (
        "import logging\n\n"
        "logger = logging.getLogger(__name__)\n\n"
        "def alguma_funcao():\n    return 42\n"
    )
    fragmentos = rag._chunk_text(texto)
    assert len(fragmentos) == 1
    assert fragmentos[0].count("logger = logging.getLogger") == 1


def test_paragrafo_colossal_continua_sendo_dividido(rag):
    """A acumulacao nao pode ter quebrado o caminho oposto."""
    from memory_rag import CHUNK_SIZE  # noqa: PLC0415

    texto = " ".join(f"Esta e a frase numero {i} do paragrafo enorme." for i in range(200))
    fragmentos = rag._chunk_text(texto)
    assert len(fragmentos) > 1, "paragrafo muito acima do teto nao foi dividido"
    assert all(len(c) <= CHUNK_SIZE for c in fragmentos)


def test_a_sobreposicao_e_por_paragrafo_inteiro(rag):
    """Cortar no meio de uma frase produz um inicio de fragmento que nao
    significa nada sozinho, e o embedding herda esse ruido."""
    paragrafos = [f"Bloco {i}. " + ("conteudo " * 30) for i in range(12)]
    fragmentos = rag._chunk_text("\n\n".join(paragrafos))
    assert len(fragmentos) > 1, "o corpus de teste nao gerou fragmentos suficientes"
    for f in fragmentos[1:]:
        assert f.lstrip().startswith("Bloco "), (
            f"fragmento comeca no meio de um paragrafo: {f[:60]!r}"
        )


def test_texto_vazio_e_so_espaco_nao_geram_fragmento(rag):
    assert rag._chunk_text("") == []
    assert rag._chunk_text("\n\n   \n\n") == []


# ---------------------------------------------------------------------------
#  Cobertura, contra baseline e nao contra o ideal
# ---------------------------------------------------------------------------


def test_a_cobertura_nao_piorou_em_relacao_ao_chunker_antigo(rag, corpus):
    """Uma linha fisica pode ficar partida entre dois fragmentos quando o corte
    cai numa fronteira de frase -- e isso ja acontecia antes. Sem a baseline, o
    numero isolado (0,31%) pareceria defeito novo."""
    norm = lambda s: re.sub(r"\s+", " ", s).strip()  # noqa: E731

    def antigo(texto: str) -> list[str]:
        from memory_rag import CHUNK_OVERLAP, CHUNK_SIZE  # noqa: PLC0415

        saida: list[str] = []
        for par in texto.replace("\r\n", "\n").split("\n\n"):
            p = par.strip()
            if not p:
                continue
            if len(p) <= CHUNK_SIZE:
                saida.append(p)
            else:
                saida.extend(rag._chunk_long_paragraph(p, CHUNK_SIZE, CHUNK_OVERLAP))
        return saida

    def ausentes(fn) -> tuple[int, int]:
        falt = tot = 0
        for texto in corpus:
            frags = [norm(c) for c in fn(texto)]
            linhas = [norm(x) for x in texto.split("\n") if norm(x)]
            tot += len(linhas)
            falt += sum(1 for x in linhas if not any(x in f for f in frags))
        return falt, tot

    falt_antigo, tot = ausentes(antigo)
    falt_novo, _ = ausentes(rag._chunk_text)
    assert falt_novo <= falt_antigo, (
        f"o chunker novo perde mais linhas que o antigo: {falt_novo} contra {falt_antigo} de {tot}"
    )
