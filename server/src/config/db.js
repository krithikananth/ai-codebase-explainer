// ──────────────────────────────────────────────────────────────
// config/db.js — MongoDB connection using Mongoose
// Handles connection events and graceful shutdown
// ──────────────────────────────────────────────────────────────
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 — fixes Windows DNS SRV lookup issues
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners for production debugging
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};