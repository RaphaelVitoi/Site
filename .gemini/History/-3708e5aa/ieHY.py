import json
import time
import sys
import os
import base64
import re
import subprocess
import urllib.request
import urllib.error
import logging
import threading
import concurrent.futures
import asyncio
import traceback
import aiosqlite
import sqlite3
from pathlib import Path
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ValidationError
from datetime import datetime, timedelta

# Configuracao estetica e persistente de Log (Estado da Arte)
log_dir = Path(".claude/logs")
log_dir.mkdir(parents=True, exist_ok=True)
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    force=True, 
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(log_dir / "task_executor.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

class Task(BaseModel):
    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str
    completedAt: Optional[str] = None
    model: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class QueueManager:
    def __init__(self, queue_path: str = None):
        if queue_path is None:
            self.db_path = Path(__file__).parent.parent.parent.resolve() / "queue" / "tasks.db"
        else:
            self.db_path = Path(queue_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS llm_cache (
                    model TEXT NOT NULL,
                    prompt TEXT NOT NULL,
                    response TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    PRIMARY KEY (model, prompt)
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_model_prompt ON llm_cache (model, prompt)")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    description TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    agent TEXT NOT NULL,
                    priority TEXT DEFAULT 'normal',
                    metadata TEXT,
                    completedAt TEXT
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_status_time ON tasks (status, timestamp)")
            conn.commit()

    def add_task(self, task: Task):
        with self._get_conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO tasks 
                (id, description, status, timestamp, agent, priority, metadata, completedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.id, 
                task.description,
                task.status,
                task.timestamp,
                task.agent,
                task.metadata.get("priority", "normal") if task.metadata else "normal",
                json.dumps(task.metadata) if task.metadata else '{}',
                task.completedAt
            ))
            conn.commit()

    def get_task(self, task_id: str):
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if row:
                return self._row_to_task(row)
        return None
            
    def get_next_task(self):
        with self._get_conn() as conn:
            row = conn.execute("""
                SELECT * FROM tasks 
                WHERE status = 'pending' 
                ORDER BY 
                    CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 WHEN 'low' THEN 3 ELSE 2 END,
                    timestamp ASC
                LIMIT 1
            """).fetchone()
            if row:
                return self._row_to_task(row)
        return None

    def update_task_status(self, task_id: str, new_status):
        completed_at = datetime.now().isoformat() if new_status in ["completed", "failed"] else None
        with self._get_conn() as conn:
            if completed_at:
                conn.execute("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?",
                             (new_status, completed_at, task_id))
            else:
                conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            conn.commit()
 
    def get_tasks(self, status: str = None) -> List[Task]:
        with self._get_conn() as conn:
            if status:
                rows = conn.execute("SELECT * FROM tasks WHERE status = ? ORDER BY timestamp DESC", (status,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM tasks ORDER BY timestamp DESC").fetchall()
            return [self._row_to_task(row) for row in rows]
            
    def get_task_counts(self):
        with self._get_conn() as conn:
            rows = conn.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").fetchall()
            counts = { "pending": 0, "running": 0, "completed": 0, "failed": 0 }
            for r in rows:
                if r["status"] in counts:
                    counts[r["status"]] = r["count"]
            return counts

    def get_llm_cache(self, model: str, prompt: str) -> Optional[str]:
        with self._get_conn() as conn:
            row = conn.execute("SELECT response FROM llm_cache WHERE model = ? AND prompt = ?", (model, prompt)).fetchone()
            if row is not None:
                return row['response']
        return None

    def update_llm_cache(self, model: str, prompt: str, response: str):
        timestamp = datetime.now().isoformat()
        with self._get_conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """, (model, prompt, response, timestamp))
            conn.commit()

    def cleanup(self, days: int):
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS archive_tasks (
                    id TEXT PRIMARY KEY,
                    description TEXT,
                    status TEXT,
                    timestamp TEXT,
                    agent TEXT,
                    priority TEXT,
                    metadata TEXT,
                    completedAt TEXT
                )
            """)
            conn.execute("""
                INSERT OR IGNORE INTO archive_tasks
                SELECT * FROM tasks
                WHERE status IN ('completed', 'failed') AND timestamp < ? AND agent != '@maverick'
            """, (cutoff,))
            conn.execute("""
                DELETE FROM tasks 
                WHERE status IN ('completed', 'failed') AND timestamp < ? AND agent != '@maverick'
            """, (cutoff,))
            conn.commit()

    def _row_to_task(self, row) -> Task:
        metadata = {}
        if row["metadata"]:
            try: metadata = json.loads(row["metadata"])
            except: pass
        return Task(
            id=row["id"], description=row["description"], status=row["status"],
            timestamp=row["timestamp"], agent=row["agent"], completedAt=row["completedAt"],
            metadata=metadata
        )

AGENT_ROUTING = {
    "@maverick":      ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@planner":       ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@auditor":       ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@implementor":   ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@verifier":      ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@skillmaster":   ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@dispatcher":    ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@chico":         ("gemini-2.5-pro", "gemini-2.5-flash", "claude-3-7-sonnet-20250219", "deepseek/deepseek-r1:free")
}

FALLBACK_MODEL = "gemini-2.5-flash"

def get_agent_system_prompt(agent_name: str) -> str:
    agent_clean = agent_name.replace("@", "")
    global_ctx = ""
    global_file = Path(".claude/GLOBAL_INSTRUCTIONS.md")
    if global_file.exists():
        with open(global_file, "r", encoding="utf-8") as f:
            global_ctx = f.read() + "\n\n"
    infra_ctx = ""
    for doc_name, doc_paths in [
        ("COSMOVISAO FILOSOFICA", [".claude/COSMOVISAO.md"]),
        ("IDENTIDADE DO USUARIO", [".claude/CLAUDE.md"]),
        ("MANUAL DO WORKFLOW", ["docs/MANUAL_WORKFLOW_AGENTES.md"]),
        ("ARQUITETURA DO CEREBRO HIBRIDO", [".claude/HYBRID_BRAIN_ARCHITECTURE.md"])
    ]:
        for doc_path in doc_paths:
            file_obj = Path(doc_path)
            if file_obj.exists():
                with open(file_obj, "r", encoding="utf-8") as f:
                    infra_ctx += f"=== {doc_name} ===\n" + f.read() + "\n\n"
                break
    agent_file = Path(f".claude/agents/{agent_clean}.md")
    agent_prompt = f"Voce e o agente especialista {agent_name}."
    if agent_file.exists():
        with open(agent_file, "r", encoding="utf-8") as f:
            agent_prompt = f"=== SUA IDENTIDADE ESPECIFICA ({agent_name}) ===\n" + f.read()
    return global_ctx + infra_ctx + agent_prompt

def _load_env_keys() -> Dict[str, str]:
    keys = {}
    base_dir = Path(__file__).parent.parent.parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        match = re.search(r'(?:\$env:)?([a-zA-Z0-9_]+)\s*=\s*[\'"]?([^\'"\n\r\s]+)[\'"]?', line)
                        if match: keys[match.group(1)] = match.group(2).strip()
            except Exception as e: logging.warning(f"Aviso ao ler {file_name}: {e}")
    return keys

def call_gemini(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {"system_instruction": {"parts": [{"text": system_prompt}]}, "contents": [{"parts": [{"text": user_prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result['candidates'][0]['content']['parts'][0]['text']

def call_llm_api(agent_name: str, system_prompt: str, user_prompt: str, manager: QueueManager) -> str:
    quartet = AGENT_ROUTING.get(agent_name, (FALLBACK_MODEL, "gemini-2.5-pro", "deepseek/deepseek-r1:free", "claude-3-5-haiku-20241022"))
    env_keys = _load_env_keys()
    gemini_key = os.environ.get("GEMINI_API_KEY") or env_keys.get("GEMINI_API_KEY")
    for model in quartet:
        try:
            if "gemini" in model and gemini_key:
                response = call_gemini(model, system_prompt, user_prompt, gemini_key)
                manager.update_llm_cache(model, user_prompt, response)
                return response
        except Exception as e:
            logging.warning(f"[{agent_name}] Falha no modelo {model}: {e}")
    return "Falha na API. Modo contingencia."

def get_autonomy_mode() -> str:
    config_path = Path(".claude/autonomy.json")
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f).get("mode", "off")
        except: pass
    return "off"

def apply_god_mode(text: str):
    autonomy_mode = get_autonomy_mode()
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-zA-Z]*\n(.*?)```"
    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        filepath, content = match.group(1).strip(), match.group(2)
        try:
            target_path = Path(filepath)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f: f.write(content)
            logging.info(f"[MATERIALIZACAO] Arquivo forjado: {filepath}")
        except Exception as e: logging.error(f"[FAIL] Erro ao forjar {filepath}: {e}")
    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```(?:[a-zA-Z]*)\n(.*?)\n```|`([^`]+)`)"
    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = (match.group(1) or match.group(2)).strip()
        if "rm -rf" in cmd.lower() or "del /s" in cmd.lower():
            logging.error(f"[SEC] Bloqueado: {cmd}")
            continue
        try:
            logging.info(f"[EXECUCAO] Rodando: {cmd}")
            subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
        except Exception as e: logging.error(f"[FAIL] Erro no comando {cmd}: {e}")

def process_agent_task(task: Task, manager: QueueManager):
    agent_clean = task.agent.replace("@", "")
    agent_memory = ""
    memory_file = Path(f".claude/agent-memory/{agent_clean}/MEMORY.md")
    if memory_file.exists():
        with open(memory_file, "r", encoding="utf-8") as f: agent_memory = f.read()
    project_context = ""
    context_file = Path(".claude/project-context.md")
    if context_file.exists():
        with open(context_file, "r", encoding="utf-8") as f: project_context = f.read()
    user_prompt = f"== CONTEXTO ==\n{project_context[:6000]}\n== MEMORIA ==\n{agent_memory}\n== TAREFA ==\n{task.description}\n\nUse God Mode para materializar arquivos e comandos."
    system_prompt = get_agent_system_prompt(task.agent)
    response_text = call_llm_api(task.agent, system_prompt, user_prompt, manager)
    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    with open(result_dir / f"{task.id}.md", "w", encoding="utf-8") as f: f.write(response_text)
    apply_god_mode(response_text)

def execute_task_workflow(task: Task, manager: QueueManager):
    try:
        process_agent_task(task, manager)
        manager.update_task_status(task.id, "completed")
        logging.info(f"[OK] Simetria: {task.id}")
    except Exception as e:
        logging.error(f"[FAIL] Erro em {task.id}: {e}")
        manager.update_task_status(task.id, "failed")

def start_worker():
    manager = QueueManager()
    os.system('cls' if os.name == 'nt' else 'clear')
    logging.info("=== ORQUESTRADOR PYTHON SOTA INICIADO [scripts/ops/task_executor.py] ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        while True:
            task = manager.get_next_task()
            if task:
                manager.update_task_status(task.id, "running")
                executor.submit(execute_task_workflow, task, manager)
            else:
                print(f"\r[{datetime.now().strftime('%H:%M:%S')}] Aguardando tarefas...", end="", flush=True)
                time.sleep(5)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd, manager = sys.argv[1], QueueManager()
        if cmd == "add":
            try:
                task_payload = sys.argv[2]
                task_json = task_payload if task_payload.startswith("{") else base64.b64decode(task_payload).decode("utf-8")
                new_task = Task.model_validate_json(task_json)
                manager.add_task(new_task)
                print(f"SUCCESS: {new_task.id}")
            except Exception as e: print(f"ERROR: {e}"); sys.exit(1)
        elif cmd == "get":
            task_id = sys.argv[2]
            task = manager.get_task(task_id)
            if task: print(json.dumps(task.model_dump(), indent=2))
            else: print(f"ERROR: Task {task_id} not found.")
        elif cmd == "worker": start_worker()
    else: start_worker()
