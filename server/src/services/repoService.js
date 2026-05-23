// ──────────────────────────────────────────────────────────────
// services/repoService.js — Repository analysis orchestrator
// Coordinates cloning, file extraction, GitHub API, AI analysis
// Uses SINGLE combined AI call for quota optimization
// ──────────────────────────────────────────────────────────────
import { cloneRepository } from "./gitService.js";
import {
  getFileTree,
  getReadme,
  getImportantFiles,
  getRepoStats,
  detectTechStack,
} from "./fileService.js";
import {
  generateFullAnalysis,
  analyzeComplexity,
} from "./aiService.js";
import { fetchAllGitHubData } from "./githubApiService.js";
import { cleanupRepo } from "../utils/cleanup.js";

/**
 * Full repository analysis pipeline (optimized with single AI call)
 *
 * 1. Clone the GitHub repo locally (shallow clone)
 * 2. Extract file tree, README, and important files
 * 3. Fetch GitHub API data (stars, forks, contributors, etc.)
 * 4. Detect tech stack and compute statistics
 * 5. Run ONE combined AI call (explanation + diagram + API docs)
 * 6. Clean up cloned files
 *
 * Optimization: Uses 1 API call instead of 3, saving ~66% quota.
 * GitHub API calls run in parallel with file analysis.
 *
 * @param {string} url - GitHub repository URL
 * @returns {Promise<Object>} Complete analysis results
 */
export const analyzeRepository = async (url) => {
  let repoPath = null;

  try {
    // ── Step 1: Clone repository ────────────────────────────
    console.log(`🔍 Starting analysis for: ${url}`);
    const { repoPath: clonedPath, repoName, owner } = await cloneRepository(url);
    repoPath = clonedPath;

    // ── Step 2: File extraction + GitHub API (in parallel) ──
    console.log("📂 Extracting files & fetching GitHub data...");
    const [fileData, githubData] = await Promise.all([
      // File analysis (synchronous but wrapped for Promise.all)
      Promise.resolve().then(() => {
        const tree = getFileTree(repoPath);
        const readme = getReadme(repoPath);
        const importantFiles = getImportantFiles(repoPath);
        const stats = getRepoStats(repoPath);
        const techStack = detectTechStack(repoPath);
        return { tree, readme, importantFiles, stats, techStack };
      }),
      // GitHub API calls (parallel network requests)
      fetchAllGitHubData(owner, repoName).catch((err) => {
        console.warn("⚠️ GitHub API fetch failed, continuing:", err.message);
        return { githubMeta: {}, contributors: [], commitHistory: [], githubLanguages: {}, activity: [] };
      }),
    ]);

    const { tree, readme, importantFiles, stats, techStack } = fileData;
    const { githubMeta, contributors, commitHistory, githubLanguages, activity } = githubData;

    // ── Step 3: Compute complexity ──────────────────────────
    console.log("📊 Computing repository statistics...");
    const complexity = analyzeComplexity(stats);

    // ── Step 4: Single combined AI call ─────────────────────
    // One API call generates explanation + diagram + API docs
    // Saves 66% quota (1 call instead of 3)
    console.log("🤖 Running AI analysis (single optimized call)...");
    const startTime = Date.now();

    const { explanation, architectureDiagram, apiDocs } = await generateFullAnalysis({
      tree,
      readme,
      importantFiles,
      techStack,
      stats,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ AI analysis complete in ${elapsed}s for ${owner}/${repoName}`);

    return {
      name: repoName,
      owner,
      description: githubMeta?.description || readme.slice(0, 200),
      explanation,
      fileTree: tree,
      techStack,
      stats: {
        ...stats,
        complexity,
      },
      architectureDiagram,
      apiDocs,
      // ── New GitHub API data ─────────────────────────────
      githubMeta,
      contributors,
      commitHistory,
      githubLanguages,
      activity,
    };
  } finally {
    // ── Always cleanup cloned repo ──────────────────────────
    if (repoPath) {
      cleanupRepo(repoPath);
    }
  }
};
