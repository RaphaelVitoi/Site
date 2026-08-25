# engine/solver_importers/pio_solver.py
"""
Importador especializado para PioSolver (CFR Text Dumps & Node Strategy).
"""

import json
import re
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.solver_importers.base import BaseSolverImporter


class PioSolverImporter(BaseSolverImporter):
    """Parser para arquivos de estrategia e dumps de no do PioSolver."""

    solver_type: SolverType = "pio_solver"

    def detect_format(self, raw_content: str) -> bool:
        """Detecta assinaturas de formato do PioSolver."""
        trimmed = raw_content.strip()
        if "piosolver" in trimmed.lower() or "pio solver" in trimmed.lower():
            return True
        if "node 0" in trimmed.lower() or "node_0" in trimmed.lower() or "piosolver node" in trimmed.lower():
            return True
        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                if data.get("solver") == "piosolver" or "pio_tree" in data:
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
            stacks = {k: float(v) for k, v in data.get("stacks", default_stacks).items()}
            nodes_dict = {}
            for nid, item in data.get("nodes", {}).items():
                strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                node = SolverNode(
                    node_id=str(nid),
                    player=str(item.get("player", "OOP")),
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

    def _parse_metadata_line(
        self, l_str: str, player: str, pot: float, board: list[str]
    ) -> tuple[str, float, list[str]]:
        lowered = l_str.lower()
        if "board:" in lowered:
            b_match = re.search(r"board:\s*([a-z0-9\s]+)", l_str, re.IGNORECASE)
            if b_match:
                board = b_match.group(1).split()

        if "pot:" in lowered:
            p_match = re.search(r"pot:\s*([\d\.]+)", l_str, re.IGNORECASE)
            if p_match:
                pot = float(p_match.group(1))

        if "(ip)" in lowered:
            player = "IP"
        elif "(oop)" in lowered:
            player = "OOP"

        return player, pot, board

    def _parse_values_line(
        self, l_str: str, actions: list[str], frequencies: list[float], ev_list: list[float]
    ) -> None:
        lowered = l_str.lower()
        if lowered.startswith(("children:", "actions:")):
            act_part = re.sub(r"^(children|actions):\s*", "", l_str, flags=re.IGNORECASE)
            actions.extend([self.sanitize_action_name(a) for a in re.split(r",\s*", act_part) if a.strip()])

        if lowered.startswith(("strategy:", "frequencies:")):
            freq_part = re.sub(r"^(strategy|frequencies):\s*", "", l_str, flags=re.IGNORECASE)
            for f in re.split(r"[,\s]+", freq_part):
                try:
                    frequencies.append(float(f))
                except ValueError:
                    pass

        if lowered.startswith("ev:"):
            ev_part = re.sub(r"^ev:\s*", "", l_str, flags=re.IGNORECASE)
            for e in re.split(r"[,\s]+", ev_part):
                try:
                    ev_list.append(float(e))
                except ValueError:
                    pass

    def _build_text_node(
        self,
        player: str,
        pot: float,
        board: list[str],
        actions: list[str],
        frequencies: list[float],
        ev_list: list[float],
    ) -> SolverNode:
        strategy_map = {}
        ev_map = {}
        if actions:
            for idx, act in enumerate(actions):
                f_val = frequencies[idx] if idx < len(frequencies) else (1.0 / len(actions))
                strategy_map[act] = round(f_val, 4)
                if idx < len(ev_list):
                    ev_map[act] = round(ev_list[idx], 4)
        else:
            strategy_map = {"CHECK": 0.60, "BET": 0.40}

        return SolverNode(
            node_id="root",
            player=player,
            street="flop" if board else "preflop",
            pot=pot,
            actions=list(strategy_map.keys()),
            strategy=strategy_map,
            ev=ev_map,
            range_equity=0.50,
            children=[],
        )

    def _parse_text(self, trimmed: str, starting_pot: float) -> tuple[dict[str, SolverNode], list[str]]:
        lines = trimmed.splitlines()
        player = "OOP"
        pot = starting_pot
        board: list[str] = []
        actions: list[str] = []
        frequencies: list[float] = []
        ev_list: list[float] = []

        for line in lines:
            l_str = line.strip()
            if l_str:
                player, pot, board = self._parse_metadata_line(l_str, player, pot, board)
                self._parse_values_line(l_str, actions, frequencies, ev_list)

        node = self._build_text_node(player, pot, board, actions, frequencies, ev_list)
        return {"root": node}, board

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa text dumps e arvores do PioSolver."""
        trimmed = raw_content.strip()
        starting_pot = 100.0
        stacks = {"IP": 1000.0, "OOP": 1000.0}

        nodes_dict, board, starting_pot, stacks = self._parse_json(trimmed, stacks, starting_pot)
        if not nodes_dict:
            nodes_dict, board = self._parse_text(trimmed, starting_pot)

        if "root" in nodes_dict:
            root_id = "root"
        elif nodes_dict:
            root_id = next(iter(nodes_dict))
        else:
            root_id = "root"

        return NormalizedGameTree(
            solver_type="pio_solver",
            source_format="PioSolver Dump",
            game_type="GTO Cash/MTT",
            num_players=2,
            board=board,
            starting_pot=starting_pot,
            stacks=stacks,
            nodes=nodes_dict,
            root_node_id=root_id,
        )
