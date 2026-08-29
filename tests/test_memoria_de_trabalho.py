"""Os modulos de memoria de trabalho: qual esta ligado, e por que dois nao estao.

O passo 3 do plano dizia *"ligar `notepad_memory` e `replay_buffer`"*. Medir
mudou o passo -- e e bom que a razao fique travada, porque a proxima pessoa a
encontrar 371 linhas de codigo completo sem importador vai concluir, como eu
conclui, que basta liga-lo.

**`memory/replay_buffer.py`** e Prioritized Experience Replay: `SumTree`,
`Transition(state, action, reward, next_state, done)`, `update_priorities` com
erros de TD. Nao e memoria de recuperacao, e treino por reforco. Medido: a unica
ocorrencia de `reward` no projeto e `math/rio_extended.py`, e la e
`pot x equity` -- valor esperado de poquer, nao recompensa de RL. Nao ha politica,
episodio nem TD. Liga-lo exigiria **inventar** o laco de aprendizado.

**`memory/notepad_memory.py`** faria o papel de `task.metadata`, que ja existe,
e persistido em SQLite e tem `BEGIN EXCLUSIVE` com merge cirurgico. Liga-lo
criaria a segunda fonte para o mesmo fato.

E o achado que fecha o argumento: `memory/notepad_state.json` -- a unica evidencia
em disco de que o notepad roda -- e a **saida do smoke test do proprio modulo**, e
o bloco `PLAN_CURRENT` dele afirma textualmente *"Memoria Notepad e Replay Memory
integradas"*. Medido por AST: zero importadores. O artefato que atesta a
integracao e uma fixture de demonstracao do modulo que se diz integrado.

Estes testes nao impedem ligar. Eles fazem a decisao aparecer: se um importador
surgir, o teste falha pedindo que a declaracao seja atualizada no mesmo commit.
"""

from __future__ import annotations

import ast
import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
DECLARACAO = RAIZ / "data" / "ESTADO_DA_MEMORIA_DE_TRABALHO.json"
IGNORADOS = {".venv", "node_modules", "__pycache__", ".git", ".pytest_cache", "dist", "build", "wasm-equity", "vendor"}

PISTA = (
    "Se isto falhou porque um modulo foi ligado, a decisao mudou: atualize "
    "data/ESTADO_DA_MEMORIA_DE_TRABALHO.json e o registro "
    "reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md no mesmo commit."
)


@pytest.fixture(scope="module")
def declaracao() -> dict:
    return json.loads(DECLARACAO.read_text(encoding="utf-8"))


def _fontes_python() -> list[Path]:
    return [p for p in RAIZ.rglob("*.py") if not (set(p.parts) & IGNORADOS)]


def _importadores(modulo: str) -> set[str]:
    """Quem IMPORTA o modulo, medido na AST -- citar num comentario nao conta."""
    achados: set[str] = set()
    for p in _fontes_python():
        try:
            arvore = ast.parse(p.read_text(encoding="utf-8", errors="ignore"))
        except SyntaxError:
            continue
        for no in ast.walk(arvore):
            if isinstance(no, ast.ImportFrom) and no.module and no.module.startswith(modulo):
                achados.add(p.relative_to(RAIZ).as_posix())
            elif isinstance(no, ast.Import):
                if any(a.name.startswith(modulo) for a in no.names):
                    achados.add(p.relative_to(RAIZ).as_posix())
    achados.discard(Path(__file__).relative_to(RAIZ).as_posix())
    return achados


def test_os_modulos_declarados_como_nao_ligados_continuam_sem_importador(declaracao):
    """O detector que faz a decisao aparecer."""
    for entrada in declaracao["modulos_escritos_e_NAO_ligados"]:
        modulo = entrada["caminho"].removesuffix(".py").replace("/", ".")
        quem = _importadores(modulo)
        assert entrada["importadores"] == 0, "a declaracao ficou inconsistente consigo mesma"
        assert not quem, f"{modulo} ganhou importador(es): {sorted(quem)}. {PISTA}"


def test_os_modulos_declarados_existem_de_fato(declaracao):
    """Declaracao que aponta para arquivo inexistente e pior que ausencia."""
    for entrada in declaracao["modulos_escritos_e_NAO_ligados"]:
        alvo = RAIZ / entrada["caminho"]
        assert alvo.exists(), f"{entrada['caminho']} sumiu; a declaracao envelheceu. {PISTA}"
        linhas = len(alvo.read_text(encoding="utf-8", errors="ignore").splitlines())
        assert abs(linhas - entrada["linhas"]) <= 15, (
            f"{entrada['caminho']} tem {linhas} linhas, declaradas {entrada['linhas']} -- "
            f"o modulo mudou substancialmente desde a analise. {PISTA}"
        )


def test_a_memoria_de_trabalho_que_existe_continua_ligada(declaracao):
    """A contrapartida: se `task.metadata` deixasse de ser consumido, o argumento
    para nao ligar o notepad cairia junto."""
    viva = declaracao["a_memoria_de_trabalho_QUE_EXISTE"]
    escritor = RAIZ / viva["escrita"].split(" :: ")[0]
    assert escritor.exists(), PISTA
    assert "def update_task_metadata" in escritor.read_text(encoding="utf-8", errors="ignore"), PISTA

    for caminho in viva["consumidores"]:
        arquivo = RAIZ / caminho
        assert arquivo.exists(), f"{caminho} sumiu. {PISTA}"
        texto = arquivo.read_text(encoding="utf-8", errors="ignore")
        assert "metadata" in texto, f"{caminho} declarado consumidor e nao usa metadata. {PISTA}"


def test_nao_existe_laco_de_reforco_que_justifique_o_replay_buffer():
    """A premissa que sustenta a decisao sobre o replay buffer.

    Se aparecer um laco de RL de verdade, esta assercao cai e o buffer deixa de
    ser peca de sistema inexistente para virar candidato legitimo."""
    sinais = ("td_error", "q_learning", "epsilon_greedy", "policy_gradient", "replay_batch")
    achados = {}
    for p in _fontes_python():
        rel = p.relative_to(RAIZ).as_posix()
        if rel.startswith("memory/") or rel.startswith("tests/"):
            continue
        texto = p.read_text(encoding="utf-8", errors="ignore").lower()
        presentes = [s for s in sinais if s in texto]
        if presentes:
            achados[rel] = presentes
    assert not achados, (
        f"apareceu sinal de aprendizado por reforco em {achados} -- reavalie a "
        f"decisao sobre memory/replay_buffer.py. {PISTA}"
    )


def test_o_estado_do_notepad_ainda_e_a_fixture_do_smoke_test():
    """O achado que fecha o argumento, travado para nao virar folclore.

    `notepad_state.json` afirma que o notepad esta integrado. Ele e a saida de
    `test_notepad()`. Se um dia o conteudo mudar, e porque algo de verdade
    passou a escrever ali -- e ai a decisao precisa ser revista."""
    estado = RAIZ / "memory" / "notepad_state.json"
    if not estado.exists():
        pytest.skip("o estado do notepad foi removido; nada a guardar aqui")

    blocos = {b["key"] for b in json.loads(estado.read_text(encoding="utf-8")).get("blocks", [])}
    fixture = (RAIZ / "memory" / "notepad_memory.py").read_text(encoding="utf-8", errors="ignore")
    chaves_da_fixture = {
        no.value
        for no in ast.walk(ast.parse(fixture))
        if isinstance(no, ast.Constant) and isinstance(no.value, str) and no.value in blocos
    }
    assert blocos and blocos <= chaves_da_fixture, (
        f"o estado do notepad deixou de ser so a fixture: blocos {sorted(blocos)}, "
        f"na fixture {sorted(chaves_da_fixture)}. Algo passou a escrever ali. {PISTA}"
    )
