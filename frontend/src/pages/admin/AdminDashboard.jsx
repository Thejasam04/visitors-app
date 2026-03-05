import { useState, useEffect } from "react";
import { getDashboard } from "../../services/api";
import HostsManagement from "./HostsManagement";
import AllVisitors from "./AllVisitors";
import Reports from "./Reports";

// ── Bar Chart ──────────────────────────────────────────
const BarChart = ({ data }) => {
  if (!data?.length) return <EmptyState text="No data yet" />;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 88, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: "100%", height: `${(d.count / max) * 72}px`, minHeight: 4,
            background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
            borderRadius: "4px 4px 2px 2px",
            transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
          }} />
          <span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap", fontWeight: 500 }}>
            {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Donut Chart ────────────────────────────────────────
const DonutChart = ({ data }) => {
  if (!data?.length) return <EmptyState text="No data yet" />;
  const colors = { pending: "#d97706", approved: "#16a34a", "checked-in": "#2563eb", rejected: "#dc2626", completed: "#7c3aed" };
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  let offset = 0;
  const r = 36, cx = 44, cy = 44, circumference = 2 * Math.PI * r;
  const segments = data.map(d => {
    const pct = Number(d.count) / total;
    const dash = pct * circumference;
    const seg = { ...d, pct, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={88} height={88} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={colors[s.status] || "#2563eb"} strokeWidth={10}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset} strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "44px 44px", transition: "all 0.6s ease" }}
          />
        ))}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize={14} fontWeight={800}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={8} fontWeight={600}>TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[s.status] || "#2563eb", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{s.status}</span>
            <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700, marginLeft: "auto", paddingLeft: 12 }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, color: "#94a3b8", fontSize: 13 }}>{text}</div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:      { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    approved:     { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    "checked-in": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    rejected:     { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    completed:    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, borderRadius: 7, padding: "3px 10px", fontSize: 11, fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

const NAV_ITEMS = [
  { id: "dashboard", icon: "▦",  label: "Dashboard" },
  { id: "visitors",  icon: "👥", label: "All Visitors" },
  { id: "hosts",     icon: "🏷️", label: "Hosts" },
  { id: "reports",   icon: "📊", label: "Reports" },
];

export default function AdminDashboard() {
  const [activeNav,   setActiveNav]   = useState("dashboard");
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName,   setAdminName]   = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { window.location.href = "/admin/login"; return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.name) setAdminName(payload.name);
    } catch {}
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch { setError("Failed to load dashboard data."); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem("adminToken"); window.location.href = "/admin/login"; };

  const stats = data?.stats || {};
  const recentVisitors = data?.recent_visitors || [];

  const STAT_CARDS = [
    { label: "Total Visitors",    value: stats.total_visitors    ?? "—", icon: "👥", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Today's Visitors",  value: stats.today_visitors    ?? "—", icon: "📅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Pending Approvals", value: stats.pending_approvals ?? "—", icon: "⏳", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { label: "Total Hosts",       value: stats.total_hosts       ?? "—", icon: "🏷️", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  ];

  const pageTitle = { dashboard: "Dashboard", visitors: "All Visitors", hosts: "Hosts Management", reports: "Reports" }[activeNav];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8faff; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; overflow-x: hidden; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .adm-root { display: flex; min-height: 100vh; background: #f8faff; }

        /* Sidebar */
        .sidebar {
          width: 240px; min-width: 240px; background: #fff;
          border-right: 1px solid #f1f5f9; display: flex; flex-direction: column;
          transition: width 0.3s cubic-bezier(0.16,1,0.3,1), min-width 0.3s;
          position: sticky; top: 0; height: 100vh; z-index: 20;
          box-shadow: 1px 0 12px rgba(15,23,42,0.04);
        }
        .sidebar.collapsed { width: 68px; min-width: 68px; }

        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 20px 18px; border-bottom: 1px solid #f1f5f9;
          overflow: hidden; white-space: nowrap;
        }
        .sidebar-logo-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(37,99,235,0.28);
        }
        .sidebar-logo-text { font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; transition: opacity 0.2s; white-space: nowrap; }
        .sidebar.collapsed .sidebar-logo-text { opacity: 0; width: 0; overflow: hidden; }

        .sidebar-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 10px; cursor: pointer;
          transition: all 0.18s; color: #64748b; font-size: 14px; font-weight: 500;
          white-space: nowrap; overflow: hidden; border: 1.5px solid transparent;
          background: none;
        }
        .nav-item:hover { background: #f8fafc; color: #374151; }
        .nav-item.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
        .nav-item-icon { font-size: 16px; flex-shrink: 0; }
        .nav-item-label { transition: opacity 0.2s; }
        .sidebar.collapsed .nav-item-label { opacity: 0; width: 0; }

        .sidebar-footer { padding: 14px 10px; border-top: 1px solid #f1f5f9; }
        .logout-btn {
          display: flex; align-items: center; gap: 12px; padding: 11px 12px;
          border-radius: 10px; cursor: pointer; width: 100%; background: none;
          border: 1.5px solid transparent; color: #64748b; font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s;
          white-space: nowrap; overflow: hidden; font-weight: 500;
        }
        .logout-btn:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

        .collapse-btn {
          position: absolute; top: 22px; right: -12px; width: 24px; height: 24px;
          border-radius: 50%; background: #fff; border: 1.5px solid #e2e8f0;
          color: #64748b; font-size: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; z-index: 30; box-shadow: 0 2px 6px rgba(15,23,42,0.08);
        }
        .collapse-btn:hover { border-color: #2563eb; color: #2563eb; }

        /* Main */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; height: 64px; flex-shrink: 0;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(16px);
          border-bottom: 1px solid #f1f5f9;
          box-shadow: 0 1px 12px rgba(15,23,42,0.05);
          position: sticky; top: 0; z-index: 10;
        }
        .topbar-title { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .topbar-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; font-weight: 500; }

        .refresh-btn {
          display: flex; align-items: center; gap: 7px;
          background: #fff; border: 1.5px solid #e2e8f0; color: #374151;
          padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .refresh-btn:hover { border-color: #bfdbfe; color: #2563eb; background: #eff6ff; }

        .admin-pill {
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 100px; padding: 5px 14px 5px 6px;
        }
        .admin-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
        }

        /* Content */
        .content { flex: 1; overflow-y: auto; padding: 28px; }
        .content::-webkit-scrollbar { width: 4px; }
        .content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
        @media(max-width:1100px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

        .stat-card {
          background: #fff; border-radius: 16px; border: 1.5px solid #f1f5f9;
          padding: 22px 20px; position: relative; overflow: hidden;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,23,42,0.08); border-color: #e0e7ff; }

        /* Charts */
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media(max-width:900px) { .charts-row { grid-template-columns: 1fr; } }

        .panel {
          background: #fff; border-radius: 16px; border: 1.5px solid #f1f5f9;
          padding: 22px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .panel-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .panel-badge { font-size: 10px; color: #64748b; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 3px 8px; font-weight: 600; letter-spacing: 0.5px; }

        /* Table */
        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1.5px solid #f1f5f9; }
        th { text-align: left; padding: 10px 14px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid #f8fafc; transition: background 0.15s; }
        tbody tr:hover { background: #f8faff; }
        tbody tr:last-child { border-bottom: none; }
        td { padding: 12px 14px; font-size: 13.5px; color: #64748b; white-space: nowrap; }
        td.name-cell { color: #0f172a; font-weight: 600; }

        .skeleton { background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }

        .error-banner { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px 18px; color: #dc2626; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }

        .live-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #16a34a; margin-right: 6px; animation: blink 2s ease-in-out infinite; }
      `}</style>

      <div className="adm-root">

        {/* ── Sidebar ── */}
        <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`} style={{ position: "relative" }}>
          <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">VisitorPass</span>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`nav-item${activeNav === item.id ? " active" : ""}`} onClick={() => setActiveNav(item.id)} title={!sidebarOpen ? item.label : ""}>
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout} title={!sidebarOpen ? "Logout" : ""}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🚪</span>
              <span className="nav-item-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">

          {/* Topbar */}
          <header className="topbar">
            <div>
              <div className="topbar-title">{pageTitle}</div>
              <div className="topbar-sub">{new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {stats.checked_in > 0 && (
                <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center" }}>
                  <span className="live-dot" />{stats.checked_in} checked in
                </span>
              )}
              <button className="refresh-btn" onClick={fetchDashboard} disabled={loading}>
                <span style={{ display: "inline-block", animation: loading ? "spin 0.7s linear infinite" : "none" }}>↻</span>
                Refresh
              </button>
              <div className="admin-pill">
                <div className="admin-avatar">{adminName[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{adminName}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content">

            {error && (
              <div className="error-banner">
                <span>⚠️</span> {error}
                <button onClick={fetchDashboard} style={{ marginLeft: "auto", background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Retry →</button>
              </div>
            )}

            {activeNav === "dashboard" && (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  {STAT_CARDS.map((card, i) => (
                    <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, border: `1.5px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>{card.icon}</div>
                      {loading
                        ? <div className="skeleton" style={{ height: 34, width: 72, marginBottom: 8 }} />
                        : <div style={{ fontSize: 32, fontWeight: 800, color: card.color, letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 }}>{card.value}</div>
                      }
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="charts-row">
                  <div className="panel">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <span className="panel-title">Visitors — Last 7 Days</span>
                      <span className="panel-badge">BAR CHART</span>
                    </div>
                    {loading ? <div className="skeleton" style={{ height: 88 }} /> : <BarChart data={data?.byDate} />}
                  </div>
                  <div className="panel">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <span className="panel-title">Status Breakdown</span>
                      <span className="panel-badge">DONUT</span>
                    </div>
                    {loading ? <div className="skeleton" style={{ height: 88 }} /> : <DonutChart data={data?.byStatus} />}
                  </div>
                </div>

                {/* Recent visitors table */}
                <div className="panel" style={{ animationDelay: "0.1s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <span className="panel-title">Recent Visitors</span>
                    <span className="panel-badge">LAST 5</span>
                  </div>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}
                    </div>
                  ) : recentVisitors.length === 0 ? <EmptyState text="No visitors yet" /> : (
                    <div style={{ overflowX: "auto" }}>
                      <table>
                        <thead>
                          <tr><th>Name</th><th>Host</th><th>Department</th><th>Purpose</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {recentVisitors.map((v, i) => (
                            <tr key={i}>
                              <td className="name-cell">{v.name}</td>
                              <td>{v.host_name}</td>
                              <td>{v.department}</td>
                              <td>{v.purpose}</td>
                              <td><StatusBadge status={v.status} /></td>
                              <td>{new Date(v.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeNav === "hosts"    && <HostsManagement />}
            {activeNav === "visitors" && <AllVisitors />}
            {activeNav === "reports"  && <Reports />}
          </div>
        </div>
      </div>
    </>
  );
}