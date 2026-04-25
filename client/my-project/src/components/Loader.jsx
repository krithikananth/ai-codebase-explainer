// ──────────────────────────────────────────────────────────────
// components/Loader.jsx — Premium loading animations
// Multiple loader variants for different contexts
// ──────────────────────────────────────────────────────────────

/**
 * Full-page loader with animated text
 */
export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Inline spinner for buttons
 */
export function ButtonSpinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}

/**
 * Skeleton loading blocks
 */
export function Skeleton({ className = "", count = 1 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  );
}

/**
 * Analysis progress loader with step-by-step tick marks
 * Shows ✅ for completed, spinner for current, ○ for pending
 */
export function AnalysisLoader({ currentStep = 0 }) {
  const steps = [
    { icon: "📥", text: "Cloning repository...", doneText: "Repository cloned" },
    { icon: "📂", text: "Extracting file tree...", doneText: "File tree extracted" },
    { icon: "🔍", text: "Detecting tech stack...", doneText: "Tech stack detected" },
    { icon: "🤖", text: "AI analyzing codebase...", doneText: "AI analysis complete" },
    { icon: "📐", text: "Generating diagrams...", doneText: "Diagrams generated" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 animate-fade-in">
      {/* Animated brain icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center animate-pulse-glow">
          <span className="text-4xl animate-float">🧠</span>
        </div>
      </div>

      {/* Step indicators with tick marks */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl glass-card transition-all duration-500 animate-fade-in ${
                isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isCurrent
                    ? "border-indigo-500/30 bg-indigo-500/5"
                    : ""
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xl">{step.icon}</span>
              <span
                className={`text-sm flex-1 transition-colors duration-300 ${
                  isCompleted
                    ? "text-emerald-300"
                    : isCurrent
                      ? "text-white font-medium"
                      : "text-gray-500"
                }`}
              >
                {isCompleted ? step.doneText : step.text}
              </span>
              <div className="ml-auto flex-shrink-0">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-fade-in">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-400/50 border-t-indigo-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-gray-500 text-sm text-center max-w-md">
        This may take 20-40 seconds for large repositories.
        <br />
        The AI is analyzing every file and generating insights.
      </p>
    </div>
  );
}

// Default export for backward compatibility
export default function Loader() {
  return <PageLoader />;
}