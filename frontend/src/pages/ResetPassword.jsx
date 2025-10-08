import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import CelebrationOverlay from '../components/animations/CelebrationOverlay.jsx';
import EnvelopeAnimation from '../components/animations/EnvelopeAnimation.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [overlayContent, setOverlayContent] = useState({ title: '', message: '' });
  const celebrationTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });

    if (submitting) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setOverlayContent({
      title: 'Updating password... 🔒',
      message: 'Securing your account in a blink.',
    });
    setShowCelebration(true);

    try {
      await authAPI.resetPassword({ token, password: formData.password });
      setStatus({ type: 'success', message: 'Password updated! Redirecting to sign in...' });
      setOverlayContent({
        title: 'All set! 🎉',
        message: 'Redirecting you to sign in with your new password.',
      });
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        navigate('/login');
      }, 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to reset password. Please try again.',
      });
      setShowCelebration(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="WarmWelcome.ai"
            className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,165,0,0.4))' }}
          />
          <h1
            className="text-5xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 30px rgba(255,255,255,0.3)' }}
          >
            Reset Password
          </h1>
          <p className="text-lg text-white/80">
            Choose a new password and get back to sending warmer welcomes.
          </p>
        </div>

        <div className="glass-card">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Set new password</h2>

          {status.type !== 'idle' && (
            <div
              className={`glass-alert border ${
                status.type === 'success'
                  ? 'border-green-400/40 text-green-100 bg-green-500/20'
                  : 'border-red-500/40 text-red-100 bg-red-500/20'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="glass-label">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="glass-input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="glass-label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="glass-btn glass-btn-orange"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <EnvelopeAnimation size="sm" />
                  <span className="font-medium">Locking it in...</span>
                </span>
              ) : 'Update password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="glass-link">
              Back to sign in
            </Link>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
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

export default ResetPassword;
