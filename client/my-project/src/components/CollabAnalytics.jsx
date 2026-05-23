// ──────────────────────────────────────────────────────────────
// components/CollabAnalytics.jsx — Collaboration analytics dashboard
// Shows contributor stats, commit timeline, and collaboration score
// ──────────────────────────────────────────────────────────────
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import ContributorChart from "./ContributorChart";

/**
 * Group commits by date for the timeline chart
 */
const groupCommitsByDate = (commits) => {
  if (!commits?.length) return [];

  const groups = {};
  commits.forEach((c) => {
    const date = new Date(c.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    groups[date] = (groups[date] || 0) + 1;
  });

  return Object.entries(groups)
    .map(([date, count]) => ({ date, commits: count }))
    .reverse();
};

/**
 * Calculate collaboration score
 */
const getCollabScore = (contributors, commits) => {
  const contribCount = contributors?.length || 0;
  const commitCount = commits?.length || 0;

  if (contribCount >= 10 && commitCount >= 20) return { label: "Highly Collaborative", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: "🟢" };
  if (contribCount >= 3 && commitCount >= 10) return { label: "Collaborative", color: "text-amber-400", bg: "bg-amber-500/20", icon: "🟡" };
  if (contribCount >= 1) return { label: "Solo / Small Team", color: "text-blue-400", bg: "bg-blue-500/20", icon: "🔵" };
  return { label: "Unknown", color: "text-gray-400", bg: "bg-gray-500/20", icon: "⚪" };
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-2.5 text-xs">
      <p className="text-gray-400">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} commits</p>
    </div>
  );
};

export default function CollabAnalytics({ contributors, commitHistory, stats }) {
  const timelineData = groupCommitsByDate(commitHistory);
  const collabScore = getCollabScore(contributors, commitHistory);

  const topContributors = [...(contributors || [])]
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Collaboration Score */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🤝</span>
          <h3 className="text-lg font-semibold text-white">Collaboration Overview</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gray-800/50">
            <p className="text-2xl font-bold text-white">{contributors?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Contributors</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-800/50">
            <p className="text-2xl font-bold text-white">{commitHistory?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Recent Commits</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-800/50">
            <p className="text-2xl font-bold text-white">
              {stats?.totalFiles?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Files</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${collabScore.bg}`}>
            <p className={`text-lg font-bold ${collabScore.color}`}>
              {collabScore.icon} {collabScore.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">Collaboration Score</p>
          </div>
        </div>
      </div>

      {/* Contributor Chart */}
      <ContributorChart contributors={contributors} />

      {/* Commit Timeline */}
      {timelineData.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📈</span>
            <h3 className="text-lg font-semibold text-white">Commit Timeline</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#818cf8"
                  fill="url(#commitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Contributors Bar Chart */}
      {topContributors.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🏆</span>
            <h3 className="text-lg font-semibold text-white">Top Contributors</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topContributors} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis
                  dataKey="username"
                  type="category"
                  tick={{ fill: "#d1d5db", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                  width={75}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="contributions" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
