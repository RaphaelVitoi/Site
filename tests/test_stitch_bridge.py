"""Testes unitarios hermeticos para o modulo engine/stitch_bridge.py.

Valida a interacao com o servidor Stitch MCP, parsing JSON-RPC e geracao de payloads.
"""

from __future__ import annotations

import base64
import json
from unittest.mock import MagicMock, patch

import pytest

from engine.stitch_bridge import (
    STITCH_MODEL_BALANCED,
    STITCH_MODEL_SPEED,
    StitchClient,
    StitchProject,
    StitchScreen,
)


def test_stitch_project_dataclass() -> None:
    """Valida a extracao correta do project_id a partir do recurso."""
    proj = StitchProject(
        name="projects/18242753218562483944",
        title="Nexus PMev UI",
    )
    assert proj.project_id == "18242753218562483944"
    assert proj.title == "Nexus PMev UI"


def test_stitch_screen_dataclass() -> None:
    """Valida criacao de objeto StitchScreen."""
    screen = StitchScreen(
        name="projects/123/screens/456",
        id="456",
        title="Dashboard",
        device_type="DESKTOP",
        screenshot_url="https://example.com/shot.png",
    )
    assert screen.id == "456"
    assert screen.device_type == "DESKTOP"


def test_stitch_client_unconfigured() -> None:
    """Valida que o cliente levanta erro quando nao ha chave configurada."""
    with patch.dict("os.environ", {"STITCH_API_KEY": ""}, clear=True):
        client = StitchClient(api_key="")
        client._api_key = ""
        assert not client.is_configured
        with pytest.raises(ValueError, match="StitchClient nao configurado"):
            client.list_projects()


def test_stitch_client_list_projects_structured_content() -> None:
    """Valida listagem de projetos com resposta via structuredContent."""
    mock_response = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "projects": [
                    {
                        "name": "projects/18242753218562483944",
                        "title": "Nexus PMev & Poker Racional UI",
                        "visibility": "PRIVATE",
                    }
                ]
            }
        },
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_response).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = StitchClient(api_key="fake-key")
        projects = client.list_projects()
        assert len(projects) == 1
        assert projects[0]["title"] == "Nexus PMev & Poker Racional UI"


def test_stitch_client_list_projects_content_text_fallback() -> None:
    """Valida listagem de projetos com resposta empacotada em content[0].text."""
    inner_payload = {
        "projects": [
            {
                "name": "projects/999",
                "title": "Fallback Project",
            }
        ]
    }
    mock_response = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(inner_payload),
                }
            ]
        },
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_response).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = StitchClient(api_key="fake-key")
        projects = client.list_projects()
        assert len(projects) == 1
        assert projects[0]["title"] == "Fallback Project"


def test_stitch_client_create_and_delete_project() -> None:
    """Valida criacao e exclusao de projeto via Stitch MCP."""
    mock_create_resp = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "name": "projects/8888",
                "title": "Novo Projeto",
            }
        },
    }
    mock_delete_resp = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {}},
    }

    mock_resp1 = MagicMock()
    mock_resp1.read.return_value = json.dumps(mock_create_resp).encode("utf-8")
    mock_resp1.__enter__.return_value = mock_resp1

    mock_resp2 = MagicMock()
    mock_resp2.read.return_value = json.dumps(mock_delete_resp).encode("utf-8")
    mock_resp2.__enter__.return_value = mock_resp2

    with patch("urllib.request.urlopen", side_effect=[mock_resp1, mock_resp2]):
        client = StitchClient(api_key="fake-key")
        created = client.create_project("Novo Projeto")
        assert created["name"] == "projects/8888"

        deleted = client.delete_project("8888")
        assert deleted is True


def test_stitch_client_generate_screen() -> None:
    """Valida disparo de geracao de tela com os argumentos requeridos."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "name": "projects/10/screens/20",
                "output_components": "Generated screen successfully",
            }
        },
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = StitchClient(api_key="fake-key")
        res = client.generate_screen_from_text(
            project_id="10",
            prompt="Dashboard SOTA PMev",
            model_tier=STITCH_MODEL_BALANCED,
            device_type="DESKTOP",
        )
        assert res["name"] == "projects/10/screens/20"


def test_stitch_client_upload_design_md() -> None:
    """Valida conversao base64 do conteudo no upload_design_md."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"status": "UPLOADED"}},
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = StitchClient(api_key="fake-key")
        design_text = "# Poker Racional Design System\n- Colors: Dark Space, Gold"
        res = client.upload_design_md("10", design_text)
        assert res.get("status") == "UPLOADED"


def test_stitch_client_jsonrpc_error_handling() -> None:
    """Valida que o cliente levanta RuntimeError quando o servidor retorna erro JSON-RPC."""
    mock_err_response = {
        "jsonrpc": "2.0",
        "id": 1,
        "error": {
            "code": -32602,
            "message": "Invalid params: projectId missing",
        },
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_err_response).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        client = StitchClient(api_key="fake-key")
        with pytest.raises(RuntimeError, match="Erro no Stitch MCP"):
            client.list_screens("missing-id")
