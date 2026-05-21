# ruff: noqa: S405, S314
import zipfile
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

def read_docx(file_path):
    path = Path(file_path)
    if not path.exists():
        print(f"Arquivo {file_path} nao encontrado.")
        return

    try:
        with zipfile.ZipFile(path, 'r') as docx_zip:
            xml_content = docx_zip.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for p in tree.findall('.//w:p', namespaces=ns):
                texts = [t.text for t in p.findall('.//w:t', namespaces=ns) if t.text]
                if texts:
                    print(''.join(texts))
    except Exception as e:
        print(f"Erro ao ler DOCX: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_docx(sys.argv[1])
    else:
        print("Uso: python read_any_docx.py <caminho_do_arquivo>")
