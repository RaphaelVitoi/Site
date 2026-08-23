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

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa text dumps e arvores do PioSolver."""
        trimmed = raw_content.strip()
        nodes_dict: dict[str, SolverNode] = {}
        board: list[str] = []
        starting_pot = 100.0
        stacks = {"IP": 1000.0, "OOP": 1000.0}

        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                board = data.get("board", [])
                starting_pot = float(data.get("pot", starting_pot))
                stacks = {k: float(v) for k, v in data.get("stacks", stacks).items()}
                for nid, item in data.get("nodes", {}).items():
                    strategy = {self.sanitize_action_name(a): float(f) for a, f in item.get("strategy", {}).items()}
                    ev = {self.sanitize_action_name(a): float(e) for a, e in item.get("ev", {}).items()}
                    node = SolverNode(
                        node_id=str(nid),
                        player=str(item.get("player", "OOP")),
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
            # Parser de texto do dump do PioSolver
            lines = trimmed.splitlines()
            current_node_id = "root"
            player = "OOP"
            pot = starting_pot
            actions: list[str] = []
            frequencies: list[float] = []
            ev_list: list[float] = []

            for line in lines:
                l_str = line.strip()
                if not l_str:
                    continue

                if "board:" in l_str.lower():
                    b_match = re.search(r"board:\s*([A-Za-z0-9\s]+)", l_str, re.IGNORECASE)
                    if b_match:
                        board = b_match.group(1).split()

                if "pot:" in l_str.lower():
                    p_match = re.search(r"pot:\s*([\d\.]+)", l_str, re.IGNORECASE)
                    if p_match:
                        pot = float(p_match.group(1))

                if "(ip)" in l_str.lower():
                    player = "IP"
                elif "(oop)" in l_str.lower():
                    player = "OOP"

                if l_str.lower().startswith("children:") or l_str.lower().startswith("actions:"):
                    act_part = re.sub(r"^(children|actions):\s*", "", l_str, flags=re.IGNORECASE)
                    actions = [self.sanitize_action_name(a) for a in re.split(r",\s*", act_part) if a.strip()]

                if l_str.lower().startswith("strategy:") or l_str.lower().startswith("frequencies:"):
                    freq_part = re.sub(r"^(strategy|frequencies):\s*", "", l_str, flags=re.IGNORECASE)
                    for f in re.split(r"[,\s]+", freq_part):
                        try:
                            frequencies.append(float(f))
                        except ValueError:
                            pass

                if l_str.lower().startswith("ev:"):
                    ev_part = re.sub(r"^ev:\s*", "", l_str, flags=re.IGNORECASE)
                    for e in re.split(r"[,\s]+", ev_part):
                        try:
                            ev_list.append(float(e))
                        except ValueError:
                            pass

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

            node = SolverNode(
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
            nodes_dict["root"] = node

        root_id = "root" if "root" in nodes_dict else (next(iter(nodes_dict)) if nodes_dict else "root")

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
