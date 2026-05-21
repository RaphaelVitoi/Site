import os
import json
import re
from pathlib import Path

def optimize_vscode_settings():
    # Colorimetria SOTA (ASCII/ANSI)
    C = '\033[96m' # Cyan
    G = '\033[92m' # Green
    Y = '\033[93m' # Yellow
    R = '\033[91m' # Red
    W = '\033[0m'  # Reset

    # Caminho padrao do settings.json global
    config_path = Path.home() / "AppData/Roaming/Code/User/settings.json"
    if not config_path.exists():
        # Fallback para Linux/MacOS
        config_path = Path.home() / ".config/Code/User/settings.json"

    if not config_path.exists():
        print(f"{R}[ERRO CRITICO] O núcleo de settings.json nao foi encontrado em {config_path.parent}.{W}")
        return

    print(f"{C}=== [VITOI 3.2] OTIMIZACAO GLOBAL DE IDE ==={W}")
    print(f"{C}Infiltrando em: {config_path}{W}")

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Parser JSONC SOTA (Lexer Regex): Preserva strings ("..."), oblitera comentarios (// e /* */) fora delas
            content = re.sub(r'("(?:\\"|[^"])*")|//.*|/\*.*?\*/', lambda m: m.group(1) if m.group(1) else '', content, flags=re.S)
            # Preserva strings ("..."), oblitera virgulas pendentes (trailing commas) fora delas
            content = re.sub(r'("(?:\\"|[^"])*")|,\s*(?=[\]}])', lambda m: m.group(1) if m.group(1) else '', content)
            
            settings = json.loads(content, strict=False) if content.strip() else {}
    except Exception as e:
        print(f"{R}[ERRO] Falha ao destrinchar o cortex do VS Code: {e}{W}")
        return

    # Configuracoes de Supressao de Latencia (Merge Simetrico, sem destruir o existente)
    if "files.watcherExclude" not in settings:
        settings["files.watcherExclude"] = {}
        
    settings["files.watcherExclude"].update({
        "**/.git/objects/**": True,
        "**/node_modules/**": True,
        "**/dist/**": True,
        "**/.next/**": True,
        "**/.continue/**": True,
        "**/build/**": True
    })
    
    settings["editor.bracketPairColorization.enabled"] = True
    settings["editor.guides.bracketPairs"] = "active"
    settings["git.autorefresh"] = False # Obliterando consumo excessivo de I/O do Git
    
    settings["continue.embeddingsProvider"] = None # Desativa indexador local da IA (Friccao Zero)

    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=4)
        print(f"{G}[+] Simetria Alcancada: Protocolo de Baixa Latencia injetado no settings.json.{W}")
    except Exception as e:
        print(f"{R}[ERRO] Falha de permissao na gravacao: {e}{W}")

if __name__ == "__main__":
    optimize_vscode_settings()