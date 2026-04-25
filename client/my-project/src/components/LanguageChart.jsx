// ──────────────────────────────────────────────────────────────
// components/LanguageChart.jsx — Language distribution chart
// Beautiful horizontal bars with proportional widths,
// percentage labels, and a summary donut-style header
// ──────────────────────────────────────────────────────────────

const langColors = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Java: "#f89820",
  Go: "#00add8",
  Rust: "#dea584",
  Ruby: "#cc342d",
  PHP: "#777bb4",
  "C++": "#00599c",
  C: "#a8b9cc",
  "C#": "#239120",
  Swift: "#fa7343",
  Kotlin: "#7f52ff",
  Scala: "#dc322f",
  Vue: "#42b883",
  Svelte: "#ff3e00",
  HTML: "#e34c26",
  CSS: "#1572b6",
  SCSS: "#cf649a",
  SQL: "#e38c00",
  Markdown: "#083fa1",
  JSON: "#5b5b5b",
  YAML: "#cb171e",
  Shell: "#89e051",
};

export default function LanguageChart({ languages }) {
  if (!languages || Object.keys(languages).length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No language data available</p>
      </div>
    );
  }

  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Color bar summary at top */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-800">
        {sorted.map(([lang, count]) => {
          const pct = (count / total) * 100;
          const color = langColors[lang] || "#6366f1";
          return (
            <div
              key={lang}
              title={`${lang}: ${pct.toFixed(1)}%`}
              style={{ width: `${pct}%`, backgroundColor: color }}
              className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>

      {/* Individual language rows */}
      <div className="grid gap-5">
        {sorted.map(([lang, count], i) => {
          const percentage = ((count / total) * 100).toFixed(1);
          const color = langColors[lang] || "#6366f1";

          return (
            <div
              key={lang}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-200">{lang}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {count} {count === 1 ? "file" : "files"}
                  </span>
                  <span className="text-sm font-semibold text-white w-14 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total summary */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 text-sm text-gray-400">
        <span>{sorted.length} language{sorted.length !== 1 ? "s" : ""} detected</span>
        <span>{total} total files</span>
      </div>
    </div>
  );
}
