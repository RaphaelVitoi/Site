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
import os
import re
import time
from typing import Any
import urllib.error
import urllib.request


class LlamaServerOfflineError(Exception):
    """SOTA GOLD: Exception raised when llama.cpp server is unreachable."""

    def __init__(self, port: int):
        self.port = port
        self.message = (
            f"[WARN] [SOTA-LOCAL] llama.cpp server is offline or unreachable on port {port}. "
            f"Please ensure the server is running. "
            f"Start it using: ./llama-server -m <model_path> --port {port}. "
            f"Alternatively, run: pwsh -File scripts/ops/Start-LocalLlama.ps1 -Port {port}"
        )
        super().__init__(self.message)


logger = logging.getLogger(__name__)

DEFAULT_G9_PORT = 8081
DEFAULT_LING_PORT = 8082
DEFAULT_QWEN_PORT = 8083
DEFAULT_ROUTER_PORT = 9931
DEFAULT_LLAMA_SWAP_PORT = 8080
DEFAULT_LLAMA_SWAP_MODEL = "qwen-moe"

PORT_TO_ROUTER_MODEL: dict[int, str] = {
    DEFAULT_G9_PORT: "ai9stars_G9v3-3B-Q4_K_M",
    DEFAULT_LING_PORT: "Ling-3.0-tiny-Q4_K_M",
    DEFAULT_QWEN_PORT: "qwen2.5-coder-1.5b-q8_0",
    DEFAULT_ROUTER_PORT: "ai9stars_G9v3-3B-Q4_K_M",
}


def sanitize_think_tags(text: str) -> str:
    """Remove tags de raciocinio <think>...</think> emitidas por modelos locais."""
    if not text:
        return ""
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()


def _sanitize_completion_choices(choices: list[dict[str, Any]]) -> None:
    """Sanitiza tags <think></think> em escolhas retornadas pelo servidor."""
    for choice in choices:
        if "message" in choice and "content" in choice["message"]:
            raw_content = choice["message"]["content"]
            if raw_content:
                choice["message"]["content"] = sanitize_think_tags(raw_content)
        elif "text" in choice and choice["text"]:
            choice["text"] = sanitize_think_tags(choice["text"])


def _build_chat_payload(
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
    tools: list[dict[str, Any]] | None,
    tool_choice: str | dict[str, Any] | None,
    response_format: dict[str, Any] | None,
    model: str | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    if model:
        payload["model"] = model
    if tools:
        payload["tools"] = tools
        if tool_choice:
            payload["tool_choice"] = tool_choice
    if response_format:
        payload["response_format"] = response_format
    return payload


class LocalLlamaClient:
    """Cliente HTTP sincrono e ultraleve para instancias locais e router (:9931) do llama-server."""

    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = DEFAULT_ROUTER_PORT,
        timeout: float = 30.0,
        model: str | None = None,
    ) -> None:
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}/v1"  # NOSONAR
        self.timeout = timeout
        self.model = model
        self.router_model_id = model or PORT_TO_ROUTER_MODEL.get(port, PORT_TO_ROUTER_MODEL[DEFAULT_ROUTER_PORT])
        self._effective_port: int | None = None

    @staticmethod
    def get_engine_version() -> str:
        """Retorna a versao/identificador do runtime llama.cpp integrado."""
        return "llama.cpp-b12387-1.0-vulkan-router"

    def _probe_port_health(self, target_port: int, timeout_s: float = 1.0) -> bool:
        try:
            endpoint = "/v1/models" if target_port == DEFAULT_LLAMA_SWAP_PORT else "/health"
            url = f"http://{self.host}:{target_port}{endpoint}"  # NOSONAR
            req = urllib.request.Request(url, method="GET")  # noqa: S310  # Record-Id: registro-2026-09-29-saneamento-lint-e-calibracao
            with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310  # Record-Id: registro-2026-09-29-saneamento-lint-e-calibracao
                if resp.status != 200:
                    return False
                if target_port == DEFAULT_LLAMA_SWAP_PORT:
                    return True
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("status") in ("ok", "loaded", "loading model")
        except Exception:
            return False

    def is_healthy(self) -> bool:
        """Verifica se o router unificado (:9931), instancia dedicada ou fallback llama-swap (:8080) esta ativo."""
        if self.port != DEFAULT_ROUTER_PORT and self.port in PORT_TO_ROUTER_MODEL:
            # Sonde o router nativo (:9931) primeiro para evitar retry TCP em portas legadas fechadas no Windows.
            if self._probe_port_health(DEFAULT_ROUTER_PORT, timeout_s=min(self.timeout, 1.0)):
                self._effective_port = DEFAULT_ROUTER_PORT
                return True
            if self._probe_port_health(self.port, timeout_s=min(self.timeout, 0.5)):
                self._effective_port = self.port
                return True
            if self._probe_port_health(DEFAULT_LLAMA_SWAP_PORT, timeout_s=min(self.timeout, 0.5)):
                self._effective_port = DEFAULT_LLAMA_SWAP_PORT
                return True
            return False
        if self._probe_port_health(self.port, timeout_s=min(self.timeout, 1.5)):
            self._effective_port = self.port
            return True
        if self.port == DEFAULT_ROUTER_PORT and self._probe_port_health(
            DEFAULT_LLAMA_SWAP_PORT, timeout_s=min(self.timeout, 1.0)
        ):
            self._effective_port = DEFAULT_LLAMA_SWAP_PORT
            return True
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

    def _post_chat(self, target_port: int, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"http://{self.host}:{target_port}/v1/chat/completions"  # NOSONAR
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(  # noqa: S310  # Record-Id: registro-2026-09-29-saneamento-lint-e-calibracao
            url,
            data=req_data,
            headers={"Content-Type": "application/json", "Authorization": "Bearer local"},
            method="POST",
        )
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:  # noqa: S310  # Record-Id: registro-2026-09-29-saneamento-lint-e-calibracao
            result = json.loads(resp.read().decode("utf-8"))
        latency_ms = (time.time() - t0) * 1000.0
        result["_sota_telemetry"] = {
            "latency_ms": round(latency_ms, 2),
            "port": target_port,
            "requested_port": self.port,
            "model": payload.get("model"),
            "endpoint": url,
            "engine": self.get_engine_version(),
        }
        if "choices" in result:
            _sanitize_completion_choices(result["choices"])
        return result

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
        Redireciona portas legadas (8081-8083) para o router nativo (:9931) quando indisponiveis.
        """
        target_port = self._effective_port or self.port
        include_model = (
            target_port == DEFAULT_ROUTER_PORT or self.model is not None or self.port in PORT_TO_ROUTER_MODEL
        )
        payload = _build_chat_payload(
            messages,
            temperature,
            max_tokens,
            tools,
            tool_choice,
            response_format,
            model=self.router_model_id if include_model else None,
        )

        try:
            return self._post_chat(target_port, payload)
        except urllib.error.URLError as e:
            if target_port != DEFAULT_ROUTER_PORT and self.port in PORT_TO_ROUTER_MODEL:
                try:
                    router_payload = {**payload, "model": self.router_model_id}
                    result = self._post_chat(DEFAULT_ROUTER_PORT, router_payload)
                    self._effective_port = DEFAULT_ROUTER_PORT
                    return result
                except urllib.error.URLError:
                    pass
            if target_port != DEFAULT_LLAMA_SWAP_PORT:
                swap_fallback_model = os.environ.get("CHICO_LLAMA_SWAP_MODEL", DEFAULT_LLAMA_SWAP_MODEL)
                swap_models = [self.router_model_id]
                if swap_fallback_model and swap_fallback_model != self.router_model_id:
                    swap_models.append(swap_fallback_model)
                for idx, swap_model in enumerate(swap_models):
                    try:
                        swap_payload = {**payload, "model": swap_model}
                        result = self._post_chat(DEFAULT_LLAMA_SWAP_PORT, swap_payload)
                        self._effective_port = DEFAULT_LLAMA_SWAP_PORT
                        return result
                    except urllib.error.HTTPError as http_err:
                        if http_err.code in (400, 404) and idx + 1 < len(swap_models):
                            continue
                        break
                    except urllib.error.URLError:
                        break
            logger.exception("Falha de conexao com o llama-server na porta %d", target_port)
            raise ConnectionError(
                f"llama-server offline na porta {target_port}. Inicie via scripts/ops/Start-LlamaServer.ps1 -Port 9931"
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
