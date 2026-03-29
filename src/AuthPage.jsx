import React, { useState } from 'react';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const API = 'https://interview-backend-no91.onrender.com/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const body     = mode === 'login'
        ? { email, password }
        : { name, email, password };

      const res  = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('Auth response:', data); // debug — check what backend returns

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

      // Guard: make sure we got a valid user object back
      if (!data.user || !data.token) {
        setError('Server returned an invalid response. Check backend logs.');
        return;
      }

      // Ensure name field exists (fallback to email prefix if missing)
      const safeUser = {
        ...data.user,
        name: data.user.name || data.user.email?.split('@')[0] || 'User',
      };

      // Store token + user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(safeUser));
      onAuthSuccess(safeUser);

    } catch {
      setError('Cannot reach server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setName(''); setEmail(''); setPassword('');
  };

  return (
    <div style={a.page}>
      <style>{css}</style>

      {/* Left panel — branding */}
      <div style={a.left}>
        <div style={a.leftInner}>
          <div style={a.brand}>
            <span style={a.brandAccent}>AI</span> Interview Pro
          </div>
          <h2 style={a.leftTitle}>
            Practice smarter.<br />
            Land the role.
          </h2>
          <p style={a.leftSub}>
            AI-powered mock interviews with real-time speech analysis,
            instant scoring, and detailed feedback — all in one place.
          </p>

          <div style={a.featureList}>
            {[
              ['🎙️', 'Speech-to-text answer recording'],
              ['⚡', 'AI scoring on confidence, clarity & technical depth'],
              ['📊', 'Detailed feedback per session'],
              ['📚', 'Curated question sets across 3 categories'],
              ['📄', 'Downloadable PDF reports'],
            ].map(([icon, text]) => (
              <div key={text} style={a.feature}>
                <span style={a.featureIcon}>{icon}</span>
                <span style={a.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div style={a.blob1} />
        <div style={a.blob2} />
      </div>

      {/* Right panel — form */}
      <div style={a.right}>
        <div style={a.card}>
          {/* Tabs */}
          <div style={a.tabs}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                style={{ ...a.tab, ...(mode === t ? a.tabActive : {}) }}
                onClick={() => { setMode(t); setError(''); }}
                className="auth-tab"
              >
                {t === 'login' ? '🔐 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          <h3 style={a.formTitle}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </h3>
          <p style={a.formSub}>
            {mode === 'login'
              ? 'Sign in to access your sessions and reports.'
              : 'Join thousands of students prepping for placements.'}
          </p>

          <form onSubmit={handleSubmit} style={a.form}>
            {/* Name — register only */}
            {mode === 'register' && (
              <div style={a.field} className="auth-field">
                <label style={a.label}>Full Name</label>
                <input
                  style={a.input}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="auth-input"
                />
              </div>
            )}

            {/* Email */}
            <div style={a.field} className="auth-field">
              <label style={a.label}>Email Address</label>
              <input
                style={a.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            {/* Password */}
            <div style={a.field} className="auth-field">
              <label style={a.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...a.input, paddingRight: '3rem' }}
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  style={a.eyeBtn}
                  onClick={() => setShowPass(p => !p)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={a.errorBox}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{ ...a.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
              className="auth-submit"
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={a.spinner} /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'
              }
            </button>
          </form>

          {/* Switch mode */}
          <p style={a.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button style={a.switchBtn} onClick={switchMode} className="auth-switch">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const a = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
  },

  // Left branding panel
  left: {
    flex: '1',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    padding: '3rem',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '440px',
  },
  brand: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
    marginBottom: '2.5rem',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  leftTitle: {
    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
    fontWeight: '900',
    color: '#f8fafc',
    lineHeight: 1.2,
    letterSpacing: '-0.03em',
    margin: '0 0 1rem',
  },
  leftSub: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: 1.75,
    margin: '0 0 2.5rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  featureIcon: {
    fontSize: '1.1rem',
    width: '36px',
    height: '36px',
    background: 'rgba(129,140,248,0.12)',
    border: '1px solid rgba(129,140,248,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: '0.88rem',
    fontWeight: '500',
  },
  blob1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
    zIndex: 1,
  },
  blob2: {
    position: 'absolute', bottom: '-80px', left: '-80px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
    zIndex: 1,
  },

  // Right form panel
  right: {
    flex: '1',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
  },

  // Tabs
  tabs: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '1.75rem',
    gap: '4px',
  },
  tab: {
    flex: 1,
    padding: '0.6rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  tabActive: {
    background: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },

  formTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.4rem',
    letterSpacing: '-0.02em',
  },
  formSub: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 1.75rem',
    lineHeight: 1.6,
  },

  // Form
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#374151',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.93rem',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
  },

  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '500',
  },

  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '0.9rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.4rem',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
    transition: 'all 0.2s',
  },

  spinner: {
    display: 'inline-block',
    width: '14px', height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  switchText: {
    textAlign: 'center',
    margin: '1.25rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    padding: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    background: #fff !important;
  }

  .auth-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.45) !important;
  }

  .auth-switch:hover { text-decoration: underline; }
  .auth-tab:hover { color: #0f172a; }

  .auth-field {
    animation: fadeSlideUp 0.3s ease;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .auth-left { display: none !important; }
    .auth-right { flex: 1 !important; }
  }
`;