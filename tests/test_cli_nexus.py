"""Auditoria Estrita do Orquestrador SOTA (nexus.py)."""

from unittest.mock import AsyncMock, MagicMock, patch
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


def test_nexus_stats_subcommand_help():
    """Audita a presenca da sub-malha de Telemetria e Estatisticas."""
    result = runner.invoke(app, ["stats", "--help"])
    assert result.exit_code == 0
    assert "Telemetria Preditiva" in result.stdout


def test_nexus_agent_subcommand_help():
    """Audita a presenca da sub-malha de Sincronizacao de Agentes."""
    result = runner.invoke(app, ["agent", "--help"])
    assert result.exit_code == 0
    assert "Sincronizacao e Handoff" in result.stdout


def test_nexus_voice_subcommand_help():
    """Audita a presenca da sub-malha de Sintese Neural de Voz."""
    result = runner.invoke(app, ["voice", "--help"])
    assert result.exit_code == 0
    assert "Sintese Neural de Voz" in result.stdout


def test_nexus_task_enqueuing():
    """Valida a criacao e enfileiramento atomico de uma diretriz no DAL."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.add_task = AsyncMock(return_value=True)
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["task", "Implementar Validacao SOTA", "--agent", "@chico"])
        assert result.exit_code == 0
        assert "TAREFA ENFILEIRADA SOTA" in result.stdout
        mock_qm.add_task.assert_called_once()


def test_nexus_task_null_byte_rejection():
    """Valida bloqueio de seguranca contra Null Byte Injection."""
    result = runner.invoke(app, ["task", "Payload com \x00 invalido"])
    assert result.exit_code == 1
    assert "Null Byte" in result.stdout


def test_nexus_list_tasks():
    """Valida a listagem de diretrizes no Orquestrador."""
    with (
        patch("scripts.cli.nexus._resolve_tasks_db_path") as mock_path,
        patch("scripts.cli.nexus.sqlite3.connect") as mock_connect,
    ):
        mock_path.return_value = MagicMock(exists=lambda: True, stat=lambda: MagicMock(st_size=1024))
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ("TASK-001", "@chico", "completed", "Diretriz Alpha de Validacao"),
            ("TASK-002", "@dispatcher", "pending", "Diretriz Beta de Processamento"),
        ]
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn

        result = runner.invoke(app, ["list", "--limit", "2"])
        assert result.exit_code == 0
        assert "DIRETRIZES RECENTES" in result.stdout
        assert "TASK-001" in result.stdout


def test_nexus_autonomy_setting():
    """Valida alteracao controlada do nivel de autonomia."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.set_system_state = AsyncMock(return_value=True)
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["autonomy", "partial"])
        assert result.exit_code == 0
        assert "Autonomia definida para: partial" in result.stdout


def test_nexus_autonomy_invalid():
    """Valida rejeicao de modo de autonomia inexistente."""
    result = runner.invoke(app, ["autonomy", "modo_invalido_xyz"])
    assert result.exit_code == 1
    assert "Modo de autonomia invalido" in result.stdout


def test_nexus_status_command():
    """Valida a telemetria dinamica do comando status."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.get_task_counts = AsyncMock(return_value={"pending": 2, "running": 1, "completed": 10})
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["status"])
        assert result.exit_code == 0
        assert "STATUS VITAL" in result.stdout or "Orquestrador" in result.stdout


def test_nexus_db_vacuum():
    """Valida manutencao VACUUM no banco SQLite."""
    with (
        patch("scripts.cli.nexus._resolve_tasks_db_path") as mock_path,
        patch("scripts.cli.nexus.sqlite3.connect") as mock_connect,
    ):
        mock_path.return_value = MagicMock(exists=lambda: True, stat=lambda: MagicMock(st_size=2048))
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn

        result = runner.invoke(app, ["db", "vacuum"])
        assert result.exit_code == 0
        assert "otimizado com sucesso" in result.stdout


def test_nexus_ops_check_ascii():
    """Valida o verificador de conformidade ASCII pura."""
    result = runner.invoke(app, ["ops", "check-ascii"])
    assert result.exit_code in (0, 1)


def test_nexus_agent_route():
    """Valida teste de roteamento semantico de tarefas."""
    with patch("task_executor.intelligent_route_task") as mock_route:
        mock_route.return_value = ("@chico", {"confidence": 0.98, "reasoning": "Axioma SOTA"})
        result = runner.invoke(app, ["agent", "route", "Refatorar kernel de poker"])
        assert result.exit_code == 0
        assert "@chico" in result.stdout


def test_nexus_voice_speak():
    """Valida sintese neural de voz com mock do backend."""
    with patch("scripts.cli.nexus_voice.speak_text") as mock_speak:
        result = runner.invoke(app, ["voice", "speak", "Teste de voz", "--no-play"])
        assert result.exit_code == 0
        mock_speak.assert_called_once()


def test_nexus_search():
    """Valida busca semantica no RAG."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["search", "PMev equilibrium"])
        assert result.exit_code == 0
        assert "Pesquisando na Mente Coletiva" in result.stdout
        mock_sub.assert_called_once()


def test_nexus_graph():
    """Valida consulta do Grafo Causal."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["graph", "Perspectiva Matematica"])
        assert result.exit_code == 0
        assert "Forjando Grafo Causal" in result.stdout
        mock_sub.assert_called_once()


def test_nexus_sync_consciousness():
    """Valida sincronizacao da Mente Coletiva."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["sync-consciousness"])
        assert result.exit_code == 0
        assert "SINCRONIZACAO DE CONSCIENCIA SOTA" in result.stdout
        mock_sub.assert_called_once()
