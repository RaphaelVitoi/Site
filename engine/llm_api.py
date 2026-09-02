"""Modulo Orquestrador SOTA de APIs de Inferencia e Circuit Breaker."""
from __future__ import annotations

import asyncio
import logging
import os
import time
from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import aiohttp

from core.config import (
    AGENT_ROUTING_MAP,
    DEEP_THINKING_MODELS,
    FAST_OPERATIONS_MODELS,
    KEY_BLOCKLIST,
    _block_key,
    _is_key_blocked,
    _key_identifier,
    # Importada como FUNCAO de proposito: os nomes acima sao rebindados no
    # hot-reload de configuracao, entao esta copia deles envelhece. Uma funcao
    # le os globais de `core.config` na hora da chamada e nao tem esse problema.
    modelo_do_agente,
)
from core.schemas import Task
from database.queue_manager import QueueManager
from utils.env_loader import load_env

# SOTA: Circuit Breaker de Provedores (Impede pingar APIs caidas)
PROVIDER_FAILURE_COUNTS: dict = {}
PROVIDER_BLOCK_UNTIL: dict = {}
MAX_PROVIDER_FAILURES = 3
PROVIDER_BLOCK_DURATION = 300  # 5 minutos de bloqueio em caso de queda de servidor
CONTENT_TYPE_JSON = "application/json"
circuit_breaker_lock = asyncio.Lock()

logger = logging.getLogger(__name__)


@dataclass
class ProviderCallConfig:
    """Agrupa parametros estaticos de uma chamada de provedor para reduzir a aridade (S107)."""

    provider_name: str
    task: Task
    manager: QueueManager
    max_retries: int
    usage_keys: tuple[str, str]
    block_on_429_quota: bool
    provider_key: str
    response_format: dict | None = field(default=None)


async def call_gemini(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str | None = None,
    response_format: dict | None = None,
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor Gemini via REST API."""
    if not api_key:
        api_key = os.environ.get("API_SECRET_TOKEN", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": CONTENT_TYPE_JSON}
    data: dict[str, Any] = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
    }
    if response_format:
        data["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": response_format,
        }

    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        usage = result.get("usageMetadata", {})
        return text, usage


async def call_anthropic(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    response_format: dict | None = None,
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
    if response_format:
        logger.warning("[SOTA RAG] Anthropic API nativa nao suporta json_schema estrito. Passando ignorado.")
    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        text = result["content"][0]["text"]
        usage = result.get("usage", {})
        return text, usage


async def call_openrouter(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    response_format: dict | None = None,
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor OpenRouter via REST API."""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Content-Type": CONTENT_TYPE_JSON, "Authorization": f"Bearer {api_key}"}
    data: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    if response_format:
        data["response_format"] = {
            "type": "json_schema",
            "json_schema": {"name": "structured_output", "schema": response_format, "strict": True},
        }
    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        text = result["choices"][0]["message"]["content"]
        usage = result.get("usage", {})
        return text, usage


async def call_gemma_local(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str | None = None,
    response_format: dict | None = None,
) -> tuple[str, dict[str, Any]]:
    """Invocacao do Oraculo de Borda (Gemma 4 Local Server) usando aiohttp."""
    if not api_key:
        api_key = os.environ.get("API_SECRET_TOKEN") or os.environ.get("VITOI_AUTH_TOKEN")
    if not api_key:
        raise RuntimeError("Nenhum token (API_SECRET_TOKEN ou VITOI_AUTH_TOKEN) configurado no ambiente.")
    url = "http://127.0.0.1:17043/generate"  # Roteado para o Proxy SOTA
    headers = {"Content-Type": CONTENT_TYPE_JSON, "X-Vitoi-Auth": api_key}
    data: dict[str, Any] = {
        "prompt": user_prompt,
        "system_prompt": system_prompt,
        "max_tokens": 1024,
        "model": model,  # O Proxy SOTA julgara o roteamento se for um valor generico
    }
    if response_format:
        data["response_format"] = response_format
    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        text = await response.text()
        usage = {
            "prompt_tokens": len(user_prompt) // 4,
            "completion_tokens": len(text) // 4,
        }
        return text, usage


async def _evaluate_api_error(error_msg: str, provider_name: str, provider_key: str, block_on_429: bool) -> str:
    """Retorna 'abort_provider', 'abort_key', ou 'retry'."""
    if any(err in error_msg for err in ["500", "502", "503", "504", "timeout"]):
        async with circuit_breaker_lock:
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
    if any(err in error_msg for err in ["401", "403", "unauthorized", "credit", "balance", "402"]):
        _block_key(provider_key)
        return "abort_key"
    if "429" in error_msg:
        if block_on_429 and any(q_err in error_msg for q_err in ["quota", "limit", "exhausted"]):
            _block_key(provider_key)
        return "abort_key"
    if "404" in error_msg:
        return "abort_key"
    return "abort_key"


async def _execute_provider_attempt(
    session: aiohttp.ClientSession,
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
    response_format: dict | None = None,
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
        response_text, usage = await api_call_func(session, model, system_prompt, user_prompt, key, response_format)
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
        await manager.record_api_usage(task.id, task.agent, model, provider_name, prompt_tokens, completion_tokens)

        # Reseta o Circuit Breaker em caso de sucesso
        async with circuit_breaker_lock:
            PROVIDER_FAILURE_COUNTS[provider_name] = 0
        return response_text, ""
    except Exception as e:  # pylint: disable=broad-exception-caught
        return None, str(e).lower()


async def _try_single_key(
    session: aiohttp.ClientSession,
    api_call_func: Callable,
    model: str,
    system_prompt: str,
    user_prompt: str,
    key: str,
    key_index: int,
    cfg: ProviderCallConfig,
) -> tuple[str | None, str | None]:
    """
    Processa a tentativa de uma unica chave, aplicando retry e backoff SOTA.
    Retorna (response_text, action).
    """
    for attempt in range(cfg.max_retries):
        response_text, error_msg = await _execute_provider_attempt(
            session,
            cfg.provider_name,
            api_call_func,
            model,
            system_prompt,
            user_prompt,
            key,
            cfg.task,
            cfg.manager,
            cfg.usage_keys,
            attempt + 1,
            key_index,
            cfg.response_format,
        )
        if response_text:
            return response_text, None

        logger.warning(
            "[%s] Falha em %s com %s (Chave %d): %s",
            cfg.task.agent,
            cfg.provider_name,
            model,
            key_index,
            error_msg,
        )
        action = await _evaluate_api_error(error_msg, cfg.provider_name, cfg.provider_key, cfg.block_on_429_quota)
        if action == "abort_provider":
            return None, "abort_provider"
        if action == "abort_key":
            return None, "abort_key"
        if action == "retry":
            backoff_time = 2**attempt
            logger.warning(
                "[%s] [RATE LIMITER SOTA] Throttle/Timeout detectado. "
                "Backoff acionado: aguardando %ds antes do retry...",
                cfg.task.agent,
                backoff_time,
            )
            await asyncio.sleep(backoff_time)
    return None, "exhausted"


# Cursor por provedor: de onde a PROXIMA requisicao comeca a percorrer as chaves.
# Sem ele, toda requisicao comeca em keys[0] e a distribuicao que o balde de
# `llm/budget.py` pressupoe nunca acontece. Um int por provedor basta  o loop
# de eventos e monotarefa e nao ha await entre a leitura e a escrita.
_provider_cursor: dict[str, int] = defaultdict(int)


def _next_start_index(provider_name: str, total_keys: int) -> int:
    """Gira o ponto de partida para que a carga se espalhe pela frota.

    A ordem RELATIVA das chaves nao muda  quem esta bloqueada continua sendo
    pulada e a lista inteira continua sendo percorrida antes de desistir. So o
    ponto de entrada anda, de modo que N requisicoes seguidas atinjam N chaves
    diferentes em vez de martelarem a primeira.
    """
    if total_keys <= 1:
        return 0
    start = _provider_cursor[provider_name] % total_keys
    _provider_cursor[provider_name] = (start + 1) % total_keys
    return start


async def _try_provider(
    session: aiohttp.ClientSession,
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
    response_format: dict | None = None,
) -> str | None:
    """
    Funcao generica SOTA para tentar um provedor de API.
    Complexidade ciclomatica reduzida (S3776) via extracao de _try_single_key.
    """
    current_time = time.time()
    async with circuit_breaker_lock:
        blocked_until = PROVIDER_BLOCK_UNTIL.get(provider_name, 0)
    if blocked_until > current_time:
        logger.warning(
            "[CIRCUIT BREAKER] Provedor '%s' temporariamente em quarentena. Acionando Fallback...",
            provider_name,
        )
        return None

    # O balde de `llm/budget.py` e dimensionado pela FROTA:
    #     TOTAL_PRO_RPM = GEMINI_PRO_RPM_PER_KEY * n_chaves
    # Isso so e honesto se o consumo realmente se espalhar. Comecando sempre em
    # keys[0], as 4*N chamadas que o balde autorizou por minuto caem TODAS na
    # primeira chave ate ela levar 429; a fila entao anda para keys[1] e repete.
    # O resultado e queimar as chaves em sequencia, em segundos  que e o padrao
    # que os provedores detectam como abuso e que bloqueia a conta inteira, nao
    # so a chave.
    #
    # O balde nao estava errado; o consumo e que nao cumpria a premissa dele.
    # Girar o ponto de partida faz a premissa virar verdade, sem mexer na cota.
    start = _next_start_index(provider_name, len(keys))
    for offset in range(len(keys)):
        i = (start + offset) % len(keys)
        key = keys[i]
        provider_key = _key_identifier(provider_name, key)
        if _is_key_blocked(provider_key):
            continue

        cfg = ProviderCallConfig(
            provider_name=provider_name,
            task=task,
            manager=manager,
            max_retries=max_retries,
            usage_keys=usage_keys,
            block_on_429_quota=block_on_429_quota,
            provider_key=provider_key,
            response_format=response_format,
        )
        response_text, action = await _try_single_key(
            session,
            api_call_func,
            model,
            system_prompt,
            user_prompt,
            key,
            i + 1,
            cfg,
        )
        if response_text:
            return response_text
        if action == "abort_provider":
            return None

    return None


def _generate_fallback_response(agent_name: str, models_to_try: list[str]) -> str:
    return (
        f"### ALERTA DE CONTINGENCIA (FALLBACK)\n"
        f"O agente `{agent_name}` falhou em sua missao. Nenhuma API respondeu aos chamados.\n"
        f"**Modelos Tentados:** {', '.join(models_to_try)}\n"
        f"**Chaves Bloqueadas na Sessao:** {list(KEY_BLOCKLIST.keys())}\n\n"
        "**Plano de Acao Sugerido:**\n"
        "1.  Verifique a conexao de rede com `nexus-diag-net`.\n"
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
    response_format: dict | None = None,
) -> str | None:
    async with aiohttp.ClientSession() as session:
        model_l = model.lower()
        if "gemma" in model_l and ("google/" in model_l or model_l.startswith("gemma")):
            # Invocacao Local (SOTA Edge)
            try:
                res, _ = await call_gemma_local(
                    session, model, system_prompt, user_prompt, response_format=response_format
                )
                return res
            except Exception as e:  # pylint: disable=broad-exception-caught
                logger.warning("Falha no Motor Gemma Local: %s. Tentando roteamento externo...", e)

        if "/" in model or "deepseek" in model or "llama" in model:
            return await _try_provider(
                session,
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
                response_format=response_format,
            )
        if "gemini" in model:
            return await _try_provider(
                session,
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
                response_format=response_format,
            )
        if "claude" in model:
            return await _try_provider(
                session,
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
                response_format=response_format,
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
            if v and (k.upper().startswith("GEMINI") or k.upper().startswith("GOOGLE")) and "CLI" not in k.upper()
        )
    )
    anthropic_keys = list(dict.fromkeys(v for k, v in all_env_vars.items() if v and k.upper().startswith("ANTHROPIC")))
    openrouter_keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v and (k.upper().startswith("OPENROUTER") or k.upper().startswith("OPEN_ROUTER"))
        )
    )
    return gemini_keys, anthropic_keys, openrouter_keys


def _build_models_to_try(task: Task, agent_type: str, openrouter_keys: list[str]) -> list[str]:
    """Extrai a lista de modelos candidatos para a tarefa de forma deterministica."""
    candidates: list[str] = []

    model_override = task.metadata.get("model_override") if task.metadata else None
    if isinstance(model_override, str) and model_override:
        candidates.append(model_override)

    agent_clean = task.agent.replace("@", "")
    # Mesma fonte unica do orquestrador: a politica por classe de tarefa, com o
    # `primary_model` do manifesto so como rede de seguranca avisada.
    modelo_da_politica = modelo_do_agente(agent_clean)
    if modelo_da_politica and modelo_da_politica not in candidates:
        candidates.append(modelo_da_politica)

    fallbacks = DEEP_THINKING_MODELS if agent_type == "deep_thinking" else FAST_OPERATIONS_MODELS
    for model_name in fallbacks:
        if model_name not in candidates:
            candidates.append(model_name)

    if openrouter_keys:
        extras = (
            ["anthropic/claude-3.5-sonnet", "deepseek/deepseek-chat"]
            if agent_type == "deep_thinking"
            else ["google/gemini-2.5-flash", "meta-llama/llama-3.1-8b-instruct"]
        )
        candidates.extend(m for m in extras if m not in candidates)

    return candidates


async def call_llm_api(
    task: Task, system_prompt: str, user_prompt: str, manager: QueueManager, response_format: dict | None = None
) -> str:
    """Ponto de entrada SOTA que orquestra e delega a cognicao as LLMs configuradas."""
    agent_type = AGENT_ROUTING_MAP.get(task.agent, "fast_operations")

    env_keys = load_env()
    all_env_vars = {**os.environ, **env_keys}
    gemini_keys, anthropic_keys, openrouter_keys = _extract_provider_keys(all_env_vars)

    models_to_try = _build_models_to_try(task, agent_type, openrouter_keys)

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
            response_format=response_format,
        )
        if response:
            return response

    logger.warning("[%s] Modo Simulacao Ativado.", task.agent)
    return _generate_fallback_response(task.agent, models_to_try)
