import asyncio
import logging
import os
import random
import re
import time
from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, cast

import aiohttp

import core.runtime as _te
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.anthropic import call_anthropic
from llm.budget import (
    ROUTE_FAILURE_THRESHOLD,
    _block_gemini_model_key,
    _block_key,
    _is_gemini_model_key_blocked,
    _is_key_blocked,
    _is_route_blocked,
    _is_semantic_gemini_error,
    _key_fingerprint,
    _key_identifier,
    _rank_keys_by_health,
    _register_route_failure,
    _register_route_success,
    _route_identifier,
)
from llm.gemini import call_gemini
from llm.openrouter import call_openrouter
from utils.text import enforce_pure_ascii

# =========================================================================
# SOTA REFACTOR: Padrão Strategy para mitigar colapso de entropia.
# Desacopla a chamada das APIs da lógica de resiliência e circuit break.
# Essa abstração permite que o Claude/Gemini extendam novos modelos
# futuramente sem aumentar a Complexidade Ciclomática (V(G)).
# =========================================================================

logger = logging.getLogger(__name__)


class LLMProviderStrategy(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def token_keys(self) -> tuple[str, str]:
        pass

    @abstractmethod
    async def call(
        self,
        session,
        model,
        system_prompt,
        user_prompt,
        key,
        client_timeout,
        require_json,
        **kwargs,
    ) -> tuple[str, dict]:
        pass

    async def check_quarantine(self, model: str, key: str) -> bool:
        """Permite que provedores implementem suas próprias regras de quarentena semântica de chaves."""
        await asyncio.sleep(0)
        return False

    async def handle_semantic_error(self, e: Exception, model: str, key: str) -> None:
        """Permite que o provedor bloqueie a chave com base em erros específicos (ex: HTTP 400)."""


class GeminiStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str:
        return "Gemini"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("promptTokenCount", "candidatesTokenCount")

    async def call(
        self,
        session,
        model,
        system_prompt,
        user_prompt,
        key,
        client_timeout,
        require_json,
        **kwargs,
    ):
        return await call_gemini(
            session,
            model,
            system_prompt,
            user_prompt,
            key,
            client_timeout,
            require_json=require_json,
            **kwargs,
        )

    async def check_quarantine(self, model: str, key: str) -> bool:
        return await _is_gemini_model_key_blocked(model, key)

    async def handle_semantic_error(self, e: Exception, model: str, key: str) -> None:
        error_msg = str(e).lower()

        # SOTA: Bypass de Quarentena para Limite de RPM
        if "429" in error_msg:
            try:
                match = re.search(r"retry_after=(\d+)", error_msg)
                delay = int(match.group(1)) if match else 0
            except Exception:  # noqa: BLE001
                delay = 0

            is_quota_exhausted = any(
                q in error_msg for q in ["quota", "daily", "exhausted"]
            )
            if delay <= 65 and not is_quota_exhausted:
                return  # Retorna prematuramente; nao bloqueia a chave na quarentena de 15 minutos.

        if _is_semantic_gemini_error(e):
            await _block_gemini_model_key(model, key)


class AnthropicStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str:
        return "Anthropic"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("input_tokens", "output_tokens")

    async def call(
        self,
        session,
        model,
        system_prompt,
        user_prompt,
        key,
        client_timeout,
        require_json,
        **kwargs,
    ):
        return await call_anthropic(
            session, model, system_prompt, user_prompt, key, client_timeout, **kwargs
        )


class OpenRouterStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str:
        return "OpenRouter"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("prompt_tokens", "completion_tokens")

    async def call(
        self,
        session,
        model,
        system_prompt,
        user_prompt,
        key,
        client_timeout,
        require_json,
        **kwargs,
    ):
        return await call_openrouter(
            session,
            model,
            system_prompt,
            user_prompt,
            key,
            client_timeout,
            require_json=require_json,
            **kwargs,
        )


def _get_provider_strategy(provider: str) -> LLMProviderStrategy | None:
    strategies = {
        "gemini": GeminiStrategy(),
        "anthropic": AnthropicStrategy(),
        "openrouter": OpenRouterStrategy(),
    }
    return strategies.get(provider)


@dataclass
class ProviderContext:
    session: aiohttp.ClientSession
    task: Task
    manager: QueueManager
    max_retries: int
    client_timeout: aiohttp.ClientTimeout | None
    require_json: bool
    c_func: Callable[[str], str]
    kwargs: dict[str, Any]


async def _handle_chaos_injection(task: Task, c_func: Callable):
    chaos_lambda_str = os.environ.get("NEXUS_CHAOS_LAMBDA")
    if not chaos_lambda_str:
        return
    try:
        chaos_lambda = float(chaos_lambda_str)
        if random.random() < chaos_lambda:
            chaos_type = random.choice(["503", "TIMEOUT", "LATENCY"])
            if chaos_type == "LATENCY":
                logger.warning(
                    f"[[{c_func(task.agent)}]{task.agent}[/]] [bold red]CHAOS INJECTED:[/] Latencia artificial"
                )
                await asyncio.sleep(random.uniform(3.0, 7.0))
            elif chaos_type == "TIMEOUT":
                logger.warning(
                    f"[[{c_func(task.agent)}]{task.agent}[/]] [bold red]CHAOS INJECTED:[/] Timeout simulado"
                )
                raise asyncio.TimeoutError("ChaosCore: Timeout Injected")
            elif chaos_type == "503":
                logger.warning(
                    f"[[{c_func(task.agent)}]{task.agent}[/]] [bold red]CHAOS INJECTED:[/] HTTP 503 Service Unavailable"
                )
                raise RuntimeError("ChaosCore: 503 Service Unavailable")
    except ValueError:
        pass


async def _process_successful_call(
    strategy,
    provider,
    model,
    system_prompt,
    user_prompt,
    key,
    ctx,
    start_time,
    key_hash,
    route_key,
    key_rank,
    attempt,
):
    response_text, usage = await strategy.call(
        ctx.session,
        model,
        system_prompt,
        user_prompt,
        key,
        ctx.client_timeout,
        ctx.require_json,
        **ctx.kwargs,
    )
    if response_text is None:
        raise RuntimeError(f"{strategy.name} retornou resposta vazia.")

    response_text = enforce_pure_ascii(response_text)
    await ctx.manager.update_llm_cache(model, user_prompt, response_text)

    p_key, c_key = strategy.token_keys
    p_tokens = usage.get(p_key, 0)
    c_tokens = usage.get(c_key, 0)
    await ctx.manager.record_api_usage(
        ctx.task.id, ctx.task.agent, model, provider, p_tokens, c_tokens
    )

    latency_ms = int((time.monotonic() - start_time) * 1000)
    await ctx.manager.record_key_usage_metric(
        provider=provider,
        key_hash=key_hash,
        status="success",
        latency_ms=latency_ms,
        model=model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
        total_tokens=p_tokens + c_tokens,
    )
    await _register_route_success(route_key)

    return {
        "text": response_text,
        "provider": provider,
        "model": model,
        "key_rank": key_rank,
        "retry_count": attempt - 1,
        "latency_ms": latency_ms,
    }


async def _handle_timeout_error(
    strategy, provider, model, ctx, start_time, key_hash, route_key, retries_left
):
    latency_ms = int((time.monotonic() - start_time) * 1000)
    await ctx.manager.record_key_usage_metric(
        provider=provider,
        key_hash=key_hash,
        status="timeout",
        latency_ms=latency_ms,
        error_class="TimeoutError",
        error_detail=f"{strategy.name} timeout",
        model=model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
    )
    if retries_left < 0:
        logger.error(
            f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Timeout persistente em {strategy.name}. Esgotando retries para esta chave."
        )
        await _register_route_failure(route_key)
        return False
    logger.warning(
        f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Timeout em {strategy.name}. Retentando ({retries_left + 1} retries restantes)..."
    )
    await asyncio.sleep(2.0)
    return True


async def _handle_general_error(
    e,
    strategy,
    provider,
    model,
    key,
    ctx,
    start_time,
    key_hash,
    route_key,
    provider_key,
    general_retries_left,
    rate_limit_retries_left,
):  # NOSONAR
    error_msg = str(e)
    latency_ms = int((time.monotonic() - start_time) * 1000)
    status_code = (
        cast(aiohttp.ClientResponseError, e).status
        if isinstance(e, aiohttp.ClientResponseError)
        else 0
    )

    if (status_code >= 500) or "chaoscore: 503" in error_msg.lower():
        if general_retries_left < 0:
            logger.error(
                f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Erro 5xx persistente em {strategy.name}. Esgotando retries para esta chave."
            )
            await _register_route_failure(route_key)
            return False, general_retries_left, rate_limit_retries_left
        logger.warning(
            f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] HTTP {status_code} transiente em {strategy.name}. Retentando ({general_retries_left + 1} retries restantes)..."
        )
        await asyncio.sleep(2.0)
        return True, general_retries_left, rate_limit_retries_left

    if "429" in error_msg:
        try:
            match = re.search(r"retry_after=(\d+)", error_msg)
            delay = int(match.group(1)) if match else 0
        except Exception:
            delay = 0
        if delay == 0:
            delay = 15

        if delay <= 65 and rate_limit_retries_left > 0:
            rate_limit_retries_left -= 1
            jitter = random.uniform(1.0, 3.0)
            sleep_time = float(delay) + jitter
            logger.info(
                f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] 429 rate-limit em {strategy.name}. Aguardando {sleep_time:.2f}s... ({rate_limit_retries_left} retries de 429 restantes)"
            )
            await asyncio.sleep(sleep_time)
            return True, general_retries_left, rate_limit_retries_left

        logger.warning(
            f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] 429 quota esgotada em {strategy.name} ({model}). Rotacionando..."
        )
        if delay <= 65:
            await asyncio.sleep(float(delay) + random.uniform(1.0, 3.0))
        else:
            await asyncio.sleep(random.uniform(2.0, 4.0))
        return False, general_retries_left, rate_limit_retries_left

    if general_retries_left >= 0:
        logger.warning(
            f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Erro geral em {strategy.name} ({type(e).__name__}). Retentando... ({general_retries_left + 1} retries restantes)"
        )
        await asyncio.sleep(1.0)
        return True, general_retries_left, rate_limit_retries_left

    logger.warning(
        f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Falha na chave {strategy.name} ({model}): {error_msg}."
    )
    await ctx.manager.record_key_usage_metric(
        provider=provider,
        key_hash=key_hash,
        status="error",
        latency_ms=latency_ms,
        error_class=type(e).__name__,
        error_detail=error_msg,
        model=model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
    )
    await _register_route_failure(route_key)

    if (
        "connection closed" in error_msg.lower()
        or "cannot connect" in error_msg.lower()
    ):
        extra = max(0, ROUTE_FAILURE_THRESHOLD - 1)
        for _ in range(extra):
            await _register_route_failure(route_key)

    if status_code in (401, 402, 403):
        await _block_key(provider_key)

    await strategy.handle_semantic_error(e, model, key)
    return False, general_retries_left, rate_limit_retries_left


async def _attempt_key_execution(
    strategy: LLMProviderStrategy,
    provider: str,
    provider_key: str,
    key_hash: str,
    key: str,
    key_rank: int,
    route_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    ctx: ProviderContext,
    attempt: int,
    general_retries_left: int,
    rate_limit_retries_left: int,
) -> tuple[Any, bool, int, int]:
    start_time = time.monotonic()
    try:
        log_msg = (
            f"Retentativa {attempt} para {model}..."
            if attempt > 1
            else f"Acionando cognicao via {strategy.name} ({model}, Chave {key_rank})..."
        )
        logger.info(f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] {log_msg}")

        await _handle_chaos_injection(ctx.task, ctx.c_func)
        result = await _process_successful_call(
            strategy,
            provider,
            model,
            system_prompt,
            user_prompt,
            key,
            ctx,
            start_time,
            key_hash,
            route_key,
            key_rank,
            attempt,
        )
        return result, False, general_retries_left, rate_limit_retries_left
    except (asyncio.TimeoutError, TimeoutError):
        general_retries_left -= 1
        should_retry = await _handle_timeout_error(
            strategy,
            provider,
            model,
            ctx,
            start_time,
            key_hash,
            route_key,
            general_retries_left,
        )
        return None, should_retry, general_retries_left, rate_limit_retries_left
    except Exception as e:  # noqa: BLE001
        general_retries_left -= 1
        (
            should_retry,
            general_retries_left,
            rate_limit_retries_left,
        ) = await _handle_general_error(
            e,
            strategy,
            provider,
            model,
            key,
            ctx,
            start_time,
            key_hash,
            route_key,
            provider_key,
            general_retries_left,
            rate_limit_retries_left,
        )
        return None, should_retry, general_retries_left, rate_limit_retries_left


async def _execute_single_key(
    strategy: LLMProviderStrategy,
    provider: str,
    provider_key: str,
    key_hash: str,
    key: str,
    key_rank: int,
    route_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    ctx: ProviderContext,
) -> Any:
    general_retries_left = max(0, int(ctx.max_retries))
    rate_limit_retries_left = 3  # Orçamento dedicado para absorver rajadas de 429
    attempt = 0

    while True:
        attempt += 1
        (
            result,
            should_continue,
            general_retries_left,
            rate_limit_retries_left,
        ) = await _attempt_key_execution(
            strategy,
            provider,
            provider_key,
            key_hash,
            key,
            key_rank,
            route_key,
            model,
            system_prompt,
            user_prompt,
            ctx,
            attempt,
            general_retries_left,
            rate_limit_retries_left,
        )
        if not should_continue and result is not None:
            return result
            break

    if await _is_route_blocked(route_key):
        logger.warning(
            f"[[{ctx.c_func(ctx.task.agent)}]{ctx.task.agent}[/]] Rota {provider}:{model} entrou em cooldown apos falha. Avancando para proximo modelo."
        )
        return "ROUTE_BLOCKED"

    return "SKIP_KEY"


async def _try_provider(
    session: aiohttp.ClientSession,
    provider: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    keys: list[str],
    task: Task,
    manager: QueueManager,
    max_retries: int = 2,
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs,
) -> dict[str, Any] | None:
    """Orquestrador de Provedor SOTA. Delega o comportamento para o padrao Strategy."""
    if not keys:
        return None

    _c = _te._c
    strategy = _get_provider_strategy(provider)
    if not strategy:
        logger.error(f"Provedor desconhecido: {provider}")
        return None

    route_key = _route_identifier(provider, model)
    ranked_keys = await _rank_keys_by_health(provider, keys, manager)

    for i, key in enumerate(ranked_keys):
        if await _is_route_blocked(route_key):
            logger.warning(
                f"[{task.agent}] Rota {strategy.name}:{model} entrou em cooldown durante a rotacao de chaves. Interrompendo tentativas desta rota."
            )
            break

        if await strategy.check_quarantine(model, key):
            logger.warning(
                f"[{task.agent}] Chave {strategy.name} em quarentena semantica para modelo {model} (Chave {i + 1}). Pulando."
            )
            continue

        provider_key = _key_identifier(provider, key)
        key_hash = _key_fingerprint(provider, key)

        if await _is_key_blocked(provider_key):
            logger.warning(
                f"[{task.agent}] Chave {strategy.name} bloqueada temporariamente (Chave {i + 1}). Pulando."
            )
            continue

        ctx = ProviderContext(
            session=session,
            task=task,
            manager=manager,
            max_retries=max_retries,
            client_timeout=client_timeout,
            require_json=require_json,
            c_func=_c,
            kwargs=kwargs,
        )
        result = await _execute_single_key(
            strategy=strategy,
            provider=provider,
            provider_key=provider_key,
            key_hash=key_hash,
            key=key,
            key_rank=i + 1,
            route_key=route_key,
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            ctx=ctx,
        )

        if result == "SKIP_KEY":
            continue
        if result == "ROUTE_BLOCKED":
            return None
        return result

    return None
