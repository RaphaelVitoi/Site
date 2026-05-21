from pydantic import BaseModel, Field
from typing import List, Optional

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
    metadata_filter: Optional[dict] = None

class LLMConfig(BaseModel):
    """Configuracao de hardware para VRAM e RAM."""
    vram_limit_gb: int = 12
    ram_reserve_gb: int = 4
    gpu_layers: int = 32
    context_window: int = 8192
