"""
Base client for local LLM engines (Strata, Splash, etc.) that provide
OpenAI-compatible APIs and basic health/control endpoints.
Governanca: Protocolo Master Chico SOTA v8.0 GOLD.
"""

from __future__ import annotations

import http.client
import json
import logging
import re
import time
from typing import Any

logger = logging.getLogger(__name__)

CONTENT_TYPE_JSON = "application/json"
AUTH_BEARER_LOCAL = "Bearer local"


def sanitize_think_tags(text: str) -> str:
    """Remove tags de raciocinio <think>...</think> emitidas pelo modelo local."""
    if not text:
        return ""
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()


def _sanitize_chat_choices(choices: list[dict[str, Any]]) -> None:
    for choice in choices:
        msg = choice.get("message")
        if isinstance(msg, dict):
            raw_content = msg.get("content")
            if raw_content:
                msg["content"] = sanitize_think_tags(raw_content)


def _build_chat_payload(
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
    tools: list[dict[str, Any]] | None = None,
    tool_choice: str | dict[str, Any] | None = None,
    response_format: dict[str, Any] | None = None,
) -> dict[str, Any]:
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
    return payload


class LocalEngineClient:
    """Base client for local LLM engines."""

    def __init__(
        self,
        host: str,
        port: int,
        timeout: float = 60.0,
    ) -> None:
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}/v1"  # NOSONAR
        self.control_url = f"http://{host}:{port}"  # NOSONAR
        self.timeout = timeout

    def _request(
        self,
        method: str,
        path: str,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> tuple[int, bytes]:
        req_headers = headers or {}
        conn = http.client.HTTPConnection(self.host, self.port, timeout=timeout or self.timeout)
        try:
            conn.request(method, path, body=body, headers=req_headers)
            resp = conn.getresponse()
            data = resp.read()
            return resp.status, data
        finally:
            conn.close()

    def is_healthy(self) -> bool:
        try:
            status, data = self._request("GET", "/health", timeout=2.0)
            if status == 200:
                payload = json.loads(data.decode("utf-8"))
                return payload.get("status") in ("ok", "loaded", "loading model")
            return False
        except Exception:
            return False

    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 1024) -> str:
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
        payload = _build_chat_payload(messages, temperature, max_tokens, tools, tool_choice, response_format)
        req_data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "Authorization": AUTH_BEARER_LOCAL,
        }
        t0 = time.time()
        try:
            status, data = self._request(
                "POST",
                "/v1/chat/completions",
                body=req_data,
                headers=headers,
                timeout=self.timeout,
            )
            if status != 200:
                raise ConnectionError(f"Local Engine returned HTTP {status}")
            result = json.loads(data.decode("utf-8"))
            latency_ms = (time.time() - t0) * 1000.0
            result["_sota_telemetry"] = {
                "latency_ms": round(latency_ms, 2),
                "port": self.port,
                "endpoint": f"{self.base_url}/chat/completions",
                "engine": self.get_engine_version(),
            }
            if "choices" in result:
                _sanitize_chat_choices(result["choices"])
            return result
        except Exception as e:
            logger.exception("Connection failure with local engine on port %d", self.port)
            raise ConnectionError(f"Local engine offline on port {self.port}") from e

    def get_engine_version(self) -> str:
        raise NotImplementedError
