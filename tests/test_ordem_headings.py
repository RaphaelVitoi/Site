"""Hierarquia de headings: o salto invisivel do DOM renderizado.

MEDIDO EM 2026-09-29, por axe-core em 13 rotas. `heading-order` reprovava em
duas, com a mesma causa raiz em tres lugares diferentes:

1. `ShareButtons.tsx` emitia `<h4>` fixo. As duas paginas que o usam terminam
   em `h2`, entao o `h4` era um salto de **dois** niveis. Este era o caso mais
   revelador: o defeito nao estava na pagina, estava no componente
   compartilhado. Endurecer o `h4` para `h3` na pagina teria consertado duas
   telas e deixado o comum esperando a proxima.

2. Callout de "Relação Matemática" e "A Falha na Matriz": `h4` irmao de `h3`.

3. Bloco de "Referências e Atribuições": `h4` sob um `SectionHeader` que emite
   `h2`, sem `h3` entre eles.

Os tres foram corrigidos, e o 1 foi corrigido no comum: o componente agora
aceita `headingLevel` (2..6, padrao 3), porque um widget compartilhado entre
templates de documento precisa saber em que nivel esta — nao ha nivel herdavel
em HTML.

Este arquivo fixa a hierarquia no codigo-fonte. Ele NAO substitui a medicao no
DOM: `SotaMarkdown` renderiza markdown vindo do banco, e nenhum teste em
TypeScript enxerga o que o navegador montou. O que ele garante e que nenhuma
**tag** volta a pular nivel — que e a causa dos tres achados.
"""

from __future__ import annotations

import pathlib
import re

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
APP = RAIZ / "frontend" / "src" / "app"
COMPONENTES = RAIZ / "frontend" / "src" / "components"

# Componente compartilhado: um `h4` aqui e um salto de dois niveis em toda
# pagina que termina em `h2`, e nenhuma delas avisa.
COMUNS = ("components/ui/layout/ShareButtons.tsx",)


def _tags(txt: str) -> list[str]:
    """Tags de heading em ordem de aparição, com aninhamento resolvido.

    A sequencia e a que o leitor de tela percorre, e nao a do fonte: o que
    importa e a ordem no DOM, nao a ordem em que o arquivo foi escrito.
    """
    pilha: list[str] = []
    saida: list[str] = []
    for m in re.finditer(r"<(/?)h([1-6])\b[^>]*?(/?)>", txt):
        if m.group(1):  # fechamento
            if pilha and pilha[-1] == m.group(2):
                pilha.pop()
            elif m.group(2) in pilha:
                pilha.remove(m.group(2))
            continue
        if not m.group(3):  # tag de abertura
            saida.append(m.group(2))
            pilha.append(m.group(2))
    return saida


def _saltos(seq: list[str]) -> list[tuple[int, int]]:
    n = [int(x) for x in seq]
    return [(a, b) for a, b in zip(n, n[1:], strict=False) if b - a > 1]


@pytest.mark.unit
def test_compartilhado_nao_impoe_nivel_fixo_de_heading() -> None:
    """O defeito do comum: `h4` fixo em componente usado em varias paginas.

    Nao basta trocar por `h3`: a pagina que terminar em `h3` volta a pular.
    O nivel tem de ser parametro, e o default tem de ser o mais comum depois de
    um `h2` em documento editorial.
    """
    for rel in COMUNS:
        p = RAIZ / "frontend" / "src" / rel
        if not p.exists():
            continue
        txt = p.read_text(encoding="utf-8", errors="replace")
        fixos = re.findall(r"<h([1-6])\b[^>]*>", txt)
        assert not fixos, (
            f"{rel} emite heading de nivel fixo: {fixos}.\n"
            "  Componente compartilhado nao sabe em que nivel a pagina esta. "
            "Use `headingLevel` (2..6) e um `Tag` derivado — como ja foi feito "
            "neste componente em 2026-09-29."
        )
        assert "headingLevel" in txt, f"{rel} nao aceita `headingLevel`; sem prop, ele volta ao nivel fixo."


@pytest.mark.unit
def test_componente_compartilhado_aceita_o_intervalo_de_niveis() -> None:
    """`2..6` e nao `2..4`: documento editorial chega a `h5` em capitulo longo."""
    for rel in COMUNS:
        p = RAIZ / "frontend" / "src" / rel
        if not p.exists():
            continue
        txt = p.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"headingLevel\?:\s*([\d\s|]+);", txt)
        assert m, f"{rel}: a prop headingLevel nao declara o intervalo de niveis."
        niveis = {int(x) for x in re.findall(r"\d", m.group(1))}
        assert niveis == {2, 3, 4, 5, 6}, (
            f"{rel}: headingLevel aceita {sorted(niveis)}; o esperado e 2..6. "
            "Um intervalo curto obriga o chamador aliesar a semantica do proprio "
            "documento, que e justamente o que a prop existe para evitar."
        )


@pytest.mark.unit
def test_tags_de_heading_abrem_e_fecham_em_par() -> None:
    """`h3` aberto e `</h4>` fechado passa em diff e quebrava a pagina.

    Aconteceu duas vezes nesta correcao: a troca de tag foi aplicada na
    abertura e o fechamento ficou orfao. O sintoma no build e silencioso — o
    navegador fecha a tag por conta propria e a hierarquia renderizada deixa
    de bater com a do fonte.
    """
    alvos = list(APP.rglob("*.tsx")) + list(COMPONENTES.rglob("*.tsx"))
    for p in alvos:
        txt = p.read_text(encoding="utf-8", errors="replace")
        abrem = {n: len(re.findall(rf"<h{n}\b", txt)) for n in "123456"}
        fecham = {n: len(re.findall(rf"</h{n}>", txt)) for n in "123456"}
        for n in "123456":
            if abrem[n] != fecham[n]:
                pytest.fail(
                    f"{p.relative_to(RAIZ).as_posix()}: <h{n}> abre {abrem[n]}x "
                    f"e fecha {fecham[n]}x. Tag desbalanceada: o navegador "
                    "repara sozinho e a hierarquia do DOM diverge da do fonte."
                )


@pytest.mark.unit
def test_paginas_nao_pulam_nivel_no_fonte() -> None:
    """Nenhum salto de dois ou mais niveis, **descontando o que o layout emite**.

    Este teste le o FONTE, e o fonte nao e o DOM. `SectionHeader` renderiza o
    `h2` da secao a partir das props `step`/`title`, entao uma pagina pode
    comecar em `h3` no arquivo e sair correta no navegador. Foi o caso de
    `/biblioteca/validacao-smart-sniper`: o fonte vai `h1 -> h3`, o DOM vai
    `h1 -> h2 "Fundamentação Teórica" -> h3`, e o axe nao reprova. Reprovar o
    fonte ali seria Reprovar a pagina por um defeito que nao existe.

    Por isso os componentes que EMITEM heading sao descontados da sequencia
    antes de comparar. O que sobra e o conteudo autoral, e e ai que os tres
    achados de 2026-09-29 estavam.

    **Limite declarado deste teste:** ele nao enxerga markdown vindo do banco
    pelo `SotaMarkdown`, nem heading emitido dentro de outro componente. Para
    isso a medicao no DOM (axe-core) e a unica verificacao, e ela roda no
    portao. Teste de fonte que finge medir o DOM reprova o que funciona e
    deixa passar o que quebra.
    """
    EMITEM_HEADING = ("SectionHeader", "ContentPageHeader", "SotaMarkdown")

    def _delega_heading(caminho: pathlib.Path) -> bool:
        """DESCONTADO do salto, nao pulado.

        `SectionHeader` renderiza o `h2` da secao a partir das props, entao
        uma pagina pode comecar em `h3` no arquivo e sair correta no DOM — foi
        o caso de `/biblioteca/validacao-smart-sniper`, cujo axe nao reprova.

        A primeira versao deste guard **p pulava a pagina inteira** quando ela
        delegava, e com isso parava de examinar o conteudo autoral dela. Foi o
        que deixou o `h4` de "Referencias e Atribuições" passar: a pagina tem
        `SectionHeader` e `ContentPageHeader` no fonte, e o salto `h2 -> h4`
        dela nunca foi lido. Delegar o `h2` da secao nao autoriza `h4` a pular
        logo depois.

        O sinal do salto e a tag na propria pagina. Desconta-se o **primeiro**
        nivel emittedo por delegacao — porque e ele que a pagina nao escreve —
        e a sequencia author'sa e comparada a partir dai.
        """
        txt = caminho.read_text(encoding="utf-8", errors="replace")
        return any(f"<{c}" in txt for c in EMITEM_HEADING)

    def _niveis_delegados(t_src: str) -> set[int]:
        """Niveis que um componente emite entre dois headings da pagina.

        `SectionHeader` renderiza o `h2` da secao, e ele nao esta no fonte. Uma
        pagina pode escrever `h1` e depois um `h3`, com o `h2` vindo do
        `SectionHeader` entre os dois: no fonte parece `h1 -> h3`, no DOM sai
        `h1 -> h2 -> h3`, e o axe nao reprova.

        E o que acontece em `/biblioteca/validacao-smart-sniper`. Sem descontar
        esse `h2`, a checagem de fonte reprova uma pagina correta — e um guard
        que reprova o que funciona treina o leitor a ignora-lo.

        O sinal e posicional: `SectionHeader` **entre** o `h1` e o proximo
        heading da pagina. Constar em qualquer lugar do arquivo nao basta.
        """
        delegated: set[int] = set()
        if "<SectionHeader" not in t_src or "<h" not in t_src:
            return delegated
        primeiro = t_src.index("<h")
        if not t_src.startswith("<h1", primeiro):
            # A pagina nao escreve `h1` proprio: quem escreve e o
            # `ContentPageHeader`. O `2` abaixo e o `h2` do `SectionHeader`.
            if "<SectionHeader" in t_src[:primeiro]:
                delegated.add(2)
            return delegated
        # A pagina escreve o proprio `h1`. O `h2` de secao, quando existe, vem
        # do `SectionHeader` DEPOIS dele e ANTES do proximo heading da pagina.
        fim_h1 = t_src.index("</h1>", primeiro)
        proximo = t_src.find("<h", fim_h1)
        if proximo != -1 and "<SectionHeader" in t_src[fim_h1:proximo]:
            delegated.add(2)
        return delegated

    problemas: list[str] = []
    for p in sorted(APP.rglob("page.tsx")):
        t_src = p.read_text(encoding="utf-8", errors="replace")
        seq = _tags(t_src)
        if not seq:
            continue
        _delega_heading(p)
        delegados = _niveis_delegados(t_src)
        if delegados:
            # Insere o nivel delegado na posicao em que ele aparece no DOM:
            # entre o heading que o precede e o que o segue.
            for nivel in sorted(delegados):
                for i, atual in enumerate(seq):
                    if int(atual) > nivel:
                        seq = seq[:i] + [str(nivel)] + seq[i:]
                        break
        for a, b in _saltos(seq):
            problemas.append(f"{p.relative_to(RAIZ).as_posix()}: h{a} -> h{b} (salto de {b - a})")
    assert not problemas, (
        "salto de nivel no conteudo autoral:\n  "
        + "\n  ".join(problemas)
        + "\n\nO leitor de tela percorre a arvore de headings como um indice. "
        "Salto de dois niveis esconde secao."
    )


@pytest.mark.unit
def test_o_axe_confirma_a_hierarquia_no_dom() -> None:
    """A medicao que o teste de fonte nao pode fazer, feita do jeito caro.

    Percorre as rotas editoriais com a sonda que o portao ja usa
    (`runtime_quality_probe.mjs`, axe-core contra o DOM renderizado) e exige
    zero `heading-order`. E o unico teste que enxerga o que o navegador montou:
    `SectionHeader`, `SotaMarkdown` e o markdown do banco.

    Pular quando o frontend ou a sonda nao estao no ar e deliberado — medir
    `NAO MEDIDO` como se fosse `zero violacoes` seria inventar aprovacao. O
    portao (`cwv_gate.ps1`) tem esse mesmo contrato e o declara na saida.
    """
    import json
    import shutil
    import subprocess
    import urllib.request

    sonda = RAIZ / "scripts" / "ops" / "runtime_quality_probe.mjs"
    node = shutil.which("node")
    if not sonda.exists() or not node:
        pytest.skip("sonda runtime ausente")

    try:
        urllib.request.urlopen("http://localhost:3000", timeout=4).read(1)
    except Exception:
        pytest.skip("frontend fora do ar: a medicao precisa de DOM renderizado")

    rotas = (
        "/",
        "/aulas",
        "/aulas/leitura-icm",
        "/biblioteca",
        "/biblioteca/estado-da-arte",
        "/biblioteca/validacao-smart-sniper",
    )
    reprovou: list[str] = []
    for rota in rotas:
        r = subprocess.run(
            [node, str(sonda), "--cdp", "http://127.0.0.1:9222", "--url", "http://localhost:3000" + rota],
            cwd=RAIZ,
            capture_output=True,
            text=True,
            timeout=120,
        )
        try:
            dados = json.loads(r.stdout)
        except json.JSONDecodeError:
            pytest.fail(f"{rota}: a sonda nao devolveu JSON: {r.stdout[:200]!r}")
        for det in dados.get("axe", {}).get("violationDetails", []):
            if det.get("id") == "heading-order":
                reprovou.append(f"{rota}: {det.get('nodes')} no(s)")

    assert not reprovou, (
        "heading-order no DOM renderizado:\n  "
        + "\n  ".join(reprovou)
        + "\n\nO fonte passa e o DOM nao: o heading vem de um componente ou do "
        "markdown no banco. Ache o emissor pelo alvo que o axe reporta."
    )
