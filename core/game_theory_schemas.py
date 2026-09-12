"""Esquemas Pydantic v2 para Motores de Teoria dos Jogos (Pluribus, DeepStack, ReBeL, Claudico).

Protocolo Chico SOTA v8.0 GOLD.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StreetEnum(StrEnum):
    """Ruas canonicas de Texas Hold'em."""

    PREFLOP = "preflop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"


# ==============================================================================
# 1. PLURIBUS SCHEMAS (Multiway Solving & Depth-Limited CFR)
# ==============================================================================


class PluribusMultiwayStateSchema(BaseModel):
    """Estado do pote e jogadores para subjogos multiway."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1, description="Tamanho do pote em big blinds ou fichas.")
    num_players: int = Field(..., ge=2, le=10, description="Numero total de jogadores ativos na mao.")
    street: StreetEnum = Field(StreetEnum.FLOP, description="Rua atual do subjogo.")
    active_stacks: list[float] = Field(..., min_length=2, description="Stacks ativos dos jogadores na mao.")
    lambda_factor: float = Field(2.25, ge=1.0, le=5.0, description="Fator de aversao a risco PMev multiway.")


class PluribusSolveRequest(BaseModel):
    """Requisicao para resolucao multiway depth-limited no estilo Pluribus."""

    model_config = ConfigDict(allow_inf_nan=False)

    state: PluribusMultiwayStateSchema = Field(..., description="Estado multiway do jogo.")
    equity: float = Field(..., ge=0.0, le=1.0, description="Equidade nominal do Hero [0.0 - 1.0].")
    hero_position: str = Field("BTN", description="Posicao do Hero (ex: BTN, CO, MP, UTG, SB, BB).")
    depth_streets: int = Field(1, ge=1, le=3, description="Profundidade do horizonte de busca em streets.")
    iterations: int = Field(50, ge=1, le=1000, description="Numero de iteracoes do self-play CFR+.")


class PluribusSolveResponse(BaseModel):
    """Resposta com a estrategia calculada e metricas de passivo multiway."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    optimal_action: str = Field(..., description="Acao otima convergida (FOLD, CALL, RAISE_POT).")
    strategy: dict[str, float] = Field(..., description="Distribuicao de probabilidade sobre as acoes validas.")
    structural_liability: float = Field(..., description="Passivo estrutural multiway N^2 deduzido do EV.")
    effective_equity: float = Field(..., description="Equidade efetiva corrigida por posicao e passivo multiway.")
    depth_streets: int = Field(..., description="Profundidade simulada.")
    iterations_run: int = Field(..., description="Iteracoes de CFR+ executadas.")
    execution_time_ms: float = Field(..., description="Tempo de calculo em milissegundos.")
    error: str | None = None


# ==============================================================================
# 2. DEEPSTACK SCHEMAS (Continual Resolving & Gadget Game Bounds)
# ==============================================================================


class DeepStackResolveRequest(BaseModel):
    """Requisicao para Continual Resolving com restricoes de Gadget Game."""

    model_config = ConfigDict(allow_inf_nan=False)

    street: StreetEnum = Field(StreetEnum.FLOP, description="Street do subgame local.")
    pot: float = Field(..., ge=0.1, description="Tamanho do pote em big blinds.")
    ranges_ip: dict[str, float] = Field(
        ..., min_length=1, description="Distribuicao de probabilidade de maos do jogador Em Posicao (IP)."
    )
    ranges_oop: dict[str, float] = Field(
        ..., min_length=1, description="Distribuicao de probabilidade de maos do jogador Fora de Posicao (OOP)."
    )
    opponent_cfvs: dict[str, float] = Field(
        default_factory=dict,
        description="Contra-valores esperados do oponente (CBV) vindos da arvore mestre.",
    )
    iterations: int = Field(100, ge=1, le=2000, description="Numero de iteracoes de amortecimento/resolucao.")


class DeepStackResolveResponse(BaseModel):
    """Resultado da resolucao continua DeepStack."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    street: StreetEnum
    pot: float
    gadget_game_bounds: dict[str, float] = Field(
        ..., description="Limites de contra-valor calculados para o oponente (garantia de subgame safety)."
    )
    strategy: dict[str, dict[str, float]] = Field(
        ..., description="Mapeamento de mao para distribuicao sobre [CHECK, BET_HALF_POT, BET_POT, ALL_IN]."
    )
    aggregated_action_frequencies: dict[str, float] = Field(
        ..., description="Frequencia global ponderada de cada acao no range do Hero."
    )
    iterations_run: int
    execution_time_ms: float
    error: str | None = None


# ==============================================================================
# 3. REBEL SCHEMAS (Public Belief State & Entropy Tracking)
# ==============================================================================


class RebelPbsEvaluateRequest(BaseModel):
    """Requisicao para avaliacao e tracking de Public Belief State."""

    model_config = ConfigDict(allow_inf_nan=False)

    board: list[str] = Field(
        default_factory=list, description="Cartas comunitarias conhecidas (ex: ['Ah', 'Kd', '2c'])."
    )
    pot: float = Field(..., ge=0.0, description="Tamanho atual do pote.")
    hero_range: dict[str, float] = Field(..., min_length=1, description="Distribuicao de range do Hero.")
    villain_range: dict[str, float] = Field(..., min_length=1, description="Distribuicao de range do Villain.")


class RebelPbsEvaluateResponse(BaseModel):
    """Resultado do calculo do Public Belief State."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    board: list[str]
    pot: float
    hero_range_entropy: float = Field(..., description="Entropia de Shannon (bits) do range do Hero.")
    villain_range_entropy: float = Field(..., description="Entropia de Shannon (bits) do range do Villain.")
    is_terminal: bool = Field(False, description="Indica se o estado e terminal (showdown/fold).")
    board_card_count: int
    normalized_ranges_valid: bool = Field(..., description="Validacao de normalizacao das probabilidades.")
    entropy_delta_alert: str | None = Field(
        None, description="Alerta caso a entropia do oponente indique polarizacao extrema."
    )
    error: str | None = None


# ==============================================================================
# 4. CLAUDICO SCHEMAS (Action Translation & Board Abstraction)
# ==============================================================================


class ClaudicoTranslateRequest(BaseModel):
    """Requisicao de mapeamento pseudo-harmonico de aposta continua off-tree."""

    model_config = ConfigDict(allow_inf_nan=False)

    actual_bet: float = Field(..., ge=0.0, description="Valor da aposta real recebida.")
    allowed_bets: list[float] = Field(..., min_length=1, description="Apostas permitidas no no discreto do solver.")
    pot_size: float = Field(..., ge=0.1, description="Tamanho do pote.")


class ClaudicoTranslateResponse(BaseModel):
    """Mapeamento probabilistico sobre as apostas discretas vizinhas."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    mapped_distribution: dict[float, float] = Field(..., description="Pesos atribuidos a cada aposta permitida.")
    target_bet: float
    error: str | None = None
