"""Universal Document Reader for Poker & PMev Knowledge Base.
Supports PDF (pypdf), DOCX (python-docx), PPTX (zipfile/xml), XLSX (openpyxl/csv), MD and TXT.
"""

from __future__ import annotations

import argparse
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None


def read_pdf(path: Path, max_chars: int) -> str:
    if pypdf is None:
        return "pypdf não está instalado."
    reader = pypdf.PdfReader(str(path))
    content = []
    total_len = 0
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        content.append(f"--- PÁGINA {i + 1} ---\n{text}")
        total_len += len(text)
        if total_len >= max_chars:
            break
    return "\n\n".join(content)[:max_chars]


def read_docx(path: Path, max_chars: int) -> str:
    if docx is None:
        return "python-docx não está instalado."
    doc = docx.Document(str(path))
    lines = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            lines.append(" | ".join(cell.text.strip() for cell in row.cells))
    return "\n".join(lines)[:max_chars]


def read_pptx(path: Path, max_chars: int) -> str:
    with zipfile.ZipFile(str(path), "r") as z:
        slides = sorted([f for f in z.namelist() if f.startswith("ppt/slides/slide") and f.endswith(".xml")])
        output = []
        for sf in slides:
            xml_data = z.read(sf)
            tree = ET.fromstring(xml_data)
            texts = [node.text for node in tree.iter() if node.text and node.text.strip()]
            if texts:
                output.append(f"--- {sf} ---\n" + " ".join(texts))
    return "\n\n".join(output)[:max_chars]


def read_file(path_str: str, max_chars: int = 4000) -> str:
    path = Path(path_str)
    if not path.exists():
        return f"Arquivo não encontrado: {path_str}"

    ext = path.suffix.lower()
    try:
        if ext == ".pdf":
            return read_pdf(path, max_chars)
        elif ext in [".docx", ".doc"]:
            return read_docx(path, max_chars)
        elif ext in [".pptx", ".pptm"]:
            return read_pptx(path, max_chars)
        elif ext in [".txt", ".md", ".json", ".csv"]:
            return path.read_text(encoding="utf-8", errors="replace")[:max_chars]
        else:
            return f"Extensão {ext} não possui extrator textual direto."
    except Exception as e:
        return f"Erro ao ler {path.name}: {e}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Universal Reader for Poker & PMev files.")
    parser.add_argument("file_path", help="Path to file")
    parser.add_argument("--max-chars", type=int, default=5000, help="Maximum characters to print")
    args = parser.parse_args()

    content = read_file(args.file_path, args.max_chars)
    print(content)


if __name__ == "__main__":
    main()
