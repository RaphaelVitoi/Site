# tests/test_game_theory_solvers.py
"""Testes unitarios SOTA para o Modulo Unificado de Teoria dos Jogos

Valida integracao e corretude matematica dos motores:
- Claudico (Abstracao e Traducao Pseudo-Harmonica)
- DeepStack (Continual Resolving e Gadget Bounds)
- Libratus (CFR+ e Regret Matching+)
- Pluribus (Depth-Limited Multiway e Decomposicao PMev)
"""

import math
from engine.game_theory_solvers import (
    CFRPlusEngine,
    ClaudicoActionTranslator,
    ContinualResolvingEngine,
    DeepStackSubgame,
    GrowingTreeCFRSolver,
    GrowingTreeNode,
    PluribusDepthLimitedSolver,
    PluribusMultiwayState,
    PotentialAwareAbstraction,
    PublicBeliefState,
    PUCTNode,
    PUCTPerspectiveSelector,
    Street,
)


def test_claudico_potential_aware_abstraction():
    """Valida a analise de textura e potencial de bordo do Claudico."""
    # Bordo seco sem draws
    dry_board = ["Ah", "Kd", "2c"]
    dry_analysis = PotentialAwareAbstraction.analyze_board(dry_board)
    assert dry_analysis.board_texture == "dry"
    assert dry_analysis.is_monotone is False
    assert dry_analysis.is_paired is False

    # Bordo molhado com flush draw e pares
    wet_board = ["Jh", "Th", "2h", "Jd"]
    wet_analysis = PotentialAwareAbstraction.analyze_board(wet_board)
    assert wet_analysis.board_texture == "wet"
    assert wet_analysis.is_monotone is True
    assert wet_analysis.is_paired is True
    assert wet_analysis.ehs_potential > 0.30


def test_claudico_pseudo_harmonic_mapping():
    """Valida a traducao pseudo-harmonica de apostas off-tree."""
    allowed_bets = [10.0, 20.0, 50.0]
    pot_size = 20.0

    # Aposta exata no nó
    mapping_exact = ClaudicoActionTranslator.pseudo_harmonic_mapping(20.0, allowed_bets, pot_size)
    assert math.isclose(mapping_exact.get(20.0, 0.0), 1.0)

    # Aposta intermediaria (15.0 entre 10 e 20)
    mapping_inter = ClaudicoActionTranslator.pseudo_harmonic_mapping(15.0, allowed_bets, pot_size)
    assert 10.0 in mapping_inter and 20.0 in mapping_inter
    assert math.isclose(sum(mapping_inter.values()), 1.0)
    assert mapping_inter[10.0] > 0.0
    assert mapping_inter[20.0] > 0.0


def test_deepstack_continual_resolving():
    """Valida a formulacao do Gadget Game e Resolving do DeepStack."""
    subgame = DeepStackSubgame(
        street=Street.FLOP,
        pot=20.0,
        ranges_ip={"AA": 0.5, "KK": 0.5},
        ranges_oop={"QQ": 0.4, "JJ": 0.6},
        opponent_cfvs={"QQ": 8.0, "JJ": 5.0},
    )

    bounds = subgame.compute_gadget_game_bounds()
    assert "QQ" in bounds and "JJ" in bounds
    assert bounds["QQ"] > 0.0

    strategy = ContinualResolvingEngine.resolve_subgame(subgame, iterations=50)
    assert "AA" in strategy
    assert "KK" in strategy
    assert math.isclose(sum(strategy["AA"].values()), 1.0)


def test_libratus_cfr_plus_convergence():
    """Valida o algoritmo CFR+ com thresholding de arrependimento nao-negativo."""
    actions = ["PASS", "BET"]
    cfr = CFRPlusEngine(actions)

    # Simula iteracoes com utilidade dominante para BET
    for _ in range(20):
        # BET tem utilidade 10.0, PASS tem utilidade 0.0
        cfr.update_regrets({"PASS": 0.0, "BET": 10.0}, node_ev=5.0)

    avg_strat = cfr.get_average_strategy()
    assert math.isclose(sum(avg_strat.values()), 1.0)
    # Acao dominante deve convergir para probabilidade proxima de 1.0
    assert avg_strat["BET"] > 0.95
    assert avg_strat["PASS"] < 0.05


def test_pluribus_depth_limited_multiway_pmev():
    """Valida a resolucao multiway com penalidade estrutural PMev."""
    multiway_state = PluribusMultiwayState(
        pot=100.0,
        num_players=4,  # 3 oponentes ativos -> k=3
        street=Street.FLOP,
        active_stacks=[100.0, 100.0, 100.0, 100.0],
        lambda_factor=2.25,
    )

    # Passivo estrutural para k=3: 2.25 * (9 - 1) * 5.0 = 90.0
    liability = multiway_state.compute_multiway_structural_liability()
    assert math.isclose(liability, 90.0)

    solver = PluribusDepthLimitedSolver(multiway_state)
    result = solver.solve_depth_limited(equity=0.75, hero_position="BTN")

    assert "strategy" in result
    assert "optimal_action" in result
    assert result["structural_liability"] == 90.0
    assert math.isclose(sum(result["strategy"].values()), 1.0)


def test_alphago_puct_perspective_selector():
    """Valida a selecao PUCT do AlphaZero com modulacao de risco e posicao PMev."""
    nodes = [
        PUCTNode(action="FOLD", prior_probability=0.20, visit_count=10, total_value=0.0),
        PUCTNode(action="CALL", prior_probability=0.30, visit_count=30, total_value=15.0),
        PUCTNode(action="RAISE", prior_probability=0.50, visit_count=60, total_value=45.0),
    ]

    selector = PUCTPerspectiveSelector(cpuct=1.414)
    # Selecao padrao IP (posicao favoravel)
    action_ip = selector.select_action(nodes, position_factor=1.2, risk_premium=0.0)
    assert action_ip == "RAISE"

    # Selecao sob alto premio de risco / bolha (penaliza raise)
    action_bubble = selector.select_action(nodes, position_factor=0.8, risk_premium=5.0)
    assert action_bubble in ["CALL", "FOLD"]


def test_student_of_games_gt_cfr_solver():
    """Valida a expansao assimétrica da arvore no Growing-Tree CFR."""
    solver = GrowingTreeCFRSolver(expansion_threshold=5)
    root = solver.root
    actions = ["CHECK", "BET"]

    assert isinstance(root, GrowingTreeNode)
    assert root.is_expanded is False
    # Executa 4 visitas (abaixo do limiar de 5)
    for _ in range(4):
        solver.step_sample(root, actions)
    assert root.is_expanded is False

    # 5a visita atinge o limiar e expande os filhos
    solver.step_sample(root, actions)
    assert root.is_expanded is True
    assert "CHECK" in root.children
    assert "BET" in root.children


def test_rebel_public_belief_state():
    """Valida o calculo de entropia e representacao do Public Belief State."""
    hero_range = {"AA": 0.25, "KK": 0.25, "AKs": 0.50}
    villain_range = {"QQ": 0.50, "JJ": 0.50}

    pbs = PublicBeliefState.from_ranges(
        board=["Ah", "Kh", "2c"],
        pot=30.0,
        hero_range=hero_range,
        villain_range=villain_range,
    )

    assert pbs.pot == 30.0
    assert pbs.board == ["Ah", "Kh", "2c"]
    assert pbs.hero_range_entropy > 0.0
    assert pbs.villain_range_entropy > 0.0
    assert pbs.is_terminal is False
