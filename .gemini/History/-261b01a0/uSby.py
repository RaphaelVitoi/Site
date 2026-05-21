import asyncio
import aiohttp
import time
import logging
import random
import re
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Tuple

from database.queue_manager import QueueManager
from core.schemas import Task
from utils.text import enforce_pure_ascii
from llm.budget import (
    _key_identifier, _key_fingerprint, _is_key_blocked, _block_key,
    _is_gemini_model_key_blocked, _block_gemini_model_key,
    _is_semantic_gemini_error, _route_identifier, _is_route_blocked,
    _register_route_success, _register_route_failure, _rank_keys_by_health,
    ROUTE_FAILURE_THRESHOLD
)
from llm.gemini import call_gemini
from llm.anthropic import call_anthropic
from llm.openrouter import call_openrouter


import core.runtime as _te

# =========================================================================
# SOTA REFACTOR: Padrão Strategy para mitigar colapso de entropia.
# Desacopla a chamada das APIs da lógica de resiliência e circuit break.
# Essa abstração permite que o Claude/Gemini extendam novos modelos
# futuramente sem aumentar a Complexidade Ciclomática (V(G)).
# =========================================================================

class LLMProviderStrategy(ABC):
    @property
    @abstractmethod
    def name(self) -> str: pass

    @property
    @abstractmethod
    def token_keys(self) -> Tuple[str, str]: pass

    @abstractmethod
    async def call(self, session, model, system_prompt, user_prompt, key, timeout, require_json, **kwargs) -> Tuple[str, dict]: pass

    async def check_quarantine(self, model: str, key: str) -> bool:
        """Permite que provedores implementem suas próprias regras de quarentena semântica de chaves."""
        return False

    async def handle_semantic_error(self, e: Exception, model: str, key: str, manager: QueueManager, task: Task) -> None:
        """Permite que o provedor bloqueie a chave com base em erros específicos (ex: HTTP 400)."""
        pass

class GeminiStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str: return "Gemini"

    @property
    def token_keys(self) -> Tuple[str, str]: return ('promptTokenCount', 'candidatesTokenCount')

    async def call(self, session, model, system_prompt, user_prompt, key, timeout, require_json, **kwargs):
        return await call_gemini(session, model, system_prompt, user_prompt, key, timeout, require_json=require_json, **kwargs)

    async def check_quarantine(self, model: str, key: str) -> bool:
        return await _is_gemini_model_key_blocked(model, key)

    async def handle_semantic_error(self, e: Exception, model: str, key: str, manager: QueueManager, task: Task) -> None:
        error_msg = str(e).lower()

        # SOTA: Bypass de Quarentena para Limite de RPM
        if "429" in error_msg:
            try:
                match = re.search(r"retry_after=(\d+)", error_msg)
                delay = int(match.group(1)) if match else 0
            except Exception:
                delay = 0

            is_quota_exhausted = any(q in error_msg for q in ["quota", "daily", "exhausted"])
            if delay <= 65 and not is_quota_exhausted:
                # SOTA: Registra o evento de bypass para analise de eficacia
                key_hash = _key_fingerprint("gemini", key)
                await manager.record_key_usage_metric(
                    provider="gemini", key_hash=key_hash, status="bypassed_quarantine", latency_ms=0,
                    error_class=type(e).__name__, error_detail=f"429 RPM limit (delay: {delay})",
                    model=model, agent=task.agent, task_id=task.id
                )
                return # Retorna prematuramente; nao bloqueia a chave na quarentena de 15 minutos.

        if _is_semantic_gemini_error(e):
            await _block_gemini_model_key(model, key)

class AnthropicStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str: return "Anthropic"

    @property
    def token_keys(self) -> Tuple[str, str]: return ('input_tokens', 'output_tokens')

    async def call(self, session, model, system_prompt, user_prompt, key, timeout, require_json, **kwargs):
        return await call_anthropic(session, model, system_prompt, user_prompt, key, timeout, require_json=require_json, **kwargs)

class OpenRouterStrategy(LLMProviderStrategy):
    @property
    def name(self) -> str: return "OpenRouter"

    @property
    def token_keys(self) -> Tuple[str, str]: return ('prompt_tokens', 'completion_tokens')

    async def call(self, session, model, system_prompt, user_prompt, key, timeout, require_json, **kwargs):
        return await call_openrouter(session, model, system_prompt, user_prompt, key, timeout, require_json=require_json, **kwargs)

def _get_provider_strategy(provider: str) -> Optional[LLMProviderStrategy]:
    strategies = {
        "gemini": GeminiStrategy(),
        "anthropic": AnthropicStrategy(),
        "openrouter": OpenRouterStrategy()
    }
    return strategies.get(provider)


async def _execute_single_key(
    strategy: LLMProviderStrategy,
    provider: str,
    session: aiohttp.ClientSession,
    provider_key: str,
    key_hash: str,
    key: str,
    key_rank: int,
    route_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    task: Task,
    manager: QueueManager,
    max_retries: int,
    timeout: Optional[aiohttp.ClientTimeout],
    require_json: bool,
    _c: Any,
    **kwargs
) -> Any:
    """Motor de execução isolado, responsável puramente pela retentativa e parser de exceções HTTP."""
    general_retries_left = max(0, int(max_retries))
    rate_limit_retries_left = 3  # Orçamento dedicado para absorver rajadas de 429
    attempt = 0

    while True: # O motor agora é um loop persistente que só quebra ao esgotar retries.
        attempt += 1
        start = time.monotonic()
        try:
            log_msg = f"Acionando cognicao via {strategy.name} ({model}, Chave {key_rank})..."
            if attempt > 1:
                log_msg = f"Retentativa {attempt} para {model}..."
            logging.info(f"[[{_c(task.agent)}]{task.agent}[/]] {log_msg}")

            response_text, usage = await strategy.call(session, model, system_prompt, user_prompt, key, timeout, require_json, **kwargs)
            if response_text is None:
                raise RuntimeError(f"{strategy.name} retornou resposta vazia.")

            # SOTA: Purificacao Absoluta do Output (Friccao Zero de Encoding)
            response_text = enforce_pure_ascii(response_text)
            await manager.update_llm_cache(model, user_prompt, response_text)

            p_key, c_key = strategy.token_keys
            p_tokens = usage.get(p_key, 0)
            c_tokens = usage.get(c_key, 0)
            await manager.record_api_usage(task.id, task.agent, model, provider, p_tokens, c_tokens)

            latency_ms = int((time.monotonic() - start) * 1000)
            await manager.record_key_usage_metric(
                provider=provider, key_hash=key_hash, status="success", latency_ms=latency_ms,
                model=model, agent=task.agent, task_id=task.id, total_tokens=p_tokens + c_tokens
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

        except (asyncio.TimeoutError, TimeoutError):
            latency_ms = int((time.monotonic() - start) * 1000)
            await manager.record_key_usage_metric(
                provider=provider, key_hash=key_hash, status="timeout", latency_ms=latency_ms,
                error_class="TimeoutError", error_detail=f"{strategy.name} timeout",
                model=model, agent=task.agent, task_id=task.id
            )
            general_retries_left -= 1
            if general_retries_left < 0:
                logging.error(f"[[{_c(task.agent)}]{task.agent}[/]] Timeout persistente em {strategy.name}. Esgotando retries para esta chave.")
                await _register_route_failure(route_key)
                break # Quebra o loop, vai pular a chave
            logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] Timeout em {strategy.name}. Retentando ({general_retries_left+1} retries restantes)...")
            await asyncio.sleep(2.0)
            continue

        except Exception as e:
            error_msg = str(e)
            latency_ms = int((time.monotonic() - start) * 1000)

            # HTTP 5xx sao transientes: retry na mesma chave
            is_5xx = isinstance(e, aiohttp.ClientResponseError) and e.status >= 500
            if is_5xx:
                general_retries_left -= 1
                if general_retries_left < 0:
                    logging.error(f"[[{_c(task.agent)}]{task.agent}[/]] Erro 5xx persistente em {strategy.name}. Esgotando retries para esta chave.")
                    await _register_route_failure(route_key)
                    break
                logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] HTTP {e.status} transiente em {strategy.name}. Retentando ({general_retries_left+1} retries restantes)...")
                await asyncio.sleep(2.0)
                continue

            # 429: sleep e retry na mesma chave, ou rotacionar imediatamente
            if "429" in error_msg:
                try:
                    # SOTA: Extrai apenas os digitos
                    match = re.search(r"retry_after=(\d+)", error_msg)
                    delay = int(match.group(1)) if match else 0
                except Exception:
                    delay = 0

                # SOTA: Se a API nao informar o delay (delay = 0), nao assumimos esgotamento
                # permanente. Assumimos um rate limit padrao do Google (15s) para salvar a chave.
                if delay == 0:
                    delay = 15

                if delay <= 65 and rate_limit_retries_left > 0:
                    rate_limit_retries_left -= 1
                    # SOTA: Injeta Jitter para evitar o Efeito Manada
                    jitter = random.uniform(1.0, 3.0)
                    sleep_time = float(delay) + jitter
                    logging.info(f"[[{_c(task.agent)}]{task.agent}[/]] 429 rate-limit em {strategy.name}. Aguardando {sleep_time:.2f}s... ({rate_limit_retries_left} retries de 429 restantes)")
                    await asyncio.sleep(sleep_time)
                    continue
                logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] 429 quota esgotada em {strategy.name} ({model}, Chave {key_rank}). Rotacionando...")

                # SOTA: Penalidade Inteligente. Se for limite de minuto (<= 65s), curamos a cota do projeto.
                if delay <= 65:
                    await asyncio.sleep(float(delay) + random.uniform(1.0, 3.0))
                else:
                    await asyncio.sleep(random.uniform(2.0, 4.0))

                break # Quebra o loop, vai pular a chave

            general_retries_left -= 1
            if general_retries_left >= 0:
                logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] Erro geral em {strategy.name} ({type(e).__name__}). Retentando... ({general_retries_left+1} retries restantes)")
                await asyncio.sleep(1.0)
                continue

            logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] Falha na chave {strategy.name} ({model}): {error_msg}.")
            await manager.record_key_usage_metric(
                provider=provider, key_hash=key_hash, status="error", latency_ms=latency_ms,
                error_class=type(e).__name__, error_detail=error_msg,
                model=model, agent=task.agent, task_id=task.id
            )
            await _register_route_failure(route_key)

            # Circuit Breaker hiper-reativo
            if "connection closed" in error_msg.lower() or "cannot connect" in error_msg.lower():
                extra = max(0, ROUTE_FAILURE_THRESHOLD - 1)
                for _ in range(extra):
                    await _register_route_failure(route_key)

            if isinstance(e, aiohttp.ClientResponseError) and e.status in (401, 402, 403):
                await _block_key(provider_key)

            # Delegação Semântica: O Strategy do provedor decide se ele mesmo aplica block específico
            await strategy.handle_semantic_error(e, model, key, manager, task)

            break # Quebra o loop, vai pular a chave

    if await _is_route_blocked(route_key):
        logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] Rota {provider}:{model} entrou em cooldown apos falha. Avancando para proximo modelo.")
        return "ROUTE_BLOCKED"

    return "SKIP_KEY"

async def _try_provider(
    session: aiohttp.ClientSession,
    provider: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    keys: List[str],
    task: Task,
    manager: QueueManager,
    max_retries: int,
    timeout: Optional[aiohttp.ClientTimeout] = None,
    require_json: bool = False,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """Orquestrador de Provedor SOTA. Delega o comportamento para o padrao Strategy."""
    if not keys:
        return None

    _c = _te._c
    strategy = _get_provider_strategy(provider)
    if not strategy:
        logging.error(f"Provedor desconhecido: {provider}")
        return None

    route_key = _route_identifier(provider, model)
    ranked_keys = await _rank_keys_by_health(provider, keys, manager)

    for i, key in enumerate(ranked_keys):
        if await _is_route_blocked(route_key):
            logging.warning(f"[{task.agent}] Rota {strategy.name}:{model} entrou em cooldown durante a rotacao de chaves. Interrompendo tentativas desta rota.")
            break

        if await strategy.check_quarantine(model, key):
            logging.warning(f"[{task.agent}] Chave {strategy.name} em quarentena semantica para modelo {model} (Chave {i+1}). Pulando.")
            continue

        provider_key = _key_identifier(provider, key)
        key_hash = _key_fingerprint(provider, key)

        if await _is_key_blocked(provider_key):
            logging.warning(f"[{task.agent}] Chave {strategy.name} bloqueada temporariamente (Chave {i+1}). Pulando.")
            continue

        result = await _execute_single_key(
            strategy=strategy,
            provider=provider,
            session=session,
            provider_key=provider_key,
            key_hash=key_hash,
            key=key,
            key_rank=i + 1,
            route_key=route_key,
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            task=task,
            manager=manager,
            max_retries=max_retries,
            timeout=timeout,
            require_json=require_json,
            _c=_c,
            **kwargs
        )

        if result == "SKIP_KEY":
            continue
        if result == "ROUTE_BLOCKED":
            return None
        return result

    return None
