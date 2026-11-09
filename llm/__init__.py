"""LLM -- Camada de inferencia, pools de chaves e roteamento cognitivo."""

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .antigravity_sdk_bridge import (
        AntigravityAgentBridge,
        AntigravityRunResult,
        default_bridge,
        discover_skill_directories,
        load_mcp_servers_from_nucleo,
    )

__all__ = [
    "AntigravityAgentBridge",
    "AntigravityRunResult",
    "default_bridge",
    "discover_skill_directories",
    "load_mcp_servers_from_nucleo",
]


def __getattr__(name: str) -> Any:
    """Carregamento sob demanda para evitar importacao eager do SDK."""
    if name in __all__:
        from . import antigravity_sdk_bridge

        return getattr(antigravity_sdk_bridge, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
