"""Leitor universal da skill: um extrator por extensao, e o manifesto lista exatamente estes.

`SUPPORTED_EXTENSIONS` e a fonte da tabela de formatos do SKILL.md; o teste da skill
reprova se divergirem. Falha nunca vira texto com codigo 0:

    0 ok | 1 arquivo inexistente | 2 extensao sem extrator | 3 erro de extracao
    4 dependencia ausente | 6 uso invalido
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import zipfile
from collections.abc import Callable, Iterable
from pathlib import Path
from typing import Any, cast

from defusedxml import ElementTree  # XML de .pptx vem de terceiros: sem entidades externas nem expansao

from knowledge_common import ExitCode

try:
    import pypdf
except ImportError:  # pragma: no cover - depende do ambiente
    pypdf = None

try:
    import docx
except ImportError:  # pragma: no cover
    docx = None

try:
    import openpyxl
except ImportError:  # pragma: no cover
    openpyxl = None

SETTINGS_MAX_BYTES = 5 * 1024 * 1024


class UnsupportedFormatError(Exception):
    pass


class MissingDependencyError(Exception):
    pass


class ExtractionError(Exception):
    pass


def _pdf(path: Path, max_chars: int) -> str:
    if pypdf is None:
        raise MissingDependencyError("pypdf")
    partes, total = [], 0
    for i, pagina in enumerate(pypdf.PdfReader(str(path)).pages):
        texto = pagina.extract_text() or ""
        partes.append(f"--- PAGINA {i + 1} ---\n{texto}")
        total += len(texto)
        if total >= max_chars:
            break
    return "\n\n".join(partes)


def _docx(path: Path, _max_chars: int) -> str:
    if docx is None:
        raise MissingDependencyError("python-docx")
    documento = docx.Document(str(path))
    linhas = [p.text for p in documento.paragraphs if p.text.strip()]
    for tabela in documento.tables:
        for linha in tabela.rows:
            linhas.append(" | ".join(celula.text.strip() for celula in linha.cells))
    return "\n".join(linhas)


def _pptx(path: Path, _max_chars: int) -> str:
    with zipfile.ZipFile(path) as pacote:
        slides = sorted(n for n in pacote.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml"))
        saida = []
        for nome in slides:
            raiz = ElementTree.fromstring(pacote.read(nome))
            textos = [n.text for n in raiz.iter() if n.text and n.text.strip()]
            if textos:
                saida.append(f"--- {nome} ---\n" + " ".join(textos))
    return "\n\n".join(saida)


def _xlsx(path: Path, max_chars: int) -> str:
    if openpyxl is None:
        raise MissingDependencyError("openpyxl")
    livro = openpyxl.load_workbook(str(path), read_only=True, data_only=True)
    saida, total = [], 0
    try:
        for aba in livro.worksheets:
            saida.append(f"--- ABA {aba.title} ---")
            iter_rows = getattr(aba, "iter_rows", None)
            if not callable(iter_rows):
                continue
            rows = cast(Iterable[Iterable[Any]], iter_rows(values_only=True))
            for linha in rows:
                texto = "\t".join("" if v is None else str(v) for v in linha)
                saida.append(texto)
                total += len(texto)
                if total >= max_chars:
                    return "\n".join(saida)
    finally:
        livro.close()
    return "\n".join(saida)


def _texto(path: Path, _max_chars: int) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _hrcz(path: Path, _max_chars: int) -> str:
    """Save do HRC e um zip: lista as entradas e le `settings.json` quando existir. Nao le a arvore."""
    with zipfile.ZipFile(path) as pacote:
        entradas = pacote.infolist()
        saida = [f"--- {len(entradas)} ENTRADAS ---"]
        saida += [f"{e.filename}\t{e.file_size} bytes" for e in entradas[:200]]
        settings = next((e for e in entradas if e.filename.endswith("settings.json")), None)
        if settings is not None and settings.file_size <= SETTINGS_MAX_BYTES:
            saida.append(f"--- {settings.filename} ---")
            saida.append(pacote.read(settings).decode("utf-8", errors="replace"))
    return "\n".join(saida)


def _midia(path: Path, _max_chars: int) -> str:
    """Metadados por ffprobe: duracao e fluxos. Nao transcreve audio."""
    ffprobe = shutil.which("ffprobe")
    if ffprobe is None:
        raise MissingDependencyError("ffprobe")
    r = subprocess.run(
        [ffprobe, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        capture_output=True,
        text=True,
        check=False,
    )
    if r.returncode != 0:
        raise ExtractionError(r.stderr.strip() or f"ffprobe saiu com {r.returncode}")
    dados = json.loads(r.stdout)
    fmt = dados.get("format", {})
    linhas = [f"duracao_s\t{fmt.get('duration')}", f"formato\t{fmt.get('format_name')}"]
    for fluxo in dados.get("streams", []):
        linhas.append(f"fluxo\t{fluxo.get('codec_type')}\t{fluxo.get('codec_name')}")
    return "\n".join(linhas)


EXTRACTORS: dict[str, Callable[[Path, int], str]] = {
    ".pdf": _pdf,
    ".docx": _docx,
    ".pptx": _pptx,
    ".pptm": _pptx,
    ".xlsx": _xlsx,
    ".xlsm": _xlsx,
    ".txt": _texto,
    ".md": _texto,
    ".json": _texto,
    ".csv": _texto,
    ".hrcz": _hrcz,
    ".mp4": _midia,
    ".m4a": _midia,
}
SUPPORTED_EXTENSIONS: tuple[str, ...] = tuple(sorted(EXTRACTORS))


def extract_text(path: Path, max_chars: int = 5000) -> str:
    """Texto do arquivo, ou excecao tipada. Nunca devolve mensagem de erro como se fosse conteudo."""
    if max_chars <= 0:
        raise ValueError("max_chars deve ser positivo.")
    if not path.is_file():
        raise FileNotFoundError(str(path))
    extrator = EXTRACTORS.get(path.suffix.lower())
    if extrator is None:
        raise UnsupportedFormatError(path.suffix.lower() or "(sem extensao)")
    try:
        return extrator(path, max_chars)[:max_chars]
    except (MissingDependencyError, UnsupportedFormatError):
        raise
    except ExtractionError:
        raise
    except Exception as exc:  # noqa: BLE001 - qualquer falha do parser vira ExtractionError explicito
        raise ExtractionError(f"{type(exc).__name__}: {exc}") from exc


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Leitor universal da skill poker-pmev-knowledge-engine.")
    parser.add_argument("file_path")
    parser.add_argument("--max-chars", type=int, default=5000)
    args = parser.parse_args(argv)
    caminho = Path(args.file_path)
    try:
        print(extract_text(caminho, args.max_chars))
        return ExitCode.OK
    except FileNotFoundError:
        print(f"ERRO {ExitCode.NOT_FOUND}: arquivo inexistente: {caminho}", file=sys.stderr)
        return ExitCode.NOT_FOUND
    except UnsupportedFormatError as exc:
        suportadas = ", ".join(SUPPORTED_EXTENSIONS)
        print(f"ERRO {ExitCode.UNSUPPORTED}: extensao sem extrator: {exc} (suportadas: {suportadas})", file=sys.stderr)
        return ExitCode.UNSUPPORTED
    except MissingDependencyError as exc:
        print(f"ERRO {ExitCode.MISSING_DEPENDENCY}: dependencia ausente: {exc}", file=sys.stderr)
        return ExitCode.MISSING_DEPENDENCY
    except ExtractionError as exc:
        print(f"ERRO {ExitCode.EXTRACTION_ERROR}: falha ao extrair {caminho.name}: {exc}", file=sys.stderr)
        return ExitCode.EXTRACTION_ERROR
    except ValueError as exc:
        print(f"ERRO {ExitCode.USAGE}: {exc}", file=sys.stderr)
        return ExitCode.USAGE


if __name__ == "__main__":
    sys.exit(main())
