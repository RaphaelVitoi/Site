# core/canonical_theory_schemas.py
"""Esquemas Pydantic v2 para Teoria Canonica de Poker (Chen & Ankenman 2006, Janda 2013).

Protocolo Chico SOTA v8.0 GOLD -- Validacao Estrita (allow_inf_nan=False).
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


# ==============================================================================
# 1. CHEN & ANKENMAN SCHEMAS (The Mathematics of Poker)
# ==============================================================================


class ChenClairvoyanceRequest(BaseModel):
    """Requisicao para solucao analitica do Clairvoyance Game [0, 1]."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1, description="Tamanho do pote.")
    bet: float = Field(..., ge=0.1, description="Tamanho da aposta.")


class ChenClairvoyanceResponse(BaseModel):
    """Resposta com o equilibrio analitico do Clairvoyance Game."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    pot: float
    bet: float
    alpha: float = Field(..., description="Pot odds oferecidas ao defensor: B / (P + B).")
    defense_frequency: float = Field(..., description="Frequencia de defesa indiferente do defensor: P / (P + B).")
    value_bet_cutoff: float = Field(..., description="Cutoff de valor no espaco [0, 1].")
    bluff_cutoff: float = Field(..., description="Cutoff de blefe no espaco [0, 1].")
    game_value_player_x: float = Field(..., description="Valor analitico do jogo para o atacante X.")
    bluff_to_value_ratio: float = Field(..., description="Razao de blefe para valor.")
    error: str | None = None


class ChenAKQGameRequest(BaseModel):
    """Requisicao para solucao analitica do Jogo AKQ."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1, description="Tamanho do pote.")
    bet: float = Field(1.0, ge=0.1, description="Tamanho da aposta unitaria.")


class ChenAKQGameResponse(BaseModel):
    """Resposta com as frequencias de equilibrio de Nash do Jogo AKQ."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    pot: float
    bet: float
    hero_bet_ace_freq: float
    hero_check_king_freq: float
    hero_bluff_queen_freq: float
    villain_call_ace_freq: float
    villain_call_king_freq: float
    villain_fold_queen_freq: float
    game_value_hero: float
    error: str | None = None


class ChenIndifferenceRequest(BaseModel):
    """Requisicao para verificacao formal das condicoes de indiferenca de Nash."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1)
    bet: float = Field(..., ge=0.1)
    defender_call_prob: float = Field(..., ge=0.0, le=1.0)
    bluffer_bluff_prob: float = Field(..., ge=0.0, le=1.0)


class ChenIndifferenceResponse(BaseModel):
    """Resultado da verificacao de indiferenca."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    ev_bluff: float
    ev_check_giveup: float
    is_bluff_indifferent: bool
    ev_call_bluffcatcher: float
    ev_fold_bluffcatcher: float
    is_defense_indifferent: bool
    indifference_margin: float
    error: str | None = None


# ==============================================================================
# 2. MATTHEW JANDA SCHEMAS (Applications of No-Limit Hold'em)
# ==============================================================================


class JandaMDFRequest(BaseModel):
    """Requisicao para calculo de Minimum Defense Frequency (MDF)."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1, description="Tamanho do pote.")
    bet: float = Field(..., ge=0.01, description="Tamanho da aposta enfrentada.")
    num_defenders: int = Field(1, ge=1, le=9, description="Numero de defensores ativos (multiway).")


class JandaMDFResponse(BaseModel):
    """Resposta do calculo de MDF e responsabilidade defensiva."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    pot: float
    bet: float
    alpha: float
    mdf: float
    mdf_percentage: float
    pot_odds_percentage: float
    is_multiway: bool
    num_defenders: int
    individual_mdf: float
    error: str | None = None


class JandaGeometricStepSchema(BaseModel):
    """Passo individual da progressao geometrica de apostas."""

    model_config = ConfigDict(allow_inf_nan=False)

    street_index: int
    street_name: str
    starting_pot: float
    bet_size: float
    pot_fraction: float
    final_pot_if_called: float
    remaining_stack_after_bet: float


class JandaGeometricSizingRequest(BaseModel):
    """Requisicao para calculo de Dimensionamento Geometrico de Apostas."""

    model_config = ConfigDict(allow_inf_nan=False)

    pot: float = Field(..., ge=0.1, description="Tamanho inicial do pote.")
    effective_stack: float = Field(..., ge=0.1, description="Stack efetivo inicial.")
    num_streets: int = Field(3, ge=1, le=5, description="Numero de streets restantes ate o All-in.")


class JandaGeometricSizingResponse(BaseModel):
    """Resposta com a progressao geometrica rua a rua."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    starting_pot: float
    effective_stack: float
    target_final_pot: float
    num_streets: int
    constant_pot_fraction: float
    pot_fraction_percentage: float
    steps: list[JandaGeometricStepSchema]
    error: str | None = None


class JandaBluffRatioRequest(BaseModel):
    """Requisicao para calculo de razoes de blefe por rua."""

    model_config = ConfigDict(allow_inf_nan=False)

    bet_fraction_of_pot: float = Field(..., ge=0.01, le=10.0, description="Fracao da aposta em relacao ao pote.")


class JandaBluffRatioResponse(BaseModel):
    """Resposta com as proporcoes de blefe para Flop, Turn e River."""

    model_config = ConfigDict(allow_inf_nan=False)

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    bet_fraction_of_pot: float
    alpha: float
    river_bluff_to_value_ratio: float
    river_bluff_percentage: float
    turn_bluff_to_value_ratio: float
    turn_bluff_percentage: float
    flop_bluff_to_value_ratio: float
    flop_bluff_percentage: float
    error: str | None = None
