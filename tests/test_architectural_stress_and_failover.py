# tests/test_architectural_stress_and_failover.py
# Protocolo Chico SOTA v8.0 GOLD - Bateria Empirica de Estresse, Failover e Memoria
# pylint: disable=redefined-outer-name
from __future__ import annotations

import json
import uuid
from pathlib import Path
from unittest.mock import patch

import pytest

from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    _block_key,
    _is_key_blocked,
    _rank_keys_by_health,
)
from llm.routing import _infer_provider_for_model, _score_model
from utils.cache import SOTACache
from utils.ram_optimizer import optimize_ollama_keepalive

# Ate 2026-08-30 o manifesto era localizado por um caminho absoluto para o
# diretorio de perfil do operador (o literal nao e reproduzido aqui de
# proposito, para nao devolver ao repositorio a string que este commit remove).
# O arquivo existe; o caminho e que so existia numa maquina. O teste de
# integridade dos 19 agentes falhava em qualquer clone, e a fase 5 do
# `cwv_gate.ps1` nao pode pegar isto: ela compara PREFIXOS DE DIRETORIO dos
# arquivos staged, entao cobre um arquivo *sob* `.gemini/`, nunca um literal
# `C:\Users\...` *dentro* do conteudo. Ancorar no proprio arquivo de teste faz
# o caminho seguir o repositorio para onde ele for.
RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture
def queue_manager(tmp_path: Path) -> QueueManager:
    db_file = str(tmp_path / "test_stress.db")
    return QueueManager(queue_path=db_file)


@pytest.fixture
def memory_cache(tmp_path: Path) -> SOTACache:
    cache_dir = str(tmp_path / "nexus_cache")
    return SOTACache(cache_dir=cache_dir, ttl=300, max_memory_items=50)


# =========================================================================
# CENARIO 1: MUTEX DE VRAM E HOT-SWAP SERIAL (Recursos Finitos 8GB)
# =========================================================================
def test_vram_single_active_slot_and_keepalive_unpin():
    """Valida que o descarregamento de VRAM via keepalive=0 opera de forma limpa."""
    with patch("httpx.get") as mock_get, patch("httpx.post") as mock_post:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "models": [
                {"name": "qwen2.5-coder:7b-instruct-q5_K_M", "size_vram": 5841879040},
                {"name": "gemma4:12b", "size_vram": 7924514816},
            ]
        }
        mock_post.return_value.status_code = 200

        unloaded = optimize_ollama_keepalive(0)
        assert unloaded is True, "Otimizacao de keepalive falhou"
        assert mock_post.call_count == 2, "Deveria ter enviado requisicao de unpin para ambos os modelos"
        for call_item in mock_post.call_args_list:
            payload = call_item.kwargs.get("json", {})
            assert payload.get("keep_alive") == 0, "Payload deve conter keep_alive=0 para liberar VRAM"


# =========================================================================
# CENARIO 2: FAILOVER CASCATA (Gemini 429 -> OpenRouter -> Preservacao)
# =========================================================================
@pytest.mark.asyncio
async def test_cascading_failover_and_circuit_breaker(queue_manager: QueueManager):
    """Testa a rotacao de chaves sob erro 429 e fallback em cascata."""
    mock_keys = ["AIzaSyKeyA_FreeTier_1", "AIzaSyKeyB_FreeTier_2"]

    prov_key_1 = f"gemini:{mock_keys[0]}"
    await _block_key(prov_key_1)

    is_blocked_1 = await _is_key_blocked(prov_key_1)
    assert is_blocked_1 is True, "Chave 1 deveria estar em cool-down"

    prov_key_2 = f"gemini:{mock_keys[1]}"
    is_blocked_2 = await _is_key_blocked(prov_key_2)
    assert is_blocked_2 is False, "Chave 2 deve estar disponivel"

    ranked = await _rank_keys_by_health("gemini", mock_keys, queue_manager)
    assert len(ranked) == 2, "Devem ser retornadas todas as chaves avaliadas"

    unique_id = f"TASK-STRESS-{uuid.uuid4().hex[:8]}"
    task = Task(
        id=unique_id,
        description="Calculo de EV(fold) sob pressao de ICM",
        agent="@validador",
        status="pending",
        timestamp="2026-08-30T02:00:00Z",
        metadata={"pmev_risk": 0.85},
    )
    await queue_manager.add_task(task)

    saved_task = await queue_manager.get_task(unique_id)
    assert saved_task is not None, "Tarefa deve ser persistida com seguranca ACID"
    assert saved_task.status == "pending"
    assert saved_task.metadata.get("pmev_risk") == 0.85


# =========================================================================
# CENARIO 3: PRESSAO E AUTO-EVICCAO DE MEMORIA CACHE (SOTACache LRU)
# =========================================================================
def test_sota_cache_lru_eviction_under_stress(memory_cache: SOTACache):
    """Submete o cache a alta pressao de escrita e valida que o teto em itens e respeitado."""
    large_payload = "X" * 10_000
    for i in range(100):
        memory_cache.set(f"key_{i}", f"{large_payload}_{i}", ttl=300)

    total_entries = len(memory_cache.memory_cache)
    assert total_entries <= 50, f"Eviccao LRU deveria limitar a 50 itens, encontrou {total_entries}"
    assert memory_cache.get("key_99") is not None, "Item mais recente deve permanecer no cache"


# =========================================================================
# CENARIO 4: INFERENCIA DE PROVEDOR E SCORE DE MODELO SOTA
# =========================================================================
@pytest.mark.parametrize(
    ("model_name", "expected_provider"),
    [
        ("gemini-3.7-flash", "gemini"),
        ("gemini-3.5-flash-lite", "gemini"),
        ("gemma4:12b", "local"),
        ("gemma4:31b-cloud", "local"),
        ("qwen2.5-coder:7b-instruct-q5_K_M", "local"),
        ("qwen2.5-coder:1.5b", "local"),
        ("qwen2.5-coder:0.5b", "local"),
        ("qwen-code-surgical", "local"),
        ("qwen-pmev-math", "local"),
        ("qwen/qwen-2.5-coder-32b-instruct:free", "openrouter"),
        ("meta-llama/llama-3.3-70b-instruct:free", "openrouter"),
        ("openrouter/free", "openrouter"),
        ("claude-3-7-sonnet", "anthropic"),
    ],
)
def test_provider_inference_across_all_tiers(model_name: str, expected_provider: str):
    """Valida a deteccao de provedores para modelos dos Tiers 1, 3, 4 e 6."""
    inferred = _infer_provider_for_model(model_name)
    assert inferred == expected_provider, f"Modelo {model_name} deveria inferir {expected_provider}, obteve {inferred}"


# =========================================================================
# CENARIO 5: MATRIZ DOS 19 AGENTES - DETERMINISMO E AFINIDADE DE MEMORIA
# =========================================================================
def test_all_19_agents_manifest_integrity():
    """Valida que todos os 19 agentes possuem modelos primarios, fallbacks e afinidade declarada."""
    manifest_path = RAIZ / "data" / "agents_manifest.json"
    assert manifest_path.exists(), f"agents_manifest.json deve existir em {manifest_path}"

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert len(manifest) == 19, f"Devem existir exatamente 19 agentes, encontrados {len(manifest)}"

    expected_agents = [
        "maverick", "chico", "architect", "planner", "dispatcher",
        "implementor", "validador", "auditor", "historian", "pesquisador",
        "curator", "gemma4", "bibliotecario", "securitychief", "verifier",
        "prompter", "organizador", "sequenciador", "skillmaster"
    ]

    for agent_id in expected_agents:
        assert agent_id in manifest, f"Agente @{agent_id} ausente no manifesto"
        data = manifest[agent_id]

        assert "primary_model" in data and bool(data["primary_model"]), f"@{agent_id} sem primary_model"
        assert "fallback_model" in data and bool(data["fallback_model"]), f"@{agent_id} sem fallback_model"
        assert "tier" in data and bool(data["tier"]), f"@{agent_id} sem tier"
        assert "memory_affinity" in data and bool(data["memory_affinity"]), f"@{agent_id} sem memory_affinity"
        assert "skills" in data and isinstance(data["skills"], list), f"@{agent_id} sem lista de skills"


# =========================================================================
# CENARIO 6: PREFERENCIA DO FLASH-LITE PARA OPERACOES ECONOMICAS
# =========================================================================
def test_gemini_flash_lite_scoring_priority():
    """Valida que Gemini 3.5 Flash-Lite recebe prioridade maxima (-4) em execucoes economicas."""
    score_lite = _score_model("gemini-3.5-flash-lite", prefer_local=False, designated_model=None)
    score_flash = _score_model("gemini-3.7-flash", prefer_local=False, designated_model=None)
    score_openrouter = _score_model("meta-llama/llama-3.3-70b-instruct:free", prefer_local=False, designated_model=None)

    assert score_lite == -4, "gemini-3.5-flash-lite deve ter score -4 (prioridade standard maxima)"
    assert score_lite < score_flash, "Flash-Lite deve ter precedencia sobre Flash normal em modo economico"
    assert score_lite < score_openrouter, "Flash-Lite deve ter precedencia sobre OpenRouter no standard"
