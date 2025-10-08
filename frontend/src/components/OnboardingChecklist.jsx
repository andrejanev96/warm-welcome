import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const OnboardingChecklist = ({ variant = "card" }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get("/onboarding/progress");
        setProgress(response.data.data);
      } catch (error) {
        console.error("Failed to load onboarding progress", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70" />
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  // If dropdown variant, show compact view
  if (variant === "dropdown") {
    return (
      <div className="w-80">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Getting Started</h3>
            <span className="text-xs text-white/70">
              {progress.completedCount}/{progress.totalSteps}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {progress.steps.map((step, index) => (
            <Link
              key={step.id}
              to={step.link}
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  step.completed
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {step.completed ? "✓" : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  <h4
                    className={`text-sm font-medium ${step.completed ? "text-white/70 line-through" : "text-white"}`}
                  >
                    {step.title}
                  </h4>
                </div>
                {!step.completed && (
                  <p className="text-xs text-white/60 mt-1">{step.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        {progress.isComplete && (
          <div className="px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-t border-green-400/30">
            <p className="text-sm text-white text-center font-medium">🎉 All set up!</p>
          </div>
        )}
      </div>
    );
  }

  // Card variant for Dashboard
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">🎯 Getting Started</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">
            {progress.completedCount} of {progress.totalSteps} complete
          </span>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{progress.progress}%</span>
          </div>
        </div>
      </div>

      <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {progress.steps.map((step, index) => (
          <Link
            key={step.id}
            to={step.link}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
              step.completed
                ? "bg-white/5 border-white/10 opacity-60"
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg
                ${
                  step.completed
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                    : index === progress.completedCount
                      ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white animate-pulse"
                      : "bg-gradient-to-br from-blue-400 to-purple-500 text-white"
                }`}
            >
              {step.completed ? "✓" : index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.icon}</span>
                <h4
                  className={`font-semibold text-lg ${step.completed ? "text-white/70 line-through" : "text-white"}`}
                >
                  {step.title}
                </h4>
              </div>
              <p className="text-sm text-white/70 mt-1">{step.description}</p>
            </div>
            {!step.completed && (
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-5 h-5 text-white/50 flex-shrink-0 mt-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </Link>
        ))}
      </div>

      {progress.isComplete && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
          <p className="text-white text-center font-medium">
            🎉 Congratulations! You've completed all onboarding steps.
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;
