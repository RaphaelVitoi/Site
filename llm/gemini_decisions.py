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
from llm.laya_bridge import Provenia, laya_predict, laya_predict_remote

__all__ = [
    "DECISIONS_API_VERSION",
    "GEMINI_DECISION_MODEL",
    "MAX_CHOICE_OPTIONS",
    "MAX_DECISION_QUESTIONS",
    "MAX_SCORE_LEVELS",
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
MAX_SCORE_LEVELS: int = 255
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
        if decision_pool_manager.has_credentials:
            # Credenciais existem mas estao todas em cooldown/revogacao:
            # reload() reconstruiria os estados e apagaria os bloqueios.
            return []
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


_MEDIA_PART_TYPES: frozenset[str] = frozenset(
    {
        "image",
        "img",
        "audio",
        "video",
        "pdf",
        "file",
        "media",
        "blob",
        "binary",
        "document",
        "inline_data",
        "file_data",
    }
)
_MEDIA_DATA_KEYS: frozenset[str] = frozenset(
    {
        "inline_data",
        "inlinedata",
        "file_data",
        "filedata",
        "image_url",
        "image",
        "audio",
        "video",
        "pdf",
        "media",
        "blob",
    }
)
_MEDIA_MIME_PREFIXES: tuple[str, ...] = ("image/", "audio/", "video/", "application/pdf")
_MAX_MEDIA_SCAN_DEPTH: int = 8


def _dict_tem_marcador_midia(obj: Any, depth: int = 0) -> bool:
    """Varredura recursiva por marcadores de midia reais (chaves de blob, tipos
    de parte de midia e mime_type midia). Dicts de estado arbitrarios
    (ex.: ``{"pot": 100, "street": "flop"}``) NAO sao multimodais -- so
    conteudo explicitamente binario/midia escala para a nuvem."""
    if depth > _MAX_MEDIA_SCAN_DEPTH:
        return False
    if isinstance(obj, dict):
        part_type = obj.get("type")
        if isinstance(part_type, str) and part_type.strip().lower() in _MEDIA_PART_TYPES:
            return True
        mime = obj.get("mime_type") or obj.get("mimetype")
        if isinstance(mime, str) and mime.strip().lower().startswith(_MEDIA_MIME_PREFIXES):
            return True
        for key, value in obj.items():
            if str(key).lower() in _MEDIA_DATA_KEYS and value:
                return True
            if _dict_tem_marcador_midia(value, depth + 1):
                return True
    elif isinstance(obj, (list, tuple)):
        return any(_dict_tem_marcador_midia(item, depth + 1) for item in obj)
    return False


def is_multimodal_input(state: Any) -> bool:
    """True quando ``state`` carrega conteudo multimodal de verdade.

    - ``str`` -> texto puro;
    - ``list``/``tuple`` -> blocos de conteudo: qualquer parte dict com
      ``type`` nao-texto (semantica original de content-parts) ou marcador
      de midia aninhado;
    - ``dict`` -> somente com marcador de midia explicito (chave de blob,
      ``type`` de midia, ``mime_type`` midia) -- dicts textuais/estruturados
      seguem o caminho local da Laya.
    """
    if isinstance(state, str):
        return False
    if isinstance(state, (list, tuple)):
        return any(
            isinstance(b, dict) and b.get("type") not in (None, "text") for b in state
        ) or _dict_tem_marcador_midia(state)
    if isinstance(state, dict):
        return _dict_tem_marcador_midia(state)
    return False


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
    if not isinstance(criteria, list) or not (2 <= len(criteria) <= MAX_SCORE_LEVELS):
        raise ValueError(
            f"questions[{qid!r}].criteria (score) deve ser lista ordenada com 2..{MAX_SCORE_LEVELS} niveis (rubrica)."
        )
    return [str(c) for c in criteria]


_CRITERIA_NORMALIZERS: dict[str, Any] = {
    "noul": _norm_noul_criteria,
    "choice": _norm_choice_criteria,
    "score": _norm_score_criteria,
}


def _normalize_question_entry(qid: Any, spec: Any) -> dict[str, Any]:
    """Valida um item de ``questions`` e devolve a entrada normalizada."""
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
    return item


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
    return {qid: _normalize_question_entry(qid, spec) for qid, spec in questions.items()}


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
        # ``None`` = cliente gerido pelo pool: as candidatas sao resolvidas a
        # cada chamada, para que cooldown/revogacao entre tentativas seja
        # respeitado em vez de reutilizar um snapshot congelado no __init__.
        if api_keys is not None:
            self._explicit_keys: list[str] | None = list(dict.fromkeys(k for k in api_keys if k))
        elif api_key is not None:
            self._explicit_keys = [api_key] if api_key else []
        else:
            self._explicit_keys = None
        self._api_keys = _resolve_api_keys() if self._explicit_keys is None else list(self._explicit_keys)
        self._model = model
        self._clients: dict[str, Any] = {}

    def _candidate_keys(self) -> list[str]:
        """Candidatas vigentes: explicitas preservadas (mesmo fora do pool);
        pool-managed consulta ``iter_candidate_keys`` a cada chamada."""
        if self._explicit_keys is not None:
            return list(self._explicit_keys)
        return _resolve_api_keys()

    @property
    def is_configured(self) -> bool:
        return any(self._candidate_keys())

    @property
    def model(self) -> str:
        return self._model

    @property
    def api_keys(self) -> list[str]:
        return self._candidate_keys()

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
        api_key = key or next(iter(self._candidate_keys()), "")
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
    type_counts: dict[str, int] = {}
    for spec in questions.values():
        qtype = str(spec.get("type") or "")
        type_counts[qtype] = type_counts.get(qtype, 0) + 1
    answers: dict[str, Any] = {}
    for qid, spec in questions.items():
        qtype = str(spec.get("type") or "")
        entry = inner.get(qid) if isinstance(inner, dict) else None
        if entry is None:
            if type_counts.get(qtype, 0) != 1:
                # O agregado do pred (noul/choice/score unico) nao da para
                # associar inequivocamente a esta pergunta -- trata como
                # ausente em vez de fabricar uma resposta.
                continue
            # fallback: campos agregados do LayaPrediction
            entry = {
                "noul": getattr(pred, "noul", None),
                "choice": getattr(pred, "choice", None),
                "score": getattr(pred, "score", None),
                "confidence": getattr(pred, "confidence", None),
            }
        answers[qid] = _answer_from_laya(entry, qtype)
    return answers


def _laya_answer_present(answer: dict[str, Any], qtype: str) -> bool:
    """True quando a resposta tem valor no campo do tipo da pergunta.

    ``0``/``0.0`` sao respostas validas; somente ``None`` (ou campo ausente)
    conta como resposta faltante.
    """
    if qtype not in ("noul", "choice", "score"):
        return True
    return answer.get(qtype) is not None


def _laya_missing(answers: dict[str, Any], questions: dict[str, dict[str, Any]]) -> list[str]:
    """Qids sem resposta utilizavel: ausentes de ``answers`` ou com o campo
    do tipo ``None`` (``0`` segue valido)."""
    return [
        qid
        for qid, spec in questions.items()
        if qid not in answers or not _laya_answer_present(answers[qid], str(spec.get("type") or ""))
    ]


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


def _provenia_laya(pred: Any, engine_id: str = "laya-s1-trained") -> Provenia:
    base = getattr(pred, "provenia", None)
    if isinstance(base, Provenia):
        return Provenia(
            engine_id=engine_id,
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
        engine_id=engine_id,
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


def _raise_if_project_quota(err: Exception, api_key: str, remaining_keys: list[str]) -> None:
    """HTTP 429 aborta o failover somente com projeto comprovado em TODAS as restantes.

    Cota e por PROJETO: se a chave que falhou e as candidatas restantes tem a
    mesma associacao de projeto (``project_of``), insistir e inutil. Chaves sem
    associacao (fora do pool) ou de projeto divergente seguem sendo tentadas.
    """
    failed_project = decision_pool_manager.project_of(api_key)
    if failed_project and all(decision_pool_manager.project_of(k) == failed_project for k in remaining_keys):
        raise RuntimeError(
            f"[gemini-decisions] HTTP 429: cota do projeto "
            f"'{decision_pool_manager.project_name}' esgotada; cooldown aplicado pelo pool."
        ) from err


def _create_with_key_failover(
    cli: GeminiDecisionsClient,
    state: Any,
    normalized: dict[str, dict[str, Any]],
):
    """Failover por chave do pool 'decision': 4xx/429/5xx marcam breaker e rotacionam.

    Erros de validacao (400) e erros sem status nao rotacionam -- sao
    deterministicos e falhariam igual com outra chave.
    """
    keys = cli.api_keys
    if not keys:
        raise RuntimeError(f"[gemini-decisions] pool '{DECISION_POOL_NAME}' sem chave saudavel.")
    last_err: Exception | None = None
    for idx, api_key in enumerate(keys):
        try:
            return cli.create(state, normalized, key=api_key)
        except Exception as e:  # pylint: disable=broad-except
            last_err = e
            status = _status_code_of(e)
            if status == 400 or not status:
                raise
            decision_pool_manager.mark_failure(api_key, status_code=status)
            if status == 429:
                _raise_if_project_quota(e, api_key, keys[idx + 1 :])
            logger.debug("[gemini-decisions] chave sha8=%.8s falhou HTTP %s; failover.", _sha8(api_key), status)
    raise RuntimeError(f"[gemini-decisions] pool '{DECISION_POOL_NAME}' sem chave saudavel.") from last_err


def _gemini_answer_present(raw: Any, qtype: str) -> bool:
    """True quando a Answer tem valor no campo do tipo (``0``/``False`` validos;
    ``None`` ou campo ausente conta como resposta faltante)."""
    field = {"noul": "noul", "choice": "choice", "score": "score"}.get(qtype)
    if field is None:
        return raw is not None
    return _as_dict(raw).get(field) is not None


def _validated_answers(response: Any, normalized: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Extrai ``answers`` do response; rejeita prompt bloqueado e respostas
    sem o valor de decisao do tipo (ex.: ``choice``/``noul``/``score`` nulos)."""
    feedback = _as_dict(getattr(response, "prompt_feedback", None) or getattr(response, "promptFeedback", None))
    block_reason = feedback.get("block_reason") or feedback.get("blockReason")
    if block_reason:
        raise RuntimeError(f"[gemini-decisions] prompt bloqueado pela Decisions API: {block_reason}")

    raw_answers = _as_dict(getattr(response, "answers", None))
    missing = [
        qid
        for qid, spec in normalized.items()
        if not _gemini_answer_present(raw_answers.get(qid), str(spec.get("type") or ""))
    ]
    if missing:
        raise RuntimeError(f"[gemini-decisions] Decisions API omitiu respostas para: {', '.join(missing)}.")
    return {qid: _answer_from_gemini(raw_answers[qid]) for qid in normalized}


def decide(
    state: Any,
    questions: dict[str, dict[str, Any]],
    client: GeminiDecisionsClient | None = None,
) -> DecisionResult:
    """Executa a Decisions API com failover pelo pool 'decision'."""
    inicio = time.perf_counter()
    normalized = normalize_questions(questions)
    cli = client or GeminiDecisionsClient()
    response = _create_with_key_failover(cli, state, normalized)
    if response is None:  # pragma: no cover - defensivo
        raise RuntimeError("[gemini-decisions] resposta vazia do SDK.")
    latency_ms = (time.perf_counter() - inicio) * 1000.0

    answers = _validated_answers(response, normalized)
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


def _laya_decision_result(pred: Any, questions: dict[str, dict[str, Any]], engine: str) -> DecisionResult:
    """DecisionResult a partir de um ``laya_predict`` (engine ``laya-s1-trained`` ou ``-fallback``).

    Resposta incompta nunca vira decisao: qid sem valor no campo do tipo
    levanta erro explicito em vez de devolver ``DecisionResult`` vazio.
    """
    answers = _laya_answers(pred, questions)
    missing = _laya_missing(answers, questions)
    if missing:
        raise RuntimeError(f"[gemini-decisions] Laya ({engine}) sem respostas para {missing}.")
    return DecisionResult(
        answers=answers,
        engine=engine,
        model_used=str(getattr(pred, "model_used", "") or ""),
        latency_ms=float(getattr(pred, "latency_ms", 0.0) or 0.0),
        n_tokens=int(getattr(pred, "n_tokens", 0) or 0),
        provenia=_provenia_laya(pred, engine_id=engine),
    )


def _laya_predict_com_servico(
    state: Any,
    questions: dict[str, dict[str, Any]],
) -> Any:
    """Predict System-1 local com degrau de microservico HTTP (:8192).

    Ordem:
      - ``CHICO_LAYA_PREFER_SERVICE=1`` -> microservico primeiro (pesos quentes);
      - ``laya_predict`` in-process (GPU/custo zero);
      - se o resultado esta em ``fallback_used`` (CPU-gated/checkpoint ausente)
        ou falhou, o microservico dedicado e sondado -- neste host (RX 570 sem
        CUDA) e o unico caminho que executa o checkpoint 322M de verdade.
    O microservico nunca e consultado quando o caminho in-process ja entregou
    predição treinada -- o fast path local permanece intocado.
    """
    if os.environ.get("CHICO_LAYA_PREFER_SERVICE", "0") == "1":
        remote = laya_predict_remote(state, questions=dict(questions))
        if remote is not None and not getattr(remote.provenia, "fallback_used", True):
            return remote
    try:
        pred = laya_predict(state, questions=dict(questions))
    except Exception as e:  # pylint: disable=broad-except
        logger.debug("[gemini-decisions] laya_predict falhou (%s).", e)
        pred = None
    if pred is not None and not getattr(getattr(pred, "provenia", None), "fallback_used", True):
        return pred
    remote = laya_predict_remote(state, questions=dict(questions))
    if remote is not None:
        return remote
    return pred


def decide_s1(
    state: Any,
    questions: dict[str, dict[str, Any]],
    client: GeminiDecisionsClient | None = None,
    prefer_cloud: bool = False,
) -> DecisionResult:
    """Cascata System-1: Laya local primeiro, Gemini Decision 1 como escalonamento.

    Regras medidas:
      - input multimodal (lista de blocos / dict com marcador de midia) ->
        Gemini direto (a Laya so processa texto);
      - ``prefer_cloud=True`` -> Gemini direto (benchmark/validacao);
      - ``questions`` e validada/normalizada uma unica vez no topo
        (``normalize_questions``) -- formato invalido falha antes de qualquer
        motor ser acionado;
      - texto-only -> ``laya_predict`` in-process, com degrau de microservico
        HTTP :8192 quando o caminho local esta em fallback; se a provenia
        marcar ``fallback_used``, escala para a Decisions API quando
        configurada; caso contrario devolve o resultado heuristico da Laya com
        proveniencia explicita.
    """
    cli = client or GeminiDecisionsClient()
    normalized = normalize_questions(questions)
    multimodal = is_multimodal_input(state)

    if multimodal or prefer_cloud:
        return decide(state, normalized, client=cli)

    pred = _laya_predict_com_servico(state, questions)

    if pred is not None and not getattr(getattr(pred, "provenia", None), "fallback_used", True):
        answers = _laya_answers(pred, normalized)
        missing = _laya_missing(answers, normalized)
        if not missing:
            return _laya_decision_result(pred, normalized, engine="laya-s1-trained")
        # Answers ausentes/ambiguos nao sustentam uma decisao: escala para a
        # nuvem quando configurada; sem nuvem, falha explicita em vez de
        # devolver um laya-s1-trained incompleto.
        logger.debug("[gemini-decisions] laya sem answers para %s; escalando/falhando.", missing)
        if cli.is_configured:
            return decide(state, normalized, client=cli)
        raise RuntimeError(f"[gemini-decisions] Laya sem respostas para {missing} e GeminiDecisionsClient sem chave.")

    # Laya indisponivel/gated: escalona para a nuvem se configurada.
    if cli.is_configured:
        logger.debug("[gemini-decisions] laya em fallback; escalando para %s.", cli.model)
        return decide(state, normalized, client=cli)

    # Sem nuvem: devolve o resultado Laya (mesmo heuristico) com proveniencia honesta.
    if pred is not None:
        return _laya_decision_result(pred, normalized, engine="laya-s1-fallback")
    raise RuntimeError("Nenhum motor de decisao disponivel: Laya falhou e GeminiDecisionsClient sem chave.")


def decisions_available() -> bool:
    """True quando ha chave Gemini configurada para a Decisions API."""
    return bool(_resolve_api_key())
