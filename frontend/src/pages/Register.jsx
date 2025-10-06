import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = Boolean(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8
  );

  const handleChange = (e) => {
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please complete all fields with a password of at least 8 characters.');
      return;
    }

    setLoading(true);
    // Don't clear existing error - let it persist

    const result = await register(formData);

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <img
            src="/logo.png"
            alt="WarmWelcome.ai"
            className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,165,0,0.4))' }}
          />
          <h1 className="text-5xl font-bold text-white mb-3" style={{ textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
            WarmWelcome.ai
          </h1>
          <p className="text-lg text-white/80">
            Transform your onboarding emails with AI
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Create your account
          </h2>

          {/* Error Alert */}
          {error && (
            <div className="glass-alert animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="glass-label">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="glass-input"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="glass-label">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="glass-input"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="glass-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="glass-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="glass-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="glass-input"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-white/60">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`glass-btn ${isFormValid ? 'glass-btn-orange' : ''} mt-6`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/80">
              Already have an account?{' '}
              <Link to="/login" className="glass-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
};

export default Register;
