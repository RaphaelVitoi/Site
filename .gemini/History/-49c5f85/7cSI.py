import os
import sys
import logging
from pathlib import Path
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

# Configuração SOTA (Fricção Zero)
CHROMA_PATH = Path(__file__).parent / ".chroma_db"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
EMBEDDING_MODEL = "nomic-embed-text" # Requer: ollama pull nomic-embed-text

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")
logger = logging.getLogger(__name__)

def ingest_drive_pdfs(drive_path: str):
    """Ingestão Vetorial de PDF para RAG do Oráculo Gemma."""
    logger.info(f"[SOTA RAG] Iniciando mapeamento no diretório: {drive_path}")

    if not os.path.exists(drive_path):
        logger.error(f"[ERRO CRITICO] O caminho não existe ou está inacessível: {drive_path}")
        sys.exit(1)

    loader = PyPDFDirectoryLoader(drive_path)
    docs = loader.load()
    logger.info(f"[SOTA RAG] {len(docs)} páginas extraídas com sucesso.")

    if not docs:
        logger.warning("[SOTA RAG] Nenhum PDF encontrado. Abortando ingestão.")
        return

    # Chunking Semântico rigoroso para materiais de Teoria dos Jogos (ICM/Nash)
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = splitter.split_documents(docs)
    logger.info(f"[SOTA RAG] {len(chunks)} fragmentos (chunks) forjados.")

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_BASE_URL)

    # Persistência Vetorial
    logger.info("[SOTA RAG] Compilando tensores no banco de dados Chroma...")
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(CHROMA_PATH)
    )
    logger.info("[SOTA RAG] Ingestão concluída e indexada. A Mente Coletiva foi hidratada.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].lower() == "ingest":
        target_dir = os.environ.get("GDRIVE_PDF_PATH", r"C:\Users\Raphael\Google Drive\Poker_PDFs")
        ingest_drive_pdfs(target_dir)
    else:
        print("Uso SOTA: python memory_rag.py ingest")
