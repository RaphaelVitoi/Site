"""
IDENTITY: Test Suite para o TimesFM Engine e Handlers REST da API v1.
PATH: tests/test_timesfm_engine.py
ROLE: Validação hermética dos contratos de inferência, governança de licença e endpoints HTTP.
"""

from __future__ import annotations

import json

import pytest
from aiohttp import web
from aiohttp.test_utils import make_mocked_request

from api.v1.handlers import handle_timesfm_forecast
from engine.timesfm_engine import (
    ExecutionMode,
    LicenseTier,
    TimesFMEngine,
    TimesFMGovernanceError,
    forecast_bankroll_trajectory,
    forecast_pmev_risk_dynamics,
)


def test_timesfm_engine_initialization_commercial_allowed():
    """Valida que modelos 2.0 e 2.5 inicializam em modo comercial com licenca Apache 2.0."""
    engine_2_0 = TimesFMEngine(
        mode=ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key="timesfm-2.0-500m",
    )
    assert engine_2_0.metadata.version == "2.0"
    assert engine_2_0.metadata.license_tier == LicenseTier.APACHE_2_COMMERCIAL
    assert engine_2_0.metadata.is_commercial_allowed is True

    engine_2_5 = TimesFMEngine(
        mode=ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key="timesfm-2.5-200m",
    )
    assert engine_2_5.metadata.version == "2.5"
    assert engine_2_5.metadata.license_tier == LicenseTier.APACHE_2_COMMERCIAL
    assert engine_2_5.metadata.is_commercial_allowed is True


def test_timesfm_engine_initialization_commercial_blocked():
    """Valida que o modelo 3.0 eh estritamente bloqueado em modo comercial com TimesFMGovernanceError."""
    with pytest.raises(TimesFMGovernanceError) as exc_info:
        TimesFMEngine(
            mode=ExecutionMode.COMMERCIAL_PRODUCTION,
            preferred_model_key="timesfm-3.0-330m",
        )
    assert "VIOLAÇÃO DE LICENÇA" in str(exc_info.value)
    assert "TimesFM Non-Commercial License v1.0" in str(exc_info.value)


def test_timesfm_engine_initialization_research_mode():
    """Valida que o modelo 3.0 eh aceito sob o modo de pesquisa academica e benchmark."""
    engine_3_0 = TimesFMEngine(
        mode=ExecutionMode.RESEARCH_BENCHMARK,
        preferred_model_key="timesfm-3.0-330m",
    )
    assert engine_3_0.metadata.version == "3.0"
    assert engine_3_0.metadata.license_tier == LicenseTier.NON_COMMERCIAL_V1
    assert engine_3_0.metadata.is_commercial_allowed is False


def test_timesfm_engine_unknown_model_rejected():
    """Valida que chave de modelo inexistente dispara ValueError."""
    with pytest.raises(ValueError, match="Modelo desconhecido"):
        TimesFMEngine(preferred_model_key="timesfm-non-existent")


def test_timesfm_forecast_univariate_success():
    """Valida calculo univariado hermetico com horizonte e intervalos de confianca."""
    engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION)
    series = [100.0, 102.5, 101.0, 104.5, 106.0, 105.5, 108.0]
    horizon = 8

    res = engine.forecast_univariate(series=series, horizon=horizon, target_name="Bankroll_BB")

    assert res.target_name == "Bankroll_BB"
    assert res.history_length == len(series)
    assert res.forecast_horizon == horizon
    assert len(res.mean_prediction) == horizon
    assert len(res.quantile_10) == horizon
    assert len(res.quantile_90) == horizon

    # Valida relacao estocastica de quantis: q10 < mean < q90
    for q10, mean, q90 in zip(res.quantile_10, res.mean_prediction, res.quantile_90, strict=True):
        assert q10 < mean < q90


def test_timesfm_forecast_univariate_insufficient_history():
    """Valida que serie historica com menos de 4 pontos eh rejeitada."""
    engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION)
    with pytest.raises(ValueError, match="ao menos 4 pontos"):
        engine.forecast_univariate(series=[10.0, 12.0, 11.0], horizon=5)


def test_timesfm_forecast_multivariate_success():
    """Valida previsao multivariada para metricas correlacionadas de poker."""
    engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION)
    series_dict = {
        "Fator_Psi": [1.1, 1.2, 1.05, 1.35, 1.25],
        "Divida_RIO": [-5.2, -7.4, -6.1, -12.0, -9.5],
        "Pressao_ICM": [18.5, 21.4, 20.0, 32.5, 28.0],
    }
    horizon = 6

    results = engine.forecast_multivariate(series_dict=series_dict, horizon=horizon)

    assert set(results.keys()) == {"Fator_Psi", "Divida_RIO", "Pressao_ICM"}
    for name, res in results.items():
        assert res.target_name == name
        assert res.forecast_horizon == horizon
        assert len(res.mean_prediction) == horizon


@pytest.mark.asyncio
async def test_timesfm_api_handler_univariate_success():
    """Valida o endpoint POST /api/v1/timesfm/forecast com payload univariado."""
    app = web.Application()
    app.router.add_post("/api/v1/timesfm/forecast", handle_timesfm_forecast)

    payload = {
        "series": [10.0, 12.0, 11.5, 14.0, 13.5, 15.0],
        "horizon": 5,
        "target_name": "ev_loss_decay",
        "mode": "commercial_production",
        "preferred_model_key": "timesfm-2.0-500m",
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/timesfm/forecast",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_timesfm_forecast(req)
    assert resp.status == 200
    assert resp.text is not None

    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert data["forecast_type"] == "univariate"
    assert "ev_loss_decay" in data["results"]
    assert len(data["results"]["ev_loss_decay"]["mean_prediction"]) == 5


@pytest.mark.asyncio
async def test_timesfm_api_handler_multivariate_success():
    """Valida o endpoint POST /api/v1/timesfm/forecast com payload multivariado."""
    app = web.Application()
    app.router.add_post("/api/v1/timesfm/forecast", handle_timesfm_forecast)

    payload = {
        "series_dict": {
            "fluxo_psi": [1.0, 1.2, 1.1, 1.4, 1.3],
            "fluxo_rio": [-2.0, -3.5, -3.0, -5.0, -4.5],
        },
        "horizon": 4,
        "mode": "commercial_production",
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/timesfm/forecast",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_timesfm_forecast(req)
    assert resp.status == 200
    assert resp.text is not None

    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert data["forecast_type"] == "multivariate"
    assert "fluxo_psi" in data["results"]
    assert "fluxo_rio" in data["results"]


@pytest.mark.asyncio
async def test_timesfm_api_handler_governance_block_403():
    """Valida bloqueio HTTP 403 Forbidden ao requisitar modelo 3.0 em modo comercial."""
    app = web.Application()
    app.router.add_post("/api/v1/timesfm/forecast", handle_timesfm_forecast)

    payload = {
        "series": [10.0, 12.0, 11.5, 14.0, 13.5],
        "horizon": 4,
        "mode": "commercial_production",
        "preferred_model_key": "timesfm-3.0-330m",
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/timesfm/forecast",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_timesfm_forecast(req)
    assert resp.status == 403
    assert resp.text is not None

    data = json.loads(resp.text)
    assert data["status"] == "FORBIDDEN"
    assert "VIOLAÇÃO DE LICENÇA" in data["error"]


@pytest.mark.asyncio
async def test_timesfm_api_handler_validation_error_400():
    """Valida HTTP 400 Bad Request quando payload eh invalido ou series vazias."""
    app = web.Application()
    app.router.add_post("/api/v1/timesfm/forecast", handle_timesfm_forecast)

    # 1. Sem series nem series_dict
    req = make_mocked_request("POST", "/api/v1/timesfm/forecast", app=app)
    req._read_bytes = json.dumps({"horizon": 5}).encode("utf-8")
    resp = await handle_timesfm_forecast(req)
    assert resp.status == 400

    # 2. Serie com historico insuficiente (<4 pontos)
    req2 = make_mocked_request("POST", "/api/v1/timesfm/forecast", app=app)
    req2._read_bytes = json.dumps({"series": [1.0, 2.0]}).encode("utf-8")
    resp2 = await handle_timesfm_forecast(req2)
    assert resp2.status == 400

    # 3. JSON malformado
    req3 = make_mocked_request("POST", "/api/v1/timesfm/forecast", app=app)
    req3._read_bytes = b"invalid json content"
    resp3 = await handle_timesfm_forecast(req3)
    assert resp3.status == 400


def test_timesfm_domain_function_bankroll():
    """Valida a funcao de dominio forecast_bankroll_trajectory."""
    history = [100.0, 105.0, 103.0, 108.0, 110.0, 115.0]
    res = forecast_bankroll_trajectory(history_bb=history, horizon_tournaments=6)
    assert res.target_name == "Bankroll_Trajectory_BB"
    assert len(res.mean_prediction) == 6
    assert len(res.quantile_10) == 6
    assert len(res.quantile_90) == 6


def test_timesfm_domain_function_pmev_dynamics():
    """Valida a funcao de dominio forecast_pmev_risk_dynamics."""
    psi = [1.1, 1.2, 1.15, 1.3]
    rio = [-5.0, -6.0, -5.5, -7.0]
    icm = [20.0, 22.0, 21.0, 25.0]
    res = forecast_pmev_risk_dynamics(history_psi=psi, history_rio=rio, history_icm=icm, horizon_steps=5)
    assert "Fator_Psi" in res
    assert "Divida_RIO" in res
    assert "Pressao_ICM" in res
    assert len(res["Fator_Psi"].mean_prediction) == 5
