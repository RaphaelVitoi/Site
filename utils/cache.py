import hashlib
import json
import logging
import os
import shutil
import threading
import time
from typing import Any

logger = logging.getLogger(__name__)


class SOTACache:
    """
    SOTA v6.2.1 GOLD: Multi-Tier Caching System (Memory & Disk).
    Otimizado para reduzir latencia e I/O de disco (Thread-Safe e Teto LRU).
    Todos os artefatos transientes sao isolados na /temp/nexus_zone.
    """

    def __init__(self, cache_dir: str = "temp/nexus_zone/cache", ttl: int = 3600, max_memory_items: int = 2000):
        self.cache_dir = cache_dir
        self.ttl = ttl
        self.max_memory_items = max_memory_items
        self.memory_cache: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def _get_hash(self, key: str) -> str:
        return hashlib.sha256(key.encode()).hexdigest()

    def _evict_if_needed(self):
        """Upper Bound guard: limpa a memoria caso ultrapasse o limite."""
        if len(self.memory_cache) >= self.max_memory_items:
            now = time.time()
            # Eviccao estrita dos ja expirados
            expired = [k for k, v in self.memory_cache.items() if v[0] <= now]
            for k in expired:
                del self.memory_cache[k]
            # Se ainda lotado, remove o item mais velho (FIFO semantico Python 3.7+)
            if len(self.memory_cache) >= self.max_memory_items:
                oldest_key = next(iter(self.memory_cache))
                del self.memory_cache[oldest_key]

    def set(self, key: str, value: Any, ttl: int | None = None):
        expiry = time.time() + (ttl or self.ttl)
        with self._lock:
            self._evict_if_needed()
            self.memory_cache[key] = (expiry, value)
        try:
            os.makedirs(self.cache_dir, exist_ok=True)
            hashed_key = self._get_hash(key)
            cache_file = os.path.join(self.cache_dir, f"{hashed_key}.json")
            tmp_file = cache_file + ".tmp"
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump({"expiry": expiry, "value": value}, f)
            os.replace(tmp_file, cache_file)
        except Exception as e:
            logger.debug("[CACHE] Falha de I/O ao persistir a chave '%s': %s", key, e)

    def get(self, key: str) -> Any | None:
        # Tier 1: Memory Only
        now = time.time()
        with self._lock:
            if key in self.memory_cache:
                expiry, value = self.memory_cache[key]
                if expiry > now:
                    return value
                del self.memory_cache[key]

        # Tier 2: Disk Fallback
        hashed_key = self._get_hash(key)
        cache_file = os.path.join(self.cache_dir, f"{hashed_key}.json")
        try:
            if os.path.exists(cache_file):
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                expiry = data.get("expiry", 0)
                if expiry > now:
                    value = data.get("value")
                    with self._lock:
                        self._evict_if_needed()
                        self.memory_cache[key] = (expiry, value)
                    return value
                else:
                    os.remove(cache_file)
        except json.JSONDecodeError:
            logger.warning("[CACHE] Arquivo corrompido detectado para a chave '%s'. Reciclando...", key)
            try:
                os.remove(cache_file)
            except OSError:
                pass
        except Exception as e:
            logger.debug("[CACHE] Falha ao recuperar chave do disco '%s': %s", key, e)
        return None

    def clear(self):
        with self._lock:
            self.memory_cache.clear()
        try:
            if os.path.exists(self.cache_dir):
                shutil.rmtree(self.cache_dir, ignore_errors=True)
        except Exception as e:
            logger.error("[CACHE] Erro ao expurgar diretorio master de cache: %s", e)


# Backward Compatibility SOTA v6.2.1
def _read_file_cached_internal(path: str) -> str:
    """Internal legacy cached reader."""
    return cache.get(f"file:{path}") or ""


def _read_file_with_cache(path: str) -> str:
    """Legacy entry point for file reading with cache."""
    val = _read_file_cached_internal(path)
    if not val and os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                val = f.read()
                cache.set(f"file:{path}", val)
        except Exception:
            return ""
    return val


# Global Instance
cache = SOTACache()
