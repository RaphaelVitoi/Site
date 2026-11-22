"""core/skill_router.py -- Domain-Scoped ICM Skill & OpenMonoAgent Cookbook Router.

Implements Interpretable Context Methodology (ICM) progressive disclosure with
OpenMonoAgent-style typed YAML playbooks so agents receive ONLY task-relevant
domain context within a strict token budget (Shannon Economy).
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
import json
import logging
import os
from pathlib import Path
import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
import yaml

from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

_SITE_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_OVERLAY_PATH = Path.home() / ".gemini" / "config" / "icm_skills_overlay.json"

_OPT_OUT_MODES = frozenset({"off", "disabled", "none"})
_MAX_SKILLS_HARD_CAP = 3
_AFFINITY_TIE_BREAKER = 2
_CHARS_PER_TOKEN = 4
_MIN_TRIM_BODY_CHARS = 120

SKILL_DOMAIN_KEY = "skill_domain"
SKILL_SELECTED_KEY = "skill_context_selected"
SKILL_COOKBOOKS_KEY = "skill_cookbooks_selected"
SKILL_TOKENS_KEY = "skill_tokens_estimated"
SKILL_SAVINGS_KEY = "skill_tokens_saved_pct"


class CookbookParameter(BaseModel):
    """Typed parameter declared by an OpenMonoAgent-style cookbook."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    type: Literal["string", "integer", "boolean", "path", "enum"]
    required: bool
    default: str | int | bool | float | None
    description: str = Field(min_length=1)


class CookbookGate(BaseModel):
    """Pre-execution gate verified before running cookbook steps."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    check: str = Field(min_length=1)
    on_fail: Literal["abort", "escalate", "warn"]


class CookbookStep(BaseModel):
    """Deterministic workflow stage with checkpoint and failure policy."""

    model_config = ConfigDict(extra="forbid")

    stage_id: str = Field(min_length=1)
    role: Literal["explore", "plan", "execute", "verify"]
    action: str = Field(min_length=1)
    command_or_tool: str = Field(min_length=1)
    expected_output: str = Field(min_length=1)
    checkpoint: bool
    on_fail: Literal["abort", "retry", "rollback", "escalate"]


class CookbookSpec(BaseModel):
    """Validated specification matching skills_library/cookbooks/cookbook.schema.json."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=3)
    version: str = Field(pattern=r"^\d+\.\d+\.\d+$")
    domain: Literal[
        "pmev-and-quant",
        "engineering-and-quality",
        "runtime-and-credentials",
        "browser-and-ui-design",
        "data-and-knowledge",
        "cloud-and-devin-ops",
        "governance-and-handoff",
    ]
    summary: str = Field(min_length=10)
    token_budget: int = Field(ge=200, le=4000)
    skills: list[str] = Field(min_length=1)
    triggers: dict[str, list[str]]
    parameters: list[CookbookParameter]
    pre_gates: list[CookbookGate] = Field(min_length=1)
    steps: list[CookbookStep] = Field(min_length=1)
    exit_criteria: list[str] = Field(min_length=1)


@dataclass(frozen=True)
class SkillContextPacket:
    """Compiled domain-scoped skill & cookbook context packet for a single task."""

    domain: str | None
    secondary_domains: tuple[str, ...]
    selected_skills: tuple[str, ...]
    selected_cookbooks: tuple[str, ...]
    scores: Mapping[str, int]
    reason_codes: tuple[str, ...]
    token_budget: int
    estimated_tokens: int
    full_library_tokens: int
    savings_pct: float
    context_markdown: str

    def to_metadata(self) -> dict[str, str | int | float | list[str] | None]:
        """Return compact routing telemetry suitable for Task.metadata persistence."""
        return {
            SKILL_DOMAIN_KEY: self.domain,
            SKILL_SELECTED_KEY: list(self.selected_skills),
            SKILL_COOKBOOKS_KEY: list(self.selected_cookbooks),
            SKILL_TOKENS_KEY: self.estimated_tokens,
            SKILL_SAVINGS_KEY: self.savings_pct,
        }

    def to_dict(self, *, include_content: bool = False) -> dict[str, object]:
        """Serialize decision for API/CLI responses."""
        payload: dict[str, object] = {
            "domain": self.domain,
            "secondary_domains": list(self.secondary_domains),
            "selected_skills": list(self.selected_skills),
            "selected_cookbooks": list(self.selected_cookbooks),
            "scores": dict(self.scores),
            "reason_codes": list(self.reason_codes),
            "token_budget": self.token_budget,
            "estimated_tokens": self.estimated_tokens,
            "full_library_tokens": self.full_library_tokens,
            "savings_pct": self.savings_pct,
        }
        if include_content:
            payload["context_markdown"] = self.context_markdown
        return payload


def _as_int(value: object, default: int) -> int:
    if isinstance(value, bool):
        return default
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return default
    return default


def _estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, (len(text) + _CHARS_PER_TOKEN - 1) // _CHARS_PER_TOKEN)


def _normalise_text(raw: str) -> str:
    return enforce_pure_ascii(raw).lower()


def _contains_term(text: str, term: str) -> bool:
    clean = term.strip().lower()
    if not clean:
        return False
    pattern = r"(?<![a-z0-9_])" + re.escape(clean) + r"(?![a-z0-9_])"
    return bool(re.search(pattern, text, re.IGNORECASE))


def _score_weighted_terms(text: str, terms: Mapping[str, object]) -> int:
    score = 0
    for raw_term, raw_weight in terms.items():
        term = raw_term.strip()
        if not term:
            continue
        weight = int(raw_weight) if isinstance(raw_weight, int | float) else 0
        if weight > 0 and _contains_term(text, term):
            score += weight
    return score


def _strip_skill_frontmatter(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    if lines and lines[0].strip() == "---":
        for idx, line in enumerate(lines[1:], start=1):
            if line.strip() == "---":
                return "\n".join(lines[idx + 1 :]).strip()
    return markdown_text.strip()


def _trim_to_char_budget(text: str, max_chars: int) -> str:
    if max_chars <= 0:
        return ""
    if len(text) <= max_chars:
        return text
    if max_chars <= _MIN_TRIM_BODY_CHARS:
        return text[:max_chars].rstrip()
    sliced = text[: max_chars - 32]
    cut = sliced.rfind("\n## ")
    if cut < _MIN_TRIM_BODY_CHARS:
        cut = sliced.rfind("\n")
    if cut >= _MIN_TRIM_BODY_CHARS:
        sliced = sliced[:cut]
    return sliced.rstrip() + "\n\n... [trimmed to token budget]"


def _format_cookbook_digest(spec: CookbookSpec) -> str:
    lines: list[str] = [
        f"### Cookbook: `{spec.id}` ({spec.name} v{spec.version})",
        f"- Summary: {spec.summary}",
    ]
    if spec.parameters:
        params = ", ".join(f"`{p.name}:{p.type}={p.default}`" for p in spec.parameters)
        lines.append(f"- Parameters: {params}")
    gates = "; ".join(f"`{g.id}` ({g.on_fail}): `{g.check}`" for g in spec.pre_gates)
    lines.append(f"- Pre-gates: {gates}")
    lines.append("- Steps:")
    for idx, step in enumerate(spec.steps, start=1):
        ckpt = " [CHECKPOINT]" if step.checkpoint else ""
        lines.append(
            f"  {idx}. [{step.role}]{ckpt} {step.action} | tool: `{step.command_or_tool}` | on_fail: {step.on_fail}"
        )
    lines.append("- Exit criteria: " + " ; ".join(spec.exit_criteria))
    return "\n".join(lines)


def _resolve_overlay_path(overlay_path: Path | None) -> Path:
    if overlay_path is not None:
        return overlay_path
    env_overlay = os.environ.get("ICM_SKILLS_OVERLAY", "").strip()
    if env_overlay:
        return Path(env_overlay)
    return _DEFAULT_OVERLAY_PATH


def _merge_overlay_domains(domains: dict[str, object], ov_domains: object) -> None:
    if not isinstance(ov_domains, dict):
        return
    for dom_id, dom_meta in ov_domains.items():
        if dom_id not in domains and isinstance(dom_meta, dict):
            domains[str(dom_id)] = dom_meta


def _merge_overlay_skills(skills: dict[str, object], ov_skills: object) -> tuple[int, int]:
    if not isinstance(ov_skills, dict):
        return 0, 0
    added_skills = 0
    added_tokens = 0
    for skill_id, s_meta in ov_skills.items():
        if skill_id in skills or not isinstance(s_meta, dict):
            continue
        skills[str(skill_id)] = s_meta
        added_skills += 1
        added_tokens += _as_int(s_meta.get("token_estimate"), 400)
    return added_skills, added_tokens


def _extract_metadata_skills(metadata: Mapping[str, object] | None, skills_map: Mapping[str, object]) -> list[str]:
    if not metadata:
        return []
    raw_req = metadata.get("skills")
    if isinstance(raw_req, str):
        cand = raw_req.strip()
        return [cand] if cand in skills_map else []
    if not isinstance(raw_req, list | tuple | set):
        return []
    out: list[str] = []
    for item in raw_req:
        cand = str(item).strip()
        if cand in skills_map and cand not in out:
            out.append(cand)
    return out


def _matches_skill_alias(text: str, meta: object, skill_id: str) -> bool:
    if not isinstance(meta, dict):
        return False
    aliases = meta.get("explicit_aliases", (skill_id,))
    return isinstance(aliases, list | tuple) and any(_contains_term(text, str(a)) for a in aliases)


def _score_domain_skill(
    raw_meta: object,
    domain_id: str,
    text: str,
    skill_id: str,
    agent_skills: frozenset[str],
) -> int | None:
    if not isinstance(raw_meta, dict) or raw_meta.get("domain") != domain_id:
        return None
    kw = raw_meta.get("keywords", {})
    score = _score_weighted_terms(text, kw if isinstance(kw, Mapping) else {})
    if skill_id in agent_skills and score > 0:
        score += _AFFINITY_TIE_BREAKER
    return score


def _score_cookbook_candidate(
    raw_cb: object,
    domain_id: str | None,
    selected_set: set[str],
    text: str,
) -> int:
    if not isinstance(raw_cb, dict):
        return 0
    cb_dom = str(raw_cb.get("domain", ""))
    raw_cb_skills = raw_cb.get("skills")
    cb_skills = {str(s) for s in raw_cb_skills} if isinstance(raw_cb_skills, list) else set()
    overlap = len(cb_skills & selected_set)
    if cb_dom != domain_id and overlap == 0:
        return 0
    kw = raw_cb.get("keywords", ())
    kw_score = sum(2 for term in kw if _contains_term(text, str(term))) if isinstance(kw, list) else 0
    return overlap * 4 + kw_score + (1 if cb_dom == domain_id else 0)


def _resolve_default_cookbook(
    domain_id: str | None,
    domains_map: Mapping[str, object],
    cookbooks_map: Mapping[str, object],
) -> str | None:
    if not domain_id or domain_id not in domains_map:
        return None
    dom_meta = domains_map[domain_id]
    if not isinstance(dom_meta, dict):
        return None
    default_cb = dom_meta.get("default_cookbook")
    if isinstance(default_cb, str) and default_cb in cookbooks_map:
        return default_cb
    return None


def _empty_packet(
    token_budget: int,
    full_tokens: int,
    scores: Mapping[str, int],
    reason_code: str,
) -> SkillContextPacket:
    return SkillContextPacket(
        domain=None,
        secondary_domains=(),
        selected_skills=(),
        selected_cookbooks=(),
        scores=dict(scores),
        reason_codes=(reason_code,),
        token_budget=token_budget,
        estimated_tokens=0,
        full_library_tokens=full_tokens,
        savings_pct=100.0,
        context_markdown="",
    )


class SkillContextRouter:
    """Domain-scoped ICM skill and OpenMonoAgent cookbook router."""

    def __init__(
        self,
        site_root: Path | None = None,
        index_path: Path | None = None,
        overlay_path: Path | None = None,
    ) -> None:
        self._site_root = (site_root or _SITE_ROOT).resolve()
        self._index_path = (index_path or (self._site_root / "skills_library" / "index.json")).resolve()
        self._overlay_path = _resolve_overlay_path(overlay_path)
        self._manifest_path = (self._site_root / "data" / "agents_manifest.json").resolve()
        self._cached_index: dict[str, object] | None = None
        self._cached_index_mtime: float = -1.0
        self._cached_overlay: dict[str, object] | None = None
        self._cached_overlay_mtime: float = -1.0
        self._cached_agent_skills: dict[str, frozenset[str]] | None = None
        self._cached_manifest_mtime: float = -1.0

    def _load_raw_overlay(self) -> dict[str, object] | None:
        if not self._overlay_path.is_file():
            return None
        mtime = self._overlay_path.stat().st_mtime
        if self._cached_overlay is not None and mtime == self._cached_overlay_mtime:
            return self._cached_overlay
        try:
            parsed = json.loads(self._overlay_path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Overlay ICM invalido em %s: %s", self._overlay_path, exc)
            return None
        if not isinstance(parsed, dict):
            return None
        self._cached_overlay = parsed
        self._cached_overlay_mtime = mtime
        return parsed

    @staticmethod
    def _merge_overlay(base: dict[str, object], overlay: dict[str, object]) -> dict[str, object]:
        base_domains = base.get("domains")
        base_skills = base.get("skills")
        base_stats = base.get("stats")
        domains = dict(base_domains) if isinstance(base_domains, dict) else {}
        skills = dict(base_skills) if isinstance(base_skills, dict) else {}
        stats = dict(base_stats) if isinstance(base_stats, dict) else {}

        _merge_overlay_domains(domains, overlay.get("domains"))
        added_skills, added_tokens = _merge_overlay_skills(skills, overlay.get("skills"))

        stats["overlay_skill_count"] = added_skills
        stats["full_library_tokens"] = _as_int(stats.get("full_library_tokens"), 15000) + added_tokens

        merged = dict(base)
        merged["domains"] = domains
        merged["skills"] = skills
        merged["stats"] = stats
        return merged

    def load_index(self, *, include_overlay: bool = True) -> dict[str, object]:
        """Load curated skills_library/index.json with mtime invalidation and optional overlay."""
        mtime = self._index_path.stat().st_mtime
        if self._cached_index is None or mtime != self._cached_index_mtime:
            parsed = json.loads(self._index_path.read_text(encoding="utf-8"))
            if not isinstance(parsed, dict):
                raise ValueError(f"Invalid skills_library index structure: {self._index_path}")
            self._cached_index = parsed
            self._cached_index_mtime = mtime

        if not include_overlay:
            return self._cached_index

        overlay = self._load_raw_overlay()
        if overlay is None:
            return self._cached_index
        return self._merge_overlay(self._cached_index, overlay)

    def _load_agent_affinities(self) -> dict[str, frozenset[str]]:
        if not self._manifest_path.is_file():
            return {}
        mtime = self._manifest_path.stat().st_mtime
        if self._cached_agent_skills is not None and mtime == self._cached_manifest_mtime:
            return self._cached_agent_skills
        raw = json.loads(self._manifest_path.read_text(encoding="utf-8"))
        affinities: dict[str, frozenset[str]] = {}
        if isinstance(raw, dict):
            for agent_id, data in raw.items():
                if isinstance(data, dict):
                    skills = data.get("skills", ())
                    if isinstance(skills, list):
                        affinities[str(agent_id).lower()] = frozenset(str(s) for s in skills)
        self._cached_agent_skills = affinities
        self._cached_manifest_mtime = mtime
        return affinities

    def _extract_explicit_skills(
        self,
        text: str,
        metadata: Mapping[str, object] | None,
        skills_map: Mapping[str, object],
    ) -> list[str]:
        explicit = _extract_metadata_skills(metadata, skills_map)
        for skill_id, meta in skills_map.items():
            if skill_id not in explicit and _matches_skill_alias(text, meta, skill_id):
                explicit.append(skill_id)
        return explicit

    def _score_domains(
        self,
        text: str,
        domains_map: Mapping[str, object],
        agent_skills: frozenset[str],
        skills_map: Mapping[str, object],
    ) -> dict[str, int]:
        agent_domains = {
            str(s_meta.get("domain"))
            for s_id in agent_skills
            for s_meta in (skills_map.get(s_id),)
            if isinstance(s_meta, dict) and s_meta.get("domain")
        }
        scores: dict[str, int] = {}
        for dom_id, dom_raw in domains_map.items():
            if not isinstance(dom_raw, dict):
                continue
            kw = dom_raw.get("keywords", {})
            anti = dom_raw.get("anti_keywords", {})
            pos = _score_weighted_terms(text, kw if isinstance(kw, Mapping) else {})
            neg = _score_weighted_terms(text, anti if isinstance(anti, Mapping) else {})
            net = pos - neg
            if pos > 0 and dom_id in agent_domains:
                net += _AFFINITY_TIE_BREAKER
            if net > 0:
                scores[dom_id] = net
        return scores

    def _select_domain_skills(
        self,
        domain_id: str,
        text: str,
        skills_map: Mapping[str, object],
        agent_skills: frozenset[str],
        explicit_skills: list[str],
        limit: int,
    ) -> tuple[str, ...]:
        selected: list[str] = list(explicit_skills[:limit])
        ranked: list[tuple[int, str]] = []
        for skill_id, raw_meta in skills_map.items():
            if skill_id in selected:
                continue
            score = _score_domain_skill(raw_meta, domain_id, text, skill_id, agent_skills)
            if score is not None:
                ranked.append((score, skill_id))

        ranked.sort(key=lambda pair: (-pair[0], pair[1]))
        for score, skill_id in ranked:
            if len(selected) >= limit:
                break
            if score > 0 or not selected:
                selected.append(skill_id)
        return tuple(selected)

    def _select_cookbook(
        self,
        domain_id: str | None,
        selected_skills: tuple[str, ...],
        text: str,
        domains_map: Mapping[str, object],
        cookbooks_map: Mapping[str, object],
    ) -> tuple[str, ...]:
        best_id: str | None = None
        best_score = 0
        selected_set = set(selected_skills)
        for cb_id, raw_cb in cookbooks_map.items():
            total = _score_cookbook_candidate(raw_cb, domain_id, selected_set, text)
            if total > best_score:
                best_score = total
                best_id = cb_id

        if best_id is None:
            best_id = _resolve_default_cookbook(domain_id, domains_map, cookbooks_map)

        return (best_id,) if best_id else ()

    def read_cookbook_spec(self, rel_path: str) -> CookbookSpec | None:
        """Load and validate a YAML cookbook by relative or absolute path."""
        full_path = self._resolve_path(rel_path)
        if not full_path.is_file():
            return None
        raw = yaml.safe_load(full_path.read_text(encoding="utf-8"))
        return CookbookSpec.model_validate(raw)

    def _read_cookbook_spec(self, rel_path: str) -> CookbookSpec | None:
        return self.read_cookbook_spec(rel_path)

    def _resolve_path(self, raw_path: str) -> Path:
        p = Path(raw_path)
        return p if p.is_absolute() else (self._site_root / p)

    def _render_domain_context(
        self,
        domain_id: str | None,
        domains_map: Mapping[str, object],
        remaining_chars: int,
    ) -> str | None:
        if not domain_id or remaining_chars <= 160:
            return None
        dom_meta = domains_map.get(domain_id)
        if not isinstance(dom_meta, dict):
            return None
        ctx_rel = str(dom_meta.get("context_path", "") or "").strip()
        if not ctx_rel:
            return None
        ctx_file = self._resolve_path(ctx_rel)
        if not ctx_file.is_file():
            return None
        return _trim_to_char_budget(ctx_file.read_text(encoding="utf-8").strip(), remaining_chars)

    def _render_cookbook_digests(
        self,
        selected_cookbooks: tuple[str, ...],
        cookbooks_map: Mapping[str, object],
        max_chars: int,
        used_chars: int,
    ) -> tuple[list[str], int]:
        rendered: list[str] = []
        for cb_id in selected_cookbooks:
            if used_chars + 160 >= max_chars:
                break
            cb_meta = cookbooks_map.get(cb_id)
            if not isinstance(cb_meta, dict):
                continue
            spec = self._read_cookbook_spec(str(cb_meta.get("path", "")))
            if spec is None:
                continue
            digest = _trim_to_char_budget(_format_cookbook_digest(spec), max_chars - used_chars)
            rendered.append(digest)
            used_chars += len(digest) + 2
        return rendered, used_chars

    def _render_skill_blocks(
        self,
        selected_skills: tuple[str, ...],
        skills_map: Mapping[str, object],
        max_chars: int,
        used_chars: int,
    ) -> list[str]:
        rendered: list[str] = []
        remaining = len(selected_skills)
        for skill_id in selected_skills:
            if used_chars + 120 >= max_chars:
                break
            skill_meta = skills_map.get(skill_id)
            if not isinstance(skill_meta, dict):
                remaining -= 1
                continue
            src_raw = str(skill_meta.get("source_path", "") or "").strip()
            src_file = self._resolve_path(src_raw) if src_raw else None
            if not src_raw or src_file is None or not src_file.is_file():
                remaining -= 1
                continue
            body = _strip_skill_frontmatter(src_file.read_text(encoding="utf-8", errors="replace"))
            share = max(240, (max_chars - used_chars) // max(1, remaining))
            block = f"### Skill: `{skill_id}` (`{src_raw}`)\n{_trim_to_char_budget(body, share)}"
            if used_chars + len(block) > max_chars:
                block = _trim_to_char_budget(block, max_chars - used_chars)
            if block:
                rendered.append(block)
                used_chars += len(block) + 2
            remaining -= 1
        return rendered

    def _compile_context_markdown(
        self,
        *,
        domain_id: str | None,
        selected_skills: tuple[str, ...],
        selected_cookbooks: tuple[str, ...],
        domains_map: Mapping[str, object],
        skills_map: Mapping[str, object],
        cookbooks_map: Mapping[str, object],
        token_budget: int,
        full_library_tokens: int,
    ) -> str:
        max_chars = max(200, token_budget * _CHARS_PER_TOKEN)
        header = (
            f"## ICM Task-Scoped Skill Context\n"
            f"- Domain: `{domain_id or 'explicit-skill'}`\n"
            f"- Selected skills: {', '.join(f'`{s}`' for s in selected_skills)}\n"
            f"- Selected cookbook: {', '.join(f'`{c}`' for c in selected_cookbooks) or 'none'}\n"
            f"- Token budget: {token_budget} (full library ~{full_library_tokens})"
        )
        sections: list[str] = [header]
        used_chars = len(header) + 2

        ctx_body = self._render_domain_context(domain_id, domains_map, max_chars - used_chars)
        if ctx_body:
            sections.append(ctx_body)
            used_chars += len(ctx_body) + 2

        cb_blocks, used_chars = self._render_cookbook_digests(selected_cookbooks, cookbooks_map, max_chars, used_chars)
        sections.extend(cb_blocks)
        sections.extend(self._render_skill_blocks(selected_skills, skills_map, max_chars, used_chars))
        return _trim_to_char_budget("\n\n".join(sections), max_chars)

    @staticmethod
    def _s1_tiebreak_domain(
        task_description: str,
        top_domains: list[str],
    ) -> str | None:
        if len(top_domains) < 2:
            return None
        try:
            from llm.gemini_decisions import decide_s1  # noqa: PLC0415

            questions = {
                "winning_domain": {
                    "type": "choice",
                    "instructions": "Select the single best matching skill domain for the task.",
                    "criteria": {dom: f"Skill domain {dom}" for dom in top_domains[:2]},
                }
            }
            res = decide_s1(task_description[:1200], questions, allow_laya_failover=True)
            ans = getattr(res, "answers", {}).get("winning_domain")
            if isinstance(ans, Mapping):
                raw_choice = ans.get("choice")
                if raw_choice is None:
                    raw_choice = ans.get("value", ans.get("answer", ""))
                chosen = str(raw_choice).strip()
                if chosen in top_domains[:2]:
                    return chosen
        except Exception as exc:  # noqa: BLE001
            logger.debug("S1 tiebreak indisponivel para skill_router: %s", exc)
        return None

    def _resolve_primary_domain(
        self,
        ranked_domains: list[tuple[str, int]],
        min_domain_score: int,
        task_description: str,
        explicit_skills: list[str],
        skills_map: Mapping[str, object],
        enable_s1_tiebreak: bool,
    ) -> tuple[str | None, tuple[str, ...], list[str]]:
        if ranked_domains and ranked_domains[0][1] >= min_domain_score:
            top_dom, top_score = ranked_domains[0]
            can_tiebreak = (
                enable_s1_tiebreak
                and len(ranked_domains) >= 2
                and ranked_domains[1][1] >= min_domain_score
                and (top_score - ranked_domains[1][1]) <= 2
            )
            if can_tiebreak:
                chosen = self._s1_tiebreak_domain(task_description, [top_dom, ranked_domains[1][0]])
                if chosen and chosen != top_dom:
                    return chosen, (top_dom,), [f"s1_tiebreak:{chosen}"]
            secondary = tuple(d for d, s in ranked_domains[1:3] if s >= min_domain_score)
            return top_dom, secondary, [f"domain:{top_dom}:score_{top_score}"]

        if explicit_skills:
            first_meta = skills_map.get(explicit_skills[0])
            if isinstance(first_meta, dict) and isinstance(first_meta.get("domain"), str):
                dom = first_meta["domain"]
                return dom, (), [f"explicit_skill_domain:{dom}"]

        return None, (), []

    def route_and_compile(
        self,
        task_description: str,
        *,
        agent_name: str = "",
        metadata: Mapping[str, object] | None = None,
        token_budget: int | None = None,
        max_skills: int | None = None,
        include_content: bool = True,
        include_overlay: bool = True,
        enable_s1_tiebreak: bool = False,
    ) -> SkillContextPacket:
        """Select domain-scoped skills + cookbook and compile within token budget."""
        index = self.load_index(include_overlay=include_overlay)
        stats_raw = index.get("stats", {})
        stats = stats_raw if isinstance(stats_raw, dict) else {}
        full_tokens = _as_int(stats.get("full_library_tokens"), 15000)
        budget = max(
            200, token_budget if token_budget is not None else _as_int(index.get("default_token_budget"), 2400)
        )
        req_skills = max_skills if max_skills is not None else _as_int(index.get("max_skills_per_task"), 2)
        skill_limit = min(_MAX_SKILLS_HARD_CAP, max(1, req_skills))

        meta_map = metadata or {}
        mode = str(meta_map.get("skills_mode", "")).strip().lower()
        if meta_map.get("skills_disabled") or mode in _OPT_OUT_MODES:
            return _empty_packet(budget, full_tokens, {}, "skills_disabled_by_task")

        norm_text = _normalise_text(task_description)
        domains_raw = index.get("domains", {})
        skills_raw = index.get("skills", {})
        cookbooks_raw = index.get("cookbooks", {})
        domains_map = domains_raw if isinstance(domains_raw, Mapping) else {}
        skills_map = skills_raw if isinstance(skills_raw, Mapping) else {}
        cookbooks_map = cookbooks_raw if isinstance(cookbooks_raw, Mapping) else {}

        agent_skills = self._load_agent_affinities().get(agent_name.lstrip("@").strip().lower(), frozenset())
        explicit_skills = self._extract_explicit_skills(norm_text, metadata, skills_map)
        domain_scores = self._score_domains(norm_text, domains_map, agent_skills, skills_map)
        ranked_domains = sorted(domain_scores.items(), key=lambda kv: (-kv[1], kv[0]))

        primary_domain, secondary, reasons = self._resolve_primary_domain(
            ranked_domains,
            _as_int(index.get("min_domain_score"), 3),
            task_description,
            explicit_skills,
            skills_map,
            enable_s1_tiebreak,
        )
        if not primary_domain and not explicit_skills:
            return _empty_packet(budget, full_tokens, domain_scores, "no_domain_match")

        selected_skills = (
            self._select_domain_skills(
                primary_domain, norm_text, skills_map, agent_skills, explicit_skills, skill_limit
            )
            if primary_domain
            else tuple(explicit_skills[:skill_limit])
        )
        reasons.extend(f"explicit:{s_id}" for s_id in explicit_skills if s_id in selected_skills)

        selected_cookbooks = self._select_cookbook(
            primary_domain, selected_skills, norm_text, domains_map, cookbooks_map
        )
        compiled = self._compile_context_markdown(
            domain_id=primary_domain,
            selected_skills=selected_skills,
            selected_cookbooks=selected_cookbooks,
            domains_map=domains_map,
            skills_map=skills_map,
            cookbooks_map=cookbooks_map,
            token_budget=budget,
            full_library_tokens=full_tokens,
        )
        est_tokens = _estimate_tokens(compiled)
        savings = round(max(0.0, 100.0 * (1.0 - (est_tokens / max(1, full_tokens)))), 2)

        return SkillContextPacket(
            domain=primary_domain,
            secondary_domains=secondary,
            selected_skills=selected_skills,
            selected_cookbooks=selected_cookbooks,
            scores=domain_scores,
            reason_codes=tuple(reasons),
            token_budget=budget,
            estimated_tokens=est_tokens,
            full_library_tokens=full_tokens,
            savings_pct=savings,
            context_markdown=compiled if include_content else "",
        )


_DEFAULT_ROUTER: SkillContextRouter | None = None


def get_skill_router() -> SkillContextRouter:
    """Return process-wide cached SkillContextRouter singleton."""
    global _DEFAULT_ROUTER  # noqa: PLW0603
    if _DEFAULT_ROUTER is None:
        _DEFAULT_ROUTER = SkillContextRouter()
    return _DEFAULT_ROUTER


def route_and_compile_skill_context(
    task_description: str,
    *,
    agent_name: str = "",
    metadata: Mapping[str, object] | None = None,
    token_budget: int | None = None,
    max_skills: int | None = None,
    include_content: bool = True,
    include_overlay: bool = True,
    enable_s1_tiebreak: bool = False,
) -> SkillContextPacket:
    """Convenience entrypoint delegating to the singleton SkillContextRouter."""
    return get_skill_router().route_and_compile(
        task_description,
        agent_name=agent_name,
        metadata=metadata,
        token_budget=token_budget,
        max_skills=max_skills,
        include_content=include_content,
        include_overlay=include_overlay,
        enable_s1_tiebreak=enable_s1_tiebreak,
    )
