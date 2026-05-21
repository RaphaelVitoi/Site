import time
import os
import sys
import subprocess
from pathlib import Path

try:
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
except ImportError:
    print("[ERRO] Dependencias SOTA ausentes. Execute: pip install rich")
    sys.exit(1)

console = Console()

class VitoiDashboard:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent
        self.python_exe = str(self.base_dir.parent.parent / ".venv" / "Scripts" / "python.exe")
        if not os.path.exists(self.python_exe):
            self.python_exe = "python" # Fallback global

    def generate_header(self):
        return Panel(
            "[bold cyan]VITOI COMMAND CENTER v3.2[/] | [magenta]Cerebro Hibrido: Ativo[/] | [green]Infra: SOTA[/]",
            style="white on black",
            border_style="cyan"
        )

    def generate_metrics_table(self):
        table = Table(expand=True, border_style="cyan")
        table.add_column("SISTEMA", style="bold")
        table.add_column("METRICA", justify="right")
        table.add_column("ESTADO", justify="center")

        table.add_row("Google API (Quota)", "15 RPM / 32k TPM", "[green]BLINDADO[/]")
        table.add_row("IDE Extension Host", "Supressao Ativa", "[green]OTIMIZADO[/]")
        table.add_row("Banco de Dados", "SQLite WAL", "[green]ACID NOMINAL[/]")
        return table

    def generate_menu(self):
        menu = Table.grid(expand=True)
        menu.add_column(style="cyan")
        menu.add_row("[1] [>] Iniciar Monitor de Telemetria (Hardware & Nuvem)")
        menu.add_row("[2] [*] Acionar Disjuntor de Teste (Circuit Breaker)")
        menu.add_row("[3] [!] Scanner de Entropia (Densidade de Tokens)")
        menu.add_row("[4] [~] Ativar Sentinela de Contexto (Watcher)")
        menu.add_row("[5] [@] Motor de Refatoracao (Auto-Refactor Agentico)")
        menu.add_row("[6] [x] Saneador de Sistema (Expurgo Deterministico)")
        menu.add_row("")
        menu.add_row("[Q] [x] Sair e Retornar ao Orquestrador")
        return Panel(menu, title="[bold]ARSENAL SOTA DE INFRAESTRUTURA[/]", border_style="magenta")

    def execute_action(self, script_name):
        script_path = self.base_dir / script_name
        if not script_path.exists():
            console.print(f"[red][ERRO] Modulo nao encontrado: {script_name}[/]")
            time.sleep(2)
            return
            
        console.print(f"\n[cyan]Engatilhando {script_name}...[/]")
        subprocess.run([self.python_exe, str(script_path)])

def main():
    dash = VitoiDashboard()
    
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="main", size=6),
            Layout(name="menu", size=10)
        )

        layout["header"].update(dash.generate_header())
        layout["main"].update(dash.generate_metrics_table())
        layout["menu"].update(dash.generate_menu())

        console.print(layout)
        
        choice = console.input("\n[bold yellow]Selecione uma diretriz de operacao:[/] ").strip().lower()
        
        options = {"1": "vitoi_monitor.py", "2": "vitoi_circuit_breaker.py", "3": "vitoi_scanner.py", "4": "vitoi_watcher.py", "5": "vitoi_refactor_engine.py", "6": "vitoi_sanitizer.py"}
        if choice in options: dash.execute_action(options[choice])
        elif choice == "q": break
        else: continue

if __name__ == "__main__":
    main()