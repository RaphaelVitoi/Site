"""
Fallback do Dispatcher -- Plano de contingencia quando o @dispatcher nao retorna JSON valido.
"""
import json
import logging
from datetime import datetime

from core.schemas import Task
from database.queue_manager import QueueManager
from utils.text import enforce_pure_ascii
from utils.heuristics import _calculate_heuristic_score


logger = logging.getLogger(__name__)


import core.runtime as te


def _get_fallback_route(task: Task) -> tuple[list, list]:
    """Computa a rota de fallback dinamicamente baseada em heurísticas e configuração."""
    description = enforce_pure_ascii((task.description or "").lower())
    metadata_blob = json.dumps(task.metadata or {}, ensure_ascii=True).lower()
    context_blob = f"{description} {metadata_blob}"

    fallback_config = te.SYSTEM_CONFIG.get("dispatcher_fallback_config", {})
    base_pipeline = fallback_config.get("base_pipeline", ["@architect", "@planner", "@implementor", "@verifier", "@curator"])
    conditional_injections = fallback_config.get("conditional_injections", [])

    route_agents = list(base_pipeline)
    reason_codes = ["dispatcher_fallback_activated"]

    if te._feature_enabled("enable_dynamic_fallback"):
        for injection in conditional_injections:
            gate = injection.get("gate")
            heuristic_group = injection.get("heuristic")
            agent_to_inject = injection.get("agent")
            position = injection.get("position", len(route_agents))

            if gate and heuristic_group and agent_to_inject and te._feature_enabled(gate):
                terms = te._heuristic_terms(heuristic_group)
                score = _calculate_heuristic_score(context_blob, terms)
                if score > te.HEURISTIC_THRESHOLD:
                    if agent_to_inject not in route_agents:
                        route_agents.insert(position, agent_to_inject)
                    reason_code = gate.replace("enable_", "")
                    if reason_code not in reason_codes:
                        reason_codes.append(reason_code)

    # SOTA: Remove duplicatas preservando a ordem
    route_agents = list(dict.fromkeys(route_agents))
    return route_agents, reason_codes

def _generate_fallback_specs(task_id: str, route_agents: list) -> list:
    """Gera as especificações (prompts e dependências) para cada etapa da rota de fallback."""
    stage_prompts = {
        "@architect": (
            f"Fallback automatico do dispatcher para a tarefa base {task_id}. "
            f"Analise '.claude/task_results/{task.id}.md' e consolide um blueprint arquitetural objetivo "
            f"com escopo, restricoes e criterios de sucesso."
        ),
        "@maverick": (
            f"Refine estrategicamente a direcao da tarefa base {task_id}, validando tradeoffs, riscos e antevisao "
            f"antes da fase de planejamento detalhado."
        ),
        "@pesquisador": (
            f"Execute pesquisa aplicada para a tarefa base {task_id}: referencias externas, benchmark e dados de apoio "
            f"para reduzir incerteza antes da implementacao."
        ),
        "@planner": (
            f"Detalhe o plano executavel da tarefa base {task.id}, com milestones, dependencias e criterios de aceite."
        ),
        "@securitychief": (
            f"Audite vetores de seguranca da tarefa base {task_id} (auth, segredos, permissao, superficie de ataque) "
            f"e entregue diretrizes obrigatorias para implementacao segura."
        ),
        "@validador": (
            f"Valide premissas de dominio da tarefa base {task_id} (regras, calculos e consistencia tecnica) "
            f"antes da implementacao."
        ),
        "@implementor": (
            f"Execute a implementacao da tarefa base {task_id} conforme plano aprovado, preservando routing, integridade "
            f"e estabilidade sistemica."
        ),
        "@verifier": (
            f"Valide funcionalmente a entrega da tarefa base {task_id} (task -> queue -> worker -> resposta) e reporte "
            f"riscos residuais com criterio tecnico."
        ),
        "@curator": (
            f"Curadoria final da tarefa base {task_id} apos verificacao: refinar clareza, consistencia e alinhamento "
            f"estrategico sem alterar o comportamento funcional."
        ),
    }

    fallback_specs = []
    for idx, agent in enumerate(route_agents, start=1):
        fallback_specs.append({
            "suffix": f"SUB-{idx}",
            "agent": agent,
            "description": stage_prompts.get(agent, f"Execute a sua etapa para a tarefa base {task_id}."),
            "depends_on": [idx - 2] if idx > 1 else []
        })
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
        depends_on = [created_ids[idx] for idx in spec["depends_on"] if idx < len(created_ids)]
        if depends_on:
            meta["depends_on"] = depends_on

        new_task = Task(
            id=sub_id,
            description=spec["description"],
            agent=spec["agent"],
            timestamp=datetime.now().isoformat(),
            metadata=meta
        )
        await manager.add_task(new_task)

    logger.info(
        f"[bold yellow][RECOVERY][/] Dispatcher fallback ativado em [cyan]{task.id}[/] com cadeia "
        f"[bold]{' -> '.join(route_agents)}[/]."
    )
