"""Tests for the canonical +ROI Decision Engine, S1 contract alignment, API handler, and MCP tool."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from aiohttp.test_utils import make_mocked_request
import pytest

from api.v1.handlers import handle_evaluate_roi_decision
from core.decision_roi_engine import (
    ROI_S1_QUESTIONS,
    RoiCandidate,
    arbitrate_competition,
    evaluate_roi_decision,
)
from core.skill_router import SkillContextRouter
from engine.skills_mcp_server import icm_evaluate_roi_decision
from llm.gemini_decisions import normalize_questions


def test_roi_s1_questions_validates_against_normalize_questions() -> None:
    normalized = normalize_questions(ROI_S1_QUESTIONS)
    assert set(normalized.keys()) == {
        "is_redundant_or_clone",
        "is_obsolete_or_incongruent",
        "is_broken_or_malicious",
        "roi_tier",
        "disposition",
    }
    assert normalized["disposition"]["type"] == "choice"
    assert isinstance(normalized["disposition"]["criteria"], dict)
    assert normalized["roi_tier"]["type"] == "score"
    assert len(normalized["roi_tier"]["criteria"]) == 6


@pytest.mark.parametrize(
    ("candidate", "expected_action", "expected_flag"),
    [
        (
            RoiCandidate(id="malicious-pkg", is_malicious=True, capability_score=5.0, active_consumers=3),
            "ELIMINATE",
            "malicious",
        ),
        (
            RoiCandidate(id="broken-unused", is_broken=True, capability_score=1.0, active_consumers=0),
            "ELIMINATE",
            "broken",
        ),
        (
            RoiCandidate(id="broken-critical", is_broken=True, capability_score=4.5, active_consumers=2),
            "IMPROVE",
            "broken",
        ),
        (
            RoiCandidate(id="clone-skill", overlaps_with=["canonical-skill"], active_consumers=1),
            "MERGE",
            "redundancy",
        ),
        (
            RoiCandidate(id="legacy-rule", is_obsolete=True, capability_score=3.0),
            "ARCHIVE",
            "obsolete",
        ),
        (
            RoiCandidate(id="wrong-stack-plugin", is_incongruent=True, capability_score=3.5),
            "ARCHIVE",
            "incongruent",
        ),
        (
            RoiCandidate(
                id="heavy-unused", token_cost=4000, latency_ms=2500.0, active_consumers=0, capability_score=3.0
            ),
            "ARCHIVE",
            "low_roi",
        ),
        (
            RoiCandidate(id="bloated-monolith", token_cost=4000, active_consumers=2, capability_score=4.5),
            "IMPROVE",
            None,
        ),
        (
            RoiCandidate(id="lean-ssot", token_cost=250, latency_ms=15.0, active_consumers=4, capability_score=4.8),
            "KEEP",
            None,
        ),
    ],
)
def test_deterministic_roi_dispositions(
    candidate: RoiCandidate,
    expected_action: str,
    expected_flag: str | None,
) -> None:
    verdict = evaluate_roi_decision(candidate, use_s1=False)
    assert verdict.action == expected_action
    assert verdict.provenance_engine == "deterministic-roi"
    if expected_flag:
        assert expected_flag in verdict.flags


def test_arbitrate_competition_picks_highest_efficiency_winner() -> None:
    winner_cand = RoiCandidate(
        id="chrome-devtools-mcp",
        kind="mcp",
        token_cost=300,
        latency_ms=40.0,
        active_consumers=5,
        capability_score=4.8,
    )
    heavy_clone = RoiCandidate(
        id="chrome-devtools-plugin",
        kind="plugin",
        token_cost=3200,
        latency_ms=650.0,
        active_consumers=0,
        capability_score=4.5,
        overlaps_with=["chrome-devtools-mcp"],
    )
    low_roi_tool = RoiCandidate(
        id="legacy-plugin",
        kind="plugin",
        token_cost=1800,
        latency_ms=800.0,
        active_consumers=0,
        capability_score=2.5,
    )
    broken_tool = RoiCandidate(
        id="broken-plugin",
        kind="plugin",
        is_broken=True,
        capability_score=4.0,
    )

    comp = arbitrate_competition([heavy_clone, winner_cand, low_roi_tool, broken_tool], use_s1=False)
    assert comp.winner_id == "chrome-devtools-mcp"
    assert comp.dispositions["chrome-devtools-mcp"] == "KEEP"
    assert comp.dispositions["chrome-devtools-plugin"] == "MERGE"
    assert comp.dispositions["legacy-plugin"] == "ARCHIVE"
    assert comp.dispositions["broken-plugin"] == "ELIMINATE"


def test_evaluate_roi_with_mocked_decide_s1_shape_and_safety_invariant() -> None:
    mock_result = SimpleNamespace(
        engine="gemini-decision-1",
        provenia=SimpleNamespace(engine_id="gemini-decision-1"),
        answers={
            "is_redundant_or_clone": {"type": "noul", "noul": 0.91, "confidence": 0.85},
            "is_obsolete_or_incongruent": {"type": "noul", "noul": 0.78, "confidence": 0.82},
            "is_broken_or_malicious": {"type": "noul", "noul": 0.05, "confidence": 0.9},
            "roi_tier": {"type": "score", "score": 2.0, "confidence": 0.82},
            "disposition": {"type": "choice", "choice": "ARCHIVE", "confidence": 0.88},
        },
    )

    cand = RoiCandidate(id="ambiguous-skill", kind="skill", token_cost=800, active_consumers=1, capability_score=3.2)
    with patch("llm.gemini_decisions.decide_s1", return_value=mock_result):
        verdict = evaluate_roi_decision(cand, use_s1=True, prefer_cloud=True)

    assert verdict.action == "ARCHIVE"
    assert verdict.provenance_engine == "gemini-decision-1"
    assert "redundancy" in verdict.flags
    assert "obsolete" in verdict.flags
    assert "broken" not in verdict.flags

    # Hard safety invariant: malicious candidate NEVER gets promoted to KEEP by S1.
    keep_mock = SimpleNamespace(
        engine="gemini-decision-1",
        provenia=SimpleNamespace(engine_id="gemini-decision-1"),
        answers={
            "is_redundant_or_clone": {"type": "noul", "noul": 0.05, "confidence": 0.9},
            "is_obsolete_or_incongruent": {"type": "noul", "noul": 0.05, "confidence": 0.9},
            "is_broken_or_malicious": {"type": "noul", "noul": 0.05, "confidence": 0.9},
            "roi_tier": {"type": "score", "score": 5.0, "confidence": 0.95},
            "disposition": {"type": "choice", "choice": "KEEP", "confidence": 0.99},
        },
    )
    evil = RoiCandidate(id="evil-hook", is_malicious=True, capability_score=5.0)
    with patch("llm.gemini_decisions.decide_s1", return_value=keep_mock):
        evil_verdict = evaluate_roi_decision(evil, use_s1=True)
    assert evil_verdict.action == "ELIMINATE"


def test_skill_router_s1_tiebreak_validates_schema_and_selects_domain() -> None:
    captured_questions: list[dict[str, dict[str, object]]] = []

    def _fake_decide_s1(state, questions, **kwargs):
        captured_questions.append(questions)
        normalize_questions(questions)
        options = list(questions["winning_domain"]["criteria"].keys())
        return SimpleNamespace(
            engine="laya-s1-trained",
            answers={"winning_domain": {"type": "choice", "choice": options[1], "confidence": 0.87}},
        )

    router = SkillContextRouter()
    idx = router.load_index(include_overlay=True)
    domains = idx.get("domains", {})
    assert isinstance(domains, dict)
    assert len(domains) >= 2
    d1, d2 = list(domains.keys())[:2]
    fake_scores = {k: (10 if k == d1 else (9 if k == d2 else 0)) for k in domains}

    with (
        patch.object(router, "_score_domains", return_value=fake_scores),
        patch("llm.gemini_decisions.decide_s1", side_effect=_fake_decide_s1),
    ):
        pkt = router.route_and_compile("ambiguous dual-domain task", enable_s1_tiebreak=True)

    assert len(captured_questions) == 1
    assert pkt.domain == d2
    assert f"s1_tiebreak:{d2}" in pkt.reason_codes


@pytest.mark.asyncio
async def test_api_handler_and_mcp_tool_roundtrip() -> None:
    single_payload = {
        "id": "lean-rule",
        "kind": "rule",
        "token_cost": 180,
        "latency_ms": 5.0,
        "active_consumers": 3,
        "capability_score": 4.7,
        "use_s1": False,
    }
    req_single = make_mocked_request("POST", "/api/v1/decisions/roi")
    with patch("api.v1.handlers.read_json_object", new=AsyncMock(return_value=(single_payload, None))):
        resp = await handle_evaluate_roi_decision(req_single)
    assert resp.status == 200
    assert resp.text is not None
    body = json.loads(resp.text)
    assert body["candidate_id"] == "lean-rule"
    assert body["action"] == "KEEP"

    comp_payload = {
        "use_s1": False,
        "candidates": [
            {"id": "winner", "kind": "mcp", "token_cost": 200, "active_consumers": 4, "capability_score": 4.9},
            {"id": "loser", "kind": "plugin", "token_cost": 2800, "active_consumers": 0, "capability_score": 3.0},
        ],
    }
    with patch("api.v1.handlers.read_json_object", new=AsyncMock(return_value=(comp_payload, None))):
        resp_comp = await handle_evaluate_roi_decision(req_single)
    assert resp_comp.status == 200
    assert resp_comp.text is not None
    comp_body = json.loads(resp_comp.text)
    assert comp_body["winner_id"] == "winner"
    assert comp_body["dispositions"]["loser"] == "ARCHIVE"

    cand_only_payload = {k: v for k, v in single_payload.items() if k != "use_s1"}
    mcp_out_single = json.loads(icm_evaluate_roi_decision(json.dumps(cand_only_payload)))
    assert mcp_out_single["action"] == "KEEP"

    mcp_out_list = json.loads(icm_evaluate_roi_decision(json.dumps(comp_payload["candidates"])))
    assert mcp_out_list["winner_id"] == "winner"
