"""Game-theory HTTP handlers -- Pluribus, DeepStack, Rebel PBS e Claudico.

Extraido de handlers.py na Fase 3 da auditoria SOTA (2026-11-17), seguindo o
precedente de handlers_canonical.py: handlers.py re-exporta estes nomes para
manter o contrato de importacao dos consumidores.
"""

from __future__ import annotations

import asyncio
import math
import time
from typing import Any

from aiohttp import web
from pydantic import ValidationError

from api.v1.handler_support import INVALID_JSON_BODY, _internal_error, _with_execution_provenance, read_json_object
from core.game_theory_schemas import (
    ClaudicoTranslateRequest,
    ClaudicoTranslateResponse,
    DeepStackResolveRequest,
    DeepStackResolveResponse,
    PluribusSolveRequest,
    PluribusSolveResponse,
    RebelPbsEvaluateRequest,
    RebelPbsEvaluateResponse,
)
from engine.game_theory_solvers import (
    ClaudicoActionTranslator,
    ContinualResolvingEngine,
    DeepStackSubgame,
    PluribusDepthLimitedSolver,
    PluribusMultiwayState,
    PublicBeliefState,
    Street,
)
from llm.laya_solver_adapter import LayaSolverAdapter


async def handle_pluribus_solve(request: web.Request) -> web.Response:
    """Resolve uma decisao multiway com horizonte finito e passivo quadratico PMev."""
    t_start = time.perf_counter()
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    try:
        req = PluribusSolveRequest.model_validate(data)
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)

    def _execute_pluribus() -> tuple[dict[str, Any], dict[str, Any], int]:
        # Adaptacao S1 (Laya) para Pluribus se request trouxer prompt ou metadata
        adapted_iters = req.iterations
        adapted_lambda = req.state.lambda_factor
        laya_meta: dict[str, Any] = {}
        if getattr(req, "prompt", None) or getattr(req, "intencao_s1", None):
            query_text = getattr(req, "prompt", "") or str(getattr(req, "intencao_s1", ""))
            bridge_res = LayaSolverAdapter.adapt_for_solver(
                "pluribus",
                query_text,
                {"iterations": req.iterations, "lambda_factor": req.state.lambda_factor},
                use_cascade=True,
            )
            adapted_iters = max(1, min(1000, int(bridge_res.adapted_parameters.get("iterations", req.iterations))))
            adapted_lambda = max(
                0.0, min(5.0, float(bridge_res.adapted_parameters.get("lambda_factor", req.state.lambda_factor)))
            )
            laya_meta = {
                "laya_adapted": True,
                "engine_id": bridge_res.provenia.engine_id,
                "ruin_priority": bridge_res.ruin_priority,
                "framework_signals": bridge_res.framework_signals,
            }

        state = PluribusMultiwayState(
            pot=req.state.pot,
            num_players=req.state.num_players,
            street=Street(req.state.street.value),
            active_stacks=req.state.active_stacks,
            lambda_factor=adapted_lambda,
        )
        solver = PluribusDepthLimitedSolver(state)
        res_solve = solver.solve_depth_limited(
            equity=req.equity,
            hero_position=req.hero_position,
            depth_streets=req.depth_streets,
            iterations=adapted_iters,
        )
        return res_solve, laya_meta, adapted_iters

    try:
        solve_result, laya_meta, adapted_iters = await asyncio.to_thread(_execute_pluribus)
        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

        resp = PluribusSolveResponse(
            status="SUCCESS",
            optimal_action=solve_result["optimal_action"],
            strategy=solve_result["strategy"],
            structural_liability=round(float(solve_result["structural_liability"]), 4),
            effective_equity=round(float(solve_result["effective_equity"]), 4),
            pos_multiplier=round(float(solve_result["pos_multiplier"]), 4),
            k_opponents=solve_result["k_opponents"],
            depth_streets=solve_result["depth_streets"],
            future_streets=solve_result["future_streets"],
            effective_stack=round(float(solve_result["effective_stack"]), 4),
            stack_to_pot_ratio=round(float(solve_result["stack_to_pot_ratio"]), 4),
            call_cost=round(float(solve_result["call_cost"]), 4),
            raise_cost=round(float(solve_result["raise_cost"]), 4),
            horizon_liability=round(float(solve_result["horizon_liability"]), 4),
            action_evs={key: round(float(value), 4) for key, value in solve_result["action_evs"].items()},
            iterations_run=adapted_iters,
            execution_time_ms=elapsed_ms,
        )
        payload = resp.model_dump()
        if laya_meta:
            payload["laya_s1_adaptation"] = laya_meta
        return web.json_response(_with_execution_provenance(payload, "pluribus-multiway-adapter"))
    except Exception as e:
        return _internal_error(e, "handle_pluribus_solve", status="ERROR")


def _aggregate_action_frequencies(
    raw_strategy: dict[str, dict[str, float]],
    ranges_ip: dict[str, float],
) -> dict[str, float]:
    """Agrega frequencias de acoes do raw strategy ponderadas pela range IP.

    Extraido de handle_deepstack_resolve para reduzir complexidade cognitiva (S3776).
    """
    actions = ["CHECK", "BET_HALF_POT", "BET_POT", "ALL_IN"]
    agg_freqs: dict[str, float] = dict.fromkeys(actions, 0.0)
    total_weight = sum(ranges_ip.values())
    if total_weight <= 1e-9:
        return {a: 1.0 / len(actions) for a in actions}
    for hand, strat in raw_strategy.items():
        hand_prob = ranges_ip.get(hand, 0.0) / total_weight
        for a, prob in strat.items():
            agg_freqs[a] += prob * hand_prob
    return agg_freqs


async def handle_deepstack_resolve(request: web.Request) -> web.Response:
    """Executa o Continual Resolving no estilo DeepStack ancorado em Gadget Bounds."""
    t_start = time.perf_counter()
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    try:
        req = DeepStackResolveRequest.model_validate(data)
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)

    def _execute_deepstack() -> tuple[
        dict[str, float], dict[str, dict[str, float]], dict[str, float], dict[str, Any], int
    ]:
        # Adaptacao S1 (Laya) para DeepStack se request trouxer prompt ou metadata
        adapted_iters = req.iterations
        laya_meta: dict[str, Any] = {}
        if getattr(req, "prompt", None) or getattr(req, "intencao_s1", None):
            query_text = getattr(req, "prompt", "") or str(getattr(req, "intencao_s1", ""))
            bridge_res = LayaSolverAdapter.adapt_for_solver(
                "deepstack",
                query_text,
                {"tolerance": float(getattr(req, "tolerance", 0.01))},
                use_cascade=True,
            )
            adapted_iters = (
                int(req.iterations * (1.0 - bridge_res.s1_prediction.noul * 0.2))
                if bridge_res.s1_prediction.noul
                else req.iterations
            )
            adapted_iters = max(1, min(1000, adapted_iters))
            laya_meta = {
                "laya_adapted": True,
                "engine_id": bridge_res.provenia.engine_id,
                "ruin_priority": bridge_res.ruin_priority,
                "framework_signals": bridge_res.framework_signals,
            }

        subgame = DeepStackSubgame(
            street=Street(req.street.value),
            pot=req.pot,
            ranges_ip=req.ranges_ip,
            ranges_oop=req.ranges_oop,
            opponent_cfvs=req.opponent_cfvs,
        )
        gadget_bounds = subgame.compute_gadget_game_bounds()
        raw_strategy = ContinualResolvingEngine.resolve_subgame(subgame, iterations=adapted_iters)

        agg_freqs = _aggregate_action_frequencies(raw_strategy, req.ranges_ip)
        return gadget_bounds, raw_strategy, {k: round(v, 4) for k, v in agg_freqs.items()}, laya_meta, adapted_iters

    try:
        gadget_bounds, strategy, agg_freqs, laya_meta, adapted_iters = await asyncio.to_thread(_execute_deepstack)
        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

        resp = DeepStackResolveResponse(
            status="SUCCESS",
            street=req.street,
            pot=req.pot,
            gadget_game_bounds={k: round(v, 4) for k, v in gadget_bounds.items()},
            strategy=strategy,
            aggregated_action_frequencies=agg_freqs,
            iterations_run=adapted_iters,
            execution_time_ms=elapsed_ms,
        )
        payload = resp.model_dump()
        if laya_meta:
            payload["laya_s1_adaptation"] = laya_meta
        return web.json_response(_with_execution_provenance(payload, "deepstack-continual-resolving-adapter"))
    except Exception as e:
        return _internal_error(e, "handle_deepstack_resolve", status="ERROR")


async def handle_rebel_pbs_evaluate(request: web.Request) -> web.Response:
    """Avalia o Public Belief State (PBS) computando entropias de range."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    try:
        req = RebelPbsEvaluateRequest.model_validate(data)
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)

    try:
        pbs = PublicBeliefState.from_ranges(
            board=req.board,
            pot=req.pot,
            hero_range=req.hero_range,
            villain_range=req.villain_range,
        )

        h_total = sum(req.hero_range.values())
        v_total = sum(req.villain_range.values())
        is_valid = math.isclose(h_total, 1.0, abs_tol=0.05) and math.isclose(v_total, 1.0, abs_tol=0.05)

        alert = None
        if pbs.villain_range_entropy < 1.0 and len(req.villain_range) > 3:
            alert = "ALERTA: Range do adversario altamente polarizado (entropia < 1.0 bit)."

        resp = RebelPbsEvaluateResponse(
            status="SUCCESS",
            board=pbs.board,
            pot=pbs.pot,
            hero_range_entropy=round(pbs.hero_range_entropy, 4),
            villain_range_entropy=round(pbs.villain_range_entropy, 4),
            is_terminal=pbs.is_terminal,
            board_card_count=len(pbs.board),
            normalized_ranges_valid=is_valid,
            entropy_delta_alert=alert,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "rebel-pbs-adapter"))
    except Exception as e:
        return _internal_error(e, "handle_rebel_pbs_evaluate", status="ERROR")


async def handle_claudico_translate_action(request: web.Request) -> web.Response:
    """Mapeia uma aposta fora da arvore para as opcoes discretas vizinhas."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)
    try:
        req = ClaudicoTranslateRequest.model_validate(data)

        mapping = ClaudicoActionTranslator.pseudo_harmonic_mapping(
            actual_bet=req.actual_bet,
            allowed_bets=req.allowed_bets,
            pot_size=req.pot_size,
        )
        resp = ClaudicoTranslateResponse(
            status="SUCCESS",
            mapped_distribution={k: round(v, 4) for k, v in mapping.items()},
            target_bet=req.actual_bet,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "claudico-action-translator"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_claudico_translate_action", status="ERROR")
