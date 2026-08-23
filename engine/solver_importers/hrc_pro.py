# engine/solver_importers/hrc_pro.py
"""
Importador especializado para Holdem Resources Calculator Pro (HRC Pro).
"""

import json
import re
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.solver_importers.base import BaseSolverImporter


class HRCProImporter(BaseSolverImporter):
    """Parser para exports do HRC Pro (Holdem Resources Calculator Pro) com dados de ICM e Ranges."""

    solver_type: SolverType = "hrc_pro"

    def detect_format(self, raw_content: str) -> bool:
        """Detecta assinaturas e tags caracteristicas do HRC Pro."""
        trimmed = raw_content.strip()
        if "holdemresources" in trimmed.lower() or "hrc" in trimmed.lower():
            return True
        if "<hrc" in trimmed.lower() or "hrc_export" in trimmed.lower():
            return True
        if "bubble factor" in trimmed.lower() and "risk premium" in trimmed.lower():
            return True
        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                if any(k in data for k in ["hrc_version", "payout_structure", "fgs_depth", "icm_model"]):
                    return True
            except Exception:
                pass
        return False

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa ranges de push/fold e calculos de ICM do HRC Pro."""
        trimmed = raw_content.strip()
        nodes_dict: dict[str, SolverNode] = {}
        stacks: dict[str, float] = {"Hero": 20.0, "Villain": 25.0}
        starting_pot = 2.5
        board: list[str] = []

        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                starting_pot = float(data.get("pot", data.get("starting_pot", 2.5)))
                if "stacks" in data:
                    stacks = {k: float(v) for k, v in data["stacks"].items()}
                strategy_raw = data.get("strategy", data.get("ranges", {}))
                strategy = {self.sanitize_action_name(a): float(f) for a, f in strategy_raw.items()}
                ev_raw = data.get("ev", {})
                ev = {self.sanitize_action_name(a): float(e) for a, e in ev_raw.items()}

                node = SolverNode(
                    node_id="root",
                    player=data.get("hero_position", "SB"),
                    street="preflop",
                    pot=starting_pot,
                    actions=list(strategy.keys()) if strategy else ["FOLD", "ALLIN"],
                    strategy=strategy if strategy else {"FOLD": 0.40, "ALLIN": 0.60},
                    ev=ev,
                    range_equity=data.get("equity", 0.50),
                    children=[],
                )
                nodes_dict["root"] = node
            except Exception:
                pass

        if not nodes_dict:
            # Parsing de texto tabular/relatorio do HRC
            strategy = {}
            ev_map = {}
            for line in trimmed.splitlines():
                line_str = line.strip()
                # Procurar acoes como PUSH / FOLD / CALL / RAISE com frequencias
                m_act = re.search(r"\b(PUSH|SHOVE|ALLIN|FOLD|CALL|RAISE)\b.*?([\d\.]+)\s*%", line_str, re.IGNORECASE)
                if m_act:
                    act_name = self.sanitize_action_name(m_act.group(1))
                    try:
                        freq = float(m_act.group(2)) / 100.0
                        strategy[act_name] = round(freq, 4)
                    except ValueError:
                        pass

                # Extrair stacks se presentes: "SB: 15.0bb, BB: 20.0bb"
                st_matches = re.findall(r"([A-Z]+)\s*:\s*([\d\.]+)\s*bb", line_str, re.IGNORECASE)
                if st_matches:
                    for pos_name, stack_val in st_matches:
                        try:
                            stacks[pos_name.upper()] = float(stack_val)
                        except ValueError:
                            pass

            if not strategy:
                strategy = {"FOLD": 0.45, "ALLIN": 0.55}

            node = SolverNode(
                node_id="root",
                player="SB",
                street="preflop",
                pot=starting_pot,
                actions=list(strategy.keys()),
                strategy=strategy,
                ev=ev_map,
                range_equity=0.50,
                children=[],
            )
            nodes_dict["root"] = node

        return NormalizedGameTree(
            solver_type="hrc_pro",
            source_format="HRC Pro Export",
            game_type="ICM Tournament",
            num_players=len(stacks),
            board=board,
            starting_pot=starting_pot,
            stacks=stacks,
            nodes=nodes_dict,
            root_node_id="root",
        )
