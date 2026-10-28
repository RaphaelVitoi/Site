"""Modulo de integracao e ponte SOTA entre Site e Exa MCP (https://mcp.exa.ai/mcp).

Permite busca semantica na web, extracao de conteudo limpo (markdown),
pesquisa avancada categorizada e execucao de agentes autonomos de pesquisa profunda (Exa Agent).
Governanca: Protocolo Master Chico SOTA v8.0 GOLD . Membro da Triade (Stitch, Exa & Jules).
"""

from __future__ import annotations

from dataclasses import dataclass
import json
import logging
import os
import re
from typing import Any, Final
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

__all__ = [
    "EXA_ERROR_NOT_CONFIGURED",
    "EXA_MCP_ALL_TOOLS_URL",
    "EXA_MCP_DEFAULT_URL",
    "ExaAgentRun",
    "ExaClient",
    "ExaSearchResponse",
    "ExaSearchResult",
]

EXA_MCP_DEFAULT_URL: Final[str] = "https://mcp.exa.ai/mcp"
EXA_MCP_ALL_TOOLS_URL: Final[str] = (
    "https://mcp.exa.ai/mcp?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa,agent_run"
)
EXA_ERROR_NOT_CONFIGURED: Final[str] = "ExaClient nao configurado: EXA_API_KEY ausente."
_MARKER_TITLE: Final[str] = "Title:"
_MARKER_URL: Final[str] = "URL:"
_MARKER_PUBLISHED: Final[str] = "Published:"
_MARKER_AUTHOR: Final[str] = "Author:"
_MARKDOWN_BLOCK_SPLIT_REGEX: Final[re.Pattern[str]] = re.compile(r"\n---(?:\n|$)")


def _parse_markdown_block(block: str) -> ExaSearchResult | None:
    lines = block.strip().splitlines()
    title = next((line.split(_MARKER_TITLE, 1)[1].strip() for line in lines if line.startswith(_MARKER_TITLE)), "")
    url = next((line.split(_MARKER_URL, 1)[1].strip() for line in lines if line.startswith(_MARKER_URL)), "")
    pub = next(
        (line.split(_MARKER_PUBLISHED, 1)[1].strip() for line in lines if line.startswith(_MARKER_PUBLISHED)), None
    )
    author = next((line.split(_MARKER_AUTHOR, 1)[1].strip() for line in lines if line.startswith(_MARKER_AUTHOR)), None)
    if not url:
        return None
    return ExaSearchResult(
        url=url,
        id=url,
        title=title,
        author=author if author != "N/A" else None,
        published_date=pub if pub != "N/A" else None,
        text=block.strip(),
    )


def _parse_markdown_results(raw_text: str) -> list[ExaSearchResult]:
    """Parsing defensivo de blocos de texto markdown retornados por web_search_exa."""
    if not (_MARKER_URL in raw_text or _MARKER_TITLE in raw_text):
        return []
    blocks = _MARKDOWN_BLOCK_SPLIT_REGEX.split(raw_text.strip())
    results: list[ExaSearchResult] = []
    for b in blocks:
        item = _parse_markdown_block(b)
        if item is not None:
            results.append(item)
    return results


def _parse_structured_results(raw_results: list[Any]) -> list[ExaSearchResult]:
    return [ExaSearchResult.from_dict(r) if isinstance(r, dict) else ExaSearchResult(url=str(r)) for r in raw_results]


@dataclass
class ExaSearchResult(dict[str, Any]):
    """Representacao hibrida (dataclass + dict) de um resultado de busca Exa.

    Permite acesso strongly typed por atributo (.url, .title, .text, .score)
    e indexacao por chave (item['url'], item.get('publishedDate')).
    """

    url: str
    id: str = ""
    title: str = ""
    author: str | None = None
    published_date: str | None = None
    text: str = ""
    highlights: list[str] | None = None
    score: float | None = None

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["publishedDate"] = self.published_date

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ExaSearchResult:
        """Instancia ExaSearchResult a partir de dicionario JSON-RPC de forma defensiva."""
        raw_url = str(data.get("url", ""))
        raw_id = str(data.get("id", raw_url))
        raw_title = str(data.get("title", ""))
        raw_author = data.get("author")
        raw_published = data.get("publishedDate") or data.get("published_date")
        raw_text = str(data.get("text", ""))
        raw_highlights = data.get("highlights")
        raw_score = data.get("score")

        highlights_list: list[str] | None = None
        if isinstance(raw_highlights, list):
            highlights_list = [str(h) for h in raw_highlights]

        score_val: float | None = None
        if isinstance(raw_score, (int, float)):
            score_val = float(raw_score)

        inst = cls(
            url=raw_url,
            id=raw_id,
            title=raw_title,
            author=str(raw_author) if raw_author is not None else None,
            published_date=str(raw_published) if raw_published is not None else None,
            text=raw_text,
            highlights=highlights_list,
            score=score_val,
        )
        for k, v in data.items():
            inst[k] = v
        return inst


@dataclass
class ExaSearchResponse(dict[str, Any]):
    """Representacao hibrida de uma resposta completa de busca Exa."""

    results: list[ExaSearchResult]
    request_id: str = ""
    autoprompt_string: str = ""
    raw_text: str = ""

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["requestId"] = self.request_id

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ExaSearchResponse:
        """Instancia ExaSearchResponse a partir de resposta estruturada ou texto MCP."""
        raw_results = data.get("results", [])
        parsed_results: list[ExaSearchResult] = []
        raw_text = str(data.get("raw_text", ""))

        if isinstance(raw_results, list) and raw_results:
            parsed_results = _parse_structured_results(raw_results)
        elif raw_text:
            parsed_results = _parse_markdown_results(raw_text)

        inst = cls(
            results=parsed_results,
            request_id=str(data.get("requestId", data.get("request_id", ""))),
            autoprompt_string=str(data.get("autopromptString", data.get("autoprompt_string", ""))),
            raw_text=raw_text,
        )
        for k, v in data.items():
            inst[k] = v
        return inst


@dataclass
class ExaAgentRun(dict[str, Any]):
    """Representacao hibrida de uma execucao do Exa Agent."""

    run_id: str
    status: str
    output: str | None = None
    sources: list[dict[str, Any]] | None = None
    cost_dollars: float | None = None
    duration_seconds: int | None = None

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["runId"] = self.run_id

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ExaAgentRun:
        """Instancia ExaAgentRun de forma defensiva."""
        inst = cls(
            run_id=str(data.get("runId", data.get("id", ""))),
            status=str(data.get("status", "unknown")),
            output=data.get("output") if isinstance(data.get("output"), str) else None,
            sources=data.get("sources") if isinstance(data.get("sources"), list) else None,
            cost_dollars=float(data["costDollars"]) if "costDollars" in data else None,
            duration_seconds=int(data["durationSeconds"]) if "durationSeconds" in data else None,
        )
        for k, v in data.items():
            inst[k] = v
        return inst


def _extract_json_from_sse_line(line: str) -> dict[str, Any] | None:
    if not line.startswith("data: "):
        return None
    data_str = line[6:].strip()
    if not data_str:
        return None
    try:
        parsed = json.loads(data_str)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def _parse_raw_json_fallback(text: str) -> dict[str, Any] | None:
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


class ExaClient:
    """Cliente JSON-RPC hermetico para o servidor MCP do Exa (https://mcp.exa.ai/mcp)."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = EXA_MCP_ALL_TOOLS_URL,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.startswith("https://"):
            raise ValueError("ExaClient exige base_url https: urlopen tambem abriria file: e esquemas custom.")
        self._api_key = api_key or os.getenv("EXA_API_KEY", "")
        self._base_url = base_url
        self._timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Verifica se a chave de API esta presente."""
        return bool(self._api_key)

    def _get_headers(self) -> dict[str, str]:
        """Gera cabecalhos compativeis com o endpoint SSE/JSON-RPC do Exa MCP."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": "Nexus-Site-ExaBridge/1.0",
        }
        if self._api_key:
            headers["x-api-key"] = self._api_key
        return headers

    @staticmethod
    def _parse_sse_response(body_bytes: bytes) -> dict[str, Any]:
        """Decodifica carga de resposta SSE (text/event-stream) ou JSON puro."""
        text = body_bytes.decode("utf-8")
        for line in text.splitlines():
            parsed = _extract_json_from_sse_line(line)
            if parsed is not None:
                return parsed
        # Fallback para JSON direto sem envelope SSE
        fallback = _parse_raw_json_fallback(text)
        if fallback is not None:
            return fallback
        return {"raw_text": text}

    def _call_tool(self, tool_name: str, arguments: dict[str, object] | None = None) -> dict[str, Any]:
        """Executa uma chamada MCP tools/call para o Exa."""
        if not self.is_configured:
            raise ValueError(EXA_ERROR_NOT_CONFIGURED)

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments or {},
            },
        }

        req = urllib.request.Request(
            self._base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=self._get_headers(),
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = self._parse_sse_response(resp.read())
                if "error" in data:
                    err = data["error"]
                    logger.error("[EXA] Erro JSON-RPC: %s", err)
                    raise RuntimeError(f"Erro no Exa MCP ({err.get('code')}): {err.get('message')}")

                result = data.get("result", {})
                if "structuredContent" in result and isinstance(result["structuredContent"], dict):
                    return result["structuredContent"]

                contents = result.get("content", [])
                if contents and isinstance(contents, list) and isinstance(contents[0], dict):
                    raw_text = contents[0].get("text", "{}")
                    try:
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, dict):
                            return parsed
                    except json.JSONDecodeError:
                        return {"raw_text": raw_text}

                return {}
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.exception("[EXA] Erro HTTP %d na chamada %s: %s", e.code, tool_name, err_msg)
            raise RuntimeError(f"Erro HTTP ({e.code}) no Exa MCP: {err_msg}") from e
        except Exception:
            logger.exception("[EXA] Falha de conexao com Exa MCP")
            raise

    def search(
        self,
        query: str,
        num_results: int = 5,
        objective: str | None = None,
    ) -> ExaSearchResponse:
        """Executa busca web natural via web_search_exa."""
        args: dict[str, object] = {
            "query": query,
            "numResults": num_results,
        }
        if objective:
            args["objective"] = objective
        else:
            args["objective"] = f"Recuperar informacoes relevantes e precisas sobre {query}"

        res = self._call_tool("web_search_exa", args)
        return ExaSearchResponse.from_dict(res)

    def search_advanced(
        self,
        query: str,
        num_results: int = 10,
        search_type: str = "auto",
        category: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        start_published_date: str | None = None,
        end_published_date: str | None = None,
        text_max_characters: int | None = None,
        enable_summary: bool = False,
        enable_highlights: bool = False,
    ) -> ExaSearchResponse:
        """Executa busca web avancada com filtros via web_search_advanced_exa."""
        args: dict[str, object] = {
            "query": query,
            "numResults": num_results,
            "type": search_type,
        }
        if category:
            args["category"] = category
        if include_domains:
            args["includeDomains"] = include_domains
        if exclude_domains:
            args["excludeDomains"] = exclude_domains
        if start_published_date:
            args["startPublishedDate"] = start_published_date
        if end_published_date:
            args["endPublishedDate"] = end_published_date
        if text_max_characters:
            args["textMaxCharacters"] = text_max_characters
        if enable_summary:
            args["enableSummary"] = True
        if enable_highlights:
            args["enableHighlights"] = True

        res = self._call_tool("web_search_advanced_exa", args)
        return ExaSearchResponse.from_dict(res)

    def fetch(self, urls: list[str], max_characters: int = 3000) -> list[dict[str, Any]]:
        """Le e extrai conteudo em markdown limpo de uma lista de URLs via web_fetch_exa."""
        res = self._call_tool("web_fetch_exa", {"urls": urls, "maxCharacters": max_characters})
        pages = res.get("pages")
        if isinstance(pages, list):
            return [p for p in pages if isinstance(p, dict)]
        if "raw_text" in res:
            return [{"url": u, "content": res["raw_text"]} for u in urls]
        return []

    def run_agent(
        self,
        query: str,
        effort: str = "low",
        system_prompt: str | None = None,
        output_schema: dict[str, Any] | None = None,
        max_cost_dollars: float | None = None,
    ) -> ExaAgentRun:
        """Dispara uma pesquisa autonoma multi-etapa via Exa Agent (agent_run)."""
        args: dict[str, object] = {
            "query": query,
            "effort": effort,
        }
        if system_prompt:
            args["systemPrompt"] = system_prompt
        if output_schema:
            args["outputSchema"] = output_schema
        if max_cost_dollars is not None:
            args["budget"] = {"maxCostDollars": max_cost_dollars}

        res = self._call_tool("agent_run", args)
        return ExaAgentRun.from_dict(res)

    def get_agent_run(self, run_id: str) -> ExaAgentRun:
        """Verifica o status ou continua a espera de uma execucao de Exa Agent."""
        res = self._call_tool("agent_run", {"runId": run_id})
        return ExaAgentRun.from_dict(res)

    def ping(self) -> bool:
        """Verifica conectividade rapida executando busca minima de probe."""
        try:
            resp = self.search("probe", num_results=1, objective="Verificar conectividade de rede")
            return bool(resp.results or resp.raw_text)
        except Exception as e:
            logger.warning("[EXA] ping falhou: %s", e)
            return False
