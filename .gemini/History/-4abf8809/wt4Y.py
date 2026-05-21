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
                budget = asyncio.run(_cmd_get_budget(manager))
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

        elif cmd == "db-get-notify":
            asyncio.run(_cmd_get_notify(manager, argv))

        elif cmd == "db-reset-budget":
            asyncio.run(_cmd_reset_budget(manager))
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
            print(json.dumps({"window_minutes": window_minutes, "rows": asyncio.run(_cmd_fallback_stats(manager, window_minutes))}, indent=2))

        elif cmd in ("db-fallback-prune", "fallback-prune"):
            days = int(argv[2]) if len(argv) > 2 else 7
            print(json.dumps(asyncio.run(_cmd_prune_fallback(manager, days)), indent=2))

        elif cmd in ("db-fallback-prune-legacy", "fallback-prune-legacy"):
            print(json.dumps(asyncio.run(_cmd_prune_legacy_fallback(manager)), indent=2))

        elif cmd in ("db-rate-limits", "rate-limits", "nexus-rate-limits"):
            days = int(argv[2]) if len(argv) > 2 else 7
            print(json.dumps({"days": days, "rate_limits_429": asyncio.run(_cmd_get_rate_limits(manager, days))}, indent=2))

        elif cmd in ("watchdog", "watchdog-stats"):
            print(json.dumps(asyncio.run(_cmd_get_watchdog_stats(manager)), indent=2))

        elif cmd in ("db-route-health", "route-health", "nexus-route-health"):
            try:
                window_minutes = int(argv[2]) if len(argv) > 2 else 30
            except ValueError:
                window_minutes = 30
            print(json.dumps({
                "window_minutes": window_minutes,
                "note": "Cooldown ativo em memoria e por processo; este relatorio mostra candidatos por telemetria recente.",
                "rows": asyncio.run(_cmd_route_health(manager, window_minutes))
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

        elif cmd in ("db-retry", "retry"):
            if len(argv) < 3:
                print("ERROR: O comando retry requer o task_id.")
                sys.exit(1)
            asyncio.run(_cmd_retry_task(manager, argv[2]))

        elif cmd in ("db-retry-failed", "retry-failed"):
            asyncio.run(_cmd_retry_failed_tasks(manager))

        elif cmd in ("db-complete", "complete"):
            if len(argv) < 3:
                print("ERROR: O comando complete requer o task_id.")
                sys.exit(1)
            asyncio.run(_cmd_complete_task(manager, argv[2]))

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
            asyncio.run(_cmd_force_wal_checkpoint(manager))
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
            print(json.dumps(asyncio.run(_cmd_check_integrity(manager)), indent=2))

        elif cmd == "db-get-agent-report":
            print(json.dumps(asyncio.run(_cmd_get_agent_report(manager)), indent=2))

        elif cmd == "db-mermaid-graph":
            status_filter = argv[2] if len(argv) > 2 else 'pending'
            asyncio.run(_cmd_get_mermaid_graph(manager, status_filter))

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
                "get-notify": "Lista apenas tarefas de NOTIFY-* pendentes para auditoria do Sentinela.",
                "retry [task_id]": "Reenfileira uma tarefa (muda status para pending) para nova execucao.",
                "retry-failed": "Reenfileira TODAS as tarefas com status 'failed'.",
                "complete [task_id]": "Marca uma tarefa manualmente como 'completed'.",
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
            print(json.dumps(asyncio.run(_cmd_run_gemini_health(manager, window_minutes)), indent=2, ensure_ascii=True))

        elif cmd in ("check-keys", "nexus-keys"):
            asyncio.run(_cmd_verify_keys(manager))

        elif cmd == "health":
            print(json.dumps(asyncio.run(_cmd_run_health_parallel(manager)), indent=2))

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
