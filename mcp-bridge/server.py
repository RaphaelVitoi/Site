#!/usr/bin/env python3
# pylint: disable=missing-module-docstring, broad-exception-caught, line-too-long, import-error, no-name-in-module
# ruff: noqa: S404, S603, BLE001

import importlib
import re
import subprocess
from pathlib import Path
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


@mcp.tool()
def execute_sota_task(description: str, agent: str = "@dispatcher") -> str:
    """Executa uma tarefa atraves do engine SOTA Task Executor."""
    # SOTA Guard: Blindagem contra Argument Injection no PowerShell
    if not re.match(r"^@[a-zA-Z0-9_-]+$", agent):
        return "Erro de Seguranca: O agente deve iniciar com '@' e conter apenas caracteres alfanumericos."

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


if __name__ == "__main__":
    mcp.run()
