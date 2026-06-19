import ast
import logging
import os
import sys

# Integracao com o Log Central do Dashboard Noir
logging.basicConfig(
    filename=".vitoi_history.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


def _is_decision_node(node: ast.AST) -> bool:
    """
    Verifica se o no AST representa um ponto de decisao logica.
    """
    decision_types = (
        ast.If,
        ast.While,
        ast.For,
        ast.AsyncFor,
        ast.And,
        ast.Or,
        ast.ExceptHandler,
    )
    return isinstance(node, decision_types)


def calcular_metrics(node: ast.AST) -> tuple[int, int, int]:
    """
    Calcula Complexidade Ciclomatica e Densidade de Documentacao em um AST.
    """
    vg = 1
    doc_lines = 0
    functions = 0
    for n in ast.walk(node):
        if _is_decision_node(n):
            vg += 1

        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1
            doc = ast.get_docstring(n)
            if doc:
                doc_lines += len(doc.split("\n"))
    return vg, doc_lines, functions


def _is_ignored_dir(root: str) -> bool:
    """
    Verifica se o diretorio faz parte das pastas de dependencias ignoradas.
    """
    ignore_list = [
        ".venv",
        ".git",
        "__pycache__",
        "node_modules",
        ".archive",
        ".backups",
    ]
    return any(d in root for d in ignore_list)


def _analisar_arquivo(path: str) -> tuple[int, int, int, int]:
    """
    Abre o arquivo, gera sua Arvore Sintatica e computa suas metricas de invariancia.
    Retorna uma tupla na forma (vg, docs, funcs, loc).
    """
    try:
        with open(path, encoding="utf-8-sig") as f:
            content = f.read()

        if not content.strip():
            return 0, 0, 0, 0

        loc = len(content.split("\n"))
        tree = ast.parse(content)
        vg, docs, funcs = calcular_metrics(tree)
        return vg, docs, funcs, loc

    except SyntaxError as e:
        logger.error(f"Erro de Sintaxe em {path}: {e}")
        print(f" [!] Pulando {os.path.basename(path)}: Erro de sintaxe (possivel corrupcao).")
        return 0, 0, 0, 0
    except Exception as e:  # noqa: BLE001
        logger.error(f"Falha ao ler {path}: {e}")
        return 0, 0, 0, 0


def calcular_indice_saude(total_vg: int, total_funcs: int, total_docs: int, total_loc: int) -> float:
    """
    Calcula o Indice de Saude de Invariancia (Ih) baseado na formula matematica.
    """
    if total_funcs <= 0 or total_loc <= 0:
        return 100.0

    ih = 100 - ((total_vg / total_funcs) * 5) + ((total_docs / total_loc) * 20)
    return float(max(0, min(100, ih)))


def auditoria_total(diretorio: str) -> None:
    """
    Realiza a varredura de arquivos e calcula o Indice de Saude (Ih) global.
    """
    print(f"[VITOI] Iniciando Auditoria de Invariancia no diretorio: {diretorio}")

    total_vg = 0
    total_docs = 0
    total_funcs = 0
    total_loc = 0
    arquivos_analisados = 0

    for root, _, files in os.walk(diretorio):
        if _is_ignored_dir(root):
            continue

        for file in files:
            if not file.endswith(".py"):
                continue

            path = os.path.join(root, file)
            vg, docs, funcs, loc = _analisar_arquivo(path)

            if loc > 0:
                total_vg += vg
                total_docs += docs
                total_funcs += funcs
                total_loc += loc
                arquivos_analisados += 1

    ih = calcular_indice_saude(total_vg, total_funcs, total_docs, total_loc)

    if ih > 85:
        status = "SOTA"
    elif ih > 70:
        status = "ESTAVEL"
    else:
        status = "DIVIDA TECNICA ALTA"
    msg = f"Auditoria Concluida: Ih={ih:.2f} | Status: {status} | Analisados: {arquivos_analisados} arquivos."

    print(f"[VITOI] {msg}")
    logger.info(msg)


if __name__ == "__main__":
    caminho = sys.argv[1] if len(sys.argv) > 1 else "."
    auditoria_total(caminho)
