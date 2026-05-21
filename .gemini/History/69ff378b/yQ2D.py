import os
from pathlib import Path

def search_mastersimulator(root_dir: str):
    search_term = "mastersimulator"
    root = Path(root_dir)
    print(f"=== Buscando por '{search_term}' em {root.absolute()} ===")
    
    for path in root.rglob("*"):
        # Busca no nome do arquivo
        if search_term.lower() in path.name.lower():
            print(f"[ARQUIVO ENCONTRADO]: {path}")
        
        # Busca no conteúdo (apenas arquivos de texto comuns)
        if path.is_file() and path.suffix in ['.py', '.ts', '.tsx', '.md', '.json', '.ps1']:
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    if search_term.lower() in f.read().lower():
                        print(f"[CONTEÚDO ENCONTRADO]: {path}")
            except Exception:
                pass

if __name__ == "__main__":
    search_mastersimulator(".")
