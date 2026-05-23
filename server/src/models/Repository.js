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
    // ── GitHub API metadata ──────────────────────────────────
    githubMeta: {
      stars: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      watchers: { type: Number, default: 0 },
      openIssues: { type: Number, default: 0 },
      license: { type: String, default: "" },
      defaultBranch: { type: String, default: "main" },
      repoCreatedAt: Date,
      repoUpdatedAt: Date,
      topics: { type: [String], default: [] },
    },
    contributors: [
      {
        username: String,
        avatarUrl: String,
        contributions: Number,
        profileUrl: String,
      },
    ],
    commitHistory: [
      {
        sha: String,
        message: String,
        author: String,
        date: Date,
      },
    ],
    githubLanguages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    activity: [
      {
        type: { type: String },
        actor: String,
        createdAt: Date,
        details: String,
      },
    ],
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