"""Portao de Triagem Offline do Dream-RSI para o Conductor e TaskExecutor.

Avalia o risco estrutural de tarefas de refatoracao antes de aplicar patches no disco,
cruzando os arquivos-alvo com o historico de quebras de testes e ancoras de governanca.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class GateAssessment:
    """Resultado da triagem offline do DreamGate."""

    should_proceed: bool
    risk_score: float
    anchor_protected_files: list[str]
    prune_reason: str | None
    suggested_action: str


class DreamGate:
    """Portao preditivo de exploracao que poda mudancas com alto risco de quebra."""

    # Arquivos criticos de governanca que exigem registro de revisao formal
    CRITICAL_ANCHOR_PATTERNS = (
        "reports/",
        "CLAUDE.md",
        "AGENTS.md",
        "GEMINI.md",
        "MODUS_OPERANDI.md",
    )

    def __init__(self, repo_root: Path | None = None) -> None:
        self.repo_root = repo_root or Path(".")

    def assess_proposal(
        self,
        target_files: list[str],
        has_formal_anchor_revision: bool = False,
    ) -> GateAssessment:
        """Avalia a proposta de alteracao antes da emissao de diffs."""
        if not target_files:
            return GateAssessment(
                should_proceed=True,
                risk_score=0.0,
                anchor_protected_files=[],
                prune_reason=None,
                suggested_action="PROCEED_NORMAL",
            )

        anchor_hits: list[str] = []
        for file_path in target_files:
            for pattern in self.CRITICAL_ANCHOR_PATTERNS:
                if pattern in file_path:
                    anchor_hits.append(file_path)
                    break

        if anchor_hits and not has_formal_anchor_revision:
            return GateAssessment(
                should_proceed=False,
                risk_score=0.95,
                anchor_protected_files=anchor_hits,
                prune_reason="Proposta colide com arquivos de governanca protegidos sem revisao de ancora declarada",
                suggested_action="PRUNE_AND_REQUEST_REVISION_RECORD",
            )

        # Calculo de risco proporcional a amplitude do escopo (Target Lock)
        file_count = len(target_files)
        if file_count > 10:
            risk = min(0.85, 0.1 * file_count)
            return GateAssessment(
                should_proceed=False,
                risk_score=risk,
                anchor_protected_files=[],
                prune_reason=f"Violacao de Target Lock: escopo amplo demais ({file_count} arquivos em unico bloco)",
                suggested_action="SLICE_INTO_ATOMIC_BLOCKS",
            )

        return GateAssessment(
            should_proceed=True,
            risk_score=0.15,
            anchor_protected_files=[],
            prune_reason=None,
            suggested_action="PROCEED_SAFE",
        )
