"""Testes da Fase 5: Laya Solver Adapter (interface genérica S1 -> Solvers & Frameworks).

Cubrem:
  - Adaptação para Pluribus, DeepStack, CFR+, PMev, Shannon, Prospect Theory, Libratus, Systems Theory, Antevisão.
  - Modulação correta de parâmetros (ruin_priority, iterations, lambda_factor, tolerance, loss_aversion_lambda).
  - Preservação da proveniência §4 em todas as saídas.
  - Comportamento robusto com fallback heurístico.
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
        """DeepStack deve ajustar a tolerância do continual resolving."""
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
        """Prospect Theory deve modular o coeficiente de aversão à perda (lambda)."""
        res = LayaSolverAdapter.adapt_for_solver(
            "prospect-theory",
            "Loss aversion decision under risk.",
            {"loss_aversion_lambda": 2.25},
        )
        assert res.target_solver == "prospect-theory"
        assert res.adapted_parameters["loss_aversion_lambda"] >= 2.25

    def test_adapt_for_frameworks_genericos(self):
        """Frameworks genéricos (Libratus, Shannon, Systems Theory, Antevisão) respondem corretamente."""
        for fw in ["libratus", "shannon-entropy", "systems-theory", "antevisao"]:
            res = LayaSolverAdapter.adapt_for_solver(fw, "General strategic analysis query.")
            assert res.target_solver == fw
            assert res.provenia is not None
            assert res.provenia.fallback_used is True  # CPU-safe default

    def test_solver_desconhecido_cai_no_default(self):
        """Solver desconhecido deve cair em universal-importer com segurança."""
        res = LayaSolverAdapter.adapt_for_solver("solver-fantasma-xyz", "Test input")
        assert res.target_solver == "universal-importer"
        assert res.provenia.engine_id == "laya-solver-adapter-universal-importer"

    def test_provenia_sempre_presente_e_valida(self):
        """Toda resposta do adaptador DEVE incluir proveniência §4 completa."""
        res = LayaSolverAdapter.adapt_for_solver("cfr-plus", "Test CFR+ state")
        p = res.provenia
        assert p.engine_id is not None
        assert p.implementation_level in {"primitive", "trained-model", "heuristic"}
        assert isinstance(p.assumptions, list)
        assert isinstance(p.units, list)
        assert len(p.assumptions) > 0
