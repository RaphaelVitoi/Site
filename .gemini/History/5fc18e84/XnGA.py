from aiohttp import web
from pydantic import BaseModel
from core.perspective_engine import PerspectiveEngine

routes = web.RouteTableDef()

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

@routes.post("/api/perspective/evaluate")
async def evaluate_perspective(request: web.Request):
    try:
        data = await request.json()
        req = QuantumMetricsRequest(**data)
        metrics = PerspectiveEngine.calculate_quantum_metrics(**req.model_dump())
        return web.json_response({"status": "SUCCESS", "data": metrics})
    except Exception as e:
