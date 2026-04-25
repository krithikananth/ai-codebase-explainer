// ──────────────────────────────────────────────────────────────
// models/Repository.js — Repository schema for analyzed repos
// Stores full analysis results including AI explanation,
// file tree, tech stack, stats, and sharing/bookmark state
// ──────────────────────────────────────────────────────────────
import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, "GitHub URL is required"],
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    // AI-generated explanation of the entire codebase
    explanation: {
      type: String,
      default: "",
    },
    // Full file/folder tree structure (JSON)
    fileTree: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // Detected technologies (e.g. ["React", "Node.js", "MongoDB"])
    techStack: {
      type: [String],
      default: [],
    },
    // Repository statistics
    stats: {
      totalFiles: { type: Number, default: 0 },
      totalFolders: { type: Number, default: 0 },
      languages: { type: mongoose.Schema.Types.Mixed, default: {} },
      complexity: { type: String, default: "unknown" }, // low, medium, high
      linesOfCode: { type: Number, default: 0 },
    },
    // Generated API documentation (markdown)
    apiDocs: {
      type: String,
      default: "",
    },
    // Architecture diagram description (mermaid syntax)
    architectureDiagram: {
      type: String,
      default: "",
    },
    // Sharing & bookmarking
    isPublic: {
      type: Boolean,
      default: false,
    },
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Analysis status tracking
    status: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
repositorySchema.index({ userId: 1, createdAt: -1 });
repositorySchema.index({ isPublic: 1 });

export default mongoose.model("Repository", repositorySchema);