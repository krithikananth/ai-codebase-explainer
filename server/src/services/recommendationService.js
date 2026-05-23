// ──────────────────────────────────────────────────────────────
// services/recommendationService.js — AI-powered repo discovery
// Uses Gemini to recommend GitHub repos based on user's profile
// ──────────────────────────────────────────────────────────────
import { getModel, rotateKey, getKeyCount } from "../config/gemini.js";

const MAX_CONTEXT = 3000;
const truncate = (text, maxLen) => {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen) + "... [truncated]";
};

/**
 * Retry wrapper with key rotation (reuse pattern from aiService)
 */
const callWithRetry = async (prompt) => {
  const totalKeys = getKeyCount();
  let keysTried = 0;

  while (keysTried < totalKeys) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
      if (isRateLimit) {
        keysTried++;
        const hasMore = rotateKey();
        if (hasMore && keysTried < totalKeys) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        throw new Error("All API keys exhausted for recommendations.");
      }
      throw error;
    }
  }
  throw new Error("AI recommendation failed.");
};

/**
 * Parse AI response into structured recommendations
 */
const parseRecommendations = (text) => {
  const recs = [];
  // Try to parse JSON array if the AI returned one
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed.slice(0, 5);
    }
  } catch {
    // Fall through to manual parsing
  }

  // Manual parsing: look for numbered items
  const blocks = text.split(/\d+\.\s+/).filter(Boolean);
  for (const block of blocks.slice(0, 5)) {
    const nameMatch = block.match(/\*\*([^*]+)\*\*/);
    const urlMatch = block.match(/(https?:\/\/github\.com\/[\w.-]+\/[\w.-]+)/);
    const name = nameMatch ? nameMatch[1] : block.split("\n")[0].trim().slice(0, 60);
    recs.push({
      name: name.replace(/[[\]]/g, ""),
      url: urlMatch ? urlMatch[1] : `https://github.com/search?q=${encodeURIComponent(name)}`,
      description: block.split("\n").slice(1, 3).join(" ").trim().slice(0, 200) || "A recommended repository",
      reason: block.includes("because") ? block.split("because")[1]?.trim().slice(0, 150) || "" : "",
      techStack: [],
      stars: 0,
    });
  }

  return recs;
};

/**
 * Generate AI-powered recommendations based on user's analyzed repos
 * @param {Array} analyzedRepos - User's repos with techStack, languages, etc.
 * @returns {Promise<Array>} Recommended repos
 */
export const generateRecommendations = async (analyzedRepos) => {
  const profile = analyzedRepos.map((r) => ({
    name: r.name,
    tech: r.techStack?.slice(0, 5) || [],
    languages: Object.keys(r.stats?.languages || {}).slice(0, 3),
  }));

  const prompt = `You are a developer tool recommending GitHub repositories.

Based on this user's analysis history, recommend 5 GitHub repositories they would find useful or interesting.

User's analyzed repositories:
${truncate(JSON.stringify(profile, null, 2), MAX_CONTEXT)}

Return EXACTLY a JSON array with 5 objects, each having:
- "name": "owner/repo-name"
- "url": "https://github.com/owner/repo"
- "description": "Brief description"
- "reason": "Why this matches the user's interests"
- "techStack": ["Tech1", "Tech2"]
- "stars": estimated star count (number)

Focus on: complementary tools, similar frameworks, popular alternatives, learning resources.
Return ONLY the JSON array, no markdown fences.`;

  const response = await callWithRetry(prompt);
  return parseRecommendations(response);
};

/**
 * Generate repos similar to a specific analyzed repo
 * @param {Object} repo - Single analyzed repository
 * @returns {Promise<Array>} Similar repos
 */
export const generateSimilarRepos = async (repo) => {
  const prompt = `Recommend 5 GitHub repositories similar to this project:

Name: ${repo.name}
Tech Stack: ${repo.techStack?.join(", ") || "Unknown"}
Languages: ${Object.keys(repo.stats?.languages || {}).join(", ") || "Unknown"}
Description: ${truncate(repo.description || repo.explanation?.slice(0, 200) || "", 300)}

Return EXACTLY a JSON array with 5 objects, each having:
- "name": "owner/repo-name"
- "url": "https://github.com/owner/repo"
- "description": "Brief description"
- "reason": "Why this is similar"
- "techStack": ["Tech1", "Tech2"]
- "stars": estimated star count (number)

Focus on: similar purpose, same tech stack, alternative approaches, related tools.
Return ONLY the JSON array, no markdown fences.`;

  const response = await callWithRetry(prompt);
  return parseRecommendations(response);
};
