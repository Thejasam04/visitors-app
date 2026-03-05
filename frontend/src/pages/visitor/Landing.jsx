import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeTab, setActiveTab] = useState('visitors')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.dataset.visible = 'true' }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const features = [
    { icon: '🔑', title: 'OTP-Based Login', desc: 'Visitors log in using just their email and a 6-digit code. No passwords, no confusion.' },
    { icon: '📷', title: 'Webcam Photo Capture', desc: 'Snap a verified photo at registration for identity confirmation — zero manual effort.' },
    { icon: '🪪', title: 'Digital Visitor Pass', desc: 'QR-based pass issued instantly upon host approval, delivered straight to email.' },
    { icon: '✅', title: 'One-Click Host Approval', desc: 'Hosts receive an email and approve or decline a visit with a single click.' },
    { icon: '📊', title: 'Live Visit Dashboard', desc: 'Track every visit in real time — pending, active, approved, and completed.' },
    { icon: '🛡️', title: 'Admin Control Panel', desc: 'Manage hosts, view all visitors, access detailed reports, and stay in control.' },
    { icon: '📧', title: 'Email Notifications', desc: 'Automated alerts keep hosts and visitors informed at every step of the process.' },
    { icon: '🏢', title: 'Multi-Host Support', desc: 'Supports multiple departments and hosts across your entire organization.' },
  ]

  const steps = [
    { n: '01', title: 'Visitor Registration', desc: 'Visitors enter their details, select a host, state their purpose, and snap a webcam photo to register their visit.' },
    { n: '02', title: 'Host Notification', desc: 'The host receives an instant email with all visitor details and a one-click approve/decline button.' },
    { n: '03', title: 'Digital Pass Issued', desc: 'Once approved, a secure QR visitor pass is generated and sent to the visitor\'s inbox immediately.' },
    { n: '04', title: 'Track & Monitor', desc: 'Admins and hosts monitor all activity on the live dashboard and generate reports anytime.' },
  ]

  const testimonials = [
    { name: 'Arjun Mehta', role: 'IT Manager', company: 'Nexus Technologies', text: 'VisitorPass eliminated our paper registers overnight. The QR pass system is seamless and our reception team loves it.', rating: 5 },
    { name: 'Divya Nair', role: 'HR Director', company: 'InnovateCorp', text: 'Host approvals used to take forever. Now it\'s one click from email. We went live in under an hour — truly impressive.', rating: 5 },
    { name: 'Karan Shah', role: 'Facility Manager', company: 'PrimeBuild Ltd', text: 'Security has improved drastically. We always know who\'s on premises. The live dashboard gives us total visibility.', rating: 5 },
  ]

  const faqs = [
    { q: 'How quickly can we go live?', a: 'Most organizations are fully set up within 30 minutes. No technical knowledge required — just add your hosts and share the link.' },
    { q: 'Do visitors need to create an account?', a: 'No. Visitors simply enter their email, receive a one-time code, and register their visit. Zero friction, zero onboarding.' },
    { q: 'How does host approval work?', a: 'Hosts receive an email notification with visitor details and a one-click approve or decline button. No app or login required.' },
    { q: 'Is visitor data secure?', a: 'Absolutely. All data is encrypted in transit and at rest. Access is role-based and tightly controlled per organization.' },
    { q: 'Can we export visit records and reports?', a: 'Yes. Admins can export complete visit histories and reports in standard formats directly from the dashboard.' },
    { q: 'What happens after a visit is approved?', a: 'The visitor instantly receives a QR-code digital pass via email, valid for the approved time window.' },
  ]

  const industries = [
    { icon: '🏢', name: 'Corporate Offices' },
    { icon: '💻', name: 'IT Parks' },
    { icon: '🏭', name: 'Manufacturing Units' },
    { icon: '🏫', name: 'Educational Institutions' },
    { icon: '🤝', name: 'Co-working Spaces' },
    { icon: '🏥', name: 'Healthcare Facilities' },
  ]

  const S = {
    section: { padding: '90px 24px' },
    container: { maxWidth: 1100, margin: '0 auto' },
    sectionTag: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#eff6ff', color: '#2563eb', borderRadius: 100,
      padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 700,
      color: '#0f172a', letterSpacing: '-0.8px', lineHeight: 1.18, marginBottom: 14,
    },
    sectionSub: { fontSize: 16, color: '#64748b', lineHeight: 1.75, maxWidth: 520 },
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#ffffff', color: '#0f172a', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        [data-reveal] {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        [data-reveal][data-visible="true"] { opacity: 1; transform: none; }
        [data-d="1"] { transition-delay: 0.05s; }
        [data-d="2"] { transition-delay: 0.12s; }
        [data-d="3"] { transition-delay: 0.19s; }
        [data-d="4"] { transition-delay: 0.26s; }
        [data-d="5"] { transition-delay: 0.33s; }
        [data-d="6"] { transition-delay: 0.40s; }
        [data-d="7"] { transition-delay: 0.47s; }
        [data-d="8"] { transition-delay: 0.54s; }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(22px); }
          to   { opacity:1; transform: none; }
        }
        .a1 { animation: fadeUp 0.8s ease 0.05s both; }
        .a2 { animation: fadeUp 0.8s ease 0.15s both; }
        .a3 { animation: fadeUp 0.8s ease 0.25s both; }
        .a4 { animation: fadeUp 0.8s ease 0.35s both; }
        .a5 { animation: fadeUp 0.8s ease 0.45s both; }

        .btn-blue {
          display: inline-flex; align-items: center; gap: 7px;
          background: #2563eb; color: #fff; border: none;
          padding: 13px 26px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .btn-blue:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.35); }

        .btn-white {
          display: inline-flex; align-items: center; gap: 7px;
          background: #fff; color: #374151; border: 1.5px solid #e5e7eb;
          padding: 13px 26px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s;
        }
        .btn-white:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-1px); }

        .nav-link {
          font-size: 14px; font-weight: 500; color: #374151;
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: color 0.15s; padding: 4px 0;
        }
        .nav-link:hover { color: #2563eb; }

        .feat-card {
          background: #fff; border: 1.5px solid #f1f5f9;
          border-radius: 14px; padding: 28px 24px;
          transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .feat-card:hover { border-color: #bfdbfe; box-shadow: 0 6px 24px rgba(37,99,235,0.08); transform: translateY(-2px); }

        .step-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 32px 28px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); transition: all 0.2s;
        }
        .step-card:hover { border-color: #bfdbfe; box-shadow: 0 8px 28px rgba(37,99,235,0.09); transform: translateY(-2px); }

        .testi-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: 28px 26px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); transition: all 0.2s;
        }
        .testi-card:hover { border-color: #bfdbfe; box-shadow: 0 6px 20px rgba(37,99,235,0.07); }

        .faq-item {
          border: 1.5px solid #f1f5f9; border-radius: 12px;
          overflow: hidden; margin-bottom: 10px; transition: border-color 0.2s;
        }
        .faq-item.open { border-color: #bfdbfe; }
        .faq-q {
          width: 100%; background: #fff; border: none; padding: 20px 24px;
          font-size: 15px; font-weight: 600; color: #0f172a; text-align: left;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; justify-content: space-between; align-items: center; gap: 16px;
        }
        .faq-q:hover { color: #2563eb; }

        .stat-num {
          font-size: clamp(32px, 4vw, 48px); font-weight: 800;
          color: #0f172a; letter-spacing: -1.5px; line-height: 1;
        }

        .check-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; color: #374151; line-height: 1.6; padding: 6px 0;
        }

        .industry-card {
          background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 12px;
          padding: 22px 20px; text-align: center; transition: all 0.2s; cursor: default;
        }
        .industry-card:hover { background: #eff6ff; border-color: #bfdbfe; transform: translateY(-2px); }

        .badge-strip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;
          border-radius: 100px; padding: 4px 12px; font-size: 12px; font-weight: 600;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>VisitorPass</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 30 }}>
          {['Features', 'How It Works', 'Industries', 'FAQ'].map(l => (
            <button key={l} className="nav-link">{l}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="nav-link" style={{ padding: '8px 14px' }} onClick={() => navigate('/auth')}>Sign In</button>
          <button className="btn-blue" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => navigate('/auth')}>
            Register a Visit →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 60%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle bg rings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }} />
          <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }} />
          <div style={{ position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 65%)', top: '-300px', left: '50%', transform: 'translateX(-50%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div className="a1" style={{ marginBottom: 22 }}>
            <span className="badge-strip">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Go live in under 30 minutes
            </span>
          </div>

          <h1 className="a2" style={{
            fontSize: 'clamp(38px, 6.5vw, 68px)', fontWeight: 800,
            color: '#0f172a', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 20,
          }}>
            Visitor Management<br />
            <span style={{ color: '#2563eb' }}>Made Simple.</span>
          </h1>

          <p className="a3" style={{ fontSize: 18, color: '#64748b', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px', fontWeight: 400 }}>
            A complete platform to digitalize your organization's entry management — OTP check-ins, instant QR passes, and real-time host approvals.
          </p>

          <div className="a4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
            <button className="btn-blue" onClick={() => navigate('/auth')} style={{ padding: '14px 32px', fontSize: 15 }}>
              Register a Visit →
            </button>
            <button className="btn-white" onClick={() => navigate('/auth')} style={{ padding: '14px 32px', fontSize: 15 }}>
              Track My Visit
            </button>
          </div>

          {/* Trust badges */}
          <div className="a5" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['✓', 'No account needed'], ['✓', 'Check in under 30s'], ['✓', '100% paperless'], ['✓', 'Free to get started']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>

        {/* Hero dashboard card */}
        <div className="a5" style={{ position: 'relative', zIndex: 1, marginTop: 64, maxWidth: 900, width: '100%' }}>
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 70px rgba(15,23,42,0.1)' }}>
            {/* Browser bar */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, maxWidth: 300, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#94a3b8', fontWeight: 500, textAlign: 'center' }}>
                🔒 visitorpass.app/dashboard
              </div>
            </div>

            {/* Dashboard UI */}
            <div style={{ padding: '24px', background: '#f8fafc' }}>
              {/* Top row stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Today's Visitors", val: '24', color: '#2563eb', bg: '#eff6ff' },
                  { label: 'Pending Approval', val: '5', color: '#d97706', bg: '#fffbeb' },
                  { label: 'Approved Today', val: '18', color: '#16a34a', bg: '#f0fdf4' },
                  { label: 'Avg Check-in', val: '28s', color: '#7c3aed', bg: '#f5f3ff' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{s.val}</div>
                    <div style={{ display: 'inline-flex', marginTop: 6, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 600 }}>● Live</div>
                  </div>
                ))}
              </div>

              {/* Recent visits table */}
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Recent Visitors</span>
                  <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>View all →</span>
                </div>
                {[
                  { name: 'Rahul Sharma', host: 'HR Dept', time: '10:30 AM', status: 'Approved', sc: '#16a34a', sb: '#f0fdf4' },
                  { name: 'Meera Patel', host: 'Finance', time: '11:15 AM', status: 'Pending', sc: '#d97706', sb: '#fffbeb' },
                  { name: 'Amit Singh', host: 'IT Dept', time: '12:00 PM', status: 'Approved', sc: '#16a34a', sb: '#f0fdf4' },
                ].map((r, i) => (
                  <div key={r.name} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                      {r.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Host: {r.host} · {r.time}</div>
                    </div>
                    <div style={{ background: r.sb, color: r.sc, borderRadius: 5, padding: '3px 8px', fontSize: 10, fontWeight: 600 }}>{r.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: -30, left: '15%', right: '15%', height: 50, background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(16px)' }} />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ padding: '60px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: '#f1f5f9', border: '1.5px solid #f1f5f9', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { val: '500+', label: 'Daily Visitors', icon: '👥' },
            { val: '< 30s', label: 'Avg Check-in Time', icon: '⚡' },
            { val: '99.9%', label: 'Platform Uptime', icon: '🛡️' },
            { val: '1-Click', label: 'Host Approvals', icon: '✅' },
            { val: '100%', label: 'Paperless Process', icon: '♻️' },
          ].map((s, i) => (
            <div key={s.label} data-reveal data-d={i+1} style={{ background: '#fff', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <div className="stat-num">{s.val}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ ...S.section, background: '#fafbff' }}>
        <div style={S.container}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={S.sectionTag}>✨ Powerful Features</span>
            <h2 style={{ ...S.sectionTitle, margin: '0 auto 14px' }}>Why Organizations Choose VisitorPass</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>Everything you need to manage visitors seamlessly — without the paperwork.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={f.title} className="feat-card" data-reveal data-d={(i % 4) + 1}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.2px' }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ ...S.section, background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={S.container}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={S.sectionTag}>✨ Simple Process</span>
            <h2 style={{ ...S.sectionTitle, margin: '0 auto 14px' }}>How VisitorPass Works</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>A streamlined 4-step process to manage all your visitors with zero manual effort.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {steps.map((s, i) => (
              <div key={s.n} className="step-card" data-reveal data-d={i + 1}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  color: '#2563eb', fontWeight: 800, fontSize: 15, marginBottom: 20,
                  border: '1.5px solid #bfdbfe',
                }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.2px' }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Checklist ── */}
      <section style={{ ...S.section, background: '#f0f7ff', borderTop: '1px solid #e0ebff' }}>
        <div style={{ ...S.container, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div data-reveal>
            <span style={S.sectionTag}>✨ Complete Platform</span>
            <h2 style={{ ...S.sectionTitle, marginTop: 14 }}>Everything You Need,<br />All in One Place</h2>
            <p style={{ ...S.sectionSub, marginBottom: 32 }}>Comprehensive visitor management features designed for modern organizations of every size.</p>
            <button className="btn-blue" onClick={() => navigate('/auth')} style={{ marginTop: 8 }}>
              Get Started Today ↗
            </button>
          </div>
          <div data-reveal data-d="2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[
              'Digital visitor passes', 'OTP-based authentication',
              'Host email notifications', 'One-click approvals',
              'Live visit dashboard', 'Admin control panel',
              'Webcam photo capture', 'Visit history & reports',
              'Multi-host support', '100% paperless process',
            ].map(item => (
              <div key={item} className="check-item">
                <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 13.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section id="industries" style={{ ...S.section, background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={S.container}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={S.sectionTag}>🏢 For Every Industry</span>
            <h2 style={{ ...S.sectionTitle, margin: '0 auto 14px' }}>Designed for Modern Organizations</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>VisitorPass adapts to your industry's unique needs with flexible configurations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {industries.map((ind, i) => (
              <div key={ind.name} className="industry-card" data-reveal data-d={(i % 6) + 1}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{ind.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{ind.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ ...S.section, background: '#fafbff', borderTop: '1px solid #f1f5f9' }}>
        <div style={S.container}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={S.sectionTag}>⭐ Customer Success</span>
            <h2 style={{ ...S.sectionTitle, margin: '0 auto 14px' }}>Trusted by Organizations</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>See what our customers say about their experience with VisitorPass.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 52 }}>
            {testimonials.map((t, i) => (
              <div key={t.name} className="testi-card" data-reveal data-d={i + 1}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(t.rating)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof bar */}
          <div data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, background: '#f1f5f9', border: '1.5px solid #f1f5f9', borderRadius: 14, overflow: 'hidden' }}>
            {[['500+', 'Organizations'], ['50K+', 'Visitors Managed'], ['4.9/5', 'Customer Rating'], ['99.9%', 'Uptime SLA']].map(([v, l]) => (
              <div key={l} style={{ background: '#fff', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', letterSpacing: '-1px' }}>{v}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ ...S.section, background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={S.sectionTag}>❓ Got Questions?</span>
            <h2 style={{ ...S.sectionTitle, margin: '0 auto 14px' }}>Frequently Asked Questions</h2>
            <p style={{ ...S.sectionSub, margin: '0 auto' }}>Everything you need to know about VisitorPass.</p>
          </div>
          <div data-reveal>
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ fontSize: 18, color: '#94a3b8', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '90px 24px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: '-200px', right: '-100px' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: '-150px', left: '-80px' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div data-reveal style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, backdropFilter: 'blur(10px)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Live & ready to use</span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Ready to Check In<br />the Right Way?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', marginBottom: 40, lineHeight: 1.7 }}>
            Join hundreds of organizations that have transformed their visitor management with VisitorPass.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={() => navigate('/auth')} style={{
              background: '#fff', color: '#1d4ed8', border: 'none', padding: '14px 32px',
              borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 18px rgba(0,0,0,0.15)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.15)' }}
            >Register a Visit →</button>
            <button onClick={() => navigate('/admin/login')} style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)', padding: '14px 28px',
              borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none' }}
            >Admin Login</button>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['● Free to start', '● No credit card needed', '● Setup in minutes'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', padding: '56px 40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>VisitorPass</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, maxWidth: 280 }}>
                A platform designed to digitalize organization entry management and ensure a professional visitor experience.
              </p>
            </div>
            {/* Links */}
            {[
              { title: 'Product', links: ['Features', 'How It Works', 'Industries', 'FAQ'] },
              { title: 'Account', links: ['Sign In', 'Register Visit', 'Track Visit', 'Admin Portal'] },
              { title: 'Company', links: ['About', 'Privacy Policy', 'Terms', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: 14, color: '#64748b', marginBottom: 10, cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#475569' }}>© {new Date().getFullYear()} VisitorPass. All rights reserved. · Built on AWS</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {['🛡️ Secure', '☁️ Cloud', '🔒 Encrypted'].map(b => (
                <span key={b} style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
