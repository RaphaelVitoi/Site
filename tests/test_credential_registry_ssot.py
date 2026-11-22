"""Contratos da fonte unica de credenciais (data/credential_registry.json) e projecao em memoria."""

from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import subprocess  # noqa: S404  # Record-Id: registro-2026-11-22-icm-rules-ssot-e-roi-s1

import pytest

from llm.key_observatory import _classify_pool, _collect_duplicate_anomalies
from utils.env_loader import _apply_runtime_aliases

SITE_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = SITE_ROOT / "data" / "credential_registry.json"


def _load_registry() -> dict:
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def test_credential_registry_ssot_invariants() -> None:
    assert REGISTRY_PATH.is_file()
    reg = _load_registry()

    managed = set(reg["ecosystem_managed_vars"])
    assert "HF_CREDENTIALS" in managed
    assert "HF_TOKEN" in managed
    assert "HF_KEY" not in managed, "HF_KEY nao deve ser duplicada no Registro"

    assert reg["runtime_aliases"]["HF_KEY"] == "HF_CREDENTIALS"
    assert "HF_CREDENTIALS" in reg["role_hints"]
    assert "HuggingFace" in reg["role_hints"]["HF_TOKEN"]

    pool_names = [p["name"] for p in reg["pools"]]
    assert len(pool_names) == len(set(pool_names)) == 12


def test_all_five_consumers_reference_ssot() -> None:
    consumers = (
        SITE_ROOT / "llm" / "key_observatory.py",
        SITE_ROOT / ".agents" / "skills" / "key-pool-audit" / "scripts" / "Audit-KeyPools.ps1",
        SITE_ROOT / ".agents" / "skills" / "key-pool-audit" / "scripts" / "render_key_audit.py",
        SITE_ROOT / "scripts" / "ops" / "Set-EcosystemCredential.ps1",
        SITE_ROOT / "utils" / "env_loader.py",
    )
    for path in consumers:
        assert path.is_file(), f"Consumidor ausente: {path}"
        content = path.read_text(encoding="utf-8-sig")
        assert "credential_registry.json" in content, f"{path} nao consome credential_registry.json"


def test_runtime_aliases_projects_hf_key_in_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HF_CREDENTIALS", "synthetic-id:synthetic-secret-value")
    monkeypatch.delenv("HF_KEY", raising=False)
    keys: dict[str, str] = {"HF_CREDENTIALS": "synthetic-id:synthetic-secret-value"}

    _apply_runtime_aliases(keys, SITE_ROOT)

    assert os.environ.get("HF_KEY") == "synthetic-id:synthetic-secret-value"
    assert keys["HF_KEY"] == "synthetic-id:synthetic-secret-value"


def test_runtime_aliases_does_not_overwrite_explicit_alias(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HF_CREDENTIALS", "canonical-val")
    monkeypatch.setenv("HF_KEY", "explicit-override")
    keys: dict[str, str] = {"HF_CREDENTIALS": "canonical-val", "HF_KEY": "explicit-override"}

    _apply_runtime_aliases(keys, SITE_ROOT)

    assert os.environ.get("HF_KEY") == "explicit-override"
    assert keys["HF_KEY"] == "explicit-override"


def test_classify_pool_and_duplicate_guard() -> None:
    pool_t1, rx_t1 = _classify_pool("OPENROUTER_TIER1_KEY_1")
    assert pool_t1 == "OpenRouter Tier 1"
    assert rx_t1 is not None

    pool_eco, rx_eco = _classify_pool("HF_CREDENTIALS")
    assert pool_eco == "Ecossistema/Outros"
    assert rx_eco is None

    anomalies = _collect_duplicate_anomalies(
        {
            "aaaa1111": [
                ("OPENROUTER_API_KEY", "OpenRouter Dedicadas"),
                ("OPENROUTER_TIER4_KEY_1", "OpenRouter Tier 4"),
            ],
            "bbbb2222": [("FOO_KEY", "Ecossistema/Outros"), ("BAR_KEY", "Ecossistema/Outros")],
        }
    )
    assert len(anomalies) == 1
    assert anomalies[0]["severity"] == "FAIL"
    assert "FOO_KEY" in anomalies[0]["variable"]


def test_powershell_scripts_parse_without_syntax_errors() -> None:
    ps_exe = shutil.which("powershell")
    if ps_exe is None:
        pytest.skip("powershell nao disponivel neste ambiente")

    scripts = (
        SITE_ROOT / ".agents" / "skills" / "key-pool-audit" / "scripts" / "Audit-KeyPools.ps1",
        SITE_ROOT / "scripts" / "ops" / "Set-EcosystemCredential.ps1",
    )
    for script in scripts:
        cmd = (
            "$errs=$null; "
            f"[void][System.Management.Automation.Language.Parser]::ParseFile('{script}', [ref]$null, [ref]$errs); "
            "if ($errs.Count -gt 0) { $errs | ForEach-Object { Write-Error $_.Message }; exit 1 }"
        )
        res = subprocess.run([ps_exe, "-NoProfile", "-Command", cmd], capture_output=True, text=True, check=False)
        assert res.returncode == 0, f"Erro AST em {script}: {res.stderr}"
