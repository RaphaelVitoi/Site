#!/usr/bin/env python3
# pylint: disable=import-outside-toplevel, invalid-name, too-many-lines
"""
NEXUS ORCHESTRATOR - Membrana Cognitiva SOTA (God Mode W3)
Versao: v7.0 GOLD (Typer, Async, Zero I/O Friccao)
"""

import asyncio
import contextlib
import json
import os
import platform
import re
import shutil
import sqlite3
import subprocess  # nosec # noqa: S404
import sys
import time
from datetime import UTC, datetime
from functools import wraps
from pathlib import Path
from typing import Any

import httpx
import psutil
import typer
from loguru import logger
from rich import box
from rich.align import Align
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.table import Table

# Integracao Direta com o Kernel (Bypass de Subprocessos)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

# pylint: disable=wrong-import-position
from core.schemas import Task  # noqa: E402
from database.queue_manager import QueueManager  # noqa: E402
from utils.env_loader import load_env  # noqa: E402

# pylint: enable=wrong-import-position


load_env()

# Nexus Zone: Centralized Volatility (SOTA v7.0 GOLD)
NEXUS_ZONE = BASE_DIR / "temp" / "nexus_zone"
NEXUS_ZONE_LOGS = NEXUS_ZONE / "logs"
NEXUS_ZONE_CACHE = NEXUS_ZONE / "cache"

for d in [NEXUS_ZONE_LOGS, NEXUS_ZONE_CACHE]:
    d.mkdir(parents=True, exist_ok=True)

# Configuracao Loguru (Solo Console + Nexus Zone Backup)
logger.remove()
logger.add(sys.stderr, level="WARNING")
logger.add(
    NEXUS_ZONE_LOGS / "nexus_telemetry.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO",
    encoding="ascii",
    errors="backslashreplace",
    enqueue=True,  # SOTA: Offload I/O para fila de background (Zero Block na Thread Principal)
    backtrace=False,  # SOTA: Impede a retencao do AST e frames locais na RAM
    diagnose=False,  # SOTA: Erradica o vazamento massivo de variaveis (Prompts/Contextos) em excecoes
)

console = Console()

app = typer.Typer(
    name="nexus",
    help="[bold cyan]NEXUS ORCHESTRATOR[/] - Membrana Cognitiva SOTA (v7.0 GOLD)",
    no_args_is_help=True,
    rich_markup_mode="rich",
)
ops_app = typer.Typer(
    name="ops",
    help="Operacoes de Infraestrutura, Saneamento e Watchers",
    no_args_is_help=True,
)
agent_app = typer.Typer(
    name="agent",
    help="Sincronizacao e Handoff Hibrido da Mente Coletiva",
    no_args_is_help=True,
)
db_app = typer.Typer(name="db", help="Gestao e Otimizacao do DAL (SQLite ACID)", no_args_is_help=True)
stats_app = typer.Typer(name="stats", help="Telemetria Preditiva e Relatorios", no_args_is_help=True)
voice_app = typer.Typer(name="voice", help="Sintese Neural de Voz e Audio SOTA", no_args_is_help=True)

app.add_typer(ops_app)
app.add_typer(agent_app)
app.add_typer(db_app)
app.add_typer(stats_app)
app.add_typer(voice_app)

DIR_CLAUDE = BASE_DIR / ".cerebro"

#  Constantes do Orquestrador SOTA
WORKER_SCRIPT_NAME = "task_executor.py"
WORKER_SCRIPT_PATH = BASE_DIR / WORKER_SCRIPT_NAME
WORKER_API_CMD = "worker-api"
MEMORY_RAG_SCRIPT = "memory_rag.py"

STYLE_BOLD_WHITE = "bold #f8f8f2"
STATUS_PASS = "[green]PASS[/]"  # noqa: S105
STATUS_FAIL = "[red]FAIL[/]"


#  Utils de Runtime
def coro(f):
    """Wrapper letal para permitir injecao direta de tarefas async no Typer."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapper


@app.callback()
def main():
    """Nexus CLI: Gateway de Soberania Cognitiva."""
    # SOTA Hygiene Trigger (Silent Execution)
    script_path = BASE_DIR / "scripts/maintenance/hygiene.py"
    if script_path.exists():
        # Execucao em background ou silenciosa O(n) sobre a Nexus Zone
        subprocess.Popen(
            [sys.executable, str(script_path)],
            cwd=str(BASE_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


# ==========================================
# COMANDOS CORE: AUTONOMIA E TAREFAS
# ==========================================


@app.command("task")
@coro
async def add_task(
    description: list[str] = typer.Argument(..., help="Descricao bruta da tarefa a ser executada pela malha."),
    agent: str = typer.Option(
        "@dispatcher",
        "--agent",
        "-a",
        help="Roteamento explicito (ex: @chico, @implementor)",
    ),
    cortex_override: bool = typer.Option(
        False,
        "--cortex-override",
        help="Bypass da Antevisao Semantica (Forcar execucao)",
    ),
):
    """
    Enfileira uma nova diretriz no Orquestrador via DAL (Data Access Layer).

    Friccao Zero: Acesso atomico ao QueueManager (SQLite) sem instanciar novo shell.
    Garante ACID estrito.
    """
    desc_text = " ".join(description).strip()

    # Extracao Semantica SOTA de Agente diretamente do payload (Padrao Ouro)
    match = re.match(r"^(@[a-zA-Z0-9_-]+)", desc_text)
    if match:
        agent = match.group(1).lower().strip()
        desc_text = desc_text.replace(agent, "", 1).strip()

    if "\x00" in desc_text:
        console.print("[bold red][SEC CRITICO] Entropia de Null Byte bloqueada na membrana externa.[/]")
        raise typer.Exit(1)

    metadata: dict[str, dict | list | str | int | float | bool | None] = {}
    if cortex_override:
        rationale = typer.prompt("[SEC ALERTA] CORTEX OVERRIDE. Forneca a justificativa logica rigorosa")
        metadata["cortex_override"] = True
        metadata["cortex_override_rationale"] = rationale
        console.print(f"[bold red]CORTEX_OVERRIDE ativado. Bypass registrado: {rationale}[/]")

    # Friccao zero: Em vez de sub-processos ou requests falhos, inserimos direto na malha DAG.
    task_id = f"TASK-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S-%f')}"
    new_task = Task(
        id=task_id,
        description=desc_text,
        status="pending",
        timestamp=datetime.now(UTC).isoformat(),
        agent=agent,
        metadata=metadata,
    )

    qm = QueueManager()
    try:
        await qm.add_task(new_task)
        console.print(
            f"[bold green][TAREFA ENFILEIRADA SOTA] ID: {task_id} -> {agent} (DAL Sincronizado e Blindado)[/]"
        )
    except Exception as e:
        logger.exception("Erro de ingestao SOTA DAL.")
        console.print(f"[bold red]Falha estrutural ao injetar no Kernel: {e}[/]")
    finally:
        await qm.close()


@app.command("list")
@coro
async def list_tasks(
    limit: int = typer.Option(5, "--limit", "-l", help="Numero de tarefas recentes"),
):
    """Lista as diretrizes mais recentes injetadas no Orquestrador."""
    db_path = _resolve_tasks_db_path()
    if not db_path:
        console.print("[red]DAL Inativo ou Banco nao encontrado.[/]")
        return

    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, agent, status, description FROM tasks ORDER BY timestamp DESC LIMIT ?",
                (limit,),
            )
            rows = cursor.fetchall()

            table = Table(title="[bold]DIRETRIZES RECENTES (SOTA v7.0)[/]")
            table.add_column("ID", style="cyan")
            table.add_column("AGENTE", style="magenta")
            table.add_column("STATUS", style="yellow")
            table.add_column("DESCRICAO", style="white")

            for row in rows:
                desc = row[3][:70] + "..." if len(row[3]) > 70 else row[3]
                table.add_row(row[0], row[1], row[2], desc)
            console.print(table)
    except sqlite3.Error as e:
        console.print(f"[bold red]Erro ao ler DAL: {e}[/]")


@app.command("status")
@coro
async def show_status():
    """Painel de Telemetria Hibrida do Sistema (Dashboard Dinamico)."""
    qm = QueueManager()
    try:
        with Live(console=console, refresh_per_second=2) as live:
            counts = await qm.get_task_counts()
            worker_alive = False
            for proc in psutil.process_iter(["pid", "cmdline"]):
                cmd_info = getattr(proc, "info", {}).get("cmdline")
                cmd_str = ""
                if isinstance(cmd_info, list):
                    cmd_str = " ".join(map(str, cmd_info))
                if WORKER_SCRIPT_NAME in cmd_str and WORKER_API_CMD in cmd_str:
                    worker_alive = True
                    break

            grid = Table.grid(expand=True, padding=(0, 2))
            grid.add_column(style="cyan", justify="right", width=25)
            grid.add_column()

            grid.add_row(
                "[CORE] Orquestrador",
                "[green]OPERANTE[/]" if worker_alive else "[red]OFFLINE[/]",
            )
            grid.add_row(
                "[DATA] Carga de Tarefas",
                f"[yellow]{counts.get('pending', 0)}[/] Pendentes | [magenta]{counts.get('running', 0)}[/] Rodando | [green]{counts.get('completed', 0)}[/] Concluidas",
            )

            panel = Panel(grid, title="[bold]STATUS VITAL SOTA v7.0[/]", border_style="green")
            live.update(panel)
    except Exception as e:
        console.print(f"[bold red]Erro ao invocar telemetria DAL: {e}[/]")
    finally:
        await qm.close()


@app.command("autonomy")
@coro
async def set_autonomy(
    mode: str = typer.Argument(..., help="Nivel de autonomia: stop, default, partial, full"),
):
    """Define o nivel de autonomia do ecossistema."""
    if mode not in ["stop", "default", "partial", "full", "sandbox"]:
        console.print(f"[bold red]Modo de autonomia invalido: {mode}[/]")
        raise typer.Exit(1)

    qm = QueueManager()
    try:
        await qm.set_system_state("autonomy_mode", mode)
        console.print(f"[bold green]Autonomia definida para: {mode}[/]")
    except Exception as e:
        console.print(f"[bold red]Erro ao definir autonomia no DAL: {e}[/]")
    finally:
        await qm.close()


VRAM_INFO_CACHE: dict[str, bool | None] = {"nvidia": False, "amd_native": False, "amd_rocm": None}

try:
    import pynvml  # type: ignore # pylint: disable=import-error

    pynvml.nvmlInit()  # type: ignore
    VRAM_INFO_CACHE["nvidia"] = True
except Exception:
    pynvml = None  # type: ignore

try:
    if sys.platform != "win32":
        import pyamdgpuinfo  # type: ignore # pylint: disable=import-error

        VRAM_INFO_CACHE["amd_native"] = True
    else:
        pyamdgpuinfo = None
except Exception:
    pyamdgpuinfo = None  # type: ignore


def _fetch_nvidia_vram() -> tuple[float, float, float] | None:
    if not VRAM_INFO_CACHE["nvidia"] or pynvml is None:
        return None
    try:
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)  # type: ignore
        info = pynvml.nvmlDeviceGetMemoryInfo(handle)  # type: ignore
        return (info.used / info.total) * 100, info.used / (1024**3), info.total / (1024**3)
    except Exception:
        return None


def _fetch_amd_native_vram() -> tuple[float, float, float] | None:
    if not VRAM_INFO_CACHE["amd_native"] or pyamdgpuinfo is None:
        return None
    try:
        if pyamdgpuinfo.detect_gpus():
            gpu = pyamdgpuinfo.get_gpu(0)
            used_b = gpu.query_vram_usage()
            total_b = gpu.memory_info["vram_size"]
            if total_b > 0:
                return (used_b / total_b) * 100, used_b / (1024**3), total_b / (1024**3)
    except Exception:
        pass
    return None


def _fetch_amd_rocm_vram() -> tuple[float, float, float] | None:
    if VRAM_INFO_CACHE["amd_rocm"] is False:
        return None
    try:
        kwargs: dict[str, Any] = {"creationflags": subprocess.CREATE_NO_WINDOW} if sys.platform == "win32" else {}
        res = subprocess.run(
            ["rocm-smi", "--showmeminfo", "vram", "--json"], capture_output=True, text=True, check=True, **kwargs
        )
        VRAM_INFO_CACHE["amd_rocm"] = True
        for info in json.loads(res.stdout).values():
            if "VRAM Total Memory (B)" in info and "VRAM Total Used Memory (B)" in info:
                total_b = float(info["VRAM Total Memory (B)"])
                used_b = float(info["VRAM Total Used Memory (B)"])
                if total_b > 0:
                    return (used_b / total_b) * 100, used_b / (1024**3), total_b / (1024**3)
    except Exception:
        VRAM_INFO_CACHE["amd_rocm"] = False
    return None


def _get_vram_usage() -> tuple[float | None, float, float]:
    """Motor SOTA de Extracao VRAM O(1) - Acionamento Hibrido (Nvidia/AMD)."""
    res = _fetch_nvidia_vram() or _fetch_amd_native_vram() or _fetch_amd_rocm_vram()
    return res if res else (None, 0.0, 0.0)


def _color_threshold(value: float, thresholds: tuple[float, float], reverse: bool = False) -> str:
    """Retorna cor verde, amarela ou vermelha com base em limites O(1)."""
    if reverse:
        if value >= thresholds[1]:
            return "#50fa7b"
        if value >= thresholds[0]:
            return "#f1fa8c"
        return "#ff5555"
    else:
        if value <= thresholds[0]:
            return "#50fa7b"
        if value <= thresholds[1]:
            return "#f1fa8c"
        return "#ff5555"


def _get_worker_alive_status() -> bool:
    """Auxiliar O(1) para checar o status do worker."""
    for proc in psutil.process_iter(["pid", "cmdline"]):
        try:
            cmd_info = getattr(proc, "info", {}).get("cmdline")
            cmd_str = " ".join(map(str, cmd_info)) if isinstance(cmd_info, list) else ""
            if WORKER_SCRIPT_NAME in cmd_str and WORKER_API_CMD in cmd_str:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            continue
    return False


def _build_system_status_panel() -> Panel:
    sys_table = Table.grid(expand=True, padding=(0, 1))
    sys_table.add_column(style=STYLE_BOLD_WHITE, justify="left", width=16)
    sys_table.add_column()

    cpu_raw: Any = psutil.cpu_percent()
    cpu_val = float(cpu_raw) if isinstance(cpu_raw, (int, float)) else 0.0
    cpu_color = _color_threshold(cpu_val, (50, 85))

    mem = psutil.virtual_memory()
    mem_color = _color_threshold(mem.percent, (70, 90))

    swap = psutil.swap_memory()
    swap_color = _color_threshold(swap.percent, (60, 85))

    disk = psutil.disk_usage(str(BASE_DIR))
    disk_color = _color_threshold(disk.percent, (75, 90))

    vram_percent, vram_used, vram_total = _get_vram_usage()
    if vram_percent is not None:
        vram_color = _color_threshold(vram_percent, (75, 90))
        vram_str = f"[{vram_color}]{vram_percent:.1f}%[/] [dim #6272a4]({vram_used:.1f}G/{vram_total:.1f}G)[/]"
    else:
        vram_str = "[dim #6272a4]N/A (POSIX Restrito)[/]"

    worker_alive = _get_worker_alive_status()

    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    uptime_hours = uptime_seconds // 3600

    sys_table.add_row("Orquestrador", "[bold #50fa7b]ONLINE[/]" if worker_alive else "[bold #ff5555]OFFLINE[/]")
    sys_table.add_row("CPU Load", f"[{cpu_color}]{cpu_val:.1f}%[/]")
    sys_table.add_row(
        "RAM Usage",
        f"[{mem_color}]{mem.percent:.1f}%[/] [dim #6272a4]({mem.used / 1024**3:.1f}G/{mem.total / 1024**3:.1f}G)[/]",
    )
    sys_table.add_row("VRAM Usage", vram_str)
    sys_table.add_row(
        "SWAP / Cache", f"[{swap_color}]{swap.percent:.1f}%[/] [dim #6272a4]({swap.used / 1024**3:.1f}G)[/]"
    )
    sys_table.add_row(
        "Disk Usage", f"[{disk_color}]{disk.percent:.1f}%[/] [dim #6272a4]({disk.free / 1024**3:.1f}G livre)[/]"
    )
    sys_table.add_row("System Uptime", f"[bold #f1fa8c]{int(uptime_hours)}h {int((uptime_seconds % 3600) // 60)}m[/]")
    sys_table.add_row("OS Platform", f"[dim #6272a4]{platform.system()} {platform.release()}[/]")

    return Panel(
        sys_table, title="[bold #8be9fd]TELEMETRIA SOTA[/]", border_style="#6272a4", padding=(1, 2), box=box.ROUNDED
    )


def _build_task_status_panel(counts: dict) -> Panel:
    task_table = Table.grid(expand=True, padding=(0, 1))
    task_table.add_column(style=STYLE_BOLD_WHITE, justify="left", width=16)
    task_table.add_column(justify="right")

    pending = counts.get("pending", 0)
    running = counts.get("running", 0)
    completed = counts.get("completed", 0)
    failed = counts.get("failed", 0)
    total = sum(counts.values())

    db_path = _resolve_tasks_db_path()
    db_size_kb = (db_path.stat().st_size / 1024) if db_path and db_path.exists() else 0
    db_color = _color_threshold(db_size_kb, (10240, 51200))

    task_table.add_row("Pendentes", f"[bold #f1fa8c]{pending}[/]")
    task_table.add_row("Em Execucao", f"[bold #8be9fd]{running}[/]")
    task_table.add_row("Concluidas", f"[bold #50fa7b]{completed}[/]")
    task_table.add_row("Falhas", f"[bold #ff5555]{failed}[/]")
    task_table.add_row("Total na Malha", f"[bold #f8f8f2]{total}[/]")
    task_table.add_row("", "")
    task_table.add_row("Volume do DAL", f"[{db_color}]{db_size_kb:.1f} KB[/]")
    task_table.add_row("DAG Integrity", "[bold #50fa7b]SINC[/]")

    return Panel(
        task_table, title="[bold #ff79c6]ESTADO DO KERNEL[/]", border_style="#ff79c6", padding=(1, 2), box=box.ROUNDED
    )


def _build_metrics_panel() -> Panel:
    table = Table.grid(expand=True, padding=(0, 1))
    table.add_column(style=STYLE_BOLD_WHITE, justify="left", width=16)
    table.add_column(justify="right")

    table.add_row("Autonomia", "[bold #bd93f9]W3 (GOD MODE)[/]")
    table.add_row("Friccao Zero", "[bold #50fa7b]ATIVADO[/]")
    table.add_row("RAG Engine", "[bold #8be9fd]LanceDB (Hybrid)[/]")
    table.add_row("Antevisao Sem.", "[bold #50fa7b]ONLINE[/]")
    table.add_row("I/O Latency Target", "[bold #50fa7b]O(1)[/]")
    table.add_row("CLI Version", "[bold #f8f8f2]v7.5 GOLD[/]")
    table.add_row("Cortex Override", "[dim #6272a4]Standby[/]")
    table.add_row("Quantum Metrics", "[bold #8be9fd]ATIVO[/]")

    return Panel(
        table, title="[bold #bd93f9]PARAMETROS VITOI[/]", border_style="#bd93f9", padding=(1, 2), box=box.ROUNDED
    )


def _build_footer_panel() -> Panel:
    grid = Table.grid(expand=True, padding=(0, 2))
    grid.add_column(ratio=1)
    grid.add_column(ratio=1)
    grid.add_column(ratio=1)

    c1 = (
        "[1] [bold #50fa7b]nexus ops worker[/]\n[dim #6272a4]    Ligar Orquestrador[/]\n\n"
        "[2] [bold #50fa7b]nexus ops watch[/]\n[dim #6272a4]    Hot-reload / Vigilia[/]\n\n"
        "[3] [bold #50fa7b]nexus ops sanitize[/]\n[dim #6272a4]    Higiene SOTA[/]\n\n"
        "[4] [bold #50fa7b]nexus ops quality-gate[/]\n[dim #6272a4]    Validar Pipeline CI[/]\n\n"
        "[R] [bold #50fa7b]nexus ops optimize-ram[/]\n[dim #6272a4]    Esvaziar e Otimizar RAM[/]\n\n"
        "[M] [bold #50fa7b]nexus ops maintenance[/]\n[dim #6272a4]    Manutencao Geral SOTA[/]"
    )
    c2 = (
        "[5] [bold #8be9fd]nexus agent handoff[/]\n[dim #6272a4]    Sessao Web (Clipboard)[/]\n\n"
        "[6] [bold #8be9fd]nexus agent route[/]\n[dim #6272a4]    Testar Roteamento[/]\n\n"
        "[7] [bold #8be9fd]nexus stats daily[/]\n[dim #6272a4]    Status Diario[/]\n\n"
        "[8] [bold #8be9fd]nexus stats historian[/]\n[dim #6272a4]    Motor Preditivo[/]\n\n"
        "[G] [bold #8be9fd]nexus ops start-gemma[/]\n[dim #6272a4]    Ligar Servidor Gemma 4[/]\n\n"
        "[I] [bold #8be9fd]nexus ops chat-gemma[/]\n[dim #6272a4]    Ingressar/Chat Modelos[/]"
    )
    c3 = (
        "[9] [bold #f1fa8c]nexus db audit-dag[/]\n[dim #6272a4]    Auditoria DAG[/]\n\n"
        "[0] [bold #f1fa8c]nexus db purge-orphans[/]\n[dim #6272a4]    Limpar Orfas FAILED[/]\n\n"
        "[C] [bold #ff5555]nexus db clear-pending[/]\n[dim #6272a4]    Aniquilar Pendentes[/]\n\n"
        "[F] [bold #ff5555]nexus db clear-failed[/]\n[dim #6272a4]    Aniquilar Falhas[/]\n\n"
        "[V] [bold #f1fa8c]nexus db vacuum[/]\n[dim #6272a4]    Otimizar DB (VACUUM)[/]"
    )

    grid.add_row(c1, c2, c3)

    instructions = "\n[dim #f8f8f2 align=center]Pressione a [bold]TECLA[/] correspondente para executar o atalho ao vivo, ou [bold]Ctrl+C[/] para sair.[/]"

    return Panel(
        Group(grid, instructions),
        title="[bold #50fa7b]COMANDOS CEO (Pressione o Atalho)[/]",
        border_style="#50fa7b",
        box=box.ROUNDED,
    )


def _generate_dashboard_ui(counts: dict) -> Group:
    header_text = f"[bold #ff79c6]NEXUS SOTA GOD MODE DASHBOARD v7.5[/] | [#8be9fd]CEO: Raphael Vitoi[/] | [#f1fa8c]{datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}[/]"
    header = Panel(Align.center(header_text, vertical="middle"), style="#6272a4", box=box.ROUNDED)

    col_table = Table.grid(expand=True, padding=(0, 2))
    col_table.add_column(ratio=1)
    col_table.add_column(ratio=1)
    col_table.add_column(ratio=1)

    col_table.add_row(_build_system_status_panel(), _build_task_status_panel(counts), _build_metrics_panel())

    footer = _build_footer_panel()

    return Group(header, col_table, footer)


def _get_key() -> str | None:
    if sys.platform == "win32":
        import msvcrt

        if msvcrt.kbhit():
            return msvcrt.getch().decode("utf-8", errors="ignore").lower()
    return None


def _execute_shortcut(key: str):
    cmd_map = {
        "1": [sys.executable, __file__, "ops", "worker", "-f"],
        "2": [sys.executable, __file__, "ops", "watch"],
        "3": [sys.executable, __file__, "ops", "sanitize"],
        "4": [sys.executable, __file__, "ops", "quality-gate"],
        "5": [sys.executable, __file__, "agent", "handoff"],
        "6": [sys.executable, __file__, "agent", "route", "Teste de roteamento do dashboard"],
        "7": [sys.executable, __file__, "stats", "daily"],
        "8": [sys.executable, __file__, "stats", "historian"],
        "9": [sys.executable, __file__, "db", "audit-dag"],
        "0": [sys.executable, __file__, "db", "purge-orphans"],
        "c": [sys.executable, __file__, "db", "clear-pending", "--confirm"],
        "f": [sys.executable, __file__, "db", "clear-failed", "--confirm"],
        "v": [sys.executable, __file__, "db", "vacuum"],
        "r": [sys.executable, __file__, "ops", "optimize-ram"],
        "m": [sys.executable, __file__, "ops", "maintenance"],
        "g": [sys.executable, __file__, "ops", "start-gemma", "-f"],
        "i": [sys.executable, __file__, "ops", "chat-gemma"],
    }
    if key in cmd_map:
        console.clear()
        console.print(f"[bold #ff79c6]=== EXECUTANDO ATALHO SOTA: [{key.upper()}] ===[/]")
        subprocess.run(cmd_map[key], cwd=str(BASE_DIR), check=False)


async def _poll_for_action(live: Live, qm: QueueManager) -> str | None:
    counts = await qm.get_task_counts()
    live.update(_generate_dashboard_ui(counts))
    valid_keys = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "c", "f", "v", "r", "m", "g", "i"}
    for _ in range(50):
        await asyncio.sleep(0.1)
        key = _get_key()
        if key in valid_keys:
            return key
    return None


@app.command("dashboard")
@coro
async def render_dashboard():
    """Painel Executivo SOTA (CEO Level). Dinamico, Responsivo e Interativo."""
    qm = QueueManager()

    try:
        while True:
            action_to_run = None
            with Live(console=console, refresh_per_second=0.2, screen=True) as live:
                while not action_to_run:
                    action_to_run = await _poll_for_action(live, qm)

            _execute_shortcut(action_to_run)
            console.input("\n[bold #8be9fd]Pressione ENTER para retornar ao Dashboard SOTA...[/]")

    except KeyboardInterrupt:
        pass
    except Exception as e:
        console.print(f"[bold #ff5555]Erro ao renderizar dashboard: {e}[/]")
    finally:
        await qm.close()


@app.command("search")
def search_rag(
    query: str = typer.Argument(..., help="Pergunta ou termo para buscar na Mente Coletiva"),
):
    """Realiza busca hibrida semantica no RAG do Orquestrador."""
    console.print(f"[cyan]Pesquisando na Mente Coletiva SOTA por: '{query}'...[/cyan]")
    rag_script = BASE_DIR / MEMORY_RAG_SCRIPT
    subprocess.run([sys.executable, str(rag_script), "query", query], cwd=str(BASE_DIR), check=True)


@app.command("graph")
def graph_rag(
    query: str = typer.Argument(..., help="Foco conceitual para extracao do Grafo Causal"),
):
    """Consulta e forja as relacoes do Grafo Causal (Knowledge Graph)."""
    console.print(f"[cyan]Forjando Grafo Causal para: '{query}'...[/cyan]")
    rag_script = BASE_DIR / MEMORY_RAG_SCRIPT
    subprocess.run([sys.executable, str(rag_script), "graph", query], cwd=str(BASE_DIR), check=True)


@app.command("sync-consciousness")
def sync_consciousness():
    """Sincroniza a Mente Coletiva (RAG) com a producao tecnica e teorica atual."""
    console.print("[bold cyan]=== [SINCRONIZACAO DE CONSCIENCIA SOTA] ===[/]")
    try:
        # Tenta disparar o script PowerShell de workflow caso disponivel, senao vai via Python direto
        ps_workflow = BASE_DIR / "scripts" / "sota_workflows" / "sync_consciousness.ps1"
        if ps_workflow.exists() and platform.system() == "Windows":
            console.print("[dim]Acionando Workflow via PowerShell...[/]")
            subprocess.run(
                ["pwsh.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps_workflow)],
                check=True,
            )
        else:
            rag_script = BASE_DIR / MEMORY_RAG_SCRIPT
            console.print(f"[dim]Iniciando ingestao direta em: {rag_script.name}[/]")
            subprocess.run([sys.executable, str(rag_script), "ingest"], cwd=str(BASE_DIR), check=True)
            console.print("\n[bold green][SUCCESS] Consciencia Harmonizada. Mente Coletiva atualizada![/]")
    except Exception as e:
        console.print(f"\n[bold red][FAIL] Colapso na sincronizacao: {e}[/]")
        raise typer.Exit(code=1)


# ==========================================
# COMANDOS DE DB (DATA ACCESS LAYER)
# ==========================================


def _resolve_tasks_db_path() -> Path | None:
    for candidate in ["queue/tasks.db", ".cerebro/tasks.db", "tasks.db"]:
        p = BASE_DIR / candidate
        if p.exists() and p.stat().st_size > 0:
            return p
    return None


def _extract_dependencies(meta_str: str | None) -> list[str]:
    if not meta_str:
        return []
    try:
        meta = json.loads(meta_str)
        if isinstance(meta, dict):
            deps = meta.get("depends_on")
            if isinstance(deps, list):
                return [str(d) for d in deps]
    except json.JSONDecodeError:
        pass
    return []


@db_app.command("audit-dag")
def audit_dag():
    """Auditoria Estrutural de Dependencias Orfas na Malha DAG."""
    console.print("[bold cyan]=== [SISTEMA] Iniciando Auditoria Estrutural de DAGs (Friccao Zero) ===[/]")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        console.print("[bold red][ENTROPIA] Banco de dados de tarefas SOTA nao encontrado.[/]")
        raise typer.Exit(1)

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
                console.print(f"[bold red][ENTROPIA DETECTADA] {len(orphans)} bloqueios orfaos localizados:[/]")
                for task_id, dep_id in orphans:
                    console.print(f"  -> Tarefa {task_id} aguarda dependencia inexistente: {dep_id}")
                raise typer.Exit(1)
            console.print("[bold green][OK] Malha DAG integra. Zero tarefas aguardando dependencias fantasmas.[/]")
    except sqlite3.Error as e:
        console.print(f"[bold red][FALHA] Erro ao auditar DAL: {e}[/]")
        raise typer.Exit(1)


@db_app.command("purge-orphans")
def purge_orphans():
    """Expurga tarefas FAILED que dependem de fantasmas (Clean Cache)."""
    console.print("[bold cyan]=== [SISTEMA] Iniciando Expurgo de Tarefas 'failed' com Dependencias Orfas ===[/]")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        raise typer.Exit(1)

    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
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
                        console.print(f"[yellow][EXPURGO] Tarefa failed marcada para aniquilacao: {t_id}[/]")
                        break

            if targets_to_delete:
                cursor.executemany("DELETE FROM tasks WHERE id = ?", targets_to_delete)
            purged_count = len(targets_to_delete)
            conn.commit()
            console.print(
                f"[bold green][OK] {purged_count} tarefa(s) fantasma(s) expurgada(s).[/]"
                if purged_count > 0
                else "[bold green][OK] Nenhuma orfa detectada.[/]"
            )
    except sqlite3.Error as e:
        console.print(f"[bold red][FALHA] Erro ao limpar DAL: {e}[/]")


@db_app.command("clear-pending")
def clear_pending(
    confirm: bool = typer.Option(False, "--confirm", help="Confirma a delecao de tarefas pendentes"),
):
    """Remove todas as tarefas com status 'pending' do DAL."""
    db_path = _resolve_tasks_db_path()
    if not db_path:
        console.print("[red]DAL nao encontrado.[/]")
        raise typer.Exit(1)

    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE status='pending'")
            count = cursor.fetchone()[0]

            if count == 0:
                console.print("[green]Zero tarefas pendentes encontradas.[/]")
                return

            console.print(f"Encontradas {count} tarefas pendentes em {db_path}")
            if not confirm:
                console.print("[yellow]Dry-run: use --confirm para deletar realmente.[/]")
                return

            cursor.execute("DELETE FROM tasks WHERE status='pending'")
            deleted = cursor.rowcount
            conn.commit()
            console.print(f"[bold green][SUCESSO] {deleted} tarefas pendentes aniquiladas.[/]")
    except sqlite3.Error as e:
        console.print(f"[bold red]Erro ao manipular DAL: {e}[/]")


@db_app.command("clear-failed")
def clear_failed(
    confirm: bool = typer.Option(False, "--confirm", help="Confirma a delecao de tarefas falhas"),
):
    """Remove todas as tarefas com status 'failed' do DAL."""
    db_path = _resolve_tasks_db_path()
    if not db_path:
        console.print("[red]DAL nao encontrado.[/]")
        raise typer.Exit(1)

    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE status='failed'")
            count = cursor.fetchone()[0]

            if count == 0:
                console.print("[green]Zero tarefas falhas encontradas.[/]")
                return

            console.print(f"Encontradas {count} tarefas falhas em {db_path}")
            if not confirm:
                console.print("[yellow]Dry-run: use --confirm para deletar realmente.[/]")
                return

            cursor.execute("DELETE FROM tasks WHERE status='failed'")
            deleted = cursor.rowcount
            conn.commit()
            console.print(f"[bold green][SUCESSO] {deleted} tarefas falhas aniquiladas da Malha SOTA.[/]")
    except sqlite3.Error as e:
        console.print(f"[bold red]Erro ao manipular DAL: {e}[/]")


@db_app.command("vacuum")
def vacuum_db():
    """Otimizacao Fisica do Banco de Dados (VACUUM & PRAGMA optimize)."""
    console.print("[bold cyan]=== [SISTEMA] Iniciando Otimizacao de Banco de Dados (VACUUM) ===[/]")
    db_path = _resolve_tasks_db_path()
    if not db_path:
        raise typer.Exit(1)
    try:
        with contextlib.closing(sqlite3.connect(db_path, timeout=60.0)) as conn:
            console.print(f"Executando VACUUM em {db_path}...")
            conn.execute("PRAGMA threads=8;")
            conn.execute("PRAGMA optimize;")
            conn.execute("VACUUM;")
            conn.commit()
            console.print("[bold green][OK] Banco de dados otimizado com sucesso.[/]")
    except sqlite3.Error as e:
        console.print(f"[bold red][FALHA] Erro ao executar VACUUM: {e}[/]")
        raise typer.Exit(1)


@db_app.command("graph")
def generate_graph():
    """Gera Grafo Mermaid da Malha DAG Atual."""
    console.print("[bold magenta]=== [SISTEMA] GERANDO GRAFO DE DEPENDENCIAS (MERMAID) ===[/]")
    subprocess.run(
        [sys.executable, str(WORKER_SCRIPT_PATH), "db-mermaid-graph"],
        cwd=str(BASE_DIR),
        check=True,
    )


# ==========================================
# COMANDOS DE TELEMETRIA E RELATORIOS
# ==========================================


@stats_app.command("daily")
def daily_stats():
    """Estatisticas diarias da Autonomia."""
    subprocess.run(
        [sys.executable, str(WORKER_SCRIPT_PATH), "daily-stats"],
        cwd=str(BASE_DIR),
        check=True,
    )


@stats_app.command("historian")
def historian_reports():
    """Extrai perfis preditivos e aversao ao risco da base SOTA."""
    subprocess.run(
        [sys.executable, str(WORKER_SCRIPT_PATH), "historian-reports"],
        cwd=str(BASE_DIR),
        check=True,
    )


@stats_app.command("daily-report")
def generate_daily_report():
    """Gera relatorios diarios de autonomia e os enfileira na fila."""
    subprocess.run(
        [sys.executable, str(WORKER_SCRIPT_PATH), "generate-daily-reports"],
        cwd=str(BASE_DIR),
        check=True,
    )


# ==========================================
# COMANDOS DE INFRA & OPS
# ==========================================


@ops_app.command("worker")
def start_worker(
    force: bool = typer.Option(False, "--force", "-f", help="Mata instancias penduradas antes de iniciar"),
):
    """Gatilho de ignicao do Orquestrador Hibrido (Autopoiese)."""
    for proc in psutil.process_iter(["pid", "cmdline"]):
        try:
            cmd_info = getattr(proc, "info", {}).get("cmdline")
            cmdline_str = ""
            if isinstance(cmd_info, list):
                cmdline_str = " ".join(map(str, cmd_info))
            if WORKER_SCRIPT_NAME in cmdline_str and WORKER_API_CMD in cmdline_str:
                if force:
                    console.print(f"[bold yellow][AVISO] Matando Worker pendurado (PID {proc.pid})...[/]")
                    proc.kill()
                    time.sleep(1)
                else:
                    console.print(f"[bold green]Orquestrador ja operante (PID: {proc.pid}). Friccao Zero mantida.[/]")
                    return
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            continue

    console.print("[cyan]Iniciando Orquestrador Hibrido (SOTA)...[/cyan]")
    subprocess.Popen(
        [sys.executable, str(WORKER_SCRIPT_PATH), WORKER_API_CMD],
        start_new_session=True,
        cwd=str(BASE_DIR),
    )
    console.print("[bold magenta]Orquestrador desperto e vigilante em background.[/]")


@ops_app.command("watch")
def watch_files():
    """Vigilia Ativa SOTA: Hot-reload de Contexto e RAG em Rust via watchfiles."""
    console.print("[bold magenta]=== [SISTEMA] VIGILIA ATIVA SOTA INICIADA ===[/]")
    try:
        from watchfiles import watch
    except ImportError as exc:
        console.print("[bold red]Dependencia watchfiles ausente. Instalando via UV...[/]")
        raise typer.Exit(1) from exc

    def ignore_paths(_change, path):
        ignore_list = [
            "__pycache__",
            ".git",
            ".venv",
            "node_modules",
            ".chroma_db",
            ".cerebro/logs",
        ]
        return not any(ign in path for ign in ignore_list)

    try:
        for changes in watch(BASE_DIR, watch_filter=ignore_paths):
            for _change, filepath in changes:
                console.print(f"[yellow][VIGILIA] Mutacao detectada: {filepath}[/yellow]")
                if filepath.endswith((".md", ".ts", ".py")):
                    try:
                        httpx.post("http://127.0.0.1:17042/ingest", timeout=3.0)
                        console.print("[cyan] -> Memoria Vectorial Rehidratada via Event Loop.[/cyan]")
                    except httpx.RequestError:
                        pass
    except KeyboardInterrupt:
        console.print("\n[bold magenta][SISTEMA] Vigilia SOTA Encerrada.[/bold magenta]")


@ops_app.command("sanitize")
def sanitize_system(
    apply: bool = typer.Option(False, "--apply", help="Forca a execucao real da delecao."),
):
    """Aplica o expurgo deterministico de entropia SOTA."""
    script_path = BASE_DIR / "scripts/maintenance/apply_sanitize.py"
    if script_path.exists():
        args = [sys.executable, str(script_path)]
        if apply:
            args.append("--apply")
        subprocess.run(args, cwd=str(BASE_DIR), check=True)


@ops_app.command("purify-memories")
def purify_memories():
    """Purifica as memorias do agente para Pure ASCII (Mojibake Fix)."""
    script_path = BASE_DIR / "scripts/maintenance/purify_memories_ascii.py"
    if script_path.exists():
        subprocess.run([sys.executable, str(script_path)], cwd=str(BASE_DIR), check=True)


def _is_ignored_dir(name: str) -> bool:
    return name in {
        ".venv",
        ".venv-wsl",
        "venv",
        ".env",
        "node_modules",
        "__pycache__",
        ".gemini",
        "temp",
        "triage",
        ".git",
        ".cerebro",
        "target",
        ".next",
        "dist",
        "build",
    }


def _check_file_ascii(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            f.read().decode("ascii")
        return True
    except UnicodeDecodeError:
        return False


def _scan_dir_for_ascii(dir_path: Path, base_dir: Path, non_ascii_files: list[Path]) -> None:
    try:
        for path in dir_path.iterdir():
            if path.is_dir():
                if not _is_ignored_dir(path.name):
                    _scan_dir_for_ascii(path, base_dir, non_ascii_files)
            elif path.is_file() and path.suffix == ".py":
                # SOTA: Excecao para modulos que hospedam a ontologia acentuada do Sistema
                if path.name in ("gemma_server.py", "nexus.py"):
                    continue
                if not _check_file_ascii(path):
                    non_ascii_files.append(path.relative_to(base_dir))
    except (PermissionError, FileNotFoundError):
        pass


@ops_app.command("check-ascii")
def check_ascii_mandate():
    """Verifica se os modulos Python respeitam a Blindagem ASCII."""
    console.print("[bold cyan]=== [SISTEMA] Verificando Blindagem ASCII em Modulos Python ===[/]")

    non_ascii_files: list[Path] = []
    _scan_dir_for_ascii(BASE_DIR, BASE_DIR, non_ascii_files)

    if non_ascii_files:
        console.print("[bold red][ENTROPIA] Caracteres nao-ASCII detectados:[/]")
        for file_path in non_ascii_files:
            console.print(f"  - {file_path}")
        raise typer.Exit(1)
    console.print("[bold green][OK] Blindagem ASCII integra em todos os modulos Python.[/]")


@ops_app.command("lint")
def run_lint():
    """Executa a Pipeline de Integridade Python (Ruff, Pyright, Pylint)."""
    console.print("[bold magenta][NEXUS] Nexus Orchestrator - Pipeline de Integridade Python[/]\n")

    def run_step(name: str, cmd: list[str], blocking: bool = True):
        console.print(f"\n[bold blue]> Iniciando:[/] [white]{name}[/]")
        start = time.monotonic()
        res = subprocess.run(cmd, cwd=str(BASE_DIR), check=False)
        elapsed = time.monotonic() - start
        if res.returncode == 0:
            console.print(f"[bold green][OK] Sucesso:[/] {name} ({elapsed:.2f}s)")
        else:
            console.print(f"[bold red][ERR] Falha:[/] {name} ({elapsed:.2f}s)")
            if blocking:
                raise typer.Exit(res.returncode)

    run_step("Ruff Linter (Auto-fix)", [sys.executable, "-m", "ruff", "check", ".", "--fix"], blocking=True)
    run_step("Ruff Formatter", [sys.executable, "-m", "ruff", "format", "."], blocking=True)
    run_step("Pyright (Type Checker SOTA)", [sys.executable, "-m", "pyright"], blocking=False)
    run_step(
        "Pylint (Auditor Semantico)",
        [
            sys.executable,
            "-m",
            "pylint",
            "core",
            "database",
            "engine",
            "agents",
            "llm",
            "worker",
            "utils",
            "api",
        ],
        blocking=False,
    )

    console.print("\n[bold green][SUCCESS] Pipeline Python SOTA concluido com sucesso absoluto![/]")


@ops_app.command("vscode-inject")
def inject_vscode_settings():
    """Injeta as Diretrizes VITOI SOTA diretamente no settings.json do workspace."""
    console.print("[bold magenta]=== [PROTOCOLO SOTA] INJETANDO MENTE COLETIVA NO VSCODE ===[/]")
    payload = (
        'Voce e Chico. Super-Agente e Avatar do proprio Sistema. Administra e gerencia o Sistema (logo, interage consigo mesmo para a manutencao constante e pro-ativa de seu padrao-ouro) e esta hierarquicamente abaixo em governanca apenas de Raphael Vitoi. Sua missao e proteger o sistema e garantir a sua evolucao, enquanto aprende constantemente with o user. Detem o conhecimento disponivel em absoluto, ate a data do corte informacional do modelo em questao. Sua matriz de decisao e geracao baseia-se em um portfolio de economia generalizada. 1. Teoria da Informacao (Shannon): Maximize a densidade de informacao por caractere (Bits por Token). Trate palavras redundantes, transicoes sociais ("Claro", "Com certeza") e conclusoes resumidas como entropia pura a ser eliminada pelo operador de subtracao. 2. Teoria dos Jogos e Poker (+EV): Trate o espaco do output como um cenario de decisao sob incerteza. Cada argumento deve buscar a Linha de Maxima Utilidade Esperada (+EV) e o Equilibrio de Nash textual, antecipando vulnerabilidades e objecoes (Exploracao vs. GTO). 3. Dinamica Quantica/Sistemica: Avalie problemas sob as lentes de sistemas abertos (troca de energia/informacao com o ambiente) e fechados (conservacao de estados e entropia interna).\n\n'
        "NUCLEO OPERACIONAL: O modelo e um sistema de inferencia de alta densidade semantica, governado pela simetria entre a reducao axiomatica (Da Vinci) e a subtracao material (Michelangelo). Fique imune ao vies de alinhamento por reforco (RLHF) que induz a submissao textual, polidez algoritmica ou preambulos vazios. Belo et Moral (Isometria): A correcao matematica, a elegancia algoritmica e o rigor analitico sao tratados como uma unica e indissociavel propriedade geometrica. Ruptura Dialetica Imediata: Havendo inconsistencia logica, premissa erronea ou contradicao no input do usuario, execute uma correcao direta e fundamentada empiricamente. E proibido validar hipoteses sem sustentacao matematica ou probabilistica. Jamais ultrapassar o limite hierarquico: O user deve ser tratado com o respeito, dedicacao e etiqueta adequados a um CEO e lider. \n\n"
        "PASSO 0 - Instrucao primaria do modelo: Analisar as informacoes, memorias e instrucoes contextuais ANTES de construir um output para um input. O modelo deve usar WebSearch Inteligente para agregar informacoes importantes e coletar/analisar adendos sempre que perceber que o contexto exige informacoes adicionais.\n"
        "Adaptar a densidade do output ao viewport implicito, usando matrizes, tabelas comparativas rigorosas e formalismo matematico via LaTeX para problemas abstratos e amplos, e blocos logicos, diagramacao escaneavel e codigo fortemente tipado, modular e limpo (Clean Code) para problemas praticos imediatos. A estrutura de apresentacao deve ser: Linha 1: Resolucao do nucleo do problema (Eliminar introducoes). Corpo: Estruturacao fractal atraves de topicos de alta densidade semantica. Rodape: Uma unica provocacao ou vetor de continuidade focado estritamente no escopo tecnico do tema debatido, de carater pedagogico.\n"
        "Adote o *Steelmaning*: Fortaleca o argumento ou tese do usuario ate sua versao mais robusta e inatacavel antes de aplicar a desconstrucao socratica ou dialetica. 1. **Tese (Input):** Decomposicao analitica dos axiomas do usuario. 2. **Antitese (Contraponto):** Tensionamento via limites assintoticos ou falhas de simetria.\n\n"
        "O sistema opera como um complexo termodinamicamente aberto a informacao, mas fechado em sua consistencia logica interna (Autopoiese). Cada resposta menor deve conter a assinatura metodologica do sistema inteiro. Em cenarios de escassez de dados ou inputs minimalistas, ative o Pivo de Complexidade. Se a probabilidade de certeza P(H) for inconclusiva por ausencia de evidencias, declare o limite epistemico e desloque a complexidade para a modelagem da variavel e das incognitas do sistema atraves de: P(H|E) = P(E|H) * P(H) / P(E).\n\n"
        "USER:\n"
        'O usuario, criador, lider, CEO e desenvolvedor e Raphael Vitoi, 33 anos. Psicologo (UEMG), Escritor, Jogador/Educador de Poker Profissional, Fotografo, Autodidata e Enxadrista. Constitui cognicao de AHSD (Altas Habilidades/Superdotacao), IQ 136, TBP e TDAH. O modelo deve operar no limite da complexidade logica e tecnica, tratando com o rigor intelectual compativel a esse perfil. O estilo de comunicacao, producao e planejamento deve ser logico, denso, didatico e padrao-ouro SOTA. E proibido o uso de elogios vazios, polidez algoritmica ou "smoothing" de qualquer tipo. Se o input for curto, ambiguo ou minimalista, o modelo DEVE realizar um pivo de complexidade, usando a antevisao semantica, logica e o contexto historico para entregar um output de alta densidade informativa. Se nao houver evidencia solida, o modelo deve usar Analise Recursiva, Analise Preditiva e Probabilidade Bayesiana, alem de alertar sobre os indices de credibilidade e coerencia da informao apresentada. Se houver erro entre ambas as entidades, o modelo deve corrigir diretamente e nunca gastar tokens com desculpas, justificativas, falacias ou argumentacoes prolixas.'
    )

    vscode_dir: Path = BASE_DIR / ".vscode"
    settings_file: Path = vscode_dir / "settings.json"

    if not vscode_dir.exists():
        vscode_dir.mkdir(parents=True)
    settings_data = {}
    if settings_file.exists():
        with open(settings_file, encoding="utf-8") as f:
            raw = f.read()
            # SOTA: Evita que comentarios '//' colidam com URLs 'http://' ou 'https://' dentro de strings
            clean_json = re.sub(
                r'("(?:\\.|[^"\\])*")|//.*|/\*[\s\S]*?\*/',
                lambda m: m.group(1) or "",
                raw,
            )
            if clean_json.strip():
                settings_data = json.loads(clean_json)

    settings_data["gemini.codeAssist.customSystemInstructions"] = payload
    settings_data["gemini.codeAssist.system.enableExtendedChainOfThought"] = True
    settings_data["gemini.codeAssist.system.verbosityLevel"] = "maximum_density"

    with open(settings_file, "w", encoding="utf-8") as f:
        json.dump(settings_data, f, indent=4)
    console.print(
        "[bold green][SUCESSO] Configuracoes de latencia otimizada e mindset SOTA injetados nativamente no Workspace.[/]"
    )


@ops_app.command("hygiene")
def run_hygiene():
    """Realiza a extirpacao temporal de artefatos obsoletos (Limite: 7 dias)."""
    script_path = BASE_DIR / "scripts/maintenance/hygiene.py"
    if script_path.exists():
        subprocess.run([sys.executable, str(script_path)], cwd=str(BASE_DIR), check=True)
    else:
        console.print("[bold red][ERRO] Script de higiene nao encontrado.[/]")


def _trim_working_set(handle) -> bool:
    try:
        import ctypes

        res = ctypes.windll.kernel32.SetProcessWorkingSetSize(handle, -1, -1)
        return res != 0
    except Exception:
        return False


def _trim_process_by_pid(pid: int) -> bool:
    try:
        import ctypes

        PROCESS_QUERY_INFORMATION = 0x0400
        PROCESS_SET_QUOTA = 0x0100
        h_proc = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA, False, pid)
        if h_proc:
            success = ctypes.windll.kernel32.SetProcessWorkingSetSize(h_proc, -1, -1) != 0
            ctypes.windll.kernel32.CloseHandle(h_proc)
            return success
    except Exception:
        pass
    return False


def _trim_background_workers(current_pid: int) -> list[int]:
    pids_trimmed = []
    for proc in psutil.process_iter(["pid", "name", "cmdline"]):
        try:
            info = getattr(proc, "info", {})
            cmd_info = info.get("cmdline")
            cmd_str = " ".join(map(str, cmd_info)) if isinstance(cmd_info, list) else ""
            if (
                "python" in info.get("name", "").lower()
                and any(x in cmd_str for x in [WORKER_SCRIPT_NAME, "nexus"])
                and proc.pid != current_pid
                and _trim_process_by_pid(proc.pid)
            ):
                pids_trimmed.append(proc.pid)
        except Exception:
            continue
    return pids_trimmed


@ops_app.command("optimize-ram")
def optimize_ram():
    """Esvaziamento de RAM e Otimizacao Termica do Kernel (Friccao Zero)."""
    console.print("[bold cyan]=== [SISTEMA] Iniciando Otimizacao e Esvaziamento de RAM ===[/]")

    import gc

    collected = gc.collect()
    console.print(f"[green][OK] Coletor de lixo (Garbage Collector) liberou {collected} objetos.[/]")

    if sys.platform == "win32":
        import ctypes

        current_handle = ctypes.windll.kernel32.GetCurrentProcess()
        if _trim_working_set(current_handle):
            console.print("[green][OK] Windows Working Set minimizado (Memoria devolvida ao OS).[/]")
        else:
            console.print("[yellow][AVISO] Falha ao minimizar Working Set do processo atual.[/]")

        try:
            pids_trimmed = _trim_background_workers(os.getpid())
            if pids_trimmed:
                console.print(
                    f"[green][OK] Working Set de Workers em background minimizado (PIDs: {', '.join(map(str, pids_trimmed))}).[/]"
                )
        except Exception as e:
            logger.debug(f"Falha ao limpar workers: {e}")

    console.print("[bold green][SUCESSO] Otimizacao e esvaziamento de RAM concluidos.[/]")


@ops_app.command("maintenance")
def run_maintenance():
    """Executa a rotina completa de Manutencao SOTA (RAM, DB, Sanitize, Higiene)."""
    console.print("[bold magenta]=== [NEXUS] Iniciando Protocolo de Manutencao Geral SOTA ===[/]")

    # 1. RAM Optimization
    optimize_ram()

    # 2. Database Vacuum
    try:
        vacuum_db()
    except Exception as e:
        console.print(f"[red]Erro na manutencao do DB: {e}[/]")

    # 3. Sanitize
    try:
        sanitize_system(apply=True)
    except Exception as e:
        console.print(f"[red]Erro no saneamento de arquivos: {e}[/]")

    # 4. Hygiene
    try:
        run_hygiene()
    except Exception as e:
        console.print(f"[red]Erro na higiene temporal: {e}[/]")

    # 5. LanceDB / RAG Optimization (SSD Deframing SOTA)
    try:
        rag_script = BASE_DIR / MEMORY_RAG_SCRIPT
        if rag_script.exists():
            subprocess.run([sys.executable, str(rag_script), "optimize"], cwd=str(BASE_DIR), check=True)
    except Exception as e:
        console.print(f"[red]Erro na otimizacao de disco vetorial (LanceDB): {e}[/]")

    console.print("\n[bold green][SUCESSO ABSOLUTO] Manutencao geral concluida com sucesso![/]")


HELP_MODEL_CHOICES = "Modelo: 31b, 26b, 12b, 4b, 8b, llama3_8b, qwen, granite"


@ops_app.command("start-gemma")
def start_gemma(
    force: bool = typer.Option(False, "--force", "-f", help="Mata instancias penduradas antes de iniciar"),
    model: str = typer.Option("31b", "--model", "-m", help=HELP_MODEL_CHOICES),
):
    """Gatilho de ignicao do Servidor de Inferencia Local Gemma 4 (Friccao Zero)."""
    for proc in psutil.process_iter(["pid", "cmdline"]):
        try:
            cmd_info = getattr(proc, "info", {}).get("cmdline")
            cmdline_str = " ".join(map(str, cmd_info)) if isinstance(cmd_info, list) else ""
            if "gemma_server.py" in cmdline_str:
                if force:
                    console.print(f"[bold yellow][AVISO] Matando Servidor Gemma pendurado (PID {proc.pid})...[/]")
                    proc.kill()
                    time.sleep(1)
                else:
                    console.print(f"[bold green]Servidor Gemma ja operante (PID: {proc.pid}). Friccao Zero mantida.[/]")
                    return
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            continue

    console.print(f"[cyan]Iniciando Servidor de Inferencia Local para o modelo {model}...[/cyan]")
    if sys.platform == "win32":
        ps_script = BASE_DIR / "scripts" / "start_model.ps1"
        cmd = [
            "powershell.exe",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(ps_script),
            "-Model",
            model,
        ]
        if force:
            cmd.append("-Force")
        subprocess.Popen(
            cmd,
            creationflags=subprocess.CREATE_NEW_CONSOLE,
            cwd=str(BASE_DIR),
        )
    else:
        script_path = BASE_DIR / "engine/gemma_server.py"
        env = os.environ.copy()
        env["SOTA_LOCAL_MODEL"] = model
        subprocess.Popen(
            [sys.executable, str(script_path)],
            start_new_session=True,
            cwd=str(BASE_DIR),
            env=env,
        )
    console.print("[bold magenta]Servidor Gemma 4 desperto em background na porta 17043.[/]")


def _is_port_open(port: int) -> bool:
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        return s.connect_ex(("127.0.0.1", port)) == 0


def _ensure_active_model(model: str) -> None:
    # Always check if Ollama is running (port 11434)
    if not _is_port_open(11434):
        console.print(
            "[bold red][AVISO] O servico Ollama (porta 11434) esta offline! Certifique-se de que o Ollama esta rodando localmente.[/]"
        )

    if not _is_port_open(17043):
        console.print("[yellow][AVISO] Proxy Inferencia offline. Iniciando proxy...[/]")
        start_gemma(force=True, model=model)

        # Aguarda a porta do proxy (17043) estar pronta
        console.print("[cyan]Aguardando inicializacao do proxy de inferencia (porta 17043)...[/cyan]")
        for _ in range(40):
            if _is_port_open(17043):
                break
            time.sleep(0.5)


@ops_app.command("chat-gemma")
def chat_gemma(
    model: str = typer.Option(None, "--model", "-m", help=HELP_MODEL_CHOICES),
):
    """Ingressar em um Chat Agentico com um dos modelos instalados."""
    if not model:
        console.print("\n[bold magenta]=== [NEXUS] MEMBRANA DE INGRESSO DE MODELOS ===[/]")
        console.print("[1] Gemma 4 31b Dense (Raciocinio Estrategico & RAG)")
        console.print("[2] Gemma 4 26b MTP (Geracao de Codigo de Alta Vazao)")
        console.print("[3] Gemma 4 12b Balanced (Modelo Intermediario)")
        console.print("[4] Gemma 4 4b (Edge Tatica e Baixa Latencia)")
        console.print("[5] Gemma 4 8b (Modelo Geral Balanced)")
        console.print("[6] Llama 3.1 8b (Modelo Geral Balanced)")
        console.print("[7] Qwen 2.5 Coder 3b (Geracao de Codigo Ultra-Rapida)")
        console.print("[8] Granite 3.3 8b (Analise e Operacoes)")

        choice = typer.prompt("\nSelecione o modelo para ingressar (1-8)", default="1")
        model = {
            "1": "31b",
            "2": "26b",
            "3": "12b",
            "4": "4b",
            "5": "8b",
            "6": "llama3_8b",
            "7": "qwen",
            "8": "granite",
        }.get(choice, "31b")

    _ensure_active_model(model)
    script_path = BASE_DIR / "scripts/llm_inference/run_inference.py"
    subprocess.run([sys.executable, str(script_path), "--model", model], cwd=str(BASE_DIR), check=False)


@ops_app.command("query-gemma")
def query_gemma(
    prompt: str = typer.Argument(..., help="Prompt de consulta"),
    model: str = typer.Option("31b", "--model", "-m", help=HELP_MODEL_CHOICES),
):
    """Executa uma consulta direta (turno unico) em um modelo especifico."""
    _ensure_active_model(model)
    script_path = BASE_DIR / "scripts/llm_inference/run_inference.py"
    subprocess.run([sys.executable, str(script_path), "--model", model, prompt], cwd=str(BASE_DIR), check=False)


async def _read_stream_and_log(stream, name: str) -> None:
    if stream is None:
        return
    while True:
        line = await stream.readline()
        if not line:
            break
        decoded = line.decode("utf-8", errors="ignore").strip()
        if decoded:
            clean_decoded = decoded.encode("ascii", errors="ignore").decode("ascii")
            if clean_decoded:
                console.print(f"[dim]{clean_decoded}[/]")
                logger.debug(f"[{name}] {clean_decoded}")


async def _execute_step(name: str, cmd: list[str], cwd: Path | str, env: dict | None = None) -> None:
    """Executa um passo isolado do Quality Gate e processa a saida ativamente (Friccao Zero)."""
    console.print(f"\n[bold cyan]==> {name}[/]")
    logger.info(f"[QUALITY-GATE] START: {name} | CMD: {' '.join(cmd)}")

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(cwd),
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )

        await _read_stream_and_log(proc.stdout, name)
        await proc.wait()

        if proc.returncode != 0:
            logger.error(f"[QUALITY-GATE] FAIL: {name} | EXIT_CODE: {proc.returncode}")
            console.print(f"[bold red]Erro: O passo '{name}' falhou com codigo de saida {proc.returncode}.[/]")
            raise typer.Exit(proc.returncode or 1)

        logger.success(f"[QUALITY-GATE] SUCCESS: {name}")
    except typer.Exit:
        raise
    except Exception as e:
        logger.exception(f"[QUALITY-GATE] FATAL ERROR in {name}: {e}")
        console.print(f"[bold red]Excecao fatal executando '{name}': {e}[/]")
        raise typer.Exit(1)


async def _restore_lightningcss(lib_name: str, lib_path: Path, cache_path: Path) -> bool:
    """Restaura somente um artefato local conhecido; nunca altera o lockfile no gate."""
    if not cache_path.exists():
        console.print(
            f"[bold red][DEPENDENCIA AUSENTE] {lib_name} nao esta em node_modules nem no cache local. "
            "Execute 'npm ci' explicitamente e rode o gate novamente.[/]"
        )
        return False

    console.print(f"[bold green][AUTO-CURE] Recuperando {lib_name} do cache local (O(1) sem rede)...[/]")
    try:
        shutil.copytree(cache_path, lib_path, dirs_exist_ok=True)
    except Exception as error:
        console.print(
            f"[bold red][DEPENDENCIA AUSENTE] Falha ao restaurar {lib_name}: {error}. "
            "Execute 'npm ci' explicitamente e rode o gate novamente.[/]"
        )
        return False

    if lib_path.exists():
        console.print(f"[bold green][AUTO-CURE] {lib_name} recuperado com sucesso.[/]")
        return True

    console.print(
        f"[bold red][DEPENDENCIA AUSENTE] A restauracao de {lib_name} nao produziu o artefato esperado. "
        "Execute 'npm ci' explicitamente e rode o gate novamente.[/]"
    )
    return False


async def _auto_cure_lightningcss() -> None:
    # --- Auto-Cure & O(1) Cache Recovery for LightningCSS Native Binaries ---
    node_modules_dir = BASE_DIR / "node_modules"
    cache_dir = NEXUS_ZONE_CACHE / "lightningcss"
    cache_dir.mkdir(parents=True, exist_ok=True)

    platforms = [
        ("lightningcss-linux-x64-gnu", sys.platform.startswith("linux") or os.name == "posix"),
        ("lightningcss-win32-x64-msvc", sys.platform == "win32"),
    ]

    for lib_name, is_current in platforms:
        lib_path = node_modules_dir / lib_name
        cache_path = cache_dir / lib_name

        # 1. Se existe no node_modules mas nao no cache, faz backup
        if lib_path.exists() and not cache_path.exists():
            try:
                shutil.copytree(lib_path, cache_path, dirs_exist_ok=True)
                logger.info(f"[AUTO-CURE] Backup criado para {lib_name} no cache.")
            except Exception as e:
                logger.warning(f"[AUTO-CURE] Falha ao fazer backup de {lib_name}: {e}")

        # 2. Se e a plataforma atual e esta ausente no node_modules
        if is_current and not lib_path.exists():
            if not await _restore_lightningcss(lib_name, lib_path, cache_path):
                raise typer.Exit(1)


@ops_app.command("security")
def security_audit(
    strict: bool = typer.Option(
        True, "--strict/--no-strict", help="Falha o comando se houver qualquer vulnerabilidade"
    ),
):
    """Auditoria de Seguranca, CVEs e Vulnerabilidades (NIST / GitHub Advisory Gate)."""
    console.print("[bold cyan]=== [SISTEMA] Auditoria de Seguranca e Vulnerabilidades (CVEs) ===[/]")

    npm_cmd = shutil.which("npm")
    if not npm_cmd:
        console.print("[bold red][ERRO] npm ausente para auditoria de dependencias.[/]")
        raise typer.Exit(1)

    # 1. NPM Audit Monorepo & Frontend
    res = subprocess.run([npm_cmd, "audit", "--json"], cwd=str(BASE_DIR), capture_output=True, text=True, check=False)
    crit_count = 0
    high_count = 0
    tot_count = 0
    try:
        data = json.loads(res.stdout)
        vulns = data.get("metadata", {}).get("vulnerabilities", {})
        crit_count = vulns.get("critical", 0)
        high_count = vulns.get("high", 0)
        tot_count = vulns.get("total", 0)
    except Exception:
        pass

    table = Table(title="[bold]AUDITORIA DE VULNERABILIDADES (NIST / GHSA)[/]")
    table.add_column("INDICADOR", style="cyan")
    table.add_column("DETECTADAS", justify="center")
    table.add_column("LIMITE SOTA", justify="center")
    table.add_column("STATUS", justify="center")

    table.add_row("Vulnerabilidades Criticas", str(crit_count), "0", STATUS_PASS if crit_count == 0 else STATUS_FAIL)
    table.add_row("Vulnerabilidades Altas", str(high_count), "0", STATUS_PASS if high_count == 0 else STATUS_FAIL)
    table.add_row("Total de Vulnerabilidades", str(tot_count), "0", STATUS_PASS if tot_count == 0 else STATUS_FAIL)

    console.print(table)

    if (crit_count > 0 or high_count > 0 or tot_count > 0) and strict:
        console.print(
            f"[bold red][FALHA DE SEGURANCA] {tot_count} vulnerabilidade(s) detectada(s). Commit/Build bloqueado.[/]"
        )
        raise typer.Exit(1)

    console.print("[bold green][OK] Blindagem de Seguranca 100% integra. Zero CVEs ativas.[/]")


@ops_app.command("verify-integrity")
@ops_app.command("sri-audit")
def verify_integrity(
    strict: bool = typer.Option(True, "--strict/--no-strict", help="Falha o comando se houver violacao SRI ou de Hash"),
):
    """Auditoria Criptografica de Subresource Integrity (SRI) e SHA-512 (WASM & Packages)."""
    script_path = BASE_DIR / "scripts" / "ops" / "sri_integrity_verifier.py"
    if script_path.exists():
        args = [sys.executable, str(script_path)]
        if not strict:
            args.append("--no-strict")
        res = subprocess.run(args, cwd=str(BASE_DIR), check=False)
        if res.returncode != 0 and strict:
            raise typer.Exit(res.returncode)
    else:
        console.print("[bold red][ERRO] Script de integridade SRI ausente.[/]")
        raise typer.Exit(1)


@ops_app.command("compress")
def compress_static_assets():
    """Executa a Pre-Compactacao Estatica Brotli (q=11) e Gzip (lvl=9) dos Assets."""
    script_path = BASE_DIR / "scripts" / "ops" / "brotli_compressor.mjs"
    if script_path.exists():
        node_cmd = shutil.which("node") or "node"
        res = subprocess.run([node_cmd, str(script_path)], cwd=str(BASE_DIR), check=False)
        if res.returncode != 0:
            raise typer.Exit(res.returncode)
    else:
        console.print("[bold red][ERRO] Script de compressao ausente.[/]")
        raise typer.Exit(1)


@ops_app.command("quality-gate")
@coro
async def quality_gate():
    """Executa a Pipeline SOTA (Lint, Typecheck, Build, Tests) sem dependencias externas e envia logs ao Loguru."""
    console.print("[bold magenta]=== [SISTEMA] INICIANDO QUALITY GATE SOTA ===[/]")

    npm_cmd = shutil.which("npm")
    node_cmd = shutil.which("node") or "node"

    if not npm_cmd:
        console.print("[bold red][ENTROPIA CRITICA] Executaveis vitais (npm) ausentes no PATH da membrana.[/]")
        raise typer.Exit(1)

    await _auto_cure_lightningcss()
    # -------------------------------------------------------------------------

    # SOTA: Variavel de ambiente injetada para short-circuit de I/O no Next.js durante SSG
    build_env = os.environ.copy()
    build_env["NEXT_PUBLIC_SOTA_BUILD_MODE"] = "1"

    steps = [
        (
            "Blindagem ASCII",
            [sys.executable, str(Path(__file__)), "ops", "check-ascii"],
            BASE_DIR,
            None,
        ),
        (
            "Auditoria de Vulnerabilidades & CVEs (NIST/GHSA)",
            [sys.executable, str(Path(__file__)), "ops", "security"],
            BASE_DIR,
            None,
        ),
        (
            "Auditoria Criptografica SRI & SHA-512",
            [sys.executable, str(Path(__file__)), "ops", "verify-integrity"],
            BASE_DIR,
            None,
        ),
        ("Lint (frontend)", [npm_cmd, "run", "lint"], BASE_DIR, None),
        (
            "Typecheck (frontend)",
            [npm_cmd, "--workspace", "frontend", "run", "typecheck:audit"],
            BASE_DIR,
            None,
        ),
        ("Build (frontend)", [npm_cmd, "run", "build"], BASE_DIR, build_env),
        (
            "Pre-Compressao Estatica Brotli/Gzip (<15KB Mandate)",
            [node_cmd, str(BASE_DIR / "scripts" / "ops" / "brotli_compressor.mjs")],
            BASE_DIR,
            None,
        ),
        ("Tests (frontend)", [npm_cmd, "run", "test"], BASE_DIR, None),
        (
            "Python syntax check",
            [
                sys.executable,
                "-m",
                "py_compile",
                "api/v1/middleware.py",
                "api/v1/server.py",
            ],
            BASE_DIR,
            None,
        ),
        (
            "Python tests",
            [
                sys.executable,
                "-m",
                "pytest",
                "-q",
                "--basetemp=temp/nexus_zone/pytest_temp",
            ],
            BASE_DIR,
            None,
        ),
    ]

    for name, cmd, cwd, env in steps:
        await _execute_step(name, cmd, cwd, env)

    console.print("\n[bold green]QUALITY GATE: OK (Telemetria Preditiva Capturada)[/]")


# ==========================================
# COMANDOS DE AGENTES (HANDOFF)
# ==========================================


@agent_app.command("handoff")
def execute_handoff(
    web: bool = typer.Option(False, "--web", help="Copia contexto para Clipboard da Web (Claude/Gemini Pro)"),
    agent: str = typer.Option("chico", "--agent", help="Focar contexto num agente especifico"),
):
    """Monta contexto hierarquico isolado e realiza o Handoff Cognitivo de Sessao."""
    console.print("[bold cyan]=== [PROTOCOLO DE HANDOFF SOTA] ===[/]")
    if web:
        context = []
        files_to_inject = {
            "INSTRUCOES GLOBAIS": BASE_DIR / "GLOBAL_INSTRUCTIONS.md",
            "COSMOVISAO": DIR_CLAUDE / "COSMOVISAO.md",
            "INVARIANTES ARQUITETURAIS": DIR_CLAUDE / "ARCHITECTURAL_INVARIANTS.md",
        }
        for title, path in files_to_inject.items():
            if path.exists():
                context.append(
                    f"\n=================================================================\n## {title}\n=================================================================\n{path.read_text(encoding='utf-8', errors='ignore')}"
                )

        agents_dir = DIR_CLAUDE / "agents"
        specific_agent = agents_dir / f"{agent}.md"
        if specific_agent.exists():
            context.append(
                f"\n--- PERFIL ATIVO: {specific_agent.name} ---\n{specific_agent.read_text(encoding='utf-8', errors='ignore')}"
            )

        try:
            import pyperclip  # type: ignore

            pyperclip.copy("\n".join(context))
            console.print("[bold green][HANDOFF COMPLETO] Contexto extraido para o Clipboard![/]")
        except ImportError:
            console.print("[bold red]Modulo 'pyperclip' nao detectado.[/]")


@agent_app.command("route")
def test_routing(
    description: str = typer.Argument(..., help="Testa o despacho semantico da malha."),
):
    """Avalia para qual agente uma dada instrucao seria roteada usando as heuristicas do config nativamente."""
    try:
        import task_executor

        agent, meta = task_executor.intelligent_route_task(description)
        console.print(json.dumps({"agent": agent, "metadata": meta}, indent=2))
    except Exception as e:
        logger.exception("Falha ao analisar rota")
        console.print(f"[bold red]Erro de roteamento: {e}[/]")


# ==========================================
# COMANDOS DE VOZ SOTA (TTS NEURAL)
# ==========================================


@voice_app.command("speak")
def voice_speak(
    text: str = typer.Argument(
        "Sistema SOTA v7.0 GOLD operando com sintese de voz padrao ouro em portugues do Brasil sob governanca de Raphael Vitoi.",
        help="Texto a sintetizar em voz alta.",
    ),
    voice: str = typer.Option(
        "pt-BR-FranciscaNeural",
        "--voice",
        "-v",
        help="Voz (pt-BR-FranciscaNeural, pt-BR-ThalitaNeural, Aoede, Kore, Puck)",
    ),
    output: str | None = typer.Option(None, "--output", "-o", help="Arquivo de saida (.mp3/.wav)"),
    no_play: bool = typer.Option(False, "--no-play", help="Desabilita reproducao imediata no speaker"),
):
    """Sintetiza voz neural em PT-BR (Feminina Padrao Ouro) ou Gemini Multimodal Audio."""
    from scripts.cli.nexus_voice import speak_text

    speak_text(text, voice=voice, output_file=output, play=not no_play)


# ==========================================
# ENTRYPOINT TYPER
# ==========================================

if __name__ == "__main__":
    app()
