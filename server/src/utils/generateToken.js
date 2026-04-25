// ──────────────────────────────────────────────────────────────
// utils/generateToken.js — JWT token generation utility
// Creates signed tokens with user ID and configurable expiry
// ──────────────────────────────────────────────────────────────
import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for authenticated users
 * @param {string} id - User's MongoDB ObjectId
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};