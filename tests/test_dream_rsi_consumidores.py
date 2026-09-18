"""O Dream-RSI tem consumidor de runtime -- e cada ponto de ligacao faz o que promete.

Ate 2026-09-18 os modulos Dream-RSI so eram alcancados pelos testes (CLAUDE.md do Site,
secao 6, item 5: sem consumidor e codigo orfao). O Tier 0 determinou a correcao, e o laco
passou a fechar: o executor grava o desfecho de cada tarefa, o handler PMev grava cada
arvore simulada (observacional), e `nexus agent dream-optimize` roda a fase de Sonho com
a TimesFMPredictivePolicy sobre esse historico.
"""
# pylint: disable=import-outside-toplevel

from __future__ import annotations

import asyncio
import json
from pathlib import Path
import re
import subprocess

import pytest
from typer.testing import CliRunner

from core.discovery_tree_schemas import DiscoveryNode, DiscoveryTree
from core.schemas import Task
import engine.discovery_recorder as dr
from engine.dream_replay_simulator import DreamReplaySimulator

RAIZ = Path(__file__).resolve().parent.parent
MODULOS = ("pmev_dream_bridge", "discovery_recorder", "dream_replay_simulator")


def _tarefa(tid: str) -> Task:
    return Task(id=tid, description="ajustar x", timestamp="2026-09-18T00:00:00", agent="@implementor")


ARVORE_PMEV = {"pm_fold": 0.0, "pm_call": -0.5, "pm_raise": -40.571, "pm_best": 0.0, "best_action": "FOLD"}


@pytest.fixture(name="recorder")
def fixture_recorder(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> dr.DiscoveryRecorder:
    """Gravador do runtime num banco novo, por teste."""
    monkeypatch.setenv("NEXUS_DISCOVERY_DB", str(tmp_path / "discovery_tree.db"))
    monkeypatch.setattr(dr, "_recorder_runtime", None)
    return dr.recorder_do_runtime()


def test_cada_modulo_tem_consumidor_fora_dos_testes() -> None:
    """A regra de antientropia, executavel: import de runtime para cada um dos tres."""
    versionados = subprocess.run(
        ["git", "ls-files", "*.py"], cwd=RAIZ, capture_output=True, text=True, check=True
    ).stdout.split()
    for modulo in MODULOS:
        padrao = re.compile(
            rf"^\s*(?:from|import)\s+[\w.]*\b{modulo}\b|^\s*from\s+engine\s+import\s+.*\b{modulo}\b", re.M
        )
        consumidores = [
            rel
            for rel in versionados
            if not rel.startswith("tests/")
            and rel != f"engine/{modulo}.py"
            and padrao.search((RAIZ / rel).read_text(encoding="utf-8", errors="replace"))
        ]
        assert consumidores, f"{modulo} voltou a nao ter consumidor de runtime"


def test_suite_nao_grava_no_historico_real() -> None:
    """O conftest redireciona o banco; sem isso, cada teste do executor sujaria data/discovery_tree.db."""
    import os  # noqa: PLC0415

    assert os.environ.get("NEXUS_DISCOVERY_DB")
    assert Path(os.environ["NEXUS_DISCOVERY_DB"]).resolve() != dr.RUNTIME_DB_PATH.resolve()


def test_executor_grava_desfecho_de_sucesso_e_de_falha(recorder: dr.DiscoveryRecorder) -> None:
    from agents.execution import _registrar_desfecho_no_dream_rsi  # noqa: PLC0415

    asyncio.run(_registrar_desfecho_no_dream_rsi(_tarefa("T-OK"), "completed", 1.5))
    asyncio.run(_registrar_desfecho_no_dream_rsi(_tarefa("T-KO"), "failed", 0.2))

    nos = {t.root_id: t.nodes[t.root_id] for t in recorder.simulator.load_trees("code_engineering")}
    assert nos["task_T-OK"].status == "success"
    assert nos["task_T-OK"].runtime_ms == pytest.approx(1500.0)
    assert nos["task_T-KO"].status == "test_failure"


def test_falha_de_gravacao_nao_derruba_a_tarefa_e_aparece_no_log(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    from agents.execution import _registrar_desfecho_no_dream_rsi  # noqa: PLC0415

    def quebrado() -> None:
        raise OSError("disco cheio")

    monkeypatch.setattr(dr, "recorder_do_runtime", quebrado)
    asyncio.run(_registrar_desfecho_no_dream_rsi(_tarefa("T-X"), "completed", 0.0))
    assert "desfecho de T-X nao gravado" in caplog.text


def test_handler_pmev_registra_e_diagnostica_sem_alterar_a_arvore(recorder: dr.DiscoveryRecorder) -> None:
    from api.v1.handlers import _diagnostico_dream_rsi  # noqa: PLC0415

    original = dict(ARVORE_PMEV)
    diagnostico = asyncio.run(_diagnostico_dream_rsi(ARVORE_PMEV, 3.2))

    assert original == ARVORE_PMEV, "o diagnostico e observacional: nenhum valor do PMev pode mudar"
    # Limiar de EV -0.05: call (-0.5) e raise (-40.6) sao dominados; fold nunca e podado.
    assert diagnostico["ramos_podados"] == ["call", "raise"]
    assert diagnostico["ramos_sobreviventes"] == ["fold"]
    assert [t.domain for t in recorder.simulator.load_trees("pmev_math")] == ["pmev_math"]


def test_banco_em_arquivo_nao_retem_arvores_em_memoria(tmp_path: Path) -> None:
    """Num worker de longa duracao, reter toda arvore seria vazamento sem teto."""
    sim = DreamReplaySimulator(db_path=str(tmp_path / "d.db"))
    no = DiscoveryNode(
        node_id="n",
        parent_id=None,
        depth=0,
        domain="code_engineering",
        action_type="a",
        action_payload={},
        status="success",
        metric_score=1.0,
        runtime_ms=0.0,
        tokens_consumed=0,
    )
    for i in range(50):
        sim.record_tree(DiscoveryTree(tree_id=f"t{i}", root_id="n", domain="code_engineering", nodes={"n": no}))
    assert sim.memory_trees == {}
    assert len(sim.load_trees()) == 50


def test_modo_memoria_continua_retendo() -> None:
    sim = DreamReplaySimulator()
    no = DiscoveryNode(
        node_id="n",
        parent_id=None,
        depth=0,
        domain="pmev_math",
        action_type="a",
        action_payload={},
        status="success",
        metric_score=1.0,
        runtime_ms=0.0,
        tokens_consumed=0,
    )
    sim.record_tree(DiscoveryTree(tree_id="t", root_id="n", domain="pmev_math", nodes={"n": no}))
    assert list(sim.memory_trees) == ["t"]


def test_cli_dream_optimize_roda_a_fase_de_sonho_sobre_o_historico(recorder: dr.DiscoveryRecorder) -> None:
    from scripts.cli.nexus import app  # noqa: PLC0415

    for i in range(3):
        recorder.record_task_outcome(f"T{i}", "@implementor", "x", "completed" if i else "failed", 10.0)

    resultado = CliRunner().invoke(app, ["agent", "dream-optimize", "--json"])
    assert resultado.exit_code == 0, resultado.output
    payload = json.loads(resultado.output[resultado.output.index("{") :])
    assert payload["arvores"] == 3
    assert "TimesFMPredictivePolicy" in {a["politica"] for a in payload["avaliacoes"]}


@pytest.mark.usefixtures("recorder")
def test_cli_dream_optimize_com_historico_vazio_diz_de_onde_vem_o_dado() -> None:
    from scripts.cli.nexus import app  # noqa: PLC0415

    resultado = CliRunner().invoke(app, ["agent", "dream-optimize"])
    assert resultado.exit_code == 0
    assert "Historico vazio" in resultado.output
