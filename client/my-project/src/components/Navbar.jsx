// ──────────────────────────────────────────────────────────────
// components/Navbar.jsx — Top navigation bar
// Glassmorphism navbar with hamburger menu and branding
// ──────────────────────────────────────────────────────────────
import { useAuth } from "../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-700/50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            id="sidebar-toggle"
            className="p-2 rounded-xl hover:bg-gray-800/60 transition-all text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-500/20">
              CL
            </div>
            <h1 className="text-base sm:text-lg font-semibold hidden sm:block">
              <span className="gradient-text">CodeLens AI</span>
            </h1>
          </div>
        </div>

        {/* Right: tagline + avatar */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 hidden md:block">
            Understand any GitHub project in seconds ⚡
          </p>
          {user && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-gray-900">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
