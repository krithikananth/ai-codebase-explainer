// ──────────────────────────────────────────────────────────────
// pages/Compare.jsx — Repository comparison page
// Side-by-side comparison of two analyzed repositories
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { PageLoader, ButtonSpinner, Skeleton } from "../components/Loader";

const StatRow = ({ label, val1, val2, icon }) => {
  const n1 = typeof val1 === "number" ? val1 : 0;
  const n2 = typeof val2 === "number" ? val2 : 0;
  const higher1 = n1 > n2;
  const higher2 = n2 > n1;

  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800/50 items-center">
      <div className={`text-right font-medium ${higher1 ? "text-emerald-400" : "text-gray-300"}`}>
        {typeof val1 === "number" ? val1.toLocaleString() : val1 || "N/A"}
        {higher1 && <span className="ml-1 text-xs">▲</span>}
      </div>
      <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-1.5">
        <span>{icon}</span> {label}
      </div>
      <div className={`text-left font-medium ${higher2 ? "text-emerald-400" : "text-gray-300"}`}>
        {higher2 && <span className="mr-1 text-xs">▲</span>}
        {typeof val2 === "number" ? val2.toLocaleString() : val2 || "N/A"}
      </div>
    </div>
  );
};

export default function Compare() {
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get("/repos");
        const completed = res.data.filter((r) => r.status === "completed");
        setRepos(completed);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchRepos();
  }, []);

  const handleCompare = async () => {
    if (!id1 || !id2 || id1 === id2) return;
    setError("");
    setComparing(true);
    setResult(null);

    try {
      const res = await api.get(`/compare/${id1}/${id2}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            ⚖️ <span className="gradient-text">Compare Repositories</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Side-by-side comparison with AI-powered analysis
          </p>
        </div>

        {/* Selector */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-400 mb-2">Repository 1</label>
              <select
                id="compare-repo1"
                value={id1}
                onChange={(e) => setId1(e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Select a repository...</option>
                {repos.map((r) => (
                  <option key={r._id} value={r._id} disabled={r._id === id2}>
                    {r.owner ? `${r.owner}/` : ""}{r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center justify-center w-12 h-12
              rounded-xl bg-gray-800/80 border border-gray-700/50 text-lg flex-shrink-0">
              ⚡
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-400 mb-2">Repository 2</label>
              <select
                id="compare-repo2"
                value={id2}
                onChange={(e) => setId2(e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Select a repository...</option>
                {repos.map((r) => (
                  <option key={r._id} value={r._id} disabled={r._id === id1}>
                    {r.owner ? `${r.owner}/` : ""}{r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="compare-button"
              onClick={handleCompare}
              disabled={!id1 || !id2 || id1 === id2 || comparing}
              className="btn-gradient px-8 py-3 whitespace-nowrap flex items-center gap-2"
            >
              {comparing ? <ButtonSpinner /> : "⚖️ Compare"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {comparing && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500
              rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Generating AI comparison...</p>
          </div>
        )}

        {/* Empty state */}
        {!result && !comparing && (
          <div className="glass-card p-16 text-center">
            <span className="text-6xl mb-4 block">⚖️</span>
            <h3 className="text-lg font-semibold text-gray-300">
              Select two repositories to compare
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Choose from your analyzed repositories above to see a detailed side-by-side comparison with AI insights
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats comparison */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">📊</span>
                <h2 className="text-lg font-semibold text-white">Statistics Comparison</h2>
              </div>

              {/* Repo names header */}
              <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b border-gray-700/50">
                <div className="text-right">
                  <p className="font-semibold text-indigo-300 truncate">
                    {result.repo1.owner ? `${result.repo1.owner}/` : ""}{result.repo1.name}
                  </p>
                </div>
                <div className="text-center text-xs text-gray-600 uppercase tracking-wider">
                  vs
                </div>
                <div className="text-left">
                  <p className="font-semibold text-purple-300 truncate">
                    {result.repo2.owner ? `${result.repo2.owner}/` : ""}{result.repo2.name}
                  </p>
                </div>
              </div>

              <StatRow label="Files" icon="📄" val1={result.repo1.stats?.totalFiles} val2={result.repo2.stats?.totalFiles} />
              <StatRow label="Folders" icon="📁" val1={result.repo1.stats?.totalFolders} val2={result.repo2.stats?.totalFolders} />
              <StatRow label="LOC" icon="💻" val1={result.repo1.stats?.linesOfCode} val2={result.repo2.stats?.linesOfCode} />
              <StatRow label="Complexity" icon="🧠" val1={result.repo1.stats?.complexity} val2={result.repo2.stats?.complexity} />
              <StatRow label="Stars" icon="⭐" val1={result.repo1.githubMeta?.stars} val2={result.repo2.githubMeta?.stars} />
              <StatRow label="Forks" icon="🍴" val1={result.repo1.githubMeta?.forks} val2={result.repo2.githubMeta?.forks} />
              <StatRow label="Contributors" icon="👥" val1={result.repo1.contributors?.length} val2={result.repo2.contributors?.length} />
            </div>

            {/* Tech Stack Comparison */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">🛠️</span>
                <h2 className="text-lg font-semibold text-white">Tech Stack Comparison</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[result.repo1, result.repo2].map((repo, idx) => {
                  const otherTech = idx === 0 ? result.repo2.techStack : result.repo1.techStack;
                  return (
                    <div key={idx}>
                      <p className={`text-sm font-medium mb-3 ${idx === 0 ? "text-indigo-300" : "text-purple-300"}`}>
                        {repo.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(repo.techStack || []).map((tech) => {
                          const shared = otherTech?.includes(tech);
                          return (
                            <span
                              key={tech}
                              className={`text-xs px-2.5 py-1 rounded-lg ${
                                shared
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-gray-800 text-gray-400"
                              }`}
                            >
                              {shared && "✅ "}{tech}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary */}
            {result.aiComparison && (
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-700/50">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">AI Comparison Analysis</h2>
                    <p className="text-xs text-gray-500">Generated by Gemini AI</p>
                  </div>
                </div>
                <div className="markdown-content prose-spacing">
                  <ReactMarkdown>{result.aiComparison}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
