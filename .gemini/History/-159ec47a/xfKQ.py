"""
Exports explícitos de task_executor para sub-módulos.
Populado por task_executor.py durante o startup e em cada hot-reload.

Sub-módulos usam:
    import core.runtime as te
em vez do padrão _get_te() / import task_executor as te.
core.runtime não importa de task_executor -- sem circularidade.
"""
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

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
get_rag: Callable[[], Any] = lambda: None
get_rag_async: Callable[[], Any] = lambda: None
_maybe_reload_config: Callable[[], bool] = lambda: False
_maybe_reload_config_async: Callable[[], Any] = lambda: False
_feature_enabled: Callable[[str], bool] = lambda flag: False
_heuristic_terms: Callable[[str], Dict[str, int]] = lambda group: {}
_agent_sla_value: Callable[[str, str, int], int] = lambda agent, key, default: default
_health_gate_value: Callable[[str, Any], Any] = lambda key, default: default
_c: Callable[[str], str] = lambda agent: "white"
