import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from pathlib import Path
import json

# Importar as funções e classes necessárias do task_executor.py
from task_executor import (
    Task,
    _create_dispatcher_fallback_plan,
    DEFAULT_ROUTING_HEURISTICS,
    DEFAULT_WORKFLOW_FLAGS,
    AGENTS_MANIFEST,
    _heuristic_terms,
    _feature_enabled
)

# Mock AGENTS_MANIFEST para garantir que os agentes existam para validação
AGENTS_MANIFEST = {
    "architect": {"routing_pattern": "design|conceito", "primary_model": "gemini-2.5-pro"},
    "maverick": {"routing_pattern": "estrategi|inova", "primary_model": "gemini-2.5-pro"},
    "pesquisador": {"routing_pattern": "pesquis|busc", "primary_model": "gemini-2.5-pro"},
    "planner": {"routing_pattern": "planej|prd", "primary_model": "gemini-2.5-pro"},
    "securitychief": {"routing_pattern": "seguran|privacy", "primary_model": "gemini-3.1-pro"},
    "validador": {"routing_pattern": "matematic|icm", "primary_model": "gemini-2.5-pro"},
    "implementor": {"routing_pattern": "codar|implement", "primary_model": "gemini-2.5-flash"},
    "verifier": {"routing_pattern": "test|bug", "primary_model": "gemini-2.5-flash"},
    "curator": {"routing_pattern": "estetic|ux", "primary_model": "gemini-2.5-pro"},
    "chico": {"routing_pattern": "sintese|orquestra", "primary_model": "gemini-2.5-pro"},
    "sequenciador": {"routing_pattern": "sequenci|fila", "primary_model": "gemini-2.5-flash"},
    "organizador": {"routing_pattern": "organiz|documenta", "primary_model": "meta-llama/llama-3.1-8b-instruct"},
}

# Mock VALID_AGENTS para o schema da Task
VALID_AGENTS = [f"@{agent}" for agent in AGENTS_MANIFEST.keys()]

# Mock _feature_enabled para controlar os gates nos testes
def mock_feature_enabled(flag_name: str) -> bool:
    return DEFAULT_WORKFLOW_FLAGS.get(flag_name, False)

# Substituir a função original pela mock nos testes
task_executor._feature_enabled = mock_feature_enabled

@pytest.fixture
def mock_queue_manager():
    manager = AsyncMock()
    manager.add_task = AsyncMock()
    manager.get_task = AsyncMock(return_value=None) # Assume tasks don't exist initially
    manager.update_task_metadata = AsyncMock()
    return manager

@pytest.mark.asyncio
async def test_dispatcher_fallback_plan_basic_flow(mock_queue_manager):
    task_description = "Desenvolver uma nova feature."
    original_task = Task(
        id="TEST-001",
        description=task_description,
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "medium"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    # Verifica se as tarefas básicas da pipeline foram adicionadas
    expected_agents = ["@architect", "@planner", "@implementor", "@verifier", "@curator"]
    assert mock_queue_manager.add_task.call_count >= len(expected_agents)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = [t.agent for t in added_tasks]

    for agent in expected_agents:
        assert agent in added_agent_ids

    # Verifica se o reason_code foi adicionado
    assert "dispatcher_fallback_activated" in mock_queue_manager.update_task_metadata.call_args[0][1]["reason_codes"]

@pytest.mark.asyncio
async def test_dispatcher_fallback_plan_with_domain_terms(mock_queue_manager):
    task_description = "Validar a matemática do ICM para um novo simulador."
    original_task = Task(
        id="TEST-002",
        description=task_description,
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "high"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = [t.agent for t in added_tasks]

    assert "@validador" in added_agent_ids
    assert "gate_domain_validation" in mock_queue_manager.update_task_metadata.call_args[0][1]["reason_codes"]

@pytest.mark.asyncio
async def test_dispatcher_fallback_plan_with_web_infra_terms(mock_queue_manager):
    task_description = "Desenvolver um novo componente UI em Next.js para o frontend."
    original_task = Task(
        id="TEST-003",
        description=task_description,
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "medium"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = [t.agent for t in added_tasks]

    assert "@implementor" in added_agent_ids # Implementor should be explicitly added due to web_infra
    assert "gate_web_infra" in mock_queue_manager.update_task_metadata.call_args[0][1]["reason_codes"]

@pytest.mark.asyncio
async def test_dispatcher_fallback_plan_with_orchestration_terms(mock_queue_manager):
    task_description = "Otimizar o fluxo de tarefas e a fila no task_executor.py."
    original_task = Task(
        id="TEST-004",
        description=task_description,
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "high"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = [t.agent for t in added_tasks]

    assert "@chico" in added_agent_ids # Chico should be explicitly added due to orchestration
    assert "gate_orchestration" in mock_queue_manager.update_task_metadata.call_args[0][1]["reason_codes"]

# Você pode adicionar mais testes para outras heurísticas (research, strategic, security)
# e para combinações de heurísticas, garantindo que a ordem dos agentes seja a esperada.
