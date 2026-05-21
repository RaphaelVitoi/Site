"""
SOTA AGENTS -- Lógica de Agentes e Orquestração de Tarefas.
"""

from .dispatcher import _parse_dispatcher_subtasks_strict
from .execution import execute_task_workflow
from .autonomy import apply_god_mode

__all__ = [
    "_parse_dispatcher_subtasks_strict",
    "execute_task_workflow",
    "apply_god_mode",
]
