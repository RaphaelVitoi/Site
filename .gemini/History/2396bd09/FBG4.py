import sys
import os
import asyncio
import time
from pathlib import Path

# Adiciona a raiz ao path para importar modulos do Kernel
sys.path.append(str(Path(__file__).parent.parent.parent))

from task_executor import QueueManager, Task, APIKeysExhaustedError
from memory_rag import MemoryRAG

async def run_sota_tests():
    print("=== [QA] INICIANDO SUITE DE TESTES SOTA (ZERO-REGRESSION) ===")
    report = []
    
    # 1. Teste de Banco de Dados (Bloqueio / SQLite WAL)
    start = time.time()
    try:
        manager = QueueManager(":memory:")
        test_task = Task(id="TEST-001", description="Validacao SOTA", agent="@implementor", timestamp="2026-03-24T00:00:00")
        await manager.add_task(test_task)
        retrieved = await manager.get_task("TEST-001")
        assert retrieved.id == "TEST-001", "Falha de I/O no SQLite"
        report.append(f"[PASS] SQLite Memory I/O: {time.time()-start:.4f}s")
    except Exception as e:
        report.append(f"[FAIL] SQLite falhou: {e}")
        
    # 2. Teste de Instanciacao Vetorial SOTA (ChromaDB)
    start = time.time()
    try:
        rag = MemoryRAG(memory_dir=".claude/agent-memory")
        assert rag.collection.name == "omnimaster_symbiotic_memory", "Colecao vetorial com nome incorreto"
        report.append(f"[PASS] RAG Initialization SOTA: {time.time()-start:.4f}s")
    except Exception as e:
        report.append(f"[FAIL] RAG Initialization falhou: {e}")
        
    # 3. Teste de Garbage Collection (RAM)
    start = time.time()
    try:
        import gc
        gc.collect()
        report.append(f"[PASS] Garbage Collector Acionado: {time.time()-start:.4f}s")
    except Exception as e:
        report.append(f"[FAIL] GC falhou: {e}")
        
    print("\n".join(report))
    
    # Salva relatorio bruto para o @verifier ler
    report_path = Path(".claude/logs/audit/latest_sota_test.log")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"\n[OK] Relatorio bruto salvo em {report_path}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_sota_tests())