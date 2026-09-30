"""
SEC-07 (auditoria de backend 2026-09-30): recusa de autenticacao nao era
registrada em lugar nenhum.

IDENTITY: Trilha de seguranca das recusas de autenticacao e do rate limit
PATH: tests/test_trilha_de_recusa_2026_09_30.py
ROLE: Provar que a recusa DEIXA rastro, e que o rastro nao carrega a credencial.

Medido antes da correcao: `grep 'logger.' api/v1/middleware.py` devolvia ZERO.
Nenhum 401, nenhum 403, nenhum 429. Os handlers, esses sim, registram bem
(`_internal_error` com `exc_info` e `error_id`), o que torna a lacuna mais
escura: o sistema tem telemetria de erro e nenhuma de ataque. Com
`--allow-unauthenticated` e ate 20 replicas no `cloudbuild.backend.yaml:79`,
sondagem contra a porta e o cenario base -- e sem registro ela e indistinguivel
de silencio.

O teste tambem fixa o outro lado: registrar a recusa nao pode registrar o
SEGREDO. Um log de seguranca que vaza a credencial que recusou troca um
problema por outro, e o segundo e pior porque o primeiro ainda nao foi
resolvido por ninguem.
"""

from __future__ import annotations

import logging
import re
import time
from unittest.mock import MagicMock, patch

import pytest

from api.v1 import middleware


def _request(
    *,
    path: str = "/api/v1/perspective",
    method: str = "POST",
    remote: str = "10.0.0.7",
    headers: dict[str, str] | None = None,
) -> MagicMock:
    req = MagicMock()
    req.method = method
    req.path = path
    req.remote = remote
    req.headers = headers or {}
    return req


# ── A recusa e registrada ────────────────────────────────────────────────────


def test_recusa_ausente_registra_e_devolve_401(caplog: pytest.LogCaptureFixture):
    """O caso mais comum de sondagem: chamada sem cabecalho de autorizacao."""
    req = _request(headers={"Authorization": ""})
    with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
        resp = middleware._recusa(req, 401, "token_ausente")
    assert resp.status == 401
    registros = [r for r in caplog.records if "[AUTH]" in r.getMessage()]
    assert registros, "recusa de autenticacao nao deixou registro nenhum"
    msg = registros[0].getMessage()
    assert "motivo=token_ausente" in msg
    assert "caminho=/api/v1/perspective" in msg
    assert "metodo=POST" in msg


@pytest.mark.parametrize(
    "motivo",
    [
        "token_ausente",
        "token_invalido",
        "token_legado_nao_configurada",
        "jwt_invalido",
        "jwt_sem_usuario",
        "rota_de_operador",
        "sem_token_fora_do_loopback",
        "origem_nao_confiavel",
    ],
)
def test_todo_motivo_de_recusa_tem_texto_e_registro(caplog: pytest.LogCaptureFixture, motivo: str):
    """Cada motivo tem mensagem propria.

    A allowlist e fechada de proposito: um motivo novo sem texto cairia no
    genérico "Acesso negado", e o cliente perderia a distincao que o log
    preserva. Um `KeyError` aqui seria pior que uma mensagem generica.
    """
    req = _request()
    with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
        resp = middleware._recusa(req, 403, motivo)
    assert resp.status == 403
    msg = [r.getMessage() for r in caplog.records if "[AUTH]" in r.getMessage()]
    assert msg, f"motivo {motivo} nao foi registrado"
    assert f"motivo={motivo}" in msg[0]


async def test_estouro_de_rate_limit_registra(caplog: pytest.LogCaptureFixture):
    """429 e o segundo sinal de sondagem que sumia.

    `async` pelo mesmo motivo do teste de auth: o projeto roda com
    `asyncio_mode = "auto"` e um `run_until_complete` dentro de um loop ja
    fechado levanta `RuntimeError`.
    """
    req = _request(path="/api/web-search", method="GET")
    req.headers = {"X-Nexus-Client-Id": "abc123"}

    async def _handler(_request):
        raise AssertionError("handler nao deveria ser chamado com o balde estourado")

    # O balde e global do modulo; o teste restaura o estado em vez de confiar em
    # `_purge_expired_ips`, que varre todos os IPs a cada janela. A funcao e
    # SINCRONA -- declarada `async` aqui produziria "coroutine was never
    # awaited", porque `rate_limit_middleware` a chama sem `await`.
    #
    # Duas coisas que a medicao corrigiu e que o codigo faz certo:
    # 1. A chave do balde e `_rate_limit_key(req)`, que aqui resolve para o
    #    `remote` -- o header `X-Nexus-Client-Id` so conta quando a requisicao
    #    traz a CREDENCIAL de servico (BK-06). Estourar `10.0.0.7` e nao a
    #    chave do header; sem a credencial o header e deliberadamente ignorado.
    # 2. `start_time` precisa estar DENTRO da janela. Com `0.0`, o codigo
    #    detecta janela vencida e zera a contagem -- que e o comportamento
    #    correto, e o que fez a primeira versao deste teste passar direto pelo
    #    handler em vez de receber 429.
    chave = m_key = middleware._rate_limit_key(req)
    middleware._ip_blocks[m_key] = {
        "count": middleware.MAX_REQUESTS_PER_WINDOW + 1,
        "start_time": time.time(),
    }

    with patch.object(middleware, "_purge_expired_ips", lambda *_a, **_k: None):
        with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
            resp = await middleware.rate_limit_middleware(req, _handler)

    middleware._ip_blocks.pop(chave, None)

    assert resp.status == 429
    registros = [r.getMessage() for r in caplog.records if "[RATE]" in r.getMessage()]
    assert registros, "estouro de rate limit nao deixou registro"
    assert "caminho=/api/web-search" in registros[0]
    assert "contagem=" in registros[0]
    assert "cliente=abc123" in registros[0]
    assert middleware.CORRELATION_HEADER in resp.headers
    assert resp.headers["Retry-After"] == str(middleware.RATE_LIMIT_WINDOW)
    assert resp.headers["X-RateLimit-Limit"] == str(middleware.MAX_REQUESTS_PER_WINDOW)


# ── O rastro NAO carrega a credencial ────────────────────────────────────────


def test_o_registro_nao_carrega_o_valor_do_token(caplog: pytest.LogCaptureFixture):
    """A assimetria que torna a correcao aceitavel.

    Um log que registra a recusa e vazou a credencial no mesmo ato troca um
    problema por outro. O token entra em NENHUM campo do registro -- nem
    truncado, nem com hash, porque ate o hash denuncia o comprimento.
    """
    segredo = "Bearer token-simulado-esta-e-o-token-real-de-producao-0001"
    req = _request(headers={"Authorization": segredo})
    with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
        middleware._recusa(req, 403, "token_invalido")
    registro = " ".join(r.getMessage() for r in caplog.records)
    assert segredo not in registro
    assert "token-simulado" not in registro
    assert "esta-e-o-token-real" not in registro
    # Nem fragmentos: o prefixo sozinho ja localiza a chave no cofre.
    assert "0001" not in registro


def test_o_registro_nao_carrega_o_cabecalho_authorization(caplog: pytest.LogCaptureFixture):
    req = _request(headers={"Authorization": "Bearer abc123def456"})
    with caplog.at_level(logging.WARNING, logger="api.v1.middleware"):
        middleware._recusa(req, 403, "token_invalido")
    assert "abc123def456" not in " ".join(r.getMessage() for r in caplog.records)


# ── Correlacao ───────────────────────────────────────────────────────────────


def test_o_id_de_correlacao_volta_na_resposta():
    """Sem isso, o 401 do log nao pode ser casado com o acesso no proxy."""
    req = _request()
    resp = middleware._recusa(req, 401, "token_ausente")
    assert middleware.CORRELATION_HEADER in resp.headers
    assert resp.headers[middleware.CORRELATION_HEADER]


def test_o_proxy_pode_fornecer_o_id_de_correlacao():
    req = _request(headers={middleware.CORRELATION_HEADER: "edge-abc123"})
    resp = middleware._recusa(req, 401, "token_ausente")
    assert resp.headers[middleware.CORRELATION_HEADER] == "edge-abc123"


@pytest.mark.parametrize("malicioso", ["a" * 200, "com espaço", "quebra\nlinha", "<script>", ""])
def test_id_de_correlacao_hostil_e_descartado(malicioso: str):
    """O header vem de fora. Quem envia nao escolhe o conteudo do log.

    O limite e a mesma classe de `CLIENT_ID_HEADER`: allowlist de caracteres e
    teto de tamanho. Sem isso, o campo de correlacao -- que e o que amarra o log
    a uma requisicao -- viraria um vetor de injecao de log.
    """
    req = _request(headers={middleware.CORRELATION_HEADER: malicioso})
    resp = middleware._recusa(req, 401, "token_ausente")
    id_gerado = resp.headers[middleware.CORRELATION_HEADER]
    assert re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", id_gerado), f"id hostil aceito: {id_gerado!r}"
    if malicioso:
        assert id_gerado != malicioso


# ── Contrato preservado ──────────────────────────────────────────────────────


def test_o_status_e_a_mensagem_continuam_os_de_antes():
    """A correcao nao pode virar breaking change de API.

    O corpo da resposta e o contrato que o frontend consome; o que mudou foi
    que a decisao passou a ser registrada. Se a mensagem mudar, a correcao
    vira duas. A comparacao e por TEXTO DECODIFICADO, e nao pelo byte: o
    `json_response` do aiohttp serializa com espaco apos os dois-pontos, e
    comparar a string crua casaria com a espacificacao, nao com o contrato.
    """
    import json

    req = _request()
    for status, motivo, esperado in (
        (401, "token_ausente", "Autorizacao ausente ou mal formatada."),
        (403, "token_invalido", "Token invalido."),
        (403, "sem_token_fora_do_loopback", "Acesso restrito a clientes locais."),
        # Estas duas carregam sufixo que a primeira versao do dicionario
        # encurtou. O teste falhou na suite completa -- e a falha era MINHA:
        # `test_backend_hardening.py:75` ja verificava o texto de
        # `origem_nao_confiavel` desde antes. Um teste que fixa a versao
        # ENCURTADA de um contrato protege quem encurtou contra quem o
        # restabelece, e nao protege o cliente que le a resposta.
        (
            403,
            "origem_nao_confiavel",
            "Origin nao confiavel para operacao sem token (Security Token not configured).",
        ),
        (
            403,
            "jwt_sem_usuario",
            "Token JWT nao identifica um usuario autenticado (sub ausente ou role diferente de authenticated).",
        ),
        (
            403,
            "rota_de_operador",
            "Rota de operador: exige credencial de servico, nao identidade de produto. "
            "Autoridade sobre o host nao acompanha o login do usuario.",
        ),
        (403, "token_legado_nao_configurada", "API_SECRET_TOKEN nao configurada para autenticacao legada."),
        (403, "jwt_invalido", "Token JWT do Supabase invalido ou expirado."),
    ):
        resp = middleware._recusa(req, status, motivo)
        assert resp.status == status
        assert json.loads(resp.text)["error"] == esperado, f"a mensagem de {motivo} mudou"


async def test_o_middleware_de_auth_nao_deja_o_registro_vazar_para_o_cliente():
    """A resposta nao pode carregar o motivo interno da recusa.

    O texto do motivo (`token_legado_nao_configurada`) diz ao atacante que o
    servidor esta sem credencial de servico configurada. O log leva o motivo; a
    resposta leva a frase, que e o que o cliente precisa.

    Este teste e `async` porque o projeto roda com `asyncio_mode = "auto"`: o
    `pytest-asyncio` faz o loop, e um `run_until_complete` dentro de um loop ja
    fechado levanta `RuntimeError`.

    O segredo JWT precisa estar PRESENTE: sem ele, `auth_middleware` desvia
    para `_handle_no_token_auth` (que exige loopback) e nunca chega ao ramo de
    token legado. Medido: a primeira versao deste teste, com so
    `API_SECRET_TOKEN=""`, recebia 403 de "acesso restrito a clientes locais" --
    outro caminho, nao o que o nome do teste descreve.
    """
    req = _request(headers={"Authorization": "Bearer sem.pontos"})

    async def _handler(_request):
        raise AssertionError("nao deveria passar da autenticacao")

    with (
        patch.object(middleware, "API_SECRET_TOKEN", ""),
        patch.object(middleware, "_jwt_secret", lambda: "segredo-jwt-de-teste"),
    ):
        resp = await middleware.auth_middleware(req, _handler)
    assert resp.status == 403
    assert "token_legado_nao_configurada" not in resp.text
    assert "API_SECRET_TOKEN nao configurada" in resp.text
    assert middleware.CORRELATION_HEADER in resp.headers


def test_a_resposta_de_recusa_preserva_os_codigos_http_originais():
    """401 para ausencia de token, 403 para token invalido. Inverter isso
    seria mudanca de contrato que o cliente nao esperava."""
    assert middleware._recusa(_request(), 401, "token_ausente").status == 401
    assert middleware._recusa(_request(), 403, "token_invalido").status == 403
    assert middleware._recusa(_request(), 403, "rota_de_operador").status == 403


def test_o_error_id_aparece_somente_nos_motivos_que_o_ja_pediam():
    """O `error_id` ja existia em `jwt_invalido`/`rota_de_operador` para casar
    com o log. Os motivos novos nao o recebem: `token_ausente` nao tem o que
    correlacionar alem do proprio 401."""
    assert "error_id" not in middleware._recusa(_request(), 401, "token_ausente").text
    assert "error_id" in middleware._recusa(_request(), 403, "jwt_invalido").text
    assert "error_id" in middleware._recusa(_request(), 403, "rota_de_operador").text
