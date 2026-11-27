-- NEXUS-OMNIKERNEL v1.1-EVOLVED | SQLite 3.45+ (WAL, Pre-Filtered BLOB Vectors, Bi-Temporal)
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

-- 1. BUCKETS & OPERATIONAL PROFILE (Aligned to the 7 ICM domains + FinOps + Pareto)
CREATE TABLE IF NOT EXISTS buckets (
    bucket_id           TEXT PRIMARY KEY,
    modality            TEXT NOT NULL CHECK (modality IN ('code', 'structured', 'prose', 'hybrid')),
    pareto_profile      TEXT NOT NULL DEFAULT 'balanced_roi'
                        CHECK (pareto_profile IN ('max_precision', 'balanced_roi', 'low_latency')),
    policy_json         TEXT NOT NULL,
    max_retries         INTEGER NOT NULL DEFAULT 3,
    max_cost_usd        REAL NOT NULL DEFAULT 0.50,
    updated_at          TEXT NOT NULL
);

-- 2. M_addr: BI-TEMPORAL CANONICAL REGISTRY (Lookup O(1) + Immutable History + Z3 Gate)
CREATE TABLE IF NOT EXISTS canonical_registry (
    record_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_uri          TEXT NOT NULL,
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    artifact_kind       TEXT NOT NULL
                        CHECK (artifact_kind IN ('contract', 'anchor_pos', 'anchor_neg', 'ess_strategy', 'test_case', 'artifact')),
    version             INTEGER NOT NULL DEFAULT 1,
    sha256              TEXT NOT NULL,
    content             TEXT NOT NULL,
    z3_constraints_json TEXT,
    z3_status           TEXT NOT NULL DEFAULT 'SKIPPED'
                        CHECK (z3_status IN ('SAT', 'UNSAT', 'UNKNOWN', 'SKIPPED')),
    valid_from          TEXT NOT NULL,
    valid_to            TEXT,
    ingested_at         TEXT NOT NULL,
    UNIQUE (serial_uri, version)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registry_active_uri
    ON canonical_registry(serial_uri) WHERE valid_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_registry_bucket_active
    ON canonical_registry(bucket_id, artifact_kind) WHERE valid_to IS NULL;

-- 3. M_sem: PRE-FILTERED PARTITIONED SEMANTIC INDEX + SPACE ANCHORS + TTL
CREATE TABLE IF NOT EXISTS semantic_chunks (
    chunk_id            INTEGER PRIMARY KEY AUTOINCREMENT,
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    record_id           INTEGER REFERENCES canonical_registry(record_id),
    anchor_polarity     TEXT NOT NULL DEFAULT 'none'
                        CHECK (anchor_polarity IN ('none', 'positive', 'negative')),
    content_summary     TEXT NOT NULL,
    embedding           BLOB NOT NULL,
    embedding_dim       INTEGER NOT NULL,
    model_id            TEXT NOT NULL,
    ttl_expires_at      TEXT,
    created_at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sem_bucket_polarity_ttl
    ON semantic_chunks(bucket_id, anchor_polarity, ttl_expires_at);

-- 4. ROLE-STRATIFIED CONFORMAL RISK CONTROL (Monotonic 1D lambda + Tier0 gate)
CREATE TABLE IF NOT EXISTS crc_calibration (
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    action_role         TEXT NOT NULL
                        CHECK (action_role IN ('READ_ONLY', 'LOCAL_PATCH', 'COMMIT_PROD', 'EXTERNAL_TOOL')),
    alpha_target        REAL NOT NULL,
    lambda_unified      REAL NOT NULL,
    lambda_id_min       REAL NOT NULL,
    lambda_viol_max     REAL NOT NULL,
    conv_high_threshold REAL NOT NULL DEFAULT 0.85,
    conv_low_threshold  REAL NOT NULL DEFAULT 0.55,
    sample_size_n       INTEGER NOT NULL DEFAULT 0,
    is_cold_start       INTEGER NOT NULL DEFAULT 1 CHECK (is_cold_start IN (0, 1)),
    calibration_mode    TEXT NOT NULL DEFAULT 'cold_start'
                        CHECK (calibration_mode IN ('cold_start', 'auto_calibration', 'tier0_formal')),
    calibrated_at       TEXT NOT NULL,
    PRIMARY KEY (bucket_id, action_role)
);

-- 5. M_work: DURABLE WORKFLOW RUNS & DOUBLE-IDEMPOTENT CHECKPOINTS
CREATE TABLE IF NOT EXISTS workflow_runs (
    run_id              TEXT PRIMARY KEY,
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    contract_record_id  INTEGER NOT NULL REFERENCES canonical_registry(record_id),
    prefix_hash         TEXT NOT NULL,
    status              TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMMITTED', 'CIRCUIT_BROKEN', 'ABORTED')),
    session_id          TEXT,
    conductor_vehicle   TEXT,
    conductor_model     TEXT,
    total_tokens_in     INTEGER NOT NULL DEFAULT 0,
    cached_tokens_in    INTEGER NOT NULL DEFAULT 0,
    total_tokens_out    INTEGER NOT NULL DEFAULT 0,
    total_cost_usd      REAL NOT NULL DEFAULT 0.0,
    started_at          TEXT NOT NULL,
    finished_at         TEXT
);

CREATE TABLE IF NOT EXISTS node_checkpoints (
    checkpoint_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    idempotency_key     TEXT NOT NULL UNIQUE,
    run_id              TEXT NOT NULL REFERENCES workflow_runs(run_id),
    node_id             TEXT NOT NULL,
    action_role         TEXT NOT NULL
                        CHECK (action_role IN ('READ_ONLY', 'LOCAL_PATCH', 'COMMIT_PROD', 'EXTERNAL_TOOL')),
    attempt             INTEGER NOT NULL CHECK (attempt >= 1),
    compute_lane        TEXT NOT NULL CHECK (compute_lane IN ('L0_DET', 'L1_EDGE_ECON', 'L2_FRONTIER', 'L3_MUTATOR')),
    strategy_record_id  INTEGER REFERENCES canonical_registry(record_id),
    cascade_stage       TEXT NOT NULL
                        CHECK (cascade_stage IN ('S0_SYNTAX', 'S05_Z3', 'S1_UNIT', 'S2_ADVERSARIAL')),
    v_det_passed        INTEGER NOT NULL CHECK (v_det_passed IN (0, 1)),
    z3_status           TEXT NOT NULL DEFAULT 'SKIPPED'
                        CHECK (z3_status IN ('SAT', 'UNSAT', 'UNKNOWN', 'SKIPPED')),
    error_hash          TEXT,
    error_delta         TEXT,
    equiv_metric_kind   TEXT NOT NULL CHECK (equiv_metric_kind IN ('SINGLE', 'AST_TEST', 'LAYA_S1_NLI', 'ONNX_NLI')),
    convergence_score   REAL NOT NULL,
    s_id                REAL NOT NULL,
    s_viol              REAL NOT NULL,
    drift_score         REAL NOT NULL,
    stage_dense_reward  REAL NOT NULL DEFAULT 0.0,
    cost_usd            REAL NOT NULL DEFAULT 0.0,
    latency_ms          INTEGER NOT NULL DEFAULT 0,
    artifact_blob       TEXT,
    decision            TEXT NOT NULL
                        CHECK (decision IN ('COMMIT', 'REGENERATE_CLEAN', 'INJECT_ASYMMETRY', 'REJECT_DRIFT', 'CIRCUIT_BREAK')),
    created_at          TEXT NOT NULL,
    UNIQUE (run_id, node_id, attempt)
);
CREATE INDEX IF NOT EXISTS idx_ckpt_run_node ON node_checkpoints(run_id, node_id, attempt);

-- 6. M_replay: PRIORITIZED EXPERIENCE REPLAY BUFFER (n-Step + Human Feedback)
CREATE TABLE IF NOT EXISTS replay_buffer (
    episode_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id              TEXT NOT NULL REFERENCES workflow_runs(run_id),
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    node_id             TEXT NOT NULL,
    action_role         TEXT NOT NULL,
    strategy_record_id  INTEGER REFERENCES canonical_registry(record_id),
    step_index          INTEGER NOT NULL,
    v_det_passed        INTEGER NOT NULL DEFAULT 1 CHECK (v_det_passed IN (0, 1)),
    drift_score         REAL NOT NULL DEFAULT 0.0,
    dense_reward        REAL NOT NULL,
    human_edit_ratio    REAL,
    reverted            INTEGER NOT NULL DEFAULT 0 CHECK (reverted IN (0, 1)),
    n_step_return       REAL NOT NULL,
    predicted_value     REAL NOT NULL DEFAULT 0.5,
    per_priority        REAL NOT NULL,
    trace_summary       TEXT NOT NULL,
    crystallized        INTEGER NOT NULL DEFAULT 0 CHECK (crystallized IN (0, 1)),
    created_at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_replay_per
    ON replay_buffer(bucket_id, crystallized, per_priority DESC);

-- 7. M_ESS OFFLINE: MAP-ELITES PARETO 3D ARCHIVE & GEPA REFLECTIONS
CREATE TABLE IF NOT EXISTS map_elites_archive (
    bucket_id           TEXT NOT NULL REFERENCES buckets(bucket_id),
    niche_id            TEXT NOT NULL CHECK (niche_id IN ('max_precision', 'balanced_roi', 'low_latency')),
    strategy_record_id  INTEGER NOT NULL REFERENCES canonical_registry(record_id),
    mean_quality        REAL NOT NULL,
    mean_cost_usd       REAL NOT NULL,
    mean_latency_ms     REAL NOT NULL,
    zero_reg_verified   INTEGER NOT NULL CHECK (zero_reg_verified = 1),
    approval_mode       TEXT NOT NULL DEFAULT 'auto_calibration'
                        CHECK (approval_mode IN ('auto_calibration', 'tier0_formal')),
    promoted_at         TEXT NOT NULL,
    PRIMARY KEY (bucket_id, niche_id)
);

CREATE TABLE IF NOT EXISTS gepa_reflections (
    reflection_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    bucket_id            TEXT NOT NULL REFERENCES buckets(bucket_id),
    source_episode_ids   TEXT NOT NULL,
    root_cause_rule      TEXT NOT NULL,
    challenger_record_id INTEGER REFERENCES canonical_registry(record_id),
    pareto_dominated     INTEGER NOT NULL DEFAULT 0 CHECK (pareto_dominated IN (0, 1)),
    created_at           TEXT NOT NULL
);
