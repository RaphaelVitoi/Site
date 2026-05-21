import os
import sys
import time
import json
import base64
import logging
import concurrent.futures
from pathlib import Path
from datetime import datetime
from pydantic import ValidationError

from core.schemas import Task
from database.queue_manager import QueueManager
from engine.cognitive import process_agent_task
from engine.god_mode import apply_god_mode, get_autonomy_mode
from utils.notifications import send_toast
from utils.audit import write_economic_log
from api.server import start_api_server

# Configuracao estetica e persistente de Log (Estado da Arte)
log_dir = Path(".claude/logs")
log_dir.mkdir(parents=True, exist_ok=True)
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

def execute_task_workflow(task: Task, manager: QueueManager):
    start_time = time.time()
    try:
        process_agent_task(task, manager)
        manager.update_task_status(task.id, "completed")
        logging.info(f"[OK]  Simetria: [{task.id}] -> COMPLETED")
        
        duration = time.time() - start_time
        write_economic_log(task, duration, "COMPLETED")
        
        priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
        if priority in ["high", "critical"]:
            send_toast(f"Simetria ({priority.upper()})", f"A tarefa critica foi concluida pelo {task.agent}.", "success")
        
        # Auto-Handoff
        autonomy_mode = get_autonomy_mode()
        if autonomy_mode != "off" and not task.id.startswith("AUTOFIX") and task.agent != "@dispatcher":
            pipeline = {
                "@architect": "@pesquisador",
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
                    logging.info(f"[AUTONOMIA PARCIAL] Fluxo pausado. A etapa critica exige comando manual.")
                else:
                    handoff_id = f"HANDOFF-{task.id[-10:]}-{next_agent.strip('@').upper()}"
                    if not manager.get_task(handoff_id):
                        new_task = Task(id=handoff_id, description=f"O agente {task.agent} concluiu sua etapa na tarefa base {task.id}. Analise o resultado gerado em '.claude/task_results/{task.id}.md' e execute a sua etapa de {next_agent}.", agent=next_agent, timestamp=datetime.now().isoformat())
                        manager.add_task(new_task)
                        logging.info(f"[AUTO-HANDOFF] O bastao foi passado para {next_agent}.")
    except Exception as e:
        logging.error(f"[FAIL] Falha: [{task.id}] -> FAILED ({e})")
        manager.update_task_status(task.id, "failed")
        duration = time.time() - start_time
        write_economic_log(task, duration, "FAILED")
        send_toast("Entropia Sistemica (CRITICAL)", f"Falha na tarefa do {task.agent}.", "error")
        
        is_system_task = task.id.startswith("AUTOFIX-") or task.id.startswith("RESONANCE-")
        if not is_system_task:
            try:
                fix_id = f"AUTOFIX-{task.id}"
                if not manager.get_task(fix_id):
                    fix_task = Task(id=fix_id, description=f"[SYSTEM AUTODEBUG] A tarefa original '{task.id}' executada por {task.agent} falhou com a excecao: {e}.\n\n---\nTarefa Original:\n{task.description}\n---\n\nATENCAO: Avalie o erro ocorrido, aplique a autocorrecao tecnica e re-execute.", model=task.agent, agent=task.agent, timestamp=datetime.now().isoformat())
                    manager.add_task(fix_task)
                    logging.info(f"[AUTODEBUGGER] Auto-Cura acionada! Tarefa {fix_id} injetada na fila.")
            except Exception as debug_error:
                logging.error(f"[FAIL] Falha fatal no Nucleo de Autodebugging: {debug_error}")
                
            try:
                resonance_id = f"RESONANCE-{task.id}"
                if not manager.get_task(resonance_id):
                    resonance_task = Task(id=resonance_id, description=f"[AUDITORIA FRACTAL] A tarefa '{task.id}' do {task.agent} quebrou com erro: {e}.\nDiretriz Holistica: 1. Faca a antevisao da causa raiz. 2. Identifique os impactos. 3. Proponha uma otimizacao estrutural para que o erro nao se repita.", agent="@maverick", timestamp=datetime.now().isoformat(), metadata={"priority": "high"})
                    manager.add_task(resonance_task)
                    logging.info(f"[RESSONANCIA FRACTAL] Maverick ativado. O sistema aprendera com esse erro.")
            except Exception as res_error:
                logging.error(f"[FAIL] Falha ao acionar Ressonancia: {res_error}")

def start_worker():
    manager = QueueManager()
    os.system('cls' if os.name == 'nt' else 'clear')
    counts = manager.get_task_counts()
    pending = counts.get("pending", 0)
    
    W, R = "\033[97m", '\033[0m'
    print(f"{W}==========================================================={R}", flush=True)
    print(f"{W}         CHICO SYSTEM - ORQUESTRADOR PYTHON SOTA           {R}", flush=True)
    print(f"{W}==========================================================={R}", flush=True)
    print(f"{W} PENDENTES: {pending} | RODANDO: {counts.get('running',0)} | COMPLETAS: {counts.get('completed',0)} | FALHAS: {counts.get('failed',0)}{R}", flush=True)
    print(f"{W}===========================================================\n{R}", flush=True)
    
    logging.info("=== ORQUESTRADOR PYTHON INICIADO [MULTITHREAD] ===")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        try:
            while True:
                try:
                    counts = manager.get_task_counts()
                    if os.name == "nt":
                        import ctypes
                        ctypes.windll.kernel32.SetConsoleTitleW(f"NEXUS WORKER | Pendentes: {counts.get('pending', 0)} | Pulso: {datetime.now().strftime('%H:%M:%S')}")
                    
                    task = manager.get_next_task()
                    if task:
                        logging.info(f"[>>>] Metamorfose: [{task.id}] -> RUNNING (Agente:{task.agent})")
                        manager.update_task_status(task.id, "running")
                        executor.submit(execute_task_workflow, task, manager)
                    else:
                        print(f"\r\033[K[{datetime.now().strftime('%H:%M:%S')}] [VIGILIA] Pendentes: {counts.get('pending',0)} | Rodando: {counts.get('running',0)} | Concluidas: {counts.get('completed',0)} | Falhas: {counts.get('failed',0)} (Aguardando...)", end="", flush=True)
                        time.sleep(5)
                except Exception as inner_e:
                    logging.error(f"[FATAL] Erro interno no laco: {inner_e}")
                    time.sleep(5)
        except KeyboardInterrupt:
            logging.info("Pulso encerrado pelo usuario. Hibernando...")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd, manager = sys.argv[1], QueueManager()
        if cmd =="db-init": manager._init_db(); print("SUCCESS: Database initialized.")
        elif cmd in ["db-add", "add"]:
            try:
                task_json = sys.argv[2] if sys.argv[2].startswith("{") else base64.b64decode(sys.argv[2]).decode("utf-8")
                new_task = Task.model_validate_json(task_json)
                manager.add_task(new_task); print(f"SUCCESS: {new_task.id}")
            except Exception as e: print(f"ERROR: {e}"); sys.exit(1)
        elif cmd == "db-get":
            status = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "all" else None
            print(json.dumps([t.model_dump() for t in manager.get_tasks(status)]))
        elif cmd == "get": print(json.dumps(manager.get_task(sys.argv[2]).model_dump(), indent=2) if manager.get_task(sys.argv[2]) else f"ERROR: Not found.")
        elif cmd == "db-cleanup": manager.cleanup(int(sys.argv[2]) if len(sys.argv) > 2 else 30); print("SUCCESS: Cleanup done.")
        elif cmd == "db-delete": manager.delete_task(sys.argv[2]); print(f"SUCCESS: Tarefa obliterada.")
        elif cmd == "server": start_api_server(manager, int(sys.argv[2]) if len(sys.argv) > 2 else 17042)
        elif cmd == "worker": start_worker()
    else: start_worker()