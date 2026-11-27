"""Tests for orthogonalized SPACE SVD projection and cold-start positive guard."""

from __future__ import annotations

import numpy as np
import pytest

from control_plane.spectral import HashProjectionEmbedder, SpaceProjector


@pytest.mark.unit
def test_orthogonalized_anti_anchors_eliminate_shared_domain_false_alarms() -> None:
    embedder = HashProjectionEmbedder(dim=256)
    pos_texts = [
        "database migration parameterized query sqlite schema validation",
        "database migration parameterized query index creation safe",
        "database migration parameterized query rollback test",
        "database migration parameterized query WAL mode check",
    ]
    neg_texts = [
        "database migration unparameterized raw sql string interpolation injection",
    ]

    pos_mat = np.column_stack([embedder.embed(t) for t in pos_texts])
    neg_mat = np.column_stack([embedder.embed(t) for t in neg_texts])

    projector = SpaceProjector(pos_mat, neg_mat, max_rank=8, min_pos_anchors=4)

    # Legitimate candidate sharing domain words ("database migration parameterized query")
    legit_vec = embedder.embed("database migration parameterized query with transaction")
    legit_scores = projector.score(legit_vec)

    # Violating candidate hitting anti-goal direction ("unparameterized raw sql string interpolation injection")
    viol_vec = embedder.embed("database migration unparameterized raw sql string interpolation injection")
    viol_scores = projector.score(viol_vec)

    assert legit_scores.cold_start_pos_guard is False
    assert legit_scores.s_id > 0.55
    assert legit_scores.s_viol < 0.25
    assert viol_scores.s_viol > legit_scores.s_viol + 0.25

    # Verify U_pos and U_neg subspaces are strictly orthogonal
    if projector.u_pos.shape[1] > 0 and projector.u_neg.shape[1] > 0:
        cross = projector.u_pos.T @ projector.u_neg
        assert float(np.max(np.abs(cross))) < 1e-6


@pytest.mark.unit
def test_space_cold_start_positive_guard_when_few_pos_anchors() -> None:
    embedder = HashProjectionEmbedder(dim=128)
    pos_mat = np.column_stack([embedder.embed("only one positive anchor")])
    neg_mat = np.column_stack([embedder.embed("hardcoded api secret token")])

    projector = SpaceProjector(pos_mat, neg_mat, max_rank=8, min_pos_anchors=4)
    scores = projector.score(embedder.embed("unrelated clean utility module"))

    assert scores.cold_start_pos_guard is True
    assert scores.drift_score == scores.s_viol
