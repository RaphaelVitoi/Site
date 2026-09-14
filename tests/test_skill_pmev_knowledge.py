"""Skill poker-pmev-knowledge-engine: o manifesto promete o que os scripts fazem (P1 da auditoria 2026-09-13)."""

from __future__ import annotations

import importlib
import json
import re
import shutil
import sqlite3
import subprocess
import sys
import zipfile
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
SKILL = RAIZ / ".agents" / "skills" / "poker-pmev-knowledge-engine"
SCRIPTS = SKILL / "scripts"
sys.path.insert(0, str(SCRIPTS))

knowledge_common = importlib.import_module("knowledge_common")
universal_reader = importlib.import_module("universal_reader")
curate_index = importlib.import_module("curate_index")
ExitCode = knowledge_common.ExitCode


def _ler(caminho: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(SCRIPTS / "universal_reader.py"), str(caminho), "--max-chars", "4000"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )


def test_tabela_de_formatos_do_manifesto_e_exatamente_a_dos_extratores():
    texto = (SKILL / "SKILL.md").read_text(encoding="utf-8")
    secao = texto.split("## 3. Formatos com extrator", 1)[1].split("\n## ", 1)[0]
    tabela = "\n".join(ln for ln in secao.splitlines() if ln.startswith("| `"))
    declaradas = set(re.findall(r"`(\.[a-z0-9]+)`", tabela))
    assert declaradas == set(universal_reader.SUPPORTED_EXTENSIONS)


def test_codigos_de_saida_do_manifesto_sao_os_do_codigo():
    texto = (SKILL / "SKILL.md").read_text(encoding="utf-8")
    secao = texto.split("## 2. Códigos de saída", 1)[1].split("\n## ", 1)[0]
    declarados = {int(m) for m in re.findall(r"^\|\s+(\d+)\s+\|", secao, flags=re.M)}
    assert declarados == {int(c) for c in ExitCode}


def test_arquivo_inexistente_sai_com_1(tmp_path):
    r = _ler(tmp_path / "nao_existe.pdf")
    assert r.returncode == ExitCode.NOT_FOUND and "ERRO 1" in r.stderr and not r.stdout.strip()


@pytest.mark.parametrize("extensao", [".cfr", ".doc", ".ods"])
def test_extensao_sem_extrator_sai_com_2(tmp_path, extensao):
    alvo = tmp_path / f"a{extensao}"
    alvo.write_bytes(b"conteudo")
    assert _ler(alvo).returncode == ExitCode.UNSUPPORTED


def test_pdf_corrompido_sai_com_3_e_nao_imprime_erro_como_conteudo(tmp_path):
    alvo = tmp_path / "quebrado.pdf"
    alvo.write_bytes(b"isto nao e um pdf")
    r = _ler(alvo)
    assert r.returncode == ExitCode.EXTRACTION_ERROR and not r.stdout.strip()


def test_xlsx_e_hrcz_sao_lidos_de_verdade(tmp_path):
    openpyxl = pytest.importorskip("openpyxl")
    livro = openpyxl.Workbook()
    livro.active.append(["BTN", 39.88])
    livro.save(tmp_path / "mesa.xlsx")
    assert "39.88" in _ler(tmp_path / "mesa.xlsx").stdout

    with zipfile.ZipFile(tmp_path / "spot.hrcz", "w") as pacote:
        pacote.writestr("settings.json", json.dumps({"structure": {"chips": 378000}}))
        pacote.writestr("tree.bin", b"\x00" * 16)
    saida = _ler(tmp_path / "spot.hrcz")
    assert saida.returncode == ExitCode.OK and "378000" in saida.stdout and "tree.bin" in saida.stdout


def test_raizes_de_escrita_recusam_fora_e_travessia(tmp_path):
    raiz = tmp_path / "permitida"
    raiz.mkdir()
    assert knowledge_common.resolve_write_path(raiz / "a.db", (raiz,)) == (raiz / "a.db").resolve()
    for destino in (tmp_path / "fora.db", raiz / ".." / "fora.db"):
        with pytest.raises(knowledge_common.OutsideWriteRootsError):
            knowledge_common.resolve_write_path(destino, (raiz,))


def test_build_usa_cache_por_conteudo_e_registra_falha(tmp_path):
    workspace, db = tmp_path / "ws", tmp_path / "idx" / "k.db"
    workspace.mkdir()
    (workspace / "a.md").write_text("PMev e perspectiva", encoding="utf-8")
    (workspace / "b.txt").write_text("ICM Malmuth Harville", encoding="utf-8")
    (workspace / "quebrado.pdf").write_bytes(b"nao e pdf")
    sem_ancoras = tmp_path / "nao_existe.json"

    primeiro = curate_index.build_index(db, workspace, sem_ancoras, roots=(tmp_path,))
    assert (primeiro.indexed, primeiro.cache_hits, len(primeiro.errors)) == (3, 0, 1)

    segundo = curate_index.build_index(db, workspace, sem_ancoras, roots=(tmp_path,))
    assert (segundo.cache_hits, len(segundo.errors)) == (2, 1), "falha nao pode virar cache"

    (workspace / "a.md").write_text("PMev mudou", encoding="utf-8")
    terceiro = curate_index.build_index(db, workspace, sem_ancoras, roots=(tmp_path,))
    assert terceiro.cache_hits == 1

    with sqlite3.connect(db) as conn:
        linha = conn.execute(
            "SELECT extraction_error, content_sha256 FROM documents WHERE path='quebrado.pdf'"
        ).fetchone()
    assert linha[0] and len(linha[1]) == 64
    assert [r[0] for r in curate_index.search_index(db, "Harville")] == ["b.txt"]


def test_build_recusa_banco_fora_das_raizes(tmp_path):
    with pytest.raises(knowledge_common.OutsideWriteRootsError):
        curate_index.build_index(tmp_path / "k.db", tmp_path, tmp_path / "x.json", roots=(tmp_path / "outra",))


def test_ancoras_externas_vem_do_arquivo_local_e_marcam_ausencia(tmp_path):
    ancoras = tmp_path / "anchors.json"
    ancoras.write_text(
        json.dumps(
            [{"path": str(tmp_path / "sumiu.cfr"), "title": "t", "description": "d", "origin": "X:", "category": "c"}]
        ),
        encoding="utf-8",
    )
    (tmp_path / "ws").mkdir()
    resumo = curate_index.build_index(tmp_path / "k.db", tmp_path / "ws", ancoras, roots=(tmp_path,))
    assert (resumo.anchors, resumo.anchors_absent) == (1, 1)


def test_inventario_pessoal_nao_e_versionado_na_skill():
    versionados = subprocess.run(
        ["git", "ls-files", str(SKILL.relative_to(RAIZ)).replace("\\", "/")],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        check=True,
    ).stdout.split()
    # O que vai ao proximo commit e o disco: remocao ainda fora do stage continua listada pelo ls-files.
    assert not (SCRIPTS / "update_multidrive_index.py").exists(), "inventario hardcoded voltou para a arvore"
    padrao = re.compile(r"[A-Za-z]:\\\\?(Users|Solver|Biblioteca|Hermiones|MonkerSolver|ICM sims|Meu Drive)", re.I)
    for rel in [*versionados, *(p.relative_to(RAIZ).as_posix() for p in SCRIPTS.iterdir() if p.is_file())]:
        if not (RAIZ / rel).is_file():
            continue
        texto = (RAIZ / rel).read_text(encoding="utf-8", errors="ignore")
        assert not padrao.search(texto), f"caminho pessoal absoluto versionado em {rel}"
    ignorado = subprocess.run(
        ["git", "check-ignore", "-q", str((SKILL / "local" / "anchors.json").relative_to(RAIZ))],
        cwd=RAIZ,
        check=False,
    )
    assert ignorado.returncode == 0, "local/anchors.json precisa ser ignorado pelo git"


def test_inventario_de_discos_pessoais_nao_volta_a_nenhum_arquivo_versionado():
    """Medido em 2026-09-13: o teste acima olhava so a skill, e o mesmo inventario seguia num registro.

    Marcadores do inventario de 2026-09-13 (discos D:, E:, F:). O repositorio e publico.
    """
    marcadores = ["notes.RaphaVitoi", "Solver work", "ICM pio sims", "Biblioteca\\Acervo", "F:\\Hermiones"]
    argumentos = ["git", "grep", "-I", "-l", "-F"]
    for marcador in marcadores:
        argumentos += ["-e", marcador]
    argumentos += ["--", ".", ":!tests/test_skill_pmev_knowledge.py"]
    r = subprocess.run(argumentos, cwd=RAIZ, capture_output=True, text=True, encoding="utf-8", check=False)
    assert r.returncode == 1 and not r.stdout.strip(), f"inventario pessoal em arquivo versionado: {r.stdout.split()}"


NODE = shutil.which("node")


def _node(tmp_path: Path, *args: str) -> subprocess.CompletedProcess:
    ambiente = {"APPDATA": str(tmp_path / "sem_adc"), "PATH": str(Path(NODE).parent), "SystemRoot": "C:\\Windows"}
    return subprocess.run([NODE, *args], capture_output=True, text=True, encoding="utf-8", env=ambiente, check=False)


@pytest.mark.skipif(NODE is None, reason="node ausente")
def test_drive_fetch_recusa_destino_fora_das_raizes_antes_da_rede(tmp_path):
    r = _node(tmp_path, str(SCRIPTS / "drive_fetch.mjs"), "abcDEF123_-", str(tmp_path / "fora.txt"))
    assert r.returncode == ExitCode.OUTSIDE_WRITE_ROOTS, r.stderr
    r = _node(tmp_path, str(SCRIPTS / "drive_fetch.mjs"), "id com espaco")
    assert r.returncode == ExitCode.USAGE


@pytest.mark.skipif(NODE is None, reason="node ausente")
def test_drive_search_sem_adc_falha_com_codigo_de_configuracao(tmp_path):
    r = _node(tmp_path, str(SCRIPTS / "drive_search.mjs"), "PMev", "3")
    assert r.returncode == ExitCode.USAGE and "ADC" in r.stderr


@pytest.mark.skipif(NODE is None, reason="node ausente")
def test_termo_de_busca_e_escapado(tmp_path):
    url = (SCRIPTS / "drive_common.mjs").as_uri()
    codigo = f"import {{ escapeDriveQuery }} from '{url}'; console.log(escapeDriveQuery(\"a'b\\\\c\"));"
    r = _node(tmp_path, "--input-type=module", "-e", codigo)
    assert r.stdout.strip() == "a\\'b\\\\c"
