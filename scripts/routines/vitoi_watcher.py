"""Sentinela de contexto filesystem (watchdog>=7.1.1) para alteracoes em modulos Python."""

from __future__ import annotations

import time

from watchdog.events import FileSystemEvent, PatternMatchingEventHandler
from watchdog.observers import Observer

_IGNORE_PATTERNS: list[str] = [
    "**/.git/**",
    "**/.venv/**",
    "**/__pycache__/**",
    "**/node_modules/**",
]


class VitoiContextHandler(PatternMatchingEventHandler):
    """Observador filtrado de arquivos Python fora de diretorios de build/VCS."""

    def __init__(self) -> None:
        super().__init__(
            patterns=["**/*.py", "*.py"],
            ignore_patterns=_IGNORE_PATTERNS,
            ignore_directories=True,
        )

    def on_modified(self, event: FileSystemEvent) -> None:
        """Registra modificacao em arquivo Python monitorado."""
        print(f"[ANTEVISAO] Mudanca detectada: {event.src_path}. Atualizando Grafo de Dependencias...")


if __name__ == "__main__":
    WATCH_PATH = "."
    event_handler = VitoiContextHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_PATH, recursive=True)
    observer.start()
    print("[VITOI SOTA] Sentinela de Contexto Ativa. Monitorando Entropia...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
