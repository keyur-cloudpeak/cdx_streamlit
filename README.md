# CDX — Streamlit Edition

Same CDX design and behavior as the original single-file `index.html`,
now served through a well-structured Streamlit project. The UI itself is
rendered **unchanged** (same CSS, same JS, same charts/animations) inside
Streamlit via an iframe (`streamlit.components.v1.html`) — nothing was
rebuilt with native Streamlit widgets, so pixel-for-pixel the app looks
and behaves exactly like before.

## Project structure

```
cdx_streamlit/
├── app.py                  # Streamlit entry point (streamlit run app.py)
├── requirements.txt
├── config/                 # Agent-wise Python config
│   ├── __init__.py         # Assembles agent1..4 into AGENTS / AGENT_SUGGESTIONS
│   ├── settings.py         # BASE_URL, provider colors, page settings
│   ├── agent1.py           # Opportunity Discovery ("Where to Play")
│   ├── agent2.py           # Strategy Synthesis ("How to Play")
│   ├── agent3.py           # Audience-Fit ("Who to Play With")
│   └── agent4.py           # ROI Forecast ("Is It Worth It?")
├── static/
│   ├── style.css           # Extracted, untouched CSS from the original app
│   └── app.js               # Extracted JS logic (SPA router, charts, chat, etc.)
├── templates/
│   └── shell.html           # HTML shell with {{STYLE_CSS}} / {{CDX_CONFIG_JSON}} / {{APP_JS}} placeholders
└── utils/
    ├── __init__.py
    └── html_builder.py      # Reads template + static files, injects config, returns final HTML
```

## How it fits together

1. `config/agent1.py` … `agent4.py` each define that agent's `AGENT` dict
   (id, key, name, subtitle, color, hasChat) and `SUGGESTIONS` (chat
   starter prompts). `config/settings.py` holds the shared `BASE_URL`
   (the hosted CDX API the frontend talks to) and provider colors.
2. `config/__init__.py` assembles those into the exact shapes the
   frontend JS expects: `AGENTS`, `AGENT_SUGGESTIONS`, `BASE_URL`,
   `PROVIDER_COLORS`.
3. `utils/html_builder.py` serializes that config to JSON and injects it
   into `templates/shell.html` as `window.__CDX_CONFIG__`, along with the
   untouched `static/style.css` and `static/app.js`.
4. `static/app.js` was changed in exactly one place: it now reads
   `BASE_URL` / `AGENTS` / `AGENT_SUGGESTIONS` / `PROVIDER_COLORS` from
   `window.__CDX_CONFIG__` (falling back to the original hardcoded
   values if it's missing). Every other line — routing, charts, chat
   panels, API calls — is identical to the source file.
5. `app.py` calls `build_html()` and renders the result with
   `streamlit.components.v1.html(..., height=..., scrolling=True)`,
   which Streamlit renders inside an `<iframe>`.

## Run it

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Editing agent config

Want to change an agent's name, color, or suggested chat prompts? Edit
only that agent's file, e.g. `config/agent3.py`:

```python
AGENT = {
    "id": 3,
    "key": "agent3",
    "name": "Audience-Fit",
    "sub": "Who to Play With",
    "color": "#4A9EE8",
    "hasChat": True,
}

SUGGESTIONS = [
    "Which artist has the largest audience in Mexico?",
    ...
]
```

No other file needs to change — `config/__init__.py` picks it up
automatically and `html_builder.py` re-injects it on the next run.

## Notes

- The app is a client-side SPA that calls a hosted backend API
  (`BASE_URL` in `config/settings.py`, defaults to the original
  `https://cdx-lovat.vercel.app`). Point it at your own backend by
  changing that one value.
- `IFRAME_HEIGHT` in `config/settings.py` controls the iframe's pixel
  height inside the Streamlit page — bump it if content feels cramped.
