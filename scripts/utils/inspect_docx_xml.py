# pylint: disable=missing-module-docstring, missing-function-docstring, redefined-outer-name, invalid-name

import re
import zipfile


def extract_text_from_docx(path):
    with zipfile.ZipFile(path, "r") as z:
        content = z.read("word/document.xml").decode("utf-8")
        # Remove XML tags
        return re.sub(r"<[^>]+>", " ", content)


path = "frontend/research/icm-materials/Aula 1.2 .docx"
text = extract_text_from_docx(path)

# Look for patterns like 22+, A2s, etc.
hands = re.findall(r"[AKQJT2-9]{2}(?:[so]\+?|[+\-])?", text)
print("Hands found in XML:", sorted(set(hands)))

# Save to a file for deeper inspection
with open("extracted_xml_text.txt", "w", encoding="utf-8") as f:
    f.write(text)
