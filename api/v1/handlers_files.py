"""Handlers de servico de arquivos -- extraidos de handlers.py na Fase 3.

Bloco coeso: listagem das raizes permitidas, visualizacao/download com guards
de traversal e parsing por tipo (planilha, zip, imagem, PDF). As funcoes de
seguranca (_is_sensitive_path, _is_file_access_allowed) vivem aqui porque so
tem consumidores neste bloco -- medido por varredura antes da extracao.
"""

from __future__ import annotations

import asyncio
import base64
import mimetypes
import os
from pathlib import Path
import re
from typing import Any, cast
from urllib.parse import quote
import zipfile

from aiohttp import web

from api.v1 import handler_support
from api.v1.handler_support import _internal_error
import core.runtime as _te

IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
SPREADSHEET_EXTS = (".csv", ".xlsx", ".ods", ".xls")
ARCHIVE_EXTS = (".zip", ".rar", ".7z")


def _categorize_file(ext: str) -> str:
    if ext in ARCHIVE_EXTS:
        return "archive"
    if ext in IMAGE_EXTS:
        return "image"
    if ext in (".mp4", ".avi", ".mkv", ".mov", ".mp3", ".wav"):
        return "media"
    if ext in SPREADSHEET_EXTS:
        return "spreadsheet"
    if ext == ".pdf":
        return "pdf"
    return "text"


def _scan_root(name: str, root_resolved: Path, ignored_folders: set[str]) -> list[dict[str, Any]]:

    files_list: list[dict[str, Any]] = []
    for current_root, dirs, files in os.walk(root_resolved):
        dirs[:] = [d for d in dirs if d not in ignored_folders]
        if name == "GoogleDrive":
            relative = Path(current_root).relative_to(root_resolved)
            if len(relative.parts) > 0 and relative.parts[0] not in ("Documentos", "GD", "Documents"):
                dirs.clear()
                continue
        for f in files:
            fpath = Path(current_root) / f
            if _is_sensitive_path(fpath):
                continue  # a listagem nao anuncia o que a leitura recusa
            files_list.append(
                {
                    "name": f,
                    "path": fpath.as_posix(),
                    "relative_path": fpath.relative_to(root_resolved).as_posix(),
                    "category": _categorize_file(fpath.suffix.lower()),
                    "size": fpath.stat().st_size if fpath.exists() else 0,
                }
            )
    return files_list[:200]


def _get_allowed_roots(base_dir: Path) -> list[tuple[str, Path]]:
    allowed_roots = [
        ("Cerebro", base_dir / ".cerebro"),
        ("Project", base_dir),
    ]
    gdrive_base = cast(Path, getattr(_te, "PATH_GDRIVE_ROOT", Path("")))
    if gdrive_base.exists():
        allowed_roots.append(("GoogleDrive", gdrive_base))
    return allowed_roots


async def handle_list_files(_request: web.Request) -> web.Response:
    """SOTA CLI/API: Lists files in the allowed workspace and Google Drive folders."""
    base_dir = handler_support.BASE_WORKSPACE_DIR
    ignored_folders = {
        ".venv",
        ".venv-wsl",
        "node_modules",
        ".git",
        ".next",
        "temp",
        "reports",
        "dist",
        ".mypy_cache",
        ".ruff_cache",
    }

    def _scan() -> list[dict[str, Any]]:
        tree: list[dict[str, Any]] = []
        for name, root_path in _get_allowed_roots(base_dir):
            if not root_path.exists():
                continue
            root_resolved = root_path.resolve()
            tree.append(
                {
                    "source": name,
                    "path": root_resolved.as_posix(),
                    "files": _scan_root(name, root_resolved, ignored_folders),
                }
            )
        return tree

    try:
        tree = await asyncio.to_thread(_scan)
        return web.json_response({"status": "SUCCESS", "tree": tree})
    except Exception as e:
        return _internal_error(e, "handle_list_files")


def _parse_spreadsheet(ext: str, file_path: Path) -> dict[str, Any]:
    import pandas as pd  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    if ext == ".csv":
        df = pd.read_csv(file_path, nrows=50)  # pyright: ignore[reportUnknownMemberType]
    elif ext == ".xlsx":
        df = pd.read_excel(file_path, nrows=50)  # pyright: ignore[reportUnknownMemberType]
    else:
        df = pd.read_excel(file_path, engine="odf", nrows=50)  # pyright: ignore[reportUnknownMemberType]
    return {"headers": list(df.columns), "rows": df.values.tolist()}  # pyright: ignore[reportUnknownMemberType]


def _list_zip(file_path: Path) -> list[dict[str, Any]]:
    from utils.os_integration import get_winrar_path  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    files: list[dict[str, Any]] = []
    if zipfile.is_zipfile(file_path):
        with zipfile.ZipFile(file_path, "r") as zf:
            for name in zf.namelist():
                info = zf.getinfo(name)
                files.append({"name": name, "size": info.file_size, "is_dir": info.is_dir()})
    else:
        winrar_path = get_winrar_path()
        if winrar_path and os.path.exists(winrar_path):
            files.append({"name": "Conteudo Rar (Visualizacao via WinRAR habilitada)", "size": 0, "is_dir": False})
    return files


def _parse_image(file_path: Path) -> dict[str, Any]:
    from PIL import Image  # pylint: disable=import-outside-toplevel # noqa: PLC0415
    from PIL.ExifTags import TAGS  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    with Image.open(file_path) as img:
        exif_data: dict[str, str] = {}
        if exif := img.getexif():
            for tag_id, val in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if not isinstance(val, (bytes, bytearray)) and len(str(val)) < 100:
                    exif_data[str(tag)] = str(val)
        b64_str = ""
        if file_path.stat().st_size < 1 * 1024 * 1024:
            with open(file_path, "rb") as f:
                b64_str = base64.b64encode(f.read()).decode("utf-8")
        return {"format": img.format, "size": f"{img.width}x{img.height}", "exif": exif_data, "base64": b64_str}


#: BK-19 (auditoria 2026-09-16): a raiz do projeto inteira era legivel pela API,
#: inclusive segredos e historico git. Estes nomes ficam fora mesmo para a
#: credencial de servico -- e para qualquer processo local quando nenhum token
#: esta configurado. `.env.example` e modelo sem valor, e continua legivel.
#:
#: SEC-02 (auditoria 2026-09-30): a lista listava `.secrets` COM PONTO, e o
#: `docker-compose.yml:2-3` monta o segredo do gateway em
#: `.claude/secrets/auth_secret.txt` -- diretorio `secrets`, SEM ponto. Nao
#: casava, e como o compose tambem monta `./.claude:/app/.claude`, o
#: `AUTH_SECRET` (o mesmo que assina a sessao NextAuth) ficava legivel por
#: `/api/files/view` dentro do container. Medido executando a cadeia exata:
#: `/app/.claude/secrets/auth_secret.txt` devolvia servivel=SIM.
#:
#: A correcao nao e so acrescentar `secrets`: e derivar a lista do que o
#: `docker-compose.yml` realmente monta, porque literal novo nasce coberto por
#: acidente -- que e a mesma razao que fez A-01 existir.
_MOUNTED_SECRET_DIRS = ("secrets", "queue")
_SENSITIVE_DIR_COMPONENTS = frozenset({".git", ".secrets", ".ssh", ".gnupg", ".aws", *_MOUNTED_SECRET_DIRS})
#: SEC-02: `queue/` e `./tasks.db` sao montados no container e `.gitignore:80`
#: declara `queue/tasks.db` e `*.db` -- o estado da fila (prompts, respostas,
#: metadata) e leitura de servico hoje. Formato de banco por SUFIXO, porque e
#: o que o `.gitignore` ja proibe: as duas listas medem o mesmo fato.
_SENSITIVE_SUFFIXES = frozenset(
    {
        ".pem",
        ".key",
        ".p12",
        ".pfx",
        ".keystore",
        ".jks",
        ".db",
        ".sqlite",
        ".sqlite3",
        ".lance",
    }
)
_SENSITIVE_NAMES = frozenset({"id_rsa", "id_ed25519", "id_ecdsa", "id_dsa", ".netrc", ".npmrc", ".pypirc"})

#: A-01 (auditoria 2026-09-29): a familia de arquivo de ambiente e reconhecida
#: por PADRAO, e nao por literal. A regra anterior era `(name == ".env" or
#: name.startswith(".env.")) and name != ".env.example"` -- literal exato mais
#: prefixo, com excecao SUBTRAIDA. Literal novo nasce coberto por acidente: e
#: assim que `_env.ps1` passou a ser servido. Medido antes da correcao:
#: `_is_file_access_allowed("<raiz>/_env.ps1")` devolvia True, e esse arquivo e
#: a segunda fonte canonica de credenciais do projeto (declarada em
#: `_env.example.ps1`, ignorada em `.gitignore:157`), com `API_SECRET_TOKEN` e
#: `AUTH_SECRET` em claro. Quem tem a credencial de servico -- a unica que
#: alcanca esta rota -- lia o segredo que o proprio sistema entrega.
#:
#: Tres particoes, e cada uma fecha uma familia:
#: - `ext.startswith("env")`: `.env`, `.env.local`, `.envrc`, `nexus.env`
#: - `stem in {"env", "_env"}`: `env.sh`, `_env.ps1`
#: - `stem.endswith(("_env", "-env"))`: `nexus_env.ps1`
#:
#: O que NAO e familia e continua servivel: `environment.ts`, `env_loader.py`,
#: `settings.json`, `CLAUDE.md`. A regra grew por medicao, nao por volumen.
_ENV_TEMPLATE_MARKERS = (".example", ".sample", ".template", ".dist", ".tpl")


def _nome_e_da_familia_ambiente(name: str) -> bool:
    """Diz se o nome do arquivo pertence a familia de arquivo de ambiente."""
    stem, _, ext = name.partition(".")
    return ext.startswith("env") or stem in {"env", "_env"} or stem.endswith(("_env", "-env"))


def _e_modelo_publico(name: str) -> bool:
    """Modelo de ambiente sem valor: legivel de proposito, e a unica excepcao.

    A excecao e DECLARADA por marcador, e nao deduzida. Excecao subtraida
    (`.env.example` menos um) morre em silencio quando o nome muda de forma;
    excecao declarada aparece quando o nome novo nao casa com nenhum marcador.
    """
    return any(marker in name for marker in _ENV_TEMPLATE_MARKERS)


def _is_sensitive_path(file_path: Path) -> bool:
    # Ponto e espaco finais sao descartados pelo Windows ao abrir o arquivo.
    parts = [p.rstrip(". ").lower() for p in file_path.parts]
    name = parts[-1] if parts else ""
    # SEC-02 (auditoria 2026-09-30): `parts[:-1]` exclui o PROPRIO nome, entao um
    # volume que e ele mesmo um diretorio sensivel nao casava -- `/app/queue`
    # devolvia servivel, ainda que `/app/queue/tasks.db` fosse recusado. O
    # arquivo dentro ja era barrado; o caminho do volume, nao. Medido pelo teste
    # `test_todo_volume_de_segredo_do_compose_esta_bloqueado`, que deriva os
    # volumes do `docker-compose.yml` em vez de hardcodar o caso.
    #
    # Inclui o proprio nome DEPOIS do nome exato e do sufixo, para nao alterar o
    # que ja era decidido: um arquivo chamado `queue` na raiz continua caindo
    # pela regra de nome/sufixo, e um diretorio sensivel ganha a regra nova.
    if any(p in _SENSITIVE_DIR_COMPONENTS for p in parts[:-1]):
        return True
    if name in _SENSITIVE_NAMES or file_path.suffix.lower() in _SENSITIVE_SUFFIXES:
        return True
    if name in _SENSITIVE_DIR_COMPONENTS and file_path.is_dir():
        return True
    if _nome_e_da_familia_ambiente(name):
        return not _e_modelo_publico(name)
    return False


def _is_file_access_allowed(file_path: Path) -> bool:
    if _is_sensitive_path(file_path):
        return False
    base_dir = Path(__file__).resolve().parent.parent.parent.resolve()
    if file_path.is_relative_to(base_dir):
        return True
    gdrive_base = cast(Path, getattr(_te, "PATH_GDRIVE_ROOT", Path(""))).resolve()
    if gdrive_base.exists() and file_path.is_relative_to(gdrive_base):
        rel = file_path.relative_to(gdrive_base)
        if len(rel.parts) > 0 and rel.parts[0] in ("Documentos", "GD", "Documents"):
            return True
    return False


RAW_MIME_TYPES: dict[str, str] = {
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".html": "text/html",
    ".htm": "text/html",
    ".zip": "application/zip",
}


def _get_raw_content_type(ext: str) -> str:
    ext_lower = ext.lower()
    if ext_lower in RAW_MIME_TYPES:
        return RAW_MIME_TYPES[ext_lower]
    guessed, _ = mimetypes.guess_type(f"file{ext_lower}")
    return guessed or "application/octet-stream"


def _content_disposition(filename: str, *, download: bool) -> str:
    mode = "attachment" if download else "inline"
    ascii_filename = filename.encode("ascii", "ignore").decode("ascii")
    ascii_filename = re.sub(r'["\\\r\n]', "_", ascii_filename) or "download"
    encoded_filename = quote(filename, safe="")
    return f"{mode}; filename=\"{ascii_filename}\"; filename*=UTF-8''{encoded_filename}"


async def _parse_image_response(ext: str, file_path: Path) -> web.Response:
    if ext != ".svg":
        img_data = await asyncio.to_thread(_parse_image, file_path)
        return web.json_response({"type": "image", "data": img_data})

    def _read_svg_b64() -> str:
        with open(file_path, "rb") as file:
            return base64.b64encode(file.read()).decode("utf-8")

    b64_str = await asyncio.to_thread(_read_svg_b64)
    return web.json_response(
        {
            "type": "image",
            "data": {
                "format": "svg+xml",
                "size": "Vetor (Escalavel)",
                "exif": {},
                "base64": b64_str,
            },
        }
    )


async def _serve_parsed_file(file_path: Path, ext: str) -> web.Response:
    if ext in SPREADSHEET_EXTS:
        sheet_data = await asyncio.to_thread(_parse_spreadsheet, ext, file_path)
        return web.json_response({"type": "spreadsheet", "data": sheet_data})
    if ext in ARCHIVE_EXTS:
        archive_files = await asyncio.to_thread(_list_zip, file_path)
        return web.json_response({"type": "archive", "files": archive_files})
    if ext in IMAGE_EXTS:
        return await _parse_image_response(ext, file_path)
    if ext in (".mp4", ".avi", ".mkv", ".mov", ".mp3", ".wav"):
        return web.json_response({"type": "media", "message": "Streaming de media disponivel."})
    if ext in (".pdf", ".docx", ".odt", ".doc", ".ppt", ".pptx", ".odp"):
        rag = await _te.get_rag_async()
        extracted_text = await rag._extract_text_from_file(file_path)  # pyright: ignore[reportPrivateUsage] # pylint: disable=protected-access
        words_count = len(extracted_text.split()) if extracted_text else 0
        return web.json_response(
            {
                "type": "document",
                "content": extracted_text,
                "format": ext.lstrip("."),
                "words": words_count,
                "chars": len(extracted_text) if extracted_text else 0,
            }
        )

    file_size = (await asyncio.to_thread(file_path.stat)).st_size
    if file_size > 5 * 1024 * 1024:
        return web.json_response(
            {
                "type": "text",
                "content": f"[Aviso] O arquivo e muito grande ({file_size / 1024 / 1024:.1f} MB) para ser exibido diretamente como texto. Baixe o arquivo bruto ou use o RAG para processa-lo.",
            }
        )

    text_content = await asyncio.to_thread(file_path.read_text, encoding="utf-8", errors="ignore")
    return web.json_response(
        {
            "type": "text",
            "content": text_content,
            "format": ext.lstrip("."),
            "lines": text_content.count("\n") + 1 if text_content else 0,
        }
    )


async def handle_view_file(request: web.Request) -> web.StreamResponse:
    """SOTA CLI/API: Serves or parses the file content securely with traversal guards."""
    path_param = request.rel_url.query.get("path", "").strip()
    download_param = request.rel_url.query.get("download", "false").strip().lower() == "true"
    raw_param = request.rel_url.query.get("raw", "false").strip().lower() == "true" or download_param

    if not path_param:
        return web.json_response({"error": "Parametro 'path' ausente."}, status=400)

    file_path = await asyncio.to_thread(lambda: Path(path_param).resolve())
    if not _is_file_access_allowed(file_path):
        return web.json_response({"error": "[SEC] Acesso negado: Caminho fora das fronteiras autorizadas."}, status=403)

    if not file_path.exists() or not file_path.is_file():
        return web.json_response({"error": "Arquivo nao encontrado ou nao e um arquivo valido."}, status=404)

    ext = file_path.suffix.lower()
    if raw_param:
        headers = {
            "Content-Type": _get_raw_content_type(ext),
            "Content-Disposition": _content_disposition(file_path.name, download=download_param),
            "X-Content-Type-Options": "nosniff",
        }
        if ext == ".pdf":
            # PDF nativo em navegadores exige politica de objetos/plugins sem sandbox bloqueante
            headers["Content-Security-Policy"] = (
                "default-src 'self' data: blob:; object-src 'self' data: blob:; script-src 'none'; style-src 'unsafe-inline';"
            )
        elif ext == ".svg":
            # SVG requer sandbox estrito para mitigar execucao de script arbitrario (BK-19)
            headers["Content-Security-Policy"] = "sandbox; default-src 'none'; img-src 'self' data:;"
        else:
            headers["Content-Security-Policy"] = "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self';"

        return web.FileResponse(file_path, headers=headers)

    try:
        return await _serve_parsed_file(file_path, ext)
    except Exception as e:
        return _internal_error(e, "handle_view_file")
