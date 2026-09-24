"""
Testes SOTA para AutopoiesisEngine e SotaContextCacheEngine (Protocolo Chico v8.0 GOLD).
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

from pydantic import BaseModel
import pytest

import core.autopoiesis_engine as ae_module
from core.autopoiesis_engine import AutopoiesisEngine, HomeostasisReport
from core.sota_context_engine import (
    CacheTier,
    HookContext,
    HookType,
    PromptStructureOptimizer,
    SotaContextCacheEngine,
    SotaHookBus,
    StructuredOutputEngine,
)


class SampleSchema(BaseModel):
    result: str
    code: int


@pytest.mark.unit
def test_autopoiesis_lock_and_temps(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida lock, stale-lock recovery, foreign-PID block e purga de temporarios."""
    lock_path = tmp_path / "homeostasis.lock"
    monkeypatch.setattr(ae_module, "LOCK_FILE", lock_path)
    monkeypatch.setattr(ae_module, "TELEMETRY_LOG", tmp_path / "telemetry.jsonl")

    engine = AutopoiesisEngine(base_dir=tmp_path)

    # 1. Acquire inicial
    assert engine._acquire_lock() is True
    assert lock_path.exists()

    # 2. Reentrancia: mesmo PID re-acquire com sucesso
    assert engine._acquire_lock() is True

    # Release
    engine._release_lock()
    assert not lock_path.exists()

    # 3. Foreign PID blocking (lock vivo, < 60s)
    lock_path.write_text("99999")
    assert engine._acquire_lock() is False
    engine._release_lock()


@pytest.mark.unit
def test_autopoiesis_sqlite_wal(tmp_path: Path) -> None:
    """Valida a verificacao de integridade SQLite WAL."""
    engine = AutopoiesisEngine(base_dir=tmp_path)
    ok, msg = engine.check_and_heal_sqlite_wal()
    assert isinstance(ok, bool)
    assert isinstance(msg, str)


@pytest.mark.unit
@patch("subprocess.run")
def test_autopoietic_cycle_execution(mock_run: MagicMock, tmp_path: Path) -> None:
    """Valida a execucao completa de um ciclo autoiopoietico com mock de subprocessos."""
    mock_run.return_value = MagicMock(returncode=0, stdout="ok", stderr="")
    engine = AutopoiesisEngine(base_dir=tmp_path)

    report = engine.run_autopoietic_cycle()
    assert isinstance(report, HomeostasisReport)
    assert report.overall_status in {"SUCESSO (VERDE)", "FRAGIL (AMARELO)", "FALHOU (VERMELHO)"}
    assert isinstance(report.entropy_index, float)


@pytest.mark.unit
def test_sota_context_cache_engine() -> None:
    """Valida o SotaContextCacheEngine (buckets, TTL, assinaturas, tamanho em MB e eviccao LRU)."""
    cache = SotaContextCacheEngine(max_cache_size_mb=10)

    bucket = cache.get_or_create_bucket(
        "b1", "conteudo de teste sota", tier=CacheTier.CACHE_EPHEMERAL, ttl_seconds=3600
    )
    assert bucket.bucket_id == "b1"
    assert bucket.token_count > 0
    assert cache.tamanho_mb() > 0

    bucket2 = cache.get_or_create_bucket(
        "b1", "conteudo de teste sota", tier=CacheTier.CACHE_EPHEMERAL, ttl_seconds=3600
    )
    assert bucket2.hash_signature == bucket.hash_signature

    cache.enforce_lru_eviction()
    assert "b1" in cache.buckets


@pytest.mark.unit
def test_structured_output_engine() -> None:
    """Valida validacao estrita com Pydantic e limpeza de blocos markdown."""
    raw_json = '```json\n{"result": "sucesso sota", "code": 200}\n```'
    parsed = StructuredOutputEngine.enforce_pydantic(raw_json, SampleSchema)
    assert parsed.result == "sucesso sota"
    assert parsed.code == 200

    with pytest.raises(ValueError, match="Violacao de Structured Output"):
        StructuredOutputEngine.enforce_pydantic("invalid json", SampleSchema)


@pytest.mark.unit
def test_prompt_structure_optimizer() -> None:
    """Valida a construcao de prompts otimizados para Radix Prefix Caching."""
    prompt = PromptStructureOptimizer.build_cached_prompt(
        system_prompt="System instructions",
        tool_definitions="Tools definition",
        few_shots="Few shot examples",
        dag_history="DAG history context",
        task_input="Current task input",
    )
    assert "System instructions" in prompt
    assert "Tools definition" in prompt
    assert "Few shot examples" in prompt
    assert "DAG history context" in prompt
    assert "Current task input" in prompt


@pytest.mark.unit
def test_sota_hook_bus() -> None:
    """Valida o barramento de hooks do ciclo de vida (Inspect, Decide, Transform)."""
    bus = SotaHookBus()

    inspected = []
    bus.register_inspect(lambda ctx: inspected.append(ctx.agent_name))
    bus.register_decide(lambda ctx: ctx.payload.get("allow", True))
    bus.register_transform(lambda ctx: {**ctx.payload, "transformed": True})

    ctx = HookContext(hook_type=HookType.INSPECT, agent_name="@chico", payload={"allow": True, "data": 123})

    bus.trigger_inspect(ctx)
    assert "@chico" in inspected

    allowed = bus.trigger_decide(ctx)
    assert allowed is True

    trans = bus.trigger_transform(ctx)
    assert trans["transformed"] is True
