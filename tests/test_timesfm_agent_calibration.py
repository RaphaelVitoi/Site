"""Tests for TimesFM 2.0 Agent Calibration forecasting integration.

Validates statistical drift projection, quantile boundaries, downward drift detection,
multimodel scaling, Nexus CLI command, and PowerShell quantitative support adapters.
"""

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess

import pytest
from typer.testing import CliRunner

from engine.timesfm_engine import (
    forecast_agent_calibration_trajectory,
    forecast_multimodel_calibration,
)
from scripts.cli.nexus import app

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SUPPORT_SCRIPT = REPOSITORY_ROOT / "scripts" / "ops" / "Invoke-AgentCalibrationQuantitativeSupport.ps1"
EVIDENCE_SCRIPT = REPOSITORY_ROOT / "scripts" / "ops" / "New-AgentCalibrationDailyEvidence.ps1"


def test_forecast_agent_calibration_trajectory_active() -> None:
    """With sufficient historical scores, TimesFM generates active stochastic trajectory."""
    history = [7.5, 8.0, 8.5, 9.0, 9.2, 9.5]
    forecast = forecast_agent_calibration_trajectory(history, horizon_sessions=3, conductor_model="gemini-3.8-flash")

    assert forecast.status == "PROJECTION_ACTIVE"
    assert forecast.history_points == 6
    assert forecast.horizon_sessions == 3
    assert len(forecast.mean_trajectory) == 3
    assert len(forecast.quantile_10) == 3
    assert len(forecast.quantile_90) == 3
    assert forecast.conductor_model == "gemini-3.8-flash"
    assert forecast.drift_direction == "EXPANSAO"
    assert forecast.drift_per_session > 0.0
    assert forecast.model_used == "google/timesfm-2.0-500m-pytorch"

    for q10, mean, q90 in zip(forecast.quantile_10, forecast.mean_trajectory, forecast.quantile_90, strict=True):
        assert q10 <= mean <= q90


def test_forecast_agent_calibration_trajectory_insufficient() -> None:
    """Under 4 historical points, returns INSUFFICIENT_HISTORY gracefully."""
    history = [8.5, 9.0]
    forecast = forecast_agent_calibration_trajectory(history, horizon_sessions=3)

    assert forecast.status == "INSUFFICIENT_HISTORY"
    assert forecast.history_points == 2
    assert forecast.mean_trajectory == []
    assert forecast.risk_of_degradation == 0.0


def test_forecast_agent_calibration_downward_drift() -> None:
    """Detects downward drift and flags degradation risk when scores drop significantly."""
    declining_history = [10.0, 9.5, 8.5, 7.5, 6.0]
    forecast = forecast_agent_calibration_trajectory(declining_history, horizon_sessions=3)

    assert forecast.status == "PROJECTION_ACTIVE"
    assert forecast.drift_direction == "DOWNWARD_DRIFT"
    assert forecast.drift_per_session < 0.0
    assert forecast.risk_of_degradation > 0.0


def test_forecast_multimodel_calibration() -> None:
    """Scales multivariate forecasting across multiple conductor models."""
    series = {
        "gemini-3.8-flash": [8.0, 8.5, 9.0, 9.5, 10.0],
        "claude-opus-5": [9.0, 9.5, 9.5, 9.8, 10.0],
        "claude-sonnet-5": [9.0, 9.2, 9.5, 9.6],
        "chatgpt-5.6-terra": [9.0, 9.5, 9.5, 9.8],
        "chatgpt-5.6-luna": [9.5, 9.0],
    }
    results = forecast_multimodel_calibration(series, horizon_sessions=3)

    assert "gemini-3.8-flash" in results
    assert results["gemini-3.8-flash"].status == "PROJECTION_ACTIVE"
    assert results["gemini-3.8-flash"].conductor_model == "gemini-3.8-flash"

    assert "claude-opus-5" in results
    assert results["claude-opus-5"].status == "PROJECTION_ACTIVE"

    assert "claude-sonnet-5" in results
    assert results["claude-sonnet-5"].status == "PROJECTION_ACTIVE"

    assert "chatgpt-5.6-terra" in results
    assert results["chatgpt-5.6-terra"].status == "PROJECTION_ACTIVE"

    assert "chatgpt-5.6-luna" in results
    assert results["chatgpt-5.6-luna"].status == "INSUFFICIENT_HISTORY"


def test_nexus_cli_agent_calibration_forecast_json() -> None:
    """Nexus CLI agent calibration-forecast --json outputs valid schema payload."""
    runner = CliRunner()
    result = runner.invoke(app, ["agent", "calibration-forecast", "--json", "--horizon", "3"])
    assert result.exit_code == 0
    data = json.loads(result.stdout)
    assert data["status"] == "PROJECTION_ACTIVE"
    assert "mean_trajectory" in data
    assert "drift_direction" in data


def test_nexus_cli_agent_calibration_forecast_multimodel() -> None:
    """Nexus CLI agent calibration-forecast --multimodel runs successfully."""
    runner = CliRunner()
    result = runner.invoke(app, ["agent", "calibration-forecast", "--multimodel", "--horizon", "3"])
    assert result.exit_code == 0
    assert "ESCALONAMENTO MULTIVARIADO TIMESFM" in result.stdout


@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required for PowerShell quantitative support adapter")
def test_invoke_quantitative_support_timesfm() -> None:
    """Invoke-AgentCalibrationQuantitativeSupport.ps1 supports -TimesFmMode timesfm-forecast."""
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(SUPPORT_SCRIPT),
            "-TimesFmMode",
            "timesfm-forecast",
            "-ScoresJson",
            json.dumps([8.0, 8.5, 9.0, 9.5, 10.0]),
            "-TimesFmHorizon",
            "3",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)
    assert payload["schema_version"] == "agent-calibration-quantitative-support/v2"
    assert payload["engine"] == "google-timesfm-2.0"
    assert payload["output"]["status"] == "PROJECTION_ACTIVE"
    assert len(payload["output"]["mean_trajectory"]) == 3


@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required for PowerShell daily evidence generator")
def test_new_agent_calibration_daily_evidence_includes_timesfm() -> None:
    """New-AgentCalibrationDailyEvidence.ps1 includes timesfm_forecast by default."""
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(EVIDENCE_SCRIPT),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)
    assert "timesfm_forecast" in payload
    assert payload["timesfm_forecast"] is not None
    assert payload["timesfm_forecast"]["status"] == "PROJECTION_ACTIVE"
    assert payload["timesfm_forecast"]["model_used"] == "google/timesfm-2.0-500m-pytorch"
