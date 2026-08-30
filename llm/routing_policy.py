"""Politica de roteamento economico e especializado  SOTA v8.0 GOLD.

Implementa a tabela de roteamento por tier definida pelo operador, estendida
para cobrir o ecossistema inteiro: **19 agentes** do manifesto mais os **6
niveis de subagente** de `core.subagents_mesh.SubagentTier`.

## Ordem de precedencia das decisoes

1. **Faixa orcamentaria manda antes de preco unitario.** A Economia
   Generalizada ordena: cota gratuita/promocional -> ponte flat-fee -> API
   paga. Um modelo com cota livre ganha de um modelo pago mais barato por
   token, porque o custo marginal da cota e zero. Uma versao anterior deste
   modulo roteava Tier 3 operacional para `gpt-5.6-luna` por ter o menor
   $/token  e estava errada: `gemini-3.7-flash` tem cota gratuita e a Luna
   nao. Preco unitario so desempata DENTRO da mesma faixa.
2. **Assimetria de capacidade.** Nao existe "melhor modelo", existe melhor
   modelo por classe de tarefa. Quem lidera raciocinio profundo nao lidera
   refatoracao de longo horizonte.
3. **Escalonamento.** Executor de primeira passagem barato; subir so quando a
   complexidade exigir.

## Conflito conhecido entre a tabela e o manifesto

`data/agents_manifest.json` marca `implementor` como `fast_operations`, mas a
tabela do operador o coloca em Tier 3 Construcao com `claude-sonnet-5`. E marca
`historian` como `deep_thinking`, enquanto a tabela o lista em Tier 3
Operacional. Onde a tabela e explicita, ela prevalece  foi escrita depois, com
o sistema a vista. Os dois casos estao anotados em `CONFLITOS_MANIFESTO` para
que voce reconcilie o manifesto quando quiser, em vez de a divergencia sumir.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import date
from enum import Enum
from pathlib import Path
from typing import Any

from llm.model_registry import custo_estimado, get

logger = logging.getLogger(__name__)

# Modelos locais vivem em data/ollama_models.json, nao no MODEL_REGISTRY de
# nuvem. Sao dois registros de proposito: um descreve API paga com preco por
# token, o outro descreve pesos em disco cujo custo marginal e zero. Misturar
# os dois faria a matematica de economia mentir.
_MANIFESTO_LOCAL = Path(__file__).resolve().parent.parent / "data" / "ollama_models.json"


def _carregar_modelos_locais() -> frozenset[str]:
    try:
        dados = json.loads(_MANIFESTO_LOCAL.read_text(encoding="utf-8"))
        tags = [m["tag"] for m in dados.get("models", []) if m.get("tag")]
        aliases = [m["alias"] for m in dados.get("models", []) if m.get("alias")]
        stripped = [t.split(":latest")[0] for t in tags if ":latest" in t]
        return frozenset(tags + aliases + stripped)
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return frozenset()


MODELOS_LOCAIS: frozenset[str] = _carregar_modelos_locais()


def e_local(alias: str) -> bool:
    return alias in MODELOS_LOCAIS


def custo(alias: str, tokens_in: int, tokens_out: int) -> float:
    """Custo em USD, ciente das duas faixas.

    Modelo local custa **zero marginal**  os pesos ja estao em disco. Isso nao
    e aproximacao: nao ha fatura por token. O custo real dele e energia e
    ocupacao de GPU, que nao entram nesta conta e nao devem entrar, porque a
    decisao que esta funcao alimenta e "gasto de API".
    """
    if e_local(alias):
        return 0.0
    return custo_estimado(alias, tokens_in, tokens_out)


class ClasseTarefa(str, Enum):
    GOVERNANCA = "governanca"  # mediacao, decisao final
    ESTRATEGIA = "estrategia"  # mentoria, analise de risco
    CONSTRUCAO = "construcao"  # escrita de codigo multi-arquivo
    VERIFICACAO = "verificacao"  # auditoria, QA, seguranca
    OPERACIONAL = "operacional"  # despacho, organizacao, registro
    RACIOCINIO_PROFUNDO = "raciocinio_profundo"  # planejamento, pesquisa, prova
    SESSAO_MULTI_DIA = "sessao_multi_dia"  # execucao continuada assincrona
    LOCAL = "local"  # inferencia de borda, sem API


class TierAgente(int, Enum):
    GOVERNANCA = 1
    ESTRATEGIA = 2
    EXECUCAO = 3
    SUBAGENTE = 4


class Faixa(str, Enum):
    """Ordem de alocacao. Menor valor = consumir primeiro."""

    LOCAL = "local"  # 0 custo marginal, sem rede
    GRATUITA = "gratuita"  # cota livre / promocional
    FLAT_FEE = "flat_fee"  # ponte de handoff para assinatura web
    API_PAGA = "api_paga"  # ultima linha de defesa


PRECEDENCIA_FAIXA: dict[Faixa, int] = {
    Faixa.LOCAL: 0,
    Faixa.GRATUITA: 1,
    Faixa.FLAT_FEE: 2,
    Faixa.API_PAGA: 3,
}


@dataclass(frozen=True)
class Rota:
    primario: str
    fallback: str
    faixa: Faixa
    justificativa: str
    escalona_para: str | None = None

    # --- ANCORA DE DECAIMENTO (M.O. 13.A, classe EXTERNA) --------------------
    # Toda `justificativa` desta tabela afirma CAPACIDADE e PRECO de sistema de
    # terceiro: "Sonnet 5 sustenta alteracao multi-arquivo", "unico com
    # auto-verificacao assincrona", "$25 contra $30". Sao fatos externos, e fato
    # externo decai pelo TEMPO, nao por diff.
    #
    # O gatilho real e o release do fornecedor. A cada upgrade a fronteira de
    # capacidade se move e papeis migram -- sempre na mesma direcao, do barato e
    # especializado para o caro e generalista, porque cada release torna o
    # modelo de fronteira plausivelmente capaz da tarefa barata e nada empurra
    # de volta. Deriva com direcao nao se corrige na media.
    #
    # Nao ha como detectar release sem consultar o fornecedor, entao o TTL e o
    # proxy honesto: passado o prazo, a rota vira SUSPEITA e exige reconsulta em
    # vez de continuar valendo em silencio.
    ancorado_em: str = ""              # ISO YYYY-MM-DD da ultima verificacao
    modelos_citados: tuple[str, ...] = ()  # de quem a justificativa depende


# ==============================================================================
# TABELA DE ROTEAMENTO  segue a definicao do operador
# ==============================================================================

ROTAS: dict[ClasseTarefa, Rota] = {
    ClasseTarefa.GOVERNANCA: Rota(
        primario="claude-opus-5",
        fallback="gpt-5.6-sol",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Mediacao de conflito e decisao final exigem julgamento com "
            "consciencia de codigo. Opus 5 lidera horizonte longo e custa menos "
            "na saida que o Sol ($25 contra $30)."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("claude-opus-5", "gpt-5.6-sol"),
    ),
    ClasseTarefa.ESTRATEGIA: Rota(
        primario="gpt-5.6-sol",
        fallback="claude-opus-5",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Analise de risco e arquitetura macro pendem para raciocinio puro, "
            "onde o Sol lidera. Inverso da governanca, de proposito."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("gpt-5.6-sol", "claude-opus-5"),
    ),
    ClasseTarefa.CONSTRUCAO: Rota(
        primario="claude-sonnet-5",
        fallback="gemini-3.7-flash",
        faixa=Faixa.API_PAGA,
        escalona_para="claude-opus-5",
        justificativa=(
            "Sonnet 5 sustenta a maior parte da alteracao multi-arquivo por 60% "
            "do preco do Opus. Escalona ao Opus quando o grafo de dependencia "
            "passa do que o Sonnet resolve numa passada."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("claude-sonnet-5", "gemini-3.7-flash", "claude-opus-5"),
    ),
    ClasseTarefa.VERIFICACAO: Rota(
        primario="gemini-3.7-flash",
        fallback="gpt-5.6-terra",
        faixa=Faixa.GRATUITA,
        escalona_para="claude-opus-5",
        justificativa=(
            "Revisao de primeira passagem em faixa gratuita. Escalona so quando o revisor barato sinaliza incerteza."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("gemini-3.7-flash", "gpt-5.6-terra", "claude-opus-5"),
    ),
    ClasseTarefa.OPERACIONAL: Rota(
        primario="gemini-3.7-flash",
        fallback="gpt-5.6-luna",
        faixa=Faixa.GRATUITA,
        justificativa=(
            "Faixa gratuita ANTES de preco unitario. A Luna e mais barata por "
            "token ($0.20/$1.20) mas nao tem cota livre; o Flash tem. "
            "COTA LIVRE VENCE PRECO UNITARIO MENOR QUANDO A QUALIDADE NAO "
            "DISCRIMINA -- e uma regra de desempate DENTRO do custo, aplicavel "
            "so depois que a analise de custo-beneficio concluiu que a "
            "qualidade nao e o fator decisivo nesta classe. A Luna fica como "
            "fallback pago."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("gemini-3.7-flash", "gpt-5.6-luna"),
    ),
    ClasseTarefa.RACIOCINIO_PROFUNDO: Rota(
        primario="gpt-5.6-sol",
        fallback="claude-opus-5",
        faixa=Faixa.API_PAGA,
        escalona_para=None,
        justificativa="Planejamento, pesquisa e prova formal. Sem degrau acima.",
        ancorado_em="2026-08-27",
        modelos_citados=("gpt-5.6-sol", "claude-opus-5"),
    ),
    ClasseTarefa.SESSAO_MULTI_DIA: Rota(
        primario="claude-fable-5",
        fallback="claude-opus-5",
        faixa=Faixa.API_PAGA,
        justificativa=(
            "Unico com auto-verificacao assincrona e raciocinio multi-sessao. A $10/$50, reservar ao que so ele faz."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("claude-fable-5", "claude-opus-5"),
    ),
    ClasseTarefa.LOCAL: Rota(
        primario="gemma4:12b",
        fallback="gemma4:e4b",
        faixa=Faixa.LOCAL,
        escalona_para="gemini-3.7-flash",
        justificativa=(
            "Inferencia de borda: nenhum custo por uso e nenhuma dependencia de "
            "rede. Pesos ja provisionados; ver data/ollama_models.json."
        ),
        ancorado_em="2026-08-27",
        modelos_citados=("gemma4:12b", "gemma4:e4b", "gemini-3.7-flash"),
    ),
}


# ==============================================================================
# OS 19 AGENTES DO MANIFESTO
# ==============================================================================

AGENTES: dict[str, tuple[TierAgente, ClasseTarefa]] = {
    # Tier 1  Governanca
    "chico": (TierAgente.GOVERNANCA, ClasseTarefa.GOVERNANCA),
    # Tier 2  Estrategia
    "maverick": (TierAgente.ESTRATEGIA, ClasseTarefa.ESTRATEGIA),
    # Tier 3  Construcao
    "architect": (TierAgente.EXECUCAO, ClasseTarefa.CONSTRUCAO),
    "implementor": (TierAgente.EXECUCAO, ClasseTarefa.CONSTRUCAO),
    # Tier 3  Auditoria / QA
    "auditor": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "verifier": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "securitychief": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    "validador": (TierAgente.EXECUCAO, ClasseTarefa.VERIFICACAO),
    # Tier 3  Operacional
    "dispatcher": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "organizador": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "historian": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "sequenciador": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "prompter": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "bibliotecario": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    "skillmaster": (TierAgente.EXECUCAO, ClasseTarefa.OPERACIONAL),
    # Tier 3  Raciocinio
    "planner": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "pesquisador": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    "curator": (TierAgente.EXECUCAO, ClasseTarefa.RACIOCINIO_PROFUNDO),
    # Agente de borda  nao consome API
    "gemma4": (TierAgente.EXECUCAO, ClasseTarefa.LOCAL),
}

# ==============================================================================
# OS 6 NIVEIS DE SUBAGENTE  core.subagents_mesh.SubagentTier
# ==============================================================================
# Cobertos porque o mesh os despacha em paralelo: sem rota propria, herdariam a
# do pai e uma varredura de seguranca poderia cair num modelo de triagem.

SUBAGENTES: dict[str, ClasseTarefa] = {
    "appsec_gatekeeper": ClasseTarefa.VERIFICACAO,
    "math_verifier_sota": ClasseTarefa.LOCAL,  # routing.py ja prioriza gemma-4-31b em MATH
    "wasm_perf_engineer": ClasseTarefa.CONSTRUCAO,
    "poetics_curator": ClasseTarefa.OPERACIONAL,
    "nano_intent_router": ClasseTarefa.OPERACIONAL,
    "streaming_fim_companion": ClasseTarefa.OPERACIONAL,
    "ui_design_curator": ClasseTarefa.CONSTRUCAO,
    "research": ClasseTarefa.RACIOCINIO_PROFUNDO,
    "sub_validador": ClasseTarefa.VERIFICACAO,
    "sub_implementor": ClasseTarefa.CONSTRUCAO,
    "sub_curator": ClasseTarefa.RACIOCINIO_PROFUNDO,
    "sub_architect": ClasseTarefa.CONSTRUCAO,
    "generalist": ClasseTarefa.OPERACIONAL,
    "self": ClasseTarefa.OPERACIONAL,  # copia do pai para fan-out barato
    "flutter_a11y_agent": ClasseTarefa.VERIFICACAO,
}

# Divergencias entre a tabela do operador e o manifesto, preservadas para
# reconciliacao consciente em vez de sumirem numa escolha silenciosa.
CONFLITOS_MANIFESTO: dict[str, str] = {
    "implementor": (
        "manifesto diz fast_operations; a tabela o coloca em Tier 3 Construcao "
        "com claude-sonnet-5. Tabela prevalece: escrever codigo multi-arquivo "
        "nao e operacao rapida."
    ),
    "historian": (
        "manifesto diz deep_thinking; a tabela o lista em Tier 3 Operacional. "
        "Tabela prevalece: registro historico e alto volume e baixa ambiguidade."
    ),
}


class Origem(str, Enum):
    """De qual degrau da rota o modelo veio.

    Existe porque `str` nao carrega essa informacao: quem recebia so o alias
    nao distinguia "recebi o que pedi" de "pedi escalonamento e nao havia".
    """

    PRIMARIO = "primario"
    ESCALADO = "escalado"
    FALLBACK = "fallback"
    ESCALONAMENTO_INDISPONIVEL = "escalonamento_indisponivel"


@dataclass(frozen=True)
class Decisao:
    """Resultado de roteamento COM a procedencia declarada.

    `Rota` descreve o que a politica OFERECE; `Decisao` descreve o que a
    politica ENTREGOU e por que. Sem a segunda, degradacao e indistinguivel de
    operacao normal no ponto de uso.
    """

    modelo: str
    origem: Origem
    classe: ClasseTarefa
    rota: Rota

    @property
    def degradado(self) -> bool:
        """True quando o chamador NAO recebeu o que a rota prometia.

        Cobre os dois casos: caiu para o fallback, ou pediu escalonamento numa
        classe que nao tem degrau acima. O segundo e degradacao relativa ao
        pedido, nao ao primario  o chamador julgou a tarefa complexa demais
        para o primario e recebeu o primario assim mesmo.
        """
        return self.origem in (Origem.FALLBACK, Origem.ESCALONAMENTO_INDISPONIVEL)

    @property
    def motivo(self) -> str:
        return {
            Origem.PRIMARIO: f"primario da classe {self.classe.value}",
            Origem.ESCALADO: f"escalonado a pedido; primario era {self.rota.primario}",
            Origem.FALLBACK: f"primario {self.rota.primario} indisponivel; degradado ao fallback",
            Origem.ESCALONAMENTO_INDISPONIVEL: (
                f"escalonamento pedido, mas a classe {self.classe.value} nao declara "
                f"escalona_para; entregue o primario {self.rota.primario}"
            ),
        }[self.origem]


class ForaDaAutoridadeDaPolitica(LookupError):
    """A politica foi consultada sobre algo que ela nao decide.

    Herda de `LookupError` para nao quebrar quem ja capturava o `KeyError` de
    alvo desconhecido -- mas a mensagem separa os dois casos, que sao
    diferentes: "nao conheco este alvo" e "conheco, e a autoridade e outra".
    """


def decidir(alvo: str, *, escalado: bool = False, primario_indisponivel: bool = False) -> Decisao:
    """Decisao de roteamento com procedencia. Caminho unico de decisao.

    ## Subagente nao passa por aqui (decisao do operador, 2026-08-28)

    **Subagente e sempre custo zero.** A autoridade de atribuicao de modelo para
    os tiers do mesh e `core.subagents_mesh.SUBAGENT_MODEL_MAP`, que e toda de
    frota local. Esta politica nao a duplica: medido antes da decisao, as duas
    tabelas cobriam os mesmos 13 tiers e divergiam em 13 de 13, porque esta
    roteava para nuvem paga. Duas fontes para o mesmo fato divergem por
    construcao, e a saida foi apagar a segunda, nao sincroniza-la.

    `SUBAGENTES` continua aqui porque declara a CLASSE DE TAREFA de cada tier --
    informacao diferente, usada para classificacao e cobertura. Pedir um MODELO
    para um tier levanta `ForaDaAutoridadeDaPolitica` em vez de devolver um
    alias de nuvem que ninguem deveria usar. Nomes que sao agente E tier
    (`implementor`, `curator`, `architect`, `validador`) resolvem como AGENTE,
    que e o que `_classe_de` sempre fez.

    ## Ordem de precedencia dos dois sinais

    Os dois parametros respondem a perguntas diferentes e nao competem:

    - `escalado` e sobre COMPLEXIDADE  o chamador julgou a tarefa alem do que
      o primario resolve. Vence primeiro, porque se o escalonamento existe o
      primario nao vai ser usado e a disponibilidade dele deixa de importar.
    - `primario_indisponivel` e sobre ALCANCE  o modelo nao respondeu. Esta
      politica nao mede saude de provedor e nunca vai medir: quem chama e que
      sabe. Por isso o fallback e um caminho que o chamador ABRE, nao um que a
      politica adivinha.

    Ate esta data `Rota.fallback` estava declarado e nao tinha um unico
    consumidor  degradacao escrita na tabela e inalcancavel em execucao.
    """
    if alvo not in AGENTES and alvo in SUBAGENTES:
        raise ForaDaAutoridadeDaPolitica(
            f"'{alvo}' e um tier de subagente, e a politica nao atribui modelo a subagente. "
            "A autoridade e core.subagents_mesh.SUBAGENT_MODEL_MAP, e o invariante do "
            "operador e custo zero: frota local. Para a CLASSE de tarefa do tier, use "
            "`_classe_de` via `rota_de`."
        )

    classe = _classe_de(alvo)
    rota = ROTAS[classe]

    if escalado:
        if rota.escalona_para:
            return Decisao(rota.escalona_para, Origem.ESCALADO, classe, rota)
        return Decisao(rota.primario, Origem.ESCALONAMENTO_INDISPONIVEL, classe, rota)

    if primario_indisponivel:
        return Decisao(rota.fallback, Origem.FALLBACK, classe, rota)

    return Decisao(rota.primario, Origem.PRIMARIO, classe, rota)


def rotear(alvo: str, *, escalado: bool = False) -> str:
    """Modelo para um agente ou subagente. **Vista com perda.**

    Preservada com a assinatura e o comportamento originais para nao quebrar
    `core.config._resolver_modelos`, que so precisa do alias. Delega a
    `decidir()` para que exista UMA logica de decisao  duas implementacoes
    paralelas divergiriam em silencio, que e o modo de falha desta base.

    Prefira `decidir()` em codigo novo: aqui a procedencia e descartada, e por
    isso o unico caso em que o descarte esconde algo relevante vira log.
    """
    d = decidir(alvo, escalado=escalado)
    if d.origem is Origem.ESCALONAMENTO_INDISPONIVEL:
        logger.warning("[ROTEAMENTO] %s: %s", alvo, d.motivo)
    return d.modelo


def rota_de(alvo: str) -> Rota:
    return ROTAS[_classe_de(alvo)]


def _classe_de(alvo: str) -> ClasseTarefa:
    if alvo in AGENTES:
        return AGENTES[alvo][1]
    if alvo in SUBAGENTES:
        return SUBAGENTES[alvo]
    raise KeyError(
        f"'{alvo}' nao e agente nem subagente conhecido. Agentes: {sorted(AGENTES)}. Subagentes: {sorted(SUBAGENTES)}."
    )


def cobertura() -> dict[str, int]:
    """Quantos alvos a politica cobre. Usado em teste para impedir regressao."""
    return {"agentes": len(AGENTES), "subagentes": len(SUBAGENTES), "total": len(AGENTES) + len(SUBAGENTES)}


# PALPITE DECLARADO, nao medicao: 90 dias e a ordem de grandeza do intervalo
# entre releases relevantes dos tres fornecedores de fronteira em 2026. Nao foi
# derivado de serie historica. Substituir por numero medido quando houver.
TTL_ROTA_DIAS = 90


def rotas_suspeitas(hoje: date | None = None, *, ttl_dias: int = TTL_ROTA_DIAS) -> dict[ClasseTarefa, str]:
    """Rotas cuja ancora de capacidade venceu, ou que nunca foi declarada.

    Existe para que os campos de ancora nao virem dado que ninguem le -- falha
    que esta propria tabela ja cometeu com `Rota.fallback`, que ate 2026-08-27
    so era lido por `economia_do_escalonamento` como substituto do degrau caro,
    e nunca no caminho de decisao para o qual foi escrito. Hoje `decidir()` o
    consome sob `Origem.FALLBACK`.

    Nao decide nada e nao bloqueia: reporta. A revalidacao e ato humano, porque
    exige consultar o fornecedor.
    """
    hoje = hoje or date.today()
    suspeitas: dict[ClasseTarefa, str] = {}

    for classe, rota in ROTAS.items():
        if not rota.ancorado_em:
            suspeitas[classe] = "sem ancora: a justificativa afirma capacidade sem data de verificacao"
            continue
        try:
            ancora = date.fromisoformat(rota.ancorado_em)
        except ValueError:
            suspeitas[classe] = f"ancora ilegivel: {rota.ancorado_em!r} nao e ISO YYYY-MM-DD"
            continue
        idade = (hoje - ancora).days
        if idade > ttl_dias:
            citados = ", ".join(rota.modelos_citados) or "nao declarados"
            suspeitas[classe] = (
                f"ancora com {idade} dias (teto {ttl_dias}). Reconferir capacidade e preco de: {citados}"
            )

    return suspeitas


def ordem_de_consumo() -> list[tuple[Faixa, list[ClasseTarefa]]]:
    """Classes agrupadas por faixa, na ordem da Economia Generalizada."""
    por_faixa: dict[Faixa, list[ClasseTarefa]] = {}
    for classe, rota in ROTAS.items():
        por_faixa.setdefault(rota.faixa, []).append(classe)
    return sorted(por_faixa.items(), key=lambda kv: PRECEDENCIA_FAIXA[kv[0]])


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

    `multiplicador_raciocinio` corrige o ponto cego da formula: tokens de
    raciocinio sao cobrados como saida e podem dominar o total. Explicito em vez
    de default silencioso e otimista.
    """
    if not 0.0 <= taxa_sucesso <= 1.0:
        raise ValueError("taxa_sucesso deve estar entre 0 e 1.")
    if latencia_s <= 0:
        raise ValueError("latencia_s deve ser positiva.")
    custo_val = custo_estimado(alias, tokens_in, int(tokens_out * multiplicador_raciocinio))
    if custo_val <= 0:
        raise ValueError(f"Custo nao positivo para {alias}.")
    return taxa_sucesso / (custo_val * latencia_s)


def economia_do_escalonamento(
    classe: ClasseTarefa,
    *,
    chamadas: int,
    tokens_in: int,
    tokens_out: int,
    fracao_escalada: float,
) -> dict[str, float]:
    """Compara escalonamento contra usar o modelo caro em tudo."""
    rota = ROTAS[classe]
    caro = rota.escalona_para or rota.fallback
    barato = rota.primario

    c_barato = custo(barato, tokens_in, tokens_out)
    c_caro = custo(caro, tokens_in, tokens_out)

    if c_caro <= 0:
        # Ambos em faixa local: nao ha gasto de API a comparar.
        return {
            "custo_tudo_caro": 0.0,
            "custo_escalonado": 0.0,
            "economia": 0.0,
            "economia_pct": 0.0,
            "fracao_de_equilibrio": 1.0,
            "vale_a_pena": True,
        }

    tudo_caro = chamadas * c_caro
    escalonado = chamadas * c_barato + chamadas * fracao_escalada * c_caro
    limiar = 1.0 - (c_barato / c_caro)

    return {
        "custo_tudo_caro": round(tudo_caro, 4),
        "custo_escalonado": round(escalonado, 4),
        "economia": round(tudo_caro - escalonado, 4),
        "economia_pct": round(100 * (1 - escalonado / tudo_caro), 1) if tudo_caro else 0.0,
        "fracao_de_equilibrio": round(limiar, 4),
        "vale_a_pena": fracao_escalada < limiar,
    }


# ==============================================================================
# TIMEOUT PARA RACIOCINIO ESTENDIDO
# ==============================================================================


def timeout_recomendado(alias: str, *, max_tokens: int = 16_000) -> int:
    """Segundos de timeout para o worker assincrono.

    Recomendacao 3 do estudo: modos de raciocinio profundo levam minutos numa
    unica requisicao, e um socket fechado no meio descarta o trabalho ja pago.
    O default de 10 minutos dos SDKs e curto para efeito `xhigh`/`max` com
    saida grande.

    Deriva da capacidade declarada em vez de numero magico: modelos com
    `requires_streaming_above` sao os que geram saidas longas.
    """
    cap = get(alias)
    base = 600
    if cap.effort in ("xhigh", "max") or cap.reasoning_effort == "max":
        base = 1800
    if cap.requires_streaming_above and max_tokens > cap.requires_streaming_above:
        base = max(base, 2400)
    return base


# ==============================================================================
# PRUNING DINAMICO DE FERRAMENTAS
# ==============================================================================


def plano_de_ferramentas(
    ferramentas: list[dict],
    relevantes: set[str],
    *,
    limiar_defer: int = 8,
) -> list[dict]:
    """Marca ferramentas irrelevantes com `defer_loading`, preservando o cache.

    Mecanismo real por tras do insight de pruning dinamico: `tool_search` com
    `defer_loading: true`. Regras duras da API  a ferramenta de busca nunca e
    diferida, e nunca se difere tudo.
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

    if carregadas == 0:
        saida[0] = {k: v for k, v in saida[0].items() if k != "defer_loading"}
    return saida


def avaliar_uso_condicional_pro(
    *,
    complexidade_formal: bool,
    ganho_qualidade_esperado_pct: float,
    tokens_in: int = 4000,
    tokens_out: int = 1000,
) -> dict[str, Any]:
    """Avalia se o Gemini 3.1 Pro deve ser utilizado no lugar do Gemini 3.7 Flash.

    Regra de Ouro do Operador:
    Gemini 3.1 Pro so deve ser acionado EVENTUALMENTE se o ganho de qualidade
    superar CONCRETAMENTE o diferencial de custo/tokens. Caso contrario, o
    Gemini 3.7 Flash prevalece.
    """
    custo_flash = custo("gemini-3.7-flash", tokens_in, tokens_out)
    custo_pro = custo("gemini-3.1-pro", tokens_in, tokens_out)

    aprovado = complexidade_formal and (ganho_qualidade_esperado_pct >= 25.0)
    modelo_escolhido = "gemini-3.1-pro" if aprovado else "gemini-3.7-flash"

    motivo = (
        f"Alta complexidade matematica/axiomatica com ganho concreto de {ganho_qualidade_esperado_pct:.1f}% justificando o custo."
        if aprovado
        else f"Eficiencia de custo x beneficio: Gemini 3.7 Flash supre a tarefa com menor latencia (ganho de {ganho_qualidade_esperado_pct:.1f}% nao justifica o overhead)."
    )

    return {
        "modelo_escolhido": modelo_escolhido,
        "aprovado_pro": aprovado,
        "beneficio_estimado_pct": ganho_qualidade_esperado_pct if aprovado else 0.0,
        "motivo": motivo,
        "custo_flash": round(custo_flash, 6),
        "custo_pro": round(custo_pro, 6),
    }


__all__ = [
    "ClasseTarefa",
    "TierAgente",
    "Faixa",
    "PRECEDENCIA_FAIXA",
    "Rota",
    "Origem",
    "Decisao",
    "ForaDaAutoridadeDaPolitica",
    "ROTAS",
    "AGENTES",
    "SUBAGENTES",
    "CONFLITOS_MANIFESTO",
    "decidir",
    "rotear",
    "rota_de",
    "cobertura",
    "rotas_suspeitas",
    "TTL_ROTA_DIAS",
    "ordem_de_consumo",
    "estimar_roi",
    "economia_do_escalonamento",
    "timeout_recomendado",
    "plano_de_ferramentas",
    "avaliar_uso_condicional_pro",
]
