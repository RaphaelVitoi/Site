import os
from pathlib import Path

try:
    from rich.console import Console
    from rich.table import Table
except ImportError:
    print("[ERRO] Instale a biblioteca rich: pip install rich")
    exit(1)

console = Console()

def estimate_tokens(file_path):
    """Heuristica offline SOTA: 1 token ~= 4 caracteres/bytes em texto puro."""
    try:
        return os.path.getsize(file_path) // 4
    except:
        return 0

def get_ignore_patterns():
    return {
        ".git", "node_modules", ".venv", ".chroma_db", "__pycache__", 
        ".next", "dist", "build", "logs", ".claude", "archive"
    }

def scan_directory(base_dir):
    ignores = get_ignore_patterns()
    file_stats = []

    for root, dirs, files in os.walk(base_dir):
        # Pruning in-place (Ignora pastas negras)
        dirs[:] = [d for d in dirs if d not in ignores and not d.startswith('.')]
        
        for file in files:
            # Ignora binarios conhecidos na contagem
            if file.lower().endswith(('.db', '.sqlite', '.db-wal', '.png', '.jpg', '.mp4', '.pdf', '.docx')):
                continue
                
            path = Path(root) / file
            tokens = estimate_tokens(path)
            if tokens > 0:
                file_stats.append((path, tokens))
                
    return sorted(file_stats, key=lambda x: x[1], reverse=True)

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent.parent
    console.print("[bold cyan]=== VITOI-Scanner 3.2: Auditoria de Entropia Semantica ===[/]")
    console.print(f"Mapeando o nucleo: [cyan]{base}[/]\n")
    
    top_files = scan_directory(base)[:15]
    table = Table(title="Top 15 Arquivos de Maior Densidade (Estimativa Offline)", border_style="cyan")
    table.add_column("Rank", justify="center", style="magenta")
    table.add_column("Arquivo", style="green")
    table.add_column("Tokens (Est.)", justify="right", style="yellow")
    for i, (path, tokens) in enumerate(top_files):
        table.add_row(str(i+1), str(path.relative_to(base)), f"{tokens:,}")
        
    console.print(table)