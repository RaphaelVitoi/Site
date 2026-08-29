"""Testes da politica de roteamento economico e especializado.

Travam a ESTRATEGIA definida pelo operador, nao os dados do estudo. Cada
assercao corresponde a uma regra que, se revertida, degradaria o sistema em
silencio.
"""
# pylint: disable=protected-access

from __future__ import annotations

import json
import logging
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
    ForaDaAutoridadeDaPolitica,
    Origem,
    TierAgente,
    avaliar_uso_condicional_pro,
    cobertura,
    custo,
    decidir,
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
    """SubagentTier vem de core/subagents_mesh.py, e cada tier precisa ter a
    CLASSE de tarefa declarada -- classificacao, nao atribuicao de modelo. O
    modelo vem de SUBAGENT_MODEL_MAP; ver
    test_a_politica_nao_atribui_modelo_a_subagente."""
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


def test_a_politica_nao_atribui_modelo_a_subagente():
    """Decisao do operador em 2026-08-28: **subagente e sempre custo zero**, e a
    autoridade e `core.subagents_mesh.SUBAGENT_MODEL_MAP`.

    Antes daqui saia `e_local(rotear("math_verifier_sota"))` -- e passava, mas
    por coincidencia: a classe LOCAL desse tier era a unica das treze a cair
    numa rota local. Os outros doze recebiam nuvem paga, e ninguem media.
    Agora pedir modelo a um tier levanta, em vez de devolver alias que ninguem
    deveria usar."""
    so_tier = sorted(set(SUBAGENTES) - set(AGENTES))
    assert so_tier, "sem tier exclusivo nao ha o que este teste guarde"
    for alvo in so_tier:
        with pytest.raises(ForaDaAutoridadeDaPolitica):
            rotear(alvo)
        with pytest.raises(ForaDaAutoridadeDaPolitica):
            decidir(alvo)


def test_o_modelo_de_todo_subagente_tem_custo_zero():
    """O invariante do operador, travado onde a autoridade de fato mora.

    Nao ha copia da tabela aqui: o teste le `SUBAGENT_MODEL_MAP` e exige que
    cada modelo esteja na frota local declarada em data/ollama_models.json."""
    from core.subagents_mesh import SUBAGENT_MODEL_MAP  # noqa: PLC0415

    fora = sorted({m for m in SUBAGENT_MODEL_MAP.values() if not e_local(m)})
    assert not fora, (
        f"subagente com modelo fora da frota local: {fora}. O invariante do "
        "operador e custo zero -- se isto mudou, foi decisao, e ela precisa "
        "estar no registro antes do teste."
    )
    assert all(custo(m, 10_000, 2_000) == 0.0 for m in SUBAGENT_MODEL_MAP.values())


def test_nome_que_e_agente_e_tier_resolve_como_agente():
    """`implementor`, `curator`, `architect` e `validador` existem nas duas
    familias. A precedencia de `_classe_de` sempre foi AGENTES primeiro, e a
    recusa acima nao pode ter mudado isso."""
    ambos = sorted(set(SUBAGENTES) & set(AGENTES))
    assert ambos, "a sobreposicao sumiu; releia a recusa em decidir()"
    for alvo in ambos:
        assert rotear(alvo) == ROTAS[AGENTES[alvo][1]].primario


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

    Este teste guarda a metade de cima -- que `core.config` RESOLVE o mapa. A
    frase 'entao o comportamento em execucao mudou', que estava aqui, nao se
    sustenta: medido em 2026-08-28, o caminho quente le `primary_model` do
    manifesto e os 19 agentes divergem, 19 de 19. Resolver o mapa e uma coisa;
    alguem le-lo e outra. A metade que faltava esta em
    `tests/test_frente4_autoridade_de_roteamento.py`."""
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


#  Procedencia da decisao: degradacao tem que ser VISIVEL no ponto de uso


def test_decidir_marca_o_primario():
    d = decidir("implementor")
    assert d.modelo == "claude-sonnet-5"
    assert d.origem is Origem.PRIMARIO
    assert d.classe is ClasseTarefa.CONSTRUCAO
    assert not d.degradado


def test_decidir_marca_o_escalonamento_atendido():
    d = decidir("implementor", escalado=True)
    assert d.modelo == "claude-opus-5"
    assert d.origem is Origem.ESCALADO
    assert not d.degradado, "escalonamento ATENDIDO nao e degradacao"


def test_escalonar_classe_sem_degrau_e_degradacao_declarada():
    """O defeito que motivou `Decisao`.

    `rotear('chico', escalado=True)` devolvia 'claude-opus-5'  que E o primario
    da governanca. O chamador julgou a tarefa alem do primario, recebeu o
    primario, e o valor de retorno era byte a byte identico ao do caso normal.
    Silencio indistinguivel de sucesso.
    """
    for alvo, classe in (("chico", ClasseTarefa.GOVERNANCA), ("planner", ClasseTarefa.RACIOCINIO_PROFUNDO)):
        d = decidir(alvo, escalado=True)
        assert d.origem is Origem.ESCALONAMENTO_INDISPONIVEL
        assert d.modelo == ROTAS[classe].primario
        assert d.degradado, "pedir degrau acima e nao ter e degradacao relativa ao pedido"
        assert "nao declara" in d.motivo


def test_fallback_tem_caminho_de_execucao():
    """`Rota.fallback` ficou declarado sem consumidor no caminho de decisao.

    Degradacao escrita na tabela e inalcancavel em execucao e o mesmo defeito
    de `$warnings` no cwv_gate: o estado existe no papel e nao no fluxo.
    """
    d = decidir("implementor", primario_indisponivel=True)
    assert d.modelo == ROTAS[ClasseTarefa.CONSTRUCAO].fallback
    assert d.origem is Origem.FALLBACK
    assert d.degradado


def test_toda_classe_alcanca_seu_fallback():
    """Sem isto, uma classe poderia ganhar fallback orfao de novo sem ninguem ver."""
    for alvo, (_, classe) in AGENTES.items():
        d = decidir(alvo, primario_indisponivel=True)
        assert d.modelo == ROTAS[classe].fallback, alvo
        assert d.degradado, alvo


def test_complexidade_vence_alcance_quando_os_dois_sinais_chegam():
    """`escalado` e `primario_indisponivel` respondem perguntas diferentes.

    Se ha degrau acima, o primario nao vai ser usado  logo a disponibilidade
    dele e irrelevante. Travado porque a ordem inversa mandaria a tarefa
    complexa para o fallback, que e o degrau ABAIXO.
    """
    d = decidir("implementor", escalado=True, primario_indisponivel=True)
    assert d.modelo == ROTAS[ClasseTarefa.CONSTRUCAO].escalona_para
    assert d.origem is Origem.ESCALADO


def test_rotear_e_decidir_nunca_divergem():
    """`rotear` e vista com perda de `decidir`, nao uma segunda implementacao.

    Duas logicas de decisao paralelas divergiriam em silencio. Este teste e o
    que impede que voltem a existir.
    """
    # So agentes: desde 2026-08-28 a politica nao atribui modelo a subagente, e
    # os dois caminhos levantam juntos -- coberto por
    # test_a_politica_nao_atribui_modelo_a_subagente.
    for alvo in AGENTES:
        for escalado in (False, True):
            assert rotear(alvo, escalado=escalado) == decidir(alvo, escalado=escalado).modelo, alvo


def test_rotear_preserva_o_contrato_de_str_para_core_config():
    """core.config._resolver_modelos so precisa do alias; o tipo nao pode mudar."""
    for alvo in AGENTES:
        assert isinstance(rotear(alvo), str)


def test_rotear_registra_o_escalonamento_que_nao_aconteceu(caplog):
    """O unico caso em que descartar a procedencia esconde algo relevante.

    `rotear` continua devolvendo `str` por compatibilidade, entao o aviso e o
    que impede o descarte de ser mudo.
    """
    with caplog.at_level(logging.WARNING, logger="llm.routing_policy"):
        assert rotear("chico", escalado=True) == "claude-opus-5"
    # getMessage() e o que interpola: o logger usa %-lazy, entao ate aqui o
    # texto final nao existe  so `msg` com placeholders e `args` separados.
    assert any("nao declara escalona_para" in r.getMessage() for r in caplog.records)

    caplog.clear()
    with caplog.at_level(logging.WARNING, logger="llm.routing_policy"):
        rotear("implementor", escalado=True)
    assert not caplog.records, "escalonamento atendido nao deve gerar ruido"
