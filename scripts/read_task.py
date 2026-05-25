"""Script auxiliar para leitura rapida de tarefas especificas no banco de dados SQLite."""

import sqlite3

conn = sqlite3.connect("queue/tasks.db")
cursor = conn.cursor()
cursor.execute("SELECT description FROM tasks WHERE id = 'TASK-20260511-211049-6144'")
row = cursor.fetchone()
if row:
    print(row[0])
conn.close()
