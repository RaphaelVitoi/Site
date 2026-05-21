import sys
import os
import json
import urllib.request
import urllib.error
from pathlib import Path

# Adiciona a raiz do projeto ao sys.path para importar o task_executor SOTA
sys.path.append(str(Path(__file__).parent.parent))

from task_executor import GEMINI_KEYS, ANTHROPIC_KEYS, OPENROUTER_KEYS

def test_gemini_sync(api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    data = {"contents": [{"parts": [{"text": "Responda apenas 'OK'"}]}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res['candidates'][0]['content']['parts'][0]['text'].strip()
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}"
    except Exception as e:
        return f"Erro nativo: {e}"

def test_anthropic_sync(api_key):
    url = "https://api.anthropic.com/v1/messages"
    data = {"model": "claude-3-haiku-20240307", "max_tokens": 10, "messages": [{"role": "user", "content": "Responda apenas 'OK'"}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json', 'x-api-key': api_key, 'anthropic-version': '2023-06-01'})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res['content'][0]['text'].strip()
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}"
    except Exception as e:
        return f"Erro nativo: {e}"

def audit_keys():
    print("=== [SECURITY CHIEF] PROTOCOLO DE AUDITORIA DE CHAVES API ===")
    print("Testando conectividade via motor nativo (urllib) para isolar aiohttp...\n")
    
    # 1. GEMINI
    print(f"[GEMINI] {len(GEMINI_KEYS)} chave(s) carregada(s).")
    for i, key in enumerate(GEMINI_KEYS):
        resp = test_gemini_sync(key)
        if "OK" in resp or "Erro nativo" not in resp and "HTTP " not in resp:
            print(f"  [+] Chave {i+1} ({key[:8]}...): SOTA (Ativa) -> {resp}")
        else:
            print(f"  [-] Chave {i+1} ({key[:8]}...): FALHA -> {resp}")

    # 2. ANTHROPIC
    print(f"\n[ANTHROPIC] {len(ANTHROPIC_KEYS)} chave(s) carregada(s).")
    for i, key in enumerate(ANTHROPIC_KEYS):
        resp = test_anthropic_sync(key)
        if "OK" in resp or "Erro nativo" not in resp and "HTTP " not in resp:
            print(f"  [+] Chave {i+1} ({key[:8]}...): SOTA (Ativa) -> {resp}")
        else:
            print(f"  [-] Chave {i+1} ({key[:8]}...): FALHA -> {resp}")
                
    print("\n=== AUDITORIA CONCLUIDA ===")

if __name__ == "__main__":
    audit_keys()