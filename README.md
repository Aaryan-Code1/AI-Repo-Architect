# 🏗️ AI Repo-Architect

> Paste a GitHub URL → get an AI-generated contributor roadmap with folder analysis, tech detection, and suggested first issues.

![Demo](docs/demo.gif)

## ✨ Features

- **Real-time AI streaming** — Watch the analysis type out token by token
- **Folder tree visualization** — Interactive collapsible file tree
- **Tech stack detection** — Auto-detected from README and file extensions
- **First issue suggestions** — 3 actionable tasks with specific file references
- **Analysis history** — SQLite-backed log of all analyzed repos

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python + FastAPI |
| AI Model | `qwen2.5-coder:3b` via Ollama (runs locally — free!) |
| Frontend | Next.js 14 + Tailwind CSS |
| Storage | SQLite (built-in, zero config) |
| Streaming | Server-Sent Events (SSE) |

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com/) installed

### 1. Pull the AI model

```bash
ollama pull qwen2.5-coder:3b
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — paste any public GitHub URL!

### Optional: GitHub API Token (higher rate limits)

Without a token you get 60 requests/hour. With one, 5,000/hour.

```bash
# In backend/.env
GITHUB_TOKEN=ghp_your_token_here
```

## 📂 Project Structure

```
ai-repo-architect/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── requirements.txt
│   └── analyses.db          # SQLite DB (auto-created)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main dashboard page
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── RepoInput.tsx    # URL input form
│   │   │   ├── FolderTree.tsx   # Interactive file tree
│   │   │   ├── TechBadge.tsx    # Technology pill badges
│   │   │   ├── IssueCard.tsx    # Suggested issue card
│   │   │   └── StreamingText.tsx # Typewriter effect component
│   │   └── hooks/
│   │       └── useRepoAnalysis.ts  # SSE streaming hook
│   ├── package.json
│   └── tailwind.config.ts
├── docs/
│   └── demo.gif
└── README.md
```

## 🧠 How It Works

```
User pastes URL
    │
    ▼
FastAPI parses owner/repo from URL
    │
    ▼
GitHub API → fetches README.md + file tree
    │
    ▼
Prompt built: "Act as Senior Engineer. Analyze this..."
    │
    ▼
Ollama (qwen2.5-coder:3b) → streams JSON response
    │
    ▼
SSE stream → Next.js frontend renders token by token
    │
    ▼
Result saved to SQLite
```

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/analyze` | Stream analysis for a repo URL |
| `GET` | `/history` | Fetch recent analyses |
| `GET` | `/health` | Check Ollama connection |

### Example request

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/tiangolo/fastapi"}' \
  --no-buffer
```

## 📈 Roadmap

- [ ] GitHub OAuth for private repos
- [ ] `react-force-graph` dependency graph visualization
- [ ] Export roadmap as PDF / markdown
- [ ] Compare two repos side by side
- [ ] Webhook: analyze repo on every new PR

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push and open a PR

## 📄 License

MIT
