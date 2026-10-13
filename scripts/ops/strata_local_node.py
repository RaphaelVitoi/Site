"""No local de simulacao/inferencia compativel com Strata v0.1.39 MoE 125B na porta 8080."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("StrataLocalNode")


class StrataHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        logger.info("%s - - [%s] %s", self.client_address[0], self.log_date_time_string(), format % args)

    def _send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:  # noqa: N802
        if self.path in ("/health", "/v1/health"):
            self._send_json(
                200,
                {
                    "status": "loaded",
                    "engine": "Strata-v0.1.39",
                    "model": "ISTA-DASLab-Coder-125B",
                    "family": "coder",
                },
            )
        elif self.path in ("/props", "/v1/props"):
            self._send_json(200, {"is_sleeping": False})
        elif self.path in ("/metrics", "/v1/metrics"):
            self._send_json(
                200,
                {
                    "expert_hit_rate": 0.96,
                    "parallel_slots": 2,
                    "tokens_per_sec": 48.5,
                    "vram_reserve_mib": 4000,
                },
            )
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self) -> None:  # noqa: N802
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            body = json.loads(post_body.decode("utf-8")) if post_body else {}
        except Exception:
            body = {}

        if self.path == "/v1/chat/completions":
            user_msg = "Strata MoE"
            if "messages" in body and body["messages"]:
                last_msg = body["messages"][-1]
                user_msg = last_msg.get("content", user_msg)

            resp = {
                "id": "chatcmpl-strata-moe-125b",
                "object": "chat.completion",
                "model": "ISTA-DASLab-Coder-125B",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": f"<think>Analise MoE 125B executada com sucesso.</think>Resposta Strata: Processamento validado para '{user_msg}'.",
                        },
                        "finish_reason": "stop",
                    }
                ],
                "usage": {
                    "prompt_tokens": 18,
                    "completion_tokens": 22,
                    "total_tokens": 40,
                },
            }
            self._send_json(200, resp)
        elif self.path == "/v1/responses":
            resp = {
                "id": "resp-strata-moe-125b",
                "status": "completed",
                "output": [
                    {
                        "type": "message",
                        "content": "Strata MoE Responses API resposta processada com sucesso.",
                    }
                ],
                "usage": {
                    "input_tokens": 15,
                    "output_tokens": 12,
                },
            }
            self._send_json(200, resp)
        elif self.path in ("/v1/vram", "/load", "/unload"):
            self._send_json(200, {"success": True})
        else:
            self._send_json(404, {"error": "Not Found"})


def run(host: str = "127.0.0.1", port: int = 8080) -> None:
    server = HTTPServer((host, port), StrataHandler)
    logger.info("Strata Local Node escutando em http://%s:%d", host, port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Encerrando Strata Local Node...")
        server.server_close()


if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port=p)
