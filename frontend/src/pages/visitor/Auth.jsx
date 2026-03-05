import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOTP, verifyOTP } from '../../services/api'

export default function Auth() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return }
    setLoading(true); setError('')
    try {
      await sendOTP(email)
      setSuccess('OTP sent! Check your inbox.')
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const newOtp = [...otp]; newOtp[idx] = val; setOtp(newOtp)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); document.getElementById('otp-5')?.focus() }
  }

  const handleVerifyOTP = async () => {
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const res = await verifyOTP(email, otpStr)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0f7ff 0%, #ffffff 50%, #f8faff 100%)',
      display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        .email-input {
          width: 100%; padding: 13px 16px; border-radius: 10px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #0f172a; font-size: 15px; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .email-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .email-input::placeholder { color: #94a3b8; }

        .otp-box {
          width: 52px; height: 60px; text-align: center;
          font-size: 22px; font-weight: 700;
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 12px; color: #0f172a; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .otp-box:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .otp-box.filled {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .btn-primary {
          width: 100%; padding: 14px; border-radius: 10px;
          background: #2563eb; color: #fff; border: none;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.38);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-ghost {
          width: 100%; padding: 13px; border-radius: 10px;
          background: transparent; color: #64748b;
          border: 1.5px solid #e2e8f0;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #cbd5e1; color: #374151; background: #f8fafc; }

        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #64748b; padding: 8px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
        }
        .back-btn:hover { border-color: #2563eb; color: #2563eb; }

        .step-dot {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          transition: all 0.3s;
        }
      `}</style>

      {/* ── Left panel (branding) ── */}
      <div style={{
        width: '45%', minHeight: '100vh',
        background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}
        className="left-panel"
      >
        {/* BG decoration */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-150px', right: '-100px' }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: '-80px', left: '-80px' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>VisitorPass</span>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 18 }}>
            Welcome back.<br />Let's get you<br />checked in.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 52, maxWidth: 320 }}>
            Use your email to receive a one-time code. No passwords needed — fast, secure, and simple.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '⚡', text: 'OTP sent in under 5 seconds' },
              { icon: '🔒', text: 'Secure, passwordless sign-in' },
              { icon: '🪪', text: 'Instant digital visitor pass' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>{item.icon}</div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom trust badge */}
          <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>500+ daily check-ins · 99.9% uptime</span>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 40px', position: 'relative',
      }}>
        {/* Back button top-left */}
        <div style={{ position: 'absolute', top: 28, left: 32 }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to home
          </button>
        </div>

        {/* Admin link top-right */}
        <div style={{ position: 'absolute', top: 28, right: 32 }}>
          <button className="back-btn" onClick={() => navigate('/admin/login')}>
            Admin Portal →
          </button>
        </div>

        {/* Form card */}
        <div className="card-enter" key={step} style={{
          background: '#fff', border: '1.5px solid #e2e8f0',
          borderRadius: 20, padding: '44px 40px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 8px 40px rgba(15,23,42,0.08)',
        }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 24,
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1.5px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            {step === 'email' ? '📧' : '🔐'}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 6 }}>
            {step === 'email' ? 'Sign In' : 'Verify your email'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
            {step === 'email'
              ? 'Enter your email address to receive a one-time code.'
              : <>We sent a 6-digit code to <strong style={{ color: '#0f172a' }}>{email}</strong></>}
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {['Email', 'OTP'].map((label, i) => {
              const isActive = step === 'email' ? i === 0 : true
              const isDone = step === 'otp' && i === 0
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i === 0 ? 1 : 'none' }}>
                  <div className="step-dot" style={{
                    background: isActive ? (isDone ? '#2563eb' : '#2563eb') : '#f1f5f9',
                    color: isActive ? '#fff' : '#94a3b8',
                    border: isActive ? 'none' : '1.5px solid #e2e8f0',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ marginLeft: 7, fontSize: 13, fontWeight: 600, color: isActive ? '#0f172a' : '#94a3b8', marginRight: i === 0 ? 10 : 0 }}>{label}</span>
                  {i === 0 && (
                    <div style={{ flex: 1, height: '2px', borderRadius: 2, background: step === 'otp' ? '#2563eb' : '#e2e8f0', margin: '0 10px', transition: 'background 0.4s' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              color: '#dc2626', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Success */}
          {success && step === 'otp' && (
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              color: '#16a34a', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Email address
              </label>
              <input
                className="email-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                placeholder="you@company.com"
              />
              <button className="btn-primary" onClick={handleSendOTP} disabled={loading} style={{ marginTop: 16 }}>
                {loading ? 'Sending code...' : 'Send one-time code →'}
              </button>

              <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textAlign: 'center', lineHeight: 1.6 }}>
                  A 6-digit code will be sent to your email.<br />
                  No account or password required.
                </div>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                Enter 6-digit code
              </label>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }} onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    className={`otp-box${digit ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = digit ? '#2563eb' : '#e2e8f0'}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  Didn't receive it?{' '}
                  <button onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setSuccess('') }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                    Resend code
                  </button>
                </span>
              </div>

              <button className="btn-primary" onClick={handleVerifyOTP} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & continue →'}
              </button>

              <button className="btn-ghost" onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setSuccess('') }} style={{ marginTop: 10 }}>
                ← Change email
              </button>
            </div>
          )}
        </div>

        {/* Footer text */}
        <p style={{ marginTop: 28, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          By continuing, you agree to our{' '}
          <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Terms</span>
          {' '}and{' '}
          <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Privacy Policy</span>
        </p>
      </div>

      {/* Hide left panel on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
