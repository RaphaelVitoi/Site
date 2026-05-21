import unittest
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Adiciona o diretorio raiz ao path para importar o task_executor
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from task_executor import QueueManager, Task

class TestQueueManager(unittest.TestCase):
    def setUp(self):
        # Instancia o banco SQLite em memoria para que o I/O seja zero e nulo
        self.manager = QueueManager(queue_path=":memory:")

    def tearDown(self):
        self.manager.close()

    def test_add_and_get_task(self):
        task = Task(
            id="task-123",
            description="Teste de Insercao na Fila",
            agent="@planner",
            timestamp="2026-03-17T12:00:00"
        )
        self.manager.add_task(task)
        
        retrieved = self.manager.get_task("task-123")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.id, "task-123")
        self.assertEqual(retrieved.status, "pending")
        self.assertEqual(retrieved.agent, "@planner")

    def test_get_next_task_priority(self):
        # Insere tarefas com diferencas de prioridade temporal e semantica
        task_low = Task(id="t-low", description="low", agent="@planner", timestamp="2026-03-17T12:00:02", metadata={"priority": "low"})
        task_normal = Task(id="t-norm", description="normal", agent="@planner", timestamp="2026-03-17T12:00:03")
        task_high = Task(id="t-high", description="high", agent="@planner", timestamp="2026-03-17T12:00:04", metadata={"priority": "high"})
        
        self.manager.add_task(task_low)
        self.manager.add_task(task_normal)
        self.manager.add_task(task_high)
        
        # O gerenciador deve respeitar a prioridade 'high' acima do timestamp 'mais antigo'
        next_task = self.manager.get_next_task()
        self.assertEqual(next_task.id, "t-high")
        
        self.manager.update_task_status("t-high", "running")
        
        next_task = self.manager.get_next_task()
        self.assertEqual(next_task.id, "t-norm")

    def test_llm_cache(self):
        self.manager.update_llm_cache("model-x", "prompt-y", "response-z")
        cached = self.manager.get_llm_cache("model-x", "prompt-y")
        self.assertEqual(cached, "response-z")
        self.assertIsNone(self.manager.get_llm_cache("model-x", "prompt-missing"))

    def test_cleanup_archives_old_tasks(self):
        # Cria tarefas com diferentes datas e status
        old_date = (datetime.now() - timedelta(days=40)).isoformat()
        recent_date = datetime.now().isoformat()

        t_old_done = Task(id="old-done", description="Antiga e concluida", agent="@planner", timestamp=old_date, status="completed")
        t_old_pending = Task(id="old-pending", description="Antiga mas pendente", agent="@planner", timestamp=old_date, status="pending")
        t_recent_done = Task(id="recent-done", description="Recente e concluida", agent="@planner", timestamp=recent_date, status="completed")

        self.manager.add_task(t_old_done)
        self.manager.add_task(t_old_pending)
        self.manager.add_task(t_recent_done)

        # Executa a limpeza para arquivar tarefas concluidas com mais de 30 dias
        self.manager.cleanup(days=30)

        # A tarefa antiga e concluida deve ter sido removida da fila principal (movida pro archive)
        self.assertIsNone(self.manager.get_task("old-done"))
        # As outras devem permanecer intactas na fila principal
        self.assertIsNotNone(self.manager.get_task("old-pending"))
        self.assertIsNotNone(self.manager.get_task("recent-done"))

if __name__ == '__main__':
    unittest.main()