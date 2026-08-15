import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.append(os.path.dirname(__file__))
from run_avatar import (  # noqa: E402 # pylint: disable=wrong-import-position
    PORT_LLAMA,
    ensure_server_for_persona,
    kill_process_on_port,
)


def test():
    # Garante que o servidor de teste esta desligado
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

    # 1. TESTA /v1/chat/completions
    url_chat = f"http://127.0.0.1:{PORT_LLAMA}/v1/chat/completions"
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

    # Retry loop for 503
    for _attempt in range(1, 10):
        try:
            with urllib.request.urlopen(req_chat) as resp:  # noqa: S310
                for line_bytes in resp:
                    line = line_bytes.decode("utf-8", errors="ignore").strip()
                    if line.startswith("data: "):
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
                break
        except urllib.error.HTTPError as he:
            if he.code == 503:
                print("503 (Chat) - retrying...")
                time.sleep(2.0)
                continue
            print("HTTP Error:", he.code)
            break
        except Exception as e:
            print("Error:", e)
            break

    # 2. TESTA /completion
    url_comp = f"http://127.0.0.1:{PORT_LLAMA}/completion"
    prompt_formatted = "<start_of_turn>user\nVoce e o Chico. Responda em portugues.\n\nQuem e voce?<end_of_turn>\n<start_of_turn>model\n"
    payload_comp = {"prompt": prompt_formatted, "temperature": 0.2, "stream": True, "n_predict": 30}

    print("\n--- TESTANDO /completion ---")
    req_comp = urllib.request.Request(
        url_comp,
        data=json.dumps(payload_comp).encode("utf-8"),
        headers={"Content-Type": "application/json", "Connection": "close"},
        method="POST",
    )

    for _attempt in range(1, 10):
        try:
            with urllib.request.urlopen(req_comp) as resp:  # noqa: S310
                for line_bytes in resp:
                    line = line_bytes.decode("utf-8", errors="ignore").strip()
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        try:
                            data_json = json.loads(data_str)
                            content = data_json.get("content", "")
                            tokens = data_json.get("tokens", [])
                            print(f"[Content: {repr(content)}, Tokens: {tokens}]")
                        except Exception as e:
                            print(f"[JSON ERROR: {e}]")
                break
        except urllib.error.HTTPError as he:
            if he.code == 503:
                print("503 (Comp) - retrying...")
                time.sleep(2.0)
                continue
            print("HTTP Error:", he.code)
            break
        except Exception as e:
            print("Error:", e)
            break

    kill_process_on_port(PORT_LLAMA)


if __name__ == "__main__":
    test()
