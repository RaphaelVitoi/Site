"""scripts/ops/hook_icm_skill_injector.py -- Fail-open UserPromptSubmit ICM skill hook.

Reads hook event JSON on stdin, routes the user prompt to a single ICM domain
(plus optional machine overlay), and prints hookSpecificOutput.additionalContext
on stdout. Any error or non-matching/trivial prompt exits cleanly with {}.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys

SITE_ROOT = Path(__file__).resolve().parents[2]
if str(SITE_ROOT) not in sys.path:
    sys.path.insert(0, str(SITE_ROOT))

from core.skill_router import route_and_compile_skill_context  # noqa: E402

_MIN_PROMPT_CHARS = 8
_HOOK_TOKEN_BUDGET = 2000


def _extract_prompt(event: dict[str, object]) -> str:
    for key in ("prompt", "user_prompt", "query"):
        raw = event.get(key)
        if isinstance(raw, str) and raw.strip():
            return raw.strip()
    nested = event.get("input")
    if isinstance(nested, dict):
        raw_nested = nested.get("prompt")
        if isinstance(raw_nested, str) and raw_nested.strip():
            return raw_nested.strip()
    return ""


def evaluate_hook_event(event: dict[str, object]) -> dict[str, object]:
    """Evaluate a UserPromptSubmit payload and return hook JSON dict."""
    prompt = _extract_prompt(event)
    if len(prompt) < _MIN_PROMPT_CHARS:
        return {}

    packet = route_and_compile_skill_context(
        prompt,
        token_budget=_HOOK_TOKEN_BUDGET,
        include_content=True,
        include_overlay=True,
    )
    if not packet.selected_skills or not packet.context_markdown:
        return {}

    return {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": packet.context_markdown,
        }
    }


def main() -> None:
    try:
        raw = sys.stdin.read().lstrip("\ufeff")
        event = json.loads(raw) if raw.strip() else {}
        if not isinstance(event, dict):
            print("{}")
            return
        output = evaluate_hook_event(event)
        print(json.dumps(output, ensure_ascii=True))
    except Exception:  # noqa: BLE001 -- fail-open invariant: never block user turn on hook failure
        print("{}")


if __name__ == "__main__":
    main()
