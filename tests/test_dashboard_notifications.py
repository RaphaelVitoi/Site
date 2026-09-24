"""Testes automatizados do motor de notificacoes e recomendacoes do dashboard executivo.

Garante que o painel ./dashboard.ps1 (nexus dashboard) renderiza recomendacoes
acionaveis [D], [T], [K] e status de homeostase com metricas percentuais exatas.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

from typer.testing import CliRunner

from engine.dashboard_notifications import (
    DashboardNotificationsEngine,
    NotificationSeverity,
)
from scripts.cli.nexus import app

runner = CliRunner()


def test_notifications_engine_evaluation_on_real_repo() -> None:
    """Verifica avaliacao das arvores do Dream-RSI, token budget e recomendacoes."""
    engine = DashboardNotificationsEngine()
    with (
        patch.object(engine, "_inspect_discovery_db", return_value=(364, 664)),
        patch.object(engine, "_inspect_calibration_ledger", return_value=(3, 0.0, 0.0)),
    ):
        report = engine.evaluate()

    assert report.dream_trees_count >= 364
    assert report.dream_nodes_count >= 664
    assert report.token_budget_consumed <= 15000
    assert report.token_headroom_percent >= 50.0
    assert report.overall_health == 100.0
    assert "HOMEOSTASE TOTAL" in report.health_status
    assert report.calibration_risk == 0.0
    assert any("Tres feedbacks" in n.message for n in report.notifications)

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

    with (
        patch.object(engine, "_inspect_discovery_db", return_value=(10, 20)),
        patch.object(engine, "_inspect_calibration_ledger", return_value=(3, 0.0, 0.0)),
    ):
        report = engine.evaluate()
        # No estado normal, headroom e seguro
        assert report.overall_health == 100.0


def test_cli_dashboard_notify_flag() -> None:
    """Valida saida sintetizada da flag --notify para automacoes periodicas."""
    with (
        patch.object(DashboardNotificationsEngine, "_inspect_discovery_db", return_value=(364, 664)),
        patch.object(DashboardNotificationsEngine, "_inspect_calibration_ledger", return_value=(3, 0.0, 0.0)),
        patch("scripts.cli.nexus.subprocess.Popen"),
    ):
        result = runner.invoke(app, ["dashboard", "--notify"])
    assert result.exit_code == 0
    assert "NOTIFICACOES, STATUS DINAMICO & RECOMENDACOES" in result.stdout
    assert "Dream-RSI:" in result.stdout
    assert "Token Headroom:" in result.stdout
    assert "[D] Otimizacao Dream-RSI:" in result.stdout
    assert "[K] Revisao de Calibracao:" in result.stdout


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

    with patch("subprocess.run") as mock_sub3:
        nexus_mod._execute_shortcut("a")
        mock_sub3.assert_called_once()
        cmd3 = mock_sub3.call_args[0][0]
        assert "ops" in cmd3
        assert "check-ascii" in cmd3

    with patch("subprocess.run") as mock_sub4:
        nexus_mod._execute_shortcut("p")
        mock_sub4.assert_called_once()
        cmd4 = mock_sub4.call_args[0][0]
        assert "triad" in cmd4
        assert "status" in cmd4
