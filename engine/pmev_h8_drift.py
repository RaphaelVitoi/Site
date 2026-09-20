"""H8 -- Downward Drift de Sizings: a medicao reprodutivel sobre os sete pares da Aula 1.2.

O QUE ESTE MODULO E: a estatistica de H8 e o criterio de falsificacao, escritos
em codigo e fixados ANTES de rodar. `scripts/validation/testar_h8_downward_drift.py`
executa; aqui so se define o que sera medido e o que contara como refutacao.

O QUE ESTE MODULO NAO E: reproducao da evidencia. Os numeros dos pares vieram de
captura de tela; os solvers (GTO Wizard e HRC) sao externos e o build nao foi
lido. `count_reproducible_pairs` segue 0 de 7, e nada aqui muda isso. O que passa
a ser reprodutivel e a MEDICAO: fonte com SHA-256 fixado, criterio em codigo,
intervalo por bootstrap com semente. Sao duas perguntas distintas, e confundi-las
transformaria uma transcricao em experimento.

POR QUE A AMOSTRA NAO SAI DA HAND HISTORY. Medido em 2026-09-18:
`data/pmev_benchmark_icm_chipev.v1.json` declara `"amostras so com stacks, blinds
e lugar"` e as hand histories nao sao versionadas
(`scripts/validation/exportar_benchmark_icm_publico.py`). Aquela amostra nao
contem acao nem sizing; H8 mede frequencia de aposta por fracao do pote. Nao ha
o que medir la.

RECORTE, arbitrado pelo Tier 0 em 2026-09-18 (opcao A): so NOS DE APOSTA LIVRE.
O enunciado de H8 -- "frequencia de apostas >= 50%" -- tem referente sem
ambiguidade onde ha aposta. Em aumento nao tem: o rotulo do GTO Wizard mede
raise-by sobre o pote-apos-call (`Raise 5 (50%)` com pote 6.73 e 74% do pote por
sizing/pote), e o lado HRC nao expoe rotulo de percentual para calibrar a
conversao. `test_pmev_h8_drift.py` mede as duas coisas em vez de as afirmar.

O discriminante de aposta livre e o mesmo de `classifyActionNoCenario` no
TypeScript: nao se aumenta onde se pode pedir mesa.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import comb, isfinite
import random
import re
from statistics import fmean
from typing import Final

from engine.pmev_aula12_evidence import EvidenceSide, TranscribedPair, load_aula12_pairs
from engine.pmev_scenario import Read

# --- Parametros do teste, fixados antes de qualquer execucao. -----------------

LIMIAR_FRACAO_DO_POTE: Final[float] = 0.50
"""Fracao do pote que separa aposta grande de pequena. Literal do enunciado de H8."""

N_BOOTSTRAP: Final[int] = 2000
"""Reamostragens. Mesmo numero do benchmark ICM x ChipEV."""

SEMENTE: Final[int] = 20260918
"""Semente do bootstrap. Declarada para que o intervalo seja identico a cada corrida."""

TOLERANCIA_ROTULO_PP: Final[float] = 1.0
"""Folga ao conferir sizing/pote contra o percentual que o proprio rotulo declara."""

MASSA_AGRESSIVA_MINIMA_PCT: Final[float] = 0.5
"""Corte de massa residual do recorte secundario. Convencao ja em uso em A6 do contraste TypeScript."""

TOLERANCIA_LIMIAR_ESTRITA: Final[float] = 0.0
"""Comparacao literal: sizing/pote >= 0.50, sem folga."""

TOLERANCIA_LIMIAR_POR_RESOLUCAO: Final[float] = 0.005
"""Folga igual a resolucao do rotulo do solver (percentual inteiro), ou seja 0.5 p.p.

POR QUE ELA EXISTE, e a descoberta que a obrigou. O GTO Wizard rotula um ramo do
PAR_2 como `Bet 2.8 (50%)`; medido, 2.8 / 5.63 = 49.73%. O ramo correspondente do
HRC, `bets 2.81bb`, da 49.91%. Os dois estao ABAIXO de 0.50 por quantizacao de
leitura: sizing e pote sao numeros arredondados lidos de uma captura, e a arvore
do solver foi construida com um ramo de meio pote.

Comparar com `>=` estrito uma razao conhecida a +-0.3 p.p. decide o caso no
arredondamento, nao no fenomeno. Comparar com folga decide no rotulo declarado.
Nenhuma das duas e obviamente certa, e por isso NENHUMA foi escolhida: a corrida
reporta as DUAS, e o relatorio declara em qual o sinal muda -- se mudar.
"""

__all__ = [
    "LIMIAR_FRACAO_DO_POTE",
    "MASSA_AGRESSIVA_MINIMA_PCT",
    "N_BOOTSTRAP",
    "SEMENTE",
    "TOLERANCIA_LIMIAR_ESTRITA",
    "TOLERANCIA_LIMIAR_POR_RESOLUCAO",
    "TOLERANCIA_ROTULO_PP",
    "ActionClass",
    "H8Result",
    "NodeDrift",
    "Verdict",
    "aggressive_mass_pct",
    "classify_action",
    "classify_action_in_side",
    "free_bet_nodes",
    "frequency_at_or_above_threshold",
    "is_free_bet_node",
    "label_declared_pot_pct",
    "measure_h8",
    "node_drift",
    "sign_test_p_two_sided",
]


class ActionClass(StrEnum):
    """Classes de acao. Espelha `ActionClass` de `solver/evidenceContract.ts`."""

    FOLD = "fold"
    CHECK = "check"
    CALL = "call"
    BET = "bet"
    RAISE = "raise"
    UNKNOWN = "unknown"


_RE_FOLD: Final[re.Pattern[str]] = re.compile(r"^folds?\b")
_RE_CHECK: Final[re.Pattern[str]] = re.compile(r"^che(ck|cks)\b")
_RE_CALL: Final[re.Pattern[str]] = re.compile(r"^calls?\b")
_RE_ALLIN: Final[re.Pattern[str]] = re.compile(r"\ball[- ]?in\b|^allin\b")
_RE_RAISE: Final[re.Pattern[str]] = re.compile(r"^raises?\b")
_RE_BET: Final[re.Pattern[str]] = re.compile(r"^bets?\b")
_RE_PCT: Final[re.Pattern[str]] = re.compile(r"(\d{1,4}(?:[.,]\d{1,3})?) {0,3}%")


def classify_action(label: str) -> ActionClass:
    """Classe pelo rotulo. Porte literal de `classifyAction` do TypeScript."""
    texto = str(label).strip().lower()
    if _RE_FOLD.search(texto):
        return ActionClass.FOLD
    if _RE_CHECK.search(texto):
        return ActionClass.CHECK
    if _RE_CALL.search(texto):
        return ActionClass.CALL
    if _RE_ALLIN.search(texto):  # antes de raise: `Allin 35` nao pode cair em unknown
        return ActionClass.RAISE
    if _RE_RAISE.search(texto):
        return ActionClass.RAISE
    if _RE_BET.search(texto):
        return ActionClass.BET
    return ActionClass.UNKNOWN


def classify_action_in_side(label: str, side: EvidenceSide) -> ActionClass:
    """Classe DENTRO do cenario: onde ha check nao ha aposta pendente, logo nao ha aumento."""
    classe = classify_action(label)
    if classe is not ActionClass.RAISE:
        return classe
    pode_pedir_mesa = any(classify_action(a.label) is ActionClass.CHECK for a in side.actions)
    return ActionClass.BET if pode_pedir_mesa else ActionClass.RAISE


def is_free_bet_node(side: EvidenceSide) -> bool:
    """O lado oferece aposta livre quando alguma acao se classifica como `bet` no cenario."""
    return any(classify_action_in_side(a.label, side) is ActionClass.BET for a in side.actions)


def label_declared_pot_pct(label: str) -> float | None:
    """Percentual do pote que o proprio rotulo declara (`Bet 2.8 (50%)` -> 50). O HRC nao declara."""
    achado = _RE_PCT.search(str(label))
    if achado is None:
        return None
    valor = float(achado.group(1).replace(",", "."))
    return valor if isfinite(valor) else None


def _ramos_de_aposta(side: EvidenceSide) -> tuple[tuple[str, float, float], ...]:
    """Ramos `bet` com rotulo, sizing em bb e frequencia em pp. Leitura ilegivel recusa a medida."""
    ramos: list[tuple[str, float, float]] = []
    for acao in side.actions:
        if classify_action_in_side(acao.label, side) is not ActionClass.BET:
            continue
        if not isinstance(acao.frequency_pct, Read):
            raise ValueError(f"{acao.label}: frequencia ilegivel; H8 nao se mede sobre leitura ausente.")
        if acao.sizing_bb is None or not isinstance(acao.sizing_bb, Read):
            raise ValueError(f"{acao.label}: sizing ilegivel; H8 nao se mede sobre leitura ausente.")
        ramos.append((acao.label, acao.sizing_bb.value, acao.frequency_pct.value))
    return tuple(ramos)


def aggressive_mass_pct(side: EvidenceSide) -> float:
    """Massa agressiva do lado, em pontos percentuais."""
    return sum(f for _, _, f in _ramos_de_aposta(side))


def frequency_at_or_above_threshold(
    side: EvidenceSide,
    pot_bb: float,
    threshold: float = LIMIAR_FRACAO_DO_POTE,
    tolerance: float = TOLERANCIA_LIMIAR_ESTRITA,
) -> float:
    """F>=50: soma das frequencias dos ramos de aposta cujo sizing alcanca a fracao do pote.

    Fracao medida como sizing/pote, que e a convencao do proprio GTO Wizard nos
    rotulos de aposta -- conferida, nao presumida, por
    `test_convencao_de_fracao_do_pote_reproduz_o_rotulo_em_todo_no_de_aposta`.

    `tolerance` e a folga de quantizacao de leitura; ver
    `TOLERANCIA_LIMIAR_POR_RESOLUCAO` para o caso medido que a exigiu.
    """
    if not isfinite(pot_bb) or pot_bb <= 0:
        raise ValueError(f"Pote invalido para medir fracao: {pot_bb}.")
    if tolerance < 0:
        raise ValueError(f"Tolerancia negativa nao e folga de leitura: {tolerance}.")
    corte = threshold - tolerance
    return sum(f for _, sz, f in _ramos_de_aposta(side) if sz / pot_bb >= corte)


@dataclass(frozen=True, slots=True)
class NodeDrift:
    """Um no do recorte: F>=50 nos dois regimes e a diferenca entre eles."""

    key: str
    node_label: str
    street: str
    pot_bb: float
    f_ge_threshold_chip_pct: float
    f_ge_threshold_icm_pct: float
    aggressive_mass_chip_pct: float
    aggressive_mass_icm_pct: float

    @property
    def delta_pp(self) -> float:
        """ICM menos ChipEV, em pontos percentuais. Negativo e a direcao que H8 afirma."""
        return self.f_ge_threshold_icm_pct - self.f_ge_threshold_chip_pct


def node_drift(
    par: TranscribedPair,
    threshold: float = LIMIAR_FRACAO_DO_POTE,
    tolerance: float = TOLERANCIA_LIMIAR_ESTRITA,
) -> NodeDrift:
    """Mede um par. Exige pote lido: sem ele nao ha fracao do pote a calcular."""
    if not isinstance(par.pot_bb, Read):
        raise ValueError(f"{par.key}: pote ilegivel; a fracao do pote nao se calcula.")
    pote = par.pot_bb.value
    return NodeDrift(
        key=par.key,
        node_label=par.contract.node_label,
        street=par.street,
        pot_bb=pote,
        f_ge_threshold_chip_pct=frequency_at_or_above_threshold(par.chip_ev, pote, threshold, tolerance),
        f_ge_threshold_icm_pct=frequency_at_or_above_threshold(par.icm_ev, pote, threshold, tolerance),
        aggressive_mass_chip_pct=aggressive_mass_pct(par.chip_ev),
        aggressive_mass_icm_pct=aggressive_mass_pct(par.icm_ev),
    )


def free_bet_nodes(pares: tuple[TranscribedPair, ...] | None = None) -> tuple[TranscribedPair, ...]:
    """Os pares em que AMBOS os regimes oferecem aposta livre.

    Exigir os dois lados nao e zelo: um no classificado como aposta de um lado e
    como aumento do outro nao e o mesmo no, e a diferenca entre os regimes
    deixaria de ser comparavel.
    """
    todos = load_aula12_pairs() if pares is None else pares
    return tuple(p for p in todos if is_free_bet_node(p.chip_ev) and is_free_bet_node(p.icm_ev))


def sign_test_p_two_sided(n_negativos: int, n_total: int) -> float:
    """p exato bicaudal do teste de sinal sob p=0.5. Sem aproximacao normal: n e pequeno."""
    if n_total <= 0:
        raise ValueError("Teste de sinal sem observacoes.")
    if not 0 <= n_negativos <= n_total:
        raise ValueError(f"{n_negativos} negativos em {n_total} observacoes e impossivel.")
    extremo = max(n_negativos, n_total - n_negativos)
    cauda = sum(comb(n_total, k) for k in range(extremo, n_total + 1)) / (2**n_total)
    return min(1.0, 2.0 * cauda)


def _bootstrap_por_no(deltas: list[float], n_boot: int, rng: random.Random) -> tuple[float, float]:
    """IC95 percentil da media, reamostrando NOS com reposicao. Mesmo desenho de `pmev_hh_benchmark._bootstrap`."""
    medias = []
    for _ in range(n_boot):
        amostra = [rng.choice(deltas) for _ in deltas]
        medias.append(fmean(amostra))
    medias.sort()
    return medias[int(0.025 * (n_boot - 1))], medias[int(0.975 * (n_boot - 1))]


class Verdict(StrEnum):
    """Veredito de H8. So estes dois valores existem, e o criterio esta fixado abaixo."""

    FALSIFICADA = "falsificada"
    SOBREVIVE = "sobrevive"


@dataclass(frozen=True, slots=True)
class H8Result:
    """Resultado de uma corrida. Carrega o criterio junto do numero, para que nao se leiam separados."""

    recorte: str
    nodes: tuple[NodeDrift, ...]
    delta_medio_pp: float
    ic95_pp: tuple[float, float]
    n_negativos: int
    p_sinal_bicaudal: float
    p_minimo_alcancavel: float
    verdict: Verdict
    motivo: str
    n_bootstrap: int
    semente: int
    limiar_fracao_do_pote: float
    tolerancia_limiar: float

    @property
    def n_nos(self) -> int:
        return len(self.nodes)


def measure_h8(
    pares: tuple[TranscribedPair, ...] | None = None,
    *,
    recorte: str = "nos de aposta livre",
    threshold: float = LIMIAR_FRACAO_DO_POTE,
    tolerance: float = TOLERANCIA_LIMIAR_ESTRITA,
    n_boot: int = N_BOOTSTRAP,
    seed: int = SEMENTE,
) -> H8Result:
    """Mede H8 e aplica o criterio de falsificacao.

    CRITERIO, DECLARADO ANTES DA PRIMEIRA CORRIDA:

      H8 SOBREVIVE  se  delta_medio < 0  E  o topo do IC95 < 0.
      H8 e FALSIFICADA em qualquer outro caso -- delta_medio >= 0, ou IC95
      contendo zero.

    O enunciado do registro e "frequencia de apostas >= 50% inalterada" como
    condicao de refuta: IC95 que contem zero e exatamente "inalterada" nao
    excluida pelos dados, e nao se lê como confirmacao fraca.
    """
    nos = free_bet_nodes(pares)
    if not nos:
        raise ValueError("Recorte vazio: nada medido nao e resultado.")
    drifts = tuple(node_drift(p, threshold, tolerance) for p in nos)
    deltas = [d.delta_pp for d in drifts]

    media = fmean(deltas)
    rng = random.Random(seed)  # noqa: S311 - PRNG deterministico para bootstrap de IC, nao criptografia  # Record-Id: registro-2026-09-20-h8-bootstrap-ic95
    ic_baixo, ic_alto = _bootstrap_por_no(deltas, n_boot, rng)

    n_negativos = sum(1 for d in deltas if d < 0)
    p_sinal = sign_test_p_two_sided(n_negativos, len(deltas))
    p_minimo = sign_test_p_two_sided(len(deltas), len(deltas))

    if media < 0 and ic_alto < 0:
        veredito, motivo = Verdict.SOBREVIVE, "delta medio negativo e IC95 inteiro abaixo de zero"
    elif media >= 0:
        veredito, motivo = Verdict.FALSIFICADA, "delta medio nao e negativo"
    else:
        veredito, motivo = Verdict.FALSIFICADA, "IC95 contem zero: frequencia inalterada nao e excluida"

    return H8Result(
        recorte=recorte,
        nodes=drifts,
        delta_medio_pp=media,
        ic95_pp=(ic_baixo, ic_alto),
        n_negativos=n_negativos,
        p_sinal_bicaudal=p_sinal,
        p_minimo_alcancavel=p_minimo,
        verdict=veredito,
        motivo=motivo,
        n_bootstrap=n_boot,
        semente=seed,
        limiar_fracao_do_pote=threshold,
        tolerancia_limiar=tolerance,
    )
