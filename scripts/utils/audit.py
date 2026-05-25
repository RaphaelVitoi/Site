"""Modulo de auditoria e telemetria financeira."""

from datetime import datetime, timezone
from pathlib import Path

from core.schemas import Task
from utils.text import enforce_pure_ascii


def write_economic_log(task: Task, duration_secs: float, status: str):
    """Grava logs economicos sobre as tasks realizadas (Pure ASCII)."""
    audit_dir = Path(".claude/logs/audit")
    audit_dir.mkdir(parents=True, exist_ok=True)
    log_file = (
        audit_dir / f"economic_audit_{datetime.now(timezone.utc).strftime('%Y-%m')}.log"
    )

    priority = (
        str(task.metadata.get("priority", "medium")).upper() if task.metadata else "MEDIUM"
    )
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    desc = str(task.description[:60])
    log_entry = (
        f"[{timestamp}] | LVL:{priority} | AGENT:{task.agent} | STAT:{status} "
        f"| DUR:{duration_secs:.1f}s | ID:{task.id} | DESC:{desc}...\n"
    )
    log_entry = enforce_pure_ascii(log_entry)
    with open(log_file, "a", encoding="ascii", errors="backslashreplace") as f:
        f.write(log_entry)
