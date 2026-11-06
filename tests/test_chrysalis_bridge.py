"""Testes hermeticos do bridge Chrysalis (sem rede, sem filesystem AGPL)."""

from __future__ import annotations

import hashlib
import json
from unittest.mock import MagicMock, patch
import urllib.error

from engine.chrysalis_bridge import (
    AgentMode,
    ChrysalisClient,
    ChrysalisHealth,
    EditPlan,
    build_compaction_summary,
    compute_revision,
    validate_workspace_path,
)

CONTENT = "hello"
OTHER = "world"


def test_revision_is_sha256_and_differs_from_other_content() -> None:
    expected = hashlib.sha256(CONTENT.encode("utf-8")).hexdigest()
    assert compute_revision(CONTENT) == expected
    assert compute_revision(CONTENT) != compute_revision(OTHER)
    assert len(compute_revision(CONTENT)) == 64


def test_workspace_path_normalizes_backslash_to_posix() -> None:
    assert validate_workspace_path("apps\\pmev\\notes.md") == "apps/pmev/notes.md"
    assert validate_workspace_path("notes.plan.md") == "notes.plan.md"
    assert validate_workspace_path("apps/solver.ipynb") == "apps/solver.ipynb"


def test_workspace_path_rejects_windows_device_and_separator_injection() -> None:
    for bad in ("CON", "apps/COM1.txt", "C:/x/y.md", "/abs/path.md", "a/../b.md", "a:b.md", "foo.", "foo "):
        try:
            validate_workspace_path(bad)
            rejected = False
        except ValueError:
            rejected = True
        assert rejected is True, f"deveria rejeitar {bad!r}"


def test_plan_mode_blocks_mutation_accept_requires_approval() -> None:
    plan = EditPlan(
        path="apps/x.md", new_content="novo", expected_revision=compute_revision(CONTENT), mode=AgentMode.PLAN
    )
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    try:
        client.validate_edit(plan, current_revision=compute_revision(CONTENT), mutation=True)
        blocked = False
    except PermissionError:
        blocked = True
    assert blocked is True

    plan_acc = EditPlan(
        path="apps/x.md",
        new_content="novo",
        expected_revision=compute_revision(CONTENT),
        mode=AgentMode.ACCEPT,
        approved=False,
    )
    try:
        client.validate_edit(plan_acc, current_revision=compute_revision(CONTENT), mutation=True)
        blocked = False
    except PermissionError:
        blocked = True
    assert blocked is True


def test_stale_revision_is_rejected_never_silently_normalized() -> None:
    plan = EditPlan(
        path="apps/x.md", new_content="novo", expected_revision="deadbeef", mode=AgentMode.FULL, approved=True
    )
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    try:
        client.validate_edit(plan, current_revision=compute_revision(CONTENT), mutation=True)
        rejected = False
    except RuntimeError as e:
        rejected = "revisao defasada" in str(e)
    assert rejected is True


def test_validate_edit_returns_revision_and_undo_id_bound_to_plan() -> None:
    current = compute_revision(CONTENT)
    plan = EditPlan(path="apps/x.md", new_content="novo", expected_revision=current, mode=AgentMode.FULL, approved=True)
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    result = client.validate_edit(plan, current_revision=current, mutation=True)
    assert result.path == "apps/x.md"
    assert result.revision == compute_revision("novo")
    assert result.undo_id == compute_revision(f"apps/x.md\x00novo\x00{current}")


def test_compaction_summary_shape() -> None:
    summary = build_compaction_summary("goal", "progress", ["dec"], ["next"], ["a.md"], ["b.md"])
    assert summary["goal"] == "goal"
    assert summary["decisions"] == ["dec"]
    assert summary["files_changed"] == ["b.md"]


def test_base_url_boundaries_reject_file_and_external_http() -> None:
    for bad in ("file:///etc/passwd", "http://192.168.1.1:8788", "ftp://x/"):
        try:
            ChrysalisClient(base_url=bad)
            rejected = False
        except ValueError:
            rejected = True
        assert rejected is True, f"deveria rejeitar {bad!r}"
    assert ChrysalisClient(base_url="http://127.0.0.1:8788").is_configured is True
    assert ChrysalisClient(base_url="https://chrysalis.example.com").is_configured is True


def test_api_request_path_boundaries() -> None:
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    for bad in ("/v2/apps", "/v1/../v2/apps", "/v1/apps?x=1", "https://evil.com/v1/apps"):
        try:
            client._url_for_path(bad)
            rejected = False
        except ValueError:
            rejected = True
        assert rejected is True, f"deveria rejeitar {bad!r}"
    assert client._url_for_path("/v1/apps") == "http://127.0.0.1:8788/v1/apps"


def test_list_apps_parses_documented_shape() -> None:
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    payload = {"apps": [{"id": "a1", "name": "Solver", "updated": True}]}
    body = json.dumps(payload).encode("utf-8")
    response = MagicMock()
    response.read.return_value = body
    response.__enter__.return_value = response
    response.__exit__.return_value = False
    with patch("engine.chrysalis_bridge.urllib.request.urlopen", return_value=response) as mocked:
        apps = client.list_apps()
    assert mocked.called is True
    assert len(apps) == 1
    assert apps[0].id == "a1"
    assert apps[0]["name"] == "Solver"


def test_get_health_offline_on_connection_error() -> None:
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    with patch("engine.chrysalis_bridge.urllib.request.urlopen", side_effect=urllib.error.URLError("refused")):
        health = client.get_health()
    assert isinstance(health, ChrysalisHealth)
    assert health.status == "OFFLINE"
    assert health.fallback_used is True
    assert "provenia" in health.to_dict()


def test_delegate_readonly_returns_plan_enforced() -> None:
    client = ChrysalisClient(base_url="http://127.0.0.1:8788")
    result = client.delegate_readonly("ler apps")
    assert result["task"] == "ler apps"
    assert result["status"] == "PLAN_ENFORCED"
    assert result["mode"] == AgentMode.PLAN
