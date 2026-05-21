import sys
import os
from pathlib import Path
import asyncio
import aiohttp

# Adiciona a raiz do projeto ao sys.path para importar o task_executor SOTA
sys.path.append(str(Path(__file__).parent.parent))

from task_executor import GEMINI_KEYS, ANTHROPIC_KEYS, OPENROUTER_KEYS, call_gemini, call_anthropic, call_openrouter

async def audit_keys():
    print("=== [SECURITY CHIEF] PROTOCOLO DE AUDITORIA DE CHAVES API ===")
    print("Testando conectividade e validade das chaves carregadas...\n")
    
    # trust_env=True acata proxies e VPNs do Windows.
    # ssl=False ignora temporariamente o bloqueio de certificados do seu Antivirus.
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector, trust_env=True) as session:
        # 1. GEMINI
        print(f"[GEMINI] {len(GEMINI_KEYS)} chave(s) carregada(s).")
        for i, key in enumerate(GEMINI_KEYS):
            try:
                resp, _ = await call_gemini(session, "gemini-1.5-flash-latest", "Responda apenas 'OK'", "Teste de ping.", key)
                print(f"  [+] Chave {i+1} ({key[:8]}...): SOTA (Ativa) -> {resp.strip()}")
            except Exception as e:
                print(f"  [-] Chave {i+1} ({key[:8]}...): FALHA -> {e}")

        # 2. ANTHROPIC
        print(f"\n[ANTHROPIC] {len(ANTHROPIC_KEYS)} chave(s) carregada(s).")
        for i, key in enumerate(ANTHROPIC_KEYS):
            try:
                resp, _ = await call_anthropic(session, "claude-3-haiku-20240307", "Responda apenas 'OK'", "Teste de ping.", key)
                print(f"  [+] Chave {i+1} ({key[:8]}...): SOTA (Ativa) -> {resp.strip()}")
            except Exception as e:
                print(f"  [-] Chave {i+1} ({key[:8]}...): FALHA -> {e}")

        # 3. OPENROUTER
        print(f"\n[OPENROUTER] {len(OPENROUTER_KEYS)} chave(s) carregada(s).")
        for i, key in enumerate(OPENROUTER_KEYS):
            try:
                resp, _ = await call_openrouter(session, "google/gemini-flash-1.5", "Responda apenas 'OK'", "Teste de ping.", key)
                print(f"  [+] Chave {i+1} ({key[:8]}...): SOTA (Ativa) -> {resp.strip()}")
            except Exception as e:
                print(f"  [-] Chave {i+1} ({key[:8]}...): FALHA -> {e}")
                
    print("\n=== AUDITORIA CONCLUIDA ===")

if __name__ == "__main__":
    # Corrige RuntimeError no Windows com aiohttp
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(audit_keys())