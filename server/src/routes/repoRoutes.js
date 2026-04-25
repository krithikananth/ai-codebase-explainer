// ──────────────────────────────────────────────────────────────
// routes/repoRoutes.js — Repository analysis routes
// Handles analyze, list, get, delete, bookmark, share
// ──────────────────────────────────────────────────────────────
import express from "express";
import {
  analyzeRepo,
  getUserRepos,
  getRepoById,
  deleteRepo,
  toggleBookmark,
  toggleShare,
  getSharedRepo,
} from "../controllers/repoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route — shared repo reports
router.get("/shared/:id", getSharedRepo);

// Protected routes
router.post("/analyze", protect, analyzeRepo);
router.get("/", protect, getUserRepos);
router.get("/:id", protect, getRepoById);
router.delete("/:id", protect, deleteRepo);
router.post("/:id/bookmark", protect, toggleBookmark);
router.post("/:id/share", protect, toggleShare);

export default router;