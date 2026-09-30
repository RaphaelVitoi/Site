"""
FASE 6 / opção C (Tier 0, 2026-09-30): o backend passa a saber QUEM e o
usuario, e nao apenas se a requisicao passou.

IDENTITY: A identidade do usuario extraida do token de sessao do NextAuth
PATH: tests/test_identidade_de_usuario_2026_09_30.py
ROLE: Provar a cadeia inteira, e — mais importante — provar que ela NAO abre
nada. A opcao C cria um risco que precisa ser medido, nao presumido.

O que a medicao encontrou antes da mudanca: o gateway so enviava
`Authorization` com `API_SECRET_TOKEN`. O backend so conseguia responder 401
ou 403; nunca "esta requisicao e do usuario X". A identidade de produto exigia
`SUPABASE_JWT_SECRET`, que nao existe nesta maquina, e as 22 rotas de produto
respondiam 500.

O RISCO que a opcao C cria: quem tem `API_SECRET_TOKEN` PODE forjar
`X-User-Token` — e o gateway tem a credencial. Sem o vinculo de sessao, a
identidade seria uma afirmacao de quem ja tem autoridade sobre o host. Este
arquivo existe majoritariamente para provar que essa afirmacao e REJEITADA.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from unittest.mock import patch

import pytest

from api.v1 import middleware

AUTH_SECRET = "auth-secret-de-teste-com-tamanho-razoavel-0001"
SEGREDO_DE_OUTRO = "segredo-que-nao-e-o-do-projeto-9999"


def _jwt(payload: dict, secret: str = AUTH_SECRET) -> str:
    """HS256 de três segmentos, na MESMA forma que `verify_hs256_jwt` exige."""

    def b64(dados: bytes) -> str:
        return base64.urlsafe_b64encode(dados).rstrip(b"=").decode()

    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    corpo = b64(json.dumps(payload, separators=(",", ":")).encode())
    assinatura = b64(hmac.new(secret.encode(), f"{header}.{corpo}".encode(), hashlib.sha256).digest())
    return f"{header}.{corpo}.{assinatura}"


def _token_de_sessao(sub: str = "usuario-uuid-0001", **extra) -> str:
    base = {"sub": sub, "name": "Teste", "iat": int(time.time()), "exp": int(time.time()) + 3600}
    base.update(extra)
    return _jwt(base)


class _Req:
    """Stub de `web.Request` com o minimo que o middleware le.

    Uma CLASSE, e nao `MagicMock`: o MagicMock intercepta `__setitem__` como
    metodo, e `request["user_id"] = x` chega nele com tres argumentos
    (`self`, `user_id`, `x`), o que levanta `TypeError: __setitem__ expected 2
    arguments, got 3`. Medido. Uma classe com `__setitem__`/`__getitem__`
    proprios reproduz o dicionario do `web.Request` real, que e um `MutableMapping`
    -- e o `MagicMock` finge ser sem ser, que e a propriedade que o torna pior
    stub aqui.
    """

    def __init__(
        self,
        *,
        token_usuario: str | None = None,
        cliente: str | None = None,
        token_servico: str = "token-de-servico-de-teste",  # noqa: S107  # Record-Id: REGISTRO-2026-09-30-auditoria-backend-e-correcao-dos-portoes
    ) -> None:
        self.method = "POST"
        self.path = "/api/v1/perspective"
        self.remote = "127.0.0.1"
        self.headers = {"Authorization": f"Bearer {token_servico}"}
        if token_usuario is not None:
            self.headers[middleware.USER_TOKEN_HEADER] = token_usuario
        if cliente is not None:
            self.headers[middleware.CLIENT_ID_HEADER] = cliente
        self.contexto: dict[str, object] = {}

    def __setitem__(self, chave: str, valor: object) -> None:
        self.contexto[chave] = valor

    def __getitem__(self, chave: str) -> object:
        return self.contexto[chave]


def _request(
    *,
    token_usuario: str | None = None,
    cliente: str | None = None,
    token_servico: str = "token-de-servico-de-teste",  # noqa: S107  # Record-Id: REGISTRO-2026-09-30-auditoria-backend-e-correcao-dos-portoes
) -> _Req:
    return _Req(token_usuario=token_usuario, cliente=cliente, token_servico=token_servico)


@pytest.fixture(autouse=True)
def _ambiente_limpo(monkeypatch):
    """Cada teste começa com o registro de sessão vazio.

    O registro é estado de MÓDULO. Sem este reset, um teste que registra um par
    deixa o par disponível para o teste seguinte, e a suite passa por ordem de
    execução — que é a forma mais comum de teste que não testa.
    """
    monkeypatch.setenv("AUTH_SECRET", AUTH_SECRET)
    monkeypatch.delenv("NEXTAUTH_SECRET", raising=False)
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    middleware.USUARIOS_DE_SESSAO.clear()
    yield
    middleware.USUARIOS_DE_SESSAO.clear()


# ── A cadeia completa fecha ─────────────────────────────────────────────────


def test_a_cadeia_completa_devolve_o_usuario():
    """Token válido + vínculo registrado = identidade. Este é o caminho feliz."""
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    req = _request(token_usuario=_token_de_sessao(), cliente="cliente-abc")
    assert middleware._identidade_do_usuario(req) == "usuario-uuid-0001"


async def test_o_middleware_preserva_a_credencial_de_servico():
    """A opção C NÃO ABRE NADA. Sem token de usuário, a requisição segue
    exatamente como antes: com a credencial de serviço, sem identidade.

    Este é o teste mais importante do arquivo. Se ele falhar, a opção C virou
    uma abertura, e o resto dos testes estão medindo a coisa errada.
    """
    req = _request()

    async def _handler(_r):
        return "PASSOU"

    with patch.object(middleware, "API_SECRET_TOKEN", "token-de-servico-de-teste"):
        resultado = await middleware.auth_middleware(req, _handler)
    assert resultado == "PASSOU"
    assert "user_id" not in req.contexto, "a opção C atribuiu identidade sem token de usuário"


async def test_o_middleware_anexa_a_identidade_quando_o_token_e_valido():
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    req = _request(token_usuario=_token_de_sessao(), cliente="cliente-abc")

    async def _handler(_r):
        return "PASSOU"

    with patch.object(middleware, "API_SECRET_TOKEN", "token-de-servico-de-teste"):
        await middleware.auth_middleware(req, _handler)
    assert req.contexto["user_id"] == "usuario-uuid-0001"
    assert req.contexto["user_role"] == "authenticated"


# ── O ataque que a opção C habilita ─────────────────────────────────────────


def test_token_forjado_sem_vinculo_e_descartado(caplog: pytest.LogCaptureFixture):
    """O ataque central. Quem tem a credencial de serviço forja um
    `X-User-Token` com assinatura VÁLIDA e se apresenta como qualquer pessoa.

    A assinatura está correta — foi ele mesmo quem a fez, com o segredo que
    já tem. O que o impede não é criptografia: é o VÍNCULO com
    `X-Nexus-Client-Id`, que só o gateway emite para uma sessão real.
    """
    req = _request(token_usuario=_token_de_sessao("vitima-ou-vitima"), cliente="cliente-do-atacante")
    with caplog.at_level("WARNING", logger="api.v1.middleware"):
        assert middleware._identidade_do_usuario(req) is None
    assert any("sem vinculo de sessao" in r.getMessage() for r in caplog.records), (
        "o descarte nao foi registrado: um token forjado esta sendo barrado em silencio"
    )


def test_token_valido_com_cliente_diferente_do_registrado_e_descartado():
    """Reapresentação: par `(usuário, cliente)` registrado, e o atacante
    reapresenta o token com OUTRO `X-Nexus-Client-Id`. Por isso o registro é um
    PAR e não uma parte só."""
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    req = _request(token_usuario=_token_de_sessao("usuario-uuid-0001"), cliente="cliente-xyz")
    assert middleware._identidade_do_usuario(req) is None


def test_token_assinado_com_outro_segredo_e_descartado():
    req = _request(token_usuario=_jwt({"sub": "x", "exp": int(time.time()) + 60}, SEGREDO_DE_OUTRO), cliente="c")
    middleware._registrar_usuario_de_sessao("x", "c")
    assert middleware._identidade_do_usuario(req) is None


def test_sem_auth_secret_nenhuma_identidade_e_aceita(monkeypatch):
    """Sem o segredo, o token é indecifrável. Aceitar assim seria aceitar
    qualquer `sub` que o atacante escrever."""
    monkeypatch.delenv("AUTH_SECRET", raising=False)
    monkeypatch.delenv("NEXTAUTH_SECRET", raising=False)
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    req = _request(token_usuario=_token_de_sessao(), cliente="cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


# ── Cada elo é necessário ───────────────────────────────────────────────────


def test_sem_token_de_usuario_nao_ha_identidade():
    req = _request(cliente="cliente-abc")
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


def test_sem_cliente_nao_ha_identidade():
    req = _request(token_usuario=_token_de_sessao())
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


def test_token_sem_sub_nao_e_aceito():
    """Uma afirmação sem sujeito não é uma identidade. O NextAuth sempre põe
    `sub`; um token sem ele não veio do fluxo de sessão."""
    sem_sub = _jwt({"name": "sem sujeito", "exp": int(time.time()) + 60})
    req = _request(token_usuario=sem_sub, cliente="cliente-abc")
    middleware._registrar_usuario_de_sessao("qualquer", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


def test_token_com_alg_none_e_recusado():
    """O ataque clássico de JWT. O verificador exige `alg: HS256` DECLARADO
    (`_header_is_hs256`), e este teste impede que essa defesa seja relaxada
    enquanto a opção C multiplica o número de tokens que passam por ela."""
    header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').rstrip(b"=").decode()
    corpo = base64.urlsafe_b64encode(json.dumps({"sub": "atacante"}).encode()).rstrip(b"=").decode()
    req = _request(token_usuario=f"{header}.{corpo}.", cliente="cliente-abc")
    middleware._registrar_usuario_de_sessao("atacante", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


def test_token_expirado_e_recusado():
    req = _request(token_usuario=_token_de_sessao(exp=int(time.time()) - 60), cliente="cliente-abc")
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


def test_token_que_nao_e_jwt_e_recusado():
    req = _request(token_usuario="apenas-um-string", cliente="cliente-abc")  # noqa: S106  # Record-Id: REGISTRO-2026-09-30-auditoria-backend-e-correcao-dos-portoes
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    assert middleware._identidade_do_usuario(req) is None


# ── Os dois segredos não se confundem ────────────────────────────────────────


def test_um_token_do_supabase_nao_passa_pelo_caminho_do_nextauth(monkeypatch):
    """`SUPABASE_JWT_SECRET` e `AUTH_SECRET` assinam coisas diferentes. Um
    token emitido pelo Supabase, com o segredo do Supabase, tem de ser REJEITADO
    pelo caminho do NextAuth — e vice-versa.

    Um campo único para os dois segredos faria o sistema aceitar o token de um
    emissor no lugar do outro. Este teste é o que impede isso de acontecer por
    descuido.
    """
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SEGREDO_DE_OUTRO)
    middleware._registrar_usuario_de_sessao("usuario-uuid-0001", "cliente-abc")
    req = _request(
        token_usuario=_jwt({"sub": "usuario-uuid-0001", "exp": int(time.time()) + 60}, SEGREDO_DE_OUTRO),
        cliente="cliente-abc",
    )
    assert middleware._identidade_do_usuario(req) is None, "o token do Supabase passou no verificador do NextAuth"


# ── Correlação com a trilha de recusa ────────────────────────────────────────


def test_o_descarte_registra_o_id_de_correlacao(caplog: pytest.LogCaptureFixture):
    """O descarte tem de ser rastreável como o resto. Um token forjado barrado
    em silêncio é indistinguível de um token que nunca chegou."""
    req = _request(token_usuario=_token_de_sessao(), cliente="cliente-desconhecido")
    with caplog.at_level("WARNING", logger="api.v1.middleware"):
        middleware._identidade_do_usuario(req)
    registros = [r.getMessage() for r in caplog.records if "sem vinculo" in r.getMessage()]
    assert registros
    assert "id=" in registros[0]
    assert "cliente=cliente-desconhecido" in registros[0]
    assert "caminho=/api/v1/perspective" in registros[0]


def test_o_registro_nao_contem_o_token():
    """A mesma assimetria de SEC-07: registrar o descarte não pode registrar o
    token. Nem truncado, nem com hash."""
    req = _request(token_usuario=_token_de_sessao(), cliente="cliente-desconhecido")
    import io

    stream = io.StringIO()
    import logging

    manipulador = logging.StreamHandler(stream)
    logger = logging.getLogger("api.v1.middleware")
    logger.addHandler(manipulador)
    try:
        middleware._identidade_do_usuario(req)
    finally:
        logger.removeHandler(manipulador)
    assert AUTH_SECRET not in stream.getvalue()
