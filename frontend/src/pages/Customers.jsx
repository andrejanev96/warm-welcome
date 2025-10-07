import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.get('/shopify/stores');
      const activeStores = (response.data.data || []).filter(store => store.isActive);
      setStores(activeStores);

      // Auto-select first active store
      if (activeStores.length > 0) {
        setSelectedStore(activeStores[0].id);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = useCallback(async () => {
    if (!selectedStore) return;

    try {
      setLoadingCustomers(true);
      setError('');
      const response = await api.get(`/shopify/stores/${selectedStore}/customers`);
      setCustomers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    if (selectedStore) {
      fetchCustomers();
    }
  }, [selectedStore, fetchCustomers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      sent: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-100', label: 'Sent' },
      pending: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-100', label: 'Pending' },
      failed: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-100', label: 'Failed' },
    };
    const styles = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}>
        {styles.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  const hasActiveStore = stores.length > 0;

  if (!hasActiveStore) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👥 Customers
          </h1>
          <p className="text-lg text-white/80">
            View customers and email history from your connected stores
          </p>
        </div>

        <div className="glass-card text-center py-16">
          <div className="text-6xl mb-6">🔌</div>
          <h3 className="text-2xl font-bold text-white mb-4">Connect Your Store First</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            To view customers and their email history, connect your Shopify store first.
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
          View customers and email history from your connected stores
        </p>
      </div>

      {/* Store Selector */}
      {stores.length > 1 && (
        <div className="glass-card mb-6">
          <label htmlFor="store" className="block text-sm font-medium text-white/90 mb-2">
            Select Store
          </label>
          <select
            id="store"
            value={selectedStore || ''}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.shopDomain}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-6 glass-card bg-red-500/10 border-2 border-red-500/40">
          <p className="text-red-100">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loadingCustomers ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="glass-card text-center py-16">
          <div className="text-6xl mb-6">📭</div>
          <h3 className="text-2xl font-bold text-white mb-4">No Customers Found</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            This store doesn't have any customers yet, or they haven't been synced.
          </p>
        </div>
      ) : (
        /* Customers List */
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="glass-card hover:translate-y-[-2px] transition-all"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Customer Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    {customer.verified_email && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 border border-green-500/40 text-green-100">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="text-white/70 text-sm">{customer.email}</p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>${customer.total_spent || '0.00'} spent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>{customer.orders_count || 0} orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span>{customer.emailStats?.total || 0} emails sent</span>
                    </div>
                    {customer.emailStats && customer.emailStats.opened > 0 && (
                      <div className="flex items-center gap-2">
                        <span>👀</span>
                        <span>{customer.emailStats.opened} opened</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Joined {formatDate(customer.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                    className="glass-button"
                  >
                    {expandedCustomer === customer.id ? 'Hide History' : 'View History'}
                  </button>
                </div>
              </div>

              {/* Email History (Expanded) */}
              {expandedCustomer === customer.id && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-lg font-bold text-white mb-4">Email History</h4>

                  {customer.emailHistory && customer.emailHistory.length > 0 ? (
                    <div className="space-y-3">
                      {customer.emailHistory.map((email) => (
                        <div
                          key={email.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  to={`/campaigns/${email.campaignId}`}
                                  className="font-semibold text-white hover:text-white/80 transition-colors"
                                >
                                  {email.campaignName}
                                </Link>
                                {getStatusBadge(email.status)}
                              </div>
                              <p className="text-sm text-white/70">{email.subject}</p>
                            </div>
                            <div className="text-right text-xs text-white/60">
                              {email.sentAt && <div>Sent: {formatDateTime(email.sentAt)}</div>}
                              {email.openedAt && <div className="text-green-300">Opened: {formatDateTime(email.openedAt)}</div>}
                              {email.clickedAt && <div className="text-blue-300">Clicked: {formatDateTime(email.clickedAt)}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <p>No emails sent to this customer yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Customers;
