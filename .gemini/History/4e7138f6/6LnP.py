"""
Fallback do Dispatcher -- Plano de contingencia quando o @dispatcher nao retorna JSON valido.
"""
# pylint: disable=protected-access

import json
import logging
from datetime import datetime, timezone

import core.runtime as te
from core.schemas import Task
from database.queue_manager import QueueManager
from utils.heuristics import _calculate_heuristic_score
from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

AGENT_ARCHITECT = "@architect"
AGENT_CURATOR = "@curator"
AGENT_IMPLEMENTOR = "@implementor"
AGENT_MAVERICK = "@maverick"
AGENT_PESQUISADOR = "@pesquisador"
AGENT_PLANNER = "@planner"
AGENT_SECURITYCHIEF = "@securitychief"
AGENT_VALIDADOR = "@validador"
AGENT_VERIFIER = "@verifier"


def _feature_enabled(flag_name: str) -> bool:
    """Resolve flag com prioridade para task_executor quando presente (facilita testes)."""
    try:
        import task_executor as _task_executor  # import local para evitar ciclo no startup

        if hasattr(_task_executor, "_feature_enabled"):
            return bool(_task_executor._feature_enabled(flag_name))
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.debug("Bypass local de task_executor falhou em _feature_enabled: %s", e)

    if hasattr(te, "_feature_enabled"):
        return bool(te._feature_enabled(flag_name))
    return False


def _heuristic_terms(group_name: str) -> dict[str, int]:
    """Resolve termos heurísticos com fallback para task_executor (testability)."""
    try:
        import task_executor as _task_executor

        if hasattr(_task_executor, "_heuristic_terms"):
            res = _task_executor._heuristic_terms(group_name)
            if isinstance(res, dict):
                return res
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.debug("Bypass local de task_executor falhou em _heuristic_terms: %s", e)

    if hasattr(te, "_heuristic_terms"):
        res = te._heuristic_terms(group_name)
        if isinstance(res, dict):
            return res
    return {}


def _process_conditional_injection(
    injection: dict, context_blob: str, route_agents: list, reason_codes: list
) -> None:
    gate = injection.get("gate")
    heuristic_group = injection.get("heuristic")
    agent_to_inject = injection.get("agent")
    position = injection.get("position", len(route_agents))

    if not (gate and heuristic_group and agent_to_inject and _feature_enabled(gate)):
        return

    terms = _heuristic_terms(heuristic_group)
    score = _calculate_heuristic_score(context_blob, terms)
    if score >= te.HEURISTIC_THRESHOLD:
        if agent_to_inject not in route_agents:
            route_agents.insert(position, agent_to_inject)
        reason_code = gate.replace("enable_", "")
        if reason_code.endswith("_gate"):
            reason_code = f"gate_{reason_code[:-5]}"
        if reason_code not in reason_codes:
            reason_codes.append(reason_code)


def _get_fallback_route(task: Task) -> tuple[list, list]:
    """Computa a rota de fallback dinamicamente baseada em heurísticas e configuração."""
    description = enforce_pure_ascii((task.description or "").lower())
    metadata_blob = json.dumps(task.metadata or {}, ensure_ascii=True).lower()
    context_blob = f"{description} {metadata_blob}"

    fallback_config = te.SYSTEM_CONFIG.get("dispatcher_fallback_config", {})
    base_pipeline = fallback_config.get(
        "base_pipeline",
        [
            AGENT_ARCHITECT,
            AGENT_PLANNER,
            AGENT_IMPLEMENTOR,
            AGENT_VERIFIER,
            AGENT_CURATOR,
        ],
    )
    conditional_injections = fallback_config.get("conditional_injections", [])

    route_agents = list(base_pipeline)
    reason_codes = ["dispatcher_fallback_activated"]

    if _feature_enabled("enable_dynamic_fallback"):
        for injection in conditional_injections:
            _process_conditional_injection(
                injection, context_blob, route_agents, reason_codes
            )

    # SOTA: Remove duplicatas preservando a ordem
    route_agents = list(dict.fromkeys(route_agents))
    return route_agents, reason_codes


def _generate_fallback_specs(task_id: str, route_agents: list) -> list:
    """Gera as especificações (prompts e dependências) para cada etapa da rota de fallback."""
    stage_prompts = {
        AGENT_ARCHITECT: (
            f"Fallback automatico do dispatcher para a tarefa base {task_id}. \n"
            f"Analise '.claude/task_results/{task_id}.md' e consolide um blueprint \n"
            f"arquitetural objetivo com escopo, restricoes e criterios de sucesso."
        ),
        AGENT_MAVERICK: (
            f"Refine estrategicamente a direcao da tarefa base {task_id}, validando \n"
            f"tradeoffs, riscos e antevisao antes da fase de planejamento detalhado."
        ),
        AGENT_PESQUISADOR: (
            f"Execute pesquisa aplicada para a tarefa base {task_id}: referencias \n"
            f"externas, benchmark e dados de apoio para reduzir incerteza antes."
        ),
        AGENT_PLANNER: (
            f"Detalhe o plano executavel da tarefa base {task_id}, com milestones, \n"
            f"dependencias e criterios de aceite."
        ),
        AGENT_SECURITYCHIEF: (
            f"Audite vetores de seguranca da tarefa base {task_id} (auth, segredos, \n"
            f"permissao, superficie) e entregue diretrizes obrigatorias para implementacao."
        ),
        AGENT_VALIDADOR: (
            f"Valide premissas de dominio da tarefa base {task_id} (regras, calculos \n"
            f"e consistencia tecnica) antes da implementacao."
        ),
        AGENT_IMPLEMENTOR: (
            f"Execute a implementacao da tarefa base {task_id} conforme plano aprovado, \n"
            f"preservando routing, integridade e estabilidade sistemica."
        ),
        AGENT_VERIFIER: (
            f"Valide funcionalmente a entrega da tarefa base {task_id} (task -> queue -> \n"
            f"worker -> resposta) e reporte riscos residuais com criterio tecnico."
        ),
        AGENT_CURATOR: (
            f"Curadoria final da tarefa base {task_id} apos verificacao: refinar \n"
            f"clareza, consistencia e alinhamento sem alterar o comportamento funcional."
        ),
    }

    fallback_specs = []
    for idx, agent in enumerate(route_agents, start=1):
        fallback_specs.append(
            {
                "suffix": f"SUB-{idx}",
                "agent": agent,
                "description": stage_prompts.get(
                    agent, f"Execute a sua etapa para a tarefa base {task_id}."
                ),
                "depends_on": [idx - 2] if idx > 1 else [],
            }
        )
    return fallback_specs


async def _create_dispatcher_fallback_plan(task: Task, manager: QueueManager):
    """
    Orquestrador de Fallback: Isola aquisicao de rota, geracao de specs e enfileiramento.
    Reducao drastica de complexidade ciclica via pipeline de funcoes puras.
    """
    route_agents, reason_codes = _get_fallback_route(task)
    fallback_specs = _generate_fallback_specs(task.id, route_agents)
    created_ids = []
    for spec in fallback_specs:
        sub_id = f"{task.id}-{spec['suffix']}"
        created_ids.append(sub_id)
        if await manager.get_task(sub_id):
            continue

        meta = task.metadata.copy() if task.metadata else {}
        meta["priority"] = meta.get("priority", "high")
        meta.pop("depends_on", None)
        meta["fallback_route"] = route_agents
        meta["route_selected"] = route_agents
        existing_reasons = list(meta.get("reason_codes", []))
        for code in reason_codes:
            if code not in existing_reasons:
                existing_reasons.append(code)
        meta["reason_codes"] = existing_reasons
        depends_on = [
            created_ids[idx] for idx in spec["depends_on"] if idx < len(created_ids)
        ]
        if depends_on:
            meta["depends_on"] = depends_on

        new_task = Task(
            id=sub_id,
            description=spec["description"],
            agent=spec["agent"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata=meta,
        )
        await manager.add_task(new_task)

    metadata_patch = {
        "fallback_route": route_agents,
        "route_selected": route_agents,
        "reason_codes": reason_codes,
    }
    await manager.update_task_metadata(task.id, metadata_patch, merge=True)

    logger.info(
        "[bold yellow][RECOVERY][/] Dispatcher fallback ativado em [cyan]%s[/] com "
        "cadeia [bold]%s[/].",
        task.id,
        " -> ".join(route_agents),
    )
