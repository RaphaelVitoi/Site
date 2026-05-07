"""
Dispatcher -- Parser e retry de schema JSON para decomposicao de tarefas.
"""

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, field_validator

import core.runtime as te
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.orchestrator import call_llm_api

logger = logging.getLogger(__name__)

AGENT_DISPATCHER = "@dispatcher"
AGENT_IMPLEMENTOR = "@implementor"


class DispatcherSubtask(BaseModel):
    description: str = Field(min_length=5)
    agent: str = Field(..., pattern=r"^@[\w]+$")
    depends_on: list[int] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("agent", mode="before")
    @classmethod
    def validate_known_agent(cls, v: str) -> str:
        if not isinstance(v, str) or not v.startswith("@"):
            return AGENT_IMPLEMENTOR
        if v not in te.VALID_AGENTS:
            return AGENT_IMPLEMENTOR
        return v

    @field_validator("depends_on")
    @classmethod
    def validate_depends_on(cls, deps: list[int]) -> list[int]:
        if any(idx < 0 for idx in deps):
            raise ValueError("depends_on nao pode conter indices negativos.")
        return deps


def _extract_dispatcher_json_array(response_text: str) -> str:
    """Busca estruturada baseada em pilha (O(N)), imune a lixo apos o JSON."""
    start_idx = response_text.find("[")
    if start_idx == -1:
        raise ValueError("Nenhum array JSON localizado na resposta do @dispatcher.")

    stack = 0
    in_string = False
    escape = False

    for i, char in enumerate(response_text[start_idx:], start=start_idx):
        if escape:
            escape = False
        elif char == "\\":
            escape = True
        elif char == '"':
            in_string = not in_string
        elif not in_string:
            if char == "[":
                stack += 1
            elif char == "]":
                stack -= 1
                if stack == 0:
                    return response_text[start_idx : i + 1]

    raise ValueError("Matriz JSON nao fechada corretamente.")


def _normalize_loaded_json(loaded: Any) -> list:
    """Garante que o json carregado seja uma lista valida."""
    if isinstance(loaded, dict):
        if "description" in loaded and "agent" in loaded:
            return [loaded]
        for val in loaded.values():
            if isinstance(val, list):
                return val
    return loaded if isinstance(loaded, list) else []


def _validate_dependencies(parsed: list[DispatcherSubtask]) -> None:
    for i, subtask in enumerate(parsed):
        if any(dep >= i for dep in subtask.depends_on):
            raise ValueError(
                f"Subtarefa {i} possui dependencia futura invalida: {subtask.depends_on}"
            )


def _parse_dispatcher_subtasks_strict(response_text: str) -> list[DispatcherSubtask]:
    # SOTA: Limpeza robusta contra ruidos markdown e artefatos verbosos do LLM
    cleaned = response_text.strip()
    cleaned = re.sub(
        r"(^```(?:json)?)|(```$)", "", cleaned, flags=re.IGNORECASE | re.MULTILINE
    ).strip()

    loaded = None
    try:
        # Tentativa 1: Parse direto do bloco limpo
        loaded = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.debug(
            f"Tentativa 1 de parse JSON falhou: {e}. Iniciando extrator de matriz..."
        )
        try:
            # Tentativa 2: Extrator original de matriz por pilha (ignora texto ao redor)
            raw_json = _extract_dispatcher_json_array(response_text)
            loaded = json.loads(raw_json)
        except Exception as e:  # noqa: BLE001
            # SOTA (Correcao 2): Removida a regex destrutiva que corrompia literais.
            raise ValueError(f"Falha irrevogavel no parser JSON estrutural: {e!s}")

    loaded = _normalize_loaded_json(loaded)

    if not isinstance(loaded, list) or not loaded:
        raise ValueError("O JSON retornado nao contem uma matriz de tarefas valida.")

    parsed = [DispatcherSubtask.model_validate(item) for item in loaded]
    _validate_dependencies(parsed)
    return parsed


async def _retry_dispatcher_schema_once(
    task: Task, manager: QueueManager, invalid_response: str
) -> list[DispatcherSubtask] | None:
    if not te._feature_enabled("enable_dispatcher_schema_retry"):
        return None

    retry_limit = te._agent_sla_value(task.agent, "dispatcher_schema_retries", 1)
    if retry_limit <= 0:
        return None

    schema_prompt = (
        "Corrija a saida anterior para JSON valido ESTRITO. "
        "Retorne APENAS um array JSON de objetos com chaves: "
        "description (string), agent (@agente_valido), depends_on (array de indices inteiros), metadata (objeto). "
        "Sem markdown, sem comentarios, sem texto extra."
    )
    user_prompt = (
        f"TAREFA BASE:\nID: {task.id}\nDescricao: {task.description}\n\n"
        f"SAIDA INVALIDA A CORRIGIR:\n{invalid_response[:8000]}\n\n{schema_prompt}"
    )
    system_prompt = (
        "Voce e um normalizador de schema JSON para o dispatcher. "
        "A resposta deve ser exclusivamente JSON valido."
    )
    retry_task = Task(
        id=f"{task.id}-DISPATCHER-RETRY",
        description=f"Retry schema dispatcher para {task.id}",
        agent=AGENT_DISPATCHER,
        timestamp=datetime.now(timezone.utc).isoformat(),
        metadata={"priority": "high", "origin_task_id": task.id},
    )
    logger.warning(
        f"[{task.id}] Retry unico do dispatcher ativado para corrigir schema JSON."
    )
    fixed_response = await call_llm_api(
        retry_task, system_prompt, user_prompt, manager, require_json=True
    )
    try:
        return _parse_dispatcher_subtasks_strict(fixed_response)
    except Exception as retry_error:  # noqa: BLE001
        logger.error(
            f"[{task.id}] Retry do dispatcher nao normalizou schema: {retry_error}"
        )
        return None
