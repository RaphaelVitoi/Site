import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class VitoiContextHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if str(event.src_path).endswith(".py"):
            print(
                f"[ANTEVISAO] Mudanca detectada: {event.src_path}. Atualizando Grafo de Dependencias..."
            )


if __name__ == "__main__":
    path = "."
    event_handler = VitoiContextHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    print("[VITOI SOTA] Sentinela de Contexto Ativa. Monitorando Entropia...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
