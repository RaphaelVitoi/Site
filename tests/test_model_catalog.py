"""Guarda do catalogo unico de composicao da piramide de tiers.

Medido em 2026-11-17 (Fase 4 da auditoria SOTA): o inventario de modelos
estava replicado em prosa dentro do CLAUDE.md secao 0 -- quinta copia de dados
que ja viviam em `agent_identities.json`, `model_registry.py`,
`ollama_models.json`, `agents_manifest.json` e `system_config.json`. Copia de
tabela diverge por padrao; este guard reprova na suite em vez de deixar a
divergencia passar silenciosa.

`data/model_catalog.json` responde "o que compoe cada tier" (membros, status,
ponteiro para a fonte de detalhe). Estes testes conferem que ele nao mente
contra as fontes verificaveis -- mesmo padrao dos guards de governanca.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "data" / "model_catalog.json"
CLAUDE = RAIZ / "CLAUDE.md"
IDENTIDADES = RAIZ / "data" / "agent_identities.json"
OLLAMA = RAIZ / "data" / "ollama_models.json"


def _ler_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8-sig"))


@pytest.fixture(scope="module")
def catalogo() -> dict:
    return _ler_json(CATALOGO)


@pytest.fixture(scope="module")
def membros_por_tier(catalogo: dict) -> dict[str, list[dict]]:
    return {t: v.get("membros", []) for t, v in catalogo["tiers"].items()}


@pytest.mark.unit
def test_catalogo_tem_tiers_0_a_7(catalogo: dict) -> None:
    assert set(catalogo["tiers"]) == {str(i) for i in range(8)}, (
        "a piramide canonica tem 8 tiers (0 soberano -> 7 barramento); tier faltando ou extra indica drift do catalogo"
    )


@pytest.mark.unit
def test_claude_md_aponta_para_o_catalogo() -> None:
    """O canonico declara papeis e regras; a lista mora no catalogo."""
    assert "data/model_catalog.json" in CLAUDE.read_text(encoding="utf-8-sig"), (
        "CLAUDE.md secao 0 perdeu o ponteiro para data/model_catalog.json -- sem ele o roster fica sem fonte declarada"
    )


@pytest.mark.unit
def test_toda_identidade_canonica_esta_no_tier_certo(membros_por_tier: dict[str, list[dict]]) -> None:
    """Cada identidade que assina commit (agent_identities.json) aparece no
    catalogo no mesmo tier declarado -- o tier e conferido pelo commit-msg."""
    identidades = _ler_json(IDENTIDADES)["canonicas"]
    faltando = []
    for ident in identidades:
        tier = ident["tier"]
        achou = any(
            m.get("identidade") == ident["nome"]
            or (ident.get("modelo") != "indeterminado" and m.get("modelo") == ident.get("modelo"))
            for m in membros_por_tier.get(tier, [])
        )
        if not achou:
            faltando.append(f"{ident['nome']} [tier {tier}]")
    assert not faltando, f"identidades canonicas ausentes do tier declarado no catalogo: {faltando}"


@pytest.mark.unit
def test_membros_ollama_existem_no_inventario(membros_por_tier: dict[str, list[dict]]) -> None:
    """Todo membro local-ollama do catalogo existe como tag ou alias medido
    em data/ollama_models.json -- tag nao inventariada e drift (caso real:
    gemma4:12b-unified-it, citada no CLAUDE.md antigo sem constar do
    inventario Ollama)."""
    ollama = _ler_json(OLLAMA)["models"]
    tags_ou_aliases = {m["tag"] for m in ollama} | {m["alias"] for m in ollama}
    faltando = []
    for tk, membros in membros_por_tier.items():
        for m in membros:
            if m.get("tipo") == "local-ollama" and m["nome"] not in tags_ou_aliases:
                faltando.append(f"tier {tk}: {m['nome']}")
    assert not faltando, f"membros local-ollama sem lastro no inventario Ollama: {faltando}"


@pytest.mark.unit
def test_modelos_api_existem_no_registry_e_estao_autorizados(membros_por_tier: dict[str, list[dict]]) -> None:
    """Membro fronteira-api com status vigente/fallback precisa resolver em
    MODEL_REGISTRY com autorizado=True -- modelo retirado nao pode constar
    como vigente (a politica de descontinuacao do CLAUDE.md secao 0)."""
    from llm.model_registry import MODEL_REGISTRY

    problemas = []
    for tk, membros in membros_por_tier.items():
        for m in membros:
            if m.get("tipo") != "fronteira-api":
                continue
            alias = m.get("modelo")
            if alias not in MODEL_REGISTRY:
                problemas.append(f"tier {tk}: {m['nome']} modelo '{alias}' fora do MODEL_REGISTRY")
                continue
            if m.get("status") in {"vigente", "fallback"} and not MODEL_REGISTRY[alias].autorizado:
                problemas.append(
                    f"tier {tk}: {m['nome']} ({alias}) marcado {m['status']} mas autorizado=False no registry"
                )
    assert not problemas, "; ".join(problemas)


@pytest.mark.unit
def test_fontes_detalhe_apontam_para_caminhos_vivos(catalogo: dict) -> None:
    """Cada 'fonte' de membro e cada entrada de _fontes_detalhe que parece
    caminho precisa existir -- ponteiro morto em catalogo de governanca e
    o defeito que a SS7 do CLAUDE.md proibe."""
    caminhos = set(catalogo.get("_fontes_detalhe", {}).values())
    for t in catalogo["tiers"].values():
        for m in t.get("membros", []):
            fonte = m.get("fonte", "")
            if "/" in fonte or fonte.endswith((".py", ".json", ".md")):
                caminhos.add(fonte.split(" (")[0].split(" \u2014 ")[0].strip())
    caminhos.add("llm/model_registry.py")  # aposentados.fonte
    mortos = [c for c in caminhos if c and not (RAIZ / c).exists()]
    assert not mortos, f"catalogo aponta para fontes inexistentes: {sorted(mortos)}"
