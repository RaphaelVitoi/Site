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
RAG_IGNORE_PATTERNS: List[str] = []
HANDOFF_PIPELINE: Dict = {}
PID_FILE: Optional[Path] = None

# Funções -- referências preenchidas no startup de task_executor.py
get_rag: Optional[Callable] = None
_maybe_reload_config: Optional[Callable] = None
_feature_enabled: Optional[Callable] = None
_heuristic_terms: Optional[Callable] = None
_agent_sla_value: Optional[Callable] = None
_health_gate_value: Optional[Callable] = None
_c: Optional[Callable] = None
