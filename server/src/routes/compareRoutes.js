// ──────────────────────────────────────────────────────────────
// routes/compareRoutes.js — Repository comparison routes
// Side-by-side comparison of two analyzed repositories
// ──────────────────────────────────────────────────────────────
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { compareRepos } from "../controllers/compareController.js";

const router = express.Router();

/**
 * GET /api/compare/:id1/:id2
 * Compare two repositories side-by-side with AI analysis
 */
router.get("/:id1/:id2", protect, compareRepos);

export default router;
