"""core/sota_context_engine.py
SOTA Context Caching, Semantic Bucketing, Structured Output & Lifecycle Hooks Engine.
Protocolo Chico SOTA v8.0 GOLD  Governanca: Raphael Vitoi.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


# ==============================================================================
# 1. SEMANTIC BUCKETING & CONTEXT CACHING
# ==============================================================================


class CacheTier(str, Enum):
    VRAM_HOT = "VRAM_HOT"  # Memoria GPU bloqueada / Zero-Latency
    CACHE_EPHEMERAL = "CACHE_LRU"  # RAM recuperavel / Evictavel sob pressao
    RAM_COLD = "RAM_COLD"  # Disco / SQLite / Cold Storage


@dataclass
class ContextBucket:
    """Bucket semantico de contexto particionado."""

    bucket_id: str
    tier: CacheTier
    created_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)
    ttl_seconds: int = 3600
    token_count: int = 0
    payload: Dict[str, Any] = field(default_factory=dict)
    hash_signature: str = ""
    # Medido uma vez, na criacao. `token_count` e uma estimativa (chars // 4) e
    # serve para orcamento de prompt; para teto de MEMORIA o que vale e byte.
    bytes_payload: int = 0

    def is_expired(self) -> bool:
        return (time.time() - self.last_accessed) > self.ttl_seconds

    def touch(self) -> None:
        self.last_accessed = time.time()


class SotaContextCacheEngine:
    """Gerenciador de Context Caching e Bucketing Semantico SOTA."""

    def __init__(self, max_cache_size_mb: int = 4096):
        self.max_cache_size_mb = max_cache_size_mb
        self.buckets: Dict[str, ContextBucket] = {}

    def compute_signature(self, text: str) -> str:
        """Calcula a assinatura criptografica SHA-256 para prefix-caching."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_or_create_bucket(
        self,
        bucket_id: str,
        content: str,
        tier: CacheTier = CacheTier.CACHE_EPHEMERAL,
        ttl_seconds: int = 3600,
    ) -> ContextBucket:
        sig = self.compute_signature(content)
        if bucket_id in self.buckets:
            bucket = self.buckets[bucket_id]
            if not bucket.is_expired() and bucket.hash_signature == sig:
                bucket.touch()
                return bucket

        # Criar novo bucket
        new_bucket = ContextBucket(
            bucket_id=bucket_id,
            tier=tier,
            ttl_seconds=ttl_seconds,
            token_count=len(content) // 4,
            payload={"content": content},
            hash_signature=sig,
            bytes_payload=len(content.encode("utf-8")),
        )
        self.buckets[bucket_id] = new_bucket
        self._enforce_lru_eviction()
        return new_bucket

    def tamanho_mb(self) -> float:
        """Quanto o cache ocupa, em MB. **Medido, nao estimado.**

        Existia `max_cache_size_mb = 4096` desde sempre, atribuido no `__init__`
        e **nunca lido**: a eviccao olhava `len(self.buckets) > 100`. O teto que
        nomeava megabytes era medido em quantidade de baldes, e 100 baldes podem
        ser 1 MB ou 400 MB dependendo do que cabe neles. Sem este metodo nao ha
        como um guard de memoria vigiar esta camada.
        """
        return sum(b.bytes_payload for b in self.buckets.values()) / (1024 * 1024)

    def _enforce_lru_eviction(self) -> None:
        """Eviccao LRU automatica para impedir estouro de memoria RAM/Cache."""
        expired_keys = [k for k, v in self.buckets.items() if v.is_expired()]
        for k in expired_keys:
            del self.buckets[k]

        # O TETO EM MB passa a valer. Antes so a contagem de baldes limitava, e
        # `max_cache_size_mb` era decoracao. Evicta o efemero menos usado ate
        # voltar abaixo do teto -- VRAM_HOT e RAM_COLD nao entram: a primeira e
        # declarada como travada, a segunda ja e armazenamento frio.
        if self.tamanho_mb() > self.max_cache_size_mb:
            efemeros = sorted(
                ((k, v) for k, v in self.buckets.items() if v.tier == CacheTier.CACHE_EPHEMERAL),
                key=lambda kv: kv[1].last_accessed,
            )
            for k, _ in efemeros:
                if self.tamanho_mb() <= self.max_cache_size_mb:
                    break
                del self.buckets[k]

        # Se ultrapassar contagem maxima, remove os mais antigos da camada efemera
        if len(self.buckets) > 100:
            sorted_buckets = sorted(
                [(k, v) for k, v in self.buckets.items() if v.tier == CacheTier.CACHE_EPHEMERAL],
                key=lambda x: x[1].last_accessed,
            )
            for k, _ in sorted_buckets[:20]:
                del self.buckets[k]


# ==============================================================================
# 2. STRUCTURED OUTPUT & JSON SCHEMA CONSTRAINTS
# ==============================================================================


class StructuredOutputEngine:
    """Validador e Forcador de Esquemas JSON Estritos / Pydantic."""

    @staticmethod
    def generate_json_schema(model_cls: Type[T]) -> dict:
        """Exporta o JSON Schema estrito do Pydantic para injection em LLMs."""
        return model_cls.model_json_schema()

    @staticmethod
    def enforce_pydantic(payload_str: str, model_cls: Type[T]) -> T:
        """Parseia e valida deterministicamente a saida da IA contra o contrato."""
        try:
            # Limpeza de blocos de markdown caso o modelo tenha emitido ```json
            cleaned = payload_str.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            data = json.loads(cleaned)
            return model_cls.model_validate(data)
        except Exception as e:
            logger.error("Erro na validacao de Structured Output (%s): %s", model_cls.__name__, e)
            raise ValueError(f"Violacao de Structured Output ({model_cls.__name__}): {e}") from e


class PromptStructureOptimizer:
    """Organiza os prompts no formato deterministico estatico-primeiro para Radix Prefix Caching."""

    @staticmethod
    def build_cached_prompt(
        system_prompt: str,
        tool_definitions: str = "",
        few_shots: str = "",
        dag_history: str = "",
        task_input: str = "",
    ) -> str:
        """
        [BLOCO ESTATICO IMUTAVEL - CACHEADO]
        |-- System Prompt do Agente
        |-- Tool Definitions & JSON Schemas
        +-- Few-Shot Examples
        [BLOCO DINAMICO - PROCESSADO ON-THE-FLY]
        |-- Historico da DAG / Contexto Imediato
        +-- Input Atual da Tarefa
        """
        static_parts = [system_prompt.strip()]
        if tool_definitions:
            static_parts.append(f"[TOOL DEFINITIONS & JSON SCHEMAS]\n{tool_definitions.strip()}")
        if few_shots:
            static_parts.append(f"[FEW-SHOT EXAMPLES]\n{few_shots.strip()}")

        static_block = "\n\n".join(static_parts)

        dynamic_parts = []
        if dag_history:
            dynamic_parts.append(f"[DAG HISTORY & CONTEXT]\n{dag_history.strip()}")
        if task_input:
            dynamic_parts.append(f"[TASK INPUT]\n{task_input.strip()}")

        dynamic_block = "\n\n".join(dynamic_parts)

        return f"{static_block}\n\n=== DYNAMIC TASK CONTEXT ===\n\n{dynamic_block}".strip()


# ==============================================================================
# 3. UNIFIED LIFECYCLE HOOKS (INSPECT, DECIDE, TRANSFORM)
# ==============================================================================


class HookType(str, Enum):
    INSPECT = "INSPECT"  # Nao-bloqueante: telemetria, profiling, token audit
    DECIDE = "DECIDE"  # Bloqueante: Target Lock, seguranca, permissoes
    TRANSFORM = "TRANSFORM"  # Mutacao: normalizacao de schemas, sanitizacao ASCII


@dataclass
class HookContext:
    hook_type: HookType
    agent_name: str
    payload: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)
    approved: bool = True
    rejection_reason: Optional[str] = None


class SotaHookBus:
    """Barramento de Hooks e Interceptores Agenticos SOTA."""

    def __init__(self):
        self._inspect_hooks: List[Callable[[HookContext], None]] = []
        self._decide_hooks: List[Callable[[HookContext], bool]] = []
        self._transform_hooks: List[Callable[[HookContext], Dict[str, Any]]] = []

    def register_inspect(self, fn: Callable[[HookContext], None]) -> None:
        self._inspect_hooks.append(fn)

    def register_decide(self, fn: Callable[[HookContext], bool]) -> None:
        self._decide_hooks.append(fn)

    def register_transform(self, fn: Callable[[HookContext], Dict[str, Any]]) -> None:
        self._transform_hooks.append(fn)

    def trigger_inspect(self, ctx: HookContext) -> None:
        for hook in self._inspect_hooks:
            try:
                hook(ctx)
            except Exception as e:
                logger.warning("[HOOK INSPECT] Falha silenciosa: %s", e)

    def trigger_decide(self, ctx: HookContext) -> bool:
        for hook in self._decide_hooks:
            try:
                allowed = hook(ctx)
                if not allowed:
                    ctx.approved = False
                    return False
            except Exception as e:
                logger.error("[HOOK DECIDE] Bloqueio por falha de hook: %s", e)
                ctx.approved = False
                ctx.rejection_reason = str(e)
                return False
        return True

    def trigger_transform(self, ctx: HookContext) -> Dict[str, Any]:
        data = ctx.payload
        for hook in self._transform_hooks:
            try:
                data = hook(ctx)
                ctx.payload = data
            except Exception as e:
                logger.warning("[HOOK TRANSFORM] Falha na mutacao: %s", e)
        return data


# Instancia Global Singleton do Barramento e Cache
context_cache = SotaContextCacheEngine()
hook_bus = SotaHookBus()
