# core/perspective_schemas.py
# ruff: noqa: N815
"""
Esquemas Pydantic v2 para o Motor de Perspectiva Matematica (PMev)
e Importacao Universal de Solvers (DeepSolver, GTOWizard, Monker, HRC Pro, PioSolver).
"""

from typing import Any, Literal
from pydantic import BaseModel, Field


SolverType = Literal["deep_solver", "gtowizard", "monker_solver", "hrc_pro", "pio_solver", "auto"]


class PerspectiveCalculationRequest(BaseModel):
    """Requisicao para calculo pontual da Perspectiva Matematica (PMev)."""

    equity: float = Field(..., ge=0.0, le=1.0, description="Equidade nominal de showdown [0.0 - 1.0]")
    realization_factor: float = Field(1.0, ge=0.1, le=2.5, description="Fator de Realizacao R de equidade")
    valuation_stack: float = Field(1.0, ge=0.01, description="Valuation marginal monetario")
    base_antes: float = Field(1.0, ge=0.0, description="Custo base da rodada em antes/blinds")
    time_to_blind_minutes: float = Field(10.0, ge=0.0, description="Minutos restantes ate o aumento dos blinds")
    payjump_proximity_factor: float = Field(0.5, ge=0.0, le=1.0, description="Proximidade do payjump [0.0 - 1.0]")
    position: str = Field("BTN", description="Posicao do Hero na mesa (ex: UTG, BTN, SB, BB)")
    multiway_opponents: int = Field(1, ge=1, le=9, description="Numero de oponentes ativos no pote")
    base_rio: float = Field(0.0, ge=0.0, description="Coeficiente base de Reverse Implied Odds")
    stack_depth_bb: float = Field(25.0, ge=0.1, description="Profundidade do stack efetivo em big blinds")
    edge_base: float = Field(0.05, ge=0.0, description="Edge base tecnico do jogador")
    aggression_factor: float = Field(1.5, ge=0.0, description="Fator de agressividade do cenario")
    loss_aversion_base: float = Field(2.25, ge=1.0, description="Coeficiente de aversao a perda de Kahneman")
    pot_size: float = Field(10.0, ge=0.1, description="Tamanho do pote em big blinds")
    hero_invested: float = Field(0.0, ge=0.0, description="Quantidade ja investida pelo Hero no pote")


class PerspectivaResult(BaseModel):
    """Resultado do calculo da Perspectiva Matematica PMev."""

    pmev: float = Field(..., description="Valor computado da Perspectiva Matematica")
    dynamic_ev_fold: float = Field(..., description="Custo dinamico de sobrevivencia (EV do fold)")
    structural_liability: float = Field(..., description="Passivo estrutural multiway N^2")
    amortized_edge: float = Field(..., description="Edge amortizado pela profundidade de stack")
    risk_advantage: float = Field(..., description="Risk Advantage em porcentagem")
    required_equity: float = Field(..., description="Equidade necessaria corrigida por ICM/PMev")
    bubble_factor: float = Field(..., description="Bubble Factor computado")
    utility_win: float = Field(..., description="Utilidade prospectiva em caso de vitoria")
    utility_lose: float = Field(..., description="Utilidade prospectiva em caso de derrota")
    optimal_action: str = Field(..., description="Acao recomendada pelo motor (FOLD, CALL, RAISE)")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Metadados adicionais de calculo")


class PerspectiveTreeRequest(BaseModel):
    """Requisicao para simulacao de arvore recursiva de decisao."""

    equity: float = Field(..., ge=0.0, le=1.0)
    pot_size: float = Field(..., ge=0.1)
    stack_eff: float = Field(..., ge=0.1)
    active_players: int = Field(2, ge=2, le=10)
    street_idx: int = Field(0, ge=0, le=3, description="0=Preflop/Flop, 1=Turn, 2=River")
    hero_invested: float = Field(0.0, ge=0.0)
    ev_fold_dynamic: float | None = Field(None, description="EV fold pre-calculado ou derivado")
    position: str = Field("BTN")
    realization_factor: float = Field(1.0)
    valuation_stack: float = Field(1.0)
    edge_base: float = Field(0.05)
    aggression_factor: float = Field(1.5)
    base_rio: float = Field(0.0)
    loss_aversion_base: float = Field(2.25)
    fgs_health: float = Field(1.0)
    rp_opp: float = Field(20.0)
    fold_equity: float = Field(0.30)


class DecisionNodeResponse(BaseModel):
    """No individual da arvore de decisao recursiva."""

    node_id: str
    street: str
    pot_size: float
    stack_eff: float
    pm_fold: float
    pm_call: float
    pm_raise: float
    pm_best: float
    best_action: str
    p_best_outcome: float


class PerspectiveTreeResponse(BaseModel):
    """Resposta com arvore e ramificacoes computadas."""

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    tree_result: dict[str, Any]
    summary: dict[str, Any] = Field(default_factory=dict)


class SolverNode(BaseModel):
    """No normalizado de arvore de solver."""

    node_id: str
    player: str = Field(..., description="IP, OOP, SB, BB ou identificador da posicao")
    street: str = Field(..., description="preflop, flop, turn, river")
    pot: float
    actions: list[str] = Field(default_factory=list)
    strategy: dict[str, float] = Field(default_factory=dict, description="Frequencia por acao [0.0 - 1.0]")
    ev: dict[str, float] = Field(default_factory=dict, description="EV esperado por acao")
    range_equity: float | None = None
    children: list[str] = Field(default_factory=list, description="IDs dos nos filhos")


class NormalizedGameTree(BaseModel):
    """Arvore de jogo normalizada universal."""

    solver_type: SolverType
    source_format: str
    game_type: str = "MTT"
    num_players: int = 2
    board: list[str] = Field(default_factory=list)
    starting_pot: float = 0.0
    stacks: dict[str, float] = Field(default_factory=dict)
    nodes: dict[str, SolverNode] = Field(default_factory=dict)
    root_node_id: str = "root"
    pmev_converted_nodes: dict[str, PerspectivaResult] = Field(default_factory=dict)


class SolverImportRequest(BaseModel):
    """Requisicao para importacao de arvore de solver."""

    solver_type: SolverType = "auto"
    raw_content: str = Field(..., min_length=5, description="Conteudo bruto do solver (JSON, CSV ou texto formatado)")
    tournament_context: dict[str, Any] = Field(default_factory=dict, description="Parametros de torneio (prizes, stacks, antes)")


class SolverImportResponse(BaseModel):
    """Resposta da importacao e normalizacao de solver."""

    status: Literal["SUCCESS", "ERROR"]
    solver_type: SolverType
    tree: NormalizedGameTree | None = None
    node_count: int = 0
    error: str | None = None
