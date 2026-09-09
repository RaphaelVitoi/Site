"""Guarda do caminho HTTP Google Gemini ligado ao `llm/adapters.py`.

Verifica a conformidade dos modelos da família Gemini 3.x com as diretrizes
técnicas atualizadas em 2026-09-08:
  - Eliminação de amostragem tradicional (temperature, top_p, top_k) e rejeição de penalidades;
  - Rejeição de histórico de conversa com trailing role 'model';
  - Validação estrita de thinking_level por variante (minimal permitido apenas em 3.5 Flash-Lite);
  - Montagem cirúrgica de payloads REST v1beta sem parâmetros obsoletos;
  - Extração de texto resiliente contra blocos de pensamento (thought blocks).
"""

from __future__ import annotations

import pytest

from llm.adapters import GoogleGenAIAdapter, ParametroRejeitadoError
from llm.gemini import _build_gemini_payload, _normalize_gemini_model

USUARIO = [{"role": "user", "parts": [{"text": "ping"}]}]


# ==============================================================================
# 1. Reconhecimento de Geração e Normalização
# ==============================================================================


def test_reconhece_modelos_gemini_ativos() -> None:
    assert GoogleGenAIAdapter.e_geracao_atual("gemini-3.8-flash")
    assert GoogleGenAIAdapter.e_geracao_atual("gemini-3.7-flash")
    assert GoogleGenAIAdapter.e_geracao_atual("gemini-3.6-flash")
    assert GoogleGenAIAdapter.e_geracao_atual("gemini-3.5-flash-lite")


def test_modelo_estranho_nao_reconhecido_como_google() -> None:
    assert not GoogleGenAIAdapter.e_geracao_atual("claude-opus-5")
    assert not GoogleGenAIAdapter.e_geracao_atual("gpt-5.6-sol")
    assert not GoogleGenAIAdapter.e_geracao_atual("modelo-inexistente")


def test_normalize_gemini_model_preserva_38() -> None:
    assert _normalize_gemini_model("gemini-3.8-flash") == "gemini-3.8-flash"
    assert _normalize_gemini_model("GEMINI-3.8-FLASH") == "GEMINI-3.8-FLASH"


# ==============================================================================
# 2. Rejeição de Amostragem Legada e Penalidades (HTTP 400 Prevention)
# ==============================================================================


@pytest.mark.parametrize(
    "param",
    ["temperature", "top_p", "top_k", "presence_penalty", "frequency_penalty"],
)
def test_google_rejeita_amostragem_legada_em_build(param: str) -> None:
    with pytest.raises(ParametroRejeitadoError, match=param):
        GoogleGenAIAdapter.build("gemini-3.8-flash", USUARIO, **{param: 0.5})


# ==============================================================================
# 3. Validação de Histórico sem Trailing Role Model
# ==============================================================================


def test_historico_com_trailing_model_e_rejeitado() -> None:
    historico_invalido = [
        {"role": "user", "parts": [{"text": "pergunta"}]},
        {"role": "model", "parts": [{"text": "resposta"}]},
    ]
    with pytest.raises(ParametroRejeitadoError, match="role 'model'"):
        GoogleGenAIAdapter.validar_historico(historico_invalido)

    with pytest.raises(ParametroRejeitadoError, match="role 'model'"):
        GoogleGenAIAdapter.build("gemini-3.8-flash", historico_invalido)


def test_historico_com_trailing_model_output_e_rejeitado() -> None:
    historico_invalido = [
        {"role": "user", "parts": [{"text": "pergunta"}]},
        {"type": "model_output", "parts": [{"text": "resposta"}]},
    ]
    with pytest.raises(ParametroRejeitadoError, match="role 'model'"):
        GoogleGenAIAdapter.validar_historico(historico_invalido)


def test_historico_valido_com_trailing_user_passa() -> None:
    historico_valido = [
        {"role": "user", "parts": [{"text": "pergunta 1"}]},
        {"role": "model", "parts": [{"text": "resposta 1"}]},
        {"role": "user", "parts": [{"text": "pergunta 2"}]},
    ]
    GoogleGenAIAdapter.validar_historico(historico_valido)


def test_build_gemini_payload_rejeita_trailing_model() -> None:
    historico_invalido = [
        {"role": "user", "parts": [{"text": "pergunta"}]},
        {"role": "model", "parts": [{"text": "resposta"}]},
    ]
    with pytest.raises(ValueError, match="role 'model'"):
        _build_gemini_payload("sys", "user", False, contents=historico_invalido)


# ==============================================================================
# 4. Build HTTP REST Payload
# ==============================================================================


def test_build_http_gemini_38_flash_thinking_config() -> None:
    payload = GoogleGenAIAdapter.build_http(
        "gemini-3.8-flash",
        USUARIO,
        system_instruction="Instrucao SOTA",
        thinking_budget=4096,
        thinking_level="high",
        require_json=True,
    )
    assert payload["contents"] == USUARIO
    assert payload["system_instruction"] == {"parts": [{"text": "Instrucao SOTA"}]}
    gen = payload["generationConfig"]
    assert gen["responseMimeType"] == "application/json"
    assert gen["thinkingConfig"]["thinkingLevel"] == "HIGH"
    assert gen["thinkingConfig"]["thinkingBudget"] == 4096
    assert "temperature" not in gen
    assert "top_p" not in gen


def test_build_http_gemini_36_flash_respeita_teto_8k() -> None:
    payload = GoogleGenAIAdapter.build_http(
        "gemini-3.6-flash",
        USUARIO,
        max_output_tokens=65_536,  # Tenta pedir 64k
    )
    # Deve ser limitado pela capacidade máxima real de 8k
    assert payload["generationConfig"]["maxOutputTokens"] == 8_192


def test_build_gemini_payload_omite_temperature_em_3x() -> None:
    payload_38 = _build_gemini_payload("sys", "prompt", False, model="gemini-3.8-flash", temperature=0.5)
    assert "temperature" not in payload_38["generationConfig"]
    assert payload_38["generationConfig"]["thinkingConfig"]["thinkingBudget"] == 4096

    payload_legado = _build_gemini_payload("sys", "prompt", False, model="gemini-1.5-pro", temperature=0.5)
    assert payload_legado["generationConfig"]["temperature"] == 0.5


# ==============================================================================
# 5. Extração Resiliente de Texto
# ==============================================================================


def test_extrair_texto_ignora_thought_block() -> None:
    resposta = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"thought": True, "text": "Tokens de reflexao interna..."},
                        {"text": "Resposta final ao usuario."},
                    ]
                }
            }
        ]
    }
    texto = GoogleGenAIAdapter.extrair_texto(resposta)
    assert texto == "Resposta final ao usuario."
    assert "Tokens de reflexao interna" not in texto
