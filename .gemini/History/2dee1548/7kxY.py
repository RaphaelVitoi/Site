"""
Web Middleware -- Autenticacao e CORS para o micro-servidor SOTA.
"""

import os
import secrets
import time

from aiohttp import web

from llm.budget import API_SECRET_TOKEN

# SOTA: Estado do Rate Limiter (IP -> {count, window_start})
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 300
_ip_blocks = {}
DEFAULT_TRUSTED_ORIGINS = (
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:17042",
    "http://localhost:17042",
)


def _trusted_origins() -> set[str]:
    raw = os.environ.get("NEXUS_TRUSTED_ORIGINS", "")
    if not raw.strip():
        return set(DEFAULT_TRUSTED_ORIGINS)
    return {origin.strip() for origin in raw.split(",") if origin.strip()}


def _origin_is_trusted(origin: str | None) -> bool:
    return bool(origin) and origin in _trusted_origins()


def _is_loopback(remote: str | None) -> bool:
    return remote in {"127.0.0.1", "::1", "localhost"}


@web.middleware
async def rate_limit_middleware(request, handler):
    """Middleware SOTA para aplicacao de Rate Limit por IP."""
    ip = request.remote or "127.0.0.1"
    current_time = time.time()

    record = _ip_blocks.get(ip, {"count": 0, "start_time": current_time})
    if current_time - record["start_time"] > RATE_LIMIT_WINDOW:
        record = {"count": 0, "start_time": current_time}

    record["count"] += 1
    _ip_blocks[ip] = record

    if record["count"] > MAX_REQUESTS_PER_WINDOW:
        return web.json_response(
            {"error": "Rate limit excedido. Defesa de entropia ativada."}, status=429
        )

    return await handler(request)


@web.middleware
async def auth_middleware(request, handler):
    """Middleware SOTA para autenticacao e validacao de tokens."""
    if request.method == "OPTIONS":
        return await handler(request)

    origin = request.headers.get("Origin")
    if not API_SECRET_TOKEN:
        # Sem token explicito, aceitamos apenas clientes locais nao-browser
        # ou origins locais permitidas de forma explicita.
        if not _is_loopback(request.remote):
            return web.json_response(
                {"error": "Acesso restrito a clientes locais."}, status=403
            )
        if origin and not _origin_is_trusted(origin):
            return web.json_response(
                {"error": "Origin nao confiavel para operacao sem token."}, status=403
            )
        return await handler(request)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return web.json_response(
            {"error": "Autorizacao ausente ou mal formatada."}, status=401
        )

    token = auth_header.split(" ")[1]

    # SOTA: Confianca Zero com prevencao contra Timing Attacks
    if not secrets.compare_digest(token, API_SECRET_TOKEN):
        return web.json_response({"error": "Token invalido."}, status=403)

    return await handler(request)


@web.middleware
async def cors_middleware(request, handler):
    """Middleware SOTA para gerenciamento de politicas CORS."""
    origin = request.headers.get("Origin")
    allow_origin = origin if _origin_is_trusted(origin) else None

    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
        if allow_origin:
            headers["Access-Control-Allow-Origin"] = allow_origin
            headers["Vary"] = "Origin"
        return web.Response(headers=headers)
    try:
        response = await handler(request)
        if allow_origin:
            response.headers["Access-Control-Allow-Origin"] = allow_origin
            response.headers["Vary"] = "Origin"
        return response
    except web.HTTPException as ex:
        if allow_origin:
            ex.headers["Access-Control-Allow-Origin"] = allow_origin
            ex.headers["Vary"] = "Origin"
        raise
