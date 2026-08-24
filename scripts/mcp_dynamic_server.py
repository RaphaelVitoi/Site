"""
SOTA GOLD: Motor MCP Dinamico.
Mapeia operacoes do .cerebro/settings.local.json para rotas ativas do Model Context Protocol.
Implementa Antevisao de I/O: Bypass de interop WSL se executado nativamente no Linux.
"""
# pylint: disable=broad-exception-caught, no-member

import asyncio
import json
import logging
import re
import sys
from pathlib import Path

from mcp import types
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Configuracao de Log SOTA (Stderror apenas, para nao corromper o fluxo JSON-RPC no stdout)
logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="[MCP SOTA] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent.resolve()
SETTINGS_PATH = BASE_DIR / ".cerebro" / "settings.local.json"

app = Server("nexus-dynamic-mcp")


def load_operations() -> dict:
    if not SETTINGS_PATH.exists():
        logger.error(f"Manifesto de operacoes ausente: {SETTINGS_PATH}")
        return {}
    try:
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("operations", {})
    except (OSError, json.JSONDecodeError) as e:
        logger.exception(f"Entropia fatal ao carregar operations: {e}")
        return {}


@app.list_tools()  # type: ignore
async def list_tools() -> list[types.Tool]:
    operations = load_operations()
    tools = []
    for op_id, op_data in operations.items():
        tools.append(
            types.Tool(
                name=op_id,
                description=op_data.get("description", f"Executa a operacao de orquestracao {op_id}"),
                input_schema=op_data.get("inputSchema")
                or op_data.get("input_schema")
                or {"type": "object", "properties": {}, "required": []},
            )
        )
    return tools


def _check_injection(k: str, v_str: str) -> str | None:
    """Verifica injecoes de comando ou base64 invalido."""
    if k == "payload_b64":
        if not re.match(r"^[A-Za-z0-9+/=]+$", v_str):
            return "[SEC ALERTA] Tentativa de injecao detectada: payload_b64 invalido."
    elif any(char in v_str for char in [";", "&", "|", "$", "`", ">", "<", "\n", "\r"]):
        return f"[SEC ALERTA] Metacaracteres suspeitos detectados no argumento '{k}'."
    return None


def _check_path_traversal(v_str: str) -> str | None:
    """Verifica tentativas de Path Traversal."""
    if ".." in v_str or v_str.startswith("/") or (len(v_str) > 1 and v_str[1] == ":"):
        try:
            if not Path(v_str).resolve().is_relative_to(BASE_DIR.resolve()):
                return "[SEC ALERTA] Tentativa de Path Traversal detectada."
        except Exception:
            return "[SEC ALERTA] Caminho ou argumento invalido."
    return None


def _validate_arguments(arguments: dict) -> str | None:
    """SOTA GUARDRAILS: Sanitize arguments against injection and Path Traversal."""
    for k, v in arguments.items():
        v_str = str(v)
        if err := _check_injection(k, v_str):
            return err
        if err := _check_path_traversal(v_str):
            return err
    return None


def _prepare_command(op_data: dict, arguments: dict) -> tuple[str, list[str]]:
    """SOTA: Interpolacao Dinamica e Bypass de Interop WSL."""
    raw_command = op_data.get("command", "")
    raw_args = []
    for arg in op_data.get("args", []):
        formatted_arg = arg
        if isinstance(formatted_arg, str) and arguments:
            for k, v in arguments.items():
                formatted_arg = formatted_arg.replace(f"{{{k}}}", str(v))
        raw_args.append(formatted_arg)

    if sys.platform == "linux" and raw_command in ("wsl", "wsl.exe"):
        logger.info("Bypass de interop WSL acionado (Antevisao Ativa).")
        try:
            payload_idx = raw_args.index("-lc") + 1
            return "bash", ["-lc", raw_args[payload_idx]]
        except ValueError:
            pass
    return raw_command, raw_args


@app.call_tool()  # type: ignore
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    operations = load_operations()
    if name not in operations:
        return [types.TextContent(type="text", text=f"[FALHA] Operacao desconhecida no cerebro local: {name}")]

    validation_error = _validate_arguments(arguments)
    if validation_error:
        return [types.TextContent(type="text", text=validation_error)]

    exec_cmd, exec_args = _prepare_command(operations[name], arguments)

    logger.info(f"Delegando syscal para '{name}': {exec_cmd} {' '.join(exec_args)}")

    if exec_cmd == "python":
        exec_cmd = sys.executable

    try:
        # Enforce execution timeout (max 30s) to prevent hanging deceptions
        process = await asyncio.create_subprocess_exec(
            exec_cmd,
            *exec_args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(BASE_DIR),
        )

        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=15.0)
        except asyncio.TimeoutError:
            try:
                process.kill()
            except ProcessLookupError:
                pass
            return [
                types.TextContent(
                    type="text",
                    text="[ENTROPIA ALERTA] Timeout (15s) na execucao da operacao.",
                )
            ]

        out_text = stdout.decode("utf-8", errors="replace").strip()
        err_text = stderr.decode("utf-8", errors="replace").strip()

        res_text = ""
        if out_text:
            res_text += f"--- STDOUT ---\n{out_text}\n"
        if err_text:
            res_text += f"--- STDERR ---\n{err_text}\n"

        return [
            types.TextContent(
                type="text",
                text=res_text if res_text else "[SUCESSO] Operacao concluida silenciosamente.",
            )
        ]
    except OSError as e:
        return [
            types.TextContent(
                type="text",
                text=f"[ENTROPIA FATAL] Falha de I/O na ferramenta '{name}': {type(e).__name__} - {e}",
            )
        ]


async def main():
    logger.info("Inicializando servidor MCP Dinamico SOTA via STDIO...")
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
