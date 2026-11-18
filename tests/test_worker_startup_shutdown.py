from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock

import pytest

from database.queue_manager import QueueManager
from worker import startup


def _fake_manager() -> QueueManager:
    return cast(QueueManager, object())


@pytest.mark.asyncio
async def test_service_group_stops_all_services_on_shutdown(monkeypatch) -> None:
    started: set[str] = set()
    cancelled: set[str] = set()
    all_started = asyncio.Event()
    shutdown = asyncio.Event()

    async def service(name: str, _manager: QueueManager) -> None:
        started.add(name)
        if len(started) == 3:
            all_started.set()
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.add(name)

    monkeypatch.setattr(startup, "start_api_server", lambda manager: service("api", manager))
    monkeypatch.setattr(startup, "start_worker", lambda manager: service("worker", manager))
    monkeypatch.setattr(startup, "system_watchdog", lambda manager: service("watchdog", manager))
    manager = _fake_manager()

    task = asyncio.create_task(startup._run_service_group(manager, shutdown))
    await asyncio.wait_for(all_started.wait(), timeout=1)
    shutdown.set()
    await asyncio.wait_for(task, timeout=1)

    assert started == {"api", "worker", "watchdog"}
    assert cancelled == started


@pytest.mark.asyncio
async def test_service_failure_cancels_siblings(monkeypatch) -> None:
    sibling_cancelled = asyncio.Event()

    async def fail(_manager: QueueManager) -> None:
        raise RuntimeError("service failed")

    async def keep_running(_manager: QueueManager) -> None:
        try:
            await asyncio.Event().wait()
        finally:
            sibling_cancelled.set()

    monkeypatch.setattr(startup, "start_api_server", lambda value: fail(value))
    monkeypatch.setattr(startup, "start_worker", lambda value: keep_running(value))
    monkeypatch.setattr(startup, "system_watchdog", lambda value: keep_running(value))

    test_coro = startup._run_service_group(_fake_manager(), asyncio.Event())
    with pytest.raises(RuntimeError, match="service failed"):
        await asyncio.wait_for(test_coro, timeout=1)

    assert sibling_cancelled.is_set()


@pytest.mark.asyncio
async def test_service_normal_exit_is_unexpected_and_cancels_siblings(monkeypatch) -> None:
    sibling_cancelled = asyncio.Event()

    async def return_early(_manager: QueueManager) -> None:
        return None

    async def keep_running(_manager: QueueManager) -> None:
        try:
            await asyncio.Event().wait()
        finally:
            sibling_cancelled.set()

    monkeypatch.setattr(startup, "start_api_server", return_early)
    monkeypatch.setattr(startup, "start_worker", keep_running)
    monkeypatch.setattr(startup, "system_watchdog", keep_running)

    test_coro = startup._run_service_group(_fake_manager(), asyncio.Event())
    with pytest.raises(RuntimeError, match="encerrou inesperadamente: api"):
        await asyncio.wait_for(test_coro, timeout=1)

    assert sibling_cancelled.is_set()


@pytest.mark.asyncio
async def test_startup_closes_manager_when_service_group_fails(monkeypatch) -> None:
    db = SimpleNamespace(execute=AsyncMock(), commit=AsyncMock())

    @asynccontextmanager
    async def get_db_context():
        yield db

    manager = SimpleNamespace(_get_async_db=get_db_context, close=AsyncMock())
    restored = False

    def restore_handlers() -> None:
        nonlocal restored
        restored = True

    async def fail_group(_manager: QueueManager, _shutdown: asyncio.Event) -> None:
        raise RuntimeError("service failed")

    monkeypatch.setattr(startup, "QueueManager", lambda: manager)
    monkeypatch.setattr(startup, "_install_shutdown_handlers", lambda _loop, _event: restore_handlers)
    monkeypatch.setattr(startup, "_run_service_group", fail_group)

    with pytest.raises(RuntimeError, match="service failed"):
        await startup.start_worker_and_api()

    manager.close.assert_awaited_once_with()
    assert restored


def test_signal_handlers_use_and_restore_portable_fallback(monkeypatch) -> None:
    class UnsupportedSignalLoop:
        def call_soon_threadsafe(self, callback) -> None:
            callback()

        def add_signal_handler(self, _signal, _callback) -> None:
            raise NotImplementedError

    shutdown = asyncio.Event()
    handlers: dict[object, object] = {}
    previous = {signal_value: object() for signal_value in (startup.signal.SIGINT, startup.signal.SIGTERM)}

    def set_signal_handler(signal_value, handler):
        handlers[signal_value] = handler
        return previous[signal_value]

    monkeypatch.setattr(startup.signal, "getsignal", lambda signal_value: previous[signal_value])
    monkeypatch.setattr(startup.signal, "signal", set_signal_handler)
    restore = startup._install_shutdown_handlers(cast(asyncio.AbstractEventLoop, UnsupportedSignalLoop()), shutdown)

    signal_handler = handlers[startup.signal.SIGTERM]
    assert callable(signal_handler)
    signal_handler(startup.signal.SIGTERM, None)
    assert shutdown.is_set()

    restore()
    assert handlers == previous


def test_proactor_reset_exception_handler_silences_winerror_10054() -> None:
    class DummyLoop:
        def __init__(self) -> None:
            self.handler = None
            self.called_default = False

        def get_exception_handler(self):
            return self.handler

        def set_exception_handler(self, handler) -> None:
            self.handler = handler

        def default_exception_handler(self, _context) -> None:
            self.called_default = True

    loop = DummyLoop()
    restore = startup._install_exception_handler(cast(asyncio.AbstractEventLoop, loop))

    # 1. WinError 10054 ConnectionResetError -> silenciado
    err = ConnectionResetError(10054, "Reset")
    err.winerror = 10054
    assert loop.handler is not None
    loop.handler(loop, {"exception": err})
    assert not loop.called_default

    # 2. _call_connection_lost callback noise -> silenciado
    loop.handler(loop, {"message": "error in _call_connection_lost"})
    assert not loop.called_default

    # 3. Excecao normal -> repassada ao default handler
    loop.handler(loop, {"exception": ValueError("erro real")})
    assert loop.called_default

    restore()
    assert loop.handler is None


def test_worker_loop_shares_console_with_task_executor() -> None:
    import task_executor as task_exec
    import worker.loop as worker_loop

    assert worker_loop.console is task_exec.console


def test_worker_boot_panel_renders_rich_panel() -> None:
    from rich.panel import Panel

    import worker.loop as worker_loop

    panel = worker_loop._build_boot_panel({"pending": 2, "running": 1, "completed": 31, "failed": 0})
    assert isinstance(panel, Panel)


def test_update_terminal_status_reports_hud_telemetry(monkeypatch) -> None:
    import time
    from unittest.mock import MagicMock

    import worker.loop as worker_loop

    monkeypatch.setattr(worker_loop, "_LAST_STATUS_UPDATE", 0.0)
    monkeypatch.setattr(worker_loop, "_ACTIVE_TASKS_META", {"EGM-TEST-1": ("@chico", time.monotonic() - 5.0)})
    status_line = MagicMock()

    worker_loop._update_terminal_status(
        {"pending": 2, "running": 1, "completed": 31, "failed": 0},
        1,
        status_line,
    )

    status_line.update.assert_called_once()
    rendered = status_line.update.call_args.args[0]
    assert "P:[yellow]2[/]" in rendered
    assert f"R:[magenta]1/{worker_loop.MAX_CONCURRENT_TASKS}[/]" in rendered
    assert "OK:[green]31[/]" in rendered
    assert "Blk:" in rendered
    assert "@chico:EGM-TEST-1" in rendered
