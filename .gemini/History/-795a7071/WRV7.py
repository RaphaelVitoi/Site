import time
import os
import sys
import subprocess
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
        extension = Path(file_path).suffix.lower()
        console.print("\n[bold red]" + "!"*60)
        console.print(f"[!] ENTROPIA DE MASSA DETECTADA: {filename}", style="bold yellow")
        console.print(f"Volume Estimado: {tokens:,} tokens.", style="bold cyan")
        console.print("O arquivo excedeu a zona de seguranca de I/O Unico.", style="white")
        
        # Matriz de Refatoracao Polimorfica SOTA
        strategies = {
            '.py': {
                'label': 'Python (PEP 8 / Modular)',
                'tips': [
                    "Extraia classes/Pydantic models para arquivos individuais (`schemas.py`).",
                    "Mova funcoes utilitarias para um `utils.py` ou `helpers.py`.",
                    "Separe a camada de acesso a dados (DAL) da logica de negocios."
                ]
            },
            '.js': {
                'label': 'JavaScript (ES6 Modules)',
                'tips': [
                    "Converta funcoes exportadas em arquivos separados.",
                    "Separe logica de negocio (Services) de logica de interface (UI).",
                    "Considere o uso de `index.js` para barrel exports."
                ]
            },
            '.ts': {
                'label': 'TypeScript (Strong Typing)',
                'tips': [
                    "Extraia `interfaces` e `types` para um arquivo `types.ts`.",
                    "Aplique o Single Responsibility Principle (SRP) em classes densas.",
                    "Mova configuracoes de constantes para `constants.ts`."
                ]
            },
            '.tsx': {
                'label': 'React TypeScript (TSX)',
                'tips': [
                    "Fatie componentes monoliticos em subcomponentes visuais puros.",
                    "Mova interfaces de props para `types.ts`.",
                    "Extraia a logica de estado para `use[Name].ts` (Custom Hooks)."
                ]
            }
        }
        
        strat = strategies.get(extension, {'label': 'Generico', 'tips': ['Divida por blocos logicos e extraia dependencias estaticas.']})
        tips_md = "\n".join([f"- {tip}" for tip in strat['tips']])
        
        # Map-Reduce Automático: Forja o esqueleto da auditoria
        audit_file = Path(".claude/task_results") / f"AUDIT_PLAN_{filename}.md"
        audit_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(audit_file, "w", encoding="utf-8") as f:
            f.write(f"# ⚠️ VITOI AUDIT: ARQUIVO DENSO DETECTADO\n")
            f.write(f"## Arquivo: `{filename}` ({strat['label']})\n\n")
            f.write(f"**Analise de Carga (Custo de Manutencao $C_m \propto Tokens^2):**\n")
            f.write(f"- **Tokens:** {tokens:,} / {TOKEN_LIMIT:,} (Limite)\n")
            f.write(f"- **Status:** 🔴 CRITICO - Risco de Erro 429 e Alucinacao.\n\n")
            f.write("---\n\n")
            f.write("### 🛠️ ESTRATEGIAS DE DIVISAO (SPLIT):\n")
            f.write(f"{tips_md}\n\n")
            f.write("### 💡 COMANDO AGENTICO SUGERIDO:\n")
            f.write(f"> \"Ola, Chico. Analise as funcoes do arquivo `{filename}` e sugira como dividi-lo em modulos independentes seguindo as dicas acima.\"\n\n")
            f.write("---\n")
            f.write("*Gerado pelo Protocolo VITOI 3.2 - Rigor e Eficiencia*\n")
                
        console.print(f"Relatorio de Infeccao forjado em: [green]{audit_file}[/]")
        console.print("[bold red]" + "!"*60 + "\n")
        
        # Interrupcao Ativa: Comanda o VS Code a renderizar o Relatorio
        try:
            subprocess.run(["code", str(audit_file)], shell=True)
        except Exception as e:
            console.print(f"[red]Falha ao abrir o VS Code automaticamente: {e}[/]")

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