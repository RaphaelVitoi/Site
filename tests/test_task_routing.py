"""
Testes para validacao do sistema de roteamento de agentes no Task Executor.
Cobre: escalada por complexidade, heuristica, observers e validacao de modelos.
"""

# pylint: disable=protected-access

import json
from pathlib import Path

import pytest

import task_executor
from task_executor import _intelligent_route_task

REPO_ROOT = Path(__file__).resolve().parents[1]

# ==============================================================================
# Mock Data
# ==============================================================================

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

MOCK_VALID_AGENTS = [f"@{name}" for name in MOCK_AGENTS_MANIFEST]

KNOWN_VALID_MODEL_PREFIXES = (
    "gemini-2.",
    "claude-",
    "meta-llama/",
    "deepseek/",
    "mistralai/",
    "qwen",
)

GHOST_MODEL_PATTERNS = (
    "gemini-3.",  # nunca existiu na API Google
    "gemini-1.",  # descontinuado
)


# ==============================================================================
# Fixtures
# ==============================================================================


@pytest.fixture(autouse=True)
def patch_dependencies(monkeypatch) -> None:
    """Substitui dependencias globais do task_executor com mocks isolados."""
    monkeypatch.setattr(task_executor._core_config, "VALID_AGENTS", MOCK_VALID_AGENTS)
    monkeypatch.setattr(task_executor._core_config, "feature_enabled", lambda _: True)
    monkeypatch.setattr(task_executor._core_config, "HEURISTIC_THRESHOLD", 2)
    monkeypatch.setattr(
        task_executor._core_config,
        "heuristic_terms",
        {
            "strategic_terms": {"estrateg": 3},
            "research_terms": {"pesquisa": 2},
            "security_terms": {"auth": 3, "seguranca": 3},
            "web_infra_terms": {"next.js": 3, "frontend": 2},
            "orchestration_terms": {"orquestracao": 3},
            "domain_terms": {"icm": 3, "gto": 3},
        }.__getitem__,
    )


# ==============================================================================
# Roteamento Inteligente
# ==============================================================================


@pytest.mark.unit
def test_intelligent_route_task_complexity_escalation() -> None:
    """Tarefas com descricao longa (>150 palavras) devem ser escaladas ao @dispatcher."""
    long_desc = "palavra " * 160
    agent, meta = _intelligent_route_task(long_desc, "@implementor")
    assert agent == "@dispatcher"
    assert "@maverick" in meta.get("observers", [])


@pytest.mark.unit
def test_intelligent_route_task_heuristic_routing() -> None:
    """Tarefa sem agente explicitado deve ser roteada por heuristica de dominio."""
    agent, meta = _intelligent_route_task("Precisamos validar o icm e o gto da mao.", None)
    assert agent == "@validador"
    assert "heuristic_score" in meta


@pytest.mark.unit
def test_intelligent_route_task_frontend_observer() -> None:
    """Tarefas de frontend devem adicionar @curator como observer automaticamente."""
    agent, meta = _intelligent_route_task(
        "Ajustar o layout e a interface do frontend em next.js para suportar a "
        "visualizacao correta e otimizada dos paineis de telemetria",
        "@implementor",
    )
    assert agent == "@implementor"
    assert "@curator" in meta.get("observers", [])


@pytest.mark.unit
def test_intelligent_route_task_preserves_explicit_agent() -> None:
    """Agente explicitamente atribuido deve ser preservado se sem escalada."""
    agent, _ = _intelligent_route_task("Tarefa curta simples.", "@verifier")
    assert agent == "@verifier"


# ==============================================================================
# Validacao de Modelos (elimina classe de bug 'modelo fantasma')
# ==============================================================================


def _load_json(path: Path) -> dict:
    with open(path, encoding="utf-8-sig") as f:
        return json.load(f)


def _collect_models_from_routing_map() -> list[str]:
    data = _load_json(REPO_ROOT / "data" / "routing_map.json")
    models: list[str] = []
    for key in ("deep_thinking", "fast_operations"):
        models.extend(data.get(key, []))
    return models


def _collect_models_from_manifest() -> list[str]:
    data = _load_json(REPO_ROOT / "data" / "agents_manifest.json")
    return [agent.get("primary_model", "") for agent in data.values() if agent.get("primary_model")]


@pytest.mark.unit
def test_routing_map_sem_modelos_fantasma() -> None:
    """Nenhum modelo em routing_map.json pode corresponder a padroes invalidos."""
    models = _collect_models_from_routing_map()
    assert models, "routing_map.json deve ter pelo menos um modelo"
    for model in models:
        for ghost in GHOST_MODEL_PATTERNS:
            assert ghost not in model, (
                f"Modelo fantasma detectado em routing_map.json: '{model}' contem '{ghost}'. "
                "Atualizar para gemini-2.5-pro ou gemini-2.5-flash."
            )


@pytest.mark.unit
def test_agents_manifest_sem_modelos_fantasma() -> None:
    """Nenhum primary_model em agents_manifest.json pode corresponder a padroes invalidos."""
    models = _collect_models_from_manifest()
    assert models, "agents_manifest.json deve ter pelo menos um primary_model"
    for model in models:
        for ghost in GHOST_MODEL_PATTERNS:
            assert ghost not in model, f"Modelo fantasma detectado em agents_manifest.json: '{model}' contem '{ghost}'."


@pytest.mark.unit
def test_routing_map_modelos_conhecidos() -> None:
    """Todos os modelos em routing_map.json devem ter prefixo de provider reconhecido."""
    models = _collect_models_from_routing_map()
    for model in models:
        known = any(model.startswith(p) or p in model for p in KNOWN_VALID_MODEL_PREFIXES)
        assert known, (
            f"Modelo desconhecido em routing_map.json: '{model}'. Prefixos validos: {KNOWN_VALID_MODEL_PREFIXES}"
        )


@pytest.mark.unit
@pytest.mark.parametrize(
    "model",
    [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "meta-llama/llama-3.1-8b-instruct",
    ],
)
def test_known_model_prefixes_accept_valid_models(model: str) -> None:
    """Prefixos validos devem reconhecer os modelos canonicos do projeto."""
    assert any(model.startswith(p) or p in model for p in KNOWN_VALID_MODEL_PREFIXES), (
        f"Modelo canonico '{model}' nao reconhecido pelos prefixos validos"
    )
