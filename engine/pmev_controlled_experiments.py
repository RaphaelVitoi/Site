"""Contratos de desenho para os experimentos controlados H3, H4 e H8.

Os contratos impedem que uma comparacao seja chamada de causal quando modifica
mais de uma variavel entre controle e tratamento. Eles nao substituem uma
exportacao de solver: registram o estado que a exportacao deve tornar
reproduzivel.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
from types import MappingProxyType
from typing import Any


class ExperimentHypothesis(StrEnum):
    """Hipoteses do primeiro protocolo controlado PMev."""

    H3_TEMPORAL_EROSION = "H3"
    H4_RIVER_DEFENSE = "H4"
    H8_DOWNWARD_DRIFT = "H8"


_ALLOWED_TREATMENT_FIELDS: dict[ExperimentHypothesis, frozenset[str]] = {
    ExperimentHypothesis.H3_TEMPORAL_EROSION: frozenset({"time_to_blind_jump_minutes"}),
    ExperimentHypothesis.H4_RIVER_DEFENSE: frozenset({"payouts"}),
    ExperimentHypothesis.H8_DOWNWARD_DRIFT: frozenset({"payouts", "utility_model"}),
}

_REQUIRED_FIELDS: dict[ExperimentHypothesis, frozenset[str]] = {
    ExperimentHypothesis.H3_TEMPORAL_EROSION: frozenset(
        {"stacks", "payouts", "positions", "blinds", "ranges", "betting_tree", "time_to_blind_jump_minutes"}
    ),
    ExperimentHypothesis.H4_RIVER_DEFENSE: frozenset(
        {"stacks", "payouts", "positions", "board", "ranges", "pot", "bet", "betting_tree", "equity_baseline"}
    ),
    ExperimentHypothesis.H8_DOWNWARD_DRIFT: frozenset(
        {"stacks", "payouts", "positions", "board", "ranges", "betting_tree", "utility_model"}
    ),
}

_MISSING = object()
_H4_EQUITY_BASELINE = "ICMev/Malmuth-Harville"


def _freeze(value: Any) -> Any:
    """Produz um snapshot recursivamente imutavel da entrada do experimento."""

    if isinstance(value, Mapping):
        return MappingProxyType({key: _freeze(item) for key, item in value.items()})
    if isinstance(value, (list, tuple)):
        return tuple(_freeze(item) for item in value)
    if isinstance(value, (set, frozenset)):
        return frozenset(_freeze(item) for item in value)
    return value


def _changed_fields(control: Mapping[str, Any], treatment: Mapping[str, Any]) -> set[str]:
    """Distingue explicitamente uma chave ausente de uma chave com valor ``None``."""

    return {
        field
        for field in set(control).union(treatment)
        if control.get(field, _MISSING) != treatment.get(field, _MISSING)
    }


@dataclass(frozen=True)
class ControlledExperimentSpec:
    """Par controle/tratamento com exatamente uma intervencao permitida."""

    hypothesis: ExperimentHypothesis
    control: Mapping[str, Any]
    treatment: Mapping[str, Any]
    primary_metric: str
    falsification_rule: str

    def __post_init__(self) -> None:
        object.__setattr__(self, "control", _freeze(self.control))
        object.__setattr__(self, "treatment", _freeze(self.treatment))
        required = _REQUIRED_FIELDS[self.hypothesis]
        missing_control = required.difference(self.control)
        missing_treatment = required.difference(self.treatment)
        if missing_control or missing_treatment:
            raise ValueError(
                f"{self.hypothesis} requer os mesmos campos em ambos os bracos: "
                f"controle ausente={sorted(missing_control)}, tratamento ausente={sorted(missing_treatment)}."
            )

        if self.hypothesis is ExperimentHypothesis.H4_RIVER_DEFENSE and (
            self.control["equity_baseline"] != _H4_EQUITY_BASELINE
            or self.treatment["equity_baseline"] != _H4_EQUITY_BASELINE
        ):
            raise ValueError("H4 exige baseline ICMev/Malmuth-Harville em ambos os bracos.")

        changed_fields = _changed_fields(self.control, self.treatment)
        allowed = _ALLOWED_TREATMENT_FIELDS[self.hypothesis]
        if not changed_fields:
            raise ValueError(f"{self.hypothesis} exige uma intervencao entre controle e tratamento.")
        if not changed_fields.issubset(allowed):
            raise ValueError(
                f"{self.hypothesis} alterou variaveis de confusao: {sorted(changed_fields.difference(allowed))}."
            )
        if len(changed_fields) != 1:
            raise ValueError(f"{self.hypothesis} exige exatamente uma intervencao; recebeu {sorted(changed_fields)}.")
        if not self.primary_metric.strip() or not self.falsification_rule.strip():
            raise ValueError("Todo experimento exige metrica primaria e regra de falsificacao.")

    @property
    def intervention_fields(self) -> tuple[str, ...]:
        """Campos que diferem entre os dois bracos, em ordem deterministica."""

        return tuple(sorted(_changed_fields(self.control, self.treatment)))
