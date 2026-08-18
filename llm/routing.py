"""
SOTA Routing module.
Responsible for heuristic routing, model scoring, and health gating.
"""

# pylint: disable=protected-access
import logging
import sqlite3
from datetime import UTC, datetime, timedelta

import core.runtime as te
from core.schemas import Task
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

FREE_TIER_MARKER = ":free"


def _infer_provider_for_model(model: str) -> str | None:
    model_l = model.lower()
    if "gemma" in model_l and ("google/" in model_l or model_l.startswith("gemma")):
        return "local"
    if "gemini" in model_l:
        return "gemini"
    if "claude" in model_l or "anthropic" in model_l:
        return "anthropic"
    if "/" in model_l:
        return "openrouter"
    return None


def _score_local_preference(m: str, domain: str | None = None) -> int:
    if FREE_TIER_MARKER in m or "local" in m:
        return 0

    # SOTA GOLD: Prioridade por Dominio na Frota Local
    if domain == "MATH" and ("31b" in m or "gemma-4-31b" in m):
        return -5  # Prioridade absoluta para o motor 31b em matematica

    if "gemma-4" in m or "gemma4" in m:
        return 1
    if "deepseek-r1" in m:
        return 2
    if "gemini-2.5-flash" in m:
        return 3
    return 10


def _score_standard_preference(m: str, model: str, domain: str | None = None) -> int:
    # SOTA GOLD: Inversao de Soberania (Local-First) mesmo em modo Standard
    if domain == "MATH" and ("31b" in m or "gemma-4-31b" in m):
        return -5

    if "gemini-3.7" in m:
        return -4  # Prioridade SOTA maxima para Gemini 3.7 Flash Medium
    if "gemma-4" in m or "gemma4" in m:
        return 0
    if "gemini-3.1" in m:
        return 1
    if "gemini-2.5-flash" in m:
        return 2
    if "gemini-2.5-pro" in m:
        return 3
    if "deepseek-r1" in m:
        return 4
    if FREE_TIER_MARKER in m:
        return 5

    p = _infer_provider_for_model(model)
    if p == "openrouter":
        return 8
    return 9


def _score_model(model: str, prefer_local: bool, designated_model: str | None, domain: str | None = None) -> int:
    m = model.lower()
    if designated_model and m == designated_model.lower():
        return -10  # Modelo designado pelo CEO sempre vence

    if prefer_local:
        return _score_local_preference(m, domain)

    return _score_standard_preference(m, model, domain)


def _reorder_models_for_economy(
    models: list[str], prefer_local: bool = False, designated_model: str | None = None, domain: str | None = None
) -> list[str]:
    if not models:
        return models

    # SOTA GOLD: Se prefer_local for True ou se houver um dominio especifico, forca a reordenacao
    if not te._feature_enabled("prefer_cost_saving_mode") and not prefer_local and not domain:
        return models

    return sorted(models, key=lambda m: _score_model(m, prefer_local, designated_model, domain))


def _inject_openrouter_alternatives(models: list[str]) -> list[str]:
    openrouter_alternative_models = te.OPENROUTER_ALTERNATIVE_MODELS
    if not openrouter_alternative_models:
        openrouter_alternative_models = (
            "meta-llama/llama-3.3-70b-instruct:free",
            "meta-llama/llama-3.1-8b-instruct:free",
        )
    merged = list(models)
    insert_at = len(merged)
    for candidate in openrouter_alternative_models:
        candidate = str(candidate).strip()
        if not candidate or candidate in merged:
            continue
        if _infer_provider_for_model(candidate) != "openrouter":
            continue
        merged.insert(insert_at, candidate)
        insert_at += 1
    return merged


async def _get_model_recent_health(
    provider: str, model: str, manager: QueueManager, window_minutes: int
) -> dict[str, float]:
    cutoff = (datetime.now(UTC) - timedelta(minutes=window_minutes)).isoformat()
    async with manager._get_async_db() as db:
        db.row_factory = sqlite3.Row
        async with db.execute(
            """
            SELECT
                COUNT(*) AS attempts,
                SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes
            FROM key_usage_metrics
            WHERE provider = ? AND model = ? AND timestamp >= ?
        """,
            (provider, model, cutoff),
        ) as cursor:
            row = await cursor.fetchone()

    attempts = int((row["attempts"] or 0) if row else 0)
    successes = int((row["successes"] or 0) if row else 0)
    success_rate_pct = (float(successes) / float(attempts) * 100.0) if attempts else 0.0
    return {
        "attempts": attempts,
        "successes": successes,
        "success_rate_pct": round(success_rate_pct, 2),
    }


async def _apply_model_health_gate(models: list[str], manager: QueueManager, task: Task) -> list[str]:
    if not bool(te._health_gate_value("enabled", True)):
        return models

    window_minutes = int(te._health_gate_value("window_minutes", 180))
    min_attempts = int(te._health_gate_value("min_attempts", 3))
    min_success_rate_pct = float(te._health_gate_value("min_success_rate_pct", 10.0))
    drop_only_free_models = bool(te._health_gate_value("drop_only_free_models", True))
    protected_models = {str(m).strip().lower() for m in te._health_gate_value("protect_models", []) if str(m).strip()}

    filtered: list[str] = []
    for model in models:
        model_l = model.lower()
        provider = _infer_provider_for_model(model) or "unknown"

        # SOTA: Define as condicoes em que um modelo deve ser verificado.
        is_checkable = (
            provider == "openrouter"
            and model_l not in protected_models
            and not (drop_only_free_models and ":free" not in model_l)
        )

        if not is_checkable:
            filtered.append(model)
            continue

        # Logica de verificacao de saude para modelos elegiveis.
        stats = await _get_model_recent_health(provider, model, manager, window_minutes)
        if stats["attempts"] >= min_attempts and stats["success_rate_pct"] < min_success_rate_pct:
            logger.warning(
                "[[%s]%s[/]] Model gate removeu %s:%s (attempts=%s, success_rate=%s%%).",
                te._c(task.agent),
                task.agent,
                provider,
                model,
                stats["attempts"],
                stats["success_rate_pct"],
            )
        else:
            # Mantem o modelo se tiver poucas tentativas ou uma taxa de sucesso aceitavel.
            filtered.append(model)

    if filtered:
        return filtered
    logger.warning(
        "[[%s]%s[/]] Model gate removeu todas as opcoes; mantendo rota original.",
        te._c(task.agent),
        task.agent,
    )
    return models
