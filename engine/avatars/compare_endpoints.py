import json
import time
import urllib.error
import urllib.request

try:
    from engine.avatars.run_avatar import (
        PORT_LLAMA,
        ensure_server_for_persona,
        kill_process_on_port,
    )
except ImportError:
    from run_avatar import (  # type: ignore # pylint: disable=wrong-import-position
        PORT_LLAMA,
        ensure_server_for_persona,
        kill_process_on_port,
    )


def _stream_chat_lines(resp) -> None:
    for line_bytes in resp:
        line = line_bytes.decode("utf-8", errors="ignore").strip()
        if not line.startswith("data: "):
            continue
        data_str = line[6:].strip()
        if data_str == "[DONE]":
            break
        try:
            data_json = json.loads(data_str)
            delta = data_json["choices"][0]["delta"]
            content = delta.get("content", "")
            if content:
                print(repr(content), end=" ", flush=True)
        except Exception as e:
            print(f"[JSON ERROR: {e}]", end=" ")
    print()


def _stream_completion_lines(resp) -> None:
    for line_bytes in resp:
        line = line_bytes.decode("utf-8", errors="ignore").strip()
        if not line.startswith("data: "):
            continue
        data_str = line[6:].strip()
        try:
            data_json = json.loads(data_str)
            content = data_json.get("content", "")
            tokens = data_json.get("tokens", [])
            print(f"[Content: {repr(content)}, Tokens: {tokens}]")
        except Exception as e:
            print(f"[JSON ERROR: {e}]")


def _execute_with_retry(req: urllib.request.Request, handler, label: str) -> None:
    for _attempt in range(1, 10):
        try:
            with urllib.request.urlopen(req) as resp:  # noqa: S310
                handler(resp)
                return
        except urllib.error.HTTPError as he:
            if he.code == 503:
                print(f"503 ({label}) - retrying...")
                time.sleep(2.0)
                continue
            print("HTTP Error:", he.code)
            return
        except Exception as e:
            print("Error:", e)
            return


def _test_chat_endpoint(port: int) -> None:
    url_chat = f"http://127.0.0.1:{port}/v1/chat/completions"
    payload_chat = {
        "messages": [
            {"role": "system", "content": "Voce e o Chico. Responda em portugues."},
            {"role": "user", "content": "Quem e voce?"},
        ],
        "temperature": 0.2,
        "stream": True,
    }

    print("\n--- TESTANDO /v1/chat/completions ---")
    req_chat = urllib.request.Request(
        url_chat,
        data=json.dumps(payload_chat).encode("utf-8"),
        headers={"Content-Type": "application/json", "Connection": "close"},
        method="POST",
    )
    _execute_with_retry(req_chat, _stream_chat_lines, "Chat")


def _test_completion_endpoint(port: int) -> None:
    url_comp = f"http://127.0.0.1:{port}/completion"
    prompt_formatted = "<start_of_turn>user\nVoce e o Chico. Responda em portugues.\n\nQuem e voce?<end_of_turn>\n<start_of_turn>model\n"
    payload_comp = {"prompt": prompt_formatted, "temperature": 0.2, "stream": True, "n_predict": 30}

    print("\n--- TESTANDO /completion ---")
    req_comp = urllib.request.Request(
        url_comp,
        data=json.dumps(payload_comp).encode("utf-8"),
        headers={"Content-Type": "application/json", "Connection": "close"},
        method="POST",
    )
    _execute_with_retry(req_comp, _stream_completion_lines, "Comp")


def test() -> None:
    kill_process_on_port(PORT_LLAMA)

    persona_cfg = {
        "model_path": "bartowski/gemma-2-2b-it-GGUF",
        "model_file": "gemma-2-2b-it-Q4_K_M.gguf",
        "lora_path": "",
        "temperature": 0.2,
        "top_p": 0.9,
    }

    print("Iniciando/Assegurando servidor...")
    if not ensure_server_for_persona("chico_test", persona_cfg):
        print("Erro ao iniciar o servidor.")
        return

    _test_chat_endpoint(PORT_LLAMA)
    _test_completion_endpoint(PORT_LLAMA)

    kill_process_on_port(PORT_LLAMA)


if __name__ == "__main__":
    test()
