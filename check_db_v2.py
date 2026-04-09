import sqlite3
import os

db_path = os.path.join("backend", "campus.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- ALL USERS ---")
users = cursor.execute("SELECT * FROM users").fetchall()
for u in users:
    print(dict(u))

print("\n--- ALL PLACEMENT DRIVES ---")
drives = cursor.execute("SELECT * FROM placement_drives").fetchall()
for d in drives:
    print(dict(d))

print("\n--- ALL STUDENT INFO ---")
students = cursor.execute("SELECT * FROM student_info").fetchall()
for s in students:
    print(dict(s))

conn.close()
