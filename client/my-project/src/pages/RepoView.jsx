// ──────────────────────────────────────────────────────────────
// pages/RepoView.jsx — Full repository analysis viewer
// Clean, well-spaced layout with tabbed sections for
// explanation, file tree, architecture, API docs, and languages
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { PageLoader } from "../components/Loader";
import FileTree from "../components/FileTree";
import TechBadge from "../components/TechBadge";
import StatsCards from "../components/StatsCards";
import LanguageChart from "../components/LanguageChart";
import MermaidDiagram from "../components/MermaidDiagram";

export default function RepoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("explanation");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await api.get(`/repos/${id}`);
        setRepo(res.data);
      } catch (err) {
        console.error("Failed to fetch repo:", err);
        navigate("/repos");
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id, navigate]);

  const handleShare = async () => {
    try {
      setSharing(true);
      const res = await api.post(`/repos/${id}/share`);
      setRepo({ ...repo, isPublic: res.data.isPublic });
      if (res.data.isPublic) {
        navigator.clipboard?.writeText(
          `${window.location.origin}/shared/${id}`
        );
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await api.post(`/repos/${id}/bookmark`);
      setRepo({
        ...repo,
        bookmarkedBy: res.data.bookmarked
          ? [...(repo.bookmarkedBy || []), "me"]
          : (repo.bookmarkedBy || []).filter((x) => x !== "me"),
      });
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading repository analysis..." />
      </DashboardLayout>
    );
  }

  if (!repo) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-xl text-gray-400">Repository not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: "explanation", label: "Explanation", icon: "📝" },
    { id: "filetree", label: "File Tree", icon: "📂" },
    { id: "architecture", label: "Architecture", icon: "📐" },
    { id: "apidocs", label: "API Docs", icon: "📋" },
    { id: "languages", label: "Languages", icon: "📊" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* ─── Header Section ──────────────────────────────── */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            {/* Left: back + repo info */}
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/repos")}
                  className="text-gray-500 hover:text-white transition-colors text-sm
                    px-3 py-1.5 rounded-lg hover:bg-gray-800/50"
                >
                  ← Back
                </button>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    repo.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                  }`}
                >
                  {repo.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {repo.owner ? (
                  <>
                    <span className="text-gray-500 font-normal">{repo.owner} / </span>
                    <span className="gradient-text">{repo.name}</span>
                  </>
                ) : (
                  <span className="gradient-text">{repo.name}</span>
                )}
              </h1>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500
                  hover:text-indigo-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                </svg>
                {repo.url}
              </a>

              {/* Tech badges */}
              {repo.techStack && repo.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {repo.techStack.map((tech) => (
                    <TechBadge key={tech} tech={tech} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleBookmark}
                className="w-11 h-11 rounded-xl bg-gray-800/80 border border-gray-700/50
                  hover:border-amber-500/40 hover:bg-amber-500/10
                  transition-all flex items-center justify-center text-lg"
                title="Bookmark"
              >
                {repo.bookmarkedBy?.length > 0 ? "⭐" : "☆"}
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-11 h-11 rounded-xl bg-gray-800/80 border border-gray-700/50
                  hover:border-indigo-500/40 hover:bg-indigo-500/10
                  transition-all flex items-center justify-center text-lg"
                title={repo.isPublic ? "Make Private" : "Share Publicly"}
              >
                {repo.isPublic ? "🔓" : "🔗"}
              </button>
              <button
                onClick={() => navigate(`/chat?repo=${id}`)}
                className="btn-gradient flex items-center gap-2 h-11 px-5"
              >
                💬 Chat with Code
              </button>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─────────────────────────────────── */}
        <StatsCards stats={repo.stats} />

        {/* ─── Tabs Navigation ─────────────────────────────── */}
        <div className="border-b border-gray-800/80">
          <nav className="flex gap-1 overflow-x-auto -mb-px pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium
                  whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ─── Tab Content ─────────────────────────────────── */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 min-h-[450px]">

          {/* Explanation tab */}
          {activeTab === "explanation" && (
            <div className="animate-fade-in max-w-4xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                <span className="text-2xl">📝</span>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                  <p className="text-sm text-gray-500">Generated by Gemini AI</p>
                </div>
              </div>
              <div className="markdown-content prose-spacing">
                <ReactMarkdown>{repo.explanation || "No explanation available."}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* File tree tab */}
          {activeTab === "filetree" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                <span className="text-2xl">📂</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Repository Structure</h2>
                  <p className="text-sm text-gray-500">
                    {repo.stats?.totalFiles || 0} files in {repo.stats?.totalFolders || 0} folders
                  </p>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 lg:p-6">
                <FileTree tree={repo.fileTree} />
              </div>
            </div>
          )}

          {/* Architecture tab */}
          {activeTab === "architecture" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                <span className="text-2xl">📐</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Architecture Diagram</h2>
                  <p className="text-sm text-gray-500">System architecture overview</p>
                </div>
              </div>
              {repo.architectureDiagram ? (
                <MermaidDiagram chart={repo.architectureDiagram} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <span className="text-4xl mb-3">📐</span>
                  <p>No architecture diagram generated for this repository.</p>
                </div>
              )}
            </div>
          )}

          {/* API docs tab */}
          {activeTab === "apidocs" && (
            <div className="animate-fade-in max-w-4xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-xl font-bold text-white">API Documentation</h2>
                  <p className="text-sm text-gray-500">Detected API endpoints and routes</p>
                </div>
              </div>
              {(() => {
                // Determine the API docs content (used for both display and download)
                let docsContent = "";

                if (repo.apiDocs && repo.apiDocs.trim().length > 10) {
                  docsContent = repo.apiDocs;
                } else {
                  const explanation = repo.explanation || "";
                  const apiMatch = explanation.match(/##?\s*(?:🔗|API|Endpoints|Routes)[\s\S]*?(?=\n##?\s[^#]|$)/i);
                  if (apiMatch && apiMatch[0].trim().length > 50) {
                    docsContent = apiMatch[0].trim();
                  } else {
                    const techList = repo.techStack?.join(", ") || "Not detected";
                    docsContent = `## Project Interface Documentation

### Technology Stack
${repo.techStack?.map(t => `- **${t}**`).join("\n") || "- Not detected"}

### Project Structure
- **Total Files:** ${repo.stats?.totalFiles || "N/A"}
- **Total Folders:** ${repo.stats?.totalFolders || "N/A"}  
- **Lines of Code:** ${repo.stats?.linesOfCode?.toLocaleString() || "N/A"}
- **Complexity:** ${repo.stats?.complexity || "N/A"}

### Getting Started
This repository uses **${techList}**. Check the explanation tab for a detailed breakdown of the architecture and available features.

> 💡 *Re-analyze this repository to generate more detailed API documentation.*`;
                  }
                }

                // Download handler
                const handleDownload = () => {
                  const date = new Date().toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  });
                  const techBadges = repo.techStack?.length
                    ? repo.techStack.map(t => `\`${t}\``).join("  ")
                    : "Not detected";
                  const languages = repo.stats?.languages
                    ? Object.entries(repo.stats.languages)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([lang, count]) => `| ${lang} | ${count} |`)
                        .join("\n")
                    : "";

                  const fullContent = `# 📋 ${repo.name} — API Documentation

> **Generated by** [CodeLens AI](https://codelens-ai.vercel.app) on ${date}

---

## 📌 Repository Overview

| Field | Details |
|-------|---------|
| **Repository** | [${repo.url}](${repo.url}) |
| **Owner** | ${repo.owner || "N/A"} |
| **Description** | ${repo.description || "No description provided"} |
| **Analyzed On** | ${date} |

---

## 🛠️ Technology Stack

${techBadges}

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | ${repo.stats?.totalFiles || "N/A"} |
| **Total Folders** | ${repo.stats?.totalFolders || "N/A"} |
| **Lines of Code** | ${repo.stats?.linesOfCode?.toLocaleString() || "N/A"} |
| **Complexity** | ${(repo.stats?.complexity || "N/A").charAt(0).toUpperCase() + (repo.stats?.complexity || "N/A").slice(1)} |

${languages ? `### Language Distribution\n\n| Language | Files |\n|----------|-------|\n${languages}\n` : ""}
---

## 📋 API Documentation

${docsContent}

---

*This document was auto-generated by CodeLens AI. For the most up-to-date information, visit the repository directly.*
`;
                  const blob = new Blob([fullContent], { type: "text/markdown;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${repo.name}-api-docs.md`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                };

                return (
                  <>
                    <div className="markdown-content">
                      <ReactMarkdown>{docsContent}</ReactMarkdown>
                    </div>

                    {/* Download button */}
                    <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-end">
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl
                          bg-gradient-to-r from-indigo-600 to-purple-600
                          hover:from-indigo-500 hover:to-purple-500
                          text-white font-medium text-sm
                          shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                          transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download API Docs (.md)
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Languages tab */}
          {activeTab === "languages" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                <span className="text-2xl">📊</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Language Distribution</h2>
                  <p className="text-sm text-gray-500">Files by programming language</p>
                </div>
              </div>
              <div className="max-w-2xl">
                <LanguageChart languages={repo.stats?.languages} />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
