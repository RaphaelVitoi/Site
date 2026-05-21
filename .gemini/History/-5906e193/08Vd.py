import ast
import os
import sys
from rich.console import Console
from rich.table import Table

console = Console()

def calcular_metrics_file(path):
    """Extrai métricas granulares de um único arquivo."""
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()
            if not content.strip(): return None

            tree = ast.parse(content)
            vg = 1
            doc_lines = 0
            functions = 0
            loc = len(content.split('\n'))

            for n in ast.walk(tree):
                if isinstance(n, (ast.If, ast.While, ast.For, ast.And, ast.Or, ast.ExceptHandler)):
                    vg += 1
                if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    functions += 1
                    doc = ast.get_docstring(n)
                    if doc:
                        doc_lines += len(doc.split('\n'))

            # Cálculo de Ih específico do arquivo
            if functions > 0:
                ih = 100 - ((vg / functions) * 5) + ((doc_lines / loc) * 20)
                ih = max(0, min(100, ih))
                avg_vg = vg / functions
            else:
                ih = 100
                avg_vg = 1

            return {
                "file": os.path.basename(path),
                "ih": ih,
                "avg_vg": avg_vg,
                "loc": loc
            }
    except Exception:
        return None

def gerar_heatmap(diretorio):
    console.print(f"[bold white]VITOI 3.2 | MAPA DE CALOR DE ENTROPIA: {diretorio}[/]\n")
    results = []

    for root, _, files in os.walk(diretorio):
        if any(d in root for d in ['.venv', '.git', '__pycache__', 'node_modules']):
            continue
        for file in files:
            if file.endswith(".py"):
                metrics = calcular_metrics_file(os.path.join(root, file))
                if metrics:
                    results.append(metrics)

    # Ordenação: Menor Ih (Pior Saúde) para o Maior
    top_10 = sorted(results, key=lambda x: x['ih'])[:10]

    table = Table(title="TOP 10 OUTLIERS (MAIOR DÍVIDA TÉCNICA)", border_style="bright_black", header_style="bold white")
    table.add_column("Rank", justify="center", style="dim")
    table.add_column("Arquivo", style="italic white")
    table.add_column("Ih (Saúde)", justify="right")
    table.add_column("Média V(G)", justify="right")
    table.add_column("LOC", justify="right")

    for i, res in enumerate(top_10, 1):
        color = "bold white" if res['ih'] < 60 else "white" if res['ih'] < 75 else "dim white"
        table.add_row(
            str(i),
            res['file'],
            f"[{color}]{res['ih']:.2f}[/]",
            f"{res['avg_vg']:.2f}",
            str(res['loc'])
        )

    console.print(table)

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    gerar_heatmap(path)
