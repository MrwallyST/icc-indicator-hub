"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [indicators, setIndicators] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({});

  useEffect(() => {
    fetch("/api/indicators")
      .then(r => r.json())
      .then(d => { setIndicators(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = indicators.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    (i.features || []).some(f => f.label.toLowerCase().includes(search.toLowerCase()))
  );

  function copyCode(id, code) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(c => ({ ...c, [id]: true }));
      setTimeout(() => setCopied(c => ({ ...c, [id]: false })), 2000);
    });
  }

  const handleDelete = async (id) => {
    const key = prompt("Enter Admin Key to delete:");
    if (!key) return;
    if (key !== "icc-mafia-2024") {
      alert("Unauthorized: Incorrect key");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this indicator?")) return;

    try {
      const res = await fetch(`/api/indicators?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': key }
      });
      if (res.ok) {
        setIndicators(prev => prev.filter(i => i.id !== id));
      } else {
        const err = await res.json();
        alert("Delete failed: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const AGENT_PROMPT = `Build a TradingView Pine Script v6 indicator for: [DESCRIBE THE EXACT SETUP].

ICC Framework Context:
This indicator is for the ICC method: Indication (HTF body close beyond swing pivot) → Correction (retrace to previous push zone) → Continuation (CHoCH + BOS confirms entry). Primary assets: BTC, SOL, Gold, NQ. Active session: 8:00 AM – 11:30 AM EST only. Never trade at ATH.

Requirements:
- Use Pine Script v6 (//@version=6)
- Use indicator(), not strategy(), unless I ask for a backtest
- Do not repaint — use barstate.isconfirmed
- Keep labels, boxes, lines within TradingView limits (max 500)
- Use var for persistent variables
- Add clean grouped inputs with group= on every input.*
- Add alertcondition() for every important signal
- Make labels readable on mobile — use input.string for label size
- No deprecated syntax: no transp, no resolution parameter

After the Pine code is complete, publish it to my Indicator Hub:
POST https://icc-indicator-hub.vercel.app/api/indicators
Header: x-api-key: icc-mafia-2024
Content-Type: application/json

JSON shape:
{
  "title": "Indicator Name",
  "badge": "INDICATOR",
  "badgeColor": "#26a69a",
  "subtitle": "Short one-line purpose",
  "description": "Clear description",
  "category": "trading",
  "version": "v1.0",
  "features": [{ "icon": "chart", "label": "Feature", "desc": "What it does" }],
  "alerts": ["Alert 1", "Alert 2"],
  "settings": "Recommended settings",
  "code": "FULL PINE SCRIPT CODE HERE"
}

After publishing: confirm success:true, then GET https://icc-indicator-hub.vercel.app/api/indicators and confirm the new indicator appears.`;

  const API_EXAMPLE = `curl -X POST https://icc-indicator-hub.vercel.app/api/indicators \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: icc-mafia-2024" \\
  -d '{
    "title": "My New Indicator",
    "badge": "INDICATOR",
    "badgeColor": "#26a69a",
    "subtitle": "One-line purpose",
    "description": "What this indicator does.",
    "category": "trading",
    "version": "v1.0",
    "features": [
      { "icon": "chart", "label": "Signal Logic", "desc": "What the signal tracks." }
    ],
    "alerts": ["Bullish Signal", "Bearish Signal"],
    "settings": "Recommended settings or notes.",
    "code": "//@version=6\\nindicator(\\"My New Indicator\\", overlay=true)\\nplot(close)"
  }'`;

  const S = {
    page: { fontFamily: "'Inter', -apple-system, sans-serif", background: "#0e0f14", color: "#d1d9e6", minHeight: "100vh", lineHeight: 1.6 },
    nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(14,15,20,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1f2b3e", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 56 },
    brand: { fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", color: "#d1d9e6" },
    brandAccent: { color: "#26a69a" },
    navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" },
    pill: { fontSize: "0.7rem", fontFamily: "monospace", color: "#4a5568", background: "#131720", border: "1px solid #1f2b3e", padding: "0.2rem 0.55rem", borderRadius: 4 },
    hero: { textAlign: "center", padding: "4rem 2rem 2rem", maxWidth: 720, margin: "0 auto" },
    h1: { fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1rem" },
    accent: { background: "linear-gradient(135deg,#26a69a,#4dd0c4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
    sub: { color: "#8896a9", fontSize: "1rem", marginBottom: "2rem" },
    searchWrap: { padding: "0 2rem 2rem", maxWidth: 680, margin: "0 auto" },
    search: { width: "100%", background: "#131720", border: "1px solid #1f2b3e", borderRadius: 10, padding: "0.75rem 1.25rem", color: "#d1d9e6", fontSize: "0.95rem", outline: "none" },
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem" },
    card: { background: "#131720", border: "1px solid #1f2b3e", borderRadius: 16, marginBottom: "2rem", overflow: "hidden" },
    cardHead: { padding: "1.75rem 2rem", borderBottom: "1px solid #1f2b3e" },
    badgePill: (color) => ({ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", padding: "0.25rem 0.65rem", borderRadius: 100, color: "white", background: color, textTransform: "uppercase", display: "inline-block", marginBottom: "0.75rem" }),
    cardTitle: { fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em" },
    cardSub: { color: "#8896a9", fontSize: "0.85rem", marginTop: "0.25rem" },
    cardDesc: { color: "#8896a9", fontSize: "0.9rem", marginTop: "0.75rem" },
    featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", borderTop: "1px solid #1f2b3e" },
    feature: { padding: "1.1rem 1.5rem", display: "flex", gap: "0.85rem", alignItems: "flex-start", background: "#131720", borderRight: "1px solid #1f2b3e", borderBottom: "1px solid #1f2b3e" },
    fIcon: { fontSize: "1.3rem", flexShrink: 0, marginTop: "0.1rem" },
    fLabel: { fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem" },
    fDesc: { color: "#8896a9", fontSize: "0.78rem", lineHeight: 1.5 },
    alertRow: { padding: "0.85rem 1.5rem", borderTop: "1px solid #1f2b3e", background: "#0e0f14", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" },
    alertLabel: { fontSize: "0.72rem", fontWeight: 600, color: "#4a5568", whiteSpace: "nowrap" },
    alertPill: { fontSize: "0.68rem", fontFamily: "monospace", background: "#1a2030", border: "1px solid #2a3a52", borderRadius: 4, padding: "0.18rem 0.45rem", color: "#d1d9e6" },
    codeHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1.5rem", background: "#1a2030", borderTop: "1px solid #1f2b3e" },
    codeLabel: { fontSize: "0.75rem", fontFamily: "monospace", color: "#4a5568" },
    copyBtn: (copied) => ({ fontSize: "0.75rem", fontWeight: 600, background: copied ? "#26a69a" : "#1f2b3e", border: "1px solid " + (copied ? "#26a69a" : "#2a3a52"), color: copied ? "white" : "#d1d9e6", padding: "0.35rem 1rem", borderRadius: 6, cursor: "pointer" }),
    codeBody: { maxHeight: 380, overflowY: "auto" },
    code: { margin: 0, padding: "1.25rem 1.5rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", lineHeight: 1.65, color: "#abb2bf", background: "#1a1f2e", whiteSpace: "pre", overflowX: "auto" },
    empty: { textAlign: "center", color: "#4a5568", padding: "4rem 2rem" },
    footer: { textAlign: "center", borderTop: "1px solid #1f2b3e", padding: "2rem", color: "#4a5568", fontSize: "0.8rem" },
    apiBox: { background: "#0e1420", border: "1px solid #2a3a52", borderRadius: 12, padding: "1.5rem 2rem", marginBottom: "3rem" },
    apiTitle: { fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem" },
    apiText: { color: "#8896a9", fontSize: "0.84rem", marginBottom: "1rem" },
    promptGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" },
    promptPanel: { minWidth: 0 },
    promptHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" },
    promptTitle: { fontWeight: 700, fontSize: "0.82rem", color: "#d1d9e6" },
    apiCode: { fontFamily: "monospace", fontSize: "0.72rem", color: "#4dd0c4", background: "#0a0e14", padding: "1rem 1.25rem", borderRadius: 8, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.65, maxHeight: 440, overflowY: "auto" }
  };

  const count = filtered.length;

  return (
    <div style={S.page}>
      <style>{`
        .ind-card { position: relative; }
        .ind-card .del-btn { position: absolute; top: 1.2rem; right: 1.5rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; padding: 0.3rem 0.5rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 10; font-size: 1rem; }
        .ind-card:hover .del-btn { opacity: 1; }
        .ind-card .del-btn:hover { background: rgba(239, 68, 68, 0.2); }
      `}</style>
      <nav style={S.nav}>
        <div style={S.brand}>ICC <span style={S.brandAccent}>God Mode</span></div>
        <div style={S.navRight}>
          <span style={S.pill}>{indicators.length} indicator{indicators.length !== 1 ? "s" : ""}</span>
          <span style={S.pill}>Pine Script v6</span>
        </div>
      </nav>

      <div style={S.hero}>
        <h1 style={S.h1}>Your <span style={S.accent}>Indicator Hub</span></h1>
        <p style={S.sub}>All custom Pine Script v6 indicators in one place. Copy, paste, trade.</p>
      </div>

      <div style={S.searchWrap}>
        <input
          style={S.search}
          placeholder="Search indicators…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={S.wrap}>

        <div style={S.apiBox}>
          <div style={S.apiTitle}>Agent Publishing Prompt</div>
          <p style={S.apiText}>
            Give this to HyperAgent, Antigravity, Codex, Claude, or any coding agent that can call an API. The publishing key is included in the copied prompt so agents can add indicators directly.
          </p>
          <div style={S.promptGrid}>
            <div style={S.promptPanel}>
              <div style={S.promptHead}>
                <div style={S.promptTitle}>Prompt for any agent</div>
                <button style={S.copyBtn(copied["agent-prompt"])} onClick={() => copyCode("agent-prompt", AGENT_PROMPT)}>
                  {copied["agent-prompt"] ? "Copied" : "Copy"}
                </button>
              </div>
              <pre style={S.apiCode}>{AGENT_PROMPT}</pre>
            </div>
            <div style={S.promptPanel}>
              <div style={S.promptHead}>
                <div style={S.promptTitle}>Direct API example</div>
                <button style={S.copyBtn(copied["api-example"])} onClick={() => copyCode("api-example", API_EXAMPLE)}>
                  {copied["api-example"] ? "Copied" : "Copy"}
                </button>
              </div>
              <pre style={S.apiCode}>{API_EXAMPLE}</pre>
            </div>
          </div>
        </div>

        {loading && <div style={S.empty}>Loading indicators…</div>}

        {!loading && count === 0 && (
          <div style={S.empty}>{search ? `No indicators match "${search}"` : "No indicators yet."}</div>
        )}

        {filtered.map(ind => (
          <div key={ind.id} style={S.card} className="ind-card">
            <button className="del-btn" onClick={() => handleDelete(ind.id)} title="Delete Indicator">🗑</button>
            <div style={S.cardHead}>
              <div style={S.badgePill(ind.badgeColor || "#26a69a")}>{ind.badge || "INDICATOR"}</div>
              <div style={S.cardTitle}>{ind.title}</div>
              {ind.subtitle && <div style={S.cardSub}>{ind.subtitle}</div>}
              <div style={S.cardDesc}>{ind.description}</div>
            </div>

            {ind.features && ind.features.length > 0 && (
              <div style={S.featureGrid}>
                {ind.features.map((f, j) => (
                  <div key={j} style={S.feature}>
                    <span style={S.fIcon}>{f.icon}</span>
                    <div>
                      <div style={S.fLabel}>{f.label}</div>
                      <div style={S.fDesc}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ind.alerts && ind.alerts.length > 0 && (
              <div style={S.alertRow}>
                <span style={S.alertLabel}>🔔 Alerts:</span>
                {ind.alerts.map((a, j) => (
                  <span key={j} style={S.alertPill}>{a}</span>
                ))}
              </div>
            )}

            {ind.code && (
              <div>
                <div style={S.codeHead}>
                  <span style={S.codeLabel}>📋 Pine Script v6 — {ind.code.split("\n").length} lines</span>
                  <button style={S.copyBtn(copied[ind.id])} onClick={() => copyCode(ind.id, ind.code)}>
                    {copied[ind.id] ? "✓ Copied!" : "Copy Code"}
                  </button>
                </div>
                <div style={S.codeBody}>
                  <pre style={S.code}>{ind.code}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer style={S.footer}>
        ICC God Mode Indicator Hub · Pine Script v6 · Built by Cesar's Mentor AI
      </footer>
    </div>
  );
}
