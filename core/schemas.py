# core/schemas.py
# ruff: noqa: N815
"""Esquemas base de Pydantic SOTA."""

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

TaskMetadata = dict[str, Any]


class Task(BaseModel):
    """Modelo SOTA de Tarefa para a fila."""

    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str = Field(..., pattern=r"^@[\w]+$")
    completedAt: str | None = None
    model: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description=("Metadados da tarefa, incluindo 'observers' para notificacoes e telemetria SOTA."),
    )

    @field_validator("agent")
    @classmethod
    def validate_agent_existence(cls, v: str) -> str:
        """Valida a consistencia do agente no core. Late import para respeitar hot-reload."""
        from core.config import VALID_AGENTS as _LIVE_AGENTS  # noqa: PLC0415 # pylint: disable=import-outside-toplevel

        if v not in _LIVE_AGENTS:
            raise ValueError(f"Agente desconhecido: {v}")
        return v


class GeneralTelemetry(BaseModel):
    """Esquema SOTA para Telemetria Geral/UI/Quiz (Paridade Zod)."""

    category: Literal[
        "quiz",
        "simulator",
        "performance",
        "error",
        "Risk Premium",
        "Fundamentos SOTA",
        "Bolha",
        "Pos-Flop",
    ]
    componentName: str | None = None
    scenarioContext: dict[str, Any] | list[Any] | str | None = None
    userAction: str | None = None
    optimalAction: str | None = None
    evLoss: float = 0.0
    isCorrect: bool = True
    latency: float = 0.0
    metadata: dict[str, Any] | None = None

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, v: str) -> str:
        """Normaliza categorias para o padrao SOTA (ASCII)."""
        mapping = {
            "Pós-Flop": "Pos-Flop",
            "Pos Flop": "Pos-Flop",
        }
        return mapping.get(v, v)


class SOTAMetrics(BaseModel):
    """Isomorfismo SOTA: Schema compartilhado para metrica de IA."""

    esperanca: float = Field(..., description="Vetor de ganho esperado (PM)")
    expectativa: float = Field(..., description="Vetor bruto de EV")
    perspectiva: float = Field(..., description="Expectativa ajustada por risco RIO")
    ci: float = Field(..., description="Coeficiente de Insolvencia")
    is_solvent: bool
    is_actionable: bool


class RAGQuery(BaseModel):
    """Schema para consultas RAG (Retrieval Augmented Generation)."""

    query: str
    top_k: int = 5
    threshold: float = 0.75
    metadata_filter: dict[str, Any] | None = None


class LLMConfig(BaseModel):
    """Configuracao de hardware para VRAM e RAM."""

    vram_limit_gb: int = 12
    ram_reserve_gb: int = 4
    gpu_layers: int = 32
    context_window: int = 8192


class PerspectivaResult(BaseModel):
    """Resultado unificado do Motor de Perspectiva (Paridade Zod)."""

    handEquity: float
    currentEquityPct: float
    deltaWinPct: float
    deltaLosePct: float
    deltaFoldPct: float
    valuation: float
    rioLiability: float
    fgsHealth: float
    survivalPressure: float
    dynamicEvFold: float
    perspectivaPct: float
    amortizedEdge: float
    ci: float
    marginInstability: float
    threshEq: float
    realizationFactor: float
    isActionBetterThanFold: bool
    diagnostico: str
    bountyPower: float
    currentMapaICM: list[float]
    winMapaICM: list[float]
    loseMapaICM: list[float]


class InsolvencyMetrics(BaseModel):
    """Estrutura detalhada de insolvencia."""

    potOddsRatio: float
    perspectiveUtility: float
    insolvencyCoefficient: float | None = None
    isViable: bool


class PerspectiveMetric(BaseModel):
    """Esquema SOTA para Metricas de Perspectiva (Paridade Zod)."""

    scenarioId: str | None = None
    baseState: dict[str, float] = Field(..., description="chipEvFold, icmValuation")
    dynamicModifiers: dict[str, float] = Field(
        ...,
        description="timeToBlindJumpMinutes, payjumpProximityFactor, positionalUrgency",
    )
    structuralLiabilities: dict[str, float] = Field(..., description="multiwayOpponents, reverseImpliedOddsPenalty")
    edgeRelative: dict[str, float] = Field(..., description="stackDepthBb, humanNoiseFactor, technicalSuperiority")
    insolvency: InsolvencyMetrics

    def flatten(self) -> dict[str, Any]:
        """Achata a estrutura para persistencia no SQLite/CSV."""
        return {
            "scenarioId": self.scenarioId,
            **self.baseState,
            **self.dynamicModifiers,
            **self.structuralLiabilities,
            **self.edgeRelative,
            **self.insolvency.model_dump(),
        }
