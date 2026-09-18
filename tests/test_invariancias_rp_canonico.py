"""Invariâncias Canônicas do Risk Premium (I1 a I7) no motor Python.

Trava matematicamente:
- I3: Redução em all-in even money (a = 0.5) para (BF - 1) / (BF + 1).
- I4: Teorema 2 (BF < 1 <=> RP < 0).
- I6: Monotonicidade estrita em BF para qualquer pot odds a > 0.
- I7: Fonte única de cálculo em engine/.
"""

from __future__ import annotations

import ast
from pathlib import Path

import pytest

from engine.vitoi_perspective_engine import premio_de_risco_canonico


def test_i3_reducao_exata_em_a_meio() -> None:
    bfs = [0.2, 0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 5.0, 10.0]
    for bf in bfs:
        canonico = premio_de_risco_canonico(bf, 0.5)
        esperado = ((bf - 1.0) / (bf + 1.0)) * 100.0
        assert canonico == pytest.approx(esperado, abs=1e-10)


@pytest.mark.parametrize("a", [0.1, 0.25, 0.3333, 0.5, 0.67, 0.9])
def test_i4_teorema_2_sinal_preservado(a: float) -> None:
    assert premio_de_risco_canonico(0.8, a) < 0.0
    assert premio_de_risco_canonico(1.0, a) == pytest.approx(0.0, abs=1e-12)
    assert premio_de_risco_canonico(1.4, a) > 0.0


@pytest.mark.parametrize("a", [0.2, 0.3333, 0.5, 0.7])
def test_i6_monotonicidade_estrita(a: float) -> None:
    bfs = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 5.0]
    for i in range(len(bfs) - 1):
        rp_atual = premio_de_risco_canonico(bfs[i], a)
        rp_prox = premio_de_risco_canonico(bfs[i + 1], a)
        assert rp_prox > rp_atual


def test_i7_fonte_unica_sem_literais_dispersos() -> None:
    engine_dir = Path("engine")

    class DivChecker(ast.NodeVisitor):
        def __init__(self, filename: str) -> None:
            self.filename = filename
            self.violations: list[str] = []

        def visit_BinOp(self, node: ast.BinOp) -> None:
            # Detecta padrão (bf - 1) / bf em AST
            if (
                isinstance(node.op, ast.Div)
                and isinstance(node.right, ast.Name)
                and node.right.id.lower() == "bf"
                and isinstance(node.left, ast.BinOp)
                and isinstance(node.left.op, ast.Sub)
                and isinstance(node.left.left, ast.Name)
                and node.left.left.id.lower() == "bf"
            ):
                self.violations.append(f"{self.filename}:{node.lineno}: (bf - 1) / bf")
            self.generic_visit(node)

    for py_file in engine_dir.glob("*.py"):
        tree = ast.parse(py_file.read_text(encoding="utf-8"), filename=str(py_file))
        checker = DivChecker(str(py_file))
        checker.visit(tree)
        assert not checker.violations, f"Violações encontradas: {checker.violations}"
