// ──────────────────────────────────────────────────────────────
// services/repoService.js — Repository analysis orchestrator
// Coordinates cloning, file extraction, AI analysis, and cleanup
// This is the main service that ties everything together
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
 * Full repository analysis pipeline
 *
 * 1. Clone the GitHub repo locally (shallow clone)
 * 2. Extract file tree, README, and important files
 * 3. Detect tech stack and compute statistics
 * 4. Send data to Gemini AI for comprehensive explanation
 * 5. Generate architecture diagram and API docs
 * 6. Clean up cloned files
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

    // ── Step 4: Generate AI explanation ─────────────────────
    console.log("🤖 Generating AI explanation...");
    const explanation = await generateRepoExplanation({
      tree,
      readme,
      importantFiles,
      techStack,
      stats,
    });

    // ── Step 5: Generate architecture diagram ──────────────
    console.log("📐 Generating architecture diagram...");
    let architectureDiagram = "";
    try {
      architectureDiagram = await generateArchitectureDiagram(explanation, techStack);
    } catch (err) {
      console.warn("⚠️ Architecture diagram generation failed:", err.message);
    }

    // ── Step 6: Generate API documentation ─────────────────
    console.log("📝 Generating API documentation...");
    let apiDocs = "";
    try {
      apiDocs = await generateApiDocs(importantFiles, explanation);
    } catch (err) {
      console.warn("⚠️ API docs generation failed:", err.message);
    }

    console.log(`✅ Analysis complete for ${owner}/${repoName}`);

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
