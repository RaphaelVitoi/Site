"""Tests for TimesFM 2.0 Agent Calibration forecasting integration.

Validates statistical drift projection, quantile boundaries, downward drift detection,
multimodel scaling, Nexus CLI command, and PowerShell quantitative support adapters.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
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
    # PROCEDENCIA, nao intencao. Sem pesos carregados o numero vem de
    # `last_val + trend*step`, e `model_used` tem de dizer isso -- o id do Google
    # e a INTENCAO, e vive em `intended_model`. Ate 2026-09-07 este campo devolvia
    # o id do Google incondicionalmente (finding B04 da auditoria do Astra), e a
    # SS8.3 do CLAUDE.md consumia esse rotulo na evidencia de calibracao.
    assert forecast.weights_loaded is False
    assert forecast.intended_model == "google/timesfm-2.0-500m-pytorch"
    assert forecast.model_used.startswith("analytic-linear-extrapolation")
    assert forecast.model_used != forecast.intended_model

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


def _hash_registro(payload: dict) -> str:
    texto = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def _ledger_hermetico(caminho: Path, notas: list[float]) -> None:
    """Escreve um ledger encadeado minimo, aceito por Test-AgentCalibrationLedger.

    MEDIDO EM 2026-09-09: ate aqui este teste rodava o gerador SEM ledger
    proprio, e portanto media o ledger REAL da maquina. Na minha estacao havia
    18 pontos de historico e o status vinha PROJECTION_ACTIVE; no runner do CI,
    onde reports/agent-calibration/feedback-ledger.jsonl NAO e versionado, vinha
    INSUFFICIENT_HISTORY -- e a asercao quebrava.

    O teste media o ESTADO, nao o contrato. O contrato e: havendo historico
    suficiente, o gerador projeta. E isso que se verifica agora, com dados que o
    proprio teste constroi. O script ja expunha -LedgerPath exatamente para
    isso, e outros testes desta suite ja o usavam.
    """
    linhas: list[str] = []
    anterior = "0" * 64
    genesis = {
        "schema_version": "agent-calibration-ledger/v1",
        "sequence": 0,
        "record_type": "genesis",
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "previous_hash": anterior,
        "policy": "append-only hash chain; verify before use",
    }
    genesis["record_hash"] = _hash_registro(genesis)
    linhas.append(json.dumps(genesis, ensure_ascii=False))
    anterior = genesis["record_hash"]

    for i, nota in enumerate(notas, start=1):
        registro = {
            "schema_version": "agent-calibration-ledger/v1",
            "sequence": i,
            "record_type": "feedback",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "previous_hash": anterior,
            "event_id": f"evt-timesfm-{i}",
            "session_id": f"sessao-timesfm-{i}",
            "score": nota,
            "feedback": "registro sintetico do guard do TimesFM",
            "scope": "handoff",
        }
        registro["record_hash"] = _hash_registro(registro)
        linhas.append(json.dumps(registro, ensure_ascii=False))
        anterior = registro["record_hash"]

    caminho.write_text("\n".join(linhas) + "\n", encoding="utf-8")


@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required for PowerShell daily evidence generator")
def test_new_agent_calibration_daily_evidence_includes_timesfm(tmp_path: Path) -> None:
    """New-AgentCalibrationDailyEvidence.ps1 includes timesfm_forecast by default."""
    ledger = tmp_path / "feedback-ledger.jsonl"
    # O ledger de outliers fica AUSENTE de proposito. Test-AgentCalibrationLedger
    # rejeita arquivo que existe e esta vazio -- "Ledger exists but is empty" --,
    # enquanto caminho inexistente e tratado como "sem outliers". Medido ao
    # escrever este guard: criar o arquivo vazio derrubava o script com exit 1.
    outliers = tmp_path / "outlier-evidence-ledger.jsonl"
    # Historico suficiente para a projecao: o horizonte do portao e 3 sessoes.
    _ledger_hermetico(ledger, [8.0, 8.5, 9.0, 9.5, 10.0, 9.0, 9.5])

    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(EVIDENCE_SCRIPT),
            "-LedgerPath",
            str(ledger),
            "-OutlierLedgerPath",
            str(outliers),
        ],
        check=True,
        capture_output=True,
        text=True,
        cwd=str(REPOSITORY_ROOT),
    )
    payload = json.loads(result.stdout)
    assert "timesfm_forecast" in payload
    assert payload["timesfm_forecast"] is not None
    assert payload["timesfm_forecast"]["status"] == "PROJECTION_ACTIVE"
    forecast = payload["timesfm_forecast"]
    assert forecast["intended_model"] == "google/timesfm-2.0-500m-pytorch"
    assert forecast["weights_loaded"] is False
    # A evidencia de calibracao NAO pode atribuir a projecao ao modelo do Google
    # enquanto nenhum peso for carregado: e ela que alimenta a hipotese da SS8.3.
    assert forecast["model_used"].startswith("analytic-linear-extrapolation")
