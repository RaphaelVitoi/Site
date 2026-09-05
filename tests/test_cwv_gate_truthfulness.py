"""Regressoes de verdade para o portao PowerShell de qualidade.

O portao pode manter verificacoes estaticas uteis sem converte-las em Core Web
Vitals medidos. Esta prova executa o script sem uma porta CDP e exige que sua
saida preserve a incerteza, em vez de aprovar valores sinteticos.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest


RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"
LEGACY_GATE = RAIZ / "scripts" / "ops" / "cwv_gate.py"
PROBE = RAIZ / "scripts" / "ops" / "runtime_quality_probe.mjs"
GLOBAL_CSS = RAIZ / "frontend" / "src" / "app" / "globals.css"
HOME_PAGE = RAIZ / "frontend" / "src" / "app" / "(public)" / "page.tsx"
A11Y_REVIEW_BASELINE = RAIZ / "data" / "a11y_manual_review_baselines.json"
CWV_MANUAL_REVIEW = RAIZ / "data" / "cwv_manual_review_records.json"
LIGHTHOUSE_CWV_AUDIT = RAIZ / "scripts" / "ops" / "lighthouse_cwv_audit.mjs"
LIGHTHOUSE_PRODUCTION_RUNNER = RAIZ / "scripts" / "ops" / "invoke_lighthouse_production_audit.ps1"


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
    assert '"TBT_MS"' in source
    assert "Lighthouse em build de producao e Chrome isolado" in source
    assert '"AXE_VIOLATIONS" = @{ Val = $null; Limit = 0; Unit = "violations"; Enforcement = "Fail"' in source
    assert '"AXE_INCOMPLETE" = @{ Val = $null; Limit = 0; Unit = "items"; Enforcement = "Warn"' in source


def test_gate_preserva_alvos_e_motivos_do_axe_inconclusivo() -> None:
    """Uma revisao humana precisa receber o seletor e a causa, nao apenas a regra."""
    gate_source = GATE.read_text(encoding="utf-8-sig")
    probe_source = PROBE.read_text(encoding="utf-8")

    assert "targets: item.nodes.slice(0, 50)" in probe_source
    assert "failureSummary: node.failureSummary" in probe_source
    assert "## 2.1 Evidencia de revisao humana do axe" in gate_source
    assert "Alvos e motivos detalhados" in gate_source


def _parse_hsl_token(css: str, token: str) -> tuple[float, float, float]:
    match = re.search(
        rf"{re.escape(token)}:\s*hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)",
        css,
    )
    assert match, f"Token ausente ou nao-HSL: {token}"
    h, s, lum = (float(value) for value in match.groups())
    return (h, s, lum)


def _relative_luminance(hsl: tuple[float, float, float]) -> float:
    hue, saturation, lightness = hsl
    saturation /= 100
    lightness /= 100
    chroma = (1 - abs(2 * lightness - 1)) * saturation
    secondary = chroma * (1 - abs((hue / 60) % 2 - 1))
    match hue:
        case value if value < 60:
            red, green, blue = chroma, secondary, 0
        case value if value < 120:
            red, green, blue = secondary, chroma, 0
        case value if value < 180:
            red, green, blue = 0, chroma, secondary
        case value if value < 240:
            red, green, blue = 0, secondary, chroma
        case value if value < 300:
            red, green, blue = secondary, 0, chroma
        case _:
            red, green, blue = chroma, 0, secondary
    offset = lightness - chroma / 2
    channels = (red + offset, green + offset, blue + offset)
    linear = tuple(
        channel / 12.92 if channel <= 0.03928 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels
    )
    return sum(weight * channel for weight, channel in zip((0.2126, 0.7152, 0.0722), linear, strict=True))


def _contrast_ratio(foreground: tuple[float, float, float], background: tuple[float, float, float]) -> float:
    high, low = sorted((_relative_luminance(foreground), _relative_luminance(background)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def test_default_dark_text_tokens_meet_wcag_aa_on_all_opaque_surfaces() -> None:
    """Texto semantico normal nao pode depender de opacidade para ser legivel."""
    css = GLOBAL_CSS.read_text(encoding="utf-8")
    surfaces = (
        _parse_hsl_token(css, "--color-bg-base"),
        _parse_hsl_token(css, "--color-bg-panel"),
        _parse_hsl_token(css, "--color-bg-deep"),
    )
    text_tokens = (
        "--color-text-main",
        "--color-text-muted",
        "--color-text-dim",
        "--color-text-darker",
    )

    for token in text_tokens:
        foreground = _parse_hsl_token(css, token)
        for background in surfaces:
            assert _contrast_ratio(foreground, background) >= 4.5, token


def test_default_light_text_tokens_meet_wcag_aa_on_editorial_surfaces() -> None:
    """A identidade editorial clara compartilha o mesmo piso de legibilidade."""
    css = GLOBAL_CSS.read_text(encoding="utf-8")
    surfaces = (
        _parse_hsl_token(css, "--color-light-canvas"),
        _parse_hsl_token(css, "--color-light-surface"),
    )

    for token in (
        "--color-light-text-main",
        "--color-light-text-muted",
        "--color-light-text-accent",
    ):
        foreground = _parse_hsl_token(css, token)
        for background in surfaces:
            assert _contrast_ratio(foreground, background) >= 4.5, token


def _hex_luminance(color: str) -> float:
    """Calcula luminancia WCAG para uma cor hexadecimal RGB opaca."""
    assert re.fullmatch(r"#[0-9A-Fa-f]{6}", color), color
    channels = tuple(int(color[index : index + 2], 16) / 255 for index in (1, 3, 5))
    linear = tuple(
        channel / 12.92 if channel <= 0.03928 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels
    )
    return sum(weight * channel for weight, channel in zip((0.2126, 0.7152, 0.0722), linear, strict=True))


def _hex_contrast_ratio(foreground: str, background: str) -> float:
    high, low = sorted((_hex_luminance(foreground), _hex_luminance(background)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def test_downward_drift_cutoff_label_has_opaque_backdrop_and_aa_color_states() -> None:
    """O rotulo dinamico do SVG nao pode cruzar uma curva sem superficie legivel."""
    source = HOME_PAGE.read_text(encoding="utf-8")

    assert 'data-a11y-contrast-backdrop="downward-drift-cutoff"' in source
    for color in ("#765421", "#286247", "#6e3636"):
        assert _hex_contrast_ratio(color, "#F5F3EE") >= 4.5, color


def test_axe_manual_review_baseline_is_explicit_and_hash_bound_to_the_svg_source() -> None:
    """Uma decisao humana nao pode virar dispensa geral para color-contrast."""
    baseline = json.loads(A11Y_REVIEW_BASELINE.read_text(encoding="utf-8"))

    assert baseline["schema_version"] == "1.0"
    review = baseline["reviews"][0]
    assert review["status"] == "approved"
    assert review["rule_id"] == "color-contrast"
    assert review["reviewer_authority"] == "Tier 0 — Raphael Vitoi"
    assert review["source"]["path"] == "frontend/src/app/(public)/page.tsx"
    assert review["source"]["sha256"] == hashlib.sha256(HOME_PAGE.read_bytes()).hexdigest()
    assert review["targets"] == [
        'text[x="15"]',
        'text[x="310"]',
        'text[x="185.39999999999998"]',
    ]


def test_gate_manual_a11y_approval_is_fail_closed_when_the_runtime_or_source_changes() -> None:
    """A aprovacao so se aplica a alvo, regra e hash exatamente conhecidos."""
    source = GATE.read_text(encoding="utf-8-sig")

    assert "A11yReviewBaselinePath" in source
    assert "Test-AxeManualReviewApproval" in source
    assert "MANUAL_REVIEW_APPROVED" in source
    assert "HASH_MISMATCH" in source
    assert "TARGET_MISMATCH" in source


def test_cwv_human_review_preserves_positive_observation_without_fabricating_inp_or_tbt() -> None:
    """A decisao humana registra INP legivel, sem inventar o TBT que nao foi capturado."""
    record = json.loads(CWV_MANUAL_REVIEW.read_text(encoding="utf-8"))

    assert record["schema_version"] == "1.0"
    review = record["reviews"][0]
    assert review["status"] == "positive_observation"
    assert review["reviewer_authority"] == "Tier 0 — Raphael Vitoi"
    assert {observation["dimension"] for observation in review["observations"]} == {
        "input_delay",
        "processing_duration",
        "presentation_delay",
        "main_thread_long_tasks",
        "performance_trace",
    }
    assert review["measurements"]["lcp"]["local_ms"] == 170
    assert review["measurements"]["lcp"]["field_p75_ms"] == 1380
    assert review["measurements"]["cls"]["local"] == 0
    assert review["measurements"]["cls"]["field_p75"] == 0.04
    assert review["measurements"]["inp"]["local_ms"] == 16
    assert review["measurements"]["inp"]["field_p75_ms"] == 106
    assert review["measurements"]["inp"]["input_delay_ms"] == 8
    assert review["measurements"]["inp"]["presentation_delay_ms"] == 8
    assert review["measurements"]["inp"]["processing_duration_ms"] is None
    performance_trace = next(
        observation for observation in review["observations"] if observation["dimension"] == "performance_trace"
    )
    assert "4,72 s" in performance_trace["statement"]
    assert "LCP de 410 ms" in performance_trace["statement"]
    assert "CLS 0" in performance_trace["statement"]
    assert "nao e uma medicao de TBT" in " ".join(review["limitations"])
    assert not any("nao certifica INP" in limitation for limitation in review["limitations"])
    assert any("nao certifica TBT" in limitation for limitation in review["limitations"])


@pytest.mark.skipif(shutil.which("powershell") is None, reason="PowerShell 5.1 ausente do PATH")
def test_gate_reports_positive_cwv_human_review_without_turning_it_into_coverage_pass(tmp_path: Path) -> None:
    """O registro humano deve aparecer no relatorio, sem remover o aviso de cobertura CWV."""
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
    assert "[CWV] Observacao humana positiva registrada" in output
    assert "## 1.1 Observacao humana de responsividade" in report
    assert "INP atestado manualmente: 16 ms local / 106 ms p75 de campo." in report
    assert "TBT permanece sem artefato Lighthouse valido." in report
    assert "FRAGILE" in report


def test_lighthouse_cwv_extractor_requires_real_tbt_and_preserves_numeric_metrics() -> None:
    """O adaptador aceita apenas o número que o Lighthouse calculou como TBT.

    Tamanho de long task, total de scripting ou uma métrica de DevTools não
    substituem este campo: o artefato precisa manter a proveniência Lighthouse.
    """
    fixture = {
        "audits": {
            "total-blocking-time": {"numericValue": 123.4},
            "largest-contentful-paint": {"numericValue": 456.7},
            "cumulative-layout-shift": {"numericValue": 0.02},
        }
    }
    script = """
import { extractLighthouseCwv } from './scripts/ops/lighthouse_cwv_audit.mjs';
const fixture = JSON.parse(process.argv[1]);
process.stdout.write(JSON.stringify(extractLighthouseCwv(fixture)));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script, json.dumps(fixture)],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    assert result.returncode == 0, result.stderr
    values = json.loads(result.stdout)
    assert values == {"tbtMs": 123.4, "lcpMs": 456.7, "cls": 0.02}


def test_lighthouse_input_fingerprint_changes_when_a_production_input_changes(tmp_path: Path) -> None:
    """A certificação Lighthouse expira quando o input de produção muda."""
    source_root = tmp_path / "frontend"
    source_root.mkdir()
    source = source_root / "page.tsx"
    source.write_text("export const title = 'primeira-versao';\n", encoding="utf-8")
    script = """
import { fingerprintProductionInputs } from './scripts/ops/lighthouse_cwv_audit.mjs';
const root = process.argv[1];
const first = await fingerprintProductionInputs(root);
await (await import('node:fs/promises')).writeFile(`${root}/page.tsx`, "export const title = 'segunda-versao';\\n");
const second = await fingerprintProductionInputs(root);
process.stdout.write(JSON.stringify({ first, second }));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script, str(source_root)],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    assert result.returncode == 0, result.stderr
    values = json.loads(result.stdout)
    assert values["first"] != values["second"]
    assert len(values["first"]) == len(values["second"]) == 64


def test_lighthouse_fingerprint_cli_keeps_the_gate_on_the_same_hash_algorithm(tmp_path: Path) -> None:
    """O gate usa a CLI do coletor, jamais uma segunda implementação do hash."""
    source_root = tmp_path / "frontend"
    source_root.mkdir()
    (source_root / "page.tsx").write_text("export const title = 'SOTA';\n", encoding="utf-8")

    result = subprocess.run(
        ["node", str(LIGHTHOUSE_CWV_AUDIT), "--fingerprint", "--source-root", str(source_root)],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert re.fullmatch(r"[0-9a-f]{64}", result.stdout.strip())


@pytest.mark.skipif(shutil.which("powershell") is None, reason="PowerShell 5.1 ausente do PATH")
def test_gate_reads_only_a_hash_bound_lighthouse_tbt_artifact(tmp_path: Path) -> None:
    """Um TBT de produção válido aparece, sem transformar CWV runtime ausente em verde."""
    fingerprint_result = subprocess.run(
        ["node", str(LIGHTHOUSE_CWV_AUDIT), "--fingerprint", "--source-root", str(RAIZ / "frontend")],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    assert fingerprint_result.returncode == 0, fingerprint_result.stderr
    artifact = {
        "schema_version": "1.0",
        "source": "lighthouse",
        "generated_at": "2026-09-01T06:00:00.000Z",
        "target_url": "http://127.0.0.1:3100/",
        "input_fingerprint_sha256": fingerprint_result.stdout.strip(),
        "metrics": {"tbtMs": 99.0, "lcpMs": 500.0, "cls": 0.0},
        "lighthouse_report": {
            "audits": {
                "total-blocking-time": {"numericValue": 99.0},
                "largest-contentful-paint": {"numericValue": 500.0},
                "cumulative-layout-shift": {"numericValue": 0.0},
            }
        },
    }
    artifact_path = tmp_path / "lighthouse.json"
    artifact_path.write_text(json.dumps(artifact), encoding="utf-8")

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
            "-LighthouseArtifactPath",
            str(artifact_path),
        ],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    report_path = tmp_path / "latest_cwv_report.md"

    assert result.returncode == 0, result.stdout + result.stderr
    assert report_path.is_file(), result.stdout + result.stderr
    report = report_path.read_text(encoding="utf-8")
    assert "TBT_MS" in report and "99 ms" in report
    assert "FRAGILE" in report


def test_production_lighthouse_runner_declares_browser_isolation_and_cleanup() -> None:
    """O comando operacional preserva perfil pessoal, GPU e portas de terceiros."""
    assert LIGHTHOUSE_PRODUCTION_RUNNER.is_file()
    source = LIGHTHOUSE_PRODUCTION_RUNNER.read_text(encoding="utf-8")

    assert "--headless=new" in source
    assert "--disable-extensions" in source
    assert "--remote-debugging-address=127.0.0.1" in source
    assert "--disable-gpu" not in source
    assert "latest_lighthouse_production.json" in source
    assert "Remove-Item -LiteralPath $auditProfile" in source
