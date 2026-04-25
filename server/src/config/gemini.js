// ──────────────────────────────────────────────────────────────
// config/gemini.js — Google Generative AI (Gemini) configuration
// Centralizes AI model initialization for reuse across services
// Using gemini-2.5-flash (current stable model)
// ──────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary model — gemini-2.5-flash (current stable, highest free tier quota)
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Export the client for advanced use cases
export default genAI;
