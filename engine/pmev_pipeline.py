"""Pipeline Tripartite PMev (Perspectiva Matemática) SOTA v8.0 GOLD.

Formalismo e Contratos: `pmev-game-theory-engine` & `Site/CLAUDE.md`.

Separação Canônica de Responsabilidades Computacionais:
  - Camada 1: Parsing e Extração Estruturada (Gemini 3.5 Flash-Lite / JSON Schema)
  - Camada 2: Computação Matricial e Equidades Determinísticas (Motor Local / Rust / Python)
  - Camada 3: Auditoria Qualitativa de Teoria dos Jogos e Hipóteses de Vitoi (Gemini 3.6 / 3.7 Flash)
"""

from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from typing import Any

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_spec import TournamentState
from llm.free_router import SOTAUnifiedFreeRouter

logger = logging.getLogger(__name__)

# Constantes combinatórias Texas Hold'em
TOTAL_HOLDEM_COMBOS = 1326
RANKS = "AKQJT98765432"


@dataclass(slots=True)
class PMevLocalAnalysis:
    """Resultado determinístico computado pela Camada 2 local."""

    stacks: list[float]
    payouts: list[float]
    base_icm_ev: list[float]
    total_chips: float
    bubble_factor_matrix: list[list[float]] | None = None


@dataclass(slots=True)
class PMevSynthesisReport:
    """Relatório final sintetizado integrando dados locais e análise conceitual da Camada 3."""

    local_analysis: PMevLocalAnalysis
    synthesis_markdown: str
    provider: str
    model: str


class PMevTripartitePipeline:
    """Orquestrador tripartite PMev com isolamento de cálculo e arbitragem teórica."""

    def __init__(self, free_router: SOTAUnifiedFreeRouter | None = None) -> None:
        self.router = free_router or SOTAUnifiedFreeRouter()

    # --------------------------------------------------------------------------
    # CAMADA 1: Extração e Sanitização de Estado
    # --------------------------------------------------------------------------
    def normalize_state(self, stacks: list[float], payouts: list[float]) -> TournamentState:
        """Cria o TournamentState validando invariantes determinísticas."""
        return TournamentState(stacks=tuple(float(s) for s in stacks), payouts=tuple(float(p) for p in payouts))

    # --------------------------------------------------------------------------
    # CAMADA 2: Computação Determinística Local (Zero Tokens)
    # --------------------------------------------------------------------------
    def compute_local_deterministic_layer(self, state: TournamentState) -> PMevLocalAnalysis:
        """Executa Malmuth-Harville e extração de superfícies sem gastar tokens de IA."""
        stacks_list = list(state.stacks)
        payouts_list = list(state.payouts)

        # Baseline determinístico ICMev
        ev = calculate_malmuth_harville_icm(stacks_list, payouts_list)
        total_chips = sum(stacks_list)

        # Matriz simplificada de Bubble Factor pairwise
        n = len(stacks_list)
        bf_matrix: list[list[float]] = [[1.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j and stacks_list[i] > 0 and stacks_list[j] > 0:
                    s_eff = min(stacks_list[i], stacks_list[j])
                    # Simulação de vitória
                    stacks_win = list(stacks_list)
                    stacks_win[i] += s_eff
                    stacks_win[j] -= s_eff
                    ev_win = calculate_malmuth_harville_icm(stacks_win, payouts_list)[i] - ev[i]

                    # Simulação de derrota
                    stacks_lose = list(stacks_list)
                    stacks_lose[i] -= s_eff
                    stacks_lose[j] += s_eff
                    ev_lose = ev[i] - calculate_malmuth_harville_icm(stacks_lose, payouts_list)[i]

                    bf_matrix[i][j] = round(ev_lose / ev_win, 4) if ev_win > 0 else 1.0

        return PMevLocalAnalysis(
            stacks=stacks_list,
            payouts=payouts_list,
            base_icm_ev=[round(val, 4) for val in ev],
            total_chips=total_chips,
            bubble_factor_matrix=bf_matrix,
        )

    @staticmethod
    def validate_range_matrix(range_spec: dict[str, float]) -> dict[str, Any]:
        """Valida deterministicamente a integridade combinatória de uma matriz de ranges (13x13).

        - 13 pares x 6 combos = 78 combos
        - 78 mãos suited x 4 combos = 312 combos
        - 78 mãos offsuit x 12 combos = 936 combos
        Total canônico: 1.326 combinações.
        Execução puramente local em Python (zero tokens de IA).
        """
        active_combos = 0.0
        invalid_hands: list[str] = []

        for hand, weight in range_spec.items():
            if not (0.0 <= weight <= 1.0):
                raise ValueError(f"Peso inválido para mão {hand}: {weight}. Deve estar entre 0.0 e 1.0.")

            hand = hand.strip()
            if len(hand) == 2 and hand[0] == hand[1] and hand[0] in RANKS:
                # Pocket Pair (ex: AA, KK) -> 6 combinações
                active_combos += 6.0 * weight
            elif len(hand) == 3 and hand[0] in RANKS and hand[1] in RANKS and hand[0] != hand[1]:
                suit_type = hand[2].lower()
                if suit_type == "s":
                    # Suited (ex: AKs) -> 4 combinações
                    active_combos += 4.0 * weight
                elif suit_type == "o":
                    # Offsuit (ex: AKo) -> 12 combinações
                    active_combos += 12.0 * weight
                else:
                    invalid_hands.append(hand)
            else:
                invalid_hands.append(hand)

        if invalid_hands:
            raise ValueError(f"Formato de mão inválido: {invalid_hands}")

        coverage_pct = round((active_combos / TOTAL_HOLDEM_COMBOS) * 100.0, 2)
        return {
            "total_combos_weighted": round(active_combos, 2),
            "max_possible_combos": TOTAL_HOLDEM_COMBOS,
            "range_coverage_pct": coverage_pct,
            "is_valid": True,
        }

    # --------------------------------------------------------------------------
    # CAMADA 3: Auditoria Teórica das Hipóteses de Vitoi (Gemini 3.6 / 3.7 Flash)
    # --------------------------------------------------------------------------
    async def synthesize_theoretical_perspective(
        self,
        local_data: PMevLocalAnalysis,
        hero_index: int = 0,
        strategic_notes: str = "",
        complexity_score: int = 4,
    ) -> PMevSynthesisReport:
        """Emprega o modelo gratuito correspondente à complexidade para interpretar a assimetria estratégica.

        Os dados numéricos são passados como premissas axiomáticas imutáveis.
        """
        system_instruction = (
            "Você é o auditor de teoria dos jogos do projeto PMev. "
            "Trate os números de equidade e Bubble Factor recebidos como verdades axiomáticas "
            "calculadas pelo motor local (Rust/Python). NUNCA recalcule ou contradiga os valores numéricos. "
            "Sua tarefa é avaliar as hipóteses conceituais de Raphael Vitoi:\n"
            "1. Monotonicidade de EV-Fold sob a pressão do blind e profundidade efetiva;\n"
            "2. Dinâmica do Ganho do Espectador em confrontos entre vilões;\n"
            "3. Isometria Posicional e custo de assimetria de utilidade.\n"
            "Responda de forma analítica, densa e concisa."
        )

        prompt = (
            f"DADOS NUMÉRICOS AXIOMÁTICOS DO TORNEIO:\n"
            f"- Stacks: {local_data.stacks}\n"
            f"- Payouts: {local_data.payouts}\n"
            f"- $EV Base (Malmuth-Harville): {local_data.base_icm_ev}\n"
            f"- Hero Index: {hero_index} (Stack: {local_data.stacks[hero_index]})\n"
            f"- Matriz Pairwise de Bubble Factor (Hero linha {hero_index}): {local_data.bubble_factor_matrix[hero_index] if local_data.bubble_factor_matrix else 'N/A'}\n"
            f"- Notas Estratégicas: {strategic_notes or 'Sem notas adicionais'}\n\n"
            "Solicitação: Sintetize a Perspectiva Matemática (PMev) para as decisões do Hero neste spot."
        )

        response = await self.router.execute_by_complexity(
            prompt=prompt,
            system_instruction=system_instruction,
            complexity_score=complexity_score,
        )

        return PMevSynthesisReport(
            local_analysis=local_data,
            synthesis_markdown=response.get("output", ""),
            provider=response.get("provider", "unknown"),
            model=response.get("model", "unknown"),
        )
