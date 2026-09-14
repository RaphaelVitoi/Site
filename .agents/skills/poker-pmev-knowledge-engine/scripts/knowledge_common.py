"""Raizes, codigos de saida e politica de escrita comuns aos scripts da skill.

Fechamento do P1 da AUDITORIA-2026-09-13-integracao-paralela-pmev-engines: o manifesto
prometia escrita restrita, cache por hash e leitura de formatos que nao existiam, e toda
falha saia com codigo 0. Os scripts passam a compartilhar uma fonte para cada uma dessas
regras.
"""

from __future__ import annotations

import os
from enum import IntEnum
from pathlib import Path
from typing import Final

SKILL_DIR: Final[Path] = Path(__file__).resolve().parents[1]
REPO_ROOT: Final[Path] = Path(__file__).resolve().parents[4]

# Onde a skill pode escrever. Relativos resolvem a partir da raiz do repositorio, nunca do cwd.
WRITE_ROOTS: Final[tuple[Path, ...]] = (
    REPO_ROOT / "docs" / "research" / "pmev",
    REPO_ROOT / "scratch",
)
DEFAULT_DB: Final[Path] = REPO_ROOT / "docs" / "research" / "pmev" / "pmev_knowledge.db"

# Inventario de discos e arquivos pessoais: local, ignorado pelo git, nunca versionado.
LOCAL_ANCHORS: Final[Path] = SKILL_DIR / "local" / "anchors.json"

# Acima disto nao se calcula hash de ancora externa (ha saves HRC de 10,95 GB).
MAX_HASH_BYTES: Final[int] = 256 * 1024 * 1024


class ExitCode(IntEnum):
    OK = 0
    NOT_FOUND = 1
    UNSUPPORTED = 2
    EXTRACTION_ERROR = 3
    MISSING_DEPENDENCY = 4
    OUTSIDE_WRITE_ROOTS = 5
    USAGE = 6
    REMOTE = 7


class OutsideWriteRootsError(ValueError):
    """Destino de escrita fora das raizes declaradas."""


def default_db_path() -> Path:
    override = os.environ.get("PMEV_KNOWLEDGE_DB")
    return Path(override) if override else DEFAULT_DB


def resolve_write_path(target: str | Path, roots: tuple[Path, ...] = WRITE_ROOTS) -> Path:
    """Caminho absoluto normalizado dentro de uma raiz permitida, ou OutsideWriteRootsError."""
    caminho = Path(target)
    if not caminho.is_absolute():
        caminho = REPO_ROOT / caminho
    caminho = caminho.resolve()
    for raiz in roots:
        if caminho.is_relative_to(raiz.resolve()):
            return caminho
    permitidas = ", ".join(str(r) for r in roots)
    raise OutsideWriteRootsError(f"destino fora das raizes de escrita: {caminho} (permitidas: {permitidas})")
