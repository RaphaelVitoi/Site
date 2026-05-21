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

def apply_god_mode(text: str):
    autonomy_mode = get_autonomy_mode()
    pattern = r"(?:Arquivo|File|Caminho|Path):\s*`?([^\n`]+)`?\s*\n+```[a-zA-Z]*\n(.*?)```"
    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        filepath = match.group(1).strip()
        content = match.group(2)
        try:
            base_path = Path(__file__).parent.parent.resolve()
            target_path = Path(filepath).resolve()
            base_path_str = os.path.normcase(str(base_path))
            target_path_str = os.path.normcase(str(target_path))
            
            if not target_path_str.startswith(base_path_str + os.sep) and target_path_str != base_path_str:
                logging.error(f"[SEC] Bloqueio de escrita fora da raiz: {filepath}")
                continue
                
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            logging.info(f"[MATERIALIZACAO] Arquivo forjado com sucesso: {filepath}")
        except Exception as e:
            logging.error(f"[FAIL] Falha de permissao ao forjar {filepath}: {e}")
            
    cmd_pattern = r"(?:Comando|Command|Executar|Execute):\s*(?:```(?:[a-zA-Z]*)\n(.*?)\n```|`([^`]+)`)"
    forbidden_commands = ["rm -rf", "del /s", "diskpart", "format ", "mkfs", "rmdir /s /q c:\\"]
    state_changing_commands = ["npm install", "npm i", "pip install", "git reset", "git push", "git clone", "del ", "rm ", "yarn add", "pnpm add", "git clean"]
    
    for match in re.finditer(cmd_pattern, text, re.DOTALL | re.IGNORECASE):
        cmd = match.group(1) if match.group(1) else match.group(2)
        cmd = cmd.strip()
        
        if any(f in cmd.lower() for f in forbidden_commands):
            error_msg = f"Comando destrutivo bloqueado por regras de seguranca: {cmd}"
            logging.error(f"[SEC] {error_msg}")
            raise PermissionError(error_msg)
            
        if autonomy_mode == "partial" and any(k in cmd.lower() for k in state_changing_commands):
            logging.info(f"[AUTONOMIA PARCIAL] Comando interceptado: '{cmd}'")
            logging.warning(f"[GOD MODE] Seguranca ativa. Execute '{cmd}' manualmente.")
            continue
            
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