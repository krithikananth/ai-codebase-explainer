// ──────────────────────────────────────────────────────────────
// components/FileTree.jsx — Interactive file tree viewer
// Renders the repository file structure with expand/collapse
// ──────────────────────────────────────────────────────────────
import { useState } from "react";

function TreeNode({ node, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";

  const getFileIcon = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const icons = {
      js: "🟨", jsx: "⚛️", ts: "🔷", tsx: "⚛️",
      py: "🐍", java: "☕", go: "🔵", rs: "🦀",
      md: "📝", json: "📋", html: "🌐", css: "🎨",
      scss: "🎨", yaml: "⚙️", yml: "⚙️", toml: "⚙️",
      sql: "🗄️", svg: "🖼️", png: "🖼️", jpg: "🖼️",
    };
    return icons[ext] || "📄";
  };

  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      <div
        className="file-tree-item"
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder ? (
          <span className="text-sm transition-transform duration-200" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}>
            ▶
          </span>
        ) : (
          <span className="text-sm w-4 text-center">{getFileIcon(node.name)}</span>
        )}
        <span className={isFolder ? "text-indigo-300 font-medium" : "text-gray-300"}>
          {isFolder ? "📁" : ""} {node.name}
        </span>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="animate-fade-in">
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree }) {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4">No file tree available.</div>
    );
  }

  return (
    <div className="font-mono text-sm max-h-[500px] overflow-y-auto pr-2">
      {tree.map((node, i) => (
        <TreeNode key={`${node.name}-${i}`} node={node} />
      ))}
    </div>
  );
}
