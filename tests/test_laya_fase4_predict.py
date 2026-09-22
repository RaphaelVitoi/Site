"""Testes da Fase 4: laya.predict() (full System-1 forward pass).

Cubrem:
  - Contrato LayaPrediction (campos obrigatórios, provenia §4).
  - Fallback heuristico quando laya.Router.predict() falha (CPU host).
  - Presets LAYA_DEFAULT_QUESTIONS (3 tipos: noul, choice, score).
  - Paridade de ruin_priority: metadados_s1() -> ruin_priority_from_intencao().
  - Lazy import: torch NO carrega em import-level (Fase 0 invariant).
"""

import pytest

from llm.laya_bridge import (
    LAYA_DEFAULT_QUESTIONS,
    LayaIntent,
    LayaPrediction,
    LayaRouter,
    laya_predict,
    ruin_priority_from_intencao,
)


def _cuda_disponivel() -> bool:
    """Detecta CUDA (para skip de testes GPU-gated)."""
    try:
        import torch  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        return torch.cuda.is_available()
    except Exception:  # pylint: disable=broad-except
        return False


def _allow_cpu_override() -> bool:
    """True quando o arbitro Tier-0 ativou CHICO_LAYA_PREDICT_ALLOW_CPU=1."""
    import os  # pylint: disable=import-outside-toplevel  # noqa: PLC0415

    return os.environ.get("CHICO_LAYA_PREDICT_ALLOW_CPU", "0") == "1"


class TestLayaPredictionContract:
    """Valida o dataclass LayaPrediction e sua provenia §4."""

    def test_prediction_tem_campos_obrigatorios(self):
        """LayaPrediction deve ter todos os campos do contrato do Teorema 1."""
        fields = {f.name for f in LayaPrediction.__dataclass_fields__.values()}  # pylint: disable=no-member
        obrigatorios = {
            "answers",
            "model_used",
            "device",
            "n_tokens",
            "latency_ms",
            "noul",
            "choice",
            "score",
            "provenia",
        }
        assert obrigatorios.issubset(fields), f"Campos faltando: {obrigatorios - fields}"

    @pytest.mark.skipif(
        (not _cuda_disponivel() and not _allow_cpu_override()),
        reason="CUDA não disponível e override CPU não ativado — predict() usa fallback heurístico.",
    )
    def test_provenia_nivel_trained_model(self):
        """Provenia da predict() deve usar implementation_level='trained-model'.

        Apenas em host GPU (Tier 6 Edge AI) ou quando override CPU ativado.
        Em CPU sem override, use test_provenia_fallback_primitive.
        """
        pred = laya_predict("Teste de prova simples em português.")
        assert pred.provenia.engine_id == "laya-s1-trained"
        assert pred.provenia.implementation_level == "trained-model"
        assert pred.provenia.runtime_used.startswith("transformers+torch")
        assert pred.provenia.weights_loaded is True
        assert pred.provenia.fallback_used is False

    def test_provenia_fallback_primitive(self):
        """Fallback deve usar implementation_level='primitive' e fallback_used=True."""
        pred = laya_predict("Teste fallback portugues.")
        if pred.provenia.fallback_used:
            assert pred.provenia.implementation_level == "primitive"
            assert pred.provenia.engine_id == "laya-s1-predict-fallback"


class TestLayaPredictFallback:
    """No host CPU, laya.predict() caminha para HeuristicRouter."""

    def test_retorna_laya_prediction_valida(self):
        """laya_predict() sempre retorna LayaPrediction, nunca levanta."""
        pred = laya_predict("Input de teste em portugues para fallback.")
        assert isinstance(pred, LayaPrediction)

    def test_fallback_noul_no_intervalo_valido(self):
        """noul do fallback deve estar em [0, 1] (escala probabilística)."""
        pred = laya_predict("Texto em portugues, latim, fallback esperado.")
        assert pred.noul is not None
        assert 0.0 <= pred.noul <= 1.0

    def test_fallback_choice_identifica_algoritmo(self):
        """Fallback choice deve conter 'fallback-heuristic'."""
        pred = laya_predict("Fallback test portugues")
        assert pred.choice is not None
        assert "fallback" in pred.choice.lower()

    def test_fallback_has_provenia(self):
        """Todo resultado (inclusive fallback) carrega provenia §4."""
        pred = laya_predict("Fallback provenia test")
        assert pred.provenia is not None
        assert pred.provenia.engine_id is not None
        assert pred.provenia.implementation_level is not None


class TestLayaDefaultQuestions:
    """Valida os presets LAYA_DEFAULT_QUESTIONS (3 tipos)."""

    def test_tem_tres_tipos(self):
        """Presets devem mapear noul, choice e score."""
        assert "guard" in LAYA_DEFAULT_QUESTIONS
        assert "triage" in LAYA_DEFAULT_QUESTIONS
        assert "router" in LAYA_DEFAULT_QUESTIONS

    def test_guard_eh_noul(self):
        assert LAYA_DEFAULT_QUESTIONS["guard"]["type"] == "noul"
        assert "instructions" in LAYA_DEFAULT_QUESTIONS["guard"]

    def test_triage_eh_choice_com_criteria(self):
        assert LAYA_DEFAULT_QUESTIONS["triage"]["type"] == "choice"
        criteria = LAYA_DEFAULT_QUESTIONS["triage"]["criteria"]
        assert "simple" in criteria
        assert "moderate" in criteria
        assert "complex" in criteria

    def test_router_eh_score_com_criteria_list(self):
        assert LAYA_DEFAULT_QUESTIONS["router"]["type"] == "score"
        criteria = LAYA_DEFAULT_QUESTIONS["router"]["criteria"]
        assert isinstance(criteria, list)
        assert "low" in criteria
        assert "medium" in criteria
        assert "high" in criteria


class TestParidadeRuimPriority:
    """Paridade: LayaIntent.metadados_s1() -> ruin_priority_from_intencao()."""

    def test_metodos_s1_compativel_com_ruin_priority(self):
        """metadados_s1() deve retornar dict compatível com ruin_priority_from_intencao()."""
        intent = LayaRouter.classificar_intencao("Teste em portugues.")
        assert isinstance(intent, LayaIntent)
        md = intent.metadados_s1()
        assert isinstance(md, dict)
        rp = ruin_priority_from_intencao(md)
        assert 1.0 <= rp <= 1.30

    def test_ruin_priority_latim_eh_um(self):
        """Latim/inglês -> ruin_priority = 1.0 (backward-compat, desativado)."""
        md = {"nao_latin_fraction_pct": 0.0}
        rp = ruin_priority_from_intencao(md)
        assert rp == 1.0

    def test_ruin_priority_nao_latin_infla(self):
        """Não-latim/incerto -> ruin_priority > 1.0."""
        md = {"nao_latin_fraction_pct": 50.0}
        rp = ruin_priority_from_intencao(md)
        assert rp > 1.0
        assert rp == pytest.approx(1.15, abs=1e-6)

    def test_ruin_priority_cap_1_30(self):
        """Cap máximo em 1.30 (SOTA GOLD)."""
        md = {"nao_latin_fraction_pct": 100.0}
        rp = ruin_priority_from_intencao(md)
        assert rp == 1.30

    def test_ruin_priority_none_default(self):
        """Sem intencao_s1 -> ruin_priority = 1.0 (safe default)."""
        assert ruin_priority_from_intencao(None) == 1.0
        assert ruin_priority_from_intencao({}) == 1.0


class TestLazyImportInvariant:
    """Invariante da Fase 0: torch NO carrega no import-level."""

    def test_laya_bridge_importavel_sem_torch(self):
        """Importar llm.laya_bridge não deve carregar torch no namespace de módulo."""
        # NÃO fazer importlib.reload — quebra isinstance de LayaIntent em testes
        # subsequentes (redefine o objeto classe). Verificacao estatica de source.
        import llm.laya_bridge as mod  # pylint: disable=import-outside-toplevel

        # torch não deve aparecer como atributo top-level
        assert not hasattr(mod, "torch")
        # Nenhuma chamada a import(torch) no nível de módulo (apenas dentro de funções/métodos)
        with open(mod.__file__, encoding="utf-8") as f:
            source = f.read()
        # 'import torch' deve estar apenas dentro de funções/métodos, nunca no nível módulo
        import_lines = [
            line.strip() for line in source.split("\n") if "import torch" in line and not line.startswith((" ", "\t"))
        ]
        assert len(import_lines) == 0, f"import torch no nível módulo detectado: {import_lines}"
