"""Structured HTTP access logs with request correlation and safe route labels."""

from __future__ import annotations

from typing import cast

from aiohttp import web
from aiohttp.abc import AbstractAccessLogger, BaseRequest
from aiohttp.web_response import StreamResponse

from api.v1.middleware_correlation import correlation_id_for


class RequestCorrelationAccessLogger(AbstractAccessLogger):
    """Emit bounded structured fields without recording URLs or query strings."""

    def log(self, request: BaseRequest, response: StreamResponse, time: float) -> None:
        typed_request = cast(web.Request, request)
        request_id = correlation_id_for(typed_request)
        match_info = getattr(typed_request, "match_info", None)
        route = getattr(match_info, "route", None) if match_info is not None else None
        route_resource = getattr(route, "resource", None) if route is not None else None
        canonical = getattr(route_resource, "canonical", None) if route_resource is not None else None
        route_template = canonical if isinstance(canonical, str) and canonical.startswith("/") else "unmatched"

        self.logger.info(
            "HTTP request completed request_id=%s",
            request_id,
            extra={
                "request_id": request_id,
                "http_method": getattr(typed_request, "method", "UNKNOWN"),
                "http_route": route_template,
                "http_status_code": response.status,
                "http_duration_seconds": time,
            },
        )
