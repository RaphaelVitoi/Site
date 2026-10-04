"""Canonical analytic poker-theory HTTP handlers."""

from __future__ import annotations

from aiohttp import web
from pydantic import ValidationError

from api.v1.handler_support import _internal_error, _with_execution_provenance
from core.canonical_theory_schemas import (
    ChenAKQGameRequest,
    ChenAKQGameResponse,
    ChenClairvoyanceRequest,
    ChenClairvoyanceResponse,
    JandaBluffRatioRequest,
    JandaBluffRatioResponse,
    JandaGeometricSizingRequest,
    JandaGeometricSizingResponse,
    JandaGeometricStepSchema,
    JandaMDFRequest,
    JandaMDFResponse,
)
from engine.canonical_poker_theory import (
    ChenAKQGameSolver,
    ChenClairvoyanceSolver,
    JandaGeometricBetSizing,
    JandaMDFCalculator,
    JandaStreetBluffValueRatio,
)


async def handle_canonical_clairvoyance(request: web.Request) -> web.Response:
    """Resolve o Clairvoyance Game [0, 1] analiticamente (Chen & Ankenman, Cap. 11)."""
    try:
        data = await request.json()
        req = ChenClairvoyanceRequest.model_validate(data)
        sol = ChenClairvoyanceSolver.solve(pot=req.pot, bet=req.bet)
        resp = ChenClairvoyanceResponse(
            status="SUCCESS",
            pot=sol.pot,
            bet=sol.bet,
            alpha=sol.alpha,
            defense_frequency=sol.defense_frequency,
            value_bet_cutoff=sol.value_bet_cutoff,
            bluff_cutoff=sol.bluff_cutoff,
            game_value_player_x=sol.game_value_player_x,
            bluff_to_value_ratio=sol.bluff_to_value_ratio,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "chen-ankenman-analytic"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_canonical_clairvoyance", status="ERROR")


async def handle_canonical_akq(request: web.Request) -> web.Response:
    """Resolve o Jogo AKQ analiticamente (Chen & Ankenman, Cap. 13 & 15)."""
    try:
        data = await request.json()
        req = ChenAKQGameRequest.model_validate(data)
        sol = ChenAKQGameSolver.solve(pot=req.pot, bet=req.bet)
        resp = ChenAKQGameResponse(
            status="SUCCESS",
            pot=sol.pot,
            bet=sol.bet,
            hero_bet_ace_freq=sol.hero_bet_ace_freq,
            hero_check_king_freq=sol.hero_check_king_freq,
            hero_bluff_queen_freq=sol.hero_bluff_queen_freq,
            villain_call_ace_freq=sol.villain_call_ace_freq,
            villain_call_king_freq=sol.villain_call_king_freq,
            villain_fold_queen_freq=sol.villain_fold_queen_freq,
            game_value_hero=sol.game_value_hero,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "chen-ankenman-analytic"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_canonical_akq", status="ERROR")


async def handle_canonical_janda_mdf(request: web.Request) -> web.Response:
    """Calcula a Minimum Defense Frequency (MDF) e responsabilidade multiway (Janda, Partes 1 & 12)."""
    try:
        data = await request.json()
        req = JandaMDFRequest.model_validate(data)
        res = JandaMDFCalculator.calculate_mdf(pot=req.pot, bet=req.bet, num_defenders=req.num_defenders)
        resp = JandaMDFResponse(
            status="SUCCESS",
            pot=res.pot,
            bet=res.bet,
            alpha=res.alpha,
            mdf=res.mdf,
            mdf_percentage=res.mdf_percentage,
            pot_odds_percentage=res.pot_odds_percentage,
            is_multiway=res.is_multiway,
            num_defenders=res.num_defenders,
            individual_mdf=res.individual_mdf,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "janda-analytic"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_canonical_janda_mdf", status="ERROR")


async def handle_canonical_geometric_sizing(request: web.Request) -> web.Response:
    """Calcula o Dimensionamento Geometrico de Apostas multi-rua (Janda, Partes 3 & 14)."""
    try:
        data = await request.json()
        req = JandaGeometricSizingRequest.model_validate(data)
        res = JandaGeometricBetSizing.calculate_geometric_sizing(
            pot=req.pot,
            effective_stack=req.effective_stack,
            num_streets=req.num_streets,
        )
        resp = JandaGeometricSizingResponse(
            status="SUCCESS",
            starting_pot=res.starting_pot,
            effective_stack=res.effective_stack,
            target_final_pot=res.target_final_pot,
            num_streets=res.num_streets,
            constant_pot_fraction=res.constant_pot_fraction,
            pot_fraction_percentage=res.pot_fraction_percentage,
            steps=[
                JandaGeometricStepSchema(
                    street_index=s.street_index,
                    street_name=s.street_name,
                    starting_pot=s.starting_pot,
                    bet_size=s.bet_size,
                    pot_fraction=s.pot_fraction,
                    final_pot_if_called=s.final_pot_if_called,
                    remaining_stack_after_bet=s.remaining_stack_after_bet,
                )
                for s in res.steps
            ],
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "janda-analytic"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_canonical_geometric_sizing", status="ERROR")


async def handle_canonical_bluff_ratios(request: web.Request) -> web.Response:
    """Calcula as razoes de blefe para valor por rua (Janda, Parte 5)."""
    try:
        data = await request.json()
        req = JandaBluffRatioRequest.model_validate(data)
        res = JandaStreetBluffValueRatio.calculate_ratios(bet_fraction=req.bet_fraction_of_pot)
        resp = JandaBluffRatioResponse(
            status="SUCCESS",
            bet_fraction_of_pot=res.bet_fraction_of_pot,
            alpha=res.alpha,
            river_bluff_to_value_ratio=res.river_bluff_to_value_ratio,
            river_bluff_percentage=res.river_bluff_percentage,
            turn_bluff_to_value_ratio=res.turn_bluff_to_value_ratio,
            turn_bluff_percentage=res.turn_bluff_percentage,
            flop_bluff_to_value_ratio=res.flop_bluff_to_value_ratio,
            flop_bluff_percentage=res.flop_bluff_percentage,
        )
        return web.json_response(_with_execution_provenance(resp.model_dump(), "janda-analytic"))
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_canonical_bluff_ratios", status="ERROR")
