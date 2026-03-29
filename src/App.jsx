import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import PracticeQuestionSet from './components/PracticeQuestionSet';
import Footer from './components/Footer';
import HowItWorksSection from './components/HowItWorksSection';
import TipsSection from './components/TipsSection';
import AuthPage from './AuthPage';

export default function App() {
  // ── ALL HOOKS MUST BE DECLARED FIRST — before any early returns ──────────────
  const [user, setUser]               = useState(null);
  const [authReady, setAuthReady]     = useState(false);
  const [question, setQuestion]       = useState('');
  const [transcript, setTranscript]   = useState('');
  const [result, setResult]           = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast]             = useState(null);
  const [sessions, setSessions]       = useState([]);
  const [sessionMode, setSessionMode] = useState('technical');
  const [currentPage, setCurrentPage] = useState('home');
  const [pulseRecord, setPulseRecord] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  const practiceRef    = useRef(null);
  const recognitionRef = useRef(null);

  const API_URL = 'https://interview-backend-no91.onrender.com/api/auth';

  // Restore session from localStorage on first load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token  = localStorage.getItem('token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) setUser(parsed);
        else localStorage.clear(); // wipe corrupt data
      }
    } catch {
      // Corrupted localStorage — wipe it and show login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setAuthReady(true);
  }, []);

  // Scroll after question renders
  useEffect(() => {
    if (shouldScroll && practiceRef.current) {
      practiceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShouldScroll(false);
    }
  }, [shouldScroll, question]);

  // ── AUTH HELPERS ─────────────────────────────────────────────────────────────
  const handleAuthSuccess = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ── EARLY RETURNS (after ALL hooks) ─────────────────────────────────────────
  if (!authReady) return null;
  if (!user) return <AuthPage onAuthSuccess={handleAuthSuccess} />;

  const sessionTypes = {
    technical: [
      "Explain React hooks with examples.",
      "What is REST API? Design a simple CRUD API.",
      "How does virtual DOM work in React?",
      "Explain async/await vs Promises.",
      "Design a database schema for e-commerce.",
      "What are microservices? Pros and cons.",
      "How would you optimize React app performance?",
      "Explain JWT authentication flow."
    ],
    behavioral: [
      "Tell me about a challenging project you worked on.",
      "Describe a time you faced conflict in a team.",
      "How do you handle tight deadlines?",
      "Tell me about a time you failed and what you learned.",
      "Why should we hire you for this role?",
      "How do you stay updated with new technologies?",
      "Describe your biggest career accomplishment."
    ],
    'system-design': [
      "Design Twitter/Instagram feed system.",
      "Design URL shortener like bit.ly.",
      "Design Netflix recommendation engine.",
      "Design a chat application system.",
      "How would you scale a blog platform?",
      "Design rate limiter for API endpoints."
    ]
  };

  const modeConfig = {
    technical: { icon: '💻', color: '#6366f1', label: 'Technical' },
    behavioral: { icon: '🗣️', color: '#f59e0b', label: 'Behavioral' },
    'system-design': { icon: '🏗️', color: '#10b981', label: 'System Design' }
  };

  // Pick a random question instantly from local pool, then try API in background
  const generateQuestion = (scrollAfter = false) => {
    // Immediately set a local question — zero delay
    const questions = sessionTypes[sessionMode];
    const random = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(random);
    setTranscript('');
    setResult(null);
    if (scrollAfter) setShouldScroll(true);

    // Try to upgrade with API question silently in background
    fetch(`${API_URL}/question`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(data => { if (data.question) setQuestion(data.question); })
      .catch(() => {}); // silently ignore — already have a question
  };

  const handleStartPractice = () => {
    generateQuestion(true); // instant — no await needed
  };

  const saveSession = () => {
    if (result) {
      const newSession = {
        id: Date.now(),
        question,
        score: result.overallScore,
        timestamp: new Date().toLocaleString(),
        mode: sessionMode
      };
      setSessions(prev => [newSession, ...prev.slice(0, 9)]);
    }
  };

  const startRecording = () => {
    if (!question) {
      alert('Generate a question first!');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition only works in Chrome. Please use Google Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onend = () => {
      if (isRecording) recognition.start();
    };
    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error !== 'aborted') alert(`Microphone error: ${event.error}`);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setPulseRecord(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setPulseRecord(false);
    recognitionRef.current = null;
  };

  const analyzeAnswer = async () => {
    if (!transcript.trim()) { alert('Please record your answer first.'); return; }
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, transcript }),
      });
      const data = await response.json();
      setResult(data);
      saveSession();
      saveToMongoDB(data);
    } catch {
      const words = transcript.trim().split(/\s+/);
      const wordCount = words.length;
      const text = transcript.toLowerCase();

      // ── CONFIDENCE: based on answer length + sentence variety ──────────────
      // 0–10 words = 1, 11–20 = 3, 21–40 = 5, 41–70 = 7, 71–100 = 8, 100+ = 9–10
      let confidence;
      if (wordCount <= 10)       confidence = 2;
      else if (wordCount <= 20)  confidence = 4;
      else if (wordCount <= 40)  confidence = 5;
      else if (wordCount <= 70)  confidence = 7;
      else if (wordCount <= 100) confidence = 8;
      else                       confidence = Math.min(10, 8 + Math.floor((wordCount - 100) / 40));

      // Boost confidence if answer has connective structure
      const connectors = ['first', 'second', 'third', 'finally', 'therefore', 'because', 'however', 'for example', 'in addition', 'also', 'additionally', 'moreover', 'furthermore'];
      const connectorCount = connectors.filter(c => text.includes(c)).length;
      confidence = Math.min(10, confidence + Math.min(2, connectorCount));

      // ── CLARITY: filler word penalty ───────────────────────────────────────
      const fillerWords = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'kind of', 'sort of', 'i mean', 'right'];
      const fillerCount = fillerWords.reduce((c, w) => c + (text.split(w).length - 1), 0);
      // Start at 9, lose 1 per filler word, floor at 4
      const clarity = Math.max(4, 9 - fillerCount);

      // ── TECHNICAL: broad keyword bank per topic ─────────────────────────────
      const q = question.toLowerCase();
      const keywordBanks = {
        react:         ['component', 'state', 'props', 'hooks', 'useeffect', 'usestate', 'virtual dom', 'jsx', 'render', 'lifecycle', 'context', 'redux'],
        api:           ['request', 'response', 'http', 'json', 'rest', 'endpoint', 'get', 'post', 'put', 'delete', 'status', 'header', 'crud'],
        database:      ['table', 'schema', 'query', 'index', 'join', 'foreign key', 'primary key', 'sql', 'nosql', 'normalization', 'relation'],
        system:        ['server', 'load balancer', 'cache', 'database', 'scale', 'latency', 'throughput', 'microservice', 'queue', 'cdn', 'availability'],
        async:         ['promise', 'async', 'await', 'callback', 'then', 'catch', 'event loop', 'thread', 'synchronous', 'asynchronous', 'non-blocking'],
        behavioral:    ['situation', 'task', 'action', 'result', 'team', 'challenge', 'learned', 'improved', 'resolved', 'communicated', 'managed', 'delivered'],
        microservices: ['service', 'api', 'deploy', 'docker', 'container', 'independent', 'scale', 'communication', 'fault', 'monolith'],
        auth:          ['token', 'jwt', 'header', 'payload', 'signature', 'bearer', 'session', 'cookie', 'oauth', 'secure', 'expiry'],
        performance:   ['memo', 'usecallback', 'usememo', 'lazy', 'bundle', 'split', 'cache', 'debounce', 'throttle', 'optimize', 'render'],
      };

      // Pick the most relevant keyword bank(s)
      let matchedKeywords = [];
      if (q.includes('react') || q.includes('hook') || q.includes('virtual dom')) matchedKeywords.push(...(keywordBanks.react));
      if (q.includes('api') || q.includes('rest') || q.includes('crud'))          matchedKeywords.push(...(keywordBanks.api));
      if (q.includes('database') || q.includes('schema') || q.includes('sql'))    matchedKeywords.push(...(keywordBanks.database));
      if (q.includes('design') || q.includes('scale') || q.includes('system'))    matchedKeywords.push(...(keywordBanks.system));
      if (q.includes('async') || q.includes('promise') || q.includes('await'))    matchedKeywords.push(...(keywordBanks.async));
      if (q.includes('microservice'))                                               matchedKeywords.push(...(keywordBanks.microservices));
      if (q.includes('jwt') || q.includes('auth'))                                 matchedKeywords.push(...(keywordBanks.auth));
      if (q.includes('performance') || q.includes('optim'))                        matchedKeywords.push(...(keywordBanks.performance));
      if (q.includes('team') || q.includes('challenge') || q.includes('tell me'))  matchedKeywords.push(...(keywordBanks.behavioral));

      // Fallback: use all banks
      if (matchedKeywords.length === 0) matchedKeywords = Object.values(keywordBanks).flat();

      // Deduplicate and count hits
      const uniqueKeywords = [...new Set(matchedKeywords)];
      const hits = uniqueKeywords.filter(kw => text.includes(kw)).length;
      const total = Math.min(uniqueKeywords.length, 12); // cap denominator
      // Scale hits/total → 1–10
      const technical = Math.max(1, Math.min(10, Math.round((hits / total) * 10) + 1));

      // ── OVERALL ─────────────────────────────────────────────────────────────
      const overallScore = Math.round((confidence + clarity + technical) / 3);

      // ── FEEDBACK STRINGS ─────────────────────────────────────────────────────
      const feedbackMap = [
        [9, 'Outstanding answer — excellent depth, structure, and technical accuracy.'],
        [7, 'Strong answer with good technical coverage. A few more examples would make it perfect.'],
        [5, 'Decent answer. Work on adding more technical keywords and structuring your response clearly.'],
        [0, 'Answer needs more depth. Practice explaining concepts step-by-step with examples.'],
      ];
      const feedback = feedbackMap.find(([min]) => overallScore >= min)[1];

      const strengthsList = [];
      if (wordCount > 50)        strengthsList.push('Good answer length');
      if (connectorCount >= 2)   strengthsList.push('Well-structured with connectors');
      if (technical >= 6)        strengthsList.push('Strong technical vocabulary');
      if (fillerCount === 0)     strengthsList.push('No filler words — very clear delivery');

      const weaknessesList = [];
      if (wordCount < 30)        weaknessesList.push('Expand your answer with more detail');
      if (fillerCount > 2)       weaknessesList.push(`Reduce filler words (found ${fillerCount})`);
      if (technical < 5)         weaknessesList.push('Use more domain-specific technical terms');
      if (connectorCount === 0)  weaknessesList.push('Add structure: use "first", "because", "for example"');

      const resultData = {
        confidence,
        clarity,
        technical,
        overallScore,
        feedback,
        strengths:  strengthsList.length  ? strengthsList.join(' · ')  : 'Keep practicing to build strengths',
        weaknesses: weaknessesList.length ? weaknessesList.join(' · ') : 'Great job — nothing major to improve',
      };
      setResult(resultData);
      saveSession();
      saveToMongoDB(resultData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── SAVE TO MONGODB ─────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveToMongoDB = async (reportData) => {
    try {
const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionMode,
          question,
          transcript,
          scores: {
            confidence: reportData.confidence,
            clarity:    reportData.clarity,
            technical:  reportData.technical,
            overall:    reportData.overallScore,
          },
          feedback:   reportData.feedback,
          strengths:  reportData.strengths,
          weaknesses: reportData.weaknesses,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast('✅ Report saved to MongoDB!', 'success');
        console.log('✅ Saved to MongoDB, ID:', data.id);
      } else {
        showToast('⚠️ MongoDB save failed: ' + data.message, 'error');
      }
    } catch (err) {
      showToast('❌ Cannot reach backend — is server.js running?', 'error');
      console.warn('MongoDB save failed:', err.message);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('AI Interview Practice Report', 20, 20);
    doc.setFontSize(14);
    doc.text(`Session: ${sessionMode.toUpperCase()}`, 20, 35);
    doc.text(`Score: ${result?.overallScore}/10`, 20, 50);
    doc.text(`Question: ${question}`, 20, 65);
    doc.text(`Answer: ${transcript.substring(0, 100)}...`, 20, 80);
    doc.save('AI_Interview_Report.pdf');
    // Also persist to MongoDB when user downloads report
    if (result) saveToMongoDB(result);
  };

  const scoreColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  // ── SHARED NAVBAR ───────────────────────────────────────────────────────────
  const navLinks = [
    { key: 'practice-set',  label: '📚 Practice Sets',  style: 'pill' },
    { key: 'how-it-works',  label: '🛠️ How It Works',   style: 'ghost' },
    { key: 'tips',          label: '💡 Tips',            style: 'ghost' },
  ];

  const SharedNav = () => (
    <header style={s.header}>
      <nav style={s.nav}>
        <button style={s.logoBtn} onClick={() => setCurrentPage('home')}>
          <span style={s.logoAccent}>AI</span> Interview Pro
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {sessions.length > 0 && currentPage === 'home' && (
            <span style={s.sessionBadge}>🏆 {sessions.length} session{sessions.length > 1 ? 's' : ''}</span>
          )}
          {navLinks.map(link => (
            <button
              key={link.key}
              className={link.style === 'pill' ? 'nav-practice-btn' : 'nav-ghost-btn'}
              style={{
                ...(link.style === 'pill' ? s.navPracticeBtn : s.navGhostBtn),
                ...(currentPage === link.key ? s.navGhostBtnActive : {}),
              }}
              onClick={() => setCurrentPage(link.key)}
            >
              {link.label}
            </button>
          ))}
          {currentPage !== 'home' && (
            <button style={s.navBtn} onClick={() => setCurrentPage('home')}>← Home</button>
          )}
          {currentPage === 'home' && (
            <button style={s.navBtn} onClick={() => generateQuestion(false)}>New Question</button>
          )}
          {/* User greeting + logout */}
          <div style={s.userChip}>
            <span style={s.userAvatar}>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <span style={s.userName}>{(user?.name || 'User').split(' ')[0]}</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout} className="nav-ghost-btn">
            Sign Out
          </button>
        </div>
      </nav>
    </header>
  );

  // ── PRACTICE QUESTION SET PAGE ──────────────────────────────────────────────
  if (currentPage === 'practice-set') {
    return (
      <div style={s.page}>
        <style>{globalCSS}</style>
        <SharedNav />
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              📚 Practice Question Sets
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Curated questions to sharpen your interview skills</p>
          </div>
          <PracticeQuestionSet />
        </main>
        <Footer onNavigate={(page) => {
          if (page === 'start' || page === 'home') setCurrentPage('home');
          else setCurrentPage(page);
        }} />
      </div>
    );
  }

  // ── HOW IT WORKS PAGE ───────────────────────────────────────────────────────
  if (currentPage === 'how-it-works') {
    return (
      <div style={s.page}>
        <style>{globalCSS}</style>
        <SharedNav />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 1rem' }}>
          <span style={s.pageEyebrow}>Guide</span>
          <h1 style={s.pageTitle}>How It Works</h1>
          <p style={s.pageSubtitle}>Everything you need to know to get the most out of your practice sessions.</p>
        </div>
        <HowItWorksSection onStart={() => { setCurrentPage('home'); handleStartPractice(); }} />
        <Footer onNavigate={(page) => {
          if (page === 'start') { setCurrentPage('home'); handleStartPractice(); }
          else setCurrentPage(page);
        }} />
      </div>
    );
  }

  // ── TIPS PAGE ───────────────────────────────────────────────────────────────
  if (currentPage === 'tips') {
    return (
      <div style={s.page}>
        <style>{globalCSS}</style>
        <SharedNav />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 1rem' }}>
          <span style={s.pageEyebrow}>Resources</span>
          <h1 style={s.pageTitle}>Interview Tips</h1>
          <p style={s.pageSubtitle}>Curated advice from successful placements at top tech companies — before, during, and after.</p>
        </div>
        <TipsSection />
        <Footer onNavigate={(page) => {
          if (page === 'start') { setCurrentPage('home'); handleStartPractice(); }
          else setCurrentPage(page);
        }} />
      </div>
    );
  }

  // ── HOME PAGE ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{globalCSS}</style>

      {/* NAVBAR */}
      <SharedNav />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          background: toast.type === 'success' ? '#0f172a' : '#7f1d1d',
          color: '#fff', padding: '0.85rem 1.4rem', borderRadius: '12px',
          fontSize: '0.9rem', fontWeight: '600',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          animation: 'fadeSlideUp 0.3s ease',
          maxWidth: '340px', lineHeight: 1.5,
        }}>
          {toast.msg}
        </div>
      )}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>✨ AI-Powered Mock Interviews</div>
          <h1 style={s.heroTitle}>
            Ace Your Next<br />
            <span style={s.heroGradient}>Tech Interview</span>
          </h1>
          <p style={s.heroSubtitle}>
            Practice with real interview questions, record your answers, and get instant AI-driven
            feedback on confidence, clarity, and technical depth.
          </p>

          {/* Session Type Tabs */}
          <div style={s.tabRow}>
            {Object.entries(modeConfig).map(([type, cfg]) => (
              <button
                key={type}
                className="tab-btn"
                style={{
                  ...s.tabBtn,
                  ...(sessionMode === type ? { ...s.activeTab, borderColor: cfg.color, color: cfg.color, background: cfg.color + '15' } : {})
                }}
                onClick={() => { setSessionMode(type); setQuestion(''); setResult(null); }}
              >
                <span style={{ fontSize: '1.1rem' }}>{cfg.icon}</span>
                {cfg.label}
              </button>
            ))}
          </div>

          <button
            style={s.heroBtn}
            className="hero-btn"
            onClick={handleStartPractice}
          >
            🚀 Start Practice
          </button>
        </div>

        {/* Decorative floating cards */}
        <div style={s.floatCard1} className="float-card">
          <span style={{ fontSize: '1.5rem' }}>💻</span>
          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Technical</span>
        </div>
        <div style={s.floatCard2} className="float-card">
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Scoring</span>
        </div>
        <div style={s.floatCard3} className="float-card">
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Feedback</span>
        </div>
      </section>

      {/* Permanent scroll anchor — always in DOM so scroll always works */}
      <div ref={practiceRef} id="practice-section" style={{ position: 'relative', top: '-80px', pointerEvents: 'none', height: 0 }} />

      {/* PRACTICE SECTION */}
      <main style={s.container}>

        {/* Question Card */}
        {question && (
          <div style={s.card} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <span style={{ ...s.modePill, background: modeConfig[sessionMode].color + '18', color: modeConfig[sessionMode].color }}>
                {modeConfig[sessionMode].icon} {modeConfig[sessionMode].label}
              </span>
              <span style={s.questionLabel}>Interview Question</span>
            </div>
            <div style={s.questionBox}>
              <div style={{ fontSize: '2.25rem' }}>{modeConfig[sessionMode].icon}</div>
              <h3 style={s.questionText}>{question}</h3>
            </div>
            <button style={s.ghostBtn} onClick={() => generateQuestion(false)}>↻ Get Another Question</button>
          </div>
        )}

        {/* Recording Card */}
        <div style={s.card} className="fade-in">
          <h3 style={s.sectionTitle}>
            <span style={s.titleIcon}>🎙️</span>
            Record Your Answer
          </h3>

          {!question && (
            <div style={s.emptyState}>
              <p style={{ margin: 0, color: '#94a3b8' }}>Click <strong style={{ color: '#6366f1' }}>Start Practice</strong> or <strong style={{ color: '#6366f1' }}>New Question</strong> to begin</p>
            </div>
          )}

          <div style={s.buttonRow}>
            {!isRecording ? (
              <button style={s.recordBtn} className="record-btn" onClick={startRecording}>
                🎤 Start Recording
              </button>
            ) : (
              <button style={s.stopBtn} className="stop-btn" onClick={stopRecording}>
                <span style={s.pulseDot} />
                ⏹ Stop Recording
              </button>
            )}
            <button
              style={{
                ...s.analyzeBtn,
                opacity: isAnalyzing || !transcript ? 0.5 : 1,
                cursor: isAnalyzing || !transcript ? 'not-allowed' : 'pointer'
              }}
              className="analyze-btn"
              onClick={analyzeAnswer}
              disabled={isAnalyzing || !transcript}
            >
              {isAnalyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={s.spinner} /> Analyzing…
                </span>
              ) : '⚡ Analyze Answer'}
            </button>
          </div>

          {transcript && (
            <div style={s.transcriptBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Your Answer</strong>
                <span style={s.wordCount}>{transcript.split(' ').length} words</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.75, color: '#374151', whiteSpace: 'pre-wrap' }}>{transcript}</p>
            </div>
          )}
        </div>

        {/* Results Card */}
        {result && (
          <div style={s.card} className="fade-in">
            <h3 style={s.sectionTitle}>
              <span style={s.titleIcon}>📊</span>
              Evaluation Results
            </h3>

            {/* Overall Score */}
            <div style={{ ...s.overallScoreBox, background: `linear-gradient(135deg, ${scoreColor(result.overallScore)}, ${scoreColor(result.overallScore)}cc)` }}>
              <div style={s.overallInner}>
                <div style={s.bigScore}>{result.overallScore}</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: '600' }}>/ 10 Overall</div>
              </div>
              <div style={s.overallLabel}>
                {result.overallScore >= 8 ? '🏆 Excellent' : result.overallScore >= 6 ? '👍 Good' : '📈 Keep Practicing'}
              </div>
            </div>

            {/* Sub Scores */}
            <div style={s.scoresGrid}>
              {[
                { label: 'Confidence', value: result.confidence, icon: '💪' },
                { label: 'Clarity', value: result.clarity, icon: '🎯' },
                { label: 'Technical', value: result.technical, icon: '🔧' }
              ].map(({ label, value, icon }) => (
                <div key={label} style={s.scoreItem}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                  <div style={{ ...s.scoreValue, color: scoreColor(value) }}>{value}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/10</span></div>
                  <div style={s.scoreLabel}>{label}</div>
                  <div style={s.scoreBar}>
                    <div style={{ ...s.scoreBarFill, width: `${value * 10}%`, background: scoreColor(value) }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div style={s.feedbackBox}>
              <p style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#0f172a', fontWeight: '600' }}>
                📝 Feedback
              </p>
              <p style={{ margin: 0, color: '#374151', lineHeight: 1.7 }}>{result.feedback}</p>
              {result.strengths && (
                <div style={s.feedbackChip}>
                  <strong style={{ color: '#10b981' }}>💪 Strengths:</strong> {result.strengths}
                </div>
              )}
              {result.weaknesses && (
                <div style={{ ...s.feedbackChip, borderLeftColor: '#f59e0b' }}>
                  <strong style={{ color: '#f59e0b' }}>📈 Improve:</strong> {result.weaknesses}
                </div>
              )}
              {result.detailedAnalysis && (
                <div style={s.feedbackChip}>
                  <strong>🔍 Detailed Analysis:</strong>
                  <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>{result.detailedAnalysis}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button style={s.downloadBtn} onClick={downloadPDF}>📄 Download PDF Report</button>
              <button style={s.ghostBtn} onClick={() => { generateQuestion(true); }}>🔄 Next Question</button>
            </div>
          </div>
        )}

        {/* Sessions History */}
        {sessions.length > 0 && (
          <div style={s.card} className="fade-in">
            <h3 style={s.sectionTitle}>
              <span style={s.titleIcon}>📚</span>
              Recent Sessions
              <span style={s.sessionCountBadge}>{sessions.length}</span>
            </h3>
            <div style={s.sessionsGrid}>
              {sessions.map((session) => {
                const cfg = modeConfig[session.mode];
                return (
                  <div key={session.id} style={s.sessionCard} className="session-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ ...s.modePill, background: cfg.color + '18', color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', color: scoreColor(session.score) }}>
                        {session.score}/10
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem', color: '#374151', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {session.question.substring(0, 70)}…
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem' }}>{session.timestamp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={(page) => {
        if (page === 'start') { handleStartPractice(); }
        else if (page === 'practice-set') setCurrentPage('practice-set');
      }} />
    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    color: '#1e2937',
    margin: 0,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 200,
    boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  logoBtn: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  logoAccent: {
    color: '#6366f1',
  },
  sessionBadge: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
  },
  navPracticeBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
    letterSpacing: '0.01em',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    padding: '0.3rem 0.75rem 0.3rem 0.3rem',
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#374151',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1.5px solid #e2e8f0',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
  },
  navGhostBtn: {
    background: 'transparent',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
  },
  navGhostBtnActive: {
    background: '#eef2ff',
    color: '#6366f1',
    borderColor: '#c7d2fe',
  },
  pageEyebrow: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6366f1',
    background: '#eef2ff',
    padding: '0.3rem 0.9rem',
    borderRadius: '999px',
    marginBottom: '1rem',
  },
  pageTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    margin: '0 0 0.75rem',
  },
  pageSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: 1.7,
    margin: '0 0 1rem',
    maxWidth: '560px',
  },
  navBtn: {
    background: '#f1f5f9',
    color: '#374151',
    border: '1px solid #e2e8f0',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hero: {
    position: 'relative',
    background: 'linear-gradient(160deg, #ffffff 0%, #f0f4ff 60%, #fdf4ff 100%)',
    padding: '5rem 2rem 4rem',
    textAlign: 'center',
    overflow: 'hidden',
    borderBottom: '1px solid #e2e8f0',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '700px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: '700',
    padding: '0.35rem 1rem',
    borderRadius: '999px',
    marginBottom: '1.5rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 1.15,
    margin: '0 0 1.25rem',
    letterSpacing: '-0.03em',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: '#475569',
    maxWidth: '560px',
    margin: '0 auto 2.5rem',
    lineHeight: 1.75,
  },
  tabRow: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.4rem',
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  activeTab: {
    fontWeight: '700',
  },
  heroBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '1rem 2.5rem',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
    transition: 'all 0.25s',
    letterSpacing: '0.01em',
  },
  floatCard1: {
    position: 'absolute', top: '15%', left: '8%',
    background: '#fff', padding: '0.75rem 1rem', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
    zIndex: 1,
  },
  floatCard2: {
    position: 'absolute', top: '20%', right: '8%',
    background: '#fff', padding: '0.75rem 1rem', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
    zIndex: 1,
  },
  floatCard3: {
    position: 'absolute', bottom: '15%', left: '6%',
    background: '#fff', padding: '0.75rem 1rem', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
    zIndex: 1,
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '3rem 2rem 4rem',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
    marginBottom: '1.75rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 1.5rem',
  },
  titleIcon: {
    fontSize: '1.4rem',
  },
  modePill: {
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '0.3rem 0.8rem',
    borderRadius: '999px',
    letterSpacing: '0.02em',
  },
  questionLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  questionBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8faff, #f4f0ff)',
    borderLeft: '4px solid #6366f1',
    borderRadius: '10px',
    marginBottom: '1.25rem',
  },
  questionText: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 1.6,
  },
  ghostBtn: {
    background: 'transparent',
    color: '#6366f1',
    border: '1.5px solid #c7d2fe',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    background: '#f8fafc',
    border: '2px dashed #e2e8f0',
    borderRadius: '10px',
    padding: '2rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  recordBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
    transition: 'all 0.2s',
  },
  stopBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
  },
  pulseDot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'pulse 1s ease-in-out infinite',
  },
  analyzeBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    border: 'none',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  transcriptBox: {
    background: 'linear-gradient(135deg, #f0fdf4, #f8fff9)',
    border: '1px solid #bbf7d0',
    borderLeft: '4px solid #10b981',
    borderRadius: '10px',
    padding: '1.25rem 1.5rem',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  wordCount: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#10b981',
    background: '#f0fdf4',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    border: '1px solid #bbf7d0',
  },
  overallScoreBox: {
    borderRadius: '14px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    color: '#fff',
    marginBottom: '2rem',
  },
  overallInner: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  bigScore: {
    fontSize: '4rem',
    fontWeight: '900',
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  overallLabel: {
    fontSize: '1.1rem',
    fontWeight: '700',
    opacity: 0.9,
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  scoreItem: {
    textAlign: 'center',
    padding: '1.25rem 1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: '800',
    display: 'block',
    marginBottom: '0.25rem',
  },
  scoreLabel: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.75rem',
    display: 'block',
  },
  scoreBar: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 1s ease',
  },
  feedbackBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  feedbackChip: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    borderLeft: '3px solid #10b981',
    paddingLeft: '0.75rem',
    color: '#374151',
    fontSize: '0.93rem',
    lineHeight: 1.6,
  },
  downloadBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sessionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  sessionCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.2s',
  },
  sessionCountBadge: {
    background: '#6366f1',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    marginLeft: '0.25rem',
  },
  footer: {
    background: '#0f172a',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '2.5rem 2rem',
  },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in { animation: fadeSlideUp 0.45s ease forwards; }
  .float-card { animation: floatY 4s ease-in-out infinite; }
  .float-card:nth-child(2) { animation-delay: 1.3s; }
  .float-card:nth-child(3) { animation-delay: 2.6s; }

  .nav-ghost-btn:hover { background: #f5f3ff !important; color: #6366f1 !important; border-color: #c7d2fe !important; }
  .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.5) !important; }
  .nav-practice-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.5) !important; }
  .record-btn:hover { transform: translateY(-1px); }
  .analyze-btn:hover { transform: translateY(-1px); }
  .session-card:hover { border-color: #c7d2fe; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
  .tab-btn:hover { border-color: #a5b4fc; background: #f5f3ff !important; color: #6366f1 !important; }
`;