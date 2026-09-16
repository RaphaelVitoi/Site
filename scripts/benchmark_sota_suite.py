# ruff: noqa: T201, E402
# pylint: disable=wrong-import-position
"""Benchmark unificado do ecossistema: medido, com escopo declarado e veredito derivado.

Reescrito em 2026-09-16. A versao anterior imprimia como telemetria o texto fixo
"~5.2 GB VRAM GPU (-ngl 26)", declarava "Vulkan GPU Acceleration Active" pela existencia
de uma DLL, filtrava a saida do benchmark WASM por palavras sem acento que o script nao
escrevia mais, e terminava sempre em "CONCLUIDO COM SUCESSO". Agora:

1. motores Python: aquecimento, varias amostras, mediana;
2. WASM: consome o JSON de scripts/benchmark_wasm_quantum.mjs --json;
3. llama.cpp: inventario -- e so inventario, com a versao lida do proprio binario;
4. Ollama: modelos locais x nuvem; latencia so com --inferencia MODELO (carrega o modelo).

Uso:
    .venv/Scripts/python.exe scripts/benchmark_sota_suite.py [--amostras N] [--inferencia MODELO] [--json]
"""

from __future__ import annotations

import argparse
from collections.abc import Callable
import json
from pathlib import Path
import statistics
import subprocess
import sys
import time
from typing import Any
import urllib.request

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

import psutil

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.math_sota import calculate_geometric_sizing, calculate_perspectiva_vitoi_v7, calculate_rio_risk_v2
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine

OLLAMA = "http://127.0.0.1:11434"


def medir(trabalho: Callable[[], object], repeticoes: int, amostras: int) -> dict[str, float]:
    """Aquece, depois mede `amostras` lotes de `repeticoes` chamadas. Devolve ops/s pela mediana."""
    for _ in range(max(1, repeticoes // 10)):
        trabalho()
    tempos = []
    for _ in range(amostras):
        t0 = time.perf_counter()
        for _ in range(repeticoes):
            trabalho()
        tempos.append(time.perf_counter() - t0)
    mediana = statistics.median(tempos)
    return {
        "repeticoes": repeticoes,
        "amostras": amostras,
        "mediana_s": mediana,
        "min_s": min(tempos),
        "max_s": max(tempos),
        "ops_por_s": repeticoes / mediana if mediana > 0 else 0.0,
    }


def benchmark_python(amostras: int) -> list[dict[str, Any]]:
    stacks = [100.0, 75.0, 50.0, 25.0, 15.0, 10.0]
    payouts = [500.0, 300.0, 200.0]
    casos: list[tuple[str, Callable[[], object], int]] = [
        ("icm_malmuth_harville_6j_3premios", lambda: calculate_malmuth_harville_icm(stacks, payouts), 2_000),
        (
            "perspectiva_vitoi_v7",
            lambda: calculate_perspectiva_vitoi_v7(
                current_equity_pct=45.0,
                delta_win_pct=12.5,
                delta_lose_pct=8.0,
                dynamic_ev_fold=0.0,
                realization_factor=1.0,
                fgs_health=1.0,
                active_players=3,
                hero_invested=2.5,
                current_pot=7.5,
                stack_eff=25.0,
            ),
            10_000,
        ),
        (
            "geometric_sizing",
            lambda: calculate_geometric_sizing(current_pot=6.5, target_pot=100.0, remaining_streets=3),
            20_000,
        ),
        (
            "decision_tree",
            lambda: VitoiPerspectiveEngine.simulate_decision_tree(
                equity=0.45,
                pot_size=12.0,
                stack_eff=30.0,
                active_players=3,
                street_idx=1,
                hero_invested=3.0,
                ev_fold_dynamic=-1.5,
                structural_liability=4.5,
                valuation_stack=30.0,
                amortized_edge=1.2,
                aggression_factor=1.4,
                realization_factor=1.0,
            ),
            500,
        ),
        (
            "rio_risk_v2",
            lambda: calculate_rio_risk_v2(
                hero_invested=5.0, current_pot=10.0, hero_raw_stack=40.0, hero_position="OOP", active_players=4
            ),
            5_000,
        ),
    ]
    resultados = []
    for nome, trabalho, repeticoes in casos:
        r = medir(trabalho, repeticoes, amostras)
        resultados.append({"caso": nome, **r})
        print(
            f"   {nome:<36} {r['ops_por_s']:>14,.0f} ops/s   "
            f"(mediana de {amostras}, faixa {repeticoes / r['max_s']:,.0f}..{repeticoes / r['min_s']:,.0f})"
        )
    return resultados


def benchmark_wasm(amostras: int) -> dict[str, Any]:
    script = PROJECT_ROOT / "scripts" / "benchmark_wasm_quantum.mjs"
    proc = subprocess.run(  # noqa: S603, S607  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
        ["node", str(script), "--json", "--amostras", str(amostras)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=300,
        check=False,
    )
    linha_json = next((ln for ln in proc.stdout.splitlines() if ln.startswith("{")), None)
    if linha_json is None:
        erro = (proc.stderr or proc.stdout).strip().splitlines()[-1:] or ["sem saida"]
        print(f"   [FALHOU] benchmark WASM nao devolveu JSON: {erro[0]}")
        return {"veredito": "FALHOU", "falhas": [f"sem JSON: {erro[0]}"], "casos": []}
    relatorio = json.loads(linha_json)
    for caso in relatorio["casos"]:
        rotulo = caso["caso"] + (f" {caso['board']} k={caso['kappa']}" if caso["caso"] == "monte_carlo" else "")
        escopo = f"  [{caso['escopo']}]" if "escopo" in caso else ""
        print(f"   {rotulo:<36} {caso['taxa_por_s']:>14,.0f} /s   mediana {caso['mediana_ms']:.2f} ms{escopo}")
    mem = relatorio["memoria_wasm_bytes"]
    print(f"   memoria linear WASM: {mem['inicial']:,} -> {mem['final']:,} bytes; veredito {relatorio['veredito']}")
    for falha in relatorio["falhas"]:
        print(f"   [FALHOU] {falha}")
    return relatorio


def inventario_llama_cpp() -> dict[str, Any]:
    pasta = PROJECT_ROOT / "engine" / "llama_cpp"
    exes = sorted(p.name for p in pasta.glob("*.exe"))
    dlls = sorted(p.name for p in pasta.glob("*.dll"))
    versao = None
    cli = pasta / "llama-cli.exe"
    if cli.exists():
        try:
            proc = subprocess.run(  # noqa: S603  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
                [str(cli), "--version"], capture_output=True, text=True, timeout=15, check=False
            )
            saida = (proc.stdout + proc.stderr).strip().splitlines()
            versao = next((ln for ln in saida if "version" in ln.lower()), saida[0] if saida else None)
        except (OSError, subprocess.TimeoutExpired) as exc:
            versao = f"nao executou: {exc}"
    backends = [d for d in dlls if d.startswith("ggml-")]
    print(f"   {len(exes)} executaveis, {len(dlls)} DLLs; backends ggml presentes: {', '.join(backends) or 'nenhum'}")
    print(f"   llama-cli --version: {versao}")
    print("   (presenca de DLL nao prova aceleracao em uso; isto e inventario, nao benchmark)")
    return {"executaveis": exes, "dlls": dlls, "llama_cli_versao": versao}


def benchmark_ollama(modelo: str | None) -> dict[str, Any]:
    resultado: dict[str, Any] = {}
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as resp:  # noqa: S310  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
            nomes = [m["name"] for m in json.loads(resp.read().decode()).get("models", [])]
    except OSError as exc:
        print(f"   Ollama indisponivel: {exc}")
        return {"disponivel": False, "erro": str(exc)}
    nuvem = [n for n in nomes if "cloud" in n]
    locais = [n for n in nomes if "cloud" not in n]
    resultado.update({"disponivel": True, "locais": locais, "nuvem": nuvem})
    print(f"   {len(locais)} modelos locais, {len(nuvem)} de nuvem (os de nuvem nao usam a GPU desta maquina)")

    mem = psutil.virtual_memory()
    print(f"   RAM do host: {mem.total / 1024**3:.1f} GB, {mem.percent}% em uso")

    if not modelo:
        print("   latencia nao medida: use --inferencia MODELO (carrega o modelo na memoria)")
        return resultado
    corpo = json.dumps(
        {
            "model": modelo,
            "prompt": "Responda apenas: ok",
            "stream": False,
            "options": {"num_predict": 16, "temperature": 0},
        }
    ).encode()
    req = urllib.request.Request(  # noqa: S310  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
        f"{OLLAMA}/api/generate", data=corpo, headers={"Content-Type": "application/json"}
    )
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=600) as resp:  # noqa: S310  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
        dados = json.loads(resp.read().decode())
    parede = time.perf_counter() - t0
    ns = 1e9
    eval_s = dados.get("eval_duration", 0) / ns
    medida = {
        "modelo": modelo,
        "parede_s": parede,
        "carga_s": dados.get("load_duration", 0) / ns,
        "prompt_tokens": dados.get("prompt_eval_count"),
        "tokens_gerados": dados.get("eval_count"),
        "tokens_por_s": (dados.get("eval_count", 0) / eval_s) if eval_s else None,
    }
    resultado["inferencia"] = medida
    print(
        f"   {modelo}: parede {parede:.2f} s, carga {medida['carga_s']:.2f} s, "
        f"{medida['tokens_gerados']} tokens a {medida['tokens_por_s'] or 0:.1f} tok/s"
    )
    return resultado


def main() -> int:
    parser = argparse.ArgumentParser(description="Benchmark unificado do ecossistema, medido.")
    parser.add_argument("--amostras", type=int, default=5)
    parser.add_argument("--inferencia", metavar="MODELO", default=None)
    parser.add_argument("--json", action="store_true", help="imprime tambem o relatorio consolidado em JSON")
    args = parser.parse_args()
    amostras = max(3, args.amostras)

    inicio = time.perf_counter()
    secoes: list[tuple[str, Callable[[], Any]]] = [
        ("motores Python", lambda: benchmark_python(amostras)),
        ("motor WASM", lambda: benchmark_wasm(amostras)),
        ("inventario llama.cpp", inventario_llama_cpp),
        ("Ollama", lambda: benchmark_ollama(args.inferencia)),
    ]
    relatorio: dict[str, Any] = {"gerado_em": time.strftime("%Y-%m-%dT%H:%M:%S"), "amostras": amostras}
    for i, (titulo, secao) in enumerate(secoes, 1):
        print(f"\n[{i}/{len(secoes)}] {titulo}")
        relatorio[titulo] = secao()

    falhas = list(relatorio["motor WASM"].get("falhas", []))
    relatorio["falhas"] = falhas
    relatorio["veredito"] = "OK" if not falhas else "FALHOU"
    print(f"\nVeredito: {relatorio['veredito']} em {time.perf_counter() - inicio:.1f} s")
    if args.json:
        print(json.dumps(relatorio, ensure_ascii=True, default=str))
    return 0 if not falhas else 1


if __name__ == "__main__":
    sys.exit(main())
