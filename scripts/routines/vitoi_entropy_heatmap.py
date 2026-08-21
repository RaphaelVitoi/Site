import ast
import os
import sys
from typing import Any

from rich.console import Console
from rich.table import Table

console = Console()


def _is_ignored_dir(root: str) -> bool:
    """Verifica se o diretorio faz parte de dependencias ou backups."""
    ignore_list = [
        ".venv",
        ".git",
        "__pycache__",
        "node_modules",
        ".archive",
        ".backups",
    ]
    return any(d in root for d in ignore_list)


def _count_ast_nodes(tree: ast.AST) -> tuple[int, int, int]:
    """Percorre a arvore AST e calcula a complexidade, docstrings e funcoes."""
    vg = 1
    doc_lines = 0
    functions = 0
    for n in ast.walk(tree):
        if isinstance(n, (ast.If, ast.While, ast.For, ast.And, ast.Or, ast.ExceptHandler)):
            vg += 1
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1
            doc = ast.get_docstring(n)
            if doc:
                doc_lines += len(doc.split("\n"))
    return vg, doc_lines, functions


def _calculate_file_ih(vg: int, doc_lines: int, functions: int, loc: int) -> tuple[float, float]:
    """Realiza a matematica de Indice de Saude do arquivo (Ih)."""
    if functions > 0:
        ih = 100 - ((vg / functions) * 5) + ((doc_lines / loc) * 20)
        avg_vg = vg / functions
        return max(0.0, min(100.0, ih)), avg_vg
    return 100.0, 1.0


def calcular_metrics_file(file_path: str) -> dict[str, Any] | None:
    """Le o arquivo de forma segura e orquestra a extracao de metricas SOTA."""
    try:
        with open(file_path, encoding="utf-8-sig") as f:
            content = f.read()

        if not content.strip():
            return None

        loc = len(content.split("\n"))
        tree = ast.parse(content)

        vg, doc_lines, functions = _count_ast_nodes(tree)
        ih, avg_vg = _calculate_file_ih(vg, doc_lines, functions, loc)

        return {"file": os.path.relpath(file_path), "ih": ih, "avg_vg": avg_vg, "loc": loc}
    except Exception:  # noqa: BLE001
        return None


def _scan_directory(diretorio: str) -> list[dict[str, Any]]:
    """Varre o diretorio iterativamente e coleta os outliers."""
    results = []
    for root, _, files in os.walk(diretorio):
        if _is_ignored_dir(root):
            continue
        for file in files:
            if file.endswith(".py"):
                metrics = calcular_metrics_file(os.path.join(root, file))
                if metrics:
                    results.append(metrics)
    return results


def gerar_heatmap(diretorio: str) -> None:
    """Funcao principal que compoe o Dashboard de Entropia no terminal."""
    console.print(f"[bold white]VITOI 3.2 | MAPA DE CALOR DE ENTROPIA: {diretorio}[/]\n")

    results = _scan_directory(diretorio)
    # Ordenacao: Menor Ih (Pior Saude) para o Maior
    top_10 = sorted(results, key=lambda x: x["ih"])[:10]

    table = Table(
        title="TOP 10 OUTLIERS (MAIOR DIVIDA TECNICA)",
        border_style="bright_black",
        header_style="bold white",
    )
    table.add_column("Rank", justify="center", style="dim")
    table.add_column("Arquivo", style="italic white")
    table.add_column("Ih (Saude)", justify="right")
    table.add_column("Media V(G)", justify="right")
    table.add_column("LOC", justify="right")

    for i, res in enumerate(top_10, 1):
        if res["ih"] < 60:
            color = "bold white"
        elif res["ih"] < 75:
            color = "white"
        else:
            color = "dim white"
        table.add_row(
            str(i),
            res["file"],
            f"[{color}]{res['ih']:.2f}[/]",
            f"{res['avg_vg']:.2f}",
            str(res["loc"]),
        )

    console.print(table)


if __name__ == "__main__":
    target_path = sys.argv[1] if len(sys.argv) > 1 else "."
    gerar_heatmap(target_path)
