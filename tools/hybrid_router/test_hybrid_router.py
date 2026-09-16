#!/usr/bin/env python3
"""SUITE DE TESTES UNITARIOS PARA O HYBRID ROUTER SOTA."""

from __future__ import annotations

import unittest

import httpx
from pydantic import JsonValue

from tools.hybrid_router.app import (
    ComplexityAnalyzer,
    ExecutionTarget,
    GenerateRequest,
    LocalLlamaVulkanClient,
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
        schema: dict[str, JsonValue] = {"type": "object", "properties": {"name": {"type": "string"}}}
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


class TestSondaDoLlamaLocal(unittest.IsolatedAsyncioTestCase):
    """A sonda do llama.cpp custava ~520 ms por requisicao com o local fora do ar (medido em 2026-09-16)."""

    async def test_resultado_da_sonda_e_reusado_dentro_do_ttl(self) -> None:
        cliente = LocalLlamaVulkanClient(endpoint_url="http://127.0.0.1:9/v1", probe_ttl_s=60.0)
        chamadas = 0

        class _ClienteFalso:
            async def get(self, *_a, **_k):
                nonlocal chamadas
                chamadas += 1
                raise httpx.ConnectError("recusado")

        cliente._client = _ClienteFalso()  # type: ignore[assignment]  # pylint: disable=protected-access
        for _ in range(5):
            assert await cliente.is_available() is False
        assert chamadas == 1

        cliente.invalidate_probe()
        assert await cliente.is_available() is False
        assert chamadas == 2

    async def test_ttl_zero_desliga_o_cache(self) -> None:
        cliente = LocalLlamaVulkanClient(endpoint_url="http://127.0.0.1:9/v1", probe_ttl_s=0.0)
        chamadas = 0

        class _ClienteFalso:
            async def get(self, *_a, **_k):
                nonlocal chamadas
                chamadas += 1
                raise httpx.ConnectError("recusado")

        cliente._client = _ClienteFalso()  # type: ignore[assignment]  # pylint: disable=protected-access
        for _ in range(3):
            await cliente.is_available()
        assert chamadas == 3


if __name__ == "__main__":
    unittest.main()
