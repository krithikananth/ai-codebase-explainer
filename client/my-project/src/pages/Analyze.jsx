// ──────────────────────────────────────────────────────────────
// pages/Analyze.jsx — Repository analysis page
// Uses background processing: starts analysis, then polls for
// completion instead of waiting for the full response
// ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { AnalysisLoader, ButtonSpinner } from "../components/Loader";

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // analyzing progress text
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const pollRef = useRef(null);
  const stepTimersRef = useRef([]);

  // Cleanup polling and step timers on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      stepTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Simulate step-by-step progress while loading
  useEffect(() => {
    if (!loading) {
      stepTimersRef.current.forEach((t) => clearTimeout(t));
      stepTimersRef.current = [];
      return;
    }

    setCurrentStep(0);
    const timings = [
      { step: 1, delay: 2500 },  // Clone done
      { step: 2, delay: 5000 },  // File tree extracted
      { step: 3, delay: 7000 },  // Tech stack detected
      { step: 4, delay: 12000 }, // AI analyzing (longest step)
    ];

    stepTimersRef.current = timings.map(({ step, delay }) =>
      setTimeout(() => setCurrentStep(step), delay)
    );

    return () => {
      stepTimersRef.current.forEach((t) => clearTimeout(t));
      stepTimersRef.current = [];
    };
  }, [loading]);

  /**
   * Poll the repo status until completed or failed
   */
  const pollForCompletion = (repoId) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (every 5s)

    setStatus("AI is analyzing the codebase...");

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/repos/${repoId}`);
        const repo = res.data;

        if (repo.status === "completed") {
          clearInterval(pollRef.current);
          navigate(`/repo/${repoId}`);
        } else if (repo.status === "failed") {
          clearInterval(pollRef.current);
          setError("Analysis failed. Please try a different repository.");
          setLoading(false);
          setStatus("");
        } else {
          // Still analyzing — update progress
          if (attempts < 10) setStatus("🔍 Cloning and scanning repository...");
          else if (attempts < 20) setStatus("🤖 AI is generating insights...");
          else if (attempts < 30) setStatus("📐 Building architecture diagram...");
          else setStatus("⏳ Almost done, finishing up...");
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          setError("Analysis is taking too long. Check My Repositories later.");
          setLoading(false);
          setStatus("");
        }
      } catch {
        // Network hiccup — keep polling
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          setError("Connection lost. Check My Repositories for results.");
          setLoading(false);
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const analyzeRepo = async (e) => {
    e?.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(url.replace(/\.git$/, ""))) {
      setError("Please enter a valid GitHub URL (e.g., https://github.com/user/repo)");
      return;
    }

    try {
      setLoading(true);
      setStatus("🚀 Starting analysis...");

      // Fire the analysis request
      const res = await api.post("/repos/analyze", { url: url.trim() });

      // If response came back fast (cached result), navigate directly
      if (res.data?.status === "completed") {
        setCurrentStep(5); // All steps complete
        setTimeout(() => navigate(`/repo/${res.data._id}`), 800);
        return;
      }

      // Otherwise, it returned early with the pending repo — poll for completion
      if (res.data?._id) {
        setCurrentStep(5);
        setTimeout(() => navigate(`/repo/${res.data._id}`), 800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";

      // Check if it's a timeout but analysis is still running in background
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setStatus("⏳ Analysis is still running in the background...");
        // Try to find the repo by polling the repos list
        try {
          const reposRes = await api.get("/repos");
          const pending = reposRes.data.find(
            (r) => r.status === "analyzing" && r.url.includes(url.split("/").pop())
          );
          if (pending) {
            pollForCompletion(pending._id);
            return;
          }
        } catch {
          // Ignore and fall through
        }
        setError("Analysis timed out. Check My Repositories in a few minutes.");
        setLoading(false);
      } else {
        setError(msg || "Analysis failed. Please try again.");
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <AnalysisLoader currentStep={currentStep} />
          {status && (
            <p className="text-gray-400 text-sm animate-pulse">{status}</p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Analyze</span> a GitHub Repository
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Paste a repo link and get instant AI-powered insights
          </p>
        </div>

        {/* URL input card */}
        <div className="glass-card p-8">
          <form onSubmit={analyzeRepo} className="space-y-4">
            <label className="block text-sm text-gray-400 mb-1">
              GitHub Repository URL
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="repo-url-input"
                type="url"
                className="input-glass flex-1 text-base"
                placeholder="https://github.com/username/repository"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                id="analyze-button"
                type="submit"
                disabled={loading}
                className="btn-gradient px-8 py-3 whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? <ButtonSpinner /> : "🔍 Analyze"}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📂",
              title: "File Structure",
              desc: "Complete folder tree with explanations",
            },
            {
              icon: "🤖",
              title: "AI Analysis",
              desc: "Architecture, tech stack, and key features",
            },
            {
              icon: "💬",
              title: "Chat Q&A",
              desc: "Ask questions about any part of the code",
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="glass-card p-5 text-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3 block">{card.icon}</span>
              <h3 className="font-semibold text-white mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Example repos */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Try these examples
          </h3>
          <div className="space-y-2">
            {[
              "https://github.com/facebook/react",
              "https://github.com/expressjs/express",
              "https://github.com/vercel/next.js",
            ].map((exUrl) => (
              <button
                key={exUrl}
                onClick={() => setUrl(exUrl)}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-800/50 transition-all text-sm text-gray-400 hover:text-indigo-300 flex items-center gap-3 group"
              >
                <span className="text-gray-600 group-hover:text-indigo-500">→</span>
                <span className="truncate">{exUrl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
