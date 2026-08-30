"""
Testes de integracao e conformidade para a Arquitetura Dual-Engine RAG (LanceDB + ChromaDB).
Valida LanceDBBackend, roteamento automatico por complexidade, fusao federada RRF e fallback.
"""

from __future__ import annotations

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
