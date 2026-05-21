import asyncio
import aiohttp
import time
from datetime import datetime
import logging
from typing import List, Optional, Callable

from database.queue_manager import QueueManager
from core.schemas import Task
from llm.budget import (
    OPENROUTER_KEYS, ANTHROPIC_KEYS, COMPRESSION_CIRCUIT_BREAKER, APIKeysExhaustedError,
    _route_identifier, _is_route_blocked, _gemini_key_pool_for_model
)
from llm.gemini import call_gemini
from llm.openrouter import call_openrouter
from llm.routing import (
    _infer_provider_for_model, _reorder_models_for_economy,
    _inject_openrouter_alternatives, _apply_model_health_gate
)
from llm.providers import _try_provider
from llm.session import get_global_http_session


import core.runtime as te


# =========================================================================
# INVARIÂNCIA MODULAR SOTA: Helpers de Isolamento para Redução de Entropia
# Todas as lógicas originais foram puramente envelopadas em funções menores
# para garantir Zero-Regression e baixar a Complexidade Ciclomática (V(G)).
# =========================================================================

async def _try_compress_gemini(session: aiohttp.ClientSession, system_prompt: str, text: str, task_agent: str, _c: Callable[[str], str], manager: QueueManager) -> tuple[Optional[str], bool]:
    """Tenta a compressao via Gemini, mas usando o motor de resiliencia SOTA (_try_provider)."""
    gemini_compression_keys = _gemini_key_pool_for_model("gemini-2.0-flash")
    gemini_model = "gemini-2.0-flash"
    route_gemini = _route_identifier("gemini", gemini_model)

    if not gemini_compression_keys or await _is_route_blocked(route_gemini):
        logging.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Rota Gemini Flash para compressao bloqueada ou sem chaves.")
        return None, True

    logging.info(f"[[{_c(task_agent)}]{task_agent}[/]] Acionando compressao cognitiva via Gemini Nativo ({gemini_model})...")

    # SOTA: Cria uma tarefa dummy para que _try_provider possa registrar metricas de chave
    dummy_task = Task(
        id=f"COMPRESSION-{int(time.time())}",
        description="Context compression task",
        agent=task_agent,
        status="running",
        timestamp=datetime.now().isoformat(),
        metadata={"compression_task": True}
    )

    result = await _try_provider(
        session=session, provider="gemini", model=gemini_model,
        system_prompt=system_prompt, user_prompt=text, keys=gemini_compression_keys,
        task=dummy_task, manager=manager, max_retries=1, # Compressao deve ser rapida
        timeout=aiohttp.ClientTimeout(total=60.0, connect=10.0, sock_read=50.0)
    )

    if result and result not in ["SKIP_KEY", "ROUTE_BLOCKED"]:
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] = 0
        return result.get("text"), False

    logging.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao via Gemini. Resultado: {result}")
    return None, True

async def _try_compress_openrouter(session: aiohttp.ClientSession, system_prompt: str, text: str, task_agent: str, _c: Callable[[str], str], manager: QueueManager) -> Optional[str]:
    OPENROUTER_ALTERNATIVE_MODELS = te.OPENROUTER_ALTERNATIVE_MODELS
    if not OPENROUTER_KEYS:
        return None

    compression_model = next(
        (m for m in OPENROUTER_ALTERNATIVE_MODELS if "r1" not in str(m).lower()),
        OPENROUTER_ALTERNATIVE_MODELS[0] if OPENROUTER_ALTERNATIVE_MODELS else "mistralai/mistral-small-3.1-24b-instruct:free"
    )
    logging.info(f"[[{_c(task_agent)}]{task_agent}[/]] Acionando compressao cognitiva via OpenRouter ({compression_model})...")

    dummy_task = Task(
        id=f"COMPRESSION-OR-{int(time.time())}",
        description="Context compression task via OpenRouter",
        agent=task_agent,
        status="running",
        timestamp=datetime.now().isoformat(),
        metadata={"compression_task": True}
    )

    result = await _try_provider(
        session=session, provider="openrouter", model=compression_model,
        system_prompt=system_prompt, user_prompt=text, keys=OPENROUTER_KEYS,
        task=dummy_task, manager=manager, max_retries=1,
        timeout=aiohttp.ClientTimeout(total=60.0, connect=15.0, sock_read=45.0)
    )

    if result and result not in ["SKIP_KEY", "ROUTE_BLOCKED"]:
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] = 0
        return result.get("text")

    logging.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao via OpenRouter.")
    return None

async def _prepare_routing_pipeline(task: Task, manager: QueueManager) -> tuple[List[str], str, Optional[str]]:
    agent_type = te.AGENT_ROUTING_MAP.get(task.agent, "fast_operations")
    models_to_try = list(te.DEEP_THINKING_MODELS) if agent_type == "deep_thinking" else list(te.FAST_OPERATIONS_MODELS)

    agent_clean = task.agent.replace("@", "")
    designated_model = (task.metadata or {}).get("model_override") or te.AGENTS_MANIFEST.get(agent_clean, {}).get("primary_model")
    if designated_model:
        if designated_model in models_to_try:
            models_to_try.remove(designated_model)
        models_to_try.insert(0, designated_model)

    recent_failure = (time.time() - COMPRESSION_CIRCUIT_BREAKER["last_failure"]) < 900
    frequent_failures = COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] >= 3
    prefer_local_fallback = recent_failure and frequent_failures

    models_to_try = _reorder_models_for_economy(models_to_try, prefer_local=prefer_local_fallback, designated_model=designated_model)
    models_to_try = _inject_openrouter_alternatives(models_to_try)
    models_to_try = await _apply_model_health_gate(models_to_try, manager, task)

    return models_to_try, agent_type, designated_model

# =========================================================================
# ORQUESTRADOR CENTRAL
# =========================================================================

async def _compress_context(text: str, task_agent: str, manager: QueueManager, prefer_local_fallback: bool = False) -> str:
    """Usa um LLM rapido para comprimir um contexto longo, preservando a essencia."""
    if len(text) < 3000:
        return text

    _c = te._c
    try:
        system_prompt = "Voce e um especialista em sumarizacao. Resuma o texto a seguir de forma densa e informativa, preservando todos os pontos criticos, nomes de arquivos, decisoes chave e a intencao original. O output deve ser em portugues (Pure ASCII)."
        session = await get_global_http_session()

        gemini_failed = False
        if not prefer_local_fallback:
            response, gemini_failed = await _try_compress_gemini(session, system_prompt, text, task_agent, _c, manager)
            if response:
                return response
        else:
            gemini_failed = True

        if prefer_local_fallback or gemini_failed:
            response = await _try_compress_openrouter(session, system_prompt, text, task_agent, _c, manager)
            if response:
                return response

        logging.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Compressao indisponivel (nenhum provedor respondeu). Usando contexto original.")
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] += 1
        COMPRESSION_CIRCUIT_BREAKER["last_failure"] = time.time()
        return text
    except Exception as e:
        logging.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao cognitiva. Usando contexto original: {e}")
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] += 1
        COMPRESSION_CIRCUIT_BREAKER["last_failure"] = time.time()
        return text


# Funcao para chamar a API da LLM, tratando diferentes modelos e chaves de API.
async def call_llm_api(task: Task, system_prompt: str, user_prompt: str, manager: QueueManager, require_json: bool = False, **kwargs) -> str:
    """Ponto unico de entrada da Cognicao SOTA. Roteia, protege e executa."""
    te._maybe_reload_config()
    _c = te._c

    models_to_try, agent_type, designated_model = await _prepare_routing_pipeline(task, manager)

    logging.info(f"[[{_c(task.agent)}]{task.agent}[/]] Rota de modelos selecionada: {agent_type} -> {models_to_try}")

    timeout_seconds = te._agent_sla_value(task.agent, "llm_timeout_seconds", 600)
    provider_retries = te._agent_sla_value(task.agent, "provider_retries", 2)
    request_timeout = aiohttp.ClientTimeout(total=timeout_seconds)

    session = await get_global_http_session()

    for model in models_to_try:
        response = None
        provider = _infer_provider_for_model(model)
        if provider and await _is_route_blocked(_route_identifier(provider, model)):
            logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] Rota em cooldown: {provider}:{model}. Pulando temporariamente.")
            continue
        if provider == "anthropic":
            response = await _try_provider(session, "anthropic", model, system_prompt, user_prompt, ANTHROPIC_KEYS, task, manager, provider_retries, request_timeout, require_json=require_json, **kwargs)
        elif provider == "gemini":
            gemini_keys = _gemini_key_pool_for_model(model)
            response = await _try_provider(session, "gemini", model, system_prompt, user_prompt, gemini_keys, task, manager, provider_retries, request_timeout, require_json=require_json, **kwargs)
        elif provider == "openrouter":
            response = await _try_provider(session, "openrouter", model, system_prompt, user_prompt, OPENROUTER_KEYS, task, manager, provider_retries, request_timeout, require_json=require_json, **kwargs)

        if response:
            route_selected = {
                "route_selected": models_to_try,
                "reason_codes": [
                    f"agent_type:{agent_type}",
                    f"designated_model:{designated_model}" if designated_model else "designated_model:none",
                    f"provider_retries:{provider_retries}",
                    f"timeout_seconds:{timeout_seconds}",
                ],
                "model_used": response.get("model"),
                "provider_used": response.get("provider"),
                "latency_ms": response.get("latency_ms"),
                "retry_count": response.get("retry_count", 0),
            }
            await manager.update_task_metadata(task.id, route_selected, merge=True)
            return response["text"]

    logging.error(f"[[{_c(task.agent)}]{task.agent}[/]] Esgotamento absoluto do pool de APIs/Chaves.")
    raise APIKeysExhaustedError("As chaves de API falharam sucessivamente ou estao temporariamente sob Rate Limit severo.")
