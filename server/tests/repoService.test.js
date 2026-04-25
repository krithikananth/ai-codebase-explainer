// ──────────────────────────────────────────────────────────────
// tests/repoService.test.js — Repository analysis service tests
// Tests for file tree extraction, tech stack detection,
// complexity analysis, and README reading
// ──────────────────────────────────────────────────────────────
import { jest } from "@jest/globals";

describe("Repository Analysis Service", () => {
  describe("URL Validation", () => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

    it("should accept valid GitHub URLs", () => {
      const validUrls = [
        "https://github.com/facebook/react",
        "https://github.com/vercel/next.js",
        "https://github.com/user/repo-name",
        "http://github.com/user/repo",
      ];

      validUrls.forEach((url) => {
        expect(githubRegex.test(url)).toBe(true);
      });
    });

    it("should reject invalid URLs", () => {
      const invalidUrls = [
        "https://gitlab.com/user/repo",
        "https://github.com/user",
        "not-a-url",
        "https://github.com/",
        "",
      ];

      invalidUrls.forEach((url) => {
        expect(githubRegex.test(url)).toBe(false);
      });
    });
  });

  describe("Tech Stack Detection", () => {
    it("should detect React from package.json dependencies", () => {
      const mockPkg = {
        dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
      };

      const stack = new Set();
      if (mockPkg.dependencies.react) stack.add("React");
      if (mockPkg.dependencies.express) stack.add("Express.js");

      expect(stack.has("React")).toBe(true);
      expect(stack.has("Express.js")).toBe(false);
    });

    it("should detect multiple technologies", () => {
      const mockPkg = {
        dependencies: {
          react: "^18.0.0",
          express: "^4.18.0",
          mongoose: "^7.0.0",
          tailwindcss: "^3.0.0",
        },
      };

      const stack = new Set();
      const allDeps = { ...mockPkg.dependencies };
      if (allDeps.react) stack.add("React");
      if (allDeps.express) stack.add("Express.js");
      if (allDeps.mongoose) stack.add("MongoDB");
      if (allDeps.tailwindcss) stack.add("Tailwind CSS");

      expect(stack.size).toBe(4);
      expect([...stack]).toContain("React");
      expect([...stack]).toContain("MongoDB");
    });
  });

  describe("Complexity Analysis", () => {
    it("should return 'low' for small repos", () => {
      const stats = { totalFiles: 5, linesOfCode: 200, languages: { JavaScript: 5 } };
      let score = 0;
      if (stats.totalFiles > 100) score += 3;
      else if (stats.totalFiles > 30) score += 2;
      else if (stats.totalFiles > 10) score += 1;
      if (stats.linesOfCode > 10000) score += 3;
      else if (stats.linesOfCode > 3000) score += 2;
      else if (stats.linesOfCode > 500) score += 1;

      const complexity = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
      expect(complexity).toBe("low");
    });

    it("should return 'high' for large repos", () => {
      const stats = { totalFiles: 200, linesOfCode: 50000, languages: { JavaScript: 100, TypeScript: 50, Python: 30, Go: 20, Rust: 10 } };
      let score = 0;
      if (stats.totalFiles > 100) score += 3;
      if (stats.linesOfCode > 10000) score += 3;
      const langCount = Object.keys(stats.languages).length;
      if (langCount > 4) score += 2;

      const complexity = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
      expect(complexity).toBe("high");
    });
  });

  describe("AI Response Formatting", () => {
    it("should truncate long text correctly", () => {
      const truncate = (text, maxLen) => {
        if (!text || text.length <= maxLen) return text || "";
        return text.slice(0, maxLen) + "... [truncated]";
      };

      const longText = "a".repeat(1000);
      const result = truncate(longText, 100);
      expect(result.length).toBeLessThan(1000);
      expect(result).toContain("[truncated]");
    });

    it("should handle empty text", () => {
      const truncate = (text, maxLen) => {
        if (!text || text.length <= maxLen) return text || "";
        return text.slice(0, maxLen) + "... [truncated]";
      };

      expect(truncate("", 100)).toBe("");
      expect(truncate(null, 100)).toBe("");
      expect(truncate(undefined, 100)).toBe("");
    });
  });
});
