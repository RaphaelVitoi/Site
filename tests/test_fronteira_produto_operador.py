"""
Achado B07: identidade de produto e autoridade de operador nao podem coincidir.

O `auth_middleware` aceita duas credenciais de naturezas diferentes pela MESMA
porta -- um JWT do Supabase, que identifica um usuario humano do produto, e a
`API_SECRET_TOKEN`, que e credencial de servico -- e ate 2026-09-09 as duas
alcancavam as mesmas 29 rotas. Entre elas `/api/files/view` (le o disco do
projeto), `/ingest`, `/add` e `/state`.

Medido em 2026-09-09: `user_id` e `user_role` eram gravados no request pelo
middleware e tinham ZERO leitores em todo o backend. A identidade era extraida
e descartada -- um token de produto valido conferia autoridade de operar o host.

Tambem medido: nenhum componente do frontend fala com o backend diretamente. As
chamadas passam por rotas server-side do Next, com credencial de servico. Por
isso a separacao fecha a porta ANTES de ela ser aberta, sem quebrar consumo real.

A faixa e FAIL-CLOSED: o JWT alcanca apenas o que estiver declarado em
`ROTAS_DE_PRODUTO`. Rota nova nasce fechada a identidade de produto.
"""

import base64
import hashlib
import hmac
import json
import time
from pathlib import Path
from typing import cast

import pytest
from aiohttp import web

from api.v1 import middleware

SEGREDO = "segredo-de-teste-hs256-para-a-fronteira"


def _jwt_de_produto(secret: str = SEGREDO, role: str = "authenticated") -> str:
    """JWT HS256 valido representando um usuario comum do produto."""

    def seg(data: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(data, separators=(",", ":")).encode()).decode().rstrip("=")

    entrada = f"{seg({'alg': 'HS256', 'typ': 'JWT'})}.{seg({'sub': 'usuario-do-produto', 'role': role, 'exp': int(time.time()) + 3600})}"
    assinatura = hmac.new(secret.encode(), entrada.encode(), hashlib.sha256).digest()
    return f"{entrada}.{base64.urlsafe_b64encode(assinatura).decode().rstrip('=')}"


async def _resposta(path: str, monkeypatch, method: str = "GET"):
    """Passa uma requisicao autenticada por JWT pelo auth_middleware."""
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", SEGREDO)
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SEGREDO)

    async def handler(_request):
        return web.Response(text="ALCANCOU O HANDLER")

    return await middleware.auth_middleware(cast(web.Request, _Requisicao(path, method)), handler)


class _Requisicao:
    """Duplo de `web.Request` que aceita item assignment.

    `SimpleNamespace` nao serve aqui: o middleware grava `request["user_id"]`, e
    Python resolve dunders na CLASSE, nao na instancia -- atribuir `__setitem__`
    como atributo nao habilita `[]`.
    """

    def __init__(self, path: str, method: str) -> None:
        self.headers = {"Authorization": f"Bearer {_jwt_de_produto()}"}
        self.path = path
        self.method = method
        self.remote = "127.0.0.1"
        self._contexto: dict[str, object] = {}

    def __setitem__(self, chave: str, valor: object) -> None:
        self._contexto[chave] = valor

    def __getitem__(self, chave: str) -> object:
        return self._contexto[chave]


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.parametrize(
    ("path", "method"),
    [
        ("/api/files/view", "GET"),
        ("/api/files/list", "GET"),
        ("/ingest", "POST"),
        ("/add", "POST"),
        ("/state", "POST"),
        ("/buckets", "POST"),
        ("/ask-oracle", "POST"),
    ],
)
async def test_jwt_de_produto_nao_alcanca_rota_de_operador(path: str, method: str, monkeypatch) -> None:
    """Autoridade sobre o host exige credencial de servico, nunca identidade de produto."""
    resposta = await _resposta(path, monkeypatch, method)

    assert resposta.status == 403, f"{method} {path} aceitou identidade de produto (status {resposta.status})"
    assert "operador" in (resposta.text or "").lower()


@pytest.mark.asyncio
@pytest.mark.unit
@pytest.mark.parametrize(
    ("path", "method"),
    [
        ("/api/v1/perspective", "POST"),
        ("/api/v1/perspective/tree", "POST"),
        ("/api/v1/timesfm/forecast", "POST"),
        ("/api/v1/engine-capabilities", "GET"),
        ("/api/v1/game-theory/pluribus/solve", "POST"),
        ("/api/v1/game-theory/deepstack/resolve", "POST"),
        ("/api/v1/game-theory/rebel/pbs/evaluate", "POST"),
        ("/api/v1/game-theory/claudico/translate-action", "POST"),
        ("/api/v1/canonical/clairvoyance/solve", "POST"),
        ("/api/v1/canonical/akq/solve", "POST"),
        ("/api/v1/canonical/janda/mdf", "POST"),
        ("/api/v1/canonical/janda/geometric-sizing", "POST"),
        ("/api/v1/canonical/janda/bluff-ratios", "POST"),
        ("/health", "GET"),
    ],
)
async def test_jwt_de_produto_alcanca_rota_de_produto(path: str, method: str, monkeypatch) -> None:
    """A contraprova de escopo: a faixa nao pode ser larga a ponto de fechar o produto."""
    resposta = await _resposta(path, monkeypatch, method)

    assert resposta.status == 200, f"{path} e rota de produto e foi recusada"
    assert "ALCANCOU O HANDLER" in (resposta.text or "")


@pytest.mark.asyncio
@pytest.mark.unit
async def test_faixa_de_produto_e_fail_closed() -> None:
    """Rota nao declarada nasce fechada ao JWT -- o default protege o que ainda nao existe."""
    assert not middleware.rota_e_de_produto("/rota/que/ainda/nao/existe")


@pytest.mark.asyncio
@pytest.mark.unit
async def test_politica_de_produto_rejeita_metodo_nao_declarado(monkeypatch) -> None:
    """Identidade e path nao bastam: a capacidade autorizada inclui o metodo HTTP."""
    resposta = await _resposta("/api/v1/game-theory/pluribus/solve", monkeypatch, "GET")

    assert resposta.status == 403
    assert "operador" in (resposta.text or "").lower()


@pytest.mark.unit
def test_rotas_backend_do_manifesto_tem_capacidade_post_de_produto() -> None:
    """Toda engine HTTP declarada e pura deve permanecer alcancavel pelo produto."""
    manifest_path = Path(__file__).resolve().parents[1] / "data" / "engine_capabilities.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    backend_routes = {
        route
        for capability in manifest["capabilities"]
        for route in capability["api_routes"]
        if route.startswith("/api/v1/")
    }

    assert backend_routes
    assert backend_routes <= middleware.ROTAS_DE_PRODUTO
    for route in backend_routes:
        assert middleware.POLITICA_ROTAS_DE_PRODUTO[route] == frozenset({"POST"})
