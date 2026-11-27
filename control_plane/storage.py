"""Bi-temporal SQLite persistence, O(1) serial lookup, and pre-filtered vector storage."""

from __future__ import annotations

from collections.abc import Callable, Iterator, Sequence
import contextlib
from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import threading
import time
from typing import Any

import numpy as np

from control_plane.config import (
    COLD_START_PRIORS,
    DEFAULT_ICM_BUCKETS,
    SITE_ROOT,
    CalibrationMode,
    ControlPlaneConfig,
)

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
MEMORY_DB_TARGET = ":memory:"


class ControlPlaneError(Exception):
    """Base error with deterministic block code for control plane operations."""

    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details or {}


class BucketNotFoundError(ControlPlaneError):
    def __init__(self, bucket_id: str) -> None:
        super().__init__("BUCKET_NOT_FOUND", f"Bucket '{bucket_id}' not found.", {"bucket_id": bucket_id})


class SerialNotFoundError(ControlPlaneError):
    def __init__(self, bucket_id: str, serial_uri: str) -> None:
        super().__init__(
            "SERIAL_NOT_FOUND",
            f"Serial '{serial_uri}' not found in bucket '{bucket_id}'.",
            {"bucket_id": bucket_id, "serial_uri": serial_uri},
        )


class HashMismatchError(ControlPlaneError):
    def __init__(self, serial_uri: str, expected: str, actual: str) -> None:
        super().__init__(
            "HASH_MISMATCH",
            f"SHA-256 mismatch for '{serial_uri}'.",
            {"serial_uri": serial_uri, "expected": expected, "actual": actual},
        )


class ContractUnsatError(ControlPlaneError):
    def __init__(self, message: str, unsat_core: list[str] | None = None) -> None:
        super().__init__("CONTRACT_UNSAT", message, {"unsat_core": unsat_core or []})


class AttemptConflictError(ControlPlaneError):
    def __init__(self, run_id: str, node_id: str, attempt: int) -> None:
        super().__init__(
            "ATTEMPT_CONFLICT",
            f"Checkpoint already exists for ({run_id}, {node_id}, attempt={attempt}) with different idempotency_key.",
            {"run_id": run_id, "node_id": node_id, "attempt": attempt},
        )


class RunNotFoundError(ControlPlaneError):
    def __init__(self, run_id: str) -> None:
        super().__init__("RUN_NOT_FOUND", f"Workflow run '{run_id}' not found.", {"run_id": run_id})


@dataclass(frozen=True, slots=True)
class BucketRecord:
    bucket_id: str
    modality: str
    pareto_profile: str
    policy: dict[str, Any]
    max_retries: int
    max_cost_usd: float
    updated_at: str


@dataclass(frozen=True, slots=True)
class CanonicalRecord:
    record_id: int
    serial_uri: str
    bucket_id: str
    artifact_kind: str
    version: int
    sha256: str
    content: str
    z3_constraints_json: str | None
    z3_status: str
    valid_from: str
    valid_to: str | None
    ingested_at: str


@dataclass(frozen=True, slots=True)
class SemanticMatch:
    chunk_id: int
    bucket_id: str
    record_id: int | None
    anchor_polarity: str
    content_summary: str
    similarity: float
    model_id: str


@dataclass(frozen=True, slots=True)
class CrcCalibrationRecord:
    bucket_id: str
    action_role: str
    alpha_target: float
    lambda_unified: float
    lambda_id_min: float
    lambda_viol_max: float
    conv_high_threshold: float
    conv_low_threshold: float
    sample_size_n: int
    is_cold_start: bool
    calibration_mode: str
    calibrated_at: str


def utc_now_iso() -> str:
    """Return canonical UTC ISO-8601 timestamp string."""
    return datetime.now(UTC).isoformat()


def compute_sha256(text: str) -> str:
    """Compute SHA-256 hex digest of UTF-8 text."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class ControlPlaneStore:
    """Thread-safe, anti-LFI SQLite WAL repository for the control plane."""

    def __init__(self, config: ControlPlaneConfig | None = None) -> None:
        self.config = config or ControlPlaneConfig()
        self._is_memory = self.config.db_path == MEMORY_DB_TARGET
        self._memory_conn: sqlite3.Connection | None = None
        self._memory_lock = threading.RLock()
        if not self._is_memory:
            self.db_path = self._validate_path(Path(self.config.db_path))
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
        else:
            self.db_path = Path(MEMORY_DB_TARGET)

    def _validate_path(self, candidate: Path) -> Path:
        resolved = candidate.resolve(strict=False)
        if not self.config.allow_external_path:
            site_resolved = SITE_ROOT.resolve()
            try:
                resolved.relative_to(site_resolved)
            except ValueError as exc:
                raise PermissionError(f"Database path '{resolved}' escapes Site root '{site_resolved}'.") from exc
        return resolved

    @staticmethod
    def _exec_busy_retry(fn: Callable[[], Any], *, max_attempts: int = 40) -> None:
        for attempt in range(max_attempts):
            try:
                fn()
                return
            except sqlite3.OperationalError as exc:
                msg = str(exc).lower()
                if ("locked" not in msg and "busy" not in msg) or attempt + 1 >= max_attempts:
                    raise
                jitter = ((hash((threading.get_ident(), os.getpid(), attempt)) & 0xFFF) / 4095.0) * 0.004
                backoff = min(0.05, 0.002 * (1.25**attempt)) + jitter
                time.sleep(backoff)

    @contextlib.contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        if self._is_memory:
            with self._memory_lock:
                if self._memory_conn is None:
                    self._memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
                    self._memory_conn.row_factory = sqlite3.Row
                    self._memory_conn.execute("PRAGMA foreign_keys = ON;")
                yield self._memory_conn
            return

        with contextlib.closing(sqlite3.connect(str(self.db_path), timeout=15.0)) as conn:
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            conn.execute("PRAGMA busy_timeout = 15000;")
            yield conn

    @contextlib.contextmanager
    def _write_tx(self) -> Iterator[sqlite3.Connection]:
        if self._is_memory:
            with self._memory_lock:
                if self._memory_conn is None:
                    self._memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
                    self._memory_conn.row_factory = sqlite3.Row
                    self._memory_conn.execute("PRAGMA foreign_keys = ON;")
                try:
                    yield self._memory_conn
                    self._memory_conn.commit()
                except Exception:
                    with contextlib.suppress(sqlite3.Error):
                        self._memory_conn.rollback()
                    raise
            return

        with contextlib.closing(sqlite3.connect(str(self.db_path), timeout=30.0, isolation_level=None)) as conn:
            conn.row_factory = sqlite3.Row
            self._exec_busy_retry(
                lambda: (
                    conn.execute("PRAGMA foreign_keys = ON;"),
                    conn.execute("PRAGMA busy_timeout = 30000;"),
                    conn.execute("PRAGMA synchronous = NORMAL;"),
                    conn.execute("BEGIN IMMEDIATE"),
                )
            )
            try:
                yield conn
                self._exec_busy_retry(lambda: conn.execute("COMMIT"))
            except Exception:
                with contextlib.suppress(sqlite3.Error):
                    conn.execute("ROLLBACK")
                raise

    def close(self) -> None:
        """Close any persistent in-memory connection cleanly."""
        with self._memory_lock:
            if self._memory_conn is not None:
                self._memory_conn.close()
                self._memory_conn = None

    def initialize(self, *, seed_defaults: bool = True) -> None:
        """Apply idempotent DDL and optionally seed the 7 ICM buckets + CRC priors."""
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

        def _apply() -> None:
            with self._connect() as conn:
                conn.executescript(schema_sql)
                conn.commit()

        self._exec_busy_retry(_apply)
        if seed_defaults:
            self.seed_default_buckets()

    def seed_default_buckets(self) -> None:
        """Seed the 7 canonical ICM buckets and cold-start CRC rows if missing."""
        now = utc_now_iso()
        with self._write_tx() as conn:
            for bucket_id, spec in DEFAULT_ICM_BUCKETS.items():
                existing = conn.execute("SELECT 1 FROM buckets WHERE bucket_id = ?", (bucket_id,)).fetchone()
                if existing is None:
                    policy = {
                        "anti_goals": spec["anti_goals"],
                        "target_lock": {"enforce": True, "max_files": 10},
                        "cascade_config": {"s2_for_commit_prod": True},
                    }
                    conn.execute(
                        """
                        INSERT INTO buckets (bucket_id, modality, pareto_profile, policy_json, max_retries, max_cost_usd, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            bucket_id,
                            str(spec["modality"]),
                            str(spec["pareto_profile"]),
                            json.dumps(policy, sort_keys=True),
                            int(spec["max_retries"]),  # type: ignore[arg-type]
                            float(spec["max_cost_usd"]),  # type: ignore[arg-type]
                            now,
                        ),
                    )
                self._ensure_crc_priors(conn, bucket_id, now)

    def _ensure_crc_priors(self, conn: sqlite3.Connection, bucket_id: str, now: str) -> None:
        for role, prior in COLD_START_PRIORS.items():
            conn.execute(
                """
                INSERT OR IGNORE INTO crc_calibration (
                    bucket_id, action_role, alpha_target, lambda_unified,
                    lambda_id_min, lambda_viol_max, conv_high_threshold,
                    conv_low_threshold, sample_size_n, is_cold_start,
                    calibration_mode, calibrated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
                """,
                (
                    bucket_id,
                    role.value,
                    prior.alpha_target,
                    prior.lambda_unified,
                    prior.lambda_id_min,
                    prior.lambda_viol_max,
                    prior.conv_high_threshold,
                    prior.conv_low_threshold,
                    CalibrationMode.COLD_START.value,
                    now,
                ),
            )

    def upsert_bucket(
        self,
        bucket_id: str,
        modality: str,
        pareto_profile: str,
        policy: dict[str, Any],
        max_retries: int = 3,
        max_cost_usd: float = 0.50,
    ) -> BucketRecord:
        now = utc_now_iso()
        policy_json = json.dumps(policy, sort_keys=True)
        with self._write_tx() as conn:
            conn.execute(
                """
                INSERT INTO buckets (bucket_id, modality, pareto_profile, policy_json, max_retries, max_cost_usd, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(bucket_id) DO UPDATE SET
                    modality = excluded.modality,
                    pareto_profile = excluded.pareto_profile,
                    policy_json = excluded.policy_json,
                    max_retries = excluded.max_retries,
                    max_cost_usd = excluded.max_cost_usd,
                    updated_at = excluded.updated_at
                """,
                (bucket_id, modality, pareto_profile, policy_json, max_retries, max_cost_usd, now),
            )
            self._ensure_crc_priors(conn, bucket_id, now)
        return self.get_bucket(bucket_id)

    def get_bucket(self, bucket_id: str) -> BucketRecord:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM buckets WHERE bucket_id = ?", (bucket_id,)).fetchone()
        if row is None:
            raise BucketNotFoundError(bucket_id)
        return BucketRecord(
            bucket_id=str(row["bucket_id"]),
            modality=str(row["modality"]),
            pareto_profile=str(row["pareto_profile"]),
            policy=json.loads(str(row["policy_json"])),
            max_retries=int(row["max_retries"]),
            max_cost_usd=float(row["max_cost_usd"]),
            updated_at=str(row["updated_at"]),
        )

    def list_bucket_ids(self) -> list[str]:
        with self._connect() as conn:
            rows = conn.execute("SELECT bucket_id FROM buckets ORDER BY bucket_id").fetchall()
        return [str(r["bucket_id"]) for r in rows]

    def register_artifact(
        self,
        bucket_id: str,
        serial_uri: str,
        artifact_kind: str,
        content: str,
        *,
        z3_constraints_json: str | None = None,
        z3_status: str = "SKIPPED",
        timestamp: str | None = None,
    ) -> CanonicalRecord:
        """Append a bi-temporal version for serial_uri and close the prior active version."""
        now = timestamp or utc_now_iso()
        digest = compute_sha256(content)

        with self._write_tx() as conn:
            bucket_exists = conn.execute("SELECT 1 FROM buckets WHERE bucket_id = ?", (bucket_id,)).fetchone()
            if bucket_exists is None:
                raise BucketNotFoundError(bucket_id)

            active = conn.execute(
                "SELECT record_id, version FROM canonical_registry WHERE serial_uri = ? AND valid_to IS NULL",
                (serial_uri,),
            ).fetchone()
            max_row = conn.execute(
                "SELECT COALESCE(MAX(version), 0) AS max_ver FROM canonical_registry WHERE serial_uri = ?",
                (serial_uri,),
            ).fetchone()
            next_version = int(max_row["max_ver"]) + 1

            if active is not None:
                conn.execute(
                    "UPDATE canonical_registry SET valid_to = ? WHERE record_id = ?",
                    (now, int(active["record_id"])),
                )

            cur = conn.execute(
                """
                INSERT INTO canonical_registry (
                    serial_uri, bucket_id, artifact_kind, version, sha256, content,
                    z3_constraints_json, z3_status, valid_from, valid_to, ingested_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
                """,
                (
                    serial_uri,
                    bucket_id,
                    artifact_kind,
                    next_version,
                    digest,
                    content,
                    z3_constraints_json,
                    z3_status,
                    now,
                    now,
                ),
            )
            record_id = int(cur.lastrowid or 0)
            row = conn.execute("SELECT * FROM canonical_registry WHERE record_id = ?", (record_id,)).fetchone()
        assert row is not None
        return self._row_to_canonical(row)

    def resolve_serial(
        self,
        bucket_id: str,
        serial_uri: str,
        *,
        as_of_timestamp: str | None = None,
    ) -> CanonicalRecord:
        """Exact O(1) lookup with mandatory SHA-256 verification."""
        with self._connect() as conn:
            if as_of_timestamp is None:
                row = conn.execute(
                    """
                    SELECT * FROM canonical_registry
                    WHERE bucket_id = ? AND serial_uri = ? AND valid_to IS NULL
                    """,
                    (bucket_id, serial_uri),
                ).fetchone()
            else:
                row = conn.execute(
                    """
                    SELECT * FROM canonical_registry
                    WHERE bucket_id = ? AND serial_uri = ?
                      AND valid_from <= ?
                      AND (valid_to IS NULL OR valid_to > ?)
                    ORDER BY version DESC LIMIT 1
                    """,
                    (bucket_id, serial_uri, as_of_timestamp, as_of_timestamp),
                ).fetchone()
        if row is None:
            raise SerialNotFoundError(bucket_id, serial_uri)
        rec = self._row_to_canonical(row)
        actual_sha = compute_sha256(rec.content)
        if actual_sha != rec.sha256:
            raise HashMismatchError(serial_uri, rec.sha256, actual_sha)
        return rec

    def get_record_by_id(self, record_id: int) -> CanonicalRecord | None:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM canonical_registry WHERE record_id = ?", (record_id,)).fetchone()
        return self._row_to_canonical(row) if row is not None else None

    def list_active_serial_map(self, bucket_id: str) -> dict[str, dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT record_id, serial_uri, artifact_kind, version, sha256, z3_status
                FROM canonical_registry
                WHERE bucket_id = ? AND valid_to IS NULL
                ORDER BY serial_uri
                """,
                (bucket_id,),
            ).fetchall()
        return {
            str(r["serial_uri"]): {
                "record_id": int(r["record_id"]),
                "artifact_kind": str(r["artifact_kind"]),
                "version": int(r["version"]),
                "sha256": str(r["sha256"]),
                "z3_status": str(r["z3_status"]),
            }
            for r in rows
        }

    def list_active_artifacts(self, bucket_id: str, artifact_kind: str) -> list[CanonicalRecord]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM canonical_registry
                WHERE bucket_id = ? AND artifact_kind = ? AND valid_to IS NULL
                ORDER BY record_id ASC
                """,
                (bucket_id, artifact_kind),
            ).fetchall()
        return [self._row_to_canonical(r) for r in rows]

    @staticmethod
    def _row_to_canonical(row: sqlite3.Row) -> CanonicalRecord:
        return CanonicalRecord(
            record_id=int(row["record_id"]),
            serial_uri=str(row["serial_uri"]),
            bucket_id=str(row["bucket_id"]),
            artifact_kind=str(row["artifact_kind"]),
            version=int(row["version"]),
            sha256=str(row["sha256"]),
            content=str(row["content"]),
            z3_constraints_json=str(row["z3_constraints_json"]) if row["z3_constraints_json"] is not None else None,
            z3_status=str(row["z3_status"]),
            valid_from=str(row["valid_from"]),
            valid_to=str(row["valid_to"]) if row["valid_to"] is not None else None,
            ingested_at=str(row["ingested_at"]),
        )

    def insert_semantic_chunk(
        self,
        bucket_id: str,
        record_id: int | None,
        anchor_polarity: str,
        content_summary: str,
        embedding: np.ndarray,
        model_id: str,
        ttl_expires_at: str | None = None,
    ) -> int:
        vec = np.asarray(embedding, dtype=np.float32).reshape(-1)
        norm = float(np.linalg.norm(vec))
        if norm > 0.0:
            vec = vec / norm
        blob = vec.tobytes()
        now = utc_now_iso()
        with self._write_tx() as conn:
            cur = conn.execute(
                """
                INSERT INTO semantic_chunks (
                    bucket_id, record_id, anchor_polarity, content_summary,
                    embedding, embedding_dim, model_id, ttl_expires_at, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    bucket_id,
                    record_id,
                    anchor_polarity,
                    content_summary,
                    blob,
                    int(vec.shape[0]),
                    model_id,
                    ttl_expires_at,
                    now,
                ),
            )
            return int(cur.lastrowid or 0)

    def search_semantic_chunks(
        self,
        bucket_id: str,
        query_vector: np.ndarray,
        *,
        top_k: int = 5,
        now_iso: str | None = None,
        model_id: str | None = None,
    ) -> list[SemanticMatch]:
        """Pre-filtered cosine similarity search strictly inside bucket_id and active TTL."""
        q = np.asarray(query_vector, dtype=np.float32).reshape(-1)
        q_norm = float(np.linalg.norm(q))
        if q_norm == 0.0:
            return []
        q = q / q_norm
        now = now_iso or utc_now_iso()

        query = """
            SELECT chunk_id, bucket_id, record_id, anchor_polarity, content_summary, embedding, embedding_dim, model_id
            FROM semantic_chunks
            WHERE bucket_id = ?
              AND embedding_dim = ?
              AND (ttl_expires_at IS NULL OR ttl_expires_at > ?)
        """
        params: list[Any] = [bucket_id, int(q.shape[0]), now]
        if model_id is not None:
            query += " AND model_id = ?"
            params.append(model_id)

        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        if not rows:
            return []

        matrix = np.vstack([np.frombuffer(r["embedding"], dtype=np.float32) for r in rows])
        sims = matrix @ q
        top_indices = np.argsort(-sims)[: max(1, top_k)]
        results: list[SemanticMatch] = []
        for idx in top_indices:
            r = rows[int(idx)]
            results.append(
                SemanticMatch(
                    chunk_id=int(r["chunk_id"]),
                    bucket_id=str(r["bucket_id"]),
                    record_id=int(r["record_id"]) if r["record_id"] is not None else None,
                    anchor_polarity=str(r["anchor_polarity"]),
                    content_summary=str(r["content_summary"]),
                    similarity=float(sims[int(idx)]),
                    model_id=str(r["model_id"]),
                )
            )
        return results

    def get_anchor_embeddings(
        self,
        bucket_id: str,
        *,
        dim: int,
        model_id: str | None = None,
    ) -> tuple[np.ndarray, np.ndarray]:
        """Return (A_pos, A_neg) column matrices of shape (dim, n) for SPACE SVD."""
        query = """
            SELECT anchor_polarity, embedding
            FROM semantic_chunks
            WHERE bucket_id = ?
              AND embedding_dim = ?
              AND anchor_polarity IN ('positive', 'negative')
        """
        params: list[Any] = [bucket_id, dim]
        if model_id is not None:
            query += " AND model_id = ?"
            params.append(model_id)
        query += " ORDER BY chunk_id ASC"

        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()

        pos_vecs: list[np.ndarray] = []
        neg_vecs: list[np.ndarray] = []
        for r in rows:
            vec = np.frombuffer(r["embedding"], dtype=np.float32).astype(np.float64)
            if r["anchor_polarity"] == "positive":
                pos_vecs.append(vec)
            else:
                neg_vecs.append(vec)

        pos_mat = np.column_stack(pos_vecs) if pos_vecs else np.zeros((dim, 0), dtype=np.float64)
        neg_mat = np.column_stack(neg_vecs) if neg_vecs else np.zeros((dim, 0), dtype=np.float64)
        return pos_mat, neg_mat

    def count_semantic_anchors(self, bucket_id: str, polarity: str) -> int:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) AS cnt FROM semantic_chunks WHERE bucket_id = ? AND anchor_polarity = ?",
                (bucket_id, polarity),
            ).fetchone()
        return int(row["cnt"]) if row is not None else 0

    def create_workflow_run(
        self,
        run_id: str,
        bucket_id: str,
        contract_record_id: int,
        prefix_hash: str,
        *,
        session_id: str | None = None,
        conductor_vehicle: str | None = None,
        conductor_model: str | None = None,
    ) -> None:
        now = utc_now_iso()
        with self._write_tx() as conn:
            conn.execute(
                """
                INSERT INTO workflow_runs (
                    run_id, bucket_id, contract_record_id, prefix_hash, status,
                    session_id, conductor_vehicle, conductor_model, started_at
                )
                VALUES (?, ?, ?, ?, 'RUNNING', ?, ?, ?, ?)
                """,
                (
                    run_id,
                    bucket_id,
                    contract_record_id,
                    prefix_hash,
                    session_id,
                    conductor_vehicle,
                    conductor_model,
                    now,
                ),
            )

    def get_workflow_run(self, run_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM workflow_runs WHERE run_id = ?", (run_id,)).fetchone()
        if row is None:
            raise RunNotFoundError(run_id)
        return dict(row)

    def update_workflow_run_stats(
        self,
        run_id: str,
        *,
        status: str | None = None,
        add_tokens_in: int = 0,
        add_cached_tokens_in: int = 0,
        add_tokens_out: int = 0,
        add_cost_usd: float = 0.0,
    ) -> None:
        now = utc_now_iso()
        with self._write_tx() as conn:
            if status is not None and status != "RUNNING":
                conn.execute(
                    """
                    UPDATE workflow_runs
                    SET status = ?,
                        total_tokens_in = total_tokens_in + ?,
                        cached_tokens_in = cached_tokens_in + ?,
                        total_tokens_out = total_tokens_out + ?,
                        total_cost_usd = total_cost_usd + ?,
                        finished_at = ?
                    WHERE run_id = ?
                    """,
                    (status, add_tokens_in, add_cached_tokens_in, add_tokens_out, add_cost_usd, now, run_id),
                )
            else:
                conn.execute(
                    """
                    UPDATE workflow_runs
                    SET total_tokens_in = total_tokens_in + ?,
                        cached_tokens_in = cached_tokens_in + ?,
                        total_tokens_out = total_tokens_out + ?,
                        total_cost_usd = total_cost_usd + ?
                    WHERE run_id = ?
                    """,
                    (add_tokens_in, add_cached_tokens_in, add_tokens_out, add_cost_usd, run_id),
                )

    def get_checkpoint_by_idempotency_key(self, idempotency_key: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM node_checkpoints WHERE idempotency_key = ?",
                (idempotency_key,),
            ).fetchone()
        return dict(row) if row is not None else None

    def get_checkpoint_by_attempt(self, run_id: str, node_id: str, attempt: int) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM node_checkpoints WHERE run_id = ? AND node_id = ? AND attempt = ?",
                (run_id, node_id, attempt),
            ).fetchone()
        return dict(row) if row is not None else None

    def get_latest_node_checkpoint(self, run_id: str, node_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT * FROM node_checkpoints
                WHERE run_id = ? AND node_id = ?
                ORDER BY attempt DESC LIMIT 1
                """,
                (run_id, node_id),
            ).fetchone()
        return dict(row) if row is not None else None

    def insert_checkpoint(self, payload: dict[str, Any]) -> int:
        now = utc_now_iso()
        with self._write_tx() as conn:
            existing = conn.execute(
                "SELECT idempotency_key FROM node_checkpoints WHERE run_id = ? AND node_id = ? AND attempt = ?",
                (payload["run_id"], payload["node_id"], payload["attempt"]),
            ).fetchone()
            if existing is not None and str(existing["idempotency_key"]) != str(payload["idempotency_key"]):
                raise AttemptConflictError(str(payload["run_id"]), str(payload["node_id"]), int(payload["attempt"]))

            cur = conn.execute(
                """
                INSERT INTO node_checkpoints (
                    idempotency_key, run_id, node_id, action_role, attempt, compute_lane,
                    strategy_record_id, cascade_stage, v_det_passed, z3_status,
                    error_hash, error_delta, equiv_metric_kind, convergence_score,
                    s_id, s_viol, drift_score, stage_dense_reward, cost_usd,
                    latency_ms, artifact_blob, decision, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload["idempotency_key"],
                    payload["run_id"],
                    payload["node_id"],
                    payload["action_role"],
                    int(payload["attempt"]),
                    payload["compute_lane"],
                    payload.get("strategy_record_id"),
                    payload["cascade_stage"],
                    int(bool(payload["v_det_passed"])),
                    payload.get("z3_status", "SKIPPED"),
                    payload.get("error_hash"),
                    payload.get("error_delta"),
                    payload["equiv_metric_kind"],
                    float(payload["convergence_score"]),
                    float(payload["s_id"]),
                    float(payload["s_viol"]),
                    float(payload["drift_score"]),
                    float(payload["stage_dense_reward"]),
                    float(payload.get("cost_usd", 0.0)),
                    int(payload.get("latency_ms", 0)),
                    payload.get("artifact_blob"),
                    payload["decision"],
                    now,
                ),
            )
            return int(cur.lastrowid or 0)

    def append_replay_episode(
        self,
        *,
        run_id: str,
        bucket_id: str,
        node_id: str,
        action_role: str,
        strategy_record_id: int | None,
        step_index: int,
        v_det_passed: bool,
        drift_score: float,
        dense_reward: float,
        trace_summary: str,
        predicted_value: float = 0.5,
        human_edit_ratio: float | None = None,
        reverted: bool = False,
        n_step_return: float | None = None,
        per_priority: float | None = None,
    ) -> int:
        now = utc_now_iso()
        ret = dense_reward if n_step_return is None else n_step_return
        prio = abs(ret - predicted_value) + 1e-4 if per_priority is None else per_priority
        with self._write_tx() as conn:
            cur = conn.execute(
                """
                INSERT INTO replay_buffer (
                    run_id, bucket_id, node_id, action_role, strategy_record_id,
                    step_index, v_det_passed, drift_score, dense_reward,
                    human_edit_ratio, reverted, n_step_return, predicted_value,
                    per_priority, trace_summary, crystallized, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                """,
                (
                    run_id,
                    bucket_id,
                    node_id,
                    action_role,
                    strategy_record_id,
                    step_index,
                    int(v_det_passed),
                    drift_score,
                    dense_reward,
                    human_edit_ratio,
                    int(reverted),
                    ret,
                    predicted_value,
                    prio,
                    trace_summary,
                    now,
                ),
            )
            return int(cur.lastrowid or 0)

    def get_run_episodes(self, run_id: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM replay_buffer WHERE run_id = ? ORDER BY step_index ASC, episode_id ASC",
                (run_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def update_episode_returns(self, updates: Sequence[tuple[int, float, float, float, int]]) -> None:
        """Update (episode_id, human_edit_ratio, reverted, n_step_return, per_priority) rows."""
        with self._write_tx() as conn:
            for ep_id, n_ret, prio, edit_ratio, reverted_int in updates:
                conn.execute(
                    """
                    UPDATE replay_buffer
                    SET human_edit_ratio = ?,
                        reverted = ?,
                        n_step_return = ?,
                        per_priority = ?
                    WHERE episode_id = ?
                    """,
                    (edit_ratio, reverted_int, n_ret, prio, ep_id),
                )

    def list_replay_for_crc(self, bucket_id: str, action_role: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT episode_id, v_det_passed, drift_score, human_edit_ratio, reverted
                FROM replay_buffer
                WHERE bucket_id = ? AND action_role = ?
                ORDER BY episode_id ASC
                """,
                (bucket_id, action_role),
            ).fetchall()
        return [dict(r) for r in rows]

    def list_top_per_episodes(
        self, bucket_id: str, limit: int = 5, *, only_uncrystallized: bool = True
    ) -> list[dict[str, Any]]:
        with self._connect() as conn:
            if only_uncrystallized:
                rows = conn.execute(
                    """
                    SELECT * FROM replay_buffer
                    WHERE bucket_id = ? AND crystallized = 0
                    ORDER BY per_priority DESC, episode_id DESC
                    LIMIT ?
                    """,
                    (bucket_id, limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT * FROM replay_buffer
                    WHERE bucket_id = ?
                    ORDER BY per_priority DESC, episode_id DESC
                    LIMIT ?
                    """,
                    (bucket_id, limit),
                ).fetchall()
        return [dict(r) for r in rows]

    def mark_episodes_crystallized(self, episode_ids: Sequence[int]) -> None:
        if not episode_ids:
            return
        with self._write_tx() as conn:
            conn.executemany(
                "UPDATE replay_buffer SET crystallized = 1 WHERE episode_id = ?",
                [(int(ep_id),) for ep_id in episode_ids],
            )

    def get_crc_calibration(self, bucket_id: str, action_role: str) -> CrcCalibrationRecord:
        self.get_bucket(bucket_id)
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM crc_calibration WHERE bucket_id = ? AND action_role = ?",
                (bucket_id, action_role),
            ).fetchone()
        if row is None:
            now = utc_now_iso()
            with self._write_tx() as conn:
                self._ensure_crc_priors(conn, bucket_id, now)
                row = conn.execute(
                    "SELECT * FROM crc_calibration WHERE bucket_id = ? AND action_role = ?",
                    (bucket_id, action_role),
                ).fetchone()
        assert row is not None
        return CrcCalibrationRecord(
            bucket_id=str(row["bucket_id"]),
            action_role=str(row["action_role"]),
            alpha_target=float(row["alpha_target"]),
            lambda_unified=float(row["lambda_unified"]),
            lambda_id_min=float(row["lambda_id_min"]),
            lambda_viol_max=float(row["lambda_viol_max"]),
            conv_high_threshold=float(row["conv_high_threshold"]),
            conv_low_threshold=float(row["conv_low_threshold"]),
            sample_size_n=int(row["sample_size_n"]),
            is_cold_start=bool(row["is_cold_start"]),
            calibration_mode=str(row["calibration_mode"]),
            calibrated_at=str(row["calibrated_at"]),
        )

    def upsert_crc_calibration(self, record: CrcCalibrationRecord) -> None:
        with self._write_tx() as conn:
            conn.execute(
                """
                INSERT INTO crc_calibration (
                    bucket_id, action_role, alpha_target, lambda_unified,
                    lambda_id_min, lambda_viol_max, conv_high_threshold,
                    conv_low_threshold, sample_size_n, is_cold_start,
                    calibration_mode, calibrated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(bucket_id, action_role) DO UPDATE SET
                    alpha_target = excluded.alpha_target,
                    lambda_unified = excluded.lambda_unified,
                    lambda_id_min = excluded.lambda_id_min,
                    lambda_viol_max = excluded.lambda_viol_max,
                    conv_high_threshold = excluded.conv_high_threshold,
                    conv_low_threshold = excluded.conv_low_threshold,
                    sample_size_n = excluded.sample_size_n,
                    is_cold_start = excluded.is_cold_start,
                    calibration_mode = excluded.calibration_mode,
                    calibrated_at = excluded.calibrated_at
                """,
                (
                    record.bucket_id,
                    record.action_role,
                    record.alpha_target,
                    record.lambda_unified,
                    record.lambda_id_min,
                    record.lambda_viol_max,
                    record.conv_high_threshold,
                    record.conv_low_threshold,
                    record.sample_size_n,
                    int(record.is_cold_start),
                    record.calibration_mode,
                    record.calibrated_at,
                ),
            )

    def get_active_elite(self, bucket_id: str, niche_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT m.*, r.serial_uri, r.content, r.sha256, r.version
                FROM map_elites_archive m
                JOIN canonical_registry r ON r.record_id = m.strategy_record_id
                WHERE m.bucket_id = ? AND m.niche_id = ?
                """,
                (bucket_id, niche_id),
            ).fetchone()
        return dict(row) if row is not None else None

    def upsert_map_elite(
        self,
        *,
        bucket_id: str,
        niche_id: str,
        strategy_record_id: int,
        mean_quality: float,
        mean_cost_usd: float,
        mean_latency_ms: float,
        zero_reg_verified: bool,
        approval_mode: str = "auto_calibration",
    ) -> None:
        if not zero_reg_verified:
            raise ControlPlaneError("ZERO_REGRESSION_REQUIRED", "Cannot promote elite without zero_reg_verified=True.")
        now = utc_now_iso()
        with self._write_tx() as conn:
            conn.execute(
                """
                INSERT INTO map_elites_archive (
                    bucket_id, niche_id, strategy_record_id, mean_quality,
                    mean_cost_usd, mean_latency_ms, zero_reg_verified,
                    approval_mode, promoted_at
                )
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(bucket_id, niche_id) DO UPDATE SET
                    strategy_record_id = excluded.strategy_record_id,
                    mean_quality = excluded.mean_quality,
                    mean_cost_usd = excluded.mean_cost_usd,
                    mean_latency_ms = excluded.mean_latency_ms,
                    zero_reg_verified = 1,
                    approval_mode = excluded.approval_mode,
                    promoted_at = excluded.promoted_at
                """,
                (
                    bucket_id,
                    niche_id,
                    strategy_record_id,
                    mean_quality,
                    mean_cost_usd,
                    mean_latency_ms,
                    approval_mode,
                    now,
                ),
            )

    def record_gepa_reflection(
        self,
        *,
        bucket_id: str,
        source_episode_ids: Sequence[int],
        root_cause_rule: str,
        challenger_record_id: int | None,
        pareto_dominated: bool,
    ) -> int:
        now = utc_now_iso()
        with self._write_tx() as conn:
            cur = conn.execute(
                """
                INSERT INTO gepa_reflections (
                    bucket_id, source_episode_ids, root_cause_rule,
                    challenger_record_id, pareto_dominated, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    bucket_id,
                    json.dumps(list(source_episode_ids)),
                    root_cause_rule,
                    challenger_record_id,
                    int(pareto_dominated),
                    now,
                ),
            )
            return int(cur.lastrowid or 0)

    def compute_kpis(self, bucket_id: str | None = None) -> dict[str, Any]:
        """Compute objective production Go/No-Go metrics from persisted telemetry."""
        with self._connect() as conn:
            if bucket_id is not None:
                runs = conn.execute(
                    """
                    SELECT COUNT(*) AS total_runs,
                           SUM(CASE WHEN status = 'COMMITTED' THEN 1 ELSE 0 END) AS committed_runs,
                           COALESCE(SUM(total_cost_usd), 0.0) AS sum_cost,
                           COALESCE(SUM(total_tokens_in), 0) AS sum_tokens_in,
                           COALESCE(SUM(cached_tokens_in), 0) AS sum_cached_in
                    FROM workflow_runs
                    WHERE bucket_id = ?
                    """,
                    (bucket_id,),
                ).fetchone()
                ckpts = conn.execute(
                    """
                    SELECT latency_ms
                    FROM node_checkpoints
                    WHERE run_id IN (SELECT run_id FROM workflow_runs WHERE bucket_id = ?)
                    ORDER BY latency_ms ASC
                    """,
                    (bucket_id,),
                ).fetchall()
                valid_feedback = conn.execute(
                    """
                    SELECT COUNT(DISTINCT run_id) AS clean_commits
                    FROM replay_buffer
                    WHERE run_id IN (SELECT run_id FROM workflow_runs WHERE bucket_id = ?)
                      AND reverted = 0
                      AND (human_edit_ratio IS NULL OR human_edit_ratio <= 0.15)
                    """,
                    (bucket_id,),
                ).fetchone()
            else:
                runs = conn.execute(
                    """
                    SELECT COUNT(*) AS total_runs,
                           SUM(CASE WHEN status = 'COMMITTED' THEN 1 ELSE 0 END) AS committed_runs,
                           COALESCE(SUM(total_cost_usd), 0.0) AS sum_cost,
                           COALESCE(SUM(total_tokens_in), 0) AS sum_tokens_in,
                           COALESCE(SUM(cached_tokens_in), 0) AS sum_cached_in
                    FROM workflow_runs
                    """,
                ).fetchone()
                ckpts = conn.execute(
                    "SELECT latency_ms FROM node_checkpoints ORDER BY latency_ms ASC",
                ).fetchall()
                valid_feedback = conn.execute(
                    """
                    SELECT COUNT(DISTINCT run_id) AS clean_commits
                    FROM replay_buffer
                    WHERE reverted = 0
                      AND (human_edit_ratio IS NULL OR human_edit_ratio <= 0.15)
                    """,
                ).fetchone()

        total_runs = int(runs["total_runs"]) if runs else 0
        committed = int(runs["committed_runs"] or 0) if runs else 0
        sum_cost = float(runs["sum_cost"] or 0.0) if runs else 0.0
        sum_in = int(runs["sum_tokens_in"] or 0) if runs else 0
        sum_cached = int(runs["sum_cached_in"] or 0) if runs else 0
        clean_commits = int(valid_feedback["clean_commits"] or 0) if valid_feedback else 0

        latencies = [int(r["latency_ms"]) for r in ckpts]
        p95_ms = float(np.percentile(latencies, 95)) if latencies else 0.0

        return {
            "total_runs": total_runs,
            "committed_runs": committed,
            "verified_delivery_rate": round(min(committed, clean_commits) / total_runs, 4) if total_runs > 0 else 0.0,
            "mean_cost_per_verified_commit_usd": round(sum_cost / committed, 6) if committed > 0 else 0.0,
            "prefix_cache_hit_rate": round(sum_cached / sum_in, 4) if sum_in > 0 else 0.0,
            "control_plane_p95_ms": round(p95_ms, 2),
        }
