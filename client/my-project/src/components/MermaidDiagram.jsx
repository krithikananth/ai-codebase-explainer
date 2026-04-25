// ──────────────────────────────────────────────────────────────
// components/MermaidDiagram.jsx — Architecture diagram renderer
// Renders Mermaid diagrams as SVG, with a beautiful structured
// fallback view when the diagram can't be parsed
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  suppressErrors: true,
  logLevel: "fatal",
  securityLevel: "loose",
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
});

let renderCounter = 0;

/**
 * Clean mermaid chart for v11 compatibility
 */
function cleanChart(raw) {
  let text = raw
    .replace(/```mermaid\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  return text
    .split("\n")
    .filter((l) => !l.trim().startsWith("%%"))
    .map((l) => {
      let line = l.replace(/;\s*$/, "");
      // Quote unquoted labels in []
      line = line.replace(/\[([^\]"]+)\]/g, '["$1"]');
      // Quote unquoted labels in {}
      line = line.replace(/\{([^}"]+)\}/g, '{"$1"}');
      return line;
    })
    .join("\n");
}

/**
 * Parse mermaid code into structured components for fallback view
 */
function parseArchitecture(raw) {
  const text = raw
    .replace(/```mermaid\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const lines = text.split("\n").filter((l) => l.trim() && !l.trim().startsWith("%%"));

  const nodes = new Map();
  const edges = [];
  const subgraphs = [];
  let currentSubgraph = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "end" || trimmed.startsWith("graph ")) continue;

    // Subgraph
    if (trimmed.startsWith("subgraph")) {
      const title = trimmed.replace("subgraph", "").replace(/"/g, "").trim();
      currentSubgraph = { title, nodeIds: [] };
      subgraphs.push(currentSubgraph);
      continue;
    }
    if (trimmed === "end") {
      currentSubgraph = null;
      continue;
    }

    // Extract node definitions from labels
    const nodeMatches = trimmed.matchAll(/([A-Za-z_]\w*)\s*[\[{(]["']?([^"'\]})]+)["']?[\]})]/g);
    for (const m of nodeMatches) {
      const id = m[1];
      const label = m[2].trim();
      if (!nodes.has(id)) {
        nodes.set(id, label);
        if (currentSubgraph) currentSubgraph.nodeIds.push(id);
      }
    }

    // Extract edges: A --> B, A -->|label| B, A -- "label" --> B
    const edgePattern = /([A-Za-z_]\w*)\s*(?:--\s*["']([^"']+)["']\s*)?-->\s*(?:\|["']?([^|"']+)["']?\|\s*)?([A-Za-z_]\w*)/g;
    let edgeMatch;
    while ((edgeMatch = edgePattern.exec(trimmed)) !== null) {
      edges.push({
        from: edgeMatch[1],
        to: edgeMatch[4],
        label: edgeMatch[2] || edgeMatch[3] || "",
      });
    }
  }

  return { nodes, edges, subgraphs };
}

/**
 * Structured fallback view — beautiful card-based architecture
 */
function ArchitectureFallback({ chart }) {
  const { nodes, edges, subgraphs } = parseArchitecture(chart);

  // Group nodes by subgraph
  const subgraphNodeIds = new Set(subgraphs.flatMap((s) => s.nodeIds));
  const standaloneNodes = [...nodes.entries()].filter(([id]) => !subgraphNodeIds.has(id));

  // Color palette for nodes
  const colors = [
    { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-300" },
    { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300" },
    { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300" },
    { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-300" },
    { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-300" },
    { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-300" },
  ];

  const getColor = (i) => colors[i % colors.length];

  return (
    <div className="space-y-6">
      {/* Standalone nodes as cards */}
      {standaloneNodes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {standaloneNodes.map(([id, label], i) => {
            const c = getColor(i);
            return (
              <div
                key={id}
                className={`${c.bg} ${c.border} border rounded-xl p-4 text-center transition-all hover:scale-105`}
              >
                <span className={`text-sm font-medium ${c.text}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Subgraphs as grouped sections */}
      {subgraphs.map((sg, si) => {
        const c = getColor(si);
        return (
          <div key={si} className="bg-gray-900/40 rounded-xl border border-gray-700/40 p-5">
            <h4 className={`text-sm font-semibold ${c.text} mb-3 flex items-center gap-2`}>
              <span>📦</span> {sg.title}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sg.nodeIds.map((id) => {
                const label = nodes.get(id) || id;
                return (
                  <div
                    key={id}
                    className={`${c.bg} ${c.border} border rounded-lg px-3 py-2 text-center`}
                  >
                    <span className={`text-xs font-medium ${c.text}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Connections list */}
      {edges.length > 0 && (
        <div className="bg-gray-900/40 rounded-xl border border-gray-700/40 p-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span>🔗</span> Component Connections
          </h4>
          <div className="grid gap-2">
            {edges.map((edge, i) => {
              const fromLabel = nodes.get(edge.from) || edge.from;
              const toLabel = nodes.get(edge.to) || edge.to;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 text-sm"
                >
                  <span className="text-indigo-300 font-medium truncate max-w-[180px]">{fromLabel}</span>
                  <span className="text-gray-600 flex-shrink-0">→</span>
                  {edge.label && (
                    <>
                      <span className="text-gray-500 text-xs italic flex-shrink-0">{edge.label}</span>
                      <span className="text-gray-600 flex-shrink-0">→</span>
                    </>
                  )}
                  <span className="text-emerald-300 font-medium truncate max-w-[180px]">{toLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);

  // Hide Mermaid error elements globally
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      #d-mermaid { display: none !important; }
      .mermaid-error, [id^="d-mermaid"], .error-icon { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

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
        console.warn("Mermaid render failed, using fallback view");
        setError(true);
        setSvg("");
      }
    };

    // Small delay to prevent DOM conflicts
    const timer = setTimeout(renderChart, 100);
    return () => clearTimeout(timer);
  }, [chart]);

  if (error) {
    return <ArchitectureFallback chart={chart} />;
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <div className="animate-pulse">Rendering diagram...</div>
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
