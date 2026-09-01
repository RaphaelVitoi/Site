"""Contract tests for the explicit, repository-level quality gate."""

from __future__ import annotations

import json
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent


def test_sota_full_runs_frontend_tests_before_python_suite() -> None:
    package = json.loads((REPOSITORY_ROOT / "package.json").read_text(encoding="utf-8"))
    gate = package["scripts"]["sota:full"]

    assert "npm run test" in gate
    assert gate.index("npm run test") < gate.index("npm run python:test")
