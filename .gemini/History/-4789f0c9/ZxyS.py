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
    base_dir = Path(__file__).parent.parent.parent.parent.parent
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

def upsert_lesson(cursor: sqlite3.Cursor, slug: str, title: str, markdown_body: str, now_iso: str) -> None:
    """
    Atualiza ou insere a entidade 'Lesson' no banco de dados.
    """
    cursor.execute("SELECT id FROM Lesson WHERE slug = ?", (slug,))
    row = cursor.fetchone()

    if row:
        cursor.execute('''
            UPDATE Lesson SET markdown_body = ?, title = ?, updatedAt = ? WHERE slug = ?
        ''', (markdown_body, title, now_iso, slug))
        print(f"[SUCESSO] Aula SOTA atualizada! Rota-alvo: /aulas/{slug}")
    else:
        cursor.execute('''
            INSERT INTO Lesson (id, slug, title, markdown_body, type, tags, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (generate_cuid(), slug, title, markdown_body, "Lesson", "ICM,Pós-Flop,Risk Premium", now_iso, now_iso))
        print(f"[SUCESSO] Aula SOTA injetada na Máquina de Conteúdo! Rota-alvo: /aulas/{slug}")

def upsert_content(cursor: sqlite3.Cursor, slug: str, title: str, markdown_body: str, now_iso: str) -> None:
    """
    Sincroniza a entidade no Motor Universal 'Content' para aparecer na biblioteca.
    """
    description = "Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games."
    cursor.execute("SELECT id FROM Content WHERE slug = ?", (slug,))
    content_row = cursor.fetchone()

    if content_row:
        cursor.execute('''
            UPDATE Content SET body = ?, title = ?, description = ?, updatedAt = ?, category = 'biblioteca', isPublished = 1 WHERE slug = ?
        ''', (markdown_body, title, description, now_iso, slug))
        print("[SUCESSO] Aula sincronizada no Motor Universal (Biblioteca)!")
    else:
        cursor.execute('''
            INSERT INTO Content (id, slug, category, title, description, body, isPublished, authorId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), slug, 'biblioteca', title, description, markdown_body, 1, 'Raphael Vitoi', now_iso, now_iso))
        print("[SUCESSO] Aula SOTA injetada na Biblioteca!")

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
        upsert_lesson(cursor, slug, title, markdown_body, now_iso)
        upsert_content(cursor, slug, title, markdown_body, now_iso)
        conn.commit()
    except Exception as e:
        print(f"[ERRO] Falha na manipulacao do banco de dados: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
