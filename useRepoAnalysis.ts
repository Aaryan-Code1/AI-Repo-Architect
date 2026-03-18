// src/hooks/useRepoAnalysis.ts
// Handles SSE streaming from the FastAPI backend

import { useState, useCallback } from "react";

export interface RepoMeta {
  name: string;
  stars: number;
  language: string;
  files: string[];
}

export interface AnalysisResult {
  summary: string;
  technologies: string[];
  structure_notes: string;
  first_issues: Array<{
    title: string;
    description: string;
    difficulty: string;
    files: string[];
  }>;
}

type Phase = "idle" | "fetching" | "streaming" | "done" | "error";

export function useRepoAnalysis() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [meta, setMeta] = useState<RepoMeta | null>(null);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (repoUrl: string) => {
    setPhase("fetching");
    setMeta(null);
    setStreamBuffer("");
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let rawAI = "";

      setPhase("streaming");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "meta") {
              setMeta(event.data);
            } else if (event.type === "token") {
              rawAI += event.data;
              setStreamBuffer(rawAI);
            } else if (event.type === "done") {
              // Parse the final JSON from AI
              try {
                const parsed: AnalysisResult = JSON.parse(rawAI);
                setResult(parsed);
              } catch {
                // Model didn't return clean JSON — show raw text anyway
                setResult({
                  summary: rawAI,
                  technologies: [],
                  structure_notes: "",
                  first_issues: [],
                });
              }
              setPhase("done");
            }
          } catch {
            // Malformed SSE line — skip
          }
        }
      }
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setMeta(null);
    setStreamBuffer("");
    setResult(null);
    setError(null);
  }, []);

  return { phase, meta, streamBuffer, result, error, analyze, reset };
}
