from typing import Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from core.config import VALID_AGENTS

class Task(BaseModel):
    id: str
    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str = Field(..., pattern=r"^@[\w]+$")
    completedAt: Optional[str] = None
    model: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('agent')
    @classmethod
    def validate_agent_existence(cls, v: str) -> str:
        if v not in VALID_AGENTS:
            raise ValueError(f"Agente desconhecido: {v}")
        return v