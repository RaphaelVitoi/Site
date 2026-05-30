"""
SOTA GOLD: Motor MCP Dinamico.
Mapeia operacoes do .cerebro/settings.local.json para rotas ativas do Model Context Protocol.
Implementa Antevisao de I/O: Bypass de interop WSL se executado nativamente no Linux.
"""
# pylint: disable=broad-exception-caught

import asyncio
import json
import logging
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
        logger.error(f"Entropia fatal ao carregar operations: {e}", exc_info=True)
        return {}


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    operations = load_operations()
    tools = []
    for op_id, op_data in operations.items():
        tools.append(
            types.Tool(
                name=op_id,
                description=op_data.get("description", f"Executa a operacao de orquestracao {op_id}"),
                inputSchema=op_data.get("inputSchema", {"type": "object", "properties": {}, "required": []}),
            )
        )
    return tools


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    operations = load_operations()
    if name not in operations:
        return [
            types.TextContent(
                type="text",
                text=f"[FALHA] Operacao desconhecida no cerebro local: {name}",
            )
        ]

    op_data = operations[name]
    raw_command = op_data.get("command", "")

    # SOTA: Interpolacao Dinamica de Argumentos (IPC Payload)
    raw_args = []
    for arg in op_data.get("args", []):
        formatted_arg = arg
        if isinstance(formatted_arg, str) and arguments:
            for k, v in arguments.items():
                formatted_arg = formatted_arg.replace(f"{{{k}}}", str(v))
        raw_args.append(formatted_arg)

    # SOTA: Antevisao Semantica e Bypass de Interop (Friccao Zero)
    # Se o MCP esta instanciado nativamente no Debian e a operacao tenta usar interop ("wsl.exe"),
    # quebramos o encapsulamento NT e rodamos a instrucao interna direto no bash atual.
    if sys.platform == "linux" and raw_command in ("wsl", "wsl.exe"):
        logger.info(f"Bypass de interop WSL acionado (Antevisao Ativa) para a tool '{name}'.")
        try:
            payload_idx = raw_args.index("-lc") + 1
            target_payload = raw_args[payload_idx]
            exec_cmd = "bash"
            exec_args = ["-lc", target_payload]
        except ValueError:
            exec_cmd = raw_command
            exec_args = raw_args
    else:
        exec_cmd = raw_command
        exec_args = raw_args

    logger.info(f"Delegando syscal para '{name}': {exec_cmd} {' '.join(exec_args)}")

    try:
        process = await asyncio.create_subprocess_exec(
            exec_cmd,
            *exec_args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(BASE_DIR) if sys.platform == "linux" else None,
        )
        stdout, stderr = await process.communicate()
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
                text=res_text if res_text else "[SUCESSO] Operacao silenciosa concluida.",
            )
        ]
    except (OSError, asyncio.TimeoutError, FileNotFoundError) as e:
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
