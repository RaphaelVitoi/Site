"""Regressoes dos caminhos extraidos na refatoracao dos apontamentos Sonar."""

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
import typer

from scripts.cli import nexus


@pytest.mark.parametrize(
    ("nome", "saida", "esperado"),
    [
        ("eslint", "12 warnings", 12),
        ("lint", "abc123\tWARNING", 123),
        ("lint", "\u0661\u0662 warnings", 12),
        ("lint", "123" * 10000 + " sem aviso", 0),
        ("next build", "WARNING: x\n[OK] warning ignorado\nv warning ignorado\nwarn: y", 2),
        ("outra fase", "warning: x", 0),
    ],
    ids=["eslint", "prefixo", "unicode", "sequencia-longa", "build", "outra-fase"],
)
def test_fallback_warnings_preserva_contagem(nome: str, saida: str, esperado: int) -> None:
    assert nexus._warnings_da_fase(nome, saida, saida.splitlines()) == esperado


@pytest.mark.parametrize(
    ("saida", "esperado"),
    [
        ("12warning; 3 warnings; 7 warnings", 3),
        ("warning sem contagem; 12 erros; warning; 5\n\tWaRnInGs", 5),
        ("\u00b2 warnings; \u0660 warnings; 9 warnings", 0),
        ("9" * 30000 + " " * 30000 + "sem aviso", 0),
        (("7 " + " " * 1000 + "sem aviso warning ") * 1000 + "4 warnings", 4),
    ],
    ids=["primeiro-valido", "multilinha", "decimal-zero", "sem-sufixo", "candidatos-invalidos"],
)
def test_contagem_linear_de_warnings(saida: str, esperado: int) -> None:
    assert nexus._warnings_da_fase("lint", saida, saida.splitlines()) == esperado


@pytest.mark.parametrize(
    ("codigo", "saida", "esperado"), [(0, "Total de Warnings: 2", 2), (0, "3 warnings", 3), (7, "", 7)]
)
def test_passo_preserva_warnings_e_codigo_de_falha(monkeypatch, codigo: int, saida: str, esperado: int) -> None:
    processo = SimpleNamespace(stdout=object(), returncode=codigo, wait=AsyncMock())
    criar = AsyncMock(return_value=processo)
    monkeypatch.setattr(nexus.asyncio, "create_subprocess_exec", criar)
    monkeypatch.setattr(nexus, "_read_stream_and_log", AsyncMock(return_value=saida.splitlines()))
    monkeypatch.setattr(nexus.console, "print", Mock())
    if codigo:
        with pytest.raises(typer.Exit) as exc:
            asyncio.run(nexus._execute_step("lint", ["comando-falso"], Path(".")))
        assert exc.value.exit_code == esperado
    else:
        assert asyncio.run(nexus._execute_step("lint", ["comando-falso"], Path("."))) == esperado
    processo.wait.assert_awaited_once()


@pytest.mark.parametrize(("reativo", "agir", "limpezas"), [(True, False, 1), (False, False, 0), (False, True, 1)])
def test_watch_preserva_gatilhos_sem_limpar_ram_real(monkeypatch, reativo: bool, agir: bool, limpezas: int) -> None:
    limpar = Mock()
    monkeypatch.setattr(nexus, "_execute_ram_cleanse", limpar)
    monkeypatch.setattr(
        nexus.psutil, "virtual_memory", Mock(return_value=SimpleNamespace(percent=95 if reativo else 40))
    )
    monkeypatch.setattr(nexus, "_pressao_justifica_higienizacao", Mock(return_value=(agir, "medicao simulada")))
    monkeypatch.setattr(nexus, "_commit_charge_pct", Mock(return_value=(80.0, 8.0, 10.0)))
    monkeypatch.setattr(nexus.time, "sleep", Mock(side_effect=KeyboardInterrupt))
    monkeypatch.setattr(nexus.console, "print", Mock())
    nexus.optimize_ram(watch=True, threshold=90.0, interval=0)
    assert limpar.call_count == limpezas
    if limpezas:
        limpar.assert_called_once_with(verbose=False)


def test_leitores_preservam_filtro_e_limites_de_erro(tmp_path: Path) -> None:
    ledger = tmp_path / "ledger.jsonl"
    primeiro = {"record_type": "feedback", "score": 8.5, "conductor_model": "a", "session_id": "sessao-1"}
    segundo = {"record_type": "feedback", "score": 9, "conductor_model": "b", "session_id": "sessao-2"}
    ledger.write_text(json.dumps(primeiro) + "\n{invalido}\n\n" + json.dumps(segundo), encoding="utf-8")
    scores, sessoes = [], set()
    nexus._ler_notas_painel(ledger, scores, sessoes)
    assert scores == [8.5]
    assert sessoes == {"sessao-1"}
    scores, series = [], {}
    nexus._ler_series_calibracao(ledger, "b", scores, series)
    assert scores == [9.0]
    assert series == {"a": [8.5], "b": [9.0]}


@pytest.mark.parametrize(("risco", "cor"), [(0.0, "green"), (-0.0, "green"), (1e-12, "red"), (0.1, "red")])
def test_risco_pequeno_nao_vira_zero_na_exibicao(monkeypatch, risco: float, cor: str) -> None:
    imprimir = Mock()
    monkeypatch.setattr(nexus.console, "print", imprimir)
    res = SimpleNamespace(
        mean_trajectory=[9.0],
        drift_direction="ESTAVEL",
        risk_of_degradation=risco,
        status="PROJECTION_ACTIVE",
        history_points=4,
        drift_per_session=0.0,
    )
    nexus._imprimir_calibracao_multimodelo({"modelo": res}, 1)
    tabela = imprimir.call_args.args[0]
    assert tabela.columns[5]._cells == [f"[{cor}]{risco * 100:.1f}%[/]"]
