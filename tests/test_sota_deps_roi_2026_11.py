"""Testes de integracao e invariantes SOTA para dependencias de alto ROI (2026-11).

Cobre:
- hypothesis: invariantes matematicos de MDF, sizing geometrico e Nash minimax.
- scipy: solver exato HiGHS LP para matrizes soma zero (`ScipyNashMatrixSolver`).
- pytest-benchmark: micro-benchmark reproduzivel do roteador System-1 (`LayaRouter`).
- schemathesis: validacao de contrato OpenAPI 3.1 sobre `core.schemas.Task`.
- winloop & orjson: runner assincrono `utils.event_loop.run_asyncio` e round-trip UTF-8 em `QueueManager`.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
import math
import sys
from typing import Protocol

from hypothesis import given, settings
from hypothesis import strategies as st
import pytest
import schemathesis
from watchdog.events import DirModifiedEvent, FileModifiedEvent

from core.schemas import Task
from database.queue_manager import QueueManager
from engine.canonical_poker_theory import (
    JandaGeometricBetSizing,
    JandaMDFCalculator,
    ScipyNashMatrixSolver,
)
from llm.laya_bridge import (
    CANONICAL_LAYA_REPO,
    LayaRouter,
    get_laya_multilingual_revision,
)
from scripts.routines.vitoi_watcher import VitoiContextHandler
from utils.event_loop import _should_use_winloop, run_asyncio


class BenchmarkFixture(Protocol):
    """Protocolo minimo do fixture `benchmark` do pytest-benchmark."""

    def __call__(self, function_to_benchmark: Callable[..., object], *args: object, **kwargs: object) -> object: ...


@pytest.mark.pmev
@pytest.mark.unit
@given(
    small_bet=st.floats(min_value=0.05, max_value=2.0, allow_nan=False, allow_infinity=False),
    delta=st.floats(min_value=0.05, max_value=3.0, allow_nan=False, allow_infinity=False),
)
@settings(max_examples=40, deadline=None)
def test_hypothesis_janda_mdf_monotonicity_and_bounds(small_bet: float, delta: float) -> None:
    """MDF deve permanecer em (0, 1) e decrescer monotonicamente quando a aposta aumenta."""
    res_small = JandaMDFCalculator.calculate_mdf(pot=1.0, bet=small_bet, num_defenders=1)
    res_large = JandaMDFCalculator.calculate_mdf(pot=1.0, bet=small_bet + delta, num_defenders=1)

    assert 0.0 < res_small.mdf < 1.0
    assert 0.0 < res_large.mdf < 1.0
    assert res_large.mdf <= res_small.mdf
    assert math.isclose(res_small.alpha + res_small.mdf, 1.0, rel_tol=1e-4, abs_tol=1e-4)


@pytest.mark.pmev
@pytest.mark.unit
@given(
    pot=st.floats(min_value=1.0, max_value=100.0, allow_nan=False, allow_infinity=False),
    stack=st.floats(min_value=1.0, max_value=500.0, allow_nan=False, allow_infinity=False),
    streets=st.integers(min_value=1, max_value=3),
)
@settings(max_examples=40, deadline=None)
def test_hypothesis_geometric_sizing_invariants(pot: float, stack: float, streets: int) -> None:
    """Dimensionamento geometrico deve produzir fracao de pote finita, positiva e coerente."""
    sol = JandaGeometricBetSizing.calculate_geometric_sizing(pot=pot, effective_stack=stack, num_streets=streets)
    assert math.isfinite(sol.constant_pot_fraction)
    assert sol.constant_pot_fraction > 0.0
    assert len(sol.steps) == streets
    assert all(step.bet_size > 0.0 for step in sol.steps)


@pytest.mark.pmev
@pytest.mark.unit
@given(
    a=st.floats(min_value=-10.0, max_value=10.0, allow_nan=False, allow_infinity=False),
    b=st.floats(min_value=-10.0, max_value=10.0, allow_nan=False, allow_infinity=False),
    c=st.floats(min_value=-10.0, max_value=10.0, allow_nan=False, allow_infinity=False),
)
@settings(max_examples=30, deadline=None)
def test_hypothesis_skew_symmetric_nash_zero_value(a: float, b: float, c: float) -> None:
    """Toda matriz 3x3 antissimetrica de soma zero possui valor de jogo 0 e soma de probabilidades = 1."""
    pytest.importorskip("scipy", reason="extra pmev nao instalado neste runtime")
    matrix = [
        [0.0, a, b],
        [-a, 0.0, c],
        [-b, -c, 0.0],
    ]
    res = ScipyNashMatrixSolver.solve_zero_sum(matrix)
    assert len(res.row_strategy) == 3
    assert all(0.0 <= p <= 1.0 + 1e-9 for p in res.row_strategy)
    assert math.isclose(sum(res.row_strategy), 1.0, abs_tol=1e-7)
    assert math.isclose(res.game_value, 0.0, abs_tol=1e-6)


@pytest.mark.pmev
@pytest.mark.unit
def test_scipy_nash_matrix_solver_analytical_solutions() -> None:
    """Valida equilibrio exato de Nash para RPS e Matching Pennies assimetrico."""
    pytest.importorskip("scipy", reason="extra pmev nao instalado neste runtime")

    rps = ScipyNashMatrixSolver.solve_zero_sum(
        [
            [0.0, -1.0, 1.0],
            [1.0, 0.0, -1.0],
            [-1.0, 1.0, 0.0],
        ]
    )
    assert math.isclose(rps.game_value, 0.0, abs_tol=1e-7)
    for prob in rps.row_strategy:
        assert math.isclose(prob, 1.0 / 3.0, abs_tol=1e-6)

    # Jogo assimetrico: [[2, -1], [-1, 1]] => x* = [2/5, 3/5], V = 1/5
    asym = ScipyNashMatrixSolver.solve_zero_sum([[2.0, -1.0], [-1.0, 1.0]])
    assert math.isclose(asym.game_value, 0.2, abs_tol=1e-7)
    assert math.isclose(asym.row_strategy[0], 0.4, abs_tol=1e-6)
    assert math.isclose(asym.row_strategy[1], 0.6, abs_tol=1e-6)


@pytest.mark.unit
def test_benchmark_laya_router_latency(benchmark: BenchmarkFixture) -> None:
    """Micro-benchmark do roteador System-1 zero-download via pytest-benchmark."""
    # Warmup explicito para medir apenas a inferencia em memoria
    LayaRouter.classificar_intencao("Warmup PMev route")

    intent = benchmark(
        LayaRouter.classificar_intencao,
        "Calculate PMev risk premium and bubble factor for BTN vs BB",
    )
    assert intent is not None


@pytest.mark.unit
def test_schemathesis_openapi_task_contract() -> None:
    """Valida que o schema JSON de Task gera estrategia OpenAPI 3.1 valida no Schemathesis."""
    spec = {
        "openapi": "3.1.0",
        "info": {"title": "Nexus API Contract", "version": "1.0.0"},
        "paths": {
            "/api/v1/tasks": {
                "post": {
                    "requestBody": {
                        "required": True,
                        "content": {"application/json": {"schema": Task.model_json_schema()}},
                    },
                    "responses": {"200": {"description": "Task accepted"}},
                }
            }
        },
    }
    schema = schemathesis.openapi.from_dict(spec)
    op = schema["/api/v1/tasks"]["POST"]
    strategy = op.as_strategy()
    assert strategy is not None


@pytest.mark.unit
def test_winloop_event_loop_runner_and_disable_flag(monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida execucao de corrotina via winloop no Windows e flag de fallback asyncio."""

    async def _probe() -> str:
        return "ok"

    monkeypatch.delenv("NEXUS_DISABLE_WINLOOP", raising=False)
    if sys.platform == "win32":
        assert _should_use_winloop() is True
    assert run_asyncio(_probe()) == "ok"

    monkeypatch.setenv("NEXUS_DISABLE_WINLOOP", "1")
    assert _should_use_winloop() is False
    assert run_asyncio(_probe()) == "ok"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_queue_manager_orjson_metadata_roundtrip() -> None:
    """Garante round-trip UTF-8 com orjson em add_task, get_task e update_task_metadata."""
    qm = QueueManager(":memory:")
    try:
        now_iso = datetime.now(UTC).isoformat()
        task = Task(
            id="task-orjson-roundtrip",
            description="Simulacao PMev com acentuacao UTF-8",
            agent="@chico",
            status="pending",
            timestamp=now_iso,
            metadata={"priority": "high", "context": "A\u00e7\u00e3o multiway \u0394RP"},
        )
        await qm.add_task(task)
        loaded = await qm.get_task("task-orjson-roundtrip")
        assert loaded is not None
        assert loaded.metadata["context"] == "A\u00e7\u00e3o multiway \u0394RP"

        await qm.update_task_metadata("task-orjson-roundtrip", {"stage": "validado"})
        updated = await qm.get_task("task-orjson-roundtrip")
        assert updated is not None
        assert updated.metadata["stage"] == "validado"
        assert updated.metadata["priority"] == "high"
    finally:
        await qm.close()


@pytest.mark.unit
def test_vitoi_watcher_watchdog_711_glob_filtering() -> None:
    """Garante filtragem glob compatível com PurePath.full_match() do watchdog>=7.1.1."""
    handler = VitoiContextHandler()
    seen: list[str] = []
    handler.on_modified = lambda event: seen.append(str(event.src_path))  # type: ignore[method-assign]

    handler.dispatch(FileModifiedEvent("app.py"))
    handler.dispatch(FileModifiedEvent("core/app.py"))
    handler.dispatch(FileModifiedEvent(r"C:\Users\rapha\.gemini\Site\core\app.py"))
    handler.dispatch(FileModifiedEvent(".venv/lib/site.py"))
    handler.dispatch(FileModifiedEvent(r"C:\Users\rapha\.gemini\Site\.venv\lib\site.py"))
    handler.dispatch(FileModifiedEvent("notes.txt"))
    handler.dispatch(DirModifiedEvent("core"))

    assert seen == [
        "app.py",
        "core/app.py",
        r"C:\Users\rapha\.gemini\Site\core\app.py",
    ]


@pytest.mark.unit
def test_laya_bridge_revision_from_laya_revisions_without_torch(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Valida leitura direta de laya.revisions.PINNED_REVISIONS sem importar torch."""
    from laya import revisions as laya_revisions_mod  # noqa: PLC0415

    assert CANONICAL_LAYA_REPO in laya_revisions_mod.PINNED_REVISIONS
    if "torch" not in sys.modules:
        monkeypatch.setitem(sys.modules, "torch", None)  # type: ignore[arg-type]
    assert get_laya_multilingual_revision() == laya_revisions_mod.PINNED_REVISIONS[CANONICAL_LAYA_REPO]


@pytest.mark.unit
def test_laya_053_short_pt_es_stopwords_and_vega_choice_labels() -> None:
    """Valida stopwords PT/ES sem acento e preservacao de labels Vega na laya 0.5.3."""
    from laya.vega import _laya_choice_label  # noqa: PLC0415

    pt_samples = ("faco isso hoje e amanha", "quem estao no pote?")
    for sample in pt_samples:
        intent = LayaRouter.classificar_intencao(sample)
        assert intent.idioma == "multilingual"
        assert intent.is_english is False
        assert intent.idioma_detectado == "pt"
        assert intent.metadados_s1()["idioma_detectado"] == "pt"

    es_intent = LayaRouter.classificar_intencao("puedo hacer esto ahora?")
    assert es_intent.idioma == "multilingual"
    assert es_intent.is_english is False
    assert es_intent.idioma_detectado == "es"
    assert es_intent.metadados_s1()["idioma_detectado"] == "es"

    q_int = {"type": "choice", "criteria": {1: "um", 2: "dois"}}
    resolved_int = _laya_choice_label(q_int, "1")
    assert resolved_int == 1
    assert type(resolved_int) is int


@pytest.mark.unit
def test_schemathesis_434_laya_fastapi_asgi_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida contrato ASGI OpenAPI, config TOML e scoped_extensions no Schemathesis 4.34.0."""
    from pathlib import Path  # noqa: PLC0415

    from schemathesis.config import SchemathesisConfig  # noqa: PLC0415
    from schemathesis.core.result import Ok  # noqa: PLC0415

    import scripts.ops.homologar_laya_gpu as laya_gpu_mod  # noqa: PLC0415

    monkeypatch.setenv("CHICO_LAYA_PREDICT_ALLOW_CPU", "0")
    monkeypatch.setattr(
        laya_gpu_mod,
        "obter_perfil_hardware",
        lambda: laya_gpu_mod.HardwareProfile(
            os_platform="test",
            python_version="3.12",
            torch_version="0.0",
            cuda_available=False,
            cuda_version=None,
            cudnn_version=None,
            device_count=0,
            devices=[],
        ),
    )

    schema = schemathesis.openapi.from_asgi("/openapi.json", laya_gpu_mod.criar_fastapi_app())
    ops = {(res.ok().method.lower(), res.ok().path) for res in schema.get_all_operations() if isinstance(res, Ok)}
    assert {("get", "/health"), ("post", "/predict"), ("post", "/solve")} <= ops

    health_case = schema["/health"]["GET"].Case()
    health_resp = health_case.call()
    health_case.validate_response(health_resp)
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "HEALTHY"

    predict_case = schema["/predict"]["POST"].Case(body={"state": "Hero BTN AKo", "max_len": 1024})
    predict_resp = predict_case.call()
    predict_case.validate_response(predict_resp)
    assert predict_resp.status_code == 200
    assert predict_resp.json()["status"] == "SUCCESS"

    with schemathesis.scoped_extensions():
        pass

    cfg = SchemathesisConfig.from_path(Path(__file__).resolve().parent.parent / "schemathesis.toml")
    assert cfg.projects.default.generation.allow_whole_floats is False
    assert cfg.output.sanitization.enabled is True


@pytest.mark.unit
def test_regex_2026_11_23_negated_set_alternation_and_casefold() -> None:
    """Valida correcao da issue #642 no regex>=2026.11.23 em alternancias negadas e (?i:...)."""
    import regex  # noqa: PLC0415

    assert regex.fullmatch(r"[^a]|[^b]", "a") is not None
    assert regex.fullmatch(r"[^a]|[^b]", "b") is not None
    assert regex.search(r"(?i:foo)[^x]", "FOOa") is not None
