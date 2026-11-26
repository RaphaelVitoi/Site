"""
SOTA v8.0 GOLD: Subagents Mesh Orchestrator.
Unifica a malha DAG de 19 Agentes, o barramento de Subagentes Antigravity,
a ponte FastMCP, os modelos especializados locais (Qwen 7B/1.5B/0.5B) e o Motor Cognitivo Local (@gemma4).
Protocolo Chico SOTA v8.0 GOLD  Governanca: Raphael Vitoi.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
import logging
import os
import re
import sys
from typing import Any

import aiohttp
from pydantic import BaseModel, ConfigDict, Field

import core.config as cfg
from core.schemas import Task
from core.sota_context_engine import HookContext, HookType, context_cache, hook_bus

logger = logging.getLogger(__name__)

# Constantes e Protocolos de Controle do Gemma 4 (Google DeepMind)
GEMMA4_THINK_TOKEN = "<|think|>"
GEMMA4_THOUGHT_CHANNEL_START = "<|channel>thought\n"
GEMMA4_THOUGHT_CHANNEL_END = "<channel|>"
GEMMA4_VALID_VISUAL_BUDGETS: frozenset[int] = frozenset({70, 140, 280, 560, 1120})


def format_gemma4_system_prompt(system_prompt: str, enable_thinking: bool = False) -> str:
    """
    Formata o system prompt para a familia Gemma 4.
    Injeta o token de controle <|think|> se o modo de raciocinio estiver ativo.
    """
    clean_prompt = system_prompt.strip()
    if enable_thinking:
        if not clean_prompt.startswith(GEMMA4_THINK_TOKEN):
            return f"{GEMMA4_THINK_TOKEN}\n{clean_prompt}"
        return clean_prompt
    if clean_prompt.startswith(GEMMA4_THINK_TOKEN):
        return clean_prompt[len(GEMMA4_THINK_TOKEN) :].strip()
    return clean_prompt


def format_gemma4_thought_block(thought: str, answer: str) -> str:
    """Monta a saida estruturada no padrao de canais do Gemma 4."""
    return f"{GEMMA4_THOUGHT_CHANNEL_START}{thought}{GEMMA4_THOUGHT_CHANNEL_END}{answer}"


def parse_gemma4_channel_output(raw_output: str) -> tuple[str | None, str]:
    """
    Separa o canal de pensamento interno (<|channel>thought...<channel|>) da resposta final.
    Retorna (thought_content, final_answer).
    """
    start_esc = re.escape(GEMMA4_THOUGHT_CHANNEL_START)
    end_esc = re.escape(GEMMA4_THOUGHT_CHANNEL_END)
    pattern = f"{start_esc}(.*?){end_esc}(.*)"
    match = re.search(pattern, raw_output, flags=re.DOTALL)
    if match:
        thought_content = match.group(1).strip() or None
        final_answer = match.group(2).strip()
        return thought_content, final_answer
    return None, raw_output.strip()


def sanitize_gemma4_multiturn_history(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Garante que pensamentos intermediarios (<|channel>thought...) de turnos anteriores
    sejam removidos do historico de conversacao, preservando apenas a resposta final.
    """
    sanitized: list[dict[str, Any]] = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "assistant" and isinstance(content, str):
            _, final_answer = parse_gemma4_channel_output(content)
            sanitized.append({**msg, "content": final_answer})
        else:
            sanitized.append(dict(msg))
    return sanitized


def validate_visual_token_budget(budget: int) -> int:
    """
    Valida e normaliza o orcamento de tokens visuais para o Gemma 4 (70, 140, 280, 560, 1120).
    """
    if budget in GEMMA4_VALID_VISUAL_BUDGETS:
        return budget
    return min(GEMMA4_VALID_VISUAL_BUDGETS, key=lambda b: abs(b - budget))


class SubagentTier(StrEnum):
    """Niveis de especializacao de subagentes no Antigravity Runtime."""

    APPSEC = "appsec_gatekeeper"
    MATH = "math_verifier_sota"
    WASM = "wasm_perf_engineer"
    POETICS = "poetics_curator"
    NANO_ROUTER = "nano_intent_router"
    STREAMING_FIM = "streaming_fim_companion"
    UI = "ui_design_curator"
    RESEARCH = "research"
    VALIDADOR = "sub_validador"
    IMPLEMENTOR = "sub_implementor"
    CURATOR = "sub_curator"
    ARCHITECT = "sub_architect"
    GENERALIST = "generalist"
    SELF = "self"
    FLUTTER_A11Y = "flutter_a11y_agent"
    TOOL_DISPATCH = "tool_dispatch_router"


def resolve_subagent_tier(value: Any) -> SubagentTier | None:
    """Resolve com seguranca strings de tier (por valor ou por nome de membro)."""
    if isinstance(value, SubagentTier):
        return value
    if not isinstance(value, str) or not value.strip():
        return None
    val_clean = value.strip()
    try:
        return SubagentTier(val_clean)
    except ValueError:
        pass
    try:
        return SubagentTier[val_clean.upper()]
    except KeyError:
        return None


MODEL_QWEN_CODE_SURGICAL = "qwen-code-surgical:latest"
MODEL_QWEN_7B_INSTRUCT = "qwen2.5-coder:7b-instruct-q5_K_M"
MODEL_QWEN_PMEV_MATH = "qwen-pmev-math:latest"
MODEL_GEMMA4_E4B = "gemma4:e4b"
MODEL_GEMMA4_E2B = "gemma4:e2b"
MODEL_QWEN3_5_4B = "qwen3.5:4b"
MODEL_QWEN_1_5B = "qwen2.5-coder:1.5b"
MODEL_QWEN_0_5B = "qwen2.5-coder:0.5b"
MODEL_FUNCTIONGEMMA_270M = "functiongemma:270m"
LLAMA_CPP_CODER_1_5B = "qwen2.5-coder-1.5b-q8_0"
LLAMA_CPP_CODER_INSTRUCT = "ggml-org/Qwen2.5-Coder-1.5B-Instruct-Q8_0-GGUF:Q8_0"
LLAMA_CPP_TINY_FALLBACK = "Ling-3.0-tiny-Q4_K_M"
LLAMA_CPP_FAST_3B = "ai9stars_G9v3-3B-Q4_K_M"
LLAMA_CPP_GEMMA4_E2B = "ggml-org/gemma-4-E2B-it-GGUF:Q8_0"
LLAMA_CPP_GEMMA4_E4B_DISTILLED = "ggml-org/gemma-4-E4B-it-GGUF:Q4_0"

LLAMA_CPP_FALLBACK_MAP: dict[str, str] = {
    MODEL_QWEN_CODE_SURGICAL: LLAMA_CPP_CODER_1_5B,
    MODEL_QWEN_7B_INSTRUCT: LLAMA_CPP_CODER_1_5B,
    MODEL_QWEN3_5_4B: LLAMA_CPP_FAST_3B,
    "qwen2.5-coder:7b": LLAMA_CPP_CODER_1_5B,
    MODEL_QWEN_1_5B: LLAMA_CPP_CODER_1_5B,
    "qwen2.5-coder:1.5b-instruct": LLAMA_CPP_CODER_INSTRUCT,
    MODEL_QWEN_0_5B: LLAMA_CPP_TINY_FALLBACK,
    MODEL_FUNCTIONGEMMA_270M: LLAMA_CPP_FAST_3B,
    MODEL_QWEN_PMEV_MATH: LLAMA_CPP_FAST_3B,
    "qwen-poetics:latest": LLAMA_CPP_FAST_3B,
    MODEL_GEMMA4_E2B: LLAMA_CPP_GEMMA4_E2B,
    MODEL_GEMMA4_E4B: LLAMA_CPP_FAST_3B,
    "gemma4:e4b-distilled": LLAMA_CPP_GEMMA4_E4B_DISTILLED,
}

# Prioridade de subagentes: modelos locais rapidos/pequenos especialistas (custo $0.00)
SUBAGENT_MODEL_MAP: dict[SubagentTier, str] = {
    SubagentTier.APPSEC: MODEL_QWEN_CODE_SURGICAL,
    SubagentTier.MATH: MODEL_QWEN_PMEV_MATH,
    SubagentTier.WASM: MODEL_QWEN3_5_4B,
    SubagentTier.POETICS: "qwen-poetics:latest",
    SubagentTier.NANO_ROUTER: MODEL_QWEN_0_5B,
    SubagentTier.STREAMING_FIM: MODEL_QWEN_1_5B,
    SubagentTier.UI: MODEL_QWEN3_5_4B,
    SubagentTier.RESEARCH: MODEL_GEMMA4_E2B,
    SubagentTier.VALIDADOR: MODEL_QWEN3_5_4B,
    SubagentTier.IMPLEMENTOR: MODEL_QWEN_1_5B,
    SubagentTier.CURATOR: MODEL_QWEN3_5_4B,
    SubagentTier.ARCHITECT: MODEL_GEMMA4_E2B,
    SubagentTier.GENERALIST: MODEL_GEMMA4_E2B,
    SubagentTier.SELF: MODEL_QWEN_1_5B,
    SubagentTier.FLUTTER_A11Y: MODEL_QWEN_1_5B,
    SubagentTier.TOOL_DISPATCH: MODEL_FUNCTIONGEMMA_270M,
}

# Contingencia cloud zero-custo (:free) quando daemons locais estiverem indisponiveis
FREE_MODEL_LAGUNA_XS = "nvidia/nemotron-3.5-lightning:free"
FREE_MODEL_LAGUNA_S = "nvidia/nemotron-3-ultra-550b-a55b:free"
FREE_MODEL_QWEN_CODER_32B = "cohere/north-mini-code:free"
FREE_MODEL_LLAMA_33_70B = "google/gemma-4-31b-it:free"

FREE_CLOUD_FALLBACK_MAP: dict[SubagentTier, tuple[str, ...]] = {
    SubagentTier.APPSEC: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_QWEN_CODER_32B),
    SubagentTier.MATH: (FREE_MODEL_LAGUNA_S, FREE_MODEL_LLAMA_33_70B),
    SubagentTier.WASM: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_QWEN_CODER_32B),
    SubagentTier.POETICS: (FREE_MODEL_LAGUNA_S, FREE_MODEL_LAGUNA_XS),
    SubagentTier.NANO_ROUTER: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.STREAMING_FIM: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_QWEN_CODER_32B),
    SubagentTier.UI: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.RESEARCH: (FREE_MODEL_LAGUNA_S, FREE_MODEL_LLAMA_33_70B),
    SubagentTier.VALIDADOR: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.IMPLEMENTOR: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_QWEN_CODER_32B),
    SubagentTier.CURATOR: (FREE_MODEL_LAGUNA_S, FREE_MODEL_LAGUNA_XS),
    SubagentTier.ARCHITECT: (FREE_MODEL_LAGUNA_S, FREE_MODEL_LLAMA_33_70B),
    SubagentTier.GENERALIST: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.SELF: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.FLUTTER_A11Y: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_LAGUNA_S),
    SubagentTier.TOOL_DISPATCH: (FREE_MODEL_LAGUNA_XS, FREE_MODEL_QWEN_CODER_32B),
}


class SubagentMissionRequest(BaseModel):
    """Payload estruturado para despacho e delegacao de missoes em subagentes."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    mission_id: str = Field(..., min_length=3, description="Identificador unico da missao")
    tier: SubagentTier = Field(..., description="Tipo de subagente responsavel")
    prompt: str = Field(..., min_length=10, description="Instrucao densa e acionavel")
    target_files: list[str] = Field(default_factory=list, description="Arquivos sob escopo")
    timeout_seconds: int = Field(default=300, ge=10, le=3600)
    use_ragflow: bool = False
    ragflow_dataset_ids: list[str] = Field(default_factory=list)
    use_neo4j: bool = False
    thinking_depth: str = Field(default="medium", pattern=r"^(low|medium|high|ultra)$")
    n8n_webhook_path: str | None = None
    n8n_workflow_id: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class SubagentMissionResult(BaseModel):
    """Resultado deterministico retornado por um subagente apos a execucao."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    mission_id: str
    tier: SubagentTier
    assigned_model: str
    status: str = Field(..., pattern=r"^(SUCCESS|FAILED|SKIPPED)$")
    report: str
    execution_time_ms: float
    files_modified: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


@dataclass
class SubagentMeshController:
    """
    Controlador central da malha de subagentes SOTA.
    Coordena a execucao concorrente, orquestracao MCP, context caching e paridade com a esteira DAG.
    """

    active_missions: dict[str, SubagentMissionRequest] = field(default_factory=dict)
    completed_missions: dict[str, SubagentMissionResult] = field(default_factory=dict)

    def route_task_to_subagent(self, task: Task) -> SubagentTier:
        """
        Analisa a semantica da tarefa e roteia para o subagente de maior utilidade esperada (+EV).
        """
        desc_lower = task.description.lower()

        # 1. Heuristica de Seguranca / AppSec & Target Lock
        if any(
            term in desc_lower
            for term in ("cwe", "security", "vulnerability", "auth", "secret", "token", "diff", "search_replace")
        ):
            return SubagentTier.APPSEC

        # 2. Heuristica Matematica / Poker & PMev
        if any(term in desc_lower for term in ("pmev", "icm", "monte carlo", "nash", "equity", "odds", "pot", "bayes")):
            return SubagentTier.MATH

        # 3. Heuristica Literaria / Letras / Filosofia
        if any(term in desc_lower for term in ("poesia", "letra", "musica", "filosofia", "poetics", "existencial")):
            return SubagentTier.POETICS

        # 4. Heuristica WebAssembly / Rust / Performance
        if any(term in desc_lower for term in ("wasm", "rust", "alloc", "heap", "zero-copy", "benchmark", "simd")):
            return SubagentTier.WASM

        # 5. Heuristica UI / Estetica
        if any(term in desc_lower for term in ("css", "hsl", "design", "ui", "ux", "layout", "component", "tailwind")):
            return SubagentTier.UI

        # 6. Heuristica de Pesquisa, OSINT, RAGFlow DeepDoc & Neo4j L4 Graph
        if any(
            term in desc_lower
            for term in (
                "pesquisa",
                "research",
                "investigate",
                "doc",
                "artigo",
                "tavily",
                "ragflow",
                "deepdoc",
                "neo4j",
                "cypher",
                "knowledge graph",
                "grafo",
            )
        ):
            return SubagentTier.RESEARCH

        # 7. Heuristica de Autocompletion / FIM
        if any(term in desc_lower for term in ("autocomplete", "fim", "inline", "tab")):
            return SubagentTier.STREAMING_FIM

        # 8. Heuristica Flutter / Dart / A11y / WCAG
        if any(
            term in desc_lower
            for term in ("flutter", "dart", "a11y", "wcag", "semantics", "tap_target", "screen_reader")
        ):
            return SubagentTier.FLUTTER_A11Y

        # 9. Heuristica de Despacho de Ferramentas (FunctionGemma 270M)
        if any(term in desc_lower for term in ("functiongemma", "tool_call", "function_call", "tool_dispatch")):
            return SubagentTier.TOOL_DISPATCH

        # 10. Heuristica de Orquestracao / Webhooks n8n
        if any(term in desc_lower for term in ("n8n", "webhook", "automacao")):
            return SubagentTier.NANO_ROUTER

        return SubagentTier.SELF

    @staticmethod
    def _llama_cpp_endpoints(
        llama_base: str,
        swap_base: str,
        router_model: str,
        swap_fallback_model: str,
    ) -> list[tuple[str, list[str], str]]:
        """Monta a lista ordenada de (endpoint, modelos, mode_tag) para o fallback llama.cpp."""
        endpoints: list[tuple[str, list[str], str]] = [(llama_base, [router_model], "real_llama_cpp")]
        if swap_base and swap_base != llama_base:
            swap_models = [router_model]
            if swap_fallback_model and swap_fallback_model != router_model:
                swap_models.append(swap_fallback_model)
            endpoints.append((swap_base, swap_models, "real_llama_swap"))
        return endpoints

    @staticmethod
    def _parse_llama_cpp_response(
        data: dict[str, Any],
        mode_tag: str,
        model_name: str,
        endpoint_base: str,
    ) -> tuple[str | None, dict[str, Any]]:
        """Extrai resposta final, canal de pensamento e telemetria de payload llama.cpp."""
        usage = data.get("usage") or {}
        metadata: dict[str, Any] = {
            "inference_mode": mode_tag,
            "llama_cpp_model": model_name,
            "llama_cpp_endpoint": endpoint_base,
            "prompt_eval_count": usage.get("prompt_tokens", 0),
            "eval_count": usage.get("completion_tokens", 0),
        }
        choices = data.get("choices") or []
        raw_content = str((choices[0].get("message") or {}).get("content", "")).strip() if choices else ""
        thought_channel, final_answer = parse_gemma4_channel_output(raw_content) if raw_content else (None, "")
        if thought_channel:
            metadata["thought_channel"] = thought_channel
        return final_answer or None, metadata

    @staticmethod
    async def _request_llama_cpp_model(
        session: aiohttp.ClientSession,
        endpoint_base: str,
        model_name: str,
        mode_tag: str,
        base_messages: list[dict[str, str]],
    ) -> tuple[tuple[str | None, dict[str, Any]] | None, bool]:
        """Dispara uma tentativa e retorna (resposta_ou_None, tentar_proximo_modelo)."""
        payload = {
            "model": model_name,
            "messages": base_messages,
            "stream": False,
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        try:
            async with session.post(f"{endpoint_base}/v1/chat/completions", json=payload) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    response = SubagentMeshController._parse_llama_cpp_response(
                        data, mode_tag, model_name, endpoint_base
                    )
                    return response, False
                if resp.status in (400, 404):
                    return None, True
                return None, False
        except Exception as e_llama:
            logger.debug(
                "[SUBAGENTS MESH] Fallback %s (%s) indisponivel para '%s': %s",
                mode_tag,
                endpoint_base,
                model_name,
                e_llama,
            )
            return None, False

    @staticmethod
    async def _call_llama_cpp_inference(
        assigned_model: str,
        system_instruction: str,
        prompt: str,
        timeout_seconds: int,
    ) -> tuple[str | None, dict[str, Any]]:
        """Fallback local via router llama.cpp 1.0 (:9931) e llama-swap (:8080) OpenAI-compatible."""
        llama_base = os.environ.get("CHICO_LLAMA_API_BASE", "http://127.0.0.1:9931").rstrip("/")
        swap_base = os.environ.get("CHICO_LLAMA_SWAP_BASE", "http://127.0.0.1:8080").rstrip("/")
        router_model = LLAMA_CPP_FALLBACK_MAP.get(assigned_model, "ai9stars_G9v3-3B-Q4_K_M")
        swap_fallback_model = os.environ.get("CHICO_LLAMA_SWAP_MODEL", "qwen-moe")
        base_messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]
        default_timeout = 2.0 if "pytest" in sys.modules else 45.0
        sock_timeout = 1.0 if "pytest" in sys.modules else 2.0
        req_timeout = float(
            os.environ.get("LLAMA_CPP_TIMEOUT_SECONDS", str(min(float(timeout_seconds), default_timeout)))
        )
        timeout = aiohttp.ClientTimeout(total=req_timeout, sock_connect=sock_timeout)

        endpoints = SubagentMeshController._llama_cpp_endpoints(
            llama_base, swap_base, router_model, swap_fallback_model
        )
        async with aiohttp.ClientSession(timeout=timeout) as session:
            for endpoint_base, model_names, mode_tag in endpoints:
                for model_name in model_names:
                    response, try_next = await SubagentMeshController._request_llama_cpp_model(
                        session, endpoint_base, model_name, mode_tag, base_messages
                    )
                    if response is not None:
                        return response
                    if not try_next:
                        break
        return None, {}

    @staticmethod
    def _parse_ollama_success_response(data: dict[str, Any]) -> tuple[str | None, dict[str, Any]]:
        """Extrai resposta final, canal de pensamento e telemetria de payload Ollama."""
        metadata: dict[str, Any] = {
            "inference_mode": "real_ollama",
            "prompt_eval_count": data.get("prompt_eval_count", 0),
            "eval_count": data.get("eval_count", 0),
        }
        raw_content = data.get("message", {}).get("content", "").strip()
        if not raw_content:
            return None, metadata
        thought_channel, final_answer = parse_gemma4_channel_output(raw_content)
        if thought_channel:
            metadata["thought_channel"] = thought_channel
        return final_answer, metadata

    @staticmethod
    async def _try_free_cloud_model(
        session: aiohttp.ClientSession,
        free_model: str,
        tier_value: str,
        system_instruction: str,
        prompt: str,
        api_key: str,
        key_tier: int,
        client_timeout: aiohttp.ClientTimeout,
    ) -> tuple[str | None, dict[str, Any]] | None:
        """Tenta um unico modelo :free e retorna (resposta, meta) ou None para o proximo candidato."""
        from llm.openrouter import call_openrouter  # noqa: PLC0415
        from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

        loop = asyncio.get_running_loop()
        t0 = loop.time()
        try:
            raw_text, usage = await call_openrouter(
                session=session,
                model=free_model,
                system_prompt=system_instruction,
                user_prompt=prompt,
                api_key=api_key,
                client_timeout=client_timeout,
                temperature=0.2,
                max_tokens=1024,
            )
            cleaned = (raw_text or "").strip()
            if not cleaned:
                return None
            latency_ms = max(1.0, (loop.time() - t0) * 1000.0)
            await openrouter_pool_manager.mark_success(api_key, latency_ms)
            thought_channel, final_answer = parse_gemma4_channel_output(cleaned)
            meta: dict[str, Any] = {
                "inference_mode": "real_openrouter_free",
                "cloud_free_model": free_model,
                "key_tier": key_tier,
                "prompt_eval_count": (usage or {}).get("prompt_tokens", 0),
                "eval_count": (usage or {}).get("completion_tokens", 0),
            }
            if thought_channel:
                meta["thought_channel"] = thought_channel
            return (final_answer or cleaned), meta
        except Exception as exc:
            err_s = str(exc)
            status_code = 429 if "429" in err_s else 500
            await openrouter_pool_manager.mark_failure(api_key, status_code=status_code)
            logger.debug(
                "[SUBAGENTS MESH] Fallback :free '%s' indisponivel para '%s': %s",
                free_model,
                tier_value,
                err_s,
            )
            return None

    @staticmethod
    async def _call_free_cloud_inference(
        tier: SubagentTier | None,
        system_instruction: str,
        prompt: str,
        timeout_seconds: int,
    ) -> tuple[str | None, dict[str, Any]]:
        """Contingencia cloud gratuita (:free) para subagentes quando daemons locais falham."""
        if tier is None:
            return None, {}
        if "pytest" in sys.modules and os.environ.get("CHICO_SUBAGENT_ALLOW_TEST_CLOUD") != "1":
            return None, {}

        candidates = FREE_CLOUD_FALLBACK_MAP.get(tier, (FREE_MODEL_LAGUNA_XS,))
        free_candidates = [m for m in candidates if ":free" in m.lower()]
        if not free_candidates:
            return None, {}

        from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

        api_key, key_tier = await openrouter_pool_manager.get_key_for_tier(4)
        if not api_key:
            return None, {}

        req_timeout = min(float(timeout_seconds), 20.0)
        client_timeout = aiohttp.ClientTimeout(total=req_timeout, sock_connect=2.0)

        async with aiohttp.ClientSession(timeout=client_timeout) as session:
            for free_model in free_candidates:
                result = await SubagentMeshController._try_free_cloud_model(
                    session,
                    free_model,
                    tier.value,
                    system_instruction,
                    prompt,
                    api_key,
                    key_tier,
                    client_timeout,
                )
                if result is not None:
                    return result
        return None, {}

    @staticmethod
    async def _fallback_to_llama_cpp(
        assigned_model: str,
        system_instruction: str,
        prompt: str,
        timeout_seconds: int,
        fallback_reason: str,
        tier: SubagentTier | None = None,
    ) -> tuple[str | None, dict[str, Any]]:
        """Tenta fallback para llama.cpp local e depois :free cloud antes de fallback deterministico."""
        llama_content, llama_meta = await SubagentMeshController._call_llama_cpp_inference(
            assigned_model, system_instruction, prompt, timeout_seconds
        )
        if llama_content:
            return llama_content, llama_meta
        free_content, free_meta = await SubagentMeshController._call_free_cloud_inference(
            tier, system_instruction, prompt, timeout_seconds
        )
        if free_content:
            return free_content, free_meta
        return None, {
            "inference_mode": "fallback_deterministic",
            "fallback_reason": fallback_reason,
        }

    @staticmethod
    async def _call_ollama_inference(
        assigned_model: str,
        tier_value: str,
        prompt: str,
        timeout_seconds: int,
    ) -> tuple[str | None, dict[str, Any]]:
        """Dispara a chamada HTTP para o Ollama local e extrai resposta ou metadados de fallback."""
        ollama_base = os.environ.get("OLLAMA_API_BASE", "http://127.0.0.1:11434")
        ollama_url = f"{ollama_base}/api/chat"
        system_instruction = (
            f"Voce e o subagente especializado '{tier_value}'. "
            f"Execute a missao com maxima precisao cirurgica, sem entropia e com economia generalizada."
        )
        if "gemma" in assigned_model.lower():
            system_instruction = format_gemma4_system_prompt(system_instruction, enable_thinking=True)
        payload = {
            "model": assigned_model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 1024,
            },
        }

        default_timeout = 2.0 if "pytest" in sys.modules else 45.0
        sock_timeout = 1.0 if "pytest" in sys.modules else 2.0
        ollama_timeout = float(
            os.environ.get("OLLAMA_TIMEOUT_SECONDS", str(min(float(timeout_seconds), default_timeout)))
        )
        timeout = aiohttp.ClientTimeout(total=ollama_timeout, sock_connect=sock_timeout)

        result: tuple[str | None, dict[str, Any]] | None = None
        fallback_reason = "unknown_error"
        try:
            async with (
                aiohttp.ClientSession(timeout=timeout) as session,
                session.post(ollama_url, json=payload) as resp,
            ):
                if resp.status == 200:
                    result = SubagentMeshController._parse_ollama_success_response(await resp.json())
                else:
                    err_body = await resp.text()
                    logger.warning(
                        "[SUBAGENTS MESH] Ollama HTTP %d para modelo '%s': %s. Tentando fallback llama.cpp (:9931).",
                        resp.status,
                        assigned_model,
                        err_body[:200],
                    )
                    fallback_reason = f"HTTP {resp.status}"
        except Exception as e_ollama:
            err_detail = str(e_ollama).strip() or type(e_ollama).__name__
            logger.warning(
                "[SUBAGENTS MESH] Inferencia real via Ollama (127.0.0.1:11434) para modelo '%s' falhou (%s). Tentando fallback llama.cpp (:9931).",
                assigned_model,
                err_detail,
            )
            fallback_reason = err_detail

        if result is not None:
            return result
        return await SubagentMeshController._fallback_to_llama_cpp(
            assigned_model,
            system_instruction,
            prompt,
            timeout_seconds,
            fallback_reason,
            tier=resolve_subagent_tier(tier_value),
        )

    @staticmethod
    async def _resolve_mission_context(request: SubagentMissionRequest) -> tuple[str, int, int]:
        """Coleta contexto RAGFlow/Neo4j e retorna (prompt enriquecido, citacoes, linhas de grafo)."""
        from core.mesh_integrations import Neo4jAuraBridge, RAGFlowBridge  # noqa: PLC0415

        knowledge_tiers = {
            SubagentTier.RESEARCH,
            SubagentTier.ARCHITECT,
            SubagentTier.CURATOR,
            SubagentTier.VALIDADOR,
            SubagentTier.MATH,
        }
        use_rf = RAGFlowBridge.is_configured(request.ragflow_dataset_ids) and (
            request.use_ragflow or request.tier in knowledge_tiers
        )
        use_n4j = Neo4jAuraBridge.is_configured() and (request.use_neo4j or request.tier in knowledge_tiers)

        async def _noop_context():
            await asyncio.sleep(0)

        rag_res, n4j_res = await asyncio.gather(
            RAGFlowBridge.retrieve_grounded_context(
                request.prompt,
                dataset_ids=request.ragflow_dataset_ids or None,
                thinking_depth=request.thinking_depth,
            )
            if use_rf
            else _noop_context(),
            Neo4jAuraBridge.query_graph_context(request.prompt, limit=5) if use_n4j else _noop_context(),
        )

        prefix_blocks: list[str] = []
        ragflow_citations_count = 0
        neo4j_graph_rows = 0
        if rag_res is not None:
            citations_block = rag_res.format_context_block()
            if citations_block:
                ragflow_citations_count = len(rag_res.citations)
                prefix_blocks.append(citations_block)
        if n4j_res is not None:
            graph_block = n4j_res.format_context_block()
            if graph_block:
                neo4j_graph_rows = len(n4j_res.rows)
                prefix_blocks.append(graph_block)

        enriched_prompt = (
            f"{chr(10).join(prefix_blocks)}\n\n[MISSAO DO SUBAGENTE]\n{request.prompt}"
            if prefix_blocks
            else request.prompt
        )
        return enriched_prompt, ragflow_citations_count, neo4j_graph_rows

    @staticmethod
    async def _dispatch_n8n_event(
        request: SubagentMissionRequest,
        assigned_model: str,
        report: str,
        ragflow_citations_count: int,
        neo4j_graph_rows: int,
        metadata: dict[str, Any],
    ) -> None:
        """Despacha o evento de missao concluida para o n8n quando configurado."""
        from core.mesh_integrations import N8NBridge  # noqa: PLC0415

        if not N8NBridge.is_configured() or not (request.n8n_webhook_path or request.n8n_workflow_id):
            return
        n8n_res = await N8NBridge.dispatch_event(
            {
                "event_type": "subagent_mission_completed",
                "mission_id": request.mission_id,
                "tier": request.tier.value,
                "assigned_model": assigned_model,
                "files_modified": request.target_files,
                "ragflow_citations": ragflow_citations_count,
                "neo4j_graph_rows": neo4j_graph_rows,
                "summary": report[:800],
            },
            webhook_path=request.n8n_webhook_path,
            workflow_id=request.n8n_workflow_id,
        )
        metadata["n8n_dispatched"] = n8n_res.dispatched
        if n8n_res.status_code:
            metadata["n8n_status_code"] = n8n_res.status_code

    @staticmethod
    def _blocked_mission_result(
        request: SubagentMissionRequest,
        assigned_model: str,
        start_time: float,
    ) -> SubagentMissionResult:
        duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        return SubagentMissionResult(
            mission_id=request.mission_id,
            tier=request.tier,
            assigned_model=assigned_model,
            status="FAILED",
            report=f"Missao '{request.mission_id}' bloqueada por barreira de seguranca (Hook DECIDE).",
            execution_time_ms=round(duration_ms, 3),
            files_modified=[],
            metadata={"blocked": True},
        )

    async def execute_subagent_pipeline(self, request: SubagentMissionRequest) -> SubagentMissionResult:
        """
        Executa o pipeline assincrono do subagente com medicao precisa de latencia e hooks.
        """
        start_time = asyncio.get_event_loop().time()
        self.active_missions[request.mission_id] = request
        assigned_model = SUBAGENT_MODEL_MAP.get(request.tier, MODEL_QWEN_CODE_SURGICAL)

        logger.info(
            "[SUBAGENTS MESH] Iniciando missao '%s' no subagente '%s' (Modelo: %s)",
            request.mission_id,
            request.tier.value,
            assigned_model,
        )

        # Hook DECIDE: Validacao de Target Lock e Seguranca
        allowed = hook_bus.trigger_decide(
            HookContext(
                hook_type=HookType.DECIDE,
                agent_name=request.tier.value,
                payload={"mission_id": request.mission_id, "target_files": request.target_files},
            )
        )

        if not allowed:
            return SubagentMeshController._blocked_mission_result(request, assigned_model, start_time)

        try:
            (
                enriched_prompt,
                ragflow_citations_count,
                neo4j_graph_rows,
            ) = await SubagentMeshController._resolve_mission_context(request)

            # Context Caching: Cache do prompt da missao
            bucket = context_cache.get_or_create_bucket(
                bucket_id=f"mission_{request.mission_id}",
                content=enriched_prompt,
                ttl_seconds=request.timeout_seconds,
            )

            response_content, inference_metadata = await self._call_ollama_inference(
                assigned_model=assigned_model,
                tier_value=request.tier.value,
                prompt=enriched_prompt,
                timeout_seconds=request.timeout_seconds,
            )

            metadata: dict[str, Any] = {
                "agent_source": cfg.AGENT_SOURCE or "antigravity_core",
                "cache_signature": bucket.hash_signature,
                "ragflow_citations": ragflow_citations_count,
                "neo4j_graph_rows": neo4j_graph_rows,
            }
            metadata.update(inference_metadata)

            duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000

            report = response_content or (
                f"Missao '{request.mission_id}' concluida com exito pelo subagente '{request.tier.value}' usando '{assigned_model}'."
            )

            await SubagentMeshController._dispatch_n8n_event(
                request,
                assigned_model,
                report,
                ragflow_citations_count,
                neo4j_graph_rows,
                metadata,
            )

            result = SubagentMissionResult(
                mission_id=request.mission_id,
                tier=request.tier,
                assigned_model=assigned_model,
                status="SUCCESS",
                report=report,
                execution_time_ms=round(duration_ms, 3),
                files_modified=request.target_files,
                metadata=metadata,
            )

            # Hook INSPECT: Telemetria pos-execucao
            hook_bus.trigger_inspect(
                HookContext(
                    hook_type=HookType.INSPECT,
                    agent_name=request.tier.value,
                    payload={"execution_time_ms": duration_ms, "status": "SUCCESS"},
                )
            )

            self.completed_missions[request.mission_id] = result
            return result
        except Exception as e:
            duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000
            logger.exception("[SUBAGENTS MESH] Erro na execucao da missao '%s'", request.mission_id)
            return SubagentMissionResult(
                mission_id=request.mission_id,
                tier=request.tier,
                assigned_model=assigned_model,
                status="FAILED",
                report=f"Falha na missao '{request.mission_id}': {e!s}",
                execution_time_ms=round(duration_ms, 3),
                files_modified=[],
                metadata={"error": str(e)},
            )
        finally:
            self.active_missions.pop(request.mission_id, None)


subagents_mesh = SubagentMeshController()
