import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.get('/shopify/stores');
      setStores(response.data.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveStore = stores.some(store => store.isActive);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  if (!hasActiveStore) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👥 Customers
          </h1>
          <p className="text-lg text-white/80">
            AI-powered insights and suggested outreach opportunities
          </p>
        </div>

        <div className="glass-card text-center py-16">
          <div className="text-6xl mb-6">🔌</div>
          <h3 className="text-2xl font-bold text-white mb-4">Connect Your Store First</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            To analyze customers and suggest outreach opportunities, connect your Shopify store first.
          </p>
          <Link to="/integrations" className="glass-button inline-flex">
            Connect Shopify Store
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          👥 Customers
        </h1>
        <p className="text-lg text-white/80">
          AI-powered insights and suggested outreach opportunities
        </p>
      </div>

      {/* AI Suggestions */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Suggestions</h2>
            <p className="text-sm text-white/70">Opportunities to connect with your customers</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Example suggestions - these would be AI-generated */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <h3 className="font-semibold text-white text-lg">VIP Milestone Opportunity</h3>
                </div>
                <p className="text-white/80 mb-3">
                  <strong>Sarah Martinez</strong> just reached $1,000 in lifetime purchases.
                  Perfect time to send a personalized thank you with a special offer.
                </p>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span>💰 $1,047 lifetime value</span>
                  <span>•</span>
                  <span>📦 8 orders</span>
                  <span>•</span>
                  <span>⭐ Last order: 3 days ago</span>
                </div>
              </div>
              <button className="glass-button whitespace-nowrap">
                Generate Email
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💤</span>
                  <h3 className="font-semibold text-white text-lg">Re-engagement Opportunity</h3>
                </div>
                <p className="text-white/80 mb-3">
                  <strong>12 customers</strong> haven't purchased in 60+ days but were previously active.
                  Win them back with personalized recommendations.
                </p>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span>💰 $8,400 potential revenue</span>
                  <span>•</span>
                  <span>📊 Previously ordered 2-5x</span>
                </div>
              </div>
              <button className="glass-button whitespace-nowrap">
                Create Campaign
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🛒</span>
                  <h3 className="font-semibold text-white text-lg">Upsell Opportunity</h3>
                </div>
                <p className="text-white/80 mb-3">
                  <strong>Mike Chen</strong> bought your starter kit 30 days ago.
                  Based on his purchase history, he's ready for the premium upgrade.
                </p>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span>💰 $89 average order</span>
                  <span>•</span>
                  <span>📦 3 orders</span>
                  <span>•</span>
                  <span>🎯 High engagement</span>
                </div>
              </div>
              <button className="glass-button whitespace-nowrap">
                Generate Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="glass-card">
        <h2 className="text-2xl font-bold text-white mb-6">Customer Segments</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-white mb-1">24</div>
            <div className="text-sm font-medium text-white/90">VIP Customers</div>
            <div className="text-xs text-white/60 mt-1">$500+ lifetime value</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-white mb-1">89</div>
            <div className="text-sm font-medium text-white/90">Active Customers</div>
            <div className="text-xs text-white/60 mt-1">Purchased in last 30 days</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="text-3xl mb-2">💡</div>
            <div className="text-3xl font-bold text-white mb-1">43</div>
            <div className="text-sm font-medium text-white/90">At-Risk</div>
            <div className="text-xs text-white/60 mt-1">No purchase in 60+ days</div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="glass-card mt-6 border-2 border-orange-400/30">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🚀</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">More AI Features Coming Soon</h3>
            <p className="text-white/70 text-sm">
              We're building advanced customer analytics, behavior prediction,
              and personalized recommendation engines. This is just the beginning of
              your AI co-pilot for customer relationships.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
