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
from pathlib import Path
from typing import List
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

# TETRALOGIA DE GOVERNANÇA VITOI 3.2
# W0 (stop) ⊂ W1 (default) ⊂ W2 (partial) ⊂ W3 (full - God Mode Absoluto)
VALID_AUTONOMY_MODES = {"stop", "default", "partial", "full"}

# Modos legados mapeados para o novo sistema
LEGACY_MODE_MAP = {"off": "stop"}

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
    if time.time() - _AUTONOMY_CACHE["timestamp"] < 5:
        return _AUTONOMY_CACHE["mode"]

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


async def _forge_files(text: str, autonomy_mode: str) -> List[str]:
    """Isola a materialização em disco e blindagem contra Path Traversal."""
    modified_files = []
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-zA-Z]*\n(.*?)```"
    protected_paths = [".git", ".venv", "task_executor.py", "do.ps1", "_env.ps1", ".env"]

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
            is_protected = any(os.path.normpath(p) in target_path_str for p in protected_paths)
            if is_protected:
                if autonomy_mode == "full":
                    logger.warning(f"[GOD MODE W3] Override de Seguranca ativado. Re-escrevendo arquivo vital: {filepath}")
                else:
                    logger.error(f"[SEC] Bloqueio de escrita em arquivo protegido: {filepath}")
                    continue

            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            logger.info(f"[MATERIALIZACAO] Arquivo forjado: {filepath}")
            modified_files.append(target_path.name)
        except Exception as e:
            logger.error(f"[FAIL] Falha ao forjar {filepath}: {e}")

    return modified_files

async def _execute_commands(text: str, autonomy_mode: str) -> None:
    """Isola a orquestração segura de sub-processos do terminal."""
    # [SEC] Defesa em Profundidade: Bloqueio estrito na camada de execucao
    if autonomy_mode in ["stop", "default"]:
        logger.warning(f"[SEC] Execucao de terminal bloqueada por hardware-lock no modo '{autonomy_mode}'.")
        return

    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```(?:[a-zA-Z]*)\n(.*?)\n```|`([^`]+)`)"

    # [SEC] Bloqueios absolutos em nível de OS (Inegociáveis)
    forbidden_tokens = ["rm -rf /", "del /s c:\\", "diskpart", "format ", "mkfs", "vssadmin"]

    # [SEC] Comandos de mutação de estado (Bloqueados apenas no modo partial)
    state_changing_commands = [
        "npm install", "npm i", "pip install", "git reset", "git push", "git clone", "yarn add", "pnpm add"
    ]

    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        cmd = cmd.strip()

        # [GOD MODE W3] Liberação de Encadeamento de Comandos.
        # Nos modos inferiores, encadear operações é bloqueado para evitar efeitos colaterais imprevistos.
        if autonomy_mode != "full" and any(char in cmd for char in [';', '|', '&&']):
            error_msg = f"Encadeamento de comandos bloqueado no modo '{autonomy_mode}'. Eleve para 'full' ou forje um script."
            logger.error(f"[SEC] {error_msg}")
            raise PermissionError(error_msg)

        # [SEC] Impede comandos destrutivos (todos os modos)
        if any(f in cmd.lower() for f in forbidden_tokens):
            error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
            logger.error(f"[SEC] {error_msg}")
            raise PermissionError(error_msg)

        # [GOD MODE W2 - PARTIAL] Permite leitura e execução segura, mas bloqueia mutação de ecossistema
        if autonomy_mode == "partial" and any(k in cmd.lower() for k in state_changing_commands):
            logger.info(f"[GOD MODE PARTIAL] Comando de impacto interceptado para validacao humana: '{cmd}'")
            logger.warning(f"[GOD MODE PARTIAL] Execute manualmente: '{cmd}'")
            continue

        try:
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
        except Exception as e:
            logger.error(f"[FAIL] Arritmia no comando {cmd}: {e}")
            raise


async def apply_god_mode(text: str, manager: QueueManager) -> List[str]:
    """
    Orquestrador VITOI 3.2 de Autonomia (Córtex de Execução).
    Lê a mente do agente, forja arquivos fisicos e executa comandos através de Middlewares.
    """
    autonomy_mode = await get_autonomy_mode(manager)

    if autonomy_mode == "stop":
        logger.warning("[GOD MODE] W0 (Stop) ativo. Observação pura. Nenhuma mutação permitida.")
        return []

    modified_files = await _forge_files(text, autonomy_mode)

    if autonomy_mode == "default":
        logger.info("[GOD MODE] W1 (Default) ativo. Homeostase. Arquivos forjados, execução de comandos bloqueada.")
        return modified_files

    await _execute_commands(text, autonomy_mode)
    return modified_files
