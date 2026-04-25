// ──────────────────────────────────────────────────────────────
// services/gitService.js — GitHub repository cloning service
// Handles cloning repos to local filesystem for analysis
// ──────────────────────────────────────────────────────────────
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const REPO_DIR = path.resolve("repos");

// Ensure repos directory exists
if (!fs.existsSync(REPO_DIR)) {
  fs.mkdirSync(REPO_DIR, { recursive: true });
}

/**
 * Clone a GitHub repository to a local temporary directory
 * @param {string} url - GitHub repository URL
 * @returns {Promise<{repoPath: string, repoName: string, owner: string}>}
 */
export const cloneRepository = async (url) => {
  // Validate GitHub URL
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  if (!githubRegex.test(url.replace(/\.git$/, ""))) {
    throw new Error("Invalid GitHub repository URL");
  }

  // Extract repo name and owner from URL
  const cleanUrl = url.replace(/\.git$/, "").replace(/\/$/, "");
  const parts = cleanUrl.split("/");
  const repoName = parts[parts.length - 1];
  const owner = parts[parts.length - 2];

  // Create unique directory for this clone
  const cloneId = `${Date.now()}_${uuidv4().slice(0, 8)}`;
  const repoPath = path.join(REPO_DIR, cloneId);

  const git = simpleGit();

  try {
    // Shallow clone (depth=1) for speed — we only need latest files
    await git.clone(url, repoPath, ["--depth", "1"]);
    console.log(`📥 Cloned ${owner}/${repoName} → ${cloneId}`);
    return { repoPath, repoName, owner };
  } catch (error) {
    // Clean up partial clone on failure
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
};