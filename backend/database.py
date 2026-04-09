"""
📦 Database Module — SQLite Setup & Seed Data
===============================================
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "campus.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS student_info (
            id INTEGER PRIMARY KEY,
            name TEXT,
            usn TEXT,
            year TEXT,
            major TEXT,
            attendance REAL,
            cgpa REAL,
            skills TEXT DEFAULT '',
            email TEXT DEFAULT '',
            profile_pic TEXT DEFAULT ''
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS subject_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            subject TEXT,
            attendance_pct REAL
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS canteen_menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT,
            price TEXT,
            tag TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS placement_drives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT,
            role TEXT,
            date TEXT,
            min_cgpa REAL,
            package TEXT,
            skills_required TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            task_name TEXT,
            subject TEXT DEFAULT '',
            due_date TEXT,
            status TEXT DEFAULT 'Pending',
            priority TEXT DEFAULT 'medium'
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS class_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            day TEXT,
            subject TEXT,
            time TEXT,
            room TEXT DEFAULT ''
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'student',
            name TEXT DEFAULT '',
            usn TEXT DEFAULT '',
            branch TEXT DEFAULT '',
            student_id INTEGER,
            profile_pic TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute("SELECT COUNT(*) FROM student_info")
    if c.fetchone()[0] == 0:
        # We keep only ONE base student for demonstration, 
        # but we remove the default massive schedules/tasks to favor dynamic management.
        c.execute("""
            INSERT INTO student_info (id, name, usn, year, major, attendance, cgpa, skills, email, profile_pic)
            VALUES (1, 'Keerthi', '1RV22CS001', '3rd Year', 'Computer Science', 85.0, 7.5,
                    'Python, JavaScript, HTML, CSS, MySQL', 'student@college.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Keerthi')
        """)

        c.execute("""
            INSERT INTO users (email, password, role, name, usn, branch, student_id, profile_pic)
            VALUES ('student@college.edu', 'password123', 'student', 'Keerthi', '1RV22CS001', 'Computer Science', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Keerthi')
        """)

        c.execute("""
            INSERT INTO users (email, password, role, name)
            VALUES ('faculty@college.edu', 'password123', 'faculty', 'Dr. Smith')
        """)

        c.execute("""
            INSERT INTO users (email, password, role, name)
            VALUES ('canteen@college.edu', 'password123', 'canteen', 'Canteen Master')
        """)

        c.execute("""
            INSERT INTO users (email, password, role, name)
            VALUES ('placement@college.edu', 'password123', 'placement', 'Placement Officer')
        """)

        conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

if __name__ == "__main__":
    init_db()
    print("✅ Database initialized successfully!")
