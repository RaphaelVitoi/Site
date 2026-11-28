"""Testes de integracao e seguranca para expansao do explorador de arquivos ao ecossistema .gemini."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from aiohttp.test_utils import TestClient, TestServer
import pytest

from api.v1 import handler_support, handlers_files, middleware
from api.v1.server import create_app
import core.runtime as core_runtime
from database.queue_manager import QueueManager


def _create_mock_ecosystem(tmp_root: Path) -> tuple[Path, Path]:
    eco_dir = tmp_root / ".gemini"
    site_dir = eco_dir / "Site"
    (eco_dir / "nucleo" / "rules_ssot").mkdir(parents=True)
    (eco_dir / ".secrets").mkdir(parents=True)
    (eco_dir / "quarantine").mkdir(parents=True)
    (eco_dir / "acl_backup_20260820").mkdir(parents=True)
    (site_dir / "docs").mkdir(parents=True)

    (eco_dir / "WORKSPACE_INDEX.md").write_text("# Workspace Index\n[Site/README.md](Site/README.md)", encoding="utf-8")
    (eco_dir / "CLAUDE.md").write_text("# Root Governance", encoding="utf-8")
    (eco_dir / "nucleo" / "rules_ssot" / "kernel.md").write_text("# Kernel", encoding="utf-8")

    # Segredos que DEVEM ser bloqueados na listagem e no /api/files/view
    (eco_dir / "oauth_creds.json").write_text('{"token": "secret"}', encoding="utf-8")
    (eco_dir / "gcp_oauth_client.json").write_text('{"client_secret": "x"}', encoding="utf-8")
    (eco_dir / "google_accounts.json").write_text('{"email": "a@b.com"}', encoding="utf-8")
    (eco_dir / "installation_id").write_text("abc-123", encoding="utf-8")
    (eco_dir / ".env").write_text("API_KEY=secret", encoding="utf-8")
    (eco_dir / ".secrets" / "token.txt").write_text("top-secret", encoding="utf-8")
    (eco_dir / "webmcp_vectors.db").write_bytes(b"SQLite format 3\x00")
    (eco_dir / "quarantine" / "suspect.txt").write_text("quarantined", encoding="utf-8")
    (eco_dir / "acl_backup_20260820" / "acl.json").write_text("{}", encoding="utf-8")

    # Arquivos do Site
    (site_dir / "README.md").write_text("# Site README", encoding="utf-8")
    (site_dir / "docs" / "GUIDE.md").write_text("# Guide", encoding="utf-8")
    (site_dir / "app.py").write_text("print('ok')\n", encoding="utf-8")
    return eco_dir, site_dir


def _build_test_client(monkeypatch: pytest.MonkeyPatch, tmp_root: Path, site_dir: Path) -> TestClient[Any, Any]:
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    monkeypatch.setattr(handler_support, "BASE_WORKSPACE_DIR", site_dir)
    monkeypatch.setattr(core_runtime, "PATH_GDRIVE_ROOT", "", raising=False)
    monkeypatch.delenv("NEXUS_ECOSYSTEM_ROOT", raising=False)
    monkeypatch.setenv("NEXUS_GDRIVE_ROOT", "")
    monkeypatch.setenv("NEXUS_ONEDRIVE_ROOT", "")
    manager = QueueManager(queue_path=str(tmp_root / "eco-test.db"))
    return TestClient(TestServer(create_app(manager)))


@pytest.mark.unit
def test_resolve_ecosystem_root_detects_gemini_parent_and_rejects_generic_tmp(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("NEXUS_ECOSYSTEM_ROOT", raising=False)
    eco_dir, site_dir = _create_mock_ecosystem(tmp_path)

    assert handlers_files._resolve_ecosystem_root(site_dir) == eco_dir.resolve()

    generic_site = tmp_path / "generic_workspace" / "Site"
    generic_site.mkdir(parents=True)
    assert handlers_files._resolve_ecosystem_root(generic_site) is None


@pytest.mark.asyncio
@pytest.mark.unit
async def test_ecosystem_list_and_view_exposes_docs_without_duplicating_site_or_leaking_secrets(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    eco_dir, site_dir = _create_mock_ecosystem(tmp_path)

    async with _build_test_client(monkeypatch, tmp_path, site_dir) as client:
        resp = await client.get("/api/files/list")
        assert resp.status == 200
        payload = await resp.json()
        assert payload["status"] == "SUCCESS"

        by_source: dict[str, dict[str, Any]] = {src["source"]: src for src in payload["tree"]}
        assert "Ecosystem (.gemini)" in by_source
        assert "Project" in by_source

        eco_rel_paths = {item["relative_path"] for item in by_source["Ecosystem (.gemini)"]["files"]}
        assert "WORKSPACE_INDEX.md" in eco_rel_paths
        assert "CLAUDE.md" in eco_rel_paths
        assert "nucleo/rules_ssot/kernel.md" in eco_rel_paths
        # Site/ nao deve ser duplicado dentro de Ecosystem (.gemini)
        assert not any(p.startswith("Site/") for p in eco_rel_paths)

        # Segredos da raiz .gemini nao podem aparecer na listagem
        for sensitive_rel in (
            "oauth_creds.json",
            "gcp_oauth_client.json",
            "google_accounts.json",
            "installation_id",
            ".env",
            ".secrets/token.txt",
            "webmcp_vectors.db",
            "quarantine/suspect.txt",
            "acl_backup_20260820/acl.json",
        ):
            assert sensitive_rel not in eco_rel_paths

        # Segredos devem retornar 403 em /api/files/view
        for sensitive_path in (
            eco_dir / "oauth_creds.json",
            eco_dir / "gcp_oauth_client.json",
            eco_dir / "google_accounts.json",
            eco_dir / "installation_id",
            eco_dir / ".env",
            eco_dir / ".secrets" / "token.txt",
            eco_dir / "webmcp_vectors.db",
            eco_dir / "quarantine" / "suspect.txt",
            eco_dir / "acl_backup_20260820" / "acl.json",
        ):
            view_resp = await client.get("/api/files/view", params={"path": str(sensitive_path)})
            assert view_resp.status == 403, str(sensitive_path)

        # Documentacao legitima do ecossistema deve ser servida
        ok_resp = await client.get(
            "/api/files/view", params={"path": str(eco_dir / "nucleo" / "rules_ssot" / "kernel.md")}
        )
        assert ok_resp.status == 200
        ok_body = await ok_resp.json()
        assert ok_body["type"] == "text"
        assert "# Kernel" in ok_body["content"]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_list_files_supports_query_and_docs_mode_filters(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _, site_dir = _create_mock_ecosystem(tmp_path)

    async with _build_test_client(monkeypatch, tmp_path, site_dir) as client:
        docs_resp = await client.get("/api/files/list", params={"mode": "docs"})
        assert docs_resp.status == 200
        docs_payload = await docs_resp.json()
        proj_files = next(s["files"] for s in docs_payload["tree"] if s["source"] == "Project")
        proj_names = {f["name"] for f in proj_files}
        assert "README.md" in proj_names
        assert "app.py" not in proj_names

        q_resp = await client.get("/api/files/list", params={"q": "kernel"})
        assert q_resp.status == 200
        q_payload = await q_resp.json()
        all_names = {f["name"] for s in q_payload["tree"] for f in s["files"]}
        assert all_names == {"kernel.md"}


@pytest.mark.asyncio
@pytest.mark.unit
async def test_spreadsheet_nan_sanitization_and_binary_null_byte_guard(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _, site_dir = _create_mock_ecosystem(tmp_path)
    csv_path = site_dir / "dados.csv"
    csv_path.write_text("col_a,col_b\n10,\n,25.5\n", encoding="utf-8")

    bin_path = site_dir / "blob.bin"
    bin_path.write_bytes(b"\x00\x01\x02\xffBINARY")

    async with _build_test_client(monkeypatch, tmp_path, site_dir) as client:
        csv_resp = await client.get("/api/files/view", params={"path": str(csv_path)})
        assert csv_resp.status == 200
        raw_text = await csv_resp.text()
        parsed = json.loads(raw_text, parse_constant=lambda c: (_ for _ in ()).throw(ValueError(f"Invalid JSON: {c}")))
        assert parsed["type"] == "spreadsheet"
        assert parsed["data"]["rows"][0][1] is None

        bin_resp = await client.get("/api/files/view", params={"path": str(bin_path)})
        assert bin_resp.status == 200
        bin_body = await bin_resp.json()
        assert bin_body["type"] == "text"
        assert "Arquivo binário" in bin_body["content"]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_google_drive_and_onedrive_roots_list_read_and_enforce_secret_blocking(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _, site_dir = _create_mock_ecosystem(tmp_path)
    gdrive_dir = tmp_path / "Meu Drive"
    onedrive_dir = tmp_path / "OneDrive"
    (gdrive_dir / "Reports").mkdir(parents=True)
    (onedrive_dir / "Biblio").mkdir(parents=True)

    (gdrive_dir / "changelog.txt").write_text("GDrive changelog ok", encoding="utf-8")
    (gdrive_dir / "Reports" / "oauth_creds.json").write_text('{"secret":"1"}', encoding="utf-8")
    (onedrive_dir / "Biblio" / "nota_onedrive.md").write_text("# OneDrive Nota", encoding="utf-8")
    (onedrive_dir / ".env").write_text("SECRET=123", encoding="utf-8")

    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    monkeypatch.setattr(handler_support, "BASE_WORKSPACE_DIR", site_dir)
    monkeypatch.setattr(core_runtime, "PATH_GDRIVE_ROOT", None, raising=False)
    monkeypatch.delenv("NEXUS_ECOSYSTEM_ROOT", raising=False)
    monkeypatch.setenv("NEXUS_GDRIVE_ROOT", str(gdrive_dir))
    monkeypatch.setenv("NEXUS_ONEDRIVE_ROOT", str(onedrive_dir))
    manager = QueueManager(queue_path=str(tmp_path / "cloud-test.db"))

    async with TestClient(TestServer(create_app(manager))) as client:
        resp = await client.get("/api/files/list")
        assert resp.status == 200
        payload = await resp.json()
        by_source: dict[str, dict[str, Any]] = {src["source"]: src for src in payload["tree"]}
        assert "GoogleDrive" in by_source
        assert "OneDrive" in by_source

        gd_names = {f["name"] for f in by_source["GoogleDrive"]["files"]}
        od_names = {f["name"] for f in by_source["OneDrive"]["files"]}
        assert "changelog.txt" in gd_names
        assert "oauth_creds.json" not in gd_names
        assert "nota_onedrive.md" in od_names
        assert ".env" not in od_names

        gd_ok = await client.get("/api/files/view", params={"path": str(gdrive_dir / "changelog.txt")})
        assert gd_ok.status == 200
        assert (await gd_ok.json())["content"] == "GDrive changelog ok"

        od_ok = await client.get("/api/files/view", params={"path": str(onedrive_dir / "Biblio" / "nota_onedrive.md")})
        assert od_ok.status == 200
        assert "# OneDrive Nota" in (await od_ok.json())["content"]

        assert (
            await client.get("/api/files/view", params={"path": str(gdrive_dir / "Reports" / "oauth_creds.json")})
        ).status == 403
        assert (await client.get("/api/files/view", params={"path": str(onedrive_dir / ".env")})).status == 403
