import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function VisitorPass() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [pass,    setPass]    = useState(null);
  const [visit,   setVisit]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }
    fetchPass(token);
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPass = async (token) => {
    setLoading(true);
    try {
      const res    = await fetch(`${API}/api/visitors/my`, { headers: { Authorization: `Bearer ${token}` } });
      const visits = await res.json();
      const v      = visits.find((x) => String(x.id) === String(id));
      if (!v) { setError("Visit not found."); return; }
      setVisit(v);
      const passRes = await fetch(`${API}/api/visitors/${id}/pass`, { headers: { Authorization: `Bearer ${token}` } });
      if (passRes.ok) setPass(await passRes.json());
    } catch { setError("Failed to load your pass."); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "My VisitorPass", text: `Pass for ${visit?.name}`, url: window.location.href }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("Link copied to clipboard!");
    }
  };

  const qrSrc = pass?.qr_code
    ? (pass.qr_code.startsWith("data:") ? pass.qr_code : `${API}${pass.qr_code}`)
    : null;

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8faff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>Loading your pass…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#f8faff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚠️</div>
      <span style={{ color: "#dc2626", fontSize: 15, fontWeight: 600 }}>{error}</span>
      <button onClick={() => navigate("/dashboard")} style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#374151", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#374151"; }}
      >← Back to Dashboard</button>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8faff; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform: rotate(360deg); } }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px; height: 64px;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(16px);
          border-bottom: 1px solid #f1f5f9;
          box-shadow: 0 1px 12px rgba(15,23,42,0.06);
          position: sticky; top: 0; z-index: 20;
        }

        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #64748b; padding: 8px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .back-btn:hover { border-color: #2563eb; color: #2563eb; }

        .pass-layout {
          max-width: 920px; margin: 0 auto; padding: 40px 24px;
          display: flex; align-items: flex-start; justify-content: center;
          gap: 28px; flex-wrap: wrap;
        }

        /* Pass card */
        .pass-card {
          width: 360px; flex-shrink: 0; border-radius: 20px; overflow: hidden;
          background: #fff; border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 40px rgba(15,23,42,0.1);
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .pass-header {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
          padding: 24px; position: relative; overflow: hidden;
        }
        .pass-header::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .pass-header::after {
          content: ''; position: absolute; width: 280px; height: 280px;
          border-radius: 50%; background: rgba(255,255,255,0.05);
          top: -100px; right: -80px;
        }

        .pass-qr-section {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px 24px; border-bottom: 1px solid #f1f5f9; background: #fafbff;
        }
        .qr-frame {
          background: #fff; border-radius: 16px; padding: 14px;
          border: 1.5px solid #e2e8f0; margin-bottom: 10px;
          box-shadow: 0 2px 12px rgba(15,23,42,0.06);
        }

        .detail-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 0; border-bottom: 1px solid #f8fafc;
        }
        .detail-row:last-child { border-bottom: none; }

        /* Actions panel */
        .actions-panel {
          width: 280px; display: flex; flex-direction: column; gap: 10px;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }

        .action-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; width: 100%; text-align: left; border: none;
        }
        .action-primary {
          background: #2563eb; color: #fff; font-weight: 700;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .action-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }

        .action-secondary {
          background: #fff; color: #374151;
          border: 1.5px solid #e2e8f0 !important;
        }
        .action-secondary:hover { border-color: #bfdbfe !important; color: #2563eb; background: #eff6ff; }

        .status-card {
          background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 14px; padding: 18px;
        }
        .status-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f1f5f9;
        }
        .status-row:last-child { border-bottom: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8faff" }}>

        {/* ── Topbar ── */}
        <header className="topbar">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>VisitorPass</span>
          </div>
          <div style={{ width: 120 }} />
        </header>

        <div className="pass-layout">

          {/* ── Pass Card ── */}
          <div className="pass-card">

            {/* Header */}
            <div className="pass-header">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>VisitorPass</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    APPROVED
                  </span>
                </div>

                {visit?.photo && (
                  <img src={visit.photo} alt="visitor" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)", marginBottom: 12 }} />
                )}
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 3, letterSpacing: "-0.5px" }}>{visit?.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Visitor Access Pass · #{id}</div>
              </div>
            </div>

            {/* QR Section */}
            <div className="pass-qr-section">
              <div className="qr-frame">
                {qrSrc
                  ? <img src={qrSrc} alt="QR Code" style={{ width: 176, height: 176, display: "block" }} onError={e => e.target.style.display = "none"} />
                  : <div style={{ width: 176, height: 176, background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ fontSize: 28, opacity: 0.3 }}>📱</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", padding: "0 16px" }}>QR available after approval</span>
                    </div>
                }
              </div>
              <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Scan at entry to verify</span>
            </div>

            {/* Valid Time Window */}
            {(pass?.approved_start_time || pass?.approved_end_time) && (
              <div style={{ margin: "0 20px 4px", padding: "14px 16px", background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Valid Time Window</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>From</div>
                    <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 700 }}>{new Date(pass.approved_start_time).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <span style={{ color: "#cbd5e1", fontSize: 16 }}>→</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>To</div>
                    <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 700 }}>{new Date(pass.approved_end_time).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{ padding: "8px 20px 4px" }}>
              {[
                { label: "Host",       value: visit?.host_name },
                { label: "Department", value: visit?.department },
                { label: "Purpose",    value: visit?.purpose },
                { label: "Date",       value: visit?.preferred_date ? new Date(visit.preferred_date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "—" },
                { label: "Time",       value: visit?.preferred_time },
              ].filter(d => d.value).map((d, i) => (
                <div className="detail-row" key={i}>
                  <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600, textAlign: "right", maxWidth: 200 }}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: 10, color: "#94a3b8", letterSpacing: "1px", fontWeight: 600, textTransform: "uppercase" }}>
              VisitorPass · {new Date().getFullYear()} · Secure Access
            </div>
          </div>

          {/* ── Actions Panel ── */}
          <div className="actions-panel">
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.3px" }}>Pass Actions</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Manage your visitor pass</div>
            </div>

            <button className="action-btn action-primary" onClick={handleShare}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{copied ? "✅" : "🔗"}</span>
              <div>
                <div>{copied ? "Copied!" : "Share Pass"}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2, fontWeight: 400 }}>Copy link or share via app</div>
              </div>
            </button>

            <button className="action-btn action-secondary" onClick={() => navigate("/dashboard")} style={{ border: "1.5px solid #e2e8f0" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>←</span>
              <div>
                <div style={{ fontWeight: 600 }}>Back to Dashboard</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>View all your visits</div>
              </div>
            </button>

            <button className="action-btn action-secondary" onClick={() => navigate("/visit")} style={{ border: "1.5px solid #e2e8f0" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>+</span>
              <div>
                <div style={{ fontWeight: 600 }}>New Visit Request</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Schedule another visit</div>
              </div>
            </button>

            {/* Status Card */}
            <div className="status-card">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Visit Status</div>
              {[
                { label: "Status",    value: visit?.status ? visit.status.charAt(0).toUpperCase() + visit.status.slice(1) : "—" },
                { label: "Submitted", value: visit?.created_at ? new Date(visit.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                { label: "Check In",  value: visit?.check_in_time  ? new Date(visit.check_in_time).toLocaleTimeString("en",  { hour: "2-digit", minute: "2-digit" }) : "Not yet" },
                { label: "Check Out", value: visit?.check_out_time ? new Date(visit.check_out_time).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) : "Not yet" },
              ].map((r, i) => (
                <div className="status-row" key={i}>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: r.label === "Status" ? "#16a34a" : "#374151", fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <div style={{ fontSize: 12, color: "#1d4ed8", lineHeight: 1.65, fontWeight: 500 }}>
                This pass is linked to your identity. Only share with authorized personnel at the entry point.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(15,23,42,0.1)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: 8, minWidth: 220, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ✅ {toast.msg}
        </div>
      )}
    </>
  );
}