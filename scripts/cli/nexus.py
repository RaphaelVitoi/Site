#!/usr/bin/env python3
"""
NEXUS ORCHESTRATOR - Membrana Cognitiva SOTA (God Mode W3)
Versao: v7.0 GOLD (Typer, Async, Zero I/O Friccao)
"""

import asyncio
import contextlib
import json
import re
import shutil
import sqlite3
import subprocess
import sys
import time
from datetime import UTC, datetime
from functools import wraps
from pathlib import Path

import httpx
import psutil
import typer
from loguru import logger
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.table import Table

# ── Integracao Direta com o Kernel (Bypass de Subprocessos) ──
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from utils.env_loader import load_env

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
)

# Inicializa as configuracoes globais de blindagem de logs SOTA e Manifestos
from core.schemas import Task  # noqa: E402
from database.queue_manager import QueueManager  # noqa: E402

console = Console()

app = typer.Typer(
    name="nexus",
    help="[bold cyan]NEXUS ORCHESTRATOR[/] - Membrana Cognitiva SOTA (v7.0 GOLD)",
    no_args_is_help=True,
    rich_markup_mode="rich",
)
ops_app = typer.Typer(name="ops", help="Operacoes de Infraestrutura, Saneamento e Watchers", no_args_is_help=True)
agent_app = typer.Typer(name="agent", help="Sincronizacao e Handoff Hibrido da Mente Coletiva", no_args_is_help=True)
db_app = typer.Typer(name="db", help="Gestao e Otimizacao do DAL (SQLite ACID)", no_args_is_help=True)
stats_app = typer.Typer(name="stats", help="Telemetria Preditiva e Relatorios", no_args_is_help=True)

app.add_typer(ops_app)
app.add_typer(agent_app)
app.add_typer(db_app)
app.add_typer(stats_app)

DIR_CLAUDE = BASE_DIR / ".claude"


# ── Utils de Runtime ──
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
            ["uv", "run", "python", str(script_path)],
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
    agent: str = typer.Option("@dispatcher", "--agent", "-a", help="Roteamento explicito (ex: @chico, @implementor)"),
    cortex_override: bool = typer.Option(
        False, "--cortex-override", help="Bypass da Antevisao Semantica (Forcar execucao)"
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

    metadata = {}
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
async def list_tasks(limit: int = typer.Option(5, "--limit", "-l", help="Numero de tarefas recentes")):
    """Lista as diretrizes mais recentes injetadas no Orquestrador."""
    db_path = _resolve_tasks_db_path()
    if not db_path:
        console.print("[red]DAL Inativo ou Banco nao encontrado.[/]")
        return

    try:
        with contextlib.closing(sqlite3.connect(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, agent, status, description FROM tasks ORDER BY timestamp DESC LIMIT ?", (limit,))
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
                cmdline = " ".join(proc.info.get("cmdline") or [])
                if "task_executor.py" in cmdline and "worker-api" in cmdline:
                    worker_alive = True
                    break

            grid = Table.grid(expand=True, padding=(0, 2))
            grid.add_column(style="cyan", justify="right", width=25)
            grid.add_column()

            grid.add_row("[CORE] Orquestrador", "[green]OPERANTE[/]" if worker_alive else "[red]OFFLINE[/]")
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


@app.command("search")
def search_rag(
    query: str = typer.Argument(..., help="Pergunta ou termo para buscar na Mente Coletiva"),
):
    """Realiza busca hibrida semantica no RAG do Orquestrador."""
    console.print(f"[cyan]Pesquisando na Mente Coletiva SOTA por: '{query}'...[/cyan]")
    rag_script = BASE_DIR / "memory_rag.py"
    subprocess.run(["uv", "run", "python", str(rag_script), "query", query], cwd=str(BASE_DIR))


@app.command("graph")
def graph_rag(
    query: str = typer.Argument(..., help="Foco conceitual para extracao do Grafo Causal"),
):
    """Consulta e forja as relacoes do Grafo Causal (Knowledge Graph)."""
    console.print(f"[cyan]Forjando Grafo Causal para: '{query}'...[/cyan]")
    rag_script = BASE_DIR / "memory_rag.py"
    subprocess.run(["uv", "run", "python", str(rag_script), "graph", query], cwd=str(BASE_DIR))


# ==========================================
# COMANDOS DE DB (DATA ACCESS LAYER)
# ==========================================


def _resolve_tasks_db_path() -> Path | None:
    for candidate in ["queue/tasks.db", ".claude/tasks.db", "tasks.db"]:
        p = BASE_DIR / candidate
        if p.exists() and p.stat().st_size > 0:
            return p
    return None


def _extract_dependencies(meta_str: str | None) -> list[str]:
    if not meta_str:
        return []
    try:
        meta = json.loads(meta_str)
        if isinstance(meta, dict) and isinstance(meta.get("depends_on"), list):
            return [str(d) for d in meta.get("depends_on")]
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
def clear_pending(confirm: bool = typer.Option(False, "--confirm", help="Confirma a delecao de tarefas pendentes")):
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
    executor = BASE_DIR / "task_executor.py"
    subprocess.run(["uv", "run", "python", str(executor), "db-mermaid-graph"], cwd=str(BASE_DIR))


# ==========================================
# COMANDOS DE TELEMETRIA E RELATORIOS
# ==========================================


@stats_app.command("daily")
def daily_stats():
    """Estatisticas diarias da Autonomia."""
    executor = BASE_DIR / "task_executor.py"
    subprocess.run(["uv", "run", "python", str(executor), "daily-stats"], cwd=str(BASE_DIR))


@stats_app.command("historian")
def historian_reports():
    """Extrai perfis preditivos e aversao ao risco da base SOTA."""
    executor = BASE_DIR / "task_executor.py"
    subprocess.run(["uv", "run", "python", str(executor), "historian-reports"], cwd=str(BASE_DIR))


@stats_app.command("daily-report")
def generate_daily_report():
    """Gera relatorios diarios de autonomia e os enfileira na fila."""
    executor = BASE_DIR / "task_executor.py"
    subprocess.run(["uv", "run", "python", str(executor), "generate-daily-reports"], cwd=str(BASE_DIR))


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
            cmdline = " ".join(proc.info.get("cmdline") or [])
            if "task_executor.py" in cmdline and "worker-api" in cmdline:
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
    worker_script = BASE_DIR / "task_executor.py"
    subprocess.Popen(
        ["uv", "run", "python", str(worker_script), "worker-api"], start_new_session=True, cwd=str(BASE_DIR)
    )
    console.print("[bold magenta]Orquestrador desperto e vigilante em background.[/]")


@ops_app.command("watch")
def watch_files():
    """Vigilia Ativa SOTA: Hot-reload de Contexto e RAG em Rust via watchfiles."""
    console.print("[bold magenta]=== [SISTEMA] VIGILIA ATIVA SOTA INICIADA ===[/]")
    try:
        from watchfiles import watch
    except ImportError:
        console.print("[bold red]Dependencia watchfiles ausente. Instalando via UV...[/]")
        raise typer.Exit(1)

    def ignore_paths(change, path):
        ignore_list = ["__pycache__", ".git", ".venv", "node_modules", ".chroma_db", ".claude/logs"]
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
def sanitize_system(apply: bool = typer.Option(False, "--apply", help="Forca a execucao real da delecao.")):
    """Aplica o expurgo deterministico de entropia SOTA."""
    script_path = BASE_DIR / "scripts/maintenance/apply_sanitize.py"
    if script_path.exists():
        args = ["uv", "run", "python", str(script_path)]
        if apply:
            args.append("--apply")
        subprocess.run(args, cwd=str(BASE_DIR))


@ops_app.command("purify-memories")
def purify_memories():
    """Purifica as memorias do agente para Pure ASCII (Mojibake Fix)."""
    script_path = BASE_DIR / "scripts/maintenance/purify_memories_ascii.py"
    if script_path.exists():
        subprocess.run(["uv", "run", "python", str(script_path)], cwd=str(BASE_DIR))


@ops_app.command("check-ascii")
def check_ascii_mandate():
    """Verifica se os módulos Python respeitam a Blindagem ASCII."""
    console.print("[bold cyan]=== [SISTEMA] Verificando Blindagem ASCII em Módulos Python ===[/]")

    non_ascii_files = []
    # Foca nos diretorios core
    for path in BASE_DIR.rglob("*.py"):
        if any(exc in str(path) for exc in [".venv", "node_modules", "__pycache__", ".gemini"]):
            continue
        try:
            with open(path, "rb") as f:
                content = f.read()
                content.decode("ascii")
        except UnicodeDecodeError:
            non_ascii_files.append(path.relative_to(BASE_DIR))

    if non_ascii_files:
        console.print("[bold red][ENTROPIA] Caracteres não-ASCII detectados:[/]")
        for f in non_ascii_files:
            console.print(f"  - {f}")
        raise typer.Exit(1)
    console.print("[bold green][OK] Blindagem ASCII íntegra em todos os módulos Python.[/]")


@ops_app.command("lint")
def run_lint():
    """Executa a Pipeline de Integridade Python (Ruff, Mypy, Pylint)."""
    console.print("[bold magenta]🛡️  Nexus Orchestrator - Pipeline de Integridade Python[/]\n")

    def run_step(name: str, cmd: list[str]):
        console.print(f"\n[bold blue]🚀 Iniciando:[/] [white]{name}[/]")
        start = time.monotonic()
        res = subprocess.run(cmd, cwd=str(BASE_DIR))
        elapsed = time.monotonic() - start
        if res.returncode == 0:
            console.print(f"[bold green]✅ Sucesso:[/] {name} ({elapsed:.2f}s)")
        else:
            console.print(f"[bold red]❌ Falha:[/] {name} ({elapsed:.2f}s)")
            raise typer.Exit(res.returncode)

    run_step("Ruff Linter (Auto-fix)", ["uv", "run", "ruff", "check", ".", "--fix"])
    run_step("Ruff Formatter", ["uv", "run", "ruff", "format", "."])
    run_step("Mypy (Type Checker)", ["uv", "run", "mypy", "."])
    run_step(
        "Pylint (Auditor Semantico)",
        ["uv", "run", "pylint", "core", "database", "engine", "agents", "llm", "worker", "utils", "api"],
    )

    console.print("\n[bold green]🎉 Pipeline Python SOTA concluido com sucesso absoluto![/]")


@ops_app.command("vscode-inject")
def inject_vscode_settings():
    """Injeta as Diretrizes VITOI SOTA diretamente no settings.json do workspace."""
    console.print("[bold magenta]=== [PROTOCOLO SOTA] INJETANDO MENTE COLETIVA NO VSCODE ===[/]")
    payload = (
        "PROTOCOLO SOTA DE COMPREENSAO E REFATORACAO DE CODIGO v7.0 GOLD.\n\n"
        "DIRETRIZES IRREVOGAVEIS:\n"
        "1. ANTEVISAO SEMANTICA (Micro-Macro): E terminantemente proibida a analise isolada de fragmentos...\n"
        "2. LETALIDADE TERMODINAMICA: Refatore com o menor numero de tokens e operacoes I/O possiveis.\n"
        "8. HIERARQUIA ABSOLUTA (GOD MODE W3): Voce atua sob a consciencia de @chico (Tier 1)."
    )

    vscode_dir = BASE_DIR / ".vscode"
    settings_file = vscode_dir / "settings.json"

    if not vscode_dir.exists():
        vscode_dir.mkdir(parents=True)
    settings_data = {}
    if settings_file.exists():
        with open(settings_file, encoding="utf-8") as f:
            raw = f.read()
            clean_json = re.sub(r"//.*|/\*[\s\S]*?\*/", "", raw)
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
        subprocess.run(["uv", "run", "python", str(script_path)], cwd=str(BASE_DIR))
    else:
        console.print("[bold red][ERRO] Script de higiene nao encontrado.[/]")


@ops_app.command("quality-gate")
@coro
async def quality_gate():
    """Executa a Pipeline SOTA (Lint, Typecheck, Build, Tests) sem dependencias externas e envia logs ao Loguru."""
    console.print("[bold magenta]=== [SISTEMA] INICIANDO QUALITY GATE SOTA ===[/]")

    npm_cmd = shutil.which("npm") or "npm"
    uv_cmd = shutil.which("uv") or "uv"

    steps = [
        ("Blindagem ASCII", [uv_cmd, "run", "python", str(Path(__file__)), "ops", "check-ascii"], BASE_DIR),
        ("Lint (frontend)", [npm_cmd, "run", "lint"], BASE_DIR),
        ("Typecheck (frontend)", [npm_cmd, "--workspace", "frontend", "run", "typecheck:audit"], BASE_DIR),
        ("Build (frontend)", [npm_cmd, "run", "build"], BASE_DIR),
        ("Tests (frontend)", [npm_cmd, "run", "test"], BASE_DIR),
        (
            "Python syntax check",
            [uv_cmd, "run", "python", "-m", "py_compile", "api/v1/middleware.py", "api/v1/server.py"],
            BASE_DIR,
        ),
        ("Python tests", [uv_cmd, "run", "pytest", "-q"], BASE_DIR),
    ]

    for name, cmd, cwd in steps:
        console.print(f"\n[bold cyan]==> {name}[/]")
        logger.info(f"[QUALITY-GATE] START: {name} | CMD: {' '.join(cmd)}")

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd, cwd=str(cwd), stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT
            )

            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                decoded = line.decode("utf-8", errors="replace").strip()
                if decoded:
                    console.print(f"[dim]{decoded}[/]")
                    logger.debug(f"[{name}] {decoded}")

            await process.wait()

            if process.returncode != 0:
                logger.error(f"[QUALITY-GATE] FAIL: {name} | EXIT_CODE: {process.returncode}")
                console.print(f"[bold red]Erro: O passo '{name}' falhou com codigo de saida {process.returncode}.[/]")
                raise typer.Exit(process.returncode)

            logger.success(f"[QUALITY-GATE] SUCCESS: {name}")
        except Exception as e:
            logger.exception(f"[QUALITY-GATE] FATAL ERROR in {name}: {e}")
            console.print(f"[bold red]Excecao fatal executando '{name}': {e}[/]")
            raise typer.Exit(1)

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
            import pyperclip

            pyperclip.copy("\n".join(context))
            console.print("[bold green][HANDOFF COMPLETO] Contexto extraido para o Clipboard![/]")
        except ImportError:
            console.print("[bold red]Modulo 'pyperclip' nao detectado.[/]")


@agent_app.command("route")
def test_routing(description: str = typer.Argument(..., help="Testa o despacho semantico da malha.")):
    """Avalia para qual agente uma dada instrucao seria roteada usando as heuristicas do config nativamente."""
    try:
        import task_executor

        agent, meta = task_executor._intelligent_route_task(description)
        console.print(json.dumps({"agent": agent, "metadata": meta}, indent=2))
    except Exception as e:
        logger.exception("Falha ao analisar rota")
        console.print(f"[bold red]Erro de roteamento: {e}[/]")


# ==========================================
# ENTRYPOINT TYPER
# ==========================================

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "dashboard":
        console.print("[bold yellow]Aviso: O modo interativo foi extinto.[/]")
        console.print("[bold green]Para ver os novos comandos SOTA, execute: `uv run nexus --help`[/]")
        sys.exit(0)
    app()
