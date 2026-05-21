import time
import os
import sys
from pathlib import Path

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    from rich.console import Console
    from rich.panel import Panel
except ImportError:
    print("[ERRO] Dependencias ausentes. Execute: pip install watchdog rich")
    sys.exit(1)

console = Console()
TOKEN_LIMIT = 8000

def get_ignore_patterns():
    return {".git", "node_modules", ".venv", ".chroma_db", "__pycache__", ".next", "dist", "build", "logs", ".claude", "archive", ".backups_sota"}

class VITOIWatcher(FileSystemEventHandler):
    def __init__(self):
        self.last_alert = {}
        self.ignores = get_ignore_patterns()

    def _is_ignored(self, path):
        parts = Path(path).parts
        return any(ign in parts for ign in self.ignores)

    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(('.py', '.js', '.ts', '.tsx', '.json', '.md')):
            return
        if self._is_ignored(event.src_path):
            return
        
        now = time.time()
        if event.src_path in self.last_alert and now - self.last_alert[event.src_path] < 5:
            return # SOTA Debounce: Previne flood de eventos de I/O do VS Code
        
        try:
            file_size = os.path.getsize(event.src_path)
            est_tokens = file_size // 4
            
            if est_tokens > TOKEN_LIMIT:
                self.last_alert[event.src_path] = now
                self._trigger_audit_plan(event.src_path, est_tokens)
        except Exception:
            pass

    def _trigger_audit_plan(self, file_path, tokens):
        filename = os.path.basename(file_path)
        console.print("\n[bold red]" + "!"*60)
        console.print(f"⚠️  ENTROPIA DE MASSA DETECTADA: {filename}", style="bold yellow")
        console.print(f"Volume Estimado: {tokens:,} tokens.", style="bold cyan")
        console.print("O arquivo excedeu a zona de seguranca de I/O Unico.", style="white")
        
        # Map-Reduce Automático: Forja o esqueleto da auditoria
        audit_file = Path(".claude/task_results") / f"AUDIT_PLAN_{filename}.md"
        audit_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(audit_file, "w", encoding="utf-8") as f:
            f.write(f"# Plano de Auditoria Map-Reduce: {filename}\n")
            f.write(f"Volume: ~{tokens} tokens | Risco de Throttling (429): ALTO\n\n")
            f.write("> **Acao Recomendada:** Quebre este arquivo ou solicite ao @dispatcher a analise fragmentada (Chunking).\n")
                
        console.print(f"Relatorio de Infeccao forjado em: [green]{audit_file}[/]")
        console.print("[bold red]" + "!"*60 + "\n")

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent
    observer = Observer()
    handler = VITOIWatcher()
    observer.schedule(handler, path=str(base_dir), recursive=True)
    console.print(Panel("Monitor de Contexto VITOI 3.2 Ativo...\nVigiando expansao de massa em tempo real.", border_style="cyan"))
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()