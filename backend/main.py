"""
🧠 AI Campus Brain — FastAPI Backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, os, datetime

from database import init_db, get_db_connection
from agents import student_agent, faculty_agent, canteen_agent, placement_agent
from agents.coordinator_agent import run as coordinator_run
from agents.mcp_context import log_agent_action, write_context

init_db()

app = FastAPI(title="AI Campus Brain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"project": "AI Campus Brain", "status": "running"}

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str
    name: str
    usn: str
    branch: str

@app.post("/api/auth/login")
def login(creds: LoginRequest):
    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (creds.email, creds.password)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "status": "success",
        "user_id": user["id"],
        "student_id": user["student_id"],
        "role": user["role"],
        "name": user["name"],
    }

@app.post("/api/auth/signup")
def signup(data: SignupRequest):
    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE email=?", (data.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        student_id = None
        if data.role == "student":
            conn.execute(
                "INSERT INTO student_info (name, year, major, attendance, cgpa, skills, email) VALUES (?,?,?,?,?,?,?)",
                (data.name, "1st Year", data.branch, 85.0, 7.5, "", data.email)
            )
            student_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            
            # Add some demo tasks for the new student so dashboard isn't empty
            tasks = [
                (student_id, 'Complete Profile Setup', 'General', 'Tomorrow', 'Pending', 'high'),
                (student_id, 'Check Faculty Schedule', 'General', 'Today', 'Pending', 'medium'),
            ]
            conn.executemany(
                "INSERT INTO tasks (student_id, task_name, subject, due_date, status, priority) VALUES (?,?,?,?,?,?)",
                tasks
            )

        conn.execute(
            "INSERT INTO users (email, password, role, name, usn, branch, student_id) VALUES (?,?,?,?,?,?,?)",
            (data.email, data.password, data.role, data.name, data.usn, data.branch, student_id)
        )
        conn.commit()
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

        return {
            "status": "success",
            "user_id": user_id,
            "student_id": student_id,
            "role": data.role,
            "name": data.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/auth/google")
def google_auth(data: dict):
    email = data.get("email", "google_user@gmail.com")
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not user:
        conn.execute(
            "INSERT INTO student_info (name, year, major, attendance, cgpa, skills, email) VALUES (?,?,?,?,?,?,?)",
            ("Google User", "1st Year", "Computer Science", 85.0, 7.5, "", email)
        )
        student_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        
        conn.execute(
            "INSERT INTO users (email, password, role, name, usn, branch, student_id) VALUES (?,?,?,?,?,?,?)",
            (email, "google_oauth", "student", "Google User", "GGL001", "Computer Science", student_id)
        )
        conn.commit()
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    else:
        user_id = user["id"]
        student_id = user["student_id"]
    conn.close()
    return {"status": "success", "user_id": user_id, "student_id": student_id, "role": "student", "name": "Google User"}

@app.get("/api/user/{user_id}")
def get_user_profile(user_id: int):
    conn = get_db_connection()
    user = conn.execute("SELECT id, email, role, name, usn, branch, student_id, created_at FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)

# ═══════════════════════════════════════════
#  Agent Endpoints
# ═══════════════════════════════════════════

@app.get("/api/student")
def api_student(student_id: int = 1): return student_agent.run(student_id)
@app.get("/api/faculty")
def api_faculty(): return faculty_agent.run()
@app.get("/api/canteen")
def api_canteen(): return canteen_agent.run()
@app.get("/api/placement")
def api_placement(student_id: int = 1): return placement_agent.run(student_id)
@app.get("/api/alerts")
def api_alerts():
    data = student_agent.run(student_id=1)
    return {"alerts": data.get("alerts", [])}
@app.get("/api/coordinator")
def api_coordinator(student_id: int = 1): return coordinator_run(student_id)

@app.get("/api/context")
def get_context():
    ctx_file = os.path.join(os.path.dirname(__file__), "context.json")
    if os.path.exists(ctx_file):
        with open(ctx_file) as f:
            return json.load(f)
    return {}

# ═══════════════════════════════════════════
#  Faculty Dashboard Capabilities
# ═══════════════════════════════════════════

class TaskRequest(BaseModel):
    student_id: int
    task_name: str
    subject: str
    due_date: str
    priority: str

class ScheduleRequest(BaseModel):
    student_id: int
    day: str
    subject: str
    time: str
    room: str

class AttendanceRequest(BaseModel):
    student_id: int
    attendance: float
    
class CgpaRequest(BaseModel):
    student_id: int
    cgpa: float

class CanteenRequest(BaseModel):
    crowd_percent: int


@app.post("/api/faculty/tasks")
def faculty_add_task(req: TaskRequest):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO tasks (student_id, task_name, subject, due_date, status, priority) VALUES (?,?,?,?,'Pending',?)",
        (req.student_id, req.task_name, req.subject, req.due_date, req.priority)
    )
    conn.commit()
    conn.close()
    
    # Notify MCP Context of the direct Faculty Override
    log_agent_action("FacultyAgent", "override_assigned_task", f"Assigned '{req.task_name}' to student_id {req.student_id}", severity="warning")
    return {"status": "success", "message": "Task added and MCP context updated!"}

@app.post("/api/faculty/schedule")
def faculty_add_schedule(req: ScheduleRequest):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO class_schedule (student_id, day, subject, time, room) VALUES (?,?,?,?,?)",
        (req.student_id, req.day, req.subject, req.time, req.room)
    )
    conn.commit()
    conn.close()
    
    # Notify MCP Context of the direct Faculty Override
    log_agent_action("FacultyAgent", "override_class_schedule", f"Scheduled '{req.subject}' on {req.day} at {req.time}", severity="info")
    return {"status": "success", "message": "Schedule updated and MCP context updated!"}

@app.post("/api/faculty/attendance")
def faculty_update_attendance(req: AttendanceRequest):
    conn = get_db_connection()
    conn.execute("UPDATE student_info SET attendance=? WHERE id=?", (req.attendance, req.student_id))
    conn.commit()
    conn.close()
    
    log_agent_action("FacultyAgent", "override_attendance", f"Updated student {req.student_id} attendance to {req.attendance}%", severity="warning")
    return {"status": "success"}

@app.post("/api/faculty/cgpa")
def faculty_update_cgpa(req: CgpaRequest):
    conn = get_db_connection()
    conn.execute("UPDATE student_info SET cgpa=? WHERE id=?", (req.cgpa, req.student_id))
    conn.commit()
    conn.close()
    
    log_agent_action("FacultyAgent", "override_cgpa", f"Updated student {req.student_id} CGPA to {req.cgpa}", severity="info")
    return {"status": "success"}

@app.post("/api/faculty/canteen")
def faculty_update_canteen(req: CanteenRequest):
    # This edits the MCP Context directly rather than a DB
    ctx = get_context()
    ctx["canteen_override"] = req.crowd_percent
    write_context(ctx)
    
    log_agent_action("FacultyAgent", "override_canteen", f"Forced canteen crowd prediction to {req.crowd_percent}%", severity="danger")
    return {"status": "success"}