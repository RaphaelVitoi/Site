"""Guarda contra a reabertura do fork canonico / ponteiro de escopo de usuario.

Ate 2026-09-02, `~\\.gemini\\CLAUDE.md` (canonico da raiz multiprojeto) e
`~\\.claude\\CLAUDE.md` (escopo de usuario) eram BYTE A BYTE identicos --
SHA-256 `9074ba9d2078` nos dois. Divergiram no instante em que a raiz ganhou uma
secao, e nada acusou. E o mesmo mecanismo que o `test_governanca_agents.py`
documenta no caso do AGENTS.md: documento de governanca duplicado nao diverge SE
alguem descuidar, diverge POR PADRAO, porque a copia nao tem como saber que o
original mudou.

Pior: o canonico nao DECLARAVA o arquivo de escopo de usuario em lugar nenhum --
nem na arvore da secao 1, nem na tabela da secao 2. Defeito identico ao que o
AGENTS.md corrigiu em 2026-08-28.

Copiar o canonico sobre o ponteiro nao resolve: a secao 2 do canonico diz que
escopo de usuario "se aplica a tudo, inclusive a projetos que nada tem a ver".
Hierarquia de caminhos, taxonomia de artefatos e camada MCP NAO podem morar la.

O ponteiro carrega um piso de quatro proibicoes de classe irreversivel, porque
ele e o unico arquivo de governanca que carrega em sessoes abertas FORA de
`~\\.gemini` -- verificado por sondagem com o binario nativo em 2026-09-02. Duas
clausulas impedem esse piso de virar fork, e sao elas que esta guarda protege:
o canonico VENCE em qualquer divergencia, e a lista PODE ENCOLHER, NUNCA CRESCER.

Nenhum caminho absoluto literal aqui: a secao 1 regra 3 do canonico proibe que um
projeto alcance vizinho por literal. O canonico se deriva da posicao do proprio
repositorio, e o ponteiro de `Path.home()`; as duas variaveis de ambiente sao
override para host que organize a arvore de outro jeito.
"""

from __future__ import annotations

import hashlib
import os
import re
import unicodedata
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent

# Derivado, nunca literal. `Site` fica sob a raiz multiprojeto, entao o canonico
# e o CLAUDE.md do diretorio pai; o ponteiro de escopo de usuario nao e
# alcancavel por relatividade a partir daqui e vem de Path.home().
CANONICO = Path(os.environ.get("PMEV_GOVERNANCA_CANONICO") or (RAIZ.parent / "CLAUDE.md"))
PONTEIRO = Path(os.environ.get("PMEV_GOVERNANCA_PONTEIRO") or (Path.home() / ".claude" / "CLAUDE.md"))

# O fork tinha 4796 B nos dois arquivos. O ponteiro nasceu com 3067 B. Este teto
# da folga para redacao e barra MUITO antes de a copia voltar -- que e como o
# AGENTS.md quase voltou: por acrescimo gradual, nunca de uma vez.
TETO_DO_PONTEIRO = 4000

# A lista pode encolher, nunca crescer. Quatro e o valor de 2026-09-02.
PISO_MAXIMO_DE_PROIBICOES = 4


def _ler(p: Path) -> str:
    return p.read_text(encoding="utf-8-sig")


def _sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def _exigir(p: Path, papel: str) -> str:
    """Ausencia se declara, nao se aprova em silencio.

    A secao 5 do canonico: verificacao nao executada nao e verificacao aprovada.
    O skip carrega o caminho medido e a variavel que o corrige, para que o
    relatorio possa dizer POR QUE nao rodou.
    """
    if not p.is_file():
        pytest.skip(
            f"{papel} nao encontrado em {p}. Este host nao hospeda a raiz multiprojeto; "
            f"defina PMEV_GOVERNANCA_CANONICO / PMEV_GOVERNANCA_PONTEIRO para apontar a arvore real."
        )
    return _ler(p)


def test_os_dois_nao_voltaram_a_ser_a_mesma_copia():
    """O defeito exato: SHA-256 identico nos dois arquivos.

    Nao e teste de conteudo, e de IDENTIDADE. Enquanto os hashes divergirem,
    existem dois documentos com papeis distintos; iguais, existe um fork.
    """
    canonico = _exigir(CANONICO, "canonico da raiz")
    ponteiro = _exigir(PONTEIRO, "ponteiro de escopo de usuario")

    h_canonico = hashlib.sha256(canonico.encode("utf-8")).hexdigest()
    h_ponteiro = hashlib.sha256(ponteiro.encode("utf-8")).hexdigest()

    assert h_canonico != h_ponteiro, (
        f"canonico e ponteiro voltaram a ser byte a byte identicos (sha256 {h_canonico[:12]}). "
        "Foi exatamente este estado que divergiu sozinho em 2026-09-02."
    )


def test_o_ponteiro_continua_ponteiro():
    """O caminho de volta ao fork e o crescimento gradual, nao a copia de uma vez."""
    tamanho = len(_exigir(PONTEIRO, "ponteiro de escopo de usuario").encode("utf-8"))
    assert tamanho <= TETO_DO_PONTEIRO, (
        f"o ponteiro de escopo de usuario cresceu para {tamanho} B (teto {TETO_DO_PONTEIRO}). "
        "Governanca nova entra no canonico da raiz, nunca aqui."
    )


def test_o_ponteiro_aponta_para_o_canonico():
    texto = _sem_acento(_exigir(PONTEIRO, "ponteiro de escopo de usuario"))
    assert "ponteiro" in texto, "o arquivo de escopo de usuario nao se declara ponteiro"
    assert ".gemini" in texto and "claude.md" in texto, "o ponteiro perdeu a referencia ao canonico da raiz"


def test_as_duas_clausulas_anti_fork_seguem_escritas():
    """Sem elas o piso de seguranca vira um segundo documento de governanca."""
    texto = _sem_acento(_exigir(PONTEIRO, "ponteiro de escopo de usuario"))

    assert "canonico vence" in texto, (
        "o ponteiro perdeu a clausula de precedencia. Sem ela, uma divergencia "
        "entre piso e canonico nao tem arbitro, e o piso vira fork."
    )
    assert "nunca crescer" in texto, (
        "o ponteiro perdeu a clausula de crescimento. Foi crescendo que o "
        "AGENTS.md virou fork em 2026-08-26 e produziu duas referencias mortas."
    )


def _proibicoes_do_piso(texto: str) -> list[str]:
    """Os itens numerados sob a secao do piso de seguranca.

    Recorta a secao antes de contar: o documento tem outras listas numeradas, e
    contar o arquivo inteiro reprovaria por prosa que nao e proibicao.
    """
    inicio = re.search(r"^##\s+Piso de seguran", texto, re.M)
    if not inicio:
        return []
    resto = texto[inicio.end() :]
    proxima = re.search(r"^##\s", resto, re.M)
    secao = resto[: proxima.start()] if proxima else resto
    return re.findall(r"^\s*(\d+)\.\s+\*\*", secao, re.M)


def test_o_piso_pode_encolher_mas_nao_crescer():
    """A clausula escrita, exigida na pratica.

    Uma clausula que nenhum detector verifica e prosa. Este teste e o que faz a
    frase "pode encolher, nunca crescer" custar alguma coisa a quem a violar.
    """
    texto = _exigir(PONTEIRO, "ponteiro de escopo de usuario")
    proibicoes = _proibicoes_do_piso(texto)

    assert proibicoes, "a secao do piso de seguranca sumiu do ponteiro, ou deixou de ter itens numerados"
    assert len(proibicoes) <= PISO_MAXIMO_DE_PROIBICOES, (
        f"o piso do ponteiro cresceu para {len(proibicoes)} proibicoes (teto {PISO_MAXIMO_DE_PROIBICOES}). "
        "Regra nova de governanca entra no canonico da raiz."
    )


def test_o_canonico_declara_o_ponteiro():
    """O defeito que passou despercebido: o canonico nao citava o arquivo em lugar nenhum.

    Enquanto o canonico nao o nomeia, ninguem que leia so o canonico descobre
    que existe um segundo arquivo carregando em toda sessao.
    """
    texto = _sem_acento(_exigir(CANONICO, "canonico da raiz"))
    assert ".claude\\claude.md" in texto or ".claude/claude.md" in texto, (
        "o canonico da raiz voltou a nao declarar o ponteiro de escopo de usuario"
    )
    assert "ponteiro" in texto, "o canonico nao diz que o arquivo de escopo de usuario e ponteiro"


def test_conteudo_de_raiz_nao_migrou_para_o_escopo_de_usuario():
    """Escopo de usuario se aplica a TUDO, inclusive a projetos que nada tem a ver.

    Hierarquia de caminhos, taxonomia de artefatos e camada MCP sao da raiz. Se
    aparecerem no ponteiro, a fusao foi desfeita por copia.
    """
    ponteiro = _sem_acento(_exigir(PONTEIRO, "ponteiro de escopo de usuario"))
    canonico = _sem_acento(_exigir(CANONICO, "canonico da raiz"))

    # Marcas que pertencem exclusivamente ao canonico. A tabela de escopo do
    # ponteiro CITA os caminhos dos projetos, entao a marca tem de ser conteudo,
    # nao caminho: "catalogo mestre" e a camada MCP; "raiz multiprojeto" nomeia
    # a hierarquia, e o ponteiro so pode remete-la, nunca redigi-la.
    for marca in ("catalogo mestre", "mcp_config_all_archive"):
        assert marca in canonico, f"o canonico perdeu a marca de conteudo proprio: {marca}"
        assert marca not in ponteiro, (
            f"conteudo de raiz migrou para o escopo de usuario: {marca}. "
            "O ponteiro remete ao canonico; nao reproduz o que ele diz."
        )
