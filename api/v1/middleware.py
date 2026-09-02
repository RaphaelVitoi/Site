"""
Middlewares SOTA -- Interceptadores para Limite de Taxa, Autenticacao e CORS.
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

# Tolerancia para relogios dessincronizados entre emissor e backend (segundos).
JWT_CLOCK_SKEW_SECONDS = 60


def _jwt_secret() -> str | None:
    """Segredo JWT vigente: o ambiente atual tem precedencia sobre o lido no import.

    Assim uma rotacao de segredo em runtime passa a valer sem reiniciar o processo,
    e o valor de modulo continua servindo de default sobrescrivel.
    """
    return os.environ.get("SUPABASE_JWT_SECRET") or SUPABASE_JWT_SECRET


def _expected_claim(var: str) -> str | None:
    value = os.environ.get(var, "").strip()
    return value or None


def _audience_matches(claim: object, expected: str) -> bool:
    if isinstance(claim, str):
        return claim == expected
    if isinstance(claim, list):
        return expected in claim
    return False


def base64url_decode(payload: str) -> bytes:
    """Decodifica uma string base64url em bytes."""
    rem = len(payload) % 4
    if rem > 0:
        payload += "=" * (4 - rem)
    return base64.urlsafe_b64decode(payload)


def _header_is_hs256(header_segment: str) -> bool:
    """Aceita apenas HS256 declarado no proprio header.

    Sem esta checagem, o algoritmo era inferido do formato do token: qualquer JWT
    de tres segmentos entrava no verificador HS256, inclusive `alg: none`.
    """
    try:
        header = json.loads(base64url_decode(header_segment).decode("utf-8"))
    except Exception:  # noqa: BLE001
        return False
    return isinstance(header, dict) and header.get("alg") == "HS256"


def _verify_hs256_signature(header_segment: str, payload_segment: str, crypto_segment: str, secret: str) -> bool:
    key = secret.encode()
    msg = f"{header_segment}.{payload_segment}".encode()
    signature = hmac.new(key, msg, hashlib.sha256).digest()
    raw_crypto = base64url_decode(crypto_segment)
    return hmac.compare_digest(signature, raw_crypto)


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
        # 1. Algoritmo declarado
        if not _header_is_hs256(header_segment):
            return None

        # 2. Verificar a assinatura
        if not _verify_hs256_signature(header_segment, payload_segment, crypto_segment, secret):
            return None

        # 3. Decodificar o payload
        payload_data = base64url_decode(payload_segment)
        payload = json.loads(payload_data.decode("utf-8"))
        if not isinstance(payload, dict):
            return None

        # 4. Janela temporal (exp / nbf / iat)
        now = time.time()
        exp = payload.get("exp")
        if exp is not None and now > float(exp) + JWT_CLOCK_SKEW_SECONDS:
            return None  # Token expirado
        nbf = payload.get("nbf")
        if nbf is not None and now < float(nbf) - JWT_CLOCK_SKEW_SECONDS:
            return None  # Token ainda nao valido
        iat = payload.get("iat")
        if iat is not None and now < float(iat) - JWT_CLOCK_SKEW_SECONDS:
            return None  # Emitido no futuro

        # 5. Emissor e audiencia, quando declarados no ambiente
        expected_iss = _expected_claim("SUPABASE_JWT_ISSUER")
        if expected_iss and payload.get("iss") != expected_iss:
            return None
        expected_aud = _expected_claim("SUPABASE_JWT_AUDIENCE")
        if expected_aud and not _audience_matches(payload.get("aud"), expected_aud):
            return None

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


async def _handle_no_token_auth(request, origin, handler):
    """Lida com requisicoes sem token configurado."""
    if not _is_loopback(getattr(request, "remote", None)):
        return web.json_response({"error": "Acesso restrito a clientes locais."}, status=403)
    if origin and not _origin_is_trusted(origin):
        return web.json_response(
            {"error": "Origin nao confiavel para operacao sem token (Security Token not configured)."},
            status=403,
        )
    return await handler(request)


async def _handle_jwt_token_auth(token: str, request, handler):
    """Verifica um token JWT contra a chave secreta do Supabase."""
    secret = _jwt_secret()
    if not secret:
        return web.json_response(
            {"error": "Configuracao de autenticacao JWT ausente no backend (SUPABASE_JWT_SECRET nao definido)."},
            status=500,
        )
    payload = verify_hs256_jwt(token, secret)
    if payload is None:
        return web.json_response({"error": "Token JWT do Supabase invalido ou expirado."}, status=403)
    request["user_id"] = payload.get("sub")
    request["user_role"] = payload.get("role", "authenticated")
    return await handler(request)


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
        return web.json_response({"error": "Rate limit excedido. Defesa de entropia ativada."}, status=429)

    return await handler(request)


@web.middleware
async def auth_middleware(request, handler):
    """Verifica tokens de autorizacao e aplica validacao de origem."""
    if request.method == "OPTIONS":
        return await handler(request)

    origin = request.headers.get("Origin")
    if not API_SECRET_TOKEN and not _jwt_secret():
        return await _handle_no_token_auth(request, origin, handler)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return web.json_response({"error": "Autorizacao ausente ou mal formatada."}, status=401)

    token = auth_header.split(" ")[1]

    # Verificar se e um token JWT (formado por 3 segmentos com pontos)
    if len(token.split(".")) == 3:
        return await _handle_jwt_token_auth(token, request, handler)

    # Fallback: se nao for JWT, valida contra a API_SECRET_TOKEN legada
    if not API_SECRET_TOKEN:
        return web.json_response({"error": "API_SECRET_TOKEN nao configurada para autenticacao legada."}, status=403)

    if not secrets.compare_digest(token, API_SECRET_TOKEN):
        return web.json_response({"error": "Token invalido."}, status=403)

    return await handler(request)


@web.middleware
async def cookie_middleware(request, handler):
    """
    SOTA v6.2.1 GOLD: Middleware de Cookies para Gestao Isomorfica de Sessao.
    Garante que estados de IA sejam persistidos de forma segura no Browser.
    """
    session_id = request.cookies.get("SOTA_SESSION_ID")
    if not session_id:
        session_id = secrets.token_urlsafe(32)

    response = await handler(request)

    # Injeta cookie de sessao se nao existir ou se for renovado
    if not request.cookies.get("SOTA_SESSION_ID"):
        response.set_cookie(
            "SOTA_SESSION_ID",
            session_id,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=3600 * 24 * 7,  # 7 dias
        )
    return response


@web.middleware
async def security_headers_middleware(request, handler):
    """
    SOTA: Injeta cabecalhos de isolamento de origem para habilitar SharedArrayBuffer e WebGPU.
    Essencial para a performance Zero-Copy do motor matematico WASM.
    """
    try:
        response = await handler(request)
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        # Hardening Adicional
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response
    except web.HTTPException as ex:
        ex.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        ex.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        raise


@web.middleware
async def cors_middleware(request, handler):
    """Injeta cabecalhos CORS em requisicoes de origens confiaveis."""
    origin = request.headers.get("Origin")
    allow_origin = origin if _origin_is_trusted(origin) else None

    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, SOTA-Session-ID, SOTA-Client-Version",
            "Access-Control-Allow-Credentials": "true",
        }
        if allow_origin:
            headers["Access-Control-Allow-Origin"] = allow_origin
            headers["Vary"] = "Origin"
        return web.Response(headers=headers)
    try:
        response = await handler(request)
        if allow_origin:
            response.headers["Access-Control-Allow-Origin"] = allow_origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"
        return response
    except web.HTTPException as ex:
        if allow_origin:
            ex.headers["Access-Control-Allow-Origin"] = allow_origin
            ex.headers["Access-Control-Allow-Credentials"] = "true"
            ex.headers["Vary"] = "Origin"
        raise
