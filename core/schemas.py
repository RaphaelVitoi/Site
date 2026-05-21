"""Esquemas base de Pydantic SOTA."""

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from core.config import VALID_AGENTS

TaskMetadata = dict[str, Any]


class Task(BaseModel):
    """Modelo SOTA de Tarefa para a fila."""

    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = (
        "pending"
    )
    timestamp: str
    agent: str = Field(..., pattern=r"^@[\w]+$")
    completedAt: str | None = None
    model: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Metadados da tarefa, incluindo 'observers' "
            "para notificacoes e telemetria SOTA."
        ),
    )

    @field_validator("agent")
    @classmethod
    def validate_agent_existence(cls, v: str) -> str:
        """Valida a consistencia do agente no core."""
        if v not in VALID_AGENTS:
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
        "Pós-Flop",
    ]
    componentName: str | None = None
    scenarioContext: dict[str, Any] | list[Any] | str | None = None
    userAction: str | None = None
    optimalAction: str | None = None
    evLoss: float = 0.0
    isCorrect: bool = True
    latency: float = 0.0
    metadata: dict[str, Any] | None = None


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
    insolvencyCoefficient: float
    isViable: bool


class PerspectiveMetric(BaseModel):
    """Esquema SOTA para Metricas de Perspectiva (Paridade Zod)."""

    scenarioId: str | None = None
    baseState: dict[str, float] = Field(..., description="chipEvFold, icmValuation")
    dynamicModifiers: dict[str, float] = Field(
        ...,
        description="timeToBlindJumpMinutes, payjumpProximityFactor, positionalUrgency",
    )
    structuralLiabilities: dict[str, float] = Field(
        ..., description="multiwayOpponents, reverseImpliedOddsPenalty"
    )
    edgeRelative: dict[str, float] = Field(
        ..., description="stackDepthBb, humanNoiseFactor, technicalSuperiority"
    )
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
