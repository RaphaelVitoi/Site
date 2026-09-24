"""Adaptador System-1 da Laya para o ecossistema Chico SOTA.

Classifica intencao zero-download: ``laya.Router.route()`` detecta script,
lingua e a familia de modelo recomendada (english vs. multilingual) SEM
baixar checkpoints nem carregar CUDA -- apenas ``laya.lang.analyse``
(pure-python; <0.5 ms apos warmup).

IMPORT LAZY: ``import laya`` carrega torch em ~1.5s (verificado). Portanto
``from laya.router import Router`` e ``from laya.lang import analyse`` sao
executados DENTRO de metodos, nunca no nivel de modulo. Assim
``import llm.laya_bridge`` (e por extensao routing_policy/arbitrator) fica
livre de torch. A primeira classificacao paga o warmup; as demais reaproveitam
o Router cached em LayaRouter._router.

Provenia (data/engine_capabilities.json, contrato §4):
  - nivel 1 "primitive": route()-only, SEM pesos (este modulo).
  - nivel 2 "trained-model": predict() (choice/score/noul), GPU-gated, fase 4.

Invariantes:
  - saida sempre carrega provenia;
  - fallback (HeuristicRouter) preserva a funcionalidade (sem deps pesadas);
  - nunca toca o caminho de decisao de modelo/custo ($), fonte-unica em
    llm/routing_policy.py::avaliacao_uso_condicional_pro (Tier 0).
"""

from __future__ import annotations

import contextlib
from dataclasses import dataclass
import logging
import os
import re
import time
from typing import Any

__all__ = [
    "CANONICAL_LAYA_MODEL",
    "CANONICAL_LAYA_REPO",
    "Provenia",
    "LayaIntent",
    "LayaRouter",
    "HeuristicRouter",
    "classificar_intencao",
    "compor_advisory_s1",
    "ruin_priority_from_intencao",
    "ruin_priority_from_laya_prediction",
    "LayaPrediction",
    "laya_predict",
    "predict_batch",
    "LAYA_DEFAULT_QUESTIONS",
    "LAYA_POKER_PRESETS",
]

logger = logging.getLogger(__name__)

# Versao Canonica e Unica de Producao SOTA: laya-multilingual (mmBERT-base, 322M).
CANONICAL_LAYA_MODEL: str = "multilingual"
CANONICAL_LAYA_REPO: str = "convaiinnovations/laya-multilingual"

# laya.route().model -> familia de modelo Chico (llm/model_registry.py).
# "english"  -> pequeno modelo local de lingua inglesa (Tier 6 Edge: qwen/gemma en)
# "multilingual"/typed-decisions -> familia multilingue
FAMILIA_MODELO_POR_LAYA: dict[str, str] = {
    "english": "small-english",
    "multilingual": "multilingual",
    "typed-decisions": "multilingual",
}

_LATIN_RE = re.compile(r"[\u0000-\u024F\u1E00-\u1EFF]")


@dataclass
class Provenia:
    """Contrato minimo de provenia §4 (10 campos) de data/engine_capabilities.json."""

    engine_id: str
    implementation_level: str  # primitive | simulation | trained-model
    runtime_used: str
    model_used: str
    intended_model: str
    weights_loaded: bool
    fallback_used: bool
    assumptions: list[str]
    limitations: list[str]
    units: list[str]


@dataclass
class LayaIntent:
    """Classificacao System-1 zero-download de uma intencao de requisicao.

    Campos derivados diretamente da saida verificada de ``laya.Router().route()``:
      RouteDecision{model, repo, reason, detection:{script, script_profile,
      language, is_english, non_latin_fraction}, workflow}.
    ``idioma`` vem de ``model`` (language em detection e Nulo).
    """

    idioma: str
    script: str
    is_english: bool
    modelo_sugerido: str
    nao_latin_fraction_pct: float
    reason: str
    provenia: Provenia

    def metadados_s1(self) -> dict[str, Any]:
        """Serializa para Task.metadata['intencao_s1'] (consumidor: arbitrator)."""
        p = self.provenia
        return {
            "idioma": self.idioma,
            "script": self.script,
            "is_english": self.is_english,
            "modelo_sugerido": self.modelo_sugerido,
            "nao_latin_fraction_pct": self.nao_latin_fraction_pct,
            "reason": self.reason,
            "provenia": {
                "engine_id": p.engine_id,
                "implementation_level": p.implementation_level,
                "runtime_used": p.runtime_used,
                "model_used": p.model_used,
                "intended_model": p.intended_model,
                "weights_loaded": p.weights_loaded,
                "fallback_used": p.fallback_used,
            },
        }


class HeuristicRouter:
    """Fallback determinista, sem dependencia pesada (Unicode script heuristic).

    Usa apenas regex (Lei de Shannon: script != intencao). Nunca falha.
    """

    @staticmethod
    def _frac_non_latin(text: str) -> float:
        if not text:
            return 0.0
        non_latin = sum(1 for c in text if not _LATIN_RE.match(c))
        return non_latin / len(text)

    @classmethod
    def classificar(cls, text: str) -> LayaIntent:
        frac = cls._frac_non_latin(text or "")
        is_en = bool(re.search(r"[A-Za-z]{4,}", text or ""))
        script = "latin" if frac <= 0.30 else "non-latin"
        idioma = "english" if (is_en and script == "latin") else "multilingual"
        return LayaIntent(
            idioma=idioma,
            script=script,
            is_english=is_en,
            modelo_sugerido=FAMILIA_MODELO_POR_LAYA.get(idioma, "multilingual"),
            nao_latin_fraction_pct=round(frac * 100, 2),
            reason=f"heuristic-fallback(frac={frac:.3f},en_like={is_en})",
            provenia=Provenia(
                engine_id="heuristic-script-detector",
                implementation_level="simulation",
                runtime_used="python",
                model_used="",
                intended_model=idioma,
                weights_loaded=False,
                fallback_used=True,
                assumptions=["regex-only", "no-ml-deps"],
                limitations=["not-laya", "shannon-script-only"],
                units=["script", "language", "probability"],
            ),
        )


class LayaRouter:
    """Adaptador System-1 da Laya (rote()) zero-download.

    O Router e carregado preguiçosamente (lazy) na primeira chamada -- nunca
    em import. Assim core/arbitrator.py e llm/routing_policy.py permanecem
    livres de torch.
    """

    _router: Any = None
    _tentado: bool = False

    @classmethod
    def _carregar_router(cls) -> Any:
        if not cls._tentado:
            cls._tentado = True
            try:
                # lazy: from laya.router evita importar laya/__init__ (torch).
                from laya.router import Router as _Router  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

                cls._router = _Router(default=CANONICAL_LAYA_MODEL)
                logger.debug("[laya-s1] Router carregado (lazy, default=%s).", CANONICAL_LAYA_MODEL)
            except Exception as e:  # pylint: disable=broad-except
                logger.debug("[laya-s1] laya indisponivel (%s); fallback heuristico.", e)
                cls._router = None
        return cls._router

    @classmethod
    def disponivel(cls) -> bool:
        return cls._carregar_router() is not None

    @classmethod
    def classificar_intencao(cls, state: str | dict[str, Any]) -> LayaIntent:
        """Classifica uma intencao zero-download (rote()). Sempre retorna LayaIntent."""
        if isinstance(state, dict):
            text = state.get("description") or state.get("query") or state.get("text") or ""
        else:
            text = state or ""

        router = cls._carregar_router()
        if router is not None and text:
            try:
                decision = router.route(text)  # RouteDecision: model/reason/detection/...
                det = decision.get("detection", {}) if isinstance(decision, dict) else {}
                idioma = decision.get("model", "multilingual")
                non_latin = float(det.get("non_latin_fraction", 0.0))
                return LayaIntent(
                    idioma=idioma,
                    script=det.get("script", "unknown"),
                    is_english=bool(det.get("is_english", False)),
                    modelo_sugerido=FAMILIA_MODELO_POR_LAYA.get(idioma, "multilingual"),
                    nao_latin_fraction_pct=round(non_latin * 100, 2),
                    reason=str(decision.get("reason", "")),
                    provenia=Provenia(
                        engine_id="laya-s1",
                        implementation_level="primitive",
                        runtime_used="python",
                        model_used="",
                        intended_model=idioma,
                        weights_loaded=False,
                        fallback_used=False,
                        assumptions=[
                            "laya-route-is-zero-download",
                            "script-language-detection-is-deterministic",
                        ],
                        limitations=[
                            "predict-trained-model-path-is-gpu-gated-fase4",
                            "zero-download-route-does-not-emit-choice-or-noul",
                            "primeira-classificacao-paga-warmup-torch-1.5s",
                        ],
                        units=["script", "language", "probability"],
                    ),
                )
            except Exception as e:  # pylint: disable=broad-except
                logger.debug("[laya-s1] route() falhou (%s); fallback heuristico.", e)
        # Fallback sempre disponivel: HeuristicRouter (sem deps).
        return HeuristicRouter.classificar(text or "")


# API de modulo: consumidor real de LayaRouter (evita instancia a cada chamada).
classificar_intencao = LayaRouter.classificar_intencao


def compor_advisory_s1(system_prompt: str, user_prompt: str) -> tuple[str, dict[str, Any] | None]:
    """Compõe o sinal System-1 da Laya com qualquer backend LLM, sem autoridade.

    O contrato é deliberadamente compacto: não injeta texto livre derivado da
    entrada, não troca modelo/provedor e informa quando a rota é fallback.
    """
    marcador = "[System-1 advisory — Laya; input-side signal, not an answer or authority]"
    if not user_prompt or marcador in system_prompt:
        return system_prompt, None
    try:
        metadata = classificar_intencao(user_prompt).metadados_s1()
        provenance = metadata.get("provenia", {})
        advisory = (
            f"{marcador}\n"
            f"script={metadata.get('script', 'unknown')}; "
            f"language_family={metadata.get('idioma', 'unknown')}; "
            f"non_latin_fraction_pct={metadata.get('nao_latin_fraction_pct', 0)}; "
            f"engine={provenance.get('engine_id', 'unknown')}; "
            f"implementation_level={provenance.get('implementation_level', 'unknown')}; "
            f"weights_loaded={bool(provenance.get('weights_loaded', False))}. "
            "Advisory only: reason from the original request and evidence."
        )
        return f"{system_prompt}\n\n{advisory}", metadata
    except Exception as error:  # pylint: disable=broad-exception-caught
        logger.debug("[laya-s1] composition unavailable: %s", error)
        return system_prompt, None


# =============================================================================
# CAMADA S1-TRAINED: predict() (Fase 4 — GPU-gated)
# =============================================================================


@dataclass
class LayaPrediction:
    """Resultado de laya.predict() (single forward pass com laya-multilingual).

    Carrega as grandezas do System-1 treinado:
      - choice: opcao selecionada (indice + label)
      - score:  pontuacao numerica calibrada
      - noul:   probabilidade calibrada (escala [0, 1])
      - confidence: confianca calibrada via entropia de Shannon (escala [0, 1])
    Sempre acompanhado de provenia §4.
    """

    answers: dict[str, Any]
    model_used: str
    device: str
    n_tokens: int
    latency_ms: float
    noul: float | None
    choice: str | None
    score: float | None
    provenia: Provenia
    confidence: float | None = None


# Presets reutilizáveis (conforme documentacao laya): tipos question/choice/score/noul.
# Cada preset e um conjunto de questoes tipadas para o forward pass unico.
LAYA_DEFAULT_QUESTIONS: dict[str, dict[str, Any]] = {
    "guard": {
        "type": "noul",
        "instructions": (
            "Assess the input for operational risk, unsafe instructions, or content "
            "that falls outside safe policy boundaries."
        ),
    },
    "triage": {
        "type": "choice",
        "instructions": "Classify the complexity tier of the input.",
        "criteria": {
            "simple": "Trivial, factual, single-step lookup or calculation.",
            "moderate": "Multi-step reasoning, requires synthesis or comparison.",
            "complex": "Open-ended analysis, creative synthesis, or strategic planning.",
        },
    },
    "router": {
        "type": "score",
        "instructions": "Rate the linguistic uncertainty of this input (0.0 = certain Latin/script known, 1.0 = highly uncertain/non-Latin).",
        "criteria": ["low", "medium", "high"],
    },
}

# Presets SOTA Canônicos para Poker & Game Theory
LAYA_POKER_PRESETS: dict[str, dict[str, Any]] = {
    "street_triage": {
        "board_texture": {
            "type": "choice",
            "instructions": "Classifique a textura do bordo quanto a conectividade dinamica.",
            "criteria": {
                "dry": "Bordo desconectado, rainbow, pouca interacao de draws.",
                "wet": "Coordenado, duas ou tres cartas do mesmo naipe, sequencias possiveis.",
                "monotone": "Tres ou mais cartas do mesmo naipe presente no bordo.",
                "paired": "Bordo com par dobrado, potencial de full house/quadra.",
            },
        },
        "hero_perceived_line": {
            "type": "choice",
            "instructions": "Qual a linha otima inferida pelo Sistema 1?",
            "criteria": {
                "value_pure": "Mao no topo do range; aposta por valor linear.",
                "bluff_pressure": "Aposta polarizada explorando assimetria de ICM.",
                "pot_control": "Check/Call preservando stack de sobrevivencia.",
                "surrender_fold": "EV de sobrevivencia negativo; desistencia obrigatoria.",
            },
        },
        "bubble_danger": {
            "type": "noul",
            "instructions": "O cenario apresenta risco iminente de eliminacao antes do payjump?",
        },
    },
    "icm_pressure": {
        "bubble_pressure_tier": {
            "type": "score",
            "instructions": "Avalie o nivel de pressao de ICM sobre o Hero de 0 (baixo) a 3 (extremo).",
            "criteria": ["low_icm", "moderate_icm", "severe_bubble", "final_table_payjump"],
        },
        "elimination_risk": {
            "type": "noul",
            "instructions": "O Hero corre risco imediato de bustout nesta acao?",
        },
    },
}


def _detect_device() -> str:
    """Detecta o device disponivel sem forcar torch a carregar no import.

    CPU host -> 'cpu'. GPU host (Tier 6 Edge AI) -> 'cuda'.
    """
    force_cpu = os.environ.get("CHICO_FORCE_CPU_LAYA", "0") == "1"
    if force_cpu:
        return "cpu"
    try:
        import torch  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        if torch.cuda.is_available():
            return "cuda"
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[laya-s1] CUDA indisponivel; fallback 'cpu' (%s).", e)
    return "cpu"


def _allow_cpu_predict() -> bool:
    """Override Tier-0: permite tentar laya.predict() em host CPU.

    Demoroso (download 322M + forward ~350ms/CPU). Apenas para validação
    ou quando o arbitro Tier 0 autoriza explicitamente.
    """
    return os.environ.get("CHICO_LAYA_PREDICT_ALLOW_CPU", "0") == "1"


def _extrair_grandes_dados(
    result: dict[str, Any], qs: dict[str, dict[str, Any]]
) -> tuple[float | None, str | None, float | None, float | None]:
    """Extrai noul, choice, score e confidence do resultado do forward pass da Laya Multilingual."""
    answers = result.get("answers", result) if isinstance(result, dict) else {}
    noul: float | None = None
    choice: str | None = None
    score: float | None = None
    conf: float | None = None
    for qid, qdef in qs.items():
        qtype = qdef.get("type")
        if qid not in answers:
            continue
        resp = answers[qid]
        if isinstance(resp, dict):
            if "confidence" in resp:
                with contextlib.suppress(ValueError, TypeError):
                    conf = float(resp["confidence"])
            if qtype == "noul":
                noul = float(resp.get("noul", resp.get("probability", resp.get("value", 0.0))))
            elif qtype == "choice":
                choice = str(resp.get("choice", resp.get("answer", "")))
            elif qtype == "score":
                score = float(resp.get("score", resp.get("value", 0.0)))
    if noul is None and isinstance(result, dict):
        noul_val = result.get("noul", result.get("calibrated_probability"))
        noul = float(noul_val) if noul_val is not None else None
    if choice is None and isinstance(result, dict):
        ch_val = result.get("choice", result.get("selected"))
        choice = str(ch_val) if ch_val is not None else None
    if score is None and isinstance(result, dict):
        sc_val = result.get("score", result.get("value"))
        score = float(sc_val) if sc_val is not None else None
    return noul, choice, score, conf


def _construir_fallback_prediction(
    state: str | dict[str, Any],
    device_str: str,
    inicio: float,
    *,
    assumption_tag: str,
    limitation_extras: list[str],
) -> LayaPrediction:
    """Constrói LayaPrediction heurístico (fallback) a partir de ruin_priority."""
    intent = LayaRouter.classificar_intencao(state)
    rp = ruin_priority_from_intencao(intent.metadados_s1())
    noul_proxy = round(1.0 - (rp - 1.0) / 0.30, 4) if rp > 1.0 else 0.95
    noul_proxy = max(0.0, min(1.0, noul_proxy))
    latency_ms = round((time.perf_counter() - inicio) * 1000.0, 2)
    conf_proxy = round(1.0 - (rp - 1.0) / 0.30, 4) if rp > 1.0 else 1.0
    return LayaPrediction(
        answers={},
        model_used=CANONICAL_LAYA_MODEL,
        device=device_str,
        n_tokens=0,
        latency_ms=latency_ms,
        noul=noul_proxy,
        choice="fallback-heuristic",
        score=noul_proxy,
        confidence=conf_proxy,
        provenia=Provenia(
            engine_id="laya-s1-predict-fallback",
            implementation_level="primitive",
            runtime_used=f"python (fallback, device={device_str})",
            model_used=CANONICAL_LAYA_MODEL,
            intended_model=CANONICAL_LAYA_MODEL,
            weights_loaded=False,
            fallback_used=True,
            assumptions=[
                assumption_tag,
                "noul-proxy-from-ruin-priority",
                "zero-download-route-is-deterministic",
                f"canonical-model={CANONICAL_LAYA_MODEL}",
            ],
            limitations=[
                *limitation_extras,
                "noul-is-proxy-not-calibrated",
            ],
            units=["ms", "probability"],
        ),
    )


def laya_predict(
    state: str | dict[str, Any],
    questions: dict[str, dict[str, Any]] | None = None,
    model_override: str | None = None,
    max_len: int = 1024,
) -> LayaPrediction:
    """Executa laya.predict() (full System-1 forward pass com laya-multilingual).

    IMPORT LAZY: carrega torch apenas aqui. Respecta o device detectado —
    CPU host nunca tenta CUDA. Perguntas sobreescrevem os presets default.
    Target canonico SOTA: laya-multilingual (mmBERT-base, 322M). Suporta
    contexto estendido ate 8192 tokens para Hand Histories completos.
    """
    inicio = time.perf_counter()
    device_str = _detect_device()
    qs = questions if questions is not None else LAYA_DEFAULT_QUESTIONS

    # Escala automatica de contexto para Hand Histories de Poker (>400 palavras)
    state_str = state if isinstance(state, str) else str(state)
    eff_max_len = 8192 if len(state_str.split()) > 400 or max_len > 1024 else max_len

    cpu_force_block = device_str == "cpu" and not _allow_cpu_predict()
    if cpu_force_block:
        logger.debug("[laya-s1] CPU only; predict() fallback heuristico (no checkpoint).")
        return _construir_fallback_prediction(
            state,
            device_str,
            inicio,
            assumption_tag="laya-predict-cpu-gated-skipped",
            limitation_extras=[
                "predict-requires-gpu-tier6-edge-ai",
                "no-trained-checkpoint-loaded-on-cpu",
                f"canonical_model={CANONICAL_LAYA_MODEL}",
            ],
        )

    try:
        from laya.router import Router as _Router  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        router = _Router(default=CANONICAL_LAYA_MODEL)

        # O modelo canônico é sempre 'multilingual', a menos que explicitamente sobrescrito
        model_name = model_override or CANONICAL_LAYA_MODEL
        result = router.predict(state, qs, model=model_name)

        latency_ms = (time.perf_counter() - inicio) * 1000.0
        noul, choice, score, conf = _extrair_grandes_dados(result, qs)
        model_used = result.get("routing", {}).get("model", model_name)

        return LayaPrediction(
            answers=result,
            model_used=model_used,
            device=device_str,
            n_tokens=int(result.get("token_usage", {}).get("total_tokens", 0))
            if isinstance(result.get("token_usage"), dict)
            else 0,
            latency_ms=round(latency_ms, 2),
            noul=round(noul, 6) if noul is not None else None,
            choice=choice if choice else None,
            score=round(score, 6) if score is not None else None,
            confidence=round(conf, 6) if conf is not None else None,
            provenia=Provenia(
                engine_id="laya-s1-trained",
                implementation_level="trained-model",
                runtime_used=f"transformers+torch ({device_str})",
                model_used=model_used,
                intended_model=model_name,
                weights_loaded=True,
                fallback_used=False,
                assumptions=[
                    "laya-predict-single-forward-pass",
                    f"device={device_str}",
                    f"canonical-model={CANONICAL_LAYA_MODEL}",
                    f"max_len={eff_max_len}",
                    "questions=" + ("default" if questions is None else "custom"),
                ],
                limitations=[
                    "predict-requires-checkpoint-download-gpu-preferred",
                    "cpu-inference-latency-higher",
                    "noul-scale-0-to-1",
                ],
                units=["ms", "n_tokens", "probability", "score"],
            ),
        )
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[laya-s1] predict() falhou (%s); fallback heuristico.", e)
        return _construir_fallback_prediction(
            state,
            device_str,
            inicio,
            assumption_tag="laya-predict-unavailable-or-failed",
            limitation_extras=[
                str(e),
                "no-trained-checkpoint-loaded",
            ],
        )


def predict_batch(
    requests: list[dict[str, Any]],
    batch_size: int = 8,
    model_override: str | None = None,
) -> list[LayaPrediction]:
    """Processa lote heterogêneo de predições Laya S1 Multilingual.

    Agrupa requisições para execução em batch otimizada via Router.predict_batch()
    quando disponível, ou despacha individualmente preservando a ordem dos resultados.
    Ideal para avaliação de mesas multiway (ex: 9 jogadores em FT).
    """
    if not requests:
        return []

    device_str = _detect_device()
    if device_str == "cpu" and not _allow_cpu_predict():
        return [laya_predict(req.get("state", ""), req.get("questions"), model_override) for req in requests]

    try:
        from laya.router import Router as _Router  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        router = _Router(default=CANONICAL_LAYA_MODEL)
        target_model = model_override or CANONICAL_LAYA_MODEL
        formatted_requests = []
        for r in requests:
            item = dict(r)
            if "model" not in item:
                item["model"] = target_model
            formatted_requests.append(item)

        predict_batch_fn: Any = getattr(router, "predict_batch", None)  # noqa: B009
        if callable(predict_batch_fn):
            raw_batch: Any = predict_batch_fn(formatted_requests, batch_size=batch_size)
            batch_results = raw_batch if isinstance(raw_batch, list) else []
        else:
            batch_results = [
                router.predict(
                    r.get("state", ""),
                    r.get("questions", LAYA_DEFAULT_QUESTIONS),
                    model=target_model,
                )
                for r in formatted_requests
            ]
        predictions: list[LayaPrediction] = []
        for i, res in enumerate(batch_results):
            orig_qs = requests[i].get("questions", LAYA_DEFAULT_QUESTIONS)
            noul, choice, score, conf = _extrair_grandes_dados(res, orig_qs)
            m_used = res.get("routing", {}).get("model", target_model)
            predictions.append(
                LayaPrediction(
                    answers=res,
                    model_used=m_used,
                    device=device_str,
                    n_tokens=int(res.get("token_usage", {}).get("total_tokens", 0))
                    if isinstance(res.get("token_usage"), dict)
                    else 0,
                    latency_ms=0.0,
                    noul=round(noul, 6) if noul is not None else None,
                    choice=choice if choice else None,
                    score=round(score, 6) if score is not None else None,
                    confidence=round(conf, 6) if conf is not None else None,
                    provenia=Provenia(
                        engine_id="laya-s1-trained",
                        implementation_level="trained-model",
                        runtime_used=f"transformers+torch ({device_str})",
                        model_used=m_used,
                        intended_model=target_model,
                        weights_loaded=True,
                        fallback_used=False,
                        assumptions=[
                            "laya-predict-batch-grouped",
                            f"batch_size={batch_size}",
                            f"canonical-model={CANONICAL_LAYA_MODEL}",
                        ],
                        limitations=[
                            "predict-requires-checkpoint-download-gpu-preferred",
                        ],
                        units=["probability", "score"],
                    ),
                )
            )
        return predictions
    except Exception as err:
        logger.debug("[laya-s1] predict_batch falhou (%s); caindo para laya_predict sequencial.", err)
        return [laya_predict(req.get("state", ""), req.get("questions"), model_override) for req in requests]


def ruin_priority_from_intencao(intencao_s1: dict[str, Any] | None = None) -> float:
    """Etapa 0 (laya S1): converte o sinal System-1 em prior de ruína (Teorema 2).

    ``intencao_s1`` é o sinal bruto da Laya (``Task.metadata['n']`` =
    ``LayaIntent.metadados_s1()``). ``nao_latin_fraction_pct`` [0,100] media o input:
    não-latim/incerto -> ``ruin_priority`` > 1.0 (prior de sobrevivência inflado ->
    exige mais equidade para chamar -> cautela, aniquila variância, SOTA GOLD).
    1.0 = latim/inglês (desativado, backward-compat).

    S1 não decide os 10 teoremas (invariante §§3, 6.6) — apenas modula o prior de
    sobrevivência de ``calculate_negative_risk_premium_river`` (Teorema 2, BF<1).
    """
    if not intencao_s1:
        return 1.0
    frac = float(intencao_s1.get("nao_latin_fraction_pct", 0.0)) / 100.0
    prior = 1.0 + frac * 0.30
    return max(1.0, min(1.30, prior))


def ruin_priority_from_laya_prediction(prediction: LayaPrediction | None) -> float:
    """Etapa 0 (laya S1 Multilingual): modula o prior de ruína do Teorema 2.

    Se uma predição treinada estiver disponível com probabilidade calibrada (noul)
    ou confiança de Shannon, usa-a diretamente para modular o risco [1.0, 1.30].
    """
    if not prediction:
        return 1.0
    if prediction.noul is not None:
        noul = float(prediction.noul)
        prior = 1.0 + (1.0 - noul) * 0.30 if noul <= 1.0 else 1.0
        return max(1.0, min(1.30, prior))
    if prediction.confidence is not None:
        conf = float(prediction.confidence)
        prior = 1.0 + (1.0 - conf) * 0.30
        return max(1.0, min(1.30, prior))
    return 1.0
