"""Indice SQLite FTS5 da skill, com cache endereçado por conteudo e falha explicita.

O que mudou em 2026-09-13, medido antes:
- a chave era `origem:caminho` e nao havia hash algum, embora o manifesto prometesse
  cache SHA-256. Agora cada documento guarda o SHA-256 dos bytes; conteudo igual nao
  e reextraido, conteudo diferente e.
- `except Exception: pass` escondia falha de extracao. Agora ela fica gravada na linha
  (`extraction_error`) e o build sai com codigo 3.
- caminhos absolutos fixos e o inventario de discos pessoais saíram do codigo versionado.
  Ancoras externas vem de `local/anchors.json`, ignorado pelo git.

Codigos: 0 ok | 1 indice inexistente na busca | 3 build com falha de extracao
5 banco fora das raizes de escrita | 6 uso ou configuracao invalida
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from knowledge_common import (  # noqa: E402
    LOCAL_ANCHORS,
    MAX_HASH_BYTES,
    REPO_ROOT,
    WRITE_ROOTS,
    ExitCode,
    OutsideWriteRootsError,
    default_db_path,
    resolve_write_path,
)
from universal_reader import (  # noqa: E402
    SUPPORTED_EXTENSIONS,
    ExtractionError,
    MissingDependencyError,
    UnsupportedFormatError,
    extract_text,
)

WORKSPACE_DIR = REPO_ROOT / "docs" / "research" / "pmev"
SNIPPET_CHARS = 2000
_COLUNAS_NOVAS = {"content_sha256": "TEXT", "extraction_error": "TEXT", "present_on_disk": "INTEGER"}


@dataclass
class BuildSummary:
    indexed: int = 0
    cache_hits: int = 0
    anchors: int = 0
    anchors_absent: int = 0
    errors: list[tuple[str, str]] = field(default_factory=list)


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_key TEXT UNIQUE,
            title TEXT,
            path TEXT,
            origin TEXT,
            ext TEXT,
            size_bytes INTEGER,
            category TEXT,
            snippet TEXT
        )
        """
    )
    existentes = {linha[1] for linha in conn.execute("PRAGMA table_info(documents)")}
    for coluna, tipo in _COLUNAS_NOVAS.items():
        if coluna not in existentes:
            conn.execute(f"ALTER TABLE documents ADD COLUMN {coluna} {tipo}")  # nomes fixos, sem entrada externa
    conn.execute(
        """
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
            title, category, snippet, content=documents, content_rowid=id
        )
        """
    )
    conn.commit()


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for bloco in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(bloco)
    return digest.hexdigest()


def _upsert(conn: sqlite3.Connection, **linha: object) -> None:
    conn.execute(
        """
        INSERT INTO documents (file_key, title, path, origin, ext, size_bytes, category, snippet,
                               content_sha256, extraction_error, present_on_disk)
        VALUES (:file_key, :title, :path, :origin, :ext, :size_bytes, :category, :snippet,
                :content_sha256, :extraction_error, :present_on_disk)
        ON CONFLICT(file_key) DO UPDATE SET
            title=excluded.title, path=excluded.path, ext=excluded.ext, size_bytes=excluded.size_bytes,
            category=excluded.category, snippet=excluded.snippet, content_sha256=excluded.content_sha256,
            extraction_error=excluded.extraction_error, present_on_disk=excluded.present_on_disk
        """,
        linha,
    )


def _index_workspace(conn: sqlite3.Connection, workspace: Path, db_path: Path, resumo: BuildSummary) -> None:
    for arquivo in sorted(workspace.rglob("*")):
        if not arquivo.is_file() or arquivo.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        if arquivo.resolve() == db_path.resolve():
            continue
        relativo = arquivo.relative_to(workspace).as_posix()
        chave = f"Workspace:{relativo}"
        digest = sha256_of(arquivo)
        anterior = conn.execute(
            "SELECT content_sha256, extraction_error FROM documents WHERE file_key = ?", (chave,)
        ).fetchone()
        if anterior is not None and anterior[0] == digest and not anterior[1]:
            resumo.cache_hits += 1
            continue
        erro, trecho = None, ""
        try:
            trecho = extract_text(arquivo, SNIPPET_CHARS)
        except (ExtractionError, MissingDependencyError, UnsupportedFormatError) as exc:
            erro = f"{type(exc).__name__}: {exc}"
            resumo.errors.append((relativo, erro))
        _upsert(
            conn,
            file_key=chave,
            title=arquivo.name,
            path=relativo,
            origin="Workspace",
            ext=arquivo.suffix.lower(),
            size_bytes=arquivo.stat().st_size,
            category="PMev Core" if "enciclopedia" in relativo else "Research",
            snippet=trecho,
            content_sha256=digest,
            extraction_error=erro,
            present_on_disk=1,
        )
        resumo.indexed += 1


def _load_anchors(anchors_path: Path) -> list[dict]:
    if not anchors_path.is_file():
        return []
    dados = json.loads(anchors_path.read_text(encoding="utf-8"))
    if not isinstance(dados, list):
        raise ValueError(f"{anchors_path} deve conter uma lista de ancoras.")
    for i, item in enumerate(dados):
        faltando = [c for c in ("path", "title", "description", "origin", "category") if not item.get(c)]
        if faltando:
            raise ValueError(f"ancora {i} sem {faltando}.")
    return dados


def _index_anchors(conn: sqlite3.Connection, anchors_path: Path, resumo: BuildSummary) -> None:
    for item in _load_anchors(anchors_path):
        caminho = Path(item["path"])
        presente = caminho.exists()
        digest = None
        if presente and caminho.is_file() and caminho.stat().st_size <= MAX_HASH_BYTES:
            digest = sha256_of(caminho)
        _upsert(
            conn,
            file_key=f"{item['origin']}:{item['path']}",
            title=item["title"],
            path=item["path"],
            origin=item["origin"],
            ext=item.get("ext") or caminho.suffix.lower() or "[folder]",
            size_bytes=caminho.stat().st_size if presente and caminho.is_file() else item.get("size_bytes", 0),
            category=item["category"],
            snippet=item["description"],  # descricao declarada, nao texto extraido
            content_sha256=digest,
            extraction_error=None,
            present_on_disk=1 if presente else 0,
        )
        resumo.anchors += 1
        resumo.anchors_absent += 0 if presente else 1


def build_index(
    db_path: Path,
    workspace: Path = WORKSPACE_DIR,
    anchors_path: Path = LOCAL_ANCHORS,
    roots: tuple[Path, ...] = WRITE_ROOTS,
) -> BuildSummary:
    db_path = resolve_write_path(db_path, roots)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    resumo = BuildSummary()
    conn = sqlite3.connect(str(db_path))
    try:
        init_db(conn)
        _index_workspace(conn, workspace, db_path, resumo)
        _index_anchors(conn, anchors_path, resumo)
        conn.execute("INSERT INTO documents_fts(documents_fts) VALUES('rebuild')")
        conn.commit()
    finally:
        conn.close()
    return resumo


def search_index(db_path: Path, term: str) -> list[tuple]:
    if not db_path.is_file():
        raise FileNotFoundError(str(db_path))
    conn = sqlite3.connect(str(db_path))
    try:
        return conn.execute(
            """
            SELECT d.title, d.category, d.origin, d.path, snippet(documents_fts, 2, '<b>', '</b>', '...', 20)
            FROM documents_fts JOIN documents d ON d.id = documents_fts.rowid
            WHERE documents_fts MATCH ? ORDER BY rank LIMIT 10
            """,
            (f'"{term.replace(chr(34), "")}"*',),
        ).fetchall()
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Indice da skill poker-pmev-knowledge-engine.")
    acao = parser.add_mutually_exclusive_group(required=True)
    acao.add_argument("--build", action="store_true")
    acao.add_argument("--search", type=str)
    parser.add_argument("--db", type=Path, default=None)
    args = parser.parse_args(argv)
    db_path = args.db or default_db_path()

    if args.search is not None:
        try:
            linhas = search_index(db_path, args.search)
        except FileNotFoundError:
            print(f"ERRO {ExitCode.NOT_FOUND}: indice inexistente em {db_path}; rode --build", file=sys.stderr)
            return ExitCode.NOT_FOUND
        print(f"{len(linhas)} resultado(s) para '{args.search}'")
        for titulo, categoria, origem, caminho, trecho in linhas:
            print(f"- [{categoria} | {origem}] {titulo}\n  {caminho}\n  {trecho}")
        return ExitCode.OK

    try:
        resumo = build_index(db_path)
    except OutsideWriteRootsError as exc:
        print(f"ERRO {ExitCode.OUTSIDE_WRITE_ROOTS}: {exc}", file=sys.stderr)
        return ExitCode.OUTSIDE_WRITE_ROOTS
    except ValueError as exc:
        print(f"ERRO {ExitCode.USAGE}: {exc}", file=sys.stderr)
        return ExitCode.USAGE
    print(
        f"indexados={resumo.indexed} cache={resumo.cache_hits} ancoras={resumo.anchors} "
        f"ancoras_ausentes={resumo.anchors_absent} erros={len(resumo.errors)}"
    )
    for caminho, erro in resumo.errors:
        print(f"ERRO {ExitCode.EXTRACTION_ERROR}: {caminho}: {erro}", file=sys.stderr)
    return ExitCode.EXTRACTION_ERROR if resumo.errors else ExitCode.OK


if __name__ == "__main__":
    sys.exit(main())
