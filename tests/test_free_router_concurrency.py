"""Suíte de Testes de Estresse e Concorrência para Free Tier Gateway e PMev Pipeline.

Protocolo Chico SOTA v8.0 GOLD.
Verificação: Imunidade a TOCTOU sob rajada assíncrona, cache semântico e combinatória PMev.
"""

from __future__ import annotations

import asyncio
import pytest

from engine.pmev_pipeline import PMevTripartitePipeline
from engine.pmev_spec import TournamentState
from llm.free_router import AtomicQuotaBucket, SOTAUnifiedFreeRouter


@pytest.mark.asyncio
async def test_atomic_quota_bucket_anti_toctou_concurrency() -> None:
    """Verifica que 50 chamadas assíncronas simultâneas não ultrapassam o teto de RPM/TPM."""
    bucket = AtomicQuotaBucket(rpm_limit=10, tpm_limit=50_000, rpd_limit=20)

    tasks = [bucket.try_acquire(estimated_tokens=4_000) for _ in range(50)]
    results = await asyncio.gather(*tasks)

    granted = [r for r in results if r is True]
    denied = [r for r in results if r is False]

    assert len(granted) == 10
    assert len(denied) == 40

    metrics = await bucket.get_metrics()
    assert metrics.current_rpm == 10
    assert metrics.current_tpm == 40_000
    assert metrics.daily_count == 10


@pytest.mark.asyncio
async def test_atomic_quota_bucket_reconciliation_and_release() -> None:
    """Testa reconciliação pós-chamada e estorno de alocação."""
    bucket = AtomicQuotaBucket(rpm_limit=5, tpm_limit=20_000, rpd_limit=10)

    assert await bucket.try_acquire(estimated_tokens=5_000) is True
    metrics = await bucket.get_metrics()
    assert metrics.current_tpm == 5_000

    await bucket.reconcile(estimated_tokens=5_000, actual_tokens=3_200)
    metrics_reconciled = await bucket.get_metrics()
    assert metrics_reconciled.current_tpm == 3_200

    await bucket.release_reservation(estimated_tokens=3_200)
    metrics_released = await bucket.get_metrics()
    assert metrics_released.current_rpm == 0
    assert metrics_released.current_tpm == 0
    assert metrics_released.daily_count == 0


def test_free_router_multi_key_scaling() -> None:
    """Valida que o pool multi-chaves multiplica a capacidade agregada linearmente."""
    mock_keys = ["mock-key-1", "mock-key-2", "mock-key-3"]
    router = SOTAUnifiedFreeRouter(google_api_keys=mock_keys)

    # 3 chaves -> 3 * 15 = 45 RPM para 3.6 Flash
    assert router.quotas["gemini-3.6-flash"].rpm_limit == 45
    assert router.quotas["gemini-3.6-flash"].tpm_limit == 3_000_000
    assert router.quotas["gemini-3.6-flash"].rpd_limit == 4500

    # 3 chaves -> 3 * 30 = 90 RPM para 3.5 Flash-Lite
    assert router.quotas["gemini-3.5-flash-lite"].rpm_limit == 90
    assert router.quotas["gemini-3.5-flash-lite"].rpd_limit == 6000

    # 3 chaves -> 3 * 10 = 30 RPM para 3.7 Flash
    assert router.quotas["gemini-3.7-flash"].rpm_limit == 30
    assert router.quotas["gemini-3.7-flash"].rpd_limit == 1050


@pytest.mark.asyncio
async def test_free_router_local_cache_deduplication() -> None:
    """Verifica que consultas idênticas são atendidas pelo cache SHA-256 local com 0 tokens de API."""
    router = SOTAUnifiedFreeRouter(google_api_keys=["mock-key"])
    ckey = router._cache_key("teste prompt duplicado", "sys instruction")
    await router._store_cache(ckey, {"output": "Resposta cacheada perfeitamente"})

    # Segunda chamada com os mesmos parâmetros deve vir diretamente do cache local
    res = await router.execute_by_complexity("teste prompt duplicado", "sys instruction", complexity_score=2)
    assert res["provider"] == "local-cache"
    assert res["model"] == "sha256-deduplicated"
    assert res["output"] == "Resposta cacheada perfeitamente"


def test_token_demand_calculation() -> None:
    """Verifica que a demanda de tokens é calculada dinamicamente sem números mágicos."""
    prompt = "A" * 1000  # 1000 chars / 2.5 = 400 tokens de input
    est_score_1, max_out_1 = SOTAUnifiedFreeRouter.calculate_token_demand(prompt, complexity_score=1)
    assert est_score_1 == 400 + 1024
    assert max_out_1 == 1024

    est_score_5, max_out_5 = SOTAUnifiedFreeRouter.calculate_token_demand(prompt, complexity_score=5)
    assert est_score_5 == 400 + 4096
    assert max_out_5 == 4096


def test_pmev_range_matrix_combinatorics() -> None:
    """Valida a integridade combinatória exata de 1326 combos Texas Hold'em na Camada 2 local."""
    # AA (6) + KK (6) + AKs (4) + AKo (12 * 0.5 = 6) = 22 combos ponderados
    range_spec = {"AA": 1.0, "KK": 1.0, "AKs": 1.0, "AKo": 0.5}
    res = PMevTripartitePipeline.validate_range_matrix(range_spec)
    assert res["is_valid"] is True
    assert res["total_combos_weighted"] == 22.0
    assert res["max_possible_combos"] == 1326
    # 22 / 1326 * 100 = ~1.66%
    assert res["range_coverage_pct"] == 1.66

    # Rejeição de mãos malformadas
    with pytest.raises(ValueError, match="Formato de mão inválido"):
        PMevTripartitePipeline.validate_range_matrix({"AKx": 1.0})

    # Rejeição de pesos inválidos
    with pytest.raises(ValueError, match="Peso inválido"):
        PMevTripartitePipeline.validate_range_matrix({"AA": 1.5})


@pytest.mark.asyncio
async def test_pmev_tripartite_pipeline_local_deterministic() -> None:
    """Valida a integridade matemática da Camada 2 (cálculo de Malmuth-Harville e Bubble Factor)."""
    pipeline = PMevTripartitePipeline()

    state = pipeline.normalize_state([5000.0, 3000.0, 2000.0], [500.0, 300.0, 200.0])
    assert isinstance(state, TournamentState)

    local_analysis = pipeline.compute_local_deterministic_layer(state)
    assert local_analysis.total_chips == 10000.0
    assert len(local_analysis.base_icm_ev) == 3

    assert sum(local_analysis.base_icm_ev) == pytest.approx(1000.0, abs=1e-3)

    bf_matrix = local_analysis.bubble_factor_matrix
    assert bf_matrix is not None
    assert len(bf_matrix) == 3
    assert bf_matrix[0][0] == 1.0
    assert bf_matrix[1][1] == 1.0
    assert bf_matrix[2][2] == 1.0
    assert bf_matrix[1][0] >= 1.0
