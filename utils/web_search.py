# utils/web_search.py
# Nexus SOTA v7.0 GOLD - Universal Web Search Engine
# Providers: Tavily (primary) -> DuckDuckGo Lite (fallback, zero-cost)
# ASCII-pure. Zero-Any. Typed.
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Literal

import httpx

logger = logging.getLogger(__name__)

PROVIDER_TAVILY = "tavily"
PROVIDER_DDG = "duckduckgo"


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    score: float = 0.0
    provider: str = PROVIDER_TAVILY


@dataclass
class SearchResponse:
    query: str
    results: list[SearchResult] = field(default_factory=list)
    provider_used: str = ""
    latency_ms: float = 0.0
    error: str | None = None


class WebSearchEngine:
    """Unified web search engine with Tavily primary and DuckDuckGo fallback.

    Usage:
        engine = WebSearchEngine(tavily_api_key="tvly-...")
        response = await engine.search("latest AI news", max_results=5)
        for r in response.results:
            print(r.title, r.url)
    """

    TAVILY_ENDPOINT = "https://api.tavily.com/search"
    DDG_ENDPOINT = "https://lite.duckduckgo.com/lite/"
    TIMEOUT_S = 10.0

    def __init__(self, tavily_api_key: str = "") -> None:
        self._tavily_key = tavily_api_key

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def search(
        self,
        query: str,
        max_results: int = 5,
        preferred_provider: Literal["tavily", "duckduckgo", "auto"] = "auto",
    ) -> SearchResponse:
        """Search the web. Falls back from Tavily to DDG on any failure."""
        start = time.perf_counter()

        if preferred_provider == PROVIDER_DDG:
            resp = await self._search_ddg(query, max_results)
        elif preferred_provider == PROVIDER_TAVILY or (preferred_provider == "auto" and self._tavily_key):
            resp = await self._search_tavily(query, max_results)
            if resp.error:
                logger.warning("[WEB_SEARCH] Tavily failed (%s) - falling back to DDG", resp.error)
                resp = await self._search_ddg(query, max_results)
        else:
            resp = await self._search_ddg(query, max_results)

        resp.latency_ms = round((time.perf_counter() - start) * 1000, 1)
        return resp

    async def search_and_summarize(self, query: str, max_results: int = 5) -> str:
        """Search and return a markdown-formatted summary for RAG ingestion."""
        resp = await self.search(query, max_results=max_results)
        if not resp.results:
            return f"[WebSearch] No results for: {query}"
        lines: list[str] = [f"## Web Search: {query}\n"]
        for i, r in enumerate(resp.results, 1):
            lines.append(f"{i}. **{r.title}**")
            lines.append(f"   {r.snippet}")
            lines.append(f"   Source: {r.url}\n")
        lines.append(f"_Provider: {resp.provider_used} | Latency: {resp.latency_ms}ms_")
        return "\n".join(lines)

    def get_provider_status(self) -> dict[str, bool]:
        """Return health status of configured providers."""
        return {
            PROVIDER_TAVILY: bool(self._tavily_key),
            PROVIDER_DDG: True,  # always available, zero-cost
        }

    # ------------------------------------------------------------------
    # Tavily Provider
    # ------------------------------------------------------------------

    async def _search_tavily(self, query: str, max_results: int) -> SearchResponse:
        if not self._tavily_key:
            return SearchResponse(query=query, error="No Tavily API key configured")
        payload = {
            "api_key": self._tavily_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": False,
        }
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT_S) as client:
                r = await client.post(self.TAVILY_ENDPOINT, json=payload)
                r.raise_for_status()
                data: dict = r.json()
        except Exception as exc:
            return SearchResponse(query=query, provider_used=PROVIDER_TAVILY, error=str(exc))

        results: list[SearchResult] = []
        for item in data.get("results", []):
            results.append(
                SearchResult(
                    title=str(item.get("title", "")),
                    url=str(item.get("url", "")),
                    snippet=str(item.get("content", ""))[:500],
                    score=float(item.get("score", 0.0)),
                    provider=PROVIDER_TAVILY,
                )
            )
        return SearchResponse(query=query, results=results, provider_used=PROVIDER_TAVILY)

    # ------------------------------------------------------------------
    # DuckDuckGo Lite Provider (zero-cost fallback)
    # ------------------------------------------------------------------

    async def _search_ddg(self, query: str, max_results: int) -> SearchResponse:
        """Scrape DDG Lite HTML - no API key required."""
        try:
            async with httpx.AsyncClient(
                timeout=self.TIMEOUT_S,
                headers={"User-Agent": "Mozilla/5.0 (compatible; NexusBot/7.0)"},
                follow_redirects=True,
            ) as client:
                r = await client.post(
                    self.DDG_ENDPOINT,
                    data={"q": query, "kl": "br-pt"},
                )
                r.raise_for_status()
                html = r.text
        except Exception as exc:
            return SearchResponse(query=query, provider_used=PROVIDER_DDG, error=str(exc))

        results = _parse_ddg_html(html, max_results)
        return SearchResponse(query=query, results=results, provider_used=PROVIDER_DDG)


def _parse_ddg_html(html: str, max_results: int) -> list[SearchResult]:
    """Minimal HTML parser for DDG Lite results - no external deps."""
    import re

    results: list[SearchResult] = []
    # DDG Lite emits result snippets in <td class="result-snippet"> and links in <a>
    # Pattern: extract result blocks
    block_pattern = re.compile(
        r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>.*?<td class=["\']result-snippet["\']>([^<]+)',
        re.DOTALL,
    )
    for m in block_pattern.finditer(html):
        url, title, snippet = m.group(1), m.group(2), m.group(3)
        url = url.strip()
        if url.startswith("//"):
            url = "https:" + url
        if not url.startswith("http"):
            continue
        results.append(
            SearchResult(
                title=title.strip(),
                url=url,
                snippet=snippet.strip()[:500],
                provider=PROVIDER_DDG,
            )
        )
        if len(results) >= max_results:
            break
    return results


def get_search_engine_from_env() -> WebSearchEngine:
    """Factory: loads TAVILY_API_KEY from env/settings automatically."""
    import os

    key = os.environ.get("TAVILY_API_KEY", "")
    return WebSearchEngine(tavily_api_key=key)
