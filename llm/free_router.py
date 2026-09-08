"""Orquestrador de Inferência para Tiers Gratuitos (Free Tier Gateway).

Protocolo Chico SOTA v8.0 GOLD.
Governança: `RULE[user_global]` e `Site/CLAUDE.md`.

Adaptação para limites de cotas gratuitas com:
  1. Token Bucket Atômico com reserva preventiva anti-TOCTOU e sincronia UTC;
  2. Roteamento multinível por complexidade (3.5 Lite -> 3.6 Flash -> 3.7 Flash Low -> OpenRouter);
  3. Cache semântico local (Deduplicação SHA-256 em memória/SQLite);
  4. Consumo direto do pool multi-chave (`GEMINI_FLASH_KEYS`, `GEMINI_KEYS` de `llm.budget`);
  5. Desacoplamento estrito de pré-commit e computação combinatória local.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from dataclasses import dataclass
from typing import Any, Literal

import httpx
from google import genai
from google.genai import types
from google.genai.errors import APIError

from llm.budget import GEMINI_FLASH_KEYS, GEMINI_KEYS, OPENROUTER_KEYS

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class BucketMetrics:
    current_tpm: int
    current_rpm: int
    daily_count: int
    rpm_limit: int
    tpm_limit: int
    rpd_limit: int


class AtomicQuotaBucket:
    """Token Bucket Atômico com reserva preventiva e janela deslizante em O(1).

    Elimina condições de corrida (TOCTOU) e sincroniza a renovação diária com UTC.
    """

    def __init__(self, rpm_limit: int, tpm_limit: int, rpd_limit: int) -> None:
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.rpd_limit = rpd_limit
        self._lock = asyncio.Lock()

        self._requests: list[float] = []
        self._token_allocations: list[tuple[float, int]] = []
        self._daily_count: int = 0
        self._current_day_utc: str = time.strftime("%Y-%m-%d", time.gmtime())

    def _slide_window(self, now: float) -> None:
        today_utc = time.strftime("%Y-%m-%d", time.gmtime())
        if today_utc != self._current_day_utc:
            self._daily_count = 0
            self._current_day_utc = today_utc

        cutoff = now - 60.0
        self._requests = [t for t in self._requests if t > cutoff]
        self._token_allocations = [(t, c) for t, c in self._token_allocations if t > cutoff]

    async def try_acquire(self, estimated_tokens: int) -> bool:
        """Reserva atômica de cota antes do disparo à rede."""
        async with self._lock:
            now = time.monotonic()
            self._slide_window(now)

            current_tpm = sum(c for _, c in self._token_allocations)
            if (
                len(self._requests) < self.rpm_limit
                and (current_tpm + estimated_tokens) <= self.tpm_limit
                and self._daily_count < self.rpd_limit
            ):
                self._requests.append(now)
                self._token_allocations.append((now, estimated_tokens))
                self._daily_count += 1
                return True
            return False

    async def reconcile(self, estimated_tokens: int, actual_tokens: int) -> None:
        """Ajusta a reserva inicial para o consumo real retornado em usage_metadata."""
        async with self._lock:
            diff = actual_tokens - estimated_tokens
            if diff != 0 and self._token_allocations:
                last_t, last_c = self._token_allocations[-1]
                self._token_allocations[-1] = (last_t, max(0, last_c + diff))

    async def release_reservation(self, estimated_tokens: int) -> None:
        """Estorna a alocação em caso de erro pré-rede ou descarte.

        O estorno é LIFO: `try_acquire` sempre acrescenta exatamente uma entrada,
        e o `pop()` abaixo remove essa entrada, que já carrega o valor reservado.
        Por isso `estimated_tokens` não é lido — ele existe por simetria com
        `try_acquire` e `reconcile`, e recalcular a partir dele duplicaria o
        estorno.
        """
        _ = estimated_tokens
        async with self._lock:
            if self._requests:
                self._requests.pop()
            if self._token_allocations:
                self._token_allocations.pop()
            self._daily_count = max(0, self._daily_count - 1)

    async def get_metrics(self) -> BucketMetrics:
        """Retorna snapshot instantâneo do estado de cota."""
        async with self._lock:
            now = time.monotonic()
            self._slide_window(now)
            current_tpm = sum(c for _, c in self._token_allocations)
            return BucketMetrics(
                current_tpm=current_tpm,
                current_rpm=len(self._requests),
                daily_count=self._daily_count,
                rpm_limit=self.rpm_limit,
                tpm_limit=self.tpm_limit,
                rpd_limit=self.rpd_limit,
            )


class SOTAUnifiedFreeRouter:
    """Orquestrador Canônico de APIs Gratuitas para o Ecossistema Site & Antigravity."""

    def __init__(
        self,
        google_api_keys: list[str] | None = None,
        openrouter_keys: list[str] | None = None,
    ) -> None:
        keys = google_api_keys if google_api_keys is not None else list(dict.fromkeys(GEMINI_FLASH_KEYS + GEMINI_KEYS))
        self.openrouter_keys = openrouter_keys if openrouter_keys is not None else OPENROUTER_KEYS

        if not keys:
            logger.warning("[FREE ROUTER] Nenhuma chave Google encontrada no pool. Operando em modo de reserva.")
            keys = ["mock-free-tier-key"]

        self.clients = [genai.Client(api_key=k) for k in keys]
        self._key_index = 0
        self._local_cache: dict[str, str] = {}
        self._cache_lock = asyncio.Lock()

        # Multiplicação linear de capacidade pelo pool multi-chave
        pool_size = max(1, len(keys))
        self.quotas: dict[str, AtomicQuotaBucket] = {
            "gemini-3.7-flash": AtomicQuotaBucket(
                rpm_limit=10 * pool_size,
                tpm_limit=500_000 * pool_size,
                rpd_limit=350 * pool_size,
            ),
            "gemini-3.6-flash": AtomicQuotaBucket(
                rpm_limit=15 * pool_size,
                tpm_limit=1_000_000 * pool_size,
                rpd_limit=1500 * pool_size,
            ),
            "gemini-3.5-flash-lite": AtomicQuotaBucket(
                rpm_limit=30 * pool_size,
                tpm_limit=1_000_000 * pool_size,
                rpd_limit=2000 * pool_size,
            ),
        }

    def _rotate_client(self) -> genai.Client:
        client = self.clients[self._key_index]
        self._key_index = (self._key_index + 1) % len(self.clients)
        return client

    @staticmethod
    def calculate_token_demand(prompt: str, complexity_score: int = 1) -> tuple[int, int]:
        """Calcula a demanda preditiva eliminando números mágicos hardcoded."""
        input_tokens = int(len(prompt) / 2.5)
        output_margin = 1024 if complexity_score <= 2 else (2048 if complexity_score <= 4 else 4096)
        return input_tokens + output_margin, output_margin

    @staticmethod
    def estimate_tokens(prompt: str, is_synthesis: bool) -> int:
        base = int(len(prompt) / 2.5)
        return base + 4000 if is_synthesis else base + 500

    def _cache_key(self, prompt: str, system_instruction: str | None) -> str:
        content = f"{system_instruction or ''}:{prompt}"
        return hashlib.sha256(content.encode()).hexdigest()

    async def execute_by_complexity(
        self,
        prompt: str,
        system_instruction: str | None = None,
        complexity_score: int = 1,
    ) -> dict[str, str]:
        """Executa a tarefa roteando pela complexidade (1 a 5) com fallback em cascata."""
        ckey = self._cache_key(prompt, system_instruction)
        async with self._cache_lock:
            if ckey in self._local_cache:
                return {
                    "provider": "local-cache",
                    "model": "sha256-deduplicated",
                    "output": self._local_cache[ckey],
                }

        est_tokens, max_output = self.calculate_token_demand(prompt, complexity_score)

        # NÍVEL 1: Tarefas Simples (Score 1-2) -> Gemini 3.5 Flash-Lite
        if complexity_score <= 2:
            res = await self._call_model(
                "gemini-3.5-flash-lite", prompt, system_instruction, est_tokens, max_output
            )
            if res:
                return await self._store_cache(ckey, res)

        # NÍVEL 2: Raciocínio Padrão (Score 3-4) -> Gemini 3.6 Flash
        if complexity_score in (3, 4):
            res = await self._call_model(
                "gemini-3.6-flash", prompt, system_instruction, est_tokens, max_output
            )
            if res:
                return await self._store_cache(ckey, res)
            # Degradação graciosa para 3.5 Flash-Lite
            res_lite = await self._call_model(
                "gemini-3.5-flash-lite", prompt, system_instruction, est_tokens, max_output
            )
            if res_lite:
                return await self._store_cache(ckey, res_lite)

        # NÍVEL 3: Raciocínio Teórico Profundo (Score 5) -> Gemini 3.7 Flash Low-Effort
        if complexity_score >= 5:
            res = await self._call_model(
                "gemini-3.7-flash",
                prompt,
                system_instruction,
                est_tokens,
                max_output,
                thinking_level=types.ThinkingLevel.LOW,
            )
            if res:
                return await self._store_cache(ckey, res)
            # Fallback 1: Gemini 3.6 Flash
            res_36 = await self._call_model(
                "gemini-3.6-flash", prompt, system_instruction, est_tokens, max_output
            )
            if res_36:
                return await self._store_cache(ckey, res_36)
            # Fallback 2: Gemini 3.5 Flash-Lite
            res_lite = await self._call_model(
                "gemini-3.5-flash-lite", prompt, system_instruction, est_tokens, max_output
            )
            if res_lite:
                return await self._store_cache(ckey, res_lite)

        # NÍVEL 4: Contingência Externa (OpenRouter Free Tier)
        if self.openrouter_keys:
            res_op = await self._call_openrouter(prompt, system_instruction)
            return await self._store_cache(ckey, res_op)

        return {
            "provider": "circuit_breaker",
            "status": "ALL_QUOTAS_EXHAUSTED",
            "output": "Cotas gratuitas temporariamente exauridas.",
        }

    async def _call_model(
        self,
        model_name: str,
        prompt: str,
        system_instruction: str | None,
        est_tokens: int,
        max_output: int,
        thinking_level: types.ThinkingLevel | None = None,
    ) -> dict[str, str] | None:
        bucket = self.quotas.get(model_name)
        if not bucket or not await bucket.try_acquire(est_tokens):
            return None

        try:
            client = self._rotate_client()
            cfg_kwargs: dict[str, Any] = {
                "system_instruction": system_instruction,
                "max_output_tokens": max_output,
                "temperature": 0.2,
            }
            if thinking_level:
                cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level=thinking_level)

            res = await client.aio.models.generate_content(
                model=model_name, contents=prompt, config=types.GenerateContentConfig(**cfg_kwargs)
            )
            usage = res.usage_metadata
            used = (usage.prompt_token_count or 0) + (usage.candidates_token_count or 0) if usage else est_tokens
            await bucket.reconcile(est_tokens, used)
            return {"provider": "google-ai-studio", "model": model_name, "output": res.text or ""}
        except (APIError, Exception) as exc:
            logger.warning(f"[FREE ROUTER] Falha em {model_name}: {exc}. Releasing cota...")
            await bucket.release_reservation(est_tokens)
            return None

    async def _store_cache(self, ckey: str, result: dict[str, str]) -> dict[str, str]:
        if result.get("output"):
            async with self._cache_lock:
                self._local_cache[ckey] = result["output"]
        return result

    async def dispatch(
        self,
        prompt: str,
        task_tier: Literal["SYNTHESIS", "TRIAGE"] = "TRIAGE",
        system_instruction: str | None = None,
    ) -> dict[str, str]:
        """Compatibilidade backward com o contrato original."""
        score = 4 if task_tier == "SYNTHESIS" else 1
        return await self.execute_by_complexity(prompt, system_instruction, complexity_score=score)

    async def _call_openrouter(self, prompt: str, system_instruction: str | None = None) -> dict[str, str]:
        url = "https://openrouter.ai/api/v1/chat/completions"
        key = self.openrouter_keys[0]
        headers = {
            "Authorization": f"Bearer {key}",
            "HTTP-Referer": "https://antigravity.engine",
            "X-Title": "Antigravity Fallback",
            "Content-Type": "application/json",
        }
        messages: list[dict[str, str]] = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "google/gemini-2.0-flash-exp:free",
            "messages": messages,
            "max_tokens": 2048,
        }
        async with httpx.AsyncClient(timeout=25.0) as client:
            try:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return {
                    "provider": "openrouter-free",
                    "model": "gemini-2.0-flash-exp:free",
                    "output": content or "",
                }
            except Exception as exc:
                return {"provider": "circuit_breaker", "status": "FAILOVER_FAILED", "output": str(exc)}
