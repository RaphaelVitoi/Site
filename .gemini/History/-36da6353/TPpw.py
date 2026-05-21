"""
Exports explícitos de task_executor para sub-módulos.
Populado por task_executor.py durante o startup e em cada hot-reload.

Sub-módulos usam:
    import core.runtime as te
em vez do padrão _get_te() / import task_executor as te.
core.runtime não importa de task_executor -- sem circularidade.
"""
from pathlib import Path
from typing import Any

import core.config as _config


def __getattr__(name: str) -> Any:
    """Delega variaveis de estado (VALID_AGENTS, etc) nativamente para core.config"""
    if hasattr(_config, name):
        return getattr(_config, name)
    if name == "PID_FILE":
        return Path(__file__).parent.parent / ".nexus_worker.pid"
    if name == "SYSTEM_PROMPT_CACHE":
        from llm.budget import SYSTEM_PROMPT_CACHE
        return SYSTEM_PROMPT_CACHE
    raise AttributeError(f"module '{__name__}' tem Friccao Zero e delegou a prop '{name}', que tambem nao existe no config.")

def get_rag() -> Any:
    """Instancia ou retorna o motor RAG em memoria."""
    from memory_rag import MemoryRAG
    if not hasattr(get_rag, "_instance"):
        get_rag._instance = MemoryRAG()
    return get_rag._instance

async def get_rag_async() -> Any:
    return get_rag()

async def start_worker_and_api() -> Any:
    from worker.startup import start_worker_and_api as _start_worker_and_api
    return await _start_worker_and_api()

def _maybe_reload_config() -> bool: return _config.maybe_reload_config()
def _maybe_reload_config_async() -> Any: return _config.maybe_reload_config()
def _feature_enabled(flag: str) -> bool: return _config.feature_enabled(flag)
def _heuristic_terms(group: str) -> dict[str, int]: return _config.heuristic_terms(group)
def _agent_sla_value(agent: str, key: str, default: int) -> int: return _config.agent_sla_value(agent, key, default)
def _health_gate_value(key: str, default: Any) -> Any: return _config.health_gate_value(key, default)
def _c(agent: str) -> str: return _config.get_agent_color(agent)
