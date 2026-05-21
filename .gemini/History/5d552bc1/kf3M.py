"""
Dry-run sanitizer report generator
Generates reports/dry_run_report.json listing candidate files/dirs to archive
and summaries for task DBs (counts by status and stale tasks older than cutoff days).
"""
import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone, timedelta
import sqlite3

ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = ROOT / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

PATTERNS_DIR = ["archive", "_backups", "scripts/_legacy", "archive/scripts_legado"]
EXTRA_KEYWORDS = ["legacy", "_archive", ".archive", "legacy_"]


def dir_size(path: Path) -> int:
    total = 0
    for p in path.rglob('*'):
        try:
            if p.is_file():
                total += p.stat().st_size
        except OSError:
            continue
    return total


def find_candidates(root: Path):
    candidates = []
    for p in root.rglob('*'):
        try:
            name = p.name.lower()
            rel = p.relative_to(root)
        except Exception:
            continue
        if any(part in ["archive", "_backups"] for part in rel.parts):
            if p.is_dir() or p.is_file():
                candidates.append((p, 'archive_dir'))
                continue
        # explicit patterns
        for patt in PATTERNS_DIR:
            try:
                if str(rel).lower().startswith(patt):
                    candidates.append((p, 'pattern_dir'))
                    break
            except Exception:
                pass
        # keyword heuristics for directories only
        if p.is_dir() and any(k in name for k in EXTRA_KEYWORDS):
            candidates.append((p, 'heuristic_dir'))
        # queue backups
        if str(rel).lower().startswith('queue') and p.is_file() and p.suffix.lower() in ['.bak', '.backup', '.json']:
            candidates.append((p, 'queue_backup'))
    # dedupe by path
    unique = {}
    for p, reason in candidates:
        if p not in unique:
            unique[p] = reason
    out = []
    for p, reason in unique.items():
        try:
            stat = p.stat()
            mtime = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
            size = dir_size(p) if p.is_dir() else stat.st_size
        except OSError:
            mtime = None
            size = None
        out.append({
            'path': str(p.relative_to(root)),
            'absolute': str(p),
            'is_dir': p.is_dir(),
            'size_bytes': size,
            'mtime': mtime,
            'reason': reason,
        })
    return out


def find_task_dbs(root: Path):
    candidates = [root / 'queue' / 'tasks.db', root / '.claude' / 'tasks.db', root / 'tasks.db']
    existing = [p for p in candidates if p.exists()]
    return existing


def analyze_db(db_path: Path, cutoff_days: int):
    out = {'db': str(db_path), 'exists': True}
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        # total tasks
        cur.execute('SELECT COUNT(*) as c FROM tasks')
        out['total_tasks'] = cur.fetchone()['c']
        # counts by status
        cur.execute('SELECT status, COUNT(*) as c FROM tasks GROUP BY status')
        out['by_status'] = {r['status']: r['c'] for r in cur.fetchall()}
        cutoff_iso = (datetime.now(timezone.utc) - timedelta(days=cutoff_days)).isoformat()
        cur.execute('SELECT COUNT(*) as c FROM tasks WHERE timestamp < ?', (cutoff_iso,))
        out['stale_count'] = cur.fetchone()['c']
        cur.execute('SELECT agent, COUNT(*) as c FROM tasks WHERE timestamp < ? GROUP BY agent', (cutoff_iso,))
        out['stale_by_agent'] = {r['agent']: r['c'] for r in cur.fetchall()}
        conn.close()
    except sqlite3.Error as e:
        out['exists'] = False
        out['error'] = str(e)
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cutoff', type=int, default=30, help='Days cutoff for stale tasks')
    parser.add_argument('--out', type=str, default=str(REPORTS_DIR / 'dry_run_report.json'))
    args = parser.parse_args()

    root = ROOT
    report = {}
    report['generated_at'] = datetime.now(timezone.utc).isoformat()
    report['root'] = str(root)
    report['candidates'] = find_candidates(root)
    dbs = find_task_dbs(root)
    report['task_dbs'] = []
    for db in dbs:
        report['task_dbs'].append(analyze_db(db, args.cutoff))

    with open(args.out, 'w', encoding='utf-8') as fh:
        json.dump(report, fh, indent=2, ensure_ascii=False)

    print(f"DRY-RUN COMPLETE. Report written to: {args.out}")

if __name__ == '__main__':
    main()
