import logging
from pathlib import Path
import sys

try:
    import chromadb
except ImportError:
    print("[ENTROPIA] chromadb nao instalado. Execute: pip install chromadb")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("RAG_INGESTION")


def ingest_research_docs():
    base_dir = Path(__file__).parent.parent.parent.resolve()
    research_dir = base_dir / "research"
    db_path = base_dir / "data" / "chroma_db"

    if not research_dir.exists():
        logger.error(f"[ERRO] Diretorio de pesquisa nao encontrado: {research_dir}")
        return

    logger.info("=== [SOTA] INICIANDO INGESTAO VETORIAL ===")
    logger.info(f"Alvo: {research_dir}")

    client = chromadb.PersistentClient(path=str(db_path))
    collection = client.get_or_create_collection(name="research_docs")

    documents = []
    ids = []
    metadatas = []

    for file_path in research_dir.glob("**/*"):
        if file_path.is_file() and file_path.suffix.lower() in [".md", ".txt"]:
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                if not content.strip():
                    continue

                documents.append(content)
                ids.append(file_path.name)
                metadatas.append({"source": str(file_path.relative_to(base_dir))})
                logger.info(f"  + Quantizado: {file_path.name} ({len(content)} bytes)")
            except Exception as e:  # noqa: BLE001
                logger.warning(f"  ! Falha ao ler {file_path.name}: {e}")

    if documents:
        logger.info(f"Gravando {len(documents)} vetores na colecao 'research_docs'...")
        # upsert impede duplicacao se voce rodar o script novamente apos editar os textos
        collection.upsert(documents=documents, ids=ids, metadatas=metadatas)
        logger.info("=== INGESTAO CONCLUIDA COM FRICCAO ZERO ===")
    else:
        logger.info("Nenhum artefato textual encontrado para ingestao.")


if __name__ == "__main__":
    ingest_research_docs()
