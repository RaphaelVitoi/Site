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

class QueueManager:
    """
    Gerenciador de Fila SOTA (Data Access Layer).
    Operacoes 100% Assincronas via aiosqlite, com blindagem contra Path Traversal,
    Transacoes ACID, Controle de Orcamento e Expurgo de Entropia.
    """
    def __init__(self, queue_path: str = None):
        if queue_path is None:
            env_db = os.environ.get("SQLITE_DB_PATH")
            if env_db:
                self.db_path = Path(env_db)
            else:
                self.db_path = Path(__file__).parent.parent.resolve() / "queue" / "tasks.db"
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            self._is_memory = False
        else:
            if queue_path == ":memory:":
                self.db_path = ":memory:"
                self._is_memory = True
                self._memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
                self._memory_conn.row_factory = sqlite3.Row
            else:
                self.db_path = Path(queue_path)
                self.db_path.parent.mkdir(parents=True, exist_ok=True)
                self._is_memory = False
                
        # Blindagem de Seguranca SOTA: Prevenir Path Traversal
        if not self._is_memory:
            base_path = Path(__file__).parent.parent.absolute()
            db_resolved_path = self.db_path.absolute()
            base_path_str = os.path.normcase(str(base_path))
            db_resolved_path_str = os.path.normcase(str(db_resolved_path))
            
            if not db_resolved_path_str.startswith(base_path_str):
                 logging.critical(f"[SEC] Tentativa de Path Traversal bloqueada: '{self.db_path}' fora da raiz.")
                 raise PermissionError("Database path is outside the project root.")

        self._init_db()

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
            conn.execute("CREATE TABLE IF NOT EXISTS daily_usage ( date TEXT PRIMARY KEY, call_count INTEGER NOT NULL )")
            conn.execute("CREATE TABLE IF NOT EXISTS system_state ( key TEXT PRIMARY KEY, value TEXT )")
            conn.commit()
        finally:
            if not getattr(self, '_is_memory', False):
                conn.close()

    async def add_task(self, task: Task):
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

    async def get_task(self, task_id: str):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return self._row_to_task(row)
        return None
            
    async def get_next_task(self):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("""
                SELECT * FROM tasks 
                WHERE status = 'pending' 
                ORDER BY 
                    CASE priority 
                        WHEN 'critical' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'medium' THEN 3 
                        WHEN 'low' THEN 4 
                        ELSE 3 
                    END,
                    timestamp ASC
                LIMIT 50
            """) as cursor:
                rows = await cursor.fetchall()
                
            for row in rows:
                task = self._row_to_task(row)
                if task.metadata and "depends_on" in task.metadata:
                    all_met = True
                    for dep_id in task.metadata["depends_on"]:
                        async with db.execute("SELECT status FROM tasks WHERE id = ?", (dep_id,)) as dep_cursor:
                            dep_row = await dep_cursor.fetchone()
                            if dep_row and dep_row["status"] not in ("completed", "cancelled"):
                                all_met = False
                                break
                    if not all_met:
                        continue
                return task
        return None

    async def update_task_status(self, task_id: str, new_status):
        completed_at = datetime.now().isoformat() if new_status in ["completed", "failed"] else None
        async with aiosqlite.connect(self.db_path) as db:
            if completed_at:
                await db.execute("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?", (new_status, completed_at, task_id))
            else:
                await db.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            await db.commit()
            
    async def delete_task(self, task_id: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            await db.commit()
 
    async def get_tasks(self, status: str = None, since_hours: int = None) -> List[Task]:
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
            
    async def get_task_counts(self):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status") as cursor:
                rows = await cursor.fetchall()
                counts = { "pending": 0, "running": 0, "completed": 0, "failed": 0 }
                for r in rows:
                    if r["status"] in counts:
                        counts[r["status"]] = r["count"]
                return counts
            
    async def get_performance_history(self):
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

    async def update_llm_cache(self, model: str, prompt: str, response: str):
        timestamp = datetime.now().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """, (model, prompt, response, timestamp))
            await db.commit()

    async def record_api_usage(self, task_id: str, agent: str, model: str, provider: str, prompt_tokens: int, completion_tokens: int):
        total = prompt_tokens + completion_tokens
        timestamp = datetime.now().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO api_usage (task_id, agent, model, provider, prompt_tokens, completion_tokens, total_tokens, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (task_id, agent, model, provider, prompt_tokens, completion_tokens, total, timestamp))
            await db.commit()

    async def check_and_increment_usage(self, daily_budget: int = 5000) -> bool:
        today = datetime.now().strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT call_count FROM daily_usage WHERE date = ?", (today,)) as cursor:
                row = await cursor.fetchone()
            
            current_count = row[0] if row else 0
            if current_count >= daily_budget:
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

    async def set_system_state(self, key: str, value: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("INSERT OR REPLACE INTO system_state (key, value) VALUES (?, ?)", (key, value))
            await db.commit()

    async def cleanup(self, days: int = 30):
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
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
            
            async with db.execute(f"""
                SELECT * FROM tasks
                WHERE status IN ('completed', 'failed') 
                AND timestamp < ?
                AND agent NOT IN ({placeholders})
            """, (cutoff, *protected_agents)) as cursor:
                rows = await cursor.fetchall()
            
            for r in rows:
                await db.execute("""
                    INSERT OR IGNORE INTO archive_tasks
                    (id, description, status, timestamp, agent, priority, metadata, completedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]))

            await db.execute(f"""
                DELETE FROM tasks 
                WHERE status IN ('completed', 'failed') 
                AND timestamp < ?
                AND agent NOT IN ({placeholders})
            """, (cutoff, *protected_agents))
            await db.commit()
            
        gc.collect()

    def _row_to_task(self, row) -> Task:
        metadata = {}
        if row["metadata"]:
            try: metadata = json.loads(row["metadata"])
            except: pass
            
        agent_name = row["agent"]
        legacy_agents = {"@seo": "@curator"}
        if agent_name in legacy_agents:
            agent_name = legacy_agents[agent_name]
            
        return Task(
            id=row["id"], 
            description=row["description"], 
            status=row["status"], 
            timestamp=row["timestamp"], 
            agent=agent_name, 
            completedAt=row["completedAt"], 
            metadata=metadata
        )