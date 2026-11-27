"""Tests for bi-temporal canonical registry, anti-LFI, SHA-256 integrity, and pre-filtered search."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
import sqlite3

import numpy as np
import pytest

from control_plane.config import ArtifactKind, ControlPlaneConfig
from control_plane.spectral import HashProjectionEmbedder
from control_plane.storage import (
    ControlPlaneStore,
    HashMismatchError,
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
