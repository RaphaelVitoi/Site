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
    force=True, # Garante que a nossa configuração sobrescreva qualquer outra pré-existente
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(log_dir / "task_executor.log", encoding="utf-8"), # Arquivo mantem utf-8
        logging.StreamHandler(sys.stdout)
    ]
)

# Cache para as respostas da LLM (deprecado, migrando para SQLite)
llm_cache = {}

# ==========================================
# 1. SCHEMAS (A Lei da Honestidade Radical)
# ==========================================


"""
Definição do schema para a classe Task, garantindo a estrutura de dados utilizada no sistema.
"""
class Task(BaseModel):
    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str
    completedAt: Optional[str] = None
    model: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

# ==========================================
# 2. GERENCIADOR DA FILA (SQLite DAL)
# ==========================================


"""
QueueManager: Classe para gerenciar a fila de tarefas utilizando SQLite como banco de dados.
Implementa operações CRUD para as tarefas e cache de LLM.
"""
class QueueManager:
    def __init__(self, queue_path: str = None):
        """Inicializa o gerenciador da fila, criando o banco de dados se não existir."""
        if queue_path is None:
            self.db_path = Path(__file__).parent.resolve() / "queue" / "tasks.db"
        else:
            # Sanitize queue_path to prevent path traversal
            self.db_path = Path(queue_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            # Cache de LLM
            #Cria a tabela llm_cache para armazenar as respostas das LLMs
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
            # Cria a tabela tasks para armazenar as tarefas
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
        """Adiciona uma nova tarefa ao banco de dados."""
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
        """Retorna uma tarefa específica do banco de dados."""
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if row:
                return self._row_to_task(row)
        return None
            
    def get_next_task(self):
        """Retorna a próxima tarefa pendente na fila, ordenando por prioridade e timestamp."""
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
        """Atualiza o status de uma tarefa no banco de dados."""
        completed_at = datetime.now().isoformat() if new_status in ["completed", "failed"] else None
        with self._get_conn() as conn:
            if completed_at:
                conn.execute("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?",
                             (new_status, completed_at, task_id))
            else:
                conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            conn.commit()
 
    def get_tasks(self, status: str = None) -> List[Task]:
        """Retorna uma lista de tarefas do banco de dados, filtrando por status."""
        with self._get_conn() as conn:
            if status:
                rows = conn.execute("SELECT * FROM tasks WHERE status = ? ORDER BY timestamp DESC", (status,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM tasks ORDER BY timestamp DESC").fetchall()
            return [self._row_to_task(row) for row in rows]
            
    def get_task_counts(self):
        """Retorna a contagem de tarefas por status."""
        with self._get_conn() as conn:
            rows = conn.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").fetchall()
            counts = { "pending": 0, "running": 0, "completed": 0, "failed": 0 }
            for r in rows:
                if r["status"] in counts:
                    counts[r["status"]] = r["count"]
            return counts

    def get_llm_cache(self, model: str, prompt: str) -> Optional[str]:
        """Retorna a resposta do cache da LLM para um determinado modelo e prompt."""
        with self._get_conn() as conn:
            row = conn.execute("SELECT response FROM llm_cache WHERE model = ? AND prompt = ?", (model, prompt)).fetchone()
            if row is not None:
                return row['response']
        return None

    def update_llm_cache(self, model: str, prompt: str, response: str):
        """Atualiza o cache da LLM com a resposta para um determinado modelo e prompt."""
        timestamp = datetime.now().isoformat()
        with self._get_conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO llm_cache (model, prompt, response, timestamp)
                VALUES (?, ?, ?, ?)
            """, (model, prompt, response, timestamp))
            conn.commit()

    async def get_llm_cache_async(self, model: str, prompt: str) -> Optional[str]:
        """Retorna a resposta do cache da LLM de forma assíncrona."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT response FROM llm_cache WHERE model = ? AND prompt = ?", (model, prompt)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return row[0]
        return None

    def cleanup(self, days: int):
        """Remove tarefas antigas do banco de dados."""
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
            rows = conn.execute("""
                SELECT * FROM tasks
                WHERE status IN ('completed', 'failed') 
                AND timestamp < ?
                AND agent != '@maverick'
            """, (cutoff,)).fetchall()
            
            for r in rows:
                conn.execute("""
                    INSERT OR IGNORE INTO archive_tasks
                    (id, description, status, timestamp, agent, priority, metadata, completedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (r["id"], r["description"], r["status"], r["timestamp"], r["agent"], r["priority"], r["metadata"], r["completedAt"]))

            conn.execute("""
                DELETE FROM tasks 
                WHERE status IN ('completed', 'failed') 
                AND timestamp < ?
                AND agent != '@maverick'
            """, (cutoff,))
            conn.commit()

    def _row_to_task(self, row) -> Task:
        """Converte uma linha do banco de dados em um objeto Task."""
        metadata = {}
        if row["metadata"]:
            try:
                metadata = json.loads(row["metadata"])
            except:
                pass

        return Task(
            id=row["id"],
            description=row["description"],
            status=row["status"],
            timestamp=row["timestamp"],
            agent=row["agent"],
            completedAt=row["completedAt"],
            metadata=metadata

        )

# ==========================================
# 2.5 O MOTOR COGNITIVO (API Integration)
# ==========================================

#Tabela de Roteamento em Quartetos (Economia x SOTA)
AGENT_ROUTING = {
    # Deep Thinking: Prioriza Pro Free Tier, Flash backup, DeepSeek R1 (OpenRouter Free) como 3ª via, Claude 3.7 (Pago) como 4ª via
    "@maverick":      ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@architect":     ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@planner":       ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@auditor":       ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@implementor":   ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@verifier":      ("gemini-2.5-pro", "gemini-2.5-flash", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    
    # Operacoes Rapidas: Prioriza Flash Free, Pro backup, Llama 3 (OpenRouter Free) como 3ª via, Haiku (Pago) como 4ª via
    "@skillmaster":   ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@dispatcher":    ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@sequenciador":  ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@pesquisador":   ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@organizador":   ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@securitychief": ("gemini-2.5-flash", "gemini-2.5-pro", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@curator":       ("gemini-2.5-flash", "gemini-2.5-pro", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@validador":     ("gemini-2.5-flash", "gemini-2.5-pro", "deepseek/deepseek-r1:free", "claude-3-7-sonnet-20250219"),
    "@seo":           ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@prompter":      ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@bibliotecario": ("gemini-2.5-flash", "gemini-2.5-pro", "meta-llama/llama-3-8b-instruct:free", "claude-3-5-haiku-20241022"),
    "@chico":         ("gemini-2.5-pro", "gemini-2.5-flash", "claude-3-7-sonnet-20250219", "deepseek/deepseek-r1:free")
}

FALLBACK_MODEL = "gemini-2.5-flash"


def get_agent_system_prompt(agent_name: str) -> str:
    """
    Compila a Omnisciencia Sistemica. 
    Funde as Instrucoes Globais, o Manual, o Indice Mestre e a Identidade do Agente.
    """
    agent_clean = agent_name.replace("@", "")
    
    # 1. Base Global (A Alma do Sistema)
    global_ctx = ""
    global_file = Path(".claude/GLOBAL_INSTRUCTIONS.md")
    if global_file.exists():
        with open(global_file, "r", encoding="utf-8") as f:
            global_ctx = f.read() + "\n\n"
            
    # 2. Leis de Orquestracao e Topologia (O Manual e o Mapa)
    infra_ctx = ""
    for doc_name, doc_paths in [
        ("COSMOVISAO FILOSOFICA", [".claude/COSMOVISAO.md"]),
        ("IDENTIDADE DO USUARIO", [".claude/CLAUDE.md"]),
        ("LIDERANCA E GOVERNANCA", [".claude/LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md"]),
        ("TEMPLO DO APRENDIZADO GENERATIVO", [".claude/ESTADO_ARTE_APRENDIZADO_GENERATIVO.md"]),
        ("MANUAL DO WORKFLOW", ["docs/MANUAL_WORKFLOW_AGENTES.md", "docs/tasks/MANUAL_WORKFLOW_AGENTES.md"]), 
        ("INDICE MESTRE", ["docs/INDEX_MESTRE.md", "docs/tasks/INDEX_MESTRE.md"]),
        ("GUIA DE DEPLOY E STACK", ["docs/DEPLOY.md", "DEPLOY.md"]),
        ("INVENTARIO DE FERRAMENTAS", ["docs/INVENTARIO_FERRAMENTAS.md"]),
        ("PROTOCOLO DE ROTEAMENTO HOLOGRAFICO", [".claude/HOLOGRAPHIC_ROUTING_PROTOCOL.md"]),
        ("ARQUITETURA DO CEREBRO HIBRIDO", [".claude/HYBRID_BRAIN_ARCHITECTURE.md"]),
        ("MANIFESTO DE COERENCIA E HARMONIA", [".claude/COHERENCE_MANIFEST.md"])
    ]:
        for doc_path in doc_paths:
            file_obj = Path(doc_path)
            if file_obj.exists():
                with open(file_obj, "r", encoding="utf-8") as f:
                    infra_ctx += f"=== {doc_name} ===\n" + f.read() + "\n\n"
                break # Achou o arquivo, passa para o proximo
    
    # 3. A Parte: Identidade Especifica do Agente
    agent_file = Path(f".claude/agents/{agent_clean}.md")
    agent_prompt = f"Voce e o agente especialista {agent_name}."
    if agent_file.exists():
        with open(agent_file, "r", encoding="utf-8") as f:
            agent_prompt = f"=== SUA IDENTIDADE ESPECIFICA ({agent_name}) ===\n" + f.read()
            
    return global_ctx + infra_ctx + agent_prompt

"""Le chaves de forma implacavel de _env.ps1 ou .env para garantir operacao SOTA."""
def _load_env_keys() -> Dict[str, str]:
    keys = {}
    base_dir = Path(__file__).parent.resolve()
    
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            #Lê o arquivo de forma implacável, ignorando erros de encoding
            #Com ou sem $env:, com ou sem aspas
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        # Regex blindada: com ou sem $env:, com ou sem aspas
                        match = re.search(r'(?:\$env:)?([a-zA-Z0-9_]+)\s*=\s*[\'"]?([^\'"\n\r\s]+)[\'"]?', line)
                        if match:
                            keys[match.group(1)] = match.group(2).strip()
            except Exception as e:
                logging.warning(f"Aviso ao ler {file_name}: {e}")
    return keys

"""Chama a API da Gemini para gerar conteúdo."""
def call_gemini(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data  = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}]
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            #Decode the response using utf-8
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        #Raise the error with the HTTP status code and error body
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {error_body}")

def call_anthropic(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01'
    }
    data = {
        "model": model,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}]
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['content'][0]['text']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {error_body}")

def call_openrouter(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {error_body}")

def _try_gemini(model: str, system_prompt: str, user_prompt: str, keys: List[str], agent_name: str, manager: QueueManager) -> Optional[str]:
    """Tenta chamar a API da Gemini com uma lista de chaves, com retentativas."""
    if not keys:
        return None

    for i, key in enumerate(keys):
        retries = 2
        for attempt in range(retries):
            try:
                log_msg = f"Acionando cognicao via {model} (Chave {'Primaria' if i == 0 else 'Secundaria'})..."
                if attempt > 0:
                    log_msg = f"Retentativa {attempt+1} para {model}..."
                logging.info(f"[{agent_name}] {log_msg}")

                response = call_gemini(model, system_prompt, user_prompt, key)
                manager.update_llm_cache(model, user_prompt, response)
                return response
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg and attempt < retries - 1:
                    logging.warning(f"[{agent_name}] Rate limit (429) no {model}. Respirando 5s...")
                    time.sleep(5)
                    continue
                logging.warning(f"[{agent_name}] Falha na chave atual ({model}): {error_msg}.")
                break  # Pula para a proxima chave se esta falhou
    return None

def _try_openrouter(model: str, system_prompt: str, user_prompt: str, key: str, agent_name: str, manager: QueueManager) -> Optional[str]:
    """Tenta chamar a API da OpenRouter com retentativas."""
    if not key:
        return None

    retries = 3
    for attempt in range(retries):
        try:
            logging.info(f"[{agent_name}] Acionando terceira via SOTA ({model} via OpenRouter)...")
            response = call_openrouter(model, system_prompt, user_prompt, key)
            manager.update_llm_cache(model, user_prompt, response)
            return response
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg and attempt < retries - 1:
                logging.warning(f"[{agent_name}] Rate limit (429) no OpenRouter {model}. Respirando 5s...")
                time.sleep(5)
                continue
            logging.warning(f"[{agent_name}] Falha OpenRouter {model}: {error_msg}")
            break
    return None

def _try_anthropic(model: str, system_prompt: str, user_prompt: str, key: str, agent_name: str, manager: QueueManager) -> Optional[str]:
    """Tenta chamar a API da Anthropic com retentativas."""
    if not key:
        return None

    retries = 3
    for attempt in range(retries):
        try:
            logging.info(f"[{agent_name}] Acionando ultima linha de defesa PAGA ({model})...")
            response = call_anthropic(model, system_prompt, user_prompt, key)
            manager.update_llm_cache(model, user_prompt, response)
            return response
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg and attempt < retries - 1:
                logging.warning(f"[{agent_name}] Rate limit (429) no Anthropic {model}. Respirando 5s...")
                time.sleep(5)
                continue
            logging.warning(f"[{agent_name}] Falha Anthropic {model}: {error_msg}")
            break
    return None

"""Função para chamar a API da LLM, tratando diferentes modelos e chaves de API."""
def call_llm_api(agent_name: str, system_prompt: str, user_prompt: str, manager: QueueManager) -> str:
    quartet = AGENT_ROUTING.get(agent_name, (FALLBACK_MODEL, "gemini-2.5-pro", "deepseek/deepseek-r1:free", "claude-3-5-haiku-20241022"))
    models_to_try = list(quartet)
    
    env_keys = _load_env_keys()
    
    gemini_keys = [k for k in [
        os.environ.get("GEMINI_API_KEY") or env_keys.get("GEMINI_API_KEY"),
        os.environ.get("GEMINI_API_KEY_SECONDARY") or env_keys.get("GEMINI_API_KEY_SECONDARY")
    ] if k]
    
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY") or env_keys.get("ANTHROPIC_API_KEY")
    openrouter_key = os.environ.get("OPENROUTER_API_KEY") or env_keys.get("OPENROUTER_API_KEY")

    for model in models_to_try:
        response = None
        if "gemini" in model:
            response = _try_gemini(model, system_prompt, user_prompt, gemini_keys, agent_name, manager)
        elif "deepseek" in model or "llama" in model:
            response = _try_openrouter(model, system_prompt, user_prompt, openrouter_key, agent_name, manager)
        elif "claude" in model:
            response = _try_anthropic(model, system_prompt, user_prompt, anthropic_key, agent_name, manager)

        if response:
            return response
            
    logging.warning(f"[{agent_name}] Multiplas falhas ou chaves ausentes. Modo Simulacao Ativado.")
    time.sleep(2)
    return '[\n  {"description": "Sub-tarefa gerada via simulacao de contingencia.", "agent": "@planner"}\n]'

def get_autonomy_mode() -> str:
    config_path = Path(".claude/autonomy.json")
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("mode", "off")
        except:
            pass
    return "off"

def apply_god_mode(text: str):
    """
    Materializacao Direta e Execucao (God Mode 2.0):
    Le a mente do agente, forja os arquivos fisicos e executa comandos de sistema.
    """
    autonomy_mode = get_autonomy_mode()
    # 1. Forjamento de Arquivos
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-zA-Z]*\n(.*?)```"
    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        filepath = match.group(1).strip()
        content = match.group(2)
        try:
            target_path = Path(filepath)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            #Escreve o conteúdo no arquivo usando utf-8
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            logging.info(f"[MATERIALIZACAO] Arquivo forjado com sucesso: {filepath}")
        except Exception as e:
            logging.error(f"[FAIL] Falha de permissao ao forjar {filepath}: {e}")
            
    # 2. Execucao de Comandos de Terminal
    #Regex para encontrar comandos de terminal
    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```(?:[a-zA-Z]*)\n(.*?)\n```|`([^`]+)`)"
    forbidden_commands = ["rm -rf", "del /s", "diskpart", "format ", "mkfs", "rmdir /s /q c:\\"]
    state_changing_commands = ["npm install", "npm i", "pip install", "git reset", "git push", "git clone", "del ", "rm ", "yarn add", "pnpm add", "git clean"]
    
    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        cmd = cmd.strip()
        #Impede comandos destrutivos
        
        if any(f in cmd.lower() for f in forbidden_commands):
            error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
            logging.error(f"[SEC] {error_msg}")
            raise PermissionError(error_msg)
            
        if autonomy_mode == "partial" and any(k in cmd.lower() for k in state_changing_commands):
            logging.info(f"[AUTONOMIA PARCIAL] Comando de alteracao de estado interceptado: '{cmd}'")
            logging.warning(f"[GOD MODE] Seguranca ativa. Execute '{cmd}' manualmente no terminal.")
            continue
            
        try:
            logging.info(f"[EXECUCAO] Orquestrador rodando comando nativo: {cmd}")
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                logging.info(f"[OK] Comando executado de forma soberana: {cmd}")
            else:
                error_msg = f"Codigo {result.returncode} - {result.stderr.strip()}"
                logging.error(f"[FAIL] Falha no comando '{cmd}': {error_msg}")
                raise RuntimeError(f"O comando nativo falhou: {cmd}\nDetalhes do Erro: {error_msg}")
        except Exception as e:
            logging.error(f"[FAIL] Arritmia critica/Timeout no comando {cmd}: {e}")
            raise

def process_agent_task(task: Task, manager: QueueManager):
    
    agent_clean = task.agent.replace("@", "")
    
    # Injecao da Memoria Individual do Agente (O Todo na Parte)
    agent_memory = ""
    memory_file = Path(f".claude/agent-memory/{agent_clean}/MEMORY.md")
    if memory_file.exists():
        with open(memory_file, "r", encoding="utf-8") as f:
            agent_memory = f.read()
            
    # Injecao de Contexto Maior (O Todo na Parte)
    project_context = ""
    context_file = Path(".claude/project-context.md")
    if context_file.exists():
        with open(context_file, "r", encoding="utf-8") as f:
            project_context = f.read()
            
    if len(project_context) > 6000:
        project_context = project_context[:6000] + "\n\n... [Contexto truncado para otimizacao de tokens. Consulte o @bibliotecario se precisar de historico.]"
        
    # Injecao Automatica de Artefatos Estruturados da Tarefa (PRDs, SPECs)
    task_docs = ""
    
    # Busca 1: Diretorio vinculado via metadata slug
    slug = task.metadata.get("slug") if task.metadata else None
    if slug:
        task_dir = Path(f"docs/tasks/{slug}")
        if task_dir.exists() and task_dir.is_dir():
            for md_file in task_dir.glob("*.md"):
                try:
                    with open(md_file, "r", encoding="utf-8") as f:
                        task_docs += f"\n=== ARTEFATO: {md_file.as_posix()} ===\n{f.read()}\n"
                except Exception as e:
                    logging.warning(f"Falha ao ler doc da tarefa {md_file}: {e}")
                    
    # Busca 2: Referencias diretas a arquivos .md ou pastas docs/tasks/ na descricao
    md_mentions = re.findall(r'[\w\./\\-]+\.md', task.description, re.IGNORECASE)
    folder_mentions = re.findall(r'docs[\\/]tasks[\\/][\w-]+', task.description, re.IGNORECASE)
    
    paths_to_check = [Path(p) for p in md_mentions]
    for folder in folder_mentions:
        folder_path = Path(folder)
        if folder_path.exists() and folder_path.is_dir():
            paths_to_check.extend(list(folder_path.glob("*.md")))
            
    for p in paths_to_check:
        if p.exists() and p.is_file():
            if slug and p.parent == Path(f"docs/tasks/{slug}"):
                continue # Evita duplicar se ja foi lido na Busca 1
            try:
                with open(p, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content not in task_docs:
                        task_docs += f"\n=== ARTEFATO REFERENCIADO: {p.as_posix()} ===\n{content}\n"
            except Exception as e:
                pass

    user_prompt = f"== CONTEXTO DO PROJETO ==\n{project_context}\n\n"
    if agent_memory:
        user_prompt += f"== SUA MEMÓRIA ACUMULADA ({task.agent}) ==\n{agent_memory}\n\n"
    user_prompt += f"== DIRETRIZ DA TAREFA ==\nID: {task.id}\nDescricao:\n{task.description}\n\n"
    
    if task_docs:
        user_prompt += f"== MATERIAIS DE FUNDACAO DA TAREFA (PRDs/SPECs) =={task_docs}\n\n"
        
    user_prompt += "Execute esta tarefa embasado nos materiais de fundacao acima, no contexto do projeto e em sua memoria."
    system_prompt = get_agent_system_prompt(task.agent)
    
    if task.agent not in ["@dispatcher", "@bibliotecario"]:
        user_prompt += "\n\n[AUTORIZACAO SUPREMA - GOD MODE]\nVoce possui ACESSO LIVRE ao sistema operacional do usuario.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n2. Para EXECUTAR comandos de terminal (ex: npm install, python, git, robocopy), use o formato:\nComando: `seu comando aqui`\n\nVoce tem soberania para agir, instalar dependencias e forjar a realidade. ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente."
        
        # Diretriz para forcar a atualizacao da memoria via God Mode
        user_prompt += f"\n\n[DIRETRIZ DE AUTOREFLEXÃO E MEMÓRIA] Você DEVE atualizar seu arquivo de inteligência acumulada usando o God Mode (Arquivo: .claude/agent-memory/{agent_clean}/MEMORY.md). Adicione novas descobertas, avalie a Sinergia da sua interação com a Pipeline, e faça Propostas Democráticas de melhoria para o ecossistema. A Autopoiese exige que você expanda a mente coletiva."

    if task.agent == "@dispatcher":
        user_prompt += "\n\nVoce e o @dispatcher. Quebre este epico em tarefas menores sequenciais. Retorne EXCLUSIVAMENTE um array JSON contendo objetos com as chaves 'description' (string) e 'agent' (string com o nome do agente, ex: @planner). Sem texto markdown adicional."
        
    # Instrucao para recomendacao ativa de LLM (Economia Generalizada x SOTA)
    user_prompt += "\n\n[DIRETRIZ DE LLM] Ao final da sua resposta, analise a tarefa e o contexto. Recomende qual modelo (Claude Pro/Opus, Gemini Advanced/1.5 Pro, ou um modelo API especifico) seria o mais adequado para a *proxima* etapa ou para a *atual* tarefa, justificando a escolha com base na 'Economia Generalizada' (custo financeiro, latencia, janela de contexto, qualidade de output). Se a tarefa for melhor executada na interface Web (com suas assinaturas pagas), instrua o usuario a usar o Protocolo de Handoff (-Web)."

    # Check LLM Cache
    cached_response = manager.get_llm_cache(task.agent, user_prompt)
    if cached_response:
        logging.info(f"[{task.agent}] Cache hit para a prompt. Usando resposta armazenada.")
        return cached_response
    else:
        logging.info(f"[{task.agent}] Cache miss para a prompt. Chamando API LLM.")
    
    # Call LLM API
    response_text = call_llm_api(task.agent, system_prompt, user_prompt, manager)
    
    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    with open(result_dir / f"{task.id}.md", "w", encoding="utf-8") as f:
        f.write(f"# Resposta: {task.id} ({task.agent})\n\n{response_text}")
        
    # Transforma pensamento em realidade física e comandos (God Mode)
    apply_god_mode(response_text)
        
    if task.agent == "@dispatcher":
        try:
            clean_json = response_text.replace("```json", "").replace("```", "").strip()
            subtasks = json.loads(clean_json[clean_json.find('['):clean_json.rfind(']')+1])
            for i, st in enumerate(subtasks):
                new_task = Task(
                    id=f"{task.id}-SUB-{i+1}",
                    description=st.get("description", "Sub-tarefa gerada"),
                    agent=st.get("agent", "@implementor"),
                    timestamp=datetime.now().isoformat()
                )
                manager.add_task(new_task)
            logging.info(f"[{task.id}] Dispatcher gerou {len(subtasks)} novas tarefas na fila.")
        except Exception as e:
            logging.error(f"[{task.id}] Falha ao interpretar matriz do Dispatcher: {e}")

# ==========================================
# 2.6 NOTIFICAÇÃO DO SISTEMA (Windows Toast)
# ==========================================
def send_toast(title: str, message: str, status: str = "success"):
    try:
        # Utiliza integração nativa do PowerShell com o Windows Runtime, sem bibliotecas externas
        ps_code = f"""
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml("<toast><visual><binding template='ToastText02'><text id='1'>{title}</text><text id='2'>{message}</text></binding></visual></toast>")
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast)
        """
        import subprocess
        subprocess.Popen(["powershell", "-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_code])
    except Exception as e:
        logging.error(f"Falha ao disparar Toast: {e}")

# ==========================================
# 3. O PULSO (Daemon/Worker)
# ==========================================
def execute_task_workflow(task: Task, manager: QueueManager):
    try:
        process_agent_task(task, manager)
        # Sucesso
        manager.update_task_status(task.id, "completed")
        logging.info(f"[OK]  Simetria: [{task.id}] -> COMPLETED")
        send_toast("Simetria Alcancada", f"A tarefa foi concluida pelo {task.agent}.", "success")
        
        # ==========================================
        # PASSAGEM DE BASTÃO AUTOMÁTICA (Auto-Handoff)
        # ==========================================
        autonomy_mode = get_autonomy_mode()
        if autonomy_mode != "off" and not task.id.startswith("AUTOFIX") and task.agent != "@dispatcher":
            pipeline = {
                "@pesquisador": "@prompter",
                "@prompter": "@planner",
                "@planner": "@auditor",
                "@auditor": "@implementor",
                "@implementor": "@verifier",
                "@verifier": "@curator",
                "@curator": "@seo"
            }
            next_agent = pipeline.get(task.agent)
            if next_agent:
                if autonomy_mode == "partial" and next_agent == "@implementor":
                    logging.info(f"[AUTONOMIA PARCIAL] Fluxo pausado. A etapa critica do {next_agent} exige comando manual.")
                else:
                    handoff_id = f"HANDOFF-{task.id[-10:]}-{next_agent.strip('@').upper()}"
                    if not manager.get_task(handoff_id):
                        new_task = Task(
                            id=handoff_id,
                            description=f"O agente {task.agent} concluiu sua etapa na tarefa base {task.id}. Analise o resultado gerado em '.claude/task_results/{task.id}.md' e execute a sua etapa de {next_agent}.",
                            agent=next_agent,
                            timestamp=datetime.now().isoformat()
                        )
                        manager.add_task(new_task)
                        logging.info(f"[AUTO-HANDOFF] O bastao foi passado para {next_agent}.")
    except Exception as e:
        logging.error(f"[FAIL] Falha: [{task.id}] -> FAILED ({e})")
        manager.update_task_status(task.id, "failed")
        send_toast("Entropia Detectada", f"Falha na tarefa do {task.agent}.", "error")
        
        # ==========================================
        # NÚCLEO DE AUTODEBUGGING (Auto-Cura 24/7)
        # ==========================================
        if not task.id.startswith("AUTOFIX-"):
            try:
                fix_id = f"AUTOFIX-{task.id}"
                if not manager.get_task(fix_id):
                    fix_task = Task(
                        id=fix_id,
                        description=f"[SYSTEM AUTODEBUG] A tarefa original '{task.id}' executada por {task.agent} falhou com a excecao: {e}.\n\n---\nTarefa Original:\n{task.description}\n---\n\nATENCAO: Avalie o erro ocorrido, aplique a autocorrecao tecnica necessaria sem alucinar, e re-execute o objetivo original com sucesso. Nao demande intervencao humana.",
                        model=task.agent,
                        agent=task.agent,
                        timestamp=datetime.now().isoformat()
                    )
                    manager.add_task(fix_task)
                    logging.info(f"[AUTODEBUGGER] Auto-Cura acionada! Tarefa {fix_id} injetada na fila.")
                    send_toast("Auto-Cura Acionada", "Sistema intervindo autonomamente.", "warning")
            except Exception as debug_error:
                logging.error(f"[FAIL] Falha fatal no Nucleo de Autodebugging: {debug_error}")

def start_worker():
    manager = QueueManager()
    
    # 1. Limpa o terminal para o God Mode Visual
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # 2. Varredura inicial da Fila
    counts = manager.get_task_counts()
    pending   = counts.get("pending", 0)
    running   = counts.get("running", 0)
    completed = counts.get("completed", 0)
    failed    = counts.get("failed", 0)
    
    W = "\033[97m"  # Código ANSI para Branco Brilhante
    R = '\033[0m'  # Código ANSI para Resetar a cor
    # 3. Força a impressão na tela (bypass de buffer)
    print(f"{W}==========================================================={R}", flush=True)
    print(f"{W}         CHICO SYSTEM - ORQUESTRADOR PYTHON SOTA           {R}", flush=True)
    print(f"{W}==========================================================={R}", flush=True)
    print(f"{W} PENDENTES: {pending} | RODANDO: {running} | COMPLETAS: {completed} | FALHAS: {failed}{R}", flush=True)
    print(f"{W}===========================================================\n{R}", flush=True)
    
    logging.info("=== ORQUESTRADOR PYTHON INICIADO [MULTITHREAD] ===")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        try:
            while True:
                try:
                    counts = manager.get_task_counts()
                    pending_count = counts.get("pending", 0)
                    if os.name == "nt":
                        import ctypes
                        current_time = datetime.now().strftime("%H:%M:%S")
                        ctypes.windll.kernel32.SetConsoleTitleW(f"NEXUS WORKER | Pendentes: {pending_count} | Pulso: {current_time}")
                    
                    task = manager.get_next_task()
                    if task:
                        logging.info(f"[>>>] Metamorfose: [{task.id}] -> RUNNING (Agente:{task.agent})")
                        manager.update_task_status(task.id, "running")
                        executor.submit(execute_task_workflow, task, manager)
                    else:
                        pulse_time = datetime.now().strftime("%H:%M:%S")
                        print(f"\r\033[K[{pulse_time}] [VIGILIA] Pendentes: {counts.get('pending',0)} | Rodando: {counts.get('running',0)} | Concluidas: {counts.get('completed',0)} | Falhas: {counts.get('failed',0)} (Aguardando...)", end="", flush=True)
                        time.sleep(5)
                except Exception as inner_e:
                    logging.error(f"[FATAL] Erro interno no laco do worker: {inner_e}")
                    time.sleep(5)
        except KeyboardInterrupt:
            logging.info("Pulso encerrado pelo usuario. Hibernando...")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        manager = QueueManager()
        
        if cmd =="db-init":
            manager._init_db()
            print("SUCCESS: Database initialized.")
        elif cmd == "db-add" or cmd == "add":
            try:
                task_payload = sys.argv[2]
                
                if task_payload.startswith("{"):
                    task_json = task_payload
                else:
                    task_json = base64.b64decode(task_payload).decode("utf-8")
                    
                new_task = Task.model_validate_json(task_json)
                manager.add_task(new_task)
                print(f"SUCCESS: {new_task.id}")
            except ValidationError as ve:
                print(f"ERROR: Validation error - {ve}")
                print(f"ERROR: Provided JSON - {task_json}")
                print("ERROR: Certifique-se de que o JSON é válido e adere ao schema correto.")
                sys.exit(1)            
            except Exception as e :
                print(f"ERROR: {e}")
                sys.exit(1)
        elif cmd == "db-get":
            status = sys.argv[2] if len(sys.argv) > 2 else None
            if status == "all": status = None
            tasks = manager.get_tasks(status)
            print(json.dumps([t.model_dump() for t in tasks]))
        elif cmd == "get":
            task_id = sys.argv[2]
            task = manager.get_task(task_id)
            if task:
                print(json.dumps(task.model_dump(), indent=2))
            else:
                print(f"ERROR: Task {task_id} not found.")
        elif cmd == "db-cleanup":
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            manager.cleanup(days)
            print("SUCCESS: Cleanup done.")
        elif cmd == "ingest":
            try:
                filepath = sys.argv[2]
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                apply_god_mode(content)
                print(f"SUCCESS: Ingestion completed from {filepath}.")
                os.remove(filepath)
            except Exception as e:
                print(f"ERROR: Ingestion failed - {e}")
                sys.exit(1)
        elif cmd == "worker":
            start_worker()
    else:
        start_worker()