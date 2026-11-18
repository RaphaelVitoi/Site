# pylint: disable=protected-access
"""
SOTA LLM Providers implementation.
This module abstracts LLM routing and calling strategies to decouple
API requests from resilience and circuit breaker logic.
"""

from abc import ABC, abstractmethod
import asyncio
from collections.abc import Callable
import contextlib
from dataclasses import dataclass
import logging
import os
import re
import secrets
import time
from typing import Any, cast

import aiohttp

import core.runtime as _te
from core.schemas import Task
from database.queue_manager import QueueManager
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
from llm.gemma_local import call_gemma_local

try:
    from llm.openrouter import call_openrouter

    OPENROUTER_AVAILABLE = True
except Exception as exc:  # noqa: BLE001
    call_openrouter = None  # type: ignore[assignment] # pylint: disable=invalid-name
    OPENROUTER_AVAILABLE = False
    logging.getLogger(__name__).warning(
        "OpenRouter module unavailable; provider disabled: %s",
        exc,
    )

try:
    from llm.ollama_cloud import call_ollama_cloud

    OLLAMA_CLOUD_AVAILABLE = True
except Exception as exc:  # noqa: BLE001
    call_ollama_cloud = None  # type: ignore[assignment] # pylint: disable=invalid-name
    OLLAMA_CLOUD_AVAILABLE = False
    logging.getLogger(__name__).warning(
        "Ollama Cloud module unavailable; provider disabled: %s",
        exc,
    )

from utils.text import enforce_pure_ascii

# =========================================================================
# SOTA REFACTOR: Padrao Strategy para mitigar colapso de entropia.
# Desacopla a chamada das APIs da logica de resiliencia e circuit break.
# Essa abstracao permite que o Gemini estenda novos modelos
# futuramente sem aumentar a Complexidade Ciclomatica (V(G)).
# =========================================================================

logger = logging.getLogger(__name__)


class LLMProviderStrategy(ABC):
    """Base strategy class for LLM API providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Get the strategy name."""

    @property
    @abstractmethod
    def token_keys(self) -> tuple[str, str]:
        """Get the token keys used in the usage dict."""

    @abstractmethod
    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Execute the LLM API call."""

    async def check_quarantine(
        self,
        model: str,
        key: str,
    ) -> bool:
        """
        Permite que provedores implementem suas proprias
        regras de quarentena semantica de chaves.
        """
        del model, key
        await asyncio.sleep(0)
        return False

    async def handle_semantic_error(
        self,
        e: Exception,
        model: str,
        key: str,
    ) -> None:
        """Bloqueia a chave com base em erros especificos."""
        del e, model, key
        await asyncio.sleep(0)


class GeminiStrategy(LLMProviderStrategy):
    """Strategy implementation for Gemini API."""

    @property
    def name(self) -> str:
        return "Gemini"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("promptTokenCount", "candidatesTokenCount")

    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Executes Gemini API call."""
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
        if await _is_gemini_model_key_blocked(model, key):
            return True
        with contextlib.suppress(Exception):
            from llm.gemini_pool import _key_sha8, gemini_pool_manager  # noqa: PLC0415

            stats = gemini_pool_manager._stats.get(_key_sha8(key))
            if stats is not None and not stats.is_available(model=model):
                return True
        return False

    async def handle_semantic_error(self, e: Exception, model: str, key: str) -> None:
        """Trata erros semanticos especificos do Gemini."""
        error_msg = str(e).lower()

        # SOTA: Bypass de Quarentena para Limite de RPM
        if "429" in error_msg:
            try:
                match = re.search(r"retry_after=(\d+)", error_msg)
                delay = int(match.group(1)) if match else 0
            except Exception:  # noqa: BLE001
                delay = 0

            is_quota_exhausted = any(q in error_msg for q in ["quota", "daily", "exhausted"])
            if delay <= 65 and not is_quota_exhausted:
                return  # Retorna prematuramente; nao bloqueia a chave na quarentena de 15 minutos.

        if _is_semantic_gemini_error(e):
            await _block_gemini_model_key(model, key)


class OpenRouterStrategy(LLMProviderStrategy):
    """Strategy implementation for OpenRouter API."""

    @property
    def name(self) -> str:
        return "OpenRouter"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("prompt_tokens", "completion_tokens")

    async def check_quarantine(self, model: str, key: str) -> bool:
        del model
        with contextlib.suppress(Exception):
            from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

            return not openrouter_pool_manager.is_key_available(key)
        return False

    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Executes OpenRouter API call."""
        if call_openrouter is None:
            raise RuntimeError("OpenRouter module unavailable.")
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


class OllamaCloudStrategy(LLMProviderStrategy):
    """Strategy implementation for Ollama Cloud (ollama.com/api)."""

    @property
    def name(self) -> str:
        return "OllamaCloud"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("prompt_tokens", "completion_tokens")

    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Executes Ollama Cloud API call."""
        if call_ollama_cloud is None:
            raise RuntimeError("Ollama Cloud module unavailable.")
        return await call_ollama_cloud(
            session,
            model,
            system_prompt,
            user_prompt,
            key,
            client_timeout,
            require_json=require_json,
            **kwargs,
        )


def _local_fallback_messages(
    system_prompt: str,
    user_prompt: str,
    kwargs: dict[str, Any],
) -> list[dict[str, str]]:
    messages = list(kwargs.get("messages") or [])
    if not messages:
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
    return messages


def _local_fallback_endpoints(
    llama_base: str,
    swap_base: str,
    swap_model: str,
    model: str,
) -> list[tuple[str, list[str]]]:
    endpoints: list[tuple[str, list[str]]] = [(llama_base, [model])]
    if swap_base and swap_base != llama_base:
        swap_models = [model]
        if swap_model and swap_model != model:
            swap_models.append(swap_model)
        endpoints.append((swap_base, swap_models))
    return endpoints


def _local_fallback_payload(
    candidate_model: str,
    messages: list[dict[str, str]],
    kwargs: dict[str, Any],
    require_json: bool,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": candidate_model,
        "messages": messages,
        "stream": False,
        "max_tokens": kwargs.get("max_tokens", 2048),
    }
    if kwargs.get("temperature") is not None:
        payload["temperature"] = kwargs["temperature"]
    if require_json:
        payload["response_format"] = {"type": "json_object"}
    return payload


async def _extract_local_fallback_result(
    resp: aiohttp.ClientResponse,
    base_url: str,
    candidate_model: str,
    user_prompt: str,
) -> tuple[str, dict[str, Any]] | None:
    data = await resp.json()
    choices = data.get("choices") or []
    content = str((choices[0].get("message") or {}).get("content", "")).strip() if choices else ""
    if not content:
        return None
    raw_usage = data.get("usage") or {}
    usage = {
        "promptTokenCount": raw_usage.get("prompt_tokens", len(user_prompt) // 4),
        "candidatesTokenCount": raw_usage.get("completion_tokens", len(content) // 4),
        "local_fallback_endpoint": base_url,
        "local_fallback_model": candidate_model,
    }
    return content, usage


async def _try_local_endpoint(
    session: aiohttp.ClientSession,
    base_url: str,
    model_candidates: list[str],
    messages: list[dict[str, str]],
    user_prompt: str,
    require_json: bool,
    kwargs: dict[str, Any],
    req_timeout: aiohttp.ClientTimeout,
) -> tuple[str, dict[str, Any]] | None:
    for candidate_model in model_candidates:
        payload = _local_fallback_payload(candidate_model, messages, kwargs, require_json)
        try:
            async with session.post(f"{base_url}/v1/chat/completions", json=payload, timeout=req_timeout) as resp:
                if resp.status == 200:
                    result = await _extract_local_fallback_result(resp, base_url, candidate_model, user_prompt)
                    if result is not None:
                        return result
                if resp.status not in (400, 404):
                    return None
        except Exception as exc:  # noqa: BLE001
            logger.debug("[GEMMA-LOCAL] Fallback local (%s/%s) indisponivel: %s", base_url, candidate_model, exc)
            return None
    return None


async def _call_local_openai_router_fallback(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    *,
    client_timeout: aiohttp.ClientTimeout | None = None,
    require_json: bool = False,
    **kwargs: Any,
) -> tuple[str, dict[str, Any]] | None:
    """Fallback OpenAI-compatible para llama.cpp (:9931) e llama-swap (:8080) quando :17043 estiver offline."""
    llama_base = os.environ.get("CHICO_LLAMA_API_BASE", "http://127.0.0.1:9931").rstrip("/")
    swap_base = os.environ.get("CHICO_LLAMA_SWAP_BASE", "http://127.0.0.1:8080").rstrip("/")
    swap_model = os.environ.get("CHICO_LLAMA_SWAP_MODEL", "qwen-moe")
    messages = _local_fallback_messages(system_prompt, user_prompt, kwargs)
    timeout = client_timeout or aiohttp.ClientTimeout(total=15.0, sock_connect=1.0)

    for base_url, model_candidates in _local_fallback_endpoints(llama_base, swap_base, swap_model, model):
        if not base_url:
            continue
        result = await _try_local_endpoint(
            session,
            base_url,
            model_candidates,
            messages,
            user_prompt,
            require_json,
            kwargs,
            timeout,
        )
        if result is not None:
            return result
    return None


class GemmaLocalStrategy(LLMProviderStrategy):
    """Strategy implementation for local Gemma instances."""

    @property
    def name(self) -> str:
        return "GemmaLocal"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("promptTokenCount", "candidatesTokenCount")

    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Executes local Gemma API call with fallback to llama.cpp (:9931) and llama-swap (:8080)."""
        try:
            return await call_gemma_local(
                session,
                model,
                system_prompt,
                user_prompt,
                key,
                timeout=client_timeout,
                require_json=require_json,
                **kwargs,
            )
        except (ConnectionError, aiohttp.ClientError, TimeoutError) as local_exc:
            fallback_result = await _call_local_openai_router_fallback(
                session,
                model,
                system_prompt,
                user_prompt,
                client_timeout=client_timeout,
                require_json=require_json,
                **kwargs,
            )
            if fallback_result is not None:
                return fallback_result
            raise local_exc


class SplashStrategy(LLMProviderStrategy):
    """Strategy implementation for local Splash engine (port 8081)."""

    def __init__(self, host: str = "127.0.0.1", port: int = 8081) -> None:
        self.host = host
        self.port = port

    @property
    def name(self) -> str:
        return "Splash"

    @property
    def token_keys(self) -> tuple[str, str]:
        return ("prompt_tokens", "completion_tokens")

    async def check_quarantine(self, model: str, key: str) -> bool:
        """Verifica se o servidor Splash esta offline ou insalubre."""
        del model, key
        try:
            from llm.splash_client import LocalSplashClient  # noqa: PLC0415

            client = LocalSplashClient(host=self.host, port=self.port, timeout=2.0)
            return not await asyncio.to_thread(client.is_healthy)
        except Exception:
            return True

    async def call(
        self,
        session: aiohttp.ClientSession,
        model: str,
        system_prompt: str,
        user_prompt: str,
        key: str,
        client_timeout: aiohttp.ClientTimeout | None,
        require_json: bool,
        **kwargs: Any,
    ) -> tuple[str, dict[str, Any]]:
        """Executa chamada ao Splash via LocalSplashClient na porta 8081."""
        del session, key, client_timeout, model
        from llm.splash_client import LocalSplashClient  # noqa: PLC0415

        client = LocalSplashClient(host=self.host, port=self.port)
        if not await asyncio.to_thread(client.is_healthy):
            raise ConnectionError(
                f"Splash engine offline ou insalubre na porta {self.port}. Inicie via LM Studio Bionic ou servidor local."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        response_format = {"type": "json_object"} if require_json else None
        temperature = float(kwargs.get("temperature", 0.2))
        max_tokens = int(kwargs.get("max_tokens", 1024))

        result = await asyncio.to_thread(
            client.chat_completion,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
        )

        content = ""
        if "choices" in result and result["choices"]:
            choice = result["choices"][0]
            content = choice.get("message", {}).get("content", "")

        usage = result.get(
            "usage",
            {
                "prompt_tokens": len(user_prompt) // 4,
                "completion_tokens": len(content) // 4,
            },
        )
        return content, usage


# Singletons de Strategies instanciados no nivel do modulo para evitar overhead de alocacao
_STRATEGY_GEMINI = GeminiStrategy()
_STRATEGY_OPENROUTER = OpenRouterStrategy()
_STRATEGY_LOCAL = GemmaLocalStrategy()
_STRATEGY_SPLASH = SplashStrategy()
_STRATEGY_OLLAMA_CLOUD = OllamaCloudStrategy()

# Tabela Hash O(1) imutavel. Evita alocacao de dicionario no Event Loop a cada inferencia.
_STRATEGIES_MAP = {
    "gemini": _STRATEGY_GEMINI,
    "openrouter": _STRATEGY_OPENROUTER,
    "local": _STRATEGY_LOCAL,
    "splash": _STRATEGY_SPLASH,
    "ollama": _STRATEGY_OLLAMA_CLOUD,
}


def _get_provider_strategy(provider: str) -> LLMProviderStrategy | None:
    return _STRATEGIES_MAP.get(provider)


def _check_local_llama_availability(model: str) -> bool:
    """Check local S2 availability: Gemma (:17043), llama.cpp (:9931), legacy (:8081..8083), or llama-swap (:8080)."""
    try:
        from llm.system2_local import edge_proxy_online  # noqa: PLC0415

        if edge_proxy_online(timeout_s=1.5):
            return True
    except Exception as exc:
        logger.debug("[LOCAL PROXY] Probe :17043 indisponivel: %s", exc)
    try:
        from llm.local_llama_client import LocalLlamaClient  # noqa: PLC0415

        model_l = model.lower()
        if "qwen" in model_l or "coder" in model_l:
            port = 8083
        elif "ling" in model_l:
            port = 8082
        elif "g9" in model_l:
            port = 8081
        else:
            port = 9931

        client = LocalLlamaClient(port=port, timeout=1.0)
        return client.is_healthy()
    except Exception:
        return False


async def _check_openrouter_availability() -> bool:
    """Check OpenRouter provider has any available key without mutating cursors."""
    try:
        from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

        return openrouter_pool_manager.has_available_key()
    except Exception:
        return False


def _check_gemini_availability(model: str | None = None) -> bool:
    """Check Gemini live singleton pool has available keys for the requested model."""
    try:
        from llm.gemini_pool import gemini_pool_manager  # noqa: PLC0415

        return gemini_pool_manager.available_keys_count(model=model) > 0
    except Exception:
        return False


def _check_openai_key_availability(model: str) -> bool:
    """Check OpenAI API key is configured for GPT models."""
    if "gpt-6" in model.lower():
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENROUTER_API_KEY")
        if not api_key or api_key.strip() == "":
            logger.warning(
                "[PROVIDER CHECK] OpenAI API key nao configurada; modelo %s sera pulado no fallback. "
                "Configure OPENAI_API_KEY ou OPENROUTER_API_KEY no ambiente para habilitar GPT models.",
                model,
            )
            return False
    return True


async def _check_provider_availability(provider: str, model: str) -> bool:
    """Verifica se um provider esta disponivel antes de tentar chamada.

    SOTA v8.0 GOLD: Prevencao de fallback desnecessario para providers offline.
    Evita tentativas de chamada a OpenAI quando modelo local deveria ser usado.

    Returns:
        True se provider estiver disponivel, False caso contrario.
    """
    strategy = _get_provider_strategy(provider)
    if strategy is None:
        return False

    # Dispatch to provider-specific checkers
    if provider == "local":
        return await asyncio.to_thread(_check_local_llama_availability, model)
    if provider == "openrouter":
        return await _check_openrouter_availability()
    if provider == "gemini":
        return _check_gemini_availability(model)
    if provider == "ollama":
        try:
            from llm.budget import OLLAMA_KEYS  # noqa: PLC0415
            from llm.ollama_cloud import billing_cooldown_remaining_s, is_configured  # noqa: PLC0415

            return (is_configured() or bool(OLLAMA_KEYS)) and billing_cooldown_remaining_s() <= 0.0
        except Exception:  # noqa: BLE001
            return False

    # For cloud providers without explicit pool, check OpenAI key if GPT model
    return _check_openai_key_availability(model)


@dataclass
class ProviderContext:
    """Context data needed across provider executions."""

    session: aiohttp.ClientSession
    task: Task
    manager: QueueManager
    provider: str
    model: str
    system_prompt: str
    user_prompt: str
    max_retries: int
    client_timeout: aiohttp.ClientTimeout | None
    require_json: bool
    c_func: Callable[[str], str]
    kwargs: dict[str, Any]


async def _handle_chaos_injection(task: Task, c_func: Callable[[str], str]) -> None:
    chaos_lambda_str = os.environ.get("NEXUS_CHAOS_LAMBDA")
    if not chaos_lambda_str:
        return
    try:
        chaos_lambda = float(chaos_lambda_str)
        if (secrets.randbelow(1_000_000) / 1_000_000.0) < chaos_lambda:
            chaos_type = secrets.choice(["503", "TIMEOUT", "LATENCY"])
            if chaos_type == "LATENCY":
                logger.warning(
                    "[[%s]%s[/]] [bold red]CHAOS INJECTED:[/] Latencia artificial",
                    c_func(task.agent),
                    task.agent,
                )
                jitter = 3.0 + (secrets.randbelow(4000) / 1000.0)
                await asyncio.sleep(jitter)
            elif chaos_type == "TIMEOUT":
                logger.warning(
                    "[[%s]%s[/]] [bold red]CHAOS INJECTED:[/] Timeout simulado",
                    c_func(task.agent),
                    task.agent,
                )
                raise TimeoutError("ChaosCore: Timeout Injected")
            elif chaos_type == "503":
                logger.warning(
                    "[[%s]%s[/]] [bold red]CHAOS INJECTED:[/] HTTP 503 Service Unavailable",
                    c_func(task.agent),
                    task.agent,
                )
                raise RuntimeError("ChaosCore: 503 Service Unavailable")
    except ValueError:
        pass


async def _notify_pool_success(provider: str, model: str, key: str, latency_ms: float) -> None:
    """Propaga sucesso e latencia medida de volta ao pool manager ativo em memoria."""
    with contextlib.suppress(Exception):
        if provider == "openrouter":
            from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

            await openrouter_pool_manager.mark_success(key, latency_ms)
        elif provider == "gemini":
            from llm.gemini_pool import gemini_pool_manager  # noqa: PLC0415

            gemini_pool_manager.mark_success(key, latency_ms, model=model)


async def _notify_pool_failure(
    provider: str,
    model: str,
    key: str,
    status_code: int,
    retry_after_s: float = 0.0,
    error_msg: str = "",
) -> None:
    """Propaga falha HTTP/timeout de volta ao pool manager ativo em memoria."""
    if not key:
        return
    with contextlib.suppress(Exception):
        if provider == "openrouter":
            from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

            await openrouter_pool_manager.mark_failure(key, status_code=status_code, retry_after_s=retry_after_s)
        elif provider == "gemini":
            from llm.gemini_pool import gemini_pool_manager  # noqa: PLC0415

            gemini_pool_manager.mark_failure(
                key,
                status_code,
                retry_after_s if retry_after_s > 0 else 0.0,
                error_msg[:300],
                model=model,
            )


async def _process_successful_call(
    strategy: LLMProviderStrategy,
    key: str,
    ctx: ProviderContext,
    start_time: float,
    key_hash: str,
    route_key: str,
    key_rank: int,
    attempt: int,
) -> dict[str, Any]:
    response_text, usage = await strategy.call(
        ctx.session,
        ctx.model,
        ctx.system_prompt,
        ctx.user_prompt,
        key,
        ctx.client_timeout,
        ctx.require_json,
        **ctx.kwargs,
    )
    if response_text is None:
        raise RuntimeError(f"{strategy.name} retornou resposta vazia.")

    response_text = enforce_pure_ascii(response_text)
    await ctx.manager.update_llm_cache(ctx.model, ctx.user_prompt, response_text)

    p_key, c_key = strategy.token_keys
    p_tokens = int(usage.get(p_key, 0))  # type: ignore[arg-type]
    c_tokens = int(usage.get(c_key, 0))  # type: ignore[arg-type]
    await ctx.manager.record_api_usage(ctx.task.id, ctx.task.agent, ctx.model, ctx.provider, p_tokens, c_tokens)

    latency_ms = int((time.monotonic() - start_time) * 1000)
    await ctx.manager.record_key_usage_metric(
        provider=ctx.provider,
        key_hash=key_hash,
        status="success",
        latency_ms=latency_ms,
        model=ctx.model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
        total_tokens=p_tokens + c_tokens,
    )
    await _register_route_success(route_key)
    await _notify_pool_success(ctx.provider, ctx.model, key, float(latency_ms))

    return {
        "text": response_text,
        "provider": ctx.provider,
        "model": ctx.model,
        "key_rank": key_rank,
        "retry_count": attempt - 1,
        "latency_ms": latency_ms,
    }


async def _handle_timeout_error(
    strategy: LLMProviderStrategy,
    ctx: ProviderContext,
    key_hash: str,
    route_key: str,
    retries_left: int,
    key: str = "",
) -> bool:
    # SOTA: A penalidade de latencia reflete estritamente o limite do SLA
    # configurado, imune a atrasos do Event Loop
    timeout_sec = ctx.client_timeout.total if ctx.client_timeout and ctx.client_timeout.total else 60.0
    latency_ms = int(timeout_sec * 1000)
    await ctx.manager.record_key_usage_metric(
        provider=ctx.provider,
        key_hash=key_hash,
        status="timeout",
        latency_ms=latency_ms,
        error_class="TimeoutError",
        error_detail=f"{strategy.name} timeout",
        model=ctx.model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
    )
    if retries_left < 0:
        logger.error(
            "[[%s]%s[/]] Timeout persistente em %s. Esgotando retries para esta chave.",
            ctx.c_func(ctx.task.agent),
            ctx.task.agent,
            strategy.name,
        )
        await _register_route_failure(route_key)
        await _notify_pool_failure(ctx.provider, ctx.model, key, 504, error_msg=f"{strategy.name} timeout")
        return False
    logger.warning(
        "[[%s]%s[/]] Timeout em %s. Retentando (%d retries restantes)...",
        ctx.c_func(ctx.task.agent),
        ctx.task.agent,
        strategy.name,
        retries_left + 1,
    )
    await asyncio.sleep(2.0)
    return True


async def _handle_5xx_error(
    status_code: int,
    strategy: LLMProviderStrategy,
    ctx: ProviderContext,
    route_key: str,
    general_retries_left: int,
    rate_limit_retries_left: int,
    key_hash: str = "none",
    key: str = "",
) -> tuple[bool, int, int]:
    await _register_route_failure(route_key)
    if general_retries_left < 0:
        logger.error(
            "[[%s]%s[/]] Erro 5xx persistente em %s. Esgotando retries.",
            ctx.c_func(ctx.task.agent),
            ctx.task.agent,
            strategy.name,
        )
        await ctx.manager.record_key_usage_metric(
            provider=ctx.provider,
            key_hash=key_hash,
            status="5xx_error",
            latency_ms=0,
            error_class="HTTP5xxError",
            error_detail=f"{strategy.name} HTTP {status_code}",
            model=ctx.model,
            agent=ctx.task.agent,
            task_id=ctx.task.id,
        )
        await _notify_pool_failure(
            ctx.provider,
            ctx.model,
            key,
            status_code or 503,
            error_msg=f"{strategy.name} HTTP {status_code}",
        )
        return False, general_retries_left, rate_limit_retries_left
    logger.warning(
        "[[%s]%s[/]] HTTP %s transiente em %s. Retentando (%d restantes)...",
        ctx.c_func(ctx.task.agent),
        ctx.task.agent,
        status_code,
        strategy.name,
        general_retries_left + 1,
    )
    await asyncio.sleep(2.0)
    return True, general_retries_left, rate_limit_retries_left


async def _handle_429_error(
    error_msg: str,
    strategy: LLMProviderStrategy,
    ctx: ProviderContext,
    general_retries_left: int,
    rate_limit_retries_left: int,
    key_hash: str = "none",
    key: str = "",
) -> tuple[bool, int, int]:
    try:
        match = re.search(r"retry_after=(\d+)", error_msg)
        delay = int(match.group(1)) if match else 0
    except Exception:  # noqa: BLE001
        delay = 0
    if delay == 0:
        delay = 15

    if delay <= 65 and rate_limit_retries_left > 0:
        rate_limit_retries_left -= 1
        sys_rand = secrets.SystemRandom()
        jitter = sys_rand.uniform(1.0, 3.0)
        sleep_time = float(delay) + jitter
        logger.info(
            "[[%s]%s[/]] 429 rate-limit em %s. Aguardando %.2fs... (%d retries de 429 restantes)",
            ctx.c_func(ctx.task.agent),
            ctx.task.agent,
            strategy.name,
            sleep_time,
            rate_limit_retries_left,
        )
        await asyncio.sleep(sleep_time)
        return True, general_retries_left, rate_limit_retries_left

    logger.warning(
        "[[%s]%s[/]] 429 quota esgotada em %s (%s). Rotacionando...",
        ctx.c_func(ctx.task.agent),
        ctx.task.agent,
        strategy.name,
        ctx.model,
    )
    await ctx.manager.record_key_usage_metric(
        provider=ctx.provider,
        key_hash=key_hash,
        status="rate_limited",
        latency_ms=0,
        error_class="HTTP429Error",
        error_detail=f"{strategy.name} 429 quota exhausted",
        model=ctx.model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
    )
    await _notify_pool_failure(
        ctx.provider,
        ctx.model,
        key,
        429,
        retry_after_s=float(delay),
        error_msg=error_msg,
    )
    await asyncio.sleep(0.25)
    return False, general_retries_left, rate_limit_retries_left


def _extract_error_status(e: Exception, error_msg: str) -> int:
    status_code = getattr(e, "status", 0) if isinstance(e, aiohttp.ClientResponseError) else 0
    if status_code == 0:
        match_http = re.search(r"\bHTTP\s+(\d{3})\b", error_msg)
        if match_http:
            status_code = int(match_http.group(1))
    return status_code


async def _record_general_failure(
    e: Exception,
    strategy: LLMProviderStrategy,
    key: str,
    ctx: ProviderContext,
    start_time: float,
    key_hash: str,
    route_key: str,
    provider_key: str,
    error_msg: str,
    status_code: int,
    general_retries_left: int,
    rate_limit_retries_left: int,
) -> tuple[bool, int, int]:
    latency_ms = int((time.monotonic() - start_time) * 1000)
    logger.warning(
        "[[%s]%s[/]] Falha na chave %s (%s): %s...",
        ctx.c_func(ctx.task.agent),
        ctx.task.agent,
        strategy.name,
        ctx.model,
        error_msg[:400],
    )
    await ctx.manager.record_key_usage_metric(
        provider=ctx.provider,
        key_hash=key_hash,
        status="error",
        latency_ms=latency_ms,
        error_class=type(e).__name__,
        error_detail=error_msg,
        model=ctx.model,
        agent=ctx.task.agent,
        task_id=ctx.task.id,
    )
    await _register_route_failure(route_key)

    if (
        status_code == 404
        or "connection closed" in error_msg.lower()
        or "cannot connect" in error_msg.lower()
        or "no longer available" in error_msg.lower()
    ):
        extra = max(0, ROUTE_FAILURE_THRESHOLD - 1)
        for _ in range(extra):
            await _register_route_failure(route_key)

    if status_code in (401, 402, 403):
        await _block_key(provider_key)
        await _notify_pool_failure(ctx.provider, ctx.model, key, status_code, error_msg=error_msg)
    elif status_code:
        await _notify_pool_failure(ctx.provider, ctx.model, key, status_code, error_msg=error_msg)

    await strategy.handle_semantic_error(e, ctx.model, key)
    return False, general_retries_left, rate_limit_retries_left


async def _handle_general_error(
    e: Exception,
    strategy: LLMProviderStrategy,
    key: str,
    ctx: ProviderContext,
    start_time: float,
    key_hash: str,
    route_key: str,
    provider_key: str,
    general_retries_left: int,
    rate_limit_retries_left: int,
) -> tuple[bool, int, int]:
    # SOTA: Purificacao ASCII e truncamento para evitar explosao de logs
    # em respostas HTML macicas de erro (ex: 503 Cloudflare)
    error_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
    status_code = _extract_error_status(e, error_msg)

    if (status_code >= 500) or "chaoscore: 503" in error_msg.lower():
        return await _handle_5xx_error(
            status_code,
            strategy,
            ctx,
            route_key,
            general_retries_left,
            rate_limit_retries_left,
            key_hash=key_hash,
            key=key,
        )

    if "429" in error_msg:
        should_retry, g_left, r_left = await _handle_429_error(
            error_msg,
            strategy,
            ctx,
            general_retries_left,
            rate_limit_retries_left,
            key_hash=key_hash,
            key=key,
        )
        if not should_retry and ctx.provider == "gemini":
            await _block_gemini_model_key(ctx.model, key)
        return should_retry, g_left, r_left

    if general_retries_left >= 0 and status_code not in (400, 401, 402, 403, 404) and not _is_semantic_gemini_error(e):
        logger.warning(
            "[[%s]%s[/]] Erro geral em %s (%s). Retentando... (%d restantes)",
            ctx.c_func(ctx.task.agent),
            ctx.task.agent,
            strategy.name,
            type(e).__name__,
            general_retries_left + 1,
        )
        await asyncio.sleep(1.0)
        return True, general_retries_left, rate_limit_retries_left

    return await _record_general_failure(
        e,
        strategy,
        key,
        ctx,
        start_time,
        key_hash,
        route_key,
        provider_key,
        error_msg,
        status_code,
        general_retries_left,
        rate_limit_retries_left,
    )


async def _attempt_key_execution(
    strategy: LLMProviderStrategy,
    provider_key: str,
    key_hash: str,
    key: str,
    key_rank: int,
    route_key: str,
    ctx: ProviderContext,
    attempt: int,
    general_retries_left: int,
    rate_limit_retries_left: int,
) -> tuple[Any, bool, int, int]:
    start_time = time.monotonic()
    try:
        log_msg = (
            f"Retentativa {attempt} para {ctx.model}..."
            if attempt > 1
            else f"Acionando cognicao via {strategy.name} ({ctx.model}, Chave {key_rank})..."
        )
        logger.info("[[%s]%s[/]] %s", ctx.c_func(ctx.task.agent), ctx.task.agent, log_msg)

        await _handle_chaos_injection(ctx.task, ctx.c_func)
        result = await _process_successful_call(
            strategy,
            key,
            ctx,
            start_time,
            key_hash,
            route_key,
            key_rank,
            attempt,
        )
        return result, False, general_retries_left, rate_limit_retries_left
    except TimeoutError:
        general_retries_left -= 1
        should_retry = await _handle_timeout_error(
            strategy,
            ctx,
            key_hash,
            route_key,
            general_retries_left,
            key=key,
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
    provider_key: str,
    key_hash: str,
    key: str,
    key_rank: int,
    route_key: str,
    ctx: ProviderContext,
) -> dict[str, Any] | str:
    general_retries_left = max(0, ctx.max_retries)
    rate_limit_retries_left = 3  # Orcamento dedicado para absorver rajadas de 429
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
            provider_key,
            key_hash,
            key,
            key_rank,
            route_key,
            ctx,
            attempt,
            general_retries_left,
            rate_limit_retries_left,
        )

        # SOTA: Se houve resposta (mesmo que com retentativas), entregamos o artefato.
        if result is not None:
            return cast(dict[str, Any], result)

        # SOTA: Se o tratador de erro determinou que nao devemos continuar
        # (ex: quota esgotada), abortamos esta chave para permitir a rotacao
        # no proximo slot do pool.
        if not should_continue:
            break

    if await _is_route_blocked(route_key):
        logger.warning(
            "[[%s]%s[/]] Rota %s:%s entrou em cooldown apos falha. Avancando para proximo modelo.",
            ctx.c_func(ctx.task.agent),
            ctx.task.agent,
            ctx.provider,
            ctx.model,
        )
        return "ROUTE_BLOCKED"

    return "SKIP_KEY"


async def _check_and_execute_key(
    strategy: LLMProviderStrategy,
    provider: str,
    model: str,
    key: str,
    key_rank: int,
    route_key: str,
    ctx: ProviderContext,
) -> dict[str, Any] | str:
    """Helper to check quarantine/blocking status and execute a key."""
    if await strategy.check_quarantine(model, key):
        logger.warning(
            "[%s] Chave %s em quarentena semantica para modelo %s (Chave %d). Pulando.",
            ctx.task.agent,
            strategy.name,
            model,
            key_rank,
        )
        return "SKIP_KEY"

    provider_key = _key_identifier(provider, key)
    key_hash = _key_fingerprint(provider, key)

    if await _is_key_blocked(provider_key):
        logger.warning(
            "[%s] Chave %s bloqueada temporariamente (Chave %d). Pulando.",
            ctx.task.agent,
            strategy.name,
            key_rank,
        )
        return "SKIP_KEY"

    return await _execute_single_key(
        strategy=strategy,
        provider_key=provider_key,
        key_hash=key_hash,
        key=key,
        key_rank=key_rank,
        route_key=route_key,
        ctx=ctx,
    )


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
    **kwargs: Any,
) -> dict[str, Any] | None:
    """Orquestrador de Provedor SOTA. Delega o comportamento para o padrao Strategy."""
    if not keys:
        return None

    _c = _te._c
    strategy = _get_provider_strategy(provider)
    if not strategy:
        if provider == "anthropic":
            logger.debug("Provedor '%s' indisponivel no momento; pulando modelo %s.", provider, model)
        else:
            logger.error("Provedor desconhecido: %s", provider)
        return None

    route_key = _route_identifier(provider, model)
    ranked_keys = await _rank_keys_by_health(provider, keys, manager)

    # SOTA: Rastreio absoluto da latencia final incluindo atrasos de retries
    # truncados e fallbacks de rede
    t0_provider = time.monotonic()

    for i, key in enumerate(ranked_keys):
        if await _is_route_blocked(route_key):
            logger.warning(
                "[%s] Rota %s:%s entrou em cooldown durante a rotacao de chaves. Interrompendo tentativas desta rota.",
                task.agent,
                strategy.name,
                model,
            )
            break

        ctx = ProviderContext(
            session=session,
            task=task,
            manager=manager,
            provider=provider,
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_retries=max_retries,
            client_timeout=client_timeout,
            require_json=require_json,
            c_func=_c,
            kwargs=kwargs,
        )

        result = await _check_and_execute_key(
            strategy=strategy,
            provider=provider,
            model=model,
            key=key,
            key_rank=i + 1,
            route_key=route_key,
            ctx=ctx,
        )

        if isinstance(result, str):
            if result == "SKIP_KEY":
                continue
            return None

        # SOTA: Sobrescreve a latencia micro para espelhar o tempo macro gasto
        # (incluindo retries agressivos)
        result["latency_ms"] = int((time.monotonic() - t0_provider) * 1000)
        return result

    return None
