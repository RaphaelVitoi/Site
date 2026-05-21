# pylint: disable=missing-module-docstring, logging-fstring-interpolation, invalid-name, line-too-long

import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class AuditEngine:
    """
    SOTA: Motor de Purificação e Captura de Logs Visuais do VDOM (Next.js).
    Intercepta erros de React Fiber, anomalias matemáticas e exaustão de estado.
    """
    def __init__(self, manager):
        self.manager = manager
        self.log_dir = Path(".claude/audit_logs")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.active_buffer = []
        self.MAX_BUFFER = 50

    async def process_frontend_events(self, events: list[dict]):
        """Processa, purifica e descarrega a entropia visual no disco."""
        if not events:
            return

        purified_events = []
        for evt in events:
            # Purificação: Remoção de ruído base64, source maps gigantes do webpack
            safe_msg = str(evt.get("message", ""))
            if len(safe_msg) > 1000:
                safe_msg = safe_msg[:1000] + "... [TRUNCATED_BY_SOTA]"

            level = evt.get("level", "info").upper()

            purified_events.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": level,
                "component": evt.get("component", "Unknown"),
                "message": safe_msg
            })

        self.active_buffer.extend(purified_events)

        if len(self.active_buffer) >= self.MAX_BUFFER:
            await self._flush_to_disk()

    async def _flush_to_disk(self):
        """Descarrega o buffer termodinâmico para o File System O(1)."""
        if not self.active_buffer:
            return

        target_file = self.log_dir / f"vdom_audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.jsonl"

        def _write():
            with open(target_file, "a", encoding="utf-8") as f:
                for evt in self.active_buffer:
                    f.write(json.dumps(evt) + "\n")

        await asyncio.to_thread(_write)
        logger.info(f"[AUDIT ENGINE] {len(self.active_buffer)} anomalias do VDOM purificadas e persistidas.")
        self.active_buffer.clear()
