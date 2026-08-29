"""O id de um fragmento vem do CAMINHO, e o caminho e unico por construcao.

## O defeito, medido em 2026-08-28

`memory_rag._process_single_file` montava o id assim:

    source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
    ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]

`source_name` **nao e unico no corpus**. Dos 503 arquivos que o manifesto alcanca,
sobravam **426 nomes distintos** -- 36 nomes em colisao, **77 arquivos afetados**.
`SPEC` aparecia 4 vezes, `PRD` 4, `dispatcher` 4, e cada um dos 19 agentes duas ou
tres, porque `.claude/AGENTS/chico.md` e `.claude/agent-memory/chico/MEMORY.md`
produzem o mesmo `chico`.

E a escrita e `upsert`. Quem chega depois sobrescreve os chunks `0..N` do anterior
e **deixa orfaos os de indice maior**, que continuam apontando para outro arquivo.
O indice nao perdia documentos: montava documentos Frankenstein. Medido no indice
real, o espaco de id `dispatcher_chunk_*` reunia 34 chunks de um `MEMORY.md`, 24 de
outro e 1 de `agents/dispatcher.py`.

Sobrescrita silenciosa nunca alcanca ramo de erro -- e a mesma colisao de chave que
ja havia acontecido na auditoria mensal, indexando manuais por basename. O detector
que a revelou nas duas vezes foi o mesmo: **derivar a contagem** (503 alvos - 449
fontes) em vez de confiar no verde.

O `agent` continua sendo o nome amigavel, que e o que a filtragem usa. So o **id**
passou a vir do caminho relativo a raiz -- unico por construcao e estavel se o
repositorio mudar de lugar.
"""

from __future__ import annotations

import ast
import collections
import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "rag_ingestion_manifest.json"


def _alvos_do_manifesto() -> set[Path]:
    """Reproduz a descoberta do manifesto, lendo os filtros do proprio modulo.

    Sem copia da lista de exclusao: `memory_rag` e a fonte, e duplica-la aqui
    seria a segunda fonte que diverge.
    """
    import memory_rag  # noqa: PLC0415

    # `ast.literal_eval` e nao `exec`: o portao de ancora reprovou um
    # `# noqa: S102` aqui, e tinha razao. Registrar a supressao seria manter o
    # risco com um carimbo; `literal_eval` avalia SO literais e o achado deixa
    # de existir. A lista continua vindo do modulo vivo, nunca de uma copia --
    # duplicar regra de filtragem e a segunda fonte que diverge.
    fonte = Path(memory_rag.__file__).read_text(encoding="utf-8")
    ini = fonte.index("ignore_dirs = {") + len("ignore_dirs = ")
    fim = fonte.index("}", ini) + 1
    ignore_dirs = ast.literal_eval(fonte[ini:fim])
    assert isinstance(ignore_dirs, set) and ignore_dirs, "ignore_dirs deixou de ser um set literal"
    subarvores = [Path("reports") / "cwv", Path("reports") / "coverage", Path(".claude") / ".ARQUIVE"]

    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    alvos: set[Path] = set()
    for origem in manifesto.get("sources", []):
        base = (RAIZ / origem.get("path", ".")).resolve()
        if not base.exists() or not base.is_relative_to(RAIZ):
            continue
        recursivo = origem.get("recursive", True)
        for padrao in origem.get("patterns", []):
            for f in (base.rglob(padrao) if recursivo else base.glob(padrao)):
                if set(f.parts) & ignore_dirs:
                    continue
                rel = f.resolve().relative_to(RAIZ)
                if any(rel.is_relative_to(s) for s in subarvores):
                    continue
                if f.is_file():
                    alvos.add(f.resolve())
    return alvos


def _chave_de(caminho: Path) -> str:
    """A chave que o modulo usa hoje, extraida dele, nao reimplementada."""
    import memory_rag  # noqa: PLC0415

    try:
        return caminho.resolve().relative_to(memory_rag.RAIZ_DO_PROJETO).as_posix()
    except ValueError:
        return caminho.resolve().as_posix()


# ---------------------------------------------------------------------------
#  A invariante
# ---------------------------------------------------------------------------


def test_a_chave_de_id_e_unica_em_todo_o_corpus():
    """A regressao que este arquivo existe para impedir. Se voltar a colidir,
    o indice volta a montar documentos Frankenstein -- e nada acusa."""
    alvos = _alvos_do_manifesto()
    assert len(alvos) > 100, f"descoberta do manifesto degradou: so {len(alvos)} alvos"

    contagem = collections.Counter(_chave_de(f) for f in alvos)
    colisoes = {k: q for k, q in contagem.items() if q > 1}
    assert not colisoes, f"chaves de id em colisao: {colisoes}"
    assert len(contagem) == len(alvos), "toda chave tem de corresponder a exatamente um arquivo"


def test_o_esquema_antigo_de_fato_colidia():
    """Prova que a invariante acima nao e vacuidade.

    Um teste de unicidade sobre um esquema que nunca colide passa por acidente.
    Este mede o esquema antigo no MESMO corpus e exige que ele reprove -- se um
    dia parar de colidir, e porque o corpus mudou, e a forca do teste acima
    precisa ser reavaliada."""
    alvos = _alvos_do_manifesto()
    antigo = collections.Counter(
        (f.parent.name if f.name == "MEMORY.md" else f.stem) for f in alvos
    )
    colisoes = {k: q for k, q in antigo.items() if q > 1}
    assert colisoes, (
        "o esquema antigo deixou de colidir neste corpus -- o teste de unicidade "
        "acima ficou sem forca comprovada; reavalie antes de confiar nele"
    )
    perdidos = sum(q - 1 for q in colisoes.values())
    assert perdidos >= 10, f"esperava perda substancial pelo esquema antigo, medi {perdidos}"


def test_a_chave_e_relativa_e_sobrevive_a_mudanca_de_raiz():
    """Caminho absoluto no id amarraria o indice a esta maquina."""
    import memory_rag  # noqa: PLC0415

    alvo = memory_rag.RAIZ_DO_PROJETO / ".claude" / "agent-memory" / "chico" / "MEMORY.md"
    chave = _chave_de(alvo)
    assert chave == ".claude/agent-memory/chico/MEMORY.md"
    assert not chave.startswith("C:"), "o id nao pode carregar caminho absoluto"
    assert "\\" not in chave, "separador tem de ser posix, senao Windows e Linux geram ids diferentes"


def test_arquivo_fora_da_raiz_ainda_recebe_id_unico():
    """O ramo de fallback existe e precisa continuar produzindo algo unico."""
    fora = Path("/tmp/fora-da-raiz/documento.md") if Path("/tmp").exists() else Path("C:/temp/fora/documento.md")
    chave = _chave_de(fora)
    assert chave, "o fallback nao pode devolver vazio"
    assert chave != _chave_de(Path("/outro/documento.md") if Path("/tmp").exists() else Path("C:/outro/documento.md"))


def test_o_nome_amigavel_continua_no_metadado():
    """A correcao mexe no id, nao na filtragem. `agent` tem de continuar sendo o
    nome curto, senao consulta por agente para de funcionar."""
    fonte = (RAIZ / "memory_rag.py").read_text(encoding="utf-8")
    assert '"agent": source_name' in fonte, "o metadado `agent` deixou de ser o nome amigavel"


def test_o_id_nao_e_mais_derivado_so_do_nome():
    """Guarda estrutural: se alguem voltar a montar o id a partir de
    `source_name`, a colisao volta inteira."""
    fonte = (RAIZ / "memory_rag.py").read_text(encoding="utf-8")
    padrao_antigo = "source_name" + '}_chunk_{'
    assert padrao_antigo not in fonte, (
        "o id voltou a ser derivado do nome curto; ver a docstring deste modulo"
    )


@pytest.mark.parametrize(
    "caminho_a,caminho_b",
    [
        (".claude/AGENTS/chico.md", ".claude/agent-memory/chico/MEMORY.md"),
        ("docs/epics/ingestion-pipeline/SPEC.md", "docs/epics/cli-interativa/SPEC.md"),
        ("agents/dispatcher.py", ".claude/AGENTS/dispatcher.md"),
    ],
)
def test_pares_que_colidiam_agora_se_separam(caminho_a, caminho_b):
    """Os casos concretos medidos no indice real, um a um."""
    import memory_rag  # noqa: PLC0415

    a = memory_rag.RAIZ_DO_PROJETO / caminho_a
    b = memory_rag.RAIZ_DO_PROJETO / caminho_b
    antigo_a = a.parent.name if a.name == "MEMORY.md" else a.stem
    antigo_b = b.parent.name if b.name == "MEMORY.md" else b.stem
    assert antigo_a == antigo_b, "este par deixou de ser um caso de colisao do esquema antigo"
    assert _chave_de(a) != _chave_de(b), "o esquema novo ainda colide neste par"
