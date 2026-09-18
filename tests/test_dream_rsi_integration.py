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
