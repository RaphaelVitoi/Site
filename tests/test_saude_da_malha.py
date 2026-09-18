"""Contrato do detector de instrumento parado.

O que ele trava nao e a formatacao da saida -- e a regra que deu origem ao modulo:
**silencio nunca vale como saude**. Em 2026-09-17 a auditoria de calibracao ficou dias
parada e o portao de suficiencia aberto sem que nada acusasse, porque o unico lugar que
reportaria isso era a plataforma do veiculo que havia caido.

Em 2026-09-18 o proprio detector produziu um silencio falso: media a auditoria pela data
da ultima CALIBRACAO, e uma calibracao registrada a mao limpou o alarme com a auditoria
parada havia cinco dias. `TestProxyNaoSubstituiAGrandeza` trava essa regressao.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pytest

from scripts.ops import saude_da_malha


@pytest.fixture(name="diario")
def fixture_diario(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Diretorio de lastro isolado, sem consulta real a tarefas do Windows."""
    pasta = tmp_path / "daily"
    pasta.mkdir()
    monkeypatch.setattr(saude_da_malha, "DIARIO", pasta)
    monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ())
    return pasta


def gravar(pasta: Path, dia: str, **campos: object) -> None:
    """Lastro diario (`.json`), o que a tarefa do Windows escreve."""
    (pasta / f"{dia}.json").write_text(json.dumps(campos), encoding="utf-8")


def auditar(pasta: Path, dia: str) -> None:
    """Auditoria interpretada (`.md`), o que so a auditoria do Codex escreve."""
    (pasta / f"{dia}.md").write_text("---\ntipo: auditoria-diaria-de-calibracao\n---\n", encoding="utf-8")


def titulos(sinais: list[saude_da_malha.Sinal]) -> str:
    """Titulos concatenados, para asserir presenca ou ausencia de um sinal."""
    return " | ".join(s.titulo for s in sinais)


class TestSilencioNuncaEhSaude:
    """Ausencia de dado vira sinal; nunca passa por malha saudavel."""

    @pytest.mark.usefixtures("diario")
    def test_sem_lastro_algum_e_alerta_e_nao_silencio(self) -> None:
        """Diretorio vazio e alerta grave, nao 'nada a reportar'."""
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert any(s.grave for s in sinais)
        assert "ILEGIVEL ou ausente" in titulos(sinais)

    def test_lastro_corrompido_nao_passa_por_saudavel(self, diario: Path) -> None:
        """JSON quebrado nao pode ser lido como malha em ordem."""
        (diario / "2026-09-16.json").write_text("{isto nao e json", encoding="utf-8")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        assert any(s.grave for s in sinais)

    def test_lastro_sem_auditoria_alguma_e_grave(self, diario: Path) -> None:
        """Lastro gravado e nenhuma auditoria: a evidencia existe e ninguem a le."""
        gravar(diario, "2026-09-17")
        sinais = saude_da_malha.coletar(date(2026, 9, 17))
        alerta = next(s for s in sinais if "Nenhuma auditoria" in s.titulo)
        assert alerta.grave


class TestAuditoriaParada:
    """A grandeza e a data do `.md` mais recente."""

    def test_parada_alem_da_tolerancia_e_grave(self, diario: Path) -> None:
        """Cinco dias sem auditoria: grave, e o sinal diz quem pode assumir."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-13")
        sinais = saude_da_malha.coletar(date(2026, 9, 18))
        alerta = next(s for s in sinais if "Auditoria de calibracao parada" in s.titulo)
        assert alerta.grave
        assert "5 dia" in alerta.titulo
        # O sinal so serve se disser a quem o le que ELE pode assumir -- e o failover.
        assert "qualquer condutor" in alerta.acao.lower()

    def test_auditoria_recente_nao_gera_alarme(self, diario: Path) -> None:
        """Auditoria do dia: sem alarme."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-17")
        assert "parada" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))

    def test_o_limite_da_tolerancia_nao_alarma_e_o_dia_seguinte_alarma(self, diario: Path) -> None:
        """Dois dias e tolerado; o terceiro dispara."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-15")
        assert "parada" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))
        assert "parada" in titulos(saude_da_malha.coletar(date(2026, 9, 18)))


class TestProxyNaoSubstituiAGrandeza:
    """Regressao de 2026-09-18: calibracao recente nao prova auditoria rodando."""

    def test_calibracao_recente_nao_cala_auditoria_parada(self, diario: Path) -> None:
        """O caso real: calibracao de 09-17 e auditoria parada desde 09-13."""
        gravar(diario, "2026-09-17", ultima_calibracao="2026-09-17T21:11:10-03:00")
        auditar(diario, "2026-09-13")
        assert "Auditoria de calibracao parada" in titulos(saude_da_malha.coletar(date(2026, 9, 18)))

    def test_calibracao_antiga_nao_alarma_auditoria_em_dia(self, diario: Path) -> None:
        """O inverso: auditoria diaria que conclui 'dados insuficientes' nao e auditoria parada."""
        gravar(diario, "2026-09-17", ultima_calibracao="2026-08-01T06:00:00-03:00")
        auditar(diario, "2026-09-17")
        assert "parada" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))


class TestPortaoAberto:
    """Portao aberto e informacao; aberto ha muito tempo e problema."""

    def test_portao_aberto_aparece_com_a_contagem_de_sessoes(self, diario: Path) -> None:
        """Aberto no dia: sinal informativo com a contagem."""
        gravar(diario, "2026-09-17", calibration_planning_permitted=True, sessoes_com_feedback_count=9)
        auditar(diario, "2026-09-17")
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Portao" in s.titulo)
        assert "9 sessoes" in sinal.detalhe
        assert not sinal.grave

    def test_portao_aberto_ha_muitos_dias_vira_grave(self, diario: Path) -> None:
        """Aberto ha uma semana: grave."""
        gravar(diario, "2026-09-10", calibration_planning_permitted=True, sessoes_com_feedback_count=9)
        auditar(diario, "2026-09-17")
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Portao" in s.titulo)
        assert sinal.grave

    def test_portao_fechado_nao_produz_sinal_de_portao(self, diario: Path) -> None:
        """Portao fechado nao gera ruido."""
        gravar(diario, "2026-09-17", calibration_planning_permitted=False)
        auditar(diario, "2026-09-17")
        assert "Portao" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))


class TestTarefaAgendada:
    """A tarefa que sustenta o lastro."""

    def test_tarefa_que_nao_pode_ser_consultada_e_declarada_nao_verificada(
        self, diario: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Nao conseguir consultar tambem e sinal."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-17")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("TarefaQueNaoExiste",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: None)
        assert "NAO VERIFICADA" in titulos(saude_da_malha.coletar(date(2026, 9, 17)))

    def test_tarefa_desabilitada_e_grave(self, diario: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        """Tarefa desabilitada para o lastro: grave, com o comando de reparo."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-17")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("Qualquer",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: ("Disabled", "2026-09-10"))
        sinal = next(s for s in saude_da_malha.coletar(date(2026, 9, 17)) if "Qualquer" in s.titulo)
        assert sinal.grave
        assert "Register-AgentCalibrationDailyTask" in sinal.acao

    def test_tarefa_pronta_nao_gera_ruido(self, diario: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        """Tarefa pronta: silencio legitimo."""
        gravar(diario, "2026-09-17")
        auditar(diario, "2026-09-17")
        monkeypatch.setattr(saude_da_malha, "TAREFAS_CRITICAS", ("Qualquer",))
        monkeypatch.setattr(saude_da_malha, "_estado_da_tarefa", lambda _nome: ("Ready", "2026-09-17"))
        assert "Qualquer" not in titulos(saude_da_malha.coletar(date(2026, 9, 17)))


def test_malha_saudavel_nao_inventa_sinal(diario: Path) -> None:
    """Lastro e auditoria do dia, portao fechado: lista vazia."""
    gravar(diario, "2026-09-17", calibration_planning_permitted=False)
    auditar(diario, "2026-09-17")
    assert saude_da_malha.coletar(date(2026, 9, 17)) == []
