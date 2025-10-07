import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <span className="text-sm text-white/80">
                {user?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="glass-button text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
