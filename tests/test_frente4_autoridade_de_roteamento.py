"""Detector da frente 4: a relacao entre os dois modulos de roteamento.

O plano 2-B enquadrou a frente 4 como *"decidir qual das duas e a autoridade:
`llm/routing_policy.py` (declarada) ou `llm/routing.py` (executada)"*. A medicao
de 2026-08-28 mostra que o enquadramento era um **falso dilema**: as duas
funcoes de entrada tem tipos diferentes e respondem perguntas diferentes.
`rotear` e `str -> str` e responde *qual modelo*; `_reorder_models_for_economy`
e `list -> list` e responde *em que ordem tentar os que ja recebi*. Duas funcoes
de tipos diferentes nao disputam a mesma autoridade.

A pergunta real e outra, e nenhuma leitura a teria dado: **o caminho quente
consulta a politica?** Medido por execucao: nao. `AGENT_MODEL_MAP` e resolvido
em `core/config.py`, e seus unicos leitores sao a auditoria mensal e dois
testes. O `llm/orchestrator.py` le `primary_model` direto do manifesto. Os 19
agentes divergem: 19 de 19.

`tests/test_routing_policy.py::test_core_config_expoe_modelo_concreto_por_agente`
guarda a metade de cima -- que `core.config` resolve o mapa. A docstring dele
conclui dai que *"o comportamento em execucao mudou"*, e essa conclusao nao se
sustenta: resolver o mapa e uma coisa, alguem le-lo e outra. Este arquivo e a
metade que faltava.

**Nenhum destes testes trava comportamento.** Todos comparam a arvore com
`data/ESTADO_DE_ROTEAMENTO.json`. Ligar a politica ao caminho quente FAZ estes
testes falharem -- de proposito: a decisao pendente e do vertice, e ela nao pode
ser tomada em silencio. Falhou? A decisao foi tomada: atualize a declaracao e o
registro da frente 4 no mesmo commit.

Limite declarado: a varredura de leitores acha referencia LEXICA ao
identificador. Acesso montado em tempo de execucao (`getattr` com nome
computado) esta fora do alcance. Medido em 2026-08-28: nao existe nesta base --
nem `from core.config import *`, nem `getattr` sobre um alias de config para
esta chave. O teste confere as duas formas; nome inteiramente computado, nao.
"""

from __future__ import annotations

import inspect
import json
import re
from pathlib import Path

import pytest

import core.config as cfg
from llm import routing_policy as rp
from llm.model_registry import MODEL_REGISTRY
from llm.routing import _infer_provider_for_model, _reorder_models_for_economy

RAIZ = Path(__file__).resolve().parent.parent
DECLARACAO = RAIZ / "data" / "ESTADO_DE_ROTEAMENTO.json"

PISTA = (
    "Se isto falhou porque o roteamento MUDOU, entao a decisao pendente da "
    "frente 4 foi tomada: atualize data/ESTADO_DE_ROTEAMENTO.json e o registro "
    "reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md no mesmo commit."
)

# Diretorios que nao sao codigo deste projeto.
IGNORADOS = {".venv", "node_modules", "__pycache__", ".git", ".pytest_cache", "dist", "build"}

# `getattr` cujo SEGUNDO argumento nomeia um mapa de modelo. Montado a partir de
# pedacos porque o padrao descreve a coisa que procura: escrito inteiro, este
# arquivo casaria consigo mesmo, e isentar o arquivo cria ponto cego no unico
# lugar que descreve o alcance da varredura.
_GETATTR_DE_MAPA = re.compile(r"getattr\s*\(\s*\w+\s*,\s*[\"'][^\"']*" + "MODEL_" + r"MAP[^\"']*[\"']")


@pytest.fixture(scope="module")
def declaracao() -> dict:
    return json.loads(DECLARACAO.read_text(encoding="utf-8"))


def _fontes_python() -> list[Path]:
    return [p for p in RAIZ.rglob("*.py") if not (set(p.parts) & IGNORADOS)]


def _rel(p: Path) -> str:
    return p.relative_to(RAIZ).as_posix()


# ---------------------------------------------------------------------------
#  1. As duas funcoes respondem perguntas diferentes -- o anti-falso-dilema
# ---------------------------------------------------------------------------


def test_as_duas_entradas_tem_tipos_diferentes():
    """A prova estrutural de que nao competem: uma devolve um modelo, a outra
    devolve a lista que recebeu. Se algum dia convergirem de tipo, a pergunta
    'qual e a autoridade' passa a fazer sentido -- e ai este teste avisa."""
    # Os dois modulos usam `from __future__ import annotations`, entao a anotacao
    # chega como STRING, nao como o tipo. Comparar com `is str` deu falso
    # negativo na primeira versao deste teste.
    politica = inspect.signature(rp.rotear)
    quente = inspect.signature(_reorder_models_for_economy)

    assert str(politica.return_annotation) == "str", (
        f"rotear deixou de devolver str: {politica.return_annotation!r}. {PISTA}"
    )
    assert "list" in str(quente.return_annotation), (
        f"_reorder_models_for_economy deixou de devolver lista: "
        f"{quente.return_annotation!r}. {PISTA}"
    )

    primeiro_da_politica = next(iter(politica.parameters.values()))
    primeiro_do_quente = next(iter(quente.parameters.values()))
    assert str(primeiro_da_politica.annotation) == "str"
    assert "list" in str(primeiro_do_quente.annotation)


def test_o_reordenador_nunca_inventa_modelo():
    """`llm/routing.py` PERMUTA e FILTRA; nao cria alias. E o que o impede de
    ser uma segunda politica: nao ha nada nele que possa nomear um modelo que
    nao lhe tenham dado. `_inject_openrouter_alternatives` acrescenta -- por
    isso nao esta aqui, e por isso a fonte dele e configuracao declarada."""
    entrada = ["gemini-3.5-flash-lite", "claude-sonnet-5", "gemma4:12b"]
    saida = _reorder_models_for_economy(list(entrada), prefer_local=True)
    assert set(saida) <= set(entrada), f"o reordenador inventou {set(saida) - set(entrada)}"


# ---------------------------------------------------------------------------
#  2. Quem consome a saida da politica
# ---------------------------------------------------------------------------


def test_leitores_de_AGENT_MODEL_MAP_batem_com_a_declaracao(declaracao):
    """O detector que forca a decisao a aparecer. Ligar o orchestrator a
    politica acrescenta um leitor, e este teste falha na hora."""
    # Fronteira de palavra, nao substring: `SUBAGENT_MODEL_MAP` contem
    # `AGENT_MODEL_MAP` e a primeira versao deste teste o acusou de leitor.
    # Sao mapas diferentes, de superficies diferentes -- ver
    # test_a_mesma_desconexao_se_repete_nos_subagentes.
    chave = re.compile(r"\bAGENT_MODEL" + r"_MAP\b")
    medidos = {_rel(p) for p in _fontes_python() if chave.search(p.read_text(encoding="utf-8", errors="ignore"))}
    medidos.add(_rel(Path(__file__)))  # este arquivo le o mapa pelo atributo

    declarados = {e["caminho"] for e in declaracao["consumidores_de_AGENT_MODEL_MAP"]["leitores"]}

    assert medidos == declarados, (
        f"leitores a mais: {sorted(medidos - declarados)}; "
        f"leitores a menos: {sorted(declarados - medidos)}. {PISTA}"
    )


def test_nenhum_leitor_da_politica_e_de_producao(declaracao):
    """A afirmacao central da frente 4. Os papeis vem da declaracao; o teste so
    confere que nenhum deles e 'roteamento de producao'."""
    papeis = {e["papel"] for e in declaracao["consumidores_de_AGENT_MODEL_MAP"]["leitores"]}
    assert papeis <= {"escritor", "relatorio", "teste"}, (
        f"a politica ganhou consumidor de producao: {sorted(papeis)}. {PISTA}"
    )


def test_nao_existe_acesso_dinamico_a_configuracao():
    """Sustenta o limite declarado na docstring do modulo: a varredura lexica so
    vale enquanto ninguem alcancar a config por caminho que grep nao ve."""
    # Estreitado por FORMA duas vezes, e as duas versoes anteriores eram sinal
    # verde desconectado deste mesmo tipo:
    #
    # (a) import estrela casava por substring e reprovava a docstring deste
    #     modulo, que cita a forma para dizer que ela nao existe -- decima
    #     segunda vez que um detector desta base precisa separar citar de
    #     afirmar. Agora exige que a linha ABRA com a declaracao.
    # (b) o acesso dinamico media "o arquivo contem getattr E contem MODEL em
    #     algum lugar" -- dois fatos independentes co-ocorrendo. O nome dizia
    #     "acesso dinamico a mapa de modelo" e a grandeza medida era outra;
    #     acusou `getattr(te, "_c", ...)` em worker/loop.py, que busca uma
    #     funcao de cor. Agora o padrao exige o mapa DENTRO da chamada.
    #
    # Nos dois casos a saida foi estreitar por estrutura, nunca isentar arquivo.
    estrela, dinamico = [], []
    alvo_estrela = "from core.config import " + "*"
    for p in _fontes_python():
        texto = p.read_text(encoding="utf-8", errors="ignore")
        if any(linha.strip().startswith(alvo_estrela) for linha in texto.splitlines()):
            estrela.append(_rel(p))
        for achado in _GETATTR_DE_MAPA.findall(texto):
            dinamico.append(f"{_rel(p)} ({achado})")
    assert not estrela, f"import estrela de core.config: {estrela}. {PISTA}"
    assert not dinamico, f"acesso dinamico a mapa de modelo: {dinamico}. {PISTA}"


# ---------------------------------------------------------------------------
#  3. A divergencia medida, fixada como numero declarado
# ---------------------------------------------------------------------------


def test_divergencia_entre_politica_e_caminho_quente(declaracao):
    """Deriva a contagem em vez de cita-la, e compara com a declaracao. Falha
    nos DOIS sentidos: se alguem ligar a politica (divergencia cai) ou se o
    manifesto mudar (divergencia muda de forma)."""
    medido = declaracao["o_que_foi_medido"]
    mapa, manifesto = cfg.AGENT_MODEL_MAP, cfg.AGENTS_MANIFEST

    concordam = sum(1 for n, d in manifesto.items() if mapa.get(f"@{n}") == d.get("primary_model"))
    divergem = len(manifesto) - concordam

    assert len(manifesto) == medido["agentes_no_manifesto"], PISTA
    assert len(mapa) == medido["agentes_em_AGENT_MODEL_MAP"], PISTA
    assert concordam == medido["agentes_em_que_a_politica_e_o_caminho_quente_CONCORDAM"], (
        f"concordancia medida {concordam}, declarada "
        f"{medido['agentes_em_que_a_politica_e_o_caminho_quente_CONCORDAM']}. {PISTA}"
    )
    assert divergem == medido["agentes_em_que_DIVERGEM"], (
        f"divergencia medida {divergem}, declarada {medido['agentes_em_que_DIVERGEM']}. {PISTA}"
    )


def test_o_caminho_quente_colapsa_os_agentes_e_a_politica_nao(declaracao):
    """O defeito que a politica foi escrita para curar, medido no lugar onde ela
    nao chega: o manifesto ainda da quase o mesmo modelo aos 19 agentes."""
    medido = declaracao["o_que_foi_medido"]
    da_politica = {m for m in cfg.AGENT_MODEL_MAP.values() if m}
    do_quente = {d.get("primary_model") for d in cfg.AGENTS_MANIFEST.values() if d.get("primary_model")}

    assert len(da_politica) == medido["modelos_distintos_que_a_politica_atribui"], PISTA
    assert len(do_quente) == medido["modelos_distintos_que_o_caminho_quente_atribui"], PISTA
    assert len(do_quente) < len(da_politica), (
        "o caminho quente deixou de ser o lado colapsado -- releia a frente 4. " + PISTA
    )


# ---------------------------------------------------------------------------
#  4. Aliases que nenhum registro conhece
# ---------------------------------------------------------------------------


def test_aliases_orfaos_do_manifesto_batem_com_a_declaracao(declaracao):
    """Consertar um destes faz o teste falhar. E o desenho: a lista encolhe por
    decisao registrada, nunca por acaso."""
    orfaos = {
        m
        for d in cfg.AGENTS_MANIFEST.values()
        if (m := d.get("primary_model")) and m not in MODEL_REGISTRY and not rp.e_local(m)
    }
    declarados = {e["alias"] for e in declaracao["aliases_do_manifesto_ausentes_de_todo_registro"]["aliases"]}
    assert orfaos == declarados, (
        f"orfaos a mais: {sorted(orfaos - declarados)}; "
        f"consertados (atualize a declaracao): {sorted(declarados - orfaos)}. {PISTA}"
    )


def test_a_mesma_desconexao_se_repete_nos_subagentes(declaracao):
    """Segunda superficie, e ela INVERTE o sinal da frente 4.

    `core/subagents_mesh.SUBAGENT_MODEL_MAP` e a tabela executada e e toda de
    frota local -- custo marginal zero. `routing_policy.SUBAGENTES` cobre os
    mesmos 13 tiers e roteia para nuvem paga. Aqui nao vale dizer que a politica
    e a resposta certa esperando fio: ligar a politica nesta superficie TROCARIA
    custo zero por API paga. Por isso a decisao e por superficie."""
    from core.subagents_mesh import SUBAGENT_MODEL_MAP, SubagentTier  # noqa: PLC0415

    medido = declaracao["segunda_superficie_subagentes"]
    executado = {t.value: m for t, m in SUBAGENT_MODEL_MAP.items()}
    declarado = {k: rp.rotear(k) for k in rp.SUBAGENTES}

    assert set(executado) == set(declarado), (
        "as duas tabelas deixaram de cobrir os mesmos tiers: "
        f"so na executada {sorted(set(executado) - set(declarado))}, "
        f"so na politica {sorted(set(declarado) - set(executado))}. {PISTA}"
    )
    assert len(declarado) == medido["tiers"], PISTA

    concordam = sum(1 for k in declarado if executado[k] == declarado[k])
    assert concordam == medido["tiers_em_que_CONCORDAM"], (
        f"concordancia medida {concordam}, declarada {medido['tiers_em_que_CONCORDAM']}. {PISTA}"
    )

    if medido["a_executada_e_toda_local"]:
        nao_locais = sorted(m for m in executado.values() if not rp.e_local(m))
        assert not nao_locais, (
            f"a tabela executada de subagentes saiu da frota local: {nao_locais}. {PISTA}"
        )

    assert isinstance(SubagentTier.SELF.value, str)


def test_os_dois_modulos_discordam_sobre_o_que_e_local(declaracao):
    """Nome nao e natureza, quarta instancia nesta base -- e a primeira em que os
    DOIS modulos de roteamento discordam sobre a mesma string. A heuristica de
    `llm/routing.py` le o texto do alias; `e_local` consulta a frota declarada
    em data/ollama_models.json. Para 'google/gemma-4-e2b-it' dao respostas
    opostas."""
    for entrada in declaracao["aliases_do_manifesto_ausentes_de_todo_registro"]["aliases"]:
        alias = entrada["alias"]
        por_heuristica = _infer_provider_for_model(alias) == "local"
        por_declaracao = rp.e_local(alias)
        assert por_heuristica != por_declaracao, (
            f"os dois modulos passaram a concordar sobre {alias!r} "
            f"(heuristica={por_heuristica}, frota declarada={por_declaracao}). {PISTA}"
        )
