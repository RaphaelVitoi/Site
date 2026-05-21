# pylint: disable=missing-module-docstring

# ruff: noqa: S405, S314
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

path = Path(r"frontend/public/docs/tasks/assets/Aula 1.2  (1).docx")

if path.exists():
    with zipfile.ZipFile(path, "r") as docx_zip:
        xml_content = docx_zip.read("word/document.xml")
        tree = ET.fromstring(xml_content)
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        for p in tree.findall(".//w:p", namespaces=ns):
            texts = [t.text for t in p.findall(".//w:t", namespaces=ns) if t.text]
            if texts:
                print("".join(texts))
else:
    print("Arquivo DOCX nao encontrado.")
