// ──────────────────────────────────────────────────────────────
// pages/Dashboard.jsx — Main dashboard with stats & recent repos
// Shows user's analyzed repositories and quick-analyze input
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "../components/Loader";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get("/repos");
        setRepos(res.data);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const completedRepos = repos.filter((r) => r.status === "completed");
  const totalFiles = completedRepos.reduce((sum, r) => sum + (r.stats?.totalFiles || 0), 0);
  const totalLOC = completedRepos.reduce((sum, r) => sum + (r.stats?.linesOfCode || 0), 0);

  const quickStats = [
    { label: "Repos Analyzed", value: completedRepos.length, icon: "📊", gradient: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30" },
    { label: "Total Files Scanned", value: totalFiles.toLocaleString(), icon: "📄", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
    { label: "Lines of Code", value: totalLOC.toLocaleString(), icon: "💻", gradient: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30" },
    { label: "AI Explanations", value: completedRepos.length, icon: "🤖", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name || "User"}</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Your AI-powered codebase analysis dashboard
          </p>
        </div>

        {/* Quick action card */}
        <div className="glass-card p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">🔍 Analyze a New Repository</h2>
              <p className="text-gray-400 text-sm mt-1">
                Paste a GitHub URL to get AI-powered insights in seconds
              </p>
            </div>
            <button
              onClick={() => navigate("/analyze")}
              className="btn-gradient whitespace-nowrap"
            >
              Start Analysis →
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            : quickStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`glass-card p-4 bg-gradient-to-br ${stat.gradient} ${stat.border} animate-fade-in`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{stat.icon}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
        </div>

        {/* Recent repos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Analyses</h2>
            {repos.length > 0 && (
              <button
                onClick={() => navigate("/repos")}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all →
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" count={3} />
            </div>
          ) : repos.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">🚀</span>
              <h3 className="text-lg font-semibold text-gray-300">No repos analyzed yet</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Start by analyzing a GitHub repository to see AI-powered insights
              </p>
              <button
                onClick={() => navigate("/analyze")}
                className="btn-gradient mt-4"
              >
                Analyze Your First Repo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {repos.slice(0, 5).map((repo, i) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/${repo._id}`)}
                  className="glass-card p-4 cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {repo.owner ? `${repo.owner}/` : ""}{repo.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{repo.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          repo.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : repo.status === "analyzing"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {repo.status}
                      </span>
                      <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
                    </div>
                  </div>
                  {repo.techStack && repo.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.techStack.slice(0, 5).map((tech) => (
                        <span key={tech} className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
