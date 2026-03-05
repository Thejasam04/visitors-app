import { useState, useEffect } from "react";
import { getAdminHosts, addHost, updateHost, deleteHost } from "../../services/api";

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const AVATAR_COLORS = [
  ["#2563eb","#1d4ed8"], ["#16a34a","#15803d"], ["#d97706","#b45309"],
  ["#7c3aed","#6d28d9"], ["#db2777","#be185d"], ["#0891b2","#0e7490"],
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "error" ? "#fef2f2" : "#f0fdf4",
        border: `1.5px solid ${t.type === "error" ? "#fecaca" : "#bbf7d0"}`,
        color: t.type === "error" ? "#dc2626" : "#16a34a",
        padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        boxShadow: "0 4px 20px rgba(15,23,42,0.1)",
        animation: "toastIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", alignItems: "center", gap: 8, minWidth: 260,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {t.type === "error" ? "⚠️" : "✅"} {t.msg}
      </div>
    ))}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: 36, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(15,23,42,0.15)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}
        >✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text", error }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "#fff", border: `1.5px solid ${error ? "#fecaca" : "#e2e8f0"}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0f172a", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
      onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
      onBlur={e  => { e.target.style.borderColor = error ? "#fecaca" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
    />
    {error && <span style={{ fontSize: 12, color: "#dc2626", marginTop: 4, display: "block", fontWeight: 500 }}>{error}</span>}
  </div>
);

const DeleteModal = ({ host, onConfirm, onCancel, loading }) => (
  <Modal title="Delete Host" onClose={onCancel}>
    <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🗑️</div>
      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65, marginBottom: 6 }}>Are you sure you want to delete</p>
      <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{host.name}</p>
      <p style={{ color: "#94a3b8", fontSize: 12 }}>This action cannot be undone.</p>
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
        onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
      >Cancel</button>
      <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "12px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = "#fee2e2")}
        onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
      >{loading ? "Deleting…" : "Delete Host"}</button>
    </div>
  </Modal>
);

const HostFormModal = ({ host, onSave, onClose, loading }) => {
  const [name,   setName]   = useState(host?.name || "");
  const [dept,   setDept]   = useState(host?.department || "");
  const [email,  setEmail]  = useState(host?.email || "");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())  e.name  = "Name is required";
    if (!dept.trim())  e.dept  = "Department is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    setErrors(e);
    return !Object.keys(e).length;
  };

  return (
    <Modal title={host ? "Edit Host" : "Add New Host"} onClose={onClose}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 20 }}>
        {host ? "✏️" : "➕"}
      </div>
      <Field label="Full Name"  value={name}  onChange={setName}  placeholder="e.g. Priya Sharma"      error={errors.name} />
      <Field label="Department" value={dept}  onChange={setDept}  placeholder="e.g. Engineering"       error={errors.dept} />
      <Field label="Email"      value={email} onChange={setEmail} placeholder="e.g. priya@company.com" error={errors.email} type="email" />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
        >Cancel</button>
        <button onClick={() => { if (validate()) onSave({ name: name.trim(), department: dept.trim(), email: email.trim() }); }} disabled={loading}
          style={{ flex: 1, padding: "12px", background: "#2563eb", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: loading ? 0.6 : 1 }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
        >{loading ? "Saving…" : host ? "Save Changes" : "Add Host"}</button>
      </div>
    </Modal>
  );
};

export default function HostsManagement() {
  const [hosts,    setHosts]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [toasts,   setToasts]   = useState([]);

  useEffect(() => { fetchHosts(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(hosts.filter(h => h.name.toLowerCase().includes(q) || h.department.toLowerCase().includes(q) || h.email.toLowerCase().includes(q)));
  }, [search, hosts]);

  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchHosts = async () => {
    setLoading(true);
    try { const { data } = await getAdminHosts(); setHosts(data); }
    catch { toast("Failed to load hosts", "error"); }
    finally { setLoading(false); }
  };

  const handleAdd    = async (form) => { setSaving(true); try { await addHost(form);              toast("Host added successfully");   setModal(null); fetchHosts(); } catch (e) { toast(e.response?.data?.error || "Failed to add host",    "error"); } finally { setSaving(false); } };
  const handleEdit   = async (form) => { setSaving(true); try { await updateHost(selected.id, form); toast("Host updated successfully"); setModal(null); fetchHosts(); } catch (e) { toast(e.response?.data?.error || "Failed to update host", "error"); } finally { setSaving(false); } };
  const handleDelete = async ()     => { setSaving(true); try { await deleteHost(selected.id);    toast("Host deleted");              setModal(null); fetchHosts(); } catch (e) { toast(e.response?.data?.error || "Failed to delete host", "error"); } finally { setSaving(false); } };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .hm-wrap { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; font-family: 'Plus Jakarta Sans', sans-serif; }

        .hm-search {
          width: 100%; background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 11px 14px 11px 38px;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a; outline: none; transition: all 0.2s;
        }
        .hm-search::placeholder { color: #94a3b8; }
        .hm-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .add-btn {
          display: flex; align-items: center; gap: 8px;
          background: #2563eb; border: none; border-radius: 10px;
          padding: 11px 20px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700; color: #fff; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .add-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }

        .host-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 20px; transition: all 0.2s;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 1px 6px rgba(15,23,42,0.04);
        }
        .host-card:hover { border-color: #bfdbfe; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.08); }

        .btn-edit {
          background: #eff6ff; border: 1.5px solid #bfdbfe; color: #2563eb;
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .btn-edit:hover { background: #dbeafe; }

        .btn-del {
          background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626;
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .btn-del:hover { background: #fee2e2; }

        .skeleton { background: linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }

        .stat-chip {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 12px;
          padding: 14px 20px; display: flex; flex-direction: column; gap: 2px;
          min-width: 120px; box-shadow: 0 1px 6px rgba(15,23,42,0.04);
          transition: all 0.2s;
        }
        .stat-chip:hover { border-color: #bfdbfe; box-shadow: 0 4px 14px rgba(37,99,235,0.08); }
      `}</style>

      <div className="hm-wrap">

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
            <input className="hm-search" placeholder="Search by name, department or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="add-btn" onClick={() => { setSelected(null); setModal("add"); }}>
            + Add Host
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { val: hosts.length,                                           label: "Total Hosts",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "🏷️" },
            { val: [...new Set(hosts.map(h => h.department))].length,     label: "Departments",  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "🏢" },
            ...(search ? [{ val: filtered.length, label: "Results", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "🔎" }] : []),
          ].map((s, i) => (
            <div key={i} className="stat-chip">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bg, border: `1.5px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{s.icon}</div>
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Host cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 170, animationDelay: `${i * 0.05}s` }} />)
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12, background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}>
              <span style={{ fontSize: 44, opacity: 0.3 }}>🏷️</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{search ? "No hosts found" : "No hosts yet"}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{search ? "Try a different search" : "Click '+ Add Host' to get started"}</span>
              {!search && <button className="add-btn" onClick={() => { setSelected(null); setModal("add"); }} style={{ marginTop: 8 }}>+ Add Host</button>}
            </div>
          ) : (
            filtered.map((host, i) => {
              const [c1, c2] = avatarColor(host.name);
              return (
                <div className="host-card" key={host.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Card top */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${c1},${c2})`, color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 12px ${c1}40` }}>
                      {getInitials(host.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.2px" }}>{host.name}</div>
                      <span style={{ fontSize: 11, color: "#64748b", background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>
                        🏢 {host.department}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
                    <span style={{ flexShrink: 0, fontSize: 14 }}>✉️</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{host.email}</span>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                      Added {new Date(host.created_at || Date.now()).toLocaleDateString("en", { month: "short", year: "numeric" })}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-edit" onClick={() => { setSelected(host); setModal("edit"); }}>Edit</button>
                      <button className="btn-del"  onClick={() => { setSelected(host); setModal("delete"); }}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {modal === "add"    && <HostFormModal host={null}     onSave={handleAdd}       onClose={() => setModal(null)} loading={saving} />}
      {modal === "edit"   && <HostFormModal host={selected} onSave={handleEdit}      onClose={() => setModal(null)} loading={saving} />}
      {modal === "delete" && <DeleteModal   host={selected} onConfirm={handleDelete} onCancel={() => setModal(null)} loading={saving} />}
      <Toast toasts={toasts} />
    </>
  );
}