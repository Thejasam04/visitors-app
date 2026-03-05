import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVisits } from "../../services/api";

const API = import.meta.env.VITE_API_URL;

const STATUS = {
  pending:       { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⏳", label: "Pending"    },
  approved:      { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓",  label: "Approved"   },
  "checked-in":  { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "📍", label: "Checked In" },
  "checked-out": { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "✔",  label: "Completed"  },
  rejected:      { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "✕",  label: "Rejected"   },
  completed:     { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "✔",  label: "Completed"  },
};

const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
      borderRadius: 7, padding: "4px 10px", fontSize: 12, fontWeight: 600,
      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {s.icon} {s.label}
    </span>
  );
};

const CancelModal = ({ visit, onConfirm, onClose, loading }) => (
  <div
    style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div style={{ background: "#fff", border: "1.5px solid #fee2e2", borderRadius: 18, padding: 36, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(15,23,42,0.15)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🗑️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Cancel this visit?</h3>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
          Are you sure you want to cancel your visit to{" "}
          <strong style={{ color: "#0f172a" }}>{visit.host_name}</strong>? This cannot be undone.
        </p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
        >Keep it</button>
        <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "12px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
        >{loading ? "Cancelling…" : "Yes, Cancel"}</button>
      </div>
    </div>
  </div>
);

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [visits,     setVisits]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [cancelling, setCancelling] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [userName,   setUserName]   = useState("Visitor");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.name) setUserName(payload.name.split(" ")[0]);
    } catch {}
    fetchVisits();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data } = await getMyVisits();
      setVisits(data);
    } catch { showToast("Failed to load visits", "error"); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/visitors/${cancelling.id}/cancel`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Visit cancelled successfully");
      setCancelling(null);
      fetchVisits();
    } catch { showToast("Failed to cancel visit", "error"); }
    finally { setSaving(false); }
  };

  const FILTERS = ["all", "pending", "approved", "checked-in", "rejected", "completed"];
  const filtered = filter === "all" ? visits : visits.filter(v => v.status === filter);

  const totalVisits    = visits.length;
  const pendingCount   = visits.filter(v => v.status === "pending").length;
  const approvedCount  = visits.filter(v => v.status === "approved").length;
  const completedCount = visits.filter(v => ["completed", "checked-out"].includes(v.status)).length;

  const STATS = [
    { label: "Total Visits",  value: totalVisits,    icon: "👥", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Pending",       value: pendingCount,   icon: "⏳", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved",      value: approvedCount,  icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Completed",     value: completedCount, icon: "🎯", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8faff; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px; height: 64px;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(16px);
          border-bottom: 1px solid #f1f5f9;
          box-shadow: 0 1px 12px rgba(15,23,42,0.06);
          position: sticky; top: 0; z-index: 20;
        }
        .logo-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
        }
        .logo-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(37,99,235,0.28);
        }
        .logo-text { font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; }

        .new-visit-btn {
          display: flex; align-items: center; gap: 7px;
          background: #2563eb; color: #fff; border: none;
          border-radius: 9px; padding: 9px 18px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .new-visit-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.35); }

        .user-pill {
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 100px; padding: 5px 14px 5px 6px;
        }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
        }
        .user-name { font-size: 13px; color: #374151; font-weight: 600; }

        .logout-btn {
          font-size: 13px; color: #94a3b8; background: none; border: none;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500; transition: color 0.2s; padding: 4px 0;
        }
        .logout-btn:hover { color: #dc2626; }

        .content { max-width: 1060px; margin: 0 auto; padding: 36px 24px; }

        .greeting { margin-bottom: 32px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .greeting-name { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .greeting-sub  { font-size: 14px; color: #64748b; }

        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        @media(max-width:700px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

        .stat-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 22px 20px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: all 0.2s; box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
        .stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 14px; }
        .stat-val  { font-size: 30px; font-weight: 800; letter-spacing: -1px; line-height: 1; margin-bottom: 4px; }
        .stat-lbl  { font-size: 12px; color: #94a3b8; font-weight: 500; }

        .filters { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-btn {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: #bfdbfe; color: #2563eb; background: #eff6ff; }
        .filter-btn.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }

        .visit-list { display: flex; flex-direction: column; gap: 12px; }

        .visit-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 22px 24px; animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
          transition: all 0.2s; box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .visit-card:hover { border-color: #e0e7ff; box-shadow: 0 4px 20px rgba(37,99,235,0.06); }

        .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; gap: 12px; }
        .host-name { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.2px; }
        .dept-tag  { display: inline-block; font-size: 11px; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 2px 8px; font-weight: 500; }

        .card-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; }

        .card-divider { height: 1px; background: #f1f5f9; margin-bottom: 16px; }

        .card-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .btn-pass {
          display: flex; align-items: center; gap: 6px;
          background: #2563eb; color: #fff; border: none;
          border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(37,99,235,0.2);
        }
        .btn-pass:hover { background: #1d4ed8; transform: translateY(-1px); }

        .btn-cancel {
          background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626;
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .btn-cancel:hover { background: #fee2e2; }

        .pending-pulse {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #d97706; margin-right: 6px; animation: pulse 2s ease-in-out infinite;
          vertical-align: middle;
        }

        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 72px 20px; gap: 12px;
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }

        .skeleton {
          background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8faff" }}>

        {/* ── Topbar ── */}
        <header className="topbar">
          <button className="logo-btn" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">VisitorPass</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="new-visit-btn" onClick={() => navigate("/visit")}>
              + New Visit
            </button>
            <div className="user-pill">
              <div className="avatar">{userName[0]?.toUpperCase()}</div>
              <span className="user-name">{userName}</span>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}>
              Logout
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <div className="content">

          {/* Greeting */}
          <div className="greeting">
            <div className="greeting-name">Welcome back, {userName} 👋</div>
            <div className="greeting-sub">Here's an overview of all your visit requests.</div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="stat-icon" style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
                  {s.icon}
                </div>
                {loading
                  ? <div className="skeleton" style={{ height: 30, width: 48, marginBottom: 6 }} />
                  : <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
                }
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Your Visits</h2>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {filtered.length} {filter === "all" ? "total" : filter} visit{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Filters */}
          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All visits" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Visit list */}
          <div className="visit-list">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 130, animationDelay: `${i * 0.05}s` }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize: 44, opacity: 0.25 }}>🗓️</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  {filter === "all" ? "No visits yet" : `No ${filter} visits`}
                </span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  {filter === "all" ? "Click '+ New Visit' to schedule your first visit" : "Try a different filter"}
                </span>
                {filter === "all" && (
                  <button className="new-visit-btn" onClick={() => navigate("/visit")} style={{ marginTop: 8 }}>
                    + New Visit
                  </button>
                )}
              </div>
            ) : (
              filtered.map((v, i) => (
                <div className="visit-card" key={v.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="card-top">
                    <div>
                      <div className="host-name">
                        {v.status === "pending" && <span className="pending-pulse" />}
                        {v.host_name}
                      </div>
                      <span className="dept-tag">{v.department}</span>
                    </div>
                    <Badge status={v.status} />
                  </div>

                  <div className="card-meta">
                    <div className="meta-item">
                      <span style={{ fontSize: 15 }}>📋</span>
                      <span>{v.purpose}</span>
                    </div>
                    <div className="meta-item">
                      <span style={{ fontSize: 15 }}>📅</span>
                      <span>{new Date(v.preferred_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="meta-item">
                      <span style={{ fontSize: 15 }}>🕐</span>
                      <span>{v.preferred_time}</span>
                    </div>
                    <div className="meta-item">
                      <span style={{ fontSize: 15 }}>📆</span>
                      <span>Submitted {new Date(v.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    </div>
                    {v.check_in_time && (
                      <div className="meta-item">
                        <span style={{ fontSize: 15 }}>✅</span>
                        <span>In: {new Date(v.check_in_time).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                    {v.check_out_time && (
                      <div className="meta-item">
                        <span style={{ fontSize: 15 }}>🚪</span>
                        <span>Out: {new Date(v.check_out_time).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>

                  {(v.status === "approved" || v.status === "checked-in" || v.status === "pending") && (
                    <>
                      <div className="card-divider" />
                      <div className="card-actions">
                        {(v.status === "approved" || v.status === "checked-in") && (
                          <button className="btn-pass" onClick={() => navigate(`/pass/${v.id}`)}>
                            🎫 View Pass
                          </button>
                        )}
                        {v.status === "pending" && (
                          <button className="btn-cancel" onClick={() => setCancelling(v)}>
                            Cancel Visit
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {cancelling && (
        <CancelModal
          visit={cancelling}
          onConfirm={handleCancel}
          onClose={() => setCancelling(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1.5px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toast.type === "error" ? "#dc2626" : "#16a34a",
          padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(15,23,42,0.1)",
          animation: "toastIn 0.3s ease",
          display: "flex", alignItems: "center", gap: 8, minWidth: 240,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </>
  );
}
