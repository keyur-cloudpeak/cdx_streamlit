/* ==========================================================================
   CDX — core: constants, api, utils, icons, charts
   ========================================================================== */

/* ----------------------------------------------------------------------
   Config is injected by the Streamlit/Python side as `window.__CDX_CONFIG__`
   (see utils/html_builder.py + config/*.py). Falls back to sane defaults
   so this file still works if loaded stand-alone. Everything below this
   point is unchanged from the original app.
   ---------------------------------------------------------------------- */
const CDX_CONFIG = (typeof window !== 'undefined' && window.__CDX_CONFIG__) || {};

const BASE_URL = CDX_CONFIG.BASE_URL || 'https://cdx-one.vercel.app';

const AGENTS = CDX_CONFIG.AGENTS;

const AGENT_SUGGESTIONS = CDX_CONFIG.AGENT_SUGGESTIONS;

const PROVIDER_COLORS = CDX_CONFIG.PROVIDER_COLORS;

/* ---------- API ---------- */
const api = {
  getSummary: () => fetch(`${BASE_URL}/api/summary`).then(r => r.json()),
  getModels: () => fetch(`${BASE_URL}/api/models`).then(r => r.json()),
  getAgent1: () => fetch(`${BASE_URL}/api/agent1`).then(r => r.json()),
  getAgent2: () => fetch(`${BASE_URL}/api/agent2`).then(r => r.json()),
  getAgent3: () => fetch(`${BASE_URL}/api/agent3`).then(r => r.json()),
  getAgent4: () => fetch(`${BASE_URL}/api/agent4`).then(r => r.json()),
  getRoiScenarios: () => fetch(`${BASE_URL}/api/roi_scenarios`).then(r => r.json()),
  getPipelineStatus: () => fetch(`${BASE_URL}/api/pipeline_status`).then(r => r.json()),
  runPipeline: () => fetch(`${BASE_URL}/api/run_pipeline`, { method: 'POST' }).then(r => r.json()),
  clearChat: (sessionId) =>
    fetch(`${BASE_URL}/api/chat/clear?session_id=${sessionId}`).then(r => r.json()),
  sendChat: (agentKey, payload) =>
    fetch(`${BASE_URL}/api/chat/${agentKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()),
};

/* ---------- tiny query cache (staleTime-based, react-query-lite) ---------- */
const _cache = {};
function queryData(key, fn, staleTime = 30000) {
  const entry = _cache[key];
  const now = Date.now();
  if (entry && (now - entry.time) < staleTime) {
    return Promise.resolve(entry.data);
  }
  return fn().then(data => {
    _cache[key] = { data, time: Date.now() };
    return data;
  }).catch(err => {
    if (entry) return entry.data; // fall back to stale on error
    throw err;
  });
}
function invalidateAll() { Object.keys(_cache).forEach(k => delete _cache[k]); }
function cacheGet(key) { return _cache[key] ? _cache[key].data : undefined; }

/* ---------- utils ---------- */
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
function fmtTime(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function fmtReach(n) {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return String(num);
}
function fmtCurrency(n) {
  const num = Number(n);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}
function shortModelLabel(label) {
  if (!label) return '';
  return label.replace('Claude ', '').replace('claude-', '');
}
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---------- icon svgs (subset of lucide, hand-drawn to avoid deps) ---------- */
const Icon = {
  sun: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  chevronRight: (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  alertTriangle: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  messageSquare: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  trendingUp: (s = 32) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trash: (s = 13) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
};

function agentBadgeHtml(id, color, size = 'sm') {
  const px = { sm: 20, md: 28, lg: 40 }[size] || 20;
  const fontSize = size === 'lg' ? 14 : size === 'md' ? 11 : 9;
  return `<div class="agent-badge" style="width:${px}px;height:${px}px;background-color:${hexToRgba(color, 0.15)};border-top:2px solid ${hexToRgba(color, 0.7)};color:${color};font-size:${fontSize}px;">${String(id).padStart(2, '0')}</div>`;
}

/* ==========================================================================
   Chart generators — plain inline SVG (Recharts replacement)
   ========================================================================== */

// Horizontal bar chart. data: [{label, value, color}]
function svgHBarChart(data, opts = {}) {
  const w = opts.width || 460;
  const barH = 16, gap = 14;
  const leftPad = opts.leftPad || 100;
  const rightPad = 44;
  const topPad = 8;
  const h = data.length * (barH + gap) + topPad;
  const maxVal = Math.max(1, ...data.map(d => d.value)) * 1.15;
  const plotW = w - leftPad - rightPad;

  let rows = '';
  data.forEach((d, i) => {
    const y = topPad + i * (barH + gap);
    const bw = Math.max(2, (d.value / maxVal) * plotW);
    rows += `
      <text x="${leftPad - 8}" y="${y + barH / 2 + 4}" text-anchor="end" font-size="11" fill="var(--text-secondary)" font-family="DM Sans, sans-serif">${esc(d.label)}</text>
      <rect x="${leftPad}" y="${y}" width="${bw}" height="${barH}" rx="1" fill="${d.color}"></rect>
      <text x="${leftPad + bw + 6}" y="${y + barH / 2 + 4}" font-size="10" fill="var(--text-secondary)" font-family="JetBrains Mono, monospace">${d.valueLabel !== undefined ? d.valueLabel : d.value}</text>
    `;
  });

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMinYMid meet">${rows}</svg>`;
}

// Donut chart with legend. data: [{label, value, color}]
function svgDonutChart(data, opts = {}) {
  const size = opts.size || 200;
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.38, rInner = size * 0.24;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let angle = -Math.PI / 2;
  let paths = '';
  data.forEach(d => {
    const frac = d.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2 - 0.02; // small gap
    angle += frac * Math.PI * 2;
    if (frac <= 0) return;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0o = cx + rOuter * Math.cos(a0), y0o = cy + rOuter * Math.sin(a0);
    const x1o = cx + rOuter * Math.cos(a1), y1o = cy + rOuter * Math.sin(a1);
    const x0i = cx + rInner * Math.cos(a1), y0i = cy + rInner * Math.sin(a1);
    const x1i = cx + rInner * Math.cos(a0), y1i = cy + rInner * Math.sin(a0);
    paths += `<path d="M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x0i} ${y0i} A ${rInner} ${rInner} 0 ${large} 0 ${x1i} ${y1i} Z" fill="${d.color}"></path>`;
  });

  const legend = data.map(d => `
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-secondary);">
      <span style="width:6px;height:6px;border-radius:50%;background:${d.color};flex-shrink:0;"></span>
      <span>${esc(d.label)} (${d.value})</span>
    </div>`).join('');

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;height:100%;justify-content:center;">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="max-width:100%;">${paths}</svg>
      <div style="display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;max-width:${size + 60}px;">${legend}</div>
    </div>`;
}

// Multi-line chart. series: [{key, label, color, dashed, values:[..]}], categories: [labels]
function svgLineChart(series, categories, opts = {}) {
  // Ensure enough horizontal space for all points, allowing scrolling if needed
  const w = Math.max(opts.width || 640, categories.length * 28 + 52);
  const h = opts.height || 200;
  const padL = 36, padR = 16, padT = 12, padB = 70; // Increased padding for rotated labels
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const allVals = series.flatMap(s => s.values.map(Number));
  const maxV = Math.max(...allVals) * 1.15;
  const minV = 0;
  const n = categories.length;
  const xStep = n > 1 ? plotW / (n - 1) : 0;

  const xFor = i => padL + i * xStep;
  const yFor = v => padT + plotH - ((v - minV) / (maxV - minV || 1)) * plotH;

  // gridlines
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const gy = padT + (plotH / 4) * g;
    grid += `<line x1="${padL}" y1="${gy}" x2="${padL + plotW}" y2="${gy}" stroke="var(--border-color)" stroke-dasharray="2 4"></line>`;
  }

  // Rotate labels -45 deg to prevent overlap on dense charts
  const labelY = padT + plotH + 12;
  let axisLabels = categories.map((c, i) => {
    let label = c.length > 16 ? c.substring(0, 14) + '...' : c;
    return `<text x="${xFor(i)}" y="${labelY}" text-anchor="end" font-size="10" fill="var(--text-secondary)" font-family="DM Sans, sans-serif" transform="rotate(-45, ${xFor(i)}, ${labelY})">${esc(label)}</text>`;
  }).join('');

  let lines = '';
  series.forEach(s => {
    const pts = s.values.map((v, i) => `${xFor(i)},${yFor(Number(v))}`).join(' ');
    lines += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dashed ? `stroke-dasharray="${s.dashed}"` : ''}></polyline>`;
    if (s.dots) {
      s.values.forEach((v, i) => {
        lines += `<circle cx="${xFor(i)}" cy="${yFor(Number(v))}" r="3" fill="${s.color}"></circle>`;
      });
    }
  });

  const legend = series.map(s => `
    <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-secondary);">
      <span style="width:12px;height:2px;background:${s.color};display:inline-block;"></span>
      <span>${esc(s.label)}</span>
    </div>`).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:6px;height:100%;">
      <div style="flex:1;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;">
        <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMinYMid meet" style="display:block;">
          ${grid}${lines}${axisLabels}
        </svg>
      </div>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">${legend}</div>
    </div>`;
}
/* ==========================================================================
   CDX — app shell: state, header, workflow banner, navigation
   ========================================================================== */

const State = {
  activePanel: 'overview',
  summary: null,
  serverDown: false,
  bannerDismissed: false,
  pipeline: { isRunning: false, stageIndex: 0, lastRun: null, status: 'idle', pollHandle: null, stageHandle: null },
};

const PIPELINE_STAGES = [
  { key: 'starting', label: 'Starting Pipeline...', match: 'Starting Pipeline...' },
  { key: 'data', label: 'Generating Data...', match: 'Generating Data' },
  { key: 'scores', label: 'Calculating Scores...', match: 'Calculating Scores' },
  { key: 'agents', label: 'Running Agents...', match: 'Running Agents' },
  { key: 'done', label: 'Pipeline complete ✓', match: 'complete' },
];

/* ---------- theme ---------- */
function getIsDark() {
  const saved = localStorage.getItem('cdx-theme');
  if (saved) return saved === 'dark';
  return document.documentElement.classList.contains('dark');
}
function setTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('cdx-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = isDark ? Icon.sun(18) : Icon.moon(18);
}

/* ---------- header ---------- */
function renderHeader() {
  const logoHtml = LOGO_SVG_MARKUP
    ? `<div class="logo-wrap">${LOGO_SVG_MARKUP}</div>`
    : `<div class="logo-wrap"><div class="logo-fallback-icon">CD</div><span class="logo-fallback-text">Chromadata</span></div>`;

  return `
    <header class="app-header">
      ${logoHtml}
      <div class="flex items-center gap-4">
        <button id="theme-toggle-btn" class="btn-icon" title="Toggle theme">${getIsDark() ? Icon.sun(18) : Icon.moon(18)}</button>
        <div class="vdiv"></div>
        <div class="presented-to">
          <div class="label">Presented to</div>
          <div class="brand-name">Sony Music Latin</div>
        </div>
      </div>
    </header>`;
}

/* ---------- workflow banner ---------- */
function hasChatActivity(agentKey) {
  try { return !!localStorage.getItem(`cdx_has_chat_${agentKey}`); } catch { return false; }
}
function getAgentCount(agentKey, summary) {
  if (!summary) return null;
  if (agentKey === 'agent1') {
    return summary.agent1 && summary.agent1.high_opportunities != null
      ? summary.agent1.high_opportunities + summary.agent1.medium_opportunities
      : null;
  }
  if (agentKey === 'agent2') return (summary.agent2 && summary.agent2.briefs_generated) ?? null;
  if (agentKey === 'agent3') {
    const r = summary.agent3 && summary.agent3.avg_reach;
    return r ? `${(r / 1_000_000).toFixed(1)}M avg` : null;
  }
  if (agentKey === 'agent4') {
    const r = summary.agent4 && summary.agent4.avg_base_roi;
    return r ? `${Number(r).toFixed(2)}x ROI` : null;
  }
  return null;
}

function renderWorkflowBanner() {
  const active = State.activePanel;
  let stepsHtml = `
    <button class="wf-step ${active === 'overview' ? 'active' : ''}" data-nav="overview">
      <div>
        <div class="wf-step-title">Overview</div>
        <div class="wf-step-sub">Pipeline summary</div>
      </div>
    </button>`;

  Object.values(AGENTS).forEach(agent => {
    const isActive = active === agent.key;
    const count = getAgentCount(agent.key, State.summary);
    const chatActive = hasChatActivity(agent.key);
    stepsHtml += `
      <span class="wf-chevron">›</span>
      <button class="wf-step" data-nav="${agent.key}" style="border-bottom-color:${isActive ? agent.color : 'transparent'};${isActive ? 'background:var(--bg-surface2);' : ''}">
        ${agentBadgeHtml(agent.id, agent.color, 'sm')}
        <div>
          <div class="wf-step-title">${agent.name}</div>
          <div class="wf-step-sub">${agent.sub}${count != null ? ` <span style="margin-left:6px;">· ${esc(count)}</span>` : ''}</div>
        </div>
        ${chatActive ? `<span class="wf-chat-dot" style="background:${agent.color};"></span>` : ''}
      </button>`;
  });

  return `
    <div class="workflow-banner" id="workflow-banner">
      <div class="wf-left">
        ${ICON_SVG_MARKUP || `<div class="logo-fallback-icon" style="width:22px;height:22px;font-size:9px;">CD</div>`}
        <span class="label" style="margin-left:2px;">CSIE PIPELINE</span>
      </div>
      <span class="wf-chevron">›</span>
      ${stepsHtml}
    </div>`;
}

function updateWorkflowBanner() {
  const el = document.getElementById('workflow-banner');
  if (el) el.outerHTML = renderWorkflowBanner();
  bindWorkflowBannerEvents();
}

function bindWorkflowBannerEvents() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-nav')));
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) btn.style.background = 'var(--bg-surface2)';
    });
    btn.addEventListener('mouseleave', () => {
      if (State.activePanel !== btn.getAttribute('data-nav')) btn.style.background = 'transparent';
    });
  });
}

/* ---------- server health check ---------- */
function checkServerHealth() {
  return api.getSummary()
    .then(() => { State.serverDown = false; })
    .catch(() => { State.serverDown = true; });
}

/* ---------- app shell mount ---------- */
function mountShell() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div id="server-banner-slot"></div>
    ${renderHeader()}
    ${renderWorkflowBanner()}
    <main class="panel-host" id="main-content"></main>
  `;
  bindHeaderEvents();
  bindWorkflowBannerEvents();
  layoutMain();
}

function bindHeaderEvents() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = !getIsDark();
      setTheme(next);
    });
  }
}

function layoutMain() {
  const main = document.getElementById('main-content');
  const bannerVisible = State.serverDown && !State.bannerDismissed;
  // Height is now managed automatically by flexbox in CSS
  const slot = document.getElementById('server-banner-slot');
  if (slot) {
    slot.innerHTML = bannerVisible
      ? `<div class="server-banner"><span>Backend server appears unreachable.</span></div>`
      : '';
  }
}

/* ---------- navigation / router ---------- */
function navigate(panelKey) {
  if (!panelKey) return;
  State.activePanel = panelKey;
  updateWorkflowBanner();
  loadPanel(panelKey);
}

function loadPanel(panelKey) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  try {
    if (panelKey === 'overview') mountOverviewPanel(main);
    else if (panelKey === 'agent1') mountAgent1Panel(main);
    else if (panelKey === 'agent2') mountAgentChatPanel(main, 2);
    else if (panelKey === 'agent3') mountAgentChatPanel(main, 3);
    else if (panelKey === 'agent4') mountAgentChatPanel(main, 4);
    else mountOverviewPanel(main);
  } catch (err) {
    console.error('[CDX] Panel render error:', err);
    renderErrorBoundary(main, err, () => loadPanel(panelKey));
  }
}

function renderErrorBoundary(container, err, retry) {
  container.innerHTML = `
    <div class="flex items-center justify-center" style="height:100%;padding:32px;">
      <div class="card" style="max-width:420px;width:100%;border-color:rgba(204,27,27,0.5);">
        <div class="flex items-center gap-2" style="margin-bottom:12px;">
          <span style="color:var(--brand-red);">${Icon.alertTriangle(18)}</span>
          <span style="font-family:var(--font-display);font-weight:700;font-size:20px;">Panel Error</span>
        </div>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">Something went wrong rendering this panel.</p>
        <details style="margin-bottom:16px;">
          <summary class="label" style="cursor:pointer;">Error details</summary>
          <pre style="font-size:11px;color:var(--text-muted);margin-top:8px;font-family:var(--font-mono);white-space:pre-wrap;word-break:break-word;">${esc(err && err.message)}</pre>
        </details>
        <button class="btn-ghost" id="retry-panel-btn">Retry panel</button>
      </div>
    </div>`;
  const retryBtn = document.getElementById('retry-panel-btn');
  if (retryBtn) retryBtn.addEventListener('click', retry);
}

/* ---------- pipeline control (shared by overview panel) ---------- */
function pipelineCurrentLabel() {
  if (State.pipeline.status && State.pipeline.status.toLowerCase().includes('error')) {
    return State.pipeline.status;
  }
  return PIPELINE_STAGES[State.pipeline.stageIndex]?.label || State.pipeline.status || '';
}
function pipelineProgress() {
  return (State.pipeline.stageIndex / Math.max(1, PIPELINE_STAGES.length - 1)) * 100;
}
function runPipeline(onUpdate) {
  State.pipeline.isRunning = true;
  State.pipeline.stageIndex = 0;
  State.pipeline.status = 'Starting Pipeline...';
  onUpdate();
  api.runPipeline().catch(() => { });
  pollPipelineStatus(onUpdate);
}
function pollPipelineStatus(onUpdate) {
  clearInterval(State.pipeline.pollHandle);
  const tick = () => {
    api.getPipelineStatus().then(status => {
      State.pipeline.status = status.status || 'idle';
      State.pipeline.lastRun = status.timestamp || status.last_run || State.pipeline.lastRun;

      const matchIdx = PIPELINE_STAGES.findIndex(s => State.pipeline.status.includes(s.match));
      if (matchIdx >= 0) {
        State.pipeline.stageIndex = matchIdx;
      }

      const isDone = State.pipeline.status === 'complete' || State.pipeline.status.toLowerCase().includes('error');
      if (isDone && State.pipeline.isRunning) {
        State.pipeline.isRunning = false;
        clearInterval(State.pipeline.pollHandle);
        invalidateAll();
      }
      onUpdate();
    }).catch(() => { });
  };
  tick();
  if (State.pipeline.isRunning) {
    State.pipeline.pollHandle = setInterval(tick, 2000);
  }
}
/* ==========================================================================
   CDX — Overview panel
   ========================================================================== */

const BRAND_BARS = [
  { key: 'Beverage', label: 'BEVERAGE', color: '#1D9E75' },
  { key: 'Fashion', label: 'FASHION', color: '#8B7FE8' },
  { key: 'Tech', label: 'TECH', color: '#4A9EE8' },
  { key: 'Sport', label: 'SPORT', color: '#D4924A' },
  { key: 'Finance', label: 'FINANCE', color: '#D4A017' },
];

function kpiCardHtml({ label, value, delta, deltaPositive, accentColor = '#CC1B1B', watermarkChar, loading = false }) {
  return `
    <div class="card kpi-card" style="border-left:2px solid ${accentColor};">
      ${watermarkChar ? `<span class="watermark-num" style="bottom:-16px;right:8px;color:${accentColor};">${esc(watermarkChar)}</span>` : ''}
      <span class="label">${esc(label)}</span>
      <div style="margin-top:8px;">
        ${loading ? `<div class="skel" style="height:34px;width:96px;"></div>` : `<div class="kpi-value">${value}</div>`}
      </div>
      ${delta !== undefined && !loading ? `<div style="margin-top:4px;font-size:12px;font-family:var(--font-mono);color:${deltaPositive ? '#1D9E75' : '#CC1B1B'};">${deltaPositive ? '▲' : '▼'} ${esc(delta)}</div>` : ''}
    </div>`;
}

function agentCardHtml(agent, count) {
  return `
    <button class="agent-card" data-agent-nav="${agent.key}">
      ${agentBadgeHtml(agent.id, agent.color, 'md')}
      <div class="min-w-0 flex-1">
        <span class="label" style="color:${agent.color};">AGENT ${agent.id}</span>
        <div class="agent-card-title">${esc(agent.name)}</div>
        <div class="agent-card-sub">${count != null ? `${esc(count)} results` : 'Not run yet'}</div>
      </div>
      <span style="color:var(--text-muted);flex-shrink:0;">${Icon.chevronRight(14)}</span>
    </button>`;
}

function leaderboardRowHtml(rank, artist, roiData) {
  const roi = (roiData || []).find(r => r.artist_id === artist.artist_id || r.artist_name === artist.artist_name);
  const badgeClass = { HIGH: 'badge-green', MEDIUM: 'badge-amber', WATCH: 'badge-muted' }[artist.opportunity_class] || 'badge-muted';
  const momentum = Number(artist.momentum_score);
  const barColor = momentum > 25 ? '#1D9E75' : momentum > 18 ? '#D4924A' : '#CC1B1B';
  const barWidth = Math.min((momentum / 35) * 100, 100);
  return `
    <tr class="lb-row" data-artist="${esc(artist.artist_name)}">
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);width:32px;">${rank}</td>
      <td><div style="font-family:var(--font-display);font-weight:700;font-size:14px;">${esc(artist.artist_name)}</div></td>
      <td style="font-size:12px;color:var(--text-secondary);">${esc(artist.top_territory_1 || '')}${artist.top_territory_2 ? ' · ' + esc(artist.top_territory_2) : ''}</td>
      <td>
        <div class="score-bar-cell">
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${barWidth}%;background:${barColor};"></div></div>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);width:32px;">${momentum.toFixed(1)}</span>
        </div>
      </td>
      <td><span class="badge ${badgeClass}">${esc(artist.opportunity_class)}</span></td>
      <td style="font-family:var(--font-mono);font-size:11px;color:#D4924A;">${roi ? Number(roi.base_roi).toFixed(2) + '×' : '—'}</td>
      <td><span style="font-size:12px;font-weight:500;color:#1D9E75;cursor:pointer;" class="lb-view-link">View →</span></td>
    </tr>`;
}

function brandCategoryBarHtml(bar, agent2Data) {
  if (!agent2Data || agent2Data.length === 0) {
    return `
      <div class="brand-bar-row">
        <span class="label" style="width:80px;flex-shrink:0;color:${bar.color};">${bar.label}</span>
        <div class="brand-bar-track"></div>
        <span style="font-size:12px;color:var(--text-muted);width:80px;text-align:right;">No data</span>
      </div>`;
  }
  const total = agent2Data.length;
  const highFit = agent2Data.filter(d => d.best_brand_category === bar.key && Number(d.brand_fit_score) > 80).length;
  const pct = total > 0 ? (highFit / total) * 100 : 0;
  return `
    <div class="brand-bar-row">
      <span class="label" style="width:80px;flex-shrink:0;color:${bar.color};">${bar.label}</span>
      <div class="brand-bar-track"><div class="brand-bar-fill" style="width:${pct}%;background:${bar.color};"></div></div>
      <span style="font-size:12px;color:var(--text-muted);width:80px;text-align:right;">${highFit} of ${total} HIGH fit</span>
    </div>`;
}

function mountOverviewPanel(container) {
  container.innerHTML = `<div class="overview-wrap"><div class="overview-inner" id="overview-inner">${overviewLoadingSkeleton()}</div></div>`;

  Promise.all([
    queryData('summary', api.getSummary, 10000).catch(() => null),
    queryData('agent1', api.getAgent1, 60000).catch(() => null),
    queryData('agent2', api.getAgent2, 60000).catch(() => null),
    queryData('agent3', api.getAgent3, 60000).catch(() => null),
    queryData('agent4', api.getAgent4, 60000).catch(() => null),
  ]).then(([summary, agent1Data, agent2Data, agent3Data, agent4Data]) => {
    State.summary = summary;
    updateWorkflowBanner();
    renderOverviewContent(agent1Data, agent2Data, agent3Data, agent4Data);
  });
}

function overviewLoadingSkeleton() {
  return `
    <div class="card" style="height:220px;"></div>
    <div class="grid-4 agent-cards">${[1, 2, 3, 4].map(() => `<div class="card" style="height:80px;"></div>`).join('')}</div>
    <div class="grid-4">${[1, 2, 3, 4].map(() => `<div class="card" style="height:100px;"></div>`).join('')}</div>
  `;
}

function renderOverviewContent(agent1Data, agent2Data, agent3Data, agent4Data) {
  const summary = State.summary;

  // Pre-build the discovery table HTML (avoids nested backtick issues in template literal)
  let discoveryTableHtml;
  if (agent1Data && agent1Data.length > 0) {
    discoveryTableHtml = artistTableHtml(agent1Data, Math.max(...agent1Data.map(d => Number(d.momentum_score))));
  } else {
    discoveryTableHtml = `<div class="card flat" style="padding:32px;text-align:center;color:var(--text-muted);font-size:14px;">
      ${agent1Data === null
        ? 'Could not load artist data. Check network/API connectivity.'
        : 'No artist data available. Run the pipeline to populate results.'}
    </div>`;
  }

  const agentCounts = {
    agent1: summary ? (summary.agent1?.high_opportunities ?? 0) + (summary.agent1?.medium_opportunities ?? 0) : null,
    agent2: summary?.agent2?.briefs_generated ?? null,
    agent3: agent3Data?.length ?? null,
    agent4: agent4Data?.length ?? null,
  };

  const top5 = agent1Data
    ? [...agent1Data].sort((a, b) => Number(b.momentum_score) - Number(a.momentum_score)).slice(0, 5)
    : [];

  const isError = State.pipeline.status && State.pipeline.status.toLowerCase().includes('error');
  const dotStatus = State.pipeline.isRunning ? 'fresh' : (isError ? 'error' : (summary?.run_timestamp ? 'fresh' : 'idle'));
  const dotColor = { fresh: '#1D9E75', stale: '#D4924A', idle: '#4A4A5E', error: '#CC1B1B' }[dotStatus];

  const lastRunLabel = isError
    ? State.pipeline.status
    : (State.pipeline.lastRun
      ? `Last run: ${fmtDate(State.pipeline.lastRun)}`
      : summary?.run_timestamp
        ? `Last run: ${fmtDate(summary.run_timestamp)}`
        : 'Pipeline not run yet');

  const inner = document.getElementById('overview-inner');
  inner.innerHTML = `
    <div class="card hero-card">
      <div class="hero-flex">
        <div class="hero-left">
          <span class="label">COMMERCIAL SIGNAL INTELLIGENCE ENGINE (CSIE)</span>
          <h1 class="hero-title">Sony Music Latin</h1>
          <p class="hero-desc">Four AI agents transforming music industry signals into explainable commercial recommendations for brand partnerships.</p>
        </div>
        <div class="hero-right">
          <div class="flex items-center gap-2">
            <span class="status-dot ${dotStatus === 'fresh' ? 'pulse-dot' : ''}" style="background:${dotColor};"></span>
            <span class="label" style="margin-left:2px;" id="last-run-label">${esc(lastRunLabel)}</span>
          </div>
          <button class="btn-primary" id="run-pipeline-btn" ${State.pipeline.isRunning ? 'disabled' : ''} style="${State.pipeline.isRunning ? 'opacity:.6;cursor:not-allowed;' : ''}">
            ${State.pipeline.isRunning ? 'Running...' : 'Run Full Pipeline'}
          </button>
          <div id="pipeline-progress-wrap" style="${State.pipeline.isRunning ? '' : 'display:none;'}">
            <div class="pipeline-progress-track"><div class="pipeline-progress-fill" id="pipeline-progress-fill" style="width:${pipelineProgress()}%;"></div></div>
            <p style="color:var(--text-muted);font-size:12px;margin-top:6px;" id="pipeline-stage-label">${esc(pipelineCurrentLabel())}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-4 agent-cards">
      ${Object.values(AGENTS).map(agent => agentCardHtml(agent, agentCounts[agent.key])).join('')}
    </div>

    <div class="grid-4">
      ${kpiCardHtml({ label: 'ARTISTS IN PIPELINE', value: summary?.artists_processed ?? 0, accentColor: 'var(--text-primary)' })}
      ${kpiCardHtml({ label: 'HIGH OPPORTUNITIES', value: summary?.agent1?.high_opportunities ?? 0, accentColor: '#1D9E75' })}
      ${kpiCardHtml({ label: 'AVG BASE ROI', value: summary?.agent4?.avg_base_roi ? `${Number(summary.agent4.avg_base_roi).toFixed(2)}×` : '—', accentColor: '#D4924A', watermarkChar: '×' })}
      ${kpiCardHtml({ label: 'HIGHEST ROI', value: summary?.agent4?.highest_roi_multiple ? `${Number(summary.agent4.highest_roi_multiple).toFixed(2)}×` : '—', delta: summary?.agent4?.highest_roi_artist, deltaPositive: true, accentColor: '#D4A017' })}
    </div>

    <div>
      <span class="label">TOP OPPORTUNITIES THIS WEEK</span>
      <h2 class="section-title">Artist Leaderboard</h2>
      ${top5.length === 0
      ? `<div class="card" style="text-align:center;padding:32px;color:var(--text-muted);font-size:14px;">No pipeline data yet. Run the pipeline to populate results.</div>`
      : `<div class="card flat">
            <div class="lb-table-wrap">
              <table class="data-table" style="min-width:560px;">
                <thead><tr>${['#', 'ARTIST', 'TERRITORY', 'MOMENTUM', 'OPPORTUNITY', 'BASE ROI', ''].map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${top5.map((a, i) => leaderboardRowHtml(i + 1, a, agent4Data)).join('')}</tbody>
              </table>
            </div>
          </div>`}
    </div>

    <div>
      <span class="label">BRAND CATEGORY SIGNALS</span>
      <div class="card" style="margin-top:8px;display:flex;flex-direction:column;gap:12px;">
        ${BRAND_BARS.map(bar => brandCategoryBarHtml(bar, agent2Data)).join('')}
      </div>
    </div>

    <div>
      <span class="label">ALL ARTISTS — DISCOVERY TABLE</span>
      <h2 class="section-title">Full Artist Roster</h2>
      <div style="margin-top:8px;">${discoveryTableHtml}</div>
    </div>

    <div class="footer-block">
      <div class="fb-main">Chromadata Commercial Signal Intelligence Engine (CSIE) — Built for Sony Music Latin Region</div>
      <div class="fb-sub">All scores calculated via Python/SQL. LLM interprets evidence only. Sample data — POC demonstration purposes.</div>
      <div class="fb-sub">© 2026 Chromadata. Confidential.</div>
    </div>
  `;

  bindOverviewEvents(agent1Data);
}

function bindOverviewEvents(agent1Data) {
  document.querySelectorAll('[data-agent-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-agent-nav')));
  });
  document.querySelectorAll('.lb-row').forEach(row => {
    row.addEventListener('click', () => {
      sessionStorage.setItem('cdx_artist_carryover', row.getAttribute('data-artist'));
      navigate('agent2');
    });
  });
  const runBtn = document.getElementById('run-pipeline-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runPipeline(() => {
        if (State.activePanel !== 'overview') return;
        // partial DOM update without full re-fetch/re-render of everything
        const btn2 = document.getElementById('run-pipeline-btn');
        const progressWrap = document.getElementById('pipeline-progress-wrap');
        const progressFill = document.getElementById('pipeline-progress-fill');
        const stageLabel = document.getElementById('pipeline-stage-label');
        const lastRunLabel = document.getElementById('last-run-label');
        if (btn2) {
          btn2.disabled = State.pipeline.isRunning;
          btn2.textContent = State.pipeline.isRunning ? 'Running...' : 'Run Full Pipeline';
          btn2.style.opacity = State.pipeline.isRunning ? '.6' : '1';
          btn2.style.cursor = State.pipeline.isRunning ? 'not-allowed' : 'pointer';
        }
        if (progressWrap) progressWrap.style.display = State.pipeline.isRunning ? '' : 'none';
        if (progressFill) progressFill.style.width = pipelineProgress() + '%';
        if (stageLabel) stageLabel.textContent = pipelineCurrentLabel();
        if (lastRunLabel && State.pipeline.lastRun) lastRunLabel.textContent = `Last run: ${fmtDate(State.pipeline.lastRun)}`;
        if (!State.pipeline.isRunning) {
          // pipeline finished — refresh whole panel with fresh data
          mountOverviewPanel(document.getElementById('main-content'));
        }
      });
    });
  }

  // Bind events for the ALL ARTISTS table on the overview
  if (agent1Data && agent1Data.length > 0) {
    bindAgent1Events(agent1Data);
  }
}
/* ==========================================================================
   CDX — Agent 1: Opportunity Discovery panel
   ========================================================================== */

const TERRITORY_LABELS = {
  MX: 'Mexico', CO: 'Colombia', AR: 'Argentina', ES: 'Spain', CL: 'Chile',
  VE: 'Venezuela', BR: 'Brazil', PE: 'Peru', US: 'United States',
};
const PALETTE_8 = ['#1D9E75', '#8B7FE8', '#4A9EE8', '#D4924A', '#D4A017', '#CC1B1B', '#6B9E6B', '#9E7F1D'];

function panelHeaderHtml(agent, description) {
  return `
    <div class="panel-header" style="border-left:2px solid ${agent.color};">
      ${agentBadgeHtml(agent.id, agent.color, 'md')}
      <div>
        <span class="label" style="color:${agent.color};">AGENT ${agent.id} OF 4</span>
        <h2>${esc(agent.name)}</h2>
        <p>${esc(description)}</p>
      </div>
    </div>`;
}

function skeletonPanelHtml() {
  return `
    <div style="padding:24px;display:flex;flex-direction:column;gap:24px;height:100%;overflow:hidden;">
      <div class="grid-4">${[1, 2, 3, 4].map(() => `<div class="card" style="height:70px;"><div class="skel" style="height:12px;width:60px;margin-bottom:8px;"></div><div class="skel" style="height:34px;width:80px;"></div></div>`).join('')}</div>
      <div class="grid-3">
        ${[1, 2, 3].map(() => `<div class="card" style="height:220px;"><div class="skel" style="height:12px;width:96px;margin-bottom:12px;"></div><div class="skel" style="height:160px;width:100%;"></div></div>`).join('')}
      </div>
    </div>`;
}

function emptyStateHtml({ icon, title, message, actionLabel, actionId }) {
  return `
    <div class="empty-state">
      ${icon ? `<span style="color:var(--text-muted);">${icon}</span>` : ''}
      ${title ? `<div class="empty-state-title">${esc(title)}</div>` : ''}
      ${message ? `<div class="empty-state-msg">${esc(message)}</div>` : ''}
      ${actionLabel ? `<button class="btn-primary" id="${actionId}" style="margin-top:8px;">${esc(actionLabel)}</button>` : ''}
    </div>`;
}

function mountAgent1Panel(container) {
  const agent = AGENTS[1];
  container.innerHTML = `<div class="agent-panel">${skeletonPanelHtml()}</div>`;

  queryData('agent1', api.getAgent1, 60000).then(data => {
    if (State.activePanel !== 'agent1') return;
    renderAgent1(container, agent, data);
  }).catch(() => {
    if (State.activePanel !== 'agent1') return;
    container.innerHTML = `
      <div style="padding:24px;">
        <div class="card error-card">
          <span style="font-size:14px;color:var(--text-secondary);">Failed to load opportunity data. Check the API server.</span>
          <button class="btn-primary" id="agent1-retry-btn" style="flex-shrink:0;">Retry</button>
        </div>
      </div>`;
    const retryBtn = document.getElementById('agent1-retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => mountAgent1Panel(container));
  });
}

function renderAgent1(container, agent, data) {
  if (!data || data.length === 0) {
    container.innerHTML = `<div class="agent-panel">${emptyStateHtml({
      icon: Icon.trendingUp(32), title: 'No opportunity data',
      message: 'Run the pipeline to generate Agent 1 results',
      actionLabel: 'Run Pipeline', actionId: 'agent1-run-pipeline-btn',
    })}</div>`;
    const btn = document.getElementById('agent1-run-pipeline-btn');
    if (btn) btn.addEventListener('click', () => { api.runPipeline().catch(() => { }); });
    return;
  }

  const highCount = data.filter(d => d.opportunity_class === 'HIGH').length;
  const mediumCount = data.filter(d => d.opportunity_class === 'MEDIUM').length;
  const avgMomentum = (data.reduce((s, d) => s + Number(d.momentum_score), 0) / data.length).toFixed(1);

  const top8 = [...data].sort((a, b) => b.momentum_score - a.momentum_score).slice(0, 8)
    .map(d => ({ label: d.artist_name, value: Math.round(Number(d.momentum_score) * 10) / 10 }));
  const barChartData = top8.map(d => ({ ...d, color: d.value > 80 ? '#1D9E75' : d.value > 65 ? '#D4924A' : '#CC1B1B', valueLabel: d.value }));

  const territoryCounts = {};
  data.filter(d => d.opportunity_class === 'HIGH' || d.opportunity_class === 'MEDIUM').forEach(d => {
    const key = d.top_territory_1 || 'Other';
    territoryCounts[key] = (territoryCounts[key] || 0) + 1;
  });
  const territoryChartData = Object.entries(territoryCounts)
    .map(([key, value], i) => ({ label: TERRITORY_LABELS[key] || key, value, color: PALETTE_8[i % PALETTE_8.length] }))
    .sort((a, b) => b.value - a.value);

  const top3 = data.slice(0, 3);
  const maxMomentum = Math.max(...data.map(d => Number(d.momentum_score)));

  container.innerHTML = `
    <div class="agent-panel">
      ${panelHeaderHtml(agent, 'Identifies artists with the strongest commercial momentum across territories and platforms')}
      <div class="panel-kpis">
        ${kpiCardHtml({ label: 'ARTISTS ANALYZED', value: data.length, accentColor: '#1D9E75' })}
        ${kpiCardHtml({ label: 'HIGH OPPORTUNITIES', value: highCount, accentColor: '#1D9E75' })}
        ${kpiCardHtml({ label: 'MEDIUM OPPORTUNITIES', value: mediumCount, accentColor: '#D4924A' })}
        ${kpiCardHtml({ label: 'AVG MOMENTUM SCORE', value: `<span style="font-family:var(--font-mono);">${avgMomentum}</span>`, accentColor: '#1D9E75' })}
      </div>
      <div class="panel-scroll">
        <div class="grid-3">
          <div class="card chart-card">
            <span class="label">TOP ARTISTS — MOMENTUM SCORE</span>
            <div class="chart-box">${svgHBarChart(barChartData, { width: 380 })}</div>
          </div>
          <div class="card chart-card">
            <span class="label">TERRITORY DISTRIBUTION</span>
            <div class="chart-box">${svgDonutChart(territoryChartData, { size: 190 })}</div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="label">TOP 3 NARRATIVES</span>
            ${top3.map(a => narrativeCardHtml(a)).join('')}
          </div>
        </div>
        ${artistTableHtml(data, maxMomentum)}
      </div>
    </div>`;

  bindAgent1Events(data);
}

function narrativeCardHtml(artist) {
  const color = '#1D9E75';
  const badgeClass = artist.opportunity_class === 'HIGH' ? 'badge-green' : artist.opportunity_class === 'MEDIUM' ? 'badge-amber' : 'badge-muted';
  return `
    <div class="card narrative-card" style="border-left-color:${color};">
      <div class="flex items-start justify-between gap-3" style="margin-bottom:8px;">
        <div class="min-w-0">
          <div style="font-family:var(--font-display);font-weight:700;font-size:14px;" class="truncate">${esc(artist.artist_name)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${esc(artist.top_territory_1 || '')}${artist.top_territory_2 ? ' · ' + esc(artist.top_territory_2) : ''}</div>
        </div>
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <span style="font-family:var(--font-mono);font-weight:700;font-size:16px;color:${color};">${Number(artist.momentum_score).toFixed(1)}</span>
          <span class="badge ${badgeClass}">${esc(artist.opportunity_class)}</span>
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">${esc(artist.narrative || '')}</p>
      <button class="narrative-nav-link" data-artist-narrative-nav style="margin-top:12px;font-size:12px;font-weight:500;color:${color};background:none;border:none;padding:0;">View strategy →</button>
    </div>`;
}

function scoreBarColor(score) {
  if (score > 80) return '#1D9E75';
  if (score > 65) return '#D4924A';
  return '#CC1B1B';
}

function artistTableHtml(data, maxMomentum) {
  const rows = data.map(artist => {
    const momentum = Number(artist.momentum_score);
    const crossPlat = Number(artist.cross_platform_score);
    const badgeMap = { HIGH: 'badge-green', MEDIUM: 'badge-amber', WATCH: 'badge-muted', LOW: 'badge-muted' };
    return `
      <div class="discovery-body-item" data-artist-id="${esc(artist.artist_id)}">
        <button class="discovery-row-trigger" data-toggle-row="${esc(artist.artist_id)}">
          <div class="discovery-row-grid clickable">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">${esc(artist.rank)}</span>
            <span style="font-family:var(--font-display);font-weight:700;font-size:14px;" class="truncate">${esc(artist.artist_name)}</span>
            <span style="font-size:12px;color:var(--text-secondary);">${esc(artist.top_territory_1 || '')}</span>
            <div class="score-bar-cell"><div class="score-bar-track"><div class="score-bar-fill" style="width:${Math.min((momentum / maxMomentum) * 100, 100)}%;background:${scoreBarColor(momentum)};"></div></div><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);width:32px;text-align:right;">${momentum.toFixed(1)}</span></div>
            <div class="score-bar-cell"><div class="score-bar-track"><div class="score-bar-fill" style="width:${Math.min(crossPlat, 100)}%;background:${scoreBarColor(crossPlat)};"></div></div><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);width:32px;text-align:right;">${crossPlat.toFixed(1)}</span></div>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);">${Number(artist.risk_flag_score).toFixed(1)}</span>
            <div><span class="badge ${badgeMap[artist.opportunity_class] || 'badge-muted'}">${esc(artist.opportunity_class)}</span></div>
            <span style="font-size:11px;color:var(--text-muted);">${esc(artist.top_territory_2 || '—')}</span>
            <div class="flex justify-center"><span class="chevron" data-chevron="${esc(artist.artist_id)}">${Icon.chevronDown(12)}</span></div>
          </div>
        </button>
        <div class="discovery-narrative hidden" data-content="${esc(artist.artist_id)}">${esc(artist.narrative || '')}</div>
      </div>`;
  }).join('');

  return `
    <div class="card flat">
      <div style="padding:12px 16px;border-bottom:1px solid var(--hairline);"><span class="label">ALL ARTISTS — DISCOVERY TABLE</span></div>
      <div style="overflow-x:auto;">
        <div class="discovery-row-grid discovery-head" style="min-width:720px;">
          ${['#', 'ARTIST', 'TERR', 'MOMENTUM', 'CROSS-PLAT', 'RISK', 'OPPORTUNITY', 'TERR 2', ''].map(h => `<span class="label">${h}</span>`).join('')}
        </div>
        <div style="min-width:720px;">${rows}</div>
      </div>
    </div>`;
}

function bindAgent1Events(data) {
  document.querySelectorAll('[data-toggle-row]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle-row');
      const content = document.querySelector(`[data-content="${CSS.escape(id)}"]`);
      const chevron = document.querySelector(`[data-chevron="${CSS.escape(id)}"]`);
      const isOpen = content && !content.classList.contains('hidden');
      if (content) content.classList.toggle('hidden', isOpen);
      if (chevron) chevron.classList.toggle('open', !isOpen);
    });
  });
  document.querySelectorAll('[data-artist-narrative-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate('agent2'));
  });
}
/* ==========================================================================
   CDX — shared Chat panel (used inside Agent 2/3/4 panels)
   ========================================================================== */

const CONTINUE_LINKS = {
  agent2: { label: 'Continue to Audience-Fit →', target: 'agent3' },
  agent3: { label: 'Continue to ROI Forecast →', target: 'agent4' },
  agent4: { label: '← Back to overview', target: 'overview' },
};

function parseMessageContent(text) {
  if (!text) return [];
  const segments = [];
  const lines = String(text).split('\n');
  let listItems = [];
  const flushList = () => {
    if (listItems.length > 0) { segments.push({ type: 'list', items: [...listItems] }); listItems = []; }
  };
  lines.forEach((line, idx) => {
    const listMatch = line.match(/^[-*]\s+(.+)/);
    if (listMatch) { listItems.push(listMatch[1]); return; }
    flushList();
    if (line.trim() === '') { if (idx > 0) segments.push({ type: 'br' }); return; }
    const parts = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let last = 0, m;
    while ((m = boldRegex.exec(line)) !== null) {
      if (m.index > last) parts.push({ type: 'text', content: line.slice(last, m.index) });
      parts.push({ type: 'bold', content: m[1] });
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push({ type: 'text', content: line.slice(last) });
    segments.push({ type: 'inline', parts });
  });
  flushList();
  return segments;
}

function renderMessageContentHtml(text) {
  const segments = parseMessageContent(text);
  return segments.map(seg => {
    if (seg.type === 'br') return '<br>';
    if (seg.type === 'list') return `<ul>${seg.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (seg.type === 'inline') {
      return seg.parts.map(p => p.type === 'bold' ? `<strong>${esc(p.content)}</strong>` : esc(p.content)).join('');
    }
    return '';
  }).join('');
}

function messageBubbleHtml(message, accentColor) {
  if (message.role === 'user') {
    return `<div class="msg-row user"><div class="msg-bubble-user">${esc(message.content)}</div></div>`;
  }
  const providerColor = PROVIDER_COLORS[message.provider] || '#8A8A9A';
  return `
    <div class="msg-row assistant">
      <div class="msg-badge" style="background-color:${hexToRgba(accentColor, 0.1)};border-top-color:${hexToRgba(accentColor, 0.7)};color:${accentColor};">CD</div>
      <div class="msg-content" style="background-color:${hexToRgba(accentColor, 0.06)};border-left-color:${accentColor};${message.isError ? 'color:rgba(204,27,27,0.8);' : ''}">
        ${message.isError ? `<div class="msg-error-tag">${Icon.alertTriangle(12)}<span>Error</span></div>` : ''}
        <div class="msg-body">${renderMessageContentHtml(message.content)}</div>
        <div class="msg-meta">
          ${message.timestamp ? `<span class="msg-time">${fmtTime(message.timestamp)}</span>` : ''}
          ${message.modelLabel ? `<span class="msg-model-tag" style="color:${providerColor};background-color:${hexToRgba(providerColor, 0.15)};">${esc(shortModelLabel(message.modelLabel))}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function typingIndicatorHtml(modelLabel, accentColor) {
  return `
    <div class="typing-row">
      <div class="msg-badge" style="background-color:${hexToRgba(accentColor, 0.1)};border-top-color:${hexToRgba(accentColor, 0.7)};color:${accentColor};">CD</div>
      <div class="flex flex-col gap-1">
        <div class="typing-dots">
          ${[0, 1, 2].map(i => `<span class="typing-dot" style="background:${accentColor};animation-delay:${i * 0.2}s;"></span>`).join('')}
        </div>
        ${modelLabel ? `<span class="typing-label">Thinking with ${esc(modelLabel)}...</span>` : ''}
      </div>
    </div>`;
}

function modelSelectorHtml(agentKey, modelsData, selectedModelId, selectedProvider, accentColor) {
  const providers = (modelsData && modelsData.providers) || {};
  const providerIds = Object.keys(providers);
  if (providerIds.length === 0) {
    return `<div style="font-size:12px;color:var(--text-muted);padding:0 4px;">No models configured.</div>`;
  }
  const activeProvider = selectedProvider || providerIds[0];
  const activeModels = (providers[activeProvider] && providers[activeProvider].models) || [];

  const tabs = providerIds.length > 1
    ? `<div class="provider-tabs">${providerIds.map(pid => {
      const isActive = pid === activeProvider;
      const color = PROVIDER_COLORS[pid] || accentColor;
      return `<button class="provider-tab ${isActive ? 'active' : ''}" data-provider-tab="${esc(pid)}" style="background-color:${isActive ? color : 'var(--bg-surface2)'};">${esc((providers[pid] && providers[pid].label) || pid)}</button>`;
    }).join('')}</div>`
    : '';

  const select = `
    <select class="input" id="model-select-${agentKey}" style="height:30px;padding:4px 10px;font-size:12px;">
      ${activeModels.map(m => `<option value="${esc(m.id)}" ${m.id === selectedModelId ? 'selected' : ''}>${esc(m.label)} — ${esc(m.description || '')} (${esc(m.tier || '')})</option>`).join('')}
    </select>`;

  return `<div class="flex flex-col gap-2">${tabs}${select}</div>`;
}

function suggestedQuestionsHtml(questions) {
  return `<div class="suggested-grid">${questions.map(q => `<button class="suggested-q" data-suggested-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`;
}

/**
 * Builds and wires an interactive chat panel inside `hostEl`.
 * Returns a controller object with methods used by the parent agent panel.
 */
function createChatPanel(hostEl, opts) {
  const {
    agentKey, agentName, agentSub, accentColor,
    artistOptions = [], suggestedQuestions = [],
    onArtistMention, onContinue,
  } = opts;

  const state = {
    messages: [],
    sessionId: sessionStorage.getItem(`cdx_session_${agentKey}`) || null,
    isLoading: false,
    artistFilter: null,
    modelsData: null,
    selectedModelId: localStorage.getItem(`cdx_model_${agentKey}`) || null,
    selectedProvider: null,
    initialMessage: null,
  };

  function selectDefaultModel() {
    if (!state.modelsData) return;
    const providers = state.modelsData.providers || {};
    if (state.selectedModelId) {
      for (const [pid, cfg] of Object.entries(providers)) {
        if ((cfg.models || []).some(m => m.id === state.selectedModelId)) { state.selectedProvider = pid; return; }
      }
    }
    for (const [pid, cfg] of Object.entries(providers)) {
      const def = (cfg.models || []).find(m => m.default);
      if (def) { state.selectedModelId = def.id; state.selectedProvider = pid; localStorage.setItem(`cdx_model_${agentKey}`, def.id); return; }
    }
    const first = Object.entries(providers)[0];
    if (first) {
      const [pid, cfg] = first;
      const fm = (cfg.models || [])[0];
      if (fm) { state.selectedModelId = fm.id; state.selectedProvider = pid; localStorage.setItem(`cdx_model_${agentKey}`, fm.id); }
    }
  }

  function getSelectedModelLabel() {
    if (!state.modelsData || !state.selectedModelId) return state.selectedModelId || '';
    for (const cfg of Object.values(state.modelsData.providers || {})) {
      const m = (cfg.models || []).find(mm => mm.id === state.selectedModelId);
      if (m) return m.label;
    }
    return state.selectedModelId || '';
  }

  function renderShell() {
    const modelLabel = getSelectedModelLabel();
    const continueLink = CONTINUE_LINKS[agentKey];
    hostEl.innerHTML = `
      <div class="chat-panel">
        <div class="chat-header" style="border-top-color:${accentColor};">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="chat-header-title truncate">${esc(agentName)}</div>
              <div class="chat-header-sub">${esc(agentSub)}</div>
            </div>
            <button class="btn-icon flex-shrink-0" id="chat-clear-${agentKey}" title="Clear conversation">${Icon.trash(13)}</button>
          </div>
          <div id="model-selector-slot-${agentKey}">${modelSelectorHtml(agentKey, state.modelsData, state.selectedModelId, state.selectedProvider, accentColor)}</div>
          <div class="flex items-center gap-2">
            <select class="input" id="artist-filter-${agentKey}" style="height:28px;padding:4px 10px;font-size:12px;flex:1;">
              <option value="">All artists</option>
              ${artistOptions.map(name => `<option value="${esc(name)}" ${state.artistFilter === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}
            </select>
            ${state.artistFilter ? `<button class="artist-chip" id="artist-chip-clear-${agentKey}" style="background-color:${hexToRgba(accentColor, 0.13)};color:${accentColor};">${esc(state.artistFilter)} ×</button>` : ''}
          </div>
        </div>
        <div class="chat-messages" id="chat-messages-${agentKey}"></div>
        <div class="chat-input-bar">
          <div class="chat-input-row">
            <textarea class="input chat-textarea" id="chat-textarea-${agentKey}" rows="1" placeholder="Ask ${esc(agentName)}${modelLabel ? ' (' + esc(modelLabel) + ')' : ''}…" ${state.isLoading ? 'disabled' : ''}></textarea>
            <button class="btn-primary chat-send-btn" id="chat-send-${agentKey}" style="background-color:${state.isLoading ? hexToRgba(accentColor, 0.25) : accentColor};cursor:${state.isLoading ? 'not-allowed' : 'pointer'};" ${state.isLoading ? 'disabled' : ''}>Send</button>
          </div>
        </div>
      </div>`;
    renderMessages();
    bindShellEvents();
    if (state.initialMessage) {
      const ta = document.getElementById(`chat-textarea-${agentKey}`);
      if (ta) {
        ta.value = state.initialMessage;
        autosizeTextarea(ta);
        ta.focus();
      }
    }
  }

  function autosizeTextarea(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  function renderMessages() {
    const msgEl = document.getElementById(`chat-messages-${agentKey}`);
    if (!msgEl) return;
    const hasMessages = state.messages.length > 0;
    let html = '';
    if (!hasMessages && !state.isLoading) {
      html = suggestedQuestionsHtml(suggestedQuestions);
    } else {
      html = state.messages.map(m => messageBubbleHtml(m, accentColor)).join('');
      if (state.isLoading) html += typingIndicatorHtml(getSelectedModelLabel(), accentColor);
    }
    const continueLink = CONTINUE_LINKS[agentKey];
    if (hasMessages && !state.isLoading && continueLink) {
      html += `<div class="continue-link-wrap"><button class="continue-link" id="chat-continue-${agentKey}" style="color:${accentColor};">${esc(continueLink.label)}</button></div>`;
    }
    msgEl.innerHTML = html;
    bindMessageEvents();
    msgEl.scrollTop = msgEl.scrollHeight;
  }

  function bindMessageEvents() {
    document.querySelectorAll(`#chat-messages-${agentKey} [data-suggested-q]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-suggested-q');
        const ta = document.getElementById(`chat-textarea-${agentKey}`);
        if (ta) { ta.value = q; autosizeTextarea(ta); }
        handleSend();
      });
    });
    const contBtn = document.getElementById(`chat-continue-${agentKey}`);
    if (contBtn) {
      contBtn.addEventListener('click', () => {
        const link = CONTINUE_LINKS[agentKey];
        if (onContinue) onContinue(link.target);
        else navigate(link.target);
      });
    }
  }

  function bindShellEvents() {
    const clearBtn = document.getElementById(`chat-clear-${agentKey}`);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);

    document.querySelectorAll(`#model-selector-slot-${agentKey} [data-provider-tab]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-provider-tab');
        const cfg = (state.modelsData.providers || {})[pid];
        const def = (cfg.models || []).find(m => m.default) || (cfg.models || [])[0];
        if (def) {
          state.selectedModelId = def.id; state.selectedProvider = pid;
          localStorage.setItem(`cdx_model_${agentKey}`, def.id);
        }
        refreshModelSelector();
      });
    });
    const modelSelect = document.getElementById(`model-select-${agentKey}`);
    if (modelSelect) {
      modelSelect.addEventListener('change', e => {
        state.selectedModelId = e.target.value;
        localStorage.setItem(`cdx_model_${agentKey}`, state.selectedModelId);
      });
    }

    const artistSelect = document.getElementById(`artist-filter-${agentKey}`);
    if (artistSelect) {
      artistSelect.addEventListener('change', e => {
        state.artistFilter = e.target.value || null;
        refreshArtistFilterRow();
      });
    }
    const chipClear = document.getElementById(`artist-chip-clear-${agentKey}`);
    if (chipClear) chipClear.addEventListener('click', () => { state.artistFilter = null; refreshArtistFilterRow(); });

    const ta = document.getElementById(`chat-textarea-${agentKey}`);
    if (ta) {
      ta.addEventListener('input', () => autosizeTextarea(ta));
      ta.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
      });
    }
    const sendBtn = document.getElementById(`chat-send-${agentKey}`);
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
  }

  function refreshModelSelector() {
    const slot = document.getElementById(`model-selector-slot-${agentKey}`);
    if (slot) slot.innerHTML = modelSelectorHtml(agentKey, state.modelsData, state.selectedModelId, state.selectedProvider, accentColor);
    bindShellEvents();
    const ta = document.getElementById(`chat-textarea-${agentKey}`);
    if (ta) ta.placeholder = `Ask ${agentName}${getSelectedModelLabel() ? ' (' + getSelectedModelLabel() + ')' : ''}…`;
  }

  function refreshArtistFilterRow() {
    renderShell();
  }

  function handleSend() {
    const ta = document.getElementById(`chat-textarea-${agentKey}`);
    if (!ta) return;
    const text = ta.value.trim();
    if (!text || state.isLoading) return;
    ta.value = '';
    ta.style.height = 'auto';
    sendMessage(text);
  }

  function sendMessage(text) {
    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() };
    state.messages.push(userMsg);
    state.isLoading = true;
    renderMessages();
    setSendingUi(true);

    api.sendChat(agentKey, {
      message: text,
      model_id: state.selectedModelId,
      artist_filter: state.artistFilter || '',
      session_id: state.sessionId || undefined,
    }).then(resp => {
      if (resp.session_id) {
        state.sessionId = resp.session_id;
        sessionStorage.setItem(`cdx_session_${agentKey}`, resp.session_id);
      }
      localStorage.setItem(`cdx_has_chat_${agentKey}`, '1');
      updateWorkflowBanner();

      const assistantMsg = {
        id: `a_${Date.now()}`, role: 'assistant', content: resp.reply,
        modelId: resp.model_id, modelLabel: resp.model_label, provider: resp.provider,
        timestamp: resp.timestamp || new Date().toISOString(), isError: !!resp.error,
      };
      state.messages.push(assistantMsg);
      state.isLoading = false;
      renderMessages();
      setSendingUi(false);

      if (!assistantMsg.isError && onArtistMention && artistOptions.length > 0) {
        const replyLower = (assistantMsg.content || '').toLowerCase();
        const mentioned = artistOptions.find(name => replyLower.includes(name.toLowerCase()));
        if (mentioned) onArtistMention(mentioned);
      }
    }).catch(() => {
      state.messages.push({
        id: `e_${Date.now()}`, role: 'assistant',
        content: 'Failed to connect. Check the API server is running.',
        timestamp: new Date().toISOString(), isError: true,
      });
      state.isLoading = false;
      renderMessages();
      setSendingUi(false);
    });
  }

  function setSendingUi(loading) {
    const ta = document.getElementById(`chat-textarea-${agentKey}`);
    const sendBtn = document.getElementById(`chat-send-${agentKey}`);
    if (ta) ta.disabled = loading;
    if (sendBtn) {
      sendBtn.disabled = loading;
      sendBtn.style.backgroundColor = loading ? hexToRgba(accentColor, 0.25) : accentColor;
      sendBtn.style.cursor = loading ? 'not-allowed' : 'pointer';
    }
  }

  function clearChat() {
    if (state.sessionId) api.clearChat(state.sessionId).catch(() => { });
    state.messages = [];
    state.sessionId = null;
    sessionStorage.removeItem(`cdx_session_${agentKey}`);
    localStorage.removeItem(`cdx_has_chat_${agentKey}`);
    updateWorkflowBanner();
    renderShell();
  }

  // init: fetch models then render
  queryData('models', api.getModels, 24 * 3600 * 1000).then(modelsData => {
    state.modelsData = modelsData;
    selectDefaultModel();
    refreshModelSelector();
  }).catch(() => { });

  renderShell();

  return {
    hasMessages: () => state.messages.length > 0,
    setArtistFilter(name) {
      state.artistFilter = name;
      refreshArtistFilterRow();
    },
    setInitialMessage(text) {
      state.initialMessage = text;
      const ta = document.getElementById(`chat-textarea-${agentKey}`);
      if (ta) { ta.value = text; autosizeTextarea(ta); ta.focus(); }
    },
  };
}
/* ==========================================================================
   CDX — Agent 2/3/4 split panels (chat + analytics)
   ========================================================================== */

/* ---------- Agent 2: Strategy Synthesis analytics ---------- */
const BRAND_CATEGORIES_A2 = ['Tech', 'Fashion', 'Beverage', 'Travel', 'Beauty'];
const AGENT2_COLOR = '#8B7FE8';

function matrixCellStyle(score, isActive) {
  if (!isActive) return `background:var(--bg-surface2);color:var(--text-muted);`;
  if (score >= 85) return `background:#1D9E7520;color:#1D9E75;border:1px solid #1D9E7540;`;
  if (score >= 70) return `background:#4A9EE820;color:#4A9EE8;border:1px solid #4A9EE840;`;
  if (score >= 55) return `background:#D4924A20;color:#D4924A;border:1px solid #D4924A40;`;
  return `background:#CC1B1B15;color:#CC1B1B;border:1px solid #CC1B1B30;`;
}
function sentimentBadgeHtml(risk) {
  if (risk === 'none') return `<span class="badge badge-green">None</span>`;
  if (risk === 'low') return `<span class="badge badge-amber">Low</span>`;
  if (risk === 'medium') return `<span class="badge badge-amber">Medium</span>`;
  return `<span class="badge badge-red">${esc(risk)}</span>`;
}

function renderAgent2Analytics(container, data, artistFocus, onAskAgent) {
  const agent = AGENTS[2];
  if (!data) { container.innerHTML = skeletonPanelHtml(); return; }
  if (data.length === 0) {
    container.innerHTML = emptyStateHtml({ title: 'No strategy data', message: 'Run the pipeline to generate Agent 2 results' });
    return;
  }
  const avgFitScore = (data.reduce((s, d) => s + Number(d.brand_fit_score), 0) / data.length).toFixed(1);
  const categoryCounts = {};
  data.forEach(d => { categoryCounts[d.best_brand_category] = (categoryCounts[d.best_brand_category] || 0) + 1; });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const noRiskCount = data.filter(d => d.sentiment_risk === 'none').length;

  const matrixRows = data.map(artist => {
    const isHl = artistFocus === artist.artist_name;
    return `
      <tr style="${isHl ? `background-color:${hexToRgba(AGENT2_COLOR, 0.06)};box-shadow:inset 2px 0 0 ${AGENT2_COLOR};` : ''}">
        <td style="font-family:var(--font-display);font-weight:700;white-space:nowrap;">${esc(artist.artist_name)}</td>
        ${BRAND_CATEGORIES_A2.map(cat => {
      const isActive = artist.best_brand_category === cat;
      const score = isActive ? Number(artist.brand_fit_score) : 0;
      return `<td><span class="matrix-cell" style="${matrixCellStyle(score, isActive)}">${isActive ? score.toFixed(0) : '—'}</span></td>`;
    }).join('')}
      </tr>`;
  }).join('');

  const briefCards = data.map(artist => {
    const isHl = artistFocus === artist.artist_name;
    const pillars = [artist.activation_pillar_1, artist.activation_pillar_2, artist.activation_pillar_3].filter(Boolean);
    return `
      <div class="card brief-card" data-artist-card="${esc(artist.artist_name)}" style="${isHl ? `border-color:${AGENT2_COLOR};box-shadow:0 0 0 1px ${hexToRgba(AGENT2_COLOR, 0.4)};` : ''}">
        <div class="flex items-start justify-between gap-3" style="margin-bottom:8px;">
          <div class="min-w-0">
            <div style="font-family:var(--font-display);font-weight:700;">${esc(artist.artist_name)}</div>
            <div class="flex wrap gap-1" style="margin-top:4px;">
              <span class="badge" style="background-color:${hexToRgba(AGENT2_COLOR, 0.13)};color:${AGENT2_COLOR};">${esc(artist.best_brand_category || '')}</span>
              <span class="badge badge-muted">${esc(artist.recommended_channel || '')}</span>
              ${sentimentBadgeHtml(artist.sentiment_risk)}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span style="font-family:var(--font-mono);font-weight:700;font-size:18px;color:${AGENT2_COLOR};">${Number(artist.brand_fit_score).toFixed(0)}</span>
            <button class="btn-icon ask-btn" data-ask-agent="${esc(artist.artist_name)}" title="Ask agent about ${esc(artist.artist_name)}">${Icon.messageSquare(13)}</button>
          </div>
        </div>
        <div class="flex wrap gap-1" style="margin-bottom:8px;">
          ${pillars.map(p => `<span class="badge badge-muted" style="color:var(--text-secondary);">${esc(p)}</span>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">${esc(artist.strategic_brief || '')}</p>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="flex flex-col" style="overflow:hidden;">
      ${panelHeaderHtml(agent, 'Brand-artist fit scores, activation strategies, and cultural briefs')}
      <div class="panel-kpis">
        ${kpiCardHtml({ label: 'BRIEFS GENERATED', value: data.length, accentColor: AGENT2_COLOR })}
        ${kpiCardHtml({ label: 'AVG BRAND FIT SCORE', value: avgFitScore, accentColor: AGENT2_COLOR, watermarkChar: '%' })}
        ${kpiCardHtml({ label: 'TOP BRAND CATEGORY', value: topCategory, accentColor: AGENT2_COLOR })}
        ${kpiCardHtml({ label: 'NO SENTIMENT RISK', value: noRiskCount, accentColor: '#1D9E75' })}
      </div>
      <div class="panel-scroll">
        <div class="card flat">
          <div style="padding:12px 16px;border-bottom:1px solid var(--hairline);"><span class="label">BRAND-ARTIST FIT MATRIX</span></div>
          <div style="overflow-x:auto;">
            <table class="data-table matrix-table" style="min-width:560px;">
              <thead><tr><th>ARTIST</th>${BRAND_CATEGORIES_A2.map(c => `<th style="width:80px;">${c.toUpperCase()}</th>`).join('')}</tr></thead>
              <tbody>${matrixRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <span class="label">STRATEGY BRIEFS</span>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:12px;">${briefCards}</div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-ask-agent]').forEach(btn => {
    btn.addEventListener('click', () => onAskAgent(btn.getAttribute('data-ask-agent')));
  });
  scrollToFocusedArtist(artistFocus, '[data-artist-card]');
}

/* ---------- Agent 3: Audience-Fit analytics ---------- */
const AGENT3_COLOR = '#4A9EE8';

function confidenceBadgeHtml(level) {
  if (level === 'HIGH') return `<span class="badge badge-green">HIGH</span>`;
  if (level === 'MEDIUM') return `<span class="badge badge-amber">MEDIUM</span>`;
  return `<span class="badge badge-red">LOW</span>`;
}

function renderAgent3Analytics(container, data, artistFocus, onAskAgent) {
  const agent = AGENTS[3];
  if (!data) { container.innerHTML = skeletonPanelHtml(); return; }
  if (data.length === 0) {
    container.innerHTML = emptyStateHtml({ title: 'No audience data', message: 'Run the pipeline to generate Agent 3 results' });
    return;
  }

  const totalReach = data.reduce((s, d) => s + Number(d.total_reach || 0), 0);
  const avgFitScore = (data.reduce((s, d) => s + Number(d.audience_fit_score || 0), 0) / data.length).toFixed(1);
  const highConfCount = data.filter(d => d.data_confidence === 'HIGH').length;
  const avgProxyPct = (data.reduce((s, d) => s + Number(d.proxy_pct || 0), 0) / data.length).toFixed(1);

  const marketCounts = {};
  data.forEach(d => { if (d.primary_market) marketCounts[d.primary_market] = (marketCounts[d.primary_market] || 0) + 1; });
  const primaryMarket = Object.entries(marketCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const marketReach = {};
  data.forEach(d => { const mkt = d.primary_market || 'Other'; marketReach[mkt] = (marketReach[mkt] || 0) + Number(d.total_reach || 0); });
  const marketChartData = Object.entries(marketReach).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([market, reach], i) => ({ label: market, value: reach, valueLabel: fmtReach(reach), color: hexToRgba(AGENT3_COLOR, 1 - i * 0.08) }));

  const showProxyWarning = Number(avgProxyPct) > 30;

  const rows = data.map(artist => {
    const isHl = artistFocus === artist.artist_name;
    return `
      <tr class="audience-row" data-artist-row="${esc(artist.artist_name)}" style="${isHl ? `background-color:${hexToRgba(AGENT3_COLOR, 0.06)};box-shadow:inset 2px 0 0 ${AGENT3_COLOR};` : ''}">
        <td style="font-family:var(--font-display);font-weight:700;">${esc(artist.artist_name)}</td>
        <td style="color:var(--text-secondary);">${esc(artist.primary_market || '—')}</td>
        <td style="color:var(--text-muted);">${esc(artist.secondary_market || '—')}</td>
        <td style="font-family:var(--font-mono);color:var(--text-secondary);">${fmtReach(artist.total_reach)}</td>
        <td style="color:var(--text-muted);">${esc(artist.primary_platform || '—')}</td>
        <td style="font-family:var(--font-mono);color:${AGENT3_COLOR};">${Number(artist.audience_fit_score).toFixed(0)}</td>
        <td>${confidenceBadgeHtml(artist.data_confidence)}</td>
        <td style="font-family:var(--font-mono);color:var(--text-muted);">${Number(artist.proxy_pct).toFixed(0)}%</td>
        <td><button class="btn-icon sm ask-btn" data-ask-agent="${esc(artist.artist_name)}" title="Ask agent about ${esc(artist.artist_name)}">${Icon.messageSquare(11)}</button></td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="flex flex-col" style="overflow:hidden;">
      ${panelHeaderHtml(agent, 'Audience demographics, reach, platform affinity, and data confidence scores')}
      <div class="panel-kpis">
        ${kpiCardHtml({ label: 'TOTAL REACH', value: fmtReach(totalReach), accentColor: AGENT3_COLOR, watermarkChar: '◎' })}
        ${kpiCardHtml({ label: 'PRIMARY MARKET', value: primaryMarket, accentColor: AGENT3_COLOR })}
        ${kpiCardHtml({ label: 'AVG AUDIENCE FIT', value: avgFitScore, accentColor: AGENT3_COLOR })}
        ${kpiCardHtml({ label: 'HIGH CONFIDENCE', value: highConfCount, accentColor: '#1D9E75' })}
      </div>
      <div class="panel-scroll">
        ${showProxyWarning ? `
          <div class="warning-box" style="background:#D4924A10;border-color:#D4924A40;color:#D4924A;">
            <span class="flex-shrink-0">${Icon.alertTriangle(14)}</span>
            <span><strong>${avgProxyPct}%</strong> of audience data is proxy-estimated. Treat reach figures as approximations, not confirmed measurements.</span>
          </div>` : ''}
        <div class="card">
          <span class="label">MARKET REACH DISTRIBUTION</span>
          <div class="chart-box" style="height:200px;margin-top:12px;">${svgHBarChart(marketChartData, { width: 560, leftPad: 48 })}</div>
        </div>
        <div class="card flat">
          <div style="padding:12px 16px;border-bottom:1px solid var(--hairline);"><span class="label">AUDIENCE PROFILES</span></div>
          <div style="overflow-x:auto;">
            <table class="data-table audience-table" style="min-width:680px;">
              <thead><tr>${['ARTIST', 'PRIMARY MKT', 'SECONDARY', 'TOTAL REACH', 'PLATFORM', 'FIT SCORE', 'CONFIDENCE', 'PROXY %', ''].map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-ask-agent]').forEach(btn => {
    btn.addEventListener('click', () => onAskAgent(btn.getAttribute('data-ask-agent')));
  });
  scrollToFocusedArtist(artistFocus, '[data-artist-row]');
}

/* ---------- Agent 4: ROI Forecast analytics ---------- */
const AGENT4_COLOR = '#D4924A';

function riskBadgeHtml(flag) {
  if (!flag || flag === 'none' || flag === false) return '';
  return `<span class="badge badge-red">RISK FLAG</span>`;
}

function renderAgent4Analytics(container, data, artistFocus, onAskAgent) {
  const agent = AGENTS[4];
  if (!data) { container.innerHTML = skeletonPanelHtml(); return; }
  if (data.length === 0) {
    container.innerHTML = emptyStateHtml({ title: 'No ROI forecast data', message: 'Run the pipeline to generate Agent 4 results' });
    return;
  }

  const avgBaseRoi = (data.reduce((s, d) => s + Number(d.base_roi || 0), 0) / data.length).toFixed(2);
  const topArtist = [...data].sort((a, b) => Number(b.base_roi) - Number(a.base_roi))[0];
  const totalRevenue = data.reduce((s, d) => s + Number(d.base_revenue || 0), 0);
  const riskCount = data.filter(d => d.risk_flag && d.risk_flag !== 'none').length;

  const categories = data.map(d => String(d.artist_name).split(' ').slice(-1)[0]);
  const series = [
    { key: 'conservative', label: 'Conservative', color: '#4A9EE8', width: 1.5, dashed: '4 2', values: data.map(d => Number(d.conservative_roi)) },
    { key: 'base', label: 'Base', color: AGENT4_COLOR, width: 2, dots: true, values: data.map(d => Number(d.base_roi)) },
    { key: 'optimistic', label: 'Optimistic', color: '#1D9E75', width: 1.5, dashed: '2 2', values: data.map(d => Number(d.optimistic_roi)) },
  ];

  const scenarios = cacheGet('roi_scenarios');

  const scenarioRows = (scenarios && scenarios.length > 0) ? data.map(artist => `
    <tr>
      <td style="font-family:var(--font-display);font-weight:700;white-space:nowrap;">${esc(artist.artist_name)}</td>
      <td><div class="scenario-cell" style="background:var(--bg-surface2);"><span class="val" style="color:#8A8A9A;">${Number(artist.conservative_roi).toFixed(2)}×</span></div></td>
      <td><div class="scenario-cell" style="background:#D4924A15;border:1px solid #D4924A40;"><span class="val" style="color:${AGENT4_COLOR};">${Number(artist.base_roi).toFixed(2)}×</span></div></td>
      <td><div class="scenario-cell" style="background:var(--bg-surface2);"><span class="val" style="color:#8A8A9A;">${Number(artist.optimistic_roi).toFixed(2)}×</span></div></td>
      <td><span class="badge badge-amber" style="text-transform:uppercase;">${esc(artist.recommended_scenario || '')}</span></td>
    </tr>`).join('') : '';

  const investmentCards = [...data].sort((a, b) => Number(b.base_roi) - Number(a.base_roi)).slice(0, 3).map(artist => {
    const isHl = artistFocus === artist.artist_name;
    const assumptions = [artist.assumption_1, artist.assumption_2, artist.assumption_3].filter(Boolean);
    return `
      <div class="card investment-card" data-artist-card="${esc(artist.artist_name)}" style="${isHl ? `border-color:${AGENT4_COLOR};box-shadow:0 0 0 1px ${hexToRgba(AGENT4_COLOR, 0.4)};` : ''}">
        <div class="flex items-start justify-between gap-3" style="margin-bottom:8px;">
          <div class="min-w-0">
            <div style="font-family:var(--font-display);font-weight:700;">${esc(artist.artist_name)}</div>
            <div class="flex wrap items-center gap-1" style="margin-top:4px;">
              <span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:${AGENT4_COLOR};">${Number(artist.base_roi).toFixed(2)}× base ROI</span>
              <span class="badge badge-muted">${esc(artist.brand_category || '')}</span>
              ${riskBadgeHtml(artist.risk_flag)}
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);">${fmtCurrency(artist.base_revenue)}</span>
            <button class="btn-icon ask-btn" data-ask-agent="${esc(artist.artist_name)}" title="Ask agent about ${esc(artist.artist_name)}">${Icon.messageSquare(13)}</button>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:8px;">${esc(artist.investment_narrative || '')}</p>
        <div style="display:flex;flex-direction:column;gap:2px;">
          ${assumptions.map(a => `<div class="assumption-line"><span style="color:${AGENT4_COLOR};flex-shrink:0;">•</span><span>${esc(a)}</span></div>`).join('')}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="flex flex-col" style="overflow:hidden;">
      ${panelHeaderHtml(agent, 'Investment scenarios, projected ROI, and financial risk assessment')}
      <div class="panel-kpis">
        ${kpiCardHtml({ label: 'AVG BASE ROI', value: `${avgBaseRoi}×`, accentColor: AGENT4_COLOR, watermarkChar: '×' })}
        ${kpiCardHtml({ label: 'HIGHEST ROI ARTIST', value: esc((topArtist && topArtist.artist_name && topArtist.artist_name.split(' ')[0]) || '—'), accentColor: AGENT4_COLOR })}
        ${kpiCardHtml({ label: 'TOTAL PROJECTED REVENUE', value: fmtCurrency(totalRevenue), accentColor: AGENT4_COLOR })}
        ${kpiCardHtml({ label: 'RISK FLAGS', value: riskCount, accentColor: riskCount > 0 ? '#CC1B1B' : '#1D9E75' })}
      </div>
      <div class="panel-scroll">
        <div class="card">
          <span class="label">ROI SCENARIO FORECAST — CONSERVATIVE / BASE / OPTIMISTIC</span>
          <div class="chart-box" style="height:220px;margin-top:12px;">${svgLineChart(series, categories, { width: 640, height: 220 })}</div>
        </div>
        ${scenarioRows ? `
        <div class="card flat">
          <div style="padding:12px 16px;border-bottom:1px solid var(--hairline);"><span class="label">SCENARIO COMPARISON</span></div>
          <div style="overflow-x:auto;">
            <table class="data-table" style="min-width:560px;">
              <thead><tr><th>ARTIST</th><th style="text-align:center;">CONSERVATIVE</th><th style="text-align:center;color:${AGENT4_COLOR};">BASE ▲</th><th style="text-align:center;">OPTIMISTIC</th><th>RECOMMENDED</th></tr></thead>
              <tbody>${scenarioRows}</tbody>
            </table>
          </div>
        </div>` : ''}
        <div>
          <span class="label">TOP INVESTMENT RECOMMENDATIONS</span>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:12px;">${investmentCards}</div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-ask-agent]').forEach(btn => {
    btn.addEventListener('click', () => onAskAgent(btn.getAttribute('data-ask-agent')));
  });
  scrollToFocusedArtist(artistFocus, '[data-artist-card]');

  // fetch scenarios (not blocking initial render) and re-render table once available
  if (!scenarios) {
    queryData('roi_scenarios', api.getRoiScenarios, 60000).then(() => {
      if (State.activePanel === 'agent4') renderAgent4Analytics(container, data, artistFocus, onAskAgent);
    }).catch(() => { });
  }
}

function scrollToFocusedArtist(artistFocus, selector) {
  if (!artistFocus) return;
  document.querySelectorAll(selector).forEach(el => {
    const key = el.getAttribute('data-artist-card') || el.getAttribute('data-artist-row');
    if (key === artistFocus) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ==========================================================================
   Split panel mount (chat + analytics) — used for agent2/3/4
   ========================================================================== */
function mountAgentChatPanel(container, agentNum) {
  const agentKey = `agent${agentNum}`;
  const agent = AGENTS[agentNum];
  const colorMap = { 2: AGENT2_COLOR, 3: AGENT3_COLOR, 4: AGENT4_COLOR };
  const accent = colorMap[agentNum];
  const fetchMap = { 2: api.getAgent2, 3: api.getAgent3, 4: api.getAgent4 };
  const renderMap = { 2: renderAgent2Analytics, 3: renderAgent3Analytics, 4: renderAgent4Analytics };
  const askPrompts = {
    2: name => `Tell me about the brand strategy for ${name}`,
    3: name => `Summarize the audience profile for ${name}`,
    4: name => `Walk me through the ROI forecast for ${name}`,
  };

  let mobileView = 'chat';
  let artistFocus = null;
  let chatData = null;

  const carryover = sessionStorage.getItem('cdx_artist_carryover');
  if (carryover) { artistFocus = carryover; sessionStorage.removeItem('cdx_artist_carryover'); }

  container.innerHTML = `
    <div class="agent-split">
      <div class="mobile-tabs">
        <button data-mobile-view="chat">💬 Chat</button>
        <button data-mobile-view="analytics">📊 Analytics</button>
      </div>
      <div class="split-body">
        <div class="split-chat" id="split-chat-${agentKey}"></div>
        <div class="split-analytics" id="split-analytics-${agentKey}"></div>
      </div>
    </div>`;

  const chatHost = document.getElementById(`split-chat-${agentKey}`);
  const analyticsHost = document.getElementById(`split-analytics-${agentKey}`);

  function updateMobileTabsUi() {
    container.querySelectorAll('[data-mobile-view]').forEach(btn => {
      const view = btn.getAttribute('data-mobile-view');
      const active = view === mobileView;
      btn.style.color = active ? accent : 'var(--text-secondary)';
      btn.style.borderBottomColor = active ? accent : 'transparent';
    });
    chatHost.classList.toggle('mobile-hidden', mobileView !== 'chat');
    analyticsHost.classList.toggle('mobile-hidden', mobileView !== 'analytics');
    updateFab();
  }

  function updateFab() {
    const existing = document.getElementById(`mobile-fab-${agentKey}`);
    if (existing) existing.remove();
    if (mobileView === 'analytics') {
      const fab = document.createElement('button');
      fab.className = 'mobile-fab';
      fab.id = `mobile-fab-${agentKey}`;
      fab.style.background = accent;
      fab.innerHTML = `<span style="color:#fff;">${Icon.messageSquare(22)}</span>${chatController && chatController.hasMessages() ? '<span class="fab-dot"></span>' : ''}`;
      fab.addEventListener('click', () => { mobileView = 'chat'; updateMobileTabsUi(); });
      container.appendChild(fab);
    }
  }

  container.querySelectorAll('[data-mobile-view]').forEach(btn => {
    btn.addEventListener('click', () => { mobileView = btn.getAttribute('data-mobile-view'); updateMobileTabsUi(); });
  });

  analyticsHost.innerHTML = skeletonPanelHtml();

  let chatController = null;

  function handleAskAgent(name) {
    artistFocus = name;
    chatController && chatController.setArtistFilter(name);
    chatController && chatController.setInitialMessage(askPrompts[agentNum](name));
    mobileView = 'chat';
    updateMobileTabsUi();
  }

  function handleArtistMention(name) {
    artistFocus = name;
    if (chatData) renderMap[agentNum](analyticsHost, chatData, artistFocus, handleAskAgent);
  }

  function handleContinue(target) {
    if (artistFocus) sessionStorage.setItem('cdx_artist_carryover', artistFocus);
    navigate(target);
  }

  queryData(agentKey, fetchMap[agentNum], 60000).then(data => {
    chatData = data;
    if (State.activePanel !== agentKey) return;
    const artistOptions = (data || []).map(a => a.artist_name);

    chatController = createChatPanel(chatHost, {
      agentKey, agentName: agent.name, agentSub: agent.sub, accentColor: accent,
      artistOptions, suggestedQuestions: AGENT_SUGGESTIONS[agentKey] || [],
      onArtistMention: handleArtistMention, onContinue: handleContinue,
    });
    if (artistFocus) chatController.setArtistFilter(artistFocus);

    renderMap[agentNum](analyticsHost, data, artistFocus, handleAskAgent);
    updateMobileTabsUi();
  }).catch(() => {
    if (State.activePanel !== agentKey) return;
    chatController = createChatPanel(chatHost, {
      agentKey, agentName: agent.name, agentSub: agent.sub, accentColor: accent,
      artistOptions: [], suggestedQuestions: AGENT_SUGGESTIONS[agentKey] || [],
      onArtistMention: handleArtistMention, onContinue: handleContinue,
    });
    analyticsHost.innerHTML = emptyStateHtml({ title: 'Could not load data', message: 'Check the API server and try again.' });
    updateMobileTabsUi();
  });

  updateMobileTabsUi();
}
/* ==========================================================================
   CDX — main bootstrap
   ========================================================================== */

const ICON_SVG_MARKUP = `<svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="19" r="3.5" fill="#00D2A0" />
  <circle cx="32" cy="32" r="5.5" fill="#00C9C8" />
  <circle cx="32" cy="45" r="3.5" fill="#00C9C8" />
  <circle cx="32" cy="54" r="2" fill="#00C9C8" />
  <circle cx="43" cy="23" r="3" fill="#00B4F0" />
  <circle cx="43" cy="32" r="3" fill="#00B4F0" />
  <circle cx="43" cy="41" r="3" fill="#00B4F0" />
  <circle cx="51" cy="32" r="2" fill="#0096FF" />
  <circle cx="21" cy="23" r="3" fill="#00D2A0" />
  <circle cx="21" cy="32" r="3" fill="#00D2A0" />
  <circle cx="21" cy="41" r="3" fill="#00D2A0" />
  <circle cx="13" cy="32" r="2" fill="#00D2A0" />
  <circle cx="21" cy="12" r="2" fill="#00D2A0" />
  <circle cx="43" cy="12" r="2" fill="#00B4F0" />
  <circle cx="21" cy="52" r="2" fill="#00D2A0" />
  <circle cx="43" cy="52" r="2" fill="#00B4F0" />
</svg>`;

const LOGO_SVG_MARKUP = `<span style="display:inline-flex;align-items:center;gap:10px;">${ICON_SVG_MARKUP.replace('width="22" height="22"', 'width="26" height="26"')}<span style="font-family:var(--font-display);font-weight:700;font-size:17px;letter-spacing:-0.01em;color:var(--text-primary);">Chromadata</span></span>`;

/* ---------- boot ---------- */
function initApp() {
  setTheme(getIsDark());
  mountShell();
  checkServerHealth().then(() => {
    layoutMain();
    // health-gated banner may change main height after header/banner already mounted
    const bannerVisible = State.serverDown && !State.bannerDismissed;
    document.getElementById('main-content').style.height = bannerVisible
      ? 'calc(100vh - 112px - 37px)' : 'calc(100vh - 112px)';
  });

  queryData('summary', api.getSummary, 30000).then(summary => {
    State.summary = summary;
    updateWorkflowBanner();
  }).catch(() => { });

  navigate('overview');
}

document.addEventListener('DOMContentLoaded', initApp);
