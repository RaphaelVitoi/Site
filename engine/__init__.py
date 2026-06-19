"""
SOTA ENGINE -- Motores de Inteligencia, Matematica e Linguagem.
"""

from .bayesian_range import build_likelihood_matrix, update_posterior
from .cognitive import (
    apply_god_mode,
    get_agent_system_prompt,
    get_rag,
    process_agent_task,
)
from .llm_api import call_llm_api
from .math_rio import calculate_rio_risk
from .math_sota import (
    calculate_geometric_sizing,
    calculate_rio_tension,
    solve_icm_distortion_v2,
)

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
]
