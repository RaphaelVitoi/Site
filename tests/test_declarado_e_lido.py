"""Constante atribuída e nunca lida: o padrão dominante desta base, como detector.

Cinco instâncias foram encontradas **por acaso**, uma de cada vez, ao longo de
uma sessão:

| declarado | o que o mecanismo fazia |
| :--- | :--- |
| `CHUNK_SIZE = 1200` | teto usado só para dividir, nunca para juntar — mediana 162 |
| `max_cache_size_mb = 4096` | atribuído no `__init__`; a evicção contava baldes |
| `AGENT_MODEL_MAP` | resolvido a cada carga, sem consumidor de produção |
| `recursive: false` | campo do manifesto que o código nunca lia |
| `$warnings` | lido no veredito e nunca populado |

Constante sem leitor não é só código morto. Quando ela nomeia um **teto**, um
**peso** ou uma **variável de ambiente**, é promessa ao operador — quem a
configura acredita ter mudado alguma coisa. `DO_PS1_THRESHOLD` lia
`os.environ` e não governava nada.

Este arquivo transforma o achado em varredura. A lista vive em
`data/DECLARADO_E_NAO_LIDO.json` com um **veredito por item**, e o teste compara
a declaração com a árvore: item novo reprova, item resolvido reprova. A conta só
muda por decisão registrada.
"""

from __future__ import annotations

import ast
import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
DECLARACAO = RAIZ / "data" / "DECLARADO_E_NAO_LIDO.json"
IGNORADOS = {
    ".venv", ".venv-wsl", "node_modules", "__pycache__", ".git", ".pytest_cache",
    "dist", "build", "target", "wasm-equity", "frontend", ".trunk",
}

PISTA = (
    "Atualize data/DECLARADO_E_NAO_LIDO.json no mesmo commit, com o veredito do "
    "item. A conta so muda por decisao registrada."
)


@pytest.fixture(scope="module")
def declaracao() -> dict:
    return json.loads(DECLARACAO.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def arvores() -> dict[Path, ast.AST]:
    saida: dict[Path, ast.AST] = {}
    ilegiveis: list[str] = []
    for p in RAIZ.rglob("*.py"):
        if set(p.parts) & IGNORADOS:
            continue
        try:
            saida[p] = ast.parse(p.read_text(encoding="utf-8", errors="ignore"))
        except SyntaxError:
            ilegiveis.append(p.relative_to(RAIZ).as_posix())
    assert not ilegiveis, f"arquivos que nao parseiam podem esconder um leitor: {ilegiveis}"
    assert len(saida) > 100, f"a varredura degradou: so {len(saida)} arquivos"
    return saida


def _nomes_lidos(arvore: ast.AST) -> set[str]:
    """Nomes em contexto de LEITURA. `x = 1` nao conta; `y = x` conta.

    Comentario e docstring nao entram na AST como `Name`, entao citar o nome ao
    documentar nao o faz parecer vivo -- foi assim que a versao textual desta
    varredura deu falso negativo em outro detector desta sessao.
    """
    lidos: set[str] = set()
    for no in ast.walk(arvore):
        if isinstance(no, ast.Name) and isinstance(no.ctx, ast.Load):
            lidos.add(no.id)
        elif isinstance(no, ast.Attribute) and isinstance(no.ctx, ast.Load):
            lidos.add(no.attr)
        elif isinstance(no, ast.Call) and isinstance(no.func, ast.Name) and no.func.id == "getattr":
            if len(no.args) > 1 and isinstance(no.args[1], ast.Constant) and isinstance(no.args[1].value, str):
                lidos.add(no.args[1].value)
    return lidos


def _exportados(arvore: ast.AST) -> set[str]:
    for no in ast.walk(arvore):
        if isinstance(no, ast.Assign):
            for alvo in no.targets:
                if isinstance(alvo, ast.Name) and alvo.id == "__all__" and isinstance(no.value, (ast.List, ast.Tuple)):
                    return {e.value for e in no.value.elts if isinstance(e, ast.Constant) and isinstance(e.value, str)}
    return set()


def _constantes(arvore: ast.AST) -> set[str]:
    """UPPER_CASE no nivel do modulo -- a forma que este projeto usa para teto."""
    achados: set[str] = set()
    for no in arvore.body:
        if isinstance(no, (ast.Assign, ast.AnnAssign)):
            alvos = no.targets if isinstance(no, ast.Assign) else [no.target]
            for a in alvos:
                if isinstance(a, ast.Name) and a.id.isupper() and not a.id.startswith("__"):
                    achados.add(a.id)
    return achados


def _orfas(arvores: dict[Path, ast.AST], fora: tuple[str, ...]) -> dict[str, str]:
    lidos = set()
    for arv in arvores.values():
        lidos |= _nomes_lidos(arv)

    orfas: dict[str, str] = {}
    for p, arv in arvores.items():
        rel = p.relative_to(RAIZ).as_posix()
        if any(rel.startswith(pref) for pref in fora):
            continue
        publicos = _exportados(arv)
        for nome in _constantes(arv):
            if nome not in lidos and nome not in publicos:
                orfas[nome] = rel
    return orfas


# ---------------------------------------------------------------------------
#  A varredura contra a declaracao
# ---------------------------------------------------------------------------


def test_o_inventario_bate_com_a_arvore(declaracao, arvores):
    """Nos dois sentidos. Constante nova sem veredito reprova; constante
    resolvida que continua na lista tambem -- declaracao que sobrevive ao fato e
    a obsolescencia silenciosa que este projeto persegue."""
    fora = tuple(declaracao["fora_de_escopo"]["prefixos"])
    medidas = _orfas(arvores, fora)
    declaradas = {e["nome"] for e in declaracao["pendentes"]}

    novas = set(medidas) - declaradas
    resolvidas = declaradas - set(medidas)
    assert not novas, f"constantes sem leitor e sem veredito: { {n: medidas[n] for n in sorted(novas)} }. {PISTA}"
    assert not resolvidas, f"declaradas orfas e agora com leitor: {sorted(resolvidas)}. {PISTA}"


def test_todo_pendente_tem_veredito_e_onde(declaracao):
    """Lista sem veredito vira lista de exceção, e lista de exceção cresce."""
    for e in declaracao["pendentes"]:
        assert e.get("veredito"), f"{e['nome']} esta na lista sem veredito -- isso e isencao, nao analise"
        assert e.get("onde"), f"{e['nome']} sem caminho"
        assert (RAIZ / e["onde"]).exists(), f"{e['onde']} nao existe mais; a declaracao envelheceu. {PISTA}"


def test_o_que_foi_removido_ficou_removido(declaracao, arvores):
    """As remoções de 2026-08-29 não podem voltar por copiar-e-colar."""
    lidos = set()
    definidos = set()
    for arv in arvores.values():
        lidos |= _nomes_lidos(arv)
        definidos |= _constantes(arv)
    for e in declaracao["removidos_em_2026_08_29"]:
        assert e["nome"] not in definidos, (
            f"{e['nome']} voltou a ser definido. Se foi de proposito, tire do bloco "
            f"`removidos_em_2026_08_29` e explique. {PISTA}"
        )


# ---------------------------------------------------------------------------
#  O detector precisa conseguir detectar
# ---------------------------------------------------------------------------


def test_a_varredura_acha_uma_constante_orfa_plantada(tmp_path):
    """Sem isto, uma varredura que nunca acha nada passa por competente."""
    (tmp_path / "modulo.py").write_text("TETO_QUE_NINGUEM_LE = 42\nUSADO = 1\nprint(USADO)\n", encoding="utf-8")
    arv = {tmp_path / "modulo.py": ast.parse((tmp_path / "modulo.py").read_text(encoding="utf-8"))}
    global RAIZ  # noqa: PLW0603 - o helper resolve caminho relativo a RAIZ
    original, RAIZ = RAIZ, tmp_path
    try:
        orfas = _orfas(arv, ())
    finally:
        RAIZ = original
    assert "TETO_QUE_NINGUEM_LE" in orfas
    assert "USADO" not in orfas


def test_citar_o_nome_num_comentario_nao_conta_como_leitura(tmp_path):
    """A razão de medir por AST. A versão textual desta varredura daria a
    constante como viva só porque a documentação a menciona."""
    fonte = '"""Docstring que fala de TETO_CITADO."""\nTETO_CITADO = 7\n# TETO_CITADO tambem aqui\n'
    (tmp_path / "m.py").write_text(fonte, encoding="utf-8")
    arv = {tmp_path / "m.py": ast.parse(fonte)}
    global RAIZ  # noqa: PLW0603
    original, RAIZ = RAIZ, tmp_path
    try:
        orfas = _orfas(arv, ())
    finally:
        RAIZ = original
    assert "TETO_CITADO" in orfas, "citacao em prosa passou por leitura"


def test_constante_lida_por_outro_modulo_nao_conta_como_orfa(tmp_path):
    """O recorte certo e o projeto inteiro, nao o arquivo."""
    (tmp_path / "define.py").write_text("TETO_COMPARTILHADO = 3\n", encoding="utf-8")
    (tmp_path / "usa.py").write_text("from define import TETO_COMPARTILHADO\nprint(TETO_COMPARTILHADO)\n", encoding="utf-8")
    arv = {p: ast.parse(p.read_text(encoding="utf-8")) for p in tmp_path.glob("*.py")}
    global RAIZ  # noqa: PLW0603
    original, RAIZ = RAIZ, tmp_path
    try:
        orfas = _orfas(arv, ())
    finally:
        RAIZ = original
    assert "TETO_COMPARTILHADO" not in orfas


def test_nome_em_dunder_all_nao_conta_como_orfa(tmp_path):
    """Interface publica sem leitor local nao e defeito."""
    fonte = '__all__ = ["API_PUBLICA"]\nAPI_PUBLICA = 1\n'
    (tmp_path / "m.py").write_text(fonte, encoding="utf-8")
    arv = {tmp_path / "m.py": ast.parse(fonte)}
    global RAIZ  # noqa: PLW0603
    original, RAIZ = RAIZ, tmp_path
    try:
        orfas = _orfas(arv, ())
    finally:
        RAIZ = original
    assert "API_PUBLICA" not in orfas
