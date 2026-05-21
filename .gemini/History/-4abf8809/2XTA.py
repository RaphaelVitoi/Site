"""
CLI Commands -- Interface de linha de comando do Nexus Orchestrator.
Todos os comandos db-*, check-keys, gemini-health, worker e query.
"""
import json
import sys
import os
import ctypes
import base64
import time
import asyncio
import ssl
import socket
import aiosqlite
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta

import certifi
import aiohttp
from pydantic import ValidationError
from rich.console import Console
from rich.table import Table

from core.schemas import Task
from core.arbitrator import UniversalArbitrator
from database.queue_manager import QueueManager
from llm.budget import (
    DAILY_API_BUDGET,
    GEMINI_ALL_KEYS, GEMINI_PRO_KEYS, GEMINI_FLASH_KEYS, GEMINI_KEYS,
    ANTHROPIC_KEYS, OPENROUTER_KEYS,
    ROUTE_FAILURE_THRESHOLD, ROUTE_COOLDOWN_DURATION,
    DEEPSEEK_ROUTE_FAILURE_THRESHOLD, DEEPSEEK_ROUTE_COOLDOWN_DURATION,
    _route_identifier, _key_fingerprint,
)

if os.name == 'nt':
    pass  # ctypes.wintypes importado via ctypes
else:
    import fcntl

console = Console()


def run_cli(argv: list):
    """Entry point principal do CLI. Recebe sys.argv e executa o comando correspondente."""

    # Imports lazios para evitar circular import com task_executor.py
    # Estes modulos serao extraidos para seus proprios arquivos em fases futuras.
    def _get_runtime():
        import task_executor as te
        return te

    if len(argv) > 1:
        cmd = argv[1]
        manager = QueueManager()

        if cmd == "db-init":
            print("[SISTEMA] Tentando adquirir trava de sistema para inicializacao do banco de dados...")
            lock_acquired = False
            lock_file = None
            mutex = None
            try:
                if os.name == 'nt':
                    mutex_name = "Global\\NexusDBMutex"
                    mutex = ctypes.windll.kernel32.CreateMutexW(None, False, mutex_name)
                    wait_result = ctypes.windll.kernel32.WaitForSingleObject(mutex, 10000)
                    if wait_result not in (0, 0x80):
                        raise BlockingIOError("Nao foi possivel adquirir o Mutex Global. Outro processo pode estar usando.")
                else:
                    lock_file_path = Path(argv[0]).parent / ".db.lock"
                    lock_file = open(lock_file_path, 'w')
                    fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)

                lock_acquired = True
                print("[SISTEMA] Trava adquirida. Iniciando DB-INIT...")
                manager._init_db()
                print("SUCCESS: Database initialized.")

            except (IOError, BlockingIOError) as e:
                print(f"ERROR: Falha ao adquirir trava de sistema. Outro processo pode estar inicializando o DB. Detalhes: {e}")
                sys.exit(1)
            except Exception as e:
                print(f"ERROR: Falha inesperada durante db-init: {e}")
                sys.exit(1)
            finally:
                if lock_acquired:
                    if os.name == 'nt' and mutex:
                        ctypes.windll.kernel32.ReleaseMutex(mutex)
                    elif lock_file:
                        fcntl.flock(lock_file, fcntl.LOCK_UN)
                if mutex:
                    ctypes.windll.kernel32.CloseHandle(mutex)
                if lock_file:
                    lock_file.close()

        elif cmd == "db-add" or cmd == "add":
            if len(argv) < 3:
                print("ERROR: O comando add requer o payload da tarefa.")
                sys.exit(1)
            try:
                task_payload = argv[2]
                if task_payload.startswith("{"):
                    task_json = task_payload
                else:
                    task_payload += "=" * ((4 - len(task_payload) % 4) % 4)
                    task_json = base64.b64decode(task_payload).decode("utf-8")

                new_task = Task.model_validate_json(task_json)
                asyncio.run(manager.add_task(new_task))
                print(f"SUCCESS: {new_task.id}")
            except ValidationError as ve:
                print(f"ERROR: Validation error - {ve}")
                print(f"ERROR: Provided JSON - {task_json}")
                print("ERROR: Certifique-se de que o JSON e valido e adere ao schema correto.")
                sys.exit(1)
            except Exception as e:
                print(f"ERROR: {e}")
                sys.exit(1)

        elif cmd == "db-get":
            status = argv[2] if len(argv) > 2 else None

            since_hours = None
            if "--since" in argv:
                idx = argv.index("--since")
                if len(argv) > idx + 1:
                    val = argv[idx + 1]
                    since_hours = int(val[:-1]) if val.endswith('h') else int(val)

            if status == "counts":
                counts = asyncio.run(manager.get_task_counts())
                print(json.dumps(counts))
            elif status == "budget":
                today = datetime.now().strftime("%Y-%m-%d")
                async def get_budget():
                    async with aiosqlite.connect(manager.db_path) as db:
                        async with db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (today,)) as cursor:
                            row = await cursor.fetchone()
                            current_count = row[0] if row else 0
                            return {"used": current_count, "total": DAILY_API_BUDGET}
                budget = asyncio.run(get_budget())
                print(json.dumps(budget))
            else:
                if status in ("all", "--since"):
                    status = None
                tasks = asyncio.run(manager.get_tasks(status, since_hours))
                if "--json" in argv:
                    print(json.dumps([t.model_dump() for t in tasks]))
                else:
                    table = Table(title="[bold cyan]NEXUS ORCHESTRATOR - Registro Akashico[/]", border_style="cyan", show_lines=True)
                    table.add_column("ID / Task", style="cyan", no_wrap=True)
                    table.add_column("Agent", style="yellow", justify="center")
                    table.add_column("Status", justify="center")
                    table.add_column("Priority", justify="center")
                    table.add_column("Descricao", style="white", max_width=75, overflow="ellipsis")
                    table.add_column("Criacao", style="dim")
                    for t in tasks[:50]:
                        st_color = {"completed": "green", "failed": "red", "pending": "yellow", "running": "magenta"}.get(t.status, "white")
                        pri = t.metadata.get("priority", "normal") if t.metadata else "normal"
                        pri_color = {"critical": "bold red", "high": "orange3", "medium": "yellow", "low": "dim white", "normal": "white"}.get(pri, "white")
                        desc = t.description.replace("\r", "").replace("\n", " ")
                        files_changed = t.metadata.get("files_changed", []) if t.metadata else []
                        if files_changed:
                            unique_files = list(dict.fromkeys(files_changed))
                            files_str = ", ".join(unique_files[:3])
                            if len(unique_files) > 3:
                                files_str += f" (+{len(unique_files)-3})"
                            desc += f" [bold cyan]({files_str})[/bold cyan]"
                            
                        # SOTA: Destaque visual e iconografia para tarefas do Sistema/Kernel
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
                        table.add_row(display_id, t.agent, f"[{st_color}]{t.status.upper()}[/]", f"[{pri_color}]{pri.upper()}[/]", desc, ts)
                    console.print(table)

        elif cmd == "db-reset-budget":
            async def reset_b():
                async with aiosqlite.connect(manager.db_path) as db:
                    await db.execute("DELETE FROM system_state WHERE key='hibernation_until'")
                    await db.execute("DELETE FROM daily_usage")
                    await db.commit()
            asyncio.run(reset_b())
            print("SUCCESS: Orcamento diario limpo e hibernacao anulada. (Friccao Zero)")

        elif cmd == "db-stats":
            stats = asyncio.run(manager.get_performance_history())
            print(json.dumps(stats))

        elif cmd == "db-key-health":
            try:
                window_minutes = int(argv[2]) if len(argv) > 2 else 180
            except ValueError:
                window_minutes = 180
            report = asyncio.run(manager.get_key_health_report(window_minutes))
            print(json.dumps({"window_minutes": window_minutes, "rows": report}, indent=2))

        elif cmd in ("db-fallback-stats", "fallback-stats", "nexus-fallback"):
            window_minutes = int(argv[2]) if len(argv) > 2 else 180
            async def fallback_stats():
                since = (datetime.now() - timedelta(minutes=window_minutes)).isoformat()
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
                        "avg_latency_ms": int(r["avg_latency_ms"]) if r["avg_latency_ms"] is not None else None
                    } for r in rows
                ]
            print(json.dumps({"window_minutes": window_minutes, "rows": asyncio.run(fallback_stats())}, indent=2))

        elif cmd in ("db-fallback-prune", "fallback-prune"):
            days = int(argv[2]) if len(argv) > 2 else 7
            async def prune_fallback_metrics():
                cutoff = (datetime.now() - timedelta(days=days)).isoformat()
                async with aiosqlite.connect(manager.db_path) as db:
                    async with db.execute("SELECT COUNT(*) FROM key_usage_metrics WHERE timestamp < ?", (cutoff,)) as cursor:
                        row = await cursor.fetchone()
                        total_to_delete = int(row[0]) if row and row[0] is not None else 0
                    await db.execute("DELETE FROM key_usage_metrics WHERE timestamp < ?", (cutoff,))
                    await db.commit()
                return {"deleted_rows": total_to_delete, "cutoff_iso": cutoff, "days": days}
            print(json.dumps(asyncio.run(prune_fallback_metrics()), indent=2))

        elif cmd in ("db-fallback-prune-legacy", "fallback-prune-legacy"):
            legacy_patterns = ("gemini-1.5%", "anthropic/%", "claude-%")
            async def prune_legacy_fallback_metrics():
                deleted = 0
                async with aiosqlite.connect(manager.db_path) as db:
                    for pattern in legacy_patterns:
                        async with db.execute("SELECT COUNT(*) FROM key_usage_metrics WHERE model LIKE ?", (pattern,)) as cursor:
                            row = await cursor.fetchone()
                            deleted += int(row[0]) if row and row[0] is not None else 0
                        await db.execute("DELETE FROM key_usage_metrics WHERE model LIKE ?", (pattern,))
                    await db.commit()
                return {"deleted_rows": deleted, "patterns": list(legacy_patterns)}
            print(json.dumps(asyncio.run(prune_legacy_fallback_metrics()), indent=2))

        elif cmd in ("db-rate-limits", "rate-limits", "nexus-rate-limits"):
            days = int(argv[2]) if len(argv) > 2 else 7
            async def get_rate_limits():
                since = (datetime.now() - timedelta(days=days)).isoformat()
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
            print(json.dumps({"days": days, "rate_limits_429": asyncio.run(get_rate_limits())}, indent=2))

        elif cmd in ("watchdog", "watchdog-stats"):
            async def get_watchdog_stats():
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
                    time_delta = datetime.now() - datetime.fromisoformat(last_timestamp_str)
                    minutes_delta = time_delta.total_seconds() / 60.0
                    recent_failures = max(0, current_failed - last_failed)
                    if minutes_delta > 0:
                        failure_rate = recent_failures / minutes_delta
                return {
                    "current_pending": current_pending,
                    "current_failed_total": current_failed,
                    "recent_failures_since_last_check": recent_failures,
                    "failure_rate_per_minute": round(failure_rate, 2),
                    "last_check": last_timestamp_str
                }
            print(json.dumps(asyncio.run(get_watchdog_stats()), indent=2))

        elif cmd in ("db-route-health", "route-health", "nexus-route-health"):
            try:
                window_minutes = int(argv[2]) if len(argv) > 2 else 30
            except ValueError:
                window_minutes = 30
            async def route_health():
                since = (datetime.now() - timedelta(minutes=window_minutes)).isoformat()
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
                now = datetime.now()
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
                    result.append({
                        "provider": provider,
                        "model": model,
                        "successes": successes,
                        "failures": failures,
                        "threshold": threshold,
                        "cooldown_minutes": cooldown_minutes,
                        "cooldown_candidate": is_cooldown_candidate,
                        "candidate_until": candidate_until,
                        "last_event": r["last_event"],
                    })
                return result
            print(json.dumps({
                "window_minutes": window_minutes,
                "note": "Cooldown ativo em memoria e por processo; este relatorio mostra candidatos por telemetria recente.",
                "rows": asyncio.run(route_health())
            }, indent=2))

        elif cmd == "get":
            if len(argv) < 3:
                print("ERROR: O comando get requer o task_id.")
                sys.exit(1)
            task_id = argv[2]
            task = asyncio.run(manager.get_task(task_id))
            if task:
                print(json.dumps(task.model_dump(), indent=2))
            else:
                print(f"ERROR: Task {task_id} not found.")

        elif cmd == "db-cleanup":
            days = int(argv[2]) if len(argv) > 2 else 15
            asyncio.run(manager.cleanup(days))
            deleted_files = 0
            results_dir = Path(".claude/task_results")
            if results_dir.exists():
                cutoff_time = time.time() - (days * 86400)
                for f in results_dir.glob("*.md"):
                    if f.is_file() and f.stat().st_mtime < cutoff_time:
                        try:
                            f.unlink()
                            deleted_files += 1
                        except OSError:
                            pass
            async def force_wal_checkpoint():
                try:
                    async with aiosqlite.connect(manager.db_path) as db:
                        await db.execute("PRAGMA wal_checkpoint(TRUNCATE);")
                except Exception:
                    pass
            asyncio.run(force_wal_checkpoint())
            print(f"SUCCESS: Cleanup done. {deleted_files} arquivos de task_results obliterados (> {days} dias).")

        elif cmd == "db-delete":
            if len(argv) < 3:
                print("ERROR: O comando delete requer o task_id.")
                sys.exit(1)
            task_id = argv[2]
            asyncio.run(manager.delete_task(task_id))
            print(f"SUCCESS: Tarefa {task_id} obliterada do sistema.")

        elif cmd == "db-backup-online":
            asyncio.run(manager.online_backup())

        elif cmd == "db-check-integrity":
            async def check_db_integrity():
                report = {"integrity_check": "ok", "zombie_tasks": [], "orphan_dependencies": []}
                try:
                    async with aiosqlite.connect(manager.db_path) as db:
                        db.row_factory = sqlite3.Row
                        async with db.execute("PRAGMA integrity_check;") as cursor:
                            result = await cursor.fetchone()
                            if result[0] != "ok":
                                report["integrity_check"] = result[0]
                        two_hours_ago = (datetime.now() - timedelta(hours=2)).isoformat()
                        async with db.execute("SELECT id, agent, timestamp FROM tasks WHERE status = 'running' AND timestamp < ?", (two_hours_ago,)) as cursor:
                            zombies = await cursor.fetchall()
                            report["zombie_tasks"] = [dict(row) for row in zombies]
                        async with db.execute("SELECT id, metadata FROM tasks WHERE json_valid(metadata) AND json_extract(metadata, '$.depends_on') IS NOT NULL") as cursor:
                            tasks_with_deps = await cursor.fetchall()
                            for task_row in tasks_with_deps:
                                task_id, metadata_json = task_row[0], task_row[1]
                                metadata = json.loads(metadata_json)
                                for dep_id in metadata.get("depends_on", []):
                                    async with db.execute("SELECT 1 FROM tasks WHERE id = ?", (dep_id,)) as dep_cursor:
                                        if await dep_cursor.fetchone() is None:
                                            report["orphan_dependencies"].append({"task_id": task_id, "missing_dependency": dep_id})
                except Exception as e:
                    report["error"] = str(e)
                print(json.dumps(report, indent=2))
            asyncio.run(check_db_integrity())

        elif cmd == "db-get-agent-report":
            async def get_agent_report():
                since_date = (datetime.now() - timedelta(days=7)).isoformat()
                report = {}
                async with aiosqlite.connect(manager.db_path) as db:
                    db.row_factory = sqlite3.Row
                    async with db.execute("""
                        SELECT agent, COUNT(*) as completed_tasks
                        FROM tasks
                        WHERE status = 'completed' AND completedAt >= ?
                        GROUP BY agent
                    """, (since_date,)) as cursor:
                        rows = await cursor.fetchall()
                        for row in rows:
                            agent = row['agent']
                            if agent not in report:
                                report[agent] = {}
                            report[agent]['completed_tasks'] = row['completed_tasks']
                    async with db.execute("""
                        SELECT agent, SUM(total_tokens) as total_tokens
                        FROM api_usage
                        WHERE timestamp >= ?
                        GROUP BY agent
                    """, (since_date,)) as cursor:
                        rows = await cursor.fetchall()
                        for row in rows:
                            agent = row['agent']
                            if agent not in report:
                                report[agent] = {}
                            report[agent]['total_tokens'] = row['total_tokens']
                for agent, data in report.items():
                    if 'completed_tasks' not in data:
                        data['completed_tasks'] = 0
                    if 'total_tokens' not in data:
                        data['total_tokens'] = 0
                print(json.dumps(report, indent=2))
            asyncio.run(get_agent_report())

        elif cmd == "db-mermaid-graph":
            async def get_mermaid_graph():
                status_filter = argv[2] if len(argv) > 2 else 'pending'
                tasks_to_graph = await manager.get_tasks(status=status_filter)
                graph_definition = UniversalArbitrator.generate_dependency_mermaid_graph(tasks_to_graph)
                print(graph_definition)
            asyncio.run(get_mermaid_graph())

        elif cmd == "db-commands":
            db_commands = {
                "get [all|counts|budget]": "Obtem tarefas, contagens ou o orcamento.",
                "stats": "Obtem o historico de performance (tarefas concluidas por dia).",
                "key-health [minutes]": "Relatorio de saude das chaves por janela temporal.",
                "fallback-stats [minutes]": "Metricas de fallback por provider/model (padrao 180 min).",
                "fallback-prune [days]": "Limpa metricas antigas de fallback (somente key_usage_metrics).",
                "fallback-prune-legacy": "Remove historico legado de modelos antigos (1.5/Anthropic) de key_usage_metrics.",
                "route-health [minutes]": "Saude de rotas por provider/model e candidatos a cooldown.",
                "gemini-health [minutes]": "Auditoria profunda Gemini (ListModels + generateContent) e ranking por chave.",
                "cleanup [days]": "Arquiva e remove tarefas antigas (padrao: 30 dias).",
                "delete [task_id]": "Remove uma tarefa especifica do sistema.",
                "backup-online": "Executa um backup online seguro do banco de dados.",
                "check-integrity": "Verifica a integridade fisica e logica do banco de dados.",
                "reset-budget": "Limpa o orcamento diario e anula a hibernacao.",
                "add [task_b64]": "Adiciona uma nova tarefa (JSON codificado em base64).",
                "init": "Inicializa o banco de dados e suas tabelas.",
                "get-agent-report": "Gera um relatorio semanal de produtividade e custo por agente.",
                "rate-limits [days]": "Exibe o historico de gargalos (HTTP 429) por dia e modelo.",
                "watchdog": "Exibe as estatisticas preditivas do Watchdog e taxa de falha atual.",
                "health": "Executa todos os health checks em paralelo e retorna JSON.",
            }
            print(json.dumps(db_commands, indent=2, sort_keys=True))

        elif cmd == "autonomy":
            mode = argv[2] if len(argv) > 2 else "stop"
            # Normalizacao de legado
            if mode == "off":
                mode = "stop"
            if mode not in ["full", "partial", "default", "stop"]:
                print(f"ERROR: Modo de autonomia invalido '{mode}'. Use: stop, default, partial, full")
                sys.exit(1)
            asyncio.run(manager.set_system_state("autonomy_mode", mode))
            te = _get_runtime()
            labels = {
                "stop": "W0 - Observacao Pura (escrita bloqueada)",
                "default": "Homeostase (auto-fix, sem comandos)",
                "partial": "Equilibrio Bayesiano (impacto controlado)",
                "full": "Agencia Total (autonomia maxima)"
            }
            te.send_toast("Autonomia VITOI 3.2", f"Modo: {labels.get(mode, mode.upper())}", "success")
            print(f"SUCCESS: Autonomia VITOI 3.2 definida para {mode.upper()} -- {labels.get(mode, '')}")

        elif cmd == "ingest":
            if len(argv) < 3:
                print("ERROR: O comando ingest requer um caminho de arquivo.")
                sys.exit(1)
            try:
                filepath = argv[2]
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                te = _get_runtime()
                asyncio.run(te.apply_god_mode(content, manager))
                print(f"SUCCESS: Ingestion completed from {filepath}.")
                os.remove(filepath)
            except Exception as e:
                print(f"ERROR: Ingestion failed - {e}")
                sys.exit(1)

        elif cmd == "query":
            if len(argv) < 3:
                print("ERROR: O comando query requer uma pergunta.")
                sys.exit(1)
            question = " ".join(argv[2:])
            try:
                te = _get_runtime()
                rag = te.get_rag()
                print(asyncio.run(rag.query_memory(question, n_results=3, local_only=True, synthesize=True)))
            except Exception as e:
                print(f"ERROR: {e}")
                sys.exit(1)

        elif cmd in ("gemini-health", "nexus-gemini-health"):
            window_minutes = int(argv[2]) if len(argv) > 2 else 1440

            async def run_gemini_health():
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
                connector = aiohttp.TCPConnector(ssl=ssl_context, family=socket.AF_INET)
                timeout = aiohttp.ClientTimeout(total=20)
                results = []

                te = _get_runtime()
                async with aiohttp.ClientSession(connector=connector, trust_env=True, timeout=timeout) as session:
                    for entry in entries:
                        key = entry["key"]
                        pool = entry["pool"]
                        mask = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "***"
                        key_hash = _key_fingerprint("gemini", key)
                        model = pro_model if pool == "pro" else flash_model
                        started = time.monotonic()
                        list_models_ok = False
                        generate_ok = False
                        detail = "OK"

                        try:
                            lm_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
                            async with session.get(lm_url) as lm_resp:
                                if lm_resp.status == 200:
                                    list_models_ok = True
                                else:
                                    lm_text = await lm_resp.text()
                                    detail = f"ListModels HTTP {lm_resp.status}: {lm_text[:120]}"

                            if list_models_ok:
                                try:
                                    _text, _usage = await te.call_gemini(session, model, system_prompt, health_prompt, key)
                                    generate_ok = True
                                except Exception as ge:
                                    detail = f"generateContent falhou ({model}): {str(ge)[:180]}"

                            latency_ms = int((time.monotonic() - started) * 1000)
                            status = "success" if (list_models_ok and generate_ok) else "error"
                            await manager.record_key_usage_metric(
                                provider="gemini", key_hash=key_hash, status=status,
                                latency_ms=latency_ms,
                                error_class=None if status == "success" else "GeminiHealthCheckError",
                                error_detail=None if status == "success" else detail,
                                model=model, agent="@auditor", task_id="GEMINI-HEALTH"
                            )
                            recent = await manager.get_key_recent_stats("gemini", key_hash, window_minutes=window_minutes)
                            score = round(
                                (100.0 if status == "success" else 0.0)
                                + (recent.get("successes", 0) * 0.2)
                                - ((recent.get("avg_latency_ms") or 1200.0) / 1000.0),
                                2
                            )
                            results.append({
                                "pool": pool, "masked_key": mask, "model_tested": model,
                                "listmodels_ok": list_models_ok, "generate_ok": generate_ok,
                                "status": "ONLINE" if status == "success" else "FALHA",
                                "latency_ms": latency_ms,
                                "detail": detail if status != "success" else "ListModels+GenerateContent OK",
                                "recent_attempts": int(recent.get("attempts", 0) or 0),
                                "recent_success_rate_pct": round(float(recent.get("successes", 0) or 0) / float(max(1, recent.get("attempts", 0) or 0)) * 100.0, 2),
                                "score": score,
                            })
                        except Exception as e:
                            results.append({
                                "pool": pool, "masked_key": mask, "model_tested": model,
                                "listmodels_ok": False, "generate_ok": False,
                                "status": "FALHA", "latency_ms": None,
                                "detail": f"Erro inesperado: {type(e).__name__}: {str(e)[:180]}",
                                "recent_attempts": 0, "recent_success_rate_pct": 0.0, "score": -100.0,
                            })
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

            print(json.dumps(asyncio.run(run_gemini_health()), indent=2, ensure_ascii=True))

        elif cmd in ("check-keys", "nexus-keys"):
            async def verify_keys():
                from rich.table import Table
                from rich.console import Console
                c = Console()
                t = Table(title="[bold cyan]NEXUS ORCHESTRATOR - Auditoria de Chaves SOTA[/]", border_style="cyan")
                t.add_column("Provedor", style="magenta")
                t.add_column("Chave", style="dim")
                t.add_column("Status", justify="center")
                t.add_column("Detalhes", style="white")
                t.add_column("Latencia", style="blue", justify="right")

                async def check_gemini_via_list_models(session, key):
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

                async def check_openrouter_models(session, key):
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

                async def test_key(session, provider, key, provider_id, semaphore):
                    async with semaphore:
                        te = _get_runtime()
                        mask = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "***"
                        start_time = time.monotonic()
                        try:
                            if provider_id == "gemini":
                                ok, detail = await check_gemini_via_list_models(session, key)
                                if not ok:
                                    return (provider, mask, "[bold red]FALHA[/]", detail, "[dim]N/A[/]")
                            elif provider_id == "openrouter":
                                ok, detail = await check_openrouter_models(session, key)
                                if not ok:
                                    return (provider, mask, "[bold red]FALHA[/]", detail, "[dim]N/A[/]")
                            else:
                                await te.call_anthropic(session, "claude-3-haiku-20240307", "ping", "ping", key)
                            latency = time.monotonic() - start_time
                            return (provider, mask, "[bold green]ONLINE[/]", "Operacional SOTA", f"{latency:.2f}s")
                        except aiohttp.ClientConnectorError as e:
                            root_cause = e.__cause__ if e.__cause__ else e
                            return (provider, mask, "[bold red]FALHA[/]", f"Conexao: {root_cause}", "[dim]N/A[/]")
                        except aiohttp.ClientConnectionError as e:
                            root_cause = e.__cause__ if e.__cause__ else e
                            return (provider, mask, "[bold red]FALHA[/]", f"Conexao: {type(root_cause).__name__}: {root_cause}", "[dim]N/A[/]")
                        except aiohttp.ClientResponseError as e:
                            error_map = {400: "Bad Request (Chave Invalida)", 401: "Acesso Negado (Chave Invalida)", 403: "Acesso Negado (Permissao)", 429: "Rate Limit/Cota Esgotada"}
                            err_msg = error_map.get(e.status, f"HTTP {e.status}")
                            return (provider, mask, "[bold red]FALHA[/]", err_msg, "[dim]N/A[/]")
                        except Exception as e:
                            return (provider, mask, "[bold red]FALHA[/]", f"Inesperado: {type(e).__name__}", "[dim]N/A[/]")

                ssl_context = ssl.create_default_context(cafile=certifi.where())
                connector = aiohttp.TCPConnector(ssl=ssl_context, family=socket.AF_INET)
                async with aiohttp.ClientSession(connector=connector, trust_env=True, timeout=aiohttp.ClientTimeout(total=15)) as session:
                    CONCURRENCY_LIMIT = 4
                    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
                    tasks = []
                    for k in GEMINI_ALL_KEYS:
                        tasks.append(test_key(session, "Gemini", k, "gemini", semaphore))
                    for k in OPENROUTER_KEYS:
                        tasks.append(test_key(session, "OpenRouter", k, "openrouter", semaphore))
                    for k in ANTHROPIC_KEYS:
                        tasks.append(test_key(session, "Anthropic", k, "anthropic", semaphore))
                    if not tasks:
                        c.print("[yellow]Nenhuma chave de API encontrada para auditar.[/]")
                        return
                    with c.status(f"[cyan]Conectando as mentes globais (Pool SOTA, Concorrencia: {CONCURRENCY_LIMIT})...[/]"):
                        results = await asyncio.gather(*tasks)

                    online_count = sum(1 for r in results if "ONLINE" in r[2])
                    fail_count = len(results) - online_count
                    audit_payload = {
                        "timestamp": datetime.now().isoformat(),
                        "total_keys": len(results),
                        "online_keys": online_count,
                        "failed_keys": fail_count,
                        "method": "Gemini=ListModels; OpenRouter=Models; Anthropic=Messages ping",
                        "rows": [
                            {
                                "provider": r[0], "masked_key": r[1],
                                "status": "ONLINE" if "ONLINE" in r[2] else "FALHA",
                                "detail": r[3],
                                "latency": str(r[4]).replace("[dim]", "").replace("[/]", "")
                            } for r in results
                        ],
                        "routing_notes": [
                            "Chaves Gemini validadas via endpoint /v1beta/models (ListModels).",
                            "Falha de modelo fixo nao invalida chave; separar problema de roteamento de modelo.",
                        ]
                    }
                    await manager.set_system_state("keys_last_audit", json.dumps(audit_payload, ensure_ascii=True))

                    runtime_file = Path(".claude/RUNTIME_KEYS_ROUTING_STATUS.md")
                    runtime_file.parent.mkdir(parents=True, exist_ok=True)
                    lines = [
                        "# Runtime Keys and Routing Status", "",
                        f"- timestamp: {audit_payload['timestamp']}",
                        f"- total_keys: {audit_payload['total_keys']}",
                        f"- online_keys: {audit_payload['online_keys']}",
                        f"- failed_keys: {audit_payload['failed_keys']}",
                        f"- validation_method: {audit_payload['method']}", "",
                        "## Routing Notes",
                    ]
                    lines.extend(f"- {note}" for note in audit_payload["routing_notes"])
                    lines.append("")
                    lines.append("## Last Audit Rows")
                    for row in audit_payload["rows"]:
                        lines.append(f"- {row['provider']} | {row['masked_key']} | {row['status']} | {row['detail']} | {row['latency']}")
                    runtime_file.write_text("\n".join(lines), encoding="utf-8")

                    for res in results:
                        t.add_row(*res)
                    c.print(t)

            asyncio.run(verify_keys())

        elif cmd == "health":
            # Potencializacao: executa todos os health checks em paralelo
            async def run_health_parallel():
                counts = await manager.get_task_counts()
                state_hib = await manager.get_system_state("hibernation_until")
                state_auto = await manager.get_system_state("autonomy_mode")
                budget_day = datetime.now().strftime("%Y-%m-%d")
                async with aiosqlite.connect(manager.db_path) as db:
                    async with db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (budget_day,)) as cursor:
                        row = await cursor.fetchone()
                        used_budget = row[0] if row else 0
                return {
                    "status": "ok",
                    "timestamp": datetime.now().isoformat(),
                    "task_counts": counts,
                    "hibernation_until": state_hib,
                    "autonomy_mode": state_auto or "off",
                    "budget": {"used": used_budget, "total": DAILY_API_BUDGET},
                    "api_keys": {
                        "gemini_total": len(GEMINI_ALL_KEYS),
                        "anthropic": len(ANTHROPIC_KEYS),
                        "openrouter": len(OPENROUTER_KEYS),
                    }
                }
            print(json.dumps(asyncio.run(run_health_parallel()), indent=2))

        elif cmd in ("worker", "worker-api"):
            te = _get_runtime()
            try:
                asyncio.run(te.start_worker_and_api())
            except KeyboardInterrupt:
                pass

    else:
        te = _get_runtime()
        try:
            asyncio.run(te.start_worker_and_api())
        except KeyboardInterrupt:
            pass
