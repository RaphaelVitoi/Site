"""Paridade entre formatadores declarados e extensoes recomendadas no workspace."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


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
