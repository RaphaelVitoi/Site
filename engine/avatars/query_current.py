import json
import urllib.request

url = "http://127.0.0.1:17045/completion"
prompt = "<start_of_turn>user\nVoce e o Historian. Diga 'Ola do Historian'.<end_of_turn>\n<start_of_turn>model\n"
payload = {"prompt": prompt, "stream": True, "temperature": 0.0, "n_predict": 30}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json", "Connection": "close"},
    method="POST",
)

tokens = []
print("Enviando requisicao...")
try:
    with urllib.request.urlopen(req) as resp:
        for line_bytes in resp:
            line = line_bytes.decode("utf-8", errors="ignore").strip()
            if line.startswith("data: "):
                data_str = line[6:].strip()
                try:
                    data_json = json.loads(data_str)
                    print("CHUNK:", data_json)
                    toks = data_json.get("tokens", [])
                    if toks:
                        tokens.extend(toks)
                except Exception as e:
                    print("JSON Error:", e)
except Exception as e:
    print("Request Error:", e)

print("Tokens recebidos:", tokens)
if tokens:
    detok_url = "http://127.0.0.1:17045/detokenize"
    detok_req = urllib.request.Request(
        detok_url,
        data=json.dumps({"tokens": tokens}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(detok_req) as resp:
            print("DETOKENIZED:", json.loads(resp.read().decode("utf-8")))
    except Exception as e:
        print("Detok error:", e)
