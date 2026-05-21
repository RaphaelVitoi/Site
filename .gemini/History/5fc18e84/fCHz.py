from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.perspective_engine import PerspectiveEngine

router = APIRouter(prefix="/api/perspective", tags=["Quantum Physics"])

class QuantumMetricsRequest(BaseModel):
    eq: float
    delta_win_pct: float
    delta_lose_pct: float
    ev_fold_pct: float
    r_factor: float
    fgs_health: float
    delta_habilidade: float
    s_eff: float
    active_players: int
    hero_cost: float
    pot_size: float
    k: float = 0.05
    base_rio_pct: float = 0.15

@router.post("/evaluate")
async def evaluate_perspective(req: QuantumMetricsRequest):
    try:
        metrics = PerspectiveEngine.calculate_quantum_metrics(**req.model_dump())
        return {"status": "SUCCESS", "data": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
