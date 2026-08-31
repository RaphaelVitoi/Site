# pylint: disable=c-extension-no-member

from pathlib import Path
import shutil
import sys
import zipfile

from lxml import etree  # type: ignore

# Namespaces XML para parsing do DOCX
ns = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
}


def _extract_image_mapping(rels_tree) -> dict:
    """Isola o mapeamento relacional de IDs de imagens para seus paths internos no ZIP."""
    return {
        rel.get("Id"): rel.get("Target")
        for rel in rels_tree.findall("Relationship", namespaces=rels_tree.nsmap)
        if "image" in rel.get("Type")
    }


def _process_paragraph(p, docx_zip: zipfile.ZipFile, id_to_image: dict, image_output_dir: Path, slug: str) -> str:
    """Processa um paragrafo e lida com o parse de texto e ancoragem de imagens extraidas."""
    paragraph_parts = []
    for r in p.findall("w:r", namespaces=ns):
        for t in r.findall(".//w:t", namespaces=ns):
            paragraph_parts.append(t.text or "")

        for drawing in r.findall(".//w:drawing", namespaces=ns):
            blip = drawing.find(".//a:blip", namespaces=ns)
            if blip is not None:
                embed_id = blip.get(f"{{{ns['r']}}}embed")
                if embed_id in id_to_image:
                    image_path_in_zip = f"word/{id_to_image[embed_id]}"
                    image_filename = Path(image_path_in_zip).name
                    with (
                        docx_zip.open(image_path_in_zip) as source,
                        open(image_output_dir / image_filename, "wb") as target_file,
                    ):
                        shutil.copyfileobj(source, target_file)

                    web_path = f"/images/aulas/{slug}/{image_filename}"
                    markdown_image_tag = f"\n\n![Descricao da imagem: {image_filename}]({web_path})\n\n"
                    paragraph_parts.append(markdown_image_tag)
    return "".join(paragraph_parts)


def convert_docx_to_markdown(docx_path_str: str, slug: str):
    """
    Extrai texto e imagens de um arquivo .docx, mantendo a ordem, e gera um arquivo Markdown.
    As imagens sao salvas em um diretorio publico e referenciadas no Markdown.
    """
    docx_path = Path(docx_path_str)
    # Blindagem SOTA: Garante que o caminho e um arquivo, nao um diretorio.
    if not docx_path.is_file():
        print(f"[ERRO] O caminho fornecido nao e um arquivo valido: {docx_path}")
        return

    # SOTA: Resolucao absoluta para a raiz do projeto a partir do diretorio 'utils'
    base_path = Path(__file__).parent.parent.parent
    image_output_dir = base_path / "frontend" / "public" / "images" / "aulas" / slug
    image_output_dir.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Imagens serao salvas em: {image_output_dir}")

    markdown_content = []

    try:
        with zipfile.ZipFile(docx_path, "r") as docx_zip:
            rels_xml = docx_zip.read("word/_rels/document.xml.rels")
            rels_tree = etree.fromstring(rels_xml)
            id_to_image = _extract_image_mapping(rels_tree)

            doc_xml = docx_zip.read("word/document.xml")
            doc_tree = etree.fromstring(doc_xml)
            body = doc_tree.find("w:body", namespaces=ns)

            for p in body.findall("w:p", namespaces=ns):
                processed_text = _process_paragraph(p, docx_zip, id_to_image, image_output_dir, slug)
                if processed_text:
                    markdown_content.append(processed_text)

        final_markdown = "\n\n".join(markdown_content)

        output_md_path = base_path / f"{slug}.md"
        with open(output_md_path, "w", encoding="utf-8") as f:
            f.write(final_markdown)

        print("\n[SUCESSO] Conversao concluida!")
        print(f"O conteudo Markdown foi salvo em: {output_md_path}")
        print(
            "\nAgora voce pode copiar este conteudo para o seu `seed_lesson.py` ou usa-lo diretamente no banco de dados."
        )

    except Exception as e:  # noqa: BLE001
        print(f"[ERRO FATAL] Falha durante a conversao: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Uso: python convert_docx_to_markdown.py "<caminho_para_o_docx>" "<slug_da_aula>"')
        sys.exit(1)
    convert_docx_to_markdown(sys.argv[1], sys.argv[2])
