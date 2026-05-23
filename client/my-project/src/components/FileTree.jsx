// ──────────────────────────────────────────────────────────────
// components/FileTree.jsx — Interactive file tree with code viewer
// Renders the repository file structure with expand/collapse
// Click any file to view its source code with copy button
// ──────────────────────────────────────────────────────────────
import { useState, useRef } from "react";

const LANG_MAP = {
  js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
  py: "python", java: "java", go: "go", rs: "rust", rb: "ruby",
  php: "php", c: "c", cpp: "cpp", h: "c", cs: "csharp",
  swift: "swift", kt: "kotlin", vue: "vue", svelte: "svelte",
  html: "html", css: "css", scss: "scss", sql: "sql",
  json: "json", yaml: "yaml", yml: "yaml", toml: "toml",
  md: "markdown", xml: "xml", sh: "bash",
};

function TreeNode({ node, depth = 0, onFileSelect, selectedFile }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile === node;

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

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (node.content) {
      onFileSelect(node);
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      <div
        className={`file-tree-item ${isSelected ? "bg-indigo-500/15 border-l-2 border-indigo-500" : ""} 
          ${!isFolder && node.content ? "cursor-pointer hover:bg-gray-800/60" : ""}`}
        onClick={handleClick}
      >
        {isFolder ? (
          <span className="text-sm transition-transform duration-200" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}>
            ▶
          </span>
        ) : (
          <span className="text-sm w-4 text-center">{getFileIcon(node.name)}</span>
        )}
        <span className={`${isFolder ? "text-indigo-300 font-medium" : isSelected ? "text-white font-medium" : "text-gray-300"}`}>
          {isFolder ? "📁" : ""} {node.name}
        </span>
        {!isFolder && node.lineCount && (
          <span className="ml-auto text-xs text-gray-600 pl-2">
            {node.lineCount} lines
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children && (
        <div className="animate-fade-in">
          {node.children.map((child, i) => (
            <TreeNode
              key={`${child.name}-${i}`}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CodeViewer({ file, onClose }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const lang = LANG_MAP[ext] || ext;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement("textarea");
      textarea.value = file.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/70 border-b border-gray-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm">📄</span>
          <span className="text-sm font-medium text-white truncate">{file.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-gray-700/60 text-gray-400 uppercase flex-shrink-0">
            {lang}
          </span>
          {file.lineCount && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {file.lineCount} lines
            </span>
          )}
          {file.truncated && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 flex-shrink-0">
              Showing first 200 lines
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Copy button */}
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/50"
              }`}
          >
            {copied ? (
              <>✅ Copied!</>
            ) : (
              <>📋 Copy</>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Code content with line numbers */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto" ref={codeRef}>
        <pre className="p-0 m-0">
          <code className="block text-sm leading-6 font-mono">
            {file.content.split("\n").map((line, i) => (
              <div key={i} className="flex hover:bg-gray-800/40 group">
                <span className="inline-block w-12 text-right pr-4 text-gray-600 select-none 
                  border-r border-gray-800/50 bg-gray-900/30 flex-shrink-0 text-xs leading-6">
                  {i + 1}
                </span>
                <span className="pl-4 pr-6 text-gray-300 whitespace-pre overflow-x-visible">
                  {line || " "}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default function FileTree({ tree }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!tree || tree.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4">No file tree available.</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File tree */}
      <div className="font-mono text-sm max-h-[500px] overflow-y-auto pr-2">
        {tree.map((node, i) => (
          <TreeNode
            key={`${node.name}-${i}`}
            node={node}
            onFileSelect={(file) => setSelectedFile(file === selectedFile ? null : file)}
            selectedFile={selectedFile}
          />
        ))}
      </div>

      {/* Code viewer panel */}
      {selectedFile && (
        <CodeViewer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* Hint */}
      {!selectedFile && (
        <div className="text-xs text-gray-600 flex items-center gap-1.5 px-2">
          <span>💡</span> Click any file to view its source code
        </div>
      )}
    </div>
  );
}
