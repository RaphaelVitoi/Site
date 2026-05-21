"""
Governanca de Autonomia do Sistema -- Tetralogia VITOI 3.2.
Controla o nivel de agencia do sistema: stop, default, partial, full.
"""

import asyncio
import functools
import json
import logging
import os
import re
import shlex
import shutil
import subprocess  # noqa: S404
import time
from pathlib import Path

import aiofiles

from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

# TETRALOGIA DE GOVERNANÇA VITOI 3.2
# W0 (stop) ⊂ W1 (default) ⊂ W2 (partial - Tier 3)
# ⊂ W2.5 (full_restricted - Tier 2) ⊂ W3 (full - Tier 1)
VALID_AUTONOMY_MODES = {"stop", "default", "partial", "full", "sandbox"}
PROTECTED_KERNEL_PATHS = [  # pylint: disable=line-too-long
    ".git",
    ".venv",
    "task_executor.py",
    "do.ps1",
    "_env.ps1",
    ".env",
    "autonomy.py",
    "scripts",
]

# Modos legados mapeados para o novo sistema
LEGACY_MODE_MAP = {"off": "stop"}
AGENT_CHICO = "@chico"

# Cache com TTL de 5 segundos para evitar I/O excessivo
_AUTONOMY_CACHE = {"mode": "stop", "timestamp": 0.0}


def _read_legacy_autonomy_config() -> str:
    """Lê a configuração mitigando o aninhamento de tratamento de erro.
    (SOTA v6: Diretórios legados do Claude desligados)."""
    config_path = Path("autonomy.json")
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8-sig") as f:
                data = json.loads(f.read().lstrip("\ufeff"))
                return data.get("mode", "stop")
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.debug("[AUTONOMY] Falha ao ler configuracao legada: %s", e)
    return "stop"


async def get_autonomy_mode(manager: QueueManager) -> str:
    """Retorna o modo de autonomia atual, normalizando legados para VITOI 3.2."""
    if time.time() - float(_AUTONOMY_CACHE["timestamp"]) < 5:
        return str(_AUTONOMY_CACHE["mode"])

    mode = await manager.get_system_state("autonomy_mode")
    if not mode:
        mode = _read_legacy_autonomy_config()
        await manager.set_system_state("autonomy_mode", mode)

    # Normalizacao de legado: "off" -> "stop"
    mode = LEGACY_MODE_MAP.get(mode, mode)
    if mode not in VALID_AUTONOMY_MODES:
        logger.warning(
            "[AUTONOMY] Modo invalido '%s' detectado. Revertendo para 'stop' (W0).",
            mode,
        )
        mode = "stop"

    _AUTONOMY_CACHE["mode"] = mode
    _AUTONOMY_CACHE["timestamp"] = time.time()
    return mode


async def _forge_files(text: str, effective_mode: str, agent_name: str) -> list[str]:
    """Isola a materialização em disco e blindagem contra Path Traversal."""
    modified_files = []
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-z]*\n(.*?)```"

    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        filepath = match.group(1).strip()
        content = match.group(2)
        try:
            base_path = Path(__file__).parent.parent.absolute()
            target_path = Path(filepath).absolute()

            if not target_path.is_relative_to(base_path):
                logger.error("[SEC] Bloqueio de escrita fora da raiz: %s", filepath)
                continue

            target_path_str = os.path.normpath(str(target_path))
            is_protected = any(
                os.path.normpath(p) in target_path_str for p in PROTECTED_KERNEL_PATHS
            )
            privileged_agents = ["@chico", "@gemma4"]
            if is_protected:
                if effective_mode == "full" and agent_name in privileged_agents:
                    logger.warning(
                        "[GOD MODE W3] Override de Seguranca Absoluto (TIER 1). "
                        "Re-escrevendo arquivo de Kernel: %s",
                        filepath,
                    )
                else:
                    logger.error(
                        "[SEC] Bloqueio de escrita em arquivo protegido. "
                        "%s nao possui privilegios de Tier 1: %s",
                        agent_name,
                        filepath,
                    )
                    continue

            target_path.parent.mkdir(parents=True, exist_ok=True)
            async with aiofiles.open(target_path, "w", encoding="utf-8") as f:
                await f.write(content)
            logger.info("[MATERIALIZACAO] Arquivo forjado: %s", filepath)
            modified_files.append(target_path.name)
        except Exception:  # pylint: disable=broad-exception-caught
            logger.exception("[FAIL] Falha ao forjar %s", filepath)

    return modified_files


def _validate_command(cmd: str, effective_mode: str, agent_name: str) -> bool:
    forbidden_tokens = [
        "rm -rf /",
        "del /s c:\\",
        "diskpart",
        "format ",
        "mkfs",
        "vssadmin",
    ]
    state_changing_commands = [
        "npm install",
        "npm i",
        "pip install",
        "git reset",
        "git push",
        "git clone",
        "yarn add",
        "pnpm add",
    ]

    # SOTA: Expansão implacável dos vetores de bypass
    # (sub-expressões, backticks, redirecionamentos).
    if effective_mode not in ["full", "full_restricted"] and any(
        char in cmd for char in [";", "|", "&&", "&", "$", "`", ">", "<"]
    ):
        error_msg = (
            f"Encadeamento, sub-expressoes ou redirecionamento bloqueado no modo "
            f"'{effective_mode}'. Privilegio insuficiente para {agent_name}."
        )
        logger.error("[SEC] %s", error_msg)
        raise PermissionError(error_msg)

    if any(f in cmd.lower() for f in forbidden_tokens):
        error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
        logger.error("[SEC] %s", error_msg)
        raise PermissionError(error_msg)

    if effective_mode == "partial" and any(
        k in cmd.lower() for k in state_changing_commands
    ):
        logger.warning(
            "[SEC TIER 3] O agente %s tentou mutar o estado do ecossistema. "
            "Comando interceptado: '%s'",
            agent_name,
            cmd,
        )
        logger.warning("[GOD MODE PARTIAL] Execute manualmente: '%s'", cmd)
        return False

    return True


async def _run_native_command(cmd: str) -> None:
    logger.info("[EXECUCAO] Rodando comando nativo: %s", cmd)
    if os.name == "nt":
        cmd_parts = [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            cmd,
        ]
    else:
        cmd_parts = shlex.split(cmd, posix=True)
        if cmd_parts:
            executable = shutil.which(cmd_parts[0])
            if executable:
                cmd_parts[0] = executable

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,
        functools.partial(
            subprocess.run,
            cmd_parts,
            shell=False,
            capture_output=True,
            text=True,
            timeout=300,
            check=False,
        ),
    )

    if result.returncode == 0:
        logger.info("[OK] Comando executado: %s", cmd)
    else:
        error_msg = f"Codigo {result.returncode} - {result.stderr.strip()}"
        logger.error("[FAIL] Falha no comando '%s': %s", cmd, error_msg)
        raise RuntimeError(f"O comando nativo falhou: {cmd}\nDetalhes: {error_msg}")


async def _run_sandboxed_command(cmd: str, agent_name: str) -> None:
    logger.info(
        "[CASA DE MAQUINAS] Sandbox isolado acionado para %s: %s", agent_name, cmd
    )
    cmd_parts = [
        "docker",
        "run",
        "--rm",
        "--network",
        "bridge",
        "--security-opt",
        "no-new-privileges",
        "--cap-drop",
        "ALL",
        "opensandbox/execd:v1.0.7",
        "bash",
        "-c",
        cmd,
    ]
    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(
            None,
            functools.partial(
                subprocess.run,
                cmd_parts,
                shell=False,
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            ),
        )
        if result.returncode == 0:
            logger.info("[OK] Casa de Maquinas executou com sucesso: %s", cmd)
        else:
            error_msg = f"Codigo {result.returncode} - {result.stderr.strip()}"
            logger.warning(
                "[SANDBOX FAIL] Comando contido na Casa de Maquinas: %s", error_msg
            )
    except FileNotFoundError:
        logger.error(
            "[SANDBOX FATAL] Docker ausente. Nao foi possivel instanciar a Casa de Maquinas."
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.exception(
            "[SANDBOX FAIL] Erro critico ao executar na Casa de Maquinas: %s", e
        )


async def _execute_commands(text: str, effective_mode: str, agent_name: str) -> None:
    """Isola a orquestração segura de sub-processos do terminal."""
    if effective_mode in ["stop", "default"]:
        logger.warning(
            "[SEC] Execucao de terminal bloqueada por hardware-lock no modo '%s'.",
            effective_mode,
        )
        return

    cmd_pattern = (
        r"(?:Comando|Command|Executar|Execute):\s*(?:```[a-z]*\n(.*?)\n```|`([^`]+)`)"
    )

    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        cmd = cmd.strip()

        if effective_mode == "sandbox":
            await _run_sandboxed_command(cmd, agent_name)
            continue

        if not _validate_command(cmd, effective_mode, agent_name):
            continue

        try:
            await _run_native_command(cmd)
        except Exception:
            logger.exception("[FAIL] Arritmia no comando %s", cmd)
            raise


async def _read_autonomy_levers() -> tuple[list[str], bool]:
    """Extrai alavancas do autonomy.json de forma assincrona e segura."""
    god_mode_agents = [AGENT_CHICO, "@gemma4"]
    sandbox_default = True
    config_path = Path("autonomy.json")
    if config_path.exists():
        try:
            async with aiofiles.open(config_path, "r", encoding="utf-8-sig") as f:
                content = await f.read()
                cfg = json.loads(content.lstrip("\ufeff"))
                god_mode_agents = cfg.get("god_mode_agents", god_mode_agents)
                sandbox_default = cfg.get("sandbox_default", sandbox_default)
        except Exception:  # noqa: S110 # pylint: disable=broad-exception-caught
            pass
    return god_mode_agents, sandbox_default


def _resolve_effective_mode(
    global_mode: str, agent_name: str, god_mode_agents: list[str], sandbox_default: bool
) -> str:
    """Resolve o tier de autonomia com base na identidade e estado global."""
    if global_mode in ["stop", "default"]:
        return global_mode
    if agent_name in god_mode_agents:
        logger.info(
            "[TIER 1] %s invocando autoridade executiva maxima (God Mode). "
            "Operando sob bypass nativo irrestrito.",
            agent_name,
        )
        return global_mode
    if agent_name == "@maverick":
        return "full_restricted" if global_mode == "full" else global_mode

    if sandbox_default and global_mode in ["partial", "full"]:
        return "sandbox"
    return "partial" if global_mode in ["partial", "full"] else global_mode


async def apply_god_mode(
    text: str, manager: QueueManager, agent_name: str | None = None
) -> list[str]:
    """
    Orquestrador VITOI 3.2 de Autonomia (Córtex de Execução).
    Aplica a hierarquia de privilegios de Tier 0 a Tier 3 dinamicamente.
    """
    god_mode_agents, sandbox_default = await _read_autonomy_levers()
    global_mode = await get_autonomy_mode(manager)

    # Deducao dinamica de identidade caso nao seja provida explicitamente pela DAG
    if not agent_name:
        running_tasks = await manager.get_tasks(status="running")
        # SOTA: Obliteração da escalada de privilégios (Zero-Trust).
        # Fallback para Tier inferior.
        agent_name = running_tasks[0].agent if running_tasks else "@dispatcher"

    effective_mode = _resolve_effective_mode(
        global_mode, agent_name, god_mode_agents, sandbox_default
    )

    if effective_mode == "stop":
        logger.warning(
            "[GOD MODE] W0 (Stop) ativo. Observação pura. Nenhuma mutação permitida."
        )
        return []

    modified_files = await _forge_files(text, effective_mode, agent_name)

    if effective_mode == "default":
        logger.info(
            "[GOD MODE] W1 (Default) ativo. Homeostase. "
            "Arquivos forjados, execução de comandos bloqueada."
        )
        return modified_files

    await _execute_commands(text, effective_mode, agent_name)
    return modified_files
