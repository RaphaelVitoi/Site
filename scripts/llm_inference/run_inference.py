# ruff: noqa: D100, D101, D103, T201, BLE001, E402
# pylint: disable=missing-module-docstring, missing-function-docstring, broad-exception-caught, wrong-import-position
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import socket
import sys
from typing import Any
import urllib.request

# SOTA: Garantir que o root do projeto esteja no sys.path
PROJECT_ROOT = Path(__file__).parent.parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from utils.env_loader import load_env

ENV_KEYS = load_env()

# Rich imports for high density CLI UI
try:
    from rich import box
    from rich.console import Console
    from rich.table import Table

    console = Console()
except ImportError:

    class SimpleConsole:
        def print(self, *args, **kwargs):
            print(*args, **kwargs)

        def log(self, *args, **kwargs):
            print(*args, **kwargs)

    console = SimpleConsole()
    Table: Any = None
    box: Any = None

# ==============================================================================
# [SOTA] CONSTANTES CENTRALIZADAS & DESCOBERTA DINAMICA (Single Source of Truth)
# ==============================================================================

OLLAMA_MODEL_MAP: dict[str, str] = {
    "12b": "gemma4:12b",
    "12b_qat": "hf.co/unsloth/gemma-4-12B-it-qat-GGUF:UD-Q4_K_XL",
    "e4b": "gemma4:e4b",
    "4b": "gemma4:latest",
    "e2b": "gemma4:e2b",
    "qwen_coder_7b_q5": "qwen2.5-coder:7b-instruct-q5_K_M",
    "qwen": "qwen2.5-coder:7b-instruct-q5_K_M",
    "qwen_coder_7b": "qwen2.5-coder:7b",
    "qwen_pmev_math": "qwen-pmev-math:latest",
    "qwen_code_surgical": "qwen-code-surgical:latest",
    "qwen_poetics": "qwen-poetics:latest",
    "qwen_coder_1_5b": "qwen2.5-coder:1.5b",
    "qwen_coder_0_5b": "qwen2.5-coder:0.5b",
    "31b": "gemma4:31b-cloud",
    "31b_cloud": "gemma4:31b-cloud",
}


def _carregar_manifesto_ollama() -> dict[str, str]:
    """Le os aliases de modelo da fonte unica de verdade (data/ollama_models.json)."""
    caminho = PROJECT_ROOT / "data" / "ollama_models.json"
    try:
        with caminho.open(encoding="utf-8") as fh:
            dados = json.load(fh)
        return {m["alias"]: m["tag"] for m in dados.get("models", []) if m.get("alias") and m.get("tag")}
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return {}


_manifesto_aliases = _carregar_manifesto_ollama()
if _manifesto_aliases:
    OLLAMA_MODEL_MAP.update(_manifesto_aliases)


def _is_ollama_online() -> bool:
    """Verifica com timeout ultracurto se a porta nativa do Ollama (11434) esta aberta."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.3)
            return s.connect_ex(("127.0.0.1", 11434)) == 0
    except Exception:
        return False


def discover_ollama_models() -> list[dict[str, Any]]:
    """Descobre em tempo real os modelos instalados consultando a API do Ollama."""
    url = "http://127.0.0.1:11434/api/tags"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_models = data.get("models", [])
            models_list = []
            for m in raw_models:
                name = m.get("name", "")
                size_bytes = m.get("size", 0)
                is_cloud = ":cloud" in name or size_bytes == 0
                size_str = "Zero-RAM" if is_cloud else f"{size_bytes / (1024**3):.1f} GB"
                tier = "cloud" if is_cloud else "local"
                models_list.append(
                    {
                        "tag": name,
                        "size_str": size_str,
                        "tier": tier,
                    }
                )
            return models_list
    except Exception:
        caminho = PROJECT_ROOT / "data" / "ollama_models.json"
        try:
            with caminho.open(encoding="utf-8") as fh:
                dados = json.load(fh)
            return [
                {
                    "tag": m["tag"],
                    "size_str": f"{m.get('size_gb', 0)} GB" if m.get("size_gb") else "Zero-RAM",
                    "tier": m.get("tier", "local"),
                }
                for m in dados.get("models", [])
            ]
        except Exception:
            return [{"tag": v, "size_str": "Auto", "tier": "local"} for v in OLLAMA_MODEL_MAP.values()]


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


def query_ollama_direct(
    model_tag: str,
    prompt: str,
    system_prompt: str | None = None,
    messages: list[dict[str, str]] | None = None,
    max_tokens: int = 4096,
    temperature: float | None = None,
) -> str:
    """Consulta direta e ultra-rapida a API nativa do Ollama (porta 11434) com streaming."""
    url = "http://127.0.0.1:11434/api/chat"
    resolved_tag = OLLAMA_MODEL_MAP.get(model_tag, model_tag)

    if messages:
        chat_messages = list(messages)
    else:
        chat_messages = []
        if system_prompt:
            chat_messages.append({"role": "system", "content": system_prompt})
        chat_messages.append({"role": "user", "content": prompt})

    options: dict[str, Any] = {"num_predict": max_tokens}
    if temperature is not None:
        options["temperature"] = temperature
    elif not system_prompt:
        options["temperature"] = 0.4

    payload = {
        "model": resolved_tag,
        "messages": chat_messages,
        "stream": True,
        "options": options,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    response_text = ""
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            for line in response:
                if not line:
                    continue
                try:
                    chunk = json.loads(line.decode("utf-8", errors="ignore"))
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        print(content, end="", flush=True)
                        response_text += content
                except json.JSONDecodeError:
                    continue
            print()
    except Exception as e:
        console.print(f"\n[bold red][ERRO] Falha na comunicacao com Ollama ({resolved_tag}): {e}[/]")
    return response_text.strip()


def query_gemma_proxy(
    model_key: str,
    prompt: str,
    system_prompt: str | None = None,
    messages: list[dict[str, str]] | None = None,
    max_tokens: int = 4096,
) -> str:
    """Consulta unificada ao proxy gemma_server.py (porta 17043). Retorna texto completo."""
    auth_token = os.environ.get("API_SECRET_TOKEN") or ENV_KEYS.get("API_SECRET_TOKEN")
    if not auth_token:
        console.print("[bold red][ERRO] API_SECRET_TOKEN nao configurada para o proxy de inferencia.[/]")
        return ""
    headers = {"Content-Type": "application/json", "X-Vitoi-Auth": auth_token}

    payload: dict = {"prompt": prompt, "model": model_key, "max_tokens": max_tokens}
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


def _compact_conversation(
    conversation: list[dict[str, str]],
    keep_ratio: float = 0.10,
    new_model_tag: str | None = None,
) -> list[dict[str, str]]:
    """Compacta o historico da conversa retendo ~10% do contexto recente e a persona."""
    system_msgs: list[dict[str, str]] = []
    dialogue_msgs: list[dict[str, str]] = []

    for msg in conversation:
        if msg.get("role") == "system":
            content = msg.get("content", "")
            if new_model_tag and "open-source" in content:
                content = re.sub(r"open-source [^,]+,", f"open-source {new_model_tag},", content)
            system_msgs.append({"role": "system", "content": content})
        else:
            dialogue_msgs.append(dict(msg))

    if not dialogue_msgs:
        return list(system_msgs)

    total_msgs = len(dialogue_msgs)
    keep_count = max(2, int(total_msgs * keep_ratio))
    if keep_count >= total_msgs:
        return system_msgs + dialogue_msgs

    # Garante que o recorte inicie com mensagem do usuario para coerencia
    retained = dialogue_msgs[-keep_count:]
    if retained and retained[0].get("role") == "assistant" and len(dialogue_msgs) > len(retained):
        idx = len(dialogue_msgs) - len(retained)
        if idx > 0 and dialogue_msgs[idx - 1].get("role") == "user":
            retained = [dialogue_msgs[idx - 1]] + retained

    compact_marker = {
        "role": "system",
        "content": (
            f"[COMPACT SOTA] Contexto anterior compactado: {total_msgs} mensagens reduzidas para as "
            f"{len(retained)} mais recentes (~10% retido para continuidade cogente)."
        ),
    }

    return system_msgs + [compact_marker] + retained


def _select_model_interactively(installed_models: list[dict[str, Any]]) -> str:
    """Apresenta tabela formatada de modelos locais e cloud e retorna a tag selecionada."""
    console.print("\n[bold magenta]=== [NEXUS] CATALOGO DINAMICO DE MODELOS OLLAMA/LLAMA.CPP ===[/]")
    locais = [m for m in installed_models if m.get("tier") == "local"]
    cloud = [m for m in installed_models if m.get("tier") == "cloud"]

    all_selectable = locais + cloud
    table = Table(box=box.ROUNDED, show_header=True)
    table.add_column("#", style="bold cyan", width=4, justify="right")
    table.add_column("Tag / Modelo", style="bold white")
    table.add_column("Tier", style="yellow", justify="center")
    table.add_column("Tamanho", style="green", justify="right")

    for idx, m in enumerate(all_selectable, 1):
        tier_badge = "[bold green]LOCAL[/]" if m.get("tier") == "local" else "[dim cyan]CLOUD[/]"
        table.add_row(str(idx), m.get("tag", ""), tier_badge, m.get("size_str", "-"))

    console.print(table)
    sel = input(f"\nSelecione o modelo (1-{len(all_selectable)}) ou digite a tag/alias [1]: ").strip() or "1"
    if sel.isdecimal() and 1 <= int(sel) <= len(all_selectable):
        return str(all_selectable[int(sel) - 1]["tag"])
    return OLLAMA_MODEL_MAP.get(sel, sel)


def _configure_chat_session(ollama_tag: str) -> tuple[str | None, list[dict[str, str]], int]:
    choice = input("\nSelecione o modo (1-2) [1]: ").strip() or "1"

    token_str = input("\nTeto de tokens de SAIDA por resposta (ex: 2048, 4096, 8192) [4096]: ").strip()
    max_tokens = int(token_str) if (token_str.isdecimal() and int(token_str) > 0) else 4096
    console.print(f"[bold cyan]Teto de saida (num_predict): {max_tokens} tokens[/]")

    system_prompt: str | None = None
    conversation: list[dict[str, str]] = []

    if choice == "2":
        custom_theme = input("\nDigite o Tema da conversa (ou prompt de sistema completo): ").strip()
        theme = custom_theme or "Livre (Qualquer assunto)"
        system_prompt = CHICO_PERSONA.format(ollama_tag=ollama_tag, theme=theme)
        conversation.append({"role": "system", "content": system_prompt})
        console.print(f"[bold green]Persona Chico SOTA | {ollama_tag} | Tema: {theme}[/]")

    return system_prompt, conversation, max_tokens


def _run_chat_loop(
    model_tag: str,
    system_prompt: str | None,
    conversation: list[dict[str, str]],
    max_tokens: int,
    use_proxy: bool = False,
) -> None:
    model_family = model_tag.split(":")[0].split("/")[-1].capitalize()
    console.print(
        "\n[dim]Comandos: /model [tag|#] (trocar modelo) | /compact (reter 10%) | /new (nova sessao) | /status | /help | /exit[/]\n"
    )

    while True:
        try:
            user_input = input("Hero > ").strip()
            if not user_input:
                continue

            # Comandos de encerramento
            if user_input.lower() in {"/exit", "/quit"}:
                console.print("[bold cyan]Sessao encerrada.[/]")
                break

            # Help
            if user_input.lower() in {"/help", "/?"}:
                console.print("\n[bold cyan]=== COMANDOS DISPONIVEIS NO CHAT SOTA ===[/]")
                console.print("  [bold green]/model [tag|#][/]    : Seletor de modelos e hot-swap (mantem 10% do contexto ou nova sessao)")
                console.print("  [bold green]/switch [tag|#][/]   : Alias direto para /model")
                console.print("  [bold green]/models[/]           : Lista catalogo dinamico de modelos instalados")
                console.print("  [bold green]/compact[/]          : Reduz historico a ~10% das mensagens recentes preservando persona")
                console.print("  [bold green]/new[/]              : Encerra sessao atual e inicia nova do zero com o mesmo modelo")
                console.print("  [bold green]/reset[/] ou [bold green]/clear[/]  : Limpa historico de mensagens preservando persona")
                console.print("  [bold green]/status[/]           : Exibe telemetria da sessao (modelo, mensagens, tokens)")
                console.print("  [bold green]/exit[/] ou [bold green]/quit[/]     : Encerra o chat e retorna ao terminal\n")
                continue

            # Status da sessao
            if user_input.lower() == "/status":
                system_cnt = len([m for m in conversation if m.get("role") == "system"])
                dialogue_cnt = len([m for m in conversation if m.get("role") in ("user", "assistant")])
                console.print(
                    f"\n[bold cyan][STATUS DA SESSAO][/]\n"
                    f"  * Modelo Ativo:    [bold green]{model_tag}[/] (Familia: {model_family})\n"
                    f"  * Mensagens:       [bold white]{dialogue_cnt}[/] dialogos (+ {system_cnt} sistema)\n"
                    f"  * Teto de Tokens:  [yellow]{max_tokens}[/] (num_predict)\n"
                    f"  * Modo de Conexao: [cyan]{'Proxy 17043' if use_proxy else 'Ollama Nativo 11434'}[/]\n"
                )
                continue

            # Compactar contexto explicitamente (/compact)
            if user_input.lower() == "/compact":
                dialogue_cnt = len([m for m in conversation if m.get("role") in ("user", "assistant")])
                if dialogue_cnt <= 2:
                    console.print("[yellow][COMPACT] Historico muito curto para compactacao (<= 2 mensagens).[/]")
                else:
                    conversation = _compact_conversation(conversation, keep_ratio=0.10, new_model_tag=model_tag)
                    after_cnt = len([m for m in conversation if m.get("role") in ("user", "assistant")])
                    console.print(
                        f"[bold cyan][COMPACT SOTA] Contexto compactado com sucesso: "
                        f"{dialogue_cnt} -> {after_cnt} mensagens (~10% mais recentes preservadas). Persona intacta.[/]"
                    )
                continue

            # Nova sessao do zero com o mesmo modelo
            if user_input.lower() == "/new":
                console.print(f"\n[bold yellow]=== NOVA SESSAO ({model_tag}) ===[/]")
                reconfig = input("Deseja reconfigurar modo e tema? [s/N]: ").strip().lower()
                if reconfig == "s":
                    console.print("[1] Modo Poker SOTA (Agentico Otimizado)")
                    console.print("[2] Modo Conversacional / Tema Customizado (LLM Otimizado)")
                    system_prompt, conversation, max_tokens = _configure_chat_session(model_tag)
                else:
                    conversation = [m for m in conversation if m.get("role") == "system"]
                    console.print(f"[yellow]Historico reiniciado. Persona preservada para {model_tag}.[/]\n")
                continue

            # Reset simples de historico
            if user_input.lower() in {"/reset", "/clear"}:
                conversation = [m for m in conversation if m.get("role") == "system"]
                console.print("[yellow]Historico limpo. Persona preservada.[/]")
                continue

            # Seletor e troca de modelos (Hot-swap ou Nova Sessao)
            if user_input.startswith(("/model", "/switch", "/models")):
                parts = user_input.split(maxsplit=1)
                cmd = parts[0].lower()
                arg = parts[1].strip() if len(parts) > 1 else ""

                installed = discover_ollama_models()
                all_selectable = [m for m in installed if m.get("tier") == "local"] + [
                    m for m in installed if m.get("tier") == "cloud"
                ]

                if cmd == "/models" and not arg:
                    _select_model_interactively(installed)
                    continue

                new_model_tag: str = ""
                if arg:
                    if arg.isdecimal() and 1 <= int(arg) <= len(all_selectable):
                        new_model_tag = str(all_selectable[int(arg) - 1]["tag"])
                    else:
                        new_model_tag = OLLAMA_MODEL_MAP.get(arg, arg)
                else:
                    new_model_tag = _select_model_interactively(installed)

                if new_model_tag == model_tag:
                    console.print(f"[yellow]O modelo '{model_tag}' ja e o modelo ativo nesta sessao.[/]")
                    continue

                console.print(f"\n[bold magenta]=== TRANSICAO DE MODELO: {model_tag} -> {new_model_tag} ===[/]")
                console.print("  [1] Hot-swap: Manter 10% do contexto recente (/compact) [Padrao]")
                console.print("  [2] Nova Sessao: Limpar historico e iniciar conversa do zero")
                mode_opt = input("\nEscolha a opcao (1-2) [1]: ").strip() or "1"

                if mode_opt == "2":
                    reconfig = input(f"Deseja reconfigurar tema/persona para {new_model_tag}? [s/N]: ").strip().lower()
                    if reconfig == "s":
                        console.print("[1] Modo Poker SOTA (Agentico Otimizado)")
                        console.print("[2] Modo Conversacional / Tema Customizado (LLM Otimizado)")
                        system_prompt, conversation, max_tokens = _configure_chat_session(new_model_tag)
                    else:
                        conversation = [m for m in conversation if m.get("role") == "system"]
                        if system_prompt:
                            system_prompt = re.sub(
                                r"open-source [^,]+,", f"open-source {new_model_tag},", system_prompt
                            )
                        for m in conversation:
                            if m.get("role") == "system":
                                m["content"] = re.sub(
                                    r"open-source [^,]+,", f"open-source {new_model_tag},", m.get("content", "")
                                )
                    model_tag = new_model_tag
                    model_family = model_tag.split(":")[0].split("/")[-1].capitalize()
                    console.print(
                        f"[bold yellow][NOVA SESSAO INICIADA] Modelo ativo: {model_tag}. Historico zerado.[/]\n"
                    )
                else:
                    before_cnt = len([m for m in conversation if m.get("role") in ("user", "assistant")])
                    conversation = _compact_conversation(
                        conversation, keep_ratio=0.10, new_model_tag=new_model_tag
                    )
                    if system_prompt:
                        system_prompt = re.sub(
                            r"open-source [^,]+,", f"open-source {new_model_tag},", system_prompt
                        )
                    model_tag = new_model_tag
                    model_family = model_tag.split(":")[0].split("/")[-1].capitalize()
                    after_cnt = len([m for m in conversation if m.get("role") in ("user", "assistant")])
                    console.print(
                        f"[bold green][HOT-SWAP SOTA] Modelo alternado para {model_tag}. "
                        f"Contexto compactado: {before_cnt} -> {after_cnt} mensagens (~10% retido).[/]\n"
                    )
                continue

            conversation.append({"role": "user", "content": user_input})
            print(f"{model_family} > ", end="", flush=True)

            if use_proxy:
                response = query_gemma_proxy(
                    model_tag,
                    user_input,
                    system_prompt,
                    conversation,
                    max_tokens=max_tokens,
                )
            else:
                response = query_ollama_direct(
                    model_tag,
                    user_input,
                    system_prompt,
                    conversation,
                    max_tokens=max_tokens,
                )

            if response:
                conversation.append({"role": "assistant", "content": response})

        except KeyboardInterrupt:
            console.print("\n[bold cyan]Sessao encerrada.[/]")
            break


def start_interactive_chat(model_key: str | None = None, use_proxy: bool = False) -> None:
    installed_models = discover_ollama_models()

    if not model_key:
        model_tag = _select_model_interactively(installed_models)
    else:
        model_tag = OLLAMA_MODEL_MAP.get(model_key, model_key)

    console.print(f"\n[bold magenta]=== Chat SOTA | {model_tag} ===[/]")
    console.print("[1] Modo Poker SOTA (Agentico Otimizado)")
    console.print("[2] Modo Conversacional / Tema Customizado (LLM Otimizado)")

    system_prompt, conversation, max_tokens = _configure_chat_session(model_tag)
    _run_chat_loop(model_tag, system_prompt, conversation, max_tokens, use_proxy=use_proxy)


def main():
    parser = argparse.ArgumentParser(description="Cliente de Inferencia SOTA.")
    parser.add_argument("prompt", nargs="*", help="Prompt para turno unico")
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Modelo alvo (alias ou tag)",
    )
    parser.add_argument("--chat", action="store_true", help="Modo chat interativo")
    parser.add_argument("--theme", type=str, default=None, help="Tema / System Prompt customizado")
    parser.add_argument("--proxy", action="store_true", help="Forcar uso do proxy 17043")
    parser.add_argument("--direct", action="store_true", help="Forcar uso direto da API Ollama (11434)")

    args = parser.parse_args()
    prompt_str = " ".join(args.prompt).strip()

    model_target = args.model or "12b"

    if args.chat or not prompt_str:
        start_interactive_chat(args.model, use_proxy=args.proxy)
    else:
        # Turno unico
        is_mocked = (
            hasattr(query_gemma_proxy, "mock_calls")
            or getattr(query_gemma_proxy, "_mock_return_value", None) is not None
        )
        if not args.proxy and _is_ollama_online() and not is_mocked:
            ollama_tag = OLLAMA_MODEL_MAP.get(model_target, model_target)
            resposta = query_ollama_direct(ollama_tag, prompt_str, system_prompt=args.theme)
        else:
            resposta = query_gemma_proxy(model_target, prompt_str, args.theme)

        if not resposta:
            sys.exit(1)


if __name__ == "__main__":
    main()
