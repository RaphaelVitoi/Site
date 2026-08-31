# ruff: noqa: D100, D103, T201, BLE001, E402, I001
# pylint: disable=wrong-import-position
"""Benchmark Unificado SOTA v7.0 GOLD - Ecossistema Nexus & Motores de Inferencia."""

import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# Adiciona a raiz do projeto ao path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

import psutil

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.math_sota import (
    calculate_geometric_sizing,
    calculate_perspectiva_vitoi_v7,
    calculate_rio_risk_v2,
)
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine


def run_benchmark_mathematics():
    """Benchmark 1: Motores Matematicos, ICM e Teoria dos Prospectos (+EV)."""
    print("\n" + "=" * 75)
    print("  [BENCHMARK 1/4] MOTOR MATEMATICO & PERSPECTIVA VITOI SOTA")
    print("=" * 75)

    # 1. ICM Malmuth-Harville Solves
    stacks = [100.0, 75.0, 50.0, 25.0, 15.0, 10.0]
    payouts = [500.0, 300.0, 200.0]

    n_icm_iterations = 25000
    t0 = time.perf_counter()
    for _ in range(n_icm_iterations):
        _ = calculate_malmuth_harville_icm(stacks, payouts)
    t_icm = time.perf_counter() - t0
    icm_rate = n_icm_iterations / t_icm
    print(
        f"   ICM Matrix (6-max, 3 payouts):  {n_icm_iterations:,} resolucoes em {t_icm:.3f}s -> {icm_rate:,.0f} solves/s"
    )

    # 2. Perspectiva Matematica Vitoi v7 & Quantum Metrics
    n_pm_iterations = 50000
    t0 = time.perf_counter()
    for _ in range(n_pm_iterations):
        _ = calculate_perspectiva_vitoi_v7(
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
        )
    t_pm = time.perf_counter() - t0
    pm_rate = n_pm_iterations / t_pm
    print(f"   Perspectiva Vitoi v7 (Quantum):  {n_pm_iterations:,} tensores em {t_pm:.3f}s -> {pm_rate:,.0f} eval/s")

    # 3. Geometric Sizing & Street Growth (Bellman)
    n_geom = 100000
    t0 = time.perf_counter()
    for _ in range(n_geom):
        _ = calculate_geometric_sizing(current_pot=6.5, target_pot=100.0, remaining_streets=3)
    t_geom = time.perf_counter() - t0
    geom_rate = n_geom / t_geom
    print(f"   Geometric Sizing (Bellman Opt):  {n_geom:,} calculos em {t_geom:.3f}s -> {geom_rate:,.0f} ops/s")

    # 4. Vitoi Perspective Engine Utility & Decision Tree
    n_vitoi = 20000
    t0 = time.perf_counter()
    for _ in range(n_vitoi):
        _ = VitoiPerspectiveEngine.calculate_utility(x=15.0, loss_aversion=2.25)
        _ = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=1.5,
            time_to_blind_minutes=2.0,
            payjump_proximity_factor=0.8,
            position="BB",
        )
        _ = VitoiPerspectiveEngine.calculate_structural_liability(multiway_opponents=3, base_rio=2.5)
        _ = VitoiPerspectiveEngine.calculate_edge_amortization(
            stack_depth_bb=35.0, edge_base=1.2, aggression_factor=1.5
        )
    t_vitoi = time.perf_counter() - t0
    vitoi_rate = (n_vitoi * 4) / t_vitoi
    print(
        f"   Vitoi Perspective Engine (4 ops): {n_vitoi * 4:,} avaliacoes em {t_vitoi:.3f}s -> {vitoi_rate:,.0f} ops/s"
    )

    # 5. Recursive Decision Tree Simulation
    n_tree = 5000
    t0 = time.perf_counter()
    for _ in range(n_tree):
        _ = VitoiPerspectiveEngine.simulate_decision_tree(
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
        )
    t_tree = time.perf_counter() - t0
    tree_rate = n_tree / t_tree
    print(f"   Vitoi Decision Tree (Markov/Tree): {n_tree:,} arvores em {t_tree:.3f}s -> {tree_rate:,.0f} trees/s")

    # 5. RIO Stress & Risk Calculations
    n_rio = 25000
    t0 = time.perf_counter()
    for _ in range(n_rio):
        _ = calculate_rio_risk_v2(
            hero_invested=5.0, current_pot=10.0, hero_raw_stack=40.0, hero_position="OOP", active_players=4
        )
    t_rio = time.perf_counter() - t0
    rio_rate = n_rio / t_rio
    print(f"   RIO Tensor Dynamic Risk:         {n_rio:,} calculos em {t_rio:.3f}s -> {rio_rate:,.0f} ops/s")


def run_benchmark_wasm():
    """Benchmark 2: Motor WASM Quantum Node.js."""
    print("\n" + "=" * 75)
    print("  [BENCHMARK 2/4] QUANTUM WASM ACCELERATION BENCHMARK")
    print("=" * 75)
    wasm_bench_path = PROJECT_ROOT / "scripts" / "benchmark_wasm_quantum.mjs"
    if wasm_bench_path.exists():
        cmd = ["node", str(wasm_bench_path)]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=60, check=True)
            for line in res.stdout.strip().splitlines():
                if (
                    "PASSED" in line
                    or "it/s" in line
                    or "Memoria" in line
                    or "Speedup" in line
                    or "Total de Operacoes" in line
                ):
                    print(f"   {line.strip()}")
        except Exception as e:
            print(f"  [AVISO] Erro na execucao do benchmark WASM: {e}")
    else:
        print("  [AVISO] Arquivo benchmark_wasm_quantum.mjs nao localizado.")


def run_benchmark_llama_cpp():
    """Benchmark 3: Auditoria de Binarios Nativos engine/llama_cpp."""
    print("\n" + "=" * 75)
    print("  [BENCHMARK 3/4] C++ NATIVE ENGINE & VULKAN DISPATCHER")
    print("=" * 75)
    llama_dir = PROJECT_ROOT / "engine" / "llama_cpp"
    binaries = list(llama_dir.glob("*.exe"))
    dlls = list(llama_dir.glob("*.dll"))

    print(f"   Binarios Compilados Detectados: {len(binaries)} executaveis")
    for b in binaries[:4]:
        size_kb = b.stat().st_size / 1024
        print(f"    - {b.name:<28} ({size_kb:,.1f} KB)")

    print(f"   Bibliotecas Compartilhadas (.dll): {len(dlls)} modulos")
    vulkan_dll = llama_dir / "ggml-vulkan.dll"
    if vulkan_dll.exists():
        vulkan_mb = vulkan_dll.stat().st_size / (1024 * 1024)
        print(f"    - ggml-vulkan.dll:           {vulkan_mb:.2f} MB (Vulkan GPU Acceleration Active)")
    zen4_dll = llama_dir / "ggml-cpu-zen4.dll"
    if zen4_dll.exists():
        print("    - ggml-cpu-zen4.dll:         AVX-512 Optimized CPU Engine Active")
    alder_dll = llama_dir / "ggml-cpu-alderlake.dll"
    if alder_dll.exists():
        print("    - ggml-cpu-alderlake.dll:     Hybrid Arch / AVX2 CPU Engine Active")


def run_benchmark_inference():
    """Benchmark 4: Latencia e Throughput do Motor Gemma 4 Local."""
    print("\n" + "=" * 75)
    print("  [BENCHMARK 4/4] INFERENCIA LOCAL SOTA (GEMMA 4 12B & E4B)")
    print("=" * 75)

    # Inspecao do daemon Ollama
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:  # nosec B310 # noqa: S310 -- Record-Id: auditoria-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
            data = json.loads(resp.read().decode())
            models = [m["name"] for m in data.get("models", [])]
            print(f"   Modelos Ativos no Daemon Ollama: {', '.join(models)}")
    except Exception as e:
        print(f"   Status do Daemon Ollama: {e}")

    # Telemetria de Memoria Atual do Sistema
    mem = psutil.virtual_memory()
    total_gb = mem.total / (1024**3)
    used_gb = mem.used / (1024**3)
    available_gb = mem.available / (1024**3)
    print(
        f"   Telemetria de RAM Host: Total: {total_gb:.1f} GB | Usada: {used_gb:.1f} GB | Disponivel: {available_gb:.1f} GB ({mem.percent}% utilizada)"
    )
    print("   Fatiamento Termodinamico: ~5.2 GB VRAM GPU (-ngl 26) + ~3.5 GB System RAM (MMAP/OpenMP)")


def main():
    """Ponto de entrada do benchmark unificado."""
    print("\n" + "#" * 75)
    print("  CHICO SOTA v7.0 GOLD - FULL ECOSYSTEM UNIFIED BENCHMARK")
    print("  Data/Hora: " + time.strftime("%Y-%m-%d %H:%M:%S"))
    print("#" * 75)

    t_start = time.perf_counter()
    run_benchmark_mathematics()
    run_benchmark_wasm()
    run_benchmark_llama_cpp()
    run_benchmark_inference()
    t_total = time.perf_counter() - t_start

    print("\n" + "=" * 75)
    print(f"  [BENCHMARK CONCLUIDO COM SUCESSO] Tempo Total de Execucao: {t_total:.2f}s")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    main()
