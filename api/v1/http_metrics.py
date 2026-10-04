"""Bounded-cardinality HTTP request metrics for each aiohttp application instance.

Registries are process-local; Prometheus should scrape each serving process and
aggregate the resulting series. Route labels use registered templates, never raw
request paths, so user-controlled path values cannot create unbounded series.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
import threading
import time

from aiohttp import web

_HISTOGRAM_BUCKETS_SECONDS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
_KNOWN_METHODS = frozenset({"DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"})


@dataclass(slots=True)
class _HistogramSeries:
    count: int = 0
    duration_sum: float = 0.0
    bucket_counts: list[int] = field(default_factory=lambda: [0] * len(_HISTOGRAM_BUCKETS_SECONDS))


class RequestMetricsRegistry:
    """In-process counters/histograms keyed only by bounded route metadata."""

    def __init__(self) -> None:
        self._series: dict[tuple[str, str, str], _HistogramSeries] = {}
        self._lock = threading.Lock()

    def observe(self, method: str, route: str, status: int, duration_seconds: float) -> None:
        method_label = method if method in _KNOWN_METHODS else "OTHER"
        status_class = f"{status // 100}xx" if 100 <= status <= 599 else "other"
        key = (method_label, route, status_class)
        duration = max(0.0, duration_seconds)

        with self._lock:
            series = self._series.setdefault(key, _HistogramSeries())
            series.count += 1
            series.duration_sum += duration
            for index, upper_bound in enumerate(_HISTOGRAM_BUCKETS_SECONDS):
                if duration <= upper_bound:
                    series.bucket_counts[index] += 1

    def render(self) -> str:
        """Return valid Prometheus text exposition with deterministic series order."""
        with self._lock:
            snapshot = [
                (key, series.count, series.duration_sum, tuple(series.bucket_counts))
                for key, series in sorted(self._series.items())
            ]

        lines: list[str] = [
            "# HELP nexus_http_requests_total Completed HTTP requests by method, route, and status class.",
            "# TYPE nexus_http_requests_total counter",
        ]
        for (method, route, status_class), count, _, _ in snapshot:
            labels = f'method="{_escape_label(method)}",route="{_escape_label(route)}",status_class="{status_class}"'
            lines.append(f"nexus_http_requests_total{{{labels}}} {count}")

        lines.extend(
            [
                "# HELP nexus_http_request_duration_seconds HTTP request duration by method, route, and status class.",
                "# TYPE nexus_http_request_duration_seconds histogram",
            ]
        )
        for (method, route, status_class), count, duration_sum, bucket_counts in snapshot:
            labels = f'method="{_escape_label(method)}",route="{_escape_label(route)}",status_class="{status_class}"'
            for upper_bound, bucket_count in zip(_HISTOGRAM_BUCKETS_SECONDS, bucket_counts, strict=True):
                lines.append(
                    f'nexus_http_request_duration_seconds_bucket{{{labels},le="{upper_bound:g}"}} {bucket_count}'
                )
            lines.extend(
                (
                    f'nexus_http_request_duration_seconds_bucket{{{labels},le="+Inf"}} {count}',
                    f"nexus_http_request_duration_seconds_sum{{{labels}}} {duration_sum:.9g}",
                    f"nexus_http_request_duration_seconds_count{{{labels}}} {count}",
                )
            )
        return "\n".join(lines) + "\n"


def _escape_label(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')


def _route_template(request: web.Request) -> str:
    match_info = getattr(request, "match_info", None)
    route = getattr(match_info, "route", None) if match_info is not None else None
    resource = getattr(route, "resource", None) if route is not None else None
    canonical = getattr(resource, "canonical", None) if resource is not None else None
    if not isinstance(canonical, str) or not canonical.startswith("/"):
        return "unmatched"
    return canonical


HTTP_METRICS_KEY: web.AppKey[RequestMetricsRegistry] = web.AppKey(
    "http_metrics",
    RequestMetricsRegistry,
)


@web.middleware
async def http_metrics_middleware(
    request: web.Request,
    handler: Callable[[web.Request], Awaitable[web.StreamResponse]],
) -> web.StreamResponse:
    """Observe completed requests without using raw paths as metric labels."""
    registry = request.app.get(HTTP_METRICS_KEY)
    if registry is None:
        return await handler(request)

    method = request.method.upper() if hasattr(request, "method") else "UNKNOWN"
    started_at = time.perf_counter()

    try:
        response = await handler(request)
    except web.HTTPException as exception:
        response = exception
    except asyncio.CancelledError:
        raise
    except Exception:
        route = _route_template(request)
        registry.observe(method, route, 500, time.perf_counter() - started_at)
        raise

    route = _route_template(request)
    registry.observe(method, route, response.status, time.perf_counter() - started_at)
    return response
