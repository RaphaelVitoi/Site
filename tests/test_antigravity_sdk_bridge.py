"""Testes unitarios e de isolamento para o Antigravity SDK Bridge (Protocolo Chico SOTA v8.0 GOLD)."""

from collections.abc import Generator
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from typer.testing import CliRunner

from google.antigravity import (
    AgentBehavior,
    LiteRTAgentConfig,
    LocalAgentConfig,
    LocalOpenAIAgentConfig,
    policy,
    types,
)
from llm.antigravity_sdk_bridge import (
    AntigravityAgentBridge,
    default_bridge,
    discover_skill_directories,
    find_agy_cli,
    get_default_safety_policies,
    get_shared_gateway_base,
    load_mcp_servers_from_nucleo,
    resolve_env_or_registry,
)
from scripts.cli.nexus import app


def test_discover_skill_directories_finds_project_skills() -> None:
    """Verifica se os diretorios de skills do projeto sao descobertos com SKILL.md valido."""
    paths = discover_skill_directories()
    assert isinstance(paths, list)
    assert len(paths) >= 1

    site_skills = (Path(__file__).resolve().parent.parent / ".agents" / "skills").resolve()
    normalized = [Path(p).resolve() for p in paths]
    assert site_skills in normalized

    for p in paths:
        path_obj = Path(p)
        assert path_obj.is_dir()
        has_skill = any((c / "SKILL.md").is_file() for c in path_obj.iterdir() if c.is_dir())
        assert has_skill, f"Diretorio {p} nao contem subpastas com SKILL.md"


def test_discover_skill_directories_synthetic(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida a descoberta hermetica de skills via mock de caminhos candidatos."""
    fake_skill_dir = tmp_path / "custom_skills" / "poker_math"
    fake_skill_dir.mkdir(parents=True)
    (fake_skill_dir / "SKILL.md").write_text("# Poker Math Skill", encoding="utf-8")

    import llm.antigravity_sdk_bridge as bridge_mod

    monkeypatch.setattr(
        bridge_mod,
        "candidate_skill_roots",
        lambda: [tmp_path / "custom_skills"],
    )

    discovered = bridge_mod.discover_skill_directories()
    assert len(discovered) == 1
    assert Path(discovered[0]).resolve() == (tmp_path / "custom_skills").resolve()


def test_get_shared_gateway_base(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifica derivacao dinamica da URL base do gateway MCP."""
    fake_nucleo = tmp_path / "nucleo.json"
    fake_nucleo.write_text(
        json.dumps({"mcp": {"gateway": {"host": "10.0.0.1", "port": 9000}}}),
        encoding="utf-8",
    )

    import llm.antigravity_sdk_bridge as bridge_mod

    monkeypatch.setattr(bridge_mod, "NUCLEO_PATH", fake_nucleo)

    gw = get_shared_gateway_base()
    assert gw == "http://10.0.0.1:9000/servers"


def test_load_mcp_servers_from_nucleo_synthetic(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Valida a conversao hermetica de servidores MCP do nucleo em objetos tipados do SDK."""
    fake_nucleo = tmp_path / "nucleo.json"
    fake_payload = {
        "mcp": {
            "gateway": {"host": "127.0.0.1", "port": 8933},
            "compartilhados": {
                "server_stdio": {"transporte": "stdio"},
                "server_http": {"transporte": "http", "url": "https://api.example.com/mcp"},
            },
        }
    }
    fake_nucleo.write_text(json.dumps(fake_payload), encoding="utf-8")

    import llm.antigravity_sdk_bridge as bridge_mod

    monkeypatch.setattr(bridge_mod, "NUCLEO_PATH", fake_nucleo)

    servers = load_mcp_servers_from_nucleo()
    assert len(servers) == 2

    # Filtro
    filtered = load_mcp_servers_from_nucleo(only_names={"server_stdio"})
    assert len(filtered) == 1
    assert filtered[0].name == "server_stdio"


def test_get_default_safety_policies() -> None:
    """Verifica a composicao das politicas de seguranca."""
    policies = get_default_safety_policies(allow_run_command=False)
    assert len(policies) == 2
    assert policies[0].tool == "run_command"
    assert policies[0].decision == policy.Decision.DENY
    assert policies[1].tool == "*"
    assert policies[1].decision == policy.Decision.APPROVE

    permissive = get_default_safety_policies(allow_run_command=True)
    assert len(permissive) == 1
    assert permissive[0].decision == policy.Decision.APPROVE


def test_build_hosted_config() -> None:
    """Verifica a construcao de configuracao Hosted com chaves e politicas validas."""
    bridge = AntigravityAgentBridge(autonomous=True, load_skills=True, load_mcp=True)
    cfg = bridge.build_hosted_config(model="gemini-3.8-flash", allow_run_command=False)

    assert isinstance(cfg, LocalAgentConfig)
    assert cfg.models[0].name == "gemini-3.8-flash"
    assert cfg.capabilities.agent_behavior == AgentBehavior.AUTONOMOUS
    assert cfg.skills_paths is not None
    assert len(cfg.skills_paths) > 0
    assert cfg.policies is not None
    assert len(cfg.policies) == 2


def test_build_vertex_config() -> None:
    """Verifica construcao de configuracao Vertex AI Standard e Express."""
    bridge = AntigravityAgentBridge(autonomous=False)
    cfg_standard = bridge.build_vertex_config(project="test-project", location="us-central1")
    assert isinstance(cfg_standard, LocalAgentConfig)
    assert cfg_standard.vertex is True
    assert cfg_standard.project == "test-project"
    assert cfg_standard.location == "us-central1"
    assert cfg_standard.capabilities.agent_behavior == AgentBehavior.INTERACTIVE

    cfg_express = bridge.build_vertex_config(express_api_key="express-key-123")
    assert isinstance(cfg_express, LocalAgentConfig)
    assert cfg_express.vertex is True
    assert cfg_express.api_key == "express-key-123"


def test_build_vertex_config_requires_project(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante erro explicito quando nenhum projeto e fornecido para Vertex Standard."""
    monkeypatch.delenv("GOOGLE_CLOUD_PROJECT", raising=False)
    monkeypatch.delenv("GOOGLE_GENAI_PROJECT", raising=False)

    import llm.antigravity_sdk_bridge as bridge_mod

    monkeypatch.setattr(bridge_mod, "resolve_env_or_registry", lambda name, default="": "")

    bridge = AntigravityAgentBridge()
    with pytest.raises(ValueError, match="GOOGLE_CLOUD_PROJECT"):
        bridge.build_vertex_config(project="")


def test_build_litert_config(tmp_path: Path) -> None:
    """Verifica construcao de configuracao on-device LiteRT."""
    fake_model = tmp_path / "model.litertlm"
    fake_model.write_text("model checkpoint stub")

    bridge = AntigravityAgentBridge()
    cfg = bridge.build_litert_config(
        model_path=str(fake_model),
        enable_speculative_decoding=True,
    )
    assert isinstance(cfg, LiteRTAgentConfig)
    assert cfg.model_path == str(fake_model.resolve())
    assert cfg.enable_speculative_decoding is True


def test_build_local_openai_config() -> None:
    """Verifica construcao de configuracao OpenAI-compatible para servidores locais."""
    bridge = AntigravityAgentBridge()
    cfg = bridge.build_local_openai_config(
        model="strata-125b",
        base_url="http://127.0.0.1:8080/v1",
        lightweight=True,
    )
    assert isinstance(cfg, LocalOpenAIAgentConfig)
    assert cfg.model == "strata-125b"
    assert cfg.base_url == "http://127.0.0.1:8080/v1"


def test_audit_ecosystem_structure() -> None:
    """Verifica o payload completo gerado pelo auditor do ecossistema."""
    audit = AntigravityAgentBridge.audit_ecosystem()
    assert "sdk" in audit
    assert "cli" in audit
    assert "skills" in audit
    assert "mcp" in audit
    assert "auth" in audit

    assert audit["sdk"]["package"] == "google-antigravity"
    assert isinstance(audit["sdk"]["localharness_exists"], bool)
    assert isinstance(audit["skills"]["discovered_directories_count"], int)
    assert isinstance(audit["mcp"]["bridged_servers_count"], int)
    assert "GEMINI_API_KEY" in audit["auth"]


@pytest.mark.skipif(find_agy_cli() is None, reason="agy CLI nao instalado no ambiente de execucao")
def test_find_agy_cli_when_installed() -> None:
    """Verifica localizacao do executavel agy quando instalado."""
    cli_path = find_agy_cli()
    assert cli_path is not None
    assert cli_path.is_file()
    assert cli_path.name.lower().startswith("agy")


def test_nexus_cli_antigravity_status() -> None:
    """Verifica execucao do comando nexus antigravity status."""
    runner = CliRunner()
    result = runner.invoke(app, ["antigravity", "status"])
    assert result.exit_code == 0
    assert "GOOGLE ANTIGRAVITY SDK & ECOSYSTEM" in result.stdout


def test_nexus_cli_antigravity_status_json() -> None:
    """Verifica execucao do comando nexus antigravity status --json."""
    runner = CliRunner()
    result = runner.invoke(app, ["antigravity", "status", "--json"])
    assert result.exit_code == 0
    parsed = json.loads(result.stdout)
    assert parsed["sdk"]["package"] == "google-antigravity"
    assert "localharness_exists" in parsed["sdk"]


def test_nexus_cli_antigravity_skills() -> None:
    """Verifica execucao do comando nexus antigravity skills."""
    runner = CliRunner()
    result = runner.invoke(app, ["antigravity", "skills"])
    assert result.exit_code == 0
    assert "ANTIGRAVITY SDK: SKILLS DESCOBERTAS" in result.stdout
