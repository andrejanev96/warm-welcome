import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../utils/api";
import CelebrationOverlay from "../components/animations/CelebrationOverlay.jsx";
import EnvelopeAnimation from "../components/animations/EnvelopeAnimation.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [overlayContent, setOverlayContent] = useState({ title: "", message: "" });
  const celebrationTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle", message: "" });
    setOverlayContent({
      title: "Sending reset link... ✉️",
      message: "Hang tight while we warm up your inbox.",
    });
    setShowCelebration(true);

    try {
      await authAPI.forgotPassword({ email });
      setStatus({
        type: "success",
        message: "If that email exists, we just sent a reset link.",
      });
      setEmail("");
      setOverlayContent({
        title: "Email sent! 💌",
        message: "Check your inbox for password reset instructions.",
      });
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to process your request right now.",
      });
      setShowCelebration(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="WarmWelcome.ai"
            className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,165,0,0.4))" }}
          />
          <h1
            className="text-5xl font-bold text-white mb-3"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
          >
            Forgot Password
          </h1>
          <p className="text-lg text-white/80">
            We&apos;ll send instructions to reset your account.
          </p>
        </div>

        <div className="glass-card">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Reset link</h2>

          {status.type !== "idle" && (
            <div
              className={`glass-alert border ${
                status.type === "success"
                  ? "border-green-400/40 text-green-100 bg-green-500/20"
                  : "border-red-500/40 text-red-100 bg-red-500/20"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="glass-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="glass-input"
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={submitting} className="glass-btn glass-btn-orange">
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <EnvelopeAnimation size="sm" />
                  <span className="font-medium">Sending magic...</span>
                </span>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="glass-link">
              Back to sign in
            </Link>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="floating-heart" aria-hidden="true" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <CelebrationOverlay
        show={showCelebration}
        title={overlayContent.title}
        message={overlayContent.message}
      />
    </div>
  );
};

export default ForgotPassword;
