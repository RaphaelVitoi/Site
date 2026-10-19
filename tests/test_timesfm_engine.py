"""
IDENTITY: Test Suite para o TimesFM Engine e Handlers REST da API v1.
PATH: tests/test_timesfm_engine.py
ROLE: Validacao hermetica dos contratos de inferencia, governanca de licenca e endpoints HTTP.
"""

from __future__ import annotations

# pylint: disable=protected-access
import json

from aiohttp import web
from aiohttp.test_utils import make_mocked_request
import pytest

from api.v1.handlers import handle_timesfm_forecast
from engine.timesfm_engine import (
    ExecutionMode,
    LicenseTier,
    TimesFMEngine,
    TimesFMGovernanceError,
    forecast_bankroll_trajectory,
    forecast_cfr_convergence,
    forecast_ev_variance_envelope,
    forecast_mesh_telemetry_latency,
    forecast_opponent_drift,
    forecast_pmev_risk_dynamics,
    forecast_tournament_icm_decay,
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
    assert "VIOLA\u00c7\u00c3O DE LICEN\u00c7A" in str(exc_info.value)
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
    assert engine_3_0.is_research_mode is True


def test_timesfm_engine_aliases_resolution():
    """Valida resolucao ergonomica de aliases (3.0, 2.5, 2.0) no catalogo."""
    engine_alias_3 = TimesFMEngine(
        mode=ExecutionMode.RESEARCH_BENCHMARK,
        preferred_model_key="3.0",
    )
    assert engine_alias_3.preferred_model_key == "timesfm-3.0-330m"
    assert engine_alias_3.metadata.version == "3.0"

    engine_alias_25 = TimesFMEngine(
        mode=ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key="2.5",
    )
    assert engine_alias_25.preferred_model_key == "timesfm-2.5-200m"
    assert engine_alias_25.metadata.version == "2.5"
    assert engine_alias_25.is_research_mode is False


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


def test_timesfm_loaded_weights_use_model_quantiles():
    class LoadedModel:
        def forecast(self, horizon, inputs):
            assert horizon == 2
            assert len(inputs) == 1
            return [[11.0, 12.0]], [[[9.0] * 9, [10.0] * 9]]

    engine = TimesFMEngine(
        mode=ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key="timesfm-2.5-200m",
    )
    engine._model = LoadedModel()

    result = engine.forecast_univariate([1.0, 2.0, 3.0, 4.0], horizon=2)

    assert result.weights_loaded is True
    assert result.model_used == "google/timesfm-2.5-200m-pytorch"
    assert result.mean_prediction == [11.0, 12.0]
    assert result.quantile_10 == [9.0, 10.0]
    assert result.quantile_90 == [9.0, 10.0]


def test_timesfm_weight_loader_fails_closed_for_unintegrated_legacy_model():
    engine = TimesFMEngine(preferred_model_key="timesfm-2.0-500m")

    with pytest.raises(RuntimeError, match="apenas para TimesFM 2.5"):
        engine.load_pretrained_weights()


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
    provenance = data["execution_provenance"]
    assert provenance["engine_id"] == "timesfm-forecast"
    assert provenance["implementation_level"] == "adapter"
    assert provenance["model_used"] == data["model_used"]
    assert provenance["weights_loaded"] == data["weights_loaded"]
    assert provenance["fallback_used"] is (not data["weights_loaded"])


@pytest.mark.asyncio
async def test_timesfm_api_opt_in_uses_pretrained_weights(monkeypatch):
    class LoadedModel:
        def forecast(self, horizon, _inputs):
            return [[20.0] * horizon], [[[19.0] * 9 for _ in range(horizon)]]

    def load_weights(engine, *, local_files_only):
        assert local_files_only is True
        engine._model = LoadedModel()
        return True

    monkeypatch.setattr(TimesFMEngine, "load_pretrained_weights", load_weights)
    payload = {
        "series": [10.0, 12.0, 11.5, 14.0],
        "horizon": 2,
        "preferred_model_key": "timesfm-2.5-200m",
        "use_pretrained_weights": True,
    }
    req = make_mocked_request("POST", "/api/v1/timesfm/forecast", app=web.Application())
    req._read_bytes = json.dumps(payload).encode("utf-8")

    response = await handle_timesfm_forecast(req)

    data = json.loads(response.text)
    assert response.status == 200
    assert data["weights_loaded"] is True
    assert data["model_used"] == "google/timesfm-2.5-200m-pytorch"
    assert data["results"]["metric"]["mean_prediction"] == [20.0, 20.0]


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
    assert "VIOLA\u00c7\u00c3O DE LICEN\u00c7A" in data["error"]


@pytest.mark.asyncio
async def test_timesfm_3_research_mode_is_not_served_by_product_api():
    app = web.Application()
    app.router.add_post("/api/v1/timesfm/forecast", handle_timesfm_forecast)
    payload = {
        "series": [1.0, 2.0, 3.0, 4.0],
        "mode": "research_benchmark",
        "preferred_model_key": "timesfm-3.0-330m",
    }
    req = make_mocked_request("POST", "/api/v1/timesfm/forecast", app=app)
    req._read_bytes = json.dumps(payload).encode("utf-8")

    response = await handle_timesfm_forecast(req)

    assert response.status == 403
    assert "n\u00e3o comerciais" in json.loads(response.text)["error"]


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


def test_timesfm_domain_function_cfr_convergence():
    """Valida a funcao de dominio forecast_cfr_convergence com decaimento estocastico."""
    # 1. Historico insuficiente (< 4)
    insuf = forecast_cfr_convergence(regret_history=[0.5, 0.4])
    assert insuf.status == "INSUFFICIENT_HISTORY"
    assert insuf.early_stopping_recommended is False

    # 2. Ja convergido
    conv = forecast_cfr_convergence(regret_history=[0.05, 0.02, 0.005, 0.0005], target_epsilon=0.001)
    assert conv.status == "CONVERGED"
    assert conv.early_stopping_recommended is True
    assert conv.estimated_iterations_to_target == 0

    # 3. Decaimento ativo rumo a convergencia
    decay = forecast_cfr_convergence(
        regret_history=[0.10, 0.07, 0.04, 0.02],
        horizon_iterations=8,
        target_epsilon=0.005,
    )
    assert decay.status in ("CONVERGING", "PLATEAU_DETECTED")
    assert len(decay.mean_trajectory) == 8
    assert len(decay.quantile_10) == 8
    assert len(decay.quantile_90) == 8
    assert decay.early_stopping_recommended is True
    assert decay.estimated_iterations_to_target > 0


def test_timesfm_domain_function_opponent_drift():
    """Valida a funcao de dominio forecast_opponent_drift contra benchmark canonico."""
    # 1. Historico insuficiente
    insuf = forecast_opponent_drift(history_frequencies=[0.25, 0.28])
    assert insuf.status == "INSUFFICIENT_HISTORY"

    # 2. Deriva expansiva detectada vs benchmark GTO Janda (MDF = 0.5)
    drift = forecast_opponent_drift(
        history_frequencies=[0.30, 0.35, 0.42, 0.65],
        horizon_hands=6,
        canonical_benchmark=0.50,
        metric_name="vpip",
    )
    assert drift.status == "DRIFTING"
    assert drift.drift_direction == "EXPANSAO"
    assert len(drift.mean_trajectory) == 6
    assert drift.divergence_from_canonical >= 0.0
    assert isinstance(drift.exploitative_adjustment_recommended, bool)


def test_timesfm_domain_function_tournament_icm_decay():
    """Valida a funcao de dominio forecast_tournament_icm_decay."""
    # 1. Historico insuficiente (< 4)
    insuf = forecast_tournament_icm_decay(history_premiums=[5.0, 6.0])
    assert insuf.status == "INSUFFICIENT_HISTORY"
    assert insuf.tightening_recommended is False

    # 2. Pressao ativa em bolha
    active = forecast_tournament_icm_decay(
        history_premiums=[4.5, 5.2, 6.1, 7.8, 9.5],
        horizon_levels=5,
        remaining_players=10,
        total_entries=100,
    )
    assert active.status in ("PRESSURE_INCREASING", "BUBBLE_PEAK", "STABLE")
    assert len(active.mean_trajectory) == 5
    assert len(active.quantile_10) == 5
    assert len(active.quantile_90) == 5
    assert active.bubble_factor_projected > 1.0
    for q10, m, q90 in zip(active.quantile_10, active.mean_trajectory, active.quantile_90, strict=False):
        assert q10 <= m <= q90


def test_timesfm_domain_function_mesh_telemetry_latency():
    """Valida a funcao de dominio forecast_mesh_telemetry_latency."""
    # 1. Historico insuficiente
    insuf = forecast_mesh_telemetry_latency(history_latencies_ms=[45.0, 50.0])
    assert insuf.status == "INSUFFICIENT_HISTORY"
    assert insuf.failover_recommended is False

    # 2. Latencia saudavel dentro do SLA
    healthy = forecast_mesh_telemetry_latency(
        history_latencies_ms=[40.0, 42.0, 41.5, 43.0, 42.8],
        horizon_steps=4,
        sla_threshold_ms=200.0,
    )
    assert healthy.status == "HEALTHY"
    assert healthy.failover_recommended is False
    assert len(healthy.mean_trajectory) == 4

    # 3. Spike de latencia excedendo SLA
    spiking = forecast_mesh_telemetry_latency(
        history_latencies_ms=[120.0, 150.0, 190.0, 240.0, 310.0],
        horizon_steps=4,
        sla_threshold_ms=150.0,
    )
    assert spiking.status in ("LATENCY_SPIKE_RISK", "SATURATION_WARNING")
    assert spiking.failover_recommended is True


def test_timesfm_domain_function_ev_variance_envelope():
    """Valida a funcao de dominio forecast_ev_variance_envelope."""
    # 1. Historico insuficiente
    insuf = forecast_ev_variance_envelope(history_ev_bb=[10.0, 20.0], history_actual_bb=[10.0, 15.0])
    assert insuf.status == "INSUFFICIENT_HISTORY"

    # 2. Envelope regular de variancia
    normal = forecast_ev_variance_envelope(
        history_ev_bb=[50.0, 60.0, 70.0, 80.0, 90.0],
        history_actual_bb=[48.0, 62.0, 68.0, 79.0, 88.0],
        horizon_steps=5,
    )
    assert normal.status == "WITHIN_EXPECTED_VARIANCE"
    assert len(normal.mean_trajectory) == 5
    assert len(normal.quantile_10) == 5
    assert len(normal.quantile_90) == 5

    # 3. Anomalia severa de downswing
    downswing = forecast_ev_variance_envelope(
        history_ev_bb=[100.0, 120.0, 140.0, 160.0, 180.0, 200.0],
        history_actual_bb=[100.0, 80.0, 50.0, 20.0, -10.0, -40.0],
        horizon_steps=6,
    )
    assert downswing.status == "DOWNSWING_ANOMALY"
    assert downswing.current_gap_bb < 0.0
    assert downswing.variance_exhaustion_probability > 0.5


def test_timesfm_forecast_with_covariates():
    """Valida previsao condicionada por covariantes passadas e futuras."""
    engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION, preferred_model_key="timesfm-2.5-200m")
    target = [10.0, 12.0, 14.0, 16.0, 18.0]
    past_cov = {"temp": [20.0, 21.0, 22.0, 23.0, 24.0]}
    fut_cov = {"factor": [1.0, 1.1, 1.2]}

    res = engine.forecast_with_covariates(
        target_series=target,
        past_covariates=past_cov,
        future_covariates=fut_cov,
        horizon=3,
        target_name="temperature_conditioned",
    )
    assert res.target_name == "temperature_conditioned"
    assert len(res.mean_prediction) == 3
    assert len(res.quantile_10) == 3
    assert len(res.quantile_90) == 3


def test_timesfm_25_neural_weights_loading_and_inference():
    """Valida carregamento real de pesos neurais pre-treinados do TimesFM 2.5 PyTorch."""
    engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION, preferred_model_key="timesfm-2.5-200m")
    try:
        engine.load_pretrained_weights(local_files_only=True)
    except Exception as exc:  # noqa: BLE001
        pytest.skip(f"Pesos locais nao disponiveis no ambiente de teste: {exc}")

    assert engine.weights_loaded is True
    assert engine.model is not None

    series = [10.0, 12.0, 11.5, 13.0, 14.5, 16.0]
    res = engine.forecast_univariate(series=series, horizon=3, target_name="test_neural")

    assert res.weights_loaded is True
    assert res.model_used == "google/timesfm-2.5-200m-pytorch"
    assert len(res.mean_prediction) == 3
    for q10, mean, q90 in zip(res.quantile_10, res.mean_prediction, res.quantile_90, strict=True):
        assert q10 <= mean <= q90
