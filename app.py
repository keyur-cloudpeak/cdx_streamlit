"""
app.py — CDX Streamlit entry point

This app does NOT rebuild the CDX UI with native Streamlit widgets — the
design (layout, CSS, charts, chat panels, animations) is preserved exactly
as-is by rendering the original HTML/CSS/JS bundle inside an iframe via
streamlit.components.v1.html().

What *is* Streamlit/Python-side is the project structure:
    config/     -> agent-wise Python config (agent1.py..agent4.py, settings.py)
    static/     -> untouched CSS + JS extracted from the original app
    templates/  -> HTML shell that stitches everything together
    utils/      -> html_builder.py assembles + injects config into the shell

Run with:
    streamlit run app.py
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env (no-op if file doesn't exist)
load_dotenv()

import streamlit as st
import streamlit.components.v1 as components

from config.settings import PAGE_TITLE, PAGE_ICON, IFRAME_HEIGHT
from utils import build_html

st.set_page_config(
    page_title=PAGE_TITLE,
    page_icon=PAGE_ICON,
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Remove Streamlit's default padding/chrome so the embedded app can use
# the full viewport, the way it did as a standalone page.
st.markdown(
    """
    <style>
        div.block-container { 
            padding: 0 !important; 
            padding-top: 0 !important;
            margin: 0 !important;
            max-width: 100% !important; 
        }
        header[data-testid="stHeader"] { display: none !important; }
        footer { display: none !important; }
        #MainMenu { display: none !important; }
        
        /* Hide the markdown container itself to remove its layout gap */
        div[data-testid="stMarkdownContainer"] { display: none !important; }
        
        /* Remove gap between elements */
        [data-testid="stVerticalBlock"] { gap: 0 !important; }
        
        iframe { 
            border: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            display: block !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

html_doc = build_html()

# components.html renders the given HTML inside a sandboxed <iframe>.
components.html(html_doc, height=IFRAME_HEIGHT, scrolling=True)
