"""Unit tests for modernized SOTA Web & Auto-Browse Engine.

Chico Protocol v8.0 GOLD - Pyramidal Governance & Universal Web Tooling.
"""
from __future__ import annotations

import asyncio
from pathlib import Path
import pytest

from engine.sota_web_browse import (
    AgentTier,
    CDPBrowserBridge,
    ClipboardHandoffBridge,
    SotaWebBrowseOrchestrator,
    TierPolicyEngine,
    WebBrowseMode,
    WebQueryRequest,
    WebQueryResponse,
)


class TestSotaWebBrowseEngine:
    """Test suite for SOTA Web & Auto-Browse components."""

    def test_pure_ascii_in_web_browse_engine(self) -> None:
        path = Path("engine/sota_web_browse.py")
        content = path.read_text(encoding="utf-8")
        try:
            content.encode("ascii")
        except UnicodeEncodeError as e:
            pytest.fail(f"engine/sota_web_browse.py contains non-ASCII character: {e}")

    def test_tier_policy_auto_grounding_hierarchy(self) -> None:
        # Tier 3 (Custom/Copilot), Tier 4 (Subagents), Tier 5 (Bots), Tier 6 (Local/Edge) must auto-ground
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_3_CUSTOM_FLEET, "calculo de equidade") is True
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_4_SUBAGENT, "qual a cotacao") is True
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_5_INTEGRATION_BOTS, "atualizacao de CVE") is True
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_6_LOCAL_EDGE, "resumo da release") is True

        # Tier 0 (Sovereign) and Tier 1 (Master) only ground on explicit triggers
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_0_SOVEREIGN, "apenas logica interna") is False
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_1_MASTER, "apenas logica interna") is False
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_1_MASTER, "https://github.com/RaphaelVitoi/Site") is True
        assert TierPolicyEngine.should_auto_ground(AgentTier.TIER_1_MASTER, "doc: nextjs 16 turbopack") is True

    def test_tier_policy_mode_resolution(self) -> None:
        req_url = WebQueryRequest(query_or_url="https://web.dev/vitals")
        assert TierPolicyEngine.resolve_mode(req_url) == WebBrowseMode.CDP_BROWSER

        req_handoff = WebQueryRequest(query_or_url="refatorar modulo", target_llm="claude")
        assert TierPolicyEngine.resolve_mode(req_handoff) == WebBrowseMode.CLIPBOARD_HANDOFF

        req_search = WebQueryRequest(query_or_url="novidades no React 19")
        assert TierPolicyEngine.resolve_mode(req_search) == WebBrowseMode.AI_SEARCH

    def test_clipboard_handoff_payload_assembly(self) -> None:
        payload = ClipboardHandoffBridge.assemble_payload(
            task_desc="Implementar novo solver de ICM",
            context="Modulos: engine/vitoi_perspective_engine.py",
            target_llm="claude-3.7-sonnet",
        )
        assert "PROTOCOLO DE HANDOFF SOTA v8.0 GOLD" in payload
        assert "Raphael Vitoi" in payload
        assert "CLAUDE-3.7-SONNET" in payload
        assert "Implementar novo solver de ICM" in payload
        assert "Modulos: engine/vitoi_perspective_engine.py" in payload

    @pytest.mark.asyncio
    async def test_orchestrator_executes_ai_search_with_audit(self) -> None:
        orchestrator = SotaWebBrowseOrchestrator()
        req = WebQueryRequest(
            query_or_url="Teoremas de Vitoi e ICM dinamico",
            tier=AgentTier.TIER_3_CUSTOM_FLEET,
            requester="test-suite",
        )
        res = await orchestrator.execute_query(req)
        assert res.success is True
        assert res.mode_used == WebBrowseMode.AI_SEARCH
        assert "Teoremas de Vitoi" in res.content
        assert res.audit_id.startswith("WEB-")

        audits = orchestrator.get_recent_audits(limit=5)
        assert len(audits) >= 1
        last_audit = audits[-1]
        assert last_audit.get("requester") == "test-suite"
        assert last_audit.get("tier_value") == 3

    @pytest.mark.asyncio
    async def test_orchestrator_executes_clipboard_handoff(self) -> None:
        orchestrator = SotaWebBrowseOrchestrator()
        req = WebQueryRequest(
            query_or_url="Tarefa de Alta Complexidade",
            mode=WebBrowseMode.CLIPBOARD_HANDOFF,
            tier=AgentTier.TIER_0_SOVEREIGN,
            target_llm="gemini-advanced",
            requester="test-handoff",
        )
        res = await orchestrator.execute_query(req)
        assert res.success is True
        assert res.mode_used == WebBrowseMode.CLIPBOARD_HANDOFF
        assert "Payload SOTA montado" in res.content

    def test_cdp_browser_health_check_structure(self) -> None:
        bridge = CDPBrowserBridge(admin_port=9223, standard_port=9222)
        health = bridge.check_health()
        assert "online" in health
        assert isinstance(health["online"], bool)
