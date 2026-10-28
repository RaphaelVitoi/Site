"""
Cliente de inferencia e telemetria para a engine Strata v0.1.39 MoE 125B.
Governado pelo Protocolo Chico SOTA v8.0 Gold.

Conecta-se ao no local da engine Strata (porta padrao 8080):
  - Suporte a OpenAI Chat Completions (/v1/chat/completions)
  - Suporte nativo a OpenAI Responses API (/v1/responses - Novo na v0.1.39)
  - Gestao elastica de VRAM (/v1/vram - redimensionamento dinamico em runtime)
  - Controle de ciclo de vida (/health, /props, /load, /unload)
"""

from __future__ import annotations

import http.client
import json
import logging
import re
import time
from typing import Any

import aiohttp


class StrataServerOfflineError(Exception):
    """SOTA GOLD: Exception raised when Strata server is unreachable."""

    def __init__(self, port: int):
        self.port = port
        self.message = (
            f"[WARN] [SOTA-LOCAL] Strata server is offline or unreachable on port {port}. "
            f"Please ensure the server is running. "
            f"Start it using the Strata startup script or check the Strata engine installation."
        )
        super().__init__(self.message)


logger = logging.getLogger(__name__)

DEFAULT_STRATA_HOST = "127.0.0.1"
DEFAULT_STRATA_PORT = 8080
CONTENT_TYPE_JSON = "application/json"
AUTH_BEARER_LOCAL = "Bearer local"
ENGINE_STRATA_VERSION = "Strata-v0.1.39"


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


def _build_strata_chat_payload(
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


class LocalStrataClient:
    """Cliente HTTP sincrono para operacao e controle da engine Strata."""

    def __init__(
        self,
        host: str = DEFAULT_STRATA_HOST,
        port: int = DEFAULT_STRATA_PORT,
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
        """Verifica se o servidor Strata esta ativo e pronto para servir."""
        try:
            status, data = self._request("GET", "/health", timeout=2.0)
            if status == 200:
                payload = json.loads(data.decode("utf-8"))
                return payload.get("status") in ("ok", "loaded", "loading model")
            return False
        except Exception:
            return False

    def is_sleeping(self) -> bool:
        """Verifica se o modelo foi descarregado por inatividade (--idle-unload)."""
        try:
            status, data = self._request("GET", "/props", timeout=2.0)
            if status == 200:
                payload = json.loads(data.decode("utf-8"))
                return bool(payload.get("is_sleeping", False))
            return False
        except Exception:
            return False

    def get_metrics(self) -> dict[str, Any]:
        """Obtem metricas de hardware, slots de decodificacao paralela e VRAM/RAM."""
        try:
            status, data = self._request("GET", "/metrics", timeout=3.0)
            if status == 200:
                return json.loads(data.decode("utf-8"))
            return {}
        except Exception as e:
            logger.debug("Falha ao obter metricas do Strata: %s", e)
            return {}

    def set_vram_elastic(self, reserve_mib: int | None) -> bool:
        """
        Redimensiona elasticamente o cache de VRAM da GPU sem reiniciar o processo (v0.1.39 #533).
        - reserve_mib: int (ex: 4000) libera VRAM para outra aplicacao.
        - reserve_mib: None restaura o cache ao tamanho original.
        - reserve_mib: 0 descarrega todo o cache para a CPU.
        """
        try:
            payload = json.dumps({"reserve_mib": reserve_mib}).encode("utf-8")
            status, _ = self._request(
                "POST",
                "/v1/vram",
                body=payload,
                headers={"Content-Type": CONTENT_TYPE_JSON},
                timeout=5.0,
            )
            return status == 200
        except Exception as e:
            logger.warning("Falha ao ajustar VRAM elastica do Strata: %s", e)
            return False

    def unload(self) -> bool:
        """Solicita o descarregamento imediato do modelo para liberar VRAM/RAM."""
        try:
            status, _ = self._request(
                "POST",
                "/unload",
                body=b"{}",
                headers={"Content-Type": CONTENT_TYPE_JSON},
                timeout=5.0,
            )
            return status == 200
        except Exception as e:
            logger.debug("Falha ao descarregar Strata: %s", e)
            return False

    def load(self) -> bool:
        """Carrega preventivamente o modelo na memoria antes de uma requisicao."""
        try:
            status, _ = self._request(
                "POST",
                "/load",
                body=b"{}",
                headers={"Content-Type": CONTENT_TYPE_JSON},
                timeout=10.0,
            )
            return status == 200
        except Exception as e:
            logger.debug("Falha ao carregar Strata: %s", e)
            return False

    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 1024) -> str:
        """Wrapper de conveniencia para obter completamento de texto direto."""
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
        """Executa chamada ao endpoint /v1/chat/completions com telemetria e sanitizacao."""
        payload = _build_strata_chat_payload(messages, temperature, max_tokens, tools, tool_choice, response_format)
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
                raise ConnectionError(f"Strata retornou HTTP {status}")
            result = json.loads(data.decode("utf-8"))
            latency_ms = (time.time() - t0) * 1000.0
            result["_sota_telemetry"] = {
                "latency_ms": round(latency_ms, 2),
                "port": self.port,
                "endpoint": f"{self.base_url}/chat/completions",
                "engine": ENGINE_STRATA_VERSION,
            }
            if "choices" in result:
                _sanitize_chat_choices(result["choices"])
            return result
        except Exception as e:
            logger.exception("Falha de conexao com o Strata na porta %d", self.port)
            raise ConnectionError(
                f"Strata offline na porta {self.port}. Inicie via scripts/ops/Start-StrataNode.ps1"
            ) from e

    def responses(
        self,
        input_messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str | dict[str, Any] | None = None,
        reasoning_effort: str | None = None,
        response_format: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Executa chamada ao endpoint /v1/responses (OpenAI Responses API, Strata v0.1.39 #451).
        Compativel nativamente com o Codex CLI, com suporte a caching de prompt de ~96%.
        """
        payload: dict[str, Any] = {
            "input": input_messages,
            "stream": False,
        }
        if tools:
            payload["tools"] = tools
            if tool_choice:
                payload["tool_choice"] = tool_choice
        if reasoning_effort:
            payload["reasoning_effort"] = reasoning_effort
        if response_format:
            payload["response_format"] = response_format

        req_data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "Authorization": AUTH_BEARER_LOCAL,
        }
        t0 = time.time()
        try:
            status, data = self._request(
                "POST",
                "/v1/responses",
                body=req_data,
                headers=headers,
                timeout=self.timeout,
            )
            if status != 200:
                raise ConnectionError(f"Strata retornou HTTP {status}")
            result = json.loads(data.decode("utf-8"))
            latency_ms = (time.time() - t0) * 1000.0
            result["_sota_telemetry"] = {
                "latency_ms": round(latency_ms, 2),
                "port": self.port,
                "endpoint": f"{self.base_url}/responses",
                "engine": ENGINE_STRATA_VERSION,
                "api": "responses",
            }
            return result
        except Exception as e:
            logger.exception("Falha ao chamar endpoint /v1/responses do Strata")
            raise StrataServerOfflineError(self.port) from e


class AsyncStrataClient:
    """Cliente HTTP assincrono (aiohttp) para operacao de alta densidade no ecossistema Site."""

    def __init__(
        self,
        host: str = DEFAULT_STRATA_HOST,
        port: int = DEFAULT_STRATA_PORT,
        timeout: float = 60.0,
    ) -> None:
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}/v1"  # NOSONAR
        self.control_url = f"http://{host}:{port}"  # NOSONAR
        self.timeout = timeout

    async def is_healthy(self, session: aiohttp.ClientSession | None = None) -> bool:
        """Verifica de forma assincrona a saude do no Strata."""
        url = f"{self.control_url}/health"
        close_session = False
        if session is None:
            session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=2.0))
            close_session = True
        try:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("status") in ("ok", "loaded", "loading model")
                return False
        except Exception:
            return False
        finally:
            if close_session:
                await session.close()

    async def chat_completion(
        self,
        session: aiohttp.ClientSession,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1024,
        response_format: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Executa completion assincrona compativel com /v1/chat/completions."""
        url = f"{self.base_url}/chat/completions"
        payload: dict[str, Any] = {
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if response_format:
            payload["response_format"] = response_format

        t0 = time.time()
        async with session.post(
            url,
            json=payload,
            headers={"Content-Type": CONTENT_TYPE_JSON, "Authorization": AUTH_BEARER_LOCAL},
            timeout=aiohttp.ClientTimeout(total=self.timeout),
        ) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise RuntimeError(f"Strata HTTP {resp.status}: {text}")
            result = await resp.json()
            latency_ms = (time.time() - t0) * 1000.0
            result["_sota_telemetry"] = {
                "latency_ms": round(latency_ms, 2),
                "port": self.port,
                "endpoint": url,
                "engine": ENGINE_STRATA_VERSION,
            }
            if "choices" in result:
                _sanitize_chat_choices(result["choices"])
            return result
