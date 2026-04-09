"""
🧠 Coordinator Agent (Main Controller)
========================================
Responsibilities:
- Orchestrate all other agents
- Combine outputs into a unified dashboard payload
- Generate the AI Daily Summary
- Maintain the MCP shared context as the single source of truth
- Make cross-agent decisions (e.g., placement + student = skill plan)
"""

from datetime import datetime
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from agents import student_agent, faculty_agent, canteen_agent, placement_agent
from agents.mcp_context import read_context, write_context, log_agent_action


import concurrent.futures
import time

def run(student_id=1):
    """Main entry point — orchestrated parallel agent execution."""
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Submit all agent tasks in parallel
        f_student = executor.submit(student_agent.run, student_id)
        f_faculty = executor.submit(faculty_agent.run, student_id)
        f_canteen = executor.submit(canteen_agent.run)
        f_placement = executor.submit(placement_agent.run, student_id)
        
        # Wait for all to complete
        student_data = f_student.result()
        faculty_data = f_faculty.result()
        canteen_data = f_canteen.result()
        placement_data = f_placement.result()

    # Step 2: Generate Insights (Sequentially as they depend on agent output)
    summary = _generate_daily_summary(student_data, faculty_data, canteen_data, placement_data)
    cross_insights = _cross_agent_analysis(student_data, placement_data, canteen_data)

    # Step 4: Update MCP context
    ctx = read_context()
    ctx["daily_summary"] = summary
    ctx["last_coordinated"] = datetime.now().isoformat()
    ctx["cross_insights"] = cross_insights
    write_context(ctx)
    
    end_time = time.time()
    latency = round((end_time - start_time) * 1000, 2)
    log_agent_action("CoordinatorAgent", "parallel_sync", f"All agents synced in {latency}ms")

    return {
        "summary": summary,
        "cross_insights": cross_insights,
        "student": student_data,
        "faculty": faculty_data,
        "canteen": canteen_data,
        "placement": placement_data,
        "timestamp": datetime.now().isoformat(),
    }


def _generate_daily_summary(student, faculty, canteen, placement):
    """Generate a high-fidelity, contextual AI daily summary."""
    name = student.get("student", {}).get("name", "Student")
    pending = student.get("stats", {}).get("pending", 0)
    attendance_data = student.get("subject_attendance", [])
    all_tasks = student.get("pending_tasks", [])
    eligible_count = placement.get("stats", {}).get("eligible", 0)
    
    # 1. Greeting
    lines = [f"System check complete for {name}. 🧠"]
    
    # 2. Critical Academic Insights (Subject-Specific)
    at_risk = [s for s in attendance_data if s["attendance_pct"] < 75]
    if at_risk:
        subjects = ", ".join([f"{s['subject']} ({s['attendance_pct']}%)" for s in at_risk])
        lines.append(f"⚠️ **Urgent**: Attendance in {subjects} is below threshold. Prioritize these sessions.")
    else:
        lines.append("✅ Academic status: All subjects meet attendance requirements.")
        
    # 3. Task Intelligence
    if all_tasks:
        recent_tasks = all_tasks[:2] # Top 2 priorities
        task_str = " & ".join([f"'{t['task_name']}'" for t in recent_tasks])
        lines.append(f"✍️ Intelligence detect {len(all_tasks)} pending nodes. focus on {task_str} immediately.")
    
    # 4. Career Mapping
    if eligible_count > 0:
        lines.append(f"🎯 Career Hub: {eligible_count} matched recruitment drives detected in your neural path.")
    
    # 5. Campus Dynamics
    c_status = canteen.get("status", "Stable")
    lines.append(f"🍔 Campus Dynamics: Canteen load is {c_status}. Optimal sync suggested for {canteen.get('best_time')}.")

    return " ".join(lines)


def _cross_agent_analysis(student, placement, canteen):
    """Cross-agent intelligence — insights that require data from multiple agents."""
    insights = []

    att = student.get("student", {}).get("attendance", 100)
    pending = student.get("stats", {}).get("pending", 0)
    eligible = placement.get("stats", {}).get("eligible_count", 0)
    cgpa = student.get("student", {}).get("cgpa", 0)

    # Attendance + Placement crossover
    if att < 75 and eligible > 0:
        insights.append({
            "icon": "🔗",
            "message": "Your low attendance could affect placement eligibility. Some companies require ≥75%.",
            "severity": "warning",
        })

    # Pending tasks + Placement crossover
    if pending >= 2 and eligible > 0:
        insights.append({
            "icon": "⚡",
            "message": "Clear your pending assignments before placement prep — multitasking reduces performance.",
            "severity": "info",
        })

    # CGPA + Placement tier suggestion
    if 7.0 <= cgpa < 8.0:
        insights.append({
            "icon": "🎯",
            "message": f"Raising CGPA from {cgpa} to 8.0 would unlock Tier-1 company eligibility!",
            "severity": "info",
        })

    # Canteen timing optimization
    canteen_crowd = canteen.get("crowd_percentage", 0)
    if canteen_crowd > 70:
        insights.append({
            "icon": "🍽️",
            "message": f"Canteen is {canteen_crowd}% full. Skip now and focus on studies — go during the suggested time.",
            "severity": "info",
        })

    if not insights:
        insights.append({
            "icon": "🌟",
            "message": "Everything looks great! Keep up the good work.",
            "severity": "success",
        })

    return insights
