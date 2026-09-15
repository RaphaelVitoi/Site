"""Pipeline Tripartite PMev (Perspectiva Matematica) SOTA v8.0 GOLD.

Formalismo e Contratos: `pmev-game-theory-engine` & `Site/CLAUDE.md`.

Separacao Canonica de Responsabilidades Computacionais:
  - Camada 1: Parsing e Extracao Estruturada (Gemini 3.5 Flash-Lite / JSON Schema)
  - Camada 2: Computacao Matricial e Equidades Deterministicas (Motor Local / Rust / Python)
  - Camada 3: Auditoria Qualitativa de Teoria dos Jogos e Hipoteses de Vitoi (Gemini 3.6 / 3.7 Flash)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
from numpy.typing import NDArray

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_operators import (
    OperatorF1Baseline,
    OperatorF2Temporal,
    OperatorF3Behavioral,
    OperatorF4Absorption,
    OperatorF5Functional,
    PMevCompositionResult,
)
from engine.pmev_spec import AbsorptionState, Measured, TournamentState
from llm.free_router import SOTAUnifiedFreeRouter

logger = logging.getLogger(__name__)

# Constantes combinatorias Texas Hold'em
TOTAL_HOLDEM_COMBOS = 1326
RANKS = "AKQJT98765432"


@dataclass(slots=True)
class PMevLocalAnalysis:
    """Resultado deterministico computado pela Camada 2 local."""

    stacks: list[float]
    payouts: list[float]
    base_icm_ev: list[float]
    total_chips: float
    bubble_factor_matrix: list[list[float]] | None = None


@dataclass(slots=True)
class PMevSynthesisReport:
    """Relatorio final sintetizado integrando dados locais e analise conceitual da Camada 3."""

    local_analysis: PMevLocalAnalysis
    synthesis_markdown: str
    provider: str
    model: str


class PMevTripartitePipeline:
    """Orquestrador tripartite PMev com isolamento de calculo e arbitragem teorica."""

    def __init__(self, free_router: SOTAUnifiedFreeRouter | None = None) -> None:
        self.router = free_router or SOTAUnifiedFreeRouter()

    # --------------------------------------------------------------------------
    # CAMADA 1: Extracao e Sanitizacao de Estado
    # --------------------------------------------------------------------------
    def normalize_state(self, stacks: list[float], payouts: list[float]) -> TournamentState:
        """Cria o TournamentState validando invariantes deterministicas."""
        return TournamentState(stacks=tuple(stacks), payouts=tuple(payouts))

    # --------------------------------------------------------------------------
    # CAMADA 2: Computacao Deterministica Local (Zero Tokens)
    # --------------------------------------------------------------------------
    def compute_local_deterministic_layer(self, state: TournamentState) -> PMevLocalAnalysis:
        """Executa Malmuth-Harville e extracao de superficies sem gastar tokens de IA."""
        stacks_list = list(state.stacks)
        payouts_list = list(state.payouts)

        # Baseline deterministico ICMev
        ev = calculate_malmuth_harville_icm(stacks_list, payouts_list)
        total_chips = sum(stacks_list)

        # Matriz simplificada de Bubble Factor pairwise
        n = len(stacks_list)
        bf_matrix: list[list[float]] = [[1.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j and stacks_list[i] > 0 and stacks_list[j] > 0:
                    s_eff = min(stacks_list[i], stacks_list[j])
                    # Simulacao de vitoria
                    stacks_win = list(stacks_list)
                    stacks_win[i] += s_eff
                    stacks_win[j] -= s_eff
                    ev_win = calculate_malmuth_harville_icm(stacks_win, payouts_list)[i] - ev[i]

                    # Simulacao de derrota
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
        """Valida deterministicamente a integridade combinatoria de uma matriz de ranges (13x13).

        - 13 pares x 6 combos = 78 combos
        - 78 maos suited x 4 combos = 312 combos
        - 78 maos offsuit x 12 combos = 936 combos
        Total canonico: 1.326 combinacoes.
        Execucao puramente local em Python (zero tokens de IA).
        """
        active_combos = 0.0
        invalid_hands: list[str] = []

        for hand, weight in range_spec.items():
            if not 0.0 <= weight <= 1.0:
                raise ValueError(f"Peso invalido para mao {hand}: {weight}. Deve estar entre 0.0 e 1.0.")

            hand = hand.strip()
            if len(hand) == 2 and hand[0] == hand[1] and hand[0] in RANKS:
                # Pocket Pair (ex: AA, KK) -> 6 combinacoes
                active_combos += 6.0 * weight
            elif len(hand) == 3 and hand[0] in RANKS and hand[1] in RANKS and hand[0] != hand[1]:
                suit_type = hand[2].lower()
                if suit_type == "s":
                    # Suited (ex: AKs) -> 4 combinacoes
                    active_combos += 4.0 * weight
                elif suit_type == "o":
                    # Offsuit (ex: AKo) -> 12 combinacoes
                    active_combos += 12.0 * weight
                else:
                    invalid_hands.append(hand)
            else:
                invalid_hands.append(hand)

        if invalid_hands:
            raise ValueError(f"Formato de mao invalido: {invalid_hands}")

        coverage_pct = round((active_combos / TOTAL_HOLDEM_COMBOS) * 100.0, 2)
        return {
            "total_combos_weighted": round(active_combos, 2),
            "max_possible_combos": TOTAL_HOLDEM_COMBOS,
            "range_coverage_pct": coverage_pct,
            "is_valid": True,
        }

    # --------------------------------------------------------------------------
    # CAMADA 3: Auditoria Teorica das Hipoteses de Vitoi (Gemini 3.6 / 3.7 Flash)
    # --------------------------------------------------------------------------
    async def synthesize_theoretical_perspective(
        self,
        local_data: PMevLocalAnalysis,
        hero_index: int = 0,
        strategic_notes: str = "",
        complexity_score: int = 4,
    ) -> PMevSynthesisReport:
        """Emprega o modelo gratuito correspondente a complexidade para interpretar a assimetria estrategica.

        Os dados numericos sao passados como premissas axiomaticas imutaveis.
        """
        system_instruction = (
            "Voce e o auditor de teoria dos jogos do projeto PMev. "
            "Trate os numeros de equidade e Bubble Factor recebidos como verdades axiomaticas "
            "calculadas pelo motor local (Rust/Python). NUNCA recalcule ou contradiga os valores numericos. "
            "Sua tarefa e avaliar as hipoteses conceituais de Raphael Vitoi:\n"
            "1. Monotonicidade de EV-Fold sob a pressao do blind e profundidade efetiva;\n"
            "2. Dinamica do Ganho do Espectador em confrontos entre viloes;\n"
            "3. Isometria Posicional e custo de assimetria de utilidade.\n"
            "Responda de forma analitica, densa e concisa."
        )

        prompt = (
            f"DADOS NUMERICOS AXIOMATICOS DO TORNEIO:\n"
            f"- Stacks: {local_data.stacks}\n"
            f"- Payouts: {local_data.payouts}\n"
            f"- $EV Base (Malmuth-Harville): {local_data.base_icm_ev}\n"
            f"- Hero Index: {hero_index} (Stack: {local_data.stacks[hero_index]})\n"
            f"- Matriz Pairwise de Bubble Factor (Hero linha {hero_index}): {local_data.bubble_factor_matrix[hero_index] if local_data.bubble_factor_matrix else 'N/A'}\n"
            f"- Notas Estrategicas: {strategic_notes or 'Sem notas adicionais'}\n\n"
            "Solicitacao: Sintetize a Perspectiva Matematica (PMev) para as decisoes do Hero neste spot."
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


class PMevCompositionalPipeline:
    """Pipeline composicional refutavel de seis operadores (f1 a f5).

    Garante:
    1. Contracao espectral rho(J_global) <= 1.0.
    2. Particionamento exato de Bellman na barreira absorvente sem dupla contagem.
    3. Suporte a ablacao camada por camada para quantificacao de residuos.
    """

    def __init__(
        self,
        risk_aversion: float = 0.88,
        regularization_lambda: float = 0.1,
        dirichlet_alpha: float = 1.0,
    ) -> None:
        self.risk_aversion = risk_aversion
        self.reg_lambda = regularization_lambda
        self.dirichlet_alpha = dirichlet_alpha

    def evaluate(
        self,
        state: TournamentState,
        time_to_blind_minutes: float = 15.0,
        orbit_cost_bb: float = 2.5,
        p_ruin_vector: tuple[float, ...] | None = None,
        absorption_states: tuple[AbsorptionState, ...] | None = None,
        initial_covariance: NDArray[np.float64] | None = None,
    ) -> Measured[PMevCompositionResult]:
        """Executa a cadeia compositiva f1 -> f2 -> f3 -> f4 -> f5 com proveniencia e bounds."""
        stacks_arr = np.array(state.stacks, dtype=np.float64)
        n = len(stacks_arr)

        if p_ruin_vector is None:
            p_ruin_vector = tuple(0.0 for _ in range(n))
        if any(p > 0 for p in p_ruin_vector):
            # Medido em 2026-09-13: f4 recebe aqui a equidade INCONDICIONAL, que ja embute a
            # chance de quebrar. Com ruina positiva a cadeia a contava duas vezes (86,27 contra
            # 106,23 T$ exatos). Ramos materializados: pmev_composition.all_in_branch_values.
            raise ValueError(
                "f4 com ruina positiva exige valor de continuacao CONDICIONAL a sobreviver; esta cadeia "
                "entrega equidade incondicional. Use pmev_composition.all_in_branch_values."
            )
        if absorption_states is None:
            # Quem quebra agora termina em n-esimo. O default antigo dava ao jogador i o premio
            # da posicao i, e a ruina elevava o heroi de 127,01 para 160,11 T$.
            terminal = state.payouts[n - 1] if len(state.payouts) >= n else 0.0
            absorption_states = tuple(AbsorptionState(place=n, payout=terminal) for _ in range(n))

        f1 = OperatorF1Baseline(payouts=state.payouts)
        f2 = OperatorF2Temporal(
            time_to_blind_jump_minutes=time_to_blind_minutes,
            orbit_cost_bb=orbit_cost_bb,
        )
        f3 = OperatorF3Behavioral(
            risk_aversion_factor=self.risk_aversion,
            regularization_lambda=self.reg_lambda,
            dirichlet_alpha=self.dirichlet_alpha,
        )
        f4 = OperatorF4Absorption(
            p_ruin_vector=p_ruin_vector,
            absorption_states=absorption_states,
        )
        f5 = OperatorF5Functional(operators=(f1, f2, f3, f4))

        return f5.evaluate_chain(
            initial_stacks=stacks_arr,
            initial_covariance=initial_covariance,
        )

    def evaluate_ablation(
        self,
        state: TournamentState,
        disabled_operators: frozenset[str] = frozenset(),
        time_to_blind_minutes: float = 15.0,
        orbit_cost_bb: float = 2.5,
    ) -> dict[str, Any]:
        """Executa ablacao estrutural desativando operadores especificos (ex: f2, f3, f4)."""
        stacks_arr = np.array(state.stacks, dtype=np.float64)
        f1 = OperatorF1Baseline(payouts=state.payouts)
        x = f1.forward(stacks_arr)
        trace: dict[str, list[float]] = {"f1_icm": [float(v) for v in x]}

        if "f2" not in disabled_operators:
            f2 = OperatorF2Temporal(time_to_blind_minutes, orbit_cost_bb)
            x = f2.forward(x)
            trace["f2_temporal"] = [float(v) for v in x]

        if "f3" not in disabled_operators:
            f3 = OperatorF3Behavioral(self.risk_aversion, self.reg_lambda, self.dirichlet_alpha)
            x = f3.forward(x)
            trace["f3_behavioral"] = [float(v) for v in x]

        if "f4" not in disabled_operators:
            # A ablacao antiga aplicava ruina 0,05 sobre a equidade incondicional (dupla contagem)
            # com payout terminal por indice. Absorcao exige ramos materializados.
            raise ValueError(
                "f4 nao entra na ablacao sem estados de ramo; desative-o ou use pmev_composition.all_in_branch_values."
            )

        return {
            "final_vector": [float(v) for v in x],
            "trace": trace,
            "disabled_operators": sorted(disabled_operators),
        }
