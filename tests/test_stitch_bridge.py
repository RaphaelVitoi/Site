"""Testes unitarios hermeticos para o modulo engine/stitch_bridge.py.

Valida a interacao com o servidor Stitch MCP, parsing JSON-RPC e geracao de payloads.
"""

from __future__ import annotations

# pylint: disable=protected-access
import json
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from engine.stitch_bridge import (
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
            device_type="DESKTOP",
        )
        assert res["name"] == "projects/10/screens/20"


def _args_enviados(mock_urlopen_patch) -> dict[str, Any]:
    """Extrai os argumentos que o bridge de fato enviou ao portao MCP."""
    req = mock_urlopen_patch.call_args[0][0]
    corpo = json.loads(req.data.decode("utf-8"))
    return corpo["params"]["arguments"]


def test_o_enum_oficial_do_portao_chega_ao_payload() -> None:
    """O contrato da porta e conservado: tier reconhecido vira `modelId`.

    Medicao viva via tools/list (2026-11-11): o enum do portao e
    GEMINI_3_8_FLASH | GEMINI_3_5_FLASH_LITE. Identificadores legados
    (GEMINI_3_FLASH, GEMINI_3_1_PRO) sao mapeados para o sucessor vigente,
    pois repassa-los crus seria rejeitado pelo MCP.
    """
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "projects/10/screens/21"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        client.generate_screen_from_text(
            project_id="10",
            prompt="Dashboard SOTA PMev",
            model_tier="BALANCED",
        )

    assert _args_enviados(m)["modelId"] == "GEMINI_3_8_FLASH"


def test_modelo_legado_mapeia_para_enum_vigente() -> None:
    """Gemini 3 Flash / 3.1 Pro sairam do enum do portao; o bridge traduz."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "projects/10/screens/23"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        client.generate_screen_from_text(
            project_id="10",
            prompt="Tela legada",
            model_tier="GEMINI_3_FLASH",
        )

    assert _args_enviados(m)["modelId"] == "GEMINI_3_8_FLASH"


def test_sem_modelo_declarado_a_escolha_fica_com_o_produto() -> None:
    """Omitir `model_tier` NAO inventa um default: `modelId` nem e enviado.

    Este e o comportamento correto, porque quem seleciona entre os tiers do
    Stitch e o proprio produto. Um default aqui seria o cliente decidindo por
    ele com base num rotulo de UI que o portao nao aceita.
    """
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "projects/10/screens/22"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        client.generate_screen_from_text(project_id="10", prompt="Dashboard SOTA PMev")

    assert "modelId" not in _args_enviados(m)


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


@pytest.mark.parametrize("base_url", ["http://stitch.googleapis.com/mcp", "file:///C:/x", ""])
def test_stitch_client_rejects_non_https_base_url(base_url: str) -> None:
    """urlopen abriria file: e esquemas custom; a base injetavel precisa ser https."""
    with pytest.raises(ValueError, match="https"):
        StitchClient(api_key="k", base_url=base_url)
    assert StitchClient(api_key="k")._base_url.startswith("https://")


def test_stitch_project_dual_dict_and_dataclass_access() -> None:
    """Valida acesso tanto por atributo quanto por dicionario em StitchProject."""
    proj = StitchProject.from_dict(
        {
            "name": "projects/18242753218562483944",
            "title": "Nexus PMev & Poker Racional UI",
            "createTime": "2026-09-04T23:23:30Z",
            "updateTime": "2026-10-28T11:12:46Z",
            "metadata": {"userRole": "OWNER"},
        }
    )
    assert isinstance(proj, dict)
    assert proj.project_id == "18242753218562483944"
    assert proj.title == "Nexus PMev & Poker Racional UI"
    assert proj["title"] == "Nexus PMev & Poker Racional UI"
    assert proj.get("createTime") == "2026-09-04T23:23:30Z"
    assert proj.get("metadata", {}).get("userRole") == "OWNER"


def test_stitch_screen_dual_dict_and_dataclass_access() -> None:
    """Valida acesso tanto por atributo quanto por dicionario em StitchScreen."""
    screen = StitchScreen.from_dict(
        {
            "name": "projects/18242753218562483944/screens/3260535219730569926",
            "title": "DESIGN.md",
            "deviceType": "DESKTOP",
            "screenshotUrl": "https://example.com/shot.png",
            "htmlUrl": "https://example.com/index.html",
        }
    )
    assert isinstance(screen, dict)
    assert screen.id == "3260535219730569926"
    assert screen.device_type == "DESKTOP"
    assert screen.screenshot_url == "https://example.com/shot.png"
    assert screen.html_url == "https://example.com/index.html"
    assert screen["deviceType"] == "DESKTOP"
    assert screen.get("screenshotUrl") == "https://example.com/shot.png"


def test_stitch_client_download_file() -> None:
    """Valida chamada do metodo download_file."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "structuredContent": {
                "content": "PGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5PjxoMT5OZXh1czwvaDE+PC9ib2R5PjwvaHRtbD4=",
                "mimeType": "text/html",
            }
        },
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.download_file("projects/10/files/file123")
        assert res.get("mimeType") == "text/html"
        assert _args_enviados(m)["name"] == "projects/10/files/file123"


def test_stitch_client_edit_screens() -> None:
    """Valida chamada do metodo edit_screens."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"output": "Screens updated"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.edit_screens(
            project_id="10",
            screen_ids=["projects/10/screens/screen1", "screen2"],
            prompt="Adicionar gradiente dourado",
            model_tier="BALANCED",
        )
        assert res.get("output") == "Screens updated"
        args = _args_enviados(m)
        assert args["projectId"] == "10"
        assert args["selectedScreenIds"] == ["screen1", "screen2"]
        assert args["modelId"] == "GEMINI_3_8_FLASH"


def test_stitch_client_generate_variants() -> None:
    """Valida chamada do metodo generate_variants."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"variantsCount": 3}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.generate_variants(
            project_id="10",
            screen_ids=["screenA"],
            prompt="Explorar variantes com alto contraste",
            variant_count=4,
            creative_range="REIMAGINE",
            aspects=["COLOR_SCHEME", "LAYOUT"],
            model_tier="SPEED",
        )
        assert res.get("variantsCount") == 3
        args = _args_enviados(m)
        assert args["projectId"] == "10"
        assert args["selectedScreenIds"] == ["screenA"]
        assert args["modelId"] == "GEMINI_3_5_FLASH_LITE"
        assert args["variantOptions"]["variantCount"] == 4
        assert args["variantOptions"]["creativeRange"] == "REIMAGINE"
        assert args["variantOptions"]["aspects"] == ["COLOR_SCHEME", "LAYOUT"]


def test_stitch_client_apply_design_system_and_create_from_design_md() -> None:
    """Valida criacao de DS via design md e aplicacao a telas."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"status": "SUCCESS"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res_create = client.create_design_system_from_design_md(
            project_id="10",
            screen_instance_id="inst_1",
            source_screen="projects/10/screens/sc1",
        )
        assert res_create.get("status") == "SUCCESS"
        args_create = _args_enviados(m)
        assert args_create["projectId"] == "10"
        assert args_create["selectedScreenInstance"]["id"] == "inst_1"

        res_apply = client.apply_design_system(
            project_id="10",
            asset_id="assets/ds123",
            selected_screen_instances=[{"id": "inst_1", "sourceScreen": "projects/10/screens/sc1"}],
        )
        assert res_apply.get("status") == "SUCCESS"
        args_apply = _args_enviados(m)
        assert args_apply["projectId"] == "10"
        assert args_apply["assetId"] == "ds123"


def test_stitch_client_update_project() -> None:
    """Valida update_project com update_mask e screen_instances."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "projects/10"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.update_project(
            "10",
            title="Novo Titulo",
            visibility="PRIVATE",
            screen_instances=[{"id": "inst1", "x": 100, "y": 0}],
            update_mask=["title", "visibility", "screen_instances"],
        )
        assert res["name"] == "projects/10"
        args = _args_enviados(m)
        assert args["name"] == "projects/10"
        assert args["title"] == "Novo Titulo"
        assert args["updateMask"] == ["title", "visibility", "screen_instances"]


def test_stitch_client_update_screen() -> None:
    """Valida update_screen com html base64 e update_mask."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "projects/10/screens/20"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.update_screen(
            "projects/10/screens/20",
            html_code_base64="PGI+aGk8L2I+",
            update_mask=["html_code"],
        )
        assert res["name"] == "projects/10/screens/20"
        args = _args_enviados(m)
        assert args["name"] == "projects/10/screens/20"
        assert args["htmlCodeBase64"] == "PGI+aGk8L2I+"
        assert args["updateMask"] == ["html_code"]


def test_stitch_client_design_system_crud() -> None:
    """Valida create/update_design_system (camada Rapid/design-system nativa)."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"name": "assets/ds1"}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        ds_payload = {"displayName": "Nexus DS", "theme": {"color": "#030610"}}
        res1 = client.create_design_system("projects/10", ds_payload)
        args1 = _args_enviados(m)
        assert args1["projectId"] == "10"
        assert args1["designSystem"]["displayName"] == "Nexus DS"

        ds_name = res1["name"]
        assert isinstance(ds_name, str)
        update_payload = {"displayName": "Nexus DS v2", "theme": {"color": "#030610"}}
        client.update_design_system("10", ds_name, update_payload)
        args2 = _args_enviados(m)
        assert args2["name"] == "assets/ds1"
        assert args2["designSystem"]["displayName"] == "Nexus DS v2"
        assert args2["designSystem"]["theme"]["color"] == "#030610"

    assert ds_name == "assets/ds1"


def test_classify_stitch_operation_usa_cascata_system1() -> None:
    """A classificacao de intencao Stitch delega a cascata Laya->Decisions."""
    from engine.stitch_bridge import STITCH_ACTION_QUESTIONS, classify_stitch_operation

    fake_result = {"engine": "laya-s1-trained", "answers": {}}
    with patch("llm.gemini_decisions.decide_s1", return_value=fake_result) as mock_decide:
        res = classify_stitch_operation("crie uma tela de login")

    assert res == fake_result
    args, _kwargs = mock_decide.call_args
    assert args[0] == "crie uma tela de login"
    assert args[1] is STITCH_ACTION_QUESTIONS
    assert "acao_stitch" in STITCH_ACTION_QUESTIONS
    assert STITCH_ACTION_QUESTIONS["acao_stitch"]["criteria"]["generate_screen"]


def test_stitch_enhance_prompt() -> None:
    """Valida o pipeline de aprimoramento de prompts visuais."""
    raw = "Monte um scanner de equidade para poker"
    enhanced = StitchClient.enhance_prompt(raw, platform="Web desktop", include_obsidian_design_system=True)

    assert "Monte um scanner de equidade para poker" in enhanced
    assert "Web desktop" in enhanced
    assert "Dark Obsidian Glassmorphism" in enhanced
    assert "DESIGN SYSTEM (REQUIRED - Obsidian Analytics):" in enhanced
    assert "Geist Sans" in enhanced
    assert "JetBrains Mono" in enhanced
    assert "#030610" in enhanced
    assert "#f2b72b" in enhanced


def test_stitch_generate_screen_with_auto_enhance() -> None:
    """Valida geracao com flag auto_enhance ativada."""
    mock_resp_data = {
        "jsonrpc": "2.0",
        "id": 1,
        "result": {"structuredContent": {"screen": {"id": "sc_auto"}}},
    }
    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp) as m:
        client = StitchClient(api_key="fake-key")
        res = client.generate_screen_from_text(
            project_id="projects/123",
            prompt="Dashboard PMev",
            auto_enhance=True,
        )
        screen = res.get("screen")
        assert isinstance(screen, dict)
        assert screen.get("id") == "sc_auto"
        args = _args_enviados(m)
        assert "Obsidian Analytics" in args["prompt"]
        assert "Dashboard PMev" in args["prompt"]


def test_stitch_agent_cli_offline_enhance(capsys: pytest.CaptureFixture[str]) -> None:
    """Valida subcomando enhance offline do run_stitch_agent.py."""
    import argparse

    from scripts.ops.run_stitch_agent import cmd_enhance

    args = argparse.Namespace(prompt="Criar tela de Nash", platform="Mobile", no_ds=False, json=True)
    code = cmd_enhance(args)
    assert code == 0

    captured = capsys.readouterr()
    data = json.loads(captured.out)
    assert data["original"] == "Criar tela de Nash"
    assert "Mobile" in data["enhanced"]
    assert "Obsidian Analytics" in data["enhanced"]
