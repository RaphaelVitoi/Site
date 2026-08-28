"""Consolidação da memória agêntica — contenção e idempotência.

Três árvores com o mesmo `MEMORY.md`, 19 de 19 divergindo, e o laço agêntico
aberto: os agentes gravavam numa árvore e o RAG lia de outra. A consolidação
não escolhe vencedor — `.claude/agent-memory` guarda memória **semântica**
(fatos curados) e `.cerebro/agent-memory` guarda **episódica** (log de handoffs);
são naturezas diferentes, e o script preserva as duas em seções distintas.

Dois defeitos apareceram só porque o segundo estado foi conferido, e os dois
estão travados aqui:

1. **Quase-idempotente.** O separador `---` ficava fora do trecho removido, e
   cada execução acrescentava um novo: **+6 bytes por rodada**, por agente.
   Medido em `chico`, 5599 → 5605. Quase-idempotente é uma forma lenta de
   corromper: nunca falha, só cresce.
2. **Separadores empilhados.** A primeira correção removia um `---` só, então
   os resíduos das rodadas anteriores sobreviviam — convergia, mas em 107.093
   em vez dos 106.979 do estado limpo. Convergir não é convergir no lugar certo.

A prova de que nada se perde é **contenção**, nunca a subtração de bytes: a soma
ingênua das três árvores conta duas vezes o que `.cerebro` e `AGENTS-MEMORY` têm
em comum, então entrada > saída é deduplicação esperada, não perda.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SCRIPT = RAIZ / "scripts" / "ops" / "consolidar_memoria_agentica.py"


@pytest.fixture
def mod():
    """Carrega o script como modulo, REGISTRANDO em `sys.modules`.

    O registro nao e zelo: sem ele, `dataclasses` nao resolve as anotacoes de
    `Resultado` -- `sys.modules.get(cls.__module__)` devolve None e a
    construcao do dataclass estoura em `AttributeError`. Custou uma bateria
    inteira vermelha para aparecer.
    """
    nome = "consolidar_sob_teste"
    spec = importlib.util.spec_from_file_location(nome, SCRIPT)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules[nome] = m
    try:
        spec.loader.exec_module(m)
        yield m
    finally:
        sys.modules.pop(nome, None)


@pytest.fixture
def arvores(tmp_path, mod, monkeypatch):
    """Três árvores sintéticas: curada, episódica e uma quase-cópia."""
    canonica = tmp_path / "canonica"
    episodica = tmp_path / "episodica"
    copia = tmp_path / "copia"

    for agente, curado, episodio in [
        ("chico", "# @chico\n\nFato consolidado A.\n", "# Memoria de CHICO\n\n- HANDOFF-1: aprendizado X\n"),
        ("auditor", "# @auditor\n\nSeed a aguardar.\n", "# Memoria de AUDITOR\n\n- HANDOFF-2: aprendizado Y\n"),
    ]:
        (canonica / agente).mkdir(parents=True)
        (canonica / agente / "MEMORY.md").write_text(curado, encoding="utf-8")
        (episodica / agente).mkdir(parents=True)
        (episodica / agente / "MEMORY.md").write_text(episodio, encoding="utf-8")
        (copia / agente).mkdir(parents=True)
        # Quase-copia: MESMO conteudo, finais de linha CRLF.
        # `newline=""` e obrigatorio: no Windows o `write_text` padrao ja traduz
        # `\n` para `\r\n`, entao um `.replace("\n", "\r\n")` ingenuo grava
        # `\r\r\n` e a "quase-copia" vira conteudo genuinamente diferente. O
        # fixture passa a fabricar o caso que quer testar, em vez de um artefato.
        (copia / agente / "MEMORY.md").write_text(
            episodio.replace("\n", "\r\n"), encoding="utf-8", newline=""
        )

    monkeypatch.setattr(mod, "RAIZ", tmp_path)
    monkeypatch.setattr(mod, "CANONICA", canonica)
    monkeypatch.setattr(mod, "ORIGENS", (episodica, copia))
    return canonica, episodica, copia


def _aplicar(mod, monkeypatch):
    monkeypatch.setattr("sys.argv", ["consolidar", "--aplicar"])
    return mod.main()


def _dry_run(mod, monkeypatch):
    monkeypatch.setattr("sys.argv", ["consolidar"])
    return mod.main()


# ---------------------------------------------------------------------------
#  Contenção: nada se perde
# ---------------------------------------------------------------------------


def test_a_canonica_passa_a_conter_as_duas_naturezas(arvores, mod, monkeypatch, capsys):
    canonica, episodica, _ = arvores
    assert _aplicar(mod, monkeypatch) == 0

    texto = (canonica / "chico" / "MEMORY.md").read_text(encoding="utf-8")
    assert "Fato consolidado A." in texto, "a memoria curada foi perdida"
    assert "HANDOFF-1: aprendizado X" in texto, "a memoria episodica nao foi absorvida"
    assert "Memória episódica consolidada" in texto
    assert "Procedência" in texto, "a origem tem de ficar declarada no proprio arquivo"


def test_a_quase_copia_nao_entra_duas_vezes(arvores, mod, monkeypatch):
    """`AGENTS-MEMORY` difere de `.cerebro` só em finais de linha. Tratar isso
    como conteúdo novo dobraria a seção episódica."""
    canonica, _, _ = arvores
    assert _aplicar(mod, monkeypatch) == 0
    texto = (canonica / "chico" / "MEMORY.md").read_text(encoding="utf-8")
    assert texto.count("HANDOFF-1: aprendizado X") == 1


def test_dry_run_nao_escreve(arvores, mod, monkeypatch):
    canonica, _, _ = arvores
    antes = (canonica / "chico" / "MEMORY.md").read_bytes()
    assert _dry_run(mod, monkeypatch) == 0
    assert (canonica / "chico" / "MEMORY.md").read_bytes() == antes


def test_as_origens_nao_sao_apagadas(arvores, mod, monkeypatch):
    """Consolidar não é remover. Apagar é ato do vértice, em outro momento."""
    _, episodica, copia = arvores
    assert _aplicar(mod, monkeypatch) == 0
    assert (episodica / "chico" / "MEMORY.md").exists()
    assert (copia / "chico" / "MEMORY.md").exists()
    assert (episodica / "SUPERSEDED.md").exists(), "a origem tem de ficar marcada"
    assert "Nada foi apagado" in (episodica / "SUPERSEDED.md").read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
#  Idempotência: os dois defeitos que só o segundo estado revelou
# ---------------------------------------------------------------------------


def test_rodar_duas_vezes_nao_muda_um_byte(arvores, mod, monkeypatch):
    """O defeito 1. Sem isto o arquivo cresce 6 bytes por execução, para sempre,
    e nenhuma execução isolada acusa."""
    canonica, _, _ = arvores
    assert _aplicar(mod, monkeypatch) == 0
    primeira = {p: p.read_bytes() for p in canonica.glob("*/MEMORY.md")}
    assert _aplicar(mod, monkeypatch) == 0
    segunda = {p: p.read_bytes() for p in canonica.glob("*/MEMORY.md")}
    assert primeira == segunda, "o script deriva a cada execucao"


def test_convergencia_e_no_estado_LIMPO_nao_so_estavel(arvores, mod, monkeypatch):
    """O defeito 2. Estabilizar num valor inflado ainda é estabilizar -- e passa
    despercebido por qualquer teste que só compare execuções consecutivas."""
    canonica, _, _ = arvores
    monkeypatch.setattr("sys.argv", ["consolidar", "--aplicar"])
    mod.main()
    limpo = (canonica / "chico" / "MEMORY.md").read_bytes()
    for _ in range(3):
        mod.main()
    assert (canonica / "chico" / "MEMORY.md").read_bytes() == limpo


def test_separadores_empilhados_sao_removidos(arvores, mod, monkeypatch):
    """Simula o resíduo que as execuções pré-correção deixaram em disco."""
    canonica, _, _ = arvores
    alvo = canonica / "chico" / "MEMORY.md"
    assert _aplicar(mod, monkeypatch) == 0
    limpo = alvo.read_text(encoding="utf-8")

    sujo = limpo.replace(mod.MARCA_INICIO, "\n\n---\n\n---\n\n" + mod.MARCA_INICIO, 1)
    alvo.write_text(sujo, encoding="utf-8")
    assert _aplicar(mod, monkeypatch) == 0
    assert alvo.read_text(encoding="utf-8") == limpo, "residuo de separador sobreviveu"


def test_a_secao_consolidada_aparece_uma_vez_so(arvores, mod, monkeypatch):
    canonica, _, _ = arvores
    for _ in range(3):
        assert _aplicar(mod, monkeypatch) == 0
    texto = (canonica / "chico" / "MEMORY.md").read_text(encoding="utf-8")
    assert texto.count(mod.MARCA_INICIO) == 1
    assert texto.count(mod.MARCA_FIM) == 1


# ---------------------------------------------------------------------------
#  A conferência que o script faz de si mesmo
# ---------------------------------------------------------------------------


def test_o_script_reprova_se_a_continencia_falhar(arvores, mod, monkeypatch, capsys):
    """A guarda interna precisa conseguir dizer não. Portão que nunca reprovou
    pode ser incapaz de reprovar."""
    canonica, _, _ = arvores
    monkeypatch.setattr(mod, "consolidar_agente", lambda ag: mod.Resultado(agente=ag, ja_consolidado=True))
    assert _aplicar(mod, monkeypatch) == 1
    assert "conteudo que NAO esta contido" in capsys.readouterr().out
