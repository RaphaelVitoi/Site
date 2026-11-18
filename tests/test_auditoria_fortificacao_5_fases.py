"""Suite de regressao e fortificacao das 5 fases da auditoria de backend.

Cobre seguranca (CRIT-01, CRIT-02, HIGH-01..04), integridade de fila e pools
(HIGH-05, HIGH-06, HIGH-08), observabilidade (Watchdog, Telemetry, AuditEngine)
e invariantes MEDIUM/LOW (read_json_object, _e_modelo_publico, RStatisticalBridge,
DreamGate e clamping de AsyncTokenBucket).
"""

from __future__ import annotations

import asyncio
import base64
import contextlib
from datetime import UTC, datetime
from io import BytesIO
import logging
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import aiohttp
from aiohttp.test_utils import TestClient, TestServer
from fastapi.testclient import TestClient as FastAPITestClient
from PIL import Image
from pydantic import ValidationError
import pytest

from api.v1 import handlers, handlers_files, middleware
from api.v1.server import create_app
from conductor.dream_gate import DreamGate
import core.config as core_config
import core.runtime as core_runtime
from core.schemas import GeneralTelemetry, Task
from database.queue_manager import QueueManager
from engine import llm_api
from engine.r_statistical_bridge import RStatisticalBridge
from engine.sota_web_browse import CDPBrowserBridge
from llm import budget as llm_budget
from llm import session as llm_session
from llm import translategemma
from llm.gemini_pool import GeminiPoolManager
from llm.openrouter_pool import OpenRouterPoolManager
from llm.routing import _infer_provider_for_model
from monitoring.watchdog import _process_watchdog_triggers, _run_watchdog_cycle
from tools.hybrid_router import app as hybrid_router_app

REPO_ROOT: Path = Path(__file__).resolve().parent.parent


@pytest.fixture
def isolated_workdir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Fornece diretorio temporario dentro de tmp_path com QueueManager em memoria."""
    monkeypatch.setattr(core_config, "VALID_AGENTS", ["@maverick", "@chico", "@implementor"])
    return tmp_path


@pytest.mark.unit
def test_crit01_key_identifiers_are_hmac_hashed_and_never_plaintext(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CRIT-01: _key_identifier e _generate_fallback_response nunca expoem segredos."""
    raw_secret = "CHAVE_SECRETA_SINTETICA_NAO_VAZAR_" + uuid4().hex

    cfg_id = core_config._key_identifier("openai", raw_secret)
    budget_id = llm_budget._key_identifier("openai", raw_secret)
    gemini_id = llm_budget._gemini_model_key_identifier("gemini-3.5-flash-lite", raw_secret)

    for hashed in (cfg_id, budget_id, gemini_id):
        assert "sha256:" in hashed
        assert raw_secret not in hashed
        assert raw_secret[:12] not in hashed

    monkeypatch.setattr(llm_api, "KEY_BLOCKLIST", {cfg_id: 9999999999.0})
    fallback_md = llm_api._generate_fallback_response("@chico", ["gemini-3.8-flash"])
    assert raw_secret not in fallback_md
    assert "sha256:" in fallback_md


@pytest.mark.asyncio
@pytest.mark.unit
async def test_crit02_translate_blocks_http_image_path_and_preserves_local_path(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CRIT-02: /api/v1/translate recusa image_path HTTP, mas translate_image(Path) funciona."""
    img_path = tmp_path / "sample.png"
    buf = BytesIO()
    Image.new("RGB", (4, 4), color=(10, 20, 30)).save(buf, format="PNG")
    raw_png = buf.getvalue()
    img_path.write_bytes(raw_png)

    loaded_str = translategemma._load_image_base64(str(img_path), allow_local_path=False)
    assert loaded_str == str(img_path)
    assert loaded_str != base64.b64encode(raw_png).decode("ascii")

    with pytest.raises(ValueError, match="Caminho de arquivo local nao permitido"):
        translategemma._load_image_base64(img_path, allow_local_path=False)

    token = "test-token-" + uuid4().hex
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", token)
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)

    qm = QueueManager(":memory:")
    app = create_app(qm)
    try:
        async with TestClient(TestServer(app)) as client:
            resp = await client.post(
                "/api/v1/translate",
                json={"image_path": str(img_path), "target_lang": "pt-BR"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert resp.status == 400
    finally:
        await qm.close()

    with (
        patch.object(translategemma, "ollama_online", return_value=False),
        patch.object(
            translategemma,
            "_call_cloud_translate_pool",
            return_value=("Fold em EP", 12.0, "gemini-mock", "mock-cloud"),
        ) as mock_cloud,
    ):
        res = translategemma.translate_image(img_path, target_lang="pt-BR", allow_cloud_fallback=True)
        assert res.text == "Fold em EP"
        mock_cloud.assert_called_once()


@pytest.mark.unit
def test_high01_file_roots_omit_cwd_when_gdrive_root_unset(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """HIGH-01: PATH_GDRIVE_ROOT vazio/ausente nao expoe Path.cwd() nas raizes."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(core_runtime, "PATH_GDRIVE_ROOT", "", raising=False)
    secret_in_cwd = tmp_path / "notes.txt"
    secret_in_cwd.write_text("internal", encoding="utf-8")

    workspace_root = REPO_ROOT
    roots = handlers_files._get_allowed_roots(workspace_root)
    root_paths = [p.resolve() for _, p in roots]

    assert tmp_path.resolve() not in root_paths
    assert all(name != "GoogleDrive" for name, _ in roots)
    assert handlers_files._is_file_access_allowed(secret_in_cwd.resolve()) is False


@pytest.mark.unit
def test_high02_hybrid_router_no_wildcard_cors_and_sanitized_500(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """HIGH-02: hybrid_router sem CORS wildcard '*' e HTTP 500 sanitizado com error_id."""
    trusted_origins = hybrid_router_app._hybrid_trusted_origins()
    assert "*" not in trusted_origins

    monkeypatch.setenv("HYBRID_ROUTER_REQUIRE_AUTH", "0")
    monkeypatch.delenv("HYBRID_ROUTER_API_KEY", raising=False)
    monkeypatch.delenv("API_SECRET_TOKEN", raising=False)

    with patch.object(
        hybrid_router_app.orchestrator,
        "dispatch",
        new=AsyncMock(side_effect=RuntimeError("db_password=super_secret_trace")),
    ):
        client = FastAPITestClient(hybrid_router_app.app, raise_server_exceptions=False)
        resp = client.post("/v1/chat/generate", json={"prompt": "Teste de erro interno"})
        assert resp.status_code == 500
        detail = resp.json()["detail"]
        assert "error_id=" in detail
        assert "super_secret_trace" not in detail


@pytest.mark.unit
def test_high03_secret_masking_filter_redacts_child_loggers_and_exc_info() -> None:
    """HIGH-03: SecretMaskingFilter nos handlers do root mascara filhos e tracebacks."""
    stream = core_config.logging.StreamHandler()
    stream.stream = MagicMock()
    written: list[str] = []
    stream.stream.write = lambda msg: written.append(msg)  # type: ignore[method-assign]

    root = logging.getLogger()
    root.addHandler(stream)
    try:
        core_config.attach_filters_to_root_handlers()
        child = logging.getLogger("sub.modulo.fortificacao." + uuid4().hex[:6])
        child.setLevel(logging.INFO)

        sk_val = "sk-proj-" + ("A" * 24)
        gsk_val = "gsk_" + ("B" * 24)
        bearer_val = "Bearer " + ("C" * 24)

        child.warning("Falha com %s e %s", sk_val, gsk_val)
        try:
            raise RuntimeError(f"auth header {bearer_val}")
        except RuntimeError:
            child.exception("Erro com excecao")

        joined = "".join(written)
        assert sk_val not in joined
        assert gsk_val not in joined
        assert bearer_val not in joined
        assert core_config.REDACTED_SECRET_MASK in joined
    finally:
        root.removeHandler(stream)


@pytest.mark.unit
def test_high04_ssrf_blocks_loopback_and_link_local(monkeypatch: pytest.MonkeyPatch) -> None:
    """HIGH-04: _validate_public_fetch_url bloqueia loopback e link-local."""
    monkeypatch.delenv("SOTA_ALLOW_LOCAL_FETCH", raising=False)

    err_loop = CDPBrowserBridge._validate_public_fetch_url("http://127.0.0.1:17042/health")
    err_meta = CDPBrowserBridge._validate_public_fetch_url("http://169.254.169.254/latest/meta-data/")

    assert err_loop is not None
    assert err_meta is not None


@pytest.mark.asyncio
@pytest.mark.unit
async def test_high05_queue_manager_preserves_subagents_model_and_orphan_dep(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """HIGH-05: _row_to_task preserva @subagent/@sub_* e Task.model; dep orfa falha fechado."""
    monkeypatch.setattr(core_config, "VALID_AGENTS", ["@chico", "@maverick"])
    qm = QueueManager(":memory:")
    try:
        now = datetime.now(UTC).isoformat()
        await qm.add_task(
            Task(
                id="T-SUB-1",
                description="Subagente dinamico",
                agent="@sub_worker",
                model="gemini-3.5-flash-lite",
                timestamp=now,
                metadata={"priority": "high"},
            )
        )
        await qm.add_task(
            Task(
                id="T-SUB-2",
                description="Subagente canonico",
                agent="@subagent",
                model="google/gemma-4-31b-it",
                timestamp=now,
                metadata={"priority": "normal"},
            )
        )
        await qm.add_task(
            Task(
                id="T-ORPHAN-DEP",
                description="Bloqueada por dependencia inexistente",
                agent="@chico",
                timestamp=now,
                metadata={"depends_on": ["TASK-INEXISTENTE"]},
            )
        )

        fetched_1 = await qm.get_task("T-SUB-1")
        fetched_2 = await qm.get_task("T-SUB-2")
        assert fetched_1 is not None
        assert fetched_1.agent == "@sub_worker"
        assert fetched_1.model == "gemini-3.5-flash-lite"
        assert fetched_2 is not None
        assert fetched_2.agent == "@subagent"
        assert fetched_2.model == "google/gemma-4-31b-it"

        await qm.update_task_status("T-SUB-1", "completed")
        await qm.update_task_status("T-SUB-2", "completed")
        next_task = await qm.get_next_task()
        assert next_task is None
    finally:
        await qm.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_high06_close_all_http_sessions_closes_current_loop_sessions() -> None:
    """HIGH-06: close_all_http_sessions fecha sessoes abertas do loop corrente."""
    sess = llm_session.get_global_http_session()
    assert isinstance(sess, aiohttp.ClientSession)
    assert not sess.closed

    await llm_session.close_all_http_sessions()
    assert sess.closed


@pytest.mark.asyncio
@pytest.mark.unit
async def test_high08_watchdog_heals_queue_and_deduplicates_alerts() -> None:
    """HIGH-08: Watchdog aciona auto-cura/anti-starvation e deduplica WATCHDOG-ALERT-*."""
    existing_alert = Task(
        id="WATCHDOG-ALERT-2026111723",
        description="Alerta ja ativo",
        agent="@maverick",
        timestamp=datetime.now(UTC).isoformat(),
    )
    mock_mgr = MagicMock()
    mock_mgr.recover_stalled_tasks = AsyncMock(return_value=1)
    mock_mgr.promote_starved_tasks = AsyncMock(return_value=1)
    mock_mgr.get_task_counts = AsyncMock(return_value={"failed": 0, "pending": 0})
    mock_mgr.get_system_state = AsyncMock(return_value=None)
    mock_mgr.set_system_state = AsyncMock()
    mock_mgr.get_tasks = AsyncMock(side_effect=[[existing_alert], []])
    mock_mgr.add_task = AsyncMock()

    await _run_watchdog_cycle(mock_mgr)
    mock_mgr.recover_stalled_tasks.assert_awaited_once_with(max_running_minutes=45)
    mock_mgr.promote_starved_tasks.assert_awaited_once_with(max_wait_hours=2)

    await _process_watchdog_triggers(mock_mgr, "Engarrafamento", 50, 0, 0.0)
    mock_mgr.add_task.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_medium_low_fortifications(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """MEDIUM/LOW: read_json_object HTTP 400, _e_modelo_publico, RBridge, DreamGate e Bucket."""
    token = "test-token-" + uuid4().hex
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", token)
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)

    qm = QueueManager(":memory:")
    app = create_app(qm)
    try:
        async with TestClient(TestServer(app)) as client:
            for endpoint in ("/api/v1/s1/decide", "/state", "/api/v1/chrysalis/validate-plan"):
                for payload in ("[]", '"string"'):
                    resp = await client.post(
                        endpoint,
                        data=payload,
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json",
                        },
                    )
                    assert resp.status == 400, f"Esperado HTTP 400 em {endpoint} para {payload}"
    finally:
        await qm.close()

    assert handlers_files._e_modelo_publico(".env.example.local") is False
    assert handlers_files._e_modelo_publico("anything.example.ps1") is True

    dummy_bridge = RStatisticalBridge(rscript_bin="c:/caminho/falso/Rscript.exe")
    mda_zero_var = dummy_bridge.compute_bayesian_mda_frequency(
        prior_alpha=1.0,
        prior_beta=0.0,
        successes=1,
        trials=1,
        threshold=0.5,
    )
    assert mda_zero_var.prob_above_threshold == 1.0

    gate = DreamGate(repo_root=REPO_ROOT)
    assessment = gate.assess_proposal(["docs/CLAUDE.md", "docs/CLAUDE.md", "REPORTS/REGISTRO-TEST.md"])
    assert assessment.should_proceed is False
    assert len(assessment.anchor_protected_files) == 2

    bucket = llm_budget.AsyncTokenBucket(capacity=5, fill_rate_per_minute=600)
    await asyncio.wait_for(bucket.consume(999), timeout=2.0)

    assert _infer_provider_for_model("meta-llama/llama-3.3-70b-instruct:free") == "openrouter"
    assert _infer_provider_for_model("gemma4:12b") == "local"

    assert GeneralTelemetry.normalize_category(["Pos-Flop"]) == ["Pos-Flop"]
    with pytest.raises(ValidationError):
        GeneralTelemetry(category=["Pos-Flop"])  # type: ignore[arg-type]

    placeholder_or = "sk-" + "REPLACE-WITH-REAL-KEY-123456"
    with patch("llm.openrouter_pool._read_windows_registry_openrouter", return_value=None):
        with patch.dict(
            "os.environ",
            {"OPENROUTER_TIER1_KEY_1": placeholder_or},
            clear=True,
        ):
            pool = OpenRouterPoolManager()
            assert pool.get_pool_keys(1) == []

    placeholder_gem = "${" + "GEMINI_API_KEY_PLACEHOLDER}"
    with patch.dict(
        "os.environ",
        {"GEMINI_API_KEY_1": placeholder_gem},
        clear=True,
    ):
        gpool = GeminiPoolManager(read_registry=False)
        assert gpool.total_keys() == 0
        gpool.ensure_keys(["dummy-" + "invalid-key-1234567890"])
        assert gpool.total_keys() == 0

    assert hasattr(handlers, "handle_prometheus_metrics")
    with contextlib.suppress(Exception):
        await llm_session.close_all_http_sessions()
