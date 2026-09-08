"""O sentinela de delecoes captura o sumico e nomeia suspeitos -- ou nao serve.

Contexto medido, 2026-09-08. `.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md`
sumiu do disco tres vezes sem commit. O journal USN datou a terceira em
16:05:19 e mostrou `logs/task_executor.log` apagado no registro imediatamente
anterior; nenhuma linha deste repositorio apaga o segundo, entao o ator esta
fora do projeto. O USN nao grava processo, e por isso existe o sentinela.

O QUE ESTA SUITE GUARDA, e por que cada guarda existe:

- A PRIMEIRA versao do sentinela usava `FileSystemWatcher` e nao capturou a
  isca: falhou em SILENCIO. Um instrumento que parece ligado e nao registra e
  pior que instrumento ausente, porque produz confianca sem lastro. Dai o teste
  funcional: a isca some, o registro tem que aparecer.
- A SEGUNDA versao anexava todos os processos candidatos -- 240 deles -- e nao
  apontava ninguem. Dai a guarda do delta de CPU.
- O sentinela e instrumento de MEDICAO. Se ele escrever ou apagar no alvo,
  contamina o que mede. Dai a guarda de que ele so le.
"""

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess
import time

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SENTINELA = RAIZ / "scripts" / "ops" / "sentinela_delecoes.ps1"

PWSH = shutil.which("pwsh") or shutil.which("powershell")


def _fonte() -> str:
    return SENTINELA.read_text(encoding="utf-8-sig")


def test_o_sentinela_existe_e_preserva_bom_unico() -> None:
    """PowerShell 5.1 exige BOM; dois BOMs quebram o parse nas duas versoes."""
    assert SENTINELA.is_file(), f"{SENTINELA} nao existe"
    bruto = SENTINELA.read_bytes()
    assert bruto.startswith(b"\xef\xbb\xbf"), "arquivo .ps1 sem BOM UTF-8 (secao 6.4)"
    assert not bruto[3:].startswith(b"\xef\xbb\xbf"), "BOM duplicado quebra o parse"


def test_vigia_os_dois_diretorios_que_o_usn_apontou() -> None:
    """A delecao atingiu os dois em registros consecutivos; vigiar um so cega metade."""
    fonte = _fonte()
    assert ".claude\\RELATORIOS" in fonte
    assert "'logs'" in fonte


def test_nao_escreve_nem_apaga_no_alvo_que_observa() -> None:
    """Instrumento que altera o alvo contamina a medicao."""
    fonte = _fonte()
    for proibido in ("Remove-Item", "Set-Content", "New-Item", "Move-Item", "Clear-Content"):
        assert proibido not in fonte, f"o sentinela nao pode chamar {proibido}"
    # Add-Content e permitido: escreve no JSONL de saida, fora das pastas vigiadas.
    assert "Add-Content" in fonte


def test_discrimina_por_delta_de_cpu_e_nao_por_retrato() -> None:
    """Retrato absoluto devolveu 240 processos e nao apontou ninguem."""
    fonte = _fonte()
    assert "cpu_delta_s" in fonte
    assert "function Suspeitos" in fonte


def test_declara_por_que_sonda_em_vez_de_usar_filesystemwatcher() -> None:
    """A escolha custou uma falha silenciosa; quem vier depois precisa saber."""
    fonte = _fonte()
    assert "FileSystemWatcher" in fonte, "a alternativa descartada tem que estar declarada"
    assert "SILENCIO" in fonte


def test_declara_o_limite_do_indicio() -> None:
    """Delta de CPU nao prova autoria, e o script nao pode sugerir que prova."""
    fonte = _fonte()
    assert "INDICIO, nao prova" in fonte


@pytest.mark.skipif(PWSH is None, reason="PowerShell ausente do PATH")
def test_captura_a_delecao_e_nomeia_suspeitos(tmp_path: Path) -> None:
    """A guarda que importa: a isca some, o registro aparece.

    Usa `-MaximoDeCiclos` para o processo terminar sozinho -- teste que mata
    processo deixa orfao quando falha antes do kill.
    """
    (tmp_path / ".claude" / "RELATORIOS").mkdir(parents=True)
    alvo = tmp_path / "logs"
    alvo.mkdir()
    isca = alvo / "isca.tmp"
    isca.write_text("isca", encoding="utf-8")
    saida = tmp_path / "saida.jsonl"

    processo = subprocess.Popen(  # noqa: S603  # Record-Id: registro-2026-09-08-forense-das-delecoes-e-o-sentinela
        [
            PWSH,
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(SENTINELA),
            "-Repo",
            str(tmp_path),
            "-Saida",
            str(saida),
            "-IntervaloMs",
            "200",
            "-MaximoDeCiclos",
            "50",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    try:
        time.sleep(3.0)
        isca.unlink()
        stdout, stderr = processo.communicate(timeout=60)
    except subprocess.TimeoutExpired:  # pragma: no cover - defesa contra travamento
        processo.kill()
        raise

    assert saida.is_file(), f"nenhum registro produzido.\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}"
    linhas = [json.loads(linha) for linha in saida.read_text(encoding="utf-8").splitlines() if linha.strip()]
    registros = [linha for linha in linhas if linha["caminho"].endswith("isca.tmp")]
    assert registros, f"a isca sumiu e nao foi registrada.\nlinhas: {linhas}"

    registro = registros[0]
    assert registro["evento"] == "sumiu"
    assert registro["bytes_antes"] == 4
    assert isinstance(registro["suspeitos"], list)
