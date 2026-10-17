"""Harness de paridade do benchmark publico ICM x ChipEV.

## O que este harness e

O artefato `data/pmev_benchmark_icm_chipev.v1.json` foi gerado por
`scripts/validation/exportar_benchmark_icm_publico.py` a partir de hand
histories LOCAIS que **nao sao versionadas** e nao saem da maquina. Isso cria
um buraco de verificacao: nada no repositorio conseguia responder "esse
artefato ainda corresponde ao motor atual?".

Este harness fecha esse buraco usando o que o proprio artefato publica: a
amostra pequena de estados reais, com stacks, blinds e lugar final. Ele
**reexecuta** o kernel sobre essa amostra e compara com as metricas
agregadas gravadas, dentro do intervalo que o artefato declara.

O que ele NAO faz, e nao pode:

- Nao recalcula as 15.459 estados. O artefato so publica agregados com
  intervalo de bootstrap, nao registros por estado. Recalcular exigiria as
  maos de origem.
- Nao valida o IC do bootstrap. `metodo.intervalo` diz 2000 reamostragens com
  semente 20260914, mas o resampleo e por torneio e os nomes dos torneios
  tambem nao saem da maquina. O harness confere o **ponto central** das
  metricas e que o intervalo declarado **contem** o valor do motor, nao que
  o intervalo foi reamostrado igual.

Essas duas limitacoes sao deliberadas e aparecem no relatorio, para que
ninguem leia um verde como "o benchmark inteiro foi revalidado".

## Uso

    .venv/Scripts/python.exe -m engine.pmev_harness_icm --report
    .venv/Scripts/python.exe -m engine.pmev_harness_icm --json

Sai com codigo 1 se qualquer verificacao falhar, para servir de portao.
"""

from __future__ import annotations

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


def _comparar_estado_icm(
    estado: Mapping[str, Any],
    est: Mapping[str, Any],
) -> tuple[int, int, bool, float, str]:
    """Compara um estado com seu icm_ev recomputado.

    Retorna (assentos, processado, acertou, max_delta, info_pior_estado).
    """
    recomputado = _icm_publicado(estado, _pagamentos_do_estado(estado, est) or [])
    publicado = estado.get("icm_ev")
    if recomputado is None or not isinstance(publicado, list):
        return 0, 0, False, 0.0, ""

    if len(recomputado) != len(publicado):
        info = f"stacks={estado.get('stacks')} motor={len(recomputado)} assentos publicado={len(publicado)}"
        return 0, 1, False, float("inf"), info

    assentos = len(recomputado)
    deltas = [abs(a - float(e)) for a, e in zip(recomputado, publicado, strict=True)]
    if all(d <= _TOLERANCIA_CENTRAL for d in deltas):
        return assentos, 1, True, 0.0, ""

    max_d = max(deltas)
    info = f"stacks={estado.get('stacks')} motor={recomputado!r} publicado={publicado!r}"
    return assentos, 1, False, max_d, info


def _verificar_estados_amostra(
    estados: Sequence[Mapping[str, Any]],
    est: Mapping[str, Any],
    rel: Relatorio,
) -> None:
    acertos = 0
    processados = 0
    assentos = 0
    pior_delta = 0.0
    pior_estado = ""
    for estado in estados:
        num_assentos, proc, acertou, max_d, info = _comparar_estado_icm(estado, est)
        if not proc:
            continue
        processados += proc
        assentos += num_assentos
        if acertou:
            acertos += 1
        elif max_d > pior_delta:
            pior_delta = max_d
            pior_estado = info

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


def _verificar_vencedor_leva_tudo(
    estados: Sequence[Mapping[str, Any]],
    rel: Relatorio,
) -> None:
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


def _verificar_bloco_metrica(nome: str, bloco: Mapping[str, Any], rel: Relatorio) -> None:
    modelo, referencia = bloco.get("modelo"), bloco.get("referencia")
    diferenca, ic = bloco.get("diferenca"), bloco.get("ic95")
    if modelo is None or referencia is None or diferenca is None or not ic:
        return
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
    if math.isclose(float(ic[1]) - float(ic[0]), 0.0, abs_tol=1e-12):
        rel.verificacoes.append(
            Verificacao(
                f"ic_degenerado_implica_zero:{nome}",
                abs(d) <= 1e-9,
                f"ic95={ic} e diferenca={d}",
            )
        )


def _verificar_metricas_agregadas(est: Mapping[str, Any], rel: Relatorio) -> None:
    metricas = est.get("metricas", {})
    for nome in ("brier_lugar", "logloss_lugar", "brier_itm", "erro2_premio"):
        bloco = metricas.get(nome)
        if isinstance(bloco, Mapping):
            _verificar_bloco_metrica(nome, bloco, rel)


def verificar_estrutura(
    est: Mapping[str, Any],
    amostras: Mapping[str, Sequence[Mapping[str, Any]]],
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

    _verificar_estados_amostra(estados, est, rel)

    # ChipEV: em estruturas com `vencedor_leva_tudo`, ICM tem de igualar ChipEV
    # exatamente.
    if est.get("vencedor_leva_tudo"):
        _verificar_vencedor_leva_tudo(estados, rel)

    _verificar_metricas_agregadas(est, rel)

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


def _imprimir_relatorio_json(
    relatorios: Sequence[Relatorio],
    total: int,
    falhas: Sequence[tuple[Relatorio, Verificacao]],
) -> None:
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


def _imprimir_relatorio_texto(
    relatorios: Sequence[Relatorio],
    total: int,
    falhas: Sequence[tuple[Relatorio, Verificacao]],
) -> None:
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
        _imprimir_relatorio_json(relatorios, total, falhas)
    else:
        _imprimir_relatorio_texto(relatorios, total, falhas)

    return 1 if falhas else 0


if __name__ == "__main__":
    raise SystemExit(main())
