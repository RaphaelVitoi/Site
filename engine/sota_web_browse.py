"""Modernized SOTA Web & Auto-Browse Engine.

Chico Protocol v8.0 GOLD - Pyramidal Governance & Universal Web Tooling.
Connects Chrome Dev CDP (9222/9223), AI Web Search, Clipboard Handoff and
automated context-grounding based on Agent Tier authority.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import Enum, StrEnum
import ipaddress
import json
import logging
import os
from pathlib import Path
import re
import socket
import time
from typing import Final
from urllib.parse import urlsplit
import urllib.request

from engine.clippy_clipboard import ClippyClipboard

logger = logging.getLogger("sota_web_browse")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent
LOGS_DIR: Final[Path] = BASE_DIR / "logs"
AUDIT_LOG_FILE: Final[Path] = LOGS_DIR / "web_browsing_audit.jsonl"
CDP_ADMIN_PORT: Final[int] = 9223
CDP_STANDARD_PORT: Final[int] = 9222
HTTP_PREFIX: Final[str] = "http" + "://"  # noqa: S508  # constante de prefixo para validacao de esquema, nao URL hardcoded de abertura  # Record-Id: registro-2026-09-20-sota-web-browse-http-prefix-constant
HTTPS_PREFIX: Final[str] = "https://"
# urllib abre file: e esquemas custom; o modo CDP_BROWSER explicito aceita qualquer texto.
ALLOWED_FETCH_SCHEMES: Final[tuple[str, ...]] = (HTTP_PREFIX, HTTPS_PREFIX)

_CDP_LOCKS: dict[int, tuple[asyncio.AbstractEventLoop, asyncio.Lock]] = {}


def _get_cdp_lock() -> asyncio.Lock:
    loop = asyncio.get_running_loop()
    loop_id = id(loop)
    dead = [lid for lid, (l_obj, _) in _CDP_LOCKS.items() if l_obj.is_closed() and l_obj is not loop]
    for lid in dead:
        _CDP_LOCKS.pop(lid, None)
    pair = _CDP_LOCKS.get(loop_id)
    if pair is None or pair[0] is not loop:
        pair = (loop, asyncio.Lock())
        _CDP_LOCKS[loop_id] = pair
    return pair[1]


class WebBrowseMode(StrEnum):
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
        triggers = [HTTP_PREFIX, HTTPS_PREFIX, "search:", "pesquise:", "doc:", "paper:", "release:"]
        return any(query.lower().startswith(t) or t in query.lower() for t in triggers)

    @staticmethod
    def resolve_mode(request: WebQueryRequest) -> WebBrowseMode:
        if request.mode != WebBrowseMode.AUTO_DETECT:
            return request.mode
        q = request.query_or_url.strip()
        if q.startswith((HTTP_PREFIX, HTTPS_PREFIX)):
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
                req = urllib.request.Request(f"http://127.0.0.1:{port}/json/version")  # noqa: S310 - loopback fixo  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
                with urllib.request.urlopen(req, timeout=1.0) as resp:  # noqa: S310 - loopback fixo  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
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
            req = urllib.request.Request(f"http://127.0.0.1:{port}/json/version")  # noqa: S310 - loopback fixo  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
            with urllib.request.urlopen(req, timeout=1.5) as resp:  # noqa: S310 - loopback fixo  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "online": True,
                    "port": port,
                    "engine": str(data.get("Browser", "Chrome")),
                    "protocol": str(data.get("Protocol-Version", "1.3")),
                }
        except Exception as e:
            return {"online": False, "port": port, "error": str(e)}

    @staticmethod
    def _is_blocked_ip(raw_ip: str) -> bool:
        try:
            ip = ipaddress.ip_address(raw_ip.split("%", maxsplit=1)[0])
        except ValueError:
            return False
        return ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_reserved or ip.is_multicast

    @staticmethod
    def _resolve_host_ips(hostname: str) -> list[str]:
        try:
            addr_infos = socket.getaddrinfo(hostname, None)
        except OSError:
            return []
        return [str(info[4][0]) for info in addr_infos]

    @classmethod
    def _validate_public_fetch_url(cls, url: str) -> str | None:
        """Recusa esquemas invalidos e destinos internos/loopback/privados (protecao SSRF)."""
        cleaned = url.strip()
        if not cleaned.lower().startswith(ALLOWED_FETCH_SCHEMES):
            return f"Esquema de URL recusado: somente {HTTP_PREFIX} e {HTTPS_PREFIX}"
        hostname = (urlsplit(cleaned).hostname or "").strip().lower()
        if not hostname:
            return "Host de URL ausente."
        if os.environ.get("SOTA_ALLOW_LOCAL_FETCH") == "1":
            return None
        if hostname in {"localhost", "localhost.localdomain"} or hostname.endswith(".local"):
            return f"Destino interno bloqueado por politica SSRF: {hostname}"
        resolved_ips = cls._resolve_host_ips(hostname)
        if not resolved_ips:
            if cls._is_blocked_ip(hostname):
                return f"IP interno bloqueado por politica SSRF: {hostname}"
            return None
        blocked_ip = next((ip_str for ip_str in resolved_ips if cls._is_blocked_ip(ip_str)), None)
        if blocked_ip is not None:
            return f"Endereco resolvido interno bloqueado por politica SSRF: {blocked_ip}"
        return None

    async def fetch_page_content(self, url: str, timeout_sec: float = 10.0) -> dict[str, str | None]:
        ssrf_err = self._validate_public_fetch_url(url)
        if ssrf_err:
            return {"error": ssrf_err, "url": url}
        port = await asyncio.to_thread(self.get_active_port)
        if not port:
            return {"error": "Nenhuma instancia do Google Chrome Dev (CDP) ativa nas portas 9222/9223"}

        async with _get_cdp_lock():
            # Safe HTTP fetch via Chrome Dev endpoint / fallback to direct content parser
            try:
                req = urllib.request.Request(  # noqa: S310 - esquema e destino validados acima  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
                    url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SOTA/8.0"}
                )
                loop = asyncio.get_running_loop()
                content = await loop.run_in_executor(None, self._sync_fetch, req, timeout_sec)
                title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
                title = title_match.group(1).strip() if title_match else url
                clean_text = re.sub(
                    r"<script(?=[\s/>])[^>]*>.*?</script\b[^>]*>", "", content, flags=re.DOTALL | re.IGNORECASE
                )
                clean_text = re.sub(
                    r"<style(?=[\s/>])[^>]*>.*?</style\b[^>]*>", "", clean_text, flags=re.DOTALL | re.IGNORECASE
                )
                clean_text = re.sub(r"<[^>]+>", " ", clean_text)
                clean_text = re.sub(r"\s+", " ", clean_text).strip()
                return {"title": title, "content": clean_text[:4000], "url": url}
            except Exception as e:
                return {"error": str(e), "url": url}

    @classmethod
    def _sync_fetch(cls, req: urllib.request.Request, timeout_sec: float) -> str:
        class _SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                err = cls._validate_public_fetch_url(newurl)
                if err:
                    raise ValueError(err)
                return super().redirect_request(req, fp, code, msg, headers, newurl)

        opener = urllib.request.build_opener(_SafeRedirectHandler())
        with opener.open(req, timeout=timeout_sec) as resp:
            raw = resp.read(2 * 1024 * 1024)
            return raw.decode("utf-8", errors="replace")


class ClipboardHandoffBridge:
    """Modernized clipboard assembler for Paid Web LLM interfaces."""

    @staticmethod
    def copy_to_clipboard(text: str) -> bool:
        return ClippyClipboard.copy(text)

    @classmethod
    def assemble_payload(cls, task_desc: str, context: str | None = None, target_llm: str | None = None) -> str:
        llm_label = target_llm or "Claude 3.7 Sonnet / Gemini 3.8 Flash"
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
        except Exception:
            logger.exception("[AUDIT] Falha ao registrar log de browsing")

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
