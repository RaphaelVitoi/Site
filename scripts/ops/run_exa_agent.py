"""CLI para execucao autonoma e polling do Exa Agent (api.exa.ai / mcp.exa.ai).

Permite disparar pesquisas multi-hop, enriquecimento de entidades e list building
com saida estruturada em JSON, medicao de latencia e custo.
Governanca: Protocolo Master Chico SOTA v8.0 GOLD . Membro da Triade (Stitch, Exa & Jules).
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time

from engine.exa_bridge import ExaClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ExaAgentCLI")


def main() -> int:
    parser = argparse.ArgumentParser(description="Executa pesquisa autonoma via Exa Agent.")
    parser.add_argument("query", type=str, help="Pergunta ou objetivo da pesquisa")
    parser.add_argument(
        "--effort",
        type=str,
        default="medium",
        choices=["minimal", "low", "medium", "high", "xhigh", "auto", "ultra"],
        help="Nivel de esforco computacional e orcamento",
    )
    parser.add_argument("--system-prompt", type=str, default=None, help="System prompt restritivo ou de julgamento")
    parser.add_argument("--schema", type=str, default=None, help="Caminho para arquivo JSON contendo outputSchema")
    parser.add_argument("--max-cost", type=float, default=None, help="Teto maximo em dolares (budget.maxCostDollars)")
    parser.add_argument("--poll-interval", type=float, default=4.0, help="Intervalo de polling em segundos")
    parser.add_argument("--timeout", type=float, default=180.0, help="Timeout maximo em segundos")
    args = parser.parse_args()

    client = ExaClient()
    if not client.is_configured:
        logger.error("EXA_API_KEY ausente em HKCU/HKLM ou os.environ.")
        return 1

    output_schema = None
    if args.schema:
        with open(args.schema, encoding="utf-8") as f:
            output_schema = json.load(f)

    logger.info("Disparando Exa Agent | Query: %s | Effort: %s", args.query, args.effort)
    t0 = time.perf_counter()
    run = client.run_agent(
        query=args.query,
        effort=args.effort,
        system_prompt=args.system_prompt,
        output_schema=output_schema,
        max_cost_dollars=args.max_cost,
    )
    logger.info("Run ID gerado: %s | Status Inicial: %s", run.run_id, run.status)

    if run.status in {"completed", "failed", "cancelled"}:
        completed = run
    else:
        logger.info("Aguardando finalizacao (polling a cada %.1fs)...", args.poll_interval)
        completed = client.poll_agent_run(run.run_id, poll_interval=args.poll_interval, max_timeout=args.timeout)

    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Run finalizada em %.2fs com status: %s", elapsed, completed.status)

    res_data = {
        "run_id": completed.run_id,
        "status": completed.status,
        "elapsed_seconds": elapsed,
        "cost_dollars": completed.cost_dollars,
        "duration_seconds": completed.duration_seconds,
        "text_output": completed.text_output,
        "structured_output": completed.structured_output,
        "grounding": completed.grounding,
    }
    print(json.dumps(res_data, indent=2, ensure_ascii=False))
    return 0 if completed.status == "completed" else 1


if __name__ == "__main__":
    sys.exit(main())
