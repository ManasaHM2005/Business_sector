"""
🍽️ Canteen Agent
=================
Responsibilities:
- Predict canteen crowd levels based on time of day
- Suggest the best time to visit for minimum wait
- Show today's menu specials
- Log canteen activity into MCP context
"""

from datetime import datetime
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from agents.mcp_context import read_context, write_context, log_agent_action


# Simulated hourly crowd data (0-23 hours)
CROWD_DATA = {
    8: 30, 9: 25, 10: 20, 11: 40, 12: 90, 13: 95,
    14: 70, 15: 35, 16: 25, 17: 45, 18: 60, 19: 50, 20: 30,
}

MENU = [
    {"item": "Paneer Butter Masala + Naan", "price": "₹80", "tag": "🌟 Chef's Special"},
    {"item": "Chicken Biryani", "price": "₹100", "tag": "🔥 Popular"},
    {"item": "Masala Dosa + Chutney", "price": "₹50", "tag": ""},
    {"item": "Cold Coffee", "price": "₹40", "tag": "☕ Refreshing"},
    {"item": "Veg Fried Rice", "price": "₹60", "tag": ""},
]


def run():
    """Main entry point — run the Canteen Agent."""
    ctx = read_context()
    
    current_hour = datetime.now().hour
    crowd_pct = ctx.get("canteen_override", CROWD_DATA.get(current_hour, 15))

    # Determine status
    if crowd_pct >= 80:
        status = "🔴 Very Crowded"
        status_level = "high"
    elif crowd_pct >= 50:
        status = "🟡 Moderately Crowded"
        status_level = "medium"
    else:
        status = "🟢 Low Crowd"
        status_level = "low"

    # Find the best time to visit (next least crowded hour)
    best_time = _find_best_time(current_hour)
    suggestion = f"Best time to visit: {best_time}"

    # Crowd forecast for next 4 hours
    forecast = []
    for h in range(current_hour, min(current_hour + 4, 21)):
        pct = CROWD_DATA.get(h, 15)
        forecast.append({
            "hour": f"{h}:00",
            "crowd_pct": pct,
            "level": "high" if pct >= 80 else ("medium" if pct >= 50 else "low"),
        })

    # Update MCP context
    ctx["canteen"] = {
        "current_crowd": crowd_pct,
        "status_level": status_level,
        "best_time": best_time,
    }
    write_context(ctx)
    log_agent_action("CanteenAgent", "crowd_prediction", f"Current: {crowd_pct}%")

    return {
        "status": status,
        "status_level": status_level,
        "crowd_percentage": crowd_pct,
        "suggestion": suggestion,
        "best_time": best_time,
        "forecast": forecast,
        "menu": MENU,
    }


def _find_best_time(current_hour):
    """Find the next least-crowded time slot."""
    best_hour = None
    best_crowd = 100
    for h in range(max(current_hour + 1, 8), 21):
        c = CROWD_DATA.get(h, 15)
        if c < best_crowd:
            best_crowd = c
            best_hour = h
    if best_hour is not None:
        return f"{best_hour}:00 (~{best_crowd}% crowd)"
    return "Now is good — low crowd expected"
