"""
MCP Context Manager — Shared Memory Layer
==========================================
This module simulates the Model Context Protocol (MCP).
All agents read from and write to a shared JSON context file,
enabling inter-agent communication and memory persistence.
"""

import json
import os
from datetime import datetime

CONTEXT_FILE = os.path.join(os.path.dirname(__file__), "..", "context.json")

def read_context():
    """Read the shared MCP context from disk."""
    if not os.path.exists(CONTEXT_FILE):
        return {"created_at": datetime.now().isoformat(), "history": []}
    try:
        with open(CONTEXT_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {"created_at": datetime.now().isoformat(), "history": []}

def write_context(data):
    """Write updated context back to disk using atomic replace."""
    data["last_updated"] = datetime.now().isoformat()
    tmp = CONTEXT_FILE + ".tmp"
    try:
        with open(tmp, "w") as f:
            json.dump(data, f, indent=4)
        if os.path.exists(tmp):
            os.replace(tmp, CONTEXT_FILE)
    except Exception:
        pass

def log_agent_action(agent_name, action, details="", severity=None):
    """Log an agent's action into the shared context for auditability."""
    ctx = read_context()
    if "history" not in ctx:
        ctx["history"] = []
    
    log_entry = {
        "agent": agent_name,
        "action": action,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    if severity:
        log_entry["severity"] = severity
        
    ctx["history"].append(log_entry)
    
    # Keep only last 50 logs to avoid file bloat
    ctx["history"] = ctx["history"][-50:]
    write_context(ctx)
