import sqlite3
import os

db_path = os.path.join("backend", "campus.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

student_id = 1 # Assuming student 1 for test
student = cursor.execute("SELECT * FROM student_info WHERE id=?", (student_id,)).fetchone()
drives = cursor.execute("SELECT * FROM placement_drives").fetchall()

if not student:
    print(f"Student {student_id} not found!")
else:
    s = dict(student)
    print(f"Student: {s['name']} (CGPA: {s['cgpa']}, Skills: '{s['skills']}')")
    
    s_skills = [sk.strip().lower() for sk in (s['skills'] or "").split(",") if sk.strip()]
    print(f"Parsed Student Skills: {s_skills}")

    print("\n--- Drives Analysis ---")
    for d in drives:
        dr = dict(d)
        d_skills = [sk.strip().lower() for sk in (dr['skills_required'] or "").split(",") if sk.strip()]
        
        match_skill = not d_skills or any(skill in s_skills for skill in d_skills)
        match_cgpa = s['cgpa'] >= dr['min_cgpa']
        
        print(f"Drive: {dr['company']} | {dr['role']}")
        print(f"  - Skills Required: {d_skills}")
        print(f"  - Min CGPA: {dr['min_cgpa']}")
        print(f"  - Match Skill: {match_skill}")
        print(f"  - Match CGPA: {match_cgpa}")
        print(f"  - ELIGIBLE: {match_skill and match_cgpa}")

conn.close()
