"""
Testes unitarios para a malha de subagentes SOTA v8.0 GOLD (core/subagents_mesh.py).
"""

from __future__ import annotations

import pytest

from core.schemas import Task
from core.subagents_mesh import (
    SUBAGENT_MODEL_MAP,
    SubagentMeshController,
    SubagentMissionRequest,
    SubagentMissionResult,
    SubagentTier,
    subagents_mesh,
)


@pytest.mark.asyncio
async def test_subagents_mesh_routing_heuristics():
    controller = SubagentMeshController()

    task_sec = Task(
        id="T_SEC",
        description="Audit for CWE-22 and token leak",
        agent="@securitychief",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_sec) == SubagentTier.APPSEC

    task_math = Task(
        id="T_MATH",
        description="Calculate PMev and Nash equilibrium",
        agent="@validador",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_math) == SubagentTier.MATH

    task_poetics = Task(
        id="T_POET",
        description="Compor ensaio e reflexao sobre poesia e filosofia da mente",
        agent="@curator",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_poetics) == SubagentTier.POETICS

    task_wasm = Task(
        id="T_WASM",
        description="Optimize WASM zero-copy memory buffer",
        agent="@implementor",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_wasm) == SubagentTier.WASM

    task_ui = Task(
        id="T_UI",
        description="Refine HSL CSS layout and component design",
        agent="@curator",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_ui) == SubagentTier.UI

    task_rsrch = Task(
        id="T_RSRCH",
        description="Investigate deep research docs and state of the art",
        agent="@pesquisador",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_rsrch) == SubagentTier.RESEARCH

    task_fim = Task(
        id="T_FIM",
        description="Autocomplete inline de codigo via fim e streaming",
        agent="@implementor",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_fim) == SubagentTier.STREAMING_FIM

    task_a11y = Task(
        id="T_A11Y",
        description="Auditoria de acessibilidade flutter wcag e semantics",
        agent="@auditor",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_a11y) == SubagentTier.FLUTTER_A11Y

    task_gen = Task(
        id="T_GEN", description="General system maintenance routine", agent="@chico", timestamp="2026-08-18T13:50:00Z"
    )
    assert controller.route_task_to_subagent(task_gen) == SubagentTier.SELF


@pytest.mark.asyncio
async def test_subagents_mesh_execution_pipeline():
    controller = SubagentMeshController()
    req = SubagentMissionRequest(
        mission_id="M_APPSEC_01",
        tier=SubagentTier.APPSEC,
        prompt="Audit core/config.py for path traversal",
        target_files=["core/config.py"],
    )

    res = await controller.execute_subagent_pipeline(req)

    assert isinstance(res, SubagentMissionResult)
    assert res.status == "SUCCESS"
    assert res.tier == SubagentTier.APPSEC
    assert res.mission_id == "M_APPSEC_01"
    assert "core/config.py" in res.files_modified
    assert res.execution_time_ms > 0
    assert "M_APPSEC_01" in controller.completed_missions
    assert "M_APPSEC_01" not in controller.active_missions


@pytest.mark.asyncio
async def test_subagents_mesh_singleton_import():
    assert subagents_mesh is not None
    assert isinstance(subagents_mesh, SubagentMeshController)


def test_subagents_mesh_tier_integrity():
    """Valida que todos os 16 niveis de SubagentTier possuem modelo local mapeado
    e estao devidamente configurados no SUBAGENT_MODEL_MAP."""
    assert len(SubagentTier) == 16
    for tier in SubagentTier:
        assert tier in SUBAGENT_MODEL_MAP
        assert isinstance(SUBAGENT_MODEL_MAP[tier], str)
        assert len(SUBAGENT_MODEL_MAP[tier]) > 0


def test_resolve_subagent_tier():
    from core.subagents_mesh import resolve_subagent_tier

    assert resolve_subagent_tier(SubagentTier.APPSEC) == SubagentTier.APPSEC
    assert resolve_subagent_tier("appsec_gatekeeper") == SubagentTier.APPSEC
    assert resolve_subagent_tier("APPSEC") == SubagentTier.APPSEC
    assert resolve_subagent_tier("math") == SubagentTier.MATH
    assert resolve_subagent_tier("MATH") == SubagentTier.MATH
    assert resolve_subagent_tier("invalid_tier") is None
    assert resolve_subagent_tier(None) is None
    assert resolve_subagent_tier("") is None


def test_gemma4_protocols_and_formatting():
    from core.subagents_mesh import (
        format_gemma4_system_prompt,
        format_gemma4_thought_block,
        parse_gemma4_channel_output,
        sanitize_gemma4_multiturn_history,
        validate_visual_token_budget,
    )

    # 1. format_gemma4_system_prompt
    base_prompt = "You are an expert system."
    formatted_thinking = format_gemma4_system_prompt(base_prompt, enable_thinking=True)
    assert formatted_thinking.startswith("<|think|>")
    assert "You are an expert system." in formatted_thinking

    formatted_plain = format_gemma4_system_prompt(formatted_thinking, enable_thinking=False)
    assert not formatted_plain.startswith("<|think|>")
    assert formatted_plain == base_prompt

    # 2. format_gemma4_thought_block & parse_gemma4_channel_output
    thought = "Calculating optimal subgame strategy..."
    answer = "Action: Call 2.5bb."
    raw_output = format_gemma4_thought_block(thought, answer)

    parsed_thought, parsed_answer = parse_gemma4_channel_output(raw_output)
    assert parsed_thought == thought
    assert parsed_answer == answer

    # 3. parse_gemma4_channel_output without channels
    plain_thought, plain_answer = parse_gemma4_channel_output("Direct answer with no thought tags.")
    assert plain_thought is None
    assert plain_answer == "Direct answer with no thought tags."

    # 4. sanitize_gemma4_multiturn_history
    history = [
        {"role": "user", "content": "What is the Nash range?"},
        {
            "role": "assistant",
            "content": "<|channel>thought\nStep 1: checking range<channel|>The range is 14.2%.",
        },
        {"role": "user", "content": "And on the turn?"},
    ]
    sanitized = sanitize_gemma4_multiturn_history(history)
    assert len(sanitized) == 3
    assert sanitized[1]["content"] == "The range is 14.2%."
    assert "<|channel>" not in sanitized[1]["content"]

    # 5. validate_visual_token_budget
    assert validate_visual_token_budget(70) == 70
    assert validate_visual_token_budget(280) == 280
    assert validate_visual_token_budget(1120) == 1120
    # Clamping / Nearest neighbor for non-standard budgets
    assert validate_visual_token_budget(100) == 70 or validate_visual_token_budget(100) == 140
    assert validate_visual_token_budget(2000) == 1120


def test_subagents_prefer_fast_small_local_and_only_free_cloud_fallbacks():
    """Garante modelos locais leves/especialistas no primario e fallback cloud estritamente :free."""
    import json
    from pathlib import Path

    from core.subagents_mesh import FREE_CLOUD_FALLBACK_MAP
    from llm import routing_policy as rp

    manifest_path = Path(__file__).resolve().parents[1] / "data" / "ollama_models.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    size_by_tag = {m["tag"]: float(m["size_gb"]) for m in manifest.get("models", [])}

    for tier, model in SUBAGENT_MODEL_MAP.items():
        assert rp.e_local(model), f"{tier} -> {model} deve pertencer a frota local"
        assert rp.custo(model, 10_000, 2_000) == 0.0
        if model in size_by_tag:
            assert size_by_tag[model] <= 7.2, (
                f"{tier} -> {model} ({size_by_tag[model]} GB) pesado demais para subagente"
            )

    for tier in SubagentTier:
        candidates = FREE_CLOUD_FALLBACK_MAP[tier]
        assert len(candidates) >= 1
        assert all(":free" in m.lower() for m in candidates)


@pytest.mark.asyncio
async def test_subagent_falls_back_to_free_cloud_when_local_daemons_fail(monkeypatch):
    """Quando Ollama e llama.cpp locais falham, aciona modelo :free via OpenRouter Tier 4."""
    from unittest.mock import AsyncMock, patch

    from core.subagents_mesh import FREE_CLOUD_FALLBACK_MAP

    monkeypatch.setenv("CHICO_SUBAGENT_ALLOW_TEST_CLOUD", "1")
    called_models: list[str] = []

    async def fake_call_openrouter(**kwargs):
        called_models.append(kwargs["model"])
        return "Resultado ok via :free", {"prompt_tokens": 12, "completion_tokens": 7}

    with (
        patch.object(SubagentMeshController, "_call_llama_cpp_inference", new=AsyncMock(return_value=(None, {}))),
        patch(
            "llm.openrouter_pool.openrouter_pool_manager.get_key_for_tier",
            new=AsyncMock(return_value=("sk-or-test", 4)),
        ),
        patch("llm.openrouter_pool.openrouter_pool_manager.mark_success", new=AsyncMock()),
        patch("llm.openrouter.call_openrouter", new=fake_call_openrouter),
    ):
        content, meta = await SubagentMeshController._fallback_to_llama_cpp(
            assigned_model=SUBAGENT_MODEL_MAP[SubagentTier.IMPLEMENTOR],
            system_instruction="sys",
            prompt="hello",
            timeout_seconds=10,
            fallback_reason="connection refused",
            tier=SubagentTier.IMPLEMENTOR,
        )

    assert content == "Resultado ok via :free"
    assert meta["inference_mode"] == "real_openrouter_free"
    assert meta["cloud_free_model"] == FREE_CLOUD_FALLBACK_MAP[SubagentTier.IMPLEMENTOR][0]
    assert called_models == [FREE_CLOUD_FALLBACK_MAP[SubagentTier.IMPLEMENTOR][0]]
    assert all(":free" in m for m in called_models)
