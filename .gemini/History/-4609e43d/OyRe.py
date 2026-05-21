#!/usr/bin/env python3
import subprocess  # noqa: S404

from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("NexusSotaBridge")

# Base path for task_executor.py
BASE_DIR = r"C:\Users\Raphael\.gemini\Site"
TASK_EXECUTOR = f"{BASE_DIR}\\task_executor.py"
PYTHON_EXE = f"{BASE_DIR}\\.venv\\Scripts\\python.exe"


@mcp.tool()
def execute_sota_task(description: str, agent: str = "@dispatcher") -> str:
    """Executa uma tarefa através do engine SOTA Task Executor."""
    try:
        # Chama o do.ps1 que enfileira a tarefa via HTTP ou DAL
        cmd = [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            f"{BASE_DIR}\\do.ps1",
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
            [PYTHON_EXE, TASK_EXECUTOR, "db-get", "pending"],
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
