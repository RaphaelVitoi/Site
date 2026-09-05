"""Guard do fechamento do ciclo de calibracao.

O portao de suficiencia (test_calibracao_portao_por_sessao.py) sabe ABRIR:
tres sessoes distintas com feedback e `calibration_planning_permitted` vira
True. Este modulo cobre a metade que faltava -- FECHAR.

Dois defeitos medidos em 2026-09-05, com o ledger real em 10 sessoes distintas,
`calibration_planning_permitted: true` e `ultima_calibracao: null` desde a
terceira sessao:

1. NAO EXISTIA ESCRITOR. `New-AgentCalibrationDailyEvidence.ps1` reinicia a
   contagem a partir de um registro `record_type: 'calibration'`, e nenhum
   script do repositorio emitia esse tipo. `Register-AgentCalibrationFeedback`
   so emite 'feedback'; `Record-...Correction`, 'correction'; `Record-...Outlier`,
   'outlier'.

2. O LEITOR ESTAVA MORTO. `$allFeedback` e construido filtrando
   `record_type -eq 'feedback'`, e o marco da ultima calibracao era procurado
   com `$allFeedback | Where-Object { $_.record_type -eq 'calibration' }` --
   filtro de 'calibration' sobre uma colecao que so contem 'feedback', ou seja,
   vazio por construcao. O marco nunca seria encontrado nem depois de escrito.

Os dois juntos faziam o universo crescer para sempre: "10 sessoes >= 3" nunca
deixaria de ser verdade, e o ciclo mediria sem nunca poder concluir.

A terceira coisa que estes testes tornam executavel e a exigencia da SS8.3 do
CLAUDE.md que o proprio `evidence_gate` declara nao medir: "duas confirmacoes
independentes do mesmo padrao operacional". Independente = de sessoes de origem
distintas. Regra que nao e executavel nao e regra.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
EVIDENCIA = RAIZ / "scripts" / "ops" / "New-AgentCalibrationDailyEvidence.ps1"
CALIBRACAO = RAIZ / "scripts" / "ops" / "Record-AgentCalibration.ps1"

pytestmark = pytest.mark.skipif(
    shutil.which("pwsh") is None,
    reason=(
        "pwsh ausente; o ciclo e implementado em PowerShell e nao foi exercitado. "
        "Verificacao nao executada nao e verificacao aprovada -- CLAUDE.md SS5."
    ),
)

HIPOTESE_COMPLETA = {
    "prior_operacional": "Compromisso prematuro com um ramo antes de enumerar ramos.",
    "evidencia_a_favor": "Dois feedbacks de sessoes distintas nomeiam o mesmo modo de falha.",
    "evidencia_contra": "As notas sobem ao longo da serie; o efeito pode ser de aprendizado.",
    "previsao_observavel": "Proxima sessao enumera alternativas antes de descer por uma.",
    "metricas_afetadas": ["score_mean", "tokens_em_autocorrecao"],
    "falsificador": "Uma sessao que enumera e ainda assim erra por ambiguidade.",
    "criterio_de_reversao": "Duas sessoes seguidas sem melhora medida revertem a hipotese.",
    "risco_de_degradacao": "Enumerar demais vira latencia, que e o defeito da seq 1.",
}


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
            "event_id": fb.get("event_id", f"evt-{i}"),
            "session_id": fb["session_id"],
            "score": fb.get("score", 5),
            "feedback": fb.get("feedback", "texto"),
            "scope": fb.get("scope", "handoff"),
        }
        registro["record_hash"] = _hash(registro)
        linhas.append(json.dumps(registro, ensure_ascii=False))
        anterior = registro["record_hash"]

    caminho.write_text("\n".join(linhas) + "\n", encoding="utf-8")


def _instante(dia: str, hora: str) -> str:
    return datetime.fromisoformat(f"{dia}T{hora}").astimezone().isoformat()


def _tres_sessoes(dia: str) -> list[dict]:
    return [
        {"session_id": "sessao-A", "event_id": "evt-A", "recorded_at": _instante(dia, "09:00:00")},
        {"session_id": "sessao-B", "event_id": "evt-B", "recorded_at": _instante(dia, "13:00:00")},
        {"session_id": "sessao-C", "event_id": "evt-C", "recorded_at": _instante(dia, "20:00:00")},
    ]


def _avaliar(ledger: Path, outliers: Path, dia: str) -> dict:
    proc = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(EVIDENCIA),
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


def _calibrar(
    ledger: Path,
    corroboracoes: list[str],
    *,
    hipotese: dict | None = None,
    padrao: str = "Compromisso prematuro com um ramo.",
    extra: list[str] | None = None,
) -> subprocess.CompletedProcess[str]:
    argumentos = [
        "pwsh",
        "-NoProfile",
        "-File",
        str(CALIBRACAO),
        "-LedgerPath",
        str(ledger),
        "-Pattern",
        padrao,
        "-CorroboratingEventIds",
        ",".join(corroboracoes),
        "-ObservacaoRecursiva",
        "Serie lida por inteiro; outliers considerados.",
        "-HypothesisJson",
        json.dumps(hipotese if hipotese is not None else HIPOTESE_COMPLETA),
    ]
    if extra:
        argumentos += extra
    return subprocess.run(argumentos, capture_output=True, text=True, cwd=str(RAIZ))


@pytest.fixture()
def cenario(tmp_path: Path):
    """Tres sessoes distintas num dia: portao aberto, pronto para fechar."""
    dia = "2026-09-21"
    ledger = tmp_path / "feedback-ledger.jsonl"
    outliers = tmp_path / "outlier-evidence-ledger.jsonl"
    _ledger(ledger, _tres_sessoes(dia))
    _ledger(outliers, [])
    return dia, ledger, outliers


def test_o_portao_abre_antes_de_calibrar(cenario) -> None:
    """Pre-condicao explicita: sem isso os demais testes nao provariam nada."""
    dia, ledger, outliers = cenario
    antes = _avaliar(ledger, outliers, dia)

    assert antes["sessoes_com_feedback_count"] == 3
    assert antes["calibration_planning_permitted"] is True
    assert antes["ultima_calibracao"] is None


def test_calibracao_registrada_zera_a_contagem(cenario) -> None:
    """O defeito central: sem isso o universo cresce para sempre."""
    dia, ledger, outliers = cenario
    proc = _calibrar(ledger, ["evt-A", "evt-B"])
    assert proc.returncode == 0, proc.stderr

    depois = _avaliar(ledger, outliers, dia)
    assert depois["ultima_calibracao"] is not None, "o marco tem que ser LIDO, nao so escrito"
    assert depois["sessoes_com_feedback_count"] == 0
    assert depois["feedback_count_acumulado"] == 0
    assert depois["calibration_planning_permitted"] is False


def test_feedback_posterior_a_calibracao_volta_a_contar(cenario) -> None:
    """Zerar nao e apagar: o ciclo recomeca, o ledger continua append-only."""
    dia, ledger, outliers = cenario
    assert _calibrar(ledger, ["evt-A", "evt-B"]).returncode == 0

    registrar = RAIZ / "scripts" / "ops" / "Register-AgentCalibrationFeedback.ps1"
    proc = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(registrar),
            "-Score",
            "9",
            "-Feedback",
            "sessao posterior a calibracao",
            "-SessionId",
            "sessao-D",
            "-LedgerPath",
            str(ledger),
        ],
        capture_output=True,
        text=True,
        cwd=str(RAIZ),
    )
    assert proc.returncode == 0, proc.stderr

    depois = _avaliar(ledger, outliers, datetime.now().strftime("%Y-%m-%d"))
    assert depois["sessoes_com_feedback"] == ["sessao-D"], "so o que veio depois do marco"
    assert depois["feedback_count_acumulado"] == 1
    assert depois["calibration_planning_permitted"] is False


def test_calibracao_exige_portao_aberto(tmp_path: Path) -> None:
    """Falha fechado: duas sessoes nao autorizam calibracao."""
    dia = "2026-09-22"
    ledger = tmp_path / "feedback-ledger.jsonl"
    _ledger(ledger, _tres_sessoes(dia)[:2])
    _ledger(tmp_path / "outlier-evidence-ledger.jsonl", [])

    proc = _calibrar(ledger, ["evt-A", "evt-B"])
    assert proc.returncode != 0
    assert "insuficient" in (proc.stderr + proc.stdout).lower()


def test_excecao_ao_limiar_exige_motivo_e_fica_gravada(tmp_path: Path) -> None:
    """SS8.3: excecao existe por instrucao explicita, e consta do relatorio."""
    dia = "2026-09-23"
    ledger = tmp_path / "feedback-ledger.jsonl"
    _ledger(ledger, _tres_sessoes(dia)[:2])
    _ledger(tmp_path / "outlier-evidence-ledger.jsonl", [])

    proc = _calibrar(
        ledger,
        ["evt-A", "evt-B"],
        extra=["-GateOverrideReason", "Tier 0 autorizou em 2026-09-23."],
    )
    assert proc.returncode == 0, proc.stderr

    ultimo = json.loads(ledger.read_text(encoding="utf-8").strip().splitlines()[-1])
    assert ultimo["record_type"] == "calibration"
    assert ultimo["gate_override_reason"] == "Tier 0 autorizou em 2026-09-23."
    assert ultimo["structural_gate_passed"] is False, "a excecao nao mente sobre o portao"


def test_corroboracoes_precisam_ser_de_sessoes_distintas(cenario) -> None:
    """Independente = origem diferente. Uma origem so nao e recorrencia."""
    dia, ledger, _ = cenario
    _ledger(
        ledger,
        _tres_sessoes(dia)
        + [
            {"session_id": "sessao-A", "event_id": "evt-A2", "recorded_at": _instante(dia, "10:00:00")},
        ],
    )

    proc = _calibrar(ledger, ["evt-A", "evt-A2"])
    assert proc.returncode != 0
    assert "distinta" in (proc.stderr + proc.stdout).lower()


def test_corroboracao_precisa_apontar_para_feedback_existente(cenario) -> None:
    """Corroboracao que aponta para nada parece revisao sem ser."""
    _, ledger, _ = cenario
    proc = _calibrar(ledger, ["evt-A", "evt-INEXISTENTE"])
    assert proc.returncode != 0
    assert "evt-INEXISTENTE" in (proc.stderr + proc.stdout)


def test_uma_corroboracao_nao_basta(cenario) -> None:
    """A SS8.3 exige DUAS confirmacoes independentes."""
    _, ledger, _ = cenario
    proc = _calibrar(ledger, ["evt-A"])
    assert proc.returncode != 0


def test_hipotese_incompleta_e_recusada(cenario) -> None:
    """Hipotese sem falsificador nao e hipotese; e opiniao com formato."""
    _, ledger, _ = cenario
    truncada = {k: v for k, v in HIPOTESE_COMPLETA.items() if k != "falsificador"}

    proc = _calibrar(ledger, ["evt-A", "evt-B"], hipotese=truncada)
    assert proc.returncode != 0
    assert "falsificador" in (proc.stderr + proc.stdout).lower()


def test_o_corte_e_por_sequencia_e_nao_por_relogio(cenario) -> None:
    """O fixture grava feedbacks com data FUTURA, de proposito.

    Se o corte fosse por `recorded_at`, a calibracao -- gravada com o relogio
    de agora -- seria anterior aos feedbacks e nao zeraria nada. O portao
    ficaria permanentemente aberto, que e o mesmo sintoma do filtro morto.
    Num ledger append-only encadeado, `sequence` e monotonica por construcao;
    o relogio da maquina que gravou nao e.
    """
    dia, ledger, outliers = cenario
    assert dia > datetime.now().strftime("%Y-%m-%d"), "o cenario precisa estar no futuro"
    assert _calibrar(ledger, ["evt-A", "evt-B"]).returncode == 0

    depois = _avaliar(ledger, outliers, dia)
    assert depois["sessoes_com_feedback_count"] == 0, "sequencia manda, nao o relogio"


def test_calibracao_preserva_a_cadeia(cenario) -> None:
    """Tamper-evident: o registro anexado tem que encadear no anterior."""
    _, ledger, _ = cenario
    anterior_tail = json.loads(ledger.read_text(encoding="utf-8").strip().splitlines()[-1])
    assert _calibrar(ledger, ["evt-A", "evt-B"]).returncode == 0

    verificador = RAIZ / "scripts" / "ops" / "Test-AgentCalibrationLedger.ps1"
    proc = subprocess.run(
        ["pwsh", "-NoProfile", "-File", str(verificador), "-LedgerPath", str(ledger)],
        capture_output=True,
        text=True,
        check=True,
        cwd=str(RAIZ),
    )
    assert json.loads(proc.stdout)["status"] == "valid"

    novo = json.loads(ledger.read_text(encoding="utf-8").strip().splitlines()[-1])
    assert novo["previous_hash"] == anterior_tail["record_hash"]
    assert novo["sequence"] == anterior_tail["sequence"] + 1
