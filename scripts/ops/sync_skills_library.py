"""scripts/ops/sync_skills_library.py -- Validate and synchronize skills_library/index.json.

Verifies exact 1-to-1 parity between git-tracked local skills (.agents/skills/*/SKILL.md)
and skills_library/index.json, validates every OpenMonoAgent YAML cookbook against
CookbookSpec, enforces MECE domain partitioning without redundant SKILL.md copies,
and optionally refreshes token estimates/stats (--write).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import sys

import yaml

SITE_ROOT = Path(__file__).resolve().parents[2]
if str(SITE_ROOT) not in sys.path:
    sys.path.insert(0, str(SITE_ROOT))

from core.skill_router import CookbookSpec  # noqa: E402

LIBRARY_ROOT = SITE_ROOT / "skills_library"
INDEX_FILENAME = "index.json"
INDEX_PATH = LIBRARY_ROOT / INDEX_FILENAME
CHARS_PER_TOKEN = 4


def _tracked_local_skills(site_root: Path) -> set[str]:
    proc = subprocess.run(
        ["git", "ls-files", ".agents/skills/*/SKILL.md"],
        cwd=site_root,
        capture_output=True,
        text=True,
        check=True,
    )
    return {Path(line.strip()).parent.name for line in proc.stdout.splitlines() if line.strip()}


def _estimate_file_tokens(path: Path) -> int:
    text = path.read_text(encoding="utf-8", errors="replace")
    return max(1, (len(text) + CHARS_PER_TOKEN - 1) // CHARS_PER_TOKEN)


def _validate_domain_entries(domains: dict[object, object], site_root: Path, errors: list[str]) -> None:
    for dom_id, dom_meta in domains.items():
        if not isinstance(dom_meta, dict):
            errors.append(f"domain '{dom_id}': metadata must be object")
            continue
        ctx_rel = str(dom_meta.get("context_path", ""))
        if not (site_root / ctx_rel).is_file():
            errors.append(f"domain '{dom_id}': missing context_path '{ctx_rel}'")


def _validate_skill_entries(
    skills: dict[object, object],
    domains: dict[object, object],
    site_root: Path,
    errors: list[str],
) -> None:
    for skill_id, s_meta in skills.items():
        if not isinstance(s_meta, dict):
            errors.append(f"skill '{skill_id}': metadata must be object")
            continue
        dom = str(s_meta.get("domain", ""))
        if dom not in domains:
            errors.append(f"skill '{skill_id}': unknown domain '{dom}'")
        src_rel = str(s_meta.get("source_path", ""))
        if not (site_root / src_rel).is_file():
            errors.append(f"skill '{skill_id}': missing source_path '{src_rel}'")


def _validate_domains_and_skills(
    index: dict[str, object],
    tracked_skills: set[str],
    site_root: Path,
    errors: list[str],
) -> None:
    domains = index.get("domains")
    skills = index.get("skills")
    if not isinstance(domains, dict) or not domains:
        errors.append(f"{INDEX_FILENAME}: 'domains' missing or empty")
        return
    if not isinstance(skills, dict) or not skills:
        errors.append(f"{INDEX_FILENAME}: 'skills' missing or empty")
        return

    _validate_domain_entries(domains, site_root, errors)

    indexed_skills = set(skills.keys())
    missing = sorted(tracked_skills - indexed_skills)
    ghosts = sorted(indexed_skills - tracked_skills)
    if missing:
        errors.append(f"tracked local skills missing from {INDEX_FILENAME}: {missing}")
    if ghosts:
        errors.append(f"non-tracked/ghost skills present in {INDEX_FILENAME}: {ghosts}")

    _validate_skill_entries(skills, domains, site_root, errors)


def _validate_cookbooks(
    index: dict[str, object],
    site_root: Path,
    errors: list[str],
) -> None:
    domains = index.get("domains")
    skills = index.get("skills")
    cookbooks = index.get("cookbooks")
    if not isinstance(domains, dict) or not isinstance(skills, dict) or not isinstance(cookbooks, dict):
        return

    for cb_id, cb_meta in cookbooks.items():
        if not isinstance(cb_meta, dict):
            errors.append(f"cookbook '{cb_id}': metadata must be object")
            continue
        cb_rel = str(cb_meta.get("path", ""))
        cb_path = site_root / cb_rel
        if not cb_path.is_file():
            errors.append(f"cookbook '{cb_id}': missing YAML file '{cb_rel}'")
            continue
        try:
            raw = yaml.safe_load(cb_path.read_text(encoding="utf-8"))
            spec = CookbookSpec.model_validate(raw)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"cookbook '{cb_id}': schema error: {exc}")
            continue

        if spec.id != cb_id:
            errors.append(f"cookbook '{cb_id}': YAML id '{spec.id}' diverges from index key")
        if spec.domain not in domains:
            errors.append(f"cookbook '{cb_id}': unknown domain '{spec.domain}'")
        unknown_skills = [s for s in spec.skills if s not in skills]
        if unknown_skills:
            errors.append(f"cookbook '{cb_id}': references unknown skills {unknown_skills}")


def validate_library(site_root: Path = SITE_ROOT) -> list[str]:
    """Return list of validation errors (empty means 100% valid)."""
    errors: list[str] = []
    lib_root = site_root / "skills_library"
    idx_path = lib_root / INDEX_FILENAME

    for required in (
        lib_root / "IDENTITY.md",
        lib_root / "CONTEXT.md",
        lib_root / "cookbooks" / "cookbook.schema.json",
    ):
        if not required.is_file():
            errors.append(f"missing required file: {required.relative_to(site_root)}")

    redundant = sorted(p.relative_to(site_root).as_posix() for p in lib_root.rglob("SKILL.md"))
    if redundant:
        errors.append(f"redundant SKILL.md copies forbidden inside skills_library/: {redundant}")

    if not idx_path.is_file():
        errors.append(f"missing skills_library/{INDEX_FILENAME}")
        return errors

    index = json.loads(idx_path.read_text(encoding="utf-8"))
    tracked_skills = _tracked_local_skills(site_root)
    _validate_domains_and_skills(index, tracked_skills, site_root, errors)
    _validate_cookbooks(index, site_root, errors)
    return errors


def refresh_token_stats(site_root: Path = SITE_ROOT) -> dict[str, int]:
    """Recompute token estimates from real SKILL.md and cookbook files on disk."""
    idx_path = site_root / "skills_library" / INDEX_FILENAME
    index = json.loads(idx_path.read_text(encoding="utf-8"))

    total_tokens = 0
    for s_meta in index.get("skills", {}).values():
        src = site_root / str(s_meta["source_path"])
        if src.is_file():
            est = _estimate_file_tokens(src)
            s_meta["token_estimate"] = est
            total_tokens += est

    for cb_meta in index.get("cookbooks", {}).values():
        cb_file = site_root / str(cb_meta["path"])
        if cb_file.is_file():
            est = _estimate_file_tokens(cb_file)
            cb_meta["token_estimate"] = est
            total_tokens += est

    for dom_meta in index.get("domains", {}).values():
        ctx_file = site_root / str(dom_meta["context_path"])
        if ctx_file.is_file():
            total_tokens += _estimate_file_tokens(ctx_file)

    stats = {
        "local_skill_count": len(index.get("skills", {})),
        "harness_skill_count": len(index.get("harness_skills", {})),
        "domain_count": len(index.get("domains", {})),
        "cookbook_count": len(index.get("cookbooks", {})),
        "full_library_tokens": total_tokens,
    }
    index["stats"] = stats
    idx_path.write_text(json.dumps(index, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return stats


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and sync SOTA ICM skills_library.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--check", action="store_true", help="Validate parity and schemas (exit non-zero on drift).")
    group.add_argument("--write", action="store_true", help="Refresh token estimates & stats, then validate.")
    args = parser.parse_args()

    if args.write:
        stats = refresh_token_stats(SITE_ROOT)
        print(f"Refreshed stats: {json.dumps(stats, ensure_ascii=True)}")

    errors = validate_library(SITE_ROOT)
    if errors:
        for err in errors:
            print(f"[ERROR] {err}", file=sys.stderr)
        return 1

    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    print(f"OK: {json.dumps(index.get('stats', {}), ensure_ascii=True)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
