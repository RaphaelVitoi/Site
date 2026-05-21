"""
Middlewares SOTA -- Interceptadores para Limite de Taxa, Autenticação e CORS.
"""
# pylint: disable=broad-exception-caught
import base64
import hashlib
import hmac
import json
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

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")


def base64url_decode(payload: str) -> bytes:
    """Decodifica uma string base64url em bytes."""
    rem = len(payload) % 4
    if rem > 0:
        payload += "=" * (4 - rem)
    return base64.urlsafe_b64decode(payload)


def verify_hs256_jwt(token: str, secret: str) -> dict | None:
    """
    Decodifica e verifica a assinatura HS256 de um JWT do Supabase usando apenas a stdlib do Python.
    Retorna o payload se for valido, ou None se for invalido ou expirado.
    """
    parts = token.split(".")
    if len(parts) != 3:
        return None

    header_segment, payload_segment, crypto_segment = parts

    try:
        # 1. Verificar a assinatura
        key = secret.encode("utf-8")
        msg = f"{header_segment}.{payload_segment}".encode("utf-8")
        signature = hmac.new(key, msg, hashlib.sha256).digest()
        raw_crypto = base64url_decode(crypto_segment)

        if not hmac.compare_digest(signature, raw_crypto):
            return None

        # 2. Decodificar o payload
        payload_data = base64url_decode(payload_segment)
        payload = json.loads(payload_data.decode("utf-8"))

        # 3. Verificar expiracao
        exp = payload.get("exp")
        if exp is not None:
            now = time.time()
            if now > exp:
                return None  # Token expirado

        return payload
    except Exception:  # noqa: BLE001
        return None


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
    """Aplica limite de requisicoes por IP na janela de tempo definida."""
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
    """Verifica tokens de autorizacao e aplica validacao de origem."""
    if request.method == "OPTIONS":
        return await handler(request)

    origin = request.headers.get("Origin")
    if not API_SECRET_TOKEN and not SUPABASE_JWT_SECRET:
        # Sem token explicito e sem Supabase configurado,
        # aceitamos apenas clientes locais nao-browser
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

    # Verificar se e um token JWT (formado por 3 segmentos com pontos)
    if len(token.split(".")) == 3:
        if not SUPABASE_JWT_SECRET:
            return web.json_response(
                {
                    "error": "Configuracao de autenticacao JWT ausente "
                    "no backend (SUPABASE_JWT_SECRET nao definido)."
                },
                status=500,
            )
        payload = verify_hs256_jwt(token, SUPABASE_JWT_SECRET)
        if payload is None:
            return web.json_response(
                {"error": "Token JWT do Supabase invalido ou expirado."},
                status=403
            )
        # SOTA: Injeta dados do usuario autenticado no request context para controle de RLS/Tenant
        request["user_id"] = payload.get("sub")
        request["user_role"] = payload.get("role", "authenticated")
        return await handler(request)

    # Fallback: se nao for JWT, valida contra a API_SECRET_TOKEN legada
    if not API_SECRET_TOKEN:
        return web.json_response(
            {"error": "API_SECRET_TOKEN nao configurada para autenticacao legada."},
            status=403
        )

    if not secrets.compare_digest(token, API_SECRET_TOKEN):
        return web.json_response({"error": "Token invalido."}, status=403)

    return await handler(request)



@web.middleware
async def cors_middleware(request, handler):
    """Injeta cabecalhos CORS em requisicoes de origens confiaveis."""
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
