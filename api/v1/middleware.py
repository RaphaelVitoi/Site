"""
Middlewares SOTA -- Interceptadores para Limite de Taxa, Autenticacao e CORS.
"""

# pylint: disable=broad-exception-caught
import base64
import hashlib
import hmac
import json
import logging
import math
import os
import re
import secrets
import time
from urllib.parse import urlsplit
import uuid

from aiohttp import web

from llm.budget import API_SECRET_TOKEN

# SOTA: Estado do Rate Limiter (IP -> {count, window_start})
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 300
MAX_TRACKED_IPS = 5000
_ip_blocks: dict[str, dict[str, float | int]] = {}
_last_purge_time = 0.0  # pylint: disable=invalid-name  # estado mutavel do modulo, nao constante


def _purge_expired_ips(now: float, force: bool = False) -> None:
    """Eviccao periodica de IPs inativos para aniquilar memory leaks sob trafego continuo."""
    global _last_purge_time  # pylint: disable=global-statement
    if not force and now - _last_purge_time < RATE_LIMIT_WINDOW and len(_ip_blocks) < MAX_TRACKED_IPS:
        return
    _last_purge_time = now
    cutoff = now - RATE_LIMIT_WINDOW
    expired = [ip for ip, data in _ip_blocks.items() if float(data["start_time"]) < cutoff]
    for ip in expired:
        _ip_blocks.pop(ip, None)
    if len(_ip_blocks) > MAX_TRACKED_IPS:
        sorted_ips = sorted(_ip_blocks.items(), key=lambda item: float(item[1]["start_time"]))
        to_remove = len(_ip_blocks) - MAX_TRACKED_IPS
        for ip, _ in sorted_ips[:to_remove]:
            _ip_blocks.pop(ip, None)


PUBLIC_PROBE_ROUTES: frozenset[str] = frozenset({"/", "/ping", "/health"})

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


def _auth_secret() -> str | None:
    """`AUTH_SECRET` do NextAuth — o segredo que assina o token de SESSAO.

    FASE 6 / opção C (2026-09-30). Separate de `_jwt_secret()` porque sao
    segredos de QUE ASSINAM: o `SUPABASE_JWT_SECRET` assina tokens de sessão do
    Supabase, e o `AUTH_SECRET` assina os do NextAuth. Um unico campo para os
    dois faria o sistema aceitar tokens de um emissor no lugar do outro — que e
    exatamente o que CVE-2026-102273 (o algoritmo-confusion do PyJWT, piso
    aplicado em `pyproject.toml`) descreve em escala maior.

    Mesma politica de `_jwt_secret()`: o ambiente atual tem precedencia sobre o
    valor lido no import, para que uma rotacao passe a valer sem reiniciar o
    processo.
    """
    return os.environ.get("AUTH_SECRET") or os.environ.get("NEXTAUTH_SECRET") or None


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


def _valid_numeric_time_claims(payload: dict) -> bool:
    """Exige exp e aceita nbf/iat apenas quando sao numeros finitos."""
    for claim_name in ("exp", "nbf", "iat"):
        value = payload.get(claim_name)
        if value is None:
            if claim_name == "exp":
                return False
            continue
        try:
            if not math.isfinite(float(value)):
                return False
        except (ValueError, TypeError):
            return False
    return True


def _time_claims_are_current(payload: dict, now: float) -> bool:
    """Confere exp, nbf e iat dentro da tolerancia de relogio declarada."""
    if now > float(payload["exp"]) + JWT_CLOCK_SKEW_SECONDS:
        return False
    nbf = payload.get("nbf")
    if nbf is not None and now < float(nbf) - JWT_CLOCK_SKEW_SECONDS:
        return False
    iat = payload.get("iat")
    return iat is None or now >= float(iat) - JWT_CLOCK_SKEW_SECONDS


def _optional_claims_match(payload: dict) -> bool:
    """Confere emissor e audiencia somente quando o ambiente os exige."""
    expected_iss = _expected_claim("SUPABASE_JWT_ISSUER")
    if expected_iss and payload.get("iss") != expected_iss:
        return False
    expected_aud = _expected_claim("SUPABASE_JWT_AUDIENCE")
    return not expected_aud or _audience_matches(payload.get("aud"), expected_aud)


def _claims_opcionais_declarados() -> bool:
    """O ambiente declara os DOIS claims? Nao a OR dos dois.

    Declarar so um deixa o outro aberto, e o registro ficaria calado sobre
    a metade que continua sem conferencia -- que e o modo de falha que
    SEC-05 mediu: a lacuna nao e do codigo, e do ambiente.
    """
    return bool(_expected_claim("SUPABASE_JWT_ISSUER") and _expected_claim("SUPABASE_JWT_AUDIENCE"))


def _avisar_claims_opcionais_ausentes() -> None:
    """Registra, uma vez, que `iss`/`aud` nao sao conferidos.

    SEC-05 (auditoria 2026-09-30): `_optional_claims_match` so conferia emissor e
    audiencia quando o ambiente os declarava, e nada avisava quando nao
    declarava. O resultado era um sistema que aceita a audiencia de qualquer
    aplicacao que compartilhe o segredo, em silencio, com o portao de
    seguranca reportando saude.

    A mitigacao real ja existe e e boa -- `role == "authenticated"` com `sub`
    presente bloqueia a `anon` e a `service_role` (BK-03) -- e por isso que a
    severidade residual e Media e nao Alta. Esta funcao nao fecha a lacuna;
    ela impede que a lacuna continue invisivel.

    Deliberadamente NAO e excecao: um `iss` declarado e errado derrubaria
    TODAS as 21 rotas de produto, e o modo de falha de uma validacao que falha
    alto no startup e pior que o de uma validacao que falha alto em producao.
    O aviso e o meio correto: o operador ve, decide, e o teste abaixo fixa o
    contrato.
    """
    if _jwt_secret() and not _claims_opcionais_declarados():
        LOGGER.warning(
            "[AUTH] SUPABASE_JWT_ISSUER e/ou SUPABASE_JWT_AUDIENCE ausentes: "
            "emissor e audiencia NAO estao sendo conferidos (SEC-05). "
            "A identidade de produto segue exige role=authenticated com sub "
            "(BK-03), mas um JWT de outra aplicacao que compartilhe o segredo passa. "
            "Declare as duas variaveis para fechar a lacuna."
        )


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

        # 4. Janela temporal (exp / nbf / iat) e 5. claims opcionais.
        if not _valid_numeric_time_claims(payload):
            return None
        if not _time_claims_are_current(payload, time.time()):
            return None
        if not _optional_claims_match(payload):
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
    if not origin:
        return False
    if origin in _trusted_origins():
        return True
    try:
        parsed = urlsplit(origin)
        _ = parsed.port
    except ValueError:
        return False
    return (
        parsed.scheme in {"http", "https"}
        and parsed.hostname in {"localhost", "127.0.0.1", "::1"}
        and parsed.username is None
        and parsed.password is None
        and parsed.path in {"", "/"}
        and not parsed.query
        and not parsed.fragment
    )


def _is_loopback(remote: str | None) -> bool:
    return remote in {"127.0.0.1", "::1", "localhost"}


#: SEC-07 (auditoria 2026-09-30): recusa de autenticacao nao era registrada em
#: lugar nenhum. `grep 'logger.'` neste arquivo devolvia ZERO -- e recusa de
#: autenticacao e o evento mais importante de um log de seguranca, porque e o
#: unico que some. Os handlers sao bem loggingados (`_internal_error` em
#: `handlers.py:114-127`), o que torna a lacuna mais escura: o sistema tem
#: telemetria de erro e nenhuma de ataque.
#:
#: Com `--allow-unauthenticated` no `cloudbuild.backend.yaml:79` e ate 20
#: replicas, sondagem contra a porta e o cenario base -- e sem registro, ela e
#: indistinguivel de silencio.
#:
#: O que NAO entra no registro, deliberadamente: o valor do token (nem
#: truncado), o cabecalho `Authorization` inteiro, e o corpo da requisicao. O
#: que entra e metodo, caminho, origem remota, `X-Nexus-Client-Id` -- que ja e
#: hash de 32 chars do gateway -- e o MOTIVO da recusa, que e o campo que
#: distingue "sem token" de "token invalido" de "rota de operador".
LOGGER = logging.getLogger(__name__)

#: Cabecalho de correlacao aceito do proxy de borda. Gerado aqui quando
#: ausente, e devolvido na resposta para que um 401 do log possa ser casado com
#: o acesso no proxy. Gerar no servidor e melhor que gerar no cliente: o cliente
#: nao precisa saber que existe, e o id continua presente mesmo quando o proxy
#: nao o manda.
CORRELATION_HEADER = "X-Request-Id"

#: Declarado AQUI, e nao na secao de rate limit mais abaixo, porque `_recusa`
#: o le. A definicao original vivia depois do primeiro uso -- resolvia em tempo
#: de chamada e funcionava por acaso, que e a forma como constante depende da
#: ordem de leitura de quem a importa.
CLIENT_ID_HEADER = "X-Nexus-Client-Id"


#: `_correlacao` e `_recusa` leem `request.headers`. O objeto `request` no
#: middleware do aiohttp sempre o tem, mas os testes existentes montam stubs
#: parciais -- e a medicao mostrou `AttributeError: '_Req' object has no
#: attribute 'headers'` em `test_auditoria_backend_2026_09_16.py`. Um
#: `getattr` defensivo resolve, e e a robustez que a funcao deveria ter desde o
#: comeco: a funcao registra uma RECUSA, e levantar excecao ao tentar
#: registrar transforma um 403 em 500 -- o modo de falha que transforma um
#: ataque em indisponibilidade.
def _headers(request):
    return getattr(request, "headers", None) or {}


#: FASE 6 / opção C (Tier 0, 2026-09-30): o token do USUÁRIO, que decide QUEM
#: é, e a credencial de serviço, que decide PORTA.
#:
#: Medido antes da mudanca: o gateway so enviava `Authorization` com
#: `API_SECRET_TOKEN`, e o backend so conseguia responder 401 ou 403. Nunca
#: "esta requisicao e do usuario X" — a identidade de produto exigia
#: `SUPABASE_JWT_SECRET`, que nao existe nesta maquina, e as 22 rotas de produto
#: respondiam 500.
#:
#: `X-User-Token` e o token de sessao do NextAuth, assinado com `AUTH_SECRET` --
#: o mesmo segredo que `proxy.ts:14` e `resolveAuthSecret()` usam no edge. O
#: backend valida a MESMA assinatura que o edge aceitou, entao nao ha segunda
#: decisao de sessao em dois lugares.
USER_TOKEN_HEADER = "X-User-Token"

#: O RISCO que a opcao C cria, e por que o escopo e declarado. Quem tem
#: `API_SECRET_TOKEN` PODE forjar `X-User-Token` — e o gateway tem a credencial.
#: Entao aceitar o token sem mais e aceitar uma afirmacao sobre identidade
#: vinda de quem ja tem autoridade sobre o host.
#:
#: O que fecha isso nao e algoritmos: e o vinculo com a sessao que o proprio
#: gateway ja verificou. `X-User-Token` so e considerado quando a requisicao
#: tambem traz a credencial de servico E o identificador de cliente que o
#: gateway so emite para uma sessao existente (`X-Nexus-Client-Id`, que e hash
#: do `user.id`). Sem os tres, o token e registrado e DESCARTADO.
#:
#: Isto e deliberadamente mais restritivo do que "validar a assinatura". A
#: assinatura prova que o token foi emitido por este projeto; o vinculo com
#: `X-Nexus-Client-Id` prova que veio do caminho que so o gateway percorre. Um
#: chama externo com a credencial de servico tem os dois primeiros e nao tem o
#: terceiro.
USUARIOS_DE_SESSAO: dict[str, str] = {}


def _registrar_usuario_de_sessao(usuario_id: str, cliente_id: str) -> None:
    """LIGA `(usuario, cliente)` para que o par possa ser re-verificado.

    Deliberadamente um par e nao uma so parte: aceitar o token sem o vinculo
    permitiria que um `X-User-Token` valido, reapresentado com um
    `X-Nexus-Client-Id` diferente, passasse como se fosse de outra pessoa.
    """
    USUARIOS_DE_SESSAO[cliente_id] = usuario_id


def _identidade_do_usuario(request) -> str | None:
    """Devolve o `sub` do usuario, ou `None` se a cadeia nao fechar por inteiro.

    Os quatro elos, e TODOS sao necessarios:
      1. `X-User-Token` presente;
      2. assinatura valida com `AUTH_SECRET` (mesmo verificador HS256 do
         Supabase, exigindo `alg` declarado);
      3. `sub` presente no payload;
      4. `X-Nexus-Client-Id` presente E ja ligado a este `sub` pelo gateway.
    """
    token = _header(request, USER_TOKEN_HEADER).strip()
    cliente = _header(request, CLIENT_ID_HEADER).strip()
    if not token or not cliente:
        return None
    if len(token.split(".")) != 3:
        return None

    secret = _auth_secret()
    if not secret:
        return None
    payload = verify_hs256_jwt(token, secret)
    if payload is None:
        return None

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.strip():
        return None
    if USUARIOS_DE_SESSAO.get(cliente) != subject:
        # Par nao ligado: ou o gateway nao o registrou (chamada externa com a
        # credencial), ou o par foi reapresentado com outro cliente.
        LOGGER.warning(
            "[AUTH] X-User-Token sem vinculo de sessao id=%s cliente=%s caminho=%s -- descartado",
            _correlacao(request),
            cliente,
            getattr(request, "path", "?"),
        )
        return None
    return subject


def _header(request, nome: str, padrao: str = "") -> str:
    return _headers(request).get(nome, padrao)


def _correlacao(request) -> str:
    recebido = _header(request, CORRELATION_HEADER).strip()
    if recebido and re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", recebido):
        return recebido
    return uuid.uuid4().hex[:16]


def _recusa(request, status: int, motivo: str, mensagem: str | None = None) -> web.Response:
    """Responde com recusa de autenticacao/autorizacao E a registra.

    O corpo nao muda: as mensagens seguem exatamente as de antes, porque o
    contrato de API para o cliente e o que a §5 da auditoria mede. O que
    novelty e que a decisao agora deixa rastro.
    """
    request_id = _correlacao(request)
    LOGGER.warning(
        "[AUTH] recusa id=%s motivo=%s metodo=%s caminho=%s remoto=%s cliente=%s",
        request_id,
        motivo,
        getattr(request, "method", "?"),
        getattr(request, "path", "?"),
        getattr(request, "remote", None),
        _header(request, CLIENT_ID_HEADER, "-"),
    )
    #: As mensagens sao as de ANTES da correcao, byte a byte. Centralizar o
    #: texto num dicionario facilitou a manutencao e convidou a encurtar duas
    #: sem querer -- o sufixo "(Security Token not configured)" de
    #: `origem_nao_confiavel` sumiu, e `test_backend_hardening.py:75` o
    #: verificava. O teste verde nao teria notado sozinho: so o teste que ja
    #: existia sobre o texto original o fez. Contrato de API e teste que ja
    #: existia, nao opiniao minha.
    textos = {
        "token_ausente": "Autorizacao ausente ou mal formatada.",
        "token_legado_nao_configurada": "API_SECRET_TOKEN nao configurada para autenticacao legada.",
        "token_invalido": "Token invalido.",
        "jwt_invalido": "Token JWT do Supabase invalido ou expirado.",
        "jwt_sem_usuario": (
            "Token JWT nao identifica um usuario autenticado (sub ausente ou role diferente de authenticated)."
        ),
        "rota_de_operador": (
            "Rota de operador: exige credencial de servico, nao identidade de produto. "
            "Autoridade sobre o host nao acompanha o login do usuario."
        ),
        "sem_token_fora_do_loopback": "Acesso restrito a clientes locais.",
        "origem_nao_confiavel": "Origin nao confiavel para operacao sem token (Security Token not configured).",
    }
    corpo: dict[str, object] = {"error": mensagem or textos.get(motivo, "Acesso negado.")}
    if motivo in {"jwt_invalido", "jwt_sem_usuario", "rota_de_operador", "token_invalido"}:
        corpo["error_id"] = request_id
    return web.json_response(corpo, status=status, headers={CORRELATION_HEADER: request_id})


async def _handle_no_token_auth(request, origin, handler):
    """Lida com requisicoes sem token configurado."""
    if not _is_loopback(getattr(request, "remote", None)):
        return _recusa(request, 403, "sem_token_fora_do_loopback")
    if origin and not _origin_is_trusted(origin):
        return _recusa(request, 403, "origem_nao_confiavel")
    return await handler(request)


#: Rotas que a identidade de PRODUTO (JWT do Supabase) pode alcancar.
#:
#: Achado B07. Duas credenciais de naturezas diferentes entram pela mesma porta:
#: o JWT identifica um usuario humano do site; a `API_SECRET_TOKEN` e credencial
#: de servico e carrega autoridade sobre o host. Ate 2026-09-09 ambas chegavam as
#: mesmas 29 rotas -- inclusive `/api/files/view`, que le o disco do projeto --
#: e `user_role`, extraido logo abaixo, nao tinha um unico leitor no backend.
#:
#: A faixa e FAIL-CLOSED de proposito: o JWT alcanca so o que esta declarado
#: aqui, entao rota nova nasce fechada a identidade de produto. O criterio de
#: inclusao e estreito -- calculo puro sobre a entrada da requisicao e leitura
#: inocua de saude. Fila, estado global, disco, ingestao, busca e telemetria de
#: operacao ficam de fora, porque nenhuma delas e sobre o usuario que pergunta.
POLITICA_ROTAS_DE_PRODUTO: dict[str, frozenset[str]] = {
    "/": frozenset({"GET"}),
    "/ping": frozenset({"GET"}),
    "/health": frozenset({"GET"}),
    "/lab/tournaments": frozenset({"GET"}),
    "/predictive-profile": frozenset({"GET"}),
    "/api/logs/frontend": frozenset({"POST"}),
    "/api/v1/perspective": frozenset({"POST"}),
    "/api/v1/perspective/tree": frozenset({"POST"}),
    "/api/v1/perspective/import-solver": frozenset({"POST"}),
    "/api/v1/perspective/heatmap": frozenset({"POST"}),
    "/api/v1/pmev/heatmap": frozenset({"POST"}),
    "/api/v1/timesfm/forecast": frozenset({"POST"}),
    "/api/v1/engine-capabilities": frozenset({"GET"}),
    "/api/v1/game-theory/pluribus/solve": frozenset({"POST"}),
    "/api/v1/game-theory/deepstack/resolve": frozenset({"POST"}),
    "/api/v1/game-theory/rebel/pbs/evaluate": frozenset({"POST"}),
    "/api/v1/game-theory/claudico/translate-action": frozenset({"POST"}),
    "/api/v1/canonical/clairvoyance/solve": frozenset({"POST"}),
    "/api/v1/canonical/akq/solve": frozenset({"POST"}),
    "/api/v1/canonical/janda/mdf": frozenset({"POST"}),
    "/api/v1/canonical/janda/geometric-sizing": frozenset({"POST"}),
    "/api/v1/canonical/janda/bluff-ratios": frozenset({"POST"}),
}

# Compatibilidade nominal com os registros e consumidores da politica original.
ROTAS_DE_PRODUTO: frozenset[str] = frozenset(POLITICA_ROTAS_DE_PRODUTO)


def rota_e_de_produto(path: str | None, method: str | None = None) -> bool:
    """Valida a capacidade de produto pela dupla exata ``path x metodo``.

    Sem ``method`` preserva a consulta estrutural por path. O middleware sempre
    fornece o metodo, impedindo que uma identidade de produto promova GET a POST
    (ou o inverso) apenas porque ambos compartilham o mesmo caminho.
    """
    if not path:
        return False
    normalized_path = path.rstrip("/") or "/"
    allowed_methods = POLITICA_ROTAS_DE_PRODUTO.get(normalized_path)
    if allowed_methods is None:
        return False
    return method is None or method.upper() in allowed_methods


async def _handle_jwt_token_auth(token: str, request, handler):
    """Verifica um token JWT contra a chave secreta do Supabase."""
    secret = _jwt_secret()
    if not secret:
        return web.json_response(
            {"error": "Configuracao de autenticacao JWT ausente no backend (SUPABASE_JWT_SECRET nao definido)."},
            status=500,
        )
    _avisar_claims_opcionais_ausentes()
    payload = verify_hs256_jwt(token, secret)
    if payload is None:
        return _recusa(request, 403, "jwt_invalido")

    # BK-03 (auditoria 2026-09-16). A anon key e a service_role key do Supabase
    # sao JWTs HS256 assinados com o MESMO segredo, sem `sub`, com exp de anos --
    # e a anon key e publica (NEXT_PUBLIC_SUPABASE_ANON_KEY). Assinatura valida
    # prova so que o token veio do projeto, nao que ha um usuario. A identidade
    # de produto exige as duas coisas que so a sessao de um usuario carrega.
    subject = payload.get("sub")
    role = payload.get("role")
    if not isinstance(subject, str) or not subject.strip() or role != "authenticated":
        return _recusa(request, 403, "jwt_sem_usuario")
    request["user_id"] = subject
    request["user_role"] = role

    # A identidade extraida acima passa a ter consumidor: ela DELIMITA o alcance,
    # em vez de ser lida e descartada.
    if not rota_e_de_produto(
        getattr(request, "path", None),
        getattr(request, "method", None),
    ):
        return _recusa(request, 403, "rota_de_operador")
    return await handler(request)


#: Cabecalho pelo qual o gateway Next.js identifica o visitante em nome de quem
#: chama. So e lido quando a propria requisicao traz a credencial de servico.
#: A constante vive acima, junto de `CORRELATION_HEADER`, porque `_recusa` a le.
_CLIENT_ID_RE = re.compile(r"^[A-Za-z0-9._:@-]{1,128}$")


def _rate_limit_key(request) -> str:
    """Chave de contagem do rate limit.

    BK-06 (auditoria 2026-09-16): o gateway Next chama de 127.0.0.1 em nome de
    TODOS os visitantes, entao contar por IP punha o site inteiro num balde so.

    1. Credencial de servico valida + `X-Nexus-Client-Id` -> conta por visitante.
       Sem a credencial o cabecalho e ignorado: quem nao e o gateway nao escolhe
       o proprio balde.
    2. Remoto loopback com `X-Forwarded-For` -> ultimo salto, o que o proxy local
       ANEXOU. O primeiro salto e o que o cliente escreveu, e era o lido antes.
    3. Caso geral -> IP remoto.
    """
    remote_ip = getattr(request, "remote", None) or "127.0.0.1"
    client_id = request.headers.get(CLIENT_ID_HEADER, "").strip()
    auth_header = request.headers.get("Authorization", "")
    if (
        client_id
        and API_SECRET_TOKEN
        and auth_header.startswith("Bearer ")
        and _CLIENT_ID_RE.fullmatch(client_id)
        and secrets.compare_digest(auth_header[7:], API_SECRET_TOKEN)
    ):
        return f"client:{client_id}"
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded and _is_loopback(remote_ip):
        hops = [hop.strip() for hop in forwarded.split(",") if hop.strip()]
        if hops:
            return hops[-1]
    return remote_ip


@web.middleware
async def rate_limit_middleware(request, handler):
    """Aplica limite de requisicoes por cliente na janela de tempo definida."""
    ip = _rate_limit_key(request)

    current_time = time.time()
    _purge_expired_ips(current_time)

    record = _ip_blocks.get(ip, {"count": 0, "start_time": current_time})
    if current_time - float(record["start_time"]) > RATE_LIMIT_WINDOW:
        record = {"count": 0, "start_time": current_time}

    record["count"] = int(record["count"]) + 1
    _ip_blocks[ip] = record

    if int(record["count"]) > MAX_REQUESTS_PER_WINDOW:
        # A-10 (auditoria 2026-09-29): 429 sem `Retry-After` obriga o cliente a
        # adivinhar o balde, e adivinhando ele volta cedo e produz o retry storm
        # que o limite existe para impedir. O valor declarado e o que o cliente
        # PRECISA esperar, nao o que ele espera se sair bem.
        # SEC-07: 429 e o outro evento de seguranca que sumia. Recusa de
        # autenticacao e estouro de limite sao os dois sinais de sondagem, e os
        # dois tinham o mesmo destino: nenhum registro.
        LOGGER.warning(
            "[RATE] excedido id=%s metodo=%s caminho=%s remoto=%s cliente=%s contagem=%s",
            _correlacao(request),
            request.method,
            request.path,
            getattr(request, "remote", None),
            request.headers.get(CLIENT_ID_HEADER, "-"),
            record["count"],
        )
        return web.json_response(
            {"error": "Rate limit excedido. Defesa de entropia ativada."},
            status=429,
            headers={
                "Retry-After": str(RATE_LIMIT_WINDOW),
                "X-RateLimit-Limit": str(MAX_REQUESTS_PER_WINDOW),
                "X-RateLimit-Window": str(RATE_LIMIT_WINDOW),
                CORRELATION_HEADER: _correlacao(request),
            },
        )

    return await handler(request)


@web.middleware
async def auth_middleware(request, handler):
    """Verifica tokens de autorizacao e aplica validacao de origem."""
    if request.method == "OPTIONS" or (request.method == "GET" and request.path in PUBLIC_PROBE_ROUTES):
        return await handler(request)

    origin = request.headers.get("Origin")
    if not API_SECRET_TOKEN and not _jwt_secret():
        return await _handle_no_token_auth(request, origin, handler)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return _recusa(request, 401, "token_ausente")

    token = auth_header.split(" ")[1]

    # Verificar se e um token JWT (formado por 3 segmentos com pontos)
    if len(token.split(".")) == 3:
        return await _handle_jwt_token_auth(token, request, handler)

    # Fallback: se nao for JWT, valida contra a API_SECRET_TOKEN legada
    if not API_SECRET_TOKEN:
        return _recusa(request, 403, "token_legado_nao_configurada")

    if not secrets.compare_digest(token, API_SECRET_TOKEN):
        return _recusa(request, 403, "token_invalido")

    # FASE 6 / opção C (Tier 0, 2026-09-30): a credencial de servico abriu a
    # PORTA. Quem e o USUARIO vem do `X-User-Token`, validado contra o
    # `AUTH_SECRET` e exige o vinculo de sessao. Sem esse header, a requisicao
    # segue — anônima, como sempre foi — e nenhuma rota de produto a alcanca.
    # A opcao C nao ABRE nada: ela da nome ao que ja estava fechado.
    usuario = _identidade_do_usuario(request)
    if usuario:
        request["user_id"] = usuario
        request["user_role"] = "authenticated"

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
        _apply_security_headers(response.headers)
        return response
    except web.HTTPException as ex:
        _apply_security_headers(ex.headers)
        raise


SECURITY_HEADERS: dict[str, str] = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
}

#: A-05 (auditoria 2026-09-29): o backend nao emitia `Cache-Control`, e o gateway
#: Next.js so o fazia nos seus proprios corpo (`frontend/src/lib/server/
#: operator-gateway.ts`). Duas camadas, um contrato incompleto: uma resposta do
#: backend que chegasse ao cache do navegador servia dados de operador
#: (`/status`, `/db-summary`, `/state`) a partir de cache.
#:
#: HSTS entra aqui com uma ressalva medida: o backend escuta em HTTP puro
#: (Cloud Run/CDN termina TLS), e por isso nao emite HSTS. A politica fica no
#: edge, que e onde TLS existe. Ver `frontend/next.config.js` (`headers()`).
CACHE_CONTROL_NO_STORE = "no-store"


def _apply_security_headers(headers) -> None:
    for name, value in SECURITY_HEADERS.items():
        headers.setdefault(name, value)
    # Operador por padrao: dado de fila, orcamento, arquivo e estado nao sao
    # publicos, e nenhum deles muda de valor entre duas leituras -- guardar em
    # cache so pode servir dado velho. `setdefault` preserva quem ja declarou.
    headers.setdefault("Cache-Control", CACHE_CONTROL_NO_STORE)
    headers.setdefault("Pragma", "no-cache")


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
