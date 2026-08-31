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
    conferir_config_medida,
    ler_frontmatter_de_texto,
    resolvedores_de_ambiente,
    ttl_vencido,
)

CAMPOS_OBRIGATORIOS = ("id", "tipo", "escopo", "autor", "criado_em", "verificado", "nao_verificado")

# Caminho citado em crase, link markdown ou parenteses.
RE_CAMINHO_CITADO = re.compile(
    r"[`\(\[]([A-Za-z0-9_][A-Za-z0-9_./\\-]*\.(?:py|ps1|psm1|json|md|ts|tsx|js|jsx|toml|yml|yaml|cmd|sh))"
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


def arquivos_em_stage() -> list[str]:
    saida = _git("diff", "--cached", "--name-only", "--diff-filter=ACM")
    return [linha for linha in saida.splitlines() if linha.strip()]


def linhas_adicionadas(arquivo: str) -> list[str]:
    saida = _git("diff", "--cached", "--unified=0", "--diff-filter=ACM", "--", arquivo)
    return [line[1:] for line in saida.splitlines() if line.startswith("+") and not line.startswith("+++")]


_RE_HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)")


def linhas_adicionadas_numeradas(arquivo: str) -> list[tuple[int, str]]:
    """(numero da linha no arquivo novo, texto). O numero vem do cabecalho de hunk.

    Sem ele nao da para saber se a linha esta dentro de um bloco de comentario:
    o diff entrega linhas soltas, e estado de bloco nao se deduz de linha solta.
    """
    saida = _git("diff", "--cached", "--unified=0", "--diff-filter=ACM", "--", arquivo)
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
    dentro: set[int] = set()
    em_bloco = False
    delim_py: str | None = None
    for n, linha in enumerate(texto.splitlines(), start=1):
        if rel.endswith((".ps1", ".psm1")):
            if em_bloco:
                dentro.add(n)
                if "#>" in linha:
                    em_bloco = False
            elif "<#" in linha:
                em_bloco = True
                dentro.add(n)
                if "#>" in linha.split("<#", 1)[1]:
                    em_bloco = False
        elif rel.endswith(".py"):
            if delim_py:
                dentro.add(n)
                if delim_py in linha:
                    delim_py = None
            else:
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
    prefixos_de_submodulo_vazio = tuple(prefixos)
    escopos = raizes_de_escopo()

    mortas = []
    for linha in texto.splitlines():
        if "$$" in linha:
            continue
        for m in RE_CAMINHO_CITADO.finditer(linha):
            citado = m.group(1)
            if "/" not in citado and "\\" not in citado:
                continue  # nome solto e nome, nao endereco
            if citado in historicas:
                continue
            limpo = citado.replace("\\_", "_").replace("\\", "/")
            if prefixos_de_submodulo_vazio and limpo.startswith(prefixos_de_submodulo_vazio):
                continue
            variantes = [limpo]
            if limpo.endswith(".ts"):
                variantes.append(limpo + "x")
            elif limpo.endswith(".js"):
                variantes.append(limpo[:-3] + ".jsx")
            achou = any((raiz / var).exists() for var in variantes for raiz in (RAIZ, caminho.parent, RAIZ.parent))
            if achou:
                continue
            # Nao resolveu. Antes de chamar de MORTA, separar o que este
            # repositorio simplesmente nao tem como verificar.
            primeiro = limpo.split("/", 1)[0]
            if primeiro in escopos:
                continue  # endereco de projeto irmao ou espelho
            if _e_derivado(limpo):
                continue  # artefato gerado, ausente por desenho
            mortas.append(citado)
    return mortas


def verificar(hoje: date | None = None) -> tuple[list[str], list[str]]:
    """Devolve (erros, avisos)."""
    hoje = hoje or date.today()
    erros: list[str] = []
    avisos: list[str] = []
    em_stage = arquivos_em_stage()
    ambiente = resolvedores_de_ambiente(RAIZ)

    registros_em_stage = [r for r in em_stage if _e_registro(r)]

    for rel in registros_em_stage:
        texto = texto_como_vai_ao_commit(rel)
        if texto is None:
            continue
        if not texto.startswith("---"):
            continue  # ausencia de frontmatter e AVISO do outro portao; nao duplicar

        # --- G1. o bloco tem de ser YAML de verdade ---------------------------
        bruto = texto.split("\n---", 2)[0][3:]
        try:
            fm = yaml.safe_load(bruto)
        except yaml.YAMLError as e:
            marca = getattr(e, "problem_mark", None)
            onde = f" (linha {marca.line + 1} do frontmatter)" if marca else ""
            erros.append(f"Frontmatter nao e YAML valido{onde}: {rel} -- {getattr(e, 'problem', e)}")
            continue
        if not isinstance(fm, dict):
            erros.append(f"Frontmatter nao produz um mapa: {rel}")
            continue

        for campo in ("verificado", "nao_verificado"):
            itens = fm.get(campo) or []
            if isinstance(itens, list) and any(not isinstance(x, str) for x in itens):
                erros.append(
                    f"'{campo}' tem item que nao e texto em {rel}. Item de lista com ': ' vira mapa: troque por ' -- '."
                )

        # --- G1c. chave duplicada no frontmatter ------------------------------
        # `yaml.safe_load` aceita chave repetida em SILENCIO: a ultima vence e a
        # primeira some sem erro. E a mesma colisao que ja fez uma auditoria
        # desta casa descartar o manual canonico de 40 KB e exibir os dados do
        # arquivo de 12 KB como se fossem dele. Achado real: duas sessoes
        # editando este repositorio acrescentaram `referencias_nao_resolviveis` ao
        # mesmo frontmatter, e nada acusou.
        chaves = [line.split(":", 1)[0] for line in bruto.splitlines() if re.match(r"^[A-Za-z_][A-Za-z0-9_]*:", line)]
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

    # --- G2. ancora interna: caminho DECLARADO que o commit toca --------------
    # Ancora e o campo `caminhos:`, nunca a prosa. Inferir da prosa travaria o
    # repositorio: os handoffs citam nexus.py, e todo commit em nexus.py
    # exigiria superseder o handoff.
    tocados = set(em_stage)
    supersedidos_em_stage: set[str] = set()
    for rel in registros_em_stage:
        texto = texto_como_vai_ao_commit(rel)
        if texto:
            fm_stg, _ = ler_frontmatter_de_texto(texto)
            if fm_stg and fm_stg.get("supersede"):
                sup = fm_stg.get("supersede")
                if isinstance(sup, list):
                    supersedidos_em_stage.update(str(s) for s in sup)
                elif isinstance(sup, str) and sup.lower() not in {"null", "none"}:
                    supersedidos_em_stage.add(sup)

    for rel in _git("ls-files", "docs/*.md", "reports/*.md").splitlines():
        if not rel.strip():
            continue
        texto = texto_como_vai_ao_commit(rel)
        if not texto:
            continue
        fm, _ = ler_frontmatter_de_texto(texto)
        if not fm:
            continue
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
            erros.append(
                f"{rel} declara ancora em {atingidos} e esses caminhos mudaram neste commit, "
                "mas o registro nao foi revisado. Atualize-o ou declare `supersede` no mesmo commit."
            )

    # --- G6. referencia morta em documento que PRESCREVE ----------------------
    # Tres precedentes nesta base, nenhum detectado por nada: a secao 1 do
    # CLAUDE.md canonico declarava um AGENTS.md inexistente; o README do
    # hybrid_router apontava para a copia da raiz e para o .venv errado; o fork
    # do AGENTS.md dizia que os agentes moram em .Codex/agents.
    for rel in em_stage:
        if not _e_prescritivo(rel):
            continue
        for morta in referencias_mortas(rel):
            erros.append(
                f"{rel} cita `{morta}`, que nao existe em nenhuma raiz plausivel. "
                "Corrija o caminho ou remova a referencia -- documento que instrui "
                "nao pode apontar para o vazio."
            )

    # --- G5b. ampliacao de ACL/CORS/origem ------------------------------------
    for rel in em_stage:
        if not EXTENSOES_DE_CODIGO.search(rel):
            continue
        em_comentario = linhas_em_bloco_de_comentario(rel)
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

    return erros, avisos


def main() -> int:
    if not arquivos_em_stage():
        print("[REGISTRO] Nada em stage. Nada a verificar.")
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

    print(f"\nAPROVADO. Registros e origens integros em {len(arquivos_em_stage())} arquivo(s) em stage.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
