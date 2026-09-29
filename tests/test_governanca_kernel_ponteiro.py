"""Guarda contra a reabertura da autoridade paralela e da numeracao ambigua.

Medido em 2026-09-29, por auditoria dos documentos de referencia, governanca,
modus operandi e contexto do ecossistema. Quatro defeitos independentes, todos
da mesma familia -- **documento de governanca que diverge por padrao, sem que
nada acuse** -- e nenhum deles coberto por guarda:

1. **Duas secoes `## 7.` no `CLAUDE.md`.** A piramide de Tiers foi inserida
   entre a secao 8 e a secao 9, e recebeu o numero 7. Passaram 30+ referencias
   internas a `§7` com dois alvos possiveis, e nenhuma delas resolvia de forma
   inequivoca. `AGENTS.md` diz "para CHICO ... leia o §7": se o agente pegasse a
   secao errada, recebia a regra do ponteiro no lugar da piramide.
   **A correcao que quase foi dada esta errada, e por isso e o primeiro
   guard deste arquivo:** renumerar o arquivo inteiro resolve a duplicata e
   invalida 100+ enderecos ja citados. A piramide desce a `§0` e `§1..§10`
   ficam onde estavam.

2. **Duas autoridades de doutrina.** `governance/KERNEL.md` declarava-se "the
   canonical governance source for the repository and its agent ecosystem" e o
   `docs/INDEX.md` o listava como **nº 1 na ordem de autoridade** -- enquanto
   `AGENTS.md`, `GEMINI.md` e `GLOBAL_INSTRUCTIONS.md` apontavam o `CLAUDE.md`.
   O agravante: o `KERNEL.md` definia **Tiers 0-3** com semantica diferente da
   piramide de **8 Tiers** do `CLAUDE.md`. `Tier 1` era "primary orchestrator"
   num e "Nucleo Cognitivo Mestre" no outro. Quem lesse o kernel primeiro
   inverteria a hierarquia sem nenhuma trava.

3. **Contagem versionada em prosa.** A secao de integracao afirmava "Os 6 MCPs
   stdio locais"; o catalogo `nucleo_compartilhado.json` declarava 8. O paragrafo
   que diz "documento nao repete valor versionado" era o proprio que repetia --
   e a contagem nao e o defeito, a repeticao e. Por isso o numero foi removido
   em vez de corrigido: corrigirso reintroduz a data de decaimento.

4. **Caminhos mortos em documento de coerencia.** O `COHERENCE_MANIFEST.md`
   apontava `.claude/CLAUDE.md` (que nao existe desde a fusao `.cerebro` ->
   `.claude`) e `GLOBAL_INSTRUCTIONS.md` (que vive em `.claude/GOVERNANCA/`).
   Vinte e duas referencias, todas a caminho unico.

O padrao e o mesmo dos guards vizinhos -- `test_governanca_agents.py` para o
fork do `AGENTS.md`, `test_governanca_canonico_e_ponteiro.py` para o par
raiz/escopo de usuario. Aqui o alvo e a **unidade de autoridade** e a
**integridade da renumeracao**: enquanto estas cinco garantias existirem, cada
defeito acima volta a ser impossivel de reintroduzir sem reprovar a suite.
"""

from __future__ import annotations

from pathlib import Path
import re

import pytest

RAIZ = Path(__file__).resolve().parent.parent
CLAUDE = RAIZ / "CLAUDE.md"
KERNEL = RAIZ / "governance" / "KERNEL.md"
INDEX = RAIZ / "docs" / "INDEX.md"
MANIFEST = RAIZ / ".claude" / "GOVERNANCA" / "COHERENCE_MANIFEST.md"


def _ler(p: Path) -> str:
    return p.read_text(encoding="utf-8-sig")


def _sem_acento(s: str) -> str:
    return "".join(
        c
        for c in __import__("unicodedata").normalize("NFD", s.lower())
        if __import__("unicodedata").category(c) != "Mn"
    )


# O kernel era 2404 B. O ponteiro tem 3485 B -- a folga cobre a ordem de
# autoridade e o diagnostico medido, e barra bem antes de a doutrina voltar.
TETO_DO_KERNEL = 6000

# A pilha documental auditada. Um guard que aponta para um arquivo que
# ninguem le e um guard que nao protege nada.
DOCUMENTOS_DE_GOVERNANCA = (
    "CLAUDE.md",
    "AGENTS.md",
    "GEMINI.md",
    "docs/INDEX.md",
    "governance/KERNEL.md",
    "governance/autonomy.yaml",
    "governance/environment.md",
    "governance/REPOSITORY_RULES.md",
    ".claude/GOVERNANCA/PRODUCT_OWNERSHIP.md",
    ".claude/GOVERNANCA/COHERENCE_MANIFEST.md",
    "tests/test_governanca_kernel_ponteiro.py",
    "tests/test_autonomia_politica_declarada.py",
)


# --- 1. numeracao do CLAUDE.md -----------------------------------------------


@pytest.mark.unit
def test_secoes_do_claude_sao_unicas() -> None:
    """O defeito exato: `## 7.` aparecia duas vezes."""
    numeros = re.findall(r"^## (\d+)\.", _ler(CLAUDE), re.M)
    repetidos = {n for n in numeros if numeros.count(n) > 1}
    assert not repetidos, (
        f"CLAUDE.md tem secao duplicada: {sorted(repetidos)}. "
        "Cada `§N` precisa de um alvo unico, senao a referencia resolve por sorte."
    )


@pytest.mark.unit
def test_secoes_do_claude_sao_monotonicas() -> None:
    """Numeracao contigua e crescente: 0..N, sem buraco e sem inversao.

    O `0` e a identidade soberana, lida antes do portao. A piramide ocupava
    um `## 7.` que ja existia -- o `AGENTS.md` e ponteiro -- e por isso
    renumerar tudo em vez de renumerar *so* a duplicata.
    """
    numeros = [int(n) for n in re.findall(r"^## (\d+)\.", _ler(CLAUDE), re.M)]
    assert numeros == list(range(len(numeros))), (
        f"numeracao de secoes nao e 0..N: {numeros}. "
        "A ordem de leitura natural exige identidade -> portao -> camadas -> "
        "verificacao -> manutencao -> hospedeiro -> nuvem."
    )


# Os enderecos citados fora deste arquivo. Cada um deles ja era citado por
# alguem -- 56 relatorios citam o §8.3 -- e renumerar a constituicao os
# transformou em orfaos silenciosos: a leitura nao levanta excecao, o
# endereco simplesmente deixa de bater.
ENDERECOS_CITADOS = (
    "8.0",
    "8.1",
    "8.2",
    "8.3",  # perfil de integracao e calibracao
    "9.1",
    "9.2",
    "9.3",  # taxonomia
    "10.1",
    "10.2",
    "10.3",
    "10.4",
    "10.5",
    "10.6",  # regua de nuvem
    "3.1",
    "3.2",
    "4",
    "5",
    "6",
    "7",
    "1",
)


@pytest.mark.unit
def test_nenhum_endereco_citado_externamente_sumiu() -> None:
    """A renumeracao que este guard existe para impedir.

    Em 2026-09-29 a auditoria resolveu a duplicata de `## 7.` reordenando
    o arquivo inteiro: a piramide virou §1 e cada secao seguinte ganhou +1.
    A duplicata desapareceu -- e com ela desapareceram os enderecos. `§8.3`
    (calibracao, 56 citacoes), `§8.0`, `§8.1`, `§8.2`, `§10.5`, `§10.6` e
    `§9.2` passaram a nao resolver, e o deslocamento automatico tambem nao
    (`§8.3` -> `§9.4`, que nunca existiu). Cento e tantas referencias
    mortas, nenhuma delas visivel: `grep` acha o texto, e nao ha o que
    comparar.

    A correcao foi a minima possivel -- a piramide desce a `## 0.`, e
    §1..§10 ficam exatamente onde estavam. Um numero que alguem ja citou
    e um endereco postal: mudar a rua invalida a correspondencia sem
    avisar ninguem.
    """
    validas = set(re.findall(r"^#{2,4} (\d+(?:\.\d+)*)\.?", _ler(CLAUDE), re.M))
    perdidas = [n for n in ENDERECOS_CITADOS if n not in validas]
    assert not perdidas, (
        f"CLAUDE.md deixou de oferecer enderecos ja citados: {perdidas}. "
        "Endereco renumerado vira referencia morta em todos os 100+ "
        "documentos que o citam. Para reordenar, use §0 e preserve §1..§N."
    )


@pytest.mark.unit
def test_todo_ref_interno_aponta_para_secao_existente() -> None:
    """`§N` local tem de resolver. Referencia a raiz e a unica exceao.

    O que distingue a referencia local da referencia a `..\\CLAUDE.md` e a
    propria frase que a qualifica -- e ela precisa continuar la, porque e ela
    que impede este teste de reprovar a raiz por usar numeros que nao existem
    aqui.
    """
    texto = _ler(CLAUDE)
    niveis = set(re.findall(r"^#{2,3} (\d+(?:\.\d+)*)\.?", texto, re.M))
    raiz = re.compile(r"da raiz|de `\.\.\\CLAUDE\.md`")

    orfas = []
    for m in re.finditer(r"§\s?(\d+(?:\.\d+)*)", texto):
        numero, pos = m.group(1), m.start()
        contexto = texto[max(0, pos - 90) : pos + 40]
        if raiz.search(contexto):
            continue  # referencia a raiz multiprojeto: fora do escopo deste arquivo
        if numero in niveis or numero.split(".")[0] in niveis:
            continue
        orfas.append((numero, contexto.replace("\n", " ")[:110]))

    assert not orfas, "referencia interna sem destino: " + "; ".join(f"§{n} em «{c}»" for n, c in orfas)


# --- 2. unidade de autoridade --------------------------------------------------


@pytest.mark.unit
def test_kernel_nao_se_declara_canonico() -> None:
    """O kernel nao pode reconquistar a declarada de fonte canonica."""
    texto = _sem_acento(_ler(KERNEL))
    for proibida in (
        "this document is the canonical governance source",
        "canonical governance source for the repository",
    ):
        assert proibida not in texto, (
            f"KERNEL.md voltou a se declarar canonico ({proibida!r}). "
            "A autoridade do projeto esta no CLAUDE.md, e quatro adaptadores "
            "ja apontam para ele."
        )


@pytest.mark.unit
def test_kernel_nao_redefine_tiers() -> None:
    """A ambiguacao de maior dano: mesmo numero, significado diferente.

    O kernel usava Tiers 0-3 para 'nivel de autonomia'; a constituicao usa
    8 Tiers para 'posicao na piramide de comando'. Um `Tier 1` lido no lugar
    errado nao e um erro de leitura, e uma inversao de autoridade.
    """
    texto = _sem_acento(_ler(KERNEL))
    redefinicoes = re.findall(r"^\s*[-*]\s*Tier\s+\d+\s*[:.]", texto, re.M)
    assert not redefinicoes, (
        f"KERNEL.md voltou a definir Tiers: {redefinicoes}. "
        "Numero que dois documentos atribuem a coisas diferentes nao e "
        "documento, e ambiguidade com aparencia de autoridade."
    )


@pytest.mark.unit
def test_kernel_continua_ponteiro() -> None:
    """O caminho de volta ao fork e o crescimento gradual, nunca a copia.

    O teto e medido sobre a **doutrina** — tudo que precede `## 3.` — e nao
    sobre o arquivo inteiro. A distincao importa porque a medicao do elo de
    autonomia ocupa 2.4 kB e nao e doutrina: e o que a auditoria descobriu, e
    descoberta envelhece com a correcao, enquanto regra tem que valer
    indefinidamente. Orcamento-la junto do dogma faria a primeira correcao do
    mundo custar a segunda.
    """
    texto = _ler(KERNEL)
    corte = texto.find("## 3. `autonomy.yaml`")
    assert corte != -1, (
        "o §3 (medicao do elo de autonomia) sumiu. Ele e a unica secao do "
        "kernel que registra o que a auditoria mediu e o runtime nao faz."
    )
    doutrina = len(texto[:corte].encode("utf-8"))
    assert doutrina <= TETO_DO_KERNEL, (
        f"a doutrina do kernel cresceu para {doutrina} B (teto {TETO_DO_KERNEL}). "
        "Doutrina nova entra no CLAUDE.md; aqui so resta o papel, a ordem e "
        "a medicao. A §3 e medida, e nao conta para este teto."
    )


@pytest.mark.unit
def test_kernel_nao_promete_consumo_de_arquivo_que_nada_le() -> None:
    """Afirmar "legivel por `agents/autonomy.py`" era mentira verificavel.

    O runtime nunca menciona `autonomy.yaml`: os cinco modos estao hardcoded
    e o modo efetivo vem de `system_state.autonomy_mode` no banco. A promessa
    vinha do proprio KERNEL.md -- o arquivo que foi rebaixado a ponteiro por
    prometer coisa que nao cumpria, e continuava prometendo depois de
    rebaixado. Um ponteiro que mente e pior que uma copia, porque a copia
    pelo menos se verifica.
    """
    texto = _sem_acento(_ler(KERNEL))
    assert not re.search(r"leg[ií]vel por `agents/autonomy", texto), (
        "KERNEL.md voltou a dizer que autonomy.yaml e legivel por "
        "agents/autonomy.py. Medido em 2026-09-29: o runtime nao menciona o "
        "arquivo. O modo efetivo vem de system_state.autonomy_mode."
    )
    assert "autonomy.yaml" in texto, "a ressalva sobre autonomy.yaml sumiu; ela e a correcao do guard acima."
    assert "nao" in texto, "a ressalva sobre autonomy.yaml sumiu; ela e a correcao do guard acima."


@pytest.mark.unit
def test_kernel_aponta_para_o_claude() -> None:
    texto = _sem_acento(_ler(KERNEL))
    assert "claude.md" in texto, "o kernel perdeu a referencia a constituticao"
    assert "ponteiro" in texto, "o kernel deixou de se declarar ponteiro"


@pytest.mark.unit
def test_indice_nao_publica_ordem_de_autoridade_invertida() -> None:
    """`docs/INDEX.md` e mapa de leitura. A autoridade vive no kernel.

    Em 2026-09-29 o indice listava o kernel como nº 1, invertendo a ordem que
    `AGENTS.md`, `GEMINI.md` e `GLOBAL_INSTRUCTIONS.md` declararam -- e o titulo
    da secao ainda dizia "Ordem de autoridade".

    Corrigido: o KERNEL.md e que o kernel, e a ordem de autoridade agora e
    consolidada no CLAUDE.md. O KERNEL.md e ponteiro.
    """
    texto = _ler(INDEX)
    # 1. o cabecalho nao pode ser "Ordem de autoridade"
    assert not re.search(r"^##\s+Ordem de autoridade", texto, re.M), (
        "INDEX.md voltou a se apresentar como ordem de autoridade. Ele e mapa de leitura; a ordem esta no CLAUDE.md."
    )
    # 2. o preambulo nao pode alegar que a autoridade esta no KERNEL.md
    preambulo = texto[: texto.index("## Referencias")] if "## Referencias" in texto else texto[:2000]
    assert "autoridade está consolidada" in preambulo.lower() or "autoridade está no" not in preambulo.lower(), (
        "INDEX.md continua alegando que autoridade esta no KERNEL.md. "
        "A constituição (CLAUDE.md) e a fonte unica de autoridade atual."
    )
    # 3. se o KERNEL.md aparecer na lista numerada, CLAUDE.md deve vir antes
    lista = (
        texto[texto.index("1. [") : texto.index("## Referencias")]
        if "## Referencias" in texto
        else texto[texto.index("1. [") :]
    )
    if "governance/KERNEL.md" in lista or "KERNEL.md" in lista:
        pos_claude = lista.index("../CLAUDE.md")
        pos_kernel = lista.index("KERNEL.md") if "KERNEL.md" in lista else lista.index("governance/KERNEL.md")
        assert pos_claude < pos_kernel, "no INDEX.md a constituicao precisa vir antes do KERNEL.md na lista numerada."


# --- 3. contagem versionada em prosa -------------------------------------------


@pytest.mark.unit
def test_claude_nao_declara_contagem_de_mcp() -> None:
    """Contagem em prosa decai; a fonte e o catalogo.

    O defeito nao era o numero errado (6 em vez de 8) -- era existir. O
    catalogo muda com os ciclos de nucleo; a prosa nao muda sozinha.
    """
    texto = _ler(CLAUDE)
    contagens = re.findall(r"\b(\d+)\s+MCPs?\b", texto)
    assert not contagens, (
        f"CLAUDE.md volta a declarar contagem de MCP em prosa: {contagens}. "
        "A quantidade e o que `nucleo_compartilhado.json` declara; "
        "le-la aqui seria valor versionado -- que e o que a propria secao proibe."
    )


# --- 4. caminhos mortos -------------------------------------------------------


@pytest.mark.unit
def test_manifesto_de_coerencia_aponta_para_caminhos_vivos() -> None:
    """22 referencias apontam para `.cerebro/` e para a pasta errada.

    `.claude/CLAUDE.md` nao existe desde a fusao `.cerebro` -> `.claude`, e
    `GLOBAL_INSTRUCTIONS.md` vive em `.claude/GOVERNANCA/`. O leitor recebia
    um conjunto de regras em que a camada de identidade simplesmente não
    carregava.
    """
    texto = _ler(MANIFEST)
    assert "`.claude/CLAUDE.md`" not in texto, (
        "COHERENCE_MANIFEST.md voltou a apontar `.claude/CLAUDE.md`, que nao "
        "existe desde a fusao `.cerebro` -> `.claude`. A constituticao esta "
        "na raiz do repositorio."
    )
    assert "`GLOBAL_INSTRUCTIONS.md`" not in texto, (
        "COHERENCE_MANIFEST.md voltou a apontar `GLOBAL_INSTRUCTIONS.md` na raiz "
        "de `.claude/`. O arquivo vive em `.claude/GOVERNANCA/`."
    )


@pytest.mark.unit
def test_todo_caminho_backtickado_do_manifesto_resolve() -> None:
    """Caminho citado em documento de coerencia que nao resolve e agujero.

    A leitura e tolerante -- um caminho morto nao levanta excecao nenhuma, ele
    simplesmente some do prompt. E a mesma tolerancia que torna a falha
    invisivel.
    """
    texto = _ler(MANIFEST)
    candidatos = re.findall(r"`([A-Za-z0-9_./-]+\.md)`", texto)

    mortos = []
    for c in candidatos:
        if "<" in c or "*" in c:  # template, nao caminho
            continue
        if not ((RAIZ / c).exists() or (RAIZ / ".claude" / c).exists() or (RAIZ / "GOVERNANCA" / c).exists()):
            mortos.append(c)

    assert not mortos, f"COHERENCE_MANIFEST.md aponta para caminhos mortos: {sorted(set(mortos))}"


# --- 5. posicao da autoridade, declarada ---------------------------------------


@pytest.mark.unit
def test_adaptadores_declaram_a_mesma_constituicao() -> None:
    """Os quatro adaptadores apontam para o mesmo arquivo.

    Divergencia aqui e o modo como o fork historico nascia: cada um com a sua
    versao do que era canonico, e nenhuma trava.
    """
    titulo = _ler(CLAUDE).split("\n", 1)[0].lower()
    assert "projeto" in titulo, (
        f"o titulo da constituicao nao contem 'projeto': {titulo!r}. "
        "A declaracao de escopo e o que impede este arquivo de ser confundido "
        "com a raiz multiprojeta e com o ponteiro de escopo de usuario."
    )
    assert "site" in titulo, (
        f"o titulo da constituicao nao contem 'site': {titulo!r}. "
        "A declaracao de escopo e o que impede este arquivo de ser confundido "
        "com a raiz multiprojeta e com o ponteiro de escopo de usuario."
    )

    for adaptador in ("AGENTS.md", "GEMINI.md"):
        texto = _sem_acento(_ler(RAIZ / adaptador))
        assert "claude.md" in texto, f"{adaptador} deixou de apontar para o CLAUDE.md. Adaptador aponta; nunca define."


# --- 6. endereco inventado -----------------------------------------------------


@pytest.mark.unit
def test_nenhum_documento_cita_subsecao_que_nao_existe() -> None:
    """`§N.N` para um subitem que a constituicao nao numera.

    Os subitens da piramide sao titulos `###` sem numero. Citar `§1.5`
    parece preciso e e inventado: nao ha `1.5`, e nao ha nada para receber a
    referencia. Foi o que aconteceu em `PRODUCT_OWNERSHIP.md` durante esta
    auditoria -- `§1.1`, `§1.5`, `§1.6` e `§1.10` foram escritos com a
    conviccao de quem esta citando, e nao_existiam.

    Subitem nao numerado se cita pelo nome. Endereco que nao resolve e pior
    que ausencia de endereco, porque desvia a atencao para um ponto que
    parece existir.
    """
    validas = set(re.findall(r"^#{2,4} (\d+(?:\.\d+)+)\.?", _ler(CLAUDE), re.M))
    # subniveis nao sao auto-contidos: §8.3 existe sem §8.3.1
    validas |= {n.split(".")[0] for n in validas}

    alvos = (
        ".claude/GOVERNANCA/PRODUCT_OWNERSHIP.md",
        "AGENTS.md",
        "governance/KERNEL.md",
        "docs/INDEX.md",
    )
    for rel in alvos:
        p = RAIZ / rel
        if not p.exists():
            continue
        texto = _ler(p)
        orfas = []
        for m in re.finditer(r"§\s?(\d+\.\d+)", texto):
            n = m.group(1)
            if n in validas:
                continue
            # prosa que *fala sobre* endereco ("um `§1.5` aqui seria
            # endereco inventado") nao e citacao -- e o proprio guard
            # precisa disso para poder descrever o defeito que impede.
            # A janela e bidirecional: o qualificador tanto precede
            # ("endereco inventado, como §1.5") quanto sucede ("um §1.5
            # aqui seria inventado") a mencao.
            janela = re.sub(r"\s+", " ", texto[max(0, m.start() - 110) : m.end() + 90])
            if re.search(
                r"(inventado|n[aã]o existe|inexistente|seria|exemplo|hipot|"
                r"sem n[uú]mero|n[aã]o numerad)",
                janela,
                re.I,
            ):
                continue
            orfas.append(n)
        assert not orfas, (
            f"{rel} cita subsecao inexistente: {sorted(set(orfas))}. "
            "Os subitens da piramide nao sao numerados -- cite pelo titulo."
        )


# --- 6b. referencia ambigua: a que constituicao? -------------------------------

# Medido em 2026-09-29. existem duas constituicoes: a do projeto
# (`Site/CLAUDE.md`, 11 secoes) e a multiprojeto (`~/.gemini/CLAUDE.md`, 8).
# Um `§6.4` nu existe na segunda e nao na primeira; um `§8.3` existe na
# primeira e nao na segunda. As duas classes coexistem em reports/ sem
# qualificador, e o leitor tem 50% de chance por referencia.
#
# Nao e erro de quem escreveu: `§6.4` estava certo para a raiz e continua
# certo. E ambiguidade -- o defeito e a ausencia do qualificador, nao o
# numero. Por isso o guard exige a qualificacao e nao reescreve os relatorios:
# reescrever 100+ relatorios historicos para satisfazer um verificador seria
# fabricar uma verdade que eles nao viveram.
QUALIFICADORES = re.compile(
    r"(da raiz|multiproject|raiz multiprojet|C:\\\\Users\\\
apha\\\\\.gemini\\\\CLAUDE|"
    r"deste handoff|deste relatorio| deste |deste registro|ra[ií]z)",
    re.I,
)


@pytest.mark.unit
def test_referencia_do_canonico_e_qualificada_quando_ambigua() -> None:
    """`§N` que existe nas duas constituicoes precisa dizer a qual.

    O criterio e o do §7 do `CLAUDE.md`: numero ambiguo e numero errado.
    Aqui so se cobra a qualificacao nos documentos de governanca -- os
    reports historicos ficam de fora de proposito, e o guard acima diz por
    que.
    """
    do_canonico = set(re.findall(r"^#{2,4} (\d+(?:\.\d+)*)\.?", _ler(CLAUDE), re.M))
    raiz_md = RAIZ.parent / "CLAUDE.md"
    if not raiz_md.exists():
        return  # sem multiprojeto, nao ha ambiguidade
    da_raiz = set(re.findall(r"^#{2,4} (\d+(?:\.\d+)*)\.?", raiz_md.read_text(encoding="utf-8-sig"), re.M))
    ambiguas = {n for n in do_canonico & da_raiz if any(c in n for c in ".")}
    if not ambiguas:
        return

    for rel in (".claude/GOVERNANCA/PRODUCT_OWNERSHIP.md", "governance/KERNEL.md"):
        p = RAIZ / rel
        if not p.exists():
            continue
        texto = _ler(p)
        sem_qualificacao = []
        for m in re.finditer(r"§\s?(\d+\.\d+)", texto):
            n = m.group(1)
            if n not in ambiguas:
                continue
            janela = re.sub(r"\s+", " ", texto[max(0, m.start() - 120) : m.end() + 40])
            if not QUALIFICADORES.search(janela):
                sem_qualificacao.append(n)
        assert not sem_qualificacao, (
            f"{rel} cita {sorted(set(sem_qualificacao))} sem dizer a qual "
            "constituicao: existem no canonico do projeto E na raiz "
            "multiprojeto. Qualifique ('da raiz', 'deste relatorio')."
        )


# --- 7. caractere de script estranho --------------------------------------------

# CJK, hangul, kana, cirilico, arabico, hebraico. Nada disso pertence a um
# documento em portugues, e apareceu tres vezes durante esta auditoria --
# sempre no mesmo sitio: uma frase longa em que o cursor salta e a proxima
# palavra sai de outro alfabeto. E uma classe silenciosa: o arquivo abre,
# o diff mostra a mudanca, e o leitor segue sem ver nada errado.
SCRIPTS_NAO_LATINOS = (
    (0x4E00, 0x9FFF, "CJK"),
    (0xAC00, 0xD7AF, "HANGUL"),
    (0x3040, 0x30FF, "KANA"),
    (0x0400, 0x04FF, "CIRILICO"),
    (0x0600, 0x06FF, "ARABICO"),
    (0x0590, 0x05FF, "HEBRAICO"),
)


@pytest.mark.unit
def test_nenhum_documento_de_governanca_tem_script_estranho() -> None:
    for rel in DOCUMENTOS_DE_GOVERNANCA:
        p = RAIZ / rel
        if not p.exists():
            continue
        texto = _ler(p)
        achados = []
        for i, ch in enumerate(texto):
            cp = ord(ch)
            nome = next((n for lo, hi, n in SCRIPTS_NAO_LATINOS if lo <= cp <= hi), None)
            if nome:
                ctx = re.sub(r"\s+", " ", texto[max(0, i - 40) : i + 20])
                achados.append(f"U+{cp:04X} {nome} em «{ctx}»")
        assert not achados, f"{rel} contem caractere de script nao latino: " + "; ".join(achados)
