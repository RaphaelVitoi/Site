"""Guards for intent-based MCP addon selection."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from agents.context_builder import _inject_mcp_addons
from core.mcp_routing import apply_mcp_addon_routing, resolve_mcp_addons
from core.schemas import Task


def _task(description: str, metadata: dict | None = None) -> Task:
    return Task(
        id="MCP-TEST",
        description=description,
        agent="@planner",
        timestamp=datetime.now(UTC).isoformat(),
        metadata=metadata or {},
    )


@pytest.mark.unit
def test_addons_desejados_estao_habilitados_em_modo_lazy() -> None:
    import core.config as config

    policy = config.MCP_ADDON_ROUTING
    assert policy["enabled"] is True
    assert policy["mode"] == "lazy"
    assert set(policy["addons"]) == {
        "sequential-thinking",
        "mcp-server-neon",
        "firebase-mcp-server",
    }


@pytest.mark.parametrize(
    ("description", "expected"),
    [
        ("Planejar arquitetura complexa com raciocinio e tradeoffs", ["sequential-thinking"]),
        ("Inspecionar schema e tuning de Postgres no Neon", ["mcp-server-neon"]),
        ("Revisar security rules do Firestore e Firebase Auth", ["firebase-mcp-server"]),
        ("Consultar SQLite local e ChromaDB", []),
    ],
)
@pytest.mark.unit
def test_selecao_por_intencao_e_exclusao_de_contexto_local(description: str, expected: list[str]) -> None:
    decision = resolve_mcp_addons(description)
    assert list(decision.selected) == expected


@pytest.mark.unit
def test_pedido_explicito_supera_bloqueio_de_contexto() -> None:
    decision = resolve_mcp_addons(
        "Comparar a migracao do SQLite para um branch", {"mcp_addons": ["mcp-server-neon"]}
    )
    assert list(decision.selected) == ["mcp-server-neon"]
    assert "mcp-server-neon" in decision.explicit


@pytest.mark.unit
def test_tarefa_longa_recebe_sequential_thinking_mesmo_sem_termo_especialista() -> None:
    decision = resolve_mcp_addons("palavra " * 80)
    assert "sequential-thinking" in decision.selected
    assert "mcp_auto:sequential-thinking:long_task" in decision.reason_codes


@pytest.mark.unit
def test_recalculo_remove_decisao_mcp_obsoleta_da_subtask() -> None:
    metadata = {
        "mcp_addons_selected": ["mcp-server-neon"],
        "mcp_addon_scores": {"mcp-server-neon": 10},
        "mcp_addon_reason_codes": ["mcp_auto:mcp-server-neon:score_10"],
        "mcp_addon_policy": "lazy",
    }
    routed = apply_mcp_addon_routing("Consultar SQLite local", metadata)
    assert routed["mcp_addons_selected"] == []
    assert routed["mcp_addon_scores"] == {}


@pytest.mark.unit
def test_prompt_so_injeta_addon_selecionado() -> None:
    prompt = _inject_mcp_addons(_task("Inspecionar Firestore e as security rules do Firebase"))
    assert "firebase-mcp-server" in prompt
    assert "firebase_get" not in prompt  # nao inventa nomes de ferramentas no prompt generico
    assert "ferramenta estiver registrada" in prompt

    local_prompt = _inject_mcp_addons(_task("Consultar SQLite local"))
    assert local_prompt == ""
