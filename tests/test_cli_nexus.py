"""Auditoria Estrita do Orquestrador SOTA (nexus.py)."""

from typer.testing import CliRunner

from scripts.cli.nexus import app

runner = CliRunner()


def test_nexus_root_help():
    """Valida a invocacao do gateway de comandos SOTA."""
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "NEXUS ORCHESTRATOR" in result.stdout


def test_nexus_db_subcommand_help():
    """Audita a presenca da sub-malha do Data Access Layer (DAL)."""
    result = runner.invoke(app, ["db", "--help"])
    assert result.exit_code == 0
    assert "Gestao e Otimizacao do DAL" in result.stdout


def test_nexus_ops_subcommand_help():
    """Audita a presenca da sub-malha de Infraestrutura SOTA."""
    result = runner.invoke(app, ["ops", "--help"])
    assert result.exit_code == 0
    assert "Operacoes de Infraestrutura" in result.stdout
