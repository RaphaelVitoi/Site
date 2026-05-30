#!/usr/bin/env python3
import os
import re

SOTA_BLOCK = """# ==============================================================================
# SOTA ENVIRONMENT & INTEROP CONFIGURATION
# ==============================================================================
# Correct PATH additions
if [ -d "$HOME/.local/bin" ] ; then
    case ":${PATH}:" in
        *:"$HOME/.local/bin":*) ;;
        *) export PATH="$HOME/.local/bin:$PATH" ;;
    esac
fi

# Environment optimizations
export UV_PROJECT_ENVIRONMENT=.venv-wsl
export PYTHONDONTWRITEBYTECODE=1
export NODE_OPTIONS="--max-old-space-size=4096"

# SOTA Interop: Symmetrical command wrappers for Windows Host
win-powershell() { powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$*"; }
win-nexus() { powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "uv run nexus $*"; }
win-python() { python.exe "$@"; }
win-uv() { uv.exe "$@"; }
win-npm() { npm.cmd "$@"; }
win-npx() { npx.cmd "$@"; }
# ==============================================================================
"""

def update_root_bashrc():
    path = "/root/.bashrc"
    print(f"Updating {path}...")
    content = """# ~/.bashrc: executed by bash(1) for non-login shells.

# Note: PS1 is set in /etc/profile, and the default umask is defined
# in /etc/login.defs. You should not need this unless you want different
# defaults for root.
# PS1='${debian_chroot:+($debian_chroot)}\h:\w\\$ '
# umask 022

# You may uncomment the following lines if you want `ls' to be colorized:
# export LS_OPTIONS='--color=auto'
# eval "$(dircolors)"
# alias ls='ls $LS_OPTIONS'
# alias ll='ls $LS_OPTIONS -l'
# alias l='ls $LS_OPTIONS -lA'

# Some more alias to avoid making mistakes:
# alias rm='rm -i'
# alias cp='cp -i'
# alias mv='mv -i'

""" + SOTA_BLOCK
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def update_root_profile():
    path = "/root/.profile"
    print(f"Updating {path}...")
    content = """# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

# Environment optimizations
export UV_PROJECT_ENVIRONMENT=.venv-wsl
export PYTHONDONTWRITEBYTECODE=1
export NODE_OPTIONS="--max-old-space-size=4096"
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def update_user_bashrc():
    path = "/home/RaphaelVitoi/.bashrc"
    print(f"Updating {path}...")
    with open(path, "r", encoding="utf-8") as f:
        lines = f.read()

    # Locate where the early return is, and insert SOTA_BLOCK before it
    interactive_regex = re.compile(r"(# If not running interactively, don't do anything\s+case \$- in.*?esac)", re.DOTALL)
    
    # Strip any existing SOTA blocks to avoid duplicates
    lines = re.sub(r"# ==============================================================================.*?# ==============================================================================\n", "", lines, flags=re.DOTALL)
    # Remove any existing exports that match our optimized ones
    lines = re.sub(r"export UV_PROJECT_ENVIRONMENT=.venv-wsl\n?", "", lines)
    
    match = interactive_regex.search(lines)
    if match:
        idx = match.start()
        new_content = lines[:idx] + SOTA_BLOCK + "\n" + lines[idx:]
    else:
        # Fallback to appending at the top
        new_content = SOTA_BLOCK + "\n" + lines

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

def update_user_profile():
    path = "/home/RaphaelVitoi/.profile"
    print(f"Updating {path}...")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Strip existing SOTA variables
    content = re.sub(r"export UV_PROJECT_ENVIRONMENT=.venv-wsl\n?", "", content)
    content = re.sub(r"export PYTHONDONTWRITEBYTECODE=1\n?", "", content)
    content = re.sub(r"export NODE_OPTIONS=.*?\n?", "", content)
    
    # Append environment optimizations at the end
    content = content.rstrip() + "\n\n# Environment optimizations\nexport UV_PROJECT_ENVIRONMENT=.venv-wsl\nexport PYTHONDONTWRITEBYTECODE=1\nexport NODE_OPTIONS=\"--max-old-space-size=4096\"\n"
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_root_bashrc()
    update_root_profile()
    update_user_bashrc()
    update_user_profile()
    print("WSL profiles updated successfully.")
