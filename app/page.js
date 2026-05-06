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
    apiCode: { fontFamily: "monospace", fontSize: "0.78rem", color: "#4dd0c4", background: "#0a0e14", padding: "1rem 1.25rem", borderRadius: 8, overflowX: "auto", whiteSpace: "pre", lineHeight: 1.7 }
  };

  const count = filtered.length;

  return (
    <div style={S.page}>
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
          <div style={S.apiTitle}>🔌 Add an indicator via API</div>
          <pre style={S.apiCode}>{`POST /api/indicators
Headers: { "x-api-key": "YOUR_API_KEY" }
Body: {
  "title": "My New Indicator",
  "badge": "INDICATOR",
  "badgeColor": "#26a69a",
  "description": "What this does...",
  "features": [{ "icon": "⚡", "label": "Feature", "desc": "Description" }],
  "alerts": ["Alert name"],
  "code": "//@version=6\\n..."
}`}</pre>
          <p style={{ fontSize: "0.8rem", color: "#4a5568", marginTop: "0.75rem" }}>
            Any agent (Codex, Claude, etc.) can POST to this endpoint to publish a new indicator here automatically.
          </p>
        </div>

        {loading && <div style={S.empty}>Loading indicators…</div>}

        {!loading && count === 0 && (
          <div style={S.empty}>{search ? `No indicators match "${search}"` : "No indicators yet."}</div>
        )}

        {filtered.map(ind => (
          <div key={ind.id} style={S.card}>
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