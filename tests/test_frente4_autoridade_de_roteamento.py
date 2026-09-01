"""Detector da frente 4: a autoridade de roteamento, e o que a decisao travou.

## Como esta frente chegou aqui

O plano 2-B enquadrou a frente 4 como *"decidir qual das duas e a autoridade:
`llm/routing_policy.py` (declarada) ou `llm/routing.py` (executada)"*. A medicao
de 2026-08-28 mostrou que o enquadramento era um **falso dilema**: as duas
funcoes de entrada tem tipos diferentes. `rotear` e `str -> str` e responde
*qual modelo*; `_reorder_models_for_economy` e `list -> list` e responde *em que
ordem tentar os que ja recebi*. Nao competem -- estao em SERIE.

A pergunta real era outra: **o caminho quente consulta a politica?** Nao
consultava. `AGENT_MODEL_MAP` era resolvido em `core/config.py` e lido so pela
auditoria mensal e por dois testes, enquanto quatro consumidores de producao
liam `primary_model` do manifesto direto. Divergencia: **19 de 19 agentes**, e
**13 de 13 subagentes** numa segunda superficie.

## A decisao do operador, 2026-08-28

- **Agentes:** a politica e a autoridade. O caminho quente resolve por
  `core.config.modelo_do_agente`, fonte unica dos quatro consumidores.
- **Subagentes:** a tabela local de `core/subagents_mesh.py` e a autoridade, e o
  invariante e **custo zero**. A politica deixou de atribuir modelo a subagente
  e levanta `ForaDaAutoridadeDaPolitica`.
- **`gemma4`:** alias do manifesto corrigido para `gemma4:12b`.

Em cada superficie havia duas fontes para o mesmo fato. A saida foi **apagar a
segunda**, nunca mante-las em acordo -- duas fontes divergem por construcao.

## O que estes testes fazem

Comparam a arvore com `data/ESTADO_DE_ROTEAMENTO.json`. Antes da decisao eles
fixavam a divergencia para que ligar a politica NAO passasse despercebido; agora
fixam as invariantes que a decisao criou. Se um falhar, alguma coisa saiu do
combinado: **atualize a declaracao e o registro no mesmo commit, nunca afrouxe o
teste.**

Limite declarado: a varredura de leitores de `AGENT_MODEL_MAP` percorre a AST e
acha referencia de CODIGO ao identificador -- comentario e docstring nao contam,
e arquivo que nao parseia vira falha explicita em vez de ausencia silenciosa.
Acesso montado em tempo de execucao (`getattr` com nome computado) continua fora
do alcance de qualquer varredura estatica. Medido em 2026-08-28: nao existe
nesta base -- nem import estrela de `core.config`, nem `getattr` sobre um alias
de config para esta chave. O teste confere as duas formas; nome inteiramente
computado, nao.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name

import ast
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
    "Se isto falhou porque o roteamento MUDOU, a decisao da frente 4 foi "
    "revista: atualize data/ESTADO_DE_ROTEAMENTO.json e o registro "
    "reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md no mesmo commit."
)

# Diretorios que nao sao codigo deste projeto.
IGNORADOS = {".venv", "node_modules", "__pycache__", ".git", ".pytest_cache", "dist", "build", "vendor"}

# `getattr` cujo SEGUNDO argumento nomeia um mapa de modelo. Montado a partir de
# pedacos porque o padrao descreve a coisa que procura: escrito inteiro, este
# arquivo casaria consigo mesmo, e isentar o arquivo cria ponto cego no unico
# lugar que descreve o alcance da varredura.
_GETATTR_DE_MAPA = re.compile(r"getattr\s*\(\s*\w+\s*,\s*[\"'][^\"']*" + "MODEL_" + r"MAP[^\"']*[\"']")


@pytest.fixture(scope="module")
def declaracao() -> dict:
    return json.loads(DECLARACAO.read_text(encoding="utf-8"))


def _fontes_python() -> list[Path]:
    return [p for p in RAIZ.rglob("*.py") if not set(p.parts) & IGNORADOS]


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
        f"_reorder_models_for_economy deixou de devolver lista: {quente.return_annotation!r}. {PISTA}"
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


def test_leitores_de_agent_model_map_batem_com_a_declaracao(declaracao):
    """Quem toca o mapa fica visivel. Um leitor novo -- em qualquer direcao --
    faz este teste falhar e obriga a declarar o papel dele.

    A medicao passou por duas correcoes, e as duas sao a mesma licao:

    1. **Substring nao e referencia.** `SUBAGENT_MODEL_MAP` contem
       `AGENT_MODEL_MAP`, e a primeira versao acusou `core/subagents_mesh.py` de
       leitor. Sao mapas de superficies diferentes.
    2. **Texto nao e codigo.** Com fronteira de palavra, a versao seguinte
       acusou `llm/orchestrator.py`, que so CITA o nome num comentario
       explicando por que passou a usar `modelo_do_agente`. Decima quinta vez
       que um detector desta base precisa separar citar de afirmar.

    A saida das duas foi a mesma: medir a coisa certa. `ast` ve referencia de
    CODIGO -- comentario e docstring simplesmente nao viram no `Name` nem no
    `Attribute`. Nao ha isencao de arquivo nenhum."""
    chave = "AGENT_MODEL" + "_MAP"
    medidos, ilegiveis = set(), []
    for arquivo in _fontes_python():
        try:
            arvore = ast.parse(arquivo.read_text(encoding="utf-8", errors="ignore"))
        except SyntaxError:
            # Arquivo que nao parseia esconderia um leitor em silencio, entao
            # ele vira falha explicita em vez de ausencia.
            ilegiveis.append(_rel(arquivo))
            continue
        for no in ast.walk(arvore):
            nome = no.attr if isinstance(no, ast.Attribute) else getattr(no, "id", None)
            if nome == chave:
                medidos.add(_rel(arquivo))
                break

    assert not ilegiveis, f"nao parseou, e um leitor poderia estar escondido ai: {ilegiveis}"

    declarados = {e["caminho"] for e in declaracao["consumidores_de_AGENT_MODEL_MAP"]["leitores"]}

    assert medidos == declarados, (
        f"leitores a mais: {sorted(medidos - declarados)}; leitores a menos: {sorted(declarados - medidos)}. {PISTA}"
    )


def test_o_mapa_tem_exatamente_uma_porta_de_producao(declaracao):
    """Antes da decisao este teste era o oposto: exigia que NENHUM leitor fosse
    de producao, porque nenhum era. Agora exige que a porta seja UMA.

    Producao chega ao mapa por `core.config.modelo_do_agente` e por mais nada;
    os outros leitores sao relatorio e teste. Quatro consumidores lendo o mapa
    direto seria a mesma pluralidade que a decisao veio desfazer."""
    leitores = declaracao["consumidores_de_AGENT_MODEL_MAP"]["leitores"]
    portas = [e for e in leitores if "fonte unica" in e["papel"]]
    assert len(portas) == 1, f"portas de producao declaradas: {portas}. {PISTA}"
    assert portas[0]["caminho"] == "core/config.py", PISTA

    outros = {e["papel"] for e in leitores if e not in portas}
    assert outros <= {"relatorio", "teste"}, f"leitor de papel inesperado: {sorted(outros)}. {PISTA}"


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
#  3. A concordancia medida, fixada como numero declarado
# ---------------------------------------------------------------------------


def test_o_caminho_quente_segue_a_politica(declaracao):
    """Deriva a contagem em vez de cita-la. Antes da decisao esta assercao era o
    contrario -- 19 de 19 DIVERGIAM. Falha nos dois sentidos."""
    medido = declaracao["o_que_foi_medido"]
    manifesto = cfg.AGENTS_MANIFEST

    segue = sum(1 for n in manifesto if cfg.modelo_do_agente(n) == cfg.AGENT_MODEL_MAP.get(f"@{n}"))
    diverge = len(manifesto) - segue

    assert len(manifesto) == medido["agentes_no_manifesto"], PISTA
    assert len(cfg.AGENT_MODEL_MAP) == medido["agentes_em_AGENT_MODEL_MAP"], PISTA
    assert segue == medido["agentes_em_que_o_caminho_quente_SEGUE_a_politica"], (
        f"seguem medido {segue}, declarado {medido['agentes_em_que_o_caminho_quente_SEGUE_a_politica']}. {PISTA}"
    )
    assert diverge == medido["agentes_em_que_DIVERGEM"], (
        f"divergencia medida {diverge}, declarada {medido['agentes_em_que_DIVERGEM']}. {PISTA}"
    )


def test_o_caminho_quente_deixou_de_colapsar_os_agentes(declaracao):
    """O defeito que a politica foi escrita para curar, medido onde ele existia:
    18 dos 19 agentes recebiam o mesmo modelo. Agora a distribuicao e por classe
    de tarefa, e a faixa orcamentaria de cada uma esta declarada."""
    medido = declaracao["o_que_foi_medido"]
    resolvidos = {cfg.modelo_do_agente(n) for n in cfg.AGENTS_MANIFEST}
    assert len(resolvidos) == medido["modelos_distintos_no_caminho_quente"], (
        f"o caminho quente resolve {len(resolvidos)} modelos distintos, declarado "
        f"{medido['modelos_distintos_no_caminho_quente']}: {sorted(str(r) for r in resolvidos)}. {PISTA}"
    )

    faixas: dict[str, int] = {}
    for nome in cfg.AGENTS_MANIFEST:
        faixa = rp.rota_de(nome).faixa.value
        faixas[faixa] = faixas.get(faixa, 0) + 1
    assert faixas == medido["faixa_por_agente"], (
        f"distribuicao por faixa medida {faixas}, declarada {medido['faixa_por_agente']}. {PISTA}"
    )

    zero = sum(q for f, q in faixas.items() if f in ("local", "gratuita"))
    assert zero == medido["custo_marginal_zero"], (
        f"agentes em custo marginal zero: medido {zero}, declarado {medido['custo_marginal_zero']}. {PISTA}"
    )


def test_a_precedencia_da_fonte_unica(declaracao):
    """Os degraus de `modelo_do_agente`. O override do operador vence a
    politica; a politica vence o manifesto."""
    assert len(declaracao["fonte_unica_do_caminho_quente"]["precedencia"]) == 3, PISTA
    assert cfg.modelo_do_agente("chico", override="modelo-cravado") == "modelo-cravado"
    assert cfg.modelo_do_agente("chico") == cfg.AGENT_MODEL_MAP["@chico"]
    assert cfg.modelo_do_agente("@chico") == cfg.AGENT_MODEL_MAP["@chico"]


def test_o_degrau_de_seguranca_avisa(caplog, monkeypatch):
    """Cair no `primary_model` do manifesto e anomalia, nao operacao normal.
    Rede de seguranca silenciosa e a falha caracteristica desta base."""
    monkeypatch.setattr(cfg, "AGENT_MODEL_MAP", {})
    monkeypatch.setattr(cfg, "AGENTS_MANIFEST", {"fantasma": {"primary_model": "modelo-y"}})
    monkeypatch.setattr(cfg, "_FALLBACK_JA_AVISADO", set())
    with caplog.at_level("WARNING"):
        assert cfg.modelo_do_agente("fantasma") == "modelo-y"
    assert any("nao esta em AGENT_MODEL_MAP" in r.getMessage() for r in caplog.records), (
        "o degrau de seguranca ficou silencioso. " + PISTA
    )


def test_os_consumidores_declarados_usam_a_fonte_unica(declaracao):
    """Declaracao sem verificacao e a metade que sempre falta nesta base: os
    quatro caminhos declarados tem de chamar `modelo_do_agente` de fato."""
    for entrada in declaracao["fonte_unica_do_caminho_quente"]["consumidores"]:
        arquivo = RAIZ / entrada["caminho"]
        assert arquivo.exists(), f"{entrada['caminho']} sumiu. {PISTA}"
        assert "modelo_do_agente(" in arquivo.read_text(encoding="utf-8", errors="ignore"), (
            f"{entrada['caminho']} esta declarado como consumidor da fonte unica e nao a chama. {PISTA}"
        )


def test_ninguem_le_primary_model_direto_para_decidir_modelo():
    """`primary_model` continua no manifesto -- e a rede de seguranca de
    `_resolver_modelos` e de `modelo_do_agente`. O que nao pode voltar e
    consumidor lendo a chave DIRETO para decidir em que modelo rodar: era assim
    que existiam quatro decisores paralelos."""
    chave = '"primary' + '_model"'
    permitidos = {"core/config.py"}  # o resolvedor: e ele que TEM de ler a rede
    achados = {}
    for arquivo in _fontes_python():
        rel = _rel(arquivo)
        if rel.startswith("tests/") or rel in permitidos:
            continue
        for n, linha in enumerate(arquivo.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            if chave in linha and ".get(" in linha:
                achados[f"{rel}:{n}"] = linha.strip()
    assert not achados, (
        f"leitor direto de primary_model fora da fonte unica: {achados}. Use core.config.modelo_do_agente. {PISTA}"
    )


# ---------------------------------------------------------------------------
#  4. Aliases que nenhum registro conhece
# ---------------------------------------------------------------------------


def test_nenhum_alias_do_manifesto_fica_fora_de_todo_registro(declaracao):
    """A lista declarada esta vazia desde 2026-08-28. Cresce so por regressao."""
    orfaos = {
        m
        for d in cfg.AGENTS_MANIFEST.values()
        if (m := d.get("primary_model")) and m not in MODEL_REGISTRY and not rp.e_local(m)
    }
    declarados = {e["alias"] for e in declaracao["aliases_do_manifesto_ausentes_de_todo_registro"]["aliases"]}
    assert orfaos == declarados, (
        f"orfaos a mais: {sorted(orfaos - declarados)}; "
        f"resolvidos (atualize a declaracao): {sorted(declarados - orfaos)}. {PISTA}"
    )


def test_o_alias_corrigido_do_gemma4_nao_regride(declaracao):
    """Nome nao e natureza. O alias antigo era nomeacao de HuggingFace onde o
    runtime local usa Ollama, e os dois modulos o liam diferente -- a heuristica
    de `llm/routing.py` dizia 'local' pelo texto, `e_local` dizia que nao,
    consultando a frota. Agora manifesto e politica concordam."""
    correcoes = declaracao["aliases_do_manifesto_ausentes_de_todo_registro"]["corrigido_em_2026_08_28"]
    assert correcoes, "a correcao sumiu da declaracao. " + PISTA
    for correcao in correcoes:
        antigo, novo, agente = correcao["de"], correcao["para"], correcao["agente"]

        assert cfg.AGENTS_MANIFEST[agente]["primary_model"] == novo, PISTA
        assert cfg.modelo_do_agente(agente) == novo, PISTA
        assert rp.e_local(novo), f"{novo} saiu da frota local. {PISTA}"
        assert rp.custo(novo, 10_000, 2_000) == 0.0

        # E o alias antigo continua sendo o caso que os dois modulos leem
        # diferente. E por isso que ele nao podia ficar.
        assert _infer_provider_for_model(antigo) == "local"
        assert not rp.e_local(antigo)
        assert antigo not in MODEL_REGISTRY


# ---------------------------------------------------------------------------
#  5. Subagentes: custo zero, e a politica fora da autoridade
# ---------------------------------------------------------------------------


def test_subagente_e_sempre_custo_zero(declaracao):
    """Invariante do operador, travado onde a autoridade de fato mora. Sem copia
    da tabela: o teste le `SUBAGENT_MODEL_MAP` e exige frota local."""
    from core.subagents_mesh import SUBAGENT_MODEL_MAP  # noqa: PLC0415

    medido = declaracao["superficie_subagentes"]
    assert len(SUBAGENT_MODEL_MAP) == medido["tiers"], PISTA

    fora = sorted({m for m in SUBAGENT_MODEL_MAP.values() if not rp.e_local(m)})
    assert not fora, f"subagente fora da frota local: {fora}. {PISTA}"
    assert all(rp.custo(m, 10_000, 2_000) == 0.0 for m in SUBAGENT_MODEL_MAP.values())


def test_a_politica_recusa_atribuir_modelo_a_subagente(declaracao):
    """A segunda fonte foi apagada, nao sincronizada. Se `rotear` voltar a
    responder por um tier, as duas tabelas voltam a poder divergir -- e antes da
    decisao divergiam em 13 de 13."""
    medido = declaracao["superficie_subagentes"]
    assert medido["a_politica_atribui_modelo"] is False, PISTA

    so_tier = sorted(set(rp.SUBAGENTES) - set(rp.AGENTES))
    assert so_tier, "sem tier exclusivo nao ha o que este teste guarde. " + PISTA
    for alvo in so_tier:
        with pytest.raises(rp.ForaDaAutoridadeDaPolitica):
            rp.rotear(alvo)
        with pytest.raises(rp.ForaDaAutoridadeDaPolitica):
            rp.decidir(alvo)


def test_a_politica_ainda_classifica_o_subagente(declaracao):
    """Recusar MODELO nao e recusar CLASSE. `SUBAGENTES` continua declarando a
    classe de tarefa de cada tier, que e informacao diferente e legitima."""
    from core.subagents_mesh import SUBAGENT_MODEL_MAP  # noqa: PLC0415

    tiers = {t.value for t in SUBAGENT_MODEL_MAP}
    assert tiers <= set(rp.SUBAGENTES), f"tier sem classe declarada: {sorted(tiers - set(rp.SUBAGENTES))}. {PISTA}"
    assert rp.cobertura()["subagentes"] == declaracao["superficie_subagentes"]["tiers"], PISTA


def test_a_sobreposicao_de_nomes_resolve_como_agente(declaracao):
    """Quatro nomes existem nas duas familias. A recusa acima nao pode ter
    mudado a precedencia, que sempre foi AGENTES primeiro."""
    medido = declaracao["superficie_subagentes"]
    ambos = sorted(set(rp.SUBAGENTES) & set(rp.AGENTES))
    assert ambos == sorted(medido["nomes_que_sao_agente_E_tier"]), f"a sobreposicao medida e {ambos}. {PISTA}"
    for alvo in ambos:
        assert rp.rotear(alvo) == rp.rota_de(alvo).primario
