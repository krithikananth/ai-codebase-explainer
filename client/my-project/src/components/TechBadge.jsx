// ──────────────────────────────────────────────────────────────
// components/TechBadge.jsx — Technology stack badges
// Colorful badges for displaying detected technologies
// ──────────────────────────────────────────────────────────────

const colorMap = {
  "React": "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
  "Next.js": "from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30",
  "Vue.js": "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30",
  "Angular": "from-red-500/20 to-red-600/20 text-red-300 border-red-500/30",
  "Node.js": "from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30",
  "Express.js": "from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30",
  "MongoDB": "from-green-500/20 to-lime-500/20 text-green-300 border-green-500/30",
  "TypeScript": "from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30",
  "Python": "from-yellow-500/20 to-blue-500/20 text-yellow-300 border-yellow-500/30",
  "Django": "from-green-700/20 to-green-800/20 text-green-300 border-green-600/30",
  "Flask": "from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30",
  "Tailwind CSS": "from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30",
  "Docker": "from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30",
  "Rust": "from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30",
  "Go": "from-cyan-500/20 to-cyan-600/20 text-cyan-300 border-cyan-500/30",
  "Java": "from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30",
  "Vite": "from-purple-500/20 to-yellow-500/20 text-purple-300 border-purple-500/30",
  "Jest": "from-red-500/20 to-green-500/20 text-red-300 border-red-500/30",
  "GraphQL": "from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30",
  "Redis": "from-red-500/20 to-red-600/20 text-red-300 border-red-500/30",
};

const defaultColor = "from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30";

export default function TechBadge({ tech }) {
  const colorClass = colorMap[tech] || defaultColor;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        bg-gradient-to-r border backdrop-blur-sm transition-all duration-200
        hover:scale-105 cursor-default ${colorClass}`}
    >
      {tech}
    </span>
  );
}
