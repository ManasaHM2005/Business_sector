"""
🎓 Student Agent
=================
Responsibilities:
- Track assignments, exams, and deadlines
- Monitor attendance and generate predictive alerts
- Send proactive reminders when deadlines are near
- Analyze study patterns via activity history
"""

from datetime import datetime, timedelta
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import get_db_connection
from agents.mcp_context import read_context, write_context, log_agent_action


def run(student_id=1):
    """Main entry point — run the Student Agent."""
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM student_info WHERE id=?", (student_id,)).fetchone()
    tasks = conn.execute("SELECT * FROM tasks WHERE student_id=? ORDER BY due_date ASC", (student_id,)).fetchall()
    schedule = conn.execute("SELECT * FROM class_schedule WHERE student_id=? AND day=?", (student_id, datetime.now().strftime("%A"))).fetchall()
    sub_attendance = conn.execute("SELECT * FROM subject_attendance WHERE student_id=?", (student_id,)).fetchall()
    conn.close()

    if not student:
        return {"status": "error", "message": "Student not found"}

    student_dict = dict(student)
    subject_attendance_list = [dict(a) for a in sub_attendance]
    
    # REAL-WORLD RECONCILIATION: 
    # Calculate overall attendance as average of subjects if available
    if subject_attendance_list:
        overall_att = sum(a['attendance_pct'] for a in subject_attendance_list) / len(subject_attendance_list)
        student_dict['attendance'] = round(overall_att, 1)
    
    alerts = _generate_alerts(student_dict, tasks)
    pending = [dict(t) for t in tasks if t["status"] == "Pending"]
    completed = [dict(t) for t in tasks if t["status"] == "Completed"]
    today_classes = [dict(s) for s in schedule]

    # Update MCP context with student insights
    ctx = read_context()
    ctx["student_profile"] = {
        "name": student_dict["name"],
        "usn": student_dict["usn"],
        "attendance": student_dict["attendance"],
        "cgpa": student_dict["cgpa"],
        "pending_count": len(pending),
        "profile_pic": student_dict.get("profile_pic", "")
    }
    write_context(ctx)
    log_agent_action("StudentAgent", "analyzed_student", f"Profile reconciled with {len(subject_attendance_list)} subjects")

    return {
        "status": "success",
        "student": student_dict,
        "alerts": alerts,
        "pending_tasks": pending,
        "completed_tasks": completed,
        "today_classes": today_classes,
        "subject_attendance": subject_attendance_list,
        "stats": {
            "total_tasks": len(tasks),
            "pending": len(pending),
            "completed": len(completed),
            "today_classes_count": len(today_classes),
        }
    }


def _generate_alerts(student, tasks):
    """Generate intelligent, predictive alerts based on student data."""
    alerts = []

    # 1. Attendance analysis
    att = student["attendance"]
    if att < 65:
        alerts.append({
            "type": "danger",
            "icon": "🚨",
            "message": f"CRITICAL: Attendance at {att}% — You may be debarred from exams!",
        })
    elif att < 75:
        alerts.append({
            "type": "warning",
            "icon": "⚠️",
            "message": f"Low Attendance: {att}% — Attend all classes this week to recover.",
        })
    else:
        alerts.append({
            "type": "success",
            "icon": "✅",
            "message": f"Attendance is healthy at {att}%.",
        })

    # 2. CGPA guidance
    cgpa = student["cgpa"]
    if cgpa < 6.0:
        alerts.append({
            "type": "warning",
            "icon": "📉",
            "message": f"CGPA {cgpa} is below average. Focus on core subjects.",
        })

    # 3. Task deadline predictions
    for t in tasks:
        if t["status"] != "Pending":
            continue
        due = t["due_date"]
        if due.lower() == "tomorrow":
            alerts.append({
                "type": "danger",
                "icon": "🔥",
                "message": f"'{t['task_name']}' is due TOMORROW! Submit now.",
            })
        elif "today" in due.lower():
            alerts.append({
                "type": "danger",
                "icon": "⏰",
                "message": f"'{t['task_name']}' is due TODAY!",
            })
        else:
            alerts.append({
                "type": "info",
                "icon": "📚",
                "message": f"Pending: '{t['task_name']}' — due {due}.",
            })

    return alerts
