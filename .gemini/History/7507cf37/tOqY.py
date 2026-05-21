import os
import sys
import time
import shutil
import re
import json
import subprocess
import stat
import collections
from pathlib import Path
from datetime import datetime

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
        # Ignora arquivos de bibliotecas do ambiente virtual e repositório Git
        if ".venv" not in p.parts and ".git" not in p.parts:
            targets.append(p)
    for p in BASE_DIR.rglob("*.bak"):
        if ".venv" not in p.parts and ".git" not in p.parts:
            targets.append(p)
            
    def force_remove_readonly(func, path, exc_info):
        """Remove a flag read-only do Windows que bloqueia delecao."""
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception:
            pass

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
                        try:
                            path.unlink()
                        except PermissionError:
                            os.chmod(path, stat.S_IWRITE)
                            path.unlink()
                    elif path.is_dir():
                        shutil.rmtree(path, onerror=force_remove_readonly)
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

def optimize_vscode():
    """Otimiza configuracoes do VS Code para supressao de latencia."""
    console.print("[cyan]=== [VITOI 3.2] OTIMIZACAO GLOBAL DE IDE ===[/]")
    config_path = Path.home() / "AppData/Roaming/Code/User/settings.json"
    if not config_path.exists():
        config_path = Path.home() / ".config/Code/User/settings.json"
    if not config_path.exists():
        console.print(f"[bold red][ERRO CRITICO] O núcleo de settings.json nao foi encontrado em {config_path.parent}.[/]")
        return
    
    console.print(f"[cyan]Infiltrando em: {config_path}[/]")
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
            content = re.sub(r'("(?:\\"|[^"])*")|//.*|/\*.*?\*/', lambda m: m.group(1) if m.group(1) else '', content, flags=re.S)
            content = re.sub(r'("(?:\\"|[^"])*")|,\s*(?=[\]}])', lambda m: m.group(1) if m.group(1) else '', content)
            settings = json.loads(content, strict=False) if content.strip() else {}
    except Exception as e:
        console.print(f"[red][ERRO] Falha ao destrinchar o cortex do VS Code: {e}[/]")
        return

    if "files.watcherExclude" not in settings: settings["files.watcherExclude"] = {}
    settings["files.watcherExclude"].update({
        "**/.git/objects/**": True, "**/node_modules/**": True, "**/dist/**": True,
        "**/.next/**": True, "**/.continue/**": True, "**/build/**": True
    })
    settings["editor.bracketPairColorization.enabled"] = True
    settings["editor.guides.bracketPairs"] = "active"
    settings["git.autorefresh"] = False
    settings["continue.embeddingsProvider"] = None

    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=4)
        console.print("[bold green][+] Simetria Alcancada: Protocolo de Baixa Latencia injetado no settings.json.[/]")
    except Exception as e:
        console.print(f"[red][ERRO] Falha de permissao na gravacao: {e}[/]")

def purge_extensions():
    """Remove extensoes redundantes de IA que causam lentidao."""
    console.print("[cyan]=== [VITOI 3.2] AUDITORIA DE EXTENSOES SOTA ===[/]")
    console.print("[cyan]Iniciando varredura no Extension Host...[/]")
    KEEP_LIST = ["continue.continue", "usernamehw.errorlens", "eamodio.gitlens", "aaron-bond.better-comments"]
    REDUNDANT_KEYWORDS = ["copilot", "codeium", "blackbox", "genie", "tabnine", "cursor"]
    try:
        result = subprocess.run(['code', '--list-extensions'], capture_output=True, text=True, check=True)
        installed = result.stdout.splitlines()
    except Exception as e:
        console.print(f"[bold red][ERRO CRITICO] Falha ao comunicar com a CLI do VS Code: {e}[/]")
        return
    
    to_remove = [ext for ext in installed if any(key in ext.lower() for key in REDUNDANT_KEYWORDS) and ext not in KEEP_LIST]
    
    if not to_remove:
        console.print("[bold green][+] Simetria Alcancada: Nenhuma redundancia detectada no Extension Host.[/]")
        return
        
    console.print(f"[bold yellow][!] Detectadas {len(to_remove)} extensoes redundantes gerando latencia de I/O e bloat cognitivo:[/]")
    for ext in to_remove:
        confirm = console.input(f"\n[bold yellow]Deseja obliterar a extensao '{ext}'? (s/n): [/]").strip().lower()
        if confirm == 's':
            console.print(f"[cyan]Desinstalando {ext}...[/]")
            subprocess.run(['code', '--uninstall-extension', ext])
            console.print(f"[bold green][-] {ext} vaporizada com sucesso.[/]")
        else:
            console.print("[cyan][~] Ignorado.[/]")

def run_scanner():
    """Mapeia arquivos densos em tokens e lista os ofensores de entropia."""
    console.print("[bold cyan]=== VITOI-Scanner 3.2: Auditoria de Entropia Semantica ===[/]")
    console.print(f"Mapeando o nucleo: [cyan]{BASE_DIR}[/]\n")
    ignores = {".git", "node_modules", ".venv", ".chroma_db", "__pycache__", ".next", "dist", "build", "logs", ".claude", "archive"}
    file_stats = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in ignores and not d.startswith('.')]
        for file in files:
            if file.lower().endswith(('.db', '.sqlite', '.db-wal', '.png', '.jpg', '.mp4', '.pdf', '.docx')): continue
            path = Path(root) / file
            try: tokens = os.path.getsize(path) // 4
            except: tokens = 0
            if tokens > 0: file_stats.append((path, tokens))
    
    top_files = sorted(file_stats, key=lambda x: x[1], reverse=True)[:15]
    table = Table(title="Top 15 Arquivos de Maior Densidade (Estimativa Offline)", border_style="cyan")
    table.add_column("Rank", justify="center", style="magenta")
    table.add_column("Arquivo", style="green")
    table.add_column("Tokens (Est.)", justify="right", style="yellow")
    for i, (path, tokens) in enumerate(top_files):
        table.add_row(str(i+1), str(path.relative_to(BASE_DIR)), f"{tokens:,}")
    console.print(table)


# --- INTEGRACOES FRACTAIS (Telemetria, Watcher, Refactor, Circuit Breaker) ---

def get_api_key():
    """Busca cirurgica de chaves de API para modulos internos."""
    for file_name in ["_env.ps1", ".env"]:
        env_path = BASE_DIR / file_name
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    match = re.search(r'(?:\$env:|\$)?(GEMINI[A-Z0-9_]*|GOOGLE[A-Z0-9_]*)\s*[:=]\s*[\'"]?([^\'"\s#]+)[\'"]?', line, re.IGNORECASE)
                    if match and "CLI" not in match.group(1).upper():
                        return match.group(2)
    for k, v in os.environ.items():
        if (k.upper().startswith("GEMINI") or k.upper().startswith("GOOGLE")) and "CLI" not in k.upper():
            return v
    return ""

class VITOI_QuotaManager:
    """Gerenciador de Cota / Circuit Breaker unificado."""
    def __init__(self, rpm_limit=15, tpm_limit=32000):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.request_history = collections.deque()
        self.token_history = collections.deque()
        self.safety_threshold = 0.8

    def check_quota(self, estimated_tokens=1000):
        now = time.time()
        while self.request_history and now - self.request_history[0] > 60:
            self.request_history.popleft()
        while self.token_history and now - self.token_history[0][0] > 60:
            self.token_history.popleft()
        current_rpm = len(self.request_history)
        current_tpm = sum(t[1] for t in self.token_history)
        if current_rpm >= self.rpm_limit * self.safety_threshold:
            return False, f"RPM critico: {current_rpm}/{self.rpm_limit}"
        if current_tpm + estimated_tokens >= self.tpm_limit * self.safety_threshold:
            return False, f"TPM critico: {current_tpm}/{self.tpm_limit}"
        return True, "OK"

    def log_request(self, tokens=0):
        self.request_history.append(time.time())
        self.token_history.append((time.time(), tokens))

def run_monitor():
    """Inicia o painel de telemetria em tempo real (RAM e API)."""
    api_key = get_api_key()
    if not api_key:
        console.print("[red][ERRO] API Key ausente. Configure _env.ps1.[/]")
        return
    client = genai.Client(api_key=api_key)
    quota_manager = VITOI_QuotaManager()
    history = []
    
    def get_ext_mem():
        mem, count = 0.0, 0
        for p in psutil.process_iter(['name', 'cmdline', 'memory_info']):
            try:
                if ('code' in (p.info.get('name') or '').lower()) and 'extensionhost' in " ".join(p.info.get('cmdline') or []).lower() and p.info.get('memory_info'):
                    mem += p.info['memory_info'].rss / (1024 * 1024)
                    count += 1
            except: pass
        return mem, count

    with Live(console=console, refresh_per_second=1) as live:
        while True:
            ram_mb, ext_count = get_ext_mem()
            is_safe, reason = quota_manager.check_quota()
            lat, tk, status = 0, 0, f"COOLDOWN: {reason}"
            if is_safe:
                start_time = time.perf_counter()
                try:
                    prompt = "Analise este fragmento de codigo sob o rigor VITOI."
                    res = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
                    lat = time.perf_counter() - start_time
                    tk = getattr(res.usage_metadata, 'total_token_count', len(prompt.split()) + 50) if hasattr(res, 'usage_metadata') else 50
                    status = "SUCCESS"
                    quota_manager.log_request(tk)
                except Exception as e:
                    lat = time.perf_counter() - start_time
                    status = f"ERROR: {str(e)[:20]}"
            
            history.append((lat, tk, status, ram_mb, ext_count))
            table = Table(title="[bold cyan]Telemetria Hibrida - VITOI 3.2[/]", expand=True)
            table.add_column("ID", justify="center", style="cyan")
            table.add_column("Latencia", justify="right", style="magenta")
            table.add_column("Tokens", justify="right", style="green")
            table.add_column("RAM ExtHost", justify="right", style="blue")
            table.add_column("Status", justify="center")
            
            valid_lats = [h[0] for h in history if h[0] > 0]
            avg_lat = sum(valid_lats) / max(1, len(valid_lats))
            for i, (l, t, s, r, ec) in enumerate(history[-10:]):
                table.add_row(str(i+1), f"{l:.2f}s", str(t), f"{r:.1f} MB", s)
            
            sys_stat = "[red]DEGRADADO[/]" if avg_lat > 8 or ram_mb > 1200 else "[green]NOMINAL[/]"
            panel = Panel(f"[bold]Latencia Media:[/] {avg_lat:.2f}s\n[bold]Status:[/] {sys_stat}", title="Visao Macro", border_style="cyan")
            
            layout = Layout()
            layout.split_column(Layout(panel, size=4), Layout(table))
            live.update(layout)
            time.sleep(10)

def test_circuit_breaker():
    """Teste de estresse e limite de RPM/TPM."""
    api_key = get_api_key()
    if not api_key: return console.print("[red]API Key ausente.[/]")
    client = genai.Client(api_key=api_key)
    quota = VITOI_QuotaManager(rpm_limit=15, tpm_limit=32000)
    console.print(Panel("Iniciando Teste de Carga SOTA (Circuit Breaker)", border_style="cyan"))
    for i in range(5):
        is_safe, reason = quota.check_quota()
        if not is_safe:
            console.print(f"[bold red]🚫 CIRCUITO ABERTO:[/] {reason}. Pausando...")
            time.sleep(10)
            continue
        try:
            res = client.models.generate_content(model='gemini-2.5-flash', contents=f"Gere um numero {i}")
            quota.log_request(50)
            console.print(f"Sessao {i+1}: Sucesso!")
        except Exception as e:
            console.print(f"[bold red]🔥 FALHA:[/] {str(e)[:50]}")
        time.sleep(2)

class VITOIWatcher(FileSystemEventHandler):
    def __init__(self):
        self.ignores = {".git", "node_modules", ".venv", ".chroma_db", "__pycache__", ".next", "dist", ".claude"}
        self.last = {}
    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(('.py', '.js', '.ts', '.tsx')): return
        if any(ign in Path(event.src_path).parts for ign in self.ignores): return
        if event.src_path in self.last and time.time() - self.last[event.src_path] < 5: return
        if os.path.getsize(event.src_path) // 4 > 8000:
            self.last[event.src_path] = time.time()
            console.print(f"\n[bold red]⚠️ ENTROPIA DETECTADA:[/] {os.path.basename(event.src_path)} excedeu limite de tokens!")

def run_watcher():
    """Vigia o sistema de arquivos contra acumulo de entropia (Arquivos Gigantes)."""
    observer = Observer()
    observer.schedule(VITOIWatcher(), path=str(BASE_DIR), recursive=True)
    console.print(Panel("Monitor de Contexto VITOI Ativo...\nVigiando expansao de massa em tempo real.", border_style="cyan"))
    observer.start()
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

class FileDef(BaseModel): path: str; content: str
class StructureDef(BaseModel): directory: str; files: list[FileDef]; main_file_update: str
class RefactorOutput(BaseModel): project_structure: StructureDef

def run_refactor_engine(file_path):
    """Desmembra monolitos usando a IA."""
    path = Path(file_path)
    if not path.exists() or path.is_dir(): return console.print(f"[red]Alvo invalido: {file_path}[/]")
    console.print(Panel(f"Refatoracao Agentica SOTA\nAlvo: [yellow]{path.name}[/]", border_style="cyan"))
    api_key = get_api_key()
    if not api_key: return console.print("[red]API Key ausente.[/]")
    
    with open(path, 'r', encoding='utf-8') as f: content = f.read()
    bak = f"{path}.bak_{int(time.time())}"
    shutil.copy(path, bak)
    
    try:
        client = genai.Client(api_key=api_key)
        res = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=f"SISTEMA: VITOI 3.2. TAREFA: Divida em modulos logicos SRP.\nCÓDIGO:\n{content}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=RefactorOutput, temperature=0.1)
        )
        struct = json.loads(res.text).get('project_structure', {})
        tdir = path.parent / struct['directory']
        tdir.mkdir(exist_ok=True)
        for fi in struct['files']:
            with open(tdir / fi['path'], 'w', encoding='utf-8') as nf: nf.write(fi['content'])
            console.print(f"[green] -> Modulo materializado:[/] {fi['path']}")
        with open(path, 'w', encoding='utf-8') as f: f.write(struct['main_file_update'])
        console.print("[bold green]=== SINTESE CONCLUIDA ==-[/]")
    except Exception as e:
        console.print(f"[red]Arritmia: {e}. Revertendo backup.[/]")
        shutil.copy(bak, path)

def audit_routing():
    """Gera a matriz holografica de roteamento em Markdown."""
    def read_json_sota(file_path: Path):
        if not file_path.exists(): return {}
        with open(file_path, "r", encoding="utf-8-sig") as f:
            return json.loads(f.read().lstrip('\ufeff \t\n\r'))

    intents = read_json_sota(BASE_DIR / "data/intentmap.json")
    routes = read_json_sota(BASE_DIR / "data/routing_map.json")
    sys_cfg = read_json_sota(BASE_DIR / "data/system_config.json")
    
    handoffs = sys_cfg.get("handoff_pipeline", {})
    agent_models = routes.get("agent_map", {})
    
    md = f"# MATRIZ HOLOGRAFICA DE ROTEAMENTO (SOTA)\n> **Gerado Automaticamente** | Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    md += "## 1. A Malha de Entrada (Usuario -> Agente)\n| Agente | Prioridade | Padrao de Gatilho (Regex) |\n|---|---|---|\n"
    for ag, data in sorted(intents.items(), key=lambda x: x[1].get('priority', 99)):
        md += f"| **{ag}** | {data.get('priority')} | `{data.get('pattern')}` |\n"
        
    md += "\n## 2. A Malha de Handoff Automatica (Parte -> Parte)\n| Agente Origem | Passa o bastao para | Condicao |\n|---|---|---|\n"
    for orig, dest in handoffs.items():
        md += f"| **{orig}** | **{dest}** | Automatico ao concluir tarefa sem falhas |\n"
        
    md += "\n## 3. Topologia de Cognicao (Agente -> LLM Tier)\n| Agente | Nivel de Raciocinio | Modelos Alocados (Cascata) |\n|---|---|---|\n"
    for ag, tier in agent_models.items():
        models = ", ".join(routes.get(tier, []))
        md += f"| **{ag}** | `{tier}` | {models} |\n"
        
    out_path = BASE_DIR / "docs/reports/HOLOGRAPHIC_ROUTING_MATRIX.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
    console.print(f"[bold green][SOTA] Matriz Holografica de Roteamento forjada em: {out_path}[/]")

def audit_api_keys():
    """Auditoria de Seguranca e Rotacao de Chaves de API (SOTA)."""
    console.print(Panel("[bold cyan]=== INICIANDO AUDITORIA DE SEGURANCA DE CHAVES DE API ===[/]", border_style="cyan"))
    
    import urllib.request
    
    all_keys = {}
    
    def add_key(name, value, source):
        upper_name = name.upper().strip()
        if upper_name.startswith("GEMINI_CLI"): return
        if upper_name not in all_keys:
            all_keys[upper_name] = {"value": value, "source": source}

    for file_name in ["_env.ps1", ".env"]:
        env_path = BASE_DIR / file_name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        match = re.search(r'(?:\$env:|\$)?([a-zA-Z0-9_]+)\s*[:=]\s*[\'"]?([^\'"\s#]+)[\'"]?', line)
                        if match:
                            add_key(match.group(1), match.group(2), f"File ({file_name})")
            except Exception: pass
            
    for k, v in os.environ.items():
        if (k.upper().startswith("GEMINI") or k.upper().startswith("GOOGLE") or k.upper().startswith("OPENROUTER") or k.upper().startswith("OPEN_ROUTER")):
            add_key(k, v, "Environment")

    def test_google_api(key):
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                return True
        except Exception:
            return False

    def test_openrouter_api(key):
        url = "https://openrouter.ai/api/v1/auth/key"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                return True
        except Exception:
            return False

    def find_key_leaks(key_value):
        ignores = {".git", ".venv", "node_modules", "archive", ".bak", "logs"}
        leaked_files = []
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if not any(ign in Path(os.path.join(root, d)).parts for ign in ignores)]
            for file in files:
                if file.endswith("_env.ps1") or file.endswith(".env"): continue
                path = Path(root) / file
                if not path.is_file(): continue
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        if key_value in f.read():
                            leaked_files.append(str(path.relative_to(BASE_DIR)))
                except Exception: pass
        return leaked_files

    summary = {"active": 0, "invalid": 0, "empty": 0, "leaked": 0}

    for key_name in sorted(all_keys.keys()):
        key_data = all_keys[key_name]
        key_value = key_data["value"]
        key_source = key_data["source"]
        
        console.print(f"\n[white][AUDITANDO] {key_name} (Fonte: {key_source})[/]")
        
        if not key_value or key_value == "REPLACE_ME":
            console.print("  [yellow][!] STATUS: VAZIA / NAO CONFIGURADA[/]")
            summary["empty"] += 1
            continue

        is_valid = False
        if key_name.startswith("GEMINI") or key_name.startswith("GOOGLE"):
            is_valid = test_google_api(key_value)
        elif key_name.startswith("OPENROUTER") or key_name.startswith("OPEN_ROUTER"):
            is_valid = test_openrouter_api(key_value)
        else:
            continue

        if is_valid:
            console.print("  [green][+] STATUS: ATIVA E OPERANTE[/]")
            summary["active"] += 1
        else:
            console.print("  [red][!] STATUS: INVALIDA OU EXPIRADA[/]")
            summary["invalid"] += 1

        leaks = find_key_leaks(key_value)
        if leaks:
            console.print(f"  [bold red][CRITICAL] VAZAMENTO DETECTADO EM {len(leaks)} ARQUIVO(S):[/]")
            for leak in leaks:
                console.print(f"    - {leak}", style="red")
            summary["leaked"] += 1
        else:
            console.print("  [green][OK] SEGURANCA: Nenhum vazamento detectado no codigo fonte.[/]")

    console.print("\n[bold cyan]=================================================[/]")
    console.print("[bold cyan]            RELATORIO FINAL DA AUDITORIA[/]")
    console.print("[bold cyan]=================================================[/]")
    console.print(f"  - Chaves Ativas: [green]{summary['active']}[/]")
    console.print(f"  - Chaves Vazias: [grey50]{summary['empty']}[/]")
    console.print(f"  - Chaves Invalidas: [red]{summary['invalid']}[/]")
    console.print(f"  - Chaves Vazadas: [magenta]{summary['leaked']}[/]")

    if summary["leaked"] > 0:
        console.print("\n[bold red][ACAO CRITICA] Chaves vazadas foram encontradas! E OBRIGATORIO rotacionar estas chaves.[/]")

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
    if command == "optimize-ide":
        optimize_vscode()
        return
    if command == "purge-ext":
        purge_extensions()
        return
    if command == "scan":
        run_scanner()
        return
    if command == "audit-routing":
        audit_routing()
        return
    if command == "audit-api":
        audit_api_keys()
        return
    if command == "monitor":
        run_monitor()
        return
    if command == "test-breaker":
        test_circuit_breaker()
        return
    if command == "watch":
        run_watcher()
        return
    if command == "refactor":
        if not cli_args:
            console.print("[red]Uso: nexus-cli refactor <caminho_do_arquivo>[/]")
            return
        run_refactor_engine(cli_args[0])
        return

    if command == "visualize-map":
        script_path = ROUTINES_DIR / "invoke_routing_map_visualization.ps1"
        _run_powershell_script(script_path)
    else:
        console.print(f"[red]Comando desconhecido: '{command}'[/]")
        console.print("[yellow]Use 'nexus dashboard' ou 'nexus' para ver as opcoes.[/]")

if __name__ == "__main__":
    main()










































































































































































































































...