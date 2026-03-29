import { useState } from "react";

const questionSets = {
  technical: [
    {
      id: 1,
      question: "Explain React hooks with examples.",
      difficulty: "Medium",
      answer: `React hooks are functions that let you use state and lifecycle features in functional components.

Key hooks:
• useState – manage local state: const [count, setCount] = useState(0)
• useEffect – side effects like API calls or subscriptions
• useContext – consume context without Consumer wrappers
• useRef – persist mutable values without re-renders
• useMemo / useCallback – memoize expensive computations / functions

Example:
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => { document.title = \`Count: \${count}\`; }, [count]);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

Key rule: Never call hooks inside loops, conditions, or nested functions.`,
      tip: "Mention the Rules of Hooks and why they exist.",
    },
    {
      id: 2,
      question: "How does virtual DOM work in React?",
      difficulty: "Medium",
      answer: `The Virtual DOM (VDOM) is an in-memory lightweight representation of the real DOM.

How it works:
1. React creates a VDOM tree matching the UI state
2. On state/prop change, React creates a NEW VDOM tree
3. Diffing algorithm (reconciliation) compares old vs new VDOM
4. Only the changed nodes are updated in the real DOM (patching)

Why it's fast:
• Real DOM manipulation is slow; VDOM diffing is in-memory (fast)
• Batches multiple updates into a single DOM repaint
• React 18 adds concurrent rendering for even finer control

Key concept: React doesn't re-render the whole DOM — only the minimal diff is applied.`,
      tip: "Compare VDOM to direct DOM manipulation to show you understand the performance tradeoff.",
    },
    {
      id: 3,
      question: "Explain async/await vs Promises.",
      difficulty: "Easy",
      answer: `Both handle asynchronous operations, but async/await is syntactic sugar over Promises.

Promises:
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

async/await (same thing, cleaner):
async function getData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

Key differences:
• async/await is more readable, especially for sequential async calls
• Error handling uses try/catch vs .catch()
• Under the hood, async functions always return a Promise
• Promise.all() still useful for parallel execution`,
      tip: "Show a chained .then() example vs the async/await equivalent to demonstrate readability.",
    },
    {
      id: 4,
      question: "What are microservices? Pros and cons.",
      difficulty: "Hard",
      answer: `Microservices is an architectural style where an app is split into small, independently deployable services, each responsible for a single business capability.

Example: An e-commerce app split into — Auth Service, Product Service, Order Service, Payment Service, Notification Service.

Pros:
✓ Independent deployment & scaling
✓ Technology flexibility per service
✓ Fault isolation (one service failing doesn't crash everything)
✓ Smaller codebases, easier to understand

Cons:
✗ Network latency between services
✗ Complex distributed tracing & debugging
✗ Data consistency challenges (no shared DB)
✗ Operational overhead (more services = more infra)

When to use: Large teams, high scalability needs, complex domains.
When NOT to use: Small teams, early-stage startups — a monolith is often better to start.`,
      tip: "Mention when you'd choose a monolith over microservices — interviewers love that nuance.",
    },
    {
      id: 5,
      question: "How would you optimize React app performance?",
      difficulty: "Hard",
      answer: `Performance optimization in React happens at multiple levels:

Component level:
• React.memo – prevents re-render if props haven't changed
• useMemo – memoize expensive computed values
• useCallback – stable function references for child components
• Lazy loading: React.lazy + Suspense for code splitting

State management:
• Lift state only as high as needed
• Avoid storing derived state (compute it instead)
• Use context selectively — over-use causes wide re-renders

Bundle level:
• Code splitting with dynamic import()
• Tree-shaking unused dependencies
• Compress images, use next-gen formats (WebP)

Network:
• Pagination / infinite scroll for large lists
• React Query or SWR for smart caching
• Debounce/throttle expensive event handlers

Measurement first: Always use React DevTools Profiler to find actual bottlenecks before optimizing.`,
      tip: "Lead with 'measure first' — premature optimization is a red flag to interviewers.",
    },
    {
      id: 6,
      question: "Explain JWT authentication flow.",
      difficulty: "Medium",
      answer: `JWT (JSON Web Token) is a compact, self-contained token for transmitting authentication info.

Structure: header.payload.signature (base64 encoded)

Flow:
1. User logs in → server validates credentials
2. Server creates JWT signed with a secret key → sends to client
3. Client stores token (localStorage or httpOnly cookie)
4. On each request, client sends: Authorization: Bearer <token>
5. Server verifies signature and extracts user info from payload
6. No DB lookup needed — token is self-contained

Security considerations:
• Use short expiry (15min access token) + refresh tokens
• Store in httpOnly cookies to prevent XSS
• Always use HTTPS
• Never store sensitive data in payload (it's only encoded, not encrypted)

Pros: Stateless, scalable, works across domains
Cons: Can't invalidate a token before expiry (use a blocklist for logout)`,
      tip: "Mention the access token + refresh token pattern — shows you think about real-world security.",
    },
  ],
  behavioral: [
    {
      id: 7,
      question: "Tell me about a challenging project you worked on.",
      difficulty: "Medium",
      answer: `Use the STAR method:

Situation: Set the context briefly (project, team size, timeline)
Task: What was YOUR specific responsibility?
Action: What steps did YOU take? Focus on your decisions.
Result: Quantify outcomes if possible (shipped on time, reduced bugs by X%)

Example structure:
"During my final year project, our team of 4 had to build a real-time collaborative editor in 8 weeks. I was responsible for the WebSocket backend. The challenge was handling concurrent edits — we faced race conditions in week 3. I researched Operational Transformation, prototyped a solution, and presented it to the team. We implemented it in 5 days, and our demo had zero sync issues. The project scored 92/100."

Key tips:
• Choose a story that shows problem-solving AND teamwork
• Be specific — vague answers score low
• Mention what you learned`,
      tip: "Practice your STAR story out loud — timing it to under 2 minutes is the real challenge.",
    },
    {
      id: 8,
      question: "How do you handle tight deadlines?",
      difficulty: "Easy",
      answer: `Strong answer framework:

1. Prioritize ruthlessly — use MoSCoW (Must/Should/Could/Won't)
2. Break work into small tasks, estimate each
3. Communicate early if the deadline is unrealistic
4. Focus on the minimum viable deliverable first
5. Eliminate distractions (deep work blocks)

Example answer:
"When I face a tight deadline, I first list all tasks and mark what's truly critical vs nice-to-have. I time-box each task and check in with stakeholders early rather than surprising them at the end. In my internship, I had 3 days to build a dashboard — I delivered the core charts on day 1, added filters on day 2, and polished UX on day 3. The client was happy because I communicated daily."

Avoid saying:
✗ "I just work harder / pull all-nighters" — shows poor planning
✗ "I've never missed a deadline" — sounds dishonest`,
      tip: "Show process and communication, not just hustle.",
    },
    {
      id: 9,
      question: "Why should we hire you for this role?",
      difficulty: "Hard",
      answer: `This is your elevator pitch — prepare it, don't improvise.

Structure:
1. Match your skills to the specific role requirements
2. Highlight 1-2 unique strengths with brief evidence
3. Show enthusiasm for the company/role specifically

Template:
"I bring [relevant skill 1] and [relevant skill 2], which directly match what you need for this role. For example, [brief specific achievement]. I'm also genuinely excited about [specific thing about the company/product/mission] because [personal reason]. I'm confident I can contribute from day one and grow with the team."

Do your homework:
• Read the JD carefully — mirror their language
• Research the company's recent news, product, culture
• Mention something specific about them (not generic praise)

Avoid:
✗ "I'm a hard worker and fast learner" — everyone says this
✗ Listing every skill on your resume — be selective`,
      tip: "Practice this answer until it flows naturally — it's almost always asked first or last.",
    },
  ],
  "system-design": [
    {
      id: 10,
      question: "Design a URL shortener like bit.ly.",
      difficulty: "Hard",
      answer: `Clarify requirements first:
• 100M URLs/day, links expire after 5 years
• Read-heavy (100:1 read/write ratio)

Core components:
1. API Gateway → handles incoming requests
2. URL Service → generates short codes
3. Redirect Service → resolves short → long URL
4. Database → stores mappings

Short code generation:
• Use Base62 encoding (a-z, A-Z, 0-9) = 62^7 ≈ 3.5 trillion unique codes
• Or MD5 hash → take first 7 chars

Database choice:
• NoSQL (Cassandra / DynamoDB) — key-value access pattern, high write throughput

Caching:
• Redis cache for hot URLs (80/20 rule — 20% URLs = 80% traffic)
• Cache TTL aligned with link expiry

Scale:
• Horizontal scaling on redirect service (stateless)
• CDN for global low-latency redirects
• Rate limiting on creation API`,
      tip: "Always start by clarifying scale requirements — 1K vs 1B requests/day change the design entirely.",
    },
    {
      id: 11,
      question: "Design a chat application system.",
      difficulty: "Hard",
      answer: `Requirements:
• 1:1 and group chat, real-time delivery, message history, online status

Key design decisions:

Real-time messaging:
• WebSockets for persistent bidirectional connection
• Each chat server handles N WebSocket connections
• Message broker (Kafka) decouples producers from consumers

Message flow:
1. Sender → WebSocket → Chat Server A
2. Chat Server A → Kafka topic
3. Chat Server B (receiver's server) consumes from Kafka
4. Chat Server B → WebSocket → Receiver

Storage:
• Cassandra for messages (time-series, high write, append-only)
• Redis for online status & presence (TTL-based)
• PostgreSQL for user/group metadata

Delivery guarantees:
• Message IDs + ACK system for at-least-once delivery
• Client-side deduplication

Scale:
• Consistent hashing to route users to chat servers
• Separate read/write paths`,
      tip: "Mention the CAP theorem tradeoff — chat prefers availability over strong consistency.",
    },
    {
      id: 12,
      question: "Design rate limiter for API endpoints.",
      difficulty: "Medium",
      answer: `Purpose: Protect APIs from abuse, ensure fair usage.

Algorithms (know all 4):
1. Token Bucket – tokens refill at fixed rate; bursts allowed up to bucket size
2. Leaky Bucket – requests processed at constant rate; smooths bursts
3. Fixed Window Counter – count requests per time window (simple but edge-case bug)
4. Sliding Window Log – most accurate; stores timestamps in sorted set

Where to implement:
• API Gateway level (centralized) — best for microservices
• Application middleware — easier but not shared across instances

Storage: Redis (atomic INCR + EXPIRE for counters across distributed servers)

Response when limited:
• HTTP 429 Too Many Requests
• Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After

Multi-tier limits:
• Per user: 100 req/min
• Per IP: 500 req/min
• Global: 10,000 req/min`,
      tip: "Describe the sliding window log algorithm — it shows depth beyond the basics.",
    },
  ],
};

const difficultyColors = {
  Easy: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  Medium: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  Hard: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

export default function PracticeQuestionSet() {
  const [activeMode, setActiveMode] = useState("technical");
  const [expandedId, setExpandedId] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [revealedTips, setRevealedTips] = useState({});
  const [completedIds, setCompletedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const questions = questionSets[activeMode];

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiff =
      difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchSearch && matchDiff;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const revealAnswer = (id, e) => {
    e.stopPropagation();
    setRevealedAnswers((prev) => ({ ...prev, [id]: true }));
  };

  const revealTip = (id, e) => {
    e.stopPropagation();
    setRevealedTips((prev) => ({ ...prev, [id]: true }));
  };

  const markDone = (id, e) => {
    e.stopPropagation();
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const completedCount = questions.filter((q) => completedIds.has(q.id)).length;
  const progress = Math.round((completedCount / questions.length) * 100);

  const modeLabels = {
    technical: "💻 Technical",
    behavioral: "🗣️ Behavioral",
    "system-design": "🏗️ System Design",
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h2 style={styles.title}>Practice Question Bank</h2>
            <p style={styles.subtitle}>
              Study model answers before your interview session
            </p>
          </div>
          <div style={styles.progressBadge}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="26" cy="26" r="22" fill="none"
                stroke={progress === 100 ? "#22c55e" : "#3b82f6"}
                strokeWidth="4"
                strokeDasharray={`${(progress / 100) * 138.2} 138.2`}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
              <text x="26" y="31" textAnchor="middle" fontSize="13" fontWeight="700"
                fill={progress === 100 ? "#22c55e" : "#3b82f6"}>
                {progress}%
              </text>
            </svg>
            <span style={styles.progressLabel}>{completedCount}/{questions.length} done</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={styles.tabs}>
          {Object.entries(modeLabels).map(([key, label]) => (
            <button
              key={key}
              style={{ ...styles.tab, ...(activeMode === key ? styles.tabActive : {}) }}
              onClick={() => { setActiveMode(key); setExpandedId(null); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            style={styles.search}
            placeholder="🔍  Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={styles.diffButtons}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                style={{
                  ...styles.diffBtn,
                  ...(difficultyFilter === d ? styles.diffBtnActive : {}),
                  ...(d !== "All" && difficultyFilter !== d
                    ? {
                        borderColor: difficultyColors[d]?.border,
                        color: difficultyColors[d]?.text,
                      }
                    : {}),
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question list */}
      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>No questions match your filter.</div>
        )}
        {filtered.map((q, idx) => {
          const isOpen = expandedId === q.id;
          const answered = revealedAnswers[q.id];
          const tipped = revealedTips[q.id];
          const done = completedIds.has(q.id);
          const dc = difficultyColors[q.difficulty];

          return (
            <div
              key={q.id}
              style={{
                ...styles.card,
                ...(done ? styles.cardDone : {}),
                ...(isOpen ? styles.cardOpen : {}),
              }}
              onClick={() => toggleExpand(q.id)}
            >
              {/* Card header */}
              <div style={styles.cardHeader}>
                <div style={styles.cardLeft}>
                  <span style={styles.qNumber}>Q{idx + 1}</span>
                  <span style={{ ...styles.diffTag, background: dc.bg, color: dc.text, borderColor: dc.border }}>
                    {q.difficulty}
                  </span>
                </div>
                <div style={styles.cardRight}>
                  <button
                    style={{ ...styles.doneBtn, ...(done ? styles.doneBtnActive : {}) }}
                    onClick={(e) => markDone(q.id, e)}
                    title={done ? "Mark as not done" : "Mark as done"}
                  >
                    {done ? "✓ Done" : "Mark done"}
                  </button>
                  <span style={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              <p style={{ ...styles.questionText, ...(done ? styles.questionDone : {}) }}>
                {q.question}
              </p>

              {/* Expanded content */}
              {isOpen && (
                <div style={styles.expandedBody} onClick={(e) => e.stopPropagation()}>
                  {/* Answer section */}
                  <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                      <span style={styles.sectionIcon}>📝</span>
                      <span style={styles.sectionTitle}>Model Answer</span>
                    </div>
                    {answered ? (
                      <pre style={styles.answerText}>{q.answer}</pre>
                    ) : (
                      <button style={styles.revealBtn} onClick={(e) => revealAnswer(q.id, e)}>
                        👁 Reveal Answer
                      </button>
                    )}
                  </div>

                  {/* Interview tip */}
                  <div style={styles.tipSection}>
                    <div style={styles.sectionHeader}>
                      <span style={styles.sectionIcon}>💡</span>
                      <span style={styles.sectionTitle}>Interview Tip</span>
                    </div>
                    {tipped ? (
                      <p style={styles.tipText}>{q.tip}</p>
                    ) : (
                      <button style={styles.tipBtn} onClick={(e) => revealTip(q.id, e)}>
                        ✨ Show Tip
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "0 0 3rem",
    color: "#1e293b",
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "1.5rem 1.5rem 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  title: { margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" },
  subtitle: { margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#64748b" },
  progressBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  progressLabel: { fontSize: "0.75rem", color: "#64748b", fontWeight: 500 },
  tabs: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem" },
  tab: {
    padding: "0.5rem 1rem",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#64748b",
    borderBottom: "2px solid transparent",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#fff",
    color: "#3b82f6",
    borderColor: "#e2e8f0",
    borderBottomColor: "#3b82f6",
    fontWeight: 600,
  },
  filters: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    padding: "0.75rem 0",
    flexWrap: "wrap",
  },
  search: {
    flex: 1,
    minWidth: "180px",
    padding: "0.5rem 0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.875rem",
    outline: "none",
    background: "#f8fafc",
  },
  diffButtons: { display: "flex", gap: "0.4rem" },
  diffBtn: {
    padding: "0.35rem 0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#64748b",
    transition: "all 0.15s",
  },
  diffBtnActive: {
    background: "#3b82f6",
    color: "#fff",
    borderColor: "#3b82f6",
  },
  list: { padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  empty: {
    textAlign: "center",
    padding: "2rem",
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    cursor: "pointer",
    transition: "box-shadow 0.15s, border-color 0.15s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardOpen: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.08)",
  },
  cardDone: {
    background: "#f0fdf4",
    borderColor: "#86efac",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: "0.5rem" },
  cardRight: { display: "flex", alignItems: "center", gap: "0.75rem" },
  qNumber: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#94a3b8",
    minWidth: "28px",
  },
  diffTag: {
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "20px",
    border: "1px solid",
    letterSpacing: "0.02em",
  },
  doneBtn: {
    padding: "0.25rem 0.65rem",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#64748b",
    transition: "all 0.15s",
  },
  doneBtnActive: {
    background: "#dcfce7",
    borderColor: "#86efac",
    color: "#16a34a",
    fontWeight: 600,
  },
  chevron: { fontSize: "0.6rem", color: "#94a3b8" },
  questionText: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 500,
    color: "#1e293b",
    lineHeight: 1.5,
  },
  questionDone: { color: "#64748b", textDecoration: "line-through" },
  expandedBody: {
    marginTop: "1rem",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  section: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "1rem",
    border: "1px solid #f1f5f9",
  },
  tipSection: {
    background: "#fffbeb",
    borderRadius: "10px",
    padding: "1rem",
    border: "1px solid #fef08a",
  },
  sectionHeader: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" },
  sectionIcon: { fontSize: "1rem" },
  sectionTitle: { fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" },
  answerText: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#334155",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  tipText: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#78350f",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  revealBtn: {
    padding: "0.5rem 1.25rem",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  tipBtn: {
    padding: "0.45rem 1rem",
    background: "#fef9c3",
    color: "#854d0e",
    border: "1px solid #fde047",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
};