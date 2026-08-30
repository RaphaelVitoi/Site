"""
Testes de integracao e conformidade com o Protocolo Gemma 4 (Google DeepMind).
Valida Thinking Mode (<|think|>), canais de pensamento, orcamento de tokens visuais
e invariantes de custo zero na malha de subagentes SOTA v8.0 GOLD.
"""

from __future__ import annotations

import pytest

from core.subagents_mesh import (
    GEMMA4_THINK_TOKEN,
    GEMMA4_THOUGHT_CHANNEL_END,
    GEMMA4_THOUGHT_CHANNEL_START,
    GEMMA4_VALID_VISUAL_BUDGETS,
    SUBAGENT_MODEL_MAP,
    SubagentTier,
    format_gemma4_system_prompt,
    format_gemma4_thought_block,
    parse_gemma4_channel_output,
    sanitize_gemma4_multiturn_history,
    validate_visual_token_budget,
)
from llm import routing_policy as rp


def test_format_gemma4_system_prompt_enables_thinking():
    raw_prompt = "Voce e um assistente especialista em Teoria dos Jogos PMev."
    formatted = format_gemma4_system_prompt(raw_prompt, enable_thinking=True)
    assert formatted.startswith(GEMMA4_THINK_TOKEN)
    assert raw_prompt in formatted

    # Idempotencia: chamar novamente nao duplica o token
    reformatted = format_gemma4_system_prompt(formatted, enable_thinking=True)
    assert reformatted == formatted
    assert reformatted.count(GEMMA4_THINK_TOKEN) == 1


def test_format_gemma4_system_prompt_disables_thinking():
    prompt_with_think = f"{GEMMA4_THINK_TOKEN}\nVoce e um assistente para execucao rapida."
    formatted = format_gemma4_system_prompt(prompt_with_think, enable_thinking=False)
    assert not formatted.startswith(GEMMA4_THINK_TOKEN)
    assert "Voce e um assistente para execucao rapida." in formatted


def test_format_gemma4_thought_block():
    thought = "Calculando equidade com 10.000 iteracoes."
    answer = "Acao recomendada: Call."
    block = format_gemma4_thought_block(thought, answer)
    assert block.startswith(GEMMA4_THOUGHT_CHANNEL_START)
    assert GEMMA4_THOUGHT_CHANNEL_END in block
    parsed_thought, parsed_answer = parse_gemma4_channel_output(block)
    assert parsed_thought == thought
    assert parsed_answer == answer


def test_parse_gemma4_channel_output_with_thoughts():
    raw_response = (
        "<|channel>thought\n"
        "1. Analisar equidade no river.\n"
        "2. Aplicar Teorema de Vitoi para risco assimétrico.\n"
        "<channel|>"
        "A decisao otima e Shove com +2.4bb de EV."
    )
    thought, answer = parse_gemma4_channel_output(raw_response)
    assert thought is not None
    assert "Analisar equidade no river" in thought
    assert "Aplicar Teorema de Vitoi" in thought
    assert answer == "A decisao otima e Shove com +2.4bb de EV."


def test_parse_gemma4_channel_output_empty_thought():
    raw_response = "<|channel>thought\n<channel|>Resposta direta sem raciocinio intermediario."
    thought, answer = parse_gemma4_channel_output(raw_response)
    assert thought is None
    assert answer == "Resposta direta sem raciocinio intermediario."


def test_parse_gemma4_channel_output_without_channel():
    raw_response = "Resposta em formato padrao legada."
    thought, answer = parse_gemma4_channel_output(raw_response)
    assert thought is None
    assert answer == "Resposta em formato padrao legada."


def test_sanitize_gemma4_multiturn_history():
    history = [
        {"role": "system", "content": "Prompt do sistema"},
        {"role": "user", "content": "Pergunta 1"},
        {
            "role": "assistant",
            "content": "<|channel>thought\nPensamento secreto turn 1<channel|>Resposta 1",
        },
        {"role": "user", "content": "Pergunta 2"},
        {
            "role": "assistant",
            "content": "<|channel>thought\nPensamento secreto turn 2<channel|>Resposta 2",
        },
    ]

    sanitized = sanitize_gemma4_multiturn_history(history)
    assert len(sanitized) == len(history)
    assert sanitized[0]["content"] == "Prompt do sistema"
    assert sanitized[1]["content"] == "Pergunta 1"
    assert sanitized[2]["content"] == "Resposta 1"
    assert "<|channel>" not in sanitized[2]["content"]
    assert sanitized[3]["content"] == "Pergunta 2"
    assert sanitized[4]["content"] == "Resposta 2"
    assert "<|channel>" not in sanitized[4]["content"]


def test_validate_visual_token_budget():
    for budget in (70, 140, 280, 560, 1120):
        assert validate_visual_token_budget(budget) == budget

    # Valores fora da grade convergem para o mais proximo
    assert validate_visual_token_budget(50) == 70
    assert validate_visual_token_budget(100) == 70 or validate_visual_token_budget(100) == 140
    assert validate_visual_token_budget(200) == 140 or validate_visual_token_budget(200) == 280
    assert validate_visual_token_budget(1000) == 1120
    assert validate_visual_token_budget(2000) == 1120


def test_gemma4_mesh_subagents_cost_zero_invariant():
    """Garante que todos os subagentes mapeados para Gemma 4 mantem custo marginal zero."""
    gemma_subagents = {
        tier: model for tier, model in SUBAGENT_MODEL_MAP.items() if "gemma" in model.lower()
    }
    assert SubagentTier.GENERALIST in gemma_subagents
    assert SubagentTier.RESEARCH in gemma_subagents
    assert SubagentTier.ARCHITECT in gemma_subagents

    for tier, model in gemma_subagents.items():
        assert rp.e_local(model), f"Modelo '{model}' do subagente '{tier}' deve ser local ou cloud com custo zero."
        assert rp.custo(model, 10_000, 2_000) == 0.0
