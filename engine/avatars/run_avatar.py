import argparse
import json
import os
import shlex
import socket
import subprocess  # noqa: S404
import sys
import time
import unicodedata
import urllib.error
import urllib.request

import psutil

PHYSICAL_CORES = psutil.cpu_count(logical=False) or 4


# Configuracoes globais de porta
PORT_LLAMA = 8080


def clean_text_to_ascii(text: str) -> str:
    """Substitui caracteres acentuados e especiais por equivalentes ASCII puro."""
    # Normalize to NFKD (separates accents from characters)
    normalized = unicodedata.normalize("NFKD", text)
    # Encode to ASCII, ignoring characters that cannot be represented in ASCII
    return normalized.encode("ascii", "ignore").decode("ascii")


def is_port_open(port: int) -> bool:
    """Verifica se uma porta de rede local esta ativa."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0


def _kill_windows_port(port: int) -> None:
    try:
        res = subprocess.run(["netstat", "-ano"], capture_output=True, text=True, check=True)  # noqa: S607
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


def _kill_unix_port(port: int) -> None:
    try:
        res = subprocess.run(["lsof", "-t", f"-i:{port}"], capture_output=True, text=True, check=False)
        if res.stdout:
            pids = res.stdout.strip().split()
            if pids:
                subprocess.run(["kill", "-9", *pids], check=False)
        time.sleep(1.0)
    except Exception as e:
        print(f"[AVATAR Error] Erro ao encerrar processo no Unix: {e}")


def kill_process_on_port(port: int):
    """Localiza e finaliza de forma forcada qualquer processo escutando na porta informada."""
    print(f"[AVATAR] Liberando a porta {port}...")
    if os.name == "nt":
        _kill_windows_port(port)
    else:
        _kill_unix_port(port)


def _validate_context_path(rel_path: str, project_root: str) -> str | None:
    if not isinstance(rel_path, str):
        return None
    abs_path = os.path.realpath(os.path.abspath(os.path.join(project_root, rel_path)))
    if not abs_path.startswith(project_root):
        print(f"[AVATAR Warning] Tentativa de path traversal bloqueada: {rel_path}")
        return None

    base_name = os.path.basename(abs_path).lower()
    if base_name.startswith(".env") or "id_rsa" in base_name or "credentials" in base_name:
        print(f"[AVATAR Warning] Acesso a arquivo sensivel bloqueado: {rel_path}")
        return None
    return abs_path


def _read_context_file(rel_path: str, project_root: str, max_chars: int) -> str | None:
    abs_path = _validate_context_path(rel_path, project_root)
    if not abs_path:
        return None
    if not os.path.exists(abs_path):
        print(f"[AVATAR Warning] Arquivo de contexto nao localizado: {abs_path}")
        return None

    try:
        with open(abs_path, encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if len(content) > max_chars:
            content = (
                content[:max_chars]
                + f"\n... [CONTEUDO TRUNCADO EM {max_chars} CARACTERES PARA OTIMIZACAO DE TOKENS] ...\n"
            )

        return f"\n--- INICIO DO ARQUIVO: {rel_path} ---\n{content}\n--- FIM DO ARQUIVO: {rel_path} ---\n"
    except Exception as e:
        print(f"[AVATAR Warning] Falha ao ler o arquivo {rel_path}: {e}")
        return None


def assemble_context(context_files: list) -> str:
    """Carrega o conteudo dos arquivos de contexto do projeto e gera a estrutura do prompt de sistema com limite de tamanho."""
    project_root = os.path.realpath(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    max_chars_per_file = 8000

    chunks = []
    for rel_path in context_files:
        chunk = _read_context_file(rel_path, project_root, max_chars_per_file)
        if chunk:
            chunks.append(chunk)

    if not chunks:
        return ""

    header = (
        "\n\n=== CONTEXTO DO PROJETO - CODIGO FONTE E DEFINICOES ===\n"
        "Abaixo esta o conteudo relevante dos arquivos do projeto nos quais voce foi treinado/especializado.\n"
        "Use esses algoritmos, classes e diretrizes para estruturar suas respostas de forma correta e semantica:\n"
    )
    return header + "".join(chunks) + "\n=======================================================\n"


def ensure_server_for_persona(_persona_name: str, _persona_config: dict) -> bool:
    """Verifica se o servico local do Ollama esta ativo na porta 11434."""
    port_ollama = 11434
    if is_port_open(port_ollama):
        return True

    print(f"[AVATAR Error] Servico local do Ollama nao detectado na porta {port_ollama}.")
    print("[AVATAR Error] Por favor, certifique-se de que o Ollama esta iniciado.")
    return False


def _process_stream_response(response) -> str:
    generated_text = ""
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
    return generated_text


def _handle_response(response, stream: bool) -> None:
    if stream:
        generated_text = _process_stream_response(response)
    else:
        res_data = response.read().decode("utf-8")
        res_json = json.loads(res_data)
        generated_text = clean_text_to_ascii(res_json.get("response", ""))
        print(generated_text)

    try:
        res_file = os.path.join(os.path.dirname(__file__), "last_response.txt")
        with open(res_file, "w", encoding="utf-8") as f:
            f.write(generated_text)
    except Exception as e:
        print(f"[AVATAR Warning] Falha ao gravar last_response.txt: {e}")


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
            "num_ctx": persona_config.get("num_ctx", 8192),
            "num_predict": persona_config.get("num_predict", 2048),
            "num_thread": persona_config.get("num_thread")
            or PHYSICAL_CORES,  # SOTA: Desligar Hyperthreading overhead dinamicamente
            "num_batch": 1024,  # SOTA: Balancear taxa de leitura do prompt mitigando spike 100% GPU
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
                _handle_response(response, stream)
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


def _run_subprocess_stream(cmd: list[str], silent: bool) -> str:
    generated_text = ""
    # SOTA: Sanitizacao estrita de tokens via shlex e prevencao de command injection
    safe_cmd = [shlex.quote(arg) if any(c in arg for c in ";|&`$") else arg for arg in cmd if isinstance(arg, str)]
    try:
        process = subprocess.Popen(  # nosec B603 # noqa: S603
            safe_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            shell=False,
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

    num_thread = persona_config.get("num_thread") or PHYSICAL_CORES
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
        "-fa",  # SOTA: Flash Attention ativado nativamente no backend bruto
        "-c",
        str(persona_config.get("num_ctx", 8192)),
        "-b",
        "1024",
        "-t",
        str(num_thread),
    ]

    gpu_layers = persona_config.get("gpu_layers", 0)
    if gpu_layers > 0:
        cmd += ["-ngl", str(gpu_layers)]

    if image_path:
        cmd += ["--image", image_path]
    if audio_path:
        cmd += ["--audio", audio_path]

    if not silent:
        print(f"[AVATAR] Iniciando execucao multimodal SOTA com o modelo: {model_path}...")

    return _run_subprocess_stream(cmd, silent)


def _execute_agentic_multimodal(args, persona_cfg, system_prompt):
    print("\n[AVATAR SOTA] Colaboracao Agentica Multimodal Ativada!")
    print(f"[AVATAR SOTA] FASE 1: Gemma 4b Vision ({persona_cfg.get('vision_model_path')}) extrai dados visuais...")

    vision_sys = "Voce e um especialista em extracao visual de poker. Liste cartas, board e stacks de forma direta e sem rodeios."
    vision_prompt = "Descreva a mesa de poker desta imagem de forma limpa e estruturada."

    visual_context = query_multimodal_cli(
        system_prompt=vision_sys,
        user_prompt=vision_prompt,
        image_path=args.image,
        audio_path="",
        persona_config={
            "vision_model_path": persona_cfg.get("vision_model_path"),
            "temperature": 0.2,
            "top_p": 0.9,
            "gpu_layers": persona_cfg.get("gpu_layers", 0),
        },
        silent=False,
    )

    if not visual_context.strip():
        print("[AVATAR Warning] Nao foi possivel obter descricao da imagem. Prosseguindo apenas com dados textuais.")
        visual_context = "[Nenhum dado visual disponivel]"

    print(
        f"\n[AVATAR SOTA] FASE 2: Encaminhando prompt enriquecido para o Llama ({persona_cfg.get('ollama_model')})..."
    )

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


def _dispatch_avatar_execution(args, persona_cfg, system_prompt):
    is_multimodal = bool(args.image or args.audio)
    if is_multimodal:
        if persona_cfg.get("vision_model_path") and args.image:
            _execute_agentic_multimodal(args, persona_cfg, system_prompt)
        else:
            query_multimodal_cli(system_prompt, args.prompt, args.image, args.audio, persona_cfg)
    else:
        if ensure_server_for_persona(args.persona, persona_cfg):
            query_llama_server(system_prompt, args.prompt, persona_cfg, stream=not args.no_stream)
        else:
            print("[AVATAR Error] Nao foi possivel assegurar o servidor local.")
            sys.exit(1)


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
    parser.add_argument("--ngl", type=int, default=-1, help="Numero de camadas offloaded para a GPU (VRAM)")

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
    if args.ngl >= 0:
        persona_cfg["gpu_layers"] = args.ngl

    # 1. Monta o contexto especifico baseado nos arquivos locais mapeados com truncagem de tamanho
    context_files = persona_cfg.get("context_files") or []
    project_context = assemble_context(context_files)

    # Injeta o contexto no prompt de sistema
    system_prompt = persona_cfg.get("system_prompt", "") + project_context

    _dispatch_avatar_execution(args, persona_cfg, system_prompt)


if __name__ == "__main__":
    main()
