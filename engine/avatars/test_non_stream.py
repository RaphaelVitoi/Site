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


def test():
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

    # Testa /completion com stream: False
    url = f"http://127.0.0.1:{PORT_LLAMA}/completion"
    prompt = (
        "<start_of_turn>user\nVoce e o Historian. Diga apenas 'Ola' em uma linha.<end_of_turn>\n<start_of_turn>model\n"
    )
    payload = {"prompt": prompt, "stream": False, "temperature": 0.0, "n_predict": 30}

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Connection": "close"},
        method="POST",
    )

    print("Enviando requisicao com stream: False...")
    for _attempt in range(1, 10):
        try:
            with urllib.request.urlopen(req) as resp:  # noqa: S310
                res_data = resp.read().decode("utf-8")
                res_json = json.loads(res_data)
                print("RAW RESPONSE JSON:")
                print(json.dumps(res_json, indent=2))
                break
        except urllib.error.HTTPError as he:
            if he.code == 503:
                print("503 - retrying...")
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
