import os
import re
import json
import logging
import subprocess
from pathlib import Path

def get_autonomy_mode() -> str:
    config_path = Path(".claude/autonomy.json")
    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("mode", "off")
        except:
            pass
    return "off"

def _is_path_safe(base_path_str: str, target_path_str: str) -> bool:
    return target_path_str.startswith(base_path_str + os.sep) or target_path_str == base_path_str

def _write_file_safe(filepath: str, content: str) -> None:
    try:
        base_path = Path(__file__).parent.parent.resolve()
        target_path = Path(filepath).resolve()
        base_path_str = os.path.normcase(str(base_path))
        target_path_str = os.path.normcase(str(target_path))

        if not _is_path_safe(base_path_str, target_path_str):
            logging.error(f"[SEC] Bloqueio de escrita fora da raiz: {filepath}")
            return

        target_path.parent.mkdir(parents=True, exist_ok=True)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        logging.info(f"[MATERIALIZACAO] Arquivo forjado com sucesso: {filepath}")
    except Exception as e:
        logging.error(f"[FAIL] Falha de permissao ao forjar {filepath}: {e}")

def _process_file_creations(text: str) -> None:
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-zA-Z]*\n(.*?)```"
    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        filepath = match.group(1).strip()
        content = match.group(2)
        _write_file_safe(filepath, content)

def _execute_command_safe(cmd: str, autonomy_mode: str) -> None:
    cmd_lower = cmd.lower()
    forbidden_commands = ["rm -rf", "del /s", "diskpart", "format ", "mkfs", "rmdir /s /q c:\\"]
    state_changing_commands = ["npm install", "npm i", "pip install", "git reset", "git push", "git clone", "del ", "rm ", "yarn add", "pnpm add", "git clean"]

    if any(f in cmd_lower for f in forbidden_commands):
        error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
        logging.error(f"[SEC] {error_msg}")
        raise PermissionError(error_msg)

    if autonomy_mode == "partial" and any(k in cmd_lower for k in state_changing_commands):
        logging.info(f"[AUTONOMIA PARCIAL] Comando interceptado: '{cmd}'")
        logging.warning(f"[GOD MODE] Seguranca ativa. Execute '{cmd}' manualmente.")
        return

    try:
        logging.info(f"[EXECUCAO] Orquestrador rodando comando nativo: {cmd}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            logging.info(f"[OK] Comando executado de forma soberana: {cmd}")
        else:
            error_msg = f"Codigo {result.returncode} - {result.stderr.strip()}"
            logging.error(f"[FAIL] Falha no comando '{cmd}': {error_msg}")
            raise RuntimeError(f"O comando nativo falhou: {cmd}\nDetalhes: {error_msg}")
    except Exception as e:
        logging.error(f"[FAIL] Arritmia critica/Timeout no comando {cmd}: {e}")
        raise

def _process_command_executions(text: str, autonomy_mode: str) -> None:
    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```(?:[a-zA-Z]*)\n(.*?)\n```|`([^`]+)`)"
    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        if cmd:
            _execute_command_safe(cmd.strip(), autonomy_mode)

def apply_god_mode(text: str) -> None:
    """Orquestrador principal do God Mode (SOTA)."""
    autonomy_mode = get_autonomy_mode()
    _process_file_creations(text)
    _process_command_executions(text, autonomy_mode)
