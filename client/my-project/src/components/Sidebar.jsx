// ──────────────────────────────────────────────────────────────
// components/Sidebar.jsx — Animated sidebar navigation
// Glassmorphism sidebar with navigation links and user info
// ──────────────────────────────────────────────────────────────
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/analyze", label: "Analyze Repo", icon: "🔍" },
  { path: "/repos", label: "My Repos", icon: "📁" },
  { path: "/chat", label: "Chat with Code", icon: "💬" },
];

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 glass
          transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <Link to="/dashboard" onClick={closeSidebar} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/30">
              CL
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">CodeLens AI</h1>
              <p className="text-xs text-gray-500">Codebase Explainer</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-gray-900">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); closeSidebar(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
              text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
