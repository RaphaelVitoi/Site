# tests/test_api_game_theory_handlers.py
# pylint: disable=protected-access
"""Testes de integracao e contrato REST para os endpoints de Teoria dos Jogos SOTA:

- POST /api/v1/game-theory/pluribus/solve
- POST /api/v1/game-theory/deepstack/resolve
- POST /api/v1/game-theory/rebel/pbs/evaluate
- POST /api/v1/game-theory/claudico/translate-action
"""

from __future__ import annotations

import json
import math

import pytest
from aiohttp import web
from aiohttp.test_utils import make_mocked_request

from api.v1.handlers import (
    handle_claudico_translate_action,
    handle_deepstack_resolve,
    handle_pluribus_solve,
    handle_rebel_pbs_evaluate,
)


@pytest.mark.asyncio
async def test_handle_pluribus_solve_success():
    """Valida a resolucao multiway com penalidade PMev via endpoint HTTP."""
    app = web.Application()
    payload = {
        "state": {
            "pot": 100.0,
            "num_players": 4,
            "street": "flop",
            "active_stacks": [100.0, 100.0, 100.0, 100.0],
            "lambda_factor": 2.25,
        },
        "equity": 0.75,
        "hero_position": "BTN",
        "depth_streets": 1,
        "iterations": 50,
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/game-theory/pluribus/solve",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_pluribus_solve(req)
    assert resp.status == 200
    assert resp.text is not None
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert "optimal_action" in data
    assert math.isclose(data["structural_liability"], 90.0)
    assert data["iterations_run"] == 50
    assert data["execution_time_ms"] > 0
    total_prob = sum(data["strategy"].values())
    assert math.isclose(total_prob, 1.0, abs_tol=1e-3)


@pytest.mark.asyncio
async def test_handle_pluribus_solve_validation_error():
    """Valida rejeicao 400 em caso de payload invalido."""
    app = web.Application()
    req = make_mocked_request(
        "POST",
        "/api/v1/game-theory/pluribus/solve",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps({"invalid_field": True}).encode("utf-8")

    resp = await handle_pluribus_solve(req)
    assert resp.status == 400


@pytest.mark.asyncio
async def test_handle_deepstack_resolve_success():
    """Valida Continual Resolving com limites de Gadget Game via HTTP."""
    app = web.Application()
    payload = {
        "street": "flop",
        "pot": 20.0,
        "ranges_ip": {"AA": 0.5, "KK": 0.5},
        "ranges_oop": {"QQ": 0.4, "JJ": 0.6},
        "opponent_cfvs": {"QQ": 8.0, "JJ": 5.0},
        "iterations": 50,
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/game-theory/deepstack/resolve",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_deepstack_resolve(req)
    assert resp.status == 200
    assert resp.text is not None
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert "gadget_game_bounds" in data
    assert "strategy" in data
    assert "aggregated_action_frequencies" in data
    assert "AA" in data["strategy"]
    assert "KK" in data["strategy"]


@pytest.mark.asyncio
async def test_handle_rebel_pbs_evaluate_success():
    """Valida calculo de Public Belief State e entropia de range via HTTP."""
    app = web.Application()
    payload = {
        "board": ["Ah", "Kd", "2c"],
        "pot": 30.0,
        "hero_range": {"AA": 0.25, "KK": 0.25, "AKs": 0.50},
        "villain_range": {"QQ": 0.50, "JJ": 0.50},
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/game-theory/rebel/pbs/evaluate",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_rebel_pbs_evaluate(req)
    assert resp.status == 200
    assert resp.text is not None
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert data["board"] == ["Ah", "Kd", "2c"]
    assert data["hero_range_entropy"] > 0
    assert data["villain_range_entropy"] > 0
    assert data["board_card_count"] == 3


@pytest.mark.asyncio
async def test_handle_claudico_translate_action_success():
    """Valida mapeamento pseudo-harmonico de aposta off-tree via HTTP."""
    app = web.Application()
    payload = {
        "actual_bet": 15.0,
        "allowed_bets": [10.0, 20.0, 50.0],
        "pot_size": 20.0,
    }

    req = make_mocked_request(
        "POST",
        "/api/v1/game-theory/claudico/translate-action",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_claudico_translate_action(req)
    assert resp.status == 200
    assert resp.text is not None
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert data["target_bet"] == 15.0
    dist = data["mapped_distribution"]
    assert "10.0" in dist or 10.0 in dist
    assert "20.0" in dist or 20.0 in dist
    total_weight = sum(dist.values())
    assert math.isclose(total_weight, 1.0)
