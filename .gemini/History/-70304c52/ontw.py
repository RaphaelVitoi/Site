import sys
import zipfile
import shutil
from pathlib import Path
from lxml import etree

# Namespaces XML para parsing do DOCX
ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}

def convert_docx_to_markdown(docx_path_str: str, slug: str):
    """
    Extrai texto e imagens de um arquivo .docx, mantendo a ordem, e gera um arquivo Markdown.
    As imagens são salvas em um diretório público e referenciadas no Markdown.
    """
    docx_path = Path(docx_path_str)
    # Blindagem SOTA: Garante que o caminho é um arquivo, não um diretório.
    if not docx_path.is_file():
        print(f"[ERRO] O caminho fornecido não é um arquivo válido: {docx_path}")
        return

    base_path = Path(__file__).parent
    image_output_dir = base_path / "frontend" / "public" / "images" / "aulas" / slug
    image_output_dir.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Imagens serão salvas em: {image_output_dir}")

    markdown_content = []

    try:
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            # 1. Mapear rId para o caminho da imagem
            rels_xml = docx_zip.read('word/_rels/document.xml.rels')
            rels_tree = etree.fromstring(rels_xml)
            id_to_image = {rel.get('Id'): rel.get('Target') for rel in rels_tree.findall('Relationship', namespaces=rels_tree.nsmap) if "image" in rel.get('Type')}

            # 2. Processar o documento principal
            doc_xml = docx_zip.read('word/document.xml')
            doc_tree = etree.fromstring(doc_xml)
            body = doc_tree.find('w:body', namespaces=ns)

            for p in body.findall('w:p', namespaces=ns):
                paragraph_parts = []
                for r in p.findall('w:r', namespaces=ns):
                    # Extrai texto
                    for t in r.findall('.//w:t', namespaces=ns):
                        paragraph_parts.append(t.text or "")

                    # Extrai imagens
                    for drawing in r.findall('.//w:drawing', namespaces=ns):
                        blip = drawing.find('.//a:blip', namespaces=ns)
                        if blip is not None:
                            embed_id = blip.get(f'{{{ns["r"]}}}embed')
                            if embed_id in id_to_image:
                                image_path_in_zip = f"word/{id_to_image[embed_id]}"
                                image_filename = Path(image_path_in_zip).name

                                # Copia imagem para o diretório público
                                with docx_zip.open(image_path_in_zip) as source, open(image_output_dir / image_filename, "wb") as target_file:
                                    shutil.copyfileobj(source, target_file)

                                # Adiciona tag Markdown da imagem
                                web_path = f"/images/aulas/{slug}/{image_filename}"
                                markdown_image_tag = f"\n\n![Descrição da imagem: {image_filename}]({web_path})\n\n"
                                paragraph_parts.append(markdown_image_tag)

                if paragraph_parts:
                    markdown_content.append("".join(paragraph_parts))

        final_markdown = "\n\n".join(markdown_content)

        output_md_path = base_path / f"{slug}.md"
        with open(output_md_path, "w", encoding="utf-8") as f:
            f.write(final_markdown)

        print(f"\n[SUCESSO] Conversão concluída!")
        print(f"O conteúdo Markdown foi salvo em: {output_md_path}")
        print("\nAgora você pode copiar este conteúdo para o seu `seed_lesson.py` ou usá-lo diretamente no banco de dados.")

    except Exception as e:
        print(f"[ERRO FATAL] Falha durante a conversão: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python convert_docx_to_markdown.py \"<caminho_para_o_docx>\" \"<slug_da_aula>\"")
        sys.exit(1)
    convert_docx_to_markdown(sys.argv[1], sys.argv[2])
