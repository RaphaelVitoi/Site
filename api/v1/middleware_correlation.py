"""Assign a validated request ID and expose it on every HTTP response."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from contextlib import suppress
import re
import uuid

from aiohttp import web

from api.v1.keys import REQUEST_ID_KEY

CORRELATION_HEADER = "X-Request-Id"
_REQUEST_ID_PATTERN = re.compile(r"[A-Za-z0-9._:-]{1,128}\Z")


def correlation_id_for(request: web.Request) -> str:
    """Return one stable, sanitized ID for the lifetime of an aiohttp request."""
    try:
        request_id = request[REQUEST_ID_KEY]
    except (AttributeError, KeyError, TypeError):
        request_id = None
    if isinstance(request_id, str) and _REQUEST_ID_PATTERN.fullmatch(request_id):
        return request_id

    headers = getattr(request, "headers", None) or {}
    provided_id = headers.get(CORRELATION_HEADER, "").strip()
    request_id = provided_id if _REQUEST_ID_PATTERN.fullmatch(provided_id) else uuid.uuid4().hex[:16]
    with suppress(AttributeError, TypeError):
        request[REQUEST_ID_KEY] = request_id
    return request_id


@web.middleware
async def request_correlation_middleware(
    request: web.Request,
    handler: Callable[[web.Request], Awaitable[web.StreamResponse]],
) -> web.StreamResponse:
    """Initialize request correlation before rate limiting, auth, and route handling."""
    correlation_id_for(request)
    return await handler(request)


async def request_id_response_prepare(request: web.Request, response: web.StreamResponse) -> None:
    """Attach the request ID immediately before headers are sent, including 500s."""
    response.headers[CORRELATION_HEADER] = correlation_id_for(request)
