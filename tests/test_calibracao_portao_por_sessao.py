"""Guard do portao de suficiencia de calibracao.

Decisao do Tier 0 em 2026-09-02:

1. A unidade de contagem passou de DIA para SESSAO. A metrica que autoriza a
   avaliacao e o numero de SESSOES DISTINTAS com feedback, minimo tres.
2. Tres feedbacks numa mesma sessao TAMBEM e dado -- fica retido e reportado --
   mas NAO abre o portao sozinho.
3. A contagem e acumulativa e nao expira: "dados nao morrem por ausencia de
   sessao no dia".
4. Gatilho primario e o aviso proativo quando o limiar bate; a corrida das
   23:59 e lastro de auditoria.

E a definicao que sustenta tudo: *sessao vai do inicio ao fim de um trabalho, e
compactacao de contexto NAO a encerra*. Sob contagem por sessao isso deixa de
ser semantica e vira integridade do portao -- uma sessao partida ao meio vira
duas na contagem e abriria a calibracao com evidencia de uma origem so.

Estes testes existem porque regra que nao e executavel nao e regra.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
SCRIPT = RAIZ / "scripts" / "ops" / "New-AgentCalibrationDailyEvidence.ps1"

pytestmark = pytest.mark.skipif(
    shutil.which("pwsh") is None,
    reason=(
        "pwsh ausente; o portao e implementado em PowerShell e nao foi exercitado. "
        "Verificacao nao executada nao e verificacao aprovada -- CLAUDE.md SS5."
    ),
)


def _hash(payload: dict) -> str:
    texto = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def _ledger(caminho: Path, feedbacks: list[dict]) -> None:
    """Escreve um ledger encadeado minimo, aceito por Test-AgentCalibrationLedger."""
    linhas: list[str] = []
    anterior = "0" * 64
    genesis = {
        "schema_version": "agent-calibration-ledger/v1",
        "sequence": 0,
        "record_type": "genesis",
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "previous_hash": anterior,
        "policy": "append-only hash chain; verify before use",
    }
    genesis["record_hash"] = _hash(genesis)
    linhas.append(json.dumps(genesis, ensure_ascii=False))
    anterior = genesis["record_hash"]

    for i, fb in enumerate(feedbacks, start=1):
        registro = {
            "schema_version": "agent-calibration-ledger/v1",
            "sequence": i,
            "record_type": "feedback",
            "recorded_at": fb["recorded_at"],
            "previous_hash": anterior,
            "event_id": f"evt-{i}",
            "session_id": fb["session_id"],
            "score": fb.get("score", 5),
            "feedback": fb.get("feedback", "texto"),
            "scope": fb.get("scope", "handoff"),
        }
        if "session_started_at" in fb:
            registro["session_started_at"] = fb["session_started_at"]
        registro["record_hash"] = _hash(registro)
        linhas.append(json.dumps(registro, ensure_ascii=False))
        anterior = registro["record_hash"]

    caminho.write_text("\n".join(linhas) + "\n", encoding="utf-8")


def _avaliar(tmp_path: Path, feedbacks: list[dict], dia: str) -> dict:
    ledger = tmp_path / "feedback-ledger.jsonl"
    outliers = tmp_path / "outlier-evidence-ledger.jsonl"
    _ledger(ledger, feedbacks)
    _ledger(outliers, [])
    proc = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(SCRIPT),
            "-Date",
            dia,
            "-LedgerPath",
            str(ledger),
            "-OutlierLedgerPath",
            str(outliers),
        ],
        capture_output=True,
        text=True,
        check=True,
        cwd=str(RAIZ),
    )
    return json.loads(proc.stdout)


def _instante(dia: str, hora: str) -> str:
    return datetime.fromisoformat(f"{dia}T{hora}").astimezone().isoformat()


def test_tres_sessoes_com_um_feedback_cada_abrem_o_portao(tmp_path: Path) -> None:
    """A metrica e sessoes distintas, nao volume de feedback."""
    dia = "2026-09-11"
    feedbacks = [
        {"session_id": "sessao-A", "recorded_at": _instante(dia, "09:00:00")},
        {"session_id": "sessao-B", "recorded_at": _instante(dia, "13:00:00")},
        {"session_id": "sessao-C", "recorded_at": _instante(dia, "20:00:00")},
    ]
    r = _avaliar(tmp_path, feedbacks, dia)

    assert r["gate_metric"] == "distinct_sessions_with_feedback"
    assert r["sessoes_com_feedback_count"] == 3
    assert r["calibration_planning_permitted"] is True


def test_uma_sessao_com_tres_feedbacks_e_dado_mas_nao_abre(tmp_path: Path) -> None:
    """Densidade intra-sessao fica registrada, e nao autoriza calibracao."""
    dia = "2026-09-10"
    feedbacks = [
        {"session_id": "sessao-A", "recorded_at": _instante(dia, f"1{n}:00:00")}
        for n in range(3)
    ]
    r = _avaliar(tmp_path, feedbacks, dia)

    assert r["sessoes_com_densidade_relevante"] == ["sessao-A"], "a densidade e retida"
    assert r["sessoes_com_feedback_count"] == 1
    assert r["calibration_planning_permitted"] is False
    assert r["sessoes_faltantes"] == 2


def test_sessoes_de_dias_diferentes_acumulam(tmp_path: Path) -> None:
    """Dados nao morrem por ausencia de sessao no dia.

    Tres sessoes espalhadas por tres dias abrem o portao na avaliacao do
    ultimo, mesmo que so uma delas tenha atividade naquele dia.
    """
    feedbacks = [
        {"session_id": "sessao-A", "recorded_at": _instante("2026-09-12", "10:00:00")},
        {"session_id": "sessao-B", "recorded_at": _instante("2026-09-18", "10:00:00")},
        {"session_id": "sessao-C", "recorded_at": _instante("2026-09-25", "10:00:00")},
    ]
    r = _avaliar(tmp_path, feedbacks, "2026-09-25")

    assert r["feedback_count_no_dia"] == 1, "so uma sessao teve atividade no dia"
    assert r["feedback_count_acumulado"] == 3
    assert r["sessoes_com_feedback_count"] == 3
    assert r["calibration_planning_permitted"] is True


def test_sessao_que_atravessa_a_meia_noite_continua_sendo_uma(tmp_path: Path) -> None:
    """Compactacao nao encerra sessao, e meia-noite tampouco."""
    vespera, dia = "2026-09-13", "2026-09-14"
    feedbacks = [
        {"session_id": "sessao-longa", "recorded_at": _instante(vespera, "22:00:00")},
        {"session_id": "sessao-longa", "recorded_at": _instante(vespera, "23:30:00")},
        {"session_id": "sessao-longa", "recorded_at": _instante(dia, "00:40:00")},
    ]
    r = _avaliar(tmp_path, feedbacks, dia)

    sessao = next(s for s in r["por_sessao"] if s["session_id"] == "sessao-longa")
    assert sessao["feedback_count"] == 3
    assert sessao["atravessa_meia_noite"] is True
    assert r["sessoes_com_feedback_count"] == 1, "atravessar a meia-noite nao cria sessao"
    assert r["calibration_planning_permitted"] is False


def test_sessao_partida_nao_conta_para_o_limiar(tmp_path: Path) -> None:
    """Sessao partida viraria sessao a mais e falsearia a contagem."""
    dia = "2026-09-15"
    inicio_a = _instante(dia, "08:00:00")
    inicio_b = _instante(dia, "15:00:00")
    feedbacks = [
        {"session_id": "sessao-X", "recorded_at": _instante(dia, "09:00:00"), "session_started_at": inicio_a},
        {"session_id": "sessao-X", "recorded_at": _instante(dia, "10:00:00"), "session_started_at": inicio_a},
        {"session_id": "sessao-X", "recorded_at": _instante(dia, "16:00:00"), "session_started_at": inicio_b},
    ]
    feedbacks += [
        {"session_id": "sessao-Y", "recorded_at": _instante(dia, "17:00:00")},
        {"session_id": "sessao-Z", "recorded_at": _instante(dia, "18:00:00")},
    ]
    r = _avaliar(tmp_path, feedbacks, dia)

    assert r["sessoes_com_inicio_inconsistente"] == ["sessao-X"]
    assert r["sessoes_com_feedback_count"] == 2, "X nao conta; sobram Y e Z"
    assert r["calibration_planning_permitted"] is False
    assert "partida" in r["evidence_gate"]["reason"]


def test_feedback_sem_sessao_nao_abre_portao(tmp_path: Path) -> None:
    """Amostra sem origem identificada e evidencia, mas nao e autorizacao."""
    dia = "2026-09-16"
    feedbacks = [
        {"session_id": "", "recorded_at": _instante(dia, f"1{n}:00:00")} for n in range(3)
    ]
    r = _avaliar(tmp_path, feedbacks, dia)

    assert r["feedback_sem_sessao"] == 3
    assert r["sessoes_com_feedback_count"] == 0
    assert r["calibration_planning_permitted"] is False


def test_dia_sem_sessao_nao_apaga_evidencia(tmp_path: Path) -> None:
    """Dia vazio produz 'dados insuficientes' sem descartar o que ja existia."""
    dia = "2026-09-17"
    anterior = (datetime.fromisoformat(f"{dia}T12:00:00") - timedelta(days=5)).astimezone().isoformat()
    r = _avaliar(tmp_path, [{"session_id": "antiga", "recorded_at": anterior}], dia)

    assert r["feedback_count_no_dia"] == 0
    assert r["feedback_count_acumulado"] == 1, "o feedback anterior continua contando"
    assert r["sessoes_com_feedback"] == ["antiga"]
    assert r["calibration_planning_permitted"] is False
