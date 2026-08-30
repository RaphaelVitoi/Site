# pylint: disable=logging-fstring-interpolation, broad-exception-caught, redefined-outer-name, line-too-long, missing-module-docstring, missing-class-docstring, missing-function-docstring, invalid-name, import-outside-toplevel, too-many-lines
# pyright: reportMissingImports=false

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Sequence

import aiofiles

from llm.budget import GEMINI_KEYS, OPENROUTER_KEYS
from llm.gemini import call_gemini
from llm.openrouter import call_openrouter
from llm.session import get_global_http_session

# =================================================
# BLINDAGEM DE I/O REDE (Hugging Face / RAG Friccao Zero)
# =================================================
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Configuracao SOTA (Friccao Zero)
CHROMA_DB_DIR = ".chroma_db"
CHROMA_PATH = Path(__file__).parent / CHROMA_DB_DIR
# Raiz do projeto, no nivel do MODULO de proposito: `MemoryRAG.__init__` tem um
# `return` antecipado quando o chromadb falta, entao atributo definido depois
# dele nao existe sempre. Constante de modulo nao tem esse problema.
RAIZ_DO_PROJETO = Path(__file__).resolve().parent
# Marcador que uma arvore usa para se declarar superada. Predicado estrutural
# em vez de lista de caminhos: viaja junto com a arvore e vale para
# supersessoes futuras sem tocar no codigo de ingestao.
MARCADOR_SUPERADO = "SUPERSEDED.md"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
EMBEDDING_MODEL = "nomic-embed-text"  # Requer: ollama pull nomic-embed-text

# MED-06: Removido logging.basicConfig() para evitar sobrescrever a configuracao SOTA global.
logger = logging.getLogger(__name__)

# =================================================
# CONFIGURACAO SOTA (Estado da Arte)
# =================================================
# SOTA Limit: all-MiniLM-L6-v2 trunca apos 256 tokens (~1200 chars). Valores acima geram Massa Escura Vetorial.
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 300
HYBRID_SEARCH_N_RESULTS_MULTIPLIER = 5
HYBRID_SEARCH_LEXICAL_WEIGHT = 0.4

LANCEDB_DIR = "data/lancedb"
LANCEDB_PATH = RAIZ_DO_PROJETO / LANCEDB_DIR
LANCEDB_TABLE_NAME = "nexus_knowledge"


class LanceDBBackend:
    """Backend de alta capacidade e busca hibrida (Vetorial + FTS/BM25) via LanceDB."""

    def __init__(self, db_path: Path | None = None, emb_fn: Any = None):
        import lancedb  # noqa: PLC0415

        self.db_path = db_path or LANCEDB_PATH
        self.db_path.mkdir(parents=True, exist_ok=True)
        self.db = lancedb.connect(str(self.db_path))
        self.emb_fn = emb_fn
        self.table_name = LANCEDB_TABLE_NAME
        self.table = self._get_or_create_table()

    def _get_or_create_table(self):
        import pyarrow as pa  # noqa: PLC0415

        schema = pa.schema(
            [
                pa.field("id", pa.string()),
                pa.field("vector", pa.list_(pa.float32(), 384)),
                pa.field("text", pa.string()),
                pa.field("agent", pa.string()),
                pa.field("source", pa.string()),
                pa.field("updated_at", pa.float64()),
            ]
        )
        try:
            return self.db.open_table(self.table_name)
        except Exception:
            return self.db.create_table(self.table_name, schema=schema)

    def upsert_records(
        self,
        ids: list[str],
        texts: list[str],
        vectors: Sequence[Sequence[float]] | Sequence[Any],
        metadatas: list[dict],
    ):
        now = time.time()
        records = []
        for i, doc_id in enumerate(ids):
            records.append(
                {
                    "id": doc_id,
                    "vector": vectors[i],
                    "text": texts[i],
                    "agent": metadatas[i].get("agent", "Unknown"),
                    "source": metadatas[i].get("source", "N/A"),
                    "updated_at": now,
                }
            )
        if records:
            id_list = [r["id"] for r in records]
            try:
                for j in range(0, len(id_list), 50):
                    chunk_ids = id_list[j : j + 50]
                    pred = " OR ".join([f"id = '{x}'" for x in chunk_ids])
                    self.table.delete(pred)
            except Exception:
                pass
            self.table.add(records)

    def search_hybrid(
        self,
        query_vector: Sequence[float] | Any,
        query_text: str,
        limit: int = 5,
    ) -> list[dict]:
        """Busca hibrida vetorial + lexical BM25 no LanceDB."""
        vec_results = self.table.search(query_vector).limit(limit * 2).to_list()
        scored_docs = []
        query_terms = set(re.findall(r"\b\w{3,}\b", query_text.lower()))
        for r in vec_results:
            doc_terms = set(re.findall(r"\b\w{3,}\b", r["text"].lower()))
            intersection = len(query_terms.intersection(doc_terms))
            lexical_score = intersection / len(query_terms) if query_terms else 0
            dist = r.get("_distance", 0.0)
            semantic_score = 1.0 / (1.0 + dist)
            hybrid_score = (semantic_score * (1 - HYBRID_SEARCH_LEXICAL_WEIGHT)) + (
                lexical_score * HYBRID_SEARCH_LEXICAL_WEIGHT
            )
            scored_docs.append(
                {
                    "doc": r["text"],
                    "agent": r.get("agent", "Unknown"),
                    "source": r.get("source", "N/A"),
                    "score": hybrid_score,
                    "engine": "lancedb",
                }
            )
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return scored_docs[:limit]


def ingest_drive_pdfs(drive_path: str):
    """Ingestao Vetorial de PDF para RAG do Oraculo Gemma."""
    try:
        from langchain_community.document_loaders import PyPDFDirectoryLoader
        from langchain_community.embeddings import OllamaEmbeddings
        from langchain_community.vectorstores import Chroma
        from langchain_text_splitters import RecursiveCharacterTextSplitter
    except ImportError:
        logger.error(
            "[ERRO CRITICO] O ecossistema langchain nao esta instalado. Execute: pip install langchain-community langchain-text-splitters chromadb"
        )
        return

    logger.info(f"[SOTA RAG] Iniciando mapeamento no diretorio: {drive_path}")

    if not os.path.exists(drive_path):
        logger.error(f"[ERRO CRITICO] O caminho nao existe ou esta inacessivel: {drive_path}")
        sys.exit(1)

    loader = PyPDFDirectoryLoader(drive_path)
    docs = loader.load()
    logger.info(f"[SOTA RAG] {len(docs)} paginas extraidas com sucesso.")

    if not docs:
        logger.warning("[SOTA RAG] Nenhum PDF encontrado. Abortando ingestao.")
        return

    # SOTA Padrao Ouro: Chunking Semantico Dinamico com Overlap de 25% (300 chars > 15%) e Preservacao de Derivacoes Matematicas (LaTeX/Nash/ICM)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, chunk_overlap=300, separators=["\n## ", "\n# ", "\n\n", "\n\\[", "\n$$", "\n", " "]
    )
    chunks = splitter.split_documents(docs)
    logger.info(f"[SOTA RAG] {len(chunks)} fragmentos (chunks semanticos de 1200 chars / 300 overlap) forjados.")

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_BASE_URL)

    # Persistencia Vetorial
    logger.info("[SOTA RAG] Compilando tensores no banco de dados Chroma...")
    Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=str(CHROMA_PATH))
    logger.info("[SOTA RAG] Ingestao concluida e indexada. A Mente Coletiva foi hidratada.")


class MemoryRAG:
    def __init__(self, memory_dir: str = ".claude/agent-memory"):
        try:
            import chromadb
            from chromadb.utils import embedding_functions
        except ImportError:
            logger.error("[ERRO CRITICO] ChromaDB nao instalado. O RAG ficara inoperante.")
            return

        self.memory_dir = Path(memory_dir)
        db_path = str(self.memory_dir / CHROMA_DB_DIR)
        self.client = chromadb.PersistentClient(path=db_path)

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

        # SOTA: Inicializacao do LanceDB Backend (Alta Complexidade & Deep Research)
        self.lance_backend: LanceDBBackend | None = None
        try:
            self.lance_backend = LanceDBBackend(emb_fn=self.emb_fn)
        except Exception as e:
            logger.warning("[RAG] LanceDB nao inicializado (fallback ativo para Chroma): %s", e)

    def _hard_split_sentence(self, sentence: str, chunk_size: int, overlap: int) -> list[str]:
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

    def _chunk_long_paragraph(self, paragraph: str, chunk_size: int, overlap: int) -> list[str]:
        """Processa paragrafos longos preservando integridade semantica de frases e formulas."""
        # SOTA: Expansao semantica para pontuacoes finais (!, ?) erradicando o hard_split e melhorando a qualidade do vetor
        sentences = re.split(r"(?<=[.!?])\s+", paragraph)
        chunks = []
        buffer = []
        current_len = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if len(sentence) > chunk_size:
                current_len = self._handle_oversized_sentence(sentence, chunks, buffer, chunk_size, overlap)
                continue

            if current_len + len(sentence) + (1 if buffer else 0) > chunk_size:
                chunks.append(" ".join(buffer))
                current_len = self._slide_buffer(buffer, current_len, len(sentence), chunk_size, overlap)

            buffer.append(sentence)
            current_len += len(sentence) + (1 if len(buffer) > 1 else 0)

        if buffer:
            chunks.append(" ".join(buffer))
        return chunks

    def _accumulate_paragraphs(self, paragraphs: list[str], chunk_size: int, overlap: int) -> list[str]:
        """Acumula paragrafos respeitando o limite de chunk_size e calculando sobreposicao."""
        all_chunks: list[str] = []
        buffer: list[str] = []
        buffer_len = 0

        # `chunk_size` era so um teto para DIVIDIR, nunca um alvo para JUNTAR:
        # cada paragrafo com ate 1200 chars virava um fragmento inteiro, e
        # paragrafo curto e a norma em codigo e em markdown. Medido no indice de
        # 2026-08-28, com CHUNK_SIZE=1200 declarado: **mediana de 162 chars**,
        # 22,2% dos fragmentos abaixo de 50, p10 em 27. `logger =
        # logging.getLogger(__name__)` aparecia 40 vezes como fragmento proprio,
        # e cabecalhos de template 34 vezes -- 12,6% do indice era texto
        # literalmente repetido.
        #
        # O efeito nao e so desperdicio: 3.165 fragmentos de uma linha disputam
        # os 3 lugares de cada resultado, e cada um chega ao modelo sem contexto
        # nenhum ao redor. Nao se resolve isso com ranking melhor -- e o corpus
        # que esta fragmentado.
        #
        # Agora os paragrafos se ACUMULAM ate encostar no teto, e a sobreposicao
        # entre fragmentos vizinhos e feita por paragrafo inteiro, nunca cortando
        # frase ao meio.
        for paragraph in paragraphs:
            p = paragraph.strip()
            if not p:
                continue

            if len(p) > chunk_size:
                # Paragrafo colossal: fecha o que estava acumulado e delega.
                if buffer:
                    all_chunks.append("\n\n".join(buffer))
                buffer, buffer_len = [], 0
                all_chunks.extend(self._chunk_long_paragraph(p, chunk_size, overlap))
                continue

            if buffer and buffer_len + len(p) + 2 > chunk_size:
                all_chunks.append("\n\n".join(buffer))
                buffer, buffer_len = self._cauda_de_sobreposicao(buffer, overlap)

            buffer.append(p)
            buffer_len += len(p) + 2

        if buffer:
            all_chunks.append("\n\n".join(buffer))

        return all_chunks

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """Quebra o texto em fragmentos, respeitando os limites semanticos (paragrafos e frases)."""
        if overlap >= chunk_size:
            overlap = chunk_size // 10  # Fallback anti-entropia para prevenir loops infinitos

        if not text:
            return []

        text = text.replace("\r\n", "\n")
        paragraphs = text.split("\n\n")
        all_chunks = self._accumulate_paragraphs(paragraphs, chunk_size, overlap)

        # Rede de seguranca na FRONTEIRA: o teto que a constante declara passa a
        # valer de fato. `_chunk_long_paragraph` estourava ate 1404 chars num
        # teto de 1200 -- 17% -- porque a sobreposicao reentra no buffer antes
        # da proxima conferencia. O modelo trunca em ~256 tokens, entao o excesso
        # nao e desperdicio: e texto que entra no indice e o embedding nao ve.
        # Em vez de perseguir a aritmetica do deslizamento, a invariante e
        # imposta onde ela pode ser garantida.
        finais: list[str] = []
        for c in all_chunks:
            if len(c) <= chunk_size:
                finais.append(c)
            else:
                finais.extend(self._hard_split_sentence(c, chunk_size, overlap))
        return finais

    @staticmethod
    def _cauda_de_sobreposicao(buffer: list[str], overlap: int) -> tuple[list[str], int]:
        """Paragrafos finais do fragmento anterior que abrem o proximo.

        Sobreposicao por PARAGRAFO e nao por caractere: cortar no meio de uma
        frase produz um inicio de fragmento que nao significa nada sozinho, e o
        embedding herda esse ruido. Se o ultimo paragrafo sozinho ja estoura o
        orcamento de sobreposicao, o proximo fragmento comeca limpo.
        """
        cauda: list[str] = []
        total = 0
        for p in reversed(buffer):
            if total + len(p) + 2 > overlap:
                break
            cauda.insert(0, p)
            total += len(p) + 2
        return cauda, total

    async def _read_manifest(self, manifest_path: Path) -> dict:
        exists = await asyncio.to_thread(manifest_path.exists)
        if not exists:
            logger.error(f"[RAG] Manifesto de ingestao nao encontrado em {manifest_path}. Abortando.")
            return {}

        try:
            async with aiofiles.open(manifest_path, "r", encoding="utf-8") as f:
                manifest_content = await f.read()
                # SOTA: Expurgar comentarios // sem corromper URLs dentro de strings (ex: "http://...")
                manifest_content = re.sub(
                    r'("(?:\\.|[^"\\])*")|//.*',
                    lambda m: m.group(1) if m.group(1) else "",
                    manifest_content,
                )
                return json.loads(manifest_content)
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Falha ao ler ou parsear o manifesto de ingestao.")
            return {}

    @staticmethod
    def _is_path_ignored(
        caminho: Path,
        raiz: Path,
        ignore_dirs: set[str],
        superadas: set[Path],
        ignore_subtrees: tuple[Path, ...],
    ) -> bool:
        """Verifica se um caminho deve ser ignorado na coleta do RAG."""
        if any(part in ignore_dirs for part in caminho.parts):
            return True
        if any(caminho.is_relative_to(d) for d in superadas):
            return True
        try:
            rel = caminho.relative_to(raiz)
        except ValueError:
            return False
        return any(rel.is_relative_to(sub) for sub in ignore_subtrees)

    async def _expand_source_files(
        self,
        source: dict,
        base_path: Path,
        resolved_base: Path,
        superadas: set[Path],
        ignore_dirs: set[str],
        ignore_subtrees: tuple[Path, ...],
    ) -> list[Path]:
        """Expande os arquivos de uma fonte do manifesto com protecao LFI e filtros."""
        source_path_str = source.get("path", ".")
        source_path = await asyncio.to_thread((base_path / source_path_str).resolve)

        # SOTA: Blindagem absoluta contra Path Traversal (LFI) via Manifesto
        if not source_path.is_relative_to(resolved_base):
            logger.error(f"[SEC] Bloqueio de LFI/Traversal. O caminho de ingestao escapa a raiz: {source_path}")
            return []

        # `recursive` era campo DECLARADO E NUNCA LIDO: `rglob` sempre
        # recursa, entao `"recursive": false` mentia. Honrar a flag e o que
        # a torna auditavel  mas honrar sozinho seria destrutivo: a fonte
        # `.claude` declarava `false` enquanto DEPENDIA de recursao, e
        # passar a obedecer tiraria 39 registros de governanca vivos
        # (MODUSOPERANDI, GOVERNANCA, ARQUITETURA, PROPOSITOS) do indice.
        #
        # Por isso a correcao e conjunta: aqui o codigo passa a obedecer, no
        # manifesto `.claude` passa a declarar `true` (que e o que sempre
        # precisou), e `.claude/.ARQUIVE` sai por subarvore. Corrigir so um
        # dos tres decapitaria a memoria ou legitimaria o arquivo morto.
        recursivo = source.get("recursive", True)
        files_found: list[Path] = []
        for pattern in source.get("patterns", []):
            files = await asyncio.to_thread(
                lambda p=pattern, sp=source_path, r=recursivo: list(sp.rglob(p) if r else sp.glob(p))
            )
            for f in files:
                if not self._is_path_ignored(f, resolved_base, ignore_dirs, superadas, ignore_subtrees):
                    files_found.append(f)
        return files_found

    async def _collect_target_files_async(self, manifest: dict, base_path: Path) -> set:
        target_files: list[Path] = []
        ignore_dirs = {
            ".venv",
            ".venv-wsl",
            "venv",
            "node_modules",
            "__pycache__",
            ".git",
            ".next",
            "dist",
            "build",
            ".trunk",
            "target",
            "nexus_orchestrator.egg-info",
        }

        # `reports` NAO entra em ignore_dirs, e o motivo foi MEDIDO, nao suposto.
        #
        # Ate 2026-08-27 entrava como nome solto, e nome solto casa QUALQUER
        # diretorio homonimo em qualquer profundidade. O alvo pretendido era
        # `reports/cwv` (384 artefatos regerados a cada portao), mas o efeito
        # colateral foi excluir tambem `docs/reports/` -- 20 auditorias e
        # handovers que sao fonte declarada no manifesto. Medido sob o
        # manifesto de producao: 467 arquivos com o filtro cego, 487 com este.
        #
        # Por isso subarvore em vez de nome: o prefixo relativo acerta so o que
        # a maquina regenera e nao alcanca homonimo nenhum.
        ignore_subtrees = (
            Path("reports") / "cwv",       # 384 artefatos por execucao de portao, gitignored
            Path("reports") / "coverage",  # saida de cobertura, regenerada
            Path(".claude") / ".ARQUIVE",  # 45 registros arquivados: tasks e cerimonias encerradas
        )

        # Arvore que se DECLARA superada nao entra no indice.
        #
        # Nao e lista de caminhos: e predicado estrutural -- um diretorio que
        # contem `SUPERSEDED.md` marcou a si mesmo. Lista literal envelhece e
        # exige que alguem lembre de atualiza-la; o marcador viaja junto com a
        # arvore e vale para supersessoes futuras sem tocar neste codigo.
        #
        # Medido em 2026-08-28: `.claude/AGENTS-MEMORY` foi declarada superada
        # ao ser consolidada, e continuava contribuindo 89 fragmentos (2,1% do
        # indice) que competiam com a canonica pelos mesmos tres lugares. Nao e
        # conteudo errado -- e conteudo que ja esta na canonica, duas vezes.
        # UM resolve, e ele e obrigatorio: os alvos vem de source_path.resolve()
        # e sao absolutos, entao comparar com caminho relativo e comparar
        # grandezas diferentes. A primeira versao nao resolvia nada -- nao
        # excluiu NADA, nao levantou excecao, e so apareceu na contagem: 506
        # alvos com 23 que deviam ter saido.
        #
        # A versao seguinte resolvia nos DOIS lados, e nenhuma mutacao isolada
        # era detectavel porque cada resolve cobria o outro. Redundancia que
        # teste nenhum distingue e redundancia que ninguem mantem.
        superadas = {
            m.parent.resolve()
            for m in await asyncio.to_thread(lambda: list(base_path.rglob(MARCADOR_SUPERADO)))
        }
        if superadas:
            logger.info(
                "[RAG] %d arvore(s) declarada(s) superada(s) fora do indice: %s",
                len(superadas),
                ", ".join(sorted(d.name for d in superadas)),
            )

        resolved_base = await asyncio.to_thread(base_path.resolve)
        for source in manifest.get("sources", []):
            files = await self._expand_source_files(
                source, base_path, resolved_base, superadas, ignore_dirs, ignore_subtrees
            )
            target_files.extend(files)

        return set(target_files)

    async def _extract_docx(self, file_path: Path) -> str:
        def _read_docx_sync():
            from docx import Document  # type: ignore

            doc = Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

        try:
            return await asyncio.wait_for(asyncio.to_thread(_read_docx_sync), timeout=60)
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair DOCX: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(f"[RAG] Falha ao processar arquivo .docx ({file_path.name}).")
            return ""

    async def _extract_pdf(self, file_path: Path) -> str:
        def _read_pdf_sync():
            try:
                import pypdf  # type: ignore

                reader = pypdf.PdfReader(str(file_path))
                return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
            except ImportError:
                logger.warning("[RAG] 'pypdf' ausente. Execute 'pip install pypdf' para indexar PDFs.")
                return ""

        try:
            return await asyncio.wait_for(asyncio.to_thread(_read_pdf_sync), timeout=120)
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
                logger.warning("[RAG] 'pandas' ausente. Execute 'pip install pandas' para indexar CSVs.")
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
            return await asyncio.wait_for(asyncio.to_thread(_read_xlsx_sync), timeout=60)
        except asyncio.TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair XLSX: {file_path.name}")
            return ""
        except Exception:  # noqa: BLE001
            logger.exception(f"[RAG] Falha ao extrair texto do XLSX ({file_path.name}).")
            return ""

    async def _extract_fallback(self, file_path: Path) -> str:
        async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return await f.read()

    async def _extract_text_from_file(self, file_path: Path) -> str:
        ext = file_path.suffix.lower()
        if ext == ".docx":
            return await self._extract_docx(file_path)
        if ext == ".pdf":
            return await self._extract_pdf(file_path)
        if ext == ".csv":
            return await self._extract_csv(file_path)
        if ext == ".xlsx":
            return await self._extract_xlsx(file_path)
        return await self._extract_fallback(file_path)

    async def _process_single_file(self, file_path: Path, file_info: str = "") -> list[str]:
        # SOTA: Trava de Seguranca Termodinamica (Impede OOM por leitura de arquivos colossais)
        MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limite
        file_size = await asyncio.to_thread(lambda: file_path.stat().st_size)
        if file_size > MAX_FILE_SIZE_BYTES:
            logger.warning(
                f"[RAG] Rejeicao de arquivo colossal (>{MAX_FILE_SIZE_BYTES} bytes) para evitar vazamento assincrono: {file_path.name}"
            )
            return []

        if CHROMA_DB_DIR in str(file_path):
            return []

        source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
        logger.info(f"[RAG] Extraindo '{source_name}{file_path.suffix}' {file_info}...")
        content = await self._extract_text_from_file(file_path)

        if not content:
            return []

        chunks = self._chunk_text(content)
        # O id vem do CAMINHO, nao do nome. `source_name` NAO e unico no corpus:
        # medido em 2026-08-28, 503 arquivos alvo colapsavam em 426 nomes -- 36
        # nomes em colisao, 77 arquivos afetados. `SPEC` aparecia 4 vezes, `PRD`
        # 4, `dispatcher` 4, e cada um dos 19 agentes duas ou tres (porque
        # `.claude/AGENTS/chico.md` e `.claude/agent-memory/chico/MEMORY.md`
        # produzem o mesmo `chico`).
        #
        # Com `upsert`, quem chega depois sobrescreve os chunks 0..N do anterior
        # e deixa orfaos os de indice maior -- ligados a OUTRO arquivo. O indice
        # ficava com documentos Frankenstein: `dispatcher_chunk_*` reunia 34
        # chunks de um MEMORY.md, 24 de outro e 1 de `agents/dispatcher.py`,
        # tudo sob o mesmo espaco de id. Sobrescrita silenciosa nunca alcanca
        # ramo de erro: e a mesma colisao de chave que ja havia acontecido na
        # auditoria mensal, indexando manuais por basename.
        #
        # O caminho relativo a raiz e unico por construcao, e sobrevive a mover
        # o repositorio. `agent` continua sendo o nome amigavel, que e o que a
        # filtragem usa.
        try:
            chave = file_path.resolve().relative_to(RAIZ_DO_PROJETO).as_posix()
        except ValueError:
            # Fora da raiz declarada: cai no caminho absoluto, que ainda e unico.
            chave = file_path.resolve().as_posix()
        ids = [f"{chave}#chunk{i}" for i in range(len(chunks))]
        metadatas: Any = [{"agent": source_name, "source": str(file_path)} for _ in chunks]

        if chunks:
            # SOTA: Batching Absoluto contra Morte Termica de RAM/SQLite
            BATCH_SIZE = 500
            for i in range(0, len(chunks), BATCH_SIZE):
                await asyncio.to_thread(
                    self.collection.upsert,
                    documents=chunks[i : i + BATCH_SIZE],
                    metadatas=metadatas[i : i + BATCH_SIZE],
                    ids=ids[i : i + BATCH_SIZE],
                )
                # SOTA: Flush do Event Loop para permitir ao Garbage Collector coletar as matrizes WASM
                await asyncio.sleep(0.01)

            # SOTA: Ingestao Sincronizada no LanceDB (se ativo)
            if self.lance_backend:
                try:
                    vectors = await asyncio.to_thread(self.emb_fn, chunks)
                    await asyncio.to_thread(
                        self.lance_backend.upsert_records,
                        ids=ids,
                        texts=chunks,
                        vectors=vectors,
                        metadatas=metadatas,
                    )
                except Exception as e:
                    logger.debug("[RAG] Falha na ingestao secundaria LanceDB: %s", e)

            logger.info(f"[OK] {len(chunks):02d} fragmentos de '{source_name}' vetorizados (Lote Seguro SOTA).")
        return ids

    async def _zero_latency_lexical_fallback(self) -> str:
        """SOTA: Extracao direta de macro-contexto via I/O se o motor ONNX/Chroma colapsar."""
        try:
            fallback_docs = []
            # Alvos emergenciais que contem o DNA e os Invariantes do projeto
            core_files = [
                self.memory_dir.parent / "project-context.md",
                self.memory_dir.parent / "GLOBAL_INSTRUCTIONS.md",
            ]
            for fpath in core_files:
                exists = await asyncio.to_thread(fpath.exists)
                if exists:
                    async with aiofiles.open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        text = await f.read()
                        # Extrai a essencia inicial (primeiros 2000 caracteres) para nao estourar tokens
                        fallback_docs.append(f"--- Documento Vital ({fpath.name}) ---\n{text[:2000]}...\n")

            if fallback_docs:
                return "\n=== MENTE COLETIVA (FALLBACK DE EMERGENCIA - I/O DIRETO) ===\n" + "\n".join(fallback_docs)
        except Exception:
            logger.exception("[RAG] Fallback Lexical tambem colapsou.")
        return ""

    async def _purge_obsolete_memories(self, all_generated_ids: set) -> None:
        if not hasattr(self, "collection"):
            return

        try:
            # SOTA Guard: include=[] previne OOM (Out of Memory) e colapso de I/O no SQLite.
            # Extrai estritamente os IDs, barrando o carregamento dos vetores e textos na RAM.
            existing_data = await asyncio.to_thread(self.collection.get, include=[])
            existing_ids = set(existing_data.get("ids", []))
            ids_to_delete = list(existing_ids - all_generated_ids)

            if ids_to_delete:
                # SOTA: Evita Memory Spike e Erro de Parametros Limite no SQLite do Chroma
                BATCH_SIZE = 500
                for i in range(0, len(ids_to_delete), BATCH_SIZE):
                    await asyncio.to_thread(self.collection.delete, ids=ids_to_delete[i : i + BATCH_SIZE])
                    await asyncio.sleep(0.01)
                logger.info(f"Expurgados {len(ids_to_delete)} fragmentos obsoletos (Limpeza de Entropia).")
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Erro ao limpar memorias antigas.")

    async def ingest_all_memories(self):
        logger.info("[RAG] Iniciando expansao de consciencia (Memorias + Base de Conhecimento)...")
        base_path = Path(__file__).parent
        manifest_path = base_path / "rag_ingestion_manifest.json"

        manifest = await self._read_manifest(manifest_path)
        if not manifest:
            return

        target_files = list(await self._collect_target_files_async(manifest, base_path))
        total_files = len(target_files)
        all_generated_ids = set()

        start_time = time.time()

        for idx, file_path in enumerate(target_files, 1):
            elapsed = time.time() - start_time
            if idx > 1:
                avg_time = elapsed / (idx - 1)
                eta_seconds = avg_time * (total_files - idx + 1)
                eta_str = f"ETA: {eta_seconds / 60:.1f}m" if eta_seconds > 60 else f"ETA: {eta_seconds:.0f}s"
            else:
                eta_str = "ETA: calculando..."

            file_info = f"[{idx}/{total_files} | {eta_str}]"
            ids = await self._process_single_file(file_path, file_info)
            all_generated_ids.update(ids)

        await self._purge_obsolete_memories(all_generated_ids)

    async def _fetch_expanded_query(self, session, system_prompt: str, user_prompt: str) -> str:
        if GEMINI_KEYS:
            try:
                logger.info("[RAG] Tentando expansao de query via Gemini (Free Tier)...")
                response, _ = await call_gemini(
                    session,
                    "gemini-3.5-flash-lite",
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
                logger.info("[RAG] Tentando expansao de query via OpenRouter (Fallback)...")
                response, _ = await call_openrouter(
                    session,
                    "google/gemini-3.5-flash-lite",
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

            response = await self._fetch_expanded_query(session, system_prompt, user_prompt)
            if response:
                match = re.search(r"\[.*\]", response, re.DOTALL)
                if match:
                    try:
                        expanded_queries = json.loads(match.group(0))
                        if expanded_queries:
                            return [question] + expanded_queries
                    except json.JSONDecodeError as e:
                        logger.debug(f"[RAG] Falha ao decodificar JSON na expansao de query: {e}")
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

            intersection = len(query_terms.intersection(doc_terms))
            # SOTA: Cobertura da Query ao inves de Jaccard para nao penalizar chunks longos e densos
            lexical_score = intersection / len(query_terms) if query_terms else 0

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

        # 3. Reranking e Selecao Final
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
            current_meta = metas_row[j] if metas_row and j < len(metas_row) else {"agent": "Unknown", "source": "N/A"}
            current_dist = dists_row[j] if dists_row and j < len(dists_row) else 0.0

            if doc not in unique_docs:
                unique_docs[doc] = {"meta": current_meta, "dist": current_dist}
            else:
                unique_docs[doc]["dist"] = min(unique_docs[doc]["dist"], current_dist)

    def _flatten_and_deduplicate_results(self, results: Any) -> tuple[list[str], list, list[float]]:
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

    def _is_high_complexity_query(self, question: str) -> bool:
        """Determina se a consulta demanda o motor de alta complexidade (LanceDB)."""
        complex_keywords = {
            "pmev",
            "simplex",
            "invariante",
            "refactor",
            "arquitetura",
            "axioma",
            "bayesiano",
            "teorema",
            "vitoi",
            "nash",
            "icm",
            "grafo",
            "sistema",
            "contrato",
            "protocolo",
            "isometria",
            "autopoiese",
            "termodinamica",
        }
        words = set(re.findall(r"\b\w{3,}\b", question.lower()))
        return bool(words & complex_keywords) or len(question) > 150

    async def query_lancedb(self, question: str, n_results: int = 3) -> list[dict]:
        """Consulta direta de alta performance ao LanceDB (Zero-Copy & FTS)."""
        if not self.lance_backend:
            return []
        try:
            vector = await asyncio.to_thread(self.emb_fn, [question])
            if not vector or len(vector) == 0 or len(vector[0]) == 0:
                return []
            return await asyncio.to_thread(
                self.lance_backend.search_hybrid,
                query_vector=vector[0],
                query_text=question,
                limit=n_results,
            )
        except Exception as e:
            logger.debug("[RAG] Falha na consulta direta ao LanceDB: %s", e)
            return []

    async def hybrid_federated_search(self, question: str, n_results: int = 3) -> list[dict]:
        """Fusao federada (Reciprocal Rank Fusion) combinando ChromaDB e LanceDB."""
        lance_results = await self.query_lancedb(question, n_results=n_results * 2)

        # Chroma results
        chroma_results = []
        try:
            results = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.collection.query(
                    query_texts=[question],
                    n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                    include=["documents", "metadatas", "distances"],
                ),
            )
            documents, metadatas, distances = self._flatten_and_deduplicate_results(results)
            if documents:
                chroma_results = self._rank_documents(question, documents, metadatas, distances, n_results * 2)
        except Exception:
            pass

        # Reciprocal Rank Fusion (RRF)
        rrf_scores: dict[str, dict] = {}
        k_rrf = 60.0
        for rank, item in enumerate(chroma_results):
            doc = item["doc"]
            score = (1.0 / (k_rrf + rank + 1)) * 0.45
            rrf_scores[doc] = {**item, "rrf_score": score, "engine": "chroma"}

        for rank, item in enumerate(lance_results):
            doc = item["doc"]
            score = (1.0 / (k_rrf + rank + 1)) * 0.55
            if doc in rrf_scores:
                rrf_scores[doc]["rrf_score"] += score
                rrf_scores[doc]["engine"] = "hybrid_federated"
            else:
                rrf_scores[doc] = {**item, "rrf_score": score, "engine": "lancedb"}

        fused = list(rrf_scores.values())
        fused.sort(key=lambda x: x.get("rrf_score", 0.0), reverse=True)
        return fused[:n_results]

    async def query_memory(
        self,
        question: str,
        n_results: int = 3,
        local_only: bool = False,
        engine: str = "auto",
    ) -> str:
        try:
            target_engine = engine
            if target_engine == "auto":
                target_engine = (
                    "lance" if (self._is_high_complexity_query(question) and self.lance_backend) else "chroma"
                )

            if target_engine == "hybrid_federated" and self.lance_backend:
                top_docs = await self.hybrid_federated_search(question, n_results=n_results)
                if top_docs:
                    output_parts = [f"\n=== MENTE COLETIVA (FUSAO FEDERADA SOTA: {len(top_docs)} fragmentos) ==="]
                    for i, item in enumerate(top_docs):
                        src = Path(item.get("source", "N/A")).name
                        engine_tag = item.get("engine", "federated")
                        output_parts.append(
                            f"--- Fragmento #{i + 1} de @{item.get('agent', 'Unknown')} [{engine_tag}] (Fonte: {src}) ---\n{item['doc']}\n"
                        )
                    return "\n".join(output_parts)

            if target_engine == "lance" and self.lance_backend:
                lance_docs = await self.query_lancedb(question, n_results=n_results)
                if lance_docs:
                    output_parts = [
                        f"\n=== MENTE COLETIVA LANCEDB (ALTA COMPLEXIDADE SOTA: {len(lance_docs)} fragmentos) ==="
                    ]
                    for i, item in enumerate(lance_docs):
                        src = Path(item.get("source", "N/A")).name
                        output_parts.append(
                            f"--- Fragmento #{i + 1} de @{item.get('agent', 'Unknown')} (Fonte: {src}) ---\n{item['doc']}\n"
                        )
                    return "\n".join(output_parts)

            # 1. Expansao da Query com IA para Recall Semantico Superior (ChromaDB Padrao)
            expanded_queries = [question] if local_only else await self._expand_query(question)
            results = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.collection.query(
                    query_texts=expanded_queries,
                    n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                    include=["documents", "metadatas", "distances"],
                ),
            )

            documents, metadatas, distances = self._flatten_and_deduplicate_results(results)
            if not documents:
                logger.warning(
                    "[RAG] Busca vetorial nao retornou resultados. Acionando Fallback Lexical (I/O Direto)..."
                )
                return await self._zero_latency_lexical_fallback()

            top_docs = self._rank_documents(question, documents, metadatas, distances, n_results)

            output_parts = ["\n=== MENTE COLETIVA (BUSCA HIBRIDA CHROMADB SOTA) ==="]
            for i, item in enumerate(top_docs):
                output_parts.append(
                    f"--- Fragmento #{i + 1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n"
                )
            return "\n".join(output_parts)
        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Colapso Critico no RAG. Acionando Fallback Lexical (Latencia Zero)...")
            # Bypass de seguranca para evitar que o LLM responda sem contexto
            return await self._zero_latency_lexical_fallback()

    async def _extract_causal_graph(self, session, system_prompt: str, user_prompt: str) -> str:
        if GEMINI_KEYS:
            try:
                logger.info("[RAG] Forjando Grafo Causal (Knowledge Graph) via Gemini...")
                response, _ = await call_gemini(
                    session,
                    "gemini-2.0-flash",
                    system_prompt,
                    user_prompt,
                    GEMINI_KEYS[0],
                )
                return response
            except Exception as e:  # noqa: BLE001
                logger.warning(f"[RAG] Falha na forja do Grafo Causal via Gemini: {e}")

        if OPENROUTER_KEYS:
            try:
                logger.info("[RAG] Forjando Grafo Causal via OpenRouter (Fallback)...")
                response, _ = await call_openrouter(
                    session,
                    "google/gemini-2.0-flash",
                    system_prompt,
                    user_prompt,
                    OPENROUTER_KEYS[0],
                )
                return response
            except Exception as e:  # noqa: BLE001
                logger.warning(f"[RAG] Falha na forja do Grafo Causal via OpenRouter: {e}")
        return '{"nodes": [], "edges": []}'

    async def query_causal_graph(self, question: str, n_results: int = 5) -> str:
        """SOTA: Extrai relacoes causais dinamicas (A -> B) para o Knowledge Graph."""
        try:
            # Reutiliza o RAG Hibrido para buscar os blocos factuais
            expanded_queries = await self._expand_query(question)
            results = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.collection.query(
                    query_texts=expanded_queries,
                    n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                    include=["documents", "metadatas", "distances"],
                ),
            )

            documents, metadatas, distances = self._flatten_and_deduplicate_results(results)
            if not documents:
                return '{"nodes": [], "edges": [], "error": "Contexto nao encontrado na Mente Coletiva."}'

            top_docs = self._rank_documents(question, documents, metadatas, distances, n_results)
            context_text = "\n\n".join([item["doc"] for item in top_docs])

            system_prompt = (
                "Voce e um oraculo SOTA de Extracao de Grafos de Conhecimento (Knowledge Graph). "
                "Sua diretriz e analisar o contexto fornecido e extrair relacoes causais, logicas ou estrategicas "
                "entre os conceitos (ex: ICM, Perspectiva Matematica, FGS). "
                "Retorne EXCLUSIVAMENTE um JSON puro no seguinte formato, sem formatacao markdown:\n"
                "{\n"
                '  "nodes": [{"id": "node_1", "label": "Conceito A"}, ...],\n'
                '  "edges": [{"source": "node_1", "target": "node_2", "relation": "aumenta_probabilidade_de", "description": "Breve explicacao"}...]\n'
                "}\n"
            )
            user_prompt = f"Foco de Extracao: {question}\n\nContexto da Mente Coletiva:\n{context_text}"

            session = await get_global_http_session()
            raw_json = await self._extract_causal_graph(session, system_prompt, user_prompt)

            # Purificacao contra entropia de encoding (markdown injetado por LLMs)
            clean_json = raw_json.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            elif clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            return clean_json.strip()

        except Exception:  # noqa: BLE001
            logger.exception("[RAG] Colapso na extracao do Grafo Causal.")
            return '{"nodes": [], "edges": [], "error": "Falha sistemica na forja do grafo."}'


if __name__ == "__main__":
    # SOTA: Habilita o output no console para que o ETA e o progresso
    # sejam visiveis quando executado via nexus-cli. Sem isso, o Python
    # silencia os logs (nivel INFO) e gera a ilusao de congelamento.
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
        elif cmd == "graph" and len(sys.argv) > 2:
            question = sys.argv[2]
            result = asyncio.run(rag.query_causal_graph(question))
            print(result)
        elif cmd == "ingest_drive":
            target_dir = os.environ.get("GDRIVE_PDF_PATH", r"C:\Users\rapha\Google Drive\Poker_PDFs")
            ingest_drive_pdfs(target_dir)
        else:
            # Exit 2, nao 0. Este ramo imprimia o uso e saia com sucesso, entao
            # `subprocess.run(..., check=True)` nao tinha como perceber um
            # subcomando inexistente. O passo 5 do `nexus ops maintenance`
            # invocava `memory_rag.py optimize` -- subcomando que nunca existiu
            # -- e a manutencao reportava a etapa como concluida. Medido em
            # 2026-08-28: EXIT=0 com "Uso: ..." na saida.
            logger.error("Subcomando desconhecido: %s", cmd)
            logger.error("Uso: python memory_rag.py [ingest | ingest_drive | query 'pergunta' | graph 'pergunta']")
            sys.exit(2)
    else:
        logger.info("Uso SOTA: python memory_rag.py [ingest | ingest_drive | query | graph]")
        sys.exit(2)
