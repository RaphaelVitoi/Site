import asyncio
import json
import socket
import ssl
import urllib.error
import urllib.request
from typing import Any

import aiohttp
import certifi

_global_http_session: aiohttp.ClientSession | None = None
_global_http_session_lock = None  # Lazy - instanciado sob o event loop ativo

# Lazy Initialization das Primitivas Asyncio.
# A instanciacao direta no modulo viola o escopo do loop de eventos.
API_CONCURRENCY_SEMAPHORE = None


def get_api_semaphore():
    global API_CONCURRENCY_SEMAPHORE
    if API_CONCURRENCY_SEMAPHORE is None:
        API_CONCURRENCY_SEMAPHORE = asyncio.Semaphore(20)
    return API_CONCURRENCY_SEMAPHORE


async def get_global_http_session() -> aiohttp.ClientSession:
    global _global_http_session, _global_http_session_lock
    if _global_http_session_lock is None:
        _global_http_session_lock = asyncio.Lock()
    async with _global_http_session_lock:
        if _global_http_session is None or _global_http_session.closed:
            ssl_context = ssl.create_default_context(cafile=certifi.where())
            ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
            connector = aiohttp.TCPConnector(
                ssl=ssl_context,
                family=socket.AF_INET,
                limit=60,  # teto global (semaphore=20 + gordura de infra)
                limit_per_host=20,  # espelha API_CONCURRENCY_SEMAPHORE
                keepalive_timeout=5,  # SOTA: Reduzido para 5s para evitar que a API drope a conexao tcp prematuramente (Connection closed)
                ttl_dns_cache=300,  # renova IPs de load balancers a cada 5 min
                enable_cleanup_closed=True,
            )
            default_headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Connection": "keep-alive",
            }
            # SOTA: Timeouts intrinsecos de socket para evitar paralisia I/O (TCP Drop).
            # connect=15s (teto maximo do handshake), sock_read=300s (tempo limite sem receber bytes vivos).
            global_timeout = aiohttp.ClientTimeout(total=600, connect=15, sock_read=300)
            _global_http_session = aiohttp.ClientSession(
                trust_env=True,
                connector=connector,
                headers=default_headers,
                timeout=global_timeout,
            )
        return _global_http_session


def _sync_fallback_request(
    url: str, payload: dict[str, Any], headers: dict[str, str], timeout_seconds: float
) -> tuple[int, str]:
    """
    Motor sincrono nativo em C (urllib).
    Imune a anomalia de TCP Drop (HTTP 400: b'') do aiohttp em ambientes Windows.
    Executado em Thread isolada para nao bloquear o Event Loop principal.
    """
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        # SOTA: Injeta o mesmo contexto SSL do certifi no fallback para consistencia de rede.
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
        with urllib.request.urlopen(  # noqa: S310
            req, timeout=timeout_seconds, context=ssl_context
        ) as response:
            return response.getcode(), response.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        # SOTA: O objeto HTTPError mantem o socket aberto.
        # O uso do Context Manager garante o fechamento do File Descriptor instantaneamente no Windows.
        with e:
            try:
                error_body = e.read().decode("utf-8", errors="ignore")
            except Exception:  # noqa: BLE001
                error_body = "(Falha ao ler corpo do erro)"
            return e.code, error_body
    except urllib.error.URLError as e:
        return 0, f"Ruptura DNS/TCP (URLError): {e.reason!s}"
    except Exception as e:  # noqa: BLE001
        return 0, f"Entropia Nativa: {e!s}"
