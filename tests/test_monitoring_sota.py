"""
Testes SOTA para os modulos de telemetria, auditoria e watchdog do Nexus Orchestrator.
"""

import base64
import json
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import core.config
from core.schemas import Task
from monitoring.audit_engine import AuditEngine
from monitoring.telemetry import send_toast, write_economic_log
from monitoring.watchdog import (
    _calculate_failure_rate,
    _evaluate_triggers,
    _get_last_metrics,
    _run_watchdog_cycle,
)


@pytest.fixture(autouse=True)
def patch_valid_agents(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante que agentes de teste sao considerados validos pelo Pydantic."""
    monkeypatch.setattr(core.config, "VALID_AGENTS", ["@test_agent", "@maverick"])


@pytest.mark.unit
def test_send_toast_success(monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida o envio com sucesso do Toast via subprocesso Powershell."""
    monkeypatch.setattr("sys.platform", "win32")
    with (
        patch("utils.notifications.Path.exists", return_value=True),
        # shutil.which real, sob win32 espelhado num runtime nao-Windows, usa _winapi (ausente) e estoura -- send_toast engole a excecao em silencio.
        patch("utils.notifications.shutil.which", return_value="powershell.exe"),
        patch("subprocess.Popen") as mock_popen,
    ):
        send_toast("Teste SOTA", "Mensagem de teste")
        mock_popen.assert_called_once()
        args = mock_popen.call_args[0][0]
        assert "powershell.exe" in args[0]
        assert "-EncodedCommand" in args
        encoded_idx = args.index("-EncodedCommand") + 1
        decoded_payload = base64.b64decode(args[encoded_idx]).decode("utf-16le")
        assert "Teste SOTA" in decoded_payload


@pytest.mark.unit
def test_send_toast_failure() -> None:
    """Valida tratamento de excecoes no envio de Toast."""
    with patch("subprocess.Popen", side_effect=OSError("Access denied")):
        send_toast("Erro", "Mensagem")


@pytest.mark.unit
def test_economic_log_writing(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida a escrita de log economico no formato correto."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr("monitoring.telemetry.PATH_AUDIT_LOGS", tmp_path / "logs/audit")
    task = Task(
        id="TSK-123",
        description="Tarefa de teste com acento: acao",
        agent="@test_agent",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={"priority": "high"},
    )

    write_economic_log(task, 1.5, "completed")

    log_dir = tmp_path / "logs/audit"
    assert log_dir.exists()
    log_files = list(log_dir.glob("economic_audit_*.log"))
    assert len(log_files) == 1

    content = log_files[0].read_text(encoding="ascii")
    assert "LVL:HIGH" in content
    assert "AGENT:@test_agent" in content
    assert "STAT:completed" in content
    assert "ID:TSK-123" in content


@pytest.mark.asyncio
@pytest.mark.unit
async def test_audit_engine_flow(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida processamento de eventos do frontend e flush do AuditEngine."""
    monkeypatch.chdir(tmp_path)
    engine = AuditEngine(manager=None)

    events = [
        {"level": "error", "component": "Header", "message": "React crash: " + "a" * 1200},
        {"level": "info", "component": "Table", "message": "Loaded data"},
    ]

    await engine.process_frontend_events(events)
    assert len(engine.active_buffer) == 2
    assert "TRUNCATED_BY_SOTA" in engine.active_buffer[0]["message"]

    await engine.flush()
    assert len(engine.active_buffer) == 0

    log_dir = tmp_path / ".claude/AUDITORIA"
    log_files = list(log_dir.glob("vdom_audit_*.jsonl"))
    assert len(log_files) == 1

    lines = log_files[0].read_text(encoding="ascii").splitlines()
    assert len(lines) == 2
    parsed_1 = json.loads(lines[0])
    assert parsed_1["level"] == "ERROR"
    assert parsed_1["component"] == "Header"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_audit_engine_auto_flush(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida que o AuditEngine realiza flush automatico quando buffer atinge o limite."""
    monkeypatch.chdir(tmp_path)
    engine = AuditEngine(manager=None)
    engine.MAX_BUFFER = 3

    events = [
        {"level": "info", "component": "Comp1", "message": "Msg1"},
        {"level": "info", "component": "Comp2", "message": "Msg2"},
        {"level": "info", "component": "Comp3", "message": "Msg3"},
    ]

    await engine.process_frontend_events(events)
    assert len(engine.active_buffer) == 0

    log_dir = tmp_path / ".claude/AUDITORIA"
    assert len(list(log_dir.glob("vdom_audit_*.jsonl"))) == 1


@pytest.mark.unit
def test_calculate_failure_rate() -> None:
    """Valida o calculo da taxa de falha baseada em tempo e diferenca."""
    now = datetime(2026, 5, 26, 12, 0, 0, tzinfo=UTC)
    last_metrics = {"failed": 2, "timestamp": "2026-05-26T11:50:00+00:00"}

    rate, diff = _calculate_failure_rate(now, 12, last_metrics)
    assert diff == 10
    assert rate == pytest.approx(1.0)


@pytest.mark.unit
def test_calculate_failure_rate_invalid() -> None:
    """Valida que calculo com metricas invalidas retorna 0."""
    now = datetime(2026, 5, 26, 12, 0, 0, tzinfo=UTC)
    rate, diff = _calculate_failure_rate(now, 12, {"failed": "not-int", "timestamp": "invalid"})
    assert rate == pytest.approx(0.0)
    assert diff == 0


@pytest.mark.unit
@pytest.mark.parametrize(
    ("pending", "recent_fail", "rate", "expected_trigger"),
    [
        (45, 1, 0.1, "Engarrafamento na Fila (45 pendentes)"),
        (10, 6, 0.1, "Pico de Falhas Acumuladas (6 falhas recentes)"),
        (10, 2, 0.8, "Taxa de Falha Anormal (0.80 falhas/min)"),
        (10, 0, 0.8, None),
        (10, 2, 0.3, None),
    ],
)
def test_evaluate_triggers(pending: int, recent_fail: int, rate: float, expected_trigger: str | None) -> None:
    """Valida as regras de avaliacao de gatilhos de alerta."""
    res = _evaluate_triggers(pending, recent_fail, rate)
    assert res == expected_trigger


@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_last_metrics_empty() -> None:
    """Valida recuperacao de metricas vazias ou com erro no watchdog."""
    mock_manager = MagicMock()
    mock_manager.get_system_state = AsyncMock(return_value="invalid-json")
    res = await _get_last_metrics(mock_manager)
    assert res == {}


@pytest.mark.asyncio
@pytest.mark.unit
async def test_watchdog_cycle_healthy() -> None:
    """Valida o ciclo do watchdog sem anomalias detectadas."""
    mock_manager = MagicMock()
    mock_manager.get_task_counts = AsyncMock(return_value={"failed": 5, "pending": 2})
    mock_manager.get_system_state = AsyncMock(
        return_value=json.dumps({"failed": 4, "timestamp": "2026-05-26T11:55:00+00:00"})
    )
    mock_manager.set_system_state = AsyncMock()
    mock_manager.add_task = AsyncMock()

    await _run_watchdog_cycle(mock_manager)

    mock_manager.set_system_state.assert_called_once()
    mock_manager.add_task.assert_not_called()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_watchdog_cycle_degraded() -> None:
    """Valida o ciclo do watchdog quando ha degradacao e enfileira um alerta."""
    mock_manager = MagicMock()
    mock_manager.get_task_counts = AsyncMock(return_value={"failed": 20, "pending": 5})
    mock_manager.get_system_state = AsyncMock(
        return_value=json.dumps({"failed": 10, "timestamp": "2026-05-26T11:59:00+00:00"})
    )
    mock_manager.set_system_state = AsyncMock()
    mock_manager.get_task = AsyncMock(return_value=None)
    mock_manager.add_task = AsyncMock()

    await _run_watchdog_cycle(mock_manager)

    mock_manager.add_task.assert_called_once()
    called_task = mock_manager.add_task.call_args[0][0]
    assert called_task.agent == "@maverick"
    assert "critical" in called_task.metadata.get("priority")
