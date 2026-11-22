"""Contratos da skills_library ICM, OpenMonoAgent cookbooks e SkillContextRouter."""

from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path

from aiohttp.test_utils import make_mocked_request
import pytest

from api.v1.handlers import handle_get_skills_index, handle_route_skills
from core.schemas import Task
from core.skill_router import SkillContextRouter, route_and_compile_skill_context
from engine.cognitive import get_agent_system_prompt
from engine.skills_mcp_server import icm_get_cookbook, icm_route_skills, icm_skills_index
from scripts.ops.hook_icm_skill_injector import evaluate_hook_event
from scripts.ops.sync_skills_library import validate_library

SITE_ROOT = Path(__file__).resolve().parent.parent


def test_skills_library_parity_and_cookbook_schemas() -> None:
    errors = validate_library(SITE_ROOT)
    assert not errors, f"Erros de validacao na skills_library: {errors}"

    index = SkillContextRouter(SITE_ROOT).load_index()
    stats = index["stats"]
    assert isinstance(stats, dict)
    assert stats["local_skill_count"] == 25
    assert stats["domain_count"] == 7
    assert stats["cookbook_count"] == 7


@pytest.mark.parametrize(
    ("prompt", "expected_domain", "expected_skill", "expected_cookbook"),
    [
        (
            "Formulate PMev mathematical model and ICM risk premium for MTT final table",
            "pmev-and-quant",
            "pmev-game-theory-engine",
            "pmev-model-verification",
        ),
        (
            "Run the 5-phase sota quality gate and code scan for dead code before release",
            "engineering-and-quality",
            "sota-quality-gate",
            "sota-release-quality-gate",
        ),
        (
            "Audit HKCU and HKLM registry for duplicate HF_CREDENTIALS and HF_KEY sha8",
            "runtime-and-credentials",
            "key-pool-audit",
            "credential-pool-harmonization",
        ),
        (
            "Inspect DOM and LCP CWV metrics via Chrome DevTools CDP 9222",
            "browser-and-ui-design",
            "chrome-devtools-agent-sota",
            "ui-design-to-cwv-verification",
        ),
        (
            "Query SQLite database via MCP Toolbox tools.yaml and analyze metrics",
            "data-and-knowledge",
            "mcp-toolbox-database",
            "data-timeseries-forecast",
        ),
        (
            "Supervise Devin Cloud session with Local Hands and pull Session Insights API v3",
            "cloud-and-devin-ops",
            "devin-session-supervision",
            "cloud-agent-delegation",
        ),
        (
            "Run session impact evaluation and record_gate before writing HANDOFF and REGISTRO",
            "governance-and-handoff",
            "site-session-handoff",
            "session-closure-handoff",
        ),
    ],
)
def test_domain_scoped_routing_and_isolation(
    prompt: str,
    expected_domain: str,
    expected_skill: str,
    expected_cookbook: str,
) -> None:
    router = SkillContextRouter(SITE_ROOT)
    packet = router.route_and_compile(prompt)

    assert packet.domain == expected_domain
    assert expected_skill in packet.selected_skills
    assert expected_cookbook in packet.selected_cookbooks
    assert 0 < packet.estimated_tokens <= packet.token_budget
    assert packet.savings_pct >= 70.0

    # Strict domain isolation: selected skills belong exclusively to winning domain
    skills_map = router.load_index()["skills"]
    assert isinstance(skills_map, dict)
    for sid in packet.selected_skills:
        skill_meta = skills_map[sid]
        assert isinstance(skill_meta, dict)
        assert skill_meta["domain"] == expected_domain


def test_unrelated_and_disabled_tasks_load_zero_skills() -> None:
    router = SkillContextRouter(SITE_ROOT)

    unrelated = router.route_and_compile("hello world rename local variable x to y")
    assert unrelated.domain is None
    assert unrelated.selected_skills == ()
    assert unrelated.selected_cookbooks == ()
    assert unrelated.estimated_tokens == 0
    assert unrelated.savings_pct == 100.0
    assert unrelated.context_markdown == ""

    disabled = router.route_and_compile(
        "Audit HKCU and HKLM OpenRouter keys",
        metadata={"skills_mode": "off"},
    )
    assert disabled.selected_skills == ()
    assert disabled.estimated_tokens == 0
    assert disabled.reason_codes == ("skills_disabled_by_task",)


def test_strict_token_budget_enforcement() -> None:
    packet = route_and_compile_skill_context(
        "Audit HKCU and HKLM OpenRouter pools and sha8 hygiene",
        token_budget=800,
    )
    assert packet.domain == "runtime-and-credentials"
    assert packet.estimated_tokens <= 800
    assert packet.context_markdown


@pytest.mark.asyncio
async def test_cognitive_system_prompt_injects_only_domain_skill(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.chdir(SITE_ROOT)
    domain_task = Task(
        id="TASK-SKILL-1",
        description="Run key-pool-audit on HKCU and HKLM OpenRouter sha8 credentials",
        agent="@securitychief",
        status="pending",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={},
    )
    prompt = await get_agent_system_prompt("@securitychief", task=domain_task)
    assert "TASK-SPECIFIC SKILL CONTEXT (ICM)" in prompt
    assert "key-pool-audit" in prompt
    assert domain_task.metadata["skill_domain"] == "runtime-and-credentials"
    assert "pmev-game-theory-engine" not in prompt

    trivial_task = Task(
        id="TASK-SKILL-2",
        description="hello world rename variable x to y",
        agent="@implementor",
        status="pending",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={},
    )
    trivial_prompt = await get_agent_system_prompt("@implementor", task=trivial_task)
    assert "TASK-SPECIFIC SKILL CONTEXT (ICM)" not in trivial_prompt


@pytest.mark.asyncio
async def test_api_handlers_index_and_route() -> None:
    req_idx = make_mocked_request("GET", "/api/v1/skills/index")
    resp_idx = await handle_get_skills_index(req_idx)
    assert resp_idx.status == 200
    assert resp_idx.text is not None
    body_idx = json.loads(resp_idx.text)
    assert body_idx["stats"]["local_skill_count"] == 25
    assert body_idx["stats"]["domain_count"] == 7

    payload = json.dumps(
        {
            "task": "Check Chrome DevTools CDP 9222 LCP and CLS performance",
            "agent": "@verifier",
            "include_content": True,
        }
    ).encode("utf-8")
    req_route = make_mocked_request(
        "POST",
        "/api/v1/skills/route",
        headers={"Content-Type": "application/json"},
    )
    req_route._read_bytes = payload  # noqa: SLF001
    resp_route = await handle_route_skills(req_route)
    assert resp_route.status == 200
    assert resp_route.text is not None
    body_route = json.loads(resp_route.text)
    assert body_route["domain"] == "browser-and-ui-design"
    assert "chrome-devtools-agent-sota" in body_route["selected_skills"]
    assert "context_markdown" in body_route


def test_machine_overlay_merge_and_precedence(tmp_path: Path) -> None:
    overlay_skill = tmp_path / "custom-user-skill" / "SKILL.md"
    overlay_skill.parent.mkdir(parents=True, exist_ok=True)
    overlay_skill.write_text("---\nname: custom-user-skill\n---\n# Custom Skill\nBody content.", encoding="utf-8")

    overlay_json = tmp_path / "overlay.json"
    overlay_json.write_text(
        json.dumps(
            {
                "schema_version": "1.0.0",
                "domains": {
                    "overlay-domain": {
                        "id": "overlay-domain",
                        "title": "Overlay Domain",
                        "context_path": "",
                        "default_cookbook": "",
                        "keywords": {"custom-overlay-trigger": 6},
                        "anti_keywords": {},
                    }
                },
                "skills": {
                    "custom-user-skill": {
                        "domain": "overlay-domain",
                        "scope": "user-overlay",
                        "source_path": overlay_skill.as_posix(),
                        "summary": "Overlay test skill",
                        "keywords": {"custom-overlay-trigger": 5},
                        "explicit_aliases": ["custom-user-skill"],
                        "cookbooks": [],
                        "token_estimate": 50,
                    },
                    "key-pool-audit": {
                        "domain": "overlay-domain",
                        "scope": "user-overlay",
                        "source_path": overlay_skill.as_posix(),
                        "summary": "Must NOT override repo skill",
                        "keywords": {"hkcu": 99},
                    },
                },
            }
        ),
        encoding="utf-8",
    )

    router = SkillContextRouter(SITE_ROOT, overlay_path=overlay_json)
    with_overlay = router.route_and_compile("Run custom-overlay-trigger check", include_overlay=True)
    assert with_overlay.domain == "overlay-domain"
    assert "custom-user-skill" in with_overlay.selected_skills
    assert "Body content." in with_overlay.context_markdown

    without_overlay = router.route_and_compile("Run custom-overlay-trigger check", include_overlay=False)
    assert without_overlay.domain is None
    assert without_overlay.selected_skills == ()

    repo_wins = router.route_and_compile("Audit HKCU and HKLM sha8", include_overlay=True)
    assert repo_wins.domain == "runtime-and-credentials"


def test_user_prompt_submit_hook_injects_and_fails_open() -> None:
    matched = evaluate_hook_event({"prompt": "Audit HKCU and HKLM OpenRouter sha8 credentials"})
    hook_out = matched.get("hookSpecificOutput")
    assert isinstance(hook_out, dict)
    assert hook_out["hookEventName"] == "UserPromptSubmit"
    assert "key-pool-audit" in hook_out["additionalContext"]

    assert evaluate_hook_event({"prompt": "rename x to y"}) == {}
    assert evaluate_hook_event({"prompt": "hi"}) == {}
    assert evaluate_hook_event({}) == {}


def test_skills_mcp_server_tools() -> None:
    idx = json.loads(icm_skills_index(include_overlay=False))
    assert idx["stats"]["local_skill_count"] == 25
    assert idx["stats"]["domain_count"] == 7

    routed = json.loads(icm_route_skills("Audit HKCU and HKLM sha8 credentials", include_overlay=False))
    assert routed["domain"] == "runtime-and-credentials"
    assert "key-pool-audit" in routed["selected_skills"]

    cb = json.loads(icm_get_cookbook("credential-pool-harmonization"))
    assert cb["id"] == "credential-pool-harmonization"
    assert len(cb["steps"]) >= 3

    err = json.loads(icm_get_cookbook("nonexistent-cookbook"))
    assert err["status"] == "ERROR"
