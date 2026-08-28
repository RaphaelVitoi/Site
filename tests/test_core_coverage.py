"""
Testes SOTA para os componentes core do Nexus Orchestrator (config, arbitrator, runtime).
"""
# pylint: disable=protected-access

import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

import core.config as config
import core.runtime as runtime
from core.arbitrator import UniversalArbitrator
from core.schemas import Task


@pytest.fixture(autouse=True)
def patch_valid_agents(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante que agentes de teste sao considerados validos pelo Pydantic."""
    monkeypatch.setattr(config, "VALID_AGENTS", ["@maverick", "@chico"])


@pytest.mark.unit
def test_load_json_config_path_traversal() -> None:
    """Valida que caminhos fora do BASE_DIR sao bloqueados por seguranca."""
    unsafe = Path("C:/Windows/System32/cmd.exe")
    res = config.load_json_config(unsafe, default_value={"blocked": True})
    assert res == {"blocked": True}


@pytest.mark.unit
def test_load_json_config_nonexistent(tmp_path: Path) -> None:
    """Valida retorno de default para arquivo inexistente."""
    res = config.load_json_config(tmp_path / "not-there.json", default_value="default")
    assert res == "default"


@pytest.mark.unit
def test_load_json_config_corrupted(tmp_path: Path) -> None:
    """Valida tratamento de erro de JSON corrompido."""
    bad_file = tmp_path / "bad.json"
    bad_file.write_text("invalid json {", encoding="utf-8")
    res = config.load_json_config(bad_file, default_value="fallback")
    assert res == "fallback"


@pytest.mark.unit
def test_feature_enabled() -> None:
    """Valida leitura de flags do workflow."""
    with patch.dict(config.WORKFLOW_FLAGS, {"test_flag": True}):
        assert config.feature_enabled("test_flag") is True
    assert config.feature_enabled("nonexistent_flag") is False


@pytest.mark.unit
def test_heuristic_terms() -> None:
    """Valida conversao de termos heuristicos para caixa baixa."""
    with patch.dict(config.ROUTING_HEURISTICS, {"test_group": {"TERM": 5}}):
        terms = config.heuristic_terms("test_group")
        assert terms == {"term": 5}


@pytest.mark.unit
def test_agent_sla_value() -> None:
    """Valida resolucao de SLA para agentes ou default."""
    with patch.dict(config.AGENT_SLA, {"@maverick": {"timeout": 30}, "default": {"timeout": 10}}):
        assert config.agent_sla_value("@maverick", "timeout", 60) == 30
        assert config.agent_sla_value("@chico", "timeout", 60) == 10
        assert config.agent_sla_value("@other", "missing", 5) == 5


@pytest.mark.unit
def test_key_blocklist() -> None:
    """Valida o circuito breaker de bloqueio temporario de chaves."""
    key = config._key_identifier("gemini", "my-key-123")
    assert config._is_key_blocked(key) is False
    config._block_key(key)
    assert config._is_key_blocked(key) is True


@pytest.mark.unit
def test_wasm_telemetry_flow(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida o push e flush do buffer de telemetria Wasm."""
    monkeypatch.setattr(config, "PATH_TELEMETRY_DUMP", tmp_path / "wasm.jsonl")

    config.push_wasm_telemetry({"event": "test"})
    assert len(config._TELEMETRY_BUFFER) == 1

    config._flush_telemetry_buffer()
    assert len(config._TELEMETRY_BUFFER) == 0
    assert (tmp_path / "wasm.jsonl").exists()
    lines = (tmp_path / "wasm.jsonl").read_text().splitlines()
    assert len(lines) == 1
    assert json.loads(lines[0]) == {"event": "test"}


@pytest.mark.unit
def test_logging_filters() -> None:
    """Valida a ofuscacao de segredos e ASCII enforcement nos filtros de log."""
    f_secret = config.SecretMaskingFilter()
    record = logging.LogRecord(
        "test", logging.INFO, "path", 10, "Access key: sk-" + "123456789012345678901234567890", None, None
    )
    assert f_secret.filter(record) is True
    assert "[REDACTED_SECRET]" in record.msg

    f_ascii = config.AsciiEnforcementFilter()
    record2 = logging.LogRecord("test", logging.INFO, "path", 10, "Texto com acentuacao", None, None)
    assert f_ascii.filter(record2) is True
    assert "acentuacao" in record2.msg


@pytest.mark.unit
def test_runtime_getattr() -> None:
    """Valida delegacao dinamica de atributos no core.runtime."""
    assert runtime.VALID_AGENTS == ["@maverick", "@chico"]
    assert isinstance(runtime.PID_FILE, Path)
    assert isinstance(runtime.SYSTEM_PROMPT_CACHE, dict)
    with pytest.raises(AttributeError):
        _ = runtime.NONEXISTENT_ATTR


@pytest.mark.asyncio
@pytest.mark.unit
async def test_runtime_rag_singleton() -> None:
    """Valida o Singleton do MemoryRAG no runtime."""
    with patch("memory_rag.MemoryRAG") as mock_rag_cls:
        mock_instance = MagicMock()
        mock_rag_cls.return_value = mock_instance

        with patch("core.runtime._RAG_INSTANCE", None):
            rag1 = runtime.get_rag()
            rag2 = await runtime.get_rag_async()
            assert rag1 is mock_instance
            assert rag2 is mock_instance
            mock_rag_cls.assert_called_once()


@pytest.mark.unit
def test_arbitrator_should_compress() -> None:
    """Valida limite da compressao na lei de Shannon."""
    assert UniversalArbitrator.should_compress("a" * 5000) is True
    assert UniversalArbitrator.should_compress("a" * 100) is False


@pytest.mark.asyncio
@pytest.mark.unit
async def test_arbitrator_search_provider() -> None:
    """Valida a identificacao automatica de provedores de busca."""
    assert await UniversalArbitrator.get_search_provider("next.js deployment error") == "perplexity"
    assert await UniversalArbitrator.get_search_provider("market pricing today") == "tavily"


@pytest.mark.unit
def test_arbitrator_dag_prioritization() -> None:
    """Valida priorizacao baseada em DAG e tempo no UniversalArbitrator."""
    now_str = datetime.now(UTC).isoformat()
    tasks = [
        Task(id="T1", description="Tarefa 1", agent="@maverick", timestamp=now_str, metadata={"priority": "low"}),
        Task(
            id="T2",
            description="Tarefa 2",
            agent="@maverick",
            timestamp=now_str,
            metadata={"priority": "high", "depends_on": ["T1"]},
        ),
    ]

    dag = UniversalArbitrator.build_dependency_map(tasks)
    assert "T1" in dag
    assert "T2" in dag
    assert dag["T1"]["in_degree"] == 0
    assert dag["T2"]["in_degree"] == 1
    assert "T2" in dag["T1"]["out_edges"]

    assert dag["T1"]["total_utility"] > dag["T1"]["base_weight"]

    opt = UniversalArbitrator.extract_optimal_task(tasks)
    assert opt is not None
    assert opt.id == "T1"


@pytest.mark.unit
def test_arbitrator_mermaid_graph() -> None:
    """Valida a geracao de diagramas Mermaid para visualizacao do fluxo."""
    tasks = [
        Task(
            id="T1",
            description="Tarefa 1",
            agent="@maverick",
            timestamp=datetime.now(UTC).isoformat(),
            metadata={"priority": "medium"},
        ),
    ]
    graph = UniversalArbitrator.generate_dependency_mermaid_graph(tasks)
    assert "graph TD" in graph
    assert "T1" in graph
