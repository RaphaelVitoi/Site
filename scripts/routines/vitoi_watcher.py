# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring, import-error, no-name-in-module
from __future__ import annotations

import time
from typing import Any

from watchdog.events import FileSystemEventHandler  # type: ignore[import-untyped]
from watchdog.observers import Observer  # type: ignore[import-untyped]


class VitoiContextHandler(FileSystemEventHandler):
    def on_modified(self, event: Any) -> None:
        if str(event.src_path).endswith(".py"):
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
