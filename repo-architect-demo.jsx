import { useState, useEffect, useRef } from "react";

const MOCK_ANALYSIS = {
  structure: [
    { name: "src/", type: "dir", children: ["components/", "hooks/", "utils/", "pages/"] },
    { name: "public/", type: "dir", children: ["assets/", "fonts/"] },
    { name: "tests/", type: "dir", children: ["unit/", "integration/"] },
    { name: "docs/", type: "dir", children: ["api.md", "contributing.md"] },
    { name: "package.json", type: "file" },
    { name: "README.md", type: "file" },
    { name: "docker-compose.yml", type: "file" },
  ],
  technologies: ["React 18", "TypeScript", "Vite", "Jest", "ESLint", "Prettier", "Docker"],
  firstIssues: [
    {
      label: "good first issue",
      title: "Add loading skeleton to UserCard component",
      description: "Replace the current spinner in src/components/UserCard.tsx with a proper skeleton loader. Great intro to the component patterns used here.",
      difficulty: "Easy",
      files: ["src/components/UserCard.tsx", "src/styles/skeleton.css"],
    },
    {
      label: "good first issue",
      title: "Write unit tests for the useDebounce hook",
      description: "The hook at src/hooks/useDebounce.ts currently has 0% test coverage. Add tests using the existing Jest + React Testing Library setup.",
      difficulty: "Easy",
      files: ["src/hooks/useDebounce.ts", "tests/unit/hooks/"],
    },
    {
      label: "good first issue",
      title: "Document the REST API endpoints in docs/api.md",
      description: "Several new endpoints were added last sprint but docs/api.md is outdated. Check the route files and bring the docs up to date.",
      difficulty: "Easy",
      files: ["docs/api.md", "src/api/routes/"],
    },
  ],
  summary:
    "This is a modern React + TypeScript application scaffolded with Vite. The codebase follows a feature-based folder structure with clear separation of concerns — components, hooks, and utilities are cleanly isolated. CI/CD is handled via GitHub Actions, and Docker is configured for containerized deployment. The project has good test infrastructure but coverage could be improved, especially in the hooks layer.",
};

function typewriterStream(text, onChunk, onDone, speed = 18) {
  let i = 0;
  function tick() {
    if (i < text.length) {
      onChunk(text.slice(0, i + 1));
      i++;
      setTimeout(tick, speed);
    } else {
      onDone();
    }
  }
  tick();
}

function FolderNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "dir";
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <button
        onClick={() => isDir && setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: isDir ? "#a78bfa" : "#94a3b8",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          cursor: isDir ? "pointer" : "default",
          padding: "3px 0",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.7, width: 10 }}>{isDir ? (open ? "▾" : "▸") : ""}</span>
        <span style={{ fontSize: 14 }}>{isDir ? "📁" : "📄"}</span>
        <span>{node.name}</span>
      </button>
      {isDir && open && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FolderNode
              key={i}
              node={typeof child === "string" ? { name: child, type: child.endsWith("/") ? "dir" : "file" } : child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TechBadge({ name }) {
  const colors = {
    React: "#61dafb",
    TypeScript: "#3178c6",
    Vite: "#fbbf24",
    Jest: "#c84b31",
    ESLint: "#4b32c3",
    Prettier: "#ea5e96",
    Docker: "#2496ed",
  };
  const base = Object.keys(colors).find((k) => name.includes(k));
  const color = colors[base] || "#a78bfa";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 4,
        border: `1px solid ${color}44`,
        background: `${color}11`,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        margin: "3px",
      }}
    >
      {name}
    </span>
  );
}

function IssueCard({ issue, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 8,
        padding: "16px",
        marginBottom: 12,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            background: "#16a34a22",
            color: "#4ade80",
            border: "1px solid #4ade8044",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {issue.label}
        </span>
        <span
          style={{
            background: "#1d4ed822",
            color: "#60a5fa",
            border: "1px solid #60a5fa44",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {issue.difficulty}
        </span>
      </div>
      <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{issue.title}</div>
      <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{issue.description}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {issue.files.map((f, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#a78bfa",
              background: "#a78bfa11",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | fetching | analyzing | done
  const [streamedText, setStreamedText] = useState("");
  const [showStructure, setShowStructure] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef(null);

  function startAnalysis() {
    if (!url.trim()) return;
    setPhase("fetching");
    setStreamedText("");
    setShowStructure(false);
    setShowTech(false);
    setShowIssues(false);
    setProgress(0);

    // Simulate fetching phase
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 60) {
        clearInterval(progressRef.current);
        setProgress(60);
        setPhase("analyzing");
        // Start streaming AI text
        typewriterStream(
          MOCK_ANALYSIS.summary,
          (t) => setStreamedText(t),
          () => {
            setProgress(100);
            setShowStructure(true);
            setTimeout(() => setShowTech(true), 400);
            setTimeout(() => setShowIssues(true), 800);
            setTimeout(() => setPhase("done"), 800);
          },
          14
        );
      } else {
        setProgress(Math.min(p, 60));
      }
    }, 80);
  }

  function reset() {
    setPhase("idle");
    setUrl("");
    setStreamedText("");
    setShowStructure(false);
    setShowTech(false);
    setShowIssues(false);
    setProgress(0);
  }

  const isRunning = phase === "fetching" || phase === "analyzing";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#e2e8f0",
        padding: "0",
        margin: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#020617",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏗️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>Repo Architect</div>
            <div style={{ fontSize: 11, color: "#475569" }}>AI-powered contributor roadmaps</div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            fontFamily: "'JetBrains Mono', monospace",
            background: "#0f172a",
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #1e293b",
          }}
        >
          powered by qwen2.5-coder via Ollama
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        {phase === "idle" && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#a78bfa",
                background: "#a78bfa11",
                border: "1px solid #a78bfa33",
                padding: "4px 12px",
                borderRadius: 20,
                marginBottom: 20,
                letterSpacing: "0.05em",
              }}
            >
              OPEN SOURCE CONTRIBUTOR TOOL
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 16,
                background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Understand any repo
              <br />
              in 30 seconds.
            </h1>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
              Paste a GitHub URL. Our AI reads the structure and README, then generates a contributor roadmap with easy first issues — tailored for you.
            </p>
          </div>
        )}

        {/* Input */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: 20,
            marginBottom: phase !== "idle" ? 32 : 0,
          }}
        >
          <div style={{ fontSize: 12, color: "#475569", fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
            $ repo-architect analyze
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isRunning && startAnalysis()}
              placeholder="https://github.com/facebook/react"
              disabled={isRunning}
              style={{
                flex: 1,
                background: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#e2e8f0",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                outline: "none",
              }}
            />
            {phase === "done" ? (
              <button
                onClick={reset}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                ↺ Reset
              </button>
            ) : (
              <button
                onClick={startAnalysis}
                disabled={isRunning || !url.trim()}
                style={{
                  background: isRunning ? "#1e293b" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  color: isRunning ? "#475569" : "#fff",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {isRunning ? "Analyzing..." : "Analyze →"}
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
                  {phase === "fetching" ? "⚡ Fetching repo data from GitHub API..." : "🤖 AI is reading and analyzing..."}
                </span>
                <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "monospace" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #7c3aed, #60a5fa)",
                    borderRadius: 4,
                    transition: "width 0.1s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {(streamedText || showStructure) && (
          <div>
            {/* AI Summary Stream */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#4ade80",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                    animation: phase === "analyzing" ? "pulse 1s infinite" : "none",
                  }}
                />
                AI ARCHITECT — REPO SUMMARY
              </div>
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: 18,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#94a3b8",
                  fontFamily: "'JetBrains Mono', monospace",
                  minHeight: 60,
                }}
              >
                {streamedText}
                {phase === "analyzing" && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 14,
                      background: "#a78bfa",
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                      animation: "blink 0.8s step-end infinite",
                    }}
                  />
                )}
              </div>
            </div>

            {/* 2-col grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Folder Structure */}
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: 18,
                  opacity: showStructure ? 1 : 0,
                  transform: showStructure ? "translateY(0)" : "translateY(16px)",
                  transition: "all 0.5s ease",
                }}
              >
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 14 }}>
                  📁 FOLDER STRUCTURE
                </div>
                {MOCK_ANALYSIS.structure.map((node, i) => (
                  <FolderNode key={i} node={node} depth={0} />
                ))}
              </div>

              {/* Technologies */}
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: 18,
                  opacity: showTech ? 1 : 0,
                  transform: showTech ? "translateY(0)" : "translateY(16px)",
                  transition: "all 0.5s ease",
                }}
              >
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 14 }}>
                  ⚙️ DETECTED TECHNOLOGIES
                </div>
                <div style={{ marginBottom: 20 }}>
                  {MOCK_ANALYSIS.technologies.map((t, i) => (
                    <TechBadge key={i} name={t} />
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #1e293b", paddingTop: 14 }}>
                  <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 10 }}>
                    📊 CONTRIBUTION STATS
                  </div>
                  {[
                    { label: "Test Coverage", val: 62, color: "#fbbf24" },
                    { label: "Doc Coverage", val: 45, color: "#f87171" },
                    { label: "Code Health", val: 88, color: "#4ade80" },
                  ].map((s) => (
                    <div key={s.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <span>{s.label}</span><span style={{ color: s.color }}>{s.val}%</span>
                      </div>
                      <div style={{ height: 4, background: "#1e293b", borderRadius: 4 }}>
                        <div style={{ width: `${showTech ? s.val : 0}%`, height: "100%", background: s.color, borderRadius: 4, transition: "width 1s ease 0.3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* First Issues */}
            {showIssues && (
              <div>
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 14 }}>
                  🚀 SUGGESTED FIRST ISSUES FOR NEW CONTRIBUTORS
                </div>
                {MOCK_ANALYSIS.firstIssues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} delay={i * 200} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Try example */}
        {phase === "idle" && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div style={{ fontSize: 12, color: "#334155", marginBottom: 12 }}>Try an example:</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {["facebook/react", "vercel/next.js", "tiangolo/fastapi"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setUrl(`https://github.com/${ex}`)}
                  style={{
                    background: "none",
                    border: "1px solid #1e293b",
                    borderRadius: 6,
                    padding: "6px 12px",
                    color: "#475569",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: 12,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "#a78bfa44"; e.target.style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "#1e293b"; e.target.style.color = "#475569"; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
