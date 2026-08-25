# engine/solver_importers/hrc_pro.py
"""
Importador especializado para Holdem Resources Calculator Pro (HRC Pro).
"""

import json
import re
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType
from engine.bayesian_range import RANKS, apply_pmev_range_filter, get_preflop_hand_strength_matrix
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

    @staticmethod
    def get_hand_label(r: int, c: int) -> str:
        """Retorna a notacao padrao de mao preflop (ex: AA, AKs, AKo)."""
        if r == c:
            return f"{RANKS[r]}{RANKS[c]}"
        if r < c:
            return f"{RANKS[r]}{RANKS[c]}s"
        return f"{RANKS[c]}{RANKS[r]}o"

    def parse_range_matrix(self, raw_data: Any) -> list[list[float]]:
        """Converte formatos do HRC Pro (dict, texto HRC, 2D list, 1D 169) em matriz 13x13."""
        matrix = [[0.0 for _ in range(13)] for _ in range(13)]

        if isinstance(raw_data, str):
            raw_text = raw_data.strip()
            if raw_text.startswith("{") and raw_text.endswith("}"):
                try:
                    raw_data = json.loads(raw_text)
                except Exception:
                    pass

        if isinstance(raw_data, str):
            for r in range(13):
                for c in range(13):
                    label = self.get_hand_label(r, c)
                    pattern = rf"\b{label}\b[:\s=]+([\d\.]+)(%)?"
                    match = re.search(pattern, raw_data, re.IGNORECASE)
                    if match:
                        val = float(match.group(1))
                        if match.group(2) == "%" or val > 1.0:
                            val = val / 100.0
                        matrix[r][c] = round(max(0.0, min(1.0, val)), 4)
            return matrix

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
                    if isinstance(val, (int, float)):
                        if val > 1.0:
                            val = val / 100.0
                        matrix[r][c] = round(float(val), 4)
            return matrix

        return matrix

    def generate_pmev_heatmap(
        self,
        hrc_range: Any,
        pmev_threshold: float,
    ) -> dict[str, Any]:
        """Gera o heatmap comparativo (HRC Pro vs. PMev 3.2)."""
        hrc_matrix = self.parse_range_matrix(hrc_range)
        hand_strengths = get_preflop_hand_strength_matrix()
        pmev_matrix = apply_pmev_range_filter(hrc_matrix, pmev_threshold, hand_strengths)

        delta_matrix = [[0.0 for _ in range(13)] for _ in range(13)]
        cells: list[dict[str, Any]] = []
        ascii_rows: list[str] = []

        total_hrc_combos = 0.0
        total_pmev_combos = 0.0
        expanded_hands: list[str] = []
        contracted_hands: list[str] = []

        for r in range(13):
            row_symbols: list[str] = []
            for c in range(13):
                label = self.get_hand_label(r, c)
                hrc_freq = hrc_matrix[r][c]
                pmev_freq = pmev_matrix[r][c]
                delta = round(pmev_freq - hrc_freq, 4)
                delta_matrix[r][c] = delta

                combo_weight = 6.0 if r == c else (4.0 if r < c else 12.0)
                total_hrc_combos += hrc_freq * combo_weight
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
                        "deepsolver_freq": hrc_freq,
                        "pmev_freq": pmev_freq,
                        "delta": delta,
                        "strength": hand_strengths[r][c],
                        "action": action,
                    }
                )
            ascii_rows.append(" ".join(row_symbols))

        return {
            "pmev_threshold": round(pmev_threshold, 4),
            "deepsolver_matrix": hrc_matrix,
            "pmev_matrix": pmev_matrix,
            "delta_matrix": delta_matrix,
            "total_deepsolver_combos": round(total_hrc_combos, 2),
            "total_pmev_combos": round(total_pmev_combos, 2),
            "combo_delta": round(total_pmev_combos - total_hrc_combos, 2),
            "expanded_hands_count": len(expanded_hands),
            "contracted_hands_count": len(contracted_hands),
            "expanded_hands": expanded_hands[:10],
            "contracted_hands": contracted_hands[:10],
            "ascii_heatmap": "\n".join(ascii_rows),
            "cells": cells,
        }
