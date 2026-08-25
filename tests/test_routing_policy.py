"""Testes da politica de roteamento economico e especializado.

Travam a ESTRATEGIA definida pelo operador, nao os dados do estudo. Cada
assercao corresponde a uma regra que, se revertida, degradaria o sistema em
silencio.
"""
# pylint: disable=protected-access

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

import core.config as cfg
from llm.model_registry import MODEL_REGISTRY
from llm.routing_policy import (
    AGENTES,
    CONFLITOS_MANIFESTO,
    MODELOS_LOCAIS,
    PRECEDENCIA_FAIXA,
    ROTAS,
    SUBAGENTES,
    ClasseTarefa,
    Faixa,
    TierAgente,
    avaliar_uso_condicional_pro,
    cobertura,
    custo,
    e_local,
    economia_do_escalonamento,
    estimar_roi,
    ordem_de_consumo,
    plano_de_ferramentas,
    rota_de,
    rotear,
    timeout_recomendado,
)

RAIZ = Path(__file__).resolve().parents[1]
MANIFESTO = RAIZ / "data" / "agents_manifest.json"
MESH = RAIZ / "core" / "subagents_mesh.py"


#  Cobertura: o defeito que deixou o gemma4 de fora


def test_cobertura_bidirecional_com_o_manifesto():
    """A versao anterior so checava mapa  manifesto e passou faltando o gemma4.

    Agora checa os DOIS sentidos: nenhum agente do manifesto pode ficar sem
    rota, e nenhuma rota pode apontar para agente inexistente.
    """
    manifesto = set(json.loads(MANIFESTO.read_text(encoding="utf-8")))
    mapeados = set(AGENTES)
    assert not (manifesto - mapeados), f"agentes SEM rota: {sorted(manifesto - mapeados)}"
    assert not (mapeados - manifesto), f"rotas orfas: {sorted(mapeados - manifesto)}"


def test_sao_dezenove_agentes():
    assert cobertura()["agentes"] == 19
    assert "gemma4" in AGENTES


def test_todo_nivel_de_subagente_do_mesh_tem_rota():
    """SubagentTier vem de core/subagents_mesh.py; sem rota propria, um
    varredor de seguranca herdaria o modelo de triagem do pai."""
    fonte = MESH.read_text(encoding="utf-8")
    niveis = set(re.findall(r'^\s+[A-Z]+ = "([a-z_]+)"', fonte, re.M))
    assert niveis, "nao consegui extrair SubagentTier do mesh"
    faltando = niveis - set(SUBAGENTES)
    assert not faltando, f"subagentes sem rota: {sorted(faltando)}"


def test_alvo_desconhecido_lista_as_duas_familias():
    with pytest.raises(KeyError, match="nao e agente nem subagente"):
        rotear("entidade-fantasma")


def test_todo_modelo_roteado_existe_em_algum_registro():
    for classe, rota in ROTAS.items():
        for alias in filter(None, (rota.primario, rota.fallback, rota.escalona_para)):
            assert alias in MODEL_REGISTRY or alias in MODELOS_LOCAIS, f"{classe}: {alias}"


#  A regra central: faixa antes de preco unitario


def test_operacional_usa_faixa_gratuita_e_nao_o_menor_preco():
    """Regressao guardada: uma versao anterior roteava operacional para
    gpt-5.6-luna por ter o menor $/token, ignorando que gemini-3.7-flash tem
    cota gratuita. Custo marginal zero vence barato."""
    rota = ROTAS[ClasseTarefa.OPERACIONAL]
    assert rota.faixa is Faixa.GRATUITA
    assert rota.primario == "gemini-3.7-flash"
    luna = MODEL_REGISTRY["gpt-5.6-luna"]
    flash = MODEL_REGISTRY["gemini-3.7-flash"]
    assert luna.price_per_1m_in < flash.price_per_1m_in  # a Luna E mais barata...
    assert rota.primario != "gpt-5.6-luna"  # ...e ainda assim nao e primaria
    assert rota.fallback == "gpt-5.6-luna"  # fica como fallback pago


def test_ordem_de_consumo_respeita_a_economia_generalizada():
    ordem = [faixa for faixa, _ in ordem_de_consumo()]
    valores = [PRECEDENCIA_FAIXA[f] for f in ordem]
    assert valores == sorted(valores)
    assert ordem[0] is Faixa.LOCAL


#  Tabela do operador


@pytest.mark.parametrize(
    ("agente", "primario", "fallback"),
    [
        ("chico", "claude-opus-5", "gpt-5.6-sol"),
        ("maverick", "gpt-5.6-sol", "claude-opus-5"),
        ("architect", "claude-sonnet-5", "gemini-3.7-flash"),
        ("implementor", "claude-sonnet-5", "gemini-3.7-flash"),
        ("auditor", "gemini-3.7-flash", "gpt-5.6-terra"),
        ("verifier", "gemini-3.7-flash", "gpt-5.6-terra"),
        ("securitychief", "gemini-3.7-flash", "gpt-5.6-terra"),
        ("dispatcher", "gemini-3.7-flash", "gpt-5.6-luna"),
        ("organizador", "gemini-3.7-flash", "gpt-5.6-luna"),
        ("historian", "gemini-3.7-flash", "gpt-5.6-luna"),
    ],
)
def test_tabela_do_operador(agente, primario, fallback):
    r = rota_de(agente)
    assert r.primario == primario
    assert r.fallback == fallback


def test_governanca_e_estrategia_sao_espelhadas():
    """Chico decide com consciencia de codigo; Maverick analisa risco puro."""
    g, e = rota_de("chico"), rota_de("maverick")
    assert g.primario == e.fallback
    assert e.primario == g.fallback


def test_conflitos_com_o_manifesto_estao_declarados():
    """implementor e historian divergem entre tabela e manifesto. A divergencia
    deve ficar visivel, nao sumir numa escolha silenciosa."""
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    assert manifesto["implementor"]["model_preference"] == "fast_operations"
    assert AGENTES["implementor"][1] is ClasseTarefa.CONSTRUCAO
    assert "implementor" in CONFLITOS_MANIFESTO
    assert manifesto["historian"]["model_preference"] == "deep_thinking"
    assert AGENTES["historian"][1] is ClasseTarefa.OPERACIONAL
    assert "historian" in CONFLITOS_MANIFESTO


#  Faixa local


def test_gemma4_fica_na_faixa_local():
    r = rota_de("gemma4")
    assert r.faixa is Faixa.LOCAL
    assert e_local(r.primario)
    assert custo(r.primario, 10_000_000, 1_000_000) == 0.0


def test_modelo_local_nao_quebra_a_matematica_de_economia():
    r = economia_do_escalonamento(
        ClasseTarefa.LOCAL,
        chamadas=100,
        tokens_in=1000,
        tokens_out=100,
        fracao_escalada=0.1,
    )
    assert r["custo_escalonado"] >= 0
    assert r["vale_a_pena"]


def test_math_verifier_usa_a_frota_local():
    """routing.py ja prioriza gemma-4-31b no dominio MATH; a politica concorda."""
    assert e_local(rotear("math_verifier_sota"))


#  Assimetria e escalonamento


def test_construcao_e_estrategia_usam_provedores_diferentes():
    c = MODEL_REGISTRY[ROTAS[ClasseTarefa.CONSTRUCAO].primario]
    e = MODEL_REGISTRY[ROTAS[ClasseTarefa.ESTRATEGIA].primario]
    assert c.adapter != e.adapter


def test_construcao_escalona_de_sonnet_para_opus():
    assert rotear("implementor") == "claude-sonnet-5"
    assert rotear("implementor", escalado=True) == "claude-opus-5"


def test_topo_nao_escalona():
    for classe in (
        ClasseTarefa.GOVERNANCA,
        ClasseTarefa.ESTRATEGIA,
        ClasseTarefa.RACIOCINIO_PROFUNDO,
        ClasseTarefa.SESSAO_MULTI_DIA,
    ):
        assert ROTAS[classe].escalona_para is None


def test_escalonamento_raro_economiza():
    r = economia_do_escalonamento(
        ClasseTarefa.VERIFICACAO,
        chamadas=1000,
        tokens_in=20_000,
        tokens_out=2_000,
        fracao_escalada=0.05,
    )
    assert r["economia_pct"] > 50
    assert r["vale_a_pena"]


def test_escalonamento_constante_deixa_de_compensar():
    r = economia_do_escalonamento(
        ClasseTarefa.VERIFICACAO,
        chamadas=1000,
        tokens_in=20_000,
        tokens_out=2_000,
        fracao_escalada=0.999,
    )
    assert not r["vale_a_pena"]


#  Timeout para raciocinio estendido


def test_timeout_cresce_com_o_esforco():
    """Recomendacao 3 do estudo: socket fechado no meio descarta trabalho pago."""
    profundo = timeout_recomendado("claude-opus-5", max_tokens=64_000)
    raso = timeout_recomendado("gemini-3.7-flash", max_tokens=8_000)
    assert profundo > raso
    assert raso >= 600


#  ROI


def test_roi_penaliza_tokens_de_raciocinio():
    assert estimar_roi(
        "claude-opus-5",
        taxa_sucesso=0.8,
        tokens_in=10_000,
        tokens_out=2_000,
        latencia_s=5.0,
        multiplicador_raciocinio=4.0,
    ) < estimar_roi(
        "claude-opus-5",
        taxa_sucesso=0.8,
        tokens_in=10_000,
        tokens_out=2_000,
        latencia_s=5.0,
        multiplicador_raciocinio=1.0,
    )


def test_roi_rejeita_entrada_invalida():
    with pytest.raises(ValueError, match="taxa_sucesso"):
        estimar_roi("claude-opus-5", taxa_sucesso=1.5, tokens_in=1, tokens_out=1, latencia_s=1)
    with pytest.raises(ValueError, match="latencia_s"):
        estimar_roi("claude-opus-5", taxa_sucesso=0.5, tokens_in=1, tokens_out=1, latencia_s=0)


#  Pruning de ferramentas


def test_conjunto_pequeno_nao_e_podado():
    fer = [{"name": f"t{i}"} for i in range(4)]
    assert plano_de_ferramentas(fer, relevantes=set()) == fer


def test_irrelevantes_sao_diferidas():
    fer = [{"name": f"t{i}"} for i in range(12)]
    carregadas = [f for f in plano_de_ferramentas(fer, relevantes={"t3"}) if not f.get("defer_loading")]
    assert [f["name"] for f in carregadas] == ["t3"]


def test_ferramenta_de_busca_nunca_e_diferida():
    fer = [{"name": f"t{i}"} for i in range(12)]
    fer.append({"type": "tool_search_tool_regex_20251119", "name": "busca"})
    plano = plano_de_ferramentas(fer, relevantes=set())
    assert not next(f for f in plano if f["name"] == "busca").get("defer_loading")


def test_nunca_difere_todas():
    fer = [{"name": f"t{i}"} for i in range(12)]
    assert any(not f.get("defer_loading") for f in plano_de_ferramentas(fer, relevantes=set()))


#  Integracao: a politica precisa estar LIGADA, nao ser uma ilha


def test_core_config_expoe_modelo_concreto_por_agente():
    """Regressao guardada: a politica existiu por commits inteiros sem que
    nada a importasse, e o sistema seguia com todos os agentes no mesmo modelo.
    'Integrado' significa que o comportamento em execucao mudou."""
    mapa = cfg.AGENT_MODEL_MAP
    assert len(mapa) == 19, f"esperado 19 agentes resolvidos, veio {len(mapa)}"
    assert len(set(mapa.values())) >= 3, f"roteamento colapsou: {set(mapa.values())}"
    assert mapa["@chico"] == "claude-opus-5"
    assert mapa["@dispatcher"] == "gemini-3.7-flash"
    assert mapa["@gemma4"] == "gemma4:12b"


def test_nenhum_agente_fica_sem_modelo():
    sem = [a for a, m in cfg.AGENT_MODEL_MAP.items() if not m]
    assert not sem, f"agentes sem modelo: {sem}"


def test_resolucao_degrada_sem_derrubar_a_configuracao():
    """Se a politica sumir, cai para primary_model do manifesto em vez de
    quebrar o carregamento de configuracao do projeto inteiro."""
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    fallback = cfg._resolver_modelos({"inexistente_xyz": {"primary_model": "modelo-x"}})
    assert fallback["@inexistente_xyz"] == "modelo-x"
    assert set(cfg._resolver_modelos(manifesto)) == {f"@{n}" for n in manifesto}


def test_hierarquia_de_tiers_cobre_governanca_e_execucao():
    tiers = {spec[0] for spec in AGENTES.values()}
    assert TierAgente.GOVERNANCA in tiers
    assert TierAgente.ESTRATEGIA in tiers
    assert TierAgente.EXECUCAO in tiers


def test_avaliar_uso_condicional_pro():
    # 1. Tarefa de baixa complexidade ou ganho marginal -> Gemini 3.7 Flash
    res_flash = avaliar_uso_condicional_pro(
        complexidade_formal=False,
        ganho_qualidade_esperado_pct=10.0,
    )
    assert res_flash["modelo_escolhido"] == "gemini-3.7-flash"
    assert res_flash["aprovado_pro"] is False
    assert "Gemini 3.7 Flash supre a tarefa" in res_flash["motivo"]

    # 2. Tarefa de alta complexidade matematica e ganho expressivo -> Gemini 3.1 Pro
    res_pro = avaliar_uso_condicional_pro(
        complexidade_formal=True,
        ganho_qualidade_esperado_pct=40.0,
    )
    assert res_pro["modelo_escolhido"] == "gemini-3.1-pro"
    assert res_pro["aprovado_pro"] is True
    assert res_pro["beneficio_estimado_pct"] == 40.0
    assert "Alta complexidade matematica" in res_pro["motivo"]
