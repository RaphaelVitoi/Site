"""Testes unitarios hermeticos para o modulo engine/jules_bridge.py.

Valida o contrato de integracao com a API do Google Jules sem efetuar chamadas de rede externas reais.
"""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest
from engine.jules_bridge import (
    JulesClient,
    JulesDiffResult,
    JulesSessionRequest,
    JulesSessionStatus,
)


def test_jules_session_request_payload() -> None:
    """Valida a serializacao correta do payload para a API do Jules."""
    req = JulesSessionRequest(
        source="sources/github/RaphaelVitoi/Site",
        prompt="Executar simulacao Monte Carlo PMev com 10M de iteracoes",
        branch="feat/pmev-solver",
        auto_approve_plan=True,
    )
    payload = req.to_payload()
    assert payload["prompt"] == "Executar simulacao Monte Carlo PMev com 10M de iteracoes"
    assert payload["autoApprovePlan"] is True
    source_ctx = payload["sourceContext"]
    assert isinstance(source_ctx, dict)
    assert source_ctx["source"] == "sources/github/RaphaelVitoi/Site"
    repo_ctx = source_ctx["githubRepoContext"]
    assert isinstance(repo_ctx, dict)
    assert repo_ctx["branch"] == "feat/pmev-solver"


def test_jules_client_unconfigured() -> None:
    """Valida que o cliente levanta ValueError quando nao ha chaves configuradas."""
    with patch.dict("os.environ", {"JULES_API_KEY": "", "GOOGLE_CLOUD_PROJECT": ""}, clear=True):
        client = JulesClient(api_key="", project_id="")
        assert not client.is_configured
        with pytest.raises(ValueError, match="JulesClient nao configurado"):
            client.create_session(JulesSessionRequest(source="src", prompt="p"))


def test_jules_client_create_session_success() -> None:
    """Valida a criacao de sessao assincrona com mock de resposta 201."""
    mock_resp_data = {
        "name": "projects/original-498419/locations/global/sessions/sess-9948",
        "state": "QUEUED",
        "createTime": "2026-08-29T12:00:00Z",
        "updateTime": "2026-08-29T12:00:01Z",
        "activities": [],
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = JulesClient(api_key="AIzaFakeKey", project_id="original-498419")
        status = client.create_session(
            JulesSessionRequest(
                source="sources/github/RaphaelVitoi/Site",
                prompt="PMev Monte Carlo",
            )
        )

        assert status.session_id == "sess-9948"
        assert status.state == "QUEUED"
        assert status.create_time == "2026-08-29T12:00:00Z"


def test_jules_client_get_session_status() -> None:
    """Valida a consulta de status e recuperacao de URL de Pull Request."""
    mock_resp_data = {
        "sessionId": "sess-9948",
        "state": "COMPLETED",
        "createTime": "2026-08-29T12:00:00Z",
        "updateTime": "2026-08-29T12:15:00Z",
        "githubPullRequestUrl": "https://github.com/RaphaelVitoi/Site/pull/42",
        "activities": [{"id": "act-1", "type": "TEST_EXECUTION", "status": "SUCCESS"}],
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = JulesClient(api_key="AIzaFakeKey", project_id="original-498419")
        status = client.get_session_status("sess-9948")

        assert status.session_id == "sess-9948"
        assert status.state == "COMPLETED"
        assert status.pr_url == "https://github.com/RaphaelVitoi/Site/pull/42"
        assert len(status.activities or []) == 1


def test_jules_client_approve_plan() -> None:
    """Valida a aprovacao formal de plano."""
    mock_resp = MagicMock()
    mock_resp.status = 200
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = JulesClient(api_key="AIzaFakeKey", project_id="original-498419")
        result = client.approve_plan("sess-9948", "act-plan-01", "APPROVE")
        assert result is True


def test_jules_client_get_diff() -> None:
    """Valida a obtencao do diff unificado da sessao."""
    mock_resp_data = {
        "patch": "diff --git a/engine/math_sota.py b/engine/math_sota.py\n+ # PMev optimization",
        "filesChanged": ["engine/math_sota.py"],
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = JulesClient(api_key="AIzaFakeKey", project_id="original-498419")
        diff_res = client.get_diff("sess-9948")

        assert isinstance(diff_res, JulesDiffResult)
        assert "engine/math_sota.py" in diff_res.files_changed
        assert "PMev optimization" in diff_res.diff_content


def test_jules_client_list_sources() -> None:
    """Valida a listagem de repositorios autorizados."""
    mock_resp_data = {"sources": [{"name": "sources/github/RaphaelVitoi/Site", "type": "GITHUB_REPO"}]}

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = JulesClient(api_key="AIzaFakeKey", project_id="original-498419")
        sources = client.list_sources()
        assert len(sources) == 1
        assert sources[0]["name"] == "sources/github/RaphaelVitoi/Site"


def test_jules_mcp_server_tools() -> None:
    """Valida a execucao e formato das ferramentas do Jules MCP Server."""
    from engine.jules_mcp_server import (
        jules_approve_plan,
        jules_create_session,
        jules_get_diff,
        jules_get_session_status,
        jules_list_sources,
        start_new_jules_task,
    )

    with (
        patch.object(JulesClient, "create_session") as mock_create,
        patch.object(JulesClient, "get_session_status") as mock_status,
        patch.object(JulesClient, "approve_plan", return_value=True),
        patch.object(JulesClient, "get_diff") as mock_diff,
        patch.object(JulesClient, "list_sources", return_value=[{"name": "test"}]),
    ):
        mock_create.return_value = JulesSessionStatus(
            session_id="sess-100",
            state="QUEUED",
            create_time="2026-08-29T12:00:00Z",
            update_time="2026-08-29T12:00:00Z",
        )
        mock_status.return_value = JulesSessionStatus(
            session_id="sess-100",
            state="COMPLETED",
            create_time="2026-08-29T12:00:00Z",
            update_time="2026-08-29T12:00:00Z",
        )
        mock_diff.return_value = JulesDiffResult(
            session_id="sess-100",
            diff_content="+ test",
            files_changed=["test.py"],
        )

        res_create = json.loads(jules_create_session("src", "prompt"))
        assert res_create["status"] == "SUCCESS"
        assert res_create["sessionId"] == "sess-100"

        res_status = json.loads(jules_get_session_status("sess-100"))
        assert res_status["status"] == "SUCCESS"
        assert res_status["state"] == "COMPLETED"

        res_approve = json.loads(jules_approve_plan("sess-100", "act-1"))
        assert res_approve["status"] == "SUCCESS"
        assert res_approve["approved"] is True

        res_diff = json.loads(jules_get_diff("sess-100"))
        assert res_diff["status"] == "SUCCESS"
        assert res_diff["filesChanged"] == ["test.py"]

        res_sources = json.loads(jules_list_sources())
        assert res_sources["status"] == "SUCCESS"

        res_task = json.loads(start_new_jules_task("RaphaelVitoi/Site", "test task"))
        assert res_task["status"] == "SUCCESS"
