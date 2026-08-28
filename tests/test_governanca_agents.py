"""Guarda contra a reabertura do fork AGENTS.md / CLAUDE.md.

Entre 2026-08-24 e 2026-08-26, `Site/AGENTS.md` existiu como copia do
`Site/CLAUDE.md`. Em DOIS DIAS divergiu em tres pontos, dois deles falsos, ambos
nascidos de um search-replace mecanico de `claude` para `Codex`:

  - apontava para `..\\AGENTS.md`, que nao existia
  - dizia que os 19 documentos de agente ficam em `.Codex/agents/`, quando
    `sync_agents_reality.ps1:54` os escreve em `.claude/agents/`

Nenhuma das duas foi detectada por nada. Documento de governanca duplicado nao
diverge SE alguem descuidar: diverge POR PADRAO, porque a copia nao tem como
saber que o original mudou. Em 2026-08-28 o AGENTS.md virou ponteiro e a secao 6
foi incorporada ao CLAUDE.md.
"""

from __future__ import annotations

import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
AGENTS = RAIZ / "AGENTS.md"
CLAUDE = RAIZ / "CLAUDE.md"

# O fork tinha 4358 bytes. Um ponteiro honesto cabe folgadamente aqui, e este
# teto e o que impede a copia de voltar por acrescimo gradual.
TETO_DO_PONTEIRO = 2500


def _ler(p: Path) -> str:
    return p.read_text(encoding="utf-8-sig")


def test_agents_continua_ponteiro():
    """O caminho de volta ao fork e o crescimento gradual, nao a copia de uma vez."""
    tamanho = len(_ler(AGENTS).encode("utf-8"))
    assert tamanho <= TETO_DO_PONTEIRO, (
        f"AGENTS.md cresceu para {tamanho} B (teto {TETO_DO_PONTEIRO}). "
        "Ele e ponteiro para CLAUDE.md; conteudo de governanca vai no canonico."
    )


def test_agents_aponta_para_o_canonico():
    texto = _ler(AGENTS)
    assert "CLAUDE.md" in texto, "AGENTS.md nao aponta para o canonico"
    assert "ponteiro" in texto.lower(), "AGENTS.md nao se declara ponteiro"


def _secoes_prescritivas(p: Path) -> str:
    """O texto que INSTRUI, sem a secao que documenta os defeitos passados.

    Terceira vez nesta base que um detector reprova a prosa que o documenta --
    depois do portao de ancora reprovando os proprios comentarios, e do guard
    de roteamento pegando Convert-DeepJsonStringSOTA. A resposta certa e sempre
    a mesma: estreitar o escopo estruturalmente, nunca isentar o arquivo.
    """
    texto = _ler(p)
    corte = re.search(r"^##\s+Por que ponteiro e nao copia|^##\s+Por que ponteiro e não cópia", texto, re.M)
    if not corte:
        return texto
    resto = texto[corte.end() :]
    proxima = re.search(r"^##\s", resto, re.M)
    return texto[: corte.start()] + (resto[proxima.start() :] if proxima else "")


def test_agents_nao_reintroduz_as_referencias_mortas():
    """As duas mentiras do fork, barradas onde importa: no texto que instrui.

    Cita-las na secao que documenta o defeito e legitimo e necessario -- o que
    nao pode voltar e AFIRMA-LAS como caminho real.
    """
    prescritivo = _secoes_prescritivas(AGENTS)
    assert ".Codex/agents" not in prescritivo, "voltou a apontar .Codex/agents como local real"
    assert "CLAUDE.md" in prescritivo, "o texto prescritivo perdeu o ponteiro para o canonico"


def test_o_diretorio_de_agentes_citado_existe_de_fato():
    """A referencia morta do fork so foi possivel porque ninguem conferia o caminho."""
    assert (RAIZ / ".claude" / "agents").is_dir(), ".claude/agents sumiu; o CLAUDE.md secao 3 passou a mentir"
    assert not (RAIZ / ".Codex" / "agents").exists(), (
        ".Codex/agents passou a existir: reavaliar qual caminho o CLAUDE.md secao 3 deve citar"
    )


def test_claude_absorveu_as_diretrizes_de_manutencao():
    """A secao 6 era o unico conteudo real do fork. Perde-la seria descartar o acrescimo."""
    import unicodedata

    def _sem_acento(s: str) -> str:
        return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")

    texto = _sem_acento(_ler(CLAUDE))
    assert "## 6." in _ler(CLAUDE), "CLAUDE.md perdeu a secao 6 incorporada do AGENTS.md"
    # Comparacao sem acento: o arquivo escreve "Invariancia" com i-agudo, e um
    # detector que exige ASCII exato reprovaria a grafia correta em portugues.
    for marca in ("invariancia de testes", "warnings", "complexityanalyzer", "bom"):
        assert marca in texto, f"diretriz de manutencao ausente do CLAUDE.md: {marca}"


def test_a_contagem_de_testes_nao_voltou_para_a_governanca():
    """A secao 6 original dizia "395/395" e a suite tinha 447 havia dias.

    Contagem e medicao: vive no portao que a executa, nunca em prosa de
    governanca, onde envelhece sem que nada acuse.
    """
    ofensores = [
        linha
        for linha in _ler(CLAUDE).splitlines()
        if re.search(r"\b\d{3,4}\s*/\s*\d{3,4}\b", linha) and "395" not in linha
    ]
    assert not ofensores, f"contagem literal de testes voltou ao CLAUDE.md: {ofensores}"
