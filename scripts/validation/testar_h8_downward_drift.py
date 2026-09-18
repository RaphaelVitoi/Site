"""Corrida deterministica do teste de H8 -- Downward Drift de Sizings.

Uso (da raiz do Site):
    python scripts/validation/testar_h8_downward_drift.py [--saida <arquivo.json>]

A fonte e `data/aula12_pairs.json`, com SHA-256 do documento conferido no
carregador. Nada aqui e ajustado a dado: limiar, semente, numero de
reamostragens e criterio de falsificacao vivem em `engine/pmev_h8_drift.py`,
fixados antes da primeira corrida.

O QUE A SAIDA NAO AUTORIZA: chamar os pares de reproduziveis. A medicao e
reprodutivel; a observacao nao. `assess_reproducibility` dos contratos segue
`False` nos sete pares, e a saida declara isso em `reprodutibilidade`.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any

RAIZ = Path(__file__).resolve().parents[2]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

# pylint: disable=wrong-import-position
from engine.pmev_aula12_evidence import AULA_1_2_SHA256, load_aula12_pairs  # noqa: E402
from engine.pmev_h8_drift import (  # noqa: E402
    MASSA_AGRESSIVA_MINIMA_PCT,
    TOLERANCIA_LIMIAR_ESTRITA,
    TOLERANCIA_LIMIAR_POR_RESOLUCAO,
    H8Result,
    free_bet_nodes,
    measure_h8,
    node_drift,
)
from engine.pmev_scenario import count_reproducible_pairs  # noqa: E402

# pylint: enable=wrong-import-position


def _r(valor: float) -> float:
    return round(valor, 6)


def _resultado_em_json(resultado: H8Result) -> dict[str, Any]:
    return {
        "recorte": resultado.recorte,
        "tolerancia_limiar": resultado.tolerancia_limiar,
        "n_nos": resultado.n_nos,
        "delta_medio_pp": _r(resultado.delta_medio_pp),
        "ic95_pp": [_r(resultado.ic95_pp[0]), _r(resultado.ic95_pp[1])],
        "teste_de_sinal": {
            "negativos": resultado.n_negativos,
            "total": resultado.n_nos,
            "p_bicaudal": _r(resultado.p_sinal_bicaudal),
            "p_minimo_alcancavel": _r(resultado.p_minimo_alcancavel),
        },
        "veredito": str(resultado.verdict),
        "motivo": resultado.motivo,
        "nos": [
            {
                "chave": n.key,
                "street": n.street,
                "rotulo": n.node_label,
                "pote_bb": _r(n.pot_bb),
                "f_ge50_chipev_pp": _r(n.f_ge_threshold_chip_pct),
                "f_ge50_icmev_pp": _r(n.f_ge_threshold_icm_pct),
                "delta_pp": _r(n.delta_pp),
                "massa_agressiva_chipev_pp": _r(n.aggressive_mass_chip_pct),
                "massa_agressiva_icmev_pp": _r(n.aggressive_mass_icm_pct),
            }
            for n in resultado.nodes
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Mede H8 (downward drift de sizings) sobre os pares da Aula 1.2.")
    parser.add_argument("--saida", type=Path, default=None, help="grava o relatorio JSON neste caminho")
    args = parser.parse_args()

    pares = load_aula12_pairs()

    # As duas convencoes de fronteira rodam SEMPRE, e nenhuma e escolhida pelo
    # resultado. Ver TOLERANCIA_LIMIAR_POR_RESOLUCAO para o caso medido.
    principal = measure_h8(
        pares,
        recorte="primario: nos de aposta livre, fronteira estrita",
        tolerance=TOLERANCIA_LIMIAR_ESTRITA,
    )
    principal_frouxo = measure_h8(
        pares,
        recorte="primario: nos de aposta livre, fronteira por resolucao do rotulo",
        tolerance=TOLERANCIA_LIMIAR_POR_RESOLUCAO,
    )

    # Recorte secundario, declarado junto do primario e NAO substituto dele: o
    # filtro de massa residual e a convencao ja usada por A6 do contraste
    # TypeScript. Reportado a parte para que a escolha fique visivel.
    com_massa = tuple(
        p
        for p in free_bet_nodes(pares)
        if node_drift(p).aggressive_mass_chip_pct > MASSA_AGRESSIVA_MINIMA_PCT
    )
    secundario = measure_h8(
        com_massa,
        recorte="secundario: aposta livre com massa agressiva ChipEV nao residual, fronteira estrita",
        tolerance=TOLERANCIA_LIMIAR_ESTRITA,
    )
    secundario_frouxo = measure_h8(
        com_massa,
        recorte="secundario: aposta livre com massa agressiva ChipEV nao residual, fronteira por resolucao",
        tolerance=TOLERANCIA_LIMIAR_POR_RESOLUCAO,
    )

    relatorio: dict[str, Any] = {
        "schema": "pmev-h8-downward-drift/v1",
        "hipotese": "H8",
        "enunciado": "Downward Drift de Sizings",
        "criterio_falsificacao": (
            "H8 sobrevive apenas com delta medio < 0 E topo do IC95 < 0; "
            "delta medio >= 0 ou IC95 contendo zero falsificam."
        ),
        "fonte": {
            "arquivo": "data/aula12_pairs.json",
            "document_sha256": AULA_1_2_SHA256,
            "pares_no_documento": len(pares),
        },
        "metodo": {
            "estatistica": "F>=50 = soma das frequencias dos ramos de aposta com sizing >= 50% do pote",
            "fracao_do_pote": "sizing_bb / pote_bb, convencao conferida contra o percentual do rotulo do GTO Wizard",
            "recorte": "nos de aposta livre nos dois regimes; nos de aumento ficam fora por ambiguidade de convencao",
            "intervalo": (
                f"bootstrap por NO, {principal.n_bootstrap} reamostragens, "
                f"semente {principal.semente}, percentis 2.5 e 97.5"
            ),
            "ajuste": "nenhum parametro ajustado a dado; limiar, semente e criterio fixados antes da corrida",
        },
        "reprodutibilidade": {
            "medicao": "reprodutivel: fonte com SHA-256 fixado, criterio em codigo, semente declarada",
            "observacao": "NAO reprodutivel: transcricao de captura, solvers externos, build nao lido",
            "pares_reproduziveis": count_reproducible_pairs([p.contract for p in pares]),
        },
        "potencia": {
            "limite": (
                "teste de sinal com n pequeno: nenhum resultado possivel alcanca p < 0.05; "
                "'nao significativo' aqui nao refuta nem confirma"
            ),
            "p_minimo_alcancavel_primario": _r(principal.p_minimo_alcancavel),
            "p_minimo_alcancavel_secundario": _r(secundario.p_minimo_alcancavel),
        },
        "fronteira_do_limiar": {
            "caso": (
                "GTO Wizard rotula `Bet 2.8 (50%)` no PAR_2; medido, 2.8/5.63 = 49.73%. "
                "O ramo gemeo do HRC (2.81bb) da 49.91%. Os dois caem abaixo de 0.50 por "
                "arredondamento de leitura, e o ramo carrega 82.5 p.p. no lado ChipEV."
            ),
            "tratamento": "as duas convencoes rodam; nenhuma e escolhida pelo resultado",
            "sinal_concorda": principal.verdict is principal_frouxo.verdict,
        },
        "primario": _resultado_em_json(principal),
        "primario_fronteira_por_resolucao": _resultado_em_json(principal_frouxo),
        "secundario": _resultado_em_json(secundario),
        "secundario_fronteira_por_resolucao": _resultado_em_json(secundario_frouxo),
    }

    texto = json.dumps(relatorio, ensure_ascii=False, indent=2, sort_keys=False)
    print(texto)
    if args.saida is not None:
        args.saida.parent.mkdir(parents=True, exist_ok=True)
        args.saida.write_text(texto + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
