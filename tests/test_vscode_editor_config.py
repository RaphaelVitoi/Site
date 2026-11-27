"""Paridade entre formatadores declarados e extensoes recomendadas no workspace."""

from __future__ import annotations

import json
from pathlib import Path
import re
import tomllib

ROOT = Path(__file__).resolve().parents[1]

_JSONC_TOKEN_RE = re.compile(r'"(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/')


def _load_jsonc(path: Path) -> dict[str, object]:
    raw = path.read_text(encoding="utf-8")
    stripped = _JSONC_TOKEN_RE.sub(
        lambda m: m.group(0) if m.group(0).startswith('"') else "",
        raw,
    )
    cleaned = re.sub(r",(\s*[}\]])", r"\1", stripped)
    return json.loads(cleaned)


def _resolve_workspace_path(raw: str) -> Path:
    return Path(raw.replace("${workspaceFolder}", str(ROOT)))


def test_vscode_formatters_resolve_to_builtin_or_recommended_extensions() -> None:
    settings = json.loads((ROOT / ".vscode" / "settings.json").read_text(encoding="utf-8"))
    extensions = json.loads((ROOT / ".vscode" / "extensions.json").read_text(encoding="utf-8"))
    recommended = set(extensions["recommendations"])
    formatters = {
        config["editor.defaultFormatter"]
        for language, config in settings.items()
        if language.startswith("[") and isinstance(config, dict) and "editor.defaultFormatter" in config
    }

    assert settings["[yaml]"]["editor.defaultFormatter"] == "esbenp.prettier-vscode"
    assert all(formatter.startswith("vscode.") or formatter in recommended for formatter in formatters)
    assert "cweijan.vscode-office" in recommended


def test_rust_analyzer_linked_projects_and_tasks_manifests_exist() -> None:
    """Garante que linkedProjects, tasks Cargo e watcherExclude apontem apenas para crates existentes."""
    settings = json.loads((ROOT / ".vscode" / "settings.json").read_text(encoding="utf-8"))
    tasks_data = json.loads((ROOT / ".vscode" / "tasks.json").read_text(encoding="utf-8"))

    linked_projects = settings.get("rust-analyzer.linkedProjects", [])
    assert isinstance(linked_projects, list)
    assert len(linked_projects) >= 2
    for raw_manifest in linked_projects:
        assert isinstance(raw_manifest, str)
        manifest_path = _resolve_workspace_path(raw_manifest)
        assert manifest_path.is_file(), f"linkedProjects aponta para manifesto inexistente: {manifest_path}"

    tasks = tasks_data.get("tasks", [])
    labels = {t["label"] for t in tasks if isinstance(t, dict) and isinstance(t.get("label"), str)}
    for task in tasks:
        if not isinstance(task, dict):
            continue
        depends_on = task.get("dependsOn", [])
        if isinstance(depends_on, list):
            for dep in depends_on:
                assert dep in labels, f"dependsOn referencia task inexistente: {dep}"
        args = task.get("args", [])
        if isinstance(args, list):
            for idx, arg in enumerate(args[:-1]):
                if arg == "--manifest-path":
                    manifest_path = _resolve_workspace_path(str(args[idx + 1]))
                    assert manifest_path.is_file(), f"task {task.get('label')} aponta para {manifest_path}"

    watcher_exclude = settings.get("files.watcherExclude", {})
    assert watcher_exclude.get("**/wasm-equity/target/**") is True
    assert watcher_exclude.get("**/core/nexus-core-rust/target/**") is True


def test_vscode_settings_and_workspace_ssot_parity() -> None:
    """Garante paridade Ruff/LSP e ausencia de chaves duplicadas entre settings.json e Site.code-workspace."""
    settings = _load_jsonc(ROOT / ".vscode" / "settings.json")
    workspace = _load_jsonc(ROOT / "Site.code-workspace")
    workspace_settings = workspace.get("settings", {})
    assert isinstance(workspace_settings, dict)

    assert settings.get("ruff.lint.preview") is False
    assert settings.get("ruff.format.preview") is False
    if settings.get("python.languageServer") == "None":
        assert "python.analysis.diagnosticsSource" not in settings

    overlapping = sorted(set(settings) & set(workspace_settings))
    assert not overlapping, f"Chaves duplicadas entre .vscode/settings.json e Site.code-workspace: {overlapping}"


def test_pyproject_dev_optional_and_dependency_groups_parity() -> None:
    """Garante sincronia estrita entre [project.optional-dependencies].dev e [dependency-groups].dev."""
    data = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    optional_dev = data["project"]["optional-dependencies"]["dev"]
    group_dev = data["dependency-groups"]["dev"]
    assert optional_dev == group_dev
