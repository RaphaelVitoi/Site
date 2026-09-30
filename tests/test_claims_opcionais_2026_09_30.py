"""
SEC-05 (auditoria de backend 2026-09-30): emissor e audiencia do JWT so eram
conferidos quando o ambiente os declarava -- e nada avisava quando nao.

IDENTITY: O contrato de claims opcionais do JWT de produto
PATH: tests/test_claims_opcionais_2026_09_30.py
ROLE: Fixar o que a correcao faz (avisar) e o que ela deliberadamente NAO faz
(derrubar o servico), e provar que a mitigacao real continua valendo.

Medido antes da correcao: `_optional_claims_match` lia
`SUPABASE_JWT_ISSUER` e `SUPABASE_JWT_AUDIENCE` e, ausentes, aceitava
qualquer `iss`/`aud`. A mitigacao que JÁ existia e boa: `role ==
"authenticated"` com `sub` presente bloqueia a `anon` e a `service_role`, e e
medido em BK-03. `iss`/`aud` fecha a lacuna RESIDUAL entre aplicacoes que
compartilham o mesmo segredo.

A correcao nao e exigir as variaveis. Exigir derruba as 21 rotas de produto
quando o `iss` declarado diverge do emissor real -- e o modo de falha de uma
validacao que falha alto em producao e pior que o da que falha alto no
startup, porque o startup e onde se descobre que o valor esta errado. A
correcao e AVISAR, e este arquivo fixa essa decisao para que virar "exigir" um
dia seja uma mudanca deliberada e nao um efeito colateral.
"""

from __future__ import annotations

import json
import logging
import time
from unittest.mock import patch

import pytest

from api.v1 import middleware

SECREDO = "segredo-jwt-de-teste-com-tamanho-suficiente"


def _token(payload: dict, secret: str = SECREDO) -> str:
    """Monta um HS256 com a mesma forma que `verify_hs256_jwt` exige.

    Reimplementar a assinatura aqui, e nao importar PyJWT, e deliberado: o
    verificador do projeto e stdlib pura de proposito (e o que permite
    `_header_is_hs256` exigir `alg` declarado), e um teste que dependesse da
    biblioteca deixaria de provar o caminho que roda em producao.
    """
    import base64
    import hashlib
    import hmac

    def b64(dados: bytes) -> str:
        return base64.urlsafe_b64encode(dados).rstrip(b"=").decode()

    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    corpo = b64(json.dumps(payload, separators=(",", ":")).encode())
    assinatura = b64(hmac.new(secret.encode(), f"{header}.{corpo}".encode(), hashlib.sha256).digest())
    return f"{header}.{corpo}.{assinatura}"


def _payload(**extra) -> dict:
    base = {"sub": "usuario-uuid", "role": "authenticated", "exp": int(time.time()) + 3600}
    base.update(extra)
    return base


# ── A mitigacao real, que já existia e não pode regredir ─────────────────────


def test_sem_iss_aud_declarados_o_token_de_usuario_passa():
    """Contrato preservado: sem `iss`/`aud` no ambiente, um token de sessão de
    usuario valido continua aceito. Exigir os claims derrubaria o produto."""
    token = _token(_payload())
    with patch.dict("os.environ", {}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            assert middleware.verify_hs256_jwt(token, SECREDO) is not None


async def test_anon_key_continua_bloqueada_pelo_role():
    """BK-03: a `anon` e publica e nao tem `sub`. `iss`/`aud` nao sao a defesa
    contra ela -- `role` e `sub` sao. Este teste impede que uma mudanca futura
    fraquele a defesa real achando que `iss` cobre o caso.

    `async` porque o projeto roda com `asyncio_mode = "auto"`: um
    `run_until_complete` dentro de um loop ja fechado levanta `RuntimeError`.
    Medido: a primeira versao deste arquivo fazia exatamente isso."""
    from api.v1.middleware import _handle_jwt_token_auth

    token_anon = _token({"role": "anon", "exp": int(time.time()) + 3600 * 24 * 365})
    with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
        with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
            resp = await _handle_jwt_token_auth(token_anon, _request(), _handler_que_nao_deve_passar)
    assert resp.status == 403
    assert "usuario autenticado" in resp.text


async def test_service_role_key_continua_bloqueada():
    """Mesma razao da `anon`, pelo mesmo caminho."""
    from api.v1.middleware import _handle_jwt_token_auth

    token_service = _token({"role": "service_role", "exp": int(time.time()) + 3600 * 24 * 365})
    with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
        with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
            resp = await _handle_jwt_token_auth(token_service, _request(), _handler_que_nao_deve_passar)
    assert resp.status == 403


# ── A lacuna residual: iss/aud de outra aplicação ───────────────────────────


def test_token_de_outra_aplicacao_passa_sem_os_claims_declarados():
    """Este e o ACHADO. Sem `SUPABASE_JWT_ISSUER`/`AUDIENCE` no ambiente, um
    token assinado com o mesmo segredo e com `iss`/`aud` de outra aplicacao e
    aceito. A documentacao e a justificativa de SEC-05, nao um teste que
    descreve o que a correcao fez -- porque a correcao nao muda este
    comportamento, ela o TORNA VISIVEL."""
    token = _token(_payload(iss="outra-aplicacao", aud="outra-audiencia"))
    with patch.dict("os.environ", {}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            payload = middleware.verify_hs256_jwt(token, SECREDO)
    assert payload is not None
    assert payload["iss"] == "outra-aplicacao", (
        "o token de outra aplicacao deixou de passar: a correcao mudou de comportamento"
    )


def test_com_iss_declarado_o_token_de_outra_aplicacao_e_recusado():
    """E assim que a lacuna fecha: com a variavel no ambiente, `iss` diferente
    recusa. Este e o criterio de aceite de SEC-05 -- nao o codigo, que ja
    conferia, mas a DECISAO de declarar a variavel."""
    token = _token(_payload(iss="outra-aplicacao"))
    with patch.dict("os.environ", {"SUPABASE_JWT_ISSUER": "supabase"}, clear=True):
        assert middleware.verify_hs256_jwt(token, SECREDO) is None


def test_com_aud_declarado_a_audiencia_errada_e_recusada():
    token = _token(_payload(aud="outra-audiencia"))
    with patch.dict("os.environ", {"SUPABASE_JWT_AUDIENCE": "authenticated"}, clear=True):
        assert middleware.verify_hs256_jwt(token, SECREDO) is None


def test_aud_aceita_lista():
    """O `aud` do JWT pode ser lista; `_audience_matches` trata os dois casos e
    o contrato nao pode estreitar so para string."""
    token = _token(_payload(aud=["authenticated", "outro"]))
    with patch.dict("os.environ", {"SUPABASE_JWT_AUDIENCE": "authenticated"}, clear=True):
        assert middleware.verify_hs256_jwt(token, SECREDO) is not None


# ── O aviso: a correcao efetiva ─────────────────────────────────────────────


def test_avisa_quando_os_claims_opcionais_nao_estao_declarados(caplog: pytest.LogCaptureFixture):
    """A correcao: a lacuna para de ser invisivel.

    O segredo e FORCADO no patch. Medido nesta maquina: `SUPABASE_JWT_SECRET`
    nao esta nem no Registro nem no `.env`, entao `_jwt_secret()` e falso e o
    aviso -- corretamente -- nao dispara. Sem o forcamento, este teste
    reproduziria o estado local e falharia por um motivo que nao e o que ele
    descreve. A razao pela qual o segredo e forcado em todos os testes de
    aviso esta escrita aqui de proposito.
    """
    with patch.dict("os.environ", {}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
                with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                    middleware._avisar_claims_opcionais_ausentes()
    avisos = [r.getMessage() for r in caplog.records if "SEC-05" in r.getMessage()]
    assert avisos, "a ausencia de SUPABASE_JWT_ISSUER/AUDIENCE nao foi avisada"
    assert "SUPABASE_JWT_ISSUER" in avisos[0]
    assert "SUPABASE_JWT_AUDIENCE" in avisos[0]


def test_nao_avisa_quando_os_dois_estao_declarados(caplog: pytest.LogCaptureFixture):
    """Aviso constante vira ruido, e ruido vira portao ignorado."""
    with patch.dict(
        "os.environ",
        {"SUPABASE_JWT_ISSUER": "supabase", "SUPABASE_JWT_AUDIENCE": "authenticated"},
        clear=True,
    ):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                middleware._avisar_claims_opcionais_ausentes()
    assert not [r for r in caplog.records if "SEC-05" in r.getMessage()]


def test_nao_avisa_sem_secreto_configurado(caplog: pytest.LogCaptureFixture):
    """Sem `SUPABASE_JWT_SECRET` nao ha JWT a verificar; o aviso seria sobre
    um sistema que nao esta em uso."""
    with patch.dict("os.environ", {}, clear=True):
        with patch.object(middleware, "_jwt_secret", lambda: None):
            with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                middleware._avisar_claims_opcionais_ausentes()
    assert not [r for r in caplog.records if "SEC-05" in r.getMessage()]


def test_declarar_so_um_dos_dois_ainda_avisa(caplog: pytest.LogCaptureFixture):
    """A OR e a condicao de erro. Declarar so `iss` deixa `aud` aberto, e o
    aviso precisa cobrir esse caso -- e a forma como a lacuna volta em
    silencio depois de alguem ter feito parte do trabalho."""
    with patch.dict("os.environ", {"SUPABASE_JWT_ISSUER": "supabase"}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
                with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                    middleware._avisar_claims_opcionais_ausentes()
    assert [r for r in caplog.records if "SEC-05" in r.getMessage()], (
        "declarar so SUPABASE_JWT_ISSUER silencia o aviso, e SUPABASE_JWT_AUDIENCE continua sem conferencia"
    )


def test_a_variavel_declarada_com_espaco_e_tratada_como_ausente(caplog: pytest.LogCaptureFixture):
    """`_expected_claim` faz `.strip()`, entao `' '` e ausente. O aviso precisa
    distinguir 'nao declarei' de 'declarei com espacos', porque o segundo caso
    e o que parece declarado e nao esta."""
    with patch.dict("os.environ", {"SUPABASE_JWT_ISSUER": "   ", "SUPABASE_JWT_AUDIENCE": " "}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
                with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                    middleware._avisar_claims_opcionais_ausentes()
    assert [r for r in caplog.records if "SEC-05" in r.getMessage()]


# ── O aviso não vaza segredo ────────────────────────────────────────────────


def test_o_aviso_nao_contem_o_segredo(caplog: pytest.LogCaptureFixture):
    with patch.dict("os.environ", {}, clear=True):
        with patch.object(middleware, "SUPABASE_JWT_SECRET", None):
            with patch.object(middleware, "_jwt_secret", lambda: SECREDO):
                with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
                    middleware._avisar_claims_opcionais_ausentes()
    texto = " ".join(r.getMessage() for r in caplog.records)
    assert SECREDO not in texto
    assert "segredo-jwt" not in texto


# ── O exemplo de ambiente declara as duas ──────────────────────────────────


def test_o_exemplo_de_ambiente_declara_os_dois_claims():
    """Documentacao que nao declara o que o codigo exige e a forma como a
    variavel nunca aparece no ambiente de ninguem."""
    from pathlib import Path

    exemplo = Path(__file__).resolve().parent.parent / "_env.example.ps1"
    texto = exemplo.read_text(encoding="utf-8")
    assert "$env:SUPABASE_JWT_ISSUER" in texto, "o exemplo de ambiente nao declara SUPABASE_JWT_ISSUER"
    assert "$env:SUPABASE_JWT_AUDIENCE" in texto, "o exemplo de ambiente nao declara SUPABASE_JWT_AUDIENCE"


# ── Utilidades ──────────────────────────────────────────────────────────────


def _request():
    from unittest.mock import MagicMock

    req = MagicMock()
    req.method = "POST"
    req.path = "/api/v1/perspective"
    req.remote = "127.0.0.1"
    req.headers = {}
    return req


async def _handler_que_nao_deve_passar(_request):
    raise AssertionError("handler nao deveria ser chamado")


def _run(coro):
    import asyncio

    return asyncio.get_event_loop().run_until_complete(coro)
