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

# pylint: disable=redefined-outer-name
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
    return [p for p in RAIZ.rglob("*.py") if set(p.parts).isdisjoint(IGNORADOS)]


def _importadores(modulo: str) -> set[str]:
    """Quem IMPORTA o modulo, medido na AST -- citar num comentario nao conta."""
    achados: set[str] = set()
    for p in _fontes_python():
        try:
            arvore = ast.parse(p.read_text(encoding="utf-8", errors="ignore"))
        except SyntaxError:
            continue
        for no in ast.walk(arvore):
            if (isinstance(no, ast.ImportFrom) and no.module and no.module.startswith(modulo)) or (
                isinstance(no, ast.Import) and any(a.name.startswith(modulo) for a in no.names)
            ):
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
        if rel.startswith(("memory/", "tests/")):
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
    assert blocos
    assert blocos <= chaves_da_fixture, (
        f"o estado do notepad deixou de ser so a fixture: blocos {sorted(blocos)}, "
        f"na fixture {sorted(chaves_da_fixture)}. Algo passou a escrever ali. {PISTA}"
    )


def test_os_consumidores_de_notepad_active_md_estao_mapeados_e_defensivos(declaracao):
    """Garante que os pontos vivos de injecao de notepad_active.md sao conhecidos e defensivos."""
    notepad_entry = next(
        e for e in declaracao["modulos_escritos_e_NAO_ligados"] if e["caminho"] == "memory/notepad_memory.py"
    )
    consumidores = notepad_entry["estado_em_disco"]["consumidores_de_texto"]
    assert len(consumidores) == 3

    for rel_path in consumidores:
        caminho = RAIZ / rel_path
        assert caminho.exists(), f"Consumidor de notepad declarado nao existe: {rel_path}"
        conteudo = caminho.read_text(encoding="utf-8", errors="ignore")
        # Todos os 3 consumidores devem conter verificacao defensiva antes de ler
        assert "notepad_active.md" in conteudo
        assert "exists" in conteudo or "Test-Path" in conteudo, (
            f"Consumidor {rel_path} deve validar existencia antes da ingestao."
        )


def test_coerencia_de_versao_sota_v8_em_todos_os_artefatos_de_notepad():
    """Erradica a divergencia historica (7.0 vs 8.0) entre modulo, json e markdown."""
    modulo_txt = (RAIZ / "memory" / "notepad_memory.py").read_text(encoding="utf-8")
    assert '"8.0.0-GOLD"' in modulo_txt
    assert "Protocolo Chico v8.0 GOLD" in modulo_txt

    json_txt = (RAIZ / "memory" / "notepad_state.json").read_text(encoding="utf-8")
    assert '"version": "8.0.0-GOLD"' in json_txt

    md_txt = (RAIZ / "memory" / "notepad_active.md").read_text(encoding="utf-8")
    assert "Protocolo Chico v8.0 GOLD" in md_txt


def test_notepad_state_e_markdown_estao_em_paridade_estrutural():
    """Verifica paridade biunivoca entre o estado JSON e o markdown renderizado."""
    estado_path = RAIZ / "memory" / "notepad_state.json"
    md_path = RAIZ / "memory" / "notepad_active.md"

    dados = json.loads(estado_path.read_text(encoding="utf-8"))
    blocos = dados.get("blocks", [])
    md_conteudo = md_path.read_text(encoding="utf-8")

    assert len(blocos) > 0, "Notepad state deve conter ao menos um bloco de referencia"
    for b in blocos:
        chave = b["key"]
        assert f"## [{chave}]" in md_conteudo, f"Bloco {chave} presente no JSON mas ausente no Markdown"
