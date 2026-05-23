// ──────────────────────────────────────────────────────────────
// components/ContributorChart.jsx — Donut chart of contributions
// Shows contributor distribution with Recharts PieChart
// ──────────────────────────────────────────────────────────────
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#818cf8", "#34d399", "#a78bfa", "#22d3ee", "#fbbf24",
  "#fb7185", "#60a5fa", "#f472b6", "#2dd4bf", "#facc15",
  "#c084fc", "#4ade80",
];

export default function ContributorChart({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">👥</span>
          <h3 className="text-lg font-semibold text-white">Contributor Distribution</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">👤</span>
          No contributor data available
        </div>
      </div>
    );
  }

  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  const data = contributors.slice(0, 10).map((c) => ({
    name: c.username,
    value: c.contributions,
    avatarUrl: c.avatarUrl,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="glass-card p-3 text-sm">
        <p className="font-semibold text-white">{d.name}</p>
        <p className="text-gray-400">
          {d.value} commits ({((d.value / totalContributions) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">👥</span>
        <h3 className="text-lg font-semibold text-white">Contributor Distribution</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-56 h-56 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{contributors.length}</span>
            <span className="text-xs text-gray-500">contributors</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {data.map((c, i) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex items-center gap-2 min-w-0">
                {c.avatarUrl && (
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-300 truncate">{c.name}</span>
              </div>
              <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                {c.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
