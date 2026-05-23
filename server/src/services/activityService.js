// ──────────────────────────────────────────────────────────────
// services/activityService.js — Real-time activity monitoring
// Wraps GitHub events API with in-memory caching (60s TTL)
// and formats events for the frontend activity feed
// ──────────────────────────────────────────────────────────────
import { fetchRepoActivity } from "./githubApiService.js";

// In-memory cache: key → { data, timestamp }
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Get repo activity with caching
 * @param {string} owner - Repo owner
 * @param {string} repoName - Repo name
 * @returns {Promise<Array>} Formatted activity events
 */
export const getRepoActivity = async (owner, repoName) => {
  const cacheKey = `${owner}/${repoName}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const events = await fetchRepoActivity(owner, repoName);
  const formatted = events.map(formatActivityEvent);

  cache.set(cacheKey, { data: formatted, timestamp: Date.now() });

  // Cleanup old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [key, val] of cache) {
      if (now - val.timestamp > CACHE_TTL * 5) cache.delete(key);
    }
  }

  return formatted;
};

/**
 * Format a raw activity event for display
 */
export const formatActivityEvent = (event) => {
  const iconMap = {
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

  return {
    type: event.type,
    actor: event.actor,
    createdAt: event.createdAt,
    details: event.details,
    icon: iconMap[event.type] || "📌",
  };
};
