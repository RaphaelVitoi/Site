-- SOTA: Estrutura de Knowledge Graphs em SQLite (Causalidade Ontológica)

CREATE TABLE IF NOT EXISTS kg_nodes (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('Concept', 'Agent', 'Theory', 'Metric', 'Event')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kg_edges (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation TEXT NOT NULL CHECK(relation IN ('causes', 'mitigates', 'overrides', 'relates_to', 'requires', 'produces')),
    weight REAL DEFAULT 1.0,
    context_ref TEXT, -- Fragmento/Fonte de onde a IA extraiu a relação causal
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(source_id) REFERENCES kg_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY(target_id) REFERENCES kg_nodes(id) ON DELETE CASCADE,
    UNIQUE(source_id, target_id, relation)
);

-- Índices de Alta Performance para Travessia de Grafo (O(1) lookups)
CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_label ON kg_nodes(label);
