// ──────────────────────────────────────────────────────────────
// controllers/compareController.js — Repository comparison
// Fetches two repos and generates AI-powered comparison
// ──────────────────────────────────────────────────────────────
import Repository from "../models/Repository.js";
import { generateComparison } from "../services/aiService.js";

/**
 * GET /api/compare/:id1/:id2
 * Compare two analyzed repositories side-by-side
 */
export const compareRepos = async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    if (id1 === id2) {
      return res.status(400).json({ message: "Cannot compare a repository with itself" });
    }

    // Fetch both repos
    const [repo1, repo2] = await Promise.all([
      Repository.findById(id1),
      Repository.findById(id2),
    ]);

    if (!repo1 || !repo2) {
      return res.status(404).json({ message: "One or both repositories not found" });
    }

    // Verify access
    const userId = req.user._id.toString();
    const canAccess1 = repo1.userId.toString() === userId || repo1.isPublic;
    const canAccess2 = repo2.userId.toString() === userId || repo2.isPublic;

    if (!canAccess1 || !canAccess2) {
      return res.status(403).json({ message: "Not authorized to compare these repositories" });
    }

    // Generate AI comparison
    let aiComparison = "";
    try {
      aiComparison = await generateComparison(repo1, repo2);
    } catch (err) {
      console.warn("⚠️ AI comparison failed, returning data without AI summary:", err.message);
      aiComparison = "AI comparison unavailable. Please compare the metrics below.";
    }

    res.json({
      repo1: {
        _id: repo1._id,
        name: repo1.name,
        owner: repo1.owner,
        url: repo1.url,
        techStack: repo1.techStack,
        stats: repo1.stats,
        githubMeta: repo1.githubMeta,
        contributors: repo1.contributors,
        githubLanguages: repo1.githubLanguages,
      },
      repo2: {
        _id: repo2._id,
        name: repo2.name,
        owner: repo2.owner,
        url: repo2.url,
        techStack: repo2.techStack,
        stats: repo2.stats,
        githubMeta: repo2.githubMeta,
        contributors: repo2.contributors,
        githubLanguages: repo2.githubLanguages,
      },
      aiComparison,
    });
  } catch (error) {
    console.error("❌ Compare error:", error.message);
    res.status(500).json({ message: "Failed to compare repositories" });
  }
};
