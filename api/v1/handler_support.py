"""Shared error and execution-provenance helpers for HTTP handlers."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any
from uuid import uuid4

from aiohttp import web
import orjson

from engine.capability_registry import load_engine_capability_manifest

logger = logging.getLogger("api.v1.handlers")

#: Texto do erro de corpo JSON malformado -- contrato unico compartilhado por
#: todos os handlers (viviam como constante local de handlers.py).
INVALID_JSON_BODY = "Invalid JSON body"


async def read_json_object(
    request: web.Request, *, error_envelope: bool = False
) -> tuple[dict[str, Any] | None, web.Response | None]:
    """Le e valida que o corpo da requisicao e um objeto JSON (dict), retornando 400 caso contrario."""
    try:
        if isinstance(request, web.BaseRequest) and "json" not in getattr(request, "__dict__", {}):
            data = await request.json(loads=orjson.loads)
        else:
            data = await request.json()
    except Exception:
        body: dict[str, Any] = (
            {"status": "ERROR", "error": INVALID_JSON_BODY} if error_envelope else {"error": INVALID_JSON_BODY}
        )
        return None, web.json_response(body, status=400)
    if not isinstance(data, dict):
        body = {"status": "ERROR", "error": INVALID_JSON_BODY} if error_envelope else {"error": INVALID_JSON_BODY}
        return None, web.json_response(body, status=400)
    return data, None


#: Raiz do workspace servida por /api/files/*. Vive aqui (e nao em handlers.py)
#: porque handlers_files.py e handlers.py ambos a consomem -- handlers.py a
#: re-exporta para compatibilidade de import. Monkeypatch de teste deve mirar
#: ESTE modulo: o consumidor resolve o atributo em tempo de chamada.
BASE_WORKSPACE_DIR: Path = Path(__file__).resolve().parent.parent.parent


def _internal_error(exc: BaseException, contexto: str, **extra: Any) -> web.Response:
    """Loga a excecao com um id de correlacao e devolve resposta 500 sem detalhe interno.

    O texto de `exc` pode conter caminho de disco, SQL, nome de chave e stack de
    provider. Nada disso atravessa a fronteira HTTP: o cliente recebe apenas o id.
    """
    error_id = uuid4().hex[:12]
    logger.error("[%s] %s: %s", error_id, contexto, exc, exc_info=exc)
    payload: dict[str, Any] = {
        "error": "Erro interno do servidor.",
        "error_id": error_id,
        **extra,
    }
    return web.json_response(payload, status=500)


def _with_execution_provenance(
    payload: dict[str, Any],
    engine_id: str,
    *,
    runtime_used: str = "python",
    model_used: str | None = None,
    intended_model: str | None = None,
    weights_loaded: bool = False,
    fallback_used: bool = False,
) -> dict[str, Any]:
    """Anexa identidade executada; o nome da linhagem nunca substitui a prova."""
    manifest = load_engine_capability_manifest()
    selected = next((item for item in manifest.capabilities if item.engine_id == engine_id), None)
    if selected is None:
        raise KeyError(f"unknown engine capability: {engine_id}")
    return {
        **payload,
        "execution_provenance": {
            "engine_id": selected.engine_id,
            "implementation_level": selected.implementation_level.value,
            "runtime_used": runtime_used,
            "model_used": model_used or selected.engine_id,
            "intended_model": intended_model,
            "weights_loaded": weights_loaded,
            "fallback_used": fallback_used,
            "assumptions": selected.assumptions,
            "limitations": selected.limitations,
            "units": selected.units,
        },
    }
