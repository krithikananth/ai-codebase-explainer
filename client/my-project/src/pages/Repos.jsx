// ──────────────────────────────────────────────────────────────
// pages/Repos.jsx — List of all analyzed repositories
// Grid/list view of user's repos with search and actions
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { Skeleton } from "../components/Loader";

export default function Repos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this repository analysis?")) return;

    try {
      await api.delete(`/repos/${id}`);
      setRepos(repos.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete repo:", err);
    }
  };

  const handleBookmark = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/repos/${id}/bookmark`);
      setRepos(repos.map((r) =>
        r._id === id
          ? { ...r, isBookmarked: res.data.bookmarked }
          : r
      ));
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const filtered = repos.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.url?.toLowerCase().includes(search.toLowerCase()) ||
      r.techStack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">My Repositories</span>
            </h1>
            <p className="text-gray-500 mt-1">{repos.length} repositories analyzed</p>
          </div>

          <button
            onClick={() => navigate("/analyze")}
            className="btn-gradient whitespace-nowrap self-start"
          >
            + New Analysis
          </button>
        </div>

        {/* Search */}
        <input
          id="repo-search"
          type="text"
          className="input-glass max-w-md"
          placeholder="🔍  Search repos by name, URL, or tech..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Repo grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl mb-4 block">{search ? "🔍" : "📭"}</span>
            <h3 className="text-lg font-semibold text-gray-300">
              {search ? "No matching repos" : "No repos yet"}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {search
                ? "Try a different search term"
                : "Analyze your first GitHub repository to get started"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repo, i) => (
              <div
                key={repo._id}
                onClick={() => navigate(`/repo/${repo._id}`)}
                className="glass-card p-5 cursor-pointer group animate-fade-in flex flex-col"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Repo header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      📦
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {repo.name}
                      </h3>
                      {repo.owner && (
                        <p className="text-xs text-gray-500">{repo.owner}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleBookmark(e, repo._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      title="Bookmark"
                    >
                      {repo.bookmarkedBy?.includes(repo.userId) ? "⭐" : "☆"}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, repo._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-sm text-red-400"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`self-start text-xs px-2 py-0.5 rounded-full mb-3 ${
                    repo.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : repo.status === "analyzing"
                        ? "bg-amber-500/20 text-amber-400 animate-pulse"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {repo.status}
                </span>

                {/* Tech stack */}
                {repo.techStack && repo.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {repo.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">
                        {tech}
                      </span>
                    ))}
                    {repo.techStack.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-500">
                        +{repo.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(repo.createdAt).toLocaleDateString()}</span>
                  <span className="group-hover:text-indigo-400 transition-colors">
                    View details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
