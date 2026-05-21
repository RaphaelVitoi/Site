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

import aiofiles
import chromadb
from chromadb.utils import embedding_functions

from llm.budget import GEMINI_KEYS, OPENROUTER_KEYS
from llm.gemini import call_gemini
from llm.openrouter import call_openrouter
from llm.session import get_global_http_session

logger = logging.getLogger(__name__)

# =================================================
# CONFIGURACAO SOTA (Estado da Arte)
# =================================================
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
HYBRID_SEARCH_LEXICAL_WEIGHT = 0.4
HYBRID_SEARCH_N_RESULTS_MULTIPLIER = 5
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


class MemoryRAG:
    def __init__(self, memory_dir: str = ".claude/agent-memory"):
        self.memory_dir = Path(memory_dir)

        db_path = str(self.memory_dir / ".chroma_db")
        self.client = chromadb.PersistentClient(path=db_path)

        self.emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL
        )

        self.collection = self.client.get_or_create_collection(
            name="agent_collective_memory",
            embedding_function=self.emb_fn,  # type: ignore
        )

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
        except Exception as e:  # noqa: BLE001
            logger.error(f"[RAG] Falha ao ler ou parsear o manifesto de ingestao: {e}")
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

    async def _extract_text_from_file(self, file_path: Path) -> str:
        if file_path.suffix.lower() == ".docx":

            def _read_docx_sync():
                from docx import Document  # type: ignore

                doc = Document(file_path)
                return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

            try:
                # SOTA: Isolamento de I/O sincrono pesado para nao afogar o Async Event Loop
                return await asyncio.to_thread(_read_docx_sync)
            except Exception as e:  # noqa: BLE001
                logger.error(
                    f"[RAG] Falha ao processar arquivo .docx ({file_path.name}): {e}"
                )
                return ""
        else:
            async with aiofiles.open(
                file_path, "r", encoding="utf-8", errors="ignore"
            ) as f:
                return await f.read()

    async def _process_single_file(self, file_path: Path) -> list[str]:
        if ".chroma_db" in str(file_path):
            return []

        source_name = (
            file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
        )
        content = await self._extract_text_from_file(file_path)

        if not content:
            return []

        chunks = self._chunk_text(content)
        ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]
        metadatas: Any = [
            {"agent": source_name, "source": str(file_path)} for _ in chunks
        ]

        if chunks:
            await asyncio.to_thread(
                self.collection.upsert, documents=chunks, metadatas=metadatas, ids=ids
            )
            logger.info(f"Ingeridos {len(chunks):02d} fragmentos de: {source_name}")
        return ids

    async def _purge_obsolete_memories(self, all_generated_ids: set) -> None:
        try:
            # SOTA Guard: include=[] previne OOM (Out of Memory) e colapso de I/O no SQLite.
            # Extrai estritamente os IDs, barrando o carregamento dos vetores e textos na RAM.
            existing_data = await asyncio.to_thread(self.collection.get, include=[])
            existing_ids = set(existing_data.get("ids", []))
            ids_to_delete = list(existing_ids - all_generated_ids)
            if ids_to_delete:
                await asyncio.to_thread(self.collection.delete, ids=ids_to_delete)
                logger.info(
                    f"Expurgados {len(ids_to_delete)} fragmentos obsoletos (Limpeza de Entropia)."
                )
        except Exception as e:  # noqa: BLE001
            logger.error(f"[RAG] Erro ao limpar memórias antigas: {e}")

    async def ingest_all_memories(self):
        logger.info(
            "[RAG] Iniciando expansao de consciencia (Memorias + Base de Conhecimento)..."
        )
        base_path = Path(__file__).parent
        manifest_path = base_path / "rag_ingestion_manifest.json"

        manifest = await self._read_manifest(manifest_path)
        if not manifest:
            return

        target_files = self._collect_target_files(manifest, base_path)
        all_generated_ids = set()

        for file_path in target_files:
            ids = await self._process_single_file(file_path)
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
        except Exception as e:  # noqa: BLE001
            logger.error(f"[RAG] Erro inesperado na expansao de query: {e}")
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

            scored_docs.append({
                "doc": doc,
                "agent": metadatas[i]["agent"],
                "source": metadatas[i].get("source", "N/A"),
                "score": hybrid_score,
            })

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
        except Exception as e:  # noqa: BLE001
            logger.error(f"[RAG] Falha na consulta ChromaDB: {e}")
            return ""


if __name__ == "__main__":
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
    else:
        asyncio.run(rag.ingest_all_memories())
