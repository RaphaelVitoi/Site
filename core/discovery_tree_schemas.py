"""Esquemas Pydantic v2 para a Arvore de Descoberta do Dream-RSI.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Pydantic v2.
"""
# pylint: disable=no-member

from __future__ import annotations

import copy
from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FrozenDict(dict):
    """Mapeamento profundamente imutavel para proteger registros de replay contra mutacao."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        initial = dict(*args, **kwargs)
        frozen: dict[Any, Any] = {}
        for k, v in initial.items():
            if isinstance(v, dict):
                frozen[k] = FrozenDict(v)
            elif isinstance(v, (list, tuple)):
                frozen[k] = tuple(FrozenDict(x) if isinstance(x, dict) else copy.deepcopy(x) for x in v)
            else:
                frozen[k] = copy.deepcopy(v)
        super().__init__(frozen)

    def __setitem__(self, _key: Any, _value: Any) -> None:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def __delitem__(self, _key: Any) -> None:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def pop(self, *_args: Any, **_kwargs: Any) -> Any:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def popitem(self) -> tuple[Any, Any]:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def clear(self) -> None:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def update(self, *_args: Any, **_kwargs: Any) -> None:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def setdefault(self, *_args: Any, **_kwargs: Any) -> Any:
        raise TypeError("FrozenDict is immutable and cannot be modified")

    def __copy__(self) -> FrozenDict:
        return self

    def __deepcopy__(self, _memo: dict[int, Any]) -> FrozenDict:
        return self


class DiscoveryNode(BaseModel):
    """No individual dentro da Arvore de Descoberta (Discovery Tree)."""

    model_config = ConfigDict(frozen=True)

    node_id: str = Field(..., description="Hash identificador unico do no")
    parent_id: str | None = Field(default=None, description="ID do no pai ou None para a raiz")
    depth: int = Field(default=0, ge=0, description="Profundidade do no na arvore")
    domain: Literal["pmev_math", "code_engineering", "jules_cloud", "web_vitals"] = Field(
        ..., description="Dominio de descoberta da exploracao"
    )
    action_type: str = Field(..., description="Tipo de acao executada (ex: branch, refine, test, eval)")
    action_payload: dict[str, Any] = Field(default_factory=dict, description="Parametros ou configuracao da acao")
    status: Literal["success", "compiler_error", "test_failure", "anchor_collision", "pruned"] = Field(
        ..., description="Resultado real da execucao no ambiente"
    )
    metric_score: float = Field(..., description="Pontuacao normalizada obtida nesta tentativa")
    runtime_ms: float = Field(default=0.0, ge=0.0, description="Tempo real de execucao medido em milissegundos")
    tokens_consumed: int = Field(default=0, ge=0, description="Tokens consumidos nesta tentativa")
    created_at: str = Field(
        default_factory=lambda: datetime.now(UTC).isoformat(),
        description="Timestamp ISO 8601 UTC",
    )

    @field_validator("action_payload", mode="after")
    @classmethod
    def _freeze_payload(cls, v: Any) -> FrozenDict:
        return FrozenDict(v)


class DiscoveryTree(BaseModel):
    """Arvore de Descoberta completa persistida em historico."""

    model_config = ConfigDict(frozen=True)

    tree_id: str = Field(..., description="ID unico da arvore de descoberta")
    root_id: str = Field(..., description="ID do no raiz")
    domain: Literal["pmev_math", "code_engineering", "jules_cloud", "web_vitals"] = Field(
        ..., description="Dominio da arvore"
    )
    nodes: dict[str, DiscoveryNode] = Field(
        default_factory=dict, description="Mapeamento de node_id para DiscoveryNode"
    )
    created_at: str = Field(
        default_factory=lambda: datetime.now(UTC).isoformat(),
        description="Timestamp de criacao da arvore",
    )

    @field_validator("nodes", mode="after")
    @classmethod
    def _freeze_nodes(cls, v: Any) -> FrozenDict:
        return FrozenDict(v)

    def get_children(self, node_id: str) -> list[DiscoveryNode]:
        """Retorna os nos filhos imediatos de um dado no."""
        return [node for node in self.nodes.values() if node.parent_id == node_id]

    def get_leaf_nodes(self) -> list[DiscoveryNode]:
        """Retorna todos os nos folha (sem filhos) na arvore."""
        parent_ids = {node.parent_id for node in self.nodes.values() if node.parent_id is not None}
        return [node for node in self.nodes.values() if node.node_id not in parent_ids]

    def best_node(self) -> DiscoveryNode | None:
        """Retorna o no com a maior pontuacao de metrica (status=success)."""
        valid_nodes = [node for node in self.nodes.values() if node.status == "success"]
        if not valid_nodes:
            return None
        return max(valid_nodes, key=lambda n: n.metric_score)


class ReplayEvaluationResult(BaseModel):
    """Resultado da avaliacao de uma politica candidata sobre o Replay Simulator."""

    model_config = ConfigDict(frozen=True)

    policy_name: str = Field(..., description="Nome da politica avaliada")
    total_score: float = Field(..., description="Pontuacao agregada obtida pela politica")
    nodes_evaluated: int = Field(..., ge=0, description="Quantidade de nos avaliados")
    simulated_runtime_ms: float = Field(..., ge=0.0, description="Tempo simulado total")
    simulated_tokens_saved: int = Field(..., ge=0, description="Estimativa de tokens economizados")
    pruned_nodes_count: int = Field(..., ge=0, description="Quantidade de nos podados antes da execucao")
    best_node_id: str | None = Field(default=None, description="Melhor no alcancado pela politica")
    best_node_metric: float = Field(default=0.0, description="Pontuacao metrica do melhor no alcancado")
