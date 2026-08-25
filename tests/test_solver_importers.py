# tests/test_solver_importers.py
"""
Testes unitarios para os importadores de solvers de poker profissional:
DeepSolver, GTOWizard, Monker Solver, HRC Pro e PioSolver.
"""

import json
from engine.solver_importers import (
    DeepSolverImporter,
    GTOWizardImporter,
    HRCProImporter,
    MonkerSolverImporter,
    PioSolverImporter,
    UniversalSolverImporter,
)


def test_deep_solver_import_json():
    """Valida a importacao de arvore JSON do DeepSolver."""
    sample_deepsolver_json = json.dumps(
        {
            "solver": "deepsolver",
            "version": "3.1",
            "pot": 10.0,
            "board": ["Ah", "Kd", "2c"],
            "stacks": {"IP": 100.0, "OOP": 100.0},
            "nodes": [
                {
                    "id": "node_0",
                    "player": "OOP",
                    "street": "flop",
                    "pot": 10.0,
                    "strategy": {"CHECK": 0.65, "BET_3.3": 0.35},
                    "ev": {"CHECK": 5.2, "BET_3.3": 5.8},
                    "equity": 0.52,
                    "children": ["node_1", "node_2"],
                }
            ],
        }
    )

    importer = DeepSolverImporter()
    assert importer.detect_format(sample_deepsolver_json) is True

    tree = importer.parse_tree(sample_deepsolver_json)
    assert tree.solver_type == "deep_solver"
    assert len(tree.nodes) == 1
    assert "node_0" in tree.nodes
    node = tree.nodes["node_0"]
    assert node.strategy.get("CHECK") == 0.65
    assert node.range_equity == 0.52
    assert tree.board == ["Ah", "Kd", "2c"]


def test_gtowizard_import_csv_and_json():
    """Valida a importacao de dados do GTOWizard em CSV e JSON."""
    sample_gtow_csv = """Combo,Action,Frequency,EV,Equity
AA,BET,1.0,12.5,0.85
KK,BET,0.8,10.2,0.80
QQ,CHECK,0.7,8.0,0.70
AKs,BET,0.6,7.5,0.65
"""
    importer = GTOWizardImporter()
    assert importer.detect_format(sample_gtow_csv) is True

    tree = importer.parse_tree(sample_gtow_csv)
    assert tree.solver_type == "gtowizard"
    assert "root" in tree.nodes
    root_node = tree.nodes["root"]
    assert "BET" in root_node.strategy
    assert "CHECK" in root_node.strategy

    # Teste de JSON do GTOWizard
    sample_gtow_json = json.dumps(
        {
            "generator": "GTOWizard",
            "spot": "BTN vs BB SRP 20bb",
            "pot": 5.5,
            "actions_summary": {"CHECK": 0.40, "BET": 0.60},
            "ev_summary": {"CHECK": 3.1, "BET": 3.6},
            "hero_position": "BTN",
        }
    )
    assert importer.detect_format(sample_gtow_json) is True
    tree_json = importer.parse_tree(sample_gtow_json)
    assert tree_json.nodes["root"].strategy.get("BET") == 0.60


def test_monker_solver_multiway_import():
    """Valida a importacao de arvores multiway (>=3 jogadores) do Monker Solver."""
    sample_monker_text = """[Player 0: SB] [Pot: 15.0]
Check: 0.50, Bet 5.0: 0.30, Raise 15.0: 0.20
[Player 1: BB] [Pot: 20.0]
Fold: 0.30, Call: 0.50, Raise: 0.20
[Player 2: BTN] [Pot: 20.0]
Fold: 0.60, Call: 0.40
"""
    importer = MonkerSolverImporter()
    assert importer.detect_format(sample_monker_text) is True

    tree = importer.parse_tree(sample_monker_text)
    assert tree.solver_type == "monker_solver"
    assert tree.num_players >= 3
    assert "root" in tree.nodes


def test_hrc_pro_import_payout_and_ranges():
    """Valida a importacao de calculos de ICM e push/fold do HRC Pro."""
    sample_hrc_text = """HoldemResources Calculator Pro Export
SB: 15.0bb, BB: 20.0bb, BTN: 35.0bb
Pot: 2.5bb
Bubble Factor: 1.65, Risk Premium: 18.5%
SB Strategy:
PUSH: 62.5%
FOLD: 37.5%
"""
    importer = HRCProImporter()
    assert importer.detect_format(sample_hrc_text) is True

    tree = importer.parse_tree(sample_hrc_text)
    assert tree.solver_type == "hrc_pro"
    assert "root" in tree.nodes
    root_node = tree.nodes["root"]
    assert "ALLIN" in root_node.strategy or "PUSH" in root_node.strategy
    assert root_node.strategy.get("ALLIN", 0.0) == 0.625 or root_node.strategy.get("PUSH", 0.0) == 0.625


def test_pio_solver_node_dump_import():
    """Valida a importacao de text dumps do PioSolver."""
    sample_pio_dump = """PioSOLVER Node Dump
Board: 8s 7d 4c
Node 0: r:0 (OOP) Pot: 100
Actions: BET 50, CHECK
Frequencies: 0.35 0.65
EV: 54.2 48.0
"""
    importer = PioSolverImporter()
    assert importer.detect_format(sample_pio_dump) is True

    tree = importer.parse_tree(sample_pio_dump)
    assert tree.solver_type == "pio_solver"
    assert "root" in tree.nodes
    node = tree.nodes["root"]
    assert node.strategy.get("CHECK") == 0.65
    assert node.strategy.get("BET") == 0.35
    assert tree.board == ["8s", "7d", "4c"]


def test_universal_solver_importer_auto_detection_and_pmev():
    """Valida o orquestrador universal com auto-deteccao e enriquecimento de PMev."""
    universal = UniversalSolverImporter()

    # Teste com DeepSolver
    ds_payload = json.dumps(
        {
            "solver": "deepsolver",
            "pot": 12.0,
            "board": ["Qh", "Jc", "4s"],
            "nodes": [
                {
                    "id": "root",
                    "player": "BTN",
                    "strategy": {"CALL": 0.70, "RAISE": 0.30},
                    "equity": 0.60,
                }
            ],
        }
    )

    detected = universal.detect_solver_type(ds_payload)
    assert detected == "deep_solver"

    response = universal.import_tree(
        raw_content=ds_payload,
        solver_type="auto",
        tournament_context={"payjump_proximity_factor": 0.8, "base_antes": 1.5},
        convert_to_pmev=True,
    )

    assert response.status == "SUCCESS"
    assert response.solver_type == "deep_solver"
    assert response.tree is not None
    assert "root" in response.tree.pmev_converted_nodes
    pmev_res = response.tree.pmev_converted_nodes["root"]
    assert pmev_res.pmev is not None
    assert pmev_res.bubble_factor > 1.0


def test_deep_solver_parse_range_matrix_and_heatmap():
    """Valida a geracao de heatmap de range comparativo (DeepSolver vs PMev)."""
    importer = DeepSolverImporter()

    # Range em formato de dicionario de maos
    sample_range_dict = {
        "AA": 1.0,
        "KK": 1.0,
        "QQ": 0.8,
        "AKs": 1.0,
        "AQs": 0.9,
        "AKo": 0.7,
        "72o": 0.0,
    }

    heatmap = importer.generate_pmev_heatmap(
        deepsolver_range=sample_range_dict,
        pmev_threshold=0.60,
    )

    assert heatmap["pmev_threshold"] == 0.60
    assert len(heatmap["deepsolver_matrix"]) == 13
    assert len(heatmap["pmev_matrix"]) == 13
    assert len(heatmap["delta_matrix"]) == 13
    assert heatmap["total_deepsolver_combos"] > 0.0
    assert heatmap["ascii_heatmap"] is not None
    assert len(heatmap["cells"]) == 169
    assert any(c["hand"] == "AA" for c in heatmap["cells"])
