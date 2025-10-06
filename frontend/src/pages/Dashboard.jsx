import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="WarmWelcome.ai"
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-bold text-primary-600">WarmWelcome.ai</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h2>
          <p className="mt-2 text-gray-600">
            Let's create some warm, personalized onboarding emails.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Connect your Shopify store</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Link your e-commerce store to start collecting customer data
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create your first campaign</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Set up behavioral triggers and email templates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Let AI personalize your emails</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Watch your engagement rates soar with warm, human-feeling emails
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="btn btn-primary">
              Connect Shopify Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
