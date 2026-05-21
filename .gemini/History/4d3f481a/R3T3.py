import sqlite3
import random
import string
from datetime import datetime, timezone
from pathlib import Path

def generate_cuid():
    return 'c' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))

# Varredura heurística para encontrar o banco do Prisma
db_path = None
for p in [Path("frontend/dev.db"), Path("frontend/prisma/dev.db"), Path("prisma/dev.db"), Path("dev.db")]:
    if p.exists():
        db_path = p
        break

if not db_path:
    print("[ERRO FATAL] Banco SQLite (dev.db) não encontrado na infraestrutura.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

slug = "erro-c-bet-desmedida"
title = "Sangria no Flop: C-Bet Desmedida"
now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

markdown_body = """
# O Custo Invisível da Agressão

Quando você aposta sem equidade ou range advantage, você não está apenas perdendo fichas, está **sangrando EV**.

## O que diz o Solver (GTO)?
Em boards secos e desconectados, a C-Bet deve ter um *sizing* menor (25-33% do pote) com uma frequência alta. Apostar 75% do pote com ar puro é um erro letal.
"""

try:
    cursor.execute('''
        INSERT INTO Lesson (id, slug, title, markdown_body, type, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (generate_cuid(), slug, title, markdown_body.strip(), "Lesson", "Postflop,C-Bet,EV Loss", now_iso, now_iso))
    conn.commit()
    print(f"[SUCESSO] Aula injetada na Máquina de Conteúdo! Rota-alvo: /aulas/{slug}")
except sqlite3.IntegrityError:
    print("[AVISO] Aula de teste já existe no banco de dados. Integridade mantida.")
finally:
    conn.close()