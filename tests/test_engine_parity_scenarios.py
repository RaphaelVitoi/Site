"""Lado Python do corpus compartilhado de paridade matematica."""

from __future__ import annotations

import json
import math
from pathlib import Path

from engine.canonical_poker_theory import (
    ChenClairvoyanceSolver,
    JandaGeometricBetSizing,
    JandaMDFCalculator,
    JandaStreetBluffValueRatio,
)
from engine.game_theory_solvers import PluribusDepthLimitedSolver, PluribusMultiwayState, Street
from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_aula12_evidence import load_aula12_pairs
from engine.pmev_scenario import Read

SCENARIOS_PATH = Path(__file__).resolve().parents[1] / "data" / "engine_parity_scenarios.json"


def _corpus() -> dict:
    return json.loads(SCENARIOS_PATH.read_text(encoding="utf-8"))


def test_python_obedece_corpus_compartilhado_de_paridade() -> None:
    corpus = _corpus()
    tolerance = corpus["absolute_tolerance"]
    scenarios = corpus["scenarios"]

    for pmev in scenarios["pmev_multiway_liability"]:
        pmev_input = pmev["input"]
        state = PluribusMultiwayState(
            pot=pmev_input["pot"],
            num_players=pmev_input["num_players"],
            street=Street.FLOP,
            active_stacks=[100.0] * pmev_input["num_players"],
            lambda_factor=pmev_input["lambda_factor"],
        )
        assert math.isclose(
            state.compute_multiway_structural_liability(),
            pmev["expected"]["structural_liability"],
            abs_tol=tolerance,
        ), pmev["id"]

    for horizon in scenarios["pluribus_horizon_heuristic"]:
        horizon_input = horizon["input"]
        horizon_expected = horizon["expected"]
        horizon_result = PluribusDepthLimitedSolver(
            PluribusMultiwayState(
                pot=horizon_input["pot"],
                num_players=horizon_input["num_players"],
                street=Street(horizon_input["street"]),
                active_stacks=horizon_input["active_stacks"],
                lambda_factor=horizon_input["lambda_factor"],
            )
        ).solve_depth_limited(
            equity=horizon_input["equity"],
            hero_position=horizon_input["hero_position"],
            depth_streets=horizon_input["depth_streets"],
            iterations=horizon_input["iterations"],
        )
        for key in (
            "effective_stack",
            "stack_to_pot_ratio",
            "call_cost",
            "raise_cost",
            "future_streets",
            "horizon_liability",
        ):
            assert math.isclose(horizon_result[key], horizon_expected[key], abs_tol=tolerance), horizon["id"]
        assert math.isclose(horizon_result["action_evs"]["CALL"], horizon_expected["call_ev"], abs_tol=tolerance), (
            horizon["id"]
        )
        assert math.isclose(
            horizon_result["action_evs"]["RAISE_POT"], horizon_expected["raise_ev"], abs_tol=tolerance
        ), horizon["id"]

    for chen in scenarios["chen_indifference"]:
        chen_result = ChenClairvoyanceSolver.solve(**chen["input"])
        assert math.isclose(chen_result.alpha, chen["expected"]["alpha"], abs_tol=tolerance), chen["id"]
        assert math.isclose(
            chen_result.defense_frequency,
            chen["expected"]["defense_frequency"],
            abs_tol=tolerance,
        ), chen["id"]
        assert math.isclose(
            chen_result.game_value_player_x,
            chen["expected"]["game_value"],
            abs_tol=tolerance,
        ), chen["id"]

    for mdf in scenarios["janda_mdf"]:
        mdf_result = JandaMDFCalculator.calculate_mdf(**mdf["input"])
        assert math.isclose(mdf_result.alpha, mdf["expected"]["alpha"], abs_tol=tolerance), mdf["id"]
        assert math.isclose(mdf_result.mdf, mdf["expected"]["mdf"], abs_tol=tolerance), mdf["id"]
        assert math.isclose(
            mdf_result.individual_mdf,
            mdf["expected"]["individual_mdf"],
            abs_tol=tolerance,
        ), mdf["id"]

    for sizing in scenarios["janda_geometric_sizing"]:
        sizing_result = JandaGeometricBetSizing.calculate_geometric_sizing(**sizing["input"])
        assert math.isclose(
            sizing_result.pot_fraction_percentage,
            sizing["expected"]["pot_fraction_percentage"],
            abs_tol=tolerance,
        ), sizing["id"]
        assert math.isclose(
            sizing_result.steps[-1].remaining_stack_after_bet,
            sizing["expected"]["final_stack"],
            abs_tol=tolerance,
        ), sizing["id"]

    for bluff in scenarios["janda_bluff_ratios"]:
        bluff_result = JandaStreetBluffValueRatio.calculate_ratios(bluff["input"]["bet_fraction_of_pot"])
        assert math.isclose(
            bluff_result.river_bluff_to_value_ratio,
            bluff["expected"]["river_bluff_to_value_ratio"],
            abs_tol=tolerance,
        ), bluff["id"]
        assert math.isclose(
            bluff_result.turn_bluff_to_value_ratio,
            bluff["expected"]["turn_bluff_to_value_ratio"],
            abs_tol=tolerance,
        ), bluff["id"]
        assert math.isclose(
            bluff_result.flop_bluff_to_value_ratio,
            bluff["expected"]["flop_bluff_to_value_ratio"],
            abs_tol=tolerance,
        ), bluff["id"]


def test_python_obedece_icm_e_reprodutibilidade_do_corpus() -> None:
    """ICM e o baseline de toda reducao PMev; a Aula 1.2 e a unica evidencia transcrita. Tolerancia propria."""
    corpus = _corpus()
    tolerancias = corpus["family_tolerances"]

    for icm in corpus["scenarios"]["icm_malmuth_harville"]:
        atual = calculate_malmuth_harville_icm(icm["input"]["stacks"], icm["input"]["payouts"])
        esperado = icm["expected"]["equities"]
        assert len(atual) == len(esperado), icm["id"]
        for a, e in zip(atual, esperado, strict=True):
            assert math.isclose(a, e, abs_tol=tolerancias["icm_malmuth_harville"]), icm["id"]

    pares = {par.key: par for par in load_aula12_pairs()}
    for caso in corpus["scenarios"]["aula12_reproducibility"]:
        par, esperado = pares[caso["input"]["pair"]], caso["expected"]
        avaliacao = par.contract.assess_reproducibility()
        assert avaliacao.reproducible is esperado["reproducible"], caso["id"]
        assert avaliacao.missing_chip_ev == esperado["missing_chip_ev"], caso["id"]
        assert avaliacao.missing_icm_ev == esperado["missing_icm_ev"], caso["id"]
        for lado, chave in ((par.chip_ev, "frequency_sum_chip_ev"), (par.icm_ev, "frequency_sum_icm_ev")):
            soma = sum(a.frequency_pct.value for a in lado.actions if isinstance(a.frequency_pct, Read))
            assert math.isclose(soma, esperado[chave], abs_tol=tolerancias["aula12_reproducibility"]), caso["id"]
