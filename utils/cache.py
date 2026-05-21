import os
import pickle
import time
import hashlib
from typing import Any, Optional

class SOTACache:
    """
    SOTA v6.2.1 GOLD: Multi-Tier Caching System (Memory + Disk).
    Otimizado para reduzir latencia em RAG, LLM e calculos matematicos.
    """
    def __init__(self, cache_dir: str = ".cache", ttl: int = 3600):
        self.cache_dir = cache_dir
        self.ttl = ttl
        self.memory_cache: dict[str, tuple[float, Any]] = {}
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def _get_hash(self, key: str) -> str:
        return hashlib.sha256(key.encode()).hexdigest()

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        expiry = time.time() + (ttl or self.ttl)
        self.memory_cache[key] = (expiry, value)
        
        # Persistence for SOTA Gold
        hash_key = self._get_hash(key)
        path = os.path.join(self.cache_dir, f"{hash_key}.pkl")
        with open(path, "wb") as f:
            pickle.dump((expiry, value), f)

    def get(self, key: str) -> Optional[Any]:
        # Tier 1: Memory
        if key in self.memory_cache:
            expiry, value = self.memory_cache[key]
            if expiry > time.time():
                return value
            del self.memory_cache[key]

        # Tier 2: Disk
        hash_key = self._get_hash(key)
        path = os.path.join(self.cache_dir, f"{hash_key}.pkl")
        if os.path.exists(path):
            try:
                with open(path, "rb") as f:
                    expiry, value = pickle.load(f)
                    if expiry > time.time():
                        self.memory_cache[key] = (expiry, value)
                        return value
                os.remove(path)
            except (pickle.PickleError, EOFError):
                pass
        return None

    def clear(self):
        self.memory_cache.clear()
        for f in os.listdir(self.cache_dir):
            os.remove(os.path.join(self.cache_dir, f))

# Backward Compatibility SOTA v6.2.1
def _read_file_cached_internal(path: str) -> str:
    """Internal legacy cached reader."""
    return cache.get(f"file:{path}") or ""

def _read_file_with_cache(path: str) -> str:
    """Legacy entry point for file reading with cache."""
    val = _read_file_cached_internal(path)
    if not val:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                val = f.read()
                cache.set(f"file:{path}", val)
    return val

# Global Instance
cache = SOTACache(cache_dir="C:/Users/Raphael/.gemini/Site/temp/cache")
