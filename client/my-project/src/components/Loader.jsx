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
 * Analysis progress loader with animated steps
 */
export function AnalysisLoader() {
  const steps = [
    { icon: "📥", text: "Cloning repository...", delay: "0s" },
    { icon: "📂", text: "Extracting file tree...", delay: "0.15s" },
    { icon: "🔍", text: "Detecting tech stack...", delay: "0.3s" },
    { icon: "🤖", text: "AI analyzing codebase...", delay: "0.45s" },
    { icon: "📐", text: "Generating diagrams...", delay: "0.6s" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 animate-fade-in">
      {/* Animated brain icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center animate-pulse-glow">
          <span className="text-4xl animate-float">🧠</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl glass-card animate-fade-in"
            style={{ animationDelay: step.delay }}
          >
            <span className="text-xl">{step.icon}</span>
            <span className="text-sm text-gray-300">{step.text}</span>
            <div className="ml-auto">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-400/50 border-t-indigo-400 animate-spin" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-sm text-center max-w-md">
        This may take 30-60 seconds for large repositories.
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