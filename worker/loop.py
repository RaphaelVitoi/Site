"""
Worker Loop -- Daemon principal de processamento de tarefas (NEXUS ORCHESTRATOR).
"""
# pylint: disable=broad-exception-caught, global-statement, protected-access, invalid-name, missing-function-docstring, line-too-long

import asyncio
import contextlib
import logging
import os
import time
from datetime import UTC, datetime

import aiofiles
from rich.console import Console
from rich.panel import Panel

import core.runtime as te
import llm.session as _llm_session_mod
import task_executor as task_exec
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

__all__ = ["start_worker"]

# SOTA: Otimizacao de FFI e Throttle de Terminal (Economia Generalizada)
if os.name == "nt":
    import ctypes

    _SET_CONSOLE_TITLE_W = ctypes.windll.kernel32.SetConsoleTitleW
    _SET_CONSOLE_TITLE_W.argtypes = [ctypes.c_wchar_p]
else:
    _SET_CONSOLE_TITLE_W = None

_LAST_STATUS_UPDATE = 0.0
MAX_CONCURRENT_TASKS = 4  # Externalizado: ajuste aqui para escalar o paralelismo

logger = logging.getLogger(__name__)
console = Console()


async def _recover_zombies(manager: QueueManager) -> None:
    """SOTA: Crash Recovery (Resgate de zumbis apos morte abrupta do processo)."""
    try:
        async with manager._get_async_db() as db:
            cursor = await db.execute("UPDATE tasks SET status = 'pending' WHERE status = 'running'")
            recovered_count = cursor.rowcount
            await db.commit()
            if recovered_count > 0:
                logger.warning(
                    "[CRASH RECOVERY SOTA] %d tarefas presas no limbo ('running') foram resgatadas para 'pending'.",
                    recovered_count,
                )
    except Exception as e:  # noqa: BLE001
        logger.error("[SISTEMA] Falha ao executar Crash Recovery no SQLite: %s", e)


async def _handle_hibernation(manager: QueueManager, status_line) -> bool:
    """Gerencia a homeostase de limite de budget. Retorna True se o worker deve aguardar."""
    hibernation_ts = await manager.get_system_state("hibernation_until")
    if not hibernation_ts:
        return False

    try:
        hibernation_until = datetime.fromisoformat(hibernation_ts)
        # SOTA: Correcao de tzinfo — apenas adiciona UTC se o datetime for naive.
        # .replace(tzinfo=UTC) num datetime tz-aware substitui sem converter, gerando
        # comparacao incorreta. A forma correta e testar tzinfo antes de substituir.
        if hibernation_until.tzinfo is None:
            hibernation_until = hibernation_until.replace(tzinfo=UTC)
        if datetime.now(UTC) < hibernation_until:
            status_line.update(
                f"[red]HIBERNACAO[/] Orcamento de API esgotado. Retorno as {hibernation_until.strftime('%H:%M')}."
            )
            await asyncio.sleep(60)
            return True

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
            "[SISTEMA IMUNOLOGICO] Hibernacao concluida. Amnesia de bloqueios induzida. "
            "Rotas, chaves e rate limits restaurados para Friccao Zero."
        )
    except (ValueError, TypeError):
        await manager.set_system_state("hibernation_until", "")  # Reseta estado invalido
    return False


def _update_terminal_status(counts: dict, running_tasks_count: int, status_line) -> None:
    """Atualiza o terminal com metricas operacionais de forma otimizada (Throttle anti-overhead)."""
    global _LAST_STATUS_UPDATE  # pylint: disable=global-statement
    now = time.monotonic()
    if now - _LAST_STATUS_UPDATE < 1.0:
        return
    _LAST_STATUS_UPDATE = now

    pending_count = counts.get("pending", 0)
    if _SET_CONSOLE_TITLE_W:
        current_time = datetime.now(UTC).astimezone().strftime("%H:%M:%S")
        _SET_CONSOLE_TITLE_W(
            f"NEXUS WORKER | Pendentes: {pending_count} | Rodando: {running_tasks_count} | Pulso: {current_time}"
        )

    if status_line:
        status_line.update(
            "[bold]Vigilia de Guardiao Absoluta SOTA[/] | Em Suspensao: "
            f"[yellow]{pending_count}[/] | Corpos Ativos: [magenta]{running_tasks_count}[/] | "
            f"Completas: [green]{counts.get('completed', 0)}[/]"
        )


def _format_display_id(task_id: str) -> str:
    if task_id.startswith("NOTIFY-"):
        return f"[bold orange3] {task_id}[/]"
    if task_id.startswith("AUTOFIX-"):
        return f"[bold red] {task_id}[/]"
    if task_id.startswith("RESONANCE-"):
        return f"[bold magenta] {task_id}[/]"
    if task_id.startswith("HANDOFF-"):
        return f"[bold cyan] {task_id}[/]"
    return task_id


async def _process_task_error(e: Exception, task: Task, manager: QueueManager, sem: asyncio.Semaphore) -> bool:
    error_str = str(e).lower()
    error_class = type(e).__name__

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

    logger.error(
        "[[%s]%s] Falha catastrofica: %s",
        getattr(te, "_c", lambda _: "")(task.agent),
        task.agent,
        e,
    )
    return False


async def _task_wrapper(task: Task, manager: QueueManager, sem: asyncio.Semaphore):
    released = False
    try:
        await execute_task_workflow(task, manager)
        if hasattr(task_exec, "global_yield_manager"):
            await task_exec.global_yield_manager.clear_yield(task.id)
    except Exception as e:  # noqa: BLE001
        released = await _process_task_error(e, task, manager, sem)
    finally:
        if not released:
            sem.release()


async def _handle_deadlock(pending_tasks: list, manager: QueueManager) -> None:
    if pending_tasks and not any(t.agent == "@chico" and "DEADLOCK-DAG" in t.id for t in pending_tasks):
        alert_task = Task(
            id=f"DEADLOCK-DAG-{int(time.time())}",
            description=(
                "O Arbitrador Universal detectou um Deadlock Topologico (Ciclo in_degree > 0). "
                "Arbitrar a fila, remover dependencias circulares e restaurar fluxo."
            ),
            agent="@chico",
            status="pending",
            timestamp=datetime.now(UTC).isoformat(),
            metadata={"priority": "critical"},
        )
        await manager.add_task(alert_task)
        logger.error("[STARVATION FATAL] Ciclo Topologico detectado na fila. @chico acionado para arbitrar.")


async def _dispatch_optimal_task(manager: QueueManager, semaphore: asyncio.Semaphore, running_tasks: set) -> None:
    """Extrai e despacha a tarefa de maior utilidade usando o Grafo Topologico CPU."""
    pending_tasks = await manager.get_tasks(status="pending")
    if not pending_tasks:
        semaphore.release()
        await asyncio.sleep(0.5)  # Friccao Zero
        return

    loop = asyncio.get_running_loop()
    task = await loop.run_in_executor(None, UniversalArbitrator.extract_optimal_task, pending_tasks) if loop else None

    if task:
        display_id = _format_display_id(str(task.id))
        logger.info(
            "[bold magenta][>] ESPACO DE ENTRADA VITAL REQUISITADO:[/] [%s]%s[/] (ID: %s)",
            te._c(task.agent),
            task.agent,
            display_id,
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
            "[SISTEMA] Cancelando %d tarefas em andamento (Graceful Shutdown)...",
            len(running_tasks),
        )
        for task_future in running_tasks.copy():
            task_future.cancel()
        try:
            _ = await asyncio.wait(running_tasks, timeout=5.0)
        except Exception as e:  # noqa: BLE001
            logger.warning("[SISTEMA] Cancelamento interrompido: %s", e)
        try:
            async with manager._get_async_db() as db:
                await db.execute("UPDATE tasks SET status = 'pending' WHERE status = 'running'")
                await db.commit()
            logger.info("[SISTEMA] Tarefas orfas revertidas para 'pending'. Zumbis erradicados.")
        except Exception as e:  # noqa: BLE001
            logger.error("[SISTEMA] Falha ao curar estado zombie no banco de dados: %s", e)

    if te.PID_FILE and te.PID_FILE.exists():
        with contextlib.suppress(OSError):
            te.PID_FILE.unlink()  # type: ignore

    if hasattr(_llm_session_mod, "_global_http_session"):
        session = getattr(_llm_session_mod, "_global_http_session", None)
        if session and not session.closed:
            await session.close()
            await asyncio.sleep(0.250)  # SOTA: Respiro para expurgo de sockets e conexoes SSL do aiohttp
        setattr(_llm_session_mod, "_global_http_session", None)  # noqa: B010


async def start_worker(manager: QueueManager | None = None):
    if manager is None:
        manager = QueueManager()

    # SOTA: Escreve o PID para permitir parada graciosa e robusta via stop-worker
    if te.PID_FILE:
        try:
            async with aiofiles.open(te.PID_FILE, mode="w", encoding="utf-8") as f:  # type: ignore
                await f.write(str(os.getpid()))
        except OSError as e:
            logger.error("Nao foi possivel escrever o arquivo PID em %s: %s", te.PID_FILE, e)

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
    header = (
        "[bold cyan]NEXUS ORCHESTRATOR[/] | [magenta]Kernel SOTA v7.1 (Manifestacao Maxima / Roteamento Assicrono)[/]\n"
    )
    header += (
        "[dim]A desorganizacao e a entropia findam nas correntes deste circuito. "
        "Abencado sob a Cosmologia Vitoi Absoluta.[/]\n\n"
    )
    header += f"Ramificacoes Pendentes Atuais: [yellow]{pending}[/] | "
    header += f"Entregas Imaculadas: [green]{completed}[/] | Falhas: [red]{failed}[/]"
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

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)
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
                logger.error("[bold red]FATAL[/] Arritmia no loop central do worker: %s", inner_e)
                await asyncio.sleep(5)
    except (KeyboardInterrupt, asyncio.CancelledError):
        status_line.stop()
        logger.info("Pulso encerrado pelo usuario. Hibernando...")
    finally:
        status_line.stop()
        await _cleanup_worker(manager, running_tasks)
