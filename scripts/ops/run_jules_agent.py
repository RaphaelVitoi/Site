"""CLI operacional para execucao autonoma do Jules Agent (Google Jules API v1alpha).

Permite criar sessoes assincronas na nuvem, listar sessoes e atividades,
aprovar planos (:approvePlan), interagir via mensagem (:sendMessage) e coletar patches/diffs.
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

from engine.jules_bridge import (
    JULES_DEFAULT_SOURCE,
    JulesClient,
    JulesSessionRequest,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("JulesAgentCLI")


def cmd_create(args: argparse.Namespace, client: JulesClient) -> int:
    """Cria e dispara uma nova sessao assincrona na VM do Jules."""
    automation_mode = "AUTO_CREATE_PR" if args.auto_pr else None
    logger.info("Criando sessao Jules no source %s (branch: %s)...", args.source, args.branch)
    t0 = time.perf_counter()

    req = JulesSessionRequest(
        source=args.source,
        prompt=args.prompt,
        branch=args.branch,
        auto_approve_plan=args.auto_approve,
        title=args.title or "",
        automation_mode=automation_mode,
    )
    status = client.create_session(req)
    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Sessao criada com sucesso em %.2fs. ID: %s", elapsed, status.session_id)

    res_data = {
        "session_id": status.session_id,
        "state": status.state,
        "create_time": status.create_time,
        "update_time": status.update_time,
        "title": status.title,
        "pr_url": status.pr_url,
        "elapsed_seconds": elapsed,
    }
    if args.json:
        print(json.dumps(res_data, indent=2, ensure_ascii=False))
    else:
        print(f"\n[JULES SUCESSO] Sessao criada: {status.session_id} (Estado: {status.state})")
        if status.pr_url:
            print(f"PR URL: {status.pr_url}")

    if args.sync:
        _trigger_sync()
    return 0


def cmd_list(args: argparse.Namespace, client: JulesClient) -> int:
    """Lista sessoes existentes no Jules."""
    sessions = client.list_sessions(page_size=args.page_size)
    if args.json:
        print(json.dumps({"sessions": sessions}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[JULES SESSOES] {len(sessions)} sessao(oes) encontrada(s):")
        for s in sessions:
            name = str(s.get("name", ""))
            sid = name.split("/")[-1] if "/" in name else s.get("id", "N/A")
            state = s.get("state", "UNKNOWN")
            title = s.get("title", "Sem titulo")
            created = s.get("createTime", "")[:19].replace("T", " ")
            print(f"  - ID: {sid} | Estado: {state} | Criado: {created}")
            print(f"    Titulo: {title}")
    return 0


def cmd_get(args: argparse.Namespace, client: JulesClient) -> int:
    """Consulta detalhes e status de uma sessao especifica."""
    status = client.get_session_status(args.session_id)
    res_data = {
        "session_id": status.session_id,
        "state": status.state,
        "title": status.title,
        "create_time": status.create_time,
        "update_time": status.update_time,
        "pr_url": status.pr_url,
        "activities_count": len(status.activities or []),
    }
    if args.json:
        print(json.dumps(res_data, indent=2, ensure_ascii=False))
    else:
        print(f"\n[JULES SESSAO {status.session_id}]")
        print(f"  - Estado: {status.state}")
        print(f"  - Titulo: {status.title}")
        print(f"  - Criado em: {status.create_time}")
        print(f"  - Atualizado em: {status.update_time}")
        if status.pr_url:
            print(f"  - PR URL: {status.pr_url}")
        print(f"  - Atividades: {len(status.activities or [])}")
    return 0


def cmd_activities(args: argparse.Namespace, client: JulesClient) -> int:
    """Lista atividades detalhadas de uma sessao."""
    acts = client.get_activities(args.session_id)
    if args.json:
        print(json.dumps({"activities": acts}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[JULES ATIVIDADES] {len(acts)} evento(s) para a sessao {args.session_id}:")
        for act in acts:
            aid = act.get("name", "").split("/")[-1] or act.get("id", "N/A")
            orig = act.get("originator", "unknown")
            ctime = act.get("createTime", "")[:19].replace("T", " ")
            keys = [k for k in act.keys() if k not in {"name", "id", "createTime", "originator"}]
            print(f"  - [{ctime}] {orig} | ID: {aid} | Tipos: {', '.join(keys)}")
    return 0


def cmd_approve(args: argparse.Namespace, client: JulesClient) -> int:
    """Aprova plano gerado pela sessao."""
    logger.info("Aprovando plano para a sessao %s...", args.session_id)
    ok = client.approve_plan(args.session_id, activity_id=args.activity)
    if args.json:
        print(json.dumps({"session_id": args.session_id, "approved": ok}, indent=2, ensure_ascii=False))
    else:
        status_str = "APROVADO COM SUCESSO" if ok else "FALHA NA APROVACAO"
        print(f"\n[JULES PLANO] {status_str} para sessao {args.session_id}")

    if ok and args.sync:
        _trigger_sync()
    return 0 if ok else 1


def cmd_send(args: argparse.Namespace, client: JulesClient) -> int:
    """Envia mensagem/instrucao para uma sessao ativa."""
    logger.info("Enviando mensagem para a sessao %s...", args.session_id)
    ok = client.send_message(args.session_id, args.message)
    if args.json:
        print(json.dumps({"session_id": args.session_id, "sent": ok}, indent=2, ensure_ascii=False))
    else:
        status_str = "ENVIADA COM SUCESSO" if ok else "FALHA NO ENVIO"
        print(f"\n[JULES MENSAGEM] {status_str} para sessao {args.session_id}")
    return 0 if ok else 1


def cmd_diff(args: argparse.Namespace, client: JulesClient) -> int:
    """Coleta o diff/patch da sessao."""
    logger.info("Obtendo diff para a sessao %s...", args.session_id)
    res = client.get_diff(args.session_id)
    if args.json:
        print(
            json.dumps(
                {
                    "session_id": res.session_id,
                    "files_changed": res.files_changed,
                    "patch_length": len(res.diff_content),
                    "patch": res.diff_content,
                },
                indent=2,
                ensure_ascii=False,
            )
        )
    else:
        print(f"\n[JULES DIFF] Sessao {res.session_id}: {len(res.files_changed)} arquivo(s) modificado(s):")
        for f in res.files_changed:
            print(f"  - {f}")
        if res.diff_content:
            print(f"\n--- PATCH UNIDIFF ({len(res.diff_content)} bytes) ---")
            print(res.diff_content[:1000] + ("\n... [truncado]" if len(res.diff_content) > 1000 else ""))
    return 0


def cmd_sources(args: argparse.Namespace, client: JulesClient) -> int:
    """Lista fontes/repositorios conectados ao Jules."""
    sources = client.list_sources(page_size=args.page_size)
    if args.json:
        print(json.dumps({"sources": sources}, indent=2, ensure_ascii=False))
    else:
        print(f"\n[JULES FONTES] {len(sources)} fonte(s) conectada(s):")
        for src in sources:
            name = src.get("name", "N/A")
            sid = src.get("id", name)
            print(f"  - {name} (ID: {sid})")
    return 0


def _trigger_sync() -> None:
    """Aciona o sincronizador oficial do Jules para atualizar JULES_REPORT.md."""
    try:
        from scripts.ops.sync_jules_report import (
            JULES_REPORT_FILE,
            fetch_all_sessions_and_activities,
            format_markdown_report,
        )

        sessions = fetch_all_sessions_and_activities()
        report_md = format_markdown_report(sessions)
        JULES_REPORT_FILE.write_text(report_md, encoding="utf-8")
        logger.info("JULES_REPORT.md sincronizado com sucesso.")
    except Exception as e:
        logger.warning("Falha ao sincronizar JULES_REPORT.md: %s", e)


def main() -> int:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--json", action="store_true", help="Formato de saida em JSON estrito")
    common.add_argument("--sync", action="store_true", help="Sincroniza JULES_REPORT.md apos execucao")

    parser = argparse.ArgumentParser(
        description="CLI do Jules Agent (Google Jules API v1alpha).",
        parents=[common],
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcomando: create
    p_create = subparsers.add_parser("create", parents=[common], help="Cria nova sessao no Jules")
    p_create.add_argument("prompt", type=str, help="Instrucao ou tarefa para o agente na VM de nuvem")
    p_create.add_argument("--source", type=str, default=JULES_DEFAULT_SOURCE, help="Fonte/repositorio GitHub")
    p_create.add_argument("--branch", type=str, default="master", help="Branch de inicio (startingBranch)")
    p_create.add_argument("--title", type=str, default=None, help="Titulo amigavel da sessao")
    p_create.add_argument("--auto-approve", action="store_true", help="Auto-aprovar plano de execucao")
    p_create.add_argument("--auto-pr", action="store_true", help="Criar Pull Request automaticamente (AUTO_CREATE_PR)")

    # Subcomando: list
    p_list = subparsers.add_parser("list", parents=[common], help="Lista sessoes existentes")
    p_list.add_argument("--page-size", type=int, default=10, help="Quantidade maxima de sessoes a listar")

    # Subcomando: get
    p_get = subparsers.add_parser("get", parents=[common], help="Consulta detalhes de uma sessao")
    p_get.add_argument("session_id", type=str, help="ID da sessao")

    # Subcomando: activities
    p_act = subparsers.add_parser("activities", parents=[common], help="Lista atividades de uma sessao")
    p_act.add_argument("session_id", type=str, help="ID da sessao")

    # Subcomando: approve
    p_app = subparsers.add_parser("approve", parents=[common], help="Aprova plano de uma sessao (:approvePlan)")
    p_app.add_argument("session_id", type=str, help="ID da sessao")
    p_app.add_argument("--activity", type=str, default=None, help="ID da atividade especifica (opcional)")

    # Subcomando: send
    p_send = subparsers.add_parser("send", parents=[common], help="Envia mensagem para uma sessao (:sendMessage)")
    p_send.add_argument("session_id", type=str, help="ID da sessao")
    p_send.add_argument("message", type=str, help="Mensagem/instrucao a enviar")

    # Subcomando: diff
    p_diff = subparsers.add_parser("diff", parents=[common], help="Coleta diff/patch da sessao")
    p_diff.add_argument("session_id", type=str, help="ID da sessao")

    # Subcomando: sources
    p_src = subparsers.add_parser("sources", parents=[common], help="Lista fontes conectadas")
    p_src.add_argument("--page-size", type=int, default=10, help="Quantidade maxima de fontes a listar")

    args = parser.parse_args()

    client = JulesClient()
    if not client.is_configured:
        logger.error("JULES_API_KEY ausente em HKCU/HKLM ou os.environ.")
        return 1

    if args.command == "create":
        return cmd_create(args, client)
    elif args.command == "list":
        return cmd_list(args, client)
    elif args.command == "get":
        return cmd_get(args, client)
    elif args.command == "activities":
        return cmd_activities(args, client)
    elif args.command == "approve":
        return cmd_approve(args, client)
    elif args.command == "send":
        return cmd_send(args, client)
    elif args.command == "diff":
        return cmd_diff(args, client)
    elif args.command == "sources":
        return cmd_sources(args, client)

    return 0


if __name__ == "__main__":
    sys.exit(main())
