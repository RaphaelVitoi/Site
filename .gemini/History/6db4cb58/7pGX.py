# pylint: disable=missing-module-docstring, line-too-long, broad-exception-caught

import sys
import requests
from pathlib import Path

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent.parent))
from llm.budget import GEMINI_KEYS

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
MSG_AUTH_FAIL = "chave invalida, permissao ausente ou API nao habilitada no projeto."


def _print_root_cause(status_code: int):
    """Despacho O(1) de mapeamento causal para reduzir complexidade ciclomatica."""
    causes = {
        400: MSG_AUTH_FAIL,
        401: MSG_AUTH_FAIL,
        403: MSG_AUTH_FAIL,
        404: "endpoint/modelo inexistente para esta versao da API.",
        429: "limite de cota/rate limit atingido.",
    }
    if status_code in causes:
        print(f"  -> Causa provavel: {causes[status_code]}")
    elif status_code >= 500:
        print("  -> Causa provavel: indisponibilidade temporaria do servico remoto.")
    else:
        print("  -> Causa provavel: resposta inesperada da API.")


def _fetch_generate_model(api_key: str, headers: dict) -> str:
    """Extrai estritamente o modelo de geracao otimo e audita conexao primaria."""
    list_url = f"{BASE_URL}/models?key={api_key}"
    print("[INFO] Passo 1/2: validando chave e conectividade via ListModels...")
    list_resp = requests.get(list_url, headers=headers, timeout=15)
    print(f"[INFO] Status Code HTTP (ListModels): {list_resp.status_code}")

    if not list_resp.ok:
        print(f"[FALHA] ListModels retornou erro: {list_resp.text}")
        _print_root_cause(list_resp.status_code)
        return ""

    models = list_resp.json().get("models", [])
    if not models:
        print(
            "[FALHA] API respondeu sem modelos disponiveis.\n  -> Causa provavel: projeto sem acesso ao Gemini ou resposta incompleta."
        )
        return ""

    for model in models:
        if "generateContent" in model.get("supportedGenerationMethods", []):
            return model.get("name", "")

    print(
        "[FALHA] Nenhum modelo com suporte a generateContent foi encontrado.\n  -> Causa provavel: permissao de geracao ausente para esta chave/projeto."
    )
    return ""


def _test_generation(api_key: str, headers: dict, model_name: str) -> None:
    """Bypass secundario para validar a capacidade de sintese restrita do motor."""
    model_id = model_name.split("/")[-1]
    print(f"[INFO] Modelo selecionado para teste: {model_id}")

    gen_url = f"{BASE_URL}/models/{model_id}:generateContent?key={api_key}"
    gen_data = {"contents": [{"parts": [{"text": "ping"}]}]}
    print("[INFO] Passo 2/2: testando generateContent...")
    gen_resp = requests.post(gen_url, json=gen_data, headers=headers, timeout=15)  # type: ignore
    print(f"[INFO] Status Code HTTP (generateContent): {gen_resp.status_code}")

    if gen_resp.ok:
        print("[VITORIA] Chave valida e conectividade funcional para generateContent.")
        print(
            "  -> Se o worker falhar, o foco passa a ser runtime local (aiohttp/proxy/firewall)."
        )
    else:
        print(f"[FALHA] generateContent retornou erro: {gen_resp.text}")
        _print_root_cause(gen_resp.status_code)


def _handle_request_exception(e: Exception) -> None:
    """Captura e mapeia a arvore de excecoes em logica de dicionario iteravel."""
    error_map = {
        requests.exceptions.ProxyError: (
            "Erro de Proxy",
            "Seu sistema esta atras de um proxy, mas a configuracao esta incorreta ou bloqueando a conexao.",
        ),
        requests.exceptions.SSLError: (
            "Erro de SSL",
            "Problema com os certificados SSL/TLS locais (antivirus, firewall DPI, ou raiz obsoleta).",
        ),
        requests.exceptions.ConnectTimeout: (
            "Timeout de Conexao",
            "Firewall bloqueando saida na porta 443 ou falha em tabela de rotas BGP.",
        ),
        requests.exceptions.ConnectionError: (
            "Erro de Conexao Geral",
            "DNS sem resolucao ou isolamento total de rede local.",
        ),
    }
    for exc_type, (title, cause) in error_map.items():
        if isinstance(e, exc_type):
            print(f"[FALHA CRITICA] {title}: {e}\n  -> Causa provavel: {cause}")
            return
    print(f"[FALHA INESPERADA] Um erro nao previsto ocorreu: {e}")


def run_diagnostic(api_key):
    """Diagnostica conectividade e permissao da API Gemini sem assumir modelo fixo."""
    print(
        f"--- DIAGNOSTICO DE REDE SOTA ---\nAlvo: generativelanguage.googleapis.com\nChave: {api_key[:8]}...\n---------------------------------"
    )
    try:
        headers = {"Content-Type": "application/json"}
        selected_model = _fetch_generate_model(api_key, headers)
        if selected_model:
            _test_generation(api_key, headers, selected_model)
    except Exception as e:
        _handle_request_exception(e)


if __name__ == "__main__":
    if not GEMINI_KEYS:
        print(
            "[ERRO] Nenhuma chave Gemini encontrada no ambiente. Verifique seu _env.ps1 ou .env"
        )
        sys.exit(1)

    # Usa a primeira chave encontrada para o teste
    key_to_test = GEMINI_KEYS[0]
    run_diagnostic(key_to_test)
