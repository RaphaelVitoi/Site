"""Ponte de Integracao Autopoietica: Dream-RSI + Google TimesFM.

Combina o espaco de busca da Arvore de Descoberta com projecoes quantilicas
de series temporais (TimesFM 2.5 / 3.0) para poda preditiva antecipada e
prevencao de plateaus de convergencia.
Opera 100% localmente com zero chaves de API e em total conformidade de licencas.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from collections.abc import Sequence

from core.discovery_tree_schemas import DiscoveryTree
from engine.timesfm_engine import (
    ExecutionMode,
    ForecastResult,
    TimesFMEngine,
)


class DreamTimesFMForecaster:
    """Oraculo preditivo de series temporais para trajetorias da DiscoveryTree."""

    def __init__(
        self,
        mode: ExecutionMode = ExecutionMode.COMMERCIAL_PRODUCTION,
        preferred_model_key: str = "timesfm-2.5-200m",
    ) -> None:
        self.mode = mode
        self.preferred_model_key = preferred_model_key
        self.engine = TimesFMEngine(mode=mode, preferred_model_key=preferred_model_key)

    def extract_trajectory_scores(self, tree: DiscoveryTree, node_id: str) -> list[float]:
        """Extrai a serie temporal de metric_score da raiz ate o no especificado."""
        scores: list[float] = []
        curr_id: str | None = node_id

        while curr_id and curr_id in tree.nodes:
            curr_node = tree.nodes[curr_id]
            scores.append(float(curr_node.metric_score))
            curr_id = curr_node.parent_id

        scores.reverse()  # Ordena cronologicamente da raiz para a folha
        return scores

    def forecast_trajectory(self, scores: Sequence[float], horizon: int = 5) -> ForecastResult | None:
        """Projeta o horizonte futuro da trajetoria usando TimesFM univariado."""
        if len(scores) < 4:
            return None
        return self.engine.forecast_univariate(
            series=list(scores),
            horizon=horizon,
            target_name="trajectory_metric",
        )

    def calibrate_short_series_upper_bound(self, scores: Sequence[float], horizon: int = 5) -> float:
        """Estima teto previo adaptativo para series curtas (< 4 pontos) antes do TimesFM."""
        if not scores:
            return 1.0
        n = len(scores)
        last_score = scores[-1]
        if n == 1:
            return min(1.0, max(0.0, last_score + 0.25))
        if n == 2:
            slope = scores[1] - scores[0]
            gain = max(0.0, slope) * min(2, horizon) + 0.15
            return min(1.0, max(0.0, last_score + gain))
        # n == 3
        slope = (scores[2] - scores[0]) / 2.0
        gain = max(0.0, slope) * min(2, horizon) + 0.08
        return min(1.0, max(0.0, last_score + gain))

    def should_prune_predictively(
        self,
        scores: Sequence[float],
        global_best_score: float,
        margin: float = 0.02,
        horizon: int = 5,
    ) -> tuple[bool, str]:
        """Avalia se o teto estatistico da trajetoria justifica continuar explorando."""
        if not scores:
            return False, "Trajetoria vazia"

        if len(scores) < 4:
            # Calibracao adaptativa de momentum para series curtas (<= 3 pontos)
            short_ceiling = self.calibrate_short_series_upper_bound(scores, horizon=horizon)
            if short_ceiling + margin < global_best_score:
                return (
                    True,
                    f"[CALIBRATED-MOMENTUM] Teto heuristico ({short_ceiling:.3f}) inferior ao melhor global ({global_best_score:.3f})",
                )
            return (
                False,
                f"[CALIBRATED-MOMENTUM] Trajetoria curta promissora (Teto={short_ceiling:.3f} >= {global_best_score:.3f})",
            )

        forecast = self.forecast_trajectory(scores, horizon=horizon)
        if not forecast or not forecast.quantile_90:
            return False, "Inferencia temporal indisponivel"

        projected_ceiling = forecast.quantile_90[-1]
        if projected_ceiling + margin < global_best_score:
            return (
                True,
                f"Teto projetado TimesFM (Q90={projected_ceiling:.3f}) inferior ao melhor global ({global_best_score:.3f})",
            )

        return False, f"Teto projetado promissor (Q90={projected_ceiling:.3f} >= {global_best_score:.3f})"

    def is_plateau_imminent(self, scores: Sequence[float], horizon: int = 3, threshold: float = 1e-3) -> bool:
        """Detecta proativamente a iminencia de um plateau antes que a estagnacao ocorra."""
        if len(scores) < 4:
            return False

        forecast = self.forecast_trajectory(scores, horizon=horizon)
        if not forecast or len(forecast.mean_prediction) < 2:
            return False

        # Verifica se o ganho marginal previsto e menor que o threshold
        predicted_delta = forecast.mean_prediction[-1] - scores[-1]
        return predicted_delta < threshold
