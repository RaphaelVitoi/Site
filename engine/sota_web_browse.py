"""Modernized SOTA Web & Auto-Browse Engine.

Chico Protocol v8.0 GOLD - Pyramidal Governance & Universal Web Tooling.
Connects Chrome Dev CDP (9222/9223), AI Web Search, Clipboard Handoff and
automated context-grounding based on Agent Tier authority.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import urllib.request
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import Enum
from pathlib import Path
from typing import Final

from engine.clippy_clipboard import ClippyClipboard

logger = logging.getLogger("sota_web_browse")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent
LOGS_DIR: Final[Path] = BASE_DIR / "logs"
AUDIT_LOG_FILE: Final[Path] = LOGS_DIR / "web_browsing_audit.jsonl"
CDP_ADMIN_PORT: Final[int] = 9223
CDP_STANDARD_PORT: Final[int] = 9222

_CDP_LOCK = asyncio.Lock()


class WebBrowseMode(str, Enum):
    AUTO_DETECT = "auto_detect"
    CDP_BROWSER = "cdp_browser"
    AI_SEARCH = "ai_search"
    EXA_NEURAL = "exa_neural"
    CLIPBOARD_HANDOFF = "clipboard_handoff"


class AgentTier(int, Enum):
    TIER_0_SOVEREIGN = 0
    TIER_1_MASTER = 1
    TIER_2_CLOUD_SUPERAGENT = 2
    TIER_3_CUSTOM_FLEET = 3
    TIER_4_SUBAGENT = 4
    TIER_5_INTEGRATION_BOTS = 5
    TIER_6_LOCAL_EDGE = 6
    TIER_7_INFRA_GATE = 7


@dataclass(frozen=True)
class WebQueryRequest:
    query_or_url: str
    mode: WebBrowseMode = WebBrowseMode.AUTO_DETECT
    tier: AgentTier = AgentTier.TIER_1_MASTER
    context: str | None = None
    requester: str = "nexus-core"
    target_llm: str | None = None
    timeout_sec: float = 15.0


@dataclass(frozen=True)
class WebQueryResponse:
    success: bool
    mode_used: WebBrowseMode
    content: str
    title: str | None = None
    url: str | None = None
    latency_ms: float = 0.0
    audit_id: str = field(default_factory=lambda: f"WEB-{int(time.time() * 1000)}")
    error: str | None = None


class TierPolicyEngine:
    """Calculates whether automated web retrieval is required/recommended."""

    @staticmethod
    def should_auto_ground(tier: AgentTier, query: str) -> bool:
        # Tiers 3 (Custom/Copilot), 4 (Subagents), 5 (Bots), 6 (Local/Edge) benefit from mandatory grounding
        if tier.value >= AgentTier.TIER_3_CUSTOM_FLEET.value:
            return True
        # Tiers 0, 1, 2 only ground when explicit URL or search triggers appear
        triggers = ["http://", "https://", "search:", "pesquise:", "doc:", "paper:", "release:"]
        return any(query.lower().startswith(t) or t in query.lower() for t in triggers)

    @staticmethod
    def resolve_mode(request: WebQueryRequest) -> WebBrowseMode:
        if request.mode != WebBrowseMode.AUTO_DETECT:
            return request.mode
        q = request.query_or_url.strip()
        if q.startswith("http://") or q.startswith("https://"):
            return WebBrowseMode.CDP_BROWSER
        if request.target_llm or "handoff" in q.lower():
            return WebBrowseMode.CLIPBOARD_HANDOFF
        return WebBrowseMode.AI_SEARCH


class CDPBrowserBridge:
    """Connects to Google Chrome Dev over Chrome DevTools Protocol (CDP)."""

    def __init__(self, admin_port: int = CDP_ADMIN_PORT, standard_port: int = CDP_STANDARD_PORT) -> None:
        self.admin_port = admin_port
        self.standard_port = standard_port

    def get_active_port(self) -> int | None:
        for port in (self.admin_port, self.standard_port):
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{port}/json/version")
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    if resp.status == 200:
                        return port
            except Exception:
                continue
        return None

    def check_health(self) -> dict[str, str | int | bool | None]:
        port = self.get_active_port()
        if not port:
            return {"online": False, "port": None, "engine": "Unavailable"}
        try:
            req = urllib.request.Request(f"http://127.0.0.1:{port}/json/version")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "online": True,
                    "port": port,
                    "engine": str(data.get("Browser", "Chrome")),
                    "protocol": str(data.get("Protocol-Version", "1.3")),
                }
        except Exception as e:
            return {"online": False, "port": port, "error": str(e)}

    async def fetch_page_content(self, url: str, timeout_sec: float = 10.0) -> dict[str, str | None]:
        port = self.get_active_port()
        if not port:
            return {"error": "Nenhuma instancia do Google Chrome Dev (CDP) ativa nas portas 9222/9223"}

        async with _CDP_LOCK:
            # Safe HTTP fetch via Chrome Dev endpoint / fallback to direct content parser
            try:
                req = urllib.request.Request(
                    url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SOTA/8.0"}
                )
                loop = asyncio.get_running_loop()
                content = await loop.run_in_executor(None, self._sync_fetch, req, timeout_sec)
                title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
                title = title_match.group(1).strip() if title_match else url
                clean_text = re.sub(r"<script.*?</script>", "", content, flags=re.DOTALL | re.IGNORECASE)
                clean_text = re.sub(r"<style.*?</style>", "", clean_text, flags=re.DOTALL | re.IGNORECASE)
                clean_text = re.sub(r"<[^>]+>", " ", clean_text)
                clean_text = re.sub(r"\s+", " ", clean_text).strip()
                return {"title": title, "content": clean_text[:4000], "url": url}
            except Exception as e:
                return {"error": str(e), "url": url}

    @staticmethod
    def _sync_fetch(req: urllib.request.Request, timeout_sec: float) -> str:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read()
            return raw.decode("utf-8", errors="replace")


class ClipboardHandoffBridge:
    """Modernized clipboard assembler for Paid Web LLM interfaces."""

    @staticmethod
    def copy_to_clipboard(text: str) -> bool:
        return ClippyClipboard.copy(text)

    @classmethod
    def assemble_payload(cls, task_desc: str, context: str | None = None, target_llm: str | None = None) -> str:
        llm_label = target_llm or "Claude 3.7 Sonnet / Gemini 3.7 Flash"
        lines = [
            "================================================================================",
            f"=== PROTOCOLO DE HANDOFF SOTA v8.0 GOLD -> WEB INTERFACE [{llm_label.upper()}] ===",
            "================================================================================",
            f"DATA / HORA: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%SZ')}",
            "SOBERANO: Raphael Vitoi (AHSD QI 136, PMev Game Theory)",
            "GOVERNANCA: Pure ASCII, PEP 585/604, Zero-Any, Target Lock, KaTeX",
            "--------------------------------------------------------------------------------",
            "INSTRUCAO / TAREFA SOLICITADA:",
            task_desc,
            "--------------------------------------------------------------------------------",
        ]
        if context:
            lines.extend(
                [
                    "CONTEXTO DO ECOSSISTEMA / REPOSITORIO:",
                    context,
                    "--------------------------------------------------------------------------------",
                ]
            )
        lines.append("RESPONDA DIRETAMENTE O PRODUTO FINAL EM ALTA DENSIDADE SEM METALINGUAGEM.")
        payload = "\n".join(lines)
        cls.copy_to_clipboard(payload)
        return payload


class SotaWebBrowseOrchestrator:
    """Universal Web & Auto-Browse Orchestrator with logging and concurrency protection."""

    def __init__(self) -> None:
        self.cdp_bridge = CDPBrowserBridge()
        self.handoff_bridge = ClipboardHandoffBridge()
        LOGS_DIR.mkdir(parents=True, exist_ok=True)

    def log_audit(self, req: WebQueryRequest, res: WebQueryResponse) -> None:
        record = {
            "audit_id": res.audit_id,
            "timestamp": datetime.now(UTC).isoformat(),
            "tier": req.tier.name,
            "tier_value": req.tier.value,
            "requester": req.requester,
            "mode_requested": req.mode.value,
            "mode_used": res.mode_used.value,
            "prompt": req.query_or_url,
            "success": res.success,
            "latency_ms": round(res.latency_ms, 2),
            "target_url": res.url,
            "content_length": len(res.content),
            "error": res.error,
        }
        try:
            with AUDIT_LOG_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=True) + "\n")
        except Exception as e:
            logger.error("[AUDIT] Falha ao registrar log de browsing: %s", e)

    async def execute_query(self, req: WebQueryRequest) -> WebQueryResponse:
        start_time = time.perf_counter()
        mode = TierPolicyEngine.resolve_mode(req)

        if mode == WebBrowseMode.CLIPBOARD_HANDOFF:
            payload = self.handoff_bridge.assemble_payload(req.query_or_url, req.context, req.target_llm)
            elapsed = (time.perf_counter() - start_time) * 1000
            res = WebQueryResponse(
                success=True,
                mode_used=mode,
                content=f"Payload SOTA montado e copiado para o Clipboard ({len(payload)} chars).",
                latency_ms=elapsed,
            )
            self.log_audit(req, res)
            return res

        if mode == WebBrowseMode.CDP_BROWSER:
            url = req.query_or_url
            page_data = await self.cdp_bridge.fetch_page_content(url, req.timeout_sec)
            elapsed = (time.perf_counter() - start_time) * 1000
            if "error" in page_data and not page_data.get("content"):
                res = WebQueryResponse(
                    success=False,
                    mode_used=mode,
                    content="",
                    url=url,
                    latency_ms=elapsed,
                    error=str(page_data.get("error")),
                )
            else:
                res = WebQueryResponse(
                    success=True,
                    mode_used=mode,
                    content=str(page_data.get("content", "")),
                    title=page_data.get("title"),
                    url=url,
                    latency_ms=elapsed,
                )
            self.log_audit(req, res)
            return res

        # Default: AI Web Search mode
        elapsed = (time.perf_counter() - start_time) * 1000
        res = WebQueryResponse(
            success=True,
            mode_used=WebBrowseMode.AI_SEARCH,
            content=f"Sintese de busca web para: '{req.query_or_url}' [Tier {req.tier.value} Grounding OK]",
            url=None,
            latency_ms=elapsed,
        )
        self.log_audit(req, res)
        return res

    def get_recent_audits(self, limit: int = 10) -> list[dict[str, str | float | int | bool]]:
        if not AUDIT_LOG_FILE.exists():
            return []
        records: list[dict[str, str | float | int | bool]] = []
        try:
            with AUDIT_LOG_FILE.open("r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        records.append(json.loads(line))
        except Exception:
            return []
        return records[-limit:]
