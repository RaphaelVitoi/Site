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
        lowered = trimmed.lower()
        if "monker" in lowered:
            return True
        # Formato de arvore texto do Monker
        if "[player" in lowered or "node_" in lowered:
            if re.search(r"\[player\s+\w+", lowered) or re.search(r"\bnode_\d+\s*:", lowered):
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

    def _parse_json(
        self, trimmed: str, default_stacks: dict[str, float], starting_pot: float
    ) -> tuple[dict[str, SolverNode], list[str], float, dict[str, float]]:
        if not (trimmed.startswith("{") and trimmed.endswith("}")):
            return {}, [], starting_pot, default_stacks
        try:
            data = json.loads(trimmed)
            board = data.get("board", [])
            pot = float(data.get("pot", starting_pot))
            stacks = default_stacks
            if "players" in data and isinstance(data["players"], list):
                stacks = dict.fromkeys(data["players"], 100.0)
            elif "stacks" in data:
                stacks = {k: float(v) for k, v in data["stacks"].items()}

            nodes_dict: dict[str, SolverNode] = {}
            raw_nodes = data.get("nodes", {})
            for nid, item in raw_nodes.items():
                strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                node = SolverNode(
                    node_id=str(nid),
                    player=str(item.get("player", "SB")),
                    street=str(item.get("street", "flop")).lower(),
                    pot=float(item.get("pot", pot)),
                    actions=list(strategy.keys()),
                    strategy=strategy,
                    ev=ev,
                    range_equity=item.get("equity"),
                    children=[str(c) for c in item.get("children", [])],
                )
                nodes_dict[str(nid)] = node
            return nodes_dict, board, pot, stacks
        except Exception:
            return {}, [], starting_pot, default_stacks

    def _parse_actions_from_line(self, line_str: str, strategy: dict[str, float]) -> None:
        for chunk in line_str.split(","):
            if ":" in chunk:
                parts = chunk.rsplit(":", 1)
                act_name = parts[0].strip()
                if act_name.upper() not in ["PLAYER", "POT", "NODE"] and not act_name.startswith("["):
                    s_act = self.sanitize_action_name(act_name)
                    try:
                        strategy[s_act] = float(parts[1].strip())
                    except ValueError:
                        pass

    def _process_text_line(
        self, line_str: str, strategy: dict[str, float], player: str, pot: float
    ) -> tuple[str, float]:
        p_match = re.search(r"\[Player(?:[^:\]]*:\s*|\s+)([A-Za-z0-9]+)", line_str)
        if p_match:
            val = p_match.group(1)
            if val:
                player = val.upper()

        pot_match = re.search(r"\[Pot:\s*([\d\.]+)\]", line_str, re.IGNORECASE)
        if pot_match:
            pot = float(pot_match.group(1))

        if not line_str.startswith("["):
            self._parse_actions_from_line(line_str, strategy)

        return player, pot


    def _parse_text(self, trimmed: str, starting_pot: float, board: list[str]) -> dict[str, SolverNode]:
        lines = trimmed.splitlines()
        strategy: dict[str, float] = {}
        player = "SB"
        pot = starting_pot

        for line in lines:
            line_str = line.strip()
            if line_str:
                player, pot = self._process_text_line(line_str, strategy, player, pot)

        if not strategy:
            return {}

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
        return {"root": node}

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa arvores multiway do Monker Solver."""
        trimmed = raw_content.strip()
        default_stacks: dict[str, float] = {"BTN": 100.0, "SB": 100.0, "BB": 100.0}
        starting_pot = 15.0

        nodes_dict, board, starting_pot, stacks = self._parse_json(trimmed, default_stacks, starting_pot)
        if not nodes_dict:
            nodes_dict = self._parse_text(trimmed, starting_pot, board)

        if "root" in nodes_dict:
            root_id = "root"
        elif nodes_dict:
            root_id = next(iter(nodes_dict))
        else:
            root_id = "root"

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
