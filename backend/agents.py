from database import get_db_connection
import json
import os

CONTEXT_FILE = "context.json"

def read_context():
    if not os.path.exists(CONTEXT_FILE):
        return {}
    with open(CONTEXT_FILE, "r") as f:
        return json.load(f)

def write_context(data):
    with open(CONTEXT_FILE, "w") as f:
        json.dump(data, f, indent=4)

def student_agent():
    # Analyzes tasks and attendance
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM student_info WHERE id=1").fetchone()
    tasks = conn.execute("SELECT * FROM tasks WHERE student_id=1 AND status='Pending'").fetchall()
    conn.close()
    
    alerts = []
    if student['attendance'] < 75:
        alerts.append(f"⚠️ Low Attendance Alert: {student['attendance']}%")
    else:
        alerts.append(f"✅ Attendance Good: {student['attendance']}%")
        
    for task in tasks:
        alerts.append(f"📚 Pending: {task['task_name']} due {task['due_date']}")
        
    return {
        "status": "success",
        "student": dict(student),
        "alerts": alerts
    }

def faculty_agent():
    # Simulates faculty updates
    return {
        "announcement": "Tomorrow's OS class is rescheduled to 2 PM."
    }

def canteen_agent():
    # Analyzes canteen crowding
    from datetime import datetime
    current_hour = datetime.now().hour
    
    if 12 <= current_hour <= 14:
        status = "🔴 Very Crowded (Peak Lunch Time)"
        suggestion = "Best time to visit: After 2:30 PM."
    elif 10 <= current_hour <= 11:
        status = "🟢 Light Crowd"
        suggestion = "Perfect time for a quick snack!"
    else:
        status = "🟡 Moderate Crowd"
        suggestion = "Standard waiting time (5-10 mins)."
        
    return {
        "status": status,
        "suggestion": suggestion,
        "special": "Today's Special: Paneer Butter Masala"
    }

def placement_agent():
    # Analyzes placement drives and CGPA
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM student_info WHERE id=1").fetchone()
    conn.close()
    
    suggestions = []
    cgpa = student['cgpa']
    if cgpa >= 8.5:
        suggestions.append("🌟 Eligible for Tier-1 companies (Google, Microsoft). Focus on Advanced DSA.")
    elif cgpa >= 7.5:
        suggestions.append("✅ Eligible for most mass recruiters. Build 2 strong projects.")
    else:
        suggestions.append("⚠️ Improve CGPA. Focus on Aptitude and Core Subjects.")
        
    return {
        "drives": [
            "TechCorp - Software Engineer Intern (Friday)",
            "DataWorks - Data Analyst (Next Tuesday)"
        ],
        "skill_recommendations": suggestions
    }

def coordinator_agent():
    # Uses MCP concept: Reads data from all agents, updates context, and generates a Daily Summary.
    student_data = student_agent()
    canteen_data = canteen_agent()
    placement_data = placement_agent()
    faculty_data = faculty_agent()
    
    # Read existing context memory
    ctx = read_context()
    
    # Generate intelligent summary
    pending_tasks = len(list(filter(lambda x: 'Pending' in x, student_data['alerts'])))
    summary = f"Hello {student_data['student']['name']}! You have {pending_tasks} assignments pending. "
    summary += f"{canteen_data['suggestion']} "
    summary += faculty_data['announcement']
    
    # Update Shared Context (MCP Simulation)
    ctx['latest_summary'] = summary
    ctx['metrics'] = {
        "attendance": student_data['student']['attendance'],
        "cgpa": student_data['student']['cgpa']
    }
    write_context(ctx)
    
    return {
        "summary": summary,
        "detailed_metrics": {
            "student": student_data,
            "canteen": canteen_data,
            "placement": placement_data,
            "faculty": faculty_data
        }
    }
