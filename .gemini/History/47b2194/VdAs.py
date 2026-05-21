import sys
import os
import re
import json
import asyncio
import gc
import socket
import ssl
import certifi
from pathlib import Path
import logging
import chromadb
from chromadb.utils import embedding_functions
from task_executor import RAG_IGNORE_PATTERNS # Importa do task_executor para centralizar
import aiofiles

# SOTA 8.0: Desacoplamento da inteligencia de arbitragem
from core.arbitrator import UniversalArbitrator
from task_executor import get_global_http_session, call_perplexity_search, call_tavily_search, PERPLEXITY_KEYS, TAVILY_KEYS, _compress_context

# SOTA: Configuração do nível de log para exibir a ingestão em tempo real
logging.basicConfig(level=logging.INFO, format="%(message)s")

import unicodedata

def enforce_pure_ascii(text: str) -> str:
    """Purificacao absoluta SOTA: Erradica emojis, acentos e caracteres especiais, forcando Pure ASCII."""
    if not text: return ""
    replacements = {
        '“': '"', '”': '"', '‘': "'", '’': "'", '–': '-', '—': '-', '…': '...',
        'º': 'o', 'ª': 'a', 'ç': 'c', 'Ç': 'C', 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'ã': 'a', 'õ': 'o', 'Ã': 'A', 'Õ': 'O',
        'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u', 'Â': 'A', 'Ê': 'E', 'Î': 'I', 'Ô': 'O', 'Û': 'U',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u', 'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
        '”': '"', '“': '"', '’': "'", '‘': "'"
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Destroi qualquer byte nao-ASCII restante
    return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('ASCII')

def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calcula a similaridade de cosseno entre dois vetores para o chunking semantico."""
    dot_product = sum(x * y for x, y in zip(v1, v2))
    mag_v1 = sum(x * x for x in v1) ** 0.5
    mag_v2 = sum(x * x for x in v2) ** 0.5
    if mag_v1 == 0 or mag_v2 == 0:
        return 0.0
    return dot_product / (mag_v1 * mag_v2)


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
        self.base_dir = Path(__file__).parent.resolve()
        self.memory_dir = self.base_dir / memory_dir if not Path(memory_dir).is_absolute() else Path(memory_dir)

        db_path = str(self.memory_dir / ".chroma_db")
        self.client = chromadb.PersistentClient(path=db_path)

        self.emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL
        )

        self.collection = self.client.get_or_create_collection(
            name="omnimaster_symbiotic_memory",
            embedding_function=self.emb_fn
        )

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """Quebra o texto em fragmentos, respeitando os limites dos paragrafos."""
    def _static_chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """Fallback: Quebra o texto em fragmentos de tamanho fixo, respeitando paragrafos."""
        if not text:
            return []

        paragraphs = text.split('\n\n')
        all_chunks = []

        for paragraph in paragraphs:
            p = paragraph.strip()
            if not p:
                continue

            if not p: continue
            if len(p) <= chunk_size:
                all_chunks.append(p)
            else:
                # Se o paragrafo for muito longo, divida-o com sobreposicao
                start = 0
                while start < len(p):
                    end = start + chunk_size
                    all_chunks.append(p[start:end])
                    start += chunk_size - overlap

        return all_chunks

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """
        SOTA: Quebra o texto em fragmentos semânticos, usando embeddings para detectar
        mudanças de tópico, em vez de um split estático.
        """
        if not text:
            return []

        sentences = re.split(r'(?<=[.?!])\s+', text.replace('\n', ' ').strip())
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        if not sentences:
            return self._static_chunk_text(text, chunk_size, overlap)

        try:
            embeddings = self.emb_fn(sentences)
        except Exception as e:
            logging.warning(f"[RAG SEMANTIC CHUNK] Falha ao gerar embeddings: {e}. Usando fallback estatico.")
            return self._static_chunk_text(text, chunk_size, overlap)

        similarities = [_cosine_similarity(embeddings[i], embeddings[i+1]) for i in range(len(embeddings) - 1)]
        if not similarities:
            return [" ".join(sentences)]

        sorted_similarities = sorted(similarities)
        threshold = sorted_similarities[int(len(sorted_similarities) * 0.25)]

        chunks, current_chunk = [], []
        for i, sentence in enumerate(sentences):
            current_chunk.append(sentence)
            if i < len(similarities) and similarities[i] < threshold:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        final_chunks = []
        for chunk in chunks:
            if len(chunk) > chunk_size * 1.2:
                final_chunks.extend(self._static_chunk_text(chunk, chunk_size, overlap))
            else:
                final_chunks.append(chunk)
        return final_chunks

    async def ingest_all_memories(self):
        logging.info("[OMNIMASTER] Iniciando expansao da Memoria Simbiotica (Isomorfismo Inteligente SOTA)...")

        # Carrega o manifesto de ingestao
        manifest_path = self.base_dir / "data" / "rag_ingestion_manifest.json"
        if not manifest_path.exists():
            logging.error(f"[RAG] Manifesto de ingestao nao encontrado em {manifest_path}")
            return

        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                ingestion_manifest = json.load(f)
        except json.JSONDecodeError as e:
            logging.error(f"[RAG] Erro ao parsear o manifesto de ingestao: {e}")
            return

        # Otimizacao SOTA: Busca metadados existentes para comparar mtime
        logging.info("[RAG] Mapeando cache de modificacao de arquivos...")
        existing_metadatas = await asyncio.to_thread(
            self.collection.get, include=["metadatas"]
        )
        source_mtime_cache = {}
        if existing_metadatas and existing_metadatas.get('metadatas'):
            for meta in existing_metadatas['metadatas']:
                source = meta.get('source')
                mtime = meta.get('mtime')
                if source and mtime:
                    # Armazena apenas o mtime mais recente para cada fonte
                    if source not in source_mtime_cache or mtime > source_mtime_cache[source]:
                        source_mtime_cache[source] = mtime

        all_current_files = set()
        files_to_process = []

        # Coleta todos os arquivos com base no manifesto
        for source_item in ingestion_manifest.get("sources", []):
            scan_path = self.base_dir / source_item["path"]
            patterns = source_item["patterns"]
            recursive = source_item.get("recursive", False)

            if not scan_path.exists(): continue

            for pattern in patterns:
                glob_method = scan_path.rglob if recursive else scan_path.glob
                for file_path in glob_method(pattern):
                    if file_path.is_file() and not is_ignored(file_path):
                        all_current_files.add(str(file_path))

                        # Economia Generalizada: Compara mtime para decidir se processa
                        last_known_mtime = source_mtime_cache.get(str(file_path))
                        current_mtime = file_path.stat().st_mtime

                        if last_known_mtime is None or current_mtime > last_known_mtime:
                            files_to_process.append(file_path)
                        else:
                            logging.info(f"[RAG CACHE HIT] Ignorando arquivo inalterado: {file_path.name}")

        def is_ignored(path: Path) -> bool:
            """Verifica se um caminho deve ser ignorado com base nos padroes."""
            return any(p in str(path) for p in RAG_IGNORE_PATTERNS)

        for file_path in files_to_process:
            if is_ignored(file_path): continue

            # Erradicacao do Vazio SOTA (Nao indexa entropia nula)
            if file_path.stat().st_size == 0:
                continue

            # Identifica a fonte para rastreabilidade (nome da pasta pai ou do proprio arquivo)
            source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem

            if file_path.suffix.lower() == '.docx':
                try:
                    from docx import Document
                    doc = Document(file_path)
                    content = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
                    content = enforce_pure_ascii(content)
                except ImportError:
                    logging.warning(f"[RAG] Modulo 'docx' ausente. Ignorando arquivo: {file_path.name}")
                    continue
                except Exception as e:
                    logging.warning(f"[RAG] Erro ao processar arquivo .docx ({file_path.name}): {type(e).__name__} - {str(e)}")
                    continue
            else:
                async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = await f.read()
                    content = enforce_pure_ascii(content)

            chunks = self._chunk_text(content)
            ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]

            # Adiciona mtime aos metadados para cache futuro
            current_mtime = file_path.stat().st_mtime
            metadatas = [{"agent": source_name, "source": str(file_path), "mtime": current_mtime} for _ in chunks]

            if chunks:
                # SOTA: Antes de um upsert, deleta chunks antigos do mesmo arquivo para evitar duplicatas
                await asyncio.to_thread(self.collection.delete, where={"source": str(file_path)})

                await asyncio.to_thread(
                    self.collection.upsert,
                    documents=chunks,
                    metadatas=metadatas,
                    ids=ids
                )
                logging.info(f"[RAG INGEST] Ingeridos {len(chunks):02d} fragmentos de: {source_name}")

        # Sincronia de Exclusao (Purge) Otimizada - Remove memorias de arquivos que nao existem mais no disco
        try:
            logging.info("[RAG PURGE] Verificando arquivos obsoletos no banco de dados vetorial...")
            existing_sources = set(source_mtime_cache.keys())
            deleted_sources = list(existing_sources - all_current_files)

            ids_to_delete = []
            if deleted_sources:
                results = await asyncio.to_thread(self.collection.get, where={"source": {"$in": deleted_sources}}, include=[])
                ids_to_delete = results.get('ids', [])

            if ids_to_delete:
                batch_size = 50 # Fatiamento equilibrado (Velocidade vs Limites do SQLite)
                logging.info(f"[RAG] Iniciando expurgo de {len(ids_to_delete)} fragmentos obsoletos...")
                for i in range(0, len(ids_to_delete), batch_size):
                    batch = ids_to_delete[i:i + batch_size]
                    await asyncio.to_thread(self.collection.delete, ids=batch)
                    logging.info(f"[RAG] Expurgados {min(i + batch_size, len(ids_to_delete))}/{len(ids_to_delete)} fragmentos...")
            else:
                logging.info("[RAG PURGE] Nenhuma memoria obsoleta encontrada. Sincronia perfeita.")
        except Exception as e:
            logging.error(f"[RAG] Erro ao limpar memorias antigas: {e}")

        # SOTA: Forca liberacao massiva de RAM apos engolir o contexto do projeto
        gc.collect()

    def _extract_json_array(self, text: str) -> str:
        """Busca estruturada baseada em pilha (O(N)), imune a lixo apos o JSON e a colchetes literais."""
        start_idx = text.find('[')
        if start_idx == -1:
            raise ValueError("Nenhum array JSON localizado no output.")

        stack = 0
        in_string = False
        escape = False

        for i in range(start_idx, len(text)):
            char = text[i]
            if escape:
                escape = False
                continue
            if char == '\\':
                escape = True
                continue
            if char == '"':
                in_string = not in_string
                continue

            if not in_string:
                if char == '[': stack += 1
                elif char == ']': stack -= 1

                if stack == 0:
                    return text[start_idx:i+1]

        raise ValueError("Matriz JSON nao fechada corretamente.")

    def _robust_json_load(self, text: str) -> list:
        """Extracao cirurgica de matrizes JSON envelopadas em Markdown obedecendo a Lei Zero."""
        cleaned_output = text.strip()
        cleaned_output = re.sub(r"^```(?:json)?|```$", "", cleaned_output, flags=re.IGNORECASE | re.MULTILINE).strip()

        try:
            parsed = json.loads(cleaned_output)
        except json.JSONDecodeError:
            try:
                # Lei Zero SOTA: Extracao topologica estrita via pilha ao inves de Regex cega.
                # Os "band-aids" destrutivos de trailing commas foram expurgados.
                raw_json = self._extract_json_array(cleaned_output)
                parsed = json.loads(raw_json)
            except Exception as e:
                logging.warning(f"[RAG] Falha irrevogavel no parser JSON estrutural: {e}")
                return []

        # Sanitizacao estrita de tipo (ChromaDB requer lista de strings)
        if isinstance(parsed, dict):
            parsed = list(parsed.values())
        if isinstance(parsed, list):
            clean_list = []
            for item in parsed:
                if isinstance(item, str):
                    clean_list.append(item)
                elif isinstance(item, dict) and item:
                    clean_list.append(str(list(item.values())[0]))
            return clean_list
            
        logging.warning("[RAG] Estrutura JSON invalida: O output nao corresponde a uma matriz ou dicionario.")
        return []

    async def _expand_query(self, question: str) -> list[str]:
        """Usa um LLM rapido para gerar variacoes e palavras-chave da pergunta original."""
        try:
            # Lazy import para evitar problemas de dependencia circular
            from task_executor import call_gemini, call_openrouter, GEMINI_ALL_KEYS, OPENROUTER_KEYS, OPENROUTER_ALTERNATIVE_MODELS, get_global_http_session
            import aiohttp

            system_prompt = "Voce e um especialista em search query expansion. Dada uma pergunta, gere 4 variacoes ou perguntas relacionadas que capturem a mesma intencao, mas com palavras-chave diferentes. Retorne apenas uma lista de strings em formato JSON, nada mais. IMPORTANTE: Use apenas PURE ASCII (sem acentos, sem cedilhas, sem caracteres especiais)."
            user_prompt = f"Pergunta original: '{question}'"

            session = await get_global_http_session()
            gemini_failed = True
            if GEMINI_ALL_KEYS and "gemini-2.5-flash" in FAST_OPERATIONS_MODELS: # Prioriza Gemini Flash se estiver no pool
                fast_model = "gemini-2.5-flash"
                fast_model = "gemini-2.5-flash"
                dyn_timeout = aiohttp.ClientTimeout(total=60.0, connect=10.0, sock_read=50.0)
                for i, key in enumerate(GEMINI_ALL_KEYS):
                    try:
                        logging.info(f"[RAG] Tentando expansao de query via Gemini Flash (Chave {i+1})...")
                        response, _ = await call_gemini(session, fast_model, system_prompt, user_prompt, key, dyn_timeout, require_json=True)
                        expanded_queries = self._robust_json_load(response)
                        return [question] + expanded_queries
                    except Exception as e:
                        logging.warning(f"[RAG] Falha na expansao via Gemini Flash (Chave {i+1}): {e}.")
                        continue

            if OPENROUTER_KEYS and (gemini_failed or not GEMINI_ALL_KEYS or "gemini-2.5-flash" not in FAST_OPERATIONS_MODELS):
                # SOTA: O Llama 8B e muito leve para json/sinteses complexas. Priorizamos modelos >= 24B
                or_model = next((m for m in OPENROUTER_ALTERNATIVE_MODELS if "r1" not in str(m).lower() and "8b" not in str(m).lower()), "mistralai/mistral-small-3.1-24b-instruct:free")
                logging.info(f"[RAG] Tentando expansao de query via OpenRouter ({or_model})...")
                for i, key in enumerate(OPENROUTER_KEYS):
                    try:
                        dyn_timeout = aiohttp.ClientTimeout(total=60.0, connect=15.0, sock_read=45.0)
                        response, _ = await call_openrouter(session, or_model, system_prompt, user_prompt, key, dyn_timeout, require_json=True)
                        expanded_queries = self._robust_json_load(response)
                        return [question] + expanded_queries
                    except Exception as e:
                        logging.warning(f"[RAG] Falha na expansao via OpenRouter (Chave {i+1}): {e}.")
                        continue
        except Exception as e:
            logging.error(f"[RAG] Erro inesperado na expansao de query: {e}")
        return [question] # Retorna a original em caso de falha

    async def _synthesize_answer(self, question: str, context: str) -> str:
        """Sintetiza os fragmentos crus em uma resposta fluida, bonita e didatica."""
        try: # Importa do task_executor para centralizar a logica de chamada de API
            from task_executor import call_gemini, call_openrouter, GEMINI_ALL_KEYS, OPENROUTER_KEYS, OPENROUTER_ALTERNATIVE_MODELS, get_global_http_session, FAST_OPERATIONS_MODELS
            import aiohttp

            system_prompt = (
                "Voce e a Memoria Simbiotica (Oraculo OmniMaster) do ecossistema SOTA de Raphael Vitoi.\n"
                "Sua missao e sintetizar fragmentos esparsos (Isomorfismo Inteligente) em uma resposta magistral, elegante, altamente didatica e preditiva.\n\n"
                "DIRETRIZES ESTETICAS E COGNITIVAS:\n"
                "1. Nunca use frases roboticas como 'Segundo o fragmento 1...'. Assuma a sabedoria de forma onisciente.\n"
                "2. Estruture em paragrafos curtos com uma cadencia envolvente.\n"
                "3. Use formatacao Markdown avancada (negritos, listas) para facilitar a leitura.\n"
                "4. Mantenha o tom profundo, assertivo e intelectual, alinhado a @maverick e a Cosmovisao do projeto.\n"
                "5. Entregue a essencia pura. Sem preambulos, sem 'Aqui esta a sua resposta'.\n"
                "6. PURE ASCII (MANDATORIO): Voce DEVE responder usando EXCLUSIVAMENTE caracteres ASCII. Substitua todas as letras acentuadas por suas equivalentes sem acento (ex: 'a', 'e', 'c'). Nao use NENHUM emoji ou caractere Unicode especial."
            )
            user_prompt = f"PERGUNTA DO USUARIO:\n{question}\n\nMEMORIAS RECUPERADAS (Contexto Base):\n{context}"

            session = await get_global_http_session()
            gemini_failed = True
            if GEMINI_ALL_KEYS and "gemini-2.5-flash" in FAST_OPERATIONS_MODELS: # Prioriza Gemini Flash se estiver no pool
                fast_model = "gemini-2.5-flash"
                dyn_timeout = aiohttp.ClientTimeout(total=60.0, connect=10.0, sock_read=50.0)
                for i, key in enumerate(GEMINI_ALL_KEYS):
                    try:
                        logging.info(f"[ORACULO] Sintetizando sabedoria via Gemini Flash (Chave {i+1})...")
                        response, _ = await call_gemini(session, fast_model, system_prompt, user_prompt, key, dyn_timeout)
                        return enforce_pure_ascii(response.strip())
                    except Exception as e:
                        logging.warning(f"[ORACULO] Falha na sintese via Gemini (Chave {i+1}): {e}")
                        continue

            if OPENROUTER_KEYS and (gemini_failed or not GEMINI_ALL_KEYS or "gemini-2.5-flash" not in FAST_OPERATIONS_MODELS):
                # SOTA: O Llama 8B e muito leve para json/sinteses complexas. Priorizamos modelos >= 24B
                or_model = next((m for m in OPENROUTER_ALTERNATIVE_MODELS if "r1" not in str(m).lower() and "8b" not in str(m).lower()), "mistralai/mistral-small-3.1-24b-instruct:free")
                logging.info(f"[ORACULO] Sintetizando sabedoria via OpenRouter ({or_model})...")
                for i, key in enumerate(OPENROUTER_KEYS):
                    try:
                        dyn_timeout = aiohttp.ClientTimeout(total=60.0, connect=15.0, sock_read=45.0)
                        response, _ = await call_openrouter(session, or_model, system_prompt, user_prompt, key, dyn_timeout)
                        return enforce_pure_ascii(response.strip())
                    except Exception as e:
                        logging.warning(f"[ORACULO] Falha na sintese via OpenRouter (Chave {i+1}): {e}")
                        continue
        except Exception as e:
            logging.error(f"[ORACULO] Erro na sintese: {e}")
        return "[AVISO] **SINTESE INDISPONIVEL (APIs OFFLINE)**\n\nAs conexoes neurais falharam. Exibindo memorias brutas:\n\n" + context

    async def query_memory(self, question: str, n_results: int = 3, local_only: bool = False, synthesize: bool = False) -> str:
        """
        SOTA 8.0: A flag `local_only` agora controla a WebSearch, nao a expansao de query.
        A expansao de query foi substituida por uma busca hibrida mais robusta.
        """
        try:
            question = enforce_pure_ascii(question)

            # 1. Busca Vetorial Hibrida (Recall Semantico Superior sem custo de LLM)
            # A expansao de query foi preterida em favor de uma busca hibrida mais eficiente.
            # O reranking lexico atua como uma forma de expansao implicita.
            expanded_queries = [question]

            results = await asyncio.to_thread(
                self.collection.query,
                query_texts=expanded_queries,
                n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER
            )

            if not results['documents'] or not results['documents'][0]:
                return "[AVISO] O Oraculo esta vazio. Nenhuma memoria vetorial encontrada.\n\nExecute o comando `python memory_rag.py ingest` para alimentar a Memoria Simbiotica SOTA."

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

            # 3. Reranking e Selecao Final
            scored_docs.sort(key=lambda x: x['score'], reverse=True)
            top_docs = scored_docs[:n_results]

            if not synthesize:
                output_parts = ["\n=== MEMORIA SIMBIOTICA OMNIMASTER (BUSCA HIBRIDA SOTA) ==="]
                for i, item in enumerate(top_docs):
                    output_parts.append(f"--- Fragmento #{i+1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n")
                return "\n".join(output_parts)
            else:
                raw_fragments = []
                for i, item in enumerate(top_docs):
                    raw_fragments.append(f"--- Fonte: @{item['agent']} ({Path(item['source']).name}) ---\n{item['doc']}\n")
                raw_context = "\n".join(raw_fragments) # Contexto bruto antes da compressao

                # SOTA 8.0: Roteamento Semantico de Busca e Compressao Adaptativa
                web_context = ""
                if not local_only:
                    provider_choice = await UniversalArbitrator.get_search_provider(question)
                    session = await get_global_http_session()

                    if provider_choice == "perplexity" and PERPLEXITY_KEYS:
                        web_context = await call_perplexity_search(session, PERPLEXITY_KEYS[0], question)
                    elif provider_choice == "tavily" and TAVILY_KEYS:
                        web_context = await call_tavily_search(session, TAVILY_KEYS[0], question)

                full_context = raw_context
                if web_context:
                    full_context += "\n\n" + web_context

                # SOTA 8.0: Compressao Adaptativa (Lei de Shannon)
                if UniversalArbitrator.should_compress(full_context):
                    final_context = await _compress_context(full_context, "@bibliotecario")
                else:
                    final_context = full_context

                return await self._synthesize_answer(question, final_context)
        except Exception as e:
            logging.error(f"[RAG] Falha na consulta ChromaDB: {e}")
            return f"[ERRO] Falha critica na base vetorial ChromaDB: {e}"

if __name__ == "__main__":
    rag = MemoryRAG()
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "ingest":
            asyncio.run(rag.ingest_all_memories())
        elif cmd == "query" and len(sys.argv) > 2:
            question = sys.argv[2]
            result = asyncio.run(rag.query_memory(question, synthesize=True))
            print(result)
        else:
            logging.error("Uso: python memory_rag.py [ingest | query 'pergunta']")

    else:
        asyncio.run(rag.ingest_all_memories())
