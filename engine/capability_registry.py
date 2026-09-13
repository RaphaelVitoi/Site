"""Registro tipado e fail-closed das capacidades matematicas do Site.

O manifesto declara o que o codigo pode executar. Ele nao prova que um runtime,
servico externo ou conjunto de pesos esteja ativo no momento da leitura.
"""

from __future__ import annotations

from enum import StrEnum
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

MANIFEST_PATH = Path(__file__).resolve().parents[1] / "data" / "engine_capabilities.json"


class ImplementationLevel(StrEnum):
    """Nivel de realizacao computacional, sem inferir fidelidade pelo nome."""

    ANALYTIC = "analytic"
    HEURISTIC = "heuristic"
    ADAPTER = "adapter"
    SIMULATION = "simulation"
    TRAINED_MODEL = "trained-model"
    FULL_SOLVER = "full-solver"
    PRIMITIVE = "primitive"


class EngineCapability(BaseModel):
    """Contrato estatico de uma capacidade integrada."""

    model_config = ConfigDict(extra="forbid")

    engine_id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    display_name: str = Field(min_length=1)
    family: Literal["pmev", "cfr", "canonical", "forecast", "adapter"]
    implementation_level: ImplementationLevel
    runtime_availability: Literal["code-available", "runtime-dependent", "external-dependency"]
    runtimes: list[str] = Field(min_length=1)
    source_lineage: list[str] = Field(min_length=1)
    safe_label: str = Field(min_length=1)
    claims_allowed: list[str] = Field(min_length=1)
    causal_parameters: list[str]
    reserved_parameters: list[str]
    units: list[str] = Field(min_length=1)
    provenance_requirements: list[str] = Field(min_length=1)
    assumptions: list[str] = Field(min_length=1)
    limitations: list[str] = Field(min_length=1)
    consumer_paths: list[str] = Field(min_length=1)
    api_routes: list[str]
    fallback_engine_id: str | None

    @model_validator(mode="after")
    def validate_parameter_roles(self) -> EngineCapability:
        """Um parametro nao pode ser simultaneamente causal e reservado."""
        overlap = set(self.causal_parameters) & set(self.reserved_parameters)
        if overlap:
            raise ValueError(f"parameter roles overlap: {sorted(overlap)}")
        return self


class EngineCapabilityManifest(BaseModel):
    """Fonte unica versionada das capacidades de teoria e previsao."""

    model_config = ConfigDict(extra="forbid")

    manifest_version: str = Field(pattern=r"^\d+\.\d+\.\d+$")
    governance: str = Field(min_length=1)
    updated_at: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    runtime_probe_required: bool
    provenance_fields: list[str] = Field(min_length=1)
    capabilities: list[EngineCapability] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_unique_engine_ids(self) -> EngineCapabilityManifest:
        """IDs duplicados tornariam selecao e proveniencia ambiguas."""
        ids = [capability.engine_id for capability in self.capabilities]
        duplicates = sorted({engine_id for engine_id in ids if ids.count(engine_id) > 1})
        if duplicates:
            raise ValueError(f"duplicate engine ids: {duplicates}")
        return self


@lru_cache(maxsize=1)
def load_engine_capability_manifest() -> EngineCapabilityManifest:
    """Carrega e valida o manifesto; formato invalido falha na inicializacao."""
    return EngineCapabilityManifest.model_validate_json(MANIFEST_PATH.read_text(encoding="utf-8"))


def get_engine_capability(engine_id: str) -> EngineCapability:
    """Resolve uma capacidade por identidade exata, sem fallback silencioso."""
    for capability in load_engine_capability_manifest().capabilities:
        if capability.engine_id == engine_id:
            return capability
    raise KeyError(f"unknown engine capability: {engine_id}")
