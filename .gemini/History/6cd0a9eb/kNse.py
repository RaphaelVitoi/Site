"""
Worker Loop -- Daemon principal de processamento de tarefas (NEXUS ORCHESTRATOR).
"""
import os
import time
import asyncio
import logging
from datetime import datetime
from typing import Optional

import aiosqlite
from rich.console import Console
from rich.panel import Panel

from database.queue_manager import QueueManager
from core.arbitrator import UniversalArbitrator
from llm.budget import (
    global_rate_limiter,
    ROUTE_BLOCKLIST, KEY_BLOCKLIST,
    GEMINI_MODEL_KEY_BLOCKLIST, ROUTE_FAILURE_COUNTS,
    get_telemetry_lock,
)
from agents.execution import execute_task_workflow
import core.runtime as te


logger = logging.getLogger(__name__)
console = Console()

def _agent_color(agent: str) -> str:
    """Safe wrapper for agent color fetching to satisfy static analysis."""
    _c_func = getattr(te, "_c", None)
    if callable(_c_func):
        return str(_c_func(agent))
    return "white"

async def _recover_zombies(manager: QueueManager) -> None:
    """SOTA: Crash Recovery (Resgate de zumbis apos morte abrupta do processo)."""
    try:
        async with aiosqlite.connect(manager.db_path) as db:
            cursor = await db.execute("UPDATE tasks SET status = 'pending' WHERE status = 'running'")
            recovered_count = cursor.rowcount
            await db.commit()
            if recovered_count > 0:
                logger.warning(f"[CRASH RECOVERY SOTA] {recovered_count} tarefas presas no limbo ('running') foram resgatadas para 'pending'.")
    except Exception as e:
        logger.error(f"[SISTEMA] Falha ao executar Crash Recovery no SQLite: {e}")

async def _handle_hibernation(manager: QueueManager, status_line) -> bool:
    """Gerencia a homeostase de limite de budget. Retorna True se o worker deve aguardar."""
    hibernation_ts = await manager.get_system_state("hibernation_until")
    if not hibernation_ts:
        return False

    try:
        hibernation_until = datetime.fromisoformat(hibernation_ts)
        if datetime.now() < hibernation_until:
            status_line.update(f"[red]HIBERNACAO[/] Orcamento de API esgotado. Retorno as {hibernation_until.strftime('%H:%M')}.")
            await asyncio.sleep(60)
            return True
        else:
            # SOTA: Reset absoluto da memoria de bloqueios ao acordar da hibernacao
            await manager.set_system_state("hibernation_until", "")
            global_rate_limiter.tokens = float(global_rate_limiter.capacity)
            global_rate_limiter.last_fill = time.monotonic()
            async with get_telemetry_lock():
                ROUTE_BLOCKLIST.clear()
                KEY_BLOCKLIST.clear()
                GEMINI_MODEL_KEY_BLOCKLIST.clear()
                ROUTE_FAILURE_COUNTS.clear()
            logger.info("[SISTEMA IMUNOLOGICO] Hibernacao concluida. Amnesia de bloqueios induzida. Rotas, chaves e rate limits restaurados para Friccao Zero.")
    except (ValueError, TypeError):
        await manager.set_system_state("hibernation_until", "")  # Reseta estado invalido
    return False

def _update_terminal_status(counts: dict, running_tasks_count: int, status_line) -> None:
    """Atualiza o terminal com metricas operacionais de forma assincrona."""
    pending_count = counts.get("pending", 0)
    if os.name == "nt":
        import ctypes
        current_time = datetime.now().strftime("%H:%M:%S")
        ctypes.windll.kernel32.SetConsoleTitleW(f"NEXUS WORKER | Pendentes: {pending_count} | Rodando: {running_tasks_count} | Pulso: {current_time}")

    if status_line:
        status_line.update(f"[bold]Vigilia de Guardiao Absoluta SOTA[/] | Em Suspensao: [yellow]{pending_count}[/] | Corpos Ativos: [magenta]{running_tasks_count}[/] | Completas: [green]{counts.get('completed',0)}[/]")

async def _dispatch_optimal_task(manager: QueueManager, semaphore: asyncio.Semaphore, running_tasks: set) -> None:
    """Extrai e despacha a tarefa de maior utilidade usando o Grafo Topologico CPU."""
    pending_tasks = await manager.get_tasks(status='pending')
    if not pending_tasks:
        semaphore.release()
        await asyncio.sleep(0.5)  # Friccao Zero
        return

    loop = asyncio.get_running_loop()
    if loop:
        task = await loop.run_in_executor(None, UniversalArbitrator.extract_optimal_task, pending_tasks)
    else:
        task = None # Nao deve ocorrer em um worker ativo

    if task:
        display_id = str(task.id)
        if display_id.startswith("NOTIFY-"): display_id = f"[bold orange3]🔔 {task.id}[/]"
        elif display_id.startswith("AUTOFIX-"): display_id = f"[bold red]💉 {task.id}[/]"
        elif display_id.startswith("RESONANCE-"): display_id = f"[bold magenta]🌀 {task.id}[/]"
        elif display_id.startswith("HANDOFF-"): display_id = f"[bold cyan]🤝 {task.id}[/]"

        color = _agent_color(task.agent)
        logger.info(f"[bold magenta][>] ESPACO DE ENTRADA VITAL REQUISITADO:[/] [{color}]{task.agent}[/] (ID: {display_id})")
        await manager.update_task_status(task.id, "running")

        async def task_wrapper(task, manager, sem):
            released = False
            try:
                await execute_task_workflow(task, manager)
                import task_executor as task_exec
                if hasattr(task_exec, 'global_yield_manager'):
                    task_exec.global_yield_manager.clear_yield(task.id)
            except Exception as e:
                error_str = str(e).lower()
                # SOTA: Intercepta dependencias lentas, aplica o backoff exponencial e libera a fila.
                if any(k in error_str for k in ["depend", "lock", "starvation", "wait"]):
                    import task_executor as task_exec
                    yield_time = await task_exec.global_yield_manager.apply_yield(task, manager)
                    sem.release()
                    released = True
                    await asyncio.sleep(yield_time)
                    await manager.update_task_status(task.id, "pending")
                    return
                    err_color = _agent_color(task.agent)
                    logger.error(f"[[{err_color}]{task.agent}[/]] Falha catastrófica: {e}")
            finally:
                if not released:
                    sem.release()

        future = asyncio.create_task(task_wrapper(task, manager, semaphore))
        running_tasks.add(future)
        future.add_done_callback(running_tasks.discard)
    else:
        semaphore.release()
        await asyncio.sleep(0.5)

async def _cleanup_worker(manager: QueueManager, running_tasks: set) -> None:
    """Mitigacao de orfanizacao de tarefas e processos zombies no encerramento."""
    if running_tasks:
        logger.info(f"[SISTEMA] Cancelando {len(running_tasks)} tarefas em andamento (Graceful Shutdown)...")
        for task_future in running_tasks:
            task_future.cancel()
        try:
            await asyncio.wait(running_tasks, timeout=5.0)
        except Exception:
            pass
        try:
            async with aiosqlite.connect(manager.db_path) as db:
                await db.execute("UPDATE tasks SET status = 'pending' WHERE status = 'running'")
                await db.commit()
            logger.info("[SISTEMA] Tarefas orfas revertidas para 'pending'. Zumbis erradicados.")
        except Exception as e:
            logger.error(f"[SISTEMA] Falha ao curar estado zombie no banco de dados: {e}")

    if te.PID_FILE and te.PID_FILE.exists():
        try:
            te.PID_FILE.unlink() # type: ignore
        except OSError:
            pass

    import llm.session as _llm_session_mod
    session = _llm_session_mod._global_http_session
    if session and not session.closed:
        await session.close()

async def start_worker(manager: Optional[QueueManager] = None):
    if manager is None: manager = QueueManager()
    # SOTA: Escreve o PID para permitir parada graciosa e robusta via stop-worker
    if te.PID_FILE:
        try:
            with open(te.PID_FILE, "w") as f:
                f.write(str(os.getpid()))
        except IOError as e:
            logger.error(f"Nao foi possivel escrever o arquivo PID em {te.PID_FILE}: {e}")

    # 1. Limpa o terminal para o God Mode Visual
    os.system('cls' if os.name == 'nt' else 'clear')

    await _recover_zombies(manager)

    # 2. Varredura inicial da Fila
    counts = await manager.get_task_counts()
    pending   = counts.get("pending", 0)
    running   = counts.get("running", 0)
    completed = counts.get("completed", 0)
    failed    = counts.get("failed", 0)

    # Painel de Boas-vindas SOTA
    header = "[bold cyan]NEXUS ORCHESTRATOR[/] | [magenta]Kernel SOTA v7.1 (Manifestacao Maxima / Roteamento Assicrono)[/]\n"
    header += "[dim]A desorganizacao e a entropia findam nas correntes deste circuito. Abencado sob a Cosmologia Vitoi Absoluta.[/]\n\n"
    header += f"Ramificacoes Pendentes Atuais: [yellow]{pending}[/] | Entregas Imaculadas: [green]{completed}[/] | Falhas: [red]{failed}[/]"
    console.print(Panel(header, border_style="cyan", title="[bold]ESTABILIDADE OPERACIONAL COMPROVADA[/]", expand=False))

    status_line = console.status("[cyan]A imergir os fluxos da rede interligada global de neuronios ciberneticos...[/]", spinner="dots")
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
            except Exception as inner_e:
                logger.error(f"[bold red]FATAL[/] Arritmia no loop central do worker: {inner_e}")
                await asyncio.sleep(5)
    except (KeyboardInterrupt, asyncio.CancelledError):
        status_line.stop()
        logger.info("Pulso encerrado pelo usuario. Hibernando...")
    finally:
        status_line.stop()
        await _cleanup_worker(manager, running_tasks)
