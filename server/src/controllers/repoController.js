// ──────────────────────────────────────────────────────────────
// controllers/repoController.js — Repository analysis handlers
// Manages repo analysis, retrieval, deletion, bookmarking,
// and public sharing of analysis reports
// ──────────────────────────────────────────────────────────────
import { analyzeRepository } from "../services/repoService.js";
import Repository from "../models/Repository.js";

/**
 * POST /api/repos/analyze
 * Analyze a GitHub repository — clones, extracts, and AI-explains
 */
export const analyzeRepo = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "GitHub URL is required" });
    }

    // Validate it's a GitHub URL
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(url.replace(/\.git$/, ""))) {
      return res.status(400).json({ message: "Please provide a valid GitHub repository URL" });
    }

    // Check if user already analyzed this repo
    const existing = await Repository.findOne({
      userId: req.user._id,
      url: url.replace(/\.git$/, "").replace(/\/$/, ""),
    });

    if (existing && existing.status === "completed") {
      return res.json(existing);
    }

    // Delete previous failed/analyzing entries so user can retry
    if (existing && (existing.status === "failed" || existing.status === "analyzing")) {
      await Repository.findByIdAndDelete(existing._id);
    }

    // Create a pending entry
    const pendingRepo = await Repository.create({
      userId: req.user._id,
      url: url.replace(/\.git$/, "").replace(/\/$/, ""),
      name: url.split("/").pop().replace(/\.git$/, ""),
      status: "analyzing",
    });

    try {
      // Run the full analysis pipeline
      const result = await analyzeRepository(url);

      // Update the repository with results
      const updatedRepo = await Repository.findByIdAndUpdate(
        pendingRepo._id,
        {
          ...result,
          status: "completed",
        },
        { new: true }
      );

      res.json(updatedRepo);
    } catch (analysisError) {
      // Mark as failed if analysis errors
      await Repository.findByIdAndUpdate(pendingRepo._id, {
        status: "failed",
        explanation: `Analysis failed: ${analysisError.message}`,
      });

      throw analysisError;
    }
  } catch (error) {
    console.error("Repo analysis error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze repository" });
  }
};

/**
 * GET /api/repos
 * Get all repositories analyzed by the current user
 */
export const getUserRepos = async (req, res) => {
  try {
    const repos = await Repository.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-explanation -fileTree -apiDocs -architectureDiagram"); // Lighter payload

    res.json(repos);
  } catch (error) {
    console.error("Get repos error:", error);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
};

/**
 * GET /api/repos/:id
 * Get a single repository with full analysis details
 */
export const getRepoById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Allow access if user owns it or it's public
    if (repo.userId.toString() !== req.user._id.toString() && !repo.isPublic) {
      return res.status(403).json({ message: "Not authorized to view this repository" });
    }

    res.json(repo);
  } catch (error) {
    console.error("Get repo error:", error);
    res.status(500).json({ message: "Failed to fetch repository" });
  }
};

/**
 * DELETE /api/repos/:id
 * Delete a repository analysis
 */
export const deleteRepo = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Repository.findByIdAndDelete(req.params.id);
    res.json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("Delete repo error:", error);
    res.status(500).json({ message: "Failed to delete repository" });
  }
};

/**
 * POST /api/repos/:id/bookmark
 * Toggle bookmark on a repository
 */
export const toggleBookmark = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const userId = req.user._id;
    const isBookmarked = repo.bookmarkedBy.includes(userId);

    if (isBookmarked) {
      repo.bookmarkedBy = repo.bookmarkedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      repo.bookmarkedBy.push(userId);
    }

    await repo.save();

    res.json({
      bookmarked: !isBookmarked,
      message: isBookmarked ? "Bookmark removed" : "Bookmark added",
    });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
};

/**
 * POST /api/repos/:id/share
 * Toggle public sharing of a repository report
 */
export const toggleShare = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    repo.isPublic = !repo.isPublic;
    await repo.save();

    res.json({
      isPublic: repo.isPublic,
      message: repo.isPublic ? "Report is now public" : "Report is now private",
      shareUrl: repo.isPublic ? `/shared/${repo._id}` : null,
    });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ message: "Failed to toggle sharing" });
  }
};

/**
 * GET /api/repos/shared/:id
 * Get a public repository report (no auth required)
 */
export const getSharedRepo = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo || !repo.isPublic) {
      return res.status(404).json({ message: "Report not found or not public" });
    }

    res.json(repo);
  } catch (error) {
    console.error("Get shared repo error:", error);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};
