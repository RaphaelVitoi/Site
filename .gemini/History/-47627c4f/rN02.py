import os
import sys
import requests
import json
from pathlib import Path

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent.parent))
from task_executor import GEMINI_KEYS

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"


def _print_root_cause(status_code: int):
    if status_code in (400, 401, 403):
        print("  -> Causa provavel: chave invalida, permissao ausente ou API nao habilitada no projeto.")
    elif status_code == 404:
        print("  -> Causa provavel: endpoint/modelo inexistente para esta versao da API.")
    elif status_code == 429:
        print("  -> Causa provavel: limite de cota/rate limit atingido.")
    """Despacho O(1) de mapeamento causal para reduzir complexidade ciclomatica."""
    causes = {
        400: "chave invalida, permissao ausente ou API nao habilitada no projeto.",
        401: "chave invalida, permissao ausente ou API nao habilitada no projeto.",
        403: "chave invalida, permissao ausente ou API nao habilitada no projeto.",
        404: "endpoint/modelo inexistente para esta versao da API.",
        429: "limite de cota/rate limit atingido."
    }
    if status_code in causes:
        print(f"  -> Causa provavel: {causes[status_code]}")
    elif status_code >= 500:
        print("  -> Causa provavel: indisponibilidade temporaria do servico remoto.")
    else:
        print("  -> Causa provavel: resposta inesperada da API.")

def run_diagnostic(api_key):
    """Diagnostica conectividade e permissao da API Gemini sem assumir modelo fixo."""
    print(f"--- DIAGNOSTICO DE REDE SOTA ---")
    print(f"Alvo: generativelanguage.googleapis.com")
    print(f"Chave: {api_key[:8]}...")
    print(f"---------------------------------")
def _fetch_generate_model(api_key: str, headers: dict) -> str:
    """Extrai estritamente o modelo de geracao otimo e audita conexao primaria."""
    list_url = f"{BASE_URL}/models?key={api_key}"
    print("[INFO] Passo 1/2: validando chave e conectividade via ListModels...")
    list_resp = requests.get(list_url, headers=headers, timeout=15)
    print(f"[INFO] Status Code HTTP (ListModels): {list_resp.status_code}")

    try:
        headers = {"Content-Type": "application/json"}
        list_url = f"{BASE_URL}/models?key={api_key}"
        print("[INFO] Passo 1/2: validando chave e conectividade via ListModels...")
        list_resp = requests.get(list_url, headers=headers, timeout=15)
        print(f"[INFO] Status Code HTTP (ListModels): {list_resp.status_code}")
    if not list_resp.ok:
        print(f"[FALHA] ListModels retornou erro: {list_resp.text}")
        _print_root_cause(list_resp.status_code)
        return ""

        if not list_resp.ok:
            print(f"[FALHA] ListModels retornou erro: {list_resp.text}")
            _print_root_cause(list_resp.status_code)
            return
    models = list_resp.json().get("models", [])
    if not models:
        print("[FALHA] API respondeu sem modelos disponiveis.\n  -> Causa provavel: projeto sem acesso ao Gemini ou resposta incompleta.")
        return ""

        payload = list_resp.json()
        models = payload.get("models", [])
        if not models:
            print("[FALHA] API respondeu sem modelos disponiveis.")
            print("  -> Causa provavel: projeto sem acesso ao Gemini ou resposta incompleta.")
            return
    for model in models:
        if "generateContent" in model.get("supportedGenerationMethods", []):
            return model.get("name", "")

        # Seleciona um modelo que suporte generateContent para evitar falso negativo por modelo obsoleto.
        selected_model = None
        for model in models:
            methods = model.get("supportedGenerationMethods", [])
            if "generateContent" in methods:
                selected_model = model.get("name", "")
                break
    print("[FALHA] Nenhum modelo com suporte a generateContent foi encontrado.\n  -> Causa provavel: permissao de geracao ausente para esta chave/projeto.")
    return ""

        if not selected_model:
            print("[FALHA] Nenhum modelo com suporte a generateContent foi encontrado.")
            print("  -> Causa provavel: permissao de geracao ausente para esta chave/projeto.")
            return
def _test_generation(api_key: str, headers: dict, model_name: str) -> None:
    """Bypass secundario para validar a capacidade de sintese restrita do motor."""
    model_id = model_name.split("/")[-1]
    print(f"[INFO] Modelo selecionado para teste: {model_id}")

        model_id = selected_model.split("/")[-1]
        print(f"[INFO] Modelo selecionado para teste: {model_id}")
    gen_url = f"{BASE_URL}/models/{model_id}:generateContent?key={api_key}"
    gen_data = {"contents": [{"parts": [{"text": "ping"}]}]}
    print("[INFO] Passo 2/2: testando generateContent...")
    gen_resp = requests.post(gen_url, json=gen_data, headers=headers, timeout=15)
    print(f"[INFO] Status Code HTTP (generateContent): {gen_resp.status_code}")

        gen_url = f"{BASE_URL}/models/{model_id}:generateContent?key={api_key}"
        gen_data = {"contents": [{"parts": [{"text": "ping"}]}]}
        print("[INFO] Passo 2/2: testando generateContent...")
        gen_resp = requests.post(gen_url, json=gen_data, headers=headers, timeout=15)
        print(f"[INFO] Status Code HTTP (generateContent): {gen_resp.status_code}")
    if gen_resp.ok:
        print("[VITORIA] Chave valida e conectividade funcional para generateContent.")
        print("  -> Se o worker falhar, o foco passa a ser runtime local (aiohttp/proxy/firewall).")
    else:
        print(f"[FALHA] generateContent retornou erro: {gen_resp.text}")
        _print_root_cause(gen_resp.status_code)

        if gen_resp.ok:
            print("[VITORIA] Chave valida e conectividade funcional para generateContent.")
            print("  -> Se o worker falhar, o foco passa a ser runtime local (aiohttp/proxy/firewall).")
        else:
            print(f"[FALHA] generateContent retornou erro: {gen_resp.text}")
            _print_root_cause(gen_resp.status_code)
def _handle_request_exception(e: Exception) -> None:
    """Captura e mapeia a arvore de excecoes em logica de dicionario iteravel."""
    error_map = {
        requests.exceptions.ProxyError: ("Erro de Proxy", "Seu sistema esta atras de um proxy, mas a configuracao esta incorreta ou bloqueando a conexao."),
        requests.exceptions.SSLError: ("Erro de SSL", "Problema com os certificados SSL/TLS locais (antivirus, firewall DPI, ou raiz obsoleta)."),
        requests.exceptions.ConnectTimeout: ("Timeout de Conexao", "Firewall bloqueando saida na porta 443 ou falha em tabela de rotas BGP."),
        requests.exceptions.ConnectionError: ("Erro de Conexao Geral", "DNS sem resolucao ou isolamento total de rede local.")
    }
    for exc_type, (title, cause) in error_map.items():
        if isinstance(e, exc_type):
            print(f"[FALHA CRITICA] {title}: {e}\n  -> Causa provavel: {cause}")
            return
    print(f"[FALHA INESPERADA] Um erro nao previsto ocorreu: {e}")

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

def run_diagnostic(api_key):
    """Diagnostica conectividade e permissao da API Gemini sem assumir modelo fixo."""
    print(f"--- DIAGNOSTICO DE REDE SOTA ---\nAlvo: generativelanguage.googleapis.com\nChave: {api_key[:8]}...\n---------------------------------")
    try:
        headers = {"Content-Type": "application/json"}
        selected_model = _fetch_generate_model(api_key, headers)
        if selected_model:
            _test_generation(api_key, headers, selected_model)
    except Exception as e:
        print(f"[FALHA INESPERADA] Um erro nao previsto ocorreu: {e}")
        _handle_request_exception(e)

if __name__ == "__main__":
    if not GEMINI_KEYS:
        print("[ERRO] Nenhuma chave Gemini encontrada no ambiente. Verifique seu _env.ps1 ou .env")
        sys.exit(1)

    # Usa a primeira chave encontrada para o teste
    key_to_test = GEMINI_KEYS[0]
    run_diagnostic(key_to_test)
