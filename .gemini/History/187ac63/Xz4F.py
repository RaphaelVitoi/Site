import os
import json
import sqlite3
import aiosqlite
import logging
import gc
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from core.schemas import Task
from core.config import PROTECTED_AGENTS_FROM_CLEANUP
import core.config as _core_config

class QueueManager:
    """
    Gerenciador de Fila SOTA (Data Access Layer).
    Operacoes 100% Assincronas via aiosqlite, com blindagem contra Path Traversal,
    Transacoes ACID, Controle de Orcamento e Expurgo de Entropia.
    """
    def __init__(self, queue_path: Optional[str] = None):
        self.base_path = Path(__file__).parent.parent.resolve()
        if queue_path is None:
            env_db = os.environ.get("SQLITE_DB_PATH")
            if env_db:
                self.db_path = Path(env_db)
            else:
                self.db_path = self.base_path / "queue" / "tasks.db"
            self.db_path = self._ensure_writable_db_path(self.db_path)
            self._is_memory = False
        else:
            if queue_path == ":memory:":
                self.db_path = ":memory:"
                self._is_memory = True
                self._memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
                self._memory_conn.row_factory = sqlite3.Row
            else:
                self.db_path = Path(queue_path)
                self.db_path = self._ensure_writable_db_path(self.db_path)
                self._is_memory = False

        # Blindagem de Seguranca SOTA: Prevenir Path Traversal.
        # This check is now more robust using pathlib's relative_to.
        if not self._is_memory and isinstance(self.db_path, Path):
            is_safe = False
            try:
                self.db_path.absolute().relative_to(self.base_path.absolute())
                is_safe = True
            except ValueError:
                pass

            if not is_safe:
                base_path = self.base_path.resolve()
                db_path_resolved = self.db_path.resolve(strict=False)
                try:
                    db_path_resolved.relative_to(base_path)
                except ValueError:
                    if not str(db_path_resolved).lower().startswith(str(base_path).lower()):
                        logging.critical(f"[SEC] Tentativa de Path Traversal bloqueada: '{self.db_path}' fora da raiz.")
                        raise PermissionError("Database path is outside the project root.")

        self._init_db()

    def _ensure_writable_db_path(self, desired_path: Path) -> Path:
        """Garante caminho de DB gravavel e dentro da raiz; usa fallback local quando necessario."""
        base_resolved = self.base_path.resolve()

        # SOTA: Checagem rapida sem resolve() para evitar falsos positivos de symlinks do OneDrive
        is_safe = False
        try:
            desired_path.absolute().relative_to(self.base_path.absolute())
            is_safe = True
        except ValueError:
            pass

        if not is_safe:
            desired_resolved = desired_path.resolve(strict=False)
            try:
                desired_resolved.relative_to(base_resolved)
            except ValueError:
                # Fallback SOTA para divergencia de case no drive letter (Windows/OneDrive)
                if not str(desired_resolved).lower().startswith(str(base_resolved).lower()):
                    fallback = self.base_path / ".nexus_runtime" / "queue" / desired_path.name
                    fallback.parent.mkdir(parents=True, exist_ok=True)
                    logging.warning(f"[DB] Caminho padrao resolve fora da raiz. Usando fallback local: {fallback}")
                    return fallback

        desired_path.parent.mkdir(parents=True, exist_ok=True)
        probe = desired_path.parent / ".write_probe"
        try:
            probe.write_text("ok", encoding="ascii")
            probe.unlink(missing_ok=True)
            return desired_path
        except OSError:
            fallback = self.base_path / ".nexus_runtime" / "queue" / desired_path.name
            fallback.parent.mkdir(parents=True, exist_ok=True)
            fallback_probe = fallback.parent / ".write_probe"
            fallback_probe.write_text("ok", encoding="ascii")
            fallback_probe.unlink(missing_ok=True)
            logging.warning(f"[DB] Caminho padrao sem permissao de escrita. Usando fallback local: {fallback}")
            return fallback

    def _get_conn(self):
        # Usado estritamente para inicializacao sincrona da estrutura
        if getattr(self, '_is_memory', False):
            return self._memory_conn
        return sqlite3.connect(self.db_path, timeout=30.0)

    def close(self):
        if getattr(self, '_is_memory', False) and hasattr(self, '_memory_conn'):
            self._memory_conn.close()

    def _init_db(self):
        conn = self._get_conn()
        try:
            # Injeta PRAGMAs de Alta Performance (Concorrencia Assincrona SOTA)
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute("PRAGMA busy_timeout=5000;")

            conn.execute("""
                CREATE TABLE IF NOT EXISTS llm_cache (
                    model TEXT NOT NULL,
                    prompt TEXT NOT NULL,
                    response TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    PRIMARY KEY (model, prompt)
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_model_prompt ON llm_cache (model, prompt)")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    description TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    agent TEXT NOT NULL,
                    priority TEXT DEFAULT 'normal',
                    metadata TEXT,
                    completedAt TEXT
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_status_time ON tasks (status, timestamp)")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    agent TEXT NOT NULL,
                    model TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    prompt_tokens INTEGER,
                    completion_tokens INTEGER,
                    total_tokens INTEGER,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS key_usage_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    provider TEXT NOT NULL,
                    key_hash TEXT NOT NULL,
                    status TEXT NOT NULL,
                    latency_ms INTEGER,
                    error_class TEXT,
                    error_detail TEXT,
                    model TEXT,
                    agent TEXT,
                    task_id TEXT,
                    total_tokens INTEGER,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_key_usage_provider_hash_time ON key_usage_metrics (provider, key_hash, timestamp)")
            conn.execute("CREATE TABLE IF NOT EXISTS daily_usage ( date TEXT PRIMARY KEY, call_count INTEGER NOT NULL )")
            conn.execute("CREATE TABLE IF NOT EXISTS system_state ( key TEXT PRIMARY KEY, value TEXT )")
            conn.commit()
        finally:
            if not getattr(self, '_is_memory', False):
                conn.close()

    def _enforce_backup_retention_policy(self, backup_dir: Path, max_backups: int):
        """Garante que apenas um numero maximo de backups seja mantido."""
        try:
            backups = sorted(backup_dir.glob(f"{Path(self.db_path).stem}_*.db"), key=os.path.getmtime, reverse=True)
            if len(backups) > max_backups:
                for old_backup in backups[max_backups:]:
                    old_backup.unlink()
                    logging.info(f"[BACKUP] Backup antigo removido: {old_backup.name}")
        except Exception as e:
            logging.error(f"[BACKUP] Falha ao aplicar a politica de retencao de backups: {e}")

    async def online_backup(self):
        """
        Cria um backup do banco de dados SQLite usando a API de Backup Online.
        Evita locks e corrupcao em banco ativo.
        """
        if getattr(self, '_is_memory', False):
            logging.info("[BACKUP] Backup online ignorado para banco de dados em memoria.")
            return

        backup_dir = Path(self.db_path).parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_path = backup_dir / f"{Path(self.db_path).stem}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"

        try:
            async with aiosqlite.connect(self.db_path) as source_db:
                await source_db.execute("PRAGMA wal_checkpoint(FULL)")
                async with aiosqlite.connect(backup_path) as backup_db:
                    await source_db.backup(backup_db)
            logging.info(f"[BACKUP] Backup online concluido com sucesso: {backup_path}")
            self._enforce_backup_retention_policy(backup_dir, max_backups=20)
        except Exception as e:
            logging.error(f"[BACKUP] Falha critica durante o backup online: {e}")
            if backup_path.exists():
                try:
                    backup_path.unlink()
                except Exception as unlink_e:
                    logging.error(f"[BACKUP] Falha ao remover arquivo de backup corrompido: {unlink_e}")

    async def add_task(self, task: Task) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT OR REPLACE INTO tasks
                (id, description, status, timestamp, agent, priority, metadata, completedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.id,
                task.description,
                task.status,
                task.timestamp,
                task.agent,
                task.metadata.get("priority", "normal") if task.metadata else "normal",
                json.dumps(task.metadata) if task.metadata else '{}',
                task.completedAt
            ))
            await db.commit()

    async def get_task(self, task_id: str) -> Optional[Task]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return self._row_to_task(row)
        return None

    async def get_next_task(self) -> Optional[Task]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("""
                SELECT t1.* FROM tasks AS t1
                WHERE t1.status = 'pending' AND NOT EXISTS (
                    SELECT 1 FROM json_each(t1.metadata, '$.depends_on') AS dep
                    JOIN tasks AS t2 ON t2.id = dep.value
                    WHERE t2.status NOT IN ('completed', 'cancelled')
                )
                ORDER BY
                    CASE t1.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 3 END,
                    t1.timestamp ASC
                LIMIT 1
            """) as cursor:
                row = await cursor.fetchone()
            if row:
                return self._row_to_task(row)
        return None

    async def update_task_status(self, task_id: str, new_status: str) -> None:
        completed_at = datetime.now().isoformat() if new_status in ["completed", "failed"] else None
        async with aiosqlite.connect(self.db_path) as db:
            if completed_at:
                await db.execute("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?", (new_status, completed_at, task_id))
            else:
                await db.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            await db.commit()

    async def update_task_metadata(self, task_id: str, metadata_patch: Dict[str, Any], merge: bool = True) -> None:
        """Atualiza metadata de uma tarefa de forma segura, preservando dados existentes por padrao."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("BEGIN EXCLUSIVE")
            db.row_factory = sqlite3.Row
            async with db.execute("SELECT metadata FROM tasks WHERE id = ?", (task_id,)) as cursor:
                row = await cursor.fetchone()
            if not row:
                await db.rollback()
                return

            current = {}
            if row["metadata"]:
                try:
                    current = json.loads(row["metadata"])
                except json.JSONDecodeError as e:
                    logging.error(f"[DAL] Entropia semantica detectada: Corrupcao JSON na tarefa {task_id}. Erro: {e}")
                    current = {}

            updated = dict(current) if merge else {}
            updated.update(metadata_patch or {})
            await db.execute(
                "UPDATE tasks SET metadata = ?, priority = ? WHERE id = ?",
                (
                    json.dumps(updated, ensure_ascii=True),
                    updated.get("priority", current.get("priority", "normal")),
                    task_id,
                ),
            )
            await db.commit()

    async def delete_task(self, task_id: str) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            await db.commit()

    async def get_tasks(self, status: Optional[str] = None, since_hours: Optional[int] = None) -> List[Task]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            query = "SELECT * FROM tasks"
            params = []
            conditions = []

            if status:
                conditions.append("status = ?")
                params.append(status)
            if since_hours:
                cutoff = (datetime.now() - timedelta(hours=since_hours)).isoformat()
                conditions.append("timestamp >= ?")
                params.append(cutoff)

            if conditions:
                query += " WHERE " + " AND ".join(conditions)

            query += " ORDER BY timestamp DESC"
            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
            return [self._row_to_task(row) for row in rows]

    async def get_task_counts(self) -> Dict[str, int]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status") as cursor:
                rows = await cursor.fetchall()
                counts = { "pending": 0, "running": 0, "completed": 0, "failed": 0 }
                for r in rows:
                    if r["status"] in counts:
                        counts[r["status"]] = r["count"]
                return counts

    async def get_performance_history(self) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            query = """
                SELECT date(completedAt) as day, COUNT(*) as count
                FROM tasks
                WHERE status = 'completed' AND completedAt IS NOT NULL
                GROUP BY day
                ORDER BY day ASC
            """
            async with db.execute(query) as cursor:
                rows = await cursor.fetchall()
                return [{"day": r["day"], "count": r["count"]} for r in rows]

    async def get_llm_cache(self, model: str, prompt: str) -> Optional[str]:
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT response FROM llm_cache WHERE model = ? AND prompt = ?", (model, prompt)) as cursor:
                row = await cursor.fetchone()
                if row is not None:
                    return row[0]
        return None

    async def update_llm_cache(self, model: str, prompt: str, response: str) -> None:
        if response is None:
            logging.warning("[CACHE] Ignorando escrita de cache com resposta nula.")
            return
        timestamp = datetime.now().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """, (model, prompt, response, timestamp))
            await db.commit()

    async def record_api_usage(self, task_id: str, agent: str, model: str, provider: str, prompt_tokens: int, completion_tokens: int) -> None:
        total = prompt_tokens + completion_tokens
        timestamp = datetime.now().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO api_usage (task_id, agent, model, provider, prompt_tokens, completion_tokens, total_tokens, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (task_id, agent, model, provider, prompt_tokens, completion_tokens, total, timestamp))
            await db.commit()

    async def record_key_usage_metric(
        self,
        provider: str,
        key_hash: str,
        status: str,
        latency_ms: Optional[int] = None,
        error_class: Optional[str] = None,
        error_detail: Optional[str] = None,
        model: Optional[str] = None,
        agent: Optional[str] = None,
        task_id: Optional[str] = None,
        total_tokens: Optional[int] = None
    ) -> None:
        timestamp = datetime.now().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO key_usage_metrics (
                    provider, key_hash, status, latency_ms, error_class, error_detail,
                    model, agent, task_id, total_tokens, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                provider, key_hash, status, latency_ms, error_class,
                (error_detail[:512] if error_detail else None),
                model, agent, task_id, total_tokens, timestamp
            ))
            await db.commit()

    async def get_key_recent_stats(self, provider: str, key_hash: str, window_minutes: int = 180) -> Dict[str, Any]:
        cutoff = (datetime.now() - timedelta(minutes=window_minutes)).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("""
                SELECT
                    COUNT(*) AS attempts,
                    SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
                    SUM(CASE WHEN status!='success' THEN 1 ELSE 0 END) AS failures,
                    AVG(latency_ms) AS avg_latency_ms,
                    AVG(total_tokens) AS avg_tokens
                FROM key_usage_metrics
                WHERE provider = ? AND key_hash = ? AND timestamp >= ?
            """, (provider, key_hash, cutoff)) as cursor:
                row = await cursor.fetchone()

        if not row or row["attempts"] is None:
            return {
                "attempts": 0,
                "successes": 0,
                "failures": 0,
                "avg_latency_ms": None,
                "avg_tokens": None
            }
        return {
            "attempts": int(row["attempts"] or 0),
            "successes": int(row["successes"] or 0),
            "failures": int(row["failures"] or 0),
            "avg_latency_ms": float(row["avg_latency_ms"]) if row["avg_latency_ms"] is not None else None,
            "avg_tokens": float(row["avg_tokens"]) if row["avg_tokens"] is not None else None
        }

    async def get_key_health_report(self, window_minutes: int = 180) -> List[Dict[str, Any]]:
        cutoff = (datetime.now() - timedelta(minutes=window_minutes)).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("""
                SELECT
                    provider,
                    key_hash,
                    COUNT(*) AS attempts,
                    SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
                    SUM(CASE WHEN status!='success' THEN 1 ELSE 0 END) AS failures,
                    AVG(latency_ms) AS avg_latency_ms,
                    AVG(total_tokens) AS avg_tokens,
                    MAX(timestamp) AS last_seen
                FROM key_usage_metrics
                WHERE timestamp >= ?
                GROUP BY provider, key_hash
                ORDER BY attempts DESC, successes DESC
            """, (cutoff,)) as cursor:
                rows = await cursor.fetchall()

        report = []
        for row in rows:
            attempts = int(row["attempts"] or 0)
            successes = int(row["successes"] or 0)
            success_rate = (successes / attempts) if attempts else 0.0
            report.append({
                "provider": row["provider"],
                "key_hash": row["key_hash"],
                "attempts": attempts,
                "successes": successes,
                "failures": int(row["failures"] or 0),
                "success_rate": round(success_rate, 4),
                "avg_latency_ms": float(row["avg_latency_ms"]) if row["avg_latency_ms"] is not None else None,
                "avg_tokens": float(row["avg_tokens"]) if row["avg_tokens"] is not None else None,
                "last_seen": row["last_seen"]
            })
        return report

    async def check_and_increment_usage(self, daily_budget: int = 5000) -> bool:
        today = datetime.now().strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("BEGIN EXCLUSIVE")
            async with db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (today,)) as cursor:
                row = await cursor.fetchone()

            current_count = row[0] if row else 0
            if current_count >= daily_budget:
                await db.rollback()
                return False

            await db.execute("""
                INSERT INTO daily_usage (date, call_count) VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET call_count = call_count + 1
            """, (today,))
            await db.commit()
            return True

    async def get_system_state(self, key: str) -> Optional[str]:
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT value FROM system_state WHERE key = ?", (key,)) as cursor:
                row = await cursor.fetchone()
                return row[0] if row else None

    async def set_system_state(self, key: str, value: str) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("INSERT OR REPLACE INTO system_state (key, value) VALUES (?, ?)", (key, value))
            await db.commit()

    async def cleanup(self, days: int = 30) -> None:
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        cutoff_date = datetime.now() - timedelta(days=days)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS archive_tasks (
                    id TEXT PRIMARY KEY,
                    description TEXT,
                    status TEXT,
                    timestamp TEXT,
                    agent TEXT,
                    priority TEXT,
                    metadata TEXT,
                    completedAt TEXT
                )
            """)

            protected_agents = tuple(PROTECTED_AGENTS_FROM_CLEANUP)
            placeholders = ','.join('?' for _ in protected_agents)

            await db.execute(f"""
                INSERT OR IGNORE INTO archive_tasks
                SELECT * FROM tasks
                WHERE status IN ('completed', 'failed')
                AND timestamp < ?
                AND agent NOT IN ({placeholders})
            """, (cutoff, *protected_agents))

            cursor = await db.execute(f"""
                DELETE FROM tasks
                WHERE status IN ('completed', 'failed')
                AND timestamp < ?
                AND agent NOT IN ({placeholders})
            """, (cutoff, *protected_agents))

            deleted_rows = cursor.rowcount
            await db.commit()
            logging.info(f"[CLEANUP] {deleted_rows} tarefas antigas arquivadas e expurgadas.")

        directories_to_clean = [".claude/logs/audit", ".claude/logs", ".claude/task_results"]
        empty_dirs = []
        files_to_delete = []

        for dir_name in directories_to_clean:
            target_dir = self.base_path / dir_name
            if not target_dir.exists():
                continue

            for item in target_dir.rglob("*"):
                if item.is_dir():
                    empty_dirs.append(item)
                elif item.is_file():
                    try:
                        if item.stat().st_size == 0:
                            files_to_delete.append(item)
                            continue
                        if datetime.fromtimestamp(item.stat().st_mtime) < cutoff_date:
                            files_to_delete.append(item)
                    except FileNotFoundError:
                        continue

        deleted_count = 0
        for f in files_to_delete:
            try:
                f.unlink()
                deleted_count += 1
            except FileNotFoundError:
                continue
            except Exception as e:
                logging.warning(f"[CLEANUP] Nao foi possivel deletar o arquivo {f}: {e}")

        if deleted_count > 0:
            logging.info(f"[CLEANUP] {deleted_count} arquivos de log/resultado obsoletos foram expurgados.")

        empty_dirs.sort(key=lambda p: len(p.parts), reverse=True)
        for d in empty_dirs:
            try:
                if not any(d.iterdir()):
                    d.rmdir()
            except OSError:
                continue

        gc.collect()

    def _row_to_task(self, row: sqlite3.Row) -> Task:
        metadata = {}
        if row["metadata"]:
            try:
                metadata = json.loads(row["metadata"])
            except json.JSONDecodeError as e:
                logging.error(f"[DAL] Entropia semantica: Impossivel realizar o parsing JSON para a tarefa {row['id']}. {e}")

        agent_name = row["agent"]
        # Compatibilidade retroativa: "@seo" foi absorvido por "@curator".
        # "@curator" permanece agente canonico/ativo.
        legacy_agents = {"@seo": "@curator"}
        if agent_name in legacy_agents:
            agent_name = legacy_agents[agent_name]
        elif agent_name not in _core_config.VALID_AGENTS:
            agent_name = "@chico"

        return Task(
            id=row["id"],
            description=row["description"],
            status=row["status"],
            timestamp=row["timestamp"],
            agent=agent_name,
            completedAt=row["completedAt"],
            metadata=metadata
        )
