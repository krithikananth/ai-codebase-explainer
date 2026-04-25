// ──────────────────────────────────────────────────────────────
// layouts/DashboardLayout.jsx — Main app layout wrapper
// Provides sidebar + navbar + content area for all pages
// ──────────────────────────────────────────────────────────────
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/Loader";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <PageLoader message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar toggleSidebar={() => setIsOpen(true)} />
      <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />

      <main className="layout-center" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
