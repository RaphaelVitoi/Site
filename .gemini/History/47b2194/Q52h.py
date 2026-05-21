import sys
import os

# SOTA: Otimizacao estrita de alocacao de memoria para evitar falhas (Memory Allocation Failed)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import re
import json
import asyncio
from pathlib import Path
import logging
import chromadb
from chromadb.utils import embedding_functions
import aiofiles
import zipfile
import xml.etree.ElementTree as ET

# =================================================
# CONFIGURACAO SOTA (Estado da Arte)
# =================================================
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
HYBRID_SEARCH_LEXICAL_WEIGHT = 0.4
HYBRID_SEARCH_N_RESULTS_MULTIPLIER = 5
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
DOCX_NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def _read_docx_sync(path: Path) -> str:
    """I/O blocante e parsing XML isolados no escopo do modulo (SOTA Anti-Alocacao)."""
    text_parts = []
    with zipfile.ZipFile(path, 'r') as docx_zip:
        xml_content = docx_zip.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        for p in tree.findall('.//w:p', namespaces=DOCX_NS):
            texts = [t.text for t in p.findall('.//w:t', namespaces=DOCX_NS) if t.text]
            if texts:
                text_parts.append(''.join(texts))
    return '\n'.join(text_parts)
class MemoryRAG:
    def __init__(self, memory_dir: str = ".claude/agent-memory"):
        self.base_dir = Path(__file__).parent.resolve()
        self.memory_dir = (self.base_dir / memory_dir).resolve()

        # SOTA: Garantir que o diretorio base exista antes de instanciar o ChromaDB
        self.memory_dir.mkdir(parents=True, exist_ok=True)

        db_path = str(self.memory_dir / ".chroma_db")
        self.client = chromadb.PersistentClient(path=db_path)

        self.emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL,
            device="cpu" # SOTA: Força CPU para evitar alocacao agressiva/fragmentada de buffers
        )

        self.collection = self.client.get_or_create_collection(
            name="agent_collective_memory",
            embedding_function=self.emb_fn  # type: ignore
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
                    return await asyncio.to_thread(_read_docx_sync, file_path)
                except Exception as e:
                    logging.error(f"[RAG] Erro ao ler arquivo .docx: {e}")
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
                metadatas=metadatas,  # type: ignore
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

        target_files = await asyncio.to_thread(self._collect_target_files, manifest, base_path)
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

    def _query_and_rerank_sync(self, expanded_queries: list[str], question: str, n_results: int) -> list[dict]:
        """Executa a I/O do ChromaDB e o calculo intensivo (CPU-bound) do Lexical Score fora do Event Loop."""
        results = self.collection.query(
            query_texts=expanded_queries,
            n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
            include=["documents", "metadatas", "distances"]
        )

        docs = results.get('documents')
        metas = results.get('metadatas')
        dists = results.get('distances')

        if not docs or not docs[0] or not metas or not dists:
            return []

        documents = docs[0]
        metadatas = metas[0]
        distances = dists[0]

        query_terms = set(re.findall(r'\b\w{3,}\b', question.lower()))
        scored_docs = []
        for i, doc in enumerate(documents):
            doc_terms = set(re.findall(r'\b\w{3,}\b', doc.lower()))
            intersection = len(query_terms.intersection(doc_terms))
            union = len(query_terms.union(doc_terms))
            lexical_score = intersection / union if union > 0 else 0
            semantic_score = 1.0 / (1.0 + distances[i])
            hybrid_score = (semantic_score * (1 - HYBRID_SEARCH_LEXICAL_WEIGHT)) + (lexical_score * HYBRID_SEARCH_LEXICAL_WEIGHT)
            scored_docs.append({'doc': doc, 'agent': metadatas[i]['agent'], 'source': metadatas[i].get('source', 'N/A'), 'score': hybrid_score})
        scored_docs.sort(key=lambda x: x['score'], reverse=True)
        return scored_docs[:n_results]

    async def query_memory(self, question: str, n_results: int = 3, local_only: bool = False) -> str:
        try:
            # 1. Expansao da Query com IA para Recall Semantico Superior
            if local_only:
                expanded_queries = [question] # CUSTO ZERO: Pula a LLM e usa apenas embeddings locais
            else:
                expanded_queries = await self._expand_query(question)

            # Friccao Zero: Descarrega a query SQLite e o calculo CPU-bound de Jaccard para a ThreadPool
            top_docs = await asyncio.to_thread(self._query_and_rerank_sync, expanded_queries, question, n_results)

            if not top_docs:
                return ""

            output_parts = ["\n=== MENTE COLETIVA (BUSCA HÍBRIDA SOTA) ==="]
            for i, item in enumerate(top_docs):
                output_parts.append(f"--- Fragmento #{i+1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n")
            return "\n".join(output_parts)
        except Exception as e:
            logging.error(f"[RAG] Falha na consulta ChromaDB: {e}")
            import gc
            gc.collect() # SOTA: Forca coleta de lixo para mitigar vazamento de memoria do C++ (hnswlib)
            if "hnsw" in str(e).lower() or "corrupt" in str(e).lower() or "code: 14" in str(e).lower() or "rustbindingsapi" in str(e).lower():
                logging.critical("[RAG FATAL] O indice vetorial (.chroma_db) foi corrompido fisicamente em um crash anterior.")
                logging.critical("[RAG FATAL] Isso causa vazamento de RAM no motor C++ e derruba o Python (Memory Allocation Failed).")
                logging.critical(">>> ACAO EXIGIDA: Feche o worker e rode: Remove-Item -Recurse -Force .claude/agent-memory/.chroma_db")
            return ""

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(message)s')
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
