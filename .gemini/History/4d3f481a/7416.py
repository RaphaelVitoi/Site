import sqlite3
import random
import string
from datetime import datetime, timezone
from pathlib import Path

def generate_cuid():
    return 'c' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))

# Varredura heurística para encontrar o banco do Prisma
db_path = None
for p in [Path("frontend/prisma/dev.db"), Path("prisma/dev.db"), Path("frontend/dev.db"), Path("dev.db")]: # Prioriza o banco do frontend
    if p.exists():
        db_path = p
        break

if not db_path:
    print("[ERRO FATAL] Banco SQLite (dev.db) não encontrado na infraestrutura.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

slug = "entendendo-o-icm-e-suas-heuristicas"
title = "Entendendo o ICM e suas heurísticas"
now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

try:
    # O caminho correto para o .md na raiz do projeto
    project_root = Path(__file__).parent
    md_path = project_root / f"{slug}.md"
    with open(md_path, "r", encoding="utf-8") as f:
        markdown_body = f.read()
except FileNotFoundError:
    print(f"[ERRO] O arquivo {slug}.md não foi encontrado na raiz do projeto ({md_path}). Execute o script de conversão primeiro.")
    exit(1)

try:
    # Verifica se a aula com este slug ja existe
    cursor.execute("SELECT id FROM Lesson WHERE slug = ?", (slug,))
    row = cursor.fetchone()
    
    if row:
        cursor.execute('''
            UPDATE Lesson SET markdown_body = ?, title = ?, updatedAt = ? WHERE slug = ?
        ''', (markdown_body.strip(), title, now_iso, slug))
        print(f"[SUCESSO] Aula SOTA atualizada! Rota-alvo: /aulas/{slug}")
    else:
        cursor.execute('''
            INSERT INTO Lesson (id, slug, title, markdown_body, type, tags, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (generate_cuid(), slug, title, markdown_body.strip(), "Lesson", "ICM,Pós-Flop,Risk Premium", now_iso, now_iso))
        print(f"[SUCESSO] Aula SOTA injetada na Máquina de Conteúdo! Rota-alvo: /aulas/{slug}")
        
    # Injeta também no Motor Universal SOTA (Tabela Content) para aparecer na /biblioteca
    import uuid
    cursor.execute("SELECT id FROM Content WHERE slug = ?", (slug,))
    content_row = cursor.fetchone()
    
    description = "Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games."
    
    if content_row:
        cursor.execute('''
            UPDATE Content SET body = ?, title = ?, description = ?, updatedAt = ?, category = 'biblioteca', isPublished = 1 WHERE slug = ?
        ''', (markdown_body.strip(), title, description, now_iso, slug))
        print(f"[SUCESSO] Aula sincronizada no Motor Universal (Biblioteca)!")
    else:
        cursor.execute('''
            INSERT INTO Content (id, slug, category, title, description, body, isPublished, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), slug, 'biblioteca', title, description, markdown_body.strip(), 1, now_iso, now_iso))
        print(f"[SUCESSO] Aula SOTA injetada na Biblioteca!")
        
    conn.commit()
except Exception as e:
    print(f"[ERRO] Falha na manipulacao do banco de dados: {e}")
finally:
    conn.close()
