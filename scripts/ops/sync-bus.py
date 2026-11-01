#!/usr/bin/env python3
# ruff: noqa: N999
"""Sync shared SOTA Duo Bus into both Chrome extensions.

Copies extensions/_shared/sota-bus/sota-bus.js into:
  - extensions/sota-chrome-cockpit/sota-bus.js
  - extensions/tab-autocomplete-nano/sota-bus.js

Also copies the protocol documentation.

Usage:
    python scripts/sync-bus.py [--check]
"""

import argparse
import filecmp
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent.parent.parent  # .gemini/ (parent of Site/)
SOTA_BUS_FILENAME = "sota-bus.js"
SHARED = ROOT / "extensions" / "_shared" / "sota-bus" / SOTA_BUS_FILENAME
TARGETS = [
    ROOT / "extensions" / "sota-chrome-cockpit" / SOTA_BUS_FILENAME,
    ROOT / "extensions" / "tab-autocomplete-nano" / SOTA_BUS_FILENAME,
]


def sync(check: bool = False) -> bool:
    if not SHARED.exists():
        print(f"[ERROR] Shared bus not found: {SHARED}")
        return False

    all_ok = True
    for target in TARGETS:
        if check:
            if not target.exists():
                print(f"[MISSING] {target}")
                all_ok = False
            elif not filecmp.cmp(SHARED, target, shallow=False):
                print(f"[DRIFT] {target} differs from shared")
                all_ok = False
            else:
                print(f"[OK] {target} in sync")
        else:
            shutil.copy2(SHARED, target)
            print(f"[SYNCED] {target}")

    return all_ok


def main():
    parser = argparse.ArgumentParser(description="Sync SOTA Duo Bus")
    parser.add_argument("--check", action="store_true", help="Check sync status without modifying")
    args = parser.parse_args()

    success = sync(check=args.check)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
