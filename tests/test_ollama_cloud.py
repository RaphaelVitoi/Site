"""Testes unitarios para llm/ollama_cloud.py e disponibilidade do provider ollama."""

from __future__ import annotations

import contextlib
from typing import Any

import aiohttp
import pytest

from llm import ollama_cloud
from llm.providers import _check_provider_availability


class _FakeResponse:
    def __init__(self, status: int, body: str = "", headers: dict[str, str] | None = None) -> None:
        self.status = status
        self._body = body
        self.headers = headers or {}

    async def text(self) -> str:
        return self._body

    async def __aenter__(self) -> _FakeResponse:
        return self

    async def __aexit__(self, exc_type: object, exc: object, tb: object) -> bool:
        return False


class _FakeSession:
    def __init__(self, outcome: _FakeResponse | BaseException) -> None:
        self._outcome = outcome
        self.calls: list[dict[str, Any]] = []

    def post(self, url: str, **kwargs: Any) -> Any:
        self.calls.append({"url": url, **kwargs})
        if isinstance(self._outcome, BaseException):
            raise self._outcome
        return self._outcome


@pytest.fixture(autouse=True)
def _clean_ollama_circuit():
    ollama_cloud.reset_ollama_cloud_circuit()
    yield
    ollama_cloud.reset_ollama_cloud_circuit()


def test_call_ollama_cloud_sucesso_e_json(monkeypatch: pytest.MonkeyPatch) -> None:
    import asyncio

    monkeypatch.setattr("llm.laya_bridge.compor_advisory_s1", lambda sys_p, _u: (sys_p, None))
    session = _FakeSession(
        _FakeResponse(
            200,
            '{"message": {"content": "{\\"ok\\": true}"}, "prompt_eval_count": 12, "eval_count": 5}',
        )
    )
    txt, usage = asyncio.run(
        ollama_cloud.call_ollama_cloud(
            session,  # type: ignore[arg-type]
            "glm-5.3-flash",
            "sys",
            "usr",
            "k-secret",
            require_json=True,
        )
    )
    assert txt == '{"ok": true}'
    assert usage == {"prompt_tokens": 12, "completion_tokens": 5}
    assert len(session.calls) == 1
    assert session.calls[0]["json"]["format"] == "json"


def test_http_402_ativa_cooldown_local_e_short_circuit_provider(monkeypatch: pytest.MonkeyPatch) -> None:
    import asyncio

    monkeypatch.setattr("llm.laya_bridge.compor_advisory_s1", lambda sys_p, _u: (sys_p, None))
    monkeypatch.setattr(ollama_cloud, "is_configured", lambda: True)
    session = _FakeSession(_FakeResponse(402, '{"error": "usage credits auto reload payment failed"}'))

    coro_402 = ollama_cloud.call_ollama_cloud(session, "glm-5.3-flash", "sys", "usr", "k-secret")  # type: ignore[arg-type]
    with pytest.raises(RuntimeError, match="HTTP 402"):
        asyncio.run(coro_402)

    assert len(session.calls) == 1
    assert ollama_cloud.billing_cooldown_remaining_s() > 0.0
    assert asyncio.run(_check_provider_availability("ollama", "glm-5.3-flash")) is False

    # Segunda chamada falha localmente sem abrir nova tentativa HTTP
    coro_cooldown = ollama_cloud.call_ollama_cloud(session, "glm-5.3-flash", "sys", "usr", "k-secret")  # type: ignore[arg-type]
    with pytest.raises(RuntimeError, match="cooldown local de faturamento"):
        asyncio.run(coro_cooldown)
    assert len(session.calls) == 1

    ollama_cloud.reset_ollama_cloud_circuit()
    assert ollama_cloud.billing_cooldown_remaining_s() == 0.0
    assert asyncio.run(_check_provider_availability("ollama", "glm-5.3-flash")) is True


def test_http_429_e_client_error_diferenciam_de_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    import asyncio

    monkeypatch.setattr("llm.laya_bridge.compor_advisory_s1", lambda sys_p, _u: (sys_p, None))

    session_429 = _FakeSession(_FakeResponse(429, headers={"Retry-After": "12"}))
    coro_429 = ollama_cloud.call_ollama_cloud(session_429, "glm-5.3-flash", "", "usr", "k-secret")  # type: ignore[arg-type]
    with pytest.raises(RuntimeError, match="retry_after=12s"):
        asyncio.run(coro_429)

    session_net = _FakeSession(aiohttp.ClientConnectionError("dns failed"))
    coro_net = ollama_cloud.call_ollama_cloud(session_net, "glm-5.3-flash", "", "usr", "k-secret")  # type: ignore[arg-type]
    with pytest.raises(RuntimeError, match="Falha de rede Ollama Cloud"):
        asyncio.run(coro_net)

    session_timeout = _FakeSession(TimeoutError("deadline"))
    coro_timeout = ollama_cloud.call_ollama_cloud(session_timeout, "glm-5.3-flash", "", "usr", "k-secret")  # type: ignore[arg-type]
    with pytest.raises(RuntimeError, match="Timeout SOTA"):
        asyncio.run(coro_timeout)

    with contextlib.suppress(Exception):
        ollama_cloud.reset_ollama_cloud_circuit()
