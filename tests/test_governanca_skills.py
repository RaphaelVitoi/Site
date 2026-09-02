"""Guarda de resolucao da camada de skills -- achado A1 da auditoria de 2026-08-30.

O que a auditoria mediu, antes desta guarda existir:

    31 skills distintas declaradas nos 19 agentes
     0 resolviam em qualquer raiz de skill do repositorio
    21 nao resolviam em lugar nenhum
     3 skills existiam em .agents/skills sem nenhum agente declara-las

(Os 8 diretorios sob `skills/` nao entram nessa conta: sao submodulos git de
extensoes do Gemini CLI e servidores MCP, outra classe de artefato.)

E os dois conjuntos eram **disjuntos**. A prova de que era drift, e nao desenho,
estava nos quase-acertos: declarava-se `pmev-game-theory-poker` e existia
`pmev-game-theory-engine`. Renomeado de um lado, nao do outro.

Passou despercebido porque `skills` nao tem consumidor de runtime. Os unicos
leitores eram o gerador de documentos, que renderiza a lista nos 19 `.md` como
afirmacao de capacidade, e um teste que verificava que o campo *e uma lista* --
nunca que os nomes existem. Dezenove documentos de identidade publicavam 31
afirmacoes que nada validava e nada carregava.

A assimetria com `specialized_scripts` e o argumento inteiro: aquele campo
aponta para caminhos reais e por isso quebra visivelmente quando erra. Este
apontava para nomes, e nome errado nao quebra nada -- so mente.

## O modelo de resolucao

Um nome declarado resolve de duas maneiras, e so duas:

1. **Skill local** -- diretorio VERSIONADO com `SKILL.md` sob uma das
   `raizes_locais` de `data/skills_registry.json`. E DESCOBERTA por varredura,
   nunca listada no registro: repetir em JSON o que ja esta em disco criaria a
   segunda copia que a §7 do CLAUDE.md proibe, e ela divergiria como o
   `AGENTS.md` divergiu. Diretorio coberto pelo `.gitignore` nao conta: ele e
   instalacao de plugin numa maquina, nao conteudo deste repositorio, e tratar
   presenca em disco como resolucao faz a guarda medir o perfil do operador em
   vez do que qualquer clone tem (mesmo criterio de `_e_derivado` em
   `scripts/ops/record_gate.py`).
2. **Skill externa** -- entrada em `externas` do registro. E declaracao do
   operador sobre algo que vive fora do repositorio (plugin, escopo de usuario,
   marketplace), com `status` dizendo ate onde a evidencia vai.

Nome em nenhum dos dois reprova. E o buraco que fechou: skill nova entra com
resolucao declarada ou nao entra.

## O que esta guarda deliberadamente NAO faz

Nao afirma que uma skill `nao-verificada` existe na maquina do operador. Nao da
para verificar isso a partir do repositorio, e ausencia de observacao nao e
prova de ausencia (§8.2) -- por isso nenhuma declaracao foi removida do
manifesto quando o registro foi criado. O que a guarda garante e que toda
afirmacao de capacidade tenha um lugar unico onde seu status esta escrito, em
vez de estar implicita em 19 documentos gerados.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "data" / "agents_manifest.json"
REGISTRO = RAIZ / "data" / "skills_registry.json"
PONTE_ANTIGRAVITY = RAIZ / ".agents" / "skills.json"

PISTA = (
    "Declare a skill em data/skills_registry.json -> externas (se ela vive fora "
    "do repositorio) ou crie o diretorio com SKILL.md sob uma raiz local. "
    "Editar os .md de .claude/agents/ nao resolve: eles sao gerados."
)


def _manifesto() -> dict:
    return json.loads(MANIFESTO.read_text(encoding="utf-8"))


def _registro() -> dict:
    return json.loads(REGISTRO.read_text(encoding="utf-8"))


def test_ponte_antigravity_descobre_a_fonte_versionada_sem_copia():
    """A configuracao de descoberta deve apontar para a unica raiz local.

    A ponte torna a suite versionada descobrivel pelo Antigravity sem copiar
    manifests para uma segunda arvore global, que inevitavelmente divergiria.
    """
    assert PONTE_ANTIGRAVITY.is_file(), (
        ".agents/skills.json ausente; o Antigravity nao tem ponte versionada para a suite local"
    )
    ponte = json.loads(PONTE_ANTIGRAVITY.read_text(encoding="utf-8"))
    assert ponte == {
        "entries": [
            {
                "path": ".agents/skills",
                "include_only": ["^(pmev-game-theory-engine|sota-quality-gate|sota-triad-mesh)$"],
            }
        ]
    }, (
        ".agents/skills.json deve conter somente a ponte relativa e o allowlist da suite canonica; "
        "nao adicione copias, caminhos absolutos ou skills de plugins vendorizados"
    )


def _externas() -> set[str]:
    # As chaves iniciadas por '_' sao prosa de governanca dentro do proprio JSON,
    # nao nomes de skill.
    return {k for k in _registro()["externas"] if not k.startswith("_")}


def _versionado(caminho: Path) -> bool:
    """O arquivo esta rastreado por este repositorio, e nao so presente no disco.

    Sem esta distincao a suite passava na maquina onde o plugin da Supabase
    instalou `.agents/skills/supabase/` -- diretorio que o proprio
    `.agents/skills/.gitignore` exclui -- e reprovava em CI e em qualquer clone
    novo, que e onde a afirmacao de capacidade precisa valer.
    """
    r = subprocess.run(
        ["git", "ls-files", "--error-unmatch", str(caminho.relative_to(RAIZ)).replace("\\", "/")],
        cwd=RAIZ,
        capture_output=True,
        check=False,
    )
    return r.returncode == 0


def _skills_locais() -> dict[str, Path]:
    achadas: dict[str, Path] = {}
    for raiz_rel in _registro()["raizes_locais"]:
        raiz = RAIZ / raiz_rel
        if not raiz.is_dir():
            continue
        for d in sorted(raiz.iterdir()):
            skill = d / "SKILL.md"
            if d.is_dir() and skill.is_file() and _versionado(skill):
                achadas[d.name] = skill
    return achadas


def _declaradas() -> dict[str, list[str]]:
    """skill -> agentes que a declaram."""
    inv: dict[str, list[str]] = {}
    for agente, dados in _manifesto().items():
        for s in dados.get("skills", []):
            inv.setdefault(s, []).append(agente)
    return inv


def test_toda_skill_declarada_resolve():
    """O achado central: nome declarado que nao resolve em lugar nenhum."""
    resolviveis = set(_skills_locais()) | _externas()
    orfas = {s: ag for s, ag in _declaradas().items() if s not in resolviveis}

    assert not orfas, (
        "skills declaradas que nao resolvem nem como local nem como externa: "
        + "; ".join(f"'{s}' (declarada por @{', @'.join(ag)})" for s, ag in sorted(orfas.items()))
        + f". {PISTA}"
    )


def test_toda_skill_local_e_declarada_por_alguem():
    """A direcao inversa. Skill em disco que ninguem declara e capacidade que o
    projeto pagou para ter e nenhum agente alcanca -- foi o caso de
    `sota-triad-mesh` ate 2026-08-30."""
    declaradas = set(_declaradas())
    ociosas = sorted(set(_skills_locais()) - declaradas)

    assert not ociosas, (
        f"skills existem no repositorio e nenhum agente as declara: {ociosas}. "
        "Declare-as em data/agents_manifest.json ou remova o diretorio."
    )


def test_registro_de_externas_nao_acumula_entrada_morta():
    """Entrada de externa que nenhum agente usa e o registro virando deposito.
    Sem isto, o registro envelheceria exatamente como o campo que ele guarda."""
    declaradas = set(_declaradas())
    mortas = sorted(_externas() - declaradas)

    assert not mortas, (
        f"entradas em skills_registry.json -> externas que nenhum agente declara: {mortas}. "
        "Remova-as do registro ou declare-as em algum agente."
    )


def test_skill_local_e_externa_nao_disputam_o_mesmo_nome():
    """Duas fontes para o mesmo nome e ambiguidade de resolucao -- o problema
    que a §3 do CLAUDE.md trata como fonte unica por decisao."""
    colisao = sorted(set(_skills_locais()) & _externas())

    assert not colisao, (
        f"nomes que resolvem como local E como externa ao mesmo tempo: {colisao}. "
        "Uma skill tem uma origem so; remova a entrada do registro."
    )


@pytest.mark.parametrize("status", ["verificada", "nao-verificada"])
def test_status_de_externa_e_de_um_vocabulario_fechado(status: str):
    """`status` carrega o limite da evidencia. Vocabulario aberto deixaria a
    distincao entre observado e declarado virar prosa livre, que e como ela some."""
    registro = _registro()["externas"]
    validos = {"verificada", "nao-verificada"}
    invalidos = {
        nome: dados.get("status")
        for nome, dados in registro.items()
        if not nome.startswith("_") and dados.get("status") not in validos
    }
    assert not invalidos, f"status fora do vocabulario {sorted(validos)}: {invalidos}"
    assert any(d.get("status") == status for n, d in registro.items() if not n.startswith("_")), (
        f"nenhuma externa com status '{status}' -- o parametro deixou de medir algo real"
    )


def test_toda_externa_declara_origem():
    """Sem origem, 'externa' vira sinonimo de 'nao encontrei', que e o estado
    que este registro existe para acabar."""
    sem_origem = sorted(
        nome for nome, dados in _registro()["externas"].items() if not nome.startswith("_") and not dados.get("origem")
    )
    assert not sem_origem, f"externas sem campo 'origem': {sem_origem}"


def _frontmatter(texto: str) -> list[str] | None:
    """Linhas do bloco YAML entre o primeiro `---` e o `---` seguinte.

    `None` quando o bloco nao existe ou nao fecha. A distincao importa: o
    chamador precisa poder reprovar frontmatter ausente em vez de trata-lo como
    bloco vazio, que passaria silenciosamente.
    """
    linhas = texto.splitlines()
    if not linhas or linhas[0].strip() != "---":
        return None
    for i, ln in enumerate(linhas[1:], start=1):
        if ln.strip() == "---":
            return linhas[1:i]
    return None


def test_skill_local_declara_o_proprio_nome_no_frontmatter():
    """Diretorio e frontmatter divergentes tornam a resolucao por diretorio uma
    coincidencia. `sota-triad-mesh` usa `id:` alem de `name:`; o que precisa
    bater e o `name:`.

    A busca e restrita ao bloco YAML de proposito. A primeira versao desta
    guarda varria o arquivo inteiro, e um `name:` no CORPO do Markdown a
    satisfazia mesmo com frontmatter ausente ou declarando outro nome --
    apontado pelo CodeRabbit na revisao do PR #24 e confirmado no codigo. Uma
    guarda que pode ser satisfeita por coincidencia e o defeito que esta
    auditoria mede, entao ela nao podia ficar assim.
    """
    divergentes = []
    for nome, caminho in _skills_locais().items():
        bloco = _frontmatter(caminho.read_text(encoding="utf-8", errors="ignore"))
        if bloco is None:
            divergentes.append(f"{nome}: SKILL.md sem bloco de frontmatter delimitado por '---'")
            continue

        linha = next((ln for ln in bloco if ln.startswith("name:")), None)
        if linha is None:
            divergentes.append(f"{nome}: frontmatter sem 'name:'")
        elif linha.split(":", 1)[1].strip() != nome:
            divergentes.append(f"{nome}: frontmatter diz '{linha.split(':', 1)[1].strip()}'")

    assert not divergentes, f"nome de diretorio e frontmatter divergem: {divergentes}"


def test_os_documentos_gerados_publicam_exatamente_as_skills_do_manifesto():
    """O elo que faltava: o manifesto e a fonte, mas quem o LEITOR humano ve sao
    os 19 documentos gerados. Se eles envelhecerem, a afirmacao de capacidade
    volta a ser nao verificavel mesmo com o manifesto correto."""
    fora = []
    for agente, dados in _manifesto().items():
        doc = RAIZ / ".claude" / "agents" / f"{agente}.md"
        assert doc.is_file(), f"documento ausente para @{agente}"
        texto = doc.read_text(encoding="utf-8")

        esperado = "\n".join(f"- `{s}`" for s in dados.get("skills", [])) or "- N/A"
        bloco = texto.split("## Skills Especializadas\n", 1)[-1].split("\n\n", 1)[0]
        if bloco != esperado:
            fora.append(agente)

    assert not fora, (
        f"documentos com bloco de skills fora de sincronia com o manifesto: {fora}. "
        "Rode scripts/routines/sync_agents_reality.ps1 -- os .md sao gerados, nao editados."
    )
