"""SOTA Routing module.
Responsible for heuristic routing, model scoring, and health gating.

Roteamento por ESPECIALIDADE, com economia e velocidade como eixos separados.
Ate 29/09/2026 o score era uma fila unica e plana (`_score_standard_preference`),
onde "mais barato" dominava tudo: `gemini-3.5-flash-lite` = -4 vencia `3.6` (-2),
`3.7` (-1) e `3.8` (sem ramo, caia em `flash` = 3). Medido: uma auditoria de
seguranca roteada para `@securitychief` (`deep_thinking`) saiu no `3.6` — nao
porque ele fosse o melhor para a tarefa, mas porque era o mais barato que ainda
constava da trilha.

Quatro eixos, nesta ordem de decisao:
1. DESIGNACAO — quem o manifesto nomeia, vence. Inegociavel.
2. ESPECIALIDADE — o modelo que serve a dimensao pedida (codigo, matematica,
  -portugues, raciocinio longo, triagem). E o eixo que faltava.
3. ECONOMIA — desempate por custo, so entre modelos igualmente capazes.
4. VELOCIDADE — desempate final por latencia esperada.
"""

# pylint: disable=protected-access
from datetime import UTC, datetime, timedelta
import logging
import sqlite3

import core.runtime as te
from core.schemas import Task
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

FREE_TIER_MARKER = ":free"

#: Eixo 1 — DESIGNACAO (Tier 1). Absoluta e inegociavel: e o Tier 1 nomeando o
#: modelo do agente. Nenhuma troca economica sobrepoe uma decisao do Tier 1.
_FAIXA_DESIGNACAO = -1000.0

#: Eixo 2 — FAIXA DE ESPECIALIDADE. O modelo especialista no dominio sempre
#: precede o modelo generico, blindando recursos nobres contra tarefas banais.
_FAIXA_ESPECIALIDADE = -100.0

#: Tier 1 fora da malha como AGENTE. Medido em 29/09/2026: `claude-sonnet-5`
#: entrou como head de `@implementor` (uma edicao de codigo delegavel) por via
#: de `_inject_openrouter_alternatives`, que roda DEPOIS do score e nao passa
#: por ele. Resultado: o modelo mais caro da frota executando o trabalho mais
#: simples, e o veredito de "quem faz o quê" virando consequencia de ordem de
#: chamadas em vez de politica.
#:
#: O Tier 1 e ORQUESTRADOR, e o topo da piramide: o que e mais critico e
#: complexo. Ele nao entra como agente customizado desta malha. Esta faixa o
#: mantem sempre abaixo de qualquer candidato nao-Tier1 em tarefa comum, mas
#: NAO o exclui quando `designated_model` o nomeia — decisao explicita do
#: manifesto sempre precede.
_FAIXA_TIER1_INDISPONIVEL = 1000.0

#: Modelos de Tier 1: orquestram, nao sao candidatos a executar tarefa comum.
#:
#: Medido em 29/09/2026: `_inject_openrouter_alternatives` empurrava `gpt-5.6-sol`
#: e `claude-sonnet-5` para dentro da trilha, e `@implementor` (uma edicao de
#: codigo) recebeu `claude-sonnet-5` como head. E o uso de um modelo de topo
#: para trabalho delegavel, e o jeito mais caro de nao fazer o trabalho.
#:
#: Tier 1 foca em orquestrar e no que e critico e complexo. Tarefa que OUTRO
#: modelo faz bem nao justifica o Tier 1 — e o criterio e "este modelo e o
#: melhor?", nao "o mais caro serve?".
MODELOS_TIER1 = (
    "claude-opus-5+",
    "claude-sonnet-5+",
    "gpt-5.6+",
    "gpt-6+",
    "fable",
    "gemini-3.8",
)

#: Recurso ESCASSO: modelo potente que e limitado (cota de cloud) e caro, e que
#: por isso so deve ser alocado onde rende.
#:
#: Nao e o mesmo que "modelo grande": `qwen2.5-coder:7b` tem portegrande e NAO
#: entra aqui, porque roda local e nao compete por cota de cloud. O criterio e
#: RECURSO LIMITADO E COMPARTILHADO, nao tamanho.
RECURSOS_ESCASSOS = ("31b", "120b", "glm", "kimi", "deepseek-v4", "nemotron")

#: Grau de especialidade a partir do qual o recurso escasso E o especialista da
#: dimensao, e portanto justifica o custo. Abaixo disso, ele e preservado.
#:
#: -6 e o topo de cada dimensao por construcao (`_especialidade` marca -6 no
#: melhor de cada uma). -4 marca o segundo colocado. A faixa entre -4 e -6 e a
#: zona em que o recurso escasso realmente paga a diferenca; abaixo, ha um
#: especialista mais barato que resolve.
_ESPECIALIDADE_MATERIAL = 4.0


def _e_tier1(m: str) -> bool:
    for marca in MODELOS_TIER1:
        base = marca[:-1] if marca.endswith("+") else marca
        if base in m or marca in m:
            return True
    return False


def _e_recurso_escasso(m: str) -> bool:
    return any(marca in m for marca in RECURSOS_ESCASSOS)


#: Economia vs Especialidade:
#: A economia sobrepoe quando o ganho dos outros e MARGINAL.
#: O modelo especialista sempre precede o modelo generico, blindando
#: recursos nobres contra tarefas banais sem prometer pesos inoperantes.

#: Quota estrutural que torna um modelo indisponivel para a frota.
#:
#: Medido em `key_usage_metrics` (326 registros, 2026-09-30) — a ORDEM real de
#: entrega, e nao uma estimativa:
#:   gemini-3.7-flash      1453 ms   n=35
#:   gemini-3.5-flash-lite 1843 ms   n=88
#:   gemini-3.6-flash      5113 ms   n=40
#: Ou seja: o 3.7 e MAIS RAPIDO que o 3.5-lite, e o 3.6 e 2.8x mais lento que
#: ambos. Minha tabela anterior assumia a ordem intuitiva (lite < 3.6 < 3.7) e
#: estava errada em dois dos tres.
#:
#: E o dado mais duro: os modelos `:free` sao os mais rapidos E os que mais
#: falham — `mistral-small:free` 46 ms com 38 erros em 38, `llama-3.1-8b:free`
#: 313 ms com 6 em 6, `deepseek-r1:free` 76 ms com 4 em 4. Cem por cento. Quota
#: inexistente nao e disponibilidade alta: e indisponibilidade que se apresenta
#: como resposta rapida. Por isso `:free` NAO leva cota alta aqui.
#:
#: 0.0 = cota esgotada (nao entra), 1.0 = folgado. Cota alta = quota folgada de
#: cloud, e nao "modelo maior serve mais".
COTA_DE_DISPONIBILIDADE: dict[str, float] = {
    "gemini-3.7-flash": 0.9,  # rapido E com cota folgada
    "gemini-3.5-flash-lite": 0.8,  # rapido, mas o mais disputado da frota
    "gemini-3.6-flash": 0.6,  # 5.1 s: o mais lento dos tres
    "gemma4:31b-cloud": 0.9,  # quota de cloud generosa
    "gpt-oss:120b-cloud": 0.8,  # quota de cloud generosa
    "glm": 0.85,  # quota de cloud generosa
    "qwen2.5-coder": 1.0,  # local: sem cota
    "ai9stars": 1.0,  # local llama.cpp
    "laguna": 0.8,  # free tier Hermes/OpenRouter
}


def _disponibilidade(m: str) -> float:
    """Disponibilidade efetiva na janela, em [0, 1]."""
    for marca, cota in COTA_DE_DISPONIBILIDADE.items():
        if marca in m:
            return cota
    return 0.9


def _velocidade(m: str) -> float:
    """Velocidade relativa esperada, em [0, 1]. Maior e mais rapido.

    ORDEM MEDIDA em `key_usage_metrics` (2026-09-30, 326 registros), nao
    estimada. A ordem intuitiva (lite < 3.6 < 3.7) estava ERRADA em dois dos
    tres: o 3.7 responde em 1453 ms e o 3.5-lite em 1843 ms — o "lite" nao e o
    mais rapido da familia. E o 3.6, que eu supunha no meio, e o mais lento
    (5113 ms, 2.8x o 3.7).
    """
    if "31b" in m or "120b" in m or "glm" in m:
        return 0.35  # cloud de parametro grande
    if "3.7" in m:
        return 0.9  # MEDIDO: o mais rapido da familia cloud
    if "flash-lite" in m or "lite" in m:
        return 0.8  # MEDIDO: 1843 ms, rapido mas nao o mais
    if "laguna-xs" in m or "xs" in m:
        return 0.85  # modelo ultraleve de agregacao
    if "laguna" in m:
        return 0.8
    if "coder" in m or "local" in m or "ai9stars" in m or "ling" in m or FREE_TIER_MARKER in m:
        return 0.75  # local: sem round-trip de rede
    if "3.8" in m:
        return 0.55
    if "3.6" in m:
        return 0.2  # MEDIDO: 5113 ms, o mais lento dos tres
    return 0.5


#: Dimensao pedida pela tarefa. O roteamento decide por DIMENSAO, e nao por
#: preco: `@implementor` pedindo edicao de codigo e uma tarefa diferente de
#: `@verifier` pedindo triagem, mesmo custando o mesmo.
DOMINIO_CODIGO = "CODE"
DOMINIO_MATH = "MATH"
DOMINIO_TRIAGEM = "TRIAGE"
DOMINIO_PORTUGUES = "PT"
DOMINIO_RAZONIO = "REASONING"
#: Curadoria: unificar estetica, memoria e coerencia entre arvores. Trabalho de
#: juizo longo sobre material heterogeneo, e nao de classificacao — dai um
#: modelo grande (31b cloud, 120b) em vez do mais barato que classifica bem.
DOMINIO_CURADORIA = "CURADORIA"
#: Inteligencia: fundamentar antes de executar. Fundacao, topologia e plano.
#: Diferente de `DOMINIO_RAZONIO` porque aqui o modelo precisa SEGURAR o plano
#: inteiro em contexto para nao produzir meia ideia — o gargalo e parametro e
#: coerencia de plano longo, nao velocidade de resposta.
DOMINIO_INTELIGENCIA = "INTELIGENCIA"


def _dominio_da_tarefa(task: Task | None) -> str | None:
    """Le o dominio declarado na tarefa. Ausente nao e palpite: e triagem."""
    if task is None:
        return None
    bruto = (task.metadata or {}).get("domain")
    if not bruto:
        return None
    return str(bruto).upper()


def _especialidade(m: str, domain: str | None) -> int:
    """Quanto o modelo serve a dimensao pedida. Menor vence.

    Ausencia de dominio nao pontua ninguem: sem dimensao declarada, a decisao
    cai no desempate economico de `_score_standard_preference`, que e o
    comportamento anterior. Trocar um ranking plano por um ranking errado seria
    trocar um defeito por outro.
    """
    if domain is None:
        return 0

    if domain == DOMINIO_CODIGO:
        # Codigo e edicao: o coder quantizado local e o especialista, e o
        # primeiro a ser tentado antes de gastar cloud.
        if "coder" in m:
            return -6
        if "qwen" in m:
            return -4
        if "laguna" in m:
            return -3
        if "flash" in m:
            return -2
        return 1

    if domain == DOMINIO_MATH:
        if "31b" in m or "gemma-4-31b" in m:
            return -5
        if "r1" in m or "reason" in m:
            return -3
        if "laguna" in m:
            return -3
        return 1

    if domain == DOMINIO_TRIAGEM:
        # Triagem e classificacao curta: o mais barato que classifica bem vence.
        if "lite" in m:
            return -5
        if "laguna-xs" in m or "laguna-s" in m:
            return -4
        if "gemini-3.5" in m:
            return -3
        if "ai9stars" in m:
            return -3
        if "flash" in m:
            return -1
        return 2

    if domain == DOMINIO_PORTUGUES:
        if "ling" in m:
            return -5
        if "gemma" in m:
            return -3
        return 1

    if domain == DOMINIO_RAZONIO:
        if "3.7" in m:
            return -6
        if "120b" in m or "glm" in m:
            return -4
        if "r1" in m or "reason" in m:
            return -4
        if "laguna" in m:
            return -3
        if "3.6" in m:
            return -2
        return 1

    if domain == DOMINIO_CURADORIA:
        # Curadoria pede juizo, e juizo pede parametro. O 120b e o mais forte da
        # frota; o 31b o segundo. O `3.5-flash-lite` NAO entra aqui de proposito:
        # classificar bem e barato; escolher o que unify e barato nao.
        if "120b" in m or "glm" in m:
            return -6
        if "31b" in m or "gemma-4-31b" in m:
            return -5
        if "3.8" in m:
            return -3
        if "3.7" in m:
            return -2
        return 1

    if domain == DOMINIO_INTELIGENCIA:
        # Fundacao e plano. O gemma 31b segura a arquitetura inteira; o glm oss
        # (120b) e o segundo por parametro, e ALIADO do 31b aqui — os dois sao
        # do mesmo porte, entao a diferenca e de tastes, nao de porte.
        if "31b" in m or "gemma-4-31b" in m:
            return -6
        if "120b" in m or "glm" in m:
            return -5
        if "3.8" in m:
            return -3
        if "3.7" in m:
            return -2
        return 1

    return 0


def _infer_provider_for_model(model: str) -> str | None:
    model_l = model.lower()
    if "space-bunny" in model_l or model_l.startswith("hermes/"):
        return "hermes"
    if "strata" in model_l:
        return "strata"
    if "gemma" in model_l and ("google/" in model_l or model_l.startswith("gemma")):
        return "local"
    if "qwen" in model_l and "/" not in model_l:
        return "local"
    if "ai9stars" in model_l or "ling" in model_l:
        return "local"
    if "gemini" in model_l:
        return "gemini"
    if "claude" in model_l or "anthropic" in model_l:
        return "anthropic"
    if "/" in model_l:
        return "openrouter"
    return None


def _score_local_preference(m: str, domain: str | None = None) -> int:
    if FREE_TIER_MARKER in m or "local" in m or "ai9stars" in m:
        return 0

    # SOTA GOLD: Prioridade por Dominio na Frota Local
    if domain == "MATH" and ("31b" in m or "gemma-4-31b" in m):
        return -5  # Prioridade absoluta para o motor 31b em matematica

    if "gemma-4" in m or "gemma4" in m:
        return 1
    if "gemini-3.5" in m:
        return 2
    if "gemini-3.1" in m:
        return 3
    if "gemini-3.6" in m:
        return 4
    if "gemini-3.7" in m:
        return 5
    if "deepseek-r1" in m:
        return 6
    if "flash" in m:
        return 7
    if "gemini" in m:
        return 8
    return 10


def _score_standard_preference(m: str, model: str, domain: str | None = None) -> int:
    # SOTA GOLD: Inversao de Soberania (Local-First) mesmo em modo Standard
    if domain == "MATH" and ("31b" in m or "gemma-4-31b" in m):
        return -5

    # Economia e o TERCEIRO eixo: so desempate entre modelos igualmente
    # capazes. Antes era o unico eixo, e por isso o mais barato vencia o
    # especialista. `gemini-3.8` ganha ramo proprio -- sem ele caia em
    # `"flash" in m` (3), pior que `3.7` (-1) e que o proprio 3.6 (-2).
    if "gemini-3.5" in m:
        return -4  # Mais barato da familia; especialista em TRIAGE
    if "gemini-3.8" in m:
        return 0  # Raciocinio mais forte da familia; especialista em RAZONIO
    if "gemini-3.6" in m:
        return -2  # Workhorse Flash
    if "gemini-3.7" in m:
        return -1  # Reasoning Flash
    if "gemma-4" in m or "gemma4" in m:
        return 1
    if "deepseek-r1" in m:
        return 1
    if FREE_TIER_MARKER in m or "laguna" in m:
        return 2
    if "flash" in m:
        return 3
    if "gemini" in m:
        return 4

    p = _infer_provider_for_model(model)
    if p == "openrouter":
        return 8
    return 9


def _custo_relativo(m: str, model: str) -> float:
    """Custo em unidades relativas. Menor e mais barato.

    Escala bruta, nao calibrada em dolar: o que importa aqui e a ORDEM entre os
    modelos da frota, nao o preco absoluto. Mudanca de preco nao muda a ordem,
    entao um desconto no 3.5-lite nao embaralha o roteamento inteiro.
    """
    if FREE_TIER_MARKER in m or "local" in m or "ai9stars" in m or "ling" in m:
        return 0.0
    if "laguna" in m or "space-bunny" in m:
        return 0.0  # família laguna / condutor hermes free
    if "120b" in m or "glm" in m:
        return 9.0  # o maior da frota
    if "31b" in m or "gemma-4-31b" in m:
        return 6.0
    p = _infer_provider_for_model(model)
    if p == "local":
        return 0.0
    if "gemini-3.5" in m:
        return 1.0  # o mais barato do cloud
    if "gemini-3.6" in m:
        return 2.0
    if "gemini-3.7" in m:
        return 3.0
    if "gemini-3.8" in m:
        return 3.5
    if "deepseek" in m:
        return 0.5
    return 5.0 if p == "openrouter" else 4.0


def _ganho_de_especialidade(m: str, domain: str | None) -> float:
    """Ganho de qualidade na dimensao, normalizado em [0, 1].

    ALEM do ganho, ha uma REGRA DE ALOCACAO: recurso escasso sob demanda
    infinita. Um modelo potente que NAO e especialista da dimensao nao ganha
    nada nela — e,ao inves de receber ganho zero como qualquer outro, ele e
    **PRESERVADO**: some da corrida para essa dimensao em vez de competir com
    o especialista que resolve igual por menos.

    Medido o defeito que isto corrige, com os dois lados:
    - Sem a regra, `gpt-oss:120b` era escolhido em TRIAGE: desperdicava o recurso
      mais forte da frota no trabalho mais simples e **aposentava o
      `gemini-3.5-flash-lite`**, que e o especialista e resolve a tarefa.
    - E o simétrico: com o custo sempre punindo cloud, eles NUNCA venciam em
      CURADORIA nem INTELIGENCIA — as duas areas onde sao os melhores ficavam
      **sem especialista nenhum**.

    Ou seja: o mesmo numero de recurso, alocado onde ele rende. Potencia sem
    dimensao em que ela rende e recurso ocioso.
    """
    bruto = _especialidade(m, domain)

    if _e_recurso_escasso(m) and bruto > -_ESPECIALIDADE_MATERIAL:
        # Potente, mas esta dimensao nao e a dele: sai da corrida. 0.0 e o
        # piso — ele continua disponivel como alternativa se todos cairem.
        return 0.0

    # Quem nao serve a dimensao (bruto > 0) nao ganha nada nela.
    if bruto > 0:
        return 0.0
    # Normaliza o degrau de especialista: -1 (fraco) .. -6 (forte) -> 0..1.
    return min(1.0, (-bruto) / 6.0)


def _score_model(
    model: str,
    prefer_local: bool = False,
    designated_model: str | None = None,
    domain: str | None = None,
) -> float:
    m = model.lower()

    # Eixo 1 — DESIGNACAO (Tier 1). Absoluta e inegociavel: e o Tier 1 nomeando o
    # modelo do agente. Nenhuma troca economica sobrepoe uma decisao do Tier 1.
    if designated_model and m == designated_model.lower():
        return float(_FAIXA_DESIGNACAO)

    # Eixo 1b — TIER 1 NAO E CANDIDATO A TAREFA COMUM.
    # O Tier 1 orquestra e foca no topo da piramide. Tarefa comum que outro modelo
    # resolve nao justifica Tier 1 na fila background.
    if _e_tier1(m):
        return float(_FAIXA_TIER1_INDISPONIVEL)

    # Eixo 2 — ESPECIALIDADE & ALOCACAO POR DOMINIO (quando declarado)
    if domain is not None:
        esp = _especialidade(m, domain)

        # Regra de Alocacao e Preservacao de Recursos Escassos:
        # Se for recurso potente de cloud (31b, 120b) e esta dimensao NAO exigir seu porte
        # (ex: TRIAGE, CODE), ele e PRESERVADO para Curadoria/Planejamento/Math,
        # impedindo que queime cota de cloud e aposente o 3.5-flash-lite ou coder local.
        if _e_recurso_escasso(m) and esp > -_ESPECIALIDADE_MATERIAL:
            return 50.0 + _custo_relativo(m, model)

        # Se o modelo e especialista para a dimensao (esp < 0):
        if esp < 0:
            # Desempate fino por custo e velocidade (sem quebrar a precedencia de degrau de especialidade)
            desempate = 0.05 * _custo_relativo(m, model) - 0.02 * _velocidade(m)
            if prefer_local and ("local" in m or "coder" in m or FREE_TIER_MARKER in m):
                desempate -= 0.5
            return float(_FAIXA_ESPECIALIDADE + esp + desempate)

    # Eixo 3 — ECONOMIA & MODO STANDARD (sem dominio ou modelo sem especialidade no dominio)
    if prefer_local:
        return float(_score_local_preference(m, domain))

    return float(_score_standard_preference(m, model, domain))


#: Fonte unica do dominio de trabalho de cada agente.
#:
#: Ate 29/09/2026 nenhum modulo declarava `Task.metadata["domain"]`, entao
#: `_especialidade` nunca pontuava ninguem e a decisao caia inteira no eixo
#: economico — o comportamento medido que roteou uma auditoria de seguranca para
#: `gemini-3.6-flash`. Esta tabela fecha o circuito.
#:
#: DERIVADA DO TRABALHO, nao escolhida por preferencia: cada entrada diz o que o
#: agente produz. `@dispatcher` produz JSON de subtarefas validado por
#: `agents/dispatcher.py:_parse_dispatcher_subtasks_strict` — classificacao
#: estruturada, e por isso TRIAGE, cujo perfil e o `3.5-flash-lite`: o mais
#: barato que ainda respeita schema. `@implementor` produz codigo — CODE, cujo
#: especialista e o coder quantizado local, tentado antes do cloud.
#:
#: Agente ausente = sem dominio declarado = comportamento economico anterior.
#: A ausencia nao e palpite: e o estado anterior, preservado.
DOMINIO_POR_AGENTE: dict[str, str] = {
    # Triagem: classificar e enderecar. JSON estruturado, sem raciocinio longo.
    "dispatcher": DOMINIO_TRIAGEM,
    "organizador": DOMINIO_TRIAGEM,
    "sequenciador": DOMINIO_TRIAGEM,
    "bibliotecario": DOMINIO_TRIAGEM,
    # Codigo: editar, revisar invariante, aplicar patch.
    "implementor": DOMINIO_CODIGO,
    "verifier": DOMINIO_CODIGO,
    "validador": DOMINIO_CODIGO,
    "skillmaster": DOMINIO_CODIGO,
    # Raciocinio: auditoria, arquitetura, decisao sob incerteza.
    "securitychief": DOMINIO_RAZONIO,
    "auditor": DOMINIO_RAZONIO,
    "chico": DOMINIO_RAZONIO,
    "maverick": DOMINIO_RAZONIO,
    "pesquisador": DOMINIO_RAZONIO,
    "prompter": DOMINIO_RAZONIO,
    "historian": DOMINIO_RAZONIO,
    # Curadoria: unificar estetica, memoria e coerencia entre arvores.
    "curator": DOMINIO_CURADORIA,
    # Inteligencia: fundamentar antes de executar. O gemma 31b/120b e o
    # especialista — binario grande o bastante para segurar o plano inteiro.
    "architect": DOMINIO_INTELIGENCIA,
    "planner": DOMINIO_INTELIGENCIA,
    # Matematica: o caso em que o 31b cloud tambem e o especialista.
    "gemma4": DOMINIO_MATH,
}


def dominio_do_agente(agent: str) -> str | None:
    """Dominio de trabalho do agente, sem o `arroba`.

    Aceita `@implementor` e `implementor`: a chave vive no manifesto sem arroba,
    e quem chama tem as duas formas na mao.
    """
    if not agent or not isinstance(agent, str):
        return None
    return DOMINIO_POR_AGENTE.get(agent.lstrip("@").strip().lower())


def resolver_dominio(task: Task | None) -> str | None:
    """Domina o dominio da tarefa. Declarado vence derivado.

    `Task.metadata["domain"]` e a fonte explicita e tem precedencia: quem
    enfileira sabe mais do que esta tabela. O derivado cobre o restante.
    """
    declarado = _dominio_da_tarefa(task)
    if declarado:
        return declarado
    if task is None:
        return None
    return dominio_do_agente(task.agent)


def _reorder_models_for_economy(
    models: list[str], prefer_local: bool = False, designated_model: str | None = None, domain: str | None = None
) -> list[str]:
    if not models:
        return models

    # SOTA GOLD: Se prefer_local for True ou se houver um dominio especifico, forca a reordenacao
    if not te._feature_enabled("prefer_cost_saving_mode") and not prefer_local and not domain:
        return models

    return sorted(models, key=lambda m: _score_model(m, prefer_local, designated_model, domain))


def _inject_openrouter_alternatives(models: list[str], designated_model: str | None = None) -> list[str]:
    """Acrescenta alternativas OpenRouter ao FIM da trilha.

    Este roda DEPOIS de `_reorder_models_for_economy`, e por isso o que entra
    aqui nao passa pelo score. Medido em 29/09/2026: era por esta porta que
    `claude-sonnet-5` e `gpt-5.6-sol` apareciam como head de `@implementor` — o
    Tier 1 executando edicao de codigo delegavel.

    Por isso o filtro: candidato Tier 1 so entra quando e o `designated_model`
    declarado. Caso contrario ele fica de fora da malha, que e onde o Tier 1
    atua — como orquestrador, no topo, e nao como agente customizado.
    """
    openrouter_alternative_models = te.OPENROUTER_ALTERNATIVE_MODELS
    if not openrouter_alternative_models:
        openrouter_alternative_models = (
            "poolside/laguna-s-2.1:free",
            "poolside/laguna-xs-2.1:free",
            "meta-llama/llama-3.3-70b-instruct:free",
        )
    designado = (designated_model or "").strip().lower()
    merged = list(models)
    insert_at = len(merged)
    for candidate in openrouter_alternative_models:
        candidate = str(candidate).strip()
        if not candidate or candidate in merged:
            continue
        if _infer_provider_for_model(candidate) != "openrouter":
            continue
        if _e_tier1(candidate.lower()) and candidate.lower() != designado:
            continue
        merged.insert(insert_at, candidate)
        insert_at += 1
    return merged


async def _get_model_recent_health(
    provider: str, model: str, manager: QueueManager, window_minutes: int
) -> dict[str, float]:
    cutoff = (datetime.now(UTC) - timedelta(minutes=window_minutes)).isoformat()
    async with manager._get_async_db() as db:
        db.row_factory = sqlite3.Row
        async with db.execute(
            """
            SELECT
                COUNT(*) AS attempts,
                SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes
            FROM key_usage_metrics
            WHERE provider = ? AND model = ? AND timestamp >= ?
        """,
            (provider, model, cutoff),
        ) as cursor:
            row = await cursor.fetchone()

    attempts = int((row["attempts"] or 0) if row else 0)
    successes = int((row["successes"] or 0) if row else 0)
    success_rate_pct = (float(successes) / float(attempts) * 100.0) if attempts else 0.0
    return {
        "attempts": attempts,
        "successes": successes,
        "success_rate_pct": round(success_rate_pct, 2),
    }


async def _apply_model_health_gate(models: list[str], manager: QueueManager, task: Task) -> list[str]:
    if not bool(te._health_gate_value("enabled", True)):
        return models

    window_minutes = int(te._health_gate_value("window_minutes", 180))
    min_attempts = int(te._health_gate_value("min_attempts", 3))
    min_success_rate_pct = float(te._health_gate_value("min_success_rate_pct", 10.0))
    drop_only_free_models = bool(te._health_gate_value("drop_only_free_models", True))
    protected_models = {str(m).strip().lower() for m in te._health_gate_value("protect_models", []) if str(m).strip()}

    filtered: list[str] = []
    for model in models:
        model_l = model.lower()
        provider = _infer_provider_for_model(model) or "unknown"

        # SOTA: Define as condicoes em que um modelo deve ser verificado.
        is_checkable = (
            provider == "openrouter"
            and model_l not in protected_models
            and not (drop_only_free_models and ":free" not in model_l)
        )

        if not is_checkable:
            filtered.append(model)
            continue

        # Logica de verificacao de saude para modelos elegiveis.
        stats = await _get_model_recent_health(provider, model, manager, window_minutes)
        if stats["attempts"] >= min_attempts and stats["success_rate_pct"] < min_success_rate_pct:
            logger.warning(
                "[[%s]%s[/]] Model gate removeu %s:%s (attempts=%s, success_rate=%s%%).",
                te._c(task.agent),
                task.agent,
                provider,
                model,
                stats["attempts"],
                stats["success_rate_pct"],
            )
        else:
            # Mantem o modelo se tiver poucas tentativas ou uma taxa de sucesso aceitavel.
            filtered.append(model)

    if filtered:
        return filtered
    logger.warning(
        "[[%s]%s[/]] Model gate removeu todas as opcoes; mantendo rota original.",
        te._c(task.agent),
        task.agent,
    )
    return models
