# engine/solver_importers/deep_solver.py
"""
Importador especializado para DeepSolver (JSON / Tree API).
"""

import json
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
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
