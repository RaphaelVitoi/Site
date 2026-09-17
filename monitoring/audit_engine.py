# pylint: disable=missing-module-docstring, logging-fstring-interpolation, invalid-name, line-too-long

import asyncio
from datetime import UTC, datetime
import json
import logging
from pathlib import Path
from typing import Any

from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)


class AuditEngine:
    """
    SOTA: Motor de Purificacao e Captura de Logs Visuais do VDOM (Next.js).
    Intercepta erros de React Fiber, anomalias matematicas e exaustao de estado.
    """

    def __init__(self, manager):
        self.manager = manager
        self.log_dir = Path(".claude/AUDITORIA")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.active_buffer = []
        self.MAX_BUFFER: int = 50

    async def process_frontend_events(self, events: list[Any]):
        """Processa, purifica e descarrega a entropia visual no disco."""
        if not events:
            return

        purified_events = []
        for evt in events:
            # Evento que nao e dict levantava AttributeError e descartava o lote
            # inteiro (BK-05). Descarta-se so o evento invalido.
            if not isinstance(evt, dict):
                continue
            # Purificacao: Remocao de ruido base64, source maps gigantes do webpack
            safe_msg = str(evt.get("message", ""))
            if len(safe_msg) > 1000:
                safe_msg = safe_msg[:1000] + "... [TRUNCATED_BY_SOTA]"

            level = str(evt.get("level", "info"))[:16].upper()

            purified_events.append(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "level": enforce_pure_ascii(level),
                    "component": enforce_pure_ascii(str(evt.get("component", "Unknown"))[:128]),
                    "message": enforce_pure_ascii(safe_msg),
                }
            )

        self.active_buffer.extend(purified_events)

        if len(self.active_buffer) >= self.MAX_BUFFER:
            await self._flush_to_disk()

    async def flush(self):
        """Efetua o flush explicito do buffer para o disco."""
        await self._flush_to_disk()

    async def _flush_to_disk(self):
        """Descarrega o buffer termodinamico para o File System O(1)."""
        if not self.active_buffer:
            return

        target_file = self.log_dir / f"vdom_audit_{datetime.now(UTC).strftime('%Y%m%d')}.jsonl"

        # Troca o buffer ANTES do await. O `clear()` depois da gravacao apagava os
        # eventos que chegassem enquanto a thread escrevia, sem grava-los.
        batch, self.active_buffer = self.active_buffer, []

        def _write():
            with open(target_file, "a", encoding="ascii", errors="backslashreplace") as f:
                f.writelines(json.dumps(evt, ensure_ascii=True) + "\n" for evt in batch)

        await asyncio.to_thread(_write)
        logger.info(f"[AUDIT ENGINE] {len(batch)} anomalias do VDOM purificadas e persistidas.")
