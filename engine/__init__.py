"""
SOTA ENGINE -- Motores de Inteligencia, Matematica e Linguagem.

A API publica e carregada sob demanda (PEP 562). Ate 2026-09-17 este arquivo importava todos os submodulos em
cascata, e qualquer `import engine.<submodulo>` pagava o pacote inteiro.

Medido em 2026-09-17 com `psutil.Process().memory_info()`, e a metrica importa: a cascata completa custa 64 MB de
working set e **527 MB de memoria privada** (commit). O gargalo desta maquina e commit, nao RAM fisica, de modo que
so a segunda medida descreve o problema -- pelo working set o custo pareceria irrelevante. Com a carga preguicosa,
`import engine.jules_bridge`, que so usa a biblioteca padrao, cai para 16 MB de privada contra 10 MB de um Python
vazio. Contrato em tests/test_engine_importacao_preguicosa.py.
"""

from __future__ import annotations

import importlib
from typing import TYPE_CHECKING, Any

# nome publico -> submodulo que o define
_ORIGEM: dict[str, str] = {
    **dict.fromkeys(("build_likelihood_matrix", "update_posterior"), "engine.bayesian_range"),
    **dict.fromkeys(
        (
            "ChenAKQGameSolver",
            "ChenClairvoyanceSolver",
            "ChenIndifferenceCalculator",
            "JandaGeometricBetSizing",
            "JandaMDFCalculator",
            "JandaStreetBluffValueRatio",
        ),
        "engine.canonical_poker_theory",
    ),
    **dict.fromkeys(("apply_god_mode", "get_agent_system_prompt", "get_rag", "process_agent_task"), "engine.cognitive"),
    **dict.fromkeys(
        (
            "CFRPlusEngine",
            "ClaudicoActionTranslator",
            "ContinualResolvingEngine",
            "DeepStackSubgame",
            "GrowingTreeCFRSolver",
            "GrowingTreeNode",
            "PluribusDepthLimitedSolver",
            "PluribusMultiwayState",
            "PotentialAwareAbstraction",
            "PublicBeliefState",
            "PUCTNode",
            "PUCTPerspectiveSelector",
            "Street",
        ),
        "engine.game_theory_solvers",
    ),
    "call_llm_api": "engine.llm_api",
    "calculate_rio_risk": "engine.math_rio",
    **dict.fromkeys(
        ("calculate_geometric_sizing", "calculate_rio_tension", "solve_icm_distortion_v2"), "engine.math_sota"
    ),
    **dict.fromkeys(
        (
            "CfrConvergenceForecast",
            "OpponentDriftForecast",
            "TimesFMEngine",
            "forecast_bankroll_trajectory",
            "forecast_cfr_convergence",
            "forecast_opponent_drift",
            "forecast_pmev_risk_dynamics",
        ),
        "engine.timesfm_engine",
    ),
}

__all__ = [
    "solve_icm_distortion_v2",
    "calculate_geometric_sizing",
    "calculate_rio_tension",
    "calculate_rio_risk",
    "update_posterior",
    "build_likelihood_matrix",
    "apply_god_mode",
    "get_rag",
    "get_agent_system_prompt",
    "process_agent_task",
    "call_llm_api",
    "PotentialAwareAbstraction",
    "ClaudicoActionTranslator",
    "DeepStackSubgame",
    "ContinualResolvingEngine",
    "CFRPlusEngine",
    "PluribusMultiwayState",
    "PluribusDepthLimitedSolver",
    "PUCTNode",
    "PUCTPerspectiveSelector",
    "GrowingTreeNode",
    "GrowingTreeCFRSolver",
    "PublicBeliefState",
    "Street",
    "ChenClairvoyanceSolver",
    "ChenAKQGameSolver",
    "ChenIndifferenceCalculator",
    "JandaMDFCalculator",
    "JandaGeometricBetSizing",
    "JandaStreetBluffValueRatio",
    "TimesFMEngine",
    "CfrConvergenceForecast",
    "OpponentDriftForecast",
    "forecast_cfr_convergence",
    "forecast_opponent_drift",
    "forecast_bankroll_trajectory",
    "forecast_pmev_risk_dynamics",
]


def __getattr__(nome: str) -> Any:
    modulo = _ORIGEM.get(nome)
    if modulo is None:
        raise AttributeError(f"module 'engine' has no attribute {nome!r}")
    valor = getattr(importlib.import_module(modulo), nome)
    globals()[nome] = valor
    return valor


def __dir__() -> list[str]:
    return sorted(set(globals()) | set(__all__))


if TYPE_CHECKING:  # analisadores estaticos enxergam a API sem pagar a importacao em runtime
    from .bayesian_range import build_likelihood_matrix, update_posterior
    from .canonical_poker_theory import (
        ChenAKQGameSolver,
        ChenClairvoyanceSolver,
        ChenIndifferenceCalculator,
        JandaGeometricBetSizing,
        JandaMDFCalculator,
        JandaStreetBluffValueRatio,
    )
    from .cognitive import apply_god_mode, get_agent_system_prompt, get_rag, process_agent_task
    from .game_theory_solvers import (
        CFRPlusEngine,
        ClaudicoActionTranslator,
        ContinualResolvingEngine,
        DeepStackSubgame,
        GrowingTreeCFRSolver,
        GrowingTreeNode,
        PluribusDepthLimitedSolver,
        PluribusMultiwayState,
        PotentialAwareAbstraction,
        PublicBeliefState,
        PUCTNode,
        PUCTPerspectiveSelector,
        Street,
    )
    from .llm_api import call_llm_api
    from .math_rio import calculate_rio_risk
    from .math_sota import calculate_geometric_sizing, calculate_rio_tension, solve_icm_distortion_v2
    from .timesfm_engine import (
        CfrConvergenceForecast,
        OpponentDriftForecast,
        TimesFMEngine,
        forecast_bankroll_trajectory,
        forecast_cfr_convergence,
        forecast_opponent_drift,
        forecast_pmev_risk_dynamics,
    )
