import asyncio
import json
import sys
import re
from pathlib import Path
import aiosqlite

sys.path.append(str(Path(__file__).parent.parent.parent))
from database.queue_manager import QueueManager
from core.arbitrator import UniversalArbitrator, CyclicDependencyError

async def force_mitigation():
    manager = QueueManager()
    print("=== [ARBITRAGEM SOTA] AUDITORIA E MITIGACAO DA FILA ===")

    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = aiosqlite.Row

        # 1. Resgate de Zumbis (Crash Recovery Force)
        cursor = await db.execute("UPDATE tasks SET status = 'pending' WHERE status = 'running'")
        print(f"[1/3] Zumbis ('running' -> 'pending'): {cursor.rowcount} tarefas curadas.")
        await db.commit()

    # 2. Identificacao e Aniquilacao de Ciclos Topologicos
    pending_tasks = await manager.get_tasks(status='pending')
    cycles_cleared = 0

    while True:
        try:
            UniversalArbitrator.build_dependency_map(pending_tasks)
            break  # Sucesso, DAG viavel
        except CyclicDependencyError as e:
            match = re.search(r"tarefa (.+)", str(e))
            if match:
                bad_task_id = match.group(1).strip()
                async with aiosqlite.connect(manager.db_path) as db:
                    cursor = await db.execute("SELECT metadata FROM tasks WHERE id = ?", (bad_task_id,))
                    row = await cursor.fetchone()
                    if row:
                        meta = json.loads(row[0]) if row[0] else {}
                        meta["depends_on"] = []
                        await db.execute("UPDATE tasks SET metadata = ? WHERE id = ?", (json.dumps(meta), bad_task_id))
                        await db.commit()
                        print(f"[2/3] Ciclo quebrado: dependencias da tarefa {bad_task_id} foram expurgadas.")
                        cycles_cleared += 1
                pending_tasks = await manager.get_tasks(status='pending')
            else:
                print(f"[ERRO FATAL] Falha ao parear regex do ciclo: {e}")
                break

    if cycles_cleared == 0:
        print("[2/3] Fila Topologica integra. Nenhum ciclo detectado.")

    # 3. Remover alertas obsoletos do @chico
    async with aiosqlite.connect(manager.db_path) as db:
        cursor = await db.execute("DELETE FROM tasks WHERE agent = '@chico' AND (id LIKE 'DEADLOCK-%' OR id LIKE 'DEADLOCK-DAG-%') AND status = 'pending'")
        print(f"[3/3] Alertas obsoletos de Deadlock removidos: {cursor.rowcount}")
        await db.commit()

    print("=== [SUCESSO] Fila sanitizada e fluxo restaurado. ===")

if __name__ == "__main__":
    asyncio.run(force_mitigation())
