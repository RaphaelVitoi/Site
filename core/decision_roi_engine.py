"""core/decision_roi_engine.py -- Canonical Fallback & Additive ROI Decision Engine.

Integrates deterministic safety/hygiene rules with System-1 Laya (local :8192)
and Gemini Decisions API (`gemini-decision-1`) to evaluate redundancy, clones,
obsolescence, contextual incongruence, broken/malicious elements, and +ROI
arbitration across competing tools, rules, skills, plugins, and MCP servers.
"""

from __future__ import annotations

from collections.abc import Mapping
import logging
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger(__name__)

RoiAction = Literal["KEEP", "IMPROVE", "MERGE", "ARCHIVE", "ELIMINATE"]
CandidateKind = Literal["rule", "skill", "plugin", "mcp", "tool", "artifact"]

_VALID_ACTIONS: frozenset[str] = frozenset({"KEEP", "IMPROVE", "MERGE", "ARCHIVE", "ELIMINATE"})
_PROVENANCE_DETERMINISTIC = "deterministic-roi"

ROI_S1_QUESTIONS: dict[str, dict[str, object]] = {
    "is_redundant_or_clone": {
        "type": "noul",
        "instructions": "Is this artifact a duplicate, clone, or redundant copy of an existing canonical capability?",
        "criteria": {
            "true": "Duplicates or clones an existing canonical tool, skill, rule, or MCP server.",
            "false": "Provides a distinct non-overlapping capability.",
        },
    },
    "is_obsolete_or_incongruent": {
        "type": "noul",
        "instructions": "Is this artifact obsolete, unused, or incongruent with the active ecosystem context?",
        "criteria": {
            "true": "Legacy/deprecated, zero active consumers, or mismatched with current stack.",
            "false": "Actively aligned with current runtime and governance needs.",
        },
    },
    "is_broken_or_malicious": {
        "type": "noul",
        "instructions": "Does the evidence indicate a broken, unrecoverable, buggy, or malicious/unsafe element?",
        "criteria": {
            "true": "Broken without worthwhile recovery, buggy, or security/policy hazard.",
            "false": "Healthy and safe to keep or optimize.",
        },
    },
    "roi_tier": {
        "type": "score",
        "instructions": "Rate net operational ROI from 0 (harmful/negative) to 5 (high-leverage essential).",
        "criteria": [
            "0: malicious or harmful",
            "1: negative ROI bloat",
            "2: low ROI candidate for archive",
            "3: moderate ROI needs optimization",
            "4: strong +ROI active asset",
            "5: critical high-leverage canonical asset",
        ],
    },
    "disposition": {
        "type": "choice",
        "instructions": "Select the canonical curation action optimizing capability per token and latency cost.",
        "criteria": {
            "KEEP": "High +ROI canonical asset within resource budget; retain active.",
            "IMPROVE": "Useful active capability with fixable bug or excess token/latency overhead.",
            "MERGE": "Redundant overlap/clone; consolidate into higher +ROI canonical winner.",
            "ARCHIVE": "Obsolete, incongruent, or low-ROI element; move out of active prompt budget.",
            "ELIMINATE": "Broken/unrecoverable, malicious, or pure zero-potential entropy; purge.",
        },
    },
}


class RoiCandidate(BaseModel):
    """Candidate artifact or tool evaluated under the +ROI Decision Framework."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    kind: CandidateKind = "artifact"
    description: str = ""
    token_cost: int = Field(default=0, ge=0)
    latency_ms: float = Field(default=0.0, ge=0.0)
    active_consumers: int = Field(default=0, ge=0)
    capability_score: float = Field(default=3.0, ge=0.0, le=5.0)
    is_broken: bool = False
    is_malicious: bool = False
    is_obsolete: bool = False
    is_incongruent: bool = False
    overlaps_with: list[str] = Field(default_factory=list)
    evidence: str = ""


class RoiVerdict(BaseModel):
    """Auditable verdict returned by the ROI Decision Engine."""

    model_config = ConfigDict(extra="forbid")

    candidate_id: str
    action: RoiAction
    roi_score: float = Field(ge=0.0, le=5.0)
    efficiency_ratio: float = Field(ge=0.0)
    flags: list[str] = Field(default_factory=list)
    rationale: str
    provenance_engine: str
    confidence: float = Field(ge=0.0, le=1.0)


class CompetitionVerdict(BaseModel):
    """Winner and dispositions across competing candidates (+ROI arbitration)."""

    model_config = ConfigDict(extra="forbid")

    winner_id: str | None
    ranking: list[RoiVerdict]
    dispositions: dict[str, RoiAction]


def _compute_efficiency_ratio(candidate: RoiCandidate) -> float:
    if candidate.is_broken or candidate.is_malicious:
        return 0.0
    resource_cost = 1.0 + (candidate.token_cost / 500.0) + (candidate.latency_ms / 1000.0)
    return round(candidate.capability_score / max(0.5, resource_cost), 4)


def _collect_flags(candidate: RoiCandidate) -> list[str]:
    flags: list[str] = []
    if candidate.overlaps_with:
        flags.append("redundancy")
    if candidate.is_obsolete:
        flags.append("obsolete")
    if candidate.is_incongruent:
        flags.append("incongruent")
    if candidate.is_broken:
        flags.append("broken")
    if candidate.is_malicious:
        flags.append("malicious")
    if candidate.active_consumers == 0 and candidate.token_cost >= 1000:
        flags.append("low_roi")
    return flags


def _compute_baseline_score(candidate: RoiCandidate) -> float:
    score = float(candidate.capability_score)
    if candidate.active_consumers > 0:
        score += min(0.6, candidate.active_consumers * 0.2)
    else:
        score -= 0.7
    if candidate.token_cost > 2000:
        score -= min(1.5, (candidate.token_cost - 2000) / 3000.0)
    if candidate.latency_ms > 1500.0:
        score -= min(1.0, (candidate.latency_ms - 1500.0) / 4000.0)
    if candidate.overlaps_with:
        score -= 1.0
    if candidate.is_obsolete:
        score -= 1.5
    if candidate.is_incongruent:
        score -= 1.2
    if candidate.is_broken:
        score = min(score, 1.0)
    if candidate.is_malicious:
        score = 0.0
    return round(max(0.0, min(5.0, score)), 2)


def _baseline_action(candidate: RoiCandidate, roi_score: float) -> tuple[RoiAction, str]:
    if candidate.is_malicious:
        return "ELIMINATE", "Malicious/unsafe artifact flagged for immediate elimination."
    if candidate.is_broken:
        if candidate.active_consumers > 0 and candidate.capability_score >= 3.5:
            return "IMPROVE", "Broken high-value component with active consumers; repair prioritized."
        return "ELIMINATE", "Broken/unrecoverable low-value element flagged for elimination."
    if candidate.overlaps_with:
        return "MERGE", f"Redundant overlap with canonical target(s): {', '.join(candidate.overlaps_with)}."
    if candidate.is_obsolete or candidate.is_incongruent:
        return "ARCHIVE", "Obsolete or contextually incongruent element; archive to preserve rollback."
    if roi_score <= 2.2:
        return "ARCHIVE", "Negative or low ROI relative to token/latency footprint."
    if candidate.token_cost > 2400 and candidate.active_consumers > 0:
        return "IMPROVE", "High token footprint on active artifact; compress via SSOT/ICM pointers."
    return "KEEP", "Healthy +ROI ratio within active resource budget."


def _deterministic_roi_verdict(candidate: RoiCandidate) -> RoiVerdict:
    eff = _compute_efficiency_ratio(candidate)
    flags = _collect_flags(candidate)
    score = _compute_baseline_score(candidate)
    action, rationale = _baseline_action(candidate, score)
    return RoiVerdict(
        candidate_id=candidate.id,
        action=action,
        roi_score=score,
        efficiency_ratio=eff,
        flags=flags,
        rationale=rationale,
        provenance_engine=_PROVENANCE_DETERMINISTIC,
        confidence=0.92 if (candidate.is_malicious or candidate.is_broken or candidate.overlaps_with) else 0.78,
    )


def _format_candidate_state(candidate: RoiCandidate) -> str:
    return (
        f"Candidate ID: {candidate.id}\n"
        f"Kind: {candidate.kind}\n"
        f"Description: {candidate.description or '(none)'}\n"
        f"TokenCost: {candidate.token_cost} | LatencyMs: {candidate.latency_ms} | "
        f"ActiveConsumers: {candidate.active_consumers} | Capability: {candidate.capability_score}\n"
        f"Flags: broken={candidate.is_broken}, malicious={candidate.is_malicious}, "
        f"obsolete={candidate.is_obsolete}, incongruent={candidate.is_incongruent}, "
        f"overlaps={candidate.overlaps_with}\n"
        f"Evidence: {candidate.evidence or '(none)'}"
    )


def _parse_s1_verdict(
    candidate: RoiCandidate,
    baseline: RoiVerdict,
    answers: Mapping[str, object],
    provenance_engine: str,
) -> RoiVerdict:
    # Hard safety invariant: malicious/broken elements cannot be promoted to KEEP by S1.
    if candidate.is_malicious:
        return baseline

    flags = list(baseline.flags)
    if _extract_noul_yes(answers.get("is_redundant_or_clone")) and "redundancy" not in flags:
        flags.append("redundancy")
    if _extract_noul_yes(answers.get("is_obsolete_or_incongruent")) and "obsolete" not in flags:
        flags.append("obsolete")
    if _extract_noul_yes(answers.get("is_broken_or_malicious")) and "broken" not in flags:
        flags.append("broken")

    s1_action, s1_conf = _extract_choice_action(answers.get("disposition"))
    s1_score = _extract_score_value(answers.get("roi_tier"), baseline.roi_score)

    chosen_action: RoiAction = baseline.action
    if s1_action is not None and not candidate.is_broken and s1_conf >= 0.55:
        chosen_action = s1_action

    blended_score = round((baseline.roi_score + s1_score) / 2.0, 2)
    return RoiVerdict(
        candidate_id=candidate.id,
        action=chosen_action,
        roi_score=blended_score,
        efficiency_ratio=baseline.efficiency_ratio,
        flags=flags,
        rationale=f"{baseline.rationale} [S1={provenance_engine}, conf={s1_conf:.2f}]",
        provenance_engine=provenance_engine,
        confidence=round(max(baseline.confidence, s1_conf), 3),
    )


def _extract_confidence(entry: Mapping[str, object], default: float = 0.0) -> float:
    for key in ("confidence", "answer_confidence"):
        raw = entry.get(key)
        if isinstance(raw, int | float) and not isinstance(raw, bool):
            return max(0.0, min(1.0, float(raw)))
    return default


def _extract_noul_yes(entry: object) -> bool:
    if not isinstance(entry, Mapping):
        return False
    noul_prob = entry.get("noul")
    if isinstance(noul_prob, int | float) and not isinstance(noul_prob, bool):
        conf = _extract_confidence(entry, default=1.0)
        return float(noul_prob) >= 0.55 and conf >= 0.55
    val = str(entry.get("value", entry.get("answer", ""))).strip().lower()
    conf = _extract_confidence(entry, default=0.0)
    return val in {"yes", "true", "sim", "1"} and conf >= 0.55


def _extract_choice_action(entry: object) -> tuple[RoiAction | None, float]:
    if not isinstance(entry, Mapping):
        return None, 0.0
    raw_choice = entry.get("choice")
    if raw_choice is None:
        raw_choice = entry.get("value", entry.get("answer", ""))
    val = str(raw_choice).strip().upper()
    conf = _extract_confidence(entry, default=0.75 if val in _VALID_ACTIONS else 0.0)
    if val in _VALID_ACTIONS:
        return val, conf  # type: ignore[return-value]
    return None, conf


def _extract_score_value(entry: object, default: float) -> float:
    if not isinstance(entry, Mapping):
        return default
    raw = entry.get("score")
    if raw is None:
        raw = entry.get("value")
    if isinstance(raw, int | float) and not isinstance(raw, bool):
        return max(0.0, min(5.0, float(raw)))
    return default


def evaluate_roi_decision(
    candidate: RoiCandidate,
    *,
    use_s1: bool = False,
    prefer_cloud: bool = False,
) -> RoiVerdict:
    """Evaluate a single candidate under deterministic +ROI rules and optional S1 cascade."""
    baseline = _deterministic_roi_verdict(candidate)
    if not use_s1:
        return baseline

    try:
        from llm.gemini_decisions import decide_s1  # noqa: PLC0415

        s1_res = decide_s1(
            _format_candidate_state(candidate),
            ROI_S1_QUESTIONS,
            prefer_cloud=prefer_cloud,
            allow_laya_failover=True,
        )
        answers = getattr(s1_res, "answers", None)
        prov = getattr(s1_res, "provenia", None)
        engine = str(
            getattr(s1_res, "engine", "") or getattr(prov, "engine_id", "") or getattr(prov, "engine", "") or "laya-s1"
        )
        if isinstance(answers, Mapping) and answers:
            return _parse_s1_verdict(candidate, baseline, answers, engine)
    except Exception as exc:  # noqa: BLE001
        logger.debug("[decision-roi] S1 cascade indisponivel (%s); mantendo baseline.", exc)
    return baseline


def _competition_loser_action(cand: RoiCandidate) -> RoiAction:
    if cand.is_malicious or cand.is_broken:
        return "ELIMINATE"
    if cand.overlaps_with or cand.capability_score >= 3.5:
        return "MERGE"
    return "ARCHIVE"


def _build_competition_verdict(
    idx: int,
    verdict: RoiVerdict,
    cand: RoiCandidate,
    winner_id: str | None,
) -> RoiVerdict:
    flags = list(verdict.flags)
    if idx == 0 and winner_id is not None:
        return RoiVerdict(
            candidate_id=verdict.candidate_id,
            action="KEEP",
            roi_score=verdict.roi_score,
            efficiency_ratio=verdict.efficiency_ratio,
            flags=flags,
            rationale=f"Selected +ROI competition winner (eff={verdict.efficiency_ratio}). {verdict.rationale}",
            provenance_engine=verdict.provenance_engine,
            confidence=verdict.confidence,
        )

    if winner_id is not None and "competitor_loser" not in flags:
        flags.append("competitor_loser")
    return RoiVerdict(
        candidate_id=verdict.candidate_id,
        action=_competition_loser_action(cand),
        roi_score=verdict.roi_score,
        efficiency_ratio=verdict.efficiency_ratio,
        flags=flags,
        rationale=f"Superseded by +ROI winner '{winner_id}'. {verdict.rationale}",
        provenance_engine=verdict.provenance_engine,
        confidence=verdict.confidence,
    )


def arbitrate_competition(
    candidates: list[RoiCandidate],
    *,
    use_s1: bool = False,
    prefer_cloud: bool = False,
) -> CompetitionVerdict:
    """Select the single +ROI winner among competing candidates (max capability / min cost)."""
    if not candidates:
        return CompetitionVerdict(winner_id=None, ranking=[], dispositions={})

    verdicts = [evaluate_roi_decision(c, use_s1=use_s1, prefer_cloud=prefer_cloud) for c in candidates]
    by_id = {c.id: c for c in candidates}

    def _rank_key(v: RoiVerdict) -> tuple[int, float, float, str]:
        cand = by_id[v.candidate_id]
        eligible = 0 if (cand.is_malicious or cand.is_broken or cand.is_obsolete) else 1
        return (eligible, v.efficiency_ratio, v.roi_score, v.candidate_id)

    ordered = sorted(verdicts, key=_rank_key, reverse=True)
    winner_cand = by_id[ordered[0].candidate_id]
    winner_valid = not (winner_cand.is_malicious or winner_cand.is_broken or winner_cand.is_obsolete)
    winner_id = ordered[0].candidate_id if winner_valid else None

    final_ranking = [
        _build_competition_verdict(idx, v, by_id[v.candidate_id], winner_id) for idx, v in enumerate(ordered)
    ]
    dispositions: dict[str, RoiAction] = {v.candidate_id: v.action for v in final_ranking}
    return CompetitionVerdict(winner_id=winner_id, ranking=final_ranking, dispositions=dispositions)
