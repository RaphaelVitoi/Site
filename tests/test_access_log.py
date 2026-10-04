"""Structured aiohttp access logs keep correlation without leaking query data."""

import logging
from typing import Any, cast

from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer
import pytest

from api.v1 import server as api_server
from api.v1.access_log import RequestCorrelationAccessLogger
from api.v1.middleware_correlation import (
    CORRELATION_HEADER,
    request_correlation_middleware,
    request_id_response_prepare,
)


@pytest.mark.asyncio
async def test_access_log_emits_correlation_and_omits_query_parameters(caplog) -> None:
    app = web.Application(middlewares=[request_correlation_middleware])
    app.on_response_prepare.append(request_id_response_prepare)

    async def handle(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app.router.add_get("/private", handle)
    server = TestServer(app)

    with caplog.at_level(logging.INFO, logger="aiohttp.access"):
        await server.start_server(access_log_class=RequestCorrelationAccessLogger)
        async with TestClient(server) as client:
            response = await client.get(
                "/private?token=must-not-appear",
                headers={CORRELATION_HEADER: "trace-42"},
            )
            await response.read()

    record = next(record for record in caplog.records if record.getMessage().startswith("HTTP request completed"))
    assert response.headers[CORRELATION_HEADER] == "trace-42"
    assert record.request_id == "trace-42"
    assert record.http_method == "GET"
    assert record.http_route == "/private"
    assert record.http_status_code == 200
    assert record.http_duration_seconds >= 0
    assert "must-not-appear" not in record.getMessage()


@pytest.mark.asyncio
async def test_api_server_configures_correlation_access_log(monkeypatch) -> None:
    runner_options: dict[str, Any] = {}
    real_app_runner = api_server.web.AppRunner

    def capture_runner(app: web.Application, **kwargs: Any) -> web.AppRunner:
        runner_options.update(kwargs)
        return real_app_runner(app, **kwargs)

    class ImmediateSite:
        def __init__(self, _runner: object, _host: str, _port: int, **_kwargs: object) -> None:
            pass

        async def start(self) -> None:
            return None

    class CompletedEvent:
        async def wait(self) -> None:
            return None

    monkeypatch.setattr(api_server.web, "AppRunner", capture_runner)
    monkeypatch.setattr(api_server.web, "TCPSite", ImmediateSite)
    monkeypatch.setattr(api_server, "create_app", lambda _manager: web.Application())
    monkeypatch.setattr(api_server.asyncio, "Event", CompletedEvent)
    for name in ("K_SERVICE", "DOCKER_CONTAINER", "NEXUS_PORT", "PORT", "HOST"):
        monkeypatch.delenv(name, raising=False)

    await api_server.start_api_server(cast(Any, object()), port=0)

    assert runner_options["access_log_class"] is RequestCorrelationAccessLogger
