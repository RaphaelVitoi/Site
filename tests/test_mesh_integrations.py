"""Testes para pontes RAGFlow, n8n, OpenRouter :free e Hermes em Agentes Customizados e Subagentes."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import agents.context_builder as cb
from core.mesh_integrations import (
    N8NBridge,
    Neo4jAuraBridge,
    Neo4jQueryResult,
    RAGFlowBridge,
    RAGFlowCitation,
    RAGFlowRetrievalResult,
    build_agent_integrations_block,
    get_mesh_capability_snapshot,
)
from core.schemas import Task
from core.subagents_mesh import (
    SubagentMeshController,
    SubagentMissionRequest,
    SubagentTier,
)
from llm.free_router import SOTAUnifiedFreeRouter


@pytest.fixture(autouse=True)
def _isolate_host_mesh_env(monkeypatch):
    """Isola variaveis HKCU/HKLM carregadas no startup para nao vazar credenciais reais em testes unitarios."""
    import os  # noqa: PLC0415

    from core.mesh_integrations import (  # noqa: PLC0415
        _DEVIN_RING,
        _DOCKER_RING,
        _N8N_RING,
        _NEO4J_RING,
        _RAGFLOW_RING,
        _VERCEL_RING,
    )

    prefixes = ("RAGFLOW_", "N8N_", "NEO4J_AURA_", "DEVIN_", "VERCEL_", "DOCKER_")
    for env_name in list(os.environ):
        if env_name.startswith(prefixes):
            monkeypatch.delenv(env_name, raising=False)
    for ring in (_RAGFLOW_RING, _N8N_RING, _NEO4J_RING, _DEVIN_RING, _VERCEL_RING, _DOCKER_RING):
        ring.reset()


def _make_fake_session(status: int, json_body: dict):
    resp = MagicMock()
    resp.status = status
    resp.json = AsyncMock(return_value=json_body)
    resp.__aenter__ = AsyncMock(return_value=resp)
    resp.__aexit__ = AsyncMock(return_value=False)

    session = MagicMock()
    session.post = MagicMock(return_value=resp)
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=False)
    return session


@pytest.mark.asyncio
async def test_ragflow_bridge_unconfigured_and_retrieval(monkeypatch):
    monkeypatch.delenv("RAGFLOW_API_KEY", raising=False)
    monkeypatch.delenv("RAGFLOW_DATASET_IDS", raising=False)
    assert RAGFlowBridge.is_configured() is False

    res_empty = await RAGFlowBridge.retrieve_grounded_context("pmev icm")
    assert res_empty.configured is False
    assert res_empty.ok is False

    monkeypatch.setenv("RAGFLOW_API_BASE", "http://169.254.169.254")
    monkeypatch.setenv("RAGFLOW_API_KEY", "rf-test")
    monkeypatch.setenv("RAGFLOW_DATASET_IDS", "ds_1")
    assert RAGFlowBridge.is_configured() is False

    monkeypatch.setenv("RAGFLOW_API_BASE", "http://127.0.0.1:9380")
    assert RAGFlowBridge.is_configured() is True

    fake_session = _make_fake_session(
        200,
        {
            "code": 0,
            "data": {
                "chunks": [
                    {
                        "document_id": "doc-42",
                        "document_keyword": "pmev_notes.pdf",
                        "similarity": 0.912,
                        "content": "PMev corrige assimetria de risco alem do ICM classico.",
                    }
                ]
            },
        },
    )
    with patch("core.mesh_integrations.aiohttp.ClientSession", return_value=fake_session):
        res = await RAGFlowBridge.retrieve_grounded_context("explique PMev", thinking_depth="high")

    assert res.ok is True
    assert len(res.citations) == 1
    assert res.citations[0].document_name == "pmev_notes.pdf"
    block = res.format_context_block()
    assert "[RAGFLOW GROUNDED CITATIONS]" in block
    assert "[RF-1] pmev_notes.pdf (score=0.912)" in block


@pytest.mark.asyncio
async def test_n8n_bridge_guards_and_dispatch(monkeypatch):
    monkeypatch.delenv("N8N_WEBHOOK_BASE", raising=False)
    monkeypatch.delenv("N8N_API_BASE", raising=False)
    monkeypatch.delenv("N8N_API_KEY", raising=False)
    assert N8NBridge.is_configured() is False

    monkeypatch.setenv("N8N_WEBHOOK_BASE", "http://127.0.0.1:5678/webhook")
    monkeypatch.setenv("N8N_API_KEY", "n8n-secret")
    assert N8NBridge.is_configured() is True

    bad = await N8NBridge.dispatch_event({"ok": True}, webhook_path="../etc/passwd")
    assert bad.dispatched is False
    assert bad.error == "invalid_webhook_path"

    fake_session = _make_fake_session(200, {"started": True})
    with patch("core.mesh_integrations.aiohttp.ClientSession", return_value=fake_session):
        res = await N8NBridge.dispatch_event({"task_id": "T1"}, webhook_path="chico/notify")

    assert res.dispatched is True
    assert res.status_code == 200
    assert res.target == "http://127.0.0.1:5678/webhook/chico/notify"


@pytest.mark.asyncio
async def test_subagents_mesh_ragflow_and_n8n_integration(monkeypatch):
    monkeypatch.setenv("RAGFLOW_API_BASE", "http://127.0.0.1:9380")
    monkeypatch.setenv("RAGFLOW_API_KEY", "rf-key")
    monkeypatch.setenv("RAGFLOW_DATASET_IDS", "ds_poker")
    monkeypatch.setenv("N8N_WEBHOOK_BASE", "http://127.0.0.1:5678/webhook")

    ctrl = SubagentMeshController()
    assert (
        ctrl.route_task_to_subagent(
            Task(
                id="T_RF",
                description="Ingest PDF via ragflow deepdoc",
                agent="@subagent",
                timestamp="2026-11-15T19:00:00Z",
            )
        )
        == SubagentTier.RESEARCH
    )
    assert (
        ctrl.route_task_to_subagent(
            Task(
                id="T_N8N",
                description="Trigger n8n webhook notify",
                agent="@subagent",
                timestamp="2026-11-15T19:00:00Z",
            )
        )
        == SubagentTier.NANO_ROUTER
    )

    captured_prompts: list[str] = []

    async def fake_infer(assigned_model: str, tier_value: str, prompt: str, timeout_seconds: int):
        captured_prompts.append(prompt)
        return "Sintese fundamentada [RF-1].", {"inference_mode": "real_ollama"}

    fake_rag_res = RAGFlowRetrievalResult(
        configured=True,
        ok=True,
        citations=(RAGFlowCitation("d1", "icm_pmev.pdf", 0.88, "Risco assimetrico na mesa final."),),
    )
    with (
        patch.object(RAGFlowBridge, "retrieve_grounded_context", new=AsyncMock(return_value=fake_rag_res)),
        patch.object(SubagentMeshController, "_call_ollama_inference", side_effect=fake_infer),
        patch.object(
            N8NBridge, "dispatch_event", new=AsyncMock(return_value=MagicMock(dispatched=True, status_code=200))
        ),
    ):
        req = SubagentMissionRequest(
            mission_id="M_RF_01",
            tier=SubagentTier.RESEARCH,
            prompt="Resuma risco assimetrico em mesa final com base nos docs",
            thinking_depth="high",
            n8n_webhook_path="subagent/done",
        )
        res = await ctrl.execute_subagent_pipeline(req)

    assert res.status == "SUCCESS"
    assert res.metadata["ragflow_citations"] == 1
    assert res.metadata["n8n_dispatched"] is True
    assert "[RAGFLOW GROUNDED CITATIONS]" in captured_prompts[0]
    assert "[RF-1] icm_pmev.pdf" in captured_prompts[0]


@pytest.mark.asyncio
async def test_custom_agents_context_builder_merges_ragflow_and_integrations(monkeypatch):
    monkeypatch.setenv("RAGFLOW_API_BASE", "http://127.0.0.1:9380")
    monkeypatch.setenv("RAGFLOW_API_KEY", "rf-key")
    monkeypatch.setenv("RAGFLOW_DATASET_IDS", "ds_core")
    monkeypatch.setenv("N8N_WEBHOOK_BASE", "http://127.0.0.1:5678/webhook")

    task = Task(
        id="CA-1",
        description="Pesquisar estado da arte PMev e acionar webhook n8n",
        agent="@pesquisador",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={"n8n_webhook_path": "agent/done"},
    )
    fake_rag = MagicMock()
    fake_rag.query_memory = AsyncMock(return_value="[MEMORIA LOCAL]\nNota previa.")
    fake_ragflow = RAGFlowRetrievalResult(
        configured=True,
        ok=True,
        citations=(RAGFlowCitation("doc9", "theory.pdf", 0.94, "Teorema de Vitoi."),),
    )

    with (
        patch("core.runtime.get_rag", return_value=fake_rag),
        patch.object(RAGFlowBridge, "retrieve_grounded_context", new=AsyncMock(return_value=fake_ragflow)),
    ):
        combined, _ms = await cb._query_collective_memory(task, n_rag_results=5)

    assert "[MEMORIA LOCAL]" in combined
    assert "[RAGFLOW GROUNDED CITATIONS]" in combined
    assert "[RF-1] theory.pdf" in combined

    block = build_agent_integrations_block(
        task.description,
        task.metadata,
        ragflow_citations_count=1,
    )
    assert "[INTEGRACOES DA MALHA SOTA ATIVAS]" in block
    assert "RAGFlow Agentic Retrieval" in block
    assert "n8n Automation Bridge" in block

    snap = get_mesh_capability_snapshot()
    assert snap["ragflow"] is True
    assert snap["n8n"] is True


@pytest.mark.asyncio
async def test_free_router_openrouter_rotates_keys_and_free_models():
    router = SOTAUnifiedFreeRouter(google_api_keys=["gk1"], openrouter_keys=["or-bad", "or-good"])
    attempts: list[tuple[str, str]] = []

    async def fake_post(url: str, headers: dict, json: dict):
        auth = headers["Authorization"]
        model = json["model"]
        attempts.append((auth, model))
        resp = MagicMock()
        if auth == "Bearer or-bad":
            resp.raise_for_status = MagicMock(side_effect=RuntimeError("429 rate limited"))
            return resp
        resp.raise_for_status = MagicMock()
        resp.json = MagicMock(return_value={"choices": [{"message": {"content": "ok via rotation"}}]})
        return resp

    fake_client = MagicMock()
    fake_client.post = AsyncMock(side_effect=fake_post)
    fake_client.__aenter__ = AsyncMock(return_value=fake_client)
    fake_client.__aexit__ = AsyncMock(return_value=False)

    with patch("llm.free_router.httpx.AsyncClient", return_value=fake_client):
        res = await router._call_openrouter("Analise complexa", complexity_score=4)

    assert res["provider"] == "openrouter-free"
    assert res["model"] == "poolside/laguna-s-2.1:free"
    assert res["output"] == "ok via rotation"
    assert all(":free" in m for _, m in attempts)


@pytest.mark.asyncio
async def test_neo4j_aura_bridge_oauth_and_query_v2(monkeypatch):
    monkeypatch.delenv("NEO4J_AURA_INSTANCE_ID", raising=False)
    monkeypatch.delenv("NEO4J_AURA_QUERY_URL", raising=False)
    monkeypatch.delenv("NEO4J_AURA_CLIENT_ID", raising=False)
    monkeypatch.delenv("NEO4J_AURA_CLIENT_SECRET", raising=False)
    monkeypatch.delenv("NEO4J_AURA_BEARER_TOKEN", raising=False)
    monkeypatch.delenv("NEO4J_AURA_API_KEY", raising=False)
    assert Neo4jAuraBridge.is_configured() is False

    monkeypatch.setenv("NEO4J_AURA_INSTANCE_ID", "demo1234")
    monkeypatch.setenv("NEO4J_AURA_CLIENT_ID", "cid-demo")
    monkeypatch.setenv("NEO4J_AURA_CLIENT_SECRET", "csec-demo")
    monkeypatch.setattr(Neo4jAuraBridge, "_token_cache", ("", 0.0))

    assert Neo4jAuraBridge.is_configured() is True
    assert Neo4jAuraBridge.query_url() == "https://demo1234.databases.neo4j.io/db/neo4j/query/v2"
    assert Neo4jAuraBridge.mcp_url() == "https://demo1234.mcp-instances.neo4j.io"

    calls: list[str] = []

    def fake_post(url: str, **kwargs):
        calls.append(url)
        resp = MagicMock()
        resp.status = 200
        if "oauth/token" in url:
            resp.json = AsyncMock(return_value={"access_token": "tok-abc", "expires_in": 600})
        else:
            resp.json = AsyncMock(
                return_value={
                    "data": {
                        "fields": ["node", "rel", "neighbor"],
                        "values": [["PMev", "SUPERSEDES", "ICMev"]],
                    }
                }
            )
        resp.__aenter__ = AsyncMock(return_value=resp)
        resp.__aexit__ = AsyncMock(return_value=False)
        return resp

    session = MagicMock()
    session.post = MagicMock(side_effect=fake_post)
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=False)

    with patch("core.mesh_integrations.aiohttp.ClientSession", return_value=session):
        res = await Neo4jAuraBridge.query_graph_context("PMev risk asymmetry", limit=3)

    assert res.ok is True
    assert len(res.rows) == 1
    assert res.rows[0]["rel"] == "SUPERSEDES"
    assert calls == [
        "https://api.neo4j.io/oauth/token",
        "https://demo1234.databases.neo4j.io/db/neo4j/query/v2",
    ]
    block = res.format_context_block()
    assert "[NEO4J AURA GRAPH CONTEXT]" in block
    assert "[G-1]" in block


@pytest.mark.asyncio
async def test_subagents_and_custom_agents_use_neo4j_aura_graph(monkeypatch):
    monkeypatch.setenv("NEO4J_AURA_INSTANCE_ID", "demo1234")
    monkeypatch.setenv("NEO4J_AURA_BEARER_TOKEN", "tok-test")
    monkeypatch.delenv("RAGFLOW_API_KEY", raising=False)
    monkeypatch.delenv("N8N_WEBHOOK_BASE", raising=False)

    ctrl = SubagentMeshController()
    assert (
        ctrl.route_task_to_subagent(
            Task(
                id="T_G",
                description="Query Neo4j cypher knowledge graph",
                agent="@subagent",
                timestamp="2026-11-15T19:00:00Z",
            )
        )
        == SubagentTier.RESEARCH
    )

    captured_prompts: list[str] = []

    async def fake_infer(assigned_model: str, tier_value: str, prompt: str, timeout_seconds: int):
        captured_prompts.append(prompt)
        return "Analise de grafo [G-1].", {"inference_mode": "real_ollama"}

    fake_graph = Neo4jQueryResult(
        configured=True,
        ok=True,
        rows=({"node": "ICMev", "rel": "CONTRADICTS", "neighbor": "AsymmetricRisk"},),
    )
    with (
        patch.object(Neo4jAuraBridge, "query_graph_context", new=AsyncMock(return_value=fake_graph)),
        patch.object(SubagentMeshController, "_call_ollama_inference", side_effect=fake_infer),
    ):
        req = SubagentMissionRequest(
            mission_id="M_N4J_01",
            tier=SubagentTier.RESEARCH,
            prompt="Analyze knowledge graph relations for ICMev",
            use_neo4j=True,
        )
        res = await ctrl.execute_subagent_pipeline(req)

    assert res.status == "SUCCESS"
    assert res.metadata["neo4j_graph_rows"] == 1
    assert "[NEO4J AURA GRAPH CONTEXT]" in captured_prompts[0]
    assert "[G-1]" in captured_prompts[0]

    block = build_agent_integrations_block("Consultar grafo Neo4j", {"use_neo4j": True}, neo4j_rows_count=1)
    assert "Neo4j Aura L4 Graph ativo" in block
    assert "https://demo1234.mcp-instances.neo4j.io" in block
    snap = get_mesh_capability_snapshot()
    assert snap["neo4j_aura"] is True


@pytest.mark.asyncio
async def test_subagent_llama_cpp_falls_back_to_llama_swap_8080(monkeypatch):
    monkeypatch.setenv("CHICO_LLAMA_API_BASE", "http://127.0.0.1:9931")
    monkeypatch.setenv("CHICO_LLAMA_SWAP_BASE", "http://127.0.0.1:8080")
    monkeypatch.setenv("CHICO_LLAMA_SWAP_MODEL", "qwen-moe")

    ctrl = SubagentMeshController()
    called: list[tuple[str, str]] = []

    def fake_post(url: str, json: dict, **kwargs):
        called.append((url, str(json.get("model", ""))))
        if ":9931" in url:
            raise ConnectionRefusedError("9931 offline")
        resp = MagicMock()
        if str(json.get("model", "")) != "qwen-moe":
            resp.status = 404
        else:
            resp.status = 200
            resp.json = AsyncMock(
                return_value={
                    "choices": [{"message": {"content": "Resposta via llama-swap 8080."}}],
                    "usage": {"prompt_tokens": 12, "completion_tokens": 8},
                }
            )
        resp.__aenter__ = AsyncMock(return_value=resp)
        resp.__aexit__ = AsyncMock(return_value=False)
        return resp

    session = MagicMock()
    session.post = MagicMock(side_effect=fake_post)
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=False)

    with patch("core.subagents_mesh.aiohttp.ClientSession", return_value=session):
        text, meta = await ctrl._call_llama_cpp_inference(
            assigned_model="qwen2.5:1.5b",
            system_instruction="sys",
            prompt="hello",
            timeout_seconds=10,
        )

    assert text == "Resposta via llama-swap 8080."
    assert meta["inference_mode"] == "real_llama_swap"
    assert meta["llama_cpp_model"] == "qwen-moe"
    assert meta["llama_cpp_endpoint"] == "http://127.0.0.1:8080"
    assert called[0][0] == "http://127.0.0.1:9931/v1/chat/completions"
    assert called[1][0] == "http://127.0.0.1:8080/v1/chat/completions"
    assert called[2] == ("http://127.0.0.1:8080/v1/chat/completions", "qwen-moe")


@pytest.mark.asyncio
async def test_custom_agent_local_client_and_strategy_fall_back_to_llama_swap_8080(monkeypatch):
    import urllib.error  # noqa: PLC0415

    from llm.local_llama_client import DEFAULT_LLAMA_SWAP_PORT, LocalLlamaClient  # noqa: PLC0415
    from llm.providers import GemmaLocalStrategy, _check_local_llama_availability  # noqa: PLC0415

    client = LocalLlamaClient(port=8083, timeout=0.5)
    with patch.object(client, "_probe_port_health", side_effect=lambda p, timeout_s=1.0: p == DEFAULT_LLAMA_SWAP_PORT):
        assert client.is_healthy() is True
        assert client._effective_port == DEFAULT_LLAMA_SWAP_PORT

    with (
        patch("llm.system2_local.edge_proxy_online", return_value=False),
        patch(
            "llm.local_llama_client.LocalLlamaClient._probe_port_health",
            side_effect=lambda p, timeout_s=1.0: p == DEFAULT_LLAMA_SWAP_PORT,
        ),
    ):
        assert _check_local_llama_availability("qwen2.5-coder") is True

    posted_ports: list[int] = []

    def fake_post_chat(target_port: int, payload: dict):
        posted_ports.append(target_port)
        if target_port != DEFAULT_LLAMA_SWAP_PORT:
            raise urllib.error.URLError("offline")
        return {"choices": [{"message": {"content": "ok-sync-8080"}}]}

    client_sync = LocalLlamaClient(port=8083, timeout=0.5)
    with patch.object(client_sync, "_post_chat", side_effect=fake_post_chat):
        res_sync = client_sync.chat_completion([{"role": "user", "content": "ping"}])
    assert res_sync["choices"][0]["message"]["content"] == "ok-sync-8080"
    assert posted_ports == [8083, 9931, 8080]

    def fake_async_post(url: str, json: dict, **kwargs):
        if ":9931" in url:
            raise ConnectionRefusedError("9931 offline")
        resp = MagicMock()
        resp.status = 200
        resp.json = AsyncMock(
            return_value={
                "choices": [{"message": {"content": "ok-async-8080"}}],
                "usage": {"prompt_tokens": 5, "completion_tokens": 3},
            }
        )
        resp.__aenter__ = AsyncMock(return_value=resp)
        resp.__aexit__ = AsyncMock(return_value=False)
        return resp

    session = MagicMock()
    session.post = MagicMock(side_effect=fake_async_post)
    strategy = GemmaLocalStrategy()
    monkeypatch.setenv("CHICO_LLAMA_API_BASE", "http://127.0.0.1:9931")
    monkeypatch.setenv("CHICO_LLAMA_SWAP_BASE", "http://127.0.0.1:8080")
    with patch("llm.providers.call_gemma_local", side_effect=ConnectionError("17043 down")):
        content, usage = await strategy.call(
            session=session,
            model="gemma-4",
            system_prompt="sys",
            user_prompt="hi",
            key="local",
            client_timeout=None,
            require_json=False,
        )
    assert content == "ok-async-8080"
    assert usage["local_fallback_endpoint"] == "http://127.0.0.1:8080"


def test_infra_docker_compose_wiring_and_no_plaintext_secrets():
    from pathlib import Path  # noqa: PLC0415

    import yaml  # noqa: PLC0415

    repo_root = Path(__file__).resolve().parent.parent
    compose_path = repo_root / "infra" / "docker-compose.yml"
    env_example_path = repo_root / "infra" / ".env.example"

    compose_raw = compose_path.read_text(encoding="utf-8")
    env_raw = env_example_path.read_text(encoding="utf-8")
    parsed = yaml.safe_load(compose_raw)

    services = parsed["services"]
    assert "n8n" in services
    assert "ragflow" in services
    n8n_env = services["n8n"]["environment"]
    ragflow_env = services["ragflow"]["environment"]

    assert n8n_env["OPENROUTER_BASE_URL"] == "https://openrouter.ai/api/v1"
    assert n8n_env["OLLAMA_BASE_URL"] == "http://host.docker.internal:11434"
    assert n8n_env["LLAMA_CPP_BASE_URL"] == "http://host.docker.internal:9931/v1"
    assert n8n_env["LLAMA_SWAP_BASE_URL"] == "http://host.docker.internal:8080/v1"
    assert ragflow_env["OLLAMA_API_BASE"] == "http://host.docker.internal:11434"
    assert ragflow_env["LLAMA_CPP_API_BASE"] == "http://host.docker.internal:9931/v1"
    assert ragflow_env["LLAMA_SWAP_API_BASE"] == "http://host.docker.internal:8080/v1"

    combined = compose_raw + "\n" + env_raw
    for forbidden_prefix in ("dckr_pat_", "ragflow-X7", "sk-or-v1-", "nfSRSz"):
        assert forbidden_prefix not in combined


@pytest.mark.asyncio
async def test_service_keyring_rotation_devin_vercel_and_ragflow_plan_exception(monkeypatch):
    from core.mesh_integrations import (  # noqa: PLC0415
        _DEVIN_RING,
        _RAGFLOW_RING,
        _VERCEL_RING,
        DevinBridge,
        ServiceKeyRing,
        VercelBridge,
    )

    ring = ServiceKeyRing("demo", ("DEMO_KEY",))
    monkeypatch.setenv("DEMO_KEY", "k-slot-0")
    monkeypatch.setenv("DEMO_KEY_1", "k-slot-1")
    monkeypatch.setenv("DEMO_KEY_2", "k-slot-0")  # duplicate deduplicated
    assert ring.candidates() == ["k-slot-0", "k-slot-1"]

    ring.mark_unauthorized("k-slot-0")
    assert ring.active_keys() == ["k-slot-1"]
    telem = ring.telemetry()
    assert telem["total"] == 2
    assert telem["active"] == 1
    assert telem["revoked"] == 1
    assert all(len(s) == 8 for s in telem["sha8s"])
    assert "k-slot-0" not in str(telem)

    _DEVIN_RING.reset()
    _VERCEL_RING.reset()
    _RAGFLOW_RING.reset()

    monkeypatch.setenv("DEVIN_API_TOKEN", "tok-devin-bad")
    monkeypatch.setenv("DEVIN_API_TOKEN_1", "tok-devin-bad")
    monkeypatch.setenv("DEVIN_API_KEY", "tok-devin-good")
    monkeypatch.setenv("DEVIN_ORG_ID", "org-demo")
    monkeypatch.setenv("VERCEL_TOKEN", "tok-vercel-good")
    monkeypatch.setenv("VERCEL_USER_ID", "uid-demo")
    monkeypatch.setenv("VERCEL_USERNAME", "user-demo")
    monkeypatch.setenv("RAGFLOW_API_KEY", "tok-rag-free")
    monkeypatch.setenv("RAGFLOW_API_BASE", "https://cloud.ragflow.io")
    monkeypatch.setenv("RAGFLOW_DATASET_IDS", "ds-1")
    monkeypatch.setenv("DOCKER_PAT", "tok-docker-demo")

    def fake_get(url: str, headers: dict, **kwargs):
        auth = headers.get("Authorization", "")
        resp = MagicMock()
        if "api.devin.ai/v3/self" in url:
            if "tok-devin-bad" in auth:
                resp.status = 403
            else:
                resp.status = 200
                resp.json = AsyncMock(return_value={"org_id": "org-demo", "user_name": "chico"})
        elif "api.vercel.com/v2/user" in url:
            resp.status = 200
            resp.json = AsyncMock(return_value={"user": {"id": "uid-demo", "username": "user-demo"}})
        else:
            resp.status = 404
        resp.__aenter__ = AsyncMock(return_value=resp)
        resp.__aexit__ = AsyncMock(return_value=False)
        return resp

    def fake_post(url: str, **kwargs):
        resp = MagicMock()
        resp.status = 200
        resp.json = AsyncMock(return_value={"code": 403, "message": "You need to upgrade to a Starter or Pro plan"})
        resp.__aenter__ = AsyncMock(return_value=resp)
        resp.__aexit__ = AsyncMock(return_value=False)
        return resp

    session = MagicMock()
    session.get = MagicMock(side_effect=fake_get)
    session.post = MagicMock(side_effect=fake_post)
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=False)

    with patch("core.mesh_integrations.aiohttp.ClientSession", return_value=session):
        devin_res = await DevinBridge.check_self()
        vercel_res = await VercelBridge.check_user()
        rag_res = await RAGFlowBridge.retrieve_grounded_context("PMev risk")

    assert devin_res["ok"] is True
    assert devin_res["org_id"] == "org-demo"
    assert vercel_res["ok"] is True
    assert vercel_res["username"] == "user-demo"
    assert rag_res.configured is True
    assert rag_res.ok is False
    assert "plan_upgrade_required" in rag_res.error

    snap = get_mesh_capability_snapshot()
    assert snap["devin"] is True
    assert snap["vercel"] is True
    assert snap["docker_registry"] is True
    assert snap["rotation_pools"]["devin"]["revoked"] == 1
    assert snap["rotation_pools"]["vercel"]["active"] == 1

    block = build_agent_integrations_block("Verificar deploy Vercel e Devin ACU")
    assert "Devin API v3 Bridge ativo" in block
    assert "Vercel REST Bridge ativo" in block

    _DEVIN_RING.reset()
    _VERCEL_RING.reset()
    _RAGFLOW_RING.reset()
