"""Testes hermeticos dos endpoints FastAPI do Chrysalis Live Engine."""

from __future__ import annotations

import json
from pathlib import Path

from aiohttp import web
from aiohttp.test_utils import make_mocked_request
import pytest

from api.v1.handlers import (
    handle_chrysalis_health,
    handle_chrysalis_validate_plan,
)
from api.v1.server import create_app
from database.queue_manager import QueueManager


@pytest.mark.asyncio
async def test_chrysalis_health_retorna_success_com_sonda_offline() -> None:
    request = make_mocked_request("GET", "/api/v1/chrysalis/health", app=web.Application())
    response = await handle_chrysalis_health(request)
    assert response.status == 200
    payload = json.loads(response.text or "")
    assert payload["status"] == "SUCCESS"
    assert payload["health"]["status"] in {"ONLINE", "OFFLINE"}


@pytest.mark.asyncio
async def test_chrysalis_validate_plan_stale_retorna_409() -> None:
    body = {
        "workspace_path": "apps/x.md",
        "content": "hello",
        "new_content": "novo",
        "expected_revision": "deadbeef",
        "mode": "full",
        "approved": True,
    }
    request = make_mocked_request("POST", "/api/v1/chrysalis/validate-plan", app=web.Application())

    async def _json() -> dict:
        return body

    request.json = _json  # type: ignore[assignment]
    response = await handle_chrysalis_validate_plan(request)
    assert response.status == 409


@pytest.mark.asyncio
async def test_chrysalis_validate_plan_plan_mode_retorna_success() -> None:
    content = "hello"
    body = {
        "workspace_path": "apps/x.md",
        "content": content,
        "new_content": "novo",
        "mode": "plan",
        "approved": False,
    }
    request = make_mocked_request("POST", "/api/v1/chrysalis/validate-plan", app=web.Application())

    async def _json() -> dict:
        return body

    request.json = _json  # type: ignore[assignment]
    response = await handle_chrysalis_validate_plan(request)
    assert response.status == 200
    payload = json.loads(response.text or "")
    assert payload["status"] == "SUCCESS"
    assert payload["path"] == "apps/x.md"


@pytest.mark.asyncio
async def test_chrysalis_validate_plan_accept_sem_aprovacao_retorna_403() -> None:
    content = "hello"
    body = {
        "workspace_path": "apps/x.md",
        "content": content,
        "new_content": "novo",
        "mode": "accept",
        "approved": False,
    }
    request = make_mocked_request("POST", "/api/v1/chrysalis/validate-plan", app=web.Application())

    async def _json() -> dict:
        return body

    request.json = _json  # type: ignore[assignment]
    response = await handle_chrysalis_validate_plan(request)
    assert response.status == 403


def test_rotas_chrysalis_registradas_na_aplicacao(tmp_path: Path) -> None:
    app = create_app(QueueManager(queue_path=str(tmp_path / "chrysalis.db")))
    routes = {(route.method, route.resource.canonical) for route in app.router.routes() if route.resource}
    assert ("GET", "/api/v1/chrysalis/health") in routes
    assert ("POST", "/api/v1/chrysalis/validate-plan") in routes
