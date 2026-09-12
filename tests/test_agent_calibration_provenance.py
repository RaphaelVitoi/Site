"""Provenance enforcement uses temporary chains, never production evidence."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from tests.test_calibracao_fechamento_do_ciclo import _avaliar, _calibrar, _ledger, _tres_sessoes

ROOT = Path(__file__).resolve().parents[1]
OPS = ROOT / "scripts" / "ops"
pytestmark = pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh required")


def write_feedback(path, **overrides):
    fields = dict(
        Score="8.5",
        Feedback="fixture",
        SessionId="fixture-session",
        ConductorModel="gpt-5.6-terra",
        ConductorVehicle="codex",
        SupervisionMode="assistida",
        Scope="handoff",
        LedgerPath=str(path),
    )
    fields.update(overrides)
    args = ["pwsh", "-NoProfile", "-NonInteractive", "-File", str(OPS / "Register-AgentCalibrationFeedback.ps1")]
    for key, value in fields.items():
        if value is not None:
            args.extend([f"-{key}", value])
    return subprocess.run(args, capture_output=True, text=True, check=False)


@pytest.mark.parametrize("field", ["ConductorModel", "ConductorVehicle", "SupervisionMode", "SessionId"])
@pytest.mark.parametrize("value", [None, " "])
def test_missing_provenance_rejected_before_writing(tmp_path, field, value):
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = write_feedback(ledger, **{field: value})
    assert result.returncode != 0
    assert not ledger.exists()


@pytest.mark.parametrize(
    "model,vehicle", [("gpt-5.6-terra", "codex"), ("claude-opus-5", "claude-code"), ("gemini-3.8-flash", "antigravity")]
)
def test_known_connectors_are_recorded_independently(tmp_path, model, vehicle):
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = write_feedback(ledger, ConductorModel=model, ConductorVehicle=vehicle)
    assert result.returncode == 0, result.stderr
    row = json.loads(ledger.read_text(encoding="utf-8").splitlines()[-1])
    assert (row["conductor_model"], row["conductor_vehicle"], row["supervision_mode"]) == (model, vehicle, "assistida")


@pytest.mark.parametrize(
    "overrides",
    [
        dict(ConductorVehicle="Antigravity IDE"),
        dict(ConductorVehicle="antigravity"),
        dict(ConductorModel="GPT"),
        dict(ConductorModel="unknown-1"),
        dict(Scope="preludio"),
        dict(Scope="interludio"),
        dict(Scope="intrasessao-outlier"),
    ],
)
def test_unknown_mismatch_or_nonhandoff_rejected(tmp_path, overrides):
    assert write_feedback(tmp_path / "feedback-ledger.jsonl", **overrides).returncode != 0


@pytest.mark.parametrize("field", ["conductor_model", "conductor_vehicle", "supervision_mode"])
def test_incomplete_history_retained_but_not_gate_or_corroboration(tmp_path, field):
    ledger, outliers = tmp_path / "feedback-ledger.jsonl", tmp_path / "outlier-evidence-ledger.jsonl"
    feedback = _tres_sessoes("2026-09-12")
    feedback[0][field] = ""
    _ledger(ledger, feedback)
    _ledger(outliers, [])
    before = ledger.read_bytes()
    evidence = _avaliar(ledger, outliers, "2026-09-12")
    assert evidence["feedback_count_acumulado"] == 3
    assert evidence["sessoes_com_feedback_count"] == 2
    assert evidence["calibration_planning_permitted"] is False
    assert evidence["excluded_feedback_count"] == 1
    assert f"missing:{field}" in evidence["excluded_feedback"][0]["reasons"]
    result = _calibrar(ledger, ["evt-A", "evt-B"], extra=["-GateOverrideReason", "fixture override"])
    assert result.returncode != 0
    assert "inelegivel" in result.stderr
    assert ledger.read_bytes() == before


def test_append_only_correction_restores_effective_eligibility(tmp_path):
    ledger, outliers = tmp_path / "feedback-ledger.jsonl", tmp_path / "outlier-evidence-ledger.jsonl"
    feedback = _tres_sessoes("2026-09-12")
    feedback[0]["conductor_vehicle"] = ""
    _ledger(ledger, feedback)
    _ledger(outliers, [])
    original = ledger.read_bytes()
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(OPS / "Record-AgentCalibrationCorrection.ps1"),
            "-LedgerPath",
            str(ledger),
            "-TargetEventId",
            "evt-A",
            "-Field",
            "conductor_vehicle",
            "-CorrectedValueJson",
            '"codex"',
            "-Reason",
            "Primary fixture authority",
            "-Authority",
            "fixture",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert ledger.read_bytes().startswith(original)
    evidence = _avaliar(ledger, outliers, "2026-09-12")
    assert evidence["eligible_feedback_count"] == 3
    assert evidence["calibration_planning_permitted"] is True
    assert _calibrar(ledger, ["evt-A", "evt-B"]).returncode == 0
