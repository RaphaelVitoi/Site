"""Request-scoped correlation IDs for API responses and logs."""

import re

from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer
import pytest

from api.v1.middleware import _correlacao
from api.v1.middleware_correlation import (
    CORRELATION_HEADER,
    request_correlation_middleware,
    request_id_response_prepare,
)


def _new_app() -> web.Application:
    app = web.Application(middlewares=[request_correlation_middleware])
    app.on_response_prepare.append(request_id_response_prepare)
    return app


@pytest.mark.asyncio
async def test_correlation_id_is_stable_and_returned_for_successful_response() -> None:
    app = _new_app()

    async def handle(request: web.Request) -> web.Response:
        return web.json_response({"ids": [_correlacao(request), _correlacao(request)]})

    app.router.add_get("/", handle)

    async with TestClient(TestServer(app)) as client:
        response = await client.get("/", headers={CORRELATION_HEADER: "request-123"})
        body = await response.json()

    assert response.headers[CORRELATION_HEADER] == "request-123"
    assert body["ids"] == ["request-123", "request-123"]


@pytest.mark.asyncio
async def test_invalid_id_is_replaced_and_attached_to_http_exception() -> None:
    app = _new_app()

    async with TestClient(TestServer(app)) as client:
        response = await client.get("/missing", headers={CORRELATION_HEADER: "invalid value"})

    request_id = response.headers[CORRELATION_HEADER]
    assert re.fullmatch(r"[a-f0-9]{16}", request_id)
    assert response.status == 404


@pytest.mark.asyncio
async def test_generated_ids_are_unique_per_request() -> None:
    app = _new_app()

    async def handle(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app.router.add_get("/", handle)

    async with TestClient(TestServer(app)) as client:
        first = await client.get("/")
        second = await client.get("/")

    assert first.headers[CORRELATION_HEADER] != second.headers[CORRELATION_HEADER]


@pytest.mark.asyncio
async def test_unhandled_server_error_keeps_correlation_header() -> None:
    app = _new_app()

    async def fail(_request: web.Request) -> web.Response:
        raise RuntimeError("simulated failure")

    app.router.add_get("/error", fail)

    async with TestClient(TestServer(app)) as client:
        response = await client.get("/error")

    assert response.status == 500
    assert re.fullmatch(r"[a-f0-9]{16}", response.headers[CORRELATION_HEADER])
