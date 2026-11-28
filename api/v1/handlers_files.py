"""Handlers de servico de arquivos -- extraidos de handlers.py na Fase 3.

Bloco coeso: listagem das raizes permitidas, visualizacao/download com guards
de traversal e parsing por tipo (planilha, zip, imagem, PDF). As funcoes de
seguranca (_is_sensitive_path, _is_file_access_allowed) vivem aqui porque so
tem consumidores neste bloco -- medido por varredura antes da extracao.
"""

from __future__ import annotations

import asyncio
import base64
import math
import mimetypes
import os
from pathlib import Path
import re
from typing import Any
from urllib.parse import quote
import zipfile

from aiohttp import web

from api.v1 import handler_support
from api.v1.handler_support import _internal_error
import core.runtime as _te

IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
DOCX_EXT = ".docx"
JSON_EXT = ".json"
SPREADSHEET_EXTS = (".csv", ".xlsx", ".ods", ".xls")
ARCHIVE_EXTS = (".zip", ".rar", ".7z")
MEDIA_EXTS = (".mp4", ".avi", ".mkv", ".mov", ".webm", ".mp3", ".wav", ".ogg", ".flac", ".m4a")
DOC_MODE_EXTS = frozenset(
    {".md", ".mdx", ".txt", ".rst", ".pdf", DOCX_EXT, ".odt", ".doc", JSON_EXT, ".yaml", ".yml", ".toml"}
)
_DOC_PRIORITY_EXTS = frozenset({".md", ".mdx", ".txt", ".rst", ".pdf", DOCX_EXT, ".odt"})
_PRIORITY_TOP_DIRS = frozenset(
    {
        "nucleo",
        "memoria",
        "docs",
        "governance",
        "policies",
        "skills",
        "skills_library",
        ".agents",
        "agents",
        ".claude",
        "projetos",
        "relatorios",
        "history",
        "pendencias",
    }
)
_DEFAULT_IGNORED_FOLDERS = frozenset(
    {
        ".venv",
        ".venv-wsl",
        ".venv_backup_pre_fusion",
        "Python-3.12.13",
        "node_modules",
        ".git",
        ".next",
        ".swc",
        ".turbo",
        ".cache",
        ".mypy_cache",
        ".ruff_cache",
        ".pytest_cache",
        ".pytest_temp",
        ".pytest_tmp",
        ".hypothesis",
        "__pycache__",
        "dist",
        "build",
        "temp",
        "tmp",
        "logs",
        "site-dev-logs",
        "reports",
        "Backups",
        "antigravity-backup",
        "antigravity-demo-archive",
        "antigravity-cli",
        "antigravity-ide",
        "remediacao_backup_aplicado",
        "quarantine",
        "Site-worktrees",
        "models",
        "coverage",
        "coverage-fase5",
        "coverage-fase5b",
        "htmlcov",
        "target",
        "CMakeFiles",
        "oracleJdk-26",
        ".backups",
        "118315387178585042861",
        ".trunk",
        ".pyright-shims",
        ".codeatlas",
        ".remember",
        ".vscodecsdt",
        "lancedb",
        "chroma_db",
        "hm2",
        "vendor",
        "ik_llama.cpp",
        "jdk-21",
        "llama.cpp",
        "llama.cpp-vulkan-bak",
        "scratch",
        "brain",
        "code_tracker",
        "conversations",
        "implicit",
        "browser_recordings",
        "plugin_data",
        "playwright-report",
        "test-results",
        "secrets",
        "queue",
        ".secrets",
        ".ssh",
        ".gnupg",
        ".aws",
    }
)
_IGNORED_REL_PREFIXES = frozenset(
    {
        ("antigravity", "mcp"),
        ("antigravity", "cache"),
        ("antigravity", "annotations"),
        ("config", "plugins"),
    }
)
_IGNORED_FILE_EXTS = frozenset(
    {".pyc", ".pyo", ".pyd", ".obj", ".tlog", ".idb", ".pdb", ".ilk", ".exe", ".dll", ".so", ".lnk"}
)
_CLOUD_IGNORED_FOLDERS = frozenset(
    {
        "$RECYCLE.BIN",
        "System Volume Information",
        ".tmp.drivedownload",
        ".tmp.driveupload",
        "TurboActivate",
        ".vscode",
    }
)
_CLOUD_IGNORED_NAMES = frozenset({"desktop.ini", "thumbs.db", ".ds_store"})
_CLOUD_IGNORED_EXTS = frozenset({".dat", ".lnk", ".ini", ".tmp"})
_CLOUD_MAX_DEPTH = 4
_CLOUD_MAX_LIMIT = 800
_MAX_SCAN_LIMIT = 5000
_DEFAULT_SCAN_LIMIT = 3000


def _categorize_file(ext: str) -> str:
    if ext in ARCHIVE_EXTS:
        return "archive"
    if ext in IMAGE_EXTS:
        return "image"
    if ext in MEDIA_EXTS:
        return "media"
    if ext in SPREADSHEET_EXTS:
        return "spreadsheet"
    if ext == ".pdf":
        return "pdf"
    return "text"


def _is_noise_file(filename: str, ext_lower: str, *, is_cloud: bool = False) -> bool:
    if ext_lower in _IGNORED_FILE_EXTS:
        return True
    lower = filename.lower()
    if lower in _CLOUD_IGNORED_NAMES:
        return True
    if is_cloud and ext_lower in _CLOUD_IGNORED_EXTS:
        return True
    if lower.startswith("hermes-backup-") and lower.endswith(".zip"):
        return True
    return ".bak" in lower and (lower.endswith(".bak") or ".bak-" in lower or ".bak." in lower)


def _should_prune_directory(
    directory: str,
    rel_parts: tuple[str, ...],
    *,
    ignored_folders: set[str],
    is_ecosystem: bool,
    is_cloud: bool = False,
) -> bool:
    lowered = directory.lower()
    if directory in ignored_folders:
        return True
    if is_cloud and directory in _CLOUD_IGNORED_FOLDERS:
        return True
    if lowered.startswith(("acl_backup_", "remediacao_backup_", "plugins_quarantine", "$")):
        return True
    if lowered.endswith(("_archive", "_quarantine")):
        return True
    if is_ecosystem and not rel_parts and directory == "Site":
        return True
    return (rel_parts + (directory,))[:2] in _IGNORED_REL_PREFIXES


def _file_matches_scan(file_path: Path, filename: str, *, docs_only: bool, is_cloud: bool = False) -> str | None:
    if _is_sensitive_path(file_path):
        return None
    ext_lower = file_path.suffix.lower()
    if _is_noise_file(filename, ext_lower, is_cloud=is_cloud) or (docs_only and ext_lower not in DOC_MODE_EXTS):
        return None
    return ext_lower


def _scan_entry(
    file_path: Path, filename: str, rel_path: str, ext_lower: str
) -> tuple[tuple[int, int, str], dict[str, Any]] | None:
    try:
        stat = file_path.stat()
    except OSError:
        return None
    parts = Path(rel_path).parts
    if len(parts) <= 1:
        top_rank = 0
    elif parts[0].lower() in _PRIORITY_TOP_DIRS:
        top_rank = 1
    else:
        top_rank = 2
    ext_rank = 0 if ext_lower in _DOC_PRIORITY_EXTS else 1
    return (
        (top_rank, ext_rank, rel_path.lower()),
        {
            "name": filename,
            "path": file_path.as_posix(),
            "relative_path": rel_path,
            "category": _categorize_file(ext_lower),
            "ext": ext_lower,
            "size": stat.st_size,
            "mtime": float(stat.st_mtime),
        },
    )


def _matches_scan_query(query_norm: str, filename: str, relative_path: str) -> bool:
    return not query_norm or query_norm in filename.lower() or query_norm in relative_path.lower()


def _gdrive_uses_doc_subdirs(gdrive_resolved: Path) -> bool:
    if gdrive_resolved.name.lower() in ("meu drive", "my drive"):
        return False
    return any((gdrive_resolved / sub).is_dir() for sub in ("Documentos", "GD", "Documents"))


def _scan_root_with_stats(
    name: str,
    root_resolved: Path,
    ignored_folders: set[str],
    *,
    query: str = "",
    mode: str = "all",
    limit: int = _DEFAULT_SCAN_LIMIT,
) -> tuple[list[dict[str, Any]], int, bool]:
    query_norm = query.strip().lower()
    docs_only = mode.strip().lower() == "docs"
    is_cloud = name in ("GoogleDrive", "OneDrive")
    capped_limit = max(50, min(limit, _MAX_SCAN_LIMIT))
    if is_cloud:
        capped_limit = min(capped_limit, _CLOUD_MAX_LIMIT)
    collected: list[tuple[tuple[int, int, str], dict[str, Any]]] = []
    is_ecosystem = name.startswith("Ecosystem")
    restrict_gdrive_subdirs = name == "GoogleDrive" and _gdrive_uses_doc_subdirs(root_resolved)

    for current_root, dirs, files in os.walk(root_resolved):
        current_path = Path(current_root)
        rel_dir = current_path.relative_to(root_resolved)
        if is_cloud and len(rel_dir.parts) >= _CLOUD_MAX_DEPTH:
            dirs.clear()
        else:
            dirs[:] = [
                directory
                for directory in dirs
                if not _should_prune_directory(
                    directory,
                    rel_dir.parts,
                    ignored_folders=ignored_folders,
                    is_ecosystem=is_ecosystem,
                    is_cloud=is_cloud,
                )
            ]

        if (
            restrict_gdrive_subdirs
            and bool(rel_dir.parts)
            and rel_dir.parts[0] not in ("Documentos", "GD", "Documents")
        ):
            dirs.clear()
            continue

        for f in files:
            fpath = current_path / f
            candidate = _file_matches_scan(fpath, f, docs_only=docs_only, is_cloud=is_cloud)
            if candidate is None:
                continue  # a listagem nao anuncia o que a leitura recusa
            ext_lower = candidate
            rel_path_posix = fpath.relative_to(root_resolved).as_posix()
            if not _matches_scan_query(query_norm, f, rel_path_posix):
                continue
            entry = _scan_entry(fpath, f, rel_path_posix, ext_lower)
            if entry is not None:
                collected.append(entry)

    collected.sort(key=lambda item: item[0])
    total_count = len(collected)
    truncated = total_count > capped_limit
    return [entry for _, entry in collected[:capped_limit]], total_count, truncated


def _scan_root(
    name: str,
    root_resolved: Path,
    ignored_folders: set[str],
    *,
    query: str = "",
    mode: str = "all",
    limit: int = _DEFAULT_SCAN_LIMIT,
) -> list[dict[str, Any]]:
    files_list, _, _ = _scan_root_with_stats(
        name,
        root_resolved,
        ignored_folders,
        query=query,
        mode=mode,
        limit=limit,
    )
    return files_list


def _resolve_gdrive_root(base_dir: Path | None = None) -> Path | None:
    raw = getattr(_te, "PATH_GDRIVE_ROOT", None)
    if raw is not None:
        candidate = raw if isinstance(raw, Path) else Path(str(raw).strip())
        if str(candidate).strip() in ("", ".") or not candidate.is_absolute():
            return None
        return candidate
    env_gdrive = os.environ.get("NEXUS_GDRIVE_ROOT")
    if env_gdrive is not None:
        cleaned = env_gdrive.strip()
        if not cleaned:
            return None
        cand = Path(cleaned)
        return cand.resolve() if cand.is_absolute() and cand.exists() and cand.is_dir() else None
    if base_dir is not None and _resolve_ecosystem_root(base_dir) is not None:
        for mount in (Path(r"F:\Meu Drive"), Path(r"G:\Meu Drive"), Path(r"G:\My Drive")):
            if mount.exists() and mount.is_dir():
                return mount.resolve()
    return None


def _resolve_onedrive_root(base_dir: Path | None = None) -> Path | None:
    env_od = os.environ.get("NEXUS_ONEDRIVE_ROOT")
    if env_od is not None:
        cleaned = env_od.strip()
        if not cleaned:
            return None
        cand = Path(cleaned)
        return cand.resolve() if cand.is_absolute() and cand.exists() and cand.is_dir() else None
    if base_dir is not None and _resolve_ecosystem_root(base_dir) is not None:
        for env_key in ("OneDrive", "OneDriveConsumer", "OneDriveCommercial"):
            val = os.environ.get(env_key, "").strip()
            if val:
                cand = Path(val)
                if cand.is_absolute() and cand.exists() and cand.is_dir():
                    return cand.resolve()
        fallback = Path.home() / "OneDrive"
        if fallback.exists() and fallback.is_dir():
            return fallback.resolve()
    return None


def _resolve_ecosystem_root(base_dir: Path) -> Path | None:
    env_root = os.environ.get("NEXUS_ECOSYSTEM_ROOT", "").strip()
    if env_root:
        candidate = Path(env_root)
        if candidate.is_absolute() and candidate.exists() and candidate.is_dir():
            return candidate.resolve()
        return None
    parent = base_dir.resolve().parent
    if (
        parent.name.lower() == ".gemini"
        and (parent / "WORKSPACE_INDEX.md").is_file()
        and (parent / "CLAUDE.md").is_file()
    ):
        return parent.resolve()
    return None


def _get_allowed_roots(base_dir: Path) -> list[tuple[str, Path]]:
    allowed_roots: list[tuple[str, Path]] = []
    eco_root = _resolve_ecosystem_root(base_dir)
    if eco_root is not None and eco_root.exists():
        allowed_roots.append(("Ecosystem (.gemini)", eco_root))
    allowed_roots.extend(
        [
            ("Cerebro", base_dir / ".cerebro"),
            ("Project", base_dir),
        ]
    )
    gdrive_base = _resolve_gdrive_root(base_dir)
    if gdrive_base is not None and gdrive_base.exists():
        allowed_roots.append(("GoogleDrive", gdrive_base))
    onedrive_base = _resolve_onedrive_root(base_dir)
    if onedrive_base is not None and onedrive_base.exists():
        allowed_roots.append(("OneDrive", onedrive_base))
    return allowed_roots


def _source_metadata(name: str) -> tuple[str, str]:
    if name.startswith("Ecosystem"):
        return "ecosystem", "Raiz multiprojeto (.gemini): governanca, nucleo, memoria, skills e projetos."
    if name == "Cerebro":
        return "knowledge", "Base vetorial local e artefatos de conhecimento (.cerebro)."
    if name == "GoogleDrive":
        return "cloud", "Documentos e acervos sincronizados do Google Drive."
    if name == "OneDrive":
        return "onedrive", "Documentos e pastas locais sincronizadas do Microsoft OneDrive."
    return "project", "Repositorio canonico Site/: codigo, docs, skills, testes e schemas."


async def handle_list_files(request: web.Request) -> web.Response:
    """SOTA CLI/API: Lists files in the allowed ecosystem, workspace and Google Drive folders."""
    base_dir = handler_support.BASE_WORKSPACE_DIR
    ignored_folders = set(_DEFAULT_IGNORED_FOLDERS)
    query_param = request.rel_url.query.get("q", "").strip()
    mode_param = request.rel_url.query.get("mode", "all").strip().lower()
    raw_limit = request.rel_url.query.get("limit", "").strip()
    try:
        limit = int(raw_limit) if raw_limit else _DEFAULT_SCAN_LIMIT
    except ValueError:
        limit = _DEFAULT_SCAN_LIMIT

    def _scan() -> list[dict[str, Any]]:
        tree: list[dict[str, Any]] = []
        for name, root_path in _get_allowed_roots(base_dir):
            if not root_path.exists():
                continue
            root_resolved = root_path.resolve()
            files, total_count, truncated = _scan_root_with_stats(
                name,
                root_resolved,
                ignored_folders,
                query=query_param,
                mode=mode_param,
                limit=limit,
            )
            kind, description = _source_metadata(name)
            tree.append(
                {
                    "source": name,
                    "kind": kind,
                    "description": description,
                    "path": root_resolved.as_posix(),
                    "total_count": total_count,
                    "truncated": truncated,
                    "files": files,
                }
            )
        return tree

    try:
        tree = await asyncio.to_thread(_scan)
        return web.json_response({"status": "SUCCESS", "tree": tree})
    except Exception as e:
        return _internal_error(e, "handle_list_files")


def _sanitize_cell(val: Any) -> Any:
    if val is None:
        return None
    if isinstance(val, float):
        return None if (math.isnan(val) or math.isinf(val)) else val
    if isinstance(val, (str, int, bool)):
        return val
    if hasattr(val, "item") and callable(val.item):
        return _sanitize_cell(val.item())
    return str(val)


def _read_csv_spreadsheet(file_path: Path) -> Any:
    import pandas as pd  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    try:
        return pd.read_csv(file_path, nrows=200)  # pyright: ignore[reportUnknownMemberType]
    except UnicodeDecodeError:
        return pd.read_csv(file_path, nrows=200, encoding="latin-1")  # pyright: ignore[reportUnknownMemberType]


def _first_sheet_or_default(sheets: list[str]) -> str | int:
    return sheets[0] if sheets else 0


def _read_excel_spreadsheet(ext: str, file_path: Path, sheet_name: str | None) -> tuple[Any, list[str], str | None]:
    import pandas as pd  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    excel_kwargs: dict[str, Any] = {"engine": "odf"} if ext == ".ods" else {}
    with pd.ExcelFile(file_path, **excel_kwargs) as xls:
        sheets = [str(sheet) for sheet in xls.sheet_names]
        target_sheet = sheet_name if sheet_name in sheets else _first_sheet_or_default(sheets)
        active_sheet = str(target_sheet) if sheets else None
        parsed = xls.parse(sheet_name=target_sheet, nrows=200)  # pyright: ignore[reportUnknownMemberType]
        dataframe = next(iter(parsed.values())) if isinstance(parsed, dict) else parsed
    return dataframe, sheets, active_sheet


def _parse_spreadsheet(ext: str, file_path: Path, sheet_name: str | None = None) -> dict[str, Any]:
    import pandas as pd  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    sheets: list[str] = []
    active_sheet: str | None = None

    if ext == ".csv":
        df = _read_csv_spreadsheet(file_path)
    else:
        df, sheets, active_sheet = _read_excel_spreadsheet(ext, file_path, sheet_name)

    clean_df = df.astype(object).where(pd.notnull(df), None)  # pyright: ignore[reportUnknownMemberType]
    headers = [str(col) for col in clean_df.columns]
    raw_rows: list[list[Any]] = clean_df.values.tolist()  # pyright: ignore[reportUnknownMemberType]
    rows = [[_sanitize_cell(cell) for cell in row] for row in raw_rows]
    result: dict[str, Any] = {"headers": headers, "rows": rows}
    if sheets:
        result["sheets"] = sheets
        result["active_sheet"] = active_sheet
    return result


def _list_zip(file_path: Path) -> list[dict[str, Any]]:
    from utils.os_integration import get_winrar_path  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    files: list[dict[str, Any]] = []
    if zipfile.is_zipfile(file_path):
        with zipfile.ZipFile(file_path, "r") as zf:
            for name in zf.namelist()[:500]:
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

    file_size = file_path.stat().st_size
    if file_size > 15 * 1024 * 1024:
        return {
            "format": file_path.suffix.lstrip(".").upper(),
            "size": "Imagem > 15MB (use raw=true)",
            "exif": {},
            "base64": "",
        }

    with Image.open(file_path) as img:
        exif_data: dict[str, str] = {}
        if exif := img.getexif():
            for tag_id, val in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if not isinstance(val, (bytes, bytearray)) and len(str(val)) < 100:
                    exif_data[str(tag)] = str(val)
        b64_str = ""
        if file_size < 1 * 1024 * 1024:
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
_SENSITIVE_DIR_COMPONENTS = frozenset(
    {".git", ".secrets", ".ssh", ".gnupg", ".aws", "quarantine", *_MOUNTED_SECRET_DIRS}
)
_SENSITIVE_DIR_PREFIXES = ("acl_backup_", "remediacao_backup_")
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
        ".db-wal",
        ".db-shm",
        ".sqlite",
        ".sqlite-wal",
        ".sqlite-shm",
        ".sqlite3",
        ".sqlite3-wal",
        ".sqlite3-shm",
        ".lance",
    }
)
_SENSITIVE_NAMES = frozenset(
    {
        "id_rsa",
        "id_ed25519",
        "id_ecdsa",
        "id_dsa",
        ".netrc",
        ".npmrc",
        ".pypirc",
        "oauth_creds.json",
        "gcp_oauth_client.json",
        "google_accounts.json",
        "installation_id",
        "credentials.json",
        "token.json",
        "client_secret.json",
        "service_account.json",
        "service-account.json",
    }
)
_SENSITIVE_JSON_PREFIXES = ("client_secret", "service_account", "service-account", "gcp_oauth")

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
    if name.endswith((".local", ".prod", ".production", ".secret", ".real")):
        return False
    return any(marker in name for marker in _ENV_TEMPLATE_MARKERS)


def _is_sensitive_path(file_path: Path) -> bool:
    # Ponto e espaco finais sao descartados pelo Windows ao abrir o arquivo.
    parts = [p.rstrip(". ").lower() for p in file_path.parts]
    name = parts[-1] if parts else ""
    if any(p in _SENSITIVE_DIR_COMPONENTS or p.startswith(_SENSITIVE_DIR_PREFIXES) for p in parts[:-1]):
        return True
    if (
        name in _SENSITIVE_NAMES
        or name.endswith("_creds.json")
        or (name.endswith(JSON_EXT) and name.startswith(_SENSITIVE_JSON_PREFIXES))
        or file_path.suffix.lower() in _SENSITIVE_SUFFIXES
        or any(name.endswith(sfx) for sfx in _SENSITIVE_SUFFIXES)
    ):
        return True
    if (name in _SENSITIVE_DIR_COMPONENTS or name.startswith(_SENSITIVE_DIR_PREFIXES)) and file_path.is_dir():
        return True
    if _nome_e_da_familia_ambiente(name):
        return not _e_modelo_publico(name)
    return False


def _is_file_access_allowed(file_path: Path) -> bool:
    if _is_sensitive_path(file_path):
        return False
    base_dir = handler_support.BASE_WORKSPACE_DIR.resolve()
    if file_path.is_relative_to(base_dir):
        return True
    eco_root = _resolve_ecosystem_root(base_dir)
    if eco_root is not None and eco_root.exists() and file_path.is_relative_to(eco_root):
        return True
    gdrive_base = _resolve_gdrive_root(base_dir)
    if gdrive_base is not None:
        gdrive_resolved = gdrive_base.resolve()
        if gdrive_resolved.exists() and file_path.is_relative_to(gdrive_resolved):
            if _gdrive_uses_doc_subdirs(gdrive_resolved):
                rel = file_path.relative_to(gdrive_resolved)
                if len(rel.parts) > 0 and rel.parts[0] in ("Documentos", "GD", "Documents"):
                    return True
            else:
                return True
    onedrive_base = _resolve_onedrive_root(base_dir)
    if onedrive_base is not None:
        onedrive_resolved = onedrive_base.resolve()
        if onedrive_resolved.exists() and file_path.is_relative_to(onedrive_resolved):
            return True
    return False


RAW_MIME_TYPES: dict[str, str] = {
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    JSON_EXT: "application/json",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".mdx": "text/markdown",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "application/toml",
    ".csv": "text/csv",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".xml": "application/xml",
    ".sql": "application/sql",
    ".py": "text/x-python",
    ".ts": "text/typescript",
    ".tsx": "text/tsx",
    ".ps1": "text/plain",
    ".sh": "text/x-shellscript",
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

    def _read_svg_b64() -> tuple[str, str]:
        if file_path.stat().st_size > 2 * 1024 * 1024:
            return "", "SVG > 2MB (use raw=true)"
        with open(file_path, "rb") as file:
            return base64.b64encode(file.read()).decode("utf-8"), "Vetor (Escalavel)"

    b64_str, size_label = await asyncio.to_thread(_read_svg_b64)
    return web.json_response(
        {
            "type": "image",
            "data": {
                "format": "svg+xml",
                "size": size_label,
                "exif": {},
                "base64": b64_str,
            },
        }
    )


def _read_text_safe(file_path: Path) -> tuple[str, bool]:
    with open(file_path, "rb") as fb:
        sample = fb.read(8192)
        if b"\x00" in sample:
            return "", True
        rest = fb.read()
    raw = sample + rest
    try:
        return raw.decode("utf-8"), False
    except UnicodeDecodeError:
        return raw.decode("utf-8", errors="replace"), False


async def _serve_parsed_file(file_path: Path, ext: str, *, sheet_name: str | None = None) -> web.Response:
    if ext in SPREADSHEET_EXTS:
        sheet_data = await asyncio.to_thread(_parse_spreadsheet, ext, file_path, sheet_name)
        return web.json_response({"type": "spreadsheet", "data": sheet_data})
    if ext in ARCHIVE_EXTS:
        archive_files = await asyncio.to_thread(_list_zip, file_path)
        return web.json_response({"type": "archive", "files": archive_files})
    if ext in IMAGE_EXTS:
        return await _parse_image_response(ext, file_path)
    if ext in MEDIA_EXTS:
        return web.json_response({"type": "media", "message": "Streaming de media disponivel."})
    if ext in (".pdf", DOCX_EXT, ".odt", ".doc", ".ppt", ".pptx", ".odp"):
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

    text_content, is_binary = await asyncio.to_thread(_read_text_safe, file_path)
    if is_binary:
        return web.json_response(
            {
                "type": "text",
                "content": f"[Arquivo binário ({ext.lstrip('.') or 'bin'})] Conteúdo não textual detectado. Use 'Baixar' ou 'Abrir Raw' para inspeção externa.",
                "format": ext.lstrip("."),
                "lines": 0,
            }
        )

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
    sheet_param = request.rel_url.query.get("sheet", "").strip() or None

    if not path_param:
        return web.json_response({"error": "Parametro 'path' ausente."}, status=400)

    def _resolve_and_authorize() -> tuple[Path, bool, bool]:
        resolved = Path(path_param).resolve()
        allowed = _is_file_access_allowed(resolved)
        exists_file = allowed and resolved.exists() and resolved.is_file()
        return resolved, allowed, exists_file

    file_path, allowed, exists_file = await asyncio.to_thread(_resolve_and_authorize)
    if not allowed:
        return web.json_response({"error": "[SEC] Acesso negado: Caminho fora das fronteiras autorizadas."}, status=403)

    if not exists_file:
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
        return await _serve_parsed_file(file_path, ext, sheet_name=sheet_param)
    except Exception as e:
        return _internal_error(e, "handle_view_file")
