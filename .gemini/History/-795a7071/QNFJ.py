import time
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class VitoiContextHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            print(f"[ANTEVISÃO] Mudança detectada: {event.src_path}. Atualizando Grafo de Dependências...")

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
