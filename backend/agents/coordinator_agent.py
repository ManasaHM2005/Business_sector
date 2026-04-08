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


def run(student_id=1):
    """Main entry point — orchestrate all agents and produce unified output."""

    # Step 1: Run all agents
    student_data = student_agent.run(student_id)
    faculty_data = faculty_agent.run(student_id)
    canteen_data = canteen_agent.run()
    placement_data = placement_agent.run(student_id)

    # Step 2: Generate the AI Daily Summary
    summary = _generate_daily_summary(student_data, faculty_data, canteen_data, placement_data)

    # Step 3: Cross-agent intelligence
    cross_insights = _cross_agent_analysis(student_data, placement_data, canteen_data)

    # Step 4: Update MCP context with full coordinated state
    ctx = read_context()
    ctx["daily_summary"] = summary
    ctx["last_coordinated"] = datetime.now().isoformat()
    ctx["cross_insights"] = cross_insights
    write_context(ctx)
    log_agent_action("CoordinatorAgent", "full_coordination", "All agents synced")

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
    """Generate a natural-language AI daily summary for the student."""
    name = student.get("student", {}).get("name", "Student")
    pending = student.get("stats", {}).get("pending", 0)
    classes = student.get("stats", {}).get("today_classes_count", 0)
    att = student.get("student", {}).get("attendance", 0)
    canteen_best = canteen.get("best_time", "anytime")
    eligible = placement.get("stats", {}).get("eligible_count", 0)
    total_drives = placement.get("stats", {}).get("total_drives", 0)
    announcements = faculty.get("announcements", [])

    lines = [f"Good {'morning' if datetime.now().hour < 12 else 'afternoon' if datetime.now().hour < 17 else 'evening'}, {name}! 👋"]

    if classes > 0:
        lines.append(f"📅 You have {classes} class{'es' if classes > 1 else ''} today.")
    else:
        lines.append("📅 No classes scheduled for today.")

    if pending > 0:
        lines.append(f"📝 {pending} assignment{'s' if pending > 1 else ''} pending — don't miss the deadlines!")

    lines.append(f"🍔 Canteen tip — {canteen_best}.")
    lines.append(f"💼 You're eligible for {eligible}/{total_drives} upcoming placement drives.")

    if announcements:
        top = announcements[0]
        lines.append(f"📢 Faculty update: {top['message']}")

    return " | ".join(lines)


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
