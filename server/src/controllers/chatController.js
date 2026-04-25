// ──────────────────────────────────────────────────────────────
// controllers/chatController.js — Chat Q&A handlers
// Manages chat sessions and AI-powered Q&A about repositories
// ──────────────────────────────────────────────────────────────
import ChatSession from "../models/ChatSession.js";
import Repository from "../models/Repository.js";
import { askQuestion } from "../services/aiService.js";

/**
 * POST /api/chat/message
 * Send a message and get an AI response about a repository
 */
export const sendMessage = async (req, res) => {
  try {
    const { repoId, question } = req.body;

    if (!repoId || !question) {
      return res.status(400).json({
        message: "Repository ID and question are required",
      });
    }

    // Find the repository
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Verify access
    if (repo.userId.toString() !== req.user._id.toString() && !repo.isPublic) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find or create chat session for this user + repo
    let chatSession = await ChatSession.findOne({
      repoId,
      userId: req.user._id,
    });

    if (!chatSession) {
      chatSession = await ChatSession.create({
        repoId,
        userId: req.user._id,
        title: `Chat about ${repo.name}`,
        messages: [],
      });
    }

    // Add user message
    chatSession.messages.push({
      role: "user",
      content: question,
    });

    // Generate AI response with conversation history
    const answer = await askQuestion(
      question,
      repo.explanation,
      chatSession.messages.slice(-10) // Last 10 messages for context
    );

    // Add AI response
    chatSession.messages.push({
      role: "assistant",
      content: answer,
    });

    await chatSession.save();

    res.json({
      answer,
      chatId: chatSession._id,
      messageCount: chatSession.messages.length,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: error.message || "Failed to process question" });
  }
};

/**
 * GET /api/chat/:repoId
 * Get chat history for a specific repository
 */
export const getChatHistory = async (req, res) => {
  try {
    const { repoId } = req.params;

    const chatSession = await ChatSession.findOne({
      repoId,
      userId: req.user._id,
    });

    if (!chatSession) {
      return res.json({ messages: [] });
    }

    res.json({
      chatId: chatSession._id,
      title: chatSession.title,
      messages: chatSession.messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

/**
 * DELETE /api/chat/:repoId
 * Clear chat history for a specific repository
 */
export const clearChat = async (req, res) => {
  try {
    const { repoId } = req.params;

    await ChatSession.findOneAndDelete({
      repoId,
      userId: req.user._id,
    });

    res.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ message: "Failed to clear chat history" });
  }
};