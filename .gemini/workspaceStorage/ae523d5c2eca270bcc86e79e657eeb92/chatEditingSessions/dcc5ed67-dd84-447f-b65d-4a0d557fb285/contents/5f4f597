"""
Generate filtered review candidates excluding _backups and add simple recommendation tags.
Writes reports/review_candidates.json
"""

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IN = ROOT / "reports" / "dry_run_report.json"
OUT = ROOT / "reports" / "review_candidates.json"

if not IN.exists():
    print("Input report not found:", IN)
    raise SystemExit(1)

r = json.loads(IN.read_text(encoding="utf-8"))
candidates = r.get("candidates", [])

out = []
now = datetime.now(timezone.utc)

for c in candidates:
    path = c.get("path", "")
    if path.lower().startswith("_backups"):
        continue
    rec = "review"
    # if archive_dir and mtime older than 365 days -> suggest 'archive'
    if c.get("reason") == "archive_dir" and c.get("mtime"):
        try:
            m = datetime.fromisoformat(c["mtime"])
            age_days = (now - m).days
            if age_days > 365:
                rec = "archive"
        except (ValueError, TypeError):
            pass
    out.append(
        {
            "path": c.get("path"),
            "absolute": c.get("absolute"),
            "is_dir": c.get("is_dir"),
            "size_bytes": c.get("size_bytes"),
            "mtime": c.get("mtime"),
            "reason": c.get("reason"),
            "recommended_action": rec,
        }
    )

report = {
    "generated_at": r.get("generated_at"),
    "filtered_count": len(out),
    "candidates": out,
}
OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
print("WROTE", OUT)
