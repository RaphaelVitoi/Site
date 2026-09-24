"""Adaptador Generico S1 (Laya) para Solvers e Frameworks do Ecossistema SOTA.

Conecta a classificacao System-1 (Laya Multilingual) aos motores e frameworks analiticos:
  - Pluribus Depth-Limited Solver
  - DeepStack Continual Resolving Engine
  - CFR+ / Growing Tree CFR
  - Monte Carlo Equity & Insolvency Workers (Rust/WASM)
  - Google TimesFM 2.5 / 3.0 (Time Series Foundation Models)
  - Google Dream-RSI (Recursive Self-Improvement through Evolving Worlds)
  - Universal Importer / GTO Wizard / PioSolver
  - PMev Perspective Engine (Teorema de Ruina de Vitoi)
  - Frameworks declarados (Libratus, Systems Theory, Shannon, Antevisao, Prospect Theory).

Invariantes:
  - Proveniencia Secao 4 em todas as respostas (data/engine_capabilities.json).
  - Lazy import: torch/laya carregam apenas sob demanda.
  - Fallback Heuristico robusto: nunca falha em host CPU ou sem dependencia pesada.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any

from llm.laya_bridge import (
    CANONICAL_LAYA_MODEL,
    LAYA_POKER_PRESETS,
    LayaPrediction,
    Provenia,
    classificar_intencao,
    laya_predict,
    predict_batch,
    ruin_priority_from_laya_prediction,
)

__all__ = [
    "LayaSolverAdapter",
    "LayaSolverBridgeResult",
]


@dataclass
class LayaSolverBridgeResult:
    """Resultado unificado da ponte Laya -> Solvers / Frameworks."""

    target_solver: str
    adapted_parameters: dict[str, Any]
    s1_prediction: LayaPrediction
    ruin_priority: float
    framework_signals: dict[str, Any]
    provenia: Provenia


class LayaSolverAdapter:
    """Adaptador universal que traduz sinais S1 da Laya para parametros de Solvers."""

    SOLVERS_SUPORTADOS: set[str] = {
        "pluribus",
        "deepstack",
        "cfr-plus",
        "universal-importer",
        "pmev-perspective",
        "libratus",
        "systems-theory",
        "shannon-entropy",
        "antevisao",
        "prospect-theory",
        "monte-carlo",
        "timesfm",
        "timesfm-forecaster",
        "dream-rsi",
        "dream-timesfm",
        "pmev-dream",
    }

    @staticmethod
    def _modulate_solver_parameters(
        solver_key: str,
        params: dict[str, Any],
        noul: float,
        choice: str,
        ruin_priority: float,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Extrai a logica de modulacao especifica por solver (reduz complexidade cognitiva)."""
        signals: dict[str, Any] = {}

        if solver_key == "pluribus":
            base_iters = int(params.get("iterations", 500))
            if noul > 0.7 or choice == "complex":
                params["iterations"] = int(base_iters * 1.5)
                params["lambda_factor"] = round(float(params.get("lambda_factor", 1.2)) * ruin_priority, 4)
            signals["pluribus_depth_multiplier"] = 1.2 if choice == "complex" else 1.0

        elif solver_key == "deepstack":
            base_tol = float(params.get("tolerance", 0.01))
            params["tolerance"] = round(base_tol * (1.0 + noul * 0.5), 6)
            signals["continual_resolving_tightened"] = noul > 0.5

        elif solver_key == "pmev-perspective":
            params["ruin_prior"] = ruin_priority
            signals["pmev_barrier_inflation"] = round((ruin_priority - 1.0) / 0.30 * 100.0, 2)

        elif solver_key == "cfr-plus":
            params["discount_alpha"] = round(0.6 + 0.3 * (1.0 - noul), 4)
            signals["cfr_regret_matching_plus"] = True
            signals["cfr_discount_alpha"] = params["discount_alpha"]

        elif solver_key == "monte-carlo":
            base_samples = int(params.get("simulations_count", 10000))
            if noul > 0.6 or choice == "complex":
                params["simulations_count"] = int(base_samples * 1.5)
            params["ruin_prior"] = ruin_priority
            base_conf = float(params.get("confidence_level", 0.95))
            params["confidence_level"] = round(min(0.99, base_conf + (0.02 if noul > 0.5 else 0.0)), 4)
            signals["monte_carlo_sample_expansion"] = noul > 0.6 or choice == "complex"
            signals["ruin_barrier_factor"] = ruin_priority

        elif solver_key in {"timesfm", "timesfm-forecaster"}:
            base_horizon = int(params.get("horizon", 5))
            if noul > 0.5:
                params["horizon"] = int(base_horizon * (1.0 + noul * 0.5))
            params["quantile_focus"] = "quantile_90" if ruin_priority > 1.10 else "quantile_50"
            mode = str(params.get("mode", "commercial")).lower()
            params["preferred_model"] = "timesfm-3.0-330m" if mode == "research" else "timesfm-2.5-200m"
            signals["timesfm_volatility_prior"] = round(noul, 4)
            signals["timesfm_ruin_adjusted_horizon"] = params.get("horizon", base_horizon)

        elif solver_key in {"dream-rsi", "dream-timesfm", "pmev-dream"}:
            base_margin = float(params.get("pruning_margin", 0.02))
            params["pruning_margin"] = round(base_margin * ruin_priority, 4)
            params["s1_pruning_threshold"] = round(0.20 + 0.15 * (1.0 - noul), 4)
            params["fast_path_heuristic"] = choice != "complex" and noul < 0.4
            signals["dream_rsi_pruning_tightened"] = ruin_priority > 1.10
            signals["s1_pre_filtering_enabled"] = True

        elif solver_key == "shannon-entropy":
            signals["shannon_uncertainty_bits"] = round(-noul * math.log2(max(noul, 1e-6)) if noul > 0 else 0.0, 4)

        elif solver_key == "prospect-theory":
            lambda_loss = float(params.get("loss_aversion_lambda", 2.25))
            params["loss_aversion_lambda"] = round(lambda_loss * ruin_priority, 4)

        elif solver_key in {"libratus", "antevisao", "systems-theory", "universal-importer"}:
            params["horizon_expansion_factor"] = round(1.0 + noul * 0.5, 4)
            signals["framework_cognitive_load"] = choice

        return params, signals

    @classmethod
    def adapt_for_solver(
        cls,
        solver_name: str,
        state_text_or_dict: str | dict[str, Any] | LayaPrediction,
        base_parameters: dict[str, Any] | None = None,
    ) -> LayaSolverBridgeResult:
        """Traduz a entrada S1 (Laya) em parametros especificos para o solver requisitado.

        Parameters
        ----------
        solver_name : str
            Nome do solver ou framework-alvo (ex: 'pluribus', 'deepstack', 'pmev-perspective').
        state_text_or_dict : str | dict | LayaPrediction
            Estado do jogo, prompt, requisicao textual ou predicao Laya pre-calculada.
        base_parameters : dict | None
            Parametros base existentes que serao modulados pelo System-1.

        Returns
        -------
        LayaSolverBridgeResult com parametros adaptados e proveniencia Secao 4.
        """
        solver_key = solver_name.lower().strip()
        if solver_key not in cls.SOLVERS_SUPORTADOS:
            solver_key = "universal-importer"

        params = dict(base_parameters or {})
        if isinstance(state_text_or_dict, LayaPrediction):
            pred = state_text_or_dict
            state_desc = str(pred.answers or pred.choice or "")
            intent = classificar_intencao(state_desc)
        else:
            pred = laya_predict(state_text_or_dict)
            intent = classificar_intencao(state_text_or_dict)

        nao_latin = intent.nao_latin_fraction_pct
        if not pred.provenia.fallback_used and (pred.noul is not None or pred.confidence is not None):
            ruin_priority = ruin_priority_from_laya_prediction(pred)
        else:
            ruin_priority = max(1.0, min(1.30, 1.0 + (nao_latin / 100.0) * 0.30))

        noul = pred.noul if pred.noul is not None else 0.0
        choice = pred.choice or "moderate"
        s1_score = pred.score or 0.5

        params, framework_signals = cls._modulate_solver_parameters(solver_key, params, noul, choice, ruin_priority)
        framework_signals["s1_confidence_score"] = s1_score

        p = pred.provenia
        provenia = Provenia(
            engine_id=f"laya-solver-adapter-{solver_key}",
            implementation_level=p.implementation_level,
            runtime_used=p.runtime_used,
            model_used=p.model_used,
            intended_model=p.intended_model,
            weights_loaded=p.weights_loaded,
            fallback_used=p.fallback_used,
            assumptions=p.assumptions + [f"solver-adapted={solver_key}", "ruin-priority-injected"],
            limitations=p.limitations + ["adapter-modulation-is-advisory"],
            units=p.units + ["ruin_priority", "adaptation_factor"],
        )

        return LayaSolverBridgeResult(
            target_solver=solver_key,
            adapted_parameters=params,
            s1_prediction=pred,
            ruin_priority=ruin_priority,
            framework_signals=framework_signals,
            provenia=provenia,
        )

    @classmethod
    def adapt_for_multiway_table(
        cls,
        solver_name: str,
        player_states: list[dict[str, Any] | str],
        base_parameters: dict[str, Any] | None = None,
    ) -> list[LayaSolverBridgeResult]:
        """Processa lote heterogeneo de estados de multiplos jogadores (ex: 9-max FT).

        Aproveita predict_batch() da Laya Multilingual para avaliar ate 9 jogadores
        em ~72ms compartilhando o mesmo checkpoint mmBERT-base (322M).
        """
        requests = [{"state": s, "questions": LAYA_POKER_PRESETS["street_triage"]} for s in player_states]
        predictions = predict_batch(requests, batch_size=len(player_states), model_override=CANONICAL_LAYA_MODEL)
        results: list[LayaSolverBridgeResult] = []
        for i, pred in enumerate(predictions):
            state = player_states[i]
            params = dict(base_parameters or {})
            intent = classificar_intencao(state)
            nao_latin = intent.nao_latin_fraction_pct
            if not pred.provenia.fallback_used and (pred.noul is not None or pred.confidence is not None):
                ruin_priority = ruin_priority_from_laya_prediction(pred)
            else:
                ruin_priority = max(1.0, min(1.30, 1.0 + (nao_latin / 100.0) * 0.30))
            noul = pred.noul if pred.noul is not None else 0.0
            choice = pred.choice or "moderate"
            s1_score = pred.score or 0.5
            solver_key = solver_name.lower().strip()
            if solver_key not in cls.SOLVERS_SUPORTADOS:
                solver_key = "universal-importer"
            params, framework_signals = cls._modulate_solver_parameters(solver_key, params, noul, choice, ruin_priority)
            framework_signals["s1_confidence_score"] = s1_score
            p = pred.provenia
            provenia = Provenia(
                engine_id=f"laya-solver-adapter-{solver_key}-multiway",
                implementation_level=p.implementation_level,
                runtime_used=p.runtime_used,
                model_used=p.model_used,
                intended_model=p.intended_model,
                weights_loaded=p.weights_loaded,
                fallback_used=p.fallback_used,
                assumptions=p.assumptions + [f"solver-adapted={solver_key}", "multiway-table-batch"],
                limitations=p.limitations + ["adapter-modulation-is-advisory"],
                units=p.units + ["ruin_priority", "adaptation_factor"],
            )
            results.append(
                LayaSolverBridgeResult(
                    target_solver=solver_key,
                    adapted_parameters=params,
                    s1_prediction=pred,
                    ruin_priority=ruin_priority,
                    framework_signals=framework_signals,
                    provenia=provenia,
                )
            )
        return results
