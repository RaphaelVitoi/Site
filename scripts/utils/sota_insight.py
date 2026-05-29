"""
IDENTITY: SOTA Context Scanner (Skill de Leitura Recursiva)
ROLE: Ferramenta de linha de comando para agentes lerem arquivos em 'chunks' (fatias),
      extraindo a ontologia (IDENTITY/ROLE) e mapeando o efeito cascata (BINDINGS).
PRINCIPLE: Antevisao Semantica e Friccao Zero.
"""

import argparse
import re
from pathlib import Path


def scan_file(filepath: str, chunk: int = 1, size: int = 50):
    path = Path(filepath)
    if not path.exists():
        print(f"[ERRO] Arquivo nao encontrado: {filepath}")
        return

    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    total_lines = len(lines)
    start = (chunk - 1) * size
    end = start + size
    target_lines = lines[start:end]

    print(f"=== [SOTA INSIGHT] Lendo {path.name} (Linhas {start + 1} a {min(end, total_lines)} de {total_lines}) ===")

    if chunk == 1:
        header = "".join(target_lines)
        identity = re.search(r"IDENTITY:\s*(.+)", header, re.IGNORECASE)
        role = re.search(r"ROLE:\s*(.+)", header, re.IGNORECASE)
        binding = re.search(r"BINDING:\s*(.+)", header, re.IGNORECASE)

        print("\n[ONTOLOGIA DO COMPONENTE]")
        print(f"IDENTITY : {identity.group(1).strip() if identity else 'Desconhecida'}")
        print(f"ROLE     : {role.group(1).strip() if role else 'Desconhecido'}")
        print(f"BINDING  : {binding.group(1).strip() if binding else 'Desconhecido'}")

    print("\n[CONTEUDO BRUTO - CHUNK]")
    for i, line in enumerate(target_lines, start=start + 1):
        print(f"{i:04d} | {line.rstrip()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Skill de leitura recursiva de contexto para Agentes VITOI.")
    parser.add_argument("filepath", help="Caminho absoluto ou relativo do arquivo.")
    parser.add_argument("--chunk", type=int, default=1, help="Fatia de leitura (default: 1).")
    parser.add_argument("--size", type=int, default=50, help="Tamanho da fatia em linhas (default: 50).")
    args = parser.parse_args()
    scan_file(args.filepath, args.chunk, args.size)
