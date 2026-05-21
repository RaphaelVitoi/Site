import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from rich.console import Console
from rich.logging import RichHandler

# SOTA 8.0: Importa o novo cerebro de arbitragem
import core.config as _core_config
from core.schemas import Task
from database.queue_manager import QueueManager

# Constants for SonarLint compliance
MODEL_GEMINI_FLASH = "gemini-2.0-flash"
AGENT_MAVERICK = "@maverick"
AGENT_CHICO = "@chico"
AGENT_IMPLEMENTOR = "@implementor"
AGENT_DISPATCHER = "@dispatcher"

# Configuracao estetica e persistente de Log (Estado da Arte)
console = Console()
log_dir = Path(".claude/logs")
log_dir.mkdir(parents=True, exist_ok=True)
archive_dir = Path(".claude/.archive")
archive_dir.mkdir(parents=True, exist_ok=True)
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logger = logging.getLogger()
logger.setLevel(getattr(logging, log_level, logging.INFO))
logger.propagate = False

# SOTA: Garante que os handlers nao sejam duplicados em reloads do worker
if not logger.handlers:
    rich_handler = RichHandler(
        console=console,
        rich_tracebacks=True,
        markup=True,
        show_path=False,
        tracebacks_show_locals=False,  # [SEC] Desabilitado para evitar vazamento de API Keys (locals dump)
    )
    rich_handler.setFormatter(logging.Formatter("%(message)s", datefmt="[%X]"))
    logger.addHandler(rich_handler)

    import logging.handlers

    rotating_handler = logging.handlers.RotatingFileHandler(
        log_dir / "task_executor.log",
        maxBytes=1024 * 1024 * 10,
        backupCount=10,
        encoding="utf-8",
    )
    rotating_handler.setFormatter(
        logging.Formatter(
            "%(asctime)s - [%(levelname)s] - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )
    )
    logger.addHandler(rotating_handler)

DO_PS1_PATH = Path(__file__).parent.resolve() / "do.ps1"
DO_PS1_THRESHOLD = int(os.environ.get("DO_PS1_THRESHOLD", "5"))

# ==========================================
# 1. SCHEMAS E ROTEAMENTO BASE SOTA
# ==========================================
# Fonte centralizada em core/config.py - Reduzimos o engessamento e amarramos
# todos os sub-modulos ao Hot-Reload nativo e blindado do Kernel.
_c = _core_config.get_agent_color


def _apply_routing_heuristics(desc_lower: str) -> tuple[str | None, int]:
    """Despacho padronizado SOTA (Data-Driven via config.json)."""
    fallback_cfg = _core_config.SYSTEM_CONFIG.get("dispatcher_fallback_config", {})
    injections = fallback_cfg.get("conditional_injections", [])

    for inj in sorted(injections, key=lambda x: x.get("position", 99)):
        gate = inj.get("gate")
        if gate and not _core_config.feature_enabled(gate):
            continue

        group_name = inj.get("heuristic", "")
        terms = _core_config.heuristic_terms(group_name)
        if not terms:
            continue

        score = sum(weight for term, weight in terms.items() if term in desc_lower)
        if score >= _core_config.HEURISTIC_THRESHOLD:
            target = inj.get("agent")
            logger.info(
                f"[ROUTING SOTA] Heuristica de '{group_name}' atingida (score: {score}). Roteando proativamente para {target}."
            )
            return target, score

    return None, 0


# SOTA: Roteamento Semântico e Auto-Escalonamento
def _intelligent_route_task(
    description: str, explicit_agent: str | None = None
) -> tuple[str, dict[str, Any]]:
    """
    Intercepta o roteamento para aplicar a Lei da Fricção Zero.
    """
    metadata = {}

    # SOTA: Avaliacao preguicosa (Lazy Evaluation) para contencao de alocacao desnecessaria
    # FIX: A Hierarquia Absoluta e inviolavel. O Tier 1 (@chico) nao sofre downgrade por complexidade.
    if explicit_agent not in [
        AGENT_DISPATCHER,
        "@architect",
        AGENT_MAVERICK,
        AGENT_CHICO,
    ]:
        complexity_score = len(description.split())
        is_epic = any(
            keyword in description.lower()
            for keyword in [
                "epico",
                "sistema inteiro",
                "arquitetura",
                "refatorar tudo",
                "modulo completo",
            ]
        )
        if complexity_score > 150 or is_epic:
            logger.warning(
                f"[ROUTING SOTA] Tarefa muito complexa detectada ({complexity_score} palavras). Interceptando e roteando para {AGENT_DISPATCHER} com {AGENT_MAVERICK} de observador."
            )
            metadata["observers"] = [AGENT_MAVERICK]
            return AGENT_DISPATCHER, metadata

    if not explicit_agent or explicit_agent not in _core_config.VALID_AGENTS:
        desc_lower = description.lower()
        heuristic_agent, heuristic_score = _apply_routing_heuristics(desc_lower)
        if heuristic_agent:
            metadata["heuristic_score"] = heuristic_score
            return heuristic_agent, metadata

    if explicit_agent == AGENT_IMPLEMENTOR:
        desc_lower = description.lower()
        frontend_terms = _core_config.heuristic_terms("web_infra_terms")
        frontend_score = sum(
            weight for term, weight in frontend_terms.items() if term in desc_lower
        )
        if frontend_score >= _core_config.HEURISTIC_THRESHOLD:
            metadata.setdefault("observers", []).append("@curator")
            logger.info(
                f"[ROUTING SOTA] Front-end detectado (score {frontend_score}). Anexando @curator como Sentinela Estético."
            )

    if explicit_agent and explicit_agent in _core_config.VALID_AGENTS:
        return explicit_agent, metadata

    return AGENT_DISPATCHER, metadata


# Cold start: garante que o state manager leu do disco pelo menos uma vez
_core_config.maybe_reload_config()


# ==========================================
# YIELD DINAMICO E CONTROLE DE FILA SOTA
# ==========================================
class DynamicYieldManager:
    """
    Implementa a sugestao do @sequenciador:
    Yield dinamico para tarefas que falham repetidamente por dependencias lentas.
    Usa backoff exponencial e alerta o @chico em caso de starvation/deadlock.
    """

    def __init__(self):
        self.blocked_tasks: dict[str, int] = {}
        self.max_yield_seconds = 300.0  # 5 minutos de teto

    async def apply_yield(self, task: Task, manager: QueueManager) -> float:
        attempts = self.blocked_tasks.get(task.id, 0) + 1
        self.blocked_tasks[task.id] = attempts

        # Backoff exponencial SOTA: 2^attempts, limitado ao max_yield_seconds
        yield_time = min(float(2**attempts), self.max_yield_seconds)

        logger.info(
            f"[[{_c(task.agent)}]{task.agent}[/]] Yield Dinamico ativado para {task.id}. Aguardando dependencias por {yield_time}s (Tentativa {attempts})."
        )

        # Se atingiu o teto e continua bloqueada, aciona o @chico (Arbitragem de Deadlock)
        if yield_time >= self.max_yield_seconds and attempts % 3 == 0:
            logger.warning(
                f"[STARVATION] Tarefa {task.id} em deadlock aparente. Acionando @chico para intervencao."
            )
            alert_task = Task(
                id=f"DEADLOCK-{int(time.time())}",
                description=f"A tarefa {task.id} (Agente: {task.agent}) esta sofrendo starvation devido a dependencias lentas ou nao resolvidas (Tentativa {attempts}). Arbitrar fila e resolver possivel deadlock.",
                agent="@chico",
                status="pending",
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"priority": "high", "blocked_task": task.id},
            )
            await manager.add_task(alert_task)

        return yield_time

    def clear_yield(self, task_id: str):
        """Limpa o registro de yield quando a tarefa finalmente resolve suas dependencias."""
        self.blocked_tasks.pop(task_id, None)

    def apply_exhaustion_yield(self, task: Task) -> float:
        """Trata a exaustao de cotas de API aplicando um yield tatico de hibernacao local."""
        yield_time = 60.0
        logger.warning(
            f"[[{_c(task.agent)}]{task.agent}[/]] Exaustao de Chaves detectada para {task.id}. Aplicando yield tatico de {yield_time}s."
        )
        return yield_time


global_yield_manager = DynamicYieldManager()

if __name__ == "__main__":
    # Hook de Roteamento Semântico SOTA via CLI para o do.ps1
    if len(sys.argv) >= 3 and sys.argv[1] == "route-task":
        desc = sys.argv[2]
        explicit = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3].strip() else None
        agent, meta = _intelligent_route_task(desc, explicit)
        print(json.dumps({"agent": agent, "metadata": meta}))
        sys.exit(0)

    from cli.commands import run_cli

    run_cli(sys.argv)
