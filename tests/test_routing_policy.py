"""Testes da politica de roteamento economico e especializado.

Travam a ESTRATEGIA do estudo de fronteira, nao seus dados. O ponto central:
o manifesto declarava `model_preference` para 18 agentes e entregava o mesmo
modelo a todos. Se isso voltar, estes testes quebram.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from llm.model_registry import MODEL_REGISTRY
from llm.routing_policy import (
    AGENTES,
    ROTAS,
    ClasseTarefa,
    TierAgente,
    economia_do_escalonamento,
    estimar_roi,
    plano_de_ferramentas,
    rota_de,
    rotear,
)

MANIFESTO = Path(__file__).resolve().parents[1] / "data" / "agents_manifest.json"


# ── Coerencia com o manifesto real ───────────────────────────────────────────

def test_todo_agente_do_mapa_existe_no_manifesto():
    """Nomes conferidos contra o manifesto, nao inventados."""
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    ausentes = sorted(set(AGENTES) - set(manifesto))
    assert not ausentes, f"agentes fora do manifesto: {ausentes}"


def test_todo_modelo_roteado_existe_no_registro():
    for rota in ROTAS.values():
        assert rota.primario in MODEL_REGISTRY
        assert rota.fallback in MODEL_REGISTRY
        if rota.escalona_para:
            assert rota.escalona_para in MODEL_REGISTRY


def test_agente_desconhecido_da_erro_util():
    with pytest.raises(KeyError, match="fora do manifesto"):
        rotear("agente-fantasma")


# ── A correcao central: preferencia deixa de ser decorativa ──────────────────

def test_agentes_nao_recebem_todos_o_mesmo_modelo():
    """Estado anterior: os 18 apontavam para gemini-3.5-flash-lite."""
    modelos = {rotear(a) for a in AGENTES}
    assert len(modelos) >= 3, f"roteamento colapsou para {modelos}"


def test_governanca_e_triagem_divergem():
    assert rotear("chico") != rotear("dispatcher")


def test_tier1_nao_recebe_modelo_de_triagem():
    caro = rotear("chico")
    barato = rotear("dispatcher")
    assert MODEL_REGISTRY[caro].price_per_1m_out > MODEL_REGISTRY[barato].price_per_1m_out


# ── Assimetria de capacidade ─────────────────────────────────────────────────

def test_codigo_e_raciocinio_usam_provedores_diferentes():
    """A tese do estudo: quem lidera raciocinio nao lidera refatoracao longa."""
    r_codigo = ROTAS[ClasseTarefa.CODIGO_LONGO_HORIZONTE].primario
    r_raciocinio = ROTAS[ClasseTarefa.RACIOCINIO_PROFUNDO].primario
    assert MODEL_REGISTRY[r_codigo].adapter != MODEL_REGISTRY[r_raciocinio].adapter


def test_implementor_vai_para_familia_claude():
    assert rotear("implementor").startswith("claude-")


def test_sessao_multi_dia_usa_fable():
    assert ROTAS[ClasseTarefa.SESSAO_MULTI_DIA].primario == "claude-fable-5"


# ── Escalonamento ────────────────────────────────────────────────────────────

def test_escalonamento_sobe_de_degrau():
    assert rotear("dispatcher", escalado=True) != rotear("dispatcher")


def test_classes_caras_nao_escalonam():
    """Nao ha degrau acima do topo — escalar seria ilusao de opcao."""
    for classe in (ClasseTarefa.RACIOCINIO_PROFUNDO, ClasseTarefa.SESSAO_MULTI_DIA):
        assert ROTAS[classe].escalona_para is None


def test_escalonamento_raro_economiza_muito():
    r = economia_do_escalonamento(
        ClasseTarefa.TRIAGEM, chamadas=1000, tokens_in=20_000, tokens_out=2_000,
        fracao_escalada=0.05,
    )
    assert r["economia_pct"] > 50
    assert r["vale_a_pena"]


def test_escalonamento_constante_deixa_de_compensar():
    """Se quase tudo escala, o executor barato so adiciona custo."""
    r = economia_do_escalonamento(
        ClasseTarefa.TRIAGEM, chamadas=1000, tokens_in=20_000, tokens_out=2_000,
        fracao_escalada=0.99,
    )
    assert not r["vale_a_pena"]


# ── ROI ──────────────────────────────────────────────────────────────────────

def test_roi_penaliza_tokens_de_raciocinio():
    """Ignorar o raciocinio superestima o ROI — o parametro e explicito."""
    base = dict(taxa_sucesso=0.8, tokens_in=10_000, tokens_out=2_000, latencia_s=5.0)
    ingenuo = estimar_roi("claude-opus-5", **base, multiplicador_raciocinio=1.0)
    realista = estimar_roi("claude-opus-5", **base, multiplicador_raciocinio=4.0)
    assert realista < ingenuo


def test_roi_rejeita_entrada_invalida():
    with pytest.raises(ValueError, match="taxa_sucesso"):
        estimar_roi("claude-opus-5", taxa_sucesso=1.5, tokens_in=1, tokens_out=1, latencia_s=1)
    with pytest.raises(ValueError, match="latencia_s"):
        estimar_roi("claude-opus-5", taxa_sucesso=0.5, tokens_in=1, tokens_out=1, latencia_s=0)


# ── Pruning de ferramentas ───────────────────────────────────────────────────

def test_conjunto_pequeno_nao_e_podado():
    fer = [{"name": f"t{i}"} for i in range(4)]
    assert plano_de_ferramentas(fer, relevantes=set()) == fer


def test_irrelevantes_sao_diferidas():
    fer = [{"name": f"t{i}"} for i in range(12)]
    plano = plano_de_ferramentas(fer, relevantes={"t3"})
    carregadas = [f for f in plano if not f.get("defer_loading")]
    assert len(carregadas) == 1
    assert carregadas[0]["name"] == "t3"


def test_ferramenta_de_busca_nunca_e_diferida():
    """Diferir a busca retorna 400 na API."""
    fer = [{"name": f"t{i}"} for i in range(12)]
    fer.append({"type": "tool_search_tool_regex_20251119", "name": "busca"})
    plano = plano_de_ferramentas(fer, relevantes=set())
    busca = next(f for f in plano if f["name"] == "busca")
    assert not busca.get("defer_loading")


def test_nunca_difere_todas():
    """Ao menos uma ferramenta precisa ficar carregada, ou a API rejeita."""
    fer = [{"name": f"t{i}"} for i in range(12)]
    plano = plano_de_ferramentas(fer, relevantes=set())
    assert any(not f.get("defer_loading") for f in plano)


def test_tier_enum_cobre_a_hierarquia():
    tiers = {AGENTES[a][0] for a in AGENTES}
    assert TierAgente.GOVERNANCA in tiers
    assert TierAgente.EXECUCAO in tiers
    assert rota_de("chico").primario
