# engine/solver_importers/monker.py
"""
Importador especializado para Monker Solver (Multiway & Preflop/Postflop Trees).
"""

import json
import re
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.solver_importers.base import BaseSolverImporter


class MonkerSolverImporter(BaseSolverImporter):
    """Parser para arvores do Monker Solver com suporte a Multiway (>= 3 jogadores)."""

    solver_type: SolverType = "monker_solver"

    def detect_format(self, raw_content: str) -> bool:
        """Identifica assinaturas do Monker Solver."""
        trimmed = raw_content.strip()
        if "monker" in trimmed.lower():
            return True
        # Formato de arvore texto do Monker
        if re.search(r"\[Player\s*\d+.*\]|\bNode_\d+\s*:\s*\[", trimmed, re.IGNORECASE):
            return True
        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                if data.get("solver") == "monker" or "monker_version" in data:
                    return True
                if len(data.get("players", [])) >= 3:
                    return True
            except Exception:
                pass
        return False

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa arvores multiway do Monker Solver."""
        trimmed = raw_content.strip()
        nodes_dict: dict[str, SolverNode] = {}
        stacks: dict[str, float] = {"BTN": 100.0, "SB": 100.0, "BB": 100.0}
        starting_pot = 15.0
        board: list[str] = []

        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                board = data.get("board", [])
                starting_pot = float(data.get("pot", starting_pot))
                if "players" in data and isinstance(data["players"], list):
                    stacks = {p: 100.0 for p in data["players"]}
                elif "stacks" in data:
                    stacks = {k: float(v) for k, v in data["stacks"].items()}

                raw_nodes = data.get("nodes", {})
                for nid, item in raw_nodes.items():
                    strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                    ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                    node = SolverNode(
                        node_id=str(nid),
                        player=str(item.get("player", "SB")),
                        street=str(item.get("street", "flop")).lower(),
                        pot=float(item.get("pot", starting_pot)),
                        actions=list(strategy.keys()),
                        strategy=strategy,
                        ev=ev,
                        range_equity=item.get("equity"),
                        children=[str(c) for c in item.get("children", [])],
                    )
                    nodes_dict[str(nid)] = node
            except Exception:
                pass

        if not nodes_dict:
            # Parser de texto estruturado do Monker
            lines = trimmed.splitlines()
            current_node_id = "root"
            strategy: dict[str, float] = {}
            player = "SB"
            pot = starting_pot

            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue

                # Match de jogador/posicao
                p_match = re.search(r"\[Player\s*(\d+|[A-Z]+)[^\]]*\]", line_str, re.IGNORECASE)
                if p_match:
                    player = p_match.group(1).upper()

                # Match de pot
                pot_match = re.search(r"\[Pot:\s*([\d\.]+)\]", line_str, re.IGNORECASE)
                if pot_match:
                    pot = float(pot_match.group(1))

                # Match de acoes: "Check: 0.70, Bet 5.0: 0.30"
                act_matches = re.findall(r"([A-Za-z0-9\._\s]+)\s*:\s*([\d\.]+)", line_str)
                if act_matches:
                    for act_name, freq_val in act_matches:
                        if act_name.upper() not in ["PLAYER", "POT", "NODE"]:
                            s_act = self.sanitize_action_name(act_name)
                            try:
                                strategy[s_act] = float(freq_val)
                            except ValueError:
                                pass

            if strategy:
                node = SolverNode(
                    node_id="root",
                    player=player,
                    street="preflop" if not board else "flop",
                    pot=pot,
                    actions=list(strategy.keys()),
                    strategy=strategy,
                    ev={},
                    range_equity=0.33,
                    children=[],
                )
                nodes_dict["root"] = node

        root_id = "root" if "root" in nodes_dict else (next(iter(nodes_dict)) if nodes_dict else "root")
        num_players = len(stacks) if len(stacks) >= 3 else 3

        return NormalizedGameTree(
            solver_type="monker_solver",
            source_format="Monker Solver Multiway",
            game_type="Multiway MTT",
            num_players=num_players,
            board=board,
            starting_pot=starting_pot,
            stacks=stacks,
            nodes=nodes_dict,
            root_node_id=root_id,
        )
