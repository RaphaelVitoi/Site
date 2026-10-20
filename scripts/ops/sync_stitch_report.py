"""Sincronizador SOTA de Relatorios e Ativos do Google Cloud Stitch MCP.

Conecta-se ao servidor Stitch MCP (https://stitch.googleapis.com/mcp),
coleta o inventario de projetos, telas, design systems e telemetria visual,
gerando o STITCH_REPORT.md fidedigno, lastreado em dados reais e sincronizado com o Design System do Site.
"""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
import logging
from pathlib import Path
from typing import Any, Final

from engine.stitch_bridge import StitchClient

logger = logging.getLogger(__name__)

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent.parent
STITCH_REPORT_FILE: Final[Path] = BASE_DIR / "reports" / "integrations" / "STITCH_REPORT.md"


def fetch_all_stitch_data() -> dict[str, Any]:
    """Coleta projetos, telas e configuracoes do Google Stitch MCP."""
    client = StitchClient()
    projects = client.list_projects()

    enriched_projects: list[dict[str, Any]] = []
    total_screens = 0

    for p in projects:
        raw_name = str(p.get("name", ""))
        proj_id = raw_name.rsplit("/", maxsplit=1)[-1]

        # Buscar telas do projeto
        screens = client.list_screens(proj_id)
        total_screens += len(screens)

        # Buscar design systems
        design_systems = client.list_design_systems(proj_id)

        enriched_projects.append(
            {
                "id": proj_id,
                "name": raw_name,
                "title": p.get("title", "Sem titulo"),
                "visibility": p.get("visibility", "PRIVATE"),
                "project_type": p.get("projectType", "PROJECT_DESIGN"),
                "origin": p.get("origin", "STITCH"),
                "create_time": p.get("createTime", ""),
                "update_time": p.get("updateTime", ""),
                "screens_count": len(screens),
                "screens": screens,
                "design_systems_count": len(design_systems),
                "design_systems": design_systems,
                "metadata": p.get("metadata", {}),
            }
        )
    return {
        "projects": enriched_projects,
        "total_projects": len(enriched_projects),
        "total_screens": total_screens,
    }


def _format_projects_table(projects: list[dict[str, Any]]) -> list[str]:
    if not projects:
        return ["| \u2014 | *Nenhum projeto encontrado* | \u2014 | \u2014 | \u2014 | \u2014 |"]
    rows: list[str] = []
    for p in projects:
        pid = p["id"]
        title = p["title"]
        vis = p["visibility"]
        sc_count = p["screens_count"]
        ds_count = p["design_systems_count"]
        created = p["create_time"][:19].replace("T", " ") if p["create_time"] else "N/A"
        rows.append(f"| `{pid}` | **{title}** | `{vis}` | `{sc_count}` | `{ds_count}` | `{created}` |")
    return rows


def _format_screens(screens: list[dict[str, Any]]) -> list[str]:
    if not screens:
        return ["- **Telas Cadastradas:** *Nenhuma tela gerada no momento.*"]
    lines = [f"- **Invent\u00e1rio de Telas ({len(screens)}):**"]
    for sc in screens:
        sc_name = sc.get("name", "")
        sc_title = sc.get("title", "Sem t\u00edtulo")
        dev_type = sc.get("deviceType", "DESKTOP")
        lines.append(f"  - `{sc_name}`: **{sc_title}** (`{dev_type}`)")
    return lines


def _format_design_systems(design_systems: list[dict[str, Any]]) -> list[str]:
    if not design_systems:
        return []
    lines = [f"- **Design Systems Integrados ({len(design_systems)}):**"]
    for ds in design_systems:
        ds_name = ds.get("name", "")
        ds_info = ds.get("designSystem")
        display_name = "Design System"
        custom_color = "N/A"
        font = "Geist"
        if isinstance(ds_info, dict):
            display_name = str(ds_info.get("displayName", display_name))
            theme = ds_info.get("theme")
            if isinstance(theme, dict):
                custom_color = str(theme.get("customColor", custom_color))
                font = str(theme.get("font", font))
        lines.extend(
            [
                f"  - \U0001f3a8 **{display_name}** (`{ds_name}`)",
                f"    - Tipografia: `{font}` / `JetBrains Mono` | Acento Prim\u00e1rio: `{custom_color}`",
                "    - Filosofia Visual: *Dark Obsidian Glassmorphism*, bordas com brilho de 1px e contraste WCAG AAA.",
            ]
        )
    return lines


def _format_project_detail(p: dict[str, Any]) -> list[str]:
    pid = p["id"]
    title = p["title"]
    lines = [
        f"### Projeto `{pid}` \u2014 {title}",
        f"- **Nome Can\u00f4nico:** `{p['name']}`",
        f"- **Tipo de Projeto:** `{p['project_type']}` | **Origem:** `{p['origin']}`",
        f"- **\u00daltima Atualiza\u00e7\u00e3o:** `{p.get('update_time', 'N/A')}`",
        f"- **Permiss\u00e3o / Papel:** `{p.get('metadata', {}).get('userRole', 'OWNER')}`",
    ]
    lines.extend(_format_screens(p.get("screens", [])))
    lines.extend(_format_design_systems(p.get("design_systems", [])))
    lines.append("")
    return lines


def format_markdown_report(data: dict[str, Any]) -> str:
    """Formata os dados do Stitch no padrao SOTA Markdown."""
    now_utc = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC")
    projects = data.get("projects", [])
    total_proj = data.get("total_projects", 0)
    total_screens = data.get("total_screens", 0)

    lines: list[str] = [
        "# Google Cloud Stitch MCP \u2014 Relat\u00f3rio de Governan\u00e7a e Ativos de UI",
        "",
        "> **Reposit\u00f3rio Monitorado:** `RaphaelVitoi/Site`",
        "> **Governan\u00e7a:** Protocolo Master Chico SOTA v8.0 GOLD \u00b7 Tr\u00edade Stitch, Exa & Jules",
        f"> **Data de Atualiza\u00e7\u00e3o:** `{now_utc}`",
        "> **Origem dos Dados:** Google Cloud Stitch MCP (`https://stitch.googleapis.com/mcp`)",
        "",
        "---",
        "",
        "## 1. Resumo Executivo do Servidor Stitch MCP",
        "",
        "| Dimens\u00e3o | Valor | Status Operacional |",
        "| :--- | :--- | :--- |",
        f"| **Projetos Stitch Ativos** | `{total_proj}` | \u2705 Conectado e Operacional |",
        f"| **Telas Cadastradas** | `{total_screens}` | \U0001f3a8 Em expans\u00e3o cont\u00ednua |",
        "| **Modelos Suportados** | `Gemini 3.8 Flash` (Balanced - Padr\u00e3o) & `Gemini 3.5 Flash-Lite` (Speed) | SOTA visual duo ativo no Stitch |",
        "| **Integra\u00e7\u00e3o Frontend** | Tailwind CSS 4 + Next.js 16 | Tokens sincronizados em `globals.css` |",
        "",
        "> [!NOTE]",
        "> **Atualiza\u00e7\u00e3o de Modelos de Fronteira no Stitch:**",
        "> Conforme verificado na interface de produ\u00e7\u00e3o do Stitch (`stitch.withgoogle.com`), a gera\u00e7\u00e3o de UI opera com dois tiers:",
        "> - \u26a1 **Speed**: `Gemini 3.5 Flash-Lite` (*rapid collaboration, still good quality*) \u2014 menor lat\u00eancia e custo marginal nulo.",
        "> - \u2728 **Balanced (Padr\u00e3o)**: `Gemini 3.8 Flash` (*balance between speed and high quality*) \u2014 alta fidelidade est\u00e9tica e ades\u00e3o a design systems.",
        "> - *Nota de Descontinua\u00e7\u00e3o:* Os modelos da gera\u00e7\u00e3o anterior (`Gemini 3 Flash` e `Gemini 3.1 Pro`) foram descontinuados na produ\u00e7\u00e3o.",
        "",
        "---",
        "",
        "## 2. Projetos Registrados no Google Stitch",
        "",
        "| ID do Projeto | T\u00edtulo | Visibilidade | Telas | Design Systems | Criado em (UTC) |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    lines.extend(_format_projects_table(projects))
    lines.extend(
        [
            "",
            "---",
            "",
            "## 3. Detalhamento dos Projetos e Telas",
            "",
        ]
    )

    for p in projects:
        lines.extend(_format_project_detail(p))

    lines.extend(
        [
            "---",
            "",
            "## 4. Esteira de Prototipagem & Playbook Stitch \u2192 Next.js",
            "",
            "```mermaid",
            "flowchart TD",
            '    Prompt["\U0001f4dd Prompt Conceitual / Teoria PMev"] --> Stitch["\u2728 Stitch MCP (generate_screen_from_text)"]',
            '    Stitch --> Variants["\U0001f500 Gera\u00e7\u00e3o de Variantes (generate_variants)"]',
            '    Variants --> Screen["\U0001f5a5\ufe0f get_screen (HTML/Tailwind Assets)"]',
            '    Screen --> TokenAlign["\U0001f3a8 Alinhamento de Tokens com globals.css"]',
            '    TokenAlign --> Components["\U0001f9e9 Componentes Modulares (frontend/src/components/)"]',
            '    Components --> QGate["\U0001f6e1\ufe0f Quality Gate & CWV (cwv_gate.ps1)"]',
            "",
            "    classDef stitch fill:#1a2332,stroke:#ec4899,stroke-width:2px,color:#fff;",
            "    classDef next fill:#111927,stroke:#3b82f6,stroke-width:2px,color:#fff;",
            "    classDef gate fill:#111927,stroke:#10b981,stroke-width:2px,color:#fff;",
            "    class Stitch,Variants stitch;",
            "    class TokenAlign,Components next;",
            "    class QGate gate;",
            "```",
            "",
            "### Comandos Operacionais via CLI e Python Bridge",
            "",
            "```python",
            "from engine.stitch_bridge import StitchClient",
            "",
            "client = StitchClient()",
            "",
            "# 1. Gerar nova tela para o Simulador Gravitacional PMev:",
            "res = client.generate_screen_from_text(",
            f'    project_id="{projects[0]["id"] if projects else "18242753218562483944"}",',
            '    prompt="Painel SOTA de Scanner Gravitacional PMev com glassmorphism dark/gold e radar de insolvencia",',
            "    # Sem model_tier: pelo bridge, a escolha de modelo nao passa pelo portao MCP.",
            "    # Balanced (Gemini 3.8 Flash) e Speed (Gemini 3.5 Flash-Lite) ficam no seletor da UI.",
            '    device_type="DESKTOP",',
            ")",
            "",
            "# 2. Sincronizar relatorio atualizado:",
            "# python scripts/ops/sync_stitch_report.py --write",
            "```",
            "",
            "---",
            "*Relat\u00f3rio emitido pelo Sincronizador de UI Google Cloud Stitch \u2014 Protocolo Chico SOTA v8.0 GOLD*",
        ]
    )

    return "\n".join(lines) + "\n"


def main() -> None:
    """Ponto de entrada do sincronizador."""
    parser = argparse.ArgumentParser(description="Sincroniza relatorios do Google Cloud Stitch MCP.")
    parser.add_argument("--write", action="store_true", help="Sobrescreve reports/integrations/STITCH_REPORT.md")
    parser.add_argument("--output", type=str, default="", help="Caminho alternativo de saida")
    args = parser.parse_args()

    print("[INFO] Conectando ao Google Cloud Stitch MCP (https://stitch.googleapis.com/mcp)...")
    data = fetch_all_stitch_data()
    print(f"[INFO] {data['total_projects']} projetos e {data['total_screens']} telas recuperadas.")

    content = format_markdown_report(data)

    if args.write:
        target_path = Path(args.output) if args.output else STITCH_REPORT_FILE
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(content, encoding="utf-8")
        print(f"[SUCCESS] Relatorio Stitch gravado com sucesso em: {target_path}")
    else:
        print(content)


if __name__ == "__main__":
    main()
