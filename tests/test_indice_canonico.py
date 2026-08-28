"""Guarda do indice canonico de governanca -- entregavel da frente 1 do plano 2-B.

O indice existe porque "qual copia manda?" era respondido por intuicao, e
intuicao ja errou aqui: presumir orfao e remover quebrou a toolchain, e concluir
"fork com trabalho perdido" a partir de `cmp` e `mtime` classificou 8 submodulos
git como copias.

O que estes testes afirmam e so o que NAO decai:

  - existencia dos caminhos declarados;
  - unicidade do canonico de cada familia;
  - a regra de nomeacao, medida contra a arvore real;
  - a pertinencia ao corpus do RAG, medida com o coletor REAL do memory_rag.

O que eles deliberadamente NAO afirmam: bytes e numeros de linha. Sao medicao, e
medicao vale na configuracao medida -- transforma-la em estrutura produz portao
que reprova por edicao legitima. O numero de linha do consumidor em nexus.py ja
andou de 2156 para 2172 nesta mesma semana.
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent          # .../Site
INDICE = RAIZ / "data" / "INDICE_CANONICO_GOVERNANCA.json"

CAMPOS_OBRIGATORIOS = (
    "id",
    "medido_em",
    "raiz",
    "tipos_de_consumidor",
    "familias",
    "regra_de_nomeacao",
    "nao_verificado",
)


def _indice() -> dict:
    return json.loads(INDICE.read_text(encoding="utf-8"))


def _raiz_multiprojeto() -> Path | None:
    """A raiz declarada na secao 1 do CLAUDE.md, ou None se nao reconhecida.

    Resolucao por ambiente com fallback estrutural, nunca por literal absoluto:
    `CLAUDE.md` secao 1 regra 3 proibe que um projeto alcance irmao por caminho
    literal. Devolver None faz o teste PULAR com motivo, que e honesto; passar
    em silencio quando a raiz nao existe seria mais um sinal verde desconectado.
    """
    declarada = os.environ.get("GEMINI_ROOT")
    if declarada:
        candidata = Path(declarada)
        return candidata if candidata.is_dir() else None
    pai = RAIZ.parent
    return pai if pai.name == ".gemini" else None


def _nome_do_projeto() -> str:
    """O nome CANONICO do projeto, declarado no indice -- nunca `RAIZ.name`.

    Os caminhos do indice comecam por `Site/` porque enderecam a partir da raiz
    multiprojeto. Deduzir esse prefixo do nome do DIRETORIO quebra em qualquer
    arvore que nao se chame Site, e a suite isolada cria worktrees chamados
    `suite-isolada-Site-<pid>-<epoch>`. Tres testes reprovaram por isso.
    Nome canonico e dado declarado; nome de diretorio e acidente do sistema de
    arquivos.
    """
    return _indice().get("projeto", "Site")


def _resolver(caminho: str) -> Path | None:
    """Onde um caminho do indice aterrissa NESTA arvore, ou None se indecidivel.

    Caminho do proprio projeto resolve contra RAIZ, seja qual for o nome do
    diretorio. Caminho de irmao so resolve quando a raiz multiprojeto existe --
    fora dela, None, e quem chama PULA com motivo em vez de reprovar.
    """
    prefixo = f"{_nome_do_projeto()}/"
    if caminho.startswith(prefixo):
        return RAIZ / caminho[len(prefixo) :]
    raiz = _raiz_multiprojeto()
    return (raiz / caminho) if raiz else None


def _membros(indice: dict) -> list[tuple[str, dict]]:
    return [(fam["basename"], m) for fam in indice["familias"] for m in fam["membros"]]


# --------------------------------------------------------------------------
# estrutura
# --------------------------------------------------------------------------


def test_indice_existe_e_declara_os_campos_obrigatorios():
    assert INDICE.is_file(), f"indice canonico ausente: {INDICE}"
    indice = _indice()
    faltando = [c for c in CAMPOS_OBRIGATORIOS if c not in indice]
    assert not faltando, f"campos obrigatorios ausentes do indice: {faltando}"


def test_cada_familia_tem_exatamente_um_canonico_e_ele_e_membro():
    """Familia sem canonico nao decide nada; com dois, decide errado em silencio."""
    for fam in _indice()["familias"]:
        caminhos = [m["caminho"] for m in fam["membros"]]
        assert fam.get("canonico"), f"familia {fam['basename']} sem canonico declarado"
        assert fam["canonico"] in caminhos, (
            f"o canonico de {fam['basename']} ({fam['canonico']}) nao esta entre seus membros: {caminhos}"
        )
        assert fam.get("razao_do_canonico"), (
            f"familia {fam['basename']}: canonico declarado sem razao. "
            "Declaracao sem evidencia e a arbitrariedade que o indice existe para evitar."
        )


def test_nenhum_membro_declarado_duas_vezes():
    """Colisao de chave nao aparece como ausencia -- aparece como sucesso."""
    caminhos = [m["caminho"] for _, m in _membros(_indice())]
    duplicados = {c for c in caminhos if caminhos.count(c) > 1}
    assert not duplicados, f"caminho declarado em mais de uma familia: {sorted(duplicados)}"


# --------------------------------------------------------------------------
# existencia
# --------------------------------------------------------------------------


def test_membros_dentro_do_repositorio_existem():
    """Sempre exigivel: nao depende da raiz multiprojeto estar montada."""
    prefixo = f"{_nome_do_projeto()}/"
    ausentes = [
        m["caminho"]
        for _, m in _membros(_indice())
        if m["caminho"].startswith(prefixo) and not (RAIZ / m["caminho"][len(prefixo) :]).is_file()
    ]
    assert not ausentes, f"membros declarados que nao existem no repositorio: {ausentes}"


def test_membros_fora_do_repositorio_existem():
    raiz = _raiz_multiprojeto()
    if raiz is None:
        pytest.skip(
            "raiz multiprojeto nao reconhecida (defina GEMINI_ROOT). "
            "Os membros fora de Site/ nao foram verificados -- verificacao nao "
            "executada nao e verificacao aprovada."
        )
    ausentes = [
        m["caminho"]
        for _, m in _membros(_indice())
        if not m["caminho"].startswith(f"{_nome_do_projeto()}/")
        and not (raiz / m["caminho"]).is_file()
    ]
    assert not ausentes, f"membros fora do repositorio que nao existem: {ausentes}"


def test_consumidores_de_codigo_declarados_apontam_para_arquivo_vivo():
    """A referencia morta e o modo de falha desta casa, e ela nunca grita.

    Confere o ARQUIVO e a mencao ao basename, nao a linha: linha e medicao.
    """
    quebrados: list[str] = []
    for basename, membro in _membros(_indice()):
        for consumidor in membro.get("consumidores", []):
            if not consumidor.startswith("codigo:"):
                continue
            alvo = consumidor.split(":", 1)[1].strip().split(" ")[0]
            arquivo_rel = alvo.rsplit(":", 1)[0]  # descarta o numero de linha
            caminho = _resolver(arquivo_rel)
            if caminho is None:
                continue  # consumidor em projeto irmao, sem raiz multiprojeto aqui
            if not caminho.is_file():
                quebrados.append(f"{arquivo_rel} (declarado como consumidor de {basename}) nao existe")
            elif basename not in caminho.read_text(encoding="utf-8", errors="ignore"):
                quebrados.append(f"{arquivo_rel} nao menciona mais {basename}")
    assert not quebrados, "consumidores declarados que envelheceram:\n  " + "\n  ".join(quebrados)


# --------------------------------------------------------------------------
# corpus do RAG -- medido com o coletor real, nao com uma replica
# --------------------------------------------------------------------------


def test_pertinencia_ao_corpus_do_rag_bate_com_o_coletor_real():
    import memory_rag

    manifesto = json.loads((RAIZ / "rag_ingestion_manifest.json").read_text(encoding="utf-8"))
    coletados = asyncio.run(
        memory_rag.MemoryRAG._collect_target_files_async(
            object.__new__(memory_rag.MemoryRAG), manifesto, RAIZ
        )
    )
    resolvidos = {p.resolve() for p in coletados}

    divergencias: list[str] = []
    for _, membro in _membros(_indice()):
        caminho = membro["caminho"]
        if not caminho.startswith(f"{_nome_do_projeto()}/"):
            continue
        declarado = membro.get("no_corpus_do_rag")
        alvo = _resolver(caminho)
        real = alvo is not None and alvo.resolve() in resolvidos
        if declarado != real:
            divergencias.append(f"{caminho}: indice diz {declarado}, o coletor diz {real}")
    assert not divergencias, "o indice descreve um corpus que nao e o coletado:\n  " + "\n  ".join(divergencias)


def test_a_barreira_de_traversal_do_manifesto_continua_de_pe():
    """O canonico da raiz esta FORA do corpus por seguranca, nao por esquecimento.

    Se esta barreira cair, a nota do indice ("inalcancavel por desenho") vira
    falsa e alguem pode 'corrigir' o corpus ampliando fronteira -- que e
    exatamente o contorno de portao que a governanca proibe.
    """
    import memory_rag

    escape = {"sources": [{"path": "..", "patterns": ["MODUS_OPERANDI.md"], "recursive": False}]}
    coletados = asyncio.run(
        memory_rag.MemoryRAG._collect_target_files_async(
            object.__new__(memory_rag.MemoryRAG), escape, RAIZ
        )
    )
    assert not coletados, (
        f"fonte que escapa a raiz coletou {len(coletados)} arquivo(s): a blindagem de LFI caiu"
    )


# --------------------------------------------------------------------------
# regra de nomeacao
# --------------------------------------------------------------------------


def _md_rastreados() -> list[str]:
    saida = subprocess.run(
        ["git", "ls-files", "*.md"],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        check=False,
    )
    if saida.returncode != 0:
        return []
    return [linha for linha in saida.stdout.splitlines() if linha.strip()]


def test_a_arvore_de_md_rastreados_foi_de_fato_lida():
    """Sem esta guarda, `git ls-files` devolvendo vazio faria o teste seguinte
    passar sem ler nada -- exatamente a falha que o arnes de mutacao teve, ao
    contar 'nenhum teste coletado' como aprovacao."""
    assert _md_rastreados(), "git ls-files nao devolveu nenhum .md: o teste de nomeacao seria vacuo"


def test_nenhum_homonimo_de_governanca_fora_do_indice():
    """A regra: basename de governanca so repete em RAIZ DE ESCOPO.

    Qualquer outro `.md` rastreado com esses nomes tem de estar declarado -- como
    membro, como contexto de componente, ou por subarvore fora de alcance.
    """
    indice = _indice()
    regra = indice["regra_de_nomeacao"]
    basenames = {fam["basename"] for fam in indice["familias"]}

    declarados = {m["caminho"] for _, m in _membros(indice)}
    declarados |= {c["caminho"] for c in indice.get("contexto_de_componente_nao_e_governanca", [])}

    prefixos_isentos = tuple(
        p.replace("/**", "/")
        for grupo in regra["fora_do_alcance_da_regra"].values()
        if isinstance(grupo, list)
        for p in grupo
    )

    infratores = []
    for rel in _md_rastreados():
        if Path(rel).name not in basenames:
            continue
        completo = f"{_nome_do_projeto()}/{rel}"
        if completo in declarados:
            continue
        if rel.startswith(prefixos_isentos) or completo.startswith(prefixos_isentos):
            continue
        infratores.append(completo)

    assert not infratores, (
        "arquivo com basename de governanca nao declarado no indice:\n  "
        + "\n  ".join(infratores)
        + "\n\nDeclare-o em data/INDICE_CANONICO_GOVERNANCA.json com papel explicito, "
        "ou prefixe-o pelo escopo (<escopo>-GEMINI.md)."
    )


def test_a_regra_reconhece_mais_de_uma_grafia_de_chave_de_contexto():
    """O falso negativo que originou a regra: procurar UMA chave.

    O manifesto de extensao declara seu arquivo de contexto por pelo menos tres
    grafias. Detector que conhece so `contextFileName` trata arquivo legitimo de
    plugin como copia concorrente de governanca.
    """
    chaves = _indice()["chaves_de_contexto_do_manifesto"]["conhecidas"]
    assert len(chaves) >= 3, f"o indice voltou a conhecer poucas grafias: {chaves}"
    assert "contextFileName" in chaves and "context" in chaves and "contextPath" in chaves
