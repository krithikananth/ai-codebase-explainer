// ──────────────────────────────────────────────────────────────
// pages/Profile.jsx — User profile & account settings
// Edit profile, change password, view stats, delete account
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { ButtonSpinner } from "../components/Loader";

export default function Profile() {
  const { user, logout, login: setUser } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });

  // Stats
  const [repoCount, setRepoCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/repos");
        setRepoCount(res.data.length);
      } catch {
        // ignore
      }
    };
    fetchStats();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: "", type: "" });
    try {
      setProfileSaving(true);
      const res = await api.put("/auth/profile", { name, bio, githubUsername });
      // Update context
      const token = localStorage.getItem("token");
      if (token && res.data.user) {
        setUser(token, res.data.user);
      }
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || "Failed to update", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: "", type: "" });

    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match", type: "error" });
      return;
    }

    try {
      setPasswordSaving(true);
      await api.put("/auth/password", { currentPassword, newPassword });
      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || "Failed to change password", type: "error" });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) {
      return;
    }
    try {
      await api.delete("/auth/account");
      logout();
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            👤 <span className="gradient-text">Profile & Settings</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <form onSubmit={handleProfileSave} className="glass-card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📝 Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600
              flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/20">
              {initials}
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input
              id="profile-name"
              type="text"
              className="input-glass"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Bio</label>
            <textarea
              id="profile-bio"
              className="input-glass min-h-[80px] resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={250}
            />
            <p className="text-xs text-gray-600 mt-1">{bio.length}/250</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">GitHub Username</label>
            <input
              id="profile-github"
              type="text"
              className="input-glass"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="your-username"
            />
          </div>

          {profileMsg.text && (
            <div className={`p-3 rounded-lg text-sm animate-fade-in ${
              profileMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {profileMsg.text}
            </div>
          )}

          <button
            id="profile-save"
            type="submit"
            disabled={profileSaving}
            className="btn-gradient flex items-center gap-2"
          >
            {profileSaving ? <ButtonSpinner /> : "Save Changes"}
          </button>
        </form>

        {/* Account Stats */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            📊 Account Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-center">
              <p className="text-2xl font-bold text-white">{repoCount}</p>
              <p className="text-xs text-gray-400 mt-1">Repos Analyzed</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-center">
              <p className="text-sm font-medium text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Member Since</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-center">
              <p className="text-sm font-medium text-white">
                {user?.githubUsername || "Not linked"}
              </p>
              <p className="text-xs text-gray-400 mt-1">GitHub</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="glass-card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🔒 Change Password
          </h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <input
              id="current-password"
              type="password"
              className="input-glass"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">New Password</label>
              <input
                id="new-password"
                type="password"
                className="input-glass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="input-glass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {passwordMsg.text && (
            <div className={`p-3 rounded-lg text-sm animate-fade-in ${
              passwordMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <button
            id="password-save"
            type="submit"
            disabled={passwordSaving}
            className="btn-gradient flex items-center gap-2"
          >
            {passwordSaving ? <ButtonSpinner /> : "Change Password"}
          </button>
        </form>

        {/* Danger Zone */}
        <div className="glass-card p-6 sm:p-8 border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
            ⚠️ Danger Zone
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Once you delete your account, all your data (repositories, chats, and recommendations) will be permanently removed.
          </p>
          <button
            id="delete-account"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30
              text-red-400 font-medium text-sm hover:bg-red-500/20 transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
