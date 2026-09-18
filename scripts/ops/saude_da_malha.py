"""Sinais de saude da malha -- o que parou de rodar sem que ninguem soubesse.

POR QUE ISTO EXISTE
Medido em 2026-09-17. A malha tem tres instrumentos de auto-observacao, e dois deles falham em silencio:

  1. **Lastro diario** (`NexusSOTA-AgentCalibrationDailyEvaluation`, tarefa do Windows) -- saudavel, 14 dias
     consecutivos sem um buraco. E agnostico de fornecedor: roda mesmo com todos os condutores fora do ar.
  2. **Auditoria de coerencia agentica** -- le o lastro e propoe calibracao. Mora na plataforma do Codex.
     Parou tres dias por falta de cota do veiculo, e **nada avisou**.
  3. **Indice de pendencias** (`record_gate.py`) -- correto e completo, agrega o corpus inteiro. Depende de o
     condutor lembrar de consulta-lo.

O resultado foi o portao de calibracao aberto por cinco dias, com tres vezes o limiar, sem ninguem fechar.
Nao por incapacidade: o instrumento e local e qualquer condutor o executa. **Por falta de sinal.**

O QUE ISTO NAO E
Nao e um quarto mecanismo de medicao. Ele nao mede nada de novo: le o que os tres ja gravam e transforma
silencio em numero. Criar um canal proprio repetiria o defeito que a SS9.2 documenta -- a recomendacao que
ficou catorze dias parada por viver onde nenhum portao olhava. Por isso a saida daqui e impressa pelo
`record_gate.py`, que todo condutor ja roda ao comecar o trabalho.

PRINCIPIO: FALHAR ABERTO
Ausencia de dado vira sinal, nunca silencio. Um lastro que nao pode ser lido e um alerta -- nao um "tudo bem".
E a mesma regra do contrato de evidencia: "nao lido" nunca e "lido como zero".
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
import json
from pathlib import Path
import subprocess

RAIZ = Path(__file__).resolve().parents[2]
DIARIO = RAIZ / "reports" / "agent-calibration" / "daily"

# Dias de tolerancia antes de a ausencia virar alerta. A auditoria e diaria; dois dias sem ela ja e anomalia,
# e tres foi exatamente o que passou despercebido em 2026-09-17.
TOLERANCIA_AUDITORIA_DIAS = 2
# O portao de suficiencia abre com 3 sessoes distintas. Ficar aberto alguns dias e normal; uma semana nao.
TOLERANCIA_PORTAO_ABERTO_DIAS = 3

TAREFAS_CRITICAS = ("NexusSOTA-AgentCalibrationDailyEvaluation",)


@dataclass(frozen=True)
class Sinal:
    """Um fato sobre a malha. `grave` separa o que exige acao do que e so informacao."""

    grave: bool
    titulo: str
    detalhe: str
    acao: str = ""

    def linha(self) -> str:
        marca = "ALERTA " if self.grave else "info   "
        texto = f"   {marca} | {self.titulo}\n             {self.detalhe}"
        return f"{texto}\n             -> {self.acao}" if self.acao else texto


def _curto(caminho: Path) -> str:
    """Caminho relativo a raiz quando ele esta dentro dela; absoluto quando nao esta.

    `Path.relative_to` levanta `ValueError` fora da raiz, e um detector de falhas que quebra ao *descrever* a
    falha e pior que nenhum. Medido pelo proprio teste deste modulo, com o lastro num diretorio temporario.
    """
    try:
        return str(caminho.relative_to(RAIZ))
    except ValueError:
        return str(caminho)


def _ultimo_lastro() -> tuple[date | None, dict | None]:
    """Data e conteudo do lastro mais recente. Devolve (None, None) quando nao ha nenhum legivel."""
    if not DIARIO.is_dir():
        return None, None
    candidatos = sorted(DIARIO.glob("????-??-??.json"), reverse=True)
    for arquivo in candidatos:
        try:
            return date.fromisoformat(arquivo.stem), json.loads(arquivo.read_text(encoding="utf-8"))
        except (ValueError, json.JSONDecodeError, OSError):
            continue
    return None, None


def _ultima_auditoria() -> date | None:
    """Data da auditoria interpretada mais recente: o `.md` diario que so a auditoria escreve.

    O `.json` do mesmo diretorio e o lastro da tarefa do Windows e existe com ou sem auditoria;
    confundir os dois foi o defeito corrigido em 2026-09-18.
    """
    if not DIARIO.is_dir():
        return None
    for arquivo in sorted(DIARIO.glob("????-??-??.md"), reverse=True):
        try:
            return date.fromisoformat(arquivo.stem)
        except ValueError:
            continue
    return None


def _estado_da_tarefa(nome: str) -> tuple[str, str] | None:
    """(estado, ultimo_resultado) da tarefa agendada, ou None quando nao da para consultar."""
    try:
        saida = subprocess.run(
            ["schtasks", "/query", "/tn", nome, "/fo", "csv", "/nh"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if saida.returncode != 0 or not saida.stdout.strip():
        return None
    campos = [c.strip('" ') for c in saida.stdout.strip().splitlines()[0].split('","')]
    return (campos[-1], campos[-2]) if len(campos) >= 3 else None


def coletar(hoje: date | None = None) -> list[Sinal]:
    """Le o que os instrumentos ja gravaram e devolve o que esta silenciosamente parado."""
    hoje = hoje or date.today()
    sinais: list[Sinal] = []

    data, lastro = _ultimo_lastro()
    if data is None or lastro is None:
        sinais.append(
            Sinal(
                grave=True,
                titulo="Lastro de calibracao ILEGIVEL ou ausente",
                detalhe=f"Nenhum arquivo valido em {_curto(DIARIO)}.",
                acao="pwsh scripts/ops/New-AgentCalibrationDailyEvidence.ps1",
            )
        )
        return sinais + _sinais_de_tarefas()

    # 1. Ha quantos dias a AUDITORIA (que le o lastro) nao produz resultado.
    #
    # A grandeza e a data do `.md` mais recente -- o artefato que SO a auditoria escreve. Ate 2026-09-18
    # este bloco usava `ultima_calibracao` como proxy, e o proxy mentia nas duas direcoes: a auditoria
    # pode rodar todo dia e concluir "dados insuficientes" sem calibrar (alarme falso), e uma calibracao
    # registrada a mao renova a data sem que a auditoria rode (silencio falso). Foi o segundo que
    # aconteceu: a calibracao de 09-17 limpou este sinal com a auditoria parada desde 09-13.
    auditoria = _ultima_auditoria()
    if auditoria is None:
        sinais.append(
            Sinal(
                grave=True,
                titulo="Nenhuma auditoria de calibracao encontrada",
                detalhe=f"Nenhum AAAA-MM-DD.md em {_curto(DIARIO)}. O lastro existe e ninguem o le.",
                acao="Qualquer condutor assume: o instrumento e local (PowerShell 7), nao do fornecedor.",
            )
        )
    else:
        dias = (hoje - auditoria).days
        if dias > TOLERANCIA_AUDITORIA_DIAS:
            sinais.append(
                Sinal(
                    grave=True,
                    titulo=f"Auditoria de calibracao parada ha {dias} dia(s)",
                    detalhe=(
                        f"Ultima auditoria interpretada em {auditoria}. Ela mora na plataforma do Codex e "
                        "cai junto com a cota do veiculo, sem aviso. O lastro continua sendo gravado."
                    ),
                    acao="Qualquer condutor assume: o instrumento e local (PowerShell 7), nao do fornecedor.",
                )
            )

    # 2. O portao de suficiencia esta aberto e ninguem fechou.
    if lastro.get("calibration_planning_permitted"):
        sessoes = lastro.get("sessoes_com_feedback_count", "?")
        atraso = (hoje - data).days
        sinais.append(
            Sinal(
                grave=atraso > TOLERANCIA_PORTAO_ABERTO_DIAS,
                titulo="Portao de calibracao ABERTO",
                detalhe=(
                    f"{sessoes} sessoes distintas com feedback (limiar 3), medido em {data}. "
                    "Aberto significa que ha base para planejar calibracao, nao que ela foi feita."
                ),
                acao="Propor a calibracao ao Tier 0; o registro no ledger exige arbitragem dele.",
            )
        )

    # 3. O lastro do dia ainda nao foi gravado (a tarefa roda as 23:59).
    if data < hoje:
        sinais.append(
            Sinal(
                grave=(hoje - data).days > 1,
                titulo=f"Lastro mais recente e de {data}",
                detalhe=(
                    "A tarefa grava as 23:59; faltar o dia corrente antes disso e esperado. "
                    "Mais de um dia de atraso nao e."
                ),
            )
        )

    return sinais + _sinais_de_tarefas()


def _sinais_de_tarefas() -> list[Sinal]:
    """As tarefas agendadas que sustentam o lastro. Nao conseguir consultar tambem e sinal."""
    saida: list[Sinal] = []
    for nome in TAREFAS_CRITICAS:
        estado = _estado_da_tarefa(nome)
        if estado is None:
            saida.append(
                Sinal(
                    grave=False,
                    titulo=f"Tarefa '{nome}' NAO VERIFICADA",
                    detalhe="schtasks indisponivel ou tarefa ausente. Nao verificado nunca e aprovado.",
                )
            )
            continue
        situacao, ultimo = estado
        if situacao.strip().lower() not in {"ready", "pronto", "running", "em execucao"}:
            saida.append(
                Sinal(
                    grave=True,
                    titulo=f"Tarefa '{nome}' em estado '{situacao}'",
                    detalhe=f"Ultima execucao: {ultimo}. Sem ela o lastro para de ser gravado.",
                    acao="pwsh scripts/ops/Register-AgentCalibrationDailyTask.ps1",
                )
            )
    return saida


def imprimir(hoje: date | None = None) -> None:
    """Saida para o canal que todo condutor ja ve. Nao decide nada -- so impede que o silencio passe."""
    sinais = coletar(hoje)
    if not sinais:
        print("\n[SAUDE DA MALHA] Nenhum instrumento parado em silencio.\n")
        return
    graves = sum(1 for s in sinais if s.grave)
    print(f"\n[SAUDE DA MALHA] {len(sinais)} sinal(is), {graves} grave(s). Nao bloqueiam o commit.")
    for sinal in sinais:
        print(sinal.linha())
    print()


if __name__ == "__main__":
    imprimir()
