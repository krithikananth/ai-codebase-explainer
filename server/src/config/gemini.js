// ──────────────────────────────────────────────────────────────
// config/gemini.js — Google Generative AI (Gemini) configuration
// Supports multiple API keys with automatic rotation
// When one key hits quota, it rotates to the next key
// ──────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from "@google/generative-ai";

// Support both single key (GEMINI_API_KEY) and multiple keys (GEMINI_API_KEYS)
const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

if (apiKeys.length === 0) {
  throw new Error("No Gemini API keys found. Set GEMINI_API_KEYS or GEMINI_API_KEY in environment variables.");
}

console.log(`🔑 Loaded ${apiKeys.length} Gemini API key(s)`);

// Create a model instance for each API key
const models = apiKeys.map((key) => {
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
});

// Track which key is currently active
let currentKeyIndex = 0;

/**
 * Get the current active model
 */
export const getModel = () => models[currentKeyIndex];

/**
 * Rotate to the next API key (called when quota is hit)
 * Returns true if there's another key to try, false if all exhausted
 */
export const rotateKey = () => {
  const nextIndex = currentKeyIndex + 1;
  if (nextIndex < models.length) {
    currentKeyIndex = nextIndex;
    console.log(`🔄 Rotated to API key ${nextIndex + 1}/${models.length}`);
    return true;
  }
  // Reset index for next day but report all exhausted
  currentKeyIndex = 0;
  return false;
};

/**
 * Get total number of available keys
 */
export const getKeyCount = () => models.length;

export default { getModel, rotateKey, getKeyCount };
