# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, broad-exception-caught, logging-fstring-interpolation, line-too-long, unused-argument, deprecated-argument, unused-variable, too-many-lines, invalid-name, redefined-outer-name, unspecified-encoding, protected-access, wrong-import-position, import-outside-toplevel, import-error
"""
CLI Commands -- Interface de linha de comando do Nexus Orchestrator.
Todos os comandos db-*, check-keys, gemini-health, worker e query.
"""

import asyncio
import base64
import contextlib
import ctypes
import inspect
from datetime import UTC, datetime, timedelta
import json
import os
from pathlib import Path
import socket
import sqlite3
import ssl
import sys
import time

# Injeta o diretorio raiz (Site) no sys.path para permitir execucoes diretas
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# pylint: disable=wrong-import-position
# ruff: noqa: E402, I001
import aiofiles
import aiohttp
import aiosqlite
import certifi
from pydantic import ValidationError
from rich.console import Console
from rich.table import Table

from core.arbitrator import UniversalArbitrator
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    ANTHROPIC_KEYS,
    DAILY_API_BUDGET,
    DEEPSEEK_ROUTE_COOLDOWN_DURATION,
    DEEPSEEK_ROUTE_FAILURE_THRESHOLD,
    GEMINI_ALL_KEYS,
    GEMINI_FLASH_KEYS,
    GEMINI_KEYS,
    GEMINI_PRO_KEYS,
    OPENROUTER_KEYS,
    ROUTE_COOLDOWN_DURATION,
    ROUTE_FAILURE_THRESHOLD,
    _key_fingerprint,
    _route_identifier,
)
# pylint: enable=wrong-import-position

console = Console()


def _get_runtime():
    """Import lazy do executor de tarefas para evitar dependencia circular."""
    import task_executor as te  # pylint: disable=import-outside-toplevel

    return te


STATUS_FAIL = "[bold red]FALHA[/]"
LATENCY_NA = "[dim]N/A[/]"


async def _cmd_get_budget(manager: QueueManager) -> dict:
    today = datetime.now(UTC).strftime("%Y-%m-%d")
    async with (
        aiosqlite.connect(manager.db_path) as db,
        db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (today,)) as cursor,
    ):
        row = await cursor.fetchone()
        current_count = row[0] if row else 0
        return {"used": current_count, "total": DAILY_API_BUDGET}


async def _format_notify_row(t: Task, manager: QueueManager) -> tuple:
    st_dict: dict[str, str] = {
        "completed": "green",
        "failed": "red",
        "pending": "yellow",
        "running": "magenta",
    }
    st_color = st_dict.get(str(t.status), "white")
    pri = str(t.metadata.get("priority", "normal")) if t.metadata else "normal"
    pri_color = {
        "critical": "bold red",
        "high": "orange3",
        "medium": "yellow",
        "low": "dim white",
        "normal": "white",
    }.get(pri, "white")
    desc = t.description.replace("\r", "").replace("\n", " ")

    ref_task_id = t.metadata.get("reference_task") if t.metadata else None
    if ref_task_id and ref_task_id.startswith("AUTOFIX"):
        ref_task = await manager.get_task(ref_task_id)
        if ref_task and ref_task.metadata:
            err_msg_raw = ref_task.metadata.get("last_error_message")
            if err_msg_raw:
                err_msg = str(err_msg_raw).replace("\n", " ")
                desc += f" [bold red][ERRO AUTOFIX: {err_msg[:120]}...][/]"

    display_id = f"[bold orange3]🔔 {t.id}[/]"
    desc = f"[orange3]{desc}[/]"
    ts = t.timestamp[:19].replace("T", " ")
    return (
        display_id,
        t.agent,
        f"[{st_color}]{t.status.upper()}[/]",
        f"[{pri_color}]{pri.upper()}[/]",
        desc,
        ts,
    )


async def _cmd_get_notify(manager: QueueManager, argv: list) -> None:
    tasks = await manager.get_tasks("pending")
    notify_tasks = [t for t in tasks if t.id.startswith("NOTIFY-")]

    if "--json" in argv:
        print(json.dumps([t.model_dump() for t in notify_tasks]))
        return

    table = Table(
        title="[bold orange3]🔔 NEXUS ORCHESTRATOR - Auditorias Sentinela Pendentes[/]",
        border_style="orange3",
        show_lines=True,
    )
    table.add_column("ID / Task", style="cyan", no_wrap=True)
    table.add_column("Agent", style="yellow", justify="center")
    table.add_column("Status", justify="center")
    table.add_column("Priority", justify="center")
    table.add_column("Descricao", style="white", max_width=75, overflow="ellipsis")
    table.add_column("Criacao", style="dim")
    for t in notify_tasks:
        row = await _format_notify_row(t, manager)
        table.add_row(*row)
    if not notify_tasks:
        table.add_row(
            "",
            "",
            "",
            "",
            "[dim]Nenhuma auditoria sentinela pendente no momento.[/dim]",
            "",
        )
    console.print(table)


async def _cmd_reset_budget(manager: QueueManager) -> None:  # noqa: ARG001
    async with aiosqlite.connect(manager.db_path) as db:
        await db.execute("DELETE FROM system_state WHERE key='hibernation_until'")
        await db.execute("DELETE FROM daily_usage")
        await db.commit()


async def _cmd_fallback_stats(manager: QueueManager, window_minutes: int) -> list:
    since = (datetime.now(UTC) - timedelta(minutes=window_minutes)).isoformat()
    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = sqlite3.Row
        query = """
            SELECT provider, model,
                   COUNT(*) AS attempts,
                   SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
                   AVG(CASE WHEN latency_ms IS NOT NULL THEN latency_ms END) AS avg_latency_ms
            FROM key_usage_metrics
            WHERE timestamp >= ?
            GROUP BY provider, model
            ORDER BY attempts DESC
        """
        async with db.execute(query, (since,)) as cursor:
            rows = await cursor.fetchall()
    return [
        {
            "provider": r["provider"],
            "model": r["model"],
            "attempts": int(r["attempts"] or 0),
            "successes": int(r["successes"] or 0),
            "success_rate": round((float(r["successes"] or 0) / float(r["attempts"] or 1)) * 100, 2),
            "avg_latency_ms": int(r["avg_latency_ms"]) if r["avg_latency_ms"] is not None else None,
        }
        for r in rows
    ]


async def _cmd_prune_fallback(manager: QueueManager, days: int) -> dict:
    cutoff = (datetime.now(UTC) - timedelta(days=days)).isoformat()
    async with aiosqlite.connect(manager.db_path) as db:
        async with db.execute("SELECT COUNT(*) FROM key_usage_metrics WHERE timestamp < ?", (cutoff,)) as cursor:
            row = await cursor.fetchone()
            total_to_delete = int(row[0]) if row and row[0] is not None else 0
        await db.execute("DELETE FROM key_usage_metrics WHERE timestamp < ?", (cutoff,))
        await db.commit()
    return {"deleted_rows": total_to_delete, "cutoff_iso": cutoff, "days": days}


async def _cmd_prune_legacy_fallback(manager: QueueManager) -> dict:
    legacy_patterns = ("gemini-1.5%", "anthropic/%", "claude-%")
    deleted = 0
    async with aiosqlite.connect(manager.db_path) as db:
        for pattern in legacy_patterns:
            async with db.execute("SELECT COUNT(*) FROM key_usage_metrics WHERE model LIKE ?", (pattern,)) as cursor:
                row = await cursor.fetchone()
                deleted += int(row[0]) if row and row[0] is not None else 0
            await db.execute("DELETE FROM key_usage_metrics WHERE model LIKE ?", (pattern,))
        await db.commit()
    return {"deleted_rows": deleted, "patterns": list(legacy_patterns)}


async def _cmd_get_rate_limits(manager: QueueManager, days: int) -> list:
    since = (datetime.now(UTC) - timedelta(days=days)).isoformat()
    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = sqlite3.Row
        query = """
            SELECT provider, model, strftime('%Y-%m-%d', timestamp) as date, COUNT(*) as rate_limits
            FROM key_usage_metrics
            WHERE status = 'error' AND error_detail LIKE '%429%' AND timestamp >= ?
            GROUP BY provider, model, date
            ORDER BY date DESC, rate_limits DESC
        """
        async with db.execute(query, (since,)) as cursor:
            rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def _cmd_get_watchdog_stats(manager: QueueManager) -> dict:
    counts = await manager.get_task_counts()
    current_failed = counts.get("failed", 0)
    current_pending = counts.get("pending", 0)
    last_metrics_json = await manager.get_system_state("watchdog_last_metrics")
    try:
        last_metrics = json.loads(last_metrics_json) if last_metrics_json else {}
    except json.JSONDecodeError:
        last_metrics = {}
    last_failed = last_metrics.get("failed")
    last_timestamp_str = last_metrics.get("timestamp")
    failure_rate = 0.0
    recent_failures = 0
    if last_timestamp_str and last_failed is not None:
        time_delta = datetime.now(UTC) - datetime.fromisoformat(last_timestamp_str)
        minutes_delta = time_delta.total_seconds() / 60.0
        recent_failures = max(0, current_failed - last_failed)
        if minutes_delta > 0:
            failure_rate = recent_failures / minutes_delta
    return {
        "current_pending": current_pending,
        "current_failed_total": current_failed,
        "recent_failures_since_last_check": recent_failures,
        "failure_rate_per_minute": round(failure_rate, 2),
        "last_check": last_timestamp_str,
    }


async def _cmd_route_health(manager: QueueManager, window_minutes: int) -> list:
    since = (datetime.now(UTC) - timedelta(minutes=window_minutes)).isoformat()
    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = sqlite3.Row
        query = """
            SELECT provider, model,
                   SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
                   SUM(CASE WHEN status IN ('error','timeout') THEN 1 ELSE 0 END) AS failures,
                   MAX(timestamp) AS last_event
            FROM key_usage_metrics
            WHERE timestamp >= ?
            GROUP BY provider, model
            ORDER BY failures DESC, successes DESC
        """
        async with db.execute(query, (since,)) as cursor:
            rows = await cursor.fetchall()
    result = []
    now = datetime.now(UTC)
    for r in rows:
        provider = r["provider"]
        model = r["model"] or ""
        failures = int(r["failures"] or 0)
        successes = int(r["successes"] or 0)
        route_key = _route_identifier(provider, model)
        threshold = ROUTE_FAILURE_THRESHOLD
        cooldown_minutes = int(ROUTE_COOLDOWN_DURATION.total_seconds() / 60)
        if "deepseek/" in route_key.lower():
            threshold = DEEPSEEK_ROUTE_FAILURE_THRESHOLD
            cooldown_minutes = int(DEEPSEEK_ROUTE_COOLDOWN_DURATION.total_seconds() / 60)
        is_cooldown_candidate = failures >= threshold and failures > successes
        candidate_until = (now + timedelta(minutes=cooldown_minutes)).isoformat() if is_cooldown_candidate else None
        result.append(
            {
                "provider": provider,
                "model": model,
                "successes": successes,
                "failures": failures,
                "threshold": threshold,
                "cooldown_minutes": cooldown_minutes,
                "cooldown_candidate": is_cooldown_candidate,
                "candidate_until": candidate_until,
                "last_event": r["last_event"],
            }
        )
    return result


async def _cmd_retry_task(manager: QueueManager, task_id: str) -> None:
    task = await manager.get_task(task_id)
    if not task:
        print(f"ERROR: Tarefa {task_id} nao encontrada.")
        return
    await manager.update_task_status(task_id, "pending")
    await manager.update_task_metadata(
        task_id,
        {
            "workflow_status": "pending_retry_forced",
            "retry_timestamp": datetime.now(UTC).isoformat(),
        },
        merge=True,
    )
    print(f"SUCCESS: Tarefa {task_id} reenfileirada com status 'pending'. A autopoiese lidara com ela em breve.")


async def _cmd_retry_failed_tasks(manager: QueueManager) -> None:
    tasks = await manager.get_tasks("failed")
    if not tasks:
        print("INFO: Nenhuma tarefa falha encontrada para reenfileirar.")
        return
    for task in tasks:
        await manager.update_task_status(task.id, "pending")
        await manager.update_task_metadata(
            task.id,
            {
                "workflow_status": "pending_retry_forced",
                "retry_timestamp": datetime.now(UTC).isoformat(),
            },
            merge=True,
        )
    print(f"SUCCESS: {len(tasks)} tarefas 'failed' foram reenfileiradas com sucesso.")


async def _cmd_complete_task(manager: QueueManager, task_id: str) -> None:
    task = await manager.get_task(task_id)
    if not task:
        print(f"ERROR: Tarefa {task_id} nao encontrada.")
        return
    await manager.update_task_status(task_id, "completed")
    await manager.update_task_metadata(
        task_id,
        {
            "workflow_status": "completed",
            "completedAt": datetime.now(UTC).isoformat(),
        },
        merge=True,
    )
    print(f"SUCCESS: Tarefa {task_id} marcada como 'completed'.")


async def _cmd_force_wal_checkpoint(manager: QueueManager) -> None:
    try:
        async with aiosqlite.connect(manager.db_path) as db:
            await db.execute("PRAGMA wal_checkpoint(TRUNCATE);")
    except Exception as e:  # noqa: BLE001
        print(f"Warning: WAL checkpoint failed - {e}")


async def _cmd_check_integrity(manager: QueueManager) -> dict:
    report: dict = {
        "integrity_check": "ok",
        "zombie_tasks": [],
        "orphan_dependencies": [],
    }
    try:
        async with aiosqlite.connect(manager.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("PRAGMA integrity_check;") as cursor:
                result = await cursor.fetchone()
                if result and result[0] != "ok":
                    report["integrity_check"] = result[0]
            two_hours_ago = (datetime.now(UTC) - timedelta(hours=2)).isoformat()
            async with db.execute(
                "SELECT id, agent, timestamp FROM tasks WHERE status = 'running' AND timestamp < ?",
                (two_hours_ago,),
            ) as cursor:
                zombies = await cursor.fetchall()
                report["zombie_tasks"] = [dict(row) for row in zombies]
            async with db.execute(
                "SELECT id, metadata FROM tasks WHERE json_valid(metadata) AND json_extract(metadata, '$.depends_on') IS NOT NULL"
            ) as cursor:
                tasks_with_deps = await cursor.fetchall()
                for task_row in tasks_with_deps:
                    task_id, metadata_json = task_row[0], task_row[1]
                    metadata = json.loads(metadata_json)
                    for dep_id in metadata.get("depends_on", []):
                        async with db.execute("SELECT 1 FROM tasks WHERE id = ?", (dep_id,)) as dep_cursor:
                            if await dep_cursor.fetchone() is None:
                                report["orphan_dependencies"].append(
                                    {
                                        "task_id": task_id,
                                        "missing_dependency": dep_id,
                                    }
                                )
    except Exception as e:  # noqa: BLE001
        report["error"] = str(e)
    return report


async def _cmd_get_agent_report(manager: QueueManager) -> dict:
    since_date = (datetime.now(UTC) - timedelta(days=7)).isoformat()
    report = {}
    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = sqlite3.Row
        async with db.execute(
            """
            SELECT agent, COUNT(*) as completed_tasks
            FROM tasks
            WHERE status = 'completed' AND completedAt >= ?
            GROUP BY agent
        """,
            (since_date,),
        ) as cursor:
            rows = await cursor.fetchall()
            for row in rows:
                agent = row["agent"]
                if agent not in report:
                    report[agent] = {}
                report[agent]["completed_tasks"] = row["completed_tasks"]
        async with db.execute(
            """
            SELECT agent, SUM(total_tokens) as total_tokens
            FROM api_usage
            WHERE timestamp >= ?
            GROUP BY agent
        """,
            (since_date,),
        ) as cursor:
            rows = await cursor.fetchall()
            for row in rows:
                agent = row["agent"]
                if agent not in report:
                    report[agent] = {}
                report[agent]["total_tokens"] = row["total_tokens"]
    for data in report.values():
        if "completed_tasks" not in data:
            data["completed_tasks"] = 0
        if "total_tokens" not in data:
            data["total_tokens"] = 0
    return report


async def _cmd_get_mermaid_graph(manager: QueueManager, status_filter: str) -> None:
    tasks_to_graph = await manager.get_tasks(status=status_filter)
    graph_definition = UniversalArbitrator.generate_dependency_mermaid_graph(tasks_to_graph)
    print(graph_definition)


async def _fetch_gemini_health(session, key, model, system_prompt, health_prompt, client_timeout):
    lm_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    async with session.get(lm_url) as lm_resp:
        if lm_resp.status != 200:
            lm_text = await lm_resp.text()
            return False, False, f"ListModels HTTP {lm_resp.status}: {lm_text[:120]}"

    try:
        from llm.gemini import call_gemini  # noqa: I001

        await call_gemini(
            session,
            model,
            system_prompt,
            health_prompt,
            key,
            client_timeout=client_timeout,
            require_json=False,
        )
        return True, True, "ListModels+GenerateContent OK"
    except Exception as ge:  # noqa: BLE001
        return True, False, f"generateContent falhou ({model}): {str(ge)[:180]}"


async def _test_single_gemini_key(
    session,
    entry,
    manager,
    req_timeout,
    pro_model,
    flash_model,
    system_prompt,
    health_prompt,
    window_minutes,
):
    key = entry["key"]
    pool = entry["pool"]
    mask = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "***"
    key_hash = _key_fingerprint("gemini", key)
    model = pro_model if pool == "pro" else flash_model
    started = time.monotonic()

    try:
        lm_ok, gen_ok, detail = await _fetch_gemini_health(
            session, key, model, system_prompt, health_prompt, req_timeout
        )
        latency_ms = int((time.monotonic() - started) * 1000)
        is_success = lm_ok and gen_ok
        status = "success" if is_success else "error"
        err_class = None if is_success else "GeminiHealthCheckError"
        err_detail = None if is_success else detail

        await manager.record_key_usage_metric(
            provider="gemini",
            key_hash=key_hash,
            status=status,
            latency_ms=latency_ms,
            error_class=err_class,
            error_detail=err_detail,
            model=model,
            agent="@auditor",
            task_id="GEMINI-HEALTH",
        )
        recent = await manager.get_key_recent_stats("gemini", key_hash, window_minutes=window_minutes)

        attempts = int(recent.get("attempts", 0) or 0)
        successes = int(recent.get("successes", 0) or 0)
        avg_lat = float(recent.get("avg_latency_ms") or 1200.0)

        base_score = 100.0 if is_success else 0.0
        score = round(base_score + (successes * 0.2) - (avg_lat / 1000.0), 2)
        success_rate = round(float(successes) / float(max(1, attempts)) * 100.0, 2)

        return {
            "pool": pool,
            "masked_key": mask,
            "model_tested": model,
            "listmodels_ok": lm_ok,
            "generate_ok": gen_ok,
            "status": "ONLINE" if is_success else "FALHA",
            "latency_ms": latency_ms,
            "detail": detail,
            "recent_attempts": attempts,
            "recent_success_rate_pct": success_rate,
            "score": score,
        }
    except Exception as e:  # noqa: BLE001
        return {
            "pool": pool,
            "masked_key": mask,
            "model_tested": model,
            "listmodels_ok": False,
            "generate_ok": False,
            "status": "FALHA",
            "latency_ms": None,
            "detail": f"Erro inesperado: {type(e).__name__}: {str(e)[:180]}",
            "recent_attempts": 0,
            "recent_success_rate_pct": 0.0,
            "score": -100.0,
        }


async def _cmd_run_gemini_health(manager: QueueManager, window_minutes: int) -> dict:
    flash_model = os.environ.get("GEMINI_HEALTH_FLASH_MODEL", "gemini-2.5-flash")
    pro_model = os.environ.get("GEMINI_HEALTH_PRO_MODEL", "gemini-2.5-pro")
    health_prompt = "Responda apenas OK."
    system_prompt = "Voce e um verificador tecnico. Responda apenas com OK."

    if not GEMINI_ALL_KEYS:
        return {"error": "Nenhuma chave Gemini encontrada."}

    entries = []
    for k in GEMINI_PRO_KEYS:
        entries.append({"key": k, "pool": "pro"})
    for k in GEMINI_FLASH_KEYS:
        if not any(e["key"] == k for e in entries):
            entries.append({"key": k, "pool": "flash"})
    for k in GEMINI_KEYS:
        if not any(e["key"] == k for e in entries):
            entries.append({"key": k, "pool": "legacy"})

    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    connector = aiohttp.TCPConnector(ssl=ssl_context, family=socket.AF_INET)
    timeout = aiohttp.ClientTimeout(total=20)
    results = []

    async with aiohttp.ClientSession(connector=connector, trust_env=True, timeout=timeout) as session:
        for entry in entries:
            res = await _test_single_gemini_key(
                session,
                entry,
                manager,
                timeout,
                pro_model,
                flash_model,
                system_prompt,
                health_prompt,
                window_minutes,
            )
            results.append(res)
            await asyncio.sleep(4)

    ranked = sorted(results, key=lambda r: (r["score"], r["recent_success_rate_pct"]), reverse=True)
    return {
        "window_minutes": window_minutes,
        "tested_models": {"pro": pro_model, "flash": flash_model},
        "totals": {
            "keys_tested": len(ranked),
            "online": sum(1 for r in ranked if r["status"] == "ONLINE"),
            "failed": sum(1 for r in ranked if r["status"] != "ONLINE"),
        },
        "ranked_keys": ranked,
    }


async def _cmd_run_health_parallel(manager: QueueManager) -> dict:
    counts = await manager.get_task_counts()
    state_hib = await manager.get_system_state("hibernation_until")
    state_auto = await manager.get_system_state("autonomy_mode")
    budget_day = datetime.now(UTC).strftime("%Y-%m-%d")
    async with (
        aiosqlite.connect(manager.db_path) as db,
        db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (budget_day,)) as cursor,
    ):
        row = await cursor.fetchone()
        used_budget = row[0] if row else 0
    return {
        "status": "ok",
        "timestamp": datetime.now(UTC).isoformat(),
        "task_counts": counts,
        "hibernation_until": state_hib,
        "autonomy_mode": state_auto or "off",
        "budget": {"used": used_budget, "total": DAILY_API_BUDGET},
        "api_keys": {
            "gemini_total": len(GEMINI_ALL_KEYS),
            "anthropic": len(ANTHROPIC_KEYS),
            "openrouter": len(OPENROUTER_KEYS),
        },
    }


async def _check_gemini_via_list_models(session, key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
        status = resp.status
        body = await resp.text()
        if status == 200:
            return True, "ListModels OK"
        if status in (400, 401, 403):
            return False, f"HTTP {status} (chave/permissao)"
        if status == 429:
            return False, "HTTP 429 (cota/rate)"
        if status == 404:
            return False, "HTTP 404 (endpoint/modelo)"
        return False, f"HTTP {status}: {body[:120]}"


async def _check_openrouter_models(session, key):
    url = "https://openrouter.ai/api/v1/models"
    headers = {"Authorization": f"Bearer {key}"}
    async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
        status = resp.status
        body = await resp.text()
        if status == 200:
            return True, "Models OK"
        if status in (400, 401, 403):
            return False, f"HTTP {status} (chave/permissao)"
        if status == 429:
            return False, "HTTP 429 (cota/rate)"
        return False, f"HTTP {status}: {body[:120]}"


def _handle_test_key_error(e, provider, mask):
    if isinstance(e, aiohttp.ClientConnectorError):
        root_cause = e.__cause__ if e.__cause__ else e
        return (provider, mask, STATUS_FAIL, f"Conexao: {root_cause}", LATENCY_NA)
    if isinstance(e, aiohttp.ClientConnectionError):
        root_cause = e.__cause__ if e.__cause__ else e
        return (
            provider,
            mask,
            STATUS_FAIL,
            f"Conexao: {type(root_cause).__name__}: {root_cause}",
            LATENCY_NA,
        )
    if isinstance(e, aiohttp.ClientResponseError):
        error_map = {
            400: "Bad Request (Chave Invalida)",
            401: "Acesso Negado (Chave Invalida)",
            403: "Acesso Negado (Permissao)",
            429: "Rate Limit/Cota Esgotada",
        }
        err_msg = error_map.get(e.status, f"HTTP {e.status}")
        return (provider, mask, STATUS_FAIL, err_msg, LATENCY_NA)
    return (provider, mask, STATUS_FAIL, f"Inesperado: {type(e).__name__}", LATENCY_NA)


async def _test_api_key(session, provider, key, provider_id, semaphore):
    async with semaphore:
        mask = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "***"
        start_time = time.monotonic()
        try:
            if provider_id == "gemini":
                ok, detail = await _check_gemini_via_list_models(session, key)
            elif provider_id == "openrouter":
                ok, detail = await _check_openrouter_models(session, key)
            else:
                from llm.anthropic import call_anthropic  # pylint: disable=import-outside-toplevel # noqa: I001

                await call_anthropic(
                    session,
                    "claude-3-haiku-20240307",
                    "ping",
                    "ping",
                    key,
                    client_timeout=aiohttp.ClientTimeout(total=15),
                    require_json=False,
                )
                ok, detail = True, "Operacional SOTA"

            if not ok:
                return (provider, mask, STATUS_FAIL, detail, LATENCY_NA)

            latency = time.monotonic() - start_time
            return (
                provider,
                mask,
                "[bold green]ONLINE[/]",
                "Operacional SOTA",
                f"{latency:.2f}s",
            )
        except Exception as e:  # noqa: BLE001
            return _handle_test_key_error(e, provider, mask)


async def _cmd_verify_keys(manager: QueueManager):
    c = Console()
    t = Table(
        title="[bold cyan]NEXUS ORCHESTRATOR - Auditoria de Chaves SOTA[/]",
        border_style="cyan",
    )
    t.add_column("Provedor", style="magenta")
    t.add_column("Chave", style="dim")
    t.add_column("Status", justify="center")
    t.add_column("Detalhes", style="white")
    t.add_column("Latencia", style="blue", justify="right")

    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    connector = aiohttp.TCPConnector(ssl=ssl_context, family=socket.AF_INET)
    async with aiohttp.ClientSession(
        connector=connector, trust_env=True, timeout=aiohttp.ClientTimeout(total=15)
    ) as session:
        CONCURRENCY_LIMIT = 4
        semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
        tasks = []
        for k in GEMINI_ALL_KEYS:
            tasks.append(_test_api_key(session, "Gemini", k, "gemini", semaphore))
        for k in OPENROUTER_KEYS:
            tasks.append(_test_api_key(session, "OpenRouter", k, "openrouter", semaphore))
        for k in ANTHROPIC_KEYS:
            tasks.append(_test_api_key(session, "Anthropic", k, "anthropic", semaphore))
        if not tasks:
            c.print("[yellow]Nenhuma chave de API encontrada para auditar.[/]")
            return
        with c.status(f"[cyan]Conectando as mentes globais (Pool SOTA, Concorrencia: {CONCURRENCY_LIMIT})...[/]"):
            results = list(await asyncio.gather(*tasks))

        online_count = sum(1 for r in results if "ONLINE" in str(r[2]))
        fail_count = len(results) - online_count
        audit_payload: dict = {
            "timestamp": datetime.now(UTC).isoformat(),
            "total_keys": len(results),
            "online_keys": online_count,
            "failed_keys": fail_count,
            "method": "Gemini=ListModels; OpenRouter=Models; Anthropic=Messages ping",
            "rows": [
                {
                    "provider": r[0],
                    "masked_key": r[1],
                    "status": "ONLINE" if "ONLINE" in str(r[2]) else "FALHA",
                    "detail": r[3],
                    "latency": str(r[4]).replace("[dim]", "").replace("[/]", ""),
                }
                for r in results
            ],
            "routing_notes": [
                "Chaves Gemini validadas via endpoint /v1beta/models (ListModels).",
                "Falha de modelo fixo nao invalida chave; separar problema de roteamento de modelo.",
            ],
        }
        await manager.set_system_state("keys_last_audit", json.dumps(audit_payload, ensure_ascii=True))

        runtime_file = Path(".claude/RUNTIME_KEYS_ROUTING_STATUS.md")
        runtime_file.parent.mkdir(parents=True, exist_ok=True)  # noqa: ASYNC240
        lines = [
            "# Runtime Keys and Routing Status",
            "",
            f"- timestamp: {audit_payload['timestamp']}",
            f"- total_keys: {audit_payload['total_keys']}",
            f"- online_keys: {audit_payload['online_keys']}",
            f"- failed_keys: {audit_payload['failed_keys']}",
            f"- validation_method: {audit_payload['method']}",
            "",
            "## Routing Notes",
        ]
        lines.extend(f"- {note}" for note in audit_payload["routing_notes"])
        lines.append("")
        lines.append("## Last Audit Rows")
        for row in audit_payload["rows"]:
            lines.append(
                f"- {row['provider']} | {row['masked_key']} | {row['status']} | {row['detail']} | {row['latency']}"
            )
        runtime_file.write_text("\n".join(lines), encoding="utf-8")  # noqa: ASYNC240

        for res in results:
            t.add_row(*res)
        c.print(t)


async def _cli_db_init(argv: list, manager: QueueManager) -> None:
    print("[SISTEMA] Tentando adquirir trava de sistema para inicializacao do banco de dados...")
    lock_acquired = False
    lock_file = None
    mutex = None
    try:
        if os.name == "nt":
            mutex_name = "Global\\NexusDBMutex"
            mutex = ctypes.windll.kernel32.CreateMutexW(None, False, mutex_name)
            wait_result = ctypes.windll.kernel32.WaitForSingleObject(mutex, 10000)
            if wait_result not in (0, 0x80):
                raise BlockingIOError("Nao foi possivel adquirir o Mutex Global. Outro processo pode estar usando.")
        else:
            import fcntl  # pylint: disable=import-error,import-outside-toplevel # noqa: I001

            lock_file_path = Path(argv[0]).parent / ".db.lock"
            lock_file = open(lock_file_path, "w")  # noqa: SIM115, ASYNC230
            fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)  # type: ignore

        lock_acquired = True
        print("[SISTEMA] Trava adquirida. Iniciando DB-INIT...")
        await manager._ensure_initialized()
        print("SUCCESS: Database initialized.")

    except OSError as e:
        print(f"ERROR: Falha ao adquirir trava de sistema. Outro processo pode estar inicializando o DB. Detalhes: {e}")
        sys.exit(1)
    except Exception as e:  # noqa: BLE001
        print(f"ERROR: Falha inesperada durante db-init: {e}")
        sys.exit(1)
    finally:
        if lock_acquired:
            if os.name == "nt" and mutex:
                ctypes.windll.kernel32.ReleaseMutex(mutex)
            elif lock_file:
                import fcntl  # pylint: disable=import-error,import-outside-toplevel # noqa: I001

                fcntl.flock(lock_file, fcntl.LOCK_UN)  # type: ignore
        if mutex:
            ctypes.windll.kernel32.CloseHandle(mutex)
        if lock_file:
            lock_file.close()


async def _cli_add(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando add requer o payload da tarefa.")
        sys.exit(1)
    task_json = ""
    try:
        task_payload = argv[2]
        if task_payload.startswith("{"):
            task_json = task_payload
        else:
            task_payload += "=" * ((4 - len(task_payload) % 4) % 4)
            task_json = base64.b64decode(task_payload).decode("utf-8")
        new_task = Task.model_validate_json(task_json)
        await manager.add_task(new_task)
        print(f"SUCCESS: {new_task.id}")
    except ValidationError as ve:
        print(f"ERROR: Validation error - {ve}")
        sys.exit(1)
    except Exception as e:  # noqa: BLE001
        print(f"ERROR: {e}")
        sys.exit(1)


def _print_tasks_table(tasks: list) -> None:
    table = Table(
        title="[bold cyan]NEXUS ORCHESTRATOR - Registro Akashico[/]",
        border_style="cyan",
        show_lines=True,
    )
    table.add_column("ID / Task", style="cyan", no_wrap=True)
    table.add_column("Agent", style="yellow", justify="center")
    table.add_column("Status", justify="center")
    table.add_column("Priority", justify="center")
    table.add_column("Descricao", style="white", max_width=75, overflow="ellipsis")
    table.add_column("Criacao", style="dim")
    for t in tasks[:50]:
        st_dict: dict[str, str] = {
            "completed": "green",
            "failed": "red",
            "pending": "yellow",
            "running": "magenta",
        }
        st_color = st_dict.get(str(t.status), "white")
        pri = str(t.metadata.get("priority", "normal")) if t.metadata else "normal"
        pri_color = {
            "critical": "bold red",
            "high": "orange3",
            "medium": "yellow",
            "low": "dim white",
            "normal": "white",
        }.get(pri, "white")
        desc = t.description.replace("\r", "").replace("\n", " ")
        display_id = str(t.id)
        if display_id.startswith("NOTIFY-"):
            display_id = f"[bold orange3]🔔 {t.id}[/]"
            desc = f"[orange3]{desc}[/]"
        elif display_id.startswith("AUTOFIX-"):
            display_id = f"[bold red]💉 {t.id}[/]"
        elif display_id.startswith("RESONANCE-"):
            display_id = f"[bold magenta]🌀 {t.id}[/]"
        elif display_id.startswith("HANDOFF-"):
            display_id = f"[bold cyan]🤝 {t.id}[/]"
        ts = t.timestamp[:19].replace("T", " ")
        table.add_row(
            display_id,
            t.agent,
            f"[{st_color}]{t.status.upper()}[/]",
            f"[{pri_color}]{pri.upper()}[/]",
            desc,
            ts,
        )
    console.print(table)


async def _cli_db_get(argv: list, manager: QueueManager) -> None:
    status = argv[2] if len(argv) > 2 else None
    since_hours = None
    if "--since" in argv:
        idx = argv.index("--since")
        if len(argv) > idx + 1:
            val = argv[idx + 1]
            since_hours = int(val[:-1]) if val.endswith("h") else int(val)
    if status == "counts":
        counts = await manager.get_task_counts()
        print(json.dumps(counts))
    elif status == "budget":
        budget = await _cmd_get_budget(manager)
        print(json.dumps(budget))
    else:
        if status in ("all", "--since"):
            status = None
        tasks = await manager.get_tasks(status, since_hours)  # type: ignore
        if "--json" in argv:
            print(json.dumps([t.model_dump() for t in tasks]))
        else:
            _print_tasks_table(tasks)


async def _cli_db_get_notify(argv: list, manager: QueueManager) -> None:
    await _cmd_get_notify(manager, argv)


async def _cli_db_reset_budget(_argv: list, manager: QueueManager) -> None:
    await _cmd_reset_budget(manager)
    print("SUCCESS: Orcamento diario limpo e hibernacao anulada. (Friccao Zero)")


async def _cli_db_stats(_argv: list, manager: QueueManager) -> None:
    stats = await manager.get_performance_history()
    print(json.dumps(stats))


async def _cli_db_key_health(argv: list, manager: QueueManager) -> None:
    try:
        window_minutes = int(argv[2]) if len(argv) > 2 else 180
    except ValueError:
        window_minutes = 180
    report = await manager.get_key_health_report(window_minutes)
    print(json.dumps({"window_minutes": window_minutes, "rows": report}, indent=2))


async def _cli_db_fallback_stats(argv: list, manager: QueueManager) -> None:
    window_minutes = int(argv[2]) if len(argv) > 2 else 180
    print(
        json.dumps(
            {
                "window_minutes": window_minutes,
                "rows": await _cmd_fallback_stats(manager, window_minutes),
            },
            indent=2,
        )
    )


async def _cli_db_fallback_prune(argv: list, manager: QueueManager) -> None:
    days = int(argv[2]) if len(argv) > 2 else 7
    print(json.dumps(await _cmd_prune_fallback(manager, days), indent=2))


async def _cli_db_fallback_prune_legacy(_argv: list, manager: QueueManager) -> None:
    print(json.dumps(await _cmd_prune_legacy_fallback(manager), indent=2))


async def _cli_db_rate_limits(argv: list, manager: QueueManager) -> None:
    days = int(argv[2]) if len(argv) > 2 else 7
    print(
        json.dumps(
            {
                "days": days,
                "rate_limits_429": await _cmd_get_rate_limits(manager, days),
            },
            indent=2,
        )
    )


async def _cli_watchdog(_argv: list, manager: QueueManager) -> None:
    print(json.dumps(await _cmd_get_watchdog_stats(manager), indent=2))


async def _cli_db_route_health(argv: list, manager: QueueManager) -> None:
    try:
        window_minutes = int(argv[2]) if len(argv) > 2 else 30
    except ValueError:
        window_minutes = 30
    print(
        json.dumps(
            {
                "window_minutes": window_minutes,
                "note": "Cooldown ativo em memoria e por processo; este relatorio mostra candidatos por telemetria recente.",
                "rows": await _cmd_route_health(manager, window_minutes),
            },
            indent=2,
        )
    )


async def _cli_get(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando get requer o task_id.")
        sys.exit(1)
    task_id = argv[2]
    task = await manager.get_task(task_id)
    if task:
        print(json.dumps(task.model_dump(), indent=2))
    else:
        print(f"ERROR: Task {task_id} not found.")


async def _cli_retry(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando retry requer o task_id.")
        sys.exit(1)
    await _cmd_retry_task(manager, argv[2])


async def _cli_retry_failed(_argv: list, manager: QueueManager) -> None:
    await _cmd_retry_failed_tasks(manager)


async def _cli_complete(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando complete requer o task_id.")
        sys.exit(1)
    await _cmd_complete_task(manager, argv[2])


async def _cli_db_cleanup(argv: list, manager: QueueManager) -> None:
    days = int(argv[2]) if len(argv) > 2 else 15
    await manager.cleanup(days)
    deleted_files = 0
    results_dir = Path(".claude/task_results")
    if results_dir.exists():  # noqa: ASYNC240
        cutoff_time = time.time() - (days * 86400)
        for f in results_dir.glob("*.md"):  # noqa: ASYNC240
            if f.is_file() and f.stat().st_mtime < cutoff_time:  # noqa: ASYNC240
                try:
                    f.unlink()  # noqa: ASYNC240
                    deleted_files += 1
                except OSError:
                    continue
    await _cmd_force_wal_checkpoint(manager)
    print(f"SUCCESS: Cleanup done. {deleted_files} arquivos de task_results obliterados (> {days} dias).")


async def _cli_db_delete(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando delete requer o task_id.")
        sys.exit(1)
    task_id = argv[2]
    await manager.delete_task(task_id)
    print(f"SUCCESS: Tarefa {task_id} obliterada do sistema.")


async def _cli_db_backup_online(_argv: list, manager: QueueManager) -> None:
    await manager.online_backup()


async def _cli_db_check_integrity(_argv: list, manager: QueueManager) -> None:
    print(json.dumps(await _cmd_check_integrity(manager), indent=2))


async def _cli_db_get_agent_report(_argv: list, manager: QueueManager) -> None:
    print(json.dumps(await _cmd_get_agent_report(manager), indent=2))


async def _cli_db_mermaid_graph(argv: list, manager: QueueManager) -> None:
    status_filter = argv[2] if len(argv) > 2 else "pending"
    await _cmd_get_mermaid_graph(manager, status_filter)


def _cli_db_commands(_argv: list, _manager: QueueManager) -> None:
    db_commands = {
        "get [all|counts|budget]": "Obtem tarefas, contagens ou o orcamento.",
        "stats": "Obtem o historico de performance.",
        "key-health [minutes]": "Relatorio de saude das chaves por janela temporal.",
        "route-health [minutes]": "Saude de rotas por provider/model e candidatos a cooldown.",
        "cleanup [days]": "Arquiva e remove tarefas antigas.",
        "add [task_b64]": "Adiciona uma nova tarefa (JSON codificado em base64).",
        "init": "Inicializa o banco de dados e suas tabelas.",
        "retry [task_id]": "Reenfileira uma tarefa (muda status para pending) para nova execucao.",
        "watchdog": "Exibe as estatisticas preditivas do Watchdog e taxa de falha atual.",
        "health": "Executa todos os health checks em paralelo e retorna JSON.",
        "ai-simulate [geometric|cfr]": "Simula cenarios SOTA de IA (GTO/CFR e A*).",
    }
    print(json.dumps(db_commands, indent=2, sort_keys=True))


async def _cli_autonomy(argv: list, manager: QueueManager) -> None:
    mode = argv[2] if len(argv) > 2 else "stop"
    if mode == "off":
        mode = "stop"
    if mode not in ["full", "partial", "default", "stop"]:
        print(f"ERROR: Modo de autonomia invalido '{mode}'.")
        sys.exit(1)
    await manager.set_system_state("autonomy_mode", mode)
    labels = {
        "stop": "W0",
        "default": "Homeostase",
        "partial": "Equilibrio",
        "full": "Agencia Total",
    }
    from monitoring.telemetry import send_toast  # pylint: disable=import-outside-toplevel # noqa: I001

    send_toast("Autonomia VITOI 3.2", f"Modo: {labels.get(mode, mode.upper())}", "success")
    print(f"SUCCESS: Autonomia VITOI 3.2 definida para {mode.upper()} -- {labels.get(mode, '')}")


async def _cli_ingest(argv: list, manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando ingest requer um caminho de arquivo.")
        sys.exit(1)
    try:
        project_root = Path(__file__).resolve().parent.parent  # noqa: ASYNC240
        filepath = Path(argv[2]).resolve()  # noqa: ASYNC240

        # SOTA: Validacao estrita O(1) de Path Traversal garantindo flexibilidade absoluta de Ingestao
        # Operacionaliza qualquer alvo da codebase e rejeita escape para fora da arvore.
        if not filepath.is_relative_to(project_root):  # noqa: ASYNC240
            print(f"ERROR: [SEC] Escopo Invalido. O arquivo '{filepath.name}' tenta escapar da raiz do projeto.")
            sys.exit(1)

        is_file = await asyncio.to_thread(filepath.is_file)
        if not is_file:
            print("ERROR: [SEC] O alvo especificado nao e um arquivo valido.")
            sys.exit(1)
        async with aiofiles.open(filepath, encoding="utf-8") as f:
            content = await f.read()
        from agents.autonomy import apply_god_mode  # pylint: disable=import-outside-toplevel # noqa: I001

        await apply_god_mode(content, manager)
        print(f"SUCCESS: Ingestion completed from {filepath}.")

        # SOTA: Amnesia Operacional Condicionada
        # Oblitera o arquivo APENAS se ele estiver em zona temporaria (dropzone).
        # Previne a destruicao de arquivos legitimos da codebase sob ingestao analitica.
        if ".claude" in filepath.parts and "dropzone" in filepath.parts:
            await asyncio.to_thread(filepath.unlink, missing_ok=True)

    except Exception as e:  # noqa: BLE001
        print(f"ERROR: Ingestion failed - {e}")
        sys.exit(1)


async def _cli_query(argv: list, _manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando query requer uma pergunta.")
        sys.exit(1)
    question = " ".join(argv[2:])
    try:
        from core.runtime import get_rag  # pylint: disable=import-outside-toplevel # noqa: I001

        rag = get_rag()
        print(await rag.query_memory(question, n_results=3, local_only=True))
    except Exception as e:  # noqa: BLE001
        print(f"ERROR: {e}")
        sys.exit(1)


async def _cli_gemini_health(argv: list, manager: QueueManager) -> None:
    window_minutes = int(argv[2]) if len(argv) > 2 else 1440
    print(
        json.dumps(
            await _cmd_run_gemini_health(manager, window_minutes),
            indent=2,
            ensure_ascii=True,
        )
    )


async def _cli_check_keys(_argv: list, manager: QueueManager) -> None:
    await _cmd_verify_keys(manager)


async def _cli_health(_argv: list, manager: QueueManager) -> None:
    print(json.dumps(await _cmd_run_health_parallel(manager), indent=2))


async def _cli_worker(_argv: list, _manager: QueueManager) -> None:
    from core.runtime import start_worker_and_api  # type: ignore # pylint: disable=import-outside-toplevel # noqa: I001

    with contextlib.suppress(KeyboardInterrupt):
        await start_worker_and_api()


def _cli_ai_simulate(argv: list, _manager: QueueManager) -> None:
    if len(argv) < 3:
        print("ERROR: O comando ai-simulate requer um subcomando (geometric ou cfr).")
        sys.exit(1)

    subcmd = argv[2]

    # SOTA: Lazy import para manter o kernel leve
    from engine.math_sota import calculate_geometric_sizing, cfr_mock_strategy  # pylint: disable=import-outside-toplevel # noqa: I001

    if subcmd == "geometric":
        if len(argv) < 6:
            print("Uso: nexus-cli ai-simulate geometric <current_pot> <target_pot> <streets>")
            return
        try:
            c_pot = float(argv[3])
            t_pot = float(argv[4])
            sts = int(argv[5])
            f = calculate_geometric_sizing(c_pot, t_pot, sts)
            print(f"Geometric Sizing Fraction (f): {f:.3f} ({f * 100:.1f}%)")
        except ValueError:
            print("ERROR: Parametros numericos invalidos para geometric.")

    elif subcmd == "cfr":
        if len(argv) < 4:
            print('Uso: nexus-cli ai-simulate cfr \'{"fold": 10.0, "call": 20.0, "raise": -5.0}\'')
            return
        try:
            regrets = json.loads(argv[3])
            strat = cfr_mock_strategy(regrets)
            print("Estrategia CFR (Mixed):")
            print(json.dumps(strat, indent=2))
        except json.JSONDecodeError:
            print("ERROR: JSON de regrets malformado.")
    else:
        print(f"Subcomando AI desconhecido: {subcmd}")


async def _handle_cli_command(cmd: str, argv: list, manager: QueueManager) -> None:
    handlers = {
        "db-init": _cli_db_init,
        "db-add": _cli_add,
        "add": _cli_add,
        "db-get": _cli_db_get,
        "db-get-notify": _cli_db_get_notify,
        "db-reset-budget": _cli_db_reset_budget,
        "db-stats": _cli_db_stats,
        "db-key-health": _cli_db_key_health,
        "db-fallback-stats": _cli_db_fallback_stats,
        "fallback-stats": _cli_db_fallback_stats,
        "nexus-fallback": _cli_db_fallback_stats,
        "db-fallback-prune": _cli_db_fallback_prune,
        "fallback-prune": _cli_db_fallback_prune,
        "db-fallback-prune-legacy": _cli_db_fallback_prune_legacy,
        "fallback-prune-legacy": _cli_db_fallback_prune_legacy,
        "db-rate-limits": _cli_db_rate_limits,
        "rate-limits": _cli_db_rate_limits,
        "nexus-rate-limits": _cli_db_rate_limits,
        "watchdog": _cli_watchdog,
        "watchdog-stats": _cli_watchdog,
        "db-route-health": _cli_db_route_health,
        "route-health": _cli_db_route_health,
        "nexus-route-health": _cli_db_route_health,
        "get": _cli_get,
        "db-retry": _cli_retry,
        "retry": _cli_retry,
        "db-retry-failed": _cli_retry_failed,
        "retry-failed": _cli_retry_failed,
        "db-complete": _cli_complete,
        "complete": _cli_complete,
        "db-cleanup": _cli_db_cleanup,
        "db-delete": _cli_db_delete,
        "db-backup-online": _cli_db_backup_online,
        "db-check-integrity": _cli_db_check_integrity,
        "db-get-agent-report": _cli_db_get_agent_report,
        "db-mermaid-graph": _cli_db_mermaid_graph,
        "db-commands": _cli_db_commands,
        "autonomy": _cli_autonomy,
        "ingest": _cli_ingest,
        "query": _cli_query,
        "gemini-health": _cli_gemini_health,
        "nexus-gemini-health": _cli_gemini_health,
        "check-keys": _cli_check_keys,
        "nexus-keys": _cli_check_keys,
        "health": _cli_health,
        "worker": _cli_worker,
        "worker-api": _cli_worker,
        "ai-simulate": _cli_ai_simulate,
    }

    if cmd in handlers:
        handler = handlers[cmd]
        if inspect.iscoroutinefunction(handler):
            await handler(argv, manager)
        else:
            handler(argv, manager)
    else:
        print(f"Comando desconhecido: {cmd}")


def run_cli(argv: list):
    """Entry point principal do CLI. Recebe sys.argv e executa o comando correspondente."""

    if len(argv) > 1:
        cmd = argv[1]
        manager = QueueManager()
        asyncio.run(_handle_cli_command(cmd, argv, manager))

    else:
        from core.runtime import start_worker_and_api  # type: ignore # pylint: disable=import-outside-toplevel # noqa: I001

        with contextlib.suppress(KeyboardInterrupt):
            asyncio.run(start_worker_and_api())
