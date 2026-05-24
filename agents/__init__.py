"""
SOTA AGENTS -- Lógica de Agentes e Orquestração de Tarefas.
"""

from .autonomy import apply_god_mode
from .dispatcher import _parse_dispatcher_subtasks_strict
from .execution import execute_task_workflow

__all__ = [
    "_parse_dispatcher_subtasks_strict",
    "execute_task_workflow",
    "apply_god_mode",
]
