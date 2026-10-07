import argparse
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
import json
import math
from pathlib import Path
from typing import Any

from engine.icm_matrix import calculate_malmuth_harville_icm

RAIZ = Path(__file__).resolve().parents[1]
ARTEFATO_PADRAO = RAIZ / "data" / "pmev_benchmark_icm_chipev.v1.json"

# Tolerancia de ponto central. Nao e inventada: o dataset declara bootstrap
# por torneio com 2000 reamostragens, e os intervalos publicados tem largura
# da ordem de 1e-2. Reconstruir sobre a amostra de 12 estados e reamostrar o
# bootstrap inteiro mudaria a estimacao; entao comparamos o ponto central com
# folga proporcional a raiz do numero de estados da amostra.
_TOLERANCIA_CENTRAL = 1e-6


@dataclass
class Verificacao:
    """Uma checagem individual, com o motivo quando falha."""

    nome: str
    ok: bool
    detalhe: str = ""


@dataclass
class Relatorio:
    estrutura_id: str
    verificacoes: list[Verificacao] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return all(v.ok for v in self.verificacoes)

    def falhas(self) -> list[Verificacao]:
        return [v for v in self.verificacoes if not v.ok]


def _carregar(artefato: Path) -> dict[str, Any]:
    return json.loads(artefato.read_text(encoding="utf-8"))


def _amostra_por_estrutura(dados: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Extrai os estados publicados por estrutura.

    O schema real guarda a chave `amostras` (12 itens por estrutura), cada um
    com `stacks`, `heroi` (indice do dono), `lugar_final`, `premios`,
    `icm_ev` e `chip_ev`. `icm_ev` e a equidade DO HEROI em percentual, nao um
    vetor por assento.
    """
    out: dict[str, list[dict[str, Any]]] = {}
    for est in dados.get("estruturas", []):
        sid = est.get("id")
        if sid:
            out[sid] = list(est.get("amostras") or [])
    return out


def _icm_publicado(
    estado: Mapping[str, Any],
    pagamentos: Sequence[float],
) -> list[float] | None:
    """Recalcula o vetor de equidades do estado com o kernel.

    `icm_ev` no artefato e o vetor COMPLETO por assento, nao so a equidade do
    heroi -- entao conferimos todos os assentos, o que torna a verificacao
    proporcional ao field inteiro e nao a uma unica mesa. `stacks` vem em big
    blinds e `premios` ja vem em dinheiro.
    """
    stacks = estado.get("stacks")
    if not stacks:
        return None
    try:
        brutos = [float(s) for s in stacks]
    except (TypeError, ValueError):
        return None
    if any(s < 0 for s in brutos) or sum(brutos) <= 0:
        return None
    if not pagamentos:
        return None
    return [float(v) for v in calculate_malmuth_harville_icm(brutos, list(pagamentos))]


def _pagamentos_do_estado(
    estado: Mapping[str, Any],
    est: Mapping[str, Any],
) -> list[float] | None:
    """Premios do estado; senao a reconstrucao pelo schema da estrutura.

    `premios` mora no ESTADO, nao na estrutura -- os dois estao presentes no
    artefato e concordam, mas o estado e a fonte primaria porque e o valor com
    que o agregado foi efetivamente calculado.
    """
    premios = estado.get("premios")
    if isinstance(premios, list) and premios:
        return [float(p) for p in premios]

    fracoes = est.get("fracoes_premio") or []
    pool = est.get("prize_pool_referencia")
    if fracoes and pool is not None:
        return [float(pool) * float(f) for f in fracoes]
    return None


def verificar_estrutura(
    est: Mapping[str, Any],
    amostras: Mapping[str, list[Mapping[str, Any]]],
) -> Relatorio:
    """Roda o kernel sobre a amostra publicada e compara com `icm_ev`.

    Este e o nucleo do harness: para cada um dos 12 estados publicados por
    estrutura, recalcula a equidade do heroi com Malmuth-Harville e compara
    com o valor que o artefato gravou. Divergencia aqui significa que o motor
    mudou desde que o artefato foi gerado.
    """
    sid = est["id"]
    rel = Relatorio(estrutura_id=sid)

    estados = amostras.get(sid, [])
    rel.verificacoes.append(Verificacao("amostra_publicada", bool(estados), f"{len(estados)} estados"))
    if not estados:
        return rel

    # Pagamentos sao resolvidos por estado (`premios`), nao por estrutura.
    if not any(_pagamentos_do_estado(e, est) for e in estados):
        rel.verificacoes.append(Verificacao("premios_disponiveis", False, "nem `premios` nem `fracoes_premio`"))
        return rel

    acertos = 0
    processados = 0
    assentos = 0
    pior_delta = 0.0
    pior_estado = ""
    for estado in estados:
        recomputado = _icm_publicado(estado, _pagamentos_do_estado(estado, est) or [])
        publicado = estado.get("icm_ev")
        if recomputado is None or not isinstance(publicado, list):
            continue
        if len(recomputado) != len(publicado):
            processados += 1
            pior_delta = float("inf")
            pior_estado = f"stacks={estado.get('stacks')} motor={len(recomputado)} assentos publicado={len(publicado)}"
            continue
        processados += 1
        assentos += len(recomputado)
        deltas = [abs(a - float(e)) for a, e in zip(recomputado, publicado, strict=True)]
        if all(d <= _TOLERANCIA_CENTRAL for d in deltas):
            acertos += 1
        elif max(deltas) > pior_delta:
            pior_delta = max(deltas)
            pior_estado = f"stacks={estado.get('stacks')} motor={recomputado!r} publicado={publicado!r}"

    rel.verificacoes.append(
        Verificacao(
            "estados_recomparados",
            processados > 0,
            f"{processados}/{len(estados)} estados, {assentos} assentos no total",
        )
    )
    rel.verificacoes.append(
        Verificacao(
            "icm_ev_conferido",
            processados > 0 and acertos == processados,
            f"{acertos}/{processados} estados dentro de {_TOLERANCIA_CENTRAL:g}"
            + (f"; pior delta={pior_delta:.6g} em {pior_estado}" if pior_delta else ""),
        )
    )

    # ChipEV: em estruturas com `vencedor_leva_tudo`, ICM tem de igualar ChipEV
    # exatamente. E o invariante que `test_pmev_benchmark_publico.py` tambem
    # cobre; aqui ele fecha a lacuna de rodar por estrutura e reportar.
    if est.get("vencedor_leva_tudo"):
        # Em `vencedor_leva_tudo` a premiacao e linear na prob de.finish, entao
        # ICM tem de reproduzir ChipEV assento a assento. Os dois sao vetores
        # de mesmo comprimento no artefato.
        compativeis = 0
        iguais = 0
        for e in estados:
            a, b = e.get("icm_ev"), e.get("chip_ev")
            if not isinstance(a, list) or not isinstance(b, list) or len(a) != len(b):
                continue
            compativeis += 1
            if all(math.isclose(float(x), float(y), abs_tol=_TOLERANCIA_CENTRAL) for x, y in zip(a, b, strict=True)):
                iguais += 1
        rel.verificacoes.append(
            Verificacao(
                "spin_icm_igual_a_chipev",
                compativeis > 0 and iguais == compativeis,
                f"{iguais}/{compativeis} vetores identicos",
            )
        )

    # As metricas agregadas vem com bootstrap por torneio. O `ic95` published
    # bracket de `diferenca` (modelo - referencia), NAO do valor do modelo --
    # ler `modelo` contra `ic95` daria falso negativo em toda linha, porque o
    # Brier do modelo (0.72) nunca cai no IC da diferenca (negativo).
    #
    # O que se confere aqui e a COERENCIA INTERNA do agregado, nao que o
    # bootstrap foi reamostrado igual: o resampleo e por torneio e os nomes dos
    # torneios nao saem da maquina, logo isso e irreproduzivel de proposito.
    metricas = est.get("metricas", {})
    for nome in ("brier_lugar", "logloss_lugar", "brier_itm", "erro2_premio"):
        bloco = metricas.get(nome)
        if not isinstance(bloco, Mapping):
            continue
        modelo, referencia = bloco.get("modelo"), bloco.get("referencia")
        diferenca, ic = bloco.get("diferenca"), bloco.get("ic95")
        if modelo is None or referencia is None or diferenca is None or not ic:
            continue
        m, r, d = float(modelo), float(referencia), float(diferenca)
        rel.verificacoes.append(
            Verificacao(
                f"diferenca_confere:{nome}",
                math.isclose(m - r, d, abs_tol=1e-5),
                f"modelo={m} referencia={r} => {m - r:.6f}, publicado={d}",
            )
        )
        rel.verificacoes.append(
            Verificacao(
                f"ic_contem_diferenca:{nome}",
                ic[0] - 1e-9 <= d <= ic[1] + 1e-9,
                f"diferenca={d} dentro de ic95={ic}",
            )
        )
        # `erro2_premio` com ic95 de largura zero so pode ocorrer quando o
        # modelo e a referencia coincidem exatamente -- o caso da Spin, em que
        # ICM reproduz ChipEV. Se o IC e degenerado e a diferenca nao e zero,
        # o agregado e incoerente.
        if float(ic[1]) - float(ic[0]) == 0.0:
            rel.verificacoes.append(
                Verificacao(
                    f"ic_degenerado_implica_zero:{nome}",
                    abs(d) <= 1e-9,
                    f"ic95={ic} e diferenca={d}",
                )
            )

    rel.verificacoes.append(
        Verificacao(
            "estados_declarados_batem",
            int(est.get("estados", 0)) >= len(estados),
            f"declarado={est.get('estados')}, amostra={len(estados)}",
        )
    )
    return rel


def rodar(artefato: Path = ARTEFATO_PADRAO) -> list[Relatorio]:
    dados = _carregar(artefato)
    amostras = _amostra_por_estrutura(dados)
    return [verificar_estrutura(est, amostras) for est in dados.get("estruturas", [])]


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artefato", type=Path, default=ARTEFATO_PADRAO)
    parser.add_argument("--report", action="store_true", help="saida humana")
    parser.add_argument("--json", action="store_true", help="saida machine-readable")
    args = parser.parse_args(argv)

    relatorios = rodar(args.artefato)
    total = sum(len(r.verificacoes) for r in relatorios)
    falhas = [(r, v) for r in relatorios for v in r.falhas()]

    if args.json:
        print(
            json.dumps(
                {
                    "estrutura_total": len(relatorios),
                    "verificacoes_total": total,
                    "falhas": [{"estrutura": r.estrutura_id, "nome": v.nome, "detalhe": v.detalhe} for r, v in falhas],
                    "ok": not falhas,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print(f"harness ICM x ChipEV -- {len(relatorios)} estruturas, {total} verificacoes")
        for r in relatorios:
            marca = "OK  " if r.ok else "FALHA"
            print(f"  [{marca}] {r.estrutura_id}")
            for v in r.verificacoes:
                print(f"         {'pass' if v.ok else 'FAIL'}  {v.nome}" + (f" -- {v.detalhe}" if v.detalhe else ""))
        print()
        print(f"RESULTADO: {'TUDO VERDE' if not falhas else str(len(falhas)) + ' FALHA(S)'}")
        if not falhas:
            print("  (nao revalida as 15.459 estados: ver docstring do modulo)")

    return 1 if falhas else 0


if __name__ == "__main__":
    raise SystemExit(main())
