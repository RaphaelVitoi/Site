import ast
import logging
import os
import sys

# Integração com o Log Central do Dashboard Noir
logging.basicConfig(
    filename=".vitoi_history.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


def _is_decision_node(node: ast.AST) -> bool:
    """
    Verifica se o nó AST representa um ponto de decisão lógica.
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
    Calcula Complexidade Ciclomática e Densidade de Documentação em um AST.
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
    Verifica se o diretório faz parte das pastas de dependências ignoradas.
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
    Abre o arquivo, gera sua Árvore Sintática e computa suas métricas de invariância.
    Retorna uma tupla na forma (vg, docs, funcs, loc).
    """
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()

        if not content.strip():
            return 0, 0, 0, 0

        loc = len(content.split("\n"))
        tree = ast.parse(content)
        vg, docs, funcs = calcular_metrics(tree)
        return vg, docs, funcs, loc

    except SyntaxError as e:
        logger.error(f"Erro de Sintaxe em {path}: {e}")
        print(
            f" [!] Pulando {os.path.basename(path)}: Erro de sintaxe (possível corrupção)."
        )
        return 0, 0, 0, 0
    except Exception as e:  # noqa: BLE001
        logger.error(f"Falha ao ler {path}: {e}")
        return 0, 0, 0, 0


def calcular_indice_saude(
    total_vg: int, total_funcs: int, total_docs: int, total_loc: int
) -> float:
    """
    Calcula o Índice de Saúde de Invariância (Ih) baseado na fórmula matemática.
    """
    if total_funcs <= 0 or total_loc <= 0:
        return 100.0

    ih = 100 - ((total_vg / total_funcs) * 5) + ((total_docs / total_loc) * 20)
    return float(max(0, min(100, ih)))


def auditoria_total(diretorio: str) -> None:
    """
    Realiza a varredura de arquivos e calcula o Índice de Saúde (Ih) global.
    """
    print(f"[VITOI] Iniciando Auditoria de Invariância no diretório: {diretorio}")

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
        status = "ESTÁVEL"
    else:
        status = "DÍVIDA TÉCNICA ALTA"
    msg = f"Auditoria Concluída: Ih={ih:.2f} | Status: {status} | Analisados: {arquivos_analisados} arquivos."

    print(f"[VITOI] {msg}")
    logger.info(msg)


if __name__ == "__main__":
    caminho = sys.argv[1] if len(sys.argv) > 1 else "."
    auditoria_total(caminho)
