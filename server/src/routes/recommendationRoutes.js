// ──────────────────────────────────────────────────────────────
// routes/recommendationRoutes.js — AI-powered repo discovery
// Generates and caches personalized repo recommendations
// ──────────────────────────────────────────────────────────────
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Repository from "../models/Repository.js";
import Recommendation from "../models/Recommendation.js";
import { generateRecommendations, generateSimilarRepos } from "../services/recommendationService.js";

const router = express.Router();

const CACHE_HOURS = 24;

/**
 * GET /api/recommendations
 * Get AI-powered repo recommendations for the current user
 */
router.get("/", protect, async (req, res) => {
  try {
    // Check cache first
    const cached = await Recommendation.findOne({
      userId: req.user._id,
      repoId: null,
    });

    if (cached && Date.now() - cached.generatedAt.getTime() < CACHE_HOURS * 60 * 60 * 1000) {
      return res.json({ recommendations: cached.recommendations, cached: true });
    }

    // Get user's analyzed repos
    const repos = await Repository.find({
      userId: req.user._id,
      status: "completed",
    }).select("name techStack stats description explanation");

    if (repos.length === 0) {
      return res.json({
        recommendations: [],
        message: "Analyze some repositories first to get personalized recommendations.",
      });
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(repos);

    // Cache the result
    await Recommendation.findOneAndUpdate(
      { userId: req.user._id, repoId: null },
      {
        userId: req.user._id,
        repoId: null,
        recommendations,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ recommendations, cached: false });
  } catch (error) {
    console.error("❌ Recommendations error:", error.message);
    res.status(500).json({ message: error.message || "Failed to generate recommendations" });
  }
});

/**
 * GET /api/recommendations/:repoId
 * Get repos similar to a specific analyzed repository
 */
router.get("/:repoId", protect, async (req, res) => {
  try {
    const { repoId } = req.params;

    // Check cache
    const cached = await Recommendation.findOne({
      userId: req.user._id,
      repoId,
    });

    if (cached && Date.now() - cached.generatedAt.getTime() < CACHE_HOURS * 60 * 60 * 1000) {
      return res.json({ recommendations: cached.recommendations, cached: true });
    }

    // Get the repo
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Generate similar repos
    const recommendations = await generateSimilarRepos(repo);

    // Cache
    await Recommendation.findOneAndUpdate(
      { userId: req.user._id, repoId },
      {
        userId: req.user._id,
        repoId,
        recommendations,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ recommendations, cached: false });
  } catch (error) {
    console.error("❌ Similar repos error:", error.message);
    res.status(500).json({ message: error.message || "Failed to find similar repos" });
  }
});

export default router;
