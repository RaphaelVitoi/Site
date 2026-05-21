# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long, broad-exception-caught, logging-fstring-interpolation, global-statement, invalid-name, protected-access, import-outside-toplevel
"""
Worker Loop -- Daemon principal de processamento de tarefas (NEXUS ORCHESTRATOR).
"""

import asyncio
import logging
import os
import time
from datetime import datetime, timezone

import aiofiles
import aiosqlite
from rich.console import Console
from rich.panel import Panel

import core.runtime as te
from agents.execution import execute_task_workflow
from core.arbitrator import UniversalArbitrator
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    _RATE_LIMITERS,
    GEMINI_MODEL_KEY_BLOCKLIST,
    KEY_BLOCKLIST,
    ROUTE_BLOCKLIST,
    ROUTE_FAILURE_COUNTS,
    get_telemetry_lock,
)

# SOTA: Otimizacao de FFI e Throttle de Terminal (Economia Generalizada)
if os.name == "nt":
    import ctypes

    _SetConsoleTitleW = ctypes.windll.kernel32.SetConsoleTitleW
    _SetConsoleTitleW.argtypes = [ctypes.c_wchar_p]
else:
    _SetConsoleTitleW = None

_last_status_update = 0.0

logger = logging.getLogger(__name__)
console = Console()


async def _recover_zombies(manager: QueueManager) -> None:
    """SOTA: Crash Recovery (Resgate de zumbis apos morte abrupta do processo)."""
    try:
        async with aiosqlite.connect(manager.db_path) as db:
            cursor = await db.execute(
                "UPDATE tasks SET status = 'pending' WHERE status = 'running'"
            )
            recovered_count = cursor.rowcount
            await db.commit()
            if recovered_count > 0:
                logger.warning(
                    f"[CRASH RECOVERY SOTA] {recovered_count} tarefas presas no limbo ('running') foram resgatadas para 'pending'."
                )
    except Exception as e:  # noqa: BLE001
        logger.exception(f"[SISTEMA] Falha ao executar Crash Recovery no SQLite: {e}")


async def _handle_hibernation(manager: QueueManager, status_line) -> bool:
    """Gerencia a homeostase de limite de budget. Retorna True se o worker deve aguardar."""
    hibernation_ts = await manager.get_system_state("hibernation_until")
    if not hibernation_ts:
        return False

    try:
        hibernation_until = datetime.fromisoformat(hibernation_ts)
        if datetime.now(timezone.utc) < hibernation_until.replace(tzinfo=timezone.utc):
            status_line.update(
                f"[red]HIBERNACAO[/] Orcamento de API esgotado. Retorno as {hibernation_until.strftime('%H:%M')}."
            )
            await asyncio.sleep(60)
            return True
        else:
            # SOTA: Reset absoluto da memoria de bloqueios ao acordar da hibernacao
            await manager.set_system_state("hibernation_until", "")
            for limiter in _RATE_LIMITERS.values():
                limiter.tokens = float(limiter.capacity)
                limiter.last_fill = time.monotonic()
                limiter.starvation_events = 0
            async with get_telemetry_lock():
                ROUTE_BLOCKLIST.clear()
                KEY_BLOCKLIST.clear()
                GEMINI_MODEL_KEY_BLOCKLIST.clear()
                ROUTE_FAILURE_COUNTS.clear()
            logger.info(
                "[SISTEMA IMUNOLOGICO] Hibernacao concluida. Amnesia de bloqueios induzida. Rotas, chaves e rate limits restaurados para Friccao Zero."
            )
    except (ValueError, TypeError):
        await manager.set_system_state(
            "hibernation_until", ""
        )  # Reseta estado invalido
    return False


def _update_terminal_status(
    counts: dict, running_tasks_count: int, status_line
) -> None:
    """Atualiza o terminal com metricas operacionais de forma otimizada (Throttle anti-overhead)."""
    global _last_status_update
    now = time.monotonic()
    if now - _last_status_update < 1.0:
        return
    _last_status_update = now

    pending_count = counts.get("pending", 0)
    if _SetConsoleTitleW:
        current_time = datetime.now(timezone.utc).astimezone().strftime("%H:%M:%S")
        _SetConsoleTitleW(
            f"NEXUS WORKER | Pendentes: {pending_count} | Rodando: {running_tasks_count} | Pulso: {current_time}"
        )

    if status_line:
        status_line.update(
            f"[bold]Vigilia de Guardiao Absoluta SOTA[/] | Em Suspensao: [yellow]{pending_count}[/] | Corpos Ativos: [magenta]{running_tasks_count}[/] | Completas: [green]{counts.get('completed', 0)}[/]"
        )


def _format_display_id(task_id: str) -> str:
    if task_id.startswith("NOTIFY-"):
        return f"[bold orange3]! {task_id}[/]"
    elif task_id.startswith("AUTOFIX-"):
        return f"[bold red]! {task_id}[/]"
    elif task_id.startswith("RESONANCE-"):
        return f"[bold magenta]~ {task_id}[/]"
    elif task_id.startswith("HANDOFF-"):
        return f"[bold cyan]> {task_id}[/]"
    return task_id


async def _process_task_error(
    e: Exception, task: Task, manager: QueueManager, sem: asyncio.Semaphore
) -> bool:
    error_str = str(e).lower()
    error_class = type(e).__name__

    import task_executor as task_exec

    if error_class == "APIKeysExhaustedError" or "exhaust" in error_str:
        yield_time = task_exec.global_yield_manager.apply_exhaustion_yield(task)
        sem.release()
        await asyncio.sleep(yield_time)
        await manager.update_task_status(task.id, "pending")
        return True

    if any(
        k in error_str
        for k in [
            "depend",
            "lock",
            "starvation",
            "wait",
            "file not found",
            "no such file",
        ]
    ):
        yield_time = await task_exec.global_yield_manager.apply_yield(task, manager)
        sem.release()
        await asyncio.sleep(yield_time)
        await manager.update_task_status(task.id, "pending")
        return True

    logger.error(f"[[{te._c(task.agent)}]{task.agent}[/]] Falha catastrofica: {e}")
    return False


async def _task_wrapper(task: Task, manager: QueueManager, sem: asyncio.Semaphore):
    released = False
    try:
        await execute_task_workflow(task, manager)
        import task_executor as task_exec

        if hasattr(task_exec, "global_yield_manager"):
            task_exec.global_yield_manager.clear_yield(task.id)
    except Exception as e:  # noqa: BLE001
        released = await _process_task_error(e, task, manager, sem)
    finally:
        if not released:
            sem.release()


async def _handle_deadlock(pending_tasks: list, manager: QueueManager) -> None:
    if pending_tasks and not any(
        t.agent == "@chico" and "DEADLOCK-DAG" in t.id for t in pending_tasks
    ):
        alert_task = Task(
            id=f"DEADLOCK-DAG-{int(time.time())}",
            description="O Arbitrador Universal detectou um Deadlock Topologico (Ciclo in_degree > 0). Arbitrar a fila, remover dependencias circulares e restaurar fluxo.",
            agent="@chico",
            status="pending",
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"priority": "critical"},
        )
        await manager.add_task(alert_task)
        logger.error(
            "[STARVATION FATAL] Ciclo Topologico detectado na fila. @chico acionado para arbitrar."
        )


async def _dispatch_optimal_task(
    manager: QueueManager, semaphore: asyncio.Semaphore, running_tasks: set
) -> None:
    """Extrai e despacha a tarefa de maior utilidade usando o Grafo Topologico CPU."""
    pending_tasks = await manager.get_tasks(status="pending")
    if not pending_tasks:
        semaphore.release()
        await asyncio.sleep(0.5)  # Friccao Zero
        return

    loop = asyncio.get_running_loop()
    task = (
        await loop.run_in_executor(
            None, UniversalArbitrator.extract_optimal_task, pending_tasks
        )
        if loop
        else None
    )

    if task:
        display_id = _format_display_id(str(task.id))
        logger.info(
            f"[bold magenta][>] ESPACO DE ENTRADA VITAL REQUISITADO:[/] [{te._c(task.agent)}]{task.agent}[/] (ID: {display_id})"
        )
        await manager.update_task_status(task.id, "running")

        future = asyncio.create_task(_task_wrapper(task, manager, semaphore))
        running_tasks.add(future)
        future.add_done_callback(running_tasks.discard)
    else:
        await _handle_deadlock(pending_tasks, manager)
        semaphore.release()
        await asyncio.sleep(2.0)


async def _cleanup_worker(manager: QueueManager, running_tasks: set) -> None:
    """Mitigacao de orfanizacao de tarefas e processos zombies no encerramento."""
    if running_tasks:
        logger.info(
            f"[SISTEMA] Cancelando {len(running_tasks)} tarefas em andamento (Graceful Shutdown)..."
        )
        for task_future in running_tasks.copy():
            task_future.cancel()
        try:
            await asyncio.wait(running_tasks, timeout=5.0)
        except Exception as e:  # noqa: BLE001
            logger.warning(f"[SISTEMA] Cancelamento interrompido: {e}")
        try:
            async with aiosqlite.connect(manager.db_path) as db:
                await db.execute(
                    "UPDATE tasks SET status = 'pending' WHERE status = 'running'"
                )
                await db.commit()
            logger.info(
                "[SISTEMA] Tarefas orfas revertidas para 'pending'. Zumbis erradicados."
            )
        except Exception as e:  # noqa: BLE001
            logger.exception(
                f"[SISTEMA] Falha ao curar estado zombie no banco de dados: {e}"
            )

    if te.PID_FILE and te.PID_FILE.exists():
        try:
            te.PID_FILE.unlink()  # type: ignore
        except OSError:
            pass

    import llm.session as _llm_session_mod

    session = getattr(_llm_session_mod, "_GLOBAL_HTTP_SESSION", None)
    if session and not session.closed:
        await session.close()
        await asyncio.sleep(
            0.250
        )  # SOTA: Respiro para expurgo de sockets e conexoes SSL do aiohttp
    _llm_session_mod._GLOBAL_HTTP_SESSION = None


async def start_worker(manager: QueueManager | None = None):
    if manager is None:
        manager = QueueManager()

    # SOTA: Escreve o PID para permitir parada graciosa e robusta via stop-worker
    if te.PID_FILE:
        try:
            async with aiofiles.open(te.PID_FILE, "w") as f:
                await f.write(str(os.getpid()))
        except OSError as e:
            logger.exception(
                f"Nao foi possivel escrever o arquivo PID em {te.PID_FILE}: {e}"
            )

    # 1. Limpa o terminal para o God Mode Visual
    cmd = "cls" if os.name == "nt" else "clear"
    process = await asyncio.create_subprocess_shell(cmd)
    await process.communicate()

    await _recover_zombies(manager)

    # 2. Varredura inicial da Fila
    counts = await manager.get_task_counts()
    pending = counts.get("pending", 0)
    completed = counts.get("completed", 0)
    failed = counts.get("failed", 0)

    # Painel de Boas-vindas SOTA
    header = "[bold cyan]NEXUS ORCHESTRATOR[/] | [magenta]Kernel SOTA v7.1 (Manifestacao Maxima / Roteamento Assicrono)[/]\n"
    header += "[dim]A desorganizacao e a entropia findam nas correntes deste circuito. Abencoado sob a Cosmologia Vitoi Absoluta.[/]\n\n"
    header += f"Ramificacoes Pendentes Atuais: [yellow]{pending}[/] | Entregas Imaculadas: [green]{completed}[/] | Falhas: [red]{failed}[/]"
    console.print(
        Panel(
            header,
            border_style="cyan",
            title="[bold]ESTABILIDADE OPERACIONAL COMPROVADA[/]",
            expand=False,
        )
    )

    status_line = console.status(
        "[cyan]A imergir os fluxos da rede interligada global de neuronios ciberneticos...[/]",
        spinner="dots",
    )
    status_line.start()

    semaphore = asyncio.Semaphore(4)
    running_tasks = set()

    try:
        while True:
            if await _handle_hibernation(manager, status_line):
                continue

            try:
                counts = await manager.get_task_counts()
                _update_terminal_status(counts, len(running_tasks), status_line)

                await semaphore.acquire()
                await _dispatch_optimal_task(manager, semaphore, running_tasks)
            except Exception as inner_e:  # noqa: BLE001
                logger.exception(
                    f"[bold red]FATAL[/] Arritmia no loop central do worker: {inner_e}"
                )
                await asyncio.sleep(5)
    except (KeyboardInterrupt, asyncio.CancelledError):
        status_line.stop()
        logger.info("Pulso encerrado pelo usuario. Hibernando...")
    finally:
        status_line.stop()
        await _cleanup_worker(manager, running_tasks)
