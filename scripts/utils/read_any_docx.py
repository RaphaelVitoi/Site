# pylint: disable=missing-module-docstring, missing-function-docstring
import sys
import zipfile
from pathlib import Path

import defusedxml.ElementTree as DefusedET


def read_docx(file_path: str) -> None:
    path = Path(file_path)
    if not path.exists():
        print(f"Arquivo {file_path} nao encontrado.")
        return

    try:
        with zipfile.ZipFile(path, "r") as docx_zip:
            xml_content = docx_zip.read("word/document.xml")
            tree = DefusedET.fromstring(xml_content)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            for p in tree.findall(".//w:p", namespaces=ns):
                texts = [t.text for t in p.findall(".//w:t", namespaces=ns) if t.text]
                if texts:
                    print("".join(texts))
    except (zipfile.BadZipFile, DefusedET.ParseError, OSError) as e:
        print(f"Erro ao ler DOCX: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_docx(sys.argv[1])
    else:
        print("Uso: python read_any_docx.py <caminho_do_arquivo>")
