# engine/solver_importers/gtowizard.py
"""
Importador especializado para GTOWizard (CSV / JSON Exports).
"""

import csv
import io
import json
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.solver_importers.base import BaseSolverImporter


class GTOWizardImporter(BaseSolverImporter):
    """Parser e normalizador para dados de spots e matrizes do GTOWizard."""

    solver_type: SolverType = "gtowizard"

    def detect_format(self, raw_content: str) -> bool:
        """Detecta headers CSV ou chaves JSON tipicas do GTOWizard."""
        trimmed = raw_content.strip()
        if "gtowizard" in trimmed.lower() or "gto wizard" in trimmed.lower():
            return True
        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                if any(k in data for k in ["spot", "actions_summary", "combos", "hand_matrix", "gtow_version"]):
                    return True
            except Exception:
                pass
        # Checagem de CSV
        lines = [line.strip() for line in trimmed.splitlines() if line.strip()]
        if lines:
            header = lines[0].lower()
            if any(k in header for k in ["combo", "frequency", "strategy", "action", "weight"]):
                return True
        return False

    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Processa exports em CSV ou JSON do GTOWizard."""
        trimmed = raw_content.strip()
        nodes_dict: dict[str, SolverNode] = {}
        board: list[str] = []
        starting_pot = 10.0
        stacks = {"IP": 100.0, "OOP": 100.0}

        if trimmed.startswith("{") and trimmed.endswith("}"):
            try:
                data = json.loads(trimmed)
                board = data.get("board", [])
                starting_pot = float(data.get("pot", 10.0))
                stacks = {k: float(v) for k, v in data.get("stacks", stacks).items()}
                actions_summary = data.get("actions_summary", data.get("strategy", {}))
                strategy = {self.sanitize_action_name(a): float(f) for a, f in actions_summary.items()}
                ev_summary = {self.sanitize_action_name(a): float(e) for a, e in data.get("ev_summary", {}).items()}

                node = SolverNode(
                    node_id="root",
                    player=data.get("hero_position", data.get("player", "OOP")),
                    street=data.get("street", "flop").lower(),
                    pot=starting_pot,
                    actions=list(strategy.keys()),
                    strategy=strategy,
                    ev=ev_summary,
                    range_equity=data.get("range_equity", 0.50),
                    children=[],
                )
                nodes_dict["root"] = node
            except Exception:
                pass

        if not nodes_dict:
            # Fallback para parsing de CSV
            reader = csv.reader(io.StringIO(trimmed))
            rows = list(reader)
            if rows:
                header = [h.strip().lower() for h in rows[0]]
                action_counts: dict[str, list[float]] = {}
                ev_counts: dict[str, list[float]] = {}

                for row in rows[1:]:
                    if not row or len(row) < 2:
                        continue
                    row_dict = {header[i]: row[i].strip() for i in range(min(len(header), len(row)))}
                    act = self.sanitize_action_name(row_dict.get("action", row_dict.get("action_name", "CALL")))
                    try:
                        freq = float(row_dict.get("frequency", row_dict.get("strategy", row_dict.get("freq", 0.0))))
                        action_counts.setdefault(act, []).append(freq)
                    except ValueError:
                        pass
                    try:
                        ev_val = float(row_dict.get("ev", 0.0))
                        ev_counts.setdefault(act, []).append(ev_val)
                    except ValueError:
                        pass

                strategy = {}
                ev_map = {}
                total_samples = sum(len(v) for v in action_counts.values()) or 1
                for act, freqs in action_counts.items():
                    strategy[act] = round(sum(freqs) / len(freqs) if freqs else 0.0, 4)
                for act, evs in ev_counts.items():
                    ev_map[act] = round(sum(evs) / len(evs) if evs else 0.0, 4)

                # Normalizar soma de frequencias para 1.0 se houver acoes
                total_f = sum(strategy.values())
                if total_f > 0:
                    strategy = {k: round(v / total_f, 4) for k, v in strategy.items()}

                node = SolverNode(
                    node_id="root",
                    player="OOP",
                    street="flop",
                    pot=starting_pot,
                    actions=list(strategy.keys()),
                    strategy=strategy,
                    ev=ev_map,
                    range_equity=0.50,
                    children=[],
                )
                nodes_dict["root"] = node

        return NormalizedGameTree(
            solver_type="gtowizard",
            source_format="GTOWizard CSV/JSON",
            game_type="MTT" if (tournament_context and tournament_context.get("prizes")) else "GTO",
            num_players=len(stacks),
            board=board,
            starting_pot=starting_pot,
            stacks=stacks,
            nodes=nodes_dict,
            root_node_id="root",
        )
