import ast
import os
import logging
import sys

# Integração com o Log Central do Dashboard
logging.basicConfig(
    filename='.vitoi_history.log',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)

def calcular_metrics(node):
    vg = 1
    doc_lines = 0
    functions = 0
    for n in ast.walk(node):
        if isinstance(n, (ast.If, ast.While, ast.For, ast.And, ast.Or, ast.ExceptHandler)):
            vg += 1
        if isinstance(n, ast.FunctionDef):
            functions += 1
            doc = ast.get_docstring(n)
            if doc:
                doc_lines += len(doc.split('\n'))
    return vg, doc_lines, functions

def auditoria_total(diretorio):
    print(f"[VITOI] Iniciando Auditoria de Invariância no diretório: {diretorio}")
    total_vg = 0
    total_docs = 0
    total_funcs = 0
    total_loc = 0
    arquivos_analisados = 0

    for root, _, files in os.walk(diretorio):
        # Respeita o isolamento de domínio (ignora venv e git)
        if '.venv' in root or '.git' in root:
            continue

        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    total_loc += len(content.split('\n'))
                    tree = ast.parse(content)
                    vg, docs, funcs = calcular_metrics(tree)
                    total_vg += vg
                    total_docs += docs
                    total_funcs += funcs
                    arquivos_analisados += 1

    # Cálculo do Índice de Saúde (Ih)
    if total_funcs > 0 and total_loc > 0:
        ih = 100 - ((total_vg / total_funcs) * 5) + ((total_docs / total_loc) * 20)
        ih = max(0, min(100, ih))
    else:
        ih = 100

    status = "SOTA" if ih > 85 else "ESTÁVEL" if ih > 70 else "DÍVIDA TÉCNICA ALTA"

    msg = f"Auditoria Concluída: Ih={ih:.2f} | Status: {status} | Analisados: {arquivos_analisados} arquivos."
    print(f"[VITOI] {msg}")
    logging.info(msg)

    if ih < 70:
        logging.warning(f"Alerta de Entropia: Recomenda-se fatiamento em {diretorio}")

if __name__ == "__main__":
    caminho = sys.argv[1] if len(sys.argv) > 1 else "."
    auditoria_total(caminho)
