"""
Global settings for the CDX Streamlit app.

CDX is a client-side SPA that talks directly to a hosted backend API
(BASE_URL). Streamlit's job here is just to serve the exact same
HTML/CSS/JS experience inside an iframe (via streamlit.components.v1.html)
while keeping the Python side of the project cleanly organized.
"""

import os

# Backend API root — resolved in order:
#   1. Environment variable CDX_BASE_URL  (set in .env or system env)
#   2. Streamlit secrets  (st.secrets["CDX_BASE_URL"])
#   3. Hardcoded fallback (for local development without any config)
def _resolve_base_url() -> str:
    # 1. Plain environment variable (loaded via python-dotenv in app.py)
    if url := os.environ.get("CDX_BASE_URL"):
        return url
    # 2. Streamlit secrets (works on Streamlit Cloud)
    try:
        import streamlit as st
        return st.secrets["CDX_BASE_URL"]
    except Exception:
        pass
    # 3. Fallback — change only if you move the backend
    return ""

BASE_URL = _resolve_base_url()

# Colors for the LLM providers shown in the chat model-selector
PROVIDER_COLORS = {
    "anthropic": "#D4845A",
    "openai": "#19C37D",
}

# Page-level Streamlit config
PAGE_TITLE = "CSIE-Commercial Signal Intelligence Engine"
PAGE_ICON = "🎯"
IFRAME_HEIGHT = 1000  # px, tweak to taste / make responsive in app.py
