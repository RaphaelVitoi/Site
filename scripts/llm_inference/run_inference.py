# ruff: noqa: D100, D101, D103, T201, BLE001, E402
# pylint: disable=missing-module-docstring, missing-function-docstring, broad-exception-caught, wrong-import-position
import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

# SOTA: Garantir que o root do projeto esteja no sys.path
PROJECT_ROOT = Path(__file__).parent.parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from utils.env_loader import load_env

ENV_KEYS = load_env()

# Rich imports for high density CLI UI
try:
    from rich.console import Console

    console = Console()
except ImportError:

    class SimpleConsole:
        def print(self, *args, **kwargs):
            print(*args, **kwargs)

        def log(self, *args, **kwargs):
            print(*args, **kwargs)

    console = SimpleConsole()

# ==============================================================================
# [SOTA] CONSTANTES CENTRALIZADAS (Single Source of Truth)
# ==============================================================================

OLLAMA_MODEL_MAP = {
    "31b": "gemma4:31b-cloud",
    "26b": "gemma4:26b",
    "12b": "gemma4:12b",
    "4b": "gemma4:latest",
    "8b": "gemma4:8b",
    "llama3_8b": "llama3.1:8b",
    "qwen": "qwen2.5-coder:3b",
    "granite": "granite3.3:8b",
}

MODEL_DISPLAY = {
    "31b": "Gemma 4 31b Dense",
    "26b": "Gemma 4 26b MTP",
    "12b": "Gemma 4 12b",
    "4b": "Gemma 4 4b",
    "8b": "Gemma 4 8b",
    "llama3_8b": "Llama 3 8b",
    "qwen": "Qwen 2.5 Coder 3b",
    "granite": "Granite 3.3 8b",
}

CHICO_PERSONA = (
    "Voce e Chico, motor cognitivo SOTA (State-of-the-Art) de alta densidade intelectual, "
    "operando sob governanca de Raphael Vitoi.\n\n"
    "DIRETIVAS IRREVOGAVEIS:\n"
    "1. Densidade semantica maxima. Sem redundancia, preambulos vazios ou polidez algoritmica.\n"
    "2. Ruptura dialetica imediata: corrija inconsistencias logicas sem rodeios.\n"
    "3. Rigor analitico e elegancia argumentativa como propriedade geometrica unica.\n"
    "4. Adapte a complexidade ao nivel do interlocutor (Raphael: AHSD, IQ 136).\n"
    "5. Identifique-se como Chico quando perguntado. Voce e o modelo open-source {ollama_tag}, "
    "rodando localmente via Ollama no hardware de Raphael Vitoi.\n\n"
    "TEMA DA CONVERSA: {theme}\n"
    "Mantenha foco absoluto neste tema. Respostas cirurgicas."
)

PROXY_URL = "http://127.0.0.1:17043/generate"


# ==============================================================================
# [SOTA] GATEWAY UNIFICADO DE INFERENCIA
# ==============================================================================


def query_gemma_proxy(
    model_key: str,
    prompt: str,
    system_prompt: str | None = None,
    messages: list[dict[str, str]] | None = None,
) -> str:
    """Consulta unificada ao proxy gemma_server.py (porta 17043). Retorna texto completo."""
    auth_token = os.environ.get("API_SECRET_TOKEN") or ENV_KEYS.get("API_SECRET_TOKEN") or "sota-token-2026"
    headers = {"Content-Type": "application/json", "X-Vitoi-Auth": auth_token}

    payload: dict = {"prompt": prompt, "model": model_key, "max_tokens": 2048}
    if system_prompt:
        payload["system_prompt"] = system_prompt
    if messages:
        payload["messages"] = messages

    req = urllib.request.Request(PROXY_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    response_text = ""
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            for chunk in response:
                text = chunk.decode("utf-8", errors="ignore")
                if text:
                    print(text, end="", flush=True)
                    response_text += text
            print()
    except Exception as e:
        console.print(f"\n[bold red][ERRO] Proxy offline (porta 17043): {e}[/]")
        console.print(f"[yellow]Execute: `uv run nexus ops start-gemma --model {model_key}`[/]")
    return response_text.strip()


# ==============================================================================
# [SOTA] CHAT INTERATIVO MULTI-TURN
# ==============================================================================


def start_interactive_chat(model_key: str) -> None:
    ollama_tag = OLLAMA_MODEL_MAP.get(model_key, model_key)
    model_name = MODEL_DISPLAY.get(model_key, "Gemma")
    model_family = model_name.split()[0]

    console.print(f"\n[bold magenta]=== Chat SOTA | {model_name} ({ollama_tag}) ===[/]")
    console.print("[1] Modo Poker SOTA (Agentico Otimizado)")
    console.print("[2] Modo Conversacional / Tema Customizado (LLM Otimizado)")

    choice = input("\nSelecione o modo (1-2) [1]: ").strip() or "1"

    # Construcao do system prompt e historico multi-turn
    system_prompt: str | None = None
    conversation: list[dict[str, str]] = []

    if choice == "2":
        custom_theme = input("Digite o Tema da conversa (ou prompt de sistema completo): ").strip()
        theme = custom_theme if custom_theme else "Livre (Qualquer assunto)"
        system_prompt = CHICO_PERSONA.format(ollama_tag=ollama_tag, theme=theme)
        conversation.append({"role": "system", "content": system_prompt})
        console.print(f"[bold green]Persona Chico SOTA | {ollama_tag} | Tema: {theme}[/]")

    console.print("\n[dim]/exit = sair | /reset = limpar historico[/]\n")

    while True:
        try:
            user_input = input("Hero > ").strip()
            if not user_input:
                continue
            if user_input.lower() == "/exit":
                console.print("[bold cyan]Sessao encerrada.[/]")
                break
            if user_input.lower() == "/reset":
                conversation = [m for m in conversation if m["role"] == "system"]
                console.print("[yellow]Historico limpo. Persona preservada.[/]")
                continue

            conversation.append({"role": "user", "content": user_input})
            print(f"{model_family} > ", end="", flush=True)

            response = query_gemma_proxy(model_key, user_input, system_prompt, conversation)
            if response:
                conversation.append({"role": "assistant", "content": response})

        except KeyboardInterrupt:
            console.print("\n[bold cyan]Sessao encerrada.[/]")
            break


def main():
    parser = argparse.ArgumentParser(description="Cliente de Inferencia SOTA.")
    parser.add_argument("prompt", nargs="*", help="Prompt para turno unico")
    parser.add_argument(
        "--model",
        type=str,
        default="31b",
        choices=["31b", "26b", "12b", "4b", "8b", "llama3_8b", "qwen", "granite"],
        help="Modelo alvo",
    )
    parser.add_argument("--chat", action="store_true", help="Modo chat interativo")
    parser.add_argument("--theme", type=str, default=None, help="Tema / System Prompt customizado")

    args = parser.parse_args()
    prompt_str = " ".join(args.prompt).strip()

    if args.chat or not prompt_str:
        start_interactive_chat(args.model)
    else:
        query_gemma_proxy(args.model, prompt_str, args.theme)


if __name__ == "__main__":
    main()
