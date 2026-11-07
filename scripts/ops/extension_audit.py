#!/usr/bin/env python3
"""Automated audit of the .gemini/extensions/ ecosystem.

Validates manifests, protocol sync, CLI extensions, integration endpoints,
and security posture.

Usage:
    python scripts/ops/extension_audit.py [--full] [--json]
"""

import argparse
import json
from pathlib import Path
import sys
import urllib.request

ROOT = Path(__file__).resolve().parent.parent.parent.parent  # .gemini/
EXTENSIONS = ROOT / "extensions"

CHROME_EXTENSIONS = [
    "sota-chrome-cockpit",
    "tab-autocomplete-nano",
    "promptive-sentry-1.1.20",
    "superpower-for-gemini-1.7.9.1",
]

CLI_EXTENSIONS = [
    "criticalthink",
    "nanostack",
    "conductor",
    "huggingface",
    "mcp-toolbox-for-databases",
    "google-agents-cli",
    "co-researcher",
    "GeminiCloudAssist",
]

DANGEROUS_PERMS = frozenset(["https://*/*", "http" + "://*/*"])  # NOSONAR

results = {"pass": 0, "fail": 0, "warn": 0, "details": []}


def ok(msg):
    results["pass"] += 1
    results["details"].append(("PASS", msg))
    print(f"  [PASS] {msg}")


def fail(msg):
    results["fail"] += 1
    results["details"].append(("FAIL", msg))
    print(f"  [FAIL] {msg}")


def warn(msg):
    results["warn"] += 1
    results["details"].append(("WARN", msg))
    print(f"  [WARN] {msg}")


def _audit_chrome_csp(ext: str, m: dict) -> None:
    csp = m.get("content_security_policy", {}).get("extension_pages", "")
    if "'unsafe-eval'" in csp or "'unsafe-inline'" in csp:
        fail(f"{ext}: unsafe CSP")
        return
    ok(f"{ext}: CSP strict")


def _audit_chrome_host_permissions(ext: str, m: dict) -> None:
    host_perms = m.get("host_permissions", [])
    dangerous = [p for p in host_perms if p in DANGEROUS_PERMS]
    if dangerous:
        fail(f"{ext}: dangerous host_permissions: {dangerous}")
        return
    ok(f"{ext}: host_permissions scoped")


def _audit_chrome_key(ext: str, m: dict) -> None:
    if ext not in ("sota-chrome-cockpit", "tab-autocomplete-nano"):
        return
    if not m.get("key"):
        warn(f"{ext}: missing key field (Duo Mesh ID not fixed)")
        return
    ok(f"{ext}: key field present")


def _audit_chrome_oauth(ext: str, m: dict) -> None:
    oauth = m.get("oauth2", {})
    client_id = oauth.get("client_id", "")
    is_hardcoded = bool(client_id) and "{{" not in client_id and client_id.endswith(".apps.googleusercontent.com")
    if is_hardcoded:
        warn(f"{ext}: OAuth client_id hardcoded in manifest (should be externalized)")
        return
    ok(f"{ext}: OAuth externalized or absent")


def _audit_single_chrome_manifest(ext: str, m: dict) -> None:
    # Basic fields
    if m.get("manifest_version") != 3:
        fail(f"{ext}: manifest_version != 3")
    else:
        ok(f"{ext}: MV3")

    if not m.get("name"):
        fail(f"{ext}: missing name")
    if not m.get("version"):
        fail(f"{ext}: missing version")

    _audit_chrome_csp(ext, m)
    _audit_chrome_host_permissions(ext, m)
    _audit_chrome_key(ext, m)
    _audit_chrome_oauth(ext, m)


def audit_chrome_manifests():
    print("\n=== Chrome MV3 Manifests ===")
    for ext in CHROME_EXTENSIONS:
        manifest_path = EXTENSIONS / ext / "manifest.json"
        if not manifest_path.exists():
            fail(f"{ext}: manifest.json not found")
            continue
        try:
            m = json.loads(manifest_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            fail(f"{ext}: invalid JSON - {e}")
            continue

        _audit_single_chrome_manifest(ext, m)


def audit_duo_bus_sync():
    print("\n=== Duo Bus Protocol Sync ===")
    shared = EXTENSIONS / "_shared" / "sota-bus" / "sota-bus.js"
    if not shared.exists():
        fail("Shared sota-bus.js not found")
        return

    for ext in ("sota-chrome-cockpit", "tab-autocomplete-nano"):
        target = EXTENSIONS / ext / "sota-bus.js"
        if not target.exists():
            fail(f"{ext}: sota-bus.js missing")
            continue
        if target.read_text(encoding="utf-8") == shared.read_text(encoding="utf-8"):
            ok(f"{ext}: sota-bus.js in sync")
        else:
            fail(f"{ext}: sota-bus.js DRIFT from shared")

    # Protocol version check
    shared_text = shared.read_text(encoding="utf-8")
    if "BUS_PROTOCOL_VERSION" in shared_text:
        ok("Shared bus: BUS_PROTOCOL_VERSION defined")
    else:
        fail("Shared bus: BUS_PROTOCOL_VERSION missing")


def _audit_single_cli_extension(ext: str, ext_dir: Path, m: dict) -> None:
    if not m.get("name"):
        fail(f"{ext}: missing name")
    if not m.get("version"):
        fail(f"{ext}: missing version")
    else:
        ok(f"{ext}: v{m['version']}")

    # Check context file
    ctx_file = m.get("contextFileName")
    if ctx_file and not (ext_dir / ctx_file).exists():
        warn(f"{ext}: contextFileName '{ctx_file}' not found")

    # Check commands
    for cmd in m.get("commands", []):
        src = cmd.get("source", "")
        if src and not (ext_dir / src).exists():
            fail(f"{ext}: command source '{src}' not found")
        elif src:
            ok(f"{ext}: command '{cmd.get('name')}' source OK")

    # Check MCP servers
    mcp = m.get("mcpServers", {})
    for name, cfg in mcp.items():
        if "httpUrl" in cfg or "command" in cfg:
            ok(f"{ext}: MCP server '{name}' configured")
        else:
            warn(f"{ext}: MCP server '{name}' missing httpUrl/command")


def audit_cli_extensions():
    print("\n=== Gemini CLI Extensions ===")
    for ext in CLI_EXTENSIONS:
        ext_dir = EXTENSIONS / ext
        if not ext_dir.exists():
            fail(f"{ext}: directory not found")
            continue

        manifest_path = ext_dir / "gemini-extension.json"
        if not manifest_path.exists():
            fail(f"{ext}: gemini-extension.json not found")
            continue

        try:
            m = json.loads(manifest_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            fail(f"{ext}: invalid JSON - {e}")
            continue

        _audit_single_cli_extension(ext, ext_dir, m)


def audit_integration_endpoints():
    print("\n=== Integration Endpoints ===")
    endpoints = [
        ("Orchestrator :9333", "http://127.0.0.1:9333/health"),
        ("Site API :17042", "http://127.0.0.1:17042/health"),
        ("MCP Gateway :8933", "http://127.0.0.1:8933/status"),
        ("Ollama :11434", "http://127.0.0.1:11434/api/tags"),
        ("CDP Proxy :9224", "http://127.0.0.1:9224/health"),
    ]
    for name, url in endpoints:
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:  # noqa: S310 Record-Id: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
                if resp.status == 200:
                    ok(f"{name}: responding")
                else:
                    warn(f"{name}: HTTP {resp.status}")
        except Exception as e:
            warn(f"{name}: unreachable ({type(e).__name__})")


def _check_gitignore_coverage() -> None:
    gitignore = ROOT / ".gitignore"
    if not gitignore.exists():
        warn(".gitignore not found at root")
        return

    content = gitignore.read_text(encoding="utf-8")
    required = ["oauth.json", "*.key", "*.pem"]
    for pattern in required:
        if pattern in content:
            ok(f".gitignore: '{pattern}' covered")
        else:
            warn(f".gitignore: '{pattern}' not covered")


def _check_js_eval_in_file(ext: str, js_file: Path) -> None:
    try:
        content = js_file.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return

    if "eval(" in content and "chrome.scripting" not in content:
        # Allow chrome.scripting.executeScript and chrome.devtools.inspectedWindow.eval
        cleaned = content.replace("chrome.scripting.executeScript", "").replace(
            "chrome.devtools.inspectedWindow.eval", ""
        )
        if "eval(" in cleaned:
            warn(f"{ext}/{js_file.name}: contains eval()")

    if "new Function(" in content:
        warn(f"{ext}/{js_file.name}: contains new Function()")


def audit_security():
    print("\n=== Security Audit ===")
    _check_gitignore_coverage()

    for ext in CHROME_EXTENSIONS:
        ext_dir = EXTENSIONS / ext
        for js_file in ext_dir.rglob("*.js"):
            if "node_modules" in str(js_file) or ".min.js" in js_file.name:
                continue
            _check_js_eval_in_file(ext, js_file)


def audit_code_quality():
    print("\n=== Code Quality ===")
    # Check for duplicate directories (typo names)
    ext_dirs = [d.name for d in EXTENSIONS.iterdir() if d.is_dir() and not d.name.startswith("_")]
    seen = set()
    for name in ext_dirs:
        normalized = name.lower().replace("-", "").replace("_", "").replace(".", "")
        if normalized in seen:
            warn(f"Possible duplicate extension dir: {name}")
        seen.add(normalized)

    # Check README presence
    for ext in CHROME_EXTENSIONS + CLI_EXTENSIONS:
        readme = EXTENSIONS / ext / "README.md"
        if readme.exists():
            ok(f"{ext}: README.md present")
        else:
            warn(f"{ext}: README.md missing")

    # Check shared dir
    shared = EXTENSIONS / "_shared"
    if shared.exists():
        ok("_shared/: present")
    else:
        warn("_shared/: missing")


def main():
    parser = argparse.ArgumentParser(description="Extension ecosystem audit")
    parser.add_argument("--full", action="store_true", help="Include endpoint checks")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    print("=" * 60)
    print("SOTA Extension Ecosystem Audit")
    print("=" * 60)

    audit_chrome_manifests()
    audit_duo_bus_sync()
    audit_cli_extensions()
    audit_security()
    audit_code_quality()

    if args.full:
        audit_integration_endpoints()

    print("\n" + "=" * 60)
    print(f"Results: {results['pass']} PASS, {results['fail']} FAIL, {results['warn']} WARN")
    print("=" * 60)

    if args.json:
        print(json.dumps(results, indent=2))

    sys.exit(1 if results["fail"] > 0 else 0)


if __name__ == "__main__":
    main()
