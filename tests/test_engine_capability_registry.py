"""Contrato executavel do registro unico de capacidades matematicas."""

from __future__ import annotations

import json

import pytest
from aiohttp import web
from aiohttp.test_utils import make_mocked_request

from api.v1.handlers import handle_engine_capabilities
from engine.capability_registry import (
    ImplementationLevel,
    get_engine_capability,
    load_engine_capability_manifest,
)
from database.queue_manager import QueueManager


def test_manifesto_tem_ids_unicos_e_parametros_sem_sobreposicao() -> None:
    manifesto = load_engine_capability_manifest()
    ids = [capacidade.engine_id for capacidade in manifesto.capabilities]

    assert len(ids) == len(set(ids))
    assert manifesto.provenance_fields == [
        "engine_id",
        "implementation_level",
        "runtime_used",
        "model_used",
        "intended_model",
        "weights_loaded",
        "fallback_used",
        "assumptions",
        "limitations",
        "units",
    ]
    for capacidade in manifesto.capabilities:
        assert set(capacidade.causal_parameters).isdisjoint(capacidade.reserved_parameters)
        assert capacidade.consumer_paths
        assert capacidade.safe_label
        assert capacidade.limitations


def test_pluribus_e_timesfm_declaram_a_capacidade_real() -> None:
    pluribus = get_engine_capability("pluribus-multiway-adapter")
    timesfm = get_engine_capability("timesfm-forecast")

    assert pluribus.implementation_level is ImplementationLevel.HEURISTIC
    assert "active_stacks" in pluribus.causal_parameters
    assert "depth_streets" in pluribus.causal_parameters
    assert pluribus.reserved_parameters == []
    assert "wasm" in pluribus.runtimes
    assert "wasm-equity/lib.rs" in pluribus.consumer_paths
    assert "full-solver" not in pluribus.claims_allowed
    assert timesfm.implementation_level is ImplementationLevel.ADAPTER
    assert timesfm.runtime_availability == "runtime-dependent"
    assert timesfm.fallback_engine_id == "analytic-linear-forecast"


@pytest.mark.asyncio
async def test_endpoint_publica_manifesto_sem_converter_configuracao_em_runtime() -> None:
    request = make_mocked_request("GET", "/api/v1/engine-capabilities", app=web.Application())

    response = await handle_engine_capabilities(request)

    assert response.status == 200
    assert response.text is not None
    payload = json.loads(response.text)
    assert payload["status"] == "SUCCESS"
    assert payload["runtime_probe_performed"] is False
    assert payload["manifest"]["capabilities"]


def test_endpoint_de_capacidades_esta_registrado_na_aplicacao(tmp_path) -> None:
    from api.v1.server import create_app

    app = create_app(QueueManager(queue_path=str(tmp_path / "capabilities.db")))
    routes = {(route.method, route.resource.canonical) for route in app.router.routes() if route.resource}

    assert ("GET", "/api/v1/engine-capabilities") in routes
