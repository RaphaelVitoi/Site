import logging
from pathlib import Path
from datetime import datetime
from core.schemas import Task

def write_economic_log(task: Task, duration_secs: float, status: str):
    audit_dir = Path(".claude/logs/audit")
    audit_dir.mkdir(parents=True, exist_ok=True)
    log_file = audit_dir / f"economic_audit_{datetime.now().strftime('%Y-%m')}.log"
    
    priority = task.metadata.get("priority", "medium").upper() if task.metadata else "MEDIUM"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    log_entry = f"[{timestamp}] | LVL:{priority} | AGENT:{task.agent} | STAT:{status} | DUR:{duration_secs:.1f}s | ID:{task.id} | DESC:{task.description[:60]}...\n"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(log_entry)