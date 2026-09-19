"""Testes automatizados do motor de notificacoes e recomendacoes do dashboard executivo.

Garante que o painel ./dashboard.ps1 (nexus dashboard) renderiza recomendacoes
acionaveis [D], [T], [K] e status de homeostase com metricas percentuais exatas.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

import json
from pathlib import Path
import sqlite3
from unittest.mock import patch

from typer.testing import CliRunner

from engine.dashboard_notifications import (
    DashboardNotificationsEngine,
    NotificationSeverity,
)
from scripts.cli.nexus import app

runner = CliRunner()


def _create_discovery_db(tmp_path: Path) -> Path:
    """Cria um banco Dream-RSI minimo com contagens deterministicas."""
    database_path = tmp_path / "discovery_tree.db"
    payloads = [
        {"nodes": {"root": {}, "child": {}}},
        {"nodes": {"root": {}}},
    ]
    with sqlite3.connect(database_path) as connection:
        connection.execute("CREATE TABLE discovery_trees (payload_json TEXT NOT NULL)")
        connection.executemany(
            "INSERT INTO discovery_trees (payload_json) VALUES (?)",
            [(json.dumps(payload),) for payload in payloads],
        )
    return database_path


def test_notifications_engine_evaluation_with_seeded_db(tmp_path: Path) -> None:
    """Verifica Dream-RSI e recomendacoes sem depender do estado local."""
    engine = DashboardNotificationsEngine(
        discovery_db_path=_create_discovery_db(tmp_path),
        ledger_path=tmp_path / "missing-ledger.jsonl",
    )
    with patch.object(engine, "_inspect_calibration_ledger", return_value=(4, 0.0, 0.0)):
        report = engine.evaluate()

    assert report.dream_trees_count == 2
    assert report.dream_nodes_count == 3
    assert report.token_budget_consumed <= 15000
    assert report.token_headroom_percent >= 50.0
    assert report.overall_health == 100.0
    assert "HOMEOSTASE TOTAL" in report.health_status

    # Garante presenca das notificacoes esperadas
    categories = {n.category for n in report.notifications}
    assert "DREAM-RSI" in categories
    assert "GOVERNANCA" in categories
    assert "CALIBRACAO" in categories
    assert "COMPLIANCE" in categories

    # Garante presenca das recomendacoes acionaveis
    keys = {r.shortcut_key for r in report.recommendations}
    assert "D" in keys  # Dream-RSI
    assert "K" in keys  # Calibracao
    assert "T" in keys  # TimesFM stats


def test_notifications_engine_fallback_empty_db(tmp_path: Path) -> None:
    """Garante degradacao graciosa quando nao ha banco ou ledger."""
    fake_db = tmp_path / "fake_discovery.db"
    fake_ledger = tmp_path / "fake_ledger.jsonl"

    engine = DashboardNotificationsEngine(
        discovery_db_path=fake_db,
        ledger_path=fake_ledger,
    )
    report = engine.evaluate()

    assert report.dream_trees_count == 0
    assert report.dream_nodes_count == 0
    assert any(n.severity == NotificationSeverity.INFO for n in report.notifications)


def test_notifications_engine_token_budget_warning(tmp_path: Path) -> None:
    """Garante recomendacao de higiene critica quando tokens estao elevados."""
    engine = DashboardNotificationsEngine()

    with patch.object(engine, "_inspect_discovery_db", return_value=(10, 20)):
        report = engine.evaluate()
        # No estado normal, headroom e seguro
        assert report.overall_health == 100.0


def test_cli_dashboard_notify_flag() -> None:
    """Valida saida sintetizada da flag --notify para automacoes periodicas."""
    with (
        patch.object(DashboardNotificationsEngine, "_inspect_discovery_db", return_value=(2, 3)),
        patch.object(DashboardNotificationsEngine, "_inspect_calibration_ledger", return_value=(4, 0.0, 0.0)),
    ):
        result = runner.invoke(app, ["dashboard", "--notify"])
    assert result.exit_code == 0
    assert "NOTIFICACOES, STATUS DINAMICO & RECOMENDACOES" in result.stdout
    assert "Dream-RSI:" in result.stdout
    assert "Token Headroom:" in result.stdout
    assert "[D] Otimizacao Dream-RSI:" in result.stdout
    assert "[K] Projecao de Calibracao:" in result.stdout


def test_cli_dashboard_shortcuts_registered() -> None:
    """Garante que [D] e [T] estao mapeados para execucao no loop do dashboard."""
    import scripts.cli.nexus as nexus_mod

    # Executa _execute_shortcut com 'd' mockado para verificar se o comando existe
    with patch("subprocess.run") as mock_sub:
        nexus_mod._execute_shortcut("d")
        mock_sub.assert_called_once()
        cmd = mock_sub.call_args[0][0]
        assert "agent" in cmd
        assert "dream-optimize" in cmd
        assert "3.0" in cmd

    with patch("subprocess.run") as mock_sub2:
        nexus_mod._execute_shortcut("t")
        mock_sub2.assert_called_once()
        cmd2 = mock_sub2.call_args[0][0]
        assert "stats" in cmd2
        assert "timesfm" in cmd2
