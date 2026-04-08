"""
👨‍🏫 Faculty Agent
===================
Responsibilities:
- Provide class schedule and faculty announcements
- Auto-generate attendance insights for faculty
- Detect students at risk based on shared context
"""

from datetime import datetime
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import get_db_connection
from agents.mcp_context import read_context, write_context, log_agent_action


def run(student_id=1):
    """Main entry point — run the Faculty Agent."""
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM student_info WHERE id=?", (student_id,)).fetchone()
    schedule = conn.execute(
        "SELECT * FROM class_schedule WHERE student_id=?", (student_id,)
    ).fetchall()
    conn.close()

    student_dict = dict(student) if student else {}
    all_classes = [dict(s) for s in schedule]

    # Faculty announcements (simulated — in production these would come from a real system)
    announcements = [
        {"subject": "Operating Systems", "message": "OS class rescheduled to 2:00 PM tomorrow.", "priority": "high"},
        {"subject": "Database Systems", "message": "DBMS lab submission deadline extended to next Wednesday.", "priority": "medium"},
        {"subject": "AI & ML", "message": "Guest lecture on Transformers this Friday at 3 PM.", "priority": "low"},
    ]

    # Attendance insight for faculty
    attendance_insight = _attendance_insight(student_dict)

    # Update MCP context
    ctx = read_context()
    ctx["faculty_announcements"] = [a["message"] for a in announcements]
    write_context(ctx)
    log_agent_action("FacultyAgent", "generated_announcements", f"{len(announcements)} announcements")

    return {
        "announcements": announcements,
        "schedule": all_classes,
        "attendance_insight": attendance_insight,
    }


def _attendance_insight(student):
    """Generate faculty-side attendance analysis."""
    if not student:
        return "No student data available."
    att = student.get("attendance", 0)
    if att < 75:
        return f"⚠️ {student['name']} has {att}% attendance — needs counseling."
    return f"✅ {student['name']} has {att}% attendance — on track."
