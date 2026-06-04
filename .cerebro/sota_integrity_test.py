"""Módulo de testes de integridade da infraestrutura SOTA (Zero-Regression)."""

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
        assert retrieved is not None, "Falha de I/O no SQLite: Tarefa retornou None."
        assert retrieved.id == "TEST-SOTA-001", (
            "Falha de I/O no SQLite: ID incompativel."
        )
        await manager.delete_task("TEST-SOTA-001")
        return f"[PASS] SQLite Physical I/O (Read/Write/Delete): {time.time() - start:.4f}s"
    except Exception as e:  # pylint: disable=broad-exception-caught
        return f"[FAIL] SQLite falhou: {e}"


def _test_rag_initialization() -> str:
    """Executa o teste de instanciacao vetorial SOTA (ChromaDB)."""
    start = time.time()
    try:
        rag = MemoryRAG(memory_dir=".cerebro/agent-memory")
        expected_name = "agent_collective_memory"
        assert rag.collection.name == expected_name, (
            f"Colecao com nome incorreto. Esperado '{expected_name}', "
            f"obteve '{rag.collection.name}'"
        )
        return f"[PASS] RAG Initialization SOTA: {time.time() - start:.4f}s"
    except Exception as e:  # pylint: disable=broad-exception-caught
        return f"[FAIL] RAG Initialization falhou: {e}"


def _test_garbage_collection() -> str:
    """Executa o teste de Garbage Collection para manutencao de RAM."""
    start = time.time()
    try:
        collected = gc.collect()
        return (
            f"[PASS] Garbage Collector Acionado: {time.time() - start:.4f}s | "
            f"Objetos varridos: {collected}"
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        return f"[FAIL] GC falhou: {e}"


async def _test_metrics_extraction() -> str:
    """Executa o teste de extracao de metricas (MDA)."""
    start = time.time()
    try:
        manager = QueueManager()
        stats = await manager.get_performance_history()
        return (
            f"[PASS] Extracao de Metricas MDA (Performance): {time.time() - start:.4f}s | "
            f"Dias registrados: {len(stats)}"
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        return f"[FAIL] Falha ao extrair metricas de performance: {e}"


def _save_report(report: List[str]) -> None:
    """Salva o relatorio bruto em arquivo de log SOTA."""
    report_path = Path(".cerebro/logs/audit/latest_sota_test.log")
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
    ]

    print("\n".join(report))
    _save_report(report)


if __name__ == "__main__":
    asyncio.run(run_sota_tests())
