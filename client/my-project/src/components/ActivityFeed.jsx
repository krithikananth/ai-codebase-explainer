// ──────────────────────────────────────────────────────────────
// components/ActivityFeed.jsx — Real-time GitHub activity timeline
// Displays recent repo events with polling for live updates
// ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Skeleton } from "./Loader";

const EVENT_ICONS = {
  push: "🔨",
  pull_request: "🔀",
  issue: "🐛",
  create: "🏷️",
  release: "📦",
  star: "⭐",
  fork: "🍴",
  comment: "💬",
  review: "👀",
  delete: "🗑️",
};

const EVENT_COLORS = {
  push: "text-emerald-400",
  pull_request: "text-purple-400",
  issue: "text-amber-400",
  create: "text-cyan-400",
  release: "text-indigo-400",
  star: "text-yellow-400",
  fork: "text-blue-400",
  comment: "text-gray-400",
  review: "text-pink-400",
  delete: "text-red-400",
};

/**
 * Get human-readable relative time string
 */
const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function ActivityFeed({ repoId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const pollRef = useRef(null);

  // Fetch initial data and start polling
  useEffect(() => {
    if (!repoId) return;

    const fetchActivity = async () => {
      try {
        const res = await api.get(`/activity/${repoId}`);
        setEvents(res.data.events || []);
        setIsLive(true);
      } catch (err) {
        console.error("Activity fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();

    // Poll every 30s for updates
    pollRef.current = setInterval(fetchActivity, 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [repoId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">📡</span>
        <h3 className="text-lg font-semibold text-gray-300">No recent activity</h3>
        <p className="text-sm text-gray-500 mt-2">
          This repository hasn't had any public events recently
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          Live — updates every 30s
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-800" />

        <div className="space-y-1">
          {events.map((event, i) => (
            <div
              key={`${event.type}-${event.actor}-${i}`}
              className="relative flex items-start gap-4 pl-10 py-3 rounded-xl
                hover:bg-gray-800/30 transition-all animate-fade-in group"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {/* Event icon */}
              <div
                className="absolute left-2.5 w-5 h-5 rounded-full bg-gray-900 border border-gray-700
                  flex items-center justify-center text-xs z-10 group-hover:border-indigo-500/50 transition-colors"
              >
                {EVENT_ICONS[event.type] || "📌"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${EVENT_COLORS[event.type] || "text-gray-300"}`}>
                    {event.type?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">{timeAgo(event.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5 truncate">{event.details}</p>
                <p className="text-xs text-gray-600 mt-0.5">by {event.actor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
