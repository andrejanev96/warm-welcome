import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import Alert from '../components/Alert';

const Integrations = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('shopify');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (activeTab === 'shopify') {
      fetchStores();
    }

    // Check if we're coming back from OAuth callback
    const shop = searchParams.get('shop');
    if (shop) {
      setSuccess(`Successfully connected ${shop}!`);
    }
  }, [searchParams, activeTab]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shopify/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(response.data.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load connected stores');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setConnectLoading(true);

    try {
      const token = localStorage.getItem('token');
      const cleanDomain = shopDomain.replace('.myshopify.com', '');

      const response = await axios.post(
        `${API_URL}/shopify/install`,
        { shop: cleanDomain },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data?.installUrl) {
        window.location.href = response.data.data.installUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect store');
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async (storeId, shopDomain) => {
    if (!confirm(`Are you sure you want to disconnect ${shopDomain}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/shopify/stores/${storeId}/disconnect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Store disconnected successfully');
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disconnect store');
    }
  };

  const handleReconnect = async (storeId, shopDomain) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/shopify/stores/${storeId}/reconnect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`${shopDomain} reconnected successfully`);
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reconnect store');
    }
  };

  const tabs = [
    { id: 'shopify', name: 'Shopify', icon: '🛍️' },
    { id: 'mailchimp', name: 'Mailchimp', icon: '📧', comingSoon: true },
    { id: 'stripe', name: 'Stripe', icon: '💳', comingSoon: true },
    { id: 'sendgrid', name: 'SendGrid', icon: '📬', comingSoon: true },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">
          🔌 Integrations
        </h2>
        <p className="text-lg text-white/80">
          Connect your tools to supercharge your email campaigns
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6">
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
            duration={5000}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            duration={5000}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card mb-6 p-1">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
              disabled={tab.comingSoon}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : tab.comingSoon
                  ? 'text-white/40 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.comingSoon && (
                <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shopify Tab Content */}
      {activeTab === 'shopify' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connect New Store */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Connect Shopify Store</h3>
                <p className="text-sm text-white/70">Enter your store domain to get started</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Store Domain
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="your-store-name"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    required
                  />
                  <span className="flex items-center text-white/70 text-sm whitespace-nowrap">
                    .myshopify.com
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-2">
                  Example: my-awesome-store
                </p>
              </div>

              <button
                type="submit"
                disabled={connectLoading}
                className="glass-button w-full justify-center"
              >
                {connectLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect Store'
                )}
              </button>
            </form>
          </div>

          {/* Connected Stores */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Connected Stores</h3>
                <p className="text-sm text-white/70">
                  {stores.length} store{stores.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : stores.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-white/70 text-sm">No stores connected yet</p>
                <p className="text-white/50 text-xs mt-1">Connect your first store to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          store.isActive
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{store.shopDomain}</p>
                          <p className="text-xs text-white/60">
                            Connected {new Date(store.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {store.isActive ? (
                          <>
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full">
                              Active
                            </span>
                            <button
                              onClick={() => handleDisconnect(store.id, store.shopDomain)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-300 rounded-full">
                              Inactive
                            </span>
                            <button
                              onClick={() => handleReconnect(store.id, store.shopDomain)}
                              className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-colors"
                            >
                              Reconnect
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="glass-card mt-6">
        <h3 className="text-xl font-bold text-white mb-4">ℹ️ About Shopify Integration</h3>
        <div className="space-y-3 text-white/80 text-sm">
          <p>
            Connecting your Shopify store allows WarmWelcome.ai to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access customer data to personalize emails</li>
            <li>Trigger emails based on customer actions (purchases, signups, etc.)</li>
            <li>Sync order information for relevant email campaigns</li>
          </ul>
          <p className="text-xs text-white/60 mt-4">
            We only request the minimum permissions needed: read customers and read/write orders.
            Your data is secure and never shared with third parties.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;
