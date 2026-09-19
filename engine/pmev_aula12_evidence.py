"""Os sete pares transcritos da Aula 1.2 (Raphael Vitoi) no contrato de cenario Python.

Item 4 da ordem vinculante do handoff-2026-09-13-integracao-paralela-pmev-engines:
promover primeiro os 7 pares locais; os 97 nos/figuras do documento continuam
inventario ate haver reproducao.

FONTE: `data/aula12_pairs.json`, espelho gerado do fixture curado
`frontend/src/components/simulator/solver/evidencia/aula12Pairs.ts`.
`frontend/src/tests/simulator/aula12PairsJson.test.ts` reprova se divergirem.
Este modulo NAO contem numero de evidencia proprio.

O QUE O CARREGADOR ACRESCENTA AO FIXTURE, e so isto:
- ranges e horizonte, que o documento declara para a arvore inteira;
- payouts da mesa final, literais do ledger, no lado ICMev;
- `agent_policy` como Unreadable: o fixture nao declara nodelock por no, e nos
  pares 5 a 7 declara ambiguidade explicita de atribuicao.
Nada e inferido do conteudo das capturas.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
from math import isfinite
from pathlib import Path
from typing import Final

from engine.pmev_scenario import (
    ENashUnit,
    EvidencePairContract,
    Read,
    Reading,
    Regime,
    ScenarioContract,
    Seat,
    SolverProvenance,
    StackUnit,
    Unreadable,
)

RAIZ: Final[Path] = Path(__file__).resolve().parents[1]
DATA_PATH: Final[Path] = RAIZ / "data" / "aula12_pairs.json"

AULA_1_2_SHA256: Final[str] = "b3fc15ba0b22ae2e15e38b5ea1aa59e1356b168d866bba2a1516958a5c23f930"
EXPECTED_PAIR_COUNT: Final[int] = 7

# Literal de docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md, linha "Payouts da FT".
CANONICAL_PAYOUTS: Final[tuple[float, ...]] = (
    237.34,
    170.96,
    135.17,
    109.99,
    90.28,
    73.95,
    59.92,
    47.56,
    36.47,
)

# DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT no contrato TypeScript.
FREQUENCY_SUM_TOLERANCE_PCT: Final[float] = 0.5

RANGES_DECLARADAS: Final[Read[str]] = Read("simetricas nos dois motores, declaradas pelo documento (BTN RFI 33.6%)")
HORIZONTE_DECLARADO: Final[Read[str]] = Read("fim da mao; arvore declarada ate o river")
POLITICA_NAO_DECLARADA: Final[Unreadable] = Unreadable("o fixture nao declara se o no foi resolvido sob nodelock")
POLITICA_AMBIGUA: Final[Unreadable] = Unreadable(
    "atribuicao a passe de nodelock ambigua (ATRIBUICAO_AMBIGUA_NODELOCK), pendente de arbitragem do autor"
)
_SEM_MOTIVO: Final[str] = "ilegivel no fixture, sem motivo declarado"

__all__ = [
    "AULA_1_2_SHA256",
    "CANONICAL_PAYOUTS",
    "DATA_PATH",
    "FREQUENCY_SUM_TOLERANCE_PCT",
    "EvidenceAction",
    "EvidenceSide",
    "TranscribedPair",
    "load_aula12_pairs",
    "pair_by_key",
]


@dataclass(frozen=True, slots=True)
class EvidenceAction:
    label: str
    frequency_pct: Reading[float]
    sizing_bb: Reading[float] | None = None
    combos: Reading[float] | None = None

    def __post_init__(self) -> None:
        if not self.label.strip():
            raise ValueError("Acao sem rotulo.")
        if isinstance(self.frequency_pct, Read):
            v = self.frequency_pct.value
            if not isfinite(v) or not 0.0 <= v <= 100.0:
                raise ValueError(f"{self.label}: frequencia lida fora de [0, 100]: {v}.")
        for nome, campo in (("sizing_bb", self.sizing_bb), ("combos", self.combos)):
            if isinstance(campo, Read) and (not isfinite(campo.value) or campo.value < 0):
                raise ValueError(f"{self.label}: {nome} lido deve ser finito e nao negativo.")


@dataclass(frozen=True, slots=True)
class EvidenceSide:
    scenario: ScenarioContract
    solver: str
    actions: tuple[EvidenceAction, ...]
    total_combos: Reading[float] | None

    @property
    def frequency_sum_pct(self) -> float:
        """Soma das frequencias LIDAS. Nunca normaliza nem preenche as ilegiveis."""
        return sum(a.frequency_pct.value for a in self.actions if isinstance(a.frequency_pct, Read))

    @property
    def unreadable_frequencies(self) -> int:
        return sum(1 for a in self.actions if isinstance(a.frequency_pct, Unreadable))

    @property
    def frequency_sum_closes(self) -> bool:
        return self.unreadable_frequencies == 0 and abs(self.frequency_sum_pct - 100.0) <= FREQUENCY_SUM_TOLERANCE_PCT


@dataclass(frozen=True, slots=True)
class TranscribedPair:
    key: str
    street: str
    board: Reading[str]
    pot_bb: Reading[float]
    contract: EvidencePairContract
    chip_ev: EvidenceSide
    icm_ev: EvidenceSide
    nodelock_ambiguous: bool


def _leitura(bruto: object, onde: str) -> Reading[object]:
    if not isinstance(bruto, dict) or bruto.get("kind") not in {"read", "unreadable"}:
        raise ValueError(f"{onde}: valor medido deve ser {{kind: read|unreadable}}.")
    if bruto["kind"] == "read":
        if "value" not in bruto:
            raise ValueError(f"{onde}: leitura sem value.")
        return Read(bruto["value"])
    motivo = bruto.get("reason")
    return Unreadable(motivo if isinstance(motivo, str) and motivo.strip() else _SEM_MOTIVO)


def _numero(bruto: object, onde: str) -> Reading[float]:
    leitura = _leitura(bruto, onde)
    if isinstance(leitura, Read):
        if isinstance(leitura.value, bool) or not isinstance(leitura.value, (int, float)):
            raise ValueError(f"{onde}: esperado numero, recebido {leitura.value!r}.")
        return Read(float(leitura.value))
    return leitura


def _texto(bruto: object, onde: str) -> Reading[str]:
    leitura = _leitura(bruto, onde)
    if isinstance(leitura, Read):
        if not isinstance(leitura.value, str):
            raise ValueError(f"{onde}: esperado texto, recebido {leitura.value!r}.")
        return Read(leitura.value)
    return leitura


def _opcional(bruto: object, onde: str) -> Reading[float] | None:
    return None if bruto is None else _numero(bruto, onde)


def _proveniencia(bruto: object, solver: str, onde: str) -> SolverProvenance | None:
    """Bloco `provenance` do fixture. Ausente continua ausente: nao se preenche com Unreadable."""
    if bruto is None:
        return None
    if not isinstance(bruto, dict):
        raise ValueError(f"{onde}.provenance deve ser um objeto.")
    build = _texto(bruto.get("build"), f"{onde}.provenance.build")
    e_nash = _numero(bruto.get("eNash"), f"{onde}.provenance.eNash")
    unidade_bruta = bruto.get("eNashUnit")
    if unidade_bruta is None:
        return SolverProvenance(solver=solver, build=build, e_nash=e_nash)
    unidade = _texto(unidade_bruta, f"{onde}.provenance.eNashUnit")
    return SolverProvenance(
        solver=solver,
        build=build,
        e_nash=e_nash,
        e_nash_unit=Read(ENashUnit(unidade.value)) if isinstance(unidade, Read) else unidade,
    )


def _lado(bruto: dict, regime: Regime, seats: tuple[Seat, ...], ambiguo: bool, onde: str) -> EvidenceSide:
    if bruto.get("regime") != regime.value:
        raise ValueError(f"{onde}: regime {bruto.get('regime')!r} onde se esperava {regime.value}.")
    solver = bruto.get("solver")
    if not isinstance(solver, str) or not solver.strip():
        raise ValueError(f"{onde}: solver ausente.")
    acoes_brutas = bruto.get("actions")
    if not isinstance(acoes_brutas, list) or not acoes_brutas:
        raise ValueError(f"{onde}: cenario sem acoes.")
    acoes = tuple(
        EvidenceAction(
            label=str(a.get("label", "")),
            frequency_pct=_numero(a.get("frequencyPct"), f"{onde}.actions[{i}].frequencyPct"),
            sizing_bb=_opcional(a.get("sizingBb"), f"{onde}.actions[{i}].sizingBb"),
            combos=_opcional(a.get("combos"), f"{onde}.actions[{i}].combos"),
        )
        for i, a in enumerate(acoes_brutas)
    )
    cenario = ScenarioContract(
        regime=regime,
        stack_unit=StackUnit.BIG_BLINDS,
        seats=seats,
        ranges=RANGES_DECLARADAS,
        provenance=_proveniencia(bruto.get("provenance"), solver, onde),
        horizon=HORIZONTE_DECLARADO,
        agent_policy=POLITICA_AMBIGUA if ambiguo else POLITICA_NAO_DECLARADA,
        payouts=Read(CANONICAL_PAYOUTS) if regime is Regime.ICM_EV else None,
    )
    return EvidenceSide(
        scenario=cenario,
        solver=solver,
        actions=acoes,
        total_combos=_opcional(bruto.get("totalCombos"), f"{onde}.totalCombos"),
    )


def load_aula12_pairs(path: Path = DATA_PATH) -> tuple[TranscribedPair, ...]:
    """Carrega os sete pares. Falha fechado em qualquer desvio de forma ou de valor."""
    try:
        bruto = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Espelho dos pares ilegivel em {path}: {exc}") from exc
    if not isinstance(bruto, dict) or bruto.get("documentSha256") != AULA_1_2_SHA256:
        raise ValueError("Espelho aponta documento diferente do SHA-256 da Aula 1.2.")
    ambiguos = bruto.get("atribuicaoAmbiguaNodelock")
    itens = bruto.get("pares")
    if not isinstance(ambiguos, list) or not isinstance(itens, list) or len(itens) != EXPECTED_PAIR_COUNT:
        raise ValueError(f"Espelho deve trazer {EXPECTED_PAIR_COUNT} pares e a lista de ambiguidade de nodelock.")

    pares: list[TranscribedPair] = []
    for item in itens:
        chave, par = item.get("chave"), item.get("par")
        if not isinstance(chave, str) or not isinstance(par, dict):
            raise ValueError("Cada entrada exige chave e par.")
        fonte, contexto = par.get("source", {}), par.get("context", {})
        jogadores = contexto.get("players") or []
        seats = tuple(Seat(str(j.get("id", "")), _numero(j.get("stackBb"), f"{chave}.players")) for j in jogadores)
        ambiguo = chave in ambiguos
        chip = _lado(par.get("chipEv", {}), Regime.CHIP_EV, seats, ambiguo, f"{chave}.chipEv")
        icm = _lado(par.get("icmEv", {}), Regime.ICM_EV, seats, ambiguo, f"{chave}.icmEv")
        contrato = EvidencePairContract(
            document_sha256=str(fonte.get("documentSha256", "")),
            figure_index=int(fonte.get("figureIndex", -1)),
            node_label=str(fonte.get("nodeLabel", "")),
            chip_ev=chip.scenario,
            icm_ev=icm.scenario,
        )
        board = _texto(contexto.get("board"), f"{chave}.board")
        pares.append(
            TranscribedPair(
                key=chave,
                street=str(contexto.get("street", "")),
                board=board,
                pot_bb=_numero(contexto.get("potBb"), f"{chave}.potBb"),
                contract=contrato,
                chip_ev=chip,
                icm_ev=icm,
                nodelock_ambiguous=ambiguo,
            )
        )

    chaves = [p.key for p in pares]
    if len(set(chaves)) != len(chaves):
        raise ValueError(f"Chaves de par repetidas: {chaves}.")
    return tuple(pares)


def pair_by_key(key: str, pairs: tuple[TranscribedPair, ...] | None = None) -> TranscribedPair:
    for par in pairs if pairs is not None else load_aula12_pairs():
        if par.key == key:
            return par
    raise KeyError(key)
