from __future__ import annotations

from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer
import pytest

from api.v1 import middleware
from api.v1.http_metrics import HTTP_METRICS_KEY, RequestMetricsRegistry, http_metrics_middleware
from api.v1.middleware_correlation import CORRELATION_HEADER
from api.v1.server import create_app
from database.queue_manager import QueueManager


@pytest.mark.asyncio
@pytest.mark.unit
async def test_http_metrics_use_route_templates_and_bound_histograms() -> None:
    app = web.Application(middlewares=[http_metrics_middleware])
    registry = RequestMetricsRegistry()
    app[HTTP_METRICS_KEY] = registry

    async def created(_request: web.Request) -> web.Response:
        return web.Response(status=201)

    app.router.add_get("/items/{item_id}", created)

    async with TestClient(TestServer(app)) as client:
        assert (await client.get("/items/first-user-value")).status == 201
        assert (await client.get("/items/second-user-value")).status == 201

    exposition = registry.render()
    labels = 'method="GET",route="/items/{item_id}",status_class="2xx"'
    assert f"nexus_http_requests_total{{{labels}}} 2" in exposition
    assert f"nexus_http_request_duration_seconds_count{{{labels}}} 2" in exposition
    assert f'nexus_http_request_duration_seconds_bucket{{{labels},le="+Inf"}} 2' in exposition
    assert "/items/first-user-value" not in exposition
    assert "/items/second-user-value" not in exposition


def test_http_histogram_uses_cumulative_buckets_and_bounded_labels() -> None:
    registry = RequestMetricsRegistry()
    registry.observe("TRACE", "/bounded", 503, 0.006)

    exposition = registry.render()
    labels = 'method="OTHER",route="/bounded",status_class="5xx"'
    assert f"nexus_http_requests_total{{{labels}}} 1" in exposition
    assert f'nexus_http_request_duration_seconds_bucket{{{labels},le="0.005"}} 0' in exposition
    assert f'nexus_http_request_duration_seconds_bucket{{{labels},le="0.01"}} 1' in exposition
    assert f'nexus_http_request_duration_seconds_bucket{{{labels},le="+Inf"}} 1' in exposition


@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_app_exposes_http_metrics_on_prometheus_route(monkeypatch) -> None:
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    manager = QueueManager(queue_path=":memory:")

    try:
        async with TestClient(TestServer(create_app(manager))) as client:
            health_response = await client.get("/health", headers={CORRELATION_HEADER: "health-probe-42"})
            assert health_response.status == 200
            assert health_response.headers[CORRELATION_HEADER] == "health-probe-42"
            metrics_response = await client.get("/metrics")
            exposition = await metrics_response.text()
    finally:
        await manager.close()

    assert metrics_response.status == 200
    assert "# TYPE nexus_http_request_duration_seconds histogram" in exposition
    assert 'nexus_http_requests_total{method="GET",route="/health",status_class="2xx"} 1' in exposition
