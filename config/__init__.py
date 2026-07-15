"""
config package

Each agent's metadata + chat suggestions live in their own file
(agent1.py, agent2.py, agent3.py, agent4.py) so they're easy to find and
edit independently. This __init__ just assembles them into the exact
shapes the frontend JS (static/app.js) expects:

    AGENTS = { 1: {...}, 2: {...}, 3: {...}, 4: {...} }
    AGENT_SUGGESTIONS = { "agent2": [...], "agent3": [...], "agent4": [...] }
"""

from . import agent1, agent2, agent3, agent4, settings

AGENT_MODULES = [agent1, agent2, agent3, agent4]

AGENTS = {module.AGENT["id"]: module.AGENT for module in AGENT_MODULES}

AGENT_SUGGESTIONS = {
    module.AGENT["key"]: module.SUGGESTIONS
    for module in AGENT_MODULES
    if module.SUGGESTIONS
}

BASE_URL = settings.BASE_URL
PROVIDER_COLORS = settings.PROVIDER_COLORS

__all__ = [
    "AGENTS",
    "AGENT_SUGGESTIONS",
    "BASE_URL",
    "PROVIDER_COLORS",
    "settings",
]
