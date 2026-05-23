// ──────────────────────────────────────────────────────────────
// models/User.js — User schema for authentication
// Stores user credentials and profile information
// ──────────────────────────────────────────────────────────────
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [250, "Bio cannot exceed 250 characters"],
    },
    githubUsername: {
      type: String,
      default: "",
      trim: true,
    },
    preferences: {
      theme: { type: String, default: "dark" },
      emailNotifications: { type: Boolean, default: true },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Never include password in JSON responses
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

export default mongoose.model("User", userSchema);