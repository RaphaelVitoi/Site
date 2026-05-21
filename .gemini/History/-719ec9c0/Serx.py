import subprocess
import json
import sys

def vitoi_extension_purge():
    # Colorimetria SOTA (ASCII/ANSI)
    C = '\033[96m' # Cyan (Infraestrutura)
    G = '\033[92m' # Green (Simetria)
    Y = '\033[93m' # Yellow (Alerta/Decisao)
    R = '\033[91m' # Red (Entropia)
    W = '\033[0m'  # Reset

    # Lista de extensoes que devem permanecer (Core Stack)
    KEEP_LIST = [
        "continue.continue",
        "usernamehw.errorlens",
        "eamodio.gitlens",
        "aaron-bond.better-comments"
    ]
    
    # Categorias de redundancia (IA Assistants)
    REDUNDANT_KEYWORDS = ["copilot", "codeium", "blackbox", "genie", "tabnine", "cursor"]

    print(f"{C}=== [VITOI 3.2] AUDITORIA DE EXTENSOES SOTA ==={W}")
    print(f"{C}Iniciando varredura no Extension Host...{W}")
    
    # Obtem a lista de extensoes instaladas
    try:
        result = subprocess.run(['code', '--list-extensions'], capture_output=True, text=True, check=True)
        installed = result.stdout.splitlines()
    except Exception as e:
        print(f"{R}[ERRO CRITICO] Falha ao comunicar com a CLI do VS Code: {e}{W}")
        sys.exit(1)

    to_remove = []
    for ext in installed:
        ext_lower = ext.lower()
        if any(key in ext_lower for key in REDUNDANT_KEYWORDS) and ext not in KEEP_LIST:
            to_remove.append(ext)

    if not to_remove:
        print(f"{G}[+] Simetria Alcancada: Nenhuma redundancia detectada no Extension Host.{W}")
        return

    print(f"{Y}[!] Detectadas {len(to_remove)} extensoes redundantes gerando latencia de I/O e bloat cognitivo:{W}")
    
    for ext in to_remove:
        confirm = input(f"\n{Y}Deseja obliterar a extensao '{ext}'? (s/n): {W}")
        if confirm.lower() == 's':
            print(f"{C}Desinstalando {ext}...{W}")
            subprocess.run(['code', '--uninstall-extension', ext])
            print(f"{G}[-] {ext} vaporizada com sucesso.{W}")
        else:
            print(f"{C}[~] Ignorado.{W}")

if __name__ == "__main__":
    vitoi_extension_purge()