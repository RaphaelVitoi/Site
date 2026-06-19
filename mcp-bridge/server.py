#!/usr/bin/env python3
# pylint: disable=missing-module-docstring, broad-exception-caught, line-too-long, import-error

import re
import subprocess  # noqa: S404
from pathlib import Path

from mcp.server.fastmcp import FastMCP  # type: ignore

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
        result = subprocess.run(  # noqa: S603
            cmd,
            capture_output=True,
            text=True,
            check=False,
            timeout=120,
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:  # noqa: BLE001
        return f"Error executing task: {e!s}"


@mcp.tool()
def list_sota_tasks() -> str:
    """Lista tarefas pendentes do sistema SOTA."""
    try:
        result = subprocess.run(  # noqa: S603
            [str(PYTHON_EXE), str(TASK_EXECUTOR), "db-get", "pending"],
            capture_output=True,
            text=True,
            check=False,
            timeout=30,
        )
        return result.stdout
    except Exception as e:  # noqa: BLE001
        return f"Error listing tasks: {e!s}"


if __name__ == "__main__":
    mcp.run()
