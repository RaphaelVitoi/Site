"""
Delete all pending tasks from the resolved tasks DB.
Usage: python delete_pending_tasks.py [--confirm]
Without --confirm it performs a dry-run and prints the count.
With --confirm it deletes and writes an audit report to reports/pending_delete_audit_<ts>.json
"""
import argparse
from pathlib import Path
import sqlite3
from datetime import datetime, timezone
import json

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / 'reports'
REPORTS.mkdir(parents=True, exist_ok=True)

DB_CANDIDATES = [ROOT / 'queue' / 'tasks.db', ROOT / '.claude' / 'tasks.db', ROOT / 'tasks.db']


def find_db():
    for p in DB_CANDIDATES:
        if p.exists() and p.stat().st_size > 0:
            # quick integrity check
            try:
                conn = sqlite3.connect(str(p))
                cur = conn.cursor()
                cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
                if cur.fetchone():
                    conn.close()
                    return p
                conn.close()
            except sqlite3.Error:
                continue
    return None


def count_pending(db_path: Path):
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM tasks WHERE status='pending'")
    r = cur.fetchone()[0]
    conn.close()
    return r


def delete_pending(db_path: Path):
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE status='pending'")
    deleted = cur.rowcount
    conn.commit()
    conn.close()
    return deleted


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--confirm', action='store_true', help='Actually delete pending tasks')
    args = parser.parse_args()

    db = find_db()
    if not db:
        print('ERROR: tasks DB not found or corrupt among candidates:', DB_CANDIDATES)
        raise SystemExit(1)

    pending = count_pending(db)
    print(f'Found {pending} pending tasks in {db}')

    if not args.confirm:
        print('Dry-run: use --confirm to actually delete.')
        return

    # perform delete
    ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    deleted = delete_pending(db)
    audit = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'db': str(db),
        'deleted_pending': deleted,
    }
    out = REPORTS / f'pending_delete_audit_{ts}.json'
    out.write_text(json.dumps(audit, indent=2, ensure_ascii=False), encoding='utf-8')
    print('Deleted', deleted, 'pending tasks. Audit:', out)

if __name__ == '__main__':
    main()
