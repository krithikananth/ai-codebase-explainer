// ──────────────────────────────────────────────────────────────
// App.jsx — Root application component
// Sets up routing and auth context for the entire app
// ──────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Repos from "./pages/Repos";
import RepoView from "./pages/RepoView";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (auth check is inside DashboardLayout) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/repos" element={<Repos />} />
          <Route path="/repo/:id" element={<RepoView />} />
          <Route path="/chat" element={<Chat />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
