// ──────────────────────────────────────────────────────────────
// utils/cleanup.js — Temporary file cleanup utility
// Removes cloned repo directories after analysis is complete
// Uses retry logic for Windows EPERM issues with .git files
// ──────────────────────────────────────────────────────────────
import fs from "fs";
import path from "path";

/**
 * Wait helper
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Remove a cloned repository directory with retries
 * Windows often locks .git files, so we retry a few times
 * @param {string} repoPath - Path to the cloned repo
 */
export const cleanupRepo = async (repoPath) => {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
        console.log(`🧹 Cleaned up: ${repoPath}`);
        return;
      }
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`⚠️ Cleanup attempt ${attempt} failed, retrying in 2s...`);
        await sleep(2000);
      } else {
        // Last attempt failed — log but don't crash
        console.error(`⚠️ Cleanup failed for ${repoPath}: ${error.message}`);
        console.error(`   You may need to manually delete: ${repoPath}`);
      }
    }
  }
};

/**
 * Clean all repos older than specified hours
 * @param {number} maxAgeHours - Maximum age in hours before cleanup
 */
export const cleanupOldRepos = async (maxAgeHours = 24) => {
  const reposDir = path.resolve("repos");
  if (!fs.existsSync(reposDir)) return;

  const now = Date.now();
  const entries = fs.readdirSync(reposDir);

  for (const entry of entries) {
    const fullPath = path.join(reposDir, entry);
    try {
      const stat = fs.statSync(fullPath);
      const ageHours = (now - stat.mtimeMs) / (1000 * 60 * 60);

      if (ageHours > maxAgeHours) {
        fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
        console.log(`🧹 Removed old repo: ${entry}`);
      }
    } catch {
      // Skip entries we can't remove
    }
  }
};
