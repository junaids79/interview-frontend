import React, { useState, useEffect, useRef } from 'react';

const tipCategories = {
  before: {
    label: 'Before Interview',
    icon: '📅',
    color: '#6366f1',
    bg: '#eef2ff',
    tips: [
      {
        icon: '🔍',
        title: 'Research the Company',
        body: 'Study the company\'s products, tech stack, culture, and recent news. Interviewers love candidates who show genuine interest.',
        tag: 'Essential',
        tagColor: '#ef4444',
      },
      {
        icon: '📝',
        title: 'Revise DSA Fundamentals',
        body: 'Arrays, strings, trees, graphs, DP — brush up on core data structures and algorithms at least 2 weeks before.',
        tag: 'Technical',
        tagColor: '#6366f1',
      },
      {
        icon: '🗣️',
        title: 'Prepare STAR Stories',
        body: 'For behavioral rounds, have 5–6 stories ready in STAR format (Situation, Task, Action, Result) from your past projects.',
        tag: 'Behavioral',
        tagColor: '#f59e0b',
      },
      {
        icon: '🧪',
        title: 'Mock Interview Daily',
        body: 'Use this app to simulate real interviews daily. Consistency builds comfort — even 10 minutes a day compounds fast.',
        tag: 'Practice',
        tagColor: '#10b981',
      },
      {
        icon: '⏰',
        title: 'Sleep & Prepare the Night Before',
        body: 'Lay out everything the night before. 8 hours of sleep improves recall and reduces anxiety significantly.',
        tag: 'Wellbeing',
        tagColor: '#8b5cf6',
      },
      {
        icon: '📂',
        title: 'Build a Project Portfolio',
        body: 'Have 2–3 solid projects on GitHub you can speak about deeply — architecture decisions, challenges, and what you\'d improve.',
        tag: 'Portfolio',
        tagColor: '#0ea5e9',
      },
    ],
  },
  during: {
    label: 'During Interview',
    icon: '🎯',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      {
        icon: '🧠',
        title: 'Think Out Loud',
        body: 'Interviewers want to see your reasoning process. Narrate your thought process as you approach a problem — silence is worse than an imperfect answer.',
        tag: 'Essential',
        tagColor: '#ef4444',
      },
      {
        icon: '❓',
        title: 'Clarify Before Coding',
        body: 'Always ask clarifying questions before jumping into a solution. Edge cases? Input constraints? Expected output format?',
        tag: 'Technical',
        tagColor: '#6366f1',
      },
      {
        icon: '⏱️',
        title: 'Manage Your Time',
        body: 'If stuck for more than 3 minutes, ask for a hint — don\'t burn all your time on one approach. Partial solutions with good reasoning beat silence.',
        tag: 'Strategy',
        tagColor: '#f59e0b',
      },
      {
        icon: '💪',
        title: 'Own Your Resume',
        body: 'Never lie or exaggerate. Know every line on your resume deeply — interviewers will drill into anything you\'ve listed.',
        tag: 'Behavioral',
        tagColor: '#10b981',
      },
      {
        icon: '🔄',
        title: 'Start with Brute Force',
        body: 'State the naive solution first, then optimize. It shows structured thinking and gives you a working baseline to improve.',
        tag: 'Technical',
        tagColor: '#6366f1',
      },
      {
        icon: '😌',
        title: 'Stay Calm Under Pressure',
        body: 'If you get a hard question, breathe. A calm, systematic attempt beats a panicked correct answer. Interviewers assess composure too.',
        tag: 'Mindset',
        tagColor: '#8b5cf6',
      },
    ],
  },
  after: {
    label: 'After Interview',
    icon: '✅',
    color: '#10b981',
    bg: '#f0fdf4',
    tips: [
      {
        icon: '📧',
        title: 'Send a Thank You Note',
        body: 'Email your interviewer within 24 hours thanking them. Mention something specific from the conversation — it shows attention and professionalism.',
        tag: 'Professional',
        tagColor: '#0ea5e9',
      },
      {
        icon: '📓',
        title: 'Document Every Question',
        body: 'Write down every question you were asked immediately after. Build a personal question bank — patterns repeat across companies.',
        tag: 'Strategy',
        tagColor: '#f59e0b',
      },
      {
        icon: '🔁',
        title: 'Review What You Missed',
        body: 'Identify questions you fumbled and study those topics deeply before your next interview. Each interview is a data point.',
        tag: 'Growth',
        tagColor: '#10b981',
      },
      {
        icon: '⏳',
        title: 'Follow Up After 5 Days',
        body: 'If you haven\'t heard back after 5 business days, it\'s perfectly professional to send one polite follow-up email.',
        tag: 'Professional',
        tagColor: '#0ea5e9',
      },
      {
        icon: '🎙️',
        title: 'Re-record Your Answers',
        body: 'Use this app to re-answer questions you struggled with. See how your score improves over time — the feedback loop is powerful.',
        tag: 'Practice',
        tagColor: '#10b981',
      },
      {
        icon: '🧘',
        title: 'Detach from Outcomes',
        body: 'You can give a great interview and not get an offer due to headcount or role changes. Focus on what you can control: preparation quality.',
        tag: 'Mindset',
        tagColor: '#8b5cf6',
      },
    ],
  },
};

export default function TipsSection() {
  const [activeTab, setActiveTab] = useState('before');
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);
  const active = tipCategories[activeTab];

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={t.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={{
        ...t.header,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}>
        <span style={t.eyebrow}>Pro Interview Tips</span>
        <h2 style={t.heading}>
          Advice that actually<br />
          <span style={t.headingAccent}>moves the needle</span>
        </h2>
        <p style={t.subheading}>
          Curated from hundreds of successful placement experiences at top tech companies.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        ...t.tabRow,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'all 0.6s ease 0.15s',
      }}>
        {Object.entries(tipCategories).map(([key, cat]) => (
          <button
            key={key}
            style={{
              ...t.tab,
              ...(activeTab === key
                ? { background: cat.bg, color: cat.color, borderColor: cat.color + '40', boxShadow: `0 4px 16px ${cat.color}20` }
                : {}),
            }}
            className="tips-tab"
            onClick={() => setActiveTab(key)}
          >
            <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
            {cat.label}
            <span style={{
              ...t.tabCount,
              background: activeTab === key ? cat.color + '20' : '#f1f5f9',
              color: activeTab === key ? cat.color : '#94a3b8',
            }}>
              {cat.tips.length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={t.grid} key={activeTab}>
        {active.tips.map((tip, i) => (
          <div
            key={i}
            style={{
              ...t.card,
              ...(hoveredCard === i ? t.cardHover : {}),
              opacity: visible ? 1 : 0,
              transform: visible
                ? hoveredCard === i ? 'translateY(-4px)' : 'none'
                : 'translateY(24px)',
              transition: `opacity 0.45s ease ${i * 0.06}s, transform 0.3s ease, box-shadow 0.3s ease`,
            }}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top row */}
            <div style={t.cardTop}>
              <div style={{ ...t.cardIcon, background: active.bg }}>{tip.icon}</div>
              <span style={{ ...t.tag, background: tip.tagColor + '15', color: tip.tagColor }}>
                {tip.tag}
              </span>
            </div>

            <h4 style={t.cardTitle}>{tip.title}</h4>
            <p style={t.cardBody}>{tip.body}</p>

            {/* Bottom accent bar on hover */}
            <div style={{
              ...t.accentBar,
              width: hoveredCard === i ? '100%' : '0%',
              background: `linear-gradient(90deg, ${active.color}, ${active.color}66)`,
            }} />
          </div>
        ))}
      </div>

      {/* Bottom tip counter */}
      <div style={{
        ...t.counter,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.5s',
      }}>
        <div style={t.counterInner}>
          {Object.entries(tipCategories).map(([key, cat]) => (
            <div key={key} style={t.counterItem}>
              <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>
                {cat.tips.length}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                {cat.label} Tips
              </span>
            </div>
          ))}
          <div style={t.counterDivider} />
          <div style={t.counterItem}>
            <span style={{ fontSize: '1.25rem' }}>💡</span>
            <span style={{ fontWeight: '700', color: '#6366f1', fontSize: '1.1rem' }}>
              {Object.values(tipCategories).reduce((s, c) => s + c.tips.length, 0)}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>Total Tips</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const t = {
  root: {
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    padding: '5rem 2rem',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    borderTop: '1px solid #f1f5f9',
  },
  header: {
    textAlign: 'center',
    maxWidth: '580px',
    margin: '0 auto 3rem',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#ec4899',
    background: '#fdf2f8',
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
    background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
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
  tabRow: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '3rem',
    maxWidth: '1100px',
    margin: '0 auto 3rem',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.7rem 1.5rem',
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: '#64748b',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  tabCount: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    transition: 'all 0.2s',
  },
  grid: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: '1.25rem',
    animation: 'gridFadeIn 0.35s ease',
  },
  card: {
    background: '#fff',
    border: '1.5px solid #f1f5f9',
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  cardHover: {
    boxShadow: '0 12px 32px rgba(0,0,0,0.09)',
    borderColor: '#e2e8f0',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cardIcon: {
    fontSize: '1.5rem',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: '0 0 0.6rem',
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  cardBody: {
    margin: 0,
    color: '#475569',
    fontSize: '0.875rem',
    lineHeight: 1.75,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    borderRadius: '0 0 16px 16px',
    transition: 'width 0.35s ease',
  },
  counter: {
    maxWidth: '1100px',
    margin: '3rem auto 0',
  },
  counterInner: {
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2.5rem',
    flexWrap: 'wrap',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  counterItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
  },
  counterDivider: {
    width: '1px',
    height: '40px',
    background: '#e2e8f0',
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  .tips-tab:hover { border-color: #c7d2fe !important; color: #6366f1 !important; }
  @keyframes gridFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
