// ──────────────────────────────────────────────────────────────
// routes/activityRoutes.js — Real-time activity monitoring routes
// GET /:repoId for polling, GET /:repoId/stream for SSE
// ──────────────────────────────────────────────────────────────
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Repository from "../models/Repository.js";
import { getRepoActivity } from "../services/activityService.js";

const router = express.Router();

/**
 * GET /api/activity/:repoId
 * Fetch latest activity events for a repository
 */
router.get("/:repoId", protect, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }
    if (repo.userId.toString() !== req.user._id.toString() && !repo.isPublic) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!repo.owner || !repo.name) {
      return res.status(400).json({ message: "Repository missing owner/name" });
    }

    const events = await getRepoActivity(repo.owner, repo.name);
    res.json({ events, repoName: `${repo.owner}/${repo.name}` });
  } catch (error) {
    console.error("❌ Activity fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

/**
 * GET /api/activity/:repoId/stream
 * Server-Sent Events endpoint for real-time activity updates
 * Polls GitHub every 60s and pushes new events to the client
 */
router.get("/:repoId/stream", protect, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo || !repo.owner || !repo.name) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Send initial data
    const initialEvents = await getRepoActivity(repo.owner, repo.name);
    res.write(`data: ${JSON.stringify({ events: initialEvents })}\n\n`);

    // Poll every 60s
    const interval = setInterval(async () => {
      try {
        const events = await getRepoActivity(repo.owner, repo.name);
        res.write(`data: ${JSON.stringify({ events })}\n\n`);
      } catch {
        // Silently continue on poll errors
      }
    }, 60000);

    // Cleanup on client disconnect
    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    console.error("❌ SSE stream error:", error.message);
    res.status(500).json({ message: "Failed to start activity stream" });
  }
});

export default router;
