"""Tests for bi-temporal canonical registry, anti-LFI, SHA-256 integrity, and pre-filtered search."""

from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from pathlib import Path
import sqlite3
from typing import Any

import numpy as np
import pytest

from control_plane.config import (
    ActionRole,
    ArtifactKind,
    CascadeStage,
    ComputeLane,
    ControlPlaneConfig,
    EquivMetricKind,
    ThermostatDecision,
)
from control_plane.spectral import HashProjectionEmbedder
from control_plane.storage import (
    AttemptConflictError,
    ControlPlaneStore,
    HashMismatchError,
    ReplayEpisodeInput,
    SerialNotFoundError,
)


def _make_store(db_path: str = ":memory:") -> ControlPlaneStore:
    cfg = ControlPlaneConfig(db_path=db_path, allow_external_path=True)
    store = ControlPlaneStore(cfg)
    store.initialize(seed_defaults=True)
    return store


@pytest.mark.unit
def test_bitemporal_versioning_and_as_of_resolution() -> None:
    store = _make_store()
    try:
        t1 = "2026-11-27T10:00:00+00:00"
        t2 = "2026-11-27T11:00:00+00:00"

        v1 = store.register_artifact(
            "engineering-and-quality",
            "core://contracts/auth-v2",
            ArtifactKind.CONTRACT.value,
            "contract v1",
            timestamp=t1,
        )
        v2 = store.register_artifact(
            "engineering-and-quality",
            "core://contracts/auth-v2",
            ArtifactKind.CONTRACT.value,
            "contract v2",
            timestamp=t2,
        )

        assert v1.version == 1
        assert v2.version == 2
        assert v1.record_id != v2.record_id

        active = store.resolve_serial("engineering-and-quality", "core://contracts/auth-v2")
        assert active.version == 2
        assert active.content == "contract v2"

        hist = store.resolve_serial(
            "engineering-and-quality",
            "core://contracts/auth-v2",
            as_of_timestamp="2026-11-27T10:30:00+00:00",
        )
        assert hist.version == 1
        assert hist.content == "contract v1"
    finally:
        store.close()


@pytest.mark.unit
def test_sha256_tamper_detection_and_anti_lfi(tmp_path: Path) -> None:
    outside = tmp_path / "escape.db"
    with pytest.raises(PermissionError, match="escapes Site root"):
        ControlPlaneStore(ControlPlaneConfig(db_path=str(outside), allow_external_path=False))

    store = _make_store(str(outside))
    try:
        rec = store.register_artifact(
            "pmev-and-quant",
            "core://pmev/icm",
            ArtifactKind.CONTRACT.value,
            "icm invariant",
        )
        with sqlite3.connect(str(outside)) as conn:
            conn.execute(
                "UPDATE canonical_registry SET content = 'tampered' WHERE record_id = ?",
                (rec.record_id,),
            )
            conn.commit()

        with pytest.raises(HashMismatchError):
            store.resolve_serial("pmev-and-quant", "core://pmev/icm")

        with pytest.raises(SerialNotFoundError):
            store.resolve_serial("pmev-and-quant", "core://missing/uri")
    finally:
        store.close()


@pytest.mark.unit
def test_prefiltered_semantic_search_isolates_buckets_and_ttl() -> None:
    store = _make_store()
    embedder = HashProjectionEmbedder(dim=128)
    try:
        future_ttl = (datetime.now(UTC) + timedelta(hours=2)).isoformat()
        past_ttl = (datetime.now(UTC) - timedelta(hours=2)).isoformat()

        # Populate another bucket with exact matching query text (must never leak)
        q_vec = embedder.embed("poker equity simulation")
        store.insert_semantic_chunk(
            bucket_id="runtime-and-credentials",
            record_id=None,
            anchor_polarity="none",
            content_summary="poker equity simulation leaked from wrong bucket",
            embedding=q_vec,
            model_id=embedder.model_id,
        )
        # Expired chunk in target bucket (must be filtered before ranking)
        store.insert_semantic_chunk(
            bucket_id="pmev-and-quant",
            record_id=None,
            anchor_polarity="none",
            content_summary="expired poker equity simulation",
            embedding=q_vec,
            model_id=embedder.model_id,
            ttl_expires_at=past_ttl,
        )
        # Valid active chunk in target bucket
        valid_vec = np.asarray(embedder.embed("poker equity simulation valid"), dtype=np.float32)
        store.insert_semantic_chunk(
            bucket_id="pmev-and-quant",
            record_id=None,
            anchor_polarity="none",
            content_summary="valid poker equity simulation",
            embedding=valid_vec,
            model_id=embedder.model_id,
            ttl_expires_at=future_ttl,
        )

        matches = store.search_semantic_chunks("pmev-and-quant", q_vec, top_k=5, model_id=embedder.model_id)
        assert len(matches) == 1
        assert matches[0].bucket_id == "pmev-and-quant"
        assert matches[0].content_summary == "valid poker equity simulation"
    finally:
        store.close()


def _multiprocess_wal_worker(db_path: str, worker_id: int, iterations: int) -> dict[str, Any]:
    store = ControlPlaneStore(ControlPlaneConfig(db_path=db_path, allow_external_path=True))
    try:
        store.seed_default_buckets()
        for i in range(iterations):
            rec = store.register_artifact(
                "engineering-and-quality",
                "core://wal/mp-contract",
                ArtifactKind.CONTRACT.value,
                f"proc-{worker_id}-iter-{i}",
            )
            run_id = f"mp-run-{worker_id}-{i}"
            store.create_workflow_run(run_id, "engineering-and-quality", rec.record_id, f"hash-{worker_id}-{i}")
            store.insert_checkpoint(
                {
                    "idempotency_key": f"{run_id}-n0-1",
                    "run_id": run_id,
                    "node_id": "n0",
                    "action_role": ActionRole.LOCAL_PATCH.value,
                    "attempt": 1,
                    "compute_lane": ComputeLane.L0_DET.value,
                    "cascade_stage": CascadeStage.S1_UNIT.value,
                    "v_det_passed": True,
                    "equiv_metric_kind": EquivMetricKind.AST_TEST.value,
                    "convergence_score": 1.0,
                    "s_id": 0.9,
                    "s_viol": 0.05,
                    "drift_score": 0.1,
                    "stage_dense_reward": 0.8,
                    "decision": ThermostatDecision.COMMIT.value,
                }
            )
            store.append_replay_episode(
                ReplayEpisodeInput(
                    run_id=run_id,
                    bucket_id="engineering-and-quality",
                    node_id="n0",
                    action_role=ActionRole.LOCAL_PATCH.value,
                    strategy_record_id=rec.record_id,
                    step_index=0,
                    v_det_passed=True,
                    drift_score=0.1,
                    dense_reward=0.8,
                    trace_summary=f"mp-{worker_id}-{i}",
                )
            )
        return {"worker_id": worker_id, "written": iterations}
    finally:
        store.close()


@pytest.mark.unit
def test_sqlite_wal_multithread_concurrent_writes_and_reads(tmp_path: Path) -> None:
    db_path = tmp_path / "wal_threads.db"
    store = _make_store(str(db_path))
    embedder = HashProjectionEmbedder(dim=64)
    try:
        base_rec = store.register_artifact(
            "engineering-and-quality",
            "core://wal/shared-contract",
            ArtifactKind.CONTRACT.value,
            "seed",
        )
        store.insert_semantic_chunk(
            bucket_id="engineering-and-quality",
            record_id=base_rec.record_id,
            anchor_polarity="positive",
            content_summary="wal concurrent seed chunk",
            embedding=embedder.embed("wal concurrent contract"),
            model_id=embedder.model_id,
        )
        store.create_workflow_run("race-run", "engineering-and-quality", base_rec.record_id, "race-hash")
        q_vec = embedder.embed("wal concurrent contract")

        def _thread_worker(tid: int) -> tuple[int, str]:
            local = ControlPlaneStore(ControlPlaneConfig(db_path=str(db_path), allow_external_path=True))
            conflict_outcome = "ok"
            try:
                for step in range(5):
                    rec = local.register_artifact(
                        "engineering-and-quality",
                        "core://wal/shared-contract",
                        ArtifactKind.CONTRACT.value,
                        f"thread-{tid}-step-{step}",
                    )
                    rid = f"mt-run-{tid}-{step}"
                    local.create_workflow_run(rid, "engineering-and-quality", rec.record_id, f"h-{tid}-{step}")
                    local.insert_checkpoint(
                        {
                            "idempotency_key": f"{rid}-n0-1",
                            "run_id": rid,
                            "node_id": "n0",
                            "action_role": ActionRole.LOCAL_PATCH.value,
                            "attempt": 1,
                            "compute_lane": ComputeLane.L0_DET.value,
                            "cascade_stage": CascadeStage.S1_UNIT.value,
                            "v_det_passed": True,
                            "equiv_metric_kind": EquivMetricKind.AST_TEST.value,
                            "convergence_score": 1.0,
                            "s_id": 0.9,
                            "s_viol": 0.05,
                            "drift_score": 0.1,
                            "stage_dense_reward": 0.8,
                            "decision": ThermostatDecision.COMMIT.value,
                        }
                    )
                    local.append_replay_episode(
                        ReplayEpisodeInput(
                            run_id=rid,
                            bucket_id="engineering-and-quality",
                            node_id="n0",
                            action_role=ActionRole.LOCAL_PATCH.value,
                            strategy_record_id=rec.record_id,
                            step_index=0,
                            v_det_passed=True,
                            drift_score=0.1,
                            dense_reward=0.8,
                            trace_summary=f"mt-{tid}-{step}",
                        )
                    )
                    resolved = local.resolve_serial("engineering-and-quality", "core://wal/shared-contract")
                    assert resolved.version >= 1
                    matches = local.search_semantic_chunks(
                        "engineering-and-quality", q_vec, top_k=3, model_id=embedder.model_id
                    )
                    assert len(matches) >= 1

                try:
                    local.insert_checkpoint(
                        {
                            "idempotency_key": f"race-key-{tid}",
                            "run_id": "race-run",
                            "node_id": "race-node",
                            "action_role": ActionRole.LOCAL_PATCH.value,
                            "attempt": 1,
                            "compute_lane": ComputeLane.L0_DET.value,
                            "cascade_stage": CascadeStage.S1_UNIT.value,
                            "v_det_passed": True,
                            "equiv_metric_kind": EquivMetricKind.AST_TEST.value,
                            "convergence_score": 1.0,
                            "s_id": 0.9,
                            "s_viol": 0.05,
                            "drift_score": 0.1,
                            "stage_dense_reward": 0.8,
                            "decision": ThermostatDecision.COMMIT.value,
                        }
                    )
                except AttemptConflictError:
                    conflict_outcome = "conflict"
            finally:
                local.close()
            return tid, conflict_outcome

        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(_thread_worker, range(8)))

        ok_winners = sum(1 for _, status in results if status == "ok")
        conflicts = sum(1 for _, status in results if status == "conflict")
        assert ok_winners == 1
        assert conflicts == 7

        with sqlite3.connect(str(db_path)) as conn:
            versions = [
                r[0]
                for r in conn.execute(
                    "SELECT version FROM canonical_registry WHERE serial_uri = 'core://wal/shared-contract' ORDER BY version ASC"
                ).fetchall()
            ]
            active_cnt = conn.execute(
                "SELECT COUNT(*) FROM canonical_registry WHERE serial_uri = 'core://wal/shared-contract' AND valid_to IS NULL"
            ).fetchone()[0]
            integrity = conn.execute("PRAGMA integrity_check;").fetchone()[0]

        assert versions == list(range(1, 42))
        assert active_cnt == 1
        assert integrity == "ok"
        active_rec = store.resolve_serial("engineering-and-quality", "core://wal/shared-contract")
        assert active_rec.version == 41
    finally:
        store.close()


@pytest.mark.unit
def test_sqlite_wal_multiprocess_concurrent_writes(tmp_path: Path) -> None:
    db_path = tmp_path / "wal_processes.db"
    store = _make_store(str(db_path))
    store.close()

    with ProcessPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(_multiprocess_wal_worker, str(db_path), wid, 15) for wid in range(4)]
        worker_results = [f.result(timeout=60) for f in futures]

    assert sum(int(r["written"]) for r in worker_results) == 60

    verify_store = ControlPlaneStore(ControlPlaneConfig(db_path=str(db_path), allow_external_path=True))
    try:
        active = verify_store.resolve_serial("engineering-and-quality", "core://wal/mp-contract")
        assert active.version == 60
        with sqlite3.connect(str(db_path)) as conn:
            versions = [
                r[0]
                for r in conn.execute(
                    "SELECT version FROM canonical_registry WHERE serial_uri = 'core://wal/mp-contract' ORDER BY version ASC"
                ).fetchall()
            ]
            active_cnt = conn.execute(
                "SELECT COUNT(*) FROM canonical_registry WHERE serial_uri = 'core://wal/mp-contract' AND valid_to IS NULL"
            ).fetchone()[0]
            runs_cnt = conn.execute("SELECT COUNT(*) FROM workflow_runs").fetchone()[0]
            ep_cnt = conn.execute("SELECT COUNT(*) FROM replay_buffer").fetchone()[0]
            journal_mode = conn.execute("PRAGMA journal_mode;").fetchone()[0]
            integrity = conn.execute("PRAGMA integrity_check;").fetchone()[0]

        assert versions == list(range(1, 61))
        assert active_cnt == 1
        assert runs_cnt == 60
        assert ep_cnt == 60
        assert str(journal_mode).lower() == "wal"
        assert integrity == "ok"
    finally:
        verify_store.close()
