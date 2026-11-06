#!/usr/bin/env python3
# pylint: disable=missing-module-docstring, broad-exception-caught, line-too-long, import-error, no-name-in-module, import-outside-toplevel
# ruff: noqa: S404, S603, BLE001

from __future__ import annotations

import importlib
from pathlib import Path
import re
import subprocess
from typing import Any

FastMCP: Any = None
for _mod_name in ("mcp.server.mcpserver", "mcp.server.fastmcp", "fastmcp"):
    try:
        _mod = importlib.import_module(_mod_name)
        FastMCP = getattr(_mod, "MCPServer", getattr(_mod, "FastMCP", None))
        if FastMCP:
            break
    except (ImportError, AttributeError):
        continue

if FastMCP is None:
    # Minimal fallback mock
    class _MockFastMCP:
        def __init__(self, name: str) -> None:
            self.name = name

        def tool(self) -> Any:
            def decorator(func: Any) -> Any:
                return func

            return decorator

        def run(self) -> None:
            # Fallback mock run method when FastMCP is not available
            return None

    FastMCP = _MockFastMCP

# Initialize FastMCP server
mcp = FastMCP("NexusSotaBridge")

# SOTA: Resolucao dinamica de caminhos para portabilidade absoluta
SCRIPT_DIR = Path(__file__).parent.resolve()
BASE_DIR = SCRIPT_DIR.parent
TASK_EXECUTOR = BASE_DIR / "task_executor.py"
PYTHON_EXE = BASE_DIR / ".venv" / "Scripts" / "python.exe"


# O PowerShell aceita estes quatro como prefixo de parametro (hifen, meia-risca,
# travessao, barra horizontal). Medido em 2026-09-16: description "-Obliterate:C:/x"
# chegava ao do.ps1 como -Obliterate, que apaga o caminho; "\u2014Execute:cmd" rodava cmd.
# O separador "--" nao serve: com -File ele quebra a chamada.
PREFIXOS_DE_PARAMETRO = ("-", "\u2013", "\u2014", "\u2015")


def descricao_vira_parametro(description: str) -> bool:
    """True se o PowerShell leria a descricao como nome de parametro do do.ps1."""
    return description.startswith(PREFIXOS_DE_PARAMETRO)


@mcp.tool()
def execute_sota_task(description: str, agent: str = "@dispatcher") -> str:
    """Executa uma tarefa atraves do engine SOTA Task Executor."""
    # SOTA Guard: Blindagem contra Argument Injection no PowerShell
    if not re.match(r"^@[a-zA-Z0-9_-]+$", agent):
        return "Erro de Seguranca: O agente deve iniciar com '@' e conter apenas caracteres alfanumericos."
    if descricao_vira_parametro(description):
        return (
            "Erro de Seguranca: a descricao nao pode comecar com traco; o PowerShell a leria "
            "como parametro do do.ps1 (ex.: -Execute, -Obliterate)."
        )

    try:
        # Chama o do.ps1 que enfileira a tarefa via HTTP ou DAL
        cmd = [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(BASE_DIR / "do.ps1"),
            description,
            agent,
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
            timeout=120,
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return f"Error executing task: {e!s}"


@mcp.tool()
def list_sota_tasks() -> str:
    """Lista tarefas pendentes do sistema SOTA."""
    try:
        result = subprocess.run(
            [str(PYTHON_EXE), str(TASK_EXECUTOR), "db-get", "pending"],
            capture_output=True,
            text=True,
            check=False,
            timeout=30,
        )
        return result.stdout
    except Exception as e:
        return f"Error listing tasks: {e!s}"


@mcp.tool()
def delegate_pmev_to_jules(prompt: str, source: str = "sources/github/RaphaelVitoi/Site", branch: str = "main") -> str:
    """Delega simulacoes intensivas de Teoria dos Jogos PMev ou refatoracoes de grande porte para o Google Jules."""
    try:
        from engine.jules_bridge import JulesClient, JulesSessionRequest  # noqa: PLC0415 - falha vira resposta da tool

        client = JulesClient()
        if not client.is_configured:
            return "Erro: JULES_API_KEY ou GOOGLE_CLOUD_PROJECT nao configurados no ambiente."
        req = JulesSessionRequest(source=source, prompt=prompt, branch=branch)
        status = client.create_session(req)
        return f"Sessao Jules criada com sucesso! Session ID: {status.session_id}, Estado: {status.state}"
    except Exception as e:
        return f"Falha ao delegar para o Jules: {e!s}"


@mcp.tool()
def get_jules_task_status(session_id: str) -> str:
    """Consulta o status e o progresso de uma sessao em execucao no Google Jules."""
    try:
        from engine.jules_bridge import JulesClient  # noqa: PLC0415 - falha vira resposta da tool

        client = JulesClient()
        status = client.get_session_status(session_id)
        return f"Session ID: {status.session_id} | Estado: {status.state} | PR: {status.pr_url or 'N/A'}"
    except Exception as e:
        return f"Falha ao consultar status no Jules: {e!s}"


@mcp.tool()
def get_chrysalis_health() -> str:
    """Consulta a saude do servico Chrysalis (loopback) e apps disponiveis."""
    try:
        from engine.chrysalis_bridge import ChrysalisClient  # noqa: PLC0415

        client = ChrysalisClient()
        health = client.get_health()
        caps = client.probe_capabilities()
        return (
            f"Status: {health.status} | apps: {health.apps_count} | base_url: {health.base_url} | "
            f"fallback_used: {health.fallback_used} | capabilities: {caps}"
        )
    except Exception as e:
        return f"Falha ao consultar Chrysalis: {e!s}"


@mcp.tool()
def list_chrysalis_apps() -> str:
    """Lista apps da Store do servico Chrysalis (GET /v1/apps)."""
    try:
        from engine.chrysalis_bridge import ChrysalisClient  # noqa: PLC0415

        client = ChrysalisClient()
        apps = client.list_apps()
        if not apps:
            return "Nenhum app retornado pelo servico Chrysalis."
        return "\n".join(
            f"- {a.get('id', '?')} | {a.get('name', '')} | updated={a.get('updated', False)}" for a in apps
        )
    except Exception as e:
        return f"Falha ao listar apps Chrysalis: {e!s}"


@mcp.tool()
def probe_chrysalis_capabilities() -> str:
    """Sonda endpoints candidatos do servico Chrysalis (mede, nao alega)."""
    try:
        from engine.chrysalis_bridge import ChrysalisClient  # noqa: PLC0415

        client = ChrysalisClient()
        caps = client.probe_capabilities()
        return " | ".join(f"{k}={v}" for k, v in caps.items())
    except Exception as e:
        return f"Falha ao sondar Chrysalis: {e!s}"


@mcp.tool()
def validate_chrysalis_edit(
    workspace_path: str,
    content: str,
    new_content: str,
    expected_revision: str = "",
    mode: str = "accept",
    approved: bool = False,
) -> str:
    """Valida plano de edicao com revisao otimista (sem mutar arquivo)."""
    try:
        from engine.chrysalis_bridge import ChrysalisClient, EditPlan, compute_revision  # noqa: PLC0415

        client = ChrysalisClient()
        expected = expected_revision or compute_revision(content)
        plan = EditPlan(
            path=workspace_path,
            new_content=new_content,
            expected_revision=expected,
            mode=mode,
            approved=approved,
        )
        result = client.validate_edit(plan, current_revision=compute_revision(content), mutation=(mode != "plan"))
        return f"path={result.path} | revision={result.revision} | undo_id={result.undo_id}"
    except Exception as e:
        return f"Falha na validacao Chrysalis: {e!s}"


@mcp.tool()
def compact_chrysalis_summary(
    goal: str,
    progress: str,
    decisions: str = "",
    next_steps: str = "",
    files_read: str = "",
    files_changed: str = "",
) -> str:
    """Gera resumo de compactacao /compact (JSON) para o agente Chrysalis."""
    try:
        import json  # noqa: PLC0415

        from engine.chrysalis_bridge import build_compaction_summary  # noqa: PLC0415

        summary = build_compaction_summary(
            goal=goal,
            progress=progress,
            decisions=[x for x in decisions.split(";") if x.strip()],
            next_steps=[x for x in next_steps.split(";") if x.strip()],
            files_read=[x for x in files_read.split(";") if x.strip()],
            files_changed=[x for x in files_changed.split(";") if x.strip()],
        )
        return json.dumps(summary, ensure_ascii=False)
    except Exception as e:
        return f"Falha ao compactar: {e!s}"


if __name__ == "__main__":
    mcp.run()
