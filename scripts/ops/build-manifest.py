#!/usr/bin/env python3
"""Build-time manifest injector for Chrome extensions.

Replaces {{OAUTH_CLIENT_ID}} placeholders in manifest.json with real
credentials from config/oauth.json (gitignored).

Usage:
    python scripts/build-manifest.py <extension-dir> [--config <path>]

Example:
    python scripts/build-manifest.py /c/Users/rapha/.gemini/extensions/superpower-for-gemini-1.7.9.1
"""

import argparse
import json
import os
import sys
from pathlib import Path


def build_manifest(ext_dir: Path, config_path: Path | None = None) -> bool:
    ext_dir = Path(ext_dir).resolve()
    manifest_path = ext_dir / "manifest.json"

    if not manifest_path.exists():
        print(f"[ERROR] manifest.json not found in {ext_dir}")
        return False

    # Resolve config path
    if config_path is None:
        config_path = ext_dir / "config" / "oauth.json"

    if not config_path.exists():
        # Fall back to .example
        example_path = ext_dir / "config" / "oauth.json.example"
        if example_path.exists():
            print(f"[WARN] oauth.json not found, using .example (placeholder values)")
            config_path = example_path
        else:
            print(f"[WARN] No oauth.json found at {config_path}. Skipping injection.")
            return False

    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        print(f"[ERROR] Failed to read config: {e}")
        return False

    oauth = config.get("oauth2", {})
    client_id = oauth.get("client_id", "{{OAUTH_CLIENT_ID}}")

    # Read manifest
    manifest_text = manifest_path.read_text(encoding="utf-8")

    # Replace placeholder
    if "{{OAUTH_CLIENT_ID}}" in manifest_text:
        manifest_text = manifest_text.replace("{{OAUTH_CLIENT_ID}}", client_id)
        manifest_path.write_text(manifest_text, encoding="utf-8")
        print(f"[OK] Injected client_id into {manifest_path}")
        return True
    else:
        print(f"[INFO] No placeholder found in manifest. Nothing to do.")
        return True


def main():
    parser = argparse.ArgumentParser(description="Build-time manifest injector")
    parser.add_argument("ext_dir", help="Extension directory path")
    parser.add_argument("--config", help="Path to oauth.json config file", default=None)
    args = parser.parse_args()

    config_path = Path(args.config) if args.config else None
    success = build_manifest(Path(args.ext_dir), config_path)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
