// ──────────────────────────────────────────────────────────────
// routes/chatRoutes.js — Chat Q&A routes
// Handles message sending, history retrieval, and clearing
// ──────────────────────────────────────────────────────────────
import express from "express";
import { sendMessage, getChatHistory, clearChat } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All chat routes require authentication
router.post("/message", protect, sendMessage);
router.get("/:repoId", protect, getChatHistory);
router.delete("/:repoId", protect, clearChat);

export default router;