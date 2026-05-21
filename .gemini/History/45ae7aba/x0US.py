"""Módulo Orquestrador SOTA de APIs de Inferência e Circuit Breaker."""

import json
import logging
import os
import re
import time
import asyncio
import urllib.error
import urllib.request
from collections.abc import Callable
from pathlib import Path
from typing import Any

from core.config import (
    AGENT_ROUTING_MAP,
    DEEP_THINKING_MODELS,
    FAST_OPERATIONS_MODELS,
    KEY_BLOCKLIST,
    _block_key,
    _is_key_blocked,
    _key_identifier,
)
from core.schemas import Task
from database.queue_manager import QueueManager

# SOTA: Circuit Breaker de Provedores (Impede pingar APIs caídas)
PROVIDER_FAILURE_COUNTS = {}
PROVIDER_BLOCK_UNTIL = {}
MAX_PROVIDER_FAILURES = 3
PROVIDER_BLOCK_DURATION = 300  # 5 minutos de bloqueio em caso de queda de servidor
CONTENT_TYPE_JSON = "application/json"

logger = logging.getLogger(__name__)


def _load_env_keys() -> dict[str, str]:
    keys = {}
    base_dir = Path(__file__).parent.parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            try:
                content = env_path.read_text(encoding="utf-8", errors="ignore")
                # Regex para capturar variaveis de .env e .ps1
                pattern = (
                    r'(?:export |\$env:)?([\w]+)\s*[:=]\s*["\']?([^"\'\s#]+)["\']?'
                )
                for match in re.finditer(pattern, content):
                    key, value = match.groups()
                    if key and value:
                        keys[key] = value
            except Exception as e:  # pylint: disable=broad-exception-caught
                logger.warning("Aviso ao ler %s: %s", file_name, e)
    return keys


def call_gemini(
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str = "sota-token-2026",  # NOSONAR - Retains factory signature
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor Gemini via REST API."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    headers = {"Content-Type": CONTENT_TYPE_JSON}
    data = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
    }
    req = urllib.request.Request(  # noqa: S310
        url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as response:  # noqa: S310
            result = json.loads(response.read().decode("utf-8"))
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            usage = result.get("usageMetadata", {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(
            f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}"
        ) from e


def call_anthropic(
    model: str, system_prompt: str, user_prompt: str, api_key: str
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor Anthropic (Claude) via REST API."""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": CONTENT_TYPE_JSON,
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    }
    data = {
        "model": model,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    req = urllib.request.Request(  # noqa: S310
        url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as response:  # noqa: S310
            result = json.loads(response.read().decode("utf-8"))
            text = result["content"][0]["text"]
            usage = result.get("usage", {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(
            f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}"
        ) from e


def call_openrouter(
    model: str, system_prompt: str, user_prompt: str, api_key: str
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor OpenRouter via REST API."""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Content-Type": CONTENT_TYPE_JSON, "Authorization": f"Bearer {api_key}"}
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    req = urllib.request.Request(  # noqa: S310
        url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as response:  # noqa: S310
            result = json.loads(response.read().decode("utf-8"))
            text = result["choices"][0]["message"]["content"]
            usage = result.get("usage", {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(
            f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}"
        ) from e


def call_gemma_local(
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str = "sota-token-2026",  # NOSONAR
) -> tuple[str, dict[str, Any]]:
    """Invocacao do Oraculo de Borda (Gemma 4 Local Server)."""
    url = "http://127.0.0.1:17043/generate"  # Roteado para o Proxy SOTA
    headers = {"Content-Type": CONTENT_TYPE_JSON, "X-Vitoi-Auth": api_key}
    data = {
        "prompt": user_prompt,
        "system_prompt": system_prompt,
        "max_tokens": 1024,
        "model": model,  # O Proxy SOTA julgara o roteamento se for um valor generico
    }
    req = urllib.request.Request(  # noqa: S310
        url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as response:  # noqa: S310
            text = response.read().decode("utf-8")
            # Metricas ficticias para local
            usage = {
                "prompt_tokens": len(user_prompt) // 4,
                "completion_tokens": len(text) // 4,
            }
            return text, usage
    except Exception as e:  # pylint: disable=broad-exception-caught
        raise RuntimeError(f"Motor Gemma Local Indisponivel: {e}") from e


def _evaluate_api_error(
    error_msg: str, provider_name: str, provider_key: str, block_on_429: bool
) -> str:
    """Retorna 'abort_provider', 'abort_key', ou 'retry'."""
    if any(err in error_msg for err in ["500", "502", "503", "504", "timeout"]):
        fail_count = PROVIDER_FAILURE_COUNTS.get(provider_name, 0) + 1
        PROVIDER_FAILURE_COUNTS[provider_name] = fail_count
        if fail_count >= MAX_PROVIDER_FAILURES:
            PROVIDER_BLOCK_UNTIL[provider_name] = time.time() + PROVIDER_BLOCK_DURATION
            logger.critical(
                "[CIRCUIT BREAKER] Provedor '%s' caiu (%d falhas). Bloqueando por 5 min.",
                provider_name,
                fail_count,
            )
            return "abort_provider"
        return "retry"
    if any(
        err in error_msg
        for err in ["401", "403", "unauthorized", "credit", "balance", "402"]
    ):
        _block_key(provider_key)
        return "abort_key"
    if "429" in error_msg:
        if block_on_429 and any(
            q_err in error_msg for q_err in ["quota", "limit", "exhausted"]
        ):
            _block_key(provider_key)
        return "abort_key"
    if "404" in error_msg:
        return "abort_key"
    return "abort_key"


async def _execute_provider_attempt(
    provider_name: str,
    api_call_func: Callable,
    model: str,
    system_prompt: str,
    user_prompt: str,
    key: str,
    task: Task,
    manager: QueueManager,
    usage_keys: tuple[str, str],
    attempt: int,
    key_index: int,
) -> tuple[str | None, str]:
    """Executa a chamada a API e retorna a (resposta_texto, erro_str)."""
    try:
        logger.info(
            "[%s] Acionando %s via %s (Chave %d, Tentativa %d)...",
            task.agent,
            model,
            provider_name,
            key_index,
            attempt,
        )

        start_time = time.perf_counter()
        # SOTA: Protege o Event Loop contra I/O bloqueante do urllib
        response_text, usage = await asyncio.to_thread(
            api_call_func, model, system_prompt, user_prompt, key
        )
        latency = time.perf_counter() - start_time
        logger.info(
            "[%s] [SOTA TELEMETRY] %s via %s consolidou resposta em %.2fs",
            task.agent,
            model,
            provider_name,
            latency,
        )

        await manager.update_llm_cache(model, user_prompt, response_text)
        prompt_tokens = usage.get(usage_keys[0], 0)
        completion_tokens = usage.get(usage_keys[1], 0)
        await manager.record_api_usage(
            task.id, task.agent, model, provider_name, prompt_tokens, completion_tokens
        )

        # Reseta o Circuit Breaker em caso de sucesso
        PROVIDER_FAILURE_COUNTS[provider_name] = 0
        return response_text, ""
    except Exception as e:  # pylint: disable=broad-exception-caught
        return None, str(e).lower()


async def _try_single_key(
    provider_name: str,
    api_call_func: Callable,
    model: str,
    system_prompt: str,
    user_prompt: str,
    key: str,
    key_index: int,
    task: Task,
    manager: QueueManager,
    max_retries: int,
    usage_keys: tuple[str, str],
    block_on_429_quota: bool,
    provider_key: str,
) -> tuple[str | None, str | None]:
    """
    Processa a tentativa de uma unica chave, aplicando retry e backoff SOTA.
    Retorna (response_text, action).
    """
    for attempt in range(max_retries):
        response_text, error_msg = await _execute_provider_attempt(
            provider_name,
            api_call_func,
            model,
            system_prompt,
            user_prompt,
            key,
            task,
            manager,
            usage_keys,
            attempt + 1,
            key_index,
        )
        if response_text:
            return response_text, None

        logger.warning(
            "[%s] Falha em %s com %s (Chave %d): %s",
            task.agent,
            provider_name,
            model,
            key_index,
            error_msg,
        )
        action = _evaluate_api_error(
            error_msg, provider_name, provider_key, block_on_429_quota
        )
        if action == "abort_provider":
            return None, "abort_provider"
        if action == "abort_key":
            return None, "abort_key"
        if action == "retry":
            backoff_time = 2**attempt
            logger.warning(
                "[%s] [RATE LIMITER SOTA] Throttle/Timeout detectado. "
                "Backoff acionado: aguardando %ds antes do retry...",
                task.agent,
                backoff_time,
            )
            await asyncio.sleep(backoff_time)
    return None, "exhausted"


async def _try_provider(
    provider_name: str,
    api_call_func: Callable,
    model: str,
    system_prompt: str,
    user_prompt: str,
    keys: list[str],
    task: Task,
    manager: QueueManager,
    max_retries: int = 2,
    usage_keys: tuple[str, str] = ("prompt_tokens", "completion_tokens"),
    block_on_429_quota: bool = True,
) -> str | None:
    """
    Função generica SOTA para tentar um provedor de API.
    Complexidade ciclomatica reduzida (S3776) via extracao de _try_single_key.
    """
    current_time = time.time()
    if PROVIDER_BLOCK_UNTIL.get(provider_name, 0) > current_time:
        logger.warning(
            "[CIRCUIT BREAKER] Provedor '%s' temporariamente em quarentena. Acionando Fallback...",
            provider_name,
        )
        return None

    for i, key in enumerate(keys):
        provider_key = _key_identifier(provider_name, key)
        if _is_key_blocked(provider_key):
            continue

        response_text, action = await _try_single_key(
            provider_name,
            api_call_func,
            model,
            system_prompt,
            user_prompt,
            key,
            i + 1,
            task,
            manager,
            max_retries,
            usage_keys,
            block_on_429_quota,
            provider_key,
        )
        if response_text:
            return response_text
        if action == "abort_provider":
            return None

    return None


def _generate_fallback_response(agent_name: str, models_to_try: list[str]) -> str:
    return (
        f"### ALERTA DE CONTINGÊNCIA (FALLBACK)\n"
        f"O agente `{agent_name}` falhou em sua missão. Nenhuma API respondeu aos chamados.\n"
        f"**Modelos Tentados:** {', '.join(models_to_try)}\n"
        f"**Chaves Bloqueadas na Sessão:** {list(KEY_BLOCKLIST.keys())}\n\n"
        "**Plano de Ação Sugerido:**\n"
        "1.  Verifique a conexão de rede com `nexus-diag-net`.\n"
        "2.  Audite o status das chaves de API com `nexus-keys`.\n"
        "3.  Se o problema persistir, pode ser uma falha generalizada nos provedores. "
        "Aguarde e tente novamente.\n\n"
        "```json\n"
        '[\n  {"description": "Diagnosticar e corrigir a falha de conectividade das APIs de LLM.", '
        '"agent": "@chico", "metadata": {"priority": "critical"}}\n]\n'
        "```"
    )


async def _dispatch_provider_call(
    model: str,
    system_prompt: str,
    user_prompt: str,
    gemini_keys: list[str],
    anthropic_keys: list[str],
    openrouter_keys: list[str],
    task: Task,
    manager: QueueManager,
) -> str | None:
    model_l = str(model).lower()
    if "gemma" in model_l and ("google/" in model_l or model_l.startswith("gemma")):
        # Invocacao Local (SOTA Edge)
        try:
            res, _ = await asyncio.to_thread(
                call_gemma_local, model, system_prompt, user_prompt
            )
            return res
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.warning(
                "Falha no Motor Gemma Local: %s. Tentando roteamento externo...", e
            )

    if "/" in model or "deepseek" in model or "llama" in model:
        return await _try_provider(
            "openrouter",
            call_openrouter,
            model,
            system_prompt,
            user_prompt,
            openrouter_keys,
            task,
            manager,
            max_retries=3,
            usage_keys=("prompt_tokens", "completion_tokens"),
        )
    elif "gemini" in model:
        return await _try_provider(
            "gemini",
            call_gemini,
            model,
            system_prompt,
            user_prompt,
            gemini_keys,
            task,
            manager,
            max_retries=2,
            usage_keys=("promptTokenCount", "candidatesTokenCount"),
        )
    elif "claude" in model:
        return await _try_provider(
            "anthropic",
            call_anthropic,
            model,
            system_prompt,
            user_prompt,
            anthropic_keys,
            task,
            manager,
            max_retries=3,
            usage_keys=("input_tokens", "output_tokens"),
        )
    logger.warning("Modelo desconhecido '%s' no pipeline, pulando.", model)
    return None


def _extract_provider_keys(
    all_env_vars: dict[str, str],
) -> tuple[list[str], list[str], list[str]]:
    gemini_keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v
            and (k.upper().startswith("GEMINI") or k.upper().startswith("GOOGLE"))
            and "CLI" not in k.upper()
        )
    )
    anthropic_keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v and k.upper().startswith("ANTHROPIC")
        )
    )
    openrouter_keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v
            and (
                k.upper().startswith("OPENROUTER")
                or k.upper().startswith("OPEN_ROUTER")
            )
        )
    )
    return gemini_keys, anthropic_keys, openrouter_keys


async def call_llm_api(
    task: Task, system_prompt: str, user_prompt: str, manager: QueueManager
) -> str:
    """Ponto de entrada SOTA que orquestra e delega a cognição às LLMs configuradas."""
    agent_type = AGENT_ROUTING_MAP.get(task.agent, "fast_operations")
    models_to_try = (
        list(DEEP_THINKING_MODELS)
        if agent_type == "deep_thinking"
        else list(FAST_OPERATIONS_MODELS)
    )

    env_keys = _load_env_keys()
    all_env_vars = {**os.environ, **env_keys}

    # SOTA: Agregação e de-duplicação de chaves de API extraida para reduzir complexidade
    gemini_keys, anthropic_keys, openrouter_keys = _extract_provider_keys(all_env_vars)

    # SOTA: Injeção dinâmica de modelos alternativos se houver chaves do OpenRouter
    if openrouter_keys:
        if agent_type == "deep_thinking":
            models_to_try.extend(
                [
                    "anthropic/claude-3.5-sonnet",
                    "deepseek/deepseek-chat",
                ]
            )
        else:
            models_to_try.extend(
                [
                    "google/gemini-2.0-flash",
                    "meta-llama/llama-3.1-8b-instruct",
                ]
            )

    for model in models_to_try:
        response = await _dispatch_provider_call(
            model,
            system_prompt,
            user_prompt,
            gemini_keys,
            anthropic_keys,
            openrouter_keys,
            task,
            manager,
        )
        if response:
            return response

    logger.warning("[%s] Modo Simulacao Ativado.", task.agent)
    return _generate_fallback_response(task.agent, models_to_try)
