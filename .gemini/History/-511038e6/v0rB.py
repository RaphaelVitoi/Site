import unittest
import sys
import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

# Acopla a raiz do projeto para o import do Kernel
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from task_executor import _intelligent_route_task, DynamicYieldManager

class TestOrchestratorHomeostasis(unittest.TestCase):
    def test_semantic_routing_frontend(self):
        """Audita a aderência do roteamento para termos de frontend com Sentinela Estético."""
        desc = "Refatorar o componente de interface React usando Tailwind CSS e ajustar a UI."
        agent, metadata = _intelligent_route_task(desc, "@implementor")

        self.assertEqual(agent, "@implementor")
        self.assertIn("@curator", metadata.get("observers", []), "Falha: O @curator não foi atrelado como Sentinela Estético.")

    def test_semantic_routing_epic_interception(self):
        """Garante que épicos massivos sejam interceptados e fatiados (Anti-Alucinação)."""
        desc = "Precisamos refatorar o sistema inteiro, alterando a arquitetura global e reescrevendo o módulo completo."
        agent, metadata = _intelligent_route_task(desc, "@implementor")

        self.assertEqual(agent, "@dispatcher")
        self.assertIn("@maverick", metadata.get("observers", []), "Falha: O @maverick não foi designado como observador na interceptação.")

    def test_dynamic_yield_backoff(self):
        """Valida a termodinâmica exponencial do Dynamic Yield Manager contra starvation."""
        manager = DynamicYieldManager()

        # Mocks estruturais para o gerenciador de filas
        task = MagicMock()
        task.id = "TASK-TEST-123"
        task.agent = "@implementor"
        q_manager = AsyncMock()

        # Teste de progressão exponencial (2^n limitando em 300.0s)
        yield_1 = asyncio.run(manager.apply_yield(task, q_manager))
        self.assertEqual(yield_1, 2.0)

        yield_2 = asyncio.run(manager.apply_yield(task, q_manager))
        self.assertEqual(yield_2, 4.0)

        yield_3 = asyncio.run(manager.apply_yield(task, q_manager))
        self.assertEqual(yield_3, 8.0)

if __name__ == '__main__':
    unittest.main()
