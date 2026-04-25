// ──────────────────────────────────────────────────────────────
// pages/Analyze.jsx — Repository analysis page
// Input a GitHub URL and get AI-powered codebase explanation
// ──────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { AnalysisLoader, ButtonSpinner } from "../components/Loader";

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      const res = await api.post("/repos/analyze", { url: url.trim() });
      navigate(`/repo/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <AnalysisLoader />
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
