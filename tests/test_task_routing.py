import pytest
import asyncio
from unittest.mock import AsyncMock
from datetime import datetime
import json

# Importar o módulo e as classes necessárias
import task_executor
from task_executor import (
    Task,
    _create_dispatcher_fallback_plan,
)

# Mock AGENTS_MANIFEST para garantir que os agentes existam para validação
MOCK_AGENTS_MANIFEST = {
    "architect": {"routing_pattern": "design|conceito", "primary_model": "gemini-2.5-pro"},
    "maverick": {"routing_pattern": "estrategi|inova", "primary_model": "gemini-2.5-pro"},
    "pesquisador": {"routing_pattern": "pesquis|busc", "primary_model": "gemini-2.5-pro"},
    "planner": {"routing_pattern": "planej|prd", "primary_model": "gemini-2.5-pro"},
    "securitychief": {"routing_pattern": "seguran|privacy", "primary_model": "gemini-2.5-pro"},
    "validador": {"routing_pattern": "matematic|icm", "primary_model": "gemini-2.5-pro"},
    "implementor": {"routing_pattern": "codar|implement", "primary_model": "gemini-2.5-flash"},
    "verifier": {"routing_pattern": "test|bug", "primary_model": "gemini-2.5-flash"},
    "curator": {"routing_pattern": "estetic|ux", "primary_model": "gemini-2.5-pro"},
    "chico": {"routing_pattern": "sintese|orquestra", "primary_model": "gemini-2.5-pro"},
    "sequenciador": {"routing_pattern": "sequenci|fila", "primary_model": "gemini-2.5-flash"},
    "organizador": {"routing_pattern": "organiz|documenta", "primary_model": "meta-llama/llama-3.1-8b-instruct"},
    "dispatcher": {"routing_pattern": "backlog|ideias", "primary_model": "gemini-2.5-flash"},
}

MOCK_VALID_AGENTS = list(f"@{name}" for name in MOCK_AGENTS_MANIFEST.keys())

@pytest.fixture(autouse=True)
def patch_dependencies(monkeypatch):
    """
    Usa o monkeypatch do pytest para substituir as dependências globais
    do módulo task_executor durante os testes.
    """
    # Garante que os testes usem a nossa lista de agentes mockada
    monkeypatch.setattr(task_executor, 'VALID_AGENTS', MOCK_VALID_AGENTS)
    monkeypatch.setattr(task_executor, 'AGENTS_MANIFEST', MOCK_AGENTS_MANIFEST)

    # Mock para a função que verifica as flags de feature
    def mock_feature_enabled(flag_name: str) -> bool:
        # Para os testes, vamos assumir que todas as flags estão ativadas
        return True
    monkeypatch.setattr(task_executor, '_feature_enabled', mock_feature_enabled)

    # Mock para a função que lê os termos heurísticos
    def mock_heuristic_terms(group_name: str) -> list[str]:
        # Usa os valores default definidos no próprio task_executor
        return task_executor.DEFAULT_ROUTING_HEURISTICS.get(group_name, [])
    monkeypatch.setattr(task_executor, '_heuristic_terms', mock_heuristic_terms)


@pytest.fixture
def mock_queue_manager():
    """Cria um mock para o QueueManager."""
    manager = AsyncMock()
    manager.add_task = AsyncMock()
    manager.get_task = AsyncMock(return_value=None)
    manager.update_task_metadata = AsyncMock()
    return manager

@pytest.mark.asyncio
async def test_dispatcher_fallback_plan_basic_flow(mock_queue_manager):
    """Testa o fluxo básico sem termos especiais."""
    original_task = Task(
        id="TEST-001",
        description="Desenvolver uma nova feature.",
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "medium"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = {t.agent for t in added_tasks}

    # Verifica a pipeline base
    expected_agents = {"@architect", "@planner", "@implementor", "@verifier", "@curator"}
    assert expected_agents.issubset(added_agent_ids)

    # Verifica se o reason_code foi adicionado
    metadata_update_call = mock_queue_manager.update_task_metadata.call_args[0][1]
    assert "dispatcher_fallback_activated" in metadata_update_call["reason_codes"]

@pytest.mark.asyncio
@pytest.mark.parametrize("description, expected_agent, expected_gate", [
    ("Validar a matemática do ICM para um novo simulador.", "@validador", "gate_domain_validation"),
    ("Desenvolver um novo componente UI em Next.js para o frontend.", "@implementor", "gate_web_infra"),
    ("Otimizar o fluxo de tarefas e a fila no task_executor.py.", "@chico", "gate_orchestration"),
    ("Analisar a segurança e autenticação do novo login.", "@securitychief", "gate_security"),
    ("Pesquisar o mercado de concorrentes para a nova feature.", "@pesquisador", "gate_research"),
    ("Definir a visão de produto e estratégia para o Q3.", "@maverick", "gate_strategy"),
])
async def test_dispatcher_fallback_with_heuristic_gates(mock_queue_manager, description, expected_agent, expected_gate):
    """Testa a injeção de agentes especialistas com base em palavras-chave."""
    original_task = Task(
        id=f"TEST-{expected_gate}",
        description=description,
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "high"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]
    added_agent_ids = {t.agent for t in added_tasks}

    # Verifica se o agente especialista foi injetado na pipeline
    assert expected_agent in added_agent_ids

    # Verifica se o reason_code correto foi adicionado
    metadata_update_call = mock_queue_manager.update_task_metadata.call_args[0][1]
    assert expected_gate in metadata_update_call["reason_codes"]

@pytest.mark.asyncio
async def test_task_dependency_creation(mock_queue_manager):
    """Verifica se as dependências entre as tarefas são criadas corretamente."""
    original_task = Task(
        id="TEST-DEPS",
        description="Criar uma feature complexa com pesquisa e segurança.",
        agent="@dispatcher",
        timestamp=datetime.now().isoformat(),
        metadata={"priority": "high"}
    )

    await _create_dispatcher_fallback_plan(original_task, mock_queue_manager)

    added_tasks = [call.args[0] for call in mock_queue_manager.add_task.call_args_list]

    # Mapeia ID da tarefa para a própria tarefa para fácil consulta
    task_map = {task.id: task for task in added_tasks}

    # Exemplo: a tarefa do @planner deve depender da do @architect e @pesquisador
    planner_task = next((t for t in added_tasks if t.agent == "@planner"), None)
    assert planner_task is not None
    assert planner_task.metadata is not None

    dependencies = planner_task.metadata.get("depends_on", [])
    assert isinstance(dependencies, list)
    assert len(dependencies) > 0 # Deve depender de algo

    # Verifica se as dependências existem no mapa de tarefas criadas
    for dep_id in dependencies:
        assert dep_id in task_map
        # Verifica se a tarefa dependente foi criada antes na pipeline
        dependent_task = task_map[dep_id]
        assert dependent_task.agent in ["@architect", "@pesquisador", "@maverick"]


# ---------------------------------------------------------------------------
# Teste de validação de modelos: elimina a classe de bug "modelo fantasma"
# ---------------------------------------------------------------------------

KNOWN_VALID_MODEL_PREFIXES = (
    "gemini-2.",
    "claude-",
    "meta-llama/",
    "deepseek/",
    "mistralai/",
    "qwen",
)

GHOST_MODEL_PATTERNS = (
    "gemini-3.",   # nunca existiu na API Google
    "gemini-1.",   # descontinuado
)


def _load_json(path: str):
    import json
    from pathlib import Path
    with open(Path(path), encoding="utf-8-sig") as f:
        return json.load(f)


def _collect_models_from_routing_map() -> list:
    data = _load_json("data/routing_map.json")
    models = []
    for key in ("deep_thinking", "fast_operations"):
        models.extend(data.get(key, []))
    return models


def _collect_models_from_manifest() -> list:
    data = _load_json("data/agents_manifest.json")
    return [agent.get("primary_model", "") for agent in data.values() if agent.get("primary_model")]


def test_routing_map_sem_modelos_fantasma():
    """Nenhum modelo em routing_map.json pode corresponder a padrões inválidos."""
    models = _collect_models_from_routing_map()
    assert models, "routing_map.json deve ter pelo menos um modelo"
    for model in models:
        for ghost in GHOST_MODEL_PATTERNS:
            assert ghost not in model, (
                f"Modelo fantasma detectado em routing_map.json: '{model}' contém '{ghost}'. "
                "Atualizar para gemini-2.5-pro ou gemini-2.5-flash."
            )


def test_agents_manifest_sem_modelos_fantasma():
    """Nenhum primary_model em agents_manifest.json pode corresponder a padrões inválidos."""
    models = _collect_models_from_manifest()
    assert models, "agents_manifest.json deve ter pelo menos um primary_model"
    for model in models:
        for ghost in GHOST_MODEL_PATTERNS:
            assert ghost not in model, (
                f"Modelo fantasma detectado em agents_manifest.json: '{model}' contém '{ghost}'."
            )


def test_routing_map_modelos_conhecidos():
    """Todos os modelos em routing_map.json devem ter prefixo de provider reconhecido."""
    models = _collect_models_from_routing_map()
    for model in models:
        known = any(model.startswith(p) or p in model for p in KNOWN_VALID_MODEL_PREFIXES)
        assert known, (
            f"Modelo desconhecido em routing_map.json: '{model}'. "
            f"Prefixos válidos: {KNOWN_VALID_MODEL_PREFIXES}"
        )
