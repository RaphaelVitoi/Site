"""Testes da Fase 5: Laya Solver Adapter (interface generica S1 -> Solvers & Frameworks).

Cubrem:
  - Adaptacao para Pluribus, DeepStack, CFR+, PMev, Shannon, Prospect Theory, Libratus, Systems Theory, Antevisao.
  - Modulacao correta de parametros (ruin_priority, iterations, lambda_factor, tolerance, loss_aversion_lambda).
  - Preservacao da proveniencia Secao 4 em todas as saidas.
  - Comportamento robusto com fallback heuristico.
"""

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

    def test_adapt_for_frameworks_genericos(self):
        """Frameworks genericos (Libratus, Shannon, Systems Theory, Antevisao) respondem corretamente."""
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
