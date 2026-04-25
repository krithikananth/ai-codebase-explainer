// ──────────────────────────────────────────────────────────────
// services/aiService.js — AI-powered code analysis using Gemini
// Handles explanation generation, Q&A, architecture diagrams,
// API docs generation, and code complexity analysis
// Supports automatic API key rotation on quota limits
// ──────────────────────────────────────────────────────────────
import { getModel, rotateKey, getKeyCount } from "../config/gemini.js";

// ── Token optimization: smaller = faster AI responses ────────
const MAX_TREE_CHARS = 2000;
const MAX_README_CHARS = 2500;
const MAX_SNIPPET_CHARS = 1000;
const MAX_CONTEXT_CHARS = 5000;

/**
 * Truncate text to a maximum length with an indicator
 */
const truncate = (text, maxLen) => {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen) + "\n... [truncated for token optimization]";
};

/**
 * Retry wrapper with automatic API key rotation
 * When a key hits 429 quota, it rotates to the next key and retries
 * Tries all available keys before giving up
 */
const callWithRetry = async (prompt) => {
  const totalKeys = getKeyCount();
  let keysTried = 0;

  while (keysTried < totalKeys) {
    try {
      const currentModel = getModel();
      const result = await currentModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
      const isTransient = error.message?.includes("503") || error.message?.includes("500");

      if (isRateLimit) {
        keysTried++;
        const hasMore = rotateKey();
        if (hasMore && keysTried < totalKeys) {
          console.warn(`⚠️ API key ${keysTried} quota exceeded, switching to key ${keysTried + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error("All API keys have exceeded their daily quota. Please try again tomorrow or add more keys.");
      }

      if (isTransient) {
        console.warn(`⚠️ Transient error, retrying in 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  throw new Error("All API keys exhausted. Please try again later.");
};

// ─────────────────────────────────────────────────────────────
// 1. REPO EXPLANATION — Main analysis
// ─────────────────────────────────────────────────────────────
/**
 * Generate a comprehensive AI explanation of a repository
 * @param {{tree: Array, readme: string, importantFiles: Array, techStack: string[], stats: Object}} data
 * @returns {Promise<string>} Markdown-formatted explanation
 */
export const generateRepoExplanation = async ({ tree, readme, importantFiles, techStack, stats }) => {
  const treeStr = truncate(JSON.stringify(tree, null, 2), MAX_TREE_CHARS);
  const readmeStr = truncate(readme, MAX_README_CHARS);
  const filesStr = importantFiles
    .map((f) => `📄 FILE: ${f.file}\n\`\`\`\n${truncate(f.snippet, MAX_SNIPPET_CHARS)}\n\`\`\``)
    .join("\n\n");

  const prompt = `You are an expert software architect analyzing a GitHub repository.
Provide a comprehensive, well-structured explanation in Markdown format.

## Repository Context

**Detected Tech Stack:** ${techStack?.join(", ") || "Unknown"}
**Total Files:** ${stats?.totalFiles || "N/A"} | **Total Folders:** ${stats?.totalFolders || "N/A"} | **Lines of Code:** ${stats?.linesOfCode || "N/A"}

### README
${readmeStr}

### Folder Structure
\`\`\`
${treeStr}
\`\`\`

### Key Source Files
${filesStr}

---

## Please provide:

### 1. 🎯 Project Purpose
What does this project do? What problem does it solve?

### 2. 🛠️ Technology Stack
List all technologies, frameworks, and libraries used with brief explanations of why each is chosen.

### 3. 🏗️ Architecture Overview
Describe the overall architecture pattern (MVC, microservices, monolith, etc.) and how components interact.

### 4. 📁 Folder-by-Folder Explanation
Explain each top-level folder's purpose and what it contains.

### 5. ⚡ Key Features
List the main features/functionality of the project.

### 6. 🔗 API Endpoints (if applicable)
List any REST/GraphQL endpoints found in the code.

### 7. 💡 Code Quality Observations
Note any patterns, best practices, or areas for improvement.

Format everything in clean Markdown with headers and bullet points.`;

  return callWithRetry(prompt);
};

// ─────────────────────────────────────────────────────────────
// 2. CHAT Q&A — Ask questions about a repo
// ─────────────────────────────────────────────────────────────
/**
 * Answer a user's question about an analyzed repository
 * @param {string} question - User's question
 * @param {string} repoExplanation - Previously generated explanation
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Promise<string>} AI answer
 */
export const askQuestion = async (question, repoExplanation, chatHistory = []) => {
  const contextStr = truncate(repoExplanation, MAX_CONTEXT_CHARS);

  // Build conversation history for context
  const historyStr = chatHistory
    .slice(-6) // Last 6 messages for context window
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `You are an expert software engineer helping a user understand a GitHub project.
You have access to the full analysis of this repository.

## Repository Analysis
${contextStr}

${historyStr ? `## Previous Conversation\n${historyStr}\n` : ""}

## Current Question
${question}

## Instructions
- Answer based ONLY on the repository analysis above
- Be specific, cite file names and code patterns when possible
- If you're unsure, say so rather than guessing
- Use Markdown formatting for clarity
- Keep answers concise but thorough`;

  return callWithRetry(prompt);
};

// ─────────────────────────────────────────────────────────────
// 3. ARCHITECTURE DIAGRAM — Generate Mermaid diagram
// ─────────────────────────────────────────────────────────────
/**
 * Generate a Mermaid architecture diagram for the repository
 * @param {string} explanation - Repository explanation
 * @param {string[]} techStack - Detected technologies
 * @returns {Promise<string>} Mermaid diagram code
 */
export const generateArchitectureDiagram = async (explanation, techStack) => {
  const prompt = `Based on this repository analysis, generate a HIGH-LEVEL system architecture diagram using Mermaid.js.

Tech Stack: ${techStack?.join(", ") || "Unknown"}

Repository Analysis:
${truncate(explanation, MAX_CONTEXT_CHARS)}

CONTENT RULES — WHAT TO SHOW:
1. Show HIGH-LEVEL architectural components only (eg: "Web Interface", "API Gateway", "Auth Module", "Database Layer")
2. NEVER use specific filenames like app.py, index.js, routes.js, courses.py — use their PURPOSE instead
3. Use standardized software architecture terminology that anyone can understand
4. Group into logical layers: "Presentation Layer", "Business Logic", "Data Layer", "External Services"
5. Show the DATA FLOW: how a user request travels through the system
6. Include: User, Frontend, Backend, Database, any external APIs or services
7. Label edges with actions: "authenticates", "fetches data", "stores results", "renders UI"

SYNTAX RULES — MERMAID V11 COMPATIBLE:
1. Start with exactly: graph TD
2. Every node label MUST use: A["My Label"]
3. Edge labels MUST use: A -->|"action"| B
4. DO NOT use semicolons, %% comments, or special chars in labels
5. No parentheses, ampersand, periods, or slashes in labels
6. Keep labels SHORT: 2-4 words max
7. Use simple IDs: A, B, C, D1, D2
8. Maximum 10-12 nodes
9. Use subgraph with quoted titles

Example of CORRECT output:
graph TD
    A["User"] -->|"opens app"| B["Web Interface"]
    B -->|"sends request"| C["API Server"]
    C -->|"validates"| D["Auth Module"]
    C -->|"processes"| E["Core Logic"]
    E -->|"reads and writes"| F["Database"]
    E -->|"calls"| G["External API"]
    G -->|"returns data"| E
    E -->|"sends response"| B
    subgraph "Frontend Layer"
        B
    end
    subgraph "Backend Layer"
        C
        D
        E
    end
    subgraph "Data Layer"
        F
    end

Return ONLY the Mermaid code. No markdown fences. No explanation. Start directly with graph TD.`;

  return callWithRetry(prompt);
};

// ─────────────────────────────────────────────────────────────
// 4. API DOCS — Generate API documentation
// ─────────────────────────────────────────────────────────────
/**
 * Generate API documentation from the code analysis
 * @param {Array} importantFiles - Key source files
 * @param {string} explanation - Repository explanation
 * @returns {Promise<string>} Markdown API documentation
 */
export const generateApiDocs = async (importantFiles, explanation) => {
  const filesStr = importantFiles
    .filter((f) => /route|controller|api|endpoint/i.test(f.file))
    .map((f) => `FILE: ${f.file}\n${truncate(f.snippet, MAX_SNIPPET_CHARS)}`)
    .join("\n\n");

  const prompt = `Analyze these route/controller files and generate API documentation in Markdown.

Source Files:
${filesStr || "No explicit route files found."}

Repository Context:
${truncate(explanation, 3000)}

Generate documentation with:
- Endpoint method and path
- Description
- Request parameters/body
- Response format
- Authentication requirements

Format as a clean Markdown table or structured list.
If no API endpoints are found, state that clearly.`;

  return callWithRetry(prompt);
};

// ─────────────────────────────────────────────────────────────
// 5. COMPLEXITY ANALYSIS — Assess code complexity
// ─────────────────────────────────────────────────────────────
/**
 * Analyze code complexity level
 * @param {{totalFiles: number, linesOfCode: number, languages: Object}} stats
 * @returns {string} Complexity level: "low", "medium", or "high"
 */
export const analyzeComplexity = (stats) => {
  const { totalFiles, linesOfCode, languages } = stats;
  const langCount = Object.keys(languages || {}).length;

  // Simple heuristic-based complexity
  let score = 0;

  if (totalFiles > 100) score += 3;
  else if (totalFiles > 30) score += 2;
  else if (totalFiles > 10) score += 1;

  if (linesOfCode > 10000) score += 3;
  else if (linesOfCode > 3000) score += 2;
  else if (linesOfCode > 500) score += 1;

  if (langCount > 4) score += 2;
  else if (langCount > 2) score += 1;

  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
};

// ─────────────────────────────────────────────────────────────
// 6. COMBINED ANALYSIS — Single API call for all outputs
// ─────────────────────────────────────────────────────────────
/**
 * Generate explanation + architecture diagram + API docs in ONE call.
 * Reduces quota usage from 3 calls to 1 call per analysis.
 */
export const generateFullAnalysis = async ({ tree, readme, importantFiles, techStack, stats }) => {
  const treeStr = truncate(JSON.stringify(tree, null, 2), MAX_TREE_CHARS);
  const readmeStr = truncate(readme, MAX_README_CHARS);
  const filesStr = importantFiles
    .map((f) => `📄 FILE: ${f.file}\n\`\`\`\n${truncate(f.snippet, MAX_SNIPPET_CHARS)}\n\`\`\``)
    .join("\n\n");

  // Broader filter to catch route/controller/API-related files
  const routeFiles = importantFiles
    .filter((f) => /route|controller|api|endpoint|handler|server|app\.(js|ts|py|go|rb)/i.test(f.file))
    .map((f) => `FILE: ${f.file}\n${truncate(f.snippet, MAX_SNIPPET_CHARS)}`)
    .join("\n\n");

  const prompt = `You are an expert software architect. Analyze this GitHub repository and provide THREE outputs in ONE response.

## Repository Context
**Tech Stack:** ${techStack?.join(", ") || "Unknown"}
**Files:** ${stats?.totalFiles || "N/A"} | **Folders:** ${stats?.totalFolders || "N/A"} | **LOC:** ${stats?.linesOfCode || "N/A"}

### README
${readmeStr}

### Folder Structure
\`\`\`
${treeStr}
\`\`\`

### Key Source Files
${filesStr}

${routeFiles ? `### Route/Controller/API Files\n${routeFiles}` : ""}

---

You MUST respond with EXACTLY these three sections using these EXACT delimiters. Do NOT skip any section.

===EXPLANATION===
Provide a comprehensive, well-structured explanation in Markdown with these sections:
1. 🎯 Project Purpose
2. 🛠️ Technology Stack
3. 🏗️ Architecture Overview
4. 📁 Folder-by-Folder Explanation
5. ⚡ Key Features
6. 🔗 API Endpoints (if applicable)
7. 💡 Code Quality Observations

===DIAGRAM===
Generate a Mermaid.js architecture diagram:
- Start with exactly: graph TD
- Node labels MUST use: A["My Label"]
- Edge labels MUST use: A -->|"action"| B
- NO semicolons, NO %% comments
- Keep labels SHORT: 2-4 words max
- Maximum 10-12 nodes
- Use subgraph with quoted titles
If no meaningful diagram possible, write exactly: NO_DIAGRAM

===APIDOCS===
You MUST generate detailed API documentation in Markdown. Analyze ALL source files for any endpoints, routes, functions, or modules that can be documented. Include:

**For web APIs/REST endpoints:**
- HTTP method (GET, POST, PUT, DELETE)
- Route path
- Description
- Request parameters/body
- Response format
- Authentication required (yes/no)

**For libraries/CLI tools/non-API projects:**
- Document the main exported functions/classes
- Parameters and return types
- Usage examples

**For any project type:**
- Document the main entry points and how to use them
- List all available commands or scripts
- Include configuration options

Format each endpoint/function as a clear Markdown section with headers. ALWAYS generate documentation — every project has documentable interfaces.`;

  const response = await callWithRetry(prompt);

  // Debug: log raw response length and delimiter presence
  console.log(`📝 AI response length: ${response.length} chars`);
  console.log(`📝 Contains ===EXPLANATION===: ${response.includes("===EXPLANATION===")}`);
  console.log(`📝 Contains ===DIAGRAM===: ${response.includes("===DIAGRAM===")}`);
  console.log(`📝 Contains ===APIDOCS===: ${response.includes("===APIDOCS===")}`);

  // Parse delimited sections (flexible: handles spaces around delimiters)
  const sections = { explanation: "", architectureDiagram: "", apiDocs: "" };

  // More flexible regex patterns that handle whitespace around delimiters
  const explMatch = response.match(/={3,}\s*EXPLANATION\s*={3,}([\s\S]*?)(?=={3,}\s*DIAGRAM\s*={3,})/i);
  if (explMatch) sections.explanation = explMatch[1].trim();

  const diagMatch = response.match(/={3,}\s*DIAGRAM\s*={3,}([\s\S]*?)(?=={3,}\s*APIDOCS\s*={3,})/i);
  if (diagMatch) {
    let diag = diagMatch[1].trim();
    // Strip markdown code fences if AI wrapped it
    diag = diag.replace(/^```(?:mermaid)?\s*/i, "").replace(/\s*```\s*$/, "");
    sections.architectureDiagram = (diag === "NO_DIAGRAM" || diag.length < 10) ? "" : diag;
  }

  const apiMatch = response.match(/={3,}\s*APIDOCS\s*={3,}([\s\S]*)$/i);
  if (apiMatch) {
    let api = apiMatch[1].trim();
    // Strip trailing delimiter artifacts or code fences
    api = api.replace(/\s*={3,}\s*$/, "").replace(/^```(?:markdown)?\s*/i, "").replace(/\s*```\s*$/, "");
    sections.apiDocs = (api === "NO_APIDOCS" || api.length < 20) ? "" : api;
  }

  console.log(`📝 Parsed — Explanation: ${sections.explanation.length} chars, Diagram: ${sections.architectureDiagram.length} chars, API Docs: ${sections.apiDocs.length} chars`);

  // Fallback: if parsing failed completely, try splitting by any === pattern
  if (!sections.explanation && response.length > 100) {
    console.warn("⚠️ Delimiter parsing failed, using full response as explanation");
    sections.explanation = response;
  }

  // If API docs are still empty, extract from explanation's API section
  if (!sections.apiDocs && sections.explanation) {
    const apiSection = sections.explanation.match(/##?\s*(?:🔗|API|Endpoints)[\s\S]*?(?=##?\s[^#]|$)/i);
    if (apiSection && apiSection[0].length > 50) {
      sections.apiDocs = apiSection[0].trim();
      console.log(`📝 Extracted API docs from explanation: ${sections.apiDocs.length} chars`);
    }
  }

  return sections;
};


