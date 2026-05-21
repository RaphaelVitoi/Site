import time
import collections
import os
import re
from pathlib import Path

try:
    from google import genai
    from rich.console import Console
    from rich.panel import Panel
except ImportError:
    print("[ERRO] Bibliotecas ausentes. Execute: pip install google-genai rich")
    exit(1)

console = Console()

# Coleta Dinamica SOTA da API Key
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

class VITOI_QuotaManager:
    def __init__(self, rpm_limit=15, tpm_limit=32000):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.request_history = collections.deque()
        self.token_history = collections.deque()
        self.safety_threshold = 0.8  # 80% de seguranca (Token Bucket)

    def check_quota(self, estimated_tokens=1000):
        now = time.time()
        
        # Limpa historico com mais de 60 segundos
        while self.request_history and now - self.request_history[0] > 60:
            self.request_history.popleft()
        while self.token_history and now - self.token_history[0][0] > 60:
            self.token_history.popleft()

        current_rpm = len(self.request_history)
        current_tpm = sum(t[1] for t in self.token_history)

        # Validacao de Seguranca Bayesiana
        if current_rpm >= self.rpm_limit * self.safety_threshold:
            return False, f"RPM critico: {current_rpm}/{self.rpm_limit}"
        if current_tpm + estimated_tokens >= self.tpm_limit * self.safety_threshold:
            return False, f"TPM critico: {current_tpm}/{self.tpm_limit}"
        
        return True, "OK"

    def log_request(self, tokens):
        self.request_history.append(time.time())
        self.token_history.append((time.time(), tokens))

def safe_generate_content(client, model_name, prompt, quota_manager):
    is_safe, reason = quota_manager.check_quota()
    
    if not is_safe:
        console.print(f"[bold red]🚫 CIRCUITO ABERTO:[/] {reason}. Pausando por 10s...")
        time.sleep(10)
        return None

    try:
        response = client.models.generate_content(model=model_name, contents=prompt)
        tokens = getattr(response.usage_metadata, 'total_token_count', len(prompt.split()) + 50)
        quota_manager.log_request(tokens)
        return response
    except Exception as e:
        if "429" in str(e):
            console.print("[bold white on red]🔥 CRITICAL 429:[/] Cota estourada no servidor Google.")
        return None

if __name__ == "__main__":
    api_key = load_api_key()
    client = genai.Client(api_key=api_key)
    quota = VITOI_QuotaManager(rpm_limit=15, tpm_limit=32000) # Ajustado para limite real Free Tier

    console.print(Panel("Iniciando Teste de Carga SOTA (Circuit Breaker VITOI 3.2)", border_style="cyan"))
    for i in range(5):
        res = safe_generate_content(client, 'gemini-2.5-flash', f"Gere uma pequena analise filosofica numero {i}", quota)
        if res:
            tokens = getattr(res.usage_metadata, 'total_token_count', 'N/A')
            console.print(f"Sessao {i+1}: Sucesso ({tokens} tokens)")
        time.sleep(2)