# pylint: disable=missing-module-docstring

import sqlite3

conn = sqlite3.connect("queue/tasks.db")
cursor = conn.cursor()
cursor.execute("SELECT id, agent, status FROM tasks WHERE agent = '@gemma4'")
rows = cursor.fetchall()
for row in rows:
    print(row)
conn.close()
