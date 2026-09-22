"""
Testes de integracao e conformidade para a Arquitetura Dual-Engine RAG (LanceDB + ChromaDB).
Valida LanceDBBackend, roteamento automatico por complexidade, fusao federada RRF e fallback.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name,protected-access
from pathlib import Path

import pytest

from memory_rag import LanceDBBackend, MemoryRAG


@pytest.fixture
def temp_lance_dir(tmp_path: Path) -> Path:
    lance_dir = tmp_path / "test_lancedb"
    lance_dir.mkdir(parents=True, exist_ok=True)
    return lance_dir


def test_lancedb_backend_initialization_and_table_creation(temp_lance_dir: Path):
    backend = LanceDBBackend(db_path=temp_lance_dir)
    assert backend.table_name == "nexus_knowledge"
    assert backend.table is not None


def test_lancedb_backend_upsert_and_hybrid_search(temp_lance_dir: Path):
    backend = LanceDBBackend(db_path=temp_lance_dir)
    ids = ["doc1#chunk0", "doc2#chunk0"]
    texts = [
        "Perspectiva Matematica PMev Teorema de Vitoi sobre equidade de risco e simplex.",
        "Rotina operacional simples para limpeza de logs e organizacao de tarefas.",
    ]
    v1 = [0.1] * 384
    v2 = [-0.1] * 384
    vectors = [v1, v2]
    metadatas = [
        {"agent": "maverick", "source": "engine/vitoi_perspective_engine.py"},
        {"agent": "organizador", "source": "scripts/maintenance/clean.py"},
    ]

    backend.upsert_records(ids=ids, texts=texts, vectors=vectors, metadatas=metadatas)

    results = backend.search_hybrid(query_vector=v1, query_text="PMev Vitoi", limit=2)
    assert len(results) > 0
    assert "PMev" in results[0]["doc"]
    assert results[0]["instance_engine"] if "instance_engine" in results[0] else results[0]["engine"] == "lancedb"


def test_memory_rag_complexity_detection():
    rag = MemoryRAG.__new__(MemoryRAG)

    assert rag._is_high_complexity_query("Como calcular o Teorema de Vitoi na PMev?") is True
    assert rag._is_high_complexity_query("Explique a autopoiese do simplex e invariantes de risco.") is True
    assert rag._is_high_complexity_query("A" * 151) is True

    assert rag._is_high_complexity_query("Ola") is False
    assert rag._is_high_complexity_query("limpar logs de hoje") is False
    assert rag._is_high_complexity_query("listar tarefas pendentes") is False


def test_non_latin_query_uses_federated_retrieval_when_laya_detects_script(monkeypatch):
    from llm import laya_bridge

    rag = MemoryRAG.__new__(MemoryRAG)
    rag.lance_backend = object()
    monkeypatch.setattr(
        laya_bridge,
        "classificar_intencao",
        lambda _question: type("Intent", (), {"script": "non-latin"})(),
    )

    assert rag._select_target_engine("質問の検索", "auto") == "hybrid_federated"


@pytest.mark.asyncio
async def test_memory_rag_dual_engine_routing(temp_lance_dir: Path):
    rag = MemoryRAG()
    rag.lance_backend = LanceDBBackend(db_path=temp_lance_dir, emb_fn=rag.emb_fn)

    rag.lance_backend.upsert_records(
        ids=["pmev_axiom#0"],
        texts=["Axioma de Vitoi: O PMev supera o ICM sob dinamicas convexas de torneio."],
        vectors=[[0.05] * 384],
        metadatas=[{"agent": "maverick", "source": "engine/vitoi_perspective_engine.py"}],
    )

    out_lance = await rag.query_memory("Qual o axioma PMev de Vitoi?", engine="auto", local_only=True)
    assert "LANCEDB" in out_lance or "MENTE COLETIVA" in out_lance

    out_federated = await rag.query_memory("Qual o axioma PMev de Vitoi?", engine="hybrid_federated", local_only=True)
    assert "FUSAO FEDERADA" in out_federated or "MENTE COLETIVA" in out_federated


@pytest.mark.asyncio
async def test_chroma_empty_fails_over_to_lance():
    class EmptyCollection:
        def query(self, **_kwargs):
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    class LanceFallback:
        async def search(self, _question, n_results):
            return [{"doc": "resultado Lance", "agent": "test", "source": "fixture", "score": 1.0}]

    rag = MemoryRAG.__new__(MemoryRAG)
    rag.collection = EmptyCollection()
    rag.lance_backend = LanceFallback()
    rag.emb_fn = lambda _texts: [[0.1] * 384]
    rag.query_lancedb = LanceFallback.search.__get__(rag.lance_backend, LanceFallback)

    result = await rag.query_memory("consulta simples", local_only=True, engine="chroma")

    assert "LANCEDB" in result
    assert "resultado Lance" in result


@pytest.mark.asyncio
async def test_lance_failure_fails_over_to_chroma():
    class ChromaCollection:
        def query(self, **_kwargs):
            return {
                "documents": [["resultado Chroma"]],
                "metadatas": [[{"agent": "test", "source": "fixture"}]],
                "distances": [[0.1]],
            }

    rag = MemoryRAG.__new__(MemoryRAG)
    rag.collection = ChromaCollection()
    rag.lance_backend = object()
    rag.query_lancedb = lambda *_args, **_kwargs: None

    async def no_lance(*_args, **_kwargs):
        return []

    rag.query_lancedb = no_lance

    result = await rag.query_memory("consulta complexa PMev", local_only=True, engine="lance")

    assert "CHROMADB" in result
    assert "resultado Chroma" in result


@pytest.mark.asyncio
async def test_sync_lance_to_chroma_upserts_vectors_in_batches():
    class ArrowRows:
        def to_pylist(self):
            return [{"id": "doc-1", "text": "conteudo", "vector": [0.25] * 384, "agent": "test", "source": "a.md"}]

    class LanceTable:
        def to_arrow(self):
            return ArrowRows()

    class ChromaCollection:
        def __init__(self):
            self.rows = []

        def upsert(self, **kwargs):
            self.rows.extend(kwargs["ids"])

        def count(self):
            return len(self.rows)

    rag = MemoryRAG.__new__(MemoryRAG)
    rag.lance_backend = type("Lance", (), {"table": LanceTable()})()
    rag.collection = ChromaCollection()

    result = await rag.sync_lance_to_chroma(batch_size=1)

    assert result == {"source_rows": 1, "unique_ids": 1, "chroma_count": 1}
    assert rag.collection.rows == ["doc-1"]


@pytest.mark.asyncio
async def test_storage_health_records_local_snapshot_without_forecasting_early(monkeypatch, tmp_path):
    import memory_rag

    class ChromaCollection:
        def get(self, **_kwargs):
            return {"ids": ["doc-1"]}

    class LanceRows:
        def select(self, _columns):
            return self

        def to_pylist(self):
            return [{"id": "doc-1"}]

    class LanceTable:
        def to_arrow(self):
            return LanceRows()

    monkeypatch.setattr(memory_rag, "RAG_HEALTH_DB_PATH", tmp_path / "health.sqlite3")
    rag = MemoryRAG.__new__(MemoryRAG)
    rag.collection = ChromaCollection()
    rag.lance_backend = type("Lance", (), {"table": LanceTable()})()

    result = await rag.storage_health()

    assert result["ids_match"] is True
    assert result["chroma_count"] == result["lance_count"] == 1
    assert result["history_days"] == 1
    assert result["forecast_status"] == "insufficient_history"
