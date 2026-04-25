// ──────────────────────────────────────────────────────────────
// services/repoService.js — Repository analysis orchestrator
// Coordinates cloning, file extraction, AI analysis, and cleanup
// Uses PARALLEL AI calls for speed optimization
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
  generateRepoExplanation,
  generateArchitectureDiagram,
  generateApiDocs,
  analyzeComplexity,
} from "./aiService.js";
import { cleanupRepo } from "../utils/cleanup.js";

/**
 * Full repository analysis pipeline (optimized with parallel AI calls)
 *
 * 1. Clone the GitHub repo locally (shallow clone)
 * 2. Extract file tree, README, and important files
 * 3. Detect tech stack and compute statistics
 * 4. Run ALL AI calls in PARALLEL for speed
 * 5. Clean up cloned files
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

    // ── Step 4: Run ALL AI calls in PARALLEL ────────────────
    // This is 3x faster than sequential calls!
    console.log("🤖 Running AI analysis (parallel)...");
    const startTime = Date.now();

    const [explanation, architectureDiagram, apiDocs] = await Promise.all([
      // Main explanation (required)
      generateRepoExplanation({ tree, readme, importantFiles, techStack, stats }),

      // Architecture diagram (optional — don't block on failure)
      generateArchitectureDiagram(
        // Pass a quick summary instead of waiting for explanation
        `Tech: ${techStack?.join(", ")}. Files: ${stats?.totalFiles}. ` +
        `Structure: ${JSON.stringify(tree?.slice?.(0, 15) || [])}.` +
        `README: ${(readme || "").slice(0, 2000)}`,
        techStack
      ).catch((err) => {
        console.warn("⚠️ Architecture diagram failed:", err.message);
        return "";
      }),

      // API docs (optional — don't block on failure)
      generateApiDocs(importantFiles, 
        `Tech: ${techStack?.join(", ")}. README: ${(readme || "").slice(0, 1500)}`
      ).catch((err) => {
        console.warn("⚠️ API docs failed:", err.message);
        return "";
      }),
    ]);

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
