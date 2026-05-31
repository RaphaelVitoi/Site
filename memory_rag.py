# pylint: disable=logging-fstring-interpolation, broad-exception-caught, redefined-outer-name, line-too-long, missing-module-docstring, missing-class-docstring, missing-function-docstring, invalid-name, wrong-import-position, import-outside-toplevel
# pyright: reportMissingImports=false

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
import time
from pathlib import Path
from typing import Any, cast

import aiofiles

from llm.budget import GEMINI_KEYS, OPENROUTER_KEYS
from llm.gemini import call_gemini
from llm.gemma_local import call_gemma_local
from llm.openrouter import call_openrouter
from llm.session import get_global_http_session

# Configuracao SOTA (Friccao Zero)
CHROMA_DB_DIR = ".chroma_db"
CHROMA_PATH = Path(__file__).parent / CHROMA_DB_DIR
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


def ingest_drive_pdfs(drive_path: str):
    """Ingestao Vetorial de PDF para RAG do Oraculo Gemma."""
    path = Path(drive_path)
    if not path.exists():
        logger.error(f"[ERRO CRITICO] O caminho nao existe ou esta inacessivel: {drive_path}")
        return

    logger.info(f"[SOTA RAG] Iniciando mapeamento no diretorio: {drive_path}")
    files = list(path.rglob("*.pdf"))
    logger.info(f"[SOTA RAG] {len(files)} PDFs encontrados.")

    if not files:
        logger.warning("[SOTA RAG] Nenhum PDF encontrado. Abortando ingestao.")
        return

    async def _ingest():
        rag = MemoryRAG()
        for idx, file_path in enumerate(files, 1):
            file_info = f"[{idx}/{len(files)}]"
            await rag._process_single_file(file_path, file_info)
        logger.info("[SOTA RAG] Ingestao concluida e indexada. A Mente Coletiva foi hidratada.")

    asyncio.run(_ingest())


# SOTA: Filtro de Relevancia Baseline
MIN_RELEVANCE_SCORE = 0.65


class MemoryRAG:
    def __init__(self, memory_dir: str = ".cerebro/agent-memory"):
        try:
            import chromadb
            from chromadb.utils import embedding_functions
        except ImportError:
            logger.error("[ERRO CRITICO] ChromaDB nao instalado. O RAG ficara inoperante.")
            return

        self.memory_dir = Path(memory_dir)
        self.clients: dict[str, Any] = {}
        self.collections: dict[str, Any] = {}

        self.emb_fn = embedding_functions.OllamaEmbeddingFunction(
            url=f"{OLLAMA_BASE_URL}/api/embeddings",
            model_name=EMBEDDING_MODEL,
        )

        # Fallback de compatibilidade para sistemas que acessam o root collection
        self.collection = None
        try:
            _, self.collection = self._get_namespace_client_and_collection("general")
        except Exception:
            pass

    def _get_namespace_client_and_collection(self, namespace: str) -> tuple[Any, Any]:
        """Garante e retorna o cliente e a colecao Chroma sharded para um namespace."""
        import chromadb
        import hashlib

        ns = re.sub(r"[^a-zA-Z0-9_-]", "", namespace.lower())
        if not ns:
            ns = "general"

        if ns in self.collections:
            return self.clients[ns], self.collections[ns]

        # Sharding: data/chroma/{hash[:2]}/{namespace}
        ns_hash = hashlib.sha256(ns.encode("utf-8")).hexdigest()[:2]
        shard_dir = self.memory_dir / ns_hash / ns
        shard_dir.mkdir(parents=True, exist_ok=True)

        client = chromadb.PersistentClient(path=str(shard_dir))

        try:
            collection = client.get_or_create_collection(
                name=f"agent_memory_{ns}",
                embedding_function=self.emb_fn,  # type: ignore
            )
        except Exception as e:
            if "Embedding function conflict" in str(e):
                logger.warning(f"[SOTA] Conflito de Engine Vetorial na namespace {ns}. Recriando...")
                client.delete_collection(f"agent_memory_{ns}")
                collection = client.create_collection(
                    name=f"agent_memory_{ns}",
                    embedding_function=self.emb_fn,  # type: ignore
                )
            else:
                raise

        self.clients[ns] = client
        self.collections[ns] = collection
        return client, collection

    def _list_available_namespaces(self) -> list[str]:
        """Varre os diretorios sharded no disco para listar todas as namespaces ativas."""
        namespaces = []
        if not self.memory_dir.exists():
            return ["general"]
        for path in self.memory_dir.glob("*/*"):
            if path.is_dir():
                namespaces.append(path.name)
        return list(set(namespaces)) if namespaces else ["general"]

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
        chunks: list[str] = []
        buffer: list[str] = []
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

    def _evaluate_semantic_coefficient(self, chunk: str) -> bool:
        """
        SOTA: Filtro de Densidade Semantica.
        Rejeita dados brutos e exige que a base de conhecimento seja ancorada em conceitos textuais (linguagem natural).
        Logs de tasks e ruidos de terminal sao obliterados aqui.
        """
        if len(chunk) < 50:
            return False  # Fragmento muito curto. Sem entropia util.

        # 1. Blocklist de Inutilidades (Logs, Dumps de Task, Traces)
        useless_patterns = r"(?i)(\[(?:INFO|DEBUG|ERROR|WARN)\]|Traceback \(most recent|Process Group PGID|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}|Task id:|--- FILE CONTENT|Status: Showing lines)"
        if re.search(useless_patterns, chunk):
            return False

        # 2. Ancoragem Conceitual (Inicio do chunk deve ser texto)
        # Extrai os primeiros 80 caracteres. Se nao for linguagem natural (desordenado/matematica pura), ignoramos o chunk.
        intro = chunk[:80].strip()
        alpha_count = sum(c.isalpha() for c in intro)

        if len(intro) > 0 and (alpha_count / len(intro)) < 0.45:
            # Se menos de 45% do inicio sao letras, provavel dump de matriz ou dados brutos sem introducao.
            return False

        # 3. Validacao Estrutural Basica: Pelo menos uma das primeiras 5 palavras deve ser alfabetica pura.
        words = intro.split()
        if len(words) >= 3:
            alpha_words = sum(1 for w in words[:5] if re.match(r"^[A-Za-zA-y]+$", w))
            if alpha_words == 0:
                return False

        return True

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
        """Quebra o texto em fragmentos, respeitando os limites semanticos (paragrafos e frases)."""
        if overlap >= chunk_size:
            overlap = chunk_size // 10  # Fallback anti-entropia para prevenir loops infinitos

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

        # SOTA: Purificacao via Coeficiente Semantico antes da vetorizacao
        return [c for c in all_chunks if self._evaluate_semantic_coefficient(c)]

    async def _read_manifest(self, manifest_path: Path) -> dict:
        exists = await asyncio.to_thread(manifest_path.exists)
        if not exists:
            logger.error(f"[RAG] Manifesto de ingestao nao encontrado em {manifest_path}. Abortando.")
            return {}

        try:
            async with aiofiles.open(manifest_path, encoding="utf-8") as f:
                manifest_content = await f.read()
                # SOTA: Expurgar comentarios // sem corromper URLs dentro de strings (ex: "http://...")
                manifest_content = re.sub(
                    r'("(?:\\.|[^"\\])*")|(//.*)',
                    lambda m: m.group(1) if m.group(1) else "",
                    manifest_content,
                )
                return cast(dict, json.loads(manifest_content))
        except (OSError, json.JSONDecodeError):
            logger.exception("[RAG] Falha ao ler ou parsear o manifesto de ingestao.")
            return {}

    def _is_ignored_by_ragignore(self, file_path: Path, ignore_patterns: set) -> bool:
        """Avalia se o arquivo bate com as regras do .ragignore."""
        path_str = file_path.as_posix()
        for pattern in ignore_patterns:
            if pattern.startswith("*"):
                if file_path.match(pattern):
                    return True
            elif pattern.endswith("/"):
                # Bloqueia pastas exatas no path
                dir_name = pattern.strip("/")
                if dir_name in file_path.parts:
                    return True
            elif pattern in path_str:
                return True
        return False

    async def _collect_target_files_async(self, manifest: dict, base_path: Path) -> set:
        target_files = []
        ignore_patterns = set()

        # SOTA: Leitura do .ragignore para prevencao termodinamica de ingestao de lixo
        ragignore_path = base_path / ".ragignore"
        if await asyncio.to_thread(ragignore_path.exists):
            async with aiofiles.open(ragignore_path, encoding="utf-8") as f:
                lines = await f.readlines()
                ignore_patterns = {line.strip() for line in lines if line.strip() and not line.startswith("#")}

        for source in manifest.get("sources", []):
            source_path_str = source.get("path", ".")
            source_path = await asyncio.to_thread((base_path / source_path_str).resolve)
            resolved_base = await asyncio.to_thread(base_path.resolve)

            # SOTA: Blindagem absoluta contra Path Traversal (LFI) via Manifesto
            if not source_path.is_relative_to(resolved_base):
                logger.error(f"[SEC] Bloqueio de LFI/Traversal. O caminho de ingestao escapa a raiz: {source_path}")
                continue

            for pattern in source.get("patterns", []):

                def _rglob_files(sp: Path, p: str) -> list[Path]:
                    return list(sp.rglob(p))

                files = await asyncio.to_thread(_rglob_files, source_path, pattern)
                for f in files:
                    if not self._is_ignored_by_ragignore(f, ignore_patterns):
                        target_files.append(f)

        # SOTA: Google Drive Auto-detection and Ingestion
        import sys

        if sys.platform == "win32":
            gdrive_base = Path("F:\\.shortcut-targets-by-id\\1avGxyx2AeL3Uct6X45zhwfvRALgpoBac\\Meu computador")
            if gdrive_base.exists():
                logger.info(f"[RAG] Google Drive detectado em {gdrive_base}. Injetando na malha de ingestao.")
                # Index "Documentos" and "GD" folders under the Drive mount
                for folder in ["Documentos", "GD", "Documents"]:
                    folder_path = gdrive_base / folder
                    if folder_path.exists():
                        for ext_pattern in ["*.txt", "*.md", "*.pdf", "*.docx", "*.xlsx", "*.csv", "*.odt", "*.ods"]:
                            try:

                                def _scan_dir(fp: Path, pat: str) -> list[Path]:
                                    return list(fp.rglob(pat))

                                drive_files = await asyncio.to_thread(_scan_dir, folder_path, ext_pattern)
                                for f in drive_files:
                                    if not self._is_ignored_by_ragignore(f, ignore_patterns):
                                        target_files.append(f)
                            except Exception as ex:
                                logger.warning(
                                    f"[RAG] Falha ao escanear Google Drive em '{folder}/{ext_pattern}': {ex}"
                                )

        return set(target_files)

    async def _extract_docx(self, file_path: Path) -> str:
        def _read_docx_sync():
            from docx import Document  # type: ignore

            doc = Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

        try:
            return await asyncio.wait_for(asyncio.to_thread(_read_docx_sync), timeout=60)
        except TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair DOCX: {file_path.name}")
            return ""
        except (ImportError, ValueError):
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
        except TimeoutError:
            logger.error(f"[RAG] Timeout (120s) ao extrair PDF: {file_path.name}")
            return ""
        except (ImportError, ValueError):
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
        except TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair CSV: {file_path.name}")
            return ""
        except (ImportError, ValueError):
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
        except TimeoutError:
            logger.error(f"[RAG] Timeout (60s) ao extrair XLSX: {file_path.name}")
            return ""
        except (ImportError, ValueError):
            logger.exception(f"[RAG] Falha ao extrair texto do XLSX ({file_path.name}).")
            return ""

    async def _extract_fallback(self, file_path: Path) -> str:
        async with aiofiles.open(file_path, encoding="utf-8", errors="ignore") as f:
            return await f.read()

    async def _extract_via_libreoffice(self, file_path: Path) -> str:
        """Runs headless LibreOffice to convert file to plain text."""
        import tempfile
        import shutil
        import sys
        import subprocess

        soffice_path = "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
        if sys.platform != "win32":
            soffice_path = shutil.which("soffice") or shutil.which("libreoffice") or ""

        if not soffice_path or not os.path.exists(soffice_path):
            logger.warning(f"[RAG] LibreOffice not found. Falling back to plain text for: {file_path.name}")
            return await self._extract_fallback(file_path)

        def _convert():
            with tempfile.TemporaryDirectory() as tmp_dir:
                try:
                    subprocess.run(
                        [soffice_path, "--headless", "--convert-to", "txt:Text", "--outdir", tmp_dir, str(file_path)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        timeout=15.0,
                    )
                    txt_file = Path(tmp_dir) / f"{file_path.stem}.txt"
                    if txt_file.exists():
                        return txt_file.read_text(encoding="utf-8", errors="ignore")
                except Exception as e:
                    logger.error(f"[RAG] LibreOffice conversion exception: {e}")
            return ""

        return await asyncio.to_thread(_convert)

    async def _extract_archive_via_winrar(self, file_path: Path) -> str:
        """Decompresses zip/rar/7z via WinRAR or native python zipfile module."""
        import tempfile
        import subprocess
        from utils.os_integration import get_winrar_path

        winrar_path = get_winrar_path()

        def _extract():
            with tempfile.TemporaryDirectory() as tmp_dir:
                extracted_texts = []
                if winrar_path and os.path.exists(winrar_path):
                    logger.info(f"[RAG] Extracting archive '{file_path.name}' via WinRAR...")
                    try:
                        subprocess.run(
                            [winrar_path, "x", "-ibck", "-y", str(file_path), tmp_dir],
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                            timeout=15.0,
                        )
                        for root, _, files in os.walk(tmp_dir):
                            for file in files:
                                fpath = Path(root) / file
                                if fpath.suffix.lower() in (".txt", ".md", ".json", ".csv"):
                                    txt = fpath.read_text(encoding="utf-8", errors="ignore")
                                    extracted_texts.append(f"--- Archive File: {file} ---\n{txt}\n")
                    except Exception as e:
                        logger.error(f"[RAG] WinRAR execution error: {e}")
                else:
                    if file_path.suffix.lower() == ".zip":
                        logger.info(f"[RAG] Extracting zip '{file_path.name}' via zipfile (fallback)...")
                        import zipfile

                        try:
                            with zipfile.ZipFile(file_path, "r") as zf:
                                for name in zf.namelist():
                                    if name.endswith(("/", "\\")):
                                        continue
                                    if Path(name).suffix.lower() in (".txt", ".md", ".json", ".csv"):
                                        with zf.open(name) as f:
                                            txt = f.read().decode("utf-8", errors="ignore")
                                            extracted_texts.append(f"--- Archive File: {name} ---\n{txt}\n")
                        except Exception as e:
                            logger.error(f"[RAG] Native zipfile extraction error: {e}")
                    else:
                        logger.warning(f"[RAG] WinRAR missing. Cannot extract non-zip archive: {file_path.name}")
                return "\n".join(extracted_texts)

        return await asyncio.to_thread(_extract)

    async def _extract_image_metadata(self, file_path: Path) -> str:
        """Extracts resolution, EXIF tags from images and performs basic OCR if pytesseract is present."""
        from PIL import Image
        from PIL.ExifTags import TAGS

        def _parse():
            try:
                with Image.open(file_path) as img:
                    info = [
                        f"--- Imagem: {file_path.name} ---",
                        f"Formato: {img.format}",
                        f"Dimensoes: {img.width}x{img.height}",
                        f"Modo: {img.mode}",
                    ]
                    exif = img.getexif()
                    if exif:
                        for tag_id, val in exif.items():
                            tag = TAGS.get(tag_id, tag_id)
                            if not isinstance(val, (bytes, bytearray)) and len(str(val)) < 100:
                                info.append(f"EXIF {tag}: {val}")
                    try:
                        import pytesseract  # type: ignore

                        ocr_text = pytesseract.image_to_string(img)
                        if ocr_text and ocr_text.strip():
                            info.append(f"--- Conteudo Extraido (OCR) ---\n{ocr_text.strip()}")
                    except Exception:
                        pass
                    return "\n".join(info)
            except Exception as e:
                logger.error(f"[RAG] Image metadata extraction failed: {e}")
                return f"Imagem: {file_path.name} (falha na leitura de metadados)"

        return await asyncio.to_thread(_parse)

    async def _extract_video_metadata(self, file_path: Path) -> str:
        """Parses video metadata (duration, format, resolution) using cv2 or moviepy."""

        def _parse():
            try:
                import cv2  # type: ignore

                cap = cv2.VideoCapture(str(file_path))
                if cap.isOpened():
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
                    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                    duration = frame_count / fps if fps > 0 else 0
                    cap.release()
                    return (
                        f"--- Video: {file_path.name} ---\n"
                        f"Duracao: {duration:.2f}s\n"
                        f"Resolucao: {int(width)}x{int(height)}\n"
                        f"Frame Rate (FPS): {fps:.2f}\n"
                        f"Total de Quadros: {int(frame_count)}\n"
                    )
            except Exception:
                pass

            try:
                from moviepy import VideoFileClip  # type: ignore

                with VideoFileClip(str(file_path)) as clip:
                    return (
                        f"--- Video: {file_path.name} ---\n"
                        f"Duracao: {clip.duration:.2f}s\n"
                        f"Resolucao: {clip.size[0]}x{clip.size[1]}\n"
                        f"Audio Ativo: {clip.audio is not None}\n"
                    )
            except Exception as e:
                logger.error(f"[RAG] Video metadata extraction failed: {e}")
            return f"Video: {file_path.name}"

        return await asyncio.to_thread(_parse)

    async def _extract_text_from_file(self, file_path: Path) -> str:
        ext = file_path.suffix.lower()
        if ext in (".zip", ".rar", ".7z"):
            return await self._extract_archive_via_winrar(file_path)
        if ext in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
            return await self._extract_image_metadata(file_path)
        if ext in (".mp4", ".avi", ".mkv", ".mov", ".mp3", ".wav"):
            return await self._extract_video_metadata(file_path)
        if ext in (".odt", ".doc", ".ods", ".xls", ".odp", ".ppt", ".pptx"):
            return await self._extract_via_libreoffice(file_path)
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
        max_file_size_bytes = 10 * 1024 * 1024  # 10 MB limite
        file_size = await asyncio.to_thread(lambda: file_path.stat().st_size)
        if file_size > max_file_size_bytes:
            logger.warning(
                f"[RAG] Rejeicao de arquivo colossal (>{max_file_size_bytes} bytes) para evitar vazamento assincrono: {file_path.name}"
            )
            return []

        if CHROMA_DB_DIR in str(file_path):
            return []

        source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem
        _, collection = self._get_namespace_client_and_collection(source_name)
        logger.info(f"[RAG] Extraindo '{source_name}{file_path.suffix}' {file_info}...")
        content = await self._extract_text_from_file(file_path)

        if not content:
            return []

        chunks = self._chunk_text(content)
        ids = [f"{source_name}_chunk_{i}" for i in range(len(chunks))]
        metadatas: Any = [{"agent": source_name, "source": str(file_path)} for _ in chunks]

        if chunks:
            # SOTA: Batching Absoluto contra Morte Termica de RAM/SQLite
            batch_size = 500
            for i in range(0, len(chunks), batch_size):
                await asyncio.to_thread(
                    collection.upsert,
                    documents=chunks[i : i + batch_size],
                    metadatas=metadatas[i : i + batch_size],
                    ids=ids[i : i + batch_size],
                )
                # SOTA: Flush do Event Loop para permitir ao Garbage Collector coletar as matrizes WASM
                await asyncio.sleep(0.01)
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
                    async with aiofiles.open(fpath, encoding="utf-8", errors="ignore") as f:
                        text = await f.read()
                        # Extrai a essencia inicial (primeiros 2000 caracteres) para nao estourar tokens
                        fallback_docs.append(f"--- Documento Vital ({fpath.name}) ---\n{text[:2000]}...\n")

            if fallback_docs:
                return "\n=== MENTE COLETIVA (FALLBACK DE EMERGENCIA - I/O DIRETO) ===\n" + "\n".join(fallback_docs)
        except OSError:
            logger.exception("[RAG] Fallback Lexical tambem colapsou.")
        return ""

    async def _load_all_manifests(self, base_path: Path) -> dict:
        """Carrega e mescla as configuracoes do manifesto principal e todos os shards .json."""
        main_manifest_path = base_path / "rag_ingestion_manifest.json"
        merged_sources = []

        main_manifest = await self._read_manifest(main_manifest_path)
        if main_manifest and "sources" in main_manifest:
            merged_sources.extend(main_manifest["sources"])

        shards_dir = base_path / "rag_ingestion_manifest.d"
        if await asyncio.to_thread(shards_dir.exists) and await asyncio.to_thread(shards_dir.is_dir):

            def _list_shards() -> list[Path]:
                return list(shards_dir.glob("*.json"))

            shard_paths = await asyncio.to_thread(_list_shards)
            for path in shard_paths:
                shard_manifest = await self._read_manifest(path)
                if shard_manifest and "sources" in shard_manifest:
                    merged_sources.extend(shard_manifest["sources"])

        return {"sources": merged_sources}

    async def _purge_obsolete_memories_for_namespace(self, namespace: str, generated_ids: set) -> None:
        """Limpa fragmentos obsoletos em um namespace/colecao especifica."""
        _, collection = self._get_namespace_client_and_collection(namespace)
        try:
            existing_data = await asyncio.to_thread(collection.get, include=[])
            existing_ids = set(existing_data.get("ids", []))
            ids_to_delete = list(existing_ids - generated_ids)

            if ids_to_delete:
                batch_size = 500
                for i in range(0, len(ids_to_delete), batch_size):
                    await asyncio.to_thread(collection.delete, ids=ids_to_delete[i : i + batch_size])
                    await asyncio.sleep(0.01)
                logger.info(f"Expurgados {len(ids_to_delete)} fragmentos obsoletos na namespace '{namespace}'.")
        except Exception:
            logger.exception(f"[RAG] Erro ao limpar memorias antigas para namespace '{namespace}'.")

    async def _purge_obsolete_memories(self, all_generated_ids: set) -> None:
        """Fallback de compatibilidade para purga geral."""
        await self._purge_obsolete_memories_for_namespace("general", all_generated_ids)

    async def ingest_all_memories(self):
        logger.info("[RAG] Iniciando expansao de consciencia (Memorias + Base de Conhecimento)...")
        base_path = Path(__file__).parent

        manifest = await self._load_all_manifests(base_path)
        if not manifest:
            return

        target_files = list(await self._collect_target_files_async(manifest, base_path))
        total_files = len(target_files)
        ids_per_namespace: dict[str, set[str]] = {}

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
            source_name = file_path.parent.name if file_path.name == "MEMORY.md" else file_path.stem

            ns = re.sub(r"[^a-zA-Z0-9_-]", "", source_name.lower())
            if not ns:
                ns = "general"

            ids = await self._process_single_file(file_path, file_info)
            if ns not in ids_per_namespace:
                ids_per_namespace[ns] = set()
            ids_per_namespace[ns].update(ids)

        for ns, generated_ids in ids_per_namespace.items():
            await self._purge_obsolete_memories_for_namespace(ns, generated_ids)

    async def _fetch_expanded_query(self, session, system_prompt: str, user_prompt: str) -> str:
        if GEMINI_KEYS:
            try:
                logger.info("[RAG] Tentando expansao de query via Gemini (Free Tier)...")
                response, _ = await call_gemini(
                    session,
                    "gemini-2.5-flash",
                    system_prompt,
                    user_prompt,
                    GEMINI_KEYS[0],
                )
                return response
            except (ImportError, ValueError) as e:
                logger.warning(
                    f"[RAG] Falha na expansao via Gemini (Free Tier): {e}. Tentando fallback para OpenRouter."
                )

        if OPENROUTER_KEYS:
            try:
                logger.info("[RAG] Tentando expansao de query via OpenRouter (Fallback)...")
                response, _ = await call_openrouter(
                    session,
                    "google/gemini-2.5-flash",
                    system_prompt,
                    user_prompt,
                    OPENROUTER_KEYS[0],
                )
                return response
            except (ImportError, ValueError) as e:
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
        except (ImportError, ValueError):
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

        # SOTA: Filtro Pratico de Relevancia (Corte da Entropia)
        filtered_docs = [doc for doc in scored_docs if doc["score"] >= MIN_RELEVANCE_SCORE]

        if not filtered_docs and scored_docs:
            logger.warning(
                f"[RAG] Fragmentos localizados, mas todos descartados pelo Filtro de Relevancia (Score < {MIN_RELEVANCE_SCORE}). Prevencao de alucinacao ativa."
            )

        return filtered_docs[:n_results]

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

        unique_docs: dict[str, dict[str, Any]] = {}
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

    async def _federated_query(
        self, expanded_queries: list[str], n_results: int
    ) -> tuple[list[str], list, list[float]]:
        """SOTA: Realiza a busca paralela distribuida (Federated Query) em todas as namespaces do Chroma."""
        namespaces = self._list_available_namespaces()

        async def _query_namespace(ns: str) -> list[dict]:
            try:
                _, collection = self._get_namespace_client_and_collection(ns)
                loop = asyncio.get_event_loop()
                results = await loop.run_in_executor(
                    None,
                    lambda: collection.query(
                        query_texts=expanded_queries,
                        n_results=n_results * HYBRID_SEARCH_N_RESULTS_MULTIPLIER,
                        include=["documents", "metadatas", "distances"],
                    ),
                )
                docs, metas, dists = self._flatten_and_deduplicate_results(results)
                ns_docs = []
                for j, doc in enumerate(docs):
                    ns_docs.append(
                        {
                            "doc": doc,
                            "agent": metas[j]["agent"],
                            "source": metas[j].get("source", "N/A"),
                            "distance": dists[j],
                        }
                    )
                return ns_docs
            except Exception as e:
                logger.warning(f"[RAG] Falha ao consultar shard '{ns}': {e}")
                return []

        tasks = [asyncio.create_task(_query_namespace(ns)) for ns in namespaces]
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        unique_docs = {}
        for res in results_list:
            if isinstance(res, BaseException):
                continue
            for item in res:
                doc = item["doc"]
                if doc not in unique_docs:
                    unique_docs[doc] = item
                else:
                    unique_docs[doc]["distance"] = min(unique_docs[doc]["distance"], item["distance"])

        documents = list(unique_docs.keys())
        metadatas = [{"agent": item["agent"], "source": item["source"]} for item in unique_docs.values()]
        distances = [item["distance"] for item in unique_docs.values()]
        return documents, metadatas, distances

    async def query_memory(self, question: str, n_results: int = 3, local_only: bool = False) -> str:
        try:
            # 1. Expansao da Query com IA para Recall Semantico Superior
            expanded_queries = [question] if local_only else await self._expand_query(question)

            # SOTA: Federated query distributed across sharded databases
            documents, metadatas, distances = await self._federated_query(expanded_queries, n_results)

            if not documents:
                logger.warning(
                    "[RAG] Busca vetorial nao retornou resultados. Acionando Fallback Lexical (I/O Direto)..."
                )
                return await self._zero_latency_lexical_fallback()

            top_docs = self._rank_documents(question, documents, metadatas, distances, n_results)

            output_parts = ["\n=== MENTE COLETIVA (BUSCA HIBRIDA SOTA) ==="]
            for i, item in enumerate(top_docs):
                output_parts.append(
                    f"--- Fragmento #{i + 1} de @{item['agent']} (Fonte: {Path(item['source']).name}) ---\n{item['doc']}\n"
                )
            return "\n".join(output_parts)
        except (ImportError, RuntimeError):
            logger.exception("[RAG] Colapso Critico no ChromaDB/ONNX. Acionando Fallback Lexical (Latencia Zero)...")
            # Bypass de seguranca para evitar que o LLM responda sem contexto
            return await self._zero_latency_lexical_fallback()

    async def _extract_causal_graph(self, session, system_prompt: str, user_prompt: str) -> str:
        try:
            logger.info("[RAG] Forjando Grafo Causal (Knowledge Graph) via Oraculo Gemma Local (SOTA)...")
            response, _ = await call_gemma_local(
                session=session,
                _model="gemma4:4b",
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                key="local",
                max_tokens=1024,
            )
            return response
        except (ImportError, ValueError) as e:
            logger.warning(f"[RAG] Falha na forja do Grafo Causal via Gemma Local: {e}. Tentando fallback para Cloud.")

        if GEMINI_KEYS:
            try:
                logger.info("[RAG] Forjando Grafo Causal (Knowledge Graph) via Gemini...")
                response, _ = await call_gemini(
                    session,
                    "gemini-2.5-flash",
                    system_prompt,
                    user_prompt,
                    GEMINI_KEYS[0],
                )
                return response
            except (ImportError, ValueError) as e:
                logger.warning(f"[RAG] Falha na forja do Grafo Causal via Gemini: {e}")

        if OPENROUTER_KEYS:
            try:
                logger.info("[RAG] Forjando Grafo Causal via OpenRouter (Fallback)...")
                response, _ = await call_openrouter(
                    session,
                    "google/gemini-2.5-flash",
                    system_prompt,
                    user_prompt,
                    OPENROUTER_KEYS[0],
                )
                return response
            except (ImportError, ValueError) as e:
                logger.warning(f"[RAG] Falha na forja do Grafo Causal via OpenRouter: {e}")
        return '{"nodes": [], "edges": []}'

    async def query_causal_graph(self, question: str, n_results: int = 5) -> str:
        """SOTA: Extrai relacoes causais dinamicas (A -> B) para o Knowledge Graph."""
        try:
            # Reutiliza o RAG Hibrido para buscar os blocos factuais
            expanded_queries = await self._expand_query(question)

            # SOTA: Federated query distributed across sharded databases
            documents, metadatas, distances = await self._federated_query(expanded_queries, n_results)

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
            return re.sub(r"^```(?:json)?|```$", "", raw_json.strip(), flags=re.MULTILINE).strip()

        except (ImportError, RuntimeError):
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
            target_dir = os.environ.get("GDRIVE_PDF_PATH", r"C:\Users\Raphael\Google Drive\Poker_PDFs")
            ingest_drive_pdfs(target_dir)
        else:
            logger.error("Uso: python memory_rag.py [ingest | ingest_drive | query 'pergunta']")
    else:
        logger.info("Uso SOTA: python memory_rag.py [ingest | ingest_drive | query]")
