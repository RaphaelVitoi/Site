import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional
from contextlib import contextmanager

from core.schemas import Task
from core.config import PROTECTED_AGENTS_FROM_CLEANUP

class QueueManager:
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
        self._init_db()

    @contextmanager
    def _get_conn(self):
        if getattr(self, '_is_memory', False):
            with self._memory_conn:
                yield self._memory_conn
        else:
            conn = sqlite3.connect(self.db_path, timeout=30.0)
            conn.row_factory = sqlite3.Row
            try:
                with conn:
                    yield conn
            finally:
                conn.close()

    def close(self):
        if getattr(self, '_is_memory', False) and hasattr(self, '_memory_conn'):
            self._memory_conn.close()

    def _init_db(self):
        with self._get_conn() as conn:
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
            conn.commit()

    def add_task(self, task: Task):
        with self._get_conn() as conn:
            conn.execute("""
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
            conn.commit()

    def get_task(self, task_id: str):
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if row:
                return self._row_to_task(row)
        return None
            
    def get_next_task(self):
        with self._get_conn() as conn:
            rows = conn.execute("""
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
            """).fetchall()
            for row in rows:
                task = self._row_to_task(row)
                if task.metadata and "depends_on" in task.metadata:
                    all_met = True
                    for dep_id in task.metadata["depends_on"]:
                        dep_row = conn.execute("SELECT status FROM tasks WHERE id = ?", (dep_id,)).fetchone()
                        if dep_row and dep_row["status"] not in ("completed", "cancelled"):
                            all_met = False
                            break
                    if not all_met:
                        continue
                return task
        return None

    def update_task_status(self, task_id: str, new_status):
        completed_at = datetime.now().isoformat() if new_status in ["completed", "failed"] else None
        with self._get_conn() as conn:
            if completed_at:
                conn.execute("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?", (new_status, completed_at, task_id))
            else:
                conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            conn.commit()
            
    def delete_task(self, task_id: str):
        with self._get_conn() as conn:
            conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            conn.commit()
 
    def get_tasks(self, status: str = None) -> List[Task]:
        with self._get_conn() as conn:
            if status:
                rows = conn.execute("SELECT * FROM tasks WHERE status = ? ORDER BY timestamp DESC", (status,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM tasks ORDER BY timestamp DESC").fetchall()
            return [self._row_to_task(row) for row in rows]
            
    def get_task_counts(self):
        with self._get_conn() as conn:
            rows = conn.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").fetchall()
            counts = { "pending": 0, "running": 0, "completed": 0, "failed": 0 }
            for r in rows:
                if r["status"] in counts:
                    counts[r["status"]] = r["count"]
            return counts
            
    def get_performance_history(self):
        with self._get_conn() as conn:
            query = """
                SELECT date(completedAt) as day, COUNT(*) as count
                FROM tasks
                WHERE status = 'completed' AND completedAt IS NOT NULL
                GROUP BY day
                ORDER BY day ASC
            """
            rows = conn.execute(query).fetchall()
            return [{"day": r["day"], "count": r["count"]} for r in rows]

    def get_llm_cache(self, model: str, prompt: str) -> Optional[str]:
        with self._get_conn() as conn:
            row = conn.execute("SELECT response FROM llm_cache WHERE model = ? AND prompt = ?", (model, prompt)).fetchone()
            if row is not None:
                return row['response']
        return None

    def update_llm_cache(self, model: str, prompt: str, response: str):
        timestamp = datetime.now().isoformat()
        with self._get_conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """, (model, prompt, response, timestamp))
            conn.commit()

    def record_api_usage(self, task_id: str, agent: str, model: str, provider: str, prompt_tokens: int, completion_tokens: int):
        total = prompt_tokens + completion_tokens
        timestamp = datetime.now().isoformat()
        with self._get_conn() as conn:
            conn.execute("""
                INSERT INTO api_usage (task_id, agent, model, provider, prompt_tokens, completion_tokens, total_tokens, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (task_id, agent, model, provider, prompt_tokens, completion_tokens, total, timestamp))
            conn.commit()

    def _row_to_task(self, row) -> Task:
        metadata = {}
        if row["metadata"]:
            try: metadata = json.loads(row["metadata"])
            except: pass
        return Task(id=row["id"], description=row["description"], status=row["status"], timestamp=row["timestamp"], agent=row["agent"], completedAt=row["completedAt"], metadata=metadata)