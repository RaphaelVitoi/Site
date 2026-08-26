#!/usr/bin/env python3
"""SUITE DE TESTES UNITÁRIOS PARA O HYBRID ROUTER SOTA."""

from __future__ import annotations

import unittest
from app import (
    ComplexityAnalyzer,
    ExecutionTarget,
    GenerateRequest,
    RouteMetrics,
)


class TestComplexityAnalyzer(unittest.TestCase):
    def setUp(self) -> None:
        self.analyzer = ComplexityAnalyzer(
            local_max_tokens=2048,
            complexity_threshold=0.45,
        )

    def test_low_density_prompt_routes_to_local(self) -> None:
        prompt = "Resuma as diferenças entre compilação JIT e AOT em três tópicos."
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt)
        self.assertEqual(metrics.selected_target, ExecutionTarget.LOCAL_LLAMA_VULKAN)
        self.assertIsNone(metrics.thinking_budget)

    def test_high_density_game_theory_routes_to_thinking(self) -> None:
        prompt = (
            "Dado um jogo matricial 2x2 com payoffs $U_1(A,A)=3$, $U_1(A,B)=0$, $U_1(B,A)=5$, "
            "$U_1(B,B)=1$, derive o equilíbrio de Nash misto, o valor esperado e a variância sob restrição de ICM e PMev."
        )
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt)
        self.assertEqual(metrics.selected_target, ExecutionTarget.GEMINI_37_FLASH_THINKING)
        self.assertIsNotNone(metrics.thinking_budget)
        self.assertGreater(metrics.thinking_budget or 0, 0)

    def test_tools_provided_routes_to_cloud_standard(self) -> None:
        prompt = "Consulte o status do repositório git e execute os testes."
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt, tools_provided=True)
        self.assertEqual(metrics.selected_target, ExecutionTarget.GEMINI_37_FLASH_STANDARD)
        self.assertTrue(metrics.requires_tools)

    def test_strict_json_schema_routes_to_cloud_standard(self) -> None:
        prompt = "Extraia os dados cadastrais do cliente."
        schema = {"type": "object", "properties": {"name": {"type": "string"}}}
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt, response_schema=schema)
        self.assertEqual(metrics.selected_target, ExecutionTarget.GEMINI_37_FLASH_STANDARD)
        self.assertTrue(metrics.requires_strict_json)

    def test_force_target_override(self) -> None:
        prompt = "Mensagem simples."
        metrics: RouteMetrics = self.analyzer.compute_metrics(
            prompt,
            force_target=ExecutionTarget.GEMINI_37_FLASH_THINKING,
            thinking_override=8192,
        )
        self.assertEqual(metrics.selected_target, ExecutionTarget.GEMINI_37_FLASH_THINKING)
        self.assertEqual(metrics.thinking_budget, 8192)

    def test_pydantic_generate_request_validation(self) -> None:
        req = GenerateRequest(
            prompt="Teste de prompt estruturado",
            system_instruction="Sistema",
            thinking_budget_override=2048,
        )
        self.assertEqual(req.prompt, "Teste de prompt estruturado")
        self.assertEqual(req.thinking_budget_override, 2048)


if __name__ == "__main__":
    unittest.main()
