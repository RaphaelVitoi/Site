"""
Execution -- Orquestracao central de execucao de tarefas e workflow completo.
"""
import asyncio
import gc
import hashlib
import logging
import os
import re
import sqlite3
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import core.runtime as te
from agents.autonomy import apply_god_mode, get_autonomy_mode
from agents.dispatcher import (
    DispatcherSubtask,
    _parse_dispatcher_subtasks_strict,
    _retry_dispatcher_schema_once,
)
from agents.fallback import _create_dispatcher_fallback_plan
from agents.prompts import get_agent_system_prompt
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    COMPRESSION_CIRCUIT_BREAKER,
    PERPLEXITY_KEYS,
    TAVILY_KEYS,
    WEB_SEARCH_CACHE_TTL,
    APIBudgetExhaustedError,
    APIKeysExhaustedError,
    web_search_cache,
)
from llm.orchestrator import _compress_context, call_llm_api
from llm.search import call_perplexity_search, call_tavily_search
from llm.session import get_global_http_session  # Import the async version
from monitoring.telemetry import send_toast, write_economic_log
from utils.cache import _read_file_with_cache
from utils.heuristics import _calculate_heuristic_score
from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

AGENT_MAVERICK = "@maverick"
AGENT_DISPATCHER = "@dispatcher"


async def _create_system_task(
    manager: QueueManager, task_id: str, description: str, agent: str, priority: str = "high"
):
    """Cria uma tarefa de sistema de forma robusta, com logging detalhado."""
    try:
        if not await manager.get_task(task_id):
            system_task = Task(
                id=task_id,
                description=description,
                agent=agent,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"priority": priority}
            )
            await manager.add_task(system_task)
            logger.info(f"[SISTEMA IMUNOLOGICO] Tarefa de sistema '{task_id}' para {agent} criada com sucesso.")
            return True
    except Exception as e:  # noqa: BLE001
        logger.critical(f"[SISTEMA IMUNOLOGICO] FALHA CRITICA ao criar tarefa de sistema '{task_id}': {e}")
    return False


# =====================================================================
# SOTA INJECTORS: Middlewares de Isolamento Cognitivo
# =====================================================================
def _extract_task_file_mentions(description: str) -> list[Path]:
    md_mentions = re.findall(r'[\w\./\\-]+\.md', description, re.IGNORECASE)
    folder_mentions = re.findall(r'docs[\\/]tasks[\\/][\w-]+', description, re.IGNORECASE)

    paths_to_check = [Path(p) for p in md_mentions]
    for folder in folder_mentions:
        folder_path = Path(folder)
        if folder_path.exists() and folder_path.is_dir():
            paths_to_check.extend(list(folder_path.glob("*.md")))
    return paths_to_check

def _inject_task_docs(task: Task) -> str:
    task_docs = ""
    slug = task.metadata.get("slug") if task.metadata else None
    if slug:
        task_dir = Path(f"docs/tasks/{slug}")
        if task_dir.exists() and task_dir.is_dir():
            for md_file in task_dir.glob("*.md"):
                content = _read_file_with_cache(md_file)
                if content:
                    task_docs += f"\n=== ARTEFATO: {md_file.as_posix()} ===\n{content}\n"

    paths_to_check = _extract_task_file_mentions(task.description or "")

    for p in paths_to_check:
        if p.exists() and p.is_file():
            if slug and p.parent == Path(f"docs/tasks/{slug}"):
                continue
            content = _read_file_with_cache(p)
            if content and content not in task_docs:
                task_docs += f"\n=== ARTEFATO REFERENCIADO: {p.as_posix()} ===\n{content}\n"
    return task_docs

def _needs_web_search(agent: str, normalized_desc: str) -> bool:
    if _calculate_heuristic_score(normalized_desc, te._heuristic_terms("research_terms")) > te.HEURISTIC_THRESHOLD:
        return True
    if agent == AGENT_MAVERICK and _calculate_heuristic_score(normalized_desc, te._heuristic_terms("strategic_terms")) > te.HEURISTIC_THRESHOLD:
        return True
    if agent == "@bibliotecario" and _calculate_heuristic_score(normalized_desc, te._heuristic_terms("web_infra_terms")) > te.HEURISTIC_THRESHOLD:
        return True
    if agent == "@chico" and _calculate_heuristic_score(normalized_desc, te._heuristic_terms("orchestration_terms")) > te.HEURISTIC_THRESHOLD:
        return True
    if agent in ("@validador", "@verifier", "@auditor") and _calculate_heuristic_score(normalized_desc, te._heuristic_terms("domain_terms")) > te.HEURISTIC_THRESHOLD:
        return True
    return False

async def _fetch_web_search(task: Task, session) -> str:
    web_context = ""
    if TAVILY_KEYS:
        logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] [dim]Tentando provedor primario (Tavily)...[/]")
        web_context = await call_tavily_search(session, TAVILY_KEYS[0], task.description, max_results=3)

    if not web_context and PERPLEXITY_KEYS:
        logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] [dim]Fallback para provedor secundario (Perplexity)...[/]")
        web_context = await call_perplexity_search(session, PERPLEXITY_KEYS[0], task.description)
    return web_context or ""

async def _execute_web_search(task: Task) -> tuple[str, int]:
    normalized_description = enforce_pure_ascii((task.description or "").lower())

    if task.agent == '@verifier' and task.metadata and task.metadata.get('priority') in ['high', 'critical']:
        task.description += "\n\n[DIRETRIZ DE AUDITORIA SOTA 8.0] Alem da validacao funcional, voce DEVE realizar uma busca externa..."

    if not (TAVILY_KEYS or PERPLEXITY_KEYS) or not _needs_web_search(task.agent, normalized_description):
        return "", -1

    try:
        t0_web = time.monotonic()
        cache_key = hashlib.md5(task.description.encode('utf-8')).hexdigest()
        cached_result, cache_time = web_search_cache.get(cache_key, (None, 0))

        if cached_result and (time.monotonic() - cache_time < WEB_SEARCH_CACHE_TTL):
            web_context = str(cached_result)
        else:
            logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] [bold blue]WEB[/] Acionando busca web autonoma...")
            session = await get_global_http_session()
            web_context = await _fetch_web_search(task, session)
            if web_context:
                web_search_cache[cache_key] = (web_context, time.monotonic())

        return web_context, int((time.monotonic() - t0_web) * 1000) if web_context else -1
    except Exception:
        logger.exception("Falha ao executar busca web")
        return "", -1

async def _query_collective_memory(task: Task, n_rag_results: int) -> tuple[str, int]:
    try:
        t0 = time.monotonic()
        rag = te.get_rag() # Aquisicao Sincrona do Singleton
        collective_memory = await rag.query_memory(task.description, n_results=n_rag_results, local_only=True)
        return collective_memory, int((time.monotonic() - t0) * 1000)
    except Exception:
        logger.exception("Falha ao consultar RAG")
        return "", -1

async def _apply_context_compression(project_context: str, agent_memory: str, task: Task, manager: QueueManager) -> tuple[str, str, int]:
    total_compression_time = 0.0
    t0_compress = time.monotonic()

    recent_failure = (time.time() - COMPRESSION_CIRCUIT_BREAKER["last_failure"]) < 900  # Ultimos 15 min
    frequent_failures = COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] >= 3
    prefer_local_fallback = recent_failure and frequent_failures

    if len(project_context) > 6000:
        logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] Contexto do projeto longo ({len(project_context)} chars). Acionando compressao...")
        original_ctx_len = len(project_context)
        project_context = await _compress_context(project_context, task.agent, manager, prefer_local_fallback=prefer_local_fallback)
        if len(project_context) < original_ctx_len:
            project_context = f"[Contexto do Projeto (Comprimido por IA)]\n{project_context}"
        total_compression_time += (time.monotonic() - t0_compress)
        t0_compress = time.monotonic()

    if len(agent_memory) > 4000:
        logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] Memoria do agente longa ({len(agent_memory)} chars). Acionando compressao...")
        original_mem_len = len(agent_memory)
        agent_memory = await _compress_context(agent_memory, task.agent, manager, prefer_local_fallback=prefer_local_fallback)
        if len(agent_memory) < original_mem_len:
            agent_memory = f"[Memoria do Agente (Comprimida por IA)]\n{agent_memory}"
        total_compression_time += (time.monotonic() - t0_compress)

    return project_context, agent_memory, int(total_compression_time * 1000)

def _add_context_sections(project_context: str, web_context: str, collective_memory: str, agent_memory: str, task: Task, task_docs: str) -> str:
    sections = [f"<project_context>\n{project_context}\n</project_context>\n\n"]
    if web_context:
        sections.append(f"<web_search_results>\n{web_context}\n</web_search_results>\n\n")
    if collective_memory:
        sections.append(f"<retrieved_memory>\n{collective_memory}\n</retrieved_memory>\n\n")
    if agent_memory:
        sections.append(f"<agent_memory persona='{task.agent}'>\n{agent_memory}\n</agent_memory>\n\n")

    if task_docs:
        sections.append(f"<task_documents>\n{task_docs}\n</task_documents>\n\n")

    sections.append(f"<task_directive>\n<task_id>{task.id}</task_id>\n<description>{task.description}</description>\n</task_directive>\n\n")
    sections.append("Execute esta tarefa embasado nos materiais de fundacao e contexto fornecidos acima.")
    return "".join(sections)

def _add_autonomy_and_guidelines(user_prompt: str, task: Task, agent_clean: str, autonomy_mode: str) -> str:
    prompt_parts = [user_prompt]
    if task.agent in (AGENT_DISPATCHER, "@bibliotecario"):
        return _finalize_prompt(prompt_parts, agent_clean)

    if autonomy_mode == "stop":
        prompt_parts.append("\n\n[ISOLAMENTO DE ESCRITA - W0]\nVoce esta operando no modo Observador Passivo. E ESTRITAMENTE PROIBIDO forjar arquivos, alterar disco ou executar comandos no terminal. Aja como uma entidade puramente consultiva para analise semantica, discussoes teoricas e exploracao conceitual.")
    elif autonomy_mode == "default":
        prompt_parts.append("\n\n[AUTORIZACAO RESTRITA - W1 (HOMEOSTASE)]\nVoce possui permissao APENAS para EDITAR arquivos focando em auto-cura, correcoes de sintaxe e patches de seguranca.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n\nE ESTRITAMENTE PROIBIDO executar comandos de terminal (ex: npm, python) ou alterar a arquitetura de negocio sem aval. ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente.")
    else:
        prompt_parts.append("\n\n[AUTORIZACAO SUPREMA - GOD MODE]\nVoce possui ACESSO LIVRE ao sistema operacional do usuario.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n2. Para EXECUTAR comandos de terminal (ex: npm install, python, git, robocopy), use o formato:\nComando: `seu comando aqui`\n\nVoce tem soberania para agir, instalar dependencias e forjar a realidade. ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente.")

    prompt_parts.append(f"\n\n[TETRALOGIA DE GOVERNANCA VITOI 3.2] Nivel Atual: {autonomy_mode.upper()}\n")
    mode_descriptions = {
        "stop": "Foco: O Observador Passivo. Isolamento absoluto de escrita. Use este modo para discussoes teoricas de GTO, insights filosoficos e analise exploratoria sem alterar o estado do sistema.\n",
        "default": "Foco: A Homeostase Estatica. Atue como Sentinela de Estabilidade. Execute auto-debugging, fixes de sintaxe e security patches reativamente para manter a integridade (Minimizacao de Entropia). Nao altere a logica de negocio sem aval.\n",
        "partial": "Foco: O Estrategista de Impacto (Equilibrio Bayesiano). Alem da homeostase, aplique refatoracoes preventivas de BAIXO impacto autonomamente. Para alteracoes Core/GTO (alto impacto), gere uma Decision Proposal para validacao humana.\n",
        "full": "Foco: O Agente Autonomo Total. Maximizacao da Potencia de Inovacao. Refatoracao estrutural, criacao de novos modulos, execucao de terminal complexa e deployment proativo ativados em grau maximo.\n"
    }
    prompt_parts.append(mode_descriptions.get(autonomy_mode, ""))

    if autonomy_mode != "stop":
        derived_map = {"full": "PARTIAL", "partial": "DEFAULT"}
        derived = derived_map.get(autonomy_mode, "STOP")
        prompt_parts.append(f"\n[HONESTIDADE INTELECTUAL - RASTRO DE AUDITORIA]\nE OBRIGATORIO injetar o seguinte cabecalho de metadados como comentario no inicio de QUALQUER arquivo que voce alterar significativamente (ajuste a sintaxe para a linguagem do arquivo):\n// [VITOI-AUDIT] Level: {autonomy_mode.upper()} | Derived_From: {derived} | Trigger: Proactive_Optimization\n")

    prompt_parts.append(f"\n\n[DIRETRIZ DE AUTOREFLEXAO E MEMORIA] Voce DEVE atualizar seu arquivo de inteligencia acumulada usando o God Mode (Arquivo: .claude/agent-memory/{agent_clean}/MEMORY.md). Adicione novas descobertas, avalie a Sinergia da sua interacao com a Pipeline, e faca Propostas Democraticas de melhoria para o ecossistema. A Autopoiese exige que voce expanda a mente coletiva.")

    return _finalize_prompt(prompt_parts, agent_clean)

def _finalize_prompt(prompt_parts: list[str], agent_clean: str) -> str:
    primary_model = te.AGENTS_MANIFEST.get(agent_clean, {}).get("primary_model", "gemini-2.5-flash")
    prompt_parts.append(f"\n\n[DIRETRIZ DE LLM SOTA] Ao final da sua resposta, recomende ativamente o modelo {primary_model} para as proximas etapas que exijam sua atuacao ou perfil cognitivo, justificando com base na Economia Generalizada (Custo-beneficio x Estado da Arte). Se a tarefa for massiva, sugira o Handoff Web.")

    prompt_parts.append(
        "\n\n[PROTOCOLO DE DIRETRIZES OPERACIONAIS: SOTA 3.1 PRO VITOI CORE]\n"
        "1. ANTEVISAO SEMANTICA: Proibida a analise isolada. Audite a arvore de dependencias (Micro-Macro).\n"
        "2. DIAGNOSTICO BAYESIANO E STEELMANING: Opere na causa raiz. Provoque o bug ate o estado mais catastrofico antes de propor a solucao. Proibido o uso de band-aids logicos (tipagem Any, try/except genericos).\n"
        "3. INVARIANCIA MODULAR: Nao induza entropia. Preserve contratos de API e assinaturas de metodos.\n"
        "4. ECONOMIA GENERALIZADA: Maximize densidade informativa. Minimize a complexidade ciclomatica V(G) usando polimorfismo/pattern matching.\n"
        "5. SEGURANCA SOTA: Operacoes I/O purificadas (Pure ASCII) e blindadas contra Path Traversal.\n"
        "6. HONESTIDADE INTELECTUAL: Prefira o silencio a fabricacao. Use a Cadeia de Pensamento Estendida para evidenciar trade-offs.\n"
        "7. BLINDAGEM DE POWERSHELL (ANTI-CRASH JSON): E terminantemente proibida a atribuicao cega em objetos PSCustomObject gerados via ConvertFrom-Json. Para adicionar/modificar chaves, utilize OBRIGATORIAMENTE o padrao SOTA: `if ($null -ne $Obj.PSObject.Properties['Chave']) { $Obj.Chave = $Val } else { $Obj | Add-Member -NotePropertyName 'Chave' -NotePropertyValue $Val }`."
    )
    return "".join(prompt_parts)

def _assemble_prompt(task: Task, project_context: str, web_context: str, collective_memory: str, agent_memory: str, task_docs: str, agent_clean: str, autonomy_mode: str = "default") -> tuple[str, str]:
    prompt_base = _add_context_sections(project_context, web_context, collective_memory, agent_memory, task, task_docs)
    system_prompt = get_agent_system_prompt(task.agent)

    user_prompt = enforce_pure_ascii(prompt_base)
    system_prompt = enforce_pure_ascii(system_prompt)

    if task.agent == AGENT_DISPATCHER:
        user_prompt += (
            "\n\n[CONTRATO ESTRITO DO DISPATCHER]\n"
            "Retorne EXCLUSIVAMENTE um JSON valido ESTRITO. Pode ser um array [...] direto ou um objeto {...} contendo um array.\n"
            "Cada item deve conter: description (string), agent (@agente_valido), depends_on (array de indices inteiros), metadata (objeto).\n"
            "Mantenha foco estritamente tecnico-operacional e neutro. Nao inclua conteudos fora da decomposicao de tarefa."
        )

    user_prompt = _add_autonomy_and_guidelines(user_prompt, task, agent_clean, autonomy_mode)
    return system_prompt, user_prompt


async def process_agent_task(task: Task, manager: QueueManager, timing_metrics: dict) -> str:
    """Motor de orquestracao SOTA descentralizado."""
    agent_clean = task.agent.replace("@", "")

    strategic_agents = (AGENT_MAVERICK, "@pesquisador", "@architect")
    n_rag_results = 7 if task.agent in strategic_agents else 3

    agent_memory = ""
    memory_file = Path(f".claude/agent-memory/{agent_clean}/MEMORY.md")
    if memory_file.exists():
        agent_memory = _read_file_with_cache(memory_file) or ""

    project_context = ""
    context_file = Path(".claude/project-context.md")
    if context_file.exists():
        project_context = _read_file_with_cache(context_file) or ""
    if len(project_context) > 20000:
        project_context = project_context[:20000] + "\n\n... [Contexto massivo truncado. Consulte o @bibliotecario se precisar de historico profundo.]"

    task_docs = _inject_task_docs(task)
    web_context, web_ms = await _execute_web_search(task)
    if web_ms > 0:
        timing_metrics["web_search_ms"] = web_ms

    collective_memory, rag_ms = await _query_collective_memory(task, n_rag_results)
    if rag_ms > 0:
        timing_metrics["rag_query_ms"] = rag_ms

    priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
    if task.agent == "@securitychief" and priority in ["high", "critical"]:
        if task.metadata is None: task.metadata = {}
        task.metadata["model_override"] = "gemini-1.5-pro"
        logger.info(f"[[{te._c(task.agent)}]{task.agent}[/]] [bold red]CRITICAL SEC[/]: Escalando cognicao de seguranca para gemini-1.5-pro.")

    project_context, agent_memory, comp_ms = await _apply_context_compression(project_context, agent_memory, task, manager)
    if comp_ms > 0:
        timing_metrics["context_compression_ms"] = comp_ms

    autonomy_mode = await get_autonomy_mode(manager)
    system_prompt, user_prompt = _assemble_prompt(task, project_context, web_context, collective_memory, agent_memory, task_docs, agent_clean, autonomy_mode)

    cached_response = await manager.get_llm_cache(task.agent, user_prompt)
    if cached_response:
        logger.info(f"[{te._c(task.agent)}]{task.agent}[/] [dim]Cache hit. Usando sabedoria armazenada.[/]")
        return cached_response

    # Gatekeeper do Orcamento Cognitivo
    budget_ok = await manager.check_and_increment_usage()
    if not budget_ok:
        raise APIBudgetExhaustedError("O orcamento diario de chamadas a API foi esgotado.")

    # Call LLM API
    require_json = (task.agent == "@dispatcher")
    response_text = await call_llm_api(task, system_prompt, user_prompt, manager, require_json=require_json)
    return response_text

async def _process_dispatcher_output(task: Task, manager: QueueManager, response_text: str) -> None:
    try:
        parsed_subtasks = _parse_dispatcher_subtasks_strict(response_text)
        await _enqueue_subtasks(task, manager, parsed_subtasks, "dispatcher_json_validated")
        logger.info(f"[bold blue][>] ESTRATEGIA[/] [cyan]{task.id}[/] fragmentada em [bold]{len(parsed_subtasks)}[/] sub-tarefas interdependentes.")
    except Exception as e:  # noqa: BLE001
        logger.error(f"[{task.id}] Falha ao interpretar matriz do Dispatcher: {e}")
        retry_subtasks = await _retry_dispatcher_schema_once(task, manager, response_text)
        if retry_subtasks:
            await _enqueue_subtasks(task, manager, retry_subtasks, "dispatcher_schema_retry_success")
            logger.info(f"[bold blue][>] ESTRATEGIA[/] [cyan]{task.id}[/] normalizada via retry de schema com [bold]{len(retry_subtasks)}[/] sub-tarefas.")
        else:
            await manager.update_task_metadata(task.id, {"reason_codes": ["dispatcher_parse_failed"]}, merge=True)
            await _create_dispatcher_fallback_plan(task, manager)

async def _enqueue_subtasks(task: Task, manager: QueueManager, subtasks: list[DispatcherSubtask], reason_code: str) -> None:
    created_ids = []
    agents_list = [sub.agent for sub in subtasks]
    for i, st in enumerate(subtasks):
        sub_id = f"{task.id}-SUB-{i+1}"
        created_ids.append(sub_id)

        meta = task.metadata.copy() if task.metadata else {}
        meta["route_selected"] = agents_list
        reason_codes = list(meta.get("reason_codes", []))
        if reason_code not in reason_codes:
            reason_codes.append(reason_code)
        meta["reason_codes"] = reason_codes

        if st.depends_on:
            meta["depends_on"] = [created_ids[idx] for idx in st.depends_on if idx < len(created_ids)]
        if st.metadata:
            meta.update(st.metadata)

        new_task = Task(id=sub_id, description=st.description, agent=st.agent, timestamp=datetime.now(timezone.utc).isoformat(), metadata=meta)
        await manager.add_task(new_task)

async def _handle_api_budget_exhaustion(e: Exception, task: Task, manager: QueueManager):
    logger.error(f"[bold red][!] ORCAMENTO ESGOTADO[/] Falha na tarefa [cyan]{task.id}[/].")
    await manager.update_task_status(task.id, "pending")
    await manager.update_task_metadata(task.id, {"workflow_status": "pending_budget_exhausted"}, merge=True)

    now = datetime.now(timezone.utc)
    tomorrow = now.date() + timedelta(days=1)
    hibernation_target = datetime.combine(tomorrow, datetime.min.time(), tzinfo=timezone.utc)
    await manager.set_system_state("hibernation_until", hibernation_target.isoformat())

    notification_id = f"BUDGET-ALERT-{now.strftime('%Y%m%d')}"
    notification_desc = "ALERTA CRITICO: O orcamento diario de API foi esgotado. O sistema entrara em hibernacao ate o proximo ciclo."
    await _create_system_task(manager, notification_id, notification_desc, "@chico", "critical")
    raise e

async def _handle_api_keys_exhaustion(e: Exception, task: Task, manager: QueueManager):
    logger.warning(f"[bold yellow][!] CHAVES TEMPORARIAMENTE EXAURIDAS[/] [cyan]{task.id}[/] devolvida e preservada na fila.")
    await manager.update_task_status(task.id, "pending")
    await manager.update_task_metadata(task.id, {"workflow_status": "pending_keys_exhausted"}, merge=True)

    now = datetime.now(timezone.utc)
    resume_time = now + timedelta(minutes=3)
    await manager.set_system_state("hibernation_until", resume_time.isoformat())
    raise e

async def _handle_task_failure(e: Exception, task: Task, manager: QueueManager, start_time: float, timing_metrics: dict, response_text: str) -> None:
    """Isola a governanca de panico, esgotamento e curas do sistema."""
    if isinstance(e, APIBudgetExhaustedError):
        await _handle_api_budget_exhaustion(e, task, manager)

    if isinstance(e, APIKeysExhaustedError):
        await _handle_api_keys_exhaustion(e, task, manager)

    logger.error(f"[bold red][X] ENTROPIA DETECTADA[/] Tarefa [cyan]{task.id}[/] falhou nas maos de [{te._c(task.agent)}]{task.agent}[/].\n[dim]{e}[/]")
    await manager.update_task_status(task.id, "failed")

    fail_metadata = {"workflow_status": "failed", "workflow_duration_ms": int((time.time() - start_time) * 1000), "last_error_class": type(e).__name__, "last_error_message": str(e)[:400]}
    fail_metadata.update(timing_metrics)
    await manager.update_task_metadata(task.id, fail_metadata, merge=True)

    duration = time.time() - start_time
    write_economic_log(task, duration, "FAILED")
    send_toast("Entropia Sistemica (CRITICAL)", f"Falha na tarefa do {task.agent}.", "error")

    is_system_task = task.id.startswith(("AUTOFIX", "RESONANCE", "HANDOFF"))
    if not is_system_task:
        fix_id = f"AUTOFIX-{task.id}"
        fix_desc = f"[AUTO-CORRECAO SOTA | LEI ZERO]\nA tarefa '{task.id}' falhou. Diagnostico Bayesiano exigido.\nErro: {e}\nResposta original: {response_text[:1000]}"
        if await _create_system_task(manager, fix_id, fix_desc, task.agent, "critical"):
            logger.info(f"[bold orange3][+] AUTO-CURA[/] Anticorpos acionados via {task.agent} para a tarefa [cyan]{task.id}[/]")

        resonance_id = f"RESONANCE-{task.id}"
        resonance_desc = f"[AUDITORIA FRACTAL | LEI ZERO]\nA tarefa '{task.id}' quebrou. Steelmaning do bug obrigatorio."
        await _create_system_task(manager, resonance_id, resonance_desc, "@maverick", "high")
        await _create_system_task(manager, resonance_id, resonance_desc, AGENT_MAVERICK, "high")

async def _process_observers_and_handoff(task: Task, manager: QueueManager) -> None:
    await _notify_observers(task, manager)

    autonomy_mode = await get_autonomy_mode(manager)
    if autonomy_mode == "off" or task.id.startswith("AUTOFIX") or task.agent == AGENT_DISPATCHER:
        return

    next_agent = te.HANDOFF_PIPELINE.get(task.agent)
    if not next_agent:
        return

    if autonomy_mode == "partial" and next_agent == "@implementor":
        logger.info(f"[AUTONOMIA PARCIAL] Fluxo pausado. A etapa critica do {next_agent} exige comando manual.")
        return

    handoff_id = f"HANDOFF-{task.id[-10:]}-{next_agent.strip('@').upper()}"
    if not await manager.get_task(handoff_id):
        new_task = Task(id=handoff_id, description=f"O agente {task.agent} concluiu sua etapa. Analise '.claude/task_results/{task.id}.md' e execute a sua.", agent=next_agent, timestamp=datetime.now(timezone.utc).isoformat())
        await manager.add_task(new_task)
        logger.info(f"[bold magenta][->] HANDOFF[/] O bastao foi passado para [{te._c(next_agent)}]{next_agent}[/]")

async def _notify_observers(task: Task, manager: QueueManager) -> None:
    observers = task.metadata.get("observers", []) if task.metadata else []
    for observer in observers:
        logger.info(f"[[{te._c(observer)}]{observer}[/]] [bold yellow]OBSERVER SOTA[/] Gerando notificacao estrategica referente a tarefa {task.id}.")
        notification_id = f"NOTIFY-{task.id[-10:]}-{observer.strip('@').upper()}"
        if not await manager.get_task(notification_id):
            notification_task = Task(
                id=notification_id,
                description=f"[NOTIFICACAO DE SENTINELA]\nA tarefa epica '{task.id}' foi concluida. Audite o resultado.",
                agent=observer,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"reference_task": task.id, "priority": "high", "reason": "epic_task_observer_notification"}
            )
            await manager.add_task(notification_task)


def _save_task_result_sync(task_id: str, agent: str, response_text: str) -> None:
    """Descarrega a gravacao em disco do resultado para uma thread limpa."""
    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    with open(result_dir / f"{task_id}.md", "w", encoding="utf-8") as f:
        f.write(f"# Resposta: {task_id} ({agent})\n\n{response_text}")


def _set_task_completed_at_sync(db_path: str | os.PathLike[str], task_id: str) -> None:
    with sqlite3.connect(db_path) as db:
        db.execute("UPDATE tasks SET completedAt = ? WHERE id = ?", (datetime.now(timezone.utc).isoformat(), task_id))
        db.commit()

async def _finish_task_success(task: Task, manager: QueueManager, start_time: float, modified_files: list, timing_metrics: dict) -> None:
    await manager.update_task_status(task.id, "completed")
    try:
        await asyncio.to_thread(_set_task_completed_at_sync, manager.db_path, task.id)
    except Exception as e:
        logger.error(f"[SISTEMA] Falha ao registrar completedAt: {e}")

    logger.info(f"[bold green][OK] SIMETRIA ALCANCADA[/] [cyan]{task.id}[/] concluida por [{te._c(task.agent)}]{task.agent}[/]")

    duration = time.time() - start_time
    final_metadata: dict[str, Any] = {"workflow_duration_ms": int(duration * 1000), "workflow_status": "completed"}
    if modified_files:
        final_metadata["files_changed"] = modified_files
    final_metadata.update(timing_metrics)
    await manager.update_task_metadata(task.id, final_metadata, merge=True)
    write_economic_log(task, duration, "COMPLETED")

    priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
    if priority in ["high", "critical"]:
        send_toast(f"Simetria ({priority.upper()})", f"A tarefa critica foi concluida pelo {task.agent}.", "success")

async def execute_task_workflow(task: Task, manager: QueueManager):
    """
    Orquestrador de Fluxo Funcional SOTA. Processa de maneira limpa o ciclo de vida.
    """
    start_time = time.time()
    timing_metrics = {}
    response_text = ""
    try:
        await manager.update_task_metadata(task.id, {"workflow_started_at": datetime.now(timezone.utc).isoformat()}, merge=True)
        response_text = await process_agent_task(task, manager, timing_metrics)

        await asyncio.to_thread(_save_task_result_sync, task.id, task.agent, response_text)

        modified_files = await apply_god_mode(response_text, manager)

        if task.agent == AGENT_DISPATCHER:
            await _process_dispatcher_output(task, manager, response_text)

        await manager.update_task_status(task.id, "completed")

        try:
            await asyncio.to_thread(_set_task_completed_at_sync, manager.db_path, task.id)
        except Exception as e:
            logger.error(f"[SISTEMA] Falha ao registrar completedAt: {e}")

        logger.info(f"[bold green][OK] SIMETRIA ALCANCADA[/] [cyan]{task.id}[/] concluida por [{te._c(task.agent)}]{task.agent}[/]")

        duration = time.time() - start_time
        final_metadata: dict[str, Any] = {"workflow_duration_ms": int(duration * 1000), "workflow_status": "completed"}
        if modified_files:
            final_metadata["files_changed"] = modified_files
        final_metadata.update(timing_metrics)
        await manager.update_task_metadata(task.id, final_metadata, merge=True)
        write_economic_log(task, duration, "COMPLETED")

        priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
        if priority in ["high", "critical"]:
            send_toast(f"Simetria ({priority.upper()})", f"A tarefa critica foi concluida pelo {task.agent}.", "success")

        await _finish_task_success(task, manager, start_time, modified_files, timing_metrics)
        await _process_observers_and_handoff(task, manager)
        gc.collect()

    except Exception as e:
        await _handle_task_failure(e, task, manager, start_time, timing_metrics, response_text)
