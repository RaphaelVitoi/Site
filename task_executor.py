# pylint: disable=logging-fstring-interpolation, broad-exception-caught, redefined-outer-name, line-too-long, missing-module-docstring, missing-class-docstring, missing-function-docstring, invalid-name, import-outside-toplevel

import asyncio
import contextlib
from datetime import UTC, datetime
import json
import logging
import logging.handlers
import os
from pathlib import Path
import shutil
import sqlite3
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import aiofiles
from rich.console import Console
from rich.logging import RichHandler

import core.config as _core_config
from agents.execution import (
    AGENT_ARCHITECT,
    AGENT_CHICO,
    AGENT_CURATOR,
    AGENT_DISPATCHER,
    AGENT_IMPLEMENTOR,
    AGENT_MAVERICK,
)
import core.config as _core_config
from core.schemas import Task
from database.queue_manager import QueueManager

# Constants for SonarLint compliance
MODEL_GEMINI_FLASH = "gemini-2.0-flash"
DB_PATH_CLAUDE = ".claude/tasks.db"
DB_PATH_QUEUE = "queue/tasks.db"
ERR_DB_CORRUPTED = "[ENTROPIA] Banco de dados de tarefas SOTA nao encontrado ou corrompido."


def _resolve_tasks_db_path() -> Path | None:
    """SOTA: Resolve o caminho do banco de dados priorizando a fila assincrona."""
    # Prioridade SOTA: Pipeline Assincrono (queue) > Contexto Claude > Root (Legado)
    for candidate in [DB_PATH_QUEUE, DB_PATH_CLAUDE, "tasks.db"]:
        p = Path(candidate)
        if p.exists() and p.stat().st_size > 0:
            try:
                with contextlib.closing(sqlite3.connect(p)) as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
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

    class SotaLogFormatter(logging.Formatter):
        """SOTA: Erradicacao de CRLF Injection em disco preservando a arvore de Tracebacks."""

        def format(self, record: logging.LogRecord) -> str:
            original_msg = record.msg
            if isinstance(record.msg, str):
                record.msg = record.msg.replace("\r", "\\r").replace("\n", "\\n")
            formatted = super().format(record)
            record.msg = original_msg
            return formatted

    rotating_handler = logging.handlers.RotatingFileHandler(
        log_dir / "task_executor.log",
        maxBytes=1024 * 1024 * 10,
        backupCount=10,
        encoding="ascii",
        errors="backslashreplace",
    )
    rotating_handler.setFormatter(
        SotaLogFormatter("%(asctime)s - [%(levelname)s] - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
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
    """Auxiliar SOTA: Deteccao de escopo macro ou epico na descricao."""
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
    # SOTA: Friccao Zero. Micro-tarefas prescindem de comite de revisao estetica (oblitera NOTIFY ocioso).
    if len(description.split()) <= 15:
        return
    desc_lower = description.lower()
    frontend_terms = _core_config.heuristic_terms("web_infra_terms")
    frontend_score = sum(weight for term, weight in frontend_terms.items() if term in desc_lower)
    if frontend_score >= _core_config.HEURISTIC_THRESHOLD:
        metadata.setdefault("observers", []).append(AGENT_CURATOR)
        logger.info(
            f"[ROUTING SOTA] Front-end detectado (score {frontend_score}). Anexando {AGENT_CURATOR} como Sentinela Estetico."
        )


# SOTA: Roteamento Semantico e Auto-Escalonamento
def _intelligent_route_task(description: str, explicit_agent: str | None = None) -> tuple[str, dict[str, Any]]:
    """
    Intercepta o roteamento para aplicar a Lei da Friccao Zero.
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

        # SOTA: Economia Generalizada. Burlar o Dispatcher para micro-tarefas sem dono,
        # evitando a emissao de um plano de execucao (LLM) ocioso para alteracoes atomicas.
        if len(description.split()) <= 20:
            logger.info(
                f"[ROUTING SOTA] Micro-tarefa detectada sem heuristica clara. Bypass do {AGENT_DISPATCHER} acionado -> {AGENT_IMPLEMENTOR}."
            )
            return AGENT_IMPLEMENTOR, metadata

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
        self.max_tracked_tasks = 1000  # SOTA: Teto absoluto anti-vazamento (LRU Bounded)
        self.lock = asyncio.Lock()

    async def _check_orphan_dependencies(self, deps: list[str], manager: QueueManager) -> bool:
        """Auxiliar SOTA: Valida se alguma dependencia referenciada eh orfa."""
        if not deps:
            return False
        if hasattr(manager, "get_task"):
            tasks = await asyncio.gather(*(manager.get_task(dep_id) for dep_id in deps))
            return any(t is None for t in tasks)

        all_tasks = await manager.get_tasks(None)
        task_ids = {t.id for t in all_tasks}
        return any(dep_id not in task_ids for dep_id in deps)

    async def _analyze_deadlock(self, deps: list[str], manager: QueueManager) -> tuple[bool, str]:
        """Auxiliar SOTA: Analisa os nos bloqueadores e acusa deadlock real."""
        deps_status_details = []
        is_deadlock = False
        if hasattr(manager, "get_task"):
            tasks = await asyncio.gather(*(manager.get_task(dep_id) for dep_id in deps))
            for dep_id, dep_task in zip(deps, tasks, strict=False):
                if dep_task:
                    deps_status_details.append(f"{dep_id} ({dep_task.status})")
                    if dep_task.status in ["failed", "pending"]:
                        is_deadlock = True
                else:
                    deps_status_details.append(f"{dep_id} (INEXISTENTE)")
                    is_deadlock = True

        deps_info = ", ".join(deps_status_details) if deps_status_details else "Nenhuma/Fantasma"
        return is_deadlock or not deps_status_details, deps_info

    async def apply_yield(self, task: Task, manager: QueueManager) -> float:
        async with self.lock:
            # SOTA: [Trava Cirurgica] Validacao de dependencias orfas antes de gastar recursos
            deps = task.metadata.get("depends_on", []) if task.metadata else []
            if await self._check_orphan_dependencies(deps, manager):
                logger.error(
                    f"[[{_c(task.agent)}]{task.agent}[/]] [ENTROPIA FATAL] Tarefa {task.id} engatilhada com dependencia fantasma. Abortando imediatamente (status failed)."
                )
                if hasattr(manager, "update_task_status"):
                    await manager.update_task_status(task.id, "failed")
                self.blocked_tasks.pop(task.id, None)
                return 0.0  # Aborta instantaneamente sem aplicar yield time

            # SOTA FIX: Memory Leak Prevention (FIFO Eviction)
            if len(self.blocked_tasks) >= self.max_tracked_tasks and task.id not in self.blocked_tasks:
                oldest_task = next(iter(self.blocked_tasks))
                del self.blocked_tasks[oldest_task]

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
                        f"[STARVATION] Tarefa {task.id} em deadlock real. Dependencias: {deps_info}. Acionando {AGENT_CHICO} para intervencao."
                    )
                    alert_task = Task(
                        id=f"DEADLOCK-{int(time.time())}",
                        description=f"A tarefa {task.id} (Agente: {task.agent}) atingiu limite de starvation. Diagnostico de dependencias: {deps_info}. Requer intervencao cirurgica (God Mode).",
                        agent=AGENT_CHICO,
                        status="pending",
                        timestamp=datetime.now(UTC).isoformat(),
                        metadata={"priority": "high", "blocked_task": task.id},
                    )
                    await manager.add_task(alert_task)
                else:
                    logger.info(
                        f"[[{_c(task.agent)}]{task.agent}[/]] Tarefa {task.id} aguardando, mas dependencias estao rodando. Suprimindo alerta falso de deadlock."
                    )

            return yield_time

    async def clear_yield(self, task_id: str):
        """Limpa o registro de yield quando a tarefa finalmente resolve suas dependencias."""
        async with self.lock:
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
    from predictive_forest import PredictiveForestEngine  # type: ignore

    logger.info("=== [SISTEMA] Iniciando Calibracao Preditiva (Random Forest) ===")
    engine = PredictiveForestEngine()
    sys.exit(0 if engine.train_model() else 1)


def _cli_predictive_profile() -> None:
    from predictive_forest import PredictiveForestEngine  # type: ignore

    engine = PredictiveForestEngine()
    print(json.dumps(engine.get_predictive_profile()))
    sys.exit(0)


async def _process_telemetry_file(path: Path) -> list[dict]:
    """SOTA: Processador atomico de buffer linear."""
    data = []
    async with aiofiles.open(path, encoding="ascii", errors="backslashreplace") as f:
        async for line in f:
            content = line.strip()
            if content:
                try:
                    data.append(json.loads(content))
                except json.JSONDecodeError as e:
                    logger.warning(f"[HISTORIAN] Entropia isolada: linha de telemetria corrompida ignorada ({e})")
    return data


async def _read_telemetry_dump() -> list[dict]:
    """SOTA: Leitura Assincrona Atomica do Buffer WASM Telemetry (Homeostase de I/O)"""
    dump_path = await asyncio.to_thread(_core_config.PATH_TELEMETRY_DUMP.resolve)

    # SOTA SEC: Blindagem contra Delecao Arbitraria via Symlink / Path Traversal
    project_root = await asyncio.to_thread(Path(__file__).parent.resolve)
    if not dump_path.is_relative_to(project_root):
        logger.error(
            f"[SEC CRITICO] O caminho de telemetria transborda a raiz segura. Abortando exclusao de arquivo: {dump_path}"
        )
        return []

    exists = await asyncio.to_thread(dump_path.exists)
    if not exists:
        return []

    size = await asyncio.to_thread(lambda: dump_path.stat().st_size)
    if size == 0:
        return []

    try:
        processing_path = dump_path.with_suffix(".jsonl.processing")
        # SOTA: Offload de I/O bloqueante para Thread Pool, impedindo asfixia do Event Loop
        await asyncio.to_thread(shutil.move, str(dump_path), str(processing_path))
        telemetry = await _process_telemetry_file(processing_path)
        await asyncio.to_thread(processing_path.unlink, missing_ok=True)
        return telemetry
    except Exception as e:
        logger.warning(f"[HISTORIAN] Falha sistemica ao processar telemetria WASM: {e}")
        return []


def _build_profile(fail_rate: float, engine: Any) -> dict:
    try:
        pred_profile = engine.get_predictive_profile()
    except Exception as e:
        logger.debug(f"[HISTORIAN] Falha ao extrair perfil preditivo (fallback acionado): {e}")
        pred_profile = {}
    return {
        "Aversao ao Risco": pred_profile.get("Aversao ao Risco", round(0.85 - (fail_rate * 0.1), 2)),
        "Pot Entrapment": pred_profile.get("Pot Entrapment", round(0.65 + (fail_rate * 0.2), 2)),
        "Miopia de Payjump": pred_profile.get("Miopia de Payjump", 0.90),
        "Excesso de Agressao": pred_profile.get("Excesso de Agressao", round(0.30 + (fail_rate * 0.15), 2)),
        "Passivo Estrutural (RIO)": pred_profile.get("Passivo Estrutural (RIO)", 0.75),
        "Desvio de Nash": pred_profile.get("Desvio de Nash", round(0.45 + (fail_rate * 0.1), 2)),
    }


async def _generate_historian_reports_async(qm: Any) -> None:
    from predictive_forest import PredictiveForestEngine  # type: ignore

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
    except Exception as e:
        logger.exception(f"[HISTORIAN] Falha ao gerar relatorio: {e}")


def _cli_historian_reports() -> None:
    qm = QueueManager()
    try:
        asyncio.run(_generate_historian_reports_async(qm))
    finally:
        qm.close()
    sys.exit(0)


def _cli_daily_stats() -> None:
    async def _generate_daily_stats(qm: Any) -> None:
        try:
            tasks = await qm.get_tasks()
            today_str = datetime.now(UTC).strftime("%Y-%m-%d")
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
        except Exception as e:
            logger.exception(f"[CLI] Falha ao gerar estatisticas diarias: {e}")

    qm = QueueManager()
    try:
        asyncio.run(_generate_daily_stats(qm))
    finally:
        qm.close()
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
    except json.JSONDecodeError as e:
        logger.debug(f"[DAG] Ignorando metadados corrompidos/nao-JSON: {e}")
    return []


def _cli_db_audit_dag() -> None:
    logger.info("=== [SISTEMA] Iniciando Auditoria Estrutural de DAGs (Friccao Zero) ===")
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
                logger.error(f"[ENTROPIA DETECTADA] {len(orphans)} bloqueios orfaos localizados:")
                for task_id, dep_id in orphans:
                    logger.error(f"  -> Tarefa {task_id} aguarda dependencia inexistente: {dep_id}")
                sys.exit(1)
            else:
                logger.info("[OK] Malha DAG integra. Zero tarefas aguardando dependencias fantasmas.")
                sys.exit(0)
    except sqlite3.Error:
        logger.exception("[FALHA] Erro ao auditar DAL.")
        sys.exit(1)


def _cli_db_purge_orphans() -> None:
    logger.info("=== [SISTEMA] Iniciando Expurgo de Tarefas 'failed' com Dependencias Orfas ===")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        logger.error(ERR_DB_CORRUPTED)
        sys.exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            # SOTA: Desativa fsync() do OS para delecoes em lote CLI. Erradica o pico de 150ms no rebalanceamento B-Tree.
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
                            f"[EXPURGO] Tarefa failed marcada para aniquilacao: {t_id} (Dependia do id fantasma: {dep})"
                        )
                        break

            if targets_to_delete:
                cursor.executemany("DELETE FROM tasks WHERE id = ?", targets_to_delete)
            purged_count = len(targets_to_delete)
            conn.commit()
            logger.info(
                f"[OK] {purged_count} tarefa(s) fantasma(s) expurgada(s) do sistema."
                if purged_count > 0
                else "[OK] Nenhuma tarefa failed com dependencia orfa detectada. Dashboard Limpo."
            )
            sys.exit(0)
    except sqlite3.Error:
        logger.exception("[FALHA] Erro ao limpar DAL.")
        sys.exit(1)


def _cli_db_vacuum() -> None:
    logger.info("=== [SISTEMA] Iniciando Otimizacao de Banco de Dados (VACUUM) ===")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        logger.error(ERR_DB_CORRUPTED)
        sys.exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path, timeout=60.0)) as conn:
            logger.info(f"Executando VACUUM em {db_path}. Isso pode levar alguns minutos...")
            # SOTA: Grava estatisticas de uso em disco para otimizar o Query Planner antes da reconstrucao do arquivo.
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
