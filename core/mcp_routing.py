"""Roteamento de addons MCP por intencao, com carregamento sob demanda.

Este modulo nao abre conexoes MCP. Ele transforma a descricao de uma tarefa em
uma decisao pequena, serializavel e auditavel para que o cliente que ja possui
os servidores registrados saiba quais capacidades deve priorizar.

A politica vive em ``data/system_config.json`` e e consumida pelo caminho
quente de roteamento. Assim, catalogo/configuracao nao e confundido com uso
runtime: a decisao aqui apenas prepara a tarefa; a execucao do MCP continua
dependente de a ferramenta estar registrada e disponivel na sessao.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
import re
from typing import Any

from utils.heuristics import _calculate_heuristic_score
from utils.text import enforce_pure_ascii

MCP_SELECTED_KEY = "mcp_addons_selected"
MCP_SCORES_KEY = "mcp_addon_scores"
MCP_REASONS_KEY = "mcp_addon_reason_codes"
MCP_POLICY_KEY = "mcp_addon_policy"
MCP_OUTPUT_KEYS = frozenset({MCP_SELECTED_KEY, MCP_SCORES_KEY, MCP_REASONS_KEY, MCP_POLICY_KEY})


@dataclass(frozen=True)
class MCPAddonDecision:
    """Resultado puro do roteamento de addons MCP."""

    selected: tuple[str, ...]
    scores: Mapping[str, int]
    reason_codes: tuple[str, ...]
    explicit: tuple[str, ...] = ()
    policy_mode: str = "lazy"

    def to_metadata(self) -> dict[str, Any]:
        """Converte a decisao para o contrato JSON persistido na fila."""
        return {
            MCP_SELECTED_KEY: list(self.selected),
            MCP_SCORES_KEY: dict(self.scores),
            MCP_REASONS_KEY: list(self.reason_codes),
            MCP_POLICY_KEY: self.policy_mode,
        }


def _configured_policy(policy: Mapping[str, Any] | None = None) -> Mapping[str, Any]:
    if policy is not None:
        return policy

    try:
        # Import tardio evita acoplamento circular no cold-start do core.
        from core import config  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        configured = getattr(config, "MCP_ADDON_ROUTING", {})
    except (ImportError, AttributeError):
        configured = {}
    return configured if isinstance(configured, Mapping) else {}


def _safe_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalise_text(value: Any) -> str:
    return enforce_pure_ascii(str(value or "")).lower()


def _normalise_names(value: Any) -> tuple[str, ...]:
    if isinstance(value, str):
        raw_values = [value]
    elif isinstance(value, (list, tuple, set)):
        raw_values = list(value)
    else:
        raw_values = []

    names: list[str] = []
    for raw in raw_values:
        name = str(raw).strip()
        if name and name not in names:
            names.append(name)
    return tuple(names)


def _normalise_terms(value: Any) -> dict[str, int]:
    if not isinstance(value, Mapping):
        return {}

    terms: dict[str, int] = {}
    for raw_term, raw_weight in value.items():
        term = _normalise_text(raw_term).strip()
        if not term:
            continue
        weight = _safe_int(raw_weight, 0)
        if weight > 0:
            terms[term] = weight
    return terms


def _normalise_term_list(value: Any) -> tuple[str, ...]:
    if isinstance(value, str):
        values = [value]
    elif isinstance(value, (list, tuple, set)):
        values = list(value)
    else:
        values = []
    return tuple(term for term in (_normalise_text(item).strip() for item in values) if term)


def _contains_term(text: str, term: str) -> bool:
    if not term:
        return False
    return bool(re.search(r"\b" + re.escape(term), text, re.IGNORECASE))


def _rule_order(rule: Mapping[str, Any], name: str) -> tuple[int, str]:
    return _safe_int(rule.get("order"), 100), name


CandidateItem = tuple[tuple[int, str], str, int, str]


def _is_mcp_disabled(metadata_map: Mapping[str, Any], configured: Mapping[str, Any]) -> str | None:
    task_mode = str(metadata_map.get("mcp_addons_mode", "")).strip().lower()
    if metadata_map.get("mcp_addons_disabled") or task_mode in {"off", "disabled", "none"}:
        return "mcp_disabled_by_task"
    if configured.get("enabled", True) is False:
        return "mcp_policy_disabled"
    return None


def _is_explicit_request(name: str, text: str, rule: Mapping[str, Any], known_requested: tuple[str, ...]) -> bool:
    if name in known_requested:
        return True
    explicit_terms = _normalise_term_list(rule.get("explicit_terms"))
    return any(_contains_term(text, term) for term in explicit_terms)


def _is_rule_blocked(text: str, rule: Mapping[str, Any], is_explicit: bool) -> bool:
    if is_explicit or not rule.get("block_without_explicit"):
        return False
    blocked_terms = _normalise_term_list(rule.get("blocked_terms"))
    return any(_contains_term(text, term) for term in blocked_terms)


def _is_long_task(text: str, rule: Mapping[str, Any]) -> bool:
    minimum_words = max(0, _safe_int(rule.get("minimum_words"), 0))
    return minimum_words > 0 and len(text.split()) >= minimum_words


def _build_candidate_item(
    name: str,
    raw_rule: Mapping[str, Any],
    is_explicit: bool,
    known_requested: tuple[str, ...],
    score: int,
    threshold: int,
    long_task: bool,
) -> CandidateItem:
    order_key = _rule_order(raw_rule, name)
    if is_explicit:
        reason = f"mcp_explicit:{name}" if name in known_requested else f"mcp_intent:{name}"
        return order_key, name, max(score, threshold), reason

    reason = f"mcp_auto:{name}:long_task" if long_task and score < threshold else f"mcp_auto:{name}:score_{score}"
    candidate_score = max(score, threshold) if long_task else score
    return order_key, name, candidate_score, reason


def _compute_recorded_score(
    score: int,
    threshold: int,
    is_explicit: bool,
    long_task: bool,
) -> int | None:
    if score > 0 or is_explicit:
        return max(score, threshold if is_explicit or long_task else score)
    if long_task:
        return threshold
    return None


def _evaluate_addon_candidate(
    name: str,
    raw_rule: Mapping[str, Any],
    text: str,
    known_requested: tuple[str, ...],
    default_threshold: int,
) -> tuple[bool, CandidateItem | None, int | None]:
    is_explicit = _is_explicit_request(name, text, raw_rule, known_requested)
    if _is_rule_blocked(text, raw_rule, is_explicit):
        return is_explicit, None, None

    terms = _normalise_terms(raw_rule.get("terms"))
    score = _calculate_heuristic_score(text, terms) if terms else 0
    threshold = _safe_int(raw_rule.get("minimum_score"), default_threshold)
    long_task = _is_long_task(text, raw_rule)

    if not is_explicit and score < threshold and not long_task:
        return is_explicit, None, None

    candidate = _build_candidate_item(name, raw_rule, is_explicit, known_requested, score, threshold, long_task)
    recorded_score = _compute_recorded_score(score, threshold, is_explicit, long_task)
    return is_explicit, candidate, recorded_score


def resolve_mcp_addons(
    description: str,
    metadata: Mapping[str, Any] | None = None,
    *,
    policy: Mapping[str, Any] | None = None,
) -> MCPAddonDecision:
    """Seleciona addons MCP relevantes sem executar nenhuma ferramenta.

    A selecao automatica usa score e limite por addon. Um pedido explicito em
    ``metadata.mcp_addons`` prevalece sobre o score; ``mcp_addons_mode=off``
    continua sendo um opt-out valido para tarefas que nao podem usar MCP.
    Contextos locais como SQLite, ChromaDB e LanceDB bloqueiam Neon quando o
    usuario nao pediu Neon/PostgreSQL explicitamente.
    """
    configured = _configured_policy(policy)
    mode = str(configured.get("mode", "lazy")).strip().lower() or "lazy"
    metadata_map = metadata if isinstance(metadata, Mapping) else {}
    requested = _normalise_names(metadata_map.get("mcp_addons"))

    addons_raw = configured.get("addons", {})
    addons = addons_raw if isinstance(addons_raw, Mapping) else {}
    known_requested = tuple(name for name in requested if name in addons)

    disabled_reason = _is_mcp_disabled(metadata_map, configured)
    if disabled_reason:
        return MCPAddonDecision((), {}, (disabled_reason,), known_requested, mode)

    text = _normalise_text(description)
    auto_candidates: list[CandidateItem] = []
    explicit_candidates: list[CandidateItem] = []
    scores: dict[str, int] = {}

    default_threshold = _safe_int(configured.get("default_threshold"), 2)
    for raw_name, raw_rule in addons.items():
        name = str(raw_name).strip()
        if not name or not isinstance(raw_rule, Mapping):
            continue

        is_explicit, candidate, recorded_score = _evaluate_addon_candidate(
            name, raw_rule, text, known_requested, default_threshold
        )
        if candidate is None:
            continue

        target_list = explicit_candidates if is_explicit else auto_candidates
        target_list.append(candidate)

        if recorded_score is not None:
            scores[name] = recorded_score

    explicit_candidates.sort(key=lambda item: item[0])
    auto_candidates.sort(key=lambda item: (item[0], -item[2]))
    max_auto = max(0, _safe_int(configured.get("max_auto_addons"), 3))
    chosen = explicit_candidates + auto_candidates[:max_auto]
    chosen.sort(key=lambda item: item[0])

    return MCPAddonDecision(
        selected=tuple(item[1] for item in chosen),
        scores=scores,
        reason_codes=tuple(item[3] for item in chosen),
        explicit=known_requested,
        policy_mode=mode,
    )


def apply_mcp_addon_routing(description: str, metadata: Mapping[str, Any] | None = None) -> dict[str, Any]:
    """Recalcula e aplica o plano MCP sem carregar heranca obsoleta.

    Subtarefas herdam metadata do pai. As chaves de resultado sao removidas e
    recalculadas para a descricao da subtask; pedidos explicitos em
    ``mcp_addons`` permanecem, por serem intencao declarada do operador.
    """
    current = dict(metadata or {})
    had_previous_decision = any(key in current for key in MCP_OUTPUT_KEYS)
    decision = resolve_mcp_addons(description, current)

    for key in MCP_OUTPUT_KEYS:
        current.pop(key, None)

    if decision.selected or decision.explicit or had_previous_decision:
        current.update(decision.to_metadata())
    return current


def mcp_addon_prompt_data(decision: MCPAddonDecision) -> list[tuple[str, str]]:
    """Retorna nome e instruacao compacta para o builder de contexto."""
    configured = _configured_policy()
    addons_raw = configured.get("addons", {})
    addons = addons_raw if isinstance(addons_raw, Mapping) else {}
    result: list[tuple[str, str]] = []
    for name in decision.selected:
        rule = addons.get(name, {})
        if not isinstance(rule, Mapping):
            continue
        instruction = str(rule.get("prompt") or rule.get("purpose") or "Use o addon somente quando pertinente.")
        result.append((name, enforce_pure_ascii(instruction)))
    return result
