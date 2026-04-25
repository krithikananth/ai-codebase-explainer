// ──────────────────────────────────────────────────────────────
// services/fileService.js — File tree extraction and analysis
// Recursively reads repository files, builds tree structure,
// detects languages, counts lines, and extracts key files
// ──────────────────────────────────────────────────────────────
import fs from "fs";
import path from "path";

// Directories to skip during analysis
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", "__pycache__",
  ".cache", ".vscode", ".idea", "vendor", "venv", "env",
  ".tox", "coverage", ".nyc_output", ".parcel-cache",
]);

// File extensions we care about for code analysis
const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rs",
  ".rb", ".php", ".c", ".cpp", ".h", ".cs", ".swift", ".kt",
  ".scala", ".vue", ".svelte", ".html", ".css", ".scss",
  ".json", ".yaml", ".yml", ".toml", ".md", ".sql",
]);

// Binary/large file extensions to skip reading content
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff",
  ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".zip", ".tar",
  ".gz", ".pdf", ".exe", ".dll", ".so", ".dylib",
]);

// Language mapping for statistics
const LANG_MAP = {
  ".js": "JavaScript", ".jsx": "JavaScript", ".ts": "TypeScript",
  ".tsx": "TypeScript", ".py": "Python", ".java": "Java",
  ".go": "Go", ".rs": "Rust", ".rb": "Ruby", ".php": "PHP",
  ".c": "C", ".cpp": "C++", ".h": "C/C++", ".cs": "C#",
  ".swift": "Swift", ".kt": "Kotlin", ".scala": "Scala",
  ".vue": "Vue", ".svelte": "Svelte", ".html": "HTML",
  ".css": "CSS", ".scss": "SCSS", ".sql": "SQL",
};

/**
 * Build a hierarchical file tree structure
 * @param {string} dir - Directory to scan
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum traversal depth
 * @returns {Array} Tree structure
 */
export const getFileTree = (dir, depth = 0, maxDepth = 4) => {
  if (depth > maxDepth) return [];

  try {
    const entries = fs.readdirSync(dir);
    return entries
      .filter((entry) => !SKIP_DIRS.has(entry) && !entry.startsWith("."))
      .sort((a, b) => {
        // Folders first, then files
        const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
        const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      })
      .map((entry) => {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        const isDir = stat.isDirectory();

        return {
          name: entry,
          type: isDir ? "folder" : "file",
          children: isDir ? getFileTree(fullPath, depth + 1, maxDepth) : undefined,
        };
      });
  } catch {
    return [];
  }
};

/**
 * Read README content from the repository
 * @param {string} repoPath - Root path of the cloned repo
 * @returns {string} README content or placeholder
 */
export const getReadme = (repoPath) => {
  const readmeNames = ["README.md", "readme.md", "README.rst", "README.txt", "README"];

  for (const name of readmeNames) {
    const readmePath = path.join(repoPath, name);
    if (fs.existsSync(readmePath)) {
      return fs.readFileSync(readmePath, "utf-8").slice(0, 6000);
    }
  }

  return "No README found.";
};

/**
 * Extract important source files for AI analysis
 * Prioritizes entry points, configs, routes, and controllers
 * @param {string} repoPath - Root path of the cloned repo
 * @returns {Array<{file: string, snippet: string}>}
 */
export const getImportantFiles = (repoPath) => {
  const important = [];
  const maxFiles = 10;
  const maxSnippetLength = 2000;

  // Priority files to look for first
  const priorityPatterns = [
    "package.json", "requirements.txt", "Cargo.toml", "pom.xml",
    "go.mod", "Gemfile", "composer.json", "build.gradle",
  ];

  // Check priority files first
  for (const pattern of priorityPatterns) {
    const filePath = path.join(repoPath, pattern);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8").slice(0, maxSnippetLength);
      important.push({ file: pattern, snippet: content });
    }
  }

  // Walk directory for source files
  const walk = (dir, relativePath = "") => {
    if (important.length >= maxFiles) return;

    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        if (important.length >= maxFiles) break;
        if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue;

        const fullPath = path.join(dir, entry);
        const relPath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          const ext = path.extname(entry).toLowerCase();
          if (CODE_EXTENSIONS.has(ext) && !BINARY_EXTENSIONS.has(ext)) {
            // Skip already-added priority files
            if (priorityPatterns.includes(entry)) continue;

            const content = fs.readFileSync(fullPath, "utf-8").slice(0, maxSnippetLength);
            important.push({ file: relPath, snippet: content });
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  };

  walk(repoPath);
  return important;
};

/**
 * Compute repository statistics
 * @param {string} repoPath - Root path of the cloned repo
 * @returns {{totalFiles: number, totalFolders: number, languages: Object, linesOfCode: number}}
 */
export const getRepoStats = (repoPath) => {
  let totalFiles = 0;
  let totalFolders = 0;
  let linesOfCode = 0;
  const languages = {};

  const walk = (dir) => {
    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue;

        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          totalFolders++;
          walk(fullPath);
        } else {
          totalFiles++;
          const ext = path.extname(entry).toLowerCase();

          if (LANG_MAP[ext]) {
            languages[LANG_MAP[ext]] = (languages[LANG_MAP[ext]] || 0) + 1;
          }

          // Count lines for code files
          if (CODE_EXTENSIONS.has(ext) && !BINARY_EXTENSIONS.has(ext) && stat.size < 500000) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              linesOfCode += content.split("\n").length;
            } catch {
              // Skip unreadable files
            }
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  };

  walk(repoPath);
  return { totalFiles, totalFolders, languages, linesOfCode };
};

/**
 * Detect the technology stack from repository files
 * @param {string} repoPath - Root path of the cloned repo
 * @returns {string[]} List of detected technologies
 */
export const detectTechStack = (repoPath) => {
  const stack = new Set();

  // Package.json detection (Node.js ecosystem)
  const pkgPath = path.join(repoPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (allDeps.react) stack.add("React");
      if (allDeps.next) stack.add("Next.js");
      if (allDeps.vue) stack.add("Vue.js");
      if (allDeps.angular || allDeps["@angular/core"]) stack.add("Angular");
      if (allDeps.svelte) stack.add("Svelte");
      if (allDeps.express) stack.add("Express.js");
      if (allDeps.fastify) stack.add("Fastify");
      if (allDeps.koa) stack.add("Koa");
      if (allDeps.mongoose || allDeps.mongodb) stack.add("MongoDB");
      if (allDeps.prisma || allDeps["@prisma/client"]) stack.add("Prisma");
      if (allDeps.sequelize) stack.add("Sequelize");
      if (allDeps.tailwindcss) stack.add("Tailwind CSS");
      if (allDeps.typescript) stack.add("TypeScript");
      if (allDeps.jest) stack.add("Jest");
      if (allDeps.vite) stack.add("Vite");
      if (allDeps.webpack) stack.add("Webpack");
      if (allDeps["socket.io"]) stack.add("Socket.IO");
      if (allDeps.redis || allDeps.ioredis) stack.add("Redis");
      if (allDeps.graphql) stack.add("GraphQL");

      stack.add("Node.js");
    } catch {
      // Invalid package.json
    }
  }

  // Python detection
  if (fs.existsSync(path.join(repoPath, "requirements.txt")) ||
      fs.existsSync(path.join(repoPath, "setup.py")) ||
      fs.existsSync(path.join(repoPath, "pyproject.toml"))) {
    stack.add("Python");

    try {
      const reqPath = path.join(repoPath, "requirements.txt");
      if (fs.existsSync(reqPath)) {
        const reqs = fs.readFileSync(reqPath, "utf-8").toLowerCase();
        if (reqs.includes("django")) stack.add("Django");
        if (reqs.includes("flask")) stack.add("Flask");
        if (reqs.includes("fastapi")) stack.add("FastAPI");
        if (reqs.includes("tensorflow") || reqs.includes("torch")) stack.add("ML/AI");
      }
    } catch {
      // Skip
    }
  }

  // Other language detection
  if (fs.existsSync(path.join(repoPath, "Cargo.toml"))) stack.add("Rust");
  if (fs.existsSync(path.join(repoPath, "go.mod"))) stack.add("Go");
  if (fs.existsSync(path.join(repoPath, "pom.xml")) ||
      fs.existsSync(path.join(repoPath, "build.gradle"))) stack.add("Java");
  if (fs.existsSync(path.join(repoPath, "Gemfile"))) stack.add("Ruby");
  if (fs.existsSync(path.join(repoPath, "composer.json"))) stack.add("PHP");
  if (fs.existsSync(path.join(repoPath, "Dockerfile"))) stack.add("Docker");
  if (fs.existsSync(path.join(repoPath, "docker-compose.yml")) ||
      fs.existsSync(path.join(repoPath, "docker-compose.yaml"))) stack.add("Docker Compose");

  return [...stack];
};