#!/usr/bin/env python3
# ruff: noqa: N999
"""Build-time manifest injector for Chrome extensions.

Replaces {{OAUTH_CLIENT_ID}} placeholders in manifest.json with public
OAuth client identifiers from config/oauth.json (gitignored). Note: OAuth
client_id is a public application identifier, not a secret credential.

Usage:
    python scripts/build-manifest.py <extension-dir> [--config <path>]

Example:
    python scripts/build-manifest.py /c/Users/rapha/.gemini/extensions/superpower-for-gemini-1.7.9.1
"""

import argparse
import json
from pathlib import Path
import sys

OAUTH_CLIENT_ID_PLACEHOLDER = "{{OAUTH_CLIENT_ID}}"


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
            print("[WARN] oauth.json not found, using .example (placeholder values)")
            config_path = example_path
        else:
            print(f"[WARN] No oauth.json found at {config_path}. Skipping injection.")
            return False

    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        print(f"[ERROR] Failed to read config: {e}")
        return False

    oauth_meta = config.get("oauth2", {})
    public_client_id = oauth_meta.get("client_id", OAUTH_CLIENT_ID_PLACEHOLDER)

    # Read manifest
    manifest_text = manifest_path.read_text(encoding="utf-8")

    # Replace placeholder
    if OAUTH_CLIENT_ID_PLACEHOLDER in manifest_text:
        manifest_text = manifest_text.replace(OAUTH_CLIENT_ID_PLACEHOLDER, public_client_id)
        manifest_path.write_text(manifest_text, encoding="utf-8")
        print(f"[OK] Injected public client_id into {manifest_path}")
        return True

    print("[INFO] No placeholder found in manifest. Nothing to do.")
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
