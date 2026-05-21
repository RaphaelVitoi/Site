import json
import time
from datetime import datetime
import os

# --- Caminhos dos Arquivos ---
QUEUE_PATH = os.path.join("queue", "tasks.json")
LOG_PATH = os.path.join("logs", "task_log.md")
POLLING_INTERVAL = 10  # Segundos

# --- Funções de Log ---
def log_message(task_id, message):
    """Registra uma mensagem no arquivo de log."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"**Task ID:** `{task_id}` | **Timestamp:** `{timestamp}`
- {message}

---
"
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(log_entry)
    print(log_entry)

# --- Funções de Manipulação da Fila ---
def get_tasks():
    """Lê todas as tarefas da fila."""
    try:
        with open(QUEUE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_tasks(tasks):
    """Escreve a lista de tarefas de volta para o arquivo."""
    with open(QUEUE_PATH, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=4)

def update_task_status(task_id, new_status):
    """Atualiza o status de uma tarefa específica."""
    tasks = get_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["status"] = new_status
            break
    write_tasks(tasks)

# --- Funções de Execução dos Agentes ---

def call_llm_api(prompt, task_id, agent_name):
    """
    Simula uma chamada a uma API de um grande modelo de linguagem (LLM).
    Em uma implementação real, esta função conteria a lógica para
    se comunicar com o serviço de IA (ex: Google Gemini, OpenAI GPT).
    """
    log_message(task_id, f"CHAMADA DE API (Simulada) para @{agent_name}...")
    # Simula o tempo de resposta da API
    time.sleep(7)
    # Retorna uma resposta simulada
    return f"Resposta simulada do LLM para a tarefa: '{prompt[:70]}...'"

def get_agent_instructions(agent_name):
    """Lê as instruções de um agente do seu arquivo de definição."""
    agent_path = os.path.join(".claude", "agents", f"{agent_name}.md")
    try:
        with open(agent_path, "r", encoding="utf-8") as f:
            content = f.read()
            parts = content.split('---', 2)
            return parts[2].strip() if len(parts) > 2 else content
    except FileNotFoundError:
        log_message("DISPATCHER_ERROR", f"Arquivo de definição para o agente @{agent_name} não encontrado em {agent_path}")
        return None

def execute_agent_task(agent_name, input_text, task_id):
    """Executa uma tarefa genérica de um agente, lendo suas instruções, chamando a API do LLM e registrando o progresso."""
    log_message(task_id, f"Agente @{agent_name} iniciado.")
    instructions = get_agent_instructions(agent_name)
    if not instructions:
        raise Exception(f"Não foi possível carregar as instruções do @{agent_name}.")

    full_prompt = f"{instructions}\n\nTAREFA:\n{input_text}"
    llm_response = call_llm_api(full_prompt, task_id, agent_name)
    log_message(task_id, f"Agente @{agent_name} concluído.")
    return llm_response

def run_pesquisador(prompt, task_id): return execute_agent_task("pesquisador", prompt, task_id)
def run_prompter(input_text, task_id): return execute_agent_task("prompter", input_text, task_id)
def run_planner(structured_prompt, task_id): return execute_agent_task("planner", structured_prompt, task_id)
def run_auditor(plan_docs, task_id): return execute_agent_task("auditor", plan_docs, task_id)
def run_implementor(audited_plan, task_id): return execute_agent_task("implementor", audited_plan, task_id)
def run_verifier(implementation, task_id): return execute_agent_task("verifier", implementation, task_id)
def run_validador(verified_content, task_id): return execute_agent_task("validador", verified_content, task_id)

# --- Loop Principal do Dispatcher ---
def main_loop():
    """O coração do dispatcher, que roda indefinidamente."""
    print("--- Master Dispatcher v5 iniciado. Monitorando a fila de tarefas... ---")
    while True:
        tasks = get_tasks()
        pending_task = next((task for task in tasks if task["status"] == "pending"), None)
        
        if pending_task:
            task_id = pending_task["id"]
            prompt = pending_task["prompt"]
            
            # 1. Marcar como em progresso
            log_message(task_id, f"Tarefa recebida. Iniciando processamento para o prompt: '{prompt}'")
            update_task_status(task_id, "in_progress")
            
            # 2. Executar o pipeline de agentes com lógica condicional
            try:
                log_message(task_id, "Agente @estrategista (interno) ativado. Analisando o prompt para definir o pipeline.")
                prompt_lower = prompt.lower()
                
                # Condição para pipeline completo com pesquisa
                if any(keyword in prompt_lower for keyword in ["aula", "pesquisar", "analisar", "estudar", "icm", "poker", "científico", "teoria"]):
                    log_message(task_id, "ESTRATEGISTA: Pipeline completo (com pesquisa de domínio) selecionado.")
                    research_report = run_pesquisador(prompt, task_id)
                    structured_prompt = run_prompter(research_report, task_id)
                    plan_docs = run_planner(structured_prompt, task_id)
                    audited_plan = run_auditor(plan_docs, task_id)
                    implementation = run_implementor(audited_plan, task_id)
                    verified_content = run_verifier(implementation, task_id)
                    final_result = run_validador(verified_content, task_id)
                
                # Condição para pipeline técnico direto
                else:
                    log_message(task_id, "ESTRATEGISTA: Pipeline técnico direto (sem pesquisa de domínio) selecionado.")
                    structured_prompt = run_prompter(prompt, task_id) # Pula a pesquisa
                    plan_docs = run_planner(structured_prompt, task_id)
                    audited_plan = run_auditor(plan_docs, task_id)
                    implementation = run_implementor(audited_plan, task_id)
                    verified_content = run_verifier(implementation, task_id)
                    final_result = run_validador(verified_content, task_id)

                # 3. Marcar como concluído
                log_message(task_id, f"Pipeline concluído com sucesso. Resultado final: {final_result}")
                update_task_status(task_id, "completed")
            except Exception as e:
                log_message(task_id, f"ERRO: Ocorreu uma falha no pipeline. Detalhes: {e}")
                update_task_status(task_id, "failed")

        else:
            # Nenhuma tarefa pendente, aguardar
            time.sleep(POLLING_INTERVAL)

if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print("
--- Master Dispatcher v5 encerrado. ---")
