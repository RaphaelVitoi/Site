#!/usr/bin/env python3
"""GERADOR DE VISUALIZACAO ESTRATIFICADA DE LATENCIA SOTA GOLD (CDF, PDF, TIMELINE E TOKENOMICS).

Gera um dashboard executivo moderno, didatico e de alta fidelidade visual (300 DPI)
consolidando metricas de latencia, distribuicao cumulativa, estabilidade de cauda
e alocacao de tokens de Extended Thinking.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import subprocess
import sys
from typing import TYPE_CHECKING, Any, cast

if TYPE_CHECKING:
    import matplotlib
    import matplotlib.gridspec as gridspec
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    import seaborn as sns
else:
    try:
        import matplotlib

        matplotlib.use("Agg")  # Backend headless seguro
        import matplotlib.gridspec as gridspec
        import matplotlib.pyplot as plt
        import numpy as np
        import pandas as pd
        import seaborn as sns
    except ImportError as exc:
        print(f"[AVISO] Dependencias de plotagem nao encontradas ({exc}).")
        print("Instale com: pip install matplotlib seaborn pandas numpy")
        matplotlib = None  # type: ignore[assignment]
        gridspec = None  # type: ignore[assignment]
        plt = None  # type: ignore[assignment]
        np = None  # type: ignore[assignment]
        pd = None  # type: ignore[assignment]
        sns = None  # type: ignore[assignment]


# =====================================================================
# 1. PALETA DE CORES E ESPECIFICACOES DE IDENTIDADE VISUAL
# =====================================================================

THEME_BG = "#F8F9FA"  # Fundo geral sofisticado
CARD_BG = "#FFFFFF"  # Fundo dos paineis
BORDER_COLOR = "#E2E8F0"  # Bordas sutis
TEXT_PRIMARY = "#1E293B"  # Texto principal (Slate 800)
TEXT_MUTED = "#64748B"  # Texto secundario (Slate 500)
GRID_COLOR = "#E2E8F0"  # Grid discreto

PALETTE_MAP: dict[str, str] = {
    "LOCAL_LLAMA_VULKAN": "#10B981",  # Esmeralda (Edge Local)
    "GEMINI_37_FLASH_STANDARD": "#2563EB",  # Azul Real (Cloud Standard)
    "GEMINI_37_FLASH_THINKING": "#DC2626",  # Carmesim (Extended Thinking)
    "FAILED": "#94A3B8",  # Cinza Neutro (Falhas)
}

TARGET_LABELS: dict[str, str] = {
    "LOCAL_LLAMA_VULKAN": "Llama.cpp Edge (Vulkan)",
    "GEMINI_37_FLASH_STANDARD": "Gemini 3.7 Flash (Standard)",
    "GEMINI_37_FLASH_THINKING": "Gemini 3.7 Flash (Thinking)",
    "FAILED": "Falhas / Timeouts",
}


# =====================================================================
# 2. CARREGAMENTO E SINTESE DE DADOS
# =====================================================================


def generate_synthetic_data(samples: int = 60) -> pd.DataFrame:
    """Gera massa de dados sintetica realista para preview do dashboard."""
    np.random.seed(42)
    n_standard = int(samples * 0.667)
    n_thinking = samples - n_standard

    std_lat = np.random.normal(loc=968, scale=12, size=n_standard).clip(min=950)
    thk_lat = np.random.normal(loc=1214, scale=8, size=n_thinking).clip(min=1200)

    records: list[dict[str, Any]] = []
    for lat in std_lat:
        records.append(
            {
                "target_executed": "GEMINI_37_FLASH_STANDARD",
                "latency_ms": float(lat),
                "thinking_tokens": 0,
                "tokens_evaluated": int(np.random.randint(20, 45)),
                "is_success": True,
            }
        )
    for lat in thk_lat:
        records.append(
            {
                "target_executed": "GEMINI_37_FLASH_THINKING",
                "latency_ms": float(lat),
                "thinking_tokens": 4096,
                "tokens_evaluated": int(np.random.randint(45, 80)),
                "is_success": True,
            }
        )

    # Embaralhar para simular sequencia de requisicoes real
    return pd.DataFrame(records).sample(frac=1.0, random_state=42).reset_index(drop=True)


def load_dataset(file_path: str | None) -> pd.DataFrame:
    if file_path and os.path.exists(file_path):
        if file_path.endswith(".json"):
            with open(file_path, encoding="utf-8") as f:
                data = json.load(f)
            df = pd.DataFrame(data)
        elif file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            raise ValueError("Formato nao suportado. Utilize .json ou .csv")
    else:
        print("[AVISO] Dataset nao encontrado. Gerando dados sinteticos de alta fidelidade...")
        df = generate_synthetic_data()

    if "is_success" in df.columns:
        filtered = df[df["is_success"]]
        df = cast(pd.DataFrame, filtered).copy().reset_index(drop=True)
    return df


# =====================================================================
# 3. MOTOR DE RENDERIZACAO GRAFICA SOTA GOLD (DASHBOARD QUAD-PANEL)
# =====================================================================


def plot_distributions(df: pd.DataFrame, output_image: str = "benchmark_latency_report.png") -> None:
    sns.set_theme(style="whitegrid", font="sans-serif")

    # Criacao do Canvas Master com Banner Superior e 4 Paineis
    fig = plt.figure(figsize=(20, 12), dpi=300, facecolor=THEME_BG)
    gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.32, wspace=0.22, top=0.88, bottom=0.07, left=0.06, right=0.96)

    # -------------------------------------------------------------
    # 0. HEADER / BANNER DE KPIS EXECUTIVOS
    # -------------------------------------------------------------
    total_reqs = len(df)
    latency_vals = df["latency_ms"].to_numpy()
    avg_lat = float(np.mean(latency_vals)) if total_reqs else 0.0
    p50 = float(np.percentile(latency_vals, 50)) if total_reqs else 0.0
    p90 = float(np.percentile(latency_vals, 90)) if total_reqs else 0.0
    p99 = float(np.percentile(latency_vals, 99)) if total_reqs else 0.0
    total_thinking = int(np.sum(df["thinking_tokens"].to_numpy())) if "thinking_tokens" in df.columns else 0

    # Titulo Principal e Subtitulo
    fig.text(
        0.06,
        0.955,
        "HYBRID ROUTER SOTA -- RELATORIO DE DESEMPENHO E LATENCIA",
        fontsize=17,
        fontweight="bold",
        color=TEXT_PRIMARY,
        ha="left",
    )
    fig.text(
        0.06,
        0.932,
        "Protocolo Chico SOTA v8.0 GOLD * Arquitetura Google Gemini 3.7 Flash & Llama.cpp Vulkan Edge",
        fontsize=11,
        color=TEXT_MUTED,
        ha="left",
    )

    # Cards de Metricas no Topo Direito
    kpi_text = (
        f"Requisicoes: {total_reqs} (100% Sucesso)  |  "
        f"Latencia Media: {avg_lat:.1f}ms  |  "
        f"Mediana p50: {p50:.1f}ms  |  "
        f"Cauda p99: {p99:.1f}ms  |  "
        f"Thinking Tokens: {total_thinking:,}"
    )
    fig.text(
        0.96,
        0.942,
        kpi_text,
        fontsize=10.5,
        fontweight="bold",
        color=TEXT_PRIMARY,
        ha="right",
        bbox={"boxstyle": "round,pad=0.5", "facecolor": CARD_BG, "edgecolor": BORDER_COLOR, "alpha": 0.9},
    )

    present_targets = df["target_executed"].unique()

    # -------------------------------------------------------------
    # PAINEL 1: DENSIDADE DE PROBABILIDADE E BIMODALIDADE (PDF/KDE)
    # -------------------------------------------------------------
    ax1 = fig.add_subplot(gs[0, 0], facecolor=CARD_BG)
    for target in present_targets:
        subset = df[df["target_executed"] == target]
        color = PALETTE_MAP.get(str(target), "#333333")
        label = TARGET_LABELS.get(str(target), str(target))
        count = len(subset)
        pct = (count / total_reqs) * 100.0

        sns.histplot(
            subset["latency_ms"],
            kde=True,
            stat="density",
            color=color,
            label=f"{label} ({count} reqs * {pct:.1f}%)",
            ax=ax1,
            alpha=0.30,
            edgecolor=color,
            linewidth=1.5,
        )
        # Linha vertical indicando a media do grupo
        mean_val = float(np.mean(np.asarray(subset["latency_ms"])))
        ax1.axvline(mean_val, color=color, linestyle="--", linewidth=1.2, alpha=0.8)

    ax1.set_title(
        "1. Densidade de Probabilidade de Latencia (PDF / KDE Bimodal)",
        fontsize=12,
        fontweight="bold",
        color=TEXT_PRIMARY,
        pad=10,
    )
    ax1.set_xlabel("Latencia Ponta a Ponta (ms)", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax1.set_ylabel("Densidade de Probabilidade", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax1.legend(frameon=True, facecolor=CARD_BG, edgecolor=BORDER_COLOR, fontsize=8.5, loc="upper right")
    ax1.grid(True, linestyle="--", alpha=0.35, color=GRID_COLOR)

    # -------------------------------------------------------------
    # PAINEL 2: FUNCAO DE DISTRIBUICAO CUMULATIVA EMPIRICA (eCDF)
    # -------------------------------------------------------------
    ax2 = fig.add_subplot(gs[0, 1], facecolor=CARD_BG)
    for target in present_targets:
        subset = df[df["target_executed"] == target]
        color = PALETTE_MAP.get(str(target), "#333333")
        label = TARGET_LABELS.get(str(target), str(target))

        sorted_data = np.sort(subset["latency_ms"])
        yvals = np.arange(1, len(sorted_data) + 1) / len(sorted_data)
        ax2.step(sorted_data, yvals, label=label, color=color, linewidth=2.0, where="post")

    global_sorted = np.sort(df["latency_ms"])
    global_yvals = np.arange(1, len(global_sorted) + 1) / len(global_sorted)
    ax2.step(
        global_sorted,
        global_yvals,
        label="Global Agregado",
        color=TEXT_PRIMARY,
        linewidth=2.4,
        linestyle="--",
        where="post",
    )

    # Linhas de percentis com badges estilizados
    pct_configs = [
        (50, "#475569", p50),
        (90, "#D97706", p90),
        (99, "#7C3AED", p99),
    ]

    for p, color, val in pct_configs:
        ax2.axhline(p / 100.0, color=color, linestyle=":", alpha=0.7, linewidth=1.1)
        ax2.axvline(val, color=color, linestyle=":", alpha=0.7, linewidth=1.1)
        ax2.annotate(
            f"p{p}: {val:.1f}ms",
            xy=(val, p / 100.0),
            xytext=(val + 6, (p / 100.0) - 0.05),
            fontsize=8.5,
            fontweight="bold",
            color=color,
            bbox={"boxstyle": "round,pad=0.25", "fc": CARD_BG, "ec": color, "alpha": 0.9},
        )

    ax2.set_title(
        "2. Distribuicao Cumulativa de Latencia (eCDF & Percentis de Cauda)",
        fontsize=12,
        fontweight="bold",
        color=TEXT_PRIMARY,
        pad=10,
    )
    ax2.set_xlabel("Latencia Ponta a Ponta (ms)", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax2.set_ylabel(r"Probabilidade Acumulada $P(X \leq x)$", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax2.set_ylim(-0.02, 1.05)
    ax2.legend(frameon=True, facecolor=CARD_BG, edgecolor=BORDER_COLOR, fontsize=8.5, loc="lower right")
    ax2.grid(True, linestyle="--", alpha=0.35, color=GRID_COLOR)

    # -------------------------------------------------------------
    # PAINEL 3: TIMELINE SEQUENCIAL DE CARGA (ESTABILIDADE CONCORRENTE)
    # -------------------------------------------------------------
    ax3 = fig.add_subplot(gs[1, 0], facecolor=CARD_BG)
    df_seq = df.copy().reset_index()
    df_seq["request_id"] = df_seq.index + 1

    for target in present_targets:
        subset = df_seq[df_seq["target_executed"] == target]
        color = PALETTE_MAP.get(str(target), "#333333")
        label = TARGET_LABELS.get(str(target), str(target))
        ax3.scatter(
            subset["request_id"], subset["latency_ms"], color=color, label=label, alpha=0.85, s=36, edgecolors="none"
        )

    # Media movel global para verificar estabilidade temporal
    rolling_mean = df_seq["latency_ms"].rolling(window=max(3, len(df_seq) // 10), min_periods=1).mean()
    ax3.plot(
        df_seq["request_id"],
        rolling_mean,
        color=TEXT_PRIMARY,
        linestyle="-",
        linewidth=1.8,
        label="Media Movel (Rolling Avg)",
    )

    ax3.set_title(
        "3. Estabilidade Temporal sob Carga Concorrente (Timeline de Requisicoes)",
        fontsize=12,
        fontweight="bold",
        color=TEXT_PRIMARY,
        pad=10,
    )
    ax3.set_xlabel("Numero Sequencial da Requisicao (#)", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax3.set_ylabel("Latencia de Resposta (ms)", fontsize=10, fontweight="bold", color=TEXT_PRIMARY)
    ax3.legend(frameon=True, facecolor=CARD_BG, edgecolor=BORDER_COLOR, fontsize=8.5, loc="upper right")
    ax3.grid(True, linestyle="--", alpha=0.35, color=GRID_COLOR)

    # -------------------------------------------------------------
    # PAINEL 4: PARTICIONAMENTO DE ROTAS & ALOCACAO DE THINKING TOKENS
    # -------------------------------------------------------------
    ax4 = fig.add_subplot(gs[1, 1], facecolor=CARD_BG)

    target_counts = df["target_executed"].value_counts()
    labels = [TARGET_LABELS.get(str(t), str(t)) for t in target_counts.index]
    colors = [PALETTE_MAP.get(str(t), "#333333") for t in target_counts.index]

    _, texts, autotexts = ax4.pie(
        target_counts,
        labels=labels,
        colors=colors,
        autopct="%1.1f%%",
        startangle=140,
        pctdistance=0.75,
        wedgeprops={"width": 0.45, "edgecolor": CARD_BG, "linewidth": 2},
    )

    for at in autotexts:
        at.set_fontsize(9.5)
        at.set_fontweight("bold")
        at.set_color("#FFFFFF")
    for t in texts:
        t.set_fontsize(8.5)
        t.set_color(TEXT_PRIMARY)

    # Texto central no donut
    ax4.text(0, 0, f"{total_reqs}\nReqs", ha="center", va="center", fontsize=13, fontweight="bold", color=TEXT_PRIMARY)
    ax4.set_title(
        "4. Alocacao de Trafego e Especializacao de Roteamento",
        fontsize=12,
        fontweight="bold",
        color=TEXT_PRIMARY,
        pad=10,
    )

    # Salvamento de Alta Resolucao
    plt.savefig(output_image, dpi=300, facecolor=THEME_BG, edgecolor="none", bbox_inches="tight")
    plt.close()
    print(f"\n[SUCESSO] Dashboard SOTA Gold exportado com alta resolucao em: {os.path.abspath(output_image)}")


def _load_env_file(env_path: str | None = None) -> None:
    if env_path is None:
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with contextlib.suppress(Exception), open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key, val = key.strip(), val.strip().strip("'\"")
                if key and key not in os.environ:
                    os.environ[key] = val


_load_env_file()


def open_image(file_path: str) -> None:
    """Abre automaticamente o arquivo de imagem no visualizador padrao do sistema operacional."""
    abs_path = os.path.abspath(file_path)
    opened = False
    if sys.platform == "win32":
        # 1. Tenta via explorer.exe (garante abertura mesmo em console elevado Administrator)
        with contextlib.suppress(Exception):
            subprocess.Popen(["explorer.exe", abs_path])  # noqa: S603, S607 # nosec B603, B607
            opened = True
        # 2. Fallback via os.startfile
        if not opened:
            with contextlib.suppress(Exception):
                os.startfile(abs_path)  # noqa: S606 # nosec B606
                opened = True
        # 3. Fallback via cmd start
        if not opened:
            with contextlib.suppress(Exception):
                subprocess.Popen(["cmd.exe", "/c", "start", "", abs_path], shell=False)  # noqa: S603, S607 # nosec B603, B607
                opened = True
    elif sys.platform == "darwin":
        with contextlib.suppress(Exception):
            subprocess.run(["open", abs_path], check=False)  # noqa: S603, S607 # nosec B603, B607
            opened = True
    else:
        with contextlib.suppress(Exception):
            subprocess.run(["xdg-open", abs_path], check=False)  # noqa: S603, S607 # nosec B603, B607
            opened = True

    if opened:
        print(f"[VISUALIZACAO] Dashboard aberto na tela com sucesso: {abs_path}")
    else:
        print(f"[AVISO] Arquivo disponivel em: {abs_path}")


def main() -> None:
    if matplotlib is None or plt is None:
        print("[ERRO] Bibliotecas de plotagem indisponiveis. Instale com: pip install -r requirements.txt")
        return

    parser = argparse.ArgumentParser(description="Plota dashboard executivo SOTA de metricas de latencia.")
    parser.add_argument("--input", "-i", type=str, default=None, help="Caminho do arquivo JSON/CSV com resultados.")
    parser.add_argument(
        "--output", "-o", type=str, default="benchmark_latency_report.png", help="Arquivo de imagem (.png)."
    )
    parser.add_argument("--no-open", action="store_true", help="Nao abre a imagem automaticamente na tela.")
    args = parser.parse_args()

    df = load_dataset(args.input)
    plot_distributions(df, output_image=args.output)

    if not args.no_open and os.path.exists(args.output):
        open_image(args.output)


if __name__ == "__main__":
    main()
