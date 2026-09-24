"""Testes do adaptador System-1 da Laya (llm/laya_bridge.py).

Cobrem: (1) a classificacao zero-download real de laya vs. o contrato README
(en -> english/latin; devanagari/han -> multilingual/non-latin), (2) provenia
sempre presente, (3) fallback HeuristicRouter quando laya e indisponivel,
(4) entradas negativas (None/""), (5) determinismo, (6) serializacao.
"""

from __future__ import annotations

import json

import pytest

from llm.laya_bridge import (
    FAMILIA_MODELO_POR_LAYA,
    LayaIntent,
    LayaRouter,
    classificar_intencao,
    compor_advisory_s1,
)

LAYA_DISP = LayaRouter.disponivel()


@pytest.mark.skipif(not LAYA_DISP, reason="laya nao disponivel neste ambiente")
class TestLayaReal:
    def test_route_ingles_verificado(self):
        # Saida verificada via REPL: model=english, script=latin, non_latin=0.0
        i = classificar_intencao("Hello world deployment error")
        assert i.idioma == "english"
        assert i.script == "latin"
        assert i.is_english is True
        assert i.nao_latin_fraction_pct == 0.0
        assert i.modelo_sugerido == "small-english"
        assert i.provenia.fallback_used is False
        assert i.provenia.weights_loaded is False
        assert i.provenia.engine_id == "laya-s1"

    def test_route_multilingual_devanagari(self):
        # Saida verificada: model=multilingual, script=devanagari, non_latin=1.0
        i = classificar_intencao("नमस्ते मार्केट सेवा अस्ति")
        assert i.idioma == "multilingual"
        assert i.script == "devanagari"
        assert i.is_english is False
        assert i.nao_latin_fraction_pct == pytest.approx(100.0)
        assert i.modelo_sugerido == "multilingual"

    def test_route_multilingual_han(self):
        i = classificar_intencao("下一步实施计划实施")
        assert i.idioma == "multilingual"
        assert i.script == "han"
        assert i.is_english is False
        assert i.nao_latin_fraction_pct == pytest.approx(100.0)


class TestProvenia:
    def test_provenia_sempre_presente(self):
        i = classificar_intencao("Hello world deployment error")
        for attr in (
            "engine_id",
            "implementation_level",
            "runtime_used",
            "model_used",
            "intended_model",
            "weights_loaded",
            "fallback_used",
            "assumptions",
            "limitations",
            "units",
        ):
            assert getattr(i.provenia, attr) is not None
        assert i.provenia.engine_id in ("laya-s1", "heuristic-script-detector")


class TestFallback:
    def test_fallback_heuristico_quando_laya_indisponivel(self, monkeypatch):
        # Forca o caminho fallback (sem tocar torch).
        monkeypatch.setattr(LayaRouter, "_router", None)
        monkeypatch.setattr(LayaRouter, "_tentado", True)
        i = classificar_intencao("Hello world deployment error")
        assert i.provenia.fallback_used is True
        assert i.provenia.engine_id == "heuristic-script-detector"
        assert i.idioma == "english"
        assert i.script == "latin"
        assert i.is_english is True

    def test_fallback_detecta_non_latin(self, monkeypatch):
        monkeypatch.setattr(LayaRouter, "_router", None)
        monkeypatch.setattr(LayaRouter, "_tentado", True)
        i = classificar_intencao("नमस्ते")
        assert i.idioma == "multilingual"
        assert i.is_english is False
        assert i.nao_latin_fraction_pct == pytest.approx(100.0)


class TestNegativo:
    def test_entrada_none_nao_quebra(self):
        i = classificar_intencao(None)  # type: ignore[arg-type]
        assert isinstance(i, LayaIntent)
        assert i.provenia.fallback_used is True

    def test_entrada_vazia_nao_quebra(self):
        i = classificar_intencao("")
        assert isinstance(i, LayaIntent)
        # HeuristicRouter sem texto: nao_latin 0.0, is_english False -> multilingual
        assert i.nao_latin_fraction_pct == 0.0


class TestDeterminismo:
    def test_mesma_entrada_mesma_saida(self):
        a = classificar_intencao("Hello world deployment error")
        b = classificar_intencao("Hello world deployment error")
        assert a.idioma == b.idioma
        assert a.script == b.script
        assert a.modelo_sugerido == b.modelo_sugerido
        assert a.provenia.fallback_used == b.provenia.fallback_used


class TestSerializacao:
    def test_metadados_s1_json_serializavel(self):
        i = classificar_intencao("Hello world deployment error")
        meta = i.metadados_s1()
        assert set(meta) >= {
            "idioma",
            "script",
            "is_english",
            "modelo_sugerido",
            "nao_latin_fraction_pct",
            "reason",
            "provenia",
        }
        # json.dumps nao pode serializar dataclasses aninhados -> verifica a pista:
        assert isinstance(meta["provenia"], dict)
        json.dumps(meta)  # nao deve levantar

    def test_compoe_sinal_system1_sem_repetir_ou_ecoar_entrada(self):
        prompt = "segredo que nao deve ser repetido"
        composed, metadata = compor_advisory_s1("Use evidence.", prompt)
        assert metadata is not None
        assert "System-1 advisory" in composed
        assert "weights_loaded=False" in composed or "weights_loaded=True" in composed
        assert prompt not in composed

        repeated, repeated_metadata = compor_advisory_s1(composed, prompt)
        assert repeated == composed
        assert repeated_metadata is None

    def test_advisory_vazio_nao_altera_prompt(self):
        prompt, metadata = compor_advisory_s1("Use evidence.", "")
        assert prompt == "Use evidence."
        assert metadata is None


class TestFamiliaModelo:
    def test_mapeamento_verificado(self):
        assert FAMILIA_MODELO_POR_LAYA["english"] == "small-english"
        assert FAMILIA_MODELO_POR_LAYA["multilingual"] == "multilingual"
        assert FAMILIA_MODELO_POR_LAYA["typed-decisions"] == "multilingual"


class TestLayaMultilingualSOTA:
    """Valida as capacidades avançadas da Laya Multilingual."""

    def test_canonical_model_eh_multilingual(self):
        from llm.laya_bridge import CANONICAL_LAYA_MODEL, CANONICAL_LAYA_REPO

        assert CANONICAL_LAYA_MODEL == "multilingual"
        assert CANONICAL_LAYA_REPO == "convaiinnovations/laya-multilingual"

    def test_poker_presets_estruturados(self):
        from llm.laya_bridge import LAYA_POKER_PRESETS

        assert "street_triage" in LAYA_POKER_PRESETS
        assert "icm_pressure" in LAYA_POKER_PRESETS
        st = LAYA_POKER_PRESETS["street_triage"]
        assert st["board_texture"]["type"] == "choice"
        assert st["bubble_danger"]["type"] == "noul"

    def test_predict_batch_executa_sem_falhar(self):
        from llm.laya_bridge import predict_batch

        requests = [
            {"state": "Hero bet 20BB on dry board"},
            {"state": "Villain all-in shove on bubble"},
        ]
        res = predict_batch(requests, batch_size=2)
        assert len(res) == 2
        for pred in res:
            assert pred.provenia is not None
            assert pred.model_used == "multilingual"

    def test_ruin_priority_from_laya_prediction_calibrado(self):
        from llm.laya_bridge import (
            LayaPrediction,
            Provenia,
            ruin_priority_from_laya_prediction,
        )

        p = Provenia(
            engine_id="test",
            implementation_level="primitive",
            runtime_used="test",
            model_used="multilingual",
            intended_model="multilingual",
            weights_loaded=False,
            fallback_used=True,
            assumptions=[],
            limitations=[],
            units=[],
        )
        # Noul alto = certeza alta de sobrevivencia (baixo risco) -> ruin_priority ~ 1.0
        pred_certa = LayaPrediction(
            answers={},
            model_used="multilingual",
            device="cpu",
            n_tokens=10,
            latency_ms=1.0,
            noul=1.0,
            choice="simple",
            score=1.0,
            confidence=1.0,
            provenia=p,
        )
        assert ruin_priority_from_laya_prediction(pred_certa) == 1.0

        # Noul baixo = risco elevado de ruina -> ruin_priority infla ate 1.30
        pred_incerta = LayaPrediction(
            answers={},
            model_used="multilingual",
            device="cpu",
            n_tokens=10,
            latency_ms=1.0,
            noul=0.0,
            choice="complex",
            score=0.0,
            confidence=0.1,
            provenia=p,
        )
        assert ruin_priority_from_laya_prediction(pred_incerta) == 1.30
