"""Regressoes de verdade para o portao PowerShell de qualidade.

O portao pode manter verificacoes estaticas uteis sem converte-las em Core Web
Vitals medidos. Esta prova executa o script sem uma porta CDP e exige que sua
saida preserve a incerteza, em vez de aprovar valores sinteticos.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest


RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"
LEGACY_GATE = RAIZ / "scripts" / "ops" / "cwv_gate.py"


@pytest.mark.skipif(shutil.which("powershell") is None, reason="PowerShell 5.1 ausente do PATH")
def test_gate_sem_cdp_declara_cwv_e_a11y_nao_medidos(tmp_path: Path) -> None:
    """Sem navegador instrumentado, o gate nao pode emitir selo verde de CWV/A11y."""
    env = os.environ.copy()
    env.pop("SKIP_CWV_GATE", None)
    result = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(GATE),
            "-CdpPorts",
            "65534",
            "-ReportDir",
            str(tmp_path),
        ],
        cwd=RAIZ,
        env=env,
        text=True,
        capture_output=True,
        timeout=45,
        check=False,
    )

    output = result.stdout + result.stderr
    assert result.returncode == 0, output
    assert "NAO MEDIDO" in output
    assert "FRAGIL (AMARELO)" in output
    assert "APPROVED (SOTA GOLD)" not in output


@pytest.mark.skipif(shutil.which("powershell") is None, reason="PowerShell 5.1 ausente do PATH")
def test_gate_sem_cdp_expoe_motivo_e_acao_para_estado_fragil(tmp_path: Path) -> None:
    """Um warning operacional deve indicar causa verificavel e proxima acao."""
    result = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(GATE),
            "-CdpPorts",
            "65534",
            "-ReportDir",
            str(tmp_path),
        ],
        cwd=RAIZ,
        env=os.environ.copy(),
        text=True,
        capture_output=True,
        timeout=45,
        check=False,
    )

    output = result.stdout + result.stderr
    report = (tmp_path / "latest_cwv_report.md").read_text(encoding="utf-8")

    assert result.returncode == 0, output
    assert "MOTIVOS E ACOES PARA ESTADOS NAO VERDES" in output
    assert "Componente: 'cwv.cobertura'" in output
    assert "Motivo: nenhuma porta CDP canonica respondeu" in output
    assert "Acao recomendada:" in output
    assert "## 5. Motivos e Acoes para Estados Nao Verdes" in report
    assert "**Motivo:** nenhuma porta CDP canonica respondeu" in report
    assert "**Acao recomendada:**" in report


def test_entrada_python_legada_recusa_certificar_valores_sinteticos() -> None:
    """O caminho aposentado nao pode voltar a emitir um selo verde ficticio."""
    result = subprocess.run(
        [sys.executable, str(LEGACY_GATE)],
        cwd=RAIZ,
        text=True,
        capture_output=True,
        check=False,
    )

    output = result.stdout + result.stderr
    assert result.returncode == 1
    assert "foi aposentado" in output
    assert "GATE APPROVED" not in output


def test_gate_separa_observacoes_runtime_de_limites_laboratoriais_e_revisao_manual() -> None:
    """Long tasks e itens inconclusivos não podem virar falhas normativas por nome errado."""
    source = GATE.read_text(encoding="utf-8-sig")

    assert '"OBSERVED_EVENT_LATENCY_MS"' in source
    assert '"OBSERVED_LONG_TASK_BLOCKING_MS"' in source
    assert '"TBT_MS"' not in source
    assert '"AXE_VIOLATIONS" = @{ Val = $null; Limit = 0; Unit = "violations"; Enforcement = "Fail"' in source
    assert '"AXE_INCOMPLETE" = @{ Val = $null; Limit = 0; Unit = "items"; Enforcement = "Warn"' in source
