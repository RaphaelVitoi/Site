"""
Web Middleware -- Autenticacao e CORS para o micro-servidor SOTA.
"""
import time
import secrets
from aiohttp import web
from llm.budget import API_SECRET_TOKEN


# SOTA: Estado do Rate Limiter (IP -> {count, window_start})
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 300
_ip_blocks = {}

@web.middleware
async def rate_limit_middleware(request, handler):
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
    if not API_SECRET_TOKEN:  # Token ausente = operacao local sem autenticacao
        return await handler(request)

    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return web.json_response({"error": "Autorizacao ausente ou mal formatada."}, status=401)

    token = auth_header.split(' ')[1]

        # SOTA: Confianca Zero com prevencao contra Timing Attacks
        if not secrets.compare_digest(token, API_SECRET_TOKEN):
        return web.json_response({"error": "Token invalido."}, status=403)

    return await handler(request)


@web.middleware
async def cors_middleware(request, handler):
    if request.method == 'OPTIONS':
        return web.Response(headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
    try:
        response = await handler(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except web.HTTPException as ex:
        if ex.headers is None:
            ex.headers = {}
        ex.headers['Access-Control-Allow-Origin'] = '*'
        raise
