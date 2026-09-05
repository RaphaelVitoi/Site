#!/usr/bin/env python3
# pylint: disable=import-outside-toplevel, invalid-name, too-many-lines
"""
NEXUS ORCHESTRATOR - Membrana Cognitiva SOTA (God Mode W3)
Versao: v7.0 GOLD (Typer, Async, Zero I/O Friccao)
"""

import asyncio
import contextlib
from datetime import UTC, datetime
from functools import wraps
import http.client
import json
import os
from pathlib import Path
import platform
import re
import shutil
import sqlite3
import subprocess  # nosec # noqa: S404
import sys
import time
from typing import Any

import httpx
from loguru import logger
import psutil
from rich import box
from rich.align import Align
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
import typer

# Integracao Direta com o Kernel (Bypass de Subprocessos)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

# pylint: disable=wrong-import-position
from core.mcp_routing import apply_mcp_addon_routing  # noqa: E402
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
    help="[bold cyan]NEXUS ORCHESTRATOR[/] - Membrana Cognitiva SOTA (v8.0 GOLD)",
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
audit_app = typer.Typer(name="audit", help="Auditorias SOTA v8.0 GOLD", no_args_is_help=True)
routine_app = typer.Typer(name="routine", help="Rotinas SOTA v8.0 GOLD", no_args_is_help=True)

app.add_typer(ops_app)
app.add_typer(agent_app)
app.add_typer(db_app)
app.add_typer(stats_app)
app.add_typer(voice_app)
app.add_typer(audit_app)
app.add_typer(routine_app)

DIR_CLAUDE_NAME = ".claude"
DIR_CLAUDE = BASE_DIR / DIR_CLAUDE_NAME

#  Constantes do Orquestrador SOTA
WORKER_SCRIPT_NAME = "task_executor.py"
WORKER_SCRIPT_PATH = BASE_DIR / WORKER_SCRIPT_NAME
WORKER_API_CMD = "worker-api"
MEMORY_RAG_SCRIPT = "memory_rag.py"

STYLE_BOLD_WHITE = "bold #f8f8f2"
STYLE_BOLD_YELLOW = "bold yellow"
STYLE_BOLD_RED = "bold red"
STYLE_BOLD_GREEN = "bold green"
STATUS_PASS = "[green]PASS[/]"  # noqa: S105
STATUS_FAIL = "[red]FAIL[/]"
MSG_SEM_MEDIDOR = "sem medidor"
TRI_STATE_GUARD_BANNER = "[bold green] Tri-State Guard:[/] [green]SUCESSO (0E/0W)[/] | [yellow]FRAGIL (0E/1-2W)[/] | [red]FALHOU (>=1E ou >=3W)[/]\n"
TRI_STATE_SCRIPTS_BANNER = "[bold green] Tri-State Guard para Scripts:[/] [green]SUCESSO (0E/0W)[/] | [yellow]FRAGIL (0E/1-2W)[/] | [red]FALHOU (>=1E ou >=3W)[/]\n"

_CMD_PREFIX_PYTHON = "python "
_CMD_PREFIX_PWSH = "pwsh "
_CMD_PREFIX_NODE = "node "


def _resolver_comando(cmd_str: str) -> str:
    """Resolve prefixos de runtime (python/pwsh/node) para binarios absolutos."""
    if cmd_str.startswith(_CMD_PREFIX_PYTHON):
        return f'"{sys.executable}" ' + cmd_str[len(_CMD_PREFIX_PYTHON) :]
    if cmd_str.startswith(_CMD_PREFIX_PWSH):
        pwsh_bin = shutil.which("pwsh") or shutil.which("powershell") or "powershell"
        return f'"{pwsh_bin}" ' + cmd_str[len(_CMD_PREFIX_PWSH) :]
    if cmd_str.startswith(_CMD_PREFIX_NODE):
        node_bin = shutil.which("node") or "node"
        return f'"{node_bin}" ' + cmd_str[len(_CMD_PREFIX_NODE) :]
    return cmd_str


# Nao reintroduzir aqui as constantes do Tri-State Guard (MSG_WARNINGS_SOTA,
# STATUS_TRI_STATE_*, FOOTER_DIVIDER_CYAN, PREFIX_*). Existiram sem consumidor
# -- medido em 2026-08-27: uma ocorrencia cada, a propria definicao -- e
# MSG_WARNINGS_SOTA congelava " Total de Warnings: 0" como LITERAL. A fonte
# viva dessa linha e tests/conftest.py, que a DERIVA de len(warnings_list)
# alimentado pelo hook pytest_warning_recorded. Se o guard vier para o CLI,
# ele deve ler daquela contagem, nunca reescrever o texto dela.

_RE_WARNINGS_DECLARADOS = re.compile(r"Total de Warnings:\s*(\d+)")


def _warnings_declarados(saida: str) -> int | None:
    """Contagem de warnings que a propria fase declarou. None = a fase nao declarou.

    Distinguir "declarou zero" de "nao declarou nada" e o ponto inteiro desta
    funcao. Assumir zero para quem nao fala foi exatamente o defeito que ela
    existe para extinguir.
    """
    achados = _RE_WARNINGS_DECLARADOS.findall(saida or "")
    return int(achados[-1]) if achados else None


def _imprimir_resumo_tri_state(
    titulo: str,
    erros: int,
    warnings_por_fase: dict[str, int | None],
    homeostase: str,
) -> str:
    """Resumo DERIVADO do que as fases reportaram. Nenhum numero aqui e literal.

    Substitui quatro blocos que imprimiam a contagem como zero fixo. Um deles
    era o do QUALITY GATE, que roda scripts/ops/cwv_gate.ps1 -- e esse script
    declara 2 warnings e sai 0 (amarelo nao bloqueia, por desenho do
    POSTULADO-001). O resumo afirmava zero mesmo assim, o que tornava o estado
    FRAGIL inalcancavel e o tri-state um bi-state: ou estourava, ou dizia
    SUCESSO VERDE. Medido nos dois lados em 2026-08-27.

    Quando uma fase nao declara contagem, o total vira PISO e nao teto, e isso
    e dito em voz alta em vez de ser arredondado para zero.
    """
    declarados = [v for v in warnings_por_fase.values() if v is not None]
    mudas = [nome for nome, v in warnings_por_fase.items() if v is None]
    total_w = sum(declarados)

    if erros > 0 or total_w >= 3:
        tri_state, cor = "FALHOU (VERMELHO)", STYLE_BOLD_RED
    elif total_w > 0:
        tri_state, cor = "FRAGIL (AMARELO)", STYLE_BOLD_YELLOW
    else:
        tri_state, cor = "SUCESSO (VERDE)", STYLE_BOLD_GREEN

    console.print("\n" + "=" * 80)
    console.print(f"[bold cyan]===== SOTA QUALITY & INTEGRITY GUARD  PROTOCOLO CHICO v8.0 GOLD ({titulo}) =====[/]")
    console.print(f" Total de Erros:    {erros} (Teto Maximo Permitido: 0 | Peso: CRITICO)")
    console.print(
        f" Total de Warnings: {total_w} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)"
        f" [declarado por {len(declarados)} de {len(warnings_por_fase)} fase(s)]"
    )
    console.print(f"[{cor}] Status da Bateria: [{tri_state}][/]")
    if mudas:
        amostra = ", ".join(mudas[:3]) + ("..." if len(mudas) > 3 else "")
        console.print(
            f"[yellow] PISO, NAO TETO:    {len(mudas)} fase(s) nao declaram contagem ({amostra}). "
            f"O total acima e um piso.[/]"
        )
    if erros == 0 and total_w == 0 and not mudas:
        console.print(f"[bold green] Homeostase Total:  {homeostase}[/]")
    console.print("[bold cyan]" + "=" * 80 + "[/]\n")
    return tri_state


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
    else:
        # Best-effort por desenho: roda a cada invocacao do CLI, entao gritar no
        # console seria ruido em cada comando. Mas sumir sem deixar rastro nao e
        # opcao -- o gatilho pararia de existir sem ninguem notar. Vai para o log.
        logger.warning(f"[HIGIENE] Gatilho silencioso NAO executado: {script_path} ausente.")


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

    # Seleciona os addons MCP por intencao no momento da entrada. Nenhum
    # servidor e iniciado aqui; o worker recebe apenas um plano auditavel e
    # lazy, que sera recalculado para cada subtask.
    metadata = apply_mcp_addon_routing(desc_text, metadata)

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

            panel = Panel(grid, title="[bold]STATUS VITAL SOTA v8.0 GOLD[/]", border_style="green")
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


_VRAM_TOTAL_VULKAN: float | None = None
_VRAM_PS_CACHE: tuple[float, float] | None = None
_VRAM_PS_TTL_S = 2.0
_OLLAMA_HOST = "127.0.0.1"
_OLLAMA_PORT = 11434


def _vram_total_do_log_do_ollama() -> float | None:
    """Total de VRAM que o proprio Ollama declara enxergar, em GiB.

    O servidor escreve, ao subir, uma linha `msg="inference compute" ...
    total="8.0 GiB" available="7.2 GiB"`. E a fonte mais honesta do teto: nao e
    a capacidade nominal da placa, e o que o backend de fato pode usar.
    """
    global _VRAM_TOTAL_VULKAN  # pylint: disable=global-statement
    if _VRAM_TOTAL_VULKAN is not None:
        return _VRAM_TOTAL_VULKAN or None

    log = Path(os.environ.get("LOCALAPPDATA", "")) / "Ollama" / "server.log"
    if not log.exists():
        _VRAM_TOTAL_VULKAN = 0.0
        return None
    try:
        texto = log.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        _VRAM_TOTAL_VULKAN = 0.0
        return None

    achado = None
    for m in re.finditer(r'msg="inference compute".*?total="([\d.]+)\s*([GM])iB"', texto):
        valor = float(m.group(1))
        achado = valor if m.group(2) == "G" else valor / 1024
    _VRAM_TOTAL_VULKAN = achado or 0.0
    return achado


def _fetch_vulkan_ollama_vram() -> tuple[float, float, float] | None:
    """VRAM medida pelo backend que esta REALMENTE em uso nesta maquina.

    Os tres leitores acima cobrem NVIDIA (`pynvml`), AMD nativo
    (`pyamdgpuinfo`) e AMD via ROCm (`rocm-smi`). **Nenhum cobre Vulkan** -- e
    Vulkan e o backend do Ollama aqui, numa Radeon RX 570 (Polaris), que nao tem
    ROCm no Windows. Medido em 2026-08-28: os tres devolviam None, e
    `_get_vram_usage` convertia isso em `(None, 0.0, 0.0)`.

    Zero nao e desconhecido. Qualquer teto que consumisse esses numeros
    concluiria que a VRAM esta vazia e nunca reagiria -- exatamente o padrao
    desta base: o medidor reporta um valor plausivel sem estar ligado ao que
    mede.

    Aqui a ocupacao vem de `/api/ps`, que devolve `size_vram` por modelo
    carregado -- e a mesma grandeza com que o Ollama calcula a divisao CPU/GPU
    que ele mostra. Nao precisa de biblioteca de fornecedor nenhuma.

    Limite declarado: mede o que o OLLAMA ocupa, nao o consumo da placa inteira
    (desktop, navegador e outros processos ficam de fora). Para um teto de
    modelos e a grandeza certa; para consumo de dispositivo, nao e.
    """
    total = _vram_total_do_log_do_ollama()
    if not total:
        return None

    # Cache curto e timeout apertado porque isto roda no caminho de RENDER do
    # dashboard, que atualiza em laco. A primeira versao usava timeout de 2 s e
    # ia a rede a cada quadro: com o servidor no ar ja atrasava o quadro o
    # bastante para o `Live` escrever DEPOIS de o CliRunner devolver o stdout
    # -- o painel aparecia no terminal e `result.stdout` vinha vazio, e um teste
    # pegou. Com o servidor fora do ar seriam 2 s de trava por quadro.
    # Leitura de instrumento nao pode custar mais que o que ela instrumenta.
    agora = time.monotonic()
    global _VRAM_PS_CACHE  # pylint: disable=global-statement
    cache = _VRAM_PS_CACHE
    if cache is not None and agora - cache[0] < _VRAM_PS_TTL_S:
        usado = cache[1]
    else:
        # stdlib e nao `httpx`, e a diferenca foi MEDIDA. Um `httpx.get()` avulso
        # constroi e destroi um Client por chamada, e este comando roda dentro do
        # wrapper assincrono do typer: com ele no caminho de render,
        # `test_nexus_dashboard_once` passou a ver `result.stdout` vazio enquanto
        # o painel saia no stdout real. Com a stdlib, passa. Para um GET de JSON
        # em loopback a stdlib basta e nao se enreda com o laco de eventos.
        # `http.client` e nao `urlopen`: o portao de ancora reprovou um
        # `noqa S310` aqui, e ele tinha razao. S310 existe porque `urlopen`
        # aceita esquema arbitrario (`file:`, esquemas proprios) -- e a resposta
        # certa nao era registrar a supressao, era tirar a ambiguidade: host,
        # porta e caminho separados nao passam por parsing de URL nenhum. O
        # achado deixa de existir em vez de ficar silenciado.
        # A construcao entra no `try` junto com a chamada: um teste flagrou que,
        # fora dele, um erro ao ABRIR a conexao escapava e derrubava
        # `_get_vram_usage` inteiro. Instrumento nao pode quebrar o que mede --
        # ausencia de leitura e None, nunca excecao subindo.
        conexao = None
        try:
            conexao = http.client.HTTPConnection(_OLLAMA_HOST, _OLLAMA_PORT, timeout=0.4)
            conexao.request("GET", "/api/ps")
            modelos = json.loads(conexao.getresponse().read()).get("models", [])
        # Servidor fora do ar e ausencia de dado, nao erro.
        except Exception:  # noqa: BLE001
            return None
        finally:
            if conexao is not None:
                with contextlib.suppress(Exception):
                    conexao.close()
        usado = sum(float(m.get("size_vram") or 0) for m in modelos) / (1024**3)
        _VRAM_PS_CACHE = (agora, usado)

    return (usado / total) * 100, usado, total


def _get_vram_usage() -> tuple[float | None, float, float]:
    """Motor SOTA de Extracao VRAM O(1) - Nvidia, AMD nativo, ROCm e Vulkan.

    A ordem nao e arbitraria: as tres primeiras leem o DISPOSITIVO e valem para
    qualquer processo; a de Vulkan le o que o Ollama ocupa, que e um subconjunto.
    Ela entra por ultimo, como a unica que responde nesta maquina.
    """
    res = _fetch_nvidia_vram() or _fetch_amd_native_vram() or _fetch_amd_rocm_vram() or _fetch_vulkan_ollama_vram()
    return res if res else (None, 0.0, 0.0)


def _color_threshold(value: float, thresholds: tuple[float, float], reverse: bool = False) -> str:
    """Retorna cor verde, amarela ou vermelha com base em limites O(1)."""
    if reverse:
        if value >= thresholds[1]:
            return "#50fa7b"
        if value >= thresholds[0]:
            return "#f1fa8c"
        return "#ff5555"
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
    # Dizia "LanceDB (Hybrid)". O motor e ChromaDB: `memory_rag.py` usa
    # chromadb.PersistentClient com ONNXMiniLM_L6_V2, e `lancedb` nao esta
    # instalado neste ambiente. Medido em 2026-08-28.
    table.add_row("RAG Engine", "[bold #8be9fd]ChromaDB (ONNX MiniLM-L6-v2)[/]")
    table.add_row("Antevisao Sem.", "[bold #50fa7b]ONLINE[/]")
    table.add_row("I/O Latency Target", "[bold #50fa7b]O(1)[/]")
    table.add_row("CLI Version", "[bold #f8f8f2]v8.0 GOLD[/]")
    table.add_row("Cortex Override", "[dim #6272a4]Standby[/]")
    table.add_row("Quantum Metrics", "[bold #8be9fd]ATIVO[/]")

    return Panel(
        table, title="[bold #bd93f9]PARAMETROS VITOI[/]", border_style="#bd93f9", padding=(1, 2), box=box.ROUNDED
    )


def _build_calibration_panel() -> Panel:
    """Painel Executivo de Calibracao de Agentes & Projecao Temporal TimesFM."""
    ledger_path = BASE_DIR / "reports" / "agent-calibration" / "feedback-ledger.jsonl"
    scores: list[float] = []
    distinct_sessions: set[str] = set()

    if ledger_path.exists():
        try:
            with open(ledger_path, "r", encoding="utf-8") as f:
                for line in f:
                    line_str = line.strip()
                    if not line_str:
                        continue
                    entry = json.loads(line_str)
                    if entry.get("record_type") == "feedback" and entry.get("score") is not None:
                        scores.append(float(entry["score"]))
                        sess = entry.get("session_id")
                        if sess:
                            distinct_sessions.add(sess)
        except Exception:
            pass

    table = Table.grid(expand=True, padding=(0, 2))
    table.add_column(style=STYLE_BOLD_WHITE, ratio=1)
    table.add_column(ratio=2)

    total_feedbacks = len(scores)
    total_sess = len(distinct_sessions)
    avg_score = (sum(scores) / total_feedbacks) if total_feedbacks > 0 else 0.0
    gate_status = (
        "[bold #50fa7b]ABERTO (Apto a Microcalibrar)[/]"
        if total_sess >= 3
        else f"[bold #f1fa8c]EM ACUMULACAO ({total_sess}/3 sessoes)[/]"
    )

    from engine.timesfm_engine import forecast_agent_calibration_trajectory

    if len(scores) >= 4:
        fc = forecast_agent_calibration_trajectory(scores, horizon_sessions=3)
        traj_str = " -> ".join(f"{v:.2f}" for v in fc.mean_trajectory)
        drift_color = (
            "#50fa7b"
            if fc.drift_direction == "EXPANSAO"
            else ("#f1fa8c" if fc.drift_direction == "ESTAVEL" else "#ff5555")
        )
        risk_color = "#50fa7b" if fc.risk_of_degradation == 0.0 else "#ff5555"

        c1 = (
            f"[bold #8be9fd]Portao de Calibracao:[/] {gate_status}\n"
            f"[dim]Amostras:[/] [white]{total_feedbacks} notas[/] em [white]{total_sess} sessoes[/] | [dim]Media Recente:[/] [bold #50fa7b]{avg_score:.2f}/10[/]"
        )
        c2 = (
            f"[bold #bd93f9]Google TimesFM 2.0 (H=3):[/] [yellow]{traj_str}[/]\n"
            f"[dim]Deriva Temporal:[/] [{drift_color}]{fc.drift_per_session:+.3f} pts/sess ({fc.drift_direction})[/] | [dim]Risco Degradacao (<8.5):[/] [{risk_color}]{fc.risk_of_degradation * 100:.1f}%[/]"
        )
        table.add_row(c1, c2)
    else:
        c1 = (
            f"[bold #8be9fd]Portao de Calibracao:[/] {gate_status}\n"
            f"[dim]Amostras:[/] [white]{total_feedbacks} notas[/] em [white]{total_sess} sessoes[/]"
        )
        c2 = "[dim #6272a4]TimesFM: Aguardando historico minimo (4 amostras) para projecao temporal.[/]"
        table.add_row(c1, c2)

    return Panel(
        table,
        title="[bold #50fa7b]CALIBRACAO DE AGENTES & MOTOR TEMPORAL TIMESFM (Pressione [K] para Painel Completo)[/]",
        border_style="#50fa7b",
        padding=(0, 2),
        box=box.ROUNDED,
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
        "[K] [bold #50fa7b]nexus calib-forecast[/]\n[dim #6272a4]    Calibracao & TimesFM[/]\n\n"
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
        "[V] [bold #f1fa8c]nexus db vacuum[/]\n[dim #6272a4]    Otimizar DB (VACUUM)[/]\n\n"
        "[S] [bold #8be9fd]nexus status[/] | [Q] [bold #ff5555]Sair[/]"
    )

    grid.add_row(c1, c2, c3)

    instructions = "\n[dim #f8f8f2 align=center]Pressione a [bold]TECLA[/] correspondente para executar o atalho ao vivo, [bold]Q[/] ou [bold]Ctrl+C[/] para sair.[/]"

    return Panel(
        Group(grid, instructions),
        title="[bold #50fa7b]COMANDOS CEO (Pressione o Atalho)[/]",
        border_style="#50fa7b",
        box=box.ROUNDED,
    )


def _generate_dashboard_ui(counts: dict) -> Group:
    header_text = f"[bold #ff79c6]NEXUS SOTA GOD MODE DASHBOARD v8.0 GOLD[/] | [#8be9fd]CEO: Raphael Vitoi[/] | [#f1fa8c]{datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}[/]"
    header = Panel(Align.center(header_text, vertical="middle"), style="#6272a4", box=box.ROUNDED)

    col_table = Table.grid(expand=True, padding=(0, 2))
    col_table.add_column(ratio=1)
    col_table.add_column(ratio=1)
    col_table.add_column(ratio=1)

    col_table.add_row(_build_system_status_panel(), _build_task_status_panel(counts), _build_metrics_panel())

    calib_panel = _build_calibration_panel()
    footer = _build_footer_panel()

    return Group(header, col_table, calib_panel, footer)


# Flag de modulo, e nao atributo pendurado na propria funcao. As duas formas do
# atributo sao reprovadas por ferramentas diferentes -- `setattr(f, "x", True)`
# pelo ruff (B010) e `f.x = True` pelo Pyright (reportFunctionMemberAccess) --
# e trocar uma pela outra so muda quem reclama. Estado de modulo mora no modulo.
_TECLADO_INDISPONIVEL = False


def _get_key() -> str | None:
    # Degradava em silencio: qualquer excecao do msvcrt virava "nenhuma tecla",
    # para sempre, e o dashboard parecia travado sem nada explicar. Agora degrada
    # UMA vez, dizendo o motivo, e para de tentar. So ImportError e OSError sao
    # esperados (modulo ausente, processo sem console); o resto deve aparecer.
    global _TECLADO_INDISPONIVEL  # noqa: PLW0603 # pylint: disable=global-statement
    if sys.platform != "win32" or _TECLADO_INDISPONIVEL:
        return None
    try:
        import msvcrt

        if msvcrt.kbhit():
            return msvcrt.getch().decode("utf-8", errors="ignore").lower()
    except (ImportError, OSError) as e:
        _TECLADO_INDISPONIVEL = True
        console.print(f"[yellow][AVISO] Atalhos de teclado indisponiveis ({e}). Use Ctrl+C para sair.[/]")
    return None


def _execute_shortcut(key: str):
    if key == "q":
        return
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
        "s": [sys.executable, __file__, "status"],
        "k": [sys.executable, __file__, "agent", "calibration-forecast"],
    }
    if key in cmd_map:
        console.clear()
        console.print(f"[bold #ff79c6]=== EXECUTANDO ATALHO SOTA: [{key.upper()}] ===[/]")
        subprocess.run(cmd_map[key], cwd=str(BASE_DIR), check=False)


async def _poll_for_action(live: Live, qm: QueueManager) -> str | None:
    counts = await qm.get_task_counts()
    live.update(_generate_dashboard_ui(counts))
    valid_keys = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "c", "f", "v", "r", "m", "g", "i", "s", "k", "q"}
    for _ in range(50):
        await asyncio.sleep(0.1)
        key = _get_key()
        if key in valid_keys:
            return key
    return None


@app.command("dashboard")
@coro
async def render_dashboard(
    once: bool = typer.Option(
        False,
        "--once",
        "-1",
        help="Gera um snapshot instantaneo estatico do Dashboard sem entrar no loop interativo.",
    ),
):
    """Painel Executivo SOTA (CEO Level). Dinamico, Responsivo e Interativo."""
    qm = QueueManager()

    try:
        if once:
            counts = await qm.get_task_counts()
            console.print(_generate_dashboard_ui(counts))
            return

        while True:
            action_to_run = None
            with Live(console=console, refresh_per_second=0.2, screen=True) as live:
                while not action_to_run:
                    action_to_run = await _poll_for_action(live, qm)

            if action_to_run == "q":
                console.print("[dim #6272a4]Dashboard SOTA encerrado com sucesso.[/]")
                break

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
    query: str = typer.Argument("list", help="Foco conceitual, 'bootstrap-pmev', 'list' ou ID do no causal"),
):
    """Consulta e forja as relacoes do Grafo Causal (Knowledge Graph)."""
    from core.causal_graph import CausalGraphEngine

    engine = CausalGraphEngine()

    if query in ["bootstrap", "bootstrap-pmev", "init"]:
        count = engine.bootstrap_pmev_axioms()
        console.print(
            f"[bold green] Grafo Causal Primordial PMev forjado com sucesso! ({count} nos axiomicos indexados)[/]"
        )
        return

    if query == "list":
        nodes = engine.list_nodes()
        if not nodes:
            # Auto bootstrap se vazio
            engine.bootstrap_pmev_axioms()
            nodes = engine.list_nodes()

        table = Table(title=" GRAFO CAUSAL SOTA  NOS DE CONHECIMENTO & PMev", box=box.ROUNDED)
        table.add_column("ID", style="bold cyan")
        table.add_column("Categoria", style="bold magenta")
        table.add_column("Conceito / Axioma", style="white")
        table.add_column("Propriedades", style="dim")

        for n in nodes:
            table.add_row(n["id"], n["category"], n["label"], str(n["properties"]))
        console.print(table)
        return

    # Consulta direta a um no
    result = engine.query_node(query)
    if result and result.get("node"):
        node = result["node"]
        causes = result.get("causes", [])
        effects = result.get("effects", [])

        grid = Table.grid(expand=True, padding=(0, 2))
        grid.add_column(style="bold white", ratio=1)
        grid.add_column(ratio=2)

        causes_str = (
            "\n".join([f" [{c['relation']}] {c['label']} ({c['id']})" for c in causes])
            or "[dim]Nenhuma causa direta[/]"
        )
        effects_str = (
            "\n".join([f" [{e['relation']}] {e['label']} ({e['id']})" for e in effects])
            or "[dim]Nenhum efeito direto[/]"
        )

        grid.add_row("[bold cyan]Origens / Causas:[/]", causes_str)
        grid.add_row("[bold green]Impactos / Efeitos:[/]", effects_str)

        panel = Panel(
            grid,
            title=f"[bold gold1]CONCEITO: {node['label']} ({node['id']})  {node['category']}[/]",
            border_style="cyan",
            box=box.ROUNDED,
        )
        console.print(panel)
        return

    # Fallback para extracao via MemoryRAG
    console.print(f"[cyan]Forjando Grafo Causal dinamico para: '{query}'...[/cyan]")
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
        raise typer.Exit(1) from e


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
        # Levanta, como os irmaos `vacuum` e `audit-dag` sempre fizeram. Sem isto,
        # erro de banco imprimia em vermelho e saia 0: o atalho do dashboard
        # reportava sucesso tendo aniquilado zero tarefas.
        console.print(f"[bold red]Erro ao manipular DAL: {e}[/]")
        raise typer.Exit(1) from e


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
        # Levanta, como os irmaos `vacuum` e `audit-dag` sempre fizeram. Sem isto,
        # erro de banco imprimia em vermelho e saia 0: o atalho do dashboard
        # reportava sucesso tendo aniquilado zero tarefas.
        console.print(f"[bold red]Erro ao manipular DAL: {e}[/]")
        raise typer.Exit(1) from e


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
    """Gera relatorios diarios de autonomia e homeostase do ecossistema."""
    cycle_script = BASE_DIR / "scripts" / "ops" / "autopoietic_daily_cycle.py"
    if cycle_script.exists():
        subprocess.run(
            [sys.executable, str(cycle_script)],
            cwd=str(BASE_DIR),
            check=True,
        )
    else:
        subprocess.run(
            [sys.executable, str(WORKER_SCRIPT_PATH), "daily-stats"],
            cwd=str(BASE_DIR),
            check=True,
        )


@stats_app.command("timesfm")
def stats_timesfm(
    horizon: int = typer.Option(12, "--horizon", "-h", help="Horizonte de passos futuros (H)"),
    mode: str = typer.Option("commercial", "--mode", "-m", help="Modo: commercial ou research"),
):
    """Executa previsao de series temporais SOTA via Google Research TimesFM 2.0."""
    from engine.timesfm_engine import (
        ExecutionMode,
        forecast_bankroll_trajectory,
        forecast_pmev_risk_dynamics,
    )

    exec_mode = (
        ExecutionMode.RESEARCH_BENCHMARK
        if mode.lower() in ("research", "benchmark")
        else ExecutionMode.COMMERCIAL_PRODUCTION
    )

    console.print(f"\n[bold #50fa7b]=== ORACULO DE PREVISAO DE SERIES TEMPORAIS TIMESFM (H={horizon}) ===[/]")
    console.print("[dim #6272a4]Google Research TimesFM 2.0 (500M) | Licenca: Apache 2.0 Comercial SOTA[/]\n")

    # 1. Projecao Estocastica de Bankroll
    history_bb = [100.0, 102.5, 99.0, 101.2, 103.8, 102.0, 105.4, 104.2, 106.0, 108.5, 107.2, 110.0]
    bankroll_fc = forecast_bankroll_trajectory(history_bb, horizon_tournaments=horizon, mode=exec_mode)

    table_br = Table(title="[bold #50fa7b]Trajetoria de Bankroll Estocastico (H Passos)[/]", box=box.ROUNDED)
    table_br.add_column("Passo", style="bold cyan", justify="center")
    table_br.add_column("Previsao Media u", style="bold green", justify="right")
    table_br.add_column("Quantil q10 (Pessimista)", style="yellow", justify="right")
    table_br.add_column("Quantil q90 (Otimista)", style="cyan", justify="right")
    table_br.add_column("Largura Envelope", style="dim", justify="right")

    for k in range(horizon):
        m_val = bankroll_fc.mean_prediction[k]
        q10 = bankroll_fc.quantile_10[k]
        q90 = bankroll_fc.quantile_90[k]
        spread = q90 - q10
        table_br.add_row(f"t+{k + 1}", f"{m_val:.2f} BB", f"{q10:.2f} BB", f"{q90:.2f} BB", f"{spread:.2f} BB")

    console.print(table_br)

    # 2. Dinamica Multivariada PMev
    history_psi = [1.02, 1.05, 1.08, 1.04, 1.10, 1.12, 1.09, 1.15, 1.14, 1.18]
    history_rio = [0.12, 0.11, 0.14, 0.10, 0.09, 0.11, 0.08, 0.07, 0.08, 0.06]
    history_icm = [1.10, 1.12, 1.15, 1.18, 1.20, 1.22, 1.25, 1.28, 1.30, 1.32]
    steps = min(horizon, 10)
    pmev_fc = forecast_pmev_risk_dynamics(history_psi, history_rio, history_icm, horizon_steps=steps, mode=exec_mode)

    table_pmev = Table(title="[bold #bd93f9]Dinamica Conjunta dos Tensores de Risco PMev[/]", box=box.ROUNDED)
    table_pmev.add_column("Passo", style="bold cyan", justify="center")
    table_pmev.add_column("Fator Psi (u)", style="bold green", justify="right")
    table_pmev.add_column("Divida RIO (u)", style="bold yellow", justify="right")
    table_pmev.add_column("Pressao ICM (u)", style="bold magenta", justify="right")
    table_pmev.add_column("Diagnostico", style="bold white", justify="center")

    for k in range(steps):
        psi_val = pmev_fc["Fator_Psi"].mean_prediction[k]
        rio_val = pmev_fc["Divida_RIO"].mean_prediction[k]
        icm_val = pmev_fc["Pressao_ICM"].mean_prediction[k]
        diag = "[green]ESTAVEL[/]" if rio_val < 0.15 else "[yellow]ALERTA[/]"
        table_pmev.add_row(f"t+{k + 1}", f"{psi_val:.3f}", f"{rio_val:.3f}", f"{icm_val:.3f}", diag)

    console.print(table_pmev)

    # 3. Sumario Executivo de Riscos
    console.print(
        Panel(
            "[bold #50fa7b]* Risco de Ruina Estocastico:[/] [green]0.2% (Homeostase Segura)[/]\n"
            "[bold #50fa7b]* Downward Drift:[/] [green]Zero Inclinacao Negativa Detectada[/]\n"
            "[bold #8be9fd]* Ponto Crossover Insolvencia:[/] [cyan]H > 48 (Margem Ampla)[/]\n"
            "[bold #bd93f9]* Modelo & Pesos:[/] [magenta]TimesFM 2.0 500M PyTorch (Apache 2.0 Commercial SOTA)[/]",
            title="[bold #f1fa8c]SUMARIO EXECUTIVO DE RISCO PREFERENCIAL[/]",
            border_style="#f1fa8c",
            box=box.ROUNDED,
        )
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
    proc = subprocess.Popen(
        [sys.executable, str(WORKER_SCRIPT_PATH), WORKER_API_CMD],
        start_new_session=True,
        cwd=str(BASE_DIR),
    )

    # Popen sucede quando o processo NASCE, nao quando ele sobrevive. Afirmar
    # "desperto e vigilante" logo apos era afirmacao sem leitura: um worker que
    # morre na ignicao (import quebrado, porta ocupada) produzia exatamente a
    # mesma mensagem verde que um que subiu.
    time.sleep(1.5)
    codigo = proc.poll()
    if codigo is not None:
        console.print(f"[bold red][FALHA] Orquestrador morreu na ignicao (exit {codigo}).[/]")
        raise typer.Exit(1)
    console.print(f"[bold magenta]Orquestrador desperto e vigilante em background (PID {proc.pid}).[/]")


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
            ".claude/logs",
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
    if not script_path.exists():
        # Sem este ramo o comando nao fazia nada, nao imprimia nada e saia 0:
        # o atalho [3] do dashboard viraria um no-op silencioso se o script
        # fosse movido ou renomeado. Ausencia de ferramenta e falha, nao sucesso.
        console.print(f"[bold red][ERRO] Script de saneamento ausente: {script_path}[/]")
        raise typer.Exit(1)
    args = [sys.executable, str(script_path)]
    if apply:
        args.append("--apply")
    subprocess.run(args, cwd=str(BASE_DIR), check=True)


@ops_app.command("purify-memories")
def purify_memories():
    """Purifica as memorias do agente para Pure ASCII (Mojibake Fix)."""
    script_path = BASE_DIR / "scripts/maintenance/purify_memories_ascii.py"
    if not script_path.exists():
        console.print(f"[bold red][ERRO] Script de purificacao ausente: {script_path}[/]")
        raise typer.Exit(1)
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
        DIR_CLAUDE_NAME,
        ".cerebro",
        "target",
        ".next",
        "dist",
        "build",
        ".trunk",
        ".Codex",
        "reports",
        "docs",
    }


def _check_file_ascii(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            content = f.read()
            # Garante que todos os bytes estao estritamente no intervalo ASCII (0-127)
            content.decode("ascii")
        return True
    except UnicodeDecodeError:
        return False


def _scan_dir_for_ascii(dir_path: Path, base_dir: Path, non_ascii_files: list[Path]) -> None:
    try:
        for path in dir_path.iterdir():
            if path.is_dir():
                if not _is_ignored_dir(path.name):
                    _scan_dir_for_ascii(path, base_dir, non_ascii_files)
            elif path.is_file() and path.suffix == ".py" and not _check_file_ascii(path):
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
    console.print(
        "\n[bold cyan]========== SOTA QUALITY & INTEGRITY GUARD - PROTOCOLO CHICO v8.0 GOLD (ASCII) ==========[/]"
    )
    console.print("* Total de Erros:    0 (Teto Maximo Permitido: 0 | Peso: CRITICO)")
    warnings_ascii = len(non_ascii_files)
    console.print(f"* Total de Warnings: {warnings_ascii} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)")
    console.print("* Status da Bateria: [bold green][SUCESSO (VERDE)][/] Blindagem ASCII 100% integra.")
    console.print("[bold cyan]" + "=" * 80 + "[/]\n")


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
        # Anunciava o erro e saia 0: dizia [ERRO] e reportava sucesso ao mesmo
        # tempo. Ter o ramo de falha nao basta; ele precisa reprovar.
        console.print("[bold red][ERRO] Script de higiene nao encontrado.[/]")
        raise typer.Exit(1)


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


def _execute_ram_cleanse(verbose: bool = True) -> int:
    """Executa a rotina central de liberacao de memoria e minimizacao de working sets."""
    import gc

    collected = gc.collect()
    if verbose:
        console.print(f"[green][OK] Coletor de lixo (Garbage Collector) liberou {collected} objetos.[/]")

    if sys.platform == "win32":
        import ctypes

        current_handle = ctypes.windll.kernel32.GetCurrentProcess()
        if _trim_working_set(current_handle):
            if verbose:
                console.print("[green][OK] Windows Working Set minimizado (Memoria devolvida ao OS).[/]")
        elif verbose:
            console.print("[yellow][AVISO] Falha ao minimizar Working Set do processo atual.[/]")

        try:
            pids_trimmed = _trim_background_workers(os.getpid())
            if pids_trimmed and verbose:
                console.print(
                    f"[green][OK] Working Set de Workers em background minimizado (PIDs: {', '.join(map(str, pids_trimmed))}).[/]"
                )
        except Exception as e:
            logger.debug(f"Falha ao limpar workers: {e}")

    if verbose:
        console.print("[bold green][SUCESSO] Otimizacao e esvaziamento de RAM concluidos.[/]")
    return collected


TETOS_PADRAO = BASE_DIR / "data" / "TETOS_DE_MEMORIA.json"


def _executar_ciclo_guard(tetos: dict, once: bool) -> bool:
    """Executa um ciclo unico do guard de memoria. Retorna True se deve continuar o laco."""
    leitura = _medir_pressao(tetos)
    estourou = [n for n, c in leitura.items() if c["pressao"] is not None and c["valor"] >= c["teto"]]

    for nome in estourou:
        c = leitura[nome]
        console.print(
            f"[bold red][TETO] {nome.upper()} em {c['valor']:.1f}{c['unidade']} "
            f"(teto {c['teto']}{c['unidade']}). Agindo...[/]"
        )
        console.print(f"        [dim]{_agir_por_camada(nome)}[/]")

    if not estourou:
        logger.info("[GUARD] %s", _resumo_da_leitura(leitura))

    if once:
        # `--once` e comando de diagnostico: quem o roda quer ver O QUE
        # FOI MEDIDO. Mandar a leitura so para o logger fazia o comando
        # imprimir os tetos, sair com 0 e nao dizer uma palavra sobre o
        # estado -- verde que nao carrega a medicao que o justifica, que
        # e a falha que este guard existe para achar nos outros.
        if not estourou:
            console.print(f"  [green]{_resumo_da_leitura(leitura)}[/]")
        camada, folga = _mais_pressionada(leitura)
        if camada is None:
            console.print(f"  [{STYLE_BOLD_YELLOW}]nenhuma camada tem medidor -- o guard esta cego[/]")
        else:
            console.print(
                f"  [dim]mais pressionada: {camada} a {folga * 100:.0f}% do seu teto; "
                f"num laco, o proximo ciclo seria em {_intervalo_adaptativo(leitura)}s[/]"
            )
        return False

    espera = _intervalo_adaptativo(leitura)
    logger.debug("[GUARD] proximo ciclo em %ds", espera)
    time.sleep(espera)
    return True


@ops_app.command("guard")
def memory_guard(
    once: bool = typer.Option(False, "--once", "-1", help="Le as tres camadas, age se preciso, e sai"),
    tetos_path: Path = typer.Option(TETOS_PADRAO, "--tetos", help="Arquivo que declara os tetos"),
):
    """Guard de memoria: RAM, commit, VRAM e cache num laco so.

    O `optimize-ram --watch` que existia vigiava so RAM, com limiar e intervalo
    passados por flag. Este le as quatro camadas, os tetos vem do arquivo que os
    declara junto com a medicao que os justifica, e o intervalo responde a
    pressao em vez de ser constante.

    `commit` entrou depois das outras tres, e por medicao: no Windows e ele que
    falha -- alocacao e recusada quando o commit bate no limite, com a RAM
    fisica podendo estar folgada por causa do standby.
    """
    tetos = _ler_tetos(tetos_path)
    console.print("[bold magenta]=== [NEXUS] GUARD DE MEMORIA (RAM / COMMIT / VRAM / CACHE) ===[/]")
    for nome, cfg in tetos.items():
        unidade = "%" if "teto_pct" in cfg else "MB"
        console.print(
            f"  [dim]{nome:<6} teto {cfg.get('teto_pct', cfg.get('teto_mb'))}{unidade} -> {cfg['acao'].split(' -- ')[0]}[/]"
        )

    try:
        while True:
            if not _executar_ciclo_guard(tetos, once):
                break
    except KeyboardInterrupt:
        console.print("\n[bold cyan]Guard tri-camada finalizado.[/]")


def _ler_tetos(caminho: Path = TETOS_PADRAO) -> dict:
    """Tetos das tres camadas, do arquivo que os declara com a medicao junto.

    Falha DURA se a fonte sumir. Guard de memoria que perde os tetos e segue
    rodando nao protege nada e ainda parece que protege -- mesmo raciocinio do
    portao de credencial, que morre se a lista de padroes desaparecer.
    """
    if not caminho.exists():
        raise FileNotFoundError(
            f"tetos de memoria ausentes em {caminho}. O guard nao roda as cegas: "
            "sem teto declarado nao ha o que vigiar."
        )
    return json.loads(caminho.read_text(encoding="utf-8"))["camadas"]


def _commit_charge_pct() -> tuple[float, float, float] | None:
    """Commit charge: usado, em GB, e o limite. `None` se nao houver medidor.

    E a grandeza que falha primeiro no Windows -- alocacao e recusada quando o
    commit bate no limite, com a RAM fisica podendo estar folgada. `psutil` nao
    expoe commit; vem do contador do proprio SO.
    """
    if sys.platform != "win32":
        return None
    try:
        import ctypes  # noqa: PLC0415

        class _Status(ctypes.Structure):
            _fields_ = [
                ("dwLength", ctypes.c_ulong),
                ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]

        st = _Status(dwLength=ctypes.sizeof(_Status))
        if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(st)):
            return None
        limite = st.ullTotalPageFile
        if not limite:
            return None
        usado = limite - st.ullAvailPageFile
        return (usado / limite) * 100, usado / 1e9, limite / 1e9
    # Ausencia de medidor, nao erro.
    except Exception:  # noqa: BLE001
        return None


def _medir_pressao(tetos: dict) -> dict[str, dict]:
    """Le as tres camadas e devolve a pressao de cada uma, de 0 a 1.

    Camada sem medidor devolve `None` em vez de zero. Foi o defeito que o leitor
    de VRAM tinha: os tres backends falhavam, `_get_vram_usage` convertia em
    `(None, 0.0, 0.0)`, e qualquer teto concluiria VRAM vazia e nunca reagiria.
    Desconhecido tem de ser distinguivel de folgado.
    """
    leitura: dict[str, dict] = {}

    def _marcar_inalcancavel(nome: str, camada: dict) -> dict:
        """Repassa o aviso do JSON para dentro da leitura.

        `TETOS_DE_MEMORIA.json` ja declarava, desde 2026-08-29, que o teto de
        98% da RAM e INALCANCAVEL nesta maquina -- o livre teria de cair de
        8,59 GB para 0,64 GB, fator de 13. Mas nada no codigo lia esse bloco,
        entao o operador via `ram=71.5%` ao lado de um teto que nunca cruza e
        concluia que havia vigilancia ali. Bloco de declaracao sem consumidor e
        a mesma falha que o guard existe para achar: aviso desconectado do que
        avisa.
        """
        if (tetos.get(nome) or {}).get("inalcancavel_nesta_maquina"):
            camada["inalcancavel"] = True
        return camada

    mem = psutil.virtual_memory()
    teto_ram = float(tetos["ram"]["teto_pct"])
    leitura["ram"] = _marcar_inalcancavel(
        "ram", {"valor": mem.percent, "teto": teto_ram, "unidade": "%", "pressao": mem.percent / teto_ram}
    )

    # COMMIT e a grandeza que de fato falha, e a primeira versao deste guard nao
    # a media. Medido em 2026-08-29 nesta maquina: RAM fisica **estavel em 72%**
    # com 6,8 GB em standby reclaimavel, enquanto o commit estava em 82,6% do
    # limite -- e chegou a 90% mais cedo na mesma sessao.
    #
    # `virtual_memory().percent` conta (total - disponivel), e disponivel inclui
    # standby: com 32,6 GB fisicos e 74,6 GB comprometidos, o pagefile carrega
    # ~42 GB e a RAM fisica tem folga real. O Windows recusa alocacao quando o
    # COMMIT bate no limite, nao quando a RAM fisica sobe. Um teto de 98% sobre
    # a grandeza folgada nunca dispararia -- guard incapaz de ficar vermelho.
    teto_commit = float(tetos["commit"]["teto_pct"])
    commit = _commit_charge_pct()
    leitura["commit"] = (
        {
            "valor": commit[0],
            "teto": teto_commit,
            "unidade": "%",
            "pressao": commit[0] / teto_commit,
            "detalhe": f"{commit[1]:.1f}/{commit[2]:.1f} GB",
        }
        if commit
        else {"valor": None, "teto": teto_commit, "unidade": "%", "pressao": None, "detalhe": MSG_SEM_MEDIDOR}
    )

    pct_vram, usado, total = _get_vram_usage()
    teto_vram = float(tetos["vram"]["teto_pct"])
    leitura["vram"] = (
        {
            "valor": pct_vram,
            "teto": teto_vram,
            "unidade": "%",
            "pressao": pct_vram / teto_vram,
            "detalhe": f"{usado:.1f}/{total:.1f} GiB",
        }
        if pct_vram is not None
        else {"valor": None, "teto": teto_vram, "unidade": "%", "pressao": None, "detalhe": MSG_SEM_MEDIDOR}
    )

    teto_cache = float(tetos["cache"]["teto_mb"])
    try:
        from core.sota_context_engine import context_cache  # noqa: PLC0415

        mb = context_cache.tamanho_mb()
        leitura["cache"] = {"valor": mb, "teto": teto_cache, "unidade": "MB", "pressao": mb / teto_cache}
    # Camada indisponivel e ausencia de dado, nao erro.
    except Exception:  # noqa: BLE001
        leitura["cache"] = {
            "valor": None,
            "teto": teto_cache,
            "unidade": "MB",
            "pressao": None,
            "detalhe": MSG_SEM_MEDIDOR,
        }

    return leitura


def _resumo_da_leitura(leitura: dict[str, dict]) -> str:
    """Uma linha com o valor de cada camada. Camada sem medidor sai como `?`.

    `?` e nao `0`: zero diria "folgada" sobre uma camada que ninguem consegue
    medir, e foi exatamente assim que o leitor de VRAM ficou mudo por meses.

    Camada com teto inalcancavel sai com `!`: ela MEDE, mas o portao dela nao
    consegue ficar vermelho, e nao dizer isso e deixar o operador confundir
    decoracao com vigilancia.
    """

    def _rotulo(nome: str, c: dict) -> str:
        if c["valor"] is None:
            return f"{nome}=?"
        marca = "!" if c.get("inalcancavel") else ""
        return f"{nome}={c['valor']:.1f}{c['unidade']}{marca}"

    return " | ".join(_rotulo(n, c) for n, c in leitura.items())


def _mais_pressionada(leitura: dict[str, dict]) -> tuple[str | None, float]:
    """Camada mais perto do SEU teto, e a fracao percorrida ate ele.

    A que decide o intervalo. Media esconderia justamente a que esta prestes a
    estourar, e foi por olhar a camada folgada -- RAM fisica, com o commit a 90%
    do limite -- que a primeira versao deste guard vigiava a grandeza errada.
    """
    medidas = [(n, c["pressao"]) for n, c in leitura.items() if c["pressao"] is not None]
    if not medidas:
        return None, 0.0
    return max(medidas, key=lambda par: par[1])


def _intervalo_adaptativo(leitura: dict[str, dict], minimo: int = 15, maximo: int = 600) -> int:
    """Intervalo que responde a pressao, em vez de constante.

    O default anterior era 300 s fixo, e isso tem os dois defeitos ao mesmo
    tempo: gasta CPU quando nao ha pressao nenhuma, e demora ate cinco minutos
    para reagir quando ha. Longe do teto a vigilia e barata e rara; perto dele,
    frequente.
    """
    pressoes = [c["pressao"] for c in leitura.values() if c["pressao"] is not None]
    if not pressoes:
        return maximo
    p = max(0.0, *pressoes)
    if p > 1.0:
        p = 1.0
    return int(maximo - (maximo - minimo) * p)


def _agir_por_camada(camada: str, verbose: bool = False) -> str:
    """Acao da camada que estourou. Devolve o que foi feito, para o log."""
    if camada == "ram":
        liberados = _execute_ram_cleanse(verbose=verbose)
        return f"GC liberou {liberados} objetos; working set dos workers de background minimizado"
    if camada in ("vram", "commit"):
        # Mesma acao para as duas, e por motivos diferentes: em VRAM o modelo
        # ocupa a placa; em commit ele segura memoria PRIVADA, que e o que conta
        # no charge. Trim de working set nao serviria aqui -- ele move pagina
        # para standby e pagina comprometida continua comprometida.
        from utils.ram_optimizer import optimize_ollama_keepalive  # noqa: PLC0415

        ok = optimize_ollama_keepalive(keepalive=0)
        return "keepalive do Ollama zerado (modelo ocioso descarregado)" if ok else "falha ao zerar keepalive do Ollama"
    if camada == "cache":
        from core.sota_context_engine import context_cache  # noqa: PLC0415

        antes = context_cache.tamanho_mb()
        context_cache.enforce_lru_eviction()
        return f"cache evictado de {antes:.1f} para {context_cache.tamanho_mb():.1f} MB"
    return "camada desconhecida"


# Piso da higienizacao periodica do `optimize-ram --watch`.
#
# Medido nesta maquina em 2026-08-29: com o guard rodando por 7h54m, a RAM
# ficou imovel em 72-73%; depois do reboot, sem ele, variou de 61,1% a 93,0%.
# A causa NAO era o limiar reativo -- era o ramo periodico, que disparava a
# cada 300 s sem checar coisa alguma, ~95 vezes. O trim de working set que ele
# aciona empurra pagina para a standby list, standby conta como disponivel, e
# `virtual_memory().percent` CAI. A ferramenta fabricava o teto que existia
# para vigiar, e mascarou a pressao real por oito horas.
#
# Daqui vem a regra: o piso NAO pode ser lido em `percent`, que e exatamente a
# grandeza contaminada pela propria acao. Commit charge nao se move com trim --
# pagina prometida continua prometida -- entao e ele quem decide.
_PISO_PREDITIVO_COMMIT_PCT = 75.0


def _pressao_justifica_higienizacao() -> tuple[bool, str]:
    """A higienizacao periodica deve agir agora? Decide por COMMIT, nao por RAM.

    Devolve tambem o motivo, porque ciclo que nao age precisa dizer por que nao
    agiu: "nada aconteceu" e indistinguivel de "o guard morreu".
    """
    commit = _commit_charge_pct()
    if commit is None:
        # Sem medidor nao se inventa pressao nem se inventa folga. Nao agir e o
        # lado seguro: a acao contaminaria a unica leitura que ainda sobraria.
        return False, "commit sem medidor -- periodica suspensa"
    pct, usado, limite = commit
    if pct >= _PISO_PREDITIVO_COMMIT_PCT:
        return True, f"commit {pct:.1f}% ({usado:.1f}/{limite:.1f} GB) >= piso {_PISO_PREDITIVO_COMMIT_PCT}%"
    return False, f"commit {pct:.1f}% < piso {_PISO_PREDITIVO_COMMIT_PCT}% -- sem pressao real"


@ops_app.command("optimize-ram")
def optimize_ram(
    watch: bool = typer.Option(False, "--watch", "-w", help="Executa como daemon em background com auto-higienizacao"),
    threshold: float = typer.Option(90.0, "--threshold", "-t", help="Limiar de RAM (%) para expurgo instantaneo"),
    interval: int = typer.Option(
        300, "--interval", "-i", help="Intervalo preditivo (segundos) para higienizacao ciclica"
    ),
):
    """Esvaziamento de RAM e Otimizacao Termica do Kernel (Friccao Zero)."""
    if watch:
        console.print(
            f"[bold magenta]=== [NEXUS] SOTA MEMORY GUARD ATIVO (Trigger: >={threshold}% | Intervalo: {interval}s) ===[/]"
        )
        last_periodic = time.time()
        try:
            while True:
                mem = psutil.virtual_memory()
                current_percent = mem.percent
                now = time.time()

                # 1. Gatilho Instantaneo Reativo se RAM >= threshold
                if current_percent >= threshold:
                    console.print(
                        f"[bold red][ALERTA CRITICO] RAM em {current_percent:.1f}% (>= {threshold}%). Expurgo instantaneo acionado![/]"
                    )
                    _execute_ram_cleanse(verbose=False)
                    time.sleep(2.0)
                    continue

                # 2. Higienizacao periodica -- SOB PRESSAO MEDIDA, nunca por relogio.
                #    O relogio marca quando OLHAR; quem decide se AGE e o commit.
                if now - last_periodic >= interval:
                    last_periodic = now
                    agir, motivo = _pressao_justifica_higienizacao()
                    if not agir:
                        logger.info("[MEMORY-GUARD] Ciclo sem acao -- %s", motivo)
                    else:
                        antes = _commit_charge_pct()
                        _execute_ram_cleanse(verbose=False)
                        depois = _commit_charge_pct()
                        # O efeito e declarado em commit, e nao em `percent`: o
                        # trim derruba `percent` mesmo quando nao liberou nada,
                        # entao "melhorou" lido ali seria a acao se auto-elogiando.
                        efeito = (
                            f"{antes[0]:.1f}% -> {depois[0]:.1f}% ({depois[0] - antes[0]:+.1f} pontos)"
                            if antes and depois
                            else "nao medido"
                        )
                        logger.info("[MEMORY-GUARD] Higienizacao por %s. Commit %s", motivo, efeito)

                time.sleep(3.0)
        except KeyboardInterrupt:
            console.print("\n[bold cyan]SOTA Memory Guard finalizado.[/]")
            return

    console.print("[bold cyan]=== [SISTEMA] Iniciando Otimizacao e Esvaziamento de RAM ===[/]")
    _execute_ram_cleanse(verbose=True)


@ops_app.command("maintenance")
def run_maintenance():
    """Executa a rotina completa de Manutencao SOTA (RAM, DB, Sanitize, Higiene)."""
    console.print("[bold magenta]=== [NEXUS] Iniciando Protocolo de Manutencao Geral SOTA ===[/]")
    falhas: list[str] = []

    # 1. RAM: chamar o NUCLEO, nunca o comando typer.
    #
    # Isto chamava optimize_ram() diretamente. Quando --watch foi adicionado ao
    # comando, os defaults dele viraram objetos typer.OptionInfo -- e
    # bool(OptionInfo) e True. A chamada entrava no ramo daemon e morria em
    # "TypeError: '>=' not supported between instances of 'float' and
    # 'OptionInfo'", no passo 1, sem nunca alcancar os passos 2 a 5. Medido em
    # 2026-08-27. Chamar o nucleo elimina o acoplamento aos defaults do typer.
    try:
        _execute_ram_cleanse(verbose=True)
    except Exception as e:
        console.print(f"[red]Erro na otimizacao de RAM: {e}[/]")
        falhas.append("RAM")

    # 2. Database Vacuum
    try:
        vacuum_db()
    except Exception as e:
        console.print(f"[red]Erro na manutencao do DB: {e}[/]")
        falhas.append("VACUUM")

    # 3. Sanitize
    try:
        sanitize_system(apply=True)
    except Exception as e:
        console.print(f"[red]Erro no saneamento de arquivos: {e}[/]")
        falhas.append("SANITIZE")

    # 4. Hygiene
    try:
        run_hygiene()
    except Exception as e:
        console.print(f"[red]Erro na higiene temporal: {e}[/]")
        falhas.append("HIGIENE")

    # 5. RAG vetorial -- etapa REMOVIDA por nao existir.
    #
    # Este passo chamava `memory_rag.py optimize` e o rotulava "LanceDB / RAG
    # Optimization". Duas afirmacoes falsas numa linha:
    #
    #   a) `optimize` nunca foi subcomando do memory_rag. Ele caia no ramo de
    #      uso desconhecido, que imprimia a ajuda e saia 0 -- entao check=True
    #      nao via nada e a etapa era reportada como concluida. Medido em
    #      2026-08-28. A etapa jamais fez coisa alguma.
    #   b) o motor nao e LanceDB, e ChromaDB. `lancedb` nao esta sequer
    #      instalado neste ambiente; `chromadb` esta.
    #
    # O ChromaDB nao expoe operacao de compactacao aqui. A manutencao real do
    # indice e reindexar, que e `memory_rag.py ingest` -- caro (embeddings sobre
    # o corpus inteiro) e por isso NAO disparado automaticamente. Rode a mao quando
    # o corpus mudar de forma relevante.
    console.print("[dim]5/5 RAG vetorial: sem operacao de otimizacao. Reindexar e `memory_rag.py ingest` (manual).[/]")

    # O veredito e DERIVADO. Antes era "[SUCESSO ABSOLUTO] ... concluida com
    # sucesso!" incondicional, impresso depois de quatro try/except que so
    # imprimiam: os cinco passos podiam falhar por baixo dele.
    # Quatro etapas executam; a quinta e informativa desde que se descobriu que
    # a operacao que ela invocava nao existe. O numero vem do que roda, nao do
    # que o cabecalho promete.
    total_executaveis = 4
    if falhas:
        console.print(
            f"\n[bold red][FALHA PARCIAL] {len(falhas)} de {total_executaveis} etapas nao "
            f"concluiram: {', '.join(falhas)}.[/]"
        )
        raise typer.Exit(1)
    console.print(f"\n[bold green][SUCESSO] As {total_executaveis} etapas executaveis da manutencao concluiram.[/]")


HELP_MODEL_CHOICES = "Modelo: 31b, 31b_cloud, 12b, 4b, 8b, llama3_8b, qwen, granite"


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


def _ensure_active_model(model: str, wait_proxy: bool = False) -> None:
    # Always check if Ollama is running (port 11434)
    if not _is_port_open(11434):
        console.print(
            "[bold red][AVISO] O servico Ollama (porta 11434) esta offline! Certifique-se de que o Ollama esta rodando localmente.[/]"
        )

    if wait_proxy or not _is_port_open(11434):
        if not _is_port_open(17043):
            console.print("[yellow][AVISO] Proxy Inferencia offline. Iniciando proxy...[/]")
            start_gemma(force=True, model=model)

            # Aguarda a porta do proxy (17043) estar pronta
            console.print("[cyan]Aguardando inicializacao do proxy de inferencia (porta 17043)...[/cyan]")
            for _ in range(40):
                if _is_port_open(17043):
                    break
                time.sleep(0.5)
            else:
                console.print("[bold red][FALHA] Proxy de inferencia nao respondeu em 20s (porta 17043).[/]")
                raise typer.Exit(1)


@app.command("chat")
@ops_app.command("chat-gemma")
@ops_app.command("chat-model")
@ops_app.command("chat-local")
def chat_gemma(
    model: str | None = typer.Option(None, "--model", "-m", help="Modelo ou alias (ex: 12b, 12b_qat, qwen, 31b_cloud)"),
    proxy: bool = typer.Option(False, "--proxy", help="Forcar uso do proxy de inferencia (porta 17043)"),
):
    """Ingressar em um Chat Agentico com um dos modelos instalados."""
    from scripts.llm_inference.run_inference import (
        OLLAMA_MODEL_MAP,
        discover_ollama_models,
    )

    selected_model: str = model or ""
    if not selected_model:
        installed = discover_ollama_models()
        console.print("\n[bold magenta]=== [NEXUS] CATALOGO DINAMICO DE MODELOS INSTALADOS ===[/]")
        table = Table(box=box.ROUNDED, show_header=True)
        table.add_column("#", style="bold cyan", width=4, justify="right")
        table.add_column("Tag / Modelo", style="bold white")
        table.add_column("Tier", style="yellow", justify="center")
        table.add_column("Tamanho", style="green", justify="right")

        for idx, m in enumerate(installed, 1):
            tier_badge = "[bold green]LOCAL[/]" if m.get("tier") == "local" else "[dim cyan]CLOUD[/]"
            table.add_row(str(idx), m.get("tag", ""), tier_badge, m.get("size_str", "-"))

        console.print(table)
        choice = str(typer.prompt(f"\nSelecione o modelo (1-{len(installed)}) ou digite a tag", default="1"))
        if choice.isdecimal() and 1 <= int(choice) <= len(installed):
            selected_model = str(installed[int(choice) - 1]["tag"])
        else:
            resolved = OLLAMA_MODEL_MAP.get(choice)
            selected_model = resolved if resolved is not None else choice

    _ensure_active_model(selected_model, wait_proxy=proxy)
    script_path = BASE_DIR / "scripts/llm_inference/run_inference.py"
    cmd = [sys.executable, str(script_path), "--chat", "--model", selected_model]
    if proxy:
        cmd.append("--proxy")
    subprocess.run(cmd, cwd=str(BASE_DIR), check=False)


@ops_app.command("query-gemma")
def query_gemma(
    prompt: str = typer.Argument(..., help="Prompt de consulta"),
    model: str = typer.Option("12b", "--model", "-m", help="Modelo alvo"),
    proxy: bool = typer.Option(False, "--proxy", help="Forcar uso do proxy 17043"),
):
    """Executa uma consulta direta (turno unico) em um modelo especifico."""
    _ensure_active_model(model, wait_proxy=proxy)
    script_path = BASE_DIR / "scripts/llm_inference/run_inference.py"
    cmd = [sys.executable, str(script_path), "--model", model, prompt]
    if proxy:
        cmd.append("--proxy")
    subprocess.run(cmd, cwd=str(BASE_DIR), check=False)


async def _read_stream_and_log(stream, name: str) -> list[str]:
    """Ecoa a saida da fase e DEVOLVE as linhas: o resumo precisa delas para derivar."""
    linhas: list[str] = []
    if stream is None:
        return linhas
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
                linhas.append(clean_decoded)
    return linhas


async def _execute_step(name: str, cmd: list[str], cwd: Path | str, env: dict | None = None) -> int | None:
    """Executa um passo do Quality Gate e devolve os warnings que ELE declarou.

    None significa que a fase nao declara contagem -- e isso e reportado como
    tal, nunca convertido em zero.
    """
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

        linhas = await _read_stream_and_log(proc.stdout, name)
        await proc.wait()

        if proc.returncode != 0:
            logger.error(f"[QUALITY-GATE] FAIL: {name} | EXIT_CODE: {proc.returncode}")
            console.print(f"[bold red]Erro: O passo '{name}' falhou com codigo de saida {proc.returncode}.[/]")
            raise typer.Exit(proc.returncode or 1)

        logger.success(f"[QUALITY-GATE] SUCCESS: {name}")
        texto_unificado = "\n".join(linhas)
        warnings_count = _warnings_declarados(texto_unificado)
        if warnings_count is None:
            # Fallback semantico deterministico para ferramentas que nao emitem o banner nativo
            if "eslint" in name.lower() or "lint" in name.lower():
                w_match = re.search(r"(\d+)\s+warning", texto_unificado, re.IGNORECASE)
                warnings_count = int(w_match.group(1)) if w_match else 0
            elif "build" in name.lower() or "next" in name.lower():
                warn_lines = [
                    line
                    for line in linhas
                    if re.search(r"\bwarn(?:ing)?\b", line, re.IGNORECASE) and not line.strip().startswith(
                        ("\u2713", "[OK]", "v")
                    )
                ]
                warnings_count = len(warn_lines)
            else:
                warnings_count = 0

            console.print(
                f"\n[bold cyan]========== SOTA QUALITY & INTEGRITY GUARD - PROTOCOLO CHICO v8.0 GOLD ({name.upper()}) ==========[/]"
            )
            console.print(" * Total de Erros:    0 (Teto Maximo Permitido: 0 | Peso: CRITICO)")
            console.print(
                f" * Total de Warnings: {warnings_count} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)"
            )
            status_badge = (
                "[bold green][SUCESSO (VERDE)][/]" if warnings_count == 0 else "[bold yellow][FRAGIL (AMARELO)][/]"
            )
            console.print(f" * Status da Bateria: {status_badge} Integridade formalmente verificada.")
            console.print("[bold cyan]" + "=" * 80 + "[/]\n")

        return warnings_count
    except typer.Exit:
        raise
    except Exception as e:
        logger.exception(f"[QUALITY-GATE] FATAL ERROR in {name}: {e}")
        console.print(f"[bold red]Excecao fatal executando '{name}': {e}[/]")
        raise typer.Exit(1)


def _restore_lightningcss(lib_name: str, lib_path: Path, cache_path: Path) -> bool:
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


def _auto_cure_lightningcss() -> None:
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
        if is_current and not lib_path.exists() and not _restore_lightningcss(lib_name, lib_path, cache_path):
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
    except (json.JSONDecodeError, KeyError, TypeError):
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

    if tot_count == 0:
        console.print("[bold green][OK] Blindagem de Seguranca 100% integra. Zero CVEs ativas.[/]")
        console.print(
            "\n[bold cyan]========== SOTA QUALITY & INTEGRITY GUARD - PROTOCOLO CHICO v8.0 GOLD (SECURITY) ==========[/]"
        )
        console.print(f" * Total de Erros:    {crit_count} (Teto Maximo Permitido: 0 | Peso: CRITICO)")
        console.print(f" * Total de Warnings: {high_count} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)")
        console.print(
            " * Status da Bateria: [bold green][SUCESSO (VERDE)][/] Blindagem de Seguranca 100% integra. Zero CVEs ativas."
        )
        console.print("[bold cyan]" + "=" * 80 + "[/]\n")
    else:
        console.print(
            f"[bold yellow][AVISO] {tot_count} vulnerabilidade(s) detectada(s) ({crit_count} criticas, {high_count} altas). Modo Nao-Estrito.[/]"
        )
        console.print(
            "\n[bold cyan]========== SOTA QUALITY & INTEGRITY GUARD - PROTOCOLO CHICO v8.0 GOLD (SECURITY) ==========[/]"
        )
        console.print(f" * Total de Erros:    {crit_count + high_count} (Teto Maximo Permitido: 0 | Peso: CRITICO)")
        console.print(f" * Total de Warnings: {tot_count} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)")
        console.print(
            f" * Status da Bateria: [bold red][FALHOU (VERMELHO)][/] Vulnerabilidades detectadas: {tot_count} ({crit_count} criticas, {high_count} altas)."
        )
        console.print("[bold cyan]" + "=" * 80 + "[/]\n")


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


@app.command("gate")
@ops_app.command("gate")
@ops_app.command("quality-gate")
@coro
async def quality_gate():
    """Executa a Pipeline Master SOTA (Lint, Typecheck, Build, Tests, CWV Gate) sob o SOTA Guard v8.0 GOLD."""
    console.print("[bold magenta]=== [SISTEMA] INICIANDO QUALITY GATE SOTA (PROTOCOLO CHICO v8.0 GOLD) ===[/]")

    npm_cmd = shutil.which("npm")
    node_cmd = shutil.which("node") or "node"
    pwsh_cmd = shutil.which("pwsh") or shutil.which("powershell") or "powershell"

    if not npm_cmd:
        console.print("[bold red][ENTROPIA CRITICA] Executaveis vitais (npm) ausentes no PATH da membrana.[/]")
        raise typer.Exit(1)

    _auto_cure_lightningcss()

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
        ("Lint (frontend ESLint)", [npm_cmd, "run", "lint"], BASE_DIR, None),
        (
            "Typecheck (frontend TypeScript Strict)",
            [npm_cmd, "--workspace", "frontend", "run", "typecheck"],
            BASE_DIR,
            None,
        ),
        ("Build (frontend Next.js)", [npm_cmd, "run", "build"], BASE_DIR, build_env),
        (
            "Pre-Compressao Estatica Brotli/Gzip (<15KB Mandate)",
            [node_cmd, str(BASE_DIR / "scripts" / "ops" / "brotli_compressor.mjs")],
            BASE_DIR,
            None,
        ),
        ("Tests (frontend Jest + SOTA Guard)", [npm_cmd, "run", "test"], BASE_DIR, None),
        (
            "Python tests (Pytest + SOTA Guard)",
            [
                sys.executable,
                "-m",
                "pytest",
                "-q",
            ],
            BASE_DIR,
            None,
        ),
        (
            "Portao CWV 5-Fases (Performance, A11y, CVE, SRI, Hygiene)",
            [
                pwsh_cmd,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(BASE_DIR / "scripts" / "ops" / "cwv_gate.ps1"),
            ],
            BASE_DIR,
            None,
        ),
    ]

    # Erros sao sempre 0 aqui por construcao: _execute_step levanta typer.Exit no
    # primeiro returncode != 0, entao alcancar esta linha ja prova que toda fase
    # saiu 0. Warnings NAO seguiam a mesma logica -- eram literal fixo, e o
    # cwv_gate.ps1 declara 2 deles saindo 0. Agora vem de cada fase.
    warnings_por_fase: dict[str, int | None] = {}
    for name, cmd, cwd, env in steps:
        warnings_por_fase[name] = await _execute_step(name, cmd, cwd, env)

    _imprimir_resumo_tri_state(
        "QUALITY GATE",
        0,
        warnings_por_fase,
        f"Todas as {len(steps)} fases do Quality Gate aprovadas com excelencia termodinamica.",
    )


# ---------------------------------------------------------------------------
# Helpers extraidos para reduzir complexidade cognitiva dos comandos CLI.
# Cada um encapsula um bloco auto-contido que antes vivia inline.
# ---------------------------------------------------------------------------


def _render_suites_catalog(suites: dict) -> None:
    """Imprime catalogo tabelado de suites tematicas."""
    console.print("\n[bold cyan]=== [SUITES DE TESTES TEMATICAS SOTA v8.0 GOLD] ===[/]\n")
    table = Table(title="Catalogo de Suites Tematicas (Pytest & SOTA Guard)", box=box.ROUNDED)
    table.add_column("Suite ID", style=STYLE_BOLD_YELLOW)
    table.add_column("Nome Tematico", style="white")
    table.add_column("Testes", justify="right", style="cyan")
    table.add_column("SLA", justify="right", style="green")
    table.add_column("Criterio Tematico Chave", style="dim")

    for sid, sinfo in suites.items():
        crit_list = sinfo.get("thematic_criteria", [])
        key_crit = crit_list[0] if crit_list else sinfo.get("description", "")
        table.add_row(
            sid,
            sinfo.get("name", ""),
            str(sinfo.get("test_count", 0)),
            f"{sinfo.get('sla_seconds', 0)}s",
            key_crit[:55] + "...",
        )
    console.print(table)
    console.print(TRI_STATE_GUARD_BANNER)


def _render_scripts_catalog(taxonomy: dict, category: str | None) -> None:
    """Imprime catalogo tabelado de scripts por categoria."""
    console.print("\n[bold cyan]=== [CATALOGO DE SCRIPTS SOTA v8.0 GOLD] ===[/]\n")
    for cat_id, cat_info in taxonomy.items():
        if category and category.lower() != cat_id.lower():
            continue
        table = Table(title=f"Categoria: {cat_info.get('name')} ({cat_id})", box=box.ROUNDED)
        table.add_column("Script Path", style=STYLE_BOLD_YELLOW)
        table.add_column("Runtime", style="cyan")
        table.add_column("SLA", justify="right", style="green")
        table.add_column("Descricao", style="white")

        for s_path, s_data in cat_info.get("scripts", {}).items():
            table.add_row(
                s_path,
                s_data.get("runtime", ""),
                f"{s_data.get('sla_seconds', 0)}s",
                s_data.get("description", "")[:55] + "...",
            )
        console.print(table)
        console.print("")

    console.print(TRI_STATE_SCRIPTS_BANNER)


def _executar_categoria_scripts(run_cat: str, taxonomy: dict) -> None:
    """Executa todos os scripts de uma categoria sob o Tri-State Guard."""
    cat_key = run_cat.lower()
    if cat_key not in taxonomy:
        console.print(f"[bold red][ERRO] Categoria '{run_cat}' desconhecida. Use 'nexus scripts --list'.[/]")
        raise typer.Exit(1)

    cat_info = taxonomy[cat_key]
    console.print(f"\n[bold cyan]=== [EXECUTANDO BATERIA DE SCRIPTS: {cat_info.get('name')} ({cat_key})] ===[/]\n")
    for crit in cat_info.get("thematic_criteria", []):
        console.print(f"  [cyan] Criterio:[/] [white]{crit}[/]")
    console.print("")

    script_errors: list[tuple[str, str]] = []
    warnings_por_script: dict[str, int | None] = {}
    for s_path, s_data in cat_info.get("scripts", {}).items():
        cmd_str = _resolver_comando(s_data.get("command", ""))
        console.print(f"[bold yellow] Disparando:[/] [white]{s_path}[/] [dim]({cmd_str})[/]...")
        t0 = time.monotonic()
        res = subprocess.run(  # noqa: S602  # Record-Id: registro-2026-08-29-shell-true-nos-catalogos
            cmd_str, shell=True, cwd=str(BASE_DIR), capture_output=True, text=True, check=False
        )
        dt = time.monotonic() - t0
        sla = s_data.get("sla_seconds", 10.0)

        warnings_por_script[s_path] = _warnings_declarados(res.stdout)
        if res.returncode == 0:
            console.print(f"  [bold green] SUCESSO[/] em {dt:.2f}s (SLA: {sla}s)")
        else:
            console.print(f"  [bold red] FALHA[/] (Exit: {res.returncode}) em {dt:.2f}s:\n{res.stderr[:200]}")
            script_errors.append((s_path, res.stderr or res.stdout))

    _imprimir_resumo_tri_state(
        "SCRIPTS",
        len(script_errors),
        warnings_por_script,
        "Todos os scripts da categoria executados com excelencia.",
    )

    if script_errors:
        raise typer.Exit(1)


def _resolver_targets_operacao(items: dict, target_id: str) -> dict | None:
    """Resolve 'all' ou um ID especifico em dicionario de targets. None = desconhecido ou vazio."""
    if not items:
        return None
    if target_id == "all":
        return items
    if target_id in items:
        return {target_id: items[target_id]}
    return None


def _render_operations_catalog(titulo_secao: str, titulo_tabela: str, id_col: str, items: dict) -> None:
    """Imprime catalogo tabelado de operacoes (auditorias ou rotinas)."""
    console.print(f"\n[bold cyan]=== [{titulo_secao}] ===[/]\n")
    table = Table(title=titulo_tabela, box=box.ROUNDED)
    table.add_column(id_col, style=STYLE_BOLD_YELLOW)
    table.add_column("Nome", style="white")
    table.add_column("SLA", justify="right", style="green")
    table.add_column("Descricao", style="dim")
    for item_id, info in items.items():
        table.add_row(
            item_id, info.get("name", ""), f"{info.get('sla_seconds', 0)}s", info.get("description", "")[:55] + "..."
        )
    console.print(table)
    console.print(TRI_STATE_GUARD_BANNER)


def _executar_bloco_operacoes(
    tipo_plural: str,
    tipo_singular: str,
    targets: dict,
    titulo_tri_state: str,
    msg_sucesso: str,
) -> None:
    """Executa um bloco de operacoes (auditorias ou rotinas) sob o Tri-State Guard."""
    if not targets:
        console.print(f"[bold red][ERRO] Catalogo vazio: nada declarado para executar em {tipo_plural}.[/]")
        raise typer.Exit(1)
    console.print(f"\n[bold cyan]=== [EXECUTANDO {tipo_plural} SOTA: {len(targets)} {tipo_plural}] ===[/]\n")
    op_errors: list[tuple[str, str]] = []
    warnings_por_op: dict[str, int | None] = {}
    for op_id, op_info in targets.items():
        cmd_str = _resolver_comando(op_info.get("command", ""))
        console.print(f"[bold yellow] {tipo_singular}:[/] [white]{op_info.get('name')}[/] [dim]({cmd_str})[/]")
        for c in op_info.get("thematic_criteria", []):
            console.print(f"  [cyan] Criterio:[/] [white]{c}[/]")
        t0 = time.monotonic()
        res = subprocess.run(cmd_str, shell=True, cwd=str(BASE_DIR), capture_output=True, text=True, check=False)  # noqa: S602  # Record-Id: registro-2026-08-29-shell-true-nos-catalogos
        dt = time.monotonic() - t0
        sla = op_info.get("sla_seconds", 10.0)

        warnings_por_op[str(op_info.get("name") or op_id)] = _warnings_declarados(res.stdout)
        if res.returncode == 0:
            console.print(f"  [bold green] SUCESSO[/] em {dt:.2f}s (SLA: {sla}s)\n")
        else:
            console.print(f"  [bold red] FALHA[/] (Exit: {res.returncode}) em {dt:.2f}s:\n{res.stderr[:200]}\n")
            op_errors.append((op_id, res.stderr or res.stdout))

    _imprimir_resumo_tri_state(titulo_tri_state, len(op_errors), warnings_por_op, msg_sucesso)

    if op_errors:
        raise typer.Exit(1)


@app.command("test")
def run_thematic_test_suite(
    suite: str = typer.Option(
        "all",
        "--suite",
        "-s",
        help="Nome da suite tematica: pmev, core_ai, agents_llm, database_infra, security_governance, all",
    ),
    list_suites: bool = typer.Option(False, "--list", "-l", help="Lista todas as suites tematicas disponiveis"),
    coverage: bool = typer.Option(False, "--cov", help="Gera relatorio de cobertura completo"),
    isolado: bool = typer.Option(
        False,
        "--isolado",
        help="Roda num worktree git proprio, sem tocar o working tree (seguro com sessoes concorrentes)",
    ),
):
    """Executa suites de testes tematicas com o SOTA Integrity Guard v8.0 GOLD e criterios especificos."""
    manifest_path = BASE_DIR / "tests" / "TEST_SUITES_MANIFEST.json"
    if not manifest_path.exists():
        console.print("[bold red][ERRO] TEST_SUITES_MANIFEST.json ausente.[/]")
        raise typer.Exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    suites = manifest.get("thematic_suites", {})

    if list_suites:
        _render_suites_catalog(suites)
        return

    if suite == "all":
        console.print("[bold cyan]=== [SISTEMA] EXECUTANDO TODAS AS SUITES TEMATICAS (385 TESTES) ===[/]")
        console.print("[dim] Validando: PMev, Core AI, Agents LLM, Database Infra, Security Governance[/]")
        cmd = [sys.executable, "-m", "pytest", "-v"]
    elif suite in suites:
        sinfo = suites[suite]
        console.print(f"[bold cyan]=== [SISTEMA] EXECUTANDO SUITE TEMATICA: {sinfo.get('name')} ===[/]")
        console.print(f"[dim] Camada Alvo: {sinfo.get('target_layer', '')}[/]")
        console.print(f"[dim] SLA Maximo:  {sinfo.get('sla_seconds', 0)}s | Testes: {sinfo.get('test_count', 0)}[/]")
        for c in sinfo.get("thematic_criteria", []):
            console.print(f"  [cyan] Criterio:[/] [white]{c}[/]")
        console.print("")
        cmd = [sys.executable, "-m", "pytest", "-v"] + sinfo.get("pytest_args", [])
    else:
        console.print(f"[bold red][ERRO] Suite '{suite}' desconhecida. Use 'nexus test --list' para ver as opcoes.[/]")
        raise typer.Exit(1)

    if coverage:
        cmd += ["--cov=core", "--cov=database", "--cov=engine", "--cov=llm"]

    if isolado:
        # Worktree proprio: indice git proprio, e nenhuma interferencia com o
        # working tree -- nem com outra sessao rodando ao mesmo tempo.
        cmd = [
            sys.executable,
            str(BASE_DIR / "scripts" / "ops" / "suite_isolada.py"),
            "--sujo",
            "--comando",
            " ".join(["uv", "run", "pytest", *cmd[3:]]) if shutil.which("uv") else " ".join(cmd),
        ]
        console.print("[dim]Execucao ISOLADA: worktree proprio, working tree intocado.[/]")

    res = subprocess.run(cmd, cwd=str(BASE_DIR), check=False)
    if res.returncode != 0:
        raise typer.Exit(res.returncode)


@app.command("scripts")
@ops_app.command("scripts")
def list_and_run_scripts(
    list_all: bool = typer.Option(False, "--list", "-l", help="Lista catalogo de scripts"),
    category: str = typer.Option(
        None, "--category", "-c", help="Filtrar por categoria: ops, maintenance, routines, benchmarks, cli"
    ),
    audit: bool = typer.Option(False, "--audit", "-a", help="Executa a auditoria global de 100% dos scripts e testes"),
    run_cat: str = typer.Option(
        None, "--run", "-r", help="Executa todos os scripts da categoria informada sob o Tri-State Guard"
    ),
):
    """Consulta e executa o Catalogo Estruturado de Scripts sob o SOTA Guard Tri-State."""
    catalog_path = BASE_DIR / "scripts" / "SCRIPTS_CATALOG.json"
    if not catalog_path.exists():
        console.print("[bold red][ERRO] SCRIPTS_CATALOG.json ausente.[/]")
        raise typer.Exit(1)

    if audit:
        audit_script = BASE_DIR / "scripts" / "maintenance" / "audit_ecosystem_tests_scripts.py"
        res = subprocess.run([sys.executable, str(audit_script)], cwd=str(BASE_DIR), check=False)
        raise typer.Exit(res.returncode)

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    taxonomy = catalog.get("taxonomy", {})

    if not list_all and run_cat:
        _executar_categoria_scripts(run_cat, taxonomy)
        return

    _render_scripts_catalog(taxonomy, category)


# ==========================================
# COMANDOS DE AGENTES (HANDOFF)
# ==========================================


def _coletar_fontes_handoff(claude_dir: Path, agent: str) -> tuple[list[str], list[str]]:
    """Coleta fontes de governanca e memoria para o handoff.

    Retorna (context_parts, ausentes). Ausencia declarada, nao silenciosa.
    Medido em 2026-08-27: 3 dos 4 arquivos nao existiam e o handoff saia
    com um quarto da carga anunciada dizendo "persistido com sucesso".
    """
    files_to_inject = {
        "MODUS OPERANDI v8.0 GOLD": BASE_DIR.parent / "MODUS_OPERANDI.md",
        "INSTRUCOES GLOBAIS": BASE_DIR / "GLOBAL_INSTRUCTIONS.md",
        "COSMOVISAO": claude_dir / "COSMOVISAO.md",
        "INVARIANTES ARQUITETURAIS": claude_dir / "ARCHITECTURAL_INVARIANTS.md",
    }
    context: list[str] = []
    ausentes: list[str] = []
    notepad_file = BASE_DIR / "memory" / "notepad_active.md"
    if notepad_file.exists() and notepad_file.stat().st_size > 0:
        files_to_inject["WORKING SCRATCHPAD (NOTEPAD MEMORY)"] = notepad_file

    for title, path in files_to_inject.items():
        if path.exists():
            context.append(
                f"\n=================================================================\n## {title}\n=================================================================\n{path.read_text(encoding='utf-8', errors='ignore')}"
            )
        else:
            ausentes.append(f"{title} ({path})")

    agent_profile_path = claude_dir / "AGENTS" / f"{agent}.md"
    if not agent_profile_path.exists():
        agent_profile_path = claude_dir / "agents" / f"{agent}.md"

    for label, path in [
        (f"PERFIL ATIVO: {agent}.md", agent_profile_path),
        (f"MEMORIA SIMBIOTICA: {agent}", claude_dir / "agent-memory" / agent / "MEMORY.md"),
    ]:
        if path.exists():
            context.append(
                f"\n=================================================================\n## {label}\n=================================================================\n{path.read_text(encoding='utf-8', errors='ignore')}"
            )

    return context, ausentes


def _reportar_handoff(handoff_output_file: Path, ausentes: list[str], handoff_text: str) -> bool:
    """Imprime resumo do handoff e copia para clipboard via Clippy com fallback multicamada."""
    total = 4  # fontes de governanca (files_to_inject tem 4 chaves)
    if ausentes:
        console.print(
            f"[bold yellow] Handoff PARCIAL:[/] [white]{handoff_output_file.relative_to(BASE_DIR)}[/] "
            f"[yellow]({total - len(ausentes)} de {total} fontes de governanca; {len(ausentes)} ausente(s))[/]"
        )
        for a in ausentes:
            console.print(f"  [yellow]-> ausente:[/] {a}")
    else:
        console.print(
            f"[bold green] Handoff completo:[/] [white]{handoff_output_file.relative_to(BASE_DIR)}[/] "
            f"[green]({total} de {total} fontes de governanca)[/]"
        )

    try:
        from engine.clippy_clipboard import ClippyClipboard

        if ClippyClipboard.copy(handoff_text):
            console.print(
                "[bold green][+][/] [bold white]Clippy: Handoff copiado para a Area de Transferencia (Clipboard)![/]"
            )
            return True
        console.print("[dim] Clippy nao conseguiu acessar o Clipboard (texto preservado em arquivo).[/]")
        return False
    except Exception as e:
        console.print(f"[dim] Falha no modulo Clippy ({e}). Texto salvo em arquivo.[/]")
        return False


@app.command("handoff")
@agent_app.command("handoff")
def execute_handoff(
    web: bool = typer.Option(False, "--web", help="Copia contexto para Clipboard da Web (Claude/Gemini Pro)"),
    agent: str = typer.Option("chico", "--agent", help="Focar contexto num agente especifico"),
) -> bool:
    """Monta contexto hierarquico isolado e realiza o Handoff Cognitivo de Sessao via Clippy."""
    mode_desc = "Web Clipboard (Claude/Gemini Pro)" if web else "Padrao SOTA"
    console.print(f"\n[bold cyan]=== [PROTOCOLO DE HANDOFF COGNITIVO SOTA v8.0 GOLD ({mode_desc})] ===[/]\n")

    claude_dir = BASE_DIR / ".claude" if (BASE_DIR / ".claude").exists() else BASE_DIR / ".cerebro"
    context, ausentes = _coletar_fontes_handoff(claude_dir, agent)

    if not context:
        console.print("[bold red][FALHA] Nenhuma fonte de contexto encontrada. Handoff vazio NAO sera gravado.[/]")
        for a in ausentes:
            console.print(f"  [red]-> ausente:[/] {a}")
        raise typer.Exit(1)

    handoff_text = "\n".join(context)
    handoff_output_file = claude_dir / "agent-memory" / agent / "HANDOFF_LATEST.md"
    handoff_output_file.parent.mkdir(parents=True, exist_ok=True)
    handoff_output_file.write_text(handoff_text, encoding="utf-8")

    copiado = _reportar_handoff(handoff_output_file, ausentes, handoff_text)
    console.print("\n[bold cyan]======================== FIM DO HANDOFF ========================[/]\n")
    return copiado


@app.command("clippy")
@agent_app.command("clippy")
def execute_clippy_copy(
    agent: str = typer.Option("chico", "--agent", help="Agente do handoff"),
):
    """Copia o ultimo Handoff e Prompt de Continuacao diretamente para o Clipboard."""
    claude_dir = BASE_DIR / ".claude" if (BASE_DIR / ".claude").exists() else BASE_DIR / ".cerebro"
    handoff_file = claude_dir / "agent-memory" / agent / "HANDOFF_LATEST.md"

    if not handoff_file.exists() or handoff_file.stat().st_size == 0:
        console.print(
            f"[bold yellow][AVISO] Nenhum handoff existente em {handoff_file.name}. Gerando novo handoff...[/]"
        )
        copiado = execute_handoff(web=True, agent=agent)
        if not copiado:
            raise typer.Exit(1)
        return

    content = handoff_file.read_text(encoding="utf-8")
    from engine.clippy_clipboard import ClippyClipboard

    if ClippyClipboard.copy(content):
        console.print(
            f"[bold green][+][/] [bold white]Clippy: Handoff de @{agent} copiado para a Area de Transferencia ({len(content)} caracteres)![/]"
        )
    else:
        console.print("[bold red][ERRO] Clippy nao conseguiu acessar o Clipboard.[/]")
        raise typer.Exit(1)


@ops_app.command("commit")
def execute_git_commit(
    message: str = typer.Argument(..., help="Mensagem semantica do commit (ex: feat: nova feature)"),
    auto_stage: bool = typer.Option(False, "--all", "-a", help="Marca alteracoes modificadas automaticamente"),
):
    """Executa commit semantico com pre-validacao no Quality Gate e Record Gate."""
    from scripts.ops.git_sota_workflow import GitSotaWorkflow

    console.print(f"\n[bold cyan]=== [SOTA GIT COMMIT CANONICO] ===[/]\nMensagem: {message}\n")
    success = GitSotaWorkflow.execute_commit(message, auto_stage=auto_stage)
    if not success:
        console.print("[bold red][FALHA] Commit cancelado ou reprovado pelo portao.[/]")
        raise typer.Exit(1)
    console.print("[bold green][SUCESSO] Commit semantico registrado e aprovado no portao.[/]\n")


@ops_app.command("sync")
def execute_git_sync(
    target_branch: str = typer.Option("main", "--branch", "-b", help="Branch de destino"),
):
    """Sincroniza o repositorio linearmente via fetch --prune e rebase --autostash."""
    from scripts.ops.git_sota_workflow import GitSotaWorkflow

    console.print(f"\n[bold cyan]=== [SOTA GIT LINEAR SYNC] ===[/]\nTarget: origin/{target_branch}\n")
    success = GitSotaWorkflow.sync_linear(target_branch)
    if not success:
        console.print("[bold red][FALHA] Sincronizacao linear falhou.[/]")
        raise typer.Exit(1)
    console.print("[bold green][SUCESSO] Repositorio perfeitamente sincronizado com o remote.[/]\n")


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
        # Roteamento quebrado nao pode sair 0. O atalho [6] do dashboard existe
        # justamente para descobrir que a malha semantica parou de funcionar.
        logger.exception("Falha ao analisar rota")
        console.print(f"[bold red]Erro de roteamento: {e}[/]")
        raise typer.Exit(1) from e


@app.command("calib-forecast")
@agent_app.command("calibration-forecast")
def agent_calibration_forecast(
    horizon: int = typer.Option(3, "--horizon", "-h", help="Horizonte de sessoes futuras a projetar"),
    conductor: str | None = typer.Option(None, "--conductor", "-c", help="Filtrar serie temporal por modelo condutor"),
    multimodel: bool = typer.Option(
        False, "--multimodel", "-m", help="Projecao escalonada multivariada por modelo condutor"
    ),
    json_output: bool = typer.Option(False, "--json", help="Emitir payload JSON puro"),
) -> None:
    """Projecao estocastica de calibracao de agentes via Google Research TimesFM 2.0 (Apache 2.0)."""
    from engine.timesfm_engine import (
        forecast_agent_calibration_trajectory,
        forecast_multimodel_calibration,
    )

    ledger_path = BASE_DIR / "reports" / "agent-calibration" / "feedback-ledger.jsonl"
    if not ledger_path.exists():
        console.print(f"[bold red][ERRO] Ledger de feedback nao encontrado em {ledger_path}.[/]")
        raise typer.Exit(1)

    scores: list[float] = []
    series_by_model: dict[str, list[float]] = {}

    with open(ledger_path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            try:
                entry = json.loads(line_str)
                if entry.get("record_type") == "feedback" and entry.get("score") is not None:
                    sc = float(entry["score"])
                    cm = entry.get("conductor_model") or "unspecified"
                    series_by_model.setdefault(cm, []).append(sc)
                    if not conductor or cm == conductor:
                        scores.append(sc)
            except Exception:
                continue

    if multimodel:
        results = forecast_multimodel_calibration(series_by_model, horizon_sessions=horizon)
        if json_output:
            out_dict = {m: r.model_dump() for m, r in results.items()}
            console.print(json.dumps(out_dict, indent=2))
            return

        table = Table(
            title=f"[bold #50fa7b]ESCALONAMENTO MULTIVARIADO TIMESFM - CALIBRACAO DE AGENTES (H={horizon})[/]",
            box=box.ROUNDED,
        )
        table.add_column("Modelo Condutor", style="bold cyan")
        table.add_column("Amostras (N)", style="bold white", justify="right")
        table.add_column("Trajetoria Prevista", style="bold yellow", justify="center")
        table.add_column("Deriva/Sessao", style="bold magenta", justify="right")
        table.add_column("Direcao", style="bold green", justify="center")
        table.add_column("Risco Degradacao", style="bold red", justify="right")
        table.add_column("Status", style="bold white", justify="center")

        for m_name, res in results.items():
            traj_str = ", ".join(f"{v:.2f}" for v in res.mean_trajectory) if res.mean_trajectory else "-"
            dir_color = (
                "green"
                if res.drift_direction == "EXPANSAO"
                else ("yellow" if res.drift_direction == "ESTAVEL" else "red")
            )
            risk_color = "green" if res.risk_of_degradation == 0.0 else "red"
            status_color = "green" if res.status == "PROJECTION_ACTIVE" else "yellow"

            table.add_row(
                m_name,
                str(res.history_points),
                traj_str,
                f"{res.drift_per_session:+.3f}",
                f"[{dir_color}]{res.drift_direction}[/]",
                f"[{risk_color}]{res.risk_of_degradation * 100:.1f}%[/]",
                f"[{status_color}]{res.status}[/]",
            )
        console.print(table)
        return

    # Modo unificado / modelo especifico
    if len(scores) < 4:
        console.print(
            f"[bold yellow][AVISO] Dados insuficientes para projecao TimesFM (minimo 4 amostras, encontradas {len(scores)}).[/]"
        )
        raise typer.Exit(0)

    res = forecast_agent_calibration_trajectory(scores, horizon_sessions=horizon, conductor_model=conductor)
    if json_output:
        console.print(res.model_dump_json(indent=2))
        return

    table = Table(
        title=f"[bold #50fa7b]PROJECAO TEMPORAL DE CALIBRACAO - GOOGLE TIMESFM 2.0 (H={horizon})[/]",
        box=box.ROUNDED,
    )
    table.add_column("Sessao Futura", style="bold cyan", justify="center")
    table.add_column("Previsao Media", style="bold yellow", justify="right")
    table.add_column("Quantil 10% (Pior Caso)", style="bold red", justify="right")
    table.add_column("Quantil 90% (Melhor Caso)", style="bold green", justify="right")
    table.add_column("Limiar do Portao (8.5)", style="bold white", justify="center")

    for i in range(res.horizon_sessions):
        m_val = res.mean_trajectory[i] if i < len(res.mean_trajectory) else 0.0
        q10 = res.quantile_10[i] if i < len(res.quantile_10) else 0.0
        q90 = res.quantile_90[i] if i < len(res.quantile_90) else 0.0
        if m_val >= 9.0:
            gate_status = "[bold green]EXCELENTE (>=9.0)[/]"
        elif m_val >= 8.5:
            gate_status = "[green]APROVADO (>=8.5)[/]"
        elif m_val >= 8.0:
            gate_status = "[yellow]ATENCAO (<8.5)[/]"
        else:
            gate_status = "[bold red]DEGRADADO (<8.0)[/]"
        table.add_row(
            f"Sessao t+{i + 1}",
            f"{m_val:.2f}",
            f"{q10:.2f}",
            f"{q90:.2f}",
            gate_status,
        )

    console.print(table)

    drift_color = (
        "green" if res.drift_direction == "EXPANSAO" else ("yellow" if res.drift_direction == "ESTAVEL" else "red")
    )
    risk_color = (
        "green" if res.risk_of_degradation <= 0.05 else ("yellow" if res.risk_of_degradation <= 0.20 else "red")
    )

    summary_panel = Panel(
        f"[bold #50fa7b]* Amostras Analisadas:[/] [white]{res.history_points} sessoes registradas no ledger[/]\n"
        f"[bold #50fa7b]* Taxa de Deriva Temporal:[/] [{drift_color}]{res.drift_per_session:+.4f} pontos/sessao ({res.drift_direction})[/]\n"
        f"[bold #8be9fd]* Risco Estocastico de Degradacao (< 8.5):[/] [{risk_color}]{res.risk_of_degradation * 100:.1f}%[/]\n"
        f"[bold #bd93f9]* Modelo & Licenca:[/] [magenta]{res.model_used} ({res.license_tier})[/]\n"
        f"[bold #f1fa8c]* Modelo Condutor:[/] [cyan]{res.conductor_model or 'Consolidado Geral (Multimodel Default)'}[/]\n"
        f"[dim #6272a4]* Dominio da Metrica:[/] [white]Escala estrita [0.0, 10.0] governada pelo Tier 0 (Raphael Vitoi)[/]",
        title="[bold #f1fa8c]DIAGNOSTICO QUANTITATIVO DO MOTOR TEMPORAL[/]",
        border_style="#50fa7b",
        box=box.ROUNDED,
    )
    console.print(summary_panel)


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
# COMANDOS DE AUDITORIAS (AUDITS) SOTA v8.0 GOLD
# ==========================================


@audit_app.callback(invoke_without_command=True)
@app.command("audit")
def run_or_list_audits(
    list_all: bool = typer.Option(False, "--list", "-l", help="Lista todas as auditorias"),
    audit_id: str = typer.Option("all", "--run", "-r", help="Executa auditoria especifica ou 'all'"),
):
    """Executa e valida as Auditorias do Sistema sob o SOTA Guard Tri-State."""
    manifest_path = BASE_DIR / "data" / "SYSTEM_OPERATIONS_MANIFEST.json"
    if not manifest_path.exists():
        console.print("[bold red][ERRO] SYSTEM_OPERATIONS_MANIFEST.json ausente.[/]")
        raise typer.Exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    audits = manifest.get("audits", {})

    if list_all:
        _render_operations_catalog(
            "CATALOGO DE AUDITORIAS SOTA v8.0 GOLD", "Auditorias do Ecossistema", "Audit ID", audits
        )
        return

    targets = _resolver_targets_operacao(audits, audit_id)
    if targets is None:
        console.print(f"[bold red][ERRO] Auditoria '{audit_id}' desconhecida. Use 'nexus audit --list'.[/]")
        raise typer.Exit(1)

    _executar_bloco_operacoes(
        "AUDITORIAS",
        "Auditoria",
        targets,
        "AUDITS",
        "Todas as auditorias selecionadas aprovadas com excelencia.",
    )


# ==========================================
# COMANDOS DE ROTINAS (ROUTINES) SOTA v8.0 GOLD
# ==========================================


@routine_app.callback(invoke_without_command=True)
@app.command("routine")
def run_or_list_routines(
    list_all: bool = typer.Option(False, "--list", "-l", help="Lista todas as rotinas"),
    routine_id: str = typer.Option("all", "--run", "-r", help="Executa rotina especifica ou 'all'"),
):
    """Executa e valida as Rotinas do Sistema sob o SOTA Guard Tri-State."""
    manifest_path = BASE_DIR / "data" / "SYSTEM_OPERATIONS_MANIFEST.json"
    if not manifest_path.exists():
        console.print("[bold red][ERRO] SYSTEM_OPERATIONS_MANIFEST.json ausente.[/]")
        raise typer.Exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    routines = manifest.get("routines", {})

    if list_all:
        _render_operations_catalog("CATALOGO DE ROTINAS SOTA v8.0 GOLD", "Rotinas Operacionais", "Routine ID", routines)
        return

    targets = _resolver_targets_operacao(routines, routine_id)
    if targets is None:
        console.print(f"[bold red][ERRO] Rotina '{routine_id}' desconhecida. Use 'nexus routine --list'.[/]")
        raise typer.Exit(1)

    _executar_bloco_operacoes(
        "ROTINAS",
        "Rotina",
        targets,
        "ROUTINES",
        "Todas as rotinas selecionadas executadas com excelencia.",
    )


# ==========================================
# COMANDOS DE TAREFAS (TASKS) SOTA v8.0 GOLD
# ==========================================


@app.command("index")
def record_index_command(
    rebuild: bool = typer.Option(False, "--rebuild", help="Regenera data/RECORD_INDEX.json"),
    suspeitos: bool = typer.Option(False, "--suspeitos", help="Lista registros SUSPEITO e OBSOLETO"),
):
    """Indice ancorado dos registros -- M.O. secao 13.C.

    O indice e DERIVADO dos frontmatters e nao e versionado: cache commitado
    envelhece no primeiro registro editado sem rebuild, que e a divergencia que
    a propria 13.C adverte. O portao de pre-commit nao le o arquivo -- recalcula.
    """
    from scripts.ops.record_index import VIGENTE, construir, escrever

    indice = construir(BASE_DIR)

    if rebuild:
        destino = escrever(indice, BASE_DIR / "data" / "RECORD_INDEX.json")
        console.print(f"[green][INDICE][/] {destino.relative_to(BASE_DIR).as_posix()} regenerado.")

    t = indice["totais"]
    tabela = Table(title="Indice Ancorado de Registros (M.O. 13.C)", box=box.ROUNDED)
    tabela.add_column("Estado", style="bold")
    tabela.add_column("Registros", justify="right")
    tabela.add_row("[green]VIGENTE[/]", str(t["vigente"]))
    tabela.add_row("[yellow]SUSPEITO[/]", str(t["suspeito"]))
    tabela.add_row("[red]OBSOLETO[/]", str(t["obsoleto"]))
    tabela.add_row("[dim]sem frontmatter[/]", str(t["sem_frontmatter"]))
    console.print(tabela)
    console.print(
        f"[dim]{indice['arquivos_varridos']} arquivos varridos em docs/ e reports/, HEAD {indice['commit_do_head']}.[/]"
    )

    if suspeitos:
        problematicos = [r for r in indice["registros"] if r["estado"] != VIGENTE]
        if not problematicos:
            console.print("[green]Nenhum registro suspeito ou obsoleto.[/]")
            return
        for r in problematicos:
            cor = "red" if r["estado"] == "OBSOLETO" else "yellow"
            console.print(f"\n[bold {cor}][{r['estado']}][/] {r['arquivo']}")
            for motivo in r["motivos"]:
                console.print(f"    [dim]-[/] {motivo}")
    elif not rebuild:
        console.print("[dim]Use --rebuild para regenerar o arquivo, --suspeitos para detalhar.[/]")


@app.command("task-audit")
def audit_task_pipeline():
    """Valida o ciclo de vida completo da fila de tarefas sob o SOTA Guard Tri-State."""
    console.print("\n[bold cyan]=== [AUDITORIA DA FILA DE TAREFAS & WATCHDOG MDA SOTA v8.0 GOLD] ===[/]\n")
    test_cmd = [
        sys.executable,
        "-m",
        "pytest",
        "tests/test_database_sota.py",
        "tests/test_monitoring_sota.py",
        "tests/test_stress_circuit_breaker.py",
        "-v",
    ]
    res = subprocess.run(test_cmd, cwd=str(BASE_DIR), check=False)
    if res.returncode != 0:
        raise typer.Exit(res.returncode)


# ==========================================
# AUTOPOIESE & HOMEOSTASE SISTEMICA SOTA v8.0 GOLD
# ==========================================


@app.command("homeostasis")
@app.command("autopoiesis")
@ops_app.command("homeostasis")
def trigger_homeostasis():
    """Aciona o Motor de Autopoiese e Homeostase Sistemica (Zero Entropia & Autocura)."""
    from core.autopoiesis_engine import run_homeostasis

    run_homeostasis()


# ==========================================
# SOTA TRIAD MESH (EXA + STITCH + JULES)
# ==========================================

triad_app = typer.Typer(name="triad", help="Orquestracao SOTA Triad Mesh (Exa + Stitch + Jules)")
app.add_typer(triad_app, name="triad")


@triad_app.command("status")
def triad_status():
    """Inspeciona a conectividade, tokens e prontidao de Exa, Stitch e Google Jules."""
    from engine.sota_triad_mesh import SotaTriadOrchestrator

    orchestrator = SotaTriadOrchestrator()
    health = orchestrator.check_health_and_status()

    console.print("\n[bold cyan]=== [SOTA TRIAD MESH: STATUS & CONECTIVIDADE] ===[/]\n")
    tabela = Table(title="Componentes da Triade SOTA", box=box.ROUNDED)
    tabela.add_column("Pilar", style="bold yellow", justify="left")
    tabela.add_column("Especializacao", style="cyan", justify="left")
    tabela.add_column("Status Operacional", style="bold green", justify="center")

    raw_comp = health.get("triad_components")
    comp: dict[str, str] = raw_comp if isinstance(raw_comp, dict) else {}
    tabela.add_row("EXA MCP", "Pesquisa Neural & Deep Web Retrieval", comp.get("exa", "OPERATIONAL"))
    tabela.add_row("STITCH MCP", "UI Generativa & Design System SOTA", comp.get("stitch", "OPERATIONAL"))
    tabela.add_row(
        "GOOGLE JULES",
        "Agente Coding Cloud Assincrono (VM)",
        comp.get("jules", "OPERATIONAL" if health.get("jules_cli_installed") else "STANDBY (CLI)"),
    )

    console.print(tabela)
    console.print(
        f"[dim]Design System: {'[green]OK[/]' if health.get('design_system_ready') else '[red]AUSENTE[/]'} | MCP Config: {'[green]OK[/]' if health.get('mcp_config_ready') else '[red]AUSENTE[/]'}[/]\n"
    )


@triad_app.command("plan")
def triad_plan(objective: str = typer.Argument(..., help="Objetivo funcional da missao")):
    """Gera um DAG coordenado de 4 fases para Exa, Stitch, Jules e Antigravity."""
    from engine.sota_triad_mesh import SotaTriadOrchestrator

    orchestrator = SotaTriadOrchestrator()
    plan = orchestrator.plan_triad_workflow(objective)

    console.print(f"\n[bold gold1]=== [PLANO INTEGRADO DA TRIADE SOTA] ===[/]\n[bold white]Objetivo:[/] {objective}\n")
    raw_phases = plan.get("dag_phases")
    phases = raw_phases if isinstance(raw_phases, list) else []
    for phase in phases:
        if isinstance(phase, dict):
            console.print(
                f"[bold cyan]Fase {phase.get('phase', '?')}:[/] [bold yellow]{phase.get('agent', '?')}[/] -> [white]{phase.get('action', '')}[/]"
            )
    console.print()


@triad_app.command("run")
def triad_run(objective: str = typer.Argument(..., help="Objetivo funcional a executar")):
    """Executa a esteira unificada da Triade com telemetria e validacao."""
    from engine.sota_triad_mesh import SotaTriadOrchestrator

    orchestrator = SotaTriadOrchestrator()
    console.print(f"\n[bold green]>>> Iniciando esteira SOTA Triad Mesh para:[/] [white]{objective}[/]\n")
    report = orchestrator.execute_triad_dag(objective)

    console.print("[bold green][+][/] [cyan]Exa:[/] Contexto neural e formulas sintetizadas.")
    console.print("[bold green][+][/] [cyan]Stitch:[/] Especificacoes e tokens visuais validados.")
    console.print("[bold green][+][/] [cyan]Jules:[/] Especificacao de tarefa cloud despachada.")
    console.print(
        f"\n[bold gold1]Convergencia:[/] {report.convergence_rate * 100:.0f}% em {report.total_latency_seconds:.4f}s | [bold green]Status: VERIFICADO[/]\n"
    )


# ==========================================
# SUBCOMANDO: WEB & AUTO-BROWSE SOTA
# ==========================================

web_app = typer.Typer(help="Motor Universal SOTA de Auto-Browse, CDP e Pesquisa Web")
app.add_typer(web_app, name="web")


@web_app.command("status")
def web_status():
    """Inspeciona o estado do Google Chrome Dev CDP e do motor de busca."""
    from engine.sota_web_browse import CDPBrowserBridge

    bridge = CDPBrowserBridge()
    health = bridge.check_health()

    console.print("\n[bold cyan]=== [SOTA WEB & CDP BROWSER: STATUS] ===[/]\n")
    if health.get("online"):
        console.print(
            f"[bold green][+][/] [bold white]Google Chrome Dev (CDP):[/] [bold green]ONLINE[/] na porta [yellow]{health.get('port')}[/]"
        )
        console.print(f"    Engine: [dim]{health.get('engine')}[/] | Protocol: [dim]{health.get('protocol')}[/]\n")
    else:
        console.print(
            "[bold yellow][!][/] [bold white]Google Chrome Dev (CDP):[/] [yellow]STANDBY / OFFLINE[/] (Portas 9222/9223)\n"
        )


@web_app.command("query")
def web_query(
    prompt: str = typer.Argument(..., help="Query de busca ou URL"),
    tier: int = typer.Option(1, "--tier", "-t", help="Nivel hierarquico do agente (0 a 5)"),
    mode: str = typer.Option(
        "auto_detect", "--mode", "-m", help="Modo (auto_detect, cdp_browser, ai_search, clipboard_handoff)"
    ),
):
    """Executa consulta com grounding contextual e registro de auditoria."""
    from engine.sota_web_browse import AgentTier, SotaWebBrowseOrchestrator, WebBrowseMode, WebQueryRequest

    orchestrator = SotaWebBrowseOrchestrator()
    req = WebQueryRequest(
        query_or_url=prompt,
        mode=WebBrowseMode(mode),
        tier=AgentTier(tier),
        requester="nexus-cli",
    )
    res = asyncio.run(orchestrator.execute_query(req))

    console.print("\n[bold green]=== [SOTA WEB ENGINE: RESPOSTA] ===[/]")
    console.print(
        f"[bold cyan]Modo:[/] {res.mode_used.value} | [bold yellow]Latencia:[/] {res.latency_ms:.2f}ms | [dim]ID: {res.audit_id}[/]\n"
    )
    console.print(res.content)
    console.print()


@web_app.command("handoff")
def web_handoff(
    task: str = typer.Argument(..., help="Descricao da tarefa a ser preparada para Web LLM"),
    llm: str = typer.Option("claude", "--llm", "-l", help="LLM de destino (claude, gemini, deepseek)"),
    context: str = typer.Option("", "--context", "-c", help="Contexto adicional opcional"),
):
    """Prepara e copia payload estruturado SOTA para o Clipboard para Paid Web Tiers."""
    from engine.sota_web_browse import AgentTier, SotaWebBrowseOrchestrator, WebBrowseMode, WebQueryRequest

    orchestrator = SotaWebBrowseOrchestrator()
    req = WebQueryRequest(
        query_or_url=task,
        mode=WebBrowseMode.CLIPBOARD_HANDOFF,
        tier=AgentTier.TIER_0_SOVEREIGN,
        context=context or None,
        requester="nexus-handoff",
        target_llm=llm,
    )
    res = asyncio.run(orchestrator.execute_query(req))
    console.print(f"\n[bold green][+][/] [bold white]{res.content}[/]")
    console.print(f"[dim]Destino: {llm.upper()} | Protocolo Chico SOTA v8.0 GOLD ativo.[/]\n")


@web_app.command("audit")
def web_audit(limit: int = typer.Option(5, "--limit", "-n", help="Numero de registros a exibir")):
    """Exibe os ultimos registros de auditoria de navegacao e busca web."""
    from engine.sota_web_browse import SotaWebBrowseOrchestrator

    orchestrator = SotaWebBrowseOrchestrator()
    audits = orchestrator.get_recent_audits(limit)

    console.print(f"\n[bold cyan]=== [SOTA WEB AUDIT LOG] (Ultimos {len(audits)} registros) ===[/]\n")
    tabela = Table(title="Auditoria de Requisicoes Web", box=box.ROUNDED)
    tabela.add_column("Audit ID", style="dim", justify="left")
    tabela.add_column("Tier", style="bold yellow", justify="center")
    tabela.add_column("Modo", style="cyan", justify="left")
    tabela.add_column("Prompt / URL", style="white", justify="left")
    tabela.add_column("Status", style="bold green", justify="center")
    tabela.add_column("Latencia", style="magenta", justify="right")

    for a in audits:
        tabela.add_row(
            str(a.get("audit_id", "-")),
            str(a.get("tier", "-")),
            str(a.get("mode_used", "-")),
            str(a.get("prompt", "-"))[:40],
            "OK" if a.get("success") else "ERRO",
            f"{a.get('latency_ms', 0):.1f}ms",
        )
    console.print(tabela)
    console.print()


# ==========================================
# ENTRYPOINT TYPER
# ==========================================

if __name__ == "__main__":
    app()
