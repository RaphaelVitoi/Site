import gc
import json
import logging
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import aiosqlite

import core.config as _core_config
from core.schemas import Task

MEMORY_DB_TARGET = ":memory:"


class QueueManager:
    """
    Gerenciador de Fila SOTA (Data Access Layer).
    Arquitetura de alta performance com operacoes 100% Assincronas via aiosqlite.
    Integra blindagem absoluta contra Path Traversal, Transacoes ACID estritas,
    Controle de Orcamento Holistico e Expurgo Termodinamico de Entropia.
    """

    def __init__(self, queue_path: Optional[str] = None) -> None:
        self.base_path = Path(__file__).parent.parent.resolve()
        self._resolve_db_path(queue_path)
        self._validate_path_traversal()
        self._init_db()

    def _resolve_db_path(self, queue_path: Optional[str]) -> None:
        if queue_path is None:
            env_db = os.environ.get("SQLITE_DB_PATH")
            self.db_path = (
                Path(env_db) if env_db else self.base_path / "queue" / "tasks.db"
            )
            self.db_path = self._ensure_writable_db_path(self.db_path)
            self._is_memory = False
        elif queue_path == MEMORY_DB_TARGET:
            self.db_path = MEMORY_DB_TARGET
            self._is_memory = True
            self._memory_conn = sqlite3.connect(
                MEMORY_DB_TARGET, check_same_thread=False
            )
            self._memory_conn.row_factory = sqlite3.Row
        else:
            self.db_path = Path(queue_path)
            self.db_path = self._ensure_writable_db_path(self.db_path)
            self._is_memory = False

    def _validate_path_traversal(self) -> None:
        """Blindagem de Seguranca SOTA: Aniquila vetores de Path Traversal (LFI)."""
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
                except ValueError as e:
                    if (
                        not str(db_path_resolved)
                        .lower()
                        .startswith(str(base_path).lower())
                    ):
                        logging.critical(
                            f"[SEC] Tentativa de Path Traversal bloqueada: '{self.db_path}' fora da raiz."
                        )
                        raise PermissionError(
                            "Database path is outside the project root."
                        ) from e

    def _ensure_writable_db_path(self, desired_path: Path) -> Path:
        """Garante caminho de DB gravavel e dentro da raiz; forja fallback local quando necessario."""
        base_resolved = self.base_path.resolve()

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
                if (
                    not str(desired_resolved)
                    .lower()
                    .startswith(str(base_resolved).lower())
                ):
                    fallback = (
                        self.base_path / ".nexus_runtime" / "queue" / desired_path.name
                    )
                    fallback.parent.mkdir(parents=True, exist_ok=True)
                    logging.warning(
                        f"[DB] Caminho padrao resolve fora da raiz. Usando fallback local: {fallback}"
                    )
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
            logging.warning(
                f"[DB] Caminho padrao sem permissao de escrita. Usando fallback local: {fallback}"
            )
            return fallback

    def _get_conn(self) -> sqlite3.Connection:
        """Fornece conexao sincrona estritamente para inicializacao de DDL."""
        if getattr(self, "_is_memory", False):
            return self._memory_conn
        return sqlite3.connect(self.db_path, timeout=30.0)

    def close(self) -> None:
        """Encerra graciosamente a conexao em memoria, se aplicavel."""
        if getattr(self, "_is_memory", False) and hasattr(self, "_memory_conn"):
            self._memory_conn.close()

    def _init_db(self) -> None:
        """Forja a topologia relacional com Pragmas SOTA para Friccao Zero em I/O."""
        conn = self._get_conn()
        try:
            # SOTA PRAGMAs: Maximizacao de concorrencia e uso eficiente de memoria
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute("PRAGMA busy_timeout=5000;")
            conn.execute("PRAGMA cache_size=-64000;")
            conn.execute("PRAGMA temp_store=MEMORY;")
            conn.execute("PRAGMA mmap_size=30000000000;")

            conn.execute("""
                CREATE TABLE IF NOT EXISTS llm_cache (
                    model TEXT NOT NULL,
                    prompt TEXT NOT NULL,
                    response TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    PRIMARY KEY (model, prompt)
                )
            """)
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_model_prompt ON llm_cache (model, prompt)"
            )

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
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_status_time ON tasks (status, timestamp)"
            )

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
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_key_usage_provider_hash_time ON key_usage_metrics (provider, key_hash, timestamp)"
            )

            conn.execute(
                "CREATE TABLE IF NOT EXISTS daily_usage ( date TEXT PRIMARY KEY, call_count INTEGER NOT NULL )"
            )
            conn.execute(
                "CREATE TABLE IF NOT EXISTS system_state ( key TEXT PRIMARY KEY, value TEXT )"
            )

            conn.commit()
        finally:
            if not getattr(self, "_is_memory", False):
                conn.close()

    def _enforce_backup_retention_policy(
        self, backup_dir: Path, max_backups: int
    ) -> None:
        """SOTA Guard: Preserva o armazenamento obliterando snapshots obsoletos."""
        try:
            backups = sorted(
                backup_dir.glob(f"{Path(self.db_path).stem}_*.db"),
                key=os.path.getmtime,
                reverse=True,
            )
            if len(backups) > max_backups:
                for old_backup in backups[max_backups:]:
                    old_backup.unlink()
                    logging.info(
                        f"[BACKUP] Snapshot termodinamico obsoleto obliterado: {old_backup.name}"
                    )
        except Exception as e:
            logging.error(
                f"[BACKUP] Falha estrutural ao aplicar a politica de retencao: {e}"
            )

    async def online_backup(self) -> None:
        """
        Cria um snapshot ACID do banco SQLite atraves da API nativa de Backup Online.
        Assegura consistencia absoluta sem causar locks no ecossistema ativo.
        """
        if getattr(self, "_is_memory", False):
            logging.info(
                "[BACKUP] Salvaguarda online ignorada: Target reside em memoria volatil."
            )
            return

        backup_dir = Path(self.db_path).parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"{Path(self.db_path).stem}_{timestamp}.db"

        try:
            async with aiosqlite.connect(self.db_path) as source_db:
                await source_db.execute("PRAGMA wal_checkpoint(FULL)")
                async with aiosqlite.connect(backup_path) as backup_db:
                    await source_db.backup(backup_db)
            logging.info(
                f"[BACKUP] Snapshot SOTA materializado com sucesso: {backup_path}"
            )
            self._enforce_backup_retention_policy(backup_dir, max_backups=20)
        except Exception as e:
            logging.error(
                f"[BACKUP] Colapso durante a materializacao do snapshot online: {e}"
            )
            if backup_path.exists():
                try:
                    backup_path.unlink()
                except Exception as unlink_e:
                    logging.error(
                        f"[BACKUP] Falha ao obliterar fragmento corrompido de snapshot: {unlink_e}"
                    )

    async def add_task(self, task: Task) -> None:
        """Injeta uma nova diretriz na malha de execucao (Queue)."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO tasks
                (id, description, status, timestamp, agent, priority, metadata, completedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    task.id,
                    task.description,
                    task.status,
                    task.timestamp,
                    task.agent,
                    task.metadata.get("priority", "normal")
                    if task.metadata
                    else "normal",
                    json.dumps(task.metadata, ensure_ascii=True)
                    if task.metadata
                    else "{}",
                    task.completedAt,
                ),
            )
            await db.commit()

    async def get_task(self, task_id: str) -> Optional[Task]:
        """Consulta pontual de estado (O(1)) de uma tarefa."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return self._row_to_task(row)
        return None

    async def get_next_task(self) -> Optional[Task]:
        """
        SOTA: Algoritmo de extracao baseada em Grafos de Dependencia e Peso de Prioridade.
        Impede condicoes de corrida garantindo que bloqueios sejam respeitados.
        """
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
        """Transicao de estado autonoma com timestamping automatico."""
        completed_at = (
            datetime.now(timezone.utc).isoformat()
            if new_status in ["completed", "failed"]
            else None
        )
        async with aiosqlite.connect(self.db_path) as db:
            if completed_at:
                await db.execute(
                    "UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?",
                    (new_status, completed_at, task_id),
                )
            else:
                await db.execute(
                    "UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id)
                )
            await db.commit()

    async def update_task_metadata(
        self, task_id: str, metadata_patch: Dict[str, Any], merge: bool = True
    ) -> None:
        """
        Atualiza os metadados de forma cirurgica e Thread-Safe (BEGIN EXCLUSIVE).
        Preserva a integridade do JSON original durante mutacoes concorrentes.
        """
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("BEGIN EXCLUSIVE")
            db.row_factory = sqlite3.Row
            async with db.execute(
                "SELECT metadata FROM tasks WHERE id = ?", (task_id,)
            ) as cursor:
                row = await cursor.fetchone()

            if not row:
                await db.rollback()
                return

            current = {}
            if row["metadata"]:
                try:
                    current = json.loads(row["metadata"])
                except json.JSONDecodeError as e:
                    logging.error(
                        f"[DAL] Entropia semantica detectada: Corrupcao JSON na tarefa {task_id}. Erro: {e}"
                    )
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
        """Obliterar tarefa do Kernel."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            await db.commit()

    async def get_tasks(
        self, status: Optional[str] = None, since_hours: Optional[int] = None
    ) -> List[Task]:
        """Varredura historica da fila com filtros de estado e temporalidade."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            query = "SELECT * FROM tasks"
            params: List[Any] = []
            conditions: List[str] = []

            if status:
                conditions.append("status = ?")
                params.append(status)
            if since_hours:
                cutoff = (
                    datetime.now(timezone.utc) - timedelta(hours=since_hours)
                ).isoformat()
                conditions.append("timestamp >= ?")
                params.append(cutoff)

            if conditions:
                query += " WHERE " + " AND ".join(conditions)

            query += " ORDER BY timestamp DESC"
            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
            return [self._row_to_task(row) for row in rows]

    async def get_task_counts(self) -> Dict[str, int]:
        """Fotografia termodinamica do estado atual da fila."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute(
                "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
            ) as cursor:
                rows = await cursor.fetchall()
                counts = {"pending": 0, "running": 0, "completed": 0, "failed": 0}
                for r in rows:
                    if r["status"] in counts:
                        counts[r["status"]] = r["count"]
                return counts

    async def get_performance_history(self) -> List[Dict[str, Any]]:
        """Extrai o ritmo de processamento sistemico diario."""
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
        """Consulta otimizada a Memoria Cache (Evita chamadas redundantes e gastos de API)."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT response FROM llm_cache WHERE model = ? AND prompt = ?",
                (model, prompt),
            ) as cursor:
                row = await cursor.fetchone()
                if row is not None:
                    return row[0]
            if model.startswith("@"):
                async with db.execute(
                    "SELECT response FROM llm_cache WHERE prompt = ? ORDER BY timestamp DESC LIMIT 1",
                    (prompt,),
                ) as cursor:
                    row = await cursor.fetchone()
                    if row is not None:
                        return row[0]
        return None

    async def get_first_cached_response(
        self, models: Iterable[str], prompt: str
    ) -> Optional[str]:
        for model in models:
            cached = await self.get_llm_cache(model, prompt)
            if cached is not None:
                return cached
        return None

    async def update_llm_cache(self, model: str, prompt: str, response: str) -> None:
        """Injeta a resposta gerada na Memoria Cache."""
        if response is None:
            logging.warning("[CACHE] Ingestao rejeitada: Resposta nula identificada.")
            return
        timestamp = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """,
                (model, prompt, response, timestamp),
            )
            await db.commit()

    async def record_api_usage(
        self,
        task_id: str,
        agent: str,
        model: str,
        provider: str,
        prompt_tokens: int,
        completion_tokens: int,
    ) -> None:
        """Telemetria Financeira SOTA: Registro imutavel de custo computacional."""
        total = prompt_tokens + completion_tokens
        timestamp = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO api_usage (task_id, agent, model, provider, prompt_tokens, completion_tokens, total_tokens, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    task_id,
                    agent,
                    model,
                    provider,
                    prompt_tokens,
                    completion_tokens,
                    total,
                    timestamp,
                ),
            )
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
        total_tokens: Optional[int] = None,
    ) -> None:
        """Telemetria Operacional SOTA: Rastreador de saude do fluxo de rede e chaves de API."""
        timestamp = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO key_usage_metrics (
                    provider, key_hash, status, latency_ms, error_class, error_detail,
                    model, agent, task_id, total_tokens, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    provider,
                    key_hash,
                    status,
                    latency_ms,
                    error_class,
                    (error_detail[:512] if error_detail else None),
                    model,
                    agent,
                    task_id,
                    total_tokens,
                    timestamp,
                ),
            )
            await db.commit()

    async def get_key_recent_stats(
        self, provider: str, key_hash: str, window_minutes: int = 180
    ) -> Dict[str, Any]:
        """Antevisao termodinamica da saude da API em janela deslizante."""
        cutoff = (
            datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
        ).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute(
                """
                SELECT
                    COUNT(*) AS attempts,
                    SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
                    SUM(CASE WHEN status!='success' THEN 1 ELSE 0 END) AS failures,
                    AVG(latency_ms) AS avg_latency_ms,
                    AVG(total_tokens) AS avg_tokens
                FROM key_usage_metrics
                WHERE provider = ? AND key_hash = ? AND timestamp >= ?
            """,
                (provider, key_hash, cutoff),
            ) as cursor:
                row = await cursor.fetchone()

        if not row or row["attempts"] is None or row["attempts"] == 0:
            return {
                "attempts": 0,
                "successes": 0,
                "failures": 0,
                "avg_latency_ms": None,
                "avg_tokens": None,
            }
        return {
            "attempts": int(row["attempts"]),
            "successes": int(row["successes"] or 0),
            "failures": int(row["failures"] or 0),
            "avg_latency_ms": float(row["avg_latency_ms"])
            if row["avg_latency_ms"] is not None
            else None,
            "avg_tokens": float(row["avg_tokens"])
            if row["avg_tokens"] is not None
            else None,
        }

    async def get_key_health_report(
        self, window_minutes: int = 180
    ) -> List[Dict[str, Any]]:
        """Relatorio matriz de resiliencia e estabilidade das integracoes externas."""
        cutoff = (
            datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
        ).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = sqlite3.Row
            async with db.execute(
                """
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
            """,
                (cutoff,),
            ) as cursor:
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
                "avg_latency_ms": float(row["avg_latency_ms"])
                if row["avg_latency_ms"] is not None
                else None,
                "avg_tokens": float(row["avg_tokens"])
                if row["avg_tokens"] is not None
                else None,
                "last_seen": row["last_seen"],
            })
        return report

    async def get_daily_budget_usage(self) -> int:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT call_count FROM daily_usage WHERE date = ?", (today,)
            ) as cursor:
                row = await cursor.fetchone()
            return row[0] if row else 0

    async def check_and_increment_usage(self, daily_budget: int = 5000) -> bool:
        """
        SOTA Guard: Impede estouramento de cota diaria de requisicoes.
        Avaliacao atomica e Thread-Safe.
        """
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("BEGIN EXCLUSIVE")
            async with db.execute(
                "SELECT call_count FROM daily_usage WHERE date = ?", (today,)
            ) as cursor:
                row = await cursor.fetchone()

            current_count = row[0] if row else 0
            if current_count >= daily_budget:
                await db.rollback()
                return False

            await db.execute(
                """
                INSERT INTO daily_usage (date, call_count) VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET call_count = call_count + 1
            """,
                (today,),
            )
            await db.commit()
            return True

    async def get_system_state(self, key: str) -> Optional[str]:
        """Consulta a malha de estado dinamico (K-V store)."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT value FROM system_state WHERE key = ?", (key,)
            ) as cursor:
                row = await cursor.fetchone()
                return row[0] if row else None

    async def set_system_state(self, key: str, value: str) -> None:
        """Muta o estado global de sistema garantindo persistencia imediata."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO system_state (key, value) VALUES (?, ?)",
                (key, value),
            )
            await db.commit()

    async def cleanup(self, days: int = 30) -> None:
        """
        Expurgo Termodinamico SOTA.
        Transfere o estado resolvido para tabelas frias e vaporiza o lixo estatico,
        restaurando o Vazio Operacional da aplicacao.
        """
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)

        await self._archive_and_tasks(cutoff)
        self._purge_obsolete_files(cutoff_date)
        gc.collect()

    async def _archive_and_tasks(self, cutoff: str) -> None:
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

            protected_agents = tuple(_core_config.PROTECTED_AGENTS_FROM_CLEANUP)
            placeholders = ",".join("?" for _ in protected_agents)

            # SOTA Guard: Query construída de forma direta para o Ruff acatar o noqa com precisão
            insert_query = f"INSERT OR IGNORE INTO archive_tasks SELECT * FROM tasks WHERE status IN ('completed', 'failed') AND timestamp < ? AND agent NOT IN ({placeholders})"  # noqa: S608

            await db.execute(insert_query, (cutoff, *protected_agents))

            delete_query = f"DELETE FROM tasks WHERE status IN ('completed', 'failed') AND timestamp < ? AND agent NOT IN ({placeholders})"  # noqa: S608

            cursor = await db.execute(delete_query, (cutoff, *protected_agents))

            deleted_rows = cursor.rowcount
            await db.commit()
            logging.info(
                f"[CLEANUP] {deleted_rows} operacoes antigas arquivadas e expurgadas (Amnesia Seletiva)."
            )

    def _purge_obsolete_files(self, cutoff_date: datetime) -> None:
        directories_to_clean = [
            ".claude/logs/audit",
            ".claude/logs",
            ".claude/task_results",
        ]
        empty_dirs = []
        deleted_count = 0

        for dir_name in directories_to_clean:
            target_dir = self.base_path / dir_name
            if not target_dir.exists():
                continue

            deleted, dirs = self._process_directory_purge(target_dir, cutoff_date)
            deleted_count += deleted
            empty_dirs.extend(dirs)

        if deleted_count > 0:
            logging.info(
                f"[CLEANUP] {deleted_count} artefatos obsoletos (logs/resultados) foram desintegrados."
            )

        self._remove_empty_dirs(empty_dirs)

    def _process_directory_purge(
        self, target_dir: Path, cutoff_date: datetime
    ) -> Tuple[int, List[Path]]:
        deleted_count = 0
        empty_dirs = []
        for item in target_dir.rglob("*"):
            if item.is_dir():
                empty_dirs.append(item)
            elif item.is_file():
                try:
                    if (
                        item.stat().st_size == 0
                        or datetime.fromtimestamp(item.stat().st_mtime, tz=timezone.utc)
                        < cutoff_date
                    ):
                        item.unlink()
                        deleted_count += 1
                except OSError:
                    pass
        return deleted_count, empty_dirs

    def _remove_empty_dirs(self, empty_dirs: List[Path]) -> None:
        empty_dirs.sort(key=lambda p: len(p.parts), reverse=True)
        for d in empty_dirs:
            try:
                if not any(d.iterdir()):
                    d.rmdir()
            except OSError:
                continue

    def _row_to_task(self, row: sqlite3.Row) -> Task:
        metadata = {}
        if row["metadata"]:
            try:
                metadata = json.loads(row["metadata"])
            except json.JSONDecodeError as e:
                logging.error(
                    f"[DAL] Entropia semantica extrema: Impossivel decodificar a carga JSON para a tarefa {row['id']}. {e}"
                )

        agent_name = row["agent"]
        # SOTA: Resolucao Retroativa. @seo anexado por @curator.
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
            metadata=metadata,
        )
