#!/usr/bin/env python3
"""SUITE DE TESTES UNITARIOS PARA O HYBRID ROUTER SOTA."""

from __future__ import annotations

from pathlib import Path
import sys
import unittest

_REPO_ROOT = str(Path(__file__).resolve().parents[2])
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

# pylint: disable=wrong-import-position
from tools.hybrid_router.app import (  # noqa: E402
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
        prompt = "Resuma as diferencas entre compilacao JIT e AOT em tres topicos."
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt)
        assert metrics.selected_target == ExecutionTarget.LOCAL_LLAMA_VULKAN
        assert metrics.thinking_budget is None

    def test_high_density_game_theory_routes_to_thinking(self) -> None:
        prompt = (
            "Dado um jogo matricial 2x2 com payoffs $U_1(A,A)=3$, $U_1(A,B)=0$, $U_1(B,A)=5$, "
            "$U_1(B,B)=1$, derive o equilibrio de Nash misto, o valor esperado e a variancia sob restricao de ICM e PMev."
        )
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt)
        assert metrics.selected_target == ExecutionTarget.GEMINI_37_FLASH_THINKING
        assert metrics.thinking_budget is not None
        assert (metrics.thinking_budget or 0) > 0

    def test_tools_provided_routes_to_cloud_standard(self) -> None:
        prompt = "Consulte o status do repositorio git e execute os testes."
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt, tools_provided=True)
        assert metrics.selected_target == ExecutionTarget.GEMINI_37_FLASH_STANDARD
        assert metrics.requires_tools is True

    def test_strict_json_schema_routes_to_cloud_standard(self) -> None:
        prompt = "Extraia os dados cadastrais do cliente."
        schema = {"type": "object", "properties": {"name": {"type": "string"}}}
        metrics: RouteMetrics = self.analyzer.compute_metrics(prompt, response_schema=schema)
        assert metrics.selected_target == ExecutionTarget.GEMINI_37_FLASH_STANDARD
        assert metrics.requires_strict_json is True

    def test_force_target_override(self) -> None:
        prompt = "Mensagem simples."
        metrics: RouteMetrics = self.analyzer.compute_metrics(
            prompt,
            force_target=ExecutionTarget.GEMINI_37_FLASH_THINKING,
            thinking_override=8192,
        )
        assert metrics.selected_target == ExecutionTarget.GEMINI_37_FLASH_THINKING
        assert metrics.thinking_budget == 8192

    def test_pydantic_generate_request_validation(self) -> None:
        req = GenerateRequest(
            prompt="Teste de prompt estruturado",
            system_instruction="Sistema",
            thinking_budget_override=2048,
        )
        assert req.prompt == "Teste de prompt estruturado"
        assert req.thinking_budget_override == 2048


if __name__ == "__main__":
    unittest.main()
