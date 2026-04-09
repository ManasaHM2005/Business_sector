import sqlite3
import os

db_path = os.path.join("backend", "campus.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- Placement Drives ---")
drives = cursor.execute("SELECT * FROM placement_drives").fetchall()
for d in drives:
    print(dict(d))

print("\n--- Student Info (ID=1) ---")
student = cursor.execute("SELECT * FROM student_info WHERE id=1").fetchone()
if student:
    print(dict(student))

conn.close()
