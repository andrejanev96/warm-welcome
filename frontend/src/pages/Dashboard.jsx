import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
        </h2>
        <p className="text-lg text-white/80">
          Let's create some warm, personalized onboarding emails.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Campaigns</p>
              <p className="text-4xl font-bold text-white mt-1">0</p>
            </div>
          </div>
        </div>

        <div className="glass-card hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Emails Sent</p>
              <p className="text-4xl font-bold text-white mt-1">0</p>
            </div>
          </div>
        </div>

        <div className="glass-card hover:scale-105 transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Open Rate</p>
              <p className="text-4xl font-bold text-white mt-1">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/templates" className="glass-card hover:scale-105 transition-transform group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">📧 Email Templates</h3>
              <p className="text-white/70">
                Create and manage personalized email templates
              </p>
            </div>
            <svg className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link to="/campaigns" className="glass-card hover:scale-105 transition-transform group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">🚀 Campaigns</h3>
              <p className="text-white/70">
                Set up automated email campaigns
              </p>
            </div>
            <svg className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Getting Started */}
      <div className="glass-card">
        <h3 className="text-2xl font-bold text-white mb-6">🎯 Getting Started</h3>
        <div className="space-y-4">
          <Link to="/integrations" className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-lg">Connect your Shopify store</h4>
              <p className="text-sm text-white/70 mt-1">
                Link your e-commerce store to start collecting customer data
              </p>
            </div>
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg">Create your first campaign</h4>
              <p className="text-sm text-white/70 mt-1">
                Set up behavioral triggers and email templates
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg">Let AI personalize your emails</h4>
              <p className="text-sm text-white/70 mt-1">
                Watch your engagement rates soar with warm, human-feeling emails
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/templates/new" className="glass-button flex-1 justify-center">
            Create Template
          </Link>
          <Link to="/campaigns/new" className="glass-button flex-1 justify-center">
            Start Campaign
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
