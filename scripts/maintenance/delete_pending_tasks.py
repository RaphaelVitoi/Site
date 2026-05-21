"""
Delete all pending tasks from the resolved tasks DB.
Usage: python delete_pending_tasks.py [--confirm]
Without --confirm it performs a dry-run and prints the count.
With --confirm it deletes and writes an audit report to reports/pending_delete_audit_<ts>.json
"""

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "reports"
REPORTS.mkdir(parents=True, exist_ok=True)

TASKS_DB_NAME = "tasks.db"
DB_CANDIDATES = [
    ROOT / "queue" / TASKS_DB_NAME,
    ROOT / ".claude" / TASKS_DB_NAME,
    ROOT / TASKS_DB_NAME,
]


def find_db():
    """Find the first existing and valid task database."""
    for p in DB_CANDIDATES:
        if p.exists() and p.stat().st_size > 0:
            # quick integrity check
            try:
                conn = sqlite3.connect(str(p))
                cur = conn.cursor()
                cur.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'"
                )
                if cur.fetchone():
                    conn.close()
                    return p
                conn.close()
            except sqlite3.Error:
                continue
    return None


def count_pending(db_path: Path):
    """Count the number of pending tasks in the given database."""
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM tasks WHERE status='pending'")
    r = cur.fetchone()[0]
    conn.close()
    return r


def delete_pending(db_path: Path):
    """Delete all pending tasks from the given database and return the deleted count."""
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE status='pending'")
    deleted = cur.rowcount
    conn.commit()
    conn.close()
    return deleted


def main():
    """Main execution entry point."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--confirm", action="store_true", help="Actually delete pending tasks"
    )
    args = parser.parse_args()

    db = find_db()
    if not db:
        print("ERROR: tasks DB not found or corrupt among candidates:", DB_CANDIDATES)
        raise SystemExit(1)

    pending = count_pending(db)
    print(f"Found {pending} pending tasks in {db}")

    if not args.confirm:
        print("Dry-run: use --confirm to actually delete.")
        return

    # perform delete
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    deleted = delete_pending(db)
    audit = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "db": str(db),
        "deleted_pending": deleted,
    }
    out = REPORTS / f"pending_delete_audit_{ts}.json"
    out.write_text(json.dumps(audit, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Deleted", deleted, "pending tasks. Audit:", out)


if __name__ == "__main__":
    main()
