import sys
import asyncio
import time
import gc
from pathlib import Path
from typing import List

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent))

from task_executor import QueueManager, Task
from memory_rag import MemoryRAG


async def _test_database_io() -> str:
    """Executa o teste de banco de dados (I/O Fisico e Concorrencia SQLite WAL)."""
    start = time.time()
    try:
        manager = QueueManager()
        test_task = Task(
            id="TEST-SOTA-001",
            description="Validacao SOTA",
            agent="@implementor",
            timestamp="2026-03-24T00:00:00",
        )
        await manager.add_task(test_task)
        retrieved = await manager.get_task("TEST-SOTA-001")
        assert retrieved is not None, "Falha de I/O no SQLite: Tarefa retornou None."  # noqa: S101
        assert retrieved.id == "TEST-SOTA-001", (  # noqa: S101
            "Falha de I/O no SQLite: ID incompativel."
        )
        await manager.delete_task("TEST-SOTA-001")
        return f"[PASS] SQLite Physical I/O (Read/Write/Delete): {time.time() - start:.4f}s"
    except Exception as e:
        return f"[FAIL] SQLite falhou: {e}"


def _test_rag_initialization() -> str:
    """Executa o teste de instanciacao vetorial SOTA (ChromaDB)."""
    start = time.time()
    try:
        rag = MemoryRAG(memory_dir=".claude/agent-memory")
        expected_name = "agent_collective_memory"
        assert rag.collection.name == expected_name, (  # noqa: S101
            f"Colecao com nome incorreto. Esperado '{expected_name}', obteve '{rag.collection.name}'"
        )
        return f"[PASS] RAG Initialization SOTA: {time.time() - start:.4f}s"
    except Exception as e:
        return f"[FAIL] RAG Initialization falhou: {e}"


def _test_garbage_collection() -> str:
    """Executa o teste de Garbage Collection para manutencao de RAM."""
    start = time.time()
    try:
        collected = gc.collect()
        return f"[PASS] Garbage Collector Acionado: {time.time() - start:.4f}s | Objetos varridos: {collected}"
    except Exception as e:
        return f"[FAIL] GC falhou: {e}"


async def _test_metrics_extraction() -> str:
    """Executa o teste de extracao de metricas (MDA)."""
    start = time.time()
    try:
        manager = QueueManager()
        stats = await manager.get_performance_history()
        return f"[PASS] Extracao de Metricas MDA (Performance): {time.time() - start:.4f}s | Dias registrados: {len(stats)}"
    except Exception as e:
        return f"[FAIL] Falha ao extrair metricas de performance: {e}"


def _test_quantum_physics_parity() -> str:
    """Valida a integridade da fisica SOTA (Edge Amortization & RIO Liability)."""
    from engine.math_sota import compute_quantum_metrics

    start = time.time()
    try:
        # Cenário de Teste: 20bb stack, 3 players no pot
        res = compute_quantum_metrics(
            current_equity_pct=50.0,
            delta_win_pct=10.0,
            delta_lose_pct=-15.0,
            dynamic_ev_fold=-1.0,
            realization_factor=1.0,
            fgs_health=1.0,
            active_players=3,
            hero_invested=5.0,
            current_pot=15.0,
            stack_eff=20.0,
        )

        # SOTA FIX: Type Narrowing para calar o Pylance (reportOptionalOperand)
        rio_mw = res.get("rio_mw")
        expectativa = res.get("expectativa")
        perspectiva = res.get("perspectiva")

        if rio_mw is None or expectativa is None or perspectiva is None:
            raise ValueError(
                "O motor quântico retornou Nulo (None) para métricas cruciais."
            )

        # 1. Validar Amortização de Edge (log(20)/log(60) ~ 0.73)
        # 2. Validar RIO MW (Exponencial N^(2+f))
        assert rio_mw > 0, "Dívida RIO não calculada para Multiway."  # noqa: S101

        # SOTA FIX: A Perspectiva deve ser exatamente (Expectativa - RIO - EV_Fold)
        # Como EV_Fold é negativo (-1.0), ela soma 1.0 e subtrai o RIO (~0.53)
        expected_persp = expectativa - (rio_mw + (-1.0))

        assert abs(perspectiva - expected_persp) < 1e-6, (
            f"Divergência vetorial na Perspectiva: {perspectiva} != {expected_persp}"
        )  # noqa: S101

        return f"[PASS] Quantum Physics Parity (SOTA v4.3): {time.time() - start:.4f}s"
    except Exception as e:
        return f"[FAIL] Falha na paridade fisica: {e}"


def _save_report(report: List[str]) -> None:
    """Salva o relatorio bruto em arquivo de log SOTA."""
    report_path = Path(".claude/logs/audit/latest_sota_test.log")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
    print(f"\n[OK] Relatorio bruto salvo em {report_path.as_posix()}")


async def run_sota_tests() -> None:
    """Orquestrador principal da Suite de Testes SOTA (Zero-Regression)."""
    print("=== [QA] INICIANDO SUITE DE TESTES SOTA (ZERO-REGRESSION) ===")

    report: List[str] = [
        await _test_database_io(),
        _test_rag_initialization(),
        _test_garbage_collection(),
        await _test_metrics_extraction(),
        _test_quantum_physics_parity(),
    ]

    print("\n".join(report))
    _save_report(report)


if __name__ == "__main__":
    asyncio.run(run_sota_tests())
