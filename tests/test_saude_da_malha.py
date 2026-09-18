"""Contrato do detector de instrumento parado.

O que ele trava nao e a formatacao da saida -- e a regra que deu origem ao modulo: **silencio nunca vale como
saude**. Em 2026-09-17 a auditoria de calibracao ficou dias parada e o portao de suficiencia aberto sem que
nada acusasse, porque o unico lugar que reportaria isso era a plataforma do veiculo que havia caido. Um
detector que se cala quando nao consegue ler reproduziria exatamente esse defeito.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pytest

from scripts.ops import saude_da_malha


@pytest.fixture
def diario(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Aponta o modulo para um diretorio de lastro isolado, e neutraliza a consulta a tarefas do Windows."""
    pasta = tmp_path / "daily"
    pasta.mkdir()
    monkeypatch.setattr(saude_da_malha, "DIARIO", pasta)
    monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ())
    return pasta


def gravar(pasta: Path, dia: str, **campos: object) -> None:
    (pasta / f"{dia}.json").write_text(json.dumps(campos), encoding="utf-8")


def titulos(sinais: list[saude_da_malha.Sinal]) -> str:
    return " | ".join(s.titulo for s in sinais)


class TestSilencioNuncaEhSaude:
    def test_sem_lastro_algum_e_ALERTA_e_nao_silencio(self, diario: Path) -> None:
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert any(s.grave for s in sinais)
        assert "ILEGIVEL ou ausente" in titulos(sinais)

    def test_lastro_corrompido_nao_passa_por_saudavel(self, diario: Path) -> None:
        (diario / "2026-09-16.json").write_text("{isto nao e json", encoding="utf-8")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert any(s.grave for s in sinais)

    def test_data_de_calibracao_ilegivel_vira_sinal(self, diario: Path) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="ontem de manha")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert "ilegivel" in titulos(sinais).lower()


class TestAuditoriaParada:
    def test_parada_alem_da_tolerancia_e_grave(self, diario: Path) -> None:
        gravar(diario, "2026-09-16", ultima_calibracao="2026-09-12T06:11:41-03:00")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        alerta = next(s for s in sinais if "Auditoria de calibracao parada" in s.titulo)
        assert alerta.grave
        assert "5 dia" in alerta.titulo
        # O sinal so serve se disser a quem o le que ELE pode assumir -- e o failover.
        assert "qualquer condutor" in alerta.acao.lower()

    def test_auditoria_recente_nao_gera_alarme(self, diario: Path) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-17T06:00:00-03:00")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert "Auditoria de calibracao parada" not in titulos(sinais)

    def test_o_limite_da_tolerancia_nao_alarma_e_o_dia_seguinte_alarma(self, diario: Path) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-15T06:00:00-03:00")
        assert "parada" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))
        assert "parada" in titulos(saude_da_malha.coletar(date(2026, 9, 18)))


class TestPortaoAberto:
    def test_portao_aberto_aparece_com_a_contagem_de_sessoes(self, diario: Path) -> None:
        gravar(
            diario,
            "2026-09-17",
            ultima_calibracao="2026-09-17T06:00:00-03:00",
            calibration_planning_permitted=True,
            sessoes_com_feedback_count=9,
        )
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Portao" in s.titulo)
        assert "9 sessoes" in sinal.detalhe
        # Aberto no mesmo dia e informacao; aberto ha uma semana e problema.
        assert not sinal.grave

    def test_portao_aberto_ha_muitos_dias_vira_grave(self, diario: Path) -> None:
        gravar(
            diario,
            "2026-09-10",
            ultima_calibracao="2026-09-10T06:00:00-03:00",
            calibration_planning_permitted=True,
            sessoes_com_feedback_count=9,
        )
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Portao" in s.titulo)
        assert sinal.grave

    def test_portao_fechado_nao_produz_sinal_de_portao(self, diario: Path) -> None:
        gravar(
            diario,
            "2026-09-17",
            ultima_calibracao="2026-09-17T06:00:00-03:00",
            calibration_planning_permitted=False,
        )
        assert "Portao" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))


class TestTarefaAgendada:
    def test_tarefa_que_nao_pode_ser_consultada_e_declarada_nao_verificada(
        self, diario: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-17T06:00:00-03:00")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("TarefaQueNaoExiste",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: None)
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert "NAO VERIFICADA" in titulos(sinais)

    def test_tarefa_desabilitada_e_grave(self, diario: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-17T06:00:00-03:00")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("Qualquer",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: ("Disabled", "2026-09-10"))
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Qualquer" in s.titulo)
        assert sinal.grave
        assert "Register-AgentCalibrationDailyTask" in sinal.acao

    def test_tarefa_pronta_nao_gera_ruido(self, diario: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-17T06:00:00-03:00")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("Qualquer",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: ("Ready", "2026-09-17"))
        assert "Qualquer" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))


def test_malha_saudavel_nao_inventa_sinal(diario: Path) -> None:
    gravar(
        diario,
        "2026-09-17",
        ultima_calibracao="2026-09-17T06:00:00-03:00",
        calibration_planning_permitted=False,
    )
    assert saude_da_malha.coletar(date(2026, 9, 17)) == []
