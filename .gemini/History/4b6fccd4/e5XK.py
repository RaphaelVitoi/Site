# pylint: disable=missing-module-docstring, redefined-outer-name, broad-exception-caught

import ast
import os
import sys
from typing import Any

from rich.console import Console
from rich.table import Table

console = Console()


def _is_ignored_dir(root: str) -> bool:
    """Verifica se o diretório faz parte de dependências ou backups."""
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
    """Percorre a árvore AST e calcula a complexidade, docstrings e funções."""
    vg = 1
    doc_lines = 0
    functions = 0
    for n in ast.walk(tree):
        if isinstance(
            n, (ast.If, ast.While, ast.For, ast.And, ast.Or, ast.ExceptHandler)
        ):
            vg += 1
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1
            doc = ast.get_docstring(n)
            if doc:
                doc_lines += len(doc.split("\n"))
    return vg, doc_lines, functions


def _calculate_file_ih(
    vg: int, doc_lines: int, functions: int, loc: int
) -> tuple[float, float]:
    """Realiza a matemática de Índice de Saúde do arquivo (Ih)."""
    if functions > 0:
        ih = 100 - ((vg / functions) * 5) + ((doc_lines / loc) * 20)
        avg_vg = vg / functions
        return float(max(0, min(100, ih))), float(avg_vg)
    return 100.0, 1.0


def calcular_metrics_file(path: str) -> dict[str, Any] | None:
    """Lê o arquivo de forma segura e orquestra a extração de métricas SOTA."""
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()

        if not content.strip():
            return None

        loc = len(content.split("\n"))
        tree = ast.parse(content)

        vg, doc_lines, functions = _count_ast_nodes(tree)
        ih, avg_vg = _calculate_file_ih(vg, doc_lines, functions, loc)

        return {"file": os.path.relpath(path), "ih": ih, "avg_vg": avg_vg, "loc": loc}
    except Exception:  # noqa: BLE001
        return None


def _scan_directory(diretorio: str) -> list[dict[str, Any]]:
    """Varre o diretório iterativamente e coleta os outliers."""
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
    """Função principal que compõe o Dashboard de Entropia no terminal."""
    console.print(
        f"[bold white]VITOI 3.2 | MAPA DE CALOR DE ENTROPIA: {diretorio}[/]\n"
    )

    results = _scan_directory(diretorio)
    # Ordenação: Menor Ih (Pior Saúde) para o Maior
    top_10 = sorted(results, key=lambda x: x["ih"])[:10]

    table = Table(
        title="TOP 10 OUTLIERS (MAIOR DÍVIDA TÉCNICA)",
        border_style="bright_black",
        header_style="bold white",
    )
    table.add_column("Rank", justify="center", style="dim")
    table.add_column("Arquivo", style="italic white")
    table.add_column("Ih (Saúde)", justify="right")
    table.add_column("Média V(G)", justify="right")
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
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    gerar_heatmap(path)
