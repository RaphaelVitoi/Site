import asyncio
import aiohttp
import aiosqlite
import sqlite3
import logging
import os
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from database.queue_manager import QueueManager
from core.schemas import Task


import core.runtime as te


def _infer_provider_for_model(model: str) -> Optional[str]:
    model_l = str(model).lower()
    if "claude" in model_l or model_l.startswith("anthropic/"):
        return "anthropic"
    if "gemini" in model_l:
        return "gemini"
    if "/" in model_l:
        return "openrouter"
    return None


def _reorder_models_for_economy(models: List[str], prefer_local: bool = False, designated_model: Optional[str] = None) -> List[str]:
    if not models:
        return models
    # SOTA: O fallback de emergencia bypassa a chave de configuracao financeira
    if not te._feature_enabled("prefer_cost_saving_mode") and not prefer_local:
        return models

    def score(model: str) -> int:
        m = str(model).lower()
        if designated_model and m == designated_model.lower():
            return -1  # SOTA: Soberania do Manifesto do Agente.

        if prefer_local:
            if ":free" in m or "local" in m:
                return 0
            if "deepseek-r1" in m:
                return 1
            if "gemini-2.0-flash" in m:
                return 2
            return 10

        # SOTA: Mapeamento de Valor Cognitivo vs Economia
        # Prioridade 0: Gemini Flash (Pilar de Velocidade/Economia)
        if "gemini-2.0-flash" in m:
            return 0
        # Prioridade 1: Gemini 1.5 Pro (Pilar de Raciocinio Profundo)
        if "gemini-1.5-pro" in m:
            return 1
        # Prioridade 2: DeepSeek R1 (Pilar de Verificacao Externa/Livre)
        if "deepseek-r1" in m:
            return 2
        # Prioridade 3: Modelos Free Tier genericos (Llama/Qwen)
        if ":free" in m:
            return 3

        # Fallbacks e Provedores Pagos (Ultima Instancia)
        p = _infer_provider_for_model(model)
        if p == "openrouter":
            return 8
        if p == "anthropic":
            return 10 if te._feature_enabled("anthropic_last") else 9
        return 9

    return sorted(models, key=lambda m: score(m))


def _inject_openrouter_alternatives(models: List[str]) -> List[str]:
    OPENROUTER_ALTERNATIVE_MODELS = te.OPENROUTER_ALTERNATIVE_MODELS
    if not OPENROUTER_ALTERNATIVE_MODELS:
        return models
    merged = list(models)
    insert_at = len(merged)
    for candidate in OPENROUTER_ALTERNATIVE_MODELS:
        candidate = str(candidate).strip()
        if not candidate or candidate in merged:
            continue
        if _infer_provider_for_model(candidate) != "openrouter":
            continue
        merged.insert(insert_at, candidate)
        insert_at += 1
    return merged


async def _get_model_recent_health(provider: str, model: str, manager: QueueManager, window_minutes: int) -> Dict[str, float]:
    cutoff = (datetime.now() - timedelta(minutes=window_minutes)).isoformat()
    async with aiosqlite.connect(manager.db_path) as db:
        db.row_factory = sqlite3.Row
        async with db.execute("""
            SELECT
                COUNT(*) AS attempts,
                SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes
            FROM key_usage_metrics
            WHERE provider = ? AND model = ? AND timestamp >= ?
        """, (provider, model, cutoff)) as cursor:
            row = await cursor.fetchone()

    attempts = int((row["attempts"] or 0) if row else 0)
    successes = int((row["successes"] or 0) if row else 0)
    success_rate_pct = (float(successes) / float(attempts) * 100.0) if attempts else 0.0
    return {
        "attempts": attempts,
        "successes": successes,
        "success_rate_pct": round(success_rate_pct, 2),
    }


async def _apply_model_health_gate(models: List[str], manager: QueueManager, task: Task) -> List[str]:
    if not bool(te._health_gate_value("enabled", True)):
        return models

    window_minutes = int(te._health_gate_value("window_minutes", 180))
    min_attempts = int(te._health_gate_value("min_attempts", 3))
    min_success_rate_pct = float(te._health_gate_value("min_success_rate_pct", 10.0))
    drop_only_free_models = bool(te._health_gate_value("drop_only_free_models", True))
    protected_models = {str(m).strip().lower() for m in te._health_gate_value("protect_models", []) if str(m).strip()}

    filtered: List[str] = []
    for model in models:
        model_l = str(model).lower()
        if model_l in protected_models:
            filtered.append(model)
            continue
        if drop_only_free_models and ":free" not in model_l:
            filtered.append(model)
            continue
        provider = _infer_provider_for_model(model)
        if provider != "openrouter":
            filtered.append(model)
            continue

        stats = await _get_model_recent_health(provider, model, manager, window_minutes)
        if stats["attempts"] < min_attempts:
            filtered.append(model)
            continue
        if stats["success_rate_pct"] < min_success_rate_pct:
            logging.warning(
                f"[[{te._c(task.agent)}]{task.agent}[/]] Model gate removeu {provider}:{model} "
                f"(attempts={stats['attempts']}, success_rate={stats['success_rate_pct']}%)."
            )
            continue
        filtered.append(model)

    if filtered:
        return filtered
    logging.warning(f"[[{te._c(task.agent)}]{task.agent}[/]] Model gate removeu todas as opcoes; mantendo rota original.")
    return models
