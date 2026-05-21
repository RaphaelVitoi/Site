from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator


class Task(BaseModel):
    """
    Schema SOTA para uma tarefa no ecossistema.
    Centralizado em core/schemas.py para desacoplamento total.
    """
    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str
    completedAt: Optional[str] = None
    model: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('agent')
    @classmethod
    def validate_agent_format(cls, v: str) -> str:
        if not v.startswith("@"):
            raise ValueError(f"Nome de agente invalido: '{v}'. Deve comecar com '@'.")
        return v
