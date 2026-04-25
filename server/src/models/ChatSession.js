// ──────────────────────────────────────────────────────────────
// models/ChatSession.js — Chat session for Q&A about a repo
// Groups messages between user and AI about a specific repo
// ──────────────────────────────────────────────────────────────
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const chatSessionSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for finding user's chats for a specific repo
chatSessionSchema.index({ userId: 1, repoId: 1 });

export default mongoose.model("ChatSession", chatSessionSchema);
