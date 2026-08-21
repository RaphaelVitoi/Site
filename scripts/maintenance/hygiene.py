import os
import time
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# SOTA v7.0 GOLD: Temporal Hygiene Constants
MAX_AGE_DAYS = 7
MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60
NEXUS_ZONE = Path("temp/nexus_zone")


def extirpate_obsolete_artifacts():
    """
    Realiza a limpeza profunda de logs, cookies e caches com mais de 7 dias.
    Garante que a entropia do disco seja extirpada ciclicamente.
    """
    if not NEXUS_ZONE.exists():
        logger.warning(f"[HYGIENE] Nexus Zone ({NEXUS_ZONE}) nao encontrada. Abortando.")
        return

    now = time.time()
    count = 0
    bytes_freed = 0

    logger.info(f"[HYGIENE] Iniciando auditoria temporal (Limite: {MAX_AGE_DAYS} dias)...")

    for root, _, files in os.walk(NEXUS_ZONE):
        for file in files:
            file_path = Path(root) / file
            try:
                mtime = file_path.stat().st_mtime
                if now - mtime > MAX_AGE_SECONDS:
                    size = file_path.stat().st_size
                    file_path.unlink()
                    count += 1
                    bytes_freed += size
                    logger.debug(f"[HYGIENE] Extirpado: {file_path}")
            except Exception as e:
                logger.warning("[HYGIENE] Falha ao remover %s: %s", file_path, e)

    if count > 0:
        logger.info(f"[HYGIENE] Sucesso: {count} artefatos extirpados. {bytes_freed / 1024:.2f} KB liberados.")
    else:
        logger.info("[HYGIENE] Nexus Zone esta em conformidade. Nenhuma entropia detectada.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    extirpate_obsolete_artifacts()
