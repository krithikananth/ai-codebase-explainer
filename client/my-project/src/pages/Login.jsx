// ──────────────────────────────────────────────────────────────
// pages/Login.jsx — Login page with premium dark UI
// Glassmorphism card with gradient accents and animations
// ──────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ButtonSpinner } from "../components/Loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold mb-4 shadow-xl shadow-indigo-500/30 animate-float">
            CL
          </div>
          <h1 className="text-3xl font-bold gradient-text">CodeLens AI</h1>
          <p className="text-gray-500 mt-2">Sign in to explore codebases with AI</p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email address</label>
            <input
              id="login-email"
              type="email"
              className="input-glass"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-glass"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <ButtonSpinner /> : "Sign In"}
          </button>

          <p className="text-gray-500 text-sm text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
