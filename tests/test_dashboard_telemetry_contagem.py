"""Contagem de tarefas da telemetria do dashboard (regressao 2026-10-29).

`_collect_task_counts` incrementava o MESMO contador duas vezes para status
completed/running/failed (uma pela categoria, outra pelo status cru), e o painel
mostrava "concluidas 58" para uma base de 29 tarefas.
"""

from __future__ import annotations

import sqlite3

from scripts.ops.get_dashboard_telemetry import _collect_task_counts, _empty_counts


def _contar(status: list[str]) -> dict:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE tasks (status TEXT, metadata TEXT)")
    conn.executemany("INSERT INTO tasks VALUES (?, NULL)", [(s,) for s in status])
    counts = _empty_counts()
    _collect_task_counts(conn.cursor(), counts)
    conn.close()
    return counts


def test_concluidas_nao_sao_contadas_em_dobro() -> None:
    counts = _contar(["completed"] * 29)
    assert counts["total"] == 29
    assert counts["completed"] == 29


def test_cada_status_conta_uma_vez() -> None:
    counts = _contar(["completed", "completed", "failed", "running", "pending"])
    assert counts["total"] == 5
    assert counts["completed"] == 2
    assert counts["failed"] == 1
    assert counts["running"] == 1
    assert counts["pending"] == 1
