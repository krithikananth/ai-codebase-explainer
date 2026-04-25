// ──────────────────────────────────────────────────────────────
// components/MermaidDiagram.jsx — Renders Mermaid diagrams
// Converts Mermaid syntax into beautiful SVG diagrams
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
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

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    const renderChart = async () => {
      try {
        renderCounter++;
        const id = `mermaid-${renderCounter}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(err.message);
        setSvg("");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
        <p className="text-amber-400 text-sm mb-3">⚠️ Could not render diagram</p>
        <pre className="text-gray-400 text-xs overflow-x-auto whitespace-pre-wrap">{chart}</pre>
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
