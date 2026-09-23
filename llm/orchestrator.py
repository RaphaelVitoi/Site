# pylint: disable=missing-module-docstring, broad-exception-caught, logging-fstring-interpolation, protected-access, line-too-long, invalid-name

from collections.abc import Callable
from datetime import UTC, datetime
import logging
import time
from typing import Any, cast

import aiohttp

import core.runtime as te
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    ANTHROPIC_KEYS,
    COMPRESSION_CIRCUIT_BREAKER,
    OPENROUTER_KEYS,
    APIKeysExhaustedError,
    _gemini_key_pool_for_model,
    _is_route_blocked,
    _route_identifier,
)
from llm.laya_bridge import compor_advisory_s1
from llm.providers import _try_provider
from llm.routing import (
    _apply_model_health_gate,
    _infer_provider_for_model,
    _inject_openrouter_alternatives,
    _reorder_models_for_economy,
)
from llm.session import get_global_http_session, make_client_timeout

logger = logging.getLogger(__name__)

# =========================================================================
# INVARIANCIA MODULAR SOTA: Helpers de Isolamento para Reducao de Entropia
# Todas as logicas originais foram puramente envelopadas em funcoes menores
# para garantir Zero-Regression e baixar a Complexidade Ciclomatica (V(G)).
# =========================================================================


async def _try_compress_gemini(
    session: aiohttp.ClientSession,
    system_prompt: str,
    text: str,
    task_agent: str,
    _c: Callable[[str], str],
    manager: QueueManager,
) -> tuple[str | None, bool]:
    """Tenta a compressao via Gemini, mas usando o motor de resiliencia SOTA (_try_provider)."""
    gemini_compression_keys = _gemini_key_pool_for_model("gemini-3.5-flash-lite")
    gemini_model = "gemini-3.5-flash-lite"
    route_gemini = _route_identifier("gemini", gemini_model)

    if not gemini_compression_keys or await _is_route_blocked(route_gemini):
        logger.warning(
            f"[[{_c(task_agent)}]{task_agent}[/]] Rota Gemini Flash para compressao bloqueada ou sem chaves."
        )
        return None, True

    logger.info(
        f"[[{_c(task_agent)}]{task_agent}[/]] Acionando compressao cognitiva via Gemini Nativo ({gemini_model})..."
    )

    # SOTA: Cria uma tarefa dummy para que _try_provider possa registrar metricas de chave
    dummy_task = Task(
        id=f"COMPRESSION-{int(time.time())}",
        description="Context compression task",
        agent=task_agent,
        status="running",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={"compression_task": True},
    )

    result = await _try_provider(
        session=session,
        provider="gemini",
        model=gemini_model,
        system_prompt=system_prompt,
        user_prompt=text,
        keys=gemini_compression_keys,
        task=dummy_task,
        manager=manager,
        max_retries=1,  # Compressao deve ser rapida
        timeout=make_client_timeout(total=60.0, connect=10.0, sock_read=50.0),
    )

    if result and result not in ["SKIP_KEY", "ROUTE_BLOCKED"]:
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] = 0
        return result.get("text"), False

    logger.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao via Gemini. Resultado: {result}")
    return None, True


async def _try_compress_openrouter(
    session: aiohttp.ClientSession,
    system_prompt: str,
    text: str,
    task_agent: str,
    _c: Callable[[str], str],
    manager: QueueManager,
) -> str | None:
    OPENROUTER_ALTERNATIVE_MODELS = te.OPENROUTER_ALTERNATIVE_MODELS
    if not OPENROUTER_KEYS:
        return None

    compression_model = next(
        (m for m in OPENROUTER_ALTERNATIVE_MODELS if "r1" not in str(m).lower()),
        OPENROUTER_ALTERNATIVE_MODELS[0]
        if OPENROUTER_ALTERNATIVE_MODELS
        else "mistralai/mistral-small-3.1-24b-instruct:free",
    )
    logger.info(
        f"[[{_c(task_agent)}]{task_agent}[/]] Acionando compressao cognitiva via OpenRouter ({compression_model})..."
    )

    dummy_task = Task(
        id=f"COMPRESSION-OR-{int(time.time())}",
        description="Context compression task via OpenRouter",
        agent=task_agent,
        status="running",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={"compression_task": True},
    )

    result = await _try_provider(
        session=session,
        provider="openrouter",
        model=compression_model,
        system_prompt=system_prompt,
        user_prompt=text,
        keys=OPENROUTER_KEYS,
        task=dummy_task,
        manager=manager,
        max_retries=1,
        timeout=make_client_timeout(total=60.0, connect=15.0, sock_read=45.0),
    )

    if result and result not in ["SKIP_KEY", "ROUTE_BLOCKED"]:
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] = 0
        return result.get("text")

    logger.warning(f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao via OpenRouter.")
    return None


def _aplicar_reordenacao_laya_s1(models_to_try: list[str], intencao_s1: dict) -> list[str]:
    """Reordena models_to_try pela classificacao zero-download S1 (laya).

    Texto nao-latino (devanagari/han/non-latin) tenta primeiro o modelo local
    multi-script gemma4:e4b (zero $) antes do cloud.
    """
    _script = str(intencao_s1.get("script", "") or "")
    if _script in {"devanagari", "han", "non-latin"} and "gemma4:e4b" not in models_to_try:
        models_to_try.insert(0, "gemma4:e4b")
    return models_to_try


async def _prepare_routing_pipeline(task: Task, manager: QueueManager) -> tuple[list[str], str, str | None]:
    agent_type = te.AGENT_ROUTING_MAP.get(task.agent, "fast_operations")
    models_to_try = list(te.DEEP_THINKING_MODELS) if agent_type == "deep_thinking" else list(te.FAST_OPERATIONS_MODELS)

    agent_clean = task.agent.replace("@", "")
    # A politica de roteamento e a autoridade aqui desde 2026-08-28. Antes esta
    # linha lia `primary_model` do manifesto direto, e `AGENT_MODEL_MAP` --
    # resolvido pela politica em core/config -- nao tinha consumidor de
    # producao: 19 dos 19 agentes rodavam num modelo que a politica nao havia
    # escolhido. `modelo_do_agente` e a fonte unica dos quatro leitores.
    raw_model = te.modelo_do_agente(agent_clean, override=(task.metadata or {}).get("model_override"))
    designated_model = str(raw_model) if raw_model else None
    if designated_model:
        if designated_model in models_to_try:
            models_to_try.remove(designated_model)
        models_to_try.insert(0, designated_model)

    recent_failure = (time.time() - COMPRESSION_CIRCUIT_BREAKER["last_failure"]) < 900
    frequent_failures = COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] >= 3
    prefer_local_fallback = recent_failure and frequent_failures

    raw_domain = (task.metadata or {}).get("domain")
    domain_str = str(raw_domain) if raw_domain else None

    models_to_try = _reorder_models_for_economy(
        models_to_try,
        prefer_local=prefer_local_fallback,
        designated_model=designated_model,
        domain=domain_str,
    )
    models_to_try = _inject_openrouter_alternatives(models_to_try)
    models_to_try = await _apply_model_health_gate(models_to_try, manager, task)

    # [CAMADA S1 -- Laya | CLAUDE.md §6.5 consumidor real | §3 fonte-unica preservada]
    # Uma unica classificacao zero-download (core/arbitrator::_registrar_intencao_s1,
    # em Task.metadata["intencao_s1"]) vira telemetry + fator de reordencao no caminho
    # quente de call_llm_api ("Ponto unico de entrada da Cognicao SOTA"). A fonte-unica
    # (modelo_do_agente/decidir/rotear) NAO e alterada: laya apenas reordena a lista de
    # candidatos. Backward-compatible: sem intenciao_s1, o pipeline segue a politica
    # original (zero regressions em routing_policy / mcp_addon / agents_sota).
    # ROI: texto nao-latino (devanagari/han/non-latin) -> tenta primeiro o modelo local
    # multi-script gemma4:e4b (zero $) antes do cloud; PT/ES (latin, nao ingles) ficam
    # para o primario (claude/gemini). Se o local falhar, call_llm_api faz fallback ao
    # proximo candidato (graceful).
    _intencao_s1 = cast(dict, (task.metadata or {}).get("intencao_s1") or {})
    if _intencao_s1:
        models_to_try = _aplicar_reordenacao_laya_s1(models_to_try, _intencao_s1)

    return models_to_try, agent_type, designated_model


async def _apply_s1_advisory(
    task: Task,
    system_prompt: str,
    user_prompt: str,
    manager: QueueManager,
) -> tuple[str, dict | None]:
    """Aplica consultoria S1 (laya) ao prompt, registrando telemetry.

    Returns (system_prompt, laya_metadata). laya_metadata e None se advisory unavailable.
    """
    _c = te._c
    if task.metadata is None:
        task.metadata = {}
    try:
        system_prompt, laya_metadata = compor_advisory_s1(system_prompt, user_prompt)
        if laya_metadata:
            task.metadata["intencao_s1"] = laya_metadata
            await manager.update_task_metadata(task.id, {"intencao_s1": laya_metadata}, merge=True)
        return system_prompt, laya_metadata
    except Exception as laya_error:
        logger.debug("[laya-s1] advisory unavailable for task %s: %s", task.id, laya_error)
        return system_prompt, None


def _build_route_selected(
    models_to_try: list[str],
    agent_type: str,
    designated_model: str | None,
    provider_retries: int,
    timeout_seconds: int,
    response: dict,
    s1_metadata: dict | None,
) -> dict:
    """Constrói o dicionario de telemetry de rota selecionada."""
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
    if s1_metadata:
        route_selected["reason_codes"].append(
            f"s1:{s1_metadata.get('modelo_sugerido', 'multilingual')}|{s1_metadata.get('script', 'unknown')}"
        )
    return route_selected


# =========================================================================
# ORQUESTRADOR CENTRAL
# =========================================================================


async def _compress_context(
    text: str,
    task_agent: str,
    manager: QueueManager,
    prefer_local_fallback: bool = False,
) -> str:
    """Usa um LLM rapido para comprimir um contexto longo, preservando a essencia."""
    if len(text) < 3000:
        return text

    _c = te._c
    try:
        system_prompt = te.SYSTEM_CONFIG.get(
            "compression_system_prompt",
            "Voce e um especialista em sumarizacao. Resuma o texto a seguir de forma densa e informativa, preservando todos os pontos criticos, nomes de arquivos, decisoes chave e a intencao original. O output deve ser em portugues (Pure ASCII).",
        )
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

        logger.warning(
            f"[[{_c(task_agent)}]{task_agent}[/]] Compressao indisponivel (nenhum provedor respondeu). Usando contexto original."
        )
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] += 1
        COMPRESSION_CIRCUIT_BREAKER["last_failure"] = time.time()
        return text
    except Exception as e:  # noqa: BLE001
        safe_err = str(e).encode("ascii", "backslashreplace").decode("ascii")
        logger.warning(
            f"[[{_c(task_agent)}]{task_agent}[/]] Falha na compressao cognitiva. Usando contexto original: {safe_err}"
        )
        COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] += 1
        COMPRESSION_CIRCUIT_BREAKER["last_failure"] = time.time()
        return text


async def _dispatch_llm_provider(
    session: Any,
    provider: str | None,
    model: str,
    system_prompt: str,
    user_prompt: str,
    task: Task,
    manager: QueueManager,
    provider_retries: int,
    request_timeout: Any,
    require_json: bool = False,
    **kwargs,
) -> dict | None:
    """Resolve a pool de keys do provider e delega para _try_provider.

    Abstrai o dispatch if/elif de providers (gemini/openrouter/anthropic/local)
    para manter call_llm_api dentro do teto de complexidade cognitiva SOTA GOLD.
    """
    if provider == "gemini":
        keys = _gemini_key_pool_for_model(model)
    elif provider == "openrouter":
        keys = OPENROUTER_KEYS
    elif provider == "anthropic":
        keys = ANTHROPIC_KEYS
    elif provider == "local":
        keys = ["local-dummy-key"]
    else:
        return None
    retries = 1 if provider == "local" else provider_retries
    return await _try_provider(
        session,
        provider,
        model,
        system_prompt,
        user_prompt,
        keys,
        task,
        manager,
        retries,
        request_timeout,
        require_json=require_json,
        **kwargs,
    )


# Funcao para chamar a API da LLM, tratando diferentes modelos e chaves de API.
async def call_llm_api(
    task: Task,
    system_prompt: str,
    user_prompt: str,
    manager: QueueManager,
    require_json: bool = False,
    **kwargs,
) -> str:
    """Ponto unico de entrada da Cognicao SOTA. Roteia, protege e executa."""
    te._maybe_reload_config()
    _c = te._c

    # System-1 Laya acompanha a chamada canônica, registra procedência e compõe
    # o advisory com o LLM sem substituir a fonte única de roteamento.
    if task.metadata is None:
        task.metadata = {}
    try:
        system_prompt, laya_metadata = compor_advisory_s1(system_prompt, user_prompt)
        if laya_metadata:
            task.metadata["intencao_s1"] = laya_metadata
            await manager.update_task_metadata(task.id, {"intencao_s1": laya_metadata}, merge=True)
    except Exception as laya_error:  # pylint: disable=broad-exception-caught
        logger.debug("[laya-s1] advisory unavailable for task %s: %s", task.id, laya_error)

    models_to_try, agent_type, designated_model = await _prepare_routing_pipeline(task, manager)

    logger.info(f"[[{_c(task.agent)}]{task.agent}[/]] Rota de modelos selecionada: {agent_type} -> {models_to_try}")

    timeout_seconds = te._agent_sla_value(task.agent, "llm_timeout_seconds", 600)
    provider_retries = te._agent_sla_value(task.agent, "provider_retries", 2)
    request_timeout = make_client_timeout(total=timeout_seconds)

    session = await get_global_http_session()

    for model in models_to_try:
        response = None
        provider = _infer_provider_for_model(model)
        if provider and await _is_route_blocked(_route_identifier(provider, model)):
            logger.warning(
                f"[[{_c(task.agent)}]{task.agent}[/]] Rota em cooldown: {provider}:{model}. Pulando temporariamente."
            )
            continue

        response = await _dispatch_llm_provider(
            session,
            provider,
            model,
            system_prompt,
            user_prompt,
            task,
            manager,
            provider_retries,
            request_timeout,
            require_json=require_json,
            **kwargs,
        )

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
            # Proveniancia S1 (laya): registra a classificacao zero-download que
            # influenciou este roteamento (advisory -- nao altera o resultado, apenas
            # a telemetry; contrato §4 de proveniancia).
            _s1 = cast(dict, (task.metadata or {}).get("intencao_s1") or {})
            if _s1:
                route_selected["reason_codes"].append(
                    f"s1:{_s1.get('modelo_sugerido', 'multilingual')}|{_s1.get('script', 'unknown')}"
                )
            await manager.update_task_metadata(task.id, route_selected, merge=True)
            return response["text"]

    logger.error(f"[[{_c(task.agent)}]{task.agent}[/]] Esgotamento absoluto do pool de APIs/Chaves.")
    raise APIKeysExhaustedError(
        "As chaves de API falharam sucessivamente ou estao temporariamente sob Rate Limit severo."
    )
