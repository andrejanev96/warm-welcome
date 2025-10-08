import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CelebrationOverlay from './animations/CelebrationOverlay.jsx';
import EnvelopeAnimation from './animations/EnvelopeAnimation.jsx';
import OnboardingChecklist from './OnboardingChecklist';
import api from '../utils/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(null);
  const [showOnboardingDropdown, setShowOnboardingDropdown] = useState(false);
  const logoutTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  // Fetch onboarding progress
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      try {
        const response = await api.get('/onboarding/progress');
        setOnboardingProgress(response.data.data);
      } catch (error) {
        console.error('Failed to load onboarding progress', error);
      }
    };

    fetchOnboardingProgress();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOnboardingDropdown(false);
      }
    };

    if (showOnboardingDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOnboardingDropdown]);

  const handleLogout = () => {
    if (showLogoutAnimation) {
      return;
    }

    setShowLogoutAnimation(true);

    logoutTimeoutRef.current = setTimeout(() => {
      logout();
      navigate('/login');
    }, 1100);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="WarmWelcome.ai"
                  className="w-10 h-10"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.3))'
                  }}
                />
                <h1 className="text-2xl font-bold text-white">WarmWelcome.ai</h1>
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/campaigns"
                  className={`text-sm font-medium transition-all ${
                    isActive('/campaigns')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Campaigns
                </Link>
                <Link
                  to="/customers"
                  className={`text-sm font-medium transition-all ${
                    isActive('/customers')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Customers
                </Link>
                <Link
                  to="/brand-voice"
                  className={`text-sm font-medium transition-all ${
                    isActive('/brand-voice')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Brand Voice
                </Link>
                <Link
                  to="/blueprints"
                  className={`text-sm font-medium transition-all ${
                    isActive('/blueprints')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Blueprints
                </Link>
                <Link
                  to="/integrations"
                  className={`text-sm font-medium transition-all ${
                    isActive('/integrations')
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Integrations
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Onboarding notification - only show if not complete */}
              {onboardingProgress && !onboardingProgress.isComplete && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowOnboardingDropdown(!showOnboardingDropdown)}
                    className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Getting Started Checklist"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {onboardingProgress.totalSteps - onboardingProgress.completedCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {onboardingProgress.totalSteps - onboardingProgress.completedCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showOnboardingDropdown && (
                    <div className="absolute right-0 mt-2 bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                      <OnboardingChecklist variant="dropdown" />
                    </div>
                  )}
                </div>
              )}

              <span className="text-sm text-white/80">
                {user?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="glass-button text-sm"
                disabled={showLogoutAnimation}
              >
                {showLogoutAnimation ? (
                  <span className="flex items-center gap-2">
                    <EnvelopeAnimation size="sm" />
                    <span>Logging out...</span>
                  </span>
                ) : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>

      <CelebrationOverlay show={showLogoutAnimation} variant="logout" />
    </div>
  );
};

export default Layout;
