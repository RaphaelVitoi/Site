"""Suite de testes SOTA para integracao do paradigma Google Dream-RSI.

Valida:
1. Schemas da Arvore de Descoberta (Pydantic v2, Pure ASCII).
2. Politicas de exploracao como codigo executavel.
3. Simulador de Replay offline com custo zero de execucao externa.
4. Teorema da Nao-Regressao Monotonica (garantia formal).
5. Triagem preditiva do DreamGate para ancoras e Target Lock.
6. Poda de sub-ramos matematicos na ponte PMev.

Padrao SOTA: Pure ASCII, Zero-Any, Tipagem Estrita Python 3.12+.
"""
# pylint: disable=redefined-outer-name, protected-access, import-outside-toplevel, reimported, abstract-class-instantiated

from __future__ import annotations

from conductor.dream_gate import DreamGate
from core.discovery_tree_schemas import (
    DiscoveryNode,
    DiscoveryTree,
    ReplayEvaluationResult,
)
from core.exploration_policy import (
    AdaptiveDreamPolicy,
    ParallelRefinePolicy,
    select_monotonic_best_policy,
)
from engine.dream_replay_simulator import DreamReplaySimulator
from engine.pmev_dream_bridge import PMevActionBranch, PMevDreamBridge


def _create_mock_discovery_tree(tree_id: str = "tree_test_01") -> DiscoveryTree:
    """Helper para instanciar uma arvore de teste realista."""
    root = DiscoveryNode(
        node_id="root",
        parent_id=None,
        depth=0,
        domain="code_engineering",
        action_type="init",
        action_payload={"desc": "initial prompt"},
        status="success",
        metric_score=0.5,
        runtime_ms=120.0,
        tokens_consumed=400,
    )
    c1 = DiscoveryNode(
        node_id="c1",
        parent_id="root",
        depth=1,
        domain="code_engineering",
        action_type="refine_loop",
        action_payload={"branch": 1},
        status="success",
        metric_score=0.85,
        runtime_ms=85.0,
        tokens_consumed=250,
    )
    c2 = DiscoveryNode(
        node_id="c2",
        parent_id="root",
        depth=1,
        domain="code_engineering",
        action_type="refine_loop",
        action_payload={"branch": 2},
        status="compiler_error",
        metric_score=0.1,
        runtime_ms=40.0,
        tokens_consumed=150,
    )
    c3 = DiscoveryNode(
        node_id="c3",
        parent_id="c1",
        depth=2,
        domain="code_engineering",
        action_type="optimize_tail",
        action_payload={"branch": 3},
        status="success",
        metric_score=0.98,
        runtime_ms=60.0,
        tokens_consumed=200,
    )

    nodes = {"root": root, "c1": c1, "c2": c2, "c3": c3}
    return DiscoveryTree(tree_id=tree_id, root_id="root", domain="code_engineering", nodes=nodes)


def test_discovery_tree_schema_validation() -> None:
    """Testa a integridade estrutural e metodos auxiliares da arvore."""
    tree = _create_mock_discovery_tree()
    assert tree.tree_id == "tree_test_01"
    assert len(tree.nodes) == 4

    children = tree.get_children("root")
    assert len(children) == 2
    assert {c.node_id for c in children} == {"c1", "c2"}

    leaves = tree.get_leaf_nodes()
    leaf_ids = {leaf.node_id for leaf in leaves}
    assert leaf_ids == {"c2", "c3"}

    best = tree.best_node()
    assert best is not None
    assert best.node_id == "c3"
    assert best.metric_score == 0.98


def test_exploration_policies_behavior() -> None:
    """Testa o comportamento das politicas base e adaptativa."""
    tree = _create_mock_discovery_tree()

    # Politica Base (ParallelRefine)
    base_policy = ParallelRefinePolicy(beam_width=2)
    selected_base = base_policy.select_candidates(tree)
    assert len(selected_base) <= 2
    assert base_policy.should_prune(tree.nodes["c2"], tree) is True
    assert base_policy.should_prune(tree.nodes["c1"], tree) is False

    # Politica Adaptativa
    adaptive_policy = AdaptiveDreamPolicy(base_beam_width=2, wide_beam_width=4)
    selected_adaptive = adaptive_policy.select_candidates(tree)
    assert len(selected_adaptive) >= 1
    assert adaptive_policy.should_prune(tree.nodes["c2"], tree) is True


def test_replay_simulator_offline_evaluation() -> None:
    """Testa a avaliacao de politicas em replay offline com custo 0."""
    simulator = DreamReplaySimulator(db_path=":memory:")
    tree = _create_mock_discovery_tree()
    simulator.record_tree(tree)

    trees = simulator.load_trees()
    assert len(trees) == 1

    policy = AdaptiveDreamPolicy()
    result = simulator.simulate_policy_on_tree(policy, tree)

    assert isinstance(result, ReplayEvaluationResult)
    assert result.policy_name == "AdaptiveDreamPolicy"
    assert result.nodes_evaluated > 0
    assert result.simulated_runtime_ms > 0
    assert result.pruned_nodes_count >= 1
    assert result.simulated_tokens_saved >= 150


def test_monotonic_non_regression_guarantee() -> None:
    """Testa a garantia formal de que o otimizador nunca regride em relacao a pi_t."""
    current_policy = ParallelRefinePolicy(beam_width=2)
    worse_policy = ParallelRefinePolicy(beam_width=1, max_depth=0)

    scores = {
        current_policy.name: 85.5,
        worse_policy.name: 30.0,
    }

    winner = select_monotonic_best_policy(
        candidates=[worse_policy],
        current_policy=current_policy,
        policy_scores=scores,
    )
    # Garante que a politica atual foi preservada frente ao candidato pior
    assert winner.name == current_policy.name


def test_dream_gate_screening() -> None:
    """Testa a triagem preventiva de mudancas por arquivo e ancora."""
    gate = DreamGate()

    # Cenário seguro
    safe_assessment = gate.assess_proposal(target_files=["core/schemas/new_tool.py", "engine/math_helper.py"])
    assert safe_assessment.should_proceed is True
    assert safe_assessment.suggested_action == "PROCEED_SAFE"

    # Cenário com colisão em arquivo de ancoragem sem revisão formal
    anchor_assessment = gate.assess_proposal(
        target_files=["reports/REGISTRO-001.md", "engine/algo.py"],
        has_formal_anchor_revision=False,
    )
    assert anchor_assessment.should_proceed is False
    assert "governanca protegidos" in str(anchor_assessment.prune_reason)
    assert anchor_assessment.suggested_action == "PRUNE_AND_REQUEST_REVISION_RECORD"

    # Cenário de escopo amplo (violação de Target Lock)
    too_many_files = [f"file_{i}.py" for i in range(15)]
    scope_assessment = gate.assess_proposal(target_files=too_many_files)
    assert scope_assessment.should_proceed is False
    assert "Target Lock" in str(scope_assessment.prune_reason)


def test_pmev_dream_bridge_pruning() -> None:
    """Testa a poda antecipada de ramos dominados no PMev."""
    bridge = PMevDreamBridge(min_ev_threshold=0.0)

    branches = [
        PMevActionBranch(action_name="fold", bet_size_bb=0.0, estimated_ev=0.0, risk_metric=0.0),
        PMevActionBranch(action_name="raise_all_in", bet_size_bb=100.0, estimated_ev=1.5, risk_metric=0.3),
        PMevActionBranch(action_name="call_bad", bet_size_bb=20.0, estimated_ev=-2.4, risk_metric=0.8),
    ]

    result = bridge.filter_dominated_branches(branches)
    assert len(result.surviving_branches) == 2
    assert len(result.pruned_branches) == 1
    assert result.pruned_branches[0].action_name == "call_bad"
    assert result.cpu_cycles_saved_estimate_pct > 0.0

    # Teste de registro de nó
    node = bridge.record_pmev_run(
        tree_id="mtt_final_table",
        action_name="raise_all_in",
        metric_score=1.5,
        runtime_ms=45.0,
    )
    assert node.domain == "pmev_math"
    assert node.status == "success"
    assert node.metric_score == 1.5


def test_dream_timesfm_forecaster_and_predictive_pruning() -> None:
    """Testa a projecao quantilica do TimesFM e poda preditiva de trajetoria."""
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415
    from engine.timesfm_engine import ExecutionMode  # noqa: PLC0415

    forecaster = DreamTimesFMForecaster(
        mode=ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key="timesfm-2.5-200m",
    )

    # Trajetoria estagnada / descendente
    declining_scores = [0.45, 0.40, 0.38, 0.35]
    prune, reason = forecaster.should_prune_predictively(
        scores=declining_scores,
        global_best_score=0.90,
    )
    assert prune is True
    assert "inferior ao melhor global" in reason

    # Trajetoria ascendente e promissora
    ascending_scores = [0.60, 0.72, 0.81, 0.88]
    prune_asc, _ = forecaster.should_prune_predictively(
        scores=ascending_scores,
        global_best_score=0.90,
    )
    assert prune_asc is False


def test_timesfm_predictive_policy_offline_dream() -> None:
    """Testa a politica combinada TimesFMPredictivePolicy dentro do Replay Simulator."""
    from core.exploration_policy import TimesFMPredictivePolicy  # noqa: PLC0415
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415

    forecaster = DreamTimesFMForecaster()
    policy = TimesFMPredictivePolicy(forecaster=forecaster)

    simulator = DreamReplaySimulator(db_path=":memory:")
    tree = _create_mock_discovery_tree()
    simulator.record_tree(tree)

    result = simulator.simulate_policy_on_tree(policy, tree)
    assert result.policy_name == "TimesFMPredictivePolicy"
    assert result.nodes_evaluated > 0


def test_timesfm_governance_enforcement() -> None:
    """Garante que o modelo 3.0 nao pode ser instanciado em modo comercial."""
    import pytest  # noqa: PLC0415

    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415
    from engine.timesfm_engine import ExecutionMode, TimesFMGovernanceError  # noqa: PLC0415

    with pytest.raises(TimesFMGovernanceError, match="VIOLA"):
        DreamTimesFMForecaster(
            mode=ExecutionMode.COMMERCIAL_PRODUCTION,
            preferred_model_key="timesfm-3.0-330m",
        )


def test_dream_timesfm_forecaster_research_mode_timesfm_3_0() -> None:
    """Valida integracao harmonica do TimesFM 3.0 para pesquisa academica nao-comercial."""
    from core.exploration_policy import TimesFMPredictivePolicy  # noqa: PLC0415
    from engine.dream_replay_simulator import DreamReplaySimulator  # noqa: PLC0415
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415
    from engine.timesfm_engine import ExecutionMode, LicenseTier  # noqa: PLC0415

    # Fabrica ergonomica for_research aceita alias '3.0' e modelo completo
    forecaster = DreamTimesFMForecaster.for_research("3.0")
    assert forecaster.mode == ExecutionMode.RESEARCH_BENCHMARK
    assert forecaster.engine.is_research_mode is True
    assert forecaster.engine.metadata.version == "3.0"
    assert forecaster.engine.metadata.license_tier == LicenseTier.NON_COMMERCIAL_V1
    assert forecaster.engine.metadata.is_commercial_allowed is False

    # Projecao de trajetoria estocastica em modo de pesquisa
    scores = [0.40, 0.50, 0.60, 0.70]
    forecast = forecaster.forecast_trajectory(scores, horizon=3)
    assert forecast is not None
    assert len(forecast.mean_prediction) == 3
    assert forecast.license_tier == LicenseTier.NON_COMMERCIAL_V1.value
    assert "google/timesfm-3.0-pytorch" in forecast.intended_model

    # Poda preditiva e deteccao de plateau
    prune, _ = forecaster.should_prune_predictively(scores, global_best_score=0.99)
    assert isinstance(prune, bool)
    plateau = forecaster.is_plateau_imminent(scores)
    assert isinstance(plateau, bool)

    # Avaliacao hermetica com DiscoveryTree e Replay Simulator
    tree = _create_mock_discovery_tree("tree_timesfm_30_research")

    policy_30 = TimesFMPredictivePolicy(forecaster=forecaster)
    sim = DreamReplaySimulator(db_path=":memory:")
    eval_res = sim.evaluate_policy(policy_30, [tree])
    assert eval_res.policy_name == "TimesFMPredictivePolicy"
    assert eval_res.total_score > 0.0


def test_discovery_tree_and_node_deep_immutability() -> None:
    """Valida a protecao contra mutacao pos-persistencia em nos e arvores."""
    import pytest  # noqa: PLC0415

    node = DiscoveryNode(
        node_id="immut_node",
        parent_id=None,
        depth=0,
        domain="code_engineering",
        action_type="eval",
        action_payload={"key": "val", "nested": {"inner": 42}},
        status="success",
        metric_score=1.0,
    )
    tree = DiscoveryTree(
        tree_id="immut_tree",
        root_id="immut_node",
        domain="code_engineering",
        nodes={"immut_node": node},
    )

    with pytest.raises(TypeError, match="FrozenDict is immutable"):
        node.action_payload["key"] = "modified"

    with pytest.raises(TypeError, match="FrozenDict is immutable"):
        node.action_payload["nested"]["inner"] = 99  # type: ignore[index]

    with pytest.raises(TypeError, match="FrozenDict is immutable"):
        tree.nodes["new_node"] = node  # type: ignore[index]


def test_parallel_refine_policy_leaf_selection_and_fallback() -> None:
    """Valida se a selecao de candidatos prioriza folhas e tem fallback gracioso."""
    tree = _create_mock_discovery_tree()
    policy = ParallelRefinePolicy(beam_width=2)

    candidates = policy.select_candidates(tree)
    # Folhas validas sao c3 (score 0.98) e c2 (score 0.1, status compiler_error != pruned)
    assert len(candidates) <= 2
    assert candidates[0].node_id == "c3"

    # Fallback quando arvore nao tem folhas validas
    empty_tree = DiscoveryTree(
        tree_id="empty_tree",
        root_id="none",
        domain="code_engineering",
        nodes={},
    )
    assert policy.select_candidates(empty_tree) == []


def test_dream_gate_backslash_normalization() -> None:
    """Garante que caminhos Windows com contra-barra sao normalizados e detectados."""
    gate = DreamGate()

    assessment = gate.assess_proposal(
        target_files=["reports\\REGISTRO-teste.md", "src\\components\\Button.tsx"],
        has_formal_anchor_revision=False,
    )
    assert assessment.should_proceed is False
    assert "reports\\REGISTRO-teste.md" in assessment.anchor_protected_files
    assert assessment.suggested_action == "PRUNE_AND_REQUEST_REVISION_RECORD"


def test_discovery_recorder_unique_runs_and_inventory(tmp_path: object) -> None:
    """Valida a unicidade de execucoes de teste e inventario sem falsas execucoes."""
    from engine.discovery_recorder import DiscoveryRecorder  # noqa: PLC0415

    db_path = str(tmp_path) + "/test_recorder.db"
    recorder = DiscoveryRecorder(db_path=db_path)

    run1 = recorder.record_test_run("test_suite_a.py", passed=True, duration_ms=10.0)
    run2 = recorder.record_test_run("test_suite_a.py", passed=True, duration_ms=12.0)
    assert run1.node_id != run2.node_id

    trees = recorder.simulator.load_trees()
    assert len(trees) == 2

    inv = recorder.record_test_inventory("test_discovered.py")
    assert inv.action_type == "test_inventory"
    assert inv.action_payload["discovered"] is True
    assert inv.runtime_ms == 0.0


def test_dream_replay_simulator_round_by_round_and_isolation() -> None:
    """Valida a simulacao rodada a rodada, metrica por no e isolamento de estado."""
    tree = _create_mock_discovery_tree()
    simulator = DreamReplaySimulator(db_path=":memory:")
    simulator.record_tree(tree)

    policy = AdaptiveDreamPolicy(base_beam_width=2, wide_beam_width=4)
    res = simulator.simulate_policy_on_tree(policy, tree)

    assert res.best_node_metric == 0.98
    assert res.best_node_id == "c3"

    # Multiplos mundos avaliados sem vazamento de estado de plateau
    tree2 = _create_mock_discovery_tree("tree_test_02")
    res_agg = simulator.evaluate_policy(policy, [tree, tree2])
    assert res_agg.best_node_metric == 0.98
    assert res_agg.best_node_id == "c3"


def test_pmev_dream_bridge_cross_domain_protection() -> None:
    """Garante que falhas de outros dominios nao podam acoes do dominio pmev_math."""
    bridge = PMevDreamBridge(min_ev_threshold=0.0)

    # Arvore de historico contendo erro no dominio code_engineering com acao 'bet_flop'
    foreign_node = DiscoveryNode(
        node_id="foreign_err",
        parent_id=None,
        depth=0,
        domain="code_engineering",
        action_type="bet_flop",
        action_payload={},
        status="test_failure",
        metric_score=0.0,
    )
    foreign_tree = DiscoveryTree(
        tree_id="foreign_tree",
        root_id="foreign_err",
        domain="code_engineering",
        nodes={"foreign_err": foreign_node},
    )

    branches = [
        PMevActionBranch(action_name="bet_flop", bet_size_bb=10.0, estimated_ev=2.0, risk_metric=0.1),
    ]

    # O no estrangeiro nao deve contaminar o pmev_math
    pruning = bridge.filter_dominated_branches(branches, replay_tree=foreign_tree)
    assert len(pruning.surviving_branches) == 1
    assert len(pruning.pruned_branches) == 0

    # Unicidade do record_pmev_run
    r1 = bridge.record_pmev_run("tree_1", "shove", metric_score=1.0, runtime_ms=0.0)
    r2 = bridge.record_pmev_run("tree_1", "shove", metric_score=1.0, runtime_ms=0.0)
    assert r1.node_id != r2.node_id


def test_cli_route_task_includes_dream_gate(capsys: object) -> None:
    """Garante que a rota via CLI enriquece metadados com dream_gate."""
    import json  # noqa: PLC0415

    import pytest  # noqa: PLC0415

    import task_executor  # noqa: PLC0415

    with pytest.raises(SystemExit) as exc_info:
        task_executor._cli_route_task(["python", "task_executor.py", "Tarefa com reports/REGISTRO.md", ""])
    assert exc_info.value.code == 0
    captured = capsys.readouterr()  # type: ignore[attr-defined]
    out = json.loads(captured.out)
    assert "dream_gate" in out["metadata"]
    assert out["metadata"]["dream_gate"]["should_proceed"] is False


def test_timesfm_short_series_calibration() -> None:
    """Valida a calibracao adaptativa em trajetorias curtas (<= 3 pontos)."""
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415

    forecaster = DreamTimesFMForecaster()

    # Serie com 1 ponto
    c1 = forecaster.calibrate_short_series_upper_bound([0.30])
    assert 0.30 < c1 <= 0.60

    # Serie com declinio rapido (ex: 0.20 -> 0.10) avaliada contra global_best = 0.90
    prune, reason = forecaster.should_prune_predictively(
        scores=[0.20, 0.10],
        global_best_score=0.90,
    )
    assert prune is True
    assert "[CALIBRATED-MOMENTUM]" in reason

    # Serie curta promissora (ex: 0.70 -> 0.85) contra global_best = 0.80
    prune_ok, reason_ok = forecaster.should_prune_predictively(
        scores=[0.70, 0.85],
        global_best_score=0.80,
    )
    assert prune_ok is False
    assert "[CALIBRATED-MOMENTUM]" in reason_ok


def test_pmev_history_seeding_and_health_telemetry(tmp_path: object) -> None:
    """Valida o povoamento de arvores pmev_math e a telemetria de saude do banco."""
    from engine.discovery_recorder import DiscoveryRecorder  # noqa: PLC0415

    db_path = str(tmp_path) + "/pmev_test.db"
    recorder = DiscoveryRecorder(db_path=db_path)

    seeded = recorder.seed_pmev_history(count=20)
    assert seeded == 20

    telemetry = recorder.get_database_health_telemetry()
    assert telemetry["status"] == "HEALTHY"
    assert telemetry["integrity_check"].lower() == "ok"
    assert telemetry["total_trees"] == 20
    assert telemetry["domain_distribution"]["pmev_math"] == 20
    assert telemetry["size_kb"] > 0
    assert telemetry["projected_annual_growth_mb"] >= 0


def test_review_findings_hardening(tmp_path: object) -> None:
    """Valida as correcoes dos review findings: reset abstrato, payload validation, memory delegation e log de margem."""
    import json
    import sqlite3

    import pytest

    from core.exploration_policy import (  # noqa: PLC0415
        AdaptiveDreamPolicy,
        ExplorationPolicy,
        ParallelRefinePolicy,
        TimesFMPredictivePolicy,
    )
    from engine.discovery_recorder import DiscoveryRecorder  # noqa: PLC0415
    from engine.dream_replay_simulator import DreamReplaySimulator  # noqa: PLC0415
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster  # noqa: PLC0415

    # 1. Reset obrigatorio como abstractmethod
    class SubWithoutReset(ExplorationPolicy):
        def select_candidates(self, tree: DiscoveryTree) -> list[DiscoveryNode]:
            return []

        def should_prune(self, node: DiscoveryNode, tree: DiscoveryTree) -> bool:
            return False

        def should_stop(self, tree: DiscoveryTree, round_count: int, best_metric: float) -> bool:
            return True

        def branch_factor(self, current_depth: int) -> int:
            return 1

    with pytest.raises(TypeError, match="abstract method.*reset"):
        SubWithoutReset(name="Incomplete")  # type: ignore[abstract]

    # Todas as subclasses concretas devem poder ser instanciadas e possuir reset()
    p1 = ParallelRefinePolicy()
    p1.reset()
    p2 = AdaptiveDreamPolicy()
    p2.reset()
    p3 = TimesFMPredictivePolicy()
    p3.reset()

    # 2. Validacao de payload corrompido / shape invalido na telemetria
    test_db = str(tmp_path) + "/corrupt_test.db"
    rec = DiscoveryRecorder(db_path=test_db)
    rec.seed_pmev_history(count=5)
    with sqlite3.connect(test_db) as conn:
        conn.execute(
            "INSERT INTO discovery_trees (tree_id, root_id, domain, created_at, payload_json) VALUES (?, ?, ?, ?, ?)",
            ("bad_1", "r", "code_engineering", "2026-09-18T00:00:00Z", "not-a-json"),
        )
        conn.execute(
            "INSERT INTO discovery_trees (tree_id, root_id, domain, created_at, payload_json) VALUES (?, ?, ?, ?, ?)",
            ("bad_2", "r", "code_engineering", "2026-09-18T00:00:00Z", json.dumps({"nodes": "not_a_dict"})),
        )

    telem = rec.get_database_health_telemetry()
    assert telem["invalid_payloads"] == 2
    assert telem["status"] == "DEGRADED"

    # 3. Delegacao de telemetria para :memory:
    sim_mem = DreamReplaySimulator(db_path=":memory:")
    rec_mem = DiscoveryRecorder(db_path=":memory:")
    rec_mem.simulator = sim_mem
    rec_mem.record_task_outcome("t1", "agent", "desc", "completed")
    telem_mem = sim_mem.get_database_health_telemetry()
    assert telem_mem["total_trees"] == 1
    assert telem_mem["status"] == "HEALTHY"

    # 4. Log de momentum calibrado com margem ajustada
    forecaster = DreamTimesFMForecaster()
    prune, reason = forecaster.should_prune_predictively(
        scores=[0.45, 0.46],
        global_best_score=0.53,
        margin=0.10,
    )
    assert prune is False
    assert "margem=" in reason
    assert "[CALIBRATED-MOMENTUM]" in reason
