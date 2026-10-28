"""Testes unitarios hermeticos para o modulo engine/exa_bridge.py.

Valida interacao com o endpoint Exa MCP, parsing de streams SSE, construcao de payloads e modelos de dados.
"""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from engine.exa_bridge import (
    ExaAgentRun,
    ExaClient,
    ExaSearchResponse,
    ExaSearchResult,
)


def _args_enviados(mock_urlopen_patch: MagicMock) -> dict[str, object]:
    """Extrai os argumentos enviados ao servidor MCP no payload JSON-RPC."""
    req = mock_urlopen_patch.call_args[0][0]
    corpo = json.loads(req.data.decode("utf-8"))
    return corpo["params"]["arguments"]


def test_exa_search_result_dataclass() -> None:
    """Valida criacao e atributos de ExaSearchResult com compatibilidade dupla."""
    res = ExaSearchResult(
        url="https://example.com/article",
        id="res_1",
        title="Artigo de Teste",
        text="Conteudo em markdown...",
        score=0.95,
    )
    assert res.url == "https://example.com/article"
    assert res.title == "Artigo de Teste"
    assert res.score == 0.95
    assert res["title"] == "Artigo de Teste"
    assert isinstance(res, dict)


def test_exa_search_response_dataclass() -> None:
    """Valida criacao de ExaSearchResponse e hidratacao de lista de resultados."""
    data = {
        "requestId": "req_12345",
        "autopromptString": "optimized query",
        "results": [
            {
                "url": "https://cncpoker.com/coaches/rapha-vitoi",
                "title": "CNC Poker - Rapha Vitoi",
                "publishedDate": "2024-07-17",
                "text": "Risk Premium e ICM",
                "score": 0.98,
            }
        ],
    }
    resp = ExaSearchResponse.from_dict(data)
    assert resp.request_id == "req_12345"
    assert len(resp.results) == 1
    assert resp.results[0].title == "CNC Poker - Rapha Vitoi"
    assert resp.results[0].published_date == "2024-07-17"
    assert isinstance(resp, dict)


def test_exa_agent_run_dataclass() -> None:
    """Valida criacao de ExaAgentRun e acesso hibrido."""
    run = ExaAgentRun(
        run_id="agent_run_999",
        status="completed",
        output="Pesquisa concluida com sucesso.",
        cost_dollars=0.05,
        duration_seconds=12,
    )
    assert run.run_id == "agent_run_999"
    assert run.status == "completed"
    assert run.cost_dollars == 0.05
    assert run["runId"] == "agent_run_999"
    assert isinstance(run, dict)


def test_exa_client_unconfigured() -> None:
    """Valida que o cliente levanta erro quando a API key esta ausente."""
    with patch.dict("os.environ", {"EXA_API_KEY": ""}, clear=True):
        client = ExaClient(api_key="")
        assert not client.is_configured
        with pytest.raises(ValueError, match="ExaClient nao configurado"):
            client.search("query")


@pytest.mark.parametrize("base_url", ["http://mcp.exa.ai/mcp", "file:///C:/test", ""])
def test_exa_client_rejects_non_https_base_url(base_url: str) -> None:
    """Valida que apenas URLs HTTPS sao aceitas para evitar esquemas arbitrarios."""
    with pytest.raises(ValueError, match="https"):
        ExaClient(api_key="fake-key", base_url=base_url)


def test_exa_client_search_sse_parsing() -> None:
    """Valida execucao de busca com parsing de carga SSE (text/event-stream)."""
    inner_result = {
        "requestId": "req_sse_1",
        "results": [
            {
                "url": "https://example.com/pmev",
                "title": "PMev Theory",
                "text": "Nash equilibrium under risk premium",
            }
        ],
    }
    sse_body = (
        b"event: message\n"
        b'data: {"jsonrpc":"2.0","id":1,"result":{"structuredContent":'
        + json.dumps(inner_result).encode("utf-8")
        + b"}}\n\n"
    )

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = ExaClient(api_key="fake-key")
        resp = client.search(query="Poker Racional PMev", num_results=3)

        assert resp.request_id == "req_sse_1"
        assert len(resp.results) == 1
        assert resp.results[0].title == "PMev Theory"

        args = _args_enviados(m)
        assert args["query"] == "Poker Racional PMev"
        assert args["numResults"] == 3


def test_exa_client_search_advanced_arguments() -> None:
    """Valida passagem de filtros estruturados em search_advanced."""
    mock_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "requestId": "req_adv_1",
                "results": [],
            }
        },
    }
    sse_body = b"data: " + json.dumps(mock_payload).encode("utf-8") + b"\n\n"

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = ExaClient(api_key="fake-key")
        client.search_advanced(
            query="Raphael Vitoi",
            num_results=5,
            category="people",
            include_domains=["cncpoker.com", "linkedin.com"],
            start_published_date="2024-01-01",
            enable_summary=True,
            enable_highlights=True,
        )

        args = _args_enviados(m)
        assert args["query"] == "Raphael Vitoi"
        assert args["category"] == "people"
        assert args["includeDomains"] == ["cncpoker.com", "linkedin.com"]
        assert args["startPublishedDate"] == "2024-01-01"
        assert args["enableSummary"] is True
        assert args["enableHighlights"] is True


def test_exa_client_fetch() -> None:
    """Valida chamada do metodo fetch para multiplas URLs."""
    mock_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "pages": [
                    {"url": "https://example.com/1", "text": "Pagina 1"},
                    {"url": "https://example.com/2", "text": "Pagina 2"},
                ]
            }
        },
    }
    sse_body = b"data: " + json.dumps(mock_payload).encode("utf-8") + b"\n\n"

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = ExaClient(api_key="fake-key")
        pages = client.fetch(["https://example.com/1", "https://example.com/2"], max_characters=2000)

        assert len(pages) == 2
        assert pages[0]["url"] == "https://example.com/1"
        args = _args_enviados(m)
        assert args["urls"] == ["https://example.com/1", "https://example.com/2"]
        assert args["maxCharacters"] == 2000


def test_exa_client_run_agent_and_get_run() -> None:
    """Valida disparo de pesquisa com Exa Agent e checagem de runId."""
    mock_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "runId": "agent_run_123",
                "status": "running",
                "costDollars": 0.02,
            }
        },
    }
    sse_body = b"data: " + json.dumps(mock_payload).encode("utf-8") + b"\n\n"

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = ExaClient(api_key="fake-key")
        run = client.run_agent(
            query="Auditar artigos academicos sobre ICM e PMev",
            effort="medium",
            max_cost_dollars=2.5,
        )
        assert run.run_id == "agent_run_123"
        assert run.status == "running"
        assert run.cost_dollars == 0.02

        args = _args_enviados(m)
        assert args["query"] == "Auditar artigos academicos sobre ICM e PMev"
        assert args["effort"] == "medium"
        assert args["budget"] == {"maxCostDollars": 2.5}

        # Checar status da mesma run
        run_status = client.get_agent_run("agent_run_123")
        assert run_status.run_id == "agent_run_123"


def test_exa_client_jsonrpc_error_handling() -> None:
    """Valida tratamento defensivo de erros JSON-RPC do Exa MCP."""
    err_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "error": {
            "code": -32602,
            "message": "Invalid params: query cannot be empty",
        },
    }
    sse_body = b"data: " + json.dumps(err_payload).encode("utf-8") + b"\n\n"

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = ExaClient(api_key="fake-key")
        with pytest.raises(RuntimeError, match="Erro no Exa MCP"):
            client.search("")


def test_exa_client_ping() -> None:
    """Valida metodo ping() para checagem rapida de saude da conexao."""
    mock_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"results": [{"url": "https://example.com/probe", "title": "Probe Result"}]}},
    }
    sse_body = b"data: " + json.dumps(mock_payload).encode("utf-8") + b"\n\n"

    mock_resp = MagicMock()
    mock_resp.read.return_value = sse_body
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = ExaClient(api_key="fake-key")
        assert client.ping() is True
