import { useState } from "react";
import { adminLogin } from "../../services/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); triggerShake(); return; }
    setIsLoading(true); setError("");
    try {
      const { data } = await adminLogin(email, password);
      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Server error. Please try again.");
      triggerShake();
    } finally { setIsLoading(false); }
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8faff; font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes cardIn  { from { opacity:0; transform: translateY(20px) scale(0.98); } to { opacity:1; transform: none; } }
        @keyframes fadeIn  { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: none; } }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .field-input {
          width: 100%; padding: 13px 14px 13px 42px; border-radius: 10px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #0f172a; font-size: 14px; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .field-input::placeholder { color: #94a3b8; }

        .submit-btn {
          width: 100%; padding: 14px; border-radius: 10px;
          background: #2563eb; color: #fff; border: none;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #e2e8f0; color: #64748b;
          padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .back-btn:hover { border-color: #2563eb; color: #2563eb; }

        .card { animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .card.shake { animation: shake 0.45s ease; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 50%, #f8faff 100%)", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── Left panel ── */}
        <div style={{
          width: "45%", minHeight: "100vh",
          background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 56px", position: "relative", overflow: "hidden",
        }}>
          {/* BG decoration */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "-150px", right: "-100px" }} />
            <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: "-80px", left: "-80px" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>VisitorPass</span>
            </div>

            {/* Shield icon */}
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 28 }}>
              🛡️
            </div>

            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 16 }}>
              Admin Portal.<br />Secure access<br />starts here.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 52, maxWidth: 320 }}>
              Access the admin dashboard to manage hosts, visitors, approvals, and reports.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "👥", text: "Manage all visitors & hosts" },
                { icon: "📊", text: "Live dashboard & reports" },
                { icon: "🔒", text: "Role-based secure access" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Admin credentials managed by Super Admin</span>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>

          {/* Back button */}
          <div style={{ position: "absolute", top: 28, left: 32 }}>
            <button className="back-btn" onClick={() => window.history.back()}>← Back</button>
          </div>

          {/* Form card */}
          <div className={`card${shake ? " shake" : ""}`} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(15,23,42,0.08)" }}>

            {/* Icon */}
            <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              🛡️
            </div>

            {/* Admin badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 100, padding: "4px 12px", marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "0.5px", textTransform: "uppercase" }}>Admin Portal</span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 6 }}>Admin Sign In</h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32, lineHeight: 1.6 }}>
              Enter your credentials to access the admin panel.
            </p>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8", pointerEvents: "none" }}>✉️</span>
                <input className="field-input" type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8", pointerEvents: "none" }}>🔑</span>
                <input className="field-input" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPassword(!showPassword)} tabIndex={-1} type="button" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", transition: "color 0.2s", padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "12px 16px", margin: "16px 0", color: "#dc2626", fontSize: 13, fontWeight: 500, animation: "fadeIn 0.25s ease" }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isLoading
                  ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Signing in…</>
                  : "Sign In to Admin Panel →"
                }
              </div>
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 0" }}>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Secure Access</span>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            </div>

            <p style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
              Credentials are managed by your{" "}
              <span style={{ color: "#2563eb", fontWeight: 600 }}>Super Admin</span>.<br />
              Contact your system administrator for access.
            </p>
          </div>

          {/* Footer */}
          <p style={{ marginTop: 24, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            Not an admin?{" "}
            <span style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }} onClick={() => window.location.href = "/auth"}>
              Sign in as visitor →
            </span>
          </p>
        </div>

        {/* Hide left panel on mobile */}
        <style>{`@media(max-width:768px){.left-panel{display:none!important}}`}</style>
      </div>
    </>
  );
};

export default AdminLogin;