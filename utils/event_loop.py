"""Utilitario de inicializacao do event loop com suporte a winloop no Windows."""

from __future__ import annotations

import asyncio
from collections.abc import Coroutine
import os
import sys
from typing import Any


def _should_use_winloop() -> bool:
    """Retorna True quando winloop deve ser usado no Windows 11/Win32."""
    if sys.platform != "win32":
        return False
    return os.environ.get("NEXUS_DISABLE_WINLOOP", "").strip().lower() not in {"1", "true", "yes"}


def run_asyncio[T](coro: Coroutine[Any, Any, T]) -> T:
    """Executa uma corrotina raiz com winloop (libuv) no Windows quando disponivel."""
    if _should_use_winloop():
        try:
            import winloop  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

            return winloop.run(coro)
        except ImportError:
            pass
    return asyncio.run(coro)
