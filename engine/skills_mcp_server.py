#!/usr/bin/env python3
"""ICM Skills & OpenMonoAgent Cookbooks Router MCP Server (stdio).

Exposes domain-scoped skill routing, curated index inspection, and validated
OpenMonoAgent YAML cookbooks to every MCP-capable harness (Antigravity, Claude
Code, Codex CLI, Hermes Agent, Devin Desktop) via the shared gateway.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
import sys

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,
    format="[ICM SKILLS MCP] %(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("skills_mcp_server")

SITE_ROOT = Path(__file__).resolve().parents[1]
if str(SITE_ROOT) not in sys.path:
    sys.path.insert(0, str(SITE_ROOT))

try:
    from mcp.server.mcpserver import MCPServer
except ImportError:
    from mcp.server.fastmcp import FastMCP as MCPServer  # type: ignore[no-redef]

from control_plane.mcp_tools import register_control_plane_tools  # noqa: E402
from core.decision_roi_engine import (  # noqa: E402
    RoiCandidate,
    arbitrate_competition,
    evaluate_roi_decision,
)
from core.skill_router import get_skill_router, route_and_compile_skill_context  # noqa: E402

server = MCPServer("icm-skills-router")


@server.tool(
    name="icm_route_skills",
    description=(
        "Routes a task description to a single ICM domain and returns ONLY the "
        "task-relevant skills and OpenMonoAgent cookbook within token budget."
    ),
)
def icm_route_skills(
    task: str,
    agent: str = "",
    token_budget: int = 2400,
    include_content: bool = True,
    include_overlay: bool = True,
) -> str:
    """Route task text to its domain-scoped ICM skill packet."""
    try:
        packet = route_and_compile_skill_context(
            task,
            agent_name=agent,
            token_budget=max(200, token_budget),
            include_content=include_content,
            include_overlay=include_overlay,
        )
        return json.dumps(packet.to_dict(include_content=include_content), indent=2, ensure_ascii=True)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Erro em icm_route_skills: %s", exc)
        return json.dumps({"status": "ERROR", "message": str(exc)}, indent=2, ensure_ascii=True)


@server.tool(
    name="icm_skills_index",
    description="Lists the curated ICM domains, canonical skills, OpenMonoAgent cookbooks, and token stats.",
)
def icm_skills_index(include_overlay: bool = True) -> str:
    """Return compact taxonomy index and stats."""
    try:
        index = get_skill_router().load_index(include_overlay=include_overlay)
        raw_domains = index.get("domains")
        raw_skills = index.get("skills")
        raw_cookbooks = index.get("cookbooks")
        payload = {
            "methodology": index.get("methodology"),
            "default_token_budget": index.get("default_token_budget"),
            "stats": index.get("stats"),
            "domains": (
                {k: v.get("title") for k, v in raw_domains.items() if isinstance(v, dict)}
                if isinstance(raw_domains, dict)
                else {}
            ),
            "skills": (
                {
                    k: {"domain": v.get("domain"), "scope": v.get("scope"), "summary": v.get("summary")}
                    for k, v in raw_skills.items()
                    if isinstance(v, dict)
                }
                if isinstance(raw_skills, dict)
                else {}
            ),
            "cookbooks": (
                {
                    k: {"domain": v.get("domain"), "summary": v.get("summary"), "skills": v.get("skills")}
                    for k, v in raw_cookbooks.items()
                    if isinstance(v, dict)
                }
                if isinstance(raw_cookbooks, dict)
                else {}
            ),
        }
        return json.dumps(payload, indent=2, ensure_ascii=True)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Erro em icm_skills_index: %s", exc)
        return json.dumps({"status": "ERROR", "message": str(exc)}, indent=2, ensure_ascii=True)


@server.tool(
    name="icm_get_cookbook",
    description="Returns the validated OpenMonoAgent-style YAML cookbook (parameters, pre_gates, steps, exit_criteria).",
)
def icm_get_cookbook(cookbook_id: str) -> str:
    """Load and validate a cookbook by ID."""
    try:
        router = get_skill_router()
        index = router.load_index(include_overlay=False)
        raw_cookbooks = index.get("cookbooks")
        if not isinstance(raw_cookbooks, dict) or cookbook_id not in raw_cookbooks:
            return json.dumps(
                {"status": "ERROR", "message": f"Unknown cookbook_id: {cookbook_id}"},
                indent=2,
                ensure_ascii=True,
            )
        cb_meta = raw_cookbooks[cookbook_id]
        rel_path = str(cb_meta.get("path", "")) if isinstance(cb_meta, dict) else ""
        spec = router.read_cookbook_spec(rel_path)
        if spec is None:
            return json.dumps(
                {"status": "ERROR", "message": f"Cookbook file missing: {rel_path}"},
                indent=2,
                ensure_ascii=True,
            )
        return json.dumps(spec.model_dump(), indent=2, ensure_ascii=True)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Erro em icm_get_cookbook: %s", exc)
        return json.dumps({"status": "ERROR", "message": str(exc)}, indent=2, ensure_ascii=True)


@server.tool(
    name="icm_evaluate_roi_decision",
    description=(
        "Evaluates one candidate or arbitrates competition across multiple candidates "
        "under the canonical +ROI framework (redundancy, obsolescence, broken/malicious, "
        "capability/resource ratio) with optional Laya S1 -> gemini-decision-1 escalation."
    ),
)
def icm_evaluate_roi_decision(candidates_json: str, use_s1: bool = False) -> str:
    """Evaluate ROI disposition or select +ROI winner from JSON candidate(s)."""
    try:
        parsed = json.loads(candidates_json)
        if isinstance(parsed, list):
            cands = [RoiCandidate.model_validate(item) for item in parsed]
            return json.dumps(arbitrate_competition(cands, use_s1=use_s1).model_dump(), indent=2, ensure_ascii=True)
        if isinstance(parsed, dict):
            cand = RoiCandidate.model_validate(parsed)
            return json.dumps(evaluate_roi_decision(cand, use_s1=use_s1).model_dump(), indent=2, ensure_ascii=True)
        return json.dumps(
            {"status": "ERROR", "message": "candidates_json must be JSON object or list"},
            indent=2,
            ensure_ascii=True,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Erro em icm_evaluate_roi_decision: %s", exc)
        return json.dumps({"status": "ERROR", "message": str(exc)}, indent=2, ensure_ascii=True)


control_plane_tools = register_control_plane_tools(server)


if __name__ == "__main__":
    logger.info("Iniciando ICM Skills Router MCP Server (stdio)...")
    server.run(transport="stdio")
