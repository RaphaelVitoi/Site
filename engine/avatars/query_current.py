import json
import urllib.request

url = "http://127.0.0.1:11434/api/generate"
prompt = "<start_of_turn>user\nVoce e o Historian. Diga 'Ola do Historian'.<end_of_turn>\n<start_of_turn>model\n"
payload = {"model": "gemma4:31b-cloud", "prompt": prompt, "stream": True, "options": {"temperature": 0.0}}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json", "Connection": "close"},
    method="POST",
)

print("Enviando requisicao...")
try:
    with urllib.request.urlopen(req) as resp:
        for line_bytes in resp:
            line = line_bytes.decode("utf-8", errors="ignore").strip()
            if line:
                try:
                    data_json = json.loads(line)
                    response_chunk = data_json.get("response", "")
                    if response_chunk:
                        print(response_chunk, end="", flush=True)
                except Exception as e:
                    print("JSON Error:", e)
        print()
except Exception as e:
    print("Request Error:", e)
