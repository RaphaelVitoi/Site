# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long

import secrets
import sqlite3
import string
import sys
import uuid
from datetime import UTC, datetime
from pathlib import Path


def generate_cuid() -> str:
    """
    Gera um identificador unico CUID para a base de dados.
    """
    alphabet = string.ascii_lowercase + string.digits
    return "c" + "".join(secrets.choice(alphabet) for _ in range(24))


def find_database_path() -> Path | None:
    """
    Varredura heuristica para encontrar o banco do Prisma na infraestrutura.
    """
    search_paths = [
        Path("frontend/prisma/dev.db"),
        Path("prisma/dev.db"),
        Path("frontend/dev.db"),
        Path("dev.db"),
    ]
    for p in search_paths:
        if p.exists():
            return p
    return None


def load_markdown_body(file_path: Path) -> str:
    """
    Le o conteudo do arquivo bruto apontado fisicamente, eliminando fragilidade de saltos relativos.
    """
    if not file_path.exists():
        print(f"[ERRO] O arquivo {file_path.resolve()} nao foi encontrado na infraestrutura.")
        sys.exit(1)

    with open(file_path, encoding="utf-8") as f:
        return f.read().strip()


def upsert_lesson(cursor: sqlite3.Cursor, slug: str, title: str, markdown_body: str, now_iso: str) -> None:
    """
    Atualiza ou insere a entidade 'Lesson' no banco de dados.
    """
    cursor.execute("SELECT id FROM Lesson WHERE slug = ?", (slug,))
    row = cursor.fetchone()

    if row:
        cursor.execute(
            """
            UPDATE Lesson SET markdown_body = ?, title = ?, updatedAt = ? WHERE slug = ?
        """,
            (markdown_body, title, now_iso, slug),
        )
        print(f"[SUCESSO] Aula SOTA atualizada! Rota-alvo: /aulas/{slug}")
    else:
        cursor.execute(
            """
            INSERT INTO Lesson (id, slug, title, markdown_body, type, tags, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                generate_cuid(),
                slug,
                title,
                markdown_body,
                "Lesson",
                "ICM,Pos-Flop,Risk Premium",
                now_iso,
                now_iso,
            ),
        )
        print(f"[SUCESSO] Aula SOTA injetada na Maquina de Conteudo! Rota-alvo: /aulas/{slug}")


def upsert_content(cursor: sqlite3.Cursor, slug: str, title: str, markdown_body: str, now_iso: str) -> None:
    """
    Sincroniza a entidade no Motor Universal 'Content' para aparecer na biblioteca.
    """
    description = "Compreenda o ICM e suas heuristicas atraves da analise de RPs e Toy Games."
    cursor.execute("SELECT id FROM Content WHERE slug = ?", (slug,))
    content_row = cursor.fetchone()

    if content_row:
        cursor.execute(
            """
            UPDATE Content SET body = ?, title = ?, description = ?, updatedAt = ?, category = 'biblioteca', isPublished = 1 WHERE slug = ?
        """,
            (markdown_body, title, description, now_iso, slug),
        )
        print("[SUCESSO] Aula sincronizada no Motor Universal (Biblioteca)!")
    else:
        cursor.execute(
            """
            INSERT INTO Content (id, slug, category, title, description, body, isPublished, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                str(uuid.uuid4()),
                slug,
                "biblioteca",
                title,
                description,
                markdown_body,
                1,
                now_iso,
                now_iso,
            ),
        )
        print("[SUCESSO] Aula SOTA injetada na Biblioteca!")


def main() -> None:
    """
    Orquestrador principal SOTA: Conecta no DB e injeta a aula.
    """
    if len(sys.argv) < 4:
        print("Uso: python seed_lesson.py <slug> <titulo_entre_aspas> <caminho_do_arquivo_de_texto>")
        print(
            'Exemplo: python seed_lesson.py amortizacao-da-edge "A Amortizacao da Edge" "../../../research/icm-materials/icmteoriaadicionalpt1.txt"'
        )
        sys.exit(1)

    db_path = find_database_path()
    if not db_path:
        print("[ERRO FATAL] Banco SQLite (dev.db) nao encontrado na infraestrutura.")
        sys.exit(1)

    slug = sys.argv[1]
    title = sys.argv[2]
    txt_path = Path(sys.argv[3]).resolve()
    now_iso = datetime.now(UTC).isoformat().replace("+00:00", "Z")

    markdown_body = load_markdown_body(txt_path)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        upsert_lesson(cursor, slug, title, markdown_body, now_iso)
        upsert_content(cursor, slug, title, markdown_body, now_iso)
        conn.commit()
    except sqlite3.Error as e:
        print(f"[ERRO] Falha na manipulacao do banco de dados: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
