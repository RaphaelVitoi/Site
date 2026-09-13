"""SQLite FTS5 Knowledge Base Indexer for Poker & PMev.
Indexes local files (docs/research/pmev, enciclopedia, OneDrive hydrated files) and Drive catalogs.
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

try:
    import pypdf
except ImportError:
    pypdf = None

DB_PATH = Path(r"c:\Users\rapha\.gemini\Site\docs\research\pmev\pmev_knowledge.db")


def init_db(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute("""
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
    );
    """)
    cursor.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        title,
        category,
        snippet,
        content=documents,
        content_rowid=id
    );
    """)
    conn.commit()


def index_file(
    conn: sqlite3.Connection, title: str, path_str: str, origin: str, ext: str, size: int, category: str, snippet: str
) -> None:
    cursor = conn.cursor()
    file_key = f"{origin}:{path_str}"
    cursor.execute(
        """
    INSERT INTO documents (file_key, title, path, origin, ext, size_bytes, category, snippet)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(file_key) DO UPDATE SET
        title=excluded.title,
        path=excluded.path,
        ext=excluded.ext,
        size_bytes=excluded.size_bytes,
        category=excluded.category,
        snippet=excluded.snippet;
    """,
        (file_key, title, path_str, origin, ext, size, category, snippet[:3000]),
    )

    # Rebuild FTS
    cursor.execute("INSERT OR REPLACE INTO documents_fts(documents_fts) VALUES('rebuild');")
    conn.commit()


def build_index() -> None:
    conn = sqlite3.connect(str(DB_PATH))
    init_db(conn)

    # 1. Index local docs/research/pmev
    pmev_dir = Path(r"c:\Users\rapha\.gemini\Site\docs\research\pmev")
    for f in pmev_dir.rglob("*"):
        if f.is_file() and f.suffix.lower() in [".md", ".pdf", ".txt", ".docx", ".pptx"]:
            snippet = ""
            try:
                if f.suffix.lower() in [".md", ".txt"]:
                    snippet = f.read_text(encoding="utf-8", errors="replace")[:2000]
                elif f.suffix.lower() == ".pdf" and pypdf is not None:
                    reader = pypdf.PdfReader(str(f))
                    snippet = " ".join(p.extract_text() or "" for p in reader.pages[:2])[:2000]
            except Exception:
                pass

            category = "PMev Core" if "enciclopedia" in str(f) else "Research"
            index_file(conn, f.name, str(f), "Workspace", f.suffix.lower(), f.stat().st_size, category, snippet)

    # 2. Index hydrated OneDrive files
    od_files = [
        (
            r"C:\Users\rapha\OneDrive\Aplicando Pressão em Cenários de Muito ICM.pptx",
            "Aplicando Pressão em Cenários de Muito ICM",
            "Apresentação Teórica de 36 slides sobre Pot Odds, RIO, MDF e ICM por Raphael Vitoi",
        ),
        (
            r"C:\Users\rapha\OneDrive\BOLHA BTN 40 BB 55 posflop.hrcz",
            "BOLHA BTN 40 BB 55 posflop",
            "Simulação massiva de bolha HRC 10.95 GB",
        ),
        (
            r"C:\Users\rapha\OneDrive\Documentos\TEORIA_PERSPECTIVA_MATEMATICA_VITOI.pdf",
            "TEORIA PERSPECTIVA MATEMÁTICA VITOI",
            "Manifesto de alta resolução sobre o paradigma Vitoi, Axioma do EVfold e falácia das Pot Odds",
        ),
    ]
    for p_str, title, desc in od_files:
        p = Path(p_str)
        if p.exists():
            try:
                sz = p.stat().st_size
            except Exception:
                sz = 0
            index_file(conn, title, p_str, "OneDrive", p.suffix.lower(), sz, "OneDrive Hydrated", desc)

    conn.close()
    print(f"Índice SQLite construído com sucesso em: {DB_PATH}")


def search_index(term: str) -> None:
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute(
        """
    SELECT d.title, d.category, d.origin, d.path, snippet(documents_fts, 2, '<b>', '</b>', '...', 20)
    FROM documents_fts fts
    JOIN documents d ON d.id = fts.rowid
    WHERE documents_fts MATCH ?
    ORDER BY rank
    LIMIT 10;
    """,
        (f"{term}*",),
    )

    rows = cursor.fetchall()
    print(f"\n=== BUSCA RÁPIDA FTS: '{term}' ({len(rows)} resultados) ===\n")
    for r in rows:
        print(f"- [{r[1]} | {r[2]}] {r[0]}")
        print(f"  Caminho: {r[3]}")
        print(f"  Trecho: {r[4]}\n")
    conn.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true")
    parser.add_argument("--search", type=str)
    args = parser.parse_args()

    if args.build:
        build_index()
    elif args.search:
        search_index(args.search)
    else:
        build_index()


if __name__ == "__main__":
    main()
