"""Adaptador Genérico S1 (Laya) para Solvers e Frameworks do Ecossistema SOTA.

Conecta a classificação System-1 (Laya) aos motores de Teoria dos Jogos e Frameworks:
  - Pluribus Depth-Limited Solver
  - DeepStack Continual Resolving Engine
  - CFR+ / Growing Tree CFR
  - Universal Importer / GTO Wizard / PioSolver
  - PMev Perspective Engine (Teorema de Ruína)
  - Frameworks declarados (CRF+, Libratus, Systems Theory, Shannon, Antevisão, Prospect Theory).

Invariantes:
  - Proveniência §4 em todas as respostas (data/engine_capabilities.json).
  - Lazy import: torch/laya carregam apenas sob demanda.
  - Fallback Heurístico robusto: nunca falha em host CPU ou sem dependência pesada.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any

from llm.laya_bridge import (
    LayaPrediction,
    Provenia,
    classificar_intencao,
    laya_predict,
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
    """Adaptador universal que traduz sinais S1 da Laya para parâmetros de Solvers."""

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
    }

    @staticmethod
    def _modulate_solver_parameters(
        solver_key: str,
        params: dict[str, Any],
        noul: float,
        choice: str,
        ruin_priority: float,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Extrai a lógica de modulação específica por solver (reduz complexidade cognitiva)."""
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
        state_text_or_dict: str | dict[str, Any],
        base_parameters: dict[str, Any] | None = None,
    ) -> LayaSolverBridgeResult:
        """Traduz a entrada S1 (Laya) em parâmetros específicos para o solver requisitado.

        Parameters
        ----------
        solver_name : str
            Nome do solver ou framework-alvo (ex: 'pluribus', 'deepstack', 'pmev-perspective').
        state_text_or_dict : str | dict
            Estado do jogo, prompt ou requisição textual analisada.
        base_parameters : dict | None
            Parâmetros base existentes que serão modulados pelo System-1.

        Returns
        -------
        LayaSolverBridgeResult com parâmetros adaptados e proveniência §4.
        """
        solver_key = solver_name.lower().strip()
        if solver_key not in cls.SOLVERS_SUPORTADOS:
            solver_key = "universal-importer"

        params = dict(base_parameters or {})
        pred = laya_predict(state_text_or_dict)
        intent = classificar_intencao(state_text_or_dict)

        nao_latin = intent.nao_latin_fraction_pct
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
