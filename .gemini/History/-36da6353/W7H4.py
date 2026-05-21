"""
Exports explícitos de task_executor para sub-módulos.
Populado por task_executor.py durante o startup e em cada hot-reload.

Sub-módulos usam:
    import core.runtime as te
em vez do padrão _get_te() / import task_executor as te.
core.runtime não importa de task_executor -- sem circularidade.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Variáveis de estado -- atualizadas pelo hot-reload em task_executor.py
VALID_AGENTS: List[str] = []
OPENROUTER_ALTERNATIVE_MODELS: Tuple = ()
AGENTS_MANIFEST: Dict = {}
AGENT_COLOR_MAP: Dict = {}
AGENT_ROUTING_MAP: Dict = {}
DEEP_THINKING_MODELS: Tuple = ()
FAST_OPERATIONS_MODELS: Tuple = ()
SYSTEM_PROMPT_CACHE: Dict = {}
TECHNICAL_AGENTS: Tuple = ()
SYSTEM_CONFIG: Dict = {}
HEURISTIC_THRESHOLD: float = 2.0
HANDOFF_PIPELINE: Dict = {}
PID_FILE: Optional[Path] = None

# Funções -- referências preenchidas no startup de task_executor.py
# SOTA: Tipagem estrita com implementações seguras (No-Op) para blindar a análise estática (Pylance)
def get_rag() -> Any: return None
def get_rag_async() -> Any: return None
def _maybe_reload_config() -> bool: return False
def _maybe_reload_config_async() -> Any: return False
def _feature_enabled(flag: str) -> bool: return False
def _heuristic_terms(group: str) -> Dict[str, int]: return {}
def _agent_sla_value(agent: str, key: str, default: int) -> int: return default
def _health_gate_value(key: str, default: Any) -> Any: return default
def _c(agent: str) -> str: return "white"
