// ──────────────────────────────────────────────────────────────
// pages/Recommendations.jsx — AI-powered repository discovery
// Shows personalized repo recommendations based on user's profile
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { Skeleton, ButtonSpinner } from "../components/Loader";

export default function Recommendations() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await api.get("/recommendations");
      setRecs(res.data.recommendations || []);

      if (res.data.message) {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              ✨ <span className="gradient-text">Discover Repositories</span>
            </h1>
            <p className="text-gray-500 mt-1">
              AI-powered recommendations based on your analysis history
            </p>
          </div>
          <button
            onClick={() => fetchRecommendations(true)}
            disabled={refreshing}
            className="btn-gradient whitespace-nowrap self-start flex items-center gap-2"
          >
            {refreshing ? <ButtonSpinner /> : "🔄"} Refresh
          </button>
        </div>

        {/* Error / empty state */}
        {error && !loading && (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold text-gray-300">{error}</h3>
            <p className="text-gray-500 mt-2 text-sm">
              Analyze some repositories first to get personalized recommendations
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="btn-gradient mt-4"
            >
              Analyze a Repository
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

        {/* Recommendations grid */}
        {!loading && recs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((rec, i) => (
              <div
                key={rec.url || i}
                className="glass-card p-5 flex flex-col animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Repo name */}
                <h3 className="text-base font-semibold text-white mb-1 truncate">
                  {rec.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {rec.description || "A recommended repository"}
                </p>

                {/* AI reasoning */}
                {rec.reason && (
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-3">
                    <p className="text-xs text-indigo-300 italic">
                      💡 {rec.reason}
                    </p>
                  </div>
                )}

                {/* Tech stack */}
                {rec.techStack && rec.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rec.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stars */}
                {rec.stars > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    ⭐ {rec.stars.toLocaleString()} stars
                  </p>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center gap-2">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-sm py-2 rounded-xl
                      bg-gray-800 hover:bg-gray-700 text-gray-300
                      transition-colors"
                  >
                    View on GitHub →
                  </a>
                  <button
                    onClick={() => navigate("/analyze", { state: { url: rec.url } })}
                    className="btn-gradient text-sm px-4 py-2"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
