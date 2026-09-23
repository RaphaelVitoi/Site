"""Garante que o treino fecha a conexao SQLite mesmo sem amostra suficiente."""

from __future__ import annotations

from pathlib import Path
import sqlite3

import pytest

import predictive_forest
from predictive_forest import PredictiveForestEngine


def test_train_model_closes_sqlite_connection_on_insufficient_data(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    db_path = tmp_path / "telemetry.db"
    original_connect = sqlite3.connect
    with original_connect(db_path) as conn:
        conn.execute("CREATE TABLE TelemetryEvent (isCorrect INTEGER, metadata TEXT)")

    opened_connections: list[sqlite3.Connection] = []

    def tracking_connect(database: str | Path, *, timeout: float = 5.0) -> sqlite3.Connection:
        conn = original_connect(database, timeout=timeout)
        opened_connections.append(conn)
        return conn

    monkeypatch.setattr(predictive_forest.sqlite3, "connect", tracking_connect)

    engine = PredictiveForestEngine(str(db_path))
    assert engine.train_model() is False
    assert len(opened_connections) == 1
    with pytest.raises(sqlite3.ProgrammingError, match="closed database"):
        opened_connections[0].execute("SELECT 1")
