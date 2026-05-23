// ──────────────────────────────────────────────────────────────
// models/Recommendation.js — Cached AI recommendations
// Stores generated repo recommendations per user or per repo
// ──────────────────────────────────────────────────────────────
import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    recommendations: [
      {
        name: String,
        url: String,
        description: String,
        reason: String,
        techStack: [String],
        stars: Number,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding user's cached recommendations
recommendationSchema.index({ userId: 1, repoId: 1 });

export default mongoose.model("Recommendation", recommendationSchema);
