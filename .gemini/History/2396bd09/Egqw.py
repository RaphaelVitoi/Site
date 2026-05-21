import sys
import os
import asyncio
import time
import gc
from pathlib import Path

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent))

from task_executor import QueueManager, Task
from memory_rag import MemoryRAG

async def run_sota_tests():
    print("=== [QA] INICIANDO SUITE DE TESTES SOTA (ZERO-REGRESSION) ===")
    report = []

    # 1. Teste de Banco de Dados (I/O Fisico e Concorrencia SQLite WAL)
    start = time.time()
    try:
        manager = QueueManager()
        test_task = Task(
            id="TEST-SOTA-001",
            description="Validacao SOTA",
            agent="@implementor",
            timestamp="2026-03-24T00:00:00"
        )
        await manager.add_task(test_task)
        retrieved = await manager.get_task("TEST-SOTA-001")
        assert retrieved is not None, "Falha de I/O no SQLite: Tarefa retornou None."
        assert retrieved.id == "TEST-SOTA-001", "Falha de I/O no SQLite: ID incompativel."
        await manager.delete_task("TEST-SOTA-001")
        report.append(f"[PASS] SQLite Physical I/O (Read/Write/Delete): {time.time()-start:.4f}s")
    except Exception as e:
        report.append(f"[FAIL] SQLite falhou: {e}")

    # 2. Teste de Instanciacao Vetorial SOTA (ChromaDB)
    start = time.time()
    try:
        rag = MemoryRAG(memory_dir=".claude/agent-memory")
        expected_name = "agent_collective_memory"
        assert rag.collection.name == expected_name, f"Colecao com nome incorreto. Esperado '{expected_name}', obteve '{rag.collection.name}'"
        report.append(f"[PASS] RAG Initialization SOTA: {time.time()-start:.4f}s")
    except Exception as e:
        report.append(f"[FAIL] RAG Initialization falhou: {e}")

    # 3. Teste de Garbage Collection (RAM)
    start = time.time()
    try:
        collected = gc.collect()
        report.append(f"[PASS] Garbage Collector Acionado: {time.time()-start:.4f}s | Objetos varridos: {collected}")
    except Exception as e:
        report.append(f"[FAIL] GC falhou: {e}")

    # 4. Teste de Extracao de Metricas (MDA)
    start = time.time()
    try:
        manager = QueueManager()
        stats = await manager.get_performance_history()
        report.append(f"[PASS] Extracao de Metricas MDA (Performance): {time.time()-start:.4f}s | Dias registrados: {len(stats)}")
    except Exception as e:
        report.append(f"[FAIL] Falha ao extrair metricas de performance: {e}")

    # Log no terminal
    print("\n".join(report))

    # Salva relatorio bruto em Pure ASCII para o @verifier ler
    report_path = Path(".claude/logs/audit/latest_sota_test.log")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))

    print(f"\n[OK] Relatorio bruto salvo em {report_path.as_posix()}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_sota_tests())
