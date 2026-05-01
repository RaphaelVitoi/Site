import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional


@lru_cache(maxsize=128)
def _read_file_cached_internal(file_path: Path, mtime: float) -> Optional[str]:
    """Funcao de cache interna que depende do mtime para invalidacao automatica."""
    try:
        # SOTA (Correcao 5): Prevencao Absoluta de Path Traversal
        base_path = Path(__file__).parent.parent.resolve()
        target_path = file_path.resolve()
        if not target_path.is_relative_to(base_path):
            logging.critical("[SEC] Caminho absoluto suspeito detectado no cache (Path Traversal). Operacao abortada.")
            return None
        with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        logging.warning(f"Cache Read Fail: Nao foi possivel ler {file_path}: {e}")
    return None


def _read_file_with_cache(file_path: Path) -> Optional[str]:
    """Le um arquivo usando um cache que e invalidado pela data de modificacao (mtime)."""
    if not file_path.is_file():
        return None
    try:
        mtime = file_path.stat().st_mtime
        return _read_file_cached_internal(file_path, mtime)
    except FileNotFoundError:
        # O arquivo pode ter sido deletado entre a verificacao e a leitura.
        return None
    except Exception as e:
        logging.warning(f"Erro ao acessar mtime para {file_path}: {e}")
    return None
