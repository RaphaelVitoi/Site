"""Portao dos criterios da secao 13.F que dependem de LER o registro inteiro.

Divisao de trabalho com `record_anchor_gate.ps1`, e ela nao e arbitraria:

    record_anchor_gate.ps1  ->  linha a linha, sobre o DIFF
                                (supressor sem Record-Id, credencial, campos
                                 obrigatorios por regex)

    record_gate.py          ->  documento inteiro, sobre o CONTEUDO
                                (YAML valido, TTL, config_medida, ancora
                                 interna, ampliacao de origem)

O portao PowerShell confere presenca de campo com `^([a-z_]+):`. Regex ve campo;
nao ve documento. Medido em 2026-08-28: SEIS dos dez registros com frontmatter
desta base nao eram YAML valido -- `- texto: mais texto` vira mapa em vez de
string, e crase e caractere indicador. O portao aprovava os seis, porque o
regex achava os campos. **Campo presente num bloco que nenhum parser le e a
forma mais limpa de sinal verde desconectado que esta base ja produziu.**

Como o outro portao, opera sobre o que esta EM STAGE. Portao que reprova por
divida preexistente e portao que se desliga na primeira semana.
"""

from __future__ import annotations

from collections.abc import Iterator
import contextlib
from datetime import date

# pylint: disable=wrong-import-position
import json
from pathlib import Path
import re
import subprocess
import sys

import yaml

RAIZ: Path = Path(__file__).resolve().parent.parent.parent

# A RAIZ do repositorio no path, nunca este diretorio: com `scripts/ops` no
# path, `record_index` e `scripts.ops.record_index` viram DOIS objetos de modulo
# para o mesmo arquivo (medido). Ver o docstring de `scripts/ops/__init__.py`.
# Este script tambem roda direto pelo hook, quando sys.path[0] e `scripts/ops` --
# por isso a raiz precisa entrar explicitamente.
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from scripts.ops.record_index import (  # noqa: E402
    VIGENTE,
    avaliar_registro,
    conferir_config_medida,
    estado_de,
    ler_frontmatter_de_texto,
    resolvedores_de_ambiente,
    ttl_vencido,
)
from scripts.ops.saude_da_malha import imprimir as imprimir_saude_da_malha  # noqa: E402

CAMPOS_OBRIGATORIOS = ("id", "tipo", "escopo", "autor", "criado_em", "verificado", "nao_verificado")
DIFF_FILTER_ACM = "--diff-filter=ACM"

# Caminho citado em crase, link markdown ou parenteses.
# A alternancia vai da extensao MAIS LONGA para a mais curta, e isso nao e
# estetica: regex alternation casa a PRIMEIRA que serve, nunca a maior. Medido
# em 2026-09-08 -- com `json` antes de `jsonl`, a citacao
# `[.../feedback-ledger.jsonl]` era capturada como `.../feedback-ledger.json`, e
# o portao acusava referencia morta a um arquivo que ninguem citou. O mesmo
# defeito estava latente em `ts` antes de `tsx` e `js` antes de `jsx`.
# tests/test_record_index.py guarda a ordem, inclusive contra extensao NOVA
# acrescentada no lugar errado.
RE_CAMINHO_CITADO = re.compile(
    r"[`\(\[]([\w][\w./\\-]*\.(?:psm1|jsonl|json|yaml|toml|tsx|jsx|ps1|yml|cmd|py|md|ts|js|sh))"
)
EXTENSOES_DE_CODIGO = re.compile(r"\.(py|ps1|psm1|js|jsx|ts|tsx|go|rs|rb|java|cs|sh)$")

# Ampliacao de origem. Padroes de alta precisao apenas: heuristica generica
# produz falso positivo, e portao que cria ruido e portao que sera ignorado.
PADROES_DE_AMPLIACAO = {
    "origem CDP irrestrita": re.compile(r"--remote-allow-origins\s*=\s*\*"),
    "CORS liberado para qualquer origem": re.compile(
        r"""(Access-Control-Allow-Origin["'\s:]+\*|allow_origins\s*=\s*\[?["']\*["'])"""
    ),
    "CORS liberado por flag de framework": re.compile(r"CORS_ALLOW_ALL_ORIGINS\s*=\s*True"),
}


def _git(*args: str) -> str:
    r = subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True, check=False)
    return r.stdout


def texto_como_vai_ao_commit(rel: str) -> str | None:
    """Conteudo do arquivo COMO ELE VAI PARA O COMMIT -- do INDICE, nao da arvore.

    Ate 2026-08-29 este portao pegava a LISTA de arquivos do indice
    (`git diff --cached`) e depois lia o CONTEUDO do disco. Sao dois estados
    diferentes: `git add` congela uma versao, e a edicao seguinte nao entra no
    commit mas entra na leitura. O portao aprovava o que estava na tela enquanto
    o commit levava outra coisa -- e ja aprovou, nesta casa, conteudo que nao foi
    commitado.

    Fora de um repositorio, ou para caminho que nao esta no indice, cai para a
    arvore: ali ela e a unica fonte que existe. Isso nao reabre o buraco, porque
    em `verificar()` os caminhos vem de `--cached --diff-filter=ACM` e portanto
    estao sempre no indice.
    """
    r = subprocess.run(["git", "show", f":{rel}"], cwd=RAIZ, capture_output=True, check=False)
    if r.returncode == 0:
        return r.stdout.decode("utf-8-sig", errors="ignore")
    caminho = RAIZ / rel
    if not caminho.is_file():
        return None
    return caminho.read_text(encoding="utf-8-sig", errors="ignore")


def textos_do_indice(rels: list[str]) -> dict[str, str | None]:
    """Mesma leitura de `texto_como_vai_ao_commit`, para N caminhos num unico processo git.

    Um `git show` por arquivo custava ~56 ms no Windows: 368 chamadas eram 20 s de 24 s.
    """
    if not rels:
        return {}
    entrada = "".join(f":{rel}\n" for rel in rels).encode("utf-8")
    r = subprocess.run(["git", "cat-file", "--batch"], cwd=RAIZ, input=entrada, capture_output=True, check=False)
    if r.returncode != 0:
        return {rel: texto_como_vai_ao_commit(rel) for rel in rels}
    dados, pos, textos = r.stdout, 0, {}
    for rel in rels:
        fim = dados.index(b"\n", pos)
        cabecalho = dados[pos:fim].decode("utf-8", errors="replace")
        pos = fim + 1
        if cabecalho.endswith(" missing"):
            textos[rel] = texto_como_vai_ao_commit(rel)  # fora do indice: cai para a arvore
            continue
        tamanho = int(cabecalho.rsplit(" ", 1)[1])
        textos[rel] = dados[pos : pos + tamanho].decode("utf-8-sig", errors="ignore")
        pos += tamanho + 1
    return textos


def jsonl_que_so_cresceram(rels: list[str]) -> set[str]:
    """`.jsonl` cujo conteudo no HEAD e prefixo byte a byte do conteudo em stage.

    Cada linha de um `.jsonl` e um registro independente: anexar linhas no fim nao
    altera nenhuma das anteriores, e o que um registro atestou sobre elas continua
    intacto. Medido em 2026-09-13: os 32 commits que tocaram o feedback-ledger foram
    TODOS so adicao, e custaram 423 revisoes_de_ancora.

    So `.jsonl`, de proposito. Em codigo, anexar no fim pode redefinir o que veio
    antes -- um `def` repetido no fim de um `.py` substitui o primeiro.
    """
    rels = [rel for rel in rels if rel.endswith(".jsonl")]
    if not rels:
        return set()
    entrada = "".join(f"HEAD:{rel}\n:{rel}\n" for rel in rels).encode("utf-8")
    r = subprocess.run(["git", "cat-file", "--batch"], cwd=RAIZ, input=entrada, capture_output=True, check=False)
    if r.returncode != 0:
        return set()
    dados, pos, blobs = r.stdout, 0, []
    for _ in range(2 * len(rels)):
        fim = dados.index(b"\n", pos)
        cabecalho = dados[pos:fim].decode("utf-8", errors="replace")
        pos = fim + 1
        if cabecalho.endswith(" missing"):
            blobs.append(None)
            continue
        tamanho = int(cabecalho.rsplit(" ", 1)[1])
        blobs.append(dados[pos : pos + tamanho])
        pos += tamanho + 1
    crescidos: set[str] = set()
    for i, rel in enumerate(rels):
        antes, depois = blobs[2 * i], blobs[2 * i + 1]
        if antes is not None and depois is not None and len(depois) > len(antes) and depois.startswith(antes):
            crescidos.add(rel)
    return crescidos


def _corpus_do_indice() -> list[tuple[str, str]]:
    """(caminho, texto) de docs/*.md e reports/*.md, lidos do indice num unico processo."""
    rels = [rel for rel in _git("ls-files", "docs/*.md", "reports/*.md").splitlines() if rel.strip()]
    return [(rel, texto) for rel, texto in textos_do_indice(rels).items() if texto]


def arquivos_em_stage() -> list[str]:
    saida = _git("diff", "--cached", "--name-only", DIFF_FILTER_ACM)
    return [linha for linha in saida.splitlines() if linha.strip()]


def caminhos_removidos_em_stage() -> list[str]:
    """Caminhos que o commit apaga ou renomeia -- o nome antigo deixa de existir."""
    removidos = []
    for linha in _git("diff", "--cached", "--name-status", "-M", "--diff-filter=DR").splitlines():
        partes = linha.split("\t")
        if len(partes) >= 2:
            removidos.append(partes[1])  # D: o caminho; R: o nome ANTIGO
    return removidos


def citacoes_ao_que_o_commit_remove(em_stage: list[str]) -> list[str]:
    """G6b: documento prescritivo FORA do stage que cita caminho que este commit apaga ou move.

    A G6 so olha documento em stage. Apagar ou mover o arquivo citado deixa o documento
    fora do stage, e a morte so aparecia na suite do pre-push, minutos depois do commit
    aprovado. Medido em 2026-09-18: duas vezes num dia, as duas por mim.
    """
    erros = []
    for removido in caminhos_removidos_em_stage():
        for rel in _git("grep", "--cached", "-l", "-F", removido, "--", "*.md").splitlines():
            if rel in em_stage or not _e_prescritivo(rel):
                continue  # em stage, a G6 ja o cobre
            if removido in referencias_mortas(rel):
                erros.append(
                    f"{rel} cita `{removido}`, que este commit apaga ou move. Atualize a citacao, "
                    "ou -- se o registro e historico -- declare o caminho em referencias_nao_resolviveis."
                )
    return erros


def _blob(revisao_e_caminho: str) -> str | None:
    """Hash do blob de um caminho numa revisao (`HEAD:x`) ou no indice (`:x`)."""
    r = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", revisao_e_caminho],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        check=False,
    )
    saida = r.stdout.strip()
    return saida if r.returncode == 0 and saida else None


def caminhos_herdados_de_merge() -> set[str]:
    """Num merge, os caminhos cujo conteudo em stage veio inteiro de um pai.

    `arquivos_em_stage()` usa `git diff --cached`, que compara o indice com HEAD
    -- o PRIMEIRO pai. Num merge isso varre tambem tudo que veio do outro lado,
    inclusive o que ja cumpriu sua obrigacao de ancora na branch de origem.

    Medido em 2026-09-01: o merge da fusao `.cerebro` -> `.claude` recobrou 15
    ancoras ja reconciliadas do lado remoto, em 12 caminhos cujo resultado era
    byte a byte identico a ele. Reconciliar de novo nao acrescenta verificacao
    -- so custa ao operador escrever parecer para mudanca que nao e dele, o que
    empurra na direcao do parecer generico, e parecer generico e pior que
    nenhum.

    A regra: um caminho e DO MERGE quando difere de TODOS os pais -- e isso que
    a resolucao de fato decidiu, e so isso e obrigacao de quem commita o merge.
    Batendo com qualquer pai, foi herdado.

    Fora de um merge devolve conjunto vazio, e nada muda.
    """
    git_dir = _git("rev-parse", "--git-dir").strip()
    if not git_dir:
        return set()
    merge_head = (RAIZ / git_dir / "MERGE_HEAD").resolve()
    if not merge_head.is_file():
        return set()

    pais = ["HEAD", *merge_head.read_text(encoding="utf-8").split()]
    herdados: set[str] = set()
    for rel in arquivos_em_stage():
        no_indice = _blob(f":{rel}")
        if not no_indice:
            continue
        if any(no_indice == _blob(f"{pai}:{rel}") for pai in pais):
            herdados.add(rel)
    return herdados


def linhas_adicionadas(arquivo: str) -> list[str]:
    saida = _git("diff", "--cached", "--unified=0", DIFF_FILTER_ACM, "--", arquivo)
    return [line[1:] for line in saida.splitlines() if line.startswith("+") and not line.startswith("+++")]


_RE_HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)")


def linhas_adicionadas_numeradas(arquivo: str) -> list[tuple[int, str]]:
    """(numero da linha no arquivo novo, texto). O numero vem do cabecalho de hunk.

    Sem ele nao da para saber se a linha esta dentro de um bloco de comentario:
    o diff entrega linhas soltas, e estado de bloco nao se deduz de linha solta.
    """
    saida = _git("diff", "--cached", "--unified=0", DIFF_FILTER_ACM, "--", arquivo)
    numeradas: list[tuple[int, str]] = []
    atual = 0
    for line in saida.splitlines():
        cabecalho = _RE_HUNK.match(line)
        if cabecalho:
            atual = int(cabecalho.group(1))
            continue
        if line.startswith("+") and not line.startswith("+++"):
            numeradas.append((atual, line[1:]))
            atual += 1
    return numeradas


def linhas_em_bloco_de_comentario(rel: str, texto: str | None = None) -> set[int]:
    """Numeros de linha que estao DENTRO de um bloco de comentario do arquivo.

    Achado de 2026-08-28, auditando um arquivo de outra sessao: o cabecalho
    `<# ... #>` de `Launch-ChromeSOTA.ps1` explica que a versao anterior usava
    `--remote-allow-origins=*`. E documentacao correta -- e o detector de
    ampliacao de origem a reprovaria, porque so pulava linha que COMECA com
    `#` ou `//`. Nona vez que um detector desta base confunde citar com
    afirmar, e de novo a resposta e estado de BLOCO, nao prefixo de linha.
    """
    if texto is None:
        texto = texto_como_vai_ao_commit(rel)
    if texto is None:
        return set()
    if rel.endswith((".ps1", ".psm1")):
        return _linhas_comentario_powershell(texto)
    if rel.endswith(".py"):
        return _linhas_comentario_python(texto)
    return set()


def _linhas_comentario_powershell(texto: str) -> set[int]:
    dentro: set[int] = set()
    em_bloco = False
    for n, linha in enumerate(texto.splitlines(), start=1):
        if em_bloco:
            dentro.add(n)
            if "#>" in linha:
                em_bloco = False
        elif "<#" in linha:
            em_bloco = True
            dentro.add(n)
            if "#>" in linha.split("<#", 1)[1]:
                em_bloco = False
    return dentro


def _linhas_comentario_python(texto: str) -> set[int]:
    dentro: set[int] = set()
    delim_py: str | None = None
    for n, linha in enumerate(texto.splitlines(), start=1):
        if delim_py:
            dentro.add(n)
            if delim_py in linha:
                delim_py = None
            continue
        for d in ('"""', "'''"):
            if d in linha:
                dentro.add(n)
                if linha.count(d) == 1:
                    delim_py = d
                break
    return dentro


def _e_registro(rel: str) -> bool:
    return rel.endswith(".md") and rel.startswith(("docs/", "reports/"))


def _e_prescritivo(rel: str) -> bool:
    """Documento que INSTRUI, e nao que descreve um estado passado.

    O recorte saiu da medicao, nao de gosto. Varrendo os 518 `.md` rastreados,
    1511 citacoes "nao resolviam" -- e o ruido dominava: `Next.js` casa com a
    extensao .js, nome solto de componente nao e caminho, e prompt de
    continuidade arquivado cita arquivo que existia NAQUELE dia. Restringindo
    ao corpus vivo e a citacoes com barra, sobraram 46; restringindo ao que
    PRESCREVE, sobraram 3 -- todas escritas nesta semana, por mim.

    Auditoria datada de marco citando arquivo que sumiu depois nao e podridao,
    e registro. Portao que a reprovasse seria desligado na primeira semana.

    Sob `reports/`, exige frontmatter: registro sem ancora esta em adocao
    pendente (o portao de ancora ja avisa), e cobrar dele a precisao de um
    registro ancorado seria cobrar divida preexistente. Os tres unicos casos
    que isso exclui hoje sao relatorios datados de v7/v8 descrevendo estados
    passados.
    """
    if not rel.endswith(".md"):
        return False
    if "/" not in rel:
        return True  # governanca na raiz do projeto: sempre prescritiva
    if not rel.startswith("reports/"):
        return False
    return (texto_como_vai_ao_commit(rel) or "").startswith("---")


def raizes_de_escopo() -> set[str]:
    """Primeiros segmentos de caminho que enderecam FORA deste repositorio.

    Vem do indice canonico da frente 1, nao de uma lista escrita a mao: um
    registro multiprojeto enderaca `Site/CLAUDE.md` ou `antigravity/.claude/...`
    a partir da raiz de cima, e desta arvore isso pode ser inverificavel sem ser
    inexistente. Verifica-se o que da para verificar; o resto se declara.
    """
    fora = {"extensions", "antigravity-cli", "antigravity-ide", "config"}
    try:
        indice = json.loads((RAIZ / "data" / "INDICE_CANONICO_GOVERNANCA.json").read_text(encoding="utf-8"))
        regra = indice.get("regra_de_nomeacao", {})
        fora |= {r for r in regra.get("raizes_de_escopo_reconhecidas", []) if r != "."}
        for grupo in regra.get("fora_do_alcance_da_regra", {}).values():
            if isinstance(grupo, list):
                fora |= {p.split("/", 1)[0] for p in grupo}
    except (OSError, json.JSONDecodeError):
        pass
    return fora


def _e_derivado(rel: str) -> bool:
    """Caminho coberto pelo .gitignore: artefato gerado, ausencia e normal."""
    r = subprocess.run(["git", "check-ignore", "-q", rel], cwd=RAIZ, capture_output=True, text=True, check=False)
    return r.returncode == 0


def _grafias_a_partir_da_raiz(limpo: str, documento: Path) -> list[str]:
    """O caminho citado, reescrito a partir da raiz do repositorio.

    A citacao dentro de um documento e RELATIVA ao diretorio dele -- um registro
    em `reports/` que aponta `cwv/relatorio.md` fala de `reports/cwv/`, que o
    .gitignore cobre. Testar so a grafia literal fazia o artefato gerado ser
    lido como referencia morta por causa do ponto de partida, nao por ausencia.
    """
    grafias = [limpo]
    with contextlib.suppress(ValueError):
        grafias.append((documento.parent / limpo).resolve().relative_to(RAIZ).as_posix())
    return grafias


def submodulos_declarados() -> list[str]:
    """Prefixos de submodulo, lidos do `.gitmodules` -- nao do disco.

    `git worktree add` NAO inicializa submodulo, e clone raso tambem nao. Numa
    arvore assim, `skills/gemini-supermemory/src/...` nao existe no disco e
    ainda assim e um endereco legitimo. Achado na primeira execucao da suite
    isolada: um teste que passava aqui reprovava em arvore limpa -- ou seja,
    reprovaria em CI e em qualquer outra maquina.
    """
    saida = _git("config", "-f", ".gitmodules", "--get-regexp", r"^submodule\..*\.path$")
    return [linha.split(" ", 1)[1].strip() for linha in saida.splitlines() if " " in linha]


def referencias_mortas(rel: str) -> list[str]:
    """Caminhos citados pelo documento que nao aterrissam em lugar nenhum.

    Tres isencoes, e as tres sao ESTRUTURAIS, nunca por caminho de arquivo:

    - caminho dentro de submodulo DECLARADO que nao esta materializado: o
      endereco existe mesmo quando o conteudo nao foi baixado. Quando o
      submodulo ESTA no disco, a verificacao volta a ser normal -- verifica-se
      o que da para verificar, e declara-se o que nao da.

    - linha com `$$`: e LaTeX. O primeiro rascunho acusou o GEMINI.md por causa
      de `\\text{(implementation\\_plan.md)}`, que nao e referencia a arquivo e
      sim o nome de uma etapa num diagrama de ciclo de vida.
    - caminho listado em `referencias_nao_resolviveis:` no frontmatter: o
      registro DECLARA que cita aquele caminho de proposito, sabendo que este
      repositorio nao o resolve. Duas causas legitimas ja apareceram -- caminho
      que SUMIU e esta sendo citado para dizer isso, e caminho que existe no
      disco mas NUNCA foi rastreado (arquivo de outra sessao). O nome do campo
      cobre as duas: o que importa nao e por que nao resolve, e que o autor
      sabe que nao resolve. E a
      oitava vez que um detector desta base reprova a prosa que o documenta, e a
      resposta continua sendo a mesma -- so que aqui nao da para distinguir pela
      forma: `X` citado para apontar e `X` citado para dizer "sumiu" sao a mesma
      sequencia de caracteres. Quando a forma nao separa, quem separa e a
      DECLARACAO do autor, visivel na revisao, item a item.
    """
    texto = texto_como_vai_ao_commit(rel)
    if texto is None:
        return []
    # `caminho` fica so para ARITMETICA de caminho (resolver citacao relativa ao
    # diretorio do documento). O CONTEUDO vem do indice, acima.
    caminho = RAIZ / rel

    fm, _ = ler_frontmatter_de_texto(texto)
    historicas = (fm or {}).get("referencias_nao_resolviveis") or []
    if isinstance(historicas, str):
        historicas = [historicas]
    historicas = set(historicas)

    prefixos_de_submodulo_vazio = _prefixos_submodulos_vazios()
    escopos = raizes_de_escopo()

    mortas = []
    for linha in texto.splitlines():
        if "$$" in linha:
            continue
        for m in RE_CAMINHO_CITADO.finditer(linha):
            citado = m.group(1)
            if not _referencia_morta(citado, historicas, prefixos_de_submodulo_vazio, escopos, caminho):
                continue
            mortas.append(citado)
    return mortas


RE_ID_PENDENCIA = re.compile(r"^[a-z0-9][a-z0-9-]{4,79}$")


def _pendencias_de(fm: dict) -> list[dict]:
    itens = fm.get("pendencias") or []
    return [i for i in itens if isinstance(i, dict)] if isinstance(itens, list) else []


def _resolvidas_de(fm: dict) -> list[str]:
    itens = fm.get("pendencias_resolvidas") or []
    if isinstance(itens, str):
        itens = [itens]
    return [str(i) for i in itens] if isinstance(itens, list) else []


def coletar_pendencias(hoje: date | None = None) -> tuple[list[dict], list[str]]:
    """Tarefas declaradas e ainda nao encerradas, varrendo o corpus inteiro.

    MEDIDO EM 2026-09-12, e esta e a origem da funcao. Uma recomendacao escrita
    em 2026-08-28 dentro de `patches/skills/README.md` -- criar fork proprio por
    submodulo e apontar o gitlink para ele -- ficou CATORZE DIAS parada. Nao por
    discordancia: por invisibilidade. Prosa em README de diretorio nao e lida por
    portao nenhum, e quinze sessoes passaram sem que ela aparecesse em lista,
    relatorio ou verificacao alguma. Ela so andou quando o Tier 0 empurrou.

    A licao nao foi "escrever noutro lugar", foi escrever ONDE UM PORTAO JA OLHA.
    Dai a pendencia morar no frontmatter, que o portao ja le em todo commit.

    ENCERRAMENTO E POR APPEND, nunca por remocao. Quem resolve declara o id em
    `pendencias_resolvidas:` num registro NOVO; a pendencia continua no registro
    que a criou, porque registro publicado nao se reescreve -- a mesma regra do
    ledger. Assim a trilha guarda quando nasceu, quem devia e quando fechou.

    NAO BLOQUEIA. Pendencia que impede commit vira pendencia que alguem apaga; o
    valor esta em ela APARECER na tela que todo condutor ve. O que bloqueia e
    declaracao malformada, porque ai o portao nao consegue nem exibi-la.
    """
    hoje = hoje or date.today()
    declaradas: dict[str, dict] = {}
    resolvidas: set[str] = set()
    for rel, texto in _corpus_do_indice():
        fm, _ = ler_frontmatter_de_texto(texto)
        if not fm:
            continue
        for item in _pendencias_de(fm):
            pid = str(item.get("id") or "")
            if pid and pid not in declaradas:
                declaradas[pid] = {**item, "origem": rel}
        resolvidas.update(_resolvidas_de(fm))

    abertas = []
    for pid, item in declaradas.items():
        if pid in resolvidas:
            continue
        vencida = _pendencia_vencida(item, hoje)
        abertas.append({**item, "vencida": vencida})
    abertas.sort(key=lambda i: (not i["vencida"], str(i.get("prazo") or "9999-12-31"), i["id"]))
    orfas = sorted(resolvidas - set(declaradas))
    return abertas, orfas


def _prefixos_submodulos_vazios() -> tuple[str, ...]:
    # Submodulo declarado e nao materializado: endereco valido, conteudo ausente.
    # As duas grafias entram -- `skills/x/` e `<repo>/skills/x/` -- porque um
    # registro multiprojeto cita a partir da raiz de cima.
    prefixos: list[str] = []
    for sub in submodulos_declarados():
        pasta = RAIZ / sub
        materializado = pasta.is_dir() and any(pasta.iterdir())
        if not materializado:
            prefixos.append(f"{sub}/")
            prefixos.append(f"{RAIZ.name}/{sub}/")
    return tuple(prefixos)


def _referencia_existe(limpo: str, caminho: Path) -> bool:
    variantes = [limpo]
    if limpo.endswith(".ts"):
        variantes.append(limpo + "x")
    elif limpo.endswith(".js"):
        variantes.append(limpo[:-3] + ".jsx")
    return any((raiz / var).exists() for var in variantes for raiz in (RAIZ, caminho.parent, RAIZ.parent))


def _referencia_morta(
    citado: str, historicas: set[str], prefixos_de_submodulo_vazio: tuple[str, ...], escopos: set[str], caminho: Path
) -> bool:
    if "/" not in citado and "\\" not in citado:
        return False  # nome solto e nome, nao endereco
    if citado in historicas:
        return False
    limpo = citado.replace("\\_", "_").replace("\\", "/")
    if prefixos_de_submodulo_vazio and limpo.startswith(prefixos_de_submodulo_vazio):
        return False
    if _referencia_existe(limpo, caminho):
        return False
    # Nao resolveu. Antes de chamar de MORTA, separar o que este
    # repositorio simplesmente nao tem como verificar.
    primeiro = limpo.split("/", 1)[0]
    if primeiro in escopos:
        return False  # endereco de projeto irmao ou espelho
    # artefato gerado, ausente por desenho
    return not any(_e_derivado(v) for v in _grafias_a_partir_da_raiz(limpo, caminho))


def _pendencia_vencida(item: dict, hoje: date) -> bool:
    prazo = str(item.get("prazo") or "")
    vencida = False
    if prazo:
        try:
            vencida = date.fromisoformat(prazo) < hoje
        except ValueError:
            vencida = False
    return vencida


def _verificar_frontmatters(registros_em_stage: list[str], hoje: date, ambiente: dict, erros: list[str]) -> None:
    for rel in registros_em_stage:
        _verificar_frontmatter(rel, hoje, ambiente, erros)


def _revisoes_em_stage(
    registros_em_stage: list[str], erros: list[str]
) -> tuple[set[str], list[tuple[str, str, set[str], str]]]:
    supersedidos_em_stage: set[str] = set()
    revisoes_candidatas: list[tuple[str, str, set[str], str]] = []
    for rel in registros_em_stage:
        texto = texto_como_vai_ao_commit(rel)
        if texto:
            _revisoes_do_registro(rel, texto, supersedidos_em_stage, revisoes_candidatas, erros)

    return supersedidos_em_stage, revisoes_candidatas


def _ler_registros_ancorados() -> tuple[dict[str, tuple[str, dict]], list[tuple[str, dict]]]:
    registros_por_id: dict[str, tuple[str, dict]] = {}
    registros_lidos: list[tuple[str, dict]] = []
    for rel, texto in _corpus_do_indice():
        fm, _ = ler_frontmatter_de_texto(texto)
        if not fm:
            continue
        registros_lidos.append((rel, fm))
        doc_id = str(fm.get("id") or "")
        if doc_id:
            registros_por_id[doc_id] = (rel, fm)
    return registros_por_id, registros_lidos


def _aceitar_revisoes(
    revisoes_candidatas: list[tuple[str, str, set[str], str]],
    registros_por_id: dict[str, tuple[str, dict]],
    erros: list[str],
) -> dict[str, set[str]]:
    revisoes_aceitas: dict[str, set[str]] = {}
    for origem, registro_id, caminhos_revisados, _parecer in revisoes_candidatas:
        alvo = registros_por_id.get(registro_id)
        if alvo is None:
            erros.append(f"{origem}: revisoes_de_ancora declara registro inexistente: {registro_id}.")
            continue
        alvo_rel, alvo_fm = alvo
        caminhos_declarados = alvo_fm.get("caminhos") or []
        if isinstance(caminhos_declarados, str):
            caminhos_declarados = [caminhos_declarados]
        nao_declarados = sorted(caminhos_revisados - set(caminhos_declarados))
        if nao_declarados:
            erros.append(
                f"{origem}: revisoes_de_ancora para {registro_id} cita caminho nao declarado em "
                f"{alvo_rel}: {nao_declarados}."
            )
            continue
        revisoes_aceitas.setdefault(registro_id, set()).update(caminhos_revisados)
    return revisoes_aceitas


def _registros_aposentados(registros_lidos: list[tuple[str, dict]]) -> set[str]:
    aposentados: set[str] = set()
    for _rel, fm_ap in registros_lidos:
        sup = fm_ap.get("supersede")
        for item in sup if isinstance(sup, list) else [sup]:
            if item and str(item).lower() not in {"null", "none"}:
                aposentados.add(str(item).strip())
    return aposentados


def _ancoras_atingidas(
    registros_lidos: list[tuple[str, dict]], supersedidos_em_stage: set[str], tocados: set[str]
) -> Iterator[tuple[str, dict, str, list[str]]]:
    for rel, fm in registros_lidos:
        if fm.get("supersede") and str(fm.get("supersede")).lower() not in {"null", "none"}:
            continue
        doc_id = str(fm.get("id") or "")
        if doc_id in supersedidos_em_stage or rel in supersedidos_em_stage:
            continue
        declarados = fm.get("caminhos") or []
        if isinstance(declarados, str):
            declarados = [declarados]
        atingidos = sorted(set(declarados) & tocados)
        if atingidos and rel not in tocados:
            yield rel, fm, doc_id, atingidos


def _verificar_referencias(em_stage: list[str], erros: list[str]) -> None:
    for rel in em_stage:
        if not _e_prescritivo(rel):
            continue
        for morta in referencias_mortas(rel):
            erros.append(
                f"{rel} cita `{morta}`, que nao existe em nenhuma raiz plausivel. "
                "Corrija o caminho ou remova a referencia -- documento que instrui "
                "nao pode apontar para o vazio."
            )


def _verificar_ampliacoes(em_stage: list[str], erros: list[str]) -> None:
    for rel in em_stage:
        if not EXTENSOES_DE_CODIGO.search(rel):
            continue
        em_comentario = linhas_em_bloco_de_comentario(rel)
        _verificar_ampliacao_arquivo(rel, em_comentario, erros)


def _verificar_pendencias(registros_em_stage: list[str], erros: list[str]) -> None:
    for rel in registros_em_stage:
        texto = texto_como_vai_ao_commit(rel)
        if not texto or not texto.startswith("---"):
            continue
        fm, _ = ler_frontmatter_de_texto(texto)
        if not fm:
            continue
        bruto = fm.get("pendencias")
        if bruto is not None and not isinstance(bruto, list):
            erros.append(f"{rel}: `pendencias` tem de ser uma lista de itens, nao {type(bruto).__name__}.")
            continue
        _verificar_itens_pendencias(rel, bruto, erros)
        cru_resolvidas = fm.get("pendencias_resolvidas")
        if cru_resolvidas is not None and not isinstance(cru_resolvidas, (list, str)):
            erros.append(f"{rel}: `pendencias_resolvidas` tem de ser uma lista de ids.")


def _verificar_itens_frontmatter(fm: dict, rel: str, erros: list[str]) -> None:
    for campo in ("verificado", "nao_verificado"):
        itens = fm.get(campo) or []
        if isinstance(itens, list) and any(not isinstance(x, str) for x in itens):
            erros.append(
                f"'{campo}' tem item que nao e texto em {rel}. Item de lista com ': ' vira mapa: troque por ' -- '."
            )


def _verificar_frontmatter(rel: str, hoje: date, ambiente: dict, erros: list[str]) -> None:
    texto = texto_como_vai_ao_commit(rel)
    if texto is None:
        return
    if not texto.startswith("---"):
        return  # ausencia de frontmatter e AVISO do outro portao; nao duplicar

    # --- G1. o bloco tem de ser YAML de verdade ---------------------------
    bruto = texto.split("\n---", 2)[0][3:]
    try:
        fm = yaml.safe_load(bruto)
    except yaml.YAMLError as e:
        marca = getattr(e, "problem_mark", None)
        onde = f" (linha {marca.line + 1} do frontmatter)" if marca else ""
        erros.append(f"Frontmatter nao e YAML valido{onde}: {rel} -- {getattr(e, 'problem', e)}")
        return
    if not isinstance(fm, dict):
        erros.append(f"Frontmatter nao produz um mapa: {rel}")
        return

    _verificar_itens_frontmatter(fm, rel, erros)

    # --- G1c. chave duplicada no frontmatter ------------------------------
    # `yaml.safe_load` aceita chave repetida em SILENCIO: a ultima vence e a
    # primeira some sem erro. E a mesma colisao que ja fez uma auditoria
    # desta casa descartar o manual canonico de 40 KB e exibir os dados do
    # arquivo de 12 KB como se fossem dele. Achado real: duas sessoes
    # editando este repositorio acrescentaram `referencias_nao_resolviveis` ao
    # mesmo frontmatter, e nada acusou.
    chaves = [line.split(":", 1)[0] for line in bruto.splitlines() if re.match(r"^[A-Za-z_]\w*:", line)]
    repetidas = sorted({c for c in chaves if chaves.count(c) > 1})
    if repetidas:
        erros.append(
            f"Chave duplicada no frontmatter de {rel}: {repetidas}. "
            "O parser aceita em silencio e a ultima vence -- a primeira some sem erro."
        )

    # --- G3. TTL externo vencido -----------------------------------------
    motivo = ttl_vencido(fm, hoje)
    if motivo:
        erros.append(f"{rel}: {motivo}. Reconsulte a fonte ou rebaixe a classe explicitamente.")

    # --- G4. config_medida divergente do ambiente ------------------------
    divergencias, _ = conferir_config_medida(fm.get("config_medida"), ambiente)
    for d in divergencias:
        erros.append(f"{rel}: config_medida divergente -- {d}. Remeca ou marque o registro.")


def _coletar_revisao(
    rel: str, indice: int, revisao: object, revisoes_candidatas: list[tuple[str, str, set[str], str]], erros: list[str]
) -> None:
    if not isinstance(revisao, dict):
        erros.append(f"{rel}: revisoes_de_ancora[{indice}] deve ser um mapa.")
        return
    registro = revisao.get("registro")
    caminhos = revisao.get("caminhos")
    parecer = revisao.get("parecer")
    if not isinstance(registro, str) or not registro.strip():
        erros.append(f"{rel}: revisoes_de_ancora[{indice}].registro deve ser um id nao vazio.")
        return
    if (
        not isinstance(caminhos, list)
        or not caminhos
        or any(not isinstance(caminho, str) or not caminho.strip() for caminho in caminhos)
    ):
        erros.append(f"{rel}: revisoes_de_ancora[{indice}].caminhos deve ser uma lista nao vazia de caminhos.")
        return
    if not isinstance(parecer, str) or not parecer.strip():
        erros.append(f"{rel}: revisoes_de_ancora[{indice}].parecer deve explicar a revisao.")
        return
    revisoes_candidatas.append((rel, registro.strip(), set(caminhos), parecer.strip()))


def _coletar_revisoes(
    rel: str, revisoes: list, revisoes_candidatas: list[tuple[str, str, set[str], str]], erros: list[str]
) -> None:
    for indice, revisao in enumerate(revisoes, start=1):
        _coletar_revisao(rel, indice, revisao, revisoes_candidatas, erros)


def _revisoes_do_registro(
    rel: str,
    texto: str,
    supersedidos_em_stage: set[str],
    revisoes_candidatas: list[tuple[str, str, set[str], str]],
    erros: list[str],
) -> None:
    fm_stg, _ = ler_frontmatter_de_texto(texto)
    if fm_stg and fm_stg.get("supersede"):
        sup = fm_stg.get("supersede")
        if isinstance(sup, list):
            supersedidos_em_stage.update(str(s) for s in sup)
        elif isinstance(sup, str) and sup.lower() not in {"null", "none"}:
            supersedidos_em_stage.add(sup)
    if not fm_stg or not fm_stg.get("revisoes_de_ancora"):
        return
    revisoes = fm_stg["revisoes_de_ancora"]
    if not isinstance(revisoes, list):
        erros.append(f"{rel}: revisoes_de_ancora deve ser uma lista de mapas.")
        return
    _coletar_revisoes(rel, revisoes, revisoes_candidatas, erros)


def _ancoras_pendentes(
    rel: str,
    doc_id: str,
    atingidos: list[str],
    revisoes_aceitas: dict[str, set[str]],
    so_cresceram: set[str],
    avisos: list[str],
) -> list[str]:
    pendentes = sorted(set(atingidos) - revisoes_aceitas.get(doc_id, set()))
    if not pendentes:
        return pendentes
    crescidos = [p for p in pendentes if p in so_cresceram]
    if crescidos:
        avisos.append(f"{rel} ancora {crescidos}: so ganharam linhas no fim. Nao bloqueia: o atestado segue intacto.")
        pendentes = [p for p in pendentes if p not in so_cresceram]
    return pendentes


def _verificar_estado_ancora(
    rel: str,
    fm: dict,
    pendentes: list[str],
    aposentado: bool,
    hoje: date,
    ambiente: dict,
    avisos: list[str],
) -> str | None:
    motivos, ancestral, _ = avaliar_registro(fm, RAIZ, hoje, ambiente)
    estado = estado_de(motivos, ancestral, aposentado)
    if estado != VIGENTE:
        motivo = motivos[0] if motivos else "superseded por registro mais novo"
        avisos.append(f"{rel} ({estado}, {motivo}) ancora {pendentes}. Nao bloqueia: registro nao vigente.")
        return None
    return (
        f"{rel} declara ancora em {pendentes} e esses caminhos mudaram neste commit, "
        "mas o registro nao foi revisado. Atualize-o, declare `supersede` ou registre "
        "revisoes_de_ancora valida no mesmo commit."
    )


def _verificar_ampliacao_arquivo(rel: str, em_comentario: set[int], erros: list[str]) -> None:
    for numero, linha in linhas_adicionadas_numeradas(rel):
        if re.match(r"^\s*(#|//)", linha):
            continue  # linha que e so comentario nao amplia nada
        if numero in em_comentario:
            continue  # e prosa dentro de <# #> ou docstring, nao diretiva
        for nome, padrao in PADROES_DE_AMPLIACAO.items():
            if padrao.search(linha):
                erros.append(
                    f"Ampliacao de origem detectada em {rel} ({nome}): {linha.strip()[:90]}. "
                    "A governanca proibe ampliar ACL/CORS/firewall -- nao ha excecao por registro."
                )


def _verificar_item_pendencia(rel: str, indice: int, item: object, erros: list[str]) -> None:
    onde = f"{rel}: pendencias[{indice}]"
    if not isinstance(item, dict):
        erros.append(f"{onde} tem de ser um mapa com id, o_que e dono.")
        return
    pid = str(item.get("id") or "").strip()
    if not RE_ID_PENDENCIA.match(pid):
        erros.append(f"{onde}.id invalido: '{pid}'. Use minusculas, digitos e hifen, de 5 a 80 caracteres.")
    for campo in ("o_que", "dono"):
        if not str(item.get(campo) or "").strip():
            erros.append(f"{onde}.{campo} e obrigatorio: pendencia sem {campo} e observacao, nao tarefa.")
    prazo = str(item.get("prazo") or "").strip()
    if prazo:
        try:
            date.fromisoformat(prazo)
        except ValueError:
            erros.append(f"{onde}.prazo tem de ser uma data ISO YYYY-MM-DD, e veio '{prazo}'.")


def _verificar_itens_pendencias(rel: str, bruto: list | None, erros: list[str]) -> None:
    for indice, item in enumerate(bruto or []):
        _verificar_item_pendencia(rel, indice, item, erros)


def verificar(hoje: date | None = None) -> tuple[list[str], list[str]]:
    """Devolve (erros, avisos)."""
    hoje = hoje or date.today()
    erros: list[str] = []
    avisos: list[str] = []
    em_stage = arquivos_em_stage()
    ambiente = resolvedores_de_ambiente(RAIZ)

    registros_em_stage = [r for r in em_stage if _e_registro(r)]

    _verificar_frontmatters(registros_em_stage, hoje, ambiente, erros)

    # --- G2. ancora interna: caminho DECLARADO que o commit toca --------------
    # Ancora e o campo `caminhos:`, nunca a prosa. Inferir da prosa travaria o
    # repositorio: os handoffs citam nexus.py, e todo commit em nexus.py
    # exigiria superseder o handoff.
    #
    # Uma auditoria central pode declarar `revisoes_de_ancora` para reconciliar
    # diversos registros historicos sem reescreve-los. Nao e uma dispensa: cada
    # item precisa apontar o id existente, cobrir somente caminhos que aquele
    # registro declarou e explicar o parecer. A cobertura continua limitada aos
    # caminhos efetivamente tocados neste commit.
    #
    # Num merge, "tocado neste commit" exclui o que veio pronto de um dos pais:
    # ver `caminhos_herdados_de_merge`. Fora de um merge o conjunto e vazio e
    # esta linha nao muda nada.
    tocados = set(em_stage) - caminhos_herdados_de_merge()
    supersedidos_em_stage, revisoes_candidatas = _revisoes_em_stage(registros_em_stage, erros)

    registros_por_id, registros_lidos = _ler_registros_ancorados()

    revisoes_aceitas = _aceitar_revisoes(revisoes_candidatas, registros_por_id, erros)

    # G2 so BLOQUEIA registro VIGENTE (Tier 0, 2026-09-13). SUSPEITO e OBSOLETO ja
    # nao sao fonte confiavel pelo proprio indice: viram AVISO. Medido antes: 34
    # revisoes obrigatorias num dia, 1 delas sobre registro VIGENTE.
    aposentados = _registros_aposentados(registros_lidos)

    ancorados: set[str] = set()
    for _rel, fm_anc in registros_lidos:
        dec = fm_anc.get("caminhos") or []
        ancorados.update(str(c) for c in ([dec] if isinstance(dec, str) else dec))
    so_cresceram = jsonl_que_so_cresceram(sorted(ancorados & tocados))

    for rel, fm, doc_id, atingidos in _ancoras_atingidas(registros_lidos, supersedidos_em_stage, tocados):
        pendentes = _ancoras_pendentes(rel, doc_id, atingidos, revisoes_aceitas, so_cresceram, avisos)
        if not pendentes:
            continue
        erro = _verificar_estado_ancora(rel, fm, pendentes, doc_id in aposentados, hoje, ambiente, avisos)
        if erro:
            erros.append(erro)

    # --- G6. referencia morta em documento que PRESCREVE ----------------------
    # Tres precedentes nesta base, nenhum detectado por nada: a secao 1 do
    # CLAUDE.md canonico declarava um AGENTS.md inexistente; o README do
    # hybrid_router apontava para a copia da raiz e para o .venv errado; o fork
    # do AGENTS.md dizia que os agentes moram em .Codex/agents.
    _verificar_referencias(em_stage, erros)

    # --- G6b. o commit apaga ou move o que um documento prescritivo cita ------
    erros.extend(citacoes_ao_que_o_commit_remove(em_stage))

    # --- G5b. ampliacao de ACL/CORS/origem ------------------------------------
    _verificar_ampliacoes(em_stage, erros)

    # --- G8. pendencia declarada tem de ser LEGIVEL --------------------------
    # Existir pendencia aberta nunca bloqueia -- ver coletar_pendencias. O que
    # bloqueia e declaracao que o portao nao consegue exibir, porque pendencia
    # invisivel e exatamente o defeito que o campo existe para corrigir.
    _verificar_pendencias(registros_em_stage, erros)

    _, orfas = coletar_pendencias(hoje)
    if orfas:
        erros.append(
            "pendencias_resolvidas aponta id que nunca foi declarado: "
            + ", ".join(orfas)
            + ". Encerrar o que nao existe esconde o que existe."
        )

    return erros, avisos


def main() -> int:
    if not arquivos_em_stage():
        # MEDIDO EM 2026-09-12, logo depois de a SS9.2 entrar em vigor. A lista de
        # pendencias morava DEPOIS deste retorno, entao o comando que o proprio
        # CLAUDE.md manda rodar ao comecar o trabalho -- quando, por definicao, nada
        # esta em stage -- devolvia "Nada em stage" e escondia as tarefas abertas.
        # Era a invisibilidade da SS9.2 reencenada no instrumento que a corrige.
        print("[REGISTRO] Nada em stage. Nada a verificar.")
        _imprimir_pendencias()
        return 0

    erros, avisos = verificar()

    print()
    print("=" * 70)
    print("[PORTAO DE REGISTRO] M.O. 13.F -- documento inteiro, e referencia viva (2-B frente 5)")
    print("=" * 70)

    for a in avisos:
        print(f"   AVISO: {a}")

    if erros:
        print(f"\nERROS ({len(erros)}) - commit BLOQUEADO:")
        for e in erros:
            print(f"   {e}")
        print("\nNao contorne. A governanca proibe bypass: investigue o achado.\n")
        return 1

    print(f"\nAPROVADO. Registros e origens integros em {len(arquivos_em_stage())} arquivo(s) em stage.")
    _imprimir_pendencias()
    return 0


def _imprimir_pendencias() -> None:
    """Exibe as tarefas abertas e o que parou de rodar. Nao decide nada -- so impede que sumam.

    A saude da malha entra AQUI, e nao num canal proprio, por medicao de 2026-09-17: a auditoria de calibracao
    ficou tres dias parada e o portao de suficiencia cinco dias aberto sem ninguem saber, porque o unico lugar
    que reportaria isso era a plataforma do veiculo que havia caido. Este e o canal que todo condutor ja roda ao
    comecar -- a SS9.2 diz que a tarefa aberta mora onde um portao ja olha, e o mesmo vale para o instrumento
    parado. Criar um segundo lugar nasceria com o defeito que ele corrigiria.
    """
    _imprimir_saude()
    _listar_pendencias()


def _imprimir_saude() -> None:
    """Sinais de instrumento parado. Falha do proprio sinal nunca cala o portao de registro."""
    try:
        imprimir_saude_da_malha()
    except Exception as erro:  # noqa: BLE001 -- ver docstring
        # Deliberadamente amplo: este bloco e um ACESSORIO do portao de registro. Se a leitura da saude
        # quebrar por qualquer motivo, o portao segue imprimindo pendencias e validando registros. Engolir a
        # excecao em silencio, porem, seria o mesmo defeito que o modulo combate -- por isso ela aparece.
        print(f"\n[SAUDE DA MALHA] NAO VERIFICADA -- a leitura falhou: {erro}")
        print("   Nao verificado nunca e aprovado. Rode `python scripts/ops/saude_da_malha.py` para o erro completo.\n")


def _listar_pendencias() -> None:
    abertas, _ = coletar_pendencias()
    if not abertas:
        print("\n[PENDENCIAS] Nenhuma tarefa aberta declarada no corpus.\n")
        return
    vencidas = sum(1 for i in abertas if i["vencida"])
    print(f"\n[PENDENCIAS] {len(abertas)} aberta(s), {vencidas} vencida(s). Nao bloqueiam o commit.")
    for i in abertas:
        marca = "VENCIDA" if i["vencida"] else "aberta "
        prazo = str(i.get("prazo") or "sem prazo")
        print(f"   {marca} | {prazo} | {i['dono']} | {i['id']}")
        print(f"             {i['o_que']}")
        print(f"             declarada em {i['origem']}")
    print("   Encerrar: declare o id em `pendencias_resolvidas:` num registro NOVO.\n")


if __name__ == "__main__":
    sys.exit(main())
