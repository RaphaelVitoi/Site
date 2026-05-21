import time
import os
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.console import Console
from rich.layout import Layout

console = Console()

def gerar_tabela_logs(n_linhas=15):
    """Lê o log e gera uma tabela formatada em escala de cinza."""
    log_file = ".vitoi_history.log"
    table = Table(expand=True, border_style="bright_black", show_header=True, header_style="bold white")

    table.add_column("Timestamp", style="dim white", width=20)
    table.add_column("Nível", width=10)
    table.add_column("Mensagem Semântica", style="italic white")

    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            linhas = f.readlines()[-n_linhas:]
            for linha in linhas:
                try:
                    # Formato esperado: YYYY-MM-DD HH:MM:SS | LEVEL | MESSAGE
                    partes = linha.strip().split(" | ")
                    if len(partes) == 3:
                        ts, level, msg = partes
                        # Mapeamento Estético Monocromático
                        color = "white" if "INFO" in level else "bold white" if "ERROR" in level else "dim white"
                        table.add_row(ts, f"[{color}]{level}[/]", msg)
                except Exception:
                    continue
    return table

def render_dashboard():
    """Orquestra o layout Noir do Dashboard."""
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="body")
    )

    header_content = Panel(
        "VITOI v3.2 | MONITOR DE ENTROPIA E FLUXO SOTA",
        style="bold white on black",
        border_style="white"
    )

    layout["header"].update(header_content)

    with Live(layout, refresh_per_second=2, screen=True):
        while True:
            layout["body"].update(Panel(gerar_tabela_logs(), border_style="bright_black", title="[Auditoria em Tempo Real]"))
            time.sleep(0.5)

if __name__ == "__main__":
    try:
        render_dashboard()
    except KeyboardInterrupt:
        console.print("\n[VITOI] Encerrando visualização. Logs preservados.", style="dim white")
