"""
Agent 1 — Opportunity Discovery ("Where to Play")

No chat interface for this agent in the original design; it only renders
the artist momentum table / narrative cards on the Overview + Agent 1 panels.
"""

AGENT = {
    "id": 1,
    "key": "agent1",
    "name": "Opportunity Discovery",
    "sub": "Where to Play",
    "color": "#1D9E75",
    "hasChat": False,
}

# Agent 1 has no chat panel, so no suggested questions.
SUGGESTIONS = []
