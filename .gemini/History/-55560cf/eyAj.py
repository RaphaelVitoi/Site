import time
import os
import re
import collections
from pathlib import Path

try:
    import psutil
    from google import genai
    from rich.live import Live
    from rich.table import Table
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
except ImportError:
    print("[ERRO CRITICO] Dependencias SOTA ausentes.")
    print("Execute no terminal: pip install google-genai rich psutil")
    exit(1)

# Coleta Dinamica SOTA da API Key (Bypass de Hardcode)
def load_api_key():
    base_dir = Path(__file__).resolve().parent.parent.parent
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
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

api_key = load_api_key()
if not api_key:
    print("[ERRO] Chave GEMINI/GOOGLE nao encontrada no _env.ps1, .env ou variaveis de ambiente.")
    exit(1)

# Classe de Quota Manager simplificada (Circuit Breaker local)
class LocalQuotaManager:
    def __init__(self, rpm_limit=15):
        self.rpm_limit = rpm_limit
        self.request_history = collections.deque()

    def check_quota(self):
        now = time.time()
        # Remove requests older than 60 seconds
        while self.request_history and now - self.request_history[0] > 60:
            self.request_history.popleft()
        
        current_rpm = len(self.request_history)
        # Trigger cooldown at 90% of limit to be safe
        if current_rpm >= self.rpm_limit * 0.9:
            return False, f"RPM Limit ({current_rpm}/{self.rpm_limit})"
        return True, "OK"

    def log_request(self):
        self.request_history.append(time.time())

quota_manager = LocalQuotaManager()

client = genai.Client(api_key=api_key)
model_name = 'gemini-2.5-flash'
console = Console()

def get_extension_host_memory():
    """Varre a arvore de processos cruzando Hardware com o VS Code."""
    mem_mb = 0.0
    count = 0
    for p in psutil.process_iter(['name', 'cmdline', 'memory_info']):
        try:
            name = p.info.get('name') or ''
            cmd = p.info.get('cmdline') or []
            mem_info = p.info.get('memory_info')
            cmd_str = " ".join(cmd).lower()
            if ('code' in name.lower() or 'code.exe' in name.lower()) and 'extensionhost' in cmd_str and mem_info:
                mem_mb += mem_info.rss / (1024 * 1024)
                count += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return mem_mb, count

def measure_latency(prompt="Analise este fragmento de codigo sob o rigor VITOI."):
    
    is_safe, reason = quota_manager.check_quota()
    if not is_safe:
        # Instead of error, indicate cooldown
        return 0, 0, f"COOLDOWN: {reason}"

    start_time = time.perf_counter()
    
    try:
        response = client.models.generate_content(model=model_name, contents=prompt)
        quota_manager.log_request()
        
        end_time = time.perf_counter()
        latency = end_time - start_time
        
        tokens = 0
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            tokens = getattr(response.usage_metadata, 'total_token_count', 0)
        else:
            tokens = len(prompt.split()) + len(response.text.split())
            
        return latency, tokens, "SUCCESS"
    except Exception as e:
        return 0, 0, f"ERROR: {str(e)[:20]}"

def generate_dashboard(history):
    table = Table(title="[bold cyan]Telemetria Hibrida - Protocolo VITOI 3.2[/]", expand=True)
    table.add_column("ID", justify="center", style="cyan")
    table.add_column("Latencia (Dt)", justify="right", style="magenta")
    table.add_column("Tokens", justify="right", style="green")
    table.add_column("Vazao (T/s)", justify="right", style="yellow")
    table.add_column("ExtHost RAM", justify="right", style="blue")
    table.add_column("Status", justify="center")

    avg_latency = 0
    current_ram = 0
    
    if history:
        for i, (lat, tk, status, ram, ext_count) in enumerate(history[-10:]):
            throughput = tk / lat if lat > 0 else 0
            table.add_row(str(i+1), f"{lat:.2f}s", str(tk), f"{throughput:.1f}", f"{ram:.1f} MB ({ext_count} proc)", status)
        
        valid_latencies = [h[0] for h in history if h[0] > 0]
        avg_latency = sum(valid_latencies) / max(1, len(valid_latencies))
        current_ram = history[-1][3]

    system_status = "[green]NOMINAL[/]"
    if avg_latency > 8 or current_ram > 1200: # Thresholds criticos
        system_status = "[red]DEGRADADO[/]"
        
    panel = Panel(
        f"[bold]Latencia Media Atual:[/] {avg_latency:.2f}s\n"
        f"[bold]Uso de RAM (Extension Host):[/] {current_ram:.1f} MB\n"
        f"[bold]Status do Sistema:[/] {system_status}",
        title="Visao Macro (Hardware & Nuvem)",
        border_style="cyan"
    )
    return table, panel

def main():
    history = []
    with Live(console=console, refresh_per_second=1) as live:
        while True:
            ram_mb, ext_count = get_extension_host_memory()
            lat, tk, status = measure_latency()
            history.append((lat, tk, status, ram_mb, ext_count))
            table, panel = generate_dashboard(history)
            layout = Layout()
            layout.split_column(Layout(panel, size=6), Layout(table))
            live.update(layout)
            time.sleep(10) # SOTA: Evita Auto-DDOS (Respeita limite Free Tier de 15 RPM)

if __name__ == "__main__":
    main()