"""Politica de roteamento economico e especializado — SOTA v8.0 GOLD.

Implementa a arquitetura estrategica do estudo de fronteira de 2026-08-21. O
registro em `model_registry.py` corrigiu os DADOS do estudo; este modulo
implementa a ESTRATEGIA, que sobreviveu intacta a verificacao — e que, num
ponto, saiu reforcada por ela.

## O problema que isto resolve

`data/agents_manifest.json` declara 18 agentes com `model_preference` de
`deep_thinking` ou `fast_operations`. Os 18 apontam para o MESMO
`primary_model`: gemini-3.5-flash-lite. O campo de preferencia e vocabulario
sem mecanismo — Chico em God Mode e o dispatcher recebem o mesmo modelo.

`llm/routing.py` pontua por substring do nome (`"gemini-3.5" in m`) com
inteiros fixos. Nao ha custo, tipo de tarefa nem escalonamento.

## As tres teses do estudo, e o que a verificacao fez com cada uma

1. **Assimetria de capacidade.** Nao existe "melhor modelo", existe melhor
   modelo POR CLASSE DE TAREFA. O topo em raciocinio profundo nao e o topo em
   refatoracao de longo horizonte. Rotear por tarefa, nao por ranking.
   -> Tese preservada.

2. **Escalonamento em vez de flagship indiferenciado.** Executor barato de
   primeira passagem; escalar so quando a complexidade exigir.
   -> Tese REFORCADA pela verificacao: o GPT-5.6 Luna custa $0.20/$1.20 e nao
      $1.00/$6.00 como o estudo supunha. A camada barata e 5x mais barata do
      que o proprio autor calculava, o que aumenta o ganho do escalonamento.

3. **Economia Generalizada.** Ordem de alocacao: cota gratuita/promocional ->
   ponte flat-fee -> API paga como ultima linha.
   -> Tese preservada.

## Sobre a metrica de ROI

O estudo propoe ROI = sucesso / (custo x latencia). A forma esta certa e a
armadilha esta no denominador: em modelos de Sistema 2 os tokens de raciocinio
sao cobrados como saida e podem dominar o total. Custo estimado por tokens
visiveis e PISO, nao previsao — por isso `estimar_roi` exige que se informe o
multiplicador de raciocinio em vez de fingir que ele nao existe.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from llm.model_registry import MODEL_REGISTRY, custo_estimado, get


class ClasseTarefa(str, Enum):
    """Classes com assimetria de desempenho conhecida entre provedores."""

    RACIOCINIO_PROFUNDO = "raciocinio_profundo"   # prova, analise de risco, arquitetura macro
    CODIGO_LONGO_HORIZONTE = "codigo_longo"       # refatoracao multi-arquivo, grafo de dependencia
    VERIFICACAO = "verificacao"                   # auditoria, QA, revisao de primeira passagem
    TRIAGEM = "triagem"                           # roteamento, classificacao, sumarizacao curta
    SESSAO_MULTI_DIA = "sessao_multi_dia"         # execucao continuada assincrona


class TierAgente(int, Enum):
    GOVERNANCA = 1   # chico
    ESTRATEGIA = 2   # maverick
    EXECUCAO = 3     # os demais 16


class Faixa(str, Enum):
    """Ordem de alocacao orcamentaria da Economia Generalizada."""

    GRATUITA = "gratuita"          # cota livre / promocional / local
    FLAT_FEE = "flat_fee"          # ponte de handoff para assinatura web
    API_PAGA = "api_paga"          # ultima linha de defesa


@dataclass(frozen=True)
class Rota:
    primario: str
    fallback: str
    faixa: Faixa
    justificativa: str
    escalona_para: str | None = None


# ==============================================================================
# TABELA DE ROTEAMENTO POR CLASSE DE TAREFA
# ==============================================================================
# A assimetria e o ponto: o modelo que lidera raciocinio profundo NAO e o que
# lidera refatoracao de longo horizonte. Rotear por ranking unico desperdicia
# dinheiro na direcao errada.

ROTAS: dict[ClasseTarefa, Rota] = {
    ClasseTarefa.RACIOCINIO_PROFUNDO: Rota(
        primario="gpt-5.6-sol",
        fallback="claude-opus-5",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Lideranca em exames de raciocinio profundo. Fallback para Opus 5, "
            "que fica proximo e custa menos na saida ($25 contra $30)."
        ),
    ),
    ClasseTarefa.CODIGO_LONGO_HORIZONTE: Rota(
        primario="claude-opus-5",
        fallback="claude-sonnet-5",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Assimetria invertida: em refatoracao multi-arquivo e ambientes de "
            "desenvolvimento reais a familia Claude lidera com folga sobre o "
            "topo de raciocinio puro. Sonnet 5 sustenta a maior parte do "
            "trabalho por 60% do preco."
        ),
    ),
    ClasseTarefa.VERIFICACAO: Rota(
        primario="gemini-3.7-flash",
        fallback="gpt-5.6-terra",
        faixa=Faixa.GRATUITA,
        escalona_para="claude-opus-5",
        justificativa=(
            "Revisao de primeira passagem nao precisa de flagship. Escalona "
            "so quando o revisor barato sinaliza incerteza."
        ),
    ),
    ClasseTarefa.TRIAGEM: Rota(
        primario="gpt-5.6-luna",
        fallback="gemini-3.7-flash",
        faixa=Faixa.GRATUITA,
        escalona_para="gpt-5.6-terra",
        justificativa=(
            "A $0.20/$1.20 a Luna e o executor primario obvio. O estudo a "
            "precificava 5x acima e por isso a subutilizava."
        ),
    ),
    ClasseTarefa.SESSAO_MULTI_DIA: Rota(
        primario="claude-fable-5",
        fallback="claude-opus-5",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Unico modelo com auto-verificacao assincrona e raciocinio "
            "multi-sessao. Caro ($10/$50): reservar para o que so ele faz."
        ),
    ),
}


# ==============================================================================
# MAPA AGENTE -> TIER + CLASSE
# ==============================================================================
# Nomes conferidos contra data/agents_manifest.json, nao inventados.

AGENTES: dict[str, tuple[TierAgente, ClasseTarefa]] = {
    "chico": (TierAgente.GOVERNANCA, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "maverick": (TierAgente.ESTRATEGIA, ClasseTarefa.RACIOCINIO_PROFUNDO),

    "architect": (TierAgente.EXECUCAO, ClasseTarefa.CODIGO_LONGO_HORIZONTE),
    "implementor": (TierAgente.EXECUCAO, ClasseTarefa.CODIGO_LONGO_HORIZONTE),
    "planner": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "pesquisador": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "curator": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "historian": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),

    "auditor": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "verifier": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "validador": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "securitychief": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),

    "dispatcher": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
    "organizador": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
    "sequenciador": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
    "prompter": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
    "bibliotecario": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
    "skillmaster": (TierAgente.EXECUCAO, ClasseTarefa.TRIAGEM),
}


def rotear(agente: str, *, escalado: bool = False) -> str:
    """Modelo para um agente. `escalado=True` sobe um degrau na escada.

    Substitui o estado atual, em que os 18 agentes recebem o mesmo modelo
    independentemente de `model_preference`.
    """
    if agente not in AGENTES:
        raise KeyError(f"Agente '{agente}' fora do manifesto. Conhecidos: {sorted(AGENTES)}")
    _, classe = AGENTES[agente]
    rota = ROTAS[classe]
    if escalado and rota.escalona_para:
        return rota.escalona_para
    return rota.primario


def rota_de(agente: str) -> Rota:
    return ROTAS[AGENTES[agente][1]]


# ==============================================================================
# ECONOMIA
# ==============================================================================

def estimar_roi(
    alias: str,
    *,
    taxa_sucesso: float,
    tokens_in: int,
    tokens_out: int,
    latencia_s: float,
    multiplicador_raciocinio: float = 1.0,
) -> float:
    """ROI cognitivo = sucesso / (custo x latencia).

    `multiplicador_raciocinio` corrige o ponto cego da formula original: em
    modelos de Sistema 2 os tokens de raciocinio sao cobrados como saida. Um
    valor de 3.0 significa que a saida faturada tende a ser 3x a saida visivel.
    Deixar em 1.0 assume que nao ha raciocinio — o que e falso em todo modelo
    deste registro, e por isso o parametro e explicito em vez de ter default
    silencioso e otimista.
    """
    if not 0.0 <= taxa_sucesso <= 1.0:
        raise ValueError("taxa_sucesso deve estar entre 0 e 1.")
    if latencia_s <= 0:
        raise ValueError("latencia_s deve ser positiva.")
    custo = custo_estimado(alias, tokens_in, int(tokens_out * multiplicador_raciocinio))
    if custo <= 0:
        raise ValueError(f"Custo nao positivo para {alias}.")
    return taxa_sucesso / (custo * latencia_s)


def economia_do_escalonamento(
    classe: ClasseTarefa,
    *,
    chamadas: int,
    tokens_in: int,
    tokens_out: int,
    fracao_escalada: float,
) -> dict[str, float]:
    """Compara escalonamento contra usar o modelo caro em tudo.

    `fracao_escalada` e a parcela de chamadas que o executor barato nao resolve
    e precisa subir. Acima de um certo ponto o escalonamento deixa de compensar
    — o retorno inclui esse limiar em vez de assumir que escalonar sempre ganha.
    """
    rota = ROTAS[classe]
    caro = rota.escalona_para or rota.fallback
    barato = rota.primario

    c_barato = custo_estimado(barato, tokens_in, tokens_out)
    c_caro = custo_estimado(caro, tokens_in, tokens_out)

    tudo_caro = chamadas * c_caro
    escalonado = chamadas * c_barato + chamadas * fracao_escalada * c_caro

    # Ponto em que escalonar custa o mesmo que ir direto ao caro.
    limiar = 1.0 - (c_barato / c_caro) if c_caro > 0 else 0.0

    return {
        "custo_tudo_caro": round(tudo_caro, 4),
        "custo_escalonado": round(escalonado, 4),
        "economia": round(tudo_caro - escalonado, 4),
        "economia_pct": round(100 * (1 - escalonado / tudo_caro), 1) if tudo_caro else 0.0,
        "fracao_de_equilibrio": round(limiar, 4),
        "vale_a_pena": fracao_escalada < limiar,
    }


# ==============================================================================
# PRUNING DINAMICO DE FERRAMENTAS
# ==============================================================================

def plano_de_ferramentas(
    ferramentas: list[dict],
    relevantes: set[str],
    *,
    limiar_defer: int = 8,
) -> list[dict]:
    """Marca ferramentas irrelevantes com `defer_loading`, mantendo o cache.

    Implementa o insight de segunda ordem do estudo — nao expor dezenas de
    esquemas JSON a cada iteracao, o que dilui a atencao e aumenta chamada
    incorreta — pelo mecanismo que de fato existe.

    O estudo atribui isso ao header 'mid-conversation-tool-changes-2026-07-01',
    que nao consta na documentacao. O mecanismo real e o tool search com
    `defer_loading: true`: as ferramentas diferidas ficam fora do contexto ate
    o modelo busca-las, e o prefixo cacheado permanece valido.

    Regra dura da API: a ferramenta de busca nao pode ser diferida, e ao menos
    uma ferramenta precisa continuar carregada, ou a chamada retorna 400.
    """
    if len(ferramentas) <= limiar_defer:
        return ferramentas

    saida: list[dict] = []
    carregadas = 0
    for f in ferramentas:
        nome = f.get("name", "")
        eh_busca = str(f.get("type", "")).startswith("tool_search_tool_")
        if eh_busca or nome in relevantes:
            saida.append(f)
            carregadas += 1
        else:
            saida.append({**f, "defer_loading": True})

    if carregadas == 0:  # nunca diferir tudo
        saida[0] = {k: v for k, v in saida[0].items() if k != "defer_loading"}
    return saida


__all__ = [
    "ClasseTarefa",
    "TierAgente",
    "Faixa",
    "Rota",
    "ROTAS",
    "AGENTES",
    "rotear",
    "rota_de",
    "estimar_roi",
    "economia_do_escalonamento",
    "plano_de_ferramentas",
]
