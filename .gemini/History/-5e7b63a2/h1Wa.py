"""
Execution -- Orquestracao central de execucao de tarefas e workflow completo.
"""

import asyncio
import gc
import logging
import os
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
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    APIBudgetExhaustedError,
    APIKeysExhaustedError,
    is_cognitive_hibernation_active,
)
from llm.orchestrator import call_llm_api
from monitoring.telemetry import send_toast, write_economic_log

# SOTA: Modularização do Context Builder
import agents.context_builder as cb

# SOTA: Importacao do Motor Cognitivo Local (Pure Engine)
import engine.cognitive as local_engine

logger = logging.getLogger(__name__)

# Mapeamento Global de Entidades SOTA (Mantidos para referencia local)
AGENT_MAVERICK = "@maverick"
AGENT_CHICO = "@chico"
AGENT_ARCHITECT = "@architect"
AGENT_PLANNER = "@planner"
AGENT_DISPATCHER = "@dispatcher"
AGENT_PESQUISADOR = "@pesquisador"
AGENT_PROMPTER = "@prompter"
AGENT_AUDITOR = "@auditor"
AGENT_IMPLEMENTOR = "@implementor"
AGENT_VERIFIER = "@verifier"
AGENT_CURATOR = "@curator"
AGENT_VALIDADOR = "@validador"
AGENT_ORGANIZADOR = "@organizador"
AGENT_SEQUENCIADOR = "@sequenciador"
AGENT_SECURITYCHIEF = "@securitychief"
AGENT_BIBLIOTECARIO = "@bibliotecario"
AGENT_SKILLMASTER = "@skillmaster"
AGENT_HISTORIAN = "@historian"


async def _create_system_task(
    manager: QueueManager,
    task_id: str,
    description: str,
    agent: str,
    priority: str = "high",
):
    """Cria uma tarefa de sistema de forma robusta, com logging detalhado."""
    try:
        if not await manager.get_task(task_id):
            system_task = Task(
                id=task_id,
                description=description,
                agent=agent,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"priority": priority},
            )
            await manager.add_task(system_task)
            logger.info(
                f"[SISTEMA IMUNOLOGICO] Tarefa de sistema '{task_id}' para {agent} criada com sucesso."
            )
            return True
    except Exception as e:  # noqa: BLE001
        logger.critical(
            f"[SISTEMA IMUNOLOGICO] FALHA CRITICA ao criar tarefa de sistema '{task_id}': {e}"
        )
    return False


def _escalate_security_cognition(task: Task) -> None:
    priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
    if task.agent == AGENT_SECURITYCHIEF and priority in ["high", "critical"]:
        if task.metadata is None:
            task.metadata = {}
        task.metadata["model_override"] = "gemini-1.5-pro"
        logger.info(
            f"[[{te._c(task.agent)}]{task.agent}[/]] [bold red]CRITICAL SEC[/]: Escalando cognicao de seguranca para gemini-1.5-pro."
        )


async def process_agent_task(
    task: Task, manager: QueueManager, timing_metrics: dict
) -> str:
    """Motor de orquestracao SOTA descentralizado."""
    # SOTA: Avaliação Antecipada de Bypass Cognitivo
    if task.metadata and task.metadata.get("skip_llm"):
        logger.info(
            f"[[{te._c(task.agent)}]{task.agent}[/]] [bold green]BYPASS COGNITIVO[/] Operação estática de I/O identificada. Contornando LLM."
        )
        return task.description

    agent_clean = task.agent.replace("@", "")
    strategic_agents = (AGENT_MAVERICK, AGENT_PESQUISADOR, AGENT_ARCHITECT)
    n_rag_results = 7 if task.agent in strategic_agents else 3

    agent_memory, project_context = cb._read_agent_and_project_contexts(agent_clean)
    task_docs = cb._inject_task_docs(task)

    web_context, web_ms = await cb._execute_web_search(task, manager)
    if web_ms > 0:
        timing_metrics["web_search_ms"] = web_ms

    collective_memory, rag_ms = await cb._query_collective_memory(task, n_rag_results)
    if rag_ms > 0:
        timing_metrics["rag_query_ms"] = rag_ms

    _escalate_security_cognition(task)

    project_context, agent_memory, comp_ms = await cb._apply_context_compression(
        project_context, agent_memory, task, manager
    )
    if comp_ms > 0:
        timing_metrics["context_compression_ms"] = comp_ms

    autonomy_mode = await get_autonomy_mode(manager)
    system_prompt, user_prompt = cb._assemble_prompt(
        task,
        project_context,
        web_context,
        collective_memory,
        agent_memory,
        task_docs,
        agent_clean,
        autonomy_mode,
    )

    from llm.orchestrator import _prepare_routing_pipeline

    models_to_try, _, _ = await _prepare_routing_pipeline(task, manager)
    cached_response = await manager.get_first_cached_response(
        models_to_try, user_prompt
    )
    if cached_response:
        logger.info(
            f"[{te._c(task.agent)}]{task.agent}[/] [dim]Cache hit. Usando sabedoria armazenada.[/]"
        )
        return cached_response

    # Gatekeeper do Orcamento Cognitivo
    budget_ok = await manager.check_and_increment_usage()
    if not budget_ok:
        raise APIBudgetExhaustedError(
            "O orcamento diario de chamadas a API foi esgotado."
        )

    # Call LLM API
    require_json = task.agent == "@dispatcher"
    response_text = await call_llm_api(
        task, system_prompt, user_prompt, manager, require_json=require_json
    )
    return response_text


async def _process_dispatcher_output(
    task: Task, manager: QueueManager, response_text: str
) -> None:
    try:
        parsed_subtasks = _parse_dispatcher_subtasks_strict(response_text)
        await _enqueue_subtasks(
            task, manager, parsed_subtasks, "dispatcher_json_validated"
        )
        logger.info(
            f"[bold blue][>] ESTRATEGIA[/] [cyan]{task.id}[/] fragmentada em [bold]{len(parsed_subtasks)}[/] sub-tarefas interdependentes."
        )
    except Exception:  # noqa: BLE001
        logger.exception(f"[{task.id}] Falha ao interpretar matriz do Dispatcher")
        retry_subtasks = await _retry_dispatcher_schema_once(
            task, manager, response_text
        )
        if retry_subtasks:
            await _enqueue_subtasks(
                task, manager, retry_subtasks, "dispatcher_schema_retry_success"
            )
            logger.info(
                f"[bold blue][>] ESTRATEGIA[/] [cyan]{task.id}[/] normalizada via retry de schema com [bold]{len(retry_subtasks)}[/] sub-tarefas."
            )
        else:
            await manager.update_task_metadata(
                task.id, {"reason_codes": ["dispatcher_parse_failed"]}, merge=True
            )
            await _create_dispatcher_fallback_plan(task, manager)


async def _enqueue_subtasks(
    task: Task,
    manager: QueueManager,
    subtasks: list[DispatcherSubtask],
    reason_code: str,
) -> None:
    created_ids = []
    agents_list = [sub.agent for sub in subtasks]
    for i, st in enumerate(subtasks):
        sub_id = f"{task.id}-SUB-{i + 1}"
        created_ids.append(sub_id)

        meta = task.metadata.copy() if task.metadata else {}
        meta["route_selected"] = agents_list
        reason_codes = list(meta.get("reason_codes", []))
        if reason_code not in reason_codes:
            reason_codes.append(reason_code)
        meta["reason_codes"] = reason_codes

        if st.depends_on:
            meta["depends_on"] = [
                created_ids[idx] for idx in st.depends_on if idx < len(created_ids)
            ]
        if st.metadata:
            meta.update(st.metadata)

        new_task = Task(
            id=sub_id,
            description=st.description,
            agent=st.agent,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata=meta,
        )
        await manager.add_task(new_task)


async def _handle_api_budget_exhaustion(task: Task, manager: QueueManager):
    logger.error(
        f"[bold red][!] ORCAMENTO ESGOTADO[/] Falha na tarefa [cyan]{task.id}[/]."
    )
    await manager.update_task_status(task.id, "pending")
    await manager.update_task_metadata(
        task.id, {"workflow_status": "pending_budget_exhausted"}, merge=True
    )

    now = datetime.now(timezone.utc)
    tomorrow = now.date() + timedelta(days=1)
    hibernation_target = datetime.combine(
        tomorrow, datetime.min.time(), tzinfo=timezone.utc
    )
    await manager.set_system_state("hibernation_until", hibernation_target.isoformat())

    notification_id = f"BUDGET-ALERT-{now.strftime('%Y%m%d')}"
    notification_desc = "ALERTA CRITICO: O orcamento diario de API foi esgotado. O sistema entrara em hibernacao ate o proximo ciclo."
    await _create_system_task(
        manager, notification_id, notification_desc, AGENT_CHICO, "critical"
    )


async def _handle_api_keys_exhaustion(task: Task, manager: QueueManager):
    logger.warning(
        f"[bold yellow][!] CHAVES TEMPORARIAMENTE EXAURIDAS[/] [cyan]{task.id}[/] devolvida e preservada na fila."
    )
    await manager.update_task_status(task.id, "pending")
    await manager.update_task_metadata(
        task.id, {"workflow_status": "pending_keys_exhausted"}, merge=True
    )

    now = datetime.now(timezone.utc)
    resume_time = now + timedelta(minutes=3)
    await manager.set_system_state("hibernation_until", resume_time.isoformat())


async def _handle_task_failure(
    e: Exception,
    task: Task,
    manager: QueueManager,
    start_time: float,
    timing_metrics: dict,
    response_text: str,
) -> None:
    """Isola a governanca de panico, esgotamento e curas do sistema."""
    if isinstance(e, APIBudgetExhaustedError):
        await _handle_api_budget_exhaustion(task, manager)
        return

    if isinstance(e, APIKeysExhaustedError):
        await _handle_api_keys_exhaustion(task, manager)
        return

    safe_err_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
    logger.error(
        f"[bold red][X] ENTROPIA DETECTADA[/] Tarefa [cyan]{task.id}[/] falhou nas maos de [{te._c(task.agent)}]{task.agent}[/].\n[dim]{safe_err_msg}[/]"
    )
    await manager.update_task_status(task.id, "failed")

    fail_metadata = {
        "workflow_status": "failed",
        "workflow_duration_ms": int((time.monotonic() - start_time) * 1000),
        "last_error_class": type(e).__name__,
        "last_error_message": safe_err_msg[:400],
    }
    fail_metadata.update(timing_metrics)
    await manager.update_task_metadata(task.id, fail_metadata, merge=True)

    duration = time.monotonic() - start_time
    write_economic_log(task, duration, "FAILED")
    send_toast(
        "Entropia Sistemica (CRITICAL)", f"Falha na tarefa do {task.agent}.", "error"
    )

    is_system_task = task.id.startswith(("AUTOFIX", "RESONANCE", "HANDOFF"))
    if not is_system_task:
        safe_response = (
            response_text[:1000].encode("ascii", "backslashreplace").decode("ascii")
        )
        fix_id = f"AUTOFIX-{task.id}"
        fix_desc = f"[AUTO-CORRECAO SOTA | LEI ZERO]\nA tarefa '{task.id}' falhou. Diagnostico Bayesiano exigido.\nErro: {safe_err_msg}\nResposta original: {safe_response}"
        if await _create_system_task(manager, fix_id, fix_desc, task.agent, "critical"):
            logger.info(
                f"[bold orange3][+] AUTO-CURA[/] Anticorpos acionados via {task.agent} para a tarefa [cyan]{task.id}[/]"
            )

        resonance_id = f"RESONANCE-{task.id}"
        resonance_desc = f"[AUDITORIA FRACTAL | LEI ZERO]\nA tarefa '{task.id}' quebrou. Steelmaning do bug obrigatorio."
        await _create_system_task(
            manager, resonance_id, resonance_desc, AGENT_MAVERICK, "high"
        )


async def _process_observers_and_handoff(task: Task, manager: QueueManager) -> None:
    await _notify_observers(task, manager)

    autonomy_mode = await get_autonomy_mode(manager)
    if (
        autonomy_mode == "off"
        or task.id.startswith("AUTOFIX")
        or task.agent == AGENT_DISPATCHER
    ):
        return

    next_agent = te.HANDOFF_PIPELINE.get(task.agent)
    if not next_agent:
        return

    if autonomy_mode == "partial" and next_agent == AGENT_IMPLEMENTOR:
        logger.info(
            f"[AUTONOMIA PARCIAL] Fluxo pausado. A etapa critica do {next_agent} exige comando manual."
        )
        return

    handoff_id = f"HANDOFF-{task.id[-10:]}-{next_agent.strip('@').upper()}"
    if not await manager.get_task(handoff_id):
        new_task = Task(
            id=handoff_id,
            description=f"O agente {task.agent} concluiu sua etapa. Analise '.claude/task_results/{task.id}.md' e execute a sua.",
            agent=next_agent,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        await manager.add_task(new_task)
        logger.info(
            f"[bold magenta][->] HANDOFF[/] O bastao foi passado para [{te._c(next_agent)}]{next_agent}[/]"
        )


async def _notify_observers(task: Task, manager: QueueManager) -> None:
    observers = task.metadata.get("observers", []) if task.metadata else []
    for observer in observers:
        logger.info(
            f"[[{te._c(observer)}]{observer}[/]] [bold yellow]OBSERVER SOTA[/] Gerando notificacao estrategica referente a tarefa {task.id}."
        )
        notification_id = f"NOTIFY-{task.id[-10:]}-{observer.strip('@').upper()}"
        if not await manager.get_task(notification_id):
            notification_task = Task(
                id=notification_id,
                description=f"[NOTIFICACAO DE SENTINELA]\nA tarefa epica '{task.id}' foi concluida. Audite o resultado.",
                agent=observer,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={
                    "reference_task": task.id,
                    "priority": "high",
                    "reason": "epic_task_observer_notification",
                },
            )
            await manager.add_task(notification_task)


def _save_task_result_sync(task_id: str, agent: str, response_text: str) -> None:
    """Descarrega a gravacao em disco do resultado para uma thread limpa."""
    safe_task_id = Path(task_id).name
    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    with open(result_dir / f"{safe_task_id}.md", "w", encoding="utf-8") as f:
        f.write(f"# Resposta: {task_id} ({agent})\n\n{response_text}")


def _set_task_completed_at_sync(db_path: str | os.PathLike[str], task_id: str) -> None:
    with sqlite3.connect(db_path) as db:
        db.execute(
            "UPDATE tasks SET completedAt = ? WHERE id = ?",
            (datetime.now(timezone.utc).isoformat(), task_id),
        )
        db.commit()


async def _finish_task_success(
    task: Task,
    manager: QueueManager,
    start_time: float,
    modified_files: list,
    timing_metrics: dict,
) -> None:
    await manager.update_task_status(task.id, "completed")
    try:
        await asyncio.to_thread(_set_task_completed_at_sync, manager.db_path, task.id)
    except Exception:  # noqa: BLE001
        logger.exception("[SISTEMA] Falha ao registrar completedAt")

    logger.info(
        f"[bold green][OK] SIMETRIA ALCANCADA[/] [cyan]{task.id}[/] concluida por [{te._c(task.agent)}]{task.agent}[/]"
    )

    duration = time.monotonic() - start_time
    final_metadata: dict[str, Any] = {
        "workflow_duration_ms": int(duration * 1000),
        "workflow_status": "completed",
    }
    if modified_files:
        final_metadata["files_changed"] = modified_files
    final_metadata.update(timing_metrics)
    await manager.update_task_metadata(task.id, final_metadata, merge=True)
    write_economic_log(task, duration, "COMPLETED")

    priority = task.metadata.get("priority", "medium") if task.metadata else "medium"
    if priority in ["high", "critical"]:
        send_toast(
            f"Simetria ({priority.upper()})",
            f"A tarefa critica foi concluida pelo {task.agent}.",
            "success",
        )


async def execute_task_workflow(task: Task, manager: QueueManager):
    """
    Orquestrador de Fluxo Funcional SOTA. Processa de maneira limpa o ciclo de vida.
    """
    # SOTA Guard: Bloqueio de Hibernação Inteligente
    if await is_cognitive_hibernation_active(manager, task):
        logger.warning(
            f"[{te._c(task.agent)}]{task.agent}[/] Hibernação cognitiva ativa. Preservando tarefa [cyan]{task.id}[/]."
        )
        await manager.update_task_status(task.id, "pending")
        return

    # --- SOTA DELEGATION: Oraculo de Borda (@gemma4) ---
    if task.agent == "@gemma4" or task.agent == "@gemma":
        logger.info(
            f"[[{te._c(task.agent)}]{task.agent}[/]] Delegando para o Motor Cognitivo Local (Pure Engine)..."
        )
        try:
            await local_engine.process_agent_task(task, manager)
            return
        except Exception:
            logger.exception(
                "Falha no Motor Local. Tentando workflow padrão como fallback..."
            )

    start_time = time.monotonic()
    timing_metrics = {}
    response_text = ""
    try:
        await manager.update_task_metadata(
            task.id,
            {"workflow_started_at": datetime.now(timezone.utc).isoformat()},
            merge=True,
        )
        response_text = await process_agent_task(task, manager, timing_metrics)

        await asyncio.to_thread(
            _save_task_result_sync, task.id, task.agent, response_text
        )

        modified_files = await apply_god_mode(response_text, manager)

        if task.agent == AGENT_DISPATCHER:
            await _process_dispatcher_output(task, manager, response_text)

        await _finish_task_success(
            task, manager, start_time, modified_files, timing_metrics
        )
        await _process_observers_and_handoff(task, manager)
        gc.collect()

    except Exception as e:  # noqa: BLE001
        await _handle_task_failure(
            e, task, manager, start_time, timing_metrics, response_text
        )
