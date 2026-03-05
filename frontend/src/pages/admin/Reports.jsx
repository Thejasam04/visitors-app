import { useState, useEffect } from "react";
import { getReports } from "../../services/api";

const STATUS_COLORS = {
  pending: "#d97706", approved: "#16a34a", "checked-in": "#2563eb", rejected: "#dc2626", completed: "#7c3aed"
};
const STATUS_BG = {
  pending: "#fffbeb", approved: "#f0fdf4", "checked-in": "#eff6ff", rejected: "#fef2f2", completed: "#f5f3ff"
};

// ── Bar Chart ──────────────────────────────────────────
const BarChart = ({ data }) => {
  if (!data?.length) return <EmptyChart text="No data for this period" />;
  const max = Math.max(...data.map(d => Number(d.count)), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>{d.count}</span>
          <div style={{
            width: "100%", height: `${(Number(d.count) / max) * 100}px`, minHeight: 4,
            background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
            borderRadius: "4px 4px 2px 2px",
            boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
            transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
          }} />
          <span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", textAlign: "center", fontWeight: 500 }}>
            {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Horizontal Bar ─────────────────────────────────────
const HorizontalBar = ({ data }) => {
  if (!data?.length) return <EmptyChart text="No host data yet" />;
  const max = Math.max(...data.map(d => Number(d.count)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.slice(0, 8).map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 130, fontSize: 13, color: "#374151", fontWeight: 600, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.host_name}</div>
          <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(Number(d.count) / max) * 100}%`,
              background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
              borderRadius: 6,
              transition: `width 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s`,
              boxShadow: "0 1px 4px rgba(37,99,235,0.2)",
            }} />
          </div>
          <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, width: 28, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
        </div>
      ))}
    </div>
  );
};

// ── Donut Chart ────────────────────────────────────────
const DonutChart = ({ data }) => {
  if (!data?.length) return <EmptyChart text="No status data yet" />;
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  let offset = 0;
  const r = 52, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  const segments = data.map(d => {
    const pct = Number(d.count) / total, dash = pct * circumference;
    const seg = { ...d, pct, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      <svg width={120} height={120} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={STATUS_COLORS[s.status] || "#2563eb"} strokeWidth={14}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "all 0.7s ease" }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize={18} fontWeight={800}>{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={9} fontWeight={600} letterSpacing={1}>TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[s.status] || "#2563eb", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#374151", textTransform: "capitalize", flex: 1, fontWeight: 500 }}>{s.status}</span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{s.count}</span>
            <span style={{ fontSize: 11, color: "#94a3b8", width: 36, textAlign: "right", fontWeight: 500 }}>{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{text}</div>
);

const exportCSV = (reportData) => {
  const rows = [["Date", "Visitor Count"]];
  (reportData.byDate || []).forEach(d => rows.push([d.date, d.count]));
  rows.push([], ["Status", "Count"]);
  (reportData.byStatus || []).forEach(d => rows.push([d.status, d.count]));
  rows.push([], ["Host", "Department", "Visitor Count"]);
  (reportData.byHost || []).forEach(d => rows.push([d.host_name, d.department, d.count]));
  const csv  = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `visitorpass-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true); setError("");
    try { const { data: d } = await getReports(); setData(d); }
    catch { setError("Failed to load report data."); }
    finally { setLoading(false); }
  };

  const totalVisitors = (data?.byStatus || []).reduce((s, d) => s + Number(d.count), 0);
  const pending    = (data?.byStatus || []).find(d => d.status === "pending")?.count     || 0;
  const approved   = (data?.byStatus || []).find(d => d.status === "approved")?.count    || 0;
  const checkedIn  = (data?.byStatus || []).find(d => d.status === "checked-in")?.count  || 0;
  const todayCount = (data?.byDate   || []).slice(-1)[0]?.count || 0;

  const SUMMARY = [
    { label: "Total Visitors", value: totalVisitors,              icon: "👥", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Today",          value: todayCount,                 icon: "📅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Pending",        value: pending,                    icon: "⏳", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved",       value: approved,                   icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Checked In",     value: checkedIn,                  icon: "📍", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Active Hosts",   value: (data?.byHost || []).length, icon: "🏷️", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .rp-wrap { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; font-family: 'Plus Jakarta Sans', sans-serif; }

        .rp-panel {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 22px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .rp-panel-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .rp-panel-badge { font-size: 10px; color: #64748b; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 3px 8px; font-weight: 600; letter-spacing: 0.5px; }

        .summary-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px; margin-bottom: 22px; }
        @media(max-width:1100px) { .summary-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:700px)  { .summary-grid { grid-template-columns: repeat(2,1fr); } }

        .summary-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 14px;
          padding: 16px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: all 0.2s; box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .summary-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,23,42,0.08); border-color: #e0e7ff; }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media(max-width:900px) { .charts-grid { grid-template-columns: 1fr; } }

        .export-btn {
          display: flex; align-items: center; gap: 7px;
          background: #2563eb; border: none; color: #fff;
          padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .export-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .export-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .refresh-btn-sm {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #e2e8f0; color: #374151;
          padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .refresh-btn-sm:hover { border-color: #bfdbfe; color: #2563eb; background: #eff6ff; }

        .skeleton-box { background: linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }

        .error-box { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px 18px; color: #dc2626; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
      `}</style>

      <div className="rp-wrap">

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", marginBottom: 2 }}>Analytics Overview</div>
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              Last 7 days · {new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="refresh-btn-sm" onClick={fetchReports} disabled={loading}>
              <span style={{ display: "inline-block", animation: loading ? "spin 0.7s linear infinite" : "none" }}>↻</span>
              Refresh
            </button>
            <button className="export-btn" onClick={() => exportCSV(data)} disabled={loading || !data}>
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
            <button onClick={fetchReports} style={{ marginLeft: "auto", background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Retry →</button>
          </div>
        )}

        {/* Summary cards */}
        <div className="summary-grid">
          {SUMMARY.map((s, i) => (
            <div className="summary-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, border: `1.5px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginBottom: 12 }}>{s.icon}</div>
              {loading
                ? <div className="skeleton-box" style={{ height: 26, width: 48, marginBottom: 8 }} />
                : <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
              }
              <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="charts-grid">
          <div className="rp-panel" style={{ animationDelay: "0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span className="rp-panel-title">Visitors by Date</span>
              <span className="rp-panel-badge">LAST 7 DAYS</span>
            </div>
            {loading ? <div className="skeleton-box" style={{ height: 120 }} /> : <BarChart data={data?.byDate} />}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, textAlign: "right", fontWeight: 500 }}>Daily visitor activity</div>
          </div>

          <div className="rp-panel" style={{ animationDelay: "0.1s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span className="rp-panel-title">Visitors by Status</span>
              <span className="rp-panel-badge">ALL TIME</span>
            </div>
            {loading ? <div className="skeleton-box" style={{ height: 120 }} /> : <DonutChart data={data?.byStatus} />}
          </div>
        </div>

        {/* Host bar — full width */}
        <div className="rp-panel" style={{ animationDelay: "0.15s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span className="rp-panel-title">Visitors by Host</span>
            <span className="rp-panel-badge">TOP 8</span>
          </div>
          {loading
            ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton-box" style={{ height: 14 }} />)}
              </div>
            : <HorizontalBar data={data?.byHost} />
          }
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8", textAlign: "right", fontWeight: 500 }}>
          CSV export includes dates, statuses, and host breakdown.
        </div>
      </div>
    </>
  );
}