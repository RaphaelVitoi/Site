"""
Cliente de inferência local para llama.cpp sob o Protocolo Chico SOTA v8.0 Gold.

Conecta-se às instâncias locais do llama-server (OpenAI-compatible):
  - Porta 8081: AI9Stars G9v3-3B (Otimizado para Tool Calling, automações e JSON)
  - Porta 8082: Ling-3.0-tiny MoE (Otimizado para sínteses confiáveis e Português BR)
"""

from __future__ import annotations

import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)

DEFAULT_G9_PORT = 8081
DEFAULT_LING_PORT = 8082


class LocalLlamaClient:
    """Cliente HTTP síncrono/leve para instâncias do llama-server."""

    def __init__(self, host: str = "127.0.0.1", port: int = DEFAULT_G9_PORT, timeout: float = 30.0) -> None:
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}/v1"
        self.timeout = timeout

    def is_healthy(self) -> bool:
        """Verifica se o servidor local está ativo e respondendo."""
        try:
            url = f"http://{self.host}:{self.port}/health"
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("status") in ("ok", "loading model")
        except Exception:
            return False

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1024,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[Union[str, Dict[str, Any]]] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executa chamada de chat completion compatível com o endpoint /v1/chat/completions.
        Garante modo de raciocínio desligado (reasoning off) para evitar desistências silenciosas.
        """
        payload: Dict[str, Any] = {
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
                return result
        except urllib.error.URLError as e:
            logger.error("Falha de conexão com o llama-server na porta %d: %s", self.port, e)
            raise ConnectionError(
                f"llama-server offline na porta {self.port}. Inicie via scripts/ops/Start-LocalLlama.ps1"
            ) from e


def get_local_tool_caller() -> LocalLlamaClient:
    """Retorna o cliente configurado para o AI9Stars G9v3-3B (Porta 8081)."""
    return LocalLlamaClient(port=DEFAULT_G9_PORT)


def get_local_synthesizer() -> LocalLlamaClient:
    """Retorna o cliente configurado para o Ling-3.0-tiny MoE (Porta 8082)."""
    return LocalLlamaClient(port=DEFAULT_LING_PORT)
