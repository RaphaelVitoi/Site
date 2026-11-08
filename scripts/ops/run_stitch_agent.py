"""CLI operacional para execucao autonoma do Stitch Agent e automacao de UI no Google Cloud Stitch MCP.

Permite disparar geracao de telas com prompt enhancement oficial, geracao de variantes,
edicao de telas, download de ativos e sincronizacao do inventario de UI.
Governanca: Protocolo Master Chico SOTA v8.0 GOLD . Membro da Triade (Stitch, Exa & Jules).
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
import sys
import time
from typing import Any

from engine.stitch_bridge import (
    DEFAULT_OBSIDIAN_DESIGN_SYSTEM,
    DEFAULT_STITCH_PROJECT_ID,
    StitchClient,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("StitchAgentCLI")


def cmd_generate(args: argparse.Namespace, client: StitchClient) -> int:
    """Dispara a geracao de nova tela no Stitch com ou sem auto-enhancement."""
    logger.info("Disparando geracao de tela no projeto %s...", args.project)
    t0 = time.perf_counter()

    res = client.generate_screen_from_text(
        project_id=args.project,
        prompt=args.prompt,
        model_tier=args.model_tier,
        device_type=args.device_type,
        design_system=args.design_system,
        auto_enhance=args.enhance,
    )
    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Geracao concluida em %.2fs.", elapsed)

    if args.json:
        print(json.dumps({"status": "success", "elapsed": elapsed, "result": res}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[STITCH SUCESSO] Tela gerada em {elapsed}s no projeto {args.project}")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    if args.sync:
        _trigger_sync()
    return 0


def cmd_edit(args: argparse.Namespace, client: StitchClient) -> int:
    """Edita telas existentes via instrucao de refinamento."""
    logger.info("Editando tela(s) %s no projeto %s...", args.screens, args.project)
    t0 = time.perf_counter()

    res = client.edit_screens(
        project_id=args.project,
        screen_ids=args.screens,
        prompt=args.prompt,
        model_tier=args.model_tier,
        device_type=args.device_type,
    )
    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Edicao concluida em %.2fs.", elapsed)

    if args.json:
        print(json.dumps({"status": "success", "elapsed": elapsed, "result": res}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[STITCH SUCESSO] Edicao concluida em {elapsed}s")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    if args.sync:
        _trigger_sync()
    return 0


def cmd_variants(args: argparse.Namespace, client: StitchClient) -> int:
    """Gera variantes a partir de telas existentes."""
    logger.info("Gerando %d variante(s) para tela(s) %s...", args.count, args.screens)
    t0 = time.perf_counter()

    res = client.generate_variants(
        project_id=args.project,
        screen_ids=args.screens,
        prompt=args.prompt,
        variant_count=args.count,
        creative_range=args.creative_range,
        model_tier=args.model_tier,
        device_type=args.device_type,
    )
    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Variantes geradas em %.2fs.", elapsed)

    if args.json:
        print(json.dumps({"status": "success", "elapsed": elapsed, "result": res}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[STITCH SUCESSO] Variantes geradas em {elapsed}s")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    if args.sync:
        _trigger_sync()
    return 0


def cmd_list(args: argparse.Namespace, client: StitchClient) -> int:
    """Lista projetos ou telas de um projeto."""
    if args.project:
        screens = client.list_screens(args.project)
        if args.json:
            print(json.dumps({"screens": [dict(s) for s in screens]}, indent=2, ensure_ascii=False))
        else:
            print(f"\n[STITCH TELAS] {len(screens)} tela(s) encontradas no projeto {args.project}:")
            for sc in screens:
                print(f"  - ID: {sc.id} | Titulo: {sc.title} | Dispositivo: {sc.device_type}")
                if sc.screenshot_url:
                    print(f"    Screenshot: {sc.screenshot_url}")
                if sc.html_url:
                    print(f"    HTML: {sc.html_url}")
    else:
        projects = client.list_projects()
        if args.json:
            print(json.dumps({"projects": [dict(p) for p in projects]}, indent=2, ensure_ascii=False))
        else:
            print(f"\n[STITCH PROJETOS] {len(projects)} projeto(s) encontrados:")
            for p in projects:
                print(f"  - ID: {p.project_id} | Titulo: {p.title} | Visibilidade: {p.visibility}")
    return 0


def cmd_enhance(args: argparse.Namespace) -> int:
    """Aprimora um prompt visual localmente via algoritmo enhance-prompt sem chamada de rede."""
    enhanced = StitchClient.enhance_prompt(
        raw_prompt=args.prompt,
        platform=args.platform,
        include_obsidian_design_system=not args.no_ds,
    )
    if args.json:
        print(json.dumps({"original": args.prompt, "enhanced": enhanced}, indent=2, ensure_ascii=False))
    else:
        print("\n--- PROMPT ORIGINAL ---")
        print(args.prompt)
        print("\n--- ENHANCED PROMPT (STITCH SOTA) ---")
        print(enhanced)
    return 0


def _trigger_sync() -> None:
    """Aciona o sincronizador oficial do Stitch para manter STITCH_REPORT.md fidedigno."""
    try:
        from scripts.ops.sync_stitch_report import fetch_all_stitch_data, format_markdown_report, STITCH_REPORT_FILE

        data = fetch_all_stitch_data()
        report_md = format_markdown_report(data)
        STITCH_REPORT_FILE.write_text(report_md, encoding="utf-8")
        logger.info("STITCH_REPORT.md sincronizado com sucesso.")
    except Exception as e:
        logger.warning("Falha ao sincronizar STITCH_REPORT.md: %s", e)


def main() -> int:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--json", action="store_true", help="Formato de saida em JSON estrito")
    common.add_argument("--sync", action="store_true", help="Sincroniza STITCH_REPORT.md apos execucao")

    parser = argparse.ArgumentParser(
        description="CLI do Stitch Agent (Google Cloud Stitch MCP).",
        parents=[common],
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcomando: generate
    p_gen = subparsers.add_parser("generate", parents=[common], help="Gera nova tela a partir de prompt")
    p_gen.add_argument("prompt", type=str, help="Descricao ou prompt conceitual da tela")
    p_gen.add_argument("--project", type=str, default=DEFAULT_STITCH_PROJECT_ID, help="ID do projeto Stitch")
    p_gen.add_argument("--enhance", action="store_true", help="Aplica pipeline enhance-prompt antes de enviar")
    p_gen.add_argument(
        "--model-tier", type=str, default="BALANCED", choices=["BALANCED", "SPEED"], help="Tier de modelo"
    )
    p_gen.add_argument("--device-type", type=str, default="DESKTOP", choices=["DESKTOP", "MOBILE"], help="Tipo de tela")
    p_gen.add_argument(
        "--design-system", type=str, default=DEFAULT_OBSIDIAN_DESIGN_SYSTEM, help="Asset de Design System"
    )

    # Subcomando: edit
    p_edit = subparsers.add_parser("edit", parents=[common], help="Edita tela(s) existente(s)")
    p_edit.add_argument("prompt", type=str, help="Instrucao de modificacao/edicao")
    p_edit.add_argument("--screens", nargs="+", required=True, help="IDs das telas a editar")
    p_edit.add_argument("--project", type=str, default=DEFAULT_STITCH_PROJECT_ID, help="ID do projeto Stitch")
    p_edit.add_argument(
        "--model-tier", type=str, default="BALANCED", choices=["BALANCED", "SPEED"], help="Tier de modelo"
    )
    p_edit.add_argument(
        "--device-type", type=str, default="DESKTOP", choices=["DESKTOP", "MOBILE"], help="Tipo de tela"
    )

    # Subcomando: variants
    p_var = subparsers.add_parser("variants", parents=[common], help="Gera variantes visuais de tela(s)")
    p_var.add_argument("prompt", type=str, help="Instrucao de exploracao de variantes")
    p_var.add_argument("--screens", nargs="+", required=True, help="IDs das telas base")
    p_var.add_argument("--project", type=str, default=DEFAULT_STITCH_PROJECT_ID, help="ID do projeto Stitch")
    p_var.add_argument("--count", type=int, default=3, help="Quantidade de variantes (1 a 5)")
    p_var.add_argument(
        "--creative-range", type=str, default="EXPLORE", choices=["REFINE", "EXPLORE"], help="Grau de variacao"
    )
    p_var.add_argument("--model-tier", type=str, default="SPEED", choices=["BALANCED", "SPEED"], help="Tier de modelo")
    p_var.add_argument("--device-type", type=str, default="DESKTOP", choices=["DESKTOP", "MOBILE"], help="Tipo de tela")

    # Subcomando: list
    p_list = subparsers.add_parser("list", parents=[common], help="Lista projetos ou telas de um projeto")
    p_list.add_argument(
        "--project", type=str, default=None, help="ID do projeto para listar telas (ou omitir para projetos)"
    )

    # Subcomando: enhance (offline)
    p_enh = subparsers.add_parser("enhance", parents=[common], help="Testa o pipeline enhance-prompt offline")
    p_enh.add_argument("prompt", type=str, help="Prompt bruto a aprimorar")
    p_enh.add_argument("--platform", type=str, default="Web desktop", help="Plataforma alvo")
    p_enh.add_argument("--no-ds", action="store_true", help="Omitir bloco Obsidian Analytics")

    args = parser.parse_args()

    if args.command == "enhance":
        return cmd_enhance(args)

    client = StitchClient()
    if not client.is_configured:
        logger.error("STITCH_API_KEY ausente em HKCU/HKLM ou os.environ.")
        return 1

    if args.command == "generate":
        return cmd_generate(args, client)
    elif args.command == "edit":
        return cmd_edit(args, client)
    elif args.command == "variants":
        return cmd_variants(args, client)
    elif args.command == "list":
        return cmd_list(args, client)

    return 0


if __name__ == "__main__":
    sys.exit(main())
