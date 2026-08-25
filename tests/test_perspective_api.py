# tests/test_perspective_api.py
"""
Testes de integracao para os endpoints REST de Perspectiva Matematica (PMev):
- POST /api/v1/perspective
- POST /api/v1/perspective/tree
- POST /api/v1/perspective/import-solver
"""

import json
import pytest
from aiohttp import web
from api.v1.handlers import (
    handle_calculate_perspective,
    handle_import_solver_tree,
    handle_simulate_perspective_tree,
)


@pytest.mark.asyncio
async def test_handle_calculate_perspective_success():
    """Valida calculo de PMev via endpoint HTTP."""
    app = web.Application()
    app.router.add_post("/api/v1/perspective", handle_calculate_perspective)

    payload = {
        "equity": 0.65,
        "realization_factor": 1.1,
        "valuation_stack": 1.0,
        "base_antes": 1.5,
        "time_to_blind_minutes": 5.0,
        "payjump_proximity_factor": 0.7,
        "position": "BTN",
        "multiway_opponents": 1,
        "base_rio": 0.0,
        "stack_depth_bb": 30.0,
    }

    # Mock request
    from aiohttp.test_utils import make_mocked_request

    req = make_mocked_request(
        "POST",
        "/api/v1/perspective",
        headers={"Content-Type": "application/json"},
        app=app,
    )
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_calculate_perspective(req)
    assert resp.status == 200
    data = json.loads(resp.text)
    assert "pmev" in data
    assert "dynamic_ev_fold" in data
    assert "risk_advantage" in data
    assert "bubble_factor" in data
    assert data["optimal_action"] in ["FOLD", "CALL", "RAISE"]


@pytest.mark.asyncio
async def test_handle_calculate_perspective_invalid_equity():
    """Valida rejeicao de equity fora dos limites [0, 1]."""
    app = web.Application()
    from aiohttp.test_utils import make_mocked_request

    req = make_mocked_request("POST", "/api/v1/perspective", app=app)
    req._read_bytes = json.dumps({"equity": 1.5}).encode("utf-8")

    resp = await handle_calculate_perspective(req)
    assert resp.status == 400


@pytest.mark.asyncio
async def test_handle_simulate_perspective_tree_success():
    """Valida simulacao de arvore recursiva via endpoint HTTP."""
    app = web.Application()
    from aiohttp.test_utils import make_mocked_request

    payload = {
        "equity": 0.55,
        "pot_size": 10.0,
        "stack_eff": 50.0,
        "active_players": 2,
        "street_idx": 0,
        "hero_invested": 2.5,
        "position": "CO",
    }

    req = make_mocked_request("POST", "/api/v1/perspective/tree", app=app)
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_simulate_perspective_tree(req)
    assert resp.status == 200
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert "tree_result" in data
    assert "best_action" in data["summary"]


@pytest.mark.asyncio
async def test_handle_import_solver_tree_success():
    """Valida importacao de solver com auto-deteccao via endpoint HTTP."""
    app = web.Application()
    from aiohttp.test_utils import make_mocked_request

    ds_json = json.dumps(
        {
            "solver": "deepsolver",
            "pot": 20.0,
            "board": ["Kh", "Qd", "Jc"],
            "nodes": [
                {
                    "id": "node_0",
                    "player": "IP",
                    "strategy": {"BET": 0.60, "CHECK": 0.40},
                    "equity": 0.58,
                }
            ],
        }
    )

    payload = {
        "solver_type": "auto",
        "raw_content": ds_json,
        "tournament_context": {"prizes": [1000, 600, 400], "payjump_proximity_factor": 0.9},
    }

    req = make_mocked_request("POST", "/api/v1/perspective/import-solver", app=app)
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_import_solver_tree(req)
    assert resp.status == 200
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert data["solver_type"] == "deep_solver"
    assert data["node_count"] == 1
    assert "pmev_converted_nodes" in data["tree"]


@pytest.mark.asyncio
async def test_handle_pmev_heatmap_success():
    """Valida geracao de heatmap via endpoint HTTP."""
    from api.v1.handlers import handle_pmev_heatmap

    app = web.Application()
    from aiohttp.test_utils import make_mocked_request

    payload = {
        "deepsolver_range": {
            "AA": 1.0,
            "KK": 1.0,
            "AKs": 1.0,
            "72o": 0.0,
        },
        "pot": 2.5,
        "call_amount": 1.0,
        "bubble_factor": 2.2,
        "stack_bb": 15.0,
        "position": "UTG",
        "time_to_blind_minutes": 2.0,
    }

    req = make_mocked_request("POST", "/api/v1/pmev/heatmap", app=app)
    req._read_bytes = json.dumps(payload).encode("utf-8")

    resp = await handle_pmev_heatmap(req)
    assert resp.status == 200
    data = json.loads(resp.text)
    assert data["status"] == "SUCCESS"
    assert "deepsolver_matrix" in data
    assert "pmev_matrix" in data
    assert "delta_matrix" in data
    assert "ascii_heatmap" in data
    assert len(data["cells"]) == 169
