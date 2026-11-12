"""Ponte SOTA para a Gemini Decisions API (``gemini-decision-1``) e cascata System-1.

A Gemini Decisions API (``POST /v1beta/decisions``, anunciada em 2026-11-11)
avalia ate 1.000 perguntas fechadas (``noul``/``choice``/``score``) sobre um
input multimodal compartilhado em um unico forward pass -- 150-250 ms,
$0.10/1M tokens de input, output gratis. O formato de perguntas e quase
identico ao da Laya (``{type, instructions, criteria}``), o que permite a
cascata System-1 local -> nuvem calibrada:

  - ``decide_s1`` tenta primeiro ``laya_predict`` (System-1 local, Tier 6,
    custo marginal zero, ~33 ms em GPU) para entradas texto-only;
  - escala para ``gemini-decision-1`` quando a Laya esta indisponivel/gated
    (fallback heuristico), quando o input e multimodal (imagem/audio/video/
    PDF -- a Laya so ve texto) ou quando o chamador exige a nuvem.

Proveniencia: toda resposta carrega ``Provenia`` (contrato Secao 4 de
data/engine_capabilities.json), reutilizando o dataclass de ``llm.laya_bridge``.

Invariantes:
  - IMPORT LAZY de ``google.genai``: o modulo importa sem a SDK instalada;
  - chave resolvida de GEMINI_API_KEY/GOOGLE_API_KEY (env ou registro
    Windows), nunca logada;
  - nao toca decisao de modelo/custo ($) -- fonte unica segue em
    llm/routing_policy.py (Tier 0).
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any

from llm.decision_pool import DECISION_POOL_NAME, _sha8, decision_pool_manager
from llm.laya_bridge import Provenia, laya_predict

__all__ = [
    "DECISIONS_API_VERSION",
    "GEMINI_DECISION_MODEL",
    "MAX_CHOICE_OPTIONS",
    "MAX_DECISION_QUESTIONS",
    "QUESTION_TYPES",
    "DecisionResult",
    "GeminiDecisionsClient",
    "decide",
    "decide_s1",
    "is_multimodal_input",
    "normalize_questions",
]

logger = logging.getLogger(__name__)

GEMINI_DECISION_MODEL: str = "gemini-decision-1"
DECISIONS_API_VERSION: str = "v1beta"
QUESTION_TYPES: tuple[str, ...] = ("noul", "choice", "score")
MIN_CHOICE_OPTIONS: int = 2
MAX_CHOICE_OPTIONS: int = 255
MAX_DECISION_QUESTIONS: int = 1000
ENV_NOT_CONFIGURED: str = "GeminiDecisionsClient nao configurado: GEMINI_API_KEY/GOOGLE_API_KEY ausente."

_ENV_KEYS: tuple[str, ...] = ("GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENAI_API_KEY")


def _env_loaded() -> bool:
    return bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))


def _load_env_once() -> None:
    """Carrega .env/.env.local uma unica vez, sem depender de core.config."""
    if _env_loaded():
        return
    try:
        from utils.env_loader import load_env  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        load_env()
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[gemini-decisions] load_env indisponivel: %s", e)


def _resolve_api_keys() -> list[str]:
    """Resolve candidatas: pool dedicado 'decision' primeiro, fallback Gemini/Google."""
    _load_env_once()
    try:
        candidates = decision_pool_manager.iter_candidate_keys()
        if candidates:
            return candidates
        decision_pool_manager.reload(read_registry=True)
        return decision_pool_manager.iter_candidate_keys()
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[gemini-decisions] decision_pool indisponivel: %s", e)
    keys: list[str] = []
    for key in _ENV_KEYS:
        val = (os.environ.get(key) or "").strip()
        if val and val not in keys:
            keys.append(val)
    return keys


def _resolve_api_key() -> str:
    """Primeira candidata do pool 'decision' (ou fallback)."""
    keys = _resolve_api_keys()
    return keys[0] if keys else ""


def is_multimodal_input(state: Any) -> bool:
    """True quando ``state`` carrega blocos de conteudo multimodal (nao-string puro)."""
    if isinstance(state, str):
        return False
    if isinstance(state, (list, tuple)):
        return any(isinstance(b, dict) and b.get("type") not in (None, "text") for b in state)
    return isinstance(state, dict)


def _normalize_instructions(raw: Any) -> Any:
    """Instructions aceita str ou lista de blocos de texto; devolve como esta."""
    if isinstance(raw, str):
        return raw.strip()
    if isinstance(raw, list):
        return [b for b in raw if isinstance(b, dict)]
    return raw


def _norm_noul_criteria(qid: str, criteria: Any) -> dict[str, str] | None:
    """Criteria ``noul``: aceita ``{"true":..,"false":..}`` (Laya) e devolve
    o shape do SDK ``true_description``/``false_description``."""
    if criteria is None:
        return None
    if not isinstance(criteria, dict):
        raise ValueError(f"questions[{qid!r}].criteria (noul) deve ser mapa true/false.")
    mapped: dict[str, str] = {}
    for k, v in criteria.items():
        key = str(k)
        if key in ("true", "false"):
            key = f"{key}_description"
        if key in ("true_description", "false_description"):
            mapped[key] = str(v)
    return mapped or None


def _norm_choice_criteria(qid: str, criteria: Any) -> dict[str, str]:
    if not isinstance(criteria, dict) or not (MIN_CHOICE_OPTIONS <= len(criteria) <= MAX_CHOICE_OPTIONS):
        raise ValueError(
            f"questions[{qid!r}].criteria (choice) deve ser mapa com {MIN_CHOICE_OPTIONS}..{MAX_CHOICE_OPTIONS} opcoes."
        )
    return {str(k): str(v) for k, v in criteria.items()}


def _norm_score_criteria(qid: str, criteria: Any) -> list[str]:
    if not isinstance(criteria, list) or len(criteria) < 2:
        raise ValueError(f"questions[{qid!r}].criteria (score) deve ser lista ordenada (rubrica).")
    return [str(c) for c in criteria]


_CRITERIA_NORMALIZERS: dict[str, Any] = {
    "noul": _norm_noul_criteria,
    "choice": _norm_choice_criteria,
    "score": _norm_score_criteria,
}


def normalize_questions(questions: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Valida e normaliza perguntas no formato aceito pela Decisions API.

    Aceita o mesmo shape da Laya (``{type, instructions, criteria}``):
      - ``noul``: criteria opcional ``{"true": ..., "false": ...}``;
      - ``choice``: criteria dict com 2..255 opcoes;
      - ``score``: criteria lista ordenada (rubrica a partir de 0).

    Levanta ``ValueError`` em formato invalido -- falhar alto e melhor que
    deixar a API rejeitar um payload silenciosamente errado.
    """
    if not isinstance(questions, dict) or not questions:
        raise ValueError("questions deve ser um mapa nao vazio de perguntas.")
    if len(questions) > MAX_DECISION_QUESTIONS:
        raise ValueError(f"questions excede o teto da Decisions API ({MAX_DECISION_QUESTIONS}).")

    normalized: dict[str, dict[str, Any]] = {}
    for qid, spec in questions.items():
        if not isinstance(qid, str) or not qid.strip() or len(qid) > 64:
            raise ValueError(f"question id invalido: {qid!r} (ate 64 chars, [A-Za-z0-9_-]).")
        if not isinstance(spec, dict):
            raise ValueError(f"questions[{qid!r}] deve ser um mapa com type/instructions/criteria.")
        qtype = str(spec.get("type") or "").strip().lower()
        if qtype not in QUESTION_TYPES:
            raise ValueError(f"questions[{qid!r}].type invalido: {qtype!r} (use noul|choice|score).")
        instructions = _normalize_instructions(spec.get("instructions"))
        if not instructions:
            raise ValueError(f"questions[{qid!r}].instructions obrigatorio.")

        item: dict[str, Any] = {"type": qtype, "instructions": instructions}
        criteria = _CRITERIA_NORMALIZERS[qtype](qid, spec.get("criteria"))
        if criteria is not None:
            item["criteria"] = criteria
        normalized[qid] = item
    return normalized


def _to_api_input(state: Any) -> Any:
    """Converte ``state`` para o campo ``input`` da Decisions API."""
    if isinstance(state, str):
        return state
    if isinstance(state, (list, tuple)):
        return list(state)
    if isinstance(state, dict):
        return state
    return str(state)


class GeminiDecisionsClient:
    """Cliente hermetico para ``client.decisions.create`` (google-genai >=3.2).

    Suporta pool de chaves: ``api_keys`` ordenado (dedicadas DECISION_API_*
    primeiro, fallback Gemini/Google depois) com failover por tentativa.
    """

    def __init__(
        self,
        api_key: str | None = None,
        api_keys: list[str] | None = None,
        model: str = GEMINI_DECISION_MODEL,
    ) -> None:
        if api_keys:
            self._api_keys = list(dict.fromkeys(k for k in api_keys if k))
        elif api_key is not None:
            self._api_keys = [api_key] if api_key else []
        else:
            self._api_keys = _resolve_api_keys()
        self._model = model
        self._clients: dict[str, Any] = {}

    @property
    def is_configured(self) -> bool:
        return any(self._api_keys)

    @property
    def model(self) -> str:
        return self._model

    @property
    def api_keys(self) -> list[str]:
        return list(self._api_keys)

    def _get_client(self, api_key: str) -> Any:
        if api_key not in self._clients:
            from google import genai  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

            self._clients[api_key] = genai.Client(
                api_key=api_key,
                http_options={"api_version": DECISIONS_API_VERSION},
            )
        return self._clients[api_key]

    def create(
        self,
        state: Any,
        questions: dict[str, dict[str, Any]],
        key: str | None = None,
    ) -> Any:
        """Executa ``decisions.create`` e devolve a resposta crua do SDK."""
        api_key = key or (self._api_keys[0] if self._api_keys else "")
        if not api_key:
            raise ValueError(ENV_NOT_CONFIGURED)
        normalized = normalize_questions(questions)
        return self._get_client(api_key).decisions.create(
            model=self._model,
            input=_to_api_input(state),
            questions=normalized,
        )


def _as_dict(obj: Any) -> dict[str, Any]:
    """Converte modelo pydantic/dict para dict de forma defensiva."""
    if isinstance(obj, dict):
        return obj
    dump = getattr(obj, "model_dump", None)
    if callable(dump):
        try:
            dumped = dump(mode="python")
            if isinstance(dumped, dict):
                return dumped
        except Exception as e:  # pylint: disable=broad-except
            logger.debug("[gemini-decisions] model_dump falhou: %s", e)
    return {k: getattr(obj, k) for k in dir(obj) if not k.startswith("_")} if obj is not None else {}


def _float_or_none(value: Any) -> float | None:
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _answer_from_gemini(raw: Any) -> dict[str, Any]:
    """Normaliza um Answer do SDK (union noul/choice/score) para dict estavel."""
    data = _as_dict(raw)
    qtype = str(data.get("type") or "").lower()
    out: dict[str, Any] = {"type": qtype, "confidence": _float_or_none(data.get("confidence"))}
    if qtype == "noul":
        out["noul"] = _float_or_none(data.get("noul"))
    elif qtype == "choice":
        out["choice"] = data.get("choice")
        out["probabilities"] = {str(k): _float_or_none(v) for k, v in dict(data.get("probabilities") or {}).items()}
    elif qtype == "score":
        out["score"] = _float_or_none(data.get("score"))
        out["legend"] = {str(k): str(v) for k, v in dict(data.get("legend") or {}).items()}
        out["probabilities"] = {str(k): _float_or_none(v) for k, v in dict(data.get("probabilities") or {}).items()}
    else:
        out["raw"] = data
    return out


def _answer_from_laya(raw: Any, qtype: str) -> dict[str, Any]:
    """Normaliza uma resposta da Laya para o mesmo shape de DecisionAnswer."""
    data = _as_dict(raw)
    out: dict[str, Any] = {"type": qtype, "confidence": _float_or_none(data.get("confidence"))}
    if qtype == "noul":
        out["noul"] = _float_or_none(data.get("noul", data.get("probability", data.get("value"))))
    elif qtype == "choice":
        out["choice"] = data.get("choice", data.get("answer"))
    elif qtype == "score":
        out["score"] = _float_or_none(data.get("score", data.get("value")))
    return out


def _laya_answers(pred: Any, questions: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Extrai answers por questao do resultado bruto da Laya predict."""
    raw = getattr(pred, "answers", None)
    inner = raw.get("answers", raw) if isinstance(raw, dict) else {}
    answers: dict[str, Any] = {}
    for qid, spec in questions.items():
        qtype = str(spec.get("type") or "")
        entry = inner.get(qid) if isinstance(inner, dict) else None
        if entry is None:
            # fallback: campos agregados do LayaPrediction
            entry = {
                "noul": getattr(pred, "noul", None),
                "choice": getattr(pred, "choice", None),
                "score": getattr(pred, "score", None),
                "confidence": getattr(pred, "confidence", None),
            }
        answers[qid] = _answer_from_laya(entry, qtype)
    return answers


def _provenia_gemini(model: str, latency_ms: float, n_tokens: int, multimodal: bool) -> Provenia:
    return Provenia(
        engine_id="gemini-decision-1",
        implementation_level="trained-model",
        runtime_used="google-genai v1beta (cloud)",
        model_used=model,
        intended_model=model,
        weights_loaded=True,
        fallback_used=False,
        assumptions=[
            "decisions-api-single-forward-pass",
            "closed-set-questions-only",
            f"multimodal={multimodal}",
            f"latency_ms={latency_ms:.1f}",
            f"n_tokens={n_tokens}",
        ],
        limitations=[
            "paid-api-0.10-per-1m-input-tokens",
            "requires-GEMINI_API_KEY-or-GOOGLE_API_KEY",
            "beta-endpoint-v1beta",
        ],
        units=["ms", "n_tokens", "probability", "score"],
    )


def _provenia_laya(pred: Any) -> Provenia:
    base = getattr(pred, "provenia", None)
    if isinstance(base, Provenia):
        return Provenia(
            engine_id="laya-s1-trained",
            implementation_level=base.implementation_level,
            runtime_used=base.runtime_used,
            model_used=base.model_used,
            intended_model=base.intended_model,
            weights_loaded=base.weights_loaded,
            fallback_used=base.fallback_used,
            assumptions=[*base.assumptions, "cascata-laya-primeiro"],
            limitations=list(base.limitations),
            units=list(base.units),
        )
    return Provenia(
        engine_id="laya-s1-trained",
        implementation_level="trained-model",
        runtime_used="unknown",
        model_used="",
        intended_model="",
        weights_loaded=True,
        fallback_used=False,
        assumptions=["cascata-laya-primeiro"],
        limitations=[],
        units=["probability", "score"],
    )


class DecisionResult:
    """Resultado normalizado de uma decisao System-1 (Laya ou Gemini Decision 1)."""

    def __init__(
        self,
        answers: dict[str, dict[str, Any]],
        engine: str,
        model_used: str,
        latency_ms: float,
        n_tokens: int,
        provenia: Provenia,
    ) -> None:
        self.answers = answers
        self.engine = engine
        self.model_used = model_used
        self.latency_ms = round(latency_ms, 2)
        self.n_tokens = n_tokens
        self.provenia = provenia

    def answer(self, qid: str) -> dict[str, Any] | None:
        return self.answers.get(qid)

    def to_dict(self) -> dict[str, Any]:
        return {
            "engine": self.engine,
            "model_used": self.model_used,
            "latency_ms": self.latency_ms,
            "n_tokens": self.n_tokens,
            "answers": self.answers,
            "provenia": {
                "engine_id": self.provenia.engine_id,
                "implementation_level": self.provenia.implementation_level,
                "runtime_used": self.provenia.runtime_used,
                "model_used": self.provenia.model_used,
                "intended_model": self.provenia.intended_model,
                "weights_loaded": self.provenia.weights_loaded,
                "fallback_used": self.provenia.fallback_used,
            },
        }


def _extract_usage_n_tokens(response: Any) -> int:
    usage = _as_dict(getattr(response, "usage", None)) if response is not None else {}
    for key in ("total_tokens", "totalTokenCount", "total"):
        val = _float_or_none(usage.get(key))
        if val is not None:
            return int(val)
    return 0


def _status_code_of(err: BaseException) -> int:
    """Extrai HTTP status de erros do SDK genai de forma defensiva."""
    code = getattr(err, "code", None)
    if isinstance(code, int):
        return code
    status = getattr(err, "status_code", None)
    if isinstance(status, int):
        return status
    return 0


def decide(
    state: Any,
    questions: dict[str, dict[str, Any]],
    client: GeminiDecisionsClient | None = None,
) -> DecisionResult:
    """Executa a Decisions API com failover pelo pool 'decision'.

    Tenta cada chave candidata em ordem; 401/403/429/5xx marcam circuit
    breaker no pool e rotacionam. Erros de validacao (400) nao rotacionam
    -- sao deterministicos e falhariam igual com outra chave.
    """
    inicio = time.perf_counter()
    normalized = normalize_questions(questions)
    cli = client or GeminiDecisionsClient()
    keys = cli.api_keys or [""]
    last_err: Exception | None = None

    for api_key in keys:
        try:
            response = cli.create(state, normalized, key=api_key)
            break
        except Exception as e:  # pylint: disable=broad-except
            last_err = e
            status = _status_code_of(e)
            if status == 400 or not status:
                raise
            decision_pool_manager.mark_failure(api_key, status_code=status)
            logger.debug("[gemini-decisions] chave sha8=%.8s falhou HTTP %s; failover.", _sha8(api_key), status)
    else:
        raise RuntimeError(f"[gemini-decisions] pool '{DECISION_POOL_NAME}' sem chave saudavel.") from last_err

    if response is None:  # pragma: no cover - defensivo
        raise RuntimeError("[gemini-decisions] resposta vazia do SDK.")
    latency_ms = (time.perf_counter() - inicio) * 1000.0

    raw_answers = _as_dict(getattr(response, "answers", None) or getattr(response, "answers", {}))
    answers = {qid: _answer_from_gemini(raw_answers.get(qid)) for qid in normalized}
    n_tokens = _extract_usage_n_tokens(response)

    return DecisionResult(
        answers=answers,
        engine="gemini-decision-1",
        model_used=cli.model,
        latency_ms=latency_ms,
        n_tokens=n_tokens,
        provenia=_provenia_gemini(cli.model, latency_ms, n_tokens, is_multimodal_input(state)),
    )


def _gemini_available(client: GeminiDecisionsClient | None) -> bool:
    cli = client or GeminiDecisionsClient()
    return cli.is_configured


def decide_s1(
    state: Any,
    questions: dict[str, dict[str, Any]],
    client: GeminiDecisionsClient | None = None,
    prefer_cloud: bool = False,
) -> DecisionResult:
    """Cascata System-1: Laya local primeiro, Gemini Decision 1 como escalonamento.

    Regras medidas:
      - input multimodal (lista de blocos / dict) -> Gemini direto
        (a Laya so processa texto);
      - ``prefer_cloud=True`` -> Gemini direto (benchmark/validacao);
      - texto-only -> ``laya_predict``; se a provenia marcar ``fallback_used``
        (CPU-gated ou checkpoint ausente), escala para a Decisions API quando
        configurada; caso contrario devolve o resultado heuristico da Laya com
        proveniencia explicita.
    """
    cli = client or GeminiDecisionsClient()
    multimodal = is_multimodal_input(state)

    if multimodal or prefer_cloud:
        return decide(state, questions, client=cli)

    try:
        pred = laya_predict(state, questions=dict(questions))
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[gemini-decisions] laya_predict falhou (%s); escalando.", e)
        pred = None

    if pred is not None and not getattr(getattr(pred, "provenia", None), "fallback_used", True):
        answers = _laya_answers(pred, questions)
        return DecisionResult(
            answers=answers,
            engine="laya-s1-trained",
            model_used=str(getattr(pred, "model_used", "") or ""),
            latency_ms=float(getattr(pred, "latency_ms", 0.0) or 0.0),
            n_tokens=int(getattr(pred, "n_tokens", 0) or 0),
            provenia=_provenia_laya(pred),
        )

    # Laya indisponivel/gated: escalona para a nuvem se configurada.
    if cli.is_configured:
        logger.debug("[gemini-decisions] laya em fallback; escalando para %s.", cli.model)
        return decide(state, questions, client=cli)

    # Sem nuvem: devolve o resultado Laya (mesmo heuristico) com proveniencia honesta.
    if pred is not None:
        answers = _laya_answers(pred, questions)
        return DecisionResult(
            answers=answers,
            engine="laya-s1-fallback",
            model_used=str(getattr(pred, "model_used", "") or ""),
            latency_ms=float(getattr(pred, "latency_ms", 0.0) or 0.0),
            n_tokens=int(getattr(pred, "n_tokens", 0) or 0),
            provenia=_provenia_laya(pred),
        )
    raise RuntimeError("Nenhum motor de decisao disponivel: Laya falhou e GeminiDecisionsClient sem chave.")


def decisions_available() -> bool:
    """True quando ha chave Gemini configurada para a Decisions API."""
    return bool(_resolve_api_key())
