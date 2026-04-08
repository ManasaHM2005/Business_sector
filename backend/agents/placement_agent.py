"""
💼 Placement Agent
===================
Responsibilities:
- Track upcoming placement drives
- Recommend skills based on CGPA and profile
- Provide personalized preparation plans
- Cross-reference with MCP context for coordinated suggestions
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import get_db_connection
from agents.mcp_context import read_context, write_context, log_agent_action


# Simulated upcoming drives
UPCOMING_DRIVES = [
    {"company": "Google", "role": "SWE Intern", "date": "April 14", "min_cgpa": 8.5, "package": "₹45 LPA"},
    {"company": "Microsoft", "role": "SDE Intern", "date": "April 18", "min_cgpa": 8.0, "package": "₹40 LPA"},
    {"company": "TCS", "role": "System Engineer", "date": "April 22", "min_cgpa": 6.0, "package": "₹7 LPA"},
    {"company": "Infosys", "role": "Power Programmer", "date": "April 25", "min_cgpa": 7.0, "package": "₹9.5 LPA"},
    {"company": "Flipkart", "role": "Data Analyst", "date": "May 2", "min_cgpa": 7.5, "package": "₹18 LPA"},
]


def run(student_id=1):
    """Main entry point — run the Placement Agent."""
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM student_info WHERE id=?", (student_id,)).fetchone()
    conn.close()

    if not student:
        return {"status": "error", "message": "Student not found"}

    student_dict = dict(student)
    cgpa = student_dict["cgpa"]

    # Filter eligible drives
    eligible = [d for d in UPCOMING_DRIVES if cgpa >= d["min_cgpa"]]
    not_eligible = [d for d in UPCOMING_DRIVES if cgpa < d["min_cgpa"]]

    # Skill recommendations
    recommendations = _generate_recommendations(cgpa, student_dict)

    # Preparation plan
    prep_plan = _generate_prep_plan(cgpa)

    # Update MCP context
    ctx = read_context()
    ctx["placement"] = {
        "eligible_count": len(eligible),
        "total_drives": len(UPCOMING_DRIVES),
        "top_recommendation": recommendations[0]["message"] if recommendations else "",
    }
    write_context(ctx)
    log_agent_action("PlacementAgent", "analyzed_placement", f"Eligible for {len(eligible)}/{len(UPCOMING_DRIVES)} drives")

    return {
        "eligible_drives": eligible,
        "not_eligible_drives": not_eligible,
        "recommendations": recommendations,
        "preparation_plan": prep_plan,
        "stats": {
            "cgpa": cgpa,
            "eligible_count": len(eligible),
            "total_drives": len(UPCOMING_DRIVES),
        }
    }


def _generate_recommendations(cgpa, student):
    """Generate personalized skill recommendations based on CGPA tier."""
    recs = []

    if cgpa >= 8.5:
        recs.append({"icon": "🌟", "message": "Eligible for Tier-1 (Google, Microsoft). Focus on Advanced DSA & System Design."})
        recs.append({"icon": "💡", "message": "Practice LeetCode Medium/Hard — target 200+ problems."})
        recs.append({"icon": "📝", "message": "Prepare 2 strong projects with live demos for interviews."})
    elif cgpa >= 7.0:
        recs.append({"icon": "✅", "message": "Eligible for most mass recruiters. Strengthen DSA basics."})
        recs.append({"icon": "🔧", "message": "Build projects using React, Node.js, or Python + FastAPI."})
        recs.append({"icon": "📊", "message": "Practice aptitude questions — Quantitative + Logical Reasoning."})
    else:
        recs.append({"icon": "⚠️", "message": f"CGPA {cgpa} limits options. Focus on improving grades this semester."})
        recs.append({"icon": "📖", "message": "Master core CS subjects: OS, DBMS, Computer Networks."})
        recs.append({"icon": "🎯", "message": "Target service-based companies first, then upskill."})

    return recs


def _generate_prep_plan(cgpa):
    """Generate a weekly preparation plan."""
    if cgpa >= 8.0:
        return [
            "Mon-Wed: DSA problems (2 per day)",
            "Thu: System Design concepts",
            "Fri: Mock interviews & behavioral prep",
            "Sat: Project work & portfolio updates",
            "Sun: Rest + light revision",
        ]
    else:
        return [
            "Mon-Wed: Core subjects revision (OS, DBMS, CN)",
            "Thu-Fri: DSA basics (arrays, strings, sorting)",
            "Sat: Aptitude practice (30 min) + 1 mini project",
            "Sun: Rest + revision of weak topics",
        ]
