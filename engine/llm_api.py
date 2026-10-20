"""Modulo Orquestrador SOTA de APIs de Inferencia e Circuit Breaker."""

from __future__ import annotations

import asyncio
from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass, field
import logging
import os
from pathlib import Path
import time
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
from llm.adapters import AnthropicAdapter, GoogleGenAIAdapter
from utils.env_loader import load_env

# SOTA: Circuit Breaker de Provedores (Impede pingar APIs caidas)
PROVIDER_FAILURE_COUNTS: dict = {}
PROVIDER_BLOCK_UNTIL: dict = {}
MAX_PROVIDER_FAILURES = 3
PROVIDER_BLOCK_DURATION = 300  # 5 minutos de bloqueio em caso de queda de servidor
CONTENT_TYPE_JSON = "application/json"
MODEL_POOLSIDE_LAGUNA_FREE = "poolside/laguna-s-2.1:free"
MODEL_GEMINI_35_FLASH_LITE = "gemini-3.5-flash-lite"
MODEL_OPENROUTER_GEMINI_35_FLASH_LITE = "google/gemini-3.5-flash-lite"
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
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    # BK-14 (auditoria 2026-09-16): sem chave, este ramo usava API_SECRET_TOKEN --
    # a credencial de servico do backend -- como chave Gemini, e a enviava ao
    # Google na query string. Nenhum chamador atual cai aqui; a armadilha sai.
    if not api_key:
        raise ValueError("call_gemini exige api_key do Gemini; a credencial de servico nunca substitui a chave.")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {"Content-Type": CONTENT_TYPE_JSON, "x-goog-api-key": api_key}
    mensagens: list[dict[str, Any]] = [{"role": "user", "parts": [{"text": user_prompt}]}]
    data: dict[str, Any]
    if GoogleGenAIAdapter.e_geracao_atual(model):
        data = GoogleGenAIAdapter.build_http(
            model,
            mensagens,
            system_instruction=system_prompt,
            require_json=response_format is not None,
        )
        if response_format:
            data.setdefault("generationConfig", {})["responseSchema"] = response_format
    else:
        legacy_data: dict[str, Any] = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": mensagens,
        }
        if response_format:
            legacy_data["generationConfig"] = {
                "responseMimeType": "application/json",
                "responseSchema": response_format,
            }
        data = legacy_data

    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        text = GoogleGenAIAdapter.extrair_texto(result)
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
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "Content-Type": CONTENT_TYPE_JSON,
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    }
    mensagens = [{"role": "user", "content": user_prompt}]
    if AnthropicAdapter.e_geracao_atual(model):
        # O adaptador decide max_tokens pelo registro, liga thinking adaptativo,
        # aplica effort e converte `betas` em header. O 4096 fixo que estava aqui
        # ignorava que a geracao 5 comporta 128k.
        data, headers_extra = AnthropicAdapter.build_http(model, mensagens, system=system_prompt)
        headers.update(headers_extra)
    else:
        data = {
            "model": model,
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": mensagens,
        }
    if response_format:
        logger.warning("[SOTA RAG] Anthropic API nativa nao suporta json_schema estrito. Passando ignorado.")
    async with session.post(url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        if AnthropicAdapter.houve_recusa(result):
            raise RuntimeError(f"Recusa da Anthropic (HTTP 200): {AnthropicAdapter.motivo_da_recusa(result)}")
        text = AnthropicAdapter.extrair_texto(result)
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
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
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


async def call_ollama(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_format: dict | None = None,
    timeout_seconds: float = 90.0,
) -> tuple[str, dict[str, Any]]:
    """Invocacao direta ao daemon Ollama (127.0.0.1:11434) para inferencia local e cloud."""
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    ollama_base = os.environ.get("OLLAMA_API_BASE", "http://127.0.0.1:11434")
    ollama_url = f"{ollama_base}/api/chat"
    clean_model = model.replace("google/", "").strip()
    try:
        from engine.gemma_server import GEMMA4_E4B, OLLAMA_MODEL_MAP, normalize_model  # noqa: PLC0415

        if clean_model in OLLAMA_MODEL_MAP:
            resolved_model = OLLAMA_MODEL_MAP[clean_model]
        elif ":" in clean_model or any(t.lower() == clean_model.lower() for t in OLLAMA_MODEL_MAP.values()):
            resolved_model = clean_model
        else:
            alias = normalize_model(clean_model)
            resolved_model = OLLAMA_MODEL_MAP.get(alias, clean_model or GEMMA4_E4B)
    except Exception as e:
        logger.debug("Falha na resolucao de modelo Ollama via gemma_server: %s", e)
        resolved_model = clean_model

    ollama_data: dict[str, Any] = {
        "model": resolved_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"num_predict": 1024},
    }
    if response_format:
        ollama_data["format"] = response_format

    headers = {"Content-Type": CONTENT_TYPE_JSON}
    ollama_key = os.environ.get("OLLAMA_API_KEY")
    if ollama_key:
        headers["Authorization"] = f"Bearer {ollama_key}"

    async with session.post(
        ollama_url,
        json=ollama_data,
        headers=headers,
        timeout=aiohttp.ClientTimeout(total=timeout_seconds, sock_connect=3.0),
    ) as response:
        if not response.ok:
            error_text = await response.text()
            raise RuntimeError(f"Ollama HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        text = result.get("message", {}).get("content", "")
        usage = {
            "prompt_tokens": result.get("prompt_eval_count", len(user_prompt) // 4),
            "completion_tokens": result.get("eval_count", len(text) // 4),
        }
        return text, usage


async def call_nous(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    api_key: str,
    response_format: dict | None = None,
    base_url: str | None = None,
) -> tuple[str, dict[str, Any]]:
    """Invoca o provedor Nous Research / Hermes Cloud via REST API."""
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    endpoint = base_url or os.environ.get("NOUS_BASE_URL", "https://inference-api.nousresearch.com/v1")
    url = f"{endpoint.rstrip('/')}/chat/completions"
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
            raise RuntimeError(f"Nous HTTP {response.status}: {response.reason} - {error_text}")
        result = await response.json()
        choices = result.get("choices", [])
        if not choices:
            raise RuntimeError("Nous API retornou resposta sem choices.")
        text = choices[0].get("message", {}).get("content", "")
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
    """Invocacao do Oraculo de Borda (Gemma 4 Local Server / Ollama) usando aiohttp com resiliencia dual."""
    from llm.laya_bridge import compor_advisory_s1  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

    system_prompt, _ = compor_advisory_s1(system_prompt, user_prompt)
    if not api_key:
        api_key = os.environ.get("API_SECRET_TOKEN") or os.environ.get("VITOI_AUTH_TOKEN")

    # 1. Tentativa Primaria: Proxy SOTA (Porta 17043)
    proxy_url = "http://127.0.0.1:17043/generate"
    headers = {"Content-Type": CONTENT_TYPE_JSON}
    if api_key:
        headers["X-Vitoi-Auth"] = api_key
    data: dict[str, Any] = {
        "prompt": user_prompt,
        "system_prompt": system_prompt,
        "max_tokens": 1024,
        "model": model,  # O Proxy SOTA julgara o roteamento se for um valor generico
    }
    if response_format:
        data["response_format"] = response_format

    try:
        async with session.post(
            proxy_url, json=data, headers=headers, timeout=aiohttp.ClientTimeout(total=60, sock_connect=3.0)
        ) as response:
            if response.ok:
                text = await response.text()
                usage = {
                    "prompt_tokens": len(user_prompt) // 4,
                    "completion_tokens": len(text) // 4,
                }
                return text, usage
            logger.debug("[LOCAL PROXY] 17043 retornou HTTP %d. Tentando fallback Ollama direto...", response.status)
    except Exception as proxy_err:
        logger.debug(
            "[LOCAL PROXY] Falha ao conectar na porta 17043: %s. Acionando fallback Ollama direto...", proxy_err
        )

    # 2. Fallback Secundario: Inferencia Direta no Daemon Ollama (Porta 11434)
    try:
        return await call_ollama(session, model, system_prompt, user_prompt, response_format=response_format)
    except Exception as e:
        # Se e4b (9.6GB) falhar (ex: VRAM/RAM insuficiente), tenta e2b ou 31b-cloud
        if "e4b" in model.lower():
            logger.warning("[OLLAMA FALLBACK] Modelo %s falhou (%s). Recorrendo a gemma4:e2b...", model, e)
            try:
                return await call_ollama(
                    session, "gemma4:e2b", system_prompt, user_prompt, response_format=response_format
                )
            except Exception:
                return await call_ollama(
                    session, "gemma4:31b-cloud", system_prompt, user_prompt, response_format=response_format
                )
        raise


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


def _resolve_cloud_zero_ram_target(model: str, model_l: str) -> tuple[str, str] | None:
    if "gpt-oss" in model_l or "gpt:oss" in model_l:
        target = "gpt-oss:120b-cloud" if "120b" in model_l else "gpt-oss:20b-cloud"
        return "ollama", target
    if ":cloud" in model_l or any(model_l.startswith(p) for p in ("glm-", "kimi-", "minimax-", "nemotron-")):
        return "ollama", model
    return None


def _resolve_local_or_ollama_target(model: str, model_l: str) -> tuple[str, str] | None:
    if "strata" in model_l or "qwen3.8" in model_l:
        return "strata", model
    if "g9v3" in model_l or "ai9stars" in model_l or "ling" in model_l:
        return "local_llama", model
    if "qwen" in model_l and not model_l.startswith("openrouter/"):
        return ("local_llama", model) if "1.5b" in model_l else ("ollama", model)
    if "gemma" in model_l:
        return ("ollama", "gemma4:31b-cloud") if "31b" in model_l else ("local_gemma", model)
    return _resolve_cloud_zero_ram_target(model, model_l)


def _resolve_nous_or_openrouter_free_target(
    model: str, model_l: str, has_nous: bool, has_openrouter: bool
) -> tuple[str, str] | None:
    if any(k in model_l for k in ("laguna", "poolside", "space-bunny", "space_bunny", "stealth")):
        if has_nous:
            target = (
                "stealth/space-bunny-alpha"
                if ("bunny" in model_l or "stealth" in model_l)
                else MODEL_POOLSIDE_LAGUNA_FREE
            )
            return "nous", target
        if has_openrouter:
            return "openrouter", MODEL_POOLSIDE_LAGUNA_FREE
    if "hermes" in model_l:
        if has_nous:
            return "nous", "nousresearch/hermes-3-llama-3.1-70b"
        if has_openrouter:
            return "openrouter", "nousresearch/hermes-3-llama-3.1-70b"
        return "ollama", model
    return None


def _resolve_openai_target(model: str, model_l: str, has_nous: bool, has_openrouter: bool) -> tuple[str, str] | None:
    if has_nous:
        if "astra" in model_l or "6" in model_l:
            return "nous", "openai/gpt-6-astra-fast"
        if "sol" in model_l or "5.6" in model_l:
            return "nous", "openai/gpt-5.5"
    if has_openrouter:
        if "sol" in model_l or "5.6" in model_l:
            return "openrouter", "openai/gpt-4o"
        if "astra" in model_l or "6" in model_l:
            return "openrouter", "openai/o1-preview"
        return "openrouter", f"openai/{model}"
    return None


def _resolve_proprietary_target(
    model: str,
    model_l: str,
    has_anthropic: bool,
    has_nous: bool,
    has_openrouter: bool,
) -> tuple[str, str] | None:
    if "gemini" in model_l:
        return "gemini", model
    if "claude" in model_l:
        if has_anthropic:
            return "anthropic", model
        if has_nous:
            return "nous", "anthropic/claude-sonnet-5.5"
        if has_openrouter:
            target = model if model.startswith("anthropic/") else f"anthropic/{model}"
            return "openrouter", target
    if any(k in model_l for k in ("gpt-", "sol", "terra", "astra", "luna", "openai")):
        return _resolve_openai_target(model, model_l, has_nous, has_openrouter)
    return None


def _resolve_model_provider_and_target(
    model: str,
    gemini_keys: list[str],
    anthropic_keys: list[str],
    openrouter_keys: list[str],
    nous_keys: list[str] | None = None,
) -> tuple[str, str]:
    """Mapeia deterministicamente o modelo solicitado para seu provedor e nome de destino."""
    model_l = model.lower()
    has_nous = bool(nous_keys)
    has_openrouter = bool(openrouter_keys)
    has_anthropic = bool(anthropic_keys)

    resolved = _resolve_local_or_ollama_target(model, model_l)
    if resolved:
        return resolved

    resolved = _resolve_nous_or_openrouter_free_target(model, model_l, has_nous, has_openrouter)
    if resolved:
        return resolved

    resolved = _resolve_proprietary_target(model, model_l, has_anthropic, has_nous, has_openrouter)
    if resolved:
        return resolved

    if "/" in model or any(k in model_l for k in ("deepseek", "llama")):
        if has_nous:
            return "nous", model
        if has_openrouter:
            return "openrouter", model

    if has_nous:
        return "nous", MODEL_POOLSIDE_LAGUNA_FREE
    if has_openrouter:
        return "openrouter", model
    if gemini_keys:
        return "gemini", MODEL_GEMINI_35_FLASH_LITE

    return "unknown", model


def _try_dispatch_strata(target_model: str, prompt: str) -> str | None:
    try:
        from llm.strata_client import LocalStrataClient  # noqa: PLC0415

        strata_client = LocalStrataClient()
        if strata_client.is_healthy():
            res = strata_client.complete(prompt)
            if res:
                return res
    except Exception as e:
        logger.debug("Falha na chamada ao Strata Local (%s): %s. Recorrendo a fallback...", target_model, e)
    return None


def _resolve_local_llama_port(model_lower: str) -> int:
    from llm.local_llama_client import (  # noqa: PLC0415
        DEFAULT_G9_PORT,
        DEFAULT_LING_PORT,
        DEFAULT_QWEN_PORT,
    )

    if "ling" in model_lower:
        return DEFAULT_LING_PORT
    if "qwen" in model_lower:
        return DEFAULT_QWEN_PORT
    return DEFAULT_G9_PORT


def _try_dispatch_local_llama(target_model: str, prompt: str) -> str | None:
    try:
        from llm.local_llama_client import LocalLlamaClient  # noqa: PLC0415

        target_port = _resolve_local_llama_port(target_model.lower())
        llama_client = LocalLlamaClient(port=target_port)
        if llama_client.is_healthy():
            res = llama_client.complete(prompt)
            if res:
                return res
    except Exception as e:
        logger.debug("Falha na chamada ao LocalLlama (%s): %s", target_model, e)
    return None


def _dispatch_local_engine(
    provider: str, target_model: str, system_prompt: str, user_prompt: str
) -> tuple[str | None, str]:
    """Tenta Strata ou LocalLlama. Retorna (resultado, proximo_provedor)."""
    prompt = f"{system_prompt}\n\n{user_prompt}"
    if provider == "strata":
        res = _try_dispatch_strata(target_model, prompt)
        if res:
            return res, provider
        provider = "ollama"

    if provider == "local_llama":
        res = _try_dispatch_local_llama(target_model, prompt)
        if res:
            return res, provider
        provider = "ollama"

    return None, provider


async def _try_gemma_e4b_fallback(
    session: aiohttp.ClientSession, system_prompt: str, user_prompt: str, response_format: dict | None
) -> str | None:
    try:
        res, _ = await call_ollama(session, "gemma4:e2b", system_prompt, user_prompt, response_format=response_format)
        return res
    except Exception as err:
        logger.debug("Fallback de contingencia gemma4:e2b falhou: %s", err)
        return None


async def _dispatch_local_gemma(
    session: aiohttp.ClientSession,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    response_format: dict | None,
    gemini_keys: list[str],
    openrouter_keys: list[str],
) -> tuple[str | None, str, str]:
    try:
        res, _ = await call_gemma_local(
            session, target_model, system_prompt, user_prompt, response_format=response_format
        )
        return res, "local_gemma", target_model
    except Exception as e:
        logger.warning("Falha no Motor Gemma Local: %s. Tentando roteamento alternativo...", e)
        if "e4b" in target_model:
            res = await _try_gemma_e4b_fallback(session, system_prompt, user_prompt, response_format)
            if res:
                return res, "local_gemma", target_model
        if gemini_keys:
            return None, "gemini", MODEL_GEMINI_35_FLASH_LITE
        if openrouter_keys:
            return None, "openrouter", MODEL_OPENROUTER_GEMINI_35_FLASH_LITE
        return None, "unknown", MODEL_OPENROUTER_GEMINI_35_FLASH_LITE


async def _dispatch_ollama(
    session: aiohttp.ClientSession,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    response_format: dict | None,
    gemini_keys: list[str],
    openrouter_keys: list[str],
) -> tuple[str | None, str, str]:
    try:
        res, _ = await call_ollama(session, target_model, system_prompt, user_prompt, response_format=response_format)
        if res:
            return res, "ollama", target_model
    except Exception as e:
        logger.warning("Falha no Daemon Ollama para '%s': %s", target_model, e)
        if openrouter_keys:
            target = "qwen/qwen-2.5-coder-32b-instruct" if "qwen" in target_model.lower() else target_model
            return None, "openrouter", target
        if gemini_keys:
            return None, "gemini", MODEL_GEMINI_35_FLASH_LITE
    return None, "ollama", target_model


async def _dispatch_gemini_provider(
    session: aiohttp.ClientSession,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    gemini_keys: list[str],
    task: Task,
    manager: QueueManager,
    response_format: dict | None,
) -> str | None:
    res = await _try_provider(
        session,
        "gemini",
        call_gemini,
        target_model,
        system_prompt,
        user_prompt,
        gemini_keys,
        task,
        manager,
        max_retries=2,
        usage_keys=("promptTokenCount", "candidatesTokenCount"),
        response_format=response_format,
    )
    if res:
        return res
    for alt_model in ("gemini-3.8-flash", "gemini-3.5-flash-lite"):
        if alt_model != target_model:
            logger.info("[GEMINI SOTA] Tentando alternativa na familia Gemini: '%s'", alt_model)
            res = await _try_provider(
                session,
                "gemini",
                call_gemini,
                alt_model,
                system_prompt,
                user_prompt,
                gemini_keys,
                task,
                manager,
                max_retries=1,
                usage_keys=("promptTokenCount", "candidatesTokenCount"),
                response_format=response_format,
            )
            if res:
                return res
    return None


async def _dispatch_anthropic_provider(
    session: aiohttp.ClientSession,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    anthropic_keys: list[str],
    task: Task,
    manager: QueueManager,
    response_format: dict | None,
) -> str | None:
    return await _try_provider(
        session,
        "anthropic",
        call_anthropic,
        target_model,
        system_prompt,
        user_prompt,
        anthropic_keys,
        task,
        manager,
        max_retries=2,
        usage_keys=("input_tokens", "output_tokens"),
        response_format=response_format,
    )


async def _dispatch_nous_or_openrouter(
    session: aiohttp.ClientSession,
    provider: str,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    nous_keys: list[str] | None,
    openrouter_keys: list[str],
    gemini_keys: list[str],
    task: Task,
    manager: QueueManager,
    response_format: dict | None,
) -> tuple[str | None, str, str]:
    if provider == "nous" and nous_keys:
        res = await _try_provider(
            session,
            "nous",
            call_nous,
            target_model,
            system_prompt,
            user_prompt,
            nous_keys,
            task,
            manager,
            max_retries=2,
            usage_keys=("prompt_tokens", "completion_tokens"),
            response_format=response_format,
        )
        if res:
            return res, provider, target_model
        if openrouter_keys:
            provider = "openrouter"
        elif gemini_keys:
            provider = "gemini"
            target_model = MODEL_GEMINI_35_FLASH_LITE

    if provider == "openrouter" and openrouter_keys:
        res = await _try_provider(
            session,
            "openrouter",
            call_openrouter,
            target_model,
            system_prompt,
            user_prompt,
            openrouter_keys,
            task,
            manager,
            max_retries=2,
            usage_keys=("prompt_tokens", "completion_tokens"),
            response_format=response_format,
        )
        if res:
            return res, provider, target_model

    return None, provider, target_model


async def _dispatch_gemma_contingency(
    session: aiohttp.ClientSession,
    model: str,
    system_prompt: str,
    user_prompt: str,
    gemini_keys: list[str],
    task: Task,
    manager: QueueManager,
    response_format: dict | None,
) -> str | None:
    if "gemma" not in model.lower() or not gemini_keys:
        return None
    logger.info("[ROTEAMENTO SOTA] Triagem externa de contingencia via gemini-3.5-flash-lite para '%s'", model)
    return await _try_provider(
        session,
        "gemini",
        call_gemini,
        MODEL_GEMINI_35_FLASH_LITE,
        system_prompt,
        user_prompt,
        gemini_keys,
        task,
        manager,
        max_retries=2,
        usage_keys=("promptTokenCount", "candidatesTokenCount"),
        response_format=response_format,
    )


async def _dispatch_local_or_ollama_pipeline(
    session: aiohttp.ClientSession,
    provider: str,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    gemini_keys: list[str],
    openrouter_keys: list[str],
    response_format: dict | None,
) -> tuple[str | None, str, str]:
    res, provider = _dispatch_local_engine(provider, target_model, system_prompt, user_prompt)
    if res:
        return res, provider, target_model

    if provider == "local_gemma":
        res, provider, target_model = await _dispatch_local_gemma(
            session, target_model, system_prompt, user_prompt, response_format, gemini_keys, openrouter_keys
        )
        if res:
            return res, provider, target_model

    if provider == "ollama":
        res, provider, target_model = await _dispatch_ollama(
            session, target_model, system_prompt, user_prompt, response_format, gemini_keys, openrouter_keys
        )
        if res:
            return res, provider, target_model

    return None, provider, target_model


async def _execute_provider_pipeline(
    session: aiohttp.ClientSession,
    model: str,
    provider: str,
    target_model: str,
    system_prompt: str,
    user_prompt: str,
    gemini_keys: list[str],
    anthropic_keys: list[str],
    openrouter_keys: list[str],
    nous_keys: list[str] | None,
    task: Task,
    manager: QueueManager,
    response_format: dict | None,
) -> str | None:
    res, provider, target_model = await _dispatch_local_or_ollama_pipeline(
        session, provider, target_model, system_prompt, user_prompt, gemini_keys, openrouter_keys, response_format
    )
    if res:
        return res

    if provider == "gemini" and gemini_keys:
        res = await _dispatch_gemini_provider(
            session, target_model, system_prompt, user_prompt, gemini_keys, task, manager, response_format
        )
        if res:
            return res

    if provider == "anthropic" and anthropic_keys:
        res = await _dispatch_anthropic_provider(
            session, target_model, system_prompt, user_prompt, anthropic_keys, task, manager, response_format
        )
        if res:
            return res

    res, provider, target_model = await _dispatch_nous_or_openrouter(
        session,
        provider,
        target_model,
        system_prompt,
        user_prompt,
        nous_keys,
        openrouter_keys,
        gemini_keys,
        task,
        manager,
        response_format,
    )
    if res:
        return res

    return await _dispatch_gemma_contingency(
        session, model, system_prompt, user_prompt, gemini_keys, task, manager, response_format
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
    nous_keys: list[str] | None = None,
    response_format: dict | None = None,
) -> str | None:
    provider, target_model = _resolve_model_provider_and_target(
        model, gemini_keys, anthropic_keys, openrouter_keys, nous_keys=nous_keys
    )

    async with aiohttp.ClientSession() as session:
        res = await _execute_provider_pipeline(
            session,
            model,
            provider,
            target_model,
            system_prompt,
            user_prompt,
            gemini_keys,
            anthropic_keys,
            openrouter_keys,
            nous_keys,
            task,
            manager,
            response_format,
        )
        if res:
            return res

    logger.warning("Modelo '%s' (resolvido como '%s' via '%s') nao pode ser executado.", model, target_model, provider)
    return None


def _extract_gemini_keys(all_env_vars: dict[str, str]) -> list[str]:
    return list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v
            and len(v) >= 20
            and (
                any(
                    p in k.upper()
                    for p in ("GEMINI_API_KEY", "GEMINI_FLASH_KEY", "GEMINI_KEY", "GOOGLE_API_KEY", "GOOGLE_KEY")
                )
                or (k.upper().startswith("GEMINI") and "KEY" in k.upper())
            )
            and "PROJECT" not in k.upper()
            and "CLI" not in k.upper()
            and "URL" not in k.upper()
        )
    )


def _extract_anthropic_keys(all_env_vars: dict[str, str]) -> list[str]:
    return list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v and len(v) >= 20 and k.upper().startswith("ANTHROPIC") and "URL" not in k.upper()
        )
    )


def _extract_openrouter_keys(all_env_vars: dict[str, str]) -> list[str]:
    keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v
            and len(v) >= 20
            and (k.upper().startswith("OPENROUTER") or k.upper().startswith("OPEN_ROUTER"))
            and "URL" not in k.upper()
            and "BASE" not in k.upper()
        )
    )
    if not keys:
        try:
            from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

            pool = openrouter_pool_manager
            for t in (1, 2, 3, 4):
                for k in pool.get_pool_keys(t):
                    if k not in keys:
                        keys.append(k)
        except Exception as err:
            logger.debug("Falha ao consultar pool openrouter: %s", err)
    return keys


def _extract_nous_keys(all_env_vars: dict[str, str]) -> list[str]:
    keys = list(
        dict.fromkeys(
            v
            for k, v in all_env_vars.items()
            if v
            and len(v) >= 15
            and any(p in k.upper() for p in ("NOUS_API_KEY", "HERMES_API_KEY", "HERMES_AGENT_KEY", "NOUS_KEY"))
            and "URL" not in k.upper()
            and "BASE" not in k.upper()
        )
    )
    if not keys:
        try:
            local_app = os.environ.get("LOCALAPPDATA", "")
            if local_app:
                auth_p = Path(local_app) / "hermes" / "auth.json"
                if auth_p.exists():
                    import json  # noqa: PLC0415

                    data = json.loads(auth_p.read_text("utf-8", errors="replace"))
                    n_tok = data.get("providers", {}).get("nous", {}).get("agent_key") or data.get("providers", {}).get(
                        "nous", {}
                    ).get("access_token")
                    if n_tok:
                        keys.append(str(n_tok).strip())
        except Exception as err:
            logger.debug("Falha ao carregar credencial hermes: %s", err)
    return keys


def _extract_provider_keys(
    all_env_vars: dict[str, str],
) -> tuple[list[str], list[str], list[str], list[str]]:
    return (
        _extract_gemini_keys(all_env_vars),
        _extract_anthropic_keys(all_env_vars),
        _extract_openrouter_keys(all_env_vars),
        _extract_nous_keys(all_env_vars),
    )


def _build_models_to_try(
    task: Task, agent_type: str, openrouter_keys: list[str], nous_keys: list[str] | None = None
) -> list[str]:
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

    if nous_keys:
        candidates.extend(m for m in [MODEL_POOLSIDE_LAGUNA_FREE, "stealth/space-bunny-alpha"] if m not in candidates)

    if openrouter_keys:
        extras = (
            ["anthropic/claude-opus-5.5", "anthropic/claude-sonnet-5.5", MODEL_POOLSIDE_LAGUNA_FREE]
            if agent_type == "deep_thinking"
            else [
                MODEL_OPENROUTER_GEMINI_35_FLASH_LITE,
                "google/gemini-3.8-flash",
                "poolside/laguna-xs-2.1:free",
                MODEL_POOLSIDE_LAGUNA_FREE,
            ]
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
    gemini_keys, anthropic_keys, openrouter_keys, nous_keys = _extract_provider_keys(all_env_vars)

    models_to_try = _build_models_to_try(task, agent_type, openrouter_keys, nous_keys=nous_keys)

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
            nous_keys=nous_keys,
            response_format=response_format,
        )
        if response:
            return response

    logger.warning("[%s] Modo Simulacao Ativado.", task.agent)
    return _generate_fallback_response(task.agent, models_to_try)
