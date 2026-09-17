"""Contrato do /db-summary consumido pelo dashboard do operador (FE-05, auditoria de frontend 2026-09-17).

O dashboard exibia teto de orcamento e agentes como constantes. O backend passa a devolver os dois a
partir das fontes canonicas, e este guard falha se alguem voltar a fixa-los em qualquer ponta.
"""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

from aiohttp import web
import pytest

from api.v1 import handlers
from api.v1.keys import MANAGER_KEY
from llm.budget import DAILY_API_BUDGET

RAIZ = Path(__file__).resolve().parent.parent


@pytest.mark.asyncio
async def test_db_summary_devolve_teto_e_agentes_das_fontes_canonicas(monkeypatch) -> None:
    manager = MagicMock()
    manager.get_task_counts = AsyncMock(return_value={"pending": 1, "running": 2, "completed": 0, "failed": 0})
    manager.get_daily_budget_usage = AsyncMock(return_value=7)
    monkeypatch.setattr(handlers._te, "AGENTS_MANIFEST", {"a": {}, "b": {}, "c": {}}, raising=False)
    app = web.Application()
    app[MANAGER_KEY] = manager
    req = MagicMock()
    req.app = app

    resposta = await handlers.handle_get_db_summary(req)
    corpo = json.loads(resposta.text or "{}")

    assert corpo["budget"] == 7
    assert corpo["budget_limit"] == DAILY_API_BUDGET
    assert corpo["agents_registered"] == 3


def test_dashboard_nao_fixa_teto_agentes_nem_ev_loss() -> None:
    fonte = (RAIZ / "frontend/src/app/(user)/dashboard/page.tsx").read_text(encoding="utf-8")
    for fixo in ("dailyBudget: 5000", "agentsOnline: 15", "evLoss: 12"):
        assert fixo not in fonte
    assert "budget_limit" in fonte
    assert "agents_registered" in fonte
