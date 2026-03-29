import React, { useEffect, useRef, useState } from 'react';

export default function Footer({ onNavigate }) {
  const [year] = useState(new Date().getFullYear());
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const COLS = 18, ROWS = 6;
    const dots = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        dots.push({
          x: (c / (COLS - 1)) * W,
          y: (r / (ROWS - 1)) * H,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.phase += d.speed;
        const alpha = 0.08 + Math.sin(d.phase) * 0.07;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const links = {
    Practice: [
      { label: 'Technical Questions', action: () => onNavigate?.('home') },
      { label: 'Behavioral Questions', action: () => onNavigate?.('home') },
      { label: 'System Design', action: () => onNavigate?.('home') },
      { label: 'Practice Sets', action: () => onNavigate?.('practice-set') },
    ],
    Resources: [
      { label: 'How It Works', action: null },
      { label: 'Scoring Guide', action: null },
      { label: 'Interview Tips', action: null },
      { label: 'Download Report', action: null },
    ],
    About: [
      { label: 'Built for CSE Students', action: null },
      { label: 'Placement Prep', action: null },
      { label: 'AI-Powered Feedback', action: null },
      { label: 'Speech Analysis', action: null },
    ],
  };

  const stats = [
    { value: '3', label: 'Question Types', icon: '🎯' },
    { value: '25+', label: 'Interview Questions', icon: '💡' },
    { value: 'AI', label: 'Powered Scoring', icon: '⚡' },
    { value: '∞', label: 'Practice Sessions', icon: '🔁' },
  ];

  return (
    <footer style={f.root}>
      <canvas ref={canvasRef} style={f.canvas} />

      <div style={f.ctaStrip}>
        <div style={f.ctaInner}>
          <div style={f.ctaLeft}>
            <span style={f.ctaEyebrow}>Ready to level up?</span>
            <h2 style={f.ctaHeading}>Start your mock interview<br />session right now.</h2>
          </div>
          <button
            style={f.ctaBtn}
            className="footer-cta-btn"
            onClick={() => onNavigate?.('start')}
          >
            🚀 Begin Practice
          </button>
        </div>
      </div>

      <div style={f.statsRow}>
        {stats.map((s, i) => (
          <div key={i} style={f.statItem}>
            <span style={f.statIcon}>{s.icon}</span>
            <span style={f.statValue}>{s.value}</span>
            <span style={f.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={f.divider} />

      <div style={f.grid}>
        <div style={f.brandCol}>
          <div style={f.logo}>
            <span style={f.logoAccent}>AI</span>
            <span style={f.logoText}> Interview Pro</span>
          </div>
          <p style={f.tagline}>
            Your AI-powered mock interview coach. Practice smarter, speak better, land the role.
          </p>
          <div style={f.badges}>
            <span style={f.badge}>💻 Technical</span>
            <span style={f.badge}>🗣️ Behavioral</span>
            <span style={f.badge}>🏗️ System Design</span>
          </div>
          <div style={f.builtBy}>
            <span style={f.builtByDot} />
            Built for CSE placement prep
          </div>
        </div>

        {Object.entries(links).map(([section, items]) => (
          <div key={section} style={f.linkCol}>
            <h4 style={f.linkHeading}>{section}</h4>
            <ul style={f.linkList}>
              {items.map((item, i) => (
                <li key={i}>
                  <button
                    style={f.linkBtn}
                    className="footer-link"
                    onClick={item.action || undefined}
                  >
                    <span style={f.linkArrow}>›</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={f.bottomBar}>
        <div style={f.bottomInner}>
          <span style={f.copyright}>
            © {year} <span style={{ color: '#8b5cf6' }}>AI Interview Pro</span>. All rights reserved.
          </span>
          <div style={f.bottomRight}>
            <span style={f.techStack}>
              Built with <span style={{ color: '#ef4444' }}>♥</span> using React + Web Speech API
            </span>
            <div style={f.dot} />
            <span style={f.techStack}>Powered by AI</span>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </footer>
  );
}

const f = {
  root: {
    position: 'relative',
    background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2e 60%, #0a0a1a 100%)',
    color: '#e2e8f0',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },

  ctaStrip: {
    position: 'relative',
    zIndex: 1,
    borderBottom: '1px solid rgba(139,92,246,0.2)',
    padding: '3.5rem 2rem',
  },
  ctaInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  ctaLeft: {},
  ctaEyebrow: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#8b5cf6',
    marginBottom: '0.6rem',
  },
  ctaHeading: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: '800',
    lineHeight: 1.25,
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  ctaBtn: {
    flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '1rem 2.25rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 0 32px rgba(99,102,241,0.45)',
    transition: 'all 0.25s',
    letterSpacing: '0.01em',
  },

  statsRow: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0',
    padding: '0 2rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.25rem 1rem',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    gap: '0.3rem',
  },
  statIcon: { fontSize: '1.4rem', marginBottom: '0.25rem' },
  statValue: {
    fontSize: '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.03em',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  divider: {
    position: 'relative',
    zIndex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
    margin: '0 2rem',
  },

  grid: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '3rem',
    padding: '3.5rem 2rem',
  },

  brandCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  logo: { display: 'flex', alignItems: 'baseline', gap: '0' },
  logoAccent: {
    fontSize: '1.6rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.03em',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  tagline: {
    margin: 0,
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: 1.75,
    maxWidth: '260px',
  },
  badges: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  badge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.3rem 0.7rem',
    borderRadius: '999px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: '#a78bfa',
    letterSpacing: '0.02em',
  },
  builtBy: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.78rem',
    color: '#475569',
    fontWeight: '500',
  },
  builtByDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },

  linkCol: {},
  linkHeading: {
    margin: '0 0 1.25rem',
    fontSize: '0.72rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#475569',
  },
  linkList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#64748b',
    fontSize: '0.88rem',
    fontWeight: '500',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
    textAlign: 'left',
  },
  linkArrow: {
    color: '#8b5cf6',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'transform 0.2s',
  },

  bottomBar: {
    position: 'relative',
    zIndex: 1,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '1.25rem 2rem',
  },
  bottomInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  copyright: {
    fontSize: '0.82rem',
    color: '#334155',
    fontWeight: '500',
  },
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  techStack: {
    fontSize: '0.8rem',
    color: '#334155',
    fontWeight: '500',
  },
  dot: {
    width: '3px', height: '3px', borderRadius: '50%',
    background: '#334155',
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  .footer-cta-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 0 48px rgba(99,102,241,0.65) !important;
  }

  .footer-link:hover {
    color: #a78bfa !important;
  }

  .footer-link:hover span:first-child {
    transform: translateX(3px);
    display: inline-block;
  }

  @media (max-width: 768px) {
    footer .footer-grid {
      grid-template-columns: 1fr 1fr !important;
    }
  }
`;
