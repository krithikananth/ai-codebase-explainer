// ──────────────────────────────────────────────────────────────
// components/MermaidDiagram.jsx — Renders Mermaid diagrams
// Converts Mermaid syntax into beautiful SVG diagrams
// with aggressive sanitization for Mermaid v11 compatibility
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  suppressErrors: true,
  themeVariables: {
    primaryColor: "#6366f1",
    primaryTextColor: "#f3f4f6",
    primaryBorderColor: "#818cf8",
    lineColor: "#6366f1",
    secondaryColor: "#1e1b4b",
    tertiaryColor: "#1f2937",
    background: "#0f172a",
    mainBkg: "#1e1b4b",
    nodeBorder: "#818cf8",
    clusterBkg: "#1e293b",
    clusterBorder: "#475569",
    titleColor: "#f3f4f6",
    edgeLabelBackground: "#1e293b",
    nodeTextColor: "#f3f4f6",
  },
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 14,
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    padding: 15,
  },
});

let renderCounter = 0;

/**
 * Aggressively clean mermaid chart text for v11 compatibility:
 * - Remove markdown code fences
 * - Remove %% comment lines
 * - Remove trailing semicolons
 * - Quote all node labels to handle special chars (-, /, &, .)
 * - Quote edge labels
 */
function cleanChart(raw) {
  let text = raw
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const lines = text.split("\n");
  const cleaned = lines
    .filter((line) => !line.trim().startsWith("%%"))
    .map((line) => {
      // Remove trailing semicolons
      let l = line.replace(/;\s*$/, "");

      // Quote labels inside [] that aren't already quoted
      // e.g., A[Some - Label] → A["Some - Label"]
      l = l.replace(/\[([^\]"]+)\]/g, (match, label) => {
        return `["${label.trim()}"]`;
      });

      // Quote labels inside {} that aren't already quoted (decision nodes)
      l = l.replace(/\{([^}"]+)\}/g, (match, label) => {
        return `{"${label.trim()}"}`;
      });

      // Quote labels inside () that aren't already quoted (round nodes)
      // But skip subgraph/direction lines
      if (!l.trim().startsWith("subgraph") && !l.trim().startsWith("graph") && !l.trim().startsWith("end")) {
        l = l.replace(/\(([^)"]+)\)/g, (match, label) => {
          // Only quote if it looks like a node label (contains special chars)
          if (/[-/.&,]/.test(label)) {
            return `("${label.trim()}")`;
          }
          return match;
        });
      }

      return l;
    })
    .join("\n");

  return cleaned;
}

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart) return;

    const renderChart = async () => {
      try {
        const cleaned = cleanChart(chart);
        renderCounter++;
        const id = `mermaid-${renderCounter}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, cleaned);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(true);
        setSvg("");
      }
    };

    renderChart();
  }, [chart]);

  // Fallback: render as a nice formatted text view
  if (error) {
    const lines = chart
      .replace(/```mermaid\n?/g, "")
      .replace(/```\n?/g, "")
      .split("\n")
      .filter((l) => l.trim() && !l.trim().startsWith("%%") && !l.trim().startsWith("graph "));

    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-3">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/40">
          <span className="text-lg">🔗</span>
          <span className="text-sm font-medium text-gray-300">Architecture Flow</span>
        </div>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "end") return null;

          // Subgraph headers
          if (trimmed.startsWith("subgraph")) {
            const title = trimmed.replace("subgraph", "").replace(/"/g, "").trim();
            return (
              <div key={i} className="mt-4 mb-2 px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <span className="text-indigo-300 font-semibold text-sm">📦 {title}</span>
              </div>
            );
          }

          // Arrows/connections
          if (trimmed.includes("-->")) {
            const parts = trimmed.split(/-->/);
            const from = parts[0].replace(/.*\[["']?/g, "").replace(/["']?\].*|--.*$/g, "").trim();
            const to = parts[1]?.replace(/.*\[["']?/g, "").replace(/["']?\].*$/g, "").trim();
            const edgeLabel = trimmed.match(/--\s*["']?([^"'>-]+)["']?\s*-->/)?.[1]?.trim();

            return (
              <div key={i} className="flex items-center gap-2 px-4 py-2 text-sm">
                <span className="text-gray-200 font-medium">{from || parts[0].trim()}</span>
                <span className="text-indigo-400">→</span>
                {edgeLabel && <span className="text-gray-500 text-xs">({edgeLabel})</span>}
                {edgeLabel && <span className="text-indigo-400">→</span>}
                <span className="text-gray-200 font-medium">{to || parts[1]?.trim()}</span>
              </div>
            );
          }

          return (
            <div key={i} className="px-4 py-1 text-sm text-gray-400">{trimmed}</div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container bg-gray-900/30 rounded-xl border border-gray-800/50 p-6 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
