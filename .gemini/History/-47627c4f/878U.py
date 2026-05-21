import os
import sys
import requests
import json
from pathlib import Path

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent.parent))
from task_executor import GEMINI_KEYS

def run_diagnostic(api_key):
    """Tenta uma conexao simples e direta com a API do Gemini usando a biblioteca requests."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {"contents": [{"parts": [{"text": "ping"}]}]}
    
    print(f"--- DIAGNOSTICO DE REDE SOTA ---")
    print(f"Alvo: generativelanguage.googleapis.com")
    print(f"Chave: {api_key[:8]}...")
    print(f"---------------------------------")
    
    try:
        print("[INFO] Tentando conexao direta...")
        response = requests.post(url, json=data, headers=headers, timeout=15)
        
        print(f"[INFO] Status Code HTTP: {response.status_code}")
        
        if response.ok:
            print("[VITORIA] Conexao bem-sucedida. A API respondeu.")
            print("  -> Causa provavel do problema: Configuracao do aiohttp/asyncio no worker.")
        else:
            print(f"[FALHA] A API respondeu com um erro: {response.text}")
            print("  -> Causa provavel do problema: Chave de API invalida ou sem permissoes.")
            
    except requests.exceptions.ProxyError as e:
        print(f"[FALHA CRITICA] Erro de Proxy: {e}")
        print("  -> Causa provavel: Seu sistema esta atras de um proxy, mas a configuracao (variaveis de ambiente HTTP_PROXY/HTTPS_PROXY) esta incorreta ou o proxy esta bloqueando a conexao.")
        
    except requests.exceptions.SSLError as e:
        print(f"[FALHA CRITICA] Erro de SSL: {e}")
        print("  -> Causa provavel: Problema com os certificados SSL/TLS da sua maquina. Pode ser um antivirus, firewall com 'SSL inspection' ou certificados raiz desatualizados.")
        
    except requests.exceptions.ConnectTimeout as e:
        print(f"[FALHA CRITICA] Timeout de Conexao: {e}")
        print("  -> Causa provavel: Um firewall (local ou de rede) esta bloqueando a conexao com os servidores do Google na porta 443, ou ha um problema de rota de rede.")
        
    except requests.exceptions.ConnectionError as e:
        print(f"[FALHA CRITICA] Erro de Conexao Geral: {e}")
        print("  -> Causa provavel: Problema de DNS (nao consegue resolver o nome do host) ou bloqueio de rede geral.")
        
    except Exception as e:
        print(f"[FALHA INESPERADA] Um erro nao previsto ocorreu: {e}")

if __name__ == "__main__":
    if not GEMINI_KEYS:
        print("[ERRO] Nenhuma chave Gemini encontrada no ambiente. Verifique seu _env.ps1 ou .env")
        sys.exit(1)
        
    # Usa a primeira chave encontrada para o teste
    key_to_test = GEMINI_KEYS[0]
    run_diagnostic(key_to_test)