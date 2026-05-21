import asyncio
import aiohttp
import re
from pathlib import Path

async def test_key(session, key, idx):
    await asyncio.sleep(idx * 1.5)  # SOTA: Atraso escalonado para evitar bloqueio de burst (Efeito Manada)
    mask = f"{key[:6]}...{key[-4:]}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    payload = {"contents": [{"parts": [{"text": "ping"}]}], "generationConfig": {"maxOutputTokens": 5}}

    try:
        async with session.post(url, json=payload, timeout=10) as resp:
            if resp.status == 200:
                print(f"[+] Chave {idx:02d} ({mask}) - ONLINE e Operante")
            elif resp.status == 429:
                try:
                    body = await resp.json()
                    detail = body.get("error", {}).get("message", "Sem detalhes")
                except Exception:
                    detail = "Falha ao extrair mensagem do Google"
                print(f"[!] Chave {idx:02d} ({mask}) - Rate Limit (HTTP 429): {detail}")
            elif resp.status == 400:
                print(f"[X] Chave {idx:02d} ({mask}) - Invalida (HTTP 400)")
            else:
                print(f"[X] Chave {idx:02d} ({mask}) - Erro HTTP {resp.status}")
    except Exception as e:
        print(f"[X] Chave {idx:02d} ({mask}) - Falha de conexao: {type(e).__name__}")

async def main():
    env_path = Path("_env.ps1")
    if not env_path.exists():
        print("Arquivo _env.ps1 nao encontrado na raiz.")
        return

    content = env_path.read_text(encoding="utf-8", errors="ignore")

    # SOTA: Ignora linhas comentadas e extrai apenas chaves ativas
    keys = []
    for line in content.splitlines():
        if line.strip().startswith("#"):
            continue
        match = re.search(r'\$env:GEMINI_[A-Z0-9_]+_KEY(?:_\d+)?\s*=\s*[\'"]([^\'"]+)[\'"]', line, re.IGNORECASE)
        if match:
            keys.append(match.group(1))

    keys_to_test = keys[-10:] if keys else []

    print(f"Testando as ultimas {len(keys_to_test)} chaves encontradas no _env.ps1...\n")
    async with aiohttp.ClientSession() as session:
        tasks = [test_key(session, key, i+1) for i, key in enumerate(keys_to_test)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
