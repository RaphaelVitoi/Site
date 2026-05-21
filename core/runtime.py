"""
Exports explicitos de task_executor para sub-modulos.
Populado por task_executor.py durante o startup e em cada hot-reload.

Sub-modulos usam:
    import core.runtime as te
em vez do padrao _get_te() / import task_executor as te.
core.runtime nao importa de task_executor -- sem circularidade.
"""

import asyncio

from pathlib import Path
from typing import Any

import core.config as _config

_RAG_INSTANCE = None


def __getattr__(name: str) -> Any:
    """Delega variaveis de estado (VALID_AGENTS, etc) nativamente para core.config"""
    if hasattr(_config, name):
        return getattr(_config, name)
    if name == "PID_FILE":
        return Path(__file__).parent.parent / ".nexus_worker.pid"
    if name == "SYSTEM_PROMPT_CACHE":
        from llm.budget import SYSTEM_PROMPT_CACHE

        return SYSTEM_PROMPT_CACHE
    raise AttributeError(
        f"module '{__name__}' tem Friccao Zero e delegou a prop "
        f"'{name}', que tambem nao existe no config."
    )


def get_rag() -> Any:
    """Instancia ou retorna o motor RAG em memoria. Thread-safe."""
    # pylint: disable=global-statement
    global _RAG_INSTANCE
    if _RAG_INSTANCE is None:
        from memory_rag import MemoryRAG

        _RAG_INSTANCE = MemoryRAG()
    return _RAG_INSTANCE


async def get_rag_async() -> Any:
    """Instancia ou retorna o motor RAG de forma assincrona."""
    # SOTA: O Singleton e injetado via thread isolada para nao asfixiar o Event Loop principal
    return await asyncio.to_thread(get_rag)


async def start_worker_and_api() -> Any:
    """Inicia o Worker e o Servidor de API."""
    from worker.startup import start_worker_and_api as _start_worker_and_api

    return await _start_worker_and_api()


def _maybe_reload_config() -> bool:
    """Verifica necessidade de hot-reload da config base."""
    return _config.maybe_reload_config()


def _maybe_reload_config_async() -> Any:
    return _config.maybe_reload_config()


def _feature_enabled(flag: str) -> bool:
    return _config.feature_enabled(flag)


def _heuristic_terms(group: str) -> dict[str, int]:
    return _config.heuristic_terms(group)


def _agent_sla_value(agent: str, key: str, default: int) -> int:
    return _config.agent_sla_value(agent, key, default)


def _health_gate_value(key: str, default: Any) -> Any:
    return _config.health_gate_value(key, default)


def _c(agent: str) -> str:
    return _config.get_agent_color(agent)


if __name__ == "__main__":
    import logging
    import sys

    logging.basicConfig(
        level=logging.INFO,
        stream=sys.stdout,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    logging.info("[NEXUS SOTA] Inicializando Master Core Runtime (AioHTTP / Worker)...")
    try:
        asyncio.run(start_worker_and_api())
    except KeyboardInterrupt:
        logging.info("[NEXUS SOTA] Desligamento Gracioso (SIGINT).")
