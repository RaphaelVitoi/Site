from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any, Optional


class MemoryBlock:
    def __init__(
        self, key: str, title: str, content: str, tags: Optional[list[str]] = None, ttl_seconds: Optional[int] = None
    ):
        self.key = key
        self.title = title
        self.content = content
        self.tags = tags or []
        self.created_at = time.time()
        self.updated_at = self.created_at
        self.ttl_seconds = ttl_seconds

    def is_expired(self) -> bool:
        if not self.ttl_seconds:
            return False
        return (time.time() - self.updated_at) > self.ttl_seconds

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "ttl_seconds": self.ttl_seconds,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "MemoryBlock":
        block = cls(
            key=data["key"],
            title=data["title"],
            content=data["content"],
            tags=data.get("tags", []),
            ttl_seconds=data.get("ttl_seconds"),
        )
        block.created_at = data.get("created_at", time.time())
        block.updated_at = data.get("updated_at", block.created_at)
        return block


class NotepadMemory:
    """
    Scratchpad / Working Memory Engine para agentes autonomos.
    Permite compartilhamento de estado, hipoteses, planos de acao e checkpointing entre subagentes.
    """

    def __init__(self, storage_path: Optional[Path] = None):
        self.storage_path = storage_path or (Path(__file__).parent / "notepad_state.json")
        self.markdown_path = self.storage_path.parent / "notepad_active.md"
        self._blocks: dict[str, MemoryBlock] = {}
        self._lock = threading.RLock()
        self._load()

    def _load(self):
        with self._lock:
            if self.storage_path.exists():
                try:
                    data = json.loads(self.storage_path.read_text(encoding="utf-8"))
                    for item in data.get("blocks", []):
                        block = MemoryBlock.from_dict(item)
                        if not block.is_expired():
                            self._blocks[block.key] = block
                except Exception:
                    self._blocks = {}

    def flush(self):
        with self._lock:
            self._evict_expired_internal()
            data = {
                "version": "7.0.0-GOLD",
                "timestamp": time.time(),
                "total_blocks": len(self._blocks),
                "blocks": [b.to_dict() for b in self._blocks.values()],
            }
            self.storage_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            self.markdown_path.write_text(self.render_markdown(), encoding="utf-8")

    def write_block(
        self, key: str, title: str, content: str, tags: Optional[list[str]] = None, ttl_seconds: Optional[int] = None
    ) -> MemoryBlock:
        with self._lock:
            if key in self._blocks:
                block = self._blocks[key]
                block.title = title
                block.content = content
                block.tags = tags or block.tags
                block.updated_at = time.time()
                block.ttl_seconds = ttl_seconds or block.ttl_seconds
            else:
                block = MemoryBlock(key, title, content, tags, ttl_seconds)
                self._blocks[key] = block
            self.flush()
            return block

    def read_block(self, key: str) -> Optional[MemoryBlock]:
        with self._lock:
            block = self._blocks.get(key)
            if block and block.is_expired():
                del self._blocks[key]
                self.flush()
                return None
            return block

    def delete_block(self, key: str) -> bool:
        with self._lock:
            if key in self._blocks:
                del self._blocks[key]
                self.flush()
                return True
            return False

    def list_blocks(self, tag_filter: Optional[str] = None) -> list[MemoryBlock]:
        with self._lock:
            self._evict_expired_internal()
            blocks = list(self._blocks.values())
            if tag_filter:
                blocks = [b for b in blocks if tag_filter in b.tags]
            return sorted(blocks, key=lambda x: x.updated_at, reverse=True)

    def _evict_expired_internal(self):
        expired_keys = [k for k, v in self._blocks.items() if v.is_expired()]
        for k in expired_keys:
            del self._blocks[k]

    def render_markdown(self) -> str:
        with self._lock:
            lines = [
                "# SOTA Working Memory & Notepad Scratchpad",
                f"> **Protocolo Chico v7.0 GOLD** | Ultima Atualizacao: {time.strftime('%Y-%m-%d %H:%M:%S')}",
                "",
                f"**Total de Blocos Ativos:** `{len(self._blocks)}`",
                "---",
                "",
            ]
            for block in self.list_blocks():
                tags_str = " ".join([f"`#{t}`" for t in block.tags]) if block.tags else ""
                lines.extend(
                    [
                        f"## [{block.key}] {block.title} {tags_str}",
                        f"*Atualizado em: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(block.updated_at))}*",
                        "",
                        block.content,
                        "",
                        "---",
                        "",
                    ]
                )
            return "\n".join(lines)


def test_notepad():
    print("=" * 60)
    print("  TESTE DO MOTOR NOTEPAD WORKING MEMORY (CHICO v7.0)")
    print("=" * 60)

    mem = NotepadMemory()
    mem.write_block(
        key="PLAN_CURRENT",
        title="Plano de Otimizacao Sistemica SOTA",
        content="1. Memoria Notepad e Replay Memory integradas.\n2. Clustering de Agentes calibrado.\n3. Sanitizacao de Entropia concluida.",
        tags=["plan", "sota", "active"],
    )
    mem.write_block(
        key="HARDWARE_TOPOLOGY",
        title="Topologia do Core i9-9900K & Z370M",
        content="8 Cores / 16 Threads | 16MB L3 Cache | 32GB RAM | BIOS F14.",
        tags=["hardware", "topology"],
    )

    blocks = mem.list_blocks()
    print(f"[OK] {len(blocks)} blocos de memoria salvos e renderizados em Markdown.")
    for b in blocks:
        print(f"  - [{b.key}] {b.title} (Tags: {b.tags})")
    print("=" * 60)


if __name__ == "__main__":
    test_notepad()
