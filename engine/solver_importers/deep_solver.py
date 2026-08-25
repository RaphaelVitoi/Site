# engine/solver_importers/deep_solver.py
"""
Importador especializado para DeepSolver (JSON / Tree API).
"""

import json
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.bayesian_range import RANKS, apply_pmev_range_filter, get_preflop_hand_strength_matrix
from engine.solver_importers.base import BaseSolverImporter


class DeepSolverImporter(BaseSolverImporter):
    """Parser e normalizador de arvores e ranges exportados pelo DeepSolver."""

    solver_type: SolverType = "deep_solver"

    def detect_format(self, raw_content: str) -> bool:
        """Detecta assinaturas JSON especificas do DeepSolver."""
        try:
            trimmed = raw_content.strip()
            if not (trimmed.startswith("{") and trimmed.endswith("}")):
                return False
            data = json.loads(trimmed)
            if isinstance(data, dict):
                if data.get("solver") == "deepsolver" or "deepsolver" in str(data.get("generator", "")).lower():
                    return True
                if "deep_tree" in data or ("nodes" in data and "solution_precision" in data):
                    return True
                if "version" in data and "tree" in data and "ranges" in data:
                    return True
        except Exception:
            return False
        return False

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa a arvore JSON do DeepSolver para a estrutura normalizada."""
        data = json.loads(raw_content)
        board = data.get("board", [])
        if isinstance(board, str):
            board = [board[i : i + 2] for i in range(0, len(board), 2)]

        starting_pot = float(data.get("pot", data.get("starting_pot", 10.0)))
        stacks = {k: float(v) for k, v in data.get("stacks", {"IP": 100.0, "OOP": 100.0}).items()}
        num_players = len(stacks) if stacks else 2

        nodes_dict: dict[str, SolverNode] = {}
        raw_nodes = data.get("nodes", data.get("tree", {}))

        if isinstance(raw_nodes, list):
            for item in raw_nodes:
                nid = str(item.get("id", item.get("node_id", f"node_{len(nodes_dict)}")))
                strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                node = SolverNode(
                    node_id=nid,
                    player=str(item.get("player", "IP")),
                    street=str(item.get("street", "flop")).lower(),
                    pot=float(item.get("pot", starting_pot)),
                    actions=list(strategy.keys()) if strategy else item.get("actions", []),
                    strategy=strategy,
                    ev=ev,
                    range_equity=item.get("equity", item.get("range_equity")),
                    children=[str(c) for c in item.get("children", [])],
                )
                nodes_dict[nid] = node
        elif isinstance(raw_nodes, dict):
            for nid, item in raw_nodes.items():
                strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                node = SolverNode(
                    node_id=str(nid),
                    player=str(item.get("player", "IP")),
                    street=str(item.get("street", "flop")).lower(),
                    pot=float(item.get("pot", starting_pot)),
                    actions=list(strategy.keys()) if strategy else item.get("actions", []),
                    strategy=strategy,
                    ev=ev,
                    range_equity=item.get("equity", item.get("range_equity")),
                    children=[str(c) for c in item.get("children", [])],
                )
                nodes_dict[str(nid)] = node

        root_id = "root" if "root" in nodes_dict else (next(iter(nodes_dict)) if nodes_dict else "root")

        return NormalizedGameTree(
            solver_type="deep_solver",
            source_format="JSON DeepSolver v2/v3",
            game_type="MTT" if (tournament_context and tournament_context.get("prizes")) else "GTO",
            num_players=num_players,
            board=board,
            starting_pot=starting_pot,
            stacks=stacks,
            nodes=nodes_dict,
            root_node_id=root_id,
        )

    @staticmethod
    def get_hand_label(r: int, c: int) -> str:
        """Retorna a notacao padrao de mao preflop (ex: AA, AKs, AKo)."""
        if r == c:
            return f"{RANKS[r]}{RANKS[c]}"
        if r < c:
            return f"{RANKS[r]}{RANKS[c]}s"
        return f"{RANKS[c]}{RANKS[r]}o"

    def parse_range_matrix(self, raw_data: Any) -> list[list[float]]:
        """Converte formatos variados do DeepSolver (2D list, 1D 169, dict) em matriz 13x13."""
        matrix = [[0.0 for _ in range(13)] for _ in range(13)]

        if isinstance(raw_data, list):
            if len(raw_data) == 13 and all(isinstance(row, list) and len(row) == 13 for row in raw_data):
                return [[round(float(v), 4) for v in row] for row in raw_data]
            if len(raw_data) == 169:
                for idx, val in enumerate(raw_data):
                    r = idx // 13
                    c = idx % 13
                    matrix[r][c] = round(float(val), 4)
                return matrix
        elif isinstance(raw_data, dict):
            for r in range(13):
                for c in range(13):
                    label = self.get_hand_label(r, c)
                    val = raw_data.get(label, raw_data.get(label.lower(), 0.0))
                    matrix[r][c] = round(float(val), 4)
            return matrix

        return matrix

    def generate_pmev_heatmap(
        self,
        deepsolver_range: Any,
        pmev_threshold: float,
    ) -> dict[str, Any]:
        """
        Gera o heatmap comparativo (DeepSolver GTO vs. PMev 3.2).
        Retorna matrizes de delta, metricas de combo e renderizacao visual ASCII.
        """
        ds_matrix = self.parse_range_matrix(deepsolver_range)
        hand_strengths = get_preflop_hand_strength_matrix()
        pmev_matrix = apply_pmev_range_filter(ds_matrix, pmev_threshold, hand_strengths)

        delta_matrix = [[0.0 for _ in range(13)] for _ in range(13)]
        cells: list[dict[str, Any]] = []
        ascii_rows: list[str] = []

        total_ds_combos = 0.0
        total_pmev_combos = 0.0
        expanded_hands: list[str] = []
        contracted_hands: list[str] = []

        for r in range(13):
            row_symbols: list[str] = []
            for c in range(13):
                label = self.get_hand_label(r, c)
                ds_freq = ds_matrix[r][c]
                pmev_freq = pmev_matrix[r][c]
                delta = round(pmev_freq - ds_freq, 4)
                delta_matrix[r][c] = delta

                # Combos ponderados: pares=6, suited=4, offsuit=12
                combo_weight = 6.0 if r == c else (4.0 if r < c else 12.0)
                total_ds_combos += ds_freq * combo_weight
                total_pmev_combos += pmev_freq * combo_weight

                symbol = "."
                action = "EQUAL"
                if delta > 0.05:
                    symbol = "+"
                    action = "EXPAND"
                    expanded_hands.append(label)
                elif delta < -0.05:
                    symbol = "-"
                    action = "CONTRACT"
                    contracted_hands.append(label)

                row_symbols.append(symbol)
                cells.append(
                    {
                        "hand": label,
                        "deepsolver_freq": ds_freq,
                        "pmev_freq": pmev_freq,
                        "delta": delta,
                        "strength": hand_strengths[r][c],
                        "action": action,
                    }
                )
            ascii_rows.append(" ".join(row_symbols))

        return {
            "pmev_threshold": round(pmev_threshold, 4),
            "deepsolver_matrix": ds_matrix,
            "pmev_matrix": pmev_matrix,
            "delta_matrix": delta_matrix,
            "total_deepsolver_combos": round(total_ds_combos, 2),
            "total_pmev_combos": round(total_pmev_combos, 2),
            "combo_delta": round(total_pmev_combos - total_ds_combos, 2),
            "expanded_hands_count": len(expanded_hands),
            "contracted_hands_count": len(contracted_hands),
            "expanded_hands": expanded_hands[:10],
            "contracted_hands": contracted_hands[:10],
            "ascii_heatmap": "\n".join(ascii_rows),
            "cells": cells,
        }
