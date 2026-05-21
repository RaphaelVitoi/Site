import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
import contextlib
from pathlib import Path
from typing import Any

from rich.console import Console
from rich.logging import RichHandler

# SOTA 8.0: Importa o novo cerebro de arbitragem
import core.config as _core_config
from agents.execution import (
    AGENT_ARCHITECT,
    AGENT_CHICO,
    AGENT_CURATOR,
    AGENT_DISPATCHER,
    AGENT_IMPLEMENTOR,
    AGENT_MAVERICK,
)
from core.schemas import Task
from database.queue_manager import QueueManager

# Constants for SonarLint compliance
MODEL_GEMINI_FLASH = "gemini-2.0-flash"
DB_PATH_CLAUDE = ".claude/tasks.db"
DB_PATH_QUEUE = "queue/tasks.db"
ERR_DB_CORRUPTED = (
    "[ENTROPIA] Banco de dados de tarefas SOTA não encontrado ou corrompido."
)


def _resolve_tasks_db_path() -> Path | None:
    """SOTA: Resolve o caminho do banco de dados priorizando a fila assíncrona."""
    import sqlite3

    # Prioridade SOTA: Pipeline Assíncrono (queue) > Contexto Claude > Root (Legado)
    for candidate in [DB_PATH_QUEUE, DB_PATH_CLAUDE, "tasks.db"]:
        p = Path(candidate)
        if p.exists() and p.stat().st_size > 0:
            try:
                with contextlib.closing(sqlite3.connect(p)) as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'"
                    )
                    if cursor.fetchone():
                        return p
            except sqlite3.Error:
                pass
    return None


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
        encoding="ascii",
        errors="backslashreplace",
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


def _is_task_epic(description: str) -> bool:
    """Auxiliar SOTA: Detecção de escopo macro ou épico na descrição."""
    return any(
        keyword in description.lower()
        for keyword in [
            "epico",
            "sistema inteiro",
            "arquitetura",
            "refatorar tudo",
            "modulo completo",
        ]
    )


def _check_frontend_observer(description: str, metadata: dict[str, Any]) -> None:
    """Auxiliar SOTA: Injeta curadoria visual caso detecte contexto front-end."""
    desc_lower = description.lower()
    frontend_terms = _core_config.heuristic_terms("web_infra_terms")
    frontend_score = sum(
        weight for term, weight in frontend_terms.items() if term in desc_lower
    )
    if frontend_score >= _core_config.HEURISTIC_THRESHOLD:
        metadata.setdefault("observers", []).append(AGENT_CURATOR)
        logger.info(
            f"[ROUTING SOTA] Front-end detectado (score {frontend_score}). Anexando {AGENT_CURATOR} como Sentinela Estético."
        )


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
        AGENT_ARCHITECT,
        AGENT_MAVERICK,
        AGENT_CHICO,
    ]:
        complexity_score = len(description.split())
        if complexity_score > 150 or _is_task_epic(description):
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
        _check_frontend_observer(description, metadata)

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

    async def _check_orphan_dependencies(
        self, deps: list[str], manager: QueueManager
    ) -> bool:
        """Auxiliar SOTA: Valida se alguma dependencia referenciada eh orfa."""
        for dep_id in deps:
            dep_exists = True
            if hasattr(manager, "get_task"):
                dep_exists = (await manager.get_task(dep_id)) is not None
            else:
                all_tasks = await manager.get_tasks(None)
                dep_exists = any(t.id == dep_id for t in all_tasks)
            if not dep_exists:
                return True
        return False

    async def _analyze_deadlock(
        self, deps: list[str], manager: QueueManager
    ) -> tuple[bool, str]:
        """Auxiliar SOTA: Analisa os nos bloqueadores e acusa deadlock real."""
        deps_status_details = []
        is_deadlock = False
        if hasattr(manager, "get_task"):
            for dep_id in deps:
                dep_task = await manager.get_task(dep_id)
                if dep_task:
                    deps_status_details.append(f"{dep_id} ({dep_task.status})")
                    if dep_task.status in ["failed", "pending"]:
                        is_deadlock = True
        deps_info = (
            ", ".join(deps_status_details)
            if deps_status_details
            else "Nenhuma/Fantasma"
        )
        return is_deadlock or not deps_status_details, deps_info

    async def apply_yield(self, task: Task, manager: QueueManager) -> float:
        # SOTA: [Trava Cirúrgica] Validação de dependências órfãs antes de gastar recursos
        deps = task.metadata.get("depends_on", []) if task.metadata else []
        if await self._check_orphan_dependencies(deps, manager):
            logger.error(
                f"[[{_c(task.agent)}]{task.agent}[/]] [ENTROPIA FATAL] Tarefa {task.id} engatilhada com dependência fantasma. Abortando imediatamente (status failed)."
            )
            if hasattr(manager, "update_task_status"):
                await manager.update_task_status(task.id, "failed")
            self.clear_yield(task.id)
            return 0.0  # Aborta instantaneamente sem aplicar yield time

        attempts = self.blocked_tasks.get(task.id, 0) + 1
        self.blocked_tasks[task.id] = attempts

        # Backoff exponencial SOTA: 2^attempts, limitado ao max_yield_seconds
        yield_time = min(float(2**attempts), self.max_yield_seconds)

        logger.info(
            f"[[{_c(task.agent)}]{task.agent}[/]] Yield Dinamico ativado para {task.id}. Aguardando dependencias por {yield_time}s (Tentativa {attempts})."
        )

        # Se atingiu o teto e continua bloqueada, aciona o @chico (Arbitragem de Deadlock)
        if yield_time >= self.max_yield_seconds and attempts % 3 == 0:
            is_deadlock, deps_info = await self._analyze_deadlock(deps, manager)
            if is_deadlock:
                logger.warning(
                    f"[STARVATION] Tarefa {task.id} em deadlock real. Dependências: {deps_info}. Acionando {AGENT_CHICO} para intervenção."
                )
                alert_task = Task(
                    id=f"DEADLOCK-{int(time.time())}",
                    description=f"A tarefa {task.id} (Agente: {task.agent}) atingiu limite de starvation. Diagnóstico de dependências: {deps_info}. Requer intervenção cirúrgica (God Mode).",
                    agent=AGENT_CHICO,
                    status="pending",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    metadata={"priority": "high", "blocked_task": task.id},
                )
                await manager.add_task(alert_task)
            else:
                logger.info(
                    f"[[{_c(task.agent)}]{task.agent}[/]] Tarefa {task.id} aguardando, mas dependências estão rodando. Suprimindo alerta falso de deadlock."
                )

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


def _cli_route_task(sys_argv: list[str]) -> None:
    desc = sys_argv[2]
    explicit = sys_argv[3] if len(sys_argv) > 3 and sys_argv[3].strip() else None
    agent, meta = _intelligent_route_task(desc, explicit)
    print(json.dumps({"agent": agent, "metadata": meta}))
    sys.exit(0)


def _cli_train_predictive() -> None:
    from predictive_forest import PredictiveForestEngine

    logger.info("=== [SISTEMA] Iniciando Calibracao Preditiva (Random Forest) ===")
    engine = PredictiveForestEngine()
    sys.exit(0 if engine.train_model() else 1)


def _cli_predictive_profile() -> None:
    from predictive_forest import PredictiveForestEngine

    engine = PredictiveForestEngine()
    print(json.dumps(engine.get_predictive_profile()))
    sys.exit(0)


async def _process_telemetry_file(path: Path) -> list[dict]:
    """SOTA: Processador atômico de buffer linear."""
    import aiofiles

    data = []
    async with aiofiles.open(
        path, "r", encoding="ascii", errors="backslashreplace"
    ) as f:
        async for line in f:
            content = line.strip()
            if content:
                data.append(json.loads(content))
    return data


async def _read_telemetry_dump() -> list[dict]:
    """SOTA: Leitura Assíncrona Atômica do Buffer WASM Telemetry (Homeostase de I/O)"""
    dump_path = _core_config.PATH_TELEMETRY_DUMP
    if not dump_path.exists() or dump_path.stat().st_size == 0:
        return []

    try:
        import shutil

        processing_path = dump_path.with_suffix(".jsonl.processing")
        shutil.move(str(dump_path), str(processing_path))
        telemetry = await _process_telemetry_file(processing_path)
        processing_path.unlink(missing_ok=True)
        return telemetry
    except Exception as e:
        logger.warning(f"[HISTORIAN] Falha sistêmica ao processar telemetria WASM: {e}")
        return []


def _build_profile(fail_rate: float, engine: Any) -> dict:
    try:
        pred_profile = engine.get_predictive_profile()
    except Exception:
        pred_profile = {}
    return {
        "Aversão ao Risco": pred_profile.get(
            "Aversão ao Risco", round(0.85 - (fail_rate * 0.1), 2)
        ),
        "Pot Entrapment": pred_profile.get(
            "Pot Entrapment", round(0.65 + (fail_rate * 0.2), 2)
        ),
        "Miopia de Payjump": pred_profile.get("Miopia de Payjump", 0.90),
        "Excesso de Agressão": pred_profile.get(
            "Excesso de Agressão", round(0.30 + (fail_rate * 0.15), 2)
        ),
        "Passivo Estrutural (RIO)": pred_profile.get("Passivo Estrutural (RIO)", 0.75),
        "Desvio de Nash": pred_profile.get(
            "Desvio de Nash", round(0.45 + (fail_rate * 0.1), 2)
        ),
    }


async def _generate_historian_reports_async() -> None:
    from database.queue_manager import QueueManager
    from predictive_forest import PredictiveForestEngine

    qm = QueueManager()
    try:
        tasks_stats = await qm.get_task_counts()
        perf_history = await qm.get_performance_history()

        failed = tasks_stats.get("failed", 0)
        completed = tasks_stats.get("completed", 0)
        total = failed + completed
        fail_rate = failed / total if total > 0 else 0

        engine = PredictiveForestEngine()
        profile = _build_profile(fail_rate, engine)

        telemetry = await _read_telemetry_dump()

        if not telemetry and perf_history:
            telemetry = [
                {
                    "evLoss": 0,
                    "isCorrect": True,
                    "createdAt": f"{item['day']}T12:00:00Z",
                }
                for item in perf_history[-5:]
            ]

        print(json.dumps({"profile": profile, "telemetry": telemetry}))
    finally:
        qm.close()


def _cli_historian_reports() -> None:
    import asyncio

    asyncio.run(_generate_historian_reports_async())
    sys.exit(0)


def _cli_daily_stats() -> None:
    import asyncio
    from database.queue_manager import QueueManager

    async def _generate_daily_stats():
        qm = QueueManager()
        try:
            tasks = await qm.get_tasks()
            today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            today_tasks = [t for t in tasks if t.timestamp.startswith(today_str)]

            stats = {
                "date": today_str,
                "metrics": {
                    "total": len(today_tasks),
                    "completed": sum(1 for t in today_tasks if t.status == "completed"),
                    "failed": sum(1 for t in today_tasks if t.status == "failed"),
                    "pending": sum(1 for t in today_tasks if t.status == "pending"),
                    "running": sum(1 for t in today_tasks if t.status == "running"),
                },
                "recent_activity": [
                    {
                        "id": t.id,
                        "agent": t.agent,
                        "status": t.status,
                        "description": t.description[:100],
                    }
                    for t in today_tasks[-20:]  # Ultimas 20 para contexto de padroes
                ],
            }
            print(json.dumps(stats, indent=2))
        finally:
            qm.close()

    asyncio.run(_generate_daily_stats())
    sys.exit(0)


def _extract_dependencies(meta_str: str | None) -> list[str]:
    """Auxiliar SOTA: Deserializa e abstrai a complexidade da extracao de dependencias."""
    if not meta_str:
        return []
    try:
        meta = json.loads(meta_str)
        if isinstance(meta, dict):
            deps = meta.get("depends_on", [])
            if isinstance(deps, list):
                return [str(dep) for dep in deps]
    except json.JSONDecodeError:
        pass
    return []


def _cli_db_audit_dag() -> None:
    import sqlite3

    logger.info(
        "=== [SISTEMA] Iniciando Auditoria Estrutural de DAGs (Fricção Zero) ==="
    )
    db_path = _resolve_tasks_db_path()
    if not db_path:
        logger.error(ERR_DB_CORRUPTED)
        sys.exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, metadata FROM tasks")
            all_tasks = cursor.fetchall()
            task_ids = {row[0] for row in all_tasks}
            orphans = []
            for t_id, meta_str in all_tasks:
                for dep in _extract_dependencies(meta_str):
                    if dep not in task_ids:
                        orphans.append((t_id, dep))
            if orphans:
                logger.error(
                    f"[ENTROPIA DETECTADA] {len(orphans)} bloqueios órfãos localizados:"
                )
                for task_id, dep_id in orphans:
                    logger.error(
                        f"  -> Tarefa {task_id} aguarda dependência inexistente: {dep_id}"
                    )
                sys.exit(1)
            else:
                logger.info(
                    "[OK] Malha DAG íntegra. Zero tarefas aguardando dependências fantasmas."
                )
                sys.exit(0)
    except sqlite3.Error:
        logger.exception("[FALHA] Erro ao auditar DAL.")
        sys.exit(1)


def _cli_db_purge_orphans() -> None:
    import sqlite3

    logger.info(
        "=== [SISTEMA] Iniciando Expurgo de Tarefas 'failed' com Dependências Órfãs ==="
    )
    db_path = _resolve_tasks_db_path()
    if not db_path:
        logger.error(ERR_DB_CORRUPTED)
        sys.exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            # SOTA: Desativa fsync() do OS para deleções em lote CLI. Erradica o pico de 150ms no rebalanceamento B-Tree.
            conn.execute("PRAGMA synchronous=OFF;")
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM tasks")
            task_ids = {row[0] for row in cursor.fetchall()}

            cursor.execute("SELECT id, metadata FROM tasks WHERE status = 'failed'")
            failed_tasks = cursor.fetchall()

            targets_to_delete = []
            for t_id, meta_str in failed_tasks:
                for dep in _extract_dependencies(meta_str):
                    if dep not in task_ids:
                        targets_to_delete.append((t_id,))
                        logger.info(
                            f"[EXPURGO] Tarefa failed marcada para aniquilação: {t_id} (Dependia do id fantasma: {dep})"
                        )
                        break

            if targets_to_delete:
                cursor.executemany("DELETE FROM tasks WHERE id = ?", targets_to_delete)
            purged_count = len(targets_to_delete)
            conn.commit()
            logger.info(
                f"[OK] {purged_count} tarefa(s) fantasma(s) expurgada(s) do sistema."
                if purged_count > 0
                else "[OK] Nenhuma tarefa failed com dependência órfã detectada. Dashboard Limpo."
            )
            sys.exit(0)
    except sqlite3.Error:
        logger.exception("[FALHA] Erro ao limpar DAL.")
        sys.exit(1)


def _cli_db_vacuum() -> None:
    import sqlite3

    logger.info("=== [SISTEMA] Iniciando Otimizacao de Banco de Dados (VACUUM) ===")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        logger.error(ERR_DB_CORRUPTED)
        sys.exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path, timeout=60.0)) as conn:
            logger.info(
                f"Executando VACUUM em {db_path}. Isso pode levar alguns minutos..."
            )
            # SOTA: Grava estatísticas de uso em disco para otimizar o Query Planner antes da reconstrução do arquivo.
            conn.execute("PRAGMA optimize;")
            conn.execute("VACUUM;")
            conn.commit()
            logger.info("[OK] Banco de dados otimizado com sucesso.")
            sys.exit(0)
    except sqlite3.Error:
        logger.exception("[FALHA] Erro ao executar VACUUM.")
        sys.exit(1)


if __name__ == "__main__":
    # SOTA: Mapeamento local dos handlers para extirpar complexidade (S3776)
    _local_handlers = {
        "train-predictive": _cli_train_predictive,
        "predictive-profile": _cli_predictive_profile,
        "historian-reports": _cli_historian_reports,
        "daily-stats": _cli_daily_stats,
        "db-audit-dag": _cli_db_audit_dag,
        "db-purge-orphans": _cli_db_purge_orphans,
        "db-vacuum": _cli_db_vacuum,
    }

    if len(sys.argv) >= 2:
        command = sys.argv[1].lower()
        if command == "route-task" and len(sys.argv) >= 3:
            _cli_route_task(sys.argv)
        elif command in _local_handlers:
            _local_handlers[command]()

    _nexus_cmds = {
        "dashboard",
        "start-worker",
        "stop-worker",
        "status",
        "sanitize",
        "optimize-ide",
        "purge-ext",
        "scan",
        "audit-routing",
        "audit-api",
        "monitor",
        "test-breaker",
        "watch",
        "visualize-map",
        "purge-rag",
        "ingest-rag",
        "autonomy",
        "refactor",
    }

    if len(sys.argv) == 1:
        from scripts.cli.nexus import main as run_nexus

        run_nexus(["dashboard"])
        sys.exit(0)

    if len(sys.argv) >= 2 and sys.argv[1].lower() in _nexus_cmds:
        from scripts.cli.nexus import main as run_nexus

        run_nexus(sys.argv[1:])
        sys.exit(0)

    # Fallback para os comandos legados do sistema (ex: db-get, db-add)
    from cli.commands import run_cli

    run_cli(sys.argv)
