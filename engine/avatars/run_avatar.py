import argparse
import json
import os
import socket
import subprocess  # noqa: S404
import sys
import time
import urllib.error
import urllib.request

# Configuracoes globais de porta
PORT_LLAMA = 17045


def clean_text_to_ascii(text: str) -> str:
    """Substitui caracteres acentuados e especiais por equivalentes ASCII puro."""
    replacements = {
        "a": "a",
        "ä": "a",
        "A": "A",
        "Ä": "A",
        "e": "e",
        "ë": "e",
        "E": "E",
        "Ë": "E",
        "i": "i",
        "ï": "i",
        "I": "I",
        "Ï": "I",
        "o": "o",
        "ö": "o",
        "O": "O",
        "Ö": "O",
        "u": "u",
        "ü": "u",
        "U": "U",
        "Ü": "U",
        "c": "c",
        "C": "C",
        "ñ": "n",
        "Ñ": "N",
        "—": "-",
        "–": "-",
        "’": "'",
        "‘": "'",
        "”": '"',
        "“": '"',
    }
    cleaned = []
    for char in text:
        cleaned.append(replacements.get(char, char))
    return "".join(cleaned)


def is_port_open(port: int) -> bool:
    """Verifica se uma porta de rede local esta ativa."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0


def kill_process_on_port(port: int):
    """Localiza e finaliza de forma forcada qualquer processo escutando na porta informada."""
    print(f"[AVATAR] Liberando a porta {port}...")
    if os.name == "nt":
        try:
            res = subprocess.run(
                ["netstat", "-ano"],
                capture_output=True,
                text=True,
                check=True,  # noqa: S607
            )
            pids = set()
            for line in res.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        pids.add(parts[-1])
            for pid in pids:
                print(f"[AVATAR] Encerrando processo PID: {pid}")
                subprocess.run(
                    ["taskkill", "/F", "/PID", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False
                )  # noqa: S603, S607
            time.sleep(1.0)
        except Exception as e:
            print(f"[AVATAR Error] Erro ao encerrar processo no Windows: {e}")
    else:
        try:
            res = subprocess.run(["lsof", "-t", f"-i:{port}"], capture_output=True, text=True, check=False)
            if res.stdout:
                pids = res.stdout.strip().split()
                if pids:
                    subprocess.run(["kill", "-9", *pids], check=False)
            time.sleep(1.0)
        except Exception as e:
            print(f"[AVATAR Error] Erro ao encerrar processo no Unix: {e}")


def assemble_context(context_files: list) -> str:
    """Carrega o conteudo dos arquivos de contexto do projeto e gera a estrutura do prompt de sistema com limite de tamanho."""
    context_str = ""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    # Orcamento maximo de caracteres por arquivo para evitar estouro do limite de contexto de 8192 tokens
    max_chars_per_file = 8000

    for rel_path in context_files:
        abs_path = os.path.join(project_root, rel_path)
        if os.path.exists(abs_path):
            try:
                with open(abs_path, encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                # Truncagem proativa com aviso ASCII
                if len(content) > max_chars_per_file:
                    content = (
                        content[:max_chars_per_file]
                        + f"\n... [CONTEUDO TRUNCADO EM {max_chars_per_file} CARACTERES PARA OTIMIZACAO DE TOKENS] ...\n"
                    )

                context_str += f"\n--- INICIO DO ARQUIVO: {rel_path} ---\n"
                context_str += content
                context_str += f"\n--- FIM DO ARQUIVO: {rel_path} ---\n"
            except Exception as e:
                print(f"[AVATAR Warning] Falha ao ler o arquivo {rel_path}: {e}")
        else:
            print(f"[AVATAR Warning] Arquivo de contexto nao localizado: {abs_path}")

    if context_str:
        header = (
            "\n\n=== CONTEXTO DO PROJETO - CODIGO FONTE E DEFINICOES ===\n"
            "Abaixo esta o conteudo relevante dos arquivos do projeto nos quais voce foi treinado/especializado.\n"
            "Use esses algoritmos, classes e diretrizes para estruturar suas respostas de forma correta e semantica:\n"
        )
        return header + context_str + "\n=======================================================\n"
    return ""


def ensure_server_for_persona(_persona_name: str, _persona_config: dict) -> bool:
    """Verifica se o servico local do Ollama esta ativo na porta 11434."""
    port_ollama = 11434
    if is_port_open(port_ollama):
        return True

    print(f"[AVATAR Error] Servico local do Ollama nao detectado na porta {port_ollama}.")
    print("[AVATAR Error] Por favor, certifique-se de que o Ollama esta iniciado.")
    return False


def query_llama_server(system_prompt: str, user_prompt: str, persona_config: dict, stream: bool = True):
    """Executa consulta contra a API do local Ollama usando o endpoint /api/generate."""
    url = "http://127.0.0.1:11434/api/generate"

    payload = {
        "model": persona_config.get("ollama_model", "gemma4:31b-cloud"),
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": stream,
        "options": {
            "temperature": persona_config.get("temperature", 0.2),
            "top_p": persona_config.get("top_p", 0.9),
            "repeat_penalty": persona_config.get("repeat_penalty", 1.15),
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Connection": "close"},
        method="POST",
    )

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=300) as response:  # noqa: S310
                generated_text = ""
                if stream:
                    for line_bytes in response:
                        line = line_bytes.decode("utf-8", errors="ignore").strip()
                        if not line:
                            continue
                        try:
                            data_json = json.loads(line)
                            content = data_json.get("response", "")
                            if content:
                                clean_content = clean_text_to_ascii(content)
                                print(clean_content, end="", flush=True)
                                generated_text += clean_content
                        except (json.JSONDecodeError, AttributeError):
                            pass
                    print()
                else:
                    res_data = response.read().decode("utf-8")
                    res_json = json.loads(res_data)
                    raw_text = res_json.get("response", "")
                    generated_text = clean_text_to_ascii(raw_text)
                    print(generated_text)

                # SOTA: Salva a resposta em arquivo fisico para permitir auditoria robusta
                try:
                    res_file = os.path.join(os.path.dirname(__file__), "last_response.txt")
                    with open(res_file, "w", encoding="utf-8") as f:
                        f.write(generated_text)
                except Exception as e:
                    print(f"[AVATAR Warning] Falha ao gravar last_response.txt: {e}")
                return
        except urllib.error.HTTPError as he:
            error_body = he.read().decode("utf-8", errors="ignore")
            print(f"\n[AVATAR Error] Falha de HTTP ({he.code}): {he.reason}")
            print(f"[AVATAR Error] Detalhes: {error_body}")
            return
        except (urllib.error.URLError, TimeoutError) as te:
            if attempt < max_retries:
                print(
                    f"[AVATAR] Tempo de resposta esgotado ou conexao recusada. Retentando em 3.0 segundos (Tentativa {attempt}/{max_retries})..."
                )
                time.sleep(3.0)
                continue
            print(f"\n[AVATAR Error] Timeout persistente: {te}")
            return
        except Exception as e:
            print(f"\n[AVATAR Error] Falha ao enviar requisicao ao servidor de inferencia: {e}")
            return


def query_multimodal_cli(
    system_prompt: str, user_prompt: str, image_path: str, audio_path: str, persona_config: dict, silent: bool = False
) -> str:
    """Executa a inferencia multimodal local disparando o utilitario CLI correspondente."""
    dir_path = os.path.dirname(__file__)
    cli_name = "llama-mtmd-cli.exe" if os.name == "nt" else "llama-mtmd-cli"
    cli_path = os.path.abspath(os.path.join(dir_path, "..", "llama_cpp", cli_name))

    if not os.path.exists(cli_path):
        print(f"[AVATAR Error] Utilitario multimodal nao encontrado em {cli_path}")
        return ""

    # Determina se usa o modelo vision especifico (Gemma 4b vision / MiniCPM) para colaboracao agentica
    model_path = persona_config.get("vision_model_path") or persona_config.get(
        "model_path", "bartowski/gemma-2-2b-it-GGUF"
    )

    cmd = [
        cli_path,
        "-hf",
        model_path,
        "-sys",
        system_prompt,
        "-p",
        user_prompt,
        "--temp",
        str(persona_config.get("temperature", 0.2)),
        "--top-p",
        str(persona_config.get("top_p", 0.9)),
    ]

    if image_path:
        cmd += ["--image", image_path]
    if audio_path:
        cmd += ["--audio", audio_path]

    if not silent:
        print(f"[AVATAR] Iniciando execucao multimodal SOTA com o modelo: {model_path}...")

    generated_text = ""
    try:
        process = subprocess.Popen(  # noqa: S603
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        if process.stdout:
            for line in process.stdout:
                if not silent:
                    print(line, end="", flush=True)
                generated_text += line
        process.wait()
    except Exception as e:
        print(f"\n[AVATAR Error] Falha na execucao do processo multimodal: {e}")

    return generated_text


def main():
    parser = argparse.ArgumentParser(
        description="Executor de Avatar SOTA com Especializacao de Contexto e Parametrizacao Dinamica."
    )
    parser.add_argument(
        "--persona",
        type=str,
        default="chico",
        help="Nome da persona a carregar (ex: chico, maverick, historian, gemma4)",
    )
    parser.add_argument("--prompt", type=str, required=True, help="Prompt de consulta do usuario")
    parser.add_argument("--image", type=str, default="", help="Caminho do arquivo de imagem para modo multimodal")
    parser.add_argument("--audio", type=str, default="", help="Caminho do arquivo de audio para modo multimodal")
    parser.add_argument("--no-stream", action="store_true", help="Desativa o streaming de token de texto")

    args = parser.parse_args()

    dir_path = os.path.dirname(__file__)
    config_path = os.path.join(dir_path, "avatar_config.json")

    if not os.path.exists(config_path):
        print(f"[AVATAR Error] Manifesto de configuracao nao encontrado em {config_path}")
        sys.exit(1)

    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)

    personas = config.get("personas", {})
    if args.persona not in personas:
        print(f"[AVATAR Error] Persona '{args.persona}' nao localizada no config.")
        sys.exit(1)

    persona_cfg = personas[args.persona]

    # 1. Monta o contexto especifico baseado nos arquivos locais mapeados com truncagem de tamanho
    context_files = persona_cfg.get("context_files") or []
    project_context = assemble_context(context_files)

    # Injeta o contexto no prompt de sistema
    system_prompt = persona_cfg.get("system_prompt", "") + project_context

    # 2. Executa no modo correspondente (Multimodal ou Text-only)
    is_multimodal = bool(args.image or args.audio)

    if is_multimodal:
        # SOTA: Colaboracao Agentica Multimodal (Gemma 4b Vision + Llama Local)
        if persona_cfg.get("vision_model_path") and args.image:
            print("\n[AVATAR SOTA] Colaboracao Agentica Multimodal Ativada!")
            print(
                f"[AVATAR SOTA] FASE 1: Gemma 4b Vision ({persona_cfg.get('vision_model_path')}) extrai dados visuais..."
            )

            vision_sys = "Voce e um especialista em extracao visual de poker. Liste cartas, board e stacks de forma direta e sem rodeios."
            vision_prompt = "Descreva a mesa de poker desta imagem de forma limpa e estruturada."

            # Executa a inferencia visual com a Gemma 4b multimodal
            visual_context = query_multimodal_cli(
                system_prompt=vision_sys,
                user_prompt=vision_prompt,
                image_path=args.image,
                audio_path="",
                persona_config={
                    "vision_model_path": persona_cfg.get("vision_model_path"),
                    "temperature": 0.2,
                    "top_p": 0.9,
                },
                silent=False,
            )

            if not visual_context.strip():
                print(
                    "[AVATAR Warning] Nao foi possivel obter descricao da imagem. Prosseguindo apenas com dados textuais."
                )
                visual_context = "[Nenhum dado visual disponivel]"

            print(
                f"\n[AVATAR SOTA] FASE 2: Encaminhando prompt enriquecido para o Llama ({persona_cfg.get('ollama_model')})..."
            )

            # Injeta a descricao visual no prompt de texto
            agentic_user_prompt = (
                f"=== CONTEXTO VISUAL DO BOARD (EXTRAIDO POR GEMMA 4B VISION) ===\n"
                f"{visual_context.strip()}\n"
                f"=============================================================\n\n"
                f"{args.prompt}"
            )

            if ensure_server_for_persona(args.persona, persona_cfg):
                query_llama_server(system_prompt, agentic_user_prompt, persona_cfg, stream=not args.no_stream)
            else:
                print("[AVATAR Error] Nao foi possivel assegurar o servidor local do Ollama.")
                sys.exit(1)
        else:
            # Modo multimodal direto padrao
            query_multimodal_cli(system_prompt, args.prompt, args.image, args.audio, persona_cfg)
    else:
        if ensure_server_for_persona(args.persona, persona_cfg):
            query_llama_server(system_prompt, args.prompt, persona_cfg, stream=not args.no_stream)
        else:
            print("[AVATAR Error] Nao foi possivel assegurar o servidor local.")
            sys.exit(1)


if __name__ == "__main__":
    main()
