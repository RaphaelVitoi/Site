import os
import sys
import time
import shutil
import re
import json
import subprocess
import collections
from pathlib import Path

try:
    from google import genai
    from google.genai import types
    from pydantic import BaseModel
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.layout import Layout
    from rich.live import Live
    import psutil
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    print("[ERRO CRITICO] Dependencias SOTA ausentes.")
    print("Execute no terminal: pip install google-genai pydantic rich psutil watchdog")
    sys.exit(1)

console = Console()
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROUTINES_DIR = BASE_DIR / "scripts" / "routines"
CORE_DIR = BASE_DIR / "scripts" / "core"

# --- Funcoes Core Internalizadas (SOTA) ---

def _get_python_exe():
    """Determina o executavel Python correto, priorizando o venv."""
    venv_python = BASE_DIR / ".venv" / "Scripts" / "python.exe"
    return str(venv_python) if venv_python.exists() else "python"

def start_worker():
    """Acorda o Orquestrador Python em background de forma idempotente."""
    python_exe = _get_python_exe()
    worker_script = BASE_DIR / "task_executor.py"

    for proc in psutil.process_iter(['pid', 'cmdline']):
        if proc.info['cmdline'] and 'task_executor.py' in ' '.join(proc.info['cmdline']) and 'worker-api' in ' '.join(proc.info['cmdline']):
            console.print(f"[green][SISTEMA] O Orquestrador ja esta ativo (PID: {proc.pid}). Nenhuma acao necessaria.[/]")
            return

    console.print("[cyan][SISTEMA] Acordando o Orquestrador Python (SOTA)...[/]")
    if os.name == 'nt':
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        si.wShowWindow = 6  # SW_MINIMIZE
        creationflags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
        subprocess.Popen([python_exe, str(worker_script), 'worker-api'], creationflags=creationflags, startupinfo=si, close_fds=True)
    else:
        subprocess.Popen([python_exe, str(worker_script), 'worker-api'], start_new_session=True)
    console.print("[green][SISTEMA] Orquestrador ativado em background. O sistema esta vivo.[/]")

def stop_worker():
    """Hiberna o Orquestrador Python com seguranca."""
    console.print("[cyan][SISTEMA] Tentando hibernar o Orquestrador Python...[/]")
    worker_found = False
    for proc in psutil.process_iter(['pid', 'cmdline']):
        try:
            if proc.info['cmdline'] and 'task_executor.py' in ' '.join(proc.info['cmdline']) and 'worker-api' in ' '.join(proc.info['cmdline']):
                p = psutil.Process(proc.pid)
                p.terminate()
                p.wait(timeout=3)
                console.print(f"[green][SISTEMA] Orquestrador (PID: {proc.pid}) hibernado com sucesso.[/]")
                worker_found = True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            continue
    if not worker_found:
        console.print("[grey50][SISTEMA] O Orquestrador ja estava em hibernacao. Nenhuma acao necessaria.[/]")

def set_autonomy(mode: str):
    """Configura o modo de autonomia do sistema."""
    autonomy_file = BASE_DIR / ".claude" / "autonomy.json"
    config = {"mode": mode}
    with open(autonomy_file, "w", encoding="utf-8") as f:
        json.dump(config, f)
    
    mode_colors = {"full": "green", "partial": "yellow", "off": "red"}
    console.print(f"[[{mode_colors.get(mode, 'white')}]] [AUTONOMIA] Sistema configurado para Autonomia {mode.upper()}.[/]")

def run_sanitizer(dry_run=True):
    """Expurgo Deterministico de Entropia Morta."""
    console.print(Panel("[bold cyan]NEXUS SANITIZER (SOTA)[/]\n[white]Expurgo Sistemico de Entropia Morta[/]", border_style="cyan"))
    
    # Alvos Deterministicos
    targets = [
        BASE_DIR / ".backups_sota",
        BASE_DIR / "frontend" / ".next" / "cache",
    ]
    
    # Coleta de caches Python e arquivos de backup perdidos
    for p in BASE_DIR.rglob("__pycache__"):
        targets.append(p)
    for p in BASE_DIR.rglob("*.bak"):
        targets.append(p)
        
    removed_count = 0
    saved_space = 0

    table = Table(expand=True, border_style="magenta")
    table.add_column("ALVO", style="yellow")
    table.add_column("TAMANHO", justify="right", style="cyan")
    table.add_column("STATUS", justify="center")

    for path in targets:
        if path.exists():
            try:
                size = sum(f.stat().st_size for f in path.glob('**/*') if f.is_file()) if path.is_dir() else path.stat().st_size
                size_mb = size / (1024 * 1024)
                
                if dry_run:
                    table.add_row(str(path.relative_to(BASE_DIR)), f"{size_mb:.2f} MB", "[yellow]SIMULADO[/]")
                else:
                    if path.is_file():
                        path.unlink()
                    elif path.is_dir():
                        shutil.rmtree(path)
                    table.add_row(str(path.relative_to(BASE_DIR)), f"{size_mb:.2f} MB", "[red]VAPORIZADO[/]")
                    removed_count += 1
                    saved_space += size
            except Exception as e:
                table.add_row(str(path.relative_to(BASE_DIR)), "N/A", f"[red]ERRO: {str(e)[:15]}[/]")

    console.print(table)

    if not dry_run:
        console.print(f"\n[bold green][+] Saneamento Concluido SOTA.[/] {removed_count} alvos eliminados.")
        console.print(f"[bold cyan]Espaco e I/O recuperados:[/] {saved_space / (1024 * 1024):.2f} MB.")
    else:
        console.print("\n[yellow][!] MODO SIMULACAO ATIVO. Nenhum arquivo foi modificado.[/]")
        choice = console.input("[bold white]Deseja executar a purga real? (s/n): [/]")
        if choice.lower() == 's':
            os.system('cls' if os.name == 'nt' else 'clear')
            run_sanitizer(dry_run=False)
        else:
            console.print("[cyan]Operacao abortada. Mantendo simetria atual.[/]")

def show_status():
    """Exibe um painel de telemetria completo do sistema."""
    
    # 1. Worker Status
    worker_status = "[red]HIBERNANDO[/]"
    for proc in psutil.process_iter(['pid', 'cmdline']):
        if proc.info['cmdline'] and 'task_executor.py' in ' '.join(proc.info['cmdline']) and 'worker-api' in ' '.join(proc.info['cmdline']):
            worker_status = f"[green]ATIVO (PID: {proc.pid})[/]"
            break

    # 2. Autonomy Status
    autonomy_file = BASE_DIR / ".claude" / "autonomy.json"
    autonomy_mode = "off"
    if autonomy_file.exists():
        try:
            with open(autonomy_file, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                autonomy_mode = data.get("mode", "off")
        except Exception:
            pass
    
    autonomy_display = {
        "full": "[green]TOTAL[/]",
        "partial": "[yellow]PARCIAL[/]",
        "off": "[red]DESATIVADA[/]"
    }.get(autonomy_mode, "[red]DESCONHECIDA[/]")

    # 3. Task Counts & API Budget from task_executor
    python_exe = _get_python_exe()
    executor_script = str(BASE_DIR / "task_executor.py")
    
    task_counts = {"pending": 0, "running": 0}
    api_budget = {"used": "N/A", "total": "N/A"}

    try:
        counts_json = subprocess.check_output([python_exe, executor_script, "db-get", "counts"], text=True, encoding='utf-8')
        task_counts = json.loads(counts_json)
    except Exception:
        pass # Silencioso se o worker estiver offline

    try:
        budget_json = subprocess.check_output([python_exe, executor_script, "db-get", "budget"], text=True, encoding='utf-8')
        api_budget_data = json.loads(budget_json)
        api_budget = {"used": api_budget_data.get('used', 0), "total": api_budget_data.get('total', 0)}
    except Exception:
        pass # Silencioso se o worker estiver offline

    # Build Rich Panel
    header = Panel("[bold cyan]NEXUS HUB[/] | [magenta]Telemetria de Sistema em Tempo Real[/]", style="white on black", border_style="cyan")
    
    grid = Table.grid(expand=True, padding=(0, 2))
    grid.add_column(style="cyan", no_wrap=True, justify="right", width=20)
    grid.add_column()
    
    grid.add_row("[CORE] Orquestrador", f": {worker_status}")
    grid.add_row("[SYS]  Autonomia", f": {autonomy_display}")
    grid.add_row("[DATA] Carga de Tarefas", f": [yellow]{task_counts.get('pending', 0)}[/] Pendentes | [magenta]{task_counts.get('running', 0)}[/] Rodando")
    grid.add_row("[API]  Orcamento Diario", f": [red]{api_budget.get('used', 'N/A')}[/] / [green]{api_budget.get('total', 'N/A')}[/] chamadas")

    console.print(header)
    console.print(Panel(grid, title="[bold]STATUS VITAL[/]", border_style="green", padding=(1,2)))
    console.print("[grey50]Para uma lista de comandos, use [cyan]nexus-cli dashboard[/] ou [cyan]nexus-help[/].[/]")

# --- Funcoes de Utilitario ---

def _run_script(script_path: Path, *args):
    if not script_path.exists():
        console.print(f"[red][ERRO] Modulo nao encontrado: {script_path.name}[/]")
        time.sleep(2)
        return
    
    command = [_get_python_exe(), str(script_path), *args]
    console.print(f"\n[cyan]Engatilhando {script_path.name}...[/]")
    subprocess.run(command)
    console.print(f"\n[green]Concluido. Pressione Enter para retornar ao Nexus.[/]")
    input()

def _run_powershell_script(script_path: Path):
    if not script_path.exists():
        console.print(f"[red][ERRO] Modulo nao encontrado: {script_path.name}[/]")
        time.sleep(2)
        return
    
    command = ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(script_path)]
    console.print(f"\n[cyan]Engatilhando {script_path.name}...[/]")
    subprocess.run(command)
    console.print(f"\n[green]Concluido. Pressione Enter para retornar ao Nexus.[/]")
    input()

# --- Logica dos Subcomandos (Antigos Scripts) ---

def run_dashboard():
    """Exibe o painel de controle principal do Nexus."""
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        
        header = Panel(
            "[bold cyan]NEXUS COMMAND CENTER v1.0[/] | [magenta]Executor de Rotinas de Sistema SOTA[/]",
            style="white on black",
            border_style="cyan"
        )
        
        menu = Table.grid(expand=True, padding=(0, 1))
        menu.add_column(style="cyan", width=5)
        menu.add_column(style="white")
        menu.add_row("[1]", "[bold green]Monitor[/] de Telemetria (Hardware & Nuvem)")
        menu.add_row("[2]", "[bold yellow]Teste[/] de Disjuntor (Circuit Breaker API)")
        menu.add_row("[3]", "[bold magenta]Scan[/] de Entropia (Densidade de Tokens)")
        menu.add_row("[4]", "[bold blue]Watch[/] de Contexto (Sentinela de Arquivos)")
        menu.add_row("[5]", "[bold red]Refactor[/] Agentico (Auto-Refactor com IA)")
        menu.add_row("[6]", "[bold red]Sanitize[/] System (Expurgo Deterministico de Lixo)")
        menu.add_row("[7]", "[bold cyan]Optimize-IDE[/] (Injeta config de baixa latencia no VSCode)")
        menu.add_row("[8]", "[bold red]Purge-Ext[/] (Audita e remove extensoes VSCode redundantes)")
        menu.add_row("[9]", "[bold green]Audit-Routing[/] (Gera matriz de roteamento de agentes)")
        menu.add_row("[10]", "[bold green]Visualize-Map[/] (Gera diagrama de fluxo de tarefas)")
        menu.add_row("", "")
        menu.add_row("[Q]", "Sair e Retornar ao Terminal")

        layout = Layout()
        layout.split_column(
            Layout(header, size=3),
            Layout(Panel(menu, title="[bold]ARSENAL SOTA DE INFRAESTRUTURA[/]", border_style="magenta"))
        )

        console.print(layout)
        
        choice = console.input("\n[bold yellow]Selecione uma diretriz de operacao:[/] ").strip().lower()
        
        actions = {
            "1": ("monitor", []),
            "2": ("test-breaker", []),
            "3": ("scan", []),
            "4.": ("watch", []),
            "5": ("refactor", []),
            "6": ("sanitize", []),
            "7": ("optimize-ide", []),
            "8": ("purge-ext", []),
            "9": ("audit-routing", []),
            "10": ("visualize-map", []),
        }

        if choice == "q":
            break
        elif choice in actions:
            subcommand, args = actions[choice]
            # Se a acao precisa de input, como o caminho do arquivo para refatorar
            if subcommand == "refactor":
                file_to_refactor = console.input("[bold yellow]Informe o caminho do arquivo para refatorar:[/] ").strip()
                if file_to_refactor:
                    args.append(file_to_refactor)
                else:
                    console.print("[red]Caminho do arquivo nao pode ser vazio.[/]")
                    time.sleep(2)
                    continue

            # Limpa a tela e executa o comando correspondente
            os.system('cls' if os.name == 'nt' else 'clear')
            main([subcommand] + args)
            console.print(f"\n[green]Rotina '{subcommand}' concluida. Pressione Enter para retornar ao dashboard.[/]")
            input()
        else:
            console.print("[red]Opcao invalida.[/]")
            time.sleep(1)

def main(args=None):
    if args is None:
        args = sys.argv[1:]

    if not args or args[0] in ['-h', '--help', 'dashboard']:
        run_dashboard()
        return

    command = args[0].lower()
    cli_args = args[1:]

    # --- Roteador de Comandos SOTA (Internalizado) ---
    if command == "start-worker":
        start_worker()
        return
    if command == "stop-worker":
        stop_worker()
        return
    if command == "autonomy":
        if not cli_args:
            console.print("[red]O comando 'autonomy' requer um modo (full, partial, off).[/]")
            return
        set_autonomy(cli_args[0])
        return
    if command == "status":
        show_status()
        return
    if command == "sanitize":
        run_sanitizer()
        return

    # Mapeamento de comandos para os scripts originais
    script_map = {
        "monitor": "vitoi_monitor.py",
        "test-breaker": "vitoi_circuit_breaker.py",
        "scan": "vitoi_scanner.py",
        "watch": "vitoi_watcher.py",
        "refactor": "vitoi_refactor_engine.py",
        "sanitize": "vitoi_sanitizer.py",
        "optimize-ide": "vitoi_optimize_vscode.py",
        "purge-ext": "vitoi_extension_purge.py",
        "audit-routing": "audit_routing.py",
    }

    if command in script_map:
        script_path = ROUTINES_DIR / script_map[command]
        _run_script(script_path, *cli_args)
    elif command == "visualize-map":
        script_path = ROUTINES_DIR / "invoke_routing_map_visualization.ps1"
        _run_powershell_script(script_path)
    else:
        console.print(f"[red]Comando desconhecido: '{command}'[/]")
        console.print("[yellow]Use 'nexus dashboard' ou 'nexus' para ver as opcoes.[/]")

if __name__ == "__main__":
    main()


"""
NOTA DE ARQUITETURA (CHICO):

Abaixo esta o codigo-fonte dos scripts originais que foram absorvidos por este executor.
Eles sao mantidos aqui como funcoes para referencia futura, mas a execucao agora
e centralizada e orquestrada pelo `main` e `run_dashboard` acima, que invocam os
scripts fisicos em `scripts/routines`.

Esta abordagem hibrida (um CLI que chama outros scripts) foi escolhida para
garantir uma transicao segura, sem quebrar nenhuma dependencia interna que os
scripts individuais possam ter.

A proxima fase da evolucao sera mover o *codigo* dessas funcoes para dentro
deste arquivo, eliminando completamente os arquivos externos e completando
a centralizacao fractal.

================================================================================
Exemplo de como a funcao `run_sanitizer` seria internalizada:
================================================================================

def run_sanitizer(dry_run=True):
    console.print(Panel("[bold cyan]VITOI GENERAL SANITIZER (SOTA)[/]\\n[white]Expurgo Deterministico de Entropia Morta[/]", border_style="cyan"))
    
    # Alvos Deterministicos (Rigor Estrutural, zero alucinacao de IA)
    targets = [
        BASE_DIR / ".backups_sota",
        BASE_DIR / "frontend" / ".next" / "cache",
    ]
    
    # Coleta de caches Python e arquivos de backup perdidos
    for p in BASE_DIR.rglob("__pycache__"):
        targets.append(p)
    for p in BASE_DIR.rglob("*.bak*"):
        targets.append(p)
        
    removed_count = 0
    saved_space = 0

    table = Table(expand=True, border_style="magenta")
    table.add_column("ALVO", style="yellow")
    table.add_column("TAMANHO", justify="right", style="cyan")
    table.add_column("STATUS", justify="center")

    for path in targets:
        if path.exists():
            try:
                # Calcula tamanho
                size = sum(f.stat().st_size for f in path.glob('**/*') if f.is_file()) if path.is_dir() else path.stat().st_size
                size_mb = size / (1024 * 1024)
                
                if dry_run:
                    table.add_row(str(path.relative_to(BASE_DIR)), f"{size_mb:.2f} MB", "[yellow]SIMULADO[/]")
                else:
                    if path.is_file():
                        path.unlink()
                    elif path.is_dir():
                        shutil.rmtree(path)
                    table.add_row(str(path.relative_to(BASE_DIR)), f"{size_mb:.2f} MB", "[red]VAPORIZADO[/]")
                    
                    removed_count += 1
                    saved_space += size
            except Exception as e:
                table.add_row(str(path.relative_to(BASE_DIR)), "N/A", f"[red]ERRO: {str(e)[:15]}[/]")

    console.print(table)

    if not dry_run:
        console.print(f"\\n[bold green][+] Saneamento Concluido SOTA.[/] {removed_count} alvos eliminados.")
        console.print(f"[bold cyan]Espaco e I/O recuperados:[/] {saved_space / (1024 * 1024):.2f} MB.")
    else:
        console.print("\\n[yellow][!] MODO SIMULACAO ATIVO. Nenhum arquivo foi modificado.[/]")
        choice = console.input("[bold white]Deseja executar a purga real? (s/n): [/]")
        if choice.lower() == 's':
            os.system('cls' if os.name == 'nt' else 'clear')
            run_sanitizer(dry_run=False)
        else:
            console.print("[cyan]Operacao abortada. Mantendo simetria atual.[/]")

... e assim por diante para cada comando.

"""










































































































































































































































...