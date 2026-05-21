import shutil
import sys
import zipfile
from pathlib import Path


def _process_media_files(
    docx_zip: zipfile.ZipFile, media_files: list, public_dir: Path
) -> list:
    """Middleware isolado para purificacao e copia binaria SOTA."""
    extracted = []
    for item in media_files:
        filename = Path(item).name
        if not filename:
            continue

        source = docx_zip.open(item)
        target_path = public_dir / filename
        with open(target_path, "wb") as target:
            shutil.copyfileobj(source, target)
        extracted.append(filename)
    return extracted


def extract_media(docx_path: str, slug: str):
    docx_file = Path(docx_path)
    if not docx_file.exists() or not docx_file.is_file():
        print(f"[ERRO] Arquivo não encontrado: {docx_path}")
        return

    # Diretorio de destino absoluto baseado na raiz do projeto
    base_path = Path(__file__).parent
    public_dir = base_path / "frontend" / "public" / "images" / "aulas" / slug

    public_dir.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Analisando arquivo: {docx_file.name}")
    print(f"[INFO] Diretório de destino: {public_dir}")

    extracted_images = []

    try:
        with zipfile.ZipFile(docx_file, "r") as docx_zip:
            file_list = docx_zip.namelist()
            media_files = [f for f in file_list if f.startswith("word/media/")]

            if not media_files:
                print("[INFO] Nenhuma imagem encontrada no documento.")
                return

            extracted_images = _process_media_files(docx_zip, media_files, public_dir)

        print(
            f"\n[SUCESSO] {len(extracted_images)} imagem(ns) extraída(s) com Fricção Zero!"
        )
        print("\n=== SINTAXE MARKDOWN SOTA PARA INJEÇÃO ===")
        for img in extracted_images:
            print(f"![Descrição do Gráfico](/images/aulas/{slug}/{img})")

    except zipfile.BadZipFile:
        print("[ERRO] O arquivo fornecido não é um .docx válido.")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python extract_docx_media.py <caminho_para_o_docx> <slug_da_aula>")
        sys.exit(1)

    extract_media(sys.argv[1], sys.argv[2])
