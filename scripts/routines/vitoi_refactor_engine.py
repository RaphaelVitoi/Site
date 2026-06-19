import ast
import sys


def calcular_complexidade(node):
    """Calcula V(G) = E - N + 2P simplificado por nos de decisao."""
    v_g = 1  # Base
    for n in ast.walk(node):
        if isinstance(n, (ast.If, ast.While, ast.For, ast.And, ast.Or, ast.ExceptHandler)):
            v_g += 1
    return v_g


def analisar_arquivo(caminho):
    with open(caminho, encoding="utf-8") as f:
        code = f.read()

    tree = ast.parse(code)
    print(f"--- AUDITORIA VITOI v3.2: {caminho} ---")

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            complexity = calcular_complexidade(node)
            status = "SOTA" if complexity <= 5 else "ENTROPIA ALTA"
            print(f"Funcao: [{node.name}] | V(G): {complexity} | Status: {status}")

            if complexity > 5:
                print("  [!] Sugestao: Fatiar logica ou usar Dicionario de Despacho.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        analisar_arquivo(sys.argv[1])
    else:
        print("[ERRO] Nenhum arquivo fornecido para o Fatiamento.")
