"""Testes hermeticos para llm/gemini_decisions.py (Gemini Decisions + cascata Laya)."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from llm.gemini_decisions import (
    DecisionResult,
    GeminiDecisionsClient,
    decide,
    decide_s1,
    is_multimodal_input,
    normalize_questions,
)
from llm.laya_bridge import LayaPrediction, Provenia


def _pergunta_basica() -> dict[str, dict[str, Any]]:
    return {
        "eh_design_system": {
            "type": "noul",
            "instructions": "O pedido e uma operacao de design system?",
        },
        "acao": {
            "type": "choice",
            "instructions": "Qual acao no Stitch?",
            "criteria": {"gerar": "nova tela", "editar": "editar existente", "handoff": "exportar"},
        },
    }


def _resposta_fake_gemini(questions: dict[str, Any]) -> MagicMock:
    """Monta resposta no shape do SDK (answers/usage pydantic-like)."""
    resp = MagicMock()
    answers: dict[str, Any] = {}
    for qid, spec in questions.items():
        qtype = spec["type"]
        if qtype == "noul":
            answers[qid] = {"type": "noul", "noul": 0.82, "confidence": 0.9}
        elif qtype == "choice":
            answers[qid] = {
                "type": "choice",
                "choice": "gerar",
                "probabilities": {"gerar": 0.7, "editar": 0.2, "handoff": 0.1},
                "confidence": 0.85,
            }
        else:
            answers[qid] = {
                "type": "score",
                "score": 3.0,
                "legend": {"0": "baixo", "4": "alto"},
                "probabilities": {"3": 0.8},
                "confidence": 0.7,
            }
    resp.answers = answers
    resp.usage = {"total_tokens": 123}
    return resp


# ---------------------------------------------------------------------------
# normalize_questions
# ---------------------------------------------------------------------------


def test_normalize_questions_formato_laya() -> None:
    norm = normalize_questions(_pergunta_basica())
    assert norm["eh_design_system"]["type"] == "noul"
    assert set(norm["acao"]["criteria"]) == {"gerar", "editar", "handoff"}


def test_normalize_questions_rejeita_tipo_desconhecido() -> None:
    with pytest.raises(ValueError, match="type invalido"):
        normalize_questions({"x": {"type": "ranking", "instructions": "..."}})


def test_normalize_questions_choice_exige_2_a_255_opcoes() -> None:
    with pytest.raises(ValueError, match="choice"):
        normalize_questions({"x": {"type": "choice", "instructions": "...", "criteria": {"so": "uma"}}})


def test_normalize_questions_score_exige_lista() -> None:
    with pytest.raises(ValueError, match="score"):
        normalize_questions({"x": {"type": "score", "instructions": "...", "criteria": "rubrica"}})


def test_normalize_questions_vazio_rejeitado() -> None:
    with pytest.raises(ValueError, match="nao vazio"):
        normalize_questions({})


# ---------------------------------------------------------------------------
# is_multimodal_input
# ---------------------------------------------------------------------------


def test_is_multimodal_input_string_pura() -> None:
    assert is_multimodal_input("texto simples") is False


def test_is_multimodal_input_bloco_imagem() -> None:
    state = [{"type": "text", "text": "analise"}, {"type": "image", "uri": "gs://x.png"}]
    assert is_multimodal_input(state) is True


# ---------------------------------------------------------------------------
# GeminiDecisionsClient
# ---------------------------------------------------------------------------


def test_client_nao_configurado_levanta() -> None:
    with patch.dict("os.environ", {}, clear=True):
        cli = GeminiDecisionsClient(api_key="")
        assert not cli.is_configured
        with pytest.raises(ValueError, match="nao configurado"):
            cli.create("estado", _pergunta_basica())


def test_client_decide_normaliza_resposta() -> None:
    cli = GeminiDecisionsClient(api_key="fake")
    fake_resp = _resposta_fake_gemini(_pergunta_basica())
    with patch.object(cli, "create", return_value=fake_resp):
        result = decide("pedido de tela de dashboard", _pergunta_basica(), client=cli)

    assert isinstance(result, DecisionResult)
    assert result.engine == "gemini-decision-1"
    assert result.n_tokens == 123
    assert result.answer("eh_design_system")["noul"] == pytest.approx(0.82)
    assert result.answer("acao")["choice"] == "gerar"
    assert result.provenia.engine_id == "gemini-decision-1"
    assert result.provenia.fallback_used is False


def test_client_create_usa_api_v1beta() -> None:
    cli = GeminiDecisionsClient(api_key="fake")
    fake_genai_client = MagicMock()
    fake_decisions = MagicMock()
    fake_decisions.create.return_value = MagicMock()
    fake_genai_client.decisions = fake_decisions

    with patch("google.genai.Client", return_value=fake_genai_client) as mock_ctor:
        cli.create("estado", _pergunta_basica())

    _, ctor_kwargs = mock_ctor.call_args
    assert ctor_kwargs["http_options"] == {"api_version": "v1beta"}
    _, kwargs = fake_decisions.create.call_args
    assert kwargs["model"] == "gemini-decision-1"
    assert "input" in kwargs
    assert "questions" in kwargs


# ---------------------------------------------------------------------------
# decide_s1 — cascata Laya -> Gemini
# ---------------------------------------------------------------------------


def _predicao_laya_treinada() -> LayaPrediction:
    return LayaPrediction(
        answers={"acao": {"choice": "gerar", "confidence": 0.7}},
        model_used="convaiinnovations/laya-multilingual",
        device="cpu",
        n_tokens=0,
        latency_ms=12.0,
        noul=0.8,
        choice="gerar",
        score=None,
        confidence=0.7,
        provenia=Provenia(
            engine_id="laya-s1-trained",
            implementation_level="trained-model",
            runtime_used="onnx",
            model_used="convaiinnovations/laya-multilingual",
            intended_model="convaiinnovations/laya-multilingual",
            weights_loaded=True,
            fallback_used=False,
            assumptions=["cpu-ok"],
            limitations=[],
            units=["ms"],
        ),
    )


def _predicao_laya_fallback() -> LayaPrediction:
    pred = _predicao_laya_treinada()
    pred.provenia = Provenia(
        engine_id="laya-s1-heuristic",
        implementation_level="heuristic",
        runtime_used="regex",
        model_used="",
        intended_model="convaiinnovations/laya-multilingual",
        weights_loaded=False,
        fallback_used=True,
        assumptions=["cpu-gated"],
        limitations=["no-checkpoint"],
        units=[],
    )
    return pred


def test_decide_s1_laya_treinada_vence() -> None:
    cli = GeminiDecisionsClient(api_key="")  # sem nuvem
    with patch("llm.gemini_decisions.laya_predict", return_value=_predicao_laya_treinada()):
        result = decide_s1("crie uma tela de login", _pergunta_basica(), client=cli)
    assert result.engine == "laya-s1-trained"
    assert result.answer("acao")["choice"] == "gerar"
    assert result.provenia.fallback_used is False


def test_decide_s1_laya_fallback_escalona_para_nuvem() -> None:
    cli = GeminiDecisionsClient(api_key="fake")
    fake_resp = _resposta_fake_gemini(_pergunta_basica())
    with (
        patch("llm.gemini_decisions.laya_predict", return_value=_predicao_laya_fallback()),
        patch.object(cli, "create", return_value=fake_resp),
    ):
        result = decide_s1("crie uma tela de login", _pergunta_basica(), client=cli)
    assert result.engine == "gemini-decision-1"
    assert result.answer("acao")["choice"] == "gerar"


def test_decide_s1_sem_nuvem_devolve_fallback_honesto() -> None:
    cli = GeminiDecisionsClient(api_key="")
    with patch("llm.gemini_decisions.laya_predict", return_value=_predicao_laya_fallback()):
        result = decide_s1("crie uma tela", _pergunta_basica(), client=cli)
    assert result.engine == "laya-s1-fallback"
    assert result.provenia.fallback_used is True


def test_decide_s1_multimodal_vai_direto_a_nuvem() -> None:
    cli = GeminiDecisionsClient(api_key="fake")
    state = [{"type": "text", "text": "avaliar"}, {"type": "image", "uri": "gs://x.png"}]
    fake_resp = _resposta_fake_gemini(_pergunta_basica())
    with (
        patch("llm.gemini_decisions.laya_predict") as mock_laya,
        patch.object(cli, "create", return_value=fake_resp),
    ):
        result = decide_s1(state, _pergunta_basica(), client=cli)
    mock_laya.assert_not_called()
    assert result.engine == "gemini-decision-1"


def test_decide_s1_laya_explode_e_nuvem_configurada() -> None:
    cli = GeminiDecisionsClient(api_key="fake")
    fake_resp = _resposta_fake_gemini(_pergunta_basica())
    with (
        patch("llm.gemini_decisions.laya_predict", side_effect=RuntimeError("torch off")),
        patch.object(cli, "create", return_value=fake_resp),
    ):
        result = decide_s1("texto", _pergunta_basica(), client=cli)
    assert result.engine == "gemini-decision-1"


def test_decide_s1_sem_motor_nenhum_levanta() -> None:
    cli = GeminiDecisionsClient(api_key="")
    with patch("llm.gemini_decisions.laya_predict", side_effect=RuntimeError("off")):
        with pytest.raises(RuntimeError, match="Nenhum motor"):
            decide_s1("texto", _pergunta_basica(), client=cli)
