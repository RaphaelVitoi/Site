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

from collections.abc import Callable
from dataclasses import dataclass
import logging
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

logger = logging.getLogger(__name__)

__all__ = [
    "LayaSolverAdapter",
    "LayaSolverBridgeResult",
]

_POKER_SOLVER_PRESETS: dict[str, str] = {
    "pluribus": "street_triage",
    "deepstack": "street_triage",
    "cfr-plus": "street_triage",
    "monte-carlo": "street_triage",
    "pmev-perspective": "icm_pressure",
    "pmev-dream": "icm_pressure",
    "prospect-theory": "icm_pressure",
}


def _select_cascade_questions(
    solver_key: str,
    custom_questions: dict[str, dict[str, Any]] | None,
) -> dict[str, dict[str, Any]]:
    """Seleciona preset semantico de poker por solver quando questions nao foi informado."""
    if custom_questions:
        return custom_questions
    preset_name = _POKER_SOLVER_PRESETS.get(solver_key)
    if preset_name and preset_name in LAYA_POKER_PRESETS:
        return LAYA_POKER_PRESETS[preset_name]
    from llm.laya_bridge import LAYA_DEFAULT_QUESTIONS  # noqa: PLC0415

    return LAYA_DEFAULT_QUESTIONS


def _extract_answer_scalars(answers: dict[str, Any]) -> tuple[float | None, str | None, float | None, float | None]:
    """Extrai ``(noul, choice, score, min_confidence)`` de respostas Laya/GD1."""
    noul: float | None = None
    choice: str | None = None
    score: float | None = None
    confs: list[float] = []
    for qdef in answers.values():
        if not isinstance(qdef, dict):
            continue
        if qdef.get("noul") is not None:
            noul = float(qdef["noul"])
        if qdef.get("choice") is not None:
            choice = str(qdef["choice"])
        if qdef.get("score") is not None:
            score = float(qdef["score"])
        if qdef.get("confidence") is not None:
            confs.append(float(qdef["confidence"]))
    return noul, choice, score, (min(confs) if confs else None)


def _decision_result_to_laya_prediction(res: Any) -> LayaPrediction:
    """Converte DecisionResult (Laya ou Gemini Decision 1) em LayaPrediction preservando respostas e probabilidades."""
    answers = getattr(res, "answers", {}) or {}
    noul, choice, score, min_conf = _extract_answer_scalars(answers)
    return LayaPrediction(
        answers=answers,
        model_used=str(getattr(res, "model_used", "") or ""),
        device="cloud" if getattr(res, "engine", "") == "gemini-decision-1" else "local",
        n_tokens=int(getattr(res, "n_tokens", 0) or 0),
        latency_ms=float(getattr(res, "latency_ms", 0.0) or 0.0),
        noul=noul,
        choice=choice,
        score=score,
        provenia=res.provenia,
        confidence=min_conf,
    )


@dataclass
class LayaSolverBridgeResult:
    """Resultado unificado da ponte Laya -> Solvers / Frameworks."""

    target_solver: str
    adapted_parameters: dict[str, Any]
    s1_prediction: LayaPrediction
    ruin_priority: float
    framework_signals: dict[str, Any]
    provenia: Provenia


def _modulate_pluribus(params: dict[str, Any], noul: float, choice: str, ruin_priority: float) -> dict[str, Any]:
    base_iters = int(params.get("iterations", 500))
    high_complexity = choice in ("complex", "wet", "monotone", "bluff_pressure")
    if noul > 0.7 or high_complexity:
        params["iterations"] = int(base_iters * 1.5)
        params["lambda_factor"] = round(float(params.get("lambda_factor", 1.2)) * ruin_priority, 4)
    return {"pluribus_depth_multiplier": 1.2 if high_complexity else 1.0}


def _modulate_deepstack(params: dict[str, Any], noul: float, _choice: str, _ruin_priority: float) -> dict[str, Any]:
    base_tol = float(params.get("tolerance", 0.01))
    params["tolerance"] = round(base_tol * (1.0 + noul * 0.5), 6)
    return {"continual_resolving_tightened": noul > 0.5}


def _modulate_pmev_perspective(
    params: dict[str, Any], _noul: float, _choice: str, ruin_priority: float
) -> dict[str, Any]:
    params["ruin_prior"] = ruin_priority
    return {"pmev_barrier_inflation": round((ruin_priority - 1.0) / 0.30 * 100.0, 2)}


def _modulate_cfr_plus(params: dict[str, Any], noul: float, _choice: str, _ruin_priority: float) -> dict[str, Any]:
    alpha = round(0.6 + 0.3 * (1.0 - noul), 4)
    params["discount_alpha"] = alpha
    return {"cfr_regret_matching_plus": True, "cfr_discount_alpha": alpha}


def _modulate_monte_carlo(params: dict[str, Any], noul: float, choice: str, ruin_priority: float) -> dict[str, Any]:
    base_samples = int(params.get("simulations_count", 10000))
    high_complexity = choice in ("complex", "wet", "monotone", "bluff_pressure")
    if noul > 0.6 or high_complexity:
        params["simulations_count"] = int(base_samples * 1.5)
    params["ruin_prior"] = ruin_priority
    base_conf = float(params.get("confidence_level", 0.95))
    params["confidence_level"] = round(min(0.99, base_conf + (0.02 if noul > 0.5 else 0.0)), 4)
    return {
        "monte_carlo_sample_expansion": noul > 0.6 or choice == "complex",
        "ruin_barrier_factor": ruin_priority,
    }


def _modulate_timesfm(params: dict[str, Any], noul: float, _choice: str, ruin_priority: float) -> dict[str, Any]:
    base_horizon = int(params.get("horizon", 5))
    if noul > 0.5:
        params["horizon"] = int(base_horizon * (1.0 + noul * 0.5))
    params["quantile_focus"] = "quantile_90" if ruin_priority > 1.10 else "quantile_50"
    mode = str(params.get("mode", "commercial")).lower()
    params["preferred_model"] = "timesfm-3.0-330m" if mode == "research" else "timesfm-2.5-200m"
    return {
        "timesfm_volatility_prior": round(noul, 4),
        "timesfm_ruin_adjusted_horizon": params.get("horizon", base_horizon),
    }


def _modulate_dream(params: dict[str, Any], noul: float, choice: str, ruin_priority: float) -> dict[str, Any]:
    base_margin = float(params.get("pruning_margin", 0.02))
    params["pruning_margin"] = round(base_margin * ruin_priority, 4)
    params["s1_pruning_threshold"] = round(0.20 + 0.15 * (1.0 - noul), 4)
    params["fast_path_heuristic"] = choice != "complex" and noul < 0.4
    return {
        "dream_rsi_pruning_tightened": ruin_priority > 1.10,
        "s1_pre_filtering_enabled": True,
    }


def _modulate_shannon(_params: dict[str, Any], noul: float, _choice: str, _ruin_priority: float) -> dict[str, Any]:
    bits = round(-noul * math.log2(max(noul, 1e-6)) if noul > 0 else 0.0, 4)
    return {"shannon_uncertainty_bits": bits}


def _modulate_prospect_theory(
    params: dict[str, Any], _noul: float, _choice: str, ruin_priority: float
) -> dict[str, Any]:
    lambda_loss = float(params.get("loss_aversion_lambda", 2.25))
    params["loss_aversion_lambda"] = round(lambda_loss * ruin_priority, 4)
    return {}


def _modulate_generic_framework(
    params: dict[str, Any], noul: float, choice: str, _ruin_priority: float
) -> dict[str, Any]:
    params["horizon_expansion_factor"] = round(1.0 + noul * 0.5, 4)
    return {"framework_cognitive_load": choice}


_SOLVER_MODULATORS: dict[str, Callable[[dict[str, Any], float, str, float], dict[str, Any]]] = {
    "pluribus": _modulate_pluribus,
    "deepstack": _modulate_deepstack,
    "pmev-perspective": _modulate_pmev_perspective,
    "cfr-plus": _modulate_cfr_plus,
    "monte-carlo": _modulate_monte_carlo,
    "timesfm": _modulate_timesfm,
    "timesfm-forecaster": _modulate_timesfm,
    "dream-rsi": _modulate_dream,
    "dream-timesfm": _modulate_dream,
    "pmev-dream": _modulate_dream,
    "shannon-entropy": _modulate_shannon,
    "prospect-theory": _modulate_prospect_theory,
    "libratus": _modulate_generic_framework,
    "antevisao": _modulate_generic_framework,
    "systems-theory": _modulate_generic_framework,
    "universal-importer": _modulate_generic_framework,
}


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
        modulator = _SOLVER_MODULATORS.get(solver_key)
        signals = modulator(params, noul, choice, ruin_priority) if modulator else {}
        return params, signals

    @classmethod
    def _build_bridge_result(
        cls,
        solver_key: str,
        state_desc: str | dict[str, Any],
        pred: LayaPrediction,
        base_parameters: dict[str, Any] | None,
        *,
        is_multiway: bool = False,
    ) -> LayaSolverBridgeResult:
        """Constroi LayaSolverBridgeResult unificado sem duplicar logica entre single/multiway."""
        params = dict(base_parameters or {})
        intent = classificar_intencao(state_desc)
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
        if isinstance(pred.answers, dict) and pred.answers:
            framework_signals["s1_answers"] = pred.answers

        p = pred.provenia
        suffix = "-multiway" if is_multiway else ""
        extra_assumption = "multiway-table-batch" if is_multiway else "ruin-priority-injected"
        provenia = Provenia(
            engine_id=f"laya-solver-adapter-{solver_key}{suffix}",
            implementation_level=p.implementation_level,
            runtime_used=p.runtime_used,
            model_used=p.model_used,
            intended_model=p.intended_model,
            weights_loaded=p.weights_loaded,
            fallback_used=p.fallback_used,
            assumptions=p.assumptions + [f"solver-adapted={solver_key}", extra_assumption],
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
    def adapt_for_solver(
        cls,
        solver_name: str,
        state_text_or_dict: str | dict[str, Any] | LayaPrediction,
        base_parameters: dict[str, Any] | None = None,
        *,
        questions: dict[str, dict[str, Any]] | None = None,
        use_cascade: bool = False,
        min_confidence: float | None = None,
    ) -> LayaSolverBridgeResult:
        """Traduz a entrada S1 (Laya / Gemini Decision 1) em parametros para o solver requisitado."""
        solver_key = solver_name.lower().strip()
        if solver_key not in cls.SOLVERS_SUPORTADOS:
            solver_key = "universal-importer"

        if isinstance(state_text_or_dict, LayaPrediction):
            pred = state_text_or_dict
            state_desc: str | dict[str, Any] = str(pred.answers or pred.choice or "")
        elif use_cascade:
            from llm.gemini_decisions import decide_s1, default_min_confidence  # noqa: PLC0415

            qs = _select_cascade_questions(solver_key, questions)
            eff_conf = default_min_confidence() if min_confidence is None else min_confidence
            try:
                decision = decide_s1(state_text_or_dict, qs, min_confidence=eff_conf)
                pred = _decision_result_to_laya_prediction(decision)
            except RuntimeError as exc:
                logger.debug("Cascata S1 indisponivel para %s (%s); usando laya_predict local.", solver_key, exc)
                pred = laya_predict(state_text_or_dict, questions=questions)
            state_desc = state_text_or_dict
        else:
            pred = laya_predict(state_text_or_dict, questions=questions)
            state_desc = state_text_or_dict

        return cls._build_bridge_result(solver_key, state_desc, pred, base_parameters, is_multiway=False)

    @classmethod
    def adapt_for_multiway_table(
        cls,
        solver_name: str,
        player_states: list[dict[str, Any] | str],
        base_parameters: dict[str, Any] | None = None,
    ) -> list[LayaSolverBridgeResult]:
        """Processa lote heterogeneo de estados de multiplos jogadores (ex: 9-max FT)."""
        solver_key = solver_name.lower().strip()
        if solver_key not in cls.SOLVERS_SUPORTADOS:
            solver_key = "universal-importer"
        requests = [{"state": s, "questions": LAYA_POKER_PRESETS["street_triage"]} for s in player_states]
        predictions = predict_batch(requests, batch_size=len(player_states), model_override=CANONICAL_LAYA_MODEL)
        return [
            cls._build_bridge_result(solver_key, player_states[i], pred, base_parameters, is_multiway=True)
            for i, pred in enumerate(predictions)
        ]
