"""Testes Unitarios e de Integracao: Malha Universal S1/S2 SOTA Gold.

Valida os 7 componentes do plano de execucao:
1. Ingress Fast-Path em core/arbitrator.py
2. Filtro dinamico de ferramentas MCP em llm/mcp_tool_interceptor.py
3. Gravacao de trios de destilacao no DreamReplaySimulator
4. Integracao do PMevDreamBridge com os trios
"""

from __future__ import annotations

from pathlib import Path

from core.arbitrator import UniversalArbitrator
from core.schemas import Task
from engine.dream_replay_simulator import DreamReplaySimulator
from engine.pmev_dream_bridge import PMevDreamBridge
from llm.mcp_tool_interceptor import interceptar_e_podar_ferramentas_s1


def test_ingress_fast_path_s1_pre_filtra_tarefas_triviais() -> None:
    now_iso = "2026-09-25T06:00:00Z"
    t_sem_dep = Task(
        id="task_trivial_1",
        description="Verificar status basico",
        agent="@implementor",
        status="pending",
        timestamp=now_iso,
        metadata={"priority": "high", "depends_on": []},
    )
    t_com_dep = Task(
        id="task_bloqueada",
        description="Processar analise complexa",
        agent="@implementor",
        status="pending",
        timestamp=now_iso,
        metadata={"priority": "critical", "depends_on": ["task_externa_pendente"]},
    )

    candidata, restantes = UniversalArbitrator.ingress_fast_path_s1([t_com_dep, t_sem_dep])
    assert candidata is not None
    assert candidata.id == "task_trivial_1"
    assert len(restantes) == 1
    assert restantes[0].id == "task_bloqueada"


def test_mcp_tool_interceptor_poda_ferramentas_irrelevantes() -> None:
    tools_mock = [
        {"name": "view_file"},
        {"name": "read_url_content"},
        {"name": "run_sql"},
        {"name": "browser_click"},
        {"name": "stitch_create_project"},
    ]

    # Prompt de pesquisa pura
    filtradas, telem = interceptar_e_podar_ferramentas_s1(
        tools=tools_mock,
        prompt="Pesquise a documentacao da API no site oficial",
    )

    assert telem.tools_original_count == 5
    assert telem.tools_retained_count < 5
    assert telem.pruned_pct > 0.0
    nomes = [t["name"] for t in filtradas]
    assert "view_file" in nomes
    assert "read_url_content" in nomes
    assert "run_sql" not in nomes


def test_dream_replay_simulator_persiste_e_exporta_trios(tmp_path: Path) -> None:
    db_file = str(tmp_path / "test_dream.db")
    sim = DreamReplaySimulator(db_path=db_file)

    tid = sim.record_pmev_distillation_trio(
        hand_history="Hero BTN AhKd vs BB 3bet",
        exact_solution={"best_action": "call", "ev": 2.45},
        uncertainty_residual=0.15,
        metadata={"scenario": "mtt_bubble"},
    )
    assert tid.startswith("trio_")

    trios = sim.load_distillation_trios()
    assert len(trios) == 1
    assert trios[0]["hand_history"] == "Hero BTN AhKd vs BB 3bet"
    assert trios[0]["uncertainty_residual"] == 0.15

    export_path = tmp_path / "dataset_sintetico.jsonl"
    count = sim.export_synthetic_laya_dataset(export_path)
    assert count == 1
    assert export_path.exists()
    content = export_path.read_text(encoding="utf-8")
    assert "Hero BTN AhKd vs BB 3bet" in content
    assert "target_choice" in content


def test_pmev_dream_bridge_registra_trio_ao_diagnosticar() -> None:
    sim = DreamReplaySimulator(db_path=":memory:")
    bridge = PMevDreamBridge(min_ev_threshold=-0.05)

    tree_result = {
        "best_action": "call",
        "pm_best": 1.85,
        "pm_call": 1.85,
        "pm_fold": 0.0,
        "pm_raise": -0.5,
        "hand_history": "Hero SB vs BB all-in",
    }

    diag = bridge.diagnosticar_arvore_de_perspectiva(tree_result, runtime_ms=12.5, simulator=sim)
    assert "distillation_trio_id" in diag
    assert diag["distillation_trio_id"] is not None

    trios = sim.load_distillation_trios()
    assert len(trios) == 1
    assert trios[0]["hand_history"] == "Hero SB vs BB all-in"
