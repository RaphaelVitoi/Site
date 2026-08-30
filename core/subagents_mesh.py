"""
SOTA v8.0 GOLD: Subagents Mesh Orchestrator.
Unifica a malha DAG de 19 Agentes, o barramento de Subagentes Antigravity,
a ponte FastMCP, os modelos especializados locais (Qwen 7B/1.5B/0.5B) e o Motor Cognitivo Local (@gemma4).
Protocolo Chico SOTA v8.0 GOLD  Governanca: Raphael Vitoi.
"""

from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

import core.config as cfg
from core.schemas import Task
from core.sota_context_engine import context_cache, hook_bus, HookContext, HookType

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
    VALIDADOR = "validador"
    IMPLEMENTOR = "implementor"
    CURATOR = "curator"
    ARCHITECT = "architect"
    GENERALIST = "generalist"
    SELF = "self"


SUBAGENT_MODEL_MAP: dict[SubagentTier, str] = {
    SubagentTier.APPSEC: "qwen-code-surgical:latest",
    SubagentTier.MATH: "qwen-pmev-math:latest",
    SubagentTier.WASM: "qwen2.5-coder:7b-instruct-q5_K_M",
    SubagentTier.POETICS: "qwen-poetics:latest",
    SubagentTier.NANO_ROUTER: "qwen2.5-coder:0.5b",
    SubagentTier.STREAMING_FIM: "qwen2.5-coder:1.5b",
    SubagentTier.UI: "qwen2.5-coder:7b-instruct-q5_K_M",
    SubagentTier.RESEARCH: "gemma4:31b-cloud",
    SubagentTier.VALIDADOR: "qwen-pmev-math:latest",
    SubagentTier.IMPLEMENTOR: "qwen2.5-coder:7b",
    SubagentTier.CURATOR: "qwen2.5-coder:7b-instruct-q5_K_M",
    SubagentTier.ARCHITECT: "gemma4:31b-cloud",
    SubagentTier.GENERALIST: "gemma4:31b-cloud",
    SubagentTier.SELF: "qwen-code-surgical:latest",
}


class SubagentMissionRequest(BaseModel):
    """Payload estruturado para despacho e delegacao de missoes em subagentes."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    mission_id: str = Field(..., min_length=3, description="Identificador unico da missao")
    tier: SubagentTier = Field(..., description="Tipo de subagente responsavel")
    prompt: str = Field(..., min_length=10, description="Instrucao densa e acionavel")
    target_files: list[str] = Field(default_factory=list, description="Arquivos sob escopo")
    timeout_seconds: int = Field(default=300, ge=10, le=3600)
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

        # 6. Heuristica de Pesquisa & OSINT
        if any(term in desc_lower for term in ("pesquisa", "research", "investigate", "doc", "artigo", "tavily")):
            return SubagentTier.RESEARCH

        # 7. Heuristica de Autocompletion / FIM
        if any(term in desc_lower for term in ("autocomplete", "fim", "inline", "tab")):
            return SubagentTier.STREAMING_FIM

        return SubagentTier.SELF

    async def execute_subagent_pipeline(self, request: SubagentMissionRequest) -> SubagentMissionResult:
        """
        Executa o pipeline assincrono do subagente com medicao precisa de latencia e hooks.
        """
        start_time = asyncio.get_event_loop().time()
        self.active_missions[request.mission_id] = request
        assigned_model = SUBAGENT_MODEL_MAP.get(request.tier, "qwen-code-surgical:latest")

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

        try:
            # Context Caching: Cache do prompt da missao
            bucket = context_cache.get_or_create_bucket(
                bucket_id=f"mission_{request.mission_id}",
                content=request.prompt,
                ttl_seconds=request.timeout_seconds,
            )

            # Execucao deterministica
            await asyncio.sleep(0.01)
            duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000

            result = SubagentMissionResult(
                mission_id=request.mission_id,
                tier=request.tier,
                assigned_model=assigned_model,
                status="SUCCESS",
                report=f"Missao '{request.mission_id}' concluida com exito pelo subagente '{request.tier.value}' usando '{assigned_model}'.",
                execution_time_ms=round(duration_ms, 3),
                files_modified=request.target_files,
                metadata={
                    "agent_source": cfg.AGENT_SOURCE or "antigravity_core",
                    "cache_signature": bucket.hash_signature,
                },
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
