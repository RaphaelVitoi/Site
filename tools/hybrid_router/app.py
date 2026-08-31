#!/usr/bin/env python3
"""MICROSERVICO DE ROTEAMENTO HIBRIDO SOTA (EDGE LOCAL VULKAN + GEMINI 3.7 FLASH).

Arquitetura de inferencia de alta vazao com tolerancia a falhas, medicao
estatica de densidade semantica, suporte a Extended Thinking dinamico e
conformidade estrita com schemas Pydantic v2.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from enum import StrEnum
import os
import re
import sys
import time
from typing import TYPE_CHECKING

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel, ConfigDict, Field, JsonValue


def _load_env_file(env_path: str | None = None) -> None:
    if env_path is None:
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key, val = key.strip(), val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val
        except (OSError, UnicodeDecodeError):
            pass


_load_env_file()


# Google GenAI SDK Oficial
if TYPE_CHECKING:
    from google import genai
    from google.genai import types
else:
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        genai = None  # type: ignore[assignment]
        types = None  # type: ignore[assignment]


# =====================================================================
# 1. MODELOS DE DADOS E ESQUEMAS PYDANTIC V2
# =====================================================================


class ExecutionTarget(StrEnum):
    LOCAL_LLAMA_VULKAN = "LOCAL_LLAMA_VULKAN"
    GEMINI_37_FLASH_STANDARD = "GEMINI_37_FLASH_STANDARD"
    GEMINI_37_FLASH_THINKING = "GEMINI_37_FLASH_THINKING"


class RouteMetrics(BaseModel):
    model_config = ConfigDict(frozen=True)

    estimated_tokens: int = Field(..., description="Contagem estimada de tokens no prompt.")
    math_latex_density: float = Field(
        ..., description="Densidade de formalismo matematico e Teoria dos Jogos (0.0 a 1.0)."
    )
    code_complexity_score: float = Field(..., description="Score de complexidade sintatica de codigo (0.0 a 1.0).")
    overall_complexity: float = Field(..., description="Metrica composta ponderada de complexidade analitica.")
    requires_tools: bool = Field(..., description="Indica necessidade de execucao de ferramentas.")
    requires_strict_json: bool = Field(..., description="Indica exigencia de validacao via JSON Schema estrito.")
    selected_target: ExecutionTarget = Field(..., description="Destino de execucao selecionado.")
    thinking_budget: int | None = Field(default=None, description="Orcamento de tokens de Extended Thinking.")
    rationale: str = Field(..., description="Fundamentacao logica da decisao de roteamento.")


class GenerateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "prompt": "Calcule o equilibrio de Nash misto no payoff $U_1(s) = \\sum p_i u_i$ e avalie a variancia sob restricao de ICM.",
                "system_instruction": "Atue como motor axiomatico de Teoria dos Jogos e PMev.",
                "thinking_budget_override": 4096,
            }
        }
    )

    prompt: str = Field(..., min_length=1, description="Payload de entrada para inferencia.")
    system_instruction: str = Field(default="", description="Instrucoes de sistema ou metaprompt de governanca.")
    force_target: ExecutionTarget | None = Field(default=None, description="Sobrescreve a heuristica do roteador.")
    thinking_budget_override: int | None = Field(
        default=None, ge=-1, le=65536, description="Orcamento de raciocinio (-1=dinamico, 0=off, >0=fixo)."
    )
    response_schema: dict[str, JsonValue] | None = Field(
        default=None, description="JSON Schema para decodificacao gramatical estrita."
    )
    tools_provided: bool = Field(default=False, description="Flag indicando presenca de ferramentas no pipeline.")


class GenerateResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    content: str = Field(..., description="Texto gerado pelo modelo.")
    target_executed: ExecutionTarget = Field(..., description="Ambiente que executou a inferencia.")
    latency_ms: float = Field(..., description="Latencia ponta a ponta em milissegundos.")
    tokens_evaluated: int = Field(..., description="Tokens estimados no prompt de entrada.")
    thinking_tokens_used: int = Field(default=0, description="Tokens consumidos durante o Extended Thinking.")
    metrics: RouteMetrics = Field(..., description="Metricas analiticas calculadas na triagem.")


class HealthCheckResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: str
    local_llama_vulkan_online: bool
    gemini_api_configured: bool
    local_endpoint: str
    cloud_model: str


# =====================================================================
# 2. ANALISADOR ESTATICO DE COMPLEXIDADE E DENSIDADE
# =====================================================================


class ComplexityAnalyzer:
    """Motor analitico para triagem estatica de densidade simbolica e codigo."""

    LATEX_PATTERNS: re.Pattern[str] = re.compile(
        r"(\$|\\\[|\\begin\{equation\}|\\frac|\\sum|\\int|\\forall|\\exists|\\matrix|\\lambda|\\mu|\\sigma)"
    )
    MATH_GAME_THEORY: re.Pattern[str] = re.compile(
        r"(ICM|PMev|Nash|GTO|payoff|matriz|probabilidade|equacao|autovalor|variancia|EV|PioSolver|Risk Premium)",
        re.IGNORECASE,
    )
    CODE_KEYWORDS: re.Pattern[str] = re.compile(
        r"(def |class |impl |fn |async |await |SELECT |FROM |import |public |private |interface |type |lambda )"
    )

    def __init__(self, local_max_tokens: int = 2048, complexity_threshold: float = 0.45) -> None:
        self.local_max_tokens = local_max_tokens
        self.complexity_threshold = complexity_threshold

    def estimate_tokens(self, text: str) -> int:
        return max(1, int(len(text) / 3.4))

    def compute_metrics(
        self,
        prompt: str,
        tools_provided: bool = False,
        response_schema: dict[str, JsonValue] | None = None,
        force_target: ExecutionTarget | None = None,
        thinking_override: int | None = None,
    ) -> RouteMetrics:
        estimated_tokens = self.estimate_tokens(prompt)
        text_len = max(len(prompt), 1)

        latex_matches = len(self.LATEX_PATTERNS.findall(prompt))
        math_matches = len(self.MATH_GAME_THEORY.findall(prompt))
        math_density = min(1.0, (latex_matches * 45 + math_matches * 30) / text_len)

        code_matches = len(self.CODE_KEYWORDS.findall(prompt))
        code_density = min(1.0, (code_matches * 40) / text_len)

        overall_complexity = (math_density * 0.65) + (code_density * 0.35)
        requires_tools = tools_provided
        requires_strict_json = response_schema is not None

        if force_target is not None:
            selected_target = force_target
            thinking_budget = thinking_override if force_target == ExecutionTarget.GEMINI_37_FLASH_THINKING else None
            rationale = f"Destino forcado explicitamente ({force_target.value})."
        elif requires_tools:
            selected_target = ExecutionTarget.GEMINI_37_FLASH_STANDARD
            thinking_budget = None
            rationale = "Requisicao com Tool Calling delegada ao Gemini Cloud."
        elif overall_complexity >= self.complexity_threshold:
            selected_target = ExecutionTarget.GEMINI_37_FLASH_THINKING
            thinking_budget = (
                thinking_override if thinking_override is not None else (4096 if overall_complexity < 0.75 else 16384)
            )
            rationale = f"Alta complexidade analitica ({overall_complexity:.2f}). Ativacao de Extended Thinking."
        elif estimated_tokens > self.local_max_tokens:
            selected_target = ExecutionTarget.GEMINI_37_FLASH_STANDARD
            thinking_budget = 0
            rationale = f"Volume de tokens ({estimated_tokens}) excede teto da GPU local ({self.local_max_tokens})."
        elif requires_strict_json:
            selected_target = ExecutionTarget.GEMINI_37_FLASH_STANDARD
            thinking_budget = 0
            rationale = "Decodificacao de JSON Schema estrito delegada ao cluster Cloud."
        else:
            selected_target = ExecutionTarget.LOCAL_LLAMA_VULKAN
            thinking_budget = None
            rationale = f"Carga compativel com runtime local Vulkan ({estimated_tokens} tokens, complexidade={overall_complexity:.2f})."

        return RouteMetrics(
            estimated_tokens=estimated_tokens,
            math_latex_density=math_density,
            code_complexity_score=code_density,
            overall_complexity=overall_complexity,
            requires_tools=requires_tools,
            requires_strict_json=requires_strict_json,
            selected_target=selected_target,
            thinking_budget=thinking_budget,
            rationale=rationale,
        )


# =====================================================================
# 3. CLIENTES DE INFERENCIA ASSINCRONOS
# =====================================================================


class LocalLlamaVulkanClient:
    """Cliente HTTP com conexao assincrona persistente para llama.cpp."""

    def __init__(self, endpoint_url: str = "http://127.0.0.1:8080/v1") -> None:
        self.endpoint_url = endpoint_url.rstrip("/")
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=5.0))

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()

    async def is_available(self) -> bool:
        if not self._client:
            return False
        try:
            res = await self._client.get(
                f"{self.endpoint_url}/models",
                timeout=httpx.Timeout(1.0, connect=0.5),
            )
            return res.status_code == 200
        except httpx.RequestError:
            return False

    async def generate(self, prompt: str, system_instruction: str = "") -> str:
        if not self._client:
            raise RuntimeError("Cliente local llama.cpp nao inicializado.")

        messages: list[dict[str, str]] = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 2048,
        }

        response = await self._client.post(f"{self.endpoint_url}/chat/completions", json=payload)
        response.raise_for_status()
        data: dict[str, JsonValue] = response.json()
        choices = data.get("choices")
        if isinstance(choices, list) and len(choices) > 0 and isinstance(choices[0], dict):
            message = choices[0].get("message")
            if isinstance(message, dict) and "content" in message:
                return str(message["content"])
        return ""


class GeminiCloudClient:
    """Cliente nativo assincrono para a API Gemini utilizando google-genai SDK."""

    def __init__(self, api_key: str | None = None, model_id: str = "gemini-2.5-flash") -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_id = model_id
        self._client: genai.Client | None = None

        if self.api_key and genai is not None:
            self._client = genai.Client(api_key=self.api_key)

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def generate(
        self,
        prompt: str,
        system_instruction: str = "",
        thinking_budget: int | None = None,
        response_schema: dict[str, JsonValue] | None = None,
    ) -> tuple[str, int]:
        """Executa geracao assincrona nao-bloqueante via client.aio."""
        client = self._client
        if client is None or types is None:
            raise RuntimeError("SDK Google GenAI nao inicializado ou GEMINI_API_KEY ausente.")

        thinking_cfg = (
            types.ThinkingConfigDict(thinking_budget=thinking_budget) if thinking_budget is not None else None
        )

        config = types.GenerateContentConfigDict(
            temperature=0.2,
            system_instruction=system_instruction if system_instruction else None,
            thinking_config=thinking_cfg,
            response_mime_type="application/json" if response_schema is not None else None,
            response_schema=response_schema,
        )

        # Chamada assincrona nativa pelo barramento client.aio
        response = await client.aio.models.generate_content(
            model=self.model_id,
            contents=prompt,
            config=config,
        )

        thinking_tokens = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            meta = response.usage_metadata
            thinking_tokens = getattr(meta, "thinking_token_count", 0)
            if thinking_tokens == 0 and hasattr(meta, "candidates_tokens_details"):
                details = getattr(meta, "candidates_tokens_details", [])
                if isinstance(details, list):
                    for item in details:
                        if getattr(item, "modality", "") == "THINKING":
                            thinking_tokens = getattr(item, "token_count", 0)

        return response.text or "", thinking_tokens


# =====================================================================
# 4. ORQUESTRADOR HIBRIDO COM RESILIENCIA E FAILOVER
# =====================================================================


class HybridOrchestrator:
    def __init__(
        self,
        local_client: LocalLlamaVulkanClient,
        cloud_client: GeminiCloudClient,
        complexity_analyzer: ComplexityAnalyzer,
    ) -> None:
        self.local = local_client
        self.cloud = cloud_client
        self.analyzer = complexity_analyzer

    async def dispatch(self, req: GenerateRequest) -> GenerateResponse:
        start_time = time.perf_counter()

        metrics = self.analyzer.compute_metrics(
            prompt=req.prompt,
            tools_provided=req.tools_provided,
            response_schema=req.response_schema,
            force_target=req.force_target,
            thinking_override=req.thinking_budget_override,
        )

        target = metrics.selected_target
        content = ""
        thinking_tokens = 0

        # Rota Local Vulkan com Failover automatico
        if target == ExecutionTarget.LOCAL_LLAMA_VULKAN:
            is_alive = await self.local.is_available()
            if is_alive:
                try:
                    content = await self.local.generate(req.prompt, req.system_instruction)
                    latency = (time.perf_counter() - start_time) * 1000.0
                    return GenerateResponse(
                        content=content,
                        target_executed=ExecutionTarget.LOCAL_LLAMA_VULKAN,
                        latency_ms=latency,
                        tokens_evaluated=metrics.estimated_tokens,
                        thinking_tokens_used=0,
                        metrics=metrics,
                    )
                except Exception as err:
                    sys.stderr.write(f"[FAILOVER LOCAL->CLOUD] Erro de inferencia local: {err}\n")

            # Fallback para nuvem em caso de indisponibilidade
            target = ExecutionTarget.GEMINI_37_FLASH_STANDARD

        # Rota Nuvem (Standard ou Extended Thinking)
        if not self.cloud.is_configured:
            # Modo de simulacao offline opcional para testes de infraestrutura
            if os.getenv("SIMULATE_INFERENCE", "false").lower() in ("true", "1", "yes"):
                sim_latency = (
                    120.0
                    if target == ExecutionTarget.LOCAL_LLAMA_VULKAN
                    else (450.0 if target == ExecutionTarget.GEMINI_37_FLASH_STANDARD else 1200.0)
                )
                await asyncio.sleep(sim_latency / 1000.0)
                latency = (time.perf_counter() - start_time) * 1000.0
                return GenerateResponse(
                    content="[SIMULACAO SOTA] Resposta sintetica gerada para teste de vazao e roteamento.",
                    target_executed=target,
                    latency_ms=latency,
                    tokens_evaluated=metrics.estimated_tokens,
                    thinking_tokens_used=metrics.thinking_budget or 0,
                    metrics=metrics,
                )

            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Servico Cloud nao configurado e runtime local offline.",
            )

        content, thinking_tokens = await self.cloud.generate(
            prompt=req.prompt,
            system_instruction=req.system_instruction,
            thinking_budget=metrics.thinking_budget,
            response_schema=req.response_schema,
        )

        latency = (time.perf_counter() - start_time) * 1000.0
        return GenerateResponse(
            content=content,
            target_executed=target,
            latency_ms=latency,
            tokens_evaluated=metrics.estimated_tokens,
            thinking_tokens_used=thinking_tokens,
            metrics=metrics,
        )


# =====================================================================
# 5. LIFESPAN E APLICACAO FASTAPI
# =====================================================================

local_llama_client = LocalLlamaVulkanClient(endpoint_url=os.getenv("LOCAL_LLAMA_URL", "http://127.0.0.1:8080/v1"))
gemini_cloud_client = GeminiCloudClient(
    api_key=os.getenv("GEMINI_API_KEY"),
    model_id=os.getenv("GEMINI_MODEL_ID", "gemini-2.5-flash"),
)
analyzer = ComplexityAnalyzer(
    local_max_tokens=int(os.getenv("LOCAL_MAX_TOKENS", "2048")),
    complexity_threshold=float(os.getenv("COMPLEXITY_THRESHOLD", "0.45")),
)
orchestrator = HybridOrchestrator(local_llama_client, gemini_cloud_client, analyzer)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    await local_llama_client.start()
    yield
    await local_llama_client.close()


app = FastAPI(
    title="Hybrid Edge/Cloud LLM Router API SOTA",
    description="Microservico de alta densidade para roteamento dinamico entre llama.cpp (Vulkan) e Google Gemini 3.7 Flash.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthCheckResponse, tags=["Infraestrutura"])
async def health_check() -> HealthCheckResponse:
    local_alive = await local_llama_client.is_available()
    return HealthCheckResponse(
        status="operational",
        local_llama_vulkan_online=local_alive,
        gemini_api_configured=gemini_cloud_client.is_configured,
        local_endpoint=local_llama_client.endpoint_url,
        cloud_model=gemini_cloud_client.model_id,
    )


@app.post("/v1/router/analyze", response_model=RouteMetrics, tags=["Roteamento"])
async def analyze_prompt(request: GenerateRequest) -> RouteMetrics:
    return analyzer.compute_metrics(
        prompt=request.prompt,
        tools_provided=request.tools_provided,
        response_schema=request.response_schema,
        force_target=request.force_target,
        thinking_override=request.thinking_budget_override,
    )


@app.post("/v1/chat/generate", response_model=GenerateResponse, tags=["Inferencia"])
async def generate_completion(request: GenerateRequest) -> GenerateResponse:
    try:
        return await orchestrator.dispatch(request)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha durante o pipeline de geracao: {str(exc)}",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")  # noqa: S104 # nosec B104
    uvicorn.run("app:app", host=host, port=port, reload=False, log_level="info")
