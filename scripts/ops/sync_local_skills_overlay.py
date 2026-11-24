"""scripts/ops/sync_local_skills_overlay.py -- Generate machine-local ICM skill overlay.

Discovers deduplicated user-scope skills across ~/.agents/skills, ~/.gemini/skills,
~/.gemini/antigravity/skills, ~/.claude/skills, and ~/.codex/skills, skipping any
skill already versioned in Site/skills_library/index.json, and writes the overlay
to ~/.gemini/config/icm_skills_overlay.json (gitignored in root repo).
"""

from __future__ import annotations

import json
from pathlib import Path
import re

import yaml

from utils.text import enforce_pure_ascii

SITE_ROOT = Path(__file__).resolve().parents[2]
_GEMINI_DIR = Path.home() / ".gemini"
BASE_INDEX_PATH = SITE_ROOT / "skills_library" / "index.json"
DEFAULT_OUTPUT_PATH = _GEMINI_DIR / "config" / "icm_skills_overlay.json"

_CHARS_PER_TOKEN = 4

_USER_SKILL_ROOTS: tuple[Path, ...] = (
    Path.home() / ".agents" / "skills",
    _GEMINI_DIR / "config" / "skills",
    _GEMINI_DIR / "skills",
    _GEMINI_DIR / "antigravity" / "skills",
    Path.home() / ".claude" / "skills",
    Path.home() / ".codex" / "skills",
)

_EGM_DOMAIN_ID = "egm-document-engineering"
_CHICO_DOMAIN_ID = "chico-masterpiece-sota"
_GENERAL_DOMAIN_ID = "user-scope-general"

_STATIC_DOMAIN_ASSIGNMENTS: dict[str, tuple[str, dict[str, int]]] = {
    "frontend-design": ("browser-and-ui-design", {"frontend": 4, "design": 4, "ui": 3, "css": 3}),
    "playwright": ("browser-and-ui-design", {"playwright": 5, "browser": 4, "e2e": 3}),
    "playwriter": ("browser-and-ui-design", {"playwriter": 5, "chrome extension": 4, "browser": 3}),
    "stitch-upload-to-stitch": ("browser-and-ui-design", {"stitch-upload-to-stitch": 5, "stitch": 4, "design": 3}),
    "debug-live": ("runtime-and-credentials", {"debug live": 5, "live debug": 5, "logs": 3, "server": 3}),
    "shared-mcp-gateway": ("runtime-and-credentials", {"mcp gateway": 5, "8933": 5, "gateway": 4}),
    "sota-tactical-orchestrator-nanostack": (
        "runtime-and-credentials",
        {"nanostack": 5, "tactical orchestrator": 5, "sota": 3},
    ),
    "nexo-sql-studio": ("data-and-knowledge", {"nexo": 5, "sql": 4, "studio": 3, "database": 3}),
    "escada-tratamento-outsiders": (
        "governance-and-handoff",
        {"escada": 5, "outsiders": 5, "arquivar": 4, "excluir": 3},
    ),
    "raphael-vitoi-gpt": (
        "pmev-and-quant",
        {
            "raphael-vitoi-gpt": 6,
            "educador raphael vitoi": 6,
            "toy game": 5,
            "aula icm": 5,
            "bubble factor": 4,
            "risk advantage": 4,
            "hrc pro": 4,
            "gto wizard": 4,
            "late registration": 4,
            "coaching poker": 4,
        },
    ),
    "raphael-vitoi-sota": (
        _CHICO_DOMAIN_ID,
        {
            "raphael-vitoi-sota": 6,
            "masterpiece": 5,
            "poker racional": 5,
            "smart mda": 5,
            "deepstack": 4,
            "parceria formal": 5,
            "palacio mental": 5,
            "user_id_vip1": 6,
        },
    ),
}

_STOPWORDS = frozenset({"para", "with", "this", "that", "from", "when", "used", "onde", "como", "mais", "entre"})
_YAML_BLOCK_MARKERS = frozenset({">-", ">", "|", "|-"})


def _extract_frontmatter_lines(text: str) -> list[str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return []
    for idx, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return lines[1:idx]
    return []


def _clean_scalar(raw: object) -> str:
    return " ".join(str(raw).split()) if raw is not None else ""


def _parse_frontmatter_yaml(fm_lines: list[str]) -> tuple[str, str]:
    if not fm_lines:
        return "", ""
    try:
        parsed = yaml.safe_load("\n".join(fm_lines))
    except yaml.YAMLError:
        return "", ""
    if not isinstance(parsed, dict):
        return "", ""
    return _clean_scalar(parsed.get("name")), _clean_scalar(parsed.get("description"))


def _parse_frontmatter_lines_fallback(fm_lines: list[str]) -> tuple[str, str]:
    extracted: dict[str, str] = {}
    for line in fm_lines:
        key, sep, value = line.partition(":")
        if not sep:
            continue
        norm_key = key.strip().lower()
        clean_val = value.strip().strip("'\"")
        if norm_key in ("name", "description") and clean_val and clean_val not in _YAML_BLOCK_MARKERS:
            extracted.setdefault(norm_key, clean_val)
    return extracted.get("name", ""), extracted.get("description", "")


def _parse_frontmatter(skill_md: Path) -> tuple[str, str]:
    text = skill_md.read_text(encoding="utf-8", errors="replace")
    fm_lines = _extract_frontmatter_lines(text)
    name, desc = _parse_frontmatter_yaml(fm_lines)
    if not name or not desc:
        fb_name, fb_desc = _parse_frontmatter_lines_fallback(fm_lines)
        name = name or fb_name
        desc = desc or fb_desc
    return (
        enforce_pure_ascii(name or skill_md.parent.name),
        enforce_pure_ascii(desc or f"User-scope skill {skill_md.parent.name}"),
    )


def _derive_keywords(skill_id: str, description: str) -> dict[str, int]:
    keywords: dict[str, int] = {skill_id.lower(): 5}
    for part in skill_id.lower().split("-"):
        if len(part) >= 4 and part not in _STOPWORDS:
            keywords.setdefault(part, 2)
    tokens = re.findall(r"[a-z0-9_]{4,}", description.lower())
    for tok in tokens[:8]:
        if tok not in _STOPWORDS:
            keywords.setdefault(tok, 1)
    return keywords


def _classify_user_skill(skill_id: str, description: str) -> tuple[str, dict[str, int]]:
    if skill_id.startswith("egm-"):
        kw = _derive_keywords(skill_id, description)
        kw.update({"egm": 5, "document": 3, "review": 2})
        return _EGM_DOMAIN_ID, kw
    if skill_id in _STATIC_DOMAIN_ASSIGNMENTS:
        return _STATIC_DOMAIN_ASSIGNMENTS[skill_id]
    return _GENERAL_DOMAIN_ID, _derive_keywords(skill_id, description)


def _discover_user_skills(roots: tuple[Path, ...], base_skills: set[str]) -> dict[str, Path]:
    discovered: dict[str, Path] = {}
    for root in roots:
        if not root.is_dir():
            continue
        for entry in sorted(root.iterdir()):
            if not entry.is_dir() or entry.name.startswith("."):
                continue
            skill_md = entry / "SKILL.md"
            if skill_md.is_file() and entry.name not in base_skills:
                discovered.setdefault(entry.name, skill_md)
    return discovered


def _build_overlay_domains(used_domains: set[str]) -> dict[str, object]:
    overlay_domains: dict[str, object] = {}
    if _EGM_DOMAIN_ID in used_domains:
        overlay_domains[_EGM_DOMAIN_ID] = {
            "id": _EGM_DOMAIN_ID,
            "title": "EGM Document Engineering & Review",
            "context_path": "",
            "default_cookbook": "",
            "keywords": {"egm": 6, "brainstorm": 4, "draft": 4, "drift": 4, "review-loop": 5, "egm-review": 5},
            "anti_keywords": {"hkcu": 3, "pmev": 3},
        }
    if _CHICO_DOMAIN_ID in used_domains:
        overlay_domains[_CHICO_DOMAIN_ID] = {
            "id": _CHICO_DOMAIN_ID,
            "title": "Chico MasterPiece & Sistema Totalizante SOTA",
            "context_path": "",
            "default_cookbook": "",
            "keywords": {
                "raphael-vitoi-sota": 6,
                "masterpiece": 5,
                "poker racional": 5,
                "smart mda": 5,
                "parceria formal": 5,
                "palacio mental": 5,
                "user_id_vip1": 6,
            },
            "anti_keywords": {"hkcu": 3, "cdp": 3, "pmev": 2},
        }
    if _GENERAL_DOMAIN_ID in used_domains:
        overlay_domains[_GENERAL_DOMAIN_ID] = {
            "id": _GENERAL_DOMAIN_ID,
            "title": "User-Scope General Skills",
            "context_path": "",
            "default_cookbook": "",
            "keywords": {"user-scope": 4},
            "anti_keywords": {},
        }
    return overlay_domains


def build_overlay(
    *,
    base_index_path: Path = BASE_INDEX_PATH,
    roots: tuple[Path, ...] = _USER_SKILL_ROOTS,
) -> dict[str, object]:
    """Scan user-scope roots and return a deduplicated ICM overlay dict."""
    base = json.loads(base_index_path.read_text(encoding="utf-8"))
    base_skills = set(base.get("skills", {}).keys())
    discovered = _discover_user_skills(roots, base_skills)

    overlay_skills: dict[str, object] = {}
    used_domains: set[str] = set()
    for skill_id, skill_md in sorted(discovered.items()):
        _name, desc = _parse_frontmatter(skill_md)
        domain_id, keywords = _classify_user_skill(skill_id, desc)
        used_domains.add(domain_id)
        raw_len = len(skill_md.read_text(encoding="utf-8", errors="replace"))
        overlay_skills[skill_id] = {
            "domain": domain_id,
            "scope": "user-overlay",
            "source_path": skill_md.resolve().as_posix(),
            "summary": desc[:220],
            "keywords": keywords,
            "explicit_aliases": [skill_id],
            "cookbooks": [],
            "token_estimate": max(1, (raw_len + _CHARS_PER_TOKEN - 1) // _CHARS_PER_TOKEN),
        }

    return {
        "schema_version": "1.0.0",
        "domains": _build_overlay_domains(used_domains),
        "skills": overlay_skills,
    }


def write_overlay(output_path: Path = DEFAULT_OUTPUT_PATH) -> dict[str, object]:
    """Generate and persist the machine-local ICM overlay JSON."""
    payload = build_overlay()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return payload


def main() -> int:
    payload = write_overlay(DEFAULT_OUTPUT_PATH)
    skills = payload.get("skills", {})
    domains = payload.get("domains", {})
    skill_cnt = len(skills) if isinstance(skills, dict) else 0
    dom_cnt = len(domains) if isinstance(domains, dict) else 0
    print(
        json.dumps(
            {"status": "ok", "overlay_path": DEFAULT_OUTPUT_PATH.as_posix(), "skills": skill_cnt, "domains": dom_cnt}
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
