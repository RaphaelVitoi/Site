import sys
import os
import re
import json
import asyncio
from pathlib import Path
import logging
import chromadb
from chromadb.utils import embedding_functions
import aiofiles

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
            embedding_function=self.emb_fn
        )

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """Quebra o texto em fragmentos, respeitando os limites dos parágrafos."""
        if overlap >= chunk_size:
            overlap = chunk_size // 10  # Fallback anti-entropia para prevenir loops infinitos

        if not text:
            return []

        paragraphs = text.split('\n\n')
        all_chunks = []

        for paragraph in paragraphs:
            p = paragraph.strip()
            if not p:
                continue

            if len(p) <= chunk_size:
                all_chunks.append(p)
            else:
                # Se o parágrafo for muito longo, divida-o com sobreposição
                start = 0
                while start < len(p):
                    end = start + chunk_size
                    all_chunks.append(p[start:end])
                    start += chunk_size - overlap

        return all_chunks

    async def _read_manifest(self, manifest_path: Path) -> dict:
        if not manifest_path.exists():
            logging.error(f"[RAG] Manifesto de ingestao nao encontrado em {manifest_path}. Abortando.")
            return {}

        try:
            async with aiofiles.open(manifest_path, "r", encoding="utf-8") as f:
                manifest_content = await f.read()
                manifest_content = re.sub(r"//.*", "", manifest_content)
                return json.loads(manifest_content)
        except Exception as e:
            logging.error(f"[RAG] Falha ao ler ou parsear o manifesto de ingestao: {e}")
            return {}

    def _collect_target_files(self, manifest: dict, base_path: Path) -> set:
        target_files = []
        for source in manifest.get("sources", []):
            source_path_str = source.get("path", ".")
            source_path = (base_path / source_path_str).resolve()
            for pattern in source.get("patterns", []):
                target_files.extend(list(source_path.rglob(pattern)))
        return set(target_files)

    async def _extract_text_from_file(self, file_path: Path) -> str:
            if file_path.suffix.lower() == '.docx':
                try:
                    from docx import Document
                    doc = Document(file_path)
                    return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
                except (ImportError, Exception):
                    logging.error("[RAG] python-docx nao instalado. Ignorando arquivo .docx")
                    return ""
            else:
                async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return await f.read()

    async def _process_single_file(self, file_path: Path) -> list[str]:
        if ".chroma_db" in str(file_path):
            return []

        source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
        content = await self._extract_text_from_file(file_path)

        if not content:
            return []

        chunks = self._chunk_text(content)
        ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"agent": source_name, "source": str(file_path)} for _ in chunks]

        if chunks:
            await asyncio.to_thread(
                self.collection.upsert,
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            logging.info(f"Ingeridos {len(chunks):02d} fragmentos de: {source_name}")
        return ids

    async def _purge_obsolete_memories(self, all_generated_ids: set) -> None:
        try:
            existing_data = await asyncio.to_thread(self.collection.get)
            existing_ids = set(existing_data.get('ids', []))
            ids_to_delete = list(existing_ids - all_generated_ids)
            if ids_to_delete:
                await asyncio.to_thread(self.collection.delete, ids=ids_to_delete)
                logging.info(f"Expurgados {len(ids_to_delete)} fragmentos obsoletos (Limpeza de Entropia).")
        except Exception as e:
            logging.error(f"[RAG] Erro ao limpar memórias antigas: {e}")

    async def ingest_all_memories(self):
        logging.info("[RAG] Iniciando expansao de consciencia (Memorias + Base de Conhecimento)...")
        base_path = Path(__file__).parent
        manifest_path = base_path / "data" / "rag_ingestion_manifest.json"

        manifest = await self._read_manifest(manifest_path)
        if not manifest:
            return

        target_files = self._collect_target_files(manifest, base_path)
        all_generated_ids = set()

        for file_path in target_files:
            ids = await self._process_single_file(file_path)
            all_generated_ids.update(ids)

        await self._purge_obsolete_memories(all_generated_ids)

    async def _expand_query(self, question: str) -> list[str]:
        """Usa um LLM rapido para gerar variacoes e palavras-chave da pergunta original."""
        try:
            # Lazy import para evitar problemas de dependencia circular
            from task_executor import call_gemini, call_openrouter, GEMINI_KEYS, OPENROUTER_KEYS
            import aiohttp

            system_prompt = "Voce e um especialista em search query expansion. Dada uma pergunta, gere 4 variacoes ou perguntas relacionadas que capturem a mesma intencao, mas com palavras-chave diferentes. Retorne apenas uma lista de strings em formato JSON, nada mais."
            user_prompt = f"Pergunta original: '{question}'"

            async with aiohttp.ClientSession() as session:
                # Prioridade 1: Chaves gratuitas do Google (via direta)
                if GEMINI_KEYS:
                    try:
                        logging.info("[RAG] Tentando expansao de query via Gemini (Free Tier)...")
                        response, _ = await call_gemini(session, "gemini-1.5-flash-latest", system_prompt, user_prompt, GEMINI_KEYS[0])
                        expanded_queries = json.loads(response.strip('`').strip('json\n').strip())
                        return [question] + expanded_queries
                    except Exception as e:
                        logging.warning(f"[RAG] Falha na expansao via Gemini (Free Tier): {e}. Tentando fallback para OpenRouter.")

                # Prioridade 2 (Fallback): OpenRouter (pode ter custo, mas e rapido)
                if OPENROUTER_KEYS:
                    try:
                        logging.info("[RAG] Tentando expansao de query via OpenRouter (Fallback)...")
                        response, _ = await call_openrouter(session, "google/gemini-flash-1.5", system_prompt, user_prompt, OPENROUTER_KEYS[0])
                        expanded_queries = json.loads(response.strip('`').strip('json\n').strip())
                        return [question] + expanded_queries
                    except Exception as e:
                        logging.warning(f"[RAG] Falha na expansao via OpenRouter: {e}.")
        except Exception as e:
            logging.error(f"[RAG] Erro inesperado na expansao de query: {e}")
        return [question] # Retorna a original em caso de falha

    async def query_memory(self, question: str, n_results: int = 3, local_only: bool = False) -> str:
        try:
            # 1. Expansao da Query com IA para Recall Semantico Superior
            if local_only:
                expanded_queries = [question] # CUSTO ZERO: Pula a LLM e usa apenas embeddings locais
            else:
                expanded_queries = await self._expand_query(question)
            results = await asyncio.to_thread(
                self.collection.query,
                query_texts=expanded_queries,
                n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                include=["documents", "metadatas", "distances"]
            )

            if not results['documents'] or not results['documents'][0]:
                return ""

            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            distances = results['distances'][0]

            # 2. Reranking com Busca Lexical SOTA (BM25-lite / Keyword Boost)
            query_terms = set(re.findall(r'\b\w{3,}\b', question.lower()))

            scored_docs = []
            for i, doc in enumerate(documents):
                doc_terms = set(re.findall(r'\b\w{3,}\b', doc.lower()))

                # Jaccard similarity for lexical match score
                intersection = len(query_terms.intersection(doc_terms))
                union = len(query_terms.union(doc_terms))
                lexical_score = intersection / union if union > 0 else 0

                semantic_score = 1.0 / (1.0 + distances[i])

                # Weighted hybrid score
                hybrid_score = (semantic_score * (1 - HYBRID_SEARCH_LEXICAL_WEIGHT)) + (lexical_score * HYBRID_SEARCH_LEXICAL_WEIGHT)

                scored_docs.append({
                    'doc': doc,
                    'agent': metadatas[i]['agent'],
                    'source': metadatas[i].get('source', 'N/A'),
                    'score': hybrid_score
                })

            # 3. Reranking e Seleção Final
            scored_docs.sort(key=lambda x: x['score'], reverse=True)
            top_docs = scored_docs[:n_results]

            output_parts = ["\n=== MENTE COLETIVA (BUSCA HÍBRIDA SOTA) ==="]
            for i, item in enumerate(top_docs):
                output_parts.append(f"--- Fragmento #{i+1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n")
            return "\n".join(output_parts)
        except Exception as e:
            logging.error(f"[RAG] Falha na consulta ChromaDB: {e}")
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
            logging.error("Uso: python memory_rag.py [ingest | query 'pergunta']")
    else:
        asyncio.run(rag.ingest_all_memories())
