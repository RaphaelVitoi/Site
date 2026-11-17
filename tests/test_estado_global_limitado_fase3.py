"""Regressao da Fase 3 (auditoria SOTA): estado global mutavel com bound.

Medido em 2026-11-17: quatro mapas de processo cresciam sem teto nem TTL --
USUARIOS_DE_SESSAO (middleware), SYSTEM_PROMPT_CACHE (agents/prompts via
llm.budget), as blocklists de telemetria (llm/budget) e _TELEMETRY_LOCKS,
que vazava uma entrada por `asyncio.run` porque guardava so o lock, sem o
loop dono. Cada teste aqui prova a politica de eviction/poda introduzida.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import pytest

from api.v1 import middleware
from llm import budget


@pytest.fixture(autouse=True)
def _limpa_estado_global() -> None:
    middleware.USUARIOS_DE_SESSAO.clear()
    budget.SYSTEM_PROMPT_CACHE.clear()
    budget.KEY_BLOCKLIST.clear()
    budget.GEMINI_MODEL_KEY_BLOCKLIST.clear()
    budget.ROUTE_BLOCKLIST.clear()
    budget.ROUTE_FAILURE_COUNTS.clear()
    budget._TELEMETRY_LOCKS.clear()
    yield
    middleware.USUARIOS_DE_SESSAO.clear()
    budget.SYSTEM_PROMPT_CACHE.clear()
    budget.KEY_BLOCKLIST.clear()
    budget.GEMINI_MODEL_KEY_BLOCKLIST.clear()
    budget.ROUTE_BLOCKLIST.clear()
    budget.ROUTE_FAILURE_COUNTS.clear()
    budget._TELEMETRY_LOCKS.clear()


def test_usuarios_de_sessao_eviction_fifo_no_teto(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(middleware, "MAX_USUARIOS_DE_SESSAO", 3)
    for i in range(3):
        middleware._registrar_usuario_de_sessao(f"u{i}", f"c{i}")
    middleware._registrar_usuario_de_sessao("u3", "c3")
    assert "c0" not in middleware.USUARIOS_DE_SESSAO
    assert middleware.USUARIOS_DE_SESSAO["c3"] == "u3"
    assert len(middleware.USUARIOS_DE_SESSAO) == 3  # noqa: PT018 -- assercoes encadeadas do mesmo cenario


def test_cache_put_bounded_preserva_chave_existente(monkeypatch: pytest.MonkeyPatch) -> None:
    cache: dict[str, str] = {"a": "1", "b": "2"}
    budget.cache_put_bounded(cache, "a", "9", 2)
    assert cache == {"a": "9", "b": "2"}
    budget.cache_put_bounded(cache, "c", "3", 2)
    assert "a" not in cache
    assert cache["c"] == "3"


def test_telemetry_locks_poda_loops_mortos() -> None:
    async def _pega() -> asyncio.Lock:
        return budget.get_telemetry_lock()

    lock1 = asyncio.run(_pega())
    assert len(budget._TELEMETRY_LOCKS) == 1
    # asyncio.run fecha o loop ao sair; a proxima chamada deve varrer a entrada
    # morta e nao acumular uma por loop, como acontecia antes da Fase 3.
    lock2 = asyncio.run(_pega())
    assert len(budget._TELEMETRY_LOCKS) == 1
    assert lock2 is not lock1


def test_blocklist_purga_expirados_e_fifo(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(budget, "_BLOCKLIST_MAX", 3)
    agora = datetime.now(UTC)
    budget.KEY_BLOCKLIST.update(
        {
            "velha1": agora - timedelta(seconds=1),
            "velha2": agora - timedelta(seconds=2),
            "fresca1": agora + timedelta(minutes=5),
            "fresca2": agora + timedelta(minutes=5),
            "fresca3": agora + timedelta(minutes=5),
        }
    )
    budget._purgar_blocklist_expirados(budget.KEY_BLOCKLIST, agora)
    assert "velha1" not in budget.KEY_BLOCKLIST
    assert "velha2" not in budget.KEY_BLOCKLIST
    # expirados saem primeiro; o que sobra ainda esta acima do teto? nao --
    # 3 frescas == teto, entao nenhuma fresca e evictada.
    assert len(budget.KEY_BLOCKLIST) == 3


def test_blocklist_fifo_quando_nao_ha_expirados(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(budget, "_BLOCKLIST_MAX", 2)
    futuro = datetime.now(UTC) + timedelta(minutes=5)
    budget.KEY_BLOCKLIST.update({"k1": futuro, "k2": futuro, "k3": futuro})
    budget._purgar_blocklist_expirados(budget.KEY_BLOCKLIST, datetime.now(UTC))
    assert "k1" not in budget.KEY_BLOCKLIST
    assert {"k2": futuro, "k3": futuro} == budget.KEY_BLOCKLIST


@pytest.mark.asyncio
async def test_is_key_blocked_remove_expirado(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(budget, "KEY_BLOCKLIST", {"pk": datetime.now(UTC) - timedelta(seconds=1)})
    assert await budget._is_key_blocked("pk") is False
    assert "pk" not in budget.KEY_BLOCKLIST
