"""
AI Repo-Architect — FastAPI Backend
Fetches GitHub repo data and streams analysis via local Ollama (qwen2.5-coder:3b)
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import sqlite3
import json
import re
from datetime import datetime

app = FastAPI(title="Repo Architect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Database Setup ────────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect("analyses.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_url TEXT NOT NULL,
            repo_name TEXT,
            analysis_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ─── Models ────────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    repo_url: str

# ─── GitHub Fetcher ────────────────────────────────────────────────────────────

GITHUB_API = "https://api.github.com"
HEADERS = {"Accept": "application/vnd.github+json"}
# Optional: add a token for higher rate limits
# HEADERS["Authorization"] = "Bearer YOUR_TOKEN_HERE"

def parse_github_url(url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    match = re.search(r"github\.com/([^/]+)/([^/\s]+)", url)
    if not match:
        raise ValueError("Invalid GitHub URL")
    owner, repo = match.group(1), match.group(2).rstrip(".git")
    return owner, repo

def fetch_repo_data(owner: str, repo: str) -> dict:
    """Fetch README content and file tree from GitHub API."""
    # Fetch repo metadata
    meta_resp = requests.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=HEADERS, timeout=10)
    if meta_resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Repository not found")
    meta_resp.raise_for_status()
    meta = meta_resp.json()

    # Fetch README
    readme_text = ""
    readme_resp = requests.get(f"{GITHUB_API}/repos/{owner}/{repo}/readme", headers=HEADERS, timeout=10)
    if readme_resp.status_code == 200:
        import base64
        readme_text = base64.b64decode(readme_resp.json()["content"]).decode("utf-8", errors="ignore")
        readme_text = readme_text[:3000]  # Limit tokens

    # Fetch top-level file tree
    tree_resp = requests.get(
        f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{meta['default_branch']}?recursive=0",
        headers=HEADERS, timeout=10
    )
    file_list = []
    if tree_resp.status_code == 200:
        items = tree_resp.json().get("tree", [])
        file_list = [f"{i['path']}{'/' if i['type'] == 'tree' else ''}" for i in items[:50]]

    return {
        "name": meta["full_name"],
        "description": meta.get("description", ""),
        "stars": meta.get("stargazers_count", 0),
        "language": meta.get("language", "Unknown"),
        "readme": readme_text,
        "files": file_list,
    }

# ─── Ollama Streaming ──────────────────────────────────────────────────────────

OLLAMA_URL = "http://localhost:11434/api/generate"

def build_prompt(repo_data: dict) -> str:
    files_str = "\n".join(repo_data["files"][:40])
    return f"""You are a Senior Software Engineer helping new contributors understand a GitHub repository.

Repository: {repo_data['name']}
Description: {repo_data['description']}
Primary Language: {repo_data['language']}

--- README (first 2000 chars) ---
{repo_data['readme'][:2000]}

--- TOP-LEVEL FILE STRUCTURE ---
{files_str}

Based on this information, provide a structured contributor roadmap in JSON format with these exact keys:
{{
  "summary": "2-3 sentence overview of the project purpose and architecture",
  "technologies": ["list", "of", "detected", "tech"],
  "structure_notes": "Brief explanation of the folder organization pattern",
  "first_issues": [
    {{
      "title": "Short, specific task title",
      "description": "What to do and where. Reference actual file paths if visible.",
      "difficulty": "Easy",
      "files": ["relevant/file.ts"]
    }}
  ]
}}

Respond ONLY with valid JSON. No markdown fences, no extra text."""

def stream_ollama(prompt: str):
    """Generator that yields streamed chunks from Ollama."""
    payload = {
        "model": "qwen2.5-coder:3b",
        "prompt": prompt,
        "stream": True,
    }
    with requests.post(OLLAMA_URL, json=payload, stream=True, timeout=120) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines():
            if line:
                chunk = json.loads(line)
                yield chunk.get("response", "")
                if chunk.get("done"):
                    break

# ─── Routes ────────────────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze_repo(req: AnalyzeRequest):
    """Main endpoint — fetches repo, streams AI analysis back to client."""
    try:
        owner, repo = parse_github_url(req.repo_url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")

    repo_data = fetch_repo_data(owner, repo)
    prompt = build_prompt(repo_data)

    # Collect full response for DB storage while streaming
    full_response = []

    def event_stream():
        # First, send repo metadata so the frontend can display it immediately
        yield f"data: {json.dumps({'type': 'meta', 'data': {'name': repo_data['name'], 'stars': repo_data['stars'], 'language': repo_data['language'], 'files': repo_data['files']}})}\n\n"

        # Then stream the AI response token by token
        for token in stream_ollama(prompt):
            full_response.append(token)
            yield f"data: {json.dumps({'type': 'token', 'data': token})}\n\n"

        # Save to DB
        analysis_text = "".join(full_response)
        try:
            conn = sqlite3.connect("analyses.db")
            conn.execute(
                "INSERT INTO analyses (repo_url, repo_name, analysis_json) VALUES (?, ?, ?)",
                (req.repo_url, repo_data["name"], analysis_text)
            )
            conn.commit()
            conn.close()
        except Exception:
            pass  # Don't fail on DB error

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/history")
def get_history(limit: int = 10):
    """Return recent analysis history."""
    conn = sqlite3.connect("analyses.db")
    rows = conn.execute(
        "SELECT id, repo_url, repo_name, created_at FROM analyses ORDER BY created_at DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [{"id": r[0], "url": r[1], "name": r[2], "analyzed_at": r[3]} for r in rows]


@app.get("/health")
def health():
    return {"status": "ok", "model": "qwen2.5-coder:3b", "ollama": OLLAMA_URL}
