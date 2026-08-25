"""
NEXUS CAUSAL GRAPH ENGINE (Knowledge Graph SOTA v8.0 GOLD)
Governanca: Raphael Vitoi (Tier 0) | Membrana Cognitiva Nexus
Persistencia: SQLite ACID / WAL Mode | Topologia: Directed Acyclic Graph (DAG)
"""

from __future__ import annotations
import contextlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field


class CausalNode(BaseModel):
    id: str = Field(..., min_length=1, max_length=100, description="Identificador unico (ex: pmev_dynamic_fold)")
    label: str = Field(..., min_length=1, max_length=200)
    category: str = Field(default="THEORY", pattern="^(THEORY|AXIOM|METRIC|SOLVER|AGENT|DIRECTIVE)$")
    properties: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CausalEdge(BaseModel):
    source_id: str
    target_id: str
    relation: str = Field(..., pattern="^(SUPPLANTS|OPTIMIZES|DEPENDS_ON|MITIGATES|CAUSES|EXPANDS)$")
    weight: float = Field(default=1.0, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CausalGraphEngine:
    def __init__(self, db_path: Optional[Path] = None):
        if db_path is None:
            base_dir = Path(__file__).resolve().parent.parent
            self.db_path = base_dir / "database" / "knowledge_graph.db"
        else:
            self.db_path = db_path

        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    @contextlib.contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=5.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute("PRAGMA busy_timeout=5000;")
            conn.execute("PRAGMA foreign_keys=ON;")
            yield conn
            conn.commit()
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS causal_nodes (
                    id TEXT PRIMARY KEY,
                    label TEXT NOT NULL,
                    category TEXT NOT NULL,
                    properties TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS causal_edges (
                    source_id TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    relation TEXT NOT NULL,
                    weight REAL DEFAULT 1.0,
                    metadata TEXT NOT NULL,
                    PRIMARY KEY (source_id, target_id, relation),
                    FOREIGN KEY (source_id) REFERENCES causal_nodes(id) ON DELETE CASCADE,
                    FOREIGN KEY (target_id) REFERENCES causal_nodes(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_causal_edges_src ON causal_edges(source_id);
                CREATE INDEX IF NOT EXISTS idx_causal_edges_tgt ON causal_edges(target_id);
            """)

    def add_node(self, node: CausalNode) -> None:
        with self._get_connection() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO causal_nodes (id, label, category, properties, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (node.id, node.label, node.category, json.dumps(node.properties), node.created_at),
            )

    def add_edge(self, edge: CausalEdge) -> bool:
        if self._would_form_cycle(edge.source_id, edge.target_id):
            raise ValueError(
                f"Insercao violaria a propriedade aciclica (DAG): Ciclo detectado entre '{edge.source_id}' e '{edge.target_id}'."
            )
        with self._get_connection() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO causal_edges (source_id, target_id, relation, weight, metadata)
                   VALUES (?, ?, ?, ?, ?)""",
                (edge.source_id, edge.target_id, edge.relation, edge.weight, json.dumps(edge.metadata)),
            )
            return True

    def _would_form_cycle(self, source: str, target: str) -> bool:
        """DFS para checar se o no target ja atinge o no source direta ou indiretamente."""
        if source == target:
            return True
        visited: Set[str] = set()
        stack: List[str] = [target]
        with self._get_connection() as conn:
            while stack:
                curr = stack.pop()
                if curr == source:
                    return True
                if curr not in visited:
                    visited.add(curr)
                    cursor = conn.execute("SELECT target_id FROM causal_edges WHERE source_id = ?", (curr,))
                    for row in cursor.fetchall():
                        stack.append(row["target_id"])
        return False

    def query_node(self, node_id: str) -> Dict[str, Any]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM causal_nodes WHERE id = ?", (node_id,)).fetchone()
            if not row:
                return {}
            node_data = dict(row)
            node_data["properties"] = json.loads(node_data["properties"])

            causes = conn.execute(
                """SELECT e.relation, e.weight, e.metadata, n.id, n.label, n.category
                   FROM causal_edges e
                   JOIN causal_nodes n ON e.source_id = n.id
                   WHERE e.target_id = ?""",
                (node_id,),
            ).fetchall()

            effects = conn.execute(
                """SELECT e.relation, e.weight, e.metadata, n.id, n.label, n.category
                   FROM causal_edges e
                   JOIN causal_nodes n ON e.target_id = n.id
                   WHERE e.source_id = ?""",
                (node_id,),
            ).fetchall()

            return {
                "node": node_data,
                "causes": [dict(c) for c in causes],
                "effects": [dict(e) for e in effects],
            }

    def list_nodes(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if category:
                rows = conn.execute(
                    "SELECT * FROM causal_nodes WHERE category = ? ORDER BY id ASC", (category,)
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM causal_nodes ORDER BY id ASC").fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["properties"] = json.loads(d["properties"])
                results.append(d)
            return results

    def bootstrap_pmev_axioms(self) -> int:
        """Forja o Grafo Causal Fundamental de Perspectiva Matematica (PMev) vs ICM Classico."""
        nodes = [
            CausalNode(
                id="icm_classic",
                label="ICM Classico (Malmuth-Harrington)",
                category="THEORY",
                properties={"limit": "Static Stacks", "deficiency": "Ignore fold dynamic EV"},
            ),
            CausalNode(
                id="pmev_core",
                label="Perspectiva Matematica (PMev)",
                category="AXIOM",
                properties={"author": "Raphael Vitoi", "accuracy": "Dynamic Equity Evolution", "sota": True},
            ),
            CausalNode(
                id="dynamic_ev_fold",
                label="EV Dinamico do Fold",
                category="METRIC",
                properties={"equation": "EV(fold) != 0", "pressure": "Orbit Cost Degradation"},
            ),
            CausalNode(
                id="multiway_rio",
                label="Multiway RIO Liability",
                category="METRIC",
                properties={"tension": "Combinatorial Exponential Risk"},
            ),
            CausalNode(
                id="risk_premium_dilution",
                label="Diluicao de Premio de Risco",
                category="METRIC",
                properties={"river_dynamic": "Negative Risk Premium Potential"},
            ),
            CausalNode(
                id="mtt_equilibrium_sota",
                label="Equilibrio Real em MTTs",
                category="THEORY",
                properties={"objective": "Long-Term True EV Maximization"},
            ),
        ]

        edges = [
            CausalEdge(source_id="pmev_core", target_id="icm_classic", relation="SUPPLANTS", weight=1.0),
            CausalEdge(source_id="pmev_core", target_id="dynamic_ev_fold", relation="EXPANDS", weight=0.95),
            CausalEdge(source_id="pmev_core", target_id="multiway_rio", relation="OPTIMIZES", weight=0.90),
            CausalEdge(source_id="pmev_core", target_id="risk_premium_dilution", relation="OPTIMIZES", weight=0.92),
            CausalEdge(source_id="dynamic_ev_fold", target_id="mtt_equilibrium_sota", relation="CAUSES", weight=0.98),
            CausalEdge(source_id="multiway_rio", target_id="mtt_equilibrium_sota", relation="CAUSES", weight=0.95),
        ]

        for n in nodes:
            self.add_node(n)
        for e in edges:
            self.add_edge(e)

        return len(nodes)
