// ──────────────────────────────────────────────────────────────
// pages/Register.jsx — Registration page with premium dark UI
// Matches Login page aesthetic with name field
// ──────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ButtonSpinner } from "../components/Loader";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-2xl font-bold mb-4 shadow-xl shadow-emerald-500/30 animate-float">
            CL
          </div>
          <h1 className="text-3xl font-bold gradient-text">Join CodeLens AI</h1>
          <p className="text-gray-500 mt-2">Create your account and start exploring</p>
        </div>

        {/* Register card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-semibold text-white">Create account</h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Full name</label>
            <input
              id="register-name"
              type="text"
              className="input-glass"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email address</label>
            <input
              id="register-email"
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
              id="register-password"
              type="password"
              className="input-glass"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <ButtonSpinner /> : "Create Account"}
          </button>

          <p className="text-gray-500 text-sm text-center">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
