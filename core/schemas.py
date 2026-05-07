from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from core.config import VALID_AGENTS


class Task(BaseModel):
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
        description="Metadados da tarefa, incluindo 'observers' para notificacoes e telemetria SOTA.",
    )

    @field_validator("agent")
    @classmethod
    def validate_agent_existence(cls, v: str) -> str:
        if v not in VALID_AGENTS:
            raise ValueError(f"Agente desconhecido: {v}")
        return v
