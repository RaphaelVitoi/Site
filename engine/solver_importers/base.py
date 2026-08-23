# engine/solver_importers/base.py
"""
Classe base abstrata para importadores de solvers de poker profissional.
"""

from abc import ABC, abstractmethod
from typing import Any
from core.perspective_schemas import NormalizedGameTree, SolverNode, SolverType


class BaseSolverImporter(ABC):
    """Contrato base para parsing e normalizacao de saidas de solvers."""

    solver_type: SolverType = "auto"

    @abstractmethod
    def detect_format(self, raw_content: str) -> bool:
        """Retorna True se o conteudo bruto corresponder ao formato deste solver."""

    @abstractmethod
    def parse_tree(self, raw_content: str, tournament_context: dict[str, Any] | None = None) -> NormalizedGameTree:
        """Analisa o conteudo bruto e constroi uma NormalizedGameTree universal."""

    def sanitize_action_name(self, action: str) -> str:
        """Padroniza nomes de acao para FOLD, CHECK, CALL, BET, RAISE, ALLIN."""
        act = action.strip().upper()
        if "FOLD" in act:
            return "FOLD"
        if "CHECK" in act:
            return "CHECK"
        if "CALL" in act:
            return "CALL"
        if "ALL" in act or "SHOVE" in act:
            return "ALLIN"
        if "RAISE" in act:
            return "RAISE"
        if "BET" in act:
            return "BET"
        return act
