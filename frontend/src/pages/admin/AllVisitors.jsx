import { useState, useEffect } from "react";
import { getAllVisitors } from "../../services/api";

const API = import.meta.env.VITE_API_URL;

const STATUS_MAP = {
  pending:      { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved:     { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "checked-in": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  rejected:     { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  completed:    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, borderRadius: 7, padding: "3px 10px", fontSize: 11, fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

// ── Approve Modal ──────────────────────────────────────
const ApproveModal = ({ visitor, onConfirm, onClose, saving }) => {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const defaultStart = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const defaultEnd   = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours()+2)}:${pad(now.getMinutes())}`;
  const [startTime, setStartTime] = useState(visitor.preferred_date ? `${visitor.preferred_date.slice(0,10)}T${visitor.preferred_time || "09:00"}` : defaultStart);
  const [endTime,   setEndTime]   = useState(defaultEnd);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(15,23,42,0.15)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Approve Visit</h2>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{visitor.name}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{visitor.purpose} · {visitor.host_name}</div>
        </div>

        {[
          { label: "Allowed Start Time", value: startTime, onChange: setStartTime },
          { label: "Allowed End Time",   value: endTime,   onChange: setEndTime   },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>{f.label}</label>
            <input type="datetime-local" value={f.value} onChange={e => f.onChange(e.target.value)}
              style={{ width: "100%", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
              onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
              onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
          >Cancel</button>
          <button onClick={() => onConfirm(visitor.id, startTime, endTime)} disabled={saving || !startTime || !endTime}
            style={{ flex: 1, padding: "12px", background: "#2563eb", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: (saving || !startTime || !endTime) ? 0.6 : 1 }}>
            {saving ? "Approving…" : "✓ Confirm Approval"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Modal ───────────────────────────────────────
const DetailModal = ({ visitor, onClose, onApproveClick, onReject, saving }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(15,23,42,0.15)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", marginBottom: 8 }}>{visitor.name}</h2>
          <StatusBadge status={visitor.status} />
        </div>
        <button onClick={onClose} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>✕</button>
      </div>

      {/* Photo */}
      {visitor.photo && (
        <div style={{ padding: "18px 24px 0" }}>
          <img src={visitor.photo.startsWith("data:") ? visitor.photo : `${API}${visitor.photo}`} alt="Visitor"
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12, border: "1.5px solid #f1f5f9" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "18px 24px" }}>
        {[
          { label: "Phone",      value: visitor.phone },
          { label: "Host",       value: visitor.host_name },
          { label: "Department", value: visitor.department },
          { label: "Purpose",    value: visitor.purpose },
          { label: "Pref. Date", value: visitor.preferred_date ? new Date(visitor.preferred_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : null },
          { label: "Pref. Time", value: visitor.preferred_time },
          { label: "Email",      value: visitor.visitor_email },
          { label: "Submitted",  value: new Date(visitor.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) },
        ].filter(f => f.value).map((f, i) => (
          <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 600 }}>{f.label}</div>
            <div style={{ fontSize: 13, color: "#374151", wordBreak: "break-word", fontWeight: 600 }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {visitor.status === "pending" && (
        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
          <button onClick={() => onReject(visitor.id)} disabled={saving}
            style={{ flex: 1, padding: "12px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => !saving && (e.currentTarget.style.background = "#fee2e2")}
            onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
          >✕ Reject</button>
          <button onClick={onApproveClick} disabled={saving}
            style={{ flex: 1, padding: "12px", background: "#2563eb", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => !saving && (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
          >✓ Approve</button>
        </div>
      )}
    </div>
  </div>
);

const STATUSES = ["all", "pending", "approved", "checked-in", "rejected", "completed"];

export default function AllVisitors() {
  const [visitors,  setVisitors]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("all");
  const [date,      setDate]      = useState("");
  const [selected,  setSelected]  = useState(null);
  const [approving, setApproving] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  useEffect(() => { fetchVisitors(); }, [status, date]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (date) params.date = date;
      const { data } = await getAllVisitors(params);
      setVisitors(data);
    } catch { showToast("Failed to load visitors", "error"); }
    finally { setLoading(false); }
  };

  const handleReject = async (id) => {
    setSaving(true);
    try {
      await fetch(`${API}/api/approval/${id}/reject`);
      showToast("Visitor rejected");
      setSelected(null);
      fetchVisitors();
    } catch { showToast("Failed to reject", "error"); }
    finally { setSaving(false); }
  };

  const handleApproveConfirm = async (id, start_time, end_time) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/approval/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ start_time, end_time }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("Visitor approved — pass sent via email ✓");
      setApproving(null); setSelected(null);
      fetchVisitors();
    } catch { showToast("Failed to approve", "error"); }
    finally { setSaving(false); }
  };

  const filtered = visitors.filter(v => {
    const q = search.toLowerCase();
    return !q || v.name?.toLowerCase().includes(q) || v.host_name?.toLowerCase().includes(q) || v.visitor_email?.toLowerCase().includes(q);
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? visitors.length : visitors.filter(v => v.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:none} }

        .av-wrap { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; font-family: 'Plus Jakarta Sans', sans-serif; }

        .av-search {
          width: 100%; background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 10px 14px 10px 36px;
          font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a; outline: none; transition: all 0.2s;
        }
        .av-search::placeholder { color: #94a3b8; }
        .av-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .av-date {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #374151; outline: none; transition: all 0.2s; cursor: pointer; font-weight: 500;
        }
        .av-date:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .clear-btn {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 10px 14px; font-size: 12px; color: #64748b; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; white-space: nowrap; font-weight: 600;
        }
        .clear-btn:hover { border-color: #fecaca; color: #dc2626; background: #fef2f2; }

        .status-tab {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .status-tab:hover { border-color: #bfdbfe; color: #2563eb; background: #eff6ff; }
        .status-tab.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
        .tab-count {
          background: #e0e7ff; color: #2563eb; border-radius: 5px;
          padding: 1px 6px; font-size: 10px; margin-left: 5px; font-weight: 700;
        }
        .status-tab.active .tab-count { background: #bfdbfe; }

        .av-table-wrap {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          overflow: hidden; box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .av-table { width: 100%; border-collapse: collapse; }
        .av-table thead tr { border-bottom: 1.5px solid #f1f5f9; background: #fafbff; }
        .av-table th { text-align: left; padding: 12px 16px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; }
        .av-table tbody tr { border-bottom: 1px solid #f8fafc; transition: background 0.15s; cursor: pointer; }
        .av-table tbody tr:hover { background: #f8faff; }
        .av-table tbody tr:last-child { border-bottom: none; }
        .av-table td { padding: 12px 16px; font-size: 13px; color: #64748b; white-space: nowrap; }
        .av-table td.primary   { color: #0f172a; font-weight: 700; }
        .av-table td.secondary { color: #374151; font-weight: 500; }

        .act-approve {
          background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #16a34a;
          padding: 5px 12px; border-radius: 7px; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .act-approve:hover { background: #dcfce7; }
        .act-reject {
          background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626;
          padding: 5px 12px; border-radius: 7px; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .act-reject:hover { background: #fee2e2; }

        .photo-thumb { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1.5px solid #f1f5f9; }
        .photo-placeholder { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,#2563eb,#1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; font-weight: 800; }

        .skeleton { background: linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; height: 14px; display: block; }
      `}</style>

      <div className="av-wrap">

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
            <input className="av-search" placeholder="Search visitor, host, email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="av-date" value={date} onChange={e => setDate(e.target.value)} />
          {(search || date || status !== "all") && (
            <button className="clear-btn" onClick={() => { setSearch(""); setDate(""); setStatus("all"); }}>✕ Clear</button>
          )}
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {STATUSES.map(s => (
            <button key={s} className={`status-tab${status === s ? " active" : ""}`} onClick={() => setStatus(s)}>
              {s === "all" ? "All visits" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="tab-count">{counts[s] || 0}</span>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of <strong style={{ color: "#0f172a" }}>{visitors.length}</strong> visitors
          </span>
        </div>

        {/* Table */}
        <div className="av-table-wrap">
          <table className="av-table">
            <thead>
              <tr>
                <th></th>
                <th>Visitor</th>
                <th>Host</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[32, 120, 90, 90, 80, 70, 80, 100].map((w, j) => (
                      <td key={j}><span className="skeleton" style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "60px 16px" }}>
                    <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>👥</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No visitors found</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>Try adjusting your filters</div>
                  </td>
                </tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} onClick={() => setSelected(v)}>
                    <td onClick={e => e.stopPropagation()}>
                      {v.photo
                        ? <img src={v.photo.startsWith("data:") ? v.photo : `${API}${v.photo}`} className="photo-thumb" alt="" onError={e => e.target.style.display = "none"} />
                        : <div className="photo-placeholder">{v.name?.[0]?.toUpperCase()}</div>
                      }
                    </td>
                    <td className="primary">{v.name}</td>
                    <td className="secondary">{v.host_name}</td>
                    <td>{v.department}</td>
                    <td>{v.purpose}</td>
                    <td>{v.preferred_date
                      ? new Date(v.preferred_date).toLocaleDateString("en", { month: "short", day: "numeric" })
                      : new Date(v.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })
                    }</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      {v.status === "pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="act-approve" onClick={() => setApproving(v)}>✓ Approve</button>
                          <button className="act-reject"  onClick={() => handleReject(v.id)}>✕</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && !approving && (
        <DetailModal visitor={selected} onClose={() => setSelected(null)} onApproveClick={() => setApproving(selected)} onReject={handleReject} saving={saving} />
      )}
      {approving && (
        <ApproveModal visitor={approving} onConfirm={handleApproveConfirm} onClose={() => setApproving(null)} saving={saving} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`, color: toast.type === "error" ? "#dc2626" : "#16a34a", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(15,23,42,0.1)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: 8, minWidth: 240, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </>
  );
}