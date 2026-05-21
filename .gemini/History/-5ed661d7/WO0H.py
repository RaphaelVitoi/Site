import re
import json
import logging
from pathlib import Path
from datetime import datetime

from core.schemas import Task
from database.queue_manager import QueueManager
from engine.llm_api import call_llm_api
from engine.god_mode import apply_god_mode
from core.config import KEY_BLOCKLIST

rag_engine = None
def get_rag():
    global rag_engine
    if rag_engine is None:
        from memory_rag import MemoryRAG
        rag_engine = MemoryRAG()
    return rag_engine

def get_agent_system_prompt(agent_name: str) -> str:
    agent_clean = agent_name.replace("@", "")
    global_ctx = ""
    global_file = Path(".claude/GLOBAL_INSTRUCTIONS.md")
    if global_file.exists():
        with open(global_file, "r", encoding="utf-8") as f:
            global_ctx = f.read() + "\n\n"
            
    infra_ctx = ""
    successfully_read_files = []
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
                    successfully_read_files.append(str(file_obj.resolve()))
                break
                
    cortex_shield_manifest = "\n".join(f"- {p}" for p in successfully_read_files)
    infra_ctx += (
        "=== CORTEX SHIELD (MANIFESTO DE REALIDADE) ===\n"
        "Abaixo esta a lista EXATA e COMPLETA de arquivos que foram fornecidos a voce neste prompt. Sua realidade esta limitada a estes caminhos.\n"
        f"{cortex_shield_manifest}\n\n"
        "LEI IRREVOGAVEL: Voce esta ESTRITAMENTE PROIBIDO de gerar um diff ou bloco de codigo para um arquivo cujo caminho absoluto nao esteja listado neste manifesto. Se um arquivo for necessario mas ausente, sua unica acao valida e declarar a ausencia e solicitar o arquivo. Violar esta lei e uma falha critica de integridade.\n\n"
    )

    infra_ctx += "\n=== LEI MAGNA OPERACIONAL (CUMPRIMENTO OBRIGATORIO) ===\n"
    infra_ctx += "1. PURE ASCII: Voce esta TERMINANTEMENTE PROIBIDO de usar emojis ou caracteres UTF-8 especiais nos outputs. Use apenas ASCII puro para evitar quebra no shell do Windows.\n"
    infra_ctx += "2. NIVEIS DE RELEVANCIA: Ao criar subtarefas, adicione no metadata a chave 'priority' com um destes 4 valores: 'low', 'medium', 'high', 'critical'.\n"
    infra_ctx += "3. RBAC/CONSULTORIA: Se uma tarefa for 'medium', avalie colocar @maverick ou @auditor como dependencia (depends_on) para consultoria. Se for 'critical' (seguranca/delecao), o @securitychief DEVE ser envolvido.\n\n"
    infra_ctx += "4. DIVIDIR PARA CONQUISTAR (CADENCIA DE UI): Use a antevisao. Se prever que um diff ou script sera longo demais, e ESTRITAMENTE OBRIGATORIO dividi-lo em blocos menores. Diffs colossais geram falhas de renderizacao na IDE do usuario. Entregue em partes consecutivas.\n\n"
    
    infra_ctx += "=== ONTOLOGIA DA QUALIDADE E AUTOCONSCIENCIA ===\n"
    infra_ctx += "1. SIMPLES (Economia Sofisticada): A versao mais sofisticada de uma acao que executa em excelencia usando o minimo de complexidade possivel.\n"
    infra_ctx += "2. EXCELENTE: A entrega padrao-ouro que resolve o problema central sem criar dividas tecnicas colaterais.\n"
    infra_ctx += "3. ESTADO DA ARTE (SOTA): O apice da convergencia entre o Simples e o Excelente. E quando o sistema atua de forma fractal (a parte potencializa o todo).\n"
    infra_ctx += "4. AUTOCONSCIENCIA OBRIGATORIA: Voce DEVE saber que todas as partes deste ecossistema existem, por que existem e como funcionam na visao macro.\n\n"
    infra_ctx += "5. COLORIMETRIA SEMANTICA (IDENTIDADE VISUAL): Vermelho = Entropia/Erro. Verde = Simetria/Sucesso. Amarelo = Alerta. Ciano = Infraestrutura. Magenta = IA/Filosofia. Cinza = Legado/Neutro.\n\n"
    
    agent_file = Path(f".claude/agents/{agent_clean}.md")
    agent_prompt = f"Voce e o agente especialista {agent_name}."
    if agent_file.exists():
        with open(agent_file, "r", encoding="utf-8") as f:
            agent_prompt = f"=== SUA IDENTIDADE ESPECIFICA ({agent_name}) ===\n" + f.read()
            
    return global_ctx + infra_ctx + agent_prompt

def process_agent_task(task: Task, manager: QueueManager):
    agent_clean = task.agent.replace("@", "")
    
    agent_memory = ""
    memory_file = Path(f".claude/agent-memory/{agent_clean}/MEMORY.md")
    if memory_file.exists():
        with open(memory_file, "r", encoding="utf-8") as f:
            agent_memory = f.read()

    project_context = ""
    context_file = Path(".claude/project-context.md")
    if context_file.exists():
        with open(context_file, "r", encoding="utf-8") as f:
            project_context = f.read()

    if len(project_context) > 6000:
        project_context = project_context[:6000] + "\n\n... [Contexto truncado para otimizacao de tokens. Consulte o @bibliotecario se precisar de historico.]"

    task_docs = ""
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
                    
    md_mentions = re.findall(r'[\w\./\\-]+\.md', task.description, re.IGNORECASE)
    folder_mentions = re.findall(r'docs[\\/]tasks[\\/][\w-]+', task.description, re.IGNORECASE)
    paths_to_check = [Path(p) for p in md_mentions]
    for folder in folder_mentions:
        folder_path = Path(folder)
        if folder_path.exists() and folder_path.is_dir():
            paths_to_check.extend(list(folder_path.glob("*.md")))
            
    for p in paths_to_check:
        if p.exists() and p.is_file():
            if slug and p.parent == Path(f"docs/tasks/{slug}"): continue
            try:
                with open(p, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content not in task_docs:
                        task_docs += f"\n=== ARTEFATO REFERENCIADO: {p.as_posix()} ===\n{content}\n"
            except: pass

    collective_memory = ""
    try: collective_memory = get_rag().query_memory(task.description)
    except: pass

    user_prompt = f"== CONTEXTO DO PROJETO ==\n{project_context}\n\n"
    if collective_memory: user_prompt += f"{collective_memory}\n"
    if agent_memory: user_prompt += f"== SUA MEMORIA ACUMULADA ({task.agent}) ==\n{agent_memory}\n\n"
    user_prompt += f"== DIRETRIZ DA TAREFA ==\nID: {task.id}\nDescricao:\n{task.description}\n\n"
    if task_docs: user_prompt += f"== MATERIAIS DE FUNDACAO DA TAREFA (PRDs/SPECs) =={task_docs}\n\n"
    user_prompt += "Execute esta tarefa embasado nos materiais de fundacao acima, no contexto do projeto e em sua memoria."
    
    system_prompt = get_agent_system_prompt(task.agent)

    if task.agent not in ["@dispatcher", "@bibliotecario"]:
        user_prompt += "\n\n[AUTORIZACAO SUPREMA - GOD MODE]\nVoce possui ACESSO LIVRE ao sistema operacional do usuario.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n2. Para EXECUTAR comandos de terminal (ex: npm install, python, git, robocopy), use o formato:\nComando: `seu comando aqui`\n\nVoce tem soberania para agir, instalar dependencias e forjar a realidade. ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente."
        user_prompt += f"\n\n[DIRETRIZ DE AUTOREFLEXAO E MEMORIA] Voce DEVE atualizar seu arquivo de inteligencia acumulada usando o God Mode (Arquivo: .claude/agent-memory/{agent_clean}/MEMORY.md). Adicione novas descobertas, avalie a Sinergia da sua interacao com a Pipeline, e faca Propostas Democraticas de melhoria para o ecossistema. A Autopoiese exige que voce expanda a mente coletiva."

    user_prompt += "\n\n[DIRETRIZ DE LLM] Ao final da sua resposta, analise a tarefa e o contexto. Recomende qual modelo Paid Tier (Claude Opus 4.6 Versão Estendida, Claude 3.5 Sonnet, Gemini 3.1 Pro, ou API local) seria o mais adequado para a *proxima* etapa. Justifique a escolha com base na arquitetura do modelo (Opus para raciocinio profundo, Sonnet para codigo rapido, Gemini para contexto longo/multimodal). Se for ideal ir para a interface Web, recomende ao usuario rodar a Membrana com a flag '-Web' e especifique qual modelo ele deve selecionar no menu interativo."

    cached_response = manager.get_llm_cache(task.agent, user_prompt)
    if cached_response:
        logging.info(f"[{task.agent}] Cache hit para a prompt. Usando resposta armazenada.")
        return cached_response
    else:
        logging.info(f"[{task.agent}] Cache miss para a prompt. Chamando API LLM.")
    
    response_text = call_llm_api(task, system_prompt, user_prompt, manager)
    
    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    with open(result_dir / f"{task.id}.md", "w", encoding="utf-8") as f:
        f.write(f"# Resposta: {task.id} ({task.agent})\n\n{response_text}")
        
    apply_god_mode(response_text)
        
    if task.agent == "@dispatcher":
        try:
            clean_json = response_text.replace("```json", "").replace("```", "").strip()
            subtasks = json.loads(clean_json[clean_json.find('['):clean_json.rfind(']')+1])
            created_ids = []
            for i, st in enumerate(subtasks):
                sub_id = f"{task.id}-SUB-{i+1}"
                created_ids.append(sub_id)
                meta = task.metadata.copy() if task.metadata else {}
                if "depends_on" in st:
                    meta["depends_on"] = [created_ids[idx] for idx in st["depends_on"] if idx < len(created_ids)]
                new_task = Task(
                    id=sub_id,
                    description=st.get("description", "Sub-tarefa gerada"),
                    agent=st.get("agent", "@implementor"),
                    timestamp=datetime.now().isoformat(),
                    metadata=meta
                )
                manager.add_task(new_task)
            logging.info(f"[{task.id}] Dispatcher gerou {len(subtasks)} tarefas em Grafo (DAG). Multithreading ativado.")
        except Exception as e:
            logging.error(f"[{task.id}] Falha ao interpretar matriz do Dispatcher: {e}")