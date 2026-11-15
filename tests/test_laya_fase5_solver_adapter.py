"""Testes da Fase 5: Laya Solver Adapter (interface generica S1 -> Solvers & Frameworks).

Cubrem:
  - Adaptacao para Pluribus, DeepStack, CFR+, PMev, Shannon, Prospect Theory, Libratus, Systems Theory, Antevisao.
  - Modulacao correta de parametros (ruin_priority, iterations, lambda_factor, tolerance, loss_aversion_lambda).
  - Preservacao da proveniencia Secao 4 em todas as saidas.
  - Comportamento robusto com fallback heuristico.
"""

import pytest

from llm.laya_solver_adapter import LayaSolverAdapter, LayaSolverBridgeResult


class TestLayaSolverAdapter:
    """Valida o adaptador universal Laya -> Solvers / Frameworks."""

    def test_adapt_for_pluribus_modula_iterations(self):
        """Pluribus deve modular iterations e lambda_factor com base no sinal S1."""
        res = LayaSolverAdapter.adapt_for_solver(
            "pluribus",
            "Multiway action on turn with complex board texture.",
            {"iterations": 400, "lambda_factor": 1.0},
        )
        assert isinstance(res, LayaSolverBridgeResult)
        assert res.target_solver == "pluribus"
        assert res.adapted_parameters["iterations"] >= 400
        assert res.adapted_parameters["lambda_factor"] >= 1.0
        assert res.provenia.engine_id == "laya-solver-adapter-pluribus"

    def test_adapt_for_deepstack_modula_tolerance(self):
        """DeepStack deve ajustar a tolerancia do continual resolving."""
        res = LayaSolverAdapter.adapt_for_solver(
            "deepstack",
            "River decision under uncertainty.",
            {"tolerance": 0.005},
        )
        assert res.target_solver == "deepstack"
        assert res.adapted_parameters["tolerance"] >= 0.005

    def test_adapt_for_pmev_injetar_ruin_prior(self):
        """PMev Perspective Engine deve receber ruin_prior modulado."""
        res = LayaSolverAdapter.adapt_for_solver(
            "pmev-perspective",
            "Non-ergodic tournament bubble decision.",
            {"pot": 1000},
        )
        assert res.target_solver == "pmev-perspective"
        assert "ruin_prior" in res.adapted_parameters
        assert 1.0 <= res.adapted_parameters["ruin_prior"] <= 1.30
        assert res.ruin_priority == res.adapted_parameters["ruin_prior"]

    def test_adapt_for_prospect_theory_modula_lambda(self):
        """Prospect Theory deve modular o coeficiente de aversao a perda (lambda)."""
        res = LayaSolverAdapter.adapt_for_solver(
            "prospect-theory",
            "Loss aversion decision under risk.",
            {"loss_aversion_lambda": 2.25},
        )
        assert res.target_solver == "prospect-theory"
        assert res.adapted_parameters["loss_aversion_lambda"] >= 2.25

    def test_adapt_for_frameworks_genericos(self, monkeypatch):
        """Frameworks genericos (Libratus, Shannon, Systems Theory, Antevisao) respondem corretamente."""
        monkeypatch.setenv("CHICO_LAYA_PREDICT_ALLOW_CPU", "0")
        for fw in ["libratus", "shannon-entropy", "systems-theory", "antevisao"]:
            res = LayaSolverAdapter.adapt_for_solver(fw, "General strategic analysis query.")
            assert res.target_solver == fw
            assert res.provenia is not None
            assert res.provenia.fallback_used is True  # CPU-safe default

    def test_solver_desconhecido_cai_no_default(self):
        """Solver desconhecido deve cair em universal-importer com seguranca."""
        res = LayaSolverAdapter.adapt_for_solver("solver-fantasma-xyz", "Test input")
        assert res.target_solver == "universal-importer"
        assert res.provenia.engine_id == "laya-solver-adapter-universal-importer"

    def test_adapt_for_monte_carlo_modula_amostragem_e_ruina(self):
        """Monte Carlo deve modular contagem de simulacoes e prior de ruina."""
        res = LayaSolverAdapter.adapt_for_solver(
            "monte-carlo",
            "Multiway all-in preflop simulation.",
            {"simulations_count": 10000, "confidence_level": 0.95},
        )
        assert res.target_solver == "monte-carlo"
        assert res.adapted_parameters["simulations_count"] >= 10000
        assert 1.0 <= res.adapted_parameters["ruin_prior"] <= 1.30
        assert res.framework_signals["ruin_barrier_factor"] == res.adapted_parameters["ruin_prior"]
        assert "laya-solver-adapter-monte-carlo" in res.provenia.engine_id

    def test_adapt_for_timesfm_modula_horizonte_e_quantil(self):
        """TimesFM deve modular horizonte e foco de quantil com base no sinal S1."""
        res = LayaSolverAdapter.adapt_for_solver(
            "timesfm",
            "Long-term bankroll and EV trajectory volatility.",
            {"horizon": 5, "mode": "commercial"},
        )
        assert res.target_solver == "timesfm"
        assert res.adapted_parameters["horizon"] >= 5
        assert res.adapted_parameters["quantile_focus"] in {"quantile_50", "quantile_90"}
        assert res.adapted_parameters["preferred_model"] == "timesfm-2.5-200m"
        assert "timesfm_volatility_prior" in res.framework_signals

    def test_adapt_for_dream_rsi_modula_poda_preditiva(self):
        """Google Dream-RSI deve calibrar margem de poda e pre-filtragem S1."""
        res = LayaSolverAdapter.adapt_for_solver(
            "dream-rsi",
            "DiscoveryTree exploration loop with potential plateau.",
            {"pruning_margin": 0.02},
        )
        assert res.target_solver == "dream-rsi"
        assert res.adapted_parameters["pruning_margin"] >= 0.02
        assert "s1_pruning_threshold" in res.adapted_parameters
        assert res.framework_signals["s1_pre_filtering_enabled"] is True

    def test_provenia_sempre_presente_e_valida(self):
        """Toda resposta do adaptador DEVE incluir proveniencia Secao 4 completa."""
        res = LayaSolverAdapter.adapt_for_solver("cfr-plus", "Test CFR+ state")
        p = res.provenia
        assert p.engine_id is not None
        assert p.implementation_level in {"primitive", "trained-model", "heuristic"}
        assert isinstance(p.assumptions, list)
        assert isinstance(p.units, list)
        assert len(p.assumptions) > 0
        assert res.framework_signals.get("cfr_regret_matching_plus") is True

    def test_adapt_for_solver_cascade_usa_poker_preset_e_preserva_respostas(self, monkeypatch):
        """use_cascade=True seleciona street_triage para poker solvers e preserva answers/probabilities."""
        from llm.gemini_decisions import DecisionResult  # noqa: PLC0415
        from llm.laya_bridge import Provenia  # noqa: PLC0415

        captured: dict = {}

        def fake_decide_s1(state, questions, **kwargs):
            captured["questions"] = questions
            captured["min_confidence"] = kwargs.get("min_confidence")
            return DecisionResult(
                answers={
                    "board_texture": {
                        "type": "choice",
                        "choice": "wet",
                        "confidence": 0.78,
                        "probabilities": {"dry": 0.12, "wet": 0.78, "monotone": 0.10},
                    },
                    "bubble_danger": {"type": "noul", "noul": 0.82, "confidence": 0.82},
                },
                engine="gemini-decision-1",
                model_used="gemini-decision-1",
                latency_ms=140.0,
                n_tokens=200,
                provenia=Provenia(
                    engine_id="gemini-decision-1",
                    implementation_level="trained-model",
                    runtime_used="google-genai v1beta (cloud)",
                    model_used="gemini-decision-1",
                    intended_model="gemini-decision-1",
                    weights_loaded=True,
                    fallback_used=False,
                    assumptions=[],
                    limitations=[],
                    units=["probability"],
                ),
            )

        monkeypatch.setattr("llm.gemini_decisions.decide_s1", fake_decide_s1)
        res = LayaSolverAdapter.adapt_for_solver(
            "pluribus",
            "BTN raises 2.2bb, Hero BB AQs 18bb FT",
            {"iterations": 500, "lambda_factor": 1.0},
            use_cascade=True,
        )
        assert "board_texture" in captured["questions"]
        assert "hero_perceived_line" in captured["questions"]
        assert captured["min_confidence"] == pytest.approx(0.55)
        assert res.adapted_parameters["iterations"] == 750  # 500 * 1.5 por wet + noul=0.82
        assert "s1_answers" in res.framework_signals
        assert res.framework_signals["s1_answers"]["board_texture"]["probabilities"]["wet"] == 0.78
