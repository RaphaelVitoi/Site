"""Registro unico das hipoteses falsificaveis H1-H12 da PMev.

Item 2 da ordem vinculante do handoff-2026-09-13-integracao-paralela-pmev-engines:
uma fonte estruturada, e as representacoes documentais geradas a partir dela.

Fonte: `data/pmev_hypotheses.json`. A tabela da secao 3 de
`docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md` e gerada por
`render_markdown_table` entre os marcadores `TABLE_BEGIN` e `TABLE_END`;
`tests/test_pmev_hypotheses.py` reprova se as duas divergirem.

O campo `estado_evidencia` existe para impedir que implementar uma formula seja
lido como testar a hipotese. Hoje nenhuma hipotese tem evidencia reproduzivel.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Final

RAIZ: Final[Path] = Path(__file__).resolve().parents[1]
REGISTRY_PATH: Final[Path] = RAIZ / "data" / "pmev_hypotheses.json"
DOC_PATH: Final[Path] = RAIZ / "docs" / "research" / "pmev" / "ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md"
TABLE_BEGIN: Final[str] = "<!-- pmev-hypotheses:begin (gerado de data/pmev_hypotheses.json; nao editar a mao) -->"
TABLE_END: Final[str] = "<!-- pmev-hypotheses:end -->"
EXPECTED_IDS: Final[tuple[str, ...]] = tuple(f"H{i}" for i in range(1, 13))

__all__ = [
    "DOC_PATH",
    "EXPECTED_IDS",
    "REGISTRY_PATH",
    "TABLE_BEGIN",
    "TABLE_END",
    "EvidenceState",
    "Hypothesis",
    "extract_doc_table",
    "load_registry",
    "render_markdown_table",
]


class EvidenceState(StrEnum):
    NONE = "sem_evidencia"
    TRANSCRIBED = "evidencia_transcrita_nao_reproduzivel"
    REPRODUCIBLE = "evidencia_reproduzivel"


_ROTULO: Final[dict[EvidenceState, str]] = {
    EvidenceState.NONE: "sem evidencia",
    EvidenceState.TRANSCRIBED: "transcrita, nao reproduzivel",
    EvidenceState.REPRODUCIBLE: "reproduzivel",
}

_CAMPOS_TEXTO: Final[tuple[str, ...]] = ("enunciado", "baseline", "criterio_falsificacao", "onde_testar", "nota")


@dataclass(frozen=True, slots=True)
class Hypothesis:
    id: str
    enunciado: str
    baseline: str
    criterio_falsificacao: str
    onde_testar: str
    estado_evidencia: EvidenceState
    implementacoes: tuple[str, ...]
    nota: str


def load_registry(path: Path = REGISTRY_PATH, raiz: Path = RAIZ) -> tuple[Hypothesis, ...]:
    """Le e valida o registro. Falha fechado: qualquer desvio levanta ValueError."""
    try:
        bruto = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Registro de hipoteses ilegivel em {path}: {exc}") from exc
    itens = bruto.get("hipoteses") if isinstance(bruto, dict) else None
    if not isinstance(itens, list):
        raise ValueError("O registro deve ter a lista `hipoteses`.")

    hipoteses: list[Hypothesis] = []
    for indice, item in enumerate(itens):
        if not isinstance(item, dict):
            raise ValueError(f"hipoteses[{indice}] deve ser um objeto.")
        for campo in ("id", *_CAMPOS_TEXTO):
            if not isinstance(item.get(campo), str) or not item[campo].strip():
                raise ValueError(f"hipoteses[{indice}].{campo} deve ser texto nao vazio.")
        try:
            estado = EvidenceState(item.get("estado_evidencia"))
        except ValueError as exc:
            raise ValueError(f"{item['id']}: estado_evidencia invalido: {item.get('estado_evidencia')!r}.") from exc
        impls = item.get("implementacoes")
        if not isinstance(impls, list) or any(not isinstance(p, str) or not p.strip() for p in impls):
            raise ValueError(f"{item['id']}: implementacoes deve ser lista de caminhos.")
        mortos = [p for p in impls if not (raiz / p).is_file()]
        if mortos:
            raise ValueError(f"{item['id']}: implementacoes aponta caminho inexistente: {mortos}.")
        hipoteses.append(
            Hypothesis(
                id=item["id"],
                enunciado=item["enunciado"],
                baseline=item["baseline"],
                criterio_falsificacao=item["criterio_falsificacao"],
                onde_testar=item["onde_testar"],
                estado_evidencia=estado,
                implementacoes=tuple(impls),
                nota=item["nota"],
            )
        )

    ids = tuple(h.id for h in hipoteses)
    if ids != EXPECTED_IDS:
        raise ValueError(f"O registro deve conter exatamente {list(EXPECTED_IDS)} nesta ordem; tem {list(ids)}.")
    return tuple(hipoteses)


def _celula_id(hid: str) -> str:
    numero = hid[1:]
    return f"**$H_{numero}$**" if len(numero) == 1 else f"**$H_{{{numero}}}$**"


def render_markdown_table(hipoteses: tuple[Hypothesis, ...]) -> str:
    linhas = [
        "| Hipotese | Enunciado | Baseline | Criterio Estrito de Falsificacao | Modulo Python Local | Evidencia |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ]
    for h in hipoteses:
        celulas = (
            _celula_id(h.id),
            h.enunciado,
            h.baseline,
            h.criterio_falsificacao,
            h.onde_testar,
            _ROTULO[h.estado_evidencia],
        )
        linhas.append("| " + " | ".join(celulas) + " |")
    return "\n".join(linhas)


def extract_doc_table(texto: str) -> str | None:
    """Conteudo entre os marcadores, sem as linhas em branco das bordas."""
    inicio, fim = texto.find(TABLE_BEGIN), texto.find(TABLE_END)
    if inicio < 0 or fim < inicio:
        return None
    return texto[inicio + len(TABLE_BEGIN) : fim].strip()
