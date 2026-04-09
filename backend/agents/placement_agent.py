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
    db_drives = conn.execute("SELECT * FROM placement_drives").fetchall()
    conn.close()

    if not student:
        return {"status": "error", "message": "Student not found"}

    student_dict = dict(student)
    cgpa = student_dict["cgpa"]
    # Safely handle skills even if None or empty
    student_skills_str = student_dict.get("skills") or ""
    student_skills = [s.strip().lower() for s in student_skills_str.split(",") if s.strip()]

    # ALL AVAILABLE DRIVES (from DB)
    all_drives = [dict(d) for d in db_drives] if db_drives else UPCOMING_DRIVES
    
    # CATEGORIZE DRIVES
    eligible_drives = []
    ineligible_drives = []
    
    for drive in all_drives:
        drive_skills_str = drive.get("skills_required") or ""
        drive_skills = [s.strip().lower() for s in drive_skills_str.split(",") if s.strip()]
        
        # Match if no skills required OR any student skill matches drive requirement
        skill_match = not drive_skills or any(skill in student_skills for skill in drive_skills)
        cgpa_match = cgpa >= drive.get("min_cgpa", 0)
        
        if skill_match and cgpa_match:
            eligible_drives.append(drive)
        else:
            ineligible_drives.append(drive)

    # Skill recommendations
    recommendations = _generate_recommendations(cgpa, student_dict, student_skills)

    # Preparation plan
    prep_plan = _generate_prep_plan(cgpa, student_skills)

    # Update MCP context
    ctx = read_context()
    ctx["placement"] = {
        "eligible_count": len(eligible_drives),
        "total_drives": len(all_drives),
        "top_recommendation": recommendations[0]["message"] if recommendations else "Keep upskilling!"
    }
    write_context(ctx)
    log_agent_action("PlacementAgent", "analyzed_placement", f"Identified {len(eligible_drives)} matching drives out of {len(all_drives)} total")

    return {
        "status": "success",
        "student": student_dict,
        "eligible_drives": eligible_drives,
        "all_drives": all_drives,
        "ineligible_drives": ineligible_drives,
        "recommendations": recommendations,
        "preparation_plan": prep_plan,
        "stats": {
            "eligible": len(eligible_drives),
            "total": len(all_drives),
        }
    }


def _generate_recommendations(cgpa, student, skills):
    """Generate personalized skill recommendations based on CGPA and current skills."""
    recs = []

    if skills:
        recs.append({"icon": "🛠️", "message": f"Identified current skills: {', '.join(skills).upper()}."})
    else:
        recs.append({"icon": "❓", "message": "No skills listed in profile. Add skills to get better AI target mapping."})

    if cgpa >= 8.5:
        recs.append({"icon": "🌟", "message": "High academic standing! Match your technical stack with Google/Microsoft interview loops."})
        if "python" in skills or "java" in skills:
            recs.append({"icon": "🚀", "message": f"Strong match with {skills[0].title()} detected. Recommended for Core Engineering roles."})
    elif cgpa >= 7.0:
        recs.append({"icon": "✅", "message": "Good eligibility. Focus on sharpening your selected skills for technical rounds."})
        if not skills:
            recs.append({"icon": "📢", "message": "Tip: Mastering React or Node.js will unlock more startups on our platform."})
    else:
        recs.append({"icon": "⚠️", "message": "Focus on improving CGPA while building a strong GitHub portfolio to offset grade requirements."})

    recs.append({"icon": "🔗", "message": "Cross-Agent Insight: Student Hub reports your attendance is stable, allowing more time for skill-building."})
    return recs


def _generate_prep_plan(cgpa, skills):
    """Generate a weekly preparation plan, personalized by skills."""
    plan = []
    
    if "react" in skills or "javascript" in skills:
        plan.append("Mon-Tue: Advanced Frontend (React Hooks, State Management)")
    elif "python" in skills:
        plan.append("Mon-Tue: Data Structures with Python (Focus on Dictionaries & Sets)")
    else:
        plan.append("Mon-Tue: Foundation Technical Skills (Pick a primary language)")

    plan.append("Wed: Aptitude & Logical Reasoning (Solve 20 problems)")
    
    if cgpa < 7.5:
        plan.append("Thu: Backlog revision / Grade Improvement study")
    else:
        plan.append("Thu: Open Source Contributions or Portfolio Mini-Project")

    plan.append("Fri-Sat: Mock coding test & Mock behavioral interview")
    plan.append("Sun: Revision and planning for next week")
    
    return plan
