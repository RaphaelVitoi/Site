"""
SOTA Global Session Manager.
Gerencia as sessoes HTTP globais (aiohttp) e primitivas de sincronizacao (Semaphore/Lock)
para garantir resiliencia de conexao e prevencao de vazamento de I/O em ambientes assincronos.
"""

# pylint: disable=global-statement, broad-exception-caught
# ruff: noqa: S310
import asyncio
import contextlib
import json
import socket
import ssl
import threading
from typing import Any
import urllib.error
import urllib.request

import aiohttp
import certifi

# Sessoes HTTP sao POR EVENT LOOP: um ClientSession criado num loop nao pode ser
# usado em outro ("attached to a different loop"). O fallback System-2 roda em
# thread dedicada com loop proprio, entao mantemos uma sessao por loop — mesmo
# padrao de _API_SEMAPHORES. O loop vai junto no valor para que seu id() nao
# seja reciclado por um loop futuro enquanto a sessao estiver viva; entradas
# de loops encerrados sao podadas no proximo acesso.
_GLOBAL_HTTP_SESSIONS: dict[int, tuple[asyncio.AbstractEventLoop, aiohttp.ClientSession]] = {}
_HTTP_SESSIONS_GUARD = threading.Lock()

# Primitivas Asyncio sao POR EVENT LOOP: um asyncio.Semaphore/Lock compartilhado
# entre loops distintos (ex.: asyncio.run por chamada + loop dedicado do
# fallback System-2) quebra com "bound to a different event loop" sob contencao.
# Mantemos um semaforo por loop, no mesmo padrao de budget.get_telemetry_lock.
API_CONCURRENCY_LIMIT = 20
_API_SEMAPHORES: dict[int, tuple[asyncio.AbstractEventLoop, asyncio.Semaphore]] = {}
_API_SEMAPHORES_GUARD = threading.Lock()


def _purge_dead_loop_entries(
    registry: dict[int, tuple[asyncio.AbstractEventLoop, Any]], active_loop: asyncio.AbstractEventLoop
) -> None:
    """Remove entradas de loops encerrados — nada mais pode usa-las e, com a
    referencia ao loop no valor, seu id() nao e reciclado por um loop futuro."""
    for lid, (loop_obj, _) in list(registry.items()):
        if loop_obj.is_closed() and loop_obj is not active_loop:
            registry.pop(lid, None)


def make_client_timeout(
    total: float | None = None,
    connect: float | None = None,
    sock_read: float | None = None,
    sock_connect: float | None = None,
    ceil_threshold: float = 5.0,
) -> aiohttp.ClientTimeout:
    """Instancia ClientTimeout com compatibilidade estrita para type checkers (Pyright/Pylance)."""
    kwargs: dict[str, Any] = {"ceil_threshold": ceil_threshold}
    if total is not None:
        kwargs["total"] = total
    if connect is not None:
        kwargs["connect"] = connect
    if sock_read is not None:
        kwargs["sock_read"] = sock_read
    if sock_connect is not None:
        kwargs["sock_connect"] = sock_connect
    return aiohttp.ClientTimeout(**kwargs)


def get_api_semaphore() -> asyncio.Semaphore:
    """Retorna o semaforo de concorrencia do event loop corrente."""
    loop = asyncio.get_running_loop()
    loop_id = id(loop)
    with _API_SEMAPHORES_GUARD:
        _purge_dead_loop_entries(_API_SEMAPHORES, loop)
        par = _API_SEMAPHORES.get(loop_id)
        if par is None or par[0] is not loop:
            par = (loop, asyncio.Semaphore(API_CONCURRENCY_LIMIT))
            _API_SEMAPHORES[loop_id] = par
        return par[1]


def _build_http_session() -> aiohttp.ClientSession:
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    connector = aiohttp.TCPConnector(
        ssl=ssl_context,
        family=socket.AF_INET,
        limit=60,  # teto global (semaphore=20 + gordura de infra)
        limit_per_host=20,  # espelha API_CONCURRENCY_LIMIT
        # SOTA: Reduzido para 5s previne TCP drop pela API (Connection closed)
        keepalive_timeout=5,
        ttl_dns_cache=300,  # renova IPs de load balancers a cada 5 min
        # enable_cleanup_closed removido: no-op e DeprecationWarning no Python 3.14+
        # (corrigido em https://github.com/python/cpython/pull/118960)
    )
    default_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/123.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Connection": "keep-alive",
    }
    # SOTA: Timeouts intrinsecos de socket para evitar paralisia I/O (TCP Drop).
    # connect=15s (teto do handshake), sock_read=300s (limite sem receber bytes vivos).
    global_timeout = make_client_timeout(total=600, connect=15, sock_read=300)
    return aiohttp.ClientSession(
        trust_env=True,
        connector=connector,
        headers=default_headers,
        timeout=global_timeout,
    )


def _aclose_orphaned_session(sess: aiohttp.ClientSession) -> None:
    """Fecha (best-effort) sessao orfa de loop morto, agendando no loop corrente."""

    async def _close() -> None:
        with contextlib.suppress(Exception):
            await sess.close()

    with contextlib.suppress(RuntimeError):
        asyncio.get_running_loop().create_task(_close())


def get_global_http_session() -> aiohttp.ClientSession:
    """Retorna a sessao HTTP aiohttp global do loop corrente, instanciando-a lazy."""
    loop = asyncio.get_running_loop()
    loop_id = id(loop)
    with _HTTP_SESSIONS_GUARD:
        # Poda sessoes de loops encerrados (asyncio.run por chamada): fecha
        # best-effort e remove a entrada para o registro nao crescer sem fim.
        orphans = [
            (lid, sess)
            for lid, (loop_obj, sess) in _GLOBAL_HTTP_SESSIONS.items()
            if loop_obj.is_closed() and loop_obj is not loop
        ]
        for lid, sess in orphans:
            _GLOBAL_HTTP_SESSIONS.pop(lid, None)
            _aclose_orphaned_session(sess)
        par = _GLOBAL_HTTP_SESSIONS.get(loop_id)
        if par is None or par[0] is not loop or par[1].closed:
            par = (loop, _build_http_session())
            _GLOBAL_HTTP_SESSIONS[loop_id] = par
        return par[1]


def _sync_fallback_request(
    url: str, payload: dict[str, Any], headers: dict[str, str], timeout_seconds: float
) -> tuple[int, str]:
    """
    Motor sincrono nativo em C (urllib).
    Imune a anomalia de TCP Drop (HTTP 400: b'') do aiohttp em ambientes Windows.
    Executado em Thread isolada para nao bloquear o Event Loop principal.
    """
    # SOTA Guard (S310): Validacao estrita de esquema previne leitura de arquivos locais (file://)
    url_l = url.lower()
    is_https = url_l.startswith("https://")
    is_local_http = url_l.startswith(("http://localhost", "http://127.0.0.1", "http://[::1]"))
    if not (is_https or is_local_http):
        return 0, "Bloqueio de Seguranca: Apenas esquemas HTTPS ou HTTP locais sao permitidos."

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        # SOTA: Injeta o mesmo contexto SSL do certifi no fallback para consistencia de rede.
        ctx = ssl.create_default_context(cafile=certifi.where())
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        t = timeout_seconds
        with urllib.request.urlopen(req, timeout=t, context=ctx) as r:  # noqa: S310
            return r.getcode(), r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        # SOTA: O objeto HTTPError mantem o socket aberto.
        # O uso do Context Manager garante o fechamento do File Descriptor
        # instantaneamente no Windows.
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
