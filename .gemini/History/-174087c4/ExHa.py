"""
Governanca de Autonomia do Sistema -- Tetralogia VITOI 3.2.
Controla o nivel de agencia do sistema: stop, default, partial, full.
"""
import os
import re
import json
import time
import asyncio
import logging
import shlex
import shutil
import functools
import subprocess
import aiofiles
from pathlib import Path
from typing import List, Optional
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

# TETRALOGIA DE GOVERNANÇA VITOI 3.2
# W0 (stop) ⊂ W1 (default) ⊂ W2 (partial - Tier 3) ⊂ W2.5 (full_restricted - Tier 2) ⊂ W3 (full - Tier 1)
VALID_AUTONOMY_MODES = {"stop", "default", "partial", "full"}
PROTECTED_KERNEL_PATHS = [".git", ".venv", "task_executor.py", "do.ps1", "_env.ps1", ".env", "autonomy.py"]

# Modos legados mapeados para o novo sistema
LEGACY_MODE_MAP = {"off": "stop"}
AGENT_CHICO = "@chico"

# Cache com TTL de 5 segundos para evitar I/O excessivo
_AUTONOMY_CACHE = {"mode": "stop", "timestamp": 0.0}

def _read_legacy_autonomy_config() -> str:
    """Lê a configuração legada mitigando o aninhamento de tratamento de erro."""
    config_path = Path(".claude/autonomy.json")
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8-sig") as f:
                data = json.loads(f.read().lstrip('\ufeff'))
                return data.get("mode", "stop")
        except Exception:
            pass
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
        logger.warning(f"[AUTONOMY] Modo invalido '{mode}' detectado. Revertendo para 'stop' (W0).")
        mode = "stop"

    _AUTONOMY_CACHE["mode"] = mode
    _AUTONOMY_CACHE["timestamp"] = time.time()
    return mode


async def _forge_files(text: str, effective_mode: str, agent_name: str) -> List[str]:
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
                logger.error(f"[SEC] Bloqueio de escrita fora da raiz: {filepath}")
                continue

            target_path_str = os.path.normpath(str(target_path))
            is_protected = any(os.path.normpath(p) in target_path_str for p in PROTECTED_KERNEL_PATHS)
            if is_protected:
                if effective_mode == "full" and agent_name == AGENT_CHICO:
                    logger.warning(f"[GOD MODE W3] Override de Seguranca Absoluto (TIER 1). Re-escrevendo arquivo de Kernel: {filepath}")
                else:
                    logger.error(f"[SEC] Bloqueio de escrita em arquivo protegido. {agent_name} nao possui privilegios de Tier 1: {filepath}")
                    continue

            target_path.parent.mkdir(parents=True, exist_ok=True)
            async with aiofiles.open(target_path, "w", encoding="utf-8") as f:
                await f.write(content)
            logger.info(f"[MATERIALIZACAO] Arquivo forjado: {filepath}")
            modified_files.append(target_path.name)
        except Exception as e:
            logger.error(f"[FAIL] Falha ao forjar {filepath}: {e}")

    return modified_files

def _validate_command(cmd: str, effective_mode: str, agent_name: str) -> bool:
    forbidden_tokens = ["rm -rf /", "del /s c:\\", "diskpart", "format ", "mkfs", "vssadmin"]
    state_changing_commands = [
        "npm install", "npm i", "pip install", "git reset", "git push", "git clone", "yarn add", "pnpm add"
    ]

    if effective_mode not in ["full", "full_restricted"] and any(char in cmd for char in [';', '|', '&&']):
        error_msg = f"Encadeamento de comandos bloqueado no modo '{effective_mode}'. Privilegio insuficiente para {agent_name}."
        logger.error(f"[SEC] {error_msg}")
        raise PermissionError(error_msg)

    if any(f in cmd.lower() for f in forbidden_tokens):
        error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
        logger.error(f"[SEC] {error_msg}")
        raise PermissionError(error_msg)

    if effective_mode == "partial" and any(k in cmd.lower() for k in state_changing_commands):
        logger.warning(f"[SEC TIER 3] O agente {agent_name} tentou mutar o estado do ecossistema. Comando interceptado: '{cmd}'")
        logger.warning(f"[GOD MODE PARTIAL] Execute manualmente: '{cmd}'")
        return False

    return True

async def _run_native_command(cmd: str) -> None:
    logger.info(f"[EXECUCAO] Rodando comando nativo: {cmd}")
    if os.name == 'nt':
        cmd_parts = ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", cmd]
    else:
        cmd_parts = shlex.split(cmd, posix=True)
        if cmd_parts:
            executable = shutil.which(cmd_parts[0])
            if executable:
                cmd_parts[0] = executable

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,
        functools.partial(subprocess.run, cmd_parts, shell=False, capture_output=True, text=True, timeout=300, check=False)
    )

    if result.returncode == 0:
        logger.info(f"[OK] Comando executado: {cmd}")
    else:
        error_msg = f"Codigo {result.returncode} - {result.stderr.strip()}"
        logger.error(f"[FAIL] Falha no comando '{cmd}': {error_msg}")
        raise RuntimeError(f"O comando nativo falhou: {cmd}\nDetalhes: {error_msg}")

async def _execute_commands(text: str, effective_mode: str, agent_name: str) -> None:
    """Isola a orquestração segura de sub-processos do terminal."""
    if effective_mode in ["stop", "default"]:
        logger.warning(f"[SEC] Execucao de terminal bloqueada por hardware-lock no modo '{effective_mode}'.")
        return

    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```[a-z]*\n(.*?)\n```|`([^`]+)`)"

    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        cmd = cmd.strip()

        if not _validate_command(cmd, effective_mode, agent_name):
            continue

        try:
            await _run_native_command(cmd)
        except Exception as e:
            logger.error(f"[FAIL] Arritmia no comando {cmd}: {e}")
            raise


async def apply_god_mode(text: str, manager: QueueManager, agent_name: Optional[str] = None) -> List[str]:
    """
    Orquestrador VITOI 3.2 de Autonomia (Córtex de Execução).
    Aplica a hierarquia de privilegios de Tier 0 a Tier 3 dinamicamente.
    """
    global_mode = await get_autonomy_mode(manager)

    # Deducao dinamica de identidade caso nao seja provida explicitamente pela DAG
    if not agent_name:
        running_tasks = await manager.get_tasks(status="running")
        agent_name = running_tasks[0].agent if running_tasks else AGENT_CHICO

    # Resolucao de Tiering (Matriz de Identidade x Estado Global)
    if global_mode in ["stop", "default"]:
        effective_mode = global_mode
    elif agent_name == AGENT_CHICO:
        effective_mode = global_mode # W3
    elif agent_name == "@maverick":
        effective_mode = "full_restricted" if global_mode == "full" else global_mode # W2.5
    else:
        effective_mode = "partial" if global_mode in ["partial", "full"] else global_mode # W2 max

    if effective_mode == "stop":
        logger.warning("[GOD MODE] W0 (Stop) ativo. Observação pura. Nenhuma mutação permitida.")
        return []

    modified_files = await _forge_files(text, effective_mode, agent_name)

    if effective_mode == "default":
        logger.info("[GOD MODE] W1 (Default) ativo. Homeostase. Arquivos forjados, execução de comandos bloqueada.")
        return modified_files

    await _execute_commands(text, effective_mode, agent_name)
    return modified_files
