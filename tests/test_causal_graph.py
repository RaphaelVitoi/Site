"""
Suite de Testes do Grafo Causal e Knowledge Graph SOTA v8.0 GOLD.
Validacao de DAG, deteccao estrita de ciclos e bootstrap de axiomas PMev.
"""

from pathlib import Path
import tempfile
import pytest

from core.causal_graph import CausalGraphEngine, CausalNode, CausalEdge


def test_causal_graph_node_crud():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_graph.db"
        engine = CausalGraphEngine(db_path=db_path)

        node = CausalNode(
            id="node_pmev",
            label="Perspectiva Matematica",
            category="AXIOM",
            properties={"author": "Raphael Vitoi", "version": "8.0"},
        )
        engine.add_node(node)

        nodes = engine.list_nodes(category="AXIOM")
        assert len(nodes) == 1
        assert nodes[0]["id"] == "node_pmev"
        assert nodes[0]["properties"]["author"] == "Raphael Vitoi"


def test_causal_graph_edge_and_query():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_graph.db"
        engine = CausalGraphEngine(db_path=db_path)

        n1 = CausalNode(id="n1", label="Teoria Base", category="THEORY")
        n2 = CausalNode(id="n2", label="Teoria Evoluida", category="THEORY")
        engine.add_node(n1)
        engine.add_node(n2)

        edge = CausalEdge(source_id="n2", target_id="n1", relation="SUPPLANTS", weight=0.99)
        assert engine.add_edge(edge) is True

        query_res = engine.query_node("n1")
        assert len(query_res["causes"]) == 1
        assert query_res["causes"][0]["id"] == "n2"
        assert query_res["causes"][0]["relation"] == "SUPPLANTS"


def test_causal_graph_cycle_prevention():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_graph.db"
        engine = CausalGraphEngine(db_path=db_path)

        # A -> B -> C
        nA = CausalNode(id="A", label="A", category="THEORY")
        nB = CausalNode(id="B", label="B", category="THEORY")
        nC = CausalNode(id="C", label="C", category="THEORY")
        engine.add_node(nA)
        engine.add_node(nB)
        engine.add_node(nC)

        engine.add_edge(CausalEdge(source_id="A", target_id="B", relation="CAUSES"))
        engine.add_edge(CausalEdge(source_id="B", target_id="C", relation="CAUSES"))

        # Tentativa de fechar o ciclo: C -> A (deve falhar)
        with pytest.raises(ValueError, match="Ciclo detectado"):
            engine.add_edge(CausalEdge(source_id="C", target_id="A", relation="CAUSES"))

        # Auto-loop: A -> A (deve falhar)
        with pytest.raises(ValueError, match="Ciclo detectado"):
            engine.add_edge(CausalEdge(source_id="A", target_id="A", relation="CAUSES"))


def test_causal_graph_bootstrap_pmev():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_graph.db"
        engine = CausalGraphEngine(db_path=db_path)

        count = engine.bootstrap_pmev_axioms()
        assert count >= 5

        pmev_query = engine.query_node("pmev_core")
        assert pmev_query["node"]["category"] == "AXIOM"
        assert len(pmev_query["effects"]) >= 3
