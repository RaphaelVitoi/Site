"""
IDENTITY: TimesFM Governance & Time-Series Inference Engine (Google Research)
PATH: engine/timesfm_engine.py
ROLE: Interface de alta fidelidade para previsao de series temporais estocasticas (Bankroll, EV, RIO, Fator Psi).
GOVERNANCE:
  - TimesFM 2.0 / 2.5 (500M / 200M): Licenca Apache 2.0. Liberado para Producao Comercial e SaaS.
  - TimesFM 3.0 (330M): Licenca timesfm-non-commercial-license-v1.0. Estritamente restrito a Pesquisa / Nao Comercial.
  - Enterprise Scaling: Google Cloud BigQuery ML (AI.FORECAST).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import StrEnum
import json
import logging
import math
import threading
from typing import Any, Literal

import numpy as np
from pydantic import BaseModel, Field

logger = logging.getLogger("nexus.timesfm")


class LicenseTier(StrEnum):
    APACHE_2_COMMERCIAL = "Apache 2.0 (Permissivo / Comercial)"
    NON_COMMERCIAL_V1 = "TimesFM Non-Commercial License v1.0 (Apenas Pesquisa)"
    BIGQUERY_ML_MANAGED = "Google Cloud BigQuery ML Managed Enterprise (AI.FORECAST)"


class ExecutionMode(StrEnum):
    COMMERCIAL_PRODUCTION = "commercial_production"
    RESEARCH_BENCHMARK = "research_benchmark"
    CLOUD_BIGQUERY_ML = "cloud_bigquery_ml"


@dataclass(frozen=True)
class ModelMetadata:
    model_id: str
    version: str
    license_tier: LicenseTier
    is_commercial_allowed: bool
    context_length: int
    parameter_count: str


TIMESFM_20_500M = "timesfm-2.0-500m"
TIMESFM_25_200M = "timesfm-2.5-200m"
TIMESFM_30_330M = "timesfm-3.0-330m"

TIMESFM_CATALOG: dict[str, ModelMetadata] = {
    TIMESFM_20_500M: ModelMetadata(
        model_id="google/timesfm-2.0-500m-pytorch",
        version="2.0",
        license_tier=LicenseTier.APACHE_2_COMMERCIAL,
        is_commercial_allowed=True,
        context_length=2048,
        parameter_count="500M",
    ),
    TIMESFM_25_200M: ModelMetadata(
        model_id="google/timesfm-2.5-200m-pytorch",
        version="2.5",
        license_tier=LicenseTier.APACHE_2_COMMERCIAL,
        is_commercial_allowed=True,
        context_length=2048,
        parameter_count="200M",
    ),
    TIMESFM_30_330M: ModelMetadata(
        model_id="google/timesfm-3.0-pytorch",
        version="3.0",
        license_tier=LicenseTier.NON_COMMERCIAL_V1,
        is_commercial_allowed=False,
        context_length=2048,
        parameter_count="330M",
    ),
}

TIMESFM_ALIASES: dict[str, str] = {
    "3.0": TIMESFM_30_330M,
    "timesfm-3.0": TIMESFM_30_330M,
    "330m": TIMESFM_30_330M,
    "2.5": TIMESFM_25_200M,
    "timesfm-2.5": TIMESFM_25_200M,
    "200m": TIMESFM_25_200M,
    "2.0": TIMESFM_20_500M,
    "timesfm-2.0": TIMESFM_20_500M,
    "500m": TIMESFM_20_500M,
}

_PRETRAINED_MODEL_CACHE: dict[str, Any] = {}
_PRETRAINED_MODEL_LOCK = threading.Lock()


# Procedencia declarada quando NENHUM peso do TimesFM foi carregado. `model_used`
# devolvia o id do Google incondicionalmente -- inclusive no caminho analitico, que
# e `last_val + trend*step` com bandas `1.28*std*sqrt(step)`. O calculo e legitimo
# como fallback; o ROTULO e que mentia, e a SS8.3 do CLAUDE.md consome este campo na
# evidencia de calibracao. A SS3 separa capacidade, procedencia e autorizacao porque
# confundi-las corrompe as tres. Medido em 2026-09-07 (finding B04 da auditoria do
# Astra): a evidencia do dia projetava 8.89 -> 8.67 atribuindo a projecao ao Google.
BACKEND_ANALITICO = "analytic-linear-extrapolation"
BACKEND_PESOS = "timesfm-weights"


@dataclass
class ForecastResult:
    target_name: str
    history_length: int
    forecast_horizon: int
    mean_prediction: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False

    def model_dump(self) -> dict[str, Any]:
        return asdict(self)

    def model_dump_json(self, indent: int | None = None) -> str:
        return json.dumps(asdict(self), indent=indent)

    def to_item(self) -> ForecastItem:
        return ForecastItem(
            target_name=self.target_name,
            history_length=self.history_length,
            forecast_horizon=self.forecast_horizon,
            mean_prediction=self.mean_prediction,
            quantile_10=self.quantile_10,
            quantile_90=self.quantile_90,
            model_used=self.model_used,
            license_tier=self.license_tier,
            intended_model=self.intended_model,
            weights_loaded=self.weights_loaded,
        )


class ForecastItem(BaseModel):
    """Resultado de previsao estruturado para uma serie temporal."""

    target_name: str
    history_length: int
    forecast_horizon: int
    mean_prediction: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False


class TimesFMForecastRequest(BaseModel):
    """Payload de requisicao para previsao temporal via TimesFM."""

    series: list[float] | None = Field(
        None,
        description="Serie temporal univariada (ex: historico de bankroll ou EV)",
    )
    series_dict: dict[str, list[float]] | None = Field(
        None,
        description="Series temporais multivariadas (ex: Fator Psi, RIO, ICM)",
    )
    horizon: int = Field(12, ge=1, le=128, description="Horizonte de passos futuros a prever")
    frequency_indicator: int = Field(0, ge=0, description="Indicador de frequencia temporal (0=padrao)")
    target_name: str = Field("metric", description="Nome semantico da variavel prevista")
    mode: ExecutionMode = Field(
        ExecutionMode.COMMERCIAL_PRODUCTION,
        description="Modo de execucao (commercial_production ou research_benchmark)",
    )
    preferred_model_key: str = Field(TIMESFM_25_200M, description="Chave do modelo no catalogo TimesFM")
    use_pretrained_weights: bool = Field(
        False,
        description="Carrega pesos locais já baixados; não baixa arquivos durante a chamada da API.",
    )
    past_covariates: dict[str, list[float]] | None = Field(
        None,
        description="Covariáveis temporais passadas para condicionamento de inferência",
    )
    future_covariates: dict[str, list[float]] | None = Field(
        None,
        description="Covariáveis temporais futuras conhecidas a priori (ex: estrutura de blinds)",
    )


class TimesFMForecastResponse(BaseModel):
    """Envelope de resposta para inferencia TimesFM."""

    status: str = "SUCCESS"
    forecast_type: Literal["univariate", "multivariate"]
    results: dict[str, ForecastItem]
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    error: str | None = None


class TimesFMGovernanceError(PermissionError):
    """Lancado quando uma tentativa de deploy comercial viola a licenca do TimesFM 3.0."""


def _normalize_covariates_array(
    covariates: dict[str, list[float]] | np.ndarray | None,
) -> np.ndarray | None:
    """Converte covariadas em dicionario ou array para ndarray float32."""
    if covariates is None:
        return None
    if isinstance(covariates, dict):
        return np.array(list(covariates.values()), dtype=np.float32)
    return np.asarray(covariates, dtype=np.float32)


def _extract_quantiles_from_predict(
    output: Any,
    horizon: int,
) -> tuple[list[float], list[float], list[float]]:
    """Extrai previsao media e quantis q10/q90 do output do metodo predict."""
    forecast = np.asarray(output.forecast, dtype=np.float64).flatten()[:horizon]
    forecast_quantiles = np.asarray(output.quantiles, dtype=np.float64)
    if forecast_quantiles.ndim == 3:
        forecast_quantiles = forecast_quantiles[0]
    forecast_quantiles = forecast_quantiles[:horizon]
    if forecast_quantiles.ndim >= 2:
        q10 = forecast_quantiles[:, 0].tolist()
        q90_col = min(8, forecast_quantiles.shape[1] - 1)
        q90 = forecast_quantiles[:, q90_col].tolist()
    else:
        q10 = forecast.tolist()
        q90 = forecast.tolist()
    return forecast.tolist(), q10, q90


def _extract_quantiles_from_legacy_forecast(
    points: Any,
    quantiles: Any,
    horizon: int,
) -> tuple[list[float], list[float], list[float]]:
    """Extrai previsao media e quantis q10/q90 de modelos legados baseados em forecast."""
    forecast = np.asarray(points[0], dtype=np.float64)[:horizon]
    forecast_quantiles = np.asarray(quantiles[0], dtype=np.float64)[:horizon]
    if forecast_quantiles.ndim >= 2 and forecast_quantiles.shape[1] == 10:
        q10 = forecast_quantiles[:, 1].tolist()
        q90 = forecast_quantiles[:, 9].tolist()
    elif forecast_quantiles.ndim >= 2:
        q10 = forecast_quantiles[:, 0].tolist()
        q90_col = min(8, forecast_quantiles.shape[1] - 1)
        q90 = forecast_quantiles[:, q90_col].tolist()
    else:
        q10 = forecast.tolist()
        q90 = forecast.tolist()
    return forecast.tolist(), q10, q90


class TimesFMEngine:
    """Motor unificado de governanca e inferencia para modelos TimesFM."""

    def __init__(
        self,
        mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key: str = TIMESFM_25_200M,
    ) -> None:
        self.mode = mode
        canonical_key = TIMESFM_ALIASES.get(preferred_model_key.strip().lower(), preferred_model_key)
        self.preferred_model_key = canonical_key
        self.metadata = self._validate_and_resolve_model(mode, canonical_key)
        self._model: Any = None

    def load_pretrained_weights(
        self,
        *,
        cache_dir: str | None = None,
        local_files_only: bool = False,
    ) -> bool:
        """Carrega pesos pré-treinados do TimesFM (2.5 sob Apache 2.0 ou 3.0 sob Research Benchmark)."""
        if self.preferred_model_key == TIMESFM_30_330M:
            if self.mode != ExecutionMode.RESEARCH_BENCHMARK:
                raise TimesFMGovernanceError(
                    f"VIOLAÇÃO DE LICENÇA: O modelo TimesFM 3.0 ({self.metadata.model_id}) é restrito a pesquisa não-comercial. "
                    f"Carregamento de pesos proibido no modo comercial '{self.mode.value}'."
                )
            if self._model is not None:
                return True

            with _PRETRAINED_MODEL_LOCK:
                model = _PRETRAINED_MODEL_CACHE.get(self.preferred_model_key)
                if model is None:
                    try:
                        from timesfm3 import TimesFM3Forecaster  # noqa: PLC0415
                    except ImportError:
                        from timesfm import TimesFM3Forecaster  # type: ignore[attr-defined] # noqa: PLC0415

                    model = TimesFM3Forecaster.from_pretrained(
                        self.metadata.model_id,
                        cache_dir=cache_dir,
                        local_files_only=local_files_only,
                    )
                    _PRETRAINED_MODEL_CACHE[self.preferred_model_key] = model
                self._model = model
            logger.info("TimesFM 3.0 (Research) carregado com pesos: %s", self.metadata.model_id)
            return True

        if self.preferred_model_key == TIMESFM_25_200M:
            if self._model is not None:
                return True

            with _PRETRAINED_MODEL_LOCK:
                model = _PRETRAINED_MODEL_CACHE.get(self.preferred_model_key)
                if model is None:
                    from timesfm.configs import ForecastConfig  # noqa: PLC0415
                    from timesfm.timesfm_2p5.timesfm_2p5_torch import TimesFM_2p5_200M_torch  # noqa: PLC0415

                    model = TimesFM_2p5_200M_torch.from_pretrained(
                        self.metadata.model_id,
                        cache_dir=cache_dir,
                        local_files_only=local_files_only,
                        torch_compile=False,
                    )
                    model.compile(
                        ForecastConfig(
                            max_context=2048,
                            max_horizon=128,
                            per_core_batch_size=1,
                            normalize_inputs=True,
                            infer_is_positive=False,
                        )
                    )
                    _PRETRAINED_MODEL_CACHE[self.preferred_model_key] = model
                self._model = model
            logger.info("TimesFM 2.5 carregado com pesos: %s", self.metadata.model_id)
            return True

        raise RuntimeError(
            "Carregamento integrado disponível apenas para TimesFM 2.5 e TimesFM 3.0 (apenas para TimesFM 2.5 em modo de produção comercial); "
            "TimesFM 2.0 legado (500M JAX) opera via simulação analítica calibrada."
        )

    @property
    def is_research_mode(self) -> bool:
        """Indica se a inferencia esta sob o modo de pesquisa nao-comercial."""
        return self.mode == ExecutionMode.RESEARCH_BENCHMARK

    @property
    def model(self) -> Any:
        """Instancia do modelo neural carregado ou None."""
        return self._model

    @property
    def weights_loaded(self) -> bool:
        """Indica se a inferencia usa pesos carregados em memoria."""
        return self._model is not None

    @property
    def inference_backend(self) -> str:
        return BACKEND_PESOS if self.weights_loaded else BACKEND_ANALITICO

    @property
    def procedencia(self) -> str:
        """O que de fato produziu o numero, e nao o que se pretendia usar.

        Com pesos, e o proprio modelo. Sem pesos, e a extrapolacao analitica -- e o
        id do Google entra como intencao entre parenteses, nunca como autor.
        """
        if self.weights_loaded:
            return self.metadata.model_id
        return f"{BACKEND_ANALITICO} (sem pesos de {self.metadata.model_id})"

    def _validate_and_resolve_model(
        self,
        mode: ExecutionMode,
        model_key: str,
    ) -> ModelMetadata:
        canonical_key = TIMESFM_ALIASES.get(model_key.strip().lower(), model_key)
        if canonical_key not in TIMESFM_CATALOG:
            raise ValueError(f"Modelo desconhecido: '{model_key}'. Op\u00e7\u00f5es: {list(TIMESFM_CATALOG.keys())}")

        meta = TIMESFM_CATALOG[canonical_key]

        if mode == ExecutionMode.COMMERCIAL_PRODUCTION and not meta.is_commercial_allowed:
            raise TimesFMGovernanceError(
                f"VIOLA\u00c7\u00c3O DE LICEN\u00c7A: O modelo '{canonical_key}' est\u00e1 sob '{meta.license_tier.value}'. "
                "O Google pro\u00edbe expressamente o uso de pesos do TimesFM 3.0 em ambientes comerciais ou de produ\u00e7\u00e3o. "
                f"Para produ\u00e7\u00e3o comercial, utilize '{TIMESFM_20_500M}' / '{TIMESFM_25_200M}' (Apache 2.0) "
                "ou utilize o servi\u00e7o gerenciado Google Cloud BigQuery ML (AI.FORECAST)."
            )

        logger.debug(
            "TimesFM Inicializado | Modo: %s | Modelo: %s | Licen\u00e7a: %s",
            mode.value,
            meta.model_id,
            meta.license_tier.value,
        )
        return meta

    def _forecast_analytic_fallback(
        self,
        history: np.ndarray,
        horizon: int,
        target_name: str,
    ) -> ForecastResult:
        """Simulacao analitica com decaimento/drift bayesiano para fallback zero-token ou inferencia direta."""
        last_val = float(history[-1])
        window = min(len(history), 10)
        trend = float(np.mean(np.diff(history[-window:]))) if len(history) >= 2 else 0.0
        volatility = float(np.std(history)) if len(history) > 1 else 1.0

        steps = np.arange(1, horizon + 1)
        mean_pred = [float(last_val + trend * step) for step in steps]
        q10 = [float(m - 1.28 * volatility * np.sqrt(step)) for step, m in zip(steps, mean_pred, strict=False)]
        q90 = [float(m + 1.28 * volatility * np.sqrt(step)) for step, m in zip(steps, mean_pred, strict=False)]

        return ForecastResult(
            target_name=target_name,
            history_length=len(history),
            forecast_horizon=horizon,
            mean_prediction=mean_pred,
            quantile_10=q10,
            quantile_90=q90,
            model_used=self.procedencia,
            license_tier=self.metadata.license_tier.value,
            intended_model=self.metadata.model_id,
            weights_loaded=self.weights_loaded,
        )

    def _forecast_model_univariate(
        self,
        history: np.ndarray,
        horizon: int,
        target_name: str,
    ) -> ForecastResult:
        """Executa previsao univariada usando o modelo neural carregado."""
        model: Any = self._model
        if model is not None and hasattr(model, "predict"):
            output = model.predict(
                context=history.astype(np.float32),
                horizon=horizon,
                return_quantiles=True,
            )
            mean_pred, q10, q90 = _extract_quantiles_from_predict(output, horizon)
        elif model is not None and hasattr(model, "forecast"):
            points, quantiles = model.forecast(horizon, [history.astype(np.float32)])
            mean_pred, q10, q90 = _extract_quantiles_from_legacy_forecast(points, quantiles, horizon)
        else:
            return self._forecast_analytic_fallback(history, horizon, target_name)

        return ForecastResult(
            target_name=target_name,
            history_length=len(history),
            forecast_horizon=horizon,
            mean_prediction=mean_pred,
            quantile_10=q10,
            quantile_90=q90,
            model_used=self.metadata.model_id,
            license_tier=self.metadata.license_tier.value,
            intended_model=self.metadata.model_id,
            weights_loaded=True,
        )

    def forecast_univariate(
        self,
        series: list[float] | np.ndarray,
        horizon: int = 12,
        frequency_indicator: int = 0,
        target_name: str = "metric",
    ) -> ForecastResult:
        """Executa previsao univariada (serie temporal unica, e.g. variancia de EV ou Bankroll)."""
        _ = frequency_indicator
        history = np.asarray(series, dtype=np.float32)
        if len(history) < 4:
            raise ValueError("A série histórica deve possuir ao menos 4 pontos para inferência.")

        if self._model is not None:
            return self._forecast_model_univariate(history, horizon, target_name)

        return self._forecast_analytic_fallback(history, horizon, target_name)

    def forecast_multivariate(
        self,
        series_dict: dict[str, list[float]],
        horizon: int = 12,
    ) -> dict[str, ForecastResult]:
        """Executa previsao multivariada (multiplas series correlacionadas, e.g. Fator Psi + RIO + Pressao)."""
        results: dict[str, ForecastResult] = {}
        for name, series in series_dict.items():
            results[name] = self.forecast_univariate(
                series=series,
                horizon=horizon,
                target_name=name,
            )
        return results

    def forecast_with_covariates(
        self,
        series: list[float] | np.ndarray | None = None,
        past_covariates: dict[str, list[float]] | np.ndarray | None = None,
        future_covariates: dict[str, list[float]] | np.ndarray | None = None,
        horizon: int = 12,
        frequency_indicator: int = 0,
        target_name: str = "metric",
        target_series: list[float] | np.ndarray | None = None,
    ) -> ForecastResult:
        """Executa previsão condicionada a covariáveis temporais passadas e futuras."""
        _ = frequency_indicator
        actual_series = series if series is not None else target_series
        if actual_series is None:
            raise ValueError("Uma série histórica deve ser informada (series ou target_series).")
        history = np.asarray(actual_series, dtype=np.float32)
        if len(history) < 4:
            raise ValueError("A série histórica deve possuir ao menos 4 pontos para inferência.")

        model: Any = self._model
        if model is not None and hasattr(model, "predict"):
            po_arr = _normalize_covariates_array(past_covariates)
            pf_arr = _normalize_covariates_array(future_covariates)
            output = model.predict(
                context=history.astype(np.float32),
                horizon=horizon,
                past_only_covariates=po_arr,
                past_future_covariates=pf_arr,
                return_quantiles=True,
            )
            mean_pred, q10, q90 = _extract_quantiles_from_predict(output, horizon)
            return ForecastResult(
                target_name=target_name,
                history_length=len(history),
                forecast_horizon=horizon,
                mean_prediction=mean_pred,
                quantile_10=q10,
                quantile_90=q90,
                model_used=self.metadata.model_id,
                license_tier=self.metadata.license_tier.value,
                intended_model=self.metadata.model_id,
                weights_loaded=True,
            )

        return self.forecast_univariate(series=history, horizon=horizon, target_name=target_name)


def forecast_bankroll_trajectory(
    history_bb: list[float],
    horizon_tournaments: int = 12,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
    covariates: dict[str, list[float]] | None = None,
) -> ForecastResult:
    """Funcao de dominio SOTA: Projeta a trajetoria estocastica de Bankroll (em BB).

    Retorna previsao media esperada e tunel de variancia (q10 a q90).
    """
    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para bankroll: %s", exc)

    if covariates is not None:
        return engine.forecast_with_covariates(
            series=history_bb,
            past_covariates=covariates,
            horizon=horizon_tournaments,
            target_name="Bankroll_Trajectory_BB",
        )
    return engine.forecast_univariate(
        series=history_bb,
        horizon=horizon_tournaments,
        target_name="Bankroll_Trajectory_BB",
    )


def forecast_pmev_risk_dynamics(
    history_psi: list[float],
    history_rio: list[float],
    history_icm: list[float],
    horizon_steps: int = 10,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> dict[str, ForecastResult]:
    """Funcao de dominio SOTA: Projeta a evolucao conjunta dos tensores de risco PMev.

    Combina Fator Psi (entropia/agressao), Passivo RIO e Pressao de ICM.
    """
    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para PMev: %s", exc)

    return engine.forecast_multivariate(
        series_dict={
            "Fator_Psi": history_psi,
            "Divida_RIO": history_rio,
            "Pressao_ICM": history_icm,
        },
        horizon=horizon_steps,
    )


class AgentCalibrationForecast(BaseModel):
    """Projecao estocastica TimesFM para calibracao de agentes."""

    status: Literal["PROJECTION_ACTIVE", "INSUFFICIENT_HISTORY"]
    history_points: int
    horizon_sessions: int
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    drift_per_session: float
    drift_direction: Literal["EXPANSAO", "ESTAVEL", "DOWNWARD_DRIFT"]
    risk_of_degradation: float
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    conductor_model: str | None = None
    notes: str | None = None


def forecast_agent_calibration_trajectory(
    history_scores: list[float],
    horizon_sessions: int = 3,
    conductor_model: str | None = None,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> AgentCalibrationForecast:
    """Funcao de Dominio: Projeta a trajetoria e volatilidade de notas de calibracao dos agentes.

    Utiliza TimesFM 2.5 (Apache 2.0) ou 3.0 (Research) para antecipar desvios de performance, quantis e downward drift.
    """
    if len(history_scores) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return AgentCalibrationForecast(
            status="INSUFFICIENT_HISTORY",
            history_points=len(history_scores),
            horizon_sessions=horizon_sessions,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            drift_per_session=0.0,
            drift_direction="ESTAVEL",
            risk_of_degradation=0.0,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            conductor_model=conductor_model,
            notes="TimesFM exige ao menos 4 pontos historicos de feedback para inferencia temporal.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para calibracao: %s", exc)

    res = engine.forecast_univariate(
        series=history_scores,
        horizon=horizon_sessions,
        target_name=f"agent_scores_{conductor_model or 'aggregate'}",
    )

    # Clamping rigoroso no espaco de notas [0.0, 10.0]
    raw_mean = res.mean_prediction
    mean_clamped = [round(max(0.0, min(10.0, float(v))), 2) for v in raw_mean]

    if res.weights_loaded:
        q10_raw = res.quantile_10
        q90_raw = res.quantile_90
        q10_clamped = [round(max(0.0, min(m, float(q))), 2) for m, q in zip(mean_clamped, q10_raw, strict=False)]
        q90_clamped = [round(min(10.0, max(m, float(q))), 2) for m, q in zip(mean_clamped, q90_raw, strict=False)]
    else:
        recent_volatility = (
            float(np.std(history_scores[-6:])) if len(history_scores) >= 6 else float(np.std(history_scores))
        )
        sigma_est = max(0.15, recent_volatility * math.sqrt(max(1, horizon_sessions) / 3.0))
        q10_clamped = [
            round(max(0.0, min(m, m - 1.28 * sigma_est * math.sqrt(i + 1))), 2) for i, m in enumerate(mean_clamped)
        ]
        q90_clamped = [
            round(min(10.0, max(m, m + 1.28 * sigma_est * math.sqrt(i + 1))), 2) for i, m in enumerate(mean_clamped)
        ]

    initial_score = history_scores[-1]
    final_mean = mean_clamped[-1]
    drift = (final_mean - initial_score) / max(1, horizon_sessions)
    if drift > 0.05:
        direction: Literal["EXPANSAO", "ESTAVEL", "DOWNWARD_DRIFT"] = "EXPANSAO"
    elif drift < -0.05:
        direction = "DOWNWARD_DRIFT"
    else:
        direction = "ESTAVEL"

    # Probabilidade analitica de cauda gaussiana abaixo do limiar de excelencia do portao (8.5)
    critical_threshold = 8.5
    final_clamped_mean = mean_clamped[-1]
    sigma_prob = max(0.15, float(np.std(history_scores)))
    z_score = (critical_threshold - final_clamped_mean) / sigma_prob
    degradation_prob = 0.5 * (1.0 + math.erf(z_score / math.sqrt(2.0)))
    degradation_prob = max(0.0, min(1.0, degradation_prob))

    return AgentCalibrationForecast(
        status="PROJECTION_ACTIVE",
        history_points=len(history_scores),
        horizon_sessions=horizon_sessions,
        mean_trajectory=mean_clamped,
        quantile_10=q10_clamped,
        quantile_90=q90_clamped,
        drift_per_session=round(drift, 4),
        drift_direction=direction,
        risk_of_degradation=round(degradation_prob, 4),
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
        conductor_model=conductor_model,
    )


def forecast_multimodel_calibration(
    series_by_model: dict[str, list[float]],
    horizon_sessions: int = 3,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> dict[str, AgentCalibrationForecast]:
    """Escalonamento Multivariado: Projeta series temporais segmentadas por modelo condutor."""
    return {
        model: forecast_agent_calibration_trajectory(
            history_scores=scores,
            horizon_sessions=horizon_sessions,
            conductor_model=model,
            mode=mode,
            preferred_model_key=preferred_model_key,
            use_pretrained_weights=use_pretrained_weights,
        )
        for model, scores in series_by_model.items()
    }


class CfrConvergenceForecast(BaseModel):
    """Projecao estocastica de convergencia e decaimento de explorabilidade no CFR+."""

    status: Literal["CONVERGED", "CONVERGING", "PLATEAU_DETECTED", "INSUFFICIENT_HISTORY"]
    current_exploitability: float
    target_epsilon: float
    estimated_iterations_to_target: int
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    early_stopping_recommended: bool
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    notes: str | None = None


def forecast_cfr_convergence(
    regret_history: list[float],
    horizon_iterations: int = 10,
    target_epsilon: float = 0.001,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> CfrConvergenceForecast:
    """Projeta a trajetoria de decaimento do arrependimento medio ou explorabilidade no CFR+.

    Permite Early Stopping Preditivo quando a explorabilidade projetada atinge target_epsilon
    ou quando a variacao entre iteracoes indica convergencia assintotica ou plato.
    """
    if len(regret_history) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return CfrConvergenceForecast(
            status="INSUFFICIENT_HISTORY",
            current_exploitability=float(regret_history[-1]) if regret_history else 1.0,
            target_epsilon=target_epsilon,
            estimated_iterations_to_target=-1,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            early_stopping_recommended=False,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="TimesFM exige ao menos 4 pontos historicos de regret para inferencia.",
        )

    current_val = float(regret_history[-1])
    if current_val <= target_epsilon:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return CfrConvergenceForecast(
            status="CONVERGED",
            current_exploitability=current_val,
            target_epsilon=target_epsilon,
            estimated_iterations_to_target=0,
            mean_trajectory=[current_val] * horizon_iterations,
            quantile_10=[current_val] * horizon_iterations,
            quantile_90=[current_val] * horizon_iterations,
            early_stopping_recommended=True,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="Convergencia ja alcancada antes do horizonte projetado.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para CFR: %s", exc)

    res = engine.forecast_univariate(
        series=regret_history,
        horizon=horizon_iterations,
        target_name="cfr_exploitability_decay",
    )

    # Clamping do decaimento em valores nao-negativos
    mean_clamped = [round(max(0.0, float(v)), 6) for v in res.mean_prediction]
    q10_clamped = [round(max(0.0, float(v)), 6) for v in res.quantile_10]
    q90_clamped = [round(max(0.0, float(v)), 6) for v in res.quantile_90]

    # Deteccao de passos ate a meta de epsilon
    steps_to_target = -1
    for step_idx, val in enumerate(mean_clamped):
        if val <= target_epsilon:
            steps_to_target = step_idx + 1
            break

    # Deteccao de plato assintotico
    recent_diffs = np.diff(regret_history[-min(len(regret_history), 5) :])
    mean_abs_slope = float(np.mean(np.abs(recent_diffs))) if len(recent_diffs) > 0 else 0.0

    if steps_to_target > 0:
        status: Literal["CONVERGED", "CONVERGING", "PLATEAU_DETECTED", "INSUFFICIENT_HISTORY"] = "CONVERGING"
        early_stop = True
    elif mean_abs_slope < 1e-6:
        status = "PLATEAU_DETECTED"
        early_stop = True
    else:
        status = "CONVERGING"
        early_stop = False

    return CfrConvergenceForecast(
        status=status,
        current_exploitability=current_val,
        target_epsilon=target_epsilon,
        estimated_iterations_to_target=steps_to_target,
        mean_trajectory=mean_clamped,
        quantile_10=q10_clamped,
        quantile_90=q90_clamped,
        early_stopping_recommended=early_stop,
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
    )


class OpponentDriftForecast(BaseModel):
    """Projecao estocastica de deriva de frequencias de oponentes vs limiares GTO."""

    status: Literal["DRIFTING", "STABLE", "INSUFFICIENT_HISTORY"]
    metric_name: str
    history_points: int
    horizon_hands: int
    current_value: float
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    drift_direction: Literal["EXPANSAO", "ESTAVEL", "DOWNWARD_DRIFT"]
    canonical_benchmark: float
    divergence_from_canonical: float
    exploitative_adjustment_recommended: bool
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    notes: str | None = None


def forecast_opponent_drift(
    history_frequencies: list[float],
    horizon_hands: int = 10,
    canonical_benchmark: float = 0.5,
    metric_name: str = "vpip",
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> OpponentDriftForecast:
    """Projeta a deriva de tendencias do vilao (VPIP, 3-bet, fold to c-bet) vs limiares GTO."""
    if len(history_frequencies) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return OpponentDriftForecast(
            status="INSUFFICIENT_HISTORY",
            metric_name=metric_name,
            history_points=len(history_frequencies),
            horizon_hands=horizon_hands,
            current_value=float(history_frequencies[-1]) if history_frequencies else 0.0,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            drift_direction="ESTAVEL",
            canonical_benchmark=canonical_benchmark,
            divergence_from_canonical=0.0,
            exploitative_adjustment_recommended=False,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="TimesFM exige ao menos 4 observacoes de frequencia para projecao.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para Opponent Drift: %s", exc)

    res = engine.forecast_univariate(
        series=history_frequencies,
        horizon=horizon_hands,
        target_name=f"opponent_{metric_name}",
    )

    mean_clamped = [round(max(0.0, min(1.0, float(v))), 4) for v in res.mean_prediction]
    q10_clamped = [round(max(0.0, min(1.0, float(v))), 4) for v in res.quantile_10]
    q90_clamped = [round(max(0.0, min(1.0, float(v))), 4) for v in res.quantile_90]

    current_val = float(history_frequencies[-1])
    final_mean = mean_clamped[-1]
    drift = (final_mean - current_val) / max(1, horizon_hands)

    if drift > 0.01:
        direction: Literal["EXPANSAO", "ESTAVEL", "DOWNWARD_DRIFT"] = "EXPANSAO"
    elif drift < -0.01:
        direction = "DOWNWARD_DRIFT"
    else:
        direction = "ESTAVEL"

    divergence = abs(final_mean - canonical_benchmark)
    is_exploitable = divergence > 0.08

    return OpponentDriftForecast(
        status="DRIFTING" if direction != "ESTAVEL" else "STABLE",
        metric_name=metric_name,
        history_points=len(history_frequencies),
        horizon_hands=horizon_hands,
        current_value=round(current_val, 4),
        mean_trajectory=mean_clamped,
        quantile_10=q10_clamped,
        quantile_90=q90_clamped,
        drift_direction=direction,
        canonical_benchmark=canonical_benchmark,
        divergence_from_canonical=round(divergence, 4),
        exploitative_adjustment_recommended=is_exploitable,
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
    )


# ==============================================================================
# FUNÇÕES DE DOMÍNIO AMPLIADAS E EVOLUÍDAS (SOTA v8.0 GOLD)
# ==============================================================================


class IcmPressureForecast(BaseModel):
    """Projeção estocástica da evolução do prêmio de risco e pressão de ICM em torneio MTT."""

    status: Literal["PRESSURE_INCREASING", "STABLE", "BUBBLE_PEAK", "INSUFFICIENT_HISTORY"]
    current_risk_premium: float
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    bubble_factor_projected: float
    tightening_recommended: bool
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    notes: str | None = None


def forecast_tournament_icm_decay(
    history_premiums: list[float],
    horizon_levels: int = 8,
    remaining_players: int = 10,
    total_entries: int = 100,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> IcmPressureForecast:
    """Projeta a curva estocástica de pressão de ICM e fator de bolha para MTTs."""
    if len(history_premiums) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return IcmPressureForecast(
            status="INSUFFICIENT_HISTORY",
            current_risk_premium=float(history_premiums[-1]) if history_premiums else 0.0,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            bubble_factor_projected=1.0,
            tightening_recommended=False,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="TimesFM exige ao menos 4 pontos históricos de prêmio de risco para projeção.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para ICM: %s", exc)

    res = engine.forecast_univariate(
        series=history_premiums,
        horizon=horizon_levels,
        target_name="tournament_icm_pressure",
    )

    mean_clamped = [round(max(0.0, min(100.0, float(v))), 2) for v in res.mean_prediction]
    q10_clamped = [round(max(0.0, min(m, float(q))), 2) for m, q in zip(mean_clamped, res.quantile_10, strict=False)]
    q90_clamped = [round(min(100.0, max(m, float(q))), 2) for m, q in zip(mean_clamped, res.quantile_90, strict=False)]

    current_val = float(history_premiums[-1])
    final_mean = mean_clamped[-1]
    bubble_ratio = (total_entries * 0.15) / max(1, remaining_players)
    bubble_factor = round(max(1.0, 1.0 + (final_mean / 20.0) * bubble_ratio), 3)

    if 0.85 <= bubble_ratio <= 1.15:
        status: Literal["PRESSURE_INCREASING", "STABLE", "BUBBLE_PEAK", "INSUFFICIENT_HISTORY"] = "BUBBLE_PEAK"
        tighten = True
    elif final_mean > current_val + 2.0:
        status = "PRESSURE_INCREASING"
        tighten = True
    else:
        status = "STABLE"
        tighten = final_mean > 15.0

    return IcmPressureForecast(
        status=status,
        current_risk_premium=round(current_val, 2),
        mean_trajectory=mean_clamped,
        quantile_10=q10_clamped,
        quantile_90=q90_clamped,
        bubble_factor_projected=bubble_factor,
        tightening_recommended=tighten,
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
    )


class MeshTelemetryForecast(BaseModel):
    """Projeção estocástica de latência e throughput da malha agêntica."""

    status: Literal["HEALTHY", "LATENCY_SPIKE_RISK", "SATURATION_WARNING", "INSUFFICIENT_HISTORY"]
    current_latency_ms: float
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    projected_p95_ms: float
    failover_recommended: bool
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    notes: str | None = None


def forecast_mesh_telemetry_latency(
    history_latencies_ms: list[float],
    horizon_steps: int = 6,
    sla_threshold_ms: float = 200.0,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> MeshTelemetryForecast:
    """Projeta o comportamento temporal da latência dos nós da malha agêntica."""
    if len(history_latencies_ms) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return MeshTelemetryForecast(
            status="INSUFFICIENT_HISTORY",
            current_latency_ms=float(history_latencies_ms[-1]) if history_latencies_ms else 0.0,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            projected_p95_ms=0.0,
            failover_recommended=False,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="TimesFM exige ao menos 4 observações de latência para projeção temporal.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para telemetria: %s", exc)

    res = engine.forecast_univariate(
        series=history_latencies_ms,
        horizon=horizon_steps,
        target_name="mesh_latency_ms",
    )

    mean_clamped = [round(max(0.1, float(v)), 2) for v in res.mean_prediction]
    q10_clamped = [round(max(0.1, min(m, float(q))), 2) for m, q in zip(mean_clamped, res.quantile_10, strict=False)]
    q90_clamped = [round(max(m, float(q)), 2) for m, q in zip(mean_clamped, res.quantile_90, strict=False)]

    current_val = float(history_latencies_ms[-1])
    p95_est = float(np.percentile(q90_clamped, 95)) if len(q90_clamped) > 0 else q90_clamped[-1]

    if p95_est > sla_threshold_ms * 1.5:
        status: Literal["HEALTHY", "LATENCY_SPIKE_RISK", "SATURATION_WARNING", "INSUFFICIENT_HISTORY"] = (
            "SATURATION_WARNING"
        )
        failover = True
    elif p95_est > sla_threshold_ms:
        status = "LATENCY_SPIKE_RISK"
        failover = True
    else:
        status = "HEALTHY"
        failover = False

    return MeshTelemetryForecast(
        status=status,
        current_latency_ms=round(current_val, 2),
        mean_trajectory=mean_clamped,
        quantile_10=q10_clamped,
        quantile_90=q90_clamped,
        projected_p95_ms=round(p95_est, 2),
        failover_recommended=failover,
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
    )


class EvVarianceForecast(BaseModel):
    """Envelope estocástico de dispersão entre EV esperado e realizado (Bankroll / Hand Volume)."""

    status: Literal["WITHIN_EXPECTED_VARIANCE", "DOWNSWING_ANOMALY", "INSUFFICIENT_HISTORY"]
    current_gap_bb: float
    mean_trajectory: list[float]
    quantile_10: list[float]
    quantile_90: list[float]
    downswing_recovery_hands: int
    variance_exhaustion_probability: float
    model_used: str
    license_tier: str
    intended_model: str = ""
    weights_loaded: bool = False
    notes: str | None = None


def forecast_ev_variance_envelope(
    history_ev_bb: list[float],
    history_actual_bb: list[float],
    horizon_steps: int = 10,
    mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
    preferred_model_key: str = TIMESFM_25_200M,
    use_pretrained_weights: bool = False,
) -> EvVarianceForecast:
    """Projeta a trajetória de variância entre EV e resultado efetivo para mitigar tilt e calibrar risco."""
    if len(history_ev_bb) < 4 or len(history_actual_bb) < 4:
        meta = TIMESFM_CATALOG.get(preferred_model_key, TIMESFM_CATALOG[TIMESFM_25_200M])
        return EvVarianceForecast(
            status="INSUFFICIENT_HISTORY",
            current_gap_bb=0.0,
            mean_trajectory=[],
            quantile_10=[],
            quantile_90=[],
            downswing_recovery_hands=0,
            variance_exhaustion_probability=0.0,
            model_used=f"{BACKEND_ANALITICO} (sem pesos de {meta.model_id})",
            license_tier=meta.license_tier.value,
            intended_model=meta.model_id,
            weights_loaded=False,
            notes="TimesFM exige ao menos 4 observações pareadas de EV e resultado real.",
        )

    engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)
    if use_pretrained_weights:
        try:
            engine.load_pretrained_weights(local_files_only=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falha ao carregar pesos TimesFM para envelope de EV: %s", exc)

    min_len = min(len(history_ev_bb), len(history_actual_bb))
    gap_series = [
        float(act - ev) for act, ev in zip(history_actual_bb[-min_len:], history_ev_bb[-min_len:], strict=True)
    ]

    res = engine.forecast_univariate(
        series=gap_series,
        horizon=horizon_steps,
        target_name="ev_variance_gap_bb",
    )

    mean_pred = [round(float(v), 2) for v in res.mean_prediction]
    q10 = [round(min(m, float(q)), 2) for m, q in zip(mean_pred, res.quantile_10, strict=False)]
    q90 = [round(max(m, float(q)), 2) for m, q in zip(mean_pred, res.quantile_90, strict=False)]

    current_gap = gap_series[-1]
    gap_std = float(np.std(gap_series)) if len(gap_series) > 1 else 10.0
    is_anomaly = current_gap < -2.5 * gap_std

    recovery_steps = -1
    for step_idx, val in enumerate(mean_pred):
        if val >= 0.0:
            recovery_steps = (step_idx + 1) * 100
            break

    z = abs(current_gap) / max(1.0, gap_std * math.sqrt(horizon_steps))
    exhaustion_prob = round(0.5 * (1.0 + math.erf(z / math.sqrt(2.0))), 4)

    return EvVarianceForecast(
        status="DOWNSWING_ANOMALY" if is_anomaly else "WITHIN_EXPECTED_VARIANCE",
        current_gap_bb=round(current_gap, 2),
        mean_trajectory=mean_pred,
        quantile_10=q10,
        quantile_90=q90,
        downswing_recovery_hands=max(0, recovery_steps),
        variance_exhaustion_probability=min(1.0, exhaustion_prob),
        model_used=res.model_used,
        license_tier=res.license_tier,
        intended_model=res.intended_model,
        weights_loaded=res.weights_loaded,
    )
