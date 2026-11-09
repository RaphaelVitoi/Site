"""Testes unitarios e de integracao para o Antigravity SDK Bridge (Protocolo Chico SOTA v8.0 GOLD)."""

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
    AntigravityRunResult,
    default_bridge,
    discover_skill_directories,
    find_agy_cli,
    get_default_safety_policies,
    load_mcp_servers_from_nucleo,
    resolve_env_or_registry,
)
from scripts.cli.nexus import app


def test_discover_skill_directories() -> None:
    """Verifica se os diretorios de skills sao descobertos e contem SKILL.md."""
    paths = discover_skill_directories()
    assert isinstance(paths, list)
    assert len(paths) >= 2

    # Verifica se pelo menos o caminho de skills do Site e builtin estao presentes
    normalized = [Path(p).resolve() for p in paths]
    site_skills = (Path(__file__).resolve().parent.parent / ".agents" / "skills").resolve()
    assert site_skills in normalized

    # Cada diretorio deve conter pelo menos uma pasta com SKILL.md
    for p in paths:
        path_obj = Path(p)
        assert path_obj.is_dir()
        has_skill_file = any((c / "SKILL.md").is_file() for c in path_obj.iterdir() if c.is_dir())
        assert has_skill_file, f"Diretorio {p} nao contem subpastas com SKILL.md"


def test_load_mcp_servers_from_nucleo() -> None:
    """Valida a conversao de servidores MCP compartilhados do nucleo em objetos tipados."""
    servers = load_mcp_servers_from_nucleo()
    assert isinstance(servers, list)
    assert len(servers) > 0

    # Todos os itens devem ser tipos compativeis do SDK
    for s in servers:
        assert isinstance(s, (types.McpStreamableHttpServer, types.McpStdioServer))
        assert s.name

    # Teste de filtro
    filtered = load_mcp_servers_from_nucleo(only_names={"github", "exa"})
    assert len(filtered) <= 2
    names = {s.name for s in filtered}
    assert names.issubset({"github", "exa"})


def test_get_default_safety_policies() -> None:
    """Verifica a composicao das politicas de seguranca."""
    # Modo padrao: run_command negado, demais aprovados
    policies = get_default_safety_policies(allow_run_command=False)
    assert len(policies) == 2
    assert policies[0].tool == "run_command"
    assert policies[0].decision == policy.Decision.DENY
    assert policies[1].tool == "*"
    assert policies[1].decision == policy.Decision.APPROVE

    # Modo permissivo: allow_all
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
    assert cfg.mcp_servers is not None
    assert len(cfg.mcp_servers) > 0
    assert len(cfg.policies) == 2


def test_build_vertex_config() -> None:
    """Verifica construcao de configuracao Vertex AI Standard e Express."""
    bridge = AntigravityAgentBridge(autonomous=False)
    # Standard Mode com ADC
    cfg_standard = bridge.build_vertex_config(project="test-project", location="us-central1")
    assert isinstance(cfg_standard, LocalAgentConfig)
    assert cfg_standard.vertex is True
    assert cfg_standard.project == "test-project"
    assert cfg_standard.location == "us-central1"
    assert cfg_standard.capabilities.agent_behavior == AgentBehavior.INTERACTIVE

    # Express Mode com chave
    cfg_express = bridge.build_vertex_config(express_api_key="express-key-123")
    assert isinstance(cfg_express, LocalAgentConfig)
    assert cfg_express.vertex is True
    assert cfg_express.api_key == "express-key-123"


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


def test_audit_ecosystem() -> None:
    """Verifica o payload completo gerado pelo auditor do ecossistema."""
    audit = AntigravityAgentBridge.audit_ecosystem()
    assert "sdk" in audit
    assert "cli" in audit
    assert "skills" in audit
    assert "mcp" in audit
    assert "auth" in audit

    assert audit["sdk"]["package"] == "google-antigravity"
    assert audit["sdk"]["localharness_exists"] is True
    assert audit["skills"]["discovered_directories_count"] >= 2
    assert audit["mcp"]["bridged_servers_count"] > 0
    assert audit["auth"]["GEMINI_API_KEY"] is True


def test_find_agy_cli() -> None:
    """Verifica localizacao do executavel agy."""
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
    assert "localharness.exe" in result.stdout


def test_nexus_cli_antigravity_status_json() -> None:
    """Verifica execucao do comando nexus antigravity status --json."""
    runner = CliRunner()
    result = runner.invoke(app, ["antigravity", "status", "--json"])
    assert result.exit_code == 0
    parsed = json.loads(result.stdout)
    assert parsed["sdk"]["package"] == "google-antigravity"
    assert parsed["sdk"]["localharness_exists"] is True


def test_nexus_cli_antigravity_skills() -> None:
    """Verifica execucao do comando nexus antigravity skills."""
    runner = CliRunner()
    result = runner.invoke(app, ["antigravity", "skills"])
    assert result.exit_code == 0
    assert "ANTIGRAVITY SDK: SKILLS DESCOBERTAS" in result.stdout
