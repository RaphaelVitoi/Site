"""
Apply sanitizer: idempotent move of approved candidates into `archive/auto_archived`.
Usage:
  python apply_sanitize.py [--approve-file path] [--apply] [--report reports/name.json]

Behavior:
 - By default (no --approve-file), it will operate on candidates with recommended_action=='archive'
   from `reports/review_candidates.json` (these are older than 365d by dry-run logic).
 - It will NEVER touch paths starting with '_backups' (safety).
 - Default is dry-run; pass --apply to perform moves.
 - Produces an audit log in `reports/audit_sanitize_<timestamp>.json`.
"""

import argparse
import json
import shutil
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REVIEW = ROOT / "reports" / "review_candidates.json"
AUDIT_DIR = ROOT / "reports"
ARCHIVE_PREFIX = Path("archive") / "auto_archived"


def load_candidates():
    """Load review candidates from the JSON report."""
    if not REVIEW.exists():
        raise SystemExit(f"Review file not found: {REVIEW}")
    data = json.loads(REVIEW.read_text(encoding="utf-8"))
    return {c["path"]: c for c in data.get("candidates", [])}


def get_approved_candidates(args, candidates):
    """Determine which candidates are approved for archiving."""
    approved = set()
    if args.approve_file:
        af = Path(args.approve_file)
        if not af.exists():
            raise SystemExit(f"Approve file not found: {af}")
        arr = json.loads(af.read_text(encoding="utf-8"))
        approved.update(arr)
    else:
        # default: take recommended archive candidates
        for path, c in candidates.items():
            if c.get("recommended_action") == "archive":
                approved.add(path)
    return approved


def get_dir_size_and_mtime(src):
    """Approximate directory size and mtime."""
    total = 0
    for f in src.rglob("*"):
        try:
            if f.is_file():
                total += f.stat().st_size
        except OSError:
            continue
    mtime = datetime.fromtimestamp(src.stat().st_mtime, tz=UTC).isoformat()
    return total, mtime


def move_candidate(src, dst, entry):
    """Perform the move operation for a candidate."""
    if dst.exists():
        entry["moved"] = False
        entry["note"] = "destination_exists"
    else:
        shutil.move(str(src), str(dst))
        entry["moved"] = True


def process_single_candidate(rel_path, apply_mode, audit):
    """Process a single approved candidate for archiving."""
    # safety: never touch _backups
    if rel_path.replace("\\", "/").lower().startswith("_backups"):
        audit["entries"].append({"path": rel_path, "skipped": True, "reason": "protected_backup"})
        return

    src = ROOT / rel_path
    if not src.exists():
        audit["entries"].append({"path": rel_path, "skipped": True, "reason": "missing"})
        return

    dst_rel = ARCHIVE_PREFIX / rel_path
    dst = ROOT / dst_rel
    dst.parent.mkdir(parents=True, exist_ok=True)

    entry = {
        "path": rel_path,
        "absolute_src": str(src),
        "absolute_dst": str(dst),
        "is_dir": src.is_dir(),
        "size_bytes": None,
        "mtime": None,
        "moved": False,
    }

    try:
        if src.is_file():
            entry["size_bytes"] = src.stat().st_size
            entry["mtime"] = datetime.fromtimestamp(src.stat().st_mtime, tz=UTC).isoformat()
        else:
            entry["size_bytes"], entry["mtime"] = get_dir_size_and_mtime(src)

        if apply_mode:
            move_candidate(src, dst, entry)
        else:
            entry["moved"] = False

        audit["entries"].append(entry)
    except OSError as e:
        audit["entries"].append({"path": rel_path, "error": str(e)})


def main():
    """Main execution entry point."""
    p = argparse.ArgumentParser()
    p.add_argument(
        "--approve-file",
        type=str,
        help="JSON file with array of relative paths to archive",
    )
    p.add_argument("--apply", action="store_true", help="Actually move files (default: dry-run)")
    p.add_argument("--report", type=str, help="Override audit report path")
    args = p.parse_args()

    candidates = load_candidates()
    approved = get_approved_candidates(args, candidates)

    if not approved:
        print("No approved candidates found. Nothing to do.")
        return

    audit = {
        "generated_at": datetime.now(UTC).isoformat(),
        "dry_run": not args.apply,
        "entries": [],
    }

    for rel_path in sorted(approved):
        process_single_candidate(rel_path, args.apply, audit)

    ts = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    report_path = Path(args.report) if args.report else AUDIT_DIR / f"audit_sanitize_{ts}.json"
    report_path.write_text(json.dumps(audit, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Audit written to", report_path)
    print("Dry-run mode" if not args.apply else "Apply completed")


if __name__ == "__main__":
    main()
