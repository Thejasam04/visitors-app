import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHosts, submitVisit } from '../../services/api'

export default function VisitForm() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [step, setStep] = useState(1)
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [photo, setPhoto] = useState(null)

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    purpose: '', host_id: '',
    preferred_date: '', preferred_time: ''
  })

  useEffect(() => {
    getHosts().then(res => setHosts(res.data)).catch(() => {})
    return () => stopCamera()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCameraOn(true)
    } catch {
      setError('Could not access camera. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraOn(false)
  }

  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.8))
    stopCamera()
  }

  const validateStep1 = () => {
    const { name, phone, address, purpose, host_id, preferred_date, preferred_time } = form
    if (!name || !phone || !address || !purpose || !host_id || !preferred_date || !preferred_time) {
      setError('Please fill in all fields'); return false
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number'); return false
    }
    setError(''); return true
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const res = await submitVisit({ ...form, photo })
      navigate('/dashboard', { state: { success: res.data.message, visitor_id: res.data.visitor_id } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit visit request')
    } finally { setLoading(false) }
  }

  const purposes = ['Business Meeting', 'Interview', 'Delivery', 'Personal Visit', 'Client Visit', 'Other']
  const selectedHost = hosts.find(h => h.id == form.host_id)

  const STEPS = ['Visit Details', 'Take Photo', 'Review']

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a' }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .step-enter { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }

        .field-input {
          width: 100%; padding: 12px 14px; border-radius: 10px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #0f172a; font-size: 14px; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .field-input::placeholder { color: #94a3b8; }

        .purpose-pill {
          padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600;
          border: 1.5px solid #e2e8f0; background: #fff; color: #64748b;
          cursor: pointer; transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .purpose-pill:hover { border-color: #bfdbfe; color: #2563eb; background: #eff6ff; }
        .purpose-pill.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }

        .btn-primary {
          width: 100%; padding: 14px; border-radius: 10px;
          background: #2563eb; color: #fff; border: none;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,99,235,0.28);
          margin-top: 24px;
        }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-ghost {
          padding: 13px 22px; border-radius: 10px;
          background: #fff; color: #64748b; border: 1.5px solid #e2e8f0;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #cbd5e1; color: #374151; }

        .btn-outline-blue {
          padding: 13px 22px; border-radius: 10px;
          background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .btn-outline-blue:hover { background: #dbeafe; }

        .review-tile {
          background: #f8fafc; border: 1.5px solid #f1f5f9;
          border-radius: 12px; padding: 14px 16px;
        }

        .field-label {
          display: block; font-size: 13px; font-weight: 600;
          color: #374151; margin-bottom: 8px;
        }
      `}</style>

      {/* ── Topbar ── */}
      <header style={{
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 36px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 12px rgba(15,23,42,0.06)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8,
          padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#64748b',
          cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
        >← Dashboard</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.28)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>VisitorPass</span>
        </div>
      </header>

      {/* ── Main ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Register a Visit
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Fill in the details below to schedule your visit.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {STEPS.map((label, i) => {
            const num = i + 1
            const done = step > num
            const active = step === num
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: done || active ? '#2563eb' : '#fff',
                  border: `1.5px solid ${done || active ? '#2563eb' : '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  color: done || active ? '#fff' : '#94a3b8',
                  boxShadow: active ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none',
                  transition: 'all 0.3s',
                }}>{done ? '✓' : num}</div>
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: active ? '#0f172a' : done ? '#2563eb' : '#94a3b8', marginRight: i < 2 ? 8 : 0, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                {i < 2 && (
                  <div style={{ flex: 1, height: 2, borderRadius: 2, background: step > num ? '#2563eb' : '#e2e8f0', margin: '0 10px', transition: 'background 0.4s' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '36px 36px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)' }}>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#dc2626', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="step-enter">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Visit Details</h2>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Fill in your personal information</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">Full Name</label>
                  <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
                </div>

                <div>
                  <label className="field-label">Phone Number</label>
                  <input className="field-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" maxLength={10} />
                </div>

                <div>
                  <label className="field-label">Select Host</label>
                  <select className="field-input" value={form.host_id} onChange={e => set('host_id', e.target.value)} style={{ cursor: 'pointer' }}>
                    <option value="">Choose a host...</option>
                    {hosts.map(h => <option key={h.id} value={h.id}>{h.name} — {h.department}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">Purpose of Visit</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {purposes.map(p => (
                      <button key={p} className={`purpose-pill${form.purpose === p ? ' active' : ''}`} onClick={() => set('purpose', p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label className="field-label">Address</label>
                  <textarea className="field-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Your full address" rows={2} style={{ resize: 'vertical' }} />
                </div>

                <div>
                  <label className="field-label">Preferred Date</label>
                  <input className="field-input" type="date" value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>

                <div>
                  <label className="field-label">Preferred Time</label>
                  <input className="field-input" type="time" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)} />
                </div>
              </div>

              <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2) }}>
                Next: Take Photo →
              </button>
            </div>
          )}

          {/* ── Step 2: Photo ── */}
          {step === 2 && (
            <div className="step-enter" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Take Your Photo</h2>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>This will appear on your visitor pass</p>
                </div>
              </div>

              {/* Camera preview */}
              <div style={{
                width: 260, height: 260, borderRadius: 18, overflow: 'hidden',
                border: '1.5px solid #e2e8f0', margin: '0 auto 24px',
                background: '#f8fafc', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
              }}>
                {photo ? (
                  <img src={photo} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : cameraOn ? (
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Camera is off</div>
                  </div>
                )}
                {photo && (
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                    ✓ Captured
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Camera buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                {!photo && !cameraOn && (
                  <button className="btn-outline-blue" onClick={startCamera}>📷 Start Camera</button>
                )}
                {cameraOn && !photo && (
                  <button className="btn-outline-blue" onClick={capturePhoto} style={{ background: '#2563eb', color: '#fff', borderColor: '#2563eb' }}>📸 Capture Photo</button>
                )}
                {photo && (
                  <button className="btn-ghost" onClick={() => { setPhoto(null); startCamera() }}>🔄 Retake Photo</button>
                )}
              </div>

              {/* Nav buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => { stopCamera(); setStep(1) }} style={{ flex: '0 0 auto' }}>← Back</button>
                <button className="btn-primary" onClick={() => { stopCamera(); setStep(3) }} style={{ flex: 1, marginTop: 0 }}>
                  {photo ? 'Next: Review →' : 'Skip Photo →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="step-enter">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Review & Submit</h2>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Confirm your visit details before submitting</p>
                </div>
              </div>

              {/* Visitor info header */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: 14, padding: '16px 18px' }}>
                {photo ? (
                  <img src={photo} alt="visitor" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1.5px solid #e2e8f0', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {form.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{form.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{form.phone}</div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  ['🎯 Purpose',    form.purpose],
                  ['👤 Host',       selectedHost?.name || '—'],
                  ['🏢 Department', selectedHost?.department || '—'],
                  ['📅 Date',       form.preferred_date],
                  ['⏰ Time',       form.preferred_time],
                  ['📍 Address',    form.address],
                ].map(([label, value]) => (
                  <div key={label} className="review-tile">
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>ℹ️</span>
                <span>Once submitted, your host will be notified. You'll receive a QR pass upon approval.</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setStep(2)} style={{ flex: '0 0 auto' }}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1, marginTop: 0, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting...' : '✅ Submit Visit Request'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress hint */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          Step {step} of 3 · {step === 1 ? 'Enter your details' : step === 2 ? 'Take a photo for your pass' : 'Almost done!'}
        </div>
      </div>
    </div>
  )
}