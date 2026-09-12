"""Provenance enforcement uses temporary chains, never production evidence."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from tests.test_calibracao_fechamento_do_ciclo import _avaliar, _calibrar, _ledger, _tres_sessoes

ROOT = Path(__file__).resolve().parents[1]
OPS = ROOT / "scripts" / "ops"
pytestmark = pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh required")


def write_feedback(path, **overrides):
    fields = dict(
        Score="8.5",
        Feedback="fixture",
        SessionId="fixture-session",
        ConductorModel="gpt-5.6-terra",
        ConductorVehicle="codex",
        SupervisionMode="assistida",
        Scope="handoff",
        LedgerPath=str(path),
    )
    fields.update(overrides)
    args = ["pwsh", "-NoProfile", "-NonInteractive", "-File", str(OPS / "Register-AgentCalibrationFeedback.ps1")]
    for key, value in fields.items():
        if value is not None:
            args.extend([f"-{key}", value])
    # `encoding` e `errors` explicitos, pelo mesmo motivo ja documentado em
    # tests/test_cwv_gate_truthfulness.py e no registro de 2026-09-10 sobre o
    # encoding que matava a thread leitora. Sem eles, `text=True` decodifica a
    # saida do pwsh com a codificacao do console -- e a mensagem de erro em
    # portugues traz bytes que nao sao UTF-8 validos. A thread `_readerthread`
    # do subprocess levanta UnicodeDecodeError, o pytest converte isso em
    # PytestUnhandledThreadExceptionWarning, e a suite passa a carregar um
    # warning que nao tem nada a ver com o que ela afere. Medido em 2026-09-12.
    return subprocess.run(args, capture_output=True, text=True, check=False, encoding="utf-8", errors="replace")


@pytest.mark.parametrize("field", ["ConductorModel", "ConductorVehicle", "SupervisionMode", "SessionId"])
@pytest.mark.parametrize("value", [None, " "])
def test_missing_provenance_rejected_before_writing(tmp_path, field, value):
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = write_feedback(ledger, **{field: value})
    assert result.returncode != 0
    assert not ledger.exists()


@pytest.mark.parametrize(
    "model,vehicle", [("gpt-5.6-terra", "codex"), ("claude-opus-5", "claude-code"), ("gemini-3.8-flash", "antigravity")]
)
def test_known_connectors_are_recorded_independently(tmp_path, model, vehicle):
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = write_feedback(ledger, ConductorModel=model, ConductorVehicle=vehicle)
    assert result.returncode == 0, result.stderr
    row = json.loads(ledger.read_text(encoding="utf-8").splitlines()[-1])
    assert (row["conductor_model"], row["conductor_vehicle"], row["supervision_mode"]) == (model, vehicle, "assistida")


@pytest.mark.parametrize(
    "overrides",
    [
        dict(ConductorVehicle="Antigravity IDE"),
        dict(ConductorVehicle="antigravity"),
        dict(ConductorModel="GPT"),
        dict(ConductorModel="unknown-1"),
        dict(Scope="preludio"),
        dict(Scope="interludio"),
        dict(Scope="intrasessao-outlier"),
    ],
)
def test_unknown_mismatch_or_nonhandoff_rejected(tmp_path, overrides):
    assert write_feedback(tmp_path / "feedback-ledger.jsonl", **overrides).returncode != 0


@pytest.mark.parametrize("field", ["conductor_model", "conductor_vehicle", "supervision_mode"])
def test_incomplete_history_retained_but_not_gate_or_corroboration(tmp_path, field):
    ledger, outliers = tmp_path / "feedback-ledger.jsonl", tmp_path / "outlier-evidence-ledger.jsonl"
    feedback = _tres_sessoes("2026-09-12")
    feedback[0][field] = ""
    _ledger(ledger, feedback)
    _ledger(outliers, [])
    before = ledger.read_bytes()
    evidence = _avaliar(ledger, outliers, "2026-09-12")
    assert evidence["feedback_count_acumulado"] == 3
    assert evidence["sessoes_com_feedback_count"] == 2
    assert evidence["calibration_planning_permitted"] is False
    assert evidence["excluded_feedback_count"] == 1
    assert f"missing:{field}" in evidence["excluded_feedback"][0]["reasons"]
    result = _calibrar(ledger, ["evt-A", "evt-B"], extra=["-GateOverrideReason", "fixture override"])
    assert result.returncode != 0
    assert "inelegivel" in result.stderr
    assert ledger.read_bytes() == before


def test_append_only_correction_restores_effective_eligibility(tmp_path):
    ledger, outliers = tmp_path / "feedback-ledger.jsonl", tmp_path / "outlier-evidence-ledger.jsonl"
    feedback = _tres_sessoes("2026-09-12")
    feedback[0]["conductor_vehicle"] = ""
    _ledger(ledger, feedback)
    _ledger(outliers, [])
    original = ledger.read_bytes()
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(OPS / "Record-AgentCalibrationCorrection.ps1"),
            "-LedgerPath",
            str(ledger),
            "-TargetEventId",
            "evt-A",
            "-Field",
            "conductor_vehicle",
            "-CorrectedValueJson",
            '"codex"',
            "-Reason",
            "Primary fixture authority",
            "-Authority",
            "fixture",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert ledger.read_bytes().startswith(original)
    evidence = _avaliar(ledger, outliers, "2026-09-12")
    assert evidence["eligible_feedback_count"] == 3
    assert evidence["calibration_planning_permitted"] is True
    assert _calibrar(ledger, ["evt-A", "evt-B"]).returncode == 0


def _canonicos() -> list[str]:
    """Le a fonte unica, nunca uma copia. Se ela mudar, o teste muda junto."""
    from llm.model_registry import MODEL_REGISTRY, MODELOS_RETIRADOS

    return sorted(set(MODEL_REGISTRY) | set(MODELOS_RETIRADOS))


_VEICULO_POR_FAMILIA = {"gpt": "codex", "chatgpt": "codex", "claude": "claude-code", "gemini": "antigravity"}


@pytest.mark.parametrize("model", _canonicos())
def test_todo_modelo_canonico_resolve_para_um_veiculo(tmp_path, model):
    """As duas camadas tem de concordar sobre o que EXISTE.

    A sintaxe diz a familia; o conjunto canonico diz a existencia. Um modelo que
    o registry conhece e a regex recusa e divergencia entre as duas, nao decisao:
    foi assim que `claude-fable-5-1` -- retirado, porem real -- saia como
    `unknown_or_nonexact` ate 2026-09-12.
    """
    ledger = tmp_path / "feedback-ledger.jsonl"
    vehicle = _VEICULO_POR_FAMILIA[model.split("-")[0]]
    result = write_feedback(ledger, ConductorModel=model, ConductorVehicle=vehicle)
    assert result.returncode == 0, f"{model} -> {vehicle}: {result.stderr}"


@pytest.mark.parametrize("model", ["gpt-9.9-inexistente", "claude-opus-99", "gemini-9.9-flash"])
def test_sintaxe_valida_nao_prova_existencia(tmp_path, model):
    """Ate 2026-09-12 estes tres passavam: a validacao so olhava a forma do nome.

    Nenhum esta em MODEL_REGISTRY nem em MODELOS_RETIRADOS. Aceitar um modelo
    inexistente grava proveniencia que parece verificada e nao e.
    """
    ledger = tmp_path / "feedback-ledger.jsonl"
    vehicle = _VEICULO_POR_FAMILIA[model.split("-")[0]]
    result = write_feedback(ledger, ConductorModel=model, ConductorVehicle=vehicle)
    assert result.returncode != 0
    assert not ledger.exists()


def test_campo_ausente_nao_e_reportado_tambem_como_invalido(tmp_path):
    """Ausente e ausente. Ate 2026-09-12 um campo vazio saia com os dois motivos.

    A duplicata nao mudava elegibilidade, mas inflava qualquer contagem agregada
    de motivos -- e contagem inflada e a materia-prima de conclusao errada.
    """
    script = (
        f". '{OPS / 'AgentCalibrationProvenance.ps1'}'; "
        "$r = [pscustomobject]@{session_id='';scope='';conductor_model='';"
        "conductor_vehicle='';supervision_mode=''}; "
        "(Get-AgentCalibrationProvenance -Record $r).reasons -join ','"
    )
    saida = subprocess.run(
        ["pwsh", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True,
        text=True,
        check=False,
    )
    assert saida.returncode == 0, saida.stderr
    motivos = [m for m in saida.stdout.strip().split(",") if m]
    assert motivos == sorted(set(motivos), key=motivos.index), f"motivo duplicado: {motivos}"
    assert "missing:supervision_mode" in motivos
    assert "invalid:supervision_mode" not in motivos
