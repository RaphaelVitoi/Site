"""
SOTA ENGINE -- Motores de Inteligencia, Matematica e Linguagem.
"""

from .math_sota import (
    solve_icm_distortion_v2,
    calculate_geometric_sizing,
    calculate_rio_tension,
)
from .math_rio import calculate_rio_risk
from .bayesian_range import update_posterior, build_likelihood_matrix
from .cognitive import (
    apply_god_mode,
    get_rag,
    get_agent_system_prompt,
    process_agent_task,
)
from .llm_api import call_llm_api

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
