"""
Cliente de inferencia para a engine Splash (Mac M3+).
Governanca: Protocolo Master Chico SOTA v8.0 GOLD.

Utiliza especulacao de tokens via modelo draft (Flash 2) para acelerar a geracao.
"""

from __future__ import annotations

import logging

from llm.local_engine_client import LocalEngineClient

logger = logging.getLogger(__name__)

DEFAULT_SPLASH_HOST = "127.0.0.1"
DEFAULT_SPLASH_PORT = 8081
ENGINE_SPLASH_VERSION = "Splash-Metal-v1.3.2"


class SplashServerOfflineError(Exception):
    """SOTA GOLD: Exception raised when Splash server is unreachable."""

    def __init__(self, port: int):
        self.port = port
        self.message = (
            f"[WARN] [SOTA-LOCAL] Splash server is offline or unreachable on port {port}. "
            f"Please ensure the Splash engine is running via LM Studio Bionic or the local server."
        )
        super().__init__(self.message)


class LocalSplashClient(LocalEngineClient):
    """Cliente HTTP sincrono para a engine Splash."""

    def __init__(
        self,
        host: str = DEFAULT_SPLASH_HOST,
        port: int = DEFAULT_SPLASH_PORT,
        timeout: float = 60.0,
    ) -> None:
        super().__init__(host, port, timeout)

    def get_engine_version(self) -> str:
        return ENGINE_SPLASH_VERSION
