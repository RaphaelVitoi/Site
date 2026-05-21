import ast
import os
import logging
import sys

# Integração com o Log Central do Dashboard Noir
logging.basicConfig(
    filename='.vitoi_history.log',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def calcular_metrics(node):
    """Calcula Complexidade Ciclomática e Densidade de Documentação."""
    vg = 1
    doc_lines = 0
    functions = 0
    for n in ast.walk(node):
        # Cálculo de V(G): Pontos de decisão
        if isinstance(n, (ast.If, ast.While, ast.For, ast.AsyncFor, ast.And, ast.Or, ast.ExceptHandler)):
            vg += 1
        # Contagem de Funções e Docstrings
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1
            doc = ast.get_docstring(n)
            if doc:
                doc_lines += len(doc.split('\n'))
    return vg, doc_lines, functions

def auditoria_total(diretorio):
    """Realiza a varredura e calcula o Índice de Saúde de Invariância (Ih)."""
    print(f"[VITOI] Iniciando Auditoria de Invariância no diretório: {diretorio}")
    total_vg = 0
    total_docs = 0
    total_funcs = 0
    total_loc = 0
    arquivos_analisados = 0

    for root, _, files in os.walk(diretorio):
        # Isolamento de Domínio: Ignora diretórios de dependências e metadados
        if any(d in root for d in ['.venv', '.git', '__pycache__', 'node_modules']):
            continue

        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    # 'utf-8-sig' neutraliza o caractere U+FEFF (BOM)
                    with open(path, "r", encoding="utf-8-sig") as f:
                        content = f.read()
                        if not content.strip():
                            continue

                        total_loc += len(content.split('\n'))
                        tree = ast.parse(content)
                        vg, docs, funcs = calcular_metrics(tree)

                        total_vg += vg
                        total_docs += docs
                        total_funcs += funcs
                        arquivos_analisados += 1

                except SyntaxError as e:
                    logging.error(f"Erro de Sintaxe em {path}: {e}")
                    print(f" [!] Pulando {file}: Erro de sintaxe (possível corrupção).")
                except Exception as e:
                    logging.error(f"Falha ao ler {path}: {e}")
                    continue

    # Cálculo do Índice de Saúde (Ih)
    # Ih = 100 - (Média VG * 5) + (Densidade Doc * 20)
    if total_funcs > 0 and total_loc > 0:
        ih = 100 - ((total_vg / total_funcs) * 5) + ((total_docs / total_loc) * 20)
        ih = max(0, min(100, ih))
    else:
        ih = 100

    status = "SOTA" if ih > 85 else "ESTÁVEL" if ih > 70 else "DÍVIDA TÉCNICA ALTA"
    msg = f"Auditoria Concluída: Ih={ih:.2f} | Status: {status} | Analisados: {arquivos_analisados} arquivos."

    print(f"[VITOI] {msg}")
    logging.info(msg)

if __name__ == "__main__":
    caminho = sys.argv[1] if len(sys.argv) > 1 else "."
    auditoria_total(caminho)
