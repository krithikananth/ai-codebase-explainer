// ──────────────────────────────────────────────────────────────
// components/StatsCards.jsx — Repository statistics display
// Large, well-spaced cards with icons, labels, and values
// ──────────────────────────────────────────────────────────────

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: "Total Files",
      value: stats.totalFiles || 0,
      icon: "📄",
      gradient: "from-blue-500/15 to-cyan-500/15",
      border: "border-blue-500/25",
      glow: "shadow-blue-500/5",
    },
    {
      label: "Folders",
      value: stats.totalFolders || 0,
      icon: "📁",
      gradient: "from-purple-500/15 to-pink-500/15",
      border: "border-purple-500/25",
      glow: "shadow-purple-500/5",
    },
    {
      label: "Lines of Code",
      value: stats.linesOfCode?.toLocaleString() || 0,
      icon: "💻",
      gradient: "from-emerald-500/15 to-green-500/15",
      border: "border-emerald-500/25",
      glow: "shadow-emerald-500/5",
    },
    {
      label: "Complexity",
      value: (stats.complexity || "unknown").charAt(0).toUpperCase() + (stats.complexity || "unknown").slice(1),
      icon: stats.complexity === "high" ? "🔴" : stats.complexity === "medium" ? "🟡" : "🟢",
      gradient: stats.complexity === "high"
        ? "from-red-500/15 to-orange-500/15"
        : stats.complexity === "medium"
          ? "from-yellow-500/15 to-amber-500/15"
          : "from-green-500/15 to-emerald-500/15",
      border: stats.complexity === "high"
        ? "border-red-500/25"
        : stats.complexity === "medium"
          ? "border-yellow-500/25"
          : "border-green-500/25",
      glow: stats.complexity === "high"
        ? "shadow-red-500/5"
        : stats.complexity === "medium"
          ? "shadow-yellow-500/5"
          : "shadow-green-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 bg-gradient-to-br shadow-lg
            ${card.gradient} ${card.border} ${card.glow}
            animate-fade-in transition-all duration-300 hover:scale-[1.02]`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {card.label}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
