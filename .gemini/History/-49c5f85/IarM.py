import os
import sys

# =================================================
# BLINDAGEM DE I/O REDE (Hugging Face / RAG Friccao Zero)
# =================================================
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import asyncio
import json
import logging
import re
from pathlib import Path
from typing import Any
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

import aiofiles
import chromadb
from chromadb.utils import embedding_functions
# Configuração SOTA (Fricção Zero)
CHROMA_DB_DIR = ".chroma_db"
CHROMA_PATH = Path(__file__).parent / CHROMA_DB_DIR

from llm.budget import GEMINI_KEYS, OPENROUTER_KEYS
from llm.gemini import call_gemini
from llm.openrouter import call_openrouter
from llm.session import get_global_http_session

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")
logger = logging.getLogger(__name__)

# =================================================
# CONFIGURACAO SOTA (Estado da Arte)
# =================================================
# SOTA Limit: all-MiniLM-L6-v2 trunca apos 256 tokens (~1200 chars). Valores acima geram Massa Escura Vetorial.
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 300
HYBRID_SEARCH_N_RESULTS_MULTIPLIER = 5
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
HYBRID_SEARCH_LEXICAL_WEIGHT = 0.4
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

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # Persistência Vetorial
    logger.info("[SOTA RAG] Compilando tensores no banco de dados Chroma...")
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(CHROMA_PATH)
    )
    logger.info("[SOTA RAG] Ingestão concluída e indexada. A Mente Coletiva foi hidratada.")

class MemoryRAG:
    def __init__(self, memory_dir: str = ".claude/agent-memory"):
        self.memory_dir = Path(memory_dir)
        db_path = str(self.memory_dir / CHROMA_DB_DIR)
        self.client = chromadb.PersistentClient(path=db_path)

        # SOTA: Migracao para ONNX Runtime (Erradicacao do Cold-Start do PyTorch)
        self.emb_fn = embedding_functions.ONNXMiniLM_L6_V2()

        try:
            self.collection = self.client.get_or_create_collection(
                name="agent_collective_memory",
                embedding_function=self.emb_fn,  # type: ignore
            )
        except Exception as e:
            if "Embedding function conflict" in str(e):
                logger.warning(
                    "[SOTA] Conflito de Engine Vetorial detectado (PyTorch vs ONNX). Aniquilando memoria obsoleta e recriando..."
                )
                self.client.delete_collection("agent_collective_memory")
                self.collection = self.client.create_collection(
                    name="agent_collective_memory",
                    embedding_function=self.emb_fn,  # type: ignore
                )
            else:
                raise

    def _hard_split_sentence(
        self, sentence: str, chunk_size: int, overlap: int
    ) -> list[str]:
        """Aplica quebra brusca com heuristica de espaco para strings sem pontuacao."""
        chunks = []
        start = 0
        while start < len(sentence):
            end = start + chunk_size
            if end < len(sentence):
                last_space = sentence.rfind(" ", start, end)
                if last_space > start + (chunk_size // 2):
                    end = last_space
            chunks.append(sentence[start:end].strip())
            start = end - overlap
        return chunks

    def _slide_buffer(
        self,
        buffer: list[str],
        current_len: int,
        next_len: int,
        chunk_size: int,
        overlap: int,
    ) -> int:
        """Ajusta o buffer de frases preservando a sobreposicao semantica."""
        while buffer and current_len > overlap:
            removed = buffer.pop(0)
            current_len -= len(removed) + 1
        if current_len + next_len + 1 > chunk_size:
            buffer.clear()
            current_len = 0
        return current_len

    def _handle_oversized_sentence(
        self,
        sentence: str,
        chunks: list[str],
        buffer: list[str],
        chunk_size: int,
        overlap: int,
    ) -> int:
        """Processa frases colossalmente longas e anexa ao resultado."""
        if buffer:
            chunks.append(" ".join(buffer))
            buffer.clear()
        chunks.extend(self._hard_split_sentence(sentence, chunk_size, overlap))
        return 0

    def _chunk_long_paragraph(
        self, paragraph: str, chunk_size: int, overlap: int
    ) -> list[str]:
        """Processa paragrafos longos preservando integridade semantica de frases e formulas."""
        sentences = paragraph.replace(". ", ".[SPLIT]").split("[SPLIT]")
        chunks = []
        buffer = []
        current_len = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if len(sentence) > chunk_size:
                current_len = self._handle_oversized_sentence(
                    sentence, chunks, buffer, chunk_size, overlap
                )
                continue

            if current_len + len(sentence) + (1 if buffer else 0) > chunk_size:
                chunks.append(" ".join(buffer))
                current_len = self._slide_buffer(
                    buffer, current_len, len(sentence), chunk_size, overlap
                )

            buffer.append(sentence)
            current_len += len(sentence) + (1 if len(buffer) > 1 else 0)

        if buffer:
            chunks.append(" ".join(buffer))
        return chunks

    def _chunk_text(
        self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP
    ) -> list[str]:
        """Quebra o texto em fragmentos, respeitando os limites semanticos (paragrafos e frases)."""
        if overlap >= chunk_size:
            overlap = (
                chunk_size // 10
            )  # Fallback anti-entropia para prevenir loops infinitos

        if not text:
            return []

        text = text.replace("\r\n", "\n")
        paragraphs = text.split("\n\n")
        all_chunks = []

        for paragraph in paragraphs:
            p = paragraph.strip()
            if not p:
                continue

            if len(p) <= chunk_size:
                all_chunks.append(p)
            else:
                all_chunks.extend(self._chunk_long_paragraph(p, chunk_size, overlap))

        return all_chunks

    async def _read_manifest(self, manifest_path: Path) -> dict:
        if not manifest_path.exists():
            logger.error(
                f"[RAG] Manifesto de ingestao nao encontrado em {manifest_path}. Abortando."
            )
            return {}

        try:
            async with aiofiles.open(manifest_path, "r", encoding="utf-8") as f:
                manifest_content = await f.read()
                # SOTA: Expurgar comentários // sem corromper URLs dentro de strings (ex: "http://...")
                manifest_content = re.sub(
                    r'("(?:\\.|[^"\\])*")|//.*',
                    lambda m: m.group(1) if m.group(1) else "",
                    manifest_content,
                )
                return json.loads(manifest_content)
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Falha ao ler ou parsear o manifesto de ingestao.")
            return {}

    def _collect_target_files(self, manifest: dict, base_path: Path) -> set:
        target_files = []
        for source in manifest.get("sources", []):
            source_path_str = source.get("path", ".")
            source_path = (base_path / source_path_str).resolve()

            # SOTA: Blindagem absoluta contra Path Traversal (LFI) via Manifesto
            if not source_path.is_relative_to(base_path.resolve()):
                logger.error(
                    f"[SEC] Bloqueio de LFI/Traversal. O caminho de ingestao escapa a raiz: {source_path}"
                )
                continue

            for pattern in source.get("patterns", []):
                target_files.extend(list(source_path.rglob(pattern)))
        return set(target_files)

    async def _extract_docx(self, file_path: Path) -> str:
        def _read_docx_sync():
            from docx import Document  # type: ignore

            doc = Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

        try:
            return await asyncio.wait_for(
                asyncio.to_thread(_read_docx_sync), timeout=60
            )
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair DOCX: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(
                f"[RAG] Falha ao processar arquivo .docx ({file_path.name})."
            )
            return ""

    async def _extract_pdf(self, file_path: Path) -> str:
        def _read_pdf_sync():
            try:
                import pypdf  # type: ignore

                reader = pypdf.PdfReader(str(file_path))
                return "\n".join(
                    page.extract_text() for page in reader.pages if page.extract_text()
                )
            except ImportError:
                logger.warning(
                    "[RAG] 'pypdf' ausente. Execute 'pip install pypdf' para indexar PDFs."
                )
                return ""

        try:
            return await asyncio.wait_for(
                asyncio.to_thread(_read_pdf_sync), timeout=120
            )
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (120s) ao extrair PDF: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(f"[RAG] Falha ao extrair texto do PDF ({file_path.name}).")
            return ""

    async def _extract_csv(self, file_path: Path) -> str:
        def _read_csv_sync():
            try:
                import pandas as pd  # type: ignore

                # SOTA: Limita a 1000 linhas para evitar OOM no RAG
                df = pd.read_csv(str(file_path), nrows=1000)
                return df.to_markdown(index=False) or ""
            except ImportError:
                logger.warning(
                    "[RAG] 'pandas' ausente. Execute 'pip install pandas' para indexar CSVs."
                )
                return ""

        try:
            return await asyncio.wait_for(asyncio.to_thread(_read_csv_sync), timeout=60)
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair CSV: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(f"[RAG] Falha ao extrair texto do CSV ({file_path.name}).")
            return ""

    async def _extract_xlsx(self, file_path: Path) -> str:
        def _read_xlsx_sync():
            try:
                import pandas as pd  # type: ignore

                # SOTA: Limita a 1000 linhas para evitar OOM no RAG
                df = pd.read_excel(str(file_path), nrows=1000)
                return df.to_markdown(index=False) or ""
            except ImportError:
                logger.warning(
                    "[RAG] 'pandas' ou 'openpyxl' ausentes. Execute 'pip install pandas openpyxl' para indexar Excel."
                )
                return ""

        try:
            return await asyncio.wait_for(
                asyncio.to_thread(_read_xlsx_sync), timeout=60
            )
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair XLSX: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(
                f"[RAG] Falha ao extrair texto do XLSX ({file_path.name})."
            )
            return ""

    async def _extract_fallback(self, file_path: Path) -> str:
        async with aiofiles.open(
            file_path, "r", encoding="utf-8", errors="ignore"
        ) as f:
            return await f.read()

    async def _extract_text_from_file(self, file_path: Path) -> str:
        ext = file_path.suffix.lower()
        if ext == ".docx":
            return await self._extract_docx(file_path)
        elif ext == ".pdf":
            return await self._extract_pdf(file_path)
        elif ext == ".csv":
            return await self._extract_csv(file_path)
        elif ext == ".xlsx":
            return await self._extract_xlsx(file_path)
        return await self._extract_fallback(file_path)

    async def _process_single_file(
        self, file_path: Path, file_info: str = ""
    ) -> list[str]:
        # SOTA: Trava de Segurança Termodinâmica (Impede OOM por leitura de arquivos colossais)
        MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limite
        if file_path.stat().st_size > MAX_FILE_SIZE_BYTES:
            logger.warning(
                f"[RAG] Rejeição de arquivo colossal (>{MAX_FILE_SIZE_BYTES} bytes) para evitar vazamento assíncrono: {file_path.name}"
            )
            return []

        if CHROMA_DB_DIR in str(file_path):
            return []

        source_name = (
            file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
        )
        logger.info(f"[RAG] Extraindo '{source_name}{file_path.suffix}' {file_info}...")
        content = await self._extract_text_from_file(file_path)

        if not content:
            return []

        chunks = self._chunk_text(content)
        ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]
        metadatas: Any = [
            {"agent": source_name, "source": str(file_path)} for _ in chunks
        ]

        if chunks:
            # SOTA: Batching Absoluto contra Morte Termica de RAM/SQLite
            BATCH_SIZE = 100
            for i in range(0, len(chunks), BATCH_SIZE):
                await asyncio.to_thread(
                    self.collection.upsert,
                    documents=chunks[i : i + BATCH_SIZE],
                    metadatas=metadatas[i : i + BATCH_SIZE],
                    ids=ids[i : i + BATCH_SIZE],
                )
                # SOTA: Flush do Event Loop para permitir ao Garbage Collector coletar as matrizes WASM
                await asyncio.sleep(0.01)
            logger.info(
                f"[OK] {len(chunks):02d} fragmentos de '{source_name}' vetorizados (Lote Seguro SOTA)."
            )
        return ids

    async def _zero_latency_lexical_fallback(self) -> str:
        """SOTA: Extração direta de macro-contexto via I/O se o motor ONNX/Chroma colapsar."""
        try:
            fallback_docs = []
            # Alvos emergenciais que contem o DNA e os Invariantes do projeto
            core_files = [
                self.memory_dir.parent / "project-context.md",
                self.memory_dir.parent / "GLOBAL_INSTRUCTIONS.md",
            ]
            for fpath in core_files:
                if fpath.exists():
                    async with aiofiles.open(
                        fpath, "r", encoding="utf-8", errors="ignore"
                    ) as f:
                        text = await f.read()
                        # Extrai a essência inicial (primeiros 2000 caracteres) para nao estourar tokens
                        fallback_docs.append(
                            f"--- Documento Vital ({fpath.name}) ---\n{text[:2000]}...\n"
                        )

            if fallback_docs:
                return (
                    "\n=== MENTE COLETIVA (FALLBACK DE EMERGÊNCIA - I/O DIRETO) ===\n"
                    + "\n".join(fallback_docs)
                )
        except Exception:
            logger.exception("[RAG] Fallback Lexical também colapsou.")
        return ""

    async def _purge_obsolete_memories(self, all_generated_ids: set) -> None:
        try:
            # SOTA Guard: include=[] previne OOM (Out of Memory) e colapso de I/O no SQLite.
            # Extrai estritamente os IDs, barrando o carregamento dos vetores e textos na RAM.
            existing_data = await asyncio.to_thread(self.collection.get, include=[])
            existing_ids = set(existing_data.get("ids", []))
            ids_to_delete = list(existing_ids - all_generated_ids)

            if ids_to_delete:
                # SOTA: Evita Memory Spike e Erro de Parâmetros Limite no SQLite do Chroma
                BATCH_SIZE = 500
                for i in range(0, len(ids_to_delete), BATCH_SIZE):
                    await asyncio.to_thread(
                        self.collection.delete, ids=ids_to_delete[i : i + BATCH_SIZE]
                    )
                    await asyncio.sleep(0.01)
                logger.info(
                    f"Expurgados {len(ids_to_delete)} fragmentos obsoletos (Limpeza de Entropia)."
                )
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Erro ao limpar memórias antigas.")

    async def ingest_all_memories(self):
        import time

        logger.info(
            "[RAG] Iniciando expansao de consciencia (Memorias + Base de Conhecimento)..."
        )
        base_path = Path(__file__).parent
        manifest_path = base_path / "rag_ingestion_manifest.json"

        manifest = await self._read_manifest(manifest_path)
        if not manifest:
            return

        target_files = list(self._collect_target_files(manifest, base_path))
        total_files = len(target_files)
        all_generated_ids = set()

        start_time = time.time()

        for idx, file_path in enumerate(target_files, 1):
            elapsed = time.time() - start_time
            if idx > 1:
                avg_time = elapsed / (idx - 1)
                eta_seconds = avg_time * (total_files - idx + 1)
                eta_str = (
                    f"ETA: {eta_seconds / 60:.1f}m"
                    if eta_seconds > 60
                    else f"ETA: {eta_seconds:.0f}s"
                )
            else:
                eta_str = "ETA: calculando..."

            file_info = f"[{idx}/{total_files} | {eta_str}]"
            ids = await self._process_single_file(file_path, file_info)
            all_generated_ids.update(ids)

        await self._purge_obsolete_memories(all_generated_ids)

    async def _fetch_expanded_query(
        self, session, system_prompt: str, user_prompt: str
    ) -> str:
        if GEMINI_KEYS:
            try:
                logger.info(
                    "[RAG] Tentando expansao de query via Gemini (Free Tier)..."
                )
                response, _ = await call_gemini(
                    session,
                    "gemini-1.5-flash-latest",
                    system_prompt,
                    user_prompt,
                    GEMINI_KEYS[0],
                )
                return response
            except Exception as e:  # noqa: BLE001
                logger.warning(
                    f"[RAG] Falha na expansao via Gemini (Free Tier): {e}. Tentando fallback para OpenRouter."
                )

        if OPENROUTER_KEYS:
            try:
                logger.info(
                    "[RAG] Tentando expansao de query via OpenRouter (Fallback)..."
                )
                response, _ = await call_openrouter(
                    session,
                    "google/gemini-flash-1.5",
                    system_prompt,
                    user_prompt,
                    OPENROUTER_KEYS[0],
                )
                return response
            except Exception as e:  # noqa: BLE001
                logger.warning(f"[RAG] Falha na expansao via OpenRouter: {e}.")
        return ""

    async def _expand_query(self, question: str) -> list[str]:
        """Usa um LLM rapido para gerar variacoes e palavras-chave da pergunta original."""
        try:
            system_prompt = "Voce e um especialista em search query expansion. Dada uma pergunta, gere 4 variacoes ou perguntas relacionadas que capturem a mesma intencao, mas com palavras-chave diferentes. Retorne apenas uma lista de strings em formato JSON, nada mais."
            user_prompt = f"Pergunta original: '{question}'"

            session = await get_global_http_session()

            response = await self._fetch_expanded_query(
                session, system_prompt, user_prompt
            )
            if response:
                match = re.search(r"\[.*\]", response, re.DOTALL)
                if match:
                    try:
                        expanded_queries = json.loads(match.group(0))
                        if expanded_queries:
                            return [question] + expanded_queries
                    except json.JSONDecodeError as e:
                        logger.debug(
                            f"[RAG] Falha ao decodificar JSON na expansao de query: {e}"
                        )
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Erro inesperado na expansao de query.")
        return [question]  # Retorna a original em caso de falha

    def _rank_documents(
        self,
        question: str,
        documents: list[str],
        metadatas: Any,
        distances: list[float],
        n_results: int,
    ) -> list[dict]:
        # 2. Reranking com Busca Lexical SOTA (BM25-lite / Keyword Boost)
        query_terms = set(re.findall(r"\b\w{3,}\b", question.lower()))

        scored_docs = []
        for i, doc in enumerate(documents):
            doc_terms = set(re.findall(r"\b\w{3,}\b", doc.lower()))

            # Jaccard similarity for lexical match score
            intersection = len(query_terms.intersection(doc_terms))
            union = len(query_terms.union(doc_terms))
            lexical_score = intersection / union if union > 0 else 0

            semantic_score = 1.0 / (1.0 + distances[i])
            hybrid_score = (semantic_score * (1 - HYBRID_SEARCH_LEXICAL_WEIGHT)) + (
                lexical_score * HYBRID_SEARCH_LEXICAL_WEIGHT
            )

            scored_docs.append(
                {
                    "doc": doc,
                    "agent": metadatas[i]["agent"],
                    "source": metadatas[i].get("source", "N/A"),
                    "score": hybrid_score,
                }
            )

        # 3. Reranking e Seleção Final
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return scored_docs[:n_results]

    def _process_query_result_row(
        self,
        docs_row: list[str],
        metas_row: list,
        dists_row: list[float],
        unique_docs: dict,
    ) -> None:
        for j, doc in enumerate(docs_row):
            current_meta = (
                metas_row[j]
                if metas_row and j < len(metas_row)
                else {"agent": "Unknown", "source": "N/A"}
            )
            current_dist = dists_row[j] if dists_row and j < len(dists_row) else 0.0

            if doc not in unique_docs:
                unique_docs[doc] = {"meta": current_meta, "dist": current_dist}
            else:
                unique_docs[doc]["dist"] = min(unique_docs[doc]["dist"], current_dist)

    def _flatten_and_deduplicate_results(
        self, results: Any
    ) -> tuple[list[str], list, list[float]]:
        """SOTA: Achatamento e Deduplicacao Vetorial (Matriz Bidimensional)"""
        res_docs = results.get("documents")
        if not res_docs:
            return [], [], []

        unique_docs = {}
        res_metas = results.get("metadatas") or []
        res_dists = results.get("distances") or []

        for i, docs_row in enumerate(res_docs):
            if not docs_row:
                continue
            metas_row = res_metas[i] if i < len(res_metas) else []
            dists_row = res_dists[i] if i < len(res_dists) else []
            self._process_query_result_row(docs_row, metas_row, dists_row, unique_docs)

        documents = list(unique_docs.keys())
        metadatas = [val["meta"] for val in unique_docs.values()]
        distances = [val["dist"] for val in unique_docs.values()]
        return documents, metadatas, distances

    async def query_memory(
        self, question: str, n_results: int = 3, local_only: bool = False
    ) -> str:
        try:
            # 1. Expansao da Query com IA para Recall Semantico Superior
            expanded_queries = (
                [question] if local_only else await self._expand_query(question)
            )
            results = await asyncio.to_thread(
                self.collection.query,
                query_texts=expanded_queries,
                n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                include=["documents", "metadatas", "distances"],
            )

            documents, metadatas, distances = self._flatten_and_deduplicate_results(
                results
            )
            if not documents:
                return ""

            top_docs = self._rank_documents(
                question, documents, metadatas, distances, n_results
            )

            output_parts = ["\n=== MENTE COLETIVA (BUSCA HÍBRIDA SOTA) ==="]
            for i, item in enumerate(top_docs):
                output_parts.append(
                    f"--- Fragmento #{i + 1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n"
                )
            return "\n".join(output_parts)
        except Exception:  # noqa: BLE001
            logger.exception(
                "[RAG] Colapso Crítico no ChromaDB/ONNX. Acionando Fallback Lexical (Latência Zero)..."
            )
            # Bypass de segurança para evitar que o LLM responda sem contexto
            return await self._zero_latency_lexical_fallback()


if __name__ == "__main__":
    # SOTA: Habilita o output no console para que o ETA e o progresso
    # sejam visíveis quando executado via nexus-cli. Sem isso, o Python
    # silencia os logs (nível INFO) e gera a ilusão de congelamento.
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    rag = MemoryRAG()
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "ingest":
            asyncio.run(rag.ingest_all_memories())
        elif cmd == "query" and len(sys.argv) > 2:
            question = sys.argv[2]
            result = asyncio.run(rag.query_memory(question))
            print(result)
        else:
            logger.error("Uso: python memory_rag.py [ingest | query 'pergunta']")
    if len(sys.argv) > 1 and sys.argv[1].lower() == "ingest":
        target_dir = os.environ.get("GDRIVE_PDF_PATH", r"C:\Users\Raphael\Google Drive\Poker_PDFs")
        ingest_drive_pdfs(target_dir)
    else:
        asyncio.run(rag.ingest_all_memories())
        print("Uso SOTA: python memory_rag.py ingest")
