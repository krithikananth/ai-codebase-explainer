// ──────────────────────────────────────────────────────────────
// services/repoService.js — Repository analysis orchestrator
// Coordinates cloning, file extraction, AI analysis, and cleanup
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
import { cleanupRepo } from "../utils/cleanup.js";

/**
 * Full repository analysis pipeline (optimized with single AI call)
 *
 * 1. Clone the GitHub repo locally (shallow clone)
 * 2. Extract file tree, README, and important files
 * 3. Detect tech stack and compute statistics
 * 4. Run ONE combined AI call (explanation + diagram + API docs)
 * 5. Clean up cloned files
 *
 * Optimization: Uses 1 API call instead of 3, saving ~66% quota.
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

    // ── Step 2: Extract file data ───────────────────────────
    console.log("📂 Extracting file tree and content...");
    const tree = getFileTree(repoPath);
    const readme = getReadme(repoPath);
    const importantFiles = getImportantFiles(repoPath);

    // ── Step 3: Compute statistics and detect tech stack ────
    console.log("📊 Computing repository statistics...");
    const stats = getRepoStats(repoPath);
    const techStack = detectTechStack(repoPath);
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
      description: readme.slice(0, 200),
      explanation,
      fileTree: tree,
      techStack,
      stats: {
        ...stats,
        complexity,
      },
      architectureDiagram,
      apiDocs,
    };
  } finally {
    // ── Always cleanup cloned repo ──────────────────────────
    if (repoPath) {
      cleanupRepo(repoPath);
    }
  }
};
