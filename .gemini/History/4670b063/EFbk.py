# pylint: disable=missing-module-docstring

import sqlite3
conn = sqlite3.connect('queue/tasks.db')
cursor = conn.cursor()
cursor.execute("SELECT id, agent, description FROM tasks ORDER BY timestamp DESC LIMIT 3")
rows = cursor.fetchall()
for row in rows:
    print(f"ID: {row[0]} | AGENT: {row[1]} | DESC: {row[2][:50]}...")
conn.close()
