// ──────────────────────────────────────────────────────────────
// pages/Chat.jsx — Chat with Codebase page
// AI-powered Q&A interface about analyzed repositories
// ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { ButtonSpinner } from "../components/Loader";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const initialRepoId = searchParams.get("repo") || "";

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(initialRepoId);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch user's repos for the dropdown
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get("/repos");
        const completed = res.data.filter((r) => r.status === "completed");
        setRepos(completed);
        if (!selectedRepo && completed.length > 0) {
          setSelectedRepo(completed[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      }
    };
    fetchRepos();
  }, []);

  // Load chat history when repo changes
  useEffect(() => {
    if (!selectedRepo) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/chat/${selectedRepo}`);
        setMessages(res.data.messages || []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [selectedRepo]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!question.trim() || !selectedRepo || loading) return;

    const userMsg = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post("/chat/message", {
        repoId: selectedRepo,
        question: userMsg,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${err.response?.data?.message || "Failed to get response"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!selectedRepo) return;
    try {
      await api.delete(`/chat/${selectedRepo}`);
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const selectedRepoData = repos.find((r) => r._id === selectedRepo);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-130px)] animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              💬 <span className="gradient-text">Chat with Codebase</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Ask anything about the analyzed repository
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Repo selector */}
            <select
              id="repo-selector"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="input-glass text-sm max-w-xs"
            >
              <option value="">Select a repository...</option>
              {repos.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.owner ? `${r.owner}/` : ""}{r.name}
                </option>
              ))}
            </select>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-xl glass-card hover:border-red-500/30 transition-all text-sm"
                title="Clear chat"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Selected repo info */}
        {selectedRepoData && (
          <div className="glass-card p-3 mb-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
            <span className="text-lg">📦</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {selectedRepoData.owner ? `${selectedRepoData.owner}/` : ""}{selectedRepoData.name}
              </p>
              {selectedRepoData.techStack && (
                <p className="text-xs text-gray-500 truncate">
                  {selectedRepoData.techStack.slice(0, 4).join(" • ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {!selectedRepo ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4">💬</span>
              <h3 className="text-lg font-semibold text-gray-300">Select a repository</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Choose an analyzed repository from the dropdown above to start chatting
              </p>
            </div>
          ) : loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 animate-pulse">Loading chat history...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4 animate-float">🤖</span>
              <h3 className="text-lg font-semibold text-gray-300">Start a conversation</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Ask questions about the codebase — architecture, APIs, design patterns, or anything else!
              </p>

              {/* Quick questions */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  "What does this project do?",
                  "Explain the architecture",
                  "What tech stack is used?",
                  "How are APIs structured?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                    }}
                    className="text-xs px-3 py-2 rounded-xl glass-card hover:border-indigo-500/40 text-gray-400 hover:text-indigo-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md"
                      : "glass-card text-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50">
                      <span className="text-sm">🤖</span>
                      <span className="text-xs font-medium text-indigo-400">CodeLens AI</span>
                    </div>
                  )}
                  <div className={msg.role === "assistant" ? "markdown-content text-sm" : "text-sm"}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🤖</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            id="chat-input"
            type="text"
            className="input-glass flex-1"
            placeholder={selectedRepo ? "Ask about the codebase..." : "Select a repo first..."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!selectedRepo || loading}
          />
          <button
            id="chat-send"
            type="submit"
            disabled={!question.trim() || !selectedRepo || loading}
            className="btn-gradient px-6 flex items-center gap-2"
          >
            {loading ? <ButtonSpinner /> : "Send →"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}