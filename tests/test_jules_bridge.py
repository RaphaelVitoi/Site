"""Testes unitarios hermeticos para o modulo engine/jules_bridge.py.

Valida o contrato de integracao com a API do Google Jules sem efetuar chamadas de rede externas reais.
"""
from __future__ import annotations

import io
import json
import urllib.error
import urllib.request
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
    assert payload["sourceContext"]["source"] == "sources/github/RaphaelVitoi/Site"
    assert payload["sourceContext"]["githubRepoContext"]["branch"] == "feat/pmev-solver"


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
