import sqlite3
import random
import string
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

def generate_cuid() -> str:
    """
    Gera um identificador único CUID para a base de dados.
    """
    return 'c' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))

def find_database_path() -> Optional[Path]:
    """
    Varredura heurística para encontrar o banco do Prisma na infraestrutura.
    """
    search_paths = [
        Path("frontend/prisma/dev.db"),
        Path("prisma/dev.db"),
        Path("frontend/dev.db"),
        Path("dev.db")
    ]
    for p in search_paths:
        if p.exists():
            return p
    return None

def load_markdown_body(slug: str) -> str:
    """
    Lê o conteúdo do arquivo markdown correspondente ao slug na raiz do projeto.
    """
    base_dir = Path(__file__).parent.parent.parent.parent.parent.parent
    search_paths = [
        base_dir / "frontend" / "src" / "app" / "artigos" / "entendendo-o-icm.md",
        base_dir / "frontend" / "src" / "app" / "artigos" / "entendendo-o-icm" / f"{slug}.md",
        base_dir / "frontend" / "src" / "app" / "artigos" / "entendendo-o-icm" / "page.md",
        base_dir / "content" / "artigos" / f"{slug}.md",
        base_dir / "docs" / "epics" / f"{slug}.md",
        Path(__file__).parent.parent.parent.parent / f"{slug}.md"
    ]

    for p in search_paths:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return f.read().strip()

    print(f"[ERRO] O arquivo {slug}.md não foi encontrado nos diretorios mapeados.")
    sys.exit(1)

def upsert_article(cursor: sqlite3.Cursor, slug: str, title: str, markdown_body: str, now_iso: str) -> None:
    """
    Atualiza ou insere a entidade 'Article' no banco de dados SOTA.
    """
    cursor.execute("SELECT id FROM Article WHERE slug = ?", (slug,))
    row = cursor.fetchone()

    # Calculo heuristico de tempo de leitura SOTA (aprox 200 palavras por minuto)
    word_count = len(markdown_body.split())
    read_time = f"{max(1, word_count // 200)} min de leitura"

    if row:
        cursor.execute('''
            UPDATE Article SET content = ?, title = ?, updatedAt = ? WHERE slug = ?
        ''', (markdown_body, title, now_iso, slug))
        print(f"[SUCESSO] Artigo SOTA atualizado! Rota-alvo: /biblioteca/{slug}")
    else:
        cursor.execute('''
            INSERT INTO Article (id, slug, title, content, readTime, publishedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (generate_cuid(), slug, title, markdown_body, read_time, now_iso, now_iso, now_iso))
        print(f"[SUCESSO] Artigo SOTA injetado na Biblioteca! Rota-alvo: /biblioteca/{slug}")

def main() -> None:
    """
    Orquestrador principal SOTA: Conecta no DB e injeta a aula.
    """
    db_path = find_database_path()
    if not db_path:
        print("[ERRO FATAL] Banco SQLite (dev.db) não encontrado na infraestrutura.")
        sys.exit(1)

    slug = "entendendo-o-icm-e-suas-heuristicas"
    title = "Entendendo o ICM e suas heurísticas"
    now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    markdown_body = load_markdown_body(slug)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        upsert_article(cursor, slug, title, markdown_body, now_iso)
        conn.commit()
    except Exception as e:
        print(f"[ERRO] Falha na manipulacao do banco de dados: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
