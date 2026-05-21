"""
SOTA Cache Utils.
Módulo de utilitários para cache de I/O em disco com invalidação temporal.
"""

import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)


@lru_cache(maxsize=128)
def _read_file_cached_internal(
    file_path: Path,
    mtime: float,  # pylint: disable=unused-argument
) -> str | None:
    """Funcao de cache interna que depende do mtime para invalidacao automatica."""
    try:
        # SOTA (Correcao 5): Prevencao Absoluta de Path Traversal
        base_path = Path(__file__).parent.parent.resolve()
        target_path = file_path.resolve()
        if not target_path.is_relative_to(base_path):
            logger.critical(
                "[SEC] Caminho absoluto suspeito detectado no cache "
                "(Path Traversal). Operacao abortada."
            )
            return None
        with open(target_path, "r", encoding="ascii", errors="ignore") as f:
            return f.read()
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.warning("Cache Read Fail: Nao foi possivel ler %s: %s", file_path, e)
    return None


def _read_file_with_cache(file_path: Path) -> str | None:
    """Le um arquivo usando um cache que e invalidado pela data de modificacao (mtime)."""
    if not file_path.is_file():
        return None
    try:
        mtime = file_path.stat().st_mtime
        return _read_file_cached_internal(file_path, mtime)
    except FileNotFoundError:
        # O arquivo pode ter sido deletado entre a verificacao e a leitura.
        return None
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.warning("Erro ao acessar mtime para %s: %s", file_path, e)
    return None
