import React, { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    icon: '🎯',
    title: 'Choose Your Category',
    description:
      'Pick from Technical, Behavioral, or System Design. Each category is curated with real questions asked at top tech companies.',
    color: '#6366f1',
    bg: '#eef2ff',
    detail: 'React, APIs, Microservices, DBMS & more',
  },
  {
    number: '02',
    icon: '❓',
    title: 'Get a Random Question',
    description:
      'Hit "Start Practice" and receive an interview question instantly. Each question is drawn from a pool of real placement questions.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    detail: '25+ questions across all categories',
  },
  {
    number: '03',
    icon: '🎙️',
    title: 'Record Your Answer',
    description:
      'Speak your answer aloud using your microphone. The Web Speech API transcribes everything in real-time as you talk.',
    color: '#ec4899',
    bg: '#fdf2f8',
    detail: 'Real-time speech-to-text transcription',
  },
  {
    number: '04',
    icon: '⚡',
    title: 'Get AI Feedback',
    description:
      'Our AI scores your answer on Confidence, Clarity, and Technical depth. Get specific strengths and areas to improve.',
    color: '#f59e0b',
    bg: '#fffbeb',
    detail: 'Scored out of 10 across 3 dimensions',
  },
  {
    number: '05',
    icon: '📄',
    title: 'Download Your Report',
    description:
      'Export a full PDF report of your session — question, transcript, scores, and feedback — to review and track progress.',
    color: '#10b981',
    bg: '#f0fdf4',
    detail: 'PDF export with full session data',
  },
];

export default function HowItWorksSection({ onStart }) {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep(p => (p + 1) % steps.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const active = steps[activeStep];

  return (
    <section ref={sectionRef} style={h.root}>
      <style>{css}</style>

      <div style={{ ...h.header, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.6s ease' }}>
        <span style={h.eyebrow}>How It Works</span>
        <h2 style={h.heading}>
          Five steps to a<br />
          <span style={h.headingAccent}>confident interview</span>
        </h2>
        <p style={h.subheading}>
          From question to feedback in under 3 minutes. No signup, no setup — just practice.
        </p>
      </div>

      <div style={h.layout}>

        <div style={h.stepList}>
          {steps.map((step, i) => (
            <button
              key={i}
              style={{
                ...h.stepBtn,
                ...(activeStep === i ? { ...h.stepBtnActive, borderColor: step.color, background: step.bg } : {}),
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(-20px)',
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s, background 0.2s, border-color 0.2s`,
              }}
              onClick={() => setActiveStep(i)}
              className="step-btn"
            >
              <span
                style={{
                  ...h.stepNumber,
                  color: activeStep === i ? step.color : '#cbd5e1',
                  background: activeStep === i ? step.color + '18' : '#f8fafc',
                }}
              >
                {step.number}
              </span>
              <div style={h.stepMeta}>
                <span style={{ ...h.stepTitle, color: activeStep === i ? '#0f172a' : '#64748b' }}>
                  {step.icon} {step.title}
                </span>
                {activeStep === i && (
                  <span style={{ ...h.stepDetail, color: step.color }}>{step.detail}</span>
                )}
              </div>
              {activeStep === i && (
                <span style={{ ...h.stepArrow, color: step.color }}>›</span>
              )}
            </button>
          ))}
        </div>

        <div
          key={activeStep}
          style={{
            ...h.showcase,
            borderColor: active.color + '30',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          className="showcase-card"
        >
          <div style={{ ...h.showcaseBar, background: `linear-gradient(90deg, ${active.color}, ${active.color}88)` }} />

          <div style={h.showcaseInner}>
            <div style={{ ...h.bigIcon, background: active.bg, color: active.color }}>
              {active.icon}
            </div>

            <span style={{ ...h.stepBadge, background: active.color + '18', color: active.color }}>
              Step {active.number}
            </span>

            <h3 style={h.showcaseTitle}>{active.title}</h3>
            <p style={h.showcaseDesc}>{active.description}</p>

            <div style={{ ...h.detailChip, background: active.bg, borderColor: active.color + '30' }}>
              <span style={{ ...h.detailDot, background: active.color }} />
              <span style={{ color: active.color, fontWeight: '600', fontSize: '0.82rem' }}>{active.detail}</span>
            </div>

            <div style={h.dotRow}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    ...h.dot,
                    width: i === activeStep ? '24px' : '7px',
                    background: i === activeStep ? active.color : '#e2e8f0',
                  }}
                  className="dot-btn"
                />
              ))}
            </div>
          </div>

          {activeStep === steps.length - 1 && (
            <div style={h.showcaseCta}>
              <button style={h.ctaBtn} onClick={onStart} className="hiw-cta-btn">
                🚀 Start Practicing Now
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const h = {
  root: {
    background: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    padding: '5rem 2rem',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
  },
  header: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 4rem',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6366f1',
    background: '#eef2ff',
    padding: '0.35rem 1rem',
    borderRadius: '999px',
    marginBottom: '1.25rem',
  },
  heading: {
    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
    margin: '0 0 1rem',
  },
  headingAccent: {
    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subheading: {
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: 1.7,
    margin: 0,
  },
  layout: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: '2.5rem',
    alignItems: 'start',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  stepBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: '#f8fafc',
    border: '1.5px solid #f1f5f9',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  stepBtnActive: {
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  stepNumber: {
    flexShrink: 0,
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.78rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
  },
  stepMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  stepTitle: {
    fontSize: '0.93rem',
    fontWeight: '700',
    transition: 'color 0.2s',
  },
  stepDetail: {
    fontSize: '0.76rem',
    fontWeight: '600',
  },
  stepArrow: {
    fontSize: '1.3rem',
    fontWeight: '700',
    flexShrink: 0,
  },

  showcase: {
    background: '#fff',
    border: '1.5px solid',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
    position: 'sticky',
    top: '100px',
  },
  showcaseBar: {
    height: '4px',
  },
  showcaseInner: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  bigIcon: {
    fontSize: '2.5rem',
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0.3rem 0.8rem',
    borderRadius: '999px',
  },
  showcaseTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
  },
  showcaseDesc: {
    margin: 0,
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: 1.75,
  },
  detailChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
  },
  detailDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.5rem',
  },
  dot: {
    height: '7px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
  },
  showcaseCta: {
    padding: '0 2.5rem 2rem',
  },
  ctaBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '0.9rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
    transition: 'all 0.2s',
  },
};

const css = `
  .step-btn:hover { border-color: #c7d2fe !important; background: #f5f3ff !important; }
  .hiw-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,0.45) !important; }
  .dot-btn { background: none; }
  .showcase-card { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0.4; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

  @media (max-width: 768px) {
    .hiw-layout { grid-template-columns: 1fr !important; }
  }
`;
