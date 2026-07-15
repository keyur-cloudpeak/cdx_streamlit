"""
utils/html_builder.py

Assembles the final self-contained HTML document that gets rendered
inside Streamlit's iframe via streamlit.components.v1.html().

Design and behavior are 100% unchanged from the original single-file
app — this just stitches the same CSS/JS back together and injects the
agent config from the config/ package instead of hardcoding it in JS.
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "templates"
STATIC_DIR = PROJECT_ROOT / "static"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build_cdx_config_json() -> str:
    """Serialize the agent-wise Python config into the JSON blob the
    frontend reads as window.__CDX_CONFIG__."""
    from config import AGENTS, AGENT_SUGGESTIONS, BASE_URL, PROVIDER_COLORS

    config = {
        "BASE_URL": BASE_URL,
        "AGENTS": AGENTS,
        "AGENT_SUGGESTIONS": AGENT_SUGGESTIONS,
        "PROVIDER_COLORS": PROVIDER_COLORS,
    }
    return json.dumps(config)


def build_html() -> str:
    """Return the full HTML document (CSS + config + JS inlined) ready
    to be passed to streamlit.components.v1.html()."""
    shell = _read(TEMPLATES_DIR / "shell.html")
    style_css = _read(STATIC_DIR / "style.css")
    app_js = _read(STATIC_DIR / "app.js")
    cdx_config_json = build_cdx_config_json()

    html = shell.replace("{{STYLE_CSS}}", style_css)
    html = html.replace("{{CDX_CONFIG_JSON}}", cdx_config_json)
    html = html.replace("{{APP_JS}}", app_js)
    return html
