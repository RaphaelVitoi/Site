"""LLM -- Camada de inferencia, pools de chaves e roteamento cognitivo."""

import importlib
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .antigravity_sdk_bridge import (  # pyrefly: ignore[missing-import]
        LOCAL_OPTIMIZED_MODELS,
        AntigravityAgentBridge,
        AntigravityRunResult,
        default_bridge,
        discover_skill_directories,
        fetch_ollama_runtime_status,
        load_mcp_servers_from_nucleo,
        resolve_local_model_tag,
        warmup_local_model,
    )

__all__ = [
    "LOCAL_OPTIMIZED_MODELS",
    "AntigravityAgentBridge",
    "AntigravityRunResult",
    "default_bridge",
    "discover_skill_directories",
    "fetch_ollama_runtime_status",
    "load_mcp_servers_from_nucleo",
    "resolve_local_model_tag",
    "warmup_local_model",
]


def __getattr__(name: str) -> Any:
    """Carregamento sob demanda para evitar importacao eager do SDK."""
    if name in __all__:
        module = importlib.import_module(".antigravity_sdk_bridge", __name__)
        return getattr(module, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
