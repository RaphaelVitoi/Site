"""Gera o artefato publico do benchmark ICM x ChipEV a partir de hand histories LOCAIS.

Uso (da raiz do Site):
    .venv/Scripts/python.exe scripts/validation/exportar_benchmark_icm_publico.py --maos <dir> [--maos <dir> ...]

As hand histories nao sao versionadas e nao saem da maquina. O que sai e o agregado de
engine/pmev_benchmark_publico.py, gravado em data/, de onde o frontend o importa.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any

RAIZ = Path(__file__).resolve().parents[2]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

# pylint: disable=wrong-import-position
from engine.pmev_benchmark_publico import build_public_dataset  # noqa: E402
from engine.pmev_hh_benchmark import HeroObservation, hero_observations  # noqa: E402
from engine.pmev_hh_canon import is_complete_field, load_structures, match_structure, parse_pokerstars_hands  # noqa: E402
# pylint: enable=wrong-import-position

DESTINO_PADRAO = RAIZ / "data" / "pmev_benchmark_icm_chipev.v1.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Gera o artefato publico do benchmark ICM x ChipEV.")
    parser.add_argument("--maos", action="append", required=True, type=Path, help="diretorio com .txt de hand history")
    parser.add_argument("--saida", type=Path, default=DESTINO_PADRAO)
    parser.add_argument("--gerado-em", default=date.today().isoformat())
    parser.add_argument("--bootstrap", type=int, default=2000)
    args = parser.parse_args()

    estruturas = load_structures()
    textos = [p.read_text(encoding="utf-8", errors="replace") for d in args.maos for p in sorted(d.rglob("*.txt"))]
    if not textos:
        print("nenhum .txt encontrado nos diretorios de maos", file=sys.stderr)
        return 1

    # Funil medido aqui, onde as maos existem: lidas -> da familia -> field completo -> com resultado.
    maos_vistas: set[int] = set()
    por_estrutura: dict[str, dict[str, Any]] = {
        sid: {"maos_da_familia": 0, "estados_field_completo": 0} for sid in estruturas
    }
    for texto in textos:
        for mao in parse_pokerstars_hands(texto):
            if mao.hand_id in maos_vistas:
                continue
            maos_vistas.add(mao.hand_id)
            estrutura = match_structure(mao, estruturas.values())
            if estrutura is not None:
                por_estrutura[estrutura.id]["maos_da_familia"] += 1
                por_estrutura[estrutura.id]["estados_field_completo"] += int(is_complete_field(mao, estrutura))

    observacoes: dict[str, list[HeroObservation]] = {}
    for sid, estrutura in estruturas.items():
        vistos: set[int] = set()
        lista: list[HeroObservation] = []
        for texto in textos:
            for o in hero_observations(texto, estrutura):
                if o.hand_id not in vistos:
                    vistos.add(o.hand_id)
                    lista.append(o)
        observacoes[sid] = lista
        por_estrutura[sid]["estados_com_resultado"] = len(lista)

    dataset = build_public_dataset(
        observacoes,
        estruturas,
        generated_at=args.gerado_em,
        n_boot=args.bootstrap,
        funnel={"maos_ps_lidas": len(maos_vistas), "por_estrutura": por_estrutura},
    )
    args.saida.parent.mkdir(parents=True, exist_ok=True)
    args.saida.write_text(json.dumps(dataset, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    print(f"gravado {args.saida} -- {dataset['estados_total']} estados, digest {dataset['digest_amostra'][:12]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
