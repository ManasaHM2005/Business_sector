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
            year TEXT,
            major TEXT,
            attendance REAL,
            cgpa REAL,
            skills TEXT DEFAULT '',
            email TEXT DEFAULT ''
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute("SELECT COUNT(*) FROM student_info")
    if c.fetchone()[0] == 0:
        c.execute("""
            INSERT INTO student_info (id, name, year, major, attendance, cgpa, skills, email)
            VALUES (1, 'Alice Johnson', '3rd Year', 'Computer Science', 78.5, 8.4,
                    'Python, JavaScript, SQL, Machine Learning', 'alice@college.edu')
        """)

        tasks = [
            (1, 'AI Project Report', 'AI & ML', 'Tomorrow', 'Pending', 'high'),
            (1, 'Database Lab Submission', 'DBMS', 'Today', 'Pending', 'high'),
            (1, 'OS Assignment 3', 'Operating Systems', 'Next Monday', 'Pending', 'medium'),
            (1, 'Web Dev Portfolio', 'Elective', 'Next Friday', 'Pending', 'low'),
            (1, 'CN Lab Viva Prep', 'Computer Networks', 'Last Week', 'Completed', 'medium'),
            (1, 'Math Assignment 5', 'Mathematics', 'Last Monday', 'Completed', 'low'),
        ]
        c.executemany(
            "INSERT INTO tasks (student_id, task_name, subject, due_date, status, priority) VALUES (?,?,?,?,?,?)",
            tasks
        )

        schedule = [
            (1, 'Monday', 'AI & ML', '9:00 AM', 'Room 301'),
            (1, 'Monday', 'DBMS Lab', '11:00 AM', 'Lab 2'),
            (1, 'Monday', 'Operating Systems', '2:00 PM', 'Room 205'),
            (1, 'Tuesday', 'Computer Networks', '9:00 AM', 'Room 102'),
            (1, 'Tuesday', 'AI & ML Lab', '11:00 AM', 'Lab 1'),
            (1, 'Tuesday', 'Mathematics', '3:00 PM', 'Room 401'),
            (1, 'Wednesday', 'Operating Systems', '9:00 AM', 'Room 205'),
            (1, 'Wednesday', 'Web Development', '11:00 AM', 'Lab 3'),
            (1, 'Wednesday', 'DBMS', '2:00 PM', 'Room 301'),
            (1, 'Thursday', 'AI & ML', '9:00 AM', 'Room 301'),
            (1, 'Thursday', 'Computer Networks Lab', '11:00 AM', 'Lab 2'),
            (1, 'Thursday', 'Mathematics', '2:00 PM', 'Room 401'),
            (1, 'Friday', 'Soft Skills', '9:00 AM', 'Room 101'),
            (1, 'Friday', 'Project Work', '11:00 AM', 'Lab 1'),
        ]
        c.executemany(
            "INSERT INTO class_schedule (student_id, day, subject, time, room) VALUES (?,?,?,?,?)",
            schedule
        )

        activities = [
            ('Canteen', 'Peak crowd at 1:10 PM — biryani day'),
            ('Placement', 'Google mock interview scheduled for Friday'),
            ('Academic', 'Alice submitted CN Lab Viva — scored 9/10'),
            ('Canteen', 'Low crowd after 3 PM — chai & samosa available'),
            ('Placement', 'TCS registration deadline is April 20'),
        ]
        c.executemany("INSERT INTO activity (type, description) VALUES (?,?)", activities)

        c.execute("""
            INSERT INTO users (email, password, role, name, usn, branch, student_id)
            VALUES ('student@college.edu', 'password123', 'student', 'Alice Johnson', '1RV22CS001', 'Computer Science', 1)
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
