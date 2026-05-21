import os
import shutil
from pathlib import Path

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
except ImportError:
    print("[ERRO] Dependencias ausentes. Execute: pip install rich")
    exit(1)

console = Console()

def vitoi_deterministic_cleanup(dry_run=True):
    console.print(Panel("[bold cyan]VITOI GENERAL SANITIZER (SOTA)[/]\n[white]Expurgo Deterministico de Entropia Morta[/]", border_style="cyan"))
    
    base_dir = Path(__file__).resolve().parent.parent.parent
    
    # Alvos Deterministicos (Rigor Estrutural, zero alucinacao de IA)
    targets = [
        base_dir / ".backups_sota",
        base_dir / "frontend" / ".next" / "cache", # Limpa so o cache do Next, nao o build
    ]
    
    # Coleta de caches Python e arquivos de backup perdidos
    for p in base_dir.rglob("__pycache__"):
        targets.append(p)
    for p in base_dir.rglob("*.bak*"):
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
                    table.add_row(str(path.relative_to(base_dir)), f"{size_mb:.2f} MB", "[yellow]SIMULADO[/]")
                else:
                    if path.is_file():
                        path.unlink()
                    elif path.is_dir():
                        shutil.rmtree(path)
                    table.add_row(str(path.relative_to(base_dir)), f"{size_mb:.2f} MB", "[red]VAPORIZADO[/]")
                    
                    removed_count += 1
                    saved_space += size
            except Exception as e:
                table.add_row(str(path.relative_to(base_dir)), "N/A", f"[red]ERRO: {str(e)[:15]}[/]")

    console.print(table)

    if not dry_run:
        console.print(f"\n[bold green][+] Saneamento Concluido SOTA.[/] {removed_count} alvos eliminados.")
        console.print(f"[bold cyan]Espaco e I/O recuperados:[/] {saved_space / (1024 * 1024):.2f} MB.")
    else:
        console.print("\n[yellow][!] MODO SIMULACAO ATIVO. Nenhum arquivo foi modificado.[/]")
        choice = console.input("[bold white]Deseja executar a purga real? (s/n): [/]")
        if choice.lower() == 's':
            os.system('cls' if os.name == 'nt' else 'clear')
            vitoi_deterministic_cleanup(dry_run=False)
        else:
            console.print("[cyan]Operacao abortada. Mantendo simetria atual.[/]")

if __name__ == "__main__":
    vitoi_deterministic_cleanup(dry_run=True)