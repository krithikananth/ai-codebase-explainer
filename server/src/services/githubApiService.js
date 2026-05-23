// ──────────────────────────────────────────────────────────────
// services/githubApiService.js — GitHub REST API integration
// Fetches repository metadata, contributors, commit history,
// languages, and activity from GitHub's public API v3
// Supports optional GITHUB_TOKEN for higher rate limits
// ──────────────────────────────────────────────────────────────
import axios from "axios";

const GITHUB_API = "https://api.github.com";

/**
 * Build headers for GitHub API requests
 * Uses GITHUB_TOKEN if available (5000 req/hr vs 60 req/hr)
 */
const getHeaders = () => {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeLens-AI/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

/**
 * Safe API call wrapper — returns default on failure
 */
const safeCall = async (url, defaultValue = null) => {
  try {
    const res = await axios.get(url, { headers: getHeaders(), timeout: 10000 });
    return res.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 403) {
      console.warn("⚠️ GitHub API rate limit hit. Consider adding GITHUB_TOKEN.");
    } else {
      console.warn(`⚠️ GitHub API call failed (${status}): ${url}`);
    }
    return defaultValue;
  }
};

/**
 * Fetch repository metadata (stars, forks, watchers, etc.)
 */
export const fetchRepoMetadata = async (owner, repoName) => {
  const data = await safeCall(`${GITHUB_API}/repos/${owner}/${repoName}`);
  if (!data) return {};

  return {
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    watchers: data.subscribers_count || 0,
    openIssues: data.open_issues_count || 0,
    description: data.description || "",
    license: data.license?.name || "",
    defaultBranch: data.default_branch || "main",
    repoCreatedAt: data.created_at ? new Date(data.created_at) : null,
    repoUpdatedAt: data.updated_at ? new Date(data.updated_at) : null,
    topics: data.topics || [],
  };
};

/**
 * Fetch top contributors with avatar and commit count
 */
export const fetchContributors = async (owner, repoName) => {
  const data = await safeCall(
    `${GITHUB_API}/repos/${owner}/${repoName}/contributors?per_page=20`,
    []
  );

  return data.map((c) => ({
    username: c.login,
    avatarUrl: c.avatar_url,
    contributions: c.contributions,
    profileUrl: c.html_url,
  }));
};

/**
 * Fetch recent commit history (last 30 commits)
 */
export const fetchCommitHistory = async (owner, repoName) => {
  const data = await safeCall(
    `${GITHUB_API}/repos/${owner}/${repoName}/commits?per_page=30`,
    []
  );

  return data.map((c) => ({
    sha: c.sha?.slice(0, 7) || "",
    message: (c.commit?.message || "").split("\n")[0].slice(0, 120),
    author: c.commit?.author?.name || c.author?.login || "Unknown",
    date: c.commit?.author?.date ? new Date(c.commit.author.date) : new Date(),
  }));
};

/**
 * Fetch language breakdown in bytes (more accurate than file counting)
 */
export const fetchGitHubLanguages = async (owner, repoName) => {
  const data = await safeCall(
    `${GITHUB_API}/repos/${owner}/${repoName}/languages`,
    {}
  );
  return data;
};

/**
 * Fetch recent activity events
 */
export const fetchRepoActivity = async (owner, repoName) => {
  const data = await safeCall(
    `${GITHUB_API}/repos/${owner}/${repoName}/events?per_page=30`,
    []
  );

  const eventMap = {
    PushEvent: "push",
    PullRequestEvent: "pull_request",
    IssuesEvent: "issue",
    CreateEvent: "create",
    ReleaseEvent: "release",
    WatchEvent: "star",
    ForkEvent: "fork",
    IssueCommentEvent: "comment",
    PullRequestReviewEvent: "review",
    DeleteEvent: "delete",
  };

  return data.map((e) => {
    let details = "";
    const type = eventMap[e.type] || e.type;

    switch (e.type) {
      case "PushEvent":
        details = `Pushed ${e.payload?.commits?.length || 0} commit(s)`;
        break;
      case "PullRequestEvent":
        details = `${e.payload?.action || "updated"} PR: ${e.payload?.pull_request?.title || ""}`;
        break;
      case "IssuesEvent":
        details = `${e.payload?.action || "updated"} issue: ${e.payload?.issue?.title || ""}`;
        break;
      case "CreateEvent":
        details = `Created ${e.payload?.ref_type || "resource"}: ${e.payload?.ref || ""}`;
        break;
      case "ReleaseEvent":
        details = `Released ${e.payload?.release?.tag_name || ""}`;
        break;
      case "WatchEvent":
        details = "Starred the repository";
        break;
      case "ForkEvent":
        details = `Forked to ${e.payload?.forkee?.full_name || ""}`;
        break;
      default:
        details = e.type;
    }

    return {
      type,
      actor: e.actor?.login || "Unknown",
      createdAt: e.created_at ? new Date(e.created_at) : new Date(),
      details,
    };
  });
};

/**
 * Fetch ALL GitHub data in parallel (resilient — partial failures are OK)
 */
export const fetchAllGitHubData = async (owner, repoName) => {
  console.log(`🐙 Fetching GitHub API data for ${owner}/${repoName}...`);

  const [metaResult, contribResult, commitsResult, langsResult, activityResult] =
    await Promise.allSettled([
      fetchRepoMetadata(owner, repoName),
      fetchContributors(owner, repoName),
      fetchCommitHistory(owner, repoName),
      fetchGitHubLanguages(owner, repoName),
      fetchRepoActivity(owner, repoName),
    ]);

  const result = {
    githubMeta: metaResult.status === "fulfilled" ? metaResult.value : {},
    contributors: contribResult.status === "fulfilled" ? contribResult.value : [],
    commitHistory: commitsResult.status === "fulfilled" ? commitsResult.value : [],
    githubLanguages: langsResult.status === "fulfilled" ? langsResult.value : {},
    activity: activityResult.status === "fulfilled" ? activityResult.value : [],
  };

  console.log(
    `✅ GitHub data fetched — ${result.contributors.length} contributors, ${result.commitHistory.length} commits`
  );

  return result;
};
