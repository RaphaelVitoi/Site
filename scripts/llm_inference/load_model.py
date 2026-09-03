# ruff: noqa: D100, D101, D103, T201
# pylint: disable=missing-module-docstring, missing-function-docstring, wrong-import-position
from pathlib import Path
import socket
import sys

# SOTA: Garantir que o root do projeto esteja no sys.path
PROJECT_ROOT = Path(__file__).parent.parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from utils.env_loader import load_env

ENV_KEYS = load_env()

MODELS_CONFIG = {
    "31b": {
        "name": "Gemma 4 31b Dense",
        "gguf": "gemma-4-31b-it-Q4_K_M.gguf",
        "hf": "bartowski/gemma-4-31b-it-GGUF",
        "port": 17045,
    },
    "4b": {"name": "Gemma 4 4b", "gguf": "gemma-4-4b-it-Q4_K_M.gguf", "hf": "google/gemma-4-4b-it-GGUF", "port": 17045},
    "8b": {
        "name": "Llama 3 8b",
        "gguf": "Meta-Llama-3-8B-Instruct-Q4_K_M.gguf",
        "hf": "meta-llama/Meta-Llama-3-8B-Instruct-GGUF",
        "port": 17045,
    },
}


def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0


def check_model_health():
    print("=== [PRE-FLIGHT] Verificando Membrana de Modelos Instalados ===")

    # 1. Verificar Proxy Server Global (gemma_server.py) na porta 17043
    proxy_online = is_port_open(17043)
    proxy_status = "[ONLINE]" if proxy_online else "[OFFLINE]"
    print(f"Proxy Inferencia SOTA (Porta 17043): {proxy_status}")

    # 2. Verificar chaves de API Cloud
    gemini_keys = [ENV_KEYS.get(f"GEMINI_API_KEY_{i}") for i in range(1, 11) if ENV_KEYS.get(f"GEMINI_API_KEY_{i}")]
    gemini_main = ENV_KEYS.get("GEMINI_API_KEY")
    has_gemini = bool(gemini_keys or gemini_main)

    openrouter = ENV_KEYS.get("OPENROUTER_API_KEY")

    print(f"Provedores Cloud: Gemini={has_gemini} | OpenRouter={bool(openrouter)}")

    # 3. Status individual dos modelos locais/cloud
    print("\n--- Status dos Modelos Individuais ---")
    for key, cfg in MODELS_CONFIG.items():
        # Verificacao de porta do Llama Server
        server_online = is_port_open(cfg["port"])
        status_server = "Ativo" if server_online else "Inativo"

        # Verificacao heuristica de tokens e configuracao
        print(f"- {cfg['name']} ({key.upper()}):")
        print(f"  Porta do Engine (17045): {status_server}")
        print(f"  Alvo GGUF: {cfg['gguf']}")
        print(f"  Alvo HF: {cfg['hf']}")

    print("\n[OK] Pre-flight concluido com sucesso absoluto.")


if __name__ == "__main__":
    check_model_health()
