"""Prova de integracao REAL contra o daemon Ollama em 127.0.0.1:11434.

Nao mocka sessao nem resposta: cria uma aiohttp.ClientSession de verdade e
chama engine.llm_api.call_ollama. O que se prova e o comportamento em
producao do caminho local -- exatamente o limite declarado na secao 4 do
registro de 2026-10-05.

Marcado com @pytest.mark.integration. Rodar com:
    uv run python -m pytest tests/test_llm_ollama_integracao_real.py -q -m integration
"""

from __future__ import annotations

import asyncio
import json
import os
import socket

import aiohttp
import pytest

pytestmark = [pytest.mark.integration, pytest.mark.unit]

OLLAMA_URL = os.environ.get("OLLAMA_API_BASE", "http://127.0.0.1:11434")

# Modelo pequeno e LOCAL: exercita o caminho sem depender de nuvem nem
# baixar gigabytes. qwen2.5-coder:0.5b esta instalado nesta maquina.
MODELO_LOCAL = "qwen2.5-coder:0.5b"
MODELO_INEXISTENTE = "modelo-que-nao-existe-xyz:999b"


def _daemon_responde() -> bool:
    """Prova de vida por conexao TCP: nao abre URL nem esquema nenhum."""
    try:
        with socket.create_connection(("127.0.0.1", _porta()), timeout=5):
            return True
    except OSError:
        return False


def _porta() -> int:
    return int(OLLAMA_URL.rsplit(":", 1)[-1])


def _modelos_instalados() -> set[str]:
    """Le `/api/tags` com o cliente do projeto.

    A primeira versao lia o corpo por socket cru e falhou com JSONDecodeError:
    o daemon responde `Transfer-Encoding: chunked`, e um parser HTTP escrito a
    mao teria de decodificar chunk-size, trailer e CRLF para fazer o que
    `aiohttp` -- a dependencia que o proprio `call_ollama` usa -- ja faz e
    audita. O cliente do projeto e a escolha que remove complexidade, nao uma
    preferencia: escrever o de menos e o caminho que introduz bug.
    """
    loop = asyncio.new_event_loop()
    try:
        bruto = loop.run_until_complete(_tags_async())
    finally:
        loop.close()
    return {m["name"] for m in json.loads(bruto)["models"]}


async def _tags_async() -> str:
    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(timeout=timeout) as sessao:
        async with sessao.get(f"{OLLAMA_URL}/api/tags") as resposta:
            resposta.raise_for_status()
            return await resposta.text()


requires_daemon = pytest.mark.skipif(
    not _daemon_responde(),
    reason=f"daemon Ollama indisponivel em {OLLAMA_URL}",
)


@requires_daemon
def test_daemon_lista_o_modelo_que_o_teste_vai_requisitar() -> None:
    """Pre-condicao declarada: o teste nao pode passar por modelo ausente."""
    assert MODELO_LOCAL in _modelos_instalados(), (
        f"{MODELO_LOCAL} nao instalado; o teste mediria um 404 do daemon, nao a resolucao de alias"
    )


@requires_daemon
@pytest.mark.asyncio
async def _inferir(session: aiohttp.ClientSession, modelo: str, fmt: dict | None):
    from engine.llm_api import call_ollama

    return await call_ollama(
        session,
        modelo,
        "Responda apenas com o valor pedido.",
        "Retorne o numero 42.",
        response_format=fmt,
        timeout_seconds=180.0,
    )


@requires_daemon
@pytest.mark.asyncio
async def test_call_ollama_responde_texto_contudo_com_schema_no_daemon_real() -> None:
    """O schema JSON chega ao daemon e a resposta obedece a ele."""
    schema = {
        "type": "object",
        "properties": {"resposta": {"type": "integer"}},
        "required": ["resposta"],
    }
    async with aiohttp.ClientSession() as sessao:
        texto, uso = await _inferir(sessao, MODELO_LOCAL, schema)

    assert isinstance(texto, str), f"resposta nao textual: {texto!r}"
    assert texto.strip(), "resposta vazia"
    # O daemon devolve JSON puro quando recebe `format` com schema; um texto
    # solto aqui indicaria que o schema foi reduzido a "json" ou ignorado.
    try:
        objeto = json.loads(texto)
    except json.JSONDecodeError as e:
        pytest.fail(f"resposta nao e JSON valido apesar do schema: {texto!r} ({e})")

    assert isinstance(objeto, dict), objeto
    assert "resposta" in objeto, f"campo exigido pelo schema ausente: {objeto}"
    assert isinstance(objeto["resposta"], int), objeto
    assert uso["completion_tokens"] > 0, uso


@requires_daemon
@pytest.mark.asyncio
async def test_call_ollama_sem_schema_nao_injeta_format() -> None:
    """Sem response_format, o corpo nao leva 'format' e a inferencia e livre."""
    async with aiohttp.ClientSession() as sessao:
        texto, uso = await _inferir(sessao, MODELO_LOCAL, None)

    assert isinstance(texto, str), f"resposta nao textual: {texto!r}"
    assert texto.strip(), "resposta vazia"
    assert uso["completion_tokens"] > 0, uso


@requires_daemon
@pytest.mark.asyncio
async def test_call_ollama_traduz_erro_do_daemon_em_runtime_error() -> None:
    """Modelo inexistente precisa falhar alto, com o status do daemon na mensagem.

    Este e o teste que o double nao prova: ali o `response.ok` era sempre
    True, entao o caminho de erro nunca executava.
    """
    from engine.llm_api import call_ollama

    async with aiohttp.ClientSession() as sessao:
        with pytest.raises(RuntimeError) as exc:
            await call_ollama(
                sessao,
                MODELO_INEXISTENTE,
                "sistema",
                "usuario",
                timeout_seconds=60.0,
            )

    mensagem = str(exc.value)
    assert "Ollama HTTP" in mensagem, mensagem
    assert "404" in mensagem, mensagem


@requires_daemon
def test_alias_do_manifesto_resolve_para_tag_instalada() -> None:
    """O alias 'qwen' do manifesto precisa apontar para uma tag REAL do daemon.

    Fecha o contrato fim a fim: alias -> OLLAMA_MODEL_MAP -> tag -> daemon.
    A medicao de 2026-09-03 mostrou os 6 qwen resolvindo errado; este teste
    pega a reincidencia sem precisar chamar o gerador.
    """
    from engine.gemma_server import OLLAMA_MODEL_MAP

    instalados = _modelos_instalados()
    for alias, tag in OLLAMA_MODEL_MAP.items():
        assert tag in instalados, (
            f"alias '{alias}' -> '{tag}', que o daemon nao tem instalado; "
            "o alias promete um modelo que nao existe nesta maquina"
        )
