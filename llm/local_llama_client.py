"""
Cliente de inferencia local para llama.cpp sob o Protocolo Chico SOTA v8.0 Gold.

Conecta-se as instancias locais do llama-server (OpenAI-compatible):
  - Porta 8081: AI9Stars G9v3-3B (Otimizado para Tool Calling, automacoes e JSON)
  - Porta 8082: Ling-3.0-tiny MoE (Otimizado para sinteses confiaveis e Portugues BR)
  - Porta 8083: Qwen2.5-Coder-1.5B (Otimizado para codigo cirurgico, linting e patches)
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

DEFAULT_G9_PORT = 8081
DEFAULT_LING_PORT = 8082
DEFAULT_QWEN_PORT = 8083


def sanitize_think_tags(text: str) -> str:
    """Remove tags de raciocinio <think>...</think> emitidas por modelos locais."""
    if not text:
        return ""
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()


class LocalLlamaClient:
    """Cliente HTTP sincrono e ultraleve para instancias locais do llama-server."""

    def __init__(self, host: str = "127.0.0.1", port: int = DEFAULT_G9_PORT, timeout: float = 30.0) -> None:
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}/v1"
        self.timeout = timeout

    def is_healthy(self) -> bool:
        """Verifica se o servidor local esta ativo e respondendo."""
        try:
            url = f"http://{self.host}:{self.port}/health"
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("status") in ("ok", "loading model")
        except Exception:
            return False

    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 1024) -> str:
        """Metodo de conveniencia direto para completar texto ou obter resposta semantica."""
        res = self.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        try:
            return res["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return ""

    def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1024,
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str | dict[str, Any] | None = None,
        response_format: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Executa chamada de chat completion compativel com o endpoint /v1/chat/completions.
        Garante remocao de tags <think> e injecao de telemetria de latencia.
        """
        payload: dict[str, Any] = {
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

        if tools:
            payload["tools"] = tools
            if tool_choice:
                payload["tool_choice"] = tool_choice

        if response_format:
            payload["response_format"] = response_format

        url = f"{self.base_url}/chat/completions"
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json", "Authorization": "Bearer local"},
            method="POST",
        )

        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                latency_ms = (time.time() - t0) * 1000.0
                result["_sota_telemetry"] = {
                    "latency_ms": round(latency_ms, 2),
                    "port": self.port,
                    "endpoint": url,
                }
                # Sanitizacao mandatoria contra vazamento de tags <think></think>
                if "choices" in result:
                    for choice in result["choices"]:
                        if "message" in choice and "content" in choice["message"]:
                            raw_content = choice["message"]["content"]
                            if raw_content:
                                choice["message"]["content"] = sanitize_think_tags(raw_content)
                        elif "text" in choice and choice["text"]:
                            choice["text"] = sanitize_think_tags(choice["text"])
                return result
        except urllib.error.URLError as e:
            logger.error("Falha de conexao com o llama-server na porta %d: %s", self.port, e)
            raise ConnectionError(
                f"llama-server offline na porta {self.port}. Inicie via scripts/ops/Start-LocalLlama.ps1"
            ) from e


def get_local_tool_caller() -> LocalLlamaClient:
    """Retorna o cliente configurado para o AI9Stars G9v3-3B (Porta 8081)."""
    return LocalLlamaClient(port=DEFAULT_G9_PORT)


def get_local_synthesizer() -> LocalLlamaClient:
    """Retorna o cliente configurado para o Ling-3.0-tiny MoE (Porta 8082)."""
    return LocalLlamaClient(port=DEFAULT_LING_PORT)


def get_local_coder() -> LocalLlamaClient:
    """Retorna o cliente configurado para o Qwen2.5-Coder-1.5B (Porta 8083)."""
    return LocalLlamaClient(port=DEFAULT_QWEN_PORT)
